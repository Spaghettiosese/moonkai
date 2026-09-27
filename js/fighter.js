// ============================================================
//  MOONKAI — fighter state machine (fixed 60 Hz steps)
// ============================================================
const GRAV = 2600, JUMP_V = 1000, SJUMP_V = 1360, HP_MULT = 2.3, METER_MAX = 500;
const BUF = 8; // input buffer frames

class Fighter {
  constructor(def, side, idx, opts = {}) {
    this.def = def; this.id = def.id; this.side = side; this.idx = idx;
    this.alt = opts.alt || 0; this.ctrl = opts.ctrl || 'cpu'; this.level = opts.level || 2;
    this.maxHp = Math.round(def.hp * HP_MULT * (opts.hpMult || 1) * Math.sqrt(def.bal || 1));
    this.hp = this.maxHp; this.red = this.maxHp; this.shownHp = this.maxHp;
    this.normals = def.normals;
    this.reset(0, 1);
  }
  reset(x, facing) {
    Object.assign(this, {
      x, y: 0, vx: 0, vy: 0, facing, state: 'stand', st: 0, move: null, mf: 0, anim: rand(0, 5),
      hitstun: 0, blockstun: 0, launched: false, kdHard: false, wbPending: false, gbPending: false, wbUsed: 0, gbUsed: 0,
      downT: 0, invul: 0, pinvul: 0, flash: 0, comboHits: 0, comboDmg: 0, jumps: 0, airDash: 0, usedAir: new Set(),
      status: {}, buf: [], connected: null, hitMap: new Map(), guard: 0, guardT: 0, form: this.form && this.def.form && !this.def.form.timed && this.keepForm ? this.form : false,
      formT: 0, spark: 0, sayText: null, sayT: 0, tauntT: 0, lastMove: null, lastCtl: {}, grabbedBy: null, grabT: 0, dashT: 0, sdash: null, charge: false,
      history: [], pose: 'idle', ai: {}, onGround: true, revived: this.revived && this.keepForm ? this.revived : false, counterHit: false, whiffRec: 0, clones: 0,
    });
    this.hp = Math.max(this.hp, 1);
  }
  // ---------- derived ----------
  get transformed() { return this.form; }
  get meter() { return this.side.meter; }
  set meter(v) { this.side.meter = clamp(v, 0, METER_MAX); }
  get opp() { return this.side.enemy.point; }
  get scale() { return (this.def.scale || 1) * (this.form && this.def.form.scale ? this.def.form.scale : 1); }
  get w() { return 46 * this.scale * (this.def.wide || 1); }
  get h() { return (this.state === 'crouch' || (this.move && this.move.crouch) || this.state === 'cblock' ? 72 : 110) * this.scale; }
  get airborne() { return this.y < -0.5; }
  get lying() { return this.state === 'down' || this.state === 'ko'; }
  rect() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  center() { return [this.x, this.y - this.h / 2]; }
  hand() { return [this.x + this.facing * 42 * this.scale, this.y - 80 * this.scale]; }
  mouth() { return [this.x + this.facing * 25 * this.scale, this.y - 86 * this.scale]; }
  normalsTable() { return this.form && this.def.form.normals ? this.def.form.normals : this.def.normals; }
  special(slot) { if (this.def.specialFor) { const sm = this.def.specialFor(this, slot); if (sm !== undefined) return sm; } const fs = this.form && this.def.form.moves; return (fs && fs[slot]) || this.def.moves[slot] || null; }
  spdMult() { let m = this.form && this.def.form.speed || 1; if (this.status.slow) m *= 0.6; if (this.status.haste) m *= 1.3; if (this.spark) m *= 1.08; return m; }
  dmgMult(t) { let m = this.form && this.def.form.dmg || 1; if (this.status.power) m *= 1.25; if (this.status.weaken) m *= 0.75; if (this.spark) m *= 1.1; if (this.def.passiveDmg) m *= this.def.passiveDmg(this, t); return m * Math.sqrt(this.def.bal || 1); }
  armorMult(a) { let m = this.form && this.def.form.armor || 1; if (this.status.fortify) m *= 0.75; if (this.def.passiveArmor) m *= this.def.passiveArmor(this, a); return m; }
  isActionable() { return ['stand', 'crouch', 'walk', 'air', 'cblock', 'block'].includes(this.state) && !this.blockstun; }
  say(text, frames = 150) { this.sayText = text; this.sayT = frames; }

