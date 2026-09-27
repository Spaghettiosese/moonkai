// ============================================================
//  MOONKAI — MADAME ROSE, the Crimson Countess (rebuilt).
//
//  GAUGE   · BLOOD   every drop she draws is stored, not wasted. Kiss of Death drinks all of it
//                    for a heal; Blood Pool spends it to grow bigger and last longer.
//  PASSIVE · THE WALTZ  the ball never stops: a beat pulses under her feet (ONE-two-three). A
//                    special started ON THE BEAT is graceful: +25% damage and it bleeds.
//  SUPER · MASQUERADE  she bursts into a swarm of bats that swirls around the foe, biting,
//                    then re-forms behind them.
//  CRIMSON WALTZ      ultimate: she offers her hand, and a slow drift of rose petals floats at
//                    the foe. Accept the invitation and the dance begins. Blockable. Must connect.
// ============================================================
const rsSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const ROSE = charById('rose');
const RS_BEAT = 40, RS_WIN = 8;
const RS_PAL = { build: 'curvy', skin: '#f0e0e8', top: '#6a0a1a', topDark: '#3a0010', pants: '#3a0010', pantsDark: '#200008', boots: '#1a0008', skirt: '#8a0a2a', glove: '#1a0008', noFace: true };
const rsOnBeat = f => { const k = (Game.battle ? Game.battle.frame : 0) % RS_BEAT; return k < RS_WIN || k > RS_BEAT - 3; };
const rsBlood = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };

