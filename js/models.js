// ============================================================
//  MOONKAI — model renderer v3
//  Shaded, outlined procedural fighters built from data:
//  builds, poses, hands/feet, hair, hats, ears, masks, animal heads,
//  wings, tails, spider legs, tentacles, 25 weapon types, special bodies.
//  Feet at (0,0), facing +x, ~110 units tall at scale 1.
// ============================================================

const BUILDS = {
  slim: { bulk: 0.85, limb: 0.85, h: 1.02, hips: 0.9 },
  normal: { bulk: 1, limb: 1, h: 1, hips: 1 },
  athletic: { bulk: 1.15, limb: 1.1, h: 1.04, hips: 0.95 },
  curvy: { bulk: 0.9, limb: 0.9, h: 0.98, hips: 1.25 },
  heavy: { bulk: 1.45, limb: 1.35, h: 1.06, hips: 1.2 },
  giant: { bulk: 1.7, limb: 1.55, h: 1.18, hips: 1.3 },
  small: { bulk: 0.8, limb: 0.8, h: 0.78, hips: 0.9 },
};

function humanPose(pose, t) {
  const b = Math.sin(t * 5) * 1.5;
  const P = {
    hip: [0, -50], sh: [0, -86 + b], head: [2, -101 + b],
    bK: [-8, -25], bF: [-13, 0], fK: [9, -25], fF: [14, 0],
    bE: [-8, -66 + b], bH: [6, -62 + b], fE: [12, -70 + b], fH: [22, -80 + b],
  };
  const s = Math.sin(t * 13);
  const A = o => Object.assign(P, o);
  switch (pose) {
    case 'walk': case 'run': {
      const k = pose === 'walk' ? 0.6 : 1, w = Math.sin(t * (pose === 'walk' ? 8 : 13));
      A({ fK: [8 + w * 10 * k, -27], fF: [6 + w * 20 * k, -Math.max(0, w) * 12 * k], bK: [-2 - w * 10 * k, -27], bF: [-6 - w * 20 * k, -Math.max(0, -w) * 12 * k],
        sh: [3 + 2 * k, -85], head: [5 + 3 * k, -100], fE: [8 - w * 12 * k, -68], fH: [16 - w * 16 * k, -58], bE: [-4 + w * 12 * k, -68], bH: [2 + w * 18 * k, -60] }); break;
    }
    case 'backwalk': A({ sh: [-3, -86], head: [-1, -101], fK: [10 - s * 6, -26], fF: [12 - s * 10, 0], bK: [-8 + s * 6, -26], bF: [-14 + s * 10, 0], fE: [14, -74], fH: [22, -84], bE: [4, -70], bH: [14, -76] }); break;
    case 'crouch': A({ hip: [-2, -32], sh: [4, -64], head: [8, -78], fK: [16, -24], fF: [16, 0], bK: [-14, -18], bF: [-16, 0], fE: [16, -50], fH: [24, -60], bE: [4, -48], bH: [16, -54] }); break;
    case 'cblock': A({ hip: [-4, -32], sh: [-2, -63], head: [0, -77], fK: [14, -24], fF: [14, 0], bK: [-16, -18], bF: [-18, 0], fE: [14, -56], fH: [12, -76], bE: [10, -52], bH: [16, -70] }); break;
    case 'c_light': A({ hip: [-2, -32], sh: [6, -64], head: [10, -78], fK: [16, -24], fF: [16, 0], bK: [-14, -18], bF: [-16, 0], fE: [28, -58], fH: [48, -56], bE: [4, -50], bH: [14, -54] }); break;
    case 'sweep': A({ hip: [-6, -26], sh: [-2, -58], head: [0, -72], fK: [22, -12], fF: [52, -4], bK: [-18, -14], bF: [-20, 0], fE: [4, -40], fH: [-6, -24], bE: [-14, -44], bH: [-22, -30] }); break;
    case 'jump': A({ fK: [14, -36], fF: [8, -16], bK: [-2, -30], bF: [-14, -12], fE: [14, -96], fH: [22, -110], bE: [-14, -96], bH: [-18, -110] }); break;
    case 'fall': A({ fK: [10, -32], fF: [14, -8], bK: [-6, -30], bF: [-16, -6], fE: [18, -90], fH: [30, -98], bE: [-18, -90], bH: [-28, -96] }); break;
    case 'fly': A({ sh: [6, -86], head: [10, -100], fK: [6, -28], fF: [-4, -6], bK: [-6, -28], bF: [-18, -8], fE: [22, -82], fH: [36, -86], bE: [-14, -78], bH: [-24, -70] }); break;
    case 'air_light': A({ fK: [18, -40], fF: [28, -22], bK: [-2, -30], bF: [-12, -14], fE: [22, -80], fH: [40, -78], bE: [-10, -76], bH: [0, -70] }); break;
    case 'air_mid': A({ hip: [-2, -52], sh: [-6, -86], head: [-6, -100], fK: [26, -50], fF: [52, -56], bK: [-6, -32], bF: [-16, -14], fE: [4, -76], fH: [10, -90], bE: [-20, -74], bH: [-30, -80] }); break;
    case 'air_heavy': A({ sh: [8, -84], head: [14, -96], fE: [30, -104], fH: [40, -122], bE: [22, -106], bH: [34, -122], fK: [14, -34], fF: [10, -14], bK: [-4, -30], bF: [-14, -12] }); break;
    case 'air_spike': A({ sh: [10, -80], head: [16, -92], fE: [34, -64], fH: [50, -40], bE: [26, -66], bH: [44, -40], fK: [14, -34], fF: [8, -14], bK: [-4, -30], bF: [-14, -12] }); break;
    case 'punch': A({ sh: [6, -86], head: [9, -100], fE: [28, -86], fH: [52, -86], bE: [-6, -70], bH: [6, -74], fK: [14, -24], fF: [24, 0], bF: [-20, 0] }); break;
    case 'punch2': A({ sh: [8, -86], head: [11, -100], bE: [26, -84], bH: [50, -84], fE: [0, -70], fH: [10, -74], fK: [16, -24], fF: [26, 0], bF: [-20, 0] }); break;
    case 'kick': A({ hip: [-2, -52], sh: [-8, -86], head: [-8, -101], fK: [24, -46], fF: [50, -54], bK: [-6, -26], bF: [-10, 0], fE: [6, -76], fH: [14, -88], bE: [-20, -74], bH: [-30, -80] }); break;
    case 'heavy': A({ sh: [12, -84], head: [16, -97], fE: [34, -82], fH: [60, -80], bE: [-10, -74], bH: [-6, -66], fK: [20, -24], fF: [34, 0], bK: [-14, -26], bF: [-26, 0] }); break;
    case 'uppercut': A({ sh: [6, -90], head: [10, -104], fE: [22, -104], fH: [26, -132], bE: [-8, -72], bH: [4, -64], fK: [16, -30], fF: [18, 0], bK: [-8, -22], bF: [-22, 0] }); break;
    case 'slam': A({ sh: [10, -82], head: [16, -94], fE: [34, -76], fH: [52, -48], bE: [28, -78], bH: [46, -44], fK: [16, -24], fF: [26, 0], bF: [-22, 0] }); break;
    case 'dash': A({ hip: [0, -46], sh: [16, -78], head: [24, -90], fE: [2, -66], fH: [-14, -60], bE: [-8, -70], bH: [-24, -66], fK: [16, -24], fF: [30, -4], bK: [-14, -24], bF: [-32, -6] }); break;
    case 'cast': A({ sh: [4, -86], head: [6, -101], fE: [24, -82], fH: [46, -80], bE: [18, -76], bH: [42, -74], fF: [20, 0], bF: [-18, 0] }); break;
    case 'cast_up': A({ sh: [2, -88], head: [4, -103], fE: [20, -106], fH: [34, -126], bE: [10, -104], bH: [22, -124], fF: [16, 0], bF: [-16, 0] }); break;
    case 'throw': A({ sh: [10, -84], head: [14, -98], fE: [30, -94], fH: [44, -104], bE: [24, -92], bH: [40, -100], fK: [16, -24], fF: [22, 0], bF: [-20, 0] }); break;
    case 'hurt': A({ hip: [-4, -50], sh: [-10, -84], head: [-14, -98], fE: [2, -96], fH: [-4, -112], bE: [-22, -90], bH: [-32, -100] }); break;
    case 'hurt_air': A({ hip: [0, -50], sh: [-12, -80], head: [-18, -92], fK: [14, -30], fF: [20, -10], bK: [4, -28], bF: [8, -8], fE: [-2, -100], fH: [-10, -114], bE: [-24, -94], bH: [-34, -104] }); break;
    case 'stun': A({ sh: [Math.sin(t * 6) * 5, -84], head: [Math.sin(t * 6) * 8, -98], fE: [10, -64], fH: [12, -48], bE: [-10, -64], bH: [-12, -48] }); break;
    case 'block': A({ sh: [-2, -85], fE: [18, -78], fH: [16, -100], bE: [14, -74], bH: [20, -94] }); break;
    case 'charge': A({ fE: [14, -104], fH: [10, -128], bE: [-12, -104], bH: [-6, -128], fF: [20, 0], bF: [-20, 0], fK: [14, -24], bK: [-14, -24] }); break;
    case 'kichar': A({ hip: [0, -46], sh: [0, -82], head: [2, -96], fE: [20, -60], fH: [14, -46], bE: [-20, -60], bH: [-14, -46], fF: [22, 0], bF: [-22, 0], fK: [16, -22], bK: [-16, -22] }); break;
    case 'kneel': A({ hip: [0, -30], sh: [4, -64], head: [8, -78], fK: [16, -30], fF: [18, 0], bK: [-6, -2], bF: [-22, 0], fE: [16, -46], fH: [14, -30], bE: [-6, -44], bH: [-2, -4] }); break;
    case 'taunt': A({ sh: [-2, -86], head: [-2, -101], fE: [20, -88], fH: [30, -104 + Math.sin(t * 10) * 6], bE: [-10, -70], bH: [-2, -58] }); break;
    case 'victory': A({ fE: [12, -104], fH: [18, -128], bE: [-8, -70], bH: [4, -60] }); break;
    case 'intro': A({ sh: [0, -86], head: [2, -101], fE: [4, -66], fH: [-6, -58], bE: [-10, -66], bH: [-4, -56], fF: [10, 0], bF: [-12, 0] }); break;
  }
  return P;
}

