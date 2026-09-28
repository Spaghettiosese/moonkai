'use strict';
// Moonkai Pixel Studio: layered, animated pixel art editor tuned for anime-style art.

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};

// ---------- colour helpers ----------
function hexToRgba(hex) {
  hex = hex.replace('#', '').trim();
  if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) return null;
  const n = parseInt(hex.slice(0, 6), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255, hex.length === 8 ? parseInt(hex.slice(6), 16) : 255];
}
const toHex = c => '#' + [c[0], c[1], c[2]].map(v => v.toString(16).padStart(2, '0')).join('');
const cssColor = c => `rgba(${c[0]},${c[1]},${c[2]},${(c[3] / 255).toFixed(3)})`;
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
  }
  return [h, s * 100, l * 100];
}
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255); };
  return [f(0), f(8), f(4)];
}
// Anime-style shading: highlights drift toward warm yellow, shadows toward cool violet.
function shadeColor(r, g, b, dir, amt, hueShift) {
  let [h, s, l] = rgbToHsl(r, g, b);
  l = clamp(l + dir * amt, 0, 100);
  if (hueShift) {
    const target = dir > 0 ? 55 : 255, d = ((target - h + 540) % 360) - 180;
    h += clamp(d, -amt * 1.2, amt * 1.2);
    s = clamp(s + (dir > 0 ? -amt * .25 : amt * .35), 0, 100);
  }
  return hslToRgb(h, s, l);
}

// ---------- document ----------
const doc = { w: 128, h: 128, fps: 8, frames: 1, layers: [], palette: [] };
const cur = { layer: 0, frame: 0 };
const ui = {
  tool: 'pencil', primary: [30, 22, 36, 255], secondary: [255, 255, 255, 255],
  zoom: 4, panX: 0, panY: 0, grid: true, smooth: false, onion: false, symX: false, symY: false,
  refShow: true, refOpacity: .35, ref: null, recent: [], hover: null, playing: null, palName: 'Anime Essentials',
};
const opt = {
  size: 1, shape: 'circle', opacity: 100, pixelPerfect: true, fillShapes: false, tolerance: 0,
  contiguous: true, dither: 'checker', shadeAmt: 8, hueShift: true, density: 14,
};
Object.assign(opt, store.get('pxs.opt', {}));

const blank = () => new Uint8ClampedArray(doc.w * doc.h * 4);
const makeLayer = (name, extra = {}) => ({ name, visible: true, opacity: 1, locked: false, guide: false,
  cels: Array.from({ length: doc.frames }, blank), ...extra });
const layer = () => doc.layers[cur.layer];
const cel = () => layer().cels[cur.frame];

// Scratch canvases (all doc sized).
const mk = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d', { willReadFrequently: true })]; };
const [comp, compCtx] = mk(), [tmp, tmpCtx] = mk(), [scratch, scratchCtx] = mk(), [smoothC, smoothCtx] = mk();
function sizeBuffers() { for (const c of [comp, tmp, scratch]) { c.width = doc.w; c.height = doc.h; } }

function compose(f, ctx = compCtx, exporting = false) {
  ctx.clearRect(0, 0, doc.w, doc.h);
  for (const L of doc.layers) {
    if (!L.visible || (exporting && L.guide)) continue;
    tmpCtx.putImageData(new ImageData(L.cels[f], doc.w, doc.h), 0, 0);
    ctx.globalAlpha = L.opacity;
    ctx.drawImage(tmp, 0, 0);
  }
  ctx.globalAlpha = 1;
  return ctx.canvas;
}
const frameRGBA = (f, exporting = true) => { compose(f, scratchCtx, exporting); return scratchCtx.getImageData(0, 0, doc.w, doc.h).data; };

// Scale2x (EPX): rounds off stair-steps so upscaled art looks less blocky.
function scale2x(src, w, h) {
  const out = new Uint32Array(w * h * 4), W = w * 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const P = src[y * w + x];
    const A = y > 0 ? src[(y - 1) * w + x] : P, D = y < h - 1 ? src[(y + 1) * w + x] : P;
    const C = x > 0 ? src[y * w + x - 1] : P, B = x < w - 1 ? src[y * w + x + 1] : P;
    const o = (y * 2) * W + x * 2;
    out[o] = C === A && C !== D && A !== B ? A : P;
    out[o + 1] = A === B && A !== C && B !== D ? B : P;
    out[o + W] = D === C && D !== B && C !== A ? C : P;
    out[o + W + 1] = B === D && B !== A && D !== C ? D : P;
  }
  return out;
}
// Upscale RGBA by a power of two (smooth) or any integer (nearest).
function upscale(rgba, w, h, scale, smooth) {
  let px = new Uint32Array(rgba.buffer.slice(rgba.byteOffset, rgba.byteOffset + rgba.byteLength)), W = w, H = h, s = scale;
  if (smooth) while (s >= 2 && s % 2 === 0) { px = scale2x(px, W, H); W *= 2; H *= 2; s /= 2; }
  if (s > 1) {
    const out = new Uint32Array(W * s * H * s), OW = W * s;
    for (let y = 0; y < H * s; y++) { const sy = (y / s | 0) * W; for (let x = 0; x < OW; x++) out[y * OW + x] = px[sy + (x / s | 0)]; }
    px = out; W *= s; H *= s;
  }
  return { data: new Uint8ClampedArray(px.buffer), w: W, h: H };
}

// ---------- undo ----------
const undoStack = [], redoStack = [];
const cloneDoc = () => ({ w: doc.w, h: doc.h, frames: doc.frames, cur: { ...cur },
  layers: doc.layers.map(L => ({ ...L, cels: L.cels.map(c => c.slice()) })) });
function pushUndo(kind = 'cel', data) {
  undoStack.push(kind === 'cel' ? { kind, li: cur.layer, fi: cur.frame, data: data || cel().slice() } : { kind, doc: cloneDoc() });
  if (undoStack.length > 120) undoStack.shift();
  redoStack.length = 0;
}
function swapState(s) {
  if (s.kind === 'cel') {
    const c = doc.layers[s.li].cels[s.fi], inv = { ...s, data: c.slice() };
    c.set(s.data); cur.layer = s.li; cur.frame = s.fi; return inv;
  }
  const inv = { kind: 'full', doc: cloneDoc() };
  Object.assign(doc, { w: s.doc.w, h: s.doc.h, frames: s.doc.frames, layers: s.doc.layers });
  Object.assign(cur, s.doc.cur); sizeBuffers(); return inv;
}
function undo() { if (!undoStack.length) return toast('Nothing to undo'); redoStack.push(swapState(undoStack.pop())); refreshAll(); }
function redo() { if (!redoStack.length) return toast('Nothing to redo'); undoStack.push(swapState(redoStack.pop())); refreshAll(); }

