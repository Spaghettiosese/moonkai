// ============================================================
//  MOONKAI — AATROX, the Darkin Blade (League of Legends tribute), fully bespoke.
//
//  Nothing here is a stock archetype:
//   • THE DARKIN BLADE  three-cast chain that remembers its stage. Each cast shows a
//                       ground telegraph during the windup; the blade's EDGE is a sweet
//                       spot (big damage + launch), the inner zone is a weak hit.
//                       Cast III is an overhead (block standing).
//   • UMBRAL DASH       usable DURING a Darkin Blade windup to reposition the sweet spot
//                       without cancelling the swing, or out of its recovery.
//   • INFERNAL CHAINS   tethers the foe to an anchor; if they are still inside the ring
//                       when it snaps, they are yanked back and bound.
//   • DEATHBRINGER      passive charge: the sword's eye opens; next hit rends 3.5% of the
//                       foe's max HP and heals him. Sweet spots charge it faster.
//   • WORLD ENDER       awakening: terrifies the foe, sweet spots extend it, and dying in it
//                       seals him in a blood cocoon the foe can hack at to shrink his revival.
//   • DARKIN ANNIHILATION  ultimate: he leaps off-screen and crashes onto the foe. Blockable.
// ============================================================

const aatSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };

// ---------------- art ----------------
const AAT_PAL = { build: 'athletic', skin: '#5a1418', top: '#2a0d10', topDark: '#170507', pants: '#2a0a0c', pantsDark: '#150406', boots: '#120405', belt: '#6a1016', glove: '#3a0a0e', noFace: true, kneepads: '#2a0d10' };
const AAT_WE_PAL = Object.assign({}, AAT_PAL, { skin: '#7a1a1e', top: '#3a0a10', topDark: '#1e0508', belt: '#ff2a2a', kneepads: '#3a0a10' });

// The living Darkin blade: serrated spine, bat-wing guard, and an eye that opens.
function drawDarkinBlade(c, x, y, len, ang, t, o = {}) {
  const w = 14 * (o.w || 1), eye = o.eye ?? 0.2, glow = o.glow || 0;
  c.save(); c.translate(x, y); c.rotate(ang);
  // grip + pommel spike
  c.strokeStyle = '#140405'; c.lineWidth = 5.5 * (o.w || 1); c.lineCap = 'round'; c.beginPath(); c.moveTo(-24 * (o.w || 1), 0); c.lineTo(6, 0); c.stroke();
  c.fillStyle = '#2a0a0c'; c.beginPath(); c.moveTo(-24 * (o.w || 1), -4); c.lineTo(-34 * (o.w || 1), 0); c.lineTo(-24 * (o.w || 1), 4); c.fill();
  // blade body
  const g = c.createLinearGradient(0, -w, 0, w); g.addColorStop(0, '#2a0609'); g.addColorStop(0.5, '#6e0f16'); g.addColorStop(1, '#3a080c');
  c.fillStyle = g; c.strokeStyle = '#0a0102'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(12, -w * 0.7);
  for (let i = 1; i <= 7; i++) { const px = 12 + (len - 12) * i / 8, py = -w * 0.7 * (1 - i / 9) - (i % 2 ? 7 * (o.w || 1) : 0); c.lineTo(px, py); }
  c.lineTo(len, w * 0.05);
  c.quadraticCurveTo(len * 0.62, w * 1.05, 12, w * 0.75); c.closePath(); c.fill(); c.stroke();
  // blood fuller
  c.strokeStyle = glow > 0 ? `rgba(255,${60 + 80 * glow},40,${0.5 + glow * 0.5})` : 'rgba(170,20,30,0.6)'; c.lineWidth = 2.2 * (o.w || 1);
  c.beginPath(); c.moveTo(18, w * 0.12); c.quadraticCurveTo(len * 0.55, w * 0.3, len * 0.9, w * 0.08); c.stroke();
  // bat-wing crossguard
  c.fillStyle = '#1e0709'; c.beginPath(); c.moveTo(4, -18 * (o.w || 1)); c.quadraticCurveTo(14, -6, 8, 0); c.quadraticCurveTo(14, 6, 4, 18 * (o.w || 1)); c.lineTo(16, 10); c.lineTo(18, 0); c.lineTo(16, -10); c.closePath(); c.fill(); c.stroke();
  // the eye
  const ex = len * 0.3, ew = 9 * (o.w || 1), eh = 5 * (o.w || 1) * Math.max(0.08, eye);
  c.fillStyle = '#150204'; c.beginPath(); c.ellipse(ex, 0, ew + 2, eh + 2, 0, 0, Math.PI * 2); c.fill();
  if (eye > 0.1) {
    c.fillStyle = '#ffcf8a'; c.beginPath(); c.ellipse(ex, 0, ew, eh, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#d0101a'; c.beginPath(); c.ellipse(ex, 0, ew * 0.45, eh, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#000'; c.beginPath(); c.ellipse(ex, 0, ew * 0.12, eh * 0.9, 0, 0, Math.PI * 2); c.fill();
  } else { c.strokeStyle = '#ff3a2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(ex - ew, 0); c.lineTo(ex + ew, 0); c.stroke(); }
  if (glow > 0) {
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = `rgba(255,40,30,${0.35 * glow})`; c.lineWidth = 12 * (o.w || 1);
    c.beginPath(); c.moveTo(14, 0); c.lineTo(len, 0); c.stroke();
    glowCircle(c, ex, 0, 22 * (o.w || 1) * glow, 'rgba(255,60,30,0.9)', 'rgba(255,0,0,0)');
    c.globalCompositeOperation = 'source-over';
  }
  c.restore();
}

function aatWings(c, P, t, big, D) {
  const s = big ? 1.25 : 0.55, flap = Math.sin(t * (big ? 5 : 2.5)) * (big ? 0.12 : 0.04);
  for (const side of [-1, 1]) {
    c.save(); c.translate(P.sh[0] - 6, P.sh[1] + 2);
    c.rotate((big ? -0.35 : -0.95) + side * (big ? 0.28 : 0.12) + flap * side);
    c.scale(s, s);
    // membrane
    c.fillStyle = side < 0 ? '#22060a' : '#3a0a10';
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-34, -40); c.lineTo(-92, -72); c.quadraticCurveTo(-84, -48, -104, -22); c.quadraticCurveTo(-86, -10, -86, 18); c.quadraticCurveTo(-64, 12, -44, 34); c.quadraticCurveTo(-26, 16, 0, 10); c.closePath(); c.fill();
    // bones
    c.strokeStyle = '#120304'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-34, -40); c.lineTo(-92, -72); c.moveTo(-34, -40); c.lineTo(-104, -22); c.moveTo(-34, -40); c.lineTo(-86, 18); c.moveTo(-34, -40); c.lineTo(-44, 34); c.stroke();
    // veins
    c.strokeStyle = D ? 'rgba(255,60,40,0.75)' : 'rgba(150,20,30,0.6)'; c.lineWidth = 1.2;
    for (const [a, b] of [[-60, -50], [-70, -10], [-60, 16]]) { c.beginPath(); c.moveTo(-34, -40); c.quadraticCurveTo(a + 10, b - 6, a, b); c.stroke(); }
    // claw at the wing wrist
    c.fillStyle = '#d8c8b0'; c.beginPath(); c.moveTo(-34, -40); c.lineTo(-40, -52); c.lineTo(-30, -44); c.fill();
    c.restore();
  }
}

