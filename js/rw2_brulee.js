// ============================================================
//  MOONKAI — CHEF BRULEE, the Kitchen Terror. Pixel remake + a real kit.
//
//  ORDERS (new gauge, 5 pips)  every special that lands is a dish sent out. At five, the next special is PLATED: +40% damage, heals 120
//                              and leaves a garnish of sparks.
//  TASTE TEST (passive)        heals a little on every special that lands (as before).
//  MASTER CHEF   KNIFE FLURRY (5S) seven knives, PAN SMASH (6S) a heavy pan counter, CHEF'S SPECIAL (2S) a big heal and a buff,
//                FLAMBE (4S) a cone of fire, FLOUR STORM (jS).   THE PERFECT DISH (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('brulee');
  Object.assign(Sfx, {
    brChop(d = 0) { this.nsweep({ f0: 3000, f1: 8000, dur: .08, vol: .22, type: 'highpass', delay: d }); this.impact(.4, d + .04); },
    brSizzle(d = 0, dur = 1) { this.crackle({ dur, vol: .14, delay: d, lo: 2000, hi: 9000 }); this.nsweep({ f0: 5000, f1: 7000, dur, vol: .06, delay: d }); },
    brPan(d = 0) { this.fm({ f: 420, ratio: 2.7, index: 220, dur: .7, vol: .22, delay: d, wet: .3 }); this.nsweep({ f0: 4000, f1: 1000, dur: .08, vol: .14, delay: d }); },
    brBell(d = 0) { this.fm({ f: 1568, ratio: 2.1, index: 60, dur: 1, vol: .16, delay: d, wet: .7 }); },
    brFlame(d = 0, dur = .8) { this.nsweep({ f0: 400, f1: 3500, dur, vol: .22, q: .8, delay: d, wet: .3 }); this.voice({ f: 90, to: 140, dur, vol: .12, type: 'sawtooth', lp: 500, delay: d }); },
    brFrench(d = 0, dur = 3) { this.chord({ notes: [196, 247, 294, 392], dur, vol: .16, type: 'triangle', delay: d, wet: .7 }); this.run({ notes: [392, 494, 587, 494, 392], step: .24, dur: 1.6, vol: .08, type: 'sine', delay: d + .2, wet: .8 }); },
    brYell(d = 0) { this.voice({ f: 150, to: 100, dur: .5, vol: .3, type: 'sawtooth', lp: 1200, n: 3, det: 30, delay: d, wet: .3 }); },
  });
  PxModel.install(def, {});
  const order = (f, n = 1) => { f.gauge = clamp((f.gauge || 0) + n, 0, 5); };
  Rw2.merge(def, {
    gauge: { name: 'ORDERS', max: 5, color: '#ffe0a0', label: f => ((f.gauge || 0) >= 5 ? '· PLATED' : '') },
    passive: ['Taste Test', 'Heals a little on every special that lands. Each special sent out is an ORDER; at five, the next special is PLATED: +40% damage and a 120 heal.'],
    onRoundStart: f => { f.gauge = 0; },
    onHit: (a, t) => { if (a.move && a.move.kind === 'special') { if ((a.gauge || 0) >= 5) { a.gauge = 0; Combat.healSelf(a, 120); Game.popWorld(a.x, a.y - a.h - 40, 'PLATED!', '#ffe0a0', 26); sfx('brBell'); a.platedHit = true; } else order(a, 1); } },
    passiveDmg: f => ((f.gauge || 0) >= 5 && f.move && f.move.kind === 'special' ? 1.4 : 1),
  });
  Combat.hz.brFire = function (h) { const f = h.owner; if (!f) return false; if (h.t === 3 || h.t === 12 || h.t === 21) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - (f.x + f.facing * h.reach / 2)) < h.reach / 2 + 20 && e.y > -200 && (e.x - f.x) * f.facing > -20) Combat.resolveHit(e, f, H_({ dmg: h.t === 21 ? 44 : 24, guard: 'mid', hs: 10, kb: [180 * f.facing, -120], status: { burn: 3 }, sfx: 'm' }), { proj: true, fromX: f.x, move: h.move }); return h.t < h.life; };
  Combat.drawHz.brFire = (c, h) => { const f = h.owner; if (!f) return; const k = Math.min(1, h.t / 6), a = Math.min(1, (h.life - h.t) / 8); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; for (let i = 0; i < 24; i++) { const d = (i / 24) * h.reach * k, w = 12 + d * .2; c.fillStyle = i % 3 ? 'rgba(255,120,30,.9)' : 'rgba(255,230,140,.9)'; c.beginPath(); c.arc(f.x + f.facing * (50 + d), -90 + Math.sin(h.t * .6 + i) * w, w * .7, 0, 7); c.fill(); } c.restore(); };

  const F5 = Mv.shot({ name: 'Knife Flurry', desc: 'Master Chef: seven kitchen knives in a fast fan. Each one is an ORDER.', proj: { speed: 1200, r: 8, dmg: 26, count: 7, spread: .8, kind: 'spear', color: '#e8e8f0', trail: false, life: 1 }, ev: { 3: () => sfx('brChop'), 12: () => sfx('brChop', .04) }, onStart: f => order(f, .5) });
  const F6 = Object.assign(Mv.counter({ name: 'Pan Smash', desc: 'Master Chef: PANG! A heavy pan counter that launches the attacker and shouts at them.', window: 28, dmg: 150, resp: 'strike' }), { onHit: (a, t) => { order(a, 1); sfx('brPan'); sfx('brYell', .05); Cam.shake = 10; }, ev: { 2: () => sfx('brPan') } });
  const F2 = mk({ name: "Chef's Special", desc: 'Master Chef: he plates up something suspicious. Heals 300, +1 ORDER, and a damage buff for 5s.', pose: 'charge', s: 20, a: 1, r: 22, cd: 12, ai: { min: 300, max: 3000, use: 'heal' }, ev: { 3: () => sfx('brSizzle', 0, 1.4), 20: f => { Combat.healSelf(f, 300); order(f, 1); Combat.buff(f, { power: 1 }, 5, "CHEF'S SPECIAL"); sfx('brBell'); } } });
  const F4 = mk({ name: 'Flambe', desc: 'Master Chef: a cone of burning brandy in front of him for a second and a half. Everything it touches burns.', pose: 'cast', s: 14, a: 1, r: 26, cd: 5, ai: { min: 0, max: 360, use: 'combo' }, ev: { 14: f => { Combat.addHazard({ kind: 'brFire', owner: f, side: f.side, reach: 340, life: 30, move: F4 }); sfx('brFlame'); order(f, .5); } } });
  const FJ = Mv.shot({ name: 'Flour Storm', desc: 'Master Chef: flour in a wide cloud from above; whoever walks through it is blinded (slowed).', proj: { speed: 600, angle: 1.0, spread: 1.4, count: 8, r: 14, dmg: 22, kind: 'orb', color: '#fffcf0', core: '#fff', life: 1.2, status: { slow: 1 } }, ev: { 2: () => sfx('brChop') } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'brulee_fult', name: 'THE PERFECT DISH', desc: 'Master Chef: one dish, years in the making. Nobody has ever sent it back. Blockable. Must connect.', pose: 'cast_up', s: 48, dmg: 1280, color: '#ffe0a0',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'THE PERFECT DISH', dur: 8.4, tc: [1.0, 4.4], tf: 5.2, c1: '#ffe0a0', c2: '#ff5a2a', c3: '#2a1a0a', motif: 'beam', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Years in the making.', cap2: 'Nobody sends it back.', title: 'THE PERFECT DISH', sub: 'BON APPETIT', size: 94,
      cues: [[0, () => sfx('brFrench', 0, 3)], [1.4, () => sfx('brSizzle', 0, 2)], [5.2, () => { sfx('brFlame'); sfx('brBell'); sfx('brPan', .2); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0e06', bot: '#7a4a1a', pillars: '#2a1808', embers: '#ff8a3a', rays: '#ffe0a0', sun: { x: .5, y: .22, r: 50 + k * 90, col: '#fff0c0' } }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 48, w: 760, h: 330, back: 200, start: f => { f.say('Voila.', 90); sfx('brFrench'); }, fire: f => { Combat.addHazard({ kind: 'brFire', owner: f, side: f.side, reach: 700, life: 36, move: FU }); const t = f.opp; if (t) { t.status.burn = 5; Combat.healSelf(f, 160); } f.gauge = 5; Cam.shake = 18; sfx('brFlame', 0, 1.2); sfx('brBell', .3); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Tall hat: every hit burns, more healing. New moveset: Knife Flurry, Pan Smash, Chef\'s Special, Flambe, Flour Storm, and the ultimate THE PERFECT DISH.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'KITCHEN NIGHTMARE', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#ff5a2a', c2: '#ffe0a0', c3: '#2a1008', motif: 'rush', pose: ['idle', 'charge', 'dash', 'victory'], cap1: "It's RAW!", cap2: 'Ten courses. Sit.', title: 'KITCHEN NIGHTMARE', sub: 'NOTHING IS LEFT', size: 94,
    cues: [[0, () => sfx('brYell')], [1.4, () => sfx('brSizzle', 0, 1.6)], [4.8, () => { sfx('brPan'); sfx('brFlame'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0e06', bot: '#5a2a10', pillars: '#2a1808', embers: '#ff6a2a' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'MASTER CHEF', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#ffe0a0', c2: '#ff5a2a', c3: '#2a1a0a', motif: 'rise', pose: ['idle', 'cast_up', 'victory'], lift: 20, cap1: 'The hat grows with the stars.', cap2: 'Mine reaches the ceiling.', title: 'MASTER CHEF', sub: 'CHEF BRULEE', size: 104,
    cues: [[0, () => sfx('brSizzle', 0, 1.4)], [1.4, () => sfx('brFrench', 0, 2.4)], [3.7, () => { sfx('brBell'); sfx('brFlame'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0e06', bot: '#7a4a1a', pillars: '#2a1808', embers: '#ff8a3a', rays: '#ffe0a0' }, k) });
})();
