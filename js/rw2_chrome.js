// ============================================================
//  MOONKAI — CHROME, the Iron Gunslinger. Pixel remake + OVERCLOCKED CHASSIS moveset.
//  (The CYLINDER, Last Round, Reload and High Noon stay as they were.)
//  OVERCLOCKED   OVERCLOCK BURST (5S) six rounds in a blink, RICOCHET STORM (6S) three bullets skipping off the floor,
//                SWEEP FIRE (2S) a low fan, HOT RELOAD (4S) a reload that ends in a ring of sparks, RAIN FIRE (jS).
//                (The chassis feeds itself: none of these spend the cylinder.)
//  DEADEYE (form ult)   the reticle finds six targets that are all the same foe.     HIGH NOON & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('chrome');
  Object.assign(Sfx, {
    chBang(d = 0, p = 1) { this.nsweep({ f0: 5000 * p, f1: 300, dur: .12, vol: .3, type: 'lowpass', delay: d }); this.impact(.45, d); this.fm({ f: 190 * p, ratio: 2, index: 120, dur: .14, vol: .1, delay: d }); },
    chCock(d = 0) { this.fm({ f: 2200, ratio: 3.1, index: 150, dur: .06, vol: .12, delay: d }); this.fm({ f: 1700, ratio: 3.1, index: 150, dur: .08, vol: .12, delay: d + .09 }); },
    chSpin(d = 0) { for (let i = 0; i < 7; i++) this.fm({ f: 1800 - i * 80, ratio: 2.4, index: 100, dur: .04, vol: .08, delay: d + i * .04 }); },
    chRico(d = 0) { this.voice({ f: 2400, to: 1200, dur: .2, vol: .12, type: 'triangle', delay: d, wet: .4 }); },
    chTick(d = 0, n = 10) { for (let i = 0; i < n; i++) this.fm({ f: 900, ratio: 5, index: 160, dur: .05, vol: .09, delay: d + i * .5 }); },
    chWhistle(d = 0) { this.voice({ f: 880, to: 780, dur: 1.4, vol: .08, type: 'sine', delay: d, wet: .9 }); this.voice({ f: 1175, to: 1047, dur: 1.4, vol: .05, type: 'sine', delay: d + .1, wet: .9 }); },
  });
  PxKit.pixelize(def, { win: [-220, -340, 480, 400] });
  const free = (f, p) => { Combat.fireShots(f, Object.assign({ speed: 1700, r: 7, kind: 'bullet', color: '#ffd35a', life: 1.1, hs: 12, kb: [160, -40] }, p)); };
  const F5 = mk({ name: 'Overclock Burst', desc: 'Overclocked: six rounds in a blink. The chassis feeds itself.', pose: 'punch', s: 8, a: 14, r: 18, ai: { min: 150, max: 1300, use: 'zone' }, ev: Object.fromEntries([...Array(6)].map((_, i) => [8 + i * 2, f => { free(f, { dmg: 26, offY: -6 + (i % 3) * 6 }); sfx('chBang', 0, 1 + i * .04); }])) });
  const F6 = mk({ name: 'Ricochet Storm', desc: 'Overclocked: three bullets that skip off the floor and come up under the foe, a beat apart.', pose: 'punch', s: 8, a: 14, r: 20, ai: { min: 150, max: 1100, use: 'zone' }, ev: { 8: f => { for (let i = 0; i < 3; i++) Game.later(i * .1, () => { free(f, { dmg: 44, angle: .25 - i * .1, g: 700, kind: 'bullet', life: 1.2, offY: 40 }); sfx('chBang'); sfx('chRico', .05); }); } } });
  const F2 = mk({ name: 'Sweep Fire', desc: 'Overclocked: a low fan of five bullets along the ground.', pose: 'crouch', s: 10, a: 1, r: 20, ai: { min: 100, max: 900, use: 'zone' }, ev: { 10: f => { free(f, { dmg: 34, count: 5, spread: .22, guard: 'low', offY: 52, speed: 1500 }); sfx('chBang'); sfx('chBang', .06); } } });
  const F4 = mk({ name: 'Hot Reload', desc: 'Overclocked: rolls back and refills the cylinder, leaving a ring of sparks behind him. Invulnerable in the roll.', pose: 'dash', s: 4, a: 14, r: 12, inv: [1, 18], vel: [[4, 18, -900, null]], ai: { min: 250, max: 1500, use: 'buff' }, ev: { 3: () => sfx('chSpin'), 18: f => { f.gauge = chMax(f); Combat.fireShots(f, { speed: 500, r: 9, dmg: 30, count: 10, spread: 6.28, kind: 'bullet', color: '#ffb040', life: .4 }); sfx('chCock'); } } });
  const FJ = mk({ name: 'Rain Fire', desc: 'Overclocked: empties both guns downward in a spray.', pose: 'air_heavy', air: true, s: 8, a: 14, r: 12, ai: { min: 0, max: 600, use: 'approach' }, ev: Object.fromEntries([...Array(6)].map((_, i) => [8 + i * 2, f => { free(f, { dmg: 24, angle: 1.0 + i * .08, speed: 1400 }); sfx('chBang'); }])) });
  const FU = PxKit.ult({ id: 'chrome_fult', name: 'DEADEYE', desc: 'Overclocked: the reticle finds six targets, and every one of them is the same foe. Blockable. Must connect.', pose: 'punch', s: 44, dmg: 1280, color: '#ffd35a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'DEADEYE', dur: 8.2, tc: [1.0, 4.2], tf: 5.0, c1: '#ffd35a', c2: '#ffffff', c3: '#2a1a0a', motif: 'barrage', pose: ['idle', 'cast', 'punch', 'victory'], actorForm: true, cap1: 'Six chambers.', cap2: 'One name on each.', title: 'DEADEYE', sub: 'SIX FOR SIX', size: 104,
      cues: [[0, () => sfx('chWhistle')], [1.4, () => sfx('chTick', 0, 7)], [5.0, () => { for (let i = 0; i < 6; i++) sfx('chBang', i * .1, 1 + i * .05); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#2a1408', bot: '#c8782a', sun: { x: .5, y: .3, r: 80, col: '#fff0b0' }, mount: '#4a2410', rays: '#ffd890' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 44, w: 1100, h: 330, back: 200, start: f => { f.say('Six.', 80); sfx('chTick', 0, 4); }, fire: f => { for (let i = 0; i < 6; i++) Game.later(i * .08, () => { const t = f.opp; if (t) { Game.fx.burst(t.x, -90, 8, { color: ['#ffd35a', '#fff'], size: 7, speed: 340, life: .3, glow: true }); sfx('chBang', 0, 1 + i * .05); } }); Cam.shake = 16; sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Eight-shot cylinder, faster bullets, armor, self-reloading. New moveset: Overclock Burst, Ricochet Storm, Sweep Fire, Hot Reload, Rain Fire, and the ultimate DEADEYE.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'HIGH NOON', dur: 8.0, tc: [1.0, 4.4], tf: 5.2, c1: '#ffd35a', c2: '#ffffff', c3: '#2a1a0a', motif: 'beam', pose: ['idle', 'cast', 'punch', 'victory'], cap1: 'Tick.   Tick.   Tick.', cap2: 'Noon.', title: 'HIGH NOON', sub: 'ONE BULLET', size: 100,
    cues: [[0, () => sfx('chWhistle')], [1.2, () => sfx('chTick', 0, 8)], [5.2, () => { sfx('chBang'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#3a1c0a', bot: '#d8883a', sun: { x: .5, y: .2, r: 70, col: '#fff0c0' }, mount: '#5a2c10', rays: '#ffd890' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'OVERCLOCKED CHASSIS', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#ffd35a', c2: '#c8d4e0', c3: '#2a1a0a', motif: 'converge', shape: 'rect', pose: ['idle', 'cast', 'victory'], cap1: 'Every gun wants one more chamber.', cap2: 'Mine just built them.', title: 'OVERCLOCKED', sub: 'CHROME', size: 100,
    cues: [[0, () => sfx('chCock')], [1.4, () => sfx('chSpin')], [3.7, () => { sfx('chBang'); sfx('chSpin', .2); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#2a1408', bot: '#9a5a22', mount: '#4a2410', embers: '#ffd35a' }, k) });
})();
