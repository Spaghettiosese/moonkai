// ============================================================
//  MOONKAI — VEX, Architect of Nothing (reworked): a gravity puppeteer.
//
//  SINGULARITIES   ↓I seeds a black hole under the foe (max 2; 3 as Void Wraith). They hang for
//                  6s and drag the foe toward their core.
//  EVENT STEP      →I teleports him INTO his newest singularity (behind the foe if none) and slashes.
//  COLLAPSE        ←I detonates every singularity: each explosion launches whoever is caught.
//  ENTROPY gauge   fills while the foe is inside a singularity and on every collapse hit.
//                  Full = HEAT DEATH: 6s of +20% damage, and the foe loses a bar of meter.
//  NULL ORB        slow homing orb that eats projectiles.
//  VOID WRAITH     permanent: 3 singularities, bigger pull, lifesteal.
//  EVENT HORIZON   ultimate: a black hole tracks and drops on the foe. Blockable.
// ============================================================
const vxSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const VEX = charById('vex');
const vxSings = f => Combat.hazards.filter(h => h.kind === 'vexSing' && h.owner === f);
const vxCap = f => (f.form ? 3 : 2);
function vxEntropy(f, n) {
  if (f.heatT > 0) return;
  f.gauge = Math.min(100, (f.gauge || 0) + n);
  if (f.gauge >= 100) {
    f.gauge = 0; f.heatT = 6 * FPS; const o = f.opp; if (o) o.side.meter = Math.max(0, o.side.meter - 100);
    Game.popWorld(f.x, f.y - f.h - 40, 'HEAT DEATH', '#d8a0ff', 26); Game.announce('EVERYTHING RETURNS TO NOTHING', '#b36bff', 70); vxSfx('voidHum'); Cam.shake = 10;
  }
}
function vxCollapse(f, h, dmg) {
  for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r * 0.6 && o.y > -h.r) { const r = Combat.resolveHit(o, f, H_({ dmg, guard: 'mid', hs: 26, kb: [0, -760], launch: true, sfx: 'h' }), { proj: true, fromX: h.x }); if (r === 'hit') vxEntropy(f, 18); }
  Game.fx.burst(h.x, -60, 40, { color: ['#b36bff', '#1a0026', '#fff'], size: 10, speed: 520, glow: true, life: 0.6 }); Cam.shake = Math.max(Cam.shake, 10); vxSfx('boom');
}
Combat.hz.vexSing = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  for (const o of this.targets(h.side)) { const d = h.x - o.x; if (Math.abs(d) < h.r && o.state !== 'grabbed') { o.x += Math.sign(d) * Math.min(Math.abs(d), (f.form ? 4.2 : 3)); if (h.t % 6 === 0) vxEntropy(f, 1.3); } }
  for (const p of this.projectiles) if (p.side !== h.side && Math.abs(p.x - h.x) < 50 && p.life > 0) p.life = 0;
  return h.t < h.life;
};
Combat.drawHz.vexSing = function (c, h, t) {
  const k = Math.min(1, h.t / 15, (h.life - h.t) / 20), R = 34 * k;
  c.save(); c.globalAlpha = 0.25 * k; c.strokeStyle = '#b36bff'; c.setLineDash([6, 8]); c.lineDashOffset = -t * 30; c.beginPath(); c.ellipse(h.x, -2, h.r, h.r * 0.18, 0, 0, Math.PI * 2); c.stroke(); c.restore();
  if (typeof drawBlackHole === 'function') drawBlackHole(c, h.x, -110, R, t); else { circle(c, h.x, -110, R, '#000'); }
};

const VX_ORB = Mv.shot({ name: 'Null Orb', desc: 'A slow homing orb that eats projectiles and weakens.', s: 14, proj: { speed: 330, homing: 2.2, r: 16, dmg: 55, life: 3.5, color: '#b36bff', core: '#1a0026', status: { weaken: 4 }, limit: 1, tag: 'null', prio: 3, hits: 1 } });
const VX_SEED = mk({ name: 'Singularity', desc: 'Seeds a black hole under the foe (6s, max 2). It drags them toward its core.', pose: 'cast', s: 16, a: 1, r: 18, ai: { min: 120, max: 1400, use: 'zone' },
  ev: { 16: f => { const t = f.opp; if (!t) return; const s = vxSings(f); if (s.length >= vxCap(f)) s[0].life = 0;
    Combat.addHazard({ kind: 'vexSing', owner: f, side: f.side, x: clamp(t.x, 60, Arena.stage.width - 60), r: f.form ? 230 : 180, life: 6 * FPS }); vxSfx('voidHum'); } } });
const VX_STEP = mk({ name: 'Event Step', desc: 'Teleports into his newest singularity (behind the foe if none) and slashes.', pose: 'heavy', s: 12, a: 5, r: 18, inv: [1, 11],
  hit: { dmg: 80, box: [0, -120, 90, 120], kb: [500, -300], launch: true, hs: 22 }, ai: { min: 150, max: 1200, use: 'approach' },
  ev: { 10: f => { const s = vxSings(f), last = s[s.length - 1]; if (last) { f.x = last.x; f.y = 0; f.faceOpp(); Game.fx.burst(f.x, -80, 24, { color: ['#b36bff', '#000'], size: 9, speed: 260, life: 0.4 }); } else Combat.teleport(f, 'behind'); } } });
