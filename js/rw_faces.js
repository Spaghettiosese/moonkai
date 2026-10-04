// Hand-drawn anime bust portraits for the reworked fighters, in the style of the Aatrox / Volibear / Seraph portraits:
// a face-on illustration (backdrop, shoulders, hair, big expressive eyes, per-form changes) painted into the 100x100 box,
// then posterised through PxKit.portrait so it reads as pixel art. Settings -> Pixel Art off falls back to the old vector portraits.
// Every fighter has a `normal` and a `form` drawing; Aurelion also gets a Fallen one.
const AF = (() => {
  const OL = '#0b0710';
  const sh = (h, a) => shadeHex(h, a);
  // closed path from points; smooth = quadratic through midpoints (soft hair, cloth)
  function path(c, pts, smooth) {
    c.beginPath();
    if (!smooth) { pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); return; }
    const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const s = m(pts[n - 1], pts[0]); c.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) { const p = pts[i], e = m(p, pts[(i + 1) % n]); c.quadraticCurveTo(p[0], p[1], e[0], e[1]); }
    c.closePath();
  }
  // fill: colour or [top, bottom]
  function shape(c, pts, fill, o = {}) {
    path(c, pts, o.smooth);
    if (Array.isArray(fill)) { let y0 = 1e9, y1 = -1e9; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); } const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, fill[0]); g.addColorStop(1, fill[1]); c.fillStyle = g; } else c.fillStyle = fill;
    c.fill();
    if (o.shine) { c.save(); c.clip(); c.strokeStyle = o.shine; c.lineWidth = 1.5; c.globalAlpha = .55; for (const s of o.shineLines || []) { c.beginPath(); c.moveTo(s[0], s[1]); c.quadraticCurveTo(s[2], s[3], s[4], s[5]); c.stroke(); } c.restore(); }
    if (o.line !== 0) { c.strokeStyle = o.stroke || OL; c.lineWidth = o.line || 1.3; c.lineJoin = 'round'; path(c, pts, o.smooth); c.stroke(); }
  }
  const circ = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
  const ell = (c, x, y, rx, ry, col, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); c.fill(); };
  const add = (c, fn) => { c.save(); c.globalCompositeOperation = 'lighter'; fn(); c.restore(); };
  const glow = (c, x, y, r, col) => add(c, () => glowCircle(c, x, y, r, col, 'rgba(0,0,0,0)'));
  const star = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .28 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); };
  const spark = (c, x, y, r, col) => { c.fillStyle = col; c.fillRect(x - r, y - .5, r * 2, 1); c.fillRect(x - .5, y - r, 1, r * 2); c.fillRect(x - r * .35, y - r * .35, r * .7, r * .7); };

  // backdrop: gradient + soft glow + diagonal streaks + stars
  function bg(c, o = {}) {
    const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, o.top || '#1a1a2e'); g.addColorStop(1, o.bot || '#06060e'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
    if (o.rays) { c.save(); c.translate(o.rx ?? 50, o.ry ?? 45); add(c, () => { c.fillStyle = o.rays; const n = o.rayN || 12; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + (o.rayA || 0); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - .06) * 90, Math.sin(a - .06) * 90); c.lineTo(Math.cos(a + .06) * 90, Math.sin(a + .06) * 90); c.fill(); } }); c.restore(); }
    if (o.glow) glow(c, o.gx ?? 50, o.gy ?? 46, o.gr || 60, o.glow);
    if (o.streak) add(c, () => { c.strokeStyle = o.streak; c.lineWidth = 3; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(-10, 6 + i * 17); c.lineTo(30 + (i % 3) * 10, -8 + i * 17); c.stroke(); } });
    if (o.rings) add(c, () => { c.strokeStyle = o.rings; c.lineWidth = 1.2; for (let r = 30; r < 90; r += 14) { c.beginPath(); c.arc(50, 46, r, 0, 7); c.stroke(); } });
    if (o.stars) { for (let i = 0; i < (o.starN || 16); i++) { const x = (i * 37 + 11) % 100, y = (i * 53 + 7) % 78; if (i % 4 === 0) spark(c, x, y, 2 + (i % 3), o.stars); else { c.fillStyle = o.stars; c.fillRect(x, y, 1.6, 1.6); } } }
  }

  // face. returns the Path2D of the head for clipping.
  function head(c, o = {}) {
    const cx = o.cx ?? 50, w = o.w ?? 20, top = o.top ?? 24, chin = o.chin ?? 75, jw = o.jaw ?? .55, sk = o.skin || '#f6dcc4', e0 = 46;
    // neck + ears first
    if (o.neck !== false) { shape(c, [[cx - 8, 66], [cx + 8, 66], [cx + 9, 90], [cx - 9, 90]], [sh(sk, -.18), sh(sk, -.32)], { line: 1.1 }); }
    if (o.ears !== false) for (const s of [-1, 1]) { const ex = cx + s * (w + .5), ey = o.earY ?? 53; c.fillStyle = sk; c.beginPath(); c.ellipse(ex, ey, 3.2, 5.2, s * .15, 0, 7); c.fill(); c.strokeStyle = OL; c.lineWidth = 1.1; c.stroke(); circ(c, ex - s * .4, ey + .6, 1.2, sh(sk, -.25)); }
    const P = new Path2D(), cyD = (8 * top - 2 * e0) / 6;
    P.moveTo(cx - w, e0);
    P.bezierCurveTo(cx - w, e0 + (chin - e0) * .6, cx - w * (.7 - jw * .38), chin - 1, cx, chin);
    P.bezierCurveTo(cx + w * (.7 - jw * .38), chin - 1, cx + w, e0 + (chin - e0) * .6, cx + w, e0);
    P.bezierCurveTo(cx + w, cyD, cx - w, cyD, cx - w, e0); P.closePath();
    const g = c.createLinearGradient(cx - w, 0, cx + w, 0); g.addColorStop(0, sh(sk, .05)); g.addColorStop(.6, sk); g.addColorStop(1, sh(sk, -.16));
    c.fillStyle = g; c.fill(P);
    c.save(); c.clip(P);
    // jaw shade + soft cheek colour
    const jg = c.createLinearGradient(0, chin - 14, 0, chin + 2); jg.addColorStop(0, 'rgba(0,0,0,0)'); jg.addColorStop(1, hexA(sh(sk, -.5), .35)); c.fillStyle = jg; c.fillRect(0, chin - 14, 100, 18);
    if (o.blush !== false) for (const s of [-1, 1]) ell(c, cx + s * 12.5, 62, 5, 2.6, o.blushCol || 'rgba(255,110,110,.2)');
    c.restore();
    c.strokeStyle = OL; c.lineWidth = 1.4; c.lineJoin = 'round'; c.stroke(P);
    return P;
  }
  // cast a shadow of `fn` (e.g. the fringe) on the face
  function under(c, P, fn, dy = 2.6, a = .22) { c.save(); c.clip(P); c.translate(0, dy); c.globalAlpha = a; fn(); c.restore(); }

  // a big anime eye. side: -1 left (outer = -x), +1 right.
  function eye(c, x, y, o = {}) {
    const s = o.s || 1, sd = o.side || 1, w = (o.w || 7) * s, h = (o.h || 6) * s, lid = o.lid || 0, tilt = (o.tilt || 0) * s;
    const iris = o.iris || '#4a6aff', top = y - h * (1.1 - lid * .95), E = new Path2D();
    E.moveTo(x - w, y + h * .15 + tilt * sd); E.bezierCurveTo(x - w * .6, top - tilt * .5, x + w * .6, top - tilt * .5, x + w, y + h * .15 - tilt * sd);
    E.bezierCurveTo(x + w * .6, y + h * .95, x - w * .6, y + h * .95, x - w, y + h * .15 + tilt * sd); E.closePath();
    c.save();
    if (o.glow) glow(c, x, y, w * 2.4, o.glow);
    c.fillStyle = o.white || '#fbf7f2'; c.fill(E); c.clip(E);
    const lx = (o.look || 0) * w * .22;
    const ig = c.createLinearGradient(0, y - h, 0, y + h); ig.addColorStop(0, sh(iris, -.5)); ig.addColorStop(.55, iris); ig.addColorStop(1, sh(iris, .5));
    c.fillStyle = ig; c.beginPath(); c.ellipse(x + lx, y + h * .08, w * (o.irisW || .58), h * (o.irisH || 1.02), 0, 0, 7); c.fill();
    if (o.pupil !== false) { c.fillStyle = o.pupilCol || '#10080e'; c.beginPath(); c.ellipse(x + lx, y + h * .1, w * (o.slit ? .09 : .24), h * (o.slit ? .8 : .5), 0, 0, 7); c.fill(); }
    if (o.ring) { c.strokeStyle = o.ring; c.lineWidth = .8; c.beginPath(); c.ellipse(x + lx, y + h * .08, w * .5, h * .9, 0, 0, 7); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x - w, top - 1, w * 2, h * .75);
    c.fillStyle = '#fff'; c.fillRect(x + lx - w * .3, y - h * .55, w * .32, h * .36); c.globalAlpha = .85; c.fillRect(x + lx + w * .16, y + h * .1, w * .16, w * .16); c.globalAlpha = 1;
    c.restore();
    // lids: thick top line with an outward flick, light lower lash
    c.strokeStyle = o.lash || OL; c.lineWidth = 1.9 * Math.min(1.3, s); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - w - sd * .2, y + h * .15 + tilt * sd); c.bezierCurveTo(x - w * .6, top - tilt * .5, x + w * .6, top - tilt * .5, x + w, y + h * .15 - tilt * sd); c.stroke();
    c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + sd * w, y + h * .15 - tilt * sd * (sd > 0 ? 1 : 1)); c.lineTo(x + sd * (w + 2.6 * s), y - h * .35 - tilt * sd); c.stroke();
    c.lineWidth = .8; c.globalAlpha = .7; c.beginPath(); c.moveTo(x - w * .8, y + h * .55); c.quadraticCurveTo(x, y + h * 1.05, x + w * .8, y + h * .55); c.stroke(); c.globalAlpha = 1;
  }
  const eyes = (c, o = {}) => { const cx = o.cx ?? 50, y = o.y ?? 51, d = o.d ?? 10.6; eye(c, cx - d, y, Object.assign({ side: -1 }, o)); eye(c, cx + d, y, Object.assign({ side: 1 }, o)); };
  // closed / serene eye: a down-curved lash line
  function shut(c, x, y, w = 6.5, o = {}) { c.strokeStyle = o.col || OL; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - w, y - 1); c.quadraticCurveTo(x, y + (o.up ? -4 : 4), x + w, y - 1); c.stroke(); }
  // eyebrow: inner end (toward the nose) lowered by `tilt` for anger, raised for worry
  function brow(c, x, y, o = {}) { const sd = o.side || 1, len = o.len || 8, t = o.tilt || 0, th = o.th || 1.8, ix = x - sd * len, ox = x + sd * len; c.fillStyle = o.col || OL; c.beginPath(); c.moveTo(ix, y + t); c.lineTo(ox, y - t * .35 - 1); c.lineTo(ox, y - t * .35 - 1 + th * .6); c.lineTo(ix, y + t + th); c.closePath(); c.fill(); }
  const brows = (c, o = {}) => { const cx = o.cx ?? 50, d = o.d ?? 10.6, y = o.y ?? 42; brow(c, cx - d, y, Object.assign({}, o, { side: -1 })); brow(c, cx + d, y, Object.assign({}, o, { side: 1 })); };
  function nose(c, o = {}) { const cx = o.cx ?? 50, y = o.y ?? 60; c.strokeStyle = o.col || 'rgba(120,60,50,.55)'; c.lineWidth = 1.1; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - 1, y - 3); c.lineTo(cx - 1.6, y); c.lineTo(cx + .8, y + .6); c.stroke(); }
  // mouth kinds: smile, smirk, grim, grin (teeth), snarl, open, tiny
  function mouth(c, kind, o = {}) {
    const cx = o.cx ?? 50, y = o.y ?? 67, w = o.w ?? 6;
    c.lineCap = 'round'; c.lineJoin = 'round';
    if (kind === 'smile') { c.strokeStyle = OL; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - w, y - 1); c.quadraticCurveTo(cx, y + 3.5, cx + w, y - 1); c.stroke(); }
    else if (kind === 'smirk') { c.strokeStyle = OL; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - w, y + .5); c.quadraticCurveTo(cx + 1, y + 2.5, cx + w + 1, y - 2.5); c.stroke(); c.lineWidth = 1; c.beginPath(); c.moveTo(cx + w + 1, y - 2.5); c.lineTo(cx + w + 2.5, y - 3.4); c.stroke(); }
    else if (kind === 'grim') { c.strokeStyle = OL; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - w, y); c.lineTo(cx + w, y); c.stroke(); }
    else if (kind === 'frown') { c.strokeStyle = OL; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - w, y + 1.5); c.quadraticCurveTo(cx, y - 2, cx + w, y + 1.5); c.stroke(); }
    else if (kind === 'tiny') { c.strokeStyle = OL; c.lineWidth = 1.2; c.beginPath(); c.moveTo(cx - 2.5, y); c.quadraticCurveTo(cx, y + 1.6, cx + 2.5, y); c.stroke(); }
    else {
      const open = kind === 'open', sn = kind === 'snarl', depth = open ? 7 : sn ? 5 : 4.2;
      c.beginPath(); c.moveTo(cx - w, y - 1); c.quadraticCurveTo(cx, y + (sn ? 0 : 1.5), cx + w, y - 1); c.quadraticCurveTo(cx + w * .8, y + depth, cx, y + depth + 1); c.quadraticCurveTo(cx - w * .8, y + depth, cx - w, y - 1); c.closePath();
      c.fillStyle = open ? '#4a0c18' : '#fbf6ee'; c.fill(); c.save(); c.clip();
      if (open) { ell(c, cx, y + depth, w * .6, 2.6, '#d4505e'); } else { c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = .7; for (let i = -w + 2; i < w; i += 2.6) { c.beginPath(); c.moveTo(cx + i, y - 1); c.lineTo(cx + i, y + depth); c.stroke(); } c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(cx - w, y + depth - 2, w * 2, 3); }
      c.restore(); c.strokeStyle = OL; c.lineWidth = 1.4; path(c, [[cx - w, y - 1], [cx - w * .5, y + (sn ? .4 : 1.2)], [cx + w * .5, y + (sn ? .4 : 1.2)], [cx + w, y - 1], [cx + w * .8, y + depth], [cx, y + depth + 1], [cx - w * .8, y + depth]], true); c.stroke();
    }
  }
  // clothes silhouette from the shoulders down
  function shoulders(c, col, o = {}) {
    const dk = sh(col, -.4), lt = sh(col, .2);
    shape(c, [[0, 100], [2, 86], [14, 79], [34, 74], [66, 74], [86, 79], [98, 86], [100, 100]], [lt, dk], { smooth: false, line: 1.5 });
    if (o.collar) { shape(c, [[34, 72], [50, 80], [66, 72], [70, 86], [50, 96], [30, 86]], o.collar, { line: 1.2 }); }
    if (o.trim) { c.strokeStyle = o.trim; c.lineWidth = 1.4; c.beginPath(); c.moveTo(14, 79); c.lineTo(34, 74); c.moveTo(66, 74); c.lineTo(86, 79); c.stroke(); }
  }
  // hair mass with a gloss band
  function hair(c, pts, col, o = {}) {
    const hi = o.hi || sh(col, .32), lo = o.lo || sh(col, -.35);
    shape(c, pts, [hi, lo], { smooth: o.smooth, line: o.line ?? 1.4, shine: o.shine === false ? null : (o.glossCol || sh(col, .55)), shineLines: o.gloss || [[30, 36, 50, 22, 70, 36]] });
    if (o.gloss && !o.noStrands) { // fine strands from the hairline down to every tip
      let y0 = 1e9, y1 = -1e9; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
      c.save(); path(c, pts, o.smooth); c.clip(); c.strokeStyle = hexA(sh(col, -.55), .55); c.lineWidth = .8;
      for (const p of pts) if (p[1] > y0 + (y1 - y0) * .62) { c.beginPath(); c.moveTo(50 + (p[0] - 50) * .5, y0 + 2); c.quadraticCurveTo(50 + (p[0] - 50) * .85, (y0 + p[1]) / 2, p[0], p[1] - 1); c.stroke(); }
      c.restore();
    }
  }
  return { OL, sh, path, shape, circ, ell, add, glow, star, spark, bg, head, under, eye, eyes, shut, brow, brows, nose, mouth, shoulders, hair };
})();

