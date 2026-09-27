// ============================================================
//  MOONKAI — model renderer
//  Shaded, outlined procedural humanoids + an accessory system
//  so every fighter is built from data. Feet at (0,0), facing +x.
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
    case 'kick':
      Object.assign(P, { hip: [-2, -52], sh: [-8, -86], head: [-8, -101], fK: [24, -46], fF: [50, -54], bK: [-6, -26], bF: [-10, 0], fE: [6, -76], fH: [14, -88], bE: [-20, -74], bH: [-30, -80] }); break;
    case 'uppercut':
      Object.assign(P, { sh: [6, -90], head: [10, -104], fE: [22, -104], fH: [26, -132], bE: [-8, -72], bH: [4, -64], fK: [16, -30], fF: [18, 0], bK: [-8, -22], bF: [-22, 0] }); break;
    case 'slam':
      Object.assign(P, { sh: [10, -82], head: [16, -94], fE: [34, -76], fH: [52, -48], bE: [28, -78], bH: [46, -44], fK: [16, -24], fF: [26, 0], bF: [-22, 0] }); break;
    case 'dash':
      Object.assign(P, { hip: [0, -46], sh: [16, -78], head: [24, -90], fE: [2, -66], fH: [-14, -60], bE: [-8, -70], bH: [-24, -66], fK: [16, -24], fF: [30, -4], bK: [-14, -24], bF: [-32, -6] }); break;
    case 'cast':
      Object.assign(P, { sh: [4, -86], head: [6, -101], fE: [24, -82], fH: [46, -80], bE: [18, -76], bH: [42, -74], fF: [20, 0], bF: [-18, 0] }); break;
    case 'hurt':
      Object.assign(P, { hip: [-4, -50], sh: [-10, -84], head: [-14, -98], fE: [2, -96], fH: [-4, -112], bE: [-22, -90], bH: [-32, -100] }); break;
    case 'stun':
      Object.assign(P, { sh: [Math.sin(t * 6) * 5, -84], head: [Math.sin(t * 6) * 8, -98], fE: [10, -64], fH: [12, -48], bE: [-10, -64], bH: [-12, -48] }); break;
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

const OUTLINE = 'rgba(8,6,18,0.8)';
function shadedLimb(c, pts, w, col) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  const path = (ox = 0, oy = 0) => { c.beginPath(); c.moveTo(pts[0][0] + ox, pts[0][1] + oy); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0] + ox, pts[i][1] + oy); };
  path(); c.strokeStyle = OUTLINE; c.lineWidth = w + 3.2; c.stroke();
  path(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
  path(-w * 0.18, -w * 0.18); c.strokeStyle = 'rgba(255,255,255,0.16)'; c.lineWidth = w * 0.28; c.stroke();
}
function torso(c, P, pal, bulk = 1) {
  const dx = P.sh[0] - P.hip[0], dy = P.sh[1] - P.hip[1], L = Math.hypot(dx, dy) || 1;
  const px = -dy / L, py = dx / L;
  const SW = 15 * bulk, WW = 10.5 * bulk;
  const pts = [
    [P.sh[0] + px * SW, P.sh[1] + py * SW], [P.sh[0] - px * SW, P.sh[1] - py * SW],
    [P.hip[0] - px * WW, P.hip[1] - py * WW], [P.hip[0] + px * WW, P.hip[1] + py * WW],
  ];
  const g = c.createLinearGradient(P.sh[0] - 12, P.sh[1] - 4, P.hip[0] + 10, P.hip[1]);
  g.addColorStop(0, shadeHex(pal.top, 0.18)); g.addColorStop(0.55, pal.top); g.addColorStop(1, pal.topDark || shadeHex(pal.top, -0.35));
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  c.quadraticCurveTo(P.sh[0] + dx / L * 6, P.sh[1] + dy / L * 6, pts[1][0], pts[1][1]);
  c.lineTo(pts[2][0], pts[2][1]); c.lineTo(pts[3][0], pts[3][1]); c.closePath();
  c.fillStyle = g; c.fill(); c.strokeStyle = OUTLINE; c.lineWidth = 2; c.stroke();
  // pecs / abs hint
  c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(lerp(P.sh[0], P.hip[0], 0.2), lerp(P.sh[1], P.hip[1], 0.2)); c.lineTo(lerp(P.sh[0], P.hip[0], 0.85), lerp(P.sh[1], P.hip[1], 0.85)); c.stroke();
}
function shadedHead(c, x, y, r, skin) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, 1, x, y, r * 1.1);
  g.addColorStop(0, shadeHex(skin, 0.25)); g.addColorStop(0.7, skin); g.addColorStop(1, shadeHex(skin, -0.3));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = OUTLINE; c.lineWidth = 2; c.stroke();
}