  // ---------- form ----------
  enterForm(timed) {
    const F = this.def.form;
    this.form = true; this.formT = (timed || F.timed || 0) * FPS;
    F.onStart && F.onStart(this);
    const half = this.w / 2 + 10; this.x = clamp(this.x, half, Arena.stage.width - half);
    Game.popWorld(this.x, this.y - this.h - 30, F.name + '!', this.def.color, 34);
    Game.fx.burst(this.x, this.y - 80, 60, { color: ['#fff', this.def.color], size: 12, speed: 500, glow: true, life: 0.8 });
    Save.bump('transforms'); if (this.id === 'eric') Ach.unlock('moonkai');
    if (this.def.lines && this.def.lines.form) this.say(pick(this.def.lines.form));
  }
  // Fallen/corrupted rebirth: swap in a derived definition with the corrupt kit (see def.corruptForm)
  corrupt() {
    const base = this.baseDef || this.def, C = base.corruptForm, d = Object.create(base);
    Object.assign(d, { form: C, portraitId: base.id + '_fallen', face: Object.assign({}, base.face, C.face), draw: C.draw, color: C.color || base.color, fx: C.ult.ult.fx,
      lines: Object.assign({}, base.lines, C.lines), passive: C.passive || base.passive, passiveTick: C.passiveTick, passiveDmg: C.passiveDmg, deity: false, ultLocked: null });
    if (C.normals) d.normals = C.normals;
    this.baseDef = base; this.def = d; this.corrupted = true; this.form = true; this.formT = 0;
    C.onStart && C.onStart(this);
    Game.fx.burst(this.x, this.y - 80, 80, { color: ['#ff1a3a', '#1a0008', '#fff'], size: 12, speed: 600, glow: true, life: 0.9 });
    Game.popWorld(this.x, this.y - this.h - 30, C.name + '!', C.color || '#ff1a3a', 34);
    if (d.lines.form) this.say(pick(d.lines.form), 150);
  }
  exitForm() {
    this.form = false; this.formT = 0;
    Game.fx.burst(this.x, this.y - 60, 40, { color: ['#fff', this.def.color], size: 8, speed: 300, glow: true, life: 0.7 });
    Game.popWorld(this.x, this.y - 150, 'FORM FADES', '#ccc');
  }

  // ---------- main step ----------
  step(ctl) {
    if (this.def.stateStep && this.def.stateStep(this, ctl)) return;
    this.anim += 1 / FPS; this.st++;
    this.lastCtl = ctl;
    if (this.flash > 0) this.flash--;
    if (this.invul > 0) this.invul--;
    if (this.pinvul > 0) this.pinvul--;
    if (this.sayT > 0) this.sayT--;
    if (this.spark > 0) { this.spark--; if (this.hp < this.red && this.state !== 'ko' && this.hp > 0) this.hp = Math.min(this.red, this.hp + 2); if (this.st % 3 === 0) Game.fx.add({ x: this.x + rand(-30, 30), y: this.y - rand(0, this.h), vx: 0, vy: -120, life: 0.4, size: 4, color: '#9cf', glow: true }); }
    this.shownHp = lerp(this.shownHp, this.hp, 0.06);
    for (const k in this.status) if (typeof this.status[k] === 'number' && k !== 'shield') { this.status[k] -= 1 / FPS; if (this.status[k] <= 0) delete this.status[k]; }
    if (this.status.shieldT === undefined && this.status.shield) delete this.status.shield;
    if (this.guardT > 0) this.guardT--; else this.guard = Math.max(0, this.guard - 0.4);
    // damage over time
    if ((this.status.burn || this.status.bleed || this.status.poison) && this.st % 30 === 0 && this.hp > 1) {
      const d = this.status.poison ? 14 : this.status.bleed ? 12 : 10;
      this.hp = Math.max(1, this.hp - d); Game.popWorld(this.x, this.y - this.h, String(d), '#ffa060', 14);
    }
    // history (for rewind-style moves)
    if (this.st % 6 === 0) { this.history.push({ x: this.x, y: this.y, hp: this.hp }); if (this.history.length > 30) this.history.shift(); }
    if (this.status.regen && this.state !== 'ko' && this.hp > 0 && this.st % 3 === 0) this.hp = Math.min(this.maxHp, this.hp + 1);
    if (this.form) this.formTick();
    if (this.def.passiveTick && this.state !== 'ko') this.def.passiveTick(this);
    // input buffer
    for (const b in ctl.press) if (ctl.press[b]) this.buf.push({ b, x: ctl.x, y: ctl.y, t: BUF });
    this.buf = this.buf.filter(e => --e.t > 0);

    switch (this.state) {
      case 'ko': this.physics(); this.pose = 'hurt'; return;
      case 'grabbed': this.pose = 'hurt_air'; if (ctl.press.H && this.grabT > 0 && this.grabT < 9) Combat.throwTech(this); this.grabT++; return;
      case 'hit': this.stepHit(ctl); break;
      case 'block': case 'cblock': if (--this.blockstun <= 0) { this.blockstun = 0; this.state = this.airborne ? 'air' : 'stand'; } if (ctl.press.S) this.reflect(); this.physics(); break;
      case 'down': this.vx *= 0.85; if (--this.downT <= 0) { this.state = 'stand'; this.invul = 14; } this.physics(); break;
      case 'roll': this.vx = this.rollDir * 520; if (--this.downT <= 0) { this.state = 'stand'; this.vx = 0; } this.physics(); break;
      case 'move': this.stepMove(ctl); break;
      case 'dash': this.stepDash(ctl); break;
      case 'sdash': this.stepSuperDash(ctl); break;
      case 'charge': if (!ctl.hold.C || ctl.x || ctl.y) this.state = 'stand'; else { this.meter += 1.3; if (this.st % 4 === 0) Game.fx.add({ x: this.x + rand(-40, 40), y: this.y, vx: 0, vy: -300, life: 0.5, size: 5, color: this.def.color, glow: true }); if (this.st % 20 === 0) Sfx.tone(200 + (this.meter % 100) * 4, 0.1, 'sine', 0.04); } this.physics(); break;
      case 'taunt': if (--this.tauntT <= 0) { this.state = 'stand'; this.meter += 25; } this.physics(); break;
      case 'intro': case 'win': case 'benched': case 'assist': case 'tagout': this.physics(); break;
      default: this.stepNeutral(ctl); break;
    }
    if (ctl.press.SPARK) this.trySpark();
    this.updatePose(ctl);
  }

