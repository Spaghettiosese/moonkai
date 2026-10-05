// ============================================================
//  MOONKAI — combat resolution, projectiles, beams, hazards
// ============================================================
const Combat = {
  projectiles: [], beams: [], hazards: [],
  clear() { this.projectiles = []; this.beams = []; this.hazards = []; },
  addHazard(h) { h.t = h.t || 0; h.hits = h.hits || new Map(); this.hazards.push(h); return h; },

  hitRect(f, h) {
    // boxes scale with the drawn body: fighter scale x build height; bulky builds strike from a wider body edge
    const sc = f.scale * (f.def.tall || 1), push = Math.max(0, (f.w - 46 * f.scale) / 2), [bx, by, bw, bh] = h.box;
    if (h.centered) return { x: f.x + bx * sc, y: f.y + by * sc, w: bw * sc, h: bh * sc };
    return { x: f.facing > 0 ? f.x + bx * sc + push : f.x - (bx + bw) * sc - push, y: f.y + by * sc, w: bw * sc, h: bh * sc };
  },
  targets(side) { return Game.battle ? Game.battle.enemiesOf(side) : []; },

  // ---------- melee ----------
  meleeFrame(f, m) {
    const h = m.hit, box = this.hitRect(f, h);
    // weapon users: the blade's edge is part of the hitbox (light attacks reach 85% of the tip)
    const tip = (f.form && f.def.form && f.def.form.weaponTip) || f.def.weaponTip;
    if (tip && !h.centered && !m.grab && !m.noExtend && h.guard !== 'throw' && m.kind !== 'throw') {
      const want = tip * (m.level === 0 ? 0.85 : 1) * f.scale * (f.def.tall || 1);
      if (f.facing > 0) { const edge = f.x + want; if (box.x + box.w < edge) box.w = edge - box.x; }
      else { const edge = f.x - want; if (box.x > edge) { box.w += box.x - edge; box.x = edge; } }
    }
    if (Save.set.hitboxes) Game.debugBoxes.push({ r: box, col: 'rgba(255,40,40,0.45)' });
    for (const t of this.targets(f.side)) {
      const rec = f.hitMap.get(t) || { n: 0, last: -99 };
      const multi = h.multi || 1;
      if (rec.n >= multi || (rec.n > 0 && f.mf - rec.last < (h.every || 99))) continue;
      if (!rectsOverlap(box, t.rect())) continue;
      // clash: both mid-swing with overlapping hitboxes
      if (m.kind === 'normal' && t.state === 'move' && t.move.kind === 'normal' && t.move.hit && t.mf >= t.move.s && t.mf < t.move.s + t.move.a && rectsOverlap(this.hitRect(t, t.move.hit), f.rect())) {
        this.clash(f, t); return;
      }
      let hp = h;
      if (m.finisher && rec.n === multi - 1) hp = Object.assign({}, h, m.finisher);
      const r = this.resolveHit(t, f, hp, { move: m, fromX: f.x });
      if (r) { rec.n++; rec.last = f.mf; f.hitMap.set(t, rec); if (f.connected !== 'hit') f.connected = r === 'countered' ? null : r; }
    }
    Arena.hit(box.x, box.x + box.w, box.y + box.h / 2, h.dmg * 0.08, Game.fx);
  },
  clash(a, b) {
    for (const f of [a, b]) { f.move = null; f.state = 'hit'; f.hitstun = 14; f.vx = -f.facing * 420; }
    const x = (a.x + b.x) / 2, y = Math.min(a.y, b.y) - 70;
    Game.fx.burst(x, y, 40, { color: ['#fff', '#ffe28a', '#9cf'], size: 10, speed: 500, glow: true, life: 0.5 });
    Game.popWorld(x, y - 40, 'CLASH!', '#fff', 30); Sfx.clang(); Game.battle.hitstop = 10; Cam.shake = 8;
    Save.bump('clashes');
  },

  // ---------- the heart: apply one hit ----------
  resolveHit(t, a, h, opts = {}) {
    const B = Game.battle;
    if (!B || t.state === 'ko' || t.state === 'benched' || t.state === 'tagout') return null;
    if (t.def.onIncoming) { const ir = t.def.onIncoming(t, a, h, opts); if (ir !== undefined) return ir; }
    if (!opts.force) {
      if (t.invul > 0) return null;
      if ((opts.proj || opts.beam) && t.pinvul > 0) return null;
      // one OTG hit per knockdown, early in the knockdown (not right before wake-up)
      if (t.lying && !h.otg && (t.state === 'ko' || t.otgUsed || t.downT < 12)) return null;
      if (t.state === 'grabbed') return null;
    }
    if (t.countering && t.move && t.move.counter && a instanceof Fighter && !opts.force && h.guard !== 'throw' && !(opts.move && opts.move.grab)) { this.counterTrigger(t, a); return 'countered'; }
    const dir = Math.sign(t.x - (opts.fromX ?? a.x)) || (a.facing || 1);
    // throws / command grabs
    if (h.guard === 'throw' || (opts.move && opts.move.grab)) {
      const g = opts.move && opts.move.grab;
      if ((t.airborne && !(g && g.air)) || (t.state === 'hit' && !(g && g.combo)) || t.blockstun > 0 || t.state === 'down' || t.state === 'sdash') return null;
      if (t.state === 'move' && t.move.inv && t.invul > 0) return null;
      t.state = 'grabbed'; t.move = null; t.grabT = 0; t.grabbedBy = a; t.vx = 0; t.vy = 0;
      a.grabbing = { victim: t, t: 0, anim: g ? g.anim : 'toss', dmg: g ? g.dmg : h.dmg, frames: g ? g.frames : 22, kb: h.kb, techable: !g, ult: g && g.ultConnect, heal: g && g.heal };
      a.connected = 'hit';
      return 'hit';
    }
    // blocking
    const ctl = t.lastCtl || {};
    const holdingBack = ctl.x === dir;
    const frozen = B.timeStop && B.timeStop.by.side !== t.side;
    const canBlock = !frozen && !(t.form && t.def.form && t.def.form.noBlock) && ['stand', 'walk', 'crouch', 'cblock', 'block', 'air'].includes(t.state) || (t.state === 'dash' && t.dashDir < 0 && !t.airborne);
    const crouching = ctl.y > 0 && !t.airborne;
    const guardOK = h.guard === 'mid' || (h.guard === 'low' && (crouching || t.airborne)) || (h.guard === 'high' && !crouching);
    if (canBlock && holdingBack && h.guard !== 'unblock' && guardOK) {
      t.state = crouching ? 'cblock' : 'block'; t.move = null;
      t.blockstun = Math.round(h.bs || 12); t.vx = dir * (Math.abs(h.kb[0]) * 0.45 + 140);
      if (t.airborne) t.vy = Math.min(t.vy, -120);
      const isSpecial = opts.move && opts.move.kind !== 'normal';
      const chip = isSpecial ? h.dmg * 0.16 : 0;
      t.hp = Math.max(1, t.hp - chip);
      t.guard += h.dmg * 0.32 + 4; t.guardT = 70;
      a.side && (a.side.meter = clamp(a.side.meter + h.dmg * 0.12, 0, METER_MAX)); t.side.meter = clamp(t.side.meter + h.dmg * 0.18, 0, METER_MAX);
      if (t.guard >= 100) {
        t.guard = 0; t.state = 'hit'; t.hitstun = 60; t.status.stun = 1; t.blockstun = 0;
        Game.popWorld(t.x, t.y - t.h - 30, 'GUARD CRUSH', '#ff5a5a', 30); Sfx.clang(); Cam.shake = 10;
      }
      Sfx.block(); B.hitstop = Math.max(B.hitstop, 4);
      const [cx, cy] = t.center();
      Game.fx.burst(cx - dir * t.w / 2, cy, 10, { color: '#9cf', size: 6, speed: 220, glow: true, life: 0.25 });
      if (h.ultConnect) opts.blockedUlt = true;
      if (opts.move && opts.move.onBlock && a instanceof Fighter) opts.move.onBlock(a, t, h);
      return 'block';
    }
    // hit
    const counter = t.state === 'move' && t.move && t.mf < t.move.s + t.move.a && t.move.kind !== 'throw';
    const isSuper = opts.move && (opts.move.kind === 'super' || opts.move.kind === 'ult');
    const minScale = isSuper ? 0.5 : 0.3;
    const otg = t.state === 'down';
    let dmg = h.dmg * (a.world ? 1 : a.dmgMult(t)) * t.armorMult(a);
    if (otg) dmg *= 0.6;
    if (!h.noScale && !opts.noScale) dmg *= Math.max(minScale, 1 - 0.07 * Math.max(0, t.comboHits - 1));
    if (counter) { dmg *= 1.15; Game.popWorld(t.x, t.y - t.h - 50, 'COUNTER!', '#ff4a4a', 26); Save.bump('counters'); }
    if (t.status.shield > 0) { const ab = Math.min(t.status.shield, dmg); t.status.shield -= ab; dmg -= ab; Game.fx.burst(t.x, t.y - 60, 10, { color: '#3fe0ff', size: 6, speed: 200, glow: true, life: 0.3 }); if (dmg <= 0) { Sfx.block(); return 'block'; } }
    const armored = !opts.force && !isSuper && ((t.form && t.def.form.superArmor && h.dmg < 90) || t.status.armor || (t.state === 'move' && t.move.armor && t.mf >= t.move.armor[0] && t.mf <= t.move.armor[1]));
    dmg = Math.round(dmg);
    t.hp = Math.max(0, t.hp - dmg);
    t.red = Math.max(t.hp, t.red - dmg * 0.45);
    if (!a.world) {
      a.side.meter = clamp(a.side.meter + dmg * 0.16, 0, METER_MAX);
      const ls = (a.form && a.def.form.lifesteal || 0) + (a.status.lifesteal ? 0.2 : 0);
      if (ls) a.hp = Math.min(a.maxHp, a.hp + dmg * ls);
      a.side.combo.hits = t.comboHits + 1; a.side.combo.dmg += dmg; a.side.combo.t = 90;
      Game.stats && Game.stats.hit(a, t, dmg, counter);
      if (Arena.stage.crowd && t.comboHits > 8) { Arena.hype = Math.min(1, Arena.hype + 0.02); if (Arena.hype > 0.6 && Game.battle.frame % 30 === 0) { a.side.meter += 20; } }
    }
    t.side.meter = clamp(t.side.meter + dmg * 0.1, 0, METER_MAX);
    if (!a.world && a.def.onHit) a.def.onHit(a, t, dmg, h);
    if (t.def.onHurt && !a.world) t.def.onHurt(t, a, dmg, h);
    if (opts.move && opts.move.onHit && !a.world) opts.move.onHit(a, t, dmg, h);
    if (h.mark && !a.world) Combat.mark(t, a, h.mark.name, h.mark.n || 1, h.mark);
    if (h.status) { for (const [k, v] of Object.entries(h.status)) t.status[k] = Math.max(t.status[k] || 0, v); }
    if (h.stun) t.status.stun = Math.max(t.status.stun || 0, h.stun);
    if (h.pull) { t.vx = (a.x - t.x) * 3; }
    const [cx, cy] = t.center();
    const weight = t.def.weight || 1;
    if (armored) {
      t.flash = 8; Game.fx.burst(cx, cy, 8, { color: ['#fff', '#ffd35a'], size: 6, speed: 200, glow: true, life: 0.3 });
    } else {
      t.move = null; t.grabbing = null; t.state = 'hit'; t.countering = false;
      const decay = Math.max(0.4, 1 - t.comboHits * 0.03);
      t.hitstun = Math.round((h.hs || 18) * decay * (counter ? 1.4 : 1));
      t.vx = dir * h.kb[0] * weight;
      const launch = h.launch || t.airborne || h.kb[1] < -300;
      if (launch) {
        t.vy = h.kb[1] !== 0 ? h.kb[1] * (h.kb[1] < 0 ? weight : 1) : -220;
        if (!t.airborne && t.vy < 0) t.y = -1;
        if (!t.airborne && t.vy > 0) { t.y = -1; t.vy = -300; }
        t.launched = true;
      } else t.vy = 0;
      if (h.kd) { t.kdPending = true; t.kdHard = h.kd === 'hard'; }
      if (h.wb && t.wbUsed < 1) { t.wbPending = true; t.kdPending = true; }
      if (h.gb && t.gbUsed < 1) { t.gbPending = true; t.kdPending = true; }
      t.comboHits++; t.comboDmg += dmg;
      // multi-hit attacks (barrages, rising multi hits) hold the victim in place so every hit lands
      const mh = opts.move && opts.move.hit && (opts.move.hit.multi || 1) > 1 && h === opts.move.hit && !a.world;
      if (mh) {
        t.vx = (a.vx || 0) * 0.9;
        if (t.airborne || a.airborne) { t.vy = a.airborne && a.vy < 0 ? a.vy : Math.min(t.vy, -160); if (!t.airborne) t.y = -1; t.launched = true; }
        t.hitstun = Math.max(t.hitstun, (h.every || 3) * 2 + 14);
      }
      if (otg) { t.vy = -520; t.y = -1; t.launched = true; t.kdPending = true; t.otgUsed = true; t.vx = dir * 120; Game.popWorld(t.x, t.y - 90, 'OTG', '#ffb05a', 16); }
      // flip: thrown over the attacker to the other side
      if (h.flip && !a.world) { t.x = clamp(a.x - a.facing * (a.w / 2 + t.w / 2 + 24), 40, Arena.stage.width - 40); t.vx = -a.facing * Math.abs(h.kb[0]) * 0.4; t.facing = a.facing; }
    }
    // presentation
    const heavy = h.sfx === 'h' || dmg > 90, light = h.sfx === 'l';
    B.hitstop = Math.max(B.hitstop, heavy ? 10 : light ? 4 : 6);
    Cam.shake = Math.max(Cam.shake, heavy ? 10 : 4);
    if (heavy) Sfx.slam(); Sfx.hit();
    Game.fx.burst(cx - dir * t.w / 3, cy - 10, heavy ? 22 : 12, { color: ['#fff', '#ffe28a', a.def ? a.def.color : '#fff'], size: heavy ? 10 : 7, speed: heavy ? 520 : 380, glow: true, life: 0.35 });
    if (heavy) Game.fx.add({ x: cx, y: cy, vx: 0, vy: 0, life: 0.18, size: 60, color: '#fff', glow: true, grow: 300 });
    t.flash = 6;
    if (Save.set.dmgNums) Game.popWorld(cx + rand(-15, 15), t.y - t.h - 10, String(dmg), counter ? '#ff6a4a' : '#ffe28a', heavy ? 24 : 18);
    Arena.hit(t.x - 30, t.x + 30, t.y - 60, dmg * 0.3, Game.fx);
    if (h.ultConnect && !a.world) B.queueUlt(a, t, opts.move);
    if (t.hp <= 0) B.onKO(t, a, h);
    return 'hit';
  },

  // ---------- marks: stackable debuffs owned by an attacker, drawn above the target ----------
  mark(t, owner, name, n = 1, o = {}) {
    const cur = t.marks[name] || { n: 0 };
    const m = t.marks[name] = { n: Math.min(o.max || 9, cur.n + n), t: Math.round((o.dur || 6) * FPS), color: o.color || '#fff', owner, label: o.label || name, max: o.max || 9 };
    if (o.onMax && m.n >= m.max) o.onMax(t, owner, m);
    return m.n;
  },
  markCount(t, name) { return t.marks && t.marks[name] ? t.marks[name].n : 0; },
  consumeMark(t, name) { const n = this.markCount(t, name); if (t.marks) delete t.marks[name]; return n; },
  // ---------- zone strike: resolve one hit against every enemy overlapping a world rect ----------
  strikeZone(f, rect, hit, opts = {}) {
    let res = null;
    for (const t of this.targets(f.side)) {
      if (!rectsOverlap(rect, t.rect())) continue;
      const r = this.resolveHit(t, f, H_(Object.assign({ box: [0, 0, 1, 1] }, hit)), Object.assign({ move: f.move, fromX: f.x }, opts));
      if (r) { res = res === 'hit' ? res : r; if (opts.each) opts.each(t, r); }
    }
    if (res && !opts.noConnect) f.connected = res === 'hit' ? 'hit' : 'block';
    if (Save.set.hitboxes) Game.debugBoxes.push({ r: rect, col: 'rgba(255,40,40,0.35)' });
    return res;
  },
  // ground telegraph: fills up over `life` frames, then calls onFire(h)
  telegraph(owner, o) { return this.addHazard(Object.assign({ kind: 'telegraph', owner, side: owner.side, r: 90, life: 45, color: '#fff' }, o)); },
  counterTrigger(t, a) {
    const cm = t.move.counter; t.countering = false;
    Game.popWorld(t.x, t.y - t.h - 40, 'COUNTER STANCE!', t.def.color, 24); Sfx.clang();
    if (cm.resp === 'reflect') { a.state = 'hit'; a.move = null; a.hitstun = 40; a.vx = -a.facing * 700; t.move = null; t.state = 'stand'; return; }
    // teleport behind and strike
    t.x = clamp(a.x - a.facing * (a.w / 2 + t.w / 2 + 12), 40, Arena.stage.width - 40); t.y = Math.min(a.y, 0); t.faceOpp();
    t.move = { id: 'counterhit', name: 'Counter', kind: 'special', level: 3, pose: 'heavy', s: 2, a: 5, r: 18, inv: [0, 8], hit: H_({ dmg: cm.dmg, box: [-6, -120, 80, 120], hs: 34, kb: [700, -300], launch: true, wb: true, guard: 'unblock', sfx: 'h' }) };
    t.mf = 0; t.state = 'move'; t.connected = null; t.hitMap = new Map();
    a.invul = 0;
  },
  throwTech(v) {
    const a = v.grabbedBy; if (!a || !a.grabbing || !a.grabbing.techable) return;
    a.grabbing = null; a.move = null; v.grabbedBy = null;
    for (const f of [a, v]) { f.state = 'hit'; f.hitstun = 16; f.vx = (f.x < (a.x + v.x) / 2 ? -1 : 1) * 500; }
    Game.popWorld((a.x + v.x) / 2, v.y - 140, 'THROW TECH', '#9cf', 24); Sfx.clang(); Save.bump('techs');
  },
  grabStep(f) {
    const g = f.grabbing; if (!g) return; const v = g.victim; g.t++;
    const fx = f.facing, sc = f.scale;
    if (g.ult) { f.grabbing = null; v.state = 'hit'; v.hitstun = 60; Game.battle.queueUlt(f, v, f.move); return; }
    const place = (dx, dy) => { v.x = f.x + fx * dx * sc; v.y = Math.min(0, f.y + dy * sc); v.vx = 0; v.vy = 0; };
    const P = g.t / g.frames;
    switch (g.anim) {
      case 'slam': place(20, P < 0.6 ? -150 * P / 0.6 : -150 + (P - 0.6) / 0.4 * 150); f.move && (f.pose = P < 0.6 ? 'cast_up' : 'slam'); break;
      case 'suplex': { const a = Math.PI * P; place(Math.cos(a) * 60, -Math.sin(a) * 140); break; }
      case 'spin': { const a = P * Math.PI * 4; place(Math.cos(a) * 70, -80); break; }
      case 'drain': place(40, -10); if (g.t % 6 === 0) { const d = Math.round(g.dmg / (g.frames / 6)); v.hp = Math.max(1, v.hp - d); f.hp = Math.min(f.maxHp, f.hp + d * 0.6); Game.fx.burst(v.x, v.y - 60, 4, { color: ['#c01040', '#ff6a8a'], size: 5, speed: 200, glow: true, life: 0.4 }); } break;
      default: place(36, -40);
    }
    if (g.t >= g.frames) {
      f.grabbing = null; v.grabbedBy = null; v.state = 'stand';
      const kb = g.anim === 'spin' ? [900, -300] : g.anim === 'slam' ? [200, -500] : g.anim === 'suplex' ? [-300, -400] : g.anim === 'drain' ? [400, -200] : (g.kb || [520, -520]);
      if (g.anim === 'suplex') { v.x = f.x - fx * 60; }
      this.resolveHit(v, f, H_({ dmg: g.anim === 'drain' ? 20 : g.dmg, guard: 'unblock', hs: 34, kb, launch: true, kd: 'hard', wb: g.anim === 'spin', gb: g.anim === 'slam', sfx: 'h' }), { force: true, fromX: g.anim === 'suplex' ? v.x - fx : f.x, move: f.move });
      Cam.shake = 14; Arena.hit(v.x - 80, v.x + 80, -40, 100, Game.fx);
    }
  },

  // ---------- spawners used by moves ----------
  fireShots(f, p) {
    const n = p.count || 1;
    const [hx, hy] = p.from === 'mouth' ? f.mouth() : p.from === 'above' ? [f.x, f.y - f.h - 60] : f.hand();
    if (p.limit) { const own = this.projectiles.filter(q => q.owner === f && q.tag === p.tag); if (own.length >= p.limit) own[0].life = 0; }
    for (let i = 0; i < n; i++) {
      let a = (p.angle || 0) + (n > 1 ? -p.spread / 2 + p.spread * i / (n - 1) : 0);
      if (p.ultConnect && f.opp) { const o = f.opp; a += clamp(Math.atan2((o.y - o.h / 2) - hy, Math.max(40, Math.abs(o.x - hx))), -1.1, 1.1); }
      const sp = p.speed * (f.form && f.def.form.projSpeed || 1);
      this.projectiles.push(Object.assign({ kb: [180, -40], hs: 20, bs: 14, r: 11, dmg: 40 }, p, {
        owner: f, side: f.side, x: hx + (p.offX || 0) * f.facing, y: hy + (p.offY || 0), vx: Math.cos(a) * sp * f.facing, vy: Math.sin(a) * sp,
        tsFrozen: !!(Game.battle && Game.battle.timeStop && Game.battle.timeStop.by.side === f.side && !p.noFreeze), life: (p.life || 2) * FPS, t: 0, hitCount: 0, hitCd: 0, hitSet: new Set(), move: f.move, facing: f.facing,
      }));
    }
    Sfx.blast();
  },
  fireBeam(f, b) { this.beams.push({ owner: f, b, t: 0, move: f.move, tick: 0 }); Sfx.beam(b.dur / FPS); },
  teleport(f, to) {
    const o = f.opp; if (!o) return;
    Game.fx.burst(f.x, f.y - 60, 24, { color: [f.def.color, '#000'], size: 9, speed: 220, life: 0.45 });
    let x = f.x, y = f.y;
    if (to === 'behind') { x = o.x - o.facing * (o.w / 2 + f.w / 2 + 12); y = Math.min(o.y, 0); }
    else if (to === 'above') { x = o.x; y = o.y - 260; }
    else if (to === 'front') { x = o.x + o.facing * (o.w / 2 + f.w / 2 + 20); }
    else if (to === 'back') { x = f.x - f.facing * 360; }
    f.x = clamp(x, f.w / 2 + 10, Arena.stage.width - f.w / 2 - 10); f.y = y; f.vy = y < 0 ? 0 : f.vy; f.faceOpp();
    Game.fx.burst(f.x, f.y - 60, 24, { color: [f.def.color, '#fff'], size: 9, speed: 220, life: 0.45, glow: true });
    Sfx.teleport();
  },
  place(f, sp) {
    const o = f.opp;
    const n = sp.count || 1;
    for (let i = 0; i < n; i++) {
      let x = sp.at === 'enemy' ? o.x : sp.at === 'self' ? f.x : f.x + f.facing * (sp.dx || 120);
      x += (sp.spacing || 0) * (i - (n - 1) / 2) * f.facing + (sp.at === 'enemy' ? (sp.dx || 0) * f.facing : 0);
      if (sp.limit) { const own = this.hazards.filter(h => h.owner === f && h.kind === sp.kind); if (own.length >= sp.limit) own[0].life = 0; }
      const h = Object.assign({ owner: f, side: f.side, move: f.move }, sp, { x: clamp(x, 20, Arena.stage.width - 20), delay: (sp.delay || 0) + (sp.stagger || 0) * i, t: 0, hits: new Map(), facing: f.facing });
      if (h.kind === 'turret' || h.kind === 'minion' || h.kind === 'wall') h.hp = sp.hp || 150;
      if (h.kind === 'minion') { h.y = 0; h.vx = f.facing * (sp.speed || 260); }
      this.addHazard(h);
    }
    Sfx.teleport();
  },
  buff(f, eff, dur, name) {
    for (const [k, v] of Object.entries(eff)) {
      if (k === 'shield') { f.status.shield = v; f.status.shieldT = dur; }
      else if (k === 'heal') Combat.healSelf(f, v);
      else f.status[k] = dur;
    }
    Game.popWorld(f.x, f.y - f.h - 30, (name || 'POWER UP').toUpperCase(), f.def.color, 22);
    Game.fx.burst(f.x, f.y - 60, 30, { color: [f.def.color, '#fff'], size: 8, speed: 300, glow: true, life: 0.6 });
    Sfx.charge(0.4);
  },
  healSelf(f, amt) { const a = Math.min(amt, f.maxHp - f.hp); if (a <= 0) return; f.hp += a; f.red = Math.max(f.red, f.hp); Game.popWorld(f.x, f.y - f.h - 20, '+' + Math.round(a), '#7dff8a', 22); Sfx.heal(); },
  swap(f, o) { const t = f.opp; if (!t || t.state === 'ko') return; const x = f.x; f.x = t.x; t.x = x; t.status.confuse = o.confuse || 1.5; f.faceOpp(); Game.fx.burst(f.x, f.y - 60, 30, { color: [f.def.color, '#fff'], size: 10, speed: 260, glow: true }); Game.fx.burst(t.x, t.y - 60, 30, { color: [f.def.color, '#fff'], size: 10, speed: 260, glow: true }); if (o.dmg) this.resolveHit(t, f, H_({ dmg: o.dmg, guard: 'unblock', hs: 20, kb: [0, 0] }), { force: true }); },
  reflect(f) {
    for (const e of this.targets(f.side)) if (Math.abs(e.x - f.x) < 170 && e.state !== 'ko') { e.vx = Math.sign(e.x - f.x) * 800; if (e.state === 'move') { e.move = null; e.state = e.airborne ? 'air' : 'stand'; } }
    for (const p of this.projectiles) if (p.side !== f.side && Math.abs(p.x - f.x) < 220 && Math.abs(p.y - (f.y - 60)) < 120) { p.owner = f; p.side = f.side; p.vx = -p.vx; p.vy = -p.vy * 0.5; p.hitSet = new Set(); Ach.unlock('reflect'); }
    Game.fx.burst(f.x + f.facing * 40, f.y - 60, 20, { color: ['#9cf', '#fff'], size: 8, speed: 400, angle: f.facing > 0 ? 0 : Math.PI, spread: 1, glow: true, life: 0.35 });
    Sfx.clang();
  },

  // ---------- simulation ----------
  update() {
    const B = Game.battle;
    // projectiles
    const TS = B && B.timeStop;
    for (const p of this.projectiles.slice()) {
      if (!this.projectiles.includes(p)) continue;
      if (TS && (p.side !== TS.by.side || p.tsFrozen)) continue;
      p.t++;
      const tgt = p.owner.opp;
      if (p.homing && tgt && tgt.state !== 'ko') {
        const [tx, ty] = tgt.center(), a = Math.atan2(ty - p.y, tx - p.x), cur = Math.atan2(p.vy, p.vx);
        let d = a - cur; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
        const na = cur + clamp(d, -p.homing / FPS, p.homing / FPS), sp = Math.hypot(p.vx, p.vy);
        p.vx = Math.cos(na) * sp; p.vy = Math.sin(na) * sp;
      }
      if (p.boomerang && p.t > p.boomerang * FPS) { const [ox, oy] = p.owner.center(); const a = Math.atan2(oy - p.y, ox - p.x), sp = Math.hypot(p.vx, p.vy); p.vx = lerp(p.vx, Math.cos(a) * sp, 0.1); p.vy = lerp(p.vy, Math.sin(a) * sp, 0.1); if (Math.hypot(ox - p.x, oy - p.y) < 30) p.life = 0; }
      if (p.g) p.vy += p.g * Arena.stage.gravity / FPS;
      p.x += p.vx / FPS; p.y += p.vy / FPS; p.life--;
      if (p.trail !== false && B.frame % 2 === 0) Game.fx.add({ x: p.x, y: p.y, vx: -p.vx * 0.06 + rand(-20, 20), vy: rand(-20, 20), life: 0.25, size: p.r * 0.7, color: p.color, glow: true });
      let dead = p.life <= 0 || p.x < -100 || p.x > Arena.stage.width + 100 || p.y > 4 || p.y < -2000;
      if (p.y > -2 && p.g && !dead) dead = true;
      Arena.hit(p.x - 4, p.x + 4, p.y, 6, Game.fx);
      const pr = { x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 };
      for (const h of this.hazards) if (h.kind === 'wall' && h.side !== p.side && !dead && rectsOverlap(pr, this.wallRect(h))) { h.hp -= p.dmg; dead = true; Sfx.block(); }
      if (!dead) for (const t of this.targets(p.side)) {
        if (p.hitSet.has(t) && !(p.hits > 1 && p.hitCd <= 0)) continue;
        if (!rectsOverlap(pr, t.rect())) continue;
        if (t.state === 'sdash') { dead = true; Game.fx.burst(p.x, p.y, 8, { color: '#fff', size: 5, speed: 200, life: 0.3 }); break; }
        const r = this.resolveHit(t, p.owner, H_({ dmg: p.dmg, hs: p.hs, bs: p.bs || 14, kb: p.kb, launch: p.launch, status: p.status, stun: p.stun, guard: p.guard || 'mid', ultConnect: p.ultConnect, pull: p.pull, sfx: p.prio >= 2 ? 'h' : 'm', noScale: p.noScale }), { fromX: p.x - Math.sign(p.vx) * 10, proj: true, move: p.move });
        if (r) { p.hitSet.add(t); p.hitCount++; p.hitCd = 6; if (p.onHit && r === 'hit') p.onHit(t, p); if (!p.pierce && p.hitCount >= (p.hits || 1)) dead = true; }
      }
      p.hitCd--;
      if (!dead) for (const q of this.projectiles) if (q !== p && q.side !== p.side && !q.noClash && !p.noClash && Math.hypot(q.x - p.x, q.y - p.y) < p.r + q.r) {
        if ((q.prio || 1) === (p.prio || 1)) { q.life = 0; dead = true; } else if ((q.prio || 1) > (p.prio || 1)) dead = true; else q.life = 0;
      }
      if (!dead) for (const bm of this.beams) if (bm.owner.side !== p.side && this.beamHitsPoint(bm, p.x, p.y, p.r)) dead = true;
      if (dead) {
        if (p.explode) this.explode(p.x, Math.min(p.y, -10), p.explode, p.owner, p.explodeDmg || p.dmg * 0.6, p.color, p.hitSet);
        Game.fx.burst(p.x, p.y, 8, { color: [p.color, p.core || '#fff'], size: p.r * 0.8, speed: 250, glow: true, life: 0.3 });
        this.projectiles.splice(this.projectiles.indexOf(p), 1);
      }
    }
    // beams
    for (const bm of this.beams.slice()) {
      if (TS && bm.owner.side !== TS.by.side) continue;
      const f = bm.owner, b = bm.b; bm.t++;
      if (f.state !== 'move' || f.move !== bm.move || bm.t > b.dur || (B.struggle && B.struggle.beams.indexOf(bm) < 0 && false)) { this.beams.splice(this.beams.indexOf(bm), 1); continue; }
      if (B.struggle) continue;
      // struggle check
      for (const other of this.beams) if (other !== bm && other.owner.side !== f.side && b.super && other.b.super && other.owner.facing === -f.facing && !B.struggle) { B.startStruggle(bm, other); break; }
      bm.tick--;
      if (bm.tick <= 0) {
        bm.tick = b.tick;
        const [ox, oy] = this.beamOrigin(bm), ang = this.beamAngle(bm), L = b.len;
        Arena.hit(Math.min(ox, ox + Math.cos(ang) * L), Math.max(ox, ox + Math.cos(ang) * L), oy, 30, Game.fx);
        for (const t of this.targets(f.side)) {
          const [cx, cy] = t.center();
          if (!this.beamHitsRect(bm, t.rect())) continue;
          const r = this.resolveHit(t, f, H_({ dmg: b.dmg, hs: b.hs || 14, bs: 10, kb: b.kb || [140, -30], guard: 'mid', ultConnect: b.ultConnect, noScale: false, sfx: 'm' }), { fromX: ox, beam: true, move: bm.move });
          if (r) f.connected = f.connected === 'hit' ? 'hit' : r;
          if (r === 'hit' && b.ultConnect) bm.t = b.dur + 1;
          void cx; void cy;
        }
        Cam.shake = Math.max(Cam.shake, b.super ? 6 : 3);
      }
    }
    // hazards
    for (const h of this.hazards.slice()) {
      if (!this.hazards.includes(h)) continue;
      if (TS && h.side !== TS.by.side && h.kind !== 'telegraph') continue;
      h.t++;
      const fn = this.hz[h.kind];
      if (!fn || fn.call(this, h) === false || h.life === 0) { const i = this.hazards.indexOf(h); if (i >= 0) this.hazards.splice(i, 1); }
    }
  },
  beamOrigin(bm) { return bm.b.from === 'mouth' ? bm.owner.mouth() : bm.owner.hand(); },
  beamAngle(bm) {
    let a = bm.b.angle || 0;
    // ultimate beams track their target (within ~35°) so they can be comboed into juggles
    if (bm.b.ultConnect && bm.owner.opp) { const [ox, oy] = this.beamOrigin(bm), o = bm.owner.opp; a = clamp(Math.atan2((o.y - o.h / 2) - oy, Math.max(40, Math.abs(o.x - ox))), -0.6, 0.6); }
    return bm.owner.facing > 0 ? a : Math.PI - a;
  },
  beamHitsPoint(bm, x, y, r) { const [ox, oy] = this.beamOrigin(bm), a = this.beamAngle(bm); const dx = x - ox, dy = y - oy; const along = dx * Math.cos(a) + dy * Math.sin(a); if (along < 0 || along > bm.b.len) return false; const perp = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a)); return perp < bm.b.width / 2 + r; },
  beamHitsRect(bm, R) { for (let i = 0; i <= 4; i++) for (let j = 0; j <= 2; j++) if (this.beamHitsPoint(bm, R.x + R.w * j / 2, R.y + R.h * i / 4, 0)) return true; return false; },
  explode(x, y, r, owner, dmg, color, skip) {
    Game.fx.burst(x, y, 30, { color: [color, '#ffe28a', '#fff'], size: 14, speed: r * 3, glow: true, life: 0.5 });
    Sfx.boom(); Cam.shake = Math.max(Cam.shake, 8);
    Arena.hit(x - r, x + r, y, 60, Game.fx);
    for (const t of this.targets(owner.side)) { if (skip && skip.has(t)) continue; const [cx, cy] = t.center(); if (Math.hypot(cx - x, cy - y) < r + t.w / 2) this.resolveHit(t, owner, H_({ dmg, hs: 24, kb: [300, -380], launch: true, sfx: 'h' }), { fromX: x, proj: true }); }
  },
  wallRect(h) { return { x: h.x - (h.w || 40) / 2, y: -(h.hgt || 140) * Math.min(1, h.t / 8), w: h.w || 40, h: (h.hgt || 140) * Math.min(1, h.t / 8) }; },
  hitArea(h, rect, props) {
    const res = [];
    for (const t of this.targets(h.side)) {
      if (!rectsOverlap(rect, t.rect())) continue;
      // one-shot hazards hit each target once; `every` makes them re-hit on an interval
      if (h.hits.has(t) && (!h.every || h.t - h.hits.get(t) < h.every)) continue;
      const r = this.resolveHit(t, h.owner, H_(Object.assign({ dmg: h.dmg || 60, hs: 24, kb: [200, -600], launch: true, ultConnect: h.ultConnect, status: h.status, stun: h.stun, guard: h.guard || 'mid' }, props)), { fromX: h.x, proj: true, move: h.move });
      if (r) { h.hits.set(t, h.t); res.push(r); }
    }
    return res;
  },
  hz: {
    telegraph(h) { if (h.follow && h.follow.state !== 'ko') h.x = lerp(h.x, h.follow.x, h.track || 0); if (h.t >= h.life) { h.onFire && h.onFire(h); return false; } return true; },
    spike(h) { // erupts under a spot after delay
      const d = (h.delay || 0.45) * FPS;
      if (h.t === Math.round(d)) { Sfx.slam(); Game.fx.burst(h.x, 0, 18, { color: h.colors || [h.color || '#b36bff', '#fff'], size: 9, speed: 320, angle: -Math.PI / 2, spread: 0.5, life: 0.5 }); this.hitArea(h, { x: h.x - 30, y: -(h.height || 160), w: 60, h: h.height || 160 }, { kb: [60, -900], hs: 30 }); Arena.hit(h.x - 30, h.x + 30, -60, 40, Game.fx); }
      return h.t < d + 20;
    },
    wall(h) {
      if (h.t === 1 && h.dmg) this.hitArea(h, this.wallRect(Object.assign({}, h, { t: 8 })), { kb: [120, -800] });
      if (h.hp <= 0) { Game.fx.burst(h.x, -60, 30, { color: h.colors || ['#7a6a5a', '#554'], size: 10, speed: 300, g: 600, life: 0.8, shape: 'rect' }); Sfx.rock(); return false; }
      return h.t < (h.life || 4) * FPS;
    },
    wave(h) {
      h.x += h.dir * (h.speed || 820) / FPS;
      if (h.t % 2 === 0) Game.fx.add({ x: h.x, y: -5, vx: rand(-40, 40), vy: rand(-260, -120), life: 0.5, size: rand(6, 12), color: pick(h.colors || ['#776', '#998', '#554']), g: 700, shape: 'rect' });
      this.hitArea(h, { x: h.x - 30, y: -60, w: 60, h: 60 }, { kb: [300, -600], guard: 'low' });
      Arena.hit(h.x - 20, h.x + 20, -20, 6, Game.fx);
      return h.t < (h.life || 0.8) * FPS;
    },
    strike(h) { // from the sky
      const d = Math.round((h.delay || 0.4) * FPS);
      if (h.t === d) {
        h.style === 'bolt' ? Sfx.zap() : h.style === 'anvil' ? Sfx.clang() : h.style === 'meteor' ? Sfx.boom() : Sfx.heal();
        Cam.shake = Math.max(Cam.shake, 6);
        this.hitArea(h, { x: h.x - (h.wide || 34), y: -2000, w: (h.wide || 34) * 2, h: 2000 }, { kb: [60, -500], hs: 26, stun: h.stun });
        Arena.hit(h.x - 20, h.x + 20, -100, 60, Game.fx);
        Game.fx.burst(h.x, -6, 16, { color: [h.color || '#bff', '#fff'], size: 8, speed: 300, angle: -Math.PI / 2, spread: 1, glow: true, life: 0.4 });
      }
      return h.t < d + 16;
    },
    zone(h) {
      const d = (h.delay || 0) * FPS;
      if (h.follow) h.x = h.owner.x;
      if (h.t < d) return true;
      if ((h.t - d) % Math.round((h.every || 0.5) * FPS) === 0) {
        const own = h.owner;
        if (h.heal && !own.world && Math.abs(own.x - h.x) < h.r) Combat.healSelf(own, h.heal);
        if (h.dmg) for (const t of (own.world ? Game.battle.all() : this.targets(h.side))) if (Math.abs(t.x - h.x) < h.r + t.w / 2 && t.y > -h.r * 1.2) this.resolveHit(t, own, H_({ dmg: h.dmg, hs: 10, kb: [h.pull ? (h.x - t.x) * 1.5 : 40, 0], status: h.status, guard: 'unblock' }), { fromX: h.x, force: false, proj: true, noScale: true });
        if (h.pull) for (const t of this.targets(h.side)) if (Math.abs(t.x - h.x) < h.r * 1.6) t.x += Math.sign(h.x - t.x) * 10;
      }
      return h.t < d + (h.life || 3) * FPS && (h.owner.world || h.owner.hp > 0);
    },
    fall(h) {
      if (h.t < h.delay * FPS) return true;
      h.y += 1400 / FPS;
      if (h.t % 2 === 0) Game.fx.add({ x: h.x + rand(-10, 10), y: h.y, vx: 0, vy: -60, life: 0.4, size: rand(8, 16), color: h.look.glow, glow: true, grow: -10 });
      if (h.y >= -20) {
        for (const f of Game.battle.all()) if (Math.abs(f.x - h.x) < 55 + f.w / 2 && f.y > -220) this.resolveHit(f, WORLD_SRC, H_({ dmg: 70, hs: 26, kb: [260, -500], launch: true, guard: 'mid' }), { fromX: h.x, proj: true });
        Game.fx.burst(h.x, -10, 30, { color: [h.look.glow, h.look.rock, '#fff'], size: 12, speed: 380, life: 0.6, glow: true });
        Arena.hit(h.x - 50, h.x + 50, -30, 80, Game.fx); Sfx.rock(); Cam.shake = Math.max(Cam.shake, 8);
        return false;
      }
      return true;
    },
    turret(h) {
      const tgt = h.owner.opp; if (!tgt) return false;
      h.aim = Math.atan2(tgt.y - tgt.h / 2 - (-40), tgt.x - h.x);
      if (h.t % Math.round((h.rate || 0.9) * FPS) === 0 && tgt.state !== 'ko') {
        Sfx.tick();
        this.projectiles.push({ x: h.x + Math.cos(h.aim) * 22, y: -40 + Math.sin(h.aim) * 22, vx: Math.cos(h.aim) * 820, vy: Math.sin(h.aim) * 820, r: 6, dmg: h.shotDmg || 20, owner: h.owner, side: h.side, color: h.color || '#ffb020', core: '#fff', life: 90, kind: 'bolt', kb: [80, 0], hs: 12, t: 0, hitCount: 0, hitSet: new Set(), noClash: true });
      }
      for (const t of this.targets(h.side)) if (t.state === 'move' && t.move.hit && t.mf >= t.move.s && t.mf < t.move.s + t.move.a && rectsOverlap(this.hitRect(t, t.move.hit), { x: h.x - 18, y: -60, w: 36, h: 60 })) h.hp -= 40;
      if (h.hp <= 0) { this.explode(h.x, -30, 40, h.owner, 0, '#ffb020'); return false; }
      return h.t < (h.life || 8) * FPS && h.owner.hp > 0;
    },
    minion(h) { // walks toward enemy, hits once, crumbles
      const tgt = h.owner.opp; if (!tgt) return false;
      const d = Math.sign(tgt.x - h.x) || 1; h.facing = d;
      h.x += d * (h.speed || 240) / FPS;
      if (Math.abs(tgt.x - h.x) < 50 && !h.struck) { h.struck = true; this.hitArea(h, { x: h.x - 40, y: -110, w: 80, h: 110 }, { kb: [240, -200], hs: 22, launch: false, dmg: h.dmg || 50 }); Game.fx.burst(h.x, -60, 16, { color: [h.color || '#9f9', '#fff'], size: 7, speed: 300, life: 0.4 }); }
      for (const t of this.targets(h.side)) if (t.state === 'move' && t.move.hit && t.mf >= t.move.s && t.mf < t.move.s + t.move.a && rectsOverlap(this.hitRect(t, t.move.hit), { x: h.x - 20, y: -100, w: 40, h: 100 })) h.hp = 0;
      if (h.hp <= 0 || h.struck && h.t > 20 + (h.hitT || (h.hitT = h.t))) { Game.fx.burst(h.x, -50, 20, { color: [h.color || '#9f9', '#555'], size: 8, speed: 260, life: 0.5, shape: 'rect' }); return false; }
      return h.t < (h.life || 6) * FPS;
    },
    mine(h) {
      if (h.t > 20) for (const t of this.targets(h.side)) if (Math.abs(t.x - h.x) < 30 + t.w / 2 && !t.airborne) { this.explode(h.x, -16, h.radius || 80, h.owner, h.dmg || 90, h.color || '#ff5a3a'); return false; }
      return h.t < (h.life || 10) * FPS;
    },
    trap(h) { // web / snare: roots anyone who touches it
      if (h.t > 10) for (const t of this.targets(h.side)) if (Math.abs(t.x - h.x) < 40 + t.w / 2 && t.y > -40 && t.state !== 'hit') { t.status.stun = h.stun || 0.9; t.status.slow = 2; this.resolveHit(t, h.owner, H_({ dmg: h.dmg || 30, guard: 'unblock', hs: 10, kb: [0, 0] }), { fromX: h.x, proj: true, noScale: true }); Game.popWorld(t.x, t.y - t.h - 20, 'SNARED!', h.color || '#ddd', 20); return false; }
      return h.t < (h.life || 8) * FPS;
    },
    blackhole(h) {
      const d = (h.delay || 0.3) * FPS;
      if (h.t > d) for (const t of this.targets(h.side)) { const dx = h.x - t.x; if (Math.abs(dx) < (h.r || 300)) { t.x += Math.sign(dx) * 8; if (!t.airborne && Math.abs(dx) < 50 && h.t % 12 === 0) this.resolveHit(t, h.owner, H_({ dmg: h.dmg || 14, guard: 'unblock', hs: 14, kb: [0, 0] }), { fromX: h.x, proj: true, noScale: true }); } }
      return h.t < d + (h.life || 2) * FPS;
    },
    pickup(h) {
      if (h.y < -20) { h.vy += 1400 / FPS; h.y += h.vy / FPS; if (h.y > -20) h.y = -20; }
      for (const f of Game.battle.points()) if (Math.abs(f.x - h.x) < 50 && f.y > h.y - 80) { Combat.healSelf(f, h.heal || 90); Game.popWorld(f.x, f.y - f.h - 40, 'YUM!', '#7dff6a', 22); return false; }
      return h.t < (h.life || 10) * FPS;
    },
    clone(h) { // shadow copy performs the owner's 5S after a delay
      if (h.t === Math.round((h.delay || 0.3) * FPS)) { const m = h.owner.def.moves[h.slot || '5S']; if (m && m.ev) { const fake = Object.assign(Object.create(h.owner), { x: h.x, y: 0, facing: h.facing, move: m, isClone: true, hand() { return [this.x + this.facing * 42, -80]; }, mouth() { return [this.x + this.facing * 25, -86]; } }); for (const k in m.ev) Game.later(Number(k) / FPS, () => { try { m.ev[k](fake, m); } catch (e) { console.warn(e); } }); } }
      return h.t < 50;
    },
  },

  // ---------- drawing ----------
  drawBack(c, t) { for (const h of this.hazards) this.drawHz[h.kind] && this.drawHz[h.kind].call(this, c, h, t); },
  drawFront(c, t) {
    c.globalCompositeOperation = 'lighter';
    for (const bm of this.beams) this.drawBeam(c, bm, t);
    c.globalCompositeOperation = 'source-over';
    for (const p of this.projectiles) this.drawProj(c, p, t);
  },
  drawBeam(c, bm, t) {
    const b = bm.b, [ox, oy] = this.beamOrigin(bm), a = this.beamAngle(bm);
    const k = Math.min(1, bm.t / 6) * (1 - seg(bm.t, b.dur - 8, b.dur));
    const L = Game.battle.struggle && Game.battle.struggle.beams.includes(bm) ? Game.battle.struggleLen(bm) : b.len;
    const wd = b.width * (0.85 + Math.sin(t * 60) * 0.1) * k;
    c.save(); c.translate(ox, oy); c.rotate(a);
    const g = c.createLinearGradient(0, -wd, 0, wd);
    g.addColorStop(0, hexA(b.color, 0)); g.addColorStop(0.3, hexA(b.color, 0.85)); g.addColorStop(0.5, '#ffffff'); g.addColorStop(0.7, hexA(b.color, 0.85)); g.addColorStop(1, hexA(b.color, 0));
    c.fillStyle = g; c.fillRect(0, -wd, L, wd * 2);
    glowCircle(c, 0, 0, wd * 1.6 + 10, 'rgba(255,255,255,0.9)', hexA(b.color, 0));
    glowCircle(c, L, 0, wd * 1.4, hexA(b.color, 0.9), hexA(b.color, 0));
    c.restore();
  },
  drawProj(c, p, t) {
    const ang = Math.atan2(p.vy, p.vx);
    c.save(); c.translate(p.x, p.y);
    const add = () => { c.globalCompositeOperation = 'lighter'; };
    switch (p.kind) {
      case 'shard': c.rotate(ang); c.fillStyle = '#e8fbff'; c.strokeStyle = '#6ac'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p.r * 1.8, 0); c.lineTo(-p.r, -p.r * 0.6); c.lineTo(-p.r * 0.5, 0); c.lineTo(-p.r, p.r * 0.6); c.closePath(); c.fill(); c.stroke(); break;
      case 'rock': c.rotate(p.t * 0.15); c.fillStyle = p.color; c.strokeStyle = OUTLINE; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = p.r * (0.8 + ((i * 37) % 5) / 12); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); break;
      case 'kunai': case 'knife': c.rotate(ang); c.fillStyle = '#ccd'; c.beginPath(); c.moveTo(16, 0); c.lineTo(0, -4); c.lineTo(0, 4); c.fill(); c.fillStyle = p.color; c.fillRect(-12, -1.5, 12, 3); break;
      case 'card': c.rotate(p.t * 0.25); c.fillStyle = '#fff'; c.fillRect(-7, -10, 14, 20); c.fillStyle = p.color; c.fillRect(-3, -4, 6, 8); c.strokeStyle = '#222'; c.lineWidth = 1; c.strokeRect(-7, -10, 14, 20); break;
      case 'missile': c.rotate(ang); c.fillStyle = '#ddd'; c.fillRect(-10, -3.5, 18, 7); c.fillStyle = '#e33'; c.beginPath(); c.moveTo(8, -3.5); c.lineTo(14, 0); c.lineTo(8, 3.5); c.fill(); add(); glowCircle(c, -12, 0, 9, 'rgba(255,170,40,1)'); break;
      case 'spear': c.rotate(ang); add(); c.fillStyle = hexA(p.color, 0.5); c.fillRect(-40, -5, 60, 10); c.fillStyle = '#fff'; c.fillRect(-36, -2, 56, 4); c.beginPath(); c.moveTo(34, 0); c.lineTo(18, -7); c.lineTo(18, 7); c.fill(); break;
      case 'ring': case 'note': c.rotate(ang); c.strokeStyle = hexA(p.color, 0.9); c.lineWidth = 4; for (let i = 0; i < 3; i++) { c.globalAlpha = 1 - i * 0.3; c.beginPath(); c.arc(-i * 10, 0, p.r + i * 3, -1, 1); c.stroke(); } if (p.kind === 'note') { c.globalAlpha = 1; c.fillStyle = p.color; circle(c, -4, 6, 5, p.color); c.fillRect(0, -12, 3, 18); } break;
      case 'bolt': c.rotate(ang); c.strokeStyle = p.color; c.lineWidth = 3; add(); c.beginPath(); c.moveTo(p.r, 0); for (let i = 1; i < 5; i++) c.lineTo(p.r - i * 7, rand(-5, 5)); c.stroke(); glowCircle(c, 0, 0, p.r * 1.8, hexA(p.color, 0.7)); break;
      case 'hook': c.restore(); c.save(); { const [hx, hy] = p.owner.hand(); c.strokeStyle = '#666'; c.lineWidth = 3; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(hx, hy); c.lineTo(p.x, p.y); c.stroke(); c.setLineDash([]); } c.translate(p.x, p.y); c.rotate(ang); c.fillStyle = p.color; c.beginPath(); c.moveTo(12, 0); c.lineTo(-4, -8); c.lineTo(0, 0); c.lineTo(-4, 8); c.fill(); break;
      case 'web': c.strokeStyle = '#eee'; c.lineWidth = 1.2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * 1.047) * p.r * 1.6, Math.sin(i * 1.047) * p.r * 1.6); c.stroke(); } for (const r of [0.6, 1.2]) { c.beginPath(); c.arc(0, 0, p.r * r, 0, Math.PI * 2); c.stroke(); } break;
      case 'bubble': c.strokeStyle = hexA(p.color, 0.9); c.lineWidth = 2; c.fillStyle = hexA(p.color, 0.25); c.beginPath(); c.arc(0, 0, p.r, 0, Math.PI * 2); c.fill(); c.stroke(); circle(c, -p.r * 0.35, -p.r * 0.35, p.r * 0.2, 'rgba(255,255,255,0.8)'); break;
      case 'ball': c.rotate(p.t * 0.3); circle(c, 0, 0, p.r, '#fff'); c.strokeStyle = '#111'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, p.r, 0, Math.PI * 2); c.stroke(); c.fillStyle = '#111'; c.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; c.lineTo(Math.cos(a) * p.r * 0.4, Math.sin(a) * p.r * 0.4); } c.fill(); break;
      case 'skull': circle(c, 0, 0, p.r, '#eee8d8'); circle(c, -p.r * 0.3, -p.r * 0.1, p.r * 0.25, '#111'); circle(c, p.r * 0.3, -p.r * 0.1, p.r * 0.25, '#111'); add(); glowCircle(c, 0, 0, p.r * 2, hexA(p.color, 0.5)); break;
      case 'bat': c.scale(Math.sign(p.vx) || 1, 1); c.fillStyle = '#1a0a14'; const fl = Math.sin(p.t * 0.8) * 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(-14, -8 - fl); c.lineTo(-8, 0); c.lineTo(-14, 6); c.lineTo(0, 3); c.lineTo(14, 6); c.lineTo(8, 0); c.lineTo(14, -8 - fl); c.closePath(); c.fill(); circle(c, 2, -1, 1.5, '#f33'); break;
      case 'star': c.rotate(p.t * 0.2); c.fillStyle = p.color; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? p.r * 0.45 : p.r, a = i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); add(); glowCircle(c, 0, 0, p.r * 2, hexA(p.color, 0.5)); break;
      case 'crescent': c.rotate(ang); add(); c.strokeStyle = hexA(p.color, 0.95); c.lineWidth = p.r * 0.5; c.beginPath(); c.arc(-p.r * 0.5, 0, p.r * 1.3, -1.1, 1.1); c.stroke(); break;
      case 'petal': case 'leaf': c.rotate(p.t * 0.2); c.fillStyle = p.color; c.beginPath(); c.ellipse(0, 0, p.r, p.r * 0.45, 0, 0, Math.PI * 2); c.fill(); break;
      case 'pixel': c.fillStyle = p.color; c.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); c.fillStyle = '#fff'; c.fillRect(-p.r, -p.r, p.r, p.r); break;
      case 'bullet': c.rotate(ang); c.fillStyle = '#ffd35a'; c.fillRect(-6, -2, 12, 4); add(); c.fillStyle = hexA(p.color, 0.4); c.fillRect(-30, -1, 30, 2); break;
      case 'money': c.rotate(p.t * 0.2); c.fillStyle = '#5a9a4a'; c.fillRect(-10, -5, 20, 10); c.fillStyle = '#fff'; c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', 0, 0); break;
      case 'hammer': c.rotate(p.t * 0.35); c.fillStyle = '#6b4a2a'; c.fillRect(-2, 0, 4, 22); c.fillStyle = p.color; c.fillRect(-10, -8, 20, 12); add(); glowCircle(c, 0, 0, 22, hexA(p.color, 0.4)); break;
      case 'bomb': circle(c, 0, 0, p.r, '#222'); c.strokeStyle = '#a86'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -p.r); c.lineTo(4, -p.r - 6); c.stroke(); add(); glowCircle(c, 4, -p.r - 7, 6 + Math.sin(p.t) * 2, 'rgba(255,200,60,1)'); break;
      case 'snake': c.rotate(ang); c.strokeStyle = p.color; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i < 6; i++) c.lineTo(-i * 7, Math.sin(p.t * 0.5 + i) * 5); c.stroke(); circle(c, 2, 0, 5, p.color); circle(c, 4, -2, 1.3, '#ff0'); break;
      case 'ink': c.fillStyle = '#140a20'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = p.r * (0.7 + (i % 2) * 0.4); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); break;
      case 'sand': c.fillStyle = hexA(p.color, 0.7); for (let i = 0; i < 6; i++) circle(c, rand(-p.r, p.r), rand(-p.r, p.r), 3, hexA(p.color, 0.7)); break;
      case 'fire': add(); glowCircle(c, 0, 0, p.r * 2.4, hexA(p.color, 0.9), 'rgba(255,40,0,0)'); circle(c, 0, 0, p.r * 0.5, '#fff6c0'); break;
      case 'poison': add(); glowCircle(c, 0, 0, p.r * 2.2, hexA(p.color, 0.8)); c.globalCompositeOperation = 'source-over'; circle(c, 0, 0, p.r * 0.6, shadeHex(p.color, -0.3)); break;
      case 'gear': c.rotate(p.t * 0.3); circle(c, 0, 0, p.r, p.color); c.fillStyle = p.color; for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4); c.fillRect(-2.5, -p.r - 4, 5, 6); c.restore(); } circle(c, 0, 0, p.r * 0.35, '#222'); break;
      case 'food': c.rotate(p.t * 0.2); circle(c, 0, 0, p.r, p.color); c.fillStyle = '#6a3'; c.fillRect(-1, -p.r - 4, 2, 5); break;
      default: add(); glowCircle(c, 0, 0, p.r * 2.6, p.color, 'rgba(0,0,0,0)'); circle(c, 0, 0, p.r * 0.6, p.core || '#fff');
    }
    c.restore(); c.globalCompositeOperation = 'source-over';
  },
  drawHz: {
    telegraph(c, h) {
      const k = Math.min(1, h.t / h.life);
      c.save(); c.strokeStyle = hexA(h.color, 0.9); c.lineWidth = 3; c.setLineDash([10, 6]); c.lineDashOffset = -h.t * 2;
      c.beginPath(); c.ellipse(h.x, -2, h.r, h.r * 0.22, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      c.fillStyle = hexA(h.color, 0.18 + 0.3 * k); c.beginPath(); c.ellipse(h.x, -2, h.r * k, h.r * 0.22 * k, 0, 0, Math.PI * 2); c.fill();
      if (h.column) { c.fillStyle = hexA(h.color, 0.06 + 0.12 * k); c.fillRect(h.x - h.r * 0.5, -900, h.r, 900); }
      c.restore();
    },
    spike(c, h) {
      const d = (h.delay || 0.45) * FPS;
      if (h.t < d) { ellipse(c, h.x, 4, 34, 8, hexA(h.tele || h.color || '#b36bff', 0.3 + h.t / d * 0.5)); return; }
      const p = seg(h.t, d, d + 5) * (1 - seg(h.t, d + 12, d + 20)), ht = h.height || 160;
      c.fillStyle = h.fill || shadeHex(h.color || '#3a1a52', -0.4);
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(h.x + k * 12 - 9, 0); c.lineTo(h.x + k * 11, -(ht - Math.abs(k) * 30) * p); c.lineTo(h.x + k * 12 + 9, 0); c.fill(); }
      if (h.glow !== false) { c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -ht * p * 0.5, 50, hexA(h.color || '#b36bff', 0.4)); c.globalCompositeOperation = 'source-over'; }
    },
    wall(c, h) {
      const r = this.wallRect(h);
      if (h.style === 'ice') { const g = c.createLinearGradient(r.x, 0, r.x + r.w, 0); g.addColorStop(0, 'rgba(200,245,255,0.9)'); g.addColorStop(1, 'rgba(90,160,220,0.8)'); c.fillStyle = g; c.beginPath(); c.moveTo(r.x, 0); c.lineTo(r.x + 4, r.y + 20); c.lineTo(r.x + r.w / 2, r.y); c.lineTo(r.x + r.w - 4, r.y + 14); c.lineTo(r.x + r.w, 0); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
      else if (h.style === 'light') { c.globalCompositeOperation = 'lighter'; c.fillStyle = hexA(h.color || '#ffe08a', 0.35); c.fillRect(r.x, r.y, r.w, r.h); c.strokeStyle = hexA(h.color || '#ffe08a', 0.9); c.lineWidth = 2; c.strokeRect(r.x, r.y, r.w, r.h); c.globalCompositeOperation = 'source-over'; }
      else { c.fillStyle = h.color || '#6b5a48'; c.strokeStyle = OUTLINE; c.lineWidth = 3; c.beginPath(); c.moveTo(r.x, 0); c.lineTo(r.x + 6, r.y + 10); c.lineTo(r.x + r.w * 0.6, r.y); c.lineTo(r.x + r.w, r.y + 16); c.lineTo(r.x + r.w, 0); c.fill(); c.stroke(); }
    },
    wave(c, h) { c.fillStyle = h.fill || 'rgba(255,230,160,0.5)'; c.beginPath(); c.moveTo(h.x - 40, 0); c.quadraticCurveTo(h.x, -60, h.x + 40, 0); c.fill(); },
    fall(c, h, t) {
      ellipse(c, h.x, 4, 55, 10, hexA(h.look.glow, 0.25 + 0.3 * Math.abs(Math.sin(t * 12))));
      if (h.t < h.delay * FPS) return;
      if (h.look.box) { c.fillStyle = h.look.rock; c.fillRect(h.x - 50, h.y - 40, 100, 40); c.strokeStyle = '#222'; c.lineWidth = 2; c.strokeRect(h.x - 50, h.y - 40, 100, 40); return; }
      if (h.look.icicle) { c.fillStyle = '#dff'; c.beginPath(); c.moveTo(h.x - 14, h.y - 70); c.lineTo(h.x + 14, h.y - 70); c.lineTo(h.x, h.y); c.fill(); return; }
      if (h.look.chandelier) { c.strokeStyle = '#886'; c.lineWidth = 3; c.beginPath(); c.moveTo(h.x, h.y - 400); c.lineTo(h.x, h.y - 40); c.stroke(); c.fillStyle = '#aa9a50'; c.beginPath(); c.ellipse(h.x, h.y - 30, 60, 16, 0, 0, Math.PI * 2); c.fill(); for (let i = -2; i <= 2; i++) { c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x + i * 24, h.y - 50, 14, 'rgba(255,220,120,0.9)'); c.globalCompositeOperation = 'source-over'; } return; }
      c.fillStyle = h.look.rock; c.beginPath(); c.arc(h.x, h.y, 26, 0, Math.PI * 2); c.fill(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 50, hexA(h.look.glow, 0.7)); c.globalCompositeOperation = 'source-over';
    },
    strike(c, h, t) {
      const d = Math.round((h.delay || 0.4) * FPS), col = h.color || '#bff';
      if (h.t < d) { ellipse(c, h.x, 4, 34, 8, hexA(col, 0.25 + 0.5 * h.t / d)); c.fillStyle = hexA(col, 0.08); c.fillRect(h.x - 3, -2000, 6, 2000); return; }
      const k = 1 - seg(h.t, d, d + 16);
      c.globalCompositeOperation = 'lighter';
      if (h.style === 'bolt') { c.strokeStyle = hexA(col, k); c.lineWidth = 7; c.beginPath(); let x = h.x; c.moveTo(x, -1600); for (let y = -1600; y < 0; y += 60) { x = h.x + rand(-22, 22); c.lineTo(x, y); } c.lineTo(h.x, 0); c.stroke(); c.strokeStyle = `rgba(255,255,255,${k})`; c.lineWidth = 2.5; c.stroke(); }
      else if (h.style === 'anvil') { c.globalCompositeOperation = 'source-over'; const y = lerp(-900, -44, Math.min(1, (h.t - d + 4) / 6)); c.fillStyle = '#333'; c.fillRect(h.x - 40, y, 80, 22); c.fillRect(h.x - 20, y + 22, 40, 14); c.fillRect(h.x - 32, y + 34, 64, 10); }
      else if (h.style === 'meteor') { const y = lerp(-900, -20, Math.min(1, (h.t - d + 6) / 6)); glowCircle(c, h.x, y, 60, hexA(col, k)); circle(c, h.x, y, 22, '#3a2218'); }
      else { const w = h.wide || 34; const g = c.createLinearGradient(h.x - w, 0, h.x + w, 0); g.addColorStop(0, hexA(col, 0)); g.addColorStop(0.5, hexA(col, k)); g.addColorStop(1, hexA(col, 0)); c.fillStyle = g; c.fillRect(h.x - w, -1600, w * 2, 1600); }
      c.globalCompositeOperation = 'source-over';
    },
    zone(c, h, t) {
      const d = (h.delay || 0) * FPS;
      if (h.t < d) { ellipse(c, h.x, 3, h.r, h.r * 0.2, hexA(h.color, 0.2 + 0.3 * Math.abs(Math.sin(t * 10)))); return; }
      const a = Math.min(1, (h.t - d) / 10) * (1 - seg(h.t, d + (h.life || 3) * FPS - 15, d + (h.life || 3) * FPS));
      c.globalCompositeOperation = 'lighter';
      c.save(); c.translate(h.x, 0); c.scale(1, 0.25); c.strokeStyle = hexA(h.color, 0.8 * a); c.lineWidth = 6; c.beginPath(); c.arc(0, 0, h.r, 0, Math.PI * 2); c.stroke(); glowCircle(c, 0, 0, h.r, hexA(h.color, 0.25 * a), hexA(h.color, 0)); c.restore();
      c.fillStyle = hexA(h.color, 0.07 * a); c.fillRect(h.x - h.r, -h.r * 0.9, h.r * 2, h.r * 0.9);
      if (t * 60 % 2 < 1) Game.fx.add({ x: h.x + rand(-h.r, h.r), y: 0, vx: 0, vy: rand(-120, -50), life: 0.7, size: rand(2, 4), color: h.color, glow: true });
      c.globalCompositeOperation = 'source-over';
    },
    turret(c, h, t) {
      c.fillStyle = '#556'; c.strokeStyle = OUTLINE; c.lineWidth = 2;
      c.beginPath(); c.moveTo(h.x - 18, 0); c.lineTo(h.x, -28); c.lineTo(h.x + 18, 0); c.fill(); c.stroke();
      circle(c, h.x, -40, 14, h.body || '#7a8594'); c.save(); c.translate(h.x, -40); c.rotate(h.aim || 0); c.fillStyle = '#334'; c.fillRect(0, -4, 24, 8); c.restore();
      c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -40, 6 + Math.sin(t * 10) * 2, hexA(h.color || '#ffb020', 1)); c.globalCompositeOperation = 'source-over';
    },
    minion(c, h, t) {
      const sk = h.look || 'skeleton', d = h.facing || 1;
      c.save(); c.translate(h.x, 0); c.scale(d * 0.85, 0.85);
      const v = { pose: h.struck ? 'punch' : 'walk', anim: t };
      if (sk === 'skeleton') makeModelDraw(MINION_MODELS.skeleton)(c, v);
      else if (sk === 'goon') makeModelDraw(MINION_MODELS.goon)(c, v);
      else if (sk === 'bot') makeModelDraw(MINION_MODELS.bot)(c, v);
      else if (sk === 'lion') makeModelDraw(MINION_MODELS.lion)(c, v);
      else makeModelDraw(MINION_MODELS.plant)(c, v);
      c.restore();
    },
    mine(c, h, t) { circle(c, h.x, -8, 10, h.body || '#333'); circle(c, h.x, -12, 3, Math.sin(t * 12) > 0 ? (h.color || '#f33') : '#600'); },
    trap(c, h) { c.strokeStyle = h.color || '#eee'; c.lineWidth = 1.2; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(h.x, -30); c.lineTo(h.x + Math.cos(i * 0.9) * 40, -30 + Math.sin(i * 0.9) * 30); c.stroke(); } c.beginPath(); c.ellipse(h.x, -30, 30, 20, 0, 0, Math.PI * 2); c.stroke(); },
    blackhole(c, h, t) { const d = (h.delay || 0.3) * FPS; const k = Math.min(1, h.t / d); drawBlackHole(c, h.x, -140, 36 * k, t); },
    pickup(c, h, t) { const y = h.y + Math.sin(t * 4) * 4; circle(c, h.x, y, 14, '#ff5a3a'); circle(c, h.x - 4, y - 5, 4, 'rgba(255,255,255,0.6)'); c.fillStyle = '#3a8a2a'; c.fillRect(h.x - 1, y - 20, 3, 8); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, y, 30, 'rgba(120,255,120,0.4)'); c.globalCompositeOperation = 'source-over'; },
    clone(c, h) { c.save(); c.globalAlpha = 0.5; c.translate(h.x, 0); c.scale(h.facing * h.owner.scale, h.owner.scale); h.owner.def.draw(c, { pose: 'cast', anim: h.t / 60, transformed: h.owner.form, alt: h.owner.alt }); c.restore(); },
  },
};

const MINION_MODELS = {
  skeleton: { skin: '#eee8d8', top: '#ddd6c4', pants: '#ccc4b0', boots: '#aaa', animal: { type: 'skull', color: '#eee8d8' }, build: 'slim' },
  goon: { skin: '#d0a080', top: '#222', pants: '#222', boots: '#111', hat: { type: 'cap', color: '#333' }, mask: { type: 'shades', color: '#111' }, weapon: { type: 'baton', color: '#555' } },
  bot: { skin: '#9aa4b0', top: '#7a8594', pants: '#556', boots: '#333', animal: { type: 'robot', color: '#9aa4b0', eye: 'rgba(80,220,255,1)' } },
  lion: { skin: '#d0a050', top: '#c89040', pants: '#b08030', boots: '#8a6020', animal: { type: 'lion', color: '#d0a050', mane: '#8a4a1a' } },
  plant: { skin: '#5a9a4a', top: '#3a7a2a', pants: '#2a5a1a', boots: '#2a3a1a', hair: { type: 'wild', color: '#8ada5a' }, eyes: { glow: '#ff5aaa' } },
};
