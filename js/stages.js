// ============================================================
//  MOONKAI — stages: scenery, destructible structures, physics, hazards
// ============================================================
const WORLD_SRC = { x: 0, y: 0, world: true, def: { color: '#ff8a1a', name: 'THE STAGE' }, facing: 1 };

const Arena = {
  stage: null, structs: [], damage: 0, destroyed: 0, boomCd: 0, hazT: 0, wind: 0, windT: 0, fx2: null,
  load(stage) {
    this.stage = stage; this.damage = 0; this.destroyed = 0; this.hazT = stage.hazardEvery ? rand(6, 9) : 0; this.wind = 0; this.windT = 0;
    this.structs = [];
    let x = -10;
    while (x < W + 10) {
      const w = rand(stage.sw[0], stage.sw[1]), h = rand(stage.sh[0], stage.sh[1]);
      const cols = Math.max(1, Math.floor((w - 12) / 14)), rows = Math.floor((h - 16) / 20);
      this.structs.push({ x, w, h, maxH: h, hp: h * 0.55, dead: false, rubble: rand(16, 40), cols, rows, lit: Array.from({ length: cols * rows }, () => Math.random() < 0.45), tone: randi(0, 3), crack: 0, burn: 0, seed: Math.random() });
      x += w + rand(stage.gap[0], stage.gap[1]);
    }
    stage.init && stage.init(this);
  },
  hit(x0, x1, y, amt, fx) {
    if (x0 > x1) [x0, x1] = [x1, x0];
    for (const b of this.structs) {
      if (b.dead || b.x + b.w < x0 || b.x > x1 || y < GROUND - b.h - 10) continue;
      b.hp -= amt; b.crack = Math.min(1, b.crack + amt / (b.maxH * 0.5));
      if (Math.random() < 0.25) fx.burst(clamp((x0 + x1) / 2, b.x, b.x + b.w), Math.max(y, GROUND - b.h), 3, { color: this.stage.debris, size: 5, speed: 160, g: 600, life: 0.9, shape: 'rect' });
      if (b.hp <= 0) this.collapse(b, fx);
    }
  },
  collapse(b, fx) {
    if (b.dead) return;
    b.dead = true; b.burn = 1; this.destroyed++;
    this.damage += b.w * b.maxH * 0.0021;
    if (this.boomCd <= 0) { Sfx.boom(); this.boomCd = 0.15; }
    Game.shake = Math.max(Game.shake, 10);
    fx.burst(b.x + b.w / 2, GROUND - b.h / 2, 26, { color: ['#ffae3b', '#ff6a1a', '#ffe28a'], size: 14, speed: 380, life: 0.9, glow: true, drag: 0.04 });
  },
  destroyAll(filter, fx) {
    let i = 0;
    for (const b of this.structs) if (!b.dead && filter(b)) { const d = (i++) * 0.07; Game.later(d, () => this.collapse(b, fx)); }
  },
  update(dt, fx) {
    this.boomCd -= dt;
    for (const b of this.structs) {
      if (!b.dead) continue;
      if (b.h > b.rubble) {
        b.h = Math.max(b.rubble, b.h - dt * 170);
        if (Math.random() < 0.6) fx.add({ x: rand(b.x, b.x + b.w), y: GROUND - b.h, vx: rand(-40, 40), vy: rand(-80, -20), life: rand(0.8, 1.5), size: rand(10, 22), color: 'rgba(120,110,100,0.45)', grow: 18 });
      }
      if (Math.random() < dt * 10 * b.burn) fx.add({ x: rand(b.x + 6, b.x + b.w - 6), y: GROUND - b.h + rand(0, 10), vx: rand(-15, 15), vy: rand(-110, -50), life: rand(0.4, 0.9), size: rand(5, 11), color: pick(['#ff8a1a', '#ffcc33', '#ff4a1a']), glow: true, grow: -6 });
    }
    const st = this.stage;
    if (st.hazardEvery && Game.state === 'fight' && !Game.roundOver) {
      this.hazT -= dt;
      if (this.hazT <= 0) { this.hazT = rand(st.hazardEvery[0], st.hazardEvery[1]); st.hazard(this, fx); }
    }
    if (this.windT > 0) { this.windT -= dt; if (this.windT <= 0) this.wind = 0; }
    st.update && st.update(dt, this, fx);
  },
  draw(c, t) {
    const st = this.stage;
    st.bg(c, t, this);
    for (const b of this.structs) st.struct(c, b, t);
    st.ground(c, t, this);
  },
  drawFront(c, t) { this.stage.front && this.stage.front(c, t, this); },
};

