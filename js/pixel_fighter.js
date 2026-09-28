// ============================================================
//  MOONKAI — PIXEL FIGHTER engine (the Moonkai Pixel Studio style, live in game).
//
//  A fighter is painted as outlined, cel-shaded pixel art from the game's own pose
//  joints (humanPose), then blitted back with crisp nearest-neighbour pixels.
//   • Pose blending: joints ease toward each new pose, so motion is smooth.
//   • Sprites are cached by their rounded joints + state, so still poses cost nothing.
//   • Each part repaints only its own bounding box, and colours snap to a palette
//     collected from the parts themselves, so edges stay crisp.
//   • Kicks leave a motion trail around the striking foot.
// ============================================================

const PixelArt = (() => {
  const hex3 = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const JOINTS = ['hip', 'sh', 'head', 'bK', 'bF', 'fK', 'fF', 'bE', 'bH', 'fE', 'fH'];
  const KICKS = { kick: 1, sweep: 1, air_mid: 1, air_light: 1 };
  const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

  function make(cfg) {
    const K = cfg.k || 0.5, [X0, Y0, UW, UH] = cfg.win, PW = Math.round(UW * K), PH = Math.round(UH * K);
    const mkc = () => { const c = document.createElement('canvas'); c.width = PW; c.height = PH; return [c, c.getContext('2d', { willReadFrequently: true })]; };
    const [cv, X] = mkc(), [tc, T] = mkc();
    const OUT = cfg.outline || '#0a0102', so = cfg.shadeOffset || 2.4, lw = 2 / K;
    const pal = [], palSet = new Set(), snapCache = new Map(), cache = new Map();
    const use = h => { if (!palSet.has(h)) { palSet.add(h); pal.push(hex3(h)); snapCache.clear(); } return h; };
    use(OUT);
    const setT = ctx => ctx.setTransform(K, 0, 0, K, -X0 * K, -Y0 * K);
    let dirty = null; // union of painted pixel rects this render
    const pxRect = bb => {
      const x0 = Math.max(0, Math.floor((bb[0] - X0) * K) - 3), y0 = Math.max(0, Math.floor((bb[1] - Y0) * K) - 3);
      const x1 = Math.min(PW, Math.ceil((bb[2] - X0) * K) + 3), y1 = Math.min(PH, Math.ceil((bb[3] - Y0) * K) + 3);
      return [x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0)];
    };
    const grow = r => { if (!r[2] || !r[3]) return; if (!dirty) dirty = r.slice(); else { const x1 = Math.max(dirty[0] + dirty[2], r[0] + r[2]), y1 = Math.max(dirty[1] + dirty[3], r[1] + r[3]); dirty[0] = Math.min(dirty[0], r[0]); dirty[1] = Math.min(dirty[1], r[1]); dirty[2] = x1 - dirty[0]; dirty[3] = y1 - dirty[1]; } };

    // ---- shape helpers (every Path2D carries a bounding box in game units) ----
    const withBB = (p, pts) => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of pts) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; } p.bb = [a, b, c, d]; return p; };
    const g = {
      K, OUT, X, use,
      cap(a, b, r) {
        const p = new Path2D(), d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d * r, ny = (b[0] - a[0]) / d * r;
        p.arc(a[0], a[1], r, 0, 7); p.moveTo(b[0] + r, b[1]); p.arc(b[0], b[1], r, 0, 7);
        p.moveTo(a[0] + nx, a[1] + ny); p.lineTo(b[0] + nx, b[1] + ny); p.lineTo(b[0] - nx, b[1] - ny); p.lineTo(a[0] - nx, a[1] - ny); p.closePath();
        p.bb = [Math.min(a[0], b[0]) - r, Math.min(a[1], b[1]) - r, Math.max(a[0], b[0]) + r, Math.max(a[1], b[1]) + r]; return p;
      },
      poly(pts) { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return withBB(p, pts); },
      ell(x, y, rx, ry, rot = 0, a0 = 0, a1 = 7) { const p = new Path2D(); p.ellipse(x, y, Math.max(.5, rx), Math.max(.5, ry), rot, a0, a1); if (a1 < 7) p.closePath(); const m = Math.max(rx, ry); p.bb = [x - m, y - m, x + m, y + m]; return p; },
      // cmds: [['M',x,y],['L',x,y],['Q',cx,cy,x,y]] -> closed path
      shape(cmds) {
        const p = new Path2D(), pts = [];
        for (const c of cmds) { if (c[0] === 'M') p.moveTo(c[1], c[2]); else if (c[0] === 'L') p.lineTo(c[1], c[2]); else p.quadraticCurveTo(c[1], c[2], c[3], c[4]); for (let i = 1; i < c.length; i += 2) pts.push([c[i], c[i + 1]]); }
        p.closePath(); return withBB(p, pts);
      },
      moved(p, m) {
        const q = new Path2D(); q.addPath(p, m); const [a, b, c, d] = p.bb, pts = [[a, b], [c, b], [a, d], [c, d]].map(([x, y]) => { const r = m.transformPoint(new DOMPoint(x, y)); return [r.x, r.y]; });
        return withBB(q, pts);
      },
      L: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
      // paint: shade fill, base fill nudged toward the light, outline underneath — only inside the parts' box
      paint(pieces, base, shade, outline = true) {
        use(base); use(shade);
        let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
        for (const p of pieces) { const q = p.bb; if (q[0] < a) a = q[0]; if (q[1] < b) b = q[1]; if (q[2] > c) c = q[2]; if (q[3] > d) d = q[3]; }
        const r = pxRect([a, b, c, d]); if (!r[2] || !r[3]) return; grow(r);
        T.setTransform(1, 0, 0, 1, 0, 0); T.clearRect(r[0], r[1], r[2], r[3]); setT(T);
        T.fillStyle = shade; for (const p of pieces) T.fill(p);
        T.globalCompositeOperation = 'source-atop'; T.fillStyle = base;
        T.save(); T.translate(-so, -so); for (const p of pieces) T.fill(p); T.restore();
        if (outline) { T.globalCompositeOperation = 'destination-over'; T.strokeStyle = OUT; T.lineWidth = lw; T.lineJoin = 'round'; for (const p of pieces) T.stroke(p); }
        T.globalCompositeOperation = 'source-over';
        X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(tc, r[0], r[1], r[2], r[3], r[0], r[1], r[2], r[3]); setT(X);
      },
      // flat detail drawing straight onto the sprite (no outline)
      fill(p, col) { use(col); X.fillStyle = col; X.fill(p); grow(pxRect(p.bb)); },
      line(pts, col, w, curve) {
        use(col); X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(pts[0][0], pts[0][1]);
        if (curve) X.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); else for (const q of pts.slice(1)) X.lineTo(q[0], q[1]);
        X.stroke(); const p = withBB(new Path2D(), pts); p.bb = [p.bb[0] - w, p.bb[1] - w, p.bb[2] + w, p.bb[3] + w]; grow(pxRect(p.bb));
      },
    };

    // ---- generic humanoid body (mirrors drawHumanoid's layering) ----
    g.humanoid = (P, S, hooks = {}) => {
      const lr = 5.5 * (S.limb || 1), ar = 4.5 * (S.limb || 1), bulk = S.bulk || 1, hips = S.hips || 1;
      const boot = (K1, F, col) => g.paint([g.cap(g.L(K1, F, .45), F, lr * 1.02), g.cap(F, [F[0] + 9 * (S.limb || 1), F[1] - 1], lr * .8)], col[0], col[1]);
      if (hooks.back) hooks.back(P);
      g.paint([g.cap(P.hip, P.bK, lr * 1.05), g.cap(P.bK, P.bF, lr * .92)], ...S.pantsFar);
      boot(P.bK, P.bF, S.bootsFar);
      g.paint([g.cap(P.sh, P.bE, ar)], ...(S.bareArms ? S.skinFar : S.topFar));
      g.paint([g.cap(P.bE, P.bH, ar * .92)], ...(S.bareArms && !S.gloves ? S.skinFar : S.topFar));
      g.paint([g.ell(P.bH[0], P.bH[1], ar * 1.1, ar * 1.1)], ...(S.gloveFar || S.skinFar));
      const sh = P.sh, hp = P.hip;
      g.paint([g.poly([[sh[0] - 13 * bulk, sh[1] - 2], [sh[0] + 13 * bulk, sh[1] - 2], [hp[0] + 10 * bulk * hips, hp[1] + 4], [hp[0] - 11 * bulk * hips, hp[1] + 4]]), g.cap([sh[0] - 11 * bulk, sh[1]], [sh[0] + 11 * bulk, sh[1]], 5 * bulk)], ...S.top);
      if (S.belt) g.paint([g.cap([hp[0] - 10 * bulk * hips, hp[1] + 2], [hp[0] + 10 * bulk * hips, hp[1] + 2], 2.6)], ...S.belt);
      if (S.skirt) g.paint([g.poly([[hp[0] - 12 * hips, hp[1]], [hp[0] + 12 * hips, hp[1]], [hp[0] + 18 * hips, hp[1] + 24], [hp[0] - 18 * hips, hp[1] + 24]])], ...S.skirt);
      if (hooks.chest) hooks.chest(P);
      g.paint([g.cap(P.hip, P.fK, lr * 1.1), g.cap(P.fK, P.fF, lr)], ...S.pants);
      if (S.kneepads) g.paint([g.ell(P.fK[0], P.fK[1], lr * 1.05, lr)], ...S.kneepads);
      boot(P.fK, P.fF, S.boots);
      g.paint([g.cap(P.sh, [P.head[0], P.head[1] + 6], 3.8 * (S.limb || 1))], ...S.skin);
      if (!S.noHead) g.paint([g.ell(P.head[0], P.head[1], 11, 11)], ...S.skin);
      if (hooks.head) hooks.head(P);
      if (hooks.pads) hooks.pads(P);
      g.paint([g.cap(P.sh, P.fE, ar * 1.05)], ...(S.bareArms ? S.skin : S.top));
      g.paint([g.cap(P.fE, P.fH, ar)], ...(S.bareArms && !S.gloves ? S.skin : S.top));
      if (S.bracers) g.paint([g.cap(g.L(P.fE, P.fH, .4), g.L(P.fE, P.fH, .85), ar * 1.15)], ...S.bracers);
      if (hooks.front) hooks.front(P);
      g.paint([g.ell(P.fH[0], P.fH[1], ar * 1.2, ar * 1.2)], ...(S.glove || S.skin));
    };

    function snap() {
      X.setTransform(1, 0, 0, 1, 0, 0);
      if (!dirty) return;
      const [x0, y0, w, h] = dirty, img = X.getImageData(x0, y0, w, h), d = img.data;
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
      X.putImageData(img, x0, y0);
    }

    function pose(v) {
      const target = humanPose(v.pose, v.anim || 0), k = cfg.blend ?? .5;
      let st = v._px;
      if (!st || st.kind !== cfg.id) st = v._px = { kind: cfg.id };
      if (!st.P) st.P = {};
      for (const j of JOINTS) st.P[j] = st.P[j] ? lerp2(st.P[j], target[j], k) : target[j].slice();
      const P = {};
      for (const j of JOINTS) P[j] = [Math.round(st.P[j][0] * K) / K, Math.round(st.P[j][1] * K) / K];
      return { P, st };
    }
    // smooth an angle across frames (for weapons), wrapping the short way round
    function ease(st, name, target, k = .6) {
      if (st[name] === undefined) return st[name] = target;
      let d = target - st[name]; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      return st[name] += d * k;
    }

    function draw(c, v) {
      if (cfg.override && cfg.override(c, v)) return;
      const t = v.anim || 0, { P, st } = pose(v), s = cfg.state(v, t, st);
      let key = JSON.stringify(s);
      for (const j of JOINTS) key += P[j][0] + ',' + P[j][1] + ';';
      let spr = cache.get(key);
      if (spr) { cache.delete(key); cache.set(key, spr); }
      else {
        dirty = null;
        X.setTransform(1, 0, 0, 1, 0, 0); X.clearRect(0, 0, PW, PH); setT(X);
        spr = { info: cfg.body(g, P, s) || {} };
        snap();
        spr.cv = document.createElement('canvas'); spr.cv.width = PW; spr.cv.height = PH; spr.cv.getContext('2d').drawImage(cv, 0, 0);
        cache.set(key, spr);
        if (cache.size > (cfg.cacheSize || 220)) cache.delete(cache.keys().next().value);
      }
      const B = cfg.B || 1;
      c.save(); c.scale(B, B);
      if (cfg.pre) cfg.pre(c, v, P, s);
      const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
      c.drawImage(spr.cv, X0, Y0, UW, UH);
      c.imageSmoothingEnabled = sm;
      if (v.move && KICKS[v.pose]) kickTrail(c, P, cfg.trail || 'rgba(255,255,255,');
      if (cfg.post) cfg.post(c, v, P, s, spr.info);
      c.restore();
    }
    function kickTrail(c, P, col) {
      const dx = P.fF[0] - P.hip[0], dy = P.fF[1] - P.hip[1], r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
      c.save(); c.lineCap = 'round';
      c.strokeStyle = col + '0.25)'; c.lineWidth = 12; c.beginPath(); c.arc(P.hip[0], P.hip[1], r, a + 1.1, a, true); c.stroke();
      c.strokeStyle = col + '0.8)'; c.lineWidth = 3; c.beginPath(); c.arc(P.hip[0], P.hip[1], r, a + .8, a, true); c.stroke();
      c.restore();
    }
    return { draw, g, ease };
  }

  // Pixel portrait: a 128x128 Pixel Studio bust drawn crisp into the 100x100 portrait box.
  // formB64 (optional): a separate bust for the transformed / ultimate look.
  function portrait(id, b64, fallback, formFx, formB64) {
    const load = src => { const img = new Image(); img.onload = () => { for (const k in PortraitCache) if (k.startsWith(id + ':')) delete PortraitCache[k]; }; img.src = 'data:image/png;base64,' + src; return img; };
    const img = load(b64), formImg = formB64 ? load(formB64) : null;
    return (c, opts = {}, def) => {
      const use = opts.form && formImg ? formImg : img;
      if (!use.complete || !use.naturalWidth) return fallback && fallback(c, opts, def);
      const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
      c.drawImage(use, 0, 0, 100, 100); c.imageSmoothingEnabled = sm;
      if (opts.form && formFx && !formImg) formFx(c);
    };
  }
  const formGlow = (inner, ember) => c => {
    c.save(); c.globalCompositeOperation = 'lighter';
    glowCircle(c, 50, 46, 60, inner, 'rgba(0,0,0,0)');
    c.fillStyle = ember; for (let i = 0; i < 14; i++) c.fillRect((i * 37) % 100, 96 - ((i * 23) % 70), 1.6, 1.6);
    c.restore();
  };
  return { make, portrait, formGlow };
})();
