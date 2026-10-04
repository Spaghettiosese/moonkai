// ============================================================
//  MOONKAI — PXKIT: helpers shared by the pixel-art remakes.
//   • portrait(): paints a 100x100 bust at low resolution, posterises it with an ordered
//     dither and blits it back with crisp nearest-neighbour pixels (a Pixel Studio look
//     without needing a baked PNG).
//   • scene(): renders a cinematic backdrop at low resolution and scales it up, so skies,
//     rays and bursts are made of real pixels like the fighters are.
//   • actor(): a persistent view object so pixel fighters in cutscenes blend between poses.
//   • on(): honours Settings → PIXEL ART FIGHTERS.
// ============================================================
const PxKit = (() => {
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const on = () => !(typeof Save !== 'undefined' && Save.set && Save.set.pixelArt === false);

  // quantise one canvas in place: `levels` steps per channel with a 4x4 ordered dither
  function posterize(ctx, w, h, levels = 6, dither = 0.5) {
    const img = ctx.getImageData(0, 0, w, h), d = img.data, st = 255 / (levels - 1);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, th = (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * st * dither;
      for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, Math.round((d[i + k] + th) / st) * st));
    }
    ctx.putImageData(img, 0, 0);
  }

  // drawFn(c, opts, def) paints the bust into a 100x100 box
  function portrait(id, drawFn, o = {}) {
    const res = o.res || 64, levels = o.levels || 7, cache = {};
    return (c, opts = {}, def) => {
      const key = (opts.form ? 'F' : 'N') + (opts.alt ? 'A' : '') + (def && def.portraitId ? def.portraitId : '');
      let img = cache[key];
      if (!img) {
        img = mk(res, res); const x = img.getContext('2d', { willReadFrequently: true });
        x.save(); x.scale(res / 100, res / 100); drawFn(x, opts, def); x.restore();
        posterize(x, res, res, levels, o.dither ?? 0.55);
        if (o.outline !== false) { // dark rim around the bust edge so it reads like sprite art
          const d = x.getImageData(0, 0, res, res); const a = d.data;
          for (let i = 0; i < res; i++) for (const [px, py] of [[i, 0], [i, res - 1], [0, i], [res - 1, i]]) { const j = (py * res + px) * 4; a[j] *= .55; a[j + 1] *= .55; a[j + 2] *= .55; }
          x.putImageData(d, 0, 0);
        }
        cache[key] = img;
      }
      const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false; c.drawImage(img, 0, 0, 100, 100); c.imageSmoothingEnabled = sm;
    };
  }

  // Low-res backdrop: fn(ctx, W/k, H/k) draws in *screen* units (the context is pre-scaled by k).
  const scenes = new Map();
  function scene(c, fn, k = 0.34, levels = 0) {
    const w = Math.ceil(W * k), h = Math.ceil(H * k);
    let s = scenes.get(w); if (!s) { const cv = mk(w, h); s = { cv, x: cv.getContext('2d', { willReadFrequently: true }) }; scenes.set(w, s); }
    s.x.setTransform(1, 0, 0, 1, 0, 0); s.x.clearRect(0, 0, w, h); s.x.setTransform(k, 0, 0, k, 0, 0); s.x.globalCompositeOperation = 'source-over'; s.x.globalAlpha = 1;
    fn(s.x);
    if (levels) { s.x.setTransform(1, 0, 0, 1, 0, 0); posterize(s.x, w, h, levels, 0.4); }
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false; c.drawImage(s.cv, 0, 0, W, H); c.imageSmoothingEnabled = sm;
  }

  // persistent view for a def so cutscene sprites ease between poses. Usage: const A = PxKit.actor(def); A(c,x,y,s,t,pose,{transformed:true},facing)
  function actor(def) {
    const v = {};
    return (c, x, y, s, t, pose, extra, facing = 1) => { c.save(); c.translate(x, y); c.scale(s * facing, s); Object.assign(v, { pose, anim: t, def }, extra); def.draw(c, v); c.restore(); };
  }

  // chunky pixel star / diamond / square helpers for cinematics
  const px = (c, x, y, s, col) => { c.fillStyle = col; c.fillRect(Math.round(x / s) * s, Math.round(y / s) * s, s, s); };
  return { posterize, portrait, scene, actor, on, px, mk };
})();
