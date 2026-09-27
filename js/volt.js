// ============================================================
//  MOONKAI — VOLT, the Living Current (rebuilt).
//
//  GAUGE   · KINETIC  he charges by MOVING: running, dashing and jumping fill it; standing
//                    still drains it. At 50+ his specials are OVERCHARGED (Chain Lightning jumps
//                    twice, Flash Step leaves a live wire, Storm Call drops three bolts).
//  PASSIVE · STATIC  every dash leaves a crackling spark on the ground that shocks the foe.
//  SUPER · LIGHTNING ROD  plants a rod in the ground. For 6s every hit he lands calls a bolt
//                    down on the foe, and the rod zaps anyone standing near it.
//  THUNDER GOD'S VERDICT  ultimate: he crackles in place, winding up (hit him to stop it),
//                    then zig-zags across the stage at the speed of light. Must connect.
// ============================================================
const vtSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const VOLT = charById('volt');
const VT_PAL = { build: 'slim', skin: '#e8c8a0', top: '#1a1a4e', topDark: '#10103a', pants: '#1a1a4e', pantsDark: '#10103a', boots: '#ffe95a', belt: '#ffe95a', glove: '#ffe95a', noFace: true };
const VT_STORM_PAL = Object.assign({}, VT_PAL, { top: '#2a2a6a', boots: '#e8fbff', glove: '#e8fbff', belt: '#9fe8ff' });
const vtOC = f => (f.gauge || 0) >= 50;
const vtKin = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };
function vtBolt(c, x1, y1, x2, y2, seed, w = 3, col = 'rgba(200,245,255,1)') {
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1);
  const n = 7; for (let i = 1; i < n; i++) { const k = i / n; c.lineTo(lerp(x1, x2, k) + Math.sin(seed * 13 + i * 7) * 14, lerp(y1, y2, k) + Math.cos(seed * 7 + i * 5) * 10); }
  c.lineTo(x2, y2); c.stroke();
}

function drawVolt(c, v) {
  const t = v.anim || 0, S = !!v.transformed, oc = vtOC(v), m = v.move;
  if (oc || S) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < (S ? 4 : 2); i++) vtBolt(c, rand(-30, 30), rand(-150, -20), rand(-50, 50), rand(-150, -20), t * 30 + i, 1.5, 'rgba(190,240,255,0.8)'); c.restore(); }
  drawHumanoid(c, v, S ? VT_STORM_PAL : VT_PAL, {
    back(c, P) { // afterimage streaks when he moves
      if (Math.abs(v.vx || 0) > 200 || (m && m.pose === 'dash')) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 1; i <= 3; i++) { c.fillStyle = `rgba(255,233,90,${0.25 / i})`; c.fillRect(P.hip[0] - 20 - i * 16, P.sh[1] - 20, 20, P.hip[1] - P.sh[1] + 60); } c.restore(); }
    },
    chest(c, P) { // lightning-bolt stripe across the suit
      c.fillStyle = S ? '#9fe8ff' : '#ffe95a'; c.beginPath(); const x = P.sh[0], y = P.sh[1];
      c.moveTo(x - 6, y + 2); c.lineTo(x + 6, y + 2); c.lineTo(x, y + 16); c.lineTo(x + 8, y + 16); c.lineTo(x - 6, y + 38); c.lineTo(x - 1, y + 20); c.lineTo(x - 8, y + 20); c.closePath(); c.fill();
    },
    head(c, P) {
      const [hx, hy] = P.head;
      shadedHead(c, hx, hy, 10.5, '#e8c8a0');
      // wild lightning hair swept back
      c.fillStyle = S ? '#e8fbff' : '#ffe95a'; c.strokeStyle = '#a08a1a'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(hx + 8, hy - 6); for (const [dx, dy] of [[4, -14], [-2, -10], [-8, -18], [-10, -8], [-20, -14], [-16, -2], [-24, -2], [-12, 4], [-10, 0]]) c.lineTo(hx + dx, hy + dy); c.closePath(); c.fill(); c.stroke();
      // visor goggles
      c.fillStyle = '#1a1a1a'; c.fillRect(hx - 2, hy - 5, 14, 6);
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 2, oc || S ? 8 : 5, 'rgba(190,240,255,1)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#bff4ff'; c.fillRect(hx + 2, hy - 4, 9, 3);
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(hx + 4, hy + 6); c.lineTo(hx + 10, hy + 5); c.stroke();                          // flat mouth
    },
    front(c, P) {
      if (oc || S) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, P.fH[0], P.fH[1], 14, 'rgba(190,240,255,0.9)', 'rgba(0,0,0,0)'); c.restore(); }
    },
  });
}
function drawVoltPortrait(c, opts) {
  const S = !!opts.form;
  c.fillStyle = '#05060f'; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) vtBolt(c, i * 30, 0, i * 30 + 10, 100, i + 3, 1.5, 'rgba(160,220,255,0.5)'); c.restore();
  c.fillStyle = '#1a1a4e'; c.beginPath(); c.moveTo(8, 100); c.lineTo(24, 76); c.lineTo(76, 76); c.lineTo(92, 100); c.fill();
  c.fillStyle = '#ffe95a'; c.beginPath(); c.moveTo(48, 78); c.lineTo(56, 78); c.lineTo(50, 90); c.lineTo(56, 90); c.lineTo(44, 100); c.lineTo(48, 92); c.lineTo(42, 92); c.closePath(); c.fill();
  c.fillStyle = '#e8c8a0'; c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(36, 40); c.lineTo(64, 40); c.lineTo(64, 58); c.lineTo(57, 70); c.lineTo(50, 72); c.lineTo(43, 70); c.lineTo(36, 58); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = S ? '#e8fbff' : '#ffe95a'; c.strokeStyle = '#a08a1a';
  c.beginPath(); c.moveTo(34, 46); for (const [x, y] of [[20, 36], [30, 32], [14, 16], [34, 22], [36, 4], [48, 20], [58, 2], [62, 20], [80, 8], [72, 28], [90, 26], [68, 42]]) c.lineTo(x, y); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1a1a1a'; c.fillRect(32, 46, 36, 11);
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50, 51, S ? 30 : 22, 'rgba(160,230,255,0.9)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#dffaff'; c.fillRect(35, 49, 30, 4);
  c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(44, 64); c.lineTo(56, 63); c.stroke();
}