// Same signature as the original, now shaded and bulk-aware.
function drawHumanoid(c, v, pal, ext = {}) {
  const P = humanPose(v.pose, v.anim || 0);
  const bulk = pal.bulk || 1, lw = 11 * Math.sqrt(bulk), aw = 9 * Math.sqrt(bulk);
  if (ext.back) ext.back(c, P, v);
  shadedLimb(c, [P.hip, P.bK, P.bF], lw, pal.pantsDark || shadeHex(pal.pants, -0.3));
  ellipse(c, P.bF[0] + 3, P.bF[1] - 3, 8 * Math.sqrt(bulk), 5, pal.boots);
  shadedLimb(c, [P.sh, P.bE, P.bH], aw, pal.topDark || shadeHex(pal.top, -0.3));
  circle(c, P.bH[0], P.bH[1], 5 * Math.sqrt(bulk), pal.glove || pal.skin);
  torso(c, P, pal, bulk);
  if (pal.belt) { c.strokeStyle = pal.belt; c.lineWidth = 5; c.beginPath(); c.moveTo(P.hip[0] - 10 * bulk, P.hip[1] + 2); c.lineTo(P.hip[0] + 10 * bulk, P.hip[1] + 2); c.stroke(); }
  if (ext.chest) ext.chest(c, P, v);
  shadedLimb(c, [P.hip, P.fK, P.fF], lw, pal.pants);
  ellipse(c, P.fF[0] + 3, P.fF[1] - 3, 8 * Math.sqrt(bulk), 5, pal.boots);
  shadedLimb(c, [P.sh, [P.head[0], P.head[1] + 6]], 7 * Math.sqrt(bulk), pal.skin);
  shadedHead(c, P.head[0], P.head[1], 11, pal.skin);
  if (ext.head) ext.head(c, P, v);
  if (ext.pads) ext.pads(c, P, v);
  shadedLimb(c, [P.sh, P.fE, P.fH], aw, pal.top);
  circle(c, P.fH[0], P.fH[1], 5.5 * Math.sqrt(bulk), pal.glove || pal.skin);
  if (ext.front) ext.front(c, P, v);
}