const VX_COLLAPSE = mk({ name: 'Collapse', desc: 'Detonates every singularity: each explosion launches whoever it catches.', pose: 'cast_up', s: 12, a: 1, r: 20, ai: { min: 0, max: 1600, use: 'trap' },
  ev: { 12: f => { const s = vxSings(f); if (!s.length) { Game.popWorld(f.x, f.y - f.h - 30, 'NOTHING TO COLLAPSE', '#aab', 16); return; } for (const h of s) { vxCollapse(f, h, f.form ? 110 : 90); h.life = 0; } } } });
const VX_INVERT = mk({ name: 'Inversion', desc: 'Gravity reverses under the foe: they are slammed into the ground.', pose: 'cast', air: true, s: 10, a: 1, r: 16,
  ev: { 10: f => { const t = f.opp; if (!t || Math.abs(t.x - f.x) > 500) return; Combat.resolveHit(t, f, H_({ dmg: 70, guard: 'high', hs: 22, kb: [0, 1100], launch: true, gb: true, sfx: 'h' }), { proj: true, fromX: f.x }); Game.fx.burst(t.x, t.y - 60, 20, { color: ['#b36bff', '#000'], size: 8, speed: 300, life: 0.4 }); } } });
const VX_SUPER = superize(mk({ name: 'Accretion Disk', desc: 'A ring of debris orbits him, shredding anything close. Seeds a singularity at its end.', pose: 'charge', s: 12, a: 60, r: 18,
  hit: { dmg: 20, box: [-140, -170, 280, 180], centered: true, multi: 10, every: 6, kb: [0, -120], hs: 16 },
  ev: { 70: f => Combat.addHazard({ kind: 'vexSing', owner: f, side: f.side, x: f.x, r: 200, life: 4 * FPS }) } }), 100);
const VX_ULT = superize(mk({ name: 'EVENT HORIZON', desc: 'A black hole tracks the foe and drops. Blockable. Must connect.', pose: 'cast_up', s: 16, a: 36, r: 22,
  ev: { 16: f => { const t = f.opp; if (!t) return; Combat.telegraph(f, { x: t.x, follow: t, track: 0.2, r: 120, life: 34, color: '#b36bff', column: true, onFire: h => {
    for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) Combat.resolveHit(o, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: h.x, move: VX_ULT });
    Combat.addHazard({ kind: 'vexSing', owner: f, side: f.side, x: h.x, r: 160, life: 30 }); Cam.shake = 18; vxSfx('boom'); } }); } } }), 300);
VX_ULT.id = 'vex_ult'; VX_ULT.recoverWhiff = 30;
VX_ULT.ult = { dmg: 1150, cutscene: csVexUlt, fx: VEX.ult.ult ? VEX.ult.ult.fx : { el: 'shadow', color: '#b36bff' } };

function drawVexPortrait(c, opts) {
  const V = !!opts.form;
  const g = c.createRadialGradient(50, 50, 4, 50, 50, 75); g.addColorStop(0, V ? '#3a0a5a' : '#2a1040'); g.addColorStop(1, '#030006'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(180,110,255,0.5)'; c.lineWidth = 1.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(78, 22, 10 + i * 6, 3 + i * 2, -0.4, 0, Math.PI * 2); c.stroke(); } c.restore(); circle(c, 78, 22, 7, '#000');
  c.fillStyle = V ? '#0a0010' : '#1b0826'; c.beginPath(); c.moveTo(18, 100); c.quadraticCurveTo(14, 30, 50, 14); c.quadraticCurveTo(86, 30, 82, 100); c.fill();
  c.fillStyle = V ? '#000' : '#0e0e14'; c.beginPath(); c.moveTo(34, 38); c.quadraticCurveTo(50, 28, 66, 38); c.lineTo(64, 64); c.lineTo(50, 76); c.lineTo(36, 64); c.closePath(); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 8, 50, V ? 12 : 8, 'rgba(190,120,255,1)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#f0e0ff'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 3, 51); c.lineTo(50 + s * 13, 47); c.lineTo(50 + s * 11, 51.5); c.closePath(); c.fill(); }
  if (V) { c.strokeStyle = 'rgba(190,120,255,0.7)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(40 + i * 4, 60); c.lineTo(38 + i * 5, 90); c.stroke(); } }
}

Object.assign(VEX, {
  role: 'Gravity · Singularities · Setplay', drawPortrait: drawVexPortrait,
  passive: ['Entropy', 'Singularities drag the foe and fill ENTROPY while they struggle inside. Full ENTROPY = HEAT DEATH: 6s of +20% damage and the foe loses a bar.'],
  gauge: { name: 'ENTROPY', max: 100, color: '#b36bff', label: f => (f.heatT > 0 ? '· HEAT DEATH' : '') },
  passiveDmg: f => (f.heatT > 0 ? 1.2 : 1),
  moves: { '5S': VX_ORB, '2S': VX_SEED, '6S': VX_STEP, '4S': VX_COLLAPSE, 'jS': VX_INVERT },
  super: VX_SUPER, ult: VX_ULT, ultAct: 'strike',
  form: Object.assign(VEX.form, { desc: 'Permanent. 3 singularities with a stronger pull, bigger collapses, 20% lifesteal, 20% damage resistance.', cost: 200, armor: 0.8, lifesteal: 0.2 }),
});
for (const [slot, m] of Object.entries(VEX.moves)) { m.id = 'vex_' + slot; m.slot = slot; m.owner = 'vex'; if (slot === 'jS') m.air = true; }
VX_SUPER.id = 'vex_super';
VEX.onRoundStart = f => { f.gauge = 0; f.heatT = 0; };
VEX.passiveTick = f => { if (f.heatT > 0) f.heatT--; };
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('vex:')) delete PortraitCache[k]; });