// ---------------- kit ----------------
const VT_CHAIN = Mv.shot({ name: 'Chain Lightning', desc: 'Near-instant bolt that stuns briefly. OVERCHARGED: it jumps back for a second hit.', s: 9, proj: { speed: 1900, r: 9, dmg: 56, kind: 'bolt', color: '#bff4ff', life: 0.35, stun: 0.3,
  onHit: (t, p) => { const f = p.owner; if (vtOC(f) && !p.chained) { f.gauge -= 20; Game.later(0.12, () => { if (t.state !== 'ko') { Combat.resolveHit(t, f, H_({ dmg: 40, stun: 0.2, hs: 10, kb: [60, -40], guard: 'mid', sfx: 'm' }), { proj: true, fromX: t.x - 10 }); Combat.addHazard({ kind: 'vtZap', owner: f, side: f.side, x1: t.x - 80, y1: t.y - 150, x2: t.x, y2: t.y - 60, life: 8 }); } }); } } } });
const VT_FLASH = Object.assign(Mv.rush({ name: 'Flash Step', desc: 'Invulnerable dash straight through (+KINETIC). OVERCHARGED: leaves a live wire along the path.', s: 5, speed: 1600, frames: 12, pass: true, inv: [1, 16], hit: { dmg: 70, kb: [100, -300] } }),
  { onStart: f => { f.vtFrom = f.x; vtKin(f, 15); }, ev: { 18: f => { if (vtOC(f)) { f.gauge -= 20; Combat.addHazard({ kind: 'vtWire', owner: f, side: f.side, x1: Math.min(f.vtFrom, f.x), x2: Math.max(f.vtFrom, f.x), life: 90 }); } } } });
