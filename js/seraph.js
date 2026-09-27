// ============================================================
//  MOONKAI — SERAPH, the Last Light (rebuilt): a guardian, not a healer-bot.
//
//  AEGIS FEATHERS (gauge)  Feathers of light orbit her (3, or 5 as Archangel) and regrow over time.
//                  Passive: a feather automatically catches the FIRST hit of any combo aimed at her.
//                  You must strip her feathers before you can open her up.
//  FEATHER VOLLEY  spends every feather as homing spears: defence becomes offence.
//  AEGIS STANCE    parry that spends a feather; a caught projectile sends her straight to the shooter.
//  WING LUNGE      a spear dash that regrows a feather on hit.
//  SANCTUARY       a healing circle.
//  ARCHANGEL       permanent: six wings of light, 5 feathers, faster regrowth, flight.
//  LAST LIGHT      ultimate: her halo becomes a spear of light. Blockable. The city is restored.
// ============================================================
const serSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const SERAPH = charById('seraph');
const serCap = f => (f.form ? 5 : 3);

// ---------------- art ----------------
const SER_PAL = { build: 'curvy', skin: '#f0d0b0', top: '#f4f0ff', topDark: '#c8c0e8', pants: '#e8e0ff', pantsDark: '#bab0d8', skirt: '#fffbe8', boots: '#e6c060', belt: '#e6c060', bracers: '#e6c060', glove: '#f0d0b0', noFace: true };
const SER_ARCH_PAL = Object.assign({}, SER_PAL, { top: '#fffdf6', skirt: '#ffffff', belt: '#fff0b0', bracers: '#fff0b0' });

