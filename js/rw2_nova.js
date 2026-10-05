// ============================================================
//  MOONKAI — NOVA, the Headliner. Pixel remake + a real kit.
//
//  HYPE (new gauge)  every hit in a combo works the crowd. At 100 the next special is an ENCORE: it fires twice, and every note charms.
//  ENCORE (passive)  her specials charm on every third hit (as before).
//  ENCORE FORM   POWER CHORD (5S) a wall of amplified sound, DANCE FLOOR (6S) a zone that hits on the beat, PYRO SHOW (2S) fireworks in time,
//                CROWD SURF (4S) she is carried across the stage and healed, STAGE DIVE (jS).   WORLD TOUR (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('nova');
  Object.assign(Sfx, {
    nvNote(d = 0, p = 1) { this.fm({ f: 880 * p, ratio: 2, index: 70, dur: .5, vol: .14, delay: d, wet: .7 }); this.voice({ f: 880 * p, dur: .3, vol: .08, type: 'sawtooth', lp: 3000, delay: d, wet: .5 }); },
    nvChord(d = 0) { this.chord({ notes: [220, 277, 330, 440], dur: 1.2, vol: .22, type: 'sawtooth', lp: 3000, delay: d, wet: .6, det: 14 }); this.impact(.5, d); },
    nvKick(d = 0) { this.sub({ f: 120, to: 40, dur: .25, vol: .5, delay: d }); this.nsweep({ f0: 3000, f1: 200, dur: .1, vol: .2, delay: d }); },
    nvFire(d = 0) { this.nsweep({ f0: 800, f1: 6000, dur: .5, vol: .16, delay: d, wet: .5 }); this.crackle({ dur: .5, vol: .1, delay: d + .3, lo: 1000, hi: 8000 }); },
    nvCrowd(d = 0, dur = 2.5) { this.nsweep({ f0: 800, f1: 2600, dur, vol: .22, q: .6, delay: d, swell: true, wet: .7 }); this.crackle({ dur, vol: .12, delay: d, lo: 500, hi: 5000 }); },
    nvEncore(d = 0) { for (let i = 0; i < 4; i++) this.nvKick(d + i * .35); this.nvChord(d + 1.4); this.nvCrowd(d, 3); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const t = v.anim || 0; if ((v.gauge || 0) >= 100 || v.transformed) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { c.fillStyle = ['#ff5ac8', '#ffe05a', '#5aeaff'][i % 3]; c.fillRect(Math.round(P.sh[0] - 40 + i * 14), Math.round(P.sh[1] - 20 + Math.sin(t * 5 + i) * 10), 4, 4); } c.restore(); } } });
  const hype = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };
  Rw2.merge(def, {
    gauge: { name: 'HYPE', max: 100, color: '#ff5ac8', label: f => ((f.gauge || 0) >= 100 ? '· ENCORE READY' : '') },
    passive: ['Encore', 'Her specials charm on every third hit. Combos work the crowd (HYPE); at 100 the next special is an ENCORE: it fires twice and every note charms.'],
    onRoundStart: f => { f.gauge = 0; },
    onHit: (a, t) => { hype(a, 6); },
    passiveTick: f => { if (f.st % 20 === 0 && !f.move && (f.gauge || 0) < 100) f.gauge = Math.max(0, (f.gauge || 0) - 1); },
  });
  { const m = PxKit.setMove(def, '5S', Mv.shot({ name: 'High Note', desc: 'A piercing note. With a full HYPE gauge it is an ENCORE: it sounds twice and charms.', proj: { speed: 900, r: 11, dmg: 50, kind: 'note', color: '#ff5ac8', core: '#fff', pierce: false, life: 1.6 }, ev: { 2: () => sfx('nvNote') } })); const e = m.ev[12]; m.ev[12] = f => { e(f); if ((f.gauge || 0) >= 100) { f.gauge = 0; Game.popWorld(f.x, f.y - f.h - 40, 'ENCORE!', '#ff5ac8', 26); sfx('nvEncore', 0); Game.later(.3, () => { Combat.fireShots(f, { speed: 900, r: 11, dmg: 50, kind: 'note', color: '#ffe05a', core: '#fff', life: 1.6, status: { confuse: 1.2 } }); sfx('nvNote', 0, 1.3); }); } }; }
  Combat.hz.nvFloor = function (h) { const f = h.owner; if (!f) return false; if (h.t % 30 === 0) { h.beat = (h.beat || 0) + 1; sfx('nvKick'); for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r && e.y > -60) { Combat.resolveHit(e, f, H_({ dmg: h.beat % 4 === 0 ? 56 : 22, guard: 'low', hs: 10, kb: [0, h.beat % 4 === 0 ? -520 : -90], launch: h.beat % 4 === 0, sfx: 'm' }), { proj: true, fromX: h.x }); hype(f, 3); } } return h.t < h.life; };
  Combat.drawHz.nvFloor = (c, h) => { const k = Math.min(1, h.t / 10, (h.life - h.t) / 16), cols = ['#ff5ac8', '#ffe05a', '#5aeaff', '#7aff6a']; c.save(); c.globalAlpha = k; for (let i = 0; i < 8; i++) { const on = (Math.floor(h.t / 15) + i) % 4 === 0; c.fillStyle = cols[i % 4]; c.globalAlpha = k * (on ? .95 : .35); c.fillRect(h.x - h.r + i * (h.r * 2 / 8), -8, h.r * 2 / 8 - 2, 8); } c.restore(); };

  const F5 = mk({ name: 'Power Chord', desc: 'Encore Form: a wall of amplified sound that shoves the foe across the stage.', pose: 'punch', s: 14, a: 1, r: 24, cd: 3, ai: { min: 0, max: 700, use: 'zone' }, ev: { 3: () => sfx('nvKick'), 14: f => { Combat.fireShots(f, { speed: 1100, r: 40, dmg: 60, kind: 'ring', color: '#ff5ac8', core: '#fff', pierce: true, life: .5, kb: [620, -120], hs: 20 }); sfx('nvChord'); Cam.shake = 8; hype(f, 8); } } });
  const F6 = mk({ name: 'Dance Floor', desc: 'Encore Form: a lit dance floor for 4s. It hits on every beat, harder on the fourth.', pose: 'cast_up', s: 16, a: 1, r: 24, cd: 7, ai: { min: 100, max: 900, use: 'zone' }, ev: { 16: f => { const t = f.opp; Combat.addHazard({ kind: 'nvFloor', owner: f, side: f.side, x: t ? clamp(t.x, 120, Arena.stage.width - 120) : f.x, r: 210, life: 240 }); sfx('nvChord'); } } });
  const F2 = mk({ name: 'Pyro Show', desc: 'Encore Form: fireworks go off in time: a pillar every beat, marching out from the foe.', pose: 'cast_up', s: 18, a: 1, r: 26, cd: 6, ai: { min: 100, max: 1000, use: 'zone' }, ev: { 18: f => { Rw2.row(f, 7, 100, { from: 'foe', r: 44, life: 10, stagger: 8, color: '#ffe05a', dmg: 60, status: { burn: 1 }, move: F2, shake: 4 }); sfx('nvFire'); sfx('nvKick', .2); } } });
  const F4 = mk({ name: 'Crowd Surf', desc: 'Encore Form: the crowd carries her across the stage (invulnerable) and sets her down healed.', pose: 'dash', s: 4, a: 20, r: 14, inv: [1, 26], vel: [[4, 24, 1100, null]], ai: { min: 150, max: 1200, use: 'approach' }, ev: { 3: () => sfx('nvCrowd', 0, 1), 26: f => { Combat.healSelf(f, 160); hype(f, 20); sfx('nvNote', 0, 1.5); } } });
  const FJ = Mv.shot({ name: 'Stage Dive', desc: 'Encore Form: a rain of notes from above, then she follows them down.', proj: { speed: 900, angle: 1.1, spread: .9, count: 6, r: 11, dmg: 36, kind: 'note', color: '#ffe05a', core: '#fff', life: 1.2 }, ev: { 2: () => sfx('nvNote') } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'nova_fult', name: 'WORLD TOUR', desc: 'Encore Form: eight cities, eight encores, one set. The stage fills with light. Blockable. Must connect.', pose: 'cast_up', s: 52, dmg: 1280, color: '#ff5ac8',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'WORLD TOUR', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#ff5ac8', c2: '#ffe05a', c3: '#14041a', motif: 'beam', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Are you ready, Metro City?', cap2: 'ONE MORE SONG!', title: 'WORLD TOUR', sub: 'SOLD OUT', size: 110,
      cues: [[0, () => sfx('nvCrowd', 0, 3)], [1.4, () => sfx('nvEncore')], [5.4, () => { sfx('nvChord'); sfx('nvFire'); sfx('nvCrowd', 0, 2); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#0a0214', bot: '#4a0a4a', city: '#14041a', lit: .8 }, k); x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const a = -1.9 + i * .3 + Math.sin(t * 2 + i) * .1 * k; x.fillStyle = ['rgba(255,90,200,.16)', 'rgba(255,224,90,.14)', 'rgba(90,234,255,.14)'][i % 3]; x.beginPath(); x.moveTo(W * .5, 0); x.lineTo(W * .5 + Math.cos(a) * 1600 - 70, Math.sin(a) * -1600 + 1000); x.lineTo(W * .5 + Math.cos(a) * 1600 + 70, Math.sin(a) * -1600 + 1000); x.fill(); } x.restore(); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 52, w: 1000, h: 340, back: 400, start: f => { f.say('ONE MORE SONG!', 90); sfx('nvEncore'); }, fire: f => { for (let i = 0; i < 8; i++) Game.later(i * .08, () => { const x = clamp(f.x + f.facing * (-100 + i * 120), 30, Arena.stage.width - 30); Combat.explode(x, -70, 70, f, 0, ['#ff5ac8', '#ffe05a', '#5aeaff'][i % 3]); sfx('nvNote', 0, 1 + i * .08); }); Cam.shake = 18; sfx('nvChord'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Stage outfit: faster, notes pierce. New moveset: Power Chord, Dance Floor, Pyro Show, Crowd Surf, Stage Dive, and the ultimate WORLD TOUR.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'FINAL CONCERT', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#ff5ac8', c2: '#ffe05a', c3: '#14041a', motif: 'beam', pose: ['idle', 'cast_up', 'cast', 'victory'], cap1: 'This one goes out to you.', cap2: 'Loudly.', title: 'FINAL CONCERT', sub: 'THE STADIUM ROARS', size: 98,
    cues: [[0, () => sfx('nvCrowd', 0, 2.4)], [1.4, () => sfx('nvChord')], [4.8, () => { sfx('nvNote', 0, 1.2); sfx('nvChord'); sfx('nvCrowd', 0, 2); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0214', bot: '#3a0a3a', city: '#14041a', lit: .9, rays: '#ff5ac8' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'ENCORE', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#ff5ac8', c2: '#ffe05a', c3: '#14041a', motif: 'rain', shape: 'rect', pose: ['idle', 'cast_up', 'victory'], lift: 30, cap1: 'They are chanting my name.', cap2: 'Time for the second outfit.', title: 'ENCORE', sub: 'NOVA', size: 112,
    cues: [[0, () => sfx('nvCrowd', 0, 2)], [1.4, () => sfx('nvEncore')], [3.7, () => { sfx('nvChord'); sfx('nvCrowd'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0214', bot: '#4a0a4a', city: '#14041a', lit: .8, rays: '#ffe05a' }, k) });
})();