const VT_RISE = Mv.rising({ name: 'Thunder Rise', desc: 'Spiraling anti-air.', hit: { dmg: 36, multi: 4, every: 3, stun: 0.2 } });
const VT_STORM = mk({ name: 'Storm Call', desc: 'A bolt strikes the foe after a flash. OVERCHARGED: three bolts in a row.', pose: 'cast_up', s: 12, a: 1, r: 20, ai: { min: 200, max: 1600, use: 'zone' },
  ev: { 12: f => { const o = f.opp, n = vtOC(f) ? 3 : 1; if (n > 1) f.gauge -= 25; for (let i = 0; i < n; i++) { const x = clamp((o ? o.x : f.x + f.facing * 300) + (i - (n - 1) / 2) * 90, 30, Arena.stage.width - 30); Combat.telegraph(f, { x, r: 50, life: 22 + i * 6, color: '#bff4ff', column: true, onFire: h => { for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < 60) Combat.resolveHit(t, f, H_({ dmg: 62, stun: 0.3, guard: 'mid', hs: 16, kb: [60, -300], launch: true, sfx: 'm' }), { proj: true, fromX: h.x, move: VT_STORM }); Combat.addHazard({ kind: 'vtZap', owner: f, side: f.side, x1: h.x + 30, y1: -700, x2: h.x, y2: 0, life: 10, big: true }); vtSfx('zap') || vtSfx('boom'); } }); } } } });
const VT_KICK = Mv.dive({ name: 'Lightning Kick', desc: 'Electric dive kick.', vx: 1100, vy: 700, hit: { dmg: 80, stun: 0.2 } });
const VT_SUPER = superize(mk({ name: 'Lightning Rod', desc: 'Plants a rod. For 6s every hit he lands calls a bolt down on the foe, and the rod zaps anyone near it.', pose: 'slam', s: 12, a: 1, r: 20,
  ev: { 12: f => { Combat.hazards.filter(h => h.kind === 'vtRod' && h.owner === f).forEach(h => h.life = 0); Combat.addHazard({ kind: 'vtRod', owner: f, side: f.side, x: f.x + f.facing * 60, life: 360 }); vtSfx('clang'); f.say('Grounded.', 40); } } }), 100);
const VT_ULT = superize(mk({ name: "THUNDER GOD'S VERDICT", desc: 'He crackles in place winding up (hit him to stop it), then zig-zags across the stage at the speed of light. Blockable. Must connect.', pose: f => (f.mf < 48 ? 'charge' : 'dash'), s: 48, a: 30, r: 26, inv: [48, 78],
  ev: { 1: f => { f.say('Twelve times it struck me.', 80); vtSfx('charge', 0.8); f.vtHit = false; } } }), 300);
VT_ULT.id = 'volt_ult'; VT_ULT.recoverWhiff = 30;
VT_ULT.ult = { dmg: 1100, cutscene: (a, t) => csVoltVerdict(a, t), fx: { el: 'bolt', color: '#bff4ff' } };

