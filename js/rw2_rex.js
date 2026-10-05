// ============================================================
//  MOONKAI — REX, the Tyrant. Pixel remake + TYRANT KING moveset.
//  (HUNGER, Apex Predator, Primal Hunt and Extinction Event stay as they were.)
//  TYRANT KING   TYRANT'S ROAR (5S) erases projectiles and stuns, RAMPAGE (6S) three charges in a row, DEATH ROLL (2S) a faster,
//                bigger bite-grab, TAIL CYCLONE (4S) a spin that hits both sides, METEOR BELLY (jS).
//  MASS EXTINCTION (form ult)   a whole sky of asteroids.      EXTINCTION EVENT & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('rex');
  Object.assign(Sfx, {
    rxRoar(d = 0, dur = 1.8) { this.voice({ f: 95, to: 48, dur, vol: .38, type: 'sawtooth', lp: 900, n: 4, det: 28, delay: d, wet: .4 }); this.nsweep({ f0: 400, f1: 2200, dur: dur * .5, vol: .16, q: 1.5, delay: d, wet: .3 }); this.sub({ f: 60, to: 26, dur: dur * .7, vol: .44, delay: d }); },
    rxStomp(d = 0) { this.sub({ f: 80, to: 30, dur: .45, vol: .55, delay: d }); this.impact(.9, d); },
    rxChomp(d = 0) { this.nsweep({ f0: 1400, f1: 200, dur: .14, vol: .26, type: 'bandpass', q: 2, delay: d }); this.impact(.7, d + .08); this.fm({ f: 110, ratio: 2.1, index: 160, dur: .2, vol: .1, delay: d }); },
    rxWhip(d = 0) { this.nsweep({ f0: 600, f1: 4000, dur: .2, vol: .22, delay: d }); this.sub({ f: 100, to: 50, dur: .2, vol: .2, delay: d }); },
    rxFall(d = 0, dur = 2.4) { this.riser(dur, .3, d, 60, 1200); this.sub({ f: 44, to: 20, dur: 1.4, vol: .55, delay: d + dur }); this.impact(1, d + dur); },
  });
  PxKit.pixelize(def, { win: [-320, -400, 700, 470] });
  Combat.hz.rxRock = function (h) { const f = h.owner; if (!f) return false; h.y = (h.y || -700) + 40; if (h.y >= 0 && !h.done) { h.done = true; Combat.explode(h.x, -20, 110, f, 70, '#ffb040'); Cam.shake = 12; sfx('rxStomp'); } return h.t < h.life; };
  Combat.drawHz.rxRock = (c, h) => { if (h.done) return; c.save(); c.translate(h.x, h.y); c.fillStyle = '#5a3a28'; c.strokeStyle = '#ffb040'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, r = 24 + (i % 2) * 8; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -30, 60, 'rgba(255,160,40,.5)', 'rgba(0,0,0,0)'); c.restore(); };
  Combat.hz.rxCyclone = function (h) { const f = h.owner; if (!f || f.state === 'ko') return false; h.x = f.x; if (h.t % 10 === 3) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 230 && e.y > -140) Combat.resolveHit(e, f, H_({ dmg: 34, guard: 'mid', hs: 10, kb: [Math.sign(e.x - h.x || 1) * 160, -100], sfx: 'm' }), { proj: true, fromX: h.x }); return h.t < h.life; };
  Combat.drawHz.rxCyclone = (c, h) => { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const a = h.t * .5 + i * .35, r = 60 + (i % 3) * 60; c.fillStyle = i % 2 ? 'rgba(180,255,120,.7)' : 'rgba(255,255,255,.6)'; c.fillRect(Math.round((h.x + Math.cos(a) * r) / 3) * 3, Math.round((-30 + Math.sin(a) * 12) / 3) * 3, 14, 4); } c.restore(); };

  const F5 = mk({ name: "Tyrant's Roar", desc: 'Tyrant King: a roar that erases every projectile ahead of him, stuns, and sends a shockwave through the floor.', pose: 'charge', s: 14, a: 10, r: 24, hit: { dmg: 66, box: [0, -170, 380, 170], stun: .9, kb: [720, -120], hs: 20 }, ai: { min: 0, max: 380, use: 'combo' }, ev: { 2: () => sfx('rxStomp'), 14: f => { sfx('rxRoar', 0, 1.8); for (const p of Combat.projectiles) if (p.side !== f.side && (p.x - f.x) * f.facing > 0 && Math.abs(p.x - f.x) < 700) p.life = 0; Cam.shake = 16; } } });
  const F6 = Mv.rush({ name: 'Rampage', desc: 'Tyrant King: three charges in a row. Armored, and each one drives the foe further.', s: 8, speed: 1200, frames: 30, armor: [1, 40], hit: { dmg: 56, multi: 3, every: 9, kb: [420, -160], wb: true }, ev: { 1: () => sfx('rxStomp'), 11: () => sfx('rxStomp'), 22: () => sfx('rxStomp') } });
  const F2 = Object.assign(Mv.grab({ name: 'Death Roll', desc: 'Tyrant King: a bigger bite-grab that rolls the foe. Eats all HUNGER: heals 4 HP per point.', range: 100, s: 6, grabData: { anim: 'spin', dmg: 300, frames: 44 }, ev: { 3: () => sfx('rxChomp') } }), { onHit: a => { const n = a.gauge || 0; if (n > 0) { Combat.healSelf(a, Math.round(n * 4)); a.gauge = 0; } sfx('rxChomp'); Cam.shake = 12; } });
  const F4 = mk({ name: 'Tail Cyclone', desc: 'Tyrant King: a full spin with the tail for 1s, striking everything within reach on both sides.', pose: 'slam', s: 12, a: 1, r: 24, cd: 4, ai: { min: 0, max: 260, use: 'combo' }, ev: { 3: () => sfx('rxWhip'), 12: f => { Combat.addHazard({ kind: 'rxCyclone', owner: f, side: f.side, x: f.x, life: 60 }); sfx('rxWhip'); sfx('rxWhip', .25); sfx('rxWhip', .5); } } });
  const FJ = Mv.dive({ name: 'Meteor Belly', desc: 'Tyrant King: a belly flop that shakes the whole stage.', vx: 280, vy: 1800, hit: { dmg: 126, gb: true }, ev: { 1: () => sfx('rxRoar', 0, .6) }, onHit: a => { Combat.explode(a.x, -20, 160, a, 30, '#9ae04a'); sfx('rxStomp'); Cam.shake = 18; } });
  const FU = PxKit.ult({ id: 'rex_fult', name: 'MASS EXTINCTION', desc: 'Tyrant King: the sky fills with fire. Asteroids fall across the whole stage. Blockable. Must connect.', pose: 'charge', s: 56, dmg: 1320, color: '#ffb040',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'MASS EXTINCTION', dur: 8.8, tc: [1.0, 4.8], tf: 5.6, c1: '#ffb040', c2: '#fff0c0', c3: '#240800', motif: 'meteor', pose: ['idle', 'charge', 'cast_up', 'victory'], actorForm: true, cap1: 'I outlived the last one.', cap2: 'I will outlive you.', title: 'MASS EXTINCTION', sub: 'THE SKY IS FALLING', size: 100,
      cues: [[0, () => sfx('rxRoar', 0, 2)], [1.4, () => sfx('rxFall', 0, 3.6)], [5.6, () => { sfx('rxStomp'); sfx('rxStomp', .3); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0600', bot: '#8a3a08', embers: '#ffb040', mount: '#2a0e04', sun: { x: .5, y: .2 + .1 * k, r: 40 + k * 140, col: '#ff8a2a' }, rays: '#ffd890' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 56, w: 1100, h: 340, back: 400, start: f => { f.say('Look up.', 90); sfx('rxRoar', 0, 1.8); }, fire: f => { for (let i = 0; i < 9; i++) Game.later(i * .12, () => { const x = clamp(f.x + f.facing * (-100 + i * 130), 40, Arena.stage.width - 40); Combat.addHazard({ kind: 'rxRock', owner: f, side: f.side, x, life: 70 }); }); Cam.shake = 18; sfx('rxFall', 0, 1.4); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'TIMED (12s). Colossal size, super armor, huge damage. New moveset: Tyrant\'s Roar, Rampage, Death Roll, Tail Cyclone, Meteor Belly, and the ultimate MASS EXTINCTION.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'EXTINCTION EVENT', dur: 8.2, tc: [1.0, 4.2], tf: 5.0, c1: '#ffb040', c2: '#fff0c0', c3: '#240800', motif: 'meteor', pose: ['idle', 'charge', 'cast_up', 'victory'], cap1: 'It was quiet last time too.', cap2: 'Right before.', title: 'EXTINCTION EVENT', sub: 'A BIG ONE', size: 96,
    cues: [[0, () => sfx('rxRoar', 0, 1.6)], [1.4, () => sfx('rxFall', 0, 3.2)], [5.0, () => { sfx('rxStomp'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0600', bot: '#6a2a08', embers: '#ffb040', mount: '#2a0e04', sun: { x: .7, y: .2, r: 50 + k * 110, col: '#ff8a2a' } }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'TYRANT KING', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#9ae04a', c2: '#fff0c0', c3: '#102406', motif: 'rise', shape: 'rect', pose: ['idle', 'charge', 'victory'], cap1: 'Eat. Grow. Rule.', cap2: 'In that order.', title: 'TYRANT KING', sub: 'REX', size: 108,
    cues: [[0, () => sfx('rxStomp')], [1.4, () => sfx('rxRoar', 0, 2)], [3.9, () => { sfx('rxRoar', 0, 1.6); sfx('rxStomp'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a1a04', bot: '#2a5a0c', mount: '#14280a', embers: '#9ae04a', rays: '#d8ffa0' }, k) });
})();
