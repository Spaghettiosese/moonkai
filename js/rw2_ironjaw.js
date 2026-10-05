// ============================================================
//  MOONKAI — IRON JAW, the Champ. Pixel remake + HEAVYWEIGHT CHAMP moveset.
//  (MOMENTUM, Iron Chin, Slip, Cornered and the Star Punch stay as they were.)
//  HEAVYWEIGHT   ONE-TWO-HOOK (5S) a four-punch combination, TITLE SHOT (6S) a huge cross with armor, RISING UPPERCUT (2S),
//                BOB AND WEAVE (4S) a slip that answers twice, OVERHAND LEAP (jS).   TWELVE ROUNDS (form ult)  a whole fight in one go.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('ironjaw');
  Object.assign(Sfx, {
    ijPunch(d = 0, p = 1) { this.impact(.55, d); this.nsweep({ f0: 900 * p, f1: 200, dur: .12, vol: .22, type: 'lowpass', delay: d }); },
    ijBell(d = 0, n = 1) { for (let i = 0; i < n; i++) this.fm({ f: 1320, ratio: 2.7, index: 120, dur: 1.4, vol: .2, delay: d + i * .45, wet: .7 }); },
    ijCrowd(d = 0, dur = 2) { this.nsweep({ f0: 600, f1: 2400, dur, vol: .2, q: .7, delay: d, swell: true, wet: .6 }); this.crackle({ dur, vol: .1, delay: d, lo: 500, hi: 5000 }); },
    ijBig(d = 0) { this.impact(1, d); this.sub({ f: 70, to: 26, dur: .6, vol: .5, delay: d }); this.nsweep({ f0: 1200, f1: 80, dur: .4, vol: .2, type: 'lowpass', delay: d }); },
    ijWhoosh(d = 0) { this.nsweep({ f0: 400, f1: 2500, dur: .16, vol: .16, delay: d }); },
  });
  PxKit.pixelize(def, { win: [-230, -340, 500, 400] });
  const F5 = Mv.flurry({ name: 'One-Two-Hook', desc: 'Heavyweight: jab, cross, body shot, hook. Each feeds MOMENTUM; the hook launches.', hits: 3, every: 6, hit: { dmg: 30 }, finisher: { dmg: 82, kb: [520, -520], launch: true }, ev: { 3: () => sfx('ijPunch'), 9: () => sfx('ijPunch', 0, 1.1), 15: () => sfx('ijPunch', 0, .9), 21: () => sfx('ijBig') }, onHit: a => ijMo(a, 1) });
  const F6 = Mv.rush({ name: 'Title Shot', desc: 'Heavyweight: a huge cross with armor all the way; at 5 MOMENTUM it spends all and splats the foe on the wall.', s: 10, speed: 1100, frames: 18, armor: [1, 26], hit: { dmg: 120, kb: [700, -240], wb: true }, ev: { 1: () => sfx('ijWhoosh') }, onHit: a => { if ((a.gauge || 0) >= 5) { a.gauge = 0; Game.popWorld(a.x, a.y - a.h - 40, 'STAR PUNCH', '#ffd35a', 26); sfx('ijBig'); Cam.shake = 14; } else ijMo(a, 1); } });
  const F2 = Mv.rising({ name: 'Rising Uppercut', desc: 'Heavyweight: an invincible uppercut that carries him up with the foe. +2 MOMENTUM.', height: 1100, hit: { dmg: 90, multi: 2, every: 6, kb: [100, -1000] }, ev: { 5: () => sfx('ijBig') }, onHit: a => ijMo(a, 2) });
  const F4 = Object.assign(mk({ name: 'Bob and Weave', desc: 'Heavyweight: slips under the attack, and if it whiffs through him he answers with TWO hooks. +3 MOMENTUM.', pose: 'block', s: 2, a: 26, r: 14, inv: [3, 22], ai: { min: 0, max: 200, use: 'counter' } }), { counter: { resp: 'strike', dmg: 130 }, onHit: a => { ijMo(a, 3); Game.later(.12, () => { const t = a.opp; if (t) { Combat.resolveHit(t, a, H_({ dmg: 90, guard: 'mid', hs: 22, kb: [500, -300], launch: true, sfx: 'h' }), { proj: true, fromX: a.x }); sfx('ijBig'); } }); } });
  const FJ = Mv.dive({ name: 'Overhand Leap', desc: 'Heavyweight: a leaping overhand right from above.', vx: 700, vy: 1100, pose: 'air_heavy', hit: { dmg: 104, gb: true }, ev: { 1: () => sfx('ijWhoosh') }, onHit: a => { ijMo(a, 1); sfx('ijBig'); } });
  const FU = PxKit.ult({ id: 'ironjaw_fult', name: 'TWELVE ROUNDS', desc: 'Heavyweight: a whole fight in one go. Twelve rounds of the best of him, ending in the title hook. Blockable. Must connect.', pose: 'punch', s: 42, dmg: 1300, color: '#ffd35a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'TWELVE ROUNDS', dur: 8.4, tc: [1.0, 4.4], tf: 5.2, c1: '#ffd35a', c2: '#ffffff', c3: '#1a0a0a', motif: 'barrage', pose: ['idle', 'charge', 'punch', 'victory'], actorForm: true, cap1: 'Ding. Ding. Ding.', cap2: 'Twelve of them.', title: 'TWELVE ROUNDS', sub: 'AND STILL CHAMP', size: 100,
      cues: [[0, () => sfx('ijBell', 0, 3)], [1.4, () => sfx('ijCrowd', 0, 3)], [5.2, () => { for (let i = 0; i < 6; i++) sfx('ijPunch', i * .1, 1 + i * .05); sfx('ijBig', .6); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0404', bot: '#4a1a1a', city: '#1a0808', lit: .9, rays: '#ffd890' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 42, w: 520, h: 320, back: 100, start: f => { f.say('Round one!', 80); sfx('ijBell', 0, 2); }, fire: f => { for (let i = 0; i < 12; i++) Game.later(i * .05, () => { const t = f.opp; if (t) { Game.fx.burst(t.x + rand(-40, 40), -90 + rand(-50, 40), 4, { color: ['#ffd35a', '#fff', '#ff3a3a'], size: 7, speed: 300, life: .25, glow: true }); sfx('ijPunch', 0, 1 + (i % 4) * .05); } }); Cam.shake = 18; sfx('ijBig'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. The belt: armor on specials, more damage, MOMENTUM never fades. New moveset: One-Two-Hook, Title Shot, Rising Uppercut, Bob and Weave, Overhand Leap, and the ultimate TWELVE ROUNDS.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'KNOCKOUT ROUND', dur: 7.8, tc: [1.0, 3.8], tf: 4.6, c1: '#ff3a3a', c2: '#ffffff', c3: '#1a0a0a', motif: 'rush', pose: ['idle', 'charge', 'punch', 'victory'], cap1: 'Hit me.', cap2: 'Go on.', title: 'KNOCKOUT ROUND', sub: 'DOWN', size: 100,
    cues: [[0, () => sfx('ijBell', 0, 1)], [1.2, () => sfx('ijCrowd', 0, 2.4)], [4.6, () => { sfx('ijBig'); sfx('ijBell', .5, 3); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0404', bot: '#3a1212', city: '#1a0808', lit: .8, rays: '#ff8a6a' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'HEAVYWEIGHT CHAMP', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#ffd35a', c2: '#ffffff', c3: '#1a0a0a', motif: 'rain', shape: 'rect', pose: ['idle', 'charge', 'victory'], cap1: 'They said I was too small.', cap2: 'I moved up a division.', title: 'HEAVYWEIGHT', sub: 'IRON JAW', size: 100,
    cues: [[0, () => sfx('ijBell', 0, 2)], [1.4, () => sfx('ijCrowd', 0, 2.4)], [3.7, () => { sfx('ijBig'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0404', bot: '#4a1a1a', city: '#1a0808', lit: .9, rays: '#ffd890' }, k) });
})();
