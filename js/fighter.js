// ============================================================
//  MOONKAI — fighter engine
// ============================================================
const GRAV = 2300, JUMP_V = 920, HP_SCALE = 1.4;
const CHAIN = [
  { pose: 'punch', dur: 0.26, hitAt: 0.08, mult: 1, reach: 58, kb: 150 },
  { pose: 'kick', dur: 0.3, hitAt: 0.1, mult: 1.15, reach: 68, kb: 170 },
  { pose: 'uppercut', dur: 0.42, hitAt: 0.14, mult: 1.5, reach: 60, kb: 260, launch: true },
];

class Fighter {
  constructor(def, slot, ctrl, level = 1) {
    this.def = def; this.id = def.id; this.slot = slot; this.ctrl = ctrl; this.level = level;
    this.maxHp = Math.round(def.hp * HP_SCALE * (ctrl === 'boss' ? 1.4 : 1));
    this.ult = 0; this.meter = 0;
    this.resetForRound(slot === 0 ? 300 : W - 300, slot === 0 ? 1 : -1);
  }
  resetForRound(x, facing) {
    this.x = x; this.y = GROUND; this.vx = 0; this.vy = 0; this.facing = facing;
    this.hp = this.maxHp; this.shownHp = this.maxHp; this.ki = 100;
    this.form = false; this.formT = 0; this.revived = false;
    this.status = {}; this.cd = [0, 0]; this.dashCd = 0; this.atkCd = 0; this.chain = 0; this.chainT = 0;
    this.act = null; this.hurtT = 0; this.downT = 0; this.launched = false; this.invuln = 0; this.flash = 0;
    this.comboTaken = 0; this.neutralT = 0; this.blocking = false; this.onGround = true; this.jumps = 0;
    this.pose = 'idle'; this.anim = rand(0, 5); this.history = []; this.histT = 0; this.jackT = 3;
    this.aiT = 0; this.aiMode = 'approach'; this.aiUlt = rand(0.5, 2);
  }
  get transformed() { return this.form; }
  get scale() { return this.form ? this.def.form.scale : 1; }
  get w() { return 44 * this.scale * (this.def.heavy ? 1.25 : 1); }
  get h() { return 108 * this.scale; }
  rect() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  center() { return [this.x, this.y - this.h / 2]; }
  mouth() { return [this.x + this.facing * 25 * this.scale, this.y - 86 * this.scale]; }
  hand() { return [this.x + this.facing * 44 * this.scale, this.y - 80 * this.scale]; }
  canBeHit() { return this.hp > 0 && this.invuln <= 0 && this.downT <= 0 && !this.status.grabbed; }
  skill(i) { return (this.form ? this.def.formSkills : this.def.skills)[i]; }
  cdRate() { return (this.form && this.def.form.haste || 1) * (this.status.haste ? 1.3 : 1) * (Game.mode === 'training' && this.ctrl !== 'cpu' ? 2 : 1); }
  speedMult() { let m = this.form ? this.def.form.speed : 1; if (this.status.slow) m *= 0.6; if (this.status.haste) m *= 1.3; return m; }
  canUlt() { return this.ult >= 100 && !(this.def.ult.locked && this.def.ult.locked(this)); }
  dmgMult(t, o = {}) {
    let m = this.form ? this.def.form.dmg : 1;
    if (this.status.weaken) m *= 0.75;
    if (this.def.rage) m *= 1 + (1 - this.hp / this.maxHp) * this.def.rage;
    if (this.id === 'nyx') {
      if (t.status.mark && o.melee) { m *= 1.3; t.status.mark = 0; }
      if (this.status.crit && o.melee) { m *= 1.6; this.status.crit = 0; this.status.invis = 0; Game.popText(t.x, t.y - t.h - 40, 'CRITICAL', '#ff2a6a', 28); }
      if (t.facing === (t.x >= this.x ? 1 : -1)) m *= 1.35;
    }
    if (this.id === 'glacia' && (t.status.slow || t.status.freeze)) m *= 1.1;
    if (this.def.lucky && Math.random() < this.def.lucky) { m *= 2; Game.popText(t.x, t.y - t.h - 40, 'LUCKY!', '#ffd35a', 28); }
    return m;
  }
  takenMult() {
    let m = this.form ? this.def.form.armor : 1;
    if (this.id === 'terra' && Math.abs(this.vx) < 25 && !this.act) m *= 0.85;
    return m;
  }
  enterForm(dur) {
    this.form = true; this.formT = dur || this.def.form.dur; this.meter = 0;
    this.y = Math.min(this.y, GROUND); this.cd = [0, 0];
    this.def.form.onStart && this.def.form.onStart(this);
    Game.popText(this.x, this.y - this.h - 20, this.def.form.name + '!', this.def.color, 34);
    Game.fx.burst(this.x, this.y - 80, 60, { color: ['#fff', this.def.color], size: 12, speed: 500, glow: true, life: 0.8 });
    const half = this.w / 2 + 10; this.x = clamp(this.x, half, W - half);
  }
  exitForm() {
    this.form = false; this.formT = 0;
    Game.hazards = Game.hazards.filter(h => !(h.owner === this && h.tag === 'az'));
    Game.fx.burst(this.x, this.y - 60, 40, { color: ['#fff', this.def.color], size: 8, speed: 300, glow: true, life: 0.7 });
    Game.popText(this.x, this.y - 150, 'FORM FADES', '#ccc');
  }

