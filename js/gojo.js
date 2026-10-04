// ============================================================
//  MOONKAI — SATORU GOJO (Jujutsu Kaisen tribute). Remade in the pixel engine.
//
//  PASSIVE  · INFINITY      Projectiles that near him slow to a crawl and stop short, rippling the air.
//                           Melee still lands: you have to get close.
//  GAUGE    · CURSED ENERGY Fuel for his techniques: Blue 20 · Red 30 · Hollow Purple needs a FULL gauge.
//  BLUE        a point of attraction that drags the foe into its core.
//  RED         a reversal blast that throws the foe across the stage and off walls.
//  FLASH STEP  appears behind the foe, and opens a BLACK FLASH window: the next hit that lands
//              inside it detonates in black-and-red lightning (+40% damage, stun, CE back).
//  INFINITY PALM / LAPSE DIVE   anti-air palm and a falling Blue.
//  HOLLOW PURPLE  super: Blue and Red collide into a slow ball of imaginary mass.
//  SIX EYES    awakening: the blindfold slides up, every technique costs half, and Reverse Cursed
//              Technique knits his wounds whenever he stands still.
//  UNLIMITED VOID  ultimate: a slow Domain Expansion that drowns the foe in infinite information.
// ============================================================
const gjSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const GJ_PAL = { build: 'slim', skin: '#f4e0cc', top: '#12121c', topDark: '#08080e', pants: '#12121c', pantsDark: '#08080e', boots: '#0a0a0a', belt: '#12121c', glove: '#f4e0cc', noFace: true };
const gjCost = (f, n) => n * (f.form ? 0.5 : 1);
function gjSpend(f, n) { const c = gjCost(f, n); if ((f.gauge || 0) < c) { Game.popWorld(f.x, f.y - f.h - 30, 'NO CURSED ENERGY', '#8a9ab8', 16); return false; } f.gauge -= c; return true; }

// ---------------- art ----------------
function drawGojo(c, v) {
  const t = v.anim || 0, S = !!v.transformed;
  if (S) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -80, 120, 'rgba(70,170,255,0.22)', 'rgba(0,0,0,0)'); c.restore(); }
  drawHumanoid(c, v, GJ_PAL, {
    back(c, P) {
      // long coat tails
      c.fillStyle = '#0c0c14'; c.strokeStyle = '#000'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(P.hip[0] - 10, P.hip[1] - 4); c.quadraticCurveTo(P.hip[0] - 22, P.hip[1] + 22, P.hip[0] - 24 + Math.sin(t * 3) * 3, P.hip[1] + 40); c.lineTo(P.hip[0] + 4, P.hip[1] + 34); c.lineTo(P.hip[0] + 8, P.hip[1] - 2); c.closePath(); c.fill(); c.stroke();
      // hair volume behind the head
      const [hx, hy] = P.head; c.fillStyle = '#eef2fa';
      c.beginPath(); c.moveTo(hx - 6, hy - 12); for (const [x, y] of [[-20, -16], [-12, -8], [-22, -2], [-10, 2]]) c.lineTo(hx + x, hy + y); c.closePath(); c.fill();
    },
    chest(c, P) {
      // tall collar + swirl button
      const [sx, sy] = P.sh;
      c.fillStyle = '#08080e'; c.beginPath(); c.moveTo(sx - 8, sy + 2); c.lineTo(sx - 6, sy - 12); c.lineTo(sx + 10, sy - 12); c.lineTo(sx + 12, sy + 2); c.closePath(); c.fill();
      c.strokeStyle = '#c8a860'; c.lineWidth = 1.2; c.beginPath(); c.arc(sx + 3, sy + 8, 3, 0, Math.PI * 1.6); c.stroke();
    },
    head(c, P) {
      const [hx, hy] = P.head;
      // tall spiky white hair
      c.fillStyle = S ? '#ffffff' : '#eef2fa'; c.strokeStyle = '#9aa4bc'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(hx - 12, hy - 2);
      for (const [x, y] of [[-16, -14], [-8, -14], [-12, -28], [-2, -18], [2, -32], [8, -18], [16, -26], [13, -12], [18, -10], [12, -4]]) c.lineTo(hx + x, hy + y);
      c.closePath(); c.fill(); c.stroke();
      if (!S) { // blindfold, hair pushed up by it
        c.fillStyle = '#050508'; c.beginPath(); c.moveTo(hx - 11, hy - 8); c.lineTo(hx + 12, hy - 9); c.lineTo(hx + 12, hy - 1); c.lineTo(hx - 11, hy); c.closePath(); c.fill();
      } else {
        c.fillStyle = '#eef2fa'; c.beginPath(); c.moveTo(hx + 2, hy - 8); c.lineTo(hx + 12, hy - 7); c.lineTo(hx + 8, hy - 4); c.fill();
        c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 2, 9, 'rgba(80,200,255,1)', 'rgba(0,0,0,0)'); c.restore();
        c.fillStyle = '#fff'; c.beginPath(); c.ellipse(hx + 7, hy - 2, 3.4, 2, 0, 0, Math.PI * 2); c.fill(); circle(c, hx + 7.5, hy - 2, 1.5, '#2ab0ff');
        c.strokeStyle = '#f4f6ff'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + 3, hy - 3.5); c.lineTo(hx + 11, hy - 4.5); c.stroke();
      }
      c.strokeStyle = '#7a4a3a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(hx + 5, hy + 6); c.quadraticCurveTo(hx + 8, hy + 8, hx + 11, hy + 5); c.stroke();
    },
    front(c, P) {
      const m = v.move, [hx, hy] = P.fH;
      if (m && m.gjCharge && v.mf < m.s) { // gathering Red/Blue at the fingertip
        const k = v.mf / m.s; c.save(); c.globalCompositeOperation = 'lighter';
        glowCircle(c, hx + 6, hy - 4, 8 + 18 * k, m.gjCharge === 'red' ? 'rgba(255,40,40,1)' : m.gjCharge === 'blue' ? 'rgba(60,140,255,1)' : 'rgba(170,80,255,1)', 'rgba(0,0,0,0)'); c.restore();
      }
    },
  });
}
function drawGojoPortrait(c, opts) {
  const S = !!opts.form;
  const g = c.createRadialGradient(50, 50, 4, 50, 50, 80); g.addColorStop(0, S ? '#1a4a8a' : '#1c1c2e'); g.addColorStop(1, '#02030a'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  if (S) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 18, 80, 22, 'rgba(60,140,255,0.8)', 'rgba(0,0,0,0)'); glowCircle(c, 82, 80, 22, 'rgba(255,40,40,0.8)', 'rgba(0,0,0,0)'); c.restore(); }
  c.fillStyle = '#0c0c14'; c.beginPath(); c.moveTo(12, 100); c.lineTo(26, 78); c.lineTo(74, 78); c.lineTo(88, 100); c.fill();
  c.fillStyle = '#08080e'; c.fillRect(38, 66, 24, 18);
  c.fillStyle = '#f4e0cc'; c.strokeStyle = '#7a5a4a'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(35, 40); c.lineTo(65, 40); c.lineTo(65, 56); c.lineTo(58, 68); c.lineTo(50, 71); c.lineTo(42, 68); c.lineTo(35, 56); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = S ? '#ffffff' : '#eef2fa'; c.strokeStyle = '#9aa4bc';
  c.beginPath(); c.moveTo(30, 52);
  for (const [x, y] of [[20, 34], [30, 34], [20, 14], [36, 24], [38, 2], [48, 20], [56, 0], [62, 20], [76, 6], [70, 28], [82, 30], [70, 42], [66, 50], [60, 38], [54, 46], [48, 38], [42, 46], [36, 38]]) c.lineTo(x, y);
  c.closePath(); c.fill(); c.stroke();
  if (!S) { c.fillStyle = '#050508'; c.beginPath(); c.moveTo(31, 45); c.lineTo(69, 45); c.lineTo(69, 54); c.lineTo(31, 55); c.closePath(); c.fill(); }
  else {
    c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 9, 52, 13, 'rgba(80,200,255,1)', 'rgba(0,0,0,0)'); c.restore();
    for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(50 + s * 9, 52, 6.5, 3.2, 0, 0, Math.PI * 2); c.fill(); circle(c, 50 + s * 9, 52, 2.8, '#2ab0ff'); circle(c, 50 + s * 9, 52, 1.1, '#fff');
      c.strokeStyle = '#f4f6ff'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(50 + s * 3, 48); c.lineTo(50 + s * 15, 47); c.stroke(); }
  }
  c.strokeStyle = '#6a3a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(43, 63); c.quadraticCurveTo(51, 66.5, 59, 61.5); c.stroke();
}

