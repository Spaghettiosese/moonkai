// ============================================================
//  MOONKAI — FANG, the Moonlit Hunter. Pixel remake + a real kit.
//
//  BLOODLUST (new gauge)  rises while a BLEEDING foe is near and with every claw; at 100 he enters a FRENZY for 5s: +20% speed,
//                         +20% damage, every hit bleeds.
//  BLOODHOUND (passive)   hits cause bleeding and he is faster against bleeding targets (as before).
//  FULL MOON BEAST        POUNCE CHAIN (5S) three lunges, REND (6S) a savage multi-claw ending in a launch, MOON HOWL (2S) a
//                         shockwave that buffs the pack, MOON CLAW (4S) a higher rising claw, METEOR POUNCE (jS).
//  BLOOD MOON HUNT (form ult)   the pack answers.     LUNAR FRENZY & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('fang');
  Object.assign(Sfx, {
    fnHowl(d = 0, dur = 2) { this.voice({ f: 330, to: 640, dur: dur * .35, vol: .24, type: 'sawtooth', lp: 1800, delay: d, wet: .7 }); this.voice({ f: 640, to: 300, dur: dur * .65, vol: .2, type: 'sawtooth', lp: 1500, delay: d + dur * .35, wet: .7 }); },
    fnClaw(d = 0) { this.nsweep({ f0: 3000, f1: 8000, dur: .09, vol: .22, type: 'bandpass', q: 2, delay: d }); this.fm({ f: 800, ratio: 3.7, index: 160, dur: .14, vol: .08, delay: d }); },
    fnGrowl(d = 0, dur = .9) { this.voice({ f: 80, to: 60, dur, vol: .26, type: 'sawtooth', lp: 500, n: 3, det: 30, delay: d, wet: .3 }); },
    fnPounce(d = 0) { this.nsweep({ f0: 500, f1: 3000, dur: .2, vol: .2, delay: d }); this.voice({ f: 140, to: 60, dur: .3, vol: .2, type: 'sawtooth', lp: 700, delay: d }); },
    fnPack(d = 0, dur = 3) { for (let i = 0; i < 4; i++) this.fnHowl(d + i * .35, dur - i * .35); this.rumble ? this.rumble(dur, .2, d) : null; },
  });
  PxModel.install(def, { post(c, v, P, s, m) { if ((v.gauge || 0) >= 100) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,60,60,.6)'; for (let i = 0; i < 3; i++) c.fillRect(Math.round(P.hip[0] - 20 + i * 14), Math.round(P.hip[1] - 100 - (v.anim * 60 + i * 20) % 40), 3, 10); c.restore(); } } });
  const lust = (f, n) => { if (f.frenzyT > 0) return; f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (f.gauge >= 100) { f.gauge = 0; f.frenzyT = 5 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'FRENZY', '#ff4a4a', 26); sfx('fnHowl', 0, 1.2); Cam.shake = 6; } };
  Rw2.merge(def, {
    gauge: { name: 'BLOODLUST', max: 100, color: '#ff4a4a', label: f => (f.frenzyT > 0 ? '· FRENZY' : '') },
    passive: ['Bloodhound', 'Hits bleed; he is faster against bleeding targets. Bleeding foes and his claws feed BLOODLUST; at 100 he enters a 5s FRENZY: +20% speed and damage.'],
    onRoundStart: f => { f.gauge = 0; f.frenzyT = 0; },
    onHit: (a, t) => { lust(a, 4); if (a.frenzyT > 0) t.status.bleed = Math.max(t.status.bleed || 0, 3); },
    passiveDmg: f => (f.frenzyT > 0 ? 1.2 : 1),
    passiveTick: f => { if (f.frenzyT > 0) { f.frenzyT--; f.status.haste = Math.max(f.status.haste || 0, .1); } const o = f.opp; if (o && o.status.bleed && Math.abs(o.x - f.x) < 400 && f.st % 10 === 0) lust(f, 1); },
  });
  const F5 = Object.assign(Mv.rush({ name: 'Pounce Chain', desc: 'Full Moon Beast: three lunges in a row, each from a new angle.', s: 6, speed: 1500, frames: 30, hit: { dmg: 46, multi: 3, every: 9, kb: [160, -200], status: { bleed: 2 } }, ev: { 1: () => sfx('fnPounce'), 11: () => sfx('fnPounce'), 21: () => sfx('fnPounce') } }), {});
  const F6 = Mv.flurry({ name: 'Rend', desc: 'Full Moon Beast: a savage flurry of claws that ends in a launching slash. Everything bleeds.', hits: 10, every: 3, hit: { dmg: 14, status: { bleed: 2 } }, finisher: { dmg: 90, kb: [500, -720], launch: true, status: { bleed: 4 } }, ev: { 3: () => sfx('fnClaw'), 12: () => sfx('fnClaw'), 24: () => sfx('fnClaw') } });
  const F2 = mk({ name: 'Moon Howl', desc: 'Full Moon Beast: a howl that shakes the stage, stuns what is near, and sends him into FRENZY if the gauge is over half.', pose: 'charge', s: 16, a: 6, r: 26, hit: { dmg: 40, box: [-180, -160, 360, 160], centered: true, stun: .7, kb: [300, -100], hs: 16 }, ai: { min: 0, max: 220, use: 'combo' }, ev: { 2: () => sfx('fnGrowl'), 16: f => { sfx('fnHowl', 0, 1.8); Combat.buff(f, { power: 1, haste: 1 }, 5, 'MOON HOWL'); if ((f.gauge || 0) >= 50) { f.gauge = 100; lust(f, 0); } Cam.shake = 12; } } });
  const F4 = Mv.rising({ name: 'Moon Claw', desc: 'Full Moon Beast: a higher, longer rising claw. Invulnerable on the way up.', height: 1100, hit: { dmg: 40, multi: 4, every: 3, kb: [100, -1100], status: { bleed: 3 } }, ev: { 6: () => sfx('fnClaw') } });
  const FJ = Mv.dive({ name: 'Meteor Pounce', desc: 'Full Moon Beast: a diving pounce that bounces the foe; the landing shakes the ground.', vx: 700, vy: 1700, hit: { dmg: 104, gb: true, status: { bleed: 3 } }, ev: { 1: () => sfx('fnPounce') }, onHit: () => { Cam.shake = 12; sfx('fnGrowl'); } });
  const FU = PxKit.ult({ id: 'fang_fult', name: 'BLOOD MOON HUNT', desc: 'Full Moon Beast: the moon turns red and the pack answers from every side. Blockable. Must connect.', pose: 'charge', s: 48, dmg: 1280, color: '#ff4a4a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'BLOOD MOON HUNT', dur: 8.4, tc: [1.0, 4.4], tf: 5.2, c1: '#ff4a4a', c2: '#ffe0d0', c3: '#14040a', motif: 'rush', pose: ['idle', 'cast_up', 'dash', 'victory'], actorForm: true, cap1: 'Alone, I am a wolf.', cap2: 'Tonight I am the pack.', title: 'BLOOD MOON HUNT', sub: 'THE PACK ANSWERS', size: 100,
      cues: [[0, () => sfx('fnGrowl')], [1.4, () => sfx('fnPack', 0, 3.4)], [5.2, () => { sfx('fnClaw'); sfx('fnPounce'); sfx('fnClaw', .1); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#14040a', bot: '#4a1018', moon: { x: .5, y: .22, r: 100, col: '#ff5a5a' }, stars: '#ffb0b0', mount: '#0a0206', fog: 'rgba(255,60,60,0.1)' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 48, w: 900, h: 340, back: 400, start: f => { f.say('HUNT!', 80); sfx('fnPack'); }, fire: f => { for (let i = 0; i < 5; i++) Game.later(i * .08, () => { const t = f.opp; if (t) { const s = i % 2 ? -1 : 1; Game.fx.burst(t.x + s * 140, -50, 8, { color: ['#ff4a4a', '#fff'], size: 8, speed: 380, life: .3, glow: true }); sfx('fnClaw'); } }); if (f.opp) f.opp.status.bleed = 6; Cam.shake = 18; sfx('fnPounce'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Bigger, faster, lifesteal. New moveset: Pounce Chain, Rend, Moon Howl, Moon Claw, Meteor Pounce, and the ultimate BLOOD MOON HUNT.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'LUNAR FRENZY', dur: 7.8, tc: [1.0, 3.8], tf: 4.6, c1: '#c8d0e8', c2: '#ffffff', c3: '#080a18', motif: 'rush', pose: ['idle', 'charge', 'dash', 'victory'], cap1: 'Smell that?', cap2: 'It is you.', title: 'LUNAR FRENZY', sub: 'FEED', size: 98,
    cues: [[0, () => sfx('fnHowl')], [1.2, () => sfx('fnGrowl', 0, 1.6)], [4.6, () => { sfx('fnClaw'); sfx('fnClaw', .08); sfx('fnPounce'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#04060e', bot: '#222a44', moon: { x: .7, y: .22, r: 90, col: '#e8ecff' }, stars: '#c8d0e8', mount: '#080a14', fog: 'rgba(200,208,232,0.08)' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'FULL MOON BEAST', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#c8d0e8', c2: '#ff4a4a', c3: '#080a18', motif: 'converge', pose: ['idle', 'charge', 'victory'], cap1: 'It was never a man.', cap2: 'It was patient.', title: 'FULL MOON BEAST', sub: 'FANG', size: 100,
    cues: [[0, () => sfx('fnGrowl')], [1.4, () => sfx('fnHowl', 0, 2.4)], [3.9, () => { sfx('fnClaw'); sfx('fnGrowl', 0, 1.4); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#04060e', bot: '#222a44', moon: { x: .5, y: .22, r: 90 + k * 40, col: '#e8ecff' }, stars: '#c8d0e8', mount: '#080a14' }, k) });
})();