  formTick() {
    const F = this.def.form;
    if (this.formT > 0) { if (--this.formT <= 0) this.exitForm(); }
    if (F.regen && this.state !== 'ko' && this.hp > 0 && this.st % 6 === 0) this.hp = Math.min(this.maxHp, this.hp + F.regen);
    if (F.tick) F.tick(this);
    if (this.st % 5 === 0) Game.fx.add({ x: this.x + rand(-this.w / 2, this.w / 2), y: this.y - rand(0, this.h), vx: rand(-20, 20), vy: rand(-140, -60), life: rand(0.3, 0.6), size: rand(3, 7), color: F.auraColor || this.def.color, glow: true, grow: -6 });
  }

  // ---------- neutral ----------
  stepNeutral(ctl) {
    const air = this.airborne, fwd = ctl.x === this.facing, back = ctl.x === -this.facing, down = ctl.y > 0;
    if (!this.tryActions(ctl)) {
      if (!air) {
        this.jumps = 0; this.airDash = 0; this.usedAir.clear();
        if (down) { this.state = back ? 'cblock' : 'crouch'; this.vx *= 0.7; }
        else {
          this.state = ctl.x ? 'walk' : 'stand';
          const fr = Arena.stage.friction;
          const target = ctl.x * (back ? 0.72 : 1) * (this.def.walk || 270) * this.spdMult();
          this.vx = lerp(this.vx, target, fr < 1 ? 0.06 : 0.35);
          if (ctl.press.UP) this.jump(ctl, this.recentDown());
          else if (ctl.press.C || (ctl.hold.C && !ctl.x)) { this.state = 'charge'; this.vx = 0; }
        }
      } else {
        this.state = 'air';
        if (ctl.press.UP && this.jumps < (this.def.jumps || 2)) this.jump(ctl, false);
        if ((this.def.fly || (this.form && this.def.form.flight)) && ctl.hold.UP) this.vy = Math.max(this.vy - 90, -420);
        this.vx = lerp(this.vx, this.vx + ctl.x * 30, 0.2);
      }
    }
    if (!this.move) this.faceOpp();
    this.physics();
  }
  recentDown() { return this.buf.some(e => e.b === 'DOWN'); }
  jump(ctl, sup) {
    const fwd = ctl.x * this.facing;
    this.vy = -(sup ? SJUMP_V : JUMP_V) * (this.form && this.def.form.jump || 1);
    this.vx = ctl.x * (sup ? 340 : 280) * this.spdMult();
    this.jumps++; this.state = 'air'; this.y -= 1;
    Sfx.jump(); if (this.jumps > 1) Game.fx.burst(this.x, this.y, 10, { color: [this.def.color, '#fff'], size: 6, speed: 200, angle: Math.PI / 2, spread: 1, glow: true, life: 0.3 });
    void fwd;
  }
  faceOpp() { const o = this.opp; if (o && o !== this) this.facing = o.x >= this.x ? 1 : -1; }

