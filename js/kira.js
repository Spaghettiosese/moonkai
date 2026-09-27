// ============================================================
//  MOONKAI — KIRA SOL, the Undying Flame (rebuilt).
//
//  GAUGE   · HEAT       Fire moves and hits stoke it; it cools when she stops. At 70+ she
//                       OVERHEATS: +15% damage and Flare Dart becomes a triple volley.
//                       VENT (←I) dumps all of it as a fire nova that grows with the heat.
//  PASSIVE · REKINDLE   Once per round, if she falls with 50+ HEAT she collapses into embers,
//                       then re-forms at 25% health in a burst of flame. Cold, she just falls.
//  PHOENIX (awakening)  permanent flight; her HEAT never cools below 50, so Rekindle stays armed.
//  SUPERNOVA REBIRTH    ultimate: a huge, slow phoenix of fire. Blockable.
// ============================================================
const krSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const KIRA = charById('kira');
const krHeat = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, f.form ? 50 : 0, 100); f.heatIdle = 0; };

function drawKiraPortrait(c, opts) {
  const P = !!opts.form;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, P ? '#ffb030' : '#3a0a06'); g.addColorStop(1, P ? '#a01000' : '#140202'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { c.fillStyle = `rgba(255,${100 + i * 10},20,0.35)`; c.beginPath(); c.moveTo(8 * i, 100); c.quadraticCurveTo(8 * i + 6, 60 - (i % 3) * 14, 8 * i + 4, 30 + (i % 4) * 8); c.quadraticCurveTo(8 * i + 12, 70, 8 * i + 10, 100); c.fill(); } c.restore();
  c.fillStyle = '#b3122e'; c.beginPath(); c.moveTo(14, 100); c.lineTo(26, 80); c.lineTo(74, 80); c.lineTo(86, 100); c.fill();
  c.fillStyle = '#ffcc33'; c.fillRect(24, 88, 52, 4);
  c.fillStyle = '#d9a066'; c.strokeStyle = '#6a3a1a'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(35, 40); c.lineTo(65, 40); c.lineTo(65, 56); c.lineTo(58, 69); c.lineTo(50, 72); c.lineTo(42, 69); c.lineTo(35, 56); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(40,20,10,0.4)'; c.beginPath(); c.ellipse(41, 61, 5, 2, 0.3, 0, Math.PI * 2); c.fill();                       // soot smudge
  c.fillStyle = '#ff7a1a'; c.strokeStyle = '#a02a00';
  c.beginPath(); c.moveTo(30, 52); for (const [x, y] of [[20, 40], [28, 36], [18, 18], [34, 26], [36, 6], [46, 22], [52, 2], [58, 20], [70, 6], [68, 26], [82, 22], [72, 38], [70, 48], [62, 36], [50, 42], [40, 36]]) c.lineTo(x, y); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#ffcc33'; c.fillRect(34, 40, 32, 3.5);                                                                           // headband
  c.strokeStyle = '#2a1008'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(37, 47); c.lineTo(46, 49.5); c.moveTo(63, 47); c.lineTo(54, 49.5); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 9, 53, P ? 9 : 6, 'rgba(255,190,40,1)', 'rgba(0,0,0,0)'); c.restore();
  for (const s of [-1, 1]) { c.fillStyle = '#fff4c0'; c.beginPath(); c.moveTo(50 + s * 4, 53); c.quadraticCurveTo(50 + s * 9, 50.5, 50 + s * 14, 52.5); c.quadraticCurveTo(50 + s * 9, 55.5, 50 + s * 4, 53); c.fill(); circle(c, 50 + s * 9, 53, 2, '#e08010'); }
  c.strokeStyle = '#6a2a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(44, 64.5); c.quadraticCurveTo(51, 66, 57, 63.5); c.stroke();
}

