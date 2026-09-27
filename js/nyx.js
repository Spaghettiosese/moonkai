// ============================================================
//  MOONKAI — NYX, the Quiet Blade (rebuilt).
//
//  GAUGE   · SHADOW  fills while she is out of the foe's sight (behind them, or veiled) and on
//                    every backstab. VEIL (↓I) spends 40 to vanish completely for 2.5s.
//  PASSIVE · BACKSTAB  hits from behind deal +35%.
//  CONTRACT          her kunai sign a CONTRACT on the foe (up to 3 marks). SHADOW SWAP (→I)
//                    cashes every mark in: she appears behind them and cuts for +40 per mark.
//  SUPER · SHADOW PUPPET  she leaves a perfect decoy behind and vanishes. Hit the decoy and it
//                    bursts into shadow chains that bind you.
//  DEATH LOTUS       ultimate: she disappears; eight kunai hang in a ring around the foe and
//                    slowly close. Blockable. Must connect.
// ============================================================
const nxSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const NYX = charById('nyx');
const NX_PAL = { build: 'slim', skin: '#e8d0d8', top: '#1a0a20', topDark: '#0e0612', pants: '#1a0a20', pantsDark: '#0e0612', boots: '#0a0a0a', belt: '#ff2a6a', glove: '#140814', noFace: true, bracers: '#2a1a30' };
const nxBehind = (f, t) => t && t.facing === (t.x >= f.x ? 1 : -1);
const nxShadow = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };

function drawNyxBlade(c, x, y, ang, glow) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.fillStyle = '#1a1a1a'; c.fillRect(-10, -2.5, 12, 5);
  c.fillStyle = '#ccd'; c.strokeStyle = '#222'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(2, -2.5); c.lineTo(52, -1); c.lineTo(58, 0); c.lineTo(52, 1.5); c.lineTo(2, 2.5); c.closePath(); c.fill(); c.stroke();
  if (glow) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,42,106,0.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(4, 0); c.lineTo(56, 0); c.stroke(); }
  c.restore();
}
function drawNyx(c, v) {
  const t = v.anim || 0, S = !!v.transformed, m = v.move;
  if (v.status && v.status.invis) c.globalAlpha *= 0.25;
  drawHumanoid(c, v, NX_PAL, {
    back(c, P) { // long scarf tails
      c.strokeStyle = '#ff2a6a'; c.lineWidth = 3; c.lineCap = 'round';
      for (const k of [0, 1]) { c.beginPath(); c.moveTo(P.head[0] - 4, P.head[1] + 8); c.quadraticCurveTo(P.head[0] - 30, P.head[1] + 14 + Math.sin(t * 7 + k) * 6, P.head[0] - 56 - k * 10, P.head[1] + 6 + Math.sin(t * 5 + k) * 12); c.stroke(); }
      c.save(); c.translate(P.sh[0] - 4, P.sh[1] + 8); c.rotate(-0.9); drawNyxBlade(c, 0, 0, 0, false); c.restore();                                  // sheathed blade on back
    },
    head(c, P) {
      const [hx, hy] = P.head;
      c.fillStyle = '#1a0a20'; c.beginPath(); c.arc(hx, hy, 11.5, 0, Math.PI * 2); c.fill();                                                      // hood
      c.fillStyle = '#e8d0d8'; c.beginPath(); c.moveTo(hx - 1, hy - 7); c.lineTo(hx + 11, hy - 6); c.lineTo(hx + 11, hy); c.lineTo(hx - 1, hy + 1); c.closePath(); c.fill();   // eye slit
      c.fillStyle = '#2a0a1a'; c.fillRect(hx - 1, hy + 1, 12, 8);                                                                             // mask
      c.strokeStyle = '#111'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx + 3, hy - 5); c.lineTo(hx + 11, hy - 3); c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 3, S ? 7 : 4.5, 'rgba(255,42,106,1)', 'rgba(0,0,0,0)'); c.restore(); circle(c, hx + 7, hy - 3, 1.2, '#fff');
    },
    front(c, P) {
      const ang = { punch: 0, punch2: 0.2, heavy: 0.8, dash: 0.1, kick: -1.2, uppercut: -1.4, air_spike: 1.3, victory: -0.4, block: -1.8, hurt: 2.1 }[v.pose] ?? 1.9;   // reverse grip at rest
      drawNyxBlade(c, P.fH[0], P.fH[1], ang, S || (m && m.name === 'Shadow Swap'));
      if (S) drawNyxBlade(c, P.bH[0], P.bH[1], ang + 0.3, true);
    },
  });
  c.globalAlpha = 1;
}
function drawNyxPortrait(c, opts) {
  const S = !!opts.form;
  c.fillStyle = '#050008'; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50, 55, 55, S ? 'rgba(160,20,80,0.35)' : 'rgba(80,10,50,0.25)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#1a0a20'; c.beginPath(); c.moveTo(4, 100); c.quadraticCurveTo(10, 20, 50, 16); c.quadraticCurveTo(90, 20, 96, 100); c.fill();
  c.fillStyle = '#e8d0d8'; c.beginPath(); c.moveTo(30, 44); c.lineTo(70, 44); c.lineTo(68, 58); c.lineTo(32, 58); c.closePath(); c.fill();
  c.fillStyle = '#2a0a1a'; c.beginPath(); c.moveTo(30, 58); c.lineTo(70, 58); c.lineTo(64, 84); c.lineTo(50, 90); c.lineTo(36, 84); c.closePath(); c.fill();
  c.strokeStyle = '#140814'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(34, 49); c.lineTo(46, 52); c.moveTo(66, 49); c.lineTo(54, 52); c.stroke();
  for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 4, 54); c.quadraticCurveTo(50 + s * 10, 51.5, 50 + s * 15, 54); c.quadraticCurveTo(50 + s * 10, 56, 50 + s * 4, 54); c.fill(); }
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 10, 54, S ? 9 : 6, 'rgba(255,42,106,1)', 'rgba(0,0,0,0)'); c.restore();
  for (const s of [-1, 1]) circle(c, 50 + s * 10, 54, 1.5, '#1a0010');
  c.strokeStyle = '#ff2a6a'; c.lineWidth = 3; c.beginPath(); c.moveTo(30, 64); c.quadraticCurveTo(10, 72, 2, 66); c.stroke();
  drawNyxBlade(c, 92, 96, -2.2, S);
}