  // actions available from neutral (and cancels). Returns true if something started.
  tryActions(ctl, cancelFrom) {
    const B = this.buf, has = b => B.find(e => e.b === b), take = e => { this.buf = this.buf.filter(x => x !== e); return e; };
    const air = this.airborne;
    // ultimate & super
    let e = has('ULT') || (has('SUP') && (has('SUP').y > 0) ? has('SUP') : null);
    if (e) { const m = (this.form && this.def.form.ult) || this.def.ult; if (m && this.meter >= 300 && (!m.air || true) && !(this.def.ultLocked && this.def.ultLocked(this)) && (!air || m.air)) { take(e); return this.startMove(m, cancelFrom); } }
    e = has('SUP');
    if (e && e.y <= 0) { const m = (air && this.def.airSuper) || (this.form && this.def.form.super) || this.def.super; if (m && this.meter >= 100 && (!air || m.air)) { take(e); return this.startMove(m, cancelFrom); } }
    // vanish
    e = has('VAN');
    if (e && this.meter >= 100) { take(e); return this.vanish(); }
    // specials
    e = has('S');
    if (e) {
      const rel = e.x * this.facing;
      const slot = air ? 'jS' : e.y > 0 ? '2S' : rel > 0 ? '6S' : rel < 0 ? '4S' : '5S';
      let m = this.special(slot) || (air ? null : this.special('5S'));
      if (m && air && !m.air) m = null;
      if (m && !this.cdOK(m)) m = null;
      if (m) { take(e); return this.startMove(m, cancelFrom); }
    }
    // normals
    for (const b of ['H', 'M', 'L']) {
      e = has(b); if (!e) continue;
      const m = this.pickNormal(b, e, cancelFrom);
      if (m) { take(e); return this.startMove(m, cancelFrom); }
    }
    if (cancelFrom) return false;
    // super dash & dash
    e = has('SD'); if (e) { take(e); return this.superDash(); }
    e = has('DASH'); if (e) { take(e); return this.dash(e.x * this.facing < 0 ? -1 : 1); }
    if (ctl.press.FWD2) return this.dash(1);
    if (ctl.press.BACK2) return this.dash(-1);
    e = has('FORM'); if (e) { take(e); return Game.battle.tryTransform(this); }
    e = has('TAUNT'); if (e && !air) { take(e); this.state = 'taunt'; this.tauntT = 60; this.vx = 0; const L = this.def.lines; if (L && L.taunt) this.say(pick(L.taunt), 90); return true; }
    return false;
  }
  cdOK(m) { return !m.cd || !(this.cds && this.cds[m.name] > Game.battle.frame); }
  pickNormal(b, e, cur) {
    const N = this.normalsTable(), air = this.airborne;
    if (air) {
      let id = b === 'L' ? 'jL' : b === 'M' ? 'jM' : e.y > 0 ? 'j2H' : 'jH';
      if (b === 'L' && cur && AUTO_AIR.includes(cur.id)) id = AUTO_AIR[Math.min(AUTO_AIR.indexOf(cur.id) + 1, 2)];
      if (this.usedAir.has(id)) return null;
      return N[id];
    }
    if (b === 'L') {
      if (e.y > 0) return N['2L'];
      if (cur && AUTO_GROUND.includes(cur.id)) { const i = AUTO_GROUND.indexOf(cur.id); return N[AUTO_GROUND[Math.min(i + 1, 3)]]; }
      return N['5L'];
    }
    if (b === 'M') return e.y > 0 ? N['2M'] : N['5M'];
    if (e.y > 0) return N['2H'];
    const o = this.opp, rel = e.x * this.facing;
    if (rel !== 0 && o && !o.airborne && Math.abs(o.x - this.x) < 80 + o.w / 2 && ['stand', 'walk', 'crouch', 'cblock', 'block'].includes(o.state) && !o.blockstun) return N.throw;
    return N['5H'];
  }
  canCancel(cur, next) {
    if (!this.connected || !next) return false;
    if (next === cur && !(cur.id === '5L' && next.id === '5L')) return false;
    const auto = (AUTO_GROUND.includes(cur.id) && AUTO_GROUND.includes(next.id) && AUTO_GROUND.indexOf(next.id) === AUTO_GROUND.indexOf(cur.id) + 1) || (AUTO_AIR.includes(cur.id) && AUTO_AIR.includes(next.id) && AUTO_AIR.indexOf(next.id) > AUTO_AIR.indexOf(cur.id));
    if (cur.kind === 'normal') return auto || next.level > cur.level || (next.level === cur.level && cur.level === 0 && next.id !== cur.id);
    if (cur.kind === 'special') return next.level >= 4 || (cur.follow === next) || (cur.cancelSpecial && next.kind === 'special');
    if (cur.kind === 'super') return next.level === 5;
    return false;
  }

