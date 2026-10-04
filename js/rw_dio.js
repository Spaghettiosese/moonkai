// ============================================================
//  MOONKAI — DIO rework: pixel art, and HIGH DIO gets a moveset and an ultimate, OVER HEAVEN: THE WORLD.
//   KNIFE FAN (5S)  nine knives     TWIN RIPPER (6S)  two eye-beams     BLOOD GEYSER (2S)  a column of blood
//   DASH STRIKE (4S)  a vampire's lunge    KNIFE STORM (jS)  knives from the air
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('dio');
  Object.assign(Sfx, {
    dioKnife(d = 0) { this.nsweep({ f0: 3000, f1: 9000, dur: .1, vol: .2, type: 'bandpass', q: 2, delay: d }); this.fm({ f: 2200, ratio: 5.1, index: 200, dur: .2, vol: .08, delay: d, wet: .3 }); },
    dioTick(d = 0) { this.fm({ f: 1400, ratio: 4.2, index: 200, dur: .09, vol: .12, delay: d, wet: .2 }); },
    dioClock(d = 0, n = 9) { for (let i = 0; i < n; i++) this.dioTick(d + i * .35); this.sub({ f: 60, to: 30, dur: .5, vol: .3, delay: d }); },
    dioStop(d = 0) { this.voice({ f: 300, to: 40, dur: .8, vol: .26, type: 'sine', delay: d, wet: .5 }); this.nsweep({ f0: 3000, f1: 100, dur: .8, vol: .18, type: 'lowpass', delay: d, wet: .5 }); this.fm({ f: 880, ratio: 1.01, index: 40, dur: 1.4, vol: .1, delay: d + .1, wet: .9 }); },
    dioResume(d = 0) { this.voice({ f: 40, to: 400, dur: .6, vol: .24, type: 'sine', delay: d, wet: .5 }); this.nsweep({ f0: 100, f1: 4000, dur: .5, vol: .16, delay: d, wet: .5 }); this.impact(.6, d + .5); },
    dioBlood(d = 0) { this.nsweep({ f0: 900, f1: 200, dur: .35, vol: .22, type: 'lowpass', delay: d, wet: .3 }); this.voice({ f: 180, to: 60, dur: .35, vol: .16, delay: d }); },
    dioMuda(d = 0) { for (let i = 0; i < 12; i++) this.impact(.35, d + i * .05); },
  });
  PxKit.pixelize(def, { win: [-210, -340, 470, 400] }); { const op = def.drawPortrait; if (op) { const px = PxKit.portrait('dio', op, { res: 64, levels: 8, dither: .3 }); def.drawPortrait = (c, o, d) => PxKit.on() ? px(c, o, d) : op(c, o, d); } }
  const F5 = Mv.shot({ name: 'Knife Fan', desc: 'High Dio: nine knives in a fan, thrown with a vampire\'s patience.', proj: { speed: 1200, r: 8, dmg: 24, count: 9, spread: 1.0, kind: 'spear', color: '#e8e8f0', trail: false }, ev: { 2: () => sfx('dioKnife'), 5: () => sfx('dioKnife') } });
  const F6 = Mv.shot({ name: 'Twin Ripper', desc: 'High Dio: Space Ripper Stingy Eyes, twice, from both eyes.', proj: { speed: 1600, r: 9, dmg: 40, count: 2, spread: .12, kind: 'spear', color: '#8affb0', core: '#ffffff', pierce: true, hs: 20 }, ev: { 3: () => sfx('dioKnife'), 8: () => sfx('dioKnife') } });
  const F2 = Mv.place({ name: 'Blood Geyser', desc: 'High Dio: a geyser of his own blood erupts under the foe.', spawn: { kind: 'spike', at: 'enemy', delay: 0.4, dmg: 84, color: '#c01828', fill: '#5a0810' }, cd: 4, ev: { 6: () => sfx('dioBlood') } });
  const F4 = Mv.rush({ name: 'Dash Strike', desc: 'High Dio: a vampire\'s lunge that passes through and drinks (heals 4%).', speed: 1500, frames: 14, pass: true, hit: { dmg: 88, kb: [380, -380], launch: true }, ev: { 1: () => sfx('dioKnife') }, onHit: a => { a.hp = Math.min(a.maxHp, a.hp + Math.round(a.maxHp * .04)); } });
  const FJ = Mv.shot({ name: 'Knife Storm', desc: 'High Dio: knives rain from above in a wide arc.', proj: { speed: 1100, r: 8, dmg: 22, count: 7, spread: .8, angle: .9, kind: 'spear', color: '#e8e8f0', trail: false }, ev: { 2: () => sfx('dioKnife') } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'dio_fult', name: 'OVER HEAVEN: THE WORLD', desc: 'High Dio: time stops for nine seconds and he uses every one. A wall of knives, the road roller, a hundred Muda. Blockable. Must connect.', pose: 'cast_up', s: 40, dmg: 1300, color: '#ffd35a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'OVER HEAVEN: THE WORLD', dur: 9.0, tc: [1.0, 4.4], tf: 5.4, c1: '#ffd35a', c2: '#fff0a0', c3: '#201840', motif: 'barrage', pose: ['taunt', 'cast_up', 'punch', 'victory'], actorForm: true, cap1: 'THE WORLD.', cap2: 'Toki wo tomare.', title: 'MUDA MUDA MUDA', sub: 'TIME RESUMES', size: 100, flash: '#fff4c0',
      cues: [[0, () => sfx('dioClock', 0, 3)], [1.4, () => sfx('dioStop')], [3.0, () => sfx('dioClock', 0, 6)], [5.4, () => { sfx('dioMuda'); sfx('dioMuda', .6); sfx('dioResume', 1.4); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#0a0818', bot: '#3a2a10', city: '#120a1c', lit: 1 - k, stars: '#ffe08a' }, k); x.save(); x.globalCompositeOperation = 'lighter'; x.strokeStyle = `rgba(255,224,120,${.4 + .4 * k})`; x.lineWidth = 8; const cx = W * .5, cy = H * .3, R = 130 + k * 60; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke(); for (let i = 0; i < 12; i++) { const an = i * .5236; x.beginPath(); x.moveTo(cx + Math.cos(an) * R * .88, cy + Math.sin(an) * R * .88); x.lineTo(cx + Math.cos(an) * R * .98, cy + Math.sin(an) * R * .98); x.stroke(); } x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(t * 6) * R * .8, cy + Math.sin(t * 6) * R * .8); x.stroke(); x.restore(); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 40, w: 760, h: 320, start: f => { f.say('ZA WARUDO! TOKI WO TOMARE!', 100); sfx('dioStop'); }, fire: f => { for (let i = 0; i < 5; i++) Combat.telegraph(f, { x: clamp(f.x + f.facing * (110 + i * 130), 40, Arena.stage.width - 40), r: 46, life: 3 + i * 3, color: '#ffd35a', onFire: h => { Combat.explode(h.x, -70, 70, f, 0, '#ffd35a'); sfx('dioMuda', 0); } }); Cam.shake = 18; sfx('dioResume'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Shirtless, drunk on blood, a longer time stop. Vampire moveset: Knife Fan, Twin Ripper, Blood Geyser, Dash Strike, Knife Storm, and the ultimate OVER HEAVEN: THE WORLD.' });
})();