// ---------------- kit ----------------
const nxContract = (a, t) => { Combat.mark(t, a, 'contract', 1, { max: 3, dur: 8, color: '#ff2a6a', label: 'CONTRACT' }); };
const NX_KUNAI = Mv.shot({ name: 'Kunai Fan', desc: 'Two kunai. Each hit signs a CONTRACT mark (max 3).', s: 9, proj: { speed: 1050, r: 7, dmg: 34, count: 2, spread: 0.1, kind: 'kunai', color: '#c01040', trail: false, onHit: (t, p) => nxContract(p.owner, t) } });
const NX_SWAP = mk({ name: 'Shadow Swap', desc: 'Appears behind the foe and cuts. Cashes in every CONTRACT mark: +40 damage each.', pose: 'dash', s: 10, a: 6, r: 16, inv: [1, 12], ai: { min: 100, max: 900, use: 'approach' },
  ev: { 8: f => { const o = f.opp; if (!o) return; f.x = clamp(o.x - o.facing * 70, 40, Arena.stage.width - 40); f.facing = o.x > f.x ? 1 : -1; f.nxCash = Combat.consumeMark(o, 'contract'); Game.fx.burst(f.x, f.y - 70, 14, { color: ['#1a0a20', '#ff2a6a'], size: 8, speed: 250, life: 0.35 }); nxSfx('tone', 1800, 0.08, 'sine', 0.05, 600); } },
  hit: { dmg: 70, box: [-10, -120, 110, 120], kb: [300, -300], hs: 20, sfx: 'h' },
  onHit: (a, t) => { const n = a.nxCash || 0; if (n && t.hp > 1) { t.hp = Math.max(1, t.hp - 40 * n); Game.popWorld(t.x, t.y - t.h - 40, 'CONTRACT x' + n, '#ff2a6a', 22); } a.nxCash = 0; } });