const OUTLINE = 'rgba(8,6,18,0.85)';
function shadedLimb(c, pts, w, col) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  const path = (ox = 0, oy = 0) => { c.beginPath(); c.moveTo(pts[0][0] + ox, pts[0][1] + oy); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0] + ox, pts[i][1] + oy); };
  path(); c.strokeStyle = OUTLINE; c.lineWidth = w + 3.2; c.stroke();
  path(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
  path(-w * 0.18, -w * 0.2); c.strokeStyle = 'rgba(255,255,255,0.17)'; c.lineWidth = w * 0.28; c.stroke();
  path(w * 0.2, w * 0.2); c.strokeStyle = 'rgba(0,0,0,0.14)'; c.lineWidth = w * 0.3; c.stroke();
}
function torso(c, P, pal, B) {
  const dx = P.sh[0] - P.hip[0], dy = P.sh[1] - P.hip[1], L = Math.hypot(dx, dy) || 1;
  const px = -dy / L, py = dx / L, ux = dx / L, uy = dy / L;
  const SW = 15 * B.bulk, WW = 9.5 * B.bulk * (B.hips > 1 ? 0.92 : 1), HW = 10.5 * B.bulk * B.hips;
  const waist = [P.hip[0] + dx * 0.35, P.hip[1] + dy * 0.35];
  const g = c.createLinearGradient(P.sh[0] - 14, P.sh[1] - 6, P.hip[0] + 12, P.hip[1]);
  g.addColorStop(0, shadeHex(pal.top, 0.2)); g.addColorStop(0.5, pal.top); g.addColorStop(1, pal.topDark || shadeHex(pal.top, -0.35));
  c.beginPath();
  c.moveTo(P.sh[0] + px * SW, P.sh[1] + py * SW);
  c.quadraticCurveTo(P.sh[0] + ux * 7, P.sh[1] + uy * 7, P.sh[0] - px * SW, P.sh[1] - py * SW);
  c.quadraticCurveTo(waist[0] - px * WW * 1.1, waist[1] - py * WW * 1.1, P.hip[0] - px * HW, P.hip[1] - py * HW);
  c.lineTo(P.hip[0] + px * HW, P.hip[1] + py * HW);
  c.quadraticCurveTo(waist[0] + px * WW * 1.1, waist[1] + py * WW * 1.1, P.sh[0] + px * SW, P.sh[1] + py * SW);
  c.closePath();
  c.fillStyle = g; c.fill(); c.strokeStyle = OUTLINE; c.lineWidth = 2; c.stroke();
  // muscle / cloth folds
  c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 1.4;
  const mid = t => [lerp(P.sh[0], P.hip[0], t), lerp(P.sh[1], P.hip[1], t)];
  const a = mid(0.18), b = mid(0.8);
  c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  if (pal.abs) { for (const k of [0.45, 0.6, 0.72]) { const m = mid(k); c.beginPath(); c.moveTo(m[0] - px * 6, m[1] - py * 6); c.lineTo(m[0] + px * 6, m[1] + py * 6); c.stroke(); } }
  if (pal.coat) {
    // long coat tails behind the hips
    c.fillStyle = pal.coat; c.strokeStyle = OUTLINE; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(P.hip[0] - px * HW - 2, P.hip[1] - 4); c.lineTo(P.hip[0] - 16, -8 + Math.sin(Date.now() / 300) * 2); c.lineTo(P.hip[0] - 2, -14); c.lineTo(P.hip[0] + px * HW, P.hip[1]); c.closePath(); c.fill(); c.stroke();
  }
}
function shadedHead(c, x, y, r, skin) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, 1, x, y, r * 1.1);
  g.addColorStop(0, shadeHex(skin, 0.25)); g.addColorStop(0.7, skin); g.addColorStop(1, shadeHex(skin, -0.3));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = OUTLINE; c.lineWidth = 2; c.stroke();
  // jaw
  c.fillStyle = skin; c.beginPath(); c.moveTo(x - 2, y + r * 0.55); c.quadraticCurveTo(x + r * 0.9, y + r * 1.05, x + r * 0.95, y + r * 0.2); c.lineTo(x + r * 0.2, y); c.fill();
}
function drawFist(c, x, y, r, col) {
  c.fillStyle = col; c.strokeStyle = OUTLINE; c.lineWidth = 1.6;
  roundRect(c, x - r, y - r * 0.85, r * 2, r * 1.7, r * 0.6); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - r * 0.3, y - r * 0.7); c.lineTo(x - r * 0.3, y + r * 0.6); c.stroke();
}
function drawBoot(c, x, y, s, col, cuff) {
  c.fillStyle = col; c.strokeStyle = OUTLINE; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(x - 6 * s, y - 9 * s); c.lineTo(x + 3 * s, y - 9 * s); c.quadraticCurveTo(x + 12 * s, y - 5 * s, x + 12 * s, y); c.lineTo(x - 7 * s, y); c.closePath(); c.fill(); c.stroke();
  if (cuff) { c.fillStyle = cuff; c.fillRect(x - 6 * s, y - 11 * s, 9 * s, 3 * s); }
}

// Shaded humanoid. `pal` may carry `build`. ext hooks: back, chest, head, pads, front.
function drawHumanoid(c, v, pal, ext = {}) {
  const B = BUILDS[pal.build] || (pal.bulk ? { bulk: pal.bulk, limb: Math.sqrt(pal.bulk), h: 1, hips: 1 } : BUILDS.normal);
  const P = humanPose(v.pose, v.anim || 0);
  c.save();
  if (B.h !== 1) c.scale(B.h, B.h);
  const lw = 11 * B.limb, aw = 9 * B.limb;
  if (ext.back) ext.back(c, P, v);
  shadedLimb(c, [P.hip, P.bK, P.bF], lw, pal.pantsDark || shadeHex(pal.pants, -0.3));
  drawBoot(c, P.bF[0], P.bF[1], B.limb, shadeHex(pal.boots, -0.2), pal.cuff);
  shadedLimb(c, [P.sh, P.bE, P.bH], aw, pal.topDark || shadeHex(pal.top, -0.3));
  if (pal.sleeves) shadedLimb(c, [P.bE, P.bH], aw * 0.95, shadeHex(pal.sleeves, -0.25));
  drawFist(c, P.bH[0], P.bH[1], 5 * B.limb, shadeHex(pal.glove || pal.skin, -0.15));
  torso(c, P, pal, B);
  if (pal.belt) { c.strokeStyle = pal.belt; c.lineWidth = 5; c.beginPath(); c.moveTo(P.hip[0] - 10 * B.bulk * B.hips, P.hip[1] + 2); c.lineTo(P.hip[0] + 10 * B.bulk * B.hips, P.hip[1] + 2); c.stroke(); circle(c, P.hip[0] + 2, P.hip[1] + 2, 3, shadeHex(pal.belt, 0.4)); }
  if (pal.skirt) { c.fillStyle = pal.skirt; c.strokeStyle = OUTLINE; c.lineWidth = 1.6; c.beginPath(); c.moveTo(P.hip[0] - 12 * B.hips, P.hip[1]); c.lineTo(P.hip[0] + 12 * B.hips, P.hip[1]); c.lineTo(P.hip[0] + 18 * B.hips, P.hip[1] + 24); c.lineTo(P.hip[0] - 18 * B.hips, P.hip[1] + 24); c.closePath(); c.fill(); c.stroke(); }
  if (ext.chest) ext.chest(c, P, v);
  shadedLimb(c, [P.hip, P.fK, P.fF], lw, pal.pants);
  if (pal.kneepads) circle(c, P.fK[0], P.fK[1], 5 * B.limb, pal.kneepads);
  drawBoot(c, P.fF[0], P.fF[1], B.limb, pal.boots, pal.cuff);
  shadedLimb(c, [P.sh, [P.head[0], P.head[1] + 6]], 7 * B.limb, pal.skin);
  if (!pal.noHead) { shadedHead(c, P.head[0], P.head[1], 11, pal.skin); if (!pal.noFace) { circle(c, P.head[0] + 7, P.head[1] - 2, 1.8, '#111'); } }
  if (ext.head) ext.head(c, P, v);
  if (ext.pads) ext.pads(c, P, v);
  shadedLimb(c, [P.sh, P.fE, P.fH], aw, pal.top);
  if (pal.sleeves) shadedLimb(c, [P.fE, P.fH], aw * 0.95, pal.sleeves);
  if (pal.bracers) shadedLimb(c, [[lerp(P.fE[0], P.fH[0], 0.4), lerp(P.fE[1], P.fH[1], 0.4)], [lerp(P.fE[0], P.fH[0], 0.85), lerp(P.fE[1], P.fH[1], 0.85)]], aw * 1.15, pal.bracers);
  drawFist(c, P.fH[0], P.fH[1], 5.5 * B.limb, pal.glove || pal.skin);
  if (ext.front) ext.front(c, P, v);
  c.restore();
}

