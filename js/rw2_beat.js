// ============================================================
//  MOONKAI — BEAT, the Frontman. Pixel remake + a real kit.
//
//  GROOVE (new gauge)  chained attacks on the beat build it. At 100 the whole stage DROPS for 4s: the beat window is doubled and every
//                      attack on the beat hits for +30% on top.
//  ON BEAT (passive)   attacks timed to the 0.5s pulse deal 30% more (as before).
//  DROP THE BASS   BASS CANNON (5S) a huge ring on a two-beat charge, WINDMILL (6S) a sliding multi-kick, STACK OF SPEAKERS (2S) three
//                  speakers that pulse in time, TEMPO WARP (4S) haste, a shield and a free dash, DROP KICK (jS).  FESTIVAL (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('beat');
  Object.assign(Sfx, {
    btKick(d = 0) { this.sub({ f: 130, to: 42, dur: .22, vol: .55, delay: d }); this.nsweep({ f0: 3500, f1: 200, dur: .08, vol: .2, delay: d }); },
    btSnare(d = 0) { this.nsweep({ f0: 5000, f1: 1500, dur: .14, vol: .2, type: 'bandpass', q: .8, delay: d }); this.crackle({ dur: .12, vol: .1, delay: d, lo: 1500, hi: 9000 }); },
    btBass(d = 0, dur = .8) { this.voice({ f: 55, to: 48, dur, vol: .42, type: 'sine', delay: d }); this.voice({ f: 110, to: 96, dur, vol: .12, type: 'square', lp: 400, delay: d }); },
    btWub(d = 0, dur = 1.2) { for (let i = 0; i < 6; i++) this.voice({ f: 60 + (i % 2) * 40, to: 50, dur: dur / 6, vol: .3, type: 'sawtooth', lp: 300 + (i % 2) * 900, delay: d + i * dur / 6 }); },
    btRiser(d = 0, dur = 2) { this.riser(dur, .24, d, 200, 4000); for (let i = 0; i < dur * 4; i++) this.btSnare(d + i * .25); },
    btDrop(d = 0) { this.btKick(d); this.btBass(d, 1.2); this.impact(1, d); this.btWub(d + .1, 1.4); this.nsweep({ f0: 6000, f1: 200, dur: 1, vol: .16, type: 'lowpass', delay: d, wet: .5 }); },
    btCrowd(d = 0, dur = 2) { this.nsweep({ f0: 700, f1: 2600, dur, vol: .2, q: .7, delay: d, swell: true, wet: .6 }); this.crackle({ dur, vol: .08, delay: d, lo: 500, hi: 5000 }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const beat = ((Game.battle ? Game.battle.frame : 0) % 30) / 30; if ((v.gauge || 0) >= 100 || v.transformed) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(90,255,224,.8)'; c.lineWidth = 2; c.beginPath(); c.ellipse(P.hip[0], P.hip[1] + 6, 20 + beat * 40, 6 + beat * 10, 0, 0, 7); c.stroke(); c.restore(); } } });
  const onBeat = () => { const k = (Game.battle ? Game.battle.frame : 0) % 30; return k < 5 || k > 26; };
  const groove = (f, n) => { if (f.dropT > 0) return; f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (f.gauge >= 100) { f.gauge = 0; f.dropT = 4 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'THE DROP', '#5affe0', 28); sfx('btDrop'); Cam.shake = 14; } };
  Rw2.merge(def, {
    gauge: { name: 'GROOVE', max: 100, color: '#5affe0', label: f => (f.dropT > 0 ? '· THE DROP' : '') },
    passive: ['On Beat', 'Attacks timed on the 0.5s pulse deal 30% more. On-beat hits build GROOVE; at 100 the stage DROPS for 4s: +30% more on top of every on-beat attack.'],
    onRoundStart: f => { f.gauge = 0; f.dropT = 0; },
    onHit: (a, t) => { groove(a, onBeat() ? 9 : 3); },
    passiveDmg: f => (f.dropT > 0 ? 1.3 : 1),
    passiveTick: f => { if (f.dropT > 0) { f.dropT--; if (f.st % 30 === 0) { sfx('btKick'); Combat.addHazard({ kind: 'btPulse', owner: f, side: f.side, x: f.x, life: 20 }); } } },
  });
  Combat.hz.btPulse = function (h) { const f = h.owner; if (!f) return false; if (h.t === 4) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 280 && e.y > -200) Combat.resolveHit(e, f, H_({ dmg: 26, guard: 'mid', hs: 8, kb: [Math.sign(e.x - h.x || 1) * 200, -100], sfx: 'm' }), { proj: true, fromX: h.x }); return h.t < h.life; };
  Combat.drawHz.btPulse = (c, h) => { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(90,255,224,${1 - k})`; c.lineWidth = 6 * (1 - k) + 1; c.beginPath(); c.ellipse(h.x, -60, 40 + k * 260, 20 + k * 90, 0, 0, 7); c.stroke(); c.restore(); };
  Combat.hz.btSpeaker = function (h) { const f = h.owner; if (!f) return false; if (h.t % 30 === h.off) { sfx('btKick'); h.pulse = 10; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 210 && e.y > -200) Combat.resolveHit(e, f, H_({ dmg: 30, guard: 'mid', hs: 10, kb: [Math.sign(e.x - h.x || 1) * 240, -120], sfx: 'm' }), { proj: true, fromX: h.x }); } if (h.pulse > 0) h.pulse--; return h.t < h.life; };
  Combat.drawHz.btSpeaker = (c, h) => { const k = Math.min(1, h.t / 8, (h.life - h.t) / 12), p = (h.pulse || 0) / 10; c.save(); c.globalAlpha = k; c.fillStyle = '#14141e'; c.strokeStyle = '#5affe0'; c.lineWidth = 2; c.fillRect(h.x - 22, -86, 44, 86); c.strokeRect(h.x - 22, -86, 44, 86); for (const [y, r] of [[-62, 14], [-26, 10]]) { c.beginPath(); c.arc(h.x, y, r * (1 + p * .3), 0, 7); c.stroke(); c.fillStyle = '#0a0a12'; c.beginPath(); c.arc(h.x, y, r * (.5 + p * .2), 0, 7); c.fill(); } if (p) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(90,255,224,${p})`; c.lineWidth = 4 * p; c.beginPath(); c.arc(h.x, -50, 60 * (1 - p) + 20, 0, 7); c.stroke(); } c.restore(); };

  const F5 = mk({ name: 'Bass Cannon', desc: 'Drop the Bass: two beats of charge, then one huge ring of bass that shoves everything across the stage.', pose: 'charge', s: 30, a: 1, r: 24, cd: 5, ai: { min: 100, max: 1000, use: 'zone' }, ev: { 2: () => sfx('btKick'), 15: () => sfx('btKick'), 30: f => { Combat.fireShots(f, { speed: 900, r: 50, dmg: 78, kind: 'ring', color: '#5affe0', core: '#fff', pierce: true, life: .8, kb: [700, -160], hs: 24 }); sfx('btDrop'); Cam.shake = 12; groove(f, onBeat() ? 18 : 8); } } });
  const F6 = Mv.rush({ name: 'Windmill', desc: 'Drop the Bass: a sliding windmill of kicks that tracks the beat. Each kick on the beat builds GROOVE.', s: 6, speed: 700, frames: 28, hit: { dmg: 22, multi: 6, every: 4, kb: [100, -100], hs: 8 }, ev: { 1: () => sfx('btSnare'), 8: () => sfx('btSnare'), 16: () => sfx('btSnare'), 24: () => sfx('btKick') }, onHit: a => groove(a, onBeat() ? 4 : 1) });
  const F2 = mk({ name: 'Stack of Speakers', desc: 'Drop the Bass: three speakers in a row, each pulsing on a different beat of the bar.', pose: 'slam', s: 14, a: 1, r: 24, cd: 8, ai: { min: 100, max: 800, use: 'trap' }, ev: { 14: f => { for (let i = 0; i < 3; i++) Combat.addHazard({ kind: 'btSpeaker', owner: f, side: f.side, x: clamp(f.x + f.facing * (110 + i * 120), 40, Arena.stage.width - 40), off: i * 10, life: 270 }); sfx('btWub'); sfx('btKick'); } } });
  const F4 = mk({ name: 'Tempo Warp', desc: 'Drop the Bass: speeds up for 4s, wraps himself in a shield, and the next dash is free. +20 GROOVE.', pose: 'charge', s: 10, a: 1, r: 14, cd: 9, ai: { min: 250, max: 2000, use: 'buff' }, ev: { 10: f => { Combat.buff(f, { haste: 1, shield: 140 }, 4, 'TEMPO WARP'); groove(f, 20); sfx('btRiser', 0, 1); } } });
  const FJ = Mv.dive({ name: 'Drop Kick', desc: 'Drop the Bass: falls on the beat; if it lands on beat, it sends a pulse out along the floor.', vx: 600, vy: 1500, hit: { dmg: 94, gb: true }, ev: { 1: () => sfx('btSnare') }, onHit: a => { if (onBeat()) { Combat.addHazard({ kind: 'btPulse', owner: a, side: a.side, x: a.x, life: 20 }); groove(a, 14); } sfx('btKick'); } });
  const FU = PxKit.ult({ id: 'beat_fult', name: 'FESTIVAL', desc: 'Drop the Bass: forty thousand people, three stages, one drop. Blockable. Must connect.', pose: 'cast_up', s: 52, dmg: 1280, color: '#5affe0',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'FESTIVAL', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#5affe0', c2: '#ff5ac8', c3: '#06060e', motif: 'beam', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Hands up!', cap2: 'DROP IT!', title: 'FESTIVAL', sub: 'SOLD OUT', size: 118,
      cues: [[0, () => sfx('btCrowd', 0, 3)], [1.4, () => sfx('btRiser', 0, 3)], [5.4, () => { sfx('btDrop'); sfx('btDrop', .5); sfx('btCrowd', .3, 2); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#06060e', bot: '#14143a', city: '#0a0a1c', lit: .8 }, k); x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const a = -1.9 + i * .27 + Math.sin(t * 3 + i) * .1 * k; x.fillStyle = ['rgba(90,255,224,.16)', 'rgba(255,90,200,.16)'][i % 2]; x.beginPath(); x.moveTo(W * .5, H * .8); x.lineTo(W * .5 + Math.cos(a) * 1600 - 60, H * .8 + Math.sin(a) * 1600); x.lineTo(W * .5 + Math.cos(a) * 1600 + 60, H * .8 + Math.sin(a) * 1600); x.fill(); } x.restore(); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 52, w: 1000, h: 340, back: 400, start: f => { f.say('DROP!', 80); sfx('btRiser', 0, 2); }, fire: f => { for (let i = 0; i < 5; i++) Game.later(i * .12, () => { Combat.addHazard({ kind: 'btPulse', owner: f, side: f.side, x: f.x, life: 22 }); sfx('btKick'); }); f.dropT = 4 * FPS; Cam.shake = 24; sfx('btDrop'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. The whole stage pulses: more damage on beat. New moveset: Bass Cannon, Windmill, Stack of Speakers, Tempo Warp, Drop Kick, and the ultimate FESTIVAL.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'THE DROP', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#5affe0', c2: '#ffffff', c3: '#06060e', motif: 'shockwave', pose: ['idle', 'cast_up', 'cast', 'victory'], cap1: 'Four on the floor.', cap2: 'Then nothing. Then EVERYTHING.', title: 'THE DROP', sub: 'WUB', size: 124,
    cues: [[0, () => sfx('btCrowd', 0, 2.4)], [1.2, () => sfx('btRiser', 0, 3)], [4.8, () => { sfx('btDrop'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#06060e', bot: '#0e1a3a', city: '#0a0a1c', lit: .7, rays: '#5affe0' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'DROP THE BASS', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#5affe0', c2: '#ff5ac8', c3: '#06060e', motif: 'rain', shape: 'rect', pose: ['idle', 'cast_up', 'victory'], lift: 20, cap1: 'Is this thing on?', cap2: 'It is now.', title: 'DROP THE BASS', sub: 'BEAT', size: 112,
    cues: [[0, () => sfx('btCrowd', 0, 2)], [1.4, () => sfx('btRiser', 0, 2)], [3.7, () => { sfx('btDrop'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#06060e', bot: '#14143a', city: '#0a0a1c', lit: .8, rays: '#ff5ac8' }, k) });
})();
