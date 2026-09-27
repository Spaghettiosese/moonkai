// ============================================================
//  MOONKAI — cinematics v3: 5 new ultimate templates, creatures,
//  pocket dimensions, element effects, and the ult/transform router.
// ============================================================

// ---------- generic element effect (extends drawElement) ----------
const _baseElement = drawElement;
const KNOWN_EL = new Set(['bolt', 'ice', 'time', 'metal', 'shadow', 'blood', 'tech', 'light', 'rock', 'anvil']);
drawElement = function (c, el, t, cx, cy, k, color) {
  if (KNOWN_EL.has(el)) return _baseElement(c, el, t, cx, cy, k, color);
  c.save(); c.globalCompositeOperation = 'lighter';
  glowCircle(c, cx, cy, 260 * k, hexA(color, 0.45), hexA(color, 0));
  const n = 24;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + t * (i % 2 ? 1 : -1) * 0.8, r = (120 + (i % 4) * 50) * k;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    c.globalCompositeOperation = 'source-over';
    drawElementBit(c, el, x, y, 10 + (i % 3) * 4, t + i, color);
  }
  c.restore();
};
function drawElementBit(c, el, x, y, s, t, color) {
  c.save(); c.translate(x, y); c.rotate(t * 2);
  switch (el) {
    case 'water': case 'bubble': c.strokeStyle = hexA(color, 0.9); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, s, 0, Math.PI * 2); c.stroke(); break;
    case 'fire': case 'sun': case 'bomb': glowCircle(c, 0, 0, s * 1.6, hexA(color, 0.9), 'rgba(255,40,0,0)'); break;
    case 'poison': glowCircle(c, 0, 0, s * 1.4, hexA(color, 0.8)); break;
    case 'sand': for (let i = 0; i < 4; i++) circle(c, rand(-s, s), rand(-s, s), 2.5, color); break;
    case 'star': case 'moon': c.fillStyle = color; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.45 : s, a = i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); break;
    case 'note': c.fillStyle = color; circle(c, -3, 5, s * 0.45, color); c.fillRect(0, -s, 3, s * 1.4); break;
    case 'nature': case 'leaf': case 'lions': c.fillStyle = color; c.beginPath(); c.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI * 2); c.fill(); break;
    case 'pixel': case 'code': c.fillStyle = color; c.fillRect(-s / 2, -s / 2, s, s); break;
    case 'soul': case 'haunt': circle(c, 0, 0, s * 0.7, '#eee8d8'); circle(c, -s * 0.25, -s * 0.1, s * 0.18, '#111'); circle(c, s * 0.25, -s * 0.1, s * 0.18, '#111'); break;
    case 'web': c.strokeStyle = '#eee'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i) * s * 1.5, Math.sin(i) * s * 1.5); c.stroke(); } break;
    case 'mirror': c.fillStyle = 'rgba(220,230,255,0.7)'; c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.7, 0); c.lineTo(0, s); c.lineTo(-s * 0.5, 0); c.fill(); break;
    case 'wheel': case 'atom': c.strokeStyle = color; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, s, 0, Math.PI * 2); c.stroke(); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * 1.57) * s, Math.sin(i * 1.57) * s); c.stroke(); } break;
    case 'money': c.fillStyle = '#5a9a4a'; c.fillRect(-s, -s / 2, s * 2, s); break;
    case 'ball': circle(c, 0, 0, s, '#fff'); circle(c, 0, 0, s * 0.35, '#111'); break;
    case 'palm': case 'fist': c.fillStyle = color; roundRect(c, -s * 0.6, -s * 0.6, s * 1.2, s * 1.2, s * 0.3); c.fill(); break;
    case 'bullet': c.fillStyle = '#ffd35a'; c.fillRect(-s, -2, s * 2, 4); break;
    case 'food': circle(c, 0, 0, s * 0.8, pick(['#ff8a3a', '#ffd35a', '#c03a2a', '#8aba4a'])); break;
    case 'neon': c.strokeStyle = color; c.lineWidth = 3; c.strokeRect(-s / 2, -s / 2, s, s); break;
    case 'wind': c.strokeStyle = hexA(color, 0.8); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, s, 0, Math.PI * 1.3); c.stroke(); break;
    case 'void': c.fillStyle = '#000'; c.beginPath(); c.arc(0, 0, s * 0.6, 0, Math.PI * 2); c.fill(); c.strokeStyle = color; c.lineWidth = 2; c.stroke(); break;
    default: glowCircle(c, 0, 0, s * 1.4, hexA(color, 0.8));
  }
  c.restore();
}