function aatSwordAng(v) {
  const m = v.move, mf = v.mf || 0;
  if (m && m.aQ !== undefined) { const S = AAT_Q[m.aQ]; if (mf < m.s) return lerp(S.a0, S.a1, ease.out(mf / m.s)); return lerp(S.a1, S.a2, Math.min(1, (mf - m.s) / 4)); }
  if (m && m.aatSuper) { if (mf < m.s) return lerp(-1.4, -2.8, mf / m.s); if (mf < m.s + 16) return lerp(-2.8, 0.1, Math.min(1, (mf - m.s) / 4)); return lerp(-2.9, 0.9, Math.min(1, (mf - m.s - 16) / 4)); }
  const T = { idle: -2.3, walk: -2.3, run: -2.1, backwalk: -2.3, crouch: -2.6, block: -1.7, cblock: -1.9, punch: -0.1, punch2: 0.05, kick: -1.9, heavy: 0.5, slam: 0.9, uppercut: -1.2, cast: -1.3, cast_up: -1.6, dash: 0.2, jump: -2.0, fall: -2.0, fly: -2.2,
    air_light: -0.2, air_mid: 0.3, air_heavy: 0.8, air_spike: 1.4, hurt: 2.3, hurt_air: 2.4, stun: 2.3, kneel: 1.3, victory: -1.57, taunt: -1.57, intro: 1.25, throw: -0.5, charge: -1.57, kichar: -1.57, sweep: 0.2, c_light: 0 };
  return T[v.pose] ?? -2.3;
}

function drawAatroxCocoon(c, v, t) {
  const prog = 1 - (v.cocoonT || 0) / AAT_COCOON, pulse = 1 + Math.sin(t * (6 + prog * 10)) * 0.05;
  glowCircle(c, 0, -60, 120, `rgba(255,20,30,${0.2 + prog * 0.3})`, 'rgba(80,0,0,0)');
  drawDarkinBlade(c, 52, -8, 128, -1.62, t, { eye: 1, glow: 0.4 + prog * 0.6 });
  c.save(); c.translate(0, -64); c.scale(pulse, pulse);
  const g = c.createRadialGradient(-10, -20, 6, 0, 0, 70); g.addColorStop(0, '#9a1420'); g.addColorStop(0.6, '#4a060c'); g.addColorStop(1, '#140103');
  c.fillStyle = g; c.strokeStyle = '#0a0102'; c.lineWidth = 2;
  c.beginPath(); c.ellipse(0, 0, 42, 64, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,60,50,0.7)'; c.lineWidth = 1.6;
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + t * 0.3; c.beginPath(); c.moveTo(Math.cos(a) * 8, Math.sin(a) * 12); c.quadraticCurveTo(Math.cos(a + 0.4) * 30, Math.sin(a + 0.4) * 44, Math.cos(a + 0.2) * 40, Math.sin(a + 0.2) * 60); c.stroke(); }
  c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, 0, 16 + prog * 22, `rgba(255,70,40,${0.5 + 0.5 * Math.abs(Math.sin(t * 8))})`); c.globalCompositeOperation = 'source-over';
  c.restore();
  // revive pool ring
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 6; c.beginPath(); c.arc(0, -64, 78, -Math.PI / 2, Math.PI * 1.5); c.stroke();
  c.strokeStyle = '#ff3a2a'; c.beginPath(); c.arc(0, -64, 78, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); c.stroke();
}

function drawAatrox(c, v) {
  const t = v.anim || 0, D = !!v.transformed;
  if (v.state === 'cocoon') { drawAatroxCocoon(c, v, t); return; }
  if (D) glowCircle(c, 0, -70, 130, 'rgba(255,20,30,0.3)', 'rgba(80,0,0,0)');
  drawHumanoid(c, v, D ? AAT_WE_PAL : AAT_PAL, {
    back(c, P) { aatWings(c, P, t, D, D); },
    chest(c, P) {
      c.save(); if (D) c.globalCompositeOperation = 'lighter';
      c.strokeStyle = D ? 'rgba(255,60,40,0.8)' : '#8a1820'; c.lineWidth = 1.8;
      for (let i = 0; i < 3; i++) { const k = 0.38 + i * 0.17, x = lerp(P.hip[0], P.sh[0], k), y = lerp(P.hip[1], P.sh[1], k); c.beginPath(); c.moveTo(x - 9, y + 2); c.quadraticCurveTo(x, y - 4, x + 9, y + 2); c.stroke(); }
      c.beginPath(); c.moveTo(P.hip[0] + 1, P.hip[1] - 2); c.lineTo(P.sh[0] + 1, P.sh[1] + 6); c.stroke();
      c.restore();
    },
    head(c, P) {
      const [hx, hy] = P.head, H2 = D ? 1.35 : 1;
      // horns: a great back-swept pair + a forward pair
      c.fillStyle = '#120304'; c.strokeStyle = '#000'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(hx - 6, hy - 9); c.quadraticCurveTo(hx - 22 * H2, hy - 16 * H2, hx - 30 * H2, hy - 40 * H2); c.quadraticCurveTo(hx - 16 * H2, hy - 24, hx + 1, hy - 12); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(hx + 3, hy - 12); c.quadraticCurveTo(hx + 4, hy - 26 * H2, hx - 6 * H2, hy - 34 * H2); c.quadraticCurveTo(hx + 0, hy - 22, hx + 9, hy - 10); c.fill(); c.stroke();
      c.strokeStyle = D ? 'rgba(255,60,40,0.6)' : 'rgba(120,30,30,0.6)'; c.beginPath(); c.moveTo(hx - 8, hy - 12); c.quadraticCurveTo(hx - 18 * H2, hy - 20 * H2, hx - 26 * H2, hy - 36 * H2); c.stroke();
      // iron skull-helm with a jutting, fanged jaw
      c.fillStyle = '#1e0a0c'; c.strokeStyle = '#000'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(hx - 12, hy - 5); c.lineTo(hx - 6, hy - 13); c.lineTo(hx + 8, hy - 12); c.lineTo(hx + 15, hy - 4); c.lineTo(hx + 18, hy + 5); c.lineTo(hx + 11, hy + 13); c.lineTo(hx + 2, hy + 11); c.lineTo(hx - 8, hy + 8); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#6a1a1e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx - 4, hy - 11); c.lineTo(hx + 14, hy - 3); c.stroke();
      c.fillStyle = '#e0d0b8';
      for (let i = 0; i < 4; i++) { const fx0 = hx + 5 + i * 3; c.beginPath(); c.moveTo(fx0, hy + 6); c.lineTo(fx0 + 1.5, hy + 10); c.lineTo(fx0 + 3, hy + 6); c.fill(); }
      // burning eye slit
      c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 10, hy - 3, D ? 11 : 7, 'rgba(255,40,20,1)', 'rgba(255,0,0,0)'); c.globalCompositeOperation = 'source-over';
      c.fillStyle = '#ffd07a'; c.beginPath(); c.moveTo(hx + 5, hy - 4); c.lineTo(hx + 14, hy - 2); c.lineTo(hx + 6, hy - 1); c.fill();
    },
    pads(c, P) {
      const [sx, sy] = P.sh;
      c.fillStyle = '#2a1014'; c.strokeStyle = '#000'; c.lineWidth = 1.5;
      c.beginPath(); c.ellipse(sx + 2, sy + 2, 15, 10, -0.2, Math.PI, Math.PI * 2.1); c.fill(); c.stroke();
      c.fillStyle = '#120304';
      for (const [dx, h] of [[-8, 16], [0, 22], [8, 15]]) { c.beginPath(); c.moveTo(sx + dx - 3, sy - 4); c.lineTo(sx + dx - 5, sy - 4 - h); c.lineTo(sx + dx + 3, sy - 5); c.fill(); }
      c.strokeStyle = D ? '#ff3a2a' : '#8a1820'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(sx + 2, sy + 2, 15, 10, -0.2, Math.PI, Math.PI * 2.1); c.stroke();
    },
    front(c, P) {
      const [hx, hy] = P.fH, ang = aatSwordAng(v);
      // blood tendrils binding forearm to the hilt
      c.strokeStyle = D ? 'rgba(255,50,40,0.8)' : 'rgba(150,20,30,0.85)'; c.lineWidth = 1.6;
      for (const k of [0.4, 0.7]) { const ex = lerp(P.fE[0], hx, k), ey = lerp(P.fE[1], hy, k); c.beginPath(); c.moveTo(ex, ey); c.quadraticCurveTo(ex + 6, ey - 8 + Math.sin(t * 6 + k * 9) * 3, hx, hy); c.stroke(); }
      const ready = v.dbReady ? 0.6 + 0.4 * Math.sin(t * 8) : 0;
      const blink = (t % 4.3) < 0.12 ? 0.1 : 1;
      drawDarkinBlade(c, hx, hy, D ? 150 : 124, ang, t, { eye: (v.dbReady || D ? 1 : 0.28) * blink, glow: Math.max(ready, D ? 0.45 : 0), w: D ? 1.15 : 1 });
    },
  });
}

