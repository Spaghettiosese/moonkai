// ============================================================
//  MOONKAI — KAEL, the Hollow Core. A deeper demon and new cinematics (he is already a Pixel Studio fighter).
//  (Containment, Second Life and Hunger stay as they were.)
//  DEMON: INFERNAL PLUNGE (jS) dives and leaves three burning pools.   MAW OF THE CORE (super) a roaring beam from the chest.
//  HELLFIRE BARRAGE has a new cinematic; SECOND LIFE (the revival) too.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('kael');
  Object.assign(Sfx, {
    kaMaw(d = 0, dur = 1.4) { this.voice({ f: 120, to: 48, dur, vol: .34, type: 'sawtooth', lp: 900, n: 3, det: 40, delay: d, wet: .5 }); this.nsweep({ f0: 300, f1: 1400, dur: dur * .6, vol: .16, q: 2, delay: d, wet: .3 }); this.sub({ f: 60, to: 26, dur: dur * .7, vol: .4, delay: d }); },
    kaSeal(d = 0) { this.fm({ f: 1800, ratio: 1.5, index: 120, dur: .5, vol: .1, delay: d, wet: .6 }); this.nsweep({ f0: 5000, f1: 700, dur: .3, vol: .12, delay: d }); },
    kaCrackle(d = 0) { this.crackle({ dur: .5, vol: .1, delay: d, lo: 300, hi: 4000 }); this.nsweep({ f0: 800, f1: 200, dur: .4, vol: .14, type: 'lowpass', delay: d }); },
    kaPlunge(d = 0) { this.nsweep({ f0: 3000, f1: 200, dur: .4, vol: .22, type: 'lowpass', delay: d }); this.impact(.9, d + .35); },
    kaMeteor(d = 0) { this.riser(2.2, .26, d, 80, 900); this.sub({ f: 50, to: 24, dur: 1.2, vol: .5, delay: d + 2.2 }); this.impact(1, d + 2.2); },
  });

  const FJ = Mv.dive({ name: 'Infernal Plunge', desc: 'Demon: a flaming plunge that leaves three burning pools where it lands.', vx: 650, vy: 1500, hit: { dmg: 98, gb: true, status: { burn: 2 } }, ev: { 1: () => sfx('kaPlunge') }, onHit: (a, t) => { for (let i = -1; i <= 1; i++) Rw2.pool(a, t.x + i * 70, { r: 40, life: 2.2, dmg: 14, color: '#ff4a1a', status: { burn: 1 } }); sfx('kaCrackle'); } });
  const MAW = superize(Mv.beam({ name: 'Maw of the Core', desc: 'Demon: the seal splits open and a roaring beam of hellfire pours from his chest.', pose: 'charge', s: 22, beam: { len: 1500, width: 70, dur: 50, dmg: 20, tick: 5, color: '#ff3b1a', core: '#ffe08a', kb: [260, -80], status: { burn: 2 }, super: true }, ev: { 2: () => sfx('kaMaw', 0, 1.2) } }), 100);
  MAW.id = 'kael_dsuper';
  PxKit.formKit(def, { moves: { jS: FJ }, patch: { super: MAW } });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'HELLFIRE BARRAGE', dur: 8.0, tc: [1.0, 4.4], tf: 5.2, c1: '#ff4a1a', c2: '#ffe08a', c3: '#2a0400', motif: 'meteor', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'The seal was only ever holding me in.', cap2: 'Now it holds the fire.', title: 'HELLFIRE BARRAGE', sub: 'BURN IT ALL', size: 98,
    cues: [[0, () => sfx('kaCrackle')], [1.2, () => sfx('kaMeteor')], [5.2, () => { sfx('kaMaw'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0000', bot: '#6a1a04', embers: '#ff6a1a', ruins: '#1a0604', sun: { x: .5, y: .22, r: 60 + k * 120, col: '#ff7a2a' }, rays: '#ff8a3a' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'SECOND LIFE', dur: 6.6, tc: [1.2, 3.8], tf: 4.0, c1: '#ff4a1a', c2: '#ffe08a', c3: '#2a0400', motif: 'rise', pose: ['kneel', 'charge', 'victory'], lift: 24, cap1: 'Seal... break...', cap2: 'Then let it all out.', title: 'SECOND LIFE', sub: 'THE DEMON WAKES', size: 100, extra: {},
    cues: [[0, () => sfx('kaSeal')], [1.4, () => sfx('kaCrackle')], [2.6, () => sfx('heartbeat')], [4.0, () => { sfx('kaMaw'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#080000', bot: '#4a1004', embers: '#ff6a1a', ruins: '#140402', rays: '#ff8a3a' }, k) });
})();