  // ---------- moves ----------
  startMove(m, cancelFrom) {
    if (!m) return false;
    if (cancelFrom && !this.canCancel(cancelFrom, m)) return false;
    if (m.cost) {
      if (this.meter < m.cost) return false;
      this.meter -= m.cost; Save.bump('bars', m.cost / 100);
      if (m.flash) Game.battle.superFreeze(this, m);
    }
    if (m.cd) { this.cds = this.cds || {}; this.cds[m.name] = Game.battle.frame + m.cd * FPS; }
    if (m.air && this.airborne) this.usedAir.add(m.id);
    if (m.throwMove && this.airborne) return false;
    if (m.airOnly && !this.airborne) return false;
    this.move = m; this.mf = 0; this.state = 'move'; this.connected = null; this.hitMap = new Map(); this.moveLanded = false;
    this.lastMove = m; this.whiffRec = 0;
    if (m.kind !== 'normal' && m.kind !== 'throw') { this.meter += 6; if (this.def.lines && this.def.lines.moves && Math.random() < 0.18) this.say(pick(this.def.lines.moves), 70); }
    if (!this.airborne && !m.vel) this.vx *= 0.3;
    if (m.air && this.airborne && !m.vel && !m.keepMomentum) this.vy = Math.min(this.vy, 0) * 0.3;
    if (m.kind === 'normal' && !this.airborne) this.vx = 0;
    if (m.onStart) m.onStart(this, m);
    Game.stats && Game.stats.moveUsed(this, m);
    this.faceOpp();
    return true;
  }
  stepMove(ctl) {
    const m = this.move; this.mf++;
    const total = m.s + m.a + m.r + this.whiffRec;
    if (m.inv && this.mf >= m.inv[0] && this.mf <= m.inv[1]) this.invul = Math.max(this.invul, 1);
    if (m.pinv && this.mf >= m.pinv[0] && this.mf <= m.pinv[1]) this.pinvul = Math.max(this.pinvul, 1);
    let setVy = false, grav = true;
    if (m.vel) for (const [a, b, vx, vy] of m.vel) if (this.mf >= a && this.mf < b) { this.vx = vx * this.facing * this.spdMult(); if (vy !== null && vy !== undefined) { this.vy = vy; setVy = true; grav = false; } }
    if (m.ev && m.ev[this.mf]) m.ev[this.mf](this, m);
    if (this.def.moveHook) this.def.moveHook(this, m, ctl);
    if (this.move !== m) return;
    if (m.hit && this.mf >= m.s && this.mf < m.s + m.a) Combat.meleeFrame(this, m);
    if (this.grabbing) Combat.grabStep(this);
    // cancels (buffered)
    if (this.connected && this.mf >= m.s) {
      if (m.jc && this.connected === 'hit' && this.buf.some(e => e.b === 'UP' || e.b === 'L' || e.b === 'M' || e.b === 'H')) {
        const e = this.buf.find(e => e.b === 'UP' || e.b === 'L' || e.b === 'M' || e.b === 'H');
        this.move = null; this.state = 'air'; this.jump({ x: this.facing }, true); this.vx = 180 * this.facing;
        if (e.b !== 'UP') this.buf.push({ b: e.b, x: 0, y: 0, t: 14 });
        this.buf = this.buf.filter(x => x.b !== 'UP'); this.jumps = 1;
        return;
      }
      if (this.buf.some(e => e.b === 'SD') && (m.kind === 'normal') && this.connected === 'hit') { this.buf = this.buf.filter(e => e.b !== 'SD'); this.move = null; this.superDash(); return; }
      if (m.follow && this.buf.some(e => e.b === 'S') && this.mf > m.s + m.a) { this.buf = this.buf.filter(e => e.b !== 'S'); this.move = null; this.startMove(m.follow); return; }
      if (this.tryActions(ctl, m)) return;
    }
    if (m.counter && this.mf >= m.s && this.mf < m.s + m.a) this.countering = true; else this.countering = false;
    if (m.landEnd && this.mf > 3 && !this.airborne && this.vy >= 0) { this.endMove(4); return; }
    if (this.mf >= total) { if (!this.connected && m.recoverWhiff && !this.whiffRec) { this.whiffRec = m.recoverWhiff; return; } this.endMove(0); return; }
    this.physics(grav, setVy);
  }
  endMove(landLag) {
    this.move = null; this.countering = false;
    this.state = this.airborne ? 'air' : 'stand';
    if (landLag) { this.state = 'move'; this.move = { name: 'land', pose: 'crouch', s: 0, a: 0, r: landLag, kind: 'normal', level: -1 }; this.mf = 0; }
  }