// ---------------- accessory library ----------------
const Acc = {
  hair(c, P, h, t) {
    const [x, y] = P.head; c.fillStyle = h.color; c.strokeStyle = OUTLINE; c.lineWidth = 1.5;
    const fill = () => { c.fill(); c.stroke(); };
    switch (h.type) {
      case 'spiky': c.beginPath(); c.moveTo(x - 12, y + 2); for (const [sx, sy] of [[-18, -6], [-10, -10], [-16, -18], [-4, -14], [-6, -26], [4, -14], [8, -24], [10, -10], [16, -12], [12, -2]]) c.lineTo(x + sx, y + sy); c.closePath(); fill(); break;
      case 'wild': c.beginPath(); c.moveTo(x - 12, y + 6); for (let i = 0; i < 9; i++) { const a = Math.PI * (0.75 + i * 0.16); c.lineTo(x + Math.cos(a) * 24, y + Math.sin(a) * 22); c.lineTo(x + Math.cos(a + 0.08) * 11, y + Math.sin(a + 0.08) * 11); } c.closePath(); fill(); break;
      case 'long': c.beginPath(); c.moveTo(x + 10, y - 6); c.quadraticCurveTo(x, y - 18, x - 12, y - 8); c.quadraticCurveTo(x - 22 + Math.sin(t * 4) * 3, y + 16, x - 18 + Math.sin(t * 4 + 1) * 4, y + 36); c.lineTo(x - 8, y + 20); c.quadraticCurveTo(x - 4, y + 4, x + 10, y - 6); fill(); break;
      case 'ponytail': c.beginPath(); c.arc(x - 1, y - 2, 12, Math.PI * 0.95, Math.PI * 2.05); fill(); c.beginPath(); c.moveTo(x - 10, y - 8); c.quadraticCurveTo(x - 28 + Math.sin(t * 5) * 4, y - 6, x - 26 + Math.sin(t * 5 + 1) * 5, y + 22); c.lineTo(x - 18, y + 6); c.closePath(); fill(); break;
      case 'twintails': c.beginPath(); c.arc(x - 1, y - 2, 12, Math.PI * 0.95, Math.PI * 2.05); fill(); for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * 6 - 4, y - 10); c.quadraticCurveTo(x + d * 4 - 22, y + 4, x + d * 3 - 16 + Math.sin(t * 5 + d) * 3, y + 30); c.lineTo(x + d * 3 - 10, y + 6); c.closePath(); fill(); } break;
      case 'afro': circle(c, x - 2, y - 8, 17, h.color); c.beginPath(); c.arc(x - 2, y - 8, 17, 0, Math.PI * 2); c.stroke(); break;
      case 'slick': c.beginPath(); c.moveTo(x + 11, y - 4); c.quadraticCurveTo(x + 6, y - 16, x - 8, y - 13); c.quadraticCurveTo(x - 20, y - 8, x - 14, y + 6); c.lineTo(x - 8, y - 2); c.closePath(); fill(); break;
      case 'topknot': c.beginPath(); c.arc(x - 1, y - 2, 11.5, Math.PI * 0.95, Math.PI * 2.05); fill(); circle(c, x - 4, y - 16, 5, h.color); break;
      case 'mohawk': c.beginPath(); c.moveTo(x - 8, y - 8); for (let i = 0; i < 5; i++) { c.lineTo(x - 8 + i * 4, y - 22 - (i % 2) * 5); c.lineTo(x - 6 + i * 4, y - 10); } c.closePath(); fill(); break;
      case 'bun': c.beginPath(); c.arc(x, y - 3, 11.5, Math.PI, Math.PI * 2); fill(); circle(c, x - 10, y - 12, 6, h.color); break;
      case 'bob': c.beginPath(); c.moveTo(x + 12, y + 4); c.quadraticCurveTo(x + 10, y - 16, x - 4, y - 14); c.quadraticCurveTo(x - 18, y - 10, x - 14, y + 10); c.lineTo(x - 6, y + 10); c.lineTo(x - 4, y - 2); c.lineTo(x + 8, y - 4); c.closePath(); fill(); break;
      case 'short': c.beginPath(); c.arc(x - 1, y - 2, 12, Math.PI * 0.95, Math.PI * 2.05); fill(); break;
      case 'buzz': c.globalAlpha = 0.8; c.beginPath(); c.arc(x - 1, y - 1, 11.5, Math.PI, Math.PI * 2); c.fill(); c.globalAlpha = 1; break;
      case 'hood': c.beginPath(); c.arc(x - 2, y - 1, 14, Math.PI * 0.55, Math.PI * 2.1); c.lineTo(x + 4, y + 12); fill(); break;
      case 'helmet': c.beginPath(); c.arc(x, y - 1, 13, Math.PI * 0.85, Math.PI * 2.15); c.lineTo(x + 12, y + 6); c.lineTo(x - 12, y + 6); fill(); c.fillStyle = h.visor || '#7df'; c.fillRect(x - 1, y - 5, 13, 5); break;
      case 'crown': c.beginPath(); c.arc(x - 1, y - 1, 12, Math.PI * 0.9, Math.PI * 2.1); fill(); c.fillStyle = h.accent || '#bff'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + i * 5 - 3, y - 10); c.lineTo(x + i * 5, y - 26 + Math.abs(i) * 5); c.lineTo(x + i * 5 + 3, y - 10); c.fill(); } break;
      case 'jester': for (const [dx, col] of [[-1, h.color], [1, h.accent || '#222']]) { c.fillStyle = col; c.beginPath(); c.moveTo(x - 6 * dx - 2, y - 8); c.quadraticCurveTo(x - 20 * dx, y - 28, x - 26 * dx, y - 14); c.lineTo(x + 2 * dx, y - 12); c.fill(); circle(c, x - 26 * dx, y - 14, 3, '#ffd35a'); } break;
      case 'flame': c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.5 - 1.2 + i * 0.35, len = 20 + Math.sin(t * 14 + i * 1.7) * 6; c.fillStyle = i % 2 ? hexA(h.color, 0.9) : 'rgba(255,220,120,0.9)'; c.beginPath(); c.moveTo(x + Math.cos(a) * 9 - 4, y + Math.sin(a) * 9); c.lineTo(x + Math.cos(a - 0.4) * len, y + Math.sin(a - 0.4) * len); c.lineTo(x + Math.cos(a) * 9 + 4, y + Math.sin(a) * 9); c.fill(); } c.globalCompositeOperation = 'source-over'; break;
      case 'bald': default: break;
    }
  },
  hat(c, P, hat) {
    const [x, y] = P.head; c.fillStyle = hat.color; c.strokeStyle = OUTLINE; c.lineWidth = 1.6;
    const f = () => { c.fill(); c.stroke(); };
    switch (hat.type) {
      case 'wizard': c.beginPath(); c.moveTo(x - 18, y - 6); c.lineTo(x + 18, y - 6); c.lineTo(x + 8, y - 12); c.quadraticCurveTo(x - 4, y - 40, x - 22, y - 44); c.quadraticCurveTo(x - 8, y - 30, x - 8, y - 12); c.closePath(); f(); break;
      case 'cowboy': c.beginPath(); c.ellipse(x, y - 8, 20, 4, 0, 0, Math.PI * 2); f(); c.beginPath(); c.moveTo(x - 9, y - 9); c.lineTo(x - 8, y - 22); c.quadraticCurveTo(x, y - 18, x + 8, y - 22); c.lineTo(x + 9, y - 9); f(); break;
      case 'tophat': c.fillRect(x - 16, y - 12, 32, 4); c.strokeRect(x - 16, y - 12, 32, 4); c.fillRect(x - 10, y - 34, 20, 22); c.strokeRect(x - 10, y - 34, 20, 22); c.fillStyle = hat.band || '#a22'; c.fillRect(x - 10, y - 17, 20, 4); break;
      case 'chef': c.fillStyle = '#fff'; c.fillRect(x - 11, y - 18, 22, 10); c.strokeRect(x - 11, y - 18, 22, 10); for (const d of [-8, 0, 8]) { circle(c, x + d, y - 24, 8, '#fff'); } break;
      case 'bandana': c.fillRect(x - 12, y - 10, 24, 5); c.beginPath(); c.moveTo(x - 12, y - 8); c.lineTo(x - 22, y - 4 + Math.sin(Date.now() / 120) * 2); c.lineTo(x - 20, y); c.closePath(); f(); break;
      case 'kabuto': c.beginPath(); c.arc(x, y - 2, 13, Math.PI, Math.PI * 2); c.lineTo(x + 16, y + 2); c.lineTo(x - 16, y + 2); f(); c.fillStyle = hat.accent || '#ffd35a'; c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x - 14, y - 30); c.lineTo(x - 2, y - 16); c.lineTo(x + 14, y - 30); c.lineTo(x + 2, y - 14); c.fill(); break;
      case 'beanie': c.beginPath(); c.arc(x - 1, y - 3, 12.5, Math.PI, Math.PI * 2); c.lineTo(x + 12, y - 1); c.lineTo(x - 14, y - 1); f(); circle(c, x - 2, y - 16, 4, hat.accent || '#fff'); break;
      case 'cap': c.beginPath(); c.arc(x - 1, y - 3, 12, Math.PI, Math.PI * 2); f(); c.beginPath(); c.moveTo(x + 8, y - 5); c.lineTo(x + 22, y - 3); c.lineTo(x + 8, y - 1); f(); break;
      case 'astronaut': c.globalAlpha = 0.35; circle(c, x + 1, y - 1, 16, '#bff'); c.globalAlpha = 1; c.strokeStyle = '#ddd'; c.lineWidth = 3; c.beginPath(); c.arc(x + 1, y - 1, 16, 0, Math.PI * 2); c.stroke(); break;
      case 'tiara': c.fillStyle = hat.color; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x + i * 6 - 3, y - 9); c.lineTo(x + i * 6, y - 18 + Math.abs(i) * 4); c.lineTo(x + i * 6 + 3, y - 9); c.fill(); } break;
      case 'graduate': c.beginPath(); c.moveTo(x - 18, y - 12); c.lineTo(x, y - 20); c.lineTo(x + 18, y - 12); c.lineTo(x, y - 6); c.closePath(); f(); break;
      case 'wig': for (let i = 0; i < 6; i++) circle(c, x - 12 + (i % 3) * 5, y - 10 + Math.floor(i / 3) * 12, 6, hat.color); break;
    }
  },
  ears(c, P, e) {
    const [x, y] = P.head; c.fillStyle = e.color; c.strokeStyle = OUTLINE; c.lineWidth = 1.4;
    for (const d of [-7, 3]) {
      c.beginPath();
      if (e.type === 'cat' || e.type === 'wolf') { c.moveTo(x + d - 5, y - 8); c.lineTo(x + d, y - (e.type === 'wolf' ? 26 : 22)); c.lineTo(x + d + 5, y - 9); }
      else if (e.type === 'bunny') { c.ellipse(x + d, y - 24, 3.5, 12, d * 0.02, 0, Math.PI * 2); }
      else if (e.type === 'elf') { c.moveTo(x + 2, y - 2); c.lineTo(x - 12, y - 12); c.lineTo(x - 4, y + 2); }
      else if (e.type === 'round') { c.arc(x + d, y - 12, 5, 0, Math.PI * 2); }
      c.closePath(); c.fill(); c.stroke();
      if (e.type === 'elf') break;
    }
  },
  animalHead(c, P, a, t) {
    const [x, y] = P.head; const col = a.color, dark = shadeHex(col, -0.3);
    c.strokeStyle = OUTLINE; c.lineWidth = 1.8;
    if (a.type === 'wolf' || a.type === 'lion') {
      if (a.type === 'lion') { c.fillStyle = a.mane || '#8a4a1a'; c.beginPath(); for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2; c.lineTo(x - 2 + Math.cos(an) * (i % 2 ? 16 : 22), y + Math.sin(an) * (i % 2 ? 16 : 22)); } c.closePath(); c.fill(); c.stroke(); }
      circle(c, x, y, 11, col); c.beginPath(); c.arc(x, y, 11, 0, Math.PI * 2); c.stroke();
      c.fillStyle = col; c.beginPath(); c.moveTo(x + 4, y - 4); c.lineTo(x + 20, y + 1); c.lineTo(x + 18, y + 6); c.lineTo(x + 4, y + 8); c.closePath(); c.fill(); c.stroke();
      circle(c, x + 19, y + 2, 2.5, '#111');
      if (a.type === 'wolf') { c.fillStyle = dark; for (const d of [-6, 2]) { c.beginPath(); c.moveTo(x + d - 4, y - 7); c.lineTo(x + d, y - 22); c.lineTo(x + d + 4, y - 8); c.fill(); } }
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 10, y + 6); c.lineTo(x + 12, y + 11); c.lineTo(x + 14, y + 6); c.fill();
      glowCircle(c, x + 7, y - 3, 5, a.eye || 'rgba(255,220,60,0.9)'); circle(c, x + 7, y - 3, 1.6, '#111');
    } else if (a.type === 'dino') {
      c.fillStyle = col; c.beginPath(); c.moveTo(x - 10, y + 4); c.quadraticCurveTo(x - 8, y - 14, x + 8, y - 10); c.lineTo(x + 26, y - 4); c.lineTo(x + 26, y + 4); c.lineTo(x + 8, y + 6); c.lineTo(x + 24, y + 10); c.lineTo(x + 6, y + 14); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x + 10 + i * 4, y + 4); c.lineTo(x + 12 + i * 4, y + 8); c.lineTo(x + 14 + i * 4, y + 4); c.fill(); }
      circle(c, x + 6, y - 5, 2.5, '#ff0'); circle(c, x + 6, y - 5, 1, '#000');
      c.fillStyle = dark; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x - 8 + i * 5, y - 10 + i); c.lineTo(x - 12 + i * 5, y - 18); c.lineTo(x - 4 + i * 5, y - 11 + i); c.fill(); }
    } else if (a.type === 'roo') {
      circle(c, x, y, 10, col); c.beginPath(); c.arc(x, y, 10, 0, Math.PI * 2); c.stroke();
      c.fillStyle = col; c.beginPath(); c.ellipse(x + 11, y + 3, 9, 6, 0.2, 0, Math.PI * 2); c.fill(); c.stroke(); circle(c, x + 18, y + 2, 2, '#222');
      for (const d of [-4, 2]) { c.beginPath(); c.ellipse(x + d, y - 16, 3.5, 10, -0.2, 0, Math.PI * 2); c.fill(); c.stroke(); }
      circle(c, x + 6, y - 3, 1.8, '#111');
    } else if (a.type === 'robot') {
      c.fillStyle = col; roundRect(c, x - 11, y - 12, 23, 22, 4); c.fill(); c.stroke();
      c.fillStyle = '#111'; c.fillRect(x - 2, y - 6, 14, 6);
      c.globalCompositeOperation = 'lighter'; glowCircle(c, x + 6, y - 3, 8, a.eye || 'rgba(255,40,40,0.9)'); c.globalCompositeOperation = 'source-over';
      c.strokeStyle = dark; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 4, y - 12); c.lineTo(x - 6, y - 20); c.stroke(); circle(c, x - 6, y - 21, 2.5, a.eye ? '#f44' : '#f44');
    } else if (a.type === 'skull') {
      circle(c, x, y - 1, 11, '#eee8d8'); c.beginPath(); c.arc(x, y - 1, 11, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#eee8d8'; c.fillRect(x - 2, y + 6, 12, 7); c.strokeRect(x - 2, y + 6, 12, 7);
      circle(c, x + 2, y - 2, 3.5, '#111'); circle(c, x + 9, y - 2, 3, '#111');
      c.globalCompositeOperation = 'lighter'; glowCircle(c, x + 2, y - 2, 5, a.eye || 'rgba(120,255,160,0.9)'); c.globalCompositeOperation = 'source-over';
      c.strokeStyle = '#555'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x + i * 4, y + 6); c.lineTo(x + i * 4, y + 13); c.stroke(); }
    } else if (a.type === 'bug') {
      circle(c, x, y, 11, col); c.beginPath(); c.arc(x, y, 11, 0, Math.PI * 2); c.stroke();
      for (const [ex, ey, r] of [[5, -4, 3], [10, -3, 2.5], [6, 2, 2], [11, 3, 1.6]]) { circle(c, x + ex, y + ey, r, '#c01010'); }
      c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 8, y + 8); c.lineTo(x + 12, y + 14); c.moveTo(x + 4, y + 9); c.lineTo(x + 4, y + 15); c.stroke();
    } else if (a.type === 'squid') {
      c.fillStyle = col; c.beginPath(); c.ellipse(x - 2, y - 6, 12, 16, -0.3, 0, Math.PI * 2); c.fill(); c.stroke();
      for (let i = 0; i < 5; i++) { c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(x + i * 3 - 4, y + 6); c.quadraticCurveTo(x + i * 4 - 2 + Math.sin(t * 4 + i) * 4, y + 16, x + i * 3 - 2, y + 22); c.stroke(); }
      glowCircle(c, x + 6, y - 4, 6, 'rgba(120,255,200,0.9)');
    }
  },
  mask(c, P, m) {
    const [x, y] = P.head; c.fillStyle = m.color;
    if (m.type === 'visor') c.fillRect(x - 2, y - 5, 14, 5);
    else if (m.type === 'band') { c.beginPath(); c.moveTo(x - 2, y - 4); c.lineTo(x + 13, y - 5); c.lineTo(x + 12, y + 1); c.lineTo(x, y + 1); c.fill(); }
    else if (m.type === 'half') { c.beginPath(); c.moveTo(x - 4, y + 1); c.lineTo(x + 12, y + 1); c.lineTo(x + 10, y + 10); c.lineTo(x - 2, y + 10); c.fill(); }
    else if (m.type === 'full') { c.beginPath(); c.arc(x + 2, y + 1, 10, 0, Math.PI * 2); c.fill(); }
    else if (m.type === 'oni') { c.beginPath(); c.arc(x + 2, y, 11, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 3, y + 5); c.lineTo(x + 5, y + 9); c.lineTo(x + 7, y + 5); c.moveTo(x + 9, y + 5); c.lineTo(x + 11, y + 9); c.lineTo(x + 12, y + 5); c.fill(); c.fillStyle = '#ffd35a'; circle(c, x + 6, y - 3, 2, '#ffd35a'); }
    else if (m.type === 'goggles') { circle(c, x + 4, y - 3, 4.5, m.color); circle(c, x + 11, y - 3, 3.5, m.color); circle(c, x + 4, y - 3, 2.5, m.lens || '#9ff'); }
    else if (m.type === 'glasses') { c.strokeStyle = m.color; c.lineWidth = 1.5; c.strokeRect(x + 1, y - 5, 6, 4); c.strokeRect(x + 8, y - 5, 5, 4); }
    else if (m.type === 'shades') { c.fillRect(x, y - 5, 14, 4); }
    else if (m.type === 'eyepatch') { circle(c, x + 7, y - 2, 3, m.color); c.strokeStyle = m.color; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 10, y - 6); c.lineTo(x + 10, y - 3); c.stroke(); }
  },
  eyes(c, P, e) {
    const [x, y] = P.head;
    if (e.glow) { c.globalCompositeOperation = 'lighter'; glowCircle(c, x + 7, y - 2, 8, hexA(e.glow, 0.9)); c.globalCompositeOperation = 'source-over'; }
    if (e.color) circle(c, x + 7, y - 2, 2, e.color);
  },
  cape(c, P, cp, t) {
    c.fillStyle = cp.color;
    c.beginPath(); c.moveTo(P.sh[0] - 10, P.sh[1] - 2); c.lineTo(P.sh[0] + 6, P.sh[1] - 2);
    const len = cp.len || 1;
    for (let i = 0; i <= 6; i++) { const x = P.sh[0] + 2 - i * 8 * len, y = lerp(P.sh[1], -4, len) + (i % 2) * 8 + Math.sin(t * 5 + i) * 4; c.lineTo(x - 6, y); }
    c.closePath(); c.fill(); c.strokeStyle = OUTLINE; c.lineWidth = 1.5; c.stroke();
    if (cp.inner) { c.fillStyle = cp.inner; c.globalAlpha = 0.6; c.beginPath(); c.moveTo(P.sh[0] - 6, P.sh[1]); c.lineTo(P.sh[0] - 20 * len, lerp(P.sh[1], -4, len * 0.9)); c.lineTo(P.sh[0] - 4, lerp(P.sh[1], -4, len * 0.7)); c.fill(); c.globalAlpha = 1; }
  },
  scarf(c, P, s, t) {
    c.fillStyle = s.color;
    c.beginPath(); c.moveTo(P.sh[0] - 2, P.sh[1] - 2);
    c.quadraticCurveTo(P.sh[0] - 20, P.sh[1] + Math.sin(t * 9) * 5, P.sh[0] - 36, P.sh[1] + 6 + Math.sin(t * 9 + 1) * 6);
    c.lineTo(P.sh[0] - 32, P.sh[1] + 12 + Math.sin(t * 9 + 1) * 6);
    c.quadraticCurveTo(P.sh[0] - 16, P.sh[1] + 6, P.sh[0] + 2, P.sh[1] + 4); c.fill();
  },
  wings(c, P, w, t) {
    const flap = Math.sin(t * (w.type === 'mech' ? 2 : 6)) * 0.15;
    for (const side of [-1, 1]) {
      c.save(); c.translate(P.sh[0] - 4, P.sh[1] + 2); c.rotate(side * (0.2 + flap) - 0.25);
      const sc = w.scale || 1; c.scale(sc, sc);
      if (w.type === 'light' || w.type === 'feather') {
        c.globalCompositeOperation = w.type === 'light' ? 'lighter' : 'source-over';
        for (let i = 0; i < 5; i++) { c.fillStyle = w.type === 'light' ? hexA(w.color, 0.55 - i * 0.07) : shadeHex(w.color, -i * 0.08); c.beginPath(); c.ellipse(-28 - i * 12, -18 + i * 8, 34 - i * 3, 8, -0.5 + i * 0.22, 0, Math.PI * 2); c.fill(); }
        c.globalCompositeOperation = 'source-over';
      } else if (w.type === 'mech') {
        c.fillStyle = w.color; c.strokeStyle = OUTLINE; c.lineWidth = 2;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-50, -34); c.lineTo(-64, -26); c.lineTo(-20, 6); c.closePath(); c.fill(); c.stroke();
        c.globalCompositeOperation = 'lighter'; glowCircle(c, -60, -28, 12, 'rgba(120,220,255,0.9)'); c.globalCompositeOperation = 'source-over';
      } else if (w.type === 'fairy') {
        c.globalAlpha = 0.55; c.fillStyle = w.color; c.strokeStyle = '#fff'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(-22, -22, 24, 12, -0.7 + Math.sin(t * 20) * 0.2, 0, Math.PI * 2); c.fill(); c.stroke();
        c.beginPath(); c.ellipse(-16, 6, 16, 8, 0.5, 0, Math.PI * 2); c.fill(); c.stroke(); c.globalAlpha = 1;
      } else {
        c.fillStyle = side < 0 ? shadeHex(w.color, -0.3) : w.color;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-30, -44); c.lineTo(-70, -30); c.lineTo(-58, -8); c.lineTo(-74, 4); c.lineTo(-46, 10); c.lineTo(-50, 26); c.lineTo(-16, 16); c.closePath(); c.fill();
      }
      c.restore();
    }
  },
  spiderLegs(c, P, s, t) {
    c.strokeStyle = s.color; c.lineWidth = 3.5; c.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const bx = P.sh[0] - 4, by = lerp(P.sh[1], P.hip[1], 0.3 + i * 0.12), w = Math.sin(t * 6 + i) * 4;
      c.beginPath(); c.moveTo(bx, by); c.lineTo(bx - 26 - i * 4, by - 26 + i * 10 + w); c.lineTo(bx - 34 - i * 6, by + 10 + i * 8 + w); c.stroke();
    }
  },
  tentacles(c, P, s, t) {
    c.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      c.strokeStyle = i % 2 ? s.color : shadeHex(s.color, -0.3); c.lineWidth = 7 - i;
      c.beginPath(); c.moveTo(P.hip[0] - 4, P.hip[1]);
      c.bezierCurveTo(P.hip[0] - 30, P.hip[1] - 20 - i * 10, P.hip[0] - 50 + Math.sin(t * 3 + i) * 10, P.hip[1] + 10 - i * 20, P.hip[0] - 60 + Math.sin(t * 2 + i) * 16, P.hip[1] - 30 - i * 14 + Math.cos(t * 3 + i) * 10);
      c.stroke();
    }
  },
  halo(c, P, h, t) {
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = hexA(h.color, 0.9); c.lineWidth = 3;
    c.beginPath(); c.ellipse(P.head[0], P.head[1] - 20 + Math.sin(t * 2) * 2, 12, 4, 0, 0, Math.PI * 2); c.stroke();
    c.globalCompositeOperation = 'source-over';
  },
  horns(c, P, h) {
    const [hx, hy] = P.head; c.fillStyle = h.color;
    c.beginPath(); c.moveTo(hx - 6, hy - 8); c.quadraticCurveTo(hx - 20, hy - 20, hx - 14, hy - 34); c.quadraticCurveTo(hx - 10, hy - 18, hx - 1, hy - 10); c.fill();
    c.beginPath(); c.moveTo(hx + 4, hy - 9); c.quadraticCurveTo(hx + 8, hy - 24, hx + 20, hy - 30); c.quadraticCurveTo(hx + 12, hy - 18, hx + 10, hy - 6); c.fill();
  },
  pads(c, P, p) {
    c.fillStyle = p.color; c.strokeStyle = OUTLINE; c.lineWidth = 2;
    c.beginPath(); c.ellipse(P.sh[0] + 3, P.sh[1] + 1, 13 * (p.size || 1), 9 * (p.size || 1), -0.2, Math.PI, Math.PI * 2.1); c.fill(); c.stroke();
    if (p.spikes) { c.fillStyle = p.spikes; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(P.sh[0] - 6 + i * 7, P.sh[1] - 6); c.lineTo(P.sh[0] - 4 + i * 7, P.sh[1] - 18); c.lineTo(P.sh[0] - 1 + i * 7, P.sh[1] - 6); c.fill(); } }
  },
  emblem(c, P, e, t) {
    const x = lerp(P.hip[0], P.sh[0], 0.66), y = lerp(P.hip[1], P.sh[1], 0.66);
    c.save(); c.translate(x, y); c.fillStyle = e.color; c.strokeStyle = e.color; c.lineWidth = 2.5;
    switch (e.shape) {
      case 'bolt': c.beginPath(); c.moveTo(2, -9); c.lineTo(-4, 1); c.lineTo(1, 1); c.lineTo(-2, 9); c.lineTo(5, -2); c.lineTo(0, -2); c.closePath(); c.fill(); break;
      case 'star': c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 3.5 : 8, a = i * Math.PI / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); break;
      case 'gear': circle(c, 0, 0, 6, e.color); for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4 + t); c.fillRect(-1.5, -9, 3, 4); c.restore(); } circle(c, 0, 0, 2.5, '#222'); break;
      case 'snow': for (let i = 0; i < 3; i++) { c.save(); c.rotate(i * Math.PI / 3); c.beginPath(); c.moveTo(0, -9); c.lineTo(0, 9); c.stroke(); c.restore(); } break;
      case 'cross': c.fillRect(-2, -9, 4, 18); c.fillRect(-7, -4, 14, 4); break;
      case 'spade': c.beginPath(); c.moveTo(0, -8); c.bezierCurveTo(10, -1, 6, 7, 0, 3); c.bezierCurveTo(-6, 7, -10, -1, 0, -8); c.fill(); c.fillRect(-1, 2, 2, 6); break;
      case 'note': circle(c, -2, 5, 3.5, e.color); c.fillRect(0.5, -8, 2, 13); c.fillRect(0.5, -8, 6, 2.5); break;
      case 'fang': c.beginPath(); c.moveTo(-6, -6); c.lineTo(0, 8); c.lineTo(6, -6); c.fill(); break;
      case 'rock': c.beginPath(); c.moveTo(-7, 4); c.lineTo(-3, -7); c.lineTo(5, -6); c.lineTo(8, 3); c.lineTo(1, 8); c.closePath(); c.fill(); break;
      case 'moon': c.beginPath(); c.arc(0, 0, 7, 0.6, Math.PI * 2 - 0.6); c.arc(3, 0, 5, Math.PI * 2 - 0.9, 0.9, true); c.fill(); break;
      case 'skull': circle(c, 0, -1, 6, e.color); c.fillRect(-3, 3, 6, 4); circle(c, -2, -1, 1.6, '#000'); circle(c, 2, -1, 1.6, '#000'); break;
      case 'eye': c.beginPath(); c.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2); c.fill(); circle(c, 0, 0, 2.5, '#000'); break;
      case 'drop': c.beginPath(); c.moveTo(0, -8); c.quadraticCurveTo(7, 2, 0, 7); c.quadraticCurveTo(-7, 2, 0, -8); c.fill(); break;
      case 'leaf': c.beginPath(); c.ellipse(0, 0, 4, 8, 0.6, 0, Math.PI * 2); c.fill(); break;
      case 'sun': circle(c, 0, 0, 4.5, e.color); for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4); c.fillRect(-1, -9, 2, 3.5); c.restore(); } break;
      case 'dollar': c.font = 'bold 14px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', 0, 0); break;
      case 'scale': c.fillRect(-1, -8, 2, 14); c.fillRect(-8, -6, 16, 2); circle(c, -7, 0, 3, e.color); circle(c, 7, 0, 3, e.color); break;
      case 'ball': circle(c, 0, 0, 7, '#fff'); c.fillStyle = '#111'; c.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; c.lineTo(Math.cos(a) * 3, Math.sin(a) * 3); } c.fill(); break;
      case 'atom': c.strokeStyle = e.color; c.lineWidth = 1.2; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(0, 0, 8, 3, i * Math.PI / 3, 0, Math.PI * 2); c.stroke(); } circle(c, 0, 0, 2, e.color); break;
      default: c.beginPath(); c.moveTo(0, -7); c.lineTo(6, 0); c.lineTo(0, 7); c.lineTo(-6, 0); c.fill();
    }
    c.restore();
  },
  weapon(c, P, w, v) {
    const [hx, hy] = P.fH; const t = v.anim || 0;
    const atk = !['idle', 'walk', 'run', 'backwalk', 'crouch', 'block', 'cblock', 'hurt', 'stun', 'jump', 'fall', 'intro', 'victory', 'kneel', 'taunt'].includes(v.pose);
    c.lineCap = 'round';
    const line = (x1, y1, x2, y2, wdt, col) => { c.strokeStyle = OUTLINE; c.lineWidth = wdt + 2.5; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = col; c.lineWidth = wdt; c.stroke(); };
    const glow = (x, y, r, col) => { c.globalCompositeOperation = 'lighter'; glowCircle(c, x, y, r, hexA(col, 0.8)); c.globalCompositeOperation = 'source-over'; };
    switch (w.type) {
      case 'blade': case 'katana': case 'dual': case 'greatsword': {
        const len = w.type === 'greatsword' ? 70 : w.type === 'katana' ? 54 : 42, ang = atk ? -0.1 : -1.1, wd = w.type === 'greatsword' ? 10 : 5;
        const tx = hx + Math.cos(ang) * len, ty = hy + Math.sin(ang) * len;
        line(hx, hy, tx, ty, wd, w.color);
        c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx, hy); c.lineTo(tx, ty); c.stroke();
        line(hx - Math.cos(ang + 1.57) * 6, hy - Math.sin(ang + 1.57) * 6, hx + Math.cos(ang + 1.57) * 6, hy + Math.sin(ang + 1.57) * 6, 3, w.guard || '#886');
        if (w.glow) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = hexA(w.glow, 0.45); c.lineWidth = 14; c.beginPath(); c.moveTo(hx, hy); c.lineTo(tx, ty); c.stroke(); c.globalCompositeOperation = 'source-over'; }
        if (w.type === 'dual') { const [bx, by] = P.bH; line(bx, by, bx + 30, by - 20, 4, w.color); }
        break;
      }
      case 'staff': case 'spear': case 'trident': case 'scythe': {
        const ang = atk ? 0 : -1.35, len = 80;
        const x0 = hx - Math.cos(ang) * 30, y0 = hy - Math.sin(ang) * 30, tx = hx + Math.cos(ang) * len * 0.6, ty = hy + Math.sin(ang) * len * 0.6;
        line(x0, y0, tx, ty, 4, w.shaft || w.color);
        if (w.type === 'spear') { c.fillStyle = w.tip || '#fff'; c.beginPath(); c.moveTo(tx + Math.cos(ang) * 16, ty + Math.sin(ang) * 16); c.lineTo(tx + Math.cos(ang + 1.6) * 5, ty + Math.sin(ang + 1.6) * 5); c.lineTo(tx + Math.cos(ang - 1.6) * 5, ty + Math.sin(ang - 1.6) * 5); c.fill(); }
        else if (w.type === 'trident') { c.strokeStyle = w.tip || '#ffd35a'; c.lineWidth = 3; for (const o of [-0.35, 0, 0.35]) { c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + Math.cos(ang + o) * 18, ty + Math.sin(ang + o) * 18); c.stroke(); } }
        else if (w.type === 'scythe') { c.fillStyle = w.tip || '#ccd'; c.strokeStyle = OUTLINE; c.lineWidth = 1.5; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.cos(ang - 1.8) * 30 + Math.cos(ang) * 10, ty + Math.sin(ang - 1.8) * 30 + Math.sin(ang) * 10, tx + Math.cos(ang - 2.6) * 44, ty + Math.sin(ang - 2.6) * 44); c.quadraticCurveTo(tx + Math.cos(ang - 1.9) * 20, ty + Math.sin(ang - 1.9) * 20, tx, ty); c.fill(); c.stroke(); if (w.glow) glow(tx, ty, 18, w.glow); }
        else glow(tx, ty, 12 + Math.sin(t * 6) * 2, w.tip || '#99ffff');
        break;
      }
      case 'hammer': case 'axe': {
        const ang = atk ? -0.3 : -1.3, len = 50, tx = hx + Math.cos(ang) * len, ty = hy + Math.sin(ang) * len;
        line(hx - Math.cos(ang) * 8, hy - Math.sin(ang) * 8, tx, ty, 4, w.shaft || '#6b4a2a');
        c.save(); c.translate(tx, ty); c.rotate(ang); c.fillStyle = w.color; c.strokeStyle = OUTLINE; c.lineWidth = 2;
        if (w.type === 'hammer') { roundRect(c, -8, -16, 18, 32, 3); c.fill(); c.stroke(); }
        else { c.beginPath(); c.moveTo(-4, -2); c.quadraticCurveTo(10, -22, 14, -20); c.quadraticCurveTo(8, 0, 14, 18); c.quadraticCurveTo(8, 18, -4, 4); c.fill(); c.stroke(); }
        c.restore(); if (w.glow) glow(tx, ty, 18, w.glow);
        break;
      }
      case 'claws': c.strokeStyle = w.color; c.lineWidth = 2.2; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 15, hy + k * 6 - 2); c.stroke(); } { const [bx, by] = P.bH; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 13, by + k * 5); c.stroke(); } } break;
      case 'gauntlet': circle(c, hx, hy, 9, w.color); c.strokeStyle = OUTLINE; c.lineWidth = 2; c.beginPath(); c.arc(hx, hy, 9, 0, Math.PI * 2); c.stroke(); if (w.glow) glow(hx, hy, 16, w.glow); break;
      case 'gloves': circle(c, hx, hy, 8, w.color); c.strokeStyle = OUTLINE; c.lineWidth = 2; c.beginPath(); c.arc(hx, hy, 8, 0, Math.PI * 2); c.stroke(); circle(c, P.bH[0], P.bH[1], 7, shadeHex(w.color, -0.2)); break;
      case 'cards': c.save(); c.translate(hx, hy); for (let i = -1; i <= 1; i++) { c.save(); c.rotate(i * 0.35 - 0.3); c.fillStyle = '#fff'; c.fillRect(0, -3, 12, 17); c.fillStyle = i ? '#d22' : '#222'; c.fillRect(3, 2, 5, 5); c.restore(); } c.restore(); break;
      case 'wrench': line(hx, hy, hx + 26, hy - 22, 5, w.color); circle(c, hx + 28, hy - 24, 6, w.color); circle(c, hx + 30, hy - 26, 2.5, '#222'); break;
      case 'pistol': case 'pistols': { for (const [px, py, k] of w.type === 'pistols' ? [[hx, hy, 1], [P.bH[0], P.bH[1], 0.9]] : [[hx, hy, 1]]) { c.fillStyle = w.color; c.strokeStyle = OUTLINE; c.lineWidth = 1.5; c.fillRect(px, py - 5 * k, 20 * k, 6 * k); c.strokeRect(px, py - 5 * k, 20 * k, 6 * k); c.fillRect(px, py, 5 * k, 9 * k); } break; }
      case 'cannon': c.save(); c.translate(hx - 6, hy); c.fillStyle = w.color; c.strokeStyle = OUTLINE; c.lineWidth = 2; roundRect(c, -6, -9, 40, 18, 5); c.fill(); c.stroke(); c.fillStyle = '#222'; c.fillRect(30, -6, 6, 12); c.restore(); glow(hx + 32, hy, 8, w.glow || '#88ffff'); break;
      case 'shield': c.save(); c.translate(P.bH[0] + 6, P.bH[1] - 4); c.fillStyle = w.color; c.strokeStyle = OUTLINE; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -24); c.lineTo(14, -18); c.lineTo(12, 10); c.lineTo(0, 24); c.lineTo(-10, 10); c.lineTo(-12, -18); c.closePath(); c.fill(); c.stroke(); c.fillStyle = w.accent || '#ffd35a'; circle(c, 0, 0, 6, w.accent || '#ffd35a'); c.restore(); if (w.sword) line(hx, hy, hx + Math.cos(atk ? -0.1 : -1.1) * 40, hy + Math.sin(atk ? -0.1 : -1.1) * 40, 4, w.sword); break;
      case 'whip': case 'chain': { c.strokeStyle = w.color; c.lineWidth = w.type === 'chain' ? 3 : 2; if (w.type === 'chain') c.setLineDash([4, 3]); c.beginPath(); c.moveTo(hx, hy); const L = atk ? 70 : 30; c.quadraticCurveTo(hx + L * 0.5, hy - 20 + Math.sin(t * 8) * 10, hx + L, hy + (atk ? 0 : 30)); c.stroke(); c.setLineDash([]); if (w.type === 'chain') circle(c, hx + L, hy + (atk ? 0 : 30), 6, '#777'); break; }
      case 'fan': c.save(); c.translate(hx, hy); c.rotate(atk ? -0.2 : -1); c.fillStyle = w.color; c.strokeStyle = OUTLINE; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 22, -0.8, 0.8); c.closePath(); c.fill(); c.stroke(); c.restore(); break;
      case 'book': c.fillStyle = w.color; c.strokeStyle = OUTLINE; c.lineWidth = 1.5; c.fillRect(P.bH[0] - 2, P.bH[1] - 14, 16, 20); c.strokeRect(P.bH[0] - 2, P.bH[1] - 14, 16, 20); c.fillStyle = '#fff'; c.fillRect(P.bH[0] + 1, P.bH[1] - 12, 3, 16); glow(hx, hy, 10, w.glow || '#aa88ff'); break;
      case 'guitar': c.save(); c.translate(hx - 10, hy + 6); c.rotate(-0.6); c.fillStyle = w.color; c.strokeStyle = OUTLINE; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, 0, 12, 9, 0, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#333'; c.fillRect(8, -2, 34, 4); c.fillRect(40, -4, 8, 8); c.restore(); break;
      case 'mic': line(hx, hy, hx + 8, hy - 14, 3, '#333'); circle(c, hx + 10, hy - 17, 4, '#aaa'); break;
      case 'baton': line(hx, hy, hx + (atk ? 30 : 10), hy - (atk ? 10 : 26), 2.5, w.color); break;
      case 'bow': c.strokeStyle = w.color; c.lineWidth = 3; c.beginPath(); c.arc(hx - 4, hy, 28, -1.1, 1.1); c.stroke(); c.strokeStyle = '#eee'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx - 4 + Math.cos(-1.1) * 28, hy + Math.sin(-1.1) * 28); c.lineTo(hx - 4 + Math.cos(1.1) * 28, hy + Math.sin(1.1) * 28); c.stroke(); break;
      case 'orb': glow(hx + 6, hy - 6, 14 + Math.sin(t * 5) * 3, w.color); circle(c, hx + 6, hy - 6, 5, '#fff'); break;
      case 'knives': c.fillStyle = '#ddd'; for (let i = 0; i < 3; i++) { c.save(); c.translate(hx, hy); c.rotate(-0.8 + i * 0.35); c.fillRect(0, -1.5, 16, 3); c.restore(); } break;
      case 'pan': line(hx, hy, hx + 16, hy - 10, 4, '#333'); c.fillStyle = '#333'; c.beginPath(); c.ellipse(hx + 26, hy - 16, 12, 8, -0.5, 0, Math.PI * 2); c.fill(); break;
      case 'ball': circle(c, hx + 8, hy - 4, 8, '#fff'); c.strokeStyle = '#111'; c.lineWidth = 1; c.beginPath(); c.arc(hx + 8, hy - 4, 8, 0, Math.PI * 2); c.stroke(); circle(c, hx + 8, hy - 4, 2.5, '#111'); break;
      case 'gavel': line(hx, hy, hx + 20, hy - 18, 3.5, '#6b4a2a'); c.save(); c.translate(hx + 22, hy - 20); c.rotate(-0.7); c.fillStyle = w.color || '#6b4a2a'; c.fillRect(-10, -5, 20, 10); c.restore(); break;
      case 'cane': line(hx, hy, hx + 4, hy + 40, 3, w.color); c.strokeStyle = w.color; c.lineWidth = 3; c.beginPath(); c.arc(hx - 2, hy, 6, 0, Math.PI, true); c.stroke(); circle(c, hx - 8, hy, 3, '#ffd35a'); break;
      case 'yoyo': c.strokeStyle = '#fff'; c.lineWidth = 1; const yl = atk ? 70 : 24; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + (atk ? yl : 0), hy + (atk ? 0 : yl)); c.stroke(); circle(c, hx + (atk ? yl : 0), hy + (atk ? 0 : yl), 6, w.color); break;
    }
  },
};

