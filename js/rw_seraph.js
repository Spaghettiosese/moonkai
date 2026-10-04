// ============================================================
//  MOONKAI — SERAPH rework: ARCHANGEL gets a moveset and an ultimate, CHOIR OF THE HOST.
//   FEATHER TEMPEST (5S)  seven feathers     HEAVEN'S LANCE (6S)  a winged thrust through the foe
//   PRISM SANCTUARY (2S)  a large glade that heals and shields   HALO REFLECT (4S)  throws projectiles back
//   JUDGMENT STORM (jS)   five falling lances
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('seraph');
  Object.assign(Sfx, {
    serFeather(d = 0) { this.nsweep({ f0: 3000, f1: 9000, dur: .2, vol: .12, type: 'bandpass', q: 1, delay: d, wet: .6 }); this.fm({ f: 1568, ratio: 2, index: 80, dur: .4, vol: .07, delay: d, wet: .7 }); },
    serLance(d = 0) { this.nsweep({ f0: 800, f1: 7000, dur: .22, vol: .22, delay: d }); this.fm({ f: 1047, ratio: 1.5, index: 260, dur: .6, vol: .12, delay: d + .05, wet: .7 }); },
    serChoir(d = 0, dur = 3) { this.chord({ notes: [262, 330, 392, 523, 659, 784], dur, vol: .3, type: 'triangle', lp: 2600, delay: d, wet: .95, det: 8 }); },
    serHalo(d = 0) { this.fm({ f: 1320, ratio: 3, index: 200, dur: 1.4, vol: .12, delay: d, wet: .9 }); this.run({ notes: [1047, 1319, 1568], step: .08, bell: true, dur: .8, delay: d, wet: .9 }); },
    serSmite(d = 0) { this.impact(.8, d); this.serLance(d); this.fm({ f: 880, ratio: 1.41, index: 400, dur: 1.2, vol: .16, delay: d, wet: .8 }); },
  });
  const F5 = Mv.shot({ name: 'Feather Tempest', desc: 'Archangel: seven feathers of light fan out in a storm.', proj: { speed: 880, r: 10, dmg: 24, count: 7, spread: 1.2, kind: 'spear', color: '#fff4c8', core: '#ffffff', trail: false }, ev: { 3: () => sfx('serFeather') } });
  const F6 = Mv.rush({ name: "Heaven's Lance", desc: 'Archangel: a winged thrust that passes through the foe and leaves a line of light.', speed: 1700, frames: 14, pass: true, hit: { dmg: 98, kb: [400, -380], launch: true }, ev: { 1: () => sfx('serLance') } });
  const F2 = Mv.custom({ name: 'Prism Sanctuary', desc: 'Archangel: a wide glade of light that heals her and burns away projectiles.', pose: 'cast_up', s: 14, a: 1, r: 22, cd: 9, ai: { min: 0, max: 600, use: 'heal' }, ev: { 14: f => { Combat.place(f, { kind: 'zone', at: 'self', r: 190, heal: 45, every: 0.5, life: 4, color: '#fff4c8' }); Combat.buff(f, { shield: 150 }, 3, 'PRISM'); sfx('serHalo'); sfx('serChoir', 0, 1.8); } } });
  const F4 = Mv.custom({ name: 'Halo Reflect', desc: 'Archangel: the halo flares and throws everything near her back where it came from.', pose: 'block', s: 6, a: 18, r: 14, cd: 5, ai: { min: 0, max: 400, use: 'counter' }, ev: { 6: f => { Combat.reflect(f); sfx('serHalo'); Cam.shake = 6; } } });
  const FJ = Mv.custom({ name: 'Judgment Storm', desc: 'Archangel: five lances of light fall around the foe, one after another.', pose: 'cast_up', s: 18, a: 1, r: 22, cd: 4, ai: { min: 100, max: 900, use: 'zone' }, ev: { 18: f => { const t = f.opp; if (!t) return; for (let i = -2; i <= 2; i++) Combat.telegraph(f, { x: clamp(t.x + i * 80, 50, Arena.stage.width - 50), r: 50, life: 18 + (i + 2) * 4, color: '#fff4c8', column: true, onFire: h => { for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r) Combat.resolveHit(e, f, H_({ dmg: 44, guard: 'mid', hs: 18, kb: [0, -320], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: FJ }); Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 14, color: '#fff6d0', sword: true }); sfx('serSmite'); } }); } } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'seraph_fult', name: 'CHOIR OF THE HOST', desc: 'Archangel: the heavenly host answers. A choir of light descends in rings, and the last note is the foe. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1260, color: '#fff4c8',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'CHOIR OF THE HOST', dur: 8.4, tc: [1.2, 4.2], tf: 5.2, c1: '#fff6d0', c2: '#ffe08a', c3: '#5a4a2a', motif: 'pillar', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Hear them sing.', cap2: 'Every voice I have ever saved.', title: 'CHOIR OF THE HOST', sub: 'GLORIA', size: 82,
      cues: [[0, () => sfx('serHalo')], [1.2, () => sfx('serChoir', 0, 4)], [4.4, () => sfx('riser', 1, .22, 0, 200, 2600)], [5.2, () => { sfx('serSmite'); sfx('serSmite', .1); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#2a2010', bot: '#e8c870', rays: '#fff8d8', rayX: .72, rayY: .1, clouds: 'rgba(255,250,235,0.95)', pillars: 'rgba(250,240,210,0.5)' }, k) }) });
  FU.ev = PxKit.trackEv(FU, { at: 54, r: 130, color: '#fff4c8', start: f => { f.say('Sing!', 80); sfx('serChoir', 0, 3); }, fire: (f, x) => { for (let i = -1; i <= 1; i++) Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: x + i * 90, r: 100, life: 30, color: '#fff6d0', sword: i === 0, giant: i === 0 }); Cam.shake = 20; sfx('serSmite'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Timed. Six wings, a halo of light. New moveset: Feather Tempest, Heaven\'s Lance, Prism Sanctuary, Halo Reflect, Judgment Storm, and the ultimate CHOIR OF THE HOST.' });
})();
