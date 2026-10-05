// ============================================================
//  MOONKAI — VOLIBEAR gets his missing form ultimate: THE UNBRIDLED TEMPEST. (Rendering and portrait are the Pixel Studio ones.)
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('volibear');
  Object.assign(Sfx, {
    voTempest(d = 0) { this.riser(2.4, .3, d, 60, 1400); this.volTh && this.volTh(d + 2.4); this.impact(1, d + 2.4); this.sub({ f: 48, to: 22, dur: 1.4, vol: .55, delay: d + 2.4 }); this.crackle({ dur: .8, vol: .16, delay: d + 2.4, lo: 800, hi: 9000 }); },
    voRoarBig(d = 0, dur = 2) { this.voice({ f: 90, to: 42, dur, vol: .4, type: 'sawtooth', lp: 800, n: 4, det: 30, delay: d, wet: .5 }); this.nsweep({ f0: 300, f1: 2200, dur: dur * .6, vol: .18, q: 1.5, delay: d, wet: .3 }); this.sub({ f: 55, to: 26, dur: dur * .8, vol: .5, delay: d }); },
  });
  const FU = PxKit.ult({ id: 'volibear_fult', name: 'THE UNBRIDLED TEMPEST', desc: 'The storm stops being a metaphor. Lightning falls across the whole stage while he charges through it. Blockable. Must connect.', pose: 'cast_up', s: 52, dmg: 1300, color: '#7ad8ff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'THE UNBRIDLED TEMPEST', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#7ad8ff', c2: '#ffffff', c3: '#050a1a', motif: 'barrage', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'The storm does not ask.', cap2: 'It takes.', title: 'THE UNBRIDLED TEMPEST', sub: 'RELENTLESS', size: 84, flash: '#eafcff',
      cues: [[0, () => sfx('voRoarBig', 0, 2.4)], [1.4, () => sfx('voTempest')], [5.4, () => { sfx('voRoarBig', 0, 1.6); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#02041a', bot: '#1c2a6a', clouds: '#1a2050', rain: '#bfe8ff', mount: '#080c20', snow: false }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 52, w: 1100, h: 340, back: 400, start: f => { f.say('I AM THE STORM.', 90); sfx('voRoarBig'); }, fire: f => { for (let i = 0; i < 9; i++) Game.later(i * .06, () => { const x = clamp(f.x + f.facing * (-100 + i * 130), 30, Arena.stage.width - 30); Combat.addHazard({ kind: 'volBoltFx', owner: f, side: f.side, x, r: 60, life: 14, seed: rand(0, 99), big: true }); Combat.explode(x, -70, 70, f, 0, '#7ad8ff'); }); Cam.shake = 24; sfx('voTempest'); sfx('boom'); } });
  PxKit.formKit(def, { ult: FU });
})();
