// ============================================================
//  MOONKAI — AURELION, the Self-Made God (bespoke, pixel engine).
//
//  SIN            Most of his blows brand the foe with Sin (gold sigils, max 5). At five Sins,
//                 JUDGMENT: a pillar of light tracks and smites them (unblockable).
//  KNEEL          His lunge spends 3 Sins to force the foe to their knees (long stun).
//  HOLY GROUND    Plants the greatsword: enemy projectiles burn away inside the circle, foes
//                 standing in it accrue Sin, and he takes less damage there.
//  YOU DARE?      Parry. Striking a god brands you with two Sins.
//  SERAPHIM ASCENDANT  permanent awakening: six wings of light, Trinity Edict, bigger Judgment,
//                 and Holy Ground becomes the CATHEDRAL: a vast sanctum with blades at its edges.
//  FALLEN GOD     KO'd while ascended by a MORTAL (not divine)? His pride shatters: he rises once
//                 as the Fallen God with a new kit built on DAMNATION instead of Sin.
// ============================================================

// Fighters who count as divine: their finishing blow is a fair judgment, no rage.
const DEITIES = ['seraph', 'helios', 'judge', 'astra', 'luna', 'aurelion', 'aatrox', 'volibear'];

const aurSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const isFallen = v => !!(v && (v.corrupted || v.fallen));
const aQ = (x, k = 4) => Math.round(x * k) / k;

// ---------------- vector art (kept as the PIXEL ART FIGHTERS = off look, and for hazards/cutscene swords) ----------------
// ---------------- art ----------------
const AUR_PAL = { build: 'athletic', skin: '#f3e6d6', top: '#f7f2e4', topDark: '#cfc4a8', pants: '#ece2c8', pantsDark: '#c8bc9c', boots: '#d6a93a', belt: '#d6a93a', glove: '#f3e6d6', skirt: '#f4eedc', noFace: true, bracers: '#d6a93a' };
const AUR_ASC_PAL = Object.assign({}, AUR_PAL, { top: '#fffbee', skirt: '#fffaf0', belt: '#ffe08a', bracers: '#ffe08a' });
const AUR_FALLEN_PAL = { build: 'athletic', skin: '#b8aeb0', top: '#1c0c12', topDark: '#0e0508', pants: '#24090f', pantsDark: '#12040a', boots: '#3a0a12', belt: '#8a0a1a', glove: '#b8aeb0', skirt: '#2a0a12', noFace: true, bracers: '#8a0a1a' };

function drawHolyBlade(c, x, y, len, ang, t, o = {}) {
  const F = o.fallen, w = o.w || 1, glow = o.glow || 0;
  c.save(); c.translate(x, y); c.rotate(ang);
  c.strokeStyle = F ? '#2a0a10' : '#b08a2a'; c.lineWidth = 5 * w; c.lineCap = 'round'; c.beginPath(); c.moveTo(-22 * w, 0); c.lineTo(4, 0); c.stroke();
  circle(c, -24 * w, 0, 4 * w, F ? '#8a0a1a' : '#fff0b0');
  // winged crossguard
  c.fillStyle = F ? '#2a0a10' : '#e8c060'; c.strokeStyle = '#2a1a04'; c.lineWidth = 1.2;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(6, 0); c.quadraticCurveTo(10, s * 10 * w, 2, s * 22 * w); c.quadraticCurveTo(14, s * 14 * w, 16, s * 3); c.closePath(); c.fill(); c.stroke(); }
  // blade
  const g = c.createLinearGradient(0, -6 * w, 0, 6 * w);
  if (F) { g.addColorStop(0, '#1a0508'); g.addColorStop(0.5, '#3a0a12'); g.addColorStop(1, '#12030a'); } else { g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#e6e2d8'); g.addColorStop(1, '#b8b2a4'); }
  c.fillStyle = g; c.strokeStyle = F ? '#000' : '#6a5a3a'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(14, -5.5 * w);
  if (F) { c.lineTo(len * 0.82, -4 * w); c.lineTo(len * 0.9, -9 * w); c.lineTo(len * 0.95, -1 * w); c.lineTo(len * 0.87, 2 * w); c.lineTo(len * 0.8, 5 * w); }
  else { c.lineTo(len * 0.9, -4.5 * w); c.lineTo(len, 0); c.lineTo(len * 0.9, 4.5 * w); }
  c.lineTo(14, 5.5 * w); c.closePath(); c.fill(); c.stroke();
  // fuller + runes / cracks
  c.strokeStyle = F ? 'rgba(255,40,50,0.9)' : '#d6a93a'; c.lineWidth = 1.6 * w;
  c.beginPath(); c.moveTo(18, 0); c.lineTo(len * (F ? 0.78 : 0.85), 0); c.stroke();
  if (F) { c.lineWidth = 1; for (let i = 0; i < 5; i++) { const px = 30 + i * len * 0.12; c.beginPath(); c.moveTo(px, 0); c.lineTo(px + 6, (i % 2 ? -4 : 4) * w); c.stroke(); } }
  else { c.fillStyle = '#d6a93a'; for (let i = 0; i < 6; i++) circle(c, 28 + i * len * 0.11, 0, 1.3 * w, '#fff6c8'); }
  if (glow > 0) {
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = F ? `rgba(255,30,40,${0.4 * glow})` : `rgba(255,236,170,${0.45 * glow})`; c.lineWidth = 14 * w;
    c.beginPath(); c.moveTo(14, 0); c.lineTo(len, 0); c.stroke();
    c.globalCompositeOperation = 'source-over';
  }
  c.restore();
}

// feathered wing fan (base / fallen), or wings of pure light (ascended)
function aurWingFan(c, len, spread, t, o) {
  const n = 11, a0 = -Math.PI * (0.98 + spread * 0.12), a1 = -Math.PI * (0.5 - spread * 0.2);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < n; i++) {
      if (o.ragged && (i * 7 + row * 3) % 5 === 0) continue;
      const k = i / (n - 1), a = lerp(a0, a1, k) + (o.ragged ? Math.sin(i * 3.1 + row) * 0.06 : 0);
      const L = len * (row === 0 ? lerp(1, 0.62, k) : row === 1 ? 0.62 : 0.34) * (0.92 + 0.08 * Math.sin(t * 2 + i));
      c.save(); c.rotate(a);
      c.fillStyle = row === 0 ? o.tip : row === 1 ? o.mid : o.base; c.strokeStyle = o.edge; c.lineWidth = 1;
      c.beginPath(); c.ellipse(L * 0.55, 0, L * 0.5, (row === 0 ? 6 : 7) * (o.w || 1), 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.restore();
    }
  }
}
function aurWings(c, P, t, mode) {
  const flap = Math.sin(t * (mode === 'asc' ? 3.5 : 2)) * 0.06;
  if (mode === 'asc') {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const [i, rot, sc] of [[0, -0.1, 1.25], [1, 0.35, 1.0], [2, -0.55, 0.8]]) {
      c.save(); c.translate(P.sh[0] - 6, P.sh[1] + 2 + i * 6); c.rotate(rot + flap * (i + 1));
      aurWingFan(c, 86 * sc, 1, t, { tip: 'rgba(255,214,110,0.30)', mid: 'rgba(255,190,90,0.22)', base: 'rgba(255,240,190,0.26)', edge: 'rgba(255,200,90,0.55)', w: 0.9 });
      c.restore();
    }
    c.restore(); return;
  }
  const F = mode === 'fallen';
  for (const side of [-1, 1]) {
    c.save(); c.translate(P.sh[0] - 6, P.sh[1] + 2); c.rotate(side * 0.16 + flap * side + (F ? 0.1 : 0));
    aurWingFan(c, F ? 108 : 86, F ? 0.8 : 0.35, t, F
      ? { tip: side < 0 ? '#0e0406' : '#1a070b', mid: '#240a10', base: '#300c14', edge: 'rgba(200,20,40,0.7)', ragged: true }
      : { tip: side < 0 ? '#e8e2d2' : '#fbf8ee', mid: '#fffdf6', base: '#fff', edge: '#c9b98a' });
    c.restore();
  }
}
function aurSwingAng(v) {
  const m = v.move, mf = v.mf || 0;
  if (m && m.swing) { const [a0, a1, a2] = m.swing; if (mf < m.s) return lerp(a0, a1, ease.out(mf / Math.max(1, m.s))); return lerp(a1, a2, Math.min(1, (mf - m.s) / 4)); }
  const T = { idle: -1.25, walk: -1.2, run: -0.9, backwalk: -1.25, crouch: -1.9, block: -1.57, cblock: -1.8, punch: -0.05, punch2: 0.05, kick: -1.7, heavy: 0.45, slam: 0.95, uppercut: -1.25, cast: -0.3, cast_up: -1.57, dash: 0.05, jump: -1.4, fall: -1.4, fly: -1.2,
    air_light: -0.15, air_mid: 0.3, air_heavy: 0.8, air_spike: 1.45, hurt: 2.3, hurt_air: 2.4, stun: 2.3, kneel: 1.45, victory: -1.57, taunt: 1.45, intro: 1.45, throw: -0.4, charge: -1.57, kichar: -1.57, sweep: 0.25, c_light: 0.05 };
  return T[v.pose] ?? -1.25;
}

