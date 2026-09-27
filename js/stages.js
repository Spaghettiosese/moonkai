// ============================================================
//  MOONKAI — camera + 12 wide stages
//  World space: ground at y = 0, up is negative; stages 2400-3000 wide.
// ============================================================
const Cam = {
  x: 0, y: -280, z: 1, sx: 0, sy: 0, shake: 0, boost: 0, focus: null,
  reset(x) { this.x = x; this.z = 0.9; this.y = -(H / 2 - 90) / this.z; this.boost = 0; this.focus = null; },
  update(dt, pts, stageW) {
    let cx, z;
    if (this.focus) { cx = this.focus.x; z = this.focus.z; }
    else {
      let mn = Infinity, mx = -Infinity;
      for (const p of pts) { mn = Math.min(mn, p.x); mx = Math.max(mx, p.x); }
      cx = (mn + mx) / 2;
      z = clamp(W / (mx - mn + 560), 0.56, 1.05);
    }
    z *= 1 + this.boost;
    const hw = W / 2 / z;
    cx = clamp(cx, hw, Math.max(hw, stageW - hw));
    let top = 0; for (const p of pts) top = Math.min(top, p.y - (p.h || 120));
    const cyGround = -(H / 2 - 88) / z;
    const cy = Math.min(cyGround, top - 40 + (H / 2 - 70) / z);
    const k = Math.min(1, dt * (this.focus ? 8 : 5));
    this.x = lerp(this.x, cx, k); this.z = lerp(this.z, z, k); this.y = lerp(this.y, this.focus ? (this.focus.y ?? cy) : cy, k);
    this.boost = Math.max(0, this.boost - dt * 0.6);
    const s = Save.set.shake ? this.shake : 0;
    this.sx = s ? rand(-s, s) : 0; this.sy = s ? rand(-s, s) : 0;
    this.shake = Math.max(0, this.shake - dt * 60);
  },
  apply(c) { c.translate(W / 2 + this.sx, H / 2 + this.sy); c.scale(this.z, this.z); c.translate(-this.x, -this.y); },
  layer(c, p, lift = 0) {
    const zl = lerp(1, this.z, p);
    c.translate(W / 2 + this.sx * p, H / 2 + this.sy * p); c.scale(zl, zl); c.translate(-this.x * p, -this.y + lift);
    return zl;
  },
  viewX(p = 1) { const zl = lerp(1, this.z, p); return [this.x * p - W / 2 / zl - 40, this.x * p + W / 2 / zl + 40]; },
  toScreen(x, y) { return [(x - this.x) * this.z + W / 2, (y - this.y) * this.z + H / 2]; },
};

// deterministic pseudo-random for scenery
const hash = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
function repeatX(x0, x1, step, fn) { for (let i = Math.floor(x0 / step); i <= Math.ceil(x1 / step); i++) fn(i, i * step); }
function skyFill(c, stops) {
  const g = c.createLinearGradient(0, 0, 0, H);
  stops.forEach((col, i) => g.addColorStop(i / (stops.length - 1), col));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function starsScreen(c, t, n = 120, alpha = 1) {
  for (let i = 0; i < n; i++) { c.globalAlpha = alpha * (0.4 + 0.5 * Math.sin(t * 2 + i)); c.fillStyle = '#fff'; c.fillRect(hash(i, 1) * W, hash(i, 2) * H * 0.6, 1 + hash(i, 3) * 1.5, 1 + hash(i, 3) * 1.5); }
  c.globalAlpha = 1;
}
function mountains(c, x0, x1, base, amp, step, col, seed) {
  c.fillStyle = col; c.beginPath(); c.moveTo(x0, base + 400);
  repeatX(x0, x1 + step, step, (i, x) => c.lineTo(x, base - amp * (0.4 + 0.6 * hash(i, seed))));
  c.lineTo(x1 + step, base + 400); c.closePath(); c.fill();
}
function skyline(c, x0, x1, col, winCol, hMin, hMax, seed, step = 90) {
  repeatX(x0, x1, step, (i, x) => {
    const w = step * (0.6 + hash(i, seed) * 0.35), h = hMin + hash(i, seed + 1) * (hMax - hMin);
    c.fillStyle = col; c.fillRect(x, -h, w, h + 400);
    if (winCol) { c.fillStyle = winCol; for (let y = -h + 10; y < -10; y += 18) for (let xx = x + 6; xx < x + w - 8; xx += 12) if (hash(xx * 0.1 + y, seed) > 0.55) c.fillRect(xx, y, 5, 8); }
  });
}
function clouds(c, x0, x1, y, col, t, speed, seed, size = 1) {
  repeatX(x0 - 400, x1 + 400, 380, (i, x) => {
    const cx = x + ((t * speed) % 380), cy = y + hash(i, seed) * 60;
    for (let k = 0; k < 4; k++) ellipse(c, cx + k * 40 * size, cy - (k % 2) * 14 * size, 60 * size, 22 * size, col);
  });
}

const WORLD_SRC = { x: 0, y: 0, world: true, def: { color: '#ff8a1a', name: 'THE STAGE' }, facing: 1, side: null };

// ---------- destructible structures ----------
const Arena = {
  stage: null, structs: [], damage: 0, destroyed: 0, hazT: 0, wind: 0, windT: 0, flash: 0, hype: 0, boomCd: 0,
  load(st) {
    this.stage = st; this.damage = 0; this.destroyed = 0; this.hazT = st.hazardEvery ? rand(8, 12) : 0; this.wind = 0; this.windT = 0; this.flash = 0; this.hype = 0;
    this.structs = [];
    let x = 40;
    while (x < st.width - 40) {
      const w = rand(st.sw[0], st.sw[1]), h = rand(st.sh[0], st.sh[1]);
      const cols = Math.max(1, Math.floor((w - 12) / 14)), rows = Math.floor((h - 16) / 20);
      this.structs.push({ x, w, h, maxH: h, hp: h * 0.6, dead: false, rubble: rand(14, 36), cols, rows, lit: Array.from({ length: cols * rows }, () => Math.random() < 0.45), tone: randi(0, 3), crack: 0, burn: 0, seed: Math.random() });
      x += w + rand(st.gap[0], st.gap[1]);
    }
    st.init && st.init(this);
  },
  hit(x0, x1, y, amt, fx) {
    if (x0 > x1) [x0, x1] = [x1, x0];
    for (const b of this.structs) {
      if (b.dead || b.x + b.w < x0 || b.x > x1 || y < -b.h - 10) continue;
      b.hp -= amt; b.crack = Math.min(1, b.crack + amt / (b.maxH * 0.5));
      if (Math.random() < 0.2) fx.burst(clamp((x0 + x1) / 2, b.x, b.x + b.w), Math.max(y, -b.h), 3, { color: this.stage.debris, size: 5, speed: 160, g: 600, life: 0.9, shape: 'rect' });
      if (b.hp <= 0) this.collapse(b, fx);
    }
  },
  collapse(b, fx) {
    if (b.dead) return;
    b.dead = true; b.burn = 1; this.destroyed++; Save.bump('destroyed');
    this.damage += b.w * b.maxH * 0.0021;
    if (this.boomCd <= 0) { Sfx.boom(); this.boomCd = 0.15; }
    Cam.shake = Math.max(Cam.shake, 8);
    fx.burst(b.x + b.w / 2, -b.h / 2, 26, { color: ['#ffae3b', '#ff6a1a', '#ffe28a'], size: 14, speed: 380, life: 0.9, glow: true, drag: 0.04 });
  },
  destroyNear(x, r, fx) { for (const b of this.structs) if (!b.dead && Math.abs(b.x + b.w / 2 - x) < r) this.collapse(b, fx); },
  update(dt, fx) {
    this.boomCd -= dt; this.flash = Math.max(0, this.flash - dt * 2);
    for (const b of this.structs) {
      if (!b.dead) continue;
      if (b.h > b.rubble) { b.h = Math.max(b.rubble, b.h - dt * 170); if (Math.random() < 0.5) fx.add({ x: rand(b.x, b.x + b.w), y: -b.h, vx: rand(-40, 40), vy: rand(-80, -20), life: rand(0.8, 1.5), size: rand(10, 22), color: 'rgba(120,110,100,0.45)', grow: 18 }); }
      if (Math.random() < dt * 6 * b.burn) fx.add({ x: rand(b.x + 6, b.x + b.w - 6), y: -b.h + rand(0, 10), vx: rand(-15, 15), vy: rand(-110, -50), life: rand(0.4, 0.9), size: rand(5, 11), color: pick(['#ff8a1a', '#ffcc33', '#ff4a1a']), glow: true, grow: -6 });
    }
    const st = this.stage;
    if (st.hazardEvery && Game.battle && Game.battle.live()) {
      this.hazT -= dt;
      if (this.hazT <= 0) { this.hazT = rand(st.hazardEvery[0], st.hazardEvery[1]); st.hazard(this, fx); }
    }
    if (this.windT > 0) { this.windT -= dt; if (this.windT <= 0) this.wind = 0; }
    st.update && st.update(dt, this, fx);
    if (st.weather) st.weather(dt, fx);
  },
  drawBack(c, t) {
    const st = this.stage;
    c.save(); st.sky(c, t, this); c.restore();
    for (const L of st.layers) { c.save(); Cam.layer(c, L.p, L.lift || 0); const [x0, x1] = Cam.viewX(L.p); L.draw(c, x0, x1, t, this); c.restore(); }
    if (this.flash > 0) { c.fillStyle = `rgba(230,240,255,${this.flash * 0.6})`; c.fillRect(0, 0, W, H); }
  },
  drawWorld(c, t) {
    const st = this.stage, [x0, x1] = Cam.viewX(1);
    for (const b of this.structs) if (b.x + b.w > x0 && b.x < x1) st.struct(c, b, t);
    st.ground(c, x0, x1, t, this);
    // stage edges (walls)
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-400, -2000, 400, 2400); c.fillRect(st.width, -2000, 400, 2400);
  },
  drawFront(c, t) { this.stage.front && this.stage.front(c, t, this); },
};

