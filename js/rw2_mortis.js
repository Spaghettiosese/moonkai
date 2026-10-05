// ============================================================
//  MOONKAI — DR. MORTIS, the Graveyard Surgeon. Pixel remake + a real kit.
//
//  SOULS (new gauge)  every hit his minions land, and every drain, collects a soul. At 100 the next Raise Dead raises a KNIGHT: a
//                     big skeleton with armor and twice the damage.
//  RECYCLING (passive) he heals when his minions hit (as before).
//  PHYLACTERY (rare revival)  once a MATCH (not per round), a lethal blow shatters his phylactery instead: he returns at 25% as the LICH LORD.
//  LICH LORD     LEGION CALL (5S) five skeletons march, SOUL STORM (6S) a sweeping beam of ghosts, OSSUARY (2S) a field of bone
//                spikes, DEATH GRIP (4S) a reaching grab that drains a lot, SKULL BARRAGE (jS).  DANSE MACABRE (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('mortis');
  Object.assign(Sfx, {
    mtWail(d = 0, dur = 1.6) { this.voice({ f: 520, to: 300, dur, vol: .12, type: 'sawtooth', lp: 1800, n: 3, det: 60, delay: d, wet: .9 }); this.nsweep({ f0: 1200, f1: 300, dur, vol: .1, q: 3, delay: d, wet: .8 }); },
    mtBone(d = 0) { this.nsweep({ f0: 3000, f1: 800, dur: .1, vol: .2, type: 'bandpass', q: 3, delay: d }); this.fm({ f: 420, ratio: 3.3, index: 140, dur: .16, vol: .1, delay: d }); },
    mtRise(d = 0) { this.sub({ f: 70, to: 40, dur: .5, vol: .3, delay: d }); this.mtBone(d + .1); this.mtBone(d + .2); this.mtWail(d, .8); },
    mtChant(d = 0, dur = 3) { this.chord({ notes: [87, 110, 131, 175], dur, vol: .22, type: 'sawtooth', lp: 700, delay: d, wet: .9, det: 14 }); this.mtWail(d + .5, dur - .5); },
    mtDrain(d = 0) { this.nsweep({ f0: 200, f1: 3000, dur: .5, vol: .16, q: 2, delay: d, wet: .6 }); this.voice({ f: 120, to: 480, dur: .5, vol: .1, delay: d, wet: .5 }); },
    mtShatter(d = 0) { this.fm({ f: 1800, ratio: 2.76, index: 300, dur: .6, vol: .16, delay: d, wet: .7 }); this.crackle({ dur: .4, vol: .12, delay: d, lo: 1500, hi: 9000 }); this.sub({ f: 60, to: 30, dur: .8, vol: .4, delay: d }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const t = v.anim || 0; if (v.transformed) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(106,255,154,.8)'; c.fillRect(Math.round(P.hip[0] - 26 + Math.sin(t * 2 + i) * 24), Math.round(P.hip[1] - 20 - ((t * 36 + i * 21) % 100)), 3, 5); } c.restore(); } } });
  const soul = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };
  Rw2.merge(def, {
    gauge: { name: 'SOULS', max: 100, color: '#6aff9a', label: f => ((f.gauge || 0) >= 100 ? '· KNIGHT READY' : '') },
    passive: ['Recycling', 'Heals when his minions hit. Every minion hit and every drain collects a SOUL; at 100 his next Raise Dead is a bone KNIGHT.'],
    onRoundStart: f => { f.gauge = 0; },
    onHit: (a, t, dmg, h) => { soul(a, 3); },
  });
  def.revival = { hp: .25, needForm: false, enterForm: true, label: 'PHYLACTERY', say: ['A phylactery... is a spare key.', 'Death is a clerical error.'], meter: 200, when: t => !t.side.mtRevived, onRevive: t => { t.side.mtRevived = true; },
    cutscene: f => PxKit.cineForm(f, { name: 'PHYLACTERY', dur: 5.8, tc: [.8, 3.0], tf: 3.2, c1: '#6aff9a', c2: '#ffffff', c3: '#04140a', motif: 'rise', pose: ['kneel', 'charge', 'victory'], lift: 20, cap1: 'Medically speaking, I am dead.', cap2: 'Professionally, I am just getting started.', title: 'PHYLACTERY', sub: 'THE LICH RETURNS', size: 100,
      cues: [[0, () => sfx('mtShatter')], [1.2, () => sfx('mtChant', 0, 2.2)], [3.2, () => { sfx('mtRise'); sfx('mtWail', 0, 1.4); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#02080a', bot: '#0a3a22', fog: 'rgba(106,255,154,0.12)', ruins: '#04140a', stars: '#9affc0' }, k) }) };
  Combat.hz.mtSpikes = function (h) { const f = h.owner; if (!f) return false; if (h.t === h.at) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r && e.y > -60) { Combat.resolveHit(e, f, H_({ dmg: 58, guard: 'low', hs: 18, kb: [0, -560], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); soul(f, 6); sfx('mtBone'); } return h.t < h.life; };
  Combat.drawHz.mtSpikes = (c, h) => { const up = h.t >= h.at, k = up ? Math.min(1, (h.t - h.at) / 4) : 0, a = Math.min(1, (h.life - h.t) / 12); c.save(); c.globalAlpha = a; if (!up) { c.strokeStyle = 'rgba(106,255,154,.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(h.x, -3, h.r, 6, 0, 0, 7); c.stroke(); } else for (let i = -2; i <= 2; i++) { c.fillStyle = '#ece6cc'; c.strokeStyle = '#4a4630'; c.lineWidth = 2; const x = h.x + i * h.r * .4, H2 = (90 - Math.abs(i) * 20) * k; c.beginPath(); c.moveTo(x - 8, 0); c.quadraticCurveTo(x + (i > 0 ? 8 : -8), -H2 * .6, x + i * 3, -H2); c.quadraticCurveTo(x + 4, -H2 * .5, x + 8, 0); c.closePath(); c.fill(); c.stroke(); } c.restore(); };
  PxKit.setMove(def, '5S', mk({ name: 'Raise Dead', desc: 'Summons a skeleton that walks forward. With a full SOULS gauge it is a bone KNIGHT: bigger, armored, and twice the damage.', pose: 'cast', s: 14, a: 1, r: 20, cd: 3, ai: { min: 100, max: 900, use: 'trap' }, ev: { 3: () => sfx('mtChant', 0, 1.2), 14: f => { const knight = (f.gauge || 0) >= 100; if (knight) f.gauge = 0; Combat.place(f, { kind: 'minion', at: 'front', dx: 70, look: 'skeleton', dmg: knight ? 110 : 55, hp: knight ? 260 : 70, speed: knight ? 260 : 330, color: '#6aff9a', count: 1 }); sfx('mtRise'); if (knight) Game.popWorld(f.x, f.y - f.h - 40, 'BONE KNIGHT', '#6aff9a', 24); } } }));

  const F5 = Mv.place({ name: 'Legion Call', desc: 'Lich Lord: five skeletons claw out of the ground in a line and march.', s: 16, spawn: { kind: 'minion', at: 'front', dx: 50, look: 'skeleton', dmg: 55, hp: 70, speed: 340, color: '#6aff9a', count: 5, spacing: 56, stagger: 5 }, cd: 6, ev: { 3: () => sfx('mtChant', 0, 1.6), 16: () => sfx('mtRise') } });
  const F6 = mk({ name: 'Soul Storm', desc: 'Lich Lord: a sweeping beam of ghosts rakes the stage from floor to sky.', pose: 'cast', s: 18, a: 44, r: 24, cd: 5, ai: { min: 100, max: 1300, use: 'zone' }, ev: { 3: () => sfx('mtWail'), 18: f => { Combat.fireBeam(f, { len: 1400, width: 46, dur: 40, dmg: 18, tick: 5, color: '#6aff9a', core: '#eafff2', angle: .5, sweepTo: -.5, kb: [200, -60], hs: 12 }); sfx('mtDrain'); soul(f, 14); } } });
  const F2 = mk({ name: 'Ossuary', desc: 'Lich Lord: a field of bone spikes erupts in a wide row, then again behind it.', pose: 'cast_up', s: 18, a: 1, r: 26, cd: 5, ai: { min: 100, max: 1100, use: 'zone' }, ev: { 18: f => { for (let i = 0; i < 6; i++) Combat.addHazard({ kind: 'mtSpikes', owner: f, side: f.side, x: clamp(f.x + f.facing * (100 + i * 110), 50, Arena.stage.width - 50), r: 70, life: 60, at: 24 + i * 4, move: F2 }); sfx('mtRise'); } } });
  const F4 = Object.assign(Mv.grab({ name: 'Death Grip', desc: 'Lich Lord: a skeletal hand reaches across the stage, seizes the foe, and drains hard. +30 SOULS.', range: 80, s: 12, grabData: { anim: 'drain', dmg: 220, frames: 46 }, ev: { 4: () => sfx('mtWail', 0, .8) } }), { onHit: a => { Combat.healSelf(a, 90); soul(a, 30); sfx('mtDrain'); } });
  const FJ = Mv.shot({ name: 'Skull Barrage', desc: 'Lich Lord: eight burning skulls rain down in a wide arc.', proj: { speed: 800, angle: 1.0, spread: 1.4, count: 8, r: 13, dmg: 36, kind: 'orb', color: '#6aff9a', core: '#eafff2', life: 1.2 }, ev: { 2: () => sfx('mtWail', 0, .7) } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'mortis_fult', name: 'DANSE MACABRE', desc: 'Lich Lord: every grave in the city opens. The dead dance across the stage and take the living with them. Blockable. Must connect.', pose: 'cast_up', s: 56, dmg: 1300, color: '#6aff9a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'DANSE MACABRE', dur: 8.8, tc: [1.0, 4.8], tf: 5.6, c1: '#6aff9a', c2: '#eafff2', c3: '#04140a', motif: 'barrage', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Every one of them is on the list.', cap2: 'Shall we?', title: 'DANSE MACABRE', sub: 'THE DEAD DANCE', size: 98,
      cues: [[0, () => sfx('mtChant', 0, 3.2)], [1.6, () => sfx('mtRise')], [5.6, () => { sfx('mtWail', 0, 2); sfx('mtRise', .3); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#02080a', bot: '#0c3a24', moon: { x: .5, y: .22, r: 80, col: '#c8ffd8' }, ruins: '#04140a', fog: 'rgba(106,255,154,0.14)', stars: '#9affc0' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 56, w: 1000, h: 340, back: 400, start: f => { f.say('Dance.', 90); sfx('mtChant'); }, fire: f => { Combat.place(f, { kind: 'minion', at: 'front', dx: 60, look: 'skeleton', dmg: 70, hp: 90, speed: 420, color: '#6aff9a', count: 8, spacing: 90, stagger: 3 }); for (const e of Combat.targets(f.side)) e.status.slow = 3; Cam.shake = 16; sfx('mtRise'); sfx('mtWail', 0, 1.6); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Floating lich: stronger drains, bigger army. New moveset: Legion Call, Soul Storm, Ossuary, Death Grip, Skull Barrage, and the ultimate DANSE MACABRE.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'ARMY OF THE DEAD', dur: 8.2, tc: [1.0, 4.2], tf: 5.0, c1: '#6aff9a', c2: '#eafff2', c3: '#04140a', motif: 'pillar', pose: ['idle', 'cast_up', 'cast_up', 'victory'], cap1: 'Medically, they volunteered.', cap2: 'Rise.', title: 'ARMY OF THE DEAD', sub: 'DISCHARGED', size: 94,
    cues: [[0, () => sfx('mtChant', 0, 2.6)], [1.4, () => sfx('mtRise')], [5.0, () => { sfx('mtWail', 0, 1.6); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02080a', bot: '#0c3a24', ruins: '#04140a', fog: 'rgba(106,255,154,0.12)', stars: '#9affc0' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'LICH LORD', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#6aff9a', c2: '#ffffff', c3: '#04140a', motif: 'rise', pose: ['idle', 'cast_up', 'victory'], lift: 50, cap1: 'The surgery was a success.', cap2: 'The patient is me.', title: 'LICH LORD', sub: 'DR. MORTIS', size: 100,
    cues: [[0, () => sfx('mtChant', 0, 2.4)], [1.4, () => sfx('mtDrain')], [3.9, () => { sfx('mtRise'); sfx('mtWail', 0, 1.4); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02080a', bot: '#0c3a24', ruins: '#04140a', fog: 'rgba(106,255,154,0.12)', stars: '#9affc0' }, k) });
})();
