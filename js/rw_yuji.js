// ============================================================
//  MOONKAI — YUJI rework: pixel art, and a rare revival: when he falls, SUKUNA takes the wheel.
//  (SUKUNA already has its own moveset and Malevolent Shrine; the revival puts him in it at 40% health.)
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('yuji');
  Object.assign(Sfx, {
    yujFlash(d = 0) { this.gojBlackFlash ? this.gojBlackFlash(d) : this.impact(1, d); },
    yujSukuna(d = 0) { this.sub({ f: 60, to: 26, dur: 1.4, vol: .5, delay: d }); this.chord({ notes: [55, 82, 110, 165], dur: 3, vol: .3, type: 'sawtooth', lp: 650, delay: d, wet: .9, det: 30 }); this.crackle({ dur: 1.4, vol: .16, delay: d, lo: 200, hi: 3000 }); this.voice({ f: 220, to: 90, dur: 1.2, vol: .14, type: 'square', lp: 900, delay: d + .2, wet: .6 }); },
    yujTattoo(d = 0) { this.nsweep({ f0: 200, f1: 3200, dur: .7, vol: .14, q: 3, delay: d, swell: true, wet: .5 }); this.riser(1, .2, d, 90, 800); },
  });
  PxKit.pixelize(def, { win: [-210, -340, 470, 400] }); { const op = def.drawPortrait; if (op) { const px = PxKit.portrait('yuji', op, { res: 64, levels: 8, dither: .3 }); def.drawPortrait = (c, o, d) => PxKit.on() ? px(c, o, d) : op(c, o, d); } }
  def.revival = { needForm: false, enterForm: true, hp: 0.4, meter: 250, label: 'SUKUNA TAKES THE WHEEL', say: ['Hmph. A pitiful vessel.', 'Step aside, boy.'],
    cutscene: f => PxKit.reviveCs(f, { name: 'SUKUNA TAKES THE WHEEL', title: 'THE KING WAKES', sub: 'YUJI IS GONE FOR NOW', caption: 'You can stop now. I will finish this.', c1: '#ff2a3a', c2: '#ffd0d0', c3: '#200006', motif: 'shards', sfx: n => n === 'open' ? sfx('yujTattoo') : n === 'gather' ? sfx('yujTattoo', .1) : (sfx('yujSukuna'), sfx('yujFlash')),
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#050004', bot: '#2a0610', embers: '#ff3a3a', ruins: '#12040a', stars: '#ff9a8a' }, k) }) };
  def.form.desc += ' Rare: if he falls, Sukuna takes over once a round and fights on at 40% health.';
})();
