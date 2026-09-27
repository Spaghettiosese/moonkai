// ============================================================
//  MOONKAI — SATORU GOJO (Jujutsu Kaisen tribute), fighter #66. Remade.
//
//  PASSIVE  · INFINITY    Projectiles that come within reach slow to a crawl and stop just before
//                         touching him. Melee still lands: you have to get close.
//  GAUGE    · CURSED ENERGY  The fuel for his techniques (separate from the passive):
//                         Blue 20 · Red 30 · Hollow Purple needs a FULL gauge (plus 2 bars).
//                         Regenerates; landing Blue/Red refunds some.
//  BLUE (I)       a point of attraction flies out and drags the foe into its core.
//  RED (→I)       a red orb gathers at his fingertip, then fires: a reversal blast that throws
//                 the foe across the stage and off walls.
//  FLASH STEP (←I)  instant reposition behind the foe.
//  HOLLOW PURPLE  super: Blue and Red collide into a huge, slow imaginary mass that rolls across
//                 the stage erasing projectiles, traps and anything in its path.
//  SIX EYES       awakening: blindfold off. Techniques cost half.
//  UNLIMITED VOID ultimate: a slow, deliberate Domain Expansion hand sign. Blockable.
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

// ---------------- technique objects ----------------
Combat.hz.gojoBlue = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  h.x += h.vx / FPS; h.vx *= 0.93;
  for (const o of this.targets(h.side)) { const d = h.x - o.x; if (Math.abs(d) < 230 && o.y > -300) { o.x += Math.sign(d) * Math.min(Math.abs(d), 7); if (h.t % 8 === 0 && Math.abs(d) < 70) { const r = Combat.resolveHit(o, f, H_({ dmg: f.form ? 17 : 13, guard: 'mid', hs: 14, kb: [0, -60], sfx: 'l' }), { proj: true, fromX: h.x }); if (r === 'hit') f.gauge = Math.min(100, f.gauge + 2); } } }
  return h.t < h.life;
};
Combat.drawHz.gojoBlue = function (c, h, t) {
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 70, 'rgba(50,120,255,0.75)', 'rgba(0,0,0,0)');
  c.strokeStyle = 'rgba(160,210,255,0.85)'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { const r = 70 - ((t * 90 + i * 18) % 70); c.beginPath(); c.arc(h.x, h.y, r, 0, Math.PI * 2); c.stroke(); } c.restore();
  circle(c, h.x, h.y, 12, '#06103a'); c.strokeStyle = '#8fd0ff'; c.lineWidth = 2; c.beginPath(); c.arc(h.x, h.y, 12, 0, Math.PI * 2); c.stroke();
};
Combat.hz.gojoRed = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  h.x += h.vx / FPS;
  for (const o of this.targets(h.side)) if (Math.abs(o.x - h.x) < 46 + o.w / 2 && Math.abs((o.y - o.h / 2) - h.y) < 70) {
    const r = Combat.resolveHit(o, f, H_({ dmg: f.form ? 110 : 90, guard: 'mid', hs: 30, kb: [1300 * Math.sign(h.vx), -420], launch: true, wb: true, sfx: 'h' }), { proj: true, fromX: h.x - h.vx });
    if (r === 'hit') f.gauge = Math.min(100, f.gauge + 6);
    Combat.addHazard({ kind: 'gojoBurst', owner: f, side: f.side, x: h.x, y: h.y, life: 16, col: '255,50,50' }); Cam.shake = 14; gjSfx('boom'); return false;
  }
  for (const p of this.projectiles) if (p.side !== h.side && Math.abs(p.x - h.x) < 50 && Math.abs(p.y - h.y) < 50) p.life = 0;
  return h.t < h.life && h.x > 0 && h.x < Arena.stage.width;
};
Combat.drawHz.gojoRed = function (c, h, t) {
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 60, 'rgba(255,40,40,0.85)', 'rgba(0,0,0,0)');
  c.strokeStyle = 'rgba(255,160,150,0.8)'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { const r = 18 + ((t * 120 + i * 14) % 42); c.beginPath(); c.arc(h.x, h.y, r, 0, Math.PI * 2); c.stroke(); }
  c.strokeStyle = 'rgba(255,80,80,0.5)'; c.lineWidth = 16; c.beginPath(); c.moveTo(h.x, h.y); c.lineTo(h.x - Math.sign(h.vx) * 90, h.y); c.stroke(); c.restore();
  circle(c, h.x, h.y, 16, '#ff2a2a'); circle(c, h.x, h.y, 7, '#fff0f0');
};
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
  if (charging) { // blue and red spiralling together
    const a = t * 10, sep = 90 * (1 - k);
    glowCircle(c, h.x + Math.cos(a) * sep, h.y + Math.sin(a) * sep * 0.5, 40, 'rgba(60,130,255,0.9)', 'rgba(0,0,0,0)');
    glowCircle(c, h.x - Math.cos(a) * sep, h.y - Math.sin(a) * sep * 0.5, 40, 'rgba(255,50,50,0.9)', 'rgba(0,0,0,0)');
  }
  const R = h.r * k;
  glowCircle(c, h.x, h.y, R * 2.2, 'rgba(160,60,255,0.6)', 'rgba(0,0,0,0)');
  const g = c.createRadialGradient(h.x, h.y, R * 0.1, h.x, h.y, R); g.addColorStop(0, 'rgba(255,240,255,1)'); g.addColorStop(0.5, 'rgba(190,100,255,0.95)'); g.addColorStop(1, 'rgba(90,20,180,0.2)');
  c.fillStyle = g; c.beginPath(); c.arc(h.x, h.y, R, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(220,180,255,0.7)'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(h.x, h.y, R * (1.1 + i * 0.15) + Math.sin(t * 8 + i) * 4, 0, Math.PI * 2); c.stroke(); }
  if (!charging) { c.lineCap = 'round'; c.strokeStyle = 'rgba(180,90,255,0.22)'; c.lineWidth = R * 1.4; c.beginPath(); c.moveTo(h.x, h.y); c.lineTo(h.x - Math.sign(h.vx) * 260, h.y); c.stroke(); }
  c.restore();
};
Combat.hz.gojoBurst = function (h) { return h.t < h.life; };
Combat.drawHz.gojoBurst = function (c, h) { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 40 + 160 * k, `rgba(${h.col},${0.8 * (1 - k)})`, 'rgba(0,0,0,0)'); c.restore(); };

