// ============================================================
//  MOONKAI — JINX rework: pixel art, and ARCANE (blue braids, no safety catch) with its own moveset and ultimate.
//   POW-POW: OVERCLOCK (5S) a triple burst     ZAP!: SUPERCHARGED (6S) a piercing lightning bolt
//   CHOMPERS: CHAIN (2S) five mines in a row   ROCKET RUSH (4S) a dash on a rocket    PYROTECHNICS (jS) a dive that explodes
//   ARCANE: DEATH ROCKET VOLLEY (ultimate)
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('jinx');
  Object.assign(Sfx, {
    jinxGun(d = 0) { this.nsweep({ f0: 3000, f1: 800, dur: .08, vol: .26, type: 'bandpass', q: 1.4, delay: d }); this.fm({ f: 200, ratio: 3.3, index: 300, dur: .12, vol: .14, delay: d, wet: .2 }); },
    jinxZap(d = 0) { this.crackle({ dur: .5, vol: .16, delay: d, lo: 800, hi: 6000 }); this.voice({ f: 1800, to: 240, dur: .4, vol: .14, type: 'sawtooth', lp: 3000, delay: d, wet: .3 }); },
    jinxPop(d = 0) { this.voice({ f: 500, to: 80, dur: .14, vol: .22, type: 'square', delay: d }); this.nsweep({ f0: 4000, f1: 300, dur: .16, vol: .2, type: 'lowpass', delay: d, wet: .3 }); },
    jinxRocket(d = 0, dur = .9) { this.nsweep({ f0: 800, f1: 3000, dur, vol: .22, q: .9, delay: d, wet: .3 }); this.voice({ f: 120, to: 300, dur, vol: .12, type: 'sawtooth', lp: 900, delay: d }); },
    jinxGiggle(d = 0) { for (let i = 0; i < 5; i++) this.voice({ f: 900 + (i % 2) * 260, to: 1100 + (i % 2) * 260, dur: .09, vol: .08, type: 'triangle', delay: d + i * .1, wet: .3 }); },
    jinxBoom(d = 0) { this.impact(1, d); this.jinxPop(d); this.crackle({ dur: .6, vol: .1, delay: d, lo: 300, hi: 3000 }); },
  });
  PxKit.pixelize(def, { win: [-210, -330, 470, 390] }); { const op = def.drawPortrait; if (op) { const px = PxKit.portrait('jinx', op, { res: 64, levels: 8, dither: .3 }); def.drawPortrait = (c, o, d) => PxKit.on() ? px(c, o, d) : op(c, o, d); } }

  const F5 = Mv.shot({ name: 'Pow-Pow: Overclock', desc: 'Arcane: the minigun spins up for a triple burst.', proj: { speed: 1250, r: 9, dmg: 30, count: 3, spread: .14, kind: 'orb', color: '#6ad8ff', pierce: false }, ev: { 2: () => sfx('jinxGun'), 5: () => sfx('jinxGun'), 8: () => sfx('jinxGun') } });
  const F6 = Mv.shot({ name: 'Zap!: Supercharged', desc: 'Arcane: a lightning bolt that pierces everything in the lane.', s: 16, proj: { speed: 1700, r: 14, dmg: 86, kind: 'spear', color: '#8ae8ff', core: '#ffffff', pierce: true, kb: [420, -120] }, ev: { 3: () => sfx('jinxZap'), 16: () => sfx('jinxZap') } });
  const F2 = Mv.place({ name: 'Chompers: Chain', desc: 'Arcane: five chompers snap shut in a row ahead of her.', spawn: { kind: 'mine', at: 'front', dx: 110, dmg: 62, color: '#ff4ad0', body: '#6ad8ff', count: 5, spacing: 80, stagger: 0.05 }, cd: 5, ev: { 4: () => sfx('jinxGiggle') } });
  const F4 = Mv.rush({ name: 'Rocket Rush', desc: 'Arcane: she rides a rocket through the foe.', speed: 1700, frames: 14, pass: true, hit: { dmg: 90, kb: [420, -380], launch: true }, ev: { 1: () => sfx('jinxRocket') } });
  const FJ = Mv.dive({ name: 'Pyrotechnics', desc: 'Arcane: a diving blow with a rocket in each hand; it blows up on landing.', vx: 700, vy: 1500, hit: { dmg: 106, gb: true }, ev: { 1: () => sfx('jinxRocket', 0, .5) } });
  const FU = PxKit.ult({ id: 'jinx_fult', name: 'ARCANE: DEATH ROCKET VOLLEY', desc: 'Arcane: every rocket she owns, at once. The lane is a firework. Blockable. Must connect.', pose: 'cast', s: 46, dmg: 1260, color: '#6ad8ff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'DEATH ROCKET VOLLEY', dur: 8.0, tc: [1.2, 3.8], tf: 4.8, c1: '#ff4ad0', c2: '#6ad8ff', c3: '#2a0a4a', motif: 'barrage', pose: ['taunt', 'cast', 'cast', 'victory'], actorForm: true, cap1: 'Ooh, is it my birthday?', cap2: 'Yes. Yes it is.', title: 'ROCKET VOLLEY', sub: 'BOOM, BABY', size: 104,
      cues: [[0, () => sfx('jinxGiggle')], [1.4, () => sfx('riser', 3, .2, 0, 120, 1800)], [4.8, () => { for (let i = 0; i < 9; i++) sfx('jinxPop', i * .08); sfx('jinxBoom', .6); sfx('jinxBoom', 1.1); sfx('jinxRocket', 0, 1.4); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#10001e', bot: '#4a0a5a', city: '#14041e', lit: .5 + k, rain: '#9a6aff', clouds: 'rgba(60,20,90,0.9)' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 46, w: 900, h: 300, start: f => { f.say('SURPRISE!', 80); sfx('jinxGiggle'); }, fire: f => { for (let i = 0; i < 6; i++) Combat.telegraph(f, { x: clamp(f.x + f.facing * (160 + i * 120), 40, Arena.stage.width - 40), r: 56, life: 4 + i * 3, color: '#ff4ad0', onFire: h => { Combat.explode(h.x, -60, 80, f, 0, '#ff4ad0'); sfx('jinxBoom'); } }); Cam.shake = 18; sfx('jinxRocket', 0, 1.2); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Faster, wilder. New moveset: Pow-Pow: Overclock, Zap!: Supercharged, Chompers: Chain, Rocket Rush, Pyrotechnics, and the ultimate ARCANE: DEATH ROCKET VOLLEY.' });
})();
