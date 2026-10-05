// ============================================================
//  MOONKAI — TERRA, the Bedrock Warden. Pixel remake + a real kit.
//
//  STRATA (new gauge)   builds while she stands still or blocks, and drains while she runs. Spend it with STONE PILLAR:
//                       with 50+ the pillar rises twice as wide and holds the foe up (launches), at 100 it comes with a ring of shards.
//  BEDROCK              standing or blocking: 15% less damage (as before).
//  MOUNTAIN GOLEM       LANDSLIDE (5S) three boulders that roll along the ground, FAULT LINE (6S) a row of pillars out from her,
//                       TECTONIC SHRUG (2S) a stomp and a ripple, MOUNTAIN SKIN (4S) long armor + reduction, ROCKFALL (jS).
//  PANGAEA (form ult)   the stage splits and rises in ridges.    TECTONIC COLLAPSE & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('terra');
  Object.assign(Sfx, {
    teGrind(d = 0, dur = 1.2) { this.rumble ? this.rumble(dur, .4, d) : this.impact(.8, d); this.nsweep({ f0: 300, f1: 90, dur, vol: .22, type: 'lowpass', delay: d, wet: .3 }); },
    teCrack(d = 0) { this.crackle({ dur: .3, vol: .16, delay: d, lo: 200, hi: 3000 }); this.impact(.7, d); },
    teThud(d = 0) { this.sub({ f: 90, to: 34, dur: .4, vol: .5, delay: d }); this.nsweep({ f0: 1200, f1: 120, dur: .3, vol: .2, type: 'lowpass', delay: d }); },
    teRise(d = 0) { this.riser(1.2, .2, d, 50, 400); this.teGrind(d, 1.2); },
    teChime(d = 0) { this.run({ notes: [196, 247, 294, 392], step: .16, dur: 1.4, vol: .1, bell: true, delay: d, wet: .8 }); },
  });
  PxModel.install(def, {});
  const strata = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };
  Object.assign(def, {
    gauge: { name: 'STRATA', max: 100, color: '#8bd070', label: f => ((f.gauge || 0) >= 50 ? '· FIRM' : '') },
    passive: ['Bedrock', 'Takes 15% less damage standing or blocking. Standing still builds STRATA, which makes her Stone Pillar huge.'],
    onRoundStart: f => { f.gauge = 0; },
    passiveTick: f => { const still = Math.abs(f.vx || 0) < 20 && !f.airborne; if (still && f.st % 6 === 0) strata(f, f.state === 'block' || f.state === 'cblock' ? 2 : 1); else if (!still && f.st % 8 === 0) strata(f, -1); },
  });
  Combat.hz.tePillar = function (h) {
    const f = h.owner; if (!f) return false;
    if (h.t === 2) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r + 10 && e.y > -60) Combat.resolveHit(e, f, H_({ dmg: h.big ? 96 : 70, guard: 'low', hs: 22, kb: [0, h.big ? -820 : -560], launch: true, sfx: 'h' }), { proj: true, fromX: h.x });
    return h.t < h.life;
  };
  Combat.drawHz.tePillar = (c, h) => { const k = Math.min(1, h.t / 6), a = Math.min(1, (h.life - h.t) / 14), H2 = (h.big ? 240 : 170) * k; c.save(); c.globalAlpha = a; c.fillStyle = '#6a5a3a'; c.strokeStyle = '#2a1e10'; c.lineWidth = 3; c.beginPath(); c.moveTo(h.x - h.r, 0); c.lineTo(h.x - h.r * .7, -H2 * .8); c.lineTo(h.x - h.r * .3, -H2); c.lineTo(h.x + h.r * .3, -H2 * .9); c.lineTo(h.x + h.r * .7, -H2 * .7); c.lineTo(h.x + h.r, 0); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#8a7a52'; c.fillRect(h.x - h.r * .5, -H2 * .9, h.r * .3, H2 * .8); c.restore(); };
  Combat.hz.teBoulder = function (h) { const f = h.owner; if (!f) return false; h.x += h.dir * 9; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 46 && e.y > -80 && !h.hit.has(e)) { h.hit.add(e); Combat.resolveHit(e, f, H_({ dmg: 62, guard: 'low', hs: 18, kb: [260 * h.dir, -380], launch: true, sfx: 'h' }), { proj: true, fromX: h.x }); sfx('teCrack'); } return h.t < h.life && h.x > 30 && h.x < Arena.stage.width - 30; };
  Combat.drawHz.teBoulder = (c, h) => { c.save(); c.translate(h.x, -34); c.rotate(h.t * .25 * h.dir); c.fillStyle = '#7a6a4a'; c.strokeStyle = '#2a1e10'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, r = 34 + (i % 2) * 6; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); c.restore(); };

  PxKit.setMove(def, '6S', mk({ name: 'Stone Pillar', desc: 'A pillar erupts under the foe and stays as a wall. With 50+ STRATA it is twice as wide and launches higher; at 100 it comes with a ring of shards.', pose: 'cast', s: 16, a: 1, r: 22, cd: 3, ai: { min: 120, max: 1100, use: 'zone' },
    ev: { 16: f => { const t = f.opp; if (!t) return; const g = f.gauge || 0, big = g >= 50; if (big) strata(f, -30); Combat.telegraph(f, { x: t.x, r: big ? 90 : 55, life: 20, color: '#c8a050', column: true, onFire: h => { Combat.addHazard({ kind: 'tePillar', owner: f, side: f.side, x: h.x, r: h.r, life: 5 * FPS, big }); Combat.place(f, { kind: 'wall', at: 'enemy', w: big ? 80 : 44, hgt: 170, hp: 260, life: 5, dmg: 0, style: 'stone', colors: ['#8a7a52', '#3a2e1c'], limit: 1 }); if (g >= 100) Combat.fireShots(f, { speed: 700, r: 8, dmg: 30, count: 8, spread: 6, kind: 'shard', color: '#c8a050', life: .6, from: 'above' }); sfx('teCrack'); sfx('teThud', .05); Cam.shake = 8; } }); sfx('teGrind', 0, .5); } } }));

  const F5 = mk({ name: 'Landslide', desc: 'Mountain Golem: three boulders roll out along the ground, one after another.', pose: 'throw', s: 14, a: 1, r: 24, cd: 3, ai: { min: 100, max: 1200, use: 'zone' }, ev: { 14: f => { for (let i = 0; i < 3; i++) Game.later(i * .22, () => { Combat.addHazard({ kind: 'teBoulder', owner: f, side: f.side, x: f.x + f.facing * 60, dir: f.facing, life: 100, hit: new Set(), hits: new Map() }); sfx('teThud'); }); sfx('teGrind', 0, .8); } } });
  const F6 = mk({ name: 'Fault Line', desc: 'Mountain Golem: a row of pillars breaks the ground outward from her, one after another.', pose: 'slam', s: 18, a: 1, r: 26, cd: 5, ai: { min: 100, max: 900, use: 'zone' }, ev: { 18: f => { Rw2.row(f, 7, 105, { r: 52, life: 6, stagger: 4, color: '#c8a050', dmg: 74, kb: [0, -620], move: F6, shake: 5, after: h => { Combat.addHazard({ kind: 'tePillar', owner: f, side: f.side, x: h.x, r: 44, life: 60, big: false }); } }); sfx('teGrind', 0, 1); sfx('teThud'); } } });
  const F2 = mk({ name: 'Tectonic Shrug', desc: 'Mountain Golem: she rolls her shoulders and the ground ripples out in both directions, then breaks.', pose: 'slam', s: 20, a: 1, r: 28, cd: 5, ai: { min: 0, max: 500, use: 'combo' }, ev: { 20: f => { for (const s of [-1, 1]) for (let i = 0; i < 5; i++) Rw2.pillar(f, f.x + s * (90 + i * 95), { r: 44, life: 4 + i * 4, color: '#c8a050', dmg: 58, kb: [s * 200, -520], move: F2, shake: 4 }); sfx('teThud'); sfx('teGrind', .1, 1); } } });
  const F4 = Mv.buff({ name: 'Mountain Skin', desc: 'Mountain Golem: armor and 25% less damage taken for 6s.', effects: { armor: true, fortify: true }, dur: 6, cd: 10, ev: { 6: () => sfx('teChime') } });
  const FJ = Mv.dive({ name: 'Rockfall', desc: 'Mountain Golem: plummets with a hail of falling stones.', vx: 260, vy: 1500, hit: { dmg: 104, gb: true }, ev: { 1: () => sfx('teGrind', 0, .5) }, onHit: a => { Combat.fireShots(a, { speed: 800, r: 10, dmg: 36, count: 6, spread: 1.6, angle: 1.2, kind: 'rock', color: '#8a7a52', from: 'above', life: 1 }); sfx('teThud'); } });
  const FU = PxKit.ult({ id: 'terra_fult', name: 'PANGAEA', desc: 'Mountain Golem: the stage splits and rises in ridges. Everything caught between them is crushed. Blockable. Must connect.', pose: 'slam', s: 56, dmg: 1300, color: '#c8a050',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'PANGAEA', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#c8a050', c2: '#fff3c0', c3: '#1a1208', motif: 'shockwave', pose: ['idle', 'charge', 'cast_up', 'victory'], actorForm: true, cap1: 'The world was one piece once.', cap2: 'It remembers.', title: 'PANGAEA', sub: 'THE LAND REJOINS', size: 106,
      cues: [[0, () => sfx('teChime')], [1.4, () => sfx('teRise')], [5.4, () => { sfx('teThud'); sfx('teGrind', 0, 2); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#0c0804', bot: '#4a3a18', mount: '#241808', fog: 'rgba(200,170,90,0.12)', rays: '#ffd890' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 56, w: 1000, h: 340, back: 300, start: f => { f.say('RISE.', 90); sfx('teRise'); }, fire: f => { for (let i = -6; i <= 6; i++) Rw2.pillar(f, f.x + i * 105, { r: 56, life: 4 + Math.abs(i) * 2, color: '#c8a050', dmg: 0, giant: true, shake: 6 }); Cam.shake = 22; sfx('teThud'); sfx('teGrind', 0, 2); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. A walking mountain with armor and super armor. New moveset: Landslide, Fault Line, Tectonic Shrug, Mountain Skin, Rockfall, and the ultimate PANGAEA.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'TECTONIC COLLAPSE', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#c8a050', c2: '#fff3c0', c3: '#1a1208', motif: 'shockwave', pose: ['idle', 'charge', 'slam', 'victory'], cap1: 'Stand on something long enough...', cap2: '...and it stands on you.', title: 'TECTONIC COLLAPSE', sub: 'THE GROUND TAKES THEM', size: 90,
    cues: [[0, () => sfx('teChime')], [1.4, () => sfx('teRise')], [4.8, () => { sfx('teThud'); sfx('teGrind', 0, 2); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0c0804', bot: '#3a2c10', mount: '#241808', fog: 'rgba(200,170,90,0.1)' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'MOUNTAIN GOLEM', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#c8a050', c2: '#fff3c0', c3: '#1a1208', motif: 'rise', shape: 'rect', pose: ['idle', 'charge', 'victory'], cap1: 'Patience is a kind of strength.', cap2: 'Mine has a few thousand years in it.', title: 'MOUNTAIN GOLEM', sub: 'BEDROCK WARDEN', size: 100,
    cues: [[0, () => sfx('teChime')], [1.4, () => sfx('teRise')], [3.9, () => { sfx('teThud'); sfx('teGrind', 0, 1.6); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0c0804', bot: '#3a2c10', mount: '#241808', fog: 'rgba(200,170,90,0.12)' }, k) });
})();
