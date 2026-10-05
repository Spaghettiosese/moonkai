// ============================================================
//  MOONKAI — DR. GEAR, the Mad Mechanic. Pixel remake + MECH SUIT moveset.
//  (SCRAP, Overclock, Junk Golem and the gadget economy stay as they were.)
//  MECH SUIT   PILE ROCKETS (5S) six rockets in an arc, HYDRAULIC CHARGE (6S) an armored shoulder-ram, SCRAP CANNON (2S) a
//              thick beam fed on junk, NANO SWARM (4S) four bots at no scrap cost, ORBITAL STRIKE (jS) a column from the sky.
//  OMEGA DOOMSDAY (form ult)   three bombs roll out.     DOOMSDAY DEVICE & the suit-up have new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('gear');
  Object.assign(Sfx, {
    gdServo(d = 0) { this.voice({ f: 220, to: 330, dur: .25, vol: .1, type: 'sawtooth', lp: 1200, delay: d }); this.nsweep({ f0: 800, f1: 2400, dur: .2, vol: .08, delay: d }); },
    gdRocket(d = 0) { this.nsweep({ f0: 3000, f1: 400, dur: .5, vol: .22, type: 'lowpass', delay: d, wet: .2 }); this.sub({ f: 110, to: 50, dur: .3, vol: .22, delay: d }); },
    gdWeld(d = 0) { this.crackle({ dur: .5, vol: .12, delay: d, lo: 2000, hi: 9000 }); this.nsweep({ f0: 4000, f1: 6000, dur: .5, vol: .06, delay: d }); },
    gdBeep(d = 0, n = 4) { for (let i = 0; i < n; i++) this.fm({ f: 1200 + (i % 2) * 400, ratio: 1, index: 0, dur: .08, vol: .1, delay: d + i * .12 }); },
    gdAlarm(d = 0, dur = 2) { for (let i = 0; i < dur * 3; i++) this.voice({ f: i % 2 ? 660 : 880, dur: .16, vol: .09, type: 'square', lp: 2000, delay: d + i * .33 }); },
    gdBoom(d = 0) { this.impact(1, d); this.sub({ f: 60, to: 24, dur: 1, vol: .5, delay: d }); this.nsweep({ f0: 2000, f1: 80, dur: 1, vol: .24, type: 'lowpass', delay: d, wet: .5 }); },
  });
  PxKit.pixelize(def, { win: [-260, -350, 580, 410] });

  const F5 = Mv.shot({ name: 'Pile Rockets', desc: 'Mech Suit: six rockets leave the shoulder pods in a lazy arc, each exploding on contact.', proj: { speed: 700, angle: -.6, spread: .9, count: 6, g: 700, r: 10, dmg: 40, kind: 'missile', color: '#ffb020', explode: 70 }, ev: { 3: () => sfx('gdServo'), 12: () => sfx('gdRocket') } });
  const F6 = Mv.rush({ name: 'Hydraulic Charge', desc: 'Mech Suit: an armored shoulder-ram that no light attack can stop. Bounces the foe off the wall.', s: 8, speed: 1200, frames: 18, armor: [1, 22], hit: { dmg: 118, kb: [640, -280], wb: true }, ev: { 1: () => sfx('gdServo') } });
  const F2 = Mv.beam({ name: 'Scrap Cannon', desc: 'Mech Suit: a thick beam of superheated scrap. Salvages 12 scrap from whatever it burns.', s: 18, pose: 'cast', beam: { len: 1300, width: 56, dur: 36, dmg: 18, tick: 6, color: '#ffb020', core: '#fff3c0', kb: [200, -40], hs: 12 }, ev: { 2: () => sfx('gdAlarm', 0, 1), 18: () => sfx('gdWeld', 0) }, onStart: f => gdScrap(f, 12) });
  const F4 = Mv.place({ name: 'Nano Swarm', desc: 'Mech Suit: four combat bots at no scrap cost.', s: 12, spawn: { kind: 'minion', at: 'front', dx: 40, look: 'bot', dmg: 60, hp: 80, speed: 320, count: 4, spacing: 50, stagger: 6 }, cd: 6, ev: { 4: () => sfx('gdBeep') } });
  const FJ = mk({ name: 'Orbital Strike', desc: 'Mech Suit: paints the foe from the air; a column of white-hot plasma lands from orbit.', pose: 'cast', air: true, s: 14, a: 1, r: 18, cd: 4, ai: { min: 200, max: 1500, use: 'zone' }, ev: { 2: () => sfx('gdBeep'), 14: f => { const t = f.opp; if (!t) return; Rw2.pillar(f, t.x + (t.vx || 0) * .3, { r: 80, life: 30, color: '#ffb020', dmg: 110, move: FJ, shake: 12, status: { burn: 2 }, giant: true, after: h => { sfx('gdBoom'); Combat.explode(h.x, -40, 110, f, 40, '#ffb020'); } }); sfx('gdAlarm', 0, .6); } } });
  const FU = PxKit.ult({ id: 'gear_fult', name: 'OMEGA DOOMSDAY', desc: 'Mech Suit: three ticking bombs roll out ahead of him and go off in sequence. Blockable. Must connect.', pose: 'charge', s: 50, dmg: 1300, color: '#ffb020',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'OMEGA DOOMSDAY', dur: 8.4, tc: [1.0, 4.4], tf: 5.2, c1: '#ffb020', c2: '#fff3c0', c3: '#2a1a08', motif: 'shockwave', pose: ['idle', 'charge', 'cast', 'victory'], actorForm: true, cap1: 'One bomb is a statement.', cap2: 'Three is a punctuation.', title: 'OMEGA DOOMSDAY', sub: 'THE LAB IS OPEN', size: 100,
      cues: [[0, () => sfx('gdAlarm', 0, 3)], [1.2, () => sfx('gdBeep', 0, 8)], [5.2, () => { sfx('gdBoom'); sfx('gdBoom', .25); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0804', bot: '#4a3008', ruins: '#1a1208', embers: '#ffb020', rays: '#ffd890' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 50, w: 900, h: 340, back: 120, start: f => { f.say('Science!', 80); sfx('gdAlarm', 0, 1.6); }, fire: f => { for (let i = 0; i < 3; i++) Game.later(i * .25, () => { const x = clamp(f.x + f.facing * (200 + i * 240), 40, Arena.stage.width - 40); Combat.explode(x, -60, 150, f, 0, '#ffb020'); sfx('gdBoom'); Cam.shake = 18; }); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Armored mech suit. New moveset: Pile Rockets, Hydraulic Charge, Scrap Cannon, Nano Swarm, Orbital Strike, and the ultimate OMEGA DOOMSDAY.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'DOOMSDAY DEVICE', dur: 7.8, tc: [1.0, 4.0], tf: 4.8, c1: '#ffb020', c2: '#fff3c0', c3: '#2a1a08', motif: 'meteor', pose: ['idle', 'cast', 'cast', 'victory'], cap1: 'It has one button.', cap2: 'I did not install a second.', title: 'DOOMSDAY DEVICE', sub: 'IT TICKS', size: 94,
    cues: [[0, () => sfx('gdBeep', 0, 6)], [1.4, () => sfx('gdAlarm', 0, 2.4)], [4.8, () => { sfx('gdBoom'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0804', bot: '#3a2808', city: '#1a1208', lit: .5, embers: '#ffb020' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'MECH SUIT', dur: 6.4, tc: [1.0, 3.4], tf: 3.8, c1: '#ffb020', c2: '#fff3c0', c3: '#2a1a08', motif: 'converge', shape: 'rect', pose: ['idle', 'cast', 'victory'], cap1: 'Every great scientist eventually builds a suit.', cap2: 'Mine has opinions.', title: 'MECH SUIT', sub: 'DR. GEAR', size: 100,
    cues: [[0, () => sfx('gdServo')], [1.2, () => sfx('gdWeld', 0)], [2.4, () => sfx('gdBeep', 0, 5)], [3.8, () => { sfx('gdBoom'); sfx('gdServo'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0804', bot: '#3a2808', ruins: '#1a1208', embers: '#ffb020' }, k) });
})();