function drawLightSpear(c, x, y, len, ang, o = {}) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.strokeStyle = '#b8903a'; c.lineWidth = 3.4 * (o.w || 1); c.lineCap = 'round'; c.beginPath(); c.moveTo(-len * 0.35, 0); c.lineTo(len * 0.78, 0); c.stroke();
  c.fillStyle = '#fff6d8'; c.strokeStyle = '#b8903a'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(len * 0.76, -6 * (o.w || 1)); c.quadraticCurveTo(len * 0.9, -7 * (o.w || 1), len, 0); c.quadraticCurveTo(len * 0.9, 7 * (o.w || 1), len * 0.76, 6 * (o.w || 1)); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#e6c060'; c.beginPath(); c.moveTo(len * 0.72, -10 * (o.w || 1)); c.lineTo(len * 0.78, 0); c.lineTo(len * 0.72, 10 * (o.w || 1)); c.lineTo(len * 0.75, 0); c.fill();
  c.strokeStyle = '#8a70c0'; c.lineWidth = 2; c.beginPath(); c.moveTo(len * 0.7, 2); c.quadraticCurveTo(len * 0.6, 14 + Math.sin((o.t || 0) * 6) * 4, len * 0.5, 18); c.stroke();
  if (o.glow) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,245,200,${0.5 * o.glow})`; c.lineWidth = 10; c.beginPath(); c.moveTo(len * 0.7, 0); c.lineTo(len, 0); c.stroke(); }
  c.restore();
}
function drawFeather(c, x, y, a, s, col) { c.save(); c.translate(x, y); c.rotate(a); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, 0, 12 * s, 'rgba(230,220,255,0.6)', 'rgba(0,0,0,0)'); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 11 * s, 3.4 * s, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-10 * s, 0); c.lineTo(10 * s, 0); c.stroke(); c.restore(); }

function drawSeraphV3(c, v) {
  const t = v.anim || 0, A = !!v.transformed, n = v.gauge ?? (A ? 5 : 3);
  if (A) glowCircle(c, 0, -80, 130, 'rgba(230,220,255,0.3)', 'rgba(200,190,255,0)');
  drawHumanoid(c, v, A ? SER_ARCH_PAL : SER_PAL, {
    back(c, P) {
      if (A) {
        c.save();
        for (const [i, rot, sc] of [[0, -0.1, 1.1], [1, 0.35, 0.9], [2, -0.55, 0.75]]) { c.save(); c.translate(P.sh[0] - 6, P.sh[1] + 2 + i * 6); c.rotate(rot + Math.sin(t * 3.5) * 0.06 * (i + 1)); aurWingFan(c, 84 * sc, 1, t, { tip: 'rgba(170,155,240,0.55)', mid: 'rgba(210,200,255,0.5)', base: 'rgba(250,246,255,0.6)', edge: 'rgba(120,100,200,0.7)', w: 0.9 }); c.restore(); }
        c.restore();
      } else for (const side of [-1, 1]) { c.save(); c.translate(P.sh[0] - 6, P.sh[1] + 2); c.rotate(side * 0.14 + Math.sin(t * 2) * 0.05 * side); aurWingFan(c, 72, 0.3, t, { tip: side < 0 ? '#dcd6ee' : '#f6f2ff', mid: '#fbf9ff', base: '#fff', edge: '#a898d0' }); c.restore(); }
      const [hx, hy] = P.head;
      c.fillStyle = '#ffe9a0'; c.strokeStyle = '#c9a64a'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(hx - 9, hy - 10); c.quadraticCurveTo(hx - 24, hy + 8, hx - 20 + Math.sin(t * 3) * 3, hy + 44); c.lineTo(hx - 8, hy + 36); c.quadraticCurveTo(hx - 4, hy + 12, hx + 2, hy - 2); c.closePath(); c.fill(); c.stroke();
    },
    chest(c, P) { const x = lerp(P.hip[0], P.sh[0], 0.66), y = lerp(P.hip[1], P.sh[1], 0.66); c.fillStyle = '#e6c060'; c.beginPath(); c.moveTo(x, y - 7); c.lineTo(x + 3, y); c.lineTo(x, y + 7); c.lineTo(x - 3, y); c.closePath(); c.fill(); c.fillRect(x - 7, y - 1, 14, 2); },
    head(c, P) {
      const [hx, hy] = P.head;
      c.fillStyle = '#ffe9a0'; c.beginPath(); c.moveTo(hx - 11, hy - 2); c.quadraticCurveTo(hx - 6, hy - 16, hx + 9, hy - 12); c.quadraticCurveTo(hx + 13, hy - 6, hx + 9, hy - 2); c.lineTo(hx + 1, hy - 7); c.closePath(); c.fill();
      c.strokeStyle = '#2a1a22'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx + 2, hy - 4.5); c.lineTo(hx + 9, hy - 5); c.stroke();
      c.beginPath(); c.moveTo(hx + 10, hy - 2); c.lineTo(hx + 12, hy + 2); c.lineTo(hx + 10.5, hy + 3); c.stroke();
      c.beginPath(); c.moveTo(hx + 6.5, hy + 6.5); c.lineTo(hx + 9.5, hy + 6.3); c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 6.5, hy - 1.5, 5, 'rgba(120,170,255,0.9)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#5a8ad8'; c.beginPath(); c.moveTo(hx + 3.5, hy - 1.5); c.quadraticCurveTo(hx + 6.5, hy - 3.2, hx + 9.5, hy - 1.8); c.quadraticCurveTo(hx + 6.5, hy - 0.4, hx + 3.5, hy - 1.5); c.fill();
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = A ? 'rgba(255,250,220,1)' : 'rgba(255,220,130,0.95)'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(hx - 2, hy - 22, 13, 4, -0.15, 0, Math.PI * 2); c.stroke();
      if (A) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * 0.5; c.beginPath(); c.moveTo(hx - 2 + Math.cos(a) * 15, hy - 22 + Math.sin(a) * 4.6); c.lineTo(hx - 2 + Math.cos(a) * 22, hy - 22 + Math.sin(a) * 7); c.stroke(); }
      c.restore();
    },
    front(c, P) { drawLightSpear(c, P.fH[0], P.fH[1], A ? 150 : 132, aurSwingAng(v) + 0.2, { glow: A ? 0.8 : 0.3, t }); },
  });
  // orbiting Aegis feathers
  for (let i = 0; i < n; i++) { const a = t * 2.2 + i * Math.PI * 2 / Math.max(1, n); drawFeather(c, Math.cos(a) * 46, -70 + Math.sin(a) * 26, a + Math.PI / 2, 1, '#f4f0ff'); }
}

// Portrait: calm, steady, unmoved. A guardian's stare, not a smile.
function drawSeraphPortrait(c, opts) {
  const A = !!opts.form;
  const g = c.createRadialGradient(50, 40, 4, 50, 50, 80); g.addColorStop(0, A ? '#fffbe8' : '#d8d0f0'); g.addColorStop(1, A ? '#8a78c0' : '#3a2e6a'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  drawLightSpear(c, 96, 96, 110, -2.25, { glow: 0.6, w: 1.4 });
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = A ? '#fffbe0' : '#ffd878'; c.lineWidth = 3; c.beginPath(); c.arc(50, 28, 28, 0, Math.PI * 2); c.stroke(); c.restore();
  c.fillStyle = A ? 'rgba(255,255,255,0.8)' : '#f6f2ff'; c.strokeStyle = '#a898d0'; c.lineWidth = 0.8;
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(50 + s * (22 + i * 4), 78 - i * 6, 15, 4, s * (0.5 + i * 0.22), 0, Math.PI * 2); c.fill(); c.stroke(); }
  c.fillStyle = '#ffe9a0'; c.beginPath(); c.moveTo(27, 42); c.quadraticCurveTo(22, 72, 28, 98); c.lineTo(72, 98); c.quadraticCurveTo(78, 72, 73, 42); c.quadraticCurveTo(50, 14, 27, 42); c.fill();
  c.fillStyle = '#c8c0e8'; c.beginPath(); c.moveTo(16, 100); c.lineTo(28, 82); c.lineTo(42, 76); c.lineTo(50, 84); c.lineTo(58, 76); c.lineTo(72, 82); c.lineTo(84, 100); c.fill();
  c.fillStyle = '#e6c060'; c.fillRect(46, 84, 8, 16);
  c.fillStyle = '#f2d6b8'; c.strokeStyle = '#8a6040'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(35, 38); c.quadraticCurveTo(50, 28, 65, 38); c.lineTo(65, 54); c.lineTo(58, 68); c.lineTo(50, 72); c.lineTo(42, 68); c.lineTo(35, 54); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#ffe9a0'; c.beginPath(); c.moveTo(33, 46); c.quadraticCurveTo(36, 24, 50, 25); c.quadraticCurveTo(64, 24, 67, 46); c.lineTo(62, 36); c.lineTo(56, 40); c.lineTo(50, 32); c.lineTo(44, 40); c.lineTo(38, 36); c.closePath(); c.fill();
  c.strokeStyle = '#4a3a2a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(38, 46.5); c.lineTo(46.5, 47); c.moveTo(62, 46.5); c.lineTo(53.5, 47); c.stroke();
  for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 3.5, 51); c.quadraticCurveTo(50 + s * 8, 48.8, 50 + s * 12.5, 50.6); c.quadraticCurveTo(50 + s * 8, 53, 50 + s * 3.5, 51); c.fill(); circle(c, 50 + s * 8, 51, 2.1, '#3a6ac8'); circle(c, 50 + s * 8, 51, 0.9, '#0a1020'); c.strokeStyle = '#2a1a22'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(50 + s * 3, 50.6); c.quadraticCurveTo(50 + s * 8, 48, 50 + s * 13, 50.2); c.stroke(); }
  c.strokeStyle = '#8a6040'; c.lineWidth = 1; c.beginPath(); c.moveTo(50, 52); c.lineTo(49.2, 59); c.lineTo(51, 59.3); c.stroke();
  c.strokeStyle = '#8a4a4a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(45.5, 64); c.lineTo(54.5, 64); c.stroke();
  for (let i = 0; i < (A ? 5 : 3); i++) drawFeather(c, 16 + i * 17, 16, 0.6, 0.7, '#fff');
}

// ---------------- kit ----------------
const SER_VOLLEY = mk({ name: 'Feather Volley', desc: 'Spends every Aegis feather as a homing spear of light (1 weak spear with none).', pose: 'cast', s: 12, a: 1, r: 20, swing: [-0.3, -0.8, -0.1], ai: { min: 150, max: 1400, use: 'zone' },
  ev: { 12: f => { const n = Math.max(1, f.gauge || 0), strong = (f.gauge || 0) > 0; f.gauge = 0; f.featherT = 0;
    Combat.fireShots(f, { count: n, spread: 0.18 * n, speed: 1050, r: 10, dmg: strong ? 40 : 26, kind: 'spear', color: '#e8e0ff', core: '#fff', homing: f.form ? 4 : 2.6, hs: 18, kb: [180, -60], life: 2 }); serSfx('whoosh'); } } });
const SER_LUNGE = mk({ name: 'Wing Lunge', desc: 'A swooping spear dash. Regrows a feather on hit.', pose: 'dash', s: 10, a: 14, r: 16, swing: [0, 0, 0], vel: [[10, 24, 1050, null]],
  hit: { dmg: 90, box: [-10, -110, 120, 90], kb: [480, -300], launch: true, hs: 22 }, ai: { min: 0, max: 300, use: 'approach' },
  onHit: a => { a.gauge = Math.min(serCap(a), (a.gauge || 0) + 1); } });
const SER_SANCT = Mv.place({ name: 'Sanctuary', desc: 'A healing circle (≈400 HP over 4s while she stands in it).', spawn: { kind: 'zone', at: 'self', r: 110, heal: 50, every: 0.5, life: 4, color: '#ffe08a' }, cd: 14, ai: { min: 0, max: 3000, use: 'heal' } });
const SER_AEGIS = Object.assign(Mv.counter({ name: 'Aegis Stance', desc: 'Parry. Spends a feather. A caught attack (even a projectile) sends her straight to the attacker with a spear strike.', window: 26, dmg: 115 }),
  { swing: [-1.57, -1.57, -1.57], onStart: f => { if (f.gauge > 0) { f.gauge--; Game.fx.burst(f.x, f.y - 70, 12, { color: '#e8e0ff', size: 6, speed: 200, glow: true, life: 0.35 }); } } });
const SER_RAIN = Mv.shot({ name: 'Judgment Rain', desc: 'Three spears downward.', pose: 'cast', proj: { speed: 1000, r: 9, dmg: 34, count: 3, spread: 0.4, angle: 1.0, kind: 'spear', color: '#ffe08a', trail: false } });

const SER_SUPER = superize(mk({ name: "Heaven's Gate", desc: 'Five pillars of light march toward the foe. Refills her feathers.', pose: 'cast_up', s: 14, a: 1, r: 24, swing: [-1.57, -1.57, -1.57],
  ev: { 14: f => { f.gauge = serCap(f); for (let i = 0; i < 5; i++) Combat.telegraph(f, { x: clamp(f.x + f.facing * (110 + i * 105), 40, Arena.stage.width - 40), r: 55, life: 14 + i * 6, color: '#fff0c8', column: true, onFire: h => {
    for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) Combat.resolveHit(o, f, H_({ dmg: 60, guard: 'mid', hs: 20, kb: [60, -380], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: SER_SUPER });
    Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: 16, color: '#fff6d0' }); serSfx('bell');
  } }); } } }), 100);
const SER_ULT = superize(mk({ name: 'LAST LIGHT', desc: 'Her halo becomes a spear of light, hurled at the foe. Blockable. Must connect. Heals 300.', pose: 'cast_up', s: 22, a: 1, r: 26, swing: [-1.57, -2.4, 0],
  ev: { 22: f => { Combat.fireShots(f, { speed: 1800, r: 26, dmg: 10, prio: 3, ultConnect: true, kind: 'spear', color: '#ffffff', core: '#fff8d0', life: 2, hs: 60, kb: [0, 0] }); serSfx('blast'); } } }), 300);
SER_ULT.id = 'seraph_ult'; SER_ULT.recoverWhiff = 30;
SER_ULT.ult = { dmg: 1080, cutscene: (a, t) => csSeraphLastLight(a, t), after: a => Combat.healSelf(a, 300), fx: { el: 'light', color: '#ffe08a', sky: ['#2a2050', '#8a70c0', '#ffe0b0'] } };

Object.assign(SERAPH, {
  role: 'Guardian · Aegis feathers · Counter', draw: drawSeraphV3, drawPortrait: drawSeraphPortrait, handArt: true, transformCutscene: f => csSeraphArchangel(f),
  bio: 'An angel sent to judge humanity who decided, after a week of watching people, to defend it instead. Her feathers catch what would have hurt them. Heaven is not pleased.',
  passive: ['Aegis Feathers', 'Feathers of light orbit her and regrow over time. A feather automatically catches the first hit of any combo aimed at her. Strip them before you can open her up.'],
  gauge: { name: 'AEGIS', max: 5, color: '#e8e0ff', pips: true, label: f => '· ' + (f.gauge || 0) + '/' + serCap(f) },
  moves: { '5S': SER_VOLLEY, '6S': SER_LUNGE, '2S': SER_SANCT, '4S': SER_AEGIS, 'jS': SER_RAIN },
  super: SER_SUPER, ult: SER_ULT, ultAct: 'shot', assist: '5S',
  form: Object.assign(SERAPH.form, { name: 'ARCHANGEL', desc: 'Permanent. Six wings of light, flight, 5 feathers that regrow faster, sharper homing.', cost: 200, flight: true, regen: 0, dmg: 1.08, speed: 1.06, scale: 1.1, moves: undefined,
    onStart: f => { f.gauge = serCap(f); } }),
  lines: Object.assign({}, SERAPH.lines, { intro: ['I will not let you harm them, {opp}.', 'Lay down your weapon. Please.', 'Every feather is a promise. Try to break one.'], form: ['I choose them. Always.'], ult: ['Last Light!'], ultHit: ['Be at peace.'] }),
});
for (const [slot, m] of Object.entries(SERAPH.moves)) { m.id = 'seraph_' + slot; m.slot = slot; m.owner = 'seraph'; if (slot === 'jS') m.air = true; }
SER_SUPER.id = 'seraph_super';
delete SERAPH.passiveTick;
SERAPH.onRoundStart = f => { f.gauge = 2; f.featherT = 0; };
SERAPH.passiveTick = f => { f.featherT = (f.featherT || 0) + 1; if (f.featherT >= (f.form ? 170 : 300) && (f.gauge || 0) < serCap(f)) { f.gauge++; f.featherT = 0; } };
SERAPH.onIncoming = (t, a, h, opts) => {
  if ((t.gauge || 0) < 1 || t.comboHits > 0 || opts.force || h.guard === 'throw' || h.ultConnect || (opts.move && opts.move.grab) || ['hit', 'ko', 'down', 'grabbed'].includes(t.state)) return undefined;
  if (t.invul > 0) return undefined;
  t.gauge--; t.featherT = 0;
  Game.popWorld(t.x, t.y - t.h - 30, 'AEGIS', '#e8e0ff', 20);
  Game.fx.burst(t.x - t.facing * 10, t.y - 70, 18, { color: ['#fff', '#e8e0ff', '#ffe08a'], size: 8, speed: 320, glow: true, life: 0.4 });
  if (Game.battle) Game.battle.hitstop = Math.max(Game.battle.hitstop, 6);
  serSfx('clang');
  return 'block';
};
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('seraph:')) delete PortraitCache[k]; });

// ---------------- cinematics ----------------
function csSeraphArchangel(f) {
  const fx = new ParticleSystem(1400), d = f.def;
  return {
    name: 'ARCHANGEL', dur: 4.4, fx,
    cues: [[0, () => serSfx('bell')], [1.3, () => serSfx('charge', 1)], [2.5, () => { serSfx('bell'); serSfx('blast'); }]],
    draw(c, t) {
      const k = seg(t, 1.2, 2.6);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${lerp(20, 250, k) | 0},${lerp(20, 240, k) | 0},${lerp(50, 255, k) | 0})`); g.addColorStop(1, `rgb(${lerp(60, 190, k) | 0},${lerp(50, 170, k) | 0},${lerp(100, 230, k) | 0})`); c.fillStyle = g; c.fillRect(0, 0, W, H);
      if (t < 1.3) { c.strokeStyle = 'rgba(180,190,230,0.4)'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 80; i++) { const x = (i * 97 + t * 500) % W, y = (i * 53 + t * 900) % H; c.moveTo(x, y); c.lineTo(x - 4, y + 16); } c.stroke(); }
      for (let i = 0; i < 3; i++) fx.add({ x: rand(0, W), y: H + 10, vx: rand(-20, 20), vy: rand(-240, -120), life: 3, size: rand(2, 5), color: '#fff', glow: true });
      fx.draw(c);
      drawCharAt(c, d, W / 2, H - 40 - 50 * k, 2.6, 1, { pose: t < 1.3 ? 'kneel' : t < 2.5 ? 'charge' : 'victory', anim: t, transformed: t > 2.3, gauge: t > 2.3 ? 5 : 3 });
      caption(c, 'Heaven asked me to judge them. I chose to protect them.', t, 0.1, 1.25, '#e8e0ff');
      if (t > 1.3 && t < 2.5) { c.globalAlpha = seg(t, 1.3, 1.5); bigText(c, 'I CHOOSE THEM.', W / 2, 140, 64, '#fff', '#5a4a8a'); c.globalAlpha = 1; }
      flashAt(c, t, 2.5, 2.8, '#ffffff');
      titleSlam(c, 'ARCHANGEL', 'EVERY FEATHER IS A PROMISE', t, 2.6, '#c8b8ff', 110);
    },
  };
}
function csSeraphLastLight(a, opp) {
  const fx = new ParticleSystem(2400), d = a.def, city = makeCineCity(18, 140, 360), baseY = H - 30, ox = W * 0.66;
  city.forEach((b, i) => { if (i % 3) b.dead = true; });
  const oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'LAST LIGHT', dur: 6.8, fx,
    cues: [[0, () => serSfx('bell')], [1.4, () => serSfx('charge', 1.2)], [2.8, () => serSfx('blast')], [3.4, () => { serSfx('boom'); serSfx('bell'); }], [4.4, () => serSfx('bell')]],
    draw(c, t) {
      const lit = seg(t, 3.4, 4.6);
      City.drawSky(c, t, { top: lit > 0 ? '#3a3070' : '#0a0716', mid: lit > 0 ? '#8a70c0' : '#1a1030', bot: lit > 0 ? '#ffe0b0' : '#3a2040', fullMoon: false, noMoon: true });
      if (lit > 0) for (const b of city) if (b.dead && Math.random() < 0.03 * lit + (t > 4.6 ? 1 : 0)) b.dead = false;
      drawCineCity(c, city, baseY, lit > 0 ? '#2a2a4a' : '#10102a', lit > 0.3);
      if (t < 2.8) {
        silhouette(c, o => drawCharAt(o, opp.def, ox, baseY, oppScale, -1, { pose: 'idle', anim: t, transformed: opp.transformed }), '#0a0a1a');
        const y = lerp(baseY + 60, 260, ease.out(seg(t, 0, 1.2)));
        drawCharAt(c, d, W * 0.3, y, 2.1, 1, { pose: t < 1.4 ? 'fly' : 'cast_up', anim: t, transformed: true, gauge: 5 });
        if (t > 1.4) { const k = ease.out(seg(t, 1.4, 2.6)); c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W * 0.3 + 30, y - 300, 60 + 140 * k, 'rgba(255,245,210,0.9)', 'rgba(0,0,0,0)'); c.restore(); drawLightSpear(c, W * 0.3 - 120 * k, y - 300, 260 * k + 10, -0.2, { glow: 1, w: 3 }); }
        caption(c, 'My halo was never mine. It was always theirs.', t, 0.1, 1.35, '#e8e0ff');
      } else if (t < 3.4) {
        const k = ease.in(seg(t, 2.8, 3.35));
        silhouette(c, o => drawCharAt(o, opp.def, ox, baseY, oppScale, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#0a0a1a');
        drawLightSpear(c, lerp(W * 0.3, ox - 60, k), lerp(200, baseY - 90, k), 300, Math.atan2(baseY - 290, ox - W * 0.3), { glow: 1, w: 3 });
        speedLines(c, t, ox, baseY - 90, 'rgba(255,245,210,0.5)');
      } else if (t < 4.6) {
        c.save(); c.globalCompositeOperation = 'lighter';
        const R = 900 * ease.out(lit); c.strokeStyle = `rgba(255,245,210,${1 - lit * 0.5})`; c.lineWidth = 10; c.beginPath(); c.arc(ox, baseY, R, Math.PI, 0); c.stroke();
        glowCircle(c, ox, baseY - 60, 500 * lit + 60, 'rgba(255,245,210,0.7)', 'rgba(0,0,0,0)'); c.restore();
        silhouette(c, o => drawCharAt(o, opp.def, ox, baseY - 60 - 80 * lit, oppScale, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }), '#0a0a1a');
        flashAt(c, t, 3.4, 3.8, '#ffffff');
      } else {
        fx.add({ x: rand(0, W), y: -10, vx: rand(-20, 20), vy: rand(60, 140), life: 5, size: rand(2, 5), color: '#fff8e0', glow: true }); fx.draw(c);
        silhouette(c, o => { o.save(); o.translate(W * 0.74, baseY - 12); o.rotate(-1.45); drawCharAt(o, opp.def, 0, 0, oppScale * 0.9, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }); o.restore(); }, '#1a1830');
        drawCharAt(c, d, W * 0.4, baseY - 20, 2.4, 1, { pose: 'victory', anim: t, transformed: true, gauge: 5 });
        titleSlam(c, 'LAST LIGHT', 'THE CITY IS WHOLE AGAIN', t, 4.8, '#fff0b0', 110);
      }
    },
  };
}
