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

// ---------------------------------------------------------------------------------------------
//  Revival cinematic builder.  PxKit.reviveCs(f, o) -> cutscene
//   o: { name, title, sub, caption, c1, c2, c3 (palette), motif: 'embers'|'rings'|'rays'|'shards'|'leaves'|'bolts'|'notes',
//        bg(x,t,k,burst) optional low-res backdrop painter, cues: [[t,fn]...], sfx(name) hook, wasForm, extra: view props }
//  The body lies broken, the motif gathers into it, it flashes, and rises transformed.
// ---------------------------------------------------------------------------------------------
PxKit.clamp01 = v => Math.max(0, Math.min(1, v));
PxKit.reviveCs = function (f, o) {
  const fx = new ParticleSystem(1600), A = PxKit.actor(f.def), c1 = o.c1 || '#ffd35a', c2 = o.c2 || '#ffffff', c3 = o.c3 || '#802000', cx = W / 2, gy = H - 60, S = 3.0;
  const spawn = () => {
    const n = o.motif === 'bolts' ? 2 : 4;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, R = 380 + Math.random() * 260, x = cx + Math.cos(a) * R * 1.4, y = gy - 150 + Math.sin(a) * R * .8, life = .7 + Math.random() * .5, col = [c1, c2, c1, c3][i & 3];
      const base = { x, y, vx: (cx - x) / life, vy: (gy - 150 - y) / life, life, color: col, glow: true };
      if (o.motif === 'leaves') fx.add(Object.assign(base, { size: 8, shape: 'rect', rot: Math.random() * 6, vr: 8, vy: base.vy + Math.sin(a) * 120 }));
      else if (o.motif === 'shards') fx.add(Object.assign(base, { size: 7 + Math.random() * 5, shape: 'rect', rot: a, vr: 5 }));
      else fx.add(Object.assign(base, { size: 3 + Math.random() * 6 }));
    }
  };
  return {
    name: o.name || 'REVIVAL', dur: 5.6, fx,
    cues: o.cues || [[0, () => o.sfx && o.sfx('open')], [1.3, () => o.sfx && o.sfx('gather')], [3.0, () => o.sfx && o.sfx('burst')]],
    draw(c, t) {
      const k = PxKit.clamp01((t - 1.0) / 2.0), burst = t - 3.0, flare = PxKit.clamp01(burst / 0.5), up = PxKit.clamp01(burst / 1.0);
      PxKit.scene(c, x => {
        if (o.bg) o.bg(x, t, k, burst); else { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05030a'); g.addColorStop(1, o.floor || '#1a1020'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
        x.globalCompositeOperation = 'lighter'; glowCircle(x, cx, gy - 150, 80 + 380 * k + (burst > 0 ? 400 * flare : 0), hexA(o.glow || c1, .18 + .4 * k), 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over';
        x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(0, gy + 8, W, H - gy);
        if (o.motif === 'rays' && k > 0) { x.globalCompositeOperation = 'lighter'; x.fillStyle = hexA(c2, .12 + .2 * k); for (let i = 0; i < 18; i++) { const a = i * .349 + t * .2; x.beginPath(); x.moveTo(cx, gy - 150); x.lineTo(cx + Math.cos(a - .05) * 1500, gy - 150 + Math.sin(a - .05) * 1500); x.lineTo(cx + Math.cos(a + .05) * 1500, gy - 150 + Math.sin(a + .05) * 1500); x.fill(); } x.globalCompositeOperation = 'source-over'; }
      }, .3);
      if (t > 1.0 && t < 3.0) spawn();
      fx.draw(c);
      if (o.motif === 'bolts' && t > 1.2 && t < 3.0) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const sd = Math.floor(t * 14) + i * 5, ax = cx + Math.sin(sd * 3.1) * 520; c.strokeStyle = i ? c1 : c2; c.lineWidth = 5 - i; c.beginPath(); c.moveTo(ax, 0); for (let j = 1; j <= 8; j++) c.lineTo(lerp(ax, cx, j / 8) + Math.sin(sd + j * 7) * 40 * (1 - j / 8), (gy - 150) * j / 8); c.stroke(); } c.restore(); }
      const shake = burst > 0 && burst < .6 ? (1 - burst / .6) * 10 : 0; c.save(); if (shake) c.translate(rand(-shake, shake), rand(-shake, shake));
      const rise = burst > 0 ? up : 0;
      A(c, cx, gy + 4 - rise * 6, S + rise * .25, t, burst < 0 ? (t < 1.0 ? 'hurt' : 'kneel') : burst < .9 ? 'charge' : 'victory', Object.assign({ transformed: burst > 0 ? true : !!o.wasForm }, o.extra || {}));
      c.restore();
      if (burst > 0 && burst < 1) { c.save(); c.globalCompositeOperation = 'lighter'; const R = 900 * ease.out(burst); for (let i = 0; i < 44; i++) { const a = i / 44 * 6.283; c.fillStyle = i % 2 ? hexA(c1, 1 - burst) : hexA(c2, 1 - burst); c.fillRect(Math.round((cx + Math.cos(a) * R) / 4) * 4, Math.round((gy - 120 + Math.sin(a) * R * .35) / 4) * 4, 12, 12); } c.restore(); }
      if (o.caption) caption(c, o.caption, t, .3, 2.8, o.capColor || c2);
      flashAt(c, t, 3.0, 3.5, c2);
      titleSlam(c, o.title || 'REVIVED', o.sub || '', t, 3.9, c1, o.size || 104);
    },
  };
};
