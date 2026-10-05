// ============================================================
//  MOONKAI — VEX, Architect of Nothing. Pixel remake + VOID WRAITH moveset.
//
//  (Singularities, Entropy and Heat Death stay as they were: ↓I seeds, →I steps through, ←I collapses.)
//  COLLAPSE (4S)     now draws every singularity in first (a short implosion) before it detonates.
//  VOID WRAITH       permanent. GRAVITY LANCE (5S) a piercing lance that drags the foe along it, RIFT WALK (6S) steps
//                    through every singularity, slashing at each, DARK STAR (2S) a huge slow star that crushes and
//                    persists 8s, SPAGHETTIFY (4S) hauls the foe to him, WELL DROP (jS) comes down as a singularity.
//  HEAT DEATH OF THE UNIVERSE (form ult)   the stage folds into the dark.     EVENT HORIZON (ult)  a new cinematic.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('vex');
  Object.assign(Sfx, {
    vxHum(d = 0, dur = 1.6) { this.voice({ f: 55, to: 48, dur, vol: .3, type: 'sine', delay: d, wet: .5 }); this.voice({ f: 110, to: 96, dur, vol: .12, type: 'triangle', n: 3, det: 30, delay: d, swell: true, wet: .6 }); },
    vxPull(d = 0, dur = .7) { this.suck ? this.suck(dur, .26, d) : this.nsweep({ f0: 4000, f1: 120, dur, vol: .24, type: 'lowpass', delay: d, wet: .4 }); this.sub({ f: 70, to: 30, dur: dur, vol: .3, delay: d }); },
    vxImplode(d = 0) { this.nsweep({ f0: 6000, f1: 80, dur: .45, vol: .26, type: 'lowpass', delay: d, wet: .5 }); this.sub({ f: 120, to: 24, dur: .5, vol: .45, delay: d + .2 }); this.impact(.95, d + .45); },
    vxTear(d = 0) { this.crackle({ dur: .35, vol: .12, delay: d, lo: 600, hi: 6000 }); this.fm({ f: 300, ratio: 1.41, index: 260, dur: .3, vol: .12, delay: d, wet: .4 }); },
    vxLance(d = 0) { this.nsweep({ f0: 200, f1: 3200, dur: .3, vol: .22, q: 3, delay: d, wet: .3 }); this.fm({ f: 140, ratio: 3, index: 180, dur: .4, vol: .14, delay: d, wet: .4 }); },
    vxStar(d = 0) { this.vxHum(d, 2.4); this.riser(1.2, .2, d, 60, 500); },
  });
  PxKit.pixelize(def, { win: [-310, -350, 620, 410] });

  // ---- hazards: a heavier singularity that can be a Dark Star, and an implosion ring ----
  const hzSing = Combat.hz.vexSing, drSing = Combat.drawHz.vexSing;
  Combat.hz.vexSing = function (h) {
    const f = h.owner; if (!f || f.state === 'ko') return false;
    if (h.dark) for (const o of this.targets(h.side)) { const d = h.x - o.x; if (Math.abs(d) < h.r && o.y > -h.r) { o.x += Math.sign(d) * Math.min(Math.abs(d), 6.5); if (h.t % 10 === 0 && Math.abs(d) < 90) Combat.resolveHit(o, f, H_({ dmg: 26, guard: 'mid', hs: 10, kb: [0, -60], sfx: 'l', status: { slow: 1 } }), { proj: true, fromX: h.x }); } }
    return hzSing.call(this, h);
  };
  Combat.drawHz.vexSing = function (c, h, t) {
    if (!h.dark) return drSing.call(this, c, h, t);
    const k = Math.min(1, h.t / 20, (h.life - h.t) / 24), R = 62 * k;
    c.save(); c.globalCompositeOperation = 'lighter'; for (let r = 0; r < 3; r++) { c.strokeStyle = `rgba(190,110,255,${.4 - r * .1})`; c.lineWidth = 4 - r; c.beginPath(); c.ellipse(h.x, -118, R * (1.5 + r * .5), R * (.34 + r * .1), -.25, 0, 7); c.stroke(); }
    for (let i = 0; i < 18; i++) { const a = i * .35 + t * 2.4, rr = R * (1.6 + (i % 4) * .4); c.fillStyle = i % 2 ? '#d8a0ff' : '#ffffff'; c.fillRect(Math.round((h.x + Math.cos(a) * rr * 1.2) / 3) * 3, Math.round((-118 + Math.sin(a) * rr * .3) / 3) * 3, 6, 3); } c.restore();
    drawBlackHole(c, h.x, -118, R, t);
  };
  Combat.hz.vexRing = h => h.t < h.life;
  Combat.drawHz.vexRing = (c, h) => { const k = h.t / h.life, R = h.r * (1 - k); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(190,110,255,${k})`; c.lineWidth = 6 * k + 1; c.beginPath(); c.ellipse(h.x, -90, R, R * .5, 0, 0, 7); c.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; c.fillStyle = '#ffffff'; c.fillRect(Math.round((h.x + Math.cos(a) * R) / 3) * 3, Math.round((-90 + Math.sin(a) * R * .5) / 3) * 3, 6, 3); } c.restore(); };

  // ---- COLLAPSE: pull every singularity in first ----
  PxKit.setMove(def, '4S', mk({ name: 'Collapse', desc: 'Pulls every singularity inward, then detonates each: whoever is caught is launched.', pose: 'cast_up', s: 22, a: 1, r: 22, ai: { min: 0, max: 1600, use: 'trap' },
    ev: { 4: f => { const s = vxSings(f); if (!s.length) { Game.popWorld(f.x, f.y - f.h - 30, 'NOTHING TO COLLAPSE', '#aab', 16); return; } for (const h of s) Combat.addHazard({ kind: 'vexRing', owner: f, side: f.side, x: h.x, r: h.r * .8, life: 18 }); sfx('vxImplode'); },
      22: f => { const s = vxSings(f); for (const h of s) { vxCollapse(f, h, f.form ? 110 : 90); h.life = 0; } } } }));

  // ---- VOID WRAITH moveset ----
  const F5 = Mv.shot({ name: 'Gravity Lance', desc: 'Void Wraith: a piercing lance of dark that drags the foe along with it.', proj: { speed: 1300, r: 16, dmg: 56, kind: 'spear', color: '#b36bff', core: '#1a0026', pierce: true, hs: 20, kb: [-420, -40] }, ev: { 3: () => sfx('vxTear'), 12: () => sfx('vxLance') } });
  const F6 = mk({ name: 'Rift Walk', desc: 'Void Wraith: steps through each of his singularities in turn, slashing at every one.', pose: 'heavy', s: 6, a: 30, r: 18, inv: [1, 36], ai: { min: 100, max: 1200, use: 'approach' },
    ev: Object.fromEntries([6, 15, 24, 33].map((fr, i) => [fr, f => { const s = vxSings(f), h = s[i % Math.max(1, s.length)], t = f.opp; if (h) { f.x = h.x; f.y = 0; } else if (t) f.x = t.x - f.facing * 70; f.faceOpp(); Game.fx.burst(f.x, -80, 16, { color: ['#b36bff', '#000'], size: 8, speed: 260, life: .4 }); sfx('vxTear'); Combat.strikeZone(f, { x: f.x - 70, y: -130, w: 140, h: 130 }, { dmg: 38 + (i === 3 ? 40 : 0), guard: 'mid', hs: 14, kb: i === 3 ? [400, -520] : [60, -20], launch: i === 3, sfx: i === 3 ? 'h' : 'l' }, { move: F6 }); }])) });
  const F2 = mk({ name: 'Dark Star', desc: 'Void Wraith: a huge, slow star seeded under the foe. It crushes and drags for 8s.', pose: 'cast_up', s: 22, a: 1, r: 24, cd: 7, ai: { min: 100, max: 1200, use: 'zone' },
    ev: { 22: f => { const t = f.opp; if (!t) return; Combat.addHazard({ kind: 'vexSing', owner: f, side: f.side, x: clamp(t.x, 80, Arena.stage.width - 80), r: 300, life: 8 * FPS, dark: true }); sfx('vxStar'); Cam.shake = 8; } } });
  const F4 = mk({ name: 'Spaghettify', desc: 'Void Wraith: reels the foe in across the stage and wrings them out.', pose: 'cast', s: 16, a: 2, r: 26, ai: { min: 150, max: 700, use: 'zone' },
    ev: { 4: () => sfx('vxPull'), 16: f => { const t = f.opp; if (!t || Math.abs(t.x - f.x) > 760 || t.y < -200) return; t.x = f.x + f.facing * 80; Combat.resolveHit(t, f, H_({ dmg: 96, guard: 'mid', hs: 28, kb: [380, -480], launch: true, sfx: 'h', status: { weaken: 3 } }), { proj: true, fromX: f.x }); vxEntropy(f, 16); Game.fx.burst(t.x, t.y - 60, 24, { color: ['#b36bff', '#000'], size: 9, speed: 320, life: .5 }); sfx('vxImplode'); Cam.shake = 10; } } });
  const FJ = mk({ name: 'Well Drop', desc: 'Void Wraith: plunges, and lands as a singularity that detonates.', pose: 'air_spike', air: true, airOnly: true, s: 8, a: 30, r: 10, landEnd: true, vel: [[8, 38, 360, 1300]], hit: { dmg: 86, box: [0, -60, 70, 70], gb: true, guard: 'high', kb: [200, 800], hs: 24 },
    onHit: (a, t) => { Combat.addHazard({ kind: 'vexSing', owner: a, side: a.side, x: t.x, r: 200, life: 4 * FPS }); sfx('vxImplode'); }, ai: { min: 0, max: 400, use: 'approach' }, ev: { 1: () => sfx('vxTear') } });
  const FU = PxKit.ult({ id: 'vex_fult', name: 'HEAT DEATH OF THE UNIVERSE', desc: 'Void Wraith: every singularity feeds a single star; the stage folds into it. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1280, color: '#b36bff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'HEAT DEATH OF THE UNIVERSE', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#b36bff', c2: '#ffffff', c3: '#0a0016', motif: 'rift', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Entropy always wins.', cap2: 'Everything returns to nothing.', title: 'HEAT DEATH', sub: 'NOTHING REMAINS', size: 104,
      cues: [[0, () => sfx('vxHum', 0, 3)], [1.4, () => sfx('vxPull', 0, 2.4)], [5.4, () => { sfx('vxImplode'); sfx('boom'); }], [5.5, () => sfx('vxTear')]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#030008', bot: '#1c0838', stars: '#d8a0ff' }, k); x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const an = i * 2.4 + t * 1.6, R = (700 - ((t * 260 + i * 70) % 700)) * (1 - .3 * k); x.fillStyle = i % 2 ? 'rgba(200,140,255,0.8)' : 'rgba(255,255,255,0.8)'; x.fillRect(W * .5 + Math.cos(an) * R * 1.4, H * .34 + Math.sin(an) * R * .5, 8, 3); } x.restore(); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 54, w: 980, h: 340, back: 400, start: f => { f.say('Be undone.', 90); sfx('vxStar'); }, fire: f => { for (const o of Combat.targets(f.side)) Combat.addHazard({ kind: 'vexSing', owner: f, side: f.side, x: o.x, r: 260, life: 60, dark: true }); Cam.shake = 22; sfx('vxImplode'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. 3 singularities, lifesteal, resistance. New moveset: Gravity Lance, Rift Walk, Dark Star, Spaghettify, Well Drop, and the ultimate HEAT DEATH OF THE UNIVERSE.' });

  // ---- EVENT HORIZON (base ult) + the awakening ----
  const U = def.ult;
  U.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'EVENT HORIZON', dur: 7.6, tc: [1.0, 4.0], tf: 4.8, c1: '#b36bff', c2: '#f0e0ff', c3: '#0a0016', motif: 'pillar', pose: ['idle', 'cast_up', 'cast_up', 'victory'], cap1: 'Light is a habit. Break it.', cap2: 'Past this line, nothing returns.', title: 'EVENT HORIZON', sub: 'NO RETURN', size: 100,
    cues: [[0, () => sfx('vxHum', 0, 2.4)], [1.2, () => sfx('vxPull')], [4.8, () => { sfx('vxImplode'); sfx('boom'); }]],
    bg: (x, t, k) => { PxKit.sky(x, t, { top: '#04000c', bot: '#2a0c48', stars: '#d8a0ff' }, k); drawBlackHole(x, W * .72, H * .3, 30 + k * 150, t); } });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'VOID WRAITH', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#b36bff', c2: '#ffffff', c3: '#14002a', motif: 'implode', pose: ['idle', 'cast_up', 'victory'], lift: 40, cap1: 'I was always the hole in the story.', cap2: 'Now I widen it.', title: 'VOID WRAITH', sub: 'ARCHITECT OF NOTHING', size: 96, bolts: false,
    cues: [[0, () => sfx('vxHum', 0, 3)], [1.4, () => sfx('vxPull', 0, 2.2)], [3.9, () => { sfx('vxImplode'); sfx('boom'); }]],
    bg: (x, t, k, burst) => { PxKit.sky(x, t, { top: '#04000c', bot: '#26083e', stars: '#d8a0ff' }, k); drawBlackHole(x, W * .5, H * .26, 26 + k * 90 + (burst > 0 ? 80 : 0), t); } });
})();