// ---------- rasterising ----------
let S = null; // active stroke
const stampCache = {};
function stampOffsets() {
  const s = opt.size, key = s + opt.shape;
  if (stampCache[key]) return stampCache[key];
  const o = [], half = Math.floor(s / 2), r2 = (s / 2) * (s / 2) - .3;
  for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) {
    if (opt.shape === 'circle' && s > 2) { const cx = i + .5 - s / 2, cy = j + .5 - s / 2; if (cx * cx + cy * cy > r2) continue; }
    o.push(i - half, j - half);
  }
  return stampCache[key] = o;
}
function mirror(x, y, fn) {
  fn(x, y);
  const mx = doc.w - 1 - x, my = doc.h - 1 - y;
  if (ui.symX) fn(mx, y);
  if (ui.symY) fn(x, my);
  if (ui.symX && ui.symY) fn(mx, my);
}
const DITHER = {
  checker: (x, y) => ((x + y) & 1) === 0,
  light: (x, y) => (x & 1) === 0 && (y & 1) === 0,
  heavy: (x, y) => !((x & 1) && (y & 1)),
  lines: (x, y) => (y & 1) === 0,
  diagonal: (x, y) => (x + y) % 4 === 0,
};
function setPx(x, y) {
  if (x < 0 || y < 0 || x >= doc.w || y >= doc.h) return;
  const i = y * doc.w + x;
  if (S.mask[i] || (S.pattern && !S.pattern(x, y))) return;
  S.mask[i] = 1;
  const d = S.data, b = S.base, o = i * 4;
  if (S.mode === 'erase') { d[o + 3] = Math.round(b[o + 3] * (1 - S.alpha)); return; }
  if (S.mode === 'shade') {
    if (!b[o + 3]) return;
    const c = shadeColor(b[o], b[o + 1], b[o + 2], S.dir, opt.shadeAmt, opt.hueShift);
    d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; return;
  }
  const c = S.col, sa = c[3] / 255 * S.alpha;
  if (sa >= 1) { d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; return; }
  const ba = b[o + 3] / 255, oa = sa + ba * (1 - sa);
  if (oa <= 0) return;
  for (let k = 0; k < 3; k++) d[o + k] = (c[k] * sa + b[o + k] * ba * (1 - sa)) / oa;
  d[o + 3] = oa * 255;
}
function restorePx(x, y) {
  if (x < 0 || y < 0 || x >= doc.w || y >= doc.h) return;
  const i = y * doc.w + x, o = i * 4;
  S.mask[i] = 0;
  for (let k = 0; k < 4; k++) S.data[o + k] = S.base[o + k];
}
const stamp = (x, y) => { const o = stampOffsets(); for (let i = 0; i < o.length; i += 2) mirror(x + o[i], y + o[i + 1], setPx); };
const dot = (x, y) => mirror(x, y, setPx);
function line(x0, y0, x1, y1, fn) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (;;) {
    fn(x0, y0);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
// Zingl's ellipse-in-rectangle; `span` fills rows for solid ellipses.
function ellipseRect(x0, y0, x1, y1, plot, span) {
  let a = Math.abs(x1 - x0), b = Math.abs(y1 - y0), b1 = b & 1;
  let dx = 4 * (1 - a) * b * b, dy = 4 * (b1 + 1) * a * a, err = dx + dy + b1 * a * a, e2;
  if (x0 > x1) { x0 = x1; x1 += a; }
  if (y0 > y1) y0 = y1;
  y0 += (b + 1) >> 1; y1 = y0 - b1; a *= 8 * a; b1 = 8 * b * b;
  do {
    if (span) { span(x0, x1, y0); span(x0, x1, y1); }
    plot(x1, y0); plot(x0, y0); plot(x0, y1); plot(x1, y1);
    e2 = 2 * err;
    if (e2 <= dy) { y0++; y1--; err += dy += a; }
    if (e2 >= dx || 2 * err > dy) { x0++; x1--; err += dx += b1; }
  } while (x0 <= x1);
  while (y0 - y1 <= b) {
    if (span) { span(x0 - 1, x1 + 1, y0); span(x0 - 1, x1 + 1, y1); }
    plot(x0 - 1, y0); plot(x1 + 1, y0++); plot(x0 - 1, y1); plot(x1 + 1, y1--);
  }
}
const hspan = (xa, xb, y) => { for (let x = xa; x <= xb; x++) dot(x, y); };

function freehandTo(p) {
  line(S.last.x, S.last.y, p.x, p.y, (x, y) => {
    if (S.pp) { // pixel-perfect: drop the corner pixel of any L-shaped step
      const t = S.trail, l = t[t.length - 1];
      if (l && l.x === x && l.y === y) return;
      t.push({ x, y });
      if (t.length >= 3) {
        const a = t[t.length - 3], m = t[t.length - 2];
        if (Math.abs(a.x - x) === 1 && Math.abs(a.y - y) === 1) { mirror(m.x, m.y, restorePx); t.splice(t.length - 2, 1); }
      }
    }
    if (S.mode === 'spray') spray(x, y); else stamp(x, y);
  });
  S.last = p;
}
function spray(cx, cy) {
  const r = Math.max(1.5, opt.size * 1.5);
  for (let n = 0; n < opt.density; n++) {
    const a = Math.random() * Math.PI * 2, rr = r * Math.sqrt(Math.random());
    dot(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr));
  }
}
function drawShape(p) {
  S.data.set(S.base); S.mask.fill(0);
  const { x: x0, y: y0 } = S.start;
  let x1 = p.x, y1 = p.y;
  const dx = x1 - x0, dy = y1 - y0;
  if (S.shift) {
    if (S.tool === 'line') {
      if (Math.abs(dx) > 2 * Math.abs(dy)) y1 = y0;
      else if (Math.abs(dy) > 2 * Math.abs(dx)) x1 = x0;
      else { const d = Math.max(Math.abs(dx), Math.abs(dy)); x1 = x0 + Math.sign(dx) * d; y1 = y0 + Math.sign(dy) * d; }
    } else { const d = Math.max(Math.abs(dx), Math.abs(dy)); x1 = x0 + (Math.sign(dx) || 1) * d; y1 = y0 + (Math.sign(dy) || 1) * d; }
  }
  if (S.tool === 'line') line(x0, y0, x1, y1, stamp);
  else if (S.tool === 'rect') {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1), ay = Math.min(y0, y1), by = Math.max(y0, y1);
    if (opt.fillShapes) for (let y = ay; y <= by; y++) hspan(ax, bx, y);
    line(ax, ay, bx, ay, stamp); line(bx, ay, bx, by, stamp); line(bx, by, ax, by, stamp); line(ax, by, ax, ay, stamp);
  } else ellipseRect(x0, y0, x1, y1, stamp, opt.fillShapes ? hspan : null);
}
function floodFill(p) {
  const w = doc.w, h = doc.h, b = S.base, o0 = (p.y * w + p.x) * 4, tol = opt.tolerance * 2.55;
  const t = [b[o0], b[o0 + 1], b[o0 + 2], b[o0 + 3]];
  const match = o => (t[3] === 0 && b[o + 3] === 0) ||
    (Math.abs(b[o] - t[0]) <= tol && Math.abs(b[o + 1] - t[1]) <= tol && Math.abs(b[o + 2] - t[2]) <= tol && Math.abs(b[o + 3] - t[3]) <= tol);
  if (!opt.contiguous) { for (let i = 0; i < w * h; i++) if (match(i * 4)) setPx(i % w, i / w | 0); return; }
  const seen = new Uint8Array(w * h), stack = [p.y * w + p.x];
  while (stack.length) {
    const i = stack.pop();
    if (seen[i]) continue;
    seen[i] = 1;
    if (!match(i * 4)) continue;
    const x = i % w, y = i / w | 0;
    setPx(x, y);
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - w);
    if (y < h - 1) stack.push(i + w);
  }
}
function moveTo(p) {
  const dx = p.x - S.start.x, dy = p.y - S.start.y, w = doc.w, h = doc.h;
  const src = new Uint32Array(S.base.buffer), dst = new Uint32Array(S.data.buffer);
  dst.fill(0);
  for (let y = 0; y < h; y++) {
    const sy = y - dy;
    if (sy < 0 || sy >= h) continue;
    for (let x = 0; x < w; x++) { const sx = x - dx; if (sx >= 0 && sx < w) dst[y * w + x] = src[sy * w + sx]; }
  }
}
const TAU = Math.PI * 2;
function shiftCel(src, dx, dy) {
  const w = doc.w, h = doc.h, out = new Uint8ClampedArray(src.length), s = new Uint32Array(src.buffer), d = new Uint32Array(out.buffer);
  for (let y = 0; y < h; y++) { const sy = y - dy; if (sy < 0 || sy >= h) continue;
    for (let x = 0; x < w; x++) { const sx = x - dx; if (sx >= 0 && sx < w) d[y * w + x] = s[sy * w + sx]; } }
  return out;
}
// Breathing: the top half of the art sinks 1px while the bottom stays planted.
function breathe(src, on) {
  if (!on) return src.slice();
  const w = doc.w, h = doc.h, s = new Uint32Array(src.buffer);
  let top = h, bot = 0;
  for (let i = 0; i < s.length; i++) if (s[i]) { const y = i / w | 0; if (y < top) top = y; if (y > bot) bot = y; }
  const mid = Math.round((top + bot) / 2), out = new Uint8ClampedArray(src.length), d = new Uint32Array(out.buffer);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) d[y * w + x] = y > mid ? s[y * w + x] : y >= 1 ? s[(y - 1) * w + x] : 0;
  return out;
}
function pickColor(p, secondary) {
  if (p.x < 0 || p.y < 0 || p.x >= doc.w || p.y >= doc.h) return;
  compose(cur.frame);
  const c = [...compCtx.getImageData(p.x, p.y, 1, 1).data];
  if (!c[3]) return toast('Transparent pixel');
  setColor(secondary ? 'secondary' : 'primary', c);
}