  // ---------- movement options ----------
  dash(dir) {
    if (this.airborne) { if (this.airDash >= 1) return false; this.airDash++; this.state = 'dash'; this.dashT = 16; this.dashDir = dir; this.vy = 0; Sfx.whoosh(); return true; }
    this.state = 'dash'; this.dashT = dir > 0 ? 16 : 18; this.dashDir = dir; if (dir < 0) this.invul = 5;
    Game.fx.burst(this.x, this.y - 10, 8, { color: ['#fff', this.def.color], size: 6, speed: 160, life: 0.3 }); Sfx.whoosh();
    return true;
  }
  stepDash(ctl) {
    this.vx = this.dashDir * this.facing * (this.airborne ? 760 : 720) * this.spdMult();
    if (this.airborne) this.vy = Math.min(this.vy, 40);
    if (--this.dashT <= 0 || (this.st > 4 && this.tryActions(ctl))) { if (this.state === 'dash') this.state = this.airborne ? 'air' : 'stand'; }
    this.physics(!this.airborne);
  }
  superDash() {
    this.state = 'sdash'; this.sdash = { t: 0 }; this.meter += 0; this.y = Math.min(this.y, -2);
    Sfx.whoosh(); Sfx.charge(0.3);
    return true;
  }
  stepSuperDash(ctl) {
    const o = this.opp, s = this.sdash; s.t++;
    const [tx, ty] = o.center(), [cx, cy] = this.center();
    const a = Math.atan2(ty - cy, tx - cx);
    this.vx = Math.cos(a) * 1250; this.vy = Math.sin(a) * 1250; this.facing = tx >= cx ? 1 : -1;
    this.pinvul = 1;
    if (s.t % 2 === 0) Game.fx.add({ x: cx, y: cy, vx: 0, vy: 0, life: 0.3, size: 26, color: this.def.color, glow: true, grow: -60 });
    if (rectsOverlap(this.rect(), o.rect()) && o.state !== 'ko') {
      this.state = 'air';
      Combat.resolveHit(o, this, H_({ dmg: 40, hs: 22, bs: 14, kb: [320, -300], launch: true, guard: 'high' }), { fromX: this.x, move: { kind: 'normal', level: 2, name: 'Super Dash' } });
      this.vx = -this.facing * 120; this.vy = -300;
      return;
    }
    if (s.t > 40 || ctl.press.H || ctl.press.M) { this.state = 'air'; if (!this.tryActions(ctl)) {} }
    this.physics(false, true);
  }
  vanish() {
    const o = this.opp; if (!o || this.state === 'hit') return false;
    this.meter -= 100; Save.bump('vanishes'); Sfx.teleport();
    Game.fx.burst(this.x, this.y - 60, 24, { color: [this.def.color, '#fff'], size: 9, speed: 260, life: 0.4, glow: true });
    this.move = { id: 'vanish', name: 'Vanish', kind: 'special', level: 3, pose: 'heavy', s: 14, a: 4, r: 20, inv: [1, 10], hit: H_({ dmg: 70, box: [-4, -110, 76, 100], hs: 32, bs: 20, kb: [900, -220], launch: true, wb: true, sfx: 'h' }),
      ev: { 8: f => { const oo = f.opp; f.x = clamp(oo.x - oo.facing * (oo.w / 2 + f.w / 2 + 16), 40, Arena.stage.width - 40); f.y = Math.min(oo.y, 0); f.vy = oo.airborne ? -80 : 0; f.faceOpp(); Game.fx.burst(f.x, f.y - 60, 24, { color: [f.def.color, '#fff'], size: 9, speed: 260, life: 0.4, glow: true }); } } };
    this.mf = 0; this.state = 'move'; this.connected = null; this.hitMap = new Map();
    Cam.boost = 0.08;
    return true;
  }
  reflect() {
    if (this.airborne) return;
    this.blockstun = 0; this.state = 'move'; this.mf = 0; this.connected = 'block';
    this.move = { id: 'reflect', name: 'Reflect', kind: 'special', level: 3, pose: 'cast', s: 2, a: 10, r: 14, inv: [1, 12] };
    Combat.reflect(this);
  }
  trySpark() {
    if (this.side.sparkUsed || this.state === 'ko' || !Game.battle.live()) return;
    this.side.sparkUsed = true;
    const burst = this.state === 'hit' || this.state === 'grabbed';
    this.spark = Math.round((6 + 3 * this.side.koCount()) * FPS);
    this.invul = 40;
    if (burst) { this.state = this.airborne ? 'air' : 'stand'; this.hitstun = 0; this.launched = false; Ach.unlock('spark_break'); }
    for (const e of Game.battle.enemiesOf(this.side)) { const d = e.x >= this.x ? 1 : -1; if (Math.abs(e.x - this.x) < 260) { e.vx = d * 900; e.vy = -300; if (e.state === 'move') e.move = null; e.state = 'hit'; e.hitstun = 26; e.launched = true; } }
    Game.fx.burst(this.x, this.y - 60, 80, { color: ['#9cf', '#fff', this.def.color], size: 14, speed: 700, glow: true, life: 0.8 });
    Game.announce('SPARKING!', '#9cf'); Sfx.boom(); Sfx.charge(0.5); Cam.shake = 14;
  }

