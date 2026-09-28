// ============================================================
//  MOONKAI — ERIC, the Moonborn (main character), rebuilt.
//
//  The ultimate and the transformation are now completely different tools:
//   • MOONKAI (awakening) is EARNED: Eric needs a moon. Throw a Power Ball to hang a fake moon
//     in the sky (the foe can shoot it down), or fill the MOONLIGHT gauge to a full moon.
//     The Great Ape is a timed rampage: enormous, armored, cannot block, and it leaves him
//     EXHAUSTED when it ends.
//   • MOONLIGHT RUSH (human ultimate) is a pure fighter's finisher: a city-wide combo. If a
//     moon hangs in the sky when it lands, the finale changes: he glances up, and a single
//     giant ape fist comes down. He stays human.
//   • LUNAR CATACLYSM is the Great Ape's own ultimate: the skyline-erasing mouth beam.
//
//  MOONLIGHT gauge (moon phases): fills from fighting, faster from taking damage (Saiyan-style
//  comeback), from charging ki, and from gazing at his Power Ball. Each phase strengthens his ki.
// ============================================================
const ericSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const ERIC = charById('eric');
const PHASES = ['NEW MOON', 'CRESCENT', 'HALF MOON', 'GIBBOUS', 'FULL MOON'];
const ericPhase = f => Math.min(4, Math.floor((f.gauge || 0) / 25));
const ericMoon = f => Combat.hazards.find(h => h.kind === 'ericMoon' && h.owner === f);
function ericMoonlight(f, n) { if (f.form) return; const before = ericPhase(f); f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (ericPhase(f) > before) { Game.popWorld(f.x, f.y - f.h - 40, PHASES[ericPhase(f)], '#dfe8ff', 18); if (ericPhase(f) === 4) ericSfx('heartbeat'); } }
function prepKit(d, moves, pre) { for (const [slot, m] of Object.entries(moves)) { m.id = d.id + pre + slot; m.slot = slot; m.owner = d.id; if (slot === 'jS') m.air = true; } }