// ---------- creatures for SUMMON ultimates ----------
function drawCreature(c, kind, x, y, s, t, col, act) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const dk = shadeHex(col, -0.45), lt = shadeHex(col, 0.3);
  c.strokeStyle = OUTLINE; c.lineWidth = 3 / s * 2;
  switch (kind) {
    case 'serpent': case 'hydra': {
      const heads = kind === 'hydra' ? 5 : 1;
      for (let h = 0; h < heads; h++) {
        const off = (h - (heads - 1) / 2) * 70, lunge = act * (kind === 'hydra' ? 0.8 : 1);
        c.strokeStyle = h % 2 ? dk : col; c.lineWidth = 46 - heads * 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(off, 300);
        for (let i = 0; i <= 10; i++) { const k = i / 10; c.lineTo(off + Math.sin(k * 6 + t * 3 + h) * 40 * (1 - k) + lunge * 160 * k, 300 - k * 420 - lunge * 60 * k); }
        c.stroke();
        const hx = off + lunge * 160, hy = -120 - lunge * 60;
        c.fillStyle = col; c.beginPath(); c.ellipse(hx + 20, hy, 60, 34, 0.3, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#300'; c.beginPath(); c.moveTo(hx + 20, hy + 6); c.lineTo(hx + 80, hy + 10 + act * 30); c.lineTo(hx + 30, hy + 26); c.fill();
        c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(hx + 34 + i * 10, hy + 8); c.lineTo(hx + 38 + i * 10, hy + 20); c.lineTo(hx + 42 + i * 10, hy + 8); c.fill(); }
        c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 30, hy - 12, 14, 'rgba(255,240,120,1)'); c.globalCompositeOperation = 'source-over';
      }
      break;
    }
    case 'kraken': {
      for (let i = 0; i < 8; i++) { c.strokeStyle = i % 2 ? col : dk; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 60); const a = -Math.PI * (0.15 + i * 0.1); c.quadraticCurveTo(Math.cos(a) * 260 + Math.sin(t * 3 + i) * 40, Math.sin(a) * 200 - act * 100, Math.cos(a) * (360 + act * 80) + Math.sin(t * 2 + i) * 50, Math.sin(a) * 340 - act * 60); c.stroke(); }
      c.fillStyle = col; c.beginPath(); c.ellipse(0, -60, 160, 200, 0, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = 'lighter'; for (const ex of [-60, 60]) glowCircle(c, ex, -40, 36, 'rgba(120,255,200,1)'); c.globalCompositeOperation = 'source-over';
      break;
    }
    case 'demon': {
      c.fillStyle = dk; c.beginPath(); c.moveTo(-220, 300); c.quadraticCurveTo(-260, -40, -120, -200); c.lineTo(120, -200); c.quadraticCurveTo(260, -40, 220, 300); c.fill();
      c.fillStyle = '#140008'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 60, -200); c.quadraticCurveTo(d * 160, -300, d * 140, -420); c.quadraticCurveTo(d * 110, -300, d * 20, -210); c.fill(); }
      c.globalCompositeOperation = 'lighter'; for (const ex of [-50, 50]) glowCircle(c, ex, -140, 34, hexA(col, 1)); glowCircle(c, 0, -60, 60 + act * 40, hexA(col, 0.8)); c.globalCompositeOperation = 'source-over';
      for (const d of [-1, 1]) { c.strokeStyle = dk; c.lineWidth = 40; c.beginPath(); c.moveTo(d * 180, -60); c.lineTo(d * (260 - act * 120), 120 + act * 80); c.stroke(); c.strokeStyle = '#eee'; c.lineWidth = 6; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(d * (260 - act * 120), 120 + act * 80); c.lineTo(d * (250 - act * 120) + k * 20, 170 + act * 80); c.stroke(); } }
      break;
    }
    case 'moon': {
      glowCircle(c, 0, 0, 420, hexA(col, 0.5), hexA(col, 0)); circle(c, 0, 0, 240, col);
      c.globalAlpha = 0.25; for (const [cx, cy, r] of [[-80, -60, 50], [70, 40, 70], [20, -120, 30], [-60, 110, 40]]) circle(c, cx, cy, r, dk); c.globalAlpha = 1;
      break;
    }
    case 'tree': {
      c.fillStyle = '#4a3a2a'; c.beginPath(); c.moveTo(-70, 400); c.lineTo(-40, -120); c.lineTo(40, -120); c.lineTo(70, 400); c.fill();
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.4; c.strokeStyle = '#4a3a2a'; c.lineWidth = 20 - Math.abs(i - 3) * 3; c.beginPath(); c.moveTo(0, -100); c.lineTo(Math.cos(a) * 240, -100 + Math.sin(a) * 240); c.stroke(); }
      for (let i = 0; i < 16; i++) ellipse(c, Math.cos(i) * 220 + Math.sin(t + i) * 8, -260 + Math.sin(i * 1.7) * 110, 110, 70, i % 2 ? col : lt);
      for (let i = 0; i < 6; i++) { c.strokeStyle = '#3a2a1a'; c.lineWidth = 12; c.beginPath(); c.moveTo(i * 50 - 120, 380); c.quadraticCurveTo(i * 80 - 180 + act * 200, 300 - act * 200, i * 30 + act * 300, 200 - act * 260); c.stroke(); }
      break;
    }
    case 'army': case 'goons': case 'lions': case 'robot': {
      const mdl = kind === 'army' ? MINION_MODELS.skeleton : kind === 'goons' ? MINION_MODELS.goon : kind === 'lions' ? MINION_MODELS.lion : MINION_MODELS.bot;
      const draw = makeModelDraw(mdl);
      for (let i = 0; i < 18; i++) { c.save(); c.translate(-500 + i * 60 + act * 500 + Math.sin(i * 3) * 20, 200 + (i % 3) * 40); c.scale(1.4, 1.4); draw(c, { pose: i % 2 ? 'run' : 'punch', anim: t + i }); c.restore(); }
      break;
    }
  }
  c.restore();
}