// ---------- structure styles (world space: base at y=0) ----------
function rubbleTop(c, b, top) { c.beginPath(); c.moveTo(b.x, 0); c.lineTo(b.x, top + 10); for (let i = 1; i <= 6; i++) c.lineTo(b.x + b.w * i / 6, top + ((i * 37) % 17) - (i % 2) * 12); c.lineTo(b.x + b.w, 0); c.fill(); }
function crackAndBurn(c, b, top) {
  if (b.crack > 0.2 && !b.dead) { c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(b.x + b.w * 0.3, top + 10); c.lineTo(b.x + b.w * 0.5, top + b.h * 0.3 * b.crack); c.lineTo(b.x + b.w * 0.4, top + b.h * 0.6 * b.crack); c.stroke(); }
  if (b.dead && b.burn) glowCircle(c, b.x + b.w / 2, top, b.w * 0.8, 'rgba(255,110,30,0.3)', 'rgba(255,60,0,0)');
}
const STRUCTS = {
  tower(c, b, t, tones = ['#2b2a4a', '#312c52', '#26324d', '#2e2640'], lit = 'rgba(255,214,120,0.85)') {
    const top = -b.h; c.fillStyle = tones[b.tone];
    if (!b.dead) { c.fillRect(b.x, top, b.w, b.h); c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(b.x, top, 5, b.h); c.fillStyle = shadeHex(tones[b.tone], -0.3); c.fillRect(b.x - 3, top - 6, b.w + 6, 8); if (b.seed < 0.3) { c.fillRect(b.x + b.w / 2 - 1, top - 34, 3, 30); circle(c, b.x + b.w / 2, top - 35, 3, '#ff3b3b'); } }
    else rubbleTop(c, b, top);
    const vis = Math.floor((b.h - 16) / 20);
    for (let r = 0; r < Math.min(b.rows, vis); r++) for (let k = 0; k < b.cols; k++) { c.fillStyle = b.lit[r * b.cols + k] && !b.dead ? lit : 'rgba(10,12,30,0.8)'; c.fillRect(b.x + 8 + k * 14, -22 - r * 20, 7, 10); }
    crackAndBurn(c, b, top);
  },
  container(c, b) {
    const cols = ['#b8452f', '#2f6db8', '#d19a2a', '#3a8a4a'], top = -b.h, n = Math.max(1, Math.floor(b.h / 42));
    for (let i = 0; i < n; i++) { const y = -(i + 1) * 42, col = cols[(b.tone + i) % 4]; if (y < top - 1) break; c.fillStyle = shadeHex(col, -0.25); c.fillRect(b.x, y, b.w, 40); c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2; for (let x = b.x + 6; x < b.x + b.w; x += 8) { c.beginPath(); c.moveTo(x, y + 3); c.lineTo(x, y + 37); c.stroke(); } c.strokeStyle = 'rgba(0,0,0,0.6)'; c.strokeRect(b.x, y, b.w, 40); }
    if (b.dead) { c.fillStyle = '#3a2a22'; rubbleTop(c, b, top); } crackAndBurn(c, b, top);
  },
  spire(c, b, t) { const top = -b.h; c.fillStyle = b.tone % 2 ? '#1c1414' : '#241a18'; c.beginPath(); c.moveTo(b.x, 0); c.lineTo(b.x + b.w * 0.2, top + 20); c.lineTo(b.x + b.w * 0.45, top); c.lineTo(b.x + b.w * 0.7, top + 30); c.lineTo(b.x + b.w, 0); c.fill(); c.strokeStyle = `rgba(255,${90 + Math.sin(t * 3 + b.seed * 9) * 40},20,0.8)`; c.lineWidth = 2; c.beginPath(); c.moveTo(b.x + b.w * 0.45, top + 20); c.lineTo(b.x + b.w * 0.4, top + b.h * 0.5); c.lineTo(b.x + b.w * 0.55, -10); c.stroke(); crackAndBurn(c, b, top); },
  ice(c, b) { const top = -b.h, g = c.createLinearGradient(b.x, top, b.x + b.w, 0); g.addColorStop(0, 'rgba(210,245,255,0.85)'); g.addColorStop(1, 'rgba(90,150,210,0.75)'); c.fillStyle = g; c.beginPath(); c.moveTo(b.x + 4, 0); c.lineTo(b.x + b.w * 0.15, top + 30); c.lineTo(b.x + b.w * 0.5, top); c.lineTo(b.x + b.w * 0.85, top + 24); c.lineTo(b.x + b.w - 4, 0); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(b.x + b.w * 0.5, top + 6); c.lineTo(b.x + b.w * 0.42, -20); c.stroke(); },
  habitat(c, b) { const top = -b.h; c.fillStyle = b.tone % 2 ? '#c9ccd4' : '#aeb3bd'; if (!b.dead) { c.fillRect(b.x, top + b.w * 0.25, b.w, b.h - b.w * 0.25); c.beginPath(); c.ellipse(b.x + b.w / 2, top + b.w * 0.25, b.w / 2, b.w * 0.25, 0, Math.PI, Math.PI * 2); c.fill(); c.fillStyle = '#e04040'; c.fillRect(b.x, top + b.w * 0.25 + 10, b.w, 5); for (let y = top + b.w * 0.25 + 30; y < -20; y += 36) for (let x = b.x + 14; x < b.x + b.w - 10; x += 26) circle(c, x, y, 6, 'rgba(120,220,255,0.8)'); } else { c.fillStyle = '#8a8e96'; rubbleTop(c, b, top); } crackAndBurn(c, b, top); },
  column(c, b) { const top = -b.h, cx = b.x + b.w / 2, cw = Math.min(b.w * 0.5, 46); c.fillStyle = '#e9e2d0'; c.fillRect(cx - cw / 2, top + 14, cw, b.h - 14); c.strokeStyle = 'rgba(120,110,90,0.5)'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(cx - cw / 2 + i * cw / 4, top + 16); c.lineTo(cx - cw / 2 + i * cw / 4, -8); c.stroke(); } c.fillStyle = '#d8cfb8'; if (!b.dead) { c.fillRect(cx - cw / 2 - 8, top, cw + 16, 14); c.fillRect(cx - cw / 2 - 12, top - 6, cw + 24, 7); } else { c.fillStyle = '#b8ae96'; c.beginPath(); c.moveTo(cx - cw / 2, top + 14); c.lineTo(cx, top); c.lineTo(cx + cw / 2, top + 20); c.fill(); } c.fillRect(cx - cw / 2 - 8, -10, cw + 16, 10); },
  neon(c, b, t) { const top = -b.h; c.fillStyle = ['#15122a', '#1a1030', '#101a2a', '#1c1024'][b.tone]; if (!b.dead) { c.fillRect(b.x, top, b.w, b.h); const col = ['#ff2a8a', '#2af0ff', '#ffe02a', '#9a5aff'][b.tone]; c.globalCompositeOperation = 'lighter'; c.strokeStyle = hexA(col, 0.6 + 0.4 * Math.sin(t * 5 + b.seed * 20)); c.lineWidth = 3; c.strokeRect(b.x + 10, top + 20, b.w - 20, 26); c.fillStyle = hexA(col, 0.2); c.fillRect(b.x + 10, top + 20, b.w - 20, 26); c.globalCompositeOperation = 'source-over'; for (let y = top + 60; y < -14; y += 22) for (let x = b.x + 8; x < b.x + b.w - 8; x += 14) if (hash(x + y, 3) > 0.5) { c.fillStyle = hexA(col, 0.5); c.fillRect(x, y, 6, 9); } } else rubbleTop(c, b, top); crackAndBurn(c, b, top); },
  tomb(c, b) { const top = -b.h; c.fillStyle = b.tone % 2 ? '#3a3442' : '#2e2a36'; if (!b.dead) { c.fillRect(b.x, top + 20, b.w, b.h - 20); c.beginPath(); c.moveTo(b.x - 4, top + 22); c.lineTo(b.x + b.w / 2, top); c.lineTo(b.x + b.w + 4, top + 22); c.fill(); c.fillStyle = 'rgba(255,220,120,0.5)'; c.fillRect(b.x + b.w / 2 - 6, top + 40, 12, 20); } else rubbleTop(c, b, top); crackAndBurn(c, b, top); },
  pillar(c, b) { const top = -b.h; c.fillStyle = ['#8a6a44', '#9a7a54', '#7a5a3a', '#a08050'][b.tone]; if (!b.dead) { c.fillRect(b.x + b.w * 0.2, top, b.w * 0.6, b.h); c.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = top + 10; y < 0; y += 30) c.fillRect(b.x + b.w * 0.2, y, b.w * 0.6, 3); c.fillStyle = '#6a5030'; c.fillRect(b.x + b.w * 0.1, top - 8, b.w * 0.8, 10); } else rubbleTop(c, b, top); },
  ruin(c, b) { const top = -b.h; c.fillStyle = b.tone % 2 ? '#4a5a3a' : '#556644'; if (!b.dead) { c.fillRect(b.x, top, b.w, b.h); c.fillStyle = 'rgba(40,120,40,0.7)'; for (let i = 0; i < 4; i++) { c.fillRect(b.x + hash(i, b.seed * 9) * b.w, top, 4, b.h * hash(i + 3, b.seed * 9)); } c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(b.x + b.w * 0.3, top + 30, b.w * 0.4, 30); } else rubbleTop(c, b, top); },
  void(c, b, t) { const top = -b.h; c.fillStyle = '#0c0616'; c.save(); c.translate(0, Math.sin(t + b.seed * 10) * 8); if (!b.dead) { c.beginPath(); c.moveTo(b.x, 0); c.lineTo(b.x + b.w * 0.3, top); c.lineTo(b.x + b.w * 0.8, top + 20); c.lineTo(b.x + b.w, 0); c.fill(); c.strokeStyle = 'rgba(180,100,255,0.6)'; c.lineWidth = 2; c.stroke(); } c.restore(); },
};

