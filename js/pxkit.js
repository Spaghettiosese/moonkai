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

// ---------------------------------------------------------------------------------------------
//  Ultimate helpers.
//   PxKit.ult({id,name,desc,pose,s,a,r,dmg,color,fx,cutscene,swing,after,rw,ev}) -> a ready ultimate move (kind 'ult', cost 300)
//   PxKit.trackEv(move, {at, r, track, color, start(f), fire(f,x)}) -> ev map: a telegraph that tracks the foe, then an ultConnect strike at `at`.
//   PxKit.zoneEv(move, {at, w, h, back, start(f), fire(f)}) -> ev map: an ultConnect strike over a rectangle in front of the user at `at`.
// ---------------------------------------------------------------------------------------------
PxKit.ult = function (o) {
  const m = superize(mk({ name: o.name, desc: o.desc, pose: o.pose || 'cast', s: o.s, a: o.a || 4, r: o.r || 28, ev: o.ev || {}, swing: o.swing, gjCharge: o.gjCharge }), 300);
  m.id = o.id; m.recoverWhiff = o.rw || 30;
  m.ult = { dmg: o.dmg, cutscene: o.cutscene, fx: o.fx || { el: 'light', color: o.color || '#ffffff' } }; if (o.after) m.ult.after = o.after;
  return m;
};
PxKit.trackEv = function (move, o) {
  const ev = {};
  ev[1] = f => { o.start && o.start(f); const t = f.opp; f.ultTele = Combat.telegraph(f, { x: t ? t.x : f.x, follow: t, track: o.track ?? .16, r: o.r || 120, life: 999, color: o.color || '#ffffff', column: o.column !== false }); };
  ev[o.at] = f => {
    const x = f.ultTele ? f.ultTele.x : f.x; if (f.ultTele) f.ultTele.life = 0; f.ultTele = null;
    for (const e of Combat.targets(f.side)) if (Math.abs(e.x - x) < (o.r || 120) + 10) Combat.resolveHit(e, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: x, move });
    o.fire && o.fire(f, x);
  };
  if (o.mid) for (const [k, fn] of Object.entries(o.mid)) { const prev = ev[k]; ev[k] = prev ? (f => { prev(f); fn(f); }) : fn; }
  return ev;
};
PxKit.zoneEv = function (move, o) {
  const ev = {}; if (o.start) ev[o.startAt || 2] = o.start;
  ev[o.at] = f => { Combat.strikeZone(f, { x: f.facing > 0 ? f.x - (o.back || 0) : f.x - o.w + (o.back || 0), y: -o.h + 4, w: o.w + (o.back || 0), h: o.h }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move }); o.fire && o.fire(f); };
  return ev;
};
// sound helper: sfx(name,...) that never throws
PxKit.sfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };

// ---------------------------------------------------------------------------------------------
//  Rework helpers
//   PxKit.setMove(def, slot, move)       replace/install a base special (ids/owner filled in)
//   PxKit.formKit(def, {moves, ult, desc, patch})   give the awakening a moveset / its own ultimate
//   PxKit.setUlt(def, ult)               replace the base ultimate
// ---------------------------------------------------------------------------------------------
PxKit.prepMove = (def, m, slot, pre) => { m.id = m.id || def.id + pre + slot; m.slot = slot; m.owner = def.id; if (slot === 'jS') m.air = true; return m; };
PxKit.setMove = (def, slot, m) => { def.moves[slot] = PxKit.prepMove(def, m, slot, '_'); return m; };
PxKit.formKit = (def, o) => {
  const F = def.form; if (o.moves) { F.moves = Object.assign(F.moves || {}, o.moves); for (const [slot, m] of Object.entries(o.moves)) PxKit.prepMove(def, m, slot, '_f'); }
  if (o.ult) F.ult = o.ult; if (o.desc) F.desc = o.desc; if (o.patch) Object.assign(F, o.patch);
};
PxKit.setUlt = (def, ult) => { def.ult = ult; def.ultAct = def.ultAct || 'strike'; if (ult.ult && ult.ult.fx) def.fx = ult.ult.fx; };
// a quick pixel silhouette lion/beast for crowds: dir = +1 faces right
PxKit.beast = function (x, px, py, s, t, dir, col, mane) {
  x.save(); x.translate(px, py); x.scale(s * dir, s); x.fillStyle = col;
  const run = Math.sin(t * 14);
  x.fillRect(-26, -26, 44, 18); x.fillRect(16, -34, 18, 18);                       // body, head
  if (mane) { x.fillStyle = mane; x.fillRect(10, -40, 12, 30); x.fillRect(6, -34, 8, 22); x.fillStyle = col; }
  x.fillRect(32, -28, 8, 8);                                                       // muzzle
  x.fillRect(-26 + run * 4, -8, 7, 14); x.fillRect(-12 - run * 4, -8, 7, 14); x.fillRect(6 + run * 4, -8, 7, 14); x.fillRect(16 - run * 4, -8, 7, 14); // legs
  x.fillRect(-38, -30 + run * 3, 14, 5); x.fillRect(-42, -36 + run * 3, 5, 8);    // tail
  x.restore();
};