// ---------------- pixel art ----------------
const gjQ = (x, k = 4) => Math.round(x * k) / k;
const GOJOPX = PixelArt.make({
  id: 'gojo', win: [-110, -250, 290, 300], B: 1.1, trail: 'rgba(143,208,255,',
  state(v, t) {
    const S = !!v.transformed, un = v.unveil === undefined ? (S ? 1 : 0) : Math.round(v.unveil * 8) / 8, m = v.move, ch = m && m.gjCharge && v.mf < m.s ? m.gjCharge : null;
    return { S, un, sway: gjQ(Math.sin(t * 3)), tail: gjQ(Math.sin(t * 4)), ch, sign: v.sign ? 1 : 0, bf: v.bfT > 0 ? 1 : 0 };
  },
  body(g, P, s) {
    const { L } = g, S = s.S, un = s.un;
    const uni = ['#1e1e30', '#0e0e1a'], uniF = ['#0e0e1a', '#06060c'], skin = ['#f4e0cc', '#cfae98'], skinF = ['#cfae98', '#a88672'];
    g.humanoid(P, { limb: .92, bulk: .9, hips: .92, skin, skinFar: skinF, top: uni, topFar: uniF, pants: uni, pantsFar: uniF,
      boots: ['#17171f', '#08080c'], bootsFar: ['#08080c', '#050508'], belt: ['#2c2c46', '#16162a'], glove: skin, gloveFar: skinF }, {
      back(P) { // coat tails + hair mass behind the head
        const [hx, hy] = P.head, [px_, py] = P.hip;
        g.paint([g.shape([['M', px_ - 10, py - 4], ['Q', px_ - 22, py + 22, px_ - 26 + s.tail * 4, py + 42], ['L', px_ + 4, py + 34], ['L', px_ + 8, py - 2]])], ...uniF);
        g.paint([g.poly([[hx - 6, hy - 12], [hx - 21, hy - 16 - un * 3], [hx - 12, hy - 8], [hx - 24, hy - 1], [hx - 10, hy + 3]])], '#dfe6f5', '#a4b0cc');
      },
      chest(P) { // high collar and the swirl button
        const [sx, sy] = P.sh;
        g.paint([g.poly([[sx - 8, sy + 2], [sx - 6, sy - 12], [sx + 10, sy - 12], [sx + 12, sy + 2]])], '#14141f', '#08080e');
        g.line([[sx + 1, sy + 8], [sx + 4, sy + 6], [sx + 5, sy + 9], [sx + 2, sy + 11]], '#d0b070', 1.1);
      },
      head(P) {
        const [hx, hy] = P.head, up = un * 3.5;
        // spiky white hair, lifted by his own cursed energy once awakened
        const spikes = [[-12, -2], [-16, -14 - up], [-8, -14], [-12, -28 - up * 1.4], [-2, -18], [2, -32 - up * 1.6], [8, -18], [16, -26 - up * 1.3], [13, -12], [18, -10 - up], [12, -4]];
        g.paint([g.poly(spikes.map(([x, y]) => [hx + x, hy + y]))], '#f6f9ff', '#b2bdd8');
        g.line([[hx - 2, hy - 14], [hx + 1, hy - 24 - up]], '#c4cee6', 1);
        // blindfold: covers the eyes, then slides up into the hair as the Six Eyes open
        const by = hy - 4 - un * 13, tilt = -un * 1.5;
        if (un < 1) g.paint([g.poly([[hx - 11, by - 4], [hx + 12, by - 5 + tilt], [hx + 12, by + 3 + tilt], [hx - 11, by + 4]])], '#101018', '#050508');
        if (un > .15) { // the eyes
          g.fill(g.ell(hx + 7, hy - 2, 3.6, 2.1), '#ffffff'); g.fill(g.ell(hx + 7.6, hy - 2, 1.7, 1.7), '#2ab0ff'); g.fill(g.ell(hx + 8, hy - 2.2, .7, .7), '#ffffff');
          g.line([[hx + 2.5, hy - 4], [hx + 11, hy - 5]], '#e8ecff', 1);
        }
        g.line([[hx + 5, hy + 6], [hx + 8, hy + 8], [hx + 11, hy + 5]], '#7a4a3a', 1.2, true);
      },
      front(P) {
        if (s.sign) { // Domain hand sign: two crossed fingers
          const [x, y] = P.fH;
          g.line([[x - 3, y + 6], [x + 4, y - 9]], '#f4e0cc', 2.2); g.line([[x + 4, y + 6], [x - 3, y - 9]], '#e0c8b0', 2.2);
        }
      },
    });
  },
  pre(c, v, P, s) { if (s.S) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -80, 120, 'rgba(70,170,255,0.2)', 'rgba(0,0,0,0)'); c.restore(); } },
  post(c, v, P, s) {
    const t = v.anim || 0, [hx, hy] = P.head;
    c.save(); c.globalCompositeOperation = 'lighter';
    if (s.un > .3) glowCircle(c, hx + 7, hy - 2, 5 + 8 * s.un, 'rgba(80,200,255,0.95)', 'rgba(0,0,0,0)');
    if (s.S) { // a Blue and a Red orbit him, never touching
      const a = t * 2.4;
      glowCircle(c, P.sh[0] + Math.cos(a) * 34, P.sh[1] + 12 + Math.sin(a) * 12, 7, 'rgba(70,140,255,1)', 'rgba(0,0,0,0)');
      glowCircle(c, P.sh[0] - Math.cos(a) * 34, P.sh[1] + 12 - Math.sin(a) * 12, 7, 'rgba(255,60,70,1)', 'rgba(0,0,0,0)');
    }
    if (s.ch) { const m = v.move, k = v.mf / m.s; glowCircle(c, P.fH[0] + 6, P.fH[1] - 4, 8 + 18 * k, s.ch === 'red' ? 'rgba(255,40,40,1)' : s.ch === 'blue' ? 'rgba(60,140,255,1)' : 'rgba(170,80,255,1)', 'rgba(0,0,0,0)'); }
    if (s.bf) { c.strokeStyle = '#ff2a4a'; c.lineWidth = 1.6; c.beginPath(); for (let i = 0; i < 3; i++) { const a = t * 17 + i * 2.1; c.moveTo(P.fH[0], P.fH[1]); c.lineTo(P.fH[0] + Math.cos(a) * 14, P.fH[1] + Math.sin(a) * 14); } c.stroke(); }
    if (s.sign) glowCircle(c, P.fH[0], P.fH[1], 14, 'rgba(160,210,255,0.8)', 'rgba(0,0,0,0)');
    c.restore();
  },
});
const gjPortrait = PxKit.portrait('gojo', drawGojoPortrait, { res: 64, levels: 8, dither: 0.28 });

