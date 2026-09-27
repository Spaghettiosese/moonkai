// ============================================================
//  MOONKAI — MORPH, the Mimic (rebuilt).
//
//  GAUGE   · DNA      every exchange samples the foe: its hits and the hits it takes both fill
//                    it. Full: ↓I ASSIMILATE — for 10s Morph BECOMES a silver copy of the foe,
//                    wearing their body and using their neutral and forward specials. While copying,
//                    DNA is the fuel the stolen moves burn (ammo, heat, charge...).
//  PASSIVE · LIQUID METAL  every third projectile that hits it splashes straight through: no
//                    damage, and the metal it absorbs heals it a little.
//  SUPER · MIRROR PRISON  four mirrors close around the foe for 4s. Their projectiles bounce back
//                    at them, and a mirror-copy lunges out of a mirror every second.
//  MIRROR MATCH       ultimate: it slowly takes the foe's shape and walks toward them; a grab
//                    that lands drags them into a hall of a thousand copies. Must connect.
// ============================================================
const mpSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const MORPH = charById('morph');
const MP_PAL = { skin: '#c8ccd4', top: '#a8acb4', topDark: '#7a7e86', pants: '#9a9ea6', pantsDark: '#6a6e76', boots: '#7a7e86', glove: '#c8ccd4', noFace: true, noHead: true };
const mpCopying = f => f.mpCopy > 0 && f.opp && f.opp.def;
const mpWrap = (m, slot) => {
  if (!m) return m; if (m.__mpWrap) return m.__mpWrap;
  const safe = fn => fn && ((...a) => { try { return fn(...a); } catch (e) { } });
  const w = Object.assign({}, m, { id: 'morph_copy_' + slot, owner: 'morph', onStart: safe(m.onStart), onHit: safe(m.onHit), onBlock: safe(m.onBlock), onEnd: safe(m.onEnd), onWhiff: safe(m.onWhiff) });
  if (m.ev) { w.ev = {}; for (const k in m.ev) w.ev[k] = safe(m.ev[k]); }
  m.__mpWrap = w; return w;
};

