// ============================================================
//  MOONKAI — templated cinematics for the expanded roster
//  Transformation: 'ascend' with an elemental burst.
//  Ultimates: storm · freeze · rush · grab · orbital · quake
// ============================================================
function oppSil(c, opp, x, y, s, pose, color, t, alpha = 1) {
  silhouette(c, o => drawCharAt(o, opp.def, x, y, s, x > W / 2 ? -1 : 1, { pose, anim: t, transformed: opp.form }), color, alpha);
}
function skyGrad(c, cols) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, cols[0]); g.addColorStop(0.6, cols[1]); g.addColorStop(1, cols[2]);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function drawElement(c, el, t, cx, cy, k, color) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const n = 14;
  switch (el) {
    case 'bolt':
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 + Math.floor(t * 12) * 0.3;
        c.strokeStyle = hexA(color, 0.8 * k); c.lineWidth = 3; c.beginPath(); c.moveTo(cx, cy);
        let x = cx, y = cy; for (let s = 0; s < 8; s++) { x += Math.cos(a) * 60 * k + rand(-20, 20); y += Math.sin(a) * 60 * k + rand(-20, 20); c.lineTo(x, y); } c.stroke();
      } break;
    case 'ice': case 'time':
      c.globalCompositeOperation = 'source-over';
      if (el === 'time') {
        c.strokeStyle = hexA(color, 0.9); c.lineWidth = 8; c.beginPath(); c.arc(cx, cy, 260 * k, 0, Math.PI * 2); c.stroke();
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.lineWidth = i % 3 ? 3 : 7; c.beginPath(); c.moveTo(cx + Math.cos(a) * 230 * k, cy + Math.sin(a) * 230 * k); c.lineTo(cx + Math.cos(a) * 255 * k, cy + Math.sin(a) * 255 * k); c.stroke(); }
        c.lineWidth = 10; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(t * 9) * 200 * k, cy + Math.sin(t * 9) * 200 * k); c.stroke();
        c.lineWidth = 14; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(t * 1.5) * 130 * k, cy + Math.sin(t * 1.5) * 130 * k); c.stroke();
      } else {
        for (let i = 0; i < n; i++) {
          const a = i / n * Math.PI * 2, L = 320 * k * (0.6 + (i % 3) * 0.2);
          c.fillStyle = 'rgba(210,245,255,0.8)'; c.strokeStyle = '#fff'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(cx + Math.cos(a - 0.08) * 40, cy + Math.sin(a - 0.08) * 40); c.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); c.lineTo(cx + Math.cos(a + 0.08) * 40, cy + Math.sin(a + 0.08) * 40); c.fill(); c.stroke();
        }
      } break;
    case 'metal':
      c.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.3, d = 400 * (1 - k) + 60; c.save(); c.translate(cx + Math.cos(a) * d, cy + Math.sin(a) * d); c.rotate(a); c.fillStyle = i % 2 ? '#8a95a4' : '#6a7584'; c.fillRect(-30, -18, 60, 36); c.strokeStyle = '#e0a020'; c.lineWidth = 3; c.strokeRect(-30, -18, 60, 36); c.restore(); }
      glowCircle(c, cx, cy, 200 * k, hexA(color, 0.5)); break;
    case 'shadow': case 'blood':
      c.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * Math.PI * 2, r0 = 700, r1 = lerp(700, 120, k);
        c.strokeStyle = el === 'blood' ? 'rgba(120,0,0,0.85)' : 'rgba(10,0,16,0.9)'; c.lineWidth = 16 - (i % 3) * 4;
        c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        c.quadraticCurveTo(cx + Math.cos(a + 0.4) * (r0 + r1) / 2, cy + Math.sin(a + 0.4) * (r0 + r1) / 2, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.stroke();
      }
      c.globalCompositeOperation = 'lighter'; glowCircle(c, cx, cy, 150 * k, hexA(color, 0.7)); break;
    case 'tech':
      c.strokeStyle = hexA(color, 0.8); c.lineWidth = 2;
      for (let i = 1; i <= 4; i++) { c.setLineDash([20, 10]); c.lineDashOffset = t * 100 * (i % 2 ? 1 : -1); c.beginPath(); c.arc(cx, cy, i * 70 * k, 0, Math.PI * 2); c.stroke(); }
      c.setLineDash([]);
      for (let y = 0; y < H; y += 6) { c.fillStyle = hexA(color, 0.04); c.fillRect(0, y, W, 2); }
      c.font = '20px monospace'; c.fillStyle = hexA(color, 0.9); c.textAlign = 'left';
      ['> POWER CELLS ....... OK', '> SERVO ARRAY ....... OK', '> WEAPON SYSTEMS .... ARMED'].forEach((s, i) => { if (k > i * 0.3) c.fillText(s, 80, 140 + i * 30); });
      break;
    case 'light':
      c.save(); c.translate(cx, cy); c.rotate(t * 0.6);
      for (let i = 0; i < 16; i++) { c.rotate(Math.PI / 8); c.fillStyle = hexA(color, 0.18 * k); c.beginPath(); c.moveTo(-20, 0); c.lineTo(0, 800); c.lineTo(20, 0); c.fill(); }
      c.restore(); glowCircle(c, cx, cy, 240 * k, hexA('#ffffff', 0.7)); break;
    case 'rock':
      c.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 16; i++) { const x = (i / 16) * W + 30, h = 300 * k * (0.5 + ((i * 7) % 5) / 8); c.fillStyle = i % 2 ? '#5a4a3a' : '#6b5a48'; c.beginPath(); c.moveTo(x - 40, H); c.lineTo(x, H - h); c.lineTo(x + 40, H); c.fill(); }
      c.globalCompositeOperation = 'lighter'; glowCircle(c, cx, H, 300 * k, hexA(color, 0.5)); break;
    case 'anvil':
      c.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * 2, r = 220 * k; c.save(); c.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); c.rotate(a + t * 4); c.fillStyle = '#fff'; c.fillRect(-14, -20, 28, 40); c.fillStyle = i % 2 ? '#d22' : '#222'; c.font = '20px serif'; c.textAlign = 'center'; c.fillText(['♠', '♥', '♦', '♣'][i % 4], 0, 7); c.restore(); }
      glowCircle(c, cx, cy, 160 * k, hexA(color, 0.5)); break;
  }
  c.restore();
}

