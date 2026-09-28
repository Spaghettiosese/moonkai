// ============================================================
//  MOONKAI — AURELION, the Self-Made God (bespoke)
//
//  SIN            Most of his blows brand the foe with Sin (gold sigils, max 5). At five
//                 Sins, JUDGMENT: a pillar of light tracks and smites them (unblockable).
//  KNEEL          His lunge spends 3 Sins to force the foe to their knees (long stun).
//  HOLY GROUND    Plants the greatsword: enemy projectiles burn away inside the circle,
//                 foes standing in it accrue Sin, and he takes less damage there.
//  YOU DARE?      Parry. Striking a god brands you with two Sins.
//  SERAPHIM ASCENDANT  permanent awakening: six wings of light, Trinity Edict, bigger Judgment.
//  FALLEN GOD     KO'd while ascended by a MORTAL (not divine)? His pride shatters: he rises
//                 once as the Fallen God with a new kit built on DAMNATION instead of Sin.
// ============================================================

// Fighters who count as divine: their finishing blow is a fair judgment, no rage.
const DEITIES = ['seraph', 'helios', 'judge', 'astra', 'luna', 'aurelion', 'aatrox', 'volibear'];

const aurSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const isFallen = v => !!(v && (v.corrupted || v.fallen));

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

// ---------------- Sin & Judgment ----------------
function aurSin(a, t, n) {
  if (!t || t.hp <= 0 || !Game.battle) return;
  Combat.mark(t, a, 'sin', n, { max: 5, dur: 8, color: '#ffd35a', label: 'SIN', onMax: (tt, o) => aurJudgment(o, tt) });
}
function aurJudgment(owner, t) {
  Combat.consumeMark(t, 'sin');
  const big = owner.form;
  Game.popWorld(t.x, t.y - t.h - 60, 'JUDGMENT', '#fff0b0', 28);
  aurSfx('bell');
  Combat.telegraph(owner, { x: t.x, follow: t, track: 0.3, r: big ? 110 : 80, life: 22, color: '#fff0b0', column: true,
    onFire: h => {
      for (const o of Combat.targets(owner.side)) if (Math.abs(o.x - h.x) < h.r) Combat.resolveHit(o, owner, H_({ dmg: big ? 140 : 110, guard: 'unblock', hs: 40, kb: [0, -520], launch: true, stun: 0.3, sfx: 'h' }), { proj: true, fromX: h.x });
      Combat.addHazard({ kind: 'aurPillar', owner, side: owner.side, x: h.x, r: h.r, life: 22, color: '#fff6d0' });
      Cam.shake = Math.max(Cam.shake, 12); aurSfx('zap'); aurSfx('boom');
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
      Cam.shake = Math.max(Cam.shake, 12); aurSfx('boom');
    } });
  } });
}
const aurSinOnHit = n => (a, t) => aurSin(a, t, n);
const aurDamnOnHit = n => (a, t) => aurDamn(a, t, n);

// ---------------- base kit ----------------
const AUR_EDICT = Mv.shot({ name: 'Divine Edict', desc: 'A piercing lance of light. Brands 1 Sin.', s: 16, swing: [-0.2, -0.7, 0], pose: 'punch', ai: { min: 150, max: 1600, use: 'zone' },
  proj: { speed: 1500, r: 10, dmg: 52, kind: 'spear', color: '#ffe9a8', core: '#fff', pierce: true, hs: 20, kb: [220, -40], onHit: (t, p) => aurSin(p.owner, t, 1) } });
const AUR_TRINITY = Mv.shot({ name: 'Trinity Edict', desc: 'Three lances of light. Each brands 1 Sin.', s: 16, swing: [-0.2, -0.7, 0], pose: 'punch', ai: { min: 150, max: 1600, use: 'zone' },
  proj: { speed: 1500, r: 10, dmg: 34, count: 3, spread: 0.3, kind: 'spear', color: '#fff4c8', core: '#fff', pierce: true, hs: 18, kb: [180, -40], onHit: (t, p) => aurSin(p.owner, t, 1) } });
