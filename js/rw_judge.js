// ============================================================
//  MOONKAI — THE JUDGE. Rework + pixel remake.
//
//  GUILTY (passive)   five hits mark the foe; the marked take +20% damage. Contempt (4S) now stacks a mark too.
//  SUPREME COURT (awakening)  a golden robe, and a new moveset: Subpoena (three gavels), Overruled! (armored charge
//                     that erases projectiles), Cross-Examination (a counter), Contempt of Court (bars that drain),
//                     Gavel of Justice (a diving slam).
//  FINAL VERDICT / SUPREME VERDICT  two ultimates, each a trial.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('judge');
  Object.assign(Sfx, {
    judGavel(d = 0) { this.fm({ f: 180, ratio: 1.6, index: 500, dur: .35, vol: .3, delay: d, wet: .5 }); this.impact(.7, d); this.nsweep({ f0: 4000, f1: 800, dur: .1, vol: .2, type: 'highpass', delay: d }); },
    judOrder(d = 0) { this.voice({ f: 130, to: 120, dur: .6, vol: .26, type: 'sawtooth', lp: 700, n: 3, det: 14, delay: d, wet: .6 }); this.judGavel(d + .05); },
    judBars(d = 0) { for (let i = 0; i < 5; i++) this.fm({ f: 520 + i * 30, ratio: 3.2, index: 300, dur: .3, vol: .08, delay: d + i * .05, wet: .4 }); this.nsweep({ f0: 800, f1: 3000, dur: .3, vol: .1, delay: d }); },
    judOrgan(d = 0, dur = 2.6) { this.chord({ notes: [98, 147, 196, 247, 294], dur, vol: .3, type: 'sawtooth', lp: 1100, delay: d, wet: .95, det: 10 }); },
    judVerdict(d = 0) { this.fm({ f: 98, ratio: 2.76, index: 700, dur: 3.2, vol: .4, delay: d, wet: .9 }); this.sub({ f: 65, to: 30, dur: 1.6, vol: .5, delay: d }); this.judGavel(d); },
    judBell(d = 0) { this.fm({ f: 392, ratio: 1.41, index: 260, dur: 2.2, vol: .22, delay: d, wet: .8 }); },
  });
  PxModel.install(def, { extra: { front(g, P, s, m) { if (s.atk) g.line([[P.fH[0] + 18, P.fH[1] - 26], [P.fH[0] + 30, P.fH[1] - 12]], '#ffffff', 1.3); } },
    post(c, v, P, s, m) { c.save(); c.globalCompositeOperation = 'lighter'; const [hx, hy] = P.head; glowCircle(c, hx + 7, hy - 2, 7, 'rgba(224,224,255,0.9)', 'rgba(0,0,0,0)'); if (s.tr) for (let i = 0; i < 6; i++) { const a = (v.anim || 0) * 1.4 + i * 1.05; c.fillStyle = '#ffd35a'; c.fillRect(Math.round(P.sh[0] + Math.cos(a) * 36), Math.round(P.sh[1] + 10 + Math.sin(a) * 18), 4, 6); } c.restore(); } });
  PxModel.portrait(def);

  // the bars of Contempt: a jail cell that stuns and then keeps draining
  Combat.hz.judBars = function (h) { const f = h.owner; if (!f) return false; const e = h.who; if (!e || e.state === 'ko') return false; h.x = e.x; if (h.t === 2) { e.status.stun = Math.max(e.status.stun || 0, 1.4); Combat.resolveHit(e, f, H_({ dmg: 26, guard: 'unblock', hs: 20, kb: [0, 0], sfx: 'm' }), { proj: true, fromX: h.x, move: h.move }); } if (h.t > 2 && h.t % 30 === 0 && e.hp > 1) { e.hp = Math.max(1, e.hp - 6); e.red = Math.max(e.red, e.hp); } return h.t < h.life; };
  Combat.drawHz.judBars = (c, h) => { const k = Math.min(1, h.t / 8), a = Math.min(1, (h.life - h.t) / 14); c.save(); c.globalAlpha = a; c.fillStyle = '#9a9aa8'; for (let i = -3; i <= 3; i++) c.fillRect(Math.round((h.x + i * 22) / 3) * 3 - 3, -230 * k, 6, 230 * k); c.fillRect(h.x - 82, -232 * k, 164, 8); c.fillStyle = '#ffd35a'; c.fillRect(h.x - 8, -240 * k, 16, 12); c.restore(); };
  Combat.hz.judGavels = function (h) { const f = h.owner; if (!f) return false; if (h.t === h.at) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r) Combat.resolveHit(e, f, H_({ dmg: h.dmg, guard: 'mid', hs: 24, kb: [0, -520], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); return h.t < h.life; };
  Combat.drawHz.judGavels = (c, h) => { const k = Math.min(1, h.t / h.at), y = lerp(-700, -20, k * k); c.save(); c.fillStyle = '#6b4a2a'; c.fillRect(h.x - 5, y - 140, 10, 140); c.fillStyle = '#e0e0ff'; c.fillRect(h.x - 38, y - 8, 76, 40); c.fillStyle = '#ffd35a'; c.fillRect(h.x - 38, y - 8, 76, 6); if (h.t >= h.at) { c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -20, 90 * (1 - (h.t - h.at) / (h.life - h.at)), 'rgba(224,224,255,0.7)', 'rgba(0,0,0,0)'); } c.restore(); };

  // base rework: Contempt-adjacent guilt stacks, Jail Cell uses the new bars
  PxKit.setMove(def, '4S', Mv.custom({ name: 'Jail Cell', desc: 'Bars close around the foe: stunned, then drained a little each half-second. Counts as a hit toward GUILTY.', pose: 'cast', s: 16, a: 1, r: 22, cd: 6, ai: { min: 100, max: 700, use: 'trap' },
    ev: { 4: () => sfx('judOrder'), 16: f => { const t = f.opp; if (!t) return; Combat.addHazard({ kind: 'judBars', owner: f, side: f.side, who: t, x: t.x, life: 80, move: def.moves['4S'] }); f.guilty = (f.guilty || 0) + 1; sfx('judBars'); } } }));
  PxKit.setMove(def, '2S', Mv.custom({ name: 'Sentence', desc: 'A gavel falls from above onto where the foe is going.', pose: 'cast_up', s: 18, a: 1, r: 22, cd: 2, ai: { min: 80, max: 900, use: 'zone' },
    ev: { 18: f => { const t = f.opp; if (!t) return; const x = clamp(t.x + (t.vx || 0) * .35, 60, Arena.stage.width - 60); Combat.telegraph(f, { x, r: 70, life: 26, color: '#e0e0ff', column: true, onFire: h => { Combat.addHazard({ kind: 'judGavels', owner: f, side: f.side, x: h.x, r: h.r, at: 6, dmg: 92, life: 22, move: def.moves['2S'] }); sfx('judGavel'); Cam.shake = 8; } }); } } }));

  // ---- SUPREME COURT moveset ----
  const F5 = Mv.shot({ name: 'Subpoena', desc: 'Supreme Court: three gavels fly out in a fan and come back for a second pass.', proj: { speed: 720, r: 15, dmg: 40, count: 3, spread: .7, kind: 'hammer', color: '#ffd35a', boomerang: .5, life: 2.5 }, ev: { 3: () => sfx('judOrder') } });
  const F6 = Mv.rush({ name: 'Overruled!', desc: 'Supreme Court: an armored charge that erases every projectile in front of it.', speed: 1000, frames: 18, armor: [1, 22], hit: { dmg: 118, kb: [740, -300], wb: true }, ev: { 1: f => { for (const p of Combat.projectiles) if (p.side !== f.side && (p.x - f.x) * f.facing > 0 && Math.abs(p.x - f.x) < 640) p.life = 0; sfx('judOrder'); } } });
  const F2 = Object.assign(Mv.counter({ name: 'Cross-Examination', desc: 'Supreme Court: a long counter stance. Anything that hits her is answered from behind, and the foe is marked GUILTY at once.', window: 42, dmg: 130 }), { ev: { 2: () => sfx('judBars') } });
  const F4 = Mv.custom({ name: 'Contempt of Court', desc: 'Supreme Court: two sets of bars close in a row, each stunning and each draining 6 life every half-second.', pose: 'cast', s: 14, a: 1, r: 24, cd: 9, ai: { min: 100, max: 800, use: 'trap' },
    ev: { 14: f => { const t = f.opp; if (!t) return; Combat.addHazard({ kind: 'judBars', owner: f, side: f.side, who: t, x: t.x, life: 120, move: F4 }); t.status.mark = 6; Game.popWorld(t.x, t.y - t.h - 30, 'GUILTY!', '#ffd35a', 22); sfx('judBars'); sfx('judOrder'); } } });
  const FJ = Mv.dive({ name: 'Gavel of Justice', desc: 'Supreme Court: a golden gavel comes down with her, bouncing the foe and marking them.', vx: 260, vy: 1500, hit: { dmg: 112, gb: true }, ev: { 1: () => sfx('judOrder') } });
  const FU = PxKit.ult({ id: 'judge_fult', name: 'SUPREME VERDICT', desc: 'Supreme Court: the court of courts convenes. Seven justices pass seven sentences, and the last one is final. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1280, color: '#ffd35a', cutscene: (a, t) => csSupreme(a, t) });
  FU.ev = PxKit.trackEv(FU, { at: 54, r: 140, color: '#ffd35a', start: f => { f.say('All rise.', 90); sfx('judOrgan', 0, 3); sfx('riser', 1.8, .2, 0, 90, 700); }, fire: (f, x) => { for (let i = -1; i <= 1; i++) Combat.addHazard({ kind: 'judGavels', owner: f, side: f.side, x: clamp(x + i * 110, 50, Arena.stage.width - 50), r: 70, at: 4 + (i + 1) * 3, dmg: 20, life: 26, move: FU }); Cam.shake = 22; sfx('judVerdict'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Every hit counts double toward GUILTY. New moveset: Subpoena, Overruled!, Cross-Examination, Contempt of Court, Gavel of Justice, and the ultimate SUPREME VERDICT.' });
  const U = PxKit.ult({ id: 'judge_ult', name: 'FINAL VERDICT', desc: 'A single gavel the size of a building. The cosmic court is in session. Blockable. Must connect.', pose: 'cast_up', s: 46, dmg: 1150, color: '#e0e0ff', cutscene: (a, t) => csVerdict(a, t) });
  U.ev = PxKit.trackEv(U, { at: 46, r: 120, color: '#e0e0ff', start: f => { f.say('Order! ORDER!', 80); sfx('judOrgan', 0, 2.2); }, fire: (f, x) => { Combat.addHazard({ kind: 'judGavels', owner: f, side: f.side, x, r: 130, at: 3, dmg: 10, life: 30, move: U }); Cam.shake = 20; sfx('judVerdict'); } });
  PxKit.setUlt(def, U); def.transformCutscene = f => csBench(f);

  const court = (x, t, k, gold) => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05050e'); g.addColorStop(1, `rgb(${lerp(24, 70, k) | 0},${lerp(24, 60, k) | 0},${lerp(50, 80, k) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H); x.fillStyle = '#10101e'; for (let i = 0; i < 8; i++) { x.fillRect(60 + i * 160, 0, 46, H - 70); x.fillStyle = '#1c1c34'; x.fillRect(60 + i * 160, 0, 8, H - 70); x.fillStyle = '#10101e'; } x.fillStyle = gold ? '#4a3a10' : '#2a1c10'; x.fillRect(0, H - 70, W, 70); x.fillStyle = gold ? '#ffd35a' : '#6b4a2a'; x.fillRect(0, H - 70, W, 6); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(224,224,255,${.05 + .06 * k})`; x.beginPath(); x.moveTo(110 + i * 220, 0); x.lineTo(40 + i * 220, H); x.lineTo(160 + i * 220, H); x.lineTo(210 + i * 220, 0); x.fill(); } x.globalCompositeOperation = 'source-over'; };
  function csBench(f) {
    const fx = new ParticleSystem(700), A = PxKit.actor(f.def);
    return { name: 'SUPREME COURT', dur: 5.8, fx,
      cues: [[0, () => sfx('judBell')], [1.4, () => sfx('judOrgan', 0, 2.4)], [2.6, () => { sfx('judGavel'); sfx('judVerdict'); }]],
      draw(c, t) {
        const k = ease.inOut(seg(t, .6, 2.6)), gy = H - 70;
        PxKit.scene(c, x => { court(x, t, k, t > 2.6); // nine empty seats along the high bench fill with robed shadows
          x.fillStyle = '#1a1a2e'; x.fillRect(W * .2, gy - 150, W * .6, 150); for (let i = 0; i < 9; i++) { const kk = ease.out(seg(t, 1.0 + i * .12, 1.8 + i * .12)); x.fillStyle = '#05050c'; x.fillRect(W * .22 + i * 106, gy - 210 * kk - 20, 56, 210 * kk); x.fillStyle = '#e0e0ff'; x.fillRect(W * .22 + i * 106 + 20, gy - 210 * kk + 10, 8, 6); } }, .3);
        A(c, W * .5, gy + 4, 3.0, t, t < 2.6 ? 'taunt' : 'victory', { transformed: t > 2.6 });
        if (t > 2.6 && t < 2.9) { c.save(); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.restore(); }
        fx.draw(c); caption(c, 'This court is now in session.', t, .3, 2.6, '#e8e8ff'); flashAt(c, t, 2.6, 3.0, '#fff4c8');
        titleSlam(c, 'SUPREME COURT', 'THERE IS NO APPEAL', t, 3.6, '#ffd35a', 108);
      } };
  }
  const trial = (a, opp, name, gold, cuesx, title, sub, final) => { };
  function csVerdict(a, opp) {
    const fx = new ParticleSystem(1400), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: 'FINAL VERDICT', dur: 7.6, fx,
      cues: [[0, () => sfx('judBell')], [1.2, () => sfx('judOrder')], [2.4, () => sfx('judOrgan', 0, 2.6)], [4.4, () => sfx('riser', 1.2, .22, 0, 80, 900)], [5.6, () => { sfx('judVerdict'); sfx('boom'); }]],
      draw(c, t) {
        const gy = H - 70, ox = W * .66, rise = ease.inOut(seg(t, 2.4, 4.6)), drop = ease.in(seg(t, 4.6, 5.6)), hit = t - 5.6, dock = seg(t, 1.2, 2.2);
        PxKit.scene(c, x => { court(x, t, .6, false);
          // the witness stand and a scale of justice tipping against the foe
          x.fillStyle = '#2a1c10'; x.fillRect(ox - 90, gy - 70, 180, 70); x.strokeStyle = '#ffd35a'; x.lineWidth = 6; x.beginPath(); x.moveTo(W * .5, 120); x.lineTo(W * .5, 260); x.stroke(); const tip = ease.inOut(seg(t, 2.4, 3.8)) * 30; x.beginPath(); x.moveTo(W * .5 - 120, 150 - tip); x.lineTo(W * .5 + 120, 150 + tip); x.stroke(); x.fillStyle = '#ffd35a'; x.fillRect(W * .5 - 140, 150 - tip, 40, 8); x.fillRect(W * .5 + 100, 150 + tip, 40, 8);
          // the gavel: a pillar of stone coming down from the dark
          const gyv = lerp(-700, gy - 60, drop * drop); x.fillStyle = '#6b4a2a'; x.fillRect(ox - 30, gyv - 900, 60, 900); x.fillStyle = '#e0e0ff'; x.fillRect(ox - 170, gyv - 80, 340, 140); x.fillStyle = '#ffd35a'; x.fillRect(ox - 170, gyv - 80, 340, 16);
        }, .3);
        A(c, W * .2, gy + 4, 2.8, t, t < 2.4 ? 'taunt' : 'cast_up', { transformed: false });
        if (hit < 0.05) silhouette(c, o => drawCharAt(o, opp.def, ox, gy - 70 + 4, os, -1, { pose: t > 2.4 ? 'stun' : 'block', anim: t, transformed: opp.transformed }), '#40408a');
        else silhouette(c, o => drawCharAt(o, opp.def, ox, gy - 70 + 4 + Math.min(60, hit * 120), os, -1, { pose: 'kneel', anim: t, transformed: opp.transformed }), '#20204a');
        if (hit > 0 && hit < .15) for (let i = 0; i < 40; i++) fx.add({ x: ox + rand(-90, 90), y: gy - rand(0, 80), vx: rand(-700, 700), vy: rand(-700, -100), life: 1.1, size: rand(5, 11), color: pick(['#e0e0ff', '#ffd35a', '#ffffff']), glow: true, g: 700 });
        fx.draw(c);
        if (t < 2.4) caption(c, 'The defendant will rise.', t, .3, 2.3, '#e8e8ff'); else if (t < 5.4) caption(c, 'The court finds you...', t, 2.5, 5.3, '#e8e8ff');
        flashAt(c, t, 5.55, 6.0, '#ffffff');
        if (t > 6.2) titleSlam(c, 'GUILTY.', 'FINAL VERDICT', t, 6.3, '#ffd35a', 140);
      } };
  }
  function csSupreme(a, opp) {
    const fx = new ParticleSystem(1800), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: 'SUPREME VERDICT', dur: 9.0, fx,
      cues: [[0, () => sfx('judBell')], [1.2, () => sfx('judOrgan', 0, 3)], [2.6, () => sfx('judGavel')], [3.2, () => sfx('judGavel', .1)], [3.8, () => sfx('judGavel', .1)], [4.4, () => sfx('judGavel', .1)], [5.0, () => sfx('judGavel', .1)], [5.6, () => sfx('judGavel', .1)], [6.2, () => sfx('judGavel', .1)], [6.9, () => { sfx('judVerdict'); sfx('boom'); }]],
      draw(c, t) {
        const gy = H - 70, ox = W * .66, n = Math.max(0, Math.min(7, Math.floor((t - 2.6) / .6) + 1)), last = seg(t, 6.2, 6.9), hit = t - 6.9;
        PxKit.scene(c, x => { court(x, t, .8, true);
          // seven justices on the bench, each raising a gavel in turn
          x.fillStyle = '#1a1a2e'; x.fillRect(W * .08, gy - 200, W * .84, 200);
          for (let i = 0; i < 7; i++) { const lit = n > i; x.fillStyle = '#05050c'; x.fillRect(W * .1 + i * 150, gy - 380, 72, 180); x.fillStyle = lit ? '#ffd35a' : '#e0e0ff'; x.fillRect(W * .1 + i * 150 + 26, gy - 360, 8, 6); x.fillRect(W * .1 + i * 150 + 40, gy - 360, 8, 6); if (lit) { x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(255,211,90,0.5)'; x.fillRect(W * .1 + i * 150 - 20, gy - 460 - 20 * Math.abs(Math.sin(t * 12 + i)), 110, 70); x.globalCompositeOperation = 'source-over'; } }
          if (last > 0) { x.fillStyle = '#e0e0ff'; x.fillRect(ox - 200, lerp(-300, gy - 240, last * last), 400, 170); x.fillStyle = '#ffd35a'; x.fillRect(ox - 200, lerp(-300, gy - 240, last * last), 400, 18); }
        }, .3);
        A(c, W * .18, gy + 4, 2.8, t, t < 2.6 ? 'taunt' : 'cast_up', { transformed: true });
        if (hit < 0.05) silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4, os, -1, { pose: n > 2 ? 'stun' : 'block', anim: t, transformed: opp.transformed }), '#6a5a20'); else silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4 + Math.min(40, hit * 90), os, -1, { pose: 'kneel', anim: t, transformed: opp.transformed }), '#4a3c10');
        if (n > 0 && n <= 7 && t < 6.2) { const age = (t - 2.6) % .6; if (age < .12) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, ox, gy - 100, 120, 'rgba(255,211,90,0.6)', 'rgba(0,0,0,0)'); c.restore(); } }
        if (hit > 0 && hit < .15) for (let i = 0; i < 50; i++) fx.add({ x: ox + rand(-120, 120), y: gy - rand(0, 100), vx: rand(-800, 800), vy: rand(-800, -100), life: 1.3, size: rand(5, 12), color: pick(['#e0e0ff', '#ffd35a', '#ffffff']), glow: true, g: 700 });
        fx.draw(c);
        if (t < 2.6) caption(c, 'All rise for the court of courts.', t, .3, 2.5, '#e8e8ff'); else if (t < 6.2) caption(c, ['Guilty.', 'Guilty.', 'Guilty.', 'Guilty.', 'Guilty.', 'Guilty.', 'Guilty.'][Math.min(6, n - 1)] || 'Guilty.', t, 2.7, 6.1, '#ffe9a0');
        flashAt(c, t, 6.85, 7.4, '#fffbe0');
        if (t > 7.5) titleSlam(c, 'SUPREME VERDICT', 'SEVEN SENTENCES. ONE END.', t, 7.6, '#ffd35a', 88);
      } };
  }
})();
