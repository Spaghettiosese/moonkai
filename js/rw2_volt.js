// ============================================================
//  MOONKAI — VOLT, the Living Current. Pixel remake + STORM AVATAR moveset.
//  (KINETIC, Static, Lightning Rod and Overcharge stay as they were.)
//  STORM AVATAR   THUNDERHEAD (5S) a storm cell that arcs bolts at the foe, MACH BREAK (6S) a lightning dash leaving live wire,
//                 TESLA COIL (2S) a coil that zaps anything near it, STATIC FIELD (4S) full charge + shield, SKYBOLT (jS).
//  GOD OF THUNDER (form ult)    bolts across the whole stage.      VERDICT & AWAKENING have new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('volt');
  Object.assign(Sfx, {
    vtCrack(d = 0) { this.nsweep({ f0: 3000, f1: 9000, dur: .12, vol: .26, type: 'bandpass', q: 2, delay: d }); this.crackle({ dur: .18, vol: .14, delay: d, lo: 1000, hi: 8000 }); },
    vtThunder(d = 0, dur = 1.6) { this.nsweep({ f0: 1200, f1: 60, dur, vol: .34, type: 'lowpass', delay: d, wet: .6 }); this.sub({ f: 56, to: 28, dur: dur * .8, vol: .5, delay: d + .05 }); this.rumble && this.rumble(dur, .3, d); },
    vtWhine(d = 0, dur = 1.2) { this.voice({ f: 300, to: 3200, dur, vol: .12, type: 'sawtooth', lp: 5000, delay: d, wet: .3 }); this.crackle({ dur, vol: .06, delay: d, lo: 600, hi: 6000 }); },
    vtStep(d = 0) { this.nsweep({ f0: 8000, f1: 600, dur: .1, vol: .2, type: 'highpass', delay: d }); this.vtCrack(d); },
    vtCoil(d = 0) { this.fm({ f: 90, ratio: 7, index: 300, dur: .3, vol: .12, delay: d, wet: .2 }); this.vtCrack(d); },
  });
  PxKit.pixelize(def, { win: [-210, -340, 470, 400] });
  const zap = (f, x, big) => { Combat.addHazard({ kind: 'vtZap', owner: f, side: f.side, x1: x + rand(-40, 40), y1: -700, x2: x, y2: 0, life: 8, big: !!big }); };

  Combat.hz.vtCell = function (h) {
    const f = h.owner; if (!f || f.state === 'ko') return false; h.x += h.dir * 1.6;
    if (h.t % 18 === 9) { const t = Combat.targets(f.side)[0]; if (t && Math.abs(t.x - h.x) < 520) { zap(f, t.x, false); Combat.resolveHit(t, f, H_({ dmg: 30, guard: 'mid', hs: 10, stun: .2, kb: [0, -60], sfx: 'm' }), { proj: true, fromX: h.x }); sfx('vtCrack'); } }
    return h.t < h.life;
  };
  Combat.drawHz.vtCell = (c, h) => { const k = Math.min(1, h.t / 14, (h.life - h.t) / 14); c.save(); c.globalAlpha = k; c.fillStyle = '#2a3050'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(h.x + (i - 2) * 26, -230 + (i % 2) * 14, 40, 22, 0, 0, 7); c.fill(); } c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -224, 90, 'rgba(190,240,255,0.5)', 'rgba(0,0,0,0)'); c.restore(); };
  Combat.hz.vtCoil = function (h) { const f = h.owner; if (!f || f.state === 'ko') return false; if (h.t % 24 === 12) for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < 230) { Combat.addHazard({ kind: 'vtZap', owner: f, side: f.side, x1: h.x, y1: -150, x2: t.x, y2: t.y - 60, life: 6 }); Combat.resolveHit(t, f, H_({ dmg: 34, guard: 'mid', hs: 10, stun: .25, kb: [Math.sign(t.x - h.x) * 160, -90], sfx: 'm' }), { proj: true, fromX: h.x }); sfx('vtCoil'); } return h.t < h.life; };
  Combat.drawHz.vtCoil = (c, h) => { c.save(); c.fillStyle = '#556'; c.fillRect(h.x - 6, -90, 12, 90); c.fillStyle = '#9aa'; for (let i = 0; i < 4; i++) c.fillRect(h.x - 14 + i * 2, -96 - i * 12, 28 - i * 4, 8); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -150, 26 + Math.sin(h.t * .6) * 5, 'rgba(190,240,255,0.9)', 'rgba(0,0,0,0)'); c.restore(); };

  const F5 = mk({ name: 'Thunderhead', desc: 'Storm Avatar: a storm cell drifts across the stage and arcs a bolt at the foe every third of a second.', pose: 'cast_up', s: 14, a: 1, r: 20, cd: 5, ai: { min: 150, max: 1400, use: 'zone' }, ev: { 3: () => sfx('vtWhine'), 14: f => { Combat.addHazard({ kind: 'vtCell', owner: f, side: f.side, x: f.x + f.facing * 160, dir: f.facing, life: 150 }); sfx('vtThunder', 0, 1.2); } } });
  const F6 = Object.assign(Mv.rush({ name: 'Mach Break', desc: 'Storm Avatar: crosses the stage at the speed of light, leaving a live wire along the whole path.', s: 4, speed: 2000, frames: 18, pass: true, inv: [1, 22], hit: { dmg: 60, multi: 2, every: 6, kb: [120, -380] }, ev: { 1: () => sfx('vtStep'), 12: () => sfx('vtStep') } }),
    { onStart: f => { f.vtFrom = f.x; vtKin(f, 20); } });
  { const ev = F6.ev, prev = ev[22]; ev[22] = f => { prev && prev(f); Combat.addHazard({ kind: 'vtWire', owner: f, side: f.side, x1: Math.min(f.vtFrom, f.x), x2: Math.max(f.vtFrom, f.x), life: 120 }); }; F6.a = 22; }
  const F2 = mk({ name: 'Tesla Coil', desc: 'Storm Avatar: plants a coil that zaps anyone within 230 for 5s.', pose: 'slam', s: 12, a: 1, r: 18, cd: 4, ai: { min: 0, max: 1200, use: 'trap' }, ev: { 12: f => { Combat.hazards.filter(h => h.kind === 'vtCoil' && h.owner === f).forEach(h => h.life = 0); Combat.addHazard({ kind: 'vtCoil', owner: f, side: f.side, x: f.x + f.facing * 90, life: 300 }); sfx('vtCoil'); } } });
  const F4 = Mv.buff({ name: 'Static Field', desc: 'Storm Avatar: charges to full and wraps him in a shield for 4s.', effects: { shield: 180, haste: 1 }, dur: 4, name2: 'STATIC FIELD', ev: { 3: () => sfx('vtWhine', 0, .6) }, onStart: f => { f.gauge = 100; } });
  const FJ = Mv.dive({ name: 'Skybolt', desc: 'Storm Avatar: becomes a bolt, striking the ground in a crackling burst.', vx: 400, vy: 1900, hit: { dmg: 92, stun: .3, gb: true }, ev: { 1: () => sfx('vtStep') }, onHit: a => { for (const s of [-1, 1]) Combat.addHazard({ kind: 'vtZap', owner: a, side: a.side, x1: a.x, y1: -4, x2: a.x + s * 220, y2: -4, life: 8 }); sfx('vtThunder', 0, .8); } });
  const FU = PxKit.ult({ id: 'volt_fult', name: 'GOD OF THUNDER', desc: 'Storm Avatar: the sky answers. A wall of bolts marches across the whole stage. Blockable. Must connect.', pose: 'cast_up', s: 46, dmg: 1280, color: '#bff4ff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'GOD OF THUNDER', dur: 8.0, tc: [1.0, 4.4], tf: 5.0, c1: '#9fe8ff', c2: '#ffffff', c3: '#0a0a3a', motif: 'barrage', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Twelve times it struck me.', cap2: 'Now I strike back.', title: 'GOD OF THUNDER', sub: 'THE SKY ANSWERS', size: 100, flash: '#eafcff',
      cues: [[0, () => sfx('vtWhine', 0, 2.4)], [1.6, () => sfx('vtThunder')], [5.0, () => { sfx('vtThunder', 0, 2); sfx('vtCrack'); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#02021a', bot: '#1c2a6a', clouds: '#1a2050', rain: '#bfe8ff' }, k); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 46, w: 1100, h: 340, back: 200, start: f => { f.say('KNEEL.', 80); sfx('vtWhine', 0, 1.6); }, fire: f => { for (let i = 0; i < 9; i++) Game.later(i * .06, () => { const x = clamp(f.x + f.facing * (80 + i * 130), 30, Arena.stage.width - 30); zap(f, x, true); Combat.explode(x, -70, 60, f, 0, '#bff4ff'); }); Cam.shake = 20; sfx('vtThunder', 0, 2); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Faster, hits can stun, KINETIC never below 50. New moveset: Thunderhead, Mach Break, Tesla Coil, Static Field, Skybolt, and the ultimate GOD OF THUNDER.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: "THUNDER GOD'S VERDICT", dur: 7.4, tc: [1.0, 3.6], tf: 4.4, c1: '#ffe95a', c2: '#ffffff', c3: '#101040', motif: 'rush', pose: ['idle', 'charge', 'dash', 'victory'], cap1: 'Twelve times it struck me.', cap2: 'Judgement is instant.', title: "THUNDER GOD'S VERDICT", sub: 'GUILTY', size: 88,
    cues: [[0, () => sfx('vtWhine', 0, 2.4)], [4.4, () => { sfx('vtStep'); sfx('vtThunder'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#050520', bot: '#2a2a78', city: '#0c0c30', lit: .7, rain: '#bfe8ff', rays: '#ffe95a' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'STORM AVATAR', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#bff4ff', c2: '#ffe95a', c3: '#0a0a3a', motif: 'converge', pose: ['idle', 'charge', 'victory'], lift: 50, bolts: true, shape: 'rect', cap1: 'Every storm began as a spark.', cap2: 'Mine learned to run.', title: 'STORM AVATAR', sub: 'THE LIVING CURRENT', size: 96,
    cues: [[0, () => sfx('vtWhine', 0, 2.6)], [3.7, () => { sfx('vtThunder', 0, 1.8); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02021a', bot: '#222a78', clouds: '#1a2050', rain: '#bfe8ff' }, k) });
})();
