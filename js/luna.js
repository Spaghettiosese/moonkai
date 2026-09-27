// ============================================================
//  MOONKAI — LUNA, the Eclipse (rebuilt). Eric's older sister.
//
//  GAUGE   · PHASE (4 pips)  her own moon turns on its own every 4 seconds:
//                    NEW → CRESCENT → HALF → FULL → NEW...
//                    NEW       she half-fades from sight; Eclipse Step is invincible.
//                    CRESCENT  her crescents curve hard and home in.
//                    HALF      Moonbeam falls twice.
//                    FULL      +20% damage, giant crescents, Moonbeam falls three times.
//  PASSIVE · MOONBORN  every third hit of a combo restores 1% health.
//  SUPER · PHASE SHIFT  forces the FULL moon now (and holds it for 6s), releasing a ring of
//                    eight crescents outward.
//  BLOOD MOON        ultimate: the moon turns red and slowly comes down on the foe. It tracks.
// ============================================================
const lnSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const LUNA = charById('luna');
const LN_PHASES = ['NEW MOON', 'CRESCENT', 'HALF MOON', 'FULL MOON'];
const LN_PAL = { build: 'slim', skin: '#e8d8e0', top: '#1a1040', topDark: '#0e0828', pants: '#1a1040', pantsDark: '#0e0828', boots: '#0a0818', skirt: '#2a1a5a', glove: '#1a1040', noFace: true };
const LN_EMP_PAL = Object.assign({}, LN_PAL, { top: '#0a0a1a', skirt: '#140a2a' });
const lnPhase = f => f.lnPhase || 0;

