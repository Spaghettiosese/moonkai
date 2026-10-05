// ============================================================
//  MOONKAI — ONYX, the Weight of Worlds. Pixel remake + a real kit.
//
//  WEIGHT (mark on the foe, max 5)   every gravity hit adds one. Each stack slows them and cuts their jump. At 5 they are CRUSHED
//                                     to the floor, stunned for 0.8s, and the marks clear.
//  ORBIT STONE (4S)  three stones circle him (3s) and strike anything close.   GRAVITY WELL (5S) now adds WEIGHT.
//  SINGULARITY KNIGHT  BLACK STAR (5S) a slow star that grows as it travels,  CRUSHING CAVALRY (6S) armored and tramples,
//                      GRAVITY PRESS (2S) a zone that holds the foe down,  ORBIT RING (4S) six stones, a shield and a weapon,  METEOR STRIKE (jS).
//  PLANETFALL (form ult)   a whole moon comes down.     PLANET CRUSHER & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('onyx');
  Object.assign(Sfx, {
    onHum(d = 0, dur = 1.6) { this.voice({ f: 46, to: 40, dur, vol: .34, type: 'sine', delay: d, wet: .5 }); this.voice({ f: 92, to: 80, dur, vol: .12, type: 'triangle', n: 3, det: 20, delay: d, swell: true, wet: .6 }); },
    onCrush(d = 0) { this.sub({ f: 90, to: 22, dur: .7, vol: .55, delay: d }); this.impact(1, d + .02); this.nsweep({ f0: 800, f1: 60, dur: .5, vol: .2, type: 'lowpass', delay: d }); },
    onStone(d = 0) { this.fm({ f: 240, ratio: 1.6, index: 100, dur: .3, vol: .14, delay: d, wet: .5 }); },
    onFall(d = 0, dur = 2.2) { this.riser(dur, .28, d, 60, 800); this.sub({ f: 48, to: 22, dur: 1.2, vol: .5, delay: d + dur }); this.impact(1, d + dur); },
    onPulse(d = 0) { this.sub({ f: 70, to: 36, dur: .4, vol: .32, delay: d }); this.nsweep({ f0: 3000, f1: 100, dur: .35, vol: .14, type: 'lowpass', delay: d, wet: .4 }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const t = v.anim || 0; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const a = t * 2.4 + i * 2.094; c.fillStyle = i % 2 ? 'rgba(138,122,255,.9)' : 'rgba(210,200,255,.9)'; c.fillRect(Math.round(P.sh[0] + Math.cos(a) * 54), Math.round(P.sh[1] + 20 + Math.sin(a) * 18), 6, 6); } c.restore(); } });
  const weigh = (a, t, n = 1) => { if (!t || t.state === 'ko') return; Combat.mark(t, a, 'weight', n, { max: 5, dur: 8, color: '#8a7aff', label: 'WEIGHT', onMax: tt => { delete tt.marks.weight; tt.vy = 1200; tt.status.stun = .8; tt.move = null; Game.popWorld(tt.x, tt.y - tt.h - 40, 'CRUSHED', '#8a7aff', 26); sfx('onCrush'); Cam.shake = 10; } }); if (t.status) t.status.slow = Math.max(t.status.slow || 0, .3 + (Combat.markCount(t, 'weight') || 0) * .15); };
  Rw2.merge(def, { passive: ['Weight', 'Each gravity hit adds WEIGHT to the foe (max 5): slower, lower jumps. At 5 they are CRUSHED to the floor and stunned.'], onHit: (a, t) => { if (a.move && (a.move.kind === 'special')) weigh(a, t); } });
  Combat.hz.onStones = function (h) {
    const f = h.owner; if (!f || f.state === 'ko') return false; h.x = f.x;
    if (h.t % 18 === 9) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 150 && e.y > -200) { Combat.resolveHit(e, f, H_({ dmg: h.dmg || 24, guard: 'mid', hs: 10, kb: [Math.sign(e.x - h.x || 1) * 160, -120], sfx: 'm' }), { proj: true, fromX: h.x }); weigh(f, e); sfx('onStone'); }
    for (const p of Combat.projectiles) if (p.side !== f.side && Math.hypot(p.x - h.x, p.y + 90) < 70) p.life = 0;
    return h.t < h.life;
  };
  Combat.drawHz.onStones = (c, h) => { const n = h.n || 3, k = Math.min(1, h.t / 10, (h.life - h.t) / 14); c.save(); c.globalAlpha = k; for (let i = 0; i < n; i++) { const a = h.t * .09 + i * 6.283 / n, x = h.x + Math.cos(a) * 80, y = -90 + Math.sin(a) * 26; c.fillStyle = '#2a2a3a'; c.strokeStyle = '#8a7aff'; c.lineWidth = 2; c.beginPath(); for (let j = 0; j < 6; j++) { const aa = j * 1.05 + a, r = 12 + (j % 2) * 3; c.lineTo(x + Math.cos(aa) * r, y + Math.sin(aa) * r); } c.closePath(); c.fill(); c.stroke(); } c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(138,122,255,.3)'; c.beginPath(); c.ellipse(h.x, -90, 80, 26, 0, 0, 7); c.stroke(); c.restore(); };
  Combat.hz.onPress = function (h) { const f = h.owner; if (!f) return false; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r) { e.status.slow = Math.max(e.status.slow || 0, .4); if (e.airborne) e.vy = Math.max(e.vy, 700); if (h.t % 30 === 15) { Combat.resolveHit(e, f, H_({ dmg: 28, guard: 'low', hs: 8, kb: [0, 0], sfx: 'm' }), { proj: true, fromX: h.x }); weigh(f, e); } } return h.t < h.life; };
  Combat.drawHz.onPress = (c, h) => { const k = Math.min(1, h.t / 14, (h.life - h.t) / 20); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = k; for (let r = 0; r < 4; r++) { c.strokeStyle = `rgba(138,122,255,${.5 - r * .1})`; c.lineWidth = 3; const y = -20 - ((h.t * 4 + r * 70) % 260); c.beginPath(); c.ellipse(h.x, y, h.r * (1 - (-y) / 360), h.r * .12, 0, 0, 7); c.stroke(); } glowCircle(c, h.x, -4, h.r, 'rgba(138,122,255,0.22)', 'rgba(0,0,0,0)'); c.restore(); };

  PxKit.setMove(def, '4S', mk({ name: 'Orbit Stone', desc: 'Three stones circle him for 3s, striking anything near and eating projectiles. Each strike adds WEIGHT.', pose: 'cast', s: 12, a: 1, r: 18, cd: 4, ai: { min: 0, max: 500, use: 'buff' }, ev: { 12: f => { Combat.hazards.filter(h => h.kind === 'onStones' && h.owner === f).forEach(h => h.life = 0); Combat.addHazard({ kind: 'onStones', owner: f, side: f.side, x: f.x, life: 180, n: 3 }); sfx('onHum', 0, 1); } } }));
  const F5 = Mv.shot({ name: 'Black Star', desc: 'Singularity Knight: a slow star of dark that grows as it travels and adds 2 WEIGHT.', proj: { speed: 360, r: 20, grow: 1.4, dmg: 78, kind: 'orb', color: '#8a7aff', core: '#06060f', pierce: true, life: 3, hs: 26, kb: [140, -120], onHit: (t, p) => weigh(p.owner, t, 2) }, ev: { 3: () => sfx('onHum', 0, .8), 14: () => sfx('onPulse') } });
  const F6 = Mv.rush({ name: 'Crushing Cavalry', desc: 'Singularity Knight: an armored trampling charge that adds WEIGHT with each hit.', s: 10, speed: 1100, frames: 24, armor: [1, 34], hit: { dmg: 40, multi: 3, every: 8, kb: [200, -100], hs: 16 }, ev: { 1: () => sfx('onPulse') }, onHit: (a, t) => weigh(a, t) });
  const F2 = mk({ name: 'Gravity Press', desc: 'Singularity Knight: a column of heavy air under the foe for 4s: slow, held to the floor, and weighed down.', pose: 'cast_up', s: 18, a: 1, r: 24, cd: 7, ai: { min: 100, max: 1200, use: 'zone' }, ev: { 18: f => { const t = f.opp; if (!t) return; Combat.addHazard({ kind: 'onPress', owner: f, side: f.side, x: clamp(t.x, 80, Arena.stage.width - 80), r: 200, life: 240 }); sfx('onCrush'); } } });
  const F4 = mk({ name: 'Orbit Ring', desc: 'Singularity Knight: six stones in a ring for 5s: a shield and a weapon at once.', pose: 'cast', s: 14, a: 1, r: 20, cd: 8, ai: { min: 0, max: 500, use: 'buff' }, ev: { 14: f => { Combat.hazards.filter(h => h.kind === 'onStones' && h.owner === f).forEach(h => h.life = 0); Combat.addHazard({ kind: 'onStones', owner: f, side: f.side, x: f.x, life: 300, n: 6, dmg: 34 }); Combat.buff(f, { shield: 160 }, 5, 'ORBIT RING'); sfx('onHum', 0, 1.4); } } });
  const FJ = Mv.dive({ name: 'Meteor Strike', desc: 'Singularity Knight: drops like a falling star; the landing adds 2 WEIGHT to anyone near.', vx: 300, vy: 1800, hit: { dmg: 112, gb: true }, ev: { 1: () => sfx('onPulse') }, onHit: (a, t) => { weigh(a, t, 2); Combat.explode(a.x, -20, 110, a, 30, '#8a7aff'); sfx('onCrush'); } });
  const FU = PxKit.ult({ id: 'onyx_fult', name: 'PLANETFALL', desc: 'Singularity Knight: he calls down a whole moon. The foe, and the ground under them, give way. Blockable. Must connect.', pose: 'cast_up', s: 58, dmg: 1320, color: '#8a7aff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'PLANETFALL', dur: 8.8, tc: [1.0, 4.8], tf: 5.6, c1: '#8a7aff', c2: '#ffffff', c3: '#06060f', motif: 'meteor', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Every world is a weight.', cap2: 'I have been holding this one.', title: 'PLANETFALL', sub: 'IT LANDS', size: 106,
      cues: [[0, () => sfx('onHum', 0, 3)], [1.4, () => sfx('onFall', 0, 3.4)], [5.6, () => { sfx('onCrush'); sfx('onCrush', .3); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#02020a', bot: '#1e1a4a', stars: '#c8c0ff', moon: { x: .5, y: .22 + .2 * k, r: 80 + k * 200, col: '#4a4a6a' }, mount: '#0a0a1a' }, k) }) });
  FU.ev = PxKit.trackEv(FU, { at: 58, r: 150, color: '#8a7aff', start: f => { f.say('Fall.', 80); sfx('onFall', 0, 2); }, fire: (f, x) => { for (const e of Combat.targets(f.side)) if (Math.abs(e.x - x) < 300) { weigh(f, e, 5); } Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x, r: 150, life: 40, color: '#8a7aff', giant: true }); Cam.shake = 26; sfx('onCrush'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Super armor, gravity aura. New moveset: Black Star, Crushing Cavalry, Gravity Press, Orbit Ring, Meteor Strike, and the ultimate PLANETFALL.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'PLANET CRUSHER', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#8a7aff', c2: '#ffffff', c3: '#06060f', motif: 'meteor', pose: ['idle', 'cast_up', 'cast_up', 'victory'], cap1: 'Heavy is a choice.', cap2: 'Choose it.', title: 'PLANET CRUSHER', sub: 'ORBITAL', size: 96,
    cues: [[0, () => sfx('onHum', 0, 2.4)], [1.2, () => sfx('onFall', 0, 2.6)], [4.8, () => { sfx('onCrush'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02020a', bot: '#1a1646', stars: '#c8c0ff', sun: { x: .5, y: .2 + .1 * k, r: 50 + k * 110, col: '#5a4aff' }, city: '#0a0a18', lit: .3 }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'SINGULARITY KNIGHT', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#8a7aff', c2: '#ffffff', c3: '#06060f', motif: 'implode', pose: ['idle', 'cast_up', 'victory'], lift: 20, cap1: 'Gravity is not a force.', cap2: 'It is a verdict.', title: 'SINGULARITY KNIGHT', sub: 'ONYX', size: 92,
    cues: [[0, () => sfx('onHum', 0, 3)], [1.4, () => sfx('onPulse')], [3.9, () => { sfx('onCrush'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02020a', bot: '#1a1646', stars: '#c8c0ff', rays: '#8a7aff' }, k) });
})();