const NX_VEIL = mk({ name: 'Veil', desc: 'Spends 40 SHADOW: invisible for 2.5s, and the next hit crits.', pose: 'charge', s: 10, a: 1, r: 10, ai: { min: 250, max: 1500, use: 'buff' },
  ev: { 10: f => { if ((f.gauge || 0) < 40) { Game.popWorld(f.x, f.y - f.h - 30, 'NOT ENOUGH SHADOW', '#aab', 16); return; } f.gauge -= 40; Combat.buff(f, { invis: true, power: true }, 2.5, 'Veil'); nxSfx('tone', 400, 0.3, 'sine', 0.05, 150); } } });
const NX_PARRY = Mv.counter({ name: 'Blade Parry', desc: 'Counter stance. A parry puts her behind them.', window: 20, dmg: 110 });
const NX_RAIN = Mv.shot({ name: 'Rain of Steel', desc: 'Kunai straight down; each hit signs a CONTRACT.', proj: { speed: 1000, r: 7, dmg: 24, count: 4, spread: 0.6, angle: 1.1, kind: 'kunai', color: '#c01040', trail: false, onHit: (t, p) => nxContract(p.owner, t) } });
const NX_SUPER = superize(mk({ name: 'Shadow Puppet', desc: 'Leaves a decoy where she stood and vanishes for 3s. Hit the decoy and it bursts into shadow chains that bind you.', pose: 'charge', s: 8, a: 1, r: 12,
  ev: { 8: f => { Combat.addHazard({ kind: 'nxDecoy', owner: f, side: f.side, x: f.x, facing: f.facing, life: 240, pose: f.pose }); Combat.buff(f, { invis: true, power: true }, 3, 'Puppet'); f.x = clamp(f.x - f.facing * 180, 40, Arena.stage.width - 40); nxShadow(f, 30); nxSfx('tone', 300, 0.3, 'sine', 0.05, 900); } } }), 100);
const NX_ULT = superize(mk({ name: 'DEATH LOTUS', desc: 'She disappears; eight kunai hang in a ring around the foe and slowly close. Blockable. Must connect.', pose: 'charge', s: 60, a: 8, r: 30,
  ev: { 1: f => { f.say('Close your eyes.', 70); f.nxLotus = Combat.addHazard({ kind: 'nxLotus', owner: f, side: f.side, x: f.opp ? f.opp.x : f.x, y: f.opp ? f.opp.y - f.opp.h / 2 : -90, life: 60 }); nxSfx('tone', 2600, 0.5, 'sine', 0.04, 1300); } } }), 300);
NX_ULT.id = 'nyx_ult'; NX_ULT.recoverWhiff = 40;
NX_ULT.ult = { dmg: 1150, cutscene: (a, t) => csNyxLotus(a, t), fx: { el: 'shadow', color: '#ff2a6a' } };

