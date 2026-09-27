// ============================================================
//  MOONKAI — KAEL, the Hollow Core (rebuilt).
//
//  GAUGE   · CONTAINMENT  starts full. Core moves and hits he takes crack it. Under 40 the demon
//                    BLEEDS THROUGH: his hits burn and deal +12%, but he takes +10%. If it hits
//                    zero the demon lashes out on its own (a hellfire burst), then the core
//                    re-seals at 50. In DEMON form it becomes HUNGER, fed by the damage he deals.
//  PASSIVE · SECOND LIFE  no transform button: his first KO each round revives him as the demon.
//                    Ultimate locked until then.
//  CRACK THE SEAL (←I)   spend 35 containment on purpose: a point-blank hellfire eruption.
//  DEVOUR (demon ↓I)     a grab that eats HUNGER to heal.
//  HELLFIRE BARRAGE      ultimate: a slow falling meteor. Blockable. Must connect.
// ============================================================
const kaSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const KAEL = charById('kael');
const kaCrack = (f, n) => {
  if (f.form) return;
  const before = f.gauge || 0; f.gauge = clamp(before - n, 0, 100);
  if (before >= 40 && f.gauge < 40) { Game.popWorld(f.x, f.y - f.h - 30, 'BLEED-THROUGH', '#ff5a1a', 20); kaSfx('heartbeat'); }
  if (f.gauge <= 0 && f.state !== 'ko') kaLashOut(f);
};
function kaLashOut(f) {
  for (const o of Combat.targets(f.side)) if (Math.abs(o.x - f.x) < 240) Combat.resolveHit(o, f, H_({ dmg: 110, guard: 'mid', hs: 26, kb: [650, -600], launch: true, status: { burn: 3 }, sfx: 'h' }), { fromX: f.x });
  Combat.addHazard({ kind: 'kaBurst', owner: f, side: f.side, x: f.x, y: f.y - 70, r: 240, life: 24 });
  f.gauge = 50; f.hp = Math.max(1, f.hp - f.maxHp * 0.04); Cam.shake = 14; kaSfx('roar'); kaSfx('boom');
  Game.popWorld(f.x, f.y - f.h - 40, 'IT GOT OUT', '#ff3b1a', 26); f.say('No... NO! Get back in!', 90);
}

function drawKaelPortrait(c, opts) {
  const D = !!opts.form;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, D ? '#3a0404' : '#0a1418'); g.addColorStop(1, D ? '#0a0000' : '#020608'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  // coat and the core in the chest
  c.fillStyle = D ? '#3a0b0b' : '#2b3440'; c.beginPath(); c.moveTo(6, 100); c.lineTo(20, 76); c.lineTo(80, 76); c.lineTo(94, 100); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50, 94, D ? 22 : 16, D ? 'rgba(255,70,20,1)' : 'rgba(60,220,255,1)', 'rgba(0,0,0,0)'); c.restore();
  if (!D) { c.strokeStyle = '#9ff4ff'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(44, 90); c.lineTo(50, 96); c.lineTo(47, 100); c.moveTo(56, 88); c.lineTo(52, 95); c.stroke(); }
  // gaunt face
  c.fillStyle = D ? '#6e1414' : '#c9b3a0'; c.strokeStyle = D ? '#200' : '#5a4a3a'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(34, 36); c.lineTo(66, 36); c.lineTo(66, 56); c.lineTo(58, 71); c.lineTo(50, 74); c.lineTo(42, 71); c.lineTo(34, 56); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.moveTo(36, 58); c.lineTo(42, 66); c.lineTo(38, 56); c.fill(); c.beginPath(); c.moveTo(64, 58); c.lineTo(58, 66); c.lineTo(62, 56); c.fill();
  if (D) { c.strokeStyle = '#ff5a1a'; c.lineWidth = 1.2; for (const [a, b, e, d2] of [[36, 40, 44, 52], [64, 42, 58, 60], [48, 66, 54, 72]]) { c.beginPath(); c.moveTo(a, b); c.lineTo((a + e) / 2 + 3, (b + d2) / 2); c.lineTo(e, d2); c.stroke(); } }
  else { c.strokeStyle = '#8a4a4a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(58, 42); c.lineTo(62, 60); c.stroke(); }
  // hair / horns
  if (D) { c.fillStyle = '#140202'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 12, 36); c.quadraticCurveTo(50 + s * 30, 20, 50 + s * 22, 2); c.quadraticCurveTo(50 + s * 22, 22, 50 + s * 6, 36); c.fill(); } }
  c.fillStyle = D ? '#1a0606' : '#e8e8f0'; c.beginPath(); c.moveTo(32, 44); c.lineTo(34, 28); c.lineTo(50, 22); c.lineTo(68, 26); c.lineTo(70, 40); c.lineTo(60, 32); c.lineTo(44, 34); c.closePath(); c.fill();
  // eyes: dead-tired, never friendly
  c.strokeStyle = '#1a1010'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(38, 46); c.lineTo(47, 48); c.moveTo(62, 46); c.lineTo(53, 48); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 8, 51, D ? 8 : 5, D ? 'rgba(255,90,26,1)' : 'rgba(63,224,255,1)', 'rgba(0,0,0,0)'); c.restore();
  for (const s of [-1, 1]) { c.fillStyle = D ? '#ffd0a0' : '#dff'; c.beginPath(); c.moveTo(50 + s * 4, 51); c.lineTo(50 + s * 12, 50); c.lineTo(50 + s * 10, 53); c.closePath(); c.fill(); }
  c.strokeStyle = D ? '#ffcc88' : '#4a3a3a'; c.lineWidth = 1.5; c.beginPath();
  if (D) { c.moveTo(40, 63); c.quadraticCurveTo(50, 70, 60, 62); c.stroke(); c.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(42 + i * 4, 64 + (i % 4 ? 1 : 0)); c.lineTo(44 + i * 4, 68); c.lineTo(46 + i * 4, 64); c.fill(); } }
  else { c.moveTo(44, 65); c.lineTo(56, 64); c.stroke(); }
}