// ---------- strokes ----------
const PAINT_TOOLS = new Set(['pencil', 'eraser', 'line', 'rect', 'ellipse', 'shade', 'dither', 'spray', 'fill']);
function beginStroke(p, e) {
  const secondary = e.button === 2;
  if (ui.tool === 'picker' || (e.altKey && PAINT_TOOLS.has(ui.tool))) { pickColor(p, secondary); S = { tool: 'picker' }; return; }
  const L = layer();
  if (!L.visible || L.locked) { toast(L.locked ? 'Layer is locked' : 'Layer is hidden'); return; }
  const data = cel(), base = data.slice(), tool = ui.tool;
  S = {
    tool, data, base, mask: new Uint8Array(doc.w * doc.h), start: p, last: p, trail: [], shift: e.shiftKey,
    col: secondary ? ui.secondary : ui.primary, alpha: opt.opacity / 100,
    mode: tool === 'eraser' ? 'erase' : tool === 'shade' ? 'shade' : tool === 'spray' ? 'spray' : 'paint',
    dir: secondary || e.shiftKey ? -1 : 1,
    pattern: tool === 'dither' ? DITHER[opt.dither] : null,
    pp: opt.pixelPerfect && opt.size === 1 && (tool === 'pencil' || tool === 'eraser'),
  };
  if (tool === 'dither' || tool === 'shade') S.alpha = 1;
  if (tool === 'fill') { if (inDoc(p)) floodFill(p); endStroke(); return; }
  if (tool === 'move') { S.mode = 'move'; }
  else if (['line', 'rect', 'ellipse'].includes(tool)) drawShape(p);
  else {
    freehandTo(p);
    if (tool === 'spray') S.timer = setInterval(() => { spray(S.last.x, S.last.y); req(); }, 50);
  }
  req();
}
function continueStroke(p) {
  if (!S || S.tool === 'picker') return;
  if (S.tool === 'move') moveTo(p);
  else if (['line', 'rect', 'ellipse'].includes(S.tool)) drawShape(p);
  else freehandTo(p);
  req();
}
function endStroke() {
  if (!S) return;
  const s = S; S = null;
  if (s.timer) clearInterval(s.timer);
  if (s.tool === 'picker') return;
  let changed = false;
  for (let i = 0; i < s.data.length; i++) if (s.data[i] !== s.base[i]) { changed = true; break; }
  if (!changed) return;
  pushUndo('cel', s.base);
  if (s.mode === 'paint' || s.mode === 'spray') addRecent(s.col);
  afterEdit();
}
function afterEdit() { renderLayers(); renderFrames(); autosave(); req(); }

// ---------- view ----------
const view = $('#view'), vctx = view.getContext('2d');
let dpr = 1, vw = 0, vh = 0, needs = false, checker;
function makeChecker() {
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const x = c.getContext('2d'), cs = getComputedStyle(document.documentElement);
  x.fillStyle = cs.getPropertyValue('--checkA'); x.fillRect(0, 0, 16, 16);
  x.fillStyle = cs.getPropertyValue('--checkB'); x.fillRect(0, 0, 8, 8); x.fillRect(8, 8, 8, 8);
  checker = vctx.createPattern(c, 'repeat');
}
function resizeView() {
  const r = view.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1; vw = r.width; vh = r.height;
  view.width = Math.round(vw * dpr); view.height = Math.round(vh * dpr);
  req();
}
function req() { if (!needs) { needs = true; requestAnimationFrame(render); } }
const inDoc = p => p.x >= 0 && p.y >= 0 && p.x < doc.w && p.y < doc.h;
function drawOnion(c, f, tint, X, Y, W, H) {
  if (f < 0 || f >= doc.frames) return;
  compose(f, scratchCtx);
  scratchCtx.globalCompositeOperation = 'source-atop'; scratchCtx.globalAlpha = .5;
  scratchCtx.fillStyle = tint; scratchCtx.fillRect(0, 0, doc.w, doc.h);
  scratchCtx.globalCompositeOperation = 'source-over'; scratchCtx.globalAlpha = 1;
  c.globalAlpha = .3; c.drawImage(scratch, X, Y, W, H); c.globalAlpha = 1;
}
function render() {
  needs = false;
  const c = vctx, z = ui.zoom, X = ui.panX, Y = ui.panY, W = doc.w * z, H = doc.h * z;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, vw, vh);
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(X + 5, Y + 5, W, H);
  c.save(); c.translate(X, Y); c.fillStyle = checker; c.fillRect(0, 0, W, H); c.restore();
  if (ui.onion && doc.frames > 1) { drawOnion(c, cur.frame - 1, '#ff3b6b', X, Y, W, H); drawOnion(c, cur.frame + 1, '#3bb4ff', X, Y, W, H); }
  compose(cur.frame);
  if (ui.smooth) {
    const up = upscale(compCtx.getImageData(0, 0, doc.w, doc.h).data, doc.w, doc.h, z >= 4 ? 4 : 2, true);
    smoothC.width = up.w; smoothC.height = up.h;
    smoothCtx.putImageData(new ImageData(up.data, up.w, up.h), 0, 0);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(smoothC, X, Y, W, H);
    c.imageSmoothingEnabled = false;
  } else c.drawImage(comp, X, Y, W, H);
  if (ui.ref && ui.refShow) {
    const r = ui.ref, k = Math.min(W / r.width, H / r.height);
    c.globalAlpha = ui.refOpacity; c.imageSmoothingEnabled = true;
    c.drawImage(r, X + (W - r.width * k) / 2, Y + (H - r.height * k) / 2, r.width * k, r.height * k);
    c.globalAlpha = 1; c.imageSmoothingEnabled = false;
  }
  if (ui.grid && z >= 5) {
    const minor = new Path2D(), major = new Path2D();
    for (let x = 0; x <= doc.w; x++) (x % 8 ? minor : major).rect(X + x * z, Y, 0, H);
    for (let y = 0; y <= doc.h; y++) (y % 8 ? minor : major).rect(X, Y + y * z, W, 0);
    c.lineWidth = 1 / dpr;
    c.strokeStyle = 'rgba(128,128,160,.22)'; c.stroke(minor);
    c.strokeStyle = 'rgba(160,140,255,.45)'; c.stroke(major);
  }
  c.lineWidth = 1;
  if (ui.symX || ui.symY) {
    c.strokeStyle = 'rgba(255,111,174,.8)'; c.setLineDash([6, 4]); c.beginPath();
    if (ui.symX) { c.moveTo(X + W / 2, Y); c.lineTo(X + W / 2, Y + H); }
    if (ui.symY) { c.moveTo(X, Y + H / 2); c.lineTo(X + W, Y + H / 2); }
    c.stroke(); c.setLineDash([]);
  }
  const p = ui.hover;
  if (p && inDoc(p) && PAINT_TOOLS.has(ui.tool) && ui.tool !== 'fill') {
    const s = ['shade', 'pencil', 'eraser', 'dither', 'line', 'rect', 'ellipse'].includes(ui.tool) ? opt.size : 1, half = Math.floor(s / 2);
    const rx = X + (p.x - half) * z, ry = Y + (p.y - half) * z;
    if (ui.tool === 'pencil' && z >= 3) { c.fillStyle = cssColor([...ui.primary.slice(0, 3), 110]); c.fillRect(rx, ry, s * z, s * z); }
    c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeRect(rx - .5, ry - .5, s * z + 1, s * z + 1);
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.strokeRect(rx + .5, ry + .5, s * z - 1, s * z - 1);
  }
  const zl = $('#zoomLabel'); zl.textContent = Math.round(z * 100) + '%';
}
const ZOOMS = [.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64];
function setZoom(z, sx = vw / 2, sy = vh / 2) {
  z = clamp(z, .5, 64);
  const k = z / ui.zoom;
  ui.panX = Math.round(sx - (sx - ui.panX) * k); ui.panY = Math.round(sy - (sy - ui.panY) * k);
  ui.zoom = z; req(); updateStatus();
}
function zoomStep(dir, sx, sy) {
  const z = dir > 0 ? ZOOMS.find(v => v > ui.zoom + 1e-6) : [...ZOOMS].reverse().find(v => v < ui.zoom - 1e-6);
  if (z) setZoom(z, sx, sy);
}
function fit() {
  const f = Math.min((vw - 40) / doc.w, (vh - 40) / doc.h);
  ui.zoom = f >= 1 ? Math.floor(f) : Math.max(.5, f);
  ui.panX = Math.round((vw - doc.w * ui.zoom) / 2); ui.panY = Math.round((vh - doc.h * ui.zoom) / 2);
  req(); updateStatus();
}
function toDoc(e) {
  const r = view.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
  return { x: Math.floor((sx - ui.panX) / ui.zoom), y: Math.floor((sy - ui.panY) / ui.zoom), sx, sy };
}

// ---------- input ----------
let pan = null, spaceDown = false;
view.addEventListener('contextmenu', e => e.preventDefault());
view.addEventListener('pointerdown', e => {
  view.setPointerCapture(e.pointerId);
  const p = toDoc(e);
  if (e.button === 1 || spaceDown || ui.tool === 'hand') { pan = { x: e.clientX - ui.panX, y: e.clientY - ui.panY }; return; }
  if (e.button > 2) return;
  beginStroke(p, e);
});
view.addEventListener('pointermove', e => {
  if (pan) { ui.panX = Math.round(e.clientX - pan.x); ui.panY = Math.round(e.clientY - pan.y); req(); return; }
  const evs = S && e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  for (const ev of (evs.length ? evs : [e])) { const p = toDoc(ev); ui.hover = p; if (S) continueStroke(p); }
  updateStatus(); req();
});
const stopPointer = () => { pan = null; endStroke(); };
view.addEventListener('pointerup', stopPointer);
view.addEventListener('pointercancel', stopPointer);
view.addEventListener('pointerleave', () => { ui.hover = null; req(); updateStatus(); });
view.addEventListener('wheel', e => {
  e.preventDefault();
  const p = toDoc(e);
  if (e.ctrlKey || !e.shiftKey && Math.abs(e.deltaY) >= Math.abs(e.deltaX) && !e.altKey) zoomStep(e.deltaY < 0 ? 1 : -1, p.sx, p.sy);
  else { ui.panX -= Math.round(e.deltaX || e.deltaY); req(); }
}, { passive: false });