const AUR_KNEEL = mk({ name: 'Kneel', desc: 'A long lunge. With 3+ Sins, it spends them and forces the foe to their knees.', pose: 'dash', s: 12, a: 10, r: 18, swing: [-0.3, -0.9, 0.02],
  vel: [[12, 22, 1100, null]], hit: { dmg: 88, box: [-10, -115, 130, 95], kb: [520, -180], hs: 22, bs: 14 }, ai: { min: 0, max: 220, use: 'approach' },
  onHit: (a, t) => {
    if (Combat.markCount(t, 'sin') >= 3) {
      Combat.mark(t, a, 'sin', -3, { max: 5, dur: 8, color: '#ffd35a' });
      if (Combat.markCount(t, 'sin') <= 0) delete t.marks.sin;
      t.vx = 0; t.hitstun = Math.max(t.hitstun, 70); t.status.stun = Math.max(t.status.stun || 0, 1.1);
      if (t.airborne) t.vy = 900;
      Game.popWorld(t.x, t.y - t.h - 40, 'KNEEL.', '#fff0b0', 30); aurSfx('bell'); Cam.shake = 10;
    } else aurSin(a, t, 1);
  } });
const AUR_GROUND = mk({ name: 'Holy Ground', desc: 'Plants the sword: projectiles burn away inside, foes inside accrue Sin, he takes 20% less damage there.', pose: 'slam', s: 14, a: 1, r: 20, cd: 9,
  swing: [-1.6, -2.2, 1.45], ai: { min: 0, max: 260, use: 'trap' },
  ev: { 14: f => { Combat.hazards = Combat.hazards.filter(h => !(h.kind === 'aurGround' && h.owner === f)); Combat.addHazard({ kind: 'aurGround', owner: f, side: f.side, x: f.x, r: 180, life: Math.round(3.5 * FPS) }); aurSfx('bell'); Cam.shake = 6; } } });
const AUR_DARE = Object.assign(Mv.counter({ name: 'You Dare?', desc: 'Parry. Striking a god brands the fool with 2 Sins.', window: 22, dmg: 120 }), { swing: [-1.57, -1.57, -1.57] });
const AUR_DESCENT = Mv.dive({ name: 'Descent of Heaven', desc: 'A plunging sword dive. Brands 1 Sin.', pose: 'air_spike', vx: 520, vy: 1400, hit: { dmg: 80, box: [-10, -70, 110, 80], gb: true, kb: [200, 900], guard: 'high' } });
AUR_DESCENT.onHit = aurSinOnHit(1);

const AUR_SUPER = superize(mk({ name: 'Edenfall', desc: 'Swords of light rain on the foe: 3, plus one per Sin (spends all Sins).', pose: 'cast_up', s: 16, a: 1, r: 26, swing: [-1.57, -1.57, -1.57],
  ev: { 16: f => {
    const t = f.opp; if (!t) return;
    const n = 3 + Combat.consumeMark(t, 'sin');
    for (let i = 0; i < n; i++) Combat.telegraph(f, { x: clamp(t.x + (i - (n - 1) / 2) * 64, 40, Arena.stage.width - 40), r: 48, life: 22 + i * 5, color: '#fff0b0', column: true, onFire: h => {
      for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) Combat.resolveHit(o, f, H_({ dmg: 46, guard: 'mid', hs: 18, bs: 12, kb: [0, -320], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: AUR_SUPER });
      Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 14, color: '#fff6d0', sword: true }); aurSfx('clang');
    } });
  } } }), 100);

