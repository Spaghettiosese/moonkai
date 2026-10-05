// ============================================================
//  MOONKAI — MORPH, the Mimic. Pixel remake + PERFECT MIMIC moveset.
//  (DNA, Liquid Metal, Assimilate, Mirror Prison and Mirror Match stay as they were. Assimilate (↓I) is untouched in both forms.)
//  PERFECT MIMIC   MERCURY BARRAGE (5S) five blobs in a spread (when not copying), WHIPLASH (6S) the arm snaps out twice, HALL OF DECOYS (4S)
//                  three copies of itself, QUICKSILVER PLUNGE (jS).   ONE THOUSAND FACES (form ult)  every copy at once.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('morph');
  Object.assign(Sfx, {
    mpSplash(d = 0) { this.nsweep({ f0: 1400, f1: 300, dur: .3, vol: .18, type: 'lowpass', delay: d, wet: .4 }); this.fm({ f: 480, ratio: 1.5, index: 100, dur: .25, vol: .1, delay: d, wet: .5 }); },
    mpWhip(d = 0) { this.nsweep({ f0: 800, f1: 5000, dur: .12, vol: .22, q: 2, delay: d }); this.fm({ f: 1200, ratio: 3.2, index: 140, dur: .12, vol: .08, delay: d }); },
    mpChime(d = 0) { this.run({ notes: [784, 988, 1175, 1568], step: .09, dur: 1, vol: .08, bell: true, delay: d, wet: .9 }); },
    mpShimmer(d = 0, dur = 2) { this.voice({ f: 330, to: 340, dur, vol: .12, type: 'sine', n: 3, det: 40, delay: d, wet: .95 }); this.chord({ notes: [196, 247, 330], dur, vol: .1, type: 'sine', delay: d, wet: .95 }); },
    mpMerge(d = 0) { this.suck ? this.suck(.6, .2, d) : this.nsweep({ f0: 4000, f1: 200, dur: .6, vol: .16, type: 'lowpass', delay: d }); this.mpSplash(d + .5); },
  });
  PxKit.pixelize(def, { win: [-250, -340, 540, 400] });
  const F5 = Mv.shot({ name: 'Mercury Barrage', desc: 'Perfect Mimic: five blobs of liquid metal in a spread. Each samples DNA. (When copying the foe, their own move is used instead.)', proj: { speed: 700, r: 12, dmg: 36, count: 5, spread: .7, kind: 'orb', color: '#d8dce8', core: '#fff', life: 1.4, onHit: (t, p) => { p.owner.gauge = Math.min(100, (p.owner.gauge || 0) + 5); } }, ev: { 3: () => sfx('mpSplash') } });
  const F6 = mk({ name: 'Whiplash', desc: 'Perfect Mimic: the arm snaps out twice: once low, once high.', pose: 'punch', s: 8, a: 14, r: 20, ai: { min: 100, max: 460, use: 'zone' }, ev: { 8: f => { Combat.strikeZone(f, { x: f.facing > 0 ? f.x : f.x - 420, y: -50, w: 420, h: 50 }, { dmg: 46, guard: 'low', hs: 12, kb: [200 * f.facing, -80], sfx: 'm' }, { move: F6 }); sfx('mpWhip'); }, 16: f => { Combat.strikeZone(f, { x: f.facing > 0 ? f.x : f.x - 460, y: -170, w: 460, h: 80 }, { dmg: 64, guard: 'high', hs: 16, kb: [320 * f.facing, -360], launch: true, sfx: 'h' }, { move: F6 }); sfx('mpWhip', 0); f.gauge = Math.min(100, (f.gauge || 0) + 6); } } });
  const F4 = Mv.place({ name: 'Hall of Decoys', desc: 'Perfect Mimic: pours out three copies of itself, each with the foe\'s silhouette.', s: 14, spawn: { kind: 'clone', at: 'front', dx: 70, dmg: 60, life: 5, hp: 90, count: 3, spacing: 70, stagger: 6 }, cd: 7, ev: { 4: () => sfx('mpShimmer', 0, 1.2) } });
  const FJ = Mv.dive({ name: 'Quicksilver Plunge', desc: 'Perfect Mimic: falls as a pool of mercury; the landing splashes outward.', vx: 400, vy: 1500, hit: { dmg: 92, gb: true }, ev: { 1: () => sfx('mpSplash') }, onHit: a => { for (const s of [-1, 1]) Combat.fireShots(a, { speed: 800 * s, r: 11, dmg: 34, kind: 'orb', color: '#d8dce8', core: '#fff', life: .5, pierce: true, offY: 40 }); a.gauge = Math.min(100, (a.gauge || 0) + 8); sfx('mpSplash'); } });
  const FU = PxKit.ult({ id: 'morph_fult', name: 'ONE THOUSAND FACES', desc: 'Perfect Mimic: every copy it has ever made arrives at once, each wearing the foe\'s face. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1280, color: '#d8dce8',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'ONE THOUSAND FACES', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#d8dce8', c2: '#ffffff', c3: '#0a0c14', motif: 'barrage', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'You looked in a mirror.', cap2: 'The mirror kept going.', title: 'ONE THOUSAND FACES', sub: 'ALL OF THEM YOU', size: 84,
      cues: [[0, () => sfx('mpShimmer', 0, 3)], [1.4, () => sfx('mpChime')], [5.4, () => { sfx('mpMerge'); sfx('mpChime', .3); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#060810', bot: '#2a3040', stars: '#d8dce8', pillars: '#14181e' }, k); x.save(); x.globalCompositeOperation = 'lighter'; x.strokeStyle = `rgba(216,220,232,${.2 + .5 * k})`; x.lineWidth = 3; for (let i = 0; i < 9; i++) { const xx = (i + 1) * W / 10; x.strokeRect(xx - 40, H * .12, 80, H * .66); } x.restore(); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 54, w: 900, h: 340, back: 400, start: f => { f.say('Look closer.', 90); sfx('mpShimmer', 0, 2); }, fire: f => { for (let i = 0; i < 8; i++) Game.later(i * .06, () => { const t = f.opp; if (t) { Game.fx.burst(t.x + rand(-200, 200), -80 + rand(-50, 50), 6, { color: ['#d8dce8', '#fff'], size: 9, speed: 300, life: .35, glow: true }); sfx('mpWhip', 0); } }); Cam.shake = 18; sfx('mpMerge'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Perfect mimic: DNA fills twice as fast and assimilation lasts 15s. New moves: Mercury Barrage, Whiplash, Hall of Decoys, Quicksilver Plunge, and the ultimate ONE THOUSAND FACES.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'MIRROR MATCH', dur: 8.2, tc: [1.0, 4.2], tf: 5.0, c1: '#d8dce8', c2: '#ffffff', c3: '#0a0c14', motif: 'rift', pose: ['idle', 'cast', 'cast', 'victory'], cap1: 'Wearing your walk.', cap2: 'Wearing your face.', title: 'MIRROR MATCH', sub: 'WHICH ONE IS YOU', size: 92,
    cues: [[0, () => sfx('mpShimmer', 0, 2.4)], [1.4, () => sfx('mpChime')], [5.0, () => { sfx('mpMerge'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#060810', bot: '#2a3040', stars: '#d8dce8', pillars: '#14181e' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'PERFECT MIMIC', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#d8dce8', c2: '#ffffff', c3: '#0a0c14', motif: 'implode', pose: ['idle', 'cast_up', 'victory'], lift: 24, cap1: 'I was never a shape.', cap2: 'I was always the next one.', title: 'PERFECT MIMIC', sub: 'MORPH', size: 100,
    cues: [[0, () => sfx('mpShimmer', 0, 2.4)], [1.4, () => sfx('mpMerge')], [3.7, () => { sfx('mpChime'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#060810', bot: '#2a3040', stars: '#d8dce8', rays: '#d8dce8' }, k) });
})();