// ---------------- art: a sharper hero, a moonlit aura, eyes that redden as the moon fills ----------------
function drawEricV3(c, v) {
  if (v.transformed) { drawApe(c, v); return; }
  const g = v.gauge || 0, moon = v.side ? !!ericMoon(v) : false, t = v.anim || 0;
  if (g > 40 || moon) {
    c.save(); c.globalCompositeOperation = 'lighter';
    const k = Math.max(g / 100, moon ? 0.8 : 0);
    glowCircle(c, 0, -60, 70 + 30 * k, `rgba(200,220,255,${0.12 + 0.2 * k})`, 'rgba(120,150,255,0)');
    if (k > 0.7) for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; c.strokeStyle = `rgba(230,240,255,${0.5 * k})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(Math.cos(a) * 26, -60 + Math.sin(a) * 40); c.lineTo(Math.cos(a) * 34, -70 + Math.sin(a) * 50); c.stroke(); }
    c.restore();
  }
  drawEricHuman(c, Object.assign({}, v, { eyeRed: moon ? 0.9 : g >= 100 ? 0.7 : g >= 75 ? 0.35 : 0 }));
}

// Portrait: determined, a bandaged cheek, the moon rising behind. Great Ape: pure fury.
function drawEricPortrait(c, opts) {
  const A = !!opts.form;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, A ? '#2a0610' : '#0e1030'); g.addColorStop(1, A ? '#6a1020' : '#2a2a6a'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 78, 22, 34, 'rgba(255,245,210,0.9)', 'rgba(255,240,200,0)'); c.restore();
  circle(c, 78, 22, 15, '#fff8e0');
  if (A) {
    // Great Ape: heavy brow, burning eyes, fangs
    c.fillStyle = '#4a2c18'; c.beginPath(); c.moveTo(8, 100); c.quadraticCurveTo(0, 40, 22, 24); c.quadraticCurveTo(50, 2, 80, 26); c.quadraticCurveTo(100, 44, 94, 100); c.fill();
    c.fillStyle = '#d8b08a'; c.beginPath(); c.ellipse(50, 66, 30, 24, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2a1608'; c.beginPath(); c.moveTo(16, 40); c.lineTo(50, 50); c.lineTo(84, 40); c.lineTo(80, 48); c.lineTo(50, 58); c.lineTo(20, 48); c.closePath(); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 16, 53, 11, 'rgba(255,40,30,1)', 'rgba(0,0,0,0)'); c.restore();
    c.fillStyle = '#fff0a0'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 8, 54); c.lineTo(50 + s * 24, 51); c.lineTo(50 + s * 20, 56); c.fill(); }
    c.fillStyle = '#1a0806'; c.beginPath(); c.moveTo(34, 72); c.quadraticCurveTo(50, 64, 66, 72); c.quadraticCurveTo(50, 90, 34, 72); c.fill();
    c.fillStyle = '#f6efdc'; for (const x of [38, 60]) { c.beginPath(); c.moveTo(x - 3, 71); c.lineTo(x, 81); c.lineTo(x + 3, 70); c.fill(); }
    c.fillStyle = '#2a1608'; c.beginPath(); c.ellipse(44, 63, 3, 2, 0, 0, Math.PI * 2); c.ellipse(56, 63, 3, 2, 0, 0, Math.PI * 2); c.fill();
    return;
  }
  // scarf + jacket
  c.fillStyle = '#2d5fd6'; c.beginPath(); c.moveTo(14, 100); c.lineTo(26, 80); c.lineTo(74, 80); c.lineTo(86, 100); c.fill();
  c.fillStyle = '#e23b3b'; c.beginPath(); c.moveTo(32, 76); c.quadraticCurveTo(50, 86, 68, 76); c.lineTo(66, 84); c.quadraticCurveTo(50, 92, 34, 84); c.fill(); c.fillRect(56, 82, 8, 16);
  // neck + face (angular, not round)
  c.fillStyle = '#f1c27d'; c.fillRect(44, 64, 12, 14);
  c.strokeStyle = '#6a4020'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(33, 40); c.lineTo(67, 40); c.lineTo(66, 56); c.lineTo(58, 70); c.lineTo(50, 73); c.lineTo(42, 70); c.lineTo(34, 56); c.closePath(); c.fill(); c.stroke();
  // wild black spikes
  c.fillStyle = '#141414';
  c.beginPath(); c.moveTo(30, 50);
  for (const [x, y] of [[22, 38], [30, 36], [20, 22], [36, 26], [34, 8], [46, 22], [54, 4], [58, 22], [70, 10], [68, 28], [82, 22], [72, 38], [80, 44], [68, 44], [62, 34], [56, 42], [50, 32], [44, 42], [38, 34], [34, 46]]) c.lineTo(x, y);
  c.closePath(); c.fill();
  // determined brows + sharp eyes
  c.strokeStyle = '#141414'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(37, 47); c.lineTo(46, 49.5); c.moveTo(63, 47); c.lineTo(54, 49.5); c.stroke();
  for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 4, 53); c.quadraticCurveTo(50 + s * 9, 50.5, 50 + s * 14, 52.5); c.quadraticCurveTo(50 + s * 9, 55.5, 50 + s * 4, 53); c.fill(); circle(c, 50 + s * 9, 53, 2.2, '#6a4020'); circle(c, 50 + s * 9, 53, 1, '#111'); c.strokeStyle = '#141414'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(50 + s * 3.5, 52.5); c.quadraticCurveTo(50 + s * 9, 49.5, 50 + s * 14.5, 52); c.stroke(); }
  c.strokeStyle = '#8a5a30'; c.lineWidth = 1; c.beginPath(); c.moveTo(50, 55); c.lineTo(49, 61); c.lineTo(51, 61.5); c.stroke();
  c.strokeStyle = '#6a2a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(44, 65.5); c.quadraticCurveTo(51, 67, 57, 64); c.stroke();
  // bandage on the cheek
  c.fillStyle = '#f4ecd8'; c.save(); c.translate(61, 60); c.rotate(-0.3); c.fillRect(-5, -2, 10, 4); c.strokeStyle = '#c8b898'; c.lineWidth = 0.8; c.strokeRect(-5, -2, 10, 4); c.restore();
}

// ---------------- the Power Ball (fake moon) ----------------
Combat.hz.ericMoon = function (h) {
  const o = h.owner; if (!o || o.state === 'ko') return false;
  h.y = lerp(h.y, -560, 0.05);
  for (const p of this.projectiles) if (p.side !== h.side && p.life > 0 && Math.hypot(p.x - h.x, p.y - h.y) < 60 + p.r) { h.hp -= p.dmg || 30; p.life = 0; Game.fx.burst(h.x, h.y, 8, { color: '#fff8e0', size: 6, speed: 200, life: 0.3 }); }
  for (const t of this.targets(h.side)) if (t.state === 'move' && t.move && t.move.hit && t.mf >= t.move.s && t.mf < t.move.s + t.move.a && Math.abs(t.x - h.x) < 90 && Math.abs((t.y - t.h / 2) - h.y) < 90 && h.t % 12 === 0) h.hp -= 40;
  if (!o.form && h.t % 6 === 0) ericMoonlight(o, 1);
  if (h.hp <= 0) { Game.fx.burst(h.x, h.y, 50, { color: ['#fff8e0', '#dfe8ff', '#8fd3ff'], size: 10, speed: 500, glow: true, life: 0.7 }); Game.popWorld(h.x, h.y + 60, 'MOON SHATTERED', '#dfe8ff', 22); ericSfx('boom'); return false; }
  return h.t < h.life;
};
Combat.drawHz.ericMoon = function (c, h, t) {
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 150, 'rgba(255,245,210,0.45)', 'rgba(255,240,200,0)'); c.restore();
  City.drawMoon(c, t, 1, h.x, h.y, 58);
  const k = clamp(h.hp / h.maxHp, 0, 1); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 5; c.beginPath(); c.arc(h.x, h.y, 72, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#dfe8ff'; c.beginPath(); c.arc(h.x, h.y, 72, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke();
};

// ---------------- human kit ----------------
const KI = [
  { name: 'Ki Blast Volley', r: 11, dmg: 34, speed: 950 },
  { name: 'Ki Blast Volley II', r: 11, dmg: 34, speed: 1000 },
  { name: 'Ki Blast Volley III', r: 20, dmg: 64, speed: 900, kb: [420, -300], launch: true },
];
const ERIC_KI = KI.map((k, i) => Mv.shot({ name: k.name, desc: 'Press I up to three times: two quick blasts and a heavy third. Stronger with each moon phase.', s: i ? 7 : 10, pose: 'punch', kiStage: i,
  ai: { min: 150, max: 1400, use: 'zone' }, proj: { speed: k.speed, r: k.r, dmg: k.dmg, color: '#8fd3ff', core: '#fff', kb: k.kb || [160, -40], launch: k.launch, hs: i === 2 ? 26 : 16, prio: i === 2 ? 2 : 1 } }));
ERIC_KI.forEach((m, i) => { m.id = 'eric_ki' + (i + 1); m.slot = '5S'; m.owner = 'eric'; });
const ERIC_MOVES = {
  '5S': ERIC_KI[0],
  '6S': mk({ name: 'Tail Sweep', desc: 'A dashing low tail sweep that trips the foe into the air.', pose: 'sweep', s: 9, a: 8, r: 16, crouch: true, vel: [[4, 14, 850, null]],
    hit: { dmg: 64, guard: 'low', box: [-20, -40, 110, 40], kb: [90, -560], launch: true, hs: 24 }, ai: { min: 20, max: 260, use: 'approach' } }),
  '2S': Mv.rising({ name: 'Rising Fang', desc: 'Invincible rising uppercut. Anti-air.', hit: { dmg: 38, multi: 3 } }),
  '4S': mk({ name: 'Power Ball', desc: 'Hurls a ball of ki into the sky: a FAKE MOON for 10s (the foe can shoot it down). While it shines, Eric can become MOONKAI for 1 bar.', pose: 'cast_up', s: 18, a: 1, r: 20, cd: 14,
    ai: { min: 280, max: 3000, use: 'buff' },
    ev: { 18: f => { Combat.hazards = Combat.hazards.filter(h => !(h.kind === 'ericMoon' && h.owner === f)); Combat.addHazard({ kind: 'ericMoon', owner: f, side: f.side, x: f.x, y: f.y - 120, hp: 180, maxHp: 180, life: 10 * FPS }); Game.popWorld(f.x, f.y - f.h - 40, 'LOOK AT THE MOON', '#fff8e0', 22); ericSfx('charge', 0.6); } } }),
  'jS': Mv.dive({ name: 'Meteor Heel', desc: 'A plunging axe kick; ground bounce.', pose: 'air_spike', vx: 520, vy: 1400, hit: { dmg: 78, box: [0, -70, 90, 80], gb: true, kb: [200, 900], guard: 'high' } }),
};
const ERIC_SUPER = Sup.beam({ name: 'Lunar Wave', desc: 'A full-power ki wave.', beam: { color: '#bfe4ff', dmg: 26 } });
const ERIC_ULT = Ult({ act: 'rush', name: 'MOONLIGHT RUSH', desc: 'A city-wide combo. If a moon is in the sky, the finale changes... Must connect.', dmg: 1150, color: '#8fd3ff', cutscene: (a, t) => csEricMoonRush(a, t),
  fx: { el: 'light', color: '#8fd3ff', sky: ['#0a0716', '#1a2050', '#3a4a8a'] } });

// ---------------- Great Ape kit ----------------
const APE_MOVES = {
  '5S': Mv.beam({ name: 'Mouth Beam', desc: 'A sweeping beam from the jaws.', beam: { from: 'mouth', color: '#fff6b0', width: 46, dur: 50, dmg: 22 } }),
  '6S': mk({ name: 'Great Ape Charge', desc: 'An armored charge that smashes through anything.', pose: 'dash', s: 12, a: 16, r: 22, armor: [1, 28], vel: [[12, 28, 900, null]],
    hit: { dmg: 120, box: [-10, -120, 110, 120], kb: [800, -300], launch: true, wb: true, hs: 30, sfx: 'h' }, ai: { min: 0, max: 400, use: 'approach' } }),
  '2S': mk({ name: 'Seismic Stomp', desc: 'Shockwaves both ways.', pose: 'slam', s: 14, a: 1, r: 22, ai: { min: 0, max: 600, use: 'zone' },
    ev: { 14: f => { for (const d of [-1, 1]) Combat.addHazard({ kind: 'wave', x: f.x + d * 80, dir: d, owner: f, side: f.side, dmg: 80, life: 0.9, hits: new Map(), move: f.move }); Cam.shake = 14; ericSfx('slam'); } } }),
  '4S': mk({ name: 'Terrifying Roar', desc: 'Obliterates nearby projectiles, blows the foe back and weakens them.', pose: 'taunt', s: 10, a: 1, r: 20, cd: 6, ai: { min: 0, max: 500, use: 'trap' },
    ev: { 10: f => {
      ericSfx('roar'); Cam.shake = 16;
      for (const p of Combat.projectiles) if (p.side !== f.side && Math.abs(p.x - f.x) < 600) p.life = 0;
      for (const o of Combat.targets(f.side)) if (Math.abs(o.x - f.x) < 500) { o.status.weaken = Math.max(o.status.weaken || 0, 3); if (!o.airborne && o.state !== 'hit') o.vx = Math.sign(o.x - f.x || 1) * 900; Game.popWorld(o.x, o.y - o.h - 30, 'TERRIFIED', '#ff8a5a', 20); }
    } } }),
  'jS': Mv.dive({ name: 'Body Slam', desc: 'The whole ape comes down.', pose: 'air_spike', vx: 300, vy: 1300, hit: { dmg: 110, box: [-40, -90, 120, 100], gb: true, kb: [300, 900] } }),
};
const APE_SUPER = Sup.beam({ name: 'Moon Beam Sweep', desc: 'A massive mouth beam.', beam: { from: 'mouth', color: '#fff6b0', width: 90, dmg: 30 } });
const APE_ULT = Ult({ act: 'beam', name: 'LUNAR CATACLYSM', desc: 'The Great Ape erases the skyline. Must connect.', dmg: 1250, cutscene: csEricUlt, color: '#ffd35a', beam: { from: 'mouth' },
  fx: { el: 'light', color: '#ffd35a', sky: ['#0a0716', '#2a1030', '#51203a'] } });

// ---------------- apply to Eric ----------------
Object.assign(ERIC, {
  title: 'The Moonborn', role: 'All-rounder · Moonlight · Great Ape', draw: drawEricV3, drawPortrait: drawEricPortrait,
  bio: 'A quiet college kid with a tail he keeps tucked away. He fights like a hero from the old stories, but under a full moon, or one he makes himself, he becomes MOONKAI: a skyscraper-sized ape that cannot be reasoned with.',
  passive: ['Moonborn', 'MOONLIGHT fills as he fights, faster when he is hurt or charging ki, and while his Power Ball shines. Each moon phase strengthens his ki. At FULL MOON he can transform without a Power Ball.'],
  gauge: { name: 'MOONLIGHT', max: 100, color: '#dfe8ff', label: f => '· ' + PHASES[ericPhase(f)],
    icon: (c, f, x, y) => { circle(c, x, y, 8, '#1a1a30'); const p = (f.gauge || 0) / 100; c.save(); c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.clip(); circle(c, x - 16 * (1 - p), y, 8, '#fff8e0'); c.restore(); if (f.form) circle(c, x, y, 8, '#ff5a3a'); } },
  moves: ERIC_MOVES, super: ERIC_SUPER, ult: ERIC_ULT, ultAct: 'rush', transformCutscene: csEricTransform,
  passiveDmg: (f) => f.form ? 1 : 1 + ericPhase(f) * 0.03,
  form: Object.assign(ERIC.form, {
    name: 'MOONKAI', desc: 'TIMED (12s). Requires a moon: a Power Ball in the sky (1 bar) or a FULL MOON gauge (2 bars). A colossal ape: armor, huge damage, CANNOT BLOCK. Leaves him exhausted.',
    timed: 12, cost: 200, noBlock: true, superArmor: true, scale: 2.0, speed: 0.75, jump: 0.8, armor: 0.62, dmg: 1.35,
    moves: APE_MOVES, super: APE_SUPER, ult: APE_ULT,
    normals: makeNormals({ reach: 1.2, power: 1.3, speed: 1.25, heavy: true }),
    onStart: f => { const m = ericMoon(f); if (m) m.life = 0; f.gauge = 0; },
  }),
  lines: Object.assign({}, ERIC.lines, {
    intro: ["Let's keep the property damage under a billion this time.", 'Hey {opp}. Nice night for it.', "I'd rather be studying. Let's make this quick.", "Don't make me look at the moon."],
    form: ['RRRRAAAAGH!', 'LOOK AT THE MOON!'], ult: ['Moonlight... RUSH!'], ultHit: ['That one was for the neighborhood.'],
  }),
});
prepKit(ERIC, ERIC_MOVES, '_'); prepKit(ERIC, APE_MOVES, '_f');
ERIC.super.id = 'eric_super'; ERIC.ult.id = 'eric_ult'; APE_SUPER.id = 'eric_fsuper'; APE_ULT.id = 'eric_fult';
delete ERIC.passiveTick;

ERIC.transformGate = f => {
  if (ericMoon(f)) return { ok: f.meter >= 100, cost: 100, msg: 'NEED 1 BAR' };
  if ((f.gauge || 0) >= 100) return { ok: f.meter >= 200, cost: 200, msg: 'NEED 2 BARS' };
  return { ok: false, msg: 'NO MOON: throw a Power Ball (←I) or reach FULL MOON' };
};
ERIC.onFormEnd = f => { f.status.slow = Math.max(f.status.slow || 0, 2.5); f.status.weaken = Math.max(f.status.weaken || 0, 2.5); Game.popWorld(f.x, f.y - f.h - 30, 'EXHAUSTED', '#aab', 20); f.say('...ugh. Did I break anything?', 110); };
ERIC.onRoundStart = f => { f.gauge = 0; };
ERIC.specialFor = (f, slot) => (slot === '5S' && !f.form) ? ERIC_KI[0] : undefined;
ERIC.onHit = (a, t, dmg) => ericMoonlight(a, dmg * 0.04);
ERIC.onHurt = (t, a, dmg) => ericMoonlight(t, dmg * (t.hp < t.maxHp * 0.35 ? 0.1 : 0.06));
ERIC.passiveTick = f => {
  if (f.state === 'charge') { f.meter += 0.4; ericMoonlight(f, 0.35); }
  else if (f.st % 60 === 0) ericMoonlight(f, 0.8);
};
// press I again during a ki blast to fire the next one (up to three)
ERIC.moveHook = (f, m) => {
  if (m.kiStage !== undefined && m.kiStage < 2 && f.mf > m.s + 1 && f.buf.some(e => e.b === 'S')) { f.buf = f.buf.filter(e => e.b !== 'S'); f.move = null; f.startMove(ERIC_KI[m.kiStage + 1]); return; }
  if (m.kiStage !== undefined && m.kiStage < 2 && f.ctrl === 'cpu' && f.mf === m.s + 2 && Math.random() < 0.6) f.buf.push({ b: 'S', x: 0, y: 0, t: 8 });
};
PortraitCache && Object.keys(PortraitCache).forEach(k => { if (k.startsWith('eric:')) delete PortraitCache[k]; });

// ---------------- MOONLIGHT RUSH (human ultimate) ----------------
function csEricMoonRush(a, opp) {
  const fx = new ParticleSystem(2600), d = a.def, city = makeCineCity(18, 140, 360), baseY = H - 30, moonUp = !!ericMoon(a);
  const v = {}, gh = [{}, {}], hits = [0.7, 1.05, 1.35, 1.6, 1.85, 2.1], combo = ['punch', 'kick', 'punch2', 'heavy', 'kick', 'uppercut'], fired = new Set();
  const ex = W * 0.36, fistX = W * 0.68;
  return {
    name: 'MOONLIGHT RUSH', dur: 7.2, fx,
    cues: hits.map(h => [h, () => { ericSfx('hit'); ericSfx('slam'); }]).concat([[0, () => ericSfx('whoosh')], [2.3, () => ericSfx('whoosh')], [4.3, () => ericSfx(moonUp ? 'heartbeat' : 'charge', 1)], [moonUp ? 5.3 : 5.2, () => { ericSfx(moonUp ? 'roar' : 'beam', 1.6); ericSfx('boom'); }]]),
    draw(c, t) {
      // one continuous shot: he rushes down the skyline, launches straight up with the last hit, then falls back to the rooftop
      const n = hits.filter(h => t > h).length, lift = ease.out(seg(t, 2.25, 2.95)) * 430 - ease.in(seg(t, 3.5, 4.2)) * 430, camY = lift * 0.8;
      const impact = moonUp && t >= 5.3;
      c.save(); cineShake(c, hits.some(h => t > h && t < h + 0.08) ? 9 : impact ? Math.max(0, 22 - (t - 5.3) * 20) : 0);
      City.drawSky(c, t, { top: '#0a0716', mid: '#1a2050', bot: '#3a4a8a', fullMoon: false, noMoon: !moonUp });
      if (moonUp) City.drawMoon(c, t, 1, W * 0.78, 150 + camY * 0.25, 90);
      if (impact) for (const b of city) b.dead = true;
      const scroll = Math.min(t, 2.3) * 300;
      c.save(); c.translate(0, camY); for (const off of [0, W]) { c.save(); c.translate(-(scroll % W) + off, 0); drawCineCity(c, city, baseY, impact ? '#0a0e18' : '#10122a'); c.restore(); } c.restore();
      const ey = baseY - 40 - lift * 0.2, gaze = moonUp ? seg(t, 4.3, 5.0) : 0;
      const pose = t < 2.25 ? (n ? combo[n - 1] : 'dash') : t < 2.95 ? 'uppercut' : t < 3.5 ? 'jump' : t < 4.2 ? 'fall' : moonUp ? 'idle' : 'cast';
      const s = moonUp ? lerp(2.3, 3.2, ease.inOut(gaze)) : 2.3;
      if (t < 2.25) { c.globalAlpha = 0.3; cineChar(c, d, gh[0], ex - 70, ey, s, t, pose, { gauge: 100 }); c.globalAlpha = 0.15; cineChar(c, d, gh[1], ex - 140, ey, s, t, pose, { gauge: 100 }); c.globalAlpha = 1; speedLines(c, t, ex + 100, ey - 60, 'rgba(200,230,255,0.4)'); }
      cineChar(c, d, v, ex, ey, s, t, pose, { gauge: 100, eyeRed: moonUp ? Math.max(0.7, gaze) : 0.7 });
      for (const h of hits) if (t > h) { if (!fired.has(h)) { fired.add(h); fx.burst(ex + 170, ey - 70, 22, { color: ['#dfe8ff', '#8fd3ff', '#fff'], size: 8, speed: 520, life: 0.5, glow: true }); }
        if (t < h + 0.14) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, ex + 170, ey - 70, 100, 'rgba(200,230,255,0.9)', 'rgba(0,0,0,0)'); c.restore(); } }
      fx.draw(c);
      if (moonUp && t >= 4.3 && !impact) { c.fillStyle = `rgba(120,0,0,${0.25 * gaze})`; c.fillRect(0, 0, W, H); }
      if (moonUp && t > 4.95) {
        const k = ease.in(seg(t, 4.95, 5.3)), fy = lerp(-700, baseY - 240, k);
        c.save(); c.translate(fistX, fy); c.fillStyle = '#5b3a22'; c.strokeStyle = '#2a1608'; c.lineWidth = 4;
        c.beginPath(); c.moveTo(-90, -900); c.lineTo(90, -900); c.lineTo(110, 0); c.quadraticCurveTo(0, 90, -110, 0); c.closePath(); c.fill(); c.stroke();
        for (let i = -2; i <= 2; i++) { c.fillStyle = '#c89968'; c.beginPath(); c.ellipse(i * 40, 40, 20, 34, 0, 0, Math.PI * 2); c.fill(); c.stroke(); } c.restore();
        if (impact) { const r = seg(t, 5.3, 6.0); c.strokeStyle = `rgba(255,220,180,${1 - r})`; c.lineWidth = 10; c.beginPath(); c.ellipse(fistX, baseY - 20, r * 1000 + 1, r * 130 + 1, 0, 0, Math.PI * 2); c.stroke(); }
      }
      if (!moonUp && t >= 4.3) {
        const hx = ex + 46 * s, hy = ey - 80 * s;
        if (t < 5.2) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx, hy, 40 + 60 * seg(t, 4.3, 5.2), 'rgba(160,220,255,1)', 'rgba(0,0,0,0)'); c.restore(); }
        else { const k = seg(t, 5.2, 6.2); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(140,210,255,0.8)'; c.lineWidth = 90 * (1 - k * 0.3); c.beginPath(); c.moveTo(hx, hy); c.lineTo(W * 0.85, -200); c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = 30; c.stroke(); c.restore(); }
      }
      c.restore();
      caption(c, 'Sorry about the buildings. Hold still.', t, 0.05, 0.65, '#dfe8ff');
      if (n && t < 2.4) bigText(c, n + ' HITS', 160, 120, 44, '#ffd35a', '#000');
      if (moonUp) { caption(c, '...the moon.', t, 4.3, 5.1, '#ff9a8a'); if (t >= 5.3) flashAt(c, t, 5.3, 5.7, '#fff'); if (t > 5.6) titleSlam(c, 'MOONLIGHT RUSH', 'HE LOOKED AT THE MOON', t, 5.7, '#ffd35a', 96); }
      else { caption(c, 'Lunar... WAVE!', t, 4.3, 5.2, '#bfe4ff'); if (t > 5.6) titleSlam(c, 'MOONLIGHT RUSH', 'LUNAR WAVE INTO THE NIGHT', t, 5.7, '#8fd3ff', 96); }
    },
  };
}