  // ---------- hit state ----------
  stepHit(ctl) {
    if (this.hitstun > 0) this.hitstun--;
    const g = 1 + this.comboHits * 0.045;
    this.physics(true, false, g);
    if (this.wbPending && (this.x <= this.w / 2 + 12 || this.x >= Arena.stage.width - this.w / 2 - 12)) {
      this.wbPending = false; this.wbUsed++; this.vx = -this.vx * 0.42; this.vy = -560; this.hitstun = Math.max(this.hitstun, 22);
      Cam.shake = 14; Sfx.slam(); Arena.hit(this.x - 80, this.x + 80, this.y - 50, 120, Game.fx);
      Game.fx.burst(this.x, this.y - 50, 30, { color: ['#998', '#776', '#fff'], size: 10, speed: 400, life: 0.6 });
      Game.popWorld(this.x, this.y - 150, 'WALL BOUNCE', '#ffd35a', 20);
    }
    if (!this.airborne && this.vy >= 0 && (this.launched || this.kdPending)) {
      if (this.gbPending && this.gbUsed < 1) {
        this.gbPending = false; this.gbUsed++; this.vy = -620; this.vx *= 0.4; this.y = -1; this.hitstun = Math.max(this.hitstun, 24);
        Cam.shake = 10; Sfx.slam(); Game.fx.burst(this.x, 0, 20, { color: ['#998', '#776'], size: 9, speed: 300, angle: -Math.PI / 2, spread: 1.3, g: 600, life: 0.6 });
        return;
      }
      // land → knockdown or tech
      this.launched = false; this.kdPending = false; this.gbPending = false;
      if (!this.kdHard && (ctl.x || ctl.press.L || ctl.press.M || ctl.press.H) && this.hitstun < 12) {
        this.state = 'roll'; this.downT = 18; this.rollDir = ctl.x || -this.facing; this.invul = 20; Save.bump('techs'); this.comboHits = 0;
        Game.popWorld(this.x, this.y - 120, 'TECH', '#9cf', 18);
      } else { this.state = 'down'; this.downT = this.kdHard ? 60 : 42; this.vx *= 0.3; Sfx.hit(); Game.fx.burst(this.x, 0, 10, { color: ['#998', '#776'], size: 7, speed: 180, angle: -Math.PI / 2, spread: 1.4, g: 500, life: 0.5 }); }
      this.kdHard = false;
      return;
    }
    if (this.hitstun <= 0 && !this.kdPending) {
      if (this.airborne) { this.state = 'air'; this.launched = false; this.invul = 10; this.airDash = 1; this.jumps = 2; Game.fx.burst(this.x, this.y - 50, 8, { color: '#fff', size: 5, speed: 150, life: 0.3 }); }
      else { this.state = 'stand'; this.launched = false; }
    }
  }

  // ---------- physics ----------
  physics(grav = true, keepVy = false, gMult = 1) {
    const st = Arena.stage;
    if (grav && !keepVy) {
      let g = GRAV * st.gravity * gMult;
      if (this.form && this.def.form.flight && this.state !== 'hit' && this.lastCtl.hold && this.lastCtl.hold.UP) g *= 0.25;
      if (this.def.floaty && this.state !== 'hit') g *= 0.75;
      this.vy += g / FPS;
    }
    if (Arena.wind && this.state !== 'grabbed') this.x += Arena.wind * 150 / FPS;
    this.x += this.vx / FPS; this.y += this.vy / FPS;
    if (this.y >= 0) {
      if (this.vy > 0 && this.airborne === false) { /* landed */ }
      this.y = 0;
      if (this.vy > 0) {
        if (this.state === 'air' || this.state === 'dash') { this.state = 'stand'; this.vx *= 0.3; if (this.form && this.def.form.heavyLanding) { Cam.shake = Math.max(Cam.shake, 8); Sfx.slam(); } }
        this.vy = 0;
      }
      if (this.state === 'stand' || this.state === 'walk' || this.state === 'crouch' || this.state === 'down') this.vx *= this.state === 'down' ? 0.8 : st.friction < 1 ? 0.985 : 0.8;
    }
    if (this.y < -1600) { this.y = -1600; this.vy = Math.max(0, this.vy); }
    const half = this.w / 2 + 10;
    if (this.x < half) { this.x = half; if (this.vx < 0 && this.state !== 'hit') this.vx = 0; }
    if (this.x > st.width - half) { this.x = st.width - half; if (this.vx > 0 && this.state !== 'hit') this.vx = 0; }
    this.onGround = !this.airborne;
  }

  updatePose(ctl) {
    const s = this.state;
    if (s === 'move') this.pose = typeof this.move.pose === 'function' ? this.move.pose(this) : this.move.pose;
    else if (s === 'hit') this.pose = this.airborne || this.launched ? 'hurt_air' : 'hurt';
    else if (s === 'block') this.pose = 'block';
    else if (s === 'cblock') this.pose = this.blockstun ? 'cblock' : 'cblock';
    else if (s === 'crouch') this.pose = 'crouch';
    else if (s === 'down' || s === 'ko') this.pose = 'hurt';
    else if (s === 'roll') this.pose = 'crouch';
    else if (s === 'dash' || s === 'sdash') this.pose = 'dash';
    else if (s === 'charge') this.pose = 'kichar';
    else if (s === 'taunt') this.pose = 'taunt';
    else if (s === 'intro') this.pose = 'intro';
    else if (s === 'win') this.pose = 'victory';
    else if (s === 'air') this.pose = this.form && this.def.form.flight ? 'fly' : this.vy < 0 ? 'jump' : 'fall';
    else if (s === 'walk') this.pose = ctl.x === this.facing ? 'walk' : 'backwalk';
    else this.pose = 'idle';
    if (this.status.stun || this.status.freeze) this.pose = 'stun';
  }