// ---------------- kit ----------------
const GJ_BLUE = mk({ name: 'Blue', desc: 'Cursed Technique Lapse (20 CE): a point of attraction flies out and drags the foe into its core.', pose: 'cast', s: 14, a: 1, r: 18, gjCharge: 'blue', ai: { min: 120, max: 900, use: 'zone' },
  ev: { 14: f => { if (!gjSpend(f, 20)) return; Combat.addHazard({ kind: 'gojoBlue', owner: f, side: f.side, x: f.x + f.facing * 90, y: f.y - 80 * f.scale, vx: f.facing * 950, life: 80 }); gjSfx('voidHum'); } } });
const GJ_RED = mk({ name: 'Red', desc: 'Reversal (30 CE): a red orb gathers at his fingertip, then fires. It throws the foe across the stage and off walls.', pose: 'cast', s: 22, a: 1, r: 22, gjCharge: 'red', ai: { min: 60, max: 900, use: 'zone' },
  ev: { 22: f => { if (!gjSpend(f, 30)) return; Combat.addHazard({ kind: 'gojoRed', owner: f, side: f.side, x: f.x + f.facing * 60, y: f.y - 82 * f.scale, vx: f.facing * 1200, life: 90 }); gjSfx('blast'); } } });
const GJ_STEP = mk({ name: 'Flash Step', desc: 'Instantly reappears behind the foe.', pose: 'dash', s: 4, a: 1, r: 12, inv: [1, 6], cd: 2, ai: { min: 200, max: 900, use: 'approach' }, ev: { 3: f => Combat.teleport(f, 'behind') } });
const GJ_RISE = Mv.rising({ name: 'Infinity Rise', desc: 'A rising palm that repels upward.', hit: { dmg: 34, multi: 3 } });
const GJ_AIR = Mv.dive({ name: 'Falling Blue', desc: 'Drops with a small Blue in hand; ground bounce.', vx: 450, vy: 1300, hit: { dmg: 76, box: [0, -80, 100, 90], gb: true, kb: [200, 900], guard: 'high' } });
const GJ_PURPLE_MOVE = superize(mk({ name: 'Hollow Purple', desc: 'Needs a FULL cursed-energy gauge. Blue and Red collide into a huge, slow ball of imaginary mass that rolls across the stage erasing everything.', pose: 'cast', s: 50, a: 1, r: 30, gjCharge: 'purple',
  ev: { 1: f => { if ((f.gauge || 0) < gjCost(f, 100) - 0.01) { f.purpleFail = true; Game.popWorld(f.x, f.y - f.h - 30, 'NEEDS FULL CURSED ENERGY', '#b070ff', 16); f.move = null; f.state = 'stand'; f.meter += 200; return; }
    f.gauge -= gjCost(f, 100); f.say('Imaginary technique...', 60); Combat.addHazard({ kind: 'gojoPurple', owner: f, side: f.side, x: f.x, y: f.y - 100, vx: f.facing * 330, r: 72, charge: 48, life: 48 + 8 * FPS }); gjSfx('charge', 0.8); },
    48: f => { f.say('PURPLE.', 60); gjSfx('blast'); gjSfx('boom'); } } }), 200);