// ---------------------------------------------------------------------------------------------
//  PxKit.pixelize(def, {win, k, levels})
//   Re-renders a fighter's existing vector art through the pixel pipeline: the sprite is painted at half resolution into a
//   window, colours are snapped to a small number of steps per channel (flat cel shading), soft edges become hard, and a dark
//   outline is traced around the silhouette. Used for the fighters whose art is bespoke code rather than a model spec.
//   def.draw keeps the Settings -> Pixel Art Fighters toggle.
// ---------------------------------------------------------------------------------------------
PxKit.pixelize = function (def, o = {}) {
  const win = o.win || [-210, -340, 470, 400], K = o.k || .5, PW = Math.round(win[2] * K), PH = Math.round(win[3] * K), levels = o.levels || 6, st = 255 / (levels - 1);
  const cv = PxKit.mk(PW, PH), x = cv.getContext('2d', { willReadFrequently: true }), out = PxKit.mk(PW, PH), ox = out.getContext('2d');
  const vec = def.draw; def._vecDraw = vec;
  def.draw = (c, v) => {
    if (!PxKit.on()) return vec(c, v);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, PW, PH);
    x.setTransform(K, 0, 0, K, -win[0] * K, -win[1] * K);
    vec(x, v);
    x.setTransform(1, 0, 0, 1, 0, 0);
    const img = x.getImageData(0, 0, PW, PH), d = img.data, mask = new Uint8Array(PW * PH);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      if (d[i + 3] < 90) { d[i + 3] = 0; continue; }
      mask[p] = 1; d[i + 3] = 255; const a = img.data[i + 3];
      for (let k = 0; k < 3; k++) d[i + k] = Math.min(255, Math.round(d[i + k] / st) * st);
    }
    if (o.outline !== false) for (let y = 0; y < PH; y++) for (let xx = 0; xx < PW; xx++) { const p = y * PW + xx; if (mask[p]) continue; if ((xx > 0 && mask[p - 1]) || (xx < PW - 1 && mask[p + 1]) || (y > 0 && mask[p - PW]) || (y < PH - 1 && mask[p + PW])) { const i = p * 4; d[i] = 10; d[i + 1] = 4; d[i + 2] = 16; d[i + 3] = 255; } }
    ox.putImageData(img, 0, 0);
    c.save(); c.imageSmoothingEnabled = false; c.drawImage(out, win[0], win[1], win[2], win[3]); c.restore();
  };
  return def.draw;
};

