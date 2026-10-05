// ============================================================
//  MOONKAI — TITANIA, the Summer Queen. Pixel remake + a real kit.
//
//  GLAMOUR (new gauge)  fills as she flits: moving, dashing and air time. At 100 she is ENCHANTED for 5s: Pixie Dust splits into seven
//                       and every hit charms (confuses).
//  TINY (passive)       a smaller hitbox; many attacks sail over her.
//  OBERON'S WRATH       THORNSTORM (5S) a volley of thorns, ROYAL GALLOP (6S) an armored charge in a wake of petals,
//                       BRIAR THRONE (2S) a cage of thorns, COURT GLAMOUR (4S) heal-over-time and a shield, METEOR BLOOM (jS).
//  MIDWINTER WRATH (form ult)   the court turns on them.      SUMMER COURT & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('titania');
  Object.assign(Sfx, {
    tiSparkle(d = 0) { this.run({ notes: [1568, 1976, 2349, 2794], step: .05, dur: .4, vol: .08, bell: true, delay: d, wet: .9 }); },
    tiPetal(d = 0) { this.nsweep({ f0: 3000, f1: 9000, dur: .3, vol: .12, q: 1.4, delay: d, wet: .6 }); this.tiSparkle(d + .05); },
    tiThorn(d = 0) { this.nsweep({ f0: 2000, f1: 5000, dur: .1, vol: .2, type: 'bandpass', q: 2, delay: d }); this.crackle({ dur: .15, vol: .08, delay: d, lo: 1000, hi: 6000 }); },
    tiCrown(d = 0) { this.chord({ notes: [330, 415, 494, 659], dur: 2.4, vol: .18, type: 'sine', delay: d, wet: .95 }); this.tiSparkle(d + .3); },
    tiGallop(d = 0) { for (let i = 0; i < 6; i++) this.sub({ f: 110, to: 60, dur: .1, vol: .2, delay: d + i * .08 }); this.tiPetal(d); },
    tiWinter(d = 0) { this.voice({ f: 220, to: 55, dur: 1.4, vol: .2, type: 'triangle', lp: 1200, delay: d, wet: .9 }); this.nsweep({ f0: 5000, f1: 300, dur: 1.4, vol: .12, delay: d, wet: .8 }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const t = v.anim || 0; if ((v.gauge || 0) >= 100 || v.transformed) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? 'rgba(255,154,216,.9)' : 'rgba(255,255,255,.9)'; c.fillRect(Math.round(P.hip[0] - 30 + Math.sin(t * 3 + i) * 28), Math.round(P.hip[1] - 20 - ((t * 50 + i * 17) % 100)), 3, 3); } c.restore(); } } });
  const glam = (f, n) => { if (f.enchT > 0) return; f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (f.gauge >= 100) { f.gauge = 0; f.enchT = 5 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'ENCHANTED', '#ff9ad8', 24); sfx('tiCrown'); } };
  Rw2.merge(def, {
    gauge: { name: 'GLAMOUR', max: 100, color: '#ff9ad8', label: f => (f.enchT > 0 ? '· ENCHANTED' : '') },
    passive: ['Tiny', 'Smaller hitbox; many attacks sail over her. Flitting about fills GLAMOUR; at 100 she is ENCHANTED for 5s: seven-way Pixie Dust and charming hits.'],
    onRoundStart: f => { f.gauge = 0; f.enchT = 0; },
    onHit: (a, t) => { if (a.enchT > 0) t.status.confuse = Math.max(t.status.confuse || 0, 1.2); },
    passiveTick: f => { if (f.enchT > 0) f.enchT--; else if (f.st % 6 === 0 && (Math.abs(f.vx || 0) > 120 || f.airborne)) glam(f, 1); },
  });
  Combat.hz.tiCage = function (h) { const f = h.owner; if (!f) return false; const t = h.tgt; if (t && t.state !== 'ko') { for (const s of [-1, 1]) { const wx = h.x + s * 100; if ((t.x - wx) * s > 0) t.x = wx; } if (h.t % 28 === 14 && Math.abs(t.x - h.x) < 110) Combat.resolveHit(t, f, H_({ dmg: 26, guard: 'low', hs: 8, kb: [0, 0], sfx: 'l', status: { slow: .6 } }), { proj: true, fromX: h.x }); } return h.t < h.life; };
  Combat.drawHz.tiCage = (c, h) => { const k = Math.min(1, h.t / 8, (h.life - h.t) / 12); c.save(); c.globalAlpha = k; for (const s of [-1, 1]) for (let j = 0; j < 5; j++) { const x = h.x + s * (92 + j * 4); c.strokeStyle = '#3a7a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x - s * 12, -60, x + s * 4 * (j - 2), -140 + j * 8); c.stroke(); c.fillStyle = '#ff9ad8'; c.beginPath(); c.arc(x + s * 4 * (j - 2), -142 + j * 8, 4, 0, 7); c.fill(); } c.restore(); };
  Combat.hz.tiHeal = function (h) { const f = h.owner; if (!f || f.state === 'ko') return false; if (h.t % 15 === 0) Combat.healSelf(f, 28); return h.t < h.life; };
  Combat.drawHz.tiHeal = (c, h) => { const f = h.owner; if (!f) return; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { const a = h.t * .08 + i * .52; c.fillStyle = i % 2 ? '#ff9ad8' : '#ffffff'; c.fillRect(Math.round((f.x + Math.cos(a) * 40) / 3) * 3, Math.round((f.y - 40 + Math.sin(a) * 16 - (h.t * .6 + i * 5) % 60) / 3) * 3, 4, 4); } c.restore(); };

  PxKit.setMove(def, '5S', Mv.shot({ name: 'Pixie Dust', desc: 'Sparkling homing dust. While ENCHANTED it splits into seven.', proj: { speed: 560, homing: 2, r: 8, dmg: 34, kind: 'orb', color: '#ff9ad8', core: '#fff', life: 2.4 }, ev: { 3: () => sfx('tiSparkle') } }));
  { const m = def.moves['5S'], e = m.ev[12]; m.ev[12] = f => { if (f.enchT > 0) { Combat.fireShots(f, { speed: 560, homing: 2, r: 8, dmg: 28, count: 7, spread: 1.6, kind: 'orb', color: '#ffe0f8', core: '#fff', life: 2.4 }); sfx('tiPetal'); } else e(f); }; }
  const F5 = Mv.shot({ name: 'Thornstorm', desc: "Oberon's Wrath: a volley of thorns in a fan, each leaving a bleeding scratch.", proj: { speed: 1000, r: 9, dmg: 34, count: 7, spread: .8, kind: 'spear', color: '#7aca5a', core: '#ffe0f8', status: { bleed: 2 }, life: 1.1, trail: false }, ev: { 3: () => sfx('tiPetal'), 12: () => sfx('tiThorn') } });
  const F6 = Object.assign(Mv.rush({ name: 'Royal Gallop', desc: "Oberon's Wrath: an armored charge in a wake of petals that cut.", s: 8, speed: 1300, frames: 20, armor: [1, 28], hit: { dmg: 102, kb: [520, -280], wb: true }, ev: { 1: () => sfx('tiGallop') } }), { onStart: f => { f.tiFrom = f.x; } });
  F6.ev[22] = f => { const a = Math.min(f.tiFrom, f.x), b = Math.max(f.tiFrom, f.x); for (let x = a; x <= b; x += 100) Rw2.pool(f, x, { r: 50, life: 2.5, dmg: 10, color: '#ff9ad8', status: { bleed: 1 } }); sfx('tiPetal'); };
  const F2 = mk({ name: 'Briar Throne', desc: "Oberon's Wrath: a cage of living thorns closes around the foe for 3.5s; they cannot walk out.", pose: 'cast_up', s: 16, a: 1, r: 24, cd: 8, ai: { min: 100, max: 900, use: 'zone' }, ev: { 16: f => { const t = f.opp; if (!t) return; Combat.addHazard({ kind: 'tiCage', owner: f, side: f.side, x: clamp(t.x, 130, Arena.stage.width - 130), tgt: t, life: 210 }); sfx('tiThorn'); sfx('tiCrown'); } } });
  const F4 = mk({ name: 'Court Glamour', desc: "Oberon's Wrath: a shield and a heal of 28 every quarter-second for 3s.", pose: 'charge', s: 14, a: 1, r: 18, cd: 10, ai: { min: 400, max: 3000, use: 'heal' }, ev: { 14: f => { Combat.buff(f, { shield: 150 }, 3, 'COURT GLAMOUR'); Combat.addHazard({ kind: 'tiHeal', owner: f, side: f.side, x: f.x, life: 180 }); sfx('tiCrown'); } } });
  const FJ = Mv.dive({ name: 'Meteor Bloom', desc: "Oberon's Wrath: she plummets as a blossom; the landing opens a ring of petals.", vx: 300, vy: 1600, hit: { dmg: 96, gb: true }, ev: { 1: () => sfx('tiPetal') }, onHit: a => { Combat.fireShots(a, { speed: 600, r: 9, dmg: 30, count: 10, spread: 6.28, kind: 'orb', color: '#ff9ad8', core: '#fff', life: .5 }); sfx('tiCrown'); glam(a, 10); } });
  const FU = PxKit.ult({ id: 'titania_fult', name: 'MIDWINTER WRATH', desc: "Oberon's Wrath: the Summer Court turns on its guest. Thorns, frost and a hundred wings. Blockable. Must connect.", pose: 'cast_up', s: 52, dmg: 1280, color: '#ff9ad8',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'MIDWINTER WRATH', dur: 8.4, tc: [1.0, 4.4], tf: 5.2, c1: '#ff9ad8', c2: '#c0f0ff', c3: '#0a1a1a', motif: 'barrage', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Summer is a courtesy.', cap2: 'Winter is the rule.', title: 'MIDWINTER WRATH', sub: 'THE COURT REMEMBERS', size: 96,
      cues: [[0, () => sfx('tiSparkle')], [1.4, () => sfx('tiWinter')], [5.2, () => { sfx('tiThorn'); sfx('tiCrown'); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#04101a', bot: '#2a5a4a', snow: k > .4, fog: 'rgba(192,240,255,0.1)', mount: '#0a2a20', rays: '#c0f0ff', embers: '#ff9ad8' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 52, w: 900, h: 330, back: 300, start: f => { f.say('Bow.', 80); sfx('tiWinter'); }, fire: f => { Rw2.row(f, 8, 110, { from: 'foe', r: 44, life: 6, stagger: 3, color: '#ff9ad8', dmg: 0, shake: 4 }); for (const e of Combat.targets(f.side)) { e.status.slow = 3; e.status.bleed = 4; } Cam.shake = 16; sfx('tiThorn'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: "Permanent. She grows to full size and fights like a queen. New moveset: Thornstorm, Royal Gallop, Briar Throne, Court Glamour, Meteor Bloom, and the ultimate MIDWINTER WRATH." });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'SUMMER COURT', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#ff9ad8', c2: '#fff0a0', c3: '#0a2a14', motif: 'pillar', pose: ['idle', 'cast_up', 'cast', 'victory'], cap1: 'By the power of the Court...', cap2: '...guilty.', title: 'SUMMER COURT', sub: 'THE FOREST JUDGES', size: 96,
    cues: [[0, () => sfx('tiSparkle')], [1.4, () => sfx('tiCrown')], [4.8, () => { sfx('tiPetal'); sfx('tiThorn'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#08241a', bot: '#4aa05a', sun: { x: .5, y: .26, r: 70, col: '#fff0a0' }, mount: '#1a5a2a', rays: '#fff0a0', embers: '#ff9ad8' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: "OBERON'S WRATH", dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#ff9ad8', c2: '#fff0a0', c3: '#0a2a14', motif: 'rise', pose: ['idle', 'cast_up', 'victory'], lift: 40, cap1: 'Small is a courtesy.', cap2: 'I am done being polite.', title: "OBERON'S WRATH", sub: 'TITANIA', size: 96,
    cues: [[0, () => sfx('tiSparkle')], [1.4, () => sfx('tiCrown')], [3.9, () => { sfx('tiPetal'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#08241a', bot: '#3a8a4a', mount: '#1a5a2a', rays: '#fff0a0', embers: '#ff9ad8' }, k) });
})();
