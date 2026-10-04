// ============================================================
//  MOONKAI — KIRA SOL rework: pixel art, and PHOENIX gets a moveset and an ultimate.
//  (Rekindle, her once-a-round rebirth from embers, stays exactly as it was.)
//   PHOENIX FEATHERS (5S)  five burning feathers   WING DASH (6S)  a flying rush
//   PYRE (2S)  a pillar of flame on the foe          CINDER VEIL (4S)  shield + haste     SOLAR DIVE (jS)
//   PHOENIX ASCENDANT (ultimate)
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('kira');
  Object.assign(Sfx, {
    kirFlame(d = 0) { this.nsweep({ f0: 500, f1: 3200, dur: .35, vol: .2, q: 1, delay: d, wet: .3 }); this.crackle({ dur: .3, vol: .06, delay: d, lo: 200, hi: 2200 }); },
    kirFeather(d = 0) { this.nsweep({ f0: 2000, f1: 6000, dur: .18, vol: .14, q: 1.4, delay: d, wet: .5 }); this.fm({ f: 1320, ratio: 2, index: 90, dur: .3, vol: .07, delay: d, wet: .6 }); },
    kirCry(d = 0, dur = 1.6) { this.voice({ f: 880, to: 1760, dur: dur * .4, vol: .16, type: 'sawtooth', lp: 3000, delay: d, wet: .7 }); this.voice({ f: 1760, to: 660, dur: dur * .6, vol: .16, type: 'sawtooth', lp: 2400, delay: d + dur * .4, wet: .7 }); this.nsweep({ f0: 1000, f1: 5000, dur, vol: .1, q: 2, delay: d, wet: .5 }); },
    kirRise(d = 0) { this.riser(2.4, .26, d, 120, 1800); this.sub({ f: 70, to: 30, dur: 1.4, vol: .4, delay: d + 2.4 }); this.kirCry(d + 2.3); },
    kirPyre(d = 0) { this.impact(.7, d); this.kirFlame(d); },
  });
  PxKit.pixelize(def, { win: [-230, -350, 520, 410] }); { const op = def.drawPortrait; if (op) { const px = PxKit.portrait('kira', op, { res: 64, levels: 8, dither: .3 }); def.drawPortrait = (c, o, d) => PxKit.on() ? px(c, o, d) : op(c, o, d); } }
  const F5 = Mv.shot({ name: 'Phoenix Feathers', desc: 'Phoenix: five burning feathers fan out and burn on contact.', proj: { speed: 880, r: 12, dmg: 32, count: 5, spread: .8, kind: 'fire', color: '#ff7a1a', core: '#ffd35a', status: { burn: 2 } }, ev: { 3: () => sfx('kirFeather') } });
  const F6 = Mv.rush({ name: 'Wing Dash', desc: 'Phoenix: she crosses the stage on her wings and sets the foe alight.', speed: 1600, frames: 16, pass: true, hit: { dmg: 86, kb: [360, -380], launch: true, status: { burn: 3 } }, ev: { 1: () => sfx('kirFlame') } });
  const F2 = Mv.custom({ name: 'Pyre', desc: 'Phoenix: a pillar of flame erupts under the foe after a short telegraph.', pose: 'cast_up', s: 16, a: 1, r: 22, cd: 3, ai: { min: 80, max: 800, use: 'zone' }, ev: { 16: f => { const t = f.opp; if (!t) return; Combat.telegraph(f, { x: clamp(t.x + (t.vx || 0) * .3, 50, Arena.stage.width - 50), r: 70, life: 24, color: '#ff7a1a', column: true, onFire: h => { for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r) Combat.resolveHit(e, f, H_({ dmg: 90, guard: 'mid', hs: 24, kb: [0, -700], launch: true, status: { burn: 3 }, sfx: 'h' }), { proj: true, fromX: h.x, move: F2 }); Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 22, color: '#ff8a2a' }); sfx('kirPyre'); Cam.shake = 8; } }); sfx('kirFlame'); } } });
  const F4 = Mv.buff({ name: 'Cinder Veil', desc: 'Phoenix: a veil of cinders shields her and quickens her step for 4s.', effects: { shield: 160, haste: 1 }, dur: 4, name2: 'CINDER VEIL', ev: { 4: () => sfx('kirFeather') } });
  const FJ = Mv.dive({ name: 'Solar Dive', desc: 'Phoenix: a flaming dive that bounces the foe.', vx: 700, vy: 1500, hit: { dmg: 104, gb: true, status: { burn: 2 } }, ev: { 1: () => sfx('kirFlame') } });
  const FU = PxKit.ult({ id: 'kira_fult', name: 'PHOENIX ASCENDANT', desc: 'Phoenix: she becomes the sun for a breath, and everything near her is its heat. Blockable. Must connect.', pose: 'cast_up', s: 48, dmg: 1250, color: '#ff7a1a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'PHOENIX ASCENDANT', dur: 8.0, tc: [1.2, 4.0], tf: 5.0, c1: '#ff8a1a', c2: '#ffe08a', c3: '#5a1008', motif: 'pillar', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Burn bright.', cap2: 'Burn once.', title: 'PHOENIX ASCENDANT', sub: 'RISE', size: 92,
      cues: [[0, () => sfx('kirFeather')], [1.2, () => sfx('kirRise')], [5.0, () => { sfx('kirPyre'); sfx('kirCry'); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0408', bot: '#8a2a0a', sun: { x: .5, y: .3, r: 70 + k * 120, col: '#ffcf6a' }, embers: '#ff8a2a', city: '#1a0608', lit: 1, rays: '#ffd890' }, k) }) });
  FU.ev = PxKit.trackEv(FU, { at: 48, r: 130, color: '#ff8a2a', start: f => { f.say('Rise!', 80); sfx('kirRise'); }, fire: (f, x) => { Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x, r: 130, life: 36, color: '#ff8a2a' }); Cam.shake = 20; sfx('kirPyre'); sfx('kirCry'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Wings of fire. New moveset: Phoenix Feathers, Wing Dash, Pyre, Cinder Veil, Solar Dive, and the ultimate PHOENIX ASCENDANT. Rekindle still returns her from the embers once a round.' });
})();