// ---------------------------------------------------------------------------------------------
//  PxKit.cineUlt(a, opp, o) -> cutscene. A motif-driven ultimate cinematic.
//   o: { name, dur=7.6, c1,c2,c3 (palette), bg(x,t,k,gy) low-res backdrop painter (k = charge 0..1), motif, tc=[start,end] charge window,
//        tf fire time, ax actor x (0..1), fx foe x, actorScale, pose:[idle, charge, fire, after], extra (actor view props),
//        cap1, cap2, title, sub, size, cues, ground (colour), foeTint }
//   motifs: 'beam' | 'pillar' | 'slashes' | 'barrage' | 'meteor' | 'rush' | 'shockwave' | 'rift'
// ---------------------------------------------------------------------------------------------
PxKit.cineUlt = function (a, opp, o) {
  const fx = new ParticleSystem(2200), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
  const dur = o.dur || 7.6, tc = o.tc || [1.2, 3.8], tf = o.tf || 4.8, gy = H - (o.gh || 80), axp = (o.ax ?? .2) * W, oxp = (o.fx ?? .72) * W, AS = o.actorScale || 2.8, motif = o.motif || 'beam';
  const c1 = o.c1 || '#ffffff', c2 = o.c2 || '#ffe9a0', c3 = o.c3 || '#4a3a6a', pose = o.pose || ['idle', 'cast', 'cast', 'victory'];
  const cues = (o.cues || []).slice();
  return {
    name: o.name, dur, fx, cues,
    draw(c, t) {
      const k = PxKit.clamp01((t - tc[0]) / (tc[1] - tc[0])), hit = t - tf, ek = ease.inOut(k);
      PxKit.scene(c, x => {
        if (o.bg) o.bg(x, t, ek, gy, hit); else { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05030c'); g.addColorStop(1, c3); x.fillStyle = g; x.fillRect(0, 0, W, H); }
        x.fillStyle = o.ground || 'rgba(0,0,0,0.55)'; x.fillRect(0, gy, W, H - gy);
        x.globalCompositeOperation = 'lighter'; glowCircle(x, axp + 100, gy - 200, 80 + 420 * ek, hexA(c2, .12 + .3 * ek), 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over';
        if (hit > 0) { x.globalCompositeOperation = 'lighter'; glowCircle(x, oxp, gy - 120, 700 * ease.out(Math.min(1, hit / .8)), hexA(c1, .6 * (1 - Math.min(1, hit / 2.2))), 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over'; }
        // motif light that lives in the low-res layer
        if (motif === 'pillar' && t > tc[0]) { const w = (30 + 150 * ek) * (hit > 0 ? 1 - Math.min(.6, hit * .4) : 1); x.globalCompositeOperation = 'lighter'; const gg = x.createLinearGradient(oxp - w, 0, oxp + w, 0); gg.addColorStop(0, hexA(c1, 0)); gg.addColorStop(.5, hexA(c1, hit > 0 ? Math.max(0, 1 - hit * .5) : ek * .9)); gg.addColorStop(1, hexA(c1, 0)); x.fillStyle = gg; x.fillRect(oxp - w, 0, w * 2, H); x.globalCompositeOperation = 'source-over'; }
        if (motif === 'beam' && hit > 0) { const w = 140 * Math.min(1, hit * 6) * (1 - PxKit.clamp01((hit - 1.6) / 1)) + 6, by = gy - 210; x.globalCompositeOperation = 'lighter'; x.fillStyle = hexA(c3, .7); x.fillRect(axp + 100, by - w * 1.5, W, w * 3); x.fillStyle = hexA(c1, .9); x.fillRect(axp + 100, by - w, W, w * 2); x.fillStyle = '#ffffff'; x.fillRect(axp + 100, by - w * .45, W, w * .9); x.globalCompositeOperation = 'source-over'; }
        if (motif === 'meteor' && t > tc[0]) { const p = PxKit.clamp01((t - tc[1]) / (tf - tc[1])), R = 40 + ek * 90, mx = lerp(axp + 300, oxp, p), my = lerp(-200, gy - 20, p * p); if (hit < 0) { x.globalCompositeOperation = 'lighter'; x.fillStyle = hexA(c2, .5); for (let i = 0; i < 26; i++) x.fillRect(mx - i * 18 * (1 - p * .5), my - i * 30, R * (1 - i / 28) * 1.5, 26); x.fillStyle = c1; x.beginPath(); x.arc(mx, my, R, 0, 7); x.fill(); glowCircle(x, mx, my, R * 3, hexA(c2, .5), 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over'; } }
        if (motif === 'rift' && t > tc[0]) { const R = 20 + ek * 180 + (hit > 0 ? 200 * Math.min(1, hit) : 0); x.fillStyle = '#000'; x.beginPath(); x.arc(oxp, gy - 330, R, 0, 7); x.fill(); x.globalCompositeOperation = 'lighter'; x.strokeStyle = hexA(c1, .9); x.lineWidth = 10; x.beginPath(); x.arc(oxp, gy - 330, R + 6, 0, 7); x.stroke(); for (let i = 0; i < 24; i++) { const an = i * .26 + t * 3, r2 = R + 30 + (i * 17 % 120); x.fillStyle = i % 2 ? c1 : c2; x.fillRect(oxp + Math.cos(an) * r2, gy - 330 + Math.sin(an) * r2 * .7, 8, 8); } x.globalCompositeOperation = 'source-over'; }
        if (o.fg) o.fg(x, t, ek, gy, hit);
      }, .3);
      // foe
      const foePose = hit < 0 ? (k > .6 ? 'stun' : 'block') : 'hurt_air', tint = hit > 0 && hit < .12 ? '#ffffff' : (o.foeTint || shadeHex(c1, -.6));
      if (hit < 0.12) silhouette(c, q => drawCharAt(q, opp.def, oxp, gy + 4, os, -1, { pose: hit < 0 ? foePose : 'hurt', anim: t, transformed: opp.transformed }), tint);
      else {
        const kk = PxKit.clamp01((hit - .12) / 1.3);
        if (motif === 'slashes') { for (const s of [-1, 1]) { c.save(); c.beginPath(); c.moveTo(oxp - 400, gy - 260 + (s > 0 ? 0 : 0)); c.lineTo(oxp + 400, gy - 60 - (s > 0 ? 0 : 0)); c.lineTo(oxp + (s > 0 ? 400 : -400), s > 0 ? gy + 40 : gy - 400); c.lineTo(oxp - (s > 0 ? 0 : 0) - (s > 0 ? 400 : -400), s > 0 ? gy + 40 : gy - 400); c.closePath(); c.clip(); c.translate(s * kk * 90, s * kk * 40); silhouette(c, q => drawCharAt(q, opp.def, oxp, gy + 4, os, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), c3); c.restore(); } }
        else if (motif === 'beam' || motif === 'pillar' || motif === 'meteor') { for (let i = 0; i < 12; i++) { c.save(); c.beginPath(); c.rect(0, gy - 300 + i * 26, W, 26); c.clip(); c.globalAlpha = Math.max(0, 1 - kk * 1.2 - i * .02); c.translate(kk * 360 * (.3 + i * .08) * (motif === 'beam' ? 1 : (i % 2 ? 1 : -1) * .3), -kk * 50 * (i % 3)); silhouette(c, q => drawCharAt(q, opp.def, oxp, gy + 4, os, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), c2); c.restore(); } }
        else if (motif === 'rift') { c.save(); c.translate(oxp, gy + 4 - kk * (gy - 330)); c.rotate(kk * 8); c.scale(1 - kk * .85, 1 - kk * .85); silhouette(c, q => drawCharAt(q, opp.def, 0, 0, os, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }), c3); c.restore(); }
        else { c.save(); c.translate(oxp + kk * 420, gy - kk * 220 + kk * kk * 220); c.rotate(kk * 8); silhouette(c, q => drawCharAt(q, opp.def, 0, 0, os, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }), c3); c.restore(); }
      }
      // actor (rush: runs through the foe)
      let axx = axp, ayy = gy + 4, ap = hit < 0 ? (k > .05 ? pose[1] : pose[0]) : (hit < .5 ? pose[2] : pose[3]);
      if (motif === 'rush') { const p = PxKit.clamp01((t - (tf - .35)) / .35); axx = p <= 0 ? axp : p < 1 ? lerp(axp, oxp + 160, ease.in(p)) : oxp + 160 + Math.min(120, (t - tf) * 120); if (p > 0 && p < 1) for (let i = 1; i <= 5; i++) { c.globalAlpha = .3 / i; A(c, axx - i * 70, ayy, AS, t, pose[2], o.extra || {}); } c.globalAlpha = 1; }
      A(c, axx, ayy, AS + (hit > 0 ? .1 : 0), t, ap, Object.assign({ transformed: !!o.actorForm }, o.extra || {}));
      // charge particles + motif sparks
      if (t > tc[0] && t < tf) for (let i = 0; i < 3; i++) { const an = Math.random() * 6.283, R = 260 + Math.random() * 200, life = .6 + Math.random() * .4, px_ = axp + 100 + Math.cos(an) * R, py = gy - 200 + Math.sin(an) * R * .6; fx.add({ x: px_, y: py, vx: (axp + 100 - px_) / life, vy: (gy - 200 - py) / life, life, size: 3 + Math.random() * 6, color: Math.random() < .5 ? c1 : c2, glow: true }); }
      if (motif === 'barrage' && hit > 0 && hit < 1.4) for (let i = 0; i < 3; i++) fx.add({ x: axp + 120, y: gy - 200 + rand(-60, 60), vx: (oxp - axp) * 3 + rand(-200, 200), vy: rand(-250, 250), life: .35, size: rand(5, 11), color: pick([c1, c2, '#ffffff']), glow: true });
      if (motif === 'shockwave' && hit > 0 && hit < 1.2) { c.save(); c.globalCompositeOperation = 'lighter'; const R = 1100 * ease.out(hit / 1.2); for (let i = 0; i < 48; i++) { const an = i / 48 * 6.283; c.fillStyle = i % 2 ? hexA(c1, 1 - hit / 1.2) : hexA(c2, 1 - hit / 1.2); c.fillRect(Math.round((axp + 100 + Math.cos(an) * R) / 4) * 4, Math.round((gy - 40 + Math.sin(an) * R * .18) / 4) * 4, 12, 12); } c.restore(); }
      if (motif === 'slashes' && hit > 0 && hit < .9) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const s0 = i * .1; if (hit < s0) continue; const p = PxKit.clamp01((hit - s0) / .12), a2 = -.9 + i * .35; c.strokeStyle = i % 2 ? c2 : c1; c.lineWidth = 12 - i; c.globalAlpha = 1 - PxKit.clamp01((hit - s0 - .12) / .5); c.beginPath(); c.moveTo(oxp - Math.cos(a2) * 420, gy - 130 - Math.sin(a2) * 420); c.lineTo(oxp - Math.cos(a2) * 420 + Math.cos(a2) * 840 * p, gy - 130 - Math.sin(a2) * 420 + Math.sin(a2) * 840 * p); c.stroke(); } c.restore(); }
      if (hit > 0 && hit < .15) for (let i = 0; i < 50; i++) fx.add({ x: oxp + rand(-90, 90), y: gy - rand(0, 220), vx: rand(-800, 800), vy: rand(-900, -100), life: 1.3, size: rand(5, 12), color: pick([c1, c2, '#ffffff']), glow: true, g: 700 });
      fx.draw(c);
      if (o.cap1) caption(c, o.cap1, t, .3, tc[0] + .9, o.capColor || c2); if (o.cap2) caption(c, o.cap2, t, tc[0] + 1, tf - .2, o.capColor || c2);
      flashAt(c, t, tf - .02, tf + .55, o.flash || '#ffffff');
      titleSlam(c, o.title || o.name, o.sub || '', t, tf + 1.5, c1, o.size || 104);
    },
  };
};

// ---------------------------------------------------------------------------------------------
//  PxKit.sky(x, t, o): a parametrised low-res backdrop for cinematics.
//   o: { top, bot, stars, moon:{x,y,r,col}, sun:{x,y,r,col}, embers:col, rain:col, snow, city:col, ruins:col, mount:col, rays:col, clouds:col,
//        fog:col, grid:col, pillars:col, lit: 0..1 (brightens windows), flash }
// ---------------------------------------------------------------------------------------------
PxKit.sky = function (x, t, o, k = 0) {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.top || '#05030c'); g.addColorStop(1, o.bot || '#1a1030'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.save();
  if (o.stars) { x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 110; i++) { x.globalAlpha = .35 + .65 * Math.abs(Math.sin(t * 1.3 + i)); x.fillStyle = i % 5 ? (o.stars === true ? '#cfe0ff' : o.stars) : '#ffffff'; x.fillRect((i * 97) % W, (i * 53) % (H * .8), 3 + (i % 3), 3 + (i % 3)); } x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
  for (const key of ['sun', 'moon']) if (o[key]) { const s = o[key]; x.fillStyle = s.col || '#fff'; x.beginPath(); x.arc(s.x * W, s.y * H, s.r, 0, 7); x.fill(); x.globalCompositeOperation = 'lighter'; glowCircle(x, s.x * W, s.y * H, s.r * 2.6, hexA(s.col || '#fff', .35), 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over'; if (key === 'moon' && s.crater) { x.fillStyle = 'rgba(0,0,0,0.12)'; x.beginPath(); x.arc(s.x * W - s.r * .3, s.y * H - s.r * .2, s.r * .22, 0, 7); x.arc(s.x * W + s.r * .35, s.y * H + s.r * .3, s.r * .16, 0, 7); x.fill(); } }
  if (o.rays) { x.globalCompositeOperation = 'lighter'; x.fillStyle = hexA(o.rays, .12 + .2 * k); const cx = (o.rayX ?? .5) * W, cy = (o.rayY ?? .2) * H; for (let i = 0; i < 18; i++) { const a = i * .349 + t * .12; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a - .04) * 1600, cy + Math.sin(a - .04) * 1600); x.lineTo(cx + Math.cos(a + .04) * 1600, cy + Math.sin(a + .04) * 1600); x.fill(); } x.globalCompositeOperation = 'source-over'; }
  if (o.clouds) { x.fillStyle = o.clouds; for (let i = 0; i < 8; i++) { const cx = ((i * 230 + t * 24) % (W + 300)) - 150; for (let j = 0; j < 3; j++) { x.beginPath(); x.ellipse(cx + j * 52, 90 + (i % 3) * 80, 62, 22, 0, 0, 7); x.fill(); } } }
  if (o.mount) { x.fillStyle = o.mount; x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= 8; i++) x.lineTo(i * W / 8, H - 160 - ((i * 73) % 5) * 52 - (i === 4 ? 130 : 0)); x.lineTo(W, H); x.fill(); }
  if (o.city) { for (let i = 0; i < 18; i++) { const bx = i * 80 - 30, bh = 160 + (i * 53 % 7) * 40; x.fillStyle = o.city; x.fillRect(bx, H - 90 - bh, 70, bh + 20); if (o.lit !== undefined) { x.globalCompositeOperation = 'lighter'; x.fillStyle = `rgba(255,220,120,${.5 * o.lit})`; for (let j = 0; j < 9; j++) if ((i * 5 + j * 3) % 3) x.fillRect(bx + 8 + (j % 3) * 20, H - 90 - bh + 16 + Math.floor(j / 3) * 34, 10, 16); x.globalCompositeOperation = 'source-over'; } } }
  if (o.ruins) { x.fillStyle = o.ruins; for (let i = 0; i < 9; i++) { const bx = i * 150 - 30, bh = 120 + (i * 53 % 5) * 40; x.fillRect(bx, H - 90 - bh, 38, bh + 20); if (i % 2) x.fillRect(bx + 52, H - 90 - bh * .6, 30, bh * .6 + 20); } }
  if (o.pillars) { x.fillStyle = o.pillars; for (let i = 0; i < 8; i++) { x.fillRect(60 + i * 160, 0, 46, H - 80); } }
  if (o.fog) { x.fillStyle = o.fog; x.fillRect(0, H - 220, W, 160); }
  x.globalCompositeOperation = 'lighter';
  if (o.embers) for (let i = 0; i < 60; i++) { x.fillStyle = i % 3 ? o.embers : '#ffffff'; x.globalAlpha = .6; x.fillRect((i * 97 + Math.sin(t + i) * 30) % W, H - ((t * (60 + i % 5 * 24) + i * 61) % (H + 40)), 4, 4 + i % 3 * 2); }
  if (o.rain) for (let i = 0; i < 90; i++) { x.fillStyle = o.rain; x.globalAlpha = .5; x.fillRect((i * 83 + t * 240) % W, (i * 57 + t * 900) % H, 2, 18); }
  if (o.snow) for (let i = 0; i < 80; i++) { x.fillStyle = '#ffffff'; x.globalAlpha = .75; x.fillRect((i * 83 + Math.sin(t + i) * 40 + t * 40) % W, (i * 57 + t * 120) % H, 5, 5); }
  x.restore();
  if (o.grid) { x.strokeStyle = o.grid; x.lineWidth = 3; for (let i = 0; i < 14; i++) { x.beginPath(); x.moveTo(0, H - 90 + i * 12); x.lineTo(W, H - 90 + i * 12); x.stroke(); } }
};

// ---------------------------------------------------------------------------------------------
//  PxKit.bust(def, opts): a pixel-art portrait cut from the fighter's own sprite.
//   The sprite is drawn into a scratch canvas, its head is located (topmost solid rows), and the bust is framed so the head fills
//   about 45% of the box. Normal and awakened forms (and the Fallen God) are framed separately. The backdrop is drawn from the
//   fighter's colours as chunky pixels: a glow, diagonal streaks, a few stars and (when awakened) rising sparks.
//   The original portrait stays as the fallback when Pixel Art Fighters is off.
// ---------------------------------------------------------------------------------------------
PxKit.bust = function (def, o = {}) {
  const prev = def.drawPortrait, frames = {};
  const view = (d, form, alt) => { const fallen = !!(d.portraitId && /_fallen$/.test(d.portraitId)); return { pose: o.pose || 'idle', anim: 0.35, transformed: !!form || fallen, form: !!form, alt: alt || 0, def: d, state: 'idle', fallen, corrupted: fallen, gauge: 3 }; };
  const HEADS = PxKit.bustFrames = PxKit.bustFrames || {};
  const frame = (d, form, alt) => {
    const key = (d.portraitId || d.id) + ':' + (form ? 1 : 0), T = HEADS[key] || HEADS[d.id + ':' + (form ? 1 : 0)] || HEADS[d.id];
    if (T) return { hx: T[0], hy: T[1], s: T[2] };
    const bh = (BUILDS[(d.model && d.model.build) || 'normal'] || BUILDS.normal).h, hp = humanPose('idle', .35).head;
    return { hx: hp[0] * bh, hy: hp[1] * bh + 2, s: o.s || 1.75 };
  };
  const bg = (c, d, form, t) => {
    const col = d.color || '#88aaff', c2 = (d.color2 && d.color2.length === 7 ? d.color2 : '#101028');
    const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, shadeHex(c2, form ? .1 : -.35)); g.addColorStop(1, shadeHex(c2, -.6)); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
    c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50, 44, form ? 70 : 54, hexA(col, form ? .5 : .32), 'rgba(0,0,0,0)');
    c.strokeStyle = hexA(col, form ? .35 : .2); c.lineWidth = 3; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(-10, 8 + i * 16); c.lineTo(34 + (i % 3) * 8, -6 + i * 16); c.stroke(); }
    for (let i = 0; i < (form ? 26 : 12); i++) { c.fillStyle = i % 3 ? hexA(col, .9) : 'rgba(255,255,255,0.9)'; c.fillRect(Math.round(((i * 37) % 100) / 2) * 2, Math.round(((i * 53) % 90) / 2) * 2, 2, 2); }
    c.restore();
    c.fillStyle = 'rgba(0,0,0,0.38)'; c.fillRect(0, 86, 100, 14);
  };
  const fn = (c, opts = {}, d) => {
    d = d || def; const form = !!opts.form, f = frame(d, form, opts.alt);
    bg(c, d, form);
    c.save(); c.beginPath(); c.rect(0, 0, 100, 100); c.clip(); c.translate(50 - f.hx * f.s, 44 - f.hy * f.s); c.scale(f.s, f.s);
    try { d.draw(c, view(d, form, opts.alt)); } catch (e) { }
    c.restore();
  };
  const px = PxKit.portrait((def.id) + '_bust', fn, { res: 100, levels: 16, dither: 0, outline: false });
  def.drawPortrait = (c, opts, d) => PxKit.on() ? px(c, opts, d) : (prev ? prev(c, opts, d) : fn(c, opts, d));
};