function drawAurelion(c, v) {
  const t = v.anim || 0, F = isFallen(v), A = !F && !!v.transformed;
  if (A) glowCircle(c, 0, -80, 140, 'rgba(255,240,180,0.35)', 'rgba(255,220,120,0)');
  if (F) glowCircle(c, 0, -70, 130, 'rgba(200,10,30,0.3)', 'rgba(60,0,0,0)');
  drawHumanoid(c, v, F ? AUR_FALLEN_PAL : A ? AUR_ASC_PAL : AUR_PAL, {
    back(c, P) {
      aurWings(c, P, t, F ? 'fallen' : A ? 'asc' : 'base');
      // long hair flowing behind
      const [hx, hy] = P.head;
      c.fillStyle = F ? '#d8d0d0' : '#fff3c8'; c.strokeStyle = F ? '#6a5a5a' : '#c9a64a'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(hx - 8, hy - 11); c.quadraticCurveTo(hx - 22, hy + 4, hx - 18 + Math.sin(t * 3) * 3, hy + 34); c.lineTo(hx - 8, hy + 26); c.quadraticCurveTo(hx - 4, hy + 10, hx + 2, hy - 2); c.closePath(); c.fill(); c.stroke();
      // cape
      c.fillStyle = F ? '#3a0a14' : '#d6a93a';
      c.beginPath(); c.moveTo(P.sh[0] - 8, P.sh[1]); c.quadraticCurveTo(P.sh[0] - 26, P.hip[1] + 10, P.sh[0] - 30 + Math.sin(t * 2.5) * 4, P.hip[1] + 44); c.lineTo(P.sh[0] - 10, P.hip[1] + 36); c.closePath(); c.fill();
    },
    chest(c, P) {
      const x = lerp(P.hip[0], P.sh[0], 0.68), y = lerp(P.hip[1], P.sh[1], 0.68);
      if (F) { c.strokeStyle = 'rgba(255,30,50,0.8)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 7, y - 6); c.lineTo(x, y + 2); c.lineTo(x + 6, y - 5); c.moveTo(x, y + 2); c.lineTo(x - 2, y + 12); c.stroke(); circle(c, x, y, 3.5, '#ff1a2a'); return; }
      c.fillStyle = '#d6a93a'; c.beginPath(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r = i % 2 ? 4 : 8; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.fill();
      circle(c, x, y, 3, A ? '#fff' : '#fff6c8');
    },
    head(c, P) {
      const [hx, hy] = P.head;
      // fringe + circlet
      c.fillStyle = F ? '#d8d0d0' : '#fff3c8';
      c.beginPath(); c.moveTo(hx - 11, hy - 3); c.quadraticCurveTo(hx - 6, hy - 16, hx + 8, hy - 13); c.quadraticCurveTo(hx + 12, hy - 9, hx + 10, hy - 6); c.lineTo(hx - 2, hy - 8); c.closePath(); c.fill();
      c.strokeStyle = F ? '#8a0a1a' : '#d6a93a'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx - 10, hy - 7); c.lineTo(hx + 10, hy - 8); c.stroke();
      // cold, half-lidded profile face
      c.strokeStyle = '#2a1a12'; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(hx + 10, hy - 3); c.lineTo(hx + 12.5, hy + 2); c.lineTo(hx + 10.5, hy + 3); c.stroke();            // nose
      c.beginPath(); c.moveTo(hx + 6, hy + 6.5); c.lineTo(hx + 10, hy + 6); c.stroke();                                          // thin mouth
      c.beginPath(); c.moveTo(hx + 2, hy - 4.5); c.lineTo(hx + 9, hy - 5.5); c.stroke();                                         // sharp brow
      c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 6.5, hy - 2, F ? 8 : 6, F ? 'rgba(255,30,40,1)' : 'rgba(255,220,120,1)', 'rgba(0,0,0,0)'); c.globalCompositeOperation = 'source-over';
      c.fillStyle = F ? '#ff4a4a' : '#fff6d0'; c.beginPath(); c.moveTo(hx + 3, hy - 2); c.quadraticCurveTo(hx + 6.5, hy - 3.6, hx + 9.5, hy - 2); c.quadraticCurveTo(hx + 6.5, hy - 1, hx + 3, hy - 2); c.fill();
      if (F) { c.strokeStyle = '#0a0002'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx + 6, hy - 1); c.lineTo(hx + 5, hy + 8); c.stroke(); c.strokeStyle = 'rgba(255,30,50,0.8)'; c.beginPath(); c.moveTo(hx - 4, hy + 2); c.lineTo(hx + 1, hy + 6); c.lineTo(hx - 1, hy + 10); c.stroke(); }
      // halo: intact / sun-crown / shattered
      const hy2 = hy - 22;
      if (F) {
        for (let i = 0; i < 4; i++) { const a = t * 1.2 + i * Math.PI / 2; c.save(); c.translate(hx - 2 + Math.cos(a) * 16, hy2 + Math.sin(a) * 4); c.rotate(a); c.strokeStyle = '#ff2a3a'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 8, 0, 1.1); c.stroke(); c.restore(); }
      } else {
        c.save(); c.globalCompositeOperation = 'lighter';
        c.strokeStyle = A ? 'rgba(255,250,210,1)' : 'rgba(255,215,110,0.95)'; c.lineWidth = 3; c.beginPath(); c.ellipse(hx - 2, hy2, 15, 4.5, -0.15, 0, Math.PI * 2); c.stroke();
        if (A) for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + t * 0.4; c.beginPath(); c.moveTo(hx - 2 + Math.cos(a) * 17, hy2 + Math.sin(a) * 5); c.lineTo(hx - 2 + Math.cos(a) * 27, hy2 + Math.sin(a) * 9 - 3); c.stroke(); }
        c.restore();
      }
    },
    pads(c, P) {
      const [sx, sy] = P.sh; c.fillStyle = F ? '#2a0a12' : '#e0b448'; c.strokeStyle = '#3a2a08'; c.lineWidth = 1.3;
      c.beginPath(); c.ellipse(sx + 1, sy + 2, 13, 8, -0.2, Math.PI, Math.PI * 2.05); c.fill(); c.stroke();
      c.fillStyle = F ? '#120306' : '#fff6d8'; for (const dx of [-7, 0, 7]) { c.beginPath(); c.ellipse(sx + dx, sy - 3, 2.5, 6, -0.6, 0, Math.PI * 2); c.fill(); }
    },
    front(c, P) {
      const [hx, hy] = P.fH;
      drawHolyBlade(c, hx, hy, F ? 150 : A ? 172 : 150, aurSwingAng(v), t, { fallen: F, glow: A ? 0.8 : F ? 0.6 : 0.25, w: A ? 1.1 : 1 });
    },
  });
}

// Portrait: an angel looking DOWN at you. Half-lidded, pupil-less gold eyes, a thin sneer.
function drawAurelionPortrait(c, opts, def) {
  const F = def && def.portraitId === 'aurelion_fallen', A = !F && !!opts.form;
  const g = c.createRadialGradient(50, 40, 4, 50, 50, 80);
  if (F) { g.addColorStop(0, '#5a0a14'); g.addColorStop(1, '#050002'); } else { g.addColorStop(0, A ? '#fff4c8' : '#e8cf8a'); g.addColorStop(1, A ? '#8a6a20' : '#3a2a10'); }
  c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  // light rays / broken rays
  c.save(); c.globalAlpha = F ? 0.25 : 0.35; c.fillStyle = F ? '#ff2a3a' : '#fff';
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28; c.beginPath(); c.moveTo(50, 36); c.lineTo(50 + Math.cos(a - 0.05) * 90, 36 + Math.sin(a - 0.05) * 90); c.lineTo(50 + Math.cos(a + 0.05) * 90, 36 + Math.sin(a + 0.05) * 90); c.fill(); }
  c.restore();
  // halo
  if (F) { c.strokeStyle = '#ff2a3a'; c.lineWidth = 3; for (let i = 0; i < 5; i++) { const a0 = i * 1.26 + 0.2; c.beginPath(); c.arc(50 + Math.cos(a0) * 3, 26 + Math.sin(a0) * 3, 30, a0, a0 + 0.8); c.stroke(); } }
  else { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = A ? '#fffbe0' : '#ffd878'; c.lineWidth = A ? 4 : 3; c.beginPath(); c.arc(50, 28, 30, 0, Math.PI * 2); c.stroke(); if (A) for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; c.beginPath(); c.moveTo(50 + Math.cos(a) * 32, 28 + Math.sin(a) * 32); c.lineTo(50 + Math.cos(a) * 44, 28 + Math.sin(a) * 44); c.stroke(); } c.restore(); }
  // wings framing
  c.fillStyle = F ? '#12040a' : '#fffaf0'; c.strokeStyle = F ? 'rgba(200,20,40,0.7)' : '#c9b98a'; c.lineWidth = 0.8;
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { c.save(); c.translate(50 + s * 22, 78); c.rotate(s * (-0.4 - i * 0.22) - Math.PI / 2 * (s < 0 ? 1 : -1) * 0); c.beginPath(); c.ellipse(s * (18 + i * 3), -14 - i * 5, 16, 4, s * (0.5 + i * 0.2), 0, Math.PI * 2); c.fill(); c.stroke(); c.restore(); }
  // hair behind
  c.fillStyle = F ? '#cfc6c6' : '#fff1c0'; c.beginPath(); c.moveTo(28, 40); c.quadraticCurveTo(24, 70, 30, 96); c.lineTo(70, 96); c.quadraticCurveTo(76, 70, 72, 40); c.quadraticCurveTo(50, 12, 28, 40); c.fill();
  // collar armor
  c.fillStyle = F ? '#1c0a10' : '#d6a93a'; c.beginPath(); c.moveTo(14, 100); c.lineTo(26, 80); c.lineTo(40, 74); c.lineTo(50, 82); c.lineTo(60, 74); c.lineTo(74, 80); c.lineTo(86, 100); c.fill();
  // face: long, narrow, angular
  const skin = F ? '#b3a8aa' : '#f5e8d8';
  c.fillStyle = skin; c.strokeStyle = F ? '#2a0a10' : '#6a5030'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(35, 36); c.quadraticCurveTo(50, 26, 65, 36); c.lineTo(65, 52); c.lineTo(58, 68); c.lineTo(50, 73); c.lineTo(42, 68); c.lineTo(35, 52); c.closePath(); c.fill(); c.stroke();
  // cheek shading (sharp)
  c.fillStyle = F ? 'rgba(60,0,10,0.35)' : 'rgba(150,110,60,0.22)'; c.beginPath(); c.moveTo(36, 52); c.lineTo(42, 64); c.lineTo(40, 54); c.fill(); c.beginPath(); c.moveTo(64, 52); c.lineTo(58, 64); c.lineTo(60, 54); c.fill();
  // fringe + circlet
  c.fillStyle = F ? '#d8d0d0' : '#fff3c8'; c.beginPath(); c.moveTo(33, 42); c.quadraticCurveTo(36, 24, 50, 25); c.quadraticCurveTo(64, 24, 67, 42); c.lineTo(60, 34); c.lineTo(54, 38); c.lineTo(50, 31); c.lineTo(45, 38); c.lineTo(40, 34); c.closePath(); c.fill();
  c.strokeStyle = F ? '#8a0a1a' : '#b8862a'; c.lineWidth = 2; c.beginPath(); c.moveTo(35, 37); c.quadraticCurveTo(50, 33, 65, 37); c.stroke(); circle(c, 50, 34.5, 2, F ? '#ff2a3a' : '#fff');
  // brows: flat, disdainful
  c.strokeStyle = '#2a1a10'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(38, 44); c.lineTo(47, 45.5); c.moveTo(62, 44); c.lineTo(53, 45.5); c.stroke();
  // half-lidded, pupil-less glowing eyes
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 7, 49, 7, F ? 'rgba(255,30,40,1)' : 'rgba(255,215,120,1)', 'rgba(0,0,0,0)'); c.restore();
  for (const s of [-1, 1]) {
    c.fillStyle = F ? '#ff4a4a' : '#fff4c8'; c.beginPath(); c.moveTo(50 + s * 3, 49.5); c.quadraticCurveTo(50 + s * 7, 47.8, 50 + s * 11, 49); c.quadraticCurveTo(50 + s * 7, 51, 50 + s * 3, 49.5); c.fill();
    c.strokeStyle = '#1a0a04'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(50 + s * 2.5, 49); c.quadraticCurveTo(50 + s * 7, 47, 50 + s * 11.5, 48.5); c.stroke();
  }
  // nose + thin sneer
  c.strokeStyle = '#6a4a30'; c.lineWidth = 1; c.beginPath(); c.moveTo(50, 50); c.lineTo(49, 58); c.lineTo(51.5, 58.5); c.stroke();
  c.strokeStyle = F ? '#3a0008' : '#6a3a2a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(44, 64); c.lineTo(51, 64); c.quadraticCurveTo(55, 63.5, 57, 61.5); c.stroke();
  if (F) {
    c.strokeStyle = '#050001'; c.lineWidth = 1.6; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 6, 51); c.lineTo(50 + s * 7, 62); c.stroke(); }
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,30,40,0.8)'; c.lineWidth = 0.9;
    for (const p of [[[38, 40], [42, 48], [39, 56]], [[62, 40], [58, 47], [61, 56]], [[46, 68], [44, 72]]]) { c.beginPath(); c.moveTo(p[0][0], p[0][1]); for (const q of p.slice(1)) c.lineTo(q[0], q[1]); c.stroke(); }
    c.restore();
  }
  drawHolyBlade(c, 96, 100, 60, -2.2, 0, { fallen: F, glow: A ? 0.8 : 0.3, w: 1.1 });
}