// ---------------- accessory library ----------------
const Acc = {
  hair(c, P, h, t) {
    const [x, y] = P.head; c.fillStyle = h.color;
    switch (h.type) {
      case 'spiky': {
        c.beginPath(); c.moveTo(x - 12, y + 2);
        for (const [sx, sy] of [[-18, -6], [-10, -10], [-16, -18], [-4, -14], [-6, -26], [4, -14], [8, -24], [10, -10], [16, -12], [12, -2]]) c.lineTo(x + sx, y + sy);
        c.closePath(); c.fill(); break;
      }
      case 'long': {
        c.beginPath(); c.moveTo(x + 10, y - 6); c.quadraticCurveTo(x, y - 18, x - 12, y - 8);
        c.quadraticCurveTo(x - 22 + Math.sin(t * 4) * 3, y + 16, x - 18 + Math.sin(t * 4 + 1) * 4, y + 34);
        c.lineTo(x - 8, y + 20); c.quadraticCurveTo(x - 4, y + 4, x + 10, y - 6); c.fill(); break;
      }
      case 'mohawk': {
        c.beginPath(); c.moveTo(x - 8, y - 8);
        for (let i = 0; i < 5; i++) { c.lineTo(x - 8 + i * 4, y - 22 - (i % 2) * 5); c.lineTo(x - 6 + i * 4, y - 10); }
        c.closePath(); c.fill(); break;
      }
      case 'bun': {
        c.beginPath(); c.arc(x, y - 3, 11.5, Math.PI, Math.PI * 2); c.fill();
        circle(c, x - 10, y - 12, 6, h.color); break;
      }
      case 'short': { c.beginPath(); c.arc(x - 1, y - 2, 12, Math.PI * 0.95, Math.PI * 2.05); c.fill(); break; }
      case 'hood': {
        c.beginPath(); c.arc(x - 2, y - 1, 14, Math.PI * 0.55, Math.PI * 2.1); c.lineTo(x + 4, y + 12); c.fill(); break;
      }
      case 'helmet': {
        c.beginPath(); c.arc(x, y - 1, 13, Math.PI * 0.85, Math.PI * 2.15); c.lineTo(x + 12, y + 6); c.lineTo(x - 12, y + 6); c.fill();
        c.fillStyle = h.visor || '#7df'; c.fillRect(x - 1, y - 5, 13, 5); break;
      }
      case 'crown': {
        c.beginPath(); c.arc(x - 1, y - 1, 12, Math.PI * 0.9, Math.PI * 2.1); c.fill();
        c.fillStyle = h.accent || '#bff';
        for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + i * 5 - 3, y - 10); c.lineTo(x + i * 5, y - 26 + Math.abs(i) * 5); c.lineTo(x + i * 5 + 3, y - 10); c.fill(); }
        break;
      }
      case 'jester': {
        for (const [dx, col] of [[-1, h.color], [1, h.accent || '#222']]) {
          c.fillStyle = col; c.beginPath(); c.moveTo(x - 6 * dx - 2, y - 8); c.quadraticCurveTo(x - 20 * dx, y - 28, x - 26 * dx, y - 14); c.lineTo(x + 2 * dx, y - 12); c.fill();
          circle(c, x - 26 * dx, y - 14, 3, '#ffd35a');
        }
        break;
      }
      case 'bald': default: break;
    }
  },
  mask(c, P, m) {
    const [x, y] = P.head; c.fillStyle = m.color;
    if (m.type === 'visor') { c.fillRect(x - 2, y - 5, 14, 5); }
    else if (m.type === 'band') { c.beginPath(); c.moveTo(x - 2, y - 4); c.lineTo(x + 13, y - 5); c.lineTo(x + 12, y + 1); c.lineTo(x, y + 1); c.fill(); }
    else if (m.type === 'half') { c.beginPath(); c.moveTo(x - 4, y + 1); c.lineTo(x + 12, y + 1); c.lineTo(x + 10, y + 10); c.lineTo(x - 2, y + 10); c.fill(); }
    else if (m.type === 'full') { c.beginPath(); c.arc(x + 2, y + 1, 10, 0, Math.PI * 2); c.fill(); }
    else if (m.type === 'goggles') { circle(c, x + 4, y - 3, 4.5, m.color); circle(c, x + 11, y - 3, 3.5, m.color); c.fillStyle = m.lens || '#9ff'; circle(c, x + 4, y - 3, 2.5, m.lens || '#9ff'); }
  },
  eyes(c, P, e, t) {
    const [x, y] = P.head;
    if (e.glow) { c.globalCompositeOperation = 'lighter'; glowCircle(c, x + 7, y - 2, 8, hexA(e.glow, 0.9)); c.globalCompositeOperation = 'source-over'; }
    circle(c, x + 7, y - 2, 2, e.color || '#111');
  },
  cape(c, P, cp, t) {
    c.fillStyle = cp.color;
    c.beginPath(); c.moveTo(P.sh[0] - 10, P.sh[1] - 2); c.lineTo(P.sh[0] + 6, P.sh[1] - 2);
    const len = cp.len || 1;
    for (let i = 0; i <= 6; i++) { const x = P.sh[0] + 2 - i * 8 * len, y = lerp(P.sh[1], -4, len) + (i % 2) * 8 + Math.sin(t * 5 + i) * 4; c.lineTo(x - 6, y); }
    c.closePath(); c.fill();
    c.strokeStyle = OUTLINE; c.lineWidth = 1.5; c.stroke();
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
        for (let i = 0; i < 5; i++) {
          c.fillStyle = w.type === 'light' ? hexA(w.color, 0.55 - i * 0.07) : shadeHex(w.color, -i * 0.08);
          c.beginPath(); c.ellipse(-28 - i * 12, -26 * side * 0 - 18 + i * 8, 34 - i * 3, 8, -0.5 + i * 0.22, 0, Math.PI * 2); c.fill();
        }
        c.globalCompositeOperation = 'source-over';
      } else if (w.type === 'mech') {
        c.fillStyle = w.color; c.strokeStyle = OUTLINE; c.lineWidth = 2;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-50, -34); c.lineTo(-64, -26); c.lineTo(-20, 6); c.closePath(); c.fill(); c.stroke();
        c.globalCompositeOperation = 'lighter'; glowCircle(c, -60, -28, 12, 'rgba(120,220,255,0.9)'); c.globalCompositeOperation = 'source-over';
      } else { // bat
        c.fillStyle = side < 0 ? shadeHex(w.color, -0.3) : w.color;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-30, -44); c.lineTo(-70, -30); c.lineTo(-58, -8); c.lineTo(-74, 4); c.lineTo(-46, 10); c.lineTo(-50, 26); c.lineTo(-16, 16); c.closePath(); c.fill();
      }
      c.restore();
    }
  },
  horns(c, P, h) {
    const [hx, hy] = P.head; c.fillStyle = h.color;
    c.beginPath(); c.moveTo(hx - 6, hy - 8); c.quadraticCurveTo(hx - 20, hy - 20, hx - 14, hy - 34); c.quadraticCurveTo(hx - 10, hy - 18, hx - 1, hy - 10); c.fill();
    c.beginPath(); c.moveTo(hx + 4, hy - 9); c.quadraticCurveTo(hx + 8, hy - 24, hx + 20, hy - 30); c.quadraticCurveTo(hx + 12, hy - 18, hx + 10, hy - 6); c.fill();
  },
  halo(c, P, h, t) {
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = hexA(h.color, 0.9); c.lineWidth = 3;
    c.beginPath(); c.ellipse(P.head[0], P.head[1] - 20 + Math.sin(t * 2) * 2, 12, 4, 0, 0, Math.PI * 2); c.stroke();
    c.globalCompositeOperation = 'source-over';
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
      default: c.beginPath(); c.moveTo(0, -7); c.lineTo(6, 0); c.lineTo(0, 7); c.lineTo(-6, 0); c.fill();
    }
    c.restore();
  },
  weapon(c, P, w, v) {
    const [hx, hy] = P.fH; const t = v.anim || 0;
    const atk = ['punch', 'kick', 'uppercut', 'slam', 'dash', 'cast'].includes(v.pose);
    c.lineCap = 'round';
    if (w.type === 'blade' || w.type === 'dual' || w.type === 'greatsword') {
      const len = w.type === 'greatsword' ? 70 : 42, ang = atk ? -0.1 : -1.1;
      c.strokeStyle = OUTLINE; c.lineWidth = (w.type === 'greatsword' ? 10 : 6) + 2;
      c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + Math.cos(ang) * len, hy + Math.sin(ang) * len); c.stroke();
      c.strokeStyle = w.color; c.lineWidth = w.type === 'greatsword' ? 10 : 6; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.5; c.stroke();
      if (w.glow) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = hexA(w.glow, 0.5); c.lineWidth = 14; c.stroke(); c.globalCompositeOperation = 'source-over'; }
      if (w.type === 'dual') { const [bx, by] = P.bH; c.strokeStyle = w.color; c.lineWidth = 5; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 30, by - 20); c.stroke(); }
    } else if (w.type === 'staff' || w.type === 'spear') {
      const ang = atk ? 0 : -1.35, len = 80;
      c.strokeStyle = OUTLINE; c.lineWidth = 6; c.beginPath(); c.moveTo(hx - Math.cos(ang) * 30, hy - Math.sin(ang) * 30); c.lineTo(hx + Math.cos(ang) * len * 0.6, hy + Math.sin(ang) * len * 0.6); c.stroke();
      c.strokeStyle = w.color; c.lineWidth = 4; c.stroke();
      const tx = hx + Math.cos(ang) * len * 0.6, ty = hy + Math.sin(ang) * len * 0.6;
      if (w.type === 'spear') { c.fillStyle = w.tip || '#fff'; c.beginPath(); c.moveTo(tx + Math.cos(ang) * 16, ty + Math.sin(ang) * 16); c.lineTo(tx + Math.cos(ang + 1.6) * 5, ty + Math.sin(ang + 1.6) * 5); c.lineTo(tx + Math.cos(ang - 1.6) * 5, ty + Math.sin(ang - 1.6) * 5); c.fill(); }
      else { c.globalCompositeOperation = 'lighter'; glowCircle(c, tx, ty, 12 + Math.sin(t * 6) * 2, hexA(w.tip || '#9ff', 1)); c.globalCompositeOperation = 'source-over'; }
    } else if (w.type === 'claws') {
      c.strokeStyle = w.color; c.lineWidth = 2;
      for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 14, hy + k * 6 - 2); c.stroke(); }
    } else if (w.type === 'gauntlet') {
      circle(c, hx, hy, 9, w.color); c.strokeStyle = OUTLINE; c.lineWidth = 2; c.beginPath(); c.arc(hx, hy, 9, 0, Math.PI * 2); c.stroke();
      if (w.glow) { c.globalCompositeOperation = 'lighter'; glowCircle(c, hx, hy, 16, hexA(w.glow, 0.7)); c.globalCompositeOperation = 'source-over'; }
    } else if (w.type === 'cards') {
      c.save(); c.translate(hx, hy); for (let i = -1; i <= 1; i++) { c.save(); c.rotate(i * 0.35 - 0.3); c.fillStyle = '#fff'; c.fillRect(0, -3, 12, 17); c.fillStyle = i ? '#d22' : '#222'; c.fillRect(3, 2, 5, 5); c.restore(); } c.restore();
    } else if (w.type === 'wrench') {
      c.strokeStyle = w.color; c.lineWidth = 5; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 26, hy - 22); c.stroke();
      circle(c, hx + 28, hy - 24, 6, w.color); circle(c, hx + 30, hy - 26, 2.5, '#222');
    }
  },
};

