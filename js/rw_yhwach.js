// ============================================================
//  MOONKAI — YHWACH rework: pixel art, and SOUL KING'S HEIR gets a moveset and an ultimate, SCHRIFT: THE END.
//   HEILIG PFEIL: VOLLEY (5S)  nine arrows     HIRENKYAKU: BLINK (6S)  a teleport slash    BLUT VENE: ANCHOR (2S)
//   REISHI BLADE: BLACK SUN (4S)  a sun of black reishi    ARROW RAIN (jS)
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('yhwach');
  Object.assign(Sfx, {
    yhwArrow(d = 0) { this.nsweep({ f0: 2000, f1: 8000, dur: .14, vol: .18, type: 'bandpass', q: 2, delay: d }); this.fm({ f: 1760, ratio: 1.5, index: 160, dur: .4, vol: .08, delay: d, wet: .7 }); },
    yhwBlink(d = 0) { this.nsweep({ f0: 7000, f1: 300, dur: .12, vol: .2, type: 'highpass', delay: d }); this.voice({ f: 1500, to: 120, dur: .16, vol: .1, delay: d, wet: .5 }); },
    yhwSun(d = 0, dur = 2) { this.voice({ f: 55, to: 49, dur, vol: .4, type: 'sine', delay: d, wet: .5 }); this.chord({ notes: [98, 147, 196, 294], dur, vol: .26, type: 'sawtooth', lp: 800, delay: d, wet: .95, det: 22 }); },
    yhwEnd(d = 0) { this.sub({ f: 70, to: 24, dur: 2, vol: .5, delay: d }); this.fm({ f: 82, ratio: 2.76, index: 800, dur: 3.4, vol: .4, delay: d, wet: .9 }); this.impact(1, d); },
    yhwWrite(d = 0) { for (let i = 0; i < 8; i++) this.fm({ f: 1200 + (i % 3) * 200, ratio: 4.1, index: 200, dur: .08, vol: .06, delay: d + i * .09, wet: .4 }); },
  });
  PxKit.pixelize(def, { win: [-230, -350, 520, 410] }); { const op = def.drawPortrait; if (op) { const px = PxKit.portrait('yhwach', op, { res: 64, levels: 8, dither: .3 }); def.drawPortrait = (c, o, d) => PxKit.on() ? px(c, o, d) : op(c, o, d); } }
  const F5 = Mv.shot({ name: 'Heilig Pfeil: Volley', desc: "Heir: nine arrows of reishi in an arc, each one a tiny star.", proj: { speed: 1300, r: 9, dmg: 26, count: 9, spread: 1.1, kind: 'spear', color: '#aab8ff', core: '#ffffff', trail: false }, ev: { 3: () => sfx('yhwArrow'), 6: () => sfx('yhwArrow') } });
  const F6 = Mv.teleport({ name: 'Hirenkyaku: Blink', desc: "Heir: steps behind the foe and cuts, faster than the eye.", to: 'behind', pose: 'heavy', s: 5, hit: { dmg: 86, box: [0, -120, 120, 110], kb: [520, -300], launch: true } });
  { const e = F6.ev[4]; F6.ev[4] = f => { e(f); sfx('yhwBlink'); }; }
  const F2 = Mv.place({ name: 'Blut Vene: Anchor', desc: 'Heir: blood-veins anchor the foe in place and keep them stunned.', spawn: { kind: 'trap', at: 'enemy', color: '#8a0a1a', stun: 1.4, dmg: 52 }, cd: 6, ev: { 6: () => sfx('yhwWrite') } });
  const F4 = Mv.custom({ name: 'Reishi Blade: Black Sun', desc: 'Heir: a sun of black reishi hangs over the foe, then falls.', pose: 'cast_up', s: 18, a: 1, r: 22, cd: 5, ai: { min: 100, max: 900, use: 'zone' }, ev: { 3: () => sfx('yhwSun', 0, 1), 18: f => { const t = f.opp; if (!t) return; Combat.telegraph(f, { x: clamp(t.x + (t.vx || 0) * .3, 50, Arena.stage.width - 50), r: 90, life: 34, color: '#8a6aff', column: true, onFire: h => { for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r) Combat.resolveHit(e, f, H_({ dmg: 100, guard: 'mid', hs: 26, kb: [0, -620], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: F4 }); Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 24, color: '#8a6aff', dark: true }); sfx('yhwEnd'); Cam.shake = 10; } }); } } });
  const FJ = Mv.shot({ name: 'Arrow Rain', desc: 'Heir: reishi arrows falling from the sky in a curtain.', proj: { speed: 1100, r: 9, dmg: 24, count: 8, spread: 1.0, angle: .9, kind: 'spear', color: '#aab8ff', trail: false }, ev: { 2: () => sfx('yhwArrow') } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'yhwach_fult', name: 'SCHRIFT: THE END', desc: 'Heir: he writes the foe\'s ending in the sky, in letters that cannot be erased. Blockable. Must connect.', pose: 'cast_up', s: 56, dmg: 1320, color: '#aab8ff',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'SCHRIFT: THE END', dur: 8.8, tc: [1.2, 4.4], tf: 5.4, c1: '#aab8ff', c2: '#ffffff', c3: '#1a1030', motif: 'rift', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'I am the beginning.', cap2: 'Allow me to write the end.', title: 'SCHRIFT: THE END', sub: 'IT WAS ALWAYS WRITTEN', size: 92,
      cues: [[0, () => sfx('yhwSun', 0, 3)], [1.4, () => sfx('yhwWrite', 0)], [2.4, () => sfx('yhwWrite', 0)], [3.4, () => sfx('yhwWrite', 0)], [4.4, () => sfx('riser', 1.2, .22, 0, 70, 1600)], [5.4, () => { sfx('yhwEnd'); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#02000a', bot: '#1a1038', moon: { x: .6, y: .26, r: 110 + k * 40, col: '#05000c' }, stars: '#aab8ff', fog: 'rgba(80,60,160,0.14)' }, k); x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = `rgba(200,210,255,${.5 + .4 * k})`; for (let i = 0; i < 80 * k; i++) x.fillRect((i * 131 + t * 40) % W, 40 + (i * 29) % (H * .55), 18 + (i % 4) * 8, 4); x.restore(); } }) });
  FU.ev = PxKit.trackEv(FU, { at: 56, r: 140, color: '#8a6aff', start: f => { f.say('Schrift.', 80); sfx('yhwSun', 0, 3); sfx('yhwWrite'); }, fire: (f, x) => { Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x, r: 140, life: 36, color: '#8a6aff', dark: true }); Cam.shake = 22; sfx('yhwEnd'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: "Timed. The heir takes the Soul King's power. New moveset: Heilig Pfeil: Volley, Hirenkyaku: Blink, Blut Vene: Anchor, Reishi Blade: Black Sun, Arrow Rain, and the ultimate SCHRIFT: THE END." });
})();