function drawLunaMoon(c, x, y, r, phase, red) {
  c.save(); c.fillStyle = red ? '#ff4a6a' : '#e8ecff'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  const cover = [1, 0.55, 0, -1][phase]; if (cover > -1) { c.fillStyle = '#0a0818'; c.beginPath(); c.arc(x - r * (1 - cover) * 1.1 - (cover === 0 ? r : 0), y, r * (cover === 0 ? 1 : 1.02), 0, Math.PI * 2); if (cover === 0) { c.rect(x - r - 1, y - r - 1, r + 1, 2 * r + 2); } c.fill(); }
  c.restore();
}
function drawLuna(c, v) {
  const t = v.anim || 0, E = !!v.transformed, ph = lnPhase(v), m = v.move;
  if (ph === 0 && !m) c.globalAlpha *= 0.55;
  if (ph === 3 || E) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -80, 110, E ? 'rgba(106,74,255,0.25)' : 'rgba(200,210,255,0.2)', 'rgba(0,0,0,0)'); c.restore(); }
  drawHumanoid(c, v, E ? LN_EMP_PAL : LN_PAL, {
    back(c, P) {
      // her moonborn tail (like her brother's) and a star-flecked cape
      c.strokeStyle = '#6a4a3a'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(P.hip[0] - 4, P.hip[1] + 4); c.quadraticCurveTo(P.hip[0] - 30, P.hip[1] + 20 + Math.sin(t * 3) * 8, P.hip[0] - 36, P.hip[1] - 10 + Math.sin(t * 2) * 10); c.stroke();
      c.fillStyle = E ? '#0a0014' : '#140c30'; c.beginPath(); c.moveTo(P.sh[0] - 8, P.sh[1]); c.quadraticCurveTo(P.sh[0] - 30, P.hip[1], P.sh[0] - 40, P.hip[1] + 60); c.lineTo(P.sh[0] + 4, P.hip[1] + 56); c.closePath(); c.fill();
      for (let i = 0; i < 6; i++) circle(c, P.sh[0] - 30 + (i * 13) % 34, P.hip[1] + 10 + (i * 17) % 44, 1, '#dde');
      if (E) { c.fillStyle = '#ff4a6a'; c.beginPath(); c.moveTo(P.sh[0] - 36, P.hip[1] + 58); c.lineTo(P.sh[0] + 2, P.hip[1] + 54); c.lineTo(P.sh[0] - 2, P.hip[1] + 50); c.lineTo(P.sh[0] - 32, P.hip[1] + 52); c.fill(); }
      // her moon floats behind her head
      drawLunaMoon(c, P.head[0] - 24, P.head[1] - 22, 10, ph, E);
    },
    head(c, P) {
      const [hx, hy] = P.head;
      c.fillStyle = '#e0e4f8'; c.beginPath(); c.moveTo(hx - 8, hy - 8); c.quadraticCurveTo(hx - 26, hy + 16, hx - 18, hy + 44); c.lineTo(hx - 4, hy + 10); c.closePath(); c.fill();      // long silver hair
      shadedHead(c, hx, hy, 10.5, '#e8d8e0');
      c.fillStyle = '#e0e4f8'; c.beginPath(); c.moveTo(hx - 11, hy + 2); c.quadraticCurveTo(hx - 8, hy - 15, hx + 6, hy - 12); c.quadraticCurveTo(hx + 13, hy - 8, hx + 11, hy - 1); c.lineTo(hx + 6, hy - 6); c.lineTo(hx + 2, hy - 3); c.quadraticCurveTo(hx - 4, hy - 6, hx - 11, hy + 2); c.fill();
      c.strokeStyle = '#1a1040'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx + 3, hy - 3); c.lineTo(hx + 10, hy - 2.5); c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 1, E ? 6 : 4, E ? 'rgba(255,74,106,1)' : 'rgba(192,200,255,1)', 'rgba(0,0,0,0)'); c.restore();
      c.strokeStyle = '#6a5a7a'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + 4, hy + 5.5); c.quadraticCurveTo(hx + 7, hy + 6.5, hx + 10, hy + 5); c.stroke();                // a thin smirk
      c.fillStyle = '#c0c8ff'; c.beginPath(); c.arc(hx - 2, hy - 10, 4, 0.6, Math.PI * 1.6); c.arc(hx - 1, hy - 11, 3, Math.PI * 1.6, 0.6, true); c.fill();                              // crescent circlet
    },
    front(c, P) { // a crescent blade held low
      c.save(); c.translate(P.fH[0], P.fH[1]); c.rotate(m ? -0.4 : 0.9); c.fillStyle = E ? '#ff8aa0' : '#c0c8ff'; c.strokeStyle = '#2a1a5a'; c.lineWidth = 1;
      c.beginPath(); c.arc(0, -18, 22, -0.3, Math.PI + 0.3); c.arc(0, -12, 18, Math.PI + 0.3, -0.3, true); c.closePath(); c.fill(); c.stroke(); c.restore();
    },
  });
  c.globalAlpha = 1;
}
function drawLunaPortrait(c, opts) {
  const E = !!opts.form;
  c.fillStyle = '#05030e'; c.fillRect(0, 0, 100, 100);
  for (let i = 0; i < 18; i++) circle(c, (i * 47) % 100, (i * 29) % 60, 0.8, '#dde');
  drawLunaMoon(c, 78, 20, 16, 3, E);
  c.fillStyle = '#e0e4f8'; c.beginPath(); c.moveTo(26, 36); c.quadraticCurveTo(12, 70, 18, 100); c.lineTo(82, 100); c.quadraticCurveTo(88, 70, 74, 36); c.fill();
  c.fillStyle = E ? '#0a0a1a' : '#1a1040'; c.beginPath(); c.moveTo(14, 100); c.lineTo(28, 78); c.lineTo(72, 78); c.lineTo(86, 100); c.fill();
  c.fillStyle = '#e8d8e0'; c.strokeStyle = '#7a6a7a'; c.lineWidth = 1.1;
  c.beginPath(); c.moveTo(36, 38); c.lineTo(64, 38); c.lineTo(64, 56); c.lineTo(57, 68); c.lineTo(50, 71); c.lineTo(43, 68); c.lineTo(36, 56); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#e0e4f8'; c.beginPath(); c.moveTo(33, 50); c.quadraticCurveTo(32, 28, 50, 28); c.quadraticCurveTo(68, 28, 67, 50); c.lineTo(60, 38); c.lineTo(48, 42); c.lineTo(40, 38); c.closePath(); c.fill();
  c.fillStyle = '#c0c8ff'; c.beginPath(); c.arc(50, 30, 7, 0.6, Math.PI * 1.6 + 0.8); c.arc(52, 29, 5, Math.PI * 1.6 + 0.8, 0.6, true); c.fill();
  for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 4, 51); c.quadraticCurveTo(50 + s * 9, 49, 50 + s * 14, 51); c.quadraticCurveTo(50 + s * 9, 53, 50 + s * 4, 51); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50 + s * 9, 51, E ? 7 : 5, E ? 'rgba(255,74,106,1)' : 'rgba(192,200,255,1)', 'rgba(0,0,0,0)'); c.restore(); circle(c, 50 + s * 9, 51, 1.2, '#1a1040');
    c.strokeStyle = '#1a1040'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(50 + s * 3, 48.5); c.lineTo(50 + s * 14, 48); c.stroke(); }
  c.strokeStyle = '#6a5a7a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(45, 62); c.quadraticCurveTo(51, 64, 57, 61); c.stroke();
}

