// ============================================================
//  MOONKAI — RAZOR rework: BLOODRAGE gets a moveset and an ultimate, BLOOD MOON.
//   BLOOD TSUNAMI (5S)  a towering wave     BERSERK RUSH (6S)  long, armored     CRIMSON PILLAR (2S)  a launching spike
//   EXECUTION (4S)  an overhead chop that hits harder on low-health foes    SKULL MORTAR (jS)  a diving blow
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('razor');
  Object.assign(Sfx, {
    razSlash(d = 0) { this.nsweep({ f0: 600, f1: 5000, dur: .18, vol: .26, q: 1, delay: d }); this.fm({ f: 140, ratio: 3.7, index: 500, dur: .35, vol: .16, delay: d, wet: .2 }); this.impact(.6, d + .03); },
    razWave(d = 0) { this.nsweep({ f0: 200, f1: 1800, dur: .6, vol: .22, q: 1.2, delay: d, wet: .4 }); this.sub({ f: 70, to: 36, dur: .6, vol: .3, delay: d }); },
    razRage(d = 0) { this.voice({ f: 110, to: 70, dur: 1.3, vol: .3, type: 'sawtooth', lp: 900, n: 4, det: 34, delay: d, wet: .4 }); this.crackle({ dur: 1.2, vol: .12, delay: d, lo: 200, hi: 2800 }); },
    razMoon(d = 0) { this.sub({ f: 52, to: 24, dur: 2.2, vol: .5, delay: d }); this.chord({ notes: [58, 87, 116, 174], dur: 3.4, vol: .3, type: 'sawtooth', lp: 650, delay: d, wet: .9, det: 28 }); this.rumble(3, .3, d); },
    razPillar(d = 0) { this.impact(.8, d); this.razSlash(d); },
  });
  const F5 = Mv.shot({ name: 'Blood Tsunami', desc: 'Bloodrage: a wall of blood sweeps the lane and carries the foe with it.', proj: { speed: 700, r: 36, dmg: 60, kind: 'crescent', color: '#c01818', core: '#ff8a8a', pierce: true, hits: 3, kb: [360, -120] }, ev: { 3: () => sfx('razWave') } });
  const F6 = Mv.rush({ name: 'Berserk Rush', desc: 'Bloodrage: a long armored charge that cleaves through everything.', speed: 1500, frames: 24, armor: [1, 26], hit: { dmg: 24, multi: 5, every: 4, kb: [300, -200] }, ev: { 1: () => sfx('razRage') } });
  const F2 = Mv.place({ name: 'Crimson Pillar', desc: 'Bloodrage: blood spikes erupt under the foe in a line.', spawn: { kind: 'spike', at: 'enemy', delay: 0.4, dmg: 80, color: '#c01818', fill: '#5a0808', count: 3, spacing: 90, stagger: 0.08 }, cd: 4, ev: { 6: () => sfx('razPillar') } });
  const F4 = Mv.custom({ name: 'Execution', desc: 'Bloodrage: an overhead chop that hits much harder on a foe under 40% health.', pose: 'slam', s: 16, a: 5, r: 24, ai: { min: 40, max: 200, use: 'combo' }, hit: { dmg: 96, box: [6, -150, 160, 150], kb: [300, -300], hs: 26, sfx: 'h' }, ev: { 6: () => sfx('razSlash') }, onHit: (a, t) => { if (t.hp < t.maxHp * 0.4 && t.hp > 1) { t.hp = Math.max(1, t.hp - 80); Game.popWorld(t.x, t.y - t.h - 30, 'EXECUTED', '#ff3030', 22); } } });
  const FJ = Mv.dive({ name: 'Skull Mortar', desc: 'Bloodrage: a falling blow with the whole sword behind it.', vx: 500, vy: 1600, hit: { dmg: 112, gb: true }, ev: { 1: () => sfx('razWave') } });
  const FU = PxKit.ult({ id: 'razor_fult', name: 'BLOOD MOON', desc: 'Bloodrage: the moon turns red. Every wound in the arena opens at once. Blockable. Must connect.', pose: 'heavy', s: 50, dmg: 1280, color: '#c01818',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'BLOOD MOON', dur: 8.2, tc: [1.0, 4.0], tf: 5.0, c1: '#ff2a2a', c2: '#ff9a8a', c3: '#3a0408', motif: 'shockwave', pose: ['taunt', 'cast_up', 'heavy', 'victory'], actorForm: true, cap1: 'Look up.', cap2: 'It is hungry too.', title: 'BLOOD MOON', sub: 'THE ARENA BLEEDS', size: 108,
      cues: [[0, () => sfx('razRage')], [1.2, () => sfx('razMoon')], [5.0, () => { sfx('razSlash'); sfx('razPillar'); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0204', bot: '#4a0a0a', moon: { x: .55, y: .28, r: 80 + k * 140, col: '#ff2a2a', crater: true }, embers: '#ff4a3a', ruins: '#1a0406', stars: '#ff9a8a' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 50, w: 880, h: 300, back: 80, start: f => { f.say('FEED IT!', 80); sfx('razMoon'); }, fire: f => { for (let i = 0; i < 4; i++) Combat.telegraph(f, { x: clamp(f.x + f.facing * (130 + i * 150), 40, Arena.stage.width - 40), r: 56, life: 4 + i * 3, color: '#ff2a2a', column: true, onFire: h => { Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 16, color: '#ff2a3a', dark: true, spike: true }); sfx('razPillar'); } }); Cam.shake = 20; sfx('razSlash'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Timed. Faster, harder, bleeding. New moveset: Blood Tsunami, Berserk Rush, Crimson Pillar, Execution, Skull Mortar, and the ultimate BLOOD MOON.' });
})();