GJ_PURPLE_MOVE.id = 'gojo_super';
const GJ_ULT = superize(mk({ name: 'UNLIMITED VOID', desc: 'A slow, deliberate Domain Expansion hand sign. Everything close is drowned in infinite information. Blockable. Must connect.', pose: 'charge', s: 55, a: 2, r: 30,
  ev: { 2: f => { f.say('Domain Expansion...', 90); gjSfx('voidHum'); }, 55: f => { Combat.strikeZone(f, { x: f.x - 380, y: -340, w: 760, h: 346 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: GJ_ULT }); Combat.addHazard({ kind: 'gojoBurst', owner: f, side: f.side, x: f.x, y: -120, life: 30, col: '140,210,255' }); Cam.shake = 14; gjSfx('bell'); } } }), 300);
GJ_ULT.id = 'gojo_ult'; GJ_ULT.ult = { dmg: 1180, cutscene: (a, t) => csUnlimitedVoid(a, t), fx: { el: 'light', color: '#8fd0ff' } };

const gojo = fighter({
  id: 'gojo', name: 'SATORU GOJO', title: 'The Strongest', side: 'HERO', role: 'Zoner · Infinity · Cursed energy', color: '#8fd0ff', color2: '#12121c',
  bio: 'The strongest sorcerer alive. Nothing touches him that he does not allow. He teaches high school. Badly, but with enormous confidence.',
  quote: 'Throughout heaven and earth, I alone am the honored one.',
  ending: 'Gojo takes a teaching job in Metro City. The students learn nothing but have never been safer.',
  hp: 980, walk: 280, rival: 'yuji', handArt: true, draw: drawGojo, drawPortrait: drawGojoPortrait, transformCutscene: f => csSixEyes(f), tall: 1.1, wide: 1.0,
  model: { skin: '#f4e0cc' }, face: { expr: 'smirk' }, style: { speed: 0.95, reach: 1.1 },
  gauge: { name: 'CURSED ENERGY', max: 100, color: '#8fd0ff', label: f => (f.gauge >= gjCost(f, 100) - 0.01 ? '· PURPLE READY' : '') },
  passive: ['Infinity', 'Projectiles that come within reach slow to a crawl and stop just before touching him. Melee still lands.'],
  moves: { '5S': GJ_BLUE, '6S': GJ_RED, '4S': GJ_STEP, '2S': GJ_RISE, 'jS': GJ_AIR },
  super: GJ_PURPLE_MOVE, ult: GJ_ULT,
  form: { name: 'SIX EYES', desc: 'Permanent. The blindfold comes off: every technique costs half, and Blue and Red hit harder.', cost: 200, dmg: 1.08, speed: 1.05 },
  assist: '5S',
  lines: {
    intro: ["Don't worry, I'm the strongest.", 'Oh? You want to fight ME, {opp}?', "I'll go easy. Maybe."],
    win: ["Nah, I'd win.", 'Throughout heaven and earth, I alone am the honored one.', 'That was fun! For me.'],
    taunt: ['Is that it?', 'Yawn.'], form: ['Let me see you properly.'], ult: ['Domain Expansion.'], ultHit: ['Unlimited Void.'], tag: ['Leave it to me.'], enter: ['The strongest has arrived.'], assist: ['Blue.'], moves: ['Blue.', 'Red.', 'Too slow.'],
  },
});
gojo.ult = GJ_ULT; gojo.ultAct = 'strike';
gojo.onRoundStart = f => { f.gauge = 60; };
// Infinity: enemy projectiles near him slow down and stop short
gojo.passiveTick = f => {
  f.gauge = Math.min(100, (f.gauge || 0) + 0.12);
  for (const p of Combat.projectiles) if (p.side !== f.side && p.life > 0) {
    const d = Math.hypot(p.x - f.x, p.y - (f.y - f.h / 2));
    if (d < 150) { const k = d < 75 ? 0 : 0.82; p.vx *= k; p.vy *= k; p.infinity = true; if (d < 75) p.life = Math.min(p.life, 24); }
  }
};
gojo.drawWorldFront = (c, f) => {
  if (f.state === 'benched') return;
  for (const p of Combat.projectiles) if (p.infinity && p.side !== f.side) { c.save(); c.strokeStyle = 'rgba(190,230,255,0.6)'; c.lineWidth = 1.5; c.beginPath(); c.arc(p.x, p.y, (p.r || 10) + 8, 0, Math.PI * 2); c.stroke(); c.restore(); }
};

