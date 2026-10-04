// ============================================================
//  MOONKAI — AATROX rework: WORLD ENDER gets a moveset of its own and an ultimate, RAGNAROK.
//  (He already rises from a cocoon when he falls, so he gets no second revival.)
//   WINGS OF RUIN (6S)  a flying dash through the foe.      RIFT STEP (4S)  behind the foe, with lifesteal.
//   HELLCHAINS: PRISON (2S)  three chains close on the foe.   RUIN METEOR (jS)  a diving blow.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('aatrox');
  Object.assign(Sfx, {
    aatWing(d = 0) { this.nsweep({ f0: 300, f1: 2400, dur: .5, vol: .22, q: 1.4, delay: d, wet: .4 }); this.voice({ f: 90, to: 140, dur: .4, vol: .16, type: 'sawtooth', lp: 500, delay: d }); },
    aatRift(d = 0) { this.nsweep({ f0: 6000, f1: 200, dur: .2, vol: .2, type: 'highpass', delay: d }); this.voice({ f: 1100, to: 80, dur: .25, vol: .12, delay: d }); this.sub({ f: 70, to: 30, dur: .4, vol: .3, delay: d + .1 }); },
    aatChain(d = 0) { for (let i = 0; i < 5; i++) this.fm({ f: 700 + i * 90, ratio: 3.9, index: 360, dur: .14, vol: .1, delay: d + i * .05, wet: .3 }); },
    aatRagnarok(d = 0) { this.sub({ f: 55, to: 22, dur: 2, vol: .5, delay: d }); this.chord({ notes: [55, 82, 98, 147], dur: 3.4, vol: .3, type: 'sawtooth', lp: 700, delay: d, wet: .9, det: 26 }); this.rumble(3, .3, d); },
    aatSlash(d = 0) { this.nsweep({ f0: 1400, f1: 9000, dur: .14, vol: .3, type: 'bandpass', q: 1.2, delay: d }); this.fm({ f: 240, ratio: 5.1, index: 400, dur: .35, vol: .16, delay: d, wet: .3 }); this.impact(.7, d + .02); },
  });
  const F6 = Object.assign(Mv.rush({ name: 'Wings of Ruin', desc: 'World Ender: he takes to his wings and tears through the foe, leaving them weakened.', speed: 1750, frames: 14, pass: true, hit: { dmg: 92, kb: [380, -420], launch: true, status: { weaken: 3 } }, ev: { 1: () => sfx('aatWing') } }), {});
  const F4 = Mv.teleport({ name: 'Rift Step', desc: 'World Ender: steps through a tear in the world to appear behind the foe and cleave, healing from the wound.', to: 'behind', pose: 'heavy', s: 6, hit: { dmg: 84, box: [0, -120, 120, 110], kb: [520, -260], launch: true } });
  { const e = F4.ev[5]; F4.ev[5] = f => { e(f); sfx('aatRift'); }; F4.onHit = a => { a.hp = Math.min(a.maxHp, a.hp + Math.round(a.maxHp * 0.04)); }; }
  const F2 = Mv.place({ name: 'Hellchains: Prison', desc: 'World Ender: three chains lash up around the foe and hold them.', spawn: { kind: 'trap', at: 'enemy', color: '#ff2a2a', stun: 1.1, dmg: 46, count: 3, spacing: 70, stagger: 0.06 }, cd: 5, ev: { 8: () => sfx('aatChain') } });
  const FJ = Mv.dive({ name: 'Ruin Meteor', desc: 'World Ender: he comes down like a falling star, bouncing the foe off the ground.', vx: 820, vy: 1700, hit: { dmg: 112, gb: true }, ev: { 1: () => sfx('aatWing') } });
  const FU = PxKit.ult({ id: 'aatrox_fult', name: 'RAGNAROK', desc: 'World Ender: the sword remembers every god it has killed. Seven cuts end the world around the foe. Blockable. Must connect.', pose: 'heavy', s: 52, dmg: 1380, color: '#ff2a2a', swing: [-2, -2.4, 1.2],
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'RAGNAROK', dur: 8.2, tc: [1.0, 4.0], tf: 5.0, c1: '#ff3a2a', c2: '#ffb090', c3: '#3a0610', motif: 'slashes', pose: ['idle', 'cast_up', 'heavy', 'victory'], actorForm: true, cap1: 'I have killed gods.', cap2: 'The world is only the next.', title: 'RAGNAROK', sub: 'THE WORLD ENDS', size: 124,
      cues: [[0, () => sfx('aatRagnarok')], [1.2, () => sfx('riser', 3.4, .26, 0, 80, 1400)], [5.0, () => { sfx('aatSlash'); sfx('aatSlash', .12); sfx('aatSlash', .24); sfx('aatSlash', .36); sfx('aatSlash', .48); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0206', bot: '#4a0a14', moon: { x: .55, y: .26, r: 130 - k * 40, col: '#ff4a3a' }, embers: '#ff6a3a', ruins: '#1a050a', stars: '#ff9a8a' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 52, w: 800, h: 320, start: f => { f.say('Every god dies.', 100); sfx('aatRagnarok'); }, fire: f => { for (let i = 0; i < 5; i++) Combat.telegraph(f, { x: clamp(f.x + f.facing * (150 + i * 140), 40, Arena.stage.width - 40), r: 50, life: 4 + i * 3, color: '#ff2a2a', column: true, onFire: h => { Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 14, color: '#ff2a3a', dark: true }); sfx('aatSlash'); } }); Cam.shake = 20; sfx('aatSlash'); } });
  PxKit.formKit(def, { moves: { '6S': F6, '4S': F4, '2S': F2, 'jS': FJ }, ult: FU, desc: 'Timed (10s). Wings, hellfire, a bigger blade. New moveset: Wings of Ruin, Rift Step, Hellchains: Prison, Ruin Meteor, and the ultimate RAGNAROK.' });
  { const sf = def.specialFor; def.specialFor = (f, slot) => (f.form && slot !== '5S' && def.form.moves[slot]) ? def.form.moves[slot] : (sf ? sf(f, slot) : undefined); }
})();
