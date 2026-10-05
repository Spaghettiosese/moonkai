// ============================================================
//  MOONKAI — DUNE, the Sand King. Pixel remake + a real kit.
//
//  SAND (new gauge)  fills while slowed foes are near him (he drinks the dust they kick up). At 100 the SANDSTORM breaks: for 5s the
//                    foe is blinded (slow) and takes chip damage every beat.
//  SANDSTORM (passive) his projectiles slow; slowed enemies take chip damage (as before).
//  SAND PHARAOH    SANDSTORM LANCE (5S) a spear of packed sand, DUNE RIDER (6S) a slide on a wave of sand, PYRAMID SPIKE (2S) a row of
//                  stone-tipped pillars, MUMMY KING (4S) three mummies, LOCUST SWARM (jS).   TOMB OF AGES (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('dune');
  Object.assign(Sfx, {
    duWind(d = 0, dur = 1.6) { this.nsweep({ f0: 500, f1: 2000, dur, vol: .22, q: 1, delay: d, swell: true, wet: .5 }); this.crackle({ dur, vol: .08, delay: d, lo: 2000, hi: 8000 }); },
    duHorn(d = 0, dur = 1.8) { this.voice({ f: 196, to: 220, dur, vol: .2, type: 'sawtooth', lp: 1200, n: 2, det: 20, delay: d, wet: .8 }); this.voice({ f: 294, to: 330, dur, vol: .1, type: 'sawtooth', lp: 1200, delay: d + .1, wet: .8 }); },
    duSand(d = 0) { this.nsweep({ f0: 1800, f1: 5000, dur: .25, vol: .16, q: 1.4, delay: d, wet: .3 }); this.crackle({ dur: .25, vol: .08, delay: d, lo: 1500, hi: 8000 }); },
    duStone(d = 0) { this.impact(.8, d); this.sub({ f: 80, to: 30, dur: .5, vol: .4, delay: d }); },
    duScarab(d = 0, n = 12) { for (let i = 0; i < n; i++) this.nsweep({ f0: 3500 + (i % 3) * 700, f1: 6000, dur: .04, vol: .06, type: 'bandpass', q: 3, delay: d + i * .04 }); },
    duTomb(d = 0) { this.sub({ f: 60, to: 26, dur: 1.4, vol: .5, delay: d }); this.impact(1, d); this.duWind(d, 1.6); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const t = v.anim || 0; if ((v.gauge || 0) >= 100 || v.transformed) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? 'rgba(224,176,96,.9)' : 'rgba(255,230,160,.9)'; c.fillRect(Math.round(P.hip[0] - 40 + ((t * 80 + i * 17) % 80)), Math.round(P.hip[1] - 10 - i * 8), 5, 2); } c.restore(); } } });
  const sand = (f, n) => { if (f.stormT > 0) return; f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (f.gauge >= 100) { f.gauge = 0; f.stormT = 5 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'SANDSTORM', '#e0b060', 26); sfx('duWind', 0, 2); Cam.shake = 6; } };
  Rw2.merge(def, {
    gauge: { name: 'SAND', max: 100, color: '#e0b060', label: f => (f.stormT > 0 ? '· SANDSTORM' : '') },
    passive: ['Sandstorm', 'His projectiles slow; slowed enemies take chip damage. Slowed foes nearby fill SAND; at 100 the SANDSTORM breaks for 5s: the foe is blinded and takes damage every beat.'],
    onRoundStart: f => { f.gauge = 0; f.stormT = 0; },
    passiveTick: f => { const o = f.opp; if (f.stormT > 0) { f.stormT--; if (o && f.st % 30 === 0) { o.status.slow = Math.max(o.status.slow || 0, .6); Combat.resolveHit(o, f, H_({ dmg: 16, guard: 'mid', hs: 5, kb: [0, 0], sfx: 'l' }), { proj: true, fromX: f.x }); } } else if (o && o.status.slow && Math.abs(o.x - f.x) < 420 && f.st % 10 === 0) sand(f, 2); },
  });
  Combat.hz.duLance = function (h) { const f = h.owner; if (!f) return false; h.x += h.dir * 16; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 40 && e.y > -150 && !h.hit.has(e)) { h.hit.add(e); Combat.resolveHit(e, f, H_({ dmg: 70, guard: 'mid', hs: 20, kb: [300 * h.dir, -240], launch: true, status: { slow: 1.2 }, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); sand(f, 12); } return h.t < h.life && h.x > -40 && h.x < Arena.stage.width + 40; };
  Combat.drawHz.duLance = (c, h) => { c.save(); c.translate(h.x, -90); c.scale(h.dir, 1); c.fillStyle = '#d8a850'; c.strokeStyle = '#6a4a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(60, 0); c.lineTo(-40, -12); c.lineTo(-40, 12); c.closePath(); c.fill(); c.stroke(); for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#f0d890' : '#b88a3a'; c.fillRect(-90 - i * 10 + Math.sin(h.t * .6 + i) * 4, -14 + (i % 4) * 8, 14, 3); } c.restore(); };
  Combat.hz.duRide = function (h) { const f = h.owner; if (!f) return false; if (h.t % 6 === 0) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - f.x) < 80 && e.y > -150) Combat.resolveHit(e, f, H_({ dmg: 28, guard: 'mid', hs: 8, kb: [160 * f.facing, -120], sfx: 'm', status: { slow: .8 } }), { proj: true, fromX: f.x }); return h.t < h.life; };
  Combat.drawHz.duRide = (c, h) => { const f = h.owner; if (!f) return; c.save(); for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#e0c080' : '#c09848'; c.fillRect(Math.round((f.x - f.facing * (i * 8 + (h.t * 3) % 8) - 10) / 3) * 3, -16 + (i % 3) * 5, 18, 4); } c.restore(); };

  const F5 = mk({ name: 'Sandstorm Lance', desc: 'Sand Pharaoh: a spear of packed sand that flies straight and slows whatever it pierces.', pose: 'punch', s: 12, a: 1, r: 22, cd: 2, ai: { min: 100, max: 1300, use: 'zone' }, ev: { 3: () => sfx('duWind', 0, .6), 12: f => { Combat.addHazard({ kind: 'duLance', owner: f, side: f.side, x: f.x + f.facing * 50, dir: f.facing, life: 70, hit: new Set(), move: F5 }); sfx('duSand'); } } });
  const F6 = mk({ name: 'Dune Rider', desc: 'Sand Pharaoh: he surfs forward on a wave of sand for 0.6s, hitting and slowing whatever he passes.', pose: 'dash', s: 6, a: 24, r: 16, vel: [[6, 30, 1050, null]], inv: [1, 10], ai: { min: 150, max: 800, use: 'approach' }, ev: { 6: f => { Combat.addHazard({ kind: 'duRide', owner: f, side: f.side, life: 30 }); sfx('duWind', 0, .8); }, 30: f => { sand(f, 8); } } });
  const F2 = mk({ name: 'Pyramid Spike', desc: 'Sand Pharaoh: a row of stone-tipped pillars marches out in front of him.', pose: 'slam', s: 18, a: 1, r: 26, cd: 4, ai: { min: 100, max: 1000, use: 'zone' }, ev: { 18: f => { Rw2.row(f, 6, 105, { r: 48, life: 8, stagger: 5, color: '#e0b060', dmg: 70, status: { slow: 1 }, move: F2, shake: 4, after: () => sand(f, 4) }); sfx('duStone'); sfx('duHorn', .1, 1.2); } } });
  const F4 = Mv.place({ name: 'Mummy King', desc: 'Sand Pharaoh: three mummies shamble in, one after another.', s: 16, spawn: { kind: 'minion', at: 'front', dx: 60, look: 'skeleton', dmg: 66, hp: 120, speed: 300, color: '#e8d8a8', count: 3, spacing: 64, stagger: 8 }, cd: 7, ev: { 4: () => sfx('duHorn', 0, 1.4) } });
  const FJ = Mv.shot({ name: 'Locust Swarm', desc: 'Sand Pharaoh: a cloud of scarabs and locusts falls in a wide arc.', proj: { speed: 700, angle: 1.0, spread: 1.3, count: 9, r: 8, dmg: 26, kind: 'orb', color: '#c09848', core: '#3a2a10', life: 1.2, status: { slow: .6 } }, ev: { 2: () => sfx('duScarab') } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'dune_fult', name: 'TOMB OF AGES', desc: 'Sand Pharaoh: the sands close over the whole arena and raise a pyramid from the floor. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1300, color: '#e0b060',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'TOMB OF AGES', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#e0b060', c2: '#fff0c0', c3: '#2a1a08', motif: 'pillar', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Kings do not die.', cap2: 'They are filed.', title: 'TOMB OF AGES', sub: 'SEALED', size: 104,
      cues: [[0, () => sfx('duHorn', 0, 2.2)], [1.4, () => sfx('duWind', 0, 3.6)], [5.4, () => { sfx('duTomb'); sfx('duStone', .3); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#1a0e04', bot: '#c88a38', sun: { x: .5, y: .3, r: 80, col: '#fff0b0' }, mount: '#6a4a1a', rays: '#ffe0a0' }, k); x.save(); x.fillStyle = '#b88a3a'; x.beginPath(); x.moveTo(W * .5 - 360 * k, H); x.lineTo(W * .5, H - 520 * k); x.lineTo(W * .5 + 360 * k, H); x.fill(); x.restore(); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 54, w: 1000, h: 340, back: 400, start: f => { f.say('Be filed.', 90); sfx('duHorn', 0, 1.6); }, fire: f => { Rw2.row(f, 9, 100, { from: 'foe', r: 50, life: 6, stagger: 3, color: '#e0b060', dmg: 0, giant: true, shake: 3 }); for (const e of Combat.targets(f.side)) { e.status.slow = 4; } Cam.shake = 22; sfx('duTomb'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Floats on sand, stronger storms. New moveset: Sandstorm Lance, Dune Rider, Pyramid Spike, Mummy King, Locust Swarm, and the ultimate TOMB OF AGES.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'DESERT TOMB', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#e0b060', c2: '#fff0c0', c3: '#2a1a08', motif: 'pillar', pose: ['idle', 'cast_up', 'cast_up', 'victory'], cap1: 'The desert keeps what it is given.', cap2: 'Thank you for the gift.', title: 'DESERT TOMB', sub: 'SEALED IN STONE', size: 100,
    cues: [[0, () => sfx('duHorn')], [1.4, () => sfx('duWind', 0, 2.6)], [4.8, () => { sfx('duTomb'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0e04', bot: '#a8742c', sun: { x: .7, y: .28, r: 70, col: '#fff0b0' }, mount: '#5a3a14', rays: '#ffe0a0' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'SAND PHARAOH', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#e0b060', c2: '#fff0c0', c3: '#2a1a08', motif: 'rise', shape: 'rect', pose: ['idle', 'cast_up', 'victory'], lift: 40, cap1: 'Sand remembers every footstep.', cap2: 'I remember it too.', title: 'SAND PHARAOH', sub: 'DUNE', size: 100,
    cues: [[0, () => sfx('duHorn')], [1.4, () => sfx('duWind', 0, 3)], [3.9, () => { sfx('duStone'); sfx('duHorn', 0, 1.4); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0e04', bot: '#b88030', sun: { x: .5, y: .3, r: 70, col: '#fff0b0' }, mount: '#5a3a14', rays: '#ffe0a0' }, k) });
})();
