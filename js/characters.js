// ============================================================
//  MOONKAI — character art + roster definitions
//  All art is procedural (canvas paths), so there are no assets.
//  Coordinates: feet at (0,0), facing right (+x), ~110 units tall.
// ============================================================

// ---------------- ERIC ----------------
const ERIC_PAL = { skin: '#f1c27d', top: '#2d5fd6', topDark: '#1f439c', pants: '#2a2a44', pantsDark: '#1c1c30', boots: '#6b3416', belt: '#e23b3b', glove: '#f1c27d' };
function drawEricHuman(c, v) {
  const t = v.anim || 0;
  drawHumanoid(c, v, ERIC_PAL, {
    back(c, P) {
      // monkey tail — the hint of what he really is
      const w = Math.sin(t * 4) * 6;
      c.strokeStyle = '#6b4226'; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(P.hip[0] - 6, P.hip[1] + 4);
      c.bezierCurveTo(P.hip[0] - 30, P.hip[1] + 10, P.hip[0] - 38 + w, P.hip[1] - 14, P.hip[0] - 24 + w, P.hip[1] - 26);
      c.stroke();
      // scarf trailing
      c.fillStyle = '#e23b3b';
      c.beginPath(); c.moveTo(P.sh[0] - 2, P.sh[1] - 2);
      c.quadraticCurveTo(P.sh[0] - 20, P.sh[1] + Math.sin(t * 9) * 5, P.sh[0] - 34, P.sh[1] + 6 + Math.sin(t * 9 + 1) * 6);
      c.lineTo(P.sh[0] - 30, P.sh[1] + 12 + Math.sin(t * 9 + 1) * 6);
      c.quadraticCurveTo(P.sh[0] - 16, P.sh[1] + 6, P.sh[0] + 2, P.sh[1] + 4);
      c.fill();
    },
    chest(c, P) { limb(c, [P.sh[0] - 7, P.sh[1] + 2], [P.sh[0] + 7, P.sh[1] + 2], 6, '#e23b3b'); },
    head(c, P, v) {
      const [hx, hy] = P.head;
      c.fillStyle = '#141414';
      c.beginPath();
      c.moveTo(hx - 12, hy + 2);
      const spikes = [[-18, -6], [-10, -10], [-16, -18], [-4, -14], [-6, -26], [4, -14], [8, -24], [10, -10], [16, -12], [12, -2]];
      for (const [sx, sy] of spikes) c.lineTo(hx + sx, hy + sy);
      c.lineTo(hx + 11, hy - 4); c.closePath(); c.fill();
      // eye
      const red = v.eyeRed || 0;
      circle(c, hx + 6, hy + 1, 2, red > 0 ? `rgb(${200 + 55 * red},${40 * (1 - red)},${40 * (1 - red)})` : '#111');
    },
  });
}