// ---------- special bodies ----------
function drawGolem(c, v, m) {
  const t = v.anim || 0, br = Math.sin(t * 2) * 1.5;
  const atk = !['idle', 'walk', 'run', 'block', 'hurt', 'crouch'].includes(v.pose);
  const rock = m.rock || '#6b5a48', dark = shadeHex(rock, -0.35), glowC = m.glowColor || '#ff9a3a';
  const blob = (pts, col) => { c.fillStyle = col; c.strokeStyle = OUTLINE; c.lineWidth = 2.5; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.stroke(); };
  blob([[-26, 0], [-30, -30], [-12, -34], [-8, 0]], dark);
  blob([[8, 0], [10, -34], [28, -30], [30, 0]], rock);
  blob([[-34, -30], [-40, -80 + br], [-18, -104 + br], [22, -104 + br], [38, -78 + br], [30, -30]], rock);
  blob([[0, -104 + br], [-10, -126 + br], [10, -136 + br], [26, -120 + br], [20, -102 + br]], rock);
  c.globalCompositeOperation = 'lighter';
  glowCircle(c, 14, -120 + br, 10, hexA(glowC, 1)); glowCircle(c, 4, -64 + br, 26, hexA(glowC, 0.5));
  c.strokeStyle = hexA(glowC, 0.9); c.lineWidth = 2;
  c.beginPath(); c.moveTo(-20, -90); c.lineTo(-4, -70); c.lineTo(-12, -46); c.moveTo(16, -92); c.lineTo(8, -66); c.lineTo(22, -44); c.stroke();
  c.globalCompositeOperation = 'source-over';
  const fh = atk ? [76, -70] : [46, -16];
  blob([[20, -96], [fh[0] - 6, fh[1] - 14], [fh[0] + 10, fh[1] + 2], [28, -70]], rock);
  blob([[fh[0] - 10, fh[1] - 14], [fh[0] + 14, fh[1] - 16], [fh[0] + 16, fh[1] + 10], [fh[0] - 8, fh[1] + 12]], dark);
}
function drawMech(c, v, m) {
  const t = v.anim || 0, br = Math.sin(t * 3) * 1;
  const run = v.pose === 'run' || v.pose === 'walk' ? Math.sin(t * 9) * 6 : 0;
  const atk = !['idle', 'walk', 'run', 'block', 'hurt', 'crouch', 'jump', 'fall'].includes(v.pose);
  const metal = m.metal || '#7a8594', dark = shadeHex(metal, -0.4), acc = m.accent || '#ffb020';
  c.strokeStyle = OUTLINE; c.lineWidth = 2.5;
  const box = (x, y, w, h, col, r = 4) => { c.fillStyle = col; roundRect(c, x, y, w, h, r); c.fill(); c.stroke(); };
  box(-28 + run, -40, 18, 40, dark); box(10 - run, -40, 18, 40, metal);
  box(-32 + run, -6, 26, 8, dark, 2); box(6 - run, -6, 26, 8, dark, 2);
  box(-38, -104 + br, 76, 66, metal, 10);
  c.fillStyle = acc; c.fillRect(-38, -60 + br, 76, 6);
  box(-2, -100 + br, 30, 26, '#123', 8);
  circle(c, 12, -86 + br, 7, m.skin || '#e0b090');
  c.fillStyle = 'rgba(120,220,255,0.35)'; roundRect(c, -2, -100 + br, 30, 26, 8); c.fill();
  box(-44, -116 + br, 26, 16, dark); for (let i = 0; i < 3; i++) circle(c, -38 + i * 7, -108 + br, 2.5, acc);
  const ax = atk ? 70 : 44, ay = atk ? -80 : -52;
  box(26, -96 + br, 16, 20, dark);
  c.save(); c.translate(34, -86 + br); c.rotate(Math.atan2(ay + 86, ax - 34)); box(0, -8, 44, 16, metal); box(40, -6, 10, 12, dark, 2); c.restore();
  if (atk) { c.globalCompositeOperation = 'lighter'; glowCircle(c, ax + 14, ay + 2, 14, 'rgba(120,220,255,0.9)'); c.globalCompositeOperation = 'source-over'; }
  c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -20, 16 + Math.sin(t * 20) * 3, hexA(acc, 0.5)); c.globalCompositeOperation = 'source-over';
}
function drawGhostBody(c, v, m, inner) {
  // humanoid upper body that fades into a wispy tail
  c.save(); c.translate(0, -10 - Math.sin((v.anim || 0) * 2.5) * 5);
  c.globalAlpha *= 0.88; inner(); c.restore();
  const t = v.anim || 0;
  c.fillStyle = hexA(m.top, 0.5);
  c.beginPath(); c.moveTo(-14, -60); c.lineTo(14, -60);
  for (let i = 0; i <= 6; i++) c.lineTo(14 - i * 5, -10 + (i % 2) * 12 + Math.sin(t * 6 + i) * 5);
  c.closePath(); c.fill();
}

