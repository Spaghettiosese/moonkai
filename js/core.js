// ============================================================
//  MOONKAI — core: canvas, math helpers, input, audio, particles
// ============================================================
const W = 1280, H = 720, GROUND = 620;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W; canvas.height = H;
function fitCanvas() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  canvas.style.width = (W * s) + 'px';
  canvas.style.height = (H * s) + 'px';
}
addEventListener('resize', fitCanvas); fitCanvas();

// ---------- math ----------
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1); // 0..1 progress of t through [a,b]
const ease = {
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ---------- input ----------
const Input = { down: new Set(), pressed: new Set() };
addEventListener('keydown', e => {
  if (!Input.down.has(e.code)) Input.pressed.add(e.code);
  Input.down.add(e.code);
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  Sfx.init();
});
addEventListener('keyup', e => Input.down.delete(e.code));
addEventListener('blur', () => Input.down.clear());
const held = c => Input.down.has(c);
const tapped = (...codes) => codes.some(c => Input.pressed.has(c));

// ---------- synthesized audio (no asset files needed) ----------
const Sfx = {
  ac: null, master: null,
  init() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    try {
      this.ac = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ac.createGain();
      this.master.gain.value = 0.3;
      this.master.connect(this.ac.destination);
      this.out = this.ac.createGain(); this.out.connect(this.master);
      this.musicBus = this.ac.createGain(); this.musicBus.gain.value = 0.5; this.musicBus.connect(this.master);
      const len = this.ac.sampleRate * 2; this.noiseBuf = this.ac.createBuffer(1, len, this.ac.sampleRate);
      const nd = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) nd[i] = Math.random() * 2 - 1;
      this.applyVolumes && this.applyVolumes();
    } catch (e) { this.ac = null; }
  },
  tone(freq, dur, type = 'square', vol = 0.3, slideTo = null, delay = 0) {
    if (!this.ac) return;
    const t = this.ac.currentTime + delay;
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.out);
    o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, vol = 0.3, freq = 1200, delay = 0) {
    if (!this.ac) return;
    const t = this.ac.currentTime + delay;
    const s = this.ac.createBufferSource(); s.buffer = this.noiseBuf;
    const f = this.ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
    const g = this.ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(this.out);
    s.start(t, Math.random() * 1.5, dur + 0.05);
  },
  hit() { this.noise(0.1, 0.4, 2500); this.tone(200, 0.1, 'square', 0.15, 70); },
  block() { this.tone(900, 0.06, 'triangle', 0.15, 600); },
  whoosh() { this.noise(0.12, 0.15, 3500); },
  blast() { this.tone(700, 0.22, 'sawtooth', 0.1, 160); },
  fire() { this.noise(0.25, 0.2, 1800); this.tone(400, 0.2, 'triangle', 0.08, 900); },
  boom(delay = 0) { this.noise(0.9, 0.55, 380, delay); this.tone(90, 0.7, 'sine', 0.5, 28, delay); },
  roar(delay = 0) { this.tone(120, 1.5, 'sawtooth', 0.3, 50, delay); this.tone(95, 1.5, 'square', 0.15, 40, delay); this.noise(1.5, 0.3, 700, delay); },
  charge(dur, delay = 0) { this.tone(90, dur, 'sawtooth', 0.12, 1100, delay); },
  beam(dur, delay = 0) { this.noise(dur, 0.35, 3200, delay); this.tone(230, dur, 'sawtooth', 0.12, 180, delay); },
  heartbeat(delay = 0) { this.tone(65, 0.16, 'sine', 0.7, 38, delay); this.tone(58, 0.16, 'sine', 0.55, 34, delay + 0.2); },
  screech(delay = 0) { this.tone(1500, 0.9, 'sawtooth', 0.12, 480, delay); this.tone(1900, 0.7, 'triangle', 0.08, 700, delay + 0.1); },
  voidHum(delay = 0) { this.tone(55, 2.2, 'sine', 0.5, 24, delay); this.tone(220, 2.2, 'triangle', 0.08, 36, delay); },
  teleport() { this.tone(1200, 0.18, 'sine', 0.15, 200); },
  jump() { this.tone(320, 0.1, 'square', 0.05, 520); },
  slam() { this.tone(300, 0.3, 'sawtooth', 0.2, 40); this.noise(0.3, 0.4, 900); },
  ko() { this.tone(400, 1.2, 'sawtooth', 0.2, 50); this.noise(1, 0.4, 600); },
};