const AUR_ULT = superize(mk({ name: 'THRONE OF HEAVEN', desc: 'A colossal sword falls on the foe, tracking them. Blockable. Must connect.', pose: 'cast_up', s: 18, a: 36, r: 22, swing: [-1.57, -1.57, -1.57],
  ev: { 18: f => {
    const t = f.opp; if (!t) return;
    Combat.telegraph(f, { x: t.x, follow: t, track: 0.2, r: 110, life: 34, color: '#ffe08a', column: true, onFire: h => {
      for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) Combat.resolveHit(o, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: h.x, move: AUR_ULT });
      Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 30, color: '#fff6d0', sword: true, giant: true });
      Cam.shake = 20; aurSfx('boom'); aurSfx('clang');
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
  draw: drawAurelion, drawPortrait: drawAurelionPortrait, transformCutscene: f => csAurelionAscend(f),
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
    cost: 300, flight: true, dmg: 1.08, speed: 1.06, scale: 1.12, jump: 1.1, moves: { '5S': AUR_TRINITY } },
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
  draw: drawAurelion, drawPortrait: drawAurelionPortrait, passiveArmor: null,
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

// ---------------- cinematics ----------------
function aurSkyGold(c, k) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${lerp(40, 255, k) | 0},${lerp(30, 236, k) | 0},${lerp(20, 190, k) | 0})`); g.addColorStop(1, `rgb(${lerp(90, 200, k) | 0},${lerp(70, 150, k) | 0},${lerp(40, 70, k) | 0})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function aurRays(c, x, y, t, n, col, alpha) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = col;
  for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n + t * 0.15; c.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(i * 3 + t)); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a - 0.04) * 1600, y + Math.sin(a - 0.04) * 1600); c.lineTo(x + Math.cos(a + 0.04) * 1600, y + Math.sin(a + 0.04) * 1600); c.fill(); }
  c.restore();
}
function drawClouds(c, t, y, col, n = 9) { c.fillStyle = col; for (let i = 0; i < n; i++) { const x = ((i * 190 + t * 40) % (W + 300)) - 150; for (let j = 0; j < 4; j++) { c.beginPath(); c.arc(x + j * 42, y + Math.sin(i + j) * 12, 44 + (j % 2) * 16, 0, Math.PI * 2); c.fill(); } } }

// Awakening: Heaven tears open, three pairs of wings unfold, the halo ignites into a sun-crown.
function csAurelionAscend(f) {
  const d = f.def, fx = new ParticleSystem(1800), v = {};
  return {
    name: 'SERAPHIM ASCENDANT', dur: 5.2, fx,
    cues: [[0, () => aurSfx('bell')], [1.4, () => { aurSfx('charge', 1); }], [2.5, () => { aurSfx('bell'); aurSfx('boom'); }], [3.3, () => aurSfx('blast')]],
    draw(c, t) {
      // one shot: he kneels in a shaft of light, rises as three pairs of wings unfold, and the halo ignites into a sun-crown
      aurSkyGold(c, 0.25 + 0.75 * ease.inOut(seg(t, 0.8, 2.6)));
      const tear = ease.out(seg(t, 0.2, 1.4));
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,255,230,0.9)';
      c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2 - 60 * tear, H * 0.35 * tear); c.lineTo(W / 2, H * 0.55 * tear); c.lineTo(W / 2 + 60 * tear, H * 0.35 * tear); c.fill(); c.restore();
      aurRays(c, W / 2, H * 0.3, t, 18, '#fff4c8', 0.35 * tear);
      drawClouds(c, t, H - 90, 'rgba(255,250,235,0.85)');
      for (let i = 0; i < 3; i++) fx.add({ x: rand(0, W), y: -10, vx: rand(-20, 20), vy: rand(120, 260), life: 3, size: rand(3, 6), color: pick(['#fff', '#ffe9a0']), glow: true });
      if (t > 2.5 && t < 2.6) fx.burst(W / 2, H * 0.4, 50, { color: ['#fff', '#ffe9a0', '#ffd35a'], size: 9, speed: 700, glow: true, life: 1 });
      fx.draw(c);
      const pairs = t < 1.5 ? 0 : t < 1.85 ? 1 : t < 2.2 ? 2 : 3;
      const y = H - 40 - 70 * ease.inOut(seg(t, 1.4, 2.7)) - 50 * ease.out(seg(t, 2.5, 3.6));
      cineChar(c, d, v, W / 2, y, lerp(2.5, 2.9, ease.inOut(seg(t, 0, 3))), t, t < 1.4 ? 'kneel' : t < 2.5 ? 'charge' : 'victory', { pairs, transformed: t > 2.5 });
      caption(c, 'Heaven was a draft. I am the final edition.', t, 0.1, 1.4, '#fff6d0');
      if (t > 1.5 && t < 2.5) bigText(c, ['I', 'II', 'III'][Math.max(0, pairs - 1)], W / 2, 120, 90, '#fff', '#8a6a20');
      flashAt(c, t, 2.5, 2.85, '#fffbe8');
      titleSlam(c, 'SERAPHIM ASCENDANT', 'I AM THE LIGHT YOU PRAY TO', t, 2.9, '#ffd35a', 84);
    },
  };
}