const APE = { fur: '#5b3a22', dark: '#3a2414', chest: '#c89968', face: '#dcb48c' };
function drawApe(c, v) {
  const t = v.anim || 0;
  const pose = v.pose;
  const breathe = Math.sin(t * 3) * 1.5;
  const roar = v.roar !== undefined ? v.roar : (pose === 'cast' || pose === 'charge' ? 1 : 0);
  const glow = v.mouthGlow !== undefined ? v.mouthGlow : (pose === 'cast' ? 1 : 0);
  // tail
  c.strokeStyle = APE.dark; c.lineWidth = 8; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-28, -40);
  c.bezierCurveTo(-60, -30, -66 + Math.sin(t * 2) * 6, -70, -48, -86); c.stroke();
  // back arm
  const bh = pose === 'punch' ? [-20, -30] : [-40, -6];
  limb3(c, [-26, -78 + breathe], [-40, -46], bh, 18, APE.dark);
  circle(c, bh[0], bh[1], 11, APE.dark);
  // legs
  const run = pose === 'run' ? Math.sin(t * 8) * 6 : 0;
  ellipse(c, -18 + run, -14, 15, 17, APE.dark);
  ellipse(c, 18 - run, -14, 15, 17, APE.fur);
  ellipse(c, -16 + run, -1, 14, 5, APE.dark);
  ellipse(c, 22 - run, -1, 14, 5, APE.dark);
  // torso
  ellipse(c, 0, -56 + breathe, 42, 38, APE.fur);
  ellipse(c, 8, -54 + breathe, 25, 27, APE.chest);
  // shaggy fur fringe
  c.fillStyle = APE.fur;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.95 + i * 0.3;
    c.beginPath(); c.moveTo(Math.cos(a) * 40, -60 + Math.sin(a) * 36 + breathe);
    c.lineTo(Math.cos(a) * 50, -60 + Math.sin(a) * 46 + breathe); c.lineTo(Math.cos(a + 0.15) * 40, -60 + Math.sin(a + 0.15) * 36 + breathe); c.fill();
  }
  // head
  const hx = 12, hy = -96 + breathe;
  circle(c, hx, hy, 21, APE.fur);
  c.fillStyle = APE.fur;
  for (let i = 0; i < 5; i++) {
    c.beginPath(); c.moveTo(hx - 16 + i * 7, hy - 14); c.lineTo(hx - 18 + i * 7, hy - 28 - (i % 2) * 5); c.lineTo(hx - 10 + i * 7, hy - 16); c.fill();
  }
  ellipse(c, hx + 9, hy + 7, 15, 10 + roar * 3, APE.face);
  ellipse(c, hx + 2, hy - 6, 15, 7, APE.face);
  // brow
  limb(c, [hx - 8, hy - 11], [hx + 16, hy - 9], 5, APE.dark);
  // eyes
  const eg = v.eyeGlow !== undefined ? v.eyeGlow : 1;
  glowCircle(c, hx + 1, hy - 5, 9 * eg + 1, 'rgba(255,40,40,0.9)');
  glowCircle(c, hx + 11, hy - 5, 9 * eg + 1, 'rgba(255,40,40,0.9)');
  circle(c, hx + 1, hy - 5, 2.5, '#ff2020'); circle(c, hx + 11, hy - 5, 2.5, '#ff2020');
  // mouth
  if (roar > 0) {
    ellipse(c, hx + 13, hy + 10, 7, 3 + roar * 6, '#2a0808');
    c.fillStyle = '#fff';
    c.beginPath(); c.moveTo(hx + 7, hy + 5); c.lineTo(hx + 9, hy + 10); c.lineTo(hx + 11, hy + 5); c.fill();
    c.beginPath(); c.moveTo(hx + 15, hy + 5); c.lineTo(hx + 17, hy + 10); c.lineTo(hx + 19, hy + 5); c.fill();
  } else {
    limb(c, [hx + 6, hy + 11], [hx + 20, hy + 10], 2, APE.dark);
  }
  if (glow > 0) {
    c.globalCompositeOperation = 'lighter';
    glowCircle(c, hx + 13, hy + 10, 26 * glow, 'rgba(255,245,200,1)', 'rgba(255,200,80,0)');
    glowCircle(c, hx + 13, hy + 10, 9 * glow, 'rgba(255,255,255,1)');
    c.globalCompositeOperation = 'source-over';
  }
  // front arm
  const fh = pose === 'punch' ? [72, -64] : pose === 'charge' ? [48, -120] : pose === 'jump' ? [42, -100] : [42, -6];
  const fe = pose === 'punch' ? [46, -74] : pose === 'charge' ? [46, -90] : [44, -48];
  limb3(c, [26, -78 + breathe], fe, fh, 19, APE.fur);
  circle(c, fh[0], fh[1], 12, APE.fur);
}
function drawEric(c, v) { v.transformed ? drawApe(c, v) : drawEricHuman(c, v); }