// ============================================================================================
//  The portraits.  FACE[id](c, form, def) paints a 100x100 bust.
// ============================================================================================
const FACE = {};
(() => {
  const { sh, shape, circ, ell, add, glow, star, spark, bg, head, under, eye, eyes, shut, brow, brows, nose, mouth, shoulders, hair, path, OL } = AF;

  // ---- GOJO: white spiky hair, black blindfold; awakened = the Six Eyes bare ------------------
  FACE.gojo = (c, F) => {
    bg(c, { top: F ? '#1a0f3e' : '#0c1428', bot: '#04040c', glow: F ? 'rgba(150,90,255,.55)' : 'rgba(80,140,255,.4)', gy: 40, gr: 62, streak: F ? 'rgba(160,120,255,.25)' : 'rgba(90,150,255,.18)', stars: '#bfe4ff' });
    if (F) { add(c, () => { glow(c, 84, 22, 20, 'rgba(255,60,90,.8)'); glow(c, 14, 24, 20, 'rgba(70,120,255,.8)'); }); circ(c, 84, 22, 4, '#ffd0e0'); circ(c, 14, 24, 4, '#d0e0ff'); }
    const back = [[24, 56], [14, 44], [6, 28], [20, 32], [14, 12], [28, 24], [32, 4], [42, 20], [50, 0], [58, 20], [68, 4], [72, 24], [86, 12], [80, 32], [94, 28], [86, 44], [76, 58]];
    hair(c, back, '#e6eefc', { hi: '#ffffff', lo: '#8fa4cc' });
    shoulders(c, '#1a2030', { collar: '#0d111c', trim: '#4a5a80' });
    shape(c, [[36, 76], [50, 86], [64, 76], [68, 88], [50, 99], [32, 88]], '#0d111c', { line: 1.2 });
    const P = head(c, { skin: '#f6e2d0', w: 19.5, chin: 76, jaw: .7, blush: false });
    const fringe = [[30, 48], [29, 34], [38, 26], [50, 22], [62, 26], [71, 34], [70, 48], [66, 38], [62, 50], [57, 38], [52, 46], [47, 36], [42, 50], [38, 38], [34, 50]];
    under(c, P, () => { path(c, fringe); c.fillStyle = '#000'; c.fill(); }, 3, .25);
    if (!F) {
      shape(c, [[26, 46], [74, 46], [75, 57], [25, 57]], ['#262c3a', '#06080e'], { line: 1.4 });
      c.fillStyle = 'rgba(190,210,255,.35)'; c.fillRect(29, 48, 42, 1.4);
      mouth(c, 'smirk', { y: 68, w: 6 }); nose(c);
    } else {
      eyes(c, { y: 51, d: 10.4, w: 7.4, h: 6.6, iris: '#aef2ff', white: '#f2fcff', glow: 'rgba(120,230,255,.85)', ring: '#ffffff', pupilCol: '#2a6aff', irisW: .72, lid: .12 });
      brows(c, { y: 41.5, tilt: -.6, th: 1.6, col: '#cfd9ee', len: 8.5 });
      mouth(c, 'grin', { y: 67.5, w: 6.5 }); nose(c);
    }
    hair(c, fringe, '#f4f8ff', { hi: '#ffffff', lo: '#a9bbdf', gloss: [[36, 32, 44, 28, 54, 30]] });
    for (const [x, y, d] of [[24, 30, -1], [76, 30, 1]]) hair(c, [[x, y], [x + d * 8, y + 24], [x + d * 2, y + 36], [x - d * 4, y + 14]], '#f4f8ff', { hi: '#fff', lo: '#a9bbdf', shine: false });
  };

  // ---- MORDEKAISER: iron lord, no face ----------------------------------------------------------
  FACE.mordekaiser = (c, F) => {
    const gl = F ? 'rgba(90,255,150,' : 'rgba(80,200,130,';
    bg(c, { top: F ? '#0a2a1a' : '#0a1a14', bot: '#020604', glow: gl + (F ? '.6)' : '.35)'), gy: 38, gr: 64, rings: F ? 'rgba(80,255,150,.18)' : 'rgba(80,200,130,.1)', stars: '#7affc0', starN: F ? 22 : 10 });
    // back crown spikes
    for (const [x, h, w] of [[26, 28, 5], [38, 38, 4], [50, 44, 5], [62, 38, 4], [74, 28, 5]]) hair(c, [[x - w, 36], [x, 36 - h * .7 - 4], [x + w, 36]], '#2c3a38', { shine: false, line: 1.3 });
    shoulders(c, '#2a3634', { trim: '#7affc0' });
    for (const s of [-1, 1]) { shape(c, [[50 + s * 20, 86], [50 + s * 30, 70], [50 + s * 46, 64], [50 + s * 50, 84], [50 + s * 40, 100]], ['#4a5a58', '#1a2422'], { line: 1.5 }); for (const k of [0, 1, 2]) shape(c, [[50 + s * (30 + k * 6), 70 - k * 2], [50 + s * (34 + k * 6), 54 - k * 6], [50 + s * (38 + k * 6), 68 - k * 2]], '#566866', { line: 1.2, shine: false }); }
    shape(c, [[32, 78], [68, 78], [64, 92], [36, 92]], ['#303e3c', '#141c1a'], { line: 1.3 });
    // helm
    const H = [[28, 36], [34, 24], [50, 18], [66, 24], [72, 36], [74, 58], [68, 74], [58, 80], [50, 82], [42, 80], [32, 74], [26, 58]];
    shape(c, H, ['#5a6c6a', '#202c2a'], { line: 1.8, shine: '#bfe8e0', shineLines: [[32, 32, 36, 52, 34, 70], [66, 30, 50, 22, 36, 30]] });
    shape(c, [[46, 18], [54, 18], [52, 34], [48, 34]], '#7a8c8a', { line: 1.2 });
    // visor slit + cross plate
    shape(c, [[30, 42], [70, 42], [67, 54], [50, 58], [33, 54]], '#04100c', { line: 1.5 });
    add(c, () => { for (const s of [-1, 1]) glow(c, 50 + s * 11, 49, F ? 14 : 10, gl + '1)'); });
    for (const s of [-1, 1]) shape(c, [[50 + s * 5, 49], [50 + s * 18, 45], [50 + s * 17, 51], [50 + s * 7, 53]], F ? '#eafff2' : '#9affc4', { line: 0 });
    shape(c, [[47, 56], [53, 56], [52, 78], [48, 78]], '#101a18', { line: 1.1 });
    c.strokeStyle = F ? '#7affc0' : '#3ac890'; c.lineWidth = 1.1; for (const x of [40, 44, 56, 60]) { c.beginPath(); c.moveTo(x, 62); c.lineTo(x + (x > 50 ? 1 : -1), 76); c.stroke(); }
    add(c, () => { c.strokeStyle = gl + '.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(34, 28); c.lineTo(38, 36); c.moveTo(66, 28); c.lineTo(62, 38); c.stroke(); });
    if (F) add(c, () => { for (let i = 0; i < 6; i++) { glow(c, 14 + i * 14, 24 + (i % 2) * 8, 7, 'rgba(100,255,170,.55)'); } });
  };

  // ---- SHINJI: blond bob, toothy grin; awakened = the Hollow mask across half his face ----------
  FACE.shinji = (c, F) => {
    bg(c, { top: F ? '#3a0a12' : '#2a3a58', bot: '#080810', glow: F ? 'rgba(255,60,60,.5)' : 'rgba(200,220,255,.3)', streak: F ? 'rgba(255,90,70,.22)' : 'rgba(255,255,255,.12)', stars: '#fff' });
    hair(c, [[24, 54], [20, 34], [28, 20], [50, 14], [72, 20], [80, 34], [76, 66], [70, 74], [66, 56], [34, 56], [30, 74], [26, 68]], '#f0d868', { hi: '#fff4a8', lo: '#a88a28' });
    shoulders(c, '#f2f2f4', { trim: '#cbd' });
    shape(c, [[30, 78], [50, 90], [70, 78], [78, 100], [22, 100]], '#1c1c24', { line: 1.3 });
    shape(c, [[40, 76], [50, 88], [60, 76], [56, 98], [44, 98]], '#e8e4ec', { line: 1.1 });
    const P = head(c, { skin: '#f4dcc4', w: 19, chin: 77, jaw: .6 });
    const bangs = [[30, 46], [29, 32], [38, 24], [50, 20], [62, 24], [71, 32], [70, 46], [66, 40], [64, 34], [56, 44], [50, 30], [44, 44], [36, 36], [34, 50]];
    under(c, P, () => { path(c, bangs); c.fillStyle = '#000'; c.fill(); });
    eyes(c, { y: 52, d: 10.4, w: 6.8, h: 4.4, iris: F ? '#ffcc2a' : '#9a7a5a', lid: .38, tilt: 0 });
    brows(c, { y: 43.5, tilt: -.8, col: '#a88a28' });
    mouth(c, 'grin', { y: 66.5, w: 9 }); nose(c);
    hair(c, bangs, '#f8e078', { hi: '#fffbc0', lo: '#b89a30', gloss: [[38, 28, 48, 24, 58, 28]] });
    if (F) {
      // hollow mask over the right half of the face
      const M = [[50, 24], [70, 32], [72, 56], [66, 74], [54, 82], [50, 78], [50, 24]];
      shape(c, M, ['#fdfdfa', '#cfccc4'], { line: 1.6 });
      shape(c, [[54, 44], [68, 40], [69, 54], [58, 56]], '#0a0306', { line: 1.2 });
      add(c, () => glow(c, 62, 48, 9, 'rgba(255,170,40,.9)')); circ(c, 62, 48, 2.2, '#ffe070');
      c.strokeStyle = '#c4222c'; c.lineWidth = 2; c.lineCap = 'round'; for (const [a, b, d, e] of [[57, 28, 60, 40], [66, 38, 70, 44], [60, 58, 62, 74], [56, 70, 58, 80]]) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); }
      shape(c, [[52, 66], [70, 62], [68, 74], [58, 80], [53, 76]], '#f4f2ec', { line: 1.3, shine: false });
      c.fillStyle = '#10080a'; for (let x = 54; x < 68; x += 3.2) c.fillRect(x, 66 + (x - 54) * -.25, 1.6, 6);
      add(c, () => { c.strokeStyle = 'rgba(255,60,50,.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(50, 22); c.lineTo(50, 80); c.stroke(); });
    }
  };

  // ---- ORACLE: blind seer; awakened = she opens her eyes ----------------------------------------
  FACE.oracle = (c, F) => {
    bg(c, { top: F ? '#2a1450' : '#1a1034', bot: '#07040f', glow: F ? 'rgba(255,230,140,.55)' : 'rgba(190,140,255,.35)', rays: F ? 'rgba(255,230,150,.14)' : null, rayN: 14, rings: 'rgba(255,224,138,.12)', stars: '#ffe08a', starN: F ? 26 : 14 });
    // cascading pale hair
    hair(c, [[22, 56], [18, 30], [30, 14], [50, 10], [70, 14], [82, 30], [78, 56], [84, 86], [74, 100], [26, 100], [16, 86]], '#fff0dc', { hi: '#ffffff', lo: '#cfae9a', gloss: [[26, 30, 30, 60, 24, 90], [74, 30, 70, 60, 76, 90]] });
    shoulders(c, '#5a3a7a', { trim: '#ffe08a' });
    shape(c, [[36, 78], [50, 92], [64, 78], [58, 100], [42, 100]], '#3a1c58', { line: 1.2 });
    c.fillStyle = '#ffe08a'; circ(c, 50, 90, 2.4, '#ffe08a');
    const P = head(c, { skin: '#f0d8c8', w: 18.5, chin: 76, jaw: .75, blush: true });
    const bangs = [[31, 46], [30, 30], [40, 22], [50, 18], [60, 22], [70, 30], [69, 46], [65, 34], [60, 40], [55, 28], [50, 40], [45, 28], [40, 40], [35, 34]];
    under(c, P, () => { path(c, bangs); c.fillStyle = '#000'; c.fill(); }, 2.4, .2);
    if (!F) {
      shape(c, [[30, 45], [70, 45], [68, 57], [50, 59], [32, 57]], ['#ffe9a0', '#d2a640'], { line: 1.5 });
      add(c, () => glow(c, 50, 51, 8, 'rgba(255,230,140,.7)'));
      shape(c, [[41, 51], [50, 46], [59, 51], [50, 56]], '#2a1048', { line: 1 }); circ(c, 50, 51, 2.4, '#ffe08a');
      mouth(c, 'tiny', { y: 67 });
    } else {
      eyes(c, { y: 51, d: 10.4, w: 7, h: 6.6, iris: '#fff2b0', white: '#fffaf0', glow: 'rgba(255,230,140,.9)', ring: '#c8901a', pupil: false, irisW: .8 });
      for (const s of [-1, 1]) { star(c, 50 + s * 10.4, 51, 3.2, '#8a4cd0'); }
      brows(c, { y: 42, tilt: .2, col: '#cfae9a', len: 8 });
      mouth(c, 'smile', { y: 67, w: 4.5 });
      shape(c, [[46, 27], [50, 22], [54, 27], [50, 32]], '#ffe08a', { line: 1 }); circ(c, 50, 27, 1.8, '#2a1048');
    }
    nose(c);
    hair(c, bangs, '#fff6e8', { hi: '#fff', lo: '#d6b8a4', gloss: [[38, 26, 50, 22, 62, 26]] });
    if (!F) add(c, () => { for (const [x, y] of [[12, 40], [88, 52], [16, 74]]) glow(c, x, y, 6, 'rgba(255,224,138,.8)'); });
    else { for (const [x, y] of [[12, 40], [88, 52], [16, 74], [86, 22]]) { add(c, () => glow(c, x, y, 8, 'rgba(255,224,138,.9)')); circ(c, x, y, 2.4, '#fff3c0'); } }
  };

  // ---- AURELION: the highest angel; awakened = Ascendant, plus a Fallen drawing ------------------
  FACE.aurelion = (c, F, d) => {
    const Fl = d && d.portraitId === 'aurelion_fallen';
    const gold = Fl ? '#7a1a30' : '#ffd35a', skyT = Fl ? '#2a0610' : F ? '#3a2a08' : '#1a2448', skyB = Fl ? '#060104' : F ? '#120a02' : '#080a18';
    bg(c, { top: skyT, bot: skyB, glow: Fl ? 'rgba(220,40,60,.45)' : F ? 'rgba(255,220,110,.6)' : 'rgba(255,230,160,.35)', rays: Fl ? 'rgba(200,30,50,.12)' : 'rgba(255,230,150,.15)', rayN: 16, stars: Fl ? '#ff7a8a' : '#fff0b0' });
    // wings behind
    for (const s of [-1, 1]) for (let i = 0; i < (F || Fl ? 4 : 3); i++) {
      const y0 = 78 - i * 6, tipX = 50 + s * (90 - i * 6), tipY = 20 + i * 14;
      shape(c, [[50 + s * 20, y0], [50 + s * 40, y0 - 24], [tipX, tipY], [50 + s * (70 - i * 4), y0 + 6]], Fl ? ['#3a1020', '#12040a'] : ['#ffffff', '#c8d0e4'], { smooth: true, line: 1.2, shine: false });
    }
    hair(c, [[22, 52], [18, 30], [30, 14], [50, 10], [70, 14], [82, 30], [78, 52], [84, 80], [74, 96], [26, 96], [16, 80]], Fl ? '#2a1a28' : '#ffe27a', { hi: Fl ? '#6a4a60' : '#fff6b8', lo: Fl ? '#0e060e' : '#c89a24' });
    shoulders(c, Fl ? '#2a1218' : '#f4efe0', { trim: gold });
    for (const s of [-1, 1]) shape(c, [[50 + s * 20, 84], [50 + s * 28, 72], [50 + s * 44, 70], [50 + s * 48, 88]], [Fl ? '#6a1a2a' : '#ffe08a', Fl ? '#240812' : '#b88a20'], { line: 1.4 });
    shape(c, [[40, 78], [50, 88], [60, 78], [56, 98], [44, 98]], Fl ? '#12060a' : '#fff', { line: 1.1 });
    const P = head(c, { skin: Fl ? '#cdb8b8' : '#fbeedd', w: 18.5, chin: 76, jaw: .72 });
    const bangs = [[31, 46], [30, 30], [40, 22], [50, 18], [60, 22], [70, 30], [69, 46], [66, 34], [60, 44], [54, 30], [50, 42], [46, 30], [40, 44], [34, 34]];
    under(c, P, () => { path(c, bangs); c.fillStyle = '#000'; c.fill(); });
    const eyeCol = Fl ? '#ff2a40' : F ? '#fff0a0' : '#6aa8ff';
    eyes(c, { y: 52, d: 10.2, w: 6.8, h: 5.4, iris: eyeCol, glow: (F || Fl) ? hexA(eyeCol, .7) : null, lid: .2, tilt: -.5, pupil: !F });
    brows(c, { y: 43, tilt: -.7, col: Fl ? '#1a0a10' : '#b88a24', len: 8 });
    mouth(c, Fl ? 'frown' : 'grim', { y: 67.5, w: 4.5 }); nose(c);
    hair(c, bangs, Fl ? '#3a2438' : '#ffeb8a', { hi: Fl ? '#8a6080' : '#fffbd0', lo: Fl ? '#14080e' : '#d4a62c', gloss: [[38, 28, 50, 24, 62, 28]] });
    // halo
    c.save(); c.strokeStyle = Fl ? '#2a0408' : gold; c.lineWidth = F ? 3.2 : 2.6; c.beginPath(); c.ellipse(50, 12, F ? 24 : 18, F ? 6 : 4.5, 0, 0, 7); c.stroke(); c.strokeStyle = Fl ? '#ff2a40' : '#fff6c0'; c.lineWidth = .9; c.beginPath(); c.ellipse(50, 11.4, F ? 24 : 18, F ? 6 : 4.5, 0, Math.PI, 7); c.stroke(); c.restore();
    add(c, () => glow(c, 50, 12, F ? 26 : 18, Fl ? 'rgba(255,40,60,.35)' : 'rgba(255,230,140,.5)'));
    if (Fl) { c.strokeStyle = '#ff2a40'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(61, 40); c.lineTo(58, 52); c.lineTo(62, 62); c.stroke(); }
  };
})();

(() => {
  const { sh, shape, circ, ell, add, glow, star, spark, bg, head, under, eye, eyes, shut, brow, brows, nose, mouth, shoulders, hair, path, OL } = AF;
  const bangsOf = (n) => n; // placeholder to keep intent obvious

  // ---- ERIC: spiky-haired college kid; awakened = MOONKAI the ape under a blood moon -------------
  FACE.eric = (c, F) => {
    if (!F) {
      bg(c, { top: '#1c2a58', bot: '#080a1a', glow: 'rgba(120,160,255,.4)', streak: 'rgba(140,180,255,.16)', stars: '#fff' });
      circ(c, 80, 20, 11, '#eef2ff'); circ(c, 76, 18, 3, '#cfd6f0'); add(c, () => glow(c, 80, 20, 26, 'rgba(200,220,255,.45)'));
      hair(c, [[24, 58], [18, 38], [10, 24], [24, 28], [22, 8], [36, 20], [44, 2], [52, 18], [64, 4], [66, 22], [80, 10], [78, 30], [90, 30], [82, 46], [76, 60]], '#1a1620', { hi: '#4a4660', lo: '#08060c', gloss: [[30, 30, 44, 14, 60, 22]], noStrands: true });
      shoulders(c, '#2c58b8', { trim: '#9ac0ff' });
      shape(c, [[26, 78], [50, 84], [74, 78], [80, 96], [20, 96]], ['#d8343a', '#8a1420'], { line: 1.3 });
      shape(c, [[34, 80], [50, 92], [66, 80], [62, 100], [38, 100]], '#c42a34', { line: 1.1 });
      const P = head(c, { skin: '#f0cfa8', w: 19.5, chin: 76, jaw: .5 });
      const fr = [[30, 46], [29, 32], [38, 22], [50, 18], [62, 22], [71, 32], [70, 46], [66, 34], [60, 40], [56, 28], [50, 38], [44, 28], [40, 42], [36, 34], [34, 50]];
      under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
      eyes(c, { y: 52, d: 10.4, w: 6.8, h: 5.8, iris: '#7a4a24', lid: .08 });
      brows(c, { y: 42.5, tilt: -.4, col: '#1a1620' }); mouth(c, 'smile', { y: 67.5, w: 5 }); nose(c);
      hair(c, fr, '#221e2c', { hi: '#5a5674', lo: '#0a080e', gloss: [[38, 26, 48, 22, 58, 26]] });
      return;
    }
    // MOONKAI
    bg(c, { top: '#4a0c18', bot: '#0a0206', glow: 'rgba(255,90,70,.5)', stars: '#ffb0a0' });
    circ(c, 50, 36, 40, '#d84a3a'); circ(c, 50, 36, 36, '#f08a6a'); for (const [x, y, r] of [[36, 22, 6], [62, 30, 8], [44, 50, 5], [70, 10, 4]]) circ(c, x, y, r, 'rgba(160,50,40,.4)');
    shoulders(c, '#3a2412', { trim: '#7a5030' });
    for (let i = 0; i < 9; i++) shape(c, [[4 + i * 11, 100], [10 + i * 11, 80 - (i % 2) * 7], [16 + i * 11, 100]], '#4a2e18', { line: 1, shine: false });
    for (const s of [-1, 1]) { shape(c, [[50 + s * 26, 54], [50 + s * 44, 38], [50 + s * 48, 58], [50 + s * 36, 70]], '#5a3a1e', { smooth: true, line: 1.4, shine: false }); circ(c, 50 + s * 40, 54, 5, '#a87a58'); }
    // great fur head, shaggy outline
    const fur = []; for (let i = 0; i < 24; i++) { const a = Math.PI * (1 + i / 23), r = i % 2 ? 29 : 33; fur.push([50 + Math.cos(a) * r * 1.02, 44 + Math.sin(a) * r * 1.1]); }
    shape(c, [...fur, [78, 56], [72, 72], [60, 82], [50, 84], [40, 82], [28, 72], [22, 56]], ['#7a4e2a', '#3a2210'], { line: 1.7, shine: '#c89a60', shineLines: [[30, 30, 40, 16, 56, 14]] });
    // bare face + muzzle
    shape(c, [[32, 48], [40, 42], [50, 44], [60, 42], [68, 48], [68, 62], [60, 78], [50, 82], [40, 78], [32, 62]], ['#d8a878', '#a8704a'], { smooth: true, line: 1.4, shine: false });
    shape(c, [[36, 62], [44, 58], [56, 58], [64, 62], [62, 76], [50, 80], [38, 76]], ['#e8c498', '#b88458'], { smooth: true, line: 1.2, shine: false });
    shape(c, [[30, 44], [50, 49], [70, 44], [68, 38], [50, 42], [32, 38]], ['#4a2c14', '#2a1608'], { line: 1.3, shine: false });
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 11, 52, 11, 'rgba(255,60,40,.95)')); shape(c, [[50 + s * 5, 51], [50 + s * 16, 48], [50 + s * 15, 55], [50 + s * 7, 56]], '#ffd0a0', { line: 1 }); circ(c, 50 + s * 11, 52, 1.8, '#c8101c'); }
    ell(c, 50, 59, 4.6, 2.6, '#5a3220'); circ(c, 48, 59, .9, '#10080a'); circ(c, 52, 59, .9, '#10080a');
    mouth(c, 'open', { y: 68, w: 10 });
    c.fillStyle = '#fff6e4'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 7, 68); c.lineTo(50 + s * 9, 76); c.lineTo(50 + s * 4.5, 69); c.fill(); }
  };

  // ---- JINX: blue braids, pink eyes, wild grin ------------------------------------------------------
  FACE.jinx = (c, F) => {
    bg(c, { top: F ? '#4a0a3a' : '#240a3e', bot: '#07030e', glow: F ? 'rgba(255,60,170,.55)' : 'rgba(220,60,200,.32)', streak: 'rgba(60,220,255,.18)', stars: '#ffd35a' });
    const st = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); };
    st(14, 22, 8, '#ff4aa8'); st(86, 30, 9, '#ffd35a'); st(10, 62, 6, '#2ad8ff');
    if (F) { shape(c, [[50, 2], [58, 14], [72, 6], [68, 22], [90, 20], [76, 34], [96, 48], [74, 50], [84, 70], [64, 62], [60, 84], [50, 66], [40, 84], [36, 62], [16, 70], [26, 50], [4, 48], [24, 34], [10, 20], [32, 22], [28, 6], [42, 14]], '#ffd35a', { line: 1.4, shine: false }); }
    const B = F ? '#2af0ff' : '#32c8ff';
    // twin braids
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const y = 54 + i * 8, x = 50 + s * (30 - i * .8 + (i % 2 ? 2 : -1)); ell(c, x, y, 6.5, 5.2, i % 2 ? sh(B, -.15) : B); c.strokeStyle = OL; c.lineWidth = 1.1; c.beginPath(); c.ellipse(x, y, 6.5, 5.2, 0, 0, 7); c.stroke(); }
    shape(c, [[26, 56], [20, 34], [30, 16], [50, 10], [70, 16], [80, 34], [74, 56], [66, 40], [34, 40]], [sh(B, .2), sh(B, -.4)], { line: 1.4, shine: sh(B, .6), shineLines: [[30, 28, 50, 14, 70, 28]] });
    shoulders(c, '#1c1226', { trim: '#ff3aa0' });
    shape(c, [[30, 80], [70, 80], [76, 100], [24, 100]], '#ff3aa0', { line: 1.2 }); c.fillStyle = '#ffd35a'; for (let i = 0; i < 6; i++) c.fillRect(28 + i * 8.5, 90, 4, 8);
    const P = head(c, { skin: '#f8d8c4', w: 19, chin: 76, jaw: .62 });
    const bangs = [[30, 46], [29, 32], [38, 24], [50, 20], [62, 24], [71, 32], [70, 46], [66, 34], [62, 40], [58, 28], [52, 42], [46, 30], [42, 44], [38, 32], [34, 44]];
    under(c, P, () => { path(c, bangs); c.fillStyle = '#000'; c.fill(); });
    for (const s of [-1, 1]) { c.fillStyle = 'rgba(80,20,70,.35)'; c.beginPath(); c.ellipse(50 + s * 10.4, 52, 9, 7.5, 0, 0, 7); c.fill(); }
    eyes(c, { y: 52, d: 10.4, w: 7.2, h: F ? 7.6 : 6.8, iris: F ? '#ff2a9a' : '#ff5ab4', glow: F ? 'rgba(255,60,170,.8)' : null, slit: F, tilt: .6, irisW: .66 });
    brows(c, { y: 42.5, tilt: F ? -1.8 : -1, col: sh(B, -.5), len: 8.5, th: 1.5 });
    mouth(c, F ? 'open' : 'grin', { y: 66.5, w: F ? 9 : 8.5 }); nose(c);
    hair(c, bangs, B, { hi: sh(B, .45), lo: sh(B, -.4), gloss: [[36, 28, 50, 24, 64, 28]] });
    c.fillStyle = '#ff3aa0'; c.fillRect(33, 61, 1.4, 6);
  };

  // ---- KIRA SOL: flame-haired firefighter; awakened = white-hot ---------------------------------
  FACE.kira = (c, F) => {
    bg(c, { top: F ? '#6a1a04' : '#3a0c08', bot: '#0a0202', glow: F ? 'rgba(255,200,80,.7)' : 'rgba(255,100,40,.45)', rays: F ? 'rgba(255,210,100,.18)' : null, rayN: 12, streak: 'rgba(255,150,60,.18)', stars: '#ffc060', starN: 20 });
    const fl = F ? ['#ffffff', '#ffd860'] : ['#ffcc40', '#e83a14'];
    const fire = [[22, 56], [14, 40], [8, 16], [22, 28], [24, 0], [36, 20], [44, -6], [52, 18], [62, -4], [66, 20], [78, 2], [78, 28], [92, 20], [84, 44], [78, 58]];
    shape(c, fire, fl, { line: 1.4, shine: F ? '#fff' : '#ffe8a0', shineLines: [[34, 26, 44, 10, 50, 2]] });
    shoulders(c, '#c8281c', { trim: '#ffd84a' });
    shape(c, [[34, 76], [50, 88], [66, 76], [72, 92], [28, 92]], '#8a1810', { line: 1.2 });
    c.fillStyle = '#ffd84a'; c.fillRect(8, 90, 84, 4); c.fillRect(8, 96, 84, 2);
    const P = head(c, { skin: '#e0a870', w: 19.5, chin: 76, jaw: .6 });
    const fr = [[30, 46], [29, 32], [36, 24], [46, 12], [52, 22], [58, 8], [64, 22], [72, 28], [70, 46], [66, 36], [62, 42], [56, 30], [50, 40], [44, 30], [38, 42], [34, 34]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    eyes(c, { y: 52, d: 10.4, w: 6.8, h: 5.4, iris: F ? '#ffffff' : '#ffb028', glow: F ? 'rgba(255,240,180,.9)' : null, lid: .1, tilt: -.4, white: F ? '#fff6d0' : undefined });
    brows(c, { y: 43, tilt: -1, col: '#8a2a10', len: 8.5 });
    mouth(c, 'grin', { y: 66.5, w: 7 }); nose(c); c.fillStyle = 'rgba(60,30,10,.4)'; c.fillRect(60, 56, 6, 1.2);
    hair(c, fr, fl[0], { hi: F ? '#fff' : '#ffe27a', lo: F ? '#ffd860' : '#e8481a', gloss: [[36, 24, 46, 20, 56, 24]] });
    add(c, () => { for (const [x, y] of [[14, 70], [88, 62], [8, 40], [92, 40]]) glow(c, x, y, 7, 'rgba(255,170,50,.8)'); });
  };

  // ---- DIO: blond, green headband, menacing; awakened = time stands still ------------------------
  FACE.dio = (c, F) => {
    bg(c, { top: F ? '#3a2a04' : '#3a0c4a', bot: '#0a0210', glow: F ? 'rgba(255,220,90,.55)' : 'rgba(200,60,255,.4)', stars: '#fff' });
    if (F) { c.save(); c.strokeStyle = 'rgba(255,224,120,.55)'; c.lineWidth = 2; c.beginPath(); c.arc(50, 44, 40, 0, 7); c.stroke(); c.lineWidth = 1; for (let i = 0; i < 12; i++) { const a = i / 12 * 7; c.beginPath(); c.moveTo(50 + Math.cos(a) * 34, 44 + Math.sin(a) * 34); c.lineTo(50 + Math.cos(a) * 40, 44 + Math.sin(a) * 40); c.stroke(); } c.lineWidth = 2; c.beginPath(); c.moveTo(50, 44); c.lineTo(50, 14); c.moveTo(50, 44); c.lineTo(70, 54); c.stroke(); c.restore(); }
    else { c.fillStyle = 'rgba(255,90,220,.5)'; for (const [x, y, a] of [[10, 22, 1], [86, 18, -1], [8, 60, -1], [90, 56, 1]]) { c.save(); c.translate(x, y); c.rotate(a * .25); for (let i = 0; i < 3; i++) { c.fillRect(0, i * 7, 10 - i * 2, 3); c.fillRect(0, i * 7 + 3, 3, 5); } c.restore(); } }
    hair(c, [[24, 58], [18, 38], [24, 18], [40, 6], [58, 4], [74, 14], [82, 32], [78, 58], [68, 44], [34, 44]], '#ffe040', { hi: '#fff6a0', lo: '#c89a10' });
    shoulders(c, '#202018', { trim: '#ffd84a' });
    for (const s of [-1, 1]) shape(c, [[50 + s * 22, 84], [50 + s * 28, 72], [50 + s * 46, 74], [50 + s * 48, 90]], ['#ffe24a', '#b89010'], { line: 1.4 });
    shape(c, [[38, 76], [50, 90], [62, 76], [60, 100], [40, 100]], '#1a8a3a', { line: 1.2 });
    c.fillStyle = '#ffd84a'; c.beginPath(); c.moveTo(50, 98); c.lineTo(44, 90); c.lineTo(56, 90); c.fill();
    const P = head(c, { skin: '#f4dcc4', w: 19, chin: 77, jaw: .8 });
    const fr = [[31, 46], [30, 34], [38, 24], [50, 18], [64, 22], [71, 32], [70, 46], [66, 36], [60, 34], [54, 40], [46, 30], [40, 40], [35, 38]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    eyes(c, { y: 52.5, d: 10.4, w: 7, h: 4.8, iris: F ? '#ff2a30' : '#d03a50', glow: F ? 'rgba(255,60,50,.8)' : null, lid: .3, tilt: -1.2, white: '#fff0e8' });
    brows(c, { y: 42.5, tilt: -2, col: '#c89a10', len: 9, th: 2.2 });
    mouth(c, F ? 'grin' : 'smirk', { y: 67.5, w: F ? 8 : 6.5 }); nose(c);
    shape(c, [[30, 28], [70, 28], [71, 38], [29, 38]], '#2aa84a', { line: 1.4, shine: false }); c.fillStyle = '#ffd84a'; c.beginPath(); c.moveTo(50, 40); c.lineTo(44, 32); c.lineTo(50, 28); c.lineTo(56, 32); c.fill(); c.strokeStyle = OL; c.lineWidth = 1; c.stroke();
    hair(c, [[29, 30], [34, 22], [50, 16], [66, 22], [71, 30], [66, 28], [50, 24], [34, 28]], '#ffe848', { hi: '#fffbb0', lo: '#c89a10', noStrands: true, shine: false });
    hair(c, [[32, 38], [36, 52], [31, 56], [29, 40]], '#ffe848', { hi: '#fffbb0', lo: '#c89a10', shine: false });
    hair(c, [[68, 38], [64, 52], [69, 56], [71, 40]], '#ffe848', { hi: '#fffbb0', lo: '#c89a10', shine: false });
  };

  // ---- YUJI: pink-brown spikes; awakened = Sukuna's marks and second pair of eyes ----------------
  FACE.yuji = (c, F) => {
    bg(c, { top: F ? '#3a0814' : '#1a2448', bot: '#06060e', glow: F ? 'rgba(255,40,60,.55)' : 'rgba(255,150,120,.28)', streak: F ? 'rgba(255,60,60,.2)' : 'rgba(255,255,255,.1)', stars: F ? '#ff8a8a' : '#fff' });
    const H = F ? '#ff8ab0' : '#f08a7a';
    hair(c, [[24, 56], [16, 40], [10, 22], [24, 26], [24, 8], [36, 18], [46, 2], [54, 16], [66, 4], [68, 20], [82, 12], [78, 32], [90, 36], [80, 50], [76, 58]], H, { hi: sh(H, .35), lo: sh(H, -.35), gloss: [[32, 28, 44, 12, 62, 20]], noStrands: true });
    shoulders(c, '#1c2858', { trim: '#e03a3a' });
    shape(c, [[26, 78], [74, 78], [86, 98], [14, 98]], ['#e8403a', '#8a1418'], { line: 1.3 }); shape(c, [[38, 76], [50, 90], [62, 76], [58, 100], [42, 100]], '#16204a', { line: 1.1 });
    c.fillStyle = '#fff'; c.fillRect(48, 92, 4, 8);
    const P = head(c, { skin: '#f4cfa8', w: 19.5, chin: 76, jaw: .55 });
    const fr = [[30, 46], [29, 32], [38, 22], [50, 18], [62, 22], [71, 32], [70, 46], [66, 34], [62, 40], [58, 26], [52, 38], [46, 28], [42, 40], [38, 30], [34, 44]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    if (F) { c.strokeStyle = '#1a0a10'; c.lineWidth = 2.2; c.lineCap = 'round'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 5, 48); c.quadraticCurveTo(50 + s * 14, 62, 50 + s * 17, 58); c.stroke(); c.beginPath(); c.moveTo(50 + s * 8, 40); c.lineTo(50 + s * 15, 44); c.stroke(); } c.beginPath(); c.moveTo(50, 28); c.lineTo(50, 40); c.stroke(); for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(42, 70 + i * 2); c.lineTo(58, 70 + i * 2); c.stroke(); } }
    eyes(c, { y: 52, d: 10.4, w: 6.8, h: 5.6, iris: F ? '#e83030' : '#7a4a2a', white: F ? '#1a0a10' : undefined, glow: F ? 'rgba(255,50,40,.7)' : null, lid: F ? .22 : .06, tilt: F ? -.8 : -.2 });
    if (F) eyes(c, { y: 60, d: 6.4, w: 3.8, h: 3, iris: '#e83030', white: '#1a0a10', s: 1, lid: .1, glow: 'rgba(255,50,40,.5)' });
    brows(c, { y: 42.5, tilt: F ? -1.8 : -.9, col: sh(H, -.35), len: 8.5 });
    mouth(c, F ? 'grin' : 'smile', { y: F ? 69 : 67, w: F ? 9 : 5 }); if (!F) nose(c);
    hair(c, fr, H, { hi: sh(H, .4), lo: sh(H, -.35), gloss: [[38, 26, 48, 22, 58, 26]] });
  };

  // ---- DARIUS: the Hand of Noxus; awakened = blood-red hemorrhage ------------------------------------
  FACE.darius = (c, F) => {
    bg(c, { top: F ? '#4a0808' : '#2a1018', bot: '#080204', glow: F ? 'rgba(255,40,30,.6)' : 'rgba(200,60,40,.3)', streak: 'rgba(255,80,60,.14)', stars: '#ff9a8a', starN: 10 });
    // axe head behind the shoulder
    shape(c, [[74, 4], [96, 10], [98, 40], [84, 56], [78, 44], [80, 26]], ['#e0e4ee', '#6a7084'], { line: 1.5, shine: '#fff', shineLines: [[78, 10, 90, 20, 92, 36]] });
    c.strokeStyle = '#3a2418'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(80, 44); c.lineTo(70, 100); c.stroke();
    shape(c, [[0, 100], [2, 84], [16, 76], [34, 74], [66, 74], [84, 76], [98, 84], [100, 100]], ['#5a1a22', '#240a0e'], { line: 1.5 });
    for (const s of [-1, 1]) { shape(c, [[50 + s * 16, 86], [50 + s * 26, 70], [50 + s * 46, 66], [50 + s * 50, 88], [50 + s * 36, 100]], ['#7a828e', '#2c3038'], { line: 1.6, shine: '#fff', shineLines: [[50 + s * 28, 74, 50 + s * 38, 70, 50 + s * 44, 74]] }); for (const k of [0, 1]) shape(c, [[50 + s * (32 + k * 8), 70 - k], [50 + s * (36 + k * 8), 56 - k * 4], [50 + s * (40 + k * 8), 68 - k]], '#9aa2b0', { line: 1.2, shine: false }); }
    const P = head(c, { skin: '#c89472', w: 21, chin: 77, jaw: .25, top: 26 });
    // short black hair + heavy brow
    const hr = [[28, 44], [28, 32], [36, 24], [50, 20], [64, 24], [72, 32], [72, 44], [68, 36], [50, 32], [32, 36]];
    hair(c, hr, '#1c1010', { hi: '#4a3030', lo: '#080404', noStrands: true });
    c.save(); c.clip(P); const bg2 = c.createLinearGradient(0, 62, 0, 78); bg2.addColorStop(0, 'rgba(30,18,16,0)'); bg2.addColorStop(1, 'rgba(30,18,16,.7)'); c.fillStyle = bg2; c.fillRect(20, 62, 60, 18); c.restore();
    eyes(c, { y: 52, d: 11, w: 6.6, h: 4.4, iris: F ? '#ff3020' : '#6a3a28', glow: F ? 'rgba(255,50,30,.85)' : null, lid: .32, tilt: -1.2, white: F ? '#ffd8c8' : undefined });
    brows(c, { y: 44, tilt: -2.4, col: '#140a0a', len: 10, th: 2.8, d: 11 });
    c.strokeStyle = '#7a2a2a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(62, 40); c.lineTo(66, 52); c.lineTo(63, 60); c.stroke(); c.strokeStyle = '#ffd0c0'; c.lineWidth = .7; c.beginPath(); c.moveTo(62.5, 41); c.lineTo(66.5, 52); c.stroke();
    mouth(c, F ? 'snarl' : 'frown', { y: 68, w: 7 }); nose(c, { y: 60.5 });
    if (F) { c.strokeStyle = 'rgba(255,40,30,.9)'; c.lineWidth = 1; for (const p of [[34, 50, 30, 60, 34, 70], [66, 66, 70, 58, 68, 50], [50, 30, 52, 36, 50, 40]]) { c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[2], p[3]); c.lineTo(p[4], p[5]); c.stroke(); } add(c, () => { for (const [x, y] of [[20, 50], [80, 60], [50, 8]]) glow(c, x, y, 12, 'rgba(255,40,30,.55)'); }); }
  };

  // ---- YHWACH: the Quincy king -----------------------------------------------------------------------
  FACE.yhwach = (c, F) => {
    bg(c, { top: F ? '#0c1a3a' : '#120a1c', bot: '#020204', glow: F ? 'rgba(160,210,255,.5)' : 'rgba(150,80,200,.35)', rays: F ? 'rgba(200,230,255,.16)' : null, rayN: 18, stars: '#d0e0ff' });
    if (F) for (const [x, h] of [[18, 40], [30, 54], [42, 62], [58, 62], [70, 54], [82, 40]]) shape(c, [[x - 5, 52], [x, 52 - h], [x + 5, 52]], ['#ffffff', '#aab8d0'], { line: 1.2, shine: false });
    hair(c, [[22, 56], [14, 30], [26, 10], [50, 6], [74, 10], [86, 30], [78, 56], [90, 96], [10, 96]], '#14101c', { hi: '#4a4060', lo: '#04030a', gloss: [[26, 30, 22, 60, 16, 90], [74, 30, 78, 60, 84, 90]], noStrands: true });
    shoulders(c, '#1a1424', { trim: '#d8d0e8' });
    shape(c, [[22, 80], [38, 74], [38, 96], [26, 98]], '#e8e4f0', { line: 1.3 }); shape(c, [[78, 80], [62, 74], [62, 96], [74, 98]], '#e8e4f0', { line: 1.3 });
    shape(c, [[40, 76], [50, 88], [60, 76], [58, 100], [42, 100]], '#08060c', { line: 1.1 });
    const P = head(c, { skin: '#e8d4c2', w: 18.5, chin: 77, jaw: .85, blush: false });
    const fr = [[31, 46], [30, 32], [40, 22], [50, 16], [60, 22], [70, 32], [69, 46], [64, 34], [60, 50], [55, 30], [50, 44], [45, 30], [40, 50], [36, 34]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    eyes(c, { y: 52.5, d: 10, w: 6.6, h: 4.4, iris: F ? '#e8f4ff' : '#d8a028', glow: F ? 'rgba(200,230,255,.9)' : 'rgba(255,200,60,.4)', lid: .34, tilt: -.9, white: F ? '#ffffff' : '#f0e4d0', pupil: !F, slit: true });
    brows(c, { y: 44, tilt: -1.6, col: '#08060c', len: 8.5, th: 2.2 });
    c.strokeStyle = '#14101c'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(42, 66); c.quadraticCurveTo(50, 63.5, 58, 66); c.stroke(); c.fillStyle = '#14101c'; c.beginPath(); c.moveTo(46, 72); c.lineTo(54, 72); c.lineTo(50, 78); c.fill();
    mouth(c, 'grim', { y: 68, w: 4 }); nose(c);
    hair(c, fr, '#1a1424', { hi: '#5a5070', lo: '#06040c', gloss: [[38, 24, 50, 20, 62, 24]] });
    if (F) { c.strokeStyle = '#05050a'; c.lineWidth = 1.6; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 10, 57); c.lineTo(50 + s * 11, 66); c.stroke(); } add(c, () => glow(c, 50, 8, 16, 'rgba(210,235,255,.55)')); }
  };
})();

