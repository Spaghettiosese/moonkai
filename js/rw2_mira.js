// ============================================================
//  MOONKAI — MIRA TIDE, the Tidecaller. Pixel remake + a real kit.
//
//  TIDE (new gauge)      rises with every water hit she lands and falls when she is idle. At 100 the FLOOD rises for 6s:
//                        her attacks soak the foe (slow) and she deals +20%.
//  HIGH TIDE (passive)   her water pushes enemies further and slows them briefly (as before).
//  LEVIATHAN QUEEN       TSUNAMI BOLT (5S) a wall of water, KRAKEN RUSH (6S) a surge that carries the foe, MAELSTROM (2S) a whirlpool,
//                        PEARL BARRIER (4S) a bubble shield that pops into shots, TRIDENT PLUNGE (jS).
//  ABYSSAL TIDE (form ult)  the sea comes in from both sides.    LEVIATHAN'S CALL & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('mira');
  Object.assign(Sfx, {
    miSplash(d = 0) { this.nsweep({ f0: 600, f1: 4000, dur: .25, vol: .2, q: 1, delay: d, wet: .5 }); this.crackle({ dur: .25, vol: .08, delay: d, lo: 1000, hi: 7000 }); },
    miWave(d = 0, dur = 1.6) { this.nsweep({ f0: 200, f1: 1600, dur, vol: .26, q: 1.4, delay: d, swell: true, wet: .6 }); this.sub({ f: 60, to: 40, dur: dur * .7, vol: .3, delay: d }); },
    miBubble(d = 0) { this.fm({ f: 520, ratio: 1.5, index: 60, dur: .22, vol: .1, delay: d, wet: .6 }); this.voice({ f: 400, to: 900, dur: .15, vol: .08, delay: d, wet: .5 }); },
    miSong(d = 0) { this.run({ notes: [392, 494, 587, 784, 988], step: .22, dur: 1.8, vol: .1, bell: false, type: 'sine', delay: d, wet: .95 }); },
    miCall(d = 0, dur = 2.2) { this.voice({ f: 70, to: 52, dur, vol: .34, type: 'sawtooth', lp: 500, n: 3, det: 20, delay: d, wet: .6 }); this.miWave(d, dur); },
    miPlunge(d = 0) { this.nsweep({ f0: 3000, f1: 300, dur: .3, vol: .2, type: 'lowpass', delay: d }); this.miSplash(d + .25); this.impact(.8, d + .28); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { if (v.status && v.status.slow) return; if (v.flood) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(120,220,255,.6)'; c.fillRect(P.hip[0] - 30 + ((v.anim * 40 + i * 13) % 60), P.hip[1] - 80 + i * 14, 5, 5); } c.restore(); } } });
  const tide = (f, n) => { if (f.floodT > 0) return; f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (f.gauge >= 100) { f.gauge = 0; f.floodT = 6 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'FLOOD', '#3ac8ff', 26); sfx('miWave', 0, 1.4); Cam.shake = 8; } };
  Rw2.merge(def, {
    gauge: { name: 'TIDE', max: 100, color: '#3ac8ff', label: f => (f.floodT > 0 ? '· FLOOD' : '') },
    passive: ['High Tide', 'Her water pushes enemies further and slows them. Every water hit raises the TIDE; at 100 the FLOOD rises for 6s (+20% damage, soaking hits).'],
    onRoundStart: f => { f.gauge = 0; f.floodT = 0; },
    onHit: (a, t, dmg) => { tide(a, 5); if (a.floodT > 0) t.status.slow = Math.max(t.status.slow || 0, .8); },
    passiveDmg: f => (f.floodT > 0 ? 1.2 : 1),
    passiveTick: f => { if (f.floodT > 0) f.floodT--; else if (f.st % 20 === 0 && !f.move) f.gauge = Math.max(0, (f.gauge || 0) - 1); },
  });
  Combat.hz.miPool = function (h) { const f = h.owner; if (!f) return false; for (const e of Combat.targets(f.side)) { const d = h.x - e.x; if (Math.abs(d) < h.r && e.y > -120) { e.x += Math.sign(d) * Math.min(Math.abs(d), 4.5); if (h.t % 14 === 0) Combat.resolveHit(e, f, H_({ dmg: 18, guard: 'mid', hs: 8, kb: [0, -90], sfx: 'l', status: { slow: .6 } }), { proj: true, fromX: h.x }); } } return h.t < h.life; };
  Combat.drawHz.miPool = (c, h) => { const k = Math.min(1, h.t / 14, (h.life - h.t) / 20), T = h.t; c.save(); c.globalAlpha = k; c.globalCompositeOperation = 'lighter'; for (let r = 0; r < 4; r++) { c.strokeStyle = `rgba(90,210,255,${.55 - r * .1})`; c.lineWidth = 3; const R = h.r * (1 - r * .22); c.beginPath(); c.ellipse(h.x, -4, R, R * .2, 0, T * .08 * (r % 2 ? -1 : 1), 6.28 + T * .08 * (r % 2 ? -1 : 1) - 1); c.stroke(); } for (let i = 0; i < 20; i++) { const a = i * .6 + T * .2, R = h.r * (.2 + (i % 5) * .16); c.fillStyle = i % 2 ? '#bff' : '#fff'; c.fillRect(Math.round((h.x + Math.cos(a) * R) / 3) * 3, Math.round((-4 + Math.sin(a) * R * .2 - (i % 4) * 14) / 3) * 3, 5, 5); } c.restore(); };
  Combat.hz.miWave = function (h) { const f = h.owner; if (!f) return false; h.x += h.dir * h.sp; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 70 && e.y > -200 && !h.hit.has(e)) { h.hit.add(e); Combat.resolveHit(e, f, H_({ dmg: h.dmg || 80, guard: 'mid', hs: 22, kb: [h.dir * 420, -300], launch: true, status: { slow: 1 }, ultConnect: !!h.ult, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); } return h.t < h.life && h.x > -60 && h.x < Arena.stage.width + 60; };
  Combat.drawHz.miWave = (c, h) => { const H2 = h.hgt || 200; c.save(); const g = c.createLinearGradient(0, -H2, 0, 0); g.addColorStop(0, 'rgba(190,245,255,.95)'); g.addColorStop(.35, 'rgba(60,190,255,.8)'); g.addColorStop(1, 'rgba(10,80,150,.7)'); c.fillStyle = g; c.beginPath(); c.moveTo(h.x - h.dir * 120, 0); for (let i = 0; i <= 8; i++) c.lineTo(h.x - h.dir * (120 - i * 15), -H2 * (i / 8) * (.8 + .2 * Math.sin(h.t * .3 + i))); c.lineTo(h.x + h.dir * 30, -H2 * 1.05); c.lineTo(h.x + h.dir * 50, -H2 * .7); c.lineTo(h.x + h.dir * 44, 0); c.closePath(); c.fill(); c.globalCompositeOperation = 'lighter'; c.fillStyle = '#fff'; for (let i = 0; i < 10; i++) c.fillRect(Math.round((h.x + h.dir * (20 - i * 12)) / 3) * 3, Math.round((-H2 * (.3 + i * .07) + Math.sin(h.t * .5 + i) * 6) / 3) * 3, 6, 4); c.restore(); };

  PxKit.setMove(def, '4S', mk({ name: 'Undertow', desc: 'A whip of water that pulls the foe in; each pull raises the TIDE.', pose: 'cast', s: 12, a: 3, r: 22, hit: { dmg: 46, box: [0, -110, 330, 100], kb: [-420, -60], hs: 16, status: { slow: .8 } }, ai: { min: 150, max: 330, use: 'zone' }, ev: { 2: () => sfx('miSplash'), 12: () => sfx('miWave', 0, .5) } }));
  const F5 = mk({ name: 'Tsunami Bolt', desc: 'Leviathan Queen: a wall of water rolls across the stage, lifting whatever it meets.', pose: 'cast_up', s: 18, a: 1, r: 24, cd: 4, ai: { min: 150, max: 1400, use: 'zone' }, ev: { 3: () => sfx('miSong'), 18: f => { Combat.addHazard({ kind: 'miWave', owner: f, side: f.side, x: f.x + f.facing * 60, dir: f.facing, sp: 11, life: 140, hgt: 190, dmg: 84, move: F5, hit: new Set() }); sfx('miWave'); } } });
  const F6 = Mv.rush({ name: 'Kraken Rush', desc: 'Leviathan Queen: she surges forward riding a swell, and the swell carries the foe with her.', s: 8, speed: 1500, frames: 18, pass: false, hit: { dmg: 92, kb: [820, -240], launch: true, status: { slow: 1 } }, ev: { 1: () => sfx('miWave', 0, .8) } });
  const F2 = mk({ name: 'Maelstrom', desc: 'Leviathan Queen: a whirlpool under the foe that drags and batters for 4s.', pose: 'cast_up', s: 18, a: 1, r: 24, cd: 7, ai: { min: 100, max: 1200, use: 'zone' }, ev: { 18: f => { const t = f.opp; if (!t) return; Combat.addHazard({ kind: 'miPool', owner: f, side: f.side, x: clamp(t.x, 80, Arena.stage.width - 80), r: 240, life: 240 }); sfx('miWave', 0, 1.2); Cam.shake = 5; } } });
  const F4 = Mv.buff({ name: 'Pearl Barrier', desc: 'Leviathan Queen: a pearl bubble shields her for 3s, then pops into a spray of water shots.', effects: { shield: 220 }, dur: 3, cd: 8, ev: { 4: () => sfx('miBubble') } });
  { const e = F4.ev[14]; F4.ev[14] = f => { e(f); Game.later(3, () => { if (f.state !== 'ko') { Combat.fireShots(f, { speed: 900, r: 10, dmg: 34, count: 9, spread: 6.28, kind: 'orb', color: '#bff', core: '#fff', life: .7 }); sfx('miSplash'); } }); }; }
  const FJ = Mv.dive({ name: 'Trident Plunge', desc: 'Leviathan Queen: the trident goes first; she lands in a burst of water.', vx: 380, vy: 1700, hit: { dmg: 96, gb: true }, ev: { 1: () => sfx('miPlunge') }, onHit: a => { tide(a, 10); Combat.fireShots(a, { speed: 800, r: 12, dmg: 28, count: 5, spread: 1.4, angle: -1.2, kind: 'orb', color: '#bff', life: .6 }); } });
  const FU = PxKit.ult({ id: 'mira_fult', name: 'ABYSSAL TIDE', desc: 'Leviathan Queen: the sea comes in from both sides of the stage and meets in the middle. Blockable. Must connect.', pose: 'cast_up', s: 52, dmg: 1280, color: '#3ac8ff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'ABYSSAL TIDE', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#3ac8ff', c2: '#ffffff', c3: '#02203a', motif: 'shockwave', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'The sea is patient.', cap2: 'It keeps what it takes.', title: 'ABYSSAL TIDE', sub: 'THE SEA REMEMBERS', size: 106,
      cues: [[0, () => sfx('miSong')], [1.4, () => sfx('miCall', 0, 3)], [5.4, () => { sfx('miWave', 0, 2.4); sfx('miSplash', .3); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#02101e', bot: '#0a5a8a', clouds: '#0a2a44', rays: '#bff', moon: { x: .5, y: .2, r: 70, col: '#d8f4ff' } }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 52, w: 1200, h: 340, back: 500, start: f => { f.say('Come, my tide.', 90); sfx('miCall'); }, fire: f => { for (const s of [-1, 1]) Combat.addHazard({ kind: 'miWave', owner: f, side: f.side, x: s > 0 ? -40 : Arena.stage.width + 40, dir: s, sp: 14, life: 140, hgt: 260, dmg: 30, move: FU, hit: new Set() }); Cam.shake = 22; sfx('miWave', 0, 2.4); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Water armor, stronger geysers. New moveset: Tsunami Bolt, Kraken Rush, Maelstrom, Pearl Barrier, Trident Plunge, and the ultimate ABYSSAL TIDE.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: "LEVIATHAN'S CALL", dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#3ac8ff', c2: '#ffffff', c3: '#02203a', motif: 'beam', pose: ['idle', 'cast_up', 'cast', 'victory'], cap1: 'Sing, old one.', cap2: 'Rise.', title: "LEVIATHAN'S CALL", sub: 'IT HEARS', size: 94,
    cues: [[0, () => sfx('miSong')], [1.4, () => sfx('miCall', 0, 2.6)], [4.8, () => { sfx('miWave', 0, 2); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02101e', bot: '#0a4a7a', clouds: '#0a2a44', moon: { x: .7, y: .2, r: 60, col: '#d8f4ff' }, rain: '#bff' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'LEVIATHAN QUEEN', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#3ac8ff', c2: '#ffffff', c3: '#02203a', motif: 'rise', pose: ['idle', 'cast_up', 'victory'], lift: 36, cap1: 'The deep has a crown.', cap2: 'It fits.', title: 'LEVIATHAN QUEEN', sub: 'MIRA TIDE', size: 100,
    cues: [[0, () => sfx('miSong')], [1.4, () => sfx('miCall', 0, 2.4)], [3.9, () => { sfx('miWave', 0, 1.6); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02101e', bot: '#0a4a7a', clouds: '#0a2a44', rain: '#bff' }, k) });
})();
