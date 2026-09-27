// ============================================================
//  MOONKAI — AATROX pixel art (drawn with the Moonkai Pixel Studio style).
//
//  Aatrox is rendered live as cel-shaded pixel art: every frame takes the
//  game's own pose joints (humanPose) and Darkin Blade angle (aatSwordAng),
//  paints him at half resolution with outlines and palette-snapped colours,
//  then blits the sprite back with crisp nearest-neighbour pixels.
//  All moves, timings and states stay exactly as the game drives them.
// ============================================================

const AATPX = (() => {
  const K = 0.5;                                   // art pixels per game unit
  const X0 = -175, Y0 = -270, UW = 400, UH = 310;  // sprite window in game units
  const PW = Math.round(UW * K), PH = Math.round(UH * K);
  const mk = () => { const c = document.createElement('canvas'); c.width = PW; c.height = PH; return [c, c.getContext('2d', { willReadFrequently: true })]; };
  const [cv, X] = mk(), [tc, T] = mk();
  const OUT = '#0a0102';
  const PAL = [OUT, '#120304', '#150204', '#170507', '#1e0709', '#1e0a0c', '#2a0609', '#2a0a0c', '#2a0d10', '#3a080c', '#3a0a10', '#4a060c',
    '#5a1418', '#6e0f16', '#7a1a1e', '#9a1420', '#aa141e', '#6a1016', '#ff2a2a', '#ff5a3a', '#d8c8b0', '#a89880', '#e0d0b8', '#ffcf8a', '#d0101a', '#000000', '#1b0306', '#140405', '#150406'];
  const pal = PAL.map(h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; });
  const snapCache = new Map(), cache = new Map();
  const so = 2.4;                                  // cel-shade offset (units): light from top-left
  const lw = 2 / K;                                // outline stroke width (units) -> 1 art pixel outside

  const setT = ctx => ctx.setTransform(K, 0, 0, K, -X0 * K, -Y0 * K);
  // Fill pieces in shade, overlay the base colour shifted toward the light, outline underneath.
  function paint(pieces, base, shade, outline = true) {
    T.setTransform(1, 0, 0, 1, 0, 0); T.clearRect(0, 0, PW, PH); setT(T);
    T.fillStyle = shade; for (const p of pieces) T.fill(p);
    T.globalCompositeOperation = 'source-atop'; T.fillStyle = base;
    T.save(); T.translate(-so, -so); for (const p of pieces) T.fill(p); T.restore();
    if (outline) { T.globalCompositeOperation = 'destination-over'; T.strokeStyle = OUT; T.lineWidth = lw; T.lineJoin = 'round'; for (const p of pieces) T.stroke(p); }
    T.globalCompositeOperation = 'source-over';
    X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(tc, 0, 0); setT(X);
  }
  const cap = (a, b, r) => { const p = new Path2D(), d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d * r, ny = (b[0] - a[0]) / d * r;
    p.arc(a[0], a[1], r, 0, 7); p.moveTo(b[0] + r, b[1]); p.arc(b[0], b[1], r, 0, 7);
    p.moveTo(a[0] + nx, a[1] + ny); p.lineTo(b[0] + nx, b[1] + ny); p.lineTo(b[0] - nx, b[1] - ny); p.lineTo(a[0] - nx, a[1] - ny); p.closePath(); return p; };
  const poly = pts => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
  const ell = (x, y, rx, ry, rot = 0, a0 = 0, a1 = 7) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, a0, a1); if (a1 < 7) p.closePath(); return p; };
  const moved = (p, m) => { const q = new Path2D(); q.addPath(p, m); return q; };
  const L = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  // ---- the Darkin Blade: same geometry as the game's vector blade, with the eye ----
  function blade(hx, hy, len, ang, o) {
    const w = o.w || 1, bw = 14 * w, m = new DOMMatrix().translate(hx, hy).rotate(ang * 180 / Math.PI);
    paint([moved(cap([-24 * w, 0], [6, 0], 2.8 * w), m)], '#140405', '#0a0102');
    paint([moved(poly([[-24 * w, -4], [-34 * w, 0], [-24 * w, 4]]), m)], '#2a0a0c', '#150406');
    const body = new Path2D(); body.moveTo(12, -bw * .7);
    for (let i = 1; i <= 7; i++) body.lineTo(12 + (len - 12) * i / 8, -bw * .7 * (1 - i / 9) - (i % 2 ? 7 * w : 0));
    body.lineTo(len, bw * .05); body.quadraticCurveTo(len * .62, bw * 1.05, 12, bw * .75); body.closePath();
    paint([moved(body, m)], '#6e0f16', '#3a080c');
    X.save(); X.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    X.strokeStyle = o.glow > 0 ? '#ff5a3a' : '#aa141e'; X.lineWidth = 2.6 * w; X.lineCap = 'round';
    X.beginPath(); X.moveTo(18, bw * .12); X.quadraticCurveTo(len * .55, bw * .3, len * .9, bw * .08); X.stroke();
    X.strokeStyle = '#9a1420'; X.lineWidth = 1.6; X.beginPath(); X.moveTo(14, -bw * .62); X.lineTo(len * .96, -bw * .02); X.stroke();
    X.restore();
    const guard = new Path2D(); guard.moveTo(4, -18 * w); guard.quadraticCurveTo(14, -6, 8, 0); guard.quadraticCurveTo(14, 6, 4, 18 * w);
    guard.lineTo(16, 10); guard.lineTo(18, 0); guard.lineTo(16, -10); guard.closePath();
    paint([moved(guard, m)], '#1e0709', '#120304');
    // the eye: lid, sclera, slit iris, pupil
    const ex = len * .3, ew = 11 * w, eh = 7 * w * Math.max(.08, o.eye);
    paint([moved(ell(ex, 0, ew + 2.5, Math.max(3, eh + 2.5)), m)], '#150204', '#150204');
    X.save(); X.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    if (o.eye > .1) {
      X.fillStyle = '#ffcf8a'; X.beginPath(); X.ellipse(ex, 0, ew, eh, 0, 0, 7); X.fill();
      X.fillStyle = '#d0101a'; X.beginPath(); X.ellipse(ex, 0, ew * .45, eh, 0, 0, 7); X.fill();
      X.fillStyle = '#000000'; X.beginPath(); X.ellipse(ex, 0, Math.max(1.2, ew * .14), eh * .9, 0, 0, 7); X.fill();
    } else { X.strokeStyle = '#ff2a2a'; X.lineWidth = 2; X.beginPath(); X.moveTo(ex - ew, 0); X.lineTo(ex + ew, 0); X.stroke(); }
    X.restore();
    return m.transformPoint(new DOMPoint(ex, 0));
  }

  // ---- bat wings (same rig as the game) ----
  function wings(P, t, big) {
    const s = big ? 1.25 : .55, flap = Math.sin(t * (big ? 5 : 2.5)) * (big ? .12 : .04);
    for (const side of [-1, 1]) {
      const m = new DOMMatrix().translate(P.sh[0] - 6, P.sh[1] + 2).rotate(((big ? -.35 : -.95) + side * (big ? .28 : .12) + flap * side) * 180 / Math.PI).scale(s, s);
      const mem = new Path2D(); mem.moveTo(0, 0); mem.lineTo(-34, -40); mem.lineTo(-92, -72); mem.quadraticCurveTo(-84, -48, -104, -22);
      mem.quadraticCurveTo(-86, -10, -86, 18); mem.quadraticCurveTo(-64, 12, -44, 34); mem.quadraticCurveTo(-26, 16, 0, 10); mem.closePath();
      const far = side < 0;
      paint([moved(mem, m)], far ? '#2a0609' : '#4a060c', far ? '#1b0306' : '#2a0609');
      const pt = (x, y) => { const q = m.transformPoint(new DOMPoint(x, y)); return [q.x, q.y]; };
      const J = pt(-34, -40), r = Math.max(1.6, 2.2 * s);
      paint([cap(pt(0, 0), J, r), cap(J, pt(-92, -72), r), cap(J, pt(-104, -22), r * .8), cap(J, pt(-86, 18), r * .8), cap(J, pt(-44, 34), r * .8)], '#1e0709', '#120304');
      paint([poly([J, pt(-40, -54), pt(-29, -44)])], '#d8c8b0', '#a89880');
    }
  }

  function snap() {
    X.setTransform(1, 0, 0, 1, 0, 0);
    const img = X.getImageData(0, 0, PW, PH), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
      const key = d[i] << 16 | d[i + 1] << 8 | d[i + 2];
      let c = snapCache.get(key);
      if (!c) {
        let bd = 1e9;
        for (const q of pal) { const e = (d[i] - q[0]) ** 2 * 2 + (d[i + 1] - q[1]) ** 2 * 4 + (d[i + 2] - q[2]) ** 2 * 3; if (e < bd) { bd = e; c = q; } }
        snapCache.set(key, c);
      }
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    X.putImageData(img, 0, 0);
  }

  function draw(c, v) {
    const t = v.anim || 0, D = !!v.transformed;
    if (v.state === 'cocoon') { drawAatroxCocoon(c, v, t); return; }
    // Pixel-art timing: the pose clock steps at 15 fps and finished sprites are cached,
    // so each pose is painted once and reused across game frames.
    const tq = Math.round(t * 15) / 15, P = humanPose(v.pose, tq), B = 1.04;
    const ready = v.dbReady ? .6 + .4 * Math.sin(tq * 8) : 0, blink = (tq % 4.3) < .12 ? .1 : 1;
    const eye = (v.dbReady || D ? 1 : .35) * blink, glow = Math.max(ready, D ? .45 : 0), ang = aatSwordAng(v);
    const len = D ? 150 : 124, bw = D ? 1.15 : 1;
    const key = `${v.pose}|${tq}|${D ? 1 : 0}|${eye}|${glow > 0 ? 1 : 0}|${Math.round(ang * 20)}`;
    let spr = cache.get(key), eyeAt;
    if (spr) { cache.delete(key); cache.set(key, spr); eyeAt = spr.eyeAt; }
    else {
    X.setTransform(1, 0, 0, 1, 0, 0); X.clearRect(0, 0, PW, PH); setT(X);
    const skin = D ? ['#9a1420', '#6e0f16'] : ['#7a1a1e', '#5a1418'], skinF = D ? ['#6e0f16', '#4a060c'] : ['#5a1418', '#3a0a10'];
    const acc = D ? '#ff2a2a' : '#6a1016';

    wings(P, tq, D);
    // far limbs (darker)
    paint([cap(P.hip, P.bK, 5.8), cap(P.bK, P.bF, 5)], '#1e0709', '#150406');
    paint([cap(L(P.bK, P.bF, .45), P.bF, 5.4), cap(P.bF, [P.bF[0] + 9, P.bF[1] - 1], 4.2)], '#150204', OUT);
    paint([cap(P.sh, P.bE, 4.8)], ...skinF);
    paint([cap(P.bE, P.bH, 4.4)], '#1e0709', '#120304');
    paint([ell(P.bH[0], P.bH[1], 5, 5)], '#1e0709', '#120304');
    // torso: plated cuirass over crimson flesh
    const sh = P.sh, hp = P.hip;
    paint([poly([[sh[0] - 13, sh[1] - 2], [sh[0] + 13, sh[1] - 2], [hp[0] + 10, hp[1] + 4], [hp[0] - 11, hp[1] + 4]]), cap([sh[0] - 11, sh[1]], [sh[0] + 11, sh[1]], 5)], ...skin);
    paint([poly([[sh[0] - 11, sh[1] + 4], [sh[0] + 12, sh[1] + 4], [hp[0] + 9, hp[1] - 6], [hp[0] - 9, hp[1] - 6]])], '#2a0d10', '#170507');
    X.strokeStyle = D ? '#ff5a3a' : '#9a1420'; X.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const k = .38 + i * .17, x = hp[0] + (sh[0] - hp[0]) * k, y = hp[1] + (sh[1] - hp[1]) * k; X.beginPath(); X.moveTo(x - 8, y + 2); X.quadraticCurveTo(x, y - 4, x + 8, y + 2); X.stroke(); }
    paint([cap([hp[0] - 11, hp[1] + 2], [hp[0] + 11, hp[1] + 2], 3)], acc, '#3a080c');
    paint([ell(hp[0] + 2, hp[1] + 2, 3.2, 3.2)], '#ff2a2a', '#aa141e', false);
    // near leg
    paint([cap(P.hip, P.fK, 6.2), cap(P.fK, P.fF, 5.4)], '#2a0a0c', '#150406');
    paint([cap(L(P.fK, P.fF, .45), P.fF, 5.8), cap(P.fF, [P.fF[0] + 10, P.fF[1] - 1], 4.5)], '#1e0709', OUT);
    paint([ell(P.fK[0], P.fK[1], 6, 5.5)], '#2a0d10', '#170507');
    // neck + head: skull-helm, bone horns, fanged jaw, burning eye slit
    paint([cap(P.sh, [P.head[0], P.head[1] + 6], 4.4)], ...skin);
    const [hx, hy] = P.head, H2 = D ? 1.35 : 1;
    const horn = (x0, y0, cx, cy, x1, y1, x2, y2) => { const p = new Path2D(); p.moveTo(x0, y0); p.quadraticCurveTo(cx, cy, x1, y1); p.quadraticCurveTo(x2, y2, x0 + 7, y0 - 3); p.closePath(); return p; };
    paint([horn(hx - 6, hy - 9, hx - 22 * H2, hy - 16 * H2, hx - 30 * H2, hy - 40 * H2, hx - 16 * H2, hy - 24)], '#d8c8b0', '#a89880');
    paint([horn(hx + 2, hy - 12, hx + 4, hy - 26 * H2, hx - 6 * H2, hy - 34 * H2, hx, hy - 22)], '#a89880', '#7a6c5a');
    paint([poly([[hx - 12, hy - 5], [hx - 6, hy - 13], [hx + 8, hy - 12], [hx + 15, hy - 4], [hx + 18, hy + 5], [hx + 11, hy + 13], [hx + 2, hy + 11], [hx - 8, hy + 8]])], '#2a0d10', '#170507');
    X.strokeStyle = '#6a1016'; X.lineWidth = 1.6; X.beginPath(); X.moveTo(hx - 4, hy - 11); X.lineTo(hx + 14, hy - 3); X.stroke();
    X.fillStyle = OUT; X.beginPath(); X.moveTo(hx + 4, hy + 5); X.lineTo(hx + 17, hy + 5); X.lineTo(hx + 12, hy + 10); X.lineTo(hx + 4, hy + 9); X.fill();
    X.fillStyle = '#e0d0b8'; for (let i = 0; i < 4; i++) { const f0 = hx + 5 + i * 3; X.beginPath(); X.moveTo(f0, hy + 5); X.lineTo(f0 + 1.5, hy + 9); X.lineTo(f0 + 3, hy + 5); X.fill(); }
    X.fillStyle = '#ff2a2a'; X.beginPath(); X.moveTo(hx + 3, hy - 5); X.lineTo(hx + 16, hy - 2); X.lineTo(hx + 5, hy); X.fill();
    X.fillStyle = '#ffcf8a'; X.beginPath(); X.moveTo(hx + 6, hy - 3.5); X.lineTo(hx + 13, hy - 2); X.lineTo(hx + 7, hy - 1.5); X.fill();
    // spiked pauldron
    paint([ell(sh[0] + 2, sh[1] + 2, 15, 10, -.2, Math.PI, Math.PI * 2.1)], '#2a0d10', '#170507');
    paint([[-8, 16], [0, 22], [8, 15]].map(([dx, h]) => poly([[sh[0] + dx - 3, sh[1] - 4], [sh[0] + dx - 5, sh[1] - 4 - h], [sh[0] + dx + 3, sh[1] - 5]])), '#1e0709', '#120304');
    X.strokeStyle = D ? '#ff2a2a' : '#6a1016'; X.lineWidth = 2; X.beginPath(); X.ellipse(sh[0] + 2, sh[1] + 2, 15, 10, -.2, Math.PI, Math.PI * 2.1); X.stroke();
    // near arm + blood tendrils + the Darkin Blade in hand
    paint([cap(P.sh, P.fE, 5.2)], ...skin);
    paint([cap(P.fE, P.fH, 4.8), cap(L(P.fE, P.fH, .4), L(P.fE, P.fH, .85), 5.4)], '#2a0d10', '#170507');
    eyeAt = blade(P.fH[0], P.fH[1], len, ang, { eye, glow, w: bw });
    X.strokeStyle = D ? '#ff5a3a' : '#aa141e'; X.lineWidth = 2;
    for (const k of [.4, .7]) { const e = L(P.fE, P.fH, k); X.beginPath(); X.moveTo(e[0], e[1]); X.quadraticCurveTo(e[0] + 6, e[1] - 8 + Math.sin(tq * 6 + k * 9) * 3, P.fH[0], P.fH[1]); X.stroke(); }
    paint([ell(P.fH[0], P.fH[1], 5.6, 5.6)], '#2a0d10', '#170507');
    snap();
    spr = document.createElement('canvas'); spr.width = PW; spr.height = PH; spr.getContext('2d').drawImage(cv, 0, 0); spr.eyeAt = eyeAt;
    cache.set(key, spr);
    if (cache.size > 160) cache.delete(cache.keys().next().value);
    }
    const [hx, hy] = P.head;

    // blit with crisp pixels, then the game's glow effects on top
    c.save(); c.scale(B, B);
    if (D) glowCircle(c, 0, -70, 130, 'rgba(255,20,30,0.3)', 'rgba(80,0,0,0)');
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(spr, X0, Y0, UW, UH);
    c.imageSmoothingEnabled = sm;
    c.globalCompositeOperation = 'lighter';
    glowCircle(c, hx + 10, hy - 3, D ? 11 : 7, 'rgba(255,40,20,0.9)', 'rgba(255,0,0,0)');
    if (glow > 0) {
      c.save(); c.translate(P.fH[0], P.fH[1]); c.rotate(ang);
      c.strokeStyle = `rgba(255,40,30,${0.3 * glow})`; c.lineWidth = 12 * bw; c.beginPath(); c.moveTo(14, 0); c.lineTo(len, 0); c.stroke(); c.restore();
      glowCircle(c, eyeAt.x, eyeAt.y, 22 * bw * glow, 'rgba(255,60,30,0.9)', 'rgba(255,0,0,0)');
    }
    c.globalCompositeOperation = 'source-over';
    c.restore();
  }

  // Portrait: the Pixel Studio Aatrox bust (pixel/examples/aatrox.png, 128x128).
  const portraitImg = new Image();
  portraitImg.onload = () => { for (const k in PortraitCache) if (k.startsWith('aatrox:')) delete PortraitCache[k]; };
  portraitImg.src = 'data:image/png;base64,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';
  function portrait(c, opts = {}) {
    if (!portraitImg.complete || !portraitImg.naturalWidth) { drawAatroxPortraitVector(c, opts); return; }
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(portraitImg, 0, 0, 100, 100);
    c.imageSmoothingEnabled = sm;
    if (opts.form) { // World Ender: burning aura and embers
      c.globalCompositeOperation = 'lighter';
      glowCircle(c, 50, 46, 60, 'rgba(255,30,20,0.35)', 'rgba(255,0,0,0)');
      c.fillStyle = 'rgba(255,90,40,0.85)';
      for (let i = 0; i < 14; i++) c.fillRect((i * 37) % 100, 96 - ((i * 23) % 70), 1.6, 1.6);
      c.globalCompositeOperation = 'source-over';
    }
  }
  return { draw, portrait };
})();
function drawAatroxPixel(c, v) { AATPX.draw(c, v); }
function drawAatroxPixelPortrait(c, opts) { AATPX.portrait(c, opts); }