function drawRose(c, v) {
  const t = v.anim || 0, E = !!v.transformed, m = v.move;
  drawHumanoid(c, v, RS_PAL, {
    back(c, P) { // high collared cape and a long ball gown
      if (E) for (const s of [-1, 1]) { c.save(); c.translate(P.sh[0] - 4, P.sh[1] + 4); c.rotate(-0.6 + s * 0.3 + Math.sin(t * 4) * 0.12); c.fillStyle = '#1a0008'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, -50); c.lineTo(-96, -36); c.lineTo(-78, -14); c.lineTo(-100, 0); c.lineTo(-62, 8); c.lineTo(-24, 18); c.closePath(); c.fill(); c.strokeStyle = '#c01030'; c.lineWidth = 1; c.stroke(); c.restore(); }
      c.fillStyle = '#1a0008'; c.strokeStyle = '#000'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(P.sh[0] - 10, P.sh[1] - 4); c.lineTo(P.sh[0] - 4, P.sh[1] - 26); c.lineTo(P.sh[0] + 10, P.sh[1] - 4); c.lineTo(P.sh[0] + 4, P.hip[1] + 60); c.lineTo(P.sh[0] - 34, P.hip[1] + 62 + Math.sin(t * 2) * 4); c.closePath(); c.fill();
      c.fillStyle = '#c01030'; c.beginPath(); c.moveTo(P.sh[0] - 6, P.sh[1] - 20); c.lineTo(P.sh[0] + 6, P.sh[1] - 4); c.lineTo(P.sh[0] - 4, P.sh[1]); c.fill();
      c.fillStyle = '#8a0a2a'; c.strokeStyle = '#3a0010'; c.beginPath(); c.moveTo(P.hip[0] - 14, P.hip[1]); c.lineTo(P.hip[0] + 14, P.hip[1]); c.quadraticCurveTo(P.hip[0] + 36, P.hip[1] + 50, P.hip[0] + 30, P.hip[1] + 88); c.lineTo(P.hip[0] - 36, P.hip[1] + 88); c.quadraticCurveTo(P.hip[0] - 36, P.hip[1] + 40, P.hip[0] - 14, P.hip[1]); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#c01030'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(P.hip[0] - 10 + i * 10, P.hip[1] + 6); c.lineTo(P.hip[0] - 22 + i * 22, P.hip[1] + 86); c.stroke(); }
    },
    chest(c, P) { circle(c, P.sh[0] + 3, P.sh[1] + 6, 3.5, '#c01030'); },                       // ruby brooch
    head(c, P) {
      const [hx, hy] = P.head;
      c.fillStyle = '#1a0008'; c.beginPath(); c.moveTo(hx - 6, hy - 10); c.quadraticCurveTo(hx - 26, hy + 10, hx - 16, hy + 36); c.lineTo(hx - 4, hy + 6); c.closePath(); c.fill();        // long black hair
      shadedHead(c, hx, hy, 10.5, '#f0e0e8');
      c.fillStyle = '#1a0008'; c.beginPath(); c.moveTo(hx - 11, hy); c.quadraticCurveTo(hx - 6, hy - 16, hx + 8, hy - 11); c.quadraticCurveTo(hx + 12, hy - 7, hx + 11, hy - 4); c.quadraticCurveTo(hx, hy - 8, hx - 11, hy); c.fill();
      c.beginPath(); c.arc(hx - 4, hy - 13, 5, 0, Math.PI * 2); c.fill();                                                                  // updo
      c.strokeStyle = '#1a0008'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx + 3, hy - 4); c.lineTo(hx + 10, hy - 3); c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 1.5, E ? 6 : 4, 'rgba(255,32,64,1)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#8a0a2a'; c.beginPath(); c.moveTo(hx + 4, hy + 5); c.quadraticCurveTo(hx + 8, hy + 7, hx + 10, hy + 5); c.lineTo(hx + 7, hy + 6.5); c.fill();                          // dark lips
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(hx + 8.5, hy + 5.5); c.lineTo(hx + 9, hy + 8); c.lineTo(hx + 9.5, hy + 5.5); c.fill();                                                     // one fang
    },
    front(c, P) { // folding fan
      c.save(); c.translate(P.fH[0], P.fH[1]); c.rotate(m ? -0.3 : 0.8);
      const open = m ? 1 : 0.35; c.fillStyle = '#c01030'; c.strokeStyle = '#1a0008'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 26, -0.9 * open - 0.2, 0.9 * open - 0.2); c.closePath(); c.fill(); c.stroke();
      for (let i = 0; i < 6; i++) { const a = -0.2 + (-0.9 + i * 0.36) * open; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); c.stroke(); }
      c.restore();
    },
  });
}
function drawRosePortrait(c, opts) {
  const E = !!opts.form;
  const g = c.createRadialGradient(50, 40, 10, 50, 50, 70); g.addColorStop(0, '#3a0010'); g.addColorStop(1, '#050002'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.fillStyle = '#1a0008'; c.beginPath(); c.moveTo(14, 100); c.lineTo(8, 50); c.lineTo(30, 70); c.lineTo(70, 70); c.lineTo(92, 50); c.lineTo(86, 100); c.fill();          // standing collar
  c.fillStyle = '#c01030'; c.beginPath(); c.moveTo(10, 54); c.lineTo(28, 70); c.lineTo(22, 74); c.fill(); c.beginPath(); c.moveTo(90, 54); c.lineTo(72, 70); c.lineTo(78, 74); c.fill();
  c.fillStyle = '#1a0008'; c.beginPath(); c.moveTo(28, 50); c.quadraticCurveTo(24, 16, 50, 14); c.quadraticCurveTo(76, 16, 72, 50); c.lineTo(76, 90); c.lineTo(24, 90); c.closePath(); c.fill();
  c.fillStyle = '#f0e0e8'; c.strokeStyle = '#8a6a78'; c.lineWidth = 1.1;
  c.beginPath(); c.moveTo(36, 36); c.lineTo(64, 36); c.lineTo(64, 56); c.lineTo(57, 68); c.lineTo(50, 71); c.lineTo(43, 68); c.lineTo(36, 56); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1a0008'; c.beginPath(); c.moveTo(34, 44); c.quadraticCurveTo(40, 26, 66, 32); c.lineTo(60, 38); c.quadraticCurveTo(46, 34, 34, 44); c.fill();
  for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 4, 50); c.quadraticCurveTo(50 + s * 9, 47.5, 50 + s * 14, 49); c.quadraticCurveTo(50 + s * 9, 52, 50 + s * 4, 50); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50 + s * 9, 50, E ? 7 : 4.5, 'rgba(255,32,64,1)', 'rgba(0,0,0,0)'); c.restore(); circle(c, 50 + s * 9, 50, 1.2, '#300');
    c.strokeStyle = '#1a0008'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(50 + s * 3, 47.5); c.lineTo(50 + s * 14, 46); c.stroke(); }
  c.fillStyle = '#8a0a2a'; c.beginPath(); c.moveTo(43, 61); c.quadraticCurveTo(50, 64, 57, 61); c.quadraticCurveTo(50, 62.5, 43, 61); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(53, 61.5); c.lineTo(54, 66); c.lineTo(55, 61.8); c.fill();
  c.fillStyle = '#c01030'; c.beginPath(); c.arc(56, 66.5, 1, 0, Math.PI * 2); c.fill();                                                       // a drop of blood
}