// ---------------- KIRA ----------------
const KIRA_PAL = { skin: '#d9a066', top: '#b3122e', topDark: '#7d0c20', pants: '#8f0e25', pantsDark: '#630a1a', boots: '#ffcc33', belt: '#ffcc33', glove: '#ffcc33' };
function drawWings(c, P, t, span = 1) {
  const flap = Math.sin(t * 7) * 0.18;
  const [sx, sy] = P.sh;
  c.globalCompositeOperation = 'lighter';
  for (const side of [-1, 1]) {
    c.save(); c.translate(sx - 4, sy + 4); c.rotate(side * (0.25 + flap) - 0.1); c.scale(span, span);
    const g = c.createLinearGradient(0, 0, -120, -60);
    g.addColorStop(0, 'rgba(255,240,150,0.95)'); g.addColorStop(0.5, 'rgba(255,120,20,0.8)'); g.addColorStop(1, 'rgba(200,20,0,0)');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(-40, -60 * side - 20, -110, -90 * side + 10, -150, -60 * side);
    for (let i = 0; i < 6; i++) {
      const fx = -150 + i * 24, fy = -60 * side + i * 12 * side + Math.sin(t * 12 + i) * 4;
      c.lineTo(fx + 8, fy + 22 * side); c.lineTo(fx + 20, fy + 8 * side);
    }
    c.closePath(); c.fill();
    c.restore();
  }
  c.globalCompositeOperation = 'source-over';
}
function drawKira(c, v) {
  const t = v.anim || 0;
  if (v.transformed) glowCircle(c, 0, -60, 90, 'rgba(255,140,30,0.35)', 'rgba(255,60,0,0)');
  drawHumanoid(c, v, KIRA_PAL, {
    back(c, P, v) { if (v.transformed || v.wings) drawWings(c, P, t, v.wings !== undefined ? v.wings : 1); },
    chest(c, P) {
      c.fillStyle = '#ffcc33';
      const [x, y] = [lerp(P.hip[0], P.sh[0], 0.65), lerp(P.hip[1], P.sh[1], 0.65)];
      c.beginPath(); c.moveTo(x, y - 7); c.lineTo(x + 6, y); c.lineTo(x, y + 7); c.lineTo(x - 6, y); c.fill();
    },
    head(c, P, v) {
      const [hx, hy] = P.head;
      // living flame hair
      c.globalCompositeOperation = 'lighter';
      const n = v.transformed ? 9 : 6;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI * 0.5 - 0.9 + i * (1.8 / (n - 1)) - 0.5;
        const len = (v.transformed ? 30 : 20) + Math.sin(t * 14 + i * 1.7) * 6;
        const bx = hx + Math.cos(a) * 9, by = hy + Math.sin(a) * 9;
        c.fillStyle = i % 2 ? 'rgba(255,200,40,0.9)' : 'rgba(255,90,20,0.9)';
        c.beginPath(); c.moveTo(bx - 5, by + 2);
        c.quadraticCurveTo(bx + Math.cos(a) * len * 0.5 - 8, by + Math.sin(a) * len * 0.5, bx + Math.cos(a - 0.5) * len, by + Math.sin(a - 0.5) * len);
        c.lineTo(bx + 5, by); c.fill();
      }
      c.globalCompositeOperation = 'source-over';
      // mask
      c.fillStyle = '#ffcc33';
      c.beginPath(); c.moveTo(hx - 2, hy - 4); c.lineTo(hx + 13, hy - 5); c.lineTo(hx + 12, hy + 1); c.lineTo(hx, hy + 1); c.fill();
      circle(c, hx + 7, hy - 2, 1.8, v.transformed ? '#fff6b0' : '#222');
    },
  });
}