Object.assign(VOLT, {
  role: 'Rushdown · Kinetic charge · Speed', handArt: true, draw: drawVolt, drawPortrait: drawVoltPortrait, transformCutscene: f => csVoltStorm(f),
  gauge: { name: 'KINETIC', max: 100, color: '#ffe95a', label: f => (vtOC(f) ? '· OVERCHARGED' : '') },
  passive: ['Static', 'Every dash leaves a crackling spark on the ground that shocks the foe.'],
  moves: { '5S': VT_CHAIN, '6S': VT_FLASH, '2S': VT_RISE, '4S': VT_STORM, 'jS': VT_KICK },
  super: VT_SUPER, ult: VT_ULT, ultAct: 'rush',
  form: Object.assign(VOLT.form, { desc: 'Permanent. Faster, hits can stun, and KINETIC never drops below 50: always OVERCHARGED.', model: undefined, moves: undefined }),
});
for (const [slot, m] of Object.entries(VOLT.moves)) { m.id = 'volt_' + slot; m.slot = slot; m.owner = 'volt'; if (slot === 'jS') m.air = true; }
VT_SUPER.id = 'volt_super';
const _vtOnHit = VOLT.onHit;
VOLT.onHit = (a, t, dmg, h) => {
  _vtOnHit && _vtOnHit(a, t, dmg, h);
  const rod = Combat.hazards.find(x => x.kind === 'vtRod' && x.owner === a);
  if (rod && !(a.move && a.move.id === 'volt_ult') && (!a.vtRodCd || a.st - a.vtRodCd > 12)) { a.vtRodCd = a.st; Game.later(0.1, () => { if (t.state !== 'ko') { Combat.resolveHit(t, a, H_({ dmg: 24, stun: 0.1, guard: 'mid', hs: 8, kb: [40, -40], sfx: 'm' }), { proj: true, fromX: t.x }); Combat.addHazard({ kind: 'vtZap', owner: a, side: a.side, x1: t.x + 20, y1: -700, x2: t.x, y2: t.y - 40, life: 8 }); } }); }
};
VOLT.onRoundStart = f => { f.gauge = 0; };
VOLT.passiveTick = f => {
  const sp = Math.abs(f.vx || 0);
  if (sp > 150 || f.airborne) vtKin(f, sp > 800 ? 1.4 : 0.5); else if (!f.move && f.st % 4 === 0) vtKin(f, -1);
  if (f.form) f.gauge = Math.max(50, f.gauge);
  // Static: dashes leave sparks
  if ((f.state === 'dash' || (f.move && f.move.pose === 'dash')) && f.st % 8 === 0) Combat.addHazard({ kind: 'zone', owner: f, side: f.side, x: f.x, r: 30, life: 1.2, every: 0.4, dmg: 10, color: '#ffe95a', status: { slow: 0.2 }, t: 0, hits: new Map() });
};
VOLT.moveHook = (f, m) => {
  if (m !== VT_ULT) return;
  if (f.mf < m.s) { if (f.mf % 4 === 0) Combat.addHazard({ kind: 'vtZap', owner: f, side: f.side, x1: f.x + rand(-60, 60), y1: f.y - rand(100, 200), x2: f.x + rand(-30, 30), y2: f.y - rand(0, 60), life: 4 }); return; }
  // three passes across the stage
  const k = f.mf - m.s, pass = Math.floor(k / 10); f.facing = pass % 2 ? -f.vtDir : f.vtDir || f.facing; if (k === 0) f.vtDir = f.facing;
  f.vx = f.facing * 2600; f.y = -((k % 10) * 12 * (pass % 2 ? 1 : 0.3));
  if (!f.vtHit) { const r = Combat.strikeZone(f, { x: f.x - 60, y: f.y - 170, w: 120, h: 176 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: VT_ULT }); if (r) f.vtHit = true; }
  if (f.mf % 2 === 0) Game.fx.add({ x: f.x, y: f.y - 80, vx: 0, vy: 0, life: 0.25, size: 26, color: '#ffe95a', glow: true });
};
Combat.hz.vtZap = h => h.t < h.life;
Combat.drawHz.vtZap = (c, h) => { c.save(); c.globalCompositeOperation = 'lighter'; vtBolt(c, h.x1, h.y1, h.x2, h.y2, h.t + h.x1, h.big ? 6 : 3); if (h.big) vtBolt(c, h.x1, h.y1, h.x2, h.y2, h.t * 3, 14, 'rgba(120,200,255,0.4)'); c.restore(); };
Combat.hz.vtWire = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  if (h.t % 15 === 0) for (const t of Combat.targets(f.side)) if (t.x > h.x1 && t.x < h.x2 && !t.airborne) Combat.resolveHit(t, f, H_({ dmg: 18, stun: 0.15, guard: 'low', hs: 6, kb: [0, -60], sfx: 'm' }), { proj: true, fromX: t.x - 10 });
  return h.t < h.life;
};
Combat.drawHz.vtWire = (c, h) => { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 1 - h.t / h.life; vtBolt(c, h.x1, -4, h.x2, -4, h.t, 2.5, 'rgba(255,240,120,1)'); c.restore(); };
Combat.hz.vtRod = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  if (h.t % 45 === 30) for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < 180) { Combat.resolveHit(t, f, H_({ dmg: 30, stun: 0.25, guard: 'mid', hs: 10, kb: [Math.sign(t.x - h.x) * 200, -120], sfx: 'm' }), { proj: true, fromX: h.x }); Combat.addHazard({ kind: 'vtZap', owner: f, side: f.side, x1: h.x, y1: -150, x2: t.x, y2: t.y - 60, life: 8 }); }
  return h.t < h.life;
};
Combat.drawHz.vtRod = (c, h) => {
  c.save(); c.fillStyle = '#555'; c.fillRect(h.x - 3, -150, 6, 150); c.fillStyle = '#ffe95a'; c.beginPath(); c.moveTo(h.x - 8, -150); c.lineTo(h.x, -172); c.lineTo(h.x + 8, -150); c.fill();
  c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -160, 22 + Math.sin(h.t * 0.5) * 6, 'rgba(255,240,120,0.9)', 'rgba(0,0,0,0)'); if (h.t % 6 < 3) vtBolt(c, h.x, -160, h.x + rand(-60, 60), -rand(60, 200), h.t, 1.5); c.restore();
};

