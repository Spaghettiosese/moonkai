// ============================================================
//  MOONKAI — GLACIA, the Frozen Throne. Pixel remake + ABSOLUTE ZERO moveset.
//  (ICE RESERVE, Frostbite and the CHILL → FREEZE → SHATTER loop stay as they were.)
//  ABSOLUTE ZERO   GLACIAL LANCE (5S) a piercing lance chilling twice, BLIZZARD RUSH (6S) a dash that leaves snow,
//                  THE LONG NIGHT (2S) a still field that chills everyone in it, SHATTERING MIRROR (4S) a counter that bursts
//                  into shards, AVALANCHE (jS).   COCYTUS (form ult) freezes the whole stage, then shatters it.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('glacia');
  Object.assign(Sfx, {
    glChime(d = 0) { this.run({ notes: [1568, 2093, 2637, 3136], step: .07, dur: .9, vol: .09, bell: true, delay: d, wet: .9 }); },
    glShatter(d = 0) { this.nsweep({ f0: 9000, f1: 2000, dur: .25, vol: .22, type: 'highpass', delay: d }); this.fm({ f: 3200, ratio: 2.76, index: 400, dur: .5, vol: .12, delay: d, wet: .7 }); this.crackle({ dur: .3, vol: .12, delay: d, lo: 2000, hi: 9000 }); },
    glWind(d = 0, dur = 2) { this.nsweep({ f0: 300, f1: 1400, dur, vol: .22, q: 2, delay: d, swell: true, wet: .6 }); this.voice({ f: 180, to: 150, dur, vol: .08, type: 'triangle', n: 3, det: 50, delay: d, swell: true, wet: .6 }); },
    glLance(d = 0) { this.nsweep({ f0: 1600, f1: 8000, dur: .16, vol: .2, type: 'bandpass', q: 3, delay: d }); this.glChime(d); },
    glFreeze(d = 0) { this.sub({ f: 80, to: 40, dur: .5, vol: .3, delay: d }); this.glShatter(d + .02); },
    glWinter(d = 0) { this.glWind(d, 3.4); this.riser(2.6, .2, d, 100, 2200); this.glChime(d + 1); },
  });
  PxKit.pixelize(def, { win: [-240, -460, 520, 520] });

  Combat.hz.glField = function (h) { const f = h.owner; if (!f || f.state === 'ko') return false; h.x = h.fixed ? h.x : f.x; if (h.t % 30 === 15) for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < h.r && t.y > -200) { glChill(f, t, 1); Combat.resolveHit(t, f, H_({ dmg: 12, guard: 'mid', hs: 6, kb: [0, -20], sfx: 'l', status: { slow: .6 } }), { proj: true, fromX: h.x }); } return h.t < h.life; };
  Combat.drawHz.glField = (c, h) => { const k = Math.min(1, h.t / 16, (h.life - h.t) / 20), T = h.t / 60; c.save(); c.globalAlpha = .75 * k; c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#bff'; c.lineWidth = 2; c.beginPath(); c.ellipse(h.x, -4, h.r, h.r * .16, 0, 0, 7); c.stroke(); for (let i = 0; i < 46; i++) { const a = i * 2.39, rr = h.r * ((i * 0.137 + T * .15) % 1); c.fillStyle = i % 3 ? '#dff' : '#fff'; c.fillRect(Math.round((h.x + Math.cos(a) * rr) / 3) * 3, Math.round((-4 - ((i * 53 + h.t * 1.5) % 200)) / 3) * 3, 4, 4); } glowCircle(c, h.x, -40, h.r * .8, 'rgba(160,240,255,0.16)', 'rgba(0,0,0,0)'); c.restore(); };

  const F5 = Mv.shot({ name: 'Glacial Lance', desc: 'Absolute Zero: a piercing lance of ice. It CHILLS twice and passes through.', proj: { speed: 1500, r: 14, dmg: 62, kind: 'spear', color: '#bff', core: '#fff', pierce: true, hs: 20, onHit: (t, p) => glChill(p.owner, t, 2) }, ev: { 2: () => sfx('glWind', 0, .6), 12: () => sfx('glLance') } });
  const F6 = Object.assign(Mv.rush({ name: 'Blizzard Rush', desc: 'Absolute Zero: a sliding charge that leaves a trail of snow, chilling anyone who crosses it.', speed: 1500, frames: 18, pass: true, hit: { dmg: 76, kb: [300, -380], launch: true }, ev: { 1: () => sfx('glWind', 0, .8) } }),
    { onStart: f => { f.glFrom = f.x; } });
  { const ev = F6.ev; ev[19] = f => { const a = Math.min(f.glFrom, f.x), b = Math.max(f.glFrom, f.x); for (let x = a; x <= b; x += 90) Rw2.pool(f, x, { r: 50, life: 3, every: .4, dmg: 10, color: '#dff', status: { slow: .6 } }); sfx('glChime'); }; }
  const F2 = mk({ name: 'The Long Night', desc: 'Absolute Zero: a still, freezing field around her for 5s. Anyone inside is CHILLED over and over.', pose: 'cast_up', s: 18, a: 1, r: 22, cd: 7, ai: { min: 0, max: 400, use: 'buff' }, ev: { 3: () => sfx('glWind', 0, 1.4), 18: f => { Combat.addHazard({ kind: 'glField', owner: f, side: f.side, x: f.x, r: 280, life: 300 }); sfx('glChime'); Cam.shake = 5; } } });
  const F4 = Object.assign(Mv.counter({ name: 'Shattering Mirror', desc: 'Absolute Zero: a mirror of ice. The counter freezes the attacker and bursts into shards.', resp: 'reflect', window: 24, dmg: 90 }), { onHit: (a, t) => { glChill(a, t, 5); Combat.fireShots(a, { speed: 900, r: 9, dmg: 34, count: 7, spread: 1.6, kind: 'shard', color: '#bff', onHit: (tt, p) => glChill(p.owner, tt), from: 'above', life: .8 }); sfx('glShatter'); } });
  const FJ = Mv.dive({ name: 'Avalanche', desc: 'Absolute Zero: she falls with a wall of snow; the landing CHILLS everyone nearby.', vx: 300, vy: 1500, hit: { dmg: 94, gb: true }, ev: { 1: () => sfx('glWind', 0, .5) }, onHit: (a, t) => { glChill(a, t, 3); Rw2.pool(a, t.x, { r: 90, life: 3, dmg: 12, color: '#fff', status: { slow: .8 } }); sfx('glShatter'); } });
  const FU = PxKit.ult({ id: 'glacia_fult', name: 'COCYTUS', desc: 'Absolute Zero: the whole stage freezes over; everything still standing on it shatters. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1280, color: '#bff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'COCYTUS', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#9ff', c2: '#ffffff', c3: '#0a2a4a', motif: 'shockwave', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'The lowest circle is not fire.', cap2: 'It is stillness.', title: 'COCYTUS', sub: 'THE LAST WINTER', size: 112,
      cues: [[0, () => sfx('glChime')], [1.4, () => sfx('glWinter')], [5.4, () => { sfx('glFreeze'); sfx('glShatter', .2); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#04101e', bot: '#2a6a9a', snow: true, mount: '#1a3a5a', fog: 'rgba(200,240,255,0.12)', rays: '#dff' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 54, w: 1100, h: 340, back: 400, start: f => { f.say('Be still.', 90); sfx('glWinter'); }, fire: f => { for (const t of Combat.targets(f.side)) { t.status.freeze = Math.max(t.status.freeze || 0, 1.4); Combat.addHazard({ kind: 'glSpikes', owner: f, side: f.side, x: t.x, life: 40 }); } Cam.shake = 20; sfx('glFreeze'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Freezing aura, faster ICE RESERVE. New moveset: Glacial Lance, Blizzard Rush, The Long Night, Shattering Mirror, Avalanche, and the ultimate COCYTUS.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'ETERNAL WINTER', dur: 7.8, tc: [1.0, 4.0], tf: 4.8, c1: '#bff', c2: '#ffffff', c3: '#0a2a4a', motif: 'beam', pose: ['idle', 'cast_up', 'cast', 'victory'], cap1: 'Winter does not end.', cap2: 'It only waits.', title: 'ETERNAL WINTER', sub: 'THE THRONE ENDURES', size: 92,
    cues: [[0, () => sfx('glChime')], [1.2, () => sfx('glWinter')], [4.8, () => { sfx('glFreeze'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#041020', bot: '#2a5a8a', snow: true, mount: '#1a3a5a', rays: '#dff' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'ABSOLUTE ZERO', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#9ff', c2: '#ffffff', c3: '#0a2a4a', motif: 'rain', shape: 'rect', pose: ['idle', 'cast_up', 'victory'], lift: 30, cap1: 'Cold is only absence.', cap2: 'I am the absence of everything.', title: 'ABSOLUTE ZERO', sub: 'NOTHING MOVES', size: 100,
    cues: [[0, () => sfx('glChime')], [1.4, () => sfx('glWind', 0, 3)], [3.9, () => { sfx('glFreeze'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#041020', bot: '#2a5a8a', snow: true, fog: 'rgba(200,240,255,0.14)', rays: '#dff' }, k) });
})();