// ---------------- kit ----------------
const KR_DART = Mv.shot({ name: 'Flare Dart', desc: 'A fast burning dart (+HEAT). Overheated: a triple volley.', s: 10, proj: { speed: 1000, r: 10, dmg: 56, color: '#ff7a1a', core: '#fff3a0', kind: 'fire', status: { burn: 2 }, limit: 3, tag: 'fd' }, onStart: f => krHeat(f, 8) });
const KR_DART3 = Mv.shot({ name: 'Flare Volley', desc: 'Overheated: three burning darts.', s: 10, proj: { speed: 1050, r: 11, dmg: 34, count: 3, spread: 0.3, color: '#ffb030', core: '#fff', kind: 'fire', status: { burn: 2 } }, onStart: f => krHeat(f, 6) });
const KR_DASH = mk({ name: 'Blazing Dash', desc: 'A flaming shoulder that passes through and leaves a trail of fire on the ground (+HEAT).', pose: 'dash', s: 8, a: 12, r: 16, pass: true, vel: [[8, 20, 1200, null]],
  hit: { dmg: 84, box: [-10, -100, 70, 90], kb: [200, -480], launch: true, status: { burn: 2 }, hs: 22 }, ai: { min: 60, max: 360, use: 'approach' },
  onStart: f => krHeat(f, 10),
  ev: { 20: f => { for (let i = 1; i <= 3; i++) Combat.addHazard({ kind: 'zone', owner: f, side: f.side, x: clamp(f.x - f.facing * i * 70, 20, Arena.stage.width - 20), r: 42, life: 1.6, every: 0.3, dmg: 12, color: '#ff7a1a', status: { burn: 1 }, t: 0, hits: new Map() }); } } });
const KR_RISE = Object.assign(Mv.rising({ name: 'Rising Inferno', desc: 'Invincible pillar of fire. Anti-air (+HEAT).', hit: { dmg: 40, multi: 3, status: { burn: 2 } } }), { onStart: f => krHeat(f, 8) });
const KR_VENT = mk({ name: 'Vent', desc: 'Dumps ALL heat as a fire nova. Bigger and stronger the hotter she is.', pose: 'charge', s: 10, a: 1, r: 20, ai: { min: 0, max: 180, use: 'combo' },
  ev: { 10: f => {
    const h = f.gauge || 0, floor = f.form ? 50 : 0; if (h - floor < 15) { Game.popWorld(f.x, f.y - f.h - 30, 'TOO COLD', '#aab', 16); return; }
    const pow = (h - floor) / (100 - floor), R = 90 + 170 * pow;
    Combat.strikeZone(f, { x: f.x - R, y: f.y - R * 1.1, w: R * 2, h: R * 1.1 + 8 }, { dmg: 40 + 110 * pow, guard: 'mid', hs: 26, kb: [500, -620], launch: true, status: { burn: 3 }, sfx: 'h' });
    f.gauge = floor; Combat.addHazard({ kind: 'krNova', owner: f, side: f.side, x: f.x, y: f.y - 60, r: R, life: 18 }); Cam.shake = 8 + 12 * pow; krSfx('fire'); krSfx('boom');
  } } });
const KR_DIVE = Object.assign(Mv.dive({ name: 'Phoenix Dive', desc: 'Diagonal flaming dive kick; scorches the ground where she lands.', hit: { dmg: 90, status: { burn: 2 } } }),
  { onHit: (a, t) => Combat.addHazard({ kind: 'zone', owner: a, side: a.side, x: t.x, r: 60, life: 1.4, every: 0.3, dmg: 12, color: '#ff7a1a', t: 0, hits: new Map() }) });
const KR_ULT = Ult({ act: 'shot', name: 'SUPERNOVA REBIRTH', desc: 'A huge, slow phoenix of fire soars at the foe. Blockable. Must connect. Heals 400.', dmg: 1050, cutscene: csKiraUlt, color: '#ff7a1a',
  proj: { kind: 'fire', color: '#ff7a1a', speed: 520, r: 44 }, fx: { el: 'light', color: '#ff7a1a', sky: ['#200', '#600', '#f80'] }, after: a => Combat.healSelf(a, 400) });
KR_ULT.s = 34;