// ---------------- kit ----------------
const RS_SWARM = Mv.shot({ name: 'Bat Swarm', desc: 'Homing bats.', proj: { speed: 600, r: 10, dmg: 30, count: 3, spread: 0.4, homing: 2, kind: 'bat', color: '#1a0a14', trail: false } });
const RS_MIST = Mv.teleport({ name: 'Mist Form', desc: 'Dissolves into mist and strikes from behind.', to: 'behind', hit: { dmg: 80 } });
const RS_KISS = Object.assign(Mv.grab({ name: 'Kiss of Death', desc: 'Draining bite. Drinks ALL stored BLOOD as a heal (x2).', range: 56, grabData: { anim: 'drain', dmg: 170, frames: 40 } }),
  { onHit: a => { const b = a.gauge || 0; if (b > 5) { Combat.healSelf(a, Math.round(b * 2)); a.gauge = 0; } } });
const RS_POOL = mk({ name: 'Blood Pool', desc: 'A pool of blood under the foe that drains. Spends up to 40 BLOOD to grow bigger and last longer.', pose: 'cast', s: 12, a: 1, r: 18, cd: 5, ai: { min: 150, max: 1400, use: 'zone' },
  ev: { 12: f => { const b = Math.min(40, f.gauge || 0); f.gauge -= b; const k = 1 + b / 40; Combat.place(f, { kind: 'zone', at: 'enemy', r: 90 * k, life: 3 * k, every: 0.4, dmg: 14, color: '#c01030', status: { bleed: 1 } }); } } });
const RS_SWOOP = Mv.dive({ name: 'Swoop', desc: 'Bat-wing dive.', vx: 900, vy: 700, hit: { dmg: 80 } });
const RS_SUPER = superize(mk({ name: 'Masquerade', desc: 'Bursts into a swarm of bats that swirls around the foe, biting, then re-forms behind them.', pose: 'cast', s: 8, a: 60, r: 16, inv: [8, 68],
  ev: { 8: f => { f.rsSwarm = true; rsSfx('tone', 1400, 0.3, 'triangle', 0.04, 2600); } } }), 100);
const RS_ULT = superize(mk({ name: 'CRIMSON WALTZ', desc: 'She offers her hand: a slow drift of rose petals floats at the foe. Accept the invitation, and the dance begins. Blockable. Must connect.', pose: 'cast', s: 30, a: 10, r: 30,
  ev: { 2: f => f.say('May I have this dance?', 80), 30: f => Combat.addHazard({ kind: 'rsPetals', owner: f, side: f.side, x: f.x + f.facing * 60, y: -100, dir: f.facing, life: 5 * FPS }) } }), 300);
RS_ULT.id = 'rose_ult'; RS_ULT.recoverWhiff = 30;
RS_ULT.ult = { dmg: 1100, cutscene: (a, t) => csRoseWaltz(a, t), fx: { el: 'blood', color: '#c01030' }, after: a => Combat.healSelf(a, 250) };

