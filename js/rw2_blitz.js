// ============================================================
//  MOONKAI — BLITZ, the Rocketeer. Pixel remake + a real kit.
//
//  BOMBARD (mark on the foe, max 3)  every explosive paints the foe. At 3 a bomber pass is called in on them for free: a line of
//                                    explosions that marches across the stage.
//  JETPACK (passive)   triple jump and hover (as before).
//  FULL ORDNANCE   CLUSTER ROCKETS (5S) five homing rockets, AFTERBURNER RAM (6S) a rocket-powered tackle, HOWITZER (2S) three shells,
//                  MINEFIELD (4S) four claymores, NAPALM RUN (jS) a pass dropping fire.   ARC LIGHT (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('blitz');
  Object.assign(Sfx, {
    blRocket(d = 0) { this.nsweep({ f0: 2400, f1: 500, dur: .45, vol: .2, type: 'lowpass', delay: d, wet: .2 }); this.sub({ f: 120, to: 60, dur: .25, vol: .22, delay: d }); },
    blBoom(d = 0) { this.impact(.9, d); this.sub({ f: 80, to: 28, dur: .6, vol: .5, delay: d }); this.nsweep({ f0: 2400, f1: 80, dur: .5, vol: .2, type: 'lowpass', delay: d, wet: .4 }); },
    blJet(d = 0, dur = .5) { this.nsweep({ f0: 1600, f1: 4000, dur, vol: .18, q: .6, delay: d }); this.voice({ f: 90, to: 160, dur, vol: .1, type: 'sawtooth', lp: 500, delay: d }); },
    blSiren(d = 0, dur = 2) { for (let i = 0; i < dur * 2; i++) this.voice({ f: 520 + (i % 2) * 220, dur: .45, vol: .1, type: 'sawtooth', lp: 1800, delay: d + i * .5, wet: .4 }); },
    blBeep(d = 0, n = 4) { for (let i = 0; i < n; i++) this.fm({ f: 1500, ratio: 1, index: 0, dur: .06, vol: .1, type: 'square', delay: d + i * .2 }); },
    blBomber(d = 0, dur = 3) { this.voice({ f: 70, to: 90, dur, vol: .22, type: 'sawtooth', lp: 400, n: 4, det: 20, delay: d, wet: .5 }); this.nsweep({ f0: 200, f1: 900, dur, vol: .12, delay: d, swell: true }); },
  });
  PxModel.install(def, { extra: { back(g, P, s, m) { const [x, y] = P.sh; g.fill(g.poly([[x - 12, y + 2], [x - 4, y + 2], [x - 4, y + 28], [x - 12, y + 28]]), '#5a5a50'); g.fill(g.poly([[x - 10, y + 28], [x - 6, y + 28], [x - 8, y + 38]]), '#ffb020'); } } });
  const bombard = (a, t, n = 1) => { if (!t || t.state === 'ko') return; Combat.mark(t, a, 'bombard', n, { max: 3, dur: 9, color: '#ff8a3a', label: 'TARGET', onMax: tt => { delete tt.marks.bombard; Game.popWorld(tt.x, tt.y - tt.h - 40, 'BOMBER INBOUND', '#ff8a3a', 24); sfx('blBomber'); Rw2.row(a, 7, 110, { from: 'foe', r: 56, life: 18, stagger: 6, color: '#ff8a3a', dmg: 58, move: null, shake: 4, status: { burn: 1 }, after: h => Combat.explode(h.x, -30, 70, a, 0, '#ff8a3a') }); } }); };
  Rw2.merge(def, { passive: ['Jetpack', 'Triple jump and hover (hold up). Explosives paint the foe (max 3): at 3 a free bomber pass runs a line of explosions across them.'], onHit: (a, t) => { if (a.move && a.move.kind === 'special') bombard(a, t); } });
  Combat.hz.blNapalm = function (h) { const f = h.owner; if (!f) return false; if (h.t % 3 === 0) Combat.addHazard({ kind: 'zone', owner: f, side: f.side, x: clamp(f.x, 20, Arena.stage.width - 20), r: 44, life: 2.6, every: .3, dmg: 12, color: '#ff8a3a', status: { burn: 1 }, t: 0, hits: new Map() }); return h.t < h.life; };
  Combat.drawHz.blNapalm = () => { };

  const F5 = Mv.shot({ name: 'Cluster Rockets', desc: 'Full Ordnance: five homing rockets that burst into smaller ones.', proj: { speed: 640, angle: -.3, spread: .8, count: 5, homing: 2.2, r: 11, dmg: 40, kind: 'missile', color: '#ff8a3a', explode: 70, status: { burn: 2 }, onHit: (t, p) => bombard(p.owner, t) }, ev: { 3: () => sfx('blBeep', 0, 3), 12: () => sfx('blRocket') } });
  const F6 = Mv.rush({ name: 'Afterburner Ram', desc: 'Full Ordnance: a rocket-powered tackle that leaves a trail of fire.', s: 6, speed: 1700, frames: 16, hit: { dmg: 98, kb: [560, -320], launch: true, status: { burn: 2 } }, ev: { 1: () => sfx('blJet', 0, .5) }, onHit: (a, t) => { bombard(a, t); Combat.explode(t.x, -60, 80, a, 20, '#ff8a3a'); sfx('blBoom'); } });
  const F2 = mk({ name: 'Howitzer', desc: 'Full Ordnance: three shells lobbed in a row: short, mid, long. Each one marks the foe.', pose: 'cast', s: 16, a: 1, r: 26, cd: 5, ai: { min: 200, max: 1400, use: 'zone' }, ev: { 3: () => sfx('blBeep'), 16: f => { for (let i = 0; i < 3; i++) Game.later(i * .22, () => { Combat.fireShots(f, { speed: 500 + i * 160, angle: -.95, g: 1300, r: 12, dmg: 58, kind: 'bomb', color: '#ff8a3a', explode: 80, life: 2, onHit: (t, p) => bombard(p.owner, t) }); sfx('blRocket'); }); } } });
  const F4 = Mv.place({ name: 'Minefield', desc: 'Full Ordnance: four claymores laid in a spread.', s: 14, spawn: { kind: 'mine', at: 'front', dx: 100, dmg: 90, limit: 4, count: 4, spacing: 110 }, cd: 7, ev: { 4: () => sfx('blBeep', 0, 5) } });
  const FJ = mk({ name: 'Napalm Run', desc: 'Full Ordnance: a pass over the stage that lays a stripe of burning napalm.', pose: 'air_heavy', air: true, s: 8, a: 26, r: 12, vel: [[8, 34, 1000, 0]], ai: { min: 0, max: 700, use: 'approach' }, ev: { 1: () => sfx('blJet', 0, .8), 8: f => { Combat.addHazard({ kind: 'blNapalm', owner: f, side: f.side, life: 26 }); } } });
  const FU = PxKit.ult({ id: 'blitz_fult', name: 'ARC LIGHT', desc: 'Full Ordnance: a whole squadron, three passes, one target. Blockable. Must connect.', pose: 'cast_up', s: 56, dmg: 1300, color: '#ff8a3a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'ARC LIGHT', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#ff8a3a', c2: '#fff0c0', c3: '#14140a', motif: 'barrage', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Call sign: BLITZ.', cap2: 'Danger close.', title: 'ARC LIGHT', sub: 'DANGER CLOSE', size: 100,
      cues: [[0, () => sfx('blSiren', 0, 2)], [1.4, () => sfx('blBomber', 0, 3.6)], [5.4, () => { for (let i = 0; i < 4; i++) sfx('blBoom', i * .18); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#10140a', bot: '#7a4a1a', clouds: '#3a3a20', mount: '#1a1e0a', embers: '#ff8a3a', rays: '#ffc880' }, k) }) });
  FU.ev = PxKit.trackEv(FU, { at: 56, r: 150, color: '#ff8a3a', start: f => { f.say('Danger close!', 90); sfx('blSiren', 0, 1.6); }, fire: (f, x) => { for (let p = 0; p < 3; p++) for (let i = 0; i < 5; i++) Game.later(p * .35 + i * .06, () => { const xx = clamp(x + (i - 2) * 90 + (p - 1) * 40, 30, Arena.stage.width - 30); Combat.explode(xx, -50, 90, f, 0, '#ff8a3a'); }); Cam.shake = 24; sfx('blBoom'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Rockets home in and explode bigger. New moveset: Cluster Rockets, Afterburner Ram, Howitzer, Minefield, Napalm Run, and the ultimate ARC LIGHT.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'CARPET BOMB', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#ff8a3a', c2: '#fff0c0', c3: '#14140a', motif: 'barrage', pose: ['idle', 'cast_up', 'cast_up', 'victory'], cap1: 'Painting the target.', cap2: 'Bombers on station.', title: 'CARPET BOMB', sub: 'LIGHT THEM UP', size: 98,
    cues: [[0, () => sfx('blBeep', 0, 6)], [1.4, () => sfx('blBomber', 0, 3)], [4.8, () => { for (let i = 0; i < 3; i++) sfx('blBoom', i * .2); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#10140a', bot: '#5a3a14', clouds: '#2a2a18', mount: '#1a1e0a', embers: '#ff8a3a' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'FULL ORDNANCE', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#ff8a3a', c2: '#fff0c0', c3: '#14140a', motif: 'converge', shape: 'rect', pose: ['idle', 'cast_up', 'victory'], lift: 40, cap1: 'Load everything.', cap2: 'Then load the rest.', title: 'FULL ORDNANCE', sub: 'BLITZ', size: 100,
    cues: [[0, () => sfx('blBeep', 0, 6)], [1.4, () => sfx('blJet', 0, 1.6)], [3.7, () => { sfx('blBoom'); sfx('blRocket'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#10140a', bot: '#5a3a14', clouds: '#2a2a18', mount: '#1a1e0a', embers: '#ff8a3a' }, k) });
})();
