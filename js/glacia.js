// ============================================================
//  MOONKAI — GLACIA, the Frozen Throne (rebuilt).
//
//  GAUGE   · ICE RESERVE  her own supply of ice. Walls and spikes are built from it; it
//                    regrows slowly when she isn't spending it (twice as fast in ABSOLUTE ZERO).
//  PASSIVE · FROSTBITE    her ice CHILLS the foe (a stack each hit, max 5; decays). At 5 stacks
//                    they FREEZE SOLID for a moment. Hitting a frozen foe SHATTERS the ice for
//                    bonus damage. She deals +15% to anyone chilled.
//  ETERNAL WINTER    ultimate: a slow blizzard wall walks across the stage. Blockable. Must connect.
// ============================================================
const glSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const GLACIA = charById('glacia');
const GL_PAL = { build: 'curvy', skin: '#d8e8f4', top: '#5aa0d8', topDark: '#2a6090', pants: '#e8f6ff', pantsDark: '#bcd8ea', boots: '#9cd', skirt: '#bfe6ff', glove: '#e8f6ff', noFace: true, noHead: false };
const GL_FORM_PAL = Object.assign({}, GL_PAL, { top: '#8ad0ff', topDark: '#4a90c0', skin: '#c8e4f8' });
const glChill = (a, t, n = 1) => {
  if (!t || t.state === 'ko' || t.status.freeze || (t.glImmune || 0) > 0) return;
  Combat.mark(t, a, 'chill', n, { max: 5, dur: 4, color: '#9ff', label: 'CHILL', onMax: (tt) => {
    delete tt.marks.chill; tt.status.freeze = 1.1; tt.glImmune = 3 * FPS; tt.move = null;
    Game.popWorld(tt.x, tt.y - tt.h - 40, 'FROZEN SOLID', '#bff', 24); glSfx('ice') || glSfx('clang'); Cam.shake = 6;
  } });
};
const glSpend = (f, n) => { if ((f.gauge || 0) < n) { Game.popWorld(f.x, f.y - f.h - 30, 'NOT ENOUGH ICE', '#9cd', 16); return false; } f.gauge -= n; f.iceIdle = 0; return true; };