// silver-wash anything drawn by fn, keeping the current transform (cheap: one offscreen pass, no canvas filters)
function mpSilver(c, fn, alpha = 0.72) {
  const T = c.getTransform(); _octx.setTransform(1, 0, 0, 1, 0, 0); _octx.globalCompositeOperation = 'source-over'; _octx.globalAlpha = 1; _octx.clearRect(0, 0, W, H);
  _octx.setTransform(T); try { fn(_octx); } catch (e) { }
  _octx.setTransform(1, 0, 0, 1, 0, 0); _octx.globalCompositeOperation = 'source-atop'; _octx.globalAlpha = alpha; _octx.fillStyle = '#d8dce4'; _octx.fillRect(0, 0, W, H);
  _octx.globalCompositeOperation = 'source-over'; _octx.globalAlpha = 1;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(_off, 0, 0); c.restore();
}
function drawMorphBlob(c, v) {
  const t = v.anim || 0, F = !!v.transformed, m = v.move;
  drawHumanoid(c, v, MP_PAL, {
    back(c, P) { // liquid drips falling off it
      c.fillStyle = '#b8bcc4'; for (let i = 0; i < 4; i++) { const k = ((t * 0.8 + i * 0.25) % 1); c.beginPath(); c.ellipse(P.hip[0] - 10 + i * 7, P.hip[1] + 10 + k * 70, 2.5, 4 + k * 2, 0, 0, Math.PI * 2); c.fill(); }
    },
    chest(c, P) { // chrome sheen
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(P.sh[0] - 6, P.sh[1] + 6); c.quadraticCurveTo(P.hip[0] + 8, (P.sh[1] + P.hip[1]) / 2, P.hip[0] - 2, P.hip[1] - 4); c.stroke(); c.restore();
    },
    head(c, P) {
      const [hx, hy] = P.head, wob = Math.sin(t * 5) * 1.5;
      const g = c.createRadialGradient(hx + 3, hy - 4, 2, hx, hy, 14); g.addColorStop(0, '#fff'); g.addColorStop(0.4, '#c8ccd4'); g.addColorStop(1, '#6a6e76');
      c.fillStyle = g; c.beginPath(); c.ellipse(hx, hy, 11 + wob * 0.3, 13 - wob * 0.3, 0, 0, Math.PI * 2); c.fill();
      // no features but two white slits and a too-wide mouth line that never stops smiling
      c.save(); c.globalCompositeOperation = 'lighter'; for (const dx of [3, 9]) glowCircle(c, hx + dx, hy - 2, F ? 4 : 3, 'rgba(255,255,255,1)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#fff'; c.fillRect(hx + 2, hy - 2.5, 3, 1.2); c.fillRect(hx + 8, hy - 2.5, 3, 1.2);
      c.strokeStyle = '#3a3e46'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx - 2, hy + 5); c.quadraticCurveTo(hx + 6, hy + 10, hx + 12, hy + 4); c.stroke();
    },
    front(c, P) {
      if (m && m.name === 'Blob Lunge') { c.strokeStyle = '#a8acb4'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(P.fH[0], P.fH[1]); c.lineTo(P.fH[0] + 60, P.fH[1] + 4); c.stroke(); circle(c, P.fH[0] + 64, P.fH[1] + 4, 9, '#c8ccd4'); }
    },
  });
}
function drawMorph(c, v) {
  const o = v.opp;
  if (v.mpCopy > 0 && o && o.def && o.def.id !== 'morph') {
    // wearing the foe: their own drawing, poured in silver
    const d = o.def, vv = Object.assign({}, v, { def: d, transformed: false, pose: v.pose, anim: v.anim, facing: v.facing, status: v.status || {} });
    if (d.draw) mpSilver(c, oc => d.draw(oc, vv)); else drawMorphBlob(c, v);
    if ((v.anim * 4) % 1 < 0.1) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -70, 60, 'rgba(255,255,255,0.3)', 'rgba(0,0,0,0)'); c.restore(); }
    return;
  }
  drawMorphBlob(c, v);
}
function drawMorphPortrait(c, opts) {
  const F = !!opts.form;
  c.fillStyle = '#08080a'; c.fillRect(0, 0, 100, 100);
  // a cracked mirror behind it
  c.strokeStyle = 'rgba(200,210,230,0.35)'; c.lineWidth = 1; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(78, 22); c.lineTo(78 + Math.cos(i * 0.8) * 40, 22 + Math.sin(i * 0.8) * 40); c.stroke(); }
  const g = c.createRadialGradient(44, 40, 4, 50, 54, 44); g.addColorStop(0, '#fff'); g.addColorStop(0.35, '#c8ccd4'); g.addColorStop(1, '#4a4e56');
  c.fillStyle = g; c.beginPath(); c.moveTo(20, 100); c.quadraticCurveTo(18, 70, 30, 60); c.quadraticCurveTo(22, 20, 50, 16); c.quadraticCurveTo(80, 18, 72, 58); c.quadraticCurveTo(84, 70, 80, 100); c.closePath(); c.fill();
  for (let i = 0; i < 3; i++) { c.fillStyle = '#b8bcc4'; c.beginPath(); c.ellipse(34 + i * 16, 90 + (i % 2) * 4, 3, 6, 0, 0, Math.PI * 2); c.fill(); }
  c.save(); c.globalCompositeOperation = 'lighter'; for (const x of [40, 60]) glowCircle(c, x, 44, F ? 10 : 7, F ? 'rgba(150,200,255,1)' : 'rgba(255,255,255,1)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#fff'; c.fillRect(35, 43, 10, 2.4); c.fillRect(55, 43, 10, 2.4);
  c.strokeStyle = '#2a2e36'; c.lineWidth = 2; c.beginPath(); c.moveTo(28, 60); c.quadraticCurveTo(50, 76, 74, 58); c.stroke();
  c.strokeStyle = '#2a2e36'; c.lineWidth = 1; for (let i = 0; i < 9; i++) { const x = 32 + i * 5, y = 62 + Math.sin((i / 8) * Math.PI) * 6; c.beginPath(); c.moveTo(x, y - 2); c.lineTo(x, y + 2); c.stroke(); }
}

