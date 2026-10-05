// ============================================================
//  MOONKAI — ROO, the Outback Champ. Pixel remake + a real kit.
//
//  SPRING (new gauge)  every hop, jump-in and kick winds her up. At 100 she is SPRUNG for 5s: every jump is double height and every
//                      kick launches the foe skyward.
//  SPRING LEGS (passive)  triple jump; jump-ins deal extra damage (as before).
//  MEGA ROO   TAIL SLAM KICK (5S) a double kick off the tail, HOP COMBO (6S) three hops with a punch each, OUTBACK QUAKE (2S) a leap
//             that lands with a shockwave, BOOMERANG STORM (4S) three that return, MEGA STOMP (jS).   WALLABY WALLOP (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('roo');
  Object.assign(Sfx, {
    roBoing(d = 0, p = 1) { this.voice({ f: 180 * p, to: 640 * p, dur: .18, vol: .2, type: 'sine', delay: d }); this.voice({ f: 640 * p, to: 200 * p, dur: .22, vol: .14, type: 'sine', delay: d + .15 }); },
    roKick(d = 0) { this.impact(.6, d); this.nsweep({ f0: 900, f1: 200, dur: .14, vol: .22, type: 'lowpass', delay: d }); },
    roThump(d = 0) { this.sub({ f: 90, to: 36, dur: .4, vol: .5, delay: d }); this.impact(.9, d); },
    roBoomer(d = 0, dur = 1) { this.voice({ f: 520, to: 700, dur, vol: .08, type: 'triangle', delay: d, wet: .3 }); this.nsweep({ f0: 1500, f1: 3000, dur, vol: .1, q: 2, delay: d }); },
    roDidge(d = 0, dur = 2.4) { this.voice({ f: 73, to: 73, dur, vol: .28, type: 'sawtooth', lp: 300, n: 3, det: 8, delay: d, wet: .5 }); this.nsweep({ f0: 300, f1: 400, dur, vol: .06, q: 4, delay: d }); },
    roCheer(d = 0) { this.nsweep({ f0: 800, f1: 2800, dur: 1.6, vol: .2, q: .7, delay: d, swell: true, wet: .6 }); this.crackle({ dur: 1.6, vol: .08, delay: d, lo: 500, hi: 5000 }); },
  });
  PxModel.install(def, {});
  const wind = (f, n) => { if (f.sprungT > 0) return; f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (f.gauge >= 100) { f.gauge = 0; f.sprungT = 5 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'SPRUNG', '#e08a4a', 26); sfx('roBoing', 0, 1.4); } };
  Rw2.merge(def, {
    gauge: { name: 'SPRING', max: 100, color: '#e08a4a', label: f => (f.sprungT > 0 ? '· SPRUNG' : '') },
    passive: ['Spring Legs', 'Triple jump; jump-ins deal extra damage. Hops and kicks wind SPRING; at 100 she is SPRUNG for 5s: double-height jumps and kicks that launch.'],
    onRoundStart: f => { f.gauge = 0; f.sprungT = 0; },
    onHit: (a, t) => { wind(a, a.airborne ? 8 : 4); if (a.sprungT > 0 && a.move && a.move.kind !== 'normal') { t.vy = -900; t.state = t.airborne ? t.state : t.state; } },
    passiveTick: f => { if (f.sprungT > 0) { f.sprungT--; if (f.airborne && f.vy > 0 && f.st % 20 === 0) f.vy -= 120; } else if (f.airborne && f.st % 10 === 0) wind(f, 1); },
  });
  Combat.hz.roBoomer = function (h) { const f = h.owner; if (!f) return false; const T = h.t / h.life, out = T < .5 ? T * 2 : 2 - T * 2; h.x = h.x0 + h.dir * (60 + out * h.reach); h.y = -90 + Math.sin(T * 6.28) * 20 * h.lane; if (h.t % 6 === 3) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 40 && Math.abs((e.y - e.h / 2) - h.y) < 70) Combat.resolveHit(e, f, H_({ dmg: 28, guard: 'mid', hs: 8, kb: [140 * h.dir * (T < .5 ? 1 : -1), -140], sfx: 'm' }), { proj: true, fromX: h.x }); return h.t < h.life; };
  Combat.drawHz.roBoomer = (c, h) => { c.save(); c.translate(h.x, h.y || -90); c.rotate(h.t * .5); c.strokeStyle = '#c8803a'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-22, -10); c.quadraticCurveTo(0, 14, 22, -10); c.stroke(); c.strokeStyle = '#7a4a1a'; c.lineWidth = 2; c.stroke(); c.restore(); };

  const F5 = mk({ name: 'Tail Slam Kick', desc: 'Mega Roo: leans back on the tail and kicks twice with both feet. SPRING +12.', pose: 'kick', s: 12, a: 10, r: 24, hit: { dmg: 56, box: [0, -100, 110, 90], multi: 2, every: 5, kb: [460, -300], launch: true, hs: 20 }, ai: { min: 0, max: 130, use: 'combo' }, ev: { 3: () => sfx('roBoing'), 12: () => sfx('roKick'), 17: () => sfx('roKick', 0, 1.1) }, onHit: a => wind(a, 6) });
  const F6 = Mv.rush({ name: 'Hop Combo', desc: 'Mega Roo: three hops forward, a punch at the top of each.', s: 6, speed: 700, frames: 30, hit: { dmg: 40, multi: 3, every: 9, kb: [160, -180], launch: false, hs: 12 }, ev: { 1: () => sfx('roBoing'), 11: () => sfx('roBoing', 0, 1.1), 21: () => sfx('roBoing', 0, 1.2) }, onHit: a => wind(a, 5) });
  const F2 = mk({ name: 'Outback Quake', desc: 'Mega Roo: a huge leap that lands with a shockwave in both directions.', pose: 'jump', s: 6, a: 30, r: 24, inv: [1, 14], vel: [[6, 24, 520, -900]], ai: { min: 150, max: 700, use: 'approach' }, ev: { 6: () => sfx('roBoing', 0, .8), 36: f => { f.y = 0; Combat.addHazard({ kind: 'tiClap', owner: f, side: f.side, x: f.x, life: 24, move: F2 }); sfx('roThump'); Cam.shake = 14; wind(f, 10); } } });
  const F4 = mk({ name: 'Boomerang Storm', desc: 'Mega Roo: three boomerangs on three lanes. Each goes out and comes back.', pose: 'throw', s: 12, a: 1, r: 24, cd: 5, ai: { min: 100, max: 800, use: 'zone' }, ev: { 12: f => { for (let i = 0; i < 3; i++) Combat.addHazard({ kind: 'roBoomer', owner: f, side: f.side, x: f.x, x0: f.x, dir: f.facing, reach: 280 + i * 100, lane: i - 1, life: 70 + i * 6 }); sfx('roBoomer'); } } });
  const FJ = Mv.dive({ name: 'Mega Stomp', desc: 'Mega Roo: both feet down with the weight of a house; the landing throws the foe skyward.', vx: 260, vy: 1800, hit: { dmg: 118, gb: true }, ev: { 1: () => sfx('roBoing', 0, .7) }, onHit: a => { Combat.addHazard({ kind: 'tiClap', owner: a, side: a.side, x: a.x, life: 22, move: FJ }); wind(a, 14); sfx('roThump'); } });
  const FU = PxKit.ult({ id: 'roo_fult', name: 'WALLABY WALLOP', desc: 'Mega Roo: a hundred kicks, a hundred hops, and the whole mob of kangaroos along for the ride. Blockable. Must connect.', pose: 'kick', s: 46, dmg: 1280, color: '#e08a4a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'WALLABY WALLOP', dur: 8.4, tc: [1.0, 4.4], tf: 5.2, c1: '#e08a4a', c2: '#fff0c0', c3: '#3a1a08', motif: 'rush', pose: ['idle', 'charge', 'kick', 'victory'], actorForm: true, cap1: "G'day.", cap2: 'Mind the mob.', title: 'WALLABY WALLOP', sub: 'NO WORRIES', size: 96,
      cues: [[0, () => sfx('roDidge', 0, 3)], [1.4, () => sfx('roBoing')], [5.2, () => { for (let i = 0; i < 6; i++) { sfx('roKick', i * .08); sfx('roBoing', i * .1, 1 + i * .06); } sfx('roThump', .6); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#2a1408', bot: '#d88a3a', sun: { x: .5, y: .3, r: 100, col: '#ffd890' }, mount: '#7a4418', rays: '#ffe0a0' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 46, w: 800, h: 330, back: 300, start: f => { f.say('Hop to it!', 80); sfx('roDidge', 0, 2); }, fire: f => { for (let i = 0; i < 8; i++) Game.later(i * .06, () => { const x = clamp(f.x + f.facing * (60 + i * 100), 30, Arena.stage.width - 30); Combat.explode(x, -50, 70, f, 0, '#e08a4a'); sfx('roKick'); }); Cam.shake = 20; sfx('roThump'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Enormous kangaroo: super armor, huge kicks. New moveset: Tail Slam Kick, Hop Combo, Outback Quake, Boomerang Storm, Mega Stomp, and the ultimate WALLABY WALLOP.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'OUTBACK SLAM', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#e08a4a', c2: '#fff0c0', c3: '#3a1a08', motif: 'rush', pose: ['idle', 'charge', 'throw', 'victory'], cap1: 'Welcome to the Outback.', cap2: 'It is very big.', title: 'OUTBACK SLAM', sub: 'HOP ALONG', size: 96,
    cues: [[0, () => sfx('roDidge', 0, 2.4)], [1.4, () => sfx('roBoing')], [4.8, () => { sfx('roThump'); sfx('roKick'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#2a1408', bot: '#c87a30', sun: { x: .7, y: .3, r: 90, col: '#ffd890' }, mount: '#7a4418', rays: '#ffe0a0' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'MEGA ROO', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#e08a4a', c2: '#fff0c0', c3: '#3a1a08', motif: 'rise', pose: ['idle', 'charge', 'victory'], lift: 0, cap1: 'Big kangaroo, big problem.', cap2: 'Bigger kangaroo...', title: 'MEGA ROO', sub: 'THE OUTBACK CHAMP', size: 112,
    cues: [[0, () => sfx('roDidge', 0, 2.4)], [1.4, () => sfx('roBoing')], [3.7, () => { sfx('roThump'); sfx('roCheer'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#2a1408', bot: '#c87a30', sun: { x: .5, y: .3, r: 90, col: '#ffd890' }, mount: '#7a4418', rays: '#ffe0a0' }, k) });
})();