// ---------------- kit ----------------
const lnCres = (f, extra = {}) => { const ph = lnPhase(f); return Object.assign({ speed: 800, r: ph === 3 ? 26 : 16, dmg: ph === 3 ? 70 : ph === 0 ? 48 : 58, kind: 'crescent', color: f.form ? '#ff8aa0' : '#c0c8ff', angle: -0.2, homing: ph === 1 ? 3 : 1.2, trail: false, life: 2.2, hs: 14, kb: [220, -120] }, extra); };
const LN_CRES = mk({ name: 'Crescent', desc: 'A curving moon blade. CRESCENT: homes in hard. FULL: giant.', pose: 'cast', s: 12, a: 1, r: 18, ai: { min: 200, max: 1400, use: 'zone' },
  ev: { 12: f => Combat.fireShots(f, lnCres(f)) } });
const LN_STEP = Object.assign(Mv.teleport({ name: 'Eclipse Step', desc: 'Vanishes and strikes from behind. NEW MOON: invincible.', to: 'behind', hit: { dmg: 85 } }), { onStart: f => { if (lnPhase(f) === 0) f.invul = Math.max(f.invul, 24); } });
const LN_BEAM = mk({ name: 'Moonbeam', desc: 'Silver light falls on the foe. HALF: twice. FULL: three times.', pose: 'cast_up', s: 12, a: 1, r: 20, ai: { min: 150, max: 1600, use: 'zone' },
  ev: { 12: f => { const n = [1, 1, 2, 3][lnPhase(f)], o = f.opp; for (let i = 0; i < n; i++) Combat.telegraph(f, { x: clamp((o ? o.x : f.x) + (i - (n - 1) / 2) * 80, 30, Arena.stage.width - 30), r: 50, life: 24 + i * 10, color: '#c0c8ff', column: true, follow: i ? null : o, track: 0.05,
    onFire: h => { for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < 60) Combat.resolveHit(t, f, H_({ dmg: 70, guard: 'mid', hs: 16, kb: [0, -500], launch: true, sfx: 'm' }), { proj: true, fromX: h.x, move: LN_BEAM }); Combat.addHazard({ kind: 'lnBeam', owner: f, side: f.side, x: h.x, life: 14 }); } }); } } });
const LN_REFLECT = Mv.counter({ name: 'Lunar Reflection', desc: 'Reflecting counter.', resp: 'reflect', window: 24 });
const LN_FALL = mk({ name: 'Falling Crescents', desc: 'Two crescents downward.', pose: 'air_heavy', s: 10, a: 1, r: 14, air: true, ev: { 10: f => Combat.fireShots(f, lnCres(f, { speed: 900, count: 2, spread: 0.4, angle: 0.8, homing: 0, r: 14 })) } });
const LN_SUPER = superize(mk({ name: 'Phase Shift', desc: 'Forces the FULL moon now and holds it for 6s, releasing a ring of eight crescents outward.', pose: 'cast_up', s: 14, a: 10, r: 20,
  ev: { 14: f => { f.lnPhase = 3; f.lnHold = 6 * FPS; f.lnT = 0; for (let i = 0; i < 8; i++) { Combat.fireShots(f, lnCres(f, { speed: 700, homing: 0, count: 1, angle: i * Math.PI / 4, dmg: 45, r: 20, pierce: true })); const p = Combat.projectiles[Combat.projectiles.length - 1]; p.x = f.x; p.y = f.y - 80; }
    Game.popWorld(f.x, f.y - f.h - 40, 'FULL MOON', '#e8ecff', 26); lnSfx('bell'); Cam.shake = 6; } } }), 100);