const KEYTOOLS = { b: 'pencil', e: 'eraser', g: 'fill', l: 'line', r: 'rect', o: 'ellipse', i: 'picker', d: 'shade', t: 'dither', a: 'spray', m: 'move', h: 'hand' };
addEventListener('keydown', e => {
  if (e.target.matches('input:not([type=range]):not([type=checkbox]), select, textarea') || document.querySelector('dialog[open]')) return;
  const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
  if (e.target.tagName === 'BUTTON' && (k === 'enter' || k === ' ')) return;
  if (mod) {
    if (k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (k === 'y') { e.preventDefault(); redo(); }
    else if (k === 's') { e.preventDefault(); act.save(); }
    else if (k === 'e') { e.preventDefault(); act.export(); }
    else if (k === 'n') { e.preventDefault(); act.new(); }
    return;
  }
  if (k === ' ') { spaceDown = true; view.style.cursor = 'grab'; e.preventDefault(); return; }
  if (KEYTOOLS[k]) return setTool(KEYTOOLS[k]);
  if (k === '[' || k === ']') { opt.size = clamp(opt.size + (k === ']' ? 1 : -1), 1, 64); renderToolOpts(); req(); }
  else if (k === 'x') swapColors();
  else if (k === 'q') toggle('grid');
  else if (k === ',') gotoFrame(cur.frame - 1);
  else if (k === '.') gotoFrame(cur.frame + 1);
  else if (k === 'enter') act.play();
  else if (k === '0') fit();
  else if (k === '+' || k === '=') zoomStep(1);
  else if (k === '-') zoomStep(-1);
});
addEventListener('keyup', e => { if (e.key === ' ') { spaceDown = false; view.style.cursor = ''; } });
addEventListener('resize', () => { resizeView(); });

// ---------- tools & options UI ----------
const ICONS = {
  pencil: '<path d="M4 20l4-1 11-11-3-3L5 16z M14 6l3 3"/>',
  eraser: '<path d="M9 20h11 M4 15l9-9 6 6-7 7H8z M9 10l6 6"/>',
  fill: '<path d="M5 11l7-7 7 7-7 7z M5 11h14 M20 15c1 2 1.6 3 1.6 3.8a1.6 1.6 0 01-3.2 0c0-.8.6-1.8 1.6-3.8z"/>',
  line: '<path d="M5 19L19 5"/>',
  rect: '<rect x="4" y="6" width="16" height="12" rx="1"/>',
  ellipse: '<ellipse cx="12" cy="12" rx="8" ry="6"/>',
  picker: '<path d="M14 4l6 6-2 2-6-6z M13 7l-8 8v4h4l8-8"/>',
  shade: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 010 16z" fill="currentColor"/>',
  dither: '<path d="M5 5h3v3H5zM11 5h3v3h-3zM17 5h2v3h-2zM8 8h3v3H8zM14 8h3v3h-3zM5 11h3v3H5zM11 11h3v3h-3zM8 14h3v3H8zM14 14h3v3h-3zM5 17h3v2H5zM11 17h3v2h-3z" fill="currentColor" stroke="none"/>',
  spray: '<path d="M8 10h7v10H8z M10 10V7h3v3 M17 6h.01 M20 8h.01 M19 4h.01 M21.5 5.5h.01"/>',
  move: '<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',
  hand: '<path d="M8 13V6a1.5 1.5 0 013 0v5 M11 11V4a1.5 1.5 0 013 0v7 M14 11V5.5a1.5 1.5 0 013 0V14c0 4-3 7-6 7s-4-1-6-4l-2-3a1.5 1.5 0 012.5-1.5L8 14"/>',
};
const TOOLS = {
  pencil: ['Pencil (B)', ['size', 'shape', 'opacity', 'pixelPerfect']],
  eraser: ['Eraser (E)', ['size', 'shape', 'opacity', 'pixelPerfect']],
  fill: ['Fill (G)', ['tolerance', 'contiguous', 'opacity']],
  line: ['Line (L)', ['size', 'shape', 'opacity']],
  rect: ['Rectangle (R)', ['size', 'fillShapes', 'opacity']],
  ellipse: ['Ellipse (O)', ['size', 'fillShapes', 'opacity']],
  picker: ['Colour picker (I)', []],
  shade: ['Shade (D): left lightens, right darkens', ['size', 'shape', 'shadeAmt', 'hueShift']],
  dither: ['Dither (T)', ['size', 'shape', 'dither']],
  spray: ['Spray (A)', ['size', 'density', 'opacity']],
  move: ['Move layer (M)', []],
  hand: ['Pan (H / Space)', []],
};
const OPTDEF = {
  size: { label: 'Size', type: 'range', min: 1, max: 64 },
  shape: { label: 'Tip', type: 'select', options: [['circle', 'Round'], ['square', 'Square']] },
  opacity: { label: 'Opacity', type: 'range', min: 1, max: 100, unit: '%' },
  pixelPerfect: { label: 'Pixel-perfect (1px)', type: 'check' },
  fillShapes: { label: 'Filled shape', type: 'check' },
  tolerance: { label: 'Tolerance', type: 'range', min: 0, max: 100, unit: '%' },
  contiguous: { label: 'Contiguous', type: 'check' },
  dither: { label: 'Pattern', type: 'select', options: [['checker', 'Checker 50%'], ['light', 'Light 25%'], ['heavy', 'Heavy 75%'], ['lines', 'Scanlines'], ['diagonal', 'Diagonal']] },
  shadeAmt: { label: 'Strength', type: 'range', min: 1, max: 30 },
  hueShift: { label: 'Anime hue-shift', type: 'check' },
  density: { label: 'Density', type: 'range', min: 1, max: 60 },
};
function renderTools() {
  const nav = $('#tools'); nav.innerHTML = '';
  for (const [id, [title]] of Object.entries(TOOLS)) {
    const b = document.createElement('button');
    b.title = title; b.dataset.tool = id; b.className = id === ui.tool ? 'on' : '';
    b.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[id]}</svg>`;
    b.onclick = () => setTool(id);
    nav.appendChild(b);
  }
}
function setTool(t) {
  ui.tool = t;
  document.querySelectorAll('#tools button').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
  view.style.cursor = t === 'hand' ? 'grab' : t === 'move' ? 'move' : '';
  renderToolOpts(); req();
}
function renderToolOpts() {
  const [title, keys] = TOOLS[ui.tool], box = $('#toolOpts');
  $('#toolName').textContent = title;
  box.innerHTML = keys.length ? '' : '<p class="hint">No options for this tool.</p>';
  for (const k of keys) {
    const d = OPTDEF[k], row = document.createElement('label');
    row.className = 'opt' + (d.type === 'check' ? ' chk' : '');
    if (d.type === 'range') {
      row.innerHTML = `<span>${d.label}</span><input type="range" min="${d.min}" max="${d.max}" value="${opt[k]}"><span class="v">${opt[k]}${d.unit || ''}</span>`;
      const inp = row.querySelector('input'), v = row.querySelector('.v');
      inp.oninput = () => { opt[k] = +inp.value; v.textContent = opt[k] + (d.unit || ''); saveOpt(); req(); };
    } else if (d.type === 'select') {
      row.innerHTML = `<span>${d.label}</span><select>${d.options.map(([v, l]) => `<option value="${v}"${v === opt[k] ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
      row.querySelector('select').onchange = e => { opt[k] = e.target.value; saveOpt(); };
    } else {
      row.innerHTML = `<input type="checkbox"${opt[k] ? ' checked' : ''}><span>${d.label}</span>`;
      row.querySelector('input').onchange = e => { opt[k] = e.target.checked; saveOpt(); };
    }
    box.appendChild(row);
  }
}
const saveOpt = () => store.set('pxs.opt', opt);
function renderBrushPresets() {
  const box = $('#brushPresets'); box.innerHTML = '';
  for (const p of BRUSH_PRESETS) {
    const b = document.createElement('button');
    b.textContent = p.name;
    b.onclick = () => { Object.assign(opt, p.opt); saveOpt(); setTool(p.tool); toast(p.name); };
    box.appendChild(b);
  }
}

// ---------- colours & palette UI ----------
function setColor(which, c, fromSliders) {
  ui[which] = c.slice(0, 4);
  $('#' + which).style.background = cssColor(ui[which]);
  if (which === 'primary') syncColorInputs(fromSliders);
  renderPaletteSel(); req();
}
function syncColorInputs(fromSliders) {
  const c = ui.primary, [h, s, l] = rgbToHsl(c[0], c[1], c[2]);
  if (!fromSliders) { $('#cH').value = h; $('#cS').value = s; $('#cL').value = l; $('#cA').value = c[3]; }
  $('#hex').value = toHex(c) + (c[3] < 255 ? c[3].toString(16).padStart(2, '0') : '');
  $('#native').value = toHex(c);
  $('#cH').style.background = 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)';
  $('#cS').style.background = `linear-gradient(90deg,hsl(${h},0%,${l}%),hsl(${h},100%,${l}%))`;
  $('#cL').style.background = `linear-gradient(90deg,#000,hsl(${h},${s}%,50%),#fff)`;
}
function fromSliders() {
  const rgb = hslToRgb(+$('#cH').value, +$('#cS').value, +$('#cL').value);
  setColor('primary', [...rgb, +$('#cA').value], true);
}
['#cH', '#cS', '#cL', '#cA'].forEach(id => $(id).addEventListener('input', fromSliders));
$('#hex').addEventListener('change', e => { const c = hexToRgba(e.target.value); c ? setColor('primary', c) : toast('Invalid hex'); });
$('#native').addEventListener('input', e => setColor('primary', [...hexToRgba(e.target.value).slice(0, 3), ui.primary[3]]));
$('#primary').onclick = () => $('#native').click();
$('#secondary').onclick = swapColors;
$('#swap').onclick = swapColors;
function swapColors() { const p = ui.primary; setColor('primary', ui.secondary); setColor('secondary', p); }
function addRecent(c) {
  const hx = toHex(c);
  ui.recent = [hx, ...ui.recent.filter(h => h !== hx)].slice(0, 16);
  renderSwatches($('#recent'), ui.recent, false);
}
function renderSwatches(box, list, editable) {
  box.innerHTML = '';
  list.forEach((hx, i) => {
    const b = document.createElement('button');
    b.style.background = hx; b.title = hx; b.dataset.hex = hx;
    b.onclick = e => {
      if (editable && e.altKey) { doc.palette.splice(i, 1); renderPalette(); return; }
      setColor('primary', hexToRgba(hx));
    };
    b.oncontextmenu = e => { e.preventDefault(); setColor('secondary', hexToRgba(hx)); };
    box.appendChild(b);
  });
}
function renderPalette() { renderSwatches($('#palette'), doc.palette, true); renderPaletteSel(); }
function renderPaletteSel() {
  const hx = toHex(ui.primary);
  document.querySelectorAll('#palette button').forEach(b => b.classList.toggle('sel', b.dataset.hex === hx));
}
const customPalettes = () => store.get('pxs.palettes', {});
function renderPalSelect() {
  const sel = $('#palSel'), custom = customPalettes();
  sel.innerHTML = Object.keys(PALETTES).map(n => `<option>${esc(n)}</option>`).join('') +
    Object.keys(custom).map(n => `<option value="★${esc(n)}">★ ${esc(n)}</option>`).join('');
  sel.value = ui.palName;
}
function loadPalette(name) {
  const list = name.startsWith('★') ? customPalettes()[name.slice(1)] : PALETTES[name];
  if (!list) return;
  ui.palName = name; doc.palette = list.slice(); renderPalette(); renderPalSelect(); autosave();
}
$('#palSel').onchange = e => loadPalette(e.target.value);

// ---------- layers & frames UI ----------
const EYE = on => on ? '👁' : '—';
function thumb(canvas, src) {
  const x = canvas.getContext('2d'), k = Math.min(canvas.width / doc.w, canvas.height / doc.h);
  x.clearRect(0, 0, canvas.width, canvas.height); x.imageSmoothingEnabled = false;
  x.drawImage(src, (canvas.width - doc.w * k) / 2, (canvas.height - doc.h * k) / 2, doc.w * k, doc.h * k);
}
function renderLayers() {
  const box = $('#layers'); box.innerHTML = '';
  for (let i = doc.layers.length - 1; i >= 0; i--) {
    const L = doc.layers[i], row = document.createElement('div');
    row.className = 'layer' + (i === cur.layer ? ' active' : '') + (L.visible ? '' : ' hidden');
    row.innerHTML = `<button class="eye" title="Show / hide">${EYE(L.visible)}</button><canvas width="68" height="68"></canvas>
      <span class="name">${esc(L.name)}${L.guide ? ' <i>guide</i>' : ''}</span><button class="lock" title="Lock">${L.locked ? '🔒' : '🔓'}</button>`;
    tmpCtx.putImageData(new ImageData(L.cels[cur.frame], doc.w, doc.h), 0, 0);
    thumb(row.querySelector('canvas'), tmp);
    row.onclick = () => { cur.layer = i; renderLayers(); };
    row.ondblclick = async () => { const n = await ask('Rename layer', L.name); if (n) { L.name = n; renderLayers(); autosave(); } };
    row.querySelector('.eye').onclick = e => { e.stopPropagation(); L.visible = !L.visible; afterEdit(); };
    row.querySelector('.lock').onclick = e => { e.stopPropagation(); L.locked = !L.locked; renderLayers(); };
    box.appendChild(row);
  }
  $('#layerOpacity').value = Math.round(layer().opacity * 100);
  $('#layerOpacityV').textContent = Math.round(layer().opacity * 100) + '%';
  $('#layerGuide').checked = !!layer().guide;
}
$('#layerOpacity').addEventListener('input', e => { layer().opacity = e.target.value / 100; $('#layerOpacityV').textContent = e.target.value + '%'; req(); });
$('#layerOpacity').addEventListener('change', () => afterEdit());
$('#layerGuide').addEventListener('change', e => { layer().guide = e.target.checked; renderLayers(); autosave(); });
function renderFrames() {
  const box = $('#frames'); box.innerHTML = '';
  for (let f = 0; f < doc.frames; f++) {
    const d = document.createElement('div');
    d.className = 'frame' + (f === cur.frame ? ' active' : '');
    d.innerHTML = `<canvas width="116" height="116"></canvas><span>${f + 1}</span>`;
    thumb(d.querySelector('canvas'), compose(f, scratchCtx));
    d.onclick = () => gotoFrame(f);
    box.appendChild(d);
  }
  box.children[cur.frame]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function gotoFrame(f) {
  cur.frame = ((f % doc.frames) + doc.frames) % doc.frames;
  document.querySelectorAll('.frame').forEach((el, i) => el.classList.toggle('active', i === cur.frame));
  if (!ui.playing) renderLayers();
  updateStatus(); req();
}

// ---------- templates (anime guides) ----------
function drawTemplate(kind) {
  const w = doc.w, h = doc.h, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  const s = Math.min(w, h), ox = (w - s) / 2, oy = (h - s) / 2;
  const P = (nx, ny) => [ox + nx * s, oy + ny * s];
  x.strokeStyle = '#4f9dff'; x.lineWidth = Math.max(1, Math.round(s / 160)); x.lineCap = 'round';
  const path = fn => { x.beginPath(); fn(); x.stroke(); };
  const mv = (a, b) => x.moveTo(...P(a, b)), ln = (a, b) => x.lineTo(...P(a, b));
  const bz = (a, b, c1, d, e, f) => x.bezierCurveTo(...P(a, b), ...P(c1, d), ...P(e, f));
  const ell = (cx, cy, rx, ry, rot = 0) => path(() => x.ellipse(...P(cx, cy), rx * s, ry * s, rot, 0, Math.PI * 2));
  const eye = (cx, cy, flip = 1, sc = 1) => {
    path(() => { mv(cx - .07 * sc * flip, cy - .01 * sc); bz(cx - .04 * sc * flip, cy - .06 * sc, cx + .04 * sc * flip, cy - .065 * sc, cx + .075 * sc * flip, cy - .025 * sc); });
    ell(cx, cy + .012 * sc, .035 * sc, .05 * sc);
    path(() => { mv(cx - .05 * sc * flip, cy + .06 * sc); ln(cx + .04 * sc * flip, cy + .058 * sc); });
    path(() => { mv(cx - .05 * sc * flip, cy - .085 * sc); bz(cx - .02 * sc * flip, cy - .1 * sc, cx + .03 * sc * flip, cy - .1 * sc, cx + .07 * sc * flip, cy - .08 * sc); });
  };
  if (kind === 'face') {
    ell(.5, .38, .25, .23);
    path(() => { mv(.25, .42); bz(.26, .6, .4, .72, .5, .78); bz(.6, .72, .74, .6, .75, .42); });
    x.globalAlpha = .6;
    path(() => { mv(.5, .14); ln(.5, .8); mv(.27, .5); ln(.73, .5); mv(.3, .62); ln(.7, .62); });
    x.globalAlpha = 1;
    eye(.39, .52, 1); eye(.61, .52, -1);
    path(() => { mv(.5, .62); ln(.49, .64); mv(.465, .7); bz(.485, .71, .515, .71, .535, .7); });
    path(() => { mv(.43, .73); ln(.42, .9); mv(.57, .73); ln(.58, .9); mv(.42, .88); bz(.3, .9, .18, .93, .08, 1); mv(.58, .88); bz(.7, .9, .82, .93, .92, 1); });
    path(() => { x.arc(...P(.5, .38), .29 * s, Math.PI * .92, Math.PI * 2.08); });
    path(() => { mv(.24, .45); ln(.3, .3); ln(.34, .44); ln(.4, .28); ln(.46, .4); ln(.52, .27); ln(.58, .4); ln(.64, .29); ln(.68, .43); ln(.73, .31); ln(.76, .45); });
  } else if (kind === 'face34') {
    ell(.47, .38, .24, .23);
    path(() => { mv(.24, .42); bz(.27, .62, .42, .74, .55, .78); bz(.64, .72, .7, .62, .7, .5); });
    x.globalAlpha = .6;
    path(() => { mv(.57, .15); bz(.64, .35, .63, .6, .55, .78); mv(.25, .5); ln(.72, .5); });
    x.globalAlpha = 1;
    eye(.43, .52, 1); eye(.63, .52, -1, .7);
    path(() => { mv(.66, .58); ln(.69, .63); ln(.66, .64); mv(.55, .7); ln(.62, .69); });
    ell(.28, .52, .03, .06);
    path(() => { mv(.4, .72); ln(.38, .9); mv(.55, .76); ln(.57, .9); });
  } else if (kind === 'chibi') {
    ell(.5, .33, .27, .24);
    path(() => { mv(.23, .36); bz(.26, .5, .38, .56, .5, .58); bz(.62, .56, .74, .5, .77, .36); });
    eye(.39, .42, 1, 1.2); eye(.61, .42, -1, 1.2);
    path(() => { mv(.47, .52); bz(.49, .535, .51, .535, .53, .52); });
    path(() => { mv(.42, .58); ln(.38, .8); ln(.62, .8); ln(.58, .58); });
    path(() => { mv(.41, .62); ln(.31, .74); mv(.59, .62); ln(.69, .74); mv(.44, .8); ln(.43, .95); mv(.56, .8); ln(.57, .95); });
    path(() => { x.arc(...P(.5, .33), .31 * s, Math.PI * .95, Math.PI * 2.05); });
  } else if (kind === 'body') {
    const top = h * .04, H = h * .92, u = H / 8, cx = w / 2;
    x.globalAlpha = .45;
    for (let i = 0; i <= 8; i++) path(() => { x.moveTo(cx - u * 1.6, top + i * u); x.lineTo(cx + u * 1.6, top + i * u); });
    x.globalAlpha = 1;
    const Q = (dx, dy) => [cx + dx * u, top + dy * u];
    path(() => x.ellipse(cx, top + u * .5, u * .38, u * .5, 0, 0, Math.PI * 2));
    const seg = pts => path(() => { x.moveTo(...Q(...pts[0])); pts.slice(1).forEach(p => x.lineTo(...Q(...p))); });
    seg([[0, 1], [0, 1.3]]);
    seg([[-.9, 1.5], [.9, 1.5]]);
    seg([[-.9, 1.5], [-.55, 3], [-.7, 4]]); seg([[.9, 1.5], [.55, 3], [.7, 4]]);
    seg([[-.7, 4], [.7, 4]]);
    seg([[-.9, 1.5], [-1.05, 2.7], [-1.1, 3.8]]); seg([[.9, 1.5], [1.05, 2.7], [1.1, 3.8]]);
    seg([[-.4, 4], [-.38, 6], [-.35, 7.85], [-.6, 8]]); seg([[.4, 4], [.38, 6], [.35, 7.85], [.6, 8]]);
    for (const [a, b] of [[-.55, 3], [.55, 3], [-.38, 6], [.38, 6], [-1.05, 2.7], [1.05, 2.7]])
      path(() => x.arc(...Q(a, b), Math.max(1.5, u * .07), 0, Math.PI * 2));
  } else if (kind === 'eye') {
    const E = (a, b) => P(a, b);
    x.lineWidth = Math.max(2, Math.round(s / 60));
    path(() => { x.moveTo(...E(.12, .5)); x.bezierCurveTo(...E(.25, .22), ...E(.65, .18), ...E(.9, .38)); });
    x.lineWidth = Math.max(1, Math.round(s / 160));
    ell(.5, .52, .17, .22);
    ell(.5, .56, .08, .11);
    ell(.44, .42, .05, .04); ell(.58, .66, .025, .02);
    path(() => { x.moveTo(...E(.22, .76)); x.bezierCurveTo(...E(.35, .8), ...E(.55, .8), ...E(.72, .74)); });
    path(() => { x.moveTo(...E(.15, .18)); x.bezierCurveTo(...E(.35, .08), ...E(.6, .07), ...E(.85, .15)); });
  }
  // Threshold anti-aliasing away so guides are crisp pixels.
  const d = x.getImageData(0, 0, w, h).data, out = blank();
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 90) { out[i] = 79; out[i + 1] = 157; out[i + 2] = 255; out[i + 3] = 255; }
  return out;
}

// ---------- document lifecycle ----------
function newDoc(w, h, { template = 'none', layers = 'anime', bg = 'none' } = {}) {
  Object.assign(doc, { w, h, frames: 1, layers: [] });
  sizeBuffers();
  const fillBg = L => { if (bg === 'none') return L; const c = hexToRgba(bg), a = L.cels[0]; for (let i = 0; i < a.length; i += 4) a.set(c, i); return L; };
  if (layers === 'anime') {
    doc.layers.push(fillBg(makeLayer('Background')));
    if (template !== 'none') doc.layers.push(makeLayer('Guide', { guide: true, opacity: .45 }));
    doc.layers.push(makeLayer('Flats'), makeLayer('Shading', { opacity: .9 }), makeLayer('Highlights'), makeLayer('Line Art'));
    cur.layer = doc.layers.length - 1;
  } else {
    doc.layers.push(fillBg(makeLayer('Layer 1')));
    if (template !== 'none') doc.layers.push(makeLayer('Guide', { guide: true, opacity: .45 }));
    cur.layer = doc.layers.length - 1;
  }
  if (template !== 'none') doc.layers.find(L => L.guide).cels[0] = drawTemplate(template);
  cur.frame = 0;
  undoStack.length = redoStack.length = 0;
  refreshAll(); fit();
}
function refreshAll() {
  if (cur.layer >= doc.layers.length) cur.layer = doc.layers.length - 1;
  if (cur.frame >= doc.frames) cur.frame = doc.frames - 1;
  $('#fps').value = doc.fps;
  renderLayers(); renderFrames(); renderPalette(); updateStatus(); autosave(); req();
}
function celToURL(c) { tmpCtx.putImageData(new ImageData(c, doc.w, doc.h), 0, 0); return tmp.toDataURL(); }
function serialize() {
  return { app: 'moonkai-pixel', v: 1, w: doc.w, h: doc.h, fps: doc.fps, frames: doc.frames, palette: doc.palette, palName: ui.palName,
    layers: doc.layers.map(L => ({ name: L.name, visible: L.visible, opacity: L.opacity, locked: L.locked, guide: L.guide, cels: L.cels.map(celToURL) })) };
}
const loadImg = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
async function deserialize(o) {
  if (o.app !== 'moonkai-pixel') throw new Error('Not a Moonkai Pixel project');
  const [c, x] = mk(); c.width = o.w; c.height = o.h;
  const layers = [];
  for (const L of o.layers) {
    const cels = [];
    for (const u of L.cels) { x.clearRect(0, 0, o.w, o.h); x.drawImage(await loadImg(u), 0, 0); cels.push(new Uint8ClampedArray(x.getImageData(0, 0, o.w, o.h).data)); }
    layers.push({ ...L, cels });
  }
  Object.assign(doc, { w: o.w, h: o.h, fps: o.fps || 8, frames: o.frames, layers, palette: o.palette || doc.palette });
  if (o.palName) ui.palName = o.palName;
  Object.assign(cur, { layer: layers.length - 1, frame: 0 });
  sizeBuffers(); undoStack.length = redoStack.length = 0;
  renderPalSelect(); refreshAll(); fit();
}
let saveTimer;
function autosave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { if (!store.set('pxs.autosave', serialize())) console.warn('Autosave skipped: storage full'); }, 1200);
}
// Inside a claude.ai artifact, files go through the viewer's downloads capability.
const dlCap = window.claude?.use ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
async function download(blob, name) {
  const cap = await dlCap;
  if (cap) {
    try { await cap.save({ filename: name, data: blob }); toast('Saved ' + name); }
    catch (e) { if (e?.code !== 'declined') toast(e?.code === 'rate_limited' ? 'A save prompt is already open' : 'Download is not available here. Right click the image to save it.'); }
    return;
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
// In-page replacements for prompt/confirm, plus a result window. Some embeds block downloads,
// so exports are also shown here where they can be saved with right click or long press.
const dlg = $('#askDlg');
function ask(title, value = '', { input = true, ok = 'OK', cancel = 'Cancel', text = '' } = {}) {
  $('#askTitle').textContent = title; $('#askText').textContent = text;
  const inp = $('#askInput'); inp.hidden = !input; inp.value = value;
  $('#askOk').textContent = ok; $('#askCancel').textContent = cancel;
  dlg.returnValue = ''; dlg.showModal(); if (input) inp.select();
  return new Promise(r => dlg.addEventListener('close', () => r(dlg.returnValue === 'ok' ? (input ? inp.value.trim() : true) : (input ? null : false)), { once: true }));
}
function showResult(blob, name) {
  const box = $('#resultBody'); box.innerHTML = '';
  $('#resultTitle').textContent = name;
  const fr = new FileReader();
  fr.onload = () => {
    if (blob.type.startsWith('image/')) {
      const img = new Image(); img.src = fr.result; img.alt = name; box.appendChild(img);
      box.insertAdjacentHTML('beforeend', '<p class="hint">Right click or long press the image to save it.</p>');
    } else {
      const ta = document.createElement('textarea'); ta.id = 'resultText'; ta.readOnly = true; box.appendChild(ta);
      blob.text().then(t => ta.value = t);
      box.insertAdjacentHTML('beforeend', '<p class="hint">Copy this text and keep it somewhere safe. Paste it back with Open → Paste.</p>');
    }
  };
  fr.readAsDataURL(blob);
  $('#resultDownload').onclick = () => download(blob, name);
  $('#resultCopy').hidden = blob.type.startsWith('image/');
  $('#resultCopy').onclick = async () => {
    const ta = $('#resultText');
    try { await navigator.clipboard.writeText(ta.value); toast('Copied'); } catch { ta.select(); toast('Press Ctrl+C to copy'); }
  };
  $('#resultDlg').showModal();
}
function rgbaToBlob(data, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').putImageData(new ImageData(data, w, h), 0, 0);
  return new Promise(r => c.toBlob(r, 'image/png'));
}

// ---------- structural edits ----------
function structural(fn) { pushUndo('full'); fn(); refreshAll(); }
function eachCel(fn) { for (const c of layer().cels) fn(c); }
const act = {
  new() { $('#newDlg').showModal(); },
  async open() {
    const r = await ask('Open project', '', { input: false, ok: 'Choose file', cancel: 'Paste text', text: 'Open a .pxs.json file, or paste project text you copied from Save.' });
    if (r) return $('#fileProject').click();
    if (dlg.returnValue !== 'cancel') return;
    const t = await ask('Paste project text', '');
    if (t) try { await deserialize(JSON.parse(t)); toast('Project opened'); } catch (e) { toast(e.message || 'That text is not a project'); }
  },
  save() { showResult(new Blob([JSON.stringify(serialize())], { type: 'application/json' }), 'artwork.pxs.json'); },
  export() { $('#exportDlg').showModal(); },
  import() { $('#fileImage').click(); },
  ref() { $('#fileRef').click(); },
  undo, redo,
  zoomIn: () => zoomStep(1), zoomOut: () => zoomStep(-1), fit,
  help() { $('#helpDlg').showModal(); },
  palAdd() { const hx = toHex(ui.primary); if (!doc.palette.includes(hx)) doc.palette.push(hx); renderPalette(); autosave(); },
  palRamp() {
    const c = ui.primary, ramp = [];
    for (let i = -3; i <= 3; i++) ramp.push(toHex(i ? shadeColor(c[0], c[1], c[2], Math.sign(i), Math.abs(i) * 11, true) : c));
    for (const hx of ramp) if (!doc.palette.includes(hx)) doc.palette.push(hx);
    renderPalette(); autosave(); toast('Added a 7-step shading ramp');
  },
  palExtract() {
    const seen = new Map();
    for (let f = 0; f < doc.frames; f++) {
      const d = frameRGBA(f);
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) { const hx = toHex([d[i], d[i + 1], d[i + 2]]); seen.set(hx, (seen.get(hx) || 0) + 1); }
    }
    if (!seen.size) return toast('Canvas is empty');
    doc.palette = [...seen].sort((a, b) => b[1] - a[1]).slice(0, 64).map(e => e[0]);
    renderPalette(); autosave(); toast(`Extracted ${doc.palette.length} colours`);
  },
  async palSave() {
    const n = await ask('Save palette as', ui.palName.replace('★', ''));
    if (!n) return;
    const all = customPalettes(); all[n] = doc.palette.slice(); store.set('pxs.palettes', all);
    ui.palName = '★' + n; renderPalSelect(); toast('Palette saved');
  },
  palDelete() {
    if (!ui.palName.startsWith('★')) return toast('Only saved palettes can be deleted');
    const all = customPalettes(); delete all[ui.palName.slice(1)]; store.set('pxs.palettes', all);
    ui.palName = 'Anime Essentials'; loadPalette(ui.palName);
  },
  layerAdd: () => structural(() => { doc.layers.splice(cur.layer + 1, 0, makeLayer('Layer ' + (doc.layers.length + 1))); cur.layer++; }),
  layerDup: () => structural(() => { const L = layer(); doc.layers.splice(cur.layer + 1, 0, { ...L, name: L.name + ' copy', cels: L.cels.map(c => c.slice()) }); cur.layer++; }),
  layerDel: () => doc.layers.length > 1 ? structural(() => { doc.layers.splice(cur.layer, 1); cur.layer = Math.max(0, cur.layer - 1); }) : toast('Need at least one layer'),
  layerUp: () => cur.layer < doc.layers.length - 1 && structural(() => { const L = doc.layers.splice(cur.layer, 1)[0]; doc.layers.splice(++cur.layer, 0, L); }),
  layerDown: () => cur.layer > 0 && structural(() => { const L = doc.layers.splice(cur.layer, 1)[0]; doc.layers.splice(--cur.layer, 0, L); }),
  layerMerge() {
    if (cur.layer === 0) return toast('No layer below');
    structural(() => {
      const top = layer(), below = doc.layers[cur.layer - 1];
      for (let f = 0; f < doc.frames; f++) {
        scratchCtx.clearRect(0, 0, doc.w, doc.h);
        tmpCtx.putImageData(new ImageData(below.cels[f], doc.w, doc.h), 0, 0); scratchCtx.drawImage(tmp, 0, 0);
        tmpCtx.putImageData(new ImageData(top.cels[f], doc.w, doc.h), 0, 0);
        scratchCtx.globalAlpha = top.visible ? top.opacity : 0; scratchCtx.drawImage(tmp, 0, 0); scratchCtx.globalAlpha = 1;
        below.cels[f] = new Uint8ClampedArray(scratchCtx.getImageData(0, 0, doc.w, doc.h).data);
      }
      doc.layers.splice(cur.layer--, 1);
    });
  },
  fxOutline: () => structural(() => eachCel(c => {
    const w = doc.w, h = doc.h, src = c.slice(), col = ui.primary;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (src[o + 3]) continue;
      const on = (xx, yy) => xx >= 0 && yy >= 0 && xx < w && yy < h && src[(yy * w + xx) * 4 + 3] > 0;
      if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) c.set([col[0], col[1], col[2], 255], o);
    }
  })),
  fxFlipH: () => structural(() => eachCel(c => { const u = new Uint32Array(c.buffer); for (let y = 0; y < doc.h; y++) u.subarray(y * doc.w, (y + 1) * doc.w).reverse(); })),
  fxFlipV: () => structural(() => eachCel(c => {
    const u = new Uint32Array(c.buffer), src = u.slice();
    for (let y = 0; y < doc.h; y++) u.set(src.subarray((doc.h - 1 - y) * doc.w, (doc.h - y) * doc.w), y * doc.w);
  })),
  fxClear: () => structural(() => cel().fill(0)),
  celToAll: () => doc.frames > 1 ? structural(() => { const c = cel(); layer().cels = layer().cels.map(() => c.slice()); }) : toast('Only one frame'),
  motion() {
    const kind = $('#motionSel').value, n = clamp(+$('#motionFrames').value || 8, 2, 48), scope = $('#motionScope').value;
    const offset = i => {
      const t = i / n, s = Math.sin(TAU * t);
      if (kind === 'float') return [0, Math.round(s * 2)];
      if (kind === 'bob') return [0, s > .5 ? 1 : 0];
      if (kind === 'hop') return [0, -Math.round(Math.abs(Math.sin(Math.PI * t)) * 4)];
      if (kind === 'sway') return [Math.round(s * 1.5), 0];
      if (kind === 'shake') return [[1, 0], [-1, 1], [0, -1], [-1, 0], [1, 1], [0, 0]][i % 6];
      return [0, 0];
    };
    structural(() => {
      const f0 = cur.frame;
      doc.layers.forEach((L, li) => {
        const src = L.cels[f0], moves = scope === 'all' || (scope === 'layer' ? li === cur.layer : li > 0);
        L.cels = Array.from({ length: n }, (_, i) => {
          if (!moves) return src.slice();
          if (kind === 'breathe') return breathe(src, Math.sin(TAU * i / n) > .3);
          const [dx, dy] = offset(i); return shiftCel(src, dx, dy);
        });
      });
      doc.frames = n; cur.frame = 0;
    });
    toast(`Made a ${n}-frame ${kind} loop. Press Enter to play`);
  },
  frameAdd: () => structural(() => { for (const L of doc.layers) L.cels.splice(cur.frame + 1, 0, blank()); doc.frames++; cur.frame++; }),
  frameDup: () => structural(() => { for (const L of doc.layers) L.cels.splice(cur.frame + 1, 0, L.cels[cur.frame].slice()); doc.frames++; cur.frame++; }),
  frameDel: () => doc.frames > 1 ? structural(() => { for (const L of doc.layers) L.cels.splice(cur.frame, 1); doc.frames--; }) : toast('Need at least one frame'),
  frameLeft: () => cur.frame > 0 && structural(() => { for (const L of doc.layers) L.cels.splice(cur.frame - 1, 0, L.cels.splice(cur.frame, 1)[0]); cur.frame--; }),
  frameRight: () => cur.frame < doc.frames - 1 && structural(() => { for (const L of doc.layers) L.cels.splice(cur.frame + 1, 0, L.cels.splice(cur.frame, 1)[0]); cur.frame++; }),
  play() {
    if (ui.playing) { clearTimeout(ui.playing); ui.playing = null; $('#playBtn').textContent = '▶'; renderLayers(); return; }
    if (doc.frames < 2) return toast('Add frames to animate');
    $('#playBtn').textContent = '❚❚';
    let step = 1;
    const tick = () => {
      ui.playing = setTimeout(tick, 1000 / doc.fps);
      if ($('#playMode').value === 'pingpong' && (cur.frame + step >= doc.frames || cur.frame + step < 0)) step = -step;
      gotoFrame(cur.frame + step);
    };
    ui.playing = setTimeout(tick, 1000 / doc.fps);
  },
};

function toggle(k) {
  ui[k] = !ui[k];
  document.querySelector(`[data-toggle="${k}"]`)?.classList.toggle('on', ui[k]);
  store.set('pxs.view', { grid: ui.grid, smooth: ui.smooth, onion: ui.onion });
  req();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act],[data-toggle]');
  if (!b) return;
  if (b.dataset.act) act[b.dataset.act]?.(); else toggle(b.dataset.toggle);
});
$('#fps').addEventListener('change', e => { doc.fps = clamp(+e.target.value || 8, 1, 60); e.target.value = doc.fps; autosave(); });
$('#refOpacity').addEventListener('input', e => { ui.refOpacity = e.target.value / 100; req(); });
$('#themeSel').addEventListener('change', e => { document.documentElement.dataset.ui = e.target.value; store.set('pxs.theme', e.target.value); makeChecker(); req(); });

