// ============================================================
//  MOONKAI — KAGE, the Last Ronin. Pixel remake + ONI BLADE moveset.
//  (DEMON, Iaido, Moonlit Flash and Demon Severance stay as they were.)
//  ONI BLADE   ONI CRESCENT (5S) three crescents, DEMON DRAW (6S) a draw that cuts the line again a beat later,
//              REFLECTION CUT (2S) a parry that sends a slash back, HUNDRED CUTS (4S) a flurry, FALLING MOON (jS).
//  MOONLESS NIGHT (form ult)   the moon goes out; a hundred cuts land in the dark.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('kage');
  Object.assign(Sfx, {
    kgDraw(d = 0) { this.nsweep({ f0: 3000, f1: 11000, dur: .12, vol: .24, type: 'highpass', delay: d }); this.fm({ f: 2600, ratio: 2.7, index: 220, dur: .5, vol: .1, delay: d, wet: .6 }); },
    kgSheath(d = 0) { this.fm({ f: 1200, ratio: 3.4, index: 120, dur: .3, vol: .12, delay: d, wet: .4 }); this.impact(.3, d + .15); },
    kgOni(d = 0, dur = 1.2) { this.voice({ f: 90, to: 60, dur, vol: .3, type: 'sawtooth', lp: 600, n: 3, det: 40, delay: d, wet: .5 }); this.nsweep({ f0: 200, f1: 1200, dur, vol: .12, q: 2, delay: d, wet: .4 }); },
    kgCut(d = 0) { this.nsweep({ f0: 6000, f1: 12000, dur: .07, vol: .2, type: 'highpass', delay: d }); },
    kgMoon(d = 0) { this.chord({ notes: [147, 220, 262], dur: 3, vol: .16, type: 'sine', delay: d, wet: .95 }); this.run({ notes: [880, 1047, 1319], step: .2, dur: 1.4, vol: .08, bell: true, delay: d + .3, wet: .9 }); },
  });
  PxKit.pixelize(def, { win: [-330, -330, 700, 380] });
  Combat.hz.kgLine = function (h) { const f = h.owner; if (!f) return false; if (h.t === h.at) { Combat.strikeZone(f, { x: Math.min(h.x1, h.x2) - 20, y: -150, w: Math.abs(h.x2 - h.x1) + 40, h: 150 }, { dmg: 74, guard: 'mid', hs: 22, kb: [260 * Math.sign(h.x2 - h.x1), -460], launch: true, sfx: 'h' }, { move: h.move }); sfx('kgCut'); Cam.shake = 8; } return h.t < h.life; };
  Combat.drawHz.kgLine = (c, h) => { const k = h.t / h.at; c.save(); c.globalCompositeOperation = 'lighter'; const a = h.t < h.at ? .3 + .5 * k : Math.max(0, 1 - (h.t - h.at) / 10); c.strokeStyle = `rgba(255,${h.t < h.at ? 90 : 240},${h.t < h.at ? 90 : 240},${a})`; c.lineWidth = h.t < h.at ? 1.5 : 6; c.beginPath(); c.moveTo(h.x1, -90); c.lineTo(h.x2, -90); c.stroke(); c.restore(); };

  const F5 = Mv.shot({ name: 'Oni Crescent', desc: 'Oni Blade: three red crescents in a fan.', proj: { speed: 1100, r: 15, dmg: 44, count: 3, spread: .6, kind: 'crescent', color: '#ff4a4a', core: '#fff', pierce: true, limit: undefined }, ev: { 3: () => sfx('kgDraw') } });
  const F6 = Object.assign(Mv.rush({ name: 'Demon Draw', desc: 'Oni Blade: a draw that passes through the foe; the line is cut again a beat later.', s: 6, speed: 2200, frames: 10, pass: true, inv: [1, 14], hit: { dmg: 80, kb: [200, -300] }, ev: { 1: () => sfx('kgDraw') } }), { onStart: f => { f.kgFrom = f.x; } });
  F6.ev[12] = f => { Combat.addHazard({ kind: 'kgLine', owner: f, side: f.side, x1: f.kgFrom, x2: f.x, life: 30, at: 18, move: F6 }); kgDemon(f, 6); };
  const F2 = Object.assign(Mv.counter({ name: 'Reflection Cut', desc: 'Oni Blade: a parry that cuts the attacker and sends a slash back across the stage.', window: 30, dmg: 150 }), { onHit: (a, t) => { kgDemon(a, 30); Combat.fireShots(a, { speed: 1300, r: 16, dmg: 80, kind: 'crescent', color: '#ffffff', core: '#ff4a4a', pierce: true }); sfx('kgCut'); } });
  const F4 = Mv.flurry({ name: 'Hundred Cuts', desc: 'Oni Blade: a blur of cuts in place, ending with a launcher. Feeds the DEMON.', hits: 12, every: 3, hit: { dmg: 14 }, finisher: { dmg: 80, kb: [400, -700], launch: true }, ev: { 3: () => sfx('kgCut'), 12: () => sfx('kgCut'), 24: () => sfx('kgCut') }, onHit: a => kgDemon(a, 2) });
  const FJ = Mv.dive({ name: 'Falling Moon', desc: 'Oni Blade: a plunging cut; the landing throws a crescent along the floor each way.', vx: 700, vy: 1500, hit: { dmg: 98, gb: true }, onHit: a => { for (const s of [-1, 1]) Combat.fireShots(a, { speed: 900 * s, r: 14, dmg: 40, kind: 'crescent', color: '#ff4a4a', life: .6, pierce: true, offY: 50 }); kgDemon(a, 8); sfx('kgDraw'); } });
  const FU = PxKit.ult({ id: 'kage_fult', name: 'MOONLESS NIGHT', desc: 'Oni Blade: the moon goes out. In the dark, a hundred cuts land from every direction. Blockable. Must connect.', pose: 'charge', s: 56, dmg: 1280, color: '#ff4a4a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'MOONLESS NIGHT', dur: 8.4, tc: [1.0, 4.6], tf: 5.4, c1: '#ff4a4a', c2: '#ffffff', c3: '#05020a', motif: 'slashes', pose: ['idle', 'charge', 'cast', 'victory'], actorForm: true, cap1: 'The moon is only a lantern.', cap2: 'I put it out.', title: 'MOONLESS NIGHT', sub: 'ONE HUNDRED CUTS', size: 100,
      cues: [[0, () => sfx('kgMoon')], [1.4, () => sfx('kgSheath')], [2.4, () => sfx('kgOni', 0, 1.6)], [5.4, () => { for (let i = 0; i < 8; i++) sfx('kgCut', i * .06); sfx('kgDraw', .5); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#030106', bot: '#1c0a14', moon: { x: .5, y: .24, r: Math.max(0, 90 * (1 - k)), col: '#f0e8ff' }, stars: '#a08090', mount: '#0a0408' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 56, w: 760, h: 330, back: 300, start: f => { f.say('Moonless.', 90); sfx('kgOni', 0, 1.4); f.status.invis = .8; }, fire: f => { for (let i = 0; i < 12; i++) Game.later(i * .035, () => { const t = f.opp; if (!t) return; const a = i * .9; Game.fx.burst(t.x + Math.cos(a) * 60, -80 + Math.sin(a) * 50, 5, { color: ['#fff', '#ff4a4a'], size: 6, speed: 300, life: .3, glow: true }); sfx('kgCut'); }); Cam.shake = 18; sfx('kgDraw'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Longer reach, lifesteal, DEMON fills twice as fast. New moveset: Oni Crescent, Demon Draw, Reflection Cut, Hundred Cuts, Falling Moon, and the ultimate MOONLESS NIGHT.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'DEMON SEVERANCE', dur: 8.0, tc: [1.0, 4.2], tf: 5.0, c1: '#ff4a4a', c2: '#ffffff', c3: '#0a0408', motif: 'beam', pose: ['idle', 'charge', 'cast', 'victory'], cap1: 'Sheathe.', cap2: 'Draw. Once.', title: 'DEMON SEVERANCE', sub: 'IT IS ALREADY DONE', size: 92,
    cues: [[0, () => sfx('kgSheath')], [1.6, () => sfx('kgMoon')], [5.0, () => { sfx('kgDraw'); sfx('kgOni', .1, .8); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#050208', bot: '#2a1018', moon: { x: .68, y: .24, r: 80, col: '#f0e8ff' }, stars: '#a08090', city: '#0c0608', lit: .1 }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'ONI BLADE', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#ff4a4a', c2: '#ffffff', c3: '#14040a', motif: 'converge', pose: ['idle', 'charge', 'victory'], cap1: 'It has been asleep in the steel.', cap2: 'Let it have the hand.', title: 'ONI BLADE', sub: 'THE DEMON WAKES', size: 100,
    cues: [[0, () => sfx('kgSheath')], [1.4, () => sfx('kgOni', 0, 1.8)], [3.7, () => { sfx('kgDraw'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#050208', bot: '#2a0a10', moon: { x: .5, y: .24, r: 90, col: '#ff8a8a' }, stars: '#a08090', embers: '#ff4a4a' }, k) });
})();
