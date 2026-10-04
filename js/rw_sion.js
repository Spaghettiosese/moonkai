// ============================================================
//  MOONKAI — SION rework: UNDYING JUGGERNAUT gets a moveset and an ultimate, THE UNDYING LEGION.
//  (Glory in Death, his rise as a corpse, is unchanged: it is the one revival he keeps.)
//   QUAKE SMASH (5S)  a ground-splitting overhead     BELLOW (6S)  a roar that staggers     OVERFLOW (2S)  a shield + life
//   UNSTOPPABLE (4S)  a long armored charge           CRATER DROP (jS)
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('sion');
  Object.assign(Sfx, {
    sioSmash(d = 0) { this.impact(1, d); this.fm({ f: 90, ratio: 1.8, index: 400, dur: .6, vol: .2, delay: d, wet: .4 }); },
    sioRoar(d = 0, dur = 1.8) { this.voice({ f: 96, to: 52, dur, vol: .32, type: 'sawtooth', lp: 800, n: 4, det: 30, delay: d, wet: .5 }); this.nsweep({ f0: 200, f1: 1100, dur: dur * .7, vol: .14, q: 1.2, delay: d }); this.sub({ f: 64, to: 26, dur, vol: .4, delay: d }); },
    sioStep(d = 0) { this.sub({ f: 70, to: 40, dur: .22, vol: .3, delay: d }); this.nsweep({ f0: 800, f1: 120, dur: .2, vol: .1, type: 'lowpass', delay: d }); },
    sioLegion(d = 0, dur = 3) { this.rumble(dur, .36, d); for (let i = 0; i < 12; i++) this.sioStep(d + i * dur / 12); this.chord({ notes: [49, 73, 98, 147], dur, vol: .26, type: 'sawtooth', lp: 600, delay: d, wet: .9, det: 24 }); },
  });
  const F5 = Mv.custom({ name: 'Quake Smash', desc: 'Undying: an overhead blow that splits the ground in a line of rubble.', pose: 'slam', s: 18, a: 6, r: 26, ai: { min: 40, max: 260, use: 'combo' }, hit: { dmg: 110, box: [8, -160, 200, 160], kb: [460, -520], launch: true, hs: 28, sfx: 'h' }, ev: { 8: () => sfx('sioStep'), 18: f => { Combat.addHazard({ kind: 'mkCrack', owner: f, side: f.side, x: f.x + f.facing * 160, life: 30 }); sfx('sioSmash'); Cam.shake = 10; } } });
  const F6 = Mv.custom({ name: 'Bellow', desc: 'Undying: a roar that staggers everything in front of him and drives it back.', pose: 'charge', s: 14, a: 10, r: 22, cd: 4, ai: { min: 0, max: 260, use: 'combo' }, hit: { dmg: 50, box: [0, -160, 280, 160], stun: 0.7, kb: [620, 0], hs: 18 }, ev: { 2: () => sfx('sioRoar', 0, 1.2), 14: f => { Combat.addHazard({ kind: 'leoRoar', owner: f, side: f.side, x: f.x, dir: f.facing, life: 30 }); Cam.shake = 8; } } });
  const F2 = Mv.custom({ name: 'Overflow', desc: 'Undying: the furnace overflows. He is shielded and heals 6%, and gets a surge of speed.', pose: 'charge', s: 12, a: 1, r: 18, cd: 10, ai: { min: 0, max: 2000, use: 'buff' }, ev: { 12: f => { Combat.buff(f, { shield: 200, haste: 1 }, 4, 'OVERFLOW'); Combat.healSelf(f, Math.round(f.maxHp * .06)); sfx('sioRoar', 0, .9); } } });
  const F4 = Mv.rush({ name: 'Unstoppable', desc: 'Undying: a long armored charge that nothing short of a heavy can stop.', speed: 1250, frames: 28, armor: [1, 30], hit: { dmg: 30, multi: 6, every: 4, kb: [380, -260], wb: true }, ev: { 1: () => sfx('sioStep'), 8: () => sfx('sioStep'), 16: () => sfx('sioStep') } });
  const FJ = Mv.dive({ name: 'Crater Drop', desc: 'Undying: he comes down with the whole axe and cracks the ground.', vx: 400, vy: 1600, hit: { dmg: 116, gb: true }, ev: { 1: () => sfx('sioStep') } });
  const FU = PxKit.ult({ id: 'sion_fult', name: 'THE UNDYING LEGION', desc: 'Undying: every soldier he ever killed marches with him. A wall of the dead sweeps the stage. Blockable. Must connect.', pose: 'charge', s: 52, dmg: 1280, color: '#ff9a5a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'THE UNDYING LEGION', dur: 8.4, tc: [1.2, 4.2], tf: 5.2, c1: '#ff8a4a', c2: '#ffd0a0', c3: '#2a1a14', motif: 'shockwave', pose: ['idle', 'charge', 'slam', 'victory'], actorForm: true, cap1: 'They never stopped.', cap2: 'Neither will I.', title: 'THE UNDYING LEGION', sub: 'NOBODY STAYS DEAD', size: 84,
      cues: [[0, () => sfx('sioRoar')], [1.2, () => sfx('sioLegion', 0, 4)], [5.2, () => { sfx('sioSmash'); sfx('sioRoar'); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#0a0806', bot: '#3a2418', ruins: '#140c08', fog: 'rgba(120,90,70,0.18)', embers: '#ff8a4a' }, k); x.fillStyle = '#05030a'; for (let i = 0; i < 22; i++) { const px_ = ((i * 90 + t * (30 + i % 4 * 10)) % (W + 160)) - 80, py = H - 90 - (i % 3) * 24; x.fillRect(px_, py - 60, 22, 60); x.fillRect(px_ + 4, py - 76, 14, 14); x.fillRect(px_ + 18, py - 52, 28, 4); } } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 52, w: 900, h: 300, start: f => { f.say('Rise, all of you!', 90); sfx('sioLegion', 0, 2.4); }, fire: f => { Combat.addHazard({ kind: 'mkLegion', owner: f, side: f.side, x: f.x, dir: f.facing, life: 60 }); Cam.shake = 18; sfx('sioSmash'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Timed. Heavier, harder to stop. New moveset: Quake Smash, Bellow, Overflow, Unstoppable, Crater Drop, and the ultimate THE UNDYING LEGION. Glory in Death still raises him once a round.' });
})();