function drawGlaciaStaff(c, x, y, ang, F) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.strokeStyle = '#dff'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, 0); c.lineTo(90, 0); c.stroke();
  c.fillStyle = 'rgba(200,245,255,0.9)'; c.strokeStyle = '#6ac'; c.lineWidth = 1.2;
  for (const [a, l] of [[0, 30], [-0.6, 20], [0.6, 20], [-1.2, 12], [1.2, 12]]) { c.save(); c.translate(90, 0); c.rotate(a); c.beginPath(); c.moveTo(0, -4); c.lineTo(l, 0); c.lineTo(0, 4); c.closePath(); c.fill(); c.stroke(); c.restore(); }
  c.globalCompositeOperation = 'lighter'; glowCircle(c, 94, 0, F ? 26 : 16, 'rgba(150,240,255,0.9)', 'rgba(0,0,0,0)');
  c.restore();
}
function drawGlacia(c, v) {
  const t = v.anim || 0, F = !!v.transformed, m = v.move;
  if (F) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -70, 130, 'rgba(140,230,255,0.18)', 'rgba(0,0,0,0)'); c.restore(); }
  drawHumanoid(c, v, F ? GL_FORM_PAL : GL_PAL, {
    back(c, P) {
      // long frost cape and a train of ice
      c.fillStyle = F ? '#e8fbff' : '#bfe6ff'; c.strokeStyle = '#6aa8d0'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(P.sh[0] - 8, P.sh[1]); c.quadraticCurveTo(P.sh[0] - 40, P.hip[1], P.sh[0] - 50 - Math.sin(t * 2) * 5, P.hip[1] + 56); c.lineTo(P.sh[0] - 6, P.hip[1] + 50); c.closePath(); c.fill(); c.stroke();
      for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(220,250,255,0.8)'; c.beginPath(); c.moveTo(P.sh[0] - 46 + i * 10, P.hip[1] + 52); c.lineTo(P.sh[0] - 42 + i * 10, P.hip[1] + 64 + (i % 2) * 6); c.lineTo(P.sh[0] - 38 + i * 10, P.hip[1] + 52); c.fill(); }
    },
    chest(c, P) {
      const x = lerp(P.hip[0], P.sh[0], 0.6), y = lerp(P.hip[1], P.sh[1], 0.6);
      c.strokeStyle = '#fff'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; c.beginPath(); c.moveTo(x - Math.cos(a) * 6, y - Math.sin(a) * 6); c.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); c.stroke(); }
    },
    head(c, P) {
      const [hx, hy] = P.head;
      // white hair falling long behind; pale, still face; the crown is a ring of icicles
      c.fillStyle = '#f4fbff'; c.beginPath(); c.moveTo(hx - 10, hy - 8); c.quadraticCurveTo(hx - 24, hy + 20, hx - 18, hy + 40); c.lineTo(hx - 4, hy + 10); c.closePath(); c.fill();
      shadedHead(c, hx, hy, 11, F ? '#c8e4f8' : '#d8e8f4');
      c.fillStyle = '#f4fbff'; c.beginPath(); c.moveTo(hx - 11, hy - 1); c.quadraticCurveTo(hx - 8, hy - 14, hx + 4, hy - 12); c.quadraticCurveTo(hx + 12, hy - 10, hx + 11, hy - 4); c.quadraticCurveTo(hx + 2, hy - 8, hx - 11, hy - 1); c.fill();
      c.strokeStyle = '#2a4a6a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx + 3, hy - 3); c.lineTo(hx + 10, hy - 2); c.stroke();          // half-lidded
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 1, F ? 6 : 3.5, 'rgba(120,230,255,1)', 'rgba(0,0,0,0)'); c.restore();
      c.strokeStyle = '#6a8aa8'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + 5, hy + 6); c.lineTo(hx + 10, hy + 6); c.stroke();
      c.fillStyle = 'rgba(200,245,255,0.95)'; c.strokeStyle = '#4a9ac8';
      for (let i = 0; i < 5; i++) { const x = hx - 8 + i * 4.5, h = [8, 12, 16, 12, 8][i] * (F ? 1.4 : 1); c.beginPath(); c.moveTo(x - 2, hy - 11); c.lineTo(x, hy - 11 - h); c.lineTo(x + 2, hy - 11); c.closePath(); c.fill(); c.stroke(); }
    },
    front(c, P) {
      const cast = m && (m.pose === 'cast' || m.pose === 'cast_up' || m.pose === 'shoot');
      drawGlaciaStaff(c, P.fH[0], P.fH[1], cast ? -0.4 : ({ victory: -1.5, heavy: 0.5, dash: 0.2, hurt: 2 }[v.pose] ?? -1.35), F);
    },
  });
}
function drawGlaciaPortrait(c, opts) {
  const F = !!opts.form;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, '#0a2a4a'); g.addColorStop(1, '#020a1e'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 20; i++) circle(c, (i * 37) % 100, (i * 53) % 100, 1, '#fff');
  c.fillStyle = '#f4fbff'; c.beginPath(); c.moveTo(26, 40); c.quadraticCurveTo(16, 80, 20, 100); c.lineTo(80, 100); c.quadraticCurveTo(84, 80, 74, 40); c.fill();
  c.fillStyle = F ? '#8ad0ff' : '#5aa0d8'; c.beginPath(); c.moveTo(10, 100); c.lineTo(28, 78); c.lineTo(72, 78); c.lineTo(90, 100); c.fill();
  c.fillStyle = F ? '#c8e4f8' : '#d8e8f4'; c.strokeStyle = '#6a8aa8'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(36, 40); c.lineTo(64, 40); c.lineTo(64, 58); c.lineTo(57, 70); c.lineTo(50, 73); c.lineTo(43, 70); c.lineTo(36, 58); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#f4fbff'; c.beginPath(); c.moveTo(34, 50); c.quadraticCurveTo(34, 32, 50, 32); c.quadraticCurveTo(66, 32, 66, 50); c.quadraticCurveTo(56, 40, 50, 42); c.quadraticCurveTo(42, 40, 34, 50); c.fill();
  // cold, half-lidded eyes that look through you
  for (const s of [-1, 1]) {
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 4, 53); c.quadraticCurveTo(50 + s * 9, 51, 50 + s * 14, 53); c.quadraticCurveTo(50 + s * 9, 55, 50 + s * 4, 53); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50 + s * 9, 53.4, F ? 7 : 4, 'rgba(120,230,255,1)', 'rgba(0,0,0,0)'); c.restore(); circle(c, 50 + s * 9, 53.4, 1.4, '#08324a');
    c.strokeStyle = '#2a4a6a'; c.lineWidth = 2; c.beginPath(); c.moveTo(50 + s * 3, 51.5); c.lineTo(50 + s * 14, 51); c.stroke();
  }
  c.strokeStyle = '#7a9ab8'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(45, 65); c.lineTo(55, 65); c.stroke();
  c.fillStyle = 'rgba(200,245,255,0.95)'; c.strokeStyle = '#4a9ac8';
  for (let i = 0; i < 7; i++) { const x = 32 + i * 6, h = [8, 14, 20, 28, 20, 14, 8][i] * (F ? 1.3 : 1); c.beginPath(); c.moveTo(x - 2.5, 34); c.lineTo(x, 34 - h); c.lineTo(x + 2.5, 34); c.closePath(); c.fill(); c.stroke(); }
}

