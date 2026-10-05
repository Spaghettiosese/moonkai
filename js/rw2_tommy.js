// ============================================================
//  MOONKAI — TOMMY & BOLTZ, the Best Friends. Pixel remake + a real kit.
//
//  BOND (new gauge)  fills when they fight together and every time Tommy gets hit and keeps going. At 100 Boltz does a free BEAR HUG
//                    assist: a grab-slam from across the stage.
//  BOLTZ (passive)   5S, 6S and 2S are Boltz's attacks from a distance (as before).
//  COMBINE   MECH COMBO (5S) a three-punch combination, ROCKET FIST BARRAGE (6S) three fists in a spread, QUAKE STOMP (2S) a stomp with a
//            wave, SCRAP FORTRESS (4S) a wall with two turrets, MECH DROP (jS).   OMEGA COMBINE RUSH (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('tommy');
  Object.assign(Sfx, {
    tmBeep(d = 0, p = 1) { this.fm({ f: 1320 * p, ratio: 1.5, index: 30, dur: .12, vol: .1, type: 'square', delay: d }); this.fm({ f: 1760 * p, ratio: 1.5, index: 30, dur: .12, vol: .08, type: 'square', delay: d + .1 }); },
    tmClank(d = 0) { this.fm({ f: 300, ratio: 3.1, index: 260, dur: .5, vol: .16, delay: d, wet: .3 }); this.nsweep({ f0: 3000, f1: 800, dur: .1, vol: .1, delay: d }); },
    tmRocket(d = 0) { this.nsweep({ f0: 2400, f1: 400, dur: .5, vol: .2, type: 'lowpass', delay: d }); this.sub({ f: 100, to: 50, dur: .25, vol: .2, delay: d }); },
    tmStomp(d = 0) { this.sub({ f: 70, to: 30, dur: .45, vol: .5, delay: d }); this.impact(.9, d); this.tmClank(d); },
    tmYay(d = 0) { this.run({ notes: [523, 659, 784, 1047], step: .08, dur: .6, vol: .1, type: 'square', delay: d }); },
    tmCombine(d = 0) { this.riser(1.6, .22, d, 80, 1600); for (let i = 0; i < 5; i++) this.tmClank(d + .3 + i * .28); this.tmStomp(d + 1.8); },
  });
  PxModel.install(def, {});
  const bond = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (f.gauge >= 100) { f.gauge = 0; const t = f.opp; if (t) { Game.popWorld(f.x, f.y - f.h - 40, 'BEAR HUG!', '#5a9aff', 26); Game.later(.3, () => { t.x = clamp(f.x + f.facing * 90, 40, Arena.stage.width - 40); Combat.resolveHit(t, f, H_({ dmg: 120, guard: 'unblock', hs: 30, kb: [500, -600], launch: true, sfx: 'h' }), { proj: true, fromX: f.x }); sfx('tmStomp'); Cam.shake = 12; }); sfx('tmYay'); } } };
  Rw2.merge(def, {
    gauge: { name: 'BOND', max: 100, color: '#5a9aff', label: f => ((f.gauge || 0) >= 90 ? '· BEAR HUG SOON' : '') },
    passive: ['Boltz', 'Boltz fights alongside him: 5S, 6S and 2S are robot attacks from a distance. Fighting together fills BOND; at 100 Boltz crosses the stage for a free BEAR HUG.'],
    onRoundStart: f => { f.gauge = 0; },
    onHit: (a, t) => bond(a, 4),
    onHurt: (t, a, dmg) => bond(t, dmg * .04),
  });
  Combat.hz.tmFist = function (h) { const f = h.owner; if (!f) return false; h.x += h.dir * 13; h.y = (h.y0 || -90); for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 48 && e.y > -200 && !h.hit.has(e)) { h.hit.add(e); Combat.resolveHit(e, f, H_({ dmg: 62, guard: 'mid', hs: 18, kb: [420 * h.dir, -240], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); bond(f, 6); sfx('tmClank'); } return h.t < h.life && h.x > -60 && h.x < Arena.stage.width + 60; };
  Combat.drawHz.tmFist = (c, h) => { c.save(); c.translate(h.x, h.y0 || -90); c.scale(h.dir, 1); c.fillStyle = '#9aa4b0'; c.strokeStyle = '#2a2e38'; c.lineWidth = 2; c.fillRect(-36, -8, 36, 16); c.strokeRect(-36, -8, 36, 16); c.beginPath(); c.arc(8, 0, 20, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#5a9aff'; c.fillRect(2, -4, 10, 8); c.globalCompositeOperation = 'lighter'; glowCircle(c, -40, 0, 26, 'rgba(255,170,60,.7)', 'rgba(0,0,0,0)'); c.restore(); };

  const F5 = Mv.flurry({ name: 'Mech Combo', desc: 'Combine: a three-punch combination with the mech arms, the last one a launcher.', hits: 3, every: 8, hit: { dmg: 40 }, finisher: { dmg: 90, kb: [500, -640], launch: true }, ev: { 4: () => sfx('tmClank'), 12: () => sfx('tmClank', 0, 1.1), 20: () => sfx('tmStomp') }, onHit: a => bond(a, 3) });
  const F6 = mk({ name: 'Rocket Fist Barrage', desc: 'Combine: three rocket fists in a spread, one after another.', pose: 'punch', s: 12, a: 1, r: 26, cd: 4, ai: { min: 100, max: 1300, use: 'zone' }, ev: { 12: f => { for (let i = 0; i < 3; i++) Game.later(i * .15, () => { Combat.addHazard({ kind: 'tmFist', owner: f, side: f.side, x: f.x + f.facing * 60, dir: f.facing, y0: -60 - i * 36, life: 70, hit: new Set(), move: F6 }); sfx('tmRocket'); }); } } });
  const F2 = mk({ name: 'Quake Stomp', desc: 'Combine: the mech stomps and the ground ripples out in both directions.', pose: 'slam', s: 18, a: 2, r: 26, cd: 4, ai: { min: 0, max: 400, use: 'combo' }, ev: { 18: f => { Combat.addHazard({ kind: 'tiClap', owner: f, side: f.side, x: f.x, life: 26, move: F2 }); sfx('tmStomp'); } } });
  const F4 = mk({ name: 'Scrap Fortress', desc: 'Combine: a junk wall with a turret on either side of it.', pose: 'cast', s: 14, a: 1, r: 22, cd: 9, ai: { min: 0, max: 700, use: 'trap' }, ev: { 14: f => { Combat.place(f, { kind: 'wall', at: 'front', dx: 100, w: 54, hgt: 170, hp: 360, life: 7, dmg: 70, style: 'scrap', colors: ['#9aa4b0', '#3a3e48'], limit: 1 }); Combat.place(f, { kind: 'turret', at: 'front', dx: 60, life: 8, hp: 100, shotDmg: 24, limit: 2 }); Combat.place(f, { kind: 'turret', at: 'front', dx: 150, life: 8, hp: 100, shotDmg: 24, limit: 2 }); sfx('tmClank'); sfx('tmBeep'); } } });
  const FJ = Mv.dive({ name: 'Mech Drop', desc: 'Combine: the mech jumps and comes down like a building; Tommy waves from the cockpit.', vx: 240, vy: 1800, hit: { dmg: 122, gb: true }, ev: { 1: () => sfx('tmRocket') }, onHit: a => { Combat.addHazard({ kind: 'tiClap', owner: a, side: a.side, x: a.x, life: 22, move: FJ }); bond(a, 10); sfx('tmStomp'); } });
  const FU = PxKit.ult({ id: 'tommy_fult', name: 'OMEGA COMBINE RUSH', desc: 'Combine: they stop pretending to be two. A rocket punch, a rocket kick, a rocket everything. Blockable. Must connect.', pose: 'punch', s: 46, dmg: 1300, color: '#5a9aff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'OMEGA COMBINE RUSH', dur: 8.4, tc: [1.0, 4.4], tf: 5.2, c1: '#5a9aff', c2: '#ffb040', c3: '#0a1428', motif: 'rush', pose: ['idle', 'charge', 'punch', 'victory'], actorForm: true, cap1: 'Ready, Boltz?', cap2: 'READY, TOMMY!', title: 'OMEGA COMBINE RUSH', sub: 'BEST. FRIENDS. EVER.', size: 82,
      cues: [[0, () => sfx('tmBeep', 0, 1)], [1.4, () => sfx('tmCombine')], [5.2, () => { sfx('tmRocket'); sfx('tmStomp', .2); sfx('tmYay', .4); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a1428', bot: '#2a4a8a', city: '#0a1428', lit: .8, rays: '#ffb040' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 46, w: 900, h: 330, back: 200, start: f => { f.say('COMBINE!', 80); sfx('tmCombine'); }, fire: f => { for (let i = 0; i < 4; i++) Game.later(i * .1, () => { Combat.addHazard({ kind: 'tmFist', owner: f, side: f.side, x: f.x + f.facing * 40, dir: f.facing, y0: -50 - i * 30, life: 70, hit: new Set(), move: FU }); sfx('tmRocket'); }); Cam.shake = 16; sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'TIMED (12s). Tommy climbs inside Boltz: a giant mech. New moveset: Mech Combo, Rocket Fist Barrage, Quake Stomp, Scrap Fortress, Mech Drop, and the ultimate OMEGA COMBINE RUSH.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'ROCKET PUNCH OMEGA', dur: 7.8, tc: [1.0, 3.8], tf: 4.6, c1: '#5a9aff', c2: '#ffb040', c3: '#0a1428', motif: 'beam', pose: ['idle', 'charge', 'punch', 'victory'], cap1: 'Boltz? Full power!', cap2: 'ROCKET PUNCH!', title: 'ROCKET PUNCH OMEGA', sub: 'FULL POWER', size: 80,
    cues: [[0, () => sfx('tmBeep')], [1.2, () => sfx('tmCombine', 0)], [4.6, () => { sfx('tmRocket'); sfx('tmStomp'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a1428', bot: '#2a4a8a', city: '#0a1428', lit: .7, rays: '#ffb040' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'COMBINE', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#5a9aff', c2: '#ffb040', c3: '#0a1428', motif: 'converge', shape: 'rect', pose: ['idle', 'cast', 'victory'], cap1: 'Together!', cap2: 'Forever!', title: 'COMBINE', sub: 'TOMMY & BOLTZ', size: 112,
    cues: [[0, () => sfx('tmBeep')], [1.4, () => sfx('tmCombine', 0)], [3.7, () => { sfx('tmStomp'); sfx('tmYay'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a1428', bot: '#2a4a8a', city: '#0a1428', lit: .8 }, k) });
})();
