// ============================================================
//  MOONKAI — GRIMM rework: pixel art, and DEATH INCARNATE gets a moveset and an ultimate, THE LAST HARVEST.
//   SOUL STORM (5S)  a spiral of wisps     REAP: HARVEST (6S)  a huge scythe arc    GRAVE LEGION (2S)  hands from the ground
//   GLOOM STEP (4S)  a teleport through the foe    DEATH'S FALL (jS)
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('grimm');
  Object.assign(Sfx, {
    grmWisp(d = 0) { this.voice({ f: 600, to: 1500, dur: .3, vol: .1, type: 'sine', delay: d, wet: .7 }); this.nsweep({ f0: 1200, f1: 3600, dur: .3, vol: .08, q: 4, delay: d, wet: .7 }); },
    grmReap(d = 0) { this.nsweep({ f0: 300, f1: 4000, dur: .35, vol: .26, q: .9, delay: d }); this.fm({ f: 98, ratio: 2.4, index: 600, dur: .7, vol: .22, delay: d + .15, wet: .5 }); this.impact(.8, d + .17); },
    grmHands(d = 0) { this.rumble(.9, .26, d); for (let i = 0; i < 5; i++) this.sub({ f: 80, to: 40, dur: .2, vol: .2, delay: d + i * .08 }); },
    grmBell(d = 0) { this.fm({ f: 98, ratio: 2.9, index: 900, dur: 4, vol: .4, delay: d, wet: .95 }); this.sub({ f: 49, to: 40, dur: 2, vol: .3, delay: d }); },
    grmHarvest(d = 0) { this.grmBell(d); this.chord({ notes: [49, 73, 98, 116], dur: 3.4, vol: .3, type: 'sawtooth', lp: 600, delay: d + .2, wet: .95, det: 30 }); },
    grmSoul(d = 0) { this.voice({ f: 400, to: 130, dur: 1, vol: .16, type: 'sawtooth', lp: 1200, n: 3, det: 40, delay: d, wet: .9 }); },
  });
  PxKit.pixelize(def, { win: [-230, -350, 520, 410] }); { const op = def.drawPortrait; if (op) { const px = PxKit.portrait('grimm', op, { res: 64, levels: 8, dither: .3 }); def.drawPortrait = (c, o, d) => PxKit.on() ? px(c, o, d) : op(c, o, d); } }
  const F5 = Mv.shot({ name: 'Soul Storm', desc: 'Death Incarnate: a spiral of soul-wisps that homes in on the foe.', proj: { speed: 560, r: 12, dmg: 30, count: 6, spread: 1.4, homing: 2.6, kind: 'orb', color: '#6aff9a', core: '#ffffff', life: 3 }, ev: { 3: () => sfx('grmWisp'), 7: () => sfx('grmWisp') } });
  const F6 = Mv.custom({ name: 'Reap: Harvest', desc: 'Death Incarnate: a scythe arc as wide as the lane. Foes under 25% health are cut down on the spot.', pose: 'heavy', s: 18, a: 6, r: 26, ai: { min: 40, max: 300, use: 'combo' }, hit: { dmg: 98, box: [-40, -150, 360, 150], kb: [420, -300], hs: 26, sfx: 'h' }, ev: { 8: () => sfx('grmReap') }, onHit: (a, t) => { if (t.hp < t.maxHp * 0.25 && t.hp > 1) { t.hp = Math.max(1, t.hp - 120); Game.popWorld(t.x, t.y - t.h - 30, 'HARVESTED', '#6aff9a', 22); sfx('grmSoul'); } } });
  const F2 = Mv.place({ name: 'Grave Legion', desc: 'Death Incarnate: five pairs of hands tear up out of the ground in a line.', spawn: { kind: 'spike', at: 'front', dx: 100, delay: 0.1, count: 5, spacing: 90, stagger: 0.07, dmg: 56, color: '#6aff9a', fill: '#0a1a10' }, cd: 4, ev: { 6: () => sfx('grmHands') } });
  const F4 = Mv.teleport({ name: 'Gloom Step', desc: 'Death Incarnate: steps through the foe and cuts them on the way out.', to: 'behind', pose: 'heavy', s: 5, hit: { dmg: 82, box: [0, -120, 130, 110], kb: [500, -280], launch: true } });
  { const e = F4.ev[4]; F4.ev[4] = f => { e(f); sfx('yhwBlink'); }; }
  const FJ = Mv.dive({ name: "Death's Fall", desc: 'Death Incarnate: the scythe comes down from above.', vx: 420, vy: 1500, hit: { dmg: 106, gb: true }, ev: { 1: () => sfx('grmReap') } });
  const FU = PxKit.ult({ id: 'grimm_fult', name: 'THE LAST HARVEST', desc: 'Death Incarnate: the field is ripe. Every soul in the arena is cut at once, and the last one is the foe. Blockable. Must connect.', pose: 'heavy', s: 54, dmg: 1300, color: '#6aff9a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'THE LAST HARVEST', dur: 8.4, tc: [1.2, 4.2], tf: 5.2, c1: '#6aff9a', c2: '#e8fff0', c3: '#0a1a10', motif: 'slashes', pose: ['idle', 'cast_up', 'heavy', 'victory'], actorForm: true, cap1: 'Every field is harvested.', cap2: 'It is only a matter of when.', title: 'THE LAST HARVEST', sub: 'YOUR HOUR HAS COME', size: 88,
      cues: [[0, () => sfx('grmBell')], [1.2, () => sfx('grmHarvest')], [4.4, () => sfx('riser', 1.2, .2, 0, 70, 900)], [5.2, () => { for (let i = 0; i < 5; i++) sfx('grmReap', i * .12); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#02060a', bot: '#0a2a1a', moon: { x: .5, y: .26, r: 120 + k * 50, col: '#d8f8e0', crater: true }, ruins: '#04100a', fog: 'rgba(60,140,100,0.2)', embers: '#6aff9a' }, k); x.fillStyle = '#04100a'; for (let i = 0; i < 12; i++) { x.fillRect(80 + i * 100, H - 140, 14, 60); x.fillRect(64 + i * 100, H - 128, 46, 10); } } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 54, w: 800, h: 320, back: 100, start: f => { f.say('The field is ripe.', 90); sfx('grmHarvest'); }, fire: f => { for (let i = 0; i < 5; i++) Combat.telegraph(f, { x: clamp(f.x + f.facing * (130 + i * 140), 40, Arena.stage.width - 40), r: 50, life: 3 + i * 3, color: '#6aff9a', column: true, onFire: h => { Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 16, color: '#6aff9a', dark: true, spike: true }); sfx('grmReap'); } }); Cam.shake = 20; sfx('grmReap'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Timed. Death walks the arena. New moveset: Soul Storm, Reap: Harvest, Grave Legion, Gloom Step, Death\'s Fall, and the ultimate THE LAST HARVEST.' });
})();
