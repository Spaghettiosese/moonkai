// ============================================================
//  MOONKAI — LUNA, the Eclipse. Pixel remake + ECLIPSE EMPRESS moveset.
//  (The turning PHASE, Moonborn, Phase Shift and Blood Moon stay as they were.)
//  ECLIPSE EMPRESS   UMBRAL CRESCENT (5S) a huge slow crescent of dark moon, ECLIPSE PASS (6S) three vanishing strikes,
//                    MOONFALL (2S) pillars of silver light marching across the stage, MIRROR MOON (4S) a reflect that sets the phase,
//                    CRESCENT RAIN (jS).   TOTAL ECLIPSE (form ult)   the sun goes out.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('luna');
  Object.assign(Sfx, {
    lnChime(d = 0) { this.run({ notes: [880, 1175, 1480, 1760], step: .1, dur: 1.2, vol: .09, bell: true, delay: d, wet: .95 }); },
    lnSwish(d = 0) { this.nsweep({ f0: 1200, f1: 6000, dur: .25, vol: .16, q: 1.6, delay: d, wet: .5 }); this.fm({ f: 740, ratio: 1.5, index: 80, dur: .4, vol: .07, delay: d, wet: .8 }); },
    lnDrone(d = 0, dur = 3) { this.chord({ notes: [98, 123, 147, 196], dur, vol: .2, type: 'sine', delay: d, wet: .95 }); this.voice({ f: 49, to: 46, dur, vol: .2, type: 'sine', delay: d }); },
    lnEclipse(d = 0) { this.voice({ f: 400, to: 40, dur: 1.4, vol: .24, type: 'sine', delay: d, wet: .7 }); this.nsweep({ f0: 6000, f1: 100, dur: 1.4, vol: .14, type: 'lowpass', delay: d, wet: .6 }); this.sub({ f: 60, to: 30, dur: 1.2, vol: .4, delay: d + .5 }); },
    lnPillar(d = 0) { this.nsweep({ f0: 800, f1: 5000, dur: .3, vol: .14, q: 2, delay: d, wet: .7 }); this.lnChime(d + .05); },
  });
  PxKit.pixelize(def, { win: [-260, -380, 560, 440] });
  Combat.hz.lnDark = function (h) { const f = h.owner; if (!f) return false; h.x += h.dir * 6; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 70 && e.y > -220 && !h.hit.has(e)) { h.hit.add(e); Combat.resolveHit(e, f, H_({ dmg: 90, guard: 'mid', hs: 24, kb: [380 * h.dir, -440], launch: true, status: { weaken: 3 }, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); } return h.t < h.life && h.x > -80 && h.x < Arena.stage.width + 80; };
  Combat.drawHz.lnDark = (c, h) => { c.save(); c.translate(h.x, -110); c.scale(h.dir, 1); c.fillStyle = '#10082a'; c.strokeStyle = '#c0c8ff'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 90, -1.4, 1.4); c.arc(-34, 0, 76, 1.2, -1.2, true); c.closePath(); c.fill(); c.stroke(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, 0, 120, 'rgba(160,170,255,0.22)', 'rgba(0,0,0,0)'); c.restore(); };

  const F5 = mk({ name: 'Umbral Crescent', desc: 'Eclipse Empress: a huge slow crescent of dark moon that carries the foe with it.', pose: 'cast', s: 16, a: 1, r: 24, cd: 4, ai: { min: 150, max: 1200, use: 'zone' }, ev: { 3: () => sfx('lnDrone', 0, 1.6), 16: f => { Combat.addHazard({ kind: 'lnDark', owner: f, side: f.side, x: f.x + f.facing * 90, dir: f.facing, life: 160, hit: new Set(), move: F5 }); sfx('lnSwish'); Cam.shake = 5; } } });
  const F6 = mk({ name: 'Eclipse Pass', desc: 'Eclipse Empress: vanishes and strikes three times from the dark, each cut from a different side.', pose: 'heavy', s: 6, a: 24, r: 18, inv: [1, 30], ai: { min: 100, max: 900, use: 'approach' }, ev: { 6: f => { sfx('lnSwish'); Rw2.blink(f, { n: 3, gap: 8, dmg: 34, last: 76, color: '#c0c8ff', sfx: () => sfx('lnSwish'), move: F6 }); } } });
  const F2 = mk({ name: 'Moonfall', desc: 'Eclipse Empress: pillars of silver light march across the stage, three at a time.', pose: 'cast_up', s: 18, a: 1, r: 26, cd: 5, ai: { min: 100, max: 1100, use: 'zone' }, ev: { 18: f => { Rw2.row(f, 6, 120, { r: 50, life: 10, stagger: 4, color: '#c0c8ff', dmg: 66, status: { weaken: 2 }, move: F2, shake: 4 }); sfx('lnPillar'); sfx('lnPillar', .3); } } });
  const F4 = Object.assign(Mv.counter({ name: 'Mirror Moon', desc: 'Eclipse Empress: a reflecting counter that also turns her moon to FULL.', resp: 'reflect', window: 28, dmg: 100 }), { onHit: a => { a.lnPhase = 3; Game.popWorld(a.x, a.y - a.h - 40, 'FULL MOON', '#c0c8ff', 22); sfx('lnChime'); }, ev: { 2: () => sfx('lnSwish') } });
  const FJ = Mv.shot({ name: 'Crescent Rain', desc: 'Eclipse Empress: four crescents fall in a fan.', proj: { speed: 900, angle: 1.0, spread: .8, count: 4, r: 17, dmg: 38, kind: 'crescent', color: '#c0c8ff', core: '#fff', life: 1.2 }, ev: { 2: () => sfx('lnSwish') } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'luna_fult', name: 'TOTAL ECLIPSE', desc: 'Eclipse Empress: the sun goes out. In the dark, the moon lands. Blockable. Must connect.', pose: 'cast_up', s: 56, dmg: 1300, color: '#c0c8ff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'TOTAL ECLIPSE', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#c0c8ff', c2: '#ffffff', c3: '#04041a', motif: 'meteor', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'For one minute every day is a night.', cap2: 'Tonight it is a minute longer.', title: 'TOTAL ECLIPSE', sub: 'THE SUN GOES OUT', size: 100,
      cues: [[0, () => sfx('lnChime')], [1.4, () => sfx('lnEclipse')], [5.4, () => { sfx('lnPillar'); sfx('lnDrone', 0, 2); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#04041a', bot: '#1c1a5a', stars: '#c0c8ff', mount: '#080818' }, k); x.save(); x.fillStyle = '#fff0b0'; x.beginPath(); x.arc(W * .5, H * .3, 100, 0, 7); x.fill(); x.fillStyle = '#04041a'; x.beginPath(); x.arc(W * .5 + (1 - k) * 260 - 40, H * .3, 104, 0, 7); x.fill(); x.globalCompositeOperation = 'lighter'; glowCircle(x, W * .5, H * .3, 160 + k * 100, `rgba(255,240,180,${.4 * k})`, 'rgba(0,0,0,0)'); x.restore(); } }) });
  FU.ev = PxKit.trackEv(FU, { at: 56, r: 170, color: '#c0c8ff', start: f => { f.say('Look up.', 80); sfx('lnEclipse'); }, fire: (f, x) => { for (const e of Combat.targets(f.side)) if (Math.abs(e.x - x) < 260) e.status.weaken = 5; Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x, r: 170, life: 40, color: '#c0c8ff', giant: true }); Cam.shake = 22; sfx('lnPillar'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Dark moon aura, phases twice as fast. New moveset: Umbral Crescent, Eclipse Pass, Moonfall, Mirror Moon, Crescent Rain, and the ultimate TOTAL ECLIPSE.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'BLOOD MOON', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#ff5a6a', c2: '#ffe0e8', c3: '#1a0410', motif: 'meteor', pose: ['idle', 'cast_up', 'cast_up', 'victory'], cap1: 'It is not red because it is angry.', cap2: 'It is red because it has been watching.', title: 'BLOOD MOON', sub: 'IT DESCENDS', size: 98,
    cues: [[0, () => sfx('lnChime')], [1.4, () => sfx('lnDrone', 0, 3)], [4.8, () => { sfx('lnPillar'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a0210', bot: '#4a1020', moon: { x: .5, y: .2 + .14 * k, r: 80 + k * 140, col: '#ff4a5a' }, stars: '#ffb0c0', mount: '#14040c' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'ECLIPSE EMPRESS', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#c0c8ff', c2: '#ffffff', c3: '#04041a', motif: 'implode', pose: ['idle', 'cast_up', 'victory'], lift: 40, cap1: 'The moon has a far side.', cap2: 'I live there.', title: 'ECLIPSE EMPRESS', sub: 'LUNA', size: 100,
    cues: [[0, () => sfx('lnChime')], [1.4, () => sfx('lnEclipse')], [3.9, () => { sfx('lnDrone', 0, 2); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#04041a', bot: '#1c1a5a', moon: { x: .5, y: .26, r: 90, col: '#c0c8ff' }, stars: '#c0c8ff' }, k) });
})();