Object.assign(ROSE, {
  role: 'Drain · Rhythm · Blood economy', handArt: true, draw: drawRose, drawPortrait: drawRosePortrait, transformCutscene: f => csRoseCountess(f),
  gauge: { name: 'BLOOD', max: 100, color: '#c01030' },
  passive: ['The Waltz', 'A beat pulses under her feet. A special started ON THE BEAT is graceful: +25% damage and it bleeds.'],
  passiveDmg: f => (f.rsGrace && f.move ? 1.25 : 1),
  moves: { '5S': RS_SWARM, '6S': RS_MIST, '2S': RS_KISS, '4S': RS_POOL, 'jS': RS_SWOOP },
  super: RS_SUPER, ult: RS_ULT, ultAct: 'shot',
  form: Object.assign(ROSE.form || {}, { desc: 'Permanent. Bat wings and flight, 10% lifesteal, a doubled beat window, and her hits store twice the BLOOD.', model: undefined }),
});
for (const [slot, m] of Object.entries(ROSE.moves)) { m.id = 'rose_' + slot; m.slot = slot; m.owner = 'rose'; if (slot === 'jS') m.air = true; }
RS_SUPER.id = 'rose_super';
ROSE.onRoundStart = f => { f.gauge = 0; f.rsGrace = false; };
ROSE.onHit = (a, t, dmg) => { rsBlood(a, dmg * (a.form ? 0.16 : 0.08)); if (a.rsGrace) t.status.bleed = Math.max(t.status.bleed || 0, 2); };
ROSE.passiveTick = f => {
  if (f.move && f.mf === 1) { const win = f.form ? RS_WIN * 2 : RS_WIN; const k = (Game.battle ? Game.battle.frame : 0) % RS_BEAT; f.rsGrace = f.move.kind === 'special' && (k < win || k > RS_BEAT - 3); if (f.rsGrace) { Game.popWorld(f.x, f.y - f.h - 30, '♪ GRACEFUL', '#ff6a8a', 16); } }
  if (!f.move) f.rsGrace = false;
};
ROSE.drawWorldBack = (c, f) => {
  const B = Game.battle; if (!B) return; const k = (B.frame % RS_BEAT) / RS_BEAT, on = rsOnBeat(f);
  c.save(); c.strokeStyle = on ? 'rgba(255,60,100,0.9)' : `rgba(192,16,48,${0.4 * (1 - k)})`; c.lineWidth = on ? 3 : 2;
  c.beginPath(); c.ellipse(f.x, 2, 40 + k * 50, 8 + k * 6, 0, 0, Math.PI * 2); c.stroke(); c.restore();
};
ROSE.moveHook = (f, m) => {
  if (m !== RS_SUPER || !f.rsSwarm) return;
  const o = f.opp; if (!o) return; const k = f.mf - 8;
  f.status.invis = 0.1; f.x = o.x + Math.cos(k * 0.3) * 80; f.y = Math.min(0, o.y - 60 + Math.sin(k * 0.3) * 30);
  if (k % 6 === 0) Combat.resolveHit(o, f, H_({ dmg: 16, guard: 'mid', hs: 6, kb: [0, -30], sfx: 'm' }), { proj: true, fromX: f.x, move: RS_SUPER });
  for (let i = 0; i < 3; i++) Game.fx.add({ x: f.x + rand(-30, 30), y: f.y - rand(20, 120), vx: rand(-200, 200), vy: rand(-100, 100), life: 0.3, size: rand(5, 9), color: '#1a0a14' });
  if (f.mf >= 66) { f.rsSwarm = false; f.x = clamp(o.x - o.facing * 70, 40, Arena.stage.width - 40); f.y = 0; f.faceOpp && f.faceOpp(); f.status.invis = 0;
    Combat.resolveHit(o, f, H_({ dmg: 80, guard: 'mid', hs: 22, kb: [400, -500], launch: true, status: { bleed: 2 }, sfx: 'h' }), { proj: true, fromX: f.x, move: RS_SUPER }); }
};
Combat.hz.rsPetals = function (h) {
  const f = h.owner, o = f && f.opp; if (!f || f.state === 'ko' || !o) return false;
  h.x += h.dir * 3.8; h.y += Math.sign((o.y - o.h / 2) - h.y) * 1.2;
  if (Math.abs(o.x - h.x) < 55 && Math.abs((o.y - o.h / 2) - h.y) < 90) { Combat.resolveHit(o, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: h.x, move: RS_ULT }); return false; }
  return h.t < h.life && h.x > 0 && h.x < Arena.stage.width;
};
Combat.drawHz.rsPetals = (c, h) => {
  for (let i = 0; i < 16; i++) { const a = h.t * 0.05 + i * 0.7, r = 30 + (i % 4) * 10; const x = h.x + Math.cos(a) * r, y = h.y + Math.sin(a * 1.3) * r * 0.8;
    c.save(); c.translate(x, y); c.rotate(a * 2); c.fillStyle = i % 3 ? '#c01030' : '#ff5a7a'; c.beginPath(); c.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 50, 'rgba(255,40,80,0.3)', 'rgba(0,0,0,0)'); c.restore();
};