// ---------------- kit ----------------
const KA_PULSE = Mv.shot({ name: 'Core Pulse', desc: 'Cyan energy shot (-5 containment).', s: 12, proj: { speed: 820, r: 12, dmg: 62, color: '#3fe0ff', limit: 2, tag: 'cp' }, onStart: f => kaCrack(f, 5) });
const KA_BREACH = Mv.rush({ name: 'Breach Charge', desc: 'Armored shoulder charge. Wall bounce.', speed: 950, frames: 14, armor: [6, 20], hit: { dmg: 100, kb: [600, -200], wb: true } });
const KA_GUARD = Object.assign(Mv.counter({ name: 'Core Guard', desc: 'Counter stance. A successful counter re-seals 15 containment.', window: 26, dmg: 120 }), { onHit: a => { if (!a.form) a.gauge = Math.min(100, (a.gauge || 0) + 15); } });
const KA_CRACK = mk({ name: 'Crack the Seal', desc: 'Deliberately cracks the core (-35 containment): a point-blank hellfire eruption. Refuses with the core already failing.', pose: 'charge', s: 14, a: 2, r: 22, ai: { min: 0, max: 170, use: 'combo' },
  ev: { 14: f => {
    if ((f.gauge || 0) < 36) { Game.popWorld(f.x, f.y - f.h - 30, 'CORE WILL NOT HOLD', '#aab', 16); return; }
    Combat.strikeZone(f, { x: f.x - 170, y: f.y - 190, w: 340, h: 196 }, { dmg: 135, guard: 'mid', hs: 26, kb: [600, -680], launch: true, status: { burn: 3 }, sfx: 'h' });
    Combat.addHazard({ kind: 'kaBurst', owner: f, side: f.side, x: f.x, y: f.y - 70, r: 180, life: 20 }); Cam.shake = 10; kaSfx('fire'); kaCrack(f, 35);
  } } });
const KA_DROP = Mv.dive({ name: 'Meteor Drop', desc: 'Plunging knee. Ground bounce.', vx: 500, vy: 1200, hit: { dmg: 90, gb: true } });
// demon
const KA_ORB = Mv.shot({ name: 'Hellfire Orb', desc: 'Arcing fireball that explodes.', proj: { speed: 640, angle: -0.42, g: 1100, r: 16, dmg: 80, explode: 90, color: '#ff3b1a', kind: 'fire', status: { burn: 2 } } });
const KA_CHAIN = Mv.shot({ name: 'Infernal Chain', desc: 'A hook that drags the enemy in.', proj: { speed: 1100, r: 10, dmg: 50, kind: 'hook', color: '#ff3b1a', trail: false, life: 0.7, pull: true, hs: 30 } });
const KA_DEVOUR = Mv.grab({ name: 'Devour', desc: 'Demon grab. Eats all HUNGER: heals 3 HP per point.', range: 70, grabData: { anim: 'drain', dmg: 160, frames: 40 } });
KA_DEVOUR.onHit = a => { const n = a.gauge || 0; if (n > 0) { Combat.healSelf ? Combat.healSelf(a, n * 3) : (a.hp = Math.min(a.maxHp, a.hp + n * 3)); Game.popWorld(a.x, a.y - a.h - 30, 'DEVOURED +' + Math.round(n * 3), '#ff5a1a', 20); a.gauge = 0; } };
const KA_HELLRUSH = Object.assign(Mv.rush({ name: 'Hellrush', desc: 'A burning charge that leaves fire behind.', speed: 1150, frames: 16, armor: [4, 20], hit: { dmg: 110, kb: [700, -300], wb: true, status: { burn: 2 } } }),
  { ev: { 20: f => { for (let i = 1; i <= 3; i++) Combat.addHazard({ kind: 'zone', owner: f, side: f.side, x: clamp(f.x - f.facing * i * 70, 20, Arena.stage.width - 20), r: 42, life: 1.8, every: 0.3, dmg: 14, color: '#ff3b1a', status: { burn: 1 }, t: 0, hits: new Map() }); } } });
