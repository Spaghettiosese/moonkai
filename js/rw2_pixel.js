// ============================================================
//  MOONKAI — PIXEL, the Final Boss. Pixel remake + a real kit.
//
//  EXTRA LIFE (passive, stays)  once per round a lethal hit leaves her at 1 HP with 2s of invincibility.
//  SCORE (new gauge)  every hit adds to her SCORE; at 100 the next Power-Up is a GOLDEN ONE: it grants two buffs at once.
//  POWER-UP (2S)      a random buff: speed, damage, shield, or a full heal pickup.
//  FINAL BOSS MODE    BULLET PATTERN (5S) a spiralling bullet hell,  GLITCH DASH (6S) a teleport that leaves a corrupted tile,
//                     LEVEL UP (2S) grows her and doubles her damage briefly,  WARP ZONE (4S) a pipe above the foe: she drops a stomp,
//                     COMBO STOMP (jS) three bounces.   CONTINUE? (form ult)  a ten-second continue screen the foe cannot survive.
//  GAME OVER & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('pixel');
  Object.assign(Sfx, {
    pxCoin(d = 0) { this.fm({ f: 988, ratio: 1, index: 0, dur: .08, vol: .12, delay: d, type: 'square' }); this.fm({ f: 1319, ratio: 1, index: 0, dur: .3, vol: .12, delay: d + .08, type: 'square' }); },
    pxJump(d = 0) { this.voice({ f: 330, to: 880, dur: .18, vol: .12, type: 'square', delay: d }); },
    pxPower(d = 0) { this.run({ notes: [523, 659, 784, 1047, 1319, 1568], step: .06, dur: .3, vol: .1, type: 'square', delay: d }); },
    pxLaser(d = 0) { this.voice({ f: 1800, to: 200, dur: .2, vol: .1, type: 'square', delay: d }); this.nsweep({ f0: 5000, f1: 500, dur: .2, vol: .06, delay: d }); },
    pxGlitch(d = 0) { for (let i = 0; i < 6; i++) this.voice({ f: 200 + Math.random() * 1800, dur: .04, vol: .1, type: 'square', delay: d + i * .03 }); this.crackle({ dur: .2, vol: .1, delay: d, lo: 500, hi: 9000 }); },
    pxOver(d = 0) { this.run({ notes: [392, 330, 262, 196], step: .3, dur: .5, vol: .12, type: 'square', delay: d }); },
    pxCount(d = 0, n = 10) { for (let i = 0; i < n; i++) this.fm({ f: 660, ratio: 1, index: 0, dur: .1, vol: .1, type: 'square', delay: d + i * .5 }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const t = v.anim || 0; if (v.transformed || (v.gauge || 0) >= 100) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#5aff8a' : '#ff5aaa'; c.fillRect(Math.round((P.hip[0] - 30 + ((t * 80 + i * 19) % 60)) / 3) * 3, Math.round((P.hip[1] - 90 + (i * 29 % 80)) / 3) * 3, 6, 3); } c.restore(); } } });
  Object.assign(def, {
    gauge: { name: 'SCORE', max: 100, color: '#ffd35a', label: f => ((f.gauge || 0) >= 100 ? '· GOLDEN POWER-UP READY' : '') },
    passive: ['Extra Life', 'Once per round a lethal hit leaves her at 1 HP with 2s of invincibility. Hits add SCORE; at 100 her next Power-Up is Golden (two buffs).'],
    onHit: (a, t, dmg) => { a.gauge = Math.min(100, (a.gauge || 0) + 3 + dmg * .02); },
    onRoundStart: f => { f.gauge = 0; },
  });
  PxKit.setMove(def, '2S', mk({ name: 'Power-Up', desc: 'Grabs a random power-up: speed, damage, shield or a heal. With a full SCORE it is GOLDEN: two buffs at once.', pose: 'charge', s: 14, a: 1, r: 14, cd: 4, ai: { min: 200, max: 2000, use: 'buff' },
    ev: { 4: () => sfx('pxCoin'), 14: f => { const gold = (f.gauge || 0) >= 100; if (gold) f.gauge = 0; const opts = [['SPEED UP', { haste: 1 }], ['POWER UP', { power: 1 }], ['SHIELD', { shield: 160 }], ['1-UP FOOD', { heal: 120 }]]; const n = gold ? 2 : 1; const picks = opts.sort(() => Math.random() - .5).slice(0, n); for (const [nm, ef] of picks) Combat.buff(f, ef, 6, (gold ? 'GOLDEN ' : '') + nm); sfx('pxPower'); } } }));
  Combat.hz.pxTile = function (h) { const f = h.owner; if (!f) return false; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r && e.y > -20) { if (h.t % 20 === 0) Combat.resolveHit(e, f, H_({ dmg: 16, guard: 'low', hs: 8, kb: [0, 0], sfx: 'l', status: { slow: .6 } }), { proj: true, fromX: h.x }); } return h.t < h.life; };
  Combat.drawHz.pxTile = (c, h) => { const k = Math.min(1, h.t / 8, (h.life - h.t) / 14); c.save(); c.globalAlpha = k; for (let i = 0; i < 24; i++) { const x = h.x - h.r + ((i * 37) % (h.r * 2)), y = -((i * 17 + h.t * 2) % 60); c.fillStyle = ['#5aff8a', '#ff5aaa', '#ffd35a', '#5acaff'][i % 4]; c.fillRect(Math.round(x / 4) * 4, Math.round(y / 4) * 4, 8, 4); } c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(h.x - h.r, -4, h.r * 2, 4); c.restore(); };

  const F5 = mk({ name: 'Bullet Pattern', desc: 'Final Boss: a spiral of bullets, thickening as it goes: bullet hell on a timer.', pose: 'cast_up', s: 12, a: 28, r: 20, cd: 5, ai: { min: 100, max: 1400, use: 'zone' },
    ev: Object.fromEntries([...Array(8)].map((_, i) => [12 + i * 4, f => { Combat.fireShots(f, { speed: 640, r: 7, dmg: 22, count: 3, spread: .5, angle: -.5 + i * .14, kind: 'orb', color: i % 2 ? '#5aff8a' : '#ff5aaa', core: '#fff', life: 1.6, from: 'above' }); sfx('pxLaser'); }])) });
  const F6 = mk({ name: 'Glitch Dash', desc: 'Final Boss: a frame-perfect teleport behind the foe, leaving a corrupted tile that slows them.', pose: 'heavy', s: 8, a: 4, r: 18, inv: [1, 14], hit: { dmg: 76, box: [0, -100, 70, 90], kb: [420, -300], launch: true }, ai: { min: 120, max: 1100, use: 'approach' },
    ev: { 7: f => { const x0 = f.x; Combat.teleport(f, 'behind'); Combat.addHazard({ kind: 'pxTile', owner: f, side: f.side, x: x0, r: 70, life: 150 }); Combat.addHazard({ kind: 'pxTile', owner: f, side: f.side, x: f.x, r: 70, life: 150 }); sfx('pxGlitch'); } } });
  const F2 = mk({ name: 'Level Up', desc: 'Final Boss: she grows a size and does double damage for 5s.', pose: 'charge', s: 12, a: 1, r: 16, cd: 10, ai: { min: 250, max: 2000, use: 'buff' }, ev: { 12: f => { Combat.buff(f, { power: 1, haste: 1 }, 5, 'LEVEL UP'); f.status.power = 5; sfx('pxPower'); } } });
  const F4 = mk({ name: 'Warp Zone', desc: 'Final Boss: a pipe opens above the foe; she drops out of it with a stomp.', pose: 'cast_up', s: 10, a: 12, r: 14, inv: [1, 14], hit: { dmg: 90, box: [0, -50, 60, 70], kb: [200, 700], gb: true, guard: 'high' }, ai: { min: 100, max: 1100, use: 'approach' }, ev: { 2: () => sfx('pxJump'), 9: f => { Combat.teleport(f, 'above'); sfx('pxCoin'); } }, vel: [[10, 22, 0, 1500]] });
  const FJ = Mv.dive({ name: 'Combo Stomp', desc: 'Final Boss: a stomp that bounces. Two more bounces each hit, a coin per bounce.', vx: 300, vy: 1400, hit: { dmg: 70, multi: 1 }, ev: { 1: () => sfx('pxJump') }, onHit: (a, t) => { a.vy = -900; a.gauge = Math.min(100, (a.gauge || 0) + 8); sfx('pxCoin'); } });
  const FU = PxKit.ult({ id: 'pixel_fult', name: 'CONTINUE?', desc: 'Final Boss: a ten-second continue screen the foe cannot survive. Blockable. Must connect.', pose: 'cast_up', s: 40, dmg: 1260, color: '#ffd35a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'CONTINUE?', dur: 8.2, tc: [1.0, 4.2], tf: 5.2, c1: '#ffd35a', c2: '#ffffff', c3: '#05102a', motif: 'barrage', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'CONTINUE?   9   8   7...', cap2: 'Insert coin.', title: 'CONTINUE?', sub: 'GAME OVER', size: 110,
      cues: [[0, () => sfx('pxCount', 0, 8)], [1.4, () => sfx('pxPower')], [5.2, () => { sfx('pxOver'); sfx('pxGlitch', .2); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#05102a', bot: '#1a2a6a', stars: '#5aff8a', grid: 'rgba(90,255,138,.25)' }, k); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 40, w: 900, h: 340, back: 200, start: f => { f.say('CONTINUE?', 80); sfx('pxCount', 0, 6); }, fire: f => { for (let i = 0; i < 8; i++) Game.later(i * .07, () => { const x = clamp(f.x + f.facing * (100 + i * 100), 30, Arena.stage.width - 30); Combat.explode(x, -70, 70, f, 0, i % 2 ? '#5aff8a' : '#ff5aaa'); sfx('pxLaser'); }); Cam.shake = 18; sfx('pxOver'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Glitch aura, bigger shots, 1-UP restored. New moveset: Bullet Pattern, Glitch Dash, Level Up, Warp Zone, Combo Stomp, and the ultimate CONTINUE?' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'GAME OVER', dur: 7.6, tc: [1.0, 3.8], tf: 4.6, c1: '#5aff8a', c2: '#ffffff', c3: '#05102a', motif: 'rush', pose: ['idle', 'charge', 'dash', 'victory'], cap1: 'Press START.', cap2: 'Not for you.', title: 'GAME OVER', sub: 'INSERT COIN', size: 104,
    cues: [[0, () => sfx('pxCoin')], [1.2, () => sfx('pxPower')], [4.6, () => { sfx('pxGlitch'); sfx('pxOver', .2); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#05102a', bot: '#12306a', stars: '#5aff8a', grid: 'rgba(90,255,138,.2)' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'FINAL BOSS MODE', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#5aff8a', c2: '#ff5aaa', c3: '#05102a', motif: 'rain', shape: 'rect', pose: ['idle', 'charge', 'victory'], lift: 24, cap1: 'WARNING.', cap2: 'A HUGE CHALLENGER APPROACHES.', title: 'FINAL BOSS MODE', sub: 'PIXEL', size: 96,
    cues: [[0, () => sfx('pxCount', 0, 4)], [1.2, () => sfx('pxGlitch')], [3.7, () => { sfx('pxPower'); sfx('pxOver'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#05102a', bot: '#2a1a5a', stars: '#5aff8a', grid: 'rgba(255,90,170,.25)' }, k) });
})();