// ---------------- transformation ----------------
function csAscend(f) {
  const d = f.def, el = (d.ult.fx && d.ult.fx.el) || 'light', col = d.color;
  const fx = new ParticleSystem();
  return {
    name: d.form.name, dur: 3.8, fx,
    cues: [[0, () => Sfx.charge(1.2)], [1.3, () => { Sfx.boom(); el === 'bolt' ? Sfx.zap() : el === 'ice' ? Sfx.ice() : el === 'time' ? Sfx.bell() : el === 'metal' ? Sfx.clang() : Sfx.slam(); }], [2.3, () => Sfx.roar()]],
    draw(c, t) {
      const sky = d.ult.fx ? d.ult.fx.sky : ['#000', '#111', '#222'];
      skyGrad(c, sky);
      if (t < 1.3) {
        for (let i = 0; i < 3; i++) converge(fx, W / 2, H - 260, col, 1, 420);
        fx.draw(c);
        glowCircle(c, W / 2, H - 250, 260 * seg(t, 0, 1.3), hexA(col, 0.35), hexA(col, 0));
        drawCharAt(c, d, W / 2, H - 30, 2.8, 1, { pose: t < 0.6 ? 'kneel' : 'charge', anim: t, transformed: false });
        vignette(c, 0.7);
        caption(c, d.quote.replace(/"/g, ''), t, 0.05, 1.25);
      } else if (t < 2.3) {
        const k = ease.out(seg(t, 1.3, 2.1));
        c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
        drawElement(c, el, t, W / 2, H / 2, k, col);
        silhouette(c, o => drawCharAt(o, d, W / 2, H / 2 + 150, lerp(1.5, 2.6, k), 1, { pose: 'charge', anim: t, transformed: t > 1.9 }), '#000', 1);
        c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2, H / 2 - 80, 120 * k, hexA(col, 0.6)); c.globalCompositeOperation = 'source-over';
        flashAt(c, t, 1.3, 1.5, col);
      } else {
        drawElement(c, el, t, W / 2, H / 2 - 40, 0.6, col);
        glowCircle(c, W / 2, H - 200, 380, hexA(col, 0.35), hexA(col, 0));
        const sc = d.form.model && d.form.model.body ? 2.1 : 2.9;
        drawCharAt(c, d, W / 2, H - 20, sc, 1, { pose: 'victory', anim: t, transformed: true });
        speedLines(c, t, W / 2, H / 2, hexA(col, 0.4));
        titleSlam(c, d.form.name, d.form.desc.toUpperCase(), t, 2.6, col, 100);
        flashAt(c, t, 2.3, 2.6);
      }
    },
  };
}

// ---------------- ultimates ----------------
function ultIntro(c, t, f, U, a, b) {
  skyGrad(c, U.fx.sky);
  const k = seg(t, a, b);
  glowCircle(c, W / 2, H - 200, 420 * k, hexA(U.fx.color, 0.3), hexA(U.fx.color, 0));
  drawCharAt(c, f.def, W / 2, H - 20 - (f.form && f.def.form.flight ? 60 : 0), f.form && f.def.form.model && f.def.form.model.body ? 2.1 : 2.8, 1, { pose: 'charge', anim: t, transformed: f.form });
  speedLines(c, t, W / 2, H / 2 - 60, hexA(U.fx.color, 0.35 * k));
  caption(c, U.fx.lines[0], t, a + 0.05, b - 0.05);
}
function ultOutro(c, t, f, opp, U, a, fx, city, baseY) {
  skyGrad(c, [shadeHex(U.fx.sky[0], -0.3), U.fx.sky[0], U.fx.sky[1]]);
  drawCineCity(c, city.map(b => Object.assign({}, b, { dead: true })), baseY, '#0a0808', false);
  if (Math.random() < 0.9) fx.add({ x: rand(0, W), y: baseY - rand(0, 60), vx: rand(-10, 30), vy: rand(-60, -20), life: rand(2, 3), size: rand(14, 30), color: 'rgba(30,20,20,0.45)', grow: 14 });
  fx.draw(c);
  silhouette(c, o => drawCharAt(o, f.def, W / 2, baseY - 10, 2.6, 1, { pose: 'victory', anim: t, transformed: f.form }), '#050308');
  titleSlam(c, U.name, `${opp.def.name} TAKES THE FULL FORCE`, t, a + 0.2, U.fx.color, U.name.length > 16 ? 80 : 100);
  flashAt(c, t, a, a + 0.25, U.fx.color);
}

const UltTemplates = {
  // Many strikes from the sky (lightning / light pillars / anvils)
  storm(f, opp, U) {
    const fx = new ParticleSystem(2500), city = makeCineCity(), baseY = H - 20, el = U.fx.el, col = U.fx.color;
    const strikes = Array.from({ length: 14 }, (_, i) => ({ at: 1.8 + i * 0.17, x: i % 3 === 2 ? W * 0.65 : rand(60, W - 60), done: false }));
    let roll = null;
    return {
      name: U.name, dur: 7, fx,
      cues: [[0, () => Sfx.charge(1.6)], [1.6, () => Sfx.boom()], [4.9, () => Sfx.boom()]],
      draw(c, t) {
        if (t < 1.7) {
          ultIntro(c, t, f, U, 0, 1.7);
          if (el === 'anvil' && t > 0.5) {
            if (!roll) roll = [0, 0, 0];
            const syms = ['🔔', '🍒', '⚓', '7', '🐔'];
            c.fillStyle = 'rgba(0,0,0,0.7)'; roundRect(c, W / 2 - 190, 90, 380, 110, 16); c.fill();
            for (let i = 0; i < 3; i++) { const stop = t > 0.9 + i * 0.25; bigText(c, stop ? '⚓' : syms[Math.floor(t * 30 + i * 2) % 5], W / 2 - 120 + i * 120, 145, 64, '#fff', null); if (stop && !roll[i]) { roll[i] = 1; Sfx.tick(); } }
          }
        } else if (t < 4.9) {
          skyGrad(c, [shadeHex(U.fx.sky[0], -0.2), U.fx.sky[1], U.fx.sky[2]]);
          const shk = 7; c.save(); c.translate(rand(-shk, shk), rand(-shk, shk));
          for (const s of strikes) {
            if (t >= s.at && !s.done) {
              s.done = true;
              fx.burst(s.x, baseY - 40, 30, { color: [col, '#fff', '#ffe28a'], size: 14, speed: 420, glow: true, life: 0.7 });
              for (const b of city) if (!b.dead && Math.abs(b.x + b.w / 2 - s.x) < b.w * 0.7) b.dead = true;
              el === 'bolt' ? Sfx.zap() : el === 'anvil' ? Sfx.clang() : Sfx.heal();
            }
          }
          drawCineCity(c, city, baseY);
          oppSil(c, opp, W * 0.65, baseY, 1.6, t > 2.6 ? 'hurt' : 'block', '#0a0610', t);
          c.globalCompositeOperation = 'lighter';
          for (const s of strikes) {
            const k = 1 - seg(t, s.at, s.at + 0.3); if (t < s.at - 0.25 || k <= 0) continue;
            if (t < s.at) { c.fillStyle = hexA(col, 0.15); c.fillRect(s.x - 4, 0, 8, baseY); continue; }
            if (el === 'bolt') { c.strokeStyle = hexA(col, k); c.lineWidth = 8; c.beginPath(); let x = s.x; c.moveTo(x, 0); for (let y = 0; y < baseY; y += 50) { x = s.x + rand(-26, 26); c.lineTo(x, y); } c.lineTo(s.x, baseY); c.stroke(); c.strokeStyle = `rgba(255,255,255,${k})`; c.lineWidth = 3; c.stroke(); }
            else if (el === 'light') { const g = c.createLinearGradient(s.x - 50, 0, s.x + 50, 0); g.addColorStop(0, hexA(col, 0)); g.addColorStop(0.5, hexA('#ffffff', k)); g.addColorStop(1, hexA(col, 0)); c.fillStyle = g; c.fillRect(s.x - 50, 0, 100, baseY); }
            else { c.globalCompositeOperation = 'source-over'; const y = lerp(-100, baseY - 60, Math.min(1, (t - s.at + 0.3) * 4)); c.fillStyle = '#2a2a2a'; c.fillRect(s.x - 55, y, 110, 30); c.fillRect(s.x - 28, y + 30, 56, 24); c.fillRect(s.x - 44, y + 52, 88, 12); c.fillStyle = '#fff'; c.font = 'bold 16px sans-serif'; c.textAlign = 'center'; c.fillText('1000 T', s.x, y + 20); c.globalCompositeOperation = 'lighter'; }
          }
          c.globalCompositeOperation = 'source-over';
          fx.draw(c);
          if (el === 'light') { c.strokeStyle = hexA(col, 0.9); c.lineWidth = 10; c.beginPath(); c.ellipse(W / 2, 90, 380, 40, 0, 0, Math.PI * 2); c.stroke(); }
          c.restore();
          caption(c, U.fx.lines[1], t, 1.9, 3.6);
          if (t > 3.7) { c.globalAlpha = seg(t, 3.7, 3.9); bigText(c, U.name, W / 2, 160, 70, col); c.globalAlpha = 1; }
        } else ultOutro(c, t, f, opp, U, 4.9, fx, city, baseY);
      },
    };
  },
  // Freeze the world (ice / time), afterimage strikes, then it all resumes at once
  freeze(f, opp, U) {
    const fx = new ParticleSystem(2500), el = U.fx.el, col = U.fx.color;
    const slashes = Array.from({ length: 12 }, (_, i) => ({ at: 1.9 + i * 0.12, a: rand(0, Math.PI), r: rand(20, 90), x: rand(-60, 60), y: rand(-160, -20) }));
    return {
      name: U.name, dur: 7, fx,
      cues: [[0, () => Sfx.charge(1.4)], [1.5, () => el === 'time' ? Sfx.bell() : Sfx.ice()], ...slashes.map(s => [s.at, () => Sfx.slash()]), [3.8, () => { Sfx.boom(); Sfx.boom(0.15); el === 'ice' ? Sfx.ice() : Sfx.bell(); }]],
      draw(c, t) {
        if (t < 1.5) ultIntro(c, t, f, U, 0, 1.5);
        else if (t < 4.6) {
          const frozen = t < 3.8;
          skyGrad(c, frozen ? ['#1a1e24', '#3a4048', '#5a6068'] : U.fx.sky);
          const ox = W * 0.62, oy = H - 60;
          if (el === 'time' && frozen) { c.globalAlpha = 0.35; drawElement(c, 'time', t * (t < 1.9 ? 1 : 0.02), W / 2, H / 2, 1, col); c.globalAlpha = 1; }
          oppSil(c, opp, ox, oy, 2, 'hurt', frozen ? '#6a7078' : '#0a0a10', t);
          if (el === 'ice') {
            const k = ease.out(seg(t, 1.5, 1.9));
            if (frozen) { c.fillStyle = 'rgba(190,240,255,0.55)'; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(ox - 130 * k, oy); c.lineTo(ox - 90 * k, oy - 300 * k); c.lineTo(ox + 10, oy - 360 * k); c.lineTo(ox + 110 * k, oy - 280 * k); c.lineTo(ox + 140 * k, oy); c.closePath(); c.fill(); c.stroke(); }
            c.fillStyle = 'rgba(220,250,255,0.35)'; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(i * 180, 0); c.lineTo(i * 180 + 80, 0); c.lineTo(i * 180 + 40, 120 * k); c.fill(); }
          }
          // afterimages + frozen slash marks
          for (const s of slashes) {
            if (t < s.at) continue;
            const x = ox + s.x, y = oy + s.y;
            c.strokeStyle = frozen ? hexA(col, 0.9) : '#fff'; c.lineWidth = frozen ? 4 : 8;
            c.beginPath(); c.moveTo(x - Math.cos(s.a) * s.r, y - Math.sin(s.a) * s.r); c.lineTo(x + Math.cos(s.a) * s.r, y + Math.sin(s.a) * s.r); c.stroke();
            if (t < s.at + 0.15) { c.globalAlpha = 0.6; drawCharAt(c, f.def, x - 80 * Math.cos(s.a), oy, 1.8, Math.cos(s.a) > 0 ? 1 : -1, { pose: pick(['punch', 'kick', 'dash']), anim: t, transformed: f.form }); c.globalAlpha = 1; }
          }
          if (frozen) drawCharAt(c, f.def, W * 0.25, H - 60, 2, 1, { pose: t > 3.3 ? 'victory' : 'dash', anim: 0, transformed: f.form });
          if (!frozen) { if (t < 3.9) for (let i = 0; i < 80; i++) fx.add({ x: ox + rand(-100, 100), y: oy - rand(0, 300), vx: rand(-700, 700), vy: rand(-700, 300), life: 1, size: rand(4, 12), color: pick([col, '#fff']), glow: true, shape: el === 'ice' ? 'rect' : 'circle' }); fx.draw(c); Game.shake = 0; }
          if (t > 3.3 && frozen) { c.globalAlpha = seg(t, 3.3, 3.5); bigText(c, el === 'time' ? '...and time resumes.' : '...shatter.', W / 2, 140, 50, '#fff'); c.globalAlpha = 1; }
          caption(c, U.fx.lines[1], t, 1.6, 3.2);
          if (!frozen) flashAt(c, t, 3.8, 4.1, col);
        } else ultOutro(c, t, f, opp, U, 4.6, fx, makeCineCity.cache || (makeCineCity.cache = makeCineCity()), H - 20);
      },
    };
  },
  // A flurry of slashes (shadow lotus / crimson whirlwind)
  rush(f, opp, U) {
    const fx = new ParticleSystem(2500), col = U.fx.color, el = U.fx.el;
    const cuts = Array.from({ length: 16 }, (_, i) => ({ at: 1.4 + i * 0.13, a: el === 'shadow' ? i / 16 * Math.PI * 2 : rand(0, Math.PI * 2), r: rand(120, 240) }));
    return {
      name: U.name, dur: 6.8, fx,
      cues: [[0, () => Sfx.charge(1)], ...cuts.map(s => [s.at, () => Sfx.slash()]), [3.9, () => { Sfx.boom(); Sfx.slam(); }]],
      draw(c, t) {
        if (t < 1.3) {
          c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
          drawCharAt(c, f.def, W / 2 - 60, H + 380, 7, 1, { pose: 'idle', anim: 0, transformed: f.form });
          c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2 + 60, H / 2 - 30, 60 + Math.sin(t * 30) * 10, hexA(col, 1)); c.globalCompositeOperation = 'source-over';
          c.fillStyle = '#000'; c.fillRect(0, 0, W, H / 2 - 90); c.fillRect(0, H / 2 + 40, W, H);
          caption(c, U.fx.lines[0], t, 0.05, 1.25);
        } else if (t < 4.2) {
          skyGrad(c, U.fx.sky);
          const cx = W / 2, cy = H / 2 + 40;
          oppSil(c, opp, cx, H - 40, 2.2, 'hurt', '#050005', t);
          for (const s of cuts) {
            if (t < s.at) continue;
            const k = 1 - seg(t, s.at, s.at + 0.35);
            c.strokeStyle = t > 3.9 ? '#fff' : hexA(col, 0.4 + k * 0.6); c.lineWidth = 3 + k * 8; c.lineCap = 'round';
            c.beginPath(); c.moveTo(cx - Math.cos(s.a) * s.r, cy - Math.sin(s.a) * s.r); c.lineTo(cx + Math.cos(s.a) * s.r, cy + Math.sin(s.a) * s.r); c.stroke();
            if (k > 0.6) { c.globalAlpha = 0.7; drawCharAt(c, f.def, cx + Math.cos(s.a) * s.r, cy + 140, 1.6, Math.cos(s.a) > 0 ? -1 : 1, { pose: 'dash', anim: t, transformed: f.form }); c.globalAlpha = 1; fx.burst(cx + rand(-40, 40), cy + rand(-60, 60), 3, { color: el === 'blood' ? ['#a00', '#f22'] : [col, '#fff'], size: 6, speed: 300, life: 0.4, glow: el !== 'blood' }); }
          }
          if (el === 'blood') { c.strokeStyle = hexA(col, 0.3); c.lineWidth = 20; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(cx, cy, 150 + i * 40, t * 8 + i, t * 8 + i + 2.5); c.stroke(); } }
          fx.draw(c);
          caption(c, U.fx.lines[1], t, 1.5, 3.5);
          if (t > 3.5 && t < 3.9) { drawCharAt(c, f.def, W * 0.85, H - 40, 2.2, -1, { pose: 'idle', anim: 0, transformed: f.form }); bigText(c, '*click*', W * 0.85, H - 330, 30, '#fff'); }
          flashAt(c, t, 3.9, 4.2, col);
        } else ultOutro(c, t, f, opp, U, 4.2, fx, makeCineCity(), H - 20);
      },
    };
  },
  // Titan: grab, leap to orbit, re-entry piledriver
  grab(f, opp, U) {
    const fx = new ParticleSystem(2500), col = U.fx.color;
    return {
      name: U.name, dur: 7.2, fx,
      cues: [[0.4, () => Sfx.clang()], [1.2, () => Sfx.boom()], [3.2, () => Sfx.fire()], [4.6, () => { Sfx.boom(); Sfx.boom(0.2); Sfx.rock(0.1); }]],
      draw(c, t) {
        if (t < 1.2) {
          City.drawSky(c, t, {}); City.drawFar(c); c.fillStyle = '#2a2a33'; c.fillRect(0, H - 100, W, 100);
          const p = ease.out(seg(t, 0, 0.45));
          drawCharAt(c, opp.def, W * 0.62, H - 100, 2, -1, { pose: t > 0.45 ? 'hurt' : 'idle', anim: t, transformed: opp.form });
          drawCharAt(c, f.def, lerp(W * 0.1, W * 0.45, p), H - 100, 2, 1, { pose: t > 0.45 ? 'charge' : 'run', anim: t, transformed: f.form });
          caption(c, U.fx.lines[0], t, 0.4, 1.15);
        } else if (t < 3.2) {
          const p = seg(t, 1.2, 3.2);
          skyGrad(c, [lerp(0, 1, p) > 0.5 ? '#000' : '#0a1a3a', lerp(0, 1, p) > 0.6 ? '#050510' : '#2a4a8a', '#6a8aca']);
          if (p > 0.5) { for (const [x, y, r] of City.stars) { c.fillStyle = '#fff'; c.fillRect(x, y, r, r); } c.fillStyle = '#2a6ad8'; c.beginPath(); c.arc(W / 2, H + 1400 - p * 300, 1600, 0, Math.PI * 2); c.fill(); glowCircle(c, W / 2, H - 120, 600, 'rgba(120,180,255,0.3)', 'rgba(0,0,0,0)'); }
          for (let i = 0; i < 6; i++) fx.add({ x: W / 2 + rand(-40, 40), y: H / 2 + 120, vx: rand(-30, 30), vy: rand(300, 600), life: 0.5, size: rand(4, 10), color: 'rgba(255,255,255,0.6)' });
          fx.draw(c);
          drawCharAt(c, f.def, W / 2, H / 2 + 160, 1.8, 1, { pose: 'charge', anim: t, transformed: f.form });
          drawCharAt(c, opp.def, W / 2 + 10, H / 2 - 30, 1.6, -1, { pose: 'hurt', anim: t, transformed: opp.form });
          caption(c, U.fx.lines[1], t, 1.4, 2.8);
          if (t > 2.6) { c.globalAlpha = seg(t, 2.6, 2.8); bigText(c, 'METEOR...', W / 2, 120, 80, col); c.globalAlpha = 1; }
        } else if (t < 4.6) {
          const p = seg(t, 3.2, 4.6);
          skyGrad(c, ['#1a0a0a', '#6a2a1a', '#ffa050']);
          c.save(); c.translate(W / 2, lerp(-100, H - 150, ease.in(p))); c.rotate(Math.PI);
          drawCharAt(c, opp.def, 0, -40, 1.6, 1, { pose: 'hurt', anim: t, transformed: opp.form });
          c.restore();
          drawCharAt(c, f.def, W / 2, lerp(-100, H - 150, ease.in(p)) - 20, 1.8, 1, { pose: 'slam', anim: t, transformed: f.form });
          for (let i = 0; i < 10; i++) fx.add({ x: W / 2 + rand(-60, 60), y: lerp(-100, H - 150, ease.in(p)) + 150, vx: rand(-80, 80), vy: rand(-600, -300), life: 0.5, size: rand(10, 24), color: pick(['#ff8a1a', '#ffcc33', '#fff']), glow: true, grow: -20 });
          fx.draw(c);
          bigText(c, 'SUPLEX!!', W / 2, 120, 90, '#fff', col);
        } else {
          const p = seg(t, 4.6, 5.4);
          if (t < 5.4) {
            c.fillStyle = '#fff4d0'; c.fillRect(0, 0, W, H);
            for (let i = 0; i < 4; i++) { c.strokeStyle = `rgba(255,${140 + i * 20},40,${1 - p})`; c.lineWidth = 30 - i * 5; c.beginPath(); c.ellipse(W / 2, H - 60, Math.max(1, p * 1400 - i * 100), Math.max(1, p * 300 - i * 30), 0, 0, Math.PI * 2); c.stroke(); }
          } else ultOutro(c, t, f, opp, U, 5.4, fx, makeCineCity(), H - 20);
        }
      },
    };
  },
  // Gear: targeting, satellite charge, beam from orbit
  orbital(f, opp, U) {
    const fx = new ParticleSystem(2500), city = makeCineCity(), baseY = H - 20, col = U.fx.color, tx = W * 0.6;
    return {
      name: U.name, dur: 7, fx,
      cues: [[0.2, () => Sfx.tick()], [0.5, () => Sfx.tick()], [0.8, () => Sfx.tick()], [1.5, () => Sfx.charge(1.3)], [3, () => Sfx.laser(1.8)], [4.8, () => Sfx.boom()]],
      draw(c, t) {
        if (t < 1.5) {
          City.drawSky(c, t, {}); drawCineCity(c, city, baseY);
          oppSil(c, opp, tx, baseY, 1.4, 'idle', '#0a0a18', t);
          drawCharAt(c, f.def, W * 0.15, baseY, f.form ? 1.4 : 2, 1, { pose: 'cast', anim: t, transformed: f.form });
          const k = ease.out(seg(t, 0.2, 1.0)), r = lerp(300, 60, k);
          c.strokeStyle = '#f33'; c.lineWidth = 3; c.beginPath(); c.arc(tx, baseY - 100, r, 0, Math.PI * 2); c.moveTo(tx - r - 20, baseY - 100); c.lineTo(tx + r + 20, baseY - 100); c.moveTo(tx, baseY - 100 - r - 20); c.lineTo(tx, baseY - 100 + r + 20); c.stroke();
          if (t > 1) bigText(c, 'TARGET LOCKED', tx, baseY - 260, 34, '#f33');
          caption(c, U.fx.lines[0], t, 0.1, 1.4);
        } else if (t < 3) {
          c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
          for (const [x, y, r] of City.stars) { c.fillStyle = '#fff'; c.fillRect(x, y, r, r); }
          c.fillStyle = '#2a6ad8'; c.beginPath(); c.arc(W / 2, H + 1500, 1700, 0, Math.PI * 2); c.fill();
          glowCircle(c, W / 2, H - 150, 700, 'rgba(120,180,255,0.25)', 'rgba(0,0,0,0)');
          const k = seg(t, 1.5, 3);
          c.save(); c.translate(W / 2, H / 2 - 60); c.rotate(0.1);
          c.fillStyle = '#2a3a8a'; c.fillRect(-300, -30, 200, 60); c.fillRect(100, -30, 200, 60);
          c.strokeStyle = '#8af'; c.lineWidth = 1; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(-300 + i * 25, -30); c.lineTo(-300 + i * 25, 30); c.moveTo(100 + i * 25, -30); c.lineTo(100 + i * 25, 30); c.stroke(); }
          c.fillStyle = '#ccd'; roundRect(c, -90, -70, 180, 140, 14); c.fill(); c.fillStyle = '#ffb020'; c.fillRect(-90, -10, 180, 12);
          c.fillStyle = '#556'; c.fillRect(-30, 70, 60, 50);
          c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, 130, 30 + k * 120, hexA(col, 1)); c.globalCompositeOperation = 'source-over';
          c.restore();
          converge(fx, W / 2 + 20, H / 2 + 75, col, 3, 300); fx.draw(c);
          caption(c, U.fx.lines[1], t, 1.6, 2.9);
        } else if (t < 4.8) {
          City.drawSky(c, t, { top: '#050510', mid: '#1a1a3a', bot: '#3a3a6a' });
          const p = seg(t, 3, 4.8), sh = 10; c.save(); c.translate(rand(-sh, sh), rand(-sh, sh));
          for (const b of city) if (!b.dead && Math.abs(b.x + b.w / 2 - tx) < 80 + p * 500) { b.dead = true; fx.burst(b.x + b.w / 2, baseY - b.h / 2, 20, { color: [col, '#fff', '#ffb020'], size: 14, speed: 400, glow: true, life: 0.8 }); }
          drawCineCity(c, city, baseY);
          oppSil(c, opp, tx, baseY, 1.4, 'hurt', '#fff', t);
          c.globalCompositeOperation = 'lighter';
          const wdt = 90 + Math.sin(t * 50) * 10;
          const g = c.createLinearGradient(tx - wdt, 0, tx + wdt, 0); g.addColorStop(0, hexA(col, 0)); g.addColorStop(0.3, hexA(col, 0.8)); g.addColorStop(0.5, '#ffffff'); g.addColorStop(0.7, hexA(col, 0.8)); g.addColorStop(1, hexA(col, 0));
          c.fillStyle = g; c.fillRect(tx - wdt, 0, wdt * 2, baseY);
          glowCircle(c, tx, baseY, 260, hexA('#ffffff', 0.9), hexA(col, 0));
          c.globalCompositeOperation = 'source-over';
          fx.draw(c); c.restore();
          bigText(c, 'ORBITAL LASER', W / 2, 110, 70, col);
          flashAt(c, t, 3, 3.2, '#fff');
        } else ultOutro(c, t, f, opp, U, 4.8, fx, city, baseY);
      },
    };
  },
  // Terra: the earth splits and swallows the enemy
  quake(f, opp, U) {
    const fx = new ParticleSystem(2500), city = makeCineCity(), baseY = H - 20, col = U.fx.color;
    return {
      name: U.name, dur: 7, fx,
      cues: [[0.6, () => Sfx.slam()], [1.4, () => Sfx.rock()], [2, () => Sfx.rock(0.3)], [2.6, () => Sfx.boom()], [4.2, () => { Sfx.boom(); Sfx.rock(0.1); }]],
      draw(c, t) {
        if (t < 1.4) {
          skyGrad(c, U.fx.sky);
          c.fillStyle = '#3a2a1a'; c.fillRect(0, H - 120, W, 120);
          const k = seg(t, 0.6, 1.4);
          c.strokeStyle = hexA(col, 0.9); c.lineWidth = 4;
          for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(W / 2, H - 110); let x = W / 2, y = H - 110; for (let s = 0; s < 6 * k; s++) { x += (i < 4 ? -1 : 1) * rand(30, 80); y += rand(-5, 15); c.lineTo(x, y); } c.stroke(); }
          drawCharAt(c, f.def, W / 2, H - 110, 2.6, 1, { pose: t < 0.6 ? 'charge' : 'slam', anim: t, transformed: f.form });
          caption(c, U.fx.lines[0], t, 0.05, 1.3);
          if (t > 0.6) Game.shake = 0;
        } else if (t < 4.2) {
          const p = seg(t, 1.4, 3.6), gapW = ease.inOut(p) * 360, sh = 8;
          skyGrad(c, U.fx.sky);
          c.save(); c.translate(rand(-sh, sh), rand(-sh, sh));
          const cx = W * 0.6;
          // left and right halves drift apart and tilt
          for (const side of [-1, 1]) {
            c.save(); c.translate(cx + side * gapW / 2, baseY); c.rotate(side * p * 0.12); c.translate(-cx, -baseY);
            c.beginPath(); side < 0 ? c.rect(-200, 0, cx + 200, H) : c.rect(cx, 0, W, H); c.clip();
            drawCineCity(c, city, baseY);
            c.fillStyle = '#3a2a1a'; c.fillRect(-200, baseY, W + 400, 200);
            c.restore();
          }
          c.globalCompositeOperation = 'lighter';
          glowCircle(c, cx, baseY + 40, gapW + 40, hexA(col, 0.8), hexA(col, 0));
          c.globalCompositeOperation = 'source-over';
          const fall = ease.in(seg(t, 2.4, 3.6));
          if (fall < 1) oppSil(c, opp, cx, baseY + fall * 300, 1.4, 'hurt', '#0a0808', t, 1 - fall);
          for (let i = 0; i < 4; i++) fx.add({ x: cx + rand(-gapW / 2, gapW / 2), y: baseY + 20, vx: rand(-60, 60), vy: rand(-500, -200), life: 0.8, size: rand(4, 10), color: pick([col, '#6b5a48', '#ffcc33']), glow: Math.random() < 0.5, g: 600 });
          fx.draw(c);
          c.restore();
          if (t > 3.6) { const k = ease.in(seg(t, 3.6, 4.2)); c.fillStyle = '#4a3a2a'; c.fillRect(0, baseY - 400 * (1 - k) - 200, W, 200 * k); }
          caption(c, U.fx.lines[1], t, 1.5, 3.4);
          if (t > 3.8) { c.globalAlpha = seg(t, 3.8, 4); bigText(c, 'COLLAPSE!', W / 2, 140, 90, col); c.globalAlpha = 1; }
          flashAt(c, t, 4.1, 4.2, '#fff');
        } else ultOutro(c, t, f, opp, U, 4.2, fx, city, baseY);
      },
    };
  },
};

Cutscenes.transform = f => (f.def.ult.transformCutscene || csAscend)(f);
Cutscenes.ult = (f, opp) => f.def.ult.cutscene ? f.def.ult.cutscene(f, opp) : UltTemplates[f.def.ult.template](f, opp, f.def.ult);