// ---------------- kit ----------------
const MP_SHOT = Mv.shot({ name: 'Mercury Shot', desc: 'A blob of liquid metal. Samples DNA on hit.', s: 11, proj: { speed: 760, r: 13, dmg: 55, color: '#c8ccd4', core: '#fff', life: 2 } });
const MP_LUNGE = Mv.rush({ name: 'Blob Lunge', desc: 'Its arm stretches out like a whip.', speed: 1000, frames: 16, hit: { dmg: 80 } });
const MP_ASSIM = mk({ name: 'Assimilate', desc: 'With full DNA: becomes a silver copy of the foe for 10s, using their neutral and forward specials. Without it: a mirror counter.', pose: 'charge', s: 14, a: 1, r: 14, ai: { min: 0, max: 900, use: 'buff' },
  ev: { 14: f => { if ((f.gauge || 0) < 100) return; f.gauge = 100; f.mpCopy = 10 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'ASSIMILATED: ' + (f.opp ? f.opp.def.name : '?'), '#dde', 22); f.say('I am you now.', 70); mpSfx('tone', 400, 0.6, 'sine', 0.05, 1600); Game.fx.burst(f.x, f.y - 70, 30, { color: ['#fff', '#c8ccd4'], size: 8, speed: 300, life: 0.5, glow: true }); } } });
const MP_ABSORB = Mv.counter({ name: 'Absorb', desc: 'Absorbs a hit and fires it back.', resp: 'reflect', window: 26 });
const MP_DECOY = Mv.place({ name: 'Decoy', desc: 'Pours out a copy of itself that attacks.', spawn: { kind: 'clone', at: 'front', dx: 60 }, cd: 6 });
const MP_SPLAT = Mv.dive({ name: 'Splat', desc: 'Falls as a blob. Ground bounce.', hit: { dmg: 80, gb: true } });
const MP_SUPER = superize(mk({ name: 'Mirror Prison', desc: 'Four mirrors close around the foe for 4s. Their projectiles bounce back, and a mirror copy lunges out every second.', pose: 'cast', s: 14, a: 6, r: 18,
  ev: { 14: f => { const o = f.opp; if (!o) return; Combat.addHazard({ kind: 'mpPrison', owner: f, side: f.side, x: o.x, life: 4 * FPS }); mpSfx('clang'); f.say('Look at yourself.', 50); } } }), 100);
const MP_ULT = superize(mk({ name: 'MIRROR MATCH', desc: 'It slowly takes the foe\'s shape and walks toward them. A grab that lands drags them into a hall of a thousand copies. Blockable. Must connect.', pose: 'walk', s: 60, a: 10, r: 26,
  ev: { 1: f => { f.mpCopy = Math.max(f.mpCopy || 0, 80); f.say('I am you.', 60); mpSfx('tone', 300, 1, 'sine', 0.04, 900); } },
  hit: { dmg: 10, box: [0, -150, 110, 150], hs: 60, kb: [0, 0], ultConnect: true } }), 300);
MP_ULT.id = 'morph_ult'; MP_ULT.recoverWhiff = 40; MP_ULT.vel = [[1, 60, 240, null]];
MP_ULT.ult = { dmg: 1100, cutscene: (a, t) => csMorphMirror(a, t), fx: { el: 'mirror', color: '#ffffff' } };