  update(ctl, dt) {
    const opp = this.opp, S = this.status;
    this.anim += dt;
    this.flash = Math.max(0, this.flash - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    const r = this.cdRate();
    this.cd[0] -= dt * r; this.cd[1] -= dt * r; this.dashCd -= dt; this.atkCd -= dt; this.chainT -= dt; this.hurtT -= dt;
    this.shownHp = lerp(this.shownHp, this.hp, Math.min(1, dt * 3));
    for (const k of Object.keys(S)) if (k !== 'shield' && typeof S[k] === 'number' && S[k] > 0) S[k] = Math.max(0, S[k] - dt);
    if (S.shield && !S.shieldT) S.shield = 0;
    // damage over time
    this.dotT = (this.dotT || 0) - dt;
    if ((S.burn || S.bleed) && this.dotT <= 0 && this.hp > 0) {
      this.dotT = 0.5;
      Game.hit(this, { dmg: S.bleed ? 10 : 8, src: S.dotSrc || opp, dot: true, fromX: this.x });
      Game.fx.burst(this.x, this.y - this.h * 0.5, 4, { color: S.bleed ? '#c01010' : '#ff7a1a', size: 5, speed: 80, glow: !S.bleed, life: 0.4 });
    }
    // history (for Rewind)
    this.histT -= dt;
    if (this.histT <= 0) { this.histT = 0.1; this.history.push({ x: this.x, y: this.y, hp: this.hp }); if (this.history.length > 30) this.history.shift(); }
    // combo counter resets once the target is back in neutral
    if (this.hurtT <= 0 && this.downT <= 0 && !this.launched) { this.neutralT += dt; if (this.neutralT > 0.35) this.comboTaken = 0; } else this.neutralT = 0;

    if (this.hp <= 0) { this.pose = 'ko'; this.vx *= 0.9; this.physics(dt); return; }
    if (S.grabbed) { this.pose = 'hurt'; return; }
    if (this.downT > 0) { this.downT -= dt; this.pose = 'down'; this.vx *= 0.85; if (this.downT <= 0) this.invuln = 0.45; this.physics(dt); return; }

    // meters
    const kiRate = 22 * (opp && opp.id === 'vex' && Math.abs(opp.x - this.x) < 320 ? 0.8 : 1);
    if (!this.blocking && !this.act) this.ki = Math.min(100, this.ki + kiRate * dt);
    this.ult = Math.min(100, this.ult + dt * 0.45);
    if (!this.form && this.def.form.manual) this.meter = Math.min(100, this.meter + dt * 1.1 * (this.def.meterRate || 1));
    if (this.def.regen) this.hp = Math.min(this.maxHp, this.hp + this.def.regen * dt);
    if (this.form) this.formTick(dt);

    if (S.freeze || S.stun) { this.pose = 'stun'; this.act = null; this.vx *= 0.9; this.blocking = false; this.physics(dt); return; }
    if (S.confuse) { const l = ctl.left; ctl.left = ctl.right; ctl.right = l; }

    if (this.act) this.runAct(dt);
    const busy = !!this.act || this.hurtT > 0;
    this.blocking = !busy && !!ctl.block && this.onGround;
    if (!busy) {
      if (ctl.ult && this.canUlt()) { Game.triggerUlt(this); return; }
      if (ctl.transform && this.def.form.manual && !this.form && this.meter >= 100) { Game.triggerTransform(this); return; }
      if (ctl.dash && this.dashCd <= 0 && (this.ki >= 15 || this.def.freeDash)) {
        const dir = ctl.left ? -1 : ctl.right ? 1 : this.facing;
        if (!this.def.freeDash) this.ki -= 15;
        this.dashCd = 0.45;
        Ab.dash(this, { dur: 0.2, speed: 950, dmg: 0, pose: 'dash' });
        this.invuln = 0.12; this.act.dir = dir; this.act.pass = true;
        Game.fx.burst(this.x, this.y - 20, 10, { color: ['#fff', this.def.color], size: 6, speed: 160, life: 0.3 });
        Sfx.whoosh();
      } else if (!this.blocking) {
        const dir = (ctl.right ? 1 : 0) - (ctl.left ? 1 : 0);
        const fr = Arena.stage.friction;
        this.vx = lerp(this.vx, dir * this.def.speed * this.speedMult(), Math.min(1, dt * (dir ? 12 : 14) * (this.onGround ? fr : 0.6)));
        if (ctl.jump && (this.onGround || (this.def.doubleJump && this.jumps < 2))) {
          this.vy = -JUMP_V * (this.form && this.def.form.jump || 1); this.onGround = false; this.jumps++; Sfx.jump();
          if (this.jumps === 2) this.fxJump();
        }
        if (ctl.attack && this.atkCd <= 0) this.startChain();
        else if (ctl.skill1) this.useSkill(0);
        else if (ctl.skill2) this.useSkill(1);
      } else this.vx *= Math.pow(0.02, dt);
    } else if (!this.act || this.act.type === 'cast' || this.act.type === 'melee') {
      this.vx *= Math.pow(this.hurtT > 0 ? 0.2 : 0.001, dt);
    }
    this.flying = false;
    if (this.form && this.def.form.flight && ctl.jumpHeld && this.hurtT <= 0) { this.vy = Math.max(this.vy - 4200 * dt, -380); this.flying = true; }
    if (!busy) this.facing = opp.x >= this.x ? 1 : -1;
    this.physics(dt);
    if (this.act) this.pose = this.act.pose;
    else if (this.hurtT > 0) this.pose = 'hurt';
    else if (this.blocking) this.pose = 'block';
    else if (this.form && this.def.form.flight && !this.onGround) this.pose = 'fly';
    else if (!this.onGround) this.pose = 'jump';
    else if (Math.abs(this.vx) > 30) this.pose = 'run';
    else this.pose = 'idle';
  }
  fxJump() { Game.fx.burst(this.x, this.y, 12, { color: [this.def.color, '#fff'], size: 6, speed: 200, angle: Math.PI / 2, spread: 1, glow: true, life: 0.35 }); }

  formTick(dt) {
    const F = this.def.form;
    if (!this.def.reviveForm) this.formT -= dt;
    if (F.regen) this.hp = Math.min(this.maxHp, this.hp + F.regen * dt);
    if (F.jackpot) {
      this.jackT -= dt;
      if (this.jackT <= 0) {
        this.jackT = 3;
        const b = pick([['HASTE', () => this.status.haste = 3], ['SHIELD', () => { this.status.shield = 80; this.status.shieldT = 3; }], ['REGEN', () => Ab.heal(this, 45)], ['KI UP', () => this.ki = 100], ['POWER', () => this.status.power = 3]]);
        b[1](); Game.popText(this.x, this.y - this.h - 30, '🎰 ' + b[0], '#ffd35a', 24); Sfx.card();
      }
    }
    const [cx, cy] = this.center(), fx = Game.fx;
    if (Math.random() < dt * 25) fx.add({ x: cx + rand(-this.w / 2, this.w / 2), y: cy + rand(-this.h / 2, this.h / 2), vx: rand(-20, 20), vy: rand(-120, -40), life: rand(0.3, 0.6), size: rand(3, 7), color: this.def.color, glow: true, grow: -6 });
    if (this.formT <= 0) this.exitForm();
  }

  startChain() {
    if (this.chainT <= 0) this.chain = 0;
    const c = CHAIN[this.chain], sp = this.def.fastChain ? 0.8 : 1;
    const heavy = this.form && this.def.form.superArmor;
    Ab.melee(this, { pose: c.pose, dur: c.dur * sp * (heavy ? 1.3 : 1), hitAt: c.hitAt * sp * (heavy ? 1.3 : 1), reach: c.reach, dmg: this.def.atk * c.mult, kb: c.kb, launch: c.launch, chain: true });
    this.chain++;
    if (this.chain >= 3) { this.chain = 0; this.atkCd = 0.45; } else { this.atkCd = c.dur * sp * 0.85; this.chainT = c.dur * sp + 0.35; }
    Sfx.whoosh();
  }
  useSkill(i) {
    const s = this.skill(i);
    if (!s || this.cd[i] > 0 || this.ki < s.ki) { if (s && this.ctrl !== 'cpu' && this.cd[i] <= 0 && this.ki < s.ki) Game.popText(this.x, this.y - this.h - 20, 'NO KI', '#7df', 18); return false; }
    this.ki -= s.ki; this.cd[i] = s.cd; this.cdMax = this.cdMax || [1, 1]; this.cdMax[i] = s.cd;
    s.use(this, this.opp);
    return true;
  }

  runAct(dt) {
    const a = this.act, opp = this.opp;
    a.t += dt;
    if (a.type === 'melee' && !a.done && a.t >= a.hitAt) {
      a.done = true;
      a.onStrike && a.onStrike(this);
      const s = this.scale, reach = (a.reach || 58) * s;
      const box = { x: this.facing > 0 ? this.x : this.x - reach - 10, y: this.y - 104 * s, w: reach + 10, h: 90 * s };
      if (this.form && this.def.form.heavyLanding && a.chain) Arena.hit(this.x + this.facing * 20, this.x + this.facing * reach, this.y - 50, 25, Game.fx);
      if (rectsOverlap(box, opp.rect())) {
        let dmg = a.dmg;
        if (this.form && this.def.form.meleeBonus) { dmg += this.def.form.meleeBonus; Game.fx.burst(opp.x, opp.y - 60, 10, { color: ['#bff4ff', '#fff'], size: 5, speed: 300, glow: true, life: 0.3 }); }
        if (this.status.power) dmg *= 1.3;
        const r = Game.hit(opp, { dmg, src: this, kb: a.kb, launch: a.launch, status: a.status, melee: true });
        if (r === 'hit' && this.form && this.def.form.clones) for (const d of [0.08, 0.16]) Game.later(d, () => { if (opp.canBeHit() && Math.abs(opp.x - this.x) < reach + 80) Game.hit(opp, { dmg: dmg * 0.35, src: this, kb: 60, melee: false }); });
        if (r === 'hit' && this.id === 'kira') Game.fx.burst(opp.x, opp.y - 60, 10, { color: ['#ffcc33', '#ff5a1a'], size: 7, speed: 240, glow: true, life: 0.4 });
      }
    } else if (a.type === 'dash') {
      this.vx = (a.dir !== undefined ? a.dir : this.facing) * a.speed;
      if (a.vy !== undefined && a.t <= dt * 1.5) { this.vy = a.vy; this.onGround = false; }
      if (a.trail && Math.random() < 0.9) Game.fx.add({ x: this.x, y: this.y - this.h / 2 + rand(-20, 20), vx: 0, vy: 0, life: 0.3, size: 14, color: a.trail, glow: true, grow: -30 });
      if (a.dmg && !a.done && rectsOverlap(this.rect(), opp.rect())) { a.done = true; Game.hit(opp, { dmg: a.dmg, src: this, kb: a.kb || 300, launch: a.launch, status: a.status, melee: true }); }
      if (a.t >= a.dur) { this.act = null; this.vx *= 0.25; }
      return;
    } else if (a.type === 'leap') {
      if (a.t > 0.12 && this.onGround && !a.landed) { a.landed = true; this.vx = 0; a.onLand && a.onLand(this); a.dur = a.t + 0.25; a.pose = 'slam'; }
      if (a.landed) this.vx = 0;
    } else if (a.type === 'grab') {
      const v = a.victim;
      if (a.t < 0.5) { v.x = this.x + this.facing * 10; v.y = this.y - this.h * 0.9 - Math.sin(a.t * 6) * 10; v.vx = 0; v.vy = 0; a.pose = 'charge'; }
      else if (!a.done) {
        a.done = true; a.pose = 'slam';
        v.status.grabbed = 0; v.x = clamp(this.x + this.facing * (this.w / 2 + v.w / 2 + 10), v.w / 2 + 10, W - v.w / 2 - 10); v.y = GROUND;
        Game.hit(v, { dmg: a.dmg, src: this, kb: 300, launch: true, unblockable: true, force: true });
        Game.shake = 18; Sfx.slam(); Arena.hit(v.x - 60, v.x + 60, GROUND - 30, 60, Game.fx);
        Game.fx.burst(v.x, GROUND, 30, { color: ['#998', '#776', this.def.color], size: 10, speed: 360, angle: -Math.PI / 2, spread: 1.3, g: 600, life: 0.7 });
      }
    }
    if (a.t >= a.dur) this.act = null;
  }

  physics(dt) {
    const st = Arena.stage;
    const flyG = this.form && this.def.form.flight ? 0.55 : 1;
    const hov = this.def.hover && !this.onGround && this.vy > 0 ? 0.75 : 1;
    this.vy += GRAV * st.gravity * flyG * hov * dt;
    if (Arena.wind && this.hp > 0) this.x += Arena.wind * 150 * dt;
    this.x += this.vx * dt; this.y += this.vy * dt;
    const wasAir = !this.onGround;
    if (this.y >= GROUND) {
      this.y = GROUND; this.vy = 0;
      if (wasAir) {
        this.jumps = 0;
        if (this.launched) { this.launched = false; this.downT = this.def.heavy ? 0.35 : 0.6; this.hurtT = 0; Game.fx.burst(this.x, GROUND, 10, { color: ['#998', '#776'], size: 7, speed: 180, angle: -Math.PI / 2, spread: 1.4, g: 500, life: 0.5 }); }
        if (this.form && this.def.form.heavyLanding) { Game.shake = Math.max(Game.shake, 8); Sfx.slam(); Game.fx.burst(this.x, GROUND, 16, { color: ['#776', '#998'], size: 10, speed: 260, angle: -Math.PI / 2, spread: 1.4, g: 500, life: 0.7 }); }
      }
      this.onGround = true;
    } else this.onGround = false;
    if (this.y < 100) { this.y = 100; this.vy = Math.max(0, this.vy); }
    const half = this.w / 2 + 10;
    this.x = clamp(this.x, half, W - half);
  }
}

// ---------- input mapping ----------
const KEYMAP = [
  { left: ['KeyA'], right: ['KeyD'], up: ['KeyW'], down: ['KeyS'], attack: ['KeyJ'], skill1: ['KeyK'], skill2: ['KeyL'], transform: ['KeyU'], ult: ['KeyI'], dash: ['ShiftLeft', 'KeyO'] },
  { left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'], attack: ['Numpad1', 'Comma'], skill1: ['Numpad2', 'Period'], skill2: ['Numpad3', 'Slash'], transform: ['Numpad4', 'Semicolon'], ult: ['Numpad5', 'Quote'], dash: ['Numpad0', 'ShiftRight'] },
];
function playerControl(slot) {
  const k = KEYMAP[slot], H = a => a.some(held), T = a => a.some(c => Input.pressed.has(c));
  return {
    left: H(k.left), right: H(k.right), block: H(k.down), jump: T(k.up), jumpHeld: H(k.up),
    attack: T(k.attack), skill1: T(k.skill1), skill2: T(k.skill2), transform: T(k.transform), ult: T(k.ult), dash: T(k.dash),
  };
}