// Build a draw() from a model description. formModel overrides apply when transformed.
function makeModelDraw(base, formModel) {
  return function (c, v) {
    const m = v.transformed && formModel ? Object.assign({}, base, formModel) : base;
    const t = v.anim || 0;
    if (m.body) { m.body(c, v, m); return; }
    c.save();
    if (m.float) c.translate(0, -8 - Math.sin(t * 2.5) * 4);
    if (m.aura) glowCircle(c, 0, -60, 95 * (m.auraSize || 1), hexA(m.aura, 0.3 + Math.sin(t * 5) * 0.05), hexA(m.aura, 0));
    if (m.alpha !== undefined) c.globalAlpha *= m.alpha;
    drawHumanoid(c, v, m, {
      back(c, P) {
        if (m.cape) Acc.cape(c, P, m.cape, t);
        if (m.wings) Acc.wings(c, P, m.wings, t);
        if (m.scarf) Acc.scarf(c, P, m.scarf, t);
        if (m.tail) { c.strokeStyle = m.tail; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(P.hip[0] - 6, P.hip[1] + 4); c.quadraticCurveTo(P.hip[0] - 40, P.hip[1] + 30, P.hip[0] - 46 + Math.sin(t * 4) * 6, P.hip[1] - 4); c.stroke(); }
        if (m.hair && m.hair.type === 'long') Acc.hair(c, P, m.hair, t);
      },
      chest(c, P) {
        if (m.stripes) { c.strokeStyle = m.stripes; c.lineWidth = 3; c.beginPath(); c.moveTo(lerp(P.hip[0], P.sh[0], 0.1) - 6, lerp(P.hip[1], P.sh[1], 0.1)); c.lineTo(lerp(P.hip[0], P.sh[0], 0.9) + 6, lerp(P.hip[1], P.sh[1], 0.9)); c.stroke(); }
        if (m.emblem) Acc.emblem(c, P, m.emblem, t);
      },
      head(c, P) {
        if (m.hair && m.hair.type !== 'long') Acc.hair(c, P, m.hair, t);
        if (m.horns) Acc.horns(c, P, m.horns);
        if (m.mask) Acc.mask(c, P, m.mask);
        Acc.eyes(c, P, m.eyes || {}, t);
        if (m.halo) Acc.halo(c, P, m.halo, t);
      },
      pads(c, P) { if (m.pads) Acc.pads(c, P, m.pads); },
      front(c, P, v) { if (m.weapon) Acc.weapon(c, P, m.weapon, v); },
    });
    c.restore();
  };
}