// ---------- dialogs & files ----------
const sp = $('#sizePresets');
for (const [n, w, h] of SIZE_PRESETS) {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = `${n} ${w}×${h}`;
  b.onclick = () => { $('#nW').value = w; $('#nH').value = h; };
  sp.appendChild(b);
}
$('#newDlg').addEventListener('close', () => {
  if ($('#newDlg').returnValue !== 'ok') return;
  if (doc.layers.length) pushUndo('full');
  const keep = undoStack.slice();
  newDoc(clamp(+$('#nW').value || 128, 4, 512), clamp(+$('#nH').value || 128, 4, 512),
    { template: $('#nTpl').value, layers: $('#nLayers').value, bg: $('#nBg').value });
  undoStack.push(...keep); // New canvas can be undone
});
$('#exportDlg').addEventListener('close', async () => {
  if ($('#exportDlg').returnValue !== 'ok') return;
  const type = $('#xType').value, scale = +$('#xScale').value, smooth = $('#xFilter').value === 'smooth';
  const frames = type === 'png' ? [cur.frame] : [...Array(doc.frames).keys()];
  const imgs = frames.map(f => upscale(frameRGBA(f), doc.w, doc.h, scale, smooth));
  const { w, h } = imgs[0];
  if (type === 'png') return showResult(await rgbaToBlob(imgs[0].data, w, h), `frame${cur.frame + 1}.png`);
  if (type === 'gif') {
    if (w * h * imgs.length > 4e7) toast('Large GIF — this may take a moment');
    const bytes = encodeGIF(imgs.map(i => i.data), w, h, Math.max(2, Math.round(100 / doc.fps)));
    return showResult(new Blob([bytes], { type: 'image/gif' }), 'animation.gif');
  }
  const cols = +$('#xCols').value || imgs.length, rows = Math.ceil(imgs.length / cols);
  const c = document.createElement('canvas'); c.width = cols * w; c.height = rows * h;
  const x = c.getContext('2d');
  imgs.forEach((im, i) => x.putImageData(new ImageData(im.data, w, h), (i % cols) * w, (i / cols | 0) * h));
  c.toBlob(b => showResult(b, 'spritesheet.png'));
});
const readFile = (inp, fn) => inp.addEventListener('change', async () => { const f = inp.files[0]; inp.value = ''; if (f) try { await fn(f); } catch (err) { toast(err.message || 'Could not open file'); } });
readFile($('#fileProject'), async f => { await deserialize(JSON.parse(await f.text())); toast('Project opened'); });
readFile($('#fileRef'), async f => { ui.ref = await loadImg(URL.createObjectURL(f)); ui.refShow = true; $('[data-toggle="refShow"]').classList.add('on'); req(); toast('Reference loaded'); });
readFile($('#fileImage'), async f => {
  const img = await loadImg(URL.createObjectURL(f));
  const snap = await ask('Import image', '', { input: false, ok: 'Snap to palette', cancel: 'Keep colours', text: 'Match the imported colours to the current palette?' });
  const k = Math.min(doc.w / img.width, doc.h / img.height), w = img.width * k, h = img.height * k;
  scratchCtx.clearRect(0, 0, doc.w, doc.h); scratchCtx.imageSmoothingEnabled = true; scratchCtx.imageSmoothingQuality = 'high';
  scratchCtx.drawImage(img, (doc.w - w) / 2, (doc.h - h) / 2, w, h);
  const d = new Uint8ClampedArray(scratchCtx.getImageData(0, 0, doc.w, doc.h).data);
  const pal = doc.palette.map(hexToRgba);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) { d[i + 3] = 0; continue; }
    d[i + 3] = 255;
    if (!snap || !pal.length) continue;
    let best = pal[0], bd = Infinity;
    for (const p of pal) { const dr = d[i] - p[0], dg = d[i + 1] - p[1], db = d[i + 2] - p[2], dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db; if (dist < bd) { bd = dist; best = p; } }
    d[i] = best[0]; d[i + 1] = best[1]; d[i + 2] = best[2];
  }
  structural(() => {
    const L = makeLayer('Imported'); L.cels[cur.frame] = d;
    doc.layers.splice(cur.layer + 1, 0, L); cur.layer++;
  });
});