// ---------------- pixel art ----------------
const AURPX = PixelArt.make({
  id: 'aurelion', win: [-195, -300, 440, 350], B: 1.04, trail: 'rgba(255,233,168,', blend: .55,
  state(v, t, st) {
    const F = isFallen(v), A = !F && !!v.transformed, wp = A ? (v.wingPairs === undefined ? 3 : v.wingPairs) : 0;
    return { F, A, wp, ang: Math.round(AURPX.ease(st, 'ang', aurSwingAng(v), .6) * 30) / 30, hair: aQ(Math.sin(t * 3) * 3, 2), cape: aQ(Math.sin(t * 2.5) * 4, 2), flap: aQ(Math.sin(t * (A ? 3.5 : 2)) * .06, 16), blade: F ? 150 : A ? 172 : 150, glow: A ? .8 : F ? .6 : .25 };
  },
  body(g, P, s) {
    const F = s.F, A = s.A, info = {}, { L } = g;
    const gold = F ? ['#8a0a1a', '#4a0510'] : ['#e0b448', '#a47c28'];
    const cloth = F ? ['#2c0e16', '#14060a'] : A ? ['#fffbee', '#d8ceb0'] : ['#f7f2e4', '#cfc4a8'], clothF = F ? ['#14060a', '#0a0305'] : ['#cfc4a8', '#a89c7c'], skirt = F ? ['#34121a', '#1a080e'] : A ? ['#fffaf0', '#dcd2b4'] : ['#f4eedc', '#cfc4a8'];
    const skin = F ? ['#b8aeb0', '#8e8284'] : ['#f3e6d6', '#cdb8a2'], skinF = F ? ['#8e8284', '#6a6062'] : ['#cdb8a2', '#a8927c'];
    g.humanoid(P, { limb: 1.0, bulk: 1.0, hips: 1.0, skin, skinFar: skinF, top: cloth, topFar: clothF, pants: F ? ['#34121a', '#1a080e'] : ['#ece2c8', '#c8bc9c'], pantsFar: clothF, boots: F ? ['#4a1018', '#240609'] : ['#d6a93a', '#9c7620'], bootsFar: F ? ['#240609', '#14040a'] : ['#9c7620', '#6a5014'],
      belt: gold, skirt, glove: skin, gloveFar: skinF, bracers: gold, noHead: false }, {
      back(P) {
        // base / fallen wings are feathered fans painted in the sprite; ascended wings are light, drawn in pre()
        if (!A) for (const side of [-1, 1]) {
          const rot = side * .16 + s.flap * side + (F ? .1 : 0), sx = P.sh[0] - 6, sy = P.sh[1] + 2, len = F ? 108 : 86, spread = F ? .8 : .35, n = 11, a0 = -Math.PI * (.98 + spread * .12), a1 = -Math.PI * (.5 - spread * .2);
          const rows = [[], [], []];
          for (let row = 0; row < 3; row++) for (let i = 0; i < n; i++) {
            if (F && (i * 7 + row * 3) % 5 === 0) continue;
            const k = i / (n - 1), a = lerp(a0, a1, k) + rot + (F ? Math.sin(i * 3.1 + row) * .06 : 0), Ln = len * (row === 0 ? lerp(1, .62, k) : row === 1 ? .62 : .34);
            rows[row].push(g.ell(sx + Math.cos(a) * Ln * .55, sy + Math.sin(a) * Ln * .55, Ln * .5, row === 0 ? 6 : 7, a));
          }
          const cols = F ? [[side < 0 ? '#12060a' : '#220a10', '#08020a'], ['#2a0c14', '#14060a'], ['#34121a', '#1c0a10']] : [[side < 0 ? '#e8e2d2' : '#fbf8ee', '#b8ae94'], ['#fffdf6', '#d6ccb2'], ['#ffffff', '#e0d8c0']];
          g.paint(rows[2], ...cols[2]); g.paint(rows[1], ...cols[1]); g.paint(rows[0], ...cols[0]);
        }
        const [hx, hy] = P.head;
        g.paint([g.shape([['M', hx - 8, hy - 11], ['Q', hx - 22, hy + 4, hx - 18 + s.hair, hy + 34], ['L', hx - 8, hy + 26], ['Q', hx - 4, hy + 10, hx + 2, hy - 2]])], ...(F ? ['#d8d0d0', '#a49a9a'] : ['#fff3c8', '#d6b866']));
        g.paint([g.shape([['M', P.sh[0] - 8, P.sh[1]], ['Q', P.sh[0] - 26, P.hip[1] + 10, P.sh[0] - 30 + s.cape, P.hip[1] + 44], ['L', P.sh[0] - 10, P.hip[1] + 36]])], ...(F ? ['#3a0a14', '#1c050a'] : ['#d6a93a', '#98721c']));
      },
      chest(P) {
        const x = L(P.hip, P.sh, .68)[0], y = L(P.hip, P.sh, .68)[1];
        if (F) { g.line([[x - 7, y - 6], [x, y + 2], [x + 6, y - 5]], '#ff2a3a', 1.4); g.line([[x, y + 2], [x - 2, y + 12]], '#ff2a3a', 1.4); g.fill(g.ell(x, y, 3.5, 3.5), '#ff1a2a'); return; }
        const pts = []; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r = i % 2 ? 4 : 8; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
        g.paint([g.poly(pts)], '#e0b448', '#a47c28'); g.fill(g.ell(x, y, 3, 3), A ? '#ffffff' : '#fff6c8');
      },
      head(P) {
        const [hx, hy] = P.head;
        g.paint([g.shape([['M', hx - 11, hy - 3], ['Q', hx - 6, hy - 16, hx + 8, hy - 13], ['Q', hx + 12, hy - 9, hx + 10, hy - 6], ['L', hx - 2, hy - 8]])], ...(F ? ['#d8d0d0', '#a49a9a'] : ['#fff3c8', '#d6b866']));
        g.line([[hx - 10, hy - 7], [hx + 10, hy - 8]], F ? '#8a0a1a' : '#d6a93a', 2);
        g.line([[hx + 10, hy - 3], [hx + 12.5, hy + 2], [hx + 10.5, hy + 3]], '#2a1a12', 1.2);
        g.line([[hx + 6, hy + 6.5], [hx + 10, hy + 6]], '#2a1a12', 1.2); g.line([[hx + 2, hy - 4.5], [hx + 9, hy - 5.5]], '#2a1a12', 1.3);
        g.fill(g.poly([[hx + 3, hy - 2], [hx + 6.5, hy - 3.6], [hx + 9.5, hy - 2], [hx + 6.5, hy - 1]]), F ? '#ff4a4a' : '#fff6d0');
        if (F) { g.line([[hx + 6, hy - 1], [hx + 5, hy + 8]], '#0a0002', 1.2); g.line([[hx - 4, hy + 2], [hx + 1, hy + 6], [hx - 1, hy + 10]], '#ff2a3a', 1); }
        info.eye = [hx + 6.5, hy - 2]; info.halo = [hx - 2, hy - 22];
      },
      pads(P) {
        const [sx, sy] = P.sh;
        g.paint([g.ell(sx + 1, sy + 2, 13, 8, -.2, Math.PI, Math.PI * 2.05)], F ? '#2a0a12' : '#e0b448', F ? '#12040a' : '#a47c28');
        g.paint([-7, 0, 7].map(dx => g.ell(sx + dx, sy - 3, 2.5, 6, -.6)), F ? '#120306' : '#fff6d8', F ? '#080102' : '#d8cca8');
      },
      front(P) { // the holy blade: winged guard, long fuller, jagged and cracked when fallen
        const [hx, hy] = P.fH, a = s.ang, ca = Math.cos(a), sa = Math.sin(a), pt = (u, w) => [hx + ca * u - sa * w, hy + sa * u + ca * w], Ln = s.blade;
        g.line([pt(-22, 0), pt(4, 0)], F ? '#2a0a10' : '#b08a2a', 5); g.fill(g.ell(...pt(-24, 0), 4, 4), F ? '#8a0a1a' : '#fff0b0');
        g.paint([-1, 1].map(sg => g.poly([pt(6, 0), pt(10, sg * 10), pt(2, sg * 22), pt(14, sg * 14), pt(16, sg * 3)])), ...(F ? ['#3a1018', '#1a0508'] : ['#e8c060', '#a47c28']));
        const blade = F ? [pt(14, -5.5), pt(Ln * .82, -4), pt(Ln * .9, -9), pt(Ln * .95, -1), pt(Ln * .87, 2), pt(Ln * .8, 5), pt(14, 5.5)] : [pt(14, -5.5), pt(Ln * .9, -4.5), pt(Ln, 0), pt(Ln * .9, 4.5), pt(14, 5.5)];
        g.paint([g.poly(blade)], ...(F ? ['#3a0a12', '#12030a'] : ['#f6f3ea', '#b8b2a4']));
        g.line([pt(18, 0), pt(Ln * (F ? .78 : .85), 0)], F ? '#ff2a3a' : '#d6a93a', 1.6);
        if (!F) for (let i = 0; i < 6; i++) g.fill(g.ell(...pt(28 + i * Ln * .11, 0), 1.3, 1.3), '#fff6c8');
        info.tip = pt(Ln, 0);
      },
    });
    return info;
  },
  pre(c, v, P, s) {
    const t = v.anim || 0;
    if (s.A) glowCircle(c, 0, -80, 140, 'rgba(255,240,180,0.3)', 'rgba(255,220,120,0)');
    if (s.F) glowCircle(c, 0, -70, 130, 'rgba(200,10,30,0.3)', 'rgba(60,0,0,0)');
    if (s.A && s.wp > 0) { // wings of pure light, made of chunky pixels
      c.save(); c.globalCompositeOperation = 'lighter';
      const pairs = [[-.1, 1.25], [.35, 1.0], [-.55, .8]];
      for (let w = 0; w < s.wp; w++) {
        const [rot, sc] = pairs[w], sx = P.sh[0] - 6, sy = P.sh[1] + 2 + w * 6;
        for (let i = 0; i < 11; i++) {
          const k = i / 10, a = lerp(-Math.PI * 1.1, -Math.PI * .4, k) + rot + s.flap * (w + 1) * 2, L = 86 * sc * lerp(1, .62, k) * (.92 + .08 * Math.sin(t * 2 + i));
          for (let j = 4; j < L; j += 4) { const al = (.1 + .3 * (1 - j / L)) * (.7 + .3 * Math.sin(t * 3 + i + w)); c.fillStyle = (i + j / 4) % 3 ? `rgba(255,214,110,${al})` : `rgba(255,248,214,${al * 1.2})`; c.fillRect(Math.round((sx + Math.cos(a) * j) / 3) * 3, Math.round((sy + Math.sin(a) * j) / 3) * 3, 5, 5); }
        }
      }
      c.restore();
    }
  },
  post(c, v, P, s, info) {
    const t = v.anim || 0; if (!info || !info.halo) return; const [hx, hy] = info.halo;
    c.save(); c.globalCompositeOperation = 'lighter';
    glowCircle(c, info.eye[0], info.eye[1], s.F ? 8 : 6, s.F ? 'rgba(255,30,40,1)' : 'rgba(255,220,120,1)', 'rgba(0,0,0,0)');
    if (s.F) { c.strokeStyle = '#ff2a3a'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { const a = t * 1.2 + i * Math.PI / 2; c.save(); c.translate(hx + Math.cos(a) * 16, hy + Math.sin(a) * 4); c.rotate(a); c.beginPath(); c.arc(0, 0, 8, 0, 1.1); c.stroke(); c.restore(); } }
    else { // the halo as a ring of pixels (a sun-crown of rays once ascended)
      for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; c.fillStyle = s.A ? '#fffbe0' : '#ffd878'; c.fillRect(Math.round(hx + Math.cos(a) * 15) - 1, Math.round(hy + Math.sin(a) * 4.5) - 1, 3, 3); }
      if (s.A) for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + t * .4; for (let j = 0; j < 3; j++) { c.fillStyle = 'rgba(255,250,210,0.9)'; c.fillRect(Math.round(hx + Math.cos(a) * (19 + j * 3)) - 1, Math.round(hy + Math.sin(a) * (6 + j * 1.2)) - 1, 3, 3); } }
    }
    if (info.tip && (s.A || s.F)) glowCircle(c, info.tip[0], info.tip[1], 12, s.F ? 'rgba(255,30,40,0.6)' : 'rgba(255,236,170,0.6)', 'rgba(0,0,0,0)');
    c.restore();
  },
});
const aurPortrait = PxKit.portrait('aurelion', drawAurelionPortrait, { res: 64, levels: 8, dither: 0.3 });