Object.assign(NYX, {
  role: 'Assassin · Contracts · Stealth', handArt: true, draw: drawNyx, drawPortrait: drawNyxPortrait, transformCutscene: f => csNyxShadows(f),
  weaponTip: 60,
  gauge: { name: 'SHADOW', max: 100, color: '#ff2a6a' },
  passive: ['Backstab', 'Hits from behind deal 35% more damage (and feed SHADOW).'],
  moves: { '5S': NX_KUNAI, '6S': NX_SWAP, '2S': NX_VEIL, '4S': NX_PARRY, 'jS': NX_RAIN },
  super: NX_SUPER, ult: NX_ULT, ultAct: 'strike',
  form: Object.assign(NYX.form, { desc: 'Permanent. Two shadow echoes copy her strikes, and SHADOW fills twice as fast.', model: undefined }),
});
for (const [slot, m] of Object.entries(NYX.moves)) { m.id = 'nyx_' + slot; m.slot = slot; m.owner = 'nyx'; if (slot === 'jS') m.air = true; }
NX_SUPER.id = 'nyx_super';
const _nxEcho = NYX.onHit;
NYX.onHit = (a, t, dmg, h) => { if (nxBehind(a, t)) { nxShadow(a, a.form ? 16 : 8); Game.popWorld(t.x, t.y - t.h - 20, 'BACKSTAB', '#ff2a6a', 14); } if (a.move === NX_PARRY) { a.x = clamp(t.x - t.facing * 70, 40, Arena.stage.width - 40); a.faceOpp && a.faceOpp(); } _nxEcho && _nxEcho(a, t, dmg, h); };
NYX.onRoundStart = f => { f.gauge = 20; };
NYX.passiveTick = f => { const o = f.opp; if (o && (nxBehind(f, o) || f.status.invis) && f.st % 6 === 0) nxShadow(f, f.form ? 2 : 1); };
Combat.hz.nxDecoy = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  for (const t of Combat.targets(f.side)) {
    if (!t.move || !t.move.hit || t.mf < t.move.s || t.mf > t.move.s + t.move.a) continue;
    const r = Combat.hitRect(t, t.move.hit); if (r && rectsOverlap(r, { x: h.x - 25, y: -150, w: 50, h: 150 })) {
      Combat.resolveHit(t, f, H_({ dmg: 90, guard: 'unblock', stun: 1.2, hs: 20, kb: [0, 0], sfx: 'h' }), { force: true, fromX: h.x });
      Game.popWorld(h.x, -170, 'IT WAS A PUPPET', '#ff2a6a', 22); Game.fx.burst(h.x, -80, 30, { color: ['#1a0a20', '#ff2a6a'], size: 10, speed: 400, life: 0.5 }); nxSfx('clang'); return false;
    }
  }
  return h.t < h.life;
};
Combat.drawHz.nxDecoy = (c, h) => { const f = h.owner; c.save(); c.globalAlpha = 0.9 - 0.3 * (h.t / h.life); drawCharAt(c, f.def, h.x, 0, f.scale || 1, h.facing, { pose: 'idle', anim: h.t / FPS }); c.restore(); };
Combat.hz.nxLotus = function (h) {
  const f = h.owner, o = f && f.opp; if (!f || f.state === 'ko') return false;
  if (o) { h.x = lerp(h.x, o.x, 0.1); h.y = lerp(h.y, o.y - o.h / 2, 0.1); }
  if (h.t >= h.life) {
    const R = 50; if (o) Combat.strikeZone(f, { x: h.x - R, y: h.y - R * 1.6, w: R * 2, h: R * 3.2 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: NX_ULT, fromX: h.x });
    Game.fx.burst(h.x, h.y, 24, { color: ['#ff2a6a', '#fff'], size: 6, speed: 400, glow: true, life: 0.4 }); nxSfx('slam'); return false;
  }
  return true;
};
Combat.drawHz.nxLotus = (c, h) => {
  const k = h.t / h.life, R = lerp(220, 30, ease.in(k));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + k * 2; const x = h.x + Math.cos(a) * R, y = h.y + Math.sin(a) * R * 0.8; c.save(); c.translate(x, y); c.rotate(a + Math.PI); c.fillStyle = '#ccd'; c.beginPath(); c.moveTo(18, 0); c.lineTo(-6, -4); c.lineTo(-6, 4); c.closePath(); c.fill(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, 0, 10, 'rgba(255,42,106,0.8)', 'rgba(0,0,0,0)'); c.restore(); }
};