// ---------------- kit ----------------
const GL_SHARDS = Mv.shot({ name: 'Frost Shards', desc: 'Three shards; each hit CHILLS. Free.', proj: { speed: 760, r: 9, dmg: 30, count: 3, spread: 0.3, kind: 'shard', color: '#bff', onHit: (t, p) => glChill(p.owner, t) } });
const GL_WALL = mk({ name: 'Ice Wall', desc: 'Raises a wall that blocks projectiles and launches (30 ice).', pose: 'cast', s: 14, a: 1, r: 20, cd: 3, ai: { min: 200, max: 1200, use: 'trap' },
  ev: { 14: f => { if (glSpend(f, 30)) Combat.place(f, { kind: 'wall', at: 'front', dx: 90, w: 40, hgt: 160, hp: 300, life: 5, dmg: 70, style: 'ice', colors: ['#dff', '#9cf'], limit: 1 }); } } });
const GL_PERMA = mk({ name: 'Permafrost', desc: 'Ice spikes under the foe (20 ice). CHILLS twice. On a frozen foe: SHATTER for big damage.', pose: 'cast', s: 14, a: 1, r: 20, ai: { min: 150, max: 1400, use: 'zone' },
  ev: { 14: f => { if (!glSpend(f, 20)) return; const o = f.opp; const x = o ? o.x : f.x + f.facing * 300;
    Combat.telegraph(f, { x, r: 60, life: 26, color: '#bff', onFire: h => {
      for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < 70 && t.y > -140) {
        const shatter = !!t.status.freeze; if (shatter) { t.status.freeze = 0; Game.popWorld(t.x, t.y - t.h - 40, 'SHATTER', '#fff', 26); Cam.shake = 10; }
        const r = Combat.resolveHit(t, f, H_({ dmg: shatter ? 150 : 65, guard: 'low', hs: shatter ? 30 : 20, kb: [100, -700], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: GL_PERMA });
        if (r === 'hit' && !shatter) glChill(f, t, 2);
      }
      Combat.addHazard({ kind: 'glSpikes', owner: f, side: f.side, x: h.x, life: 30 }); glSfx('clang');
    } }); } } });
