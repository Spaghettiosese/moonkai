// ============================================================
//  MOONKAI — ZEPHYR, the Wind Monk. Rework + pixel remake.
//
//  DRIFT (4S)         floats back and leaves a gust that shoves anything following him.
//  EYE OF THE STORM (awakening)  flight, and a new moveset: Gale Volley (five blades of wind), Typhoon Kick,
//                     Calm Center (a rotating storm around him that pulls the foe in and shields him), Wind Step
//                     (appears above the foe and dives), Sky Pillar (a column of wind on the foe).
//  EYE OF THE STORM / HEAVEN'S BREATH  two ultimates with their own cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('zephyr');
  Object.assign(Sfx, {
    zepGust(d = 0, dur = .6) { this.nsweep({ f0: 400, f1: 3200, dur, vol: .22, q: 1.2, delay: d, wet: .3 }); this.voice({ f: 220, to: 520, dur: dur * .8, vol: .08, type: 'sine', delay: d, wet: .4 }); },
    zepHowl(d = 0, dur = 2.4) { this.nsweep({ f0: 300, f1: 1800, dur, vol: .26, q: 3, delay: d, swell: true, wet: .6 }); this.nsweep({ f0: 1800, f1: 400, dur: dur * .8, vol: .16, q: 3, delay: d + dur * .3, wet: .6 }); this.voice({ f: 140, to: 190, dur, vol: .12, type: 'triangle', n: 3, det: 40, delay: d, swell: true, wet: .5 }); },
    zepKick(d = 0) { this.nsweep({ f0: 700, f1: 5200, dur: .16, vol: .24, type: 'bandpass', q: 1.4, delay: d }); this.fm({ f: 900, ratio: 2.1, index: 140, dur: .14, vol: .08, delay: d, wet: .2 }); },
    zepChime(d = 0) { this.run({ notes: [880, 1175, 1568, 1760], step: .11, dur: 1.2, vol: .1, bell: true, delay: d, wet: .9 }); this.chord({ notes: [220, 330, 440], dur: 2.4, vol: .18, type: 'sine', delay: d, wet: .9 }); },
    zepStep(d = 0) { this.nsweep({ f0: 5000, f1: 500, dur: .14, vol: .2, type: 'highpass', delay: d }); this.voice({ f: 1300, to: 220, dur: .12, vol: .1, delay: d }); },
    zepCrash(d = 0) { this.impact(.9, d); this.zepGust(d, .7); },
  });
  PxModel.install(def, { extra: { front(g, P, s, m) { if (s.atk) { const [hx, hy] = P.fH; for (let i = 0; i < 3; i++) g.line([[hx - 4, hy - 8 + i * 8], [hx + 26 + i * 4, hy - 10 + i * 8]], '#d8fff0', 1.4); } } },
    post(c, v, P, s, m) { const t = v.anim || 0; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < (s.tr ? 14 : 6); i++) { const a = t * (s.tr ? 3 : 1.6) + i * 6.283 / (s.tr ? 14 : 6), r = 30 + (i % 3) * 9; c.fillStyle = i % 2 ? 'rgba(210,255,240,0.7)' : 'rgba(255,255,255,0.6)'; c.fillRect(Math.round(P.sh[0] + Math.cos(a) * r), Math.round(P.sh[1] + 20 + Math.sin(a) * r * .6), 8, 2); } c.restore(); } });
  PxModel.portrait(def);

  Combat.hz.zepGust = function (h) { const f = h.owner; if (!f) return false; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 120 && e.y > -200) { e.x = clamp(e.x + h.dir * 9, 40, Arena.stage.width - 40); } return h.t < h.life; };
  Combat.drawHz.zepGust = (c, h) => { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 22; i++) { const x = h.x + h.dir * (i * 12 + k * 220), y = -40 - (i * 29 % 150); c.fillStyle = i % 2 ? `rgba(220,255,240,${1 - k})` : `rgba(255,255,255,${1 - k})`; c.fillRect(Math.round(x / 3) * 3, Math.round(y / 3) * 3, 22, 3); } c.restore(); };
  Combat.hz.zepEye = function (h) { const f = h.owner; if (!f || f.state === 'ko') return false; h.x = f.x; for (const e of Combat.targets(f.side)) { const d = f.x - e.x; if (Math.abs(d) < 260 && e.y > -240) { e.x += Math.sign(d) * Math.min(Math.abs(d), 6); if (h.t % 14 === 0 && Math.abs(d) < 120) Combat.resolveHit(e, f, H_({ dmg: 14, guard: 'mid', hs: 12, kb: [0, -80], sfx: 'l' }), { proj: true, fromX: h.x }); } } for (const p of Combat.projectiles) if (p.side !== f.side && Math.abs(p.x - f.x) < 200) { p.vx *= .8; p.vy *= .8; } return h.t < h.life; };
  Combat.drawHz.zepEye = (c, h) => { const T = h.t / FPS, a = Math.min(1, h.t / 8, (h.life - h.t) / 12); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; for (let r = 0; r < 4; r++) for (let i = 0; i < 18; i++) { const an = i * .349 + T * (3 - r * .5) * (r % 2 ? -1 : 1), R = 70 + r * 52; c.fillStyle = i % 2 ? '#d8fff0' : '#ffffff'; c.fillRect(Math.round((h.x + Math.cos(an) * R) / 3) * 3, Math.round((-80 + Math.sin(an) * R * .5) / 3) * 3, 14, 3); } glowCircle(c, h.x, -80, 70, 'rgba(180,255,230,0.3)', 'rgba(0,0,0,0)'); c.restore(); };
  Combat.hz.zepPillar = function (h) { const f = h.owner; if (!f) return false; if (h.t === 2) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r) Combat.resolveHit(e, f, H_({ dmg: 88, guard: 'mid', hs: 26, kb: [0, -820], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); return h.t < h.life; };
  Combat.drawHz.zepPillar = (c, h) => { const k = h.t / h.life, a = 1 - k; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const an = i * .55 + h.t * .5, y = -((i * 37 + h.t * 30) % 600), R = h.r * (.5 + .5 * Math.sin(i)) * a; c.fillStyle = i % 2 ? `rgba(210,255,240,${a})` : `rgba(255,255,255,${a})`; c.fillRect(Math.round((h.x + Math.cos(an) * R) / 3) * 3, Math.round(y / 3) * 3, 16, 3); } glowCircle(c, h.x, -20, h.r * 1.3, `rgba(170,255,225,${.4 * a})`, 'rgba(0,0,0,0)'); c.restore(); };

  PxKit.setMove(def, '4S', Object.assign(Mv.teleport({ name: 'Drift', desc: 'Floats backwards out of danger, leaving a gust that shoves anything following him.', to: 'back' }), {}));
  { const m = def.moves['4S'], e = m.ev[m.s - 1]; m.ev[m.s - 1] = f => { Combat.addHazard({ kind: 'zepGust', owner: f, side: f.side, x: f.x, dir: -f.facing, life: 30 }); e(f); sfx('zepStep'); Combat.addHazard({ kind: 'zepGust', owner: f, side: f.side, x: f.x, dir: f.facing, life: 26 }); }; }
  PxKit.setMove(def, '6S', Mv.rush({ name: 'Tornado Kick', desc: 'A spinning airborne kick that shreds as it passes.', pose: 'kick', vy: -200, speed: 950, frames: 18, hit: { dmg: 30, multi: 4, every: 4, kb: [300, -400] }, ev: { 1: () => sfx('zepKick'), 9: () => sfx('zepKick') } }));

  const F5 = Mv.shot({ name: 'Gale Volley', desc: 'Eye of the Storm: five blades of wind fan out from his palm.', proj: { speed: 900, r: 14, dmg: 30, count: 5, spread: .9, kind: 'crescent', color: '#d8fff0', trail: false }, ev: { 2: () => sfx('zepGust') } });
  const F6 = Mv.rush({ name: 'Typhoon Kick', desc: 'Eye of the Storm: a long spinning kick that carries the foe with it.', pose: 'kick', vy: -140, speed: 1100, frames: 26, hit: { dmg: 24, multi: 7, every: 3, kb: [200, -300] }, ev: { 1: () => sfx('zepKick'), 8: () => sfx('zepKick'), 16: () => sfx('zepKick') } });
  const F2 = Mv.custom({ name: 'Calm Center', desc: 'Eye of the Storm: a revolving storm around him for 3s. It pulls the foe in, slows projectiles and shields him.', pose: 'charge', s: 12, a: 1, r: 18, cd: 8, ai: { min: 0, max: 400, use: 'buff' },
    ev: { 12: f => { Combat.buff(f, { shield: 180 }, 3, 'CALM CENTER'); Combat.addHazard({ kind: 'zepEye', owner: f, side: f.side, x: f.x, life: 3 * FPS }); sfx('zepHowl', 0, 1.6); } } });
  const F4 = Mv.teleport({ name: 'Wind Step', desc: 'Eye of the Storm: vanishes and drops from above onto the foe.', to: 'above', hit: { dmg: 70, box: [0, -100, 90, 120], kb: [260, 700], gb: true, guard: 'high' }, pose: 'air_spike', s: 8 });
  { const e = F4.ev[7]; F4.ev[7] = f => { e(f); sfx('zepStep'); }; }
  const FJ = Mv.custom({ name: 'Sky Pillar', desc: 'Eye of the Storm: a column of wind erupts on the foe from above.', pose: 'cast_up', s: 18, a: 1, r: 22, cd: 4, ai: { min: 100, max: 800, use: 'zone' },
    ev: { 18: f => { const t = f.opp; if (!t) return; const x = clamp(t.x + (t.vx || 0) * .4, 60, Arena.stage.width - 60); Combat.telegraph(f, { x, r: 70, life: 24, color: '#d8fff0', column: true, onFire: h => { Combat.addHazard({ kind: 'zepPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 26, move: FJ }); sfx('zepCrash'); Cam.shake = 8; } }); sfx('zepGust'); } } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'zephyr_fult', name: "HEAVEN'S BREATH", desc: 'Eye of the Storm: he inhales until the sky bends, then breathes out a column of wind that scours a whole lane. Blockable. Must connect.', pose: 'charge', s: 62, dmg: 1260, color: '#aaffdd', cutscene: (a, t) => csBreath(a, t) });
  FU.ev = PxKit.zoneEv(FU, { at: 62, w: 1000, h: 300, start: f => { f.say('Be still.', 90); sfx('zepChime'); sfx('riser', 2, .18, 0, 120, 700); }, fire: f => { Combat.addHazard({ kind: 'zepGust', owner: f, side: f.side, x: f.x, dir: f.facing, life: 50 }); Combat.addHazard({ kind: 'zepGust', owner: f, side: f.side, x: f.x + f.facing * 300, dir: f.facing, life: 50 }); Cam.shake = 16; sfx('zepHowl', 0, 2); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Flight and faster wind. New moveset: Gale Volley, Typhoon Kick, Calm Center, Wind Step, Sky Pillar, and the ultimate HEAVEN\'S BREATH.' });
  const U = PxKit.ult({ id: 'zephyr_ult', name: 'EYE OF THE STORM', desc: 'A cyclone kick that draws the foe into the calm of the storm. Blockable. Must connect.', pose: 'kick', s: 38, dmg: 1100, color: '#aaffdd', cutscene: (a, t) => csEye(a, t) });
  U.ev = PxKit.zoneEv(U, { at: 38, w: 520, h: 300, start: f => { sfx('riser', 1.1, .18, 0, 140, 900); }, fire: f => { Combat.addHazard({ kind: 'zepPillar', owner: f, side: f.side, x: f.x + f.facing * 160, r: 140, life: 30, move: U }); Cam.shake = 14; sfx('zepKick'); sfx('zepCrash'); } });
  PxKit.setUlt(def, U); def.ultAct = 'rush'; def.transformCutscene = f => csFlight(f);

  const peak = (x, t, k) => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${lerp(10, 90, k) | 0},${lerp(30, 170, k) | 0},${lerp(40, 200, k) | 0})`); g.addColorStop(1, `rgb(${lerp(20, 210, k) | 0},${lerp(40, 240, k) | 0},${lerp(60, 250, k) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 7; i++) { const cx = ((i * 230 + t * 30) % (W + 300)) - 150; for (let j = 0; j < 3; j++) { x.beginPath(); x.ellipse(cx + j * 50, 120 + (i % 3) * 90, 60, 24, 0, 0, 7); x.fill(); } } x.fillStyle = '#5a7a82'; x.beginPath(); x.moveTo(0, H); x.lineTo(W * .1, H - 260); x.lineTo(W * .22, H - 160); x.lineTo(W * .38, H - 340); x.lineTo(W * .52, H - 120); x.lineTo(W * .7, H - 300); x.lineTo(W * .86, H - 160); x.lineTo(W, H - 240); x.lineTo(W, H); x.fill(); x.fillStyle = '#e8f4f0'; x.fillRect(W * .3, H - 120, W * .35, 120); };
  const streaks = (fx, n, col) => { for (let i = 0; i < n; i++) fx.add({ x: W + 20, y: rand(0, H), vx: rand(-1800, -900), vy: rand(-60, 60), life: 1.1, size: rand(2, 4), color: col, shape: 'rect' }); };
  function csFlight(f) {
    const fx = new ParticleSystem(1200), A = PxKit.actor(f.def);
    return { name: 'EYE OF THE STORM', dur: 5.8, fx,
      cues: [[0, () => sfx('zepChime')], [1.4, () => sfx('zepHowl', 0, 2.6)], [3.0, () => { sfx('zepCrash'); sfx('zepChime', .1); }]],
      draw(c, t) {
        const storm = ease.inOut(seg(t, .8, 3.0)), lift = ease.inOut(seg(t, 1.4, 3.0)), gy = H - 120;
        PxKit.scene(c, x => peak(x, t, 1 - storm * .5), .3);
        A(c, W / 2, gy - lift * 170 + Math.sin(t * 2.4) * 5, 3.0, t, t < 1.4 ? 'idle' : 'cast_up', { transformed: t > 2.9 });
        streaks(fx, 3 + Math.floor(storm * 10), '#d8fff0'); fx.draw(c);
        c.save(); c.globalCompositeOperation = 'lighter'; for (let r = 0; r < 4; r++) for (let i = 0; i < 24; i++) { const an = i * .26 + t * (4 - r) * (r % 2 ? -1 : 1), R = (80 + r * 70) * storm; c.fillStyle = i % 2 ? '#d8fff0' : '#fff'; c.fillRect(Math.round((W / 2 + Math.cos(an) * R * 1.6) / 4) * 4, Math.round((gy - lift * 170 - 170 + Math.sin(an) * R * .5) / 4) * 4, 18, 4); } c.restore();
        caption(c, 'Be still. Even the storm has a center.', t, .3, 3, '#e8fff8'); flashAt(c, t, 2.95, 3.4, '#eafff8');
        titleSlam(c, 'EYE OF THE STORM', 'THE WIND KNOWS HIS NAME', t, 3.7, '#aaffdd', 92);
      } };
  }
  function csEye(a, opp) {
    const fx = new ParticleSystem(1600), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: 'EYE OF THE STORM', dur: 7.2, fx,
      cues: [[0, () => sfx('zepChime')], [1.4, () => sfx('zepHowl', 0, 3)], [3.4, () => sfx('zepKick')], [4.0, () => sfx('zepKick', .1)], [4.6, () => sfx('zepKick', .2)], [5.0, () => sfx('zepCrash')]],
      draw(c, t) {
        const swirl = ease.inOut(seg(t, 1.0, 3.4)), kick = seg(t, 3.4, 5.0), gy = H - 84, ox = W * .6;
        PxKit.scene(c, x => { peak(x, t, .5 - swirl * .3); x.fillStyle = `rgba(20,40,50,${.5 * swirl})`; x.fillRect(0, 0, W, H);
          x.globalCompositeOperation = 'lighter'; for (let r = 0; r < 6; r++) for (let i = 0; i < 26; i++) { const an = i * .24 + t * (5 - r * .5), R = (60 + r * 70) * swirl; x.fillStyle = i % 2 ? 'rgba(210,255,240,0.8)' : 'rgba(255,255,255,0.8)'; x.fillRect(ox + Math.cos(an) * R * 1.5, gy - 190 + Math.sin(an) * R * .55 - r * 22, 22, 5); } x.globalCompositeOperation = 'source-over'; }, .3);
        const spin = kick > 0 ? t * 16 : 0, kx = lerp(W * .18, ox - 120, ease.in(kick));
        c.save(); c.translate(kx, gy - 150 * Math.sin(kick * Math.PI)); c.rotate(kick > 0 ? spin : 0); A(c, 0, 140, 2.8, t, kick > 0 ? 'kick' : 'cast', { transformed: false }); c.restore();
        const hit = t - 5.0; if (hit < .1) silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4 - swirl * 30, os, -1, { pose: kick > .6 ? 'hurt_air' : 'block', anim: t, transformed: opp.transformed }), '#1a5a58'); else { const k = seg(hit, .1, 1.2); silhouette(c, o => { o.save(); o.translate(ox + k * 420, gy - 100 - k * 220 + k * k * 300); o.rotate(k * 9); drawCharAt(o, opp.def, 0, 0, os, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }); o.restore(); }, '#1a5a58'); }
        streaks(fx, 2, '#d8fff0'); fx.draw(c);
        caption(c, 'Come into the quiet.', t, .3, 3.2, '#e8fff8'); flashAt(c, t, 5.0, 5.5, '#eafff8');
        if (t > 5.9) titleSlam(c, 'EYE OF THE STORM', 'CALM', t, 6.0, '#aaffdd', 96);
      } };
  }
  function csBreath(a, opp) {
    const fx = new ParticleSystem(1800), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: "HEAVEN'S BREATH", dur: 8.4, fx,
      cues: [[0, () => sfx('zepChime')], [1.0, () => sfx('riser', 3.2, .22, 0, 100, 900)], [4.4, () => { sfx('zepHowl', 0, 3); sfx('boom'); }], [4.5, () => sfx('zepCrash')], [6.0, () => sfx('zepChime')]],
      draw(c, t) {
        const inhale = ease.inOut(seg(t, 1.0, 4.4)), out = t - 4.4, gy = H - 90, mx = W * .26 + 70, my = gy - 250;
        PxKit.scene(c, x => { peak(x, t, 1 - inhale * .7); x.fillStyle = `rgba(0,10,16,${.55 * inhale})`; x.fillRect(0, 0, W, H);
          if (inhale > 0 && out < 0) { x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 60; i++) { const an = i * 2.4, R = (700 - ((t * 400 + i * 40) % 700)) * 1, px_ = mx + Math.cos(an) * R * 1.6, py = my + Math.sin(an) * R * .6; x.fillStyle = 'rgba(210,255,240,0.8)'; x.fillRect(px_, py, 22 * (1 - R / 700) + 6, 4); } x.globalCompositeOperation = 'source-over'; }
          if (out > 0) { const w = 200 * Math.min(1, out * 5) * (1 - seg(out, 1.6, 3)) + 6; x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 90; i++) { const px_ = mx + ((i * 71 + out * 2400) % (W - mx)), py = my + (((i * 37) % 200) - 100) * (w / 200); x.fillStyle = i % 3 ? 'rgba(210,255,240,0.85)' : 'rgba(255,255,255,0.9)'; x.fillRect(px_, py, 60, 6); } x.fillStyle = `rgba(150,255,220,${.3 * (1 - seg(out, 1.6, 3))})`; x.fillRect(mx, my - w, W, w * 2); x.globalCompositeOperation = 'source-over'; }
          x.fillStyle = '#16282c'; x.fillRect(0, gy, W, H - gy); }, .3);
        A(c, W * .26, gy - 30 + Math.sin(t * 2.4) * 4, 3.0, t, out < 0 ? 'charge' : 'cast', { transformed: true });
        const ox = W * .74; if (out < 0.1) silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4, os, -1, { pose: 'block', anim: t, transformed: opp.transformed }), out > 0 ? '#ffffff' : '#1a5a58'); else { const k = seg(out, .1, 1.8); silhouette(c, o => { o.save(); o.translate(ox + k * 600, gy - k * 200); o.rotate(k * 6); drawCharAt(o, opp.def, 0, 0, os, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }); o.restore(); }, '#1a5a58'); }
        streaks(fx, 2 + (out > 0 ? 6 : 0), '#d8fff0'); fx.draw(c);
        caption(c, 'Everything that moves is a breath.', t, .3, 4.2, '#e8fff8'); flashAt(c, t, 4.4, 4.9, '#eafff8');
        if (t > 6.2) titleSlam(c, "HEAVEN'S BREATH", 'SILENCE FOLLOWS', t, 6.3, '#aaffdd', 100);
      } };
  }
})();