// Portrait: a demon, not a person. Horned skull-helm, burning slits, fanged maw.
function drawAatroxPortraitVector(c, opts = {}) {
  const D = !!opts.form;
  const g = c.createRadialGradient(50, 58, 4, 50, 58, 78); g.addColorStop(0, D ? '#8a0c12' : '#4e0a0e'); g.addColorStop(1, '#070001'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  if (D) { // wings behind
    c.fillStyle = '#1e0508';
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 18, 70); c.lineTo(50 + s * 60, 8); c.lineTo(50 + s * 52, 40); c.lineTo(50 + s * 62, 50); c.lineTo(50 + s * 44, 62); c.closePath(); c.fill(); }
  }
  drawDarkinBlade(c, 4, 98, 128, -0.92, 0, { eye: 1, glow: D ? 0.7 : 0.3, w: 1.25 });
  // shoulders + spiked pauldrons
  c.fillStyle = '#1a0809'; c.beginPath(); c.moveTo(4, 100); c.lineTo(20, 80); c.lineTo(40, 74); c.lineTo(60, 74); c.lineTo(80, 80); c.lineTo(96, 100); c.fill();
  c.fillStyle = '#0e0203'; for (const [x, s] of [[16, -1], [84, 1]]) { c.beginPath(); c.moveTo(x - 6, 84); c.lineTo(x + s * 12, 66); c.lineTo(x + 6, 82); c.fill(); }
  // horns
  const horn = (x0, y0, cx, cy, x1, y1, w) => { c.fillStyle = '#140304'; c.strokeStyle = '#000'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0 - w, y0); c.quadraticCurveTo(cx, cy, x1, y1); c.quadraticCurveTo(cx + (x0 < 50 ? 8 : -8), cy + 10, x0 + w, y0); c.closePath(); c.fill(); c.stroke(); };
  horn(36, 28, 14, 20, D ? 2 : 8, D ? -2 : 4, 5); horn(64, 28, 86, 20, D ? 98 : 92, D ? -2 : 4, 5);
  horn(43, 22, 36, 10, 38, 2, 3); horn(57, 22, 64, 10, 62, 2, 3);
  // skull-helm
  const hg = c.createLinearGradient(0, 18, 0, 80); hg.addColorStop(0, '#3e1418'); hg.addColorStop(1, '#100305');
  c.fillStyle = hg; c.strokeStyle = '#000'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(50, 17); c.lineTo(64, 23); c.lineTo(71, 37); c.lineTo(69, 52); c.lineTo(63, 64); c.lineTo(57, 75); c.lineTo(50, 79); c.lineTo(43, 75); c.lineTo(37, 64); c.lineTo(31, 52); c.lineTo(29, 37); c.lineTo(36, 23); c.closePath(); c.fill(); c.stroke();
  // rim light
  c.strokeStyle = 'rgba(255,60,40,0.55)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(36, 23); c.lineTo(29, 37); c.lineTo(31, 52); c.lineTo(37, 64); c.stroke();
  // heavy V brow
  c.fillStyle = '#0a0102'; c.beginPath(); c.moveTo(31, 38); c.lineTo(50, 47); c.lineTo(69, 38); c.lineTo(66, 43); c.lineTo(50, 51); c.lineTo(34, 43); c.closePath(); c.fill();
  // burning slit eyes
  c.globalCompositeOperation = 'lighter';
  for (const s of [-1, 1]) glowCircle(c, 50 + s * 10, 48, D ? 13 : 9, 'rgba(255,40,20,1)', 'rgba(255,0,0,0)');
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#ffd98a';
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 4, 49); c.lineTo(50 + s * 16, 45); c.lineTo(50 + s * 14, 49); c.closePath(); c.fill(); }
  // skull nose cavity
  c.fillStyle = '#050001'; c.beginPath(); c.moveTo(48, 55); c.lineTo(50, 60); c.lineTo(52, 55); c.fill();
  // fanged maw
  c.fillStyle = '#050001'; c.beginPath(); c.moveTo(39, 63); c.lineTo(61, 63); c.lineTo(56, 72); c.lineTo(44, 72); c.closePath(); c.fill();
  c.fillStyle = '#e4d4bc';
  for (let i = 0; i < 6; i++) { const x = 40.5 + i * 3.6; c.beginPath(); c.moveTo(x, 63); c.lineTo(x + 1.6, 67.5 - (i % 2) * 1.5); c.lineTo(x + 3.2, 63); c.fill(); }
  for (let i = 0; i < 4; i++) { const x = 44.5 + i * 3; c.beginPath(); c.moveTo(x, 72); c.lineTo(x + 1.5, 68.5); c.lineTo(x + 3, 72); c.fill(); }
  // glowing sinew cracks
  c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,50,30,${D ? 0.85 : 0.45})`; c.lineWidth = 0.9;
  for (const p of [[[34, 30], [40, 36], [38, 42]], [[66, 30], [60, 36], [63, 41]], [[40, 66], [36, 70]], [[60, 66], [64, 70]], [[50, 20], [50, 30]]]) { c.beginPath(); c.moveTo(p[0][0], p[0][1]); for (const q of p.slice(1)) c.lineTo(q[0], q[1]); c.stroke(); }
  c.globalCompositeOperation = 'source-over';
  if (D) { c.fillStyle = 'rgba(255,90,40,0.8)'; for (let i = 0; i < 10; i++) { const x = (i * 37) % 100, y = 90 - ((i * 23) % 60); c.fillRect(x, y, 1.6, 1.6); } }
}

// ---------------- kit ----------------
// zones are measured forward from his centre (scaled by his size); y is relative to his feet
const AAT_Q = [
  { name: 'The Darkin Blade', desc: 'Cast I of III: a rising overhead cleave.', pose: 'heavy', s: 16, r: 18, inner: [18, 118], tip: [118, 176], y: [-170, 6], a0: -1.4, a1: -2.7, a2: 0.7,
    hit: { dmg: 56, kb: [250, 0], hs: 18, bs: 14, sfx: 'm' }, tipHit: { dmg: 96, kb: [110, -560], launch: true, hs: 30, bs: 16, sfx: 'h' } },
  { name: 'The Darkin Blade II', desc: 'Cast II of III: a wide horizontal sweep.', pose: 'punch2', s: 14, r: 18, inner: [16, 110], tip: [110, 168], y: [-150, 6], a0: -0.6, a1: -2.2, a2: 0.2,
    hit: { dmg: 60, kb: [260, 0], hs: 18, bs: 14, sfx: 'm' }, tipHit: { dmg: 100, kb: [160, -580], launch: true, hs: 30, bs: 16, sfx: 'h' } },
  { name: 'The Darkin Blade III', desc: 'Cast III of III: an earth-splitting overhead (block standing).', pose: 'slam', s: 21, r: 26, inner: [-36, 92], tip: [92, 156], y: [-190, 6], a0: -1.6, a1: -3.0, a2: 1.1,
    hit: { dmg: 78, kb: [380, -320], launch: true, guard: 'high', hs: 22, bs: 16, sfx: 'h' }, tipHit: { dmg: 136, kb: [70, -1060], launch: true, guard: 'high', hs: 40, bs: 18, sfx: 'h' } },
];
const AAT_COCOON = 150;          // frames sealed in the blood cocoon
const AAT_DB_CHARGE = 330;       // frames for Deathbringer Stance to charge

function aatRect(f, x0, x1, y0, y1) {
  const sc = f.scale, a = f.x + f.facing * x0 * sc, b = f.x + f.facing * x1 * sc;
  return { x: Math.min(a, b), y: f.y + y0 * sc, w: Math.abs(b - a), h: (y1 - y0) * sc };
}
function aatZones(f, S) { return { inner: aatRect(f, S.inner[0], S.inner[1], S.y[0], S.y[1]), tip: aatRect(f, S.tip[0], S.tip[1], S.y[0], S.y[1]) }; }

function aatNextQ(f) {
  const fr = Game.battle ? Game.battle.frame : 0;
  const stage = f.aQ && fr - f.aQ.t < 150 ? f.aQ.next : 0;
  return AAT_QM[stage];
}
function aatQStart(f, stage) {
  f.aQ = { next: (stage + 1) % 3, t: Game.battle ? Game.battle.frame : 0 };
  f.aqDash = 0; f.aqDashUsed = false;
  Combat.hazards = Combat.hazards.filter(h => !(h.kind === 'aatMark' && h.owner === f));
  Combat.addHazard({ kind: 'aatMark', owner: f, side: f.side, spec: AAT_Q[stage], life: AAT_Q[stage].s, x: f.x });
  aatSfx('charge', 0.25);
  if (Math.random() < 0.3 && f.def.lines.moves) f.say(pick(f.def.lines.moves), 50);
}

// One Darkin Blade swing: sweet spot (edge) vs inner zone, resolved per target.
function aatSweep(f, S, tag) {
  const Z = aatZones(f, S); let res = null, sweet = false;
  for (const t of Combat.targets(f.side)) {
    const r = t.rect(), inTip = rectsOverlap(Z.tip, r), inIn = rectsOverlap(Z.inner, r);
    if (!inTip && !inIn) continue;
    const tip = inTip;
    const out = Combat.resolveHit(t, f, H_(Object.assign({ box: [0, 0, 1, 1] }, tip ? S.tipHit : S.hit)), { move: f.move, fromX: f.x });
    if (out) { res = res === 'hit' ? res : out; if (out === 'hit' && tip) { sweet = true; aatSweet(f, t); } }
  }
  if (res) f.connected = res === 'hit' ? 'hit' : res === 'block' ? 'block' : f.connected;
  Combat.addHazard({ kind: 'aatSlash', owner: f, side: f.side, spec: S, x: f.x, y: f.y, dir: f.facing, sc: f.scale, life: 14, sweet, tag });
  Arena.hit(Z.tip.x, Z.tip.x + Z.tip.w, f.y - 40, 50, Game.fx);
  aatSfx('slash'); if (!res) aatSfx('whoosh');
  Cam.shake = Math.max(Cam.shake, sweet ? 12 : 4);
  return res;
}
function aatSweet(f, t) {
  Game.popWorld(t.x, t.y - t.h - 36, 'SWEET SPOT', '#ffb03a', 22);
  Game.fx.burst(t.x, t.y - t.h / 2, 26, { color: ['#ff2a1a', '#ffd07a', '#fff'], size: 9, speed: 520, glow: true, life: 0.45 });
  f.dbT = (f.dbT || 0) + 110;
  if (Game.battle) Game.battle.hitstop = Math.max(Game.battle.hitstop, 9);
  aatSfx('slam'); aatSfx('clang');
  if (f.form && f.formT > 0) { f.formT = Math.min(f.formT + 75, 16 * FPS); Game.popWorld(f.x, f.y - f.h - 50, 'WORLD ENDER +1.2s', '#ff4a3a', 16); }
}

// Infernal Chains tether
function aatChainBind(f, t, x) {
  Combat.hazards = Combat.hazards.filter(h => !(h.kind === 'aatChain' && h.owner === f));
  Combat.addHazard({ kind: 'aatChain', owner: f, side: f.side, x: clamp(x, 40, Arena.stage.width - 40), victim: t, life: 80, radius: 250 });
  Game.popWorld(t.x, t.y - t.h - 30, 'CHAINED', '#ff5a3a', 20);
}

const AAT_QM = AAT_Q.map((S, i) => {
  const m = mk({ name: S.name, desc: S.desc, pose: S.pose, s: S.s, a: 2, r: S.r, aQ: i, id: 'aatrox_q' + (i + 1), slot: '5S', owner: 'aatrox',
    ai: { min: 40, max: 150, use: i === 0 ? 'approach' : 'combo' }, ev: { 1: f => aatQStart(f, i), [S.s]: f => aatSweep(f, S, 'q' + i) } });
  return m;
});
AAT_QM[0].follow = AAT_QM[1]; AAT_QM[1].follow = AAT_QM[2];

const aatUmbral = (dir) => mk({ name: dir > 0 ? 'Umbral Dash' : 'Umbral Retreat', desc: dir > 0 ? 'A surging dash. Keeps your Darkin Blade chain alive; usable mid-windup to aim the sweet spot.' : 'A backwards dash that keeps the Darkin Blade chain alive.',
  pose: 'dash', s: 2, a: 10, r: 8, umbral: true, pass: true, pinv: [1, 12], vel: [[2, 12, 1250 * dir, null]], ai: dir > 0 ? { min: 220, max: 650, use: 'approach' } : { min: 99999, max: 0, use: 'none' },
  ev: { 2: f => { aatSfx('whoosh'); Game.fx.burst(f.x, f.y - 50, 14, { color: ['#3a0008', '#ff2a2a'], size: 8, speed: 200, life: 0.35 }); } } });

const AAT_SUPER = superize(mk({ name: 'Worldbreaker', desc: 'Two colossal cleaves. The far edge of each is a sweet spot.', pose: 'heavy', s: 18, a: 22, r: 26, aatSuper: true,
  ev: { 1: f => Combat.addHazard({ kind: 'aatMark', owner: f, side: f.side, spec: AAT_SUPER_Z[0], life: 18, x: f.x, superMark: true }),
    18: f => aatSweep(f, AAT_SUPER_Z[0], 's0'), 34: f => aatSweep(f, AAT_SUPER_Z[1], 's1') } }), 100);
const AAT_SUPER_Z = [
  { inner: [0, 200], tip: [200, 296], y: [-200, 6], hit: { dmg: 110, kb: [260, -80], hs: 22, bs: 16, sfx: 'h' }, tipHit: { dmg: 170, kb: [160, -520], launch: true, hs: 32, sfx: 'h' } },
  { inner: [-40, 180], tip: [180, 280], y: [-240, 6], hit: { dmg: 130, kb: [560, -520], launch: true, wb: true, hs: 26, sfx: 'h' }, tipHit: { dmg: 210, kb: [320, -900], launch: true, wb: true, hs: 40, sfx: 'h' } },
];

function aatUltLand(f) {
  f.y = 0;
  const zone = { x: f.x - 175 * f.scale, y: -210 * f.scale, w: 350 * f.scale, h: 216 * f.scale };
  let res = null;
  for (const t of Combat.targets(f.side)) { if (!rectsOverlap(zone, t.rect())) continue; const r = Combat.resolveHit(t, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid', box: [0, 0, 1, 1] }), { move: f.move, fromX: f.x }); if (r) res = r; }
  if (res) f.connected = res === 'hit' ? 'hit' : 'block';
  Combat.addHazard({ kind: 'aatCrack', owner: f, side: f.side, x: f.x, life: 70 });
  Game.fx.burst(f.x, -10, 60, { color: ['#ff2a1a', '#3a0008', '#ffd07a'], size: 14, speed: 700, angle: -Math.PI / 2, spread: 1.6, glow: true, life: 0.7 });
  Arena.hit(f.x - 220, f.x + 220, -40, 80, Game.fx);
  Cam.shake = 22; aatSfx('boom'); aatSfx('slam');
}
const AAT_ULT = superize(mk({ name: 'DARKIN ANNIHILATION', desc: 'Leaps off-screen and crashes down onto the foe. Tracks them in the air; blockable on landing. Must connect.',
  pose: f => (f.mf < 16 ? 'cast_up' : 'air_spike'), s: 32, a: 2, r: 30, aatUlt: true,
  ev: { 1: f => { f.ultFrom = f.x; f.ultTo = f.opp ? f.opp.x : f.x; aatSfx('roar'); }, 32: f => aatUltLand(f) } }), 300);
AAT_ULT.id = 'aatrox_ult'; AAT_ULT.recoverWhiff = 40;
AAT_ULT.ult = { dmg: 1180, cutscene: (a, t) => csAatroxUlt(a, t), fx: { el: 'blood', color: '#e0202a', sky: ['#0a0002', '#3a0008', '#8a1010'] } };

// ---------------- the fighter ----------------
const aatrox = fighter({
  id: 'aatrox', name: 'AATROX', title: 'The Darkin Blade', side: 'VILLAIN', role: 'Bruiser · Sweet spots · Undying', color: '#e0202a', color2: '#2a0406',
  bio: 'Once a god-warrior of a fallen empire, now a Darkin: a mind imprisoned in a greatsword. He wears a stolen body of blood and sinew, and he fights for one thing only: an end to everything, including himself.',
  quote: 'I am not the darkness. I am what it fears.',
  ending: 'Aatrox finds no war worthy of him in Metro City. He sits on a rooftop, the eye of his sword watching the streets, waiting. The city sleeps nervously for a very long time.',
  hp: 1080, walk: 235, jumps: 2, scale: 1.15, deity: true, rival: 'aurelion', handArt: true,
  draw: drawAatroxPixel, drawPortrait: drawAatroxPixelPortrait, transformCutscene: f => csAatroxWorldEnder(f),
  model: { skin: '#5a1418' }, face: { expr: 'angry' },
  style: { reach: 1.35, weapon: true, speed: 1.12, power: 1.1, heavy: true, poses: { '5M': 'heavy', '5H': 'slam' } },
  passive: ['Deathbringer Stance', 'The sword\'s eye opens every few seconds: his next hit rends 3.5% of the foe\'s max HP and heals him. Sweet spots charge it faster.'],
  moves: { '5S': AAT_QM[0], '6S': aatUmbral(1), '4S': aatUmbral(-1),
    '2S': Mv.shot({ name: 'Infernal Chains', desc: 'Tethers the foe. Still inside the ring when it snaps? Yanked back and bound.', s: 14, ai: { min: 120, max: 650, use: 'zone' },
      proj: { speed: 1100, r: 12, dmg: 40, kind: 'hook', color: '#ff2a2a', status: { slow: 1.6 }, hs: 18, kb: [40, 0], onHit: (t, p) => aatChainBind(p.owner, t, p.x) } }),
    'jS': Mv.dive({ name: 'Darkin Descent', desc: 'Plunging overhead. On hit, Deathbringer Stance is instantly ready.', pose: 'air_spike', vx: 420, vy: 1500, hit: { dmg: 84, box: [-10, -60, 110, 70], gb: true, kb: [200, 900], guard: 'high' } }) },
  super: AAT_SUPER,
  ult: { act: 'strike', name: 'DARKIN ANNIHILATION', dmg: 1180, fx: { el: 'blood', color: '#e0202a', sky: ['#0a0002', '#3a0008', '#8a1010'] } },
  form: { name: 'WORLD ENDER', desc: '10s. Wings unfurl: terrifies the foe, flight, 20% lifesteal. Sweet spots extend it. Die in it and he is sealed in a blood cocoon, then rises again.',
    timed: 10, cost: 300, flight: true, dmg: 1.15, speed: 1.1, lifesteal: 0.2, scale: 1.2, jump: 1.1,
    onStart: f => {
      const o = f.opp; if (!o) return;
      o.status.slow = Math.max(o.status.slow || 0, 2.5); o.status.weaken = Math.max(o.status.weaken || 0, 3);
      if (!o.airborne && o.state !== 'move' && o.state !== 'hit') o.vx = Math.sign(o.x - f.x || 1) * 650;
      Game.popWorld(o.x, o.y - o.h - 40, 'TERRIFIED', '#ff4a3a', 26);
    } },
  assist: '2S',
  lines: {
    intro: ['I will not be imprisoned again, {opp}.', 'Your city is a tomb that has not closed yet.', 'Come. Show me a war worth ending.', 'I have killed gods. You are not even that.'],
    win: ['Is this all your world has to offer?', 'I was imprisoned for THIS?', 'Rest, {opp}. I envy you.', 'Another world. Another disappointment.'],
    taunt: ['Pathetic.', 'Fight me!', 'Is that fear I smell?'], form: ['I AM THE WORLD ENDER!', 'Behold the Darkin!'], ult: ['There is no escape!'], ultHit: ['This world ends with me.'],
    tag: ['Out of my way.'], enter: ['Finally. A real war.'], assist: ['Bound!'], moves: ['Hah!', 'Die!', 'Suffer!', 'Kneel!'],
    revive: ['You cannot kill what is already dead!', 'I... WILL... NOT... FALL!'],
  },
});
aatrox.ult = AAT_ULT; aatrox.ultAct = 'strike';
AAT_QM[1].slot = AAT_QM[2].slot = '5S'; AAT_QM[1].owner = AAT_QM[2].owner = 'aatrox';

aatrox.specialFor = (f, slot) => slot === '5S' ? aatNextQ(f) : undefined;

aatrox.passiveTick = f => {
  if (f.state === 'cocoon') return;
  f.dbT = (f.dbT || 0) + 1;
  if (!f.dbReady && f.dbT >= AAT_DB_CHARGE) { f.dbReady = true; Game.fx.burst(f.x + f.facing * 40, f.y - 90, 12, { color: ['#ff2a1a', '#ffd07a'], size: 6, speed: 180, glow: true, life: 0.4 }); }
};
aatrox.onHit = (a, t, dmg) => {
  if (a.move && a.move.id === 'aatrox_jS') a.dbT = AAT_DB_CHARGE;
  if (!a.dbReady || !(dmg > 0) || t.hp <= 0) return;
  const extra = Math.round(t.maxHp * 0.035);
  t.hp = Math.max(1, t.hp - extra); a.hp = Math.min(a.maxHp, a.hp + extra);
  a.dbReady = false; a.dbT = 0;
  Game.popWorld(t.x, t.y - t.h - 60, 'DEATHBRINGER', '#ff3a2a', 20);
  Game.fx.burst(t.x, t.y - t.h / 2, 30, { color: ['#8a0010', '#ff2a1a'], size: 8, speed: 420, glow: true, life: 0.5 });
  aatSfx('slam');
};

// Umbral Dash inside a windup, dash-out of recovery, chaining out of Umbral, the ultimate's leap, CPU aiming.
aatrox.moveHook = (f, m, ctl) => {
  const dashPress = ctl && ctl.press && (ctl.press.DASH || ctl.press.FWD2 || ctl.press.BACK2 || ctl.press.SD);
  if (m.aQ !== undefined) {
    const S = AAT_Q[m.aQ];
    if (f.ctrl === 'cpu' && f.mf === 3 && f.opp && !f.aqDashUsed) {
      const dist = (f.opp.x - f.x) * f.facing, mid = (S.tip[0] + S.tip[1]) / 2 * f.scale, diff = dist - mid;
      if (Math.abs(diff) > 26 && Math.random() < 0.25 * (f.level || 2)) { f.aqDash = 7; f.aqDashDir = Math.sign(diff) * f.facing; f.aqDashUsed = true; }
    }
    if (f.ctrl === 'cpu' && m.aQ < 2 && f.mf === m.s + 3 && Math.random() < 0.7) f.buf.push({ b: 'S', x: 0, y: 0, t: 8 });
    if (f.mf < m.s - 1 && dashPress && !f.aqDashUsed) { f.aqDash = 7; f.aqDashDir = (ctl.x || (ctl.press.BACK2 ? -f.facing : f.facing)); f.aqDashUsed = true; }
    if (f.aqDash > 0) {
      f.aqDash--; f.x = clamp(f.x + f.aqDashDir * 21, 40, Arena.stage.width - 40);
      Game.fx.add({ x: f.x - f.aqDashDir * 20, y: f.y - rand(20, 110), vx: -f.aqDashDir * 200, vy: 0, life: 0.3, size: rand(5, 10), color: pick(['#3a0008', '#8a0010']), glow: false });
    }
    if (f.mf > m.s + 2 && dashPress) { const dir = (ctl.x || f.facing) * f.facing >= 0 ? 1 : -1; f.move = null; f.startMove(aatrox.moves[dir > 0 ? '6S' : '4S']); return; }
  }
  if (m.umbral && f.mf >= 6 && f.buf.some(e => e.b === 'S')) { f.buf = f.buf.filter(e => e.b !== 'S'); f.move = null; f.startMove(aatNextQ(f)); return; }
  if (m.aatUlt && f.mf < m.s) {
    const p = f.mf / m.s;
    if (f.opp && p < 0.7) f.ultTo = lerp(f.ultTo, f.opp.x, 0.18);
    f.x = clamp(lerp(f.ultFrom, f.ultTo, ease.out(p)), 40, Arena.stage.width - 40);
    f.y = -Math.sin(p * Math.PI) * 360; f.vx = 0; f.vy = 0;
    if (p > 0.55) Game.fx.add({ x: f.x + rand(-20, 20), y: f.y - rand(0, 80), vx: 0, vy: -200, life: 0.3, size: rand(6, 12), color: pick(['#ff2a1a', '#3a0008']), glow: true });
  }
};

// World Ender revival: the blood cocoon.
aatrox.onDeath = (t) => {
  if (!t.form || t.cheated) return false;
  t.cheated = true; t.hp = 1; t.state = 'cocoon'; t.cocoonT = AAT_COCOON; t.move = null; t.vx = 0; t.vy = 0; t.revivePool = t.maxHp * 0.35; t.invul = 0;
  Game.popWorld(t.x, t.y - t.h - 40, 'REVIVAL', '#ff2a1a', 30);
  Game.announce('THE DARKIN REFUSES TO DIE', '#ff3a2a', 80);
  aatSfx('heartbeat'); Cam.shake = 14;
  return true;
};
aatrox.stateStep = (f) => {
  if (f.state !== 'cocoon') return false;
  f.anim += 1 / FPS; f.st++; f.cocoonT--; f.vx = 0; f.y = Math.min(0, f.y + 14); f.pose = 'kneel';
  if (f.st % 45 === 0) aatSfx('heartbeat');
  if (f.st % 6 === 0) Game.fx.add({ x: f.x + rand(-40, 40), y: f.y - rand(20, 120), vx: 0, vy: 80, life: 0.6, size: rand(3, 6), color: '#8a0010', glow: false });
  if (f.cocoonT <= 0) {
    f.state = 'stand'; f.hp = f.red = f.shownHp = Math.round(Math.max(f.maxHp * 0.1, f.revivePool)); f.invul = 50;
    if (f.formT > 0) f.formT += 3 * FPS;
    for (const o of Combat.targets(f.side)) if (Math.abs(o.x - f.x) < 280) Combat.resolveHit(o, f, H_({ dmg: 90, guard: 'unblock', kb: [800, -600], launch: true, hs: 30, sfx: 'h' }), { force: true, fromX: f.x });
    Game.fx.burst(f.x, f.y - 70, 90, { color: ['#ff2a1a', '#3a0008', '#ffd07a'], size: 14, speed: 800, glow: true, life: 0.9 });
    Game.popWorld(f.x, f.y - f.h - 40, 'THE DARKIN RISES', '#ff3a2a', 28);
    Cam.shake = 24; aatSfx('roar'); aatSfx('boom');
    f.say(pick(f.def.lines.revive), 120);
  }
  return true;
};
aatrox.onIncoming = (t, a, h) => {
  if (t.state !== 'cocoon') return undefined;
  const d = (h.dmg || 0) * (a && a.dmgMult ? a.dmgMult(t) : 1) * 1.3;
  t.revivePool = Math.max(t.maxHp * 0.1, t.revivePool - d);
  Game.popWorld(t.x + rand(-20, 20), t.y - 150, '-' + Math.round(d), '#ffb0a0', 15);
  Game.fx.burst(t.x, t.y - 64, 8, { color: ['#8a0010', '#ff4a3a'], size: 6, speed: 260, life: 0.3 });
  if (Game.battle) Game.battle.hitstop = Math.max(Game.battle.hitstop, 3);
  aatSfx('hit');
  return 'hit';
};

// ---------------- hazards: telegraphs, slashes, chains, crack ----------------
Combat.hz.aatMark = function (h) { const f = h.owner; return h.t < h.life && f.move && (f.move.aQ !== undefined || f.move.aatSuper); };
Combat.drawHz.aatMark = function (c, h) {
  const f = h.owner, S = h.spec, Z = aatZones(f, S), k = Math.min(1, h.t / h.life);
  c.save();
  c.fillStyle = 'rgba(90,0,8,0.10)'; c.fillRect(Z.inner.x, Z.inner.y, Z.inner.w, Z.inner.h);
  c.fillStyle = `rgba(255,30,20,${0.08 + 0.12 * k})`; c.fillRect(Z.tip.x, Z.tip.y, Z.tip.w, Z.tip.h);
  // ground indicator with fill-up progress (League style)
  const gy = f.y - 4;
  c.fillStyle = 'rgba(40,0,4,0.7)'; c.fillRect(Z.inner.x, gy - 4, Z.inner.w, 14);
  c.fillStyle = 'rgba(200,16,26,0.85)'; const fillW = Z.inner.w * k; c.fillRect(f.facing > 0 ? Z.inner.x : Z.inner.x + Z.inner.w - fillW, gy - 4, fillW, 14);
  c.globalCompositeOperation = 'lighter'; glowCircle(c, Z.tip.x + Z.tip.w / 2, gy + 2, Z.tip.w * 0.9, `rgba(255,50,30,${0.25 + 0.35 * k})`, 'rgba(255,0,0,0)'); c.globalCompositeOperation = 'source-over';
  c.fillStyle = `rgba(255,${60 + 140 * k},50,${0.75 + 0.25 * k})`; c.fillRect(Z.tip.x, gy - 6, Z.tip.w, 18);
  c.strokeStyle = `rgba(255,90,50,${0.5 + 0.5 * k})`; c.lineWidth = 2; c.strokeRect(Z.tip.x, Z.tip.y, Z.tip.w, Z.tip.h);
  c.restore();
};
Combat.hz.aatSlash = function (h) { return h.t < h.life; };
Combat.drawHz.aatSlash = function (c, h) {
  const S = h.spec, a = 1 - h.t / h.life, sc = h.sc, R = S.tip[1] * sc, r0 = S.tip[0] * sc;
  const cx = h.x, cy = h.y - 70 * sc;
  const horiz = h.tag === 'q1' || h.tag === 's0';
  c.save(); c.translate(cx, cy); c.scale(h.dir, horiz ? 0.35 : 1);
  c.globalCompositeOperation = 'lighter';
  const from = horiz ? -2.6 : -2.1, to = horiz ? 0.4 : 0.9;
  c.strokeStyle = `rgba(160,10,20,${0.55 * a})`; c.lineWidth = 34 * sc; c.beginPath(); c.arc(0, 0, (R + r0) / 2 - 20, from, to); c.stroke();
  c.strokeStyle = h.sweet ? `rgba(255,190,90,${0.95 * a})` : `rgba(255,40,30,${0.8 * a})`; c.lineWidth = (R - r0) * (h.sweet ? 0.9 : 0.55); c.beginPath(); c.arc(0, 0, (R + r0) / 2, from, to); c.stroke();
  c.restore();
};
Combat.hz.aatChain = function (h) {
  const v = h.victim;
  if (!v || ['ko', 'benched', 'tagout', 'cocoon'].includes(v.state) || h.owner.state === 'ko') return false;
  if (h.t >= h.life) {
    const inside = Math.abs(v.x - h.x) <= h.radius;
    if (!inside) { Game.popWorld(v.x, v.y - v.h - 30, 'BROKE FREE', '#aab', 18); Game.fx.burst(v.x, v.y - 60, 14, { color: ['#555', '#a22'], size: 6, speed: 260, life: 0.4 }); aatSfx('clang'); return false; }
    v.x = clamp(lerp(v.x, h.x, 0.85), 40, Arena.stage.width - 40);
    const r = Combat.resolveHit(v, h.owner, H_({ dmg: 70, guard: 'unblock', hs: 26, kb: [0, -660], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: h.owner.def.moves['2S'] });
    if (r === 'hit') { Game.popWorld(v.x, v.y - v.h - 30, 'BOUND!', '#ff3a2a', 24); Cam.shake = 12; aatSfx('clang'); aatSfx('slam'); }
    return false;
  }
  return true;
};
Combat.drawHz.aatChain = function (c, h) {
  const v = h.victim; if (!v) return;
  const k = h.t / h.life, inside = Math.abs(v.x - h.x) <= h.radius;
  c.save();
  // escape ring on the ground
  c.strokeStyle = inside ? `rgba(255,40,30,${0.4 + 0.5 * k})` : 'rgba(180,180,200,0.6)'; c.lineWidth = 3; c.setLineDash([12, 8]); c.lineDashOffset = -h.t;
  c.beginPath(); c.ellipse(h.x, -2, h.radius, 22, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
  // anchor sigil
  c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -6, 30, 'rgba(255,30,20,0.8)', 'rgba(255,0,0,0)'); c.globalCompositeOperation = 'source-over';
  // chain links
  const ax = h.x, ay = -30, bx = v.x, by = v.y - v.h * 0.55, d = Math.hypot(bx - ax, by - ay), n = Math.max(3, Math.floor(d / 14)), ang = Math.atan2(by - ay, bx - ax);
  const sag = (1 - k) * 30;
  for (let i = 0; i <= n; i++) {
    const p = i / n, x = lerp(ax, bx, p), y = lerp(ay, by, p) + Math.sin(p * Math.PI) * sag;
    c.save(); c.translate(x, y); c.rotate(ang + (i % 2 ? Math.PI / 2 : 0));
    c.strokeStyle = `rgb(${lerp(90, 255, k) | 0},${lerp(20, 50, k) | 0},${30})`; c.lineWidth = 2.6; c.beginPath(); c.ellipse(0, 0, 6, 3.4, 0, 0, Math.PI * 2); c.stroke();
    c.restore();
  }
  c.restore();
};
Combat.hz.aatCrack = function (h) { return h.t < h.life; };
Combat.drawHz.aatCrack = function (c, h) {
  const a = 1 - h.t / h.life;
  c.save(); c.globalCompositeOperation = 'lighter';
  c.strokeStyle = `rgba(255,60,20,${a})`; c.lineWidth = 5;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(h.x, 0); let x = h.x; for (let i = 1; i <= 7; i++) { x += s * 34; c.lineTo(x, -((i * 7) % 11)); } c.stroke(); }
  glowCircle(c, h.x, -10, 140 * (1 - a * 0.5), `rgba(255,40,20,${0.5 * a})`, 'rgba(255,0,0,0)');
  c.restore();
};

// ---------------- cinematics ----------------
function aatSky(c, k) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${lerp(10, 70, k) | 0},${lerp(4, 2, k) | 0},${lerp(14, 6, k) | 0})`); g.addColorStop(1, `rgb(${lerp(40, 170, k) | 0},${lerp(10, 20, k) | 0},${lerp(20, 12, k) | 0})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

function csAatroxWorldEnder(f) {
  const fx = new ParticleSystem(1800), d = f.def;
  return {
    name: 'WORLD ENDER', dur: 4.6, fx,
    cues: [[0, () => aatSfx('heartbeat')], [0.65, () => aatSfx('heartbeat')], [1.35, () => { aatSfx('screech'); aatSfx('slam'); }], [2.75, () => { aatSfx('roar'); aatSfx('boom'); }]],
    draw(c, t) {
      if (t < 1.35) {
        aatSky(c, seg(t, 0, 1.3) * 0.6);
        c.fillStyle = '#0a0203'; c.fillRect(0, H - 60, W, 60);
        for (let i = 0; i < 4; i++) fx.add({ x: W / 2 + rand(-500, 500), y: H - 50, vx: 0, vy: rand(-260, -120), life: 1.2, size: rand(4, 9), color: pick(['#8a0010', '#c01020', '#3a0008']), glow: true });
        for (const p of fx.list) { p.vx += (W / 2 - p.x) * 0.02; }
        fx.draw(c);
        drawCharAt(c, d, W / 2, H - 50, 2.7, 1, { pose: 'kneel', anim: t, transformed: false });
        vignette(c, 0.75);
        caption(c, 'I will not be imprisoned again.', t, 0.1, 1.3, '#ffb0a0');
      } else if (t < 2.75) {
        c.fillStyle = '#050001'; c.fillRect(0, 0, W, H);
        const open = ease.out(seg(t, 1.5, 2.2));
        c.globalCompositeOperation = 'lighter'; glowCircle(c, W * 0.46, H * 0.46, 420 * open, 'rgba(160,0,10,0.45)', 'rgba(0,0,0,0)'); c.globalCompositeOperation = 'source-over';
        drawDarkinBlade(c, -W * 0.05, H * 0.86, W * 1.35, -0.4, t, { eye: open, glow: seg(t, 1.35, 2.6), w: 5.5 });
        flashAt(c, t, 1.35, 1.5, '#ff2020');
        if (t > 2.2) { c.globalAlpha = seg(t, 2.2, 2.4); bigText(c, 'THE BLADE AWAKENS', W / 2, H - 70, 36, '#ff5a3a', '#000'); c.globalAlpha = 1; }
      } else {
        aatSky(c, 1);
        for (let i = 0; i < 3; i++) fx.add({ x: rand(0, W), y: H + 10, vx: rand(-30, 30), vy: rand(-500, -200), life: 1.4, size: rand(3, 7), color: pick(['#ff4a2a', '#ffb05a']), glow: true });
        fx.draw(c);
        glowCircle(c, W / 2, H - 230, 460, 'rgba(255,20,30,0.35)', 'rgba(255,0,0,0)');
        const k = ease.back(seg(t, 2.75, 3.2));
        drawCharAt(c, d, W / 2, H - 10, 2.2 + 0.6 * k, 1, { pose: 'victory', anim: t, transformed: true });
        speedLines(c, t, W / 2, H / 2, 'rgba(255,60,40,0.35)');
        titleSlam(c, 'WORLD ENDER', 'BEHOLD THE DARKIN', t, 2.9, '#ff2a2a', 116);
        flashAt(c, t, 2.75, 3.05, '#ff4a3a');
      }
    },
  };
}

function csAatroxUlt(f, opp) {
  const fx = new ParticleSystem(3200), city = makeCineCity(18, 140, 380), baseY = H - 30, oppX = W * 0.68;
  const oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  const cuts = [1.2, 2.25, 3.3];
  const arc = (c, cx, cy, R, a0, a1, k, col) => {
    c.save(); c.globalCompositeOperation = 'lighter';
    c.strokeStyle = 'rgba(140,0,12,0.6)'; c.lineWidth = 70; c.beginPath(); c.arc(cx, cy, R - 30, a0, lerp(a0, a1, k)); c.stroke();
    c.strokeStyle = col; c.lineWidth = 26; c.beginPath(); c.arc(cx, cy, R, a0, lerp(a0, a1, k)); c.stroke();
    c.restore();
  };
  return {
    name: 'DARKIN ANNIHILATION', dur: 7.4, fx,
    cues: [[0, () => aatSfx('roar')], [0.4, () => aatSfx('charge', 0.9)], [1.3, () => { aatSfx('slash'); aatSfx('slam'); }], [2.35, () => { aatSfx('slash'); aatSfx('slam'); }], [3.4, () => aatSfx('whoosh')], [4.15, () => { aatSfx('boom'); aatSfx('boom', 0.25); aatSfx('slam'); }]],
    draw(c, t) {
      if (t < cuts[0]) {
        aatSky(c, 0.4 + 0.6 * seg(t, 0, 1.1));
        drawCineCity(c, city, baseY, '#14040a');
        silhouette(c, o => drawCharAt(o, opp.def, oppX, baseY, oppScale, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#120204');
        const y = lerp(baseY + 120, baseY - 250, ease.out(seg(t, 0, 1.0)));
        glowCircle(c, W * 0.3, y - 150, 260, 'rgba(255,20,30,0.3)', 'rgba(255,0,0,0)');
        drawCharAt(c, f.def, W * 0.3, y, 2.1, 1, { pose: 'fly', anim: t, transformed: true });
        caption(c, 'This world has forgotten what war is.', t, 0.05, 1.15, '#ffb0a0');
      } else if (t < 4.1) {
        const cut = t < cuts[1] ? 0 : t < cuts[2] ? 1 : 2, ct = t - cuts[cut], k = ease.out(seg(ct, 0.08, 0.32));
        aatSky(c, 1);
        const shk = ct < 0.5 ? 10 * (1 - ct * 2) : 0; c.save(); c.translate(rand(-shk, shk), rand(-shk, shk));
        if (k > 0.9) for (const b of city) { const mx = b.x + b.w / 2; if ((cut === 0 && mx > W * 0.35) || (cut === 1 && mx < W * 0.75) || cut === 2) b.dead = b.dead || Math.random() < 0.04; }
        drawCineCity(c, city, baseY, '#14040a');
        const flung = cut === 2 ? -ease.out(seg(ct, 0.6, 0.9)) * 60 : Math.sin(Math.min(1, ct * 2) * Math.PI) * -80 * k;
        silhouette(c, o => drawCharAt(o, opp.def, oppX + (cut === 1 ? -60 : 40) * k, baseY + flung, oppScale, -1, { pose: ct > 0.2 ? 'hurt_air' : 'block', anim: t, transformed: opp.transformed }), '#120204');
        if (cut === 0) { drawCharAt(c, f.def, W * 0.28, baseY - 40, 2.3, 1, { pose: 'heavy', anim: t, transformed: true }); arc(c, W * 0.28, baseY - 180, 560, -2.4, 0.5, k, 'rgba(255,60,30,0.95)'); bigText(c, 'I', W * 0.5, 160, 120, '#ff3a2a', '#000'); }
        else if (cut === 1) { drawCharAt(c, f.def, W * 0.9, baseY - 40, 2.3, -1, { pose: 'heavy', anim: t, transformed: true }); arc(c, W * 0.9, baseY - 180, 620, -0.7, -3.6, k, 'rgba(255,60,30,0.95)'); bigText(c, 'II', W * 0.5, 160, 120, '#ff3a2a', '#000'); }
        else {
          const up = ct < 0.45, y = up ? lerp(baseY - 40, -300, ease.out(ct / 0.45)) : lerp(-300, baseY - 20, ease.in ? ease.in(seg(ct, 0.45, 0.8)) : seg(ct, 0.45, 0.8));
          drawCharAt(c, f.def, W / 2, y, 2.4, 1, { pose: up ? 'fly' : 'air_spike', anim: t, transformed: true });
          if (!up) speedLines(c, t, W / 2, baseY, 'rgba(255,60,40,0.5)');
          if (ct > 0.2) { c.globalAlpha = seg(ct, 0.2, 0.35); bigText(c, 'III', W * 0.5, 160, 120, '#ff3a2a', '#000'); c.globalAlpha = 1; }
        }
        fx.draw(c);
        c.restore();
        flashAt(c, t, cuts[cut] + 0.1, cuts[cut] + 0.25, '#ff5a3a');
      } else if (t < 5.1) {
        const k = seg(t, 4.1, 5.0);
        aatSky(c, 1);
        const shk = 16 * (1 - k); c.save(); c.translate(rand(-shk, shk), rand(-shk, shk));
        for (const b of city) b.dead = true;
        drawCineCity(c, city, baseY, '#14040a', false);
        // the earth splits
        c.globalCompositeOperation = 'lighter';
        c.strokeStyle = 'rgba(255,120,40,1)'; c.lineWidth = 10 + 20 * (1 - k);
        c.beginPath(); c.moveTo(W / 2, baseY); for (let i = 1; i <= 12; i++) c.lineTo(W / 2 - i * 60, baseY - ((i * 13) % 17)); c.moveTo(W / 2, baseY); for (let i = 1; i <= 12; i++) c.lineTo(W / 2 + i * 60, baseY - ((i * 11) % 19)); c.stroke();
        glowCircle(c, W / 2, baseY, 700 * ease.out(k), 'rgba(255,60,20,0.5)', 'rgba(255,0,0,0)');
        c.globalCompositeOperation = 'source-over';
        c.strokeStyle = `rgba(255,220,180,${1 - k})`; c.lineWidth = 8; c.beginPath(); c.ellipse(W / 2, baseY, 900 * ease.out(k), 90 * ease.out(k), 0, 0, Math.PI * 2); c.stroke();
        if (t < 4.3) for (let i = 0; i < 12; i++) fx.add({ x: W / 2 + rand(-60, 60), y: baseY, vx: rand(-900, 900), vy: rand(-900, -200), life: 1, size: rand(8, 20), color: pick(['#ff3a1a', '#3a0008', '#ffb05a', '#888']), glow: true, g: 1200 });
        fx.draw(c);
        drawCharAt(c, f.def, W / 2, baseY - 10, 2.4, 1, { pose: 'slam', anim: t, transformed: true });
        c.restore();
        flashAt(c, t, 4.1, 4.5, '#fff0e0');
        c.globalAlpha = 1 - seg(t, 4.8, 5.1); bigText(c, 'WORLD ENDER', W / 2, 200, 110, '#ff3a2a', '#000'); c.globalAlpha = 1;
      } else {
        aatSky(c, 0.75);
        drawCineCity(c, city, baseY, '#0e0205', false);
        c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,80,30,0.8)'; c.lineWidth = 6;
        c.beginPath(); c.moveTo(0, baseY - 6); for (let i = 0; i <= 24; i++) c.lineTo(i * W / 24, baseY - 4 - ((i * 7) % 9)); c.stroke(); c.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 2; i++) fx.add({ x: rand(0, W), y: baseY, vx: rand(-10, 10), vy: rand(-90, -40), life: 1.6, size: rand(10, 24), color: 'rgba(40,10,10,0.5)', grow: 12 });
        fx.draw(c);
        silhouette(c, o => { o.save(); o.translate(W * 0.74, baseY - 14); o.rotate(-1.45); drawCharAt(o, opp.def, 0, 0, oppScale * 0.9, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }); o.restore(); }, '#0a0102');
        glowCircle(c, W * 0.38, baseY - 200, 380, 'rgba(255,20,30,0.3)', 'rgba(255,0,0,0)');
        drawCharAt(c, f.def, W * 0.38, baseY - 6, 2.6, 1, { pose: 'intro', anim: t, transformed: true });
        titleSlam(c, 'DARKIN ANNIHILATION', `${opp.def.name} WAS NEVER A WAR WORTH FIGHTING`, t, 5.2, '#ff2a2a', 86);
      }
    },
  };
}

// ---------------- rivalries ----------------
rival('aatrox', 'aurelion', [[0, 'Another god. I have killed gods.'], [1, 'You have killed pretenders. I am the genuine article.'], [0, 'They all said that. Right before the end.']],
  { aatrox: 'Your heaven is next.', aurelion: 'Crawl back into your sword, demon.' });
rival('aatrox', 'kael', [[1, "There's something in your sword. Same as my chest."], [0, 'Then you understand. The prison is the only thing that is truly yours.']],
  { aatrox: 'Break your core, boy. Become what you are.', kael: "I'm not you. I'll never be you." });
rival('aatrox', 'eric', [[0, 'A boy who becomes a beast. I was a god who became a weapon.'], [1, "Cool story. You're still going down."]],
  { aatrox: 'Your moon cannot save you from me.', eric: 'Look at the moon, sword guy.' });
