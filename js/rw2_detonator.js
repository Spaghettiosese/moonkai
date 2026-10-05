// ============================================================
//  MOONKAI — DETONATOR, the Demolitions Man. Pixel remake + a real kit.
//
//  FUSE (new gauge)  every bomb he places and every blast he causes. At 100 his next DETONATE is a DOUBLE: the same blasts go off again a
//                    half-second later at +50%.
//  CHAIN REACTION (passive)  explosions near other explosions deal 25% more (as before) — and his new bombs now actually chain: a blast sets
//                    off any of his bombs within reach.
//  NUCLEAR   CLUSTER GRENADES (5S) five bouncing grenades, STICKY SWARM (6S) three mines on the foe, CHAIN DETONATION (2S) every bomb goes off
//            in a ripple, DYNAMITE BARREL (4S) three rolling barrels, CARPET DROP (jS).   MUSHROOM CLOUD (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('detonator');
  Object.assign(Sfx, {
    dtBoom(d = 0, big) { this.impact(big ? 1 : .8, d); this.sub({ f: big ? 52 : 80, to: 24, dur: big ? 1.2 : .6, vol: big ? .6 : .45, delay: d }); this.nsweep({ f0: 2600, f1: 80, dur: big ? .9 : .5, vol: .22, type: 'lowpass', delay: d, wet: .4 }); },
    dtFuse(d = 0, dur = .8) { this.crackle({ dur, vol: .1, delay: d, lo: 2000, hi: 9000 }); this.nsweep({ f0: 1200, f1: 4500, dur, vol: .06, delay: d }); },
    dtBeep(d = 0, n = 4) { for (let i = 0; i < n; i++) this.fm({ f: 1800, ratio: 1, index: 0, dur: .05, vol: .1, type: 'square', delay: d + i * (.3 - i * .04) }); },
    dtThrow(d = 0) { this.nsweep({ f0: 500, f1: 2000, dur: .12, vol: .16, delay: d }); },
    dtLaugh(d = 0) { for (let i = 0; i < 5; i++) this.voice({ f: 200 - (i % 2) * 30, to: 160, dur: .12, vol: .14, type: 'sawtooth', lp: 900, delay: d + i * .14, wet: .3 }); },
    dtSiren(d = 0, dur = 2) { for (let i = 0; i < dur * 2; i++) this.voice({ f: 700 + (i % 2) * 300, dur: .4, vol: .09, type: 'square', lp: 1800, delay: d + i * .5, wet: .3 }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { if ((v.gauge || 0) >= 100 || v.transformed) { const t = v.anim || 0; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? 'rgba(255,208,42,.9)' : 'rgba(255,90,26,.9)'; c.fillRect(Math.round(P.hip[0] - 20 + Math.sin(t * 6 + i) * 20), Math.round(P.hip[1] - 30 - ((t * 60 + i * 21) % 80)), 4, 4); } c.restore(); } } });
  const fuse = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };
  Rw2.merge(def, {
    gauge: { name: 'FUSE', max: 100, color: '#ffd02a', label: f => ((f.gauge || 0) >= 100 ? '· DOUBLE DETONATE' : '') },
    passive: ['Chain Reaction', 'Explosions near other explosions deal 25% more. Bombs he places raise FUSE; at 100 his next Detonate goes off twice, the second at +50%.'],
    onRoundStart: f => { f.gauge = 0; },
    onHit: (a, t) => fuse(a, 3),
  });
  const blast = (f, x, r, dmg, col) => { Combat.explode(x, -30, r, f, dmg, col || '#ffd02a'); sfx('dtBoom'); for (const h of Combat.hazards) if (h.kind === 'dtBomb' && h.owner === f && h !== null && Math.abs(h.x - x) < r * 1.6 && h.fuse > 8) h.fuse = 8; fuse(f, 5); };
  Combat.hz.dtBomb = function (h) { const f = h.owner; if (!f) return false; h.fuse--; if (h.fuse % 12 === 0 && h.fuse > 0) sfx('dtBeep', 0, 1); if (h.fuse <= 0) { blast(f, h.x, h.r || 110, h.dmg || 74, h.col); return false; } return true; };
  Combat.drawHz.dtBomb = (c, h) => { c.save(); c.translate(h.x, -12); c.fillStyle = '#1a1a1a'; c.strokeStyle = '#ffd02a'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 12, 0, 7); c.fill(); c.stroke(); c.fillStyle = (h.fuse % 12 < 6) ? '#ff3a1a' : '#5a1a0a'; c.beginPath(); c.arc(0, -3, 4, 0, 7); c.fill(); c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(6, -20, 3, -24); c.stroke(); c.globalCompositeOperation = 'lighter'; c.fillStyle = '#ffd02a'; c.fillRect(2, -26 + (h.fuse % 3), 3, 3); c.restore(); };
  Combat.hz.dtBarrel = function (h) { const f = h.owner; if (!f) return false; h.x += h.dir * 6; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 36 && e.y > -60) { blast(f, h.x, 120, 90, '#ff5a1a'); return false; } if (h.t > h.life) { blast(f, h.x, 120, 90, '#ff5a1a'); return false; } return h.x > 20 && h.x < Arena.stage.width - 20; };
  Combat.drawHz.dtBarrel = (c, h) => { c.save(); c.translate(h.x, -22); c.rotate(h.t * .3 * h.dir); c.fillStyle = '#c04a1a'; c.strokeStyle = '#2a1a0a'; c.lineWidth = 2; c.fillRect(-16, -22, 32, 44); c.strokeRect(-16, -22, 32, 44); c.fillStyle = '#ffd02a'; c.fillRect(-16, -6, 32, 8); c.restore(); };
  PxKit.setMove(def, '2S', mk({ name: 'Detonate', desc: 'Blows up every bomb he has placed. With a full FUSE it DOUBLES: the same blasts again, a half-second later at +50%.', pose: 'cast_up', s: 12, a: 1, r: 20, cd: 1, ai: { min: 0, max: 1600, use: 'trap' }, ev: { 3: () => sfx('dtBeep'), 12: f => { const bombs = Combat.hazards.filter(h => h.owner === f && (h.kind === 'dtBomb' || h.kind === 'mine' || h.kind === 'sticky')); const dbl = (f.gauge || 0) >= 100; if (dbl) f.gauge = 0; for (const h of Combat.hazards.filter(x => x.owner === f && x.kind === 'dtBomb')) h.fuse = Math.min(h.fuse, 2); bombs.filter(h => h.kind !== 'dtBomb').forEach((h, i) => Game.later(i * .06, () => { blast(f, h.x, 120, 80); h.life = 0; })); if (dbl) { const xs = bombs.map(h => h.x); Game.popWorld(f.x, f.y - f.h - 40, 'DOUBLE DETONATE', '#ffd02a', 24); Game.later(.5, () => { for (const x of xs) blast(f, x, 150, 120, '#ff5a1a'); }); } if (!bombs.length) Game.popWorld(f.x, f.y - f.h - 30, 'NO BOMBS', '#aab', 16); } } }));

  const F5 = mk({ name: 'Cluster Grenades', desc: 'Nuclear: five grenades bounce out in a spread. Each detonates on a short fuse and chains into its neighbors.', pose: 'throw', s: 12, a: 1, r: 24, cd: 3, ai: { min: 120, max: 1100, use: 'zone' }, ev: { 3: () => sfx('dtThrow'), 12: f => { for (let i = 0; i < 5; i++) Game.later(i * .06, () => { Combat.addHazard({ kind: 'dtBomb', owner: f, side: f.side, x: clamp(f.x + f.facing * (160 + i * 110), 30, Arena.stage.width - 30), fuse: 50 + i * 6, r: 100, dmg: 60 }); sfx('dtThrow'); }); fuse(f, 10); } } });
  const F6 = mk({ name: 'Sticky Swarm', desc: 'Nuclear: three sticky mines land on the foe, one beat apart. They go off together.', pose: 'throw', s: 12, a: 1, r: 24, cd: 5, ai: { min: 120, max: 900, use: 'zone' }, ev: { 12: f => { const t = f.opp; if (!t) return; for (let i = 0; i < 3; i++) Game.later(i * .2, () => { Combat.addHazard({ kind: 'dtBomb', owner: f, side: f.side, x: clamp(t.x + (i - 1) * 50, 30, Arena.stage.width - 30), fuse: 90 - i * 30, r: 110, dmg: 70, col: '#7aff3a' }); sfx('dtBeep'); }); fuse(f, 12); } } });
  const F4 = mk({ name: 'Dynamite Barrel', desc: 'Nuclear: three barrels roll low along the floor and explode on contact.', pose: 'throw', s: 14, a: 1, r: 24, cd: 4, ai: { min: 100, max: 900, use: 'zone' }, ev: { 14: f => { for (let i = 0; i < 3; i++) Game.later(i * .24, () => { Combat.addHazard({ kind: 'dtBarrel', owner: f, side: f.side, x: f.x + f.facing * 50, dir: f.facing, life: 70 }); sfx('dtThrow'); }); } } });
  const FJ = Mv.dive({ name: 'Carpet Drop', desc: 'Nuclear: a pass over the stage, dropping five bombs in a row on a short fuse.', vx: 800, vy: 300, hit: { dmg: 40, kb: [100, 100] }, ev: Object.fromEntries([...Array(5)].map((_, i) => [6 + i * 5, f => { Combat.addHazard({ kind: 'dtBomb', owner: f, side: f.side, x: clamp(f.x, 30, Arena.stage.width - 30), fuse: 40, r: 90, dmg: 54 }); sfx('dtThrow'); }])) });
  const FU = PxKit.ult({ id: 'detonator_fult', name: 'MUSHROOM CLOUD', desc: 'Nuclear: the biggest red button there has ever been. Everything on the stage goes off. Blockable. Must connect.', pose: 'cast', s: 50, dmg: 1320, color: '#ffd02a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'MUSHROOM CLOUD', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#ffd02a', c2: '#ffffff', c3: '#2a1000', motif: 'shockwave', pose: ['idle', 'cast', 'cast', 'victory'], actorForm: true, cap1: 'It has one button.', cap2: 'It is red.', title: 'MUSHROOM CLOUD', sub: 'DEFINITELY OVERKILL', size: 104, flash: '#ffffff',
      cues: [[0, () => sfx('dtSiren', 0, 3)], [1.4, () => sfx('dtBeep', 0, 8)], [2.6, () => sfx('dtLaugh')], [5.4, () => { sfx('dtBoom', 0, true); sfx('dtBoom', .25, true); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0a02', bot: '#a85a14', city: '#2a1408', lit: .5, embers: '#ffd02a', sun: { x: .5, y: .3, r: 30 + k * 280, col: '#fff0a0' } }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 50, w: 1100, h: 360, back: 500, start: f => { f.say('KABOOM!', 90); sfx('dtSiren', 0, 1.6); }, fire: f => { for (let i = 0; i < 9; i++) Game.later(i * .06, () => { blast(f, clamp(f.x + f.facing * (-100 + i * 130), 30, Arena.stage.width - 30), 120, 0); }); Cam.shake = 28; sfx('dtBoom', 0, true); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Radioactive: bigger explosions, burn aura. New moveset: Cluster Grenades, Sticky Swarm, Dynamite Barrel, Carpet Drop, and the ultimate MUSHROOM CLOUD.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'CHAIN REACTION', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#ffd02a', c2: '#ff5a1a', c3: '#2a1000', motif: 'meteor', pose: ['idle', 'cast', 'cast', 'victory'], cap1: 'Do not press the red button.', cap2: '*presses it*', title: 'CHAIN REACTION', sub: 'EVERYTHING GOES', size: 98,
    cues: [[0, () => sfx('dtBeep', 0, 6)], [1.4, () => sfx('dtLaugh')], [4.8, () => { sfx('dtBoom', 0, true); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0a02', bot: '#8a4a10', city: '#2a1408', lit: .4, embers: '#ffd02a' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'NUCLEAR', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#7aff3a', c2: '#ffd02a', c3: '#0a1404', motif: 'converge', shape: 'rect', pose: ['idle', 'cast', 'victory'], cap1: 'I added a little something.', cap2: 'It glows.', title: 'NUCLEAR', sub: 'DETONATOR', size: 108,
    cues: [[0, () => sfx('dtBeep', 0, 6)], [1.4, () => sfx('dtFuse', 0, 1.6)], [3.7, () => { sfx('dtBoom', 0, true); sfx('dtLaugh', .2); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a1404', bot: '#3a5a10', embers: '#7aff3a', city: '#14200a', lit: .3 }, k) });
})();