// ---------- structure styles ----------
function drawTowerStruct(c, b) {
  const tones = ['#2b2a4a', '#312c52', '#26324d', '#2e2640'];
  const top = GROUND - b.h;
  c.fillStyle = tones[b.tone];
  if (!b.dead) {
    c.fillRect(b.x, top, b.w, b.h);
    c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(b.x, top, 5, b.h);
    c.fillStyle = '#1b1a30'; c.fillRect(b.x - 3, top - 6, b.w + 6, 8);
    if (b.seed < 0.3) { c.fillRect(b.x + b.w / 2 - 1, top - 34, 3, 30); circle(c, b.x + b.w / 2, top - 35, 3, '#ff3b3b'); }
  } else rubbleTop(c, b, top);
  const vis = Math.floor((b.h - 16) / 20);
  for (let r = 0; r < Math.min(b.rows, vis); r++) for (let k = 0; k < b.cols; k++) {
    c.fillStyle = b.lit[r * b.cols + k] && !b.dead ? 'rgba(255,214,120,0.85)' : 'rgba(10,12,30,0.8)';
    c.fillRect(b.x + 8 + k * 14, GROUND - 22 - r * 20, 7, 10);
  }
  crackAndBurn(c, b, top);
}
function rubbleTop(c, b, top) {
  c.beginPath(); c.moveTo(b.x, GROUND); c.lineTo(b.x, top + 10);
  for (let i = 1; i <= 6; i++) c.lineTo(b.x + b.w * i / 6, top + ((i * 37) % 17) - (i % 2) * 12);
  c.lineTo(b.x + b.w, GROUND); c.fill();
}
function crackAndBurn(c, b, top) {
  if (b.crack > 0.2 && !b.dead) {
    c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(b.x + b.w * 0.3, top + 10); c.lineTo(b.x + b.w * 0.5, top + b.h * 0.3 * b.crack); c.lineTo(b.x + b.w * 0.4, top + b.h * 0.6 * b.crack); c.stroke();
  }
  if (b.dead && b.burn) glowCircle(c, b.x + b.w / 2, top, b.w * 0.8, 'rgba(255,110,30,0.3)', 'rgba(255,60,0,0)');
}
function drawContainerStruct(c, b) {
  const cols = ['#b8452f', '#2f6db8', '#d19a2a', '#3a8a4a'];
  const top = GROUND - b.h, n = Math.max(1, Math.floor(b.h / 42));
  for (let i = 0; i < n; i++) {
    const y = GROUND - (i + 1) * 42, col = cols[(b.tone + i) % 4];
    if (y < top - 1) break;
    c.fillStyle = shadeHex(col, -0.25); c.fillRect(b.x, y, b.w, 40);
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2;
    for (let x = b.x + 6; x < b.x + b.w; x += 8) { c.beginPath(); c.moveTo(x, y + 3); c.lineTo(x, y + 37); c.stroke(); }
    c.strokeStyle = 'rgba(0,0,0,0.6)'; c.strokeRect(b.x, y, b.w, 40);
  }
  if (b.dead) { c.fillStyle = '#3a2a22'; rubbleTop(c, b, top); }
  crackAndBurn(c, b, top);
}
function drawSpireStruct(c, b, t) {
  const top = GROUND - b.h;
  c.fillStyle = b.tone % 2 ? '#1c1414' : '#241a18';
  c.beginPath(); c.moveTo(b.x, GROUND); c.lineTo(b.x + b.w * 0.2, top + 20); c.lineTo(b.x + b.w * 0.45, top); c.lineTo(b.x + b.w * 0.7, top + 30); c.lineTo(b.x + b.w, GROUND); c.fill();
  c.strokeStyle = `rgba(255,${90 + Math.sin(t * 3 + b.seed * 9) * 40},20,0.8)`; c.lineWidth = 2;
  c.beginPath(); c.moveTo(b.x + b.w * 0.45, top + 20); c.lineTo(b.x + b.w * 0.4, top + b.h * 0.5); c.lineTo(b.x + b.w * 0.55, GROUND - 10); c.stroke();
  crackAndBurn(c, b, top);
}
function drawIceStruct(c, b, t) {
  const top = GROUND - b.h;
  const g = c.createLinearGradient(b.x, top, b.x + b.w, GROUND);
  g.addColorStop(0, 'rgba(210,245,255,0.85)'); g.addColorStop(1, 'rgba(90,150,210,0.75)');
  c.fillStyle = g;
  c.beginPath(); c.moveTo(b.x + 4, GROUND); c.lineTo(b.x + b.w * 0.15, top + 30); c.lineTo(b.x + b.w * 0.5, top); c.lineTo(b.x + b.w * 0.85, top + 24); c.lineTo(b.x + b.w - 4, GROUND); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(b.x + b.w * 0.5, top + 6); c.lineTo(b.x + b.w * 0.42, GROUND - 20); c.stroke();
  if (b.crack > 0.2 && !b.dead) { c.strokeStyle = 'rgba(40,80,120,0.7)'; c.beginPath(); c.moveTo(b.x + b.w * 0.3, top + 40); c.lineTo(b.x + b.w * 0.6, top + b.h * 0.5 * b.crack); c.stroke(); }
}
function drawHabitatStruct(c, b) {
  const top = GROUND - b.h;
  c.fillStyle = b.tone % 2 ? '#c9ccd4' : '#aeb3bd';
  if (!b.dead) {
    c.fillRect(b.x, top + b.w * 0.25, b.w, b.h - b.w * 0.25);
    c.beginPath(); c.ellipse(b.x + b.w / 2, top + b.w * 0.25, b.w / 2, b.w * 0.25, 0, Math.PI, Math.PI * 2); c.fill();
    c.fillStyle = '#e04040'; c.fillRect(b.x, top + b.w * 0.25 + 10, b.w, 5);
    for (let y = top + b.w * 0.25 + 30; y < GROUND - 20; y += 36) for (let x = b.x + 14; x < b.x + b.w - 10; x += 26) circle(c, x, y, 6, 'rgba(120,220,255,0.8)');
  } else { c.fillStyle = '#8a8e96'; rubbleTop(c, b, top); }
  crackAndBurn(c, b, top);
}
function drawColumnStruct(c, b) {
  const top = GROUND - b.h, cx = b.x + b.w / 2, cw = Math.min(b.w * 0.5, 46);
  c.fillStyle = '#e9e2d0';
  c.fillRect(cx - cw / 2, top + 14, cw, b.h - 14);
  c.strokeStyle = 'rgba(120,110,90,0.5)'; c.lineWidth = 2;
  for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(cx - cw / 2 + i * cw / 4, top + 16); c.lineTo(cx - cw / 2 + i * cw / 4, GROUND - 8); c.stroke(); }
  c.fillStyle = '#d8cfb8';
  if (!b.dead) { c.fillRect(cx - cw / 2 - 8, top, cw + 16, 14); c.fillRect(cx - cw / 2 - 12, top - 6, cw + 24, 7); }
  else { c.fillStyle = '#b8ae96'; c.beginPath(); c.moveTo(cx - cw / 2, top + 14); c.lineTo(cx, top); c.lineTo(cx + cw / 2, top + 20); c.fill(); }
  c.fillRect(cx - cw / 2 - 8, GROUND - 10, cw + 16, 10);
  if (b.crack > 0.2 && !b.dead) { c.strokeStyle = 'rgba(60,50,40,0.7)'; c.beginPath(); c.moveTo(cx - 6, top + 30); c.lineTo(cx + 6, top + b.h * 0.6 * b.crack); c.stroke(); }
}