// Ultimate: the foe is forced to kneel before a colossal throne; a thousand swords fall.
function csAurelionThrone(a, opp) {
  const fx = new ParticleSystem(2600), d = a.def, v = {}, gy = H - 70, ax = W * 0.3;
  const swords = Array.from({ length: 70 }, (_, i) => ({ x: rand(60, W - 60), y: rand(-560, -60), at: 3.3 + i * 0.011, len: rand(90, 160), hit: false }));
  return {
    name: 'THRONE OF HEAVEN', dur: 7.2, fx,
    cues: [[0, () => aurSfx('bell')], [1.1, () => aurSfx('slam')], [2.3, () => aurSfx('bell')], [3.3, () => aurSfx('charge', 1)], [4.2, () => { aurSfx('boom'); aurSfx('boom', 0.2); aurSfx('clang'); }]],
    draw(c, t) {
      // Aurelion commands the sky: he raises his blade, a thousand swords gather, and they fall to judge the ground before him
      const after = t >= 4.2;
      c.save(); cineShake(c, after ? Math.max(0, 16 - (t - 4.2) * 18) : 0);
      aurSkyGold(c, 0.85); aurRays(c, W / 2, 120, t, 22, '#fff8d8', 0.35 + (after ? 0.25 : 0)); drawClouds(c, t * 0.5, H - 80, 'rgba(255,250,235,0.95)', 10);
      const tk = ease.out(seg(t, 0.2, 1.2));
      c.save(); c.translate(W * 0.68, gy + 10); c.scale(tk, tk);
      c.fillStyle = '#f4ecd6'; c.strokeStyle = '#b8903a'; c.lineWidth = 4;
      c.beginPath(); c.moveTo(-170, 0); c.lineTo(-150, -330); c.lineTo(-90, -420); c.lineTo(0, -470); c.lineTo(90, -420); c.lineTo(150, -330); c.lineTo(170, 0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#e6d8b0'; c.fillRect(-200, -60, 400, 60); c.strokeRect(-200, -60, 400, 60);
      c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -330, 120, 'rgba(255,240,180,0.8)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#e6d8b0'; c.fillRect(0, gy, W, H - gy);
      for (const s of swords) {
        const p = seg(t, s.at, s.at + 0.4), hang = ease.out(seg(t, 2.3, 3.2));
        if (p <= 0) { if (hang > 0) { c.globalAlpha = hang; drawHolyBlade(c, s.x, s.y + 120 + Math.sin(t * 3 + s.x) * 4, s.len, Math.PI / 2, t, { glow: 0.8 }); c.globalAlpha = 1; } continue; }
        const ty = lerp(s.y + 120, gy - s.len * 0.15, p * p);
        drawHolyBlade(c, s.x, ty, s.len, Math.PI / 2, t, { glow: p >= 1 ? 0.4 : 1 });
        if (p >= 1 && !s.hit) { s.hit = true; fx.burst(s.x, gy, 6, { color: ['#fff', '#ffe9a0'], size: 7, speed: 300, glow: true, life: 0.4 }); }
      }
      fx.draw(c);
      const pose = t < 2.3 ? 'intro' : t < 3.3 ? 'cast_up' : t < 4.4 ? 'slam' : 'victory';
      cineChar(c, d, v, ax, gy + 14, 2.7, t, pose, { transformed: true });
      if (after) { const k = seg(t, 4.2, 5.0); c.strokeStyle = `rgba(255,250,220,${1 - k})`; c.lineWidth = 12; c.beginPath(); c.ellipse(W / 2, gy + 6, k * 1200 + 1, k * 100 + 1, 0, 0, Math.PI * 2); c.stroke(); }
      c.restore();
      if (t > 1.1 && t < 2.3) { c.globalAlpha = seg(t, 1.1, 1.3) * (1 - seg(t, 2.1, 2.3)); bigText(c, 'KNEEL.', W / 2, 150, 120, '#fff', '#8a6a20'); c.globalAlpha = 1; }
      caption(c, 'You stand in the presence of a god.', t, 0.1, 1.05, '#fff6d0');
      caption(c, 'Be judged.', t, 2.35, 3.25, '#fff6d0');
      flashAt(c, t, 4.2, 4.6, '#fffbe8');
      if (t > 4.7) titleSlam(c, 'THRONE OF HEAVEN', 'THE VERDICT IS FINAL', t, 4.8, '#ffd35a', 96);
    },
  };
}

// The fall: kneeling in rubble, the halo cracks, black feathers bloom.
function csAurelionFall(f) {
  const fx = new ParticleSystem(1800), d = f.baseDef || f.def, killer = f.opp ? f.opp.def : null, vA = {}, vF = {};
  return {
    name: 'FALLEN GOD', dur: 5.4, fx,
    cues: [[0, () => aurSfx('tone', 220, 0.6, 'sine', 0.1, 110)], [1.3, () => aurSfx('clang')], [2.4, () => { aurSfx('boom'); aurSfx('roar'); aurSfx('screech'); }], [3.6, () => aurSfx('boom')]],
    draw(c, t) {
      // one shot: he kneels as his halo cracks, black feathers burst out of his wings, and the Fallen God rises from the rubble
      const k = ease.inOut(seg(t, 1.3, 3.0)), swap = ease.inOut(seg(t, 1.7, 2.6)), rise = ease.inOut(seg(t, 2.0, 3.2));
      c.save(); cineShake(c, t > 1.3 && t < 2.5 ? 5 : t > 2.4 && t < 3.6 ? 9 * (1 - seg(t, 2.4, 3.6)) : 0);
      aurSkyGold(c, 0.15 * (1 - seg(t, 0, 2)));
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0004'); g.addColorStop(1, '#6a0a18'); c.globalAlpha = k; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
      vignette(c, 0.6 * (1 - k * 0.5));
      if (t > 1.3 && t < 3.2) for (let i = 0; i < 3; i++) fx.add({ x: W / 2 + rand(-160, 160), y: H - 260 + rand(-120, 60), vx: rand(-400, 400), vy: rand(-500, 100), life: 1.4, size: rand(5, 10), color: pick(['#12040a', '#2a0a12', '#ff2a3a']), shape: 'rect', rot: rand(0, 6), vr: rand(-6, 6) });
      if (t > 2.4 && t < 2.6) fx.burst(W / 2, H - 300, 40, { color: ['#12040a', '#ff2a3a', '#ffd0d8'], size: 9, speed: 700, glow: true, life: 1 });
      const y = H - 40 - 90 * rise, s = lerp(2.7, 3.0, k), pose = t < 1.9 ? 'kneel' : t < 3.5 ? 'charge' : 'victory';
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2, y - 200, 420 * k, 'rgba(255,30,50,0.4)', 'rgba(255,30,50,0)'); c.restore();
      c.globalAlpha = 1 - swap; cineChar(c, d, vA, W / 2, y, s, t, pose, { transformed: true, fallen: false }); c.globalAlpha = swap;
      if (swap > 0) cineChar(c, d, vF, W / 2, y, s, t, pose, { transformed: true, fallen: true }); c.globalAlpha = 1;
      fx.draw(c);
      if (t > 2.4) { const w = seg(t, 2.4, 3.2); c.strokeStyle = `rgba(255,40,60,${1 - w})`; c.lineWidth = 8; c.beginPath(); c.ellipse(W / 2, H - 30, w * 1000 + 1, w * 100 + 1, 0, 0, Math.PI * 2); c.stroke(); speedLines(c, t, W / 2, H / 2, `rgba(255,40,60,${0.5 * (1 - w)})`); }
      c.restore();
      if (killer) caption(c, killer.name + '... a MORTAL...?', t, 0.2, 1.2, '#ffe08a');
      caption(c, 'No. NO. I AM A GOD!', t, 1.3, 2.3, '#ff5a6a');
      flashAt(c, t, 1.3, 1.5, '#ff2a3a');
      titleSlam(c, 'FALLEN GOD', 'IF I CANNOT BE WORSHIPPED, I WILL BE FEARED', t, 3.6, '#ff2a3a', 100);
      flashAt(c, t, 2.4, 2.75, '#ff2a3a');
    },
  };
}
aurelion.corruptCutscene = csAurelionFall;

