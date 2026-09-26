// ============================================================
//  MOONKAI — character art + roster definitions
//  All art is procedural (canvas paths), so there are no assets.
//  Coordinates: feet at (0,0), facing right (+x), ~110 units tall.
// ============================================================

function humanPose(pose, t) {
  const b = Math.sin(t * 5) * 1.5;
  const P = {
    hip: [0, -50], sh: [0, -86 + b], head: [2, -101 + b],
    bK: [-8, -25], bF: [-13, 0], fK: [9, -25], fF: [14, 0],
    bE: [-8, -66 + b], bH: [6, -62 + b], fE: [12, -70 + b], fH: [22, -80 + b],
  };
  const s = Math.sin(t * 13);
  switch (pose) {
    case 'run':
      Object.assign(P, {
        fK: [8 + s * 10, -27], fF: [6 + s * 20, -Math.max(0, s) * 12],
        bK: [-2 - s * 10, -27], bF: [-6 - s * 20, -Math.max(0, -s) * 12],
        sh: [5, -85], head: [8, -100],
        fE: [8 - s * 12, -68], fH: [16 - s * 16, -58], bE: [-4 + s * 12, -68], bH: [2 + s * 18, -60],
      }); break;
    case 'jump':
      Object.assign(P, { fK: [14, -36], fF: [8, -16], bK: [-2, -30], bF: [-14, -12], fE: [14, -96], fH: [22, -110], bE: [-14, -96], bH: [-18, -110] }); break;
    case 'fly':
      Object.assign(P, { sh: [6, -86], head: [10, -100], fK: [6, -28], fF: [-4, -6], bK: [-6, -28], bF: [-18, -8], fE: [22, -82], fH: [36, -86], bE: [-14, -78], bH: [-24, -70] }); break;
    case 'punch':
      Object.assign(P, { sh: [6, -86], head: [9, -100], fE: [28, -86], fH: [52, -86], bE: [-6, -70], bH: [6, -74], fK: [14, -24], fF: [24, 0], bF: [-20, 0] }); break;
    case 'cast':
      Object.assign(P, { sh: [4, -86], head: [6, -101], fE: [24, -82], fH: [46, -80], bE: [18, -76], bH: [42, -74], fF: [20, 0], bF: [-18, 0] }); break;
    case 'hurt':
      Object.assign(P, { hip: [-4, -50], sh: [-10, -84], head: [-14, -98], fE: [2, -96], fH: [-4, -112], bE: [-22, -90], bH: [-32, -100] }); break;
    case 'block':
      Object.assign(P, { sh: [-2, -85], fE: [18, -78], fH: [16, -100], bE: [14, -74], bH: [20, -94] }); break;
    case 'charge':
      Object.assign(P, { fE: [14, -104], fH: [10, -128], bE: [-12, -104], bH: [-6, -128], fF: [20, 0], bF: [-20, 0], fK: [14, -24], bK: [-14, -24] }); break;
    case 'kneel':
      Object.assign(P, { hip: [0, -30], sh: [4, -64], head: [8, -78], fK: [16, -30], fF: [18, 0], bK: [-6, -2], bF: [-22, 0], fE: [16, -46], fH: [14, -30], bE: [-6, -44], bH: [-2, -4] }); break;
    case 'victory':
      Object.assign(P, { fE: [12, -104], fH: [18, -128], bE: [-8, -70], bH: [4, -60] }); break;
  }
  return P;
}

function drawHumanoid(c, v, pal, ext = {}) {
  const P = humanPose(v.pose, v.anim || 0);
  if (ext.back) ext.back(c, P, v);
  // back leg + arm (darker)
  limb3(c, P.hip, P.bK, P.bF, 11, pal.pantsDark || pal.pants);
  ellipse(c, P.bF[0] + 3, P.bF[1] - 3, 8, 5, pal.boots);
  limb3(c, P.sh, P.bE, P.bH, 9, pal.topDark || pal.top);
  circle(c, P.bH[0], P.bH[1], 5, pal.glove || pal.skin);
  // torso
  limb(c, P.hip, P.sh, 25, pal.top);
  if (pal.belt) limb(c, [P.hip[0] - 9, P.hip[1] + 2], [P.hip[0] + 9, P.hip[1] + 2], 5, pal.belt);
  if (ext.chest) ext.chest(c, P, v);
  // front leg
  limb3(c, P.hip, P.fK, P.fF, 11, pal.pants);
  ellipse(c, P.fF[0] + 3, P.fF[1] - 3, 8, 5, pal.boots);
  // neck + head
  limb(c, P.sh, [P.head[0], P.head[1] + 6], 7, pal.skin);
  circle(c, P.head[0], P.head[1], 11, pal.skin);
  if (ext.head) ext.head(c, P, v);
  // front arm
  limb3(c, P.sh, P.fE, P.fH, 9, pal.top);
  circle(c, P.fH[0], P.fH[1], 5.5, pal.glove || pal.skin);
  if (ext.front) ext.front(c, P, v);
}

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

