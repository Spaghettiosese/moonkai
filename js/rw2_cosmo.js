// ============================================================
//  MOONKAI — COSMO, the Starfarer. Pixel remake + a real kit.
//
//  STARDUST (new gauge)  every hit collects stardust. At 100 the next Star Shot is a CONSTELLATION: five stars that home in and link
//                        with beams of light between them.
//  ZERO-G (passive)      floaty jumps; air specials cost nothing to recover from (as before).
//  STAR VOYAGER   NEBULA VOLLEY (5S) a fan of spinning stars, COMET RUSH (6S) a blazing tackle that leaves a tail of stars,
//                 ORBITAL STATION (2S) two satellites, EVENT SINGULARITY (4S) a black hole that pulls, METEOR STORM (jS).  GENESIS (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('cosmo');
  Object.assign(Sfx, {
    csStar(d = 0, p = 1) { this.fm({ f: 1047 * p, ratio: 2, index: 60, dur: .5, vol: .12, delay: d, wet: .8 }); this.nsweep({ f0: 2000, f1: 7000, dur: .2, vol: .08, delay: d }); },
    csComet(d = 0) { this.nsweep({ f0: 400, f1: 4000, dur: .4, vol: .2, delay: d, wet: .4 }); this.csStar(d + .1, .7); },
    csHum(d = 0, dur = 2.4) { this.voice({ f: 130, to: 140, dur, vol: .18, type: 'sine', delay: d, wet: .95 }); this.chord({ notes: [196, 247, 330, 392], dur, vol: .12, type: 'sine', delay: d, wet: .95 }); },
    csSat(d = 0) { for (let i = 0; i < 3; i++) this.fm({ f: 1568, ratio: 1, index: 0, dur: .06, vol: .08, type: 'square', delay: d + i * .12 }); },
    csHole(d = 0) { this.suck ? this.suck(.8, .22, d) : this.nsweep({ f0: 4000, f1: 100, dur: .8, vol: .18, type: 'lowpass', delay: d }); this.sub({ f: 60, to: 28, dur: .8, vol: .35, delay: d }); },
    csBang(d = 0) { this.riser(2, .26, d, 60, 2400); this.impact(1, d + 2); this.csStar(d + 2, .5); this.csHum(d + 2, 3); this.sub({ f: 50, to: 22, dur: 1.4, vol: .5, delay: d + 2 }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const t = v.anim || 0; if ((v.gauge || 0) >= 100 || v.transformed) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const a = t * 1.8 + i * 1.047; c.fillStyle = i % 2 ? 'rgba(255,255,255,.95)' : 'rgba(138,200,255,.95)'; c.fillRect(Math.round(P.sh[0] + Math.cos(a) * 44), Math.round(P.sh[1] + 16 + Math.sin(a) * 30), 4, 4); } c.restore(); } } });
  Rw2.merge(def, {
    gauge: { name: 'STARDUST', max: 100, color: '#8ac8ff', label: f => ((f.gauge || 0) >= 100 ? '· CONSTELLATION READY' : '') },
    passive: ['Zero-G', 'Floaty jumps; air specials cost nothing to recover from. Hits collect STARDUST; at 100 the next Star Shot is a CONSTELLATION: five linked, homing stars.'],
    onRoundStart: f => { f.gauge = 0; },
    onHit: (a, t, dmg) => { a.gauge = Math.min(100, (a.gauge || 0) + 5); },
  });
  { const m = PxKit.setMove(def, '5S', Mv.shot({ name: 'Star Shot', desc: 'A spinning star. With a full STARDUST gauge it is a CONSTELLATION: five homing stars linked by light.', proj: { speed: 760, r: 12, dmg: 52, kind: 'star', color: '#8ac8ff', core: '#fff', life: 2, spin: 1 }, ev: { 3: () => sfx('csStar') } })); const e = m.ev[12]; m.ev[12] = f => { if ((f.gauge || 0) >= 100) { f.gauge = 0; Game.popWorld(f.x, f.y - f.h - 40, 'CONSTELLATION', '#8ac8ff', 24); Combat.fireShots(f, { speed: 700, r: 11, dmg: 40, count: 5, spread: 1.2, homing: 2.4, kind: 'star', color: '#ffffff', core: '#8ac8ff', life: 2.2 }); sfx('csHum', 0, 1.2); sfx('csStar', 0, 1.3); } else e(f); }; }
  Combat.hz.csHole = function (h) { const f = h.owner; if (!f) return false; for (const e of Combat.targets(f.side)) { const d = h.x - e.x; if (Math.abs(d) < h.r && e.y > -240) { e.x += Math.sign(d) * Math.min(Math.abs(d), 5); if (h.t % 14 === 0 && Math.abs(d) < 90) Combat.resolveHit(e, f, H_({ dmg: 22, guard: 'mid', hs: 8, kb: [0, -60], sfx: 'm' }), { proj: true, fromX: h.x }); } } for (const p of Combat.projectiles) if (p.side !== f.side && Math.abs(p.x - h.x) < 60) p.life = 0; return h.t < h.life; };
  Combat.drawHz.csHole = (c, h) => { const k = Math.min(1, h.t / 14, (h.life - h.t) / 20); if (typeof drawBlackHole === 'function') drawBlackHole(c, h.x, -100, 40 * k, h.t / 60); c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const a = i * .45 + h.t * .1, r = 50 + (i % 4) * 22; c.fillStyle = i % 2 ? '#8ac8ff' : '#fff'; c.fillRect(Math.round((h.x + Math.cos(a) * r) / 3) * 3, Math.round((-100 + Math.sin(a) * r * .4) / 3) * 3, 5, 5); } c.restore(); };

  const F5 = Mv.shot({ name: 'Nebula Volley', desc: 'Star Voyager: a fan of nine spinning stars in two waves.', proj: { speed: 820, r: 10, dmg: 32, count: 9, spread: 1.1, kind: 'star', color: '#8ac8ff', core: '#fff', life: 1.6 }, ev: { 3: () => sfx('csStar'), 12: () => sfx('csStar', 0, 1.2) } });
  const F6 = Object.assign(Mv.rush({ name: 'Comet Rush', desc: 'Star Voyager: a blazing tackle that leaves a trail of stars hanging in the air.', s: 8, speed: 1500, frames: 18, hit: { dmg: 96, kb: [560, -300], launch: true }, ev: { 1: () => sfx('csComet') } }), { onStart: f => { f.csFrom = f.x; } });
  F6.ev[20] = f => { const a = Math.min(f.csFrom, f.x), b = Math.max(f.csFrom, f.x); for (let x = a; x <= b; x += 100) Rw2.pool(f, x, { r: 46, life: 2.4, dmg: 12, color: '#8ac8ff' }); sfx('csStar', 0, 1.4); };
  const F2 = Mv.place({ name: 'Orbital Station', desc: 'Star Voyager: two satellites, one either side of the foe, firing down.', s: 14, spawn: { kind: 'turret', at: 'enemy', dx: -150, life: 8, hp: 90, shotDmg: 26, limit: 4, count: 2, spacing: 300 }, cd: 7, ev: { 4: () => sfx('csSat') } });
  const F4 = mk({ name: 'Event Singularity', desc: 'Star Voyager: a black hole of his own, a short way in front. It pulls, eats projectiles, and batters.', pose: 'cast', s: 16, a: 1, r: 26, cd: 7, ai: { min: 100, max: 1000, use: 'zone' }, ev: { 16: f => { Combat.hazards.filter(h => h.kind === 'csHole' && h.owner === f).forEach(h => h.life = 0); Combat.addHazard({ kind: 'csHole', owner: f, side: f.side, x: clamp(f.x + f.facing * 280, 80, Arena.stage.width - 80), r: 220, life: 220 }); sfx('csHole'); } } });
  const FJ = Mv.shot({ name: 'Meteor Storm', desc: 'Star Voyager: a storm of meteors rains in a wide arc.', proj: { speed: 800, angle: 1.0, spread: 1.5, count: 10, r: 12, dmg: 34, kind: 'orb', color: '#ffb060', core: '#fff', life: 1.2, explode: 40 }, ev: { 2: () => sfx('csComet') } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'cosmo_fult', name: 'GENESIS', desc: 'Star Voyager: one flash and a universe comes and goes. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1300, color: '#8ac8ff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'GENESIS', dur: 8.8, tc: [1.0, 4.8], tf: 5.6, c1: '#8ac8ff', c2: '#ffffff', c3: '#02041a', motif: 'shockwave', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'In the beginning, a flash.', cap2: 'I brought spares.', title: 'GENESIS', sub: 'LET THERE BE LIGHT', size: 112, flash: '#ffffff',
      cues: [[0, () => sfx('csHum', 0, 3)], [1.4, () => sfx('csBang')], [5.6, () => { sfx('csStar', 0, .6); sfx('csHole'); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#02041a', bot: '#1c2a7a', stars: '#c8e4ff', sun: { x: .5, y: .3, r: 20 + k * 300, col: '#ffffff' }, rays: '#8ac8ff' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 54, w: 1100, h: 360, back: 500, start: f => { f.say('Let there be.', 90); sfx('csBang'); }, fire: f => { Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: f.x, r: 420, life: 44, color: '#ffffff', giant: true }); Cam.shake = 26; sfx('csStar', 0, .5); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Starlight body: flight, stronger stars. New moveset: Nebula Volley, Comet Rush, Orbital Station, Event Singularity, Meteor Storm, and the ultimate GENESIS.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'BIG BANG', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#8ac8ff', c2: '#ffffff', c3: '#02041a', motif: 'beam', pose: ['idle', 'cast_up', 'cast', 'victory'], cap1: 'Everything began as a point.', cap2: 'You are a point.', title: 'BIG BANG', sub: 'A NEW UNIVERSE', size: 108, flash: '#ffffff',
    cues: [[0, () => sfx('csHum')], [1.4, () => sfx('csBang')], [4.8, () => { sfx('csStar', 0, .6); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02041a', bot: '#1c2a6a', stars: '#c8e4ff', sun: { x: .7, y: .3, r: 20 + k * 200, col: '#ffffff' } }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'STAR VOYAGER', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#8ac8ff', c2: '#ffffff', c3: '#02041a', motif: 'implode', pose: ['idle', 'cast_up', 'victory'], lift: 50, cap1: 'Out here the light has no edges.', cap2: 'Nor do I.', title: 'STAR VOYAGER', sub: 'COSMO', size: 104,
    cues: [[0, () => sfx('csHum', 0, 2.4)], [1.4, () => sfx('csHole')], [3.7, () => { sfx('csStar', 0, .8); sfx('csHum', 0, 3); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02041a', bot: '#1c2a6a', stars: '#c8e4ff', sun: { x: .5, y: .3, r: 30 + k * 100, col: '#ffffff' } }, k) });
})();