// ---------------- technique objects ----------------
// Blue: a gravity well. Pixel rings spiral inward; foes inside are dragged to the core.
Combat.hz.gojoBlue = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  h.x += h.vx / FPS; h.vx *= 0.93;
  if (h.t % 14 === 0) gjSfx('gojBlueLoop');
  for (const o of this.targets(h.side)) { const d = h.x - o.x; if (Math.abs(d) < 230 && o.y > -300) { o.x += Math.sign(d) * Math.min(Math.abs(d), 7); if (h.t % 8 === 0 && Math.abs(d) < 70) { const r = Combat.resolveHit(o, f, H_({ dmg: f.form ? 17 : 13, guard: 'mid', hs: 14, kb: [0, -60], sfx: 'l' }), { proj: true, fromX: h.x }); if (r === 'hit') f.gauge = Math.min(100, f.gauge + 2); } } }
  return h.t < h.life;
};
Combat.drawHz.gojoBlue = function (c, h, t) {
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 80, 'rgba(50,120,255,0.7)', 'rgba(0,0,0,0)');
  // pixel debris spiralling into the core
  for (let i = 0; i < 22; i++) { const a = i * 2.4 + t * (3 + (i % 3)), r = 74 - ((t * 70 + i * 9) % 74); c.fillStyle = i % 3 ? '#9fd0ff' : '#ffffff'; c.fillRect(Math.round((h.x + Math.cos(a) * r) / 3) * 3, Math.round((h.y + Math.sin(a) * r * .7) / 3) * 3, 3, 3); }
  c.strokeStyle = 'rgba(160,210,255,0.8)'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { const r = 62 - ((t * 80 + i * 20) % 62); c.beginPath(); c.arc(h.x, h.y, r, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  c.fillStyle = '#04103a'; c.beginPath(); c.arc(h.x, h.y, 13, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#a8d8ff'; c.lineWidth = 3; c.stroke();
};
// Red: repulsion. A hard, fast orb that punches the foe across the stage.
Combat.hz.gojoRed = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  h.x += h.vx / FPS;
  for (const o of this.targets(h.side)) if (Math.abs(o.x - h.x) < 46 + o.w / 2 && Math.abs((o.y - o.h / 2) - h.y) < 70) {
    const r = Combat.resolveHit(o, f, H_({ dmg: f.form ? 110 : 90, guard: 'mid', hs: 30, kb: [1300 * Math.sign(h.vx), -420], launch: true, wb: true, sfx: 'h' }), { proj: true, fromX: h.x - h.vx });
    if (r === 'hit') f.gauge = Math.min(100, f.gauge + 6);
    Combat.addHazard({ kind: 'gojoBurst', owner: f, side: f.side, x: h.x, y: h.y, life: 18, col: '255,50,50', ring: true }); Cam.shake = 14; gjSfx('impact', 0.9); return false;
  }
  for (const p of this.projectiles) if (p.side !== h.side && Math.abs(p.x - h.x) < 50 && Math.abs(p.y - h.y) < 50) p.life = 0;
  return h.t < h.life && h.x > 0 && h.x < Arena.stage.width;
};
Combat.drawHz.gojoRed = function (c, h, t) {
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 64, 'rgba(255,40,40,0.85)', 'rgba(0,0,0,0)');
  c.strokeStyle = 'rgba(255,170,160,0.85)'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { const r = 18 + ((t * 130 + i * 14) % 42); c.beginPath(); c.arc(h.x, h.y, r, 0, Math.PI * 2); c.stroke(); }
  const d = -Math.sign(h.vx); for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#ff5a4a' : '#ffd0c8'; c.fillRect(Math.round((h.x + d * (24 + i * 16)) / 3) * 3, Math.round((h.y + Math.sin(t * 20 + i) * (6 + i * 1.6)) / 3) * 3, 6 - i * .4, 6 - i * .4); }
  c.restore();
  c.fillStyle = '#ff2a2a'; c.beginPath(); c.arc(h.x, h.y, 16, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff0f0'; c.beginPath(); c.arc(h.x, h.y, 7, 0, Math.PI * 2); c.fill();
};
// Hollow Purple: imaginary mass. Slow, enormous, erases everything.
Combat.hz.gojoPurple = function (h) {
  const f = h.owner; if (!f) return false;
  if (h.t < h.charge) { h.x = f.x + f.facing * 110; h.y = f.y - 100 * f.scale; return true; }
  h.x += h.vx / FPS;
  for (const o of this.targets(h.side)) if (Math.abs(o.x - h.x) < h.r + o.w / 2 && Math.abs((o.y - o.h / 2) - h.y) < h.r + 40 && h.t % 8 === 0)
    Combat.resolveHit(o, f, H_({ dmg: 34, guard: 'mid', hs: 16, bs: 12, kb: [Math.sign(h.vx) * 60, -40], sfx: 'h' }), { proj: true, fromX: h.x - h.vx, move: GJ_PURPLE_MOVE });
  for (const p of this.projectiles) if (p.side !== h.side && Math.hypot(p.x - h.x, p.y - h.y) < h.r) p.life = 0;
  this.hazards.forEach(z => { if (z !== h && z.side !== h.side && Math.abs((z.x || 0) - h.x) < h.r) z.life = 0; });
  if (h.t % 4 === 0) Arena.hit(h.x - h.r, h.x + h.r, h.y, 40, Game.fx);
  Cam.shake = Math.max(Cam.shake, 3);
  return h.t < h.life && h.x > -h.r && h.x < Arena.stage.width + h.r;
};
Combat.drawHz.gojoPurple = function (c, h, t) {
  const charging = h.t < h.charge, k = charging ? h.t / h.charge : 1;
  c.save(); c.globalCompositeOperation = 'lighter';
  if (charging) { // Blue and Red spiral together
    const a = t * 10, sep = 90 * (1 - k);
    glowCircle(c, h.x + Math.cos(a) * sep, h.y + Math.sin(a) * sep * .5, 40, 'rgba(60,130,255,0.9)', 'rgba(0,0,0,0)');
    glowCircle(c, h.x - Math.cos(a) * sep, h.y - Math.sin(a) * sep * .5, 40, 'rgba(255,50,50,0.9)', 'rgba(0,0,0,0)');
  }
  const R = h.r * k;
  glowCircle(c, h.x, h.y, R * 2.3, 'rgba(160,60,255,0.55)', 'rgba(0,0,0,0)');
  const g = c.createRadialGradient(h.x, h.y, R * .1, h.x, h.y, R); g.addColorStop(0, 'rgba(255,240,255,1)'); g.addColorStop(.5, 'rgba(190,100,255,0.95)'); g.addColorStop(1, 'rgba(90,20,180,0.25)');
  c.fillStyle = g; c.beginPath(); c.arc(h.x, h.y, R, 0, Math.PI * 2); c.fill();
  // pixel shards torn off the sphere
  for (let i = 0; i < 26; i++) { const a = i * 2.4 + t * 2, r = R * (1.05 + (i % 5) * .08) + Math.sin(t * 6 + i) * 4; c.fillStyle = i % 2 ? '#e0b0ff' : '#ffffff'; c.fillRect(Math.round((h.x + Math.cos(a) * r) / 4) * 4, Math.round((h.y + Math.sin(a) * r) / 4) * 4, 4, 4); }
  if (!charging) { c.lineCap = 'round'; c.strokeStyle = 'rgba(180,90,255,0.22)'; c.lineWidth = R * 1.4; c.beginPath(); c.moveTo(h.x, h.y); c.lineTo(h.x - Math.sign(h.vx) * 260, h.y); c.stroke(); }
  c.restore();
};
Combat.hz.gojoBurst = function (h) { return h.t < h.life; };
Combat.drawHz.gojoBurst = function (c, h) {
  const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 40 + 160 * k, `rgba(${h.col},${0.8 * (1 - k)})`, 'rgba(0,0,0,0)');
  if (h.ring) { c.strokeStyle = `rgba(${h.col},${1 - k})`; c.lineWidth = 6 * (1 - k) + 1; c.beginPath(); c.arc(h.x, h.y, 150 * ease.out(k), 0, Math.PI * 2); c.stroke(); }
  c.restore();
};
// Black Flash: a black-edged crimson lightning cracking the air where the blow lands.
Combat.hz.gojoBlackFlash = function (h) { return h.t < h.life; };
Combat.drawHz.gojoBlackFlash = function (c, h) {
  const k = h.t / h.life, a = 1 - k; c.save();
  c.fillStyle = `rgba(0,0,0,${.55 * a})`; c.beginPath(); c.arc(h.x, h.y, 90 * (.4 + k), 0, Math.PI * 2); c.fill();
  c.globalCompositeOperation = 'lighter'; c.lineCap = 'square';
  for (let i = 0; i < 9; i++) { const ang = i * .7 + h.seed, L = 40 + (i % 3) * 36 + k * 90; let x = h.x, y = h.y; c.strokeStyle = i % 2 ? `rgba(255,40,70,${a})` : `rgba(255,255,255,${a})`; c.lineWidth = i % 2 ? 5 : 2; c.beginPath(); c.moveTo(x, y); for (let j = 1; j <= 4; j++) { const r = L * j / 4; c.lineTo(h.x + Math.cos(ang) * r + Math.sin(j * 9 + h.seed) * 10, h.y + Math.sin(ang) * r + Math.cos(j * 7 + h.seed) * 10); } c.stroke(); }
  c.restore();
};
// Flash Step afterimage
Combat.hz.gojoStep = function (h) { return h.t < h.life; };
Combat.drawHz.gojoStep = function (c, h) { const a = 1 - h.t / h.life; c.save(); c.globalAlpha = .5 * a; c.globalCompositeOperation = 'lighter'; c.fillStyle = '#9fd0ff'; for (let i = 0; i < 7; i++) c.fillRect(h.x - 16 + (i % 3) * 10, -100 + i * 14, 8, 10); c.restore(); };