// ---------------- cinematics ----------------
function csNyxShadows(f) {
  const d = f.def;
  return {
    name: 'THOUSAND SHADOWS', dur: 3.8, fx: new ParticleSystem(300),
    cues: [[0.1, () => nxSfx('tone', 200, 0.6, 'sine', 0.05, 80)], [2.1, () => { nxSfx('slam'); nxSfx('boom'); }]],
    draw(c, t) {
      c.fillStyle = '#050008'; c.fillRect(0, 0, W, H);
      // a corridor of paper lanterns going out one by one
      for (let i = 0; i < 8; i++) { const lit = t < 0.3 + i * 0.22; const x = 80 + i * (W - 160) / 7; c.fillStyle = lit ? '#ff5a8a' : '#1a0a14'; c.beginPath(); c.ellipse(x, 120, 16, 24, 0, 0, Math.PI * 2); c.fill(); if (lit) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, x, 120, 50, 'rgba(255,90,140,0.4)', 'rgba(0,0,0,0)'); c.restore(); } }
      const n = t > 2.1 ? 3 : 1;
      for (let i = 0; i < n; i++) { c.save(); c.globalAlpha = i ? 0.45 : 1; drawCharAt(c, d, W / 2 + (i === 1 ? -160 : i === 2 ? 160 : 0), H - 40, 2.6, 1, { pose: t < 2.1 ? 'charge' : 'victory', anim: t, transformed: t > 2 }); c.restore(); }
      caption(c, 'You never see the second one.', t, 0.2, 2, '#ffb0c8');
      flashAt(c, t, 2.1, 2.3, '#ff2a6a');
      titleSlam(c, 'THOUSAND SHADOWS', 'COUNT THEM', t, 2.2, '#ff2a6a', 90);
    },
  };
}
function csNyxLotus(a, opp) {
  const fx = new ParticleSystem(1500), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'DEATH LOTUS', dur: 6.2, fx,
    cues: Array.from({ length: 16 }, (_, i) => [1.2 + i * 0.14, () => nxSfx('tone', 2000 + (i % 4) * 300, 0.04, 'triangle', 0.05, 900)]).concat([[3.8, () => { nxSfx('slam'); nxSfx('boom'); }]]),
    draw(c, t) {
      c.fillStyle = '#050008'; c.fillRect(0, 0, W, H);
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2, H / 2, 300, 'rgba(120,10,60,0.35)', 'rgba(0,0,0,0)'); c.restore();
      silhouette(c, o => drawCharAt(o, opp.def, W / 2, H - 60, oppScale, -1, { pose: t < 1.2 ? 'idle' : 'hurt', anim: t, transformed: opp.transformed }), '#1a0a14');
      if (t < 1.2) { caption(c, 'Close your eyes.', t, 0.1, 1.1, '#ffb0c8'); return; }
      // sixteen cuts from every direction, each a flash of her
      const n = Math.min(16, Math.floor((t - 1.2) / 0.14) + 1);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) { const a2 = i * 2.4; c.strokeStyle = `rgba(255,${60 + (i % 3) * 60},120,${i === n - 1 ? 1 : 0.35})`; c.lineWidth = i === n - 1 ? 6 : 2; c.beginPath(); c.moveTo(W / 2 + Math.cos(a2) * 400, H / 2 + Math.sin(a2) * 300); c.lineTo(W / 2 - Math.cos(a2) * 400, H / 2 - Math.sin(a2) * 300); c.stroke(); }
      c.restore();
      if (t < 3.6) { const a2 = (n - 1) * 2.4; c.save(); c.globalAlpha = 0.8; drawCharAt(c, a.def, W / 2 + Math.cos(a2) * 260, H - 60 - Math.abs(Math.sin(a2)) * 120, 2.2, Math.cos(a2) > 0 ? -1 : 1, { pose: 'dash', anim: t }); c.restore(); }
      else { drawCharAt(c, a.def, W * 0.8, H - 60, 2.4, -1, { pose: 'victory', anim: t }); caption(c, 'It is already over.', t, 3.7, 4.5, '#ffb0c8'); }
      flashAt(c, t, 3.8, 4.1, '#ff2a6a');
      if (t > 4.6) titleSlam(c, 'DEATH LOTUS', 'SIXTEEN CUTS', t, 4.7, '#ff2a6a', 90);
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('nyx:')) delete PortraitCache[k]; });
