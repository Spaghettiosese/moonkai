// ============================================================
//  MOONKAI — ERIC rework: pixel art (human and Great Ape), and at FULL MOON his Rising Fang becomes MOON FANG,
//  a rising claw that fires a column of moonlight after it. New sound design for the ape and the moon.
// ============================================================
(() => {
  const sfx = PxKit.sfx, d = charById('eric');
  Object.assign(Sfx, {
    eriKi(d = 0) { this.voice({ f: 400, to: 1200, dur: .22, vol: .12, type: 'sawtooth', lp: 3200, delay: d, wet: .4 }); this.nsweep({ f0: 800, f1: 5000, dur: .2, vol: .14, delay: d, wet: .3 }); },
    eriMoon(d = 0) { this.chord({ notes: [220, 277, 330, 440], dur: 2.4, vol: .24, type: 'sine', delay: d, wet: .95 }); this.fm({ f: 880, ratio: 1.5, index: 120, dur: 2, vol: .08, delay: d + .2, wet: .95 }); },
    eriApe(d = 0, dur = 2.2) { this.voice({ f: 88, to: 46, dur, vol: .36, type: 'sawtooth', lp: 700, n: 4, det: 34, delay: d, wet: .5 }); this.nsweep({ f0: 200, f1: 1200, dur: dur * .7, vol: .16, q: 1.2, delay: d }); this.sub({ f: 60, to: 24, dur, vol: .46, delay: d }); for (let i = 0; i < 6; i++) this.sub({ f: 70, to: 36, dur: .18, vol: .28, delay: d + .3 + i * .18 }); },
    eriFang(d = 0) { this.nsweep({ f0: 900, f1: 7000, dur: .22, vol: .24, delay: d }); this.fm({ f: 1320, ratio: 1.5, index: 260, dur: .8, vol: .14, delay: d + .06, wet: .8 }); },
  });
  PxKit.pixelize(d, { win: [-300, -460, 640, 520] }); { const op = d.drawPortrait; if (op) { const px = PxKit.portrait('eric', op, { res: 64, levels: 8, dither: .3 }); d.drawPortrait = (c, o, dd) => PxKit.on() ? px(c, o, dd) : op(c, o, dd); } }
  const FANG = Mv.rising({ name: 'Moon Fang', desc: 'FULL MOON: Rising Fang with a column of moonlight behind it. Hits five times and throws the foe skyward.', hit: { dmg: 96, multi: 5, every: 3, kb: [120, -1100] }, ev: { 2: () => sfx('eriFang'), 5: f => { if (f.opp) Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: f.x + f.facing * 60, r: 70, life: 24, color: '#dfe8ff' }); } } });
  FANG.id = 'eric_moonfang'; FANG.slot = '2S'; FANG.owner = 'eric';
  const prev = d.specialFor;
  d.specialFor = (f, slot) => (slot === '2S' && !f.form && (f.gauge || 0) >= 100) ? FANG : (prev ? prev(f, slot) : undefined);
  d.passive[1] += ' At FULL MOON his Rising Fang becomes MOON FANG.';
})();