Object.assign(MORPH, {
  role: 'Mimic · DNA · Mirrors', handArt: true, draw: drawMorph, drawPortrait: drawMorphPortrait, transformCutscene: f => csMorphPerfect(f),
  gauge: { name: 'DNA', max: 100, color: '#dde', label: f => (f.mpCopy > 0 ? '· COPYING' : (f.gauge || 0) >= 100 ? '· ↓I ASSIMILATE' : '') },
  passive: ['Liquid Metal', 'Every third projectile that hits it splashes straight through for no damage, and heals it a little.'],
  passiveTick: undefined,
  moves: { '5S': MP_SHOT, '6S': MP_LUNGE, '2S': MP_ASSIM, '4S': MP_DECOY, 'jS': MP_SPLAT },
  super: MP_SUPER, ult: MP_ULT, ultAct: 'rush',
  form: Object.assign(MORPH.form, { desc: 'Permanent. Perfect mimic: DNA fills twice as fast and assimilation lasts 15s.', model: undefined }),
});
delete MORPH.mimic;
for (const [slot, m] of Object.entries(MORPH.moves)) { m.id = 'morph_' + slot; m.slot = slot; m.owner = 'morph'; if (slot === 'jS') m.air = true; }
MP_SUPER.id = 'morph_super';
MORPH.specialFor = (f, slot) => {
  if (slot === '2S' && (f.gauge || 0) < 100) return MP_ABSORB;
  if (!mpCopying(f) || f.opp.def.id === 'morph') return undefined;
  if (slot === '5S' || slot === '6S') { const src = (f.opp.def.specialFor && (() => { try { return f.opp.def.specialFor(f.opp, slot); } catch (e) { return null; } })()) || f.opp.def.moves[slot]; return mpWrap(src, slot); }
  return undefined;
};
MORPH.onRoundStart = f => { f.gauge = 0; f.mpCopy = 0; f.mpSplash = 0; };
MORPH.onHit = (a) => { if (a.mpCopy > 0) return; a.gauge = Math.min(100, (a.gauge || 0) + (a.form ? 12 : 6)); };
MORPH.onHurt = (t) => { if (t.mpCopy > 0) return; t.gauge = Math.min(100, (t.gauge || 0) + (t.form ? 8 : 4)); };
MORPH.onIncoming = (t, a, h, opts) => {
  if (opts && opts.proj && !opts.force && a !== t && ++t.mpSplash % 3 === 0) { Game.popWorld(t.x, t.y - t.h - 30, 'SPLASH', '#dde', 16); t.hp = Math.min(t.maxHp, t.hp + 20); Game.fx.burst(t.x, t.y - 70, 12, { color: ['#c8ccd4', '#fff'], size: 6, speed: 260, life: 0.35 }); return null; }
  return undefined;
};
MORPH.passiveTick = f => { if (f.mpCopy > 0 && --f.mpCopy === 0) { f.gauge = 0; Game.popWorld(f.x, f.y - f.h - 30, 'SHAPE LOST', '#aab', 16); } };
MORPH.moveHook = (f, m) => { if (m === MP_ASSIM && f.mf === 1 && f.form) {} if (m === MP_ASSIM && f.mf === 15 && f.form && f.mpCopy > 0) f.mpCopy = 15 * FPS; };
Combat.hz.mpPrison = function (h) {
  const f = h.owner, o = f && f.opp; if (!f || f.state === 'ko' || !o) return false;
  const L = h.x - 190, R = h.x + 190;
  if (o.x < L + 30) { o.x = L + 30; o.vx = Math.max(0, o.vx); } if (o.x > R - 30) { o.x = R - 30; o.vx = Math.min(0, o.vx); }
  for (const p of Combat.projectiles) if (p.owner === o && (p.x < L || p.x > R) && !p.mpBounced) { p.mpBounced = true; p.vx = -p.vx; p.owner = f; p.side = f.side; p.facing = -(p.facing || 1); }
  if (h.t % 60 === 30) { const side = h.t % 120 === 30 ? -1 : 1; const x = side < 0 ? L + 10 : R - 10; Combat.addHazard({ kind: 'mpLunge', owner: f, side: f.side, x, dir: -side, life: 16 }); }
  return h.t < h.life;
};
Combat.drawHz.mpPrison = (c, h) => {
  const f = h.owner, k = Math.min(1, h.t / 12); c.save();
  for (const s of [-1, 1]) { const x = h.x + s * (190 + (1 - k) * 200); const g = c.createLinearGradient(x - 20, 0, x + 20, 0); g.addColorStop(0, 'rgba(200,210,230,0.2)'); g.addColorStop(0.5, 'rgba(240,245,255,0.6)'); g.addColorStop(1, 'rgba(200,210,230,0.2)'); c.fillStyle = g; c.fillRect(x - 18, -260, 36, 262); c.strokeStyle = '#8a8e96'; c.lineWidth = 3; c.strokeRect(x - 18, -260, 36, 262); }
  c.restore();
};
Combat.hz.mpLunge = function (h) {
  const f = h.owner, o = f && f.opp; if (!f || !o) return false;
  h.x += h.dir * 22;
  if (!h.hit && Math.abs(o.x - h.x) < 50) { h.hit = true; Combat.resolveHit(o, f, H_({ dmg: 45, guard: 'mid', hs: 14, kb: [h.dir * 300, -200], sfx: 'm' }), { proj: true, fromX: h.x - h.dir * 20, move: MP_SUPER }); }
  return h.t < h.life;
};
Combat.drawHz.mpLunge = (c, h) => { const o = h.owner.opp; if (!o) return; c.save(); c.globalAlpha = 0.7 * (1 - h.t / h.life); mpSilver(c, oc => drawCharAt(oc, o.def, h.x, 0, o.scale || 1, h.dir, { pose: 'dash', anim: 0 }), 0.85); c.restore(); };