const LN_ULT = superize(mk({ name: 'BLOOD MOON', desc: 'The moon turns red and slowly comes down on the foe, tracking them. Blockable. Must connect.', pose: 'cast_up', s: 80, a: 10, r: 30,
  ev: { 1: f => { f.say('Look up, little brother.', 80); lnSfx('charge', 0.8); const t = f.opp; f.lnTele = Combat.telegraph(f, { x: t ? t.x : f.x, follow: t, track: 0.1, r: 130, life: 999, color: '#ff4a6a', column: true }); },
    80: f => { const x = f.lnTele ? f.lnTele.x : f.x; if (f.lnTele) f.lnTele.life = 0; f.lnTele = null;
      Combat.strikeZone(f, { x: x - 130, y: -320, w: 260, h: 326 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: LN_ULT, fromX: x });
      Combat.addHazard({ kind: 'lnBeam', owner: f, side: f.side, x, life: 26, red: true }); Cam.shake = 14; lnSfx('boom'); } } }), 300);
LN_ULT.id = 'luna_ult'; LN_ULT.recoverWhiff = 40;
LN_ULT.ult = { dmg: 1150, cutscene: (a, t) => csLunaBloodMoon(a, t), fx: { el: 'moon', color: '#ff4a6a' } };

Object.assign(LUNA, {
  role: 'Moon phases · Mixup · Crescents', handArt: true, draw: drawLuna, drawPortrait: drawLunaPortrait, transformCutscene: f => csLunaEclipse(f),
  gauge: { name: 'PHASE', max: 4, color: '#c0c8ff', pips: true, label: f => '· ' + LN_PHASES[lnPhase(f)] },
  passiveDmg: f => (lnPhase(f) === 3 ? 1.2 : 1),
  moves: { '5S': LN_CRES, '6S': LN_STEP, '2S': LN_BEAM, '4S': LN_REFLECT, 'jS': LN_FALL },
  super: LN_SUPER, ult: LN_ULT, ultAct: 'strike',
  form: Object.assign(LUNA.form, { desc: 'Permanent. Dark moon aura; her phases turn twice as fast and she lingers on the FULL moon.', model: undefined }),
});
for (const [slot, m] of Object.entries(LUNA.moves)) { m.id = 'luna_' + slot; m.slot = slot; m.owner = 'luna'; if (slot === 'jS') m.air = true; }
LN_SUPER.id = 'luna_super';
LUNA.onRoundStart = f => { f.lnPhase = 0; f.lnT = 0; f.lnHold = 0; };
LUNA.passiveTick = f => {
  if (f.lnHold > 0) { f.lnHold--; f.gauge = 4; return; }
  const len = (f.form ? (lnPhase(f) === 3 ? 240 : 120) : 240);
  if (++f.lnT >= len) { f.lnT = 0; f.lnPhase = (lnPhase(f) + 1) % 4; Game.popWorld(f.x, f.y - f.h - 30, LN_PHASES[f.lnPhase], '#c0c8ff', 16); }
  f.gauge = lnPhase(f) + 1;
};
Combat.hz.lnBeam = h => h.t < h.life;
Combat.drawHz.lnBeam = (c, h) => { const k = h.t / h.life, w = (h.red ? 260 : 90) * (1 - k * 0.5); c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(h.x - w / 2, 0, h.x + w / 2, 0); const col = h.red ? '255,74,106' : '210,220,255'; g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},${1 - k})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(h.x - w / 2, -1400, w, 1406); c.restore(); };

