// ============================================================
//  MOONKAI — the destructible city
// ============================================================
const City = {
  far: [], near: [], stars: [], damage: 0, destroyed: 0, boomCd: 0,

  makeBuilding(x, w, h, near) {
    const cols = Math.max(1, Math.floor((w - 12) / 14));
    const rows = Math.floor((h - 16) / 20);
    const lit = [];
    for (let i = 0; i < cols * rows; i++) lit.push(Math.random() < 0.45);
    const tone = randi(0, 2);
    return {
      x, w, h, maxH: h, hp: near ? h * 0.5 : Infinity, dead: false, rubble: rand(18, 50),
      cols, rows, lit, burn: 0, tone, antenna: Math.random() < 0.3, crack: 0,
    };
  },

  generate() {
    this.far = []; this.near = []; this.stars = [];
    this.damage = 0; this.destroyed = 0;
    let x = -30;
    while (x < W + 30) { const w = rand(50, 110); this.far.push(this.makeBuilding(x, w, rand(200, 420), false)); x += w + rand(0, 6); }
    x = -20;
    while (x < W + 20) { const w = rand(70, 140); this.near.push(this.makeBuilding(x, w, rand(150, 360), true)); x += w + rand(6, 22); }
    for (let i = 0; i < 140; i++) this.stars.push([rand(0, W), rand(0, 420), rand(0.5, 1.8), rand(0, 6)]);
  },

  // damage any near buildings overlapping [x0,x1] whose body reaches height y
  hit(x0, x1, y, amt, fx) {
    if (x0 > x1) [x0, x1] = [x1, x0];
    for (const b of this.near) {
      if (b.dead || b.x + b.w < x0 || b.x > x1) continue;
      if (y < GROUND - b.h - 10) continue;
      b.hp -= amt; b.crack = Math.min(1, b.crack + amt / (b.maxH * 0.5));
      if (Math.random() < 0.3) fx.burst(clamp((x0 + x1) / 2, b.x, b.x + b.w), Math.max(y, GROUND - b.h), 3, { color: ['#888', '#aaa', '#665'], size: 5, speed: 160, g: 600, life: 0.9, shape: 'rect' });
      if (b.hp <= 0) this.collapse(b, fx);
    }
  },
  collapse(b, fx) {
    if (b.dead) return;
    b.dead = true; b.burn = 1;
    this.destroyed++;
    this.damage += (b.w * b.maxH) * 0.0021; // in $ billions — very scientific
    if (this.boomCd <= 0) { Sfx.boom(); this.boomCd = 0.15; }
    Game.shake = Math.max(Game.shake, 10);
    fx.burst(b.x + b.w / 2, GROUND - b.h / 2, 26, { color: ['#ffae3b', '#ff6a1a', '#ffe28a'], size: 14, speed: 380, life: 0.9, glow: true, drag: 0.04 });
  },
  destroyAll(filter, fx, stagger = false) {
    let i = 0;
    for (const b of this.near) if (!b.dead && filter(b)) {
      if (stagger) setTimeout(() => this.collapse(b, fx), (i++) * 70);
      else this.collapse(b, fx);
    }
  },

  update(dt, fx) {
    this.boomCd -= dt;
    for (const b of this.near) {
      if (!b.dead) continue;
      if (b.h > b.rubble) {
        b.h = Math.max(b.rubble, b.h - dt * 170);
        if (Math.random() < 0.7) fx.add({ x: rand(b.x, b.x + b.w), y: GROUND - b.h, vx: rand(-40, 40), vy: rand(-80, -20), life: rand(0.8, 1.6), size: rand(10, 22), color: 'rgba(120,110,100,0.5)', grow: 18 });
      }
      if (Math.random() < dt * 14 * b.burn) {
        fx.add({ x: rand(b.x + 6, b.x + b.w - 6), y: GROUND - b.h + rand(0, 10), vx: rand(-15, 15), vy: rand(-110, -50), life: rand(0.4, 0.9), size: rand(5, 11), color: pick(['#ff8a1a', '#ffcc33', '#ff4a1a']), glow: true, grow: -6 });
        if (Math.random() < 0.3) fx.add({ x: rand(b.x, b.x + b.w), y: GROUND - b.h - 10, vx: rand(-10, 20), vy: rand(-50, -25), life: rand(2, 3.5), size: rand(8, 14), color: 'rgba(40,36,40,0.45)', grow: 12 });
      }
    }
  },

  drawSky(c, t, opts = {}) {
    const g = c.createLinearGradient(0, 0, 0, GROUND);
    const top = opts.top || '#070a1f', mid = opts.mid || '#1a1446', bot = opts.bot || '#3d2350';
    g.addColorStop(0, top); g.addColorStop(0.6, mid); g.addColorStop(1, bot);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (const [x, y, r, p] of this.stars) {
      c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + p);
      c.fillStyle = '#fff'; c.fillRect(x, y, r, r);
    }
    c.globalAlpha = 1;
    if (!opts.noMoon) this.drawMoon(c, t, opts.fullMoon ? 1 : 0, opts.moonX || 1020, opts.moonY || 150);
  },
  drawMoon(c, t, full, mx, my, r = null) {
    const R = r || (full ? 95 : 48);
    if (full) {
      glowCircle(c, mx, my, R * 2.6, 'rgba(255,250,215,0.45)', 'rgba(255,250,215,0)');
      circle(c, mx, my, R, '#fff9e0');
      c.globalAlpha = 0.15;
      circle(c, mx - R * 0.3, my - R * 0.2, R * 0.22, '#c9b98a'); circle(c, mx + R * 0.35, my + R * 0.25, R * 0.3, '#c9b98a'); circle(c, mx + R * 0.1, my - R * 0.45, R * 0.12, '#c9b98a');
      c.globalAlpha = 1;
    } else {
      glowCircle(c, mx, my, R * 2, 'rgba(220,230,255,0.12)', 'rgba(220,230,255,0)');
      c.save();
      c.beginPath(); c.rect(0, 0, W, H); c.arc(mx + R * 0.45, my - R * 0.2, R * 0.92, 0, Math.PI * 2);
      c.clip('evenodd');
      circle(c, mx, my, R, '#e8ecff');
      c.restore();
    }
  },
  drawFar(c) {
    for (const b of this.far) {
      c.fillStyle = '#1b1936';
      c.fillRect(b.x, GROUND - 40 - b.h, b.w, b.h + 40);
      c.fillStyle = 'rgba(255,220,140,0.25)';
      for (let r = 0; r < b.rows; r += 2) for (let k = 0; k < b.cols; k += 1) if (b.lit[r * b.cols + k]) c.fillRect(b.x + 8 + k * 14, GROUND - 40 - b.h + 12 + r * 20, 5, 7);
    }
  },
  drawNear(c) {
    const tones = ['#2b2a4a', '#312c52', '#26324d'];
    for (const b of this.near) {
      const top = GROUND - b.h;
      c.fillStyle = tones[b.tone];
      if (!b.dead) {
        c.fillRect(b.x, top, b.w, b.h);
        c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(b.x, top, 5, b.h);
        c.fillStyle = '#1b1a30'; c.fillRect(b.x - 3, top - 6, b.w + 6, 8);
        if (b.antenna) { c.fillStyle = '#1b1a30'; c.fillRect(b.x + b.w / 2 - 1, top - 34, 3, 30); circle(c, b.x + b.w / 2, top - 35, 3, '#ff3b3b'); }
      } else {
        // jagged rubble top
        c.beginPath(); c.moveTo(b.x, GROUND);
        c.lineTo(b.x, top + 10);
        for (let i = 1; i <= 6; i++) c.lineTo(b.x + b.w * i / 6, top + ((i * 37) % 17) - (i % 2) * 12);
        c.lineTo(b.x + b.w, GROUND); c.fill();
      }
      // windows (bottom-up so collapse hides top rows)
      const visRows = Math.floor((b.h - 16) / 20);
      for (let r = 0; r < Math.min(b.rows, visRows); r++) {
        for (let k = 0; k < b.cols; k++) {
          const on = b.lit[r * b.cols + k] && !b.dead;
          c.fillStyle = on ? 'rgba(255,214,120,0.85)' : 'rgba(10,12,30,0.8)';
          c.fillRect(b.x + 8 + k * 14, GROUND - 22 - r * 20, 7, 10);
        }
      }
      if (b.crack > 0.2 && !b.dead) {
        c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(b.x + b.w * 0.3, top + 10);
        c.lineTo(b.x + b.w * 0.5, top + b.h * 0.3 * b.crack); c.lineTo(b.x + b.w * 0.4, top + b.h * 0.6 * b.crack); c.stroke();
      }
      if (b.dead && b.burn) glowCircle(c, b.x + b.w / 2, top, b.w * 0.8, 'rgba(255,110,30,0.35)', 'rgba(255,60,0,0)');
    }
  },
  drawGround(c) {
    c.fillStyle = '#2a2a33'; c.fillRect(0, GROUND, W, H - GROUND);
    c.fillStyle = '#3b3b48'; c.fillRect(0, GROUND, W, 10);
    c.fillStyle = '#d9c24a';
    for (let x = 0; x < W; x += 80) c.fillRect(x + 10, GROUND + 52, 44, 5);
  },
};