// ---------------- Sin & Judgment ----------------
function aurSin(a, t, n) {
  if (!t || t.hp <= 0 || !Game.battle) return;
  if (n > 0) aurSfx('aurBrand'); Combat.mark(t, a, 'sin', n, { max: 5, dur: 8, color: '#ffd35a', label: 'SIN', onMax: (tt, o) => aurJudgment(o, tt) });
}
function aurJudgment(owner, t) {
  Combat.consumeMark(t, 'sin');
  const big = owner.form;
  Game.popWorld(t.x, t.y - t.h - 60, 'JUDGMENT', '#fff0b0', 28);
  aurSfx('aurBellToll');
  Combat.telegraph(owner, { x: t.x, follow: t, track: 0.3, r: big ? 110 : 80, life: 22, color: '#fff0b0', column: true,
    onFire: h => {
      for (const o of Combat.targets(owner.side)) if (Math.abs(o.x - h.x) < h.r) Combat.resolveHit(o, owner, H_({ dmg: big ? 140 : 110, guard: 'unblock', hs: 40, kb: [0, -520], launch: true, stun: 0.3, sfx: 'h' }), { proj: true, fromX: h.x });
      Combat.addHazard({ kind: 'aurPillar', owner, side: owner.side, x: h.x, r: h.r, life: 22, color: '#fff6d0' });
      Cam.shake = Math.max(Cam.shake, 12); aurSfx('aurSmite');
    } });
}
function aurDamn(a, t, n) {
  if (!t || t.hp <= 0 || !Game.battle) return;
  Combat.mark(t, a, 'damnation', n, { max: 4, dur: 8, color: '#ff2a3a', label: 'DAMNATION', onMax: (tt, o) => {
    Combat.consumeMark(tt, 'damnation');
    Game.popWorld(tt.x, tt.y - tt.h - 60, 'DAMNED', '#ff3a4a', 28);
    Combat.telegraph(o, { x: tt.x, follow: tt, track: 0.35, r: 90, life: 18, color: '#ff2a3a', column: true, onFire: h => {
      for (const e of Combat.targets(o.side)) if (Math.abs(e.x - h.x) < h.r) { const r = Combat.resolveHit(e, o, H_({ dmg: 130, guard: 'unblock', hs: 40, kb: [0, -560], launch: true, sfx: 'h' }), { proj: true, fromX: h.x }); if (r === 'hit') o.hp = Math.min(o.maxHp, o.hp + 100); }
      Combat.addHazard({ kind: 'aurPillar', owner: o, side: o.side, x: h.x, r: h.r, life: 22, color: '#ff2a3a', dark: true });
      Cam.shake = Math.max(Cam.shake, 12); aurSfx('aurSmite');
    } });
  } });
}
const aurSinOnHit = n => (a, t) => aurSin(a, t, n);
const aurDamnOnHit = n => (a, t) => aurDamn(a, t, n);

// ---------------- base kit ----------------
const AUR_EDICT = Mv.shot({ name: 'Divine Edict', desc: 'A piercing lance of light. Brands 1 Sin.', s: 16, swing: [-0.2, -0.7, 0], pose: 'punch', ev: { 12: () => aurSfx('aurEdict') }, ai: { min: 150, max: 1600, use: 'zone' },
  proj: { speed: 1500, r: 10, dmg: 52, kind: 'spear', color: '#ffe9a8', core: '#fff', pierce: true, hs: 20, kb: [220, -40], onHit: (t, p) => aurSin(p.owner, t, 1) } });
const AUR_TRINITY = Mv.shot({ name: 'Trinity Edict', desc: 'Three lances of light. Each brands 1 Sin.', s: 16, swing: [-0.2, -0.7, 0], pose: 'punch', ev: { 12: () => aurSfx('aurEdict'), 14: () => aurSfx('aurEdict') }, ai: { min: 150, max: 1600, use: 'zone' },
  proj: { speed: 1500, r: 10, dmg: 34, count: 3, spread: 0.3, kind: 'spear', color: '#fff4c8', core: '#fff', pierce: true, hs: 18, kb: [180, -40], onHit: (t, p) => aurSin(p.owner, t, 1) } });
const AUR_KNEEL = mk({ name: 'Kneel', desc: 'A long lunge. With 3+ Sins, it spends them and forces the foe to their knees.', pose: 'dash', s: 12, a: 10, r: 18, swing: [-0.3, -0.9, 0.02],
  ev: { 9: () => aurSfx('aurEdict') }, vel: [[12, 22, 1100, null]], hit: { dmg: 88, box: [-10, -115, 130, 95], kb: [520, -180], hs: 22, bs: 14 }, ai: { min: 0, max: 220, use: 'approach' },
  onHit: (a, t) => {
    if (Combat.markCount(t, 'sin') >= 3) {
      Combat.mark(t, a, 'sin', -3, { max: 5, dur: 8, color: '#ffd35a' });
      if (Combat.markCount(t, 'sin') <= 0) delete t.marks.sin;
      t.vx = 0; t.hitstun = Math.max(t.hitstun, 70); t.status.stun = Math.max(t.status.stun || 0, 1.1);
      if (t.airborne) t.vy = 900;
      Game.popWorld(t.x, t.y - t.h - 40, 'KNEEL.', '#fff0b0', 30); aurSfx('aurBellToll'); Cam.shake = 10;
    } else aurSin(a, t, 1);
  } });
const AUR_GROUND = mk({ name: 'Holy Ground', desc: 'Plants the sword: projectiles burn away inside, foes inside accrue Sin, he takes 20% less damage there.', pose: 'slam', s: 14, a: 1, r: 20, cd: 9,
  swing: [-1.6, -2.2, 1.45], ai: { min: 0, max: 260, use: 'trap' },
  ev: { 14: f => { Combat.hazards = Combat.hazards.filter(h => !(h.kind === 'aurGround' && h.owner === f)); Combat.addHazard({ kind: 'aurGround', owner: f, side: f.side, x: f.x, r: 180, life: Math.round(3.5 * FPS) }); aurSfx('aurBlessing'); Cam.shake = 6; } } });
// Ascended: Holy Ground becomes a cathedral: a wide sanctum with two blades of light that fall at its edges.
const AUR_CATHEDRAL = mk({ name: 'Cathedral', desc: 'Ascended Holy Ground: a vast sanctum, and two blades of light fall at its edges, each branding a Sin.', pose: 'slam', s: 14, a: 1, r: 22, cd: 10,
  swing: [-1.6, -2.2, 1.45], ai: { min: 0, max: 360, use: 'trap' },
  ev: { 14: f => {
    Combat.hazards = Combat.hazards.filter(h => !(h.kind === 'aurGround' && h.owner === f));
    Combat.addHazard({ kind: 'aurGround', owner: f, side: f.side, x: f.x, r: 280, life: Math.round(4.5 * FPS) }); aurSfx('aurChoir', 0, 1.6); Cam.shake = 8;
    for (const s of [-1, 1]) Combat.telegraph(f, { x: clamp(f.x + s * 250, 40, Arena.stage.width - 40), r: 56, life: 26, color: '#fff0b0', column: true, onFire: h => {
      for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) { const r = Combat.resolveHit(o, f, H_({ dmg: 56, guard: 'mid', hs: 22, kb: [s * -200, -420], launch: true, sfx: 'h' }), { proj: true, fromX: h.x }); if (r === 'hit') aurSin(f, o, 1); }
      Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 18, color: '#fff6d0', sword: true }); aurSfx('aurSmite'); } });
  } } });
const AUR_DARE = Object.assign(Mv.counter({ name: 'You Dare?', desc: 'Parry. Striking a god brands the fool with 2 Sins.', window: 22, dmg: 120 }), { swing: [-1.57, -1.57, -1.57] });
const AUR_DESCENT = Mv.dive({ name: 'Descent of Heaven', desc: 'A plunging sword dive. Brands 1 Sin.', pose: 'air_spike', vx: 520, vy: 1400, hit: { dmg: 80, box: [-10, -70, 110, 80], gb: true, kb: [200, 900], guard: 'high' } });
AUR_DESCENT.onHit = aurSinOnHit(1);

const AUR_SUPER = superize(mk({ name: 'Edenfall', desc: 'Swords of light rain on the foe: 3, plus one per Sin (spends all Sins).', pose: 'cast_up', s: 16, a: 1, r: 26, swing: [-1.57, -1.57, -1.57],
  ev: { 16: f => {
    const t = f.opp; if (!t) return;
    const n = 3 + Combat.consumeMark(t, 'sin');
    for (let i = 0; i < n; i++) Combat.telegraph(f, { x: clamp(t.x + (i - (n - 1) / 2) * 64, 40, Arena.stage.width - 40), r: 48, life: 22 + i * 5, color: '#fff0b0', column: true, onFire: h => {
      for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) Combat.resolveHit(o, f, H_({ dmg: 46, guard: 'mid', hs: 18, bs: 12, kb: [0, -320], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: AUR_SUPER });
      Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 14, color: '#fff6d0', sword: true }); aurSfx('aurSmite');
    } });
  } } }), 100);