// ---------- hazards ----------
function fallHazard(n, look) { return A => { Game.announce(look.warn, look.color); for (let i = 0; i < n; i++) Combat.addHazard({ kind: 'fall', x: rand(Cam.x - 500, Cam.x + 500), t: 0, delay: 0.9 + i * 0.3, owner: WORLD_SRC, look, y: -900, done: false }); }; }

const STAGES = [
  {
    id: 'metro', name: 'METRO NIGHT', desc: 'Downtown under the moon. Everything breaks.', width: 2800, music: 'metro',
    sw: [80, 150], sh: [160, 380], gap: [40, 140], debris: ['#888', '#aaa', '#665'], gravity: 1, friction: 1, struct: (c, b, t) => STRUCTS.tower(c, b, t),
    sky(c, t) { skyFill(c, ['#050818', '#1a1446', '#3d2350']); starsScreen(c, t); const full = Game.battle && Game.battle.all().some(f => f.id === 'eric' && f.form); City.drawMoon(c, t, full ? 1 : 0, W * 0.78, 130); },
    layers: [
      { p: 0.15, draw(c, x0, x1) { skyline(c, x0, x1, '#141230', 'rgba(255,220,140,0.2)', 300, 520, 1, 70); } },
      { p: 0.4, draw(c, x0, x1, t) { skyline(c, x0, x1, '#1b1936', 'rgba(255,220,140,0.3)', 200, 420, 2, 90); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + Math.sin(t * 0.4 + i * 2) * 0.5, x = x0 + (i + 0.5) * (x1 - x0) / 3; c.fillStyle = 'rgba(160,190,255,0.05)'; c.beginPath(); c.moveTo(x, -200); c.lineTo(x + Math.cos(a - 0.05) * 900, -200 + Math.sin(a - 0.05) * 900); c.lineTo(x + Math.cos(a + 0.05) * 900, -200 + Math.sin(a + 0.05) * 900); c.fill(); } c.globalCompositeOperation = 'source-over'; } },
    ],
    ground(c, x0, x1) { c.fillStyle = '#2a2a33'; c.fillRect(x0, 0, x1 - x0, 600); c.fillStyle = '#3b3b48'; c.fillRect(x0, 0, x1 - x0, 10); c.fillStyle = '#d9c24a'; repeatX(x0, x1, 90, (i, x) => c.fillRect(x + 10, 50, 46, 5)); },
    weather(dt, fx) { if (Math.random() < dt * 2) fx.add({ x: rand(...Cam.viewX()), y: -rand(300, 700), vx: rand(-20, 20), vy: 40, life: 3, size: 2, color: 'rgba(255,255,255,0.3)' }); },
  },
  {
    id: 'harbor', name: 'SUNSET HARBOR', desc: 'Docks at golden hour. A crane drops cargo on the unwary.', width: 2600, music: 'harbor',
    sw: [60, 120], sh: [84, 250], gap: [60, 160], debris: ['#b8452f', '#2f6db8', '#d19a2a'], gravity: 1, friction: 1, struct: (c, b) => STRUCTS.container(c, b),
    hazardEvery: [16, 22], hazard: fallHazard(2, { warn: 'CARGO DROP!', color: '#ffb45a', rock: '#b8452f', glow: '#ffd08a', box: true }),
    sky(c) { skyFill(c, ['#2a1a4a', '#c8506a', '#ffb45a']); glowCircle(c, W * 0.62, H * 0.62, 260, 'rgba(255,200,120,0.5)', 'rgba(255,120,60,0)'); c.save(); c.beginPath(); c.rect(0, 0, W, H * 0.62); c.clip(); circle(c, W * 0.62, H * 0.62, 80, '#ffe2a0'); c.restore(); },
    layers: [
      { p: 0.1, draw(c, x0, x1, t) { clouds(c, x0, x1, -560, 'rgba(255,200,190,0.2)', t, 6, 5); } },
      { p: 0.3, draw(c, x0, x1, t) { const sea = c.createLinearGradient(0, -190, 0, 0); sea.addColorStop(0, '#6a3a6a'); sea.addColorStop(1, '#1a2040'); c.fillStyle = sea; c.fillRect(x0, -190, x1 - x0, 400); c.fillStyle = 'rgba(255,210,140,0.35)'; for (let y = -180; y < 0; y += 12) c.fillRect(x0 + (x1 - x0) * 0.6 - 60 + Math.sin(t * 2 + y) * 10, y, 120 - (y + 180) * 0.3, 2); const sx = ((t * 20) % 3000) + x0 - 400; c.fillStyle = '#1a1020'; c.fillRect(sx, -230, 300, 30); c.fillRect(sx + 210, -262, 56, 34); for (let i = 0; i < 6; i++) c.fillRect(sx + 20 + i * 30, -248, 26, 18); } },
      { p: 0.7, draw(c, x0, x1, t) { c.strokeStyle = '#2a1a2a'; c.lineWidth = 9; repeatX(x0, x1, 700, (i, x) => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, -420); c.lineTo(x + 220, -420); c.moveTo(x, -360); c.lineTo(x + 90, -420); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(x + 180, -420); c.lineTo(x + 180, -300 + Math.sin(t + i) * 12); c.stroke(); c.lineWidth = 9; }); } },
    ],
    ground(c, x0, x1) { c.fillStyle = '#5a3e2a'; c.fillRect(x0, 0, x1 - x0, 600); c.strokeStyle = '#3a2618'; c.lineWidth = 2; repeatX(x0, x1, 36, (i, x) => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 600); c.stroke(); }); c.fillStyle = '#7a5a3a'; c.fillRect(x0, 0, x1 - x0, 6); },
    weather(dt, fx) { if (Math.random() < dt * 0.6) { const [a, b] = Cam.viewX(); const x = rand(a, b), y = -rand(200, 500); for (let k = 0; k < 2; k++) fx.add({ x: x + k * 12, y, vx: 60, vy: -5, life: 4, size: 2, color: '#2a1a2a' }); } },
  },
  {
    id: 'magma', name: 'MAGMA RIFT', desc: 'An active volcano. Eruptions rain molten rock on everyone.', width: 2600, music: 'magma',
    sw: [50, 110], sh: [100, 300], gap: [60, 150], debris: ['#2a1a18', '#553', '#ff6a1a'], gravity: 1, friction: 1, struct: (c, b, t) => STRUCTS.spire(c, b, t),
    hazardEvery: [12, 16], hazard: fallHazard(6, { warn: 'ERUPTION!', color: '#ff6a1a', rock: '#3a2218', glow: '#ff6a1a' }),
    sky(c, t) { skyFill(c, ['#140606', '#4a100a', '#8a2a0a']); },
    layers: [
      { p: 0.12, draw(c, x0, x1, t) { const vx = (x0 + x1) / 2; c.fillStyle = '#1a0c0a'; c.beginPath(); c.moveTo(vx - 700, 0); c.lineTo(vx - 90, -480); c.lineTo(vx + 90, -480); c.lineTo(vx + 700, 0); c.fill(); glowCircle(c, vx, -480, 170 + Math.sin(t * 3) * 12, 'rgba(255,120,30,0.6)', 'rgba(255,40,0,0)'); for (let i = 0; i < 4; i++) { const y = -500 - ((t * 30 + i * 60) % 260); ellipse(c, vx + Math.sin(t + i) * 30, y, 70 + (-500 - y) * 0.3, 30, 'rgba(40,30,30,0.35)'); } } },
      { p: 0.45, draw(c, x0, x1, t) { mountains(c, x0, x1, 0, 200, 160, '#120808', 7); const lg = c.createLinearGradient(0, -60, 0, 0); lg.addColorStop(0, '#ffcc40'); lg.addColorStop(1, '#ff3a0a'); c.fillStyle = lg; c.fillRect(x0, -50, x1 - x0, 60); } },
    ],
    ground(c, x0, x1, t) { c.fillStyle = '#16100e'; c.fillRect(x0, 0, x1 - x0, 600); c.strokeStyle = `rgba(255,${100 + Math.sin(t * 2) * 40},20,0.8)`; c.lineWidth = 3; repeatX(x0, x1, 170, (i, x) => { c.beginPath(); c.moveTo(x, 10); c.lineTo(x + 40, 40); c.lineTo(x + 20, 90); c.stroke(); }); },
    weather(dt, fx) { if (Math.random() < dt * 20) { const [a, b] = Cam.viewX(); fx.add({ x: rand(a, b), y: 0, vx: rand(-10, 10), vy: rand(-80, -30), life: 1.5, size: rand(1.5, 3), color: '#ff8a3a', glow: true }); } },
  },
  {
    id: 'frost', name: 'FROSTPEAK CITADEL', desc: 'A glacier fortress. The floor is ice; icicles fall.', width: 2600, music: 'frost',
    sw: [50, 100], sh: [110, 280], gap: [70, 160], debris: ['#dff', '#9cf', '#fff'], gravity: 1, friction: 0.3, struct: (c, b) => STRUCTS.ice(c, b),
    hazardEvery: [18, 24], hazard: fallHazard(4, { warn: 'ICICLES!', color: '#9ff', rock: '#dff', glow: '#9ff', icicle: true }),
    sky(c, t) {
      skyFill(c, ['#040a1e', '#12284a', '#2a4a6a']); starsScreen(c, t, 90, 0.8);
      c.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) { c.fillStyle = k === 1 ? 'rgba(170,80,255,0.08)' : 'rgba(60,255,160,0.09)'; c.beginPath(); c.moveTo(0, 200); for (let x = 0; x <= W; x += 40) c.lineTo(x, 110 + k * 40 + Math.sin(x * 0.006 + t * 0.6 + k) * 40); for (let x = W; x >= 0; x -= 40) c.lineTo(x, 210 + k * 40 + Math.sin(x * 0.006 + t * 0.6 + k + 1) * 30); c.fill(); }
      c.globalCompositeOperation = 'source-over';
    },
    layers: [
      { p: 0.15, draw(c, x0, x1) { mountains(c, x0, x1, 0, 420, 220, '#3a5a7a', 3); c.fillStyle = 'rgba(255,255,255,0.5)'; repeatX(x0, x1, 220, (i, x) => { const h = 420 * (0.4 + 0.6 * hash(i, 3)); c.beginPath(); c.moveTo(x - 30, -h + 50); c.lineTo(x, -h); c.lineTo(x + 30, -h + 50); c.fill(); }); } },
      { p: 0.4, draw(c, x0, x1) { mountains(c, x0, x1, 0, 240, 140, '#2a4058', 9); const cx = (x0 + x1) / 2; c.fillStyle = '#1a2a3a'; c.fillRect(cx - 90, -300, 180, 300); c.fillRect(cx - 130, -350, 44, 350); c.fillRect(cx + 86, -350, 44, 350); c.fillStyle = 'rgba(120,220,255,0.8)'; for (let i = 0; i < 3; i++) c.fillRect(cx - 50 + i * 38, -240, 12, 22); } },
    ],
    ground(c, x0, x1) { const g = c.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, '#dff4ff'); g.addColorStop(1, '#8ab8d8'); c.fillStyle = g; c.fillRect(x0, 0, x1 - x0, 600); c.fillStyle = 'rgba(255,255,255,0.6)'; repeatX(x0, x1, 120, (i, x) => c.fillRect(x + 20, 30, 70, 2)); },
    weather(dt, fx) { const [a, b] = Cam.viewX(); for (let i = 0; i < 2; i++) if (Math.random() < dt * 30) fx.add({ x: rand(a - 200, b), y: Cam.y - H / 2 / Cam.z - 20, vx: rand(20, 60), vy: rand(60, 110), life: 9, size: rand(1.5, 3.5), color: '#fff' }); },
  },
  {
    id: 'lunar', name: 'LUNAR STATION', desc: 'On the Moon. Low gravity, huge jumps, meteor showers.', width: 3000, music: 'lunar',
    sw: [80, 130], sh: [90, 220], gap: [70, 160], debris: ['#aaa', '#ccc', '#e04040'], gravity: 0.6, friction: 1, struct: (c, b) => STRUCTS.habitat(c, b),
    hazardEvery: [14, 18], hazard: fallHazard(7, { warn: 'METEOR SHOWER!', color: '#9cf', rock: '#555', glow: '#9cf' }),
    sky(c, t) {
      c.fillStyle = '#02030a'; c.fillRect(0, 0, W, H); starsScreen(c, t, 200);
      const ex = W * 0.2 - Cam.x * 0.01, ey = 150;
      glowCircle(c, ex, ey, 150, 'rgba(90,160,255,0.4)', 'rgba(90,160,255,0)'); circle(c, ex, ey, 90, '#2a6ad8');
      c.save(); c.beginPath(); c.arc(ex, ey, 90, 0, Math.PI * 2); c.clip(); c.fillStyle = '#3aa050'; for (const [x, y, r] of [[-30, -30, 34], [40, 30, 26], [20, -50, 18], [-50, 40, 20]]) { c.beginPath(); c.ellipse(ex + x + Math.sin(t * 0.1) * 6, ey + y, r, r * 0.7, 0.4, 0, Math.PI * 2); c.fill(); } c.fillStyle = 'rgba(0,0,20,0.55)'; c.beginPath(); c.arc(ex + 40, ey + 20, 100, 0, Math.PI * 2); c.fill(); c.restore();
    },
    layers: [{ p: 0.35, draw(c, x0, x1) { mountains(c, x0, x1, 0, 140, 90, '#5a5a62', 4); } }],
    ground(c, x0, x1) { c.fillStyle = '#8a8a90'; c.fillRect(x0, 0, x1 - x0, 600); repeatX(x0, x1, 260, (i, x) => { const r = 20 + hash(i, 5) * 20; ellipse(c, x, 40, r, r * 0.3, '#6a6a70'); ellipse(c, x, 38, r * 0.8, r * 0.2, '#5a5a60'); }); },
  },
  {
    id: 'sky', name: 'SKY TEMPLE', desc: 'Ruins above the clouds. Wind gusts shove everyone.', width: 2600, music: 'sky',
    sw: [70, 120], sh: [140, 320], gap: [70, 160], debris: ['#e9e2d0', '#b8ae96'], gravity: 0.9, friction: 1, struct: (c, b) => STRUCTS.column(c, b),
    hazardEvery: [10, 14], hazard(A) { A.wind = Math.random() < 0.5 ? -1 : 1; A.windT = 3; Game.announce(A.wind > 0 ? 'GUST  ►►►' : '◄◄◄  GUST', '#dff'); Sfx.whoosh(); },
    update(dt, A, fx) { if (A.wind) { const [a, b] = Cam.viewX(); for (let i = 0; i < 3; i++) fx.add({ x: A.wind > 0 ? a : b, y: -rand(0, 600), vx: A.wind * rand(700, 1000), vy: 0, life: 2, size: rand(1, 2.5), color: 'rgba(255,255,255,0.8)' }); } },
    sky(c) { skyFill(c, ['#6a8ad8', '#f0a0b0', '#ffd8a0']); glowCircle(c, W * 0.76, H * 0.5, 240, 'rgba(255,240,200,0.7)', 'rgba(255,200,150,0)'); circle(c, W * 0.76, H * 0.5, 55, '#fff6e0'); },
    layers: [
      { p: 0.15, draw(c, x0, x1, t) { repeatX(x0, x1, 520, (i, x) => { const y = -420 + hash(i, 4) * 160, xx = x + Math.sin(t * 0.3 + i) * 10; c.fillStyle = '#7a8a9a'; c.beginPath(); c.moveTo(xx - 80, y); c.lineTo(xx + 80, y); c.lineTo(xx + 20, y + 70); c.lineTo(xx - 30, y + 60); c.fill(); c.fillStyle = '#5a9a5a'; c.fillRect(xx - 80, y - 6, 160, 8); c.fillStyle = '#e9e2d0'; c.fillRect(xx - 34, y - 56, 12, 50); c.fillRect(xx + 12, y - 56, 12, 50); c.fillRect(xx - 40, y - 62, 72, 8); }); } },
      { p: 0.35, draw(c, x0, x1, t) { clouds(c, x0, x1, -120, 'rgba(255,235,240,0.75)', t, 10, 3, 1.3); } },
    ],
    ground(c, x0, x1) { c.fillStyle = '#e4dccb'; c.fillRect(x0, 0, x1 - x0, 600); c.strokeStyle = 'rgba(120,110,90,0.4)'; c.lineWidth = 2; repeatX(x0, x1, 90, (i, x) => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 30, 200); c.stroke(); }); c.fillStyle = '#c9b88a'; c.fillRect(x0, 0, x1 - x0, 8); },
    front(c, t) { c.save(); c.globalAlpha = 0.55; Cam.layer(c, 1.35); const [a, b] = Cam.viewX(1.35); clouds(c, a, b, 160, 'rgba(255,255,255,0.8)', t, 16, 8, 1.5); c.restore(); },
  },
  {
    id: 'neon', name: 'NEON UNDERCITY', desc: 'Cyberpunk streets. Electrified floor panels pulse without warning.', width: 2800, music: 'neon',
    sw: [80, 150], sh: [180, 420], gap: [40, 120], debris: ['#333', '#ff2a8a', '#2af0ff'], gravity: 1, friction: 1, struct: (c, b, t) => STRUCTS.neon(c, b, t),
    hazardEvery: [13, 17], hazard(A) { Game.announce('POWER SURGE!', '#2af0ff'); for (let i = 0; i < 3; i++) Combat.addHazard({ kind: 'zone', x: Cam.x + (i - 1) * 380 + rand(-60, 60), owner: WORLD_SRC, r: 90, delay: 1, life: 1.6, every: 0.3, dmg: 18, color: '#2af0ff', t: 0, world: true }); },
    sky(c, t) { skyFill(c, ['#08020f', '#1a0630', '#40104a']); for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,40,140,0.05)'; c.fillRect(0, H * 0.3 + i * 30, W, 2); } },
    layers: [
      { p: 0.15, draw(c, x0, x1) { skyline(c, x0, x1, '#0f0820', 'rgba(255,60,160,0.3)', 380, 640, 3, 80); } },
      { p: 0.4, draw(c, x0, x1, t) { skyline(c, x0, x1, '#160c28', 'rgba(60,240,255,0.35)', 240, 460, 4, 100); const tx = ((t * 900) % 6000) + x0 - 3000; c.fillStyle = '#222'; c.fillRect(tx, -170, 900, 40); c.fillStyle = 'rgba(255,240,120,0.7)'; for (let i = 0; i < 30; i++) c.fillRect(tx + 10 + i * 30, -162, 18, 14); c.fillStyle = '#333'; c.fillRect(x0, -128, x1 - x0, 8); } },
    ],
    ground(c, x0, x1, t) { c.fillStyle = '#12101a'; c.fillRect(x0, 0, x1 - x0, 600); c.globalCompositeOperation = 'lighter'; repeatX(x0, x1, 120, (i, x) => { c.fillStyle = hexA(i % 2 ? '#ff2a8a' : '#2af0ff', 0.2 + 0.1 * Math.sin(t * 3 + i)); c.fillRect(x, 4, 100, 3); }); c.globalCompositeOperation = 'source-over'; },
    weather(dt, fx) { const [a, b] = Cam.viewX(); for (let i = 0; i < 3; i++) if (Math.random() < dt * 40) fx.add({ x: rand(a, b), y: Cam.y - H / 2 / Cam.z, vx: -60, vy: 900, life: 1.2, size: 1.2, color: 'rgba(150,180,255,0.5)' }); },
  },
  {
    id: 'manor', name: 'HAUNTED MANOR', desc: 'Lightning, ghosts and a very unstable chandelier.', width: 2400, music: 'manor',
    sw: [80, 130], sh: [150, 300], gap: [70, 160], debris: ['#443', '#665', '#aa9'], gravity: 1, friction: 1, struct: (c, b) => STRUCTS.tomb(c, b),
    hazardEvery: [12, 16], hazard(A) { A.flash = 1; Sfx.boom(); Game.announce('CHANDELIER!', '#ffe08a'); Combat.addHazard({ kind: 'fall', x: Cam.x + rand(-300, 300), t: 0, delay: 1, owner: WORLD_SRC, look: { warn: '', color: '#ffe08a', rock: '#886', glow: '#ffe08a', chandelier: true }, y: -900, done: false }); },
    sky(c, t) { skyFill(c, ['#05050a', '#16142a', '#2a2438']); City.drawMoon(c, t, 1, W * 0.3, 120, 60); if (Math.random() < 0.004) Arena.flash = 0.7; },
    layers: [
      { p: 0.2, draw(c, x0, x1) { mountains(c, x0, x1, 0, 180, 120, '#0e0c18', 6); const mx = (x0 + x1) / 2; c.fillStyle = '#0a0812'; c.fillRect(mx - 260, -420, 520, 420); for (const d of [-300, 300]) { c.fillRect(mx + d - 50, -520, 100, 520); c.beginPath(); c.moveTo(mx + d - 60, -520); c.lineTo(mx + d, -620); c.lineTo(mx + d + 60, -520); c.fill(); } c.fillStyle = 'rgba(255,200,90,0.5)'; for (let i = 0; i < 8; i++) c.fillRect(mx - 220 + (i % 4) * 120, -360 + Math.floor(i / 4) * 120, 30, 50); } },
      { p: 0.5, draw(c, x0, x1, t) { c.strokeStyle = '#141018'; c.lineWidth = 6; repeatX(x0, x1, 260, (i, x) => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 10, -200); c.moveTo(x + 6, -120); c.lineTo(x - 50, -190); c.moveTo(x + 8, -160); c.lineTo(x + 60, -230); c.stroke(); }); for (let i = 0; i < 3; i++) { const gx = x0 + ((t * 40 + i * 500) % (x1 - x0)); c.globalAlpha = 0.25; drawCharAt(c, { draw: (cc, v) => { cc.fillStyle = '#dde'; cc.beginPath(); cc.arc(0, -80, 18, Math.PI, 0); cc.lineTo(18, -40); for (let k = 0; k < 4; k++) cc.lineTo(18 - k * 12, -40 + (k % 2) * 8); cc.fill(); } }, gx, -200 + Math.sin(t * 2 + i) * 30, 1, 1, {}); c.globalAlpha = 1; } } },
    ],
    ground(c, x0, x1) { c.fillStyle = '#1e1a22'; c.fillRect(x0, 0, x1 - x0, 600); c.fillStyle = '#2a2430'; repeatX(x0, x1, 60, (i, x) => c.fillRect(x, 0, 56, 6)); c.fillStyle = '#5a1a2a'; c.fillRect(x0, 14, x1 - x0, 30); },
    weather(dt, fx) { const [a, b] = Cam.viewX(); for (let i = 0; i < 4; i++) if (Math.random() < dt * 60) fx.add({ x: rand(a, b + 200), y: Cam.y - H / 2 / Cam.z, vx: -200, vy: 1100, life: 1, size: 1.3, color: 'rgba(160,170,220,0.45)' }); },
  },
  {
    id: 'colosseum', name: 'THE COLOSSEUM', desc: 'Razor\'s arena. Big combos and ultimates make the crowd roar, and that pays out in Ki.', width: 2600, music: 'colosseum',
    sw: [90, 150], sh: [120, 240], gap: [60, 140], debris: ['#8a6a44', '#a08050'], gravity: 1, friction: 1, struct: (c, b) => STRUCTS.pillar(c, b), crowd: true,
    sky(c) { skyFill(c, ['#3a6ab8', '#8ab0e0', '#e0d0b0']); },
    layers: [
      { p: 0.3, draw(c, x0, x1, t, A) { c.fillStyle = '#9a7a54'; c.fillRect(x0, -520, x1 - x0, 520); c.fillStyle = '#7a5a3a'; for (let r = 0; r < 5; r++) c.fillRect(x0, -500 + r * 90, x1 - x0, 12); repeatX(x0, x1, 140, (i, x) => { c.fillStyle = '#5a4028'; c.beginPath(); c.arc(x + 70, -470, 40, Math.PI, 0); c.fill(); }); const hype = A.hype || 0; for (let r = 0; r < 4; r++) repeatX(x0, x1, 18, (i, x) => { const bob = Math.sin(t * (6 + hype * 10) + i * 1.3 + r) * (2 + hype * 8); circle(c, x + 9, -470 + r * 90 + 60 + bob, 7, ['#c88', '#8ac', '#cc8', '#8c8', '#c8c'][(i + r) % 5]); }); } },
    ],
    update(dt, A) { A.hype = Math.max(0, A.hype - dt * 0.3); },
    ground(c, x0, x1) { c.fillStyle = '#c8a870'; c.fillRect(x0, 0, x1 - x0, 600); c.fillStyle = 'rgba(0,0,0,0.08)'; repeatX(x0, x1, 50, (i, x) => ellipse(c, x, 30 + hash(i, 2) * 30, 20, 5, 'rgba(120,90,50,0.3)')); },
  },
  {
    id: 'void', name: 'THE VOID', desc: 'Vex\'s domain. A singularity pulls everything toward the center.', width: 2600, music: 'void',
    sw: [60, 110], sh: [100, 260], gap: [80, 200], debris: ['#1a0a2a', '#b36bff'], gravity: 0.85, friction: 1, struct: (c, b, t) => STRUCTS.void(c, b, t), pull: true,
    sky(c, t) { skyFill(c, ['#020004', '#0c0418', '#1a0a2a']); starsScreen(c, t, 80, 0.6); drawBlackHole(c, W / 2 - (Cam.x - 1300) * 0.02, 170, 60, t); },
    layers: [{ p: 0.3, draw(c, x0, x1, t) { repeatX(x0, x1, 300, (i, x) => { c.save(); c.translate(x, -300 - hash(i, 2) * 200 + Math.sin(t + i) * 20); c.rotate(t * 0.2 + i); c.fillStyle = '#1c1a34'; c.fillRect(-30, -40, 60, 80); c.fillStyle = 'rgba(255,214,120,0.4)'; c.fillRect(-20, -30, 10, 12); c.restore(); }); } }],
    update(dt, A) { if (!Game.battle) return; for (const f of Game.battle.all()) if (f.hp > 0 && !f.frozen) f.x += Math.sign(A.stage.width / 2 - f.x) * 40 * dt; },
    ground(c, x0, x1, t) { c.fillStyle = '#0a0614'; c.fillRect(x0, 0, x1 - x0, 600); c.strokeStyle = `rgba(179,107,255,${0.4 + 0.2 * Math.sin(t * 2)})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, 2); c.lineTo(x1, 2); c.stroke(); },
    weather(dt, fx) { const [a, b] = Cam.viewX(); if (Math.random() < dt * 20) { const x = rand(a, b), y = -rand(0, 500); fx.add({ x, y, vx: (1300 - x) * 0.3, vy: (-600 - y) * 0.2, life: 2, size: rand(1, 3), color: '#b36bff', glow: true }); } },
  },
  {
    id: 'jungle', name: 'JUNGLE RUINS', desc: 'Rain-soaked ruins. Healing fruit falls from the canopy; grab it first.', width: 2600, music: 'jungle',
    sw: [80, 140], sh: [120, 260], gap: [60, 150], debris: ['#556644', '#2a4a1a'], gravity: 1, friction: 1, struct: (c, b) => STRUCTS.ruin(c, b),
    hazardEvery: [15, 20], hazard(A) { Game.announce('FRUIT DROP!', '#7dff6a'); Combat.addHazard({ kind: 'pickup', x: Cam.x + rand(-400, 400), y: -700, vy: 0, t: 0, heal: 90, owner: WORLD_SRC, life: 10 }); },
    sky(c) { skyFill(c, ['#1a3a2a', '#2a5a3a', '#4a7a4a']); },
    layers: [
      { p: 0.15, draw(c, x0, x1) { mountains(c, x0, x1, 0, 300, 120, '#1a3a24', 2); } },
      { p: 0.45, draw(c, x0, x1, t) { repeatX(x0, x1, 150, (i, x) => { c.fillStyle = '#3a2a1a'; c.fillRect(x, -500, 16, 500); c.fillStyle = hexA('#2a6a2a', 0.9); for (let k = 0; k < 4; k++) ellipse(c, x + 8 + Math.cos(k) * 40, -500 + Math.sin(k) * 20, 60, 20, '#2a6a2a'); c.strokeStyle = '#2a5a1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 8, -480); c.quadraticCurveTo(x + 30 + Math.sin(t + i) * 10, -300, x + 20, -150); c.stroke(); }); } },
    ],
    ground(c, x0, x1) { c.fillStyle = '#3a2e1e'; c.fillRect(x0, 0, x1 - x0, 600); c.fillStyle = '#3a6a2a'; c.fillRect(x0, 0, x1 - x0, 8); repeatX(x0, x1, 40, (i, x) => { c.fillStyle = '#4a8a3a'; c.beginPath(); c.moveTo(x, 2); c.lineTo(x + 6, -12 - hash(i, 2) * 10); c.lineTo(x + 12, 2); c.fill(); }); },
    weather(dt, fx) { const [a, b] = Cam.viewX(); for (let i = 0; i < 5; i++) if (Math.random() < dt * 60) fx.add({ x: rand(a, b + 100), y: Cam.y - H / 2 / Cam.z, vx: -80, vy: 1000, life: 1, size: 1.4, color: 'rgba(170,210,255,0.45)' }); },
  },
  {
    id: 'desert', name: 'DESERT TOMB', desc: 'Ancient sands. Sandstorms roll through and blur everything.', width: 2800, music: 'desert',
    sw: [90, 160], sh: [120, 260], gap: [80, 180], debris: ['#c8a060', '#a08050'], gravity: 1, friction: 1, struct: (c, b) => STRUCTS.pillar(c, b),
    hazardEvery: [16, 20], hazard(A) { A.storm = 5; Game.announce('SANDSTORM!', '#e8c080'); },
    update(dt, A, fx) { if (A.storm > 0) { A.storm -= dt; const [a, b] = Cam.viewX(); for (let i = 0; i < 6; i++) fx.add({ x: a, y: -rand(0, 700), vx: rand(900, 1300), vy: rand(-30, 30), life: 2, size: rand(2, 5), color: 'rgba(220,180,120,0.6)' }); } },
    sky(c) { skyFill(c, ['#e8a050', '#f0c890', '#f8e0b0']); circle(c, W * 0.7, 120, 50, '#fff8e0'); },
    layers: [
      { p: 0.12, draw(c, x0, x1) { repeatX(x0, x1, 900, (i, x) => { c.fillStyle = '#c89050'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 260, -360); c.lineTo(x + 520, 0); c.fill(); c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.moveTo(x + 260, -360); c.lineTo(x + 520, 0); c.lineTo(x + 330, 0); c.fill(); }); } },
      { p: 0.4, draw(c, x0, x1) { c.fillStyle = '#d8a860'; c.beginPath(); c.moveTo(x0, 0); repeatX(x0, x1 + 200, 200, (i, x) => c.quadraticCurveTo(x - 100, -80 - hash(i, 7) * 60, x, -20)); c.lineTo(x1 + 200, 400); c.lineTo(x0, 400); c.fill(); } },
    ],
    ground(c, x0, x1) { c.fillStyle = '#e0b870'; c.fillRect(x0, 0, x1 - x0, 600); c.strokeStyle = 'rgba(160,120,60,0.3)'; c.lineWidth = 2; repeatX(x0, x1, 80, (i, x) => { c.beginPath(); c.moveTo(x, 30); c.quadraticCurveTo(x + 40, 20, x + 80, 30); c.stroke(); }); },
    front(c, t, A) { if (A.storm > 0) { c.fillStyle = `rgba(210,170,110,${Math.min(0.45, A.storm * 0.2)})`; c.fillRect(0, 0, W, H); } },
  },
];
const stageById = id => STAGES.find(s => s.id === id);