Object.assign(KIRA, {
  role: 'Heat management · Pressure · Rebirth', drawPortrait: drawKiraPortrait,
  gauge: { name: 'HEAT', max: 100, color: '#ff7a1a', label: f => (f.gauge >= 70 ? '· OVERHEAT' : '') },
  passive: ['Rekindle', 'Once per round, if she falls with 50+ HEAT she collapses into embers and re-forms at 25% health in a burst of flame. Falling cold is final.'],
  passiveDmg: f => (f.gauge >= 70 ? 1.15 : 1),
  moves: { '5S': KR_DART, '6S': KR_DASH, '2S': KR_RISE, '4S': KR_VENT, 'jS': KR_DIVE },
  ult: KR_ULT, ultAct: 'shot',
  form: Object.assign(KIRA.form, { name: 'PHOENIX', desc: 'Permanent. Flight, and her HEAT never cools below 50: Rekindle stays armed and Vent always has fuel.', regen: 0, moves: undefined, onStart: f => { f.gauge = Math.max(f.gauge || 0, 70); } }),
});
for (const [slot, m] of Object.entries(KIRA.moves)) { m.id = 'kira_' + slot; m.slot = slot; m.owner = 'kira'; if (slot === 'jS') m.air = true; }
KR_DART3.id = 'kira_5S'; KR_ULT.id = 'kira_ult';
KIRA.specialFor = (f, slot) => (slot === '5S' && f.gauge >= 70) ? KR_DART3 : undefined;
KIRA.onRoundStart = f => { f.gauge = 20; f.heatIdle = 0; f.rekindled = false; };
KIRA.onHit = (a) => krHeat(a, 4);
KIRA.passiveTick = f => { if (f.state === 'embers') return; if (++f.heatIdle > 90 && f.st % 3 === 0) f.gauge = Math.max(f.form ? 50 : 0, (f.gauge || 0) - 1); };
KIRA.onDeath = t => {
  if (t.rekindled || (t.gauge || 0) < 50) return false;
  t.rekindled = true; t.gauge = t.form ? 50 : 0; t.state = 'embers'; t.emberT = 80; t.move = null; t.vx = t.vy = 0; t.hp = 1;
  Game.popWorld(t.x, t.y - 120, 'REKINDLE', '#ffb030', 28); krSfx('fire'); return true;
};
KIRA.stateStep = f => {
  if (f.state !== 'embers') return false;
  f.anim += 1 / FPS; f.st++; f.y = Math.min(0, f.y + 14);
  if (f.st % 3 === 0) Game.fx.add({ x: f.x + rand(-30, 30), y: f.y - rand(0, 40), vx: rand(-20, 20), vy: rand(-120, -40), life: 0.8, size: rand(3, 7), color: pick(['#ff7a1a', '#ffcc33', '#a01000']), glow: true });
  if (--f.emberT <= 0) {
    f.state = 'stand'; f.hp = f.red = f.shownHp = Math.round(f.maxHp * 0.25); f.invul = 50;
    for (const o of Combat.targets(f.side)) if (Math.abs(o.x - f.x) < 220) Combat.resolveHit(o, f, H_({ dmg: 80, guard: 'unblock', kb: [700, -600], launch: true, status: { burn: 3 }, sfx: 'h' }), { force: true, fromX: f.x });
    Combat.addHazard({ kind: 'krNova', owner: f, side: f.side, x: f.x, y: f.y - 60, r: 230, life: 22 }); Cam.shake = 16; krSfx('boom');
    f.say('Knock me down. I come back brighter.', 110);
  }
  return true;
};
KIRA.onIncoming = t => (t.state === 'embers' ? null : undefined);
const _drawKira = KIRA.draw;
KIRA.draw = (c, v) => {
  if (v.state === 'embers') { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -20, 60 + Math.sin((v.anim || 0) * 12) * 8, 'rgba(255,120,20,0.8)', 'rgba(0,0,0,0)'); c.restore(); return; }
  const h = v.gauge || 0; if (h >= 70) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -60, 90, `rgba(255,${120 - (h - 70) * 2},20,0.35)`, 'rgba(0,0,0,0)'); c.restore(); }
  _drawKira(c, v);
};
Combat.hz.krNova = function (h) { return h.t < h.life; };
Combat.drawHz.krNova = function (c, h) { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, h.r * (0.4 + 0.8 * k), `rgba(255,140,30,${0.8 * (1 - k)})`, 'rgba(255,0,0,0)'); c.strokeStyle = `rgba(255,220,120,${1 - k})`; c.lineWidth = 6; c.beginPath(); c.arc(h.x, h.y, h.r * k, 0, Math.PI * 2); c.stroke(); c.restore(); };
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('kira:')) delete PortraitCache[k]; });