(() => {
  const { sh, shape, circ, ell, add, glow, star, spark, bg, head, under, eye, eyes, shut, brow, brows, nose, mouth, shoulders, hair, path, OL } = AF;

  // ---- GRIMM: the reaper on temp work; awakened = the job is his now ----------------------------------
  FACE.grimm = (c, F) => {
    const G = F ? 'rgba(120,255,170,' : 'rgba(110,230,150,';
    bg(c, { top: F ? '#082a1a' : '#0c1612', bot: '#020402', glow: G + (F ? '.55)' : '.3)'), rings: G + '.1)', stars: '#a8ffc8', starN: F ? 24 : 12 });
    // scythe
    c.strokeStyle = '#3a3028'; c.lineWidth = 3; c.beginPath(); c.moveTo(86, 100); c.lineTo(76, 8); c.stroke();
    shape(c, [[76, 8], [50, 2], [34, 16], [48, 12], [68, 16]], ['#e8f0ec', '#6a7a74'], { line: 1.4, shine: false });
    add(c, () => { c.strokeStyle = G + '.9)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(70, 14); c.quadraticCurveTo(50, 8, 38, 16); c.stroke(); });
    // hood
    shape(c, [[16, 96], [12, 60], [20, 30], [36, 12], [50, 8], [64, 12], [80, 30], [88, 60], [84, 96]], ['#1c1c20', '#050507'], { smooth: true, line: 1.7, shine: '#6a6a78', shineLines: [[24, 36, 34, 16, 50, 12]] });
    for (const s of [-1, 1]) shape(c, [[50 + s * 36, 100], [50 + s * 40, 86], [50 + s * 34, 74], [50 + s * 20, 82]], '#0a0a0e', { smooth: true, line: 1.2, shine: false });
    shape(c, [[26, 56], [30, 34], [42, 22], [50, 20], [58, 22], [70, 34], [74, 56], [66, 84], [50, 90], [34, 84]], '#020203', { smooth: true, line: 1.2 });
    // skull
    const sk = ['#fffcee', '#cfc8b0'];
    shape(c, [[32, 54], [32, 36], [42, 26], [50, 24], [58, 26], [68, 36], [68, 54], [62, 62], [60, 74], [40, 74], [38, 62]], sk, { smooth: true, line: 1.5, shine: false });
    for (const s of [-1, 1]) { shape(c, [[50 + s * 4, 48], [50 + s * 16, 44], [50 + s * 17, 56], [50 + s * 8, 60]], '#04080a', { smooth: true, line: 1.2, shine: false }); add(c, () => glow(c, 50 + s * 10.5, 52, F ? 13 : 9, G + '1)')); circ(c, 50 + s * 10.5, 52, F ? 3.2 : 2.4, F ? '#eafff0' : '#9affc0'); }
    shape(c, [[46, 62], [50, 56], [54, 62], [50, 65]], '#04080a', { line: 1, shine: false });
    c.fillStyle = '#04080a'; c.fillRect(38, 70, 24, 6); c.fillStyle = '#fffcee'; for (let x = 39; x < 61; x += 3.6) c.fillRect(x, 70, 2.4, 6);
    c.strokeStyle = 'rgba(60,50,30,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(37, 34); c.lineTo(41, 42); c.lineTo(38, 48); c.stroke();
    if (F) { c.strokeStyle = G + '.95)'; add(c, () => { c.lineWidth = 1.3; c.beginPath(); c.moveTo(60, 28); c.lineTo(56, 38); c.lineTo(62, 46); c.stroke(); }); add(c, () => { for (const [x, y] of [[26, 30], [74, 26], [50, 6], [18, 60], [82, 56]]) glow(c, x, y, 9, G + '.6)'); }); }
  };

  // ---- LEO: the lion king; awakened = the mane catches fire --------------------------------------------
  FACE.leo = (c, F) => {
    bg(c, { top: F ? '#6a3004' : '#3a1c08', bot: '#0a0402', glow: F ? 'rgba(255,220,110,.7)' : 'rgba(255,170,60,.38)', rays: F ? 'rgba(255,230,130,.2)' : 'rgba(255,200,100,.08)', rayN: 14, stars: '#ffe0a0' });
    const M = F ? ['#fff0a0', '#ff9a20'] : ['#b86a24', '#4a240c'];
    // mane
    const mane = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2 + .1, r = i % 2 ? 36 : 54 + (i % 4 === 0 ? 4 : 0); mane.push([50 + Math.cos(a) * r, 54 + Math.sin(a) * r * .94]); }
    shape(c, mane, M, { line: 1.7, shine: F ? '#fff' : '#e8a050', shineLines: [[24, 30, 34, 14, 52, 8], [76, 34, 70, 20, 58, 12]] });
    shape(c, [[0, 100], [4, 88], [20, 82], [80, 82], [96, 88], [100, 100]], ['#9a2a1a', '#3a0c08'], { line: 1.5 }); c.fillStyle = '#ffd35a'; c.fillRect(0, 92, 100, 3);
    c.save(); c.translate(50, 56); c.scale(1.2, 1.2); c.translate(-50, -56);
    // ears
    for (const s of [-1, 1]) { shape(c, [[50 + s * 20, 28], [50 + s * 26, 14], [50 + s * 36, 24], [50 + s * 32, 38]], '#c88a40', { smooth: true, line: 1.4, shine: false }); shape(c, [[50 + s * 24, 28], [50 + s * 27, 20], [50 + s * 31, 28]], '#e8b0a0', { line: 0, shine: false }); }
    // face
    shape(c, [[28, 52], [30, 36], [42, 28], [50, 27], [58, 28], [70, 36], [72, 52], [66, 70], [56, 80], [50, 82], [44, 80], [34, 70]], ['#e8b868', '#b87c36'], { smooth: true, line: 1.6, shine: false });
    ell(c, 50, 66, 15, 11, '#f8e0b0'); c.strokeStyle = OL; c.lineWidth = 1.2; c.beginPath(); c.ellipse(50, 66, 15, 11, 0, 0, 7); c.stroke();
    shape(c, [[43, 54], [57, 54], [53, 62], [50, 64], [47, 62]], '#3a1c18', { smooth: true, line: 1.2, shine: false });
    c.strokeStyle = OL; c.lineWidth = 1.4; c.beginPath(); c.moveTo(50, 62); c.lineTo(50, 68); c.moveTo(50, 68); c.quadraticCurveTo(44, 74, 38, 70); c.moveTo(50, 68); c.quadraticCurveTo(56, 74, 62, 70); c.stroke();
    c.fillStyle = '#fff'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 5, 71); c.lineTo(50 + s * 6.4, 77); c.lineTo(50 + s * 8, 71); c.fill(); }
    c.fillStyle = 'rgba(60,30,10,.5)'; for (const s of [-1, 1]) for (const [dx, dy] of [[8, 62], [11, 65], [8, 68]]) c.fillRect(50 + s * dx, dy, 1.4, 1.4);
    // brow + eyes
    shape(c, [[30, 44], [50, 47], [70, 44], [68, 38], [50, 40], [32, 38]], '#8a4a18', { line: 1.2, shine: false });
    eyes(c, { y: 50, d: 12, w: 6.2, h: 4.6, iris: F ? '#ffffff' : '#ffb020', glow: F ? 'rgba(255,240,160,.9)' : 'rgba(255,160,30,.45)', lid: .28, tilt: -1.2, slit: true, white: F ? '#fff6c0' : '#f8e8c0' });
    // scars
    c.strokeStyle = '#6a2a14'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(36, 40); c.lineTo(40, 56); c.stroke();
    // crown
    shape(c, [[34, 30], [38, 14], [44, 24], [50, 8], [56, 24], [62, 14], [66, 30]], ['#ffe27a', '#c8941c'], { line: 1.5, shine: '#fff', shineLines: [[40, 24, 50, 18, 60, 24]] });
    circ(c, 50, 20, 2.2, '#e83a3a'); circ(c, 42, 25, 1.4, '#3ad8ff'); circ(c, 58, 25, 1.4, '#3ad8ff');
    c.restore();
  };

  // ---- BLOSSOM: the rooftop botanist; awakened = the forest wears her -------------------------------------
  FACE.blossom = (c, F) => {
    bg(c, { top: F ? '#0e3a18' : '#16341e', bot: '#04100a', glow: F ? 'rgba(160,255,140,.6)' : 'rgba(200,255,170,.35)', rays: 'rgba(220,255,180,.12)', rayN: 10, stars: '#ffd0ec', starN: F ? 26 : 12 });
    // big flower behind
    if (F) for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; ell(c, 50 + Math.cos(a) * 30, 40 + Math.sin(a) * 30, 14, 7, i % 2 ? '#ff9ad0' : '#ffc0e0', a); }
    const P0 = '#ff7ac0';
    hair(c, [[22, 58], [16, 34], [28, 14], [50, 8], [72, 14], [84, 34], [78, 58], [86, 86], [76, 98], [24, 98], [14, 86]], P0, { hi: '#ffc0e4', lo: '#b83a8a', gloss: [[24, 30, 28, 60, 22, 88], [76, 30, 72, 60, 78, 88]] });
    shoulders(c, '#4aa84a', { trim: '#c8ff9a' });
    shape(c, [[36, 78], [50, 90], [64, 78], [60, 100], [40, 100]], '#e8ffd0', { line: 1.1 });
    for (const [x, y] of [[26, 88], [74, 92]]) { shape(c, [[x, y], [x + 8, y - 8], [x + 12, y + 2]], '#8aff6a', { line: 1.1, shine: false }); }
    const P = head(c, { skin: '#f2d4b8', w: 19, chin: 76, jaw: .5 });
    const bangs = [[30, 46], [29, 32], [38, 22], [50, 18], [62, 22], [71, 32], [70, 46], [66, 36], [60, 42], [56, 30], [50, 44], [44, 30], [40, 42], [36, 34]];
    under(c, P, () => { path(c, bangs); c.fillStyle = '#000'; c.fill(); });
    eyes(c, { y: 52, d: 10.4, w: 7, h: 6.2, iris: F ? '#9aff7a' : '#4aa84a', glow: F ? 'rgba(150,255,120,.7)' : null, lid: .06, irisW: .64 });
    brows(c, { y: 42.5, tilt: .2, col: '#b83a8a', len: 8 }); mouth(c, 'smile', { y: 67, w: 5 }); nose(c);
    hair(c, bangs, P0, { hi: '#ffc0e4', lo: '#b83a8a', gloss: [[36, 26, 50, 22, 64, 26]] });
    // leaf crown + blossoms
    for (const [x, y, r] of [[30, 26, -.8], [38, 18, -.3], [62, 18, .3], [70, 26, .8]]) { c.save(); c.translate(x, y); c.rotate(r); shape(c, [[0, 0], [5, -5], [10, 0], [5, 5]], '#6aff6a', { line: 1.1, shine: false }); c.restore(); }
    for (const [x, y, r] of [[48, 12, 4.4], [24, 36, 3.4], [78, 38, 3.4]]) { for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; ell(c, x + Math.cos(a) * r * .7, y + Math.sin(a) * r * .7, r * .6, r * .45, '#fff0f8', a); } circ(c, x, y, r * .35, '#ffd35a'); }
    if (F) add(c, () => { for (const [x, y] of [[10, 30], [90, 50], [14, 70], [86, 80]]) glow(c, x, y, 7, 'rgba(180,255,150,.8)'); });
  };

  // ---- ZEPHYR: the sky monk; awakened = eyes open, the wind obeys -------------------------------------------
  FACE.zephyr = (c, F) => {
    bg(c, { top: F ? '#0e5a5a' : '#2a6a8a', bot: '#082030', glow: F ? 'rgba(170,255,230,.6)' : 'rgba(210,250,255,.4)', stars: '#e8ffff', starN: 10 });
    c.save(); c.strokeStyle = F ? 'rgba(200,255,240,.7)' : 'rgba(230,255,255,.45)'; c.lineWidth = 2; c.lineCap = 'round'; for (const [x, y, r, a] of [[24, 30, 18, 0], [78, 26, 14, 1], [20, 70, 12, 2], [84, 62, 18, 3], [50, 6, 12, 4]]) { c.beginPath(); c.arc(x, y, r, a, a + 4.2); c.stroke(); c.beginPath(); c.arc(x, y, r * .6, a + 1, a + 4.6); c.stroke(); } c.restore();
    shoulders(c, '#e8f8f0', { trim: '#8ad0b0' });
    shape(c, [[26, 80], [50, 96], [74, 80], [86, 100], [14, 100]], '#aaffdd', { line: 1.3 }); shape(c, [[40, 74], [50, 86], [60, 74], [56, 100], [44, 100]], '#8ad0b0', { line: 1.1 });
    const P = head(c, { skin: '#e8c8a8', w: 18.5, chin: 76, jaw: .55, top: 22, ears: true });
    c.save(); c.clip(P); const hg = c.createLinearGradient(0, 22, 0, 36); hg.addColorStop(0, 'rgba(255,255,255,.35)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = hg; c.fillRect(20, 20, 60, 16); c.restore();
    // forehead leaf mark
    shape(c, [[50, 28], [54, 34], [50, 40], [46, 34]], F ? '#aaffdd' : '#3a8a6a', { line: 1, shine: false });
    if (F) { add(c, () => glow(c, 50, 34, 8, 'rgba(170,255,230,.9)')); c.strokeStyle = '#3a8a6a'; c.lineWidth = 1.2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 5, 46); c.quadraticCurveTo(50 + s * 14, 50, 50 + s * 16, 40); c.stroke(); } }
    if (F) eyes(c, { y: 52, d: 10, w: 6.6, h: 5.4, iris: '#aaffdd', glow: 'rgba(170,255,230,.9)', pupil: false, white: '#e8fff8', lid: .16, tilt: -.3 });
    else { shut(c, 39.5, 52, 6.4); shut(c, 60.5, 52, 6.4); }
    brows(c, { y: 43, tilt: F ? -.5 : .1, col: '#7a6a5a', len: 8, th: 1.4 });
    mouth(c, F ? 'smirk' : 'tiny', { y: 67 }); nose(c);
    // scarf
    shape(c, [[32, 76], [50, 86], [68, 76], [72, 84], [54, 94], [46, 94], [28, 84]], '#aaffdd', { line: 1.3 });
    shape(c, [[58, 88], [74, 90], [90, 100], [66, 100]], '#8affd0', { smooth: true, line: 1.2, shine: false });
  };

  // ---- NEON: graffiti kid; awakened = overdrive ------------------------------------------------------------
  FACE.neon = (c, F) => {
    bg(c, { top: F ? '#3a0a4a' : '#12102a', bot: '#04040e', glow: F ? 'rgba(255,60,255,.55)' : 'rgba(60,240,255,.3)', stars: '#fff', starN: 10 });
    for (const [x, y, r, col] of [[14, 24, 9, '#ff2aff'], [88, 30, 7, '#2af0ff'], [78, 70, 10, '#ff2aff'], [12, 66, 6, '#2af0ff']]) { add(c, () => { c.fillStyle = col; c.globalAlpha = .7; c.beginPath(); c.arc(x, y, r, 0, 7); for (let k = 0; k < 6; k++) { c.moveTo(x, y); c.lineTo(x + Math.cos(k * 1.05) * r * 1.8, y + Math.sin(k * 1.05) * r * 1.8); c.arc(x + Math.cos(k * 1.05) * r * 1.8, y + Math.sin(k * 1.05) * r * 1.8, 1.4, 0, 7); } c.fill(); }); }
    const C = '#2af0ff';
    hair(c, [[22, 60], [16, 38], [24, 18], [50, 10], [76, 18], [84, 38], [78, 62], [72, 74], [68, 56], [32, 56], [28, 74]], C, { hi: '#a8ffff', lo: '#0a98b8', gloss: [[26, 36, 30, 20, 50, 14]] });
    shoulders(c, '#20204a', { trim: '#ff2aff' });
    shape(c, [[30, 78], [50, 90], [70, 78], [76, 100], [24, 100]], '#12122a', { line: 1.2 }); c.fillStyle = '#ff2aff'; star(c, 50, 92, 5, '#ff2aff');
    shape(c, [[30, 80], [50, 94], [70, 80], [66, 86], [50, 100], [34, 86]], '#2af0ff', { line: 1.2 });
    const P = head(c, { skin: '#d4a488', w: 18.5, chin: 76, jaw: .6 });
    // face paint
    c.save(); c.clip(P); add(c, () => { c.strokeStyle = 'rgba(255,42,255,.85)'; c.lineWidth = 2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 12, 58); c.lineTo(50 + s * 18, 62); c.moveTo(50 + s * 11, 62); c.lineTo(50 + s * 17, 66); c.stroke(); } c.strokeStyle = 'rgba(42,240,255,.85)'; c.beginPath(); c.moveTo(34, 45); c.lineTo(42, 47); c.stroke(); }); c.restore();
    const fr = [[31, 46], [30, 34], [38, 28], [50, 24], [62, 28], [70, 34], [69, 46], [66, 40], [60, 38], [54, 46], [46, 36], [42, 46], [38, 38], [34, 48]];
    // beanie
    shape(c, [[27, 40], [28, 26], [38, 16], [50, 13], [62, 16], [72, 26], [73, 40], [66, 34], [50, 32], [34, 34]], ['#ff5aff', '#a010a0'], { line: 1.6, shine: '#ffd0ff', shineLines: [[34, 24, 44, 17, 56, 16]] });
    shape(c, [[27, 40], [73, 40], [74, 33], [26, 33]], '#2af0ff', { line: 1.3, shine: false }); circ(c, 50, 11, 3.2, '#2af0ff');
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); }, 2, .15);
    hair(c, [[29, 40], [31, 52], [34, 44], [36, 40]], C, { shine: false }); hair(c, [[71, 40], [69, 52], [66, 44], [64, 40]], C, { shine: false });
    eyes(c, { y: 52.5, d: 10.2, w: 6.6, h: 5.6, iris: F ? '#ff2aff' : '#2af0ff', glow: F ? 'rgba(255,42,255,.8)' : 'rgba(42,240,255,.5)', lid: .14, tilt: -.4 });
    brows(c, { y: 43.5, tilt: -.8, col: '#0a98b8', len: 8 }); mouth(c, F ? 'grin' : 'smirk', { y: 67.5, w: 6 }); nose(c);
    if (F) add(c, () => { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.2; c.beginPath(); c.arc(50, 46, 40, 0, 7); c.stroke(); });
  };

  // ---- THE JUDGE: cosmic law; awakened = verdict ---------------------------------------------------------------
  FACE.judge = (c, F) => {
    bg(c, { top: F ? '#3a3010' : '#14142a', bot: '#04040a', glow: F ? 'rgba(255,230,120,.6)' : 'rgba(210,210,255,.35)', rays: F ? 'rgba(255,240,150,.16)' : null, rayN: 16, rings: 'rgba(224,224,255,.1)', stars: '#fff' });
    // scales behind
    const G = '#ffd35a'; c.strokeStyle = G; c.lineWidth = 1.6; c.beginPath(); c.moveTo(14, 20); c.lineTo(86, 20); c.moveTo(50, 8); c.lineTo(50, 40); c.moveTo(14, 20); c.lineTo(8, 40); c.moveTo(14, 20); c.lineTo(20, 40); c.moveTo(86, 20); c.lineTo(80, 40); c.moveTo(86, 20); c.lineTo(92, 40); c.stroke();
    for (const x of [14, 86]) shape(c, [[x - 10, 40], [x + 10, 40], [x + 6, 46], [x - 6, 46]], ['#ffe27a', '#b8841c'], { line: 1.2, shine: false });
    // wig curls
    const W = F ? ['#fffbe0', '#e8d890'] : ['#ffffff', '#c8c8d8'];
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const x = 50 + s * (25 + (i % 2) * 3), y = 36 + i * 11; shape(c, [[x - 6, y - 5], [x + 6, y - 5], [x + 7, y + 5], [x - 7, y + 5]], W, { smooth: true, line: 1.4, shine: false }); c.strokeStyle = 'rgba(100,100,130,.5)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 3, 0, 5); c.stroke(); }
    shape(c, [[26, 50], [24, 30], [34, 14], [50, 8], [66, 14], [76, 30], [74, 50], [70, 38], [50, 28], [30, 38]], W, { smooth: true, line: 1.5, shine: '#fff', shineLines: [[32, 24, 50, 12, 68, 24]] });
    for (const x of [34, 42, 50, 58, 66]) { c.strokeStyle = 'rgba(100,100,130,.5)'; c.lineWidth = 1; c.beginPath(); c.arc(x, 20 - Math.abs(x - 50) * .12, 4, Math.PI, 0); c.stroke(); }
    shoulders(c, '#1c1c30', { trim: G });
    shape(c, [[34, 74], [50, 80], [66, 74], [64, 94], [50, 100], [36, 94]], '#f4f4fc', { line: 1.3 });
    for (const y of [82, 88, 94]) { c.strokeStyle = 'rgba(120,120,160,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(44, y); c.lineTo(56, y); c.stroke(); }
    const P = head(c, { skin: '#cdcde0', w: 18, chin: 77, jaw: .8, blush: false, top: 28 });
    const fr = [[32, 44], [32, 34], [42, 30], [50, 32], [58, 30], [68, 34], [68, 44], [60, 38], [50, 40], [40, 38]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); }, 2, .2);
    // blazing eyes without pupils
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 10, 52, F ? 15 : 11, F ? 'rgba(255,230,120,1)' : 'rgba(220,220,255,1)')); shape(c, [[50 + s * 4, 52], [50 + s * 10, 48], [50 + s * 16, 50], [50 + s * 16, 55], [50 + s * 8, 56]], F ? '#fff6c0' : '#f4f4ff', { smooth: true, line: 1.2, shine: false }); }
    brows(c, { y: 43.5, tilt: -1.8, col: '#e8e8f4', len: 9, th: 2.4 });
    mouth(c, 'frown', { y: 68, w: 5 }); nose(c, { col: 'rgba(60,60,100,.5)' });
    c.strokeStyle = 'rgba(60,60,100,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(40, 60); c.lineTo(38, 66); c.moveTo(60, 60); c.lineTo(62, 66); c.stroke();
    // gavel
    c.save(); c.translate(86, 78); c.rotate(-.5); c.fillStyle = '#6b4a2a'; c.fillRect(-1.6, -2, 3.2, 30); shape(c, [[-9, -14], [9, -14], [9, 0], [-9, 0]], ['#a87a4a', '#5a3a1a'], { line: 1.4, shine: false }); c.restore();
  };

  // ---- ASTRA: the valkyrie; awakened = starlit ------------------------------------------------------------------
  FACE.astra = (c, F) => {
    bg(c, { top: F ? '#1a1a5a' : '#2a3a78', bot: '#080a1c', glow: F ? 'rgba(255,240,170,.6)' : 'rgba(200,220,255,.4)', rays: 'rgba(255,255,255,.1)', rayN: 14, stars: '#fff', starN: F ? 30 : 16 });
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) shape(c, [[50 + s * 18, 70 - i * 3], [50 + s * 40, 56 - i * 10], [50 + s * (84 - i * 4), 30 + i * 14], [50 + s * (60 - i * 2), 76 - i * 2]], F ? ['#fff6c0', '#e8c870'] : ['#ffffff', '#b8c8e8'], { smooth: true, line: 1.2, shine: false });
    hair(c, [[22, 56], [16, 32], [28, 14], [50, 8], [72, 14], [84, 32], [78, 56], [84, 90], [74, 100], [26, 100], [16, 90]], F ? '#ffe9a0' : '#fff0c0', { hi: '#fffbe0', lo: F ? '#c89a40' : '#cdb070', gloss: [[24, 34, 28, 64, 22, 92], [76, 34, 72, 64, 78, 92]] });
    shoulders(c, '#b0c8ff', { trim: '#fff' });
    for (const s of [-1, 1]) shape(c, [[50 + s * 20, 84], [50 + s * 28, 72], [50 + s * 44, 70], [50 + s * 48, 88]], ['#e8f0ff', '#7a90c8'], { line: 1.4 });
    shape(c, [[40, 78], [50, 90], [60, 78], [56, 100], [44, 100]], '#3a4a7a', { line: 1.1 }); star(c, 50, 90, 4, '#fff');
    const P = head(c, { skin: '#f6e2cc', w: 18.5, chin: 76, jaw: .7 });
    const bangs = [[31, 46], [30, 34], [40, 26], [50, 22], [60, 26], [70, 34], [69, 46], [65, 36], [60, 44], [54, 32], [50, 42], [46, 32], [40, 44], [35, 36]];
    under(c, P, () => { path(c, bangs); c.fillStyle = '#000'; c.fill(); });
    eyes(c, { y: 52, d: 10.2, w: 6.8, h: 5.8, iris: F ? '#fff2a0' : '#5a9aff', glow: F ? 'rgba(255,240,160,.8)' : null, lid: .12, tilt: -.3, ring: F ? '#c8901a' : undefined });
    if (F) for (const s of [-1, 1]) star(c, 50 + s * 10.2, 52, 2.6, '#8a6a1a');
    brows(c, { y: 43.5, tilt: -.5, col: '#cdb070', len: 8 }); mouth(c, 'smile', { y: 67.5, w: 4 }); nose(c);
    hair(c, bangs, F ? '#ffeeb0' : '#fff4cc', { hi: '#fffff0', lo: '#d0b478', gloss: [[38, 28, 50, 24, 62, 28]] });
    // winged kabuto
    const HL = F ? ['#fff8d0', '#d8a838'] : ['#e8f0ff', '#7a90c8'];
    shape(c, [[28, 36], [30, 22], [42, 14], [50, 12], [58, 14], [70, 22], [72, 36], [66, 28], [50, 24], [34, 28]], HL, { line: 1.6, shine: '#fff', shineLines: [[34, 22, 46, 15, 58, 16]] });
    shape(c, [[44, 14], [50, 0], [56, 14]], F ? '#fff6c0' : '#fff', { line: 1.3, shine: false });
    for (const s of [-1, 1]) { shape(c, [[50 + s * 21, 30], [50 + s * 40, 14], [50 + s * 36, 30], [50 + s * 44, 34], [50 + s * 22, 38]], HL, { line: 1.3, shine: false }); }
    star(c, 50, 20, 3, F ? '#ffd35a' : '#5a9aff');
    if (F) add(c, () => { glow(c, 50, 14, 20, 'rgba(255,240,160,.55)'); });
  };
})();

// ---- install: every portrait goes through the pixel engine -----------------------------------------
(() => {
  const ids = Object.keys(FACE);
  for (const id of ids) {
    const d = charById(id); if (!d) continue;
    const prev = d.drawPortrait;
    const px = PxKit.portrait(id + '_face', (c, o, def) => FACE[id](c, !!o.form, def || d), { res: 100, levels: 14, dither: .14, outline: true });
    d.drawPortrait = (c, opts, def) => PxKit.on() ? px(c, opts || {}, def || d) : (prev ? prev(c, opts, def) : null);
  }
})();