// ---------- palette variants (alt colors) ----------
function hueShift(hex, deg) {
  if (typeof hex !== 'string' || hex[0] !== '#' || hex.length !== 7) return hex;
  let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
  h = (h + deg / 360) % 1; if (h < 0) h += 1;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = tt => { if (tt < 0) tt += 1; if (tt > 1) tt -= 1; return tt < 1 / 6 ? p + (q - p) * 6 * tt : tt < 1 / 2 ? q : tt < 2 / 3 ? p + (q - p) * (2 / 3 - tt) * 6 : p; };
  const to = x => Math.round(clamp(x, 0, 1) * 255).toString(16).padStart(2, '0');
  return '#' + to(f(h + 1 / 3)) + to(f(h)) + to(f(h - 1 / 3));
}
const SKIN_KEYS = new Set(['skin']);
function shiftModel(m, deg) {
  if (!deg) return m;
  const out = Array.isArray(m) ? [] : {};
  for (const [k, v] of Object.entries(m)) {
    if (SKIN_KEYS.has(k)) out[k] = v;
    else if (typeof v === 'string') out[k] = hueShift(v, deg);
    else if (v && typeof v === 'object' && typeof v !== 'function') out[k] = shiftModel(v, deg);
    else out[k] = v;
  }
  return out;
}