// ---------- hazards ----------
function fallingRocks(n, look) {
  return (A) => {
    Game.showBanner(look.warn, look.color, 1.3, 60);
    for (let i = 0; i < n; i++) {
      const x = rand(80, W - 80), d = 0.9 + i * 0.35;
      Game.hazards.push({ kind: 'fall', x, t: 0, delay: d, owner: WORLD_SRC, done: false, look, y: -60 });
    }
  };
}

// ---------- stages ----------
const STAGES = [
  {
    id: 'metro', name: 'METRO NIGHT', desc: 'Neon towers under the moon. Everything breaks.',
    sw: [70, 140], sh: [150, 360], gap: [6, 22], debris: ['#888', '#aaa', '#665'], gravity: 1, friction: 1,
    bg(c, t) {
      const full = [Game.p1, Game.p2].some(f => f && f.id === 'eric' && f.form);
      City.drawSky(c, t, { fullMoon: full }); City.drawFar(c);
      // searchlights
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) {
        const a = -Math.PI / 2 + Math.sin(t * 0.4 + i * 2) * 0.5, x = 300 + i * 700;
        c.fillStyle = 'rgba(160,190,255,0.06)'; c.beginPath(); c.moveTo(x, GROUND - 200);
        c.lineTo(x + Math.cos(a - 0.05) * 800, GROUND - 200 + Math.sin(a - 0.05) * 800); c.lineTo(x + Math.cos(a + 0.05) * 800, GROUND - 200 + Math.sin(a + 0.05) * 800); c.fill();
      }
      c.globalCompositeOperation = 'source-over';
    },
    struct: drawTowerStruct,
    ground(c) {
      c.fillStyle = '#2a2a33'; c.fillRect(0, GROUND, W, H - GROUND);
      c.fillStyle = '#3b3b48'; c.fillRect(0, GROUND, W, 10);
      c.fillStyle = '#d9c24a'; for (let x = 0; x < W; x += 80) c.fillRect(x + 10, GROUND + 52, 44, 5);
    },
  },
  {
    id: 'harbor', name: 'SUNSET HARBOR', desc: 'Shipping docks at golden hour. Stacked containers make great projectiles… and cover.',
    sw: [60, 110], sh: [84, 250], gap: [20, 60], debris: ['#b8452f', '#2f6db8', '#d19a2a'], gravity: 1, friction: 1,
    init(A) { A.ship = -300; },
    update(dt, A) { A.ship += dt * 14; if (A.ship > W + 300) A.ship = -400; },
    bg(c, t, A) {
      const g = c.createLinearGradient(0, 0, 0, 440);
      g.addColorStop(0, '#2a1a4a'); g.addColorStop(0.45, '#c8506a'); g.addColorStop(1, '#ffb45a');
      c.fillStyle = g; c.fillRect(0, 0, W, 440);
      glowCircle(c, 820, 430, 260, 'rgba(255,200,120,0.5)', 'rgba(255,120,60,0)');
      c.save(); c.beginPath(); c.rect(0, 0, W, 432); c.clip(); circle(c, 820, 430, 80, '#ffe2a0'); c.restore();
      for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(255,190,170,0.25)'; const cx = ((i * 300 + t * 8) % (W + 400)) - 200; ellipse(c, cx, 120 + i * 30, 120, 12, 'rgba(255,200,190,0.2)'); }
      const sea = c.createLinearGradient(0, 432, 0, GROUND); sea.addColorStop(0, '#6a3a6a'); sea.addColorStop(1, '#1a2040');
      c.fillStyle = sea; c.fillRect(0, 432, W, GROUND - 432);
      c.fillStyle = 'rgba(255,210,140,0.5)';
      for (let y = 440; y < GROUND; y += 10) { const w = 80 - (y - 440) * 0.2; c.fillRect(820 - w / 2 + Math.sin(t * 2 + y) * 8, y, w, 2); }
      // ship
      c.fillStyle = '#1a1020'; c.fillRect(A.ship, 400, 260, 26); c.fillRect(A.ship + 180, 370, 50, 30);
      for (let i = 0; i < 5; i++) c.fillRect(A.ship + 20 + i * 30, 384, 26, 16);
      // cranes
      c.strokeStyle = '#2a1a2a'; c.lineWidth = 6;
      for (const x of [140, 1100]) { c.beginPath(); c.moveTo(x, 440); c.lineTo(x, 200); c.lineTo(x + 150, 200); c.moveTo(x, 240); c.lineTo(x + 60, 200); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(x + 120, 200); c.lineTo(x + 120, 280 + Math.sin(t) * 10); c.stroke(); c.lineWidth = 6; }
      // gulls
      c.strokeStyle = '#2a1a2a'; c.lineWidth = 2;
      for (let i = 0; i < 4; i++) { const x = ((t * 40 + i * 330) % (W + 100)) - 50, y = 150 + i * 40 + Math.sin(t * 2 + i) * 10, f = Math.sin(t * 8 + i) * 5; c.beginPath(); c.moveTo(x - 10, y - f); c.lineTo(x, y); c.lineTo(x + 10, y - f); c.stroke(); }
    },
    struct: drawContainerStruct,
    ground(c) {
      c.fillStyle = '#5a3e2a'; c.fillRect(0, GROUND, W, H - GROUND);
      c.strokeStyle = '#3a2618'; c.lineWidth = 2;
      for (let x = 0; x < W; x += 36) { c.beginPath(); c.moveTo(x, GROUND); c.lineTo(x, H); c.stroke(); }
      c.fillStyle = '#7a5a3a'; c.fillRect(0, GROUND, W, 6);
      c.fillStyle = '#e8c040'; for (let x = 20; x < W; x += 160) c.fillRect(x, GROUND + 2, 60, 4);
    },
  },
  {
    id: 'magma', name: 'MAGMA RIFT', desc: 'An active volcano. Watch the sky — eruptions rain molten rock on everyone.',
    sw: [50, 100], sh: [100, 300], gap: [30, 80], debris: ['#2a1a18', '#553', '#ff6a1a'], gravity: 1, friction: 1,
    hazardEvery: [12, 16], hazard: fallingRocks(6, { warn: 'ERUPTION!', color: '#ff6a1a', rock: '#3a2218', glow: '#ff6a1a' }),
    bg(c, t) {
      const g = c.createLinearGradient(0, 0, 0, GROUND);
      g.addColorStop(0, '#140606'); g.addColorStop(0.6, '#4a100a'); g.addColorStop(1, '#8a2a0a');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      // volcano
      c.fillStyle = '#1a0c0a'; c.beginPath(); c.moveTo(200, 520); c.lineTo(560, 170); c.lineTo(700, 170); c.lineTo(1080, 520); c.fill();
      glowCircle(c, 630, 170, 140 + Math.sin(t * 3) * 10, 'rgba(255,120,30,0.6)', 'rgba(255,40,0,0)');
      c.strokeStyle = 'rgba(255,110,20,0.8)'; c.lineWidth = 4;
      c.beginPath(); c.moveTo(620, 175); c.quadraticCurveTo(600, 300, 560, 400); c.quadraticCurveTo(540, 460, 520, 520); c.stroke();
      for (let i = 0; i < 4; i++) { const y = 150 - ((t * 30 + i * 60) % 240); ellipse(c, 630 + Math.sin(t + i) * 30 + i * 10, y, 60 + (150 - y) * 0.3, 30 + (150 - y) * 0.1, 'rgba(40,30,30,0.35)'); }
      // lava river
      const lg = c.createLinearGradient(0, 540, 0, 600); lg.addColorStop(0, '#ffcc40'); lg.addColorStop(1, '#ff3a0a');
      c.fillStyle = lg; c.fillRect(0, 540, W, 60);
      c.fillStyle = 'rgba(80,20,10,0.5)'; for (let i = 0; i < 12; i++) { const x = ((i * 130 + t * 30) % (W + 100)) - 50; ellipse(c, x, 560 + (i % 3) * 12, 40, 5, 'rgba(90,20,5,0.5)'); }
    },
    struct: drawSpireStruct,
    ground(c, t) {
      c.fillStyle = '#16100e'; c.fillRect(0, GROUND, W, H - GROUND);
      c.strokeStyle = `rgba(255,${100 + Math.sin(t * 2) * 40},20,0.8)`; c.lineWidth = 3;
      for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(i * 170, GROUND + 10); c.lineTo(i * 170 + 40, GROUND + 40); c.lineTo(i * 170 + 20, GROUND + 90); c.stroke(); }
    },
    front(c, t) { if (Math.random() < 0.5) Game.fx.add({ x: rand(0, W), y: GROUND, vx: rand(-10, 10), vy: rand(-80, -30), life: 1.5, size: rand(1.5, 3), color: '#ff8a3a', glow: true }); },
  },
  {
    id: 'frost', name: 'FROSTPEAK CITADEL', desc: 'A fortress on a glacier under the aurora. The floor is ice — momentum carries.',
    sw: [50, 90], sh: [110, 280], gap: [30, 80], debris: ['#dff', '#9cf', '#fff'], gravity: 1, friction: 0.25,
    bg(c, t) {
      const g = c.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, '#040a1e'); g.addColorStop(1, '#2a4a6a');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (const [x, y, r, p] of City.stars) { c.globalAlpha = 0.4 + 0.4 * Math.sin(t * 2 + p); c.fillStyle = '#fff'; c.fillRect(x, y, r, r); } c.globalAlpha = 1;
      c.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) {
        c.fillStyle = k === 1 ? 'rgba(170,80,255,0.08)' : 'rgba(60,255,160,0.09)';
        c.beginPath(); c.moveTo(0, 200);
        for (let x = 0; x <= W; x += 40) c.lineTo(x, 120 + k * 40 + Math.sin(x * 0.006 + t * 0.6 + k) * 40);
        for (let x = W; x >= 0; x -= 40) c.lineTo(x, 220 + k * 40 + Math.sin(x * 0.006 + t * 0.6 + k + 1) * 30);
        c.fill();
      }
      c.globalCompositeOperation = 'source-over';
      for (const [col, base, amp] of [['#3a5a7a', 470, 200], ['#2a4058', 520, 150]]) {
        c.fillStyle = col; c.beginPath(); c.moveTo(0, GROUND);
        for (let x = 0; x <= W; x += 80) c.lineTo(x, base - Math.abs(Math.sin(x * 0.004 + base)) * amp);
        c.lineTo(W, GROUND); c.fill();
      }
      // citadel
      c.fillStyle = '#1a2a3a';
      c.fillRect(560, 300, 160, 220); c.fillRect(530, 260, 40, 260); c.fillRect(710, 260, 40, 260);
      for (const x of [530, 710]) { c.beginPath(); c.moveTo(x - 6, 262); c.lineTo(x + 20, 210); c.lineTo(x + 46, 262); c.fill(); }
      c.fillStyle = 'rgba(120,220,255,0.8)'; for (let i = 0; i < 3; i++) c.fillRect(600 + i * 34, 360, 12, 22);
    },
    struct: drawIceStruct,
    ground(c) {
      const g = c.createLinearGradient(0, GROUND, 0, H); g.addColorStop(0, '#dff4ff'); g.addColorStop(1, '#8ab8d8');
      c.fillStyle = g; c.fillRect(0, GROUND, W, H - GROUND);
      c.fillStyle = 'rgba(255,255,255,0.6)'; for (let x = 0; x < W; x += 120) c.fillRect(x + 20, GROUND + 30, 70, 2);
    },
    front() { if (Math.random() < 0.8) Game.fx.add({ x: rand(-100, W), y: -10, vx: rand(20, 60), vy: rand(50, 110), life: 8, size: rand(1.5, 3.5), color: '#fff' }); },
  },
  {
    id: 'lunar', name: 'LUNAR STATION', desc: 'On the Moon itself. Low gravity for huge jumps; meteor showers strike without warning.',
    sw: [70, 120], sh: [90, 220], gap: [30, 70], debris: ['#aaa', '#ccc', '#e04040'], gravity: 0.55, friction: 1,
    hazardEvery: [14, 18], hazard: fallingRocks(7, { warn: 'METEOR SHOWER!', color: '#9cf', rock: '#555', glow: '#9cf' }),
    bg(c, t) {
      c.fillStyle = '#02030a'; c.fillRect(0, 0, W, H);
      for (const [x, y, r, p] of City.stars) { c.globalAlpha = 0.7; c.fillStyle = '#fff'; c.fillRect(x, y * 1.2, r, r); } c.globalAlpha = 1;
      // Earth
      glowCircle(c, 260, 170, 150, 'rgba(90,160,255,0.4)', 'rgba(90,160,255,0)');
      circle(c, 260, 170, 90, '#2a6ad8');
      c.save(); c.beginPath(); c.arc(260, 170, 90, 0, Math.PI * 2); c.clip();
      c.fillStyle = '#3aa050'; for (const [x, y, r] of [[230, 140, 34], [300, 200, 26], [280, 120, 18], [210, 210, 20]]) { c.beginPath(); c.ellipse(x + Math.sin(t * 0.1) * 6, y, r, r * 0.7, 0.4, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 4; i++) ellipse(c, 200 + i * 40 + ((t * 5) % 40), 130 + i * 25, 30, 6, 'rgba(255,255,255,0.45)');
      c.fillStyle = 'rgba(0,0,20,0.55)'; c.beginPath(); c.arc(300, 190, 100, 0, Math.PI * 2); c.fill();
      c.restore();
      c.fillStyle = '#5a5a62'; c.beginPath(); c.moveTo(0, 520);
      for (let x = 0; x <= W; x += 60) c.lineTo(x, 500 - Math.abs(Math.sin(x * 0.01)) * 60); c.lineTo(W, GROUND); c.lineTo(0, GROUND); c.fill();
    },
    struct: drawHabitatStruct,
    ground(c) {
      c.fillStyle = '#8a8a90'; c.fillRect(0, GROUND, W, H - GROUND);
      for (const [x, r] of [[120, 30], [420, 20], [760, 36], [1100, 24]]) { ellipse(c, x, GROUND + 40, r, r * 0.3, '#6a6a70'); ellipse(c, x, GROUND + 38, r * 0.8, r * 0.2, '#5a5a60'); }
    },
  },
  {
    id: 'sky', name: 'SKY TEMPLE', desc: 'Ancient ruins above the clouds at dawn. Sudden wind gusts shove fighters across the arena.',
    sw: [70, 120], sh: [140, 320], gap: [40, 90], debris: ['#e9e2d0', '#b8ae96'], gravity: 0.9, friction: 1,
    hazardEvery: [10, 14], hazard(A) { A.wind = Math.random() < 0.5 ? -1 : 1; A.windT = 3; Game.showBanner(A.wind > 0 ? 'GUST  ►►►' : '◄◄◄  GUST', '#dff', 1.3, 60); Sfx.whoosh(); },
    update(dt, A, fx) {
      if (A.wind) for (let i = 0; i < 3; i++) fx.add({ x: A.wind > 0 ? -10 : W + 10, y: rand(100, GROUND), vx: A.wind * rand(600, 900), vy: 0, life: 1.6, size: rand(1, 2.5), color: 'rgba(255,255,255,0.8)' });
    },
    bg(c, t) {
      const g = c.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, '#6a8ad8'); g.addColorStop(0.55, '#f0a0b0'); g.addColorStop(1, '#ffd8a0');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      glowCircle(c, 980, 380, 240, 'rgba(255,240,200,0.7)', 'rgba(255,200,150,0)');
      circle(c, 980, 380, 55, '#fff6e0');
      for (let i = 0; i < 3; i++) {
        const x = ((i * 460 + t * (6 + i * 3)) % (W + 400)) - 200, y = 170 + i * 70;
        c.fillStyle = '#7a8a9a'; c.beginPath(); c.moveTo(x - 70, y); c.lineTo(x + 70, y); c.lineTo(x + 20, y + 60); c.lineTo(x - 30, y + 50); c.fill();
        c.fillStyle = '#5a9a5a'; c.fillRect(x - 70, y - 6, 140, 8);
        c.fillStyle = '#e9e2d0'; c.fillRect(x - 30, y - 50, 10, 44); c.fillRect(x + 10, y - 50, 10, 44); c.fillRect(x - 36, y - 56, 62, 8);
      }
      for (let k = 0; k < 2; k++) for (let i = 0; i < 7; i++) {
        const x = ((i * 220 + t * (10 + k * 14)) % (W + 300)) - 150;
        ellipse(c, x, 520 + k * 40, 130, 34, k ? 'rgba(255,255,255,0.85)' : 'rgba(255,235,240,0.7)');
      }
    },
    struct: drawColumnStruct,
    ground(c) {
      c.fillStyle = '#e4dccb'; c.fillRect(0, GROUND, W, H - GROUND);
      c.strokeStyle = 'rgba(120,110,90,0.4)'; c.lineWidth = 2;
      for (let x = 0; x < W; x += 90) { c.beginPath(); c.moveTo(x, GROUND); c.lineTo(x - 30, H); c.stroke(); }
      c.fillStyle = '#c9b88a'; c.fillRect(0, GROUND, W, 8);
    },
  },
];