// ---------------- cinematics ----------------
function csVoltStorm(f) {
  const d = f.def;
  return {
    name: 'STORM AVATAR', dur: 3.8, fx: new ParticleSystem(300),
    cues: [[0.2, () => vtSfx('zap') || vtSfx('boom')], [1.0, () => vtSfx('zap') || vtSfx('boom')], [2.1, () => { vtSfx('boom'); vtSfx('charge', 0.4); }]],
    draw(c, t) {
      c.fillStyle = '#05060f'; c.fillRect(0, 0, W, H);
      // lightning hits him again, and again; the last time he catches it
      const hits = [0.2, 1.0, 1.6, 2.1].filter(x => t > x && t < x + 0.15);
      if (hits.length) { c.fillStyle = 'rgba(200,240,255,0.5)'; c.fillRect(0, 0, W, H); c.save(); c.globalCompositeOperation = 'lighter'; vtBolt(c, W / 2 + 40, 0, W / 2, H - 200, t * 50, 8); c.restore(); }
      drawCharAt(c, d, W / 2, H - 50, 2.7, 1, { pose: t < 2.1 ? 'hurt' : 'victory', anim: t, transformed: t > 2.1, gauge: 100 });
      caption(c, 'Twelve times it struck me.', t, 0.3, 2, '#dff');
      titleSlam(c, 'STORM AVATAR', 'I AM THE CURRENT', t, 2.2, '#ffe95a', 90);
    },
  };
}
function csVoltVerdict(a, opp) {
  const fx = new ParticleSystem(1200), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: "THUNDER GOD'S VERDICT", dur: 6.2, fx,
    cues: Array.from({ length: 12 }, (_, i) => [1.2 + i * 0.18, () => vtSfx('zap') || vtSfx('tone', 1400, 0.04, 'square', 0.04, 400)]).concat([[3.8, () => { vtSfx('boom'); vtSfx('slam'); }]]),
    draw(c, t) {
      c.fillStyle = '#05060f'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#10122a'; c.fillRect(0, H - 60, W, 60);
      silhouette(c, o => drawCharAt(o, opp.def, W / 2, H - 60, oppScale, -1, { pose: t < 1.2 ? 'idle' : 'hurt', anim: t, transformed: opp.transformed }), '#1a1a3a');
      if (t < 1.2) { drawCharAt(c, a.def, W * 0.15, H - 60, 2.4, 1, { pose: 'charge', anim: t, gauge: 100 }); caption(c, "Now it's your turn.", t, 0.1, 1.1, '#dff'); return; }
      // twelve strikes: he blinks to a new angle each time, a bolt connects him to the foe
      const n = Math.min(12, Math.floor((t - 1.2) / 0.18) + 1);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) { const ang = i * 2.6, x = W / 2 + Math.cos(ang) * 380, y = H * 0.45 + Math.sin(ang) * 200; vtBolt(c, x, y, W / 2, H - 160, i * 3 + t * 20, i === n - 1 ? 6 : 1.5, i === n - 1 ? '#fff' : 'rgba(255,240,120,0.5)'); }
      c.restore();
      if (t < 3.6) { const ang = (n - 1) * 2.6; drawCharAt(c, a.def, W / 2 + Math.cos(ang) * 380, H * 0.45 + Math.sin(ang) * 200 + 120, 1.8, Math.cos(ang) > 0 ? -1 : 1, { pose: 'dash', anim: t, gauge: 100 }); }
      else { drawCharAt(c, a.def, W * 0.8, H - 60, 2.4, -1, { pose: 'victory', anim: t, gauge: 100 }); }
      flashAt(c, t, 3.8, 4.1, '#fff');
      if (t > 4.4) titleSlam(c, "THUNDER GOD'S VERDICT", 'TWELVE FOR TWELVE', t, 4.5, '#ffe95a', 78);
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('volt:')) delete PortraitCache[k]; });