// Build a draw() from a model description. formModel overrides apply when transformed.
function makeModelDraw(base, formModel) {
  const cache = {};
  const get = (tr, alt) => { const k = (tr ? 1 : 0) + ':' + (alt || 0); if (!cache[k]) cache[k] = shiftModel(tr && formModel ? Object.assign({}, base, formModel) : base, alt || 0); return cache[k]; };
  return function (c, v) {
    const m = get(v.transformed, v.alt);
    const t = v.anim || 0;
    if (m.body) { m.body(c, v, m); return; }
    const inner = () => {
      if (m.aura) glowCircle(c, 0, -60, 95 * (m.auraSize || 1), hexA(m.aura, 0.3 + Math.sin(t * 5) * 0.05), hexA(m.aura, 0));
      drawHumanoid(c, v, m, {
        back(c, P) {
          if (m.cape) Acc.cape(c, P, m.cape, t);
          if (m.wings) Acc.wings(c, P, m.wings, t);
          if (m.spiderLegs) Acc.spiderLegs(c, P, m.spiderLegs, t);
          if (m.tentacles) Acc.tentacles(c, P, m.tentacles, t);
          if (m.scarf) Acc.scarf(c, P, m.scarf, t);
          if (m.tail) { c.strokeStyle = m.tail; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(P.hip[0] - 6, P.hip[1] + 4); c.quadraticCurveTo(P.hip[0] - 40, P.hip[1] + 30, P.hip[0] - 46 + Math.sin(t * 4) * 6, P.hip[1] - 4); c.stroke(); }
          if (m.bigTail) { c.fillStyle = m.bigTail; c.strokeStyle = OUTLINE; c.lineWidth = 1.5; c.beginPath(); c.moveTo(P.hip[0] - 4, P.hip[1] - 6); c.quadraticCurveTo(P.hip[0] - 40, P.hip[1] + 20, P.hip[0] - 60, -2); c.lineTo(P.hip[0] - 2, P.hip[1] + 8); c.fill(); c.stroke(); }
          if (m.hair && ['long', 'ponytail', 'twintails'].includes(m.hair.type)) Acc.hair(c, P, m.hair, t);
        },
        chest(c, P) {
          if (m.stripes) { c.strokeStyle = m.stripes; c.lineWidth = 3; c.beginPath(); c.moveTo(lerp(P.hip[0], P.sh[0], 0.1) - 6, lerp(P.hip[1], P.sh[1], 0.1)); c.lineTo(lerp(P.hip[0], P.sh[0], 0.9) + 6, lerp(P.hip[1], P.sh[1], 0.9)); c.stroke(); }
          if (m.plate) { c.fillStyle = m.plate; c.strokeStyle = OUTLINE; c.lineWidth = 1.5; const x = lerp(P.hip[0], P.sh[0], 0.7), y = lerp(P.hip[1], P.sh[1], 0.7); roundRect(c, x - 10, y - 9, 20, 16, 4); c.fill(); c.stroke(); }
          if (m.emblem) Acc.emblem(c, P, m.emblem, t);
          if (m.core) { const x = lerp(P.hip[0], P.sh[0], 0.72), y = lerp(P.hip[1], P.sh[1], 0.72); c.globalCompositeOperation = 'lighter'; glowCircle(c, x, y, 14, hexA(m.core, 0.9)); c.globalCompositeOperation = 'source-over'; circle(c, x, y, 4, '#fff'); }
        },
        head(c, P) {
          if (m.animal) { Acc.animalHead(c, P, m.animal, t); }
          else {
            if (m.hair && !['long', 'ponytail', 'twintails'].includes(m.hair.type)) Acc.hair(c, P, m.hair, t);
            if (m.hair && ['long', 'ponytail', 'twintails'].includes(m.hair.type)) { c.fillStyle = m.hair.color; c.beginPath(); c.arc(P.head[0] - 1, P.head[1] - 2, 12, Math.PI * 0.95, Math.PI * 2.05); c.fill(); }
            if (m.ears) Acc.ears(c, P, m.ears);
            if (m.mask) Acc.mask(c, P, m.mask);
            Acc.eyes(c, P, m.eyes || {});
          }
          if (m.horns) Acc.horns(c, P, m.horns);
          if (m.hat) Acc.hat(c, P, m.hat);
          if (m.halo) Acc.halo(c, P, m.halo, t);
        },
        pads(c, P) { if (m.pads) Acc.pads(c, P, m.pads); },
        front(c, P, v) { if (m.weapon) Acc.weapon(c, P, m.weapon, v); },
      });
    };
    c.save();
    if (m.float) c.translate(0, -8 - Math.sin(t * 2.5) * 4);
    if (m.alpha !== undefined) c.globalAlpha *= m.alpha;
    if (m.ghost) drawGhostBody(c, v, m, inner); else inner();
    c.restore();
  };
}