  // ---------- drawing ----------
  draw(c) {
    const alpha = this.status.invis ? (this.ctrl === 'cpu' ? 0.12 : 0.3) : this.state === 'benched' ? 0 : 1;
    if (alpha <= 0) return;
    const sc = this.scale;
    ellipse(c, this.x, 4, this.w * 0.7, 7, `rgba(0,0,0,${0.35 * alpha * clamp(1 + this.y / 400, 0.2, 1)})`);
    const [cx, cy] = this.center();
    if (this.spark) { c.globalCompositeOperation = 'lighter'; glowCircle(c, cx, cy, this.h * 0.9, 'rgba(120,200,255,0.35)', 'rgba(120,200,255,0)'); c.globalCompositeOperation = 'source-over'; }
    if (this.state === 'charge') { c.globalCompositeOperation = 'lighter'; glowCircle(c, cx, cy, this.h * (0.8 + Math.sin(this.anim * 20) * 0.08), hexA(this.def.color, 0.45), hexA(this.def.color, 0)); c.globalCompositeOperation = 'source-over'; }
    if (this.form && this.def.form.clones) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); for (const d of [-70, 70]) silhouette(c, o => { o.setTransform(1, 0, 0, 1, 0, 0); Cam.apply(o); o.translate(this.x + d, this.y); o.scale(sc * this.facing, sc); this.def.draw(o, this); }, '#3a0a2a', 0.45 * alpha); c.restore(); }
    c.save(); c.globalAlpha = alpha; c.translate(this.x, this.y);
    if (this.lying) { c.translate(0, -8); c.rotate(-this.facing * Math.PI / 2 * 0.95); }
    if (this.state === 'roll') c.rotate(this.facing * this.rollDir * (18 - this.downT) / 18 * Math.PI * 2);
    c.scale(sc * this.facing, sc);
    if (this.alt && this.def.handArt) c.filter = `hue-rotate(${[0, 150, 240, 60][this.alt % 4]}deg)`;
    this.def.draw(c, this);
    c.restore();
    const top = this.y - this.h;
    if (this.status.freeze) { c.fillStyle = 'rgba(190,240,255,0.5)'; c.strokeStyle = '#fff'; c.lineWidth = 2; c.fillRect(this.x - this.w * 0.8, top - 10, this.w * 1.6, this.h + 10); c.strokeRect(this.x - this.w * 0.8, top - 10, this.w * 1.6, this.h + 10); }
    if (this.status.stun && !this.status.freeze) for (let i = 0; i < 3; i++) { const a = this.anim * 5 + i * 2.1; bigText(c, '★', this.x + Math.cos(a) * 24, top - 14 + Math.sin(a) * 6, 16, '#ffd35a', null); }
    if (this.status.shield > 0) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(63,224,255,0.7)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, this.h * 0.6, 0, Math.PI * 2); c.stroke(); c.globalCompositeOperation = 'source-over'; }
    if (this.status.confuse) bigText(c, '?', this.x, top - 20, 30, '#d05aff', '#000');
    const icons = [['burn', '🔥'], ['poison', '☠'], ['slow', '❄'], ['weaken', '▼'], ['mark', '✕'], ['bleed', '💧'], ['power', '▲'], ['haste', '»']].filter(([k]) => this.status[k]);
    icons.forEach(([, ic], i) => smallText(c, ic, this.x - icons.length * 8 + i * 16, top - 10, 13, '#fff', 'center'));
    if ((this.state === 'block' || this.state === 'cblock') && this.blockstun) {
      const a0 = this.facing > 0 ? 0 : Math.PI;
      c.strokeStyle = this.guard > 70 ? 'rgba(255,120,120,0.85)' : 'rgba(150,210,255,0.8)'; c.lineWidth = 3;
      c.beginPath(); c.arc(this.x + this.facing * this.w * 0.3, cy, this.h * 0.55, a0 - Math.PI / 2.4, a0 + Math.PI / 2.4); c.stroke();
    }
    if (this.flash > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = this.flash / 8; glowCircle(c, this.x, cy, this.h * 0.6, 'rgba(255,255,255,0.6)'); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
    if (this.sayT > 0 && this.sayText) Game.drawBubble(c, this.x, top - 30, this.sayText, this.def.color, Math.min(1, this.sayT / 15));
  }
}