// ---------------- cinematics ----------------
function csRoseCountess(f) {
  const d = f.def;
  return {
    name: 'COUNTESS UNBOUND', dur: 4, fx: new ParticleSystem(400),
    cues: [[0.1, () => rsSfx('bell')], [1.4, () => rsSfx('bell')], [2.3, () => { rsSfx('boom'); }]],
    draw(c, t) {
      c.fillStyle = '#0a0004'; c.fillRect(0, 0, W, H);
      // chandeliers light one by one over an empty ballroom floor
      for (let i = 0; i < 3; i++) { const lit = t > 0.3 + i * 0.5, x = W * (0.25 + i * 0.25); c.strokeStyle = '#6a5a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 80); c.stroke(); c.fillStyle = '#8a7a4a'; c.beginPath(); c.ellipse(x, 90, 50, 12, 0, 0, Math.PI * 2); c.fill(); if (lit) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, x, 90, 140, 'rgba(255,200,140,0.35)', 'rgba(0,0,0,0)'); c.restore(); } }
      c.fillStyle = '#1a0a0e'; c.fillRect(0, H - 90, W, 90); for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#2a0a14' : '#140508'; c.fillRect(i * W / 16, H - 90, W / 16, 90); }
      drawCharAt(c, d, W / 2, H - 60, 2.6, 1, { pose: t < 2.3 ? 'taunt' : 'victory', anim: t, transformed: t > 2.2 });
      caption(c, 'The ball has begun. You are late.', t, 0.2, 2.1, '#ffb0c0');
      flashAt(c, t, 2.3, 2.6, '#ff5a7a');
      titleSlam(c, 'COUNTESS UNBOUND', 'THE BALL NEVER ENDS', t, 2.4, '#c01030', 84);
    },
  };
}
function csRoseWaltz(a, opp) {
  const fx = new ParticleSystem(900), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'CRIMSON WALTZ', dur: 6.6, fx,
    cues: [0, 0.6, 1.2, 1.8, 2.4, 3.0, 3.6].map((x, i) => [x, () => rsSfx('tone', [440, 554, 659][i % 3], 0.3, 'sine', 0.05, [440, 554, 659][i % 3])]).concat([[4.2, () => { rsSfx('boom'); rsSfx('slam'); }]]),
    draw(c, t) {
      c.fillStyle = '#0a0004'; c.fillRect(0, 0, W, H);
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2, 80, 300, 'rgba(255,190,140,0.25)', 'rgba(0,0,0,0)'); c.restore();
      for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#2a0a14' : '#140508'; c.fillRect(i * W / 16, H - 90, W / 16, 90); }
      if (Math.random() < 0.6) fx.add({ x: rand(0, W), y: -10, vx: rand(-40, 40), vy: rand(60, 140), life: 6, size: rand(4, 7), color: pick(['#c01030', '#ff5a7a']), shape: 'rect', rot: rand(0, 6), vr: 2 });
      fx.draw(c);
      if (t < 4.2) {
        // they turn around each other; each turn she drinks, and the partner pales
        const ang = t * 2.2, cx = W / 2, pale = seg(t, 0.5, 4.2);
        const ax = cx + Math.cos(ang) * 90, ox = cx - Math.cos(ang) * 90;
        const front = Math.sin(ang) > 0;
        const drawOpp = () => silhouette(c, o => drawCharAt(o, opp.def, ox, H - 90, oppScale, Math.cos(ang) > 0 ? 1 : -1, { pose: 'idle', anim: 0, transformed: opp.transformed }), `rgb(${Math.round(60 + 140 * pale)},${Math.round(20 + 180 * pale)},${Math.round(40 + 170 * pale)})`);
        if (front) drawOpp(); drawCharAt(c, a.def, ax, H - 90, 2.4, Math.cos(ang) > 0 ? -1 : 1, { pose: 'taunt', anim: t }); if (!front) drawOpp();
        caption(c, 'One, two, three...', t, 0.2, 2, '#ffb0c0'); caption(c, 'One, two... drink.', t, 2.2, 4, '#ffb0c0');
      } else {
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.65, H - 90, oppScale, -1, { pose: 'kneel', anim: 0, transformed: opp.transformed }), '#d8d0d8');
        drawCharAt(c, a.def, W * 0.35, H - 90, 2.4, 1, { pose: 'victory', anim: t, transformed: true });
        flashAt(c, t, 4.2, 4.5, '#ff5a7a');
        if (t > 4.6) titleSlam(c, 'CRIMSON WALTZ', 'THANK YOU FOR THE DANCE', t, 4.7, '#c01030', 84);
      }
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('rose:')) delete PortraitCache[k]; });