// ---------------- VEX ----------------
const VEX_PAL = { skin: '#8e84a8', top: '#3b1b52', topDark: '#261036', pants: '#2a1238', pantsDark: '#1a0a24', boots: '#111', belt: '#b36bff', glove: '#1a1a1a' };
function drawVexHuman(c, v) {
  const t = v.anim || 0;
  drawHumanoid(c, v, VEX_PAL, {
    back(c, P) {
      // tattered cloak
      c.fillStyle = '#1b0826';
      c.beginPath(); c.moveTo(P.sh[0] - 10, P.sh[1] - 2);
      c.lineTo(P.sh[0] + 8, P.sh[1] - 2);
      for (let i = 0; i <= 6; i++) {
        const x = P.sh[0] + 4 - i * 9, y = -4 + (i % 2) * 10 + Math.sin(t * 5 + i) * 4;
        c.lineTo(x - 6, y);
      }
      c.closePath(); c.fill();
    },
    chest(c, P) { circle(c, lerp(P.hip[0], P.sh[0], 0.7), lerp(P.hip[1], P.sh[1], 0.7), 4, '#b36bff'); },
    head(c, P) {
      const [hx, hy] = P.head;
      // hood + mask
      c.fillStyle = '#1b0826';
      c.beginPath(); c.arc(hx - 2, hy - 1, 14, Math.PI * 0.6, Math.PI * 2.1); c.lineTo(hx + 4, hy + 10); c.fill();
      circle(c, hx + 2, hy + 1, 9, '#101010');
      c.globalCompositeOperation = 'lighter';
      glowCircle(c, hx + 6, hy - 1, 10, 'rgba(190,110,255,0.95)');
      c.globalCompositeOperation = 'source-over';
      circle(c, hx + 6, hy - 1, 2.2, '#f3e2ff');
    },
  });
}
function drawVoidWraith(c, v) {
  const t = v.anim || 0;
  const atk = v.pose === 'punch' || v.pose === 'cast';
  // tendrils
  c.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.6 + i * 0.15);
    c.strokeStyle = i % 2 ? '#2a0d3d' : '#120318'; c.lineWidth = 6 - i * 0.5;
    c.beginPath(); c.moveTo(0, -70);
    const ex = Math.cos(a) * 90 + Math.sin(t * 3 + i) * 14, ey = -70 + Math.sin(a) * -60 + Math.cos(t * 2 + i) * 16;
    c.quadraticCurveTo(Math.cos(a) * 40, -110 + Math.sin(t * 4 + i) * 20, ex, ey); c.stroke();
  }
  // body
  const g = c.createLinearGradient(0, -120, 0, 0);
  g.addColorStop(0, '#07010c'); g.addColorStop(0.7, '#2c0b44'); g.addColorStop(1, 'rgba(90,20,140,0)');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, -122);
  c.quadraticCurveTo(26, -118, 34, -86);
  c.quadraticCurveTo(26, -50, 18, -20);
  for (let i = 0; i <= 8; i++) c.lineTo(18 - i * 4.5, -6 + (i % 2) * -14 + Math.sin(t * 8 + i) * 5);
  c.quadraticCurveTo(-26, -50, -34, -86);
  c.quadraticCurveTo(-26, -118, 0, -122);
  c.fill();
  // arms / claws
  const reach = atk ? 60 : 30;
  for (const [ox, dark] of [[-6, true], [6, false]]) {
    c.strokeStyle = dark ? '#12031a' : '#2c0b44'; c.lineWidth = 8;
    c.beginPath(); c.moveTo(ox, -86); c.quadraticCurveTo(ox + reach * 0.5, -100, ox + reach, -80 + (dark ? 6 : 0)); c.stroke();
    c.strokeStyle = '#c38bff'; c.lineWidth = 2;
    for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(ox + reach, -80 + (dark ? 6 : 0)); c.lineTo(ox + reach + 14, -80 + k * 7 + (dark ? 6 : 0)); c.stroke(); }
  }
  // crown of shards
  c.fillStyle = '#b36bff';
  for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 7 - 3, -118); c.lineTo(i * 8, -134 - Math.abs(2 - Math.abs(i)) * 5); c.lineTo(i * 7 + 3, -118); c.fill(); }
  // the eye
  c.globalCompositeOperation = 'lighter';
  glowCircle(c, 8, -98, 26, 'rgba(180,90,255,0.9)');
  c.globalCompositeOperation = 'source-over';
  ellipse(c, 8, -98, 11, 6, '#f0dcff');
  ellipse(c, 8, -98, 3, 5.5, '#2a0040');
}
function drawVex(c, v) {
  c.save();
  c.translate(0, -6 - Math.sin((v.anim || 0) * 2.5) * 4); // villains don't touch the ground
  v.transformed ? drawVoidWraith(c, v) : drawVexHuman(c, v);
  c.restore();
}