// ---------------- cinematics ----------------
function csSixEyes(f) {
  return {
    name: 'SIX EYES', dur: 4.0, fx: new ParticleSystem(200),
    cues: [[0, () => gjSfx('whoosh')], [1.6, () => gjSfx('bell')]],
    draw(c, t) {
      c.fillStyle = '#02030a'; c.fillRect(0, 0, W, H);
      if (t < 1.6) {
        c.save(); c.translate(W / 2, H / 2 + 300); c.scale(4.6, 4.6); drawGojo(c, { pose: 'idle', anim: t }); c.restore();
        const k = seg(t, 0.6, 1.5); c.fillStyle = '#050508'; c.fillRect(W / 2 - 60 + k * 400, H / 2 - 170, 120, 40);
        caption(c, 'Let me see you properly.', t, 0.1, 1.5, '#bfe8ff');
      } else {
        const k = ease.out(seg(t, 1.6, 2.4));
        c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, W / 2 + s * 170, H / 2 - 20, 260 * k, 'rgba(60,170,255,0.8)', 'rgba(0,0,0,0)'); c.restore();
        for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(W / 2 + s * 170, H / 2 - 20, 120 * k, 52 * k, 0, 0, Math.PI * 2); c.fill(); circle(c, W / 2 + s * 170, H / 2 - 20, 44 * k, '#2ab0ff'); circle(c, W / 2 + s * 170, H / 2 - 20, 16 * k, '#e8f8ff'); }
        titleSlam(c, 'SIX EYES', 'THE STRONGEST, UNSEALED', t, 2.5, '#8fd0ff', 110);
      }
    },
  };
}
function csUnlimitedVoid(a, opp) {
  const oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.4;
  return {
    name: 'UNLIMITED VOID', dur: 7.2, fx: new ParticleSystem(200),
    cues: [[0, () => gjSfx('voidHum')], [1.8, () => gjSfx('bell')], [2.6, () => gjSfx('voidHum')], [5.2, () => gjSfx('boom')]],
    draw(c, t) {
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      if (t < 1.8) {
        // slow hand sign close-up
        c.save(); c.translate(W / 2, H / 2 + 300); c.scale(4.6, 4.6); drawGojo(c, { pose: 'cast_up', anim: t, transformed: true }); c.restore();
        caption(c, 'Domain Expansion...', t, 0.2, 1.7, '#bfe8ff');
        return;
      }
      const k = seg(t, 1.8, 3.0);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 220; i++) { const a2 = i * 2.39996, r = 20 + (i * 7 + t * 90) % 760; c.fillStyle = `hsla(${190 + (i % 70)},90%,${55 + (i % 35)}%,${0.55 * k})`; c.fillRect(W / 2 + Math.cos(a2) * r, H / 2 + Math.sin(a2) * r * 0.6, 3, 3); }
      glowCircle(c, W / 2, H / 2, 300 * k, 'rgba(120,200,255,0.35)', 'rgba(0,0,0,0)');
      c.restore();
      silhouette(c, o => drawCharAt(o, opp.def, W / 2 + 200, H - 80, oppScale, -1, { pose: t > 3 ? 'stun' : 'block', anim: 0, transformed: opp.transformed }), '#c8e8ff');
      drawCharAt(c, a.def, W / 2 - 200, H - 80, 2.4, 1, { pose: 'taunt', anim: t, transformed: true });
      if (t > 3 && t < 5.2) { c.globalAlpha = 0.8; for (let i = 0; i < 14; i++) smallText(c, ['∞', 'INFORMATION', 'EVERYTHING', 'NOTHING', 'ALL AT ONCE'][i % 5], ((i * 331 + t * 60) % W), ((i * 197) % H), 12 + (i % 4) * 5, '#dff4ff'); c.globalAlpha = 1; bigText(c, 'UNLIMITED VOID', W / 2, 90, 70, '#8fd0ff', '#000'); }
      flashAt(c, t, 5.2, 5.6, '#ffffff');
      if (t > 5.4) titleSlam(c, 'UNLIMITED VOID', "NAH, I'D WIN", t, 5.5, '#8fd0ff', 100);
    },
  };
}
rival('gojo', 'yuji', [[0, 'Yuji! Show me what you learned.'], [1, "Sensei, please don't use Infinity this time."], [0, 'No promises.']],
  { gojo: 'Good job! You lasted a whole round.', yuji: 'I... actually hit him?!' });
rival('gojo', 'dio', [[1, 'A man who cannot be touched? DIO will stop your time.'], [0, "Cool. I'll still be the strongest in stopped time."]],
  { gojo: "Nah, I'd win. And I did.", dio: 'Even infinity must kneel to DIO.' });