const GL_MIRROR = Mv.counter({ name: 'Mirror of Ice', desc: 'Freezing counter: reflects and CHILLS the attacker to 5 (instant freeze).', resp: 'reflect', window: 22 });
const GL_HAIL = Mv.shot({ name: 'Hailstorm', desc: 'Shards rain diagonally; each hit CHILLS.', proj: { speed: 800, r: 9, dmg: 26, count: 4, spread: 0.5, angle: 0.7, kind: 'shard', color: '#bff', onHit: (t, p) => glChill(p.owner, t) } });
const GL_SUPER = superize(mk({ name: 'Glacier Rise', desc: 'A rolling wave of ice spikes. Every spike CHILLS. Free.', pose: 'cast', s: 14, a: 1, r: 26,
  ev: { 14: f => { for (let i = 0; i < 8; i++) Combat.telegraph(f, { x: clamp(f.x + f.facing * (100 + i * 80), 30, Arena.stage.width - 30), r: 44, life: 8 + i * 4, color: '#dff', onFire: h => {
    for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < 55 && t.y > -140) { const r = Combat.resolveHit(t, f, H_({ dmg: 55, guard: 'low', hs: 14, kb: [80, -500], launch: true, sfx: 'm' }), { proj: true, fromX: h.x, move: GL_SUPER }); if (r === 'hit') glChill(f, t); }
    Combat.addHazard({ kind: 'glSpikes', owner: f, side: f.side, x: h.x, life: 26 }); } }); glSfx('clang'); } } }), 100);
const GL_ULT = superize(mk({ name: 'ETERNAL WINTER', desc: 'A slow blizzard wall walks across the whole stage. Blockable. Must connect.', pose: 'cast_up', s: 30, a: 20, r: 30,
  ev: { 2: f => { f.say('Winter does not end.', 80); glSfx('charge', 0.5); }, 30: f => { Combat.addHazard({ kind: 'glBlizzard', owner: f, side: f.side, x: f.x + f.facing * 60, dir: f.facing, life: 260 }); } } }), 300);
GL_ULT.id = 'glacia_ult'; GL_ULT.recoverWhiff = 30;
GL_ULT.ult = { dmg: 1100, cutscene: (a, t) => csGlaciaWinter(a, t), fx: { el: 'ice', color: '#bff' } };

