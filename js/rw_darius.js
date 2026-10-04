// ============================================================
//  MOONKAI — DARIUS rework: pixel art, and HAND OF NOXUS gets a moveset and an ultimate, NOXUS DOMINION.
//   EXECUTIONER'S SWEEP (5S)  a wider axe     HAMSTRING (6S)  a leg-cutting lunge    CHAIN PULL (2S)  drags the foe in
//   BRUTAL ADVANCE (4S)  armored    GUILLOTINE DROP (jS)
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('darius');
  Object.assign(Sfx, {
    darAxe(d = 0) { this.nsweep({ f0: 200, f1: 1800, dur: .3, vol: .26, q: .8, delay: d }); this.fm({ f: 110, ratio: 3.1, index: 500, dur: .45, vol: .2, delay: d + .1, wet: .3 }); this.impact(.7, d + .12); },
    darChain(d = 0) { for (let i = 0; i < 6; i++) this.fm({ f: 800 + i * 70, ratio: 3.9, index: 360, dur: .13, vol: .1, delay: d + i * .04, wet: .3 }); },
    darHorn(d = 0, dur = 2.4) { this.voice({ f: 116, to: 116, dur, vol: .3, type: 'sawtooth', lp: 700, n: 3, det: 14, delay: d, swell: true, wet: .8 }); this.voice({ f: 175, to: 175, dur, vol: .2, type: 'sawtooth', lp: 900, n: 3, det: 14, delay: d, swell: true, wet: .8 }); },
    darGuillotine(d = 0) { this.nsweep({ f0: 4000, f1: 400, dur: .25, vol: .3, type: 'highpass', delay: d }); this.impact(1, d + .2); this.fm({ f: 70, ratio: 2.2, index: 700, dur: .9, vol: .3, delay: d + .2, wet: .5 }); },
  });
  PxKit.pixelize(def, { win: [-230, -340, 520, 400] }); { const op = def.drawPortrait; if (op) { const px = PxKit.portrait('darius', op, { res: 64, levels: 8, dither: .3 }); def.drawPortrait = (c, o, d) => PxKit.on() ? px(c, o, d) : op(c, o, d); } }
  const F5 = Mv.custom({ name: "Executioner's Sweep", desc: 'Hand of Noxus: a huge two-handed sweep that catches everything in front of him and drags it.', pose: 'heavy', s: 16, a: 6, r: 26, ai: { min: 40, max: 280, use: 'combo' }, hit: { dmg: 104, box: [-60, -140, 330, 140], kb: [420, -240], hs: 26, status: { bleed: 3 }, sfx: 'h' }, ev: { 6: () => sfx('darAxe') } });
  const F6 = Mv.rush({ name: 'Hamstring', desc: 'Hand of Noxus: a lunge that cuts the legs out from under the foe (slow).', speed: 1250, frames: 16, hit: { dmg: 82, guard: 'low', kb: [300, -320], status: { slow: 2.5, bleed: 2 } }, ev: { 1: () => sfx('darAxe') } });
  const F2 = Mv.custom({ name: 'Chain Pull', desc: 'Hand of Noxus: Apprehend. The hooked chain drags the foe straight to his axe.', pose: 'cast', s: 12, a: 8, r: 22, cd: 4, ai: { min: 140, max: 520, use: 'zone' }, hit: { dmg: 56, box: [120, -150, 380, 150], kb: [0, 0], hs: 18 }, onHit: (a, t) => { t.x = clamp(a.x + a.facing * 90, 40, Arena.stage.width - 40); t.vx = 0; t.status.stun = Math.max(t.status.stun || 0, 0.6); sfx('darChain'); }, ev: { 3: () => sfx('darChain') } });
  const F4 = Mv.rush({ name: 'Brutal Advance', desc: 'Hand of Noxus: an armored march that no light blow can stop.', speed: 1050, frames: 22, armor: [1, 24], hit: { dmg: 24, multi: 5, every: 4, kb: [320, -220] }, ev: { 1: () => sfx('darHorn', 0, .8) } });
  const FJ = Mv.dive({ name: 'Guillotine Drop', desc: 'Hand of Noxus: down from the air with the axe over his head.', vx: 380, vy: 1600, hit: { dmg: 112, gb: true }, ev: { 1: () => sfx('darAxe') } });
  const FU = PxKit.ult({ id: 'darius_fult', name: 'NOXUS DOMINION', desc: 'Hand of Noxus: a hundred axes in a hundred hands, all falling together. Blockable. Must connect.', pose: 'slam', s: 48, dmg: 1280, color: '#d02a2a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'NOXUS DOMINION', dur: 8.2, tc: [1.0, 3.8], tf: 4.8, c1: '#e03a3a', c2: '#ffb090', c3: '#2a0a0a', motif: 'slashes', pose: ['idle', 'cast_up', 'slam', 'victory'], actorForm: true, cap1: 'Strength is the only law.', cap2: 'Noxus does not kneel.', title: 'NOXUS DOMINION', sub: 'THE EMPIRE ENDURES', size: 92,
      cues: [[0, () => sfx('darHorn', 0, 3)], [1.2, () => sfx('riser', 2.6, .22, 0, 80, 800)], [4.8, () => { for (let i = 0; i < 5; i++) sfx('darGuillotine', i * .12); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#14040a', bot: '#5a1410', ruins: '#1a0608', embers: '#ff6a3a', clouds: 'rgba(50,10,10,0.9)' }, k); x.fillStyle = '#8a1414'; for (let i = 0; i < 4; i++) { x.fillRect(100 + i * 330, 20, 70, 260); x.fillStyle = '#e8c860'; x.fillRect(120 + i * 330, 60, 30, 30); x.fillStyle = '#8a1414'; } } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 48, w: 760, h: 320, start: f => { f.say('NOXUS!', 80); sfx('darHorn', 0, 2.4); }, fire: f => { for (let i = 0; i < 5; i++) Combat.telegraph(f, { x: clamp(f.x + f.facing * (120 + i * 130), 40, Arena.stage.width - 40), r: 50, life: 3 + i * 3, color: '#e03a3a', column: true, onFire: h => { Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 14, color: '#e03a3a', dark: true, sword: true }); sfx('darGuillotine'); } }); Cam.shake = 20; sfx('darGuillotine'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Timed. Even heavier. New moveset: Executioner\'s Sweep, Hamstring, Chain Pull, Brutal Advance, Guillotine Drop, and the ultimate NOXUS DOMINION.' });
})();