// ---------------------------------------------------------------------------------------------
//  PxKit.cineForm(f, o) -> an awakening cutscene for one fighter (no opponent).
//   o: { name, dur=6.4, tc=[1.0,3.4] charge window, tf=3.6 flash time, c1,c2,c3, bg(x,t,k,burst) low-res backdrop, motif: 'converge'|'rise'|'implode'|'rain'
//        shape: 'rect'|'dot', pose:[idle, charge, burst], lift, scale, gh, extra (view props), cap1, cap2, title, sub, size, cues, ring:true, bolts:true }
// ---------------------------------------------------------------------------------------------
PxKit.cineForm = function (f, o) {
  const fx = new ParticleSystem(1800), A = PxKit.actor(f.def), dur = o.dur || 6.4, tc = o.tc || [1.0, 3.4], tf = o.tf || 3.6, gy = H - (o.gh || 70), S = o.scale || 3.0, cx = W / 2;
  const c1 = o.c1 || '#ffd35a', c2 = o.c2 || '#ffffff', c3 = o.c3 || '#402060', pose = o.pose || ['idle', 'charge', 'victory'], motif = o.motif || 'converge';
  const spawn = () => {
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * 6.283, R = 360 + Math.random() * 300, life = .7 + Math.random() * .5, col = [c1, c2, c1, c3][i & 3], sz = 3 + Math.random() * 6;
      let x, y, vx, vy;
      if (motif === 'rise') { x = cx + (Math.random() - .5) * 420; y = gy + 10; vx = (Math.random() - .5) * 60; vy = -(200 + Math.random() * 420); }
      else if (motif === 'rain') { x = Math.random() * W; y = -10; vx = (Math.random() - .5) * 40; vy = 500 + Math.random() * 500; }
      else if (motif === 'implode') { x = cx + Math.cos(a) * R * 1.5; y = gy - 150 + Math.sin(a) * R * .8; vx = (cx - x) / life * 1.4; vy = (gy - 150 - y) / life * 1.4; }
      else { x = cx + Math.cos(a) * R * 1.4; y = gy - 150 + Math.sin(a) * R * .8; vx = (cx - x) / life; vy = (gy - 150 - y) / life; }
      fx.add({ x, y, vx, vy, life, color: col, size: sz, glow: true, shape: o.shape || 'dot', rot: a, vr: 6 });
    }
  };
  return {
    name: o.name || 'AWAKENING', dur, fx, cues: o.cues || [],
    draw(c, t) {
      const k = PxKit.clamp01((t - tc[0]) / (tc[1] - tc[0])), burst = t - tf, fl = PxKit.clamp01(burst / .5), up = PxKit.clamp01(burst / 1.1);
      PxKit.scene(c, x => {
        if (o.bg) o.bg(x, t, k, burst); else PxKit.sky(x, t, { top: '#05030a', bot: c3, stars: true }, k);
        x.globalCompositeOperation = 'lighter'; glowCircle(x, cx, gy - 150, 80 + 340 * k + (burst > 0 ? 420 * fl : 0), hexA(c1, .16 + .36 * k), 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over';
        x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(0, gy + 8, W, H - gy);
      }, .3);
      if (t > tc[0] && t < tf) spawn();
      fx.draw(c);
      if (o.bolts && t > tc[0] && t < tf + .3) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const sd = Math.floor(t * 14) + i * 5, ax = cx + Math.sin(sd * 3.1) * 560; c.strokeStyle = i ? c1 : c2; c.lineWidth = 5 - i; c.beginPath(); c.moveTo(ax, 0); for (let j = 1; j <= 8; j++) c.lineTo(lerp(ax, cx, j / 8 * k) + Math.sin(sd + j * 7) * 40 * (1 - j / 8), (gy - 150) * j / 8); c.stroke(); } c.restore(); }
      const shake = burst > 0 && burst < .6 ? (1 - burst / .6) * 10 : (k > .5 && burst < 0 ? k * 3 : 0); c.save(); if (shake) c.translate(rand(-shake, shake), rand(-shake, shake));
      const lift = (o.lift ?? 0) * (burst < 0 ? ease.inOut(k) : 1 - up * .4);
      A(c, cx, gy + 4 - lift, S + up * .25, t, t < tc[0] ? pose[0] : burst < 0 ? pose[1] : pose[2], Object.assign({ transformed: burst > 0 }, o.extra || {}));
      c.restore();
      if (o.ring !== false && burst > 0 && burst < 1) { c.save(); c.globalCompositeOperation = 'lighter'; const R = 900 * ease.out(burst); for (let i = 0; i < 44; i++) { const a = i / 44 * 6.283; c.fillStyle = i % 2 ? hexA(c1, 1 - burst) : hexA(c2, 1 - burst); c.fillRect(Math.round((cx + Math.cos(a) * R) / 4) * 4, Math.round((gy - 120 + Math.sin(a) * R * .35) / 4) * 4, 12, 12); } c.restore(); }
      if (o.cap1) caption(c, o.cap1, t, .3, tf - .6, o.capColor || c2);
      if (o.cap2) caption(c, o.cap2, t, tf + .2, dur - 1.2, o.capColor || c2);
      flashAt(c, t, tf - .05, tf + .45, o.flash || c2);
      titleSlam(c, o.title || o.name || 'AWAKENED', o.sub || '', t, tf + .9, c1, o.size || 100);
    },
  };
};