Object.assign(GLACIA, {
  role: 'Control · Ice reserve · Freeze & shatter', handArt: true, draw: drawGlacia, drawPortrait: drawGlaciaPortrait, transformCutscene: f => csGlaciaZero(f),
  weaponTip: 110,
  gauge: { name: 'ICE RESERVE', max: 100, color: '#9ff' },
  passive: ['Frostbite', 'Her ice CHILLS (max 5 stacks). At 5 the foe FREEZES SOLID; Permafrost on a frozen foe SHATTERS. +15% damage to anyone chilled.'],
  passiveDmg: (f, t) => (t && (Combat.markCount(t, 'chill') > 0 || t.status.freeze) ? 1.15 : 1),
  moves: { '5S': GL_SHARDS, '6S': GL_WALL, '2S': GL_PERMA, '4S': GL_MIRROR, 'jS': GL_HAIL },
  super: GL_SUPER, ult: GL_ULT, ultAct: 'shot',
  form: Object.assign(GLACIA.form, { desc: 'Permanent. A freezing aura CHILLS anyone who stays close, and her ICE RESERVE regrows twice as fast.', model: undefined,
    tick(f) { const o = f.opp; if (o && Math.abs(o.x - f.x) < 240 && f.st % 50 === 0) glChill(f, o); } }),
});
for (const [slot, m] of Object.entries(GLACIA.moves)) { m.id = 'glacia_' + slot; m.slot = slot; m.owner = 'glacia'; if (slot === 'jS') m.air = true; }
GL_SUPER.id = 'glacia_super';
GLACIA.onRoundStart = f => { f.gauge = 100; f.iceIdle = 0; };
GLACIA.onHit = (a, t) => { if (a.move && (a.move.kind === 'normal' || a.move === GL_MIRROR)) glChill(a, t, a.move === GL_MIRROR ? 5 : 1); };
GLACIA.passiveTick = f => {
  f.iceIdle = (f.iceIdle || 0) + 1;
  if (f.iceIdle > 45 && f.st % (f.form ? 3 : 6) === 0) f.gauge = Math.min(100, (f.gauge || 0) + 1);
  const o = f.opp; if (o && o.glImmune > 0) o.glImmune--;
};
Combat.hz.glSpikes = h => h.t < h.life;
Combat.drawHz.glSpikes = (c, h) => {
  const k = h.t / h.life, up = Math.min(1, h.t / 5) * (1 - Math.max(0, k - 0.7) / 0.3);
  c.save(); c.fillStyle = 'rgba(210,248,255,0.95)'; c.strokeStyle = '#4a9ac8'; c.lineWidth = 1.5;
  for (const [dx, hh] of [[-30, 70], [-12, 120], [8, 150], [26, 90]]) { c.beginPath(); c.moveTo(h.x + dx - 10, 0); c.lineTo(h.x + dx, -hh * up); c.lineTo(h.x + dx + 10, 0); c.closePath(); c.fill(); c.stroke(); }
  c.restore();
};
Combat.hz.glBlizzard = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  h.x += h.dir * 5.2;
  if (!h.done) for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < 70) {
    const r = Combat.resolveHit(t, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: h.x - h.dir * 40, move: GL_ULT });
    if (r) h.done = true;
  }
  if (h.t % 3 === 0) Game.fx.add({ x: h.x + rand(-60, 60), y: -rand(0, 320), vx: h.dir * rand(200, 500), vy: rand(-40, 80), life: 0.6, size: rand(3, 7), color: '#fff', glow: true });
  return !h.done && h.t < h.life && h.x > -100 && h.x < Arena.stage.width + 100;
};
Combat.drawHz.glBlizzard = (c, h) => {
  c.save(); const g = c.createLinearGradient(h.x - 90, 0, h.x + 90, 0); g.addColorStop(0, 'rgba(200,240,255,0)'); g.addColorStop(0.5, 'rgba(220,248,255,0.55)'); g.addColorStop(1, 'rgba(200,240,255,0)');
  c.fillStyle = g; c.fillRect(h.x - 90, -380, 180, 386);
  c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 2; for (let i = 0; i < 8; i++) { const y = -((h.t * 9 + i * 47) % 380); c.beginPath(); c.moveTo(h.x - 60, y); c.lineTo(h.x + 60 * h.dir, y + 20); c.stroke(); }
  c.restore();
};

