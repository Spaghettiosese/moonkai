// ============================================================
//  MOONKAI — MASTER HOSHI, the Old Crane. Pixel remake + a real kit.
//
//  FLOW (new gauge)  counters and clean dodges fill it. At 100 his next palm becomes a FLOWING PALM: a free, guaranteed combo
//                    extension that lands three more strikes.
//  WISDOM (passive)  counter hits deal double damage (as before).
//  AWAKENED YOUTH    PALM WAVE (5S) a rolling shockwave of chi, THOUSAND PALMS (6S) twenty strikes, DRUNKEN MASTER (2S) a counter that
//                    steps behind and answers, CRANE ASCENDS (4S) a higher invincible kick, PHOENIX KICK (jS).
//  ONE THOUSAND PALMS (form ult)   the old man finishes the argument.    HUNDRED PALM HEAVEN & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('hoshi');
  Object.assign(Sfx, {
    hsPalm(d = 0) { this.nsweep({ f0: 400, f1: 1800, dur: .12, vol: .2, q: 1.5, delay: d }); this.impact(.4, d + .05); },
    hsChime(d = 0) { this.fm({ f: 392, ratio: 2, index: 40, dur: 1.4, vol: .14, delay: d, wet: .9 }); this.fm({ f: 587, ratio: 2, index: 30, dur: 1.2, vol: .08, delay: d + .1, wet: .9 }); },
    hsGong(d = 0) { this.fm({ f: 110, ratio: 1.41, index: 200, dur: 2.2, vol: .22, delay: d, wet: .9 }); this.sub({ f: 55, to: 40, dur: 1.2, vol: .3, delay: d }); },
    hsWind(d = 0, dur = 1) { this.nsweep({ f0: 300, f1: 1800, dur, vol: .16, q: 2, delay: d, wet: .6 }); },
    hsRapid(d = 0, n = 12) { for (let i = 0; i < n; i++) this.hsPalm(d + i * .05); },
    hsFlute(d = 0) { this.run({ notes: [587, 659, 784, 880, 784], step: .22, dur: 1.4, vol: .1, type: 'sine', delay: d, wet: .9 }); },
  });
  PxModel.install(def, {});
  const flow = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };
  Rw2.merge(def, {
    gauge: { name: 'FLOW', max: 100, color: '#ffe0a0', label: f => ((f.gauge || 0) >= 100 ? '· FLOWING PALM READY' : '') },
    passive: ['Wisdom', 'Counter hits deal double damage. Counters and dodges fill FLOW; at 100 his next palm FLOWS: three more strikes, free.'],
    onRoundStart: f => { f.gauge = 0; },
    onHit: (a, t) => { if (a.move && (a.move.counter || a.move.name === 'Drunken Sway')) flow(a, 40); else flow(a, 4); if (a.move && a.move.name === 'Chi Palm' && (a.gauge || 0) >= 100) { a.gauge = 0; Game.popWorld(a.x, a.y - a.h - 40, 'FLOWING PALM', '#ffe0a0', 24); sfx('hsRapid', 0, 6); for (let i = 1; i <= 3; i++) Game.later(i * .09, () => { Combat.resolveHit(t, a, H_({ dmg: 30, guard: 'mid', hs: 10, kb: [90, -120], sfx: 'm' }), { proj: true, fromX: a.x }); sfx('hsPalm'); }); } },
  });
  Combat.hz.hsWave = function (h) { const f = h.owner; if (!f) return false; h.x += h.dir * 10; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 60 && e.y > -160 && !h.hit.has(e)) { h.hit.add(e); Combat.resolveHit(e, f, H_({ dmg: 62, guard: 'mid', hs: 20, kb: [420 * h.dir, -200], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); flow(f, 10); } return h.t < h.life && h.x > 0 && h.x < Arena.stage.width; };
  Combat.drawHz.hsWave = (c, h) => { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { c.strokeStyle = `rgba(255,224,160,${.8 - i * .18})`; c.lineWidth = 6 - i; c.beginPath(); c.arc(h.x - h.dir * i * 22, -70, 60 - i * 8, h.dir > 0 ? -1.1 : Math.PI - 1.1, h.dir > 0 ? 1.1 : Math.PI + 1.1); c.stroke(); } c.restore(); };

  const F5 = mk({ name: 'Palm Wave', desc: 'Awakened Youth: a rolling wave of chi from the palm, lifting whatever it meets.', pose: 'punch', s: 12, a: 1, r: 22, cd: 2, ai: { min: 100, max: 1100, use: 'zone' }, ev: { 3: () => sfx('hsWind'), 12: f => { Combat.addHazard({ kind: 'hsWave', owner: f, side: f.side, x: f.x + f.facing * 70, dir: f.facing, life: 80, hit: new Set(), move: F5 }); sfx('hsPalm'); } } });
  const F6 = Mv.flurry({ name: 'Thousand Palms', desc: 'Awakened Youth: twenty palms in a blur, ending in a double-handed launch. +25 FLOW.', hits: 20, every: 2, hit: { dmg: 10 }, finisher: { dmg: 90, kb: [500, -760], launch: true }, ev: { 3: () => sfx('hsRapid', 0, 14) }, onHit: a => flow(a, 1.2) });
  const F2 = Object.assign(Mv.counter({ name: 'Drunken Master', desc: 'Awakened Youth: sways out of a hit, steps behind the foe, and answers with a palm. Counters double.', window: 30, dmg: 140, resp: 'strike' }), { onHit: (a, t) => { Combat.teleport(a, 'behind'); flow(a, 50); sfx('hsGong'); }, ev: { 2: () => sfx('hsWind') } });
  const F4 = Mv.rising({ name: 'Crane Ascends', desc: 'Awakened Youth: a higher, invincible rising kick with a flurry at the top.', height: 1150, hit: { dmg: 46, multi: 4, every: 3, kb: [120, -1100] }, ev: { 6: () => sfx('hsPalm') } });
  const FJ = Mv.dive({ name: 'Phoenix Kick', desc: 'Awakened Youth: a flying kick on a line of fire-colored chi.', vx: 1000, vy: 1100, hit: { dmg: 96, gb: true }, ev: { 1: () => sfx('hsWind') }, onHit: a => flow(a, 10) });
  const FU = PxKit.ult({ id: 'hoshi_fult', name: 'ONE THOUSAND PALMS', desc: 'Awakened Youth: the old man finishes the argument. A thousand palms in the time it takes to bow. Blockable. Must connect.', pose: 'punch', s: 36, dmg: 1280, color: '#ffe0a0',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'ONE THOUSAND PALMS', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#ffe0a0', c2: '#ffffff', c3: '#2a1a08', motif: 'slashes', pose: ['idle', 'charge', 'punch', 'victory'], actorForm: true, cap1: 'Sixty years. One lesson.', cap2: 'Now you learn it.', title: 'ONE THOUSAND PALMS', sub: 'THE ARGUMENT ENDS', size: 94,
      cues: [[0, () => sfx('hsFlute')], [1.4, () => sfx('hsGong')], [4.8, () => { sfx('hsRapid', 0, 24); sfx('hsGong', .6); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0804', bot: '#3a2610', pillars: '#241808', fog: 'rgba(255,224,160,0.08)', rays: '#ffe0a0' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 36, w: 520, h: 320, back: 100, start: f => { f.say('Observe.', 80); sfx('hsGong'); }, fire: f => { for (let i = 0; i < 14; i++) Game.later(i * .04, () => { const t = f.opp; if (t) { Game.fx.burst(t.x + rand(-60, 60), -80 + rand(-60, 60), 4, { color: ['#ffe0a0', '#fff'], size: 6, speed: 300, life: .25, glow: true }); sfx('hsPalm'); } }); Cam.shake = 14; sfx('hsGong'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. He becomes young again: faster and stronger. New moveset: Palm Wave, Thousand Palms, Drunken Master, Crane Ascends, Phoenix Kick, and the ultimate ONE THOUSAND PALMS.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'HUNDRED PALM HEAVEN', dur: 7.6, tc: [1.0, 3.6], tf: 4.4, c1: '#ffe0a0', c2: '#ffffff', c3: '#2a1a08', motif: 'rush', pose: ['idle', 'charge', 'punch', 'victory'], cap1: 'One palm.', cap2: 'Then a hundred more.', title: 'HUNDRED PALM HEAVEN', sub: 'BOW', size: 88,
    cues: [[0, () => sfx('hsFlute')], [1.2, () => sfx('hsChime')], [4.4, () => { sfx('hsRapid', 0, 20); sfx('hsGong'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0804', bot: '#3a2610', pillars: '#241808', clouds: '#5a4228', rays: '#ffe0a0' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'AWAKENED YOUTH', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#ffe0a0', c2: '#ffffff', c3: '#2a1a08', motif: 'rise', pose: ['idle', 'charge', 'victory'], lift: 24, cap1: 'Age is a stance.', cap2: 'I have changed it.', title: 'AWAKENED YOUTH', sub: 'MASTER HOSHI', size: 96,
    cues: [[0, () => sfx('hsFlute')], [1.4, () => sfx('hsGong')], [3.7, () => { sfx('hsChime'); sfx('hsRapid', 0, 10); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0804', bot: '#3a2610', pillars: '#241808', clouds: '#5a4228' }, k) });
})();