// ---------------- cinematics ----------------
function csLunaEclipse(f) {
  const d = f.def;
  return {
    name: 'ECLIPSE EMPRESS', dur: 4, fx: new ParticleSystem(300),
    cues: [[0.2, () => lnSfx('charge', 0.5)], [2.2, () => { lnSfx('boom'); lnSfx('bell'); }]],
    draw(c, t) {
      c.fillStyle = '#05030e'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) circle(c, (i * 173) % W, (i * 97) % (H - 100), 1, '#dde');
      // the eclipse: a dark disc slides over the moon until only a burning ring remains
      const k = ease.inOut(seg(t, 0.2, 2.2)), mx = W / 2, my = H * 0.33, r = 120;
      c.fillStyle = '#e8ecff'; c.beginPath(); c.arc(mx, my, r, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#05030e'; c.beginPath(); c.arc(mx + (1 - k) * 260, my, r * 0.98, 0, Math.PI * 2); c.fill();
      if (k > 0.95) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#ff4a6a'; c.lineWidth = 6; c.beginPath(); c.arc(mx, my, r + 4, 0, Math.PI * 2); c.stroke(); glowCircle(c, mx, my, r * 1.8, 'rgba(160,60,255,0.3)', 'rgba(0,0,0,0)'); c.restore(); }
      drawCharAt(c, d, W / 2, H - 40, 2.6, 1, { pose: t < 2.2 ? 'cast_up' : 'victory', anim: t, transformed: t > 2.2 });
      caption(c, 'Every night you looked up, it was me looking back.', t, 0.2, 2.1, '#dde');
      titleSlam(c, 'ECLIPSE EMPRESS', 'THE MOON IS MINE', t, 2.3, '#b08aff', 90);
    },
  };
}
function csLunaBloodMoon(a, opp) {
  const fx = new ParticleSystem(1600), city = makeCineCity(22, 150, 380), baseY = H - 30, oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'BLOOD MOON', dur: 6.6, fx,
    cues: [[0, () => lnSfx('charge', 1)], [2.0, () => lnSfx('heartbeat')], [3.6, () => { lnSfx('boom'); lnSfx('boom', 0.3); }]],
    draw(c, t) {
      const red = seg(t, 0.4, 1.8);
      c.fillStyle = `rgb(${Math.round(5 + 40 * red)},${Math.round(3 * (1 - red))},${Math.round(14 + 6 * red)})`; c.fillRect(0, 0, W, H);
      const k = ease.in(seg(t, 1.8, 3.6)), r = lerp(80, 700, k), my = lerp(H * 0.25, H * 0.9, k);
      c.save(); c.fillStyle = `rgb(${Math.round(232 + 23 * red)},${Math.round(236 - 162 * red)},${Math.round(255 - 149 * red)})`; c.beginPath(); c.arc(W / 2, my, r, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(120,20,40,0.35)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(W / 2 + Math.cos(i * 1.7) * r * 0.5, my + Math.sin(i * 2.3) * r * 0.4, r * 0.12, 0, Math.PI * 2); c.fill(); } c.restore();
      if (t < 3.6) {
        drawCineCity(c, city, baseY, '#0a0206');
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.6, baseY, oppScale, -1, { pose: t < 2 ? 'idle' : 'block', anim: t, transformed: opp.transformed }), '#1a0408');
        drawCharAt(c, a.def, W * 0.2, baseY, 2.4, 1, { pose: 'cast_up', anim: t, transformed: true });
        caption(c, 'Look up, little brother.', t, 0.2, 1.7, '#ffb0c0'); caption(c, 'The moon is mine.', t, 2.0, 3.4, '#ffb0c0');
      } else {
        for (const b of city) b.dead = true;
        if (t < 3.8) for (let i = 0; i < 60; i++) fx.add({ x: W / 2 + rand(-400, 400), y: baseY - rand(0, 80), vx: rand(-1200, 1200), vy: rand(-1200, -100), life: 1.8, size: rand(5, 16), color: pick(['#ff4a6a', '#5a0a1a', '#ffd0d8']), shape: 'rect', g: 900 });
        fx.draw(c); flashAt(c, t, 3.6, 4.0, '#ffd0d8');
        if (t > 4.6) titleSlam(c, 'BLOOD MOON', 'LOOK UP', t, 4.7, '#ff4a6a', 100);
      }
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('luna:')) delete PortraitCache[k]; });