// ---------------- cinematics ----------------
function csGlaciaZero(f) {
  const d = f.def;
  return {
    name: 'ABSOLUTE ZERO', dur: 4, fx: new ParticleSystem(600),
    cues: [[0, () => glSfx('charge', 0.4)], [1.6, () => glSfx('clang')], [2.3, () => { glSfx('boom'); }]],
    draw(c, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#020a1e'); g.addColorStop(1, '#4a8aba'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const k = seg(t, 0, 2.3);
      // frost creeps in from the edges of the screen
      c.save(); c.strokeStyle = 'rgba(230,250,255,0.8)'; c.lineWidth = 2;
      for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, r0 = Math.max(W, H) * 0.7, r1 = r0 * (1 - 0.55 * ease.out(k)); c.beginPath(); c.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0); c.lineTo(W / 2 + Math.cos(a + 0.05) * r1, H / 2 + Math.sin(a + 0.05) * r1); c.stroke(); }
      c.restore();
      // a throne of ice rises behind her
      c.fillStyle = 'rgba(200,240,255,0.85)'; c.strokeStyle = '#4a9ac8'; c.lineWidth = 2;
      for (let i = -3; i <= 3; i++) { const hh = (260 - Math.abs(i) * 50) * ease.out(seg(t, 0.6, 2)); c.beginPath(); c.moveTo(W / 2 + i * 60 - 30, H - 60); c.lineTo(W / 2 + i * 60, H - 60 - hh); c.lineTo(W / 2 + i * 60 + 30, H - 60); c.closePath(); c.fill(); c.stroke(); }
      drawCharAt(c, d, W / 2, H - 60, 2.6, 1, { pose: t < 2.3 ? 'cast_up' : 'victory', anim: t, transformed: t > 2.2 });
      caption(c, 'Be still.', t, 0.1, 1.5, '#dff');
      flashAt(c, t, 2.3, 2.6, '#eaffff');
      titleSlam(c, 'ABSOLUTE ZERO', 'THE WORLD STOPS', t, 2.4, '#9ff', 90);
    },
  };
}
function csGlaciaWinter(a, opp) {
  const fx = new ParticleSystem(2000), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'ETERNAL WINTER', dur: 6.4, fx,
    cues: [[0, () => glSfx('charge', 0.6)], [2.6, () => glSfx('clang')], [4.0, () => { glSfx('boom'); glSfx('clang'); }]],
    draw(c, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#020a1e'); g.addColorStop(1, '#6aaad8'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = '#dff'; c.fillRect(0, H - 60, W, 60);
      if (Math.random() < 0.95) for (let i = 0; i < 6; i++) fx.add({ x: -20, y: rand(0, H), vx: rand(600, 1100), vy: rand(-60, 120), life: 1.6, size: rand(2, 5), color: '#fff' });
      fx.draw(c);
      if (t < 2.6) {
        drawCharAt(c, a.def, W * 0.2, H - 60, 2.4, 1, { pose: 'cast_up', anim: t });
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.75, H - 60, oppScale, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#1a3a5a');
        caption(c, 'Winter does not end.', t, 0.2, 2.4, '#dff');
      } else {
        // the foe is sealed in a glacier, then it cracks
        const k = seg(t, 2.6, 3.4), cr = seg(t, 3.4, 4.0);
        silhouette(c, o => drawCharAt(o, opp.def, W / 2, H - 60, oppScale * 1.2, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }), '#1a3a5a');
        if (t < 4.0) {
          c.fillStyle = `rgba(200,240,255,${0.75 * ease.out(k)})`; c.strokeStyle = '#fff'; c.lineWidth = 3;
          c.beginPath(); c.moveTo(W / 2 - 200, H - 60); c.lineTo(W / 2 - 230, H - 360); c.lineTo(W / 2 - 60, H - 470); c.lineTo(W / 2 + 180, H - 420); c.lineTo(W / 2 + 220, H - 60); c.closePath(); c.fill(); c.stroke();
          c.strokeStyle = '#fff'; c.lineWidth = 2; for (let i = 0; i < 10 * cr; i++) { c.beginPath(); c.moveTo(W / 2, H - 260); let x = W / 2, y = H - 260; for (let j = 0; j < 4; j++) { x += Math.cos(i * 1.7 + j) * 50; y += Math.sin(i * 2.3 + j) * 50; c.lineTo(x, y); } c.stroke(); }
          caption(c, 'It waits.', t, 2.8, 3.9, '#dff');
        } else {
          if (t < 4.2) for (let i = 0; i < 30; i++) fx.add({ x: W / 2 + rand(-200, 200), y: H - rand(60, 460), vx: rand(-900, 900), vy: rand(-900, 200), life: 1.4, size: rand(8, 22), color: pick(['#dff', '#fff', '#9cf']), shape: 'rect', rot: rand(0, 6), vr: rand(-10, 10), g: 1200 });
          flashAt(c, t, 4.0, 4.3, '#fff');
          if (t > 4.5) titleSlam(c, 'ETERNAL WINTER', 'SHATTERED', t, 4.6, '#9ff', 90);
        }
      }
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('glacia:')) delete PortraitCache[k]; });