const AUR_ULT = superize(mk({ name: 'THRONE OF HEAVEN', desc: 'A colossal sword falls on the foe, tracking them. Blockable. Must connect.', pose: 'cast_up', s: 18, a: 36, r: 22, swing: [-1.57, -1.57, -1.57],
  ev: { 1: () => aurSfx('aurChoir', 0, 1.8), 18: f => {
    const t = f.opp; if (!t) return;
    Combat.telegraph(f, { x: t.x, follow: t, track: 0.2, r: 110, life: 34, color: '#ffe08a', column: true, onFire: h => {
      for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) Combat.resolveHit(o, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: h.x, move: AUR_ULT });
      Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 30, color: '#fff6d0', sword: true, giant: true });
      Cam.shake = 20; aurSfx('aurSmite'); aurSfx('boom');
    } });
  } } }), 300);
AUR_ULT.id = 'aurelion_ult'; AUR_ULT.recoverWhiff = 30;
AUR_ULT.ult = { dmg: 1100, cutscene: (a, t) => csAurelionThrone(a, t), fx: { el: 'light', color: '#ffe08a', sky: ['#2a2010', '#9a7a3a', '#fff0c0'] } };

const aurelion = fighter({
  id: 'aurelion', name: 'AURELION', title: 'The Self-Made God', side: 'VILLAIN', role: 'Long reach · Sin & Judgment · Rebirth', color: '#ffd35a', color2: '#5a4a1a',
  bio: 'Once the highest of the angels, Aurelion decided Heaven was merely a draft and he was the final edition. He brands every mortal he meets with their sins, and every mortal has plenty.',
  quote: 'Kneel. It is the only posture that suits you.',
  ending: 'Aurelion builds a cathedral to himself in Metro City. Attendance is zero. He preaches to the pigeons every Sunday and calls it a full house.',
  hp: 980, walk: 250, deity: true, rival: 'seraph', jumps: 2, scale: 1.08, handArt: true,
  draw: (c, v) => PxKit.on() ? AURPX.draw(c, v) : drawAurelion(c, v), drawPortrait: (c, o, d) => PxKit.on() ? aurPortrait(c, o, d) : drawAurelionPortrait(c, o, d), transformCutscene: f => csAurelionAscend(f),
  model: { skin: '#f3e6d6' }, face: { expr: 'cold' },
  style: { reach: 1.4, weapon: true, speed: 1.1, power: 1, poses: { '5M': 'heavy', '5H': 'slam' } },
  passive: ['Sin & Judgment', 'Edict, Kneel, Descent, heavy slashes and Holy Ground brand Sins. Five Sins call down an unblockable pillar of Judgment. Takes 10% less damage above half health.'],
  passiveArmor: f => (f.hp > f.maxHp * 0.5 ? 0.9 : 1) * (Combat.hazards.some(h => h.kind === 'aurGround' && h.owner === f && Math.abs(f.x - h.x) < h.r) ? 0.8 : 1),
  onHit: (a, t) => {
    const id = a.move && a.move.id;
    if (id === 'counterhit') aurSin(a, t, 2);
    else if (id === '5H' || id === 'jH' || id === 'j2H') aurSin(a, t, a.form ? 2 : 1);
  },
  moves: { '5S': AUR_EDICT, '6S': AUR_KNEEL, '2S': AUR_GROUND, '4S': AUR_DARE, 'jS': AUR_DESCENT },
  super: AUR_SUPER,
  ult: { act: 'strike', name: 'THRONE OF HEAVEN', dmg: 1100, fx: { el: 'light', color: '#ffe08a', sky: ['#2a2010', '#9a7a3a', '#fff0c0'] } },
  form: { name: 'SERAPHIM ASCENDANT', desc: 'Permanent. Six wings of light, flight, a longer blade, Trinity Edict, heavies brand 2 Sins, grander Judgment. Beware: falling while ascended breaks his pride.',
    cost: 300, flight: true, dmg: 1.08, speed: 1.06, scale: 1.12, jump: 1.1, moves: { '5S': AUR_TRINITY, '2S': AUR_CATHEDRAL } },
  assist: '5S',
  lines: {
    intro: ['You may address me as "Your Radiance," {opp}.', 'I have read your prayers. They were very boring.', 'Kneel now and I will make this quick.', 'A mortal? Here? How quaint.'],
    win: ['Your defeat was foretold. By me. Just now.', 'You may kiss the hem of my robe. Carefully.', 'Worship begins at nine. Do not be late.', 'Divinity is not a title, {opp}. It is a fact.'],
    taunt: ['Pathetic.', 'On your knees.', 'Hmph.'], form: ['BEHOLD THE ONLY GOD!', 'Look upon me and despair.'], ult: ['THRONE OF HEAVEN!'], ultHit: ['Judged. Sentenced. Forgotten.'],
    tag: ['Stand aside, mortal.'], enter: ['Finally, someone competent.'], assist: ['Grovel!'], moves: ['Kneel!', 'Insolent!', 'Beneath me.', 'Sinner.'],
  },
});
aurelion.ult = AUR_ULT; aurelion.ultAct = 'strike';

// ---------------- the Fallen God ----------------
const FALLEN_ULT = Ult({ act: 'rush', name: 'DEICIDE', desc: 'A falling god drags you down with him. Must connect.', dmg: 1180, color: '#ff2a3a', cutscene: (a, t) => csAurelionDeicide(a, t),
  fx: { el: 'blood', color: '#ff2a3a', sky: ['#0a0004', '#3a0010', '#8a0a1a'] } });
FALLEN_ULT.swing = [-1.2, -2.8, 0.4];
aurelion.corruptForm = {
  name: 'FALLEN GOD', desc: 'Rage reborn at 25% health. Sin becomes DAMNATION: four marks and a crimson pillar that heals him. Stronger and faster, but he takes more damage and his corruption burns him.',
  manual: false, flight: true, dmg: 1.1, speed: 1.08, armor: 1.25, lifesteal: 0.05, scale: 1.14, reviveFrac: 0.25, color: '#ff2a3a',
  draw: (c, v) => PxKit.on() ? AURPX.draw(c, v) : drawAurelion(c, v), drawPortrait: (c, o, d) => PxKit.on() ? aurPortrait(c, o, d) : drawAurelionPortrait(c, o, d), passiveArmor: null,
  onHit: (a, t) => { const id = a.move && a.move.id; if (id === '5H' || id === 'jH') aurDamn(a, t, 1); },
  passive: ['Corruption', 'Burns 4 HP per second (never below 1). Heals 5% of damage dealt. Takes 25% more damage. Four Damnations call a crimson pillar that heals him.'],
  passiveTick: f => { if (f.st % 30 === 0 && f.hp > 1 && f.state !== 'ko') f.hp = Math.max(1, f.hp - 2); },
  style: { reach: 1.5, weapon: true, speed: 1.0, power: 1.1, poses: { '5M': 'heavy', '5H': 'slam' } },
  moves: {
    '5S': Mv.shot({ name: 'Heretic Wave', desc: 'A crimson wave that hits twice. 1 Damnation.', s: 13, pose: 'punch', proj: { speed: 1050, r: 18, dmg: 36, hits: 2, pierce: true, kind: 'crescent', color: '#ff2a3a', core: '#ffd0d0', hs: 20, kb: [240, -60], onHit: (t, p) => aurDamn(p.owner, t, 1) } }),
    '6S': Object.assign(Mv.teleport({ name: 'Blasphemy', desc: 'Teleports behind the foe and cleaves. 2 Damnation.', to: 'behind', hit: { dmg: 90, box: [0, -120, 110, 110], kb: [600, -300] } }), { onHit: aurDamnOnHit(2), swing: [-2.6, -2.8, 0.6] }),
    '2S': mk({ name: 'Hellgate', desc: 'Three blood spikes erupt in a line toward the foe.', pose: 'slam', s: 16, a: 1, r: 22, swing: [-2, -2.4, 1.3], ai: { min: 100, max: 500, use: 'zone' },
      ev: { 16: f => { for (let i = 0; i < 3; i++) Combat.telegraph(f, { x: clamp(f.x + f.facing * (110 + i * 120), 40, Arena.stage.width - 40), r: 55, life: 14 + i * 8, color: '#ff2a3a', onFire: h => {
        for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) { const r = Combat.resolveHit(o, f, H_({ dmg: 58, guard: 'low', hs: 20, kb: [60, -560], launch: true, sfx: 'h' }), { proj: true, fromX: h.x }); if (r === 'hit') aurDamn(f, o, 1); }
        Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 16, color: '#ff2a3a', dark: true, spike: true }); aurSfx('rock');
      } }); } } }),
    '4S': Object.assign(Mv.rush({ name: 'Fall From Grace', desc: 'A dark tackle that passes through and drains 60 HP.', speed: 1300, frames: 14, pass: true, hit: { dmg: 80, kb: [300, -500], status: { weaken: 3 } } }), { onHit: a => { a.hp = Math.min(a.maxHp, a.hp + 60); } }),
    'jS': Object.assign(Mv.dive({ name: 'Black Meteor', desc: 'Burning dive; ground bounce. 1 Damnation.', pose: 'air_spike', vx: 700, vy: 1400, hit: { dmg: 92, box: [0, -80, 100, 80], gb: true, kb: [200, 900] } }), { onHit: aurDamnOnHit(1) }),
  },
  super: superize(Mv.flurry({ name: 'Crimson Requiem', desc: 'A storm of dark sword strokes.', hits: 14, hit: { dmg: 22, box: [0, -140, 150, 130] }, finisher: { dmg: 100, kb: [800, -600], launch: true, wb: true } }), 100),
  ult: FALLEN_ULT,
  lines: { intro: ['...'], win: ['I am still a god. I am still a GOD.', 'Heaven cast me out. You will not.', 'Kneel... KNEEL!'], taunt: ['WORTHLESS!', 'Hah... haha...'], form: ['A MORTAL?! A MORTAL DID THIS TO ME?!', 'I WILL NOT BE ENDED BY DUST!'], ult: ['DEICIDE!'], ultHit: ['...There. Now we are both fallen.'], moves: ['DIE!', 'Blasphemer!', 'Beneath... ME!'] },
};
(function prepCorrupt() {
  const C = aurelion.corruptForm, d = aurelion;
  for (const [slot, m] of Object.entries(C.moves)) { m.id = d.id + '_c' + slot; m.slot = slot; m.owner = d.id; if (slot === 'jS') m.air = true; }
  C.super.id = d.id + '_csuper'; C.ult.id = d.id + '_cult';
  C.normals = makeNormals(C.style);
})();
DEITIES.forEach(id => { const d = charById(id); if (d) d.deity = true; });

