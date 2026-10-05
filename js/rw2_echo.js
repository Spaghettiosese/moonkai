// ============================================================
//  MOONKAI — ECHO, the Timekeeper. Pixel remake + a real kit.
//
//  RESONANCE (new gauge)  blocking and landing hits build it. At 100 she RESONATES for 6s: every echo comes back three times.
//  ECHOES                 SONIC BOOM (5S) and ECHO DROP (jS) sound again half a second later, a little softer.
//                         FAST FORWARD (6S) leaves a time-ghost that repeats the dash strike where she started.
//  CHRONO SHIFT           CASCADE (5S) five rings fan out in a rolling wave, SKIP (6S) blinks through the foe, three cuts,
//                         REVERB FIELD (2S) a pulsing slow field, STASIS (4S) freezes the foe in place, CRESCENDO (jS).
//  DA CAPO (form ult)     the same strike lands twice.    TIME STOP & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('echo');
  Object.assign(Sfx, {
    ecPing(d = 0, p = 1) { this.fm({ f: 660 * p, ratio: 2, index: 90, dur: .6, vol: .14, delay: d, wet: .9 }); this.nsweep({ f0: 1800, f1: 5000, dur: .2, vol: .08, delay: d }); },
    ecBoom(d = 0) { this.sub({ f: 130, to: 50, dur: .5, vol: .4, delay: d }); this.ecPing(d, .8); this.nsweep({ f0: 3000, f1: 200, dur: .35, vol: .16, type: 'lowpass', delay: d, wet: .6 }); },
    ecTick(d = 0, n = 8) { for (let i = 0; i < n; i++) this.fm({ f: 1500, ratio: 4.2, index: 180, dur: .07, vol: .09, delay: d + i * .22 }); },
    ecRewind(d = 0, dur = .9) { this.voice({ f: 1400, to: 120, dur, vol: .16, type: 'sawtooth', lp: 3000, delay: d, wet: .6 }); this.nsweep({ f0: 4000, f1: 200, dur, vol: .12, delay: d, wet: .5 }); },
    ecStop(d = 0) { this.voice({ f: 400, to: 30, dur: 1, vol: .26, type: 'sine', delay: d, wet: .6 }); this.ecPing(d + .1, .5); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { if (v.status && v.status.slow) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(136,240,224,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(P.hip[0], P.hip[1] - 30, 70, 0, 7); c.stroke(); c.restore(); } } });
  const reso = (f, n) => { if (f.resoT > 0) return; f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (f.gauge >= 100) { f.gauge = 0; f.resoT = 6 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'RESONANCE', '#88f0e0', 24); sfx('ecPing', 0, 1.5); } };
  Rw2.merge(def, {
    gauge: { name: 'RESONANCE', max: 100, color: '#88f0e0', label: f => (f.resoT > 0 ? '· RESONATING' : '') },
    passive: ['Resonance', 'Blocking and landing hits build RESONANCE. Full: for 6s every echo comes back three times.'],
    onRoundStart: f => { f.gauge = 0; f.resoT = 0; },
    onHurt: (t, a, dmg) => { if (t.state === 'block' || t.state === 'cblock') reso(t, 6); },
    onHit: (a, t, dmg) => reso(a, 3),
    passiveTick: f => { if (f.resoT > 0) f.resoT--; },
  });
  const echoes = (f, p) => { const n = f.resoT > 0 ? 3 : 1; for (let i = 1; i <= n; i++) Game.later(.5 * i, () => { if (f.state === 'ko') return; Combat.fireShots(f, Object.assign({}, p, { dmg: Math.round(p.dmg * (.7 - i * .1)), speed: p.speed * .85, color: '#cfffff', limit: undefined })); sfx('ecPing', 0, 1 + i * .12); }); };
  const echoShot = (o, p, at = 12) => { const m = Mv.shot(Object.assign({ s: at, proj: p }, o)); const e = m.ev[at]; m.ev[at] = f => { e(f); sfx('ecBoom'); echoes(f, p); }; return m; };
  const P5 = { speed: 780, r: 16, dmg: 56, kind: 'ring', color: '#88f0e0', core: '#fff', pierce: true, kb: [380, -40], hs: 16 };
  PxKit.setMove(def, '5S', echoShot({ name: 'Sonic Boom', desc: 'A sound ring that pushes far. It ECHOES: once more, half a second later (three times while RESONATING).' }, P5));
  PxKit.setMove(def, 'jS', Object.assign(echoShot({ name: 'Echo Drop', desc: 'A ring angled down. It ECHOES.', pose: 'cast' }, Object.assign({}, P5, { angle: .8, dmg: 48 }), 8), { air: true }));
  { const fw = Mv.rush({ name: 'Fast Forward', desc: 'A time-skip dash strike. A time-ghost repeats the strike where she began, half a second later.', s: 6, speed: 1500, frames: 12, pass: true, inv: [1, 14], hit: { dmg: 70, kb: [300, -300] } });
    fw.onStart = f => { f.ecFrom = f.x; }; fw.ev = fw.ev || {}; fw.ev[16] = f => { const x0 = f.ecFrom, dir = f.facing; Game.later(.5, () => { const g = { x: x0, side: f.side }; Combat.addHazard({ kind: 'ecGhost', owner: f, side: f.side, x: x0, x2: f.x, life: 12 }); Combat.strikeZone(f, { x: Math.min(x0, f.x) - 30, y: -150, w: Math.abs(f.x - x0) + 60, h: 150 }, { dmg: 44, guard: 'mid', hs: 14, kb: [200 * dir, -300], launch: true, sfx: 'm' }, { move: fw }); sfx('ecPing'); }); };
    PxKit.setMove(def, '6S', fw); }
  Combat.hz.ecGhost = h => h.t < h.life;
  Combat.drawHz.ecGhost = (c, h) => { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 1 - k; c.fillStyle = 'rgba(136,240,224,.5)'; c.fillRect(Math.min(h.x, h.x2), -140, Math.abs(h.x2 - h.x), 140); for (let i = 0; i < 6; i++) { c.fillStyle = '#fff'; c.fillRect(h.x + (h.x2 - h.x) * i / 5, -140 + i * 22, 6, 18); } c.restore(); };
  Combat.hz.ecField = function (h) { const f = h.owner; if (!f) return false; h.x = f.x; if (h.t % 24 === 12) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r && e.y > -200) { e.status.slow = Math.max(e.status.slow || 0, .6); Combat.resolveHit(e, f, H_({ dmg: 16, guard: 'mid', hs: 6, kb: [0, 0], sfx: 'l' }), { proj: true, fromX: h.x }); } return h.t < h.life; };
  Combat.drawHz.ecField = (c, h) => { const k = Math.min(1, h.t / 14, (h.life - h.t) / 18); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = k; for (let r = 0; r < 3; r++) { c.strokeStyle = `rgba(136,240,224,${.6 - r * .15})`; c.lineWidth = 3; const R = (h.r * .35 + ((h.t * 3 + r * 60) % h.r) * .65); c.beginPath(); c.ellipse(h.x, -60, R, R * .55, 0, 0, 7); c.stroke(); } glowCircle(c, h.x, -60, h.r * .8, 'rgba(136,240,224,0.14)', 'rgba(0,0,0,0)'); c.restore(); };

  const F5 = Mv.shot({ name: 'Cascade', desc: 'Chrono Shift: five sound rings fan out in a rolling wave.', proj: { speed: 880, r: 14, dmg: 34, count: 5, spread: 1.0, kind: 'ring', color: '#88f0e0', core: '#fff', pierce: true, kb: [200, -60] }, ev: { 2: () => sfx('ecPing'), 12: () => sfx('ecBoom') } });
  const F6 = mk({ name: 'Skip', desc: 'Chrono Shift: skips through the foe three times, a cut each, and ends behind them.', pose: 'heavy', s: 6, a: 24, r: 18, inv: [1, 30], ai: { min: 100, max: 800, use: 'approach' }, ev: { 6: f => { sfx('ecRewind', 0, .4); Rw2.blink(f, { n: 3, gap: 7, dmg: 32, last: 74, color: '#88f0e0', sfx: () => sfx('ecPing', 0, 1.3), move: F6 }); } } });
  const F2 = mk({ name: 'Reverb Field', desc: 'Chrono Shift: a pulsing field around her for 5s. Anyone inside is slowed and shaken.', pose: 'cast_up', s: 14, a: 1, r: 20, cd: 7, ai: { min: 0, max: 400, use: 'buff' }, ev: { 14: f => { Combat.addHazard({ kind: 'ecField', owner: f, side: f.side, x: f.x, r: 300, life: 300 }); sfx('ecStop'); } } });
  const F4 = mk({ name: 'Stasis', desc: 'Chrono Shift: freezes the foe in place for 1.2s. Not a hit: a pause.', pose: 'cast', s: 16, a: 1, r: 26, cd: 8, ai: { min: 150, max: 800, use: 'zone' }, ev: { 16: f => { const t = f.opp; if (!t || Math.abs(t.x - f.x) > 760) return; t.status.freeze = Math.max(t.status.freeze || 0, 1.2); t.move = null; Game.popWorld(t.x, t.y - t.h - 40, 'STASIS', '#88f0e0', 22); sfx('ecStop'); } } });
  const FJ = Mv.dive({ name: 'Crescendo', desc: 'Chrono Shift: falls with a rising chord; rings ripple out along the floor.', vx: 300, vy: 1500, hit: { dmg: 90, gb: true }, onHit: a => { for (const s of [-1, 1]) Combat.fireShots(a, { speed: 800 * s, r: 12, dmg: 36, kind: 'ring', color: '#88f0e0', life: .6, pierce: true, offY: 40 }); sfx('ecBoom'); } });
  const FU = PxKit.ult({ id: 'echo_fult', name: 'DA CAPO', desc: 'Chrono Shift: time returns to the beginning of the bar and plays the same strike again. Hits twice. Blockable. Must connect.', pose: 'cast', s: 44, dmg: 1280, color: '#88f0e0',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'DA CAPO', dur: 8.2, tc: [1.0, 4.2], tf: 5.0, c1: '#88f0e0', c2: '#ffffff', c3: '#06222c', motif: 'rift', pose: ['idle', 'cast', 'cast', 'victory'], actorForm: true, cap1: 'From the top.', cap2: 'And again.', title: 'DA CAPO', sub: 'ONCE MORE, WITH FEELING', size: 106,
      cues: [[0, () => sfx('ecTick', 0, 10)], [1.4, () => sfx('ecRewind', 0, 2)], [5.0, () => { sfx('ecBoom'); sfx('ecBoom', .35); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#021016', bot: '#0c4a58', stars: '#88f0e0', city: '#06222c', lit: .3 }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 44, w: 700, h: 320, back: 200, start: f => { f.say('From the top.', 80); sfx('ecRewind'); }, fire: f => { Cam.shake = 14; sfx('ecBoom'); Game.later(.6, () => { Combat.strikeZone(f, { x: f.facing > 0 ? f.x - 200 : f.x - 500, y: -320, w: 700, h: 320 }, { dmg: 360, guard: 'mid', hs: 30, kb: [500, -500], launch: true, sfx: 'h' }, { move: FU }); sfx('ecBoom'); Cam.shake = 16; }); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'TIMED (10s). The enemy moves at 2/3 speed. New moveset: Cascade, Skip, Reverb Field, Stasis, Crescendo, and the ultimate DA CAPO.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'TIME STOP', dur: 8.0, tc: [1.0, 3.8], tf: 4.6, c1: '#88f0e0', c2: '#ffffff', c3: '#06222c', motif: 'slashes', pose: ['idle', 'cast', 'dash', 'victory'], cap1: 'Hold that note.', cap2: 'Twelve strikes. Then play.', title: 'TIME STOP', sub: 'RESUME', size: 104,
    cues: [[0, () => sfx('ecTick', 0, 8)], [1.2, () => sfx('ecStop')], [4.6, () => { for (let i = 0; i < 6; i++) sfx('ecPing', i * .1, 1 + i * .08); sfx('ecBoom', .6); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#021016', bot: '#0c3a48', stars: '#88f0e0', city: '#06222c', lit: .4 }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'CHRONO SHIFT', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#88f0e0', c2: '#ffffff', c3: '#06222c', motif: 'implode', pose: ['idle', 'cast_up', 'victory'], lift: 30, cap1: 'Every second has a sound.', cap2: 'I only need to hear it first.', title: 'CHRONO SHIFT', sub: 'THE TIMEKEEPER', size: 100,
    cues: [[0, () => sfx('ecTick', 0, 8)], [1.4, () => sfx('ecRewind', 0, 1.6)], [3.7, () => { sfx('ecStop'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#021016', bot: '#0a3a48', stars: '#88f0e0', rays: '#88f0e0' }, k) });
})();