const KA_ULT = Ult({ act: 'shot', name: 'HELLFIRE BARRAGE', desc: 'A slow, enormous hellfire meteor. Locked until revived. Blockable. Must connect.', dmg: 1250, cutscene: csKaelUlt, color: '#ff3b1a',
  proj: { kind: 'fire', color: '#ff3b1a', speed: 480, r: 46, angle: 0.08 }, fx: { el: 'blood', color: '#ff4a2a', sky: ['#120000', '#400', '#a20'] } });
KA_ULT.s = 36;

Object.assign(KAEL, {
  role: 'Containment · Two lives · Comeback', drawPortrait: drawKaelPortrait,
  gauge: { name: 'CONTAINMENT', max: 100, color: '#3fe0ff', label: f => (f.form ? '· HUNGER' : f.gauge < 40 ? '· BLEED-THROUGH' : '') },
  passive: ['Second Life', 'No transform button: his first KO each round revives him as the demon. Ultimate locked until then.'],
  moves: { '5S': KA_PULSE, '6S': KA_BREACH, '2S': KA_GUARD, '4S': KA_CRACK, 'jS': KA_DROP },
  ult: KA_ULT, ultAct: 'shot',
  form: Object.assign(KAEL.form, { desc: 'Revive only. Permanent. Lifesteal, stronger, ultimate unlocked. CONTAINMENT becomes HUNGER.', moves: { '5S': KA_ORB, '4S': KA_CHAIN, '2S': KA_DEVOUR, '6S': KA_HELLRUSH }, onStart: f => { f.gauge = 0; } }),
});
for (const [slot, m] of Object.entries(KAEL.moves)) { m.id = 'kael_' + slot; m.slot = slot; m.owner = 'kael'; if (slot === 'jS') m.air = true; }
for (const [slot, m] of Object.entries(KAEL.form.moves)) { m.id = 'kael_d' + slot; m.slot = slot; m.owner = 'kael'; }
KA_ULT.id = 'kael_ult';
KAEL.onRoundStart = f => { f.gauge = f.form ? 0 : 100; };
KAEL.onHurt = (t, a, dmg) => { if (!t.form) kaCrack(t, dmg * 0.06); };
KAEL.onHit = (a, t, dmg) => {
  if (a.form) { a.gauge = Math.min(100, (a.gauge || 0) + dmg * 0.12); return; }
  if ((a.gauge || 0) < 40 && t.hp > 1) { t.status.burn = Math.max(t.status.burn || 0, 1.5); }
};
KAEL.passiveDmg = f => (!f.form && (f.gauge || 0) < 40 ? 1.12 : 1);
KAEL.passiveArmor = f => (!f.form && (f.gauge || 0) < 40 ? 1.1 : 1);
KAEL.passiveTick = f => { if (!f.form && f.gauge < 100 && f.st % 20 === 0 && !f.move) f.gauge = Math.min(100, f.gauge + (f.gauge >= 40 ? 1 : 0.5)); };
const _drawKaelBody = KAEL.draw;
KAEL.draw = (c, v) => {
  if (!v.transformed && (v.gauge ?? 100) < 40) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -70, 70 + Math.sin((v.anim || 0) * 9) * 6, 'rgba(255,60,20,0.3)', 'rgba(0,0,0,0)'); c.restore(); }
  _drawKaelBody(c, v);
};
Combat.hz.kaBurst = h => h.t < h.life;
Combat.drawHz.kaBurst = (c, h) => { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, h.r * (0.4 + 0.7 * k), `rgba(255,60,20,${0.8 * (1 - k)})`, 'rgba(0,0,0,0)'); c.strokeStyle = `rgba(255,170,90,${1 - k})`; c.lineWidth = 5; c.beginPath(); c.arc(h.x, h.y, h.r * k, 0, Math.PI * 2); c.stroke(); c.restore(); };
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('kael:')) delete PortraitCache[k]; });