// ---------------- hazards ----------------
Combat.hz.aurGround = function (h) {
  const o = h.owner; if (!o || o.state === 'ko') return false;
  for (const p of this.projectiles) if (p.side !== h.side && Math.abs(p.x - h.x) < h.r && p.y > -500 && p.life > 0) { p.life = 0; Game.fx.burst(p.x, p.y, 10, { color: ['#fff6d0', '#ffd35a'], size: 6, speed: 240, glow: true, life: 0.35 }); }
  if (h.t % 60 === 30) for (const t of this.targets(h.side)) if (Math.abs(t.x - h.x) < h.r && t.y > -200) { aurSin(o, t, 1); Game.fx.burst(t.x, t.y - t.h, 8, { color: '#ffd35a', size: 5, speed: 160, glow: true, life: 0.4 }); }
  return h.t < h.life;
};
Combat.drawHz.aurGround = function (c, h, t) {
  const a = Math.min(1, h.t / 10, (h.life - h.t) / 20);
  c.save(); c.globalAlpha = a;
  c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(0, -420, 0, 0); g.addColorStop(0, 'rgba(255,240,180,0)'); g.addColorStop(1, 'rgba(255,230,150,0.22)');
  c.fillStyle = g; c.fillRect(h.x - h.r, -420, h.r * 2, 420);
  c.strokeStyle = 'rgba(255,220,120,0.9)'; c.lineWidth = 3; c.beginPath(); c.ellipse(h.x, -2, h.r, h.r * 0.2, 0, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1.5; c.beginPath(); c.ellipse(h.x, -2, h.r * 0.75, h.r * 0.15, 0, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6 + t * 0.6; circle(c, h.x + Math.cos(an) * h.r * 0.88, -2 + Math.sin(an) * h.r * 0.18, 3, 'rgba(255,240,180,0.9)'); }
  c.globalCompositeOperation = 'source-over';
  drawHolyBlade(c, h.x, -150, 150, Math.PI / 2, t, { glow: 0.8 });
  c.restore();
};
Combat.hz.aurPillar = function (h) { return h.t < h.life; };
Combat.drawHz.aurPillar = function (c, h) {
  const k = h.t / h.life, a = 1 - k, w = h.r * (h.giant ? 1.2 : 1) * (1 - k * 0.4);
  c.save(); c.globalCompositeOperation = 'lighter';
  if (h.spike) {
    c.fillStyle = `rgba(160,10,30,${a})`; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(h.x + i * 16 - 8, 0); c.lineTo(h.x + i * 16, -120 * (1 - Math.abs(i) * 0.25) * Math.min(1, h.t / 4)); c.lineTo(h.x + i * 16 + 8, 0); c.fill(); }
  } else {
    const g = c.createLinearGradient(h.x - w, 0, h.x + w, 0); const col = h.dark ? '255,40,50' : '255,245,200';
    g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},${0.9 * a})`); g.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = g; c.fillRect(h.x - w, -1400, w * 2, 1400);
    glowCircle(c, h.x, -10, w * 1.6, `rgba(${col},${0.6 * a})`, 'rgba(0,0,0,0)');
  }
  c.globalCompositeOperation = 'source-over';
  if (h.sword) drawHolyBlade(c, h.x, -lerp(h.giant ? 900 : 500, h.giant ? 260 : 130, Math.min(1, h.t / 4)), h.giant ? 420 : 170, Math.PI / 2, 0, { glow: a, w: h.giant ? 3 : 1.2 });
  c.restore();
};

// ---------------- cinematics (pixel scenes: skies, rays and swords are made of real pixels) ----------------
function aurSkyPx(x, a, b) { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, W, H); }
function aurRaysPx(x, cx, cy, t, n, col, alpha) {
  x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = col;
  for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n + t * .15; x.globalAlpha = alpha * (.5 + .5 * Math.sin(i * 3 + t)); x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a - .04) * 1600, cy + Math.sin(a - .04) * 1600); x.lineTo(cx + Math.cos(a + .04) * 1600, cy + Math.sin(a + .04) * 1600); x.fill(); }
  x.restore();
}
function aurCloudsPx(x, t, y, col, n = 9) { x.fillStyle = col; for (let i = 0; i < n; i++) { const cx = ((i * 190 + t * 40) % (W + 300)) - 150; for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(cx + j * 42, y + Math.sin(i + j) * 12, 44 + (j % 2) * 16, 0, 7); x.fill(); } } }
function aurRuins(x, col, lit) { x.fillStyle = col; for (let i = 0; i < 9; i++) { const bx = i * 150 - 30, bh = 140 + (i * 53 % 5) * 40; x.fillRect(bx, H - 80 - bh, 38, bh); x.fillRect(bx + 52, H - 80 - bh * .6, 30, bh * .6); if (i % 2) { x.beginPath(); x.moveTo(bx - 10, H - 80 - bh); x.quadraticCurveTo(bx + 55, H - 80 - bh - 70, bx + 120, H - 80 - bh); x.lineTo(bx + 100, H - 80 - bh); x.fill(); } } if (lit) { x.fillStyle = lit; x.fillRect(0, H - 80, W, 6); } }

// SERAPHIM ASCENDANT — Heaven tears open over the ruins; three pairs of wings unfold, one bell at a time.
function csAurelionAscend(f) {
  const d = f.def, fx = new ParticleSystem(1600), A = PxKit.actor(d);
  return {
    name: 'SERAPHIM ASCENDANT', dur: 6.4, fx,
    cues: [[0, () => aurSfx('aurBellToll')], [1.2, () => aurSfx('aurFall')], [2.2, () => aurSfx('aurBlessing')], [2.9, () => aurSfx('aurBlessing')], [3.6, () => aurSfx('aurBlessing')], [4.0, () => { aurSfx('aurChoir', 0, 2.4); aurSfx('aurSmite'); }]],
    draw(c, t) {
      const tear = ease.out(seg(t, .8, 2.0)), day = ease.inOut(seg(t, 1.6, 3.9)), pairs = t < 2.2 ? 0 : t < 2.9 ? 1 : t < 3.6 ? 2 : 3, up = ease.inOut(seg(t, 1.8, 3.8)), flare = seg(t, 3.9, 4.4);
      PxKit.scene(c, x => {
        aurSkyPx(x, `rgb(${lerp(10, 255, day) | 0},${lerp(8, 236, day) | 0},${lerp(16, 190, day) | 0})`, `rgb(${lerp(40, 210, day) | 0},${lerp(30, 160, day) | 0},${lerp(30, 80, day) | 0})`);
        // the sky cracks open: a jagged vertical rift that widens
        x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(255,255,236,0.95)'; x.beginPath(); x.moveTo(W / 2, 0);
        for (let i = 0; i <= 9; i++) x.lineTo(W / 2 - (70 - i * 6) * tear + Math.sin(i * 7.3) * 12 * tear, i * H * .055 * tear * 1.2); x.lineTo(W / 2, H * .6 * tear);
        for (let i = 9; i >= 0; i--) x.lineTo(W / 2 + (70 - i * 6) * tear + Math.sin(i * 5.1) * 12 * tear, i * H * .055 * tear * 1.2); x.fill(); x.restore();
        aurRaysPx(x, W / 2, H * .22, t, 20, '#fff4c8', .35 * tear); aurCloudsPx(x, t, H - 110, `rgba(${lerp(30, 255, day) | 0},${lerp(24, 250, day) | 0},${lerp(30, 235, day) | 0},0.9)`);
        aurRuins(x, `rgb(${lerp(12, 190, day * .6) | 0},${lerp(10, 170, day * .6) | 0},${lerp(18, 130, day * .6) | 0})`, null);
      }, .3);
      for (let i = 0; i < 3; i++) fx.add({ x: rand(0, W), y: -10, vx: rand(-20, 20), vy: rand(120, 260), life: 3, size: rand(3, 6), color: pick(['#fff', '#ffe9a0']), glow: true });
      fx.draw(c);
      // each pair of wings is announced by a pixel numeral
      if (t > 2.2 && t < 3.9) { const nk = [2.2, 2.9, 3.6][pairs - 1]; c.globalAlpha = 1 - seg(t, nk + .5, nk + .7); bigText(c, ['I', 'II', 'III'][pairs - 1], W / 2, 130, 100, '#ffffff', '#8a6a20'); c.globalAlpha = 1; }
      A(c, W / 2, H - 86 - up * 70, 2.7 + up * .2, t, t < 1.8 ? 'kneel' : t < 3.9 ? 'charge' : 'victory', { transformed: pairs > 0, wingPairs: pairs });
      caption(c, 'Heaven was a draft. I am the final edition.', t, .1, 1.7, '#fff6d0');
      flashAt(c, t, 3.9, 4.3, '#fffbe8');
      titleSlam(c, 'SERAPHIM ASCENDANT', 'I AM THE LIGHT YOU PRAY TO', t, 4.4, '#ffd35a', 84);
    },
  };
}

// THRONE OF HEAVEN — the foe is forced to their knees before a colossal throne; a thousand blades hang in the sky, then fall.
function csAurelionThrone(a, opp) {
  const fx = new ParticleSystem(2600), d = a.def, A = PxKit.actor(d), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.6;
  const swords = []; for (let r = 0; r < 5; r++) for (let i = 0; i < 18; i++) swords.push({ x: 40 + i * 68 + (r % 2) * 34, y: 40 + r * 62, len: 110 + (i * 17 + r * 31) % 50, at: 4.5 + r * .22 + (i % 6) * .03 });
  return {
    name: 'THRONE OF HEAVEN', dur: 8.6, fx,
    cues: [[0, () => aurSfx('aurBellToll')], [1.1, () => aurSfx('aurHeart')], [1.3, () => aurSfx('aurBrand')], [2.4, () => aurSfx('aurChoir', 0, 3)], [3.4, () => aurSfx('aurBlessing')], [4.5, () => aurSfx('aurFall')], [5.0, () => aurSfx('aurSmite')], [5.4, () => aurSfx('aurSmite', 0.1)], [5.8, () => aurSfx('aurSmite', 0.2)], [6.0, () => { aurSfx('aurShatter'); aurSfx('boom'); }]],
    draw(c, t) {
      const hang = ease.out(seg(t, 2.4, 3.6)), fall = t - 4.5, white = ease.in(seg(t, 5.0, 6.0)), after = t - 6.1;
      PxKit.scene(c, x => {
        aurSkyPx(x, '#3a2c10', '#e8c870'); aurRaysPx(x, W / 2, 120, t, 24, '#fff8d8', .35); aurCloudsPx(x, t * .5, H - 80, 'rgba(255,250,235,0.95)', 10);
        // the throne: tall, gold-edged, wings of stone
        const tk = ease.out(seg(t, .1, 1.1)); x.save(); x.translate(W / 2, H - 100); x.scale(tk, tk); x.fillStyle = '#f4ecd6'; x.strokeStyle = '#b8903a'; x.lineWidth = 6;
        x.beginPath(); x.moveTo(-170, 0); x.lineTo(-150, -330); x.lineTo(-90, -420); x.lineTo(0, -470); x.lineTo(90, -420); x.lineTo(150, -330); x.lineTo(170, 0); x.closePath(); x.fill(); x.stroke();
        x.fillStyle = '#e6d8b0'; x.fillRect(-210, -60, 420, 60); x.strokeRect(-210, -60, 420, 60); x.globalCompositeOperation = 'lighter'; glowCircle(x, 0, -330, 130, 'rgba(255,240,180,0.8)', 'rgba(0,0,0,0)'); x.restore();
        if (after < 0) { // the swords of the host, row on row
          for (const s of swords) { const p = clamp(fall - (s.at - 4.5), 0, 1), k = hang * (p < 1 ? 1 : 0); if (!k && p <= 0) continue; const fy = p <= 0 ? s.y + (1 - hang) * -300 : lerp(s.y, H - 130, p * p); if (p >= 1) continue; x.globalAlpha = Math.min(1, hang * 1.4); drawHolyBlade(x, s.x, fy, s.len, Math.PI / 2, t, { glow: .6 + p }); x.globalAlpha = 1; }
        } else { x.fillStyle = `rgba(40,30,10,${Math.min(.6, after * .8)})`; x.fillRect(0, 0, W, H); aurRaysPx(x, W / 2, H - 120, t, 30, '#fff', .45); for (let i = 0; i < 36; i++) { const bx = W / 2 + (i - 18) * 20, bh = 70 + ((i * 37) % 80); drawHolyBlade(x, bx, H - 80 - bh, bh + 40, Math.PI / 2 + (i - 18) * .025, t, { glow: .5, w: .8 }); } }
      }, .3);
      // the figures
      if (after < 0) {
        A(c, W / 2, H - 175, 2.0, t, t < 2.4 ? 'intro' : 'victory', { transformed: true, wingPairs: 3 });
        const sink = ease.out(seg(t, .8, 1.3));
        silhouette(c, o => drawCharAt(o, opp.def, W * .7, H - 30 + 10 * sink, oppScale, -1, { pose: t > 1.1 ? 'kneel' : 'hurt', anim: t, transformed: opp.transformed }), '#4a3a14');
        if (t > 1.1 && t < 2.4) { c.globalAlpha = seg(t, 1.1, 1.3); bigText(c, 'KNEEL.', W / 2, 150, 130, '#ffffff', '#8a6a20'); c.globalAlpha = 1; }
        if (t < 1.05) caption(c, 'You stand in the presence of a god.', t, .1, 1.05, '#fff6d0');
        if (t > 2.5 && t < 4.4) caption(c, 'Be judged.', t, 2.6, 4.3, '#fff6d0');
      } else {
        if (after < .6) silhouette(c, o => drawCharAt(o, opp.def, W * .5, H - 30, oppScale, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }), '#ffffff'); else { c.save(); c.translate(W * .5, H - 20); c.rotate(-1.4 * ease.out(seg(after, .6, 1.2))); silhouette(c, o => { o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.restore(); drawCharAt(o, opp.def, 0, 0, oppScale * .9, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }); }, '#2a1c08'); c.restore(); }
        A(c, W * .3, H - 160 + Math.sin(t * 2) * 5, 2.4, t, 'victory', { transformed: true, wingPairs: 3 });
      }
      if (fall > 0 && after < 0 && Math.random() < .5) fx.add({ x: rand(W * .3, W * .7), y: H - 100, vx: rand(-100, 100), vy: rand(-500, -100), life: .7, size: rand(4, 9), color: pick(['#fff', '#ffe9a0']), glow: true, g: 700 });
      fx.draw(c);
      flash(c, after < 0 ? white * .85 : Math.max(0, .85 - after * 1.6), '#fffbe8');
      if (after > 0.9) titleSlam(c, 'THRONE OF HEAVEN', `${opp.def.name} HAS BEEN JUDGED`, t, 7.1, '#ffd35a', 96);
    },
  };
}

// The fall: kneeling in the rubble, the halo cracks and drops, black feathers bloom.
function csAurelionFall(f) {
  const fx = new ParticleSystem(1800), d = f.baseDef || f.def, killer = f.opp ? f.opp.def : null, A = PxKit.actor(d), B = PxKit.actor(d);
  return {
    name: 'FALLEN GOD', dur: 6.8, fx,
    cues: [[0, () => aurSfx('aurHeart')], [0.8, () => aurSfx('aurHeart', 0.2)], [1.3, () => aurSfx('aurShatter')], [2.2, () => { aurSfx('aurFall'); aurSfx('boom'); }], [2.9, () => aurSfx('aurChoir', 0, 2)], [3.9, () => { aurSfx('boom'); aurSfx('aurSmite'); }]],
    draw(c, t) {
      const dark = ease.inOut(seg(t, 1.8, 3.2)), rise = ease.out(seg(t, 2.2, 3.4)), crack = seg(t, .5, 1.5), fell = t > 2.4;
      PxKit.scene(c, x => {
        aurSkyPx(x, `rgb(${lerp(70, 10, dark) | 0},${lerp(50, 0, dark) | 0},${lerp(30, 4, dark) | 0})`, `rgb(${lerp(150, 110, dark) | 0},${lerp(110, 10, dark) | 0},${lerp(60, 24, dark) | 0})`);
        aurRuins(x, `rgb(${lerp(70, 14, dark) | 0},${lerp(56, 6, dark) | 0},${lerp(44, 8, dark) | 0})`, null);
        x.globalCompositeOperation = 'lighter'; glowCircle(x, W / 2, H - 200, 380 * dark, 'rgba(255,30,50,0.45)', 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over';
        x.fillStyle = dark > .3 ? '#12040a' : '#3a2e22'; x.fillRect(0, H - 80, W, 80);
      }, .3);
      // black feathers falling and rising
      if (t > 2.0) for (let i = 0; i < 4; i++) fx.add({ x: W / 2 + rand(-60, 60), y: H - 150 + rand(-60, 60), vx: rand(-500, 500), vy: rand(-600, 200), life: 1.6, size: rand(5, 10), color: pick(['#12040a', '#2a0a12', '#ff2a3a']), shape: 'rect', rot: rand(0, 6), vr: rand(-6, 6), g: 120 });
      const sh = t > 2.1 && t < 3.6 ? rand(-6, 6) * (1 - seg(t, 2.1, 3.6)) : 0;
      c.save(); c.translate(sh, sh * .6);
      c.save(); c.globalAlpha = 1 - rise; A(c, W / 2, H - 70, 2.9, t, 'kneel', { transformed: true, wingPairs: 3 }); c.restore();
      if (fell) { c.save(); c.globalAlpha = rise; B(c, W / 2, H - 70 - rise * 6, 2.9 + rise * .15, t, t < 3.9 ? 'charge' : 'victory', { transformed: true, fallen: true }); c.restore(); }
      c.restore();
      // the halo cracks: pixel fractures across the ring, then it falls in pieces
      if (t < 2.3) { const hx = W / 2 + 6, hy = H - 70 - 123 * 2.9; c.save(); c.strokeStyle = '#2a1a12'; c.lineWidth = 6; c.lineCap = 'square'; for (let i = 0; i < 6; i++) { const a = i * 1.05 + .3; if (i / 6 > crack) break; c.beginPath(); c.moveTo(hx + Math.cos(a) * 44, hy + Math.sin(a) * 13); c.lineTo(hx + Math.cos(a) * 44 + Math.sin(a + i) * 14, hy + Math.sin(a) * 13 + 14); c.stroke(); } c.restore();
        if (t > 1.3 && t < 1.4) for (let i = 0; i < 14; i++) fx.add({ x: hx + rand(-44, 44), y: hy + rand(-8, 8), vx: rand(-120, 120), vy: rand(-80, 40), life: 1.6, size: rand(5, 9), color: pick(['#ffd878', '#fff6d0']), glow: true, g: 900 }); }
      fx.draw(c);
      if (killer && t < 1.1) caption(c, killer.name + '... a MORTAL...?', t, .2, 1.1, '#ffe08a');
      if (t > 1.3 && t < 2.35) caption(c, 'No. NO. I AM A GOD!', t, 1.35, 2.3, '#ff5a6a');
      flashAt(c, t, 1.3, 1.5, '#ff2a3a'); flashAt(c, t, 3.9, 4.3, '#ff6a7a');
      titleSlam(c, 'FALLEN GOD', 'IF I CANNOT BE WORSHIPPED, I WILL BE FEARED', t, 4.3, '#ff2a3a', 100);
    },
  };
}
aurelion.corruptCutscene = csAurelionFall;

// DEICIDE (Fallen ultimate): he drags the foe into a black sky; the shattered halo becomes a ring of blades.
function csAurelionDeicide(a, opp) {
  const fx = new ParticleSystem(2600), d = a.baseDef || a.def, A = PxKit.actor(d), city = makeCineCity(16, 120, 320), baseY = H - 30, oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.5;
  return {
    name: 'DEICIDE', dur: 7.8, fx,
    cues: [[0, () => aurSfx('aurFall')], [1.2, () => aurSfx('aurChoir', 0, 2)], [2.6, () => aurSfx('aurShatter')], [3.6, () => aurSfx('aurSmite')], [4.3, () => { aurSfx('boom'); aurSfx('aurFall'); }], [4.6, () => aurSfx('aurSmite', 0.1)], [5.6, () => aurSfx('aurHeart')]],
    draw(c, t) {
      const up = ease.out(seg(t, .6, 2.4)), ring = ease.inOut(seg(t, 2.4, 3.6)), drop = ease.in(seg(t, 3.7, 4.4)), after = t - 4.4;
      PxKit.scene(c, x => {
        aurSkyPx(x, '#040002', '#4a0610'); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 50; i++) { x.fillStyle = 'rgba(255,60,80,0.6)'; x.fillRect((i * 83) % W, (i * 47 + t * 20) % (H * .7), 4, 4); } x.globalCompositeOperation = 'source-over';
        if (t < 4.4) drawCineCity(x, city, baseY + up * 520 + drop * -520, '#12040a', false);
        else { drawCineCity(x, city.map(b => Object.assign({}, b, { dead: true })), baseY, '#0a0205', false); x.globalCompositeOperation = 'lighter'; glowCircle(x, W / 2, baseY, 700 * ease.out(seg(after, 0, .8)), `rgba(255,30,50,${.6 * (1 - seg(after, .8, 2.4))})`, 'rgba(0,0,0,0)'); x.strokeStyle = `rgba(255,40,60,${1 - seg(after, 0, .5)})`; x.lineWidth = 30 * (1 - seg(after, 0, .5)) + 4; x.beginPath(); x.moveTo(W / 2, -20); x.lineTo(W / 2 + 20, baseY); x.stroke(); x.globalCompositeOperation = 'source-over'; }
        if (t > 2.4 && t < 4.4) for (let i = 0; i < 16; i++) { const an = i * Math.PI / 8 + t * .8, R = lerp(520, 150 + drop * 150, ring); drawHolyBlade(x, W / 2 + Math.cos(an) * R, H * .46 + Math.sin(an) * R * .7, 120, an + Math.PI, t, { fallen: true, glow: ring }); }
      }, .3);
      if (t < 4.4) {
        const fy = lerp(H * .62, H * .46, ring) + drop * 220 - up * 130 * (1 - ring);
        A(c, lerp(W * .4, W * .43, ring), fy + (t < 2.4 ? 0 : 110), 2.3, t, t < 2.4 ? 'fly' : 'victory', { transformed: true, fallen: true });
        silhouette(c, o => drawCharAt(o, opp.def, lerp(W * .6, W / 2, ring), lerp(H * .66, H * .5, ring) + drop * 220 - up * 110 * (1 - ring) + 80, oppScale, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }), '#1a0206');
        if (t < 1.4) caption(c, 'If I fall... you fall with me.', t, .1, 1.35, '#ff8a9a');
        if (t > 2.6) { c.globalAlpha = Math.min(1, ring); bigText(c, 'DEICIDE', W / 2, 90, 90 * ring + 1, '#ff2a3a', '#000'); c.globalAlpha = 1; }
      } else {
        if (after < .06) for (let i = 0; i < 16; i++) fx.add({ x: W / 2 + rand(-40, 40), y: baseY, vx: rand(-900, 900), vy: rand(-900, -200), life: 1, size: rand(8, 18), color: pick(['#ff2a3a', '#2a0008', '#888']), glow: true, g: 1200 });
        silhouette(c, o => { o.save(); o.translate(W * .7, baseY - 12); o.rotate(-1.45); drawCharAt(o, opp.def, 0, 0, oppScale * .9, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }); o.restore(); }, '#050001');
        c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W * .4, baseY - 200, 380, 'rgba(255,20,40,0.3)', 'rgba(0,0,0,0)'); c.restore();
        A(c, W * .4, baseY - 6, 2.6, t, 'intro', { transformed: true, fallen: true });
        if (after > 1) titleSlam(c, 'DEICIDE', 'NOW WE ARE BOTH FALLEN', t, 5.5, '#ff2a3a', 110);
      }
      fx.draw(c);
      flashAt(c, t, 4.3, 4.7, '#ffd0d8');
    },
  };
}

// ---------------- rivalries ----------------
rival('aurelion', 'seraph', [[0, 'Sister. You chose to love the mortals. How... small.'], [1, 'And you chose to love yourself. Heaven weeps for both of us, Aurelion.'], [0, 'Heaven does not weep. Heaven works for ME.']],
  { aurelion: 'Your mercy is weakness. Your defeat is proof.', seraph: 'Come home, brother. Before you fall for good.' });
rival('aurelion', 'eric', [[0, 'The moonborn. A beast wearing a boy.'], [1, "And you're a guy wearing a LOT of gold."], [0, 'Kneel, ape.'], [1, 'Hard pass.']],
  { aurelion: 'The moon should have chosen better.', eric: 'Nice sword. Bit much, honestly.' });
rival('aurelion', 'helios', [[1, 'Another who calls himself a god. How exhausting.'], [0, 'I do not call myself one, Helios. I simply AM one. You merely glow.']],
  { aurelion: 'The sun sets. Aurelion does not.', helios: 'Even the sun knows humility. It sets every night.' });
rival('aurelion', 'judge', [[1, 'Aurelion. Charge: impersonating a deity.'], [0, 'Your court has no jurisdiction over Heaven.'], [1, 'Everything is under my jurisdiction.']],
  { aurelion: 'Case dismissed. By God.', judge: 'Guilty. Sentence: humility. Two thousand hours.' });
rival('aurelion', 'vex', [[1, 'You want to be worshipped. I want everything to end. We could reach an arrangement.'], [0, 'Gods do not make arrangements with rounding errors.']],
  { aurelion: 'Even the void kneels.', vex: 'Gods, stars, cities. All temporary.' });

// ============================================================
//  SERAPHIM ASCENDANT: Seraphic Charge and the TRIBUNAL OF THE SEVEN TRUMPETS.
// ============================================================
const AUR_F_CHARGE = Object.assign(Mv.rush({ name: 'Seraphic Charge', desc: 'Ascended: he crosses the stage on his wings, passing through the foe and branding 2 Sins.', s: 8, speed: 1700, frames: 14, pass: true, hit: { dmg: 76, kb: [380, -420], launch: true } }), { swing: [-0.2, -0.9, 0.05], onHit: aurSinOnHit(2), ev: { 1: () => aurSfx('aurFall') } });
const AUR_F_ULT = superize(mk({ name: 'TRIBUNAL OF THE SEVEN TRUMPETS', desc: 'Ascended: seven trumpets sound and seven pillars of judgment march across the stage toward the foe. The seventh is a colossal sword that tracks them. Blockable. Must connect.', pose: 'cast_up', s: 48, a: 4, r: 26, swing: [-1.57, -1.57, -1.57],
  ev: { 1: f => { aurSfx('aurChoir', 0, 2.2); const t = f.opp; f.ultTele = Combat.telegraph(f, { x: t ? t.x : f.x, follow: t, track: .16, r: 110, life: 999, color: '#ffe08a', column: true });
      for (let i = 0; i < 6; i++) { const x = clamp(f.x + f.facing * (130 + i * 150), 40, Arena.stage.width - 40); Combat.telegraph(f, { x, r: 58, life: 10 + i * 6, color: '#fff0b0', column: true, onFire: h => { for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) { const r = Combat.resolveHit(o, f, H_({ dmg: 38, guard: 'mid', hs: 18, kb: [0, -300], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: AUR_F_ULT }); if (r === 'hit') aurSin(f, o, 1); } Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 16, color: '#fff6d0', sword: true }); aurSfx('aurBellToll'); } }); } },
    48: f => { const x = f.ultTele ? f.ultTele.x : f.x; if (f.ultTele) f.ultTele.life = 0; f.ultTele = null;
      for (const o of Combat.targets(f.side)) if (Math.abs(o.x - x) < 120) Combat.resolveHit(o, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: x, move: AUR_F_ULT });
      Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x, r: 120, life: 34, color: '#fff6d0', sword: true, giant: true }); Cam.shake = 22; aurSfx('aurSmite'); aurSfx('boom'); } } }), 300);
AUR_F_ULT.id = 'aurelion_fult'; AUR_F_ULT.recoverWhiff = 30;
AUR_F_ULT.ult = { dmg: 1240, cutscene: (a, t) => csAurelionTrumpets(a, t), fx: { el: 'light', color: '#ffe08a', sky: ['#2a2010', '#9a7a3a', '#fff0c0'] } };
Object.assign(aurelion.form, { ult: AUR_F_ULT });
aurelion.form.moves['6S'] = AUR_F_CHARGE; AUR_F_CHARGE.id = 'aurelion_f6S'; AUR_F_CHARGE.slot = '6S'; AUR_F_CHARGE.owner = 'aurelion';
aurelion.form.desc += ' Also gains Seraphic Charge and the ultimate TRIBUNAL OF THE SEVEN TRUMPETS.';

// TRIBUNAL OF THE SEVEN TRUMPETS — seven seraphs raise seven horns; the sky breaks seven times; the seventh break is a sword.
function csAurelionTrumpets(a, opp) {
  const fx = new ParticleSystem(2600), A = PxKit.actor(a.def), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.55;
  return {
    name: 'TRIBUNAL OF THE SEVEN TRUMPETS', dur: 9.0, fx,
    cues: [[0, () => aurSfx('aurBellToll')], [1.2, () => aurSfx('aurBlessing')], [2.0, () => aurSfx('aurBlessing')], [2.8, () => aurSfx('aurBlessing')], [3.6, () => aurSfx('aurBlessing')], [4.4, () => aurSfx('aurBlessing')], [5.2, () => aurSfx('aurBlessing')], [6.0, () => aurSfx('aurChoir', 0, 2)], [6.6, () => { aurSfx('aurSmite'); aurSfx('aurShatter'); aurSfx('boom'); }]],
    draw(c, t) {
      const horns = Math.min(7, Math.max(0, Math.floor((t - 1.0) / .8))), fall = seg(t, 6.0, 6.7), after = t - 6.7, gy = H - 80;
      PxKit.scene(c, x => {
        aurSkyPx(x, `rgb(${lerp(30, 255, Math.min(1, horns / 7)) | 0},${lerp(24, 226, Math.min(1, horns / 7)) | 0},${lerp(20, 150, Math.min(1, horns / 7)) | 0})`, '#e8c870');
        aurRaysPx(x, W / 2, 80, t, 7, '#fff8d8', .22 + .3 * horns / 7);
        // seven rifts in the sky, one per trumpet
        x.save(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < horns; i++) { const rx = W * (.1 + i * .13), k = ease.out(Math.min(1, (t - 1.0 - i * .8) / .6)); x.fillStyle = 'rgba(255,255,236,0.9)'; x.fillRect(rx - 12 * k, 0, 24 * k, H * .5 * k); aurRaysPx(x, rx, 0, t + i, 6, '#fff4c8', .2); } x.restore();
        aurCloudsPx(x, t * .6, H - 100, 'rgba(255,250,235,0.95)', 10);
        if (fall > 0) { drawHolyBlade(x, W * .7, lerp(-300, gy - 20, fall * fall), 600, Math.PI / 2, t, { glow: 1, w: 3.4 }); }
        if (after > 0) { x.fillStyle = `rgba(255,255,240,${Math.max(0, 1 - after * 1.2)})`; x.fillRect(0, 0, W, H); aurRaysPx(x, W * .7, gy, t, 30, '#fff', .5); }
        x.fillStyle = '#e8d8a8'; x.fillRect(0, gy, W, H - gy);
      }, .3);
      // seven seraphs, each lifting a horn as its rift opens
      for (let i = 0; i < 7; i++) { const sx = W * (.1 + i * .13), k = ease.out(Math.min(1, Math.max(0, (t - 1.0 - i * .8) / .6))); if (k <= 0) continue; c.save(); c.globalAlpha = k * (after > 0.4 ? 0 : 1); c.translate(sx, 120 + 40 * (1 - k)); c.fillStyle = '#fffbee'; c.fillRect(-10, 0, 20, 52); c.fillStyle = '#e0b448'; c.fillRect(-10, 22, 20, 5); c.fillRect(-4, -14, 8, 14); c.beginPath(); c.moveTo(6, 6); c.lineTo(52, -14); c.lineTo(52, 14); c.closePath(); c.fill(); c.fillStyle = '#fff'; for (let j = 0; j < 5; j++) c.fillRect(-26 - j * 6, 10 + j * 5, 24, 4); c.restore(); }
      if (after < 0.1) silhouette(c, o => drawCharAt(o, opp.def, W * .7, gy + 4, oppScale, -1, { pose: 'kneel', anim: t, transformed: opp.transformed }), '#6a5420');
      else silhouette(c, o => drawCharAt(o, opp.def, W * .7, gy + 4, oppScale, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), '#3a2a08');
      A(c, W * .3, gy - 20 - ease.out(Math.min(1, t / 1.2)) * 30, 2.6, t, t < 6 ? 'intro' : 'victory', { transformed: true, wingPairs: 3 });
      fx.draw(c);
      if (horns < 3) caption(c, 'The first trumpet is a warning.', t, .4, 2.6, '#fff6d0'); else if (t < 6) caption(c, 'The seventh is a sentence.', t, 3.6, 5.8, '#fff6d0');
      flashAt(c, t, 6.6, 7.2, '#fffbe8');
      if (t > 7.4) titleSlam(c, 'TRIBUNAL OF THE SEVEN TRUMPETS', `${opp.def.name} HAS BEEN SENTENCED`, t, 7.5, '#ffd35a', 62);
    },
  };
}
