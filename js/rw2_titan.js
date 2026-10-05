// ============================================================
//  MOONKAI — TITAN, the Unbreakable. Pixel remake + a real kit.
//
//  GRIT (new gauge)   fills from the hits he takes (armored or not) and the hits he lands. Full GRIT = UNSTOPPABLE for 5s:
//                     every move has super armor and he deals +25%.
//  FLEX (4S)          now also +25 GRIT.     SHOULDER CHARGE (6S)  armored all the way and bounces the foe off the wall.
//  IRON COLOSSUS      COLOSSUS GRIP (5S) a longer, harder grab,  WRECKING CHARGE (6S) plows through projectiles,
//                     EARTHQUAKE CLAP (2S) a shockwave both ways,  IRON ROAR (4S) armor and a shove,  METEOR DROP (jS).
//  WORLD BREAKER (form ult)   he punches the ground until the stage breaks.     METEOR SUPLEX & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('titan');
  Object.assign(Sfx, {
    tiSlam(d = 0) { this.impact(1, d); this.sub({ f: 70, to: 26, dur: .6, vol: .55, delay: d }); this.nsweep({ f0: 1400, f1: 80, dur: .5, vol: .2, type: 'lowpass', delay: d }); },
    tiGrunt(d = 0) { this.voice({ f: 120, to: 70, dur: .35, vol: .3, type: 'sawtooth', lp: 700, n: 3, det: 20, delay: d, wet: .2 }); },
    tiClang(d = 0) { this.fm({ f: 380, ratio: 2.93, index: 300, dur: .7, vol: .2, delay: d, wet: .4 }); this.nsweep({ f0: 4000, f1: 1200, dur: .15, vol: .12, delay: d }); },
    tiRoar(d = 0, dur = 1.5) { this.voice({ f: 100, to: 56, dur, vol: .36, type: 'sawtooth', lp: 800, n: 4, det: 30, delay: d, wet: .4 }); this.sub({ f: 55, to: 28, dur: dur * .8, vol: .4, delay: d }); },
    tiQuake(d = 0) { this.rumble ? this.rumble(1.2, .4, d) : this.impact(1, d); this.tiSlam(d + .1); },
    tiCharge(d = 0) { for (let i = 0; i < 6; i++) this.sub({ f: 70 + (i % 2) * 8, to: 36, dur: .16, vol: .3, delay: d + i * .09 }); },
  });
  PxModel.install(def, { extra: { front(g, P, s, m) { if (s.atk) { const [hx, hy] = P.fH; g.line([[hx + 4, hy - 6], [hx + 26, hy - 10]], '#fff3c0', 1.6); g.line([[hx + 4, hy + 4], [hx + 24, hy + 8]], '#fff3c0', 1.4); } } } });

  // ---- GRIT ----
  Rw2.merge(def, {
    gauge: { name: 'GRIT', max: 100, color: '#e0a020', label: f => (f.unstopT > 0 ? '· UNSTOPPABLE' : '') },
    passive: ['Grit', 'Hits he takes and lands fill GRIT. Full GRIT = UNSTOPPABLE for 5s: super armor on everything and +25% damage.'],
    onRoundStart: f => { f.gauge = 0; f.unstopT = 0; },
    onHurt: (t, a, dmg) => { if (!(t.unstopT > 0)) t.gauge = Math.min(100, (t.gauge || 0) + dmg * .06); },
    onHit: (a, t, dmg) => { if (!(a.unstopT > 0)) a.gauge = Math.min(100, (a.gauge || 0) + dmg * .04); },
    passiveDmg: f => (f.unstopT > 0 ? 1.25 : 1),
    passiveTick: f => {
      if (f.unstopT > 0) { f.unstopT--; f.status.armor = Math.max(f.status.armor || 0, .1); if (f.st % 10 === 0) Game.fx.burst(f.x, f.y - 90, 3, { color: ['#ffd35a', '#fff'], size: 6, speed: 160, life: .3, glow: true }); }
      else if ((f.gauge || 0) >= 100) { f.gauge = 0; f.unstopT = 5 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'UNSTOPPABLE', '#ffd35a', 26); sfx('tiRoar', 0, 1.1); Cam.shake = 8; }
    },
  });
  PxKit.setMove(def, '4S', Mv.buff({ name: 'Flex', desc: 'Super armor for 3s, and +25 GRIT.', effects: { armor: true }, dur: 3, cd: 8, ev: { 6: () => sfx('tiGrunt') }, onStart: f => { f.gauge = Math.min(100, (f.gauge || 0) + 25); } }));
  PxKit.setMove(def, '6S', Mv.rush({ name: 'Shoulder Charge', desc: 'An armored charge all the way; the foe bounces off the wall.', s: 10, speed: 1050, frames: 20, armor: [1, 30], hit: { dmg: 104, kb: [640, -240], wb: true }, ev: { 1: () => sfx('tiCharge') } }));

  // ---- hazards ----
  Combat.hz.tiClap = function (h) { const f = h.owner; if (!f) return false; if (h.t === 1) { Cam.shake = 14; for (const e of Combat.targets(f.side)) if (e.y > -60 && Math.abs(e.x - h.x) < 420) Combat.resolveHit(e, f, H_({ dmg: 70, guard: 'low', hs: 22, kb: [Math.sign(e.x - h.x || 1) * 520, -520], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); } return h.t < h.life; };
  Combat.drawHz.tiClap = (c, h) => { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) for (let i = 0; i < 8; i++) { const x = h.x + s * (30 + k * 440) - s * i * 18; c.fillStyle = i % 2 ? `rgba(255,230,160,${1 - k})` : `rgba(255,255,255,${1 - k})`; c.fillRect(Math.round(x / 3) * 3, -6 - i * 3, 10, 6 + i * 2); } c.restore(); };
  Combat.hz.tiBreak = function (h) { const f = h.owner; if (!f) return false; if (h.t === 10 || h.t === 28 || h.t === 46) for (const e of Combat.targets(f.side)) if (e.y > -60) Combat.resolveHit(e, f, H_({ dmg: h.t === 46 ? 30 : 10, hs: 40, kb: [0, h.t === 46 ? -800 : 0], launch: h.t === 46, ultConnect: true, guard: 'mid', sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); return h.t < h.life; };
  Combat.drawHz.tiBreak = (c, h) => { const k = h.t / h.life; c.save(); c.strokeStyle = '#1a1208'; c.lineWidth = 4; for (let i = 0; i < 10; i++) { const a = i * .63 + .3; c.beginPath(); c.moveTo(h.x, 0); c.lineTo(h.x + Math.cos(a) * 520 * Math.min(1, k * 2), Math.sin(a) * 60 * Math.min(1, k * 2)); c.stroke(); } c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -10, 140 * Math.min(1, k * 3), `rgba(255,200,90,${.5 * (1 - k)})`, 'rgba(0,0,0,0)'); c.restore(); };

  // ---- IRON COLOSSUS ----
  const F5 = Mv.grab({ name: 'Colossus Grip', desc: 'Iron Colossus: a command grab with longer reach and a slam that cracks the floor.', range: 96, s: 8, grabData: { anim: 'slam', dmg: 230, frames: 44 }, ev: { 4: () => sfx('tiGrunt') }, onHit: (a, t) => { sfx('tiSlam'); Cam.shake = 14; } });
  const F6 = Mv.rush({ name: 'Wrecking Charge', desc: 'Iron Colossus: plows through projectiles and everything else; armored throughout.', s: 8, speed: 1300, frames: 24, armor: [1, 34], hit: { dmg: 126, kb: [700, -300], wb: true }, ev: { 1: () => sfx('tiCharge') } });
  F6.ev[6] = f => { for (const p of Combat.projectiles) if (p.side !== f.side && Math.abs(p.x - f.x) < 500) p.life = 0; };
  const F2 = mk({ name: 'Earthquake Clap', desc: 'Iron Colossus: a clap that sends a shockwave both ways and knocks everything on the ground into the air.', pose: 'slam', s: 18, a: 2, r: 26, cd: 5, ai: { min: 0, max: 400, use: 'combo' }, ev: { 18: f => { Combat.addHazard({ kind: 'tiClap', owner: f, side: f.side, x: f.x, life: 26, move: F2 }); sfx('tiQuake'); } } });
  const F4 = Mv.buff({ name: 'Iron Roar', desc: 'Iron Colossus: a roar that shoves the foe away and grants armor for 4s and +40 GRIT.', effects: { armor: true, power: true }, dur: 4, cd: 8, ev: { 4: () => sfx('tiRoar', 0, 1.1) }, onStart: f => { f.gauge = Math.min(100, (f.gauge || 0) + 40); const t = f.opp; if (t && Math.abs(t.x - f.x) < 320) t.vx = Math.sign(t.x - f.x) * 700; } });
  const FJ = Mv.dive({ name: 'Meteor Drop', desc: 'Iron Colossus: falls like a meteor; the landing cracks the stage.', vx: 260, vy: 1700, hit: { dmg: 130, gb: true, wb: false }, ev: { 1: () => sfx('tiCharge', 0) }, onHit: a => { Combat.addHazard({ kind: 'tiClap', owner: a, side: a.side, x: a.x, life: 20, move: FJ }); sfx('tiQuake'); } });
  const FU = PxKit.ult({ id: 'titan_fult', name: 'WORLD BREAKER', desc: 'Iron Colossus: he punches the ground until the stage breaks in half. Blockable. Must connect.', pose: 'slam', s: 52, dmg: 1320, color: '#ffd35a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'WORLD BREAKER', dur: 8.4, tc: [1.0, 4.4], tf: 5.2, c1: '#ffd35a', c2: '#fff3c0', c3: '#2a1c08', motif: 'shockwave', pose: ['idle', 'charge', 'punch', 'victory'], actorForm: true, cap1: 'Everything breaks.', cap2: 'I just choose where.', title: 'WORLD BREAKER', sub: 'THE FLOOR GIVES WAY', size: 100,
      cues: [[0, () => sfx('tiClang')], [1.4, () => sfx('tiCharge', 0)], [2.4, () => sfx('tiRoar', 0, 1.6)], [5.2, () => { sfx('tiQuake'); sfx('tiSlam', .2); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0804', bot: '#4a3410', ruins: '#241808', embers: '#ffb020', rays: '#ffd35a' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 52, w: 640, h: 340, back: 320, start: f => { f.say('BREAK!', 90); sfx('tiRoar', 0, 1.2); }, fire: f => { Combat.addHazard({ kind: 'tiBreak', owner: f, side: f.side, x: f.x + f.facing * 120, life: 70, move: FU }); Cam.shake = 24; sfx('tiQuake'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Giant metal body, super armor. New moveset: Colossus Grip, Wrecking Charge, Earthquake Clap, Iron Roar, Meteor Drop, and the ultimate WORLD BREAKER.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'METEOR SUPLEX', dur: 8.0, tc: [1.0, 3.8], tf: 4.8, c1: '#ffb020', c2: '#ffffff', c3: '#101830', motif: 'meteor', pose: ['idle', 'charge', 'throw', 'victory'], cap1: 'Hold on tight.', cap2: 'Welcome back to Earth.', title: 'METEOR SUPLEX', sub: 'ORBITAL', size: 96,
    cues: [[0, () => sfx('tiGrunt')], [1.2, () => sfx('tiCharge', 0)], [4.8, () => { sfx('tiRoar', 0, 1); sfx('tiQuake'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02040e', bot: '#223a6a', stars: true, moon: { x: .7, y: .22, r: 70, col: '#d8e4ff' }, city: '#0a1020', lit: .6 }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'IRON COLOSSUS', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#ffd35a', c2: '#ffffff', c3: '#1a1208', motif: 'converge', shape: 'rect', pose: ['idle', 'charge', 'victory'], lift: 0, cap1: 'Skin is just the first layer.', cap2: 'Iron is the last.', title: 'IRON COLOSSUS', sub: 'UNBREAKABLE', size: 100,
    cues: [[0, () => sfx('tiClang')], [1.4, () => sfx('tiCharge', 0)], [3.9, () => { sfx('tiRoar', 0, 1.4); sfx('tiSlam'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0804', bot: '#3a2c10', ruins: '#241808', embers: '#ffb020' }, k) });
})();