// ---------- status & toast ----------
function updateStatus() {
  const p = ui.hover, pos = p && inDoc(p) ? `${p.x}, ${p.y}` : '–';
  $('#status').textContent = `${pos}  ·  ${doc.w}×${doc.h}  ·  ${Math.round(ui.zoom * 100)}%  ·  ${layer()?.name ?? ''}  ·  frame ${cur.frame + 1}/${doc.frames}`;
}
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1600); }

// ---------- boot ----------
(async function boot() {
  const theme = store.get('pxs.theme', 'midnight');
  document.documentElement.dataset.ui = theme; $('#themeSel').value = theme;
  Object.assign(ui, store.get('pxs.view', {}));
  for (const k of ['grid', 'smooth', 'onion', 'symX', 'symY', 'refShow']) document.querySelector(`[data-toggle="${k}"]`)?.classList.toggle('on', ui[k]);
  makeChecker(); resizeView(); renderTools(); renderToolOpts(); renderBrushPresets();
  setColor('primary', ui.primary); setColor('secondary', ui.secondary);
  doc.palette = PALETTES[ui.palName].slice(); renderPalSelect();
  const saved = store.get('pxs.autosave', null);
  if (saved) { try { await deserialize(saved); toast('Restored your last session'); return; } catch (e) { console.warn(e); } }
  newDoc(128, 128, { template: 'face', layers: 'anime', bg: '#ffffff' });
})();