// ---------------- special bodies ----------------
function drawGolem(c, v, m) {
  const t = v.anim || 0, br = Math.sin(t * 2) * 1.5;
  const atk = v.pose === 'punch' || v.pose === 'slam' || v.pose === 'uppercut';
  const rock = m.rock || '#6b5a48', dark = shadeHex(rock, -0.35), glow = m.glowColor || '#ff9a3a';
  const blob = (pts, col) => { c.fillStyle = col; c.strokeStyle = OUTLINE; c.lineWidth = 2.5; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.stroke(); };
  blob([[-26, 0], [-30, -30], [-12, -34], [-8, 0]], dark);
  blob([[8, 0], [10, -34], [28, -30], [30, 0]], rock);
  blob([[-34, -30], [-40, -80 + br], [-18, -104 + br], [22, -104 + br], [38, -78 + br], [30, -30]], rock);
  blob([[0, -104 + br], [-10, -126 + br], [10, -136 + br], [26, -120 + br], [20, -102 + br]], rock);
  c.globalCompositeOperation = 'lighter';
  glowCircle(c, 14, -120 + br, 10, hexA(glow, 1)); glowCircle(c, 4, -64 + br, 26, hexA(glow, 0.5));
  c.strokeStyle = hexA(glow, 0.9); c.lineWidth = 2;
  c.beginPath(); c.moveTo(-20, -90); c.lineTo(-4, -70); c.lineTo(-12, -46); c.moveTo(16, -92); c.lineTo(8, -66); c.lineTo(22, -44); c.stroke();
  c.globalCompositeOperation = 'source-over';
  const fh = atk ? [76, -70] : [46, -16];
  blob([[20, -96], [fh[0] - 6, fh[1] - 14], [fh[0] + 10, fh[1] + 2], [28, -70]], rock);
  blob([[fh[0] - 10, fh[1] - 14], [fh[0] + 14, fh[1] - 16], [fh[0] + 16, fh[1] + 10], [fh[0] - 8, fh[1] + 12]], dark);
}
function drawMech(c, v, m) {
  const t = v.anim || 0, br = Math.sin(t * 3) * 1;
  const run = v.pose === 'run' ? Math.sin(t * 9) * 6 : 0;
  const atk = v.pose === 'punch' || v.pose === 'cast' || v.pose === 'slam';
  const metal = m.metal || '#7a8594', dark = shadeHex(metal, -0.4), acc = m.accent || '#ffb020';
  c.strokeStyle = OUTLINE; c.lineWidth = 2.5;
  const box = (x, y, w, h, col, r = 4) => { c.fillStyle = col; roundRect(c, x, y, w, h, r); c.fill(); c.stroke(); };
  box(-28 + run, -40, 18, 40, dark); box(10 - run, -40, 18, 40, metal);
  box(-32 + run, -6, 26, 8, dark, 2); box(6 - run, -6, 26, 8, dark, 2);
  box(-38, -104 + br, 76, 66, metal, 10);
  c.fillStyle = acc; c.fillRect(-38, -60 + br, 76, 6);
  // cockpit with pilot
  box(-2, -100 + br, 30, 26, '#123', 8);
  circle(c, 12, -86 + br, 7, m.skin || '#e0b090');
  c.fillStyle = 'rgba(120,220,255,0.35)'; roundRect(c, -2, -100 + br, 30, 26, 8); c.fill();
  // shoulder missile pods
  box(-44, -116 + br, 26, 16, dark); for (let i = 0; i < 3; i++) circle(c, -38 + i * 7, -108 + br, 2.5, acc);
  // cannon arm
  const ax = atk ? 70 : 44, ay = atk ? -80 : -52;
  box(26, -96 + br, 16, 20, dark);
  c.save(); c.translate(34, -86 + br); c.rotate(Math.atan2(ay + 86, ax - 34)); box(0, -8, 44, 16, metal); box(40, -6, 10, 12, dark, 2); c.restore();
  if (atk) { c.globalCompositeOperation = 'lighter'; glowCircle(c, ax + 14, ay + 2, 14, 'rgba(120,220,255,0.9)'); c.globalCompositeOperation = 'source-over'; }
  c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -20, 16 + Math.sin(t * 20) * 3, hexA(acc, 0.5)); c.globalCompositeOperation = 'source-over';
}