// ---------------- kit ----------------
function blackFlash(a, t, dmg) {
  const extra = Math.round(dmg * 0.4 + 18);
  t.hp = Math.max(1, t.hp - extra); t.status.stun = Math.max(t.status.stun || 0, 0.35);
  a.gauge = Math.min(100, (a.gauge || 0) + 12);
  Combat.addHazard({ kind: 'gojoBlackFlash', owner: a, side: a.side, x: t.x, y: t.y - t.h * .6, life: 20, seed: rand(0, 9) });
  Game.popWorld(t.x, t.y - t.h - 44, 'BLACK FLASH', '#ff2a4a', 28); Cam.shake = Math.max(Cam.shake, 18); gjSfx('gojBlackFlash');
}
const GJ_BLUE = mk({ name: 'Blue', desc: 'Cursed Technique Lapse (20 CE): a point of attraction flies out and drags the foe into its core.', pose: 'cast', s: 14, a: 1, r: 18, gjCharge: 'blue', ai: { min: 120, max: 900, use: 'zone' },
  ev: { 4: () => gjSfx('gojBlue'), 14: f => { if (!gjSpend(f, 20)) return; Combat.addHazard({ kind: 'gojoBlue', owner: f, side: f.side, x: f.x + f.facing * 90, y: f.y - 80 * f.scale, vx: f.facing * 950, life: 80 }); } } });
const GJ_RED = mk({ name: 'Red', desc: 'Reversal (30 CE): a red orb gathers at his fingertip, then fires. It throws the foe across the stage and off walls.', pose: 'cast', s: 22, a: 1, r: 22, gjCharge: 'red', ai: { min: 60, max: 900, use: 'zone' },
  ev: { 2: () => gjSfx('gojRed'), 22: f => { if (!gjSpend(f, 30)) return; Combat.addHazard({ kind: 'gojoRed', owner: f, side: f.side, x: f.x + f.facing * 60, y: f.y - 82 * f.scale, vx: f.facing * 1200, life: 90 }); } } });
const GJ_STEP = mk({ name: 'Flash Step', desc: 'Vanishes and reappears behind the foe. The next hit within a second lands as a BLACK FLASH: +40% damage, stun, cursed energy back.', pose: 'dash', s: 4, a: 1, r: 12, inv: [1, 6], cd: 2, ai: { min: 200, max: 900, use: 'approach' },
  ev: { 1: f => { Combat.addHazard({ kind: 'gojoStep', owner: f, side: f.side, x: f.x, life: 18 }); gjSfx('gojStep'); }, 3: f => { Combat.teleport(f, 'behind'); f.bfT = 70; Game.popWorld(f.x, f.y - f.h - 24, 'BLACK FLASH READY', '#ff5a7a', 16); } } });
const GJ_RISE = Mv.rising({ name: 'Infinity Palm', desc: 'A rising palm that repels upward.', hit: { dmg: 34, multi: 3 } });
const GJ_AIR = Mv.dive({ name: 'Lapse Dive', desc: 'Drops with a small Blue in hand; ground bounce.', vx: 450, vy: 1300, hit: { dmg: 76, box: [0, -80, 100, 90], gb: true, kb: [200, 900], guard: 'high' } });
const GJ_PURPLE_MOVE = superize(mk({ name: 'Hollow Purple', desc: 'Needs a FULL cursed-energy gauge. Blue and Red collide into a huge, slow ball of imaginary mass that rolls across the stage erasing everything.', pose: 'cast', s: 50, a: 1, r: 30, gjCharge: 'purple',
  ev: { 1: f => { if ((f.gauge || 0) < gjCost(f, 100) - 0.01) { f.purpleFail = true; Game.popWorld(f.x, f.y - f.h - 30, 'NEEDS FULL CURSED ENERGY', '#b070ff', 16); f.move = null; f.state = 'stand'; f.meter += 200; return; }
    f.gauge -= gjCost(f, 100); f.say('Nine ropes, polarized light, crow and declaration...', 100); Combat.addHazard({ kind: 'gojoPurple', owner: f, side: f.side, x: f.x, y: f.y - 100, vx: f.facing * 330, r: 72, charge: 48, life: 48 + 8 * FPS }); gjSfx('gojPurple'); },
    48: f => { f.say('PURPLE.', 60); gjSfx('impact', 1); gjSfx('gojRed'); } } }), 200);
