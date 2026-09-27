// ============================================================
//  MOONKAI — model portraits. Every hand-drawn fighter's portrait is now rendered from its
//  own in-game body (the same draw code the fight uses), framed as a close bust with a
//  dramatic backdrop, rim light and a brow shadow. The head is located by probing the
//  model: drawHumanoid reports where it put the head.
// ============================================================
const MP_PROBE = document.createElement('canvas'); MP_PROBE.width = MP_PROBE.height = 8;
const _mpHeadCache = {};
function modelHead(def, form) {
  const k = def.id + (form ? ':f' : '');
  if (_mpHeadCache[k]) return _mpHeadCache[k];
  const pc = MP_PROBE.getContext('2d'); let head = null;
  const orig = drawHumanoid;
  drawHumanoid = (c, v, pal, ext = {}) => orig(c, v, pal, Object.assign({}, ext, { head(c2, P, v2) { if (!head) { const T = c2.getTransform(); head = T.transformPoint(new DOMPoint(P.head[0], P.head[1])); } if (ext.head) ext.head(c2, P, v2); } }));
  try { pc.setTransform(1, 0, 0, 1, 0, 0); drawCharAt(pc, def, 0, 0, 1, 1, mpPortraitView(def, form)); } catch (e) { }
  drawHumanoid = orig;
  return (_mpHeadCache[k] = head ? { x: head.x, y: head.y } : null);
}
function mpPortraitView(def, form) {
  const g = def.gauge ? def.gauge.max * 0.85 : 0;
  return { pose: 'idle', anim: 0.35, transformed: !!form, form: !!form, gauge: g, lnPhase: 3, status: {}, facing: 1 };
}
// draw the body without the held weapon (ext.front), so blades and maces don't cross the face
function mpBust(c, def, x, y, s, view) {
  const orig = drawHumanoid;
  drawHumanoid = (c2, v, pal, ext = {}) => orig(c2, v, pal, Object.assign({}, ext, { front: undefined }));
  try { drawCharAt(c, def, x, y, s, 1, view); } catch (e) { }
  drawHumanoid = orig;
}
function drawModelPortrait(c, opts, def) {
  const form = !!opts.form, S = 2.55, hd = modelHead(def, form);
  if (!hd) { if (def.drawPortraitOld) return def.drawPortraitOld(c, opts, def); return; }
  const hx = 50, hy = 48, ox = hx - hd.x * S, oy = hy - hd.y * S;
  const col = def.color || '#fff', col2 = def.color2 || '#111';
  // backdrop: deep gradient in the fighter's colours, a light source behind the head, speed streaks
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, col2); g.addColorStop(1, '#000'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter';
  glowCircle(c, hx + 8, hy - 6, form ? 70 : 55, hexA(col, form ? 0.45 : 0.3), 'rgba(0,0,0,0)');
  c.strokeStyle = hexA(col, 0.18); c.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = -20 + i * 16; c.beginPath(); c.moveTo(-10, y + 30); c.lineTo(110, y); c.stroke(); }
  if (form) { c.strokeStyle = hexA(col, 0.6); c.lineWidth = 3; c.beginPath(); c.arc(hx, hy, 40, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  const view = mpPortraitView(def, form);
  // rim light: the silhouette in the fighter's colour, nudged up-left behind the figure
  try {
    _octx.setTransform(1, 0, 0, 1, 0, 0); _octx.globalCompositeOperation = 'source-over'; _octx.clearRect(0, 0, W, H);
    const T = c.getTransform(); _octx.setTransform(T); mpBust(_octx, def, ox - 1.6, oy - 1.2, S, view);
    _octx.setTransform(1, 0, 0, 1, 0, 0); _octx.globalCompositeOperation = 'source-in'; _octx.fillStyle = col; _octx.fillRect(0, 0, W, H); _octx.globalCompositeOperation = 'source-over';
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 0.9; c.drawImage(_off, 0, 0); c.restore();
  } catch (e) { }
  mpBust(c, def, ox, oy, S, view);
  // brow shadow + vignette: nobody here looks friendly
  c.save();
  const s = c.createLinearGradient(0, hy - 34, 0, hy - 2); s.addColorStop(0, 'rgba(0,0,0,0.45)'); s.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = s; c.fillRect(0, hy - 34, 100, 32);
  const v = c.createRadialGradient(50, 48, 30, 50, 50, 78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.75)'); c.fillStyle = v; c.fillRect(0, 0, 100, 100);
  const b = c.createLinearGradient(0, 82, 0, 100); b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(1, 'rgba(0,0,0,0.85)'); c.fillStyle = b; c.fillRect(0, 82, 100, 18);
  c.fillStyle = col; c.fillRect(0, 98, 100, 2);
  c.restore();
}
function hexA(hex, a) {
  const h = (hex || '#fff').replace('#', ''), f = h.length === 3 ? h.split('').map(x => x + x).join('') : h.slice(0, 6);
  const n = parseInt(f, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
// every hand-drawn fighter (the reworked and the new ones) uses the model portrait
const MP_KEEP = ['mordekaiser']; // his pauldrons swallow the helm at bust scale; his painted portrait reads better
for (const d of ROSTER) if (d.handArt && d.draw && !MP_KEEP.includes(d.id)) { d.drawPortraitOld = d.drawPortrait; d.drawPortrait = drawModelPortrait; }
Object.keys(PortraitCache).forEach(k => delete PortraitCache[k]);