// Fallen ultimate: he drags the foe into a black sky; the shattered halo becomes a ring of blades.
function csAurelionDeicide(a, opp) {
  const fx = new ParticleSystem(2600), d = a.baseDef || a.def, city = makeCineCity(16, 120, 320), baseY = H - 30, v = {};
  const C = [W * 0.62, H * 0.42], hitX = W * 0.6;
  return {
    name: 'DEICIDE', dur: 6.6, fx,
    cues: [[0, () => aurSfx('screech')], [1.0, () => aurSfx('whoosh')], [2.4, () => aurSfx('clang')], [3.6, () => aurSfx('whoosh')], [4.2, () => { aurSfx('boom'); aurSfx('slam'); aurSfx('boom', 0.2); }]],
    draw(c, t) {
      // one shot: he climbs out of the city, the shattered halo becomes a ring of blades that closes on a point, and he falls as a comet
      const up = ease.inOut(seg(t, 0.5, 2.4)), dive = ease.in(seg(t, 3.5, 4.2)), after = t >= 4.2;
      c.save(); cineShake(c, after ? Math.max(0, 20 - (t - 4.2) * 18) : t > 3.5 ? 4 : 0);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#040002'); g.addColorStop(1, '#4a0610'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      if (after) for (const b of city) b.dead = true;
      drawCineCity(c, city, baseY + up * 500 * (1 - dive), after ? '#0a0205' : '#12040a', false);
      const hover = [W * 0.42, lerp(H * 0.66, H * 0.4, up)], tgt = [hitX, baseY - 60];
      const px = lerp(hover[0], tgt[0], dive), py = lerp(hover[1], tgt[1], dive);
      if (t > 2.4 && t < 3.6) { const k = ease.out(seg(t, 2.4, 3.2)), col = seg(t, 3.0, 3.5);
        for (let i = 0; i < 16; i++) { const an = i * Math.PI / 8 + t * 0.8, R = lerp(520, 170, k) * (1 - col * 0.6); drawHolyBlade(c, C[0] + Math.cos(an) * R, C[1] + Math.sin(an) * R * 0.7, 120, an + Math.PI, t, { fallen: true, glow: k }); }
        c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, C[0], C[1], 30 + 150 * k, 'rgba(255,30,50,0.8)', 'rgba(0,0,0,0)'); c.restore(); }
      if (t >= 3.5 && !after) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,40,60,0.8)'; c.lineWidth = 40 * (1 - dive) + 8; c.beginPath(); c.moveTo(hover[0], hover[1]); c.lineTo(px, py); c.stroke(); c.restore();
        fx.add({ x: px, y: py, vx: rand(-200, 200), vy: rand(-300, 0), life: 0.6, size: rand(10, 22), color: pick(['#ff2a3a', '#2a0008', '#ff8a5a']), glow: true }); }
      if (t > 4.2 && t < 4.5) for (let i = 0; i < 6; i++) fx.add({ x: hitX, y: baseY, vx: rand(-900, 900), vy: rand(-900, -200), life: 1, size: rand(8, 18), color: pick(['#ff2a3a', '#2a0008', '#888']), glow: true, g: 1200 });
      if (after) { c.save(); c.globalCompositeOperation = 'lighter'; const k = seg(t, 4.2, 5.0); c.strokeStyle = `rgba(255,40,60,${1 - k})`; c.lineWidth = 12; c.beginPath(); c.ellipse(hitX, baseY - 10, k * 1100 + 1, k * 140 + 1, 0, 0, Math.PI * 2); c.stroke(); glowCircle(c, hitX, baseY, 600 * ease.out(k), `rgba(255,30,50,${0.5 * (1 - k)})`, 'rgba(0,0,0,0)'); c.restore(); }
      fx.draw(c);
      const pose = t < 3.5 ? 'fly' : !after ? 'air_spike' : t < 4.8 ? 'kneel' : 'intro';
      cineChar(c, d, v, after ? hitX : px, after ? baseY - 6 : py, lerp(2.2, 2.5, dive), t, pose, { transformed: true, fallen: true });
      c.restore();
      caption(c, 'If I fall... you fall with me.', t, 0.1, 1.3, '#ff8a9a');
      if (t > 2.4 && t < 3.6) bigText(c, 'DEICIDE', W / 2, 90, 90 * ease.out(seg(t, 2.4, 3.2)) + 1, '#ff2a3a', '#000');
      flashAt(c, t, 4.2, 4.6, '#ffd0d8');
      if (t > 4.7) titleSlam(c, 'DEICIDE', 'NOW WE ARE BOTH FALLEN', t, 4.8, '#ff2a3a', 110);
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