GJ_PURPLE_MOVE.id = 'gojo_super';
const GJ_ULT = superize(mk({ name: 'UNLIMITED VOID', desc: 'A slow, deliberate Domain Expansion. Everything close is drowned in infinite information. Blockable. Must connect.', pose: 'charge', s: 55, a: 2, r: 30,
  ev: { 2: f => { f.sign = true; f.say('Domain Expansion...', 90); gjSfx('gojDomain'); }, 55: f => { f.sign = false; Combat.strikeZone(f, { x: f.x - 380, y: -340, w: 760, h: 346 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: GJ_ULT }); Combat.addHazard({ kind: 'gojoBurst', owner: f, side: f.side, x: f.x, y: -120, life: 30, col: '140,210,255', ring: true }); Cam.shake = 14; gjSfx('gojClap'); } } }), 300);
GJ_ULT.id = 'gojo_ult'; GJ_ULT.ult = { dmg: 1180, cutscene: (a, t) => csUnlimitedVoid(a, t), fx: { el: 'light', color: '#8fd0ff' } };

const gojo = fighter({
  id: 'gojo', name: 'SATORU GOJO', title: 'The Strongest', side: 'HERO', role: 'Zoner · Infinity · Black Flash', color: '#8fd0ff', color2: '#12121c',
  bio: 'The strongest sorcerer alive. Nothing touches him that he does not allow. He teaches high school. Badly, but with enormous confidence.',
  quote: 'Throughout heaven and earth, I alone am the honored one.',
  ending: 'Gojo takes a teaching job in Metro City. The students learn nothing but have never been safer.',
  hp: 980, walk: 280, rival: 'yuji', handArt: true, tall: 1.1, wide: 1.0,
  draw: (c, v) => PxKit.on() ? GOJOPX.draw(c, v) : drawGojo(c, v),
  drawPortrait: (c, o, d) => PxKit.on() ? gjPortrait(c, o, d) : drawGojoPortrait(c, o),
  transformCutscene: f => csSixEyes(f),
  model: { skin: '#f4e0cc' }, face: { expr: 'smirk' }, style: { speed: 0.95, reach: 1.1 },
  gauge: { name: 'CURSED ENERGY', max: 100, color: '#8fd0ff', label: f => (f.gauge >= gjCost(f, 100) - 0.01 ? '· PURPLE READY' : '') },
  passive: ['Infinity', 'Projectiles that come within reach slow to a crawl and stop just before touching him. Melee still lands. Flash Step opens a Black Flash window.'],
  moves: { '5S': GJ_BLUE, '6S': GJ_RED, '4S': GJ_STEP, '2S': GJ_RISE, 'jS': GJ_AIR },
  super: GJ_PURPLE_MOVE, ult: GJ_ULT,
  onHit: (a, t, dmg) => { if (a.bfT > 0 && a.move && a.move.id !== 'gojo_ult') { a.bfT = 0; blackFlash(a, t, dmg || 40); } },
  form: { name: 'SIX EYES', desc: 'Permanent. The blindfold comes off: every technique costs half, Blue and Red hit harder, and Reverse Cursed Technique heals him whenever he stands still.', cost: 200, dmg: 1.08, speed: 1.05 },
  assist: '5S',
  lines: {
    intro: ["Don't worry, I'm the strongest.", 'Oh? You want to fight ME, {opp}?', "I'll go easy. Maybe."],
    win: ["Nah, I'd win.", 'Throughout heaven and earth, I alone am the honored one.', 'That was fun! For me.'],
    taunt: ['Is that it?', 'Yawn.'], form: ['Let me see you properly.'], ult: ['Domain Expansion.'], ultHit: ['Unlimited Void.'], tag: ['Leave it to me.'], enter: ['The strongest has arrived.'], assist: ['Blue.'], moves: ['Blue.', 'Red.', 'Too slow.'],
  },
});
gojo.ult = GJ_ULT; gojo.ultAct = 'strike';
gojo.onRoundStart = f => { f.gauge = 60; f.bfT = 0; f.sign = false; };
// Infinity: enemy projectiles near him slow down and stop short. RCT: Six Eyes heal while he stands still.
gojo.passiveTick = f => {
  f.gauge = Math.min(100, (f.gauge || 0) + 0.12);
  if (f.bfT > 0) f.bfT--;
  if (f.form && f.state === 'stand' && !f.move && f.st % 20 === 0 && f.hp < f.maxHp && f.hp > 1) { f.hp = Math.min(f.maxHp, f.hp + 4); if (f.st % 60 === 0) Game.fx.burst(f.x, f.y - 60, 3, { color: ['#8fd0ff', '#fff'], size: 4, speed: 80, glow: true, life: 0.5 }); }
  for (const p of Combat.projectiles) if (p.side !== f.side && p.life > 0) {
    const d = Math.hypot(p.x - f.x, p.y - (f.y - f.h / 2));
    if (d < 150) { const k = d < 75 ? 0 : 0.82; if (!p.infinity) gjSfx('gojInfinity'); p.vx *= k; p.vy *= k; p.infinity = true; if (d < 75) p.life = Math.min(p.life, 24); }
  }
};
gojo.drawWorldFront = (c, f) => {
  if (f.state === 'benched') return;
  const t = Game.t;
  for (const p of Combat.projectiles) if (p.infinity && p.side !== f.side) { // the air bends around Infinity
    c.save(); c.strokeStyle = 'rgba(190,230,255,0.65)'; c.lineWidth = 2;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(p.x, p.y, (p.r || 10) + 6 + i * 6 + Math.sin(t * 9 + i) * 2, 0, Math.PI * 2); c.stroke(); } c.restore();
  }
  if (f.bfT > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,40,70,${.25 + .2 * Math.sin(t * 20)})`; c.fillRect(f.x - 3, f.y - f.h - 18, 6, 6); c.restore(); }
};

// ---------------- cinematics ----------------
const gjStars = (x, t, k, seed = 0) => { for (let i = 0; i < 90; i++) { const a = i * 2.39996 + seed, r = (30 + (i * 53 + t * (60 + (i % 5) * 30)) % 520) * k; x.fillStyle = i % 4 ? '#7ac0ff' : '#ffffff'; x.fillRect(W / 2 + Math.cos(a) * r * 1.5, H / 2 + Math.sin(a) * r * .85, 5, 5); } };

// SIX EYES — the blindfold slides up and the whole world becomes legible.
function csSixEyes(f) {
  const fx = new ParticleSystem(500), A = PxKit.actor(f.def), A2 = PxKit.actor(f.def);
  return {
    name: 'SIX EYES', dur: 5.6, fx,
    cues: [[0, () => gjSfx('gojInfinity')], [1.2, () => gjSfx('whoosh')], [1.9, () => gjSfx('gojEyes')], [2.9, () => gjSfx('gojClap')], [3.0, () => gjSfx('gojBlue')], [3.2, () => gjSfx('gojRed')]],
    draw(c, t) {
      const veil = ease.inOut(seg(t, 1.1, 2.0)), flare = ease.out(seg(t, 1.9, 2.9)), world = ease.out(seg(t, 2.9, 3.6));
      PxKit.scene(c, x => {
        const g = x.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 700); g.addColorStop(0, `rgb(${lerp(18, 20, flare) | 0},${lerp(18, 60, flare) | 0},${lerp(34, 120, flare) | 0})`); g.addColorStop(1, '#02030a'); x.fillStyle = g; x.fillRect(0, 0, W, H);
        if (flare > 0) { x.globalCompositeOperation = 'lighter'; gjStars(x, t, .4 + flare * .8); x.globalCompositeOperation = 'source-over'; }
        if (world > 0) { // every thread of cursed energy becomes visible
          x.strokeStyle = `rgba(120,200,255,${.5 * world})`; x.lineWidth = 6;
          for (let i = 0; i < 16; i++) { const ox = (i * 211 + t * 40) % (W + 200) - 100; x.beginPath(); x.moveTo(ox, H); x.bezierCurveTo(ox + 90 * Math.sin(t + i), H * .66, ox - 90 * Math.cos(t * 1.3 + i), H * .33, ox + 40 * Math.sin(t * .7 + i), 0); x.stroke(); }
        }
      }, .3);
      // close-up -> pull back to a hero shot
      const zoom = lerp(7.2, 3.1, ease.inOut(seg(t, 2.6, 3.8))), yy = lerp(H + 330, H - 40, ease.inOut(seg(t, 2.6, 3.8)));
      c.save(); if (flare > 0 && flare < 1) c.translate(rand(-3, 3) * (1 - flare), rand(-3, 3) * (1 - flare));
      A(c, W / 2, yy, zoom, t, 'idle', { transformed: false, unveil: veil, bfT: 0 });
      c.restore();
      // the eyes ignite: pixel star bursts
      if (flare > 0) {
        const ex = W / 2 + 7 * zoom, ey = yy - 103 * zoom;
        c.save(); c.globalCompositeOperation = 'lighter';
        glowCircle(c, ex, ey, 40 + flare * 420 * (1 - world * .8), `rgba(100,210,255,${.7 * (1 - world * .6)})`, 'rgba(0,0,0,0)');
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * .4, L = 340 * flare * (1 - world * .7); c.strokeStyle = 'rgba(200,240,255,0.65)'; c.lineWidth = 6; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(a) * L, ey + Math.sin(a) * L); c.stroke(); }
        c.restore();
      }
      if (t > 3.0) { // Blue and Red come to orbit him
        const a = t * 2.6, cx = W / 2, cy = H - 40 - 70 * 3.1;
        c.save(); c.globalCompositeOperation = 'lighter';
        glowCircle(c, cx + Math.cos(a) * 210, cy + Math.sin(a) * 60, 60, 'rgba(60,130,255,0.95)', 'rgba(0,0,0,0)'); glowCircle(c, cx - Math.cos(a) * 210, cy - Math.sin(a) * 60, 60, 'rgba(255,50,60,0.95)', 'rgba(0,0,0,0)'); c.restore();
        for (let i = 0; i < 2; i++) fx.add({ x: cx + (i ? -1 : 1) * Math.cos(a) * 210, y: cy + (i ? -1 : 1) * Math.sin(a) * 60, vx: rand(-60, 60), vy: rand(-80, -10), life: .7, size: 5, color: i ? '#ff6a70' : '#7ab4ff', glow: true });
      }
      fx.draw(c);
      caption(c, 'Let me see you properly.', t, 0.2, 1.7, '#bfe8ff');
      flashAt(c, t, 1.95, 2.4, '#e8f8ff'); flashAt(c, t, 2.9, 3.2, '#bfe4ff');
      titleSlam(c, 'SIX EYES', 'THE STRONGEST, UNSEALED', t, 3.5, '#8fd0ff', 118);
    },
  };
}

// UNLIMITED VOID — hand sign, the sky folds shut, and the foe is handed everything at once.
function csUnlimitedVoid(a, opp) {
  const fx = new ParticleSystem(700), A = PxKit.actor(a.def), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7, glyphs = ['∞', 'INFORMATION', 'EVERYTHING', 'NOTHING', 'ALL AT ONCE', '無量空処', 'SEE', 'KNOW', '0', '1'];
  return {
    name: 'UNLIMITED VOID', dur: 8.4, fx,
    cues: [[0, () => gjSfx('gojDomain')], [1.9, () => gjSfx('gojClap')], [2.6, () => gjSfx('suck', 1.2)], [3.4, () => gjSfx('gojPurple')], [5.9, () => gjSfx('boom')], [6.0, () => gjSfx('gojEyes')]],
    draw(c, t) {
      const sign = ease.inOut(seg(t, 0.2, 1.7)), fold = ease.in(seg(t, 1.9, 3.3)), void_ = seg(t, 3.0, 3.8), over = ease.in(seg(t, 4.6, 5.8)), after = t - 5.9;
      if (t < 2.2) { // 1. the sign, up close; the world is still the city at dusk
        PxKit.scene(c, x => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a1030'); g.addColorStop(1, '#5a3a5a'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.fillStyle = '#0c0818'; for (let i = 0; i < 14; i++) x.fillRect(i * 100 - 20, H - 120 - (i * 53 % 7) * 30, 90, 400); }, .3);
        A(c, W / 2 - 40, H + 230 - sign * 20, 6.2 + sign * .6, t, 'cast_up', { transformed: false, sign: true, unveil: 0 });
        c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2 - 40 + 40 * 6.4, H + 230 - 126 * 6.4, 40 + sign * 160, 'rgba(160,210,255,0.8)', 'rgba(0,0,0,0)'); c.restore();
        caption(c, 'Domain Expansion...', t, 0.3, 2.0, '#bfe8ff');
        return;
      }
      // 2-4. the world folds into a tunnel of doorways, then the void itself
      PxKit.scene(c, x => {
        x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
        const n = 14; for (let i = n; i >= 0; i--) { const k = ((i + t * 1.6) % n) / n, s = Math.pow(k, 2.2) * (1.3 + (1 - fold) * 2); const w = W * s, h = H * s; x.strokeStyle = `hsla(${200 + i * 8},90%,${50 + k * 35}%,${(.15 + k * .7) * Math.min(1, fold * 2 + void_)})`; x.lineWidth = 3 + k * 14; x.strokeRect(W / 2 - w / 2, H / 2 - h / 2, w, h); }
        x.globalCompositeOperation = 'lighter'; gjStars(x, t * 1.8, 1 + void_, 3);
        glowCircle(x, W / 2, H / 2, 120 + void_ * 300, `rgba(120,190,255,${.25 + .3 * void_})`, 'rgba(0,0,0,0)');
      }, .3);
      if (void_ > 0) { // glyph rain: information the foe cannot stop reading
        c.save(); c.globalAlpha = Math.min(1, void_) * (1 - over); c.font = 'bold 20px monospace'; c.textAlign = 'left';
        for (let i = 0; i < 46; i++) { const col = (i * 61) % W, y = ((t * (140 + (i % 7) * 40) + i * 97) % (H + 120)) - 60; c.fillStyle = i % 5 ? 'rgba(160,220,255,0.85)' : 'rgba(255,255,255,0.95)'; c.fillText(glyphs[i % glyphs.length], col, y); }
        c.restore();
      }
      // the foe, pinned in the middle and shaking under the load
      const sh = Math.max(0, void_ * (3 + over * 12)), ox = W / 2 + 120 + rand(-sh, sh), oy = H - 60 + rand(-sh, sh);
      if (after < 0.1) {
        silhouette(c, o => drawCharAt(o, opp.def, ox, oy, oppScale, -1, { pose: t > 4.2 ? 'stun' : 'block', anim: t, transformed: opp.transformed }), over > .4 ? '#ffffff' : '#c8e8ff');
        // Gojo stands apart, calm, one hand up
        A(c, W / 2 - 320, H - 60, 2.4, t, 'idle', { transformed: true, unveil: 1, sign: true });
      }
      if (t > 3.6 && after < 0.1) { c.globalAlpha = Math.min(1, seg(t, 3.6, 4.6)); bigText(c, 'UNLIMITED VOID', W / 2, 96, 74, '#8fd0ff', '#000'); c.globalAlpha = 1; }
      // overload: the screen shreds into static
      if (over > 0 && after < 0.1) { for (let i = 0; i < 120 * over; i++) { c.fillStyle = Math.random() < .5 ? '#ffffff' : '#7ac0ff'; c.fillRect(rand(0, W), rand(0, H), rand(6, 70), rand(2, 8)); } flash(c, over * .6, '#ffffff'); }
      // 5.9+: silence. the foe drops; Gojo turns away
      if (after >= 0) {
        PxKit.scene(c, x => { x.fillStyle = '#05060e'; x.fillRect(0, 0, W, H); x.fillStyle = '#0d1020'; x.fillRect(0, H - 150, W, 150); x.globalCompositeOperation = 'lighter'; gjStars(x, t * .4, 1.4, 9); }, .3);
        const fall = ease.in(seg(after, .2, 1.1));
        c.save(); c.translate(W / 2 + 200, H - 90 + 40 * fall); c.rotate(-fall * 1.45); drawCharAt(c, opp.def, 0, 0, oppScale, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }); c.restore();
        A(c, W / 2 - 260, H - 90, 2.6, t, 'idle', { transformed: true, unveil: 1 });
        flashAt(c, t, 5.9, 6.4, '#ffffff');
        if (after > 1.2) titleSlam(c, 'UNLIMITED VOID', "NAH, I'D WIN", t, 7.1, '#8fd0ff', 100);
      }
    },
  };
}
rival('gojo', 'yuji', [[0, 'Yuji! Show me what you learned.'], [1, "Sensei, please don't use Infinity this time."], [0, 'No promises.']],
  { gojo: 'Good job! You lasted a whole round.', yuji: 'I... actually hit him?!' });
rival('gojo', 'dio', [[1, 'A man who cannot be touched? DIO will stop your time.'], [0, "Cool. I'll still be the strongest in stopped time."]],
  { gojo: "Nah, I'd win. And I did.", dio: 'Even infinity must kneel to DIO.' });

// ============================================================
//  SIX EYES: a second moveset and a second ultimate.
// ============================================================
// Red, at maximum output: the orb detonates a second time where it lands, a ring of repulsion that flings everything near.
Combat.hz.gojoRedMax = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  h.x += h.vx / FPS;
  for (const o of this.targets(h.side)) if (Math.abs(o.x - h.x) < 56 + o.w / 2 && Math.abs((o.y - o.h / 2) - h.y) < 80) {
    Combat.resolveHit(o, f, H_({ dmg: 125, guard: 'mid', hs: 34, kb: [1500 * Math.sign(h.vx), -520], launch: true, wb: true, sfx: 'h' }), { proj: true, fromX: h.x - h.vx });
    f.gauge = Math.min(100, f.gauge + 8);
    for (const e of this.targets(h.side)) if (e !== o && Math.hypot(e.x - h.x, e.y - e.h / 2 - h.y) < 190) Combat.resolveHit(e, f, H_({ dmg: 44, guard: 'mid', hs: 20, kb: [Math.sign(e.x - h.x || 1) * 700, -420], launch: true, sfx: 'h' }), { proj: true, fromX: h.x });
    Combat.addHazard({ kind: 'gojoBurst', owner: f, side: f.side, x: h.x, y: h.y, life: 24, col: '255,60,60', ring: true }); Combat.addHazard({ kind: 'gojoBurst', owner: f, side: f.side, x: h.x, y: h.y, life: 16, col: '255,230,230' });
    Cam.shake = 20; gjSfx('impact', 1); return false;
  }
  for (const p of this.projectiles) if (p.side !== h.side && Math.abs(p.x - h.x) < 70 && Math.abs(p.y - h.y) < 70) p.life = 0;
  return h.t < h.life && h.x > 0 && h.x < Arena.stage.width;
};
Combat.drawHz.gojoRedMax = function (c, h, t) { Combat.drawHz.gojoRed(c, h, t); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,230,230,0.7)'; c.lineWidth = 4; c.beginPath(); c.arc(h.x, h.y, 34 + Math.sin(t * 30) * 4, 0, 7); c.stroke(); c.restore(); };

const GJ_F_BLUE = mk({ name: 'Blue: Twin Lapse', desc: 'Six Eyes (10 CE): two points of attraction, one fast and one slow and wide, pulling from both sides of the foe.', pose: 'cast', s: 12, a: 1, r: 16, gjCharge: 'blue', ai: { min: 120, max: 900, use: 'zone' },
  ev: { 3: () => gjSfx('gojBlue'), 12: f => { if (!gjSpend(f, 20)) return; Combat.addHazard({ kind: 'gojoBlue', owner: f, side: f.side, x: f.x + f.facing * 90, y: f.y - 80 * f.scale, vx: f.facing * 1250, life: 70 }); Combat.addHazard({ kind: 'gojoBlue', owner: f, side: f.side, x: f.x + f.facing * 90, y: f.y - 40 * f.scale, vx: f.facing * 520, life: 130 }); } } });
const GJ_F_RED = mk({ name: 'Red: Max Output', desc: 'Six Eyes (30 CE): a faster Red that detonates twice. The second ring throws everything near the impact.', pose: 'cast', s: 16, a: 1, r: 20, gjCharge: 'red', ai: { min: 60, max: 900, use: 'zone' },
  ev: { 2: () => gjSfx('gojRed'), 16: f => { if (!gjSpend(f, 30)) return; Combat.addHazard({ kind: 'gojoRedMax', owner: f, side: f.side, x: f.x + f.facing * 60, y: f.y - 82 * f.scale, vx: f.facing * 1500, life: 80 }); } } });
const GJ_F_STEP = Mv.teleport({ name: 'Limitless Step', desc: 'Six Eyes: vanishes, appears behind the foe and strikes in the same breath, and the strike is always a BLACK FLASH.', to: 'behind', s: 5, hitDelay: 5, pose: 'heavy', cd: 2, inv: [1, 12], hit: { dmg: 66, box: [0, -110, 76, 100], kb: [380, -260], launch: true, hs: 24 } });
{ const e5 = GJ_F_STEP.ev[4]; GJ_F_STEP.ev = { 1: f => { Combat.addHazard({ kind: 'gojoStep', owner: f, side: f.side, x: f.x, life: 18 }); gjSfx('gojStep'); }, 4: f => { e5(f); f.bfT = 80; } }; }
const GJ_F_WARD = mk({ name: 'Infinity: Absolute', desc: 'Six Eyes: Infinity closes around him for 3s. Projectiles are thrown back, anything touching him is pushed away, and a shield absorbs the rest.', pose: 'block', s: 6, a: 20, r: 16, cd: 6, ai: { min: 0, max: 400, use: 'buff' },
  ev: { 6: f => { Combat.reflect(f); Combat.buff(f, { shield: 260 }, 3, 'Infinity'); gjSfx('gojInfinity'); gjSfx('gojClap'); Combat.addHazard({ kind: 'gojoBurst', owner: f, side: f.side, x: f.x, y: f.y - 70, life: 26, col: '160,210,255', ring: true }); } } });

const GJ_F_ULT = superize(mk({ name: 'HOLLOW PURPLE 200%', desc: 'Six Eyes: Blue and Red at maximum output merge into a beam of imaginary mass that erases a lane of the stage. Needs a full gauge. Blockable. Must connect.', pose: 'cast', s: 74, a: 30, r: 30, gjCharge: 'purple',
  ev: { 2: f => { f.say('Nine ropes, polarized light, crow and declaration...', 140); gjSfx('gojPurple'); gjSfx('riser', 2.2, 0.22, 0, 90, 1100); },
    74: f => { f.say('Hollow Technique: Purple.', 80); Combat.fireBeam(f, { len: 2800, width: 160, dur: 34, dmg: 6, tick: 6, super: true, ultConnect: true, color: '#b070ff', core: '#ffffff' }); Cam.shake = 22; gjSfx('gojRed'); gjSfx('impact', 1); gjSfx('boom'); } } }), 300);
GJ_F_ULT.id = 'gojo_fult'; GJ_F_ULT.recoverWhiff = 40;
GJ_F_ULT.ult = { dmg: 1320, cutscene: (a, t) => csPurple200(a, t), fx: { el: 'light', color: '#b070ff' } };

Object.assign(gojo.form, { moves: { '5S': GJ_F_BLUE, '6S': GJ_F_RED, '4S': GJ_F_STEP, '2S': GJ_F_WARD }, ult: GJ_F_ULT });
for (const [slot, m] of Object.entries(gojo.form.moves)) { m.id = 'gojo_f' + slot; m.slot = slot; m.owner = 'gojo'; }
gojo.form.desc = 'Permanent. The blindfold comes off: techniques cost half, and he gains a second moveset (Twin Lapse Blue, Max Output Red, Limitless Step, Infinity: Absolute), the ultimate HOLLOW PURPLE 200%.';
// HOLLOW PURPLE 200% — Blue and Red are drawn out of the air on either side of him and collide; the world is a lane of erased light.
function csPurple200(a, opp) {
  const fx = new ParticleSystem(1800), A = PxKit.actor(a.def), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
  return {
    name: 'HOLLOW PURPLE 200%', dur: 8.6, fx,
    cues: [[0, () => gjSfx('gojEyes')], [1.5, () => gjSfx('gojBlue')], [2.4, () => gjSfx('gojRed')], [3.6, () => gjSfx('gojPurple')], [5.3, () => { gjSfx('gojRed'); gjSfx('impact', 1); gjSfx('boom'); }], [6.4, () => gjSfx('gojClap')]],
    draw(c, t) {
      const gather = ease.inOut(seg(t, 1.4, 3.8)), fire = t - 5.3, gy = H - 74, ax = W * .2, cx = ax + 110, cy = gy - 230;
      PxKit.scene(c, x => {
        const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05030e'); g.addColorStop(1, `rgb(${lerp(20, 60, gather) | 0},${lerp(24, 20, gather) | 0},${lerp(50, 110, gather) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.globalCompositeOperation = 'lighter'; gjStars(x, t, .5 + gather); glowCircle(x, cx + 90, cy, 520 * gather, 'rgba(150,70,255,0.4)', 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over';
        x.fillStyle = '#0a0818'; x.fillRect(0, gy, W, H - gy);
        if (fire > 0) { const w = 170 * Math.min(1, fire * 5) * (1 - seg(fire, 1.8, 3)) + 4; x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(120,40,220,0.7)'; x.fillRect(cx, cy - w * 1.5, W, w * 3); x.fillStyle = 'rgba(210,150,255,0.9)'; x.fillRect(cx, cy - w, W, w * 2); x.fillStyle = '#fff'; x.fillRect(cx, cy - w * .4, W, w * .8); x.globalCompositeOperation = 'source-over'; }
      }, .3);
      A(c, ax, gy + 4, 2.8, t, t < 5.3 ? 'cast' : 'heavy', { transformed: true, unveil: 1, move: t < 5.3 ? { gjCharge: 'purple' } : null, mf: 0 });
      // Blue (left) and Red (right) are called in from the edges and spiral together
      if (t > 1.4 && fire < 0) { const sep = (1 - gather) * 340, an = t * 7; c.save(); c.globalCompositeOperation = 'lighter';
        const bx = cx + 90 - Math.cos(an) * sep, by = cy - Math.sin(an) * sep * .6, rx = cx + 90 + Math.cos(an) * sep, ry = cy + Math.sin(an) * sep * .6;
        glowCircle(c, bx, by, 70, 'rgba(60,130,255,0.95)', 'rgba(0,0,0,0)'); glowCircle(c, rx, ry, 70, 'rgba(255,50,60,0.95)', 'rgba(0,0,0,0)');
        if (gather > .9) { const R = 40 + (gather - .9) * 600; glowCircle(c, cx + 90, cy, R * 2, 'rgba(160,80,255,0.7)', 'rgba(0,0,0,0)'); c.fillStyle = '#e0c0ff'; c.beginPath(); c.arc(cx + 90, cy, R, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(cx + 90, cy, R * .5, 0, 7); c.fill(); }
        for (let i = 0; i < 3; i++) fx.add({ x: bx, y: by, vx: rand(-60, 60), vy: rand(-60, 60), life: .5, size: 5, color: '#7ab4ff', glow: true }), fx.add({ x: rx, y: ry, vx: rand(-60, 60), vy: rand(-60, 60), life: .5, size: 5, color: '#ff6a70', glow: true });
        c.restore(); }
      // the foe, at the far end of the lane
      const ox = W * .78;
      if (fire < 0.12) silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4, oppScale, -1, { pose: 'block', anim: t, transformed: opp.transformed }), fire > 0 ? '#ffffff' : '#241a4a');
      else { const k = seg(fire, .12, 1.3); for (let i = 0; i < 10; i++) { c.save(); c.beginPath(); c.rect(0, gy - 260 + i * 26, W, 26); c.clip(); c.globalAlpha = Math.max(0, 1 - k * 1.3 - i * .02); c.translate(k * 380 * (.3 + i * .08), 0); silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4, oppScale, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), '#e0c0ff'); c.restore(); } }
      fx.draw(c);
      if (t < 1.4) caption(c, 'Let me show you something from the limit.', t, .3, 1.35, '#bfe8ff');
      if (t > 2.0 && t < 5.2) caption(c, 'Nine ropes, polarized light, crow and declaration.', t, 2.1, 5.1, '#d6c0ff');
      flashAt(c, t, 5.3, 5.9, '#ffffff');
      if (t > 6.5) titleSlam(c, 'HOLLOW PURPLE 200%', 'THROUGHOUT HEAVEN AND EARTH', t, 6.6, '#b070ff', 92);
    },
  };
}