// ============================================================
//  ANIME PORTRAITS — every fighter's icon is a stylized face
// ============================================================
// Face config is derived from the fighter's model, with optional def.face overrides:
// { skin, hair:{type,color}, eyes (iris color), brow, expr ('smirk'|'grin'|'calm'|'angry'|'cold'|'shout'),
//   mask, horns, halo, ears, hat, marks:[{type:'scar'|'paint'|'tear'|'stripes', color}], animal, visor, glow }
function faceConfig(def, form) {
  const m = (form && def.form && def.form.model && !def.form.model.body ? Object.assign({}, def.model || {}, def.form.model) : def.model) || {};
  const f = Object.assign({
    skin: m.skin || '#f0c8a0', hair: m.hair || { type: 'short', color: '#222' },
    eyes: (m.eyes && (m.eyes.glow || m.eyes.color)) || def.color, top: m.top || def.color2 || '#333',
    mask: m.mask, horns: m.horns, halo: m.halo, ears: m.ears, hat: m.hat, animal: m.animal, expr: 'smirk',
  }, def.face || {}, form && def.face && def.face.form ? def.face.form : {});
  return f;
}
const PortraitCache = {};
function portrait(def, size = 96, opts = {}) {
  const k = def.id + ':' + size + ':' + (opts.form ? 1 : 0) + ':' + (opts.alt || 0) + ':' + (opts.expr || '');
  if (PortraitCache[k]) return PortraitCache[k];
  const cv = document.createElement('canvas'); cv.width = size; cv.height = size;
  const c = cv.getContext('2d');
  let F = faceConfig(def, opts.form);
  if (opts.alt) F = shiftModel(F, [0, 150, 240, 60][opts.alt % 4]);
  if (opts.expr) F.expr = opts.expr;
  c.scale(size / 100, size / 100);
  drawAnimeFace(c, F, def);
  PortraitCache[k] = cv;
  return cv;
}
function drawAnimeFace(c, F, def) {
  // background
  const bg = c.createLinearGradient(0, 0, 100, 100);
  bg.addColorStop(0, hexA(def.color2 && def.color2.length === 7 ? def.color2 : '#223344', 1)); bg.addColorStop(1, '#0a0812');
  c.fillStyle = bg; c.fillRect(0, 0, 100, 100);
  c.globalCompositeOperation = 'lighter'; glowCircle(c, 60, 45, 60, hexA(def.color, 0.35), hexA(def.color, 0)); c.globalCompositeOperation = 'source-over';
  // speed streaks
  c.strokeStyle = hexA(def.color, 0.18); c.lineWidth = 2;
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 12 + i * 16); c.lineTo(30 + (i % 3) * 8, 6 + i * 16); c.stroke(); }
  const skin = F.skin, dk = shadeHex(skin, -0.28), ink = '#140c18';
  const hair = F.hair || { type: 'short', color: '#222' }, hc = hair.color, hdk = shadeHex(hc, -0.35);
  // shoulders / collar
  c.fillStyle = F.top; c.beginPath(); c.moveTo(14, 100); c.quadraticCurveTo(22, 78, 50, 76); c.quadraticCurveTo(78, 78, 86, 100); c.fill();
  c.strokeStyle = ink; c.lineWidth = 1.6; c.stroke();
  c.fillStyle = shadeHex(F.top, 0.2); c.beginPath(); c.moveTo(38, 78); c.lineTo(50, 90); c.lineTo(62, 78); c.fill();
  // back hair
  c.fillStyle = hdk;
  if (['long', 'ponytail', 'twintails', 'wild', 'afro', 'bob'].includes(hair.type)) {
    c.beginPath();
    if (hair.type === 'afro') c.arc(50, 34, 36, 0, Math.PI * 2);
    else if (hair.type === 'bob') { c.moveTo(20, 30); c.quadraticCurveTo(18, 70, 30, 70); c.lineTo(70, 70); c.quadraticCurveTo(82, 70, 80, 30); c.closePath(); }
    else { c.moveTo(20, 28); c.quadraticCurveTo(10, 70, 18, 96); c.lineTo(82, 96); c.quadraticCurveTo(90, 70, 80, 28); c.closePath(); }
    c.fill();
    if (hair.type === 'twintails') for (const d of [-1, 1]) { c.beginPath(); c.moveTo(50 + d * 30, 26); c.quadraticCurveTo(50 + d * 50, 50, 50 + d * 40, 96); c.lineTo(50 + d * 30, 96); c.quadraticCurveTo(50 + d * 38, 60, 50 + d * 26, 32); c.fill(); }
  }
  // neck
  c.fillStyle = dk; c.fillRect(42, 62, 16, 16);
  if (F.animal) { drawAnimeAnimal(c, F, def, ink); return drawFaceExtras(c, F, def, ink); }
  // ears (human)
  c.fillStyle = skin; c.beginPath(); c.ellipse(26, 46, 4, 7, -0.2, 0, Math.PI * 2); c.ellipse(74, 46, 4, 7, 0.2, 0, Math.PI * 2); c.fill();
  // face: anime V-jaw
  const fg = c.createLinearGradient(30, 20, 70, 80); fg.addColorStop(0, shadeHex(skin, 0.12)); fg.addColorStop(1, skin);
  c.fillStyle = fg; c.beginPath();
  c.moveTo(26, 34); c.quadraticCurveTo(26, 14, 50, 14); c.quadraticCurveTo(74, 14, 74, 34);
  c.quadraticCurveTo(74, 52, 66, 62); c.quadraticCurveTo(56, 74, 50, 74); c.quadraticCurveTo(44, 74, 34, 62); c.quadraticCurveTo(26, 52, 26, 34);
  c.fill(); c.strokeStyle = ink; c.lineWidth = 1.8; c.stroke();
  // cheek shade
  c.fillStyle = 'rgba(0,0,0,0.08)'; c.beginPath(); c.moveTo(66, 40); c.quadraticCurveTo(70, 56, 58, 70); c.lineTo(66, 58); c.fill();
  // marks
  for (const mk of F.marks || []) {
    c.strokeStyle = mk.color || '#a33'; c.lineWidth = 2;
    if (mk.type === 'scar') { c.beginPath(); c.moveTo(60, 36); c.lineTo(66, 52); c.stroke(); c.beginPath(); c.moveTo(59, 42); c.lineTo(65, 40); c.stroke(); }
    if (mk.type === 'paint') { c.fillStyle = mk.color; c.fillRect(30, 50, 10, 3); c.fillRect(60, 50, 10, 3); }
    if (mk.type === 'stripes') { c.fillStyle = mk.color; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) c.fillRect(50 + s * 18 - (s < 0 ? 8 : 0), 50 + i * 4, 8, 1.8); }
    if (mk.type === 'tear') { c.fillStyle = mk.color; c.beginPath(); c.moveTo(38, 50); c.lineTo(36, 58); c.lineTo(40, 58); c.fill(); }
    if (mk.type === 'star') { c.fillStyle = mk.color; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 2 : 5, a = i * Math.PI / 5 - Math.PI / 2; c.lineTo(64 + Math.cos(a) * r, 52 + Math.sin(a) * r); } c.fill(); }
    if (mk.type === 'cracks') { c.strokeStyle = mk.color; c.lineWidth = 1.4; c.beginPath(); c.moveTo(34, 30); c.lineTo(40, 40); c.lineTo(36, 48); c.moveTo(62, 60); c.lineTo(68, 50); c.stroke(); }
  }
  // eyes
  const expr = F.expr || 'smirk';
  const eyeY = 42, open = expr === 'cold' ? 0.6 : expr === 'angry' ? 0.75 : expr === 'shout' ? 1.1 : 0.9;
  const visorOn = F.mask && (F.mask.type === 'visor' || F.mask.type === 'shades' || F.mask.type === 'full' || F.mask.type === 'oni');
  if (!visorOn) for (const [ex, dir] of [[39, -1], [61, 1]]) {
    // sclera
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, eyeY, 8, 7 * open, 0, 0, Math.PI * 2); c.fill();
    // iris (big anime iris)
    const ig = c.createLinearGradient(ex, eyeY - 7, ex, eyeY + 7);
    ig.addColorStop(0, shadeHex(F.eyes, -0.45)); ig.addColorStop(1, shadeHex(F.eyes, 0.25));
    c.save(); c.beginPath(); c.ellipse(ex, eyeY, 8, 7 * open, 0, 0, Math.PI * 2); c.clip();
    c.fillStyle = ig; c.beginPath(); c.ellipse(ex + dir * 0.5, eyeY + 0.5, 5.2, 6.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#0a0610'; c.beginPath(); c.ellipse(ex + dir * 0.5, eyeY + 0.5, 2.2, 3.4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; circle(c, ex - 1.6, eyeY - 2.4, 1.8, '#fff'); circle(c, ex + 1.8, eyeY + 2.5, 0.9, '#fff');
    c.restore();
    // lash line
    c.strokeStyle = ink; c.lineWidth = 2.4; c.beginPath(); c.ellipse(ex, eyeY, 8.4, 7 * open, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
    c.lineWidth = 1.8; c.beginPath(); c.moveTo(ex + dir * 8, eyeY - 2); c.lineTo(ex + dir * 11, eyeY - 4); c.stroke();
    if (F.glow) { c.globalCompositeOperation = 'lighter'; glowCircle(c, ex, eyeY, 10, hexA(F.glow, 0.6)); c.globalCompositeOperation = 'source-over'; }
    // brows
    c.strokeStyle = hdk; c.lineWidth = 2.6; c.beginPath();
    const tilt = expr === 'angry' || expr === 'shout' ? 5 : expr === 'cold' ? 2 : expr === 'calm' ? -1 : 1;
    c.moveTo(ex - dir * 8, eyeY - 11 - (dir < 0 ? -tilt : -tilt) * 0 - (tilt > 0 ? 0 : 1)); c.lineTo(ex + dir * 8, eyeY - 11 + (dir < 0 ? tilt : tilt) * 0 - tilt + (dir > 0 ? 0 : 0));
    c.stroke();
  }
  // nose
  c.strokeStyle = dk; c.lineWidth = 1.4; c.beginPath(); c.moveTo(51, 51); c.lineTo(53, 55); c.lineTo(50, 56); c.stroke();
  // mouth
  c.strokeStyle = ink; c.lineWidth = 1.8;
  if (expr === 'grin' || expr === 'shout') {
    c.fillStyle = '#3a0a10'; c.beginPath(); c.moveTo(42, 62); c.quadraticCurveTo(50, expr === 'shout' ? 72 : 68, 58, 62); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.fillRect(44, 62, 12, 2);
  } else if (expr === 'cold' || expr === 'calm') { c.beginPath(); c.moveTo(45, 63); c.lineTo(55, 63); c.stroke(); }
  else if (expr === 'angry') { c.beginPath(); c.moveTo(44, 64); c.quadraticCurveTo(50, 61, 56, 64); c.stroke(); }
  else { c.beginPath(); c.moveTo(44, 63); c.quadraticCurveTo(52, 65, 57, 61); c.stroke(); }
  drawAnimeHair(c, hair, hc, hdk, ink);
  drawFaceExtras(c, F, def, ink);
}
function drawAnimeHair(c, hair, hc, hdk, ink) {
  const g = c.createLinearGradient(0, 4, 0, 50); g.addColorStop(0, shadeHex(hc, 0.25)); g.addColorStop(1, hc);
  c.fillStyle = g; c.strokeStyle = ink; c.lineWidth = 1.6;
  const fill = () => { c.fill(); c.stroke(); };
  const bangs = (n, len, jag) => { c.beginPath(); c.moveTo(22, 40); c.quadraticCurveTo(20, 8, 50, 6); c.quadraticCurveTo(80, 8, 78, 40); for (let i = 0; i <= n; i++) { const x = 78 - i * (56 / n); c.lineTo(x + (i % 2 ? 0 : jag), 24 + (i % 2 ? len : len * 0.4)); } c.closePath(); fill(); };
  switch (hair.type) {
    case 'spiky': c.beginPath(); c.moveTo(22, 42); for (const [x, y] of [[12, 28], [22, 22], [8, 8], [30, 14], [30, -2], [44, 10], [52, -6], [58, 10], [74, -2], [70, 16], [92, 12], [78, 26], [88, 38], [76, 34], [68, 22], [64, 34], [54, 20], [46, 34], [40, 22], [32, 36]]) c.lineTo(x, y); c.closePath(); fill(); break;
    case 'wild': c.beginPath(); c.moveTo(20, 44); for (let i = 0; i <= 12; i++) { const a = Math.PI * (1 + i / 12); const r = i % 2 ? 30 : 44; c.lineTo(50 + Math.cos(a) * r, 36 + Math.sin(a) * r); } c.lineTo(80, 44); for (let i = 0; i <= 6; i++) c.lineTo(78 - i * 9, 28 + (i % 2) * 10); c.closePath(); fill(); break;
    case 'mohawk': c.beginPath(); c.moveTo(38, 20); for (let i = 0; i < 6; i++) { c.lineTo(38 + i * 5, 0 - (i % 2) * 6); c.lineTo(41 + i * 5, 16); } c.closePath(); fill(); c.fillStyle = hdk; c.globalAlpha = 0.5; c.beginPath(); c.arc(50, 34, 24, Math.PI * 1.1, Math.PI * 1.9); c.fill(); c.globalAlpha = 1; break;
    case 'buzz': c.globalAlpha = 0.85; c.beginPath(); c.arc(50, 34, 25, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(72, 26); c.lineTo(28, 26); c.closePath(); c.fill(); c.globalAlpha = 1; break;
    case 'bald': c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(42, 20, 8, 4, -0.4, 0, Math.PI * 2); c.fill(); break;
    case 'slick': c.beginPath(); c.moveTo(24, 38); c.quadraticCurveTo(22, 6, 54, 8); c.quadraticCurveTo(84, 10, 78, 36); c.quadraticCurveTo(70, 18, 50, 20); c.quadraticCurveTo(34, 22, 24, 38); fill(); break;
    case 'afro': c.beginPath(); c.arc(50, 22, 30, Math.PI * 0.9, Math.PI * 2.1); c.lineTo(76, 30); c.lineTo(24, 30); c.closePath(); fill(); break;
    case 'topknot': bangs(6, 10, 2); circle(c, 50, 4, 8, hc); c.beginPath(); c.arc(50, 4, 8, 0, Math.PI * 2); c.stroke(); break;
    case 'bun': bangs(7, 12, 2); circle(c, 30, 10, 9, hc); c.beginPath(); c.arc(30, 10, 9, 0, Math.PI * 2); c.stroke(); break;
    case 'flame': c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? hexA(hc, 0.9) : 'rgba(255,220,120,0.9)'; c.beginPath(); c.moveTo(24 + i * 6, 30); c.quadraticCurveTo(20 + i * 7, 4, 30 + i * 6 + (i % 3) * 4, -8 + (i % 2) * 10); c.lineTo(32 + i * 6, 30); c.fill(); } c.globalCompositeOperation = 'source-over'; break;
    case 'hood': c.fillStyle = hc; c.beginPath(); c.moveTo(12, 100); c.quadraticCurveTo(8, 10, 50, 4); c.quadraticCurveTo(92, 10, 88, 100); c.lineTo(76, 100); c.quadraticCurveTo(80, 30, 50, 22); c.quadraticCurveTo(20, 30, 24, 100); c.closePath(); fill(); break;
    case 'helmet': c.beginPath(); c.moveTo(20, 50); c.quadraticCurveTo(18, 4, 50, 4); c.quadraticCurveTo(82, 4, 80, 50); c.lineTo(72, 50); c.lineTo(72, 30); c.lineTo(28, 30); c.lineTo(28, 50); c.closePath(); fill(); c.fillStyle = hair.visor || '#7df'; c.globalAlpha = 0.85; c.fillRect(28, 34, 44, 12); c.globalAlpha = 1; c.strokeRect(28, 34, 44, 12); break;
    case 'crown': bangs(8, 10, 3); c.fillStyle = hair.accent || '#bff'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(30 + i * 10, 12); c.lineTo(34 + i * 10, -4 - (i === 2 ? 8 : 0)); c.lineTo(38 + i * 10, 12); c.fill(); c.stroke(); } break;
    case 'jester': bangs(6, 8, 2); for (const [d, col] of [[-1, hc], [1, hair.accent || '#222']]) { c.fillStyle = col; c.beginPath(); c.moveTo(50, 10); c.quadraticCurveTo(50 + d * 30, -10, 50 + d * 46, 14); c.lineTo(50 + d * 20, 18); c.closePath(); fill(); circle(c, 50 + d * 46, 14, 4, '#ffd35a'); } break;
    case 'long': case 'ponytail': case 'twintails': case 'bob': bangs(8, 14, 3); break;
    default: bangs(7, 10, 2);
  }
}
function drawAnimeAnimal(c, F, def, ink) {
  const a = F.animal, col = a.color, dark = shadeHex(col, -0.3);
  c.strokeStyle = ink; c.lineWidth = 1.8;
  if (a.type === 'lion') { c.fillStyle = a.mane || '#8a4a1a'; c.beginPath(); for (let i = 0; i < 20; i++) { const an = i / 20 * Math.PI * 2; c.lineTo(50 + Math.cos(an) * (i % 2 ? 32 : 42), 40 + Math.sin(an) * (i % 2 ? 32 : 42)); } c.closePath(); c.fill(); c.stroke(); }
  if (a.type === 'wolf') { c.fillStyle = dark; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(50 + d * 10, 16); c.lineTo(50 + d * 26, -4); c.lineTo(50 + d * 28, 26); c.fill(); c.stroke(); } }
  if (a.type === 'roo') { c.fillStyle = col; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(50 + d * 14, 4, 6, 18, d * 0.2, 0, Math.PI * 2); c.fill(); c.stroke(); } }
  c.fillStyle = col;
  if (a.type === 'robot') { roundRect(c, 24, 14, 52, 56, 8); c.fill(); c.stroke(); c.fillStyle = '#111'; c.fillRect(30, 32, 40, 12); c.globalCompositeOperation = 'lighter'; glowCircle(c, 42, 38, 10, a.eye || 'rgba(255,50,50,1)'); glowCircle(c, 58, 38, 10, a.eye || 'rgba(255,50,50,1)'); c.globalCompositeOperation = 'source-over'; c.fillStyle = dark; for (let i = 0; i < 4; i++) c.fillRect(36 + i * 8, 54, 5, 8); return; }
  if (a.type === 'skull') { c.fillStyle = '#eee8d8'; c.beginPath(); c.arc(50, 36, 24, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillRect(38, 54, 24, 14); c.strokeRect(38, 54, 24, 14); circle(c, 41, 38, 7, '#111'); circle(c, 59, 38, 7, '#111'); c.globalCompositeOperation = 'lighter'; glowCircle(c, 41, 38, 9, a.eye || 'rgba(120,255,160,1)'); glowCircle(c, 59, 38, 9, a.eye || 'rgba(120,255,160,1)'); c.globalCompositeOperation = 'source-over'; c.fillStyle = '#111'; c.beginPath(); c.moveTo(50, 46); c.lineTo(46, 52); c.lineTo(54, 52); c.fill(); return; }
  if (a.type === 'bug') { c.beginPath(); c.arc(50, 38, 25, 0, Math.PI * 2); c.fill(); c.stroke(); for (const [ex, ey, r] of [[40, 34, 6], [60, 34, 6], [34, 44, 3.5], [66, 44, 3.5], [44, 26, 3], [56, 26, 3]]) { circle(c, ex, ey, r, '#c01010'); circle(c, ex - r * 0.3, ey - r * 0.3, r * 0.3, '#fff'); } c.strokeStyle = dark; c.lineWidth = 3; c.beginPath(); c.moveTo(44, 58); c.lineTo(40, 70); c.moveTo(56, 58); c.lineTo(60, 70); c.stroke(); return; }
  if (a.type === 'squid') { c.beginPath(); c.ellipse(50, 26, 24, 28, 0, 0, Math.PI * 2); c.fill(); c.stroke(); for (let i = 0; i < 6; i++) { c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.moveTo(34 + i * 6, 46); c.quadraticCurveTo(30 + i * 7, 64, 36 + i * 6, 80); c.stroke(); } c.globalCompositeOperation = 'lighter'; glowCircle(c, 42, 30, 8, 'rgba(120,255,200,1)'); glowCircle(c, 58, 30, 8, 'rgba(120,255,200,1)'); c.globalCompositeOperation = 'source-over'; return; }
  // mammal/reptile face
  c.beginPath(); c.ellipse(50, 38, 24, 24, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = shadeHex(col, 0.25); c.beginPath(); c.ellipse(50, 54, a.type === 'dino' ? 20 : 13, a.type === 'dino' ? 12 : 10, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  circle(c, 50, 48, 4, '#111');
  for (const ex of [39, 61]) { c.fillStyle = a.eyeColor || '#ffd35a'; c.beginPath(); c.ellipse(ex, 36, 6, 5, 0, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#111'; c.beginPath(); c.ellipse(ex, 36, a.type === 'dino' ? 1.3 : 2.4, 4, 0, 0, Math.PI * 2); c.fill(); circle(c, ex - 2, 34, 1.3, '#fff'); }
  c.strokeStyle = ink; c.lineWidth = 2.4; c.beginPath(); c.moveTo(32, 27); c.lineTo(45, 30); c.moveTo(68, 27); c.lineTo(55, 30); c.stroke();
  c.fillStyle = '#fff'; for (const d of [-5, 5]) { c.beginPath(); c.moveTo(50 + d - 2, 58); c.lineTo(50 + d, 64); c.lineTo(50 + d + 2, 58); c.fill(); }
}
function drawFaceExtras(c, F, def, ink) {
  c.strokeStyle = ink; c.lineWidth = 1.6;
  if (F.ears && !F.animal) { c.fillStyle = F.ears.color; for (const d of [-1, 1]) { c.beginPath(); if (F.ears.type === 'bunny') c.ellipse(50 + d * 14, -2, 6, 18, d * 0.2, 0, Math.PI * 2); else if (F.ears.type === 'elf') { c.moveTo(50 + d * 24, 40); c.lineTo(50 + d * 44, 24); c.lineTo(50 + d * 26, 50); } else { c.moveTo(50 + d * 10, 12); c.lineTo(50 + d * 24, F.ears.type === 'wolf' ? -10 : -4); c.lineTo(50 + d * 28, 22); } c.closePath(); c.fill(); c.stroke(); } }
  if (F.horns) { c.fillStyle = F.horns.color; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(50 + d * 14, 16); c.quadraticCurveTo(50 + d * 34, 6, 50 + d * 34, -12); c.quadraticCurveTo(50 + d * 26, 6, 50 + d * 8, 20); c.closePath(); c.fill(); c.stroke(); } }
  if (F.mask) {
    const m = F.mask; c.fillStyle = m.color;
    if (m.type === 'visor' || m.type === 'shades') { c.globalAlpha = 0.95; roundRect(c, 26, 35, 48, 12, 4); c.fill(); c.stroke(); c.globalAlpha = 1; c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(30, 37, 14, 2); }
    else if (m.type === 'band') { c.fillRect(24, 36, 52, 10); c.strokeRect(24, 36, 52, 10); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(39, 41, 5, 2.5, 0, 0, Math.PI * 2); c.ellipse(61, 41, 5, 2.5, 0, 0, Math.PI * 2); c.fill(); }
    else if (m.type === 'half') { c.beginPath(); c.moveTo(28, 52); c.lineTo(72, 52); c.quadraticCurveTo(70, 68, 50, 76); c.quadraticCurveTo(30, 68, 28, 52); c.fill(); c.stroke(); }
    else if (m.type === 'full' || m.type === 'oni') { c.beginPath(); c.ellipse(50, 42, 25, 30, 0, 0, Math.PI * 2); c.fill(); c.stroke(); if (m.type === 'oni') { c.fillStyle = '#ffd35a'; circle(c, 39, 38, 4, '#ffd35a'); circle(c, 61, 38, 4, '#ffd35a'); c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(38 + i * 7, 58); c.lineTo(41 + i * 7, 66); c.lineTo(44 + i * 7, 58); c.fill(); } } else { c.globalCompositeOperation = 'lighter'; glowCircle(c, 60, 38, 12, hexA(F.eyes, 0.9)); c.globalCompositeOperation = 'source-over'; circle(c, 60, 38, 3, '#fff'); } }
    else if (m.type === 'goggles') { for (const ex of [39, 61]) { circle(c, ex, 38, 9, m.color); c.beginPath(); c.arc(ex, 38, 9, 0, Math.PI * 2); c.stroke(); circle(c, ex, 38, 6, m.lens || '#9ff'); circle(c, ex - 2, 36, 2, '#fff'); } c.fillStyle = m.color; c.fillRect(20, 36, 8, 4); c.fillRect(72, 36, 8, 4); }
    else if (m.type === 'glasses') { c.strokeStyle = m.color; c.lineWidth = 2; c.strokeRect(30, 36, 18, 12); c.strokeRect(52, 36, 18, 12); c.beginPath(); c.moveTo(48, 40); c.lineTo(52, 40); c.stroke(); }
    else if (m.type === 'eyepatch') { c.fillStyle = m.color; c.beginPath(); c.ellipse(61, 42, 8, 7, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = m.color; c.lineWidth = 2; c.beginPath(); c.moveTo(22, 30); c.lineTo(78, 46); c.stroke(); }
  }
  if (F.hat) {
    const h = F.hat; c.fillStyle = h.color; c.strokeStyle = ink; c.lineWidth = 1.6;
    const f = () => { c.fill(); c.stroke(); };
    if (h.type === 'wizard') { c.beginPath(); c.moveTo(10, 22); c.lineTo(90, 22); c.lineTo(66, 12); c.quadraticCurveTo(50, -20, 20, -26); c.quadraticCurveTo(38, -4, 34, 12); c.closePath(); f(); }
    else if (h.type === 'cowboy') { c.beginPath(); c.ellipse(50, 18, 44, 8, 0, 0, Math.PI * 2); f(); c.beginPath(); c.moveTo(30, 18); c.lineTo(32, -6); c.quadraticCurveTo(50, 2, 68, -6); c.lineTo(70, 18); f(); }
    else if (h.type === 'tophat') { c.fillRect(16, 12, 68, 8); c.strokeRect(16, 12, 68, 8); c.fillRect(28, -24, 44, 36); c.strokeRect(28, -24, 44, 36); c.fillStyle = h.band || '#a22'; c.fillRect(28, 4, 44, 6); }
    else if (h.type === 'chef') { c.fillStyle = '#fff'; for (const [x, y] of [[34, 0], [50, -6], [66, 0]]) { c.beginPath(); c.arc(x, y, 14, 0, Math.PI * 2); f(); } c.fillRect(28, 6, 44, 14); c.strokeRect(28, 6, 44, 14); }
    else if (h.type === 'bandana') { c.fillRect(20, 16, 60, 10); c.strokeRect(20, 16, 60, 10); c.beginPath(); c.moveTo(78, 20); c.lineTo(96, 12); c.lineTo(94, 28); c.closePath(); f(); }
    else if (h.type === 'kabuto') { c.beginPath(); c.moveTo(16, 30); c.quadraticCurveTo(18, 0, 50, 0); c.quadraticCurveTo(82, 0, 84, 30); c.closePath(); f(); c.fillStyle = h.accent || '#ffd35a'; c.beginPath(); c.moveTo(50, 4); c.lineTo(22, -22); c.lineTo(46, 6); c.moveTo(50, 4); c.lineTo(78, -22); c.lineTo(54, 6); f(); }
    else if (h.type === 'beanie' || h.type === 'cap') { c.beginPath(); c.arc(50, 24, 27, Math.PI, Math.PI * 2); f(); if (h.type === 'cap') { c.beginPath(); c.moveTo(60, 22); c.lineTo(96, 26); c.lineTo(60, 28); f(); } else circle(c, 50, -4, 6, h.accent || '#fff'); }
    else if (h.type === 'astronaut') { c.globalAlpha = 0.25; circle(c, 50, 42, 42, '#bff'); c.globalAlpha = 1; c.strokeStyle = '#ddd'; c.lineWidth = 4; c.beginPath(); c.arc(50, 42, 42, 0, Math.PI * 2); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(34, 22, 10, 5, -0.6, 0, Math.PI * 2); c.fill(); }
    else if (h.type === 'tiara') { for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(50 + i * 12 - 5, 10); c.lineTo(50 + i * 12, -4 + Math.abs(i) * 6); c.lineTo(50 + i * 12 + 5, 10); f(); } }
    else if (h.type === 'graduate') { c.beginPath(); c.moveTo(10, 10); c.lineTo(50, -6); c.lineTo(90, 10); c.lineTo(50, 22); c.closePath(); f(); c.strokeStyle = '#ffd35a'; c.beginPath(); c.moveTo(80, 12); c.lineTo(84, 30); c.stroke(); }
    else if (h.type === 'wig') { for (let i = 0; i < 10; i++) { const x = 18 + (i % 5) * 16, y = 8 + Math.floor(i / 5) * 60; circle(c, x, y, 10, h.color); } }
  }
  if (F.halo) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = hexA(F.halo.color, 0.95); c.lineWidth = 4; c.beginPath(); c.ellipse(50, -2, 26, 6, 0, 0, Math.PI * 2); c.stroke(); c.globalCompositeOperation = 'source-over'; }
  // frame
  c.strokeStyle = hexA(def.color, 0.9); c.lineWidth = 3; c.strokeRect(1.5, 1.5, 97, 97);
}
