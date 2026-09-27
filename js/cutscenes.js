// ============================================================
//  MOONKAI — cinematic cutscenes (all procedurally animated)
//  Each cutscene: { name, dur, fx, cues:[[time, fn]], draw(c, t, cs), update?(dt, t, cs) }
// ============================================================

// ---- shared cinematic helpers ----
const _off = document.createElement('canvas'); _off.width = W; _off.height = H;
const _octx = _off.getContext('2d');
function silhouette(c, drawFn, color = '#000', alpha = 1) {
  _octx.setTransform(1, 0, 0, 1, 0, 0);
  _octx.globalCompositeOperation = 'source-over';
  _octx.clearRect(0, 0, W, H);
  drawFn(_octx);
  _octx.globalCompositeOperation = 'source-in';
  _octx.fillStyle = color; _octx.fillRect(0, 0, W, H);
  _octx.globalCompositeOperation = 'source-over';
  c.globalAlpha = alpha; c.drawImage(_off, 0, 0); c.globalAlpha = 1;
}
function drawCharAt(c, def, x, y, s, facing, v) {
  c.save(); c.translate(x, y); c.scale(s * facing, s);
  def.draw(c, Object.assign({ pose: 'idle', anim: 0, transformed: false }, v));
  c.restore();
}
function letterbox(c, amt = 1) {
  c.fillStyle = '#000';
  c.fillRect(0, 0, W, 64 * amt); c.fillRect(0, H - 64 * amt, W, 64 * amt);
}
function caption(c, text, t, a, b, color = '#fff') {
  if (t < a || t > b) return;
  const alpha = Math.min(seg(t, a, a + 0.25), 1 - seg(t, b - 0.25, b));
  const n = Math.floor(text.length * seg(t, a, a + Math.min(0.9, (b - a) * 0.6)));
  c.globalAlpha = alpha;
  c.font = 'italic 26px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,0.85)'; c.strokeText(text.slice(0, n), W / 2, H - 100);
  c.fillStyle = color; c.fillText(text.slice(0, n), W / 2, H - 100);
  c.globalAlpha = 1;
}
function titleSlam(c, text, sub, t, a, color, size = 110) {
  if (t < a) return;
  const p = seg(t, a, a + 0.25);
  const s = lerp(2.4, 1, ease.out(p));
  c.save(); c.globalAlpha = p; c.translate(W / 2, H / 2 - 20); c.scale(s, s);
  bigText(c, text, 0, 0, size, color, '#000');
  c.restore();
  if (sub) { c.globalAlpha = seg(t, a + 0.2, a + 0.5); bigText(c, sub, W / 2, H / 2 + size * 0.55, 28, '#fff', '#000'); c.globalAlpha = 1; }
}
function flashAt(c, t, a, b, color = '#fff') { if (t >= a) flash(c, 1 - seg(t, a, b), color); }
function flash(c, alpha, color = '#fff') {
  if (alpha <= 0) return;
  c.globalAlpha = clamp(alpha, 0, 1); c.fillStyle = color; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
}
function makeCineCity(n = 16, minH = 120, maxH = 340) {
  const out = []; let x = -20;
  while (x < W + 20) {
    const w = rand(60, 120);
    out.push({ x, w, h: rand(minH, maxH), win: Array.from({ length: 60 }, () => Math.random() < 0.5), dead: false, lift: null });
    x += w + rand(2, 12);
  }
  return out;
}
function drawCineCity(c, city, baseY, col = '#12112a', lit = true) {
  for (const b of city) {
    if (b.lift) continue;
    const top = baseY - (b.dead ? b.h * 0.18 : b.h);
    c.fillStyle = col;
    if (!b.dead) c.fillRect(b.x, top, b.w, baseY - top);
    else {
      c.beginPath(); c.moveTo(b.x, baseY);
      for (let i = 0; i <= 5; i++) c.lineTo(b.x + b.w * i / 5, top + ((i * 29) % 13) - (i % 2) * 10);
      c.lineTo(b.x + b.w, baseY); c.fill();
      glowCircle(c, b.x + b.w / 2, top, b.w, 'rgba(255,110,30,0.45)', 'rgba(255,50,0,0)');
    }
    if (lit && !b.dead) {
      c.fillStyle = 'rgba(255,214,120,0.7)';
      let k = 0;
      for (let yy = top + 12; yy < baseY - 14; yy += 20) for (let xx = b.x + 8; xx < b.x + b.w - 10; xx += 14) { if (b.win[k++ % 60]) c.fillRect(xx, yy, 6, 9); }
    }
  }
}
function vignette(c, amt, color = '0,0,0') {
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(1, `rgba(${color},${amt})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function speedLines(c, t, cx, cy, color = 'rgba(255,255,255,0.5)', n = 40) {
  c.strokeStyle = color; c.lineWidth = 2;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + (i * 7.3), r0 = 260 + ((t * 900 + i * 97) % 500);
    c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * (r0 + 120), cy + Math.sin(a) * (r0 + 120)); c.stroke();
  }
}
function converge(fx, x, y, color, n = 2, r = 300) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), d = rand(r * 0.6, r);
    fx.add({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: -Math.cos(a) * d * 2.2, vy: -Math.sin(a) * d * 2.2, life: 0.45, size: rand(2, 5), color, glow: true });
  }
}
function drawBigEye(c, t, open, iris, pupil, moonGlint = true, vein = 0) {
  const cx = W / 2, cy = H / 2, ew = 520, eh = 170 * open;
  c.save();
  c.beginPath(); c.moveTo(cx - ew, cy); c.quadraticCurveTo(cx, cy - eh * 2, cx + ew, cy); c.quadraticCurveTo(cx, cy + eh * 2, cx - ew, cy); c.closePath();
  c.fillStyle = '#f4ece0'; c.fill(); c.clip();
  if (vein > 0) {
    c.strokeStyle = `rgba(200,20,20,${vein * 0.7})`; c.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * 520, cy + Math.sin(a) * 300);
      c.quadraticCurveTo(cx + Math.cos(a + 0.2) * 300, cy + Math.sin(a + 0.3) * 200, cx + Math.cos(a) * 170, cy + Math.sin(a) * 170); c.stroke();
    }
  }
  const g = c.createRadialGradient(cx, cy, 20, cx, cy, 150);
  g.addColorStop(0, iris[0]); g.addColorStop(0.7, iris[1]); g.addColorStop(1, '#100404');
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 150, 0, Math.PI * 2); c.fill();
  circle(c, cx, cy, pupil, '#050101');
  if (moonGlint) { circle(c, cx + 45, cy - 50, 24, 'rgba(255,255,240,0.9)'); circle(c, cx - 50, cy + 40, 8, 'rgba(255,255,255,0.6)'); }
  c.restore();
}

// ============================================================
//  ERIC — MOON ORB transformation
// ============================================================
function csEricTransform(f) {
  const fx = new ParticleSystem();
  return {
    name: 'MOON ORB', dur: 4.6, fx,
    cues: [[0, () => Sfx.charge(0.9)], [0.95, () => Sfx.whoosh()], [1.35, () => { Sfx.boom(); }], [1.75, () => Sfx.heartbeat()], [2.25, () => Sfx.heartbeat()], [2.8, () => Sfx.roar()], [3.5, () => Sfx.slam()]],
    draw(c, t, cs) {
      if (t < 1.6) {
        City.drawSky(c, t, { fullMoon: false, noMoon: t > 1.35 });
        const moonP = ease.out(seg(t, 1.35, 1.6));
        if (t > 1.35) City.drawMoon(c, t, 1, W * 0.72, 140, 20 + moonP * 120);
        c.fillStyle = '#0c0b1d'; c.fillRect(0, H - 120, W, 120);
        const s = 3.2, ex = W * 0.4, ey = H + 70;
        drawCharAt(c, f.def, ex, ey, s, 1, { pose: t < 0.9 ? 'charge' : 'cast', anim: t, transformed: false });
        const hx = ex + 10 * s, hy = ey - 128 * s - 22;
        if (t < 0.95) {
          const r = 8 + 42 * ease.out(seg(t, 0, 0.8));
          if (Math.random() < 0.9) converge(fx, hx, hy, pick(['#fff9d0', '#bfe4ff']), 3, 240);
          c.globalCompositeOperation = 'lighter';
          glowCircle(c, hx, hy, r * 3, 'rgba(255,250,210,0.6)', 'rgba(150,200,255,0)');
          glowCircle(c, hx, hy, r, 'rgba(255,255,255,1)', 'rgba(255,250,210,0.8)');
          c.globalCompositeOperation = 'source-over';
        } else if (t < 1.35) {
          const p = ease.in(seg(t, 0.95, 1.35));
          const ox = lerp(hx, W * 0.72, p), oy = lerp(hy, 140, p);
          fx.add({ x: ox, y: oy, life: 0.4, size: 16 * (1 - p) + 6, color: '#fff6c8', glow: true });
          c.globalCompositeOperation = 'lighter';
          glowCircle(c, ox, oy, 50 * (1 - p) + 18, 'rgba(255,255,255,1)', 'rgba(255,240,180,0)');
          c.globalCompositeOperation = 'source-over';
        }
        fx.draw(c);
        caption(c, "No full moon tonight? ...Then I'll make one.", t, 0.05, 1.3);
        flashAt(c, t, 1.35, 1.6);
      } else if (t < 2.7) {
        const red = seg(t, 1.8, 2.5);
        const beat = Math.max(Math.exp(-((t - 1.75) ** 2) * 200), Math.exp(-((t - 2.25) ** 2) * 200));
        c.fillStyle = '#0a0612'; c.fillRect(0, 0, W, H);
        c.save(); c.translate(W / 2, H / 2); c.scale(1 + beat * 0.08, 1 + beat * 0.08); c.translate(-W / 2, -H / 2);
        c.fillStyle = '#e0b07a'; c.fillRect(0, 0, W, H);
        drawBigEye(c, t, 1, [`rgb(${lerp(120, 255, red)},${lerp(80, 30, red)},${lerp(40, 20, red)})`, `rgb(${lerp(70, 160, red)},${lerp(40, 0, red)},20)`], lerp(60, 16, red), true, red);
        c.restore();
        vignette(c, 0.9, '40,0,0');
        if (beat > 0.3) { c.globalAlpha = beat; bigText(c, 'BA-DUMP', W / 2 + (t > 2 ? 260 : -260), H / 2 - 200, 70, '#ff3b3b'); c.globalAlpha = 1; }
      } else {
        const p = seg(t, 2.7, 3.7);
        City.drawSky(c, t, { top: '#10060a', mid: '#2a0a16', bot: '#4a1020', fullMoon: false, noMoon: true });
        City.drawMoon(c, t, 1, W / 2, 330, 270);
        const shakeX = t > 2.8 && t < 4 ? rand(-10, 10) : 0;
        c.save(); c.translate(shakeX, shakeX * 0.6);
        const hs = lerp(3, 0.5, ease.in(p));
        if (p < 1) silhouette(c, o => drawCharAt(o, f.def, W / 2, H + 20, hs * 1.3, 1, { pose: 'charge', anim: t, transformed: false }), '#050205', 1 - p);
        const S = lerp(1.2, 4.6, ease.out(p));
        silhouette(c, o => drawCharAt(o, f.def, W / 2 - 40, H + 30, S, 1, { pose: 'charge', anim: t, transformed: true, roar: 1 }), '#050205', ease.out(p));
        if (p > 0.3) {
          c.globalCompositeOperation = 'lighter';
          for (const ex of [13, 23]) glowCircle(c, W / 2 - 40 + ex * S, H + 30 - 101 * S, 14 + S * 3, 'rgba(255,30,30,1)', 'rgba(255,0,0,0)');
          c.globalCompositeOperation = 'source-over';
        }
        if (Math.random() < 0.8) fx.burst(W / 2 + rand(-300, 300), H - rand(0, 400), 2, { color: ['#3a2414', '#5b3a22'], size: 8, speed: 400, life: 0.8, shape: 'rect' });
        fx.draw(c);
        c.restore();
        if (t > 2.8 && t < 3.6) speedLines(c, t, W / 2, H / 2, 'rgba(255,220,220,0.35)');
        titleSlam(c, 'MOONKAI', 'GREAT APE FORM', t, 3.5, '#ffd35a', 130);
        flashAt(c, t, 2.7, 2.9, '#ff2a2a');
      }
    },
  };
}

// ============================================================
//  ERIC — LUNAR CATACLYSM ultimate
// ============================================================
function csEricUlt(f, opp) {
  const fx = new ParticleSystem(2500);
  const city = makeCineCity(); const baseY = H - 20;
  const ax = 230, ay = H + 20, S = 4.1;
  const mouth = () => [ax + 25 * S, ay - 86 * S];
  let exploded = 0;
  return {
    name: 'LUNAR CATACLYSM', dur: 7.2, fx,
    cues: [[0.1, () => Sfx.roar()], [0.3, () => Sfx.charge(1.9)], [2.1, () => Sfx.slam()], [2.55, () => Sfx.slam()], [3.0, () => Sfx.beam(2.2)], [5.25, () => Sfx.boom()]],
    draw(c, t, cs) {
      const [mx, my] = mouth();
      if (t < 2.0 || (t >= 3.0 && t < 5.3)) {
        City.drawSky(c, t, { top: '#0a0716', mid: '#2a1030', bot: '#51203a', fullMoon: false, noMoon: true });
        City.drawMoon(c, t, 1, W * 0.62, 250, 220);
        const shk = t >= 3 ? 8 : seg(t, 1, 2) * 4;
        c.save(); c.translate(rand(-shk, shk), rand(-shk, shk));
        // beam sweep
        let ang = 0;
        if (t >= 3.0) {
          const p = seg(t, 3.0, 5.0);
          ang = lerp(-0.06, 0.2, ease.inOut(p));
          // explode buildings under the beam's reach
          for (const b of city) {
            const bx = b.x + b.w / 2;
            if (!b.dead && bx > mx + 60 && (bx - mx) < p * 1400) {
              b.dead = true; exploded++;
              fx.burst(bx, baseY - b.h * 0.6, 40, { color: ['#ffe28a', '#ff8a1a', '#ff3b1a', '#fff'], size: 18, speed: 520, life: 1.1, glow: true, drag: 0.03 });
              fx.burst(bx, baseY - b.h * 0.6, 16, { color: ['#333', '#555'], size: 12, speed: 420, life: 1.4, g: 500, shape: 'rect' });
              if (exploded % 2) Sfx.boom();
            }
          }
        }
        drawCineCity(c, city, baseY);
        fx.draw(c);
        drawCharAt(c, f.def, ax, ay, S, 1, { pose: 'idle', anim: t, transformed: true, roar: t >= 3 ? 1 : seg(t, 0.2, 1.2), mouthGlow: t >= 3 ? 1.4 : seg(t, 0.3, 2) });
        if (t < 2 && Math.random() < 0.95) converge(fx, mx, my, pick(['#fff6b0', '#ffd35a', '#ffffff']), 4, 500);
        if (t >= 3.0) {
          const len = 1700, wdt = 70 + Math.sin(t * 60) * 8;
          c.save(); c.translate(mx, my); c.rotate(ang);
          c.globalCompositeOperation = 'lighter';
          const g = c.createLinearGradient(0, -wdt, 0, wdt);
          g.addColorStop(0, 'rgba(255,170,40,0)'); g.addColorStop(0.3, 'rgba(255,210,90,0.8)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(0.7, 'rgba(255,210,90,0.8)'); g.addColorStop(1, 'rgba(255,170,40,0)');
          c.fillStyle = g; c.fillRect(0, -wdt, len, wdt * 2);
          glowCircle(c, 0, 0, 120, 'rgba(255,255,230,1)', 'rgba(255,200,80,0)');
          for (let i = 0; i < 6; i++) { fx.add({ x: mx + Math.cos(ang) * rand(0, 1400), y: my + Math.sin(ang) * rand(0, 1400) + rand(-50, 50), vx: rand(-50, 50), vy: rand(-80, 80), life: 0.3, size: rand(4, 10), color: '#fff6c0', glow: true }); }
          c.restore();
        }
        c.restore();
        caption(c, "This city's gonna need a new skyline.", t, 0.2, 1.9);
        flashAt(c, t, 3.0, 3.25);
      } else if (t < 3.0) {
        // extreme close-up of the ape's charging maw
        c.fillStyle = '#12060a'; c.fillRect(0, 0, W, H);
        const CS = 12, sh = t > 2.5 ? 14 : 5;
        c.save(); c.translate(rand(-sh, sh), rand(-sh, sh));
        drawCharAt(c, f.def, W / 2 - 25 * CS, H / 2 + 60 + 86 * CS, CS, 1, { pose: 'idle', anim: t, transformed: true, roar: 1, mouthGlow: 1 + Math.sin(t * 40) * 0.15 });
        c.restore();
        speedLines(c, t, W / 2, H / 2 + 60, 'rgba(255,240,180,0.6)', 60);
        if (t > 2.1) { const s = lerp(1.6, 1, ease.out(seg(t, 2.1, 2.3))); c.save(); c.translate(W * 0.3, 150); c.scale(s, s); bigText(c, 'LUNAR...', 0, 0, 90, '#fff6c0', '#3a1a00'); c.restore(); }
        if (t > 2.55) { const s = lerp(2, 1, ease.out(seg(t, 2.55, 2.75))); c.save(); c.translate(W * 0.64, H - 150); c.scale(s, s); bigText(c, 'CATACLYSM!!', 0, 0, 110, '#ffd35a', '#3a1a00'); c.restore(); }
      } else {
        // aftermath
        const p = seg(t, 5.3, 7.2);
        City.drawSky(c, t, { top: '#140808', mid: '#3a1210', bot: '#7a2a10', fullMoon: false, noMoon: true });
        City.drawMoon(c, t, 1, W * 0.62, 250, 220);
        drawCineCity(c, city, baseY);
        if (Math.random() < 0.9) fx.add({ x: rand(0, W), y: baseY - rand(0, 60), vx: rand(-10, 30), vy: rand(-60, -20), life: rand(2, 3), size: rand(14, 30), color: 'rgba(30,20,20,0.45)', grow: 14 });
        if (Math.random() < 0.9) fx.add({ x: rand(300, W), y: baseY - rand(0, 80), vx: rand(-10, 10), vy: rand(-120, -40), life: 0.7, size: rand(5, 10), color: pick(['#ff8a1a', '#ffcc33']), glow: true, grow: -6 });
        fx.draw(c);
        silhouette(c, o => drawCharAt(o, f.def, ax, ay, S, 1, { pose: 'charge', anim: t, transformed: true, roar: 1 }), '#0a0406');
        c.globalCompositeOperation = 'lighter';
        for (const ex of [13, 23]) glowCircle(c, ax + ex * S, ay - 101 * S, 26, 'rgba(255,30,30,1)', 'rgba(255,0,0,0)');
        c.globalCompositeOperation = 'source-over';
        titleSlam(c, 'LUNAR CATACLYSM', `${opp.def.name} TAKES A DIRECT HIT`, t, 5.5, '#ffd35a', 100);
        flashAt(c, t, 5.3, 5.9);
      }
    },
  };
}

// ============================================================
//  KIRA — PHOENIX ASCENSION transformation
// ============================================================
function csKiraTransform(f) {
  const fx = new ParticleSystem();
  return {
    name: 'PHOENIX ASCENSION', dur: 4.0, fx,
    cues: [[0, () => Sfx.fire()], [1.2, () => Sfx.charge(1.1)], [2.3, () => { Sfx.screech(); Sfx.boom(); }]],
    draw(c, t) {
      const heat = seg(t, 0, 2.3);
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, `rgb(${lerp(10, 60, heat)},${lerp(6, 14, heat)},${lerp(20, 8, heat)})`);
      g.addColorStop(1, `rgb(${lerp(40, 200, heat)},${lerp(10, 60, heat)},10)`);
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      // cracked, glowing ground
      c.fillStyle = '#140806'; c.fillRect(0, H - 90, W, 90);
      c.strokeStyle = `rgba(255,140,30,${0.3 + heat * 0.7})`; c.lineWidth = 3;
      for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(W / 2, H - 70); c.lineTo(W / 2 + (i - 4) * 90, H - 40 + (i % 2) * 20); c.lineTo(W / 2 + (i - 4) * 170, H); c.stroke(); }
      const rise = ease.inOut(seg(t, 1.2, 2.3)) * 90;
      const cx = W / 2, cy = H - 60 - rise;
      if (Math.random() < 0.9) fx.add({ x: rand(0, W), y: H, vx: rand(-20, 20), vy: rand(-260, -120), life: rand(1, 2), size: rand(2, 5), color: pick(['#ffcc33', '#ff6a1a']), glow: true });
      if (t > 1.2 && t < 2.5) for (let i = 0; i < 6; i++) {
        const a = t * 9 + i * 1.05, r = 190 - seg(t, 1.2, 2.3) * 60;
        fx.add({ x: cx + Math.cos(a) * r, y: cy - 150 + Math.sin(a) * r * 0.5 + rand(-100, 100), vx: -Math.sin(a) * 300, vy: Math.cos(a) * 150 - 100, life: 0.5, size: rand(8, 16), color: pick(['#ffcc33', '#ff7a1a', '#ff3b1a']), glow: true, grow: -10 });
      }
      fx.draw(c);
      const wings = t > 2.3 ? ease.back(seg(t, 2.3, 2.8)) * 0.8 : 0;
      c.globalCompositeOperation = 'lighter';
      glowCircle(c, cx, cy - 180, 200 + wings * 150, `rgba(255,150,40,${0.2 + heat * 0.4})`, 'rgba(255,60,0,0)');
      c.globalCompositeOperation = 'source-over';
      drawCharAt(c, f.def, cx, cy, 3, 1, { pose: t < 1.2 ? 'kneel' : t < 2.3 ? 'charge' : 'victory', anim: t, transformed: t > 2.3, wings });
      caption(c, "Not yet... I'm not done burning.", t, 0.1, 1.4);
      if (t > 2.3 && t < 3) speedLines(c, t, cx, cy - 180, 'rgba(255,230,150,0.6)');
      titleSlam(c, 'PHOENIX ASCENSION', 'FLIGHT  •  REGENERATION  •  FEATHER STORM', t, 2.9, '#ff9a1a', 96);
      flashAt(c, t, 2.3, 2.6, '#fff2c0');
    },
  };
}

// ============================================================
//  KIRA — SUPERNOVA REBIRTH ultimate
// ============================================================
function drawFirebird(c, x, y, s, ang, t) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  c.globalCompositeOperation = 'lighter';
  glowCircle(c, 0, 0, 160, 'rgba(255,160,40,0.5)', 'rgba(255,60,0,0)');
  const flap = Math.sin(t * 10) * 0.25;
  for (const side of [-1, 1]) {
    c.save(); c.rotate(side * (0.2 + flap));
    const g = c.createLinearGradient(0, 0, -40, side * 200);
    g.addColorStop(0, 'rgba(255,255,200,1)'); g.addColorStop(0.5, 'rgba(255,140,20,0.9)'); g.addColorStop(1, 'rgba(255,40,0,0)');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(30, 0);
    c.bezierCurveTo(10, side * 80, -60, side * 170, -140, side * 220);
    for (let i = 0; i < 5; i++) c.lineTo(-140 + i * 30, side * (200 - i * 40) + side * 25), c.lineTo(-120 + i * 30, side * (180 - i * 40));
    c.closePath(); c.fill();
    c.restore();
  }
  // body + tail
  const bg = c.createLinearGradient(80, 0, -200, 0);
  bg.addColorStop(0, 'rgba(255,255,230,1)'); bg.addColorStop(0.4, 'rgba(255,170,40,0.95)'); bg.addColorStop(1, 'rgba(255,40,0,0)');
  c.fillStyle = bg;
  c.beginPath(); c.moveTo(90, 0); c.quadraticCurveTo(40, -26, -40, -14); c.lineTo(-240, -40 + Math.sin(t * 8) * 20); c.lineTo(-200, 0); c.lineTo(-240, 40 + Math.cos(t * 8) * 20); c.lineTo(-40, 14); c.quadraticCurveTo(40, 26, 90, 0); c.fill();
  glowCircle(c, 70, -4, 10, 'rgba(255,255,255,1)');
  c.restore();
  c.globalCompositeOperation = 'source-over';
}
function csKiraUlt(f, opp) {
  const fx = new ParticleSystem(2500);
  const city = makeCineCity(16, 80, 220); const baseY = H - 20;
  const target = [W * 0.3, baseY];
  return {
    name: 'SUPERNOVA REBIRTH', dur: 7.2, fx,
    cues: [[0, () => Sfx.fire()], [0.2, () => Sfx.charge(1.2)], [1.5, () => Sfx.boom()], [3.0, () => Sfx.screech()], [4.3, () => { Sfx.boom(); Sfx.boom(0.15); }], [5.4, () => Sfx.fire()]],
    draw(c, t) {
      if (t < 1.5) {
        City.drawSky(c, t, { fullMoon: false });
        drawCineCity(c, city, baseY);
        const p = ease.in(seg(t, 0.35, 1.4));
        const kx = W / 2, ky = lerp(baseY, -250, p);
        for (let i = 0; i < 5; i++) fx.add({ x: kx + rand(-14, 14), y: ky - 40 + rand(0, 60), vx: rand(-40, 40), vy: rand(40, 160), life: rand(0.5, 1), size: rand(8, 18), color: pick(['#ffcc33', '#ff7a1a', '#ff3b1a']), glow: true, grow: -8 });
        fx.draw(c);
        drawCharAt(c, f.def, kx, ky, 2, 1, { pose: t < 0.35 ? 'kneel' : 'charge', anim: t, transformed: true });
        caption(c, 'Burn bright...', t, 0.05, 1.3);
      } else if (t < 3.0) {
        const p = seg(t, 1.5, 3.0);
        const g = c.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, `rgb(${lerp(20, 255, p)},${lerp(10, 120, p)},${lerp(40, 20, p)})`);
        g.addColorStop(1, `rgb(${lerp(60, 255, p)},${lerp(20, 210, p)},${lerp(60, 90, p)})`);
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        const R = lerp(20, 230, ease.out(p));
        c.globalCompositeOperation = 'lighter';
        c.save(); c.translate(W / 2, H / 2 - 20); c.rotate(t * 0.8);
        c.fillStyle = 'rgba(255,220,120,0.35)';
        for (let i = 0; i < 16; i++) { c.rotate(Math.PI / 8); c.beginPath(); c.moveTo(-18, R * 0.9); c.lineTo(0, R * (1.7 + Math.sin(t * 7 + i) * 0.25)); c.lineTo(18, R * 0.9); c.fill(); }
        c.restore();
        glowCircle(c, W / 2, H / 2 - 20, R * 2.2, 'rgba(255,200,80,0.8)', 'rgba(255,90,0,0)');
        glowCircle(c, W / 2, H / 2 - 20, R, 'rgba(255,255,240,1)', 'rgba(255,220,120,0.9)');
        c.globalCompositeOperation = 'source-over';
        if (p < 0.5) silhouette(c, o => drawCharAt(o, f.def, W / 2, H / 2 + 60, 1.4, 1, { pose: 'victory', anim: t, transformed: true }), '#3a1000', 1 - p * 2);
        titleSlam(c, 'SUPERNOVA', null, t, 2.2, '#fff6c0', 120);
      } else if (t < 4.3) {
        const p = seg(t, 3.0, 4.3);
        City.drawSky(c, t, { top: '#ff8a2a', mid: '#ff5a1a', bot: '#b0200a', noMoon: true });
        drawCineCity(c, city, baseY, '#2a0e0a', false);
        silhouette(c, o => drawCharAt(o, opp.def, target[0], baseY, opp.transformed && opp.def.id === 'eric' ? 1.6 : 1.8, 1, { pose: 'block', anim: t, transformed: opp.transformed }), '#1a0604');
        const bx = lerp(W + 60, target[0], ease.inOut(p)), by = lerp(40, target[1] - 60, ease.inOut(p));
        for (let i = 0; i < 8; i++) fx.add({ x: bx + rand(-40, 40), y: by + rand(-40, 40), vx: rand(80, 300), vy: rand(-250, -60), life: rand(0.4, 0.9), size: rand(10, 22), color: pick(['#ffcc33', '#ff7a1a', '#ff3b1a']), glow: true, grow: -14 });
        fx.draw(c);
        drawFirebird(c, bx, by, lerp(0.6, 1.4, p), Math.atan2(target[1] - 100, target[0] - W - 60), t);
        caption(c, "Every ember remembers.", t, 3.05, 4.2);
      } else if (t < 5.0) {
        const p = seg(t, 4.3, 5.0);
        c.fillStyle = '#fff4d0'; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 4; i++) {
          c.strokeStyle = `rgba(255,${120 + i * 30},20,${1 - p})`; c.lineWidth = 30 - i * 5;
          c.beginPath(); c.ellipse(target[0], target[1] - 40, (p * 1400 - i * 120) > 0 ? p * 1400 - i * 120 : 1, Math.max(1, (p * 500 - i * 50)), 0, 0, Math.PI * 2); c.stroke();
        }
      } else {
        const p = seg(t, 5.0, 7.2);
        c.fillStyle = '#1a0c0a'; c.fillRect(0, 0, W, H);
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a0e0a'); g.addColorStop(1, '#6a2a10');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        drawCineCity(c, city.map(b => Object.assign({}, b, { dead: true })), baseY, '#140605', false);
        if (Math.random() < 0.9) fx.add({ x: rand(0, W), y: -10, vx: rand(-20, 20), vy: rand(30, 70), life: 6, size: rand(2, 4), color: '#bbb' });
        // ember pile forming into Kira
        for (let i = 0; i < 3; i++) fx.add({ x: W / 2 + rand(-60, 60), y: baseY + rand(-10, 10), vx: rand(-10, 10), vy: rand(-200, -80), life: 0.6, size: rand(4, 9), color: pick(['#ffcc33', '#ff7a1a']), glow: true });
        fx.draw(c);
        const rise = ease.out(seg(t, 5.2, 6.2));
        c.globalAlpha = rise;
        drawCharAt(c, f.def, W / 2, baseY + (1 - rise) * 60, 2.4, 1, { pose: 'victory', anim: t, transformed: true, wings: rise * 0.9 });
        c.globalAlpha = 1;
        caption(c, '...and rise again.', t, 5.3, 7.1, '#ffe6b0');
        titleSlam(c, 'SUPERNOVA REBIRTH', 'KIRA RESTORES 25 HP', t, 5.9, '#ff9a1a', 96);
        flashAt(c, t, 5.0, 5.5, '#fff4d0');
      }
    },
  };
}

// ============================================================
//  VEX — VOID FORM transformation
// ============================================================
function csVexTransform(f) {
  const fx = new ParticleSystem();
  const cracks = [];
  for (let i = 0; i < 14; i++) {
    const pts = [[W / 2, H / 2]]; let a = i / 14 * Math.PI * 2 + rand(-0.2, 0.2), x = W / 2, y = H / 2;
    for (let k = 0; k < 9; k++) { a += rand(-0.5, 0.5); x += Math.cos(a) * rand(40, 90); y += Math.sin(a) * rand(40, 90); pts.push([x, y]); }
    cracks.push(pts);
  }
  return {
    name: 'VOID FORM', dur: 4.0, fx,
    cues: [[0, () => Sfx.voidHum()], [1.2, () => { Sfx.slam(); }], [2.3, () => { Sfx.boom(); Sfx.voidHum(); }]],
    draw(c, t) {
      if (t < 2.3) {
        const d = seg(t, 0, 2.2);
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b2733'); g.addColorStop(1, '#4a4452');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.fillStyle = '#1b1a20'; c.fillRect(0, H - 100, W, 100);
        const vx = W / 2, vy = H - 70;
        if (Math.random() < 0.8) fx.add({ x: pick([rand(0, 200), rand(W - 200, W)]), y: rand(0, H), vx: 0, vy: rand(-20, 20), life: 1.5, size: rand(30, 60), color: 'rgba(10,0,20,0.35)', grow: 30 });
        fx.draw(c);
        drawCharAt(c, f.def, vx, vy, 3, 1, { pose: t < 1.2 ? 'idle' : 'charge', anim: t, transformed: false });
        vignette(c, 0.4 + d * 0.6, '8,0,16');
        if (t < 1.2) {
          c.globalAlpha = 0.8; bigText(c, 'heh...', W * 0.72, 180, 38, '#c9a8ff', null); if (t > 0.5) bigText(c, 'heh heh heh...', W * 0.74, 240, 44, '#c9a8ff', null); c.globalAlpha = 1;
        }
        if (t > 1.2) {
          const p = ease.out(seg(t, 1.2, 2.2));
          c.lineCap = 'round';
          for (const pts of cracks) {
            const n = Math.floor(p * (pts.length - 1)) + 1;
            for (const [lw, col] of [[10, 'rgba(180,90,255,0.35)'], [3, '#f0dcff']]) {
              c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
              for (let i = 1; i < n; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke();
            }
          }
        }
        caption(c, 'You think this body is the real me?', t, 0.1, 1.2, '#e2ccff');
      } else {
        c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
        const p = seg(t, 2.3, 2.9);
        c.globalAlpha = seg(t, 2.6, 3.2) * 0.6;
        drawCharAt(c, f.def, W / 2, H + 100, 4, 1, { pose: 'cast', anim: t, transformed: true });
        c.globalAlpha = 1;
        if (t < 3.2) {
          c.globalCompositeOperation = 'lighter';
          glowCircle(c, W / 2, H / 2, 500 * ease.out(p), 'rgba(160,70,255,0.4)', 'rgba(60,0,120,0)');
          c.globalCompositeOperation = 'source-over';
          c.fillStyle = '#0a0010'; c.fillRect(0, 0, W, H * (1 - p) * 0.2);
          drawBigEye(c, t, ease.out(p) * 0.9, ['#f0d0ff', '#8a2be2'], lerp(30, 70, p), false);
        }
        titleSlam(c, 'VOID FORM', 'LIFESTEAL  •  RIFT STEP  •  DAMAGE RESIST', t, 3.0, '#b36bff', 120);
        flashAt(c, t, 2.3, 2.5, '#e9d4ff');
      }
    },
  };
}

// ============================================================
//  VEX — EVENT HORIZON ultimate
// ============================================================
function drawBlackHole(c, x, y, R, t) {
  c.save(); c.translate(x, y);
  c.globalCompositeOperation = 'lighter';
  glowCircle(c, 0, 0, R * 3.2, 'rgba(150,60,255,0.35)', 'rgba(60,0,120,0)');
  for (let i = 0; i < 3; i++) {
    c.save(); c.rotate(-0.25 + i * 0.02); c.scale(1, 0.28);
    c.strokeStyle = ['rgba(255,170,90,0.9)', 'rgba(200,110,255,0.8)', 'rgba(255,240,220,0.9)'][i];
    c.lineWidth = R * (0.35 - i * 0.1);
    c.setLineDash([R * 0.6, R * 0.15]); c.lineDashOffset = -t * 400 * (i + 1);
    c.beginPath(); c.arc(0, 0, R * (1.7 + i * 0.25), 0, Math.PI * 2); c.stroke();
    c.restore();
  }
  c.setLineDash([]);
  c.strokeStyle = 'rgba(255,220,255,0.9)'; c.lineWidth = 4;
  c.beginPath(); c.arc(0, 0, R * 1.08, 0, Math.PI * 2); c.stroke();
  c.globalCompositeOperation = 'source-over';
  circle(c, 0, 0, R, '#000');
  c.restore();
}
function csVexUlt(f, opp) {
  const fx = new ParticleSystem(2500);
  const city = makeCineCity(); const baseY = H - 20;
  const hx = W / 2, hy = 200;
  city.forEach((b, i) => { b.liftAt = 1.8 + Math.random() * 2.2; b.ang = 0; b.rad = 0; b.spin = rand(-4, 4); });
  let last = 0;
  return {
    name: 'EVENT HORIZON', dur: 7.4, fx,
    cues: [[0, () => Sfx.voidHum()], [1.6, () => Sfx.voidHum()], [2.5, () => Sfx.boom()], [3.3, () => Sfx.boom()], [4.2, () => Sfx.voidHum()], [5.4, () => { Sfx.boom(); Sfx.boom(0.2); }]],
    draw(c, t) {
      const dt = Math.max(0, t - last); last = t;
      if (t < 5.4) {
        const d = seg(t, 0, 2);
        const g = c.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, `rgb(${lerp(10, 20, d)},${lerp(10, 2, d)},${lerp(30, 40, d)})`); g.addColorStop(1, `rgb(${lerp(60, 70, d)},${lerp(35, 20, d)},${lerp(80, 110, d)})`);
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        const R = t < 1.6 ? 90 * ease.out(seg(t, 0.3, 1.6)) : lerp(90, 140, seg(t, 1.6, 4.2)) + (t > 4.2 ? Math.sin(t * 30) * 4 : 0);
        const shk = t > 1.6 ? 6 : 0;
        c.save(); c.translate(rand(-shk, shk), rand(-shk, shk));
        if (R > 1) drawBlackHole(c, hx, hy, R, t);
        // uprooted buildings spiral into the hole
        for (const b of city) {
          if (!b.lift && t > b.liftAt) { b.lift = { x: b.x + b.w / 2, y: baseY - b.h / 2 }; const dx = b.lift.x - hx, dy = b.lift.y - hy; b.rad = Math.hypot(dx, dy); b.ang = Math.atan2(dy, dx); fx.burst(b.lift.x, baseY, 10, { color: ['#555', '#777'], size: 10, speed: 200, g: 400, life: 0.8, shape: 'rect' }); }
          if (b.lift && b.rad > 5) {
            b.ang += dt * (1.2 + 180 / Math.max(40, b.rad));
            b.rad = Math.max(0, b.rad - dt * (120 + (700 - b.rad) * 0.6));
            const k = clamp(b.rad / 500, 0.02, 1);
            c.save(); c.translate(hx + Math.cos(b.ang) * b.rad, hy + Math.sin(b.ang) * b.rad * 0.7); c.rotate(b.ang * b.spin * 0.3);
            c.fillStyle = '#1c1a34'; c.fillRect(-b.w * k / 2, -b.h * k / 2, b.w * k, b.h * k);
            c.fillStyle = 'rgba(255,214,120,0.6)'; c.fillRect(-b.w * k / 3, -b.h * k / 3, b.w * k / 6, b.h * k / 6);
            c.restore();
          }
        }
        drawCineCity(c, city, baseY);
        if (t > 1.6) for (let i = 0; i < 4; i++) {
          const a = rand(0, Math.PI * 2), r = rand(250, 700);
          fx.add({ x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r * 0.7, vx: -Math.cos(a) * r * 0.9 + -Math.sin(a) * 200, vy: -Math.sin(a) * r * 0.6 + Math.cos(a) * 140, life: 1, size: rand(2, 6), color: pick(['#b36bff', '#ffb070', '#888']), glow: Math.random() < 0.5 });
        }
        fx.draw(c);
        // the victim gets pulled in and stretched
        if (t > 4.0) {
          const p = ease.in(seg(t, 4.0, 5.2));
          const ox = lerp(W * 0.78, hx, p), oy = lerp(baseY, hy + 20, p);
          const baseS = opp.transformed && opp.def.id === 'eric' ? 0.9 : 1.6;
          silhouette(c, o => { o.save(); o.translate(ox, oy); o.scale(lerp(1, 0.15, p), lerp(1, 3.5, p)); drawCharAt(o, opp.def, 0, 0, baseS, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }); o.restore(); }, '#e9d4ff', 1 - seg(t, 5.0, 5.3));
        } else {
          silhouette(c, o => drawCharAt(o, opp.def, W * 0.78, baseY, opp.transformed && opp.def.id === 'eric' ? 0.9 : 1.6, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#0c0818');
        }
        drawCharAt(c, f.def, W * 0.2, baseY - 120 - Math.sin(t * 2) * 10, 2.2, 1, { pose: 'charge', anim: t, transformed: f.transformed });
        c.restore();
        caption(c, "Do you know what's at the bottom of a black hole?", t, 0.1, 1.9, '#e2ccff');
        caption(c, 'Nothing. Not even you.', t, 2.2, 3.9, '#e2ccff');
        if (t > 4.3) { c.globalAlpha = seg(t, 4.3, 4.5); bigText(c, 'EVENT HORIZON', W / 2, H - 120, 70, '#b36bff'); c.globalAlpha = 1; }
      } else if (t < 5.9) {
        const p = seg(t, 5.4, 5.9);
        c.fillStyle = '#05000a'; c.fillRect(0, 0, W, H);
        const R = 140 * (1 - ease.in(p));
        if (R > 1) drawBlackHole(c, hx, hy, R, t);
        flash(c, p > 0.85 ? (p - 0.85) * 6.6 : 0, '#e9d4ff');
      } else {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0e0618'); g.addColorStop(1, '#2a1640');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.fillStyle = '#120a1c'; c.fillRect(0, baseY - 6, W, H);
        if (Math.random() < 0.6) fx.add({ x: rand(0, W), y: rand(0, H), vx: rand(-10, 10), vy: rand(-20, -5), life: 2, size: rand(1, 3), color: '#b36bff', glow: true });
        fx.draw(c);
        drawCharAt(c, f.def, W / 2, baseY - 60 - Math.sin(t * 2) * 8, 2.6, 1, { pose: 'victory', anim: t, transformed: f.transformed });
        caption(c, 'Everything returns to nothing.', t, 6.0, 7.3, '#e2ccff');
        titleSlam(c, 'EVENT HORIZON', `${opp.def.name} CAUGHT IN THE SINGULARITY`, t, 6.3, '#b36bff', 100);
        flashAt(c, t, 5.9, 6.4, '#e9d4ff');
      }
    },
  };
}

// ============================================================
//  PRE-FIGHT: VS SCREEN
// ============================================================
function csVersus(p1, p2) {
  return {
    name: 'VERSUS', dur: 3.4, fx: new ParticleSystem(),
    cues: [[0.1, () => Sfx.whoosh()], [0.75, () => Sfx.slam()], [2.9, () => Sfx.blast()]],
    draw(c, t) {
      const p = ease.out(seg(t, 0, 0.5));
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      const slant = 120;
      // left panel
      c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(W / 2 + slant, 0); c.lineTo(W / 2 - slant, H); c.lineTo(0, H); c.clip();
      let g = c.createLinearGradient(0, 0, W / 2, H); g.addColorStop(0, p1.def.color2); g.addColorStop(1, '#000');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      speedLines(c, t, W * 0.25, H / 2, 'rgba(255,255,255,0.15)');
      drawCharAt(c, p1.def, lerp(-300, W * 0.26, p), H + 40, 4.4, 1, { pose: 'idle', anim: t, transformed: false });
      c.restore();
      // right panel
      c.save(); c.beginPath(); c.moveTo(W / 2 + slant, 0); c.lineTo(W, 0); c.lineTo(W, H); c.lineTo(W / 2 - slant, H); c.clip();
      g = c.createLinearGradient(W, 0, W / 2, H); g.addColorStop(0, p2.def.color2); g.addColorStop(1, '#000');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      speedLines(c, t, W * 0.75, H / 2, 'rgba(255,255,255,0.15)');
      drawCharAt(c, p2.def, lerp(W + 300, W * 0.74, p), H + 40, 4.4, -1, { pose: 'idle', anim: t, transformed: false });
      c.restore();
      c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.moveTo(W / 2 + slant, 0); c.lineTo(W / 2 - slant, H); c.stroke();
      // names
      bigText(c, p1.def.name, lerp(-200, 60, p), 110, 72, p1.def.color, '#000', 'left');
      smallText(c, `${p1.def.side}  ·  ${p1.def.title}`, lerp(-200, 64, p), 160, 22, '#fff');
      bigText(c, p2.def.name, lerp(W + 200, W - 60, p), H - 170, 72, p2.def.color, '#000', 'right');
      smallText(c, `${p2.def.side}  ·  ${p2.def.title}`, lerp(W + 200, W - 64, p), H - 120, 22, '#fff', 'right');
      if (t > 1.2) { c.globalAlpha = seg(t, 1.2, 1.5); smallText(c, p1.def.quote, 64, 200, 20, '#ddd'); c.globalAlpha = 1; }
      if (t > 1.8) { c.globalAlpha = seg(t, 1.8, 2.1); smallText(c, p2.def.quote, W - 64, H - 84, 20, '#ddd', 'right'); c.globalAlpha = 1; }
      if (t > 0.75) {
        const s = lerp(3, 1, ease.out(seg(t, 0.75, 0.95)));
        c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.rotate(-0.08);
        bigText(c, 'VS', 0, 0, 170, '#fff', '#c01010'); c.restore();
      }
      flashAt(c, t, 0.75, 1.0 - (t < 0.75 ? 1 : 0));
      flash(c, seg(t, 3.0, 3.4), '#000');
    },
  };
}


// ============================================================
//  KAEL — CORE SHATTER (revive transformation)
// ============================================================
function csKaelRevive(f) {
  const fx = new ParticleSystem(2000);
  const shards = [];
  return {
    name: 'CORE SHATTER', dur: 5.4, fx,
    cues: [[0.2, () => Sfx.heartbeat()], [0.9, () => Sfx.heartbeat()], [1.5, () => Sfx.tone(1800, 0.2, 'triangle', 0.1, 900)], [1.8, () => Sfx.tone(1400, 0.2, 'triangle', 0.12, 600)], [2.15, () => { Sfx.boom(); Sfx.slam(); }], [2.9, () => Sfx.roar()], [3.4, () => Sfx.fire()]],
    draw(c, t) {
      if (t < 1.3) {
        // he's down. the core flickers.
        c.fillStyle = '#07080c'; c.fillRect(0, 0, W, H);
        glowCircle(c, W / 2, H - 150, 500, 'rgba(40,60,80,0.35)', 'rgba(0,0,0,0)');
        c.fillStyle = '#101218'; c.fillRect(0, H - 150, W, 150);
        c.save(); c.translate(W / 2 - 150, H - 150); c.rotate(-Math.PI / 2 * 0.97); c.scale(3, 3);
        f.def.draw(c, { pose: 'hurt', anim: 0, transformed: false });
        c.restore();
        const flick = Math.random() < 0.35 ? 0 : 1;
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, W / 2 + 60, H - 175, 60 * flick, 'rgba(60,220,255,0.6)', 'rgba(0,0,0,0)');
        c.globalCompositeOperation = 'source-over';
        vignette(c, 0.9);
        caption(c, '...so this is what dying feels like.', t, 0.1, 1.25, '#bfe9ff');
      } else if (t < 2.25) {
        // extreme close-up: the core cracks
        const p = seg(t, 1.3, 2.1);
        c.fillStyle = '#0b0d12'; c.fillRect(0, 0, W, H);
        c.fillStyle = '#1b222b'; c.fillRect(0, 0, W, H);
        const sh = p * 10; c.save(); c.translate(rand(-sh, sh), rand(-sh, sh));
        drawCore(c, W / 2, H / 2, 170, t, false);
        c.strokeStyle = '#05080a'; c.lineCap = 'round';
        for (let i = 0; i < 9; i++) {
          const a = i * 0.7 + 0.3, len = 190 * Math.min(1, p * 1.3 - i * 0.07);
          if (len <= 0) continue;
          c.lineWidth = 8 - i * 0.5; c.beginPath(); c.moveTo(W / 2, H / 2);
          c.lineTo(W / 2 + Math.cos(a) * len * 0.5 + 10, H / 2 + Math.sin(a) * len * 0.5 - 8); c.lineTo(W / 2 + Math.cos(a) * len, H / 2 + Math.sin(a) * len); c.stroke();
        }
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, W / 2, H / 2, 80 * p, 'rgba(255,60,20,0.9)', 'rgba(255,0,0,0)');
        c.globalCompositeOperation = 'source-over';
        c.restore();
        if (t > 1.5) bigText(c, 'CRACK', W * 0.22, 180, 60, '#bfe9ff');
        if (t > 1.8) bigText(c, 'CRACK', W * 0.78, H - 180, 70, '#ff7a5a');
      } else {
        // shatter → the demon rises out of the fire
        if (!shards.length) for (let i = 0; i < 40; i++) {
          const a = rand(0, Math.PI * 2), sp = rand(300, 1200);
          shards.push({ x: W / 2, y: H / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rand(0, 6), s: rand(10, 40) });
        }
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#120000'); g.addColorStop(1, '#5a0a02');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 6; i++) fx.add({ x: rand(0, W), y: H, vx: rand(-20, 20), vy: rand(-500, -200), life: rand(0.6, 1.2), size: rand(12, 30), color: pick(['#ff3b1a', '#ff8a1a', '#7a0000']), glow: true, grow: -10 });
        fx.draw(c);
        const rise = ease.out(seg(t, 2.5, 3.6));
        const sh = t < 3.6 ? 8 : 0; c.save(); c.translate(rand(-sh, sh), rand(-sh, sh));
        silhouette(c, o => drawCharAt(o, f.def, W / 2, H + 40 + (1 - rise) * 380, 4.2, 1, { pose: t < 3.2 ? 'charge' : 'victory', anim: t, transformed: true }), '#0a0000', 1);
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, W / 2 + 6 * 4.2, H + 40 + (1 - rise) * 380 - 101 * 4.2, 40, 'rgba(255,90,20,1)', 'rgba(255,0,0,0)');
        glowCircle(c, W / 2 + 4, H + 40 + (1 - rise) * 380 - 78 * 4.2, 50, 'rgba(255,60,20,0.9)', 'rgba(255,0,0,0)');
        c.globalCompositeOperation = 'source-over';
        c.restore();
        // core shards flying at the camera
        const dt = t - 2.25;
        for (const s of shards) {
          const x = s.x + s.vx * dt, y = s.y + s.vy * dt + 300 * dt * dt;
          c.save(); c.translate(x, y); c.rotate(s.r + dt * 6); c.fillStyle = 'rgba(190,246,255,0.9)';
          c.beginPath(); c.moveTo(0, -s.s); c.lineTo(s.s * 0.4, 0); c.lineTo(0, s.s * 0.6); c.lineTo(-s.s * 0.3, 0); c.fill(); c.restore();
        }
        caption(c, 'It was never keeping me alive. It was keeping THIS in.', t, 3.0, 4.2, '#ffb09a');
        titleSlam(c, 'CORE SHATTERED', 'DEMON FORM  •  REVIVED WITH 60 HP  •  ULTIMATE UNLOCKED', t, 4.2, '#ff4a2a', 110);
        flashAt(c, t, 2.25, 2.6, '#ffffff');
      }
    },
  };
}

// ============================================================
//  KAEL — HELLFIRE BARRAGE ultimate
// ============================================================
function csKaelUlt(f, opp) {
  const fx = new ParticleSystem(3000);
  const city = makeCineCity(); const baseY = H - 20;
  const portals = Array.from({ length: 11 }, (_, i) => ({ x: 80 + i * 112 + rand(-20, 20), y: rand(90, 220), at: 0.5 + i * 0.08 }));
  const meteors = []; let spawned = 0, last = 0;
  const target = W * 0.7;
  return {
    name: 'HELLFIRE BARRAGE', dur: 7.0, fx,
    cues: [[0, () => Sfx.roar()], [0.5, () => Sfx.charge(1.2)], [1.6, () => Sfx.fire()], [4.3, () => Sfx.charge(0.5)], [4.8, () => { Sfx.boom(); Sfx.boom(0.2); }]],
    draw(c, t) {
      const dt = Math.max(0, t - last); last = t;
      if (t < 4.9) {
        const red = seg(t, 0, 1.4);
        const g = c.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, `rgb(${lerp(8, 60, red)},${lerp(8, 4, red)},${lerp(24, 4, red)})`); g.addColorStop(1, `rgb(${lerp(50, 160, red)},${lerp(30, 30, red)},${lerp(70, 10, red)})`);
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        const shk = t > 1.6 ? 7 : 0; c.save(); c.translate(rand(-shk, shk), rand(-shk, shk));
        // portals of hell tear open across the sky
        for (const p of portals) {
          const k = ease.back(seg(t, p.at, p.at + 0.3)); if (k <= 0) continue;
          c.save(); c.translate(p.x, p.y); c.scale(k, k * 0.45);
          c.globalCompositeOperation = 'lighter';
          glowCircle(c, 0, 0, 70, 'rgba(255,60,20,0.7)', 'rgba(255,0,0,0)');
          c.globalCompositeOperation = 'source-over';
          circle(c, 0, 0, 36, '#1a0000');
          c.strokeStyle = '#ff5a1a'; c.lineWidth = 4; c.setLineDash([10, 8]); c.lineDashOffset = t * 60;
          c.beginPath(); c.arc(0, 0, 44, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
          c.restore();
        }
        // meteors
        if (t > 1.6 && t < 4.2) {
          while (spawned < (t - 1.6) * 22) {
            const p = pick(portals);
            meteors.push({ x: p.x, y: p.y, tx: rand(60, W - 60), ty: baseY - rand(0, 160), t: 0, dur: rand(0.45, 0.7), big: false });
            spawned++;
          }
        }
        if (t > 4.2 && !meteors.some(m => m.big)) meteors.push({ x: W / 2, y: -150, tx: target, ty: baseY - 60, t: 0, dur: 0.6, big: true });
        for (const m of meteors) {
          if (m.done) continue;
          m.t += dt; const p = Math.min(1, m.t / m.dur);
          const x = lerp(m.x, m.tx, p), y = lerp(m.y, m.ty, p * p);
          const r = m.big ? 70 : 12;
          for (let i = 0; i < (m.big ? 6 : 1); i++) fx.add({ x: x + rand(-r / 2, r / 2), y: y + rand(-r / 2, r / 2), vx: rand(-30, 30), vy: rand(-60, 0), life: m.big ? 0.6 : 0.35, size: r * rand(0.5, 1), color: pick(['#ff3b1a', '#ff8a1a', '#ffd08a']), glow: true, grow: -r });
          c.globalCompositeOperation = 'lighter'; glowCircle(c, x, y, r * 2, 'rgba(255,200,120,1)', 'rgba(255,40,0,0)'); c.globalCompositeOperation = 'source-over';
          if (p >= 1) {
            m.done = true;
            fx.burst(m.tx, m.ty, m.big ? 120 : 16, { color: ['#ff3b1a', '#ff8a1a', '#ffe28a'], size: m.big ? 30 : 14, speed: m.big ? 900 : 320, glow: true, life: 0.8 });
            for (const b of city) if (!b.dead && Math.abs(b.x + b.w / 2 - m.tx) < (m.big ? 400 : b.w * 0.6)) b.dead = true;
            if (!m.big && Math.random() < 0.3) Sfx.boom();
          }
        }
        drawCineCity(c, city, baseY);
        silhouette(c, o => drawCharAt(o, opp.def, target, baseY, opp.transformed && opp.def.id === 'eric' ? 0.9 : 1.6, -1, { pose: t > 2.5 ? 'hurt' : 'block', anim: t, transformed: opp.transformed }), '#140404');
        fx.draw(c);
        drawCharAt(c, f.def, W * 0.2, baseY - 150 - Math.sin(t * 2) * 10, 2.4, 1, { pose: t < 1.6 ? 'charge' : 'cast', anim: t, transformed: true });
        c.restore();
        caption(c, 'You killed me once. Now you get to meet what I really am.', t, 0.1, 1.6, '#ffb09a');
        if (t > 1.8 && t < 4.2) { c.globalAlpha = seg(t, 1.8, 2.0); bigText(c, 'HELLFIRE', W / 2, 330, 90, '#ff5a1a', '#1a0000'); c.globalAlpha = 1; }
        if (t > 2.6 && t < 4.2) { c.globalAlpha = seg(t, 2.6, 2.8); bigText(c, 'BARRAGE!!', W / 2, 420, 100, '#ffd08a', '#1a0000'); c.globalAlpha = 1; }
      } else {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0202'); g.addColorStop(1, '#7a1a04');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        drawCineCity(c, city.map(b => Object.assign({}, b, { dead: true })), baseY, '#140303', false);
        if (Math.random() < 0.9) fx.add({ x: rand(0, W), y: baseY - rand(0, 60), vx: rand(-10, 30), vy: rand(-60, -20), life: rand(2, 3), size: rand(14, 30), color: 'rgba(30,10,10,0.5)', grow: 14 });
        for (let i = 0; i < 2; i++) fx.add({ x: rand(0, W), y: baseY - rand(0, 80), vx: rand(-10, 10), vy: rand(-120, -40), life: 0.7, size: rand(5, 10), color: pick(['#ff3b1a', '#ff8a1a']), glow: true, grow: -6 });
        fx.draw(c);
        silhouette(c, o => drawCharAt(o, f.def, W / 2, baseY - 20, 2.8, 1, { pose: 'victory', anim: t, transformed: true }), '#0a0000');
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, W / 2 + 6 * 2.8, baseY - 20 - 101 * 2.8, 26, 'rgba(255,90,20,1)', 'rgba(255,0,0,0)');
        c.globalCompositeOperation = 'source-over';
        titleSlam(c, 'HELLFIRE BARRAGE', `${opp.def.name} BURIED IN HELLFIRE`, t, 5.1, '#ff4a2a', 100);
        flashAt(c, t, 4.9, 5.5, '#ffd08a');
      }
    },
  };
}

const Cutscenes = {
  transform(f) { return { eric: csEricTransform, kira: csKiraTransform, vex: csVexTransform, kael: csKaelRevive }[f.id](f); },
  ult(f, opp) { return { eric: csEricUlt, kira: csKiraUlt, vex: csVexUlt, kael: csKaelUlt }[f.id](f, opp); },
  versus: csVersus,
};