// ---------- dimension backdrops ----------
function drawDimension(c, world, t, col) {
  switch (world) {
    case 'console': c.fillStyle = '#000'; c.fillRect(0, 0, W, H); c.strokeStyle = hexA(col, 0.25); c.lineWidth = 1; for (let x = 0; x < W; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } bigText(c, 'STAGE 99', 120, 60, 26, col, null, 'left', 'monospace'); bigText(c, 'HI-SCORE 999999', W - 120, 60, 26, col, null, 'right', 'monospace'); break;
    case 'cyber': c.fillStyle = '#000a04'; c.fillRect(0, 0, W, H); c.font = '16px monospace'; c.fillStyle = hexA(col, 0.6); for (let i = 0; i < 60; i++) { const x = (i * 23) % W, y = ((t * 300 + i * 97) % (H + 200)) - 100; c.fillText(Math.random() < 0.5 ? '1' : '0', x, y); } break;
    case 'web': c.fillStyle = '#0a0006'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(230,230,230,0.35)'; c.lineWidth = 1.5; for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(W / 2, H / 2); c.lineTo(W / 2 + Math.cos(i / 16 * 6.28) * 900, H / 2 + Math.sin(i / 16 * 6.28) * 900); c.stroke(); } for (let r = 60; r < 800; r += 60) { c.beginPath(); c.arc(W / 2, H / 2, r, 0, Math.PI * 2); c.stroke(); } break;
    case 'mirror': c.fillStyle = '#101018'; c.fillRect(0, 0, W, H); for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(200,210,255,${0.05 + (i % 3) * 0.04})`; c.beginPath(); c.moveTo(i * 100, 0); c.lineTo(i * 100 + 160, 0); c.lineTo(i * 100 + 40, H); c.lineTo(i * 100 - 60, H); c.fill(); } break;
    case 'wheel': c.fillStyle = '#1a0a00'; c.fillRect(0, 0, W, H); c.save(); c.translate(W / 2, H / 2); c.rotate(t * 0.5); c.strokeStyle = hexA(col, 0.6); c.lineWidth = 10; c.beginPath(); c.arc(0, 0, 320, 0, Math.PI * 2); c.stroke(); for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(0, 0); c.lineTo(320, 0); c.stroke(); } c.restore(); break;
    case 'quantum': c.fillStyle = '#000'; c.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { c.globalAlpha = 0.15; glowCircle(c, (i * 173) % W, (i * 97 + t * 40) % H, 80, hexA(col, 0.5)); } c.globalAlpha = 1; break;
    case 'ballroom': c.fillStyle = '#1a0008'; c.fillRect(0, 0, W, H); c.fillStyle = '#3a0a14'; for (let i = 0; i < 8; i++) c.fillRect(i * 170, 0, 30, H); for (let i = 0; i < 3; i++) { c.globalCompositeOperation = 'lighter'; glowCircle(c, 250 + i * 400, 120, 60, 'rgba(255,220,140,0.6)'); c.globalCompositeOperation = 'source-over'; } for (let i = 0; i < 6; i++) { const dx = Math.sin(t * 2 + i) * 30; silhouette(c, o => drawCharAt(o, { draw: (cc, v) => drawHumanoid(cc, v, { skin: '#000', top: '#000', pants: '#000', boots: '#000' }) }, 100 + i * 210 + dx, H - 60, 1.4, i % 2 ? 1 : -1, { pose: 'walk', anim: t + i }), '#0a0004', 0.7); } break;
    case 'underworld': case 'haunt': default: c.fillStyle = '#000'; c.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) { const x = (i * 157 + t * 30) % W, y = H - ((t * 60 + i * 83) % H); c.globalAlpha = 0.4; drawElementBit(c, 'soul', x, y, 10, t + i, col); } c.globalAlpha = 1; glowCircle(c, W / 2, H, 600, hexA(col, 0.25), hexA(col, 0)); break;
  }
}

Object.assign(UltTemplates, {
  // A huge beam that crosses the city and leaves the planet
  megabeam(f, opp, U) {
    const fx = new ParticleSystem(2500), col = U.fx.color, city = makeCineCity();
    return {
      name: U.name, dur: 7, fx,
      cues: [[0, () => Sfx.charge(2.4)], [2.6, () => Sfx.beam(2.2)], [3.8, () => Sfx.boom()], [4.9, () => Sfx.boom()]],
      draw(c, t) {
        if (t < 1.6) { ultIntro(c, t, f, U, 0, 1.6); converge(fx, W / 2 + 60, H / 2 - 20, col, 4, 500); fx.draw(c); }
        else if (t < 2.6) {
          c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
          const k = ease.out(seg(t, 1.6, 2.5));
          c.globalCompositeOperation = 'lighter';
          glowCircle(c, W / 2, H / 2, 80 + k * 260, hexA(col, 0.9), hexA(col, 0)); glowCircle(c, W / 2, H / 2, 40 + k * 100, 'rgba(255,255,255,1)');
          c.strokeStyle = hexA(col, 0.8); c.lineWidth = 3; for (let i = 0; i < 10; i++) { c.beginPath(); let x = W / 2, y = H / 2; c.moveTo(x, y); for (let s = 0; s < 6; s++) { x += rand(-60, 60); y += rand(-60, 60); c.lineTo(x, y); } c.stroke(); }
          c.globalCompositeOperation = 'source-over';
          const words = U.name.split(' ');
          words.forEach((w, i) => { if (t > 1.8 + i * 0.25) bigText(c, w, W / 2, 120 + i * 90, 80, '#fff', hexA(col, 1)); });
        } else if (t < 3.8) {
          City.drawSky(c, t, { noMoon: true }); drawCineCity(c, city, H - 20);
          const p = seg(t, 2.6, 3.0), shk = 10; c.save(); c.translate(rand(-shk, shk), rand(-shk, shk));
          oppSil(c, opp, W * 0.8, H - 20, 1.6, 'hurt', '#fff', t);
          drawCharAt(c, f.def, W * 0.12, H - 20, 1.8, 1, { pose: 'cast', anim: t, transformed: f.form, alt: f.alt });
          c.globalCompositeOperation = 'lighter';
          const len = W * p, wd = 90 + Math.sin(t * 60) * 12;
          const g = c.createLinearGradient(0, H * 0.62 - wd, 0, H * 0.62 + wd); g.addColorStop(0, hexA(col, 0)); g.addColorStop(0.3, hexA(col, 0.9)); g.addColorStop(0.5, '#fff'); g.addColorStop(0.7, hexA(col, 0.9)); g.addColorStop(1, hexA(col, 0));
          c.fillStyle = g; c.fillRect(W * 0.15, H * 0.62 - wd, len, wd * 2);
          c.globalCompositeOperation = 'source-over';
          for (const b of city) if (!b.dead && b.x < W * 0.15 + len && b.x > W * 0.2) { b.dead = true; fx.burst(b.x + b.w / 2, H - 20 - b.h / 2, 16, { color: [col, '#fff'], size: 12, speed: 400, glow: true, life: 0.7 }); }
          fx.draw(c); c.restore();
        } else if (t < 4.9) {
          c.fillStyle = '#000'; c.fillRect(0, 0, W, H); starsScreen(c, t, 160);
          c.fillStyle = '#2a6ad8'; c.beginPath(); c.arc(W * 0.3, H + 900, 1100, 0, Math.PI * 2); c.fill();
          glowCircle(c, W * 0.3, H - 120, 500, 'rgba(120,180,255,0.3)', 'rgba(0,0,0,0)');
          const p = ease.out(seg(t, 3.8, 4.8));
          c.save(); c.translate(W * 0.34, H * 0.78); c.rotate(-0.6);
          c.globalCompositeOperation = 'lighter'; c.fillStyle = hexA(col, 0.9); c.fillRect(0, -26, 1600 * p, 52); c.fillStyle = '#fff'; c.fillRect(0, -10, 1600 * p, 20);
          c.restore(); c.globalCompositeOperation = 'source-over';
          if (t > 4.2) { c.globalAlpha = seg(t, 4.2, 4.4); bigText(c, 'IT LEFT THE ATMOSPHERE.', W / 2, 120, 36, '#fff'); c.globalAlpha = 1; }
        } else ultOutro(c, t, f, opp, U, 4.9, fx, city, H - 20);
      },
    };
  },
  // A giant creature rises and attacks
  summon(f, opp, U) {
    const fx = new ParticleSystem(2500), col = U.fx.color, kind = U.fx.creature || 'demon', city = makeCineCity();
    return {
      name: U.name, dur: 7, fx,
      cues: [[0, () => Sfx.voidHum()], [1.5, () => Sfx.roar()], [3.2, () => { Sfx.boom(); Sfx.slam(); }], [4.3, () => Sfx.boom()]],
      draw(c, t) {
        if (t < 1.5) {
          ultIntro(c, t, f, U, 0, 1.5);
          c.save(); c.translate(W / 2, H - 30); c.scale(1, 0.25); c.globalCompositeOperation = 'lighter';
          c.strokeStyle = hexA(col, seg(t, 0.2, 1)); c.lineWidth = 12; c.beginPath(); c.arc(0, 0, 320, 0, Math.PI * 2); c.stroke();
          c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t; c.lineTo(Math.cos(a) * 320, Math.sin(a) * 320); } c.closePath(); c.stroke();
          c.restore(); c.globalCompositeOperation = 'source-over';
        } else if (t < 4.3) {
          skyGrad(c, U.fx.sky); drawCineCity(c, city, H - 20, '#0a0a14');
          const rise = ease.out(seg(t, 1.5, 2.6)), act = ease.inOut(seg(t, 2.8, 3.3));
          const shk = t > 1.6 ? 8 : 0; c.save(); c.translate(rand(-shk, shk), rand(-shk, shk));
          oppSil(c, opp, W * 0.72, H - 20, 1.5, act > 0.5 ? 'hurt' : 'block', '#050508', t);
          const cx = kind === 'moon' ? W * 0.72 : kind === 'army' || kind === 'goons' || kind === 'lions' || kind === 'robot' ? W * 0.3 : W * 0.35;
          const cy = kind === 'moon' ? lerp(-500, H * 0.3 + act * 250, rise) : kind === 'army' || kind === 'goons' || kind === 'lions' || kind === 'robot' ? H - 260 : lerp(H + 500, H * 0.55, rise);
          drawCreature(c, kind, cx, cy, kind === 'moon' ? 1 : 1.1, t, col, act);
          if (act > 0.3) for (let i = 0; i < 5; i++) fx.add({ x: W * 0.72 + rand(-60, 60), y: H - 120 + rand(-60, 60), vx: rand(-500, 500), vy: rand(-500, 100), life: 0.6, size: rand(6, 14), color: pick([col, '#fff']), glow: true });
          for (const b of city) if (!b.dead && act > 0.5 && Math.abs(b.x - W * 0.72) < 300) b.dead = true;
          fx.draw(c); c.restore();
          caption(c, U.fx.lines[0], t, 1.6, 2.8); caption(c, U.fx.lines[1], t, 2.9, 4.2);
          flashAt(c, t, 3.2, 3.5, col);
        } else ultOutro(c, t, f, opp, U, 4.3, fx, city, H - 20);
      },
    };
  },
  // Pulled into a pocket dimension and beaten across it
  dimension(f, opp, U) {
    const fx = new ParticleSystem(2500), col = U.fx.color, world = U.fx.world || 'underworld';
    const hits = Array.from({ length: 14 }, (_, i) => ({ at: 1.6 + i * 0.2, a: rand(0, Math.PI * 2), r: rand(120, 240) }));
    return {
      name: U.name, dur: 7, fx,
      cues: [[0.4, () => Sfx.voidHum()], [1.2, () => Sfx.boom()], ...hits.map(h => [h.at, () => Sfx.hit()]), [4.6, () => { Sfx.boom(); Sfx.clang(); }]],
      draw(c, t) {
        if (t < 1.2) {
          skyGrad(c, U.fx.sky);
          drawCharAt(c, f.def, W * 0.3, H - 30, 2.4, 1, { pose: 'cast', anim: t, transformed: f.form, alt: f.alt });
          oppSil(c, opp, W * 0.72, H - 30, 2, 'block', '#08060c', t);
          const k = ease.out(seg(t, 0.3, 1.1));
          c.globalCompositeOperation = 'lighter';
          c.fillStyle = hexA(col, 0.9); c.beginPath(); c.moveTo(W * 0.55, 0); c.lineTo(W * 0.55 + 40 * k, H * 0.5); c.lineTo(W * 0.55, H); c.lineTo(W * 0.55 - 40 * k, H * 0.5); c.fill();
          c.globalCompositeOperation = 'source-over';
          caption(c, U.fx.lines[0], t, 0.1, 1.15);
        } else if (t < 4.6) {
          drawDimension(c, world, t, col);
          const cx = W / 2, cy = H / 2 + 20;
          c.save(); c.translate(cx, cy); c.rotate(Math.sin(t * 3) * 0.3); c.translate(-cx, -cy);
          oppSil(c, opp, cx, cy + 120, 1.8, 'hurt_air', '#05050a', t);
          c.restore();
          for (const h of hits) {
            if (t < h.at) continue;
            const k = 1 - seg(t, h.at, h.at + 0.25);
            if (k > 0) {
              const x = cx + Math.cos(h.a) * h.r, y = cy + Math.sin(h.a) * h.r * 0.6;
              c.globalAlpha = k; drawCharAt(c, f.def, x, y + 110, 1.5, Math.cos(h.a) > 0 ? -1 : 1, { pose: pick(['punch', 'kick', 'heavy', 'air_heavy']), anim: t, transformed: f.form, alt: f.alt }); c.globalAlpha = 1;
              if (k > 0.8) fx.burst(cx + rand(-30, 30), cy + rand(-40, 40), 6, { color: [col, '#fff'], size: 8, speed: 400, glow: true, life: 0.35 });
            }
          }
          fx.draw(c);
          const n = hits.filter(h => t >= h.at).length;
          if (n) bigText(c, n * 7 + ' HITS', W - 160, 120, 44, col);
          caption(c, U.fx.lines[1], t, 3.2, 4.5);
          if (t > 4.3) { c.strokeStyle = '#fff'; c.lineWidth = 3; for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(cx, cy); let x = cx, y = cy; for (let s = 0; s < 6; s++) { x += Math.cos(i * 0.63) * 70 + rand(-20, 20); y += Math.sin(i * 0.63) * 70 + rand(-20, 20); c.lineTo(x, y); } c.stroke(); } }
          flashAt(c, t, 1.2, 1.5, col);
        } else ultOutro(c, t, f, opp, U, 4.6, fx, makeCineCity(), H - 20);
      },
    };
  },
  // Something enormous falls from space
  meteor(f, opp, U) {
    const fx = new ParticleSystem(2500), col = U.fx.color, city = makeCineCity();
    return {
      name: U.name, dur: 7, fx,
      cues: [[0, () => Sfx.charge(1.4)], [1.4, () => Sfx.roar()], [3.4, () => { Sfx.boom(); Sfx.boom(0.2); Sfx.rock(0.1); }]],
      draw(c, t) {
        if (t < 1.4) { ultIntro(c, t, f, U, 0, 1.4); }
        else if (t < 2.4) {
          c.fillStyle = '#000'; c.fillRect(0, 0, W, H); starsScreen(c, t, 150);
          c.fillStyle = '#2a6ad8'; c.beginPath(); c.arc(W / 2, H + 1500, 1650, 0, Math.PI * 2); c.fill();
          const p = ease.in(seg(t, 1.4, 2.4));
          const mx = lerp(W + 200, W * 0.6, p), my = lerp(-200, H * 0.6, p), r = lerp(60, 160, p);
          for (let i = 0; i < 8; i++) fx.add({ x: mx + rand(-r, r) * 0.5, y: my + rand(-r, r) * 0.5, vx: 400, vy: -300, life: 0.5, size: r * 0.4, color: col, glow: true, grow: -r });
          fx.draw(c);
          c.globalCompositeOperation = 'lighter'; glowCircle(c, mx, my, r * 2.2, hexA(col, 0.9)); c.globalCompositeOperation = 'source-over';
          circle(c, mx, my, r, '#3a2a22');
          caption(c, U.fx.lines[0], t, 1.45, 2.35);
        } else if (t < 3.6) {
          skyGrad(c, ['#300800', '#8a2a00', '#ff8a2a']); drawCineCity(c, city, H - 20, '#1a0a08');
          oppSil(c, opp, W * 0.6, H - 20, 1.5, 'block', '#0a0404', t);
          const p = ease.in(seg(t, 2.4, 3.4)), mx = W * 0.6, my = lerp(-400, H - 120, p), r = lerp(200, 320, p);
          c.globalCompositeOperation = 'lighter'; glowCircle(c, mx, my, r * 1.8, hexA(col, 0.9)); c.globalCompositeOperation = 'source-over';
          circle(c, mx, my, r, '#2a1a12');
          for (let i = 0; i < 6; i++) fx.add({ x: mx + rand(-r, r), y: my - r * 0.5, vx: rand(-100, 100), vy: -600, life: 0.6, size: rand(20, 40), color: pick([col, '#ffcc33']), glow: true, grow: -40 });
          fx.draw(c);
          caption(c, U.fx.lines[1], t, 2.5, 3.4);
          flashAt(c, t, 3.4, 3.6, '#fff');
        } else if (t < 4.4) {
          const p = seg(t, 3.6, 4.4);
          c.fillStyle = '#fff4d0'; c.fillRect(0, 0, W, H);
          for (let i = 0; i < 5; i++) { c.strokeStyle = `rgba(255,${100 + i * 30},20,${1 - p})`; c.lineWidth = 40 - i * 6; c.beginPath(); c.ellipse(W * 0.6, H - 60, Math.max(1, p * 1800 - i * 100), Math.max(1, p * 400 - i * 30), 0, 0, Math.PI * 2); c.stroke(); }
        } else ultOutro(c, t, f, opp, U, 4.4, fx, city.map(b => Object.assign({}, b, { dead: true })), H - 20);
      },
    };
  },
  // A barrage of a hundred element-flavored hits
  barrage(f, opp, U) {
    const fx = new ParticleSystem(3000), col = U.fx.color, el = U.fx.el;
    return {
      name: U.name, dur: 6.8, fx,
      cues: [[0, () => Sfx.charge(1)], ...Array.from({ length: 24 }, (_, i) => [1.3 + i * 0.1, () => Sfx.hit()]), [4.1, () => { Sfx.boom(); Sfx.slam(); }]],
      draw(c, t) {
        if (t < 1.2) {
          c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
          drawCharAt(c, f.def, W / 2 - 40, H + 300, 6, 1, { pose: 'cast', anim: t, transformed: f.form, alt: f.alt });
          c.fillStyle = '#000'; c.fillRect(0, 0, W, H * 0.25); c.fillRect(0, H * 0.72, W, H);
          speedLines(c, t, W / 2, H / 2, hexA(col, 0.5));
          caption(c, U.fx.lines[0], t, 0.1, 1.15);
        } else if (t < 4.2) {
          skyGrad(c, U.fx.sky);
          speedLines(c, t, W / 2, H / 2, hexA(col, 0.4), 60);
          const cx = W * 0.6, cy = H / 2 + 60;
          c.save(); c.translate(rand(-6, 6), rand(-6, 6)); oppSil(c, opp, cx, cy + 120, 1.8, 'hurt', '#050508', t); c.restore();
          drawCharAt(c, f.def, W * 0.22, H - 40, 1.9, 1, { pose: Math.floor(t * 12) % 2 ? 'punch' : 'punch2', anim: t, transformed: f.form, alt: f.alt });
          for (let i = 0; i < 5; i++) {
            const sx = W * 0.26, sy = H * 0.55 + rand(-80, 80);
            fx.add({ x: sx, y: sy, vx: (cx - sx) * 3 + rand(-100, 100), vy: (cy - sy) * 3 + rand(-100, 100), life: 0.33, size: 14, color: col, glow: true });
          }
          fx.draw(c);
          for (let i = 0; i < 8; i++) drawElementBit(c, el, cx + rand(-80, 80), cy + rand(-80, 80), 14, t * 10 + i, col);
          const n = Math.floor(seg(t, 1.2, 4.1) * 100);
          bigText(c, n + ' HITS!', W - 170, 110, 50, col);
          caption(c, U.fx.lines[1], t, 2.8, 4.1);
          flashAt(c, t, 4.1, 4.2, col);
        } else ultOutro(c, t, f, opp, U, 4.2, fx, makeCineCity(), H - 20);
      },
    };
  },
});

// patch the transformation template to read the new def.fx
function csAscendV3(f) {
  const d = f.def, fx0 = d.fx || { el: 'light', sky: ['#000', '#111', '#222'] };
  const proxy = Object.create(d); proxy.ult = { fx: fx0 };
  const cs = csAscend({ def: proxy, form: f.form, alt: f.alt });
  return cs;
}

// ---------- routers ----------
Cutscenes.transform = f => (f.def.transformCutscene || csAscendV3)(f);
Cutscenes.ultFor = (a, t, m) => {
  const U = m.ult;
  if (U.cutscene) return U.cutscene(a, t);
  const tpl = UltTemplates[U.template] || UltTemplates.rush;
  return tpl(a, t, { name: m.name, fx: Object.assign({ el: 'light', color: a.def.color, sky: ['#000', '#111', '#333'], lines: ['...', '...'] }, U.fx) });
};