// ---------------- KAEL ----------------
const KAEL_PAL = { skin: '#c9b3a0', top: '#2b3440', topDark: '#1b222b', pants: '#232a33', pantsDark: '#161b21', boots: '#0e1115', belt: '#3fe0ff', glove: '#2b3440' };
const DEMON_PAL = { skin: '#6e1414', top: '#3a0b0b', topDark: '#220606', pants: '#2a0808', pantsDark: '#180404', boots: '#0a0202', belt: '#ff3b1a', glove: '#1a0303' };
function drawCore(c, x, y, r, t, broken) {
  c.save(); c.translate(x, y);
  c.globalCompositeOperation = 'lighter';
  glowCircle(c, 0, 0, r * 3, broken ? 'rgba(255,60,20,0.8)' : 'rgba(60,220,255,0.8)', 'rgba(0,0,0,0)');
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = broken ? '#ff5a1a' : '#bff6ff';
  c.beginPath();
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  c.closePath(); c.fill();
  c.strokeStyle = broken ? '#1a0000' : '#1d6a80'; c.lineWidth = r * 0.18;
  if (broken) { c.beginPath(); c.moveTo(-r, -r * 0.3); c.lineTo(0, 0); c.lineTo(r * 0.4, r); c.moveTo(0, 0); c.lineTo(r * 0.7, -r * 0.8); c.stroke(); }
  else { c.stroke(); circle(c, 0, 0, r * 0.35 * (0.8 + 0.2 * Math.sin(t * 6)), '#ffffff'); }
  c.restore();
}
function drawKael(c, v) {
  const t = v.anim || 0, D = v.transformed;
  if (D) glowCircle(c, 0, -60, 95, 'rgba(255,40,10,0.3)', 'rgba(120,0,0,0)');
  drawHumanoid(c, v, D ? DEMON_PAL : KAEL_PAL, {
    back(c, P) {
      if (!D) return;
      // tattered demon wings
      for (const side of [-1, 1]) {
        c.save(); c.translate(P.sh[0] - 4, P.sh[1] + 2); c.rotate(side * 0.15 - 0.35 + Math.sin(t * 3) * 0.08);
        c.fillStyle = side < 0 ? '#1a0303' : '#2a0606';
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-30, -44 * (side < 0 ? 1.1 : 1)); c.lineTo(-70, -30); c.lineTo(-58, -8); c.lineTo(-74, 4); c.lineTo(-46, 10); c.lineTo(-50, 26); c.lineTo(-16, 16); c.closePath(); c.fill();
        c.restore();
      }
      // tail
      c.strokeStyle = '#2a0606'; c.lineWidth = 4; c.beginPath(); c.moveTo(P.hip[0] - 6, P.hip[1] + 4);
      c.quadraticCurveTo(P.hip[0] - 40, P.hip[1] + 30, P.hip[0] - 46 + Math.sin(t * 4) * 6, P.hip[1] - 4); c.stroke();
      c.fillStyle = '#ff3b1a'; c.beginPath(); const tx = P.hip[0] - 46 + Math.sin(t * 4) * 6, ty = P.hip[1] - 4;
      c.moveTo(tx - 5, ty); c.lineTo(tx, ty - 10); c.lineTo(tx + 5, ty); c.fill();
    },
    chest(c, P) {
      const x = lerp(P.hip[0], P.sh[0], 0.72), y = lerp(P.hip[1], P.sh[1], 0.72);
      if (!D && !v.coreBroken) { limb(c, [x - 10, y - 8], [x + 10, y + 8], 3, '#556'); limb(c, [x + 10, y - 8], [x - 10, y + 8], 3, '#556'); }
      drawCore(c, x, y, 7, t, D || v.coreBroken);
    },
    head(c, P) {
      const [hx, hy] = P.head;
      if (!D) {
        c.fillStyle = '#e8e8f0';
        c.beginPath(); c.moveTo(hx - 12, hy - 2); c.lineTo(hx - 14, hy - 12); c.lineTo(hx - 4, hy - 13); c.lineTo(hx + 2, hy - 16); c.lineTo(hx + 12, hy - 8); c.lineTo(hx + 4, hy - 6); c.closePath(); c.fill();
        circle(c, hx + 6, hy, 2, '#3fe0ff');
      } else {
        // horns + burning eyes
        c.fillStyle = '#140202';
        c.beginPath(); c.moveTo(hx - 6, hy - 8); c.quadraticCurveTo(hx - 20, hy - 20, hx - 14, hy - 34); c.quadraticCurveTo(hx - 10, hy - 18, hx - 1, hy - 10); c.fill();
        c.beginPath(); c.moveTo(hx + 4, hy - 9); c.quadraticCurveTo(hx + 8, hy - 24, hx + 20, hy - 30); c.quadraticCurveTo(hx + 12, hy - 18, hx + 10, hy - 6); c.fill();
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, hx + 6, hy, 9, 'rgba(255,90,20,1)');
        c.globalCompositeOperation = 'source-over';
        circle(c, hx + 6, hy, 2.2, '#fff2a0');
        limb(c, [hx + 2, hy + 6], [hx + 11, hy + 6], 2, '#ff5a1a');
      }
    },
  });
}