// ---------- particles ----------
class ParticleSystem {
  constructor(max = 1600) { this.list = []; this.max = max; }
  add(p) {
    if (this.list.length >= this.max) this.list.shift();
    const q = Object.assign({ x: 0, y: 0, vx: 0, vy: 0, life: 1, size: 4, color: '#fff', g: 0, drag: 0, glow: false, shape: 'circle', grow: 0, rot: 0, vr: 0 }, p);
    q.maxLife = q.life;
    this.list.push(q);
    return q;
  }
  burst(x, y, n, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = o.angle !== undefined ? o.angle + rand(-(o.spread || Math.PI), o.spread || Math.PI) : rand(0, Math.PI * 2);
      const sp = rand(o.speedMin || 50, o.speed || 300);
      this.add({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: rand((o.life || 0.6) * 0.5, o.life || 0.6),
        size: rand((o.size || 5) * 0.5, o.size || 5),
        color: Array.isArray(o.color) ? pick(o.color) : (o.color || '#fff'),
        g: o.g || 0, drag: o.drag || 0, glow: !!o.glow, shape: o.shape || 'circle', grow: o.grow || 0,
      });
    }
  }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt;
      if (p.life <= 0) { this.list.splice(i, 1); continue; }
      p.vy += p.g * dt;
      if (p.drag) { const d = Math.pow(1 - p.drag, dt * 60); p.vx *= d; p.vy *= d; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.size = Math.max(0, p.size + p.grow * dt);
      p.rot += p.vr * dt;
    }
  }
  draw(c) {
    for (const glow of [false, true]) {
      c.globalCompositeOperation = glow ? 'lighter' : 'source-over';
      for (const p of this.list) {
        if (p.glow !== glow) continue;
        const a = clamp(p.life / p.maxLife, 0, 1);
        c.globalAlpha = a;
        c.fillStyle = p.color;
        if (p.shape === 'rect') {
          c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
          c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); c.restore();
        } else {
          c.beginPath(); c.arc(p.x, p.y, p.size * (glow ? (0.6 + 0.4 * a) : 1), 0, Math.PI * 2); c.fill();
        }
      }
    }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  }
  clear() { this.list.length = 0; }
}

// ---------- drawing helpers ----------
function limb(c, a, b, w, col) {
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
  c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
}
function limb3(c, a, b, d, w, col) {
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.stroke();
}
function circle(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function ellipse(c, x, y, rx, ry, col, rot = 0) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); c.fill(); }
function glowCircle(c, x, y, r, inner, outer = 'rgba(0,0,0,0)') {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
}
function bigText(c, txt, x, y, size, fill, stroke = '#000', align = 'center', font = 'Impact, "Arial Black", sans-serif') {
  c.font = `${size}px ${font}`; c.textAlign = align; c.textBaseline = 'middle';
  if (stroke) { c.lineWidth = Math.max(3, size / 9); c.strokeStyle = stroke; c.lineJoin = 'round'; c.strokeText(txt, x, y); }
  c.fillStyle = fill; c.fillText(txt, x, y);
}
function smallText(c, txt, x, y, size = 16, fill = '#fff', align = 'left') {
  c.font = `${size}px "Segoe UI", Roboto, Arial, sans-serif`; c.textAlign = align; c.textBaseline = 'middle';
  c.fillStyle = fill; c.fillText(txt, x, y);
}

// ---------- extra sfx for the expanded roster ----------
Object.assign(Sfx, {
  zap(delay = 0) { this.noise(0.18, 0.35, 6000, delay); this.tone(1600, 0.15, 'square', 0.08, 300, delay); },
  ice(delay = 0) { this.tone(2400, 0.25, 'triangle', 0.1, 1200, delay); this.noise(0.15, 0.2, 5000, delay); },
  clang() { this.tone(900, 0.25, 'square', 0.12, 850); this.tone(1350, 0.2, 'triangle', 0.08, 1300); },
  rock(delay = 0) { this.noise(0.4, 0.5, 500, delay); this.tone(70, 0.3, 'sine', 0.4, 40, delay); },
  slash() { this.noise(0.09, 0.3, 7000); this.tone(1200, 0.08, 'sawtooth', 0.06, 2400); },
  heal() { this.tone(520, 0.3, 'sine', 0.12, 1040); this.tone(780, 0.3, 'sine', 0.08, 1560, 0.08); },
  tick(delay = 0) { this.tone(2000, 0.04, 'square', 0.08, null, delay); },
  card() { this.tone(1100, 0.08, 'triangle', 0.1, 1600); },
  laser(dur = 1, delay = 0) { this.tone(1400, dur, 'sawtooth', 0.1, 900, delay); this.noise(dur, 0.25, 4000, delay); },
  select() { this.tone(660, 0.07, 'square', 0.06, 880); },
  confirm() { this.tone(440, 0.1, 'square', 0.08, 880); this.tone(880, 0.15, 'square', 0.06, 1320, 0.08); },
  bell(delay = 0) { this.tone(880, 1.2, 'sine', 0.2, 870, delay); this.tone(1320, 1, 'sine', 0.08, 1310, delay); },
});
function roundRect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function shadeHex(hex, amt) { // amt -1..1
  const n = parseInt(hex.slice(1), 16);
  const f = v => clamp(Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt), 0, 255);
  return '#' + [f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
}