// ---------------- cinematics ----------------
function csMorphPerfect(f) {
  const d = f.def, opp = f.opp;
  return {
    name: 'PERFECT MIMIC', dur: 3.8, fx: new ParticleSystem(300),
    cues: [[0.2, () => mpSfx('tone', 300, 1.5, 'sine', 0.04, 1200)], [2.1, () => mpSfx('boom')]],
    draw(c, t) {
      c.fillStyle = '#0a0a0e'; c.fillRect(0, 0, W, H);
      // it rises out of a puddle of mercury, taking the foe's shape for a moment, then its own
      const k = ease.out(seg(t, 0.2, 2.0));
      c.fillStyle = '#9a9ea6'; c.beginPath(); c.ellipse(W / 2, H - 60, 200 * (1 - k * 0.6), 20, 0, 0, Math.PI * 2); c.fill();
      c.save(); c.beginPath(); c.rect(0, H - 60 - 520 * k, W, 520 * k + 2); c.clip();
      if (t < 1.3 && opp) { mpSilver(c, oc => drawCharAt(oc, opp.def, W / 2, H - 60, 2.5, 1, { pose: 'idle', anim: t })); }
      else drawCharAt(c, d, W / 2, H - 60, 2.5, 1, { pose: t < 2.1 ? 'idle' : 'victory', anim: t, transformed: t > 2.1 });
      c.restore();
      caption(c, 'I have been every one of you.', t, 0.3, 2, '#dde');
      flashAt(c, t, 2.1, 2.3, '#fff');
      titleSlam(c, 'PERFECT MIMIC', 'NO ORIGINAL', t, 2.2, '#dde', 100);
    },
  };
}
function csMorphMirror(a, opp) {
  const oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.2;
  return {
    name: 'MIRROR MATCH', dur: 6.4, fx: new ParticleSystem(1200),
    cues: [[0, () => mpSfx('tone', 300, 1, 'sine', 0.04, 900)], [2.4, () => mpSfx('clang')], [3.8, () => { mpSfx('boom'); mpSfx('clang'); mpSfx('clang', 0.2); }]],
    draw(c, t) {
      c.fillStyle = '#060608'; c.fillRect(0, 0, W, H);
      // a hall of mirrors: rows of silver copies of the foe, all turning to look at them
      const rows = 4;
      mpSilver(c, oc => { for (let r = rows - 1; r >= 0; r--) { const sc = 0.5 + r * 0.25, y = H * 0.35 + r * 90; for (let i = 0; i < 9 - r; i++) { const x = W * (i + 0.5) / (9 - r); oc.globalAlpha = 0.3 + r * 0.15; const face = x < W / 2 ? 1 : -1; drawCharAt(oc, opp.def, x, y, sc, t > 1.4 ? face : -face, { pose: t > 3.8 ? 'punch' : 'idle', anim: t * 0.5, transformed: opp.transformed }); } } oc.globalAlpha = 1; }, 0.8);
      silhouette(c, o => drawCharAt(o, opp.def, W / 2, H - 20, oppScale, -1, { pose: t < 3.8 ? 'idle' : 'hurt', anim: t, transformed: opp.transformed }), t < 3.8 ? '#2a2a30' : '#fff');
      caption(c, 'I am you.', t, 0.2, 1.4, '#dde'); caption(c, 'All of you.', t, 1.6, 3.4, '#dde');
      if (t > 3.8) { c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; for (let i = 0; i < 18; i++) { c.beginPath(); c.moveTo(W / 2, H / 2); c.lineTo(W / 2 + Math.cos(i * 1.3) * 900, H / 2 + Math.sin(i * 1.7) * 600); c.stroke(); } }
      flashAt(c, t, 3.8, 4.1, '#fff');
      if (t > 4.5) titleSlam(c, 'MIRROR MATCH', 'WHICH ONE IS REAL', t, 4.6, '#dde', 90);
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('morph:')) delete PortraitCache[k]; });