// ---------------- ROSTER ----------------
const CHARACTERS = [
  {
    id: 'eric', name: 'ERIC', title: 'The Moonborn', side: 'HERO', color: '#ffd35a', color2: '#2d5fd6',
    bio: 'A quiet college kid with a tail he keeps tucked away. Under a full moon — or one he makes himself — he becomes MOONKAI, a skyscraper-sized ape that levels whole blocks.',
    quote: '"No full moon tonight? Fine. I\'ll make one."',
    stats: { POWER: 5, SPEED: 2, DEFENSE: 4, CHAOS: 5 },
    moves: [
      ['J', 'Strike', 'Jab → Ape: Seismic Smash (ground shockwave)'],
      ['K', 'Ki Blast', 'Energy orb → Ape: Mouth Beam (melts buildings)'],
      ['L', 'MOON ORB', 'Throws a ball of lunar energy into the sky → MOONKAI GREAT APE'],
      ['I', 'LUNAR CATACLYSM', 'ULTIMATE: a city-erasing beam from the giant ape'],
    ],
    formName: 'MOONKAI', formScale: 2.3, formSpeed: 0.72, formJump: 0.75, formArmor: 0.65,
    transformName: 'MOON ORB', ultName: 'LUNAR CATACLYSM',
    draw: drawEric,
  },
  {
    id: 'kira', name: 'KIRA SOL', title: 'The Undying Flame', side: 'HERO', color: '#ff7a1a', color2: '#b3122e',
    bio: 'A firefighter who died saving a burning tower — and walked out of the ashes. Each time she falls, she rises hotter. Her Phoenix form grants flight and a healing fire.',
    quote: '"Knock me down. I dare you. I come back brighter."',
    stats: { POWER: 3, SPEED: 5, DEFENSE: 2, CHAOS: 3 },
    moves: [
      ['J', 'Blaze Kick', 'Fast flaming strike'],
      ['K', 'Flare Dart', 'Lightning-fast fireball → Phoenix: Feather Storm (3-way)'],
      ['L', 'PHOENIX ASCENSION', 'Fire wings: hold W to FLY, regenerate health'],
      ['I', 'SUPERNOVA REBIRTH', 'ULTIMATE: become a sun, dive as a phoenix, rise healed'],
    ],
    formName: 'PHOENIX', formScale: 1.1, formSpeed: 1.2, formJump: 1, formArmor: 1,
    transformName: 'PHOENIX ASCENSION', ultName: 'SUPERNOVA REBIRTH',
    draw: drawKira,
  },
  {
    id: 'vex', name: 'VEX', title: 'Architect of Nothing', side: 'VILLAIN', color: '#b36bff', color2: '#2a0d3d',
    bio: 'A physicist who stared into a collapsing star and something stared back. He wants to "correct" the universe by un-making it, one city at a time.',
    quote: '"Heroes build. Cities stand. Both are temporary."',
    stats: { POWER: 4, SPEED: 4, DEFENSE: 3, CHAOS: 5 },
    moves: [
      ['J', 'Null Touch', 'Strike that drains energy from the target'],
      ['K', 'Shadow Spike', 'Spike erupts beneath the enemy → Void: Rift Step (teleport slash)'],
      ['L', 'VOID FORM', 'Becomes a shadow wraith: lifesteal, damage resistance'],
      ['I', 'EVENT HORIZON', 'ULTIMATE: tears open a black hole that swallows the city'],
    ],
    formName: 'VOID WRAITH', formScale: 1.35, formSpeed: 1.05, formJump: 1, formArmor: 0.75,
    transformName: 'VOID FORM', ultName: 'EVENT HORIZON',
    draw: drawVex,
  },
];
