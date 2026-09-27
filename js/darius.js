// ============================================================
//  MOONKAI — DARIUS, the Hand of Noxus (League of Legends tribute), fighter #69.
//
//  GAUGE   · DOMINANCE  fills while the foe stands at the edge of his axe (the killing range
//                    of Decimate's blade). Punishes anyone who plays at his distance. Full: the
//                    next Decimate is a guaranteed BLADE hit on anything in range.
//  PASSIVE · HEMORRHAGE  his axe opens wounds: every hit adds a stack (max 5) that bleeds.
//                    At 5 stacks he gains NOXIAN MIGHT for 5s (+30% damage) and every hit keeps
//                    the foe at 5.
//  DECIMATE (5I)     a full axe spin. The BLADE (outer ring) hits for +50%, heals him and adds a
//                    stack; the handle (inner ring) is a weak shove.
//  APPREHEND (↓I)    the axe hooks the foe from range and drags them in.
//  SUPER · DECIMATE CYCLONE  three spins in a row, stepping forward.
//  NOXIAN GUILLOTINE  ultimate: a slow leap that tracks the foe and comes down with the axe. It
//                    does bonus damage for every Hemorrhage stack, and if it kills, Darius gets
//                    his meter back. Blockable. Must connect.
// ============================================================
const dxSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const DX_PAL = { build: 'heavy', skin: '#c8a080', top: '#3a1010', topDark: '#220808', pants: '#2a2a2e', pantsDark: '#18181c', boots: '#141418', belt: '#8a7a5a', glove: '#4a4a50', noHead: true, bracers: '#5a5a60', kneepads: '#5a5a60' };
const DX_MIN = 110, DX_MAX = 250;
const dxStacks = t => Combat.markCount(t, 'hemo');
const dxHemo = (a, t, n = 1) => {
  if (!t || t.state === 'ko') return;
  const k = Combat.mark(t, a, 'hemo', n, { max: 5, dur: 5, color: '#c01818', label: 'HEMORRHAGE' });
  t.status.bleed = Math.max(t.status.bleed || 0, 1 + 0.4 * k);
  if (k >= (a.form ? 3 : 5) && !(a.dxMight > 0)) { a.dxMight = 5 * FPS; Game.popWorld(a.x, a.y - a.h - 40, 'NOXIAN MIGHT', '#ff3030', 26); a.say('NOXUS!', 50); dxSfx('roar'); Cam.shake = 8; }
  if (a.dxMight > 0) Combat.mark(t, a, 'hemo', 5, { max: 5, dur: 5, color: '#c01818', label: 'HEMORRHAGE' });
};

function drawDariusAxe(c, x, y, ang, glow) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.strokeStyle = '#2a1a10'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, 0); c.lineTo(118, 0); c.stroke();
  c.fillStyle = '#a02020'; c.fillRect(-10, -4, 14, 8);                                                                        // red wrap
  c.fillStyle = '#6a6a72'; c.strokeStyle = '#141418'; c.lineWidth = 1.6;
  // the great crescent blade on one side, a hooked spike on the other
  c.beginPath(); c.moveTo(96, -6); c.quadraticCurveTo(110, -60, 150, -64); c.quadraticCurveTo(128, -30, 150, 10); c.quadraticCurveTo(120, 8, 104, 4); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(100, 4); c.lineTo(96, 30); c.lineTo(112, 44); c.lineTo(108, 6); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#c8c8d0'; c.lineWidth = 2; c.beginPath(); c.moveTo(148, -62); c.quadraticCurveTo(128, -30, 148, 8); c.stroke();
  c.fillStyle = '#c01818'; c.beginPath(); c.moveTo(118, -20); c.lineTo(126, -34); c.lineTo(132, -18); c.lineTo(126, -4); c.closePath(); c.fill();               // Noxian sigil
  if (glow) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,40,40,${glow})`; c.lineWidth = 8; c.beginPath(); c.moveTo(150, -64); c.quadraticCurveTo(128, -30, 150, 10); c.stroke(); }
  c.restore();
}
function drawDarius(c, v) {
  const t = v.anim || 0, H = !!v.transformed, m = v.move, might = v.dxMight > 0;
  if (might) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -80, 120 + Math.sin(t * 10) * 8, 'rgba(255,30,30,0.3)', 'rgba(0,0,0,0)'); c.restore(); }
  const spinning = m && m.dxSpin;
  drawHumanoid(c, v, DX_PAL, {
    back(c, P) { // Noxian cape
      c.fillStyle = '#6a0a0a'; c.strokeStyle = '#200'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(P.sh[0] - 16, P.sh[1]); c.lineTo(P.sh[0] - 44, P.hip[1] + 62 + Math.sin(t * 2) * 4); c.lineTo(P.sh[0] - 4, P.hip[1] + 58); c.lineTo(P.sh[0] + 8, P.sh[1] + 6); c.closePath(); c.fill(); c.stroke();
      if (H) { c.fillStyle = '#000'; c.beginPath(); c.moveTo(P.sh[0] - 36, P.hip[1] + 40); c.lineTo(P.sh[0] - 24, P.hip[1] + 26); c.lineTo(P.sh[0] - 14, P.hip[1] + 40); c.lineTo(P.sh[0] - 24, P.hip[1] + 54); c.closePath(); c.fill(); }
    },
    chest(c, P) { // plate cuirass
      const x = lerp(P.hip[0], P.sh[0], 0.6), y = lerp(P.hip[1], P.sh[1], 0.6);
      c.fillStyle = '#4a4a52'; c.strokeStyle = '#141418'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 18, y - 18); c.lineTo(x + 18, y - 18); c.lineTo(x + 14, y + 18); c.lineTo(x - 14, y + 18); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#6a6a72'; c.beginPath(); c.moveTo(x - 14, y - 4); c.lineTo(x + 14, y - 4); c.moveTo(x - 12, y + 8); c.lineTo(x + 12, y + 8); c.stroke();
    },
    pads(c, P) { // huge horned pauldrons
      c.fillStyle = '#4a4a52'; c.strokeStyle = '#141418'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(P.sh[0], P.sh[1], 20, 13, -0.3, Math.PI, 0); c.fill(); c.stroke();
      c.fillStyle = '#2a2a2e'; c.beginPath(); c.moveTo(P.sh[0] - 8, P.sh[1] - 10); c.quadraticCurveTo(P.sh[0] - 20, P.sh[1] - 34, P.sh[0] - 34, P.sh[1] - 30); c.quadraticCurveTo(P.sh[0] - 18, P.sh[1] - 24, P.sh[0] - 2, P.sh[1] - 8); c.fill();
    },
    head(c, P) {
      const [hx, hy] = P.head;
      shadedHead(c, hx, hy, 11.5, '#c8a080');
      // grey buzzcut, heavy brow, beard stubble, a scar across the eye
      c.fillStyle = '#5a5a5a'; c.beginPath(); c.arc(hx - 1, hy - 3, 11.5, Math.PI * 1.02, Math.PI * 1.92); c.fill();
      c.fillStyle = '#9a7a60'; c.fillRect(hx + 1, hy - 6, 11, 3);
      c.strokeStyle = '#111'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx + 2, hy - 5); c.lineTo(hx + 11, hy - 3); c.stroke();
      circle(c, hx + 7, hy - 1.5, 1.4, might ? '#ff2020' : '#2a1a10');
      if (might) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 1.5, 6, 'rgba(255,30,30,1)', 'rgba(0,0,0,0)'); c.restore(); }
      c.strokeStyle = '#7a3a2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx + 4, hy - 9); c.lineTo(hx + 9, hy + 4); c.stroke();
      c.fillStyle = 'rgba(60,60,60,0.55)'; c.beginPath(); c.moveTo(hx - 6, hy + 2); c.quadraticCurveTo(hx + 2, hy + 14, hx + 11, hy + 6); c.lineTo(hx + 11, hy + 3); c.quadraticCurveTo(hx + 2, hy + 8, hx - 4, hy); c.fill();
      c.strokeStyle = '#3a1a10'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx + 4, hy + 6); c.lineTo(hx + 11, hy + 5); c.stroke();
    },
    front(c, P) {
      let ang;
      if (spinning) ang = (v.mf || 0) * 0.55 * v.facing;
      else ang = { heavy: 0.6, slam: 1.1, dash: 0.2, uppercut: -1.4, air_spike: 1.3, air_heavy: 0.9, hurt: 2.2, hurt_air: 2.3, victory: -1.57, intro: -2.4, cast: 0.3, throw: 0.2 }[v.pose] ?? -2.1;
      drawDariusAxe(c, P.fH[0], P.fH[1], ang, spinning || might ? 0.8 : H ? 0.3 : 0);
    },
  });
}
function drawDariusPortrait(c, opts) {
  const H = !!opts.form;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, '#3a0404'); g.addColorStop(1, '#0a0000'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.fillStyle = '#6a0a0a'; c.fillRect(0, 0, 18, 100); c.fillRect(82, 0, 18, 100);                                                                  // war banners
  c.fillStyle = '#000'; for (const x of [9, 91]) { c.beginPath(); c.moveTo(x, 20); c.lineTo(x + 6, 30); c.lineTo(x, 40); c.lineTo(x - 6, 30); c.closePath(); c.fill(); }
  c.fillStyle = '#4a4a52'; c.strokeStyle = '#141418'; c.lineWidth = 1.5;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 18, 100); c.quadraticCurveTo(50 + s * 46, 70, 50 + s * 48, 100); c.fill(); c.stroke(); c.fillStyle = '#2a2a2e'; c.beginPath(); c.moveTo(50 + s * 34, 76); c.quadraticCurveTo(50 + s * 48, 56, 50 + s * 44, 42); c.quadraticCurveTo(50 + s * 40, 60, 50 + s * 28, 74); c.fill(); c.fillStyle = '#4a4a52'; }
  c.fillStyle = '#c8a080'; c.strokeStyle = '#5a3a2a'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(30, 34); c.lineTo(70, 34); c.lineTo(72, 58); c.lineTo(62, 76); c.lineTo(38, 76); c.lineTo(28, 58); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#5a5a5a'; c.beginPath(); c.moveTo(29, 42); c.quadraticCurveTo(30, 20, 50, 20); c.quadraticCurveTo(70, 20, 71, 42); c.lineTo(66, 34); c.lineTo(34, 34); c.closePath(); c.fill();
  c.fillStyle = '#9a7a60'; c.fillRect(32, 42, 36, 6);
  c.strokeStyle = '#111'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(35, 46); c.lineTo(46, 50); c.moveTo(65, 46); c.lineTo(54, 50); c.stroke();
  for (const s of [-1, 1]) { c.fillStyle = '#eee'; c.beginPath(); c.moveTo(50 + s * 4, 52); c.lineTo(50 + s * 13, 51); c.lineTo(50 + s * 11, 54); c.closePath(); c.fill(); circle(c, 50 + s * 8, 52.5, 1.6, H ? '#ff2020' : '#2a1a10'); }
  if (H) { c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 8, 52.5, 7, 'rgba(255,30,30,1)', 'rgba(0,0,0,0)'); c.restore(); }
  c.strokeStyle = '#7a3a2a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(54, 38); c.lineTo(62, 62); c.stroke();
  c.fillStyle = 'rgba(60,60,60,0.55)'; c.beginPath(); c.moveTo(34, 60); c.quadraticCurveTo(50, 84, 66, 60); c.lineTo(62, 74); c.lineTo(38, 74); c.closePath(); c.fill();
  c.strokeStyle = '#3a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(42, 67); c.lineTo(58, 66); c.stroke();
  drawDariusAxe(c, 4, 92, -1.0, H ? 0.5 : 0);
}

// ---------------- kit ----------------
const dxSpinHit = (f, mult = 1) => {
  const full = (f.gauge || 0) >= 100; if (full) f.gauge = 0;
  let any = false;
  for (const t of Combat.targets(f.side)) {
    const d = Math.abs(t.x - f.x); if (d > DX_MAX * f.scale || t.y < -180) continue;
    const blade = full || d >= DX_MIN * f.scale;
    const r = Combat.resolveHit(t, f, H_({ dmg: (blade ? 90 : 40) * mult, guard: 'mid', hs: blade ? 22 : 12, kb: [Math.sign(t.x - f.x) * (blade ? 500 : 250), -260], sfx: blade ? 'h' : 'm' }), { fromX: f.x, move: f.move });
    if (r === 'hit' && blade) { any = true; dxHemo(f, t); Combat.healSelf(f, Math.round((f.maxHp - f.hp) * 0.1) + 10); Game.popWorld(t.x, t.y - t.h - 30, 'BLADE', '#ff5a5a', 16); }
  }
  Combat.addHazard({ kind: 'dxSpin', owner: f, side: f.side, x: f.x, life: 14 });
  Cam.shake = any ? 8 : 3; dxSfx('slam');
};
const DX_DECIMATE = mk({ name: 'Decimate', desc: 'A full axe spin. The BLADE (outer ring) hits +50%, heals and adds Hemorrhage; the handle is a weak shove. Full DOMINANCE: everything in range is a blade hit.', pose: 'heavy', s: 20, a: 4, r: 18, dxSpin: true, ai: { min: 90, max: 240, use: 'combo' },
  ev: { 20: f => dxSpinHit(f) } });
const DX_CRIPPLE = mk({ name: 'Crippling Strike', desc: 'An overhead axe blow that adds 2 Hemorrhage stacks and cripples (slows).', pose: 'slam', s: 14, a: 5, r: 18, ai: { min: 0, max: 180, use: 'combo' },
  hit: { dmg: 85, guard: 'high', box: [0, -170, 170, 170], kb: [300, -200], hs: 20, status: { slow: 1.5 }, sfx: 'h' }, onHit: (a, t) => dxHemo(a, t, 1) });
const DX_APPREHEND = mk({ name: 'Apprehend', desc: 'The axe hooks the foe from range and drags them in front of him.', pose: 'throw', s: 16, a: 6, r: 22, ai: { min: 220, max: 480, use: 'zone' },
  hit: { dmg: 40, box: [180, -150, 220, 150], kb: [0, 0], hs: 18, sfx: 'm', guard: 'mid' },
  onHit: (a, t) => { t.x = clamp(a.x + a.facing * 140, 40, Arena.stage.width - 40); t.vx = 0; t.status.slow = Math.max(t.status.slow || 0, 1); a.gauge = Math.min(100, (a.gauge || 0) + 25); },
  ev: { 16: f => Combat.addHazard({ kind: 'dxHook', owner: f, side: f.side, x: f.x, dir: f.facing, life: 16 }) } });
const DX_MARCH = Mv.rush({ name: 'Brutal Advance', desc: 'An armored march that shoulders the foe off their feet.', s: 10, speed: 700, frames: 16, armor: [1, 26], hit: { dmg: 90, kb: [600, -300], launch: true } });
const DX_DROP = Mv.dive({ name: 'Axe Drop', desc: 'Comes down axe-first. Ground bounce.', vx: 300, vy: 1500, hit: { dmg: 105, gb: true } });
const DX_SUPER = superize(mk({ name: 'Decimate Cyclone', desc: 'Three Decimate spins in a row, stepping forward between each.', pose: 'heavy', s: 12, a: 40, r: 20, dxSpin: true, vel: [[12, 52, 260, null]],
  ev: { 12: f => dxSpinHit(f, 0.8), 30: f => dxSpinHit(f, 0.8), 48: f => dxSpinHit(f, 1.1) } }), 100);
const DX_ULT = superize(mk({ name: 'NOXIAN GUILLOTINE', desc: 'A slow leap that tracks the foe and comes down with the axe. +60 damage per Hemorrhage stack; a kill refunds his meter. Blockable. Must connect.', pose: f => (f.mf < 44 ? 'jump' : 'air_spike'), s: 44, a: 8, r: 30,
  ev: { 1: f => { f.say('To the guillotine!', 70); dxSfx('roar'); f.vy = -1500; f.y = -1; f.dxLeap = true; } } }), 300);
DX_ULT.id = 'darius_ult'; DX_ULT.recoverWhiff = 40;
DX_ULT.ult = { dmg: 1150, cutscene: (a, t) => csDariusGuillotine(a, t), fx: { el: 'blood', color: '#ff3030' },
  after: (a, t) => { const n = t ? dxStacks(t) : 0; if (t && n && t.hp > 1) { t.hp = Math.max(1, t.hp - 60 * n); Game.popWorld(t.x, t.y - t.h - 40, 'x' + n + ' HEMORRHAGE', '#ff3030', 22); } Game.later(0.3, () => { if (t && t.state === 'ko') { a.side.meter = Math.min(METER_MAX, a.side.meter + 300); Game.popWorld(a.x, a.y - a.h - 40, 'RESET', '#ff3030', 30); a.say('Noxus will rise!', 80); } }); } };

const darius = fighter({
  id: 'darius', name: 'DARIUS', title: 'The Hand of Noxus', side: 'VILLAIN', role: 'Juggernaut · Bleed · Executioner', color: '#ff3030', color2: '#1a0404',
  bio: 'The Hand of Noxus. A general who rose from the gutters of Basilich with an axe and a simple belief: strength is the only law. He has never retreated. He has never needed to.',
  quote: 'Noxus will rise!',
  ending: 'Darius stands at the top of Metro City\'s tallest tower and plants the Noxian banner. By morning, three villains have enlisted. By evening, the city has a draft.',
  hp: 1180, walk: 215, weight: 1.2, scale: 1.1, rival: 'sion', handArt: true, draw: drawDarius, drawPortrait: drawDariusPortrait, transformCutscene: f => csDariusHand(f),
  tall: 1.12, wide: 1.35, weaponTip: 160,
  model: { skin: '#c8a080' }, face: { expr: 'angry' }, style: { reach: 1.3, power: 1.2, speed: 1.15, heavy: true, weapon: true },
  gauge: { name: 'DOMINANCE', max: 100, color: '#ff5a5a', label: f => ((f.gauge || 0) >= 100 ? '· DECIMATE READY' : '') + (f.dxMight > 0 ? ' · NOXIAN MIGHT' : '') },
  passive: ['Hemorrhage', 'Every hit adds a bleeding stack (max 5). At 5 he gains NOXIAN MIGHT for 5s: +30% damage, and every hit keeps the foe at 5.'],
  moves: { '5S': DX_DECIMATE, '6S': DX_CRIPPLE, '2S': DX_APPREHEND, '4S': DX_MARCH, 'jS': DX_DROP },
  super: DX_SUPER, ult: DX_ULT,
  form: { name: 'HAND OF NOXUS', desc: 'Permanent. The banner of Noxus: armor, and NOXIAN MIGHT triggers at 3 stacks instead of 5.', cost: 200, armor: 0.85, dmg: 1.08, scale: 1.08 },
  assist: '2S',
  lines: {
    intro: ['Kneel, {opp}. Or be knelt.', 'Strength above all.', 'You picked the wrong side.'],
    win: ['Weakness is a choice.', 'Noxus will rise!', 'Get up. I dare you.'],
    taunt: ['Is that all?', 'Hah.'], form: ['BY THE HAND OF NOXUS!'], ult: ['To the guillotine!'], ultHit: ['DUNKED.'], tag: ['Fall back. Now.'], enter: ['No retreat!'], assist: ['Get over here!'], moves: ['Decimate!', 'Bleed.', 'Nowhere to run!'],
  },
});
darius.ult = DX_ULT; darius.ultAct = 'strike'; DX_SUPER.id = 'darius_super';
for (const [slot, m] of Object.entries(darius.moves)) { m.id = 'darius_' + slot; m.slot = slot; m.owner = 'darius'; if (slot === 'jS') m.air = true; }
darius.passiveDmg = f => (f.dxMight > 0 ? 1.3 : 1);
darius.onRoundStart = f => { f.gauge = 0; f.dxMight = 0; f.dxLeap = false; };
darius.onHit = (a, t) => { if (!a.move || !a.move.dxSpin) dxHemo(a, t); };
darius.passiveTick = f => {
  if (f.dxMight > 0) f.dxMight--;
  const o = f.opp; if (o && o.state !== 'ko') { const d = Math.abs(o.x - f.x); if (d >= DX_MIN * f.scale && d <= DX_MAX * f.scale && Math.abs(o.y) < 150 && f.st % 3 === 0) f.gauge = Math.min(100, (f.gauge || 0) + 1); }
};
darius.moveHook = (f, m) => {
  if (m !== DX_ULT || !f.dxLeap) return;
  const o = f.opp;
  if (f.mf < m.s) { if (o) f.vx = clamp((o.x - f.x) * 3, -900, 900); f.facing = o && o.x < f.x ? -1 : 1; if (f.mf > 22) f.vy = Math.max(f.vy, -200); return; }
  if (f.mf === m.s) { f.vy = 2600; f.vx = 0; }
  if (f.y >= -2 || f.mf >= m.s + 6) {
    f.dxLeap = false; f.y = 0;
    Combat.strikeZone(f, { x: f.x - 120, y: -220, w: 240, h: 226 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: DX_ULT });
    Combat.addHazard({ kind: 'dxSpin', owner: f, side: f.side, x: f.x, life: 16, slam: true }); Cam.shake = 16; dxSfx('slam'); dxSfx('boom');
  }
};
darius.drawWorldBack = (c, f) => {
  // the axe's killing ring: faint unless DOMINANCE is building
  const o = f.opp; if (!o) return; const d = Math.abs(o.x - f.x), inRing = d >= DX_MIN * f.scale && d <= DX_MAX * f.scale;
  c.save(); c.strokeStyle = inRing ? 'rgba(255,60,60,0.6)' : 'rgba(255,60,60,0.12)'; c.lineWidth = 2; c.setLineDash([6, 6]);
  c.beginPath(); c.ellipse(f.x, 2, DX_MAX * f.scale, 10, 0, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.ellipse(f.x, 2, DX_MIN * f.scale, 6, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); c.restore();
};
Combat.hz.dxSpin = h => h.t < h.life;
Combat.drawHz.dxSpin = (c, h) => {
  const k = h.t / h.life, f = h.owner, R = DX_MAX * (f.scale || 1);
  c.save(); c.globalCompositeOperation = 'lighter';
  if (h.slam) { glowCircle(c, h.x, -20, 220 * (0.5 + k), `rgba(255,40,40,${0.8 * (1 - k)})`, 'rgba(0,0,0,0)'); }
  else { c.strokeStyle = `rgba(255,80,80,${1 - k})`; c.lineWidth = 16 * (1 - k); c.beginPath(); c.ellipse(h.x, -90, R, 50, 0, k * 6, k * 6 + 5.5); c.stroke(); c.strokeStyle = `rgba(255,220,220,${1 - k})`; c.lineWidth = 3; c.beginPath(); c.ellipse(h.x, -90, R - 6, 46, 0, k * 6, k * 6 + 5.5); c.stroke(); }
  c.restore();
};
Combat.hz.dxHook = h => h.t < h.life;
Combat.drawHz.dxHook = (c, h) => {
  const k = Math.sin(h.t / h.life * Math.PI), f = h.owner, x2 = h.x + h.dir * 400 * k;
  c.save(); c.strokeStyle = '#3a2a1a'; c.lineWidth = 5; c.beginPath(); c.moveTo(h.x + h.dir * 30, -100); c.lineTo(x2, -90); c.stroke();
  c.translate(x2, -90); c.scale(h.dir, 1); drawDariusAxe(c, -100, 0, 0, 0); c.restore();
};

// ---------------- cinematics ----------------
function csDariusHand(f) {
  const d = f.def;
  return {
    name: 'HAND OF NOXUS', dur: 4, fx: new ParticleSystem(500),
    cues: [[0.1, () => dxSfx('slam')], [0.7, () => dxSfx('slam')], [1.3, () => dxSfx('slam')], [2.3, () => { dxSfx('roar'); dxSfx('boom'); }]],
    draw(c, t) {
      c.fillStyle = '#0a0000'; c.fillRect(0, 0, W, H);
      // a legion's shields strike the ground in time; the banner unfurls behind him
      for (let r = 0; r < 3; r++) for (let i = 0; i < 18; i++) { const x = 30 + i * (W - 60) / 17, y = H - 40 - r * 36, beat = [0.1, 0.7, 1.3].some(b => t > b && t < b + 0.1); c.fillStyle = '#2a0a0a'; c.fillRect(x - 12, y - 30 - (beat ? 4 : 0), 24, 30); c.fillStyle = '#6a0a0a'; c.fillRect(x - 3, y - 28 - (beat ? 4 : 0), 6, 26); }
      const k = ease.out(seg(t, 1.3, 2.3)); c.fillStyle = '#6a0a0a'; c.fillRect(W / 2 - 110, 20, 220, 340 * k); c.fillStyle = '#000'; c.beginPath(); c.moveTo(W / 2, 60); c.lineTo(W / 2 + 50, 60 + 120 * k); c.lineTo(W / 2, 60 + 240 * k); c.lineTo(W / 2 - 50, 60 + 120 * k); c.closePath(); c.fill();
      drawCharAt(c, d, W / 2, H - 140, 2.5, 1, { pose: t < 2.3 ? 'idle' : 'victory', anim: t, transformed: t > 2.2 });
      caption(c, 'Strength above all.', t, 0.2, 2.1, '#ffb0b0');
      flashAt(c, t, 2.3, 2.6, '#ff5a5a');
      titleSlam(c, 'HAND OF NOXUS', 'NOXUS WILL RISE', t, 2.4, '#ff3030', 90);
    },
  };
}
function csDariusGuillotine(a, opp) {
  const fx = new ParticleSystem(1500), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'NOXIAN GUILLOTINE', dur: 6.2, fx,
    cues: [[0, () => dxSfx('roar')], [1.6, () => dxSfx('tone', 300, 0.6, 'sawtooth', 0.04, 900)], [3.0, () => { dxSfx('slam'); dxSfx('boom'); }]],
    draw(c, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0000'); g.addColorStop(1, '#5a0a0a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = '#1a0a0a'; c.fillRect(0, H - 60, W, 60);
      if (t < 3.0) {
        // he rises against a blood-red sun, axe raised, then falls
        const k = seg(t, 0, 3.0), up = Math.sin(Math.min(1, k * 1.4) * Math.PI / 2), down = seg(t, 2.4, 3.0);
        c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2, H * 0.3, 160, 'rgba(255,60,40,0.5)', 'rgba(0,0,0,0)'); c.restore();
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.62, H - 60, oppScale, -1, { pose: t < 1.6 ? 'idle' : 'block', anim: t, transformed: opp.transformed }), '#1a0404');
        drawCharAt(c, a.def, lerp(W * 0.3, W * 0.56, k), lerp(H - 60, H * 0.35, up) + down * (H * 0.65 - 60), 2.2, 1, { pose: down > 0 ? 'air_spike' : 'jump', anim: t });
        caption(c, 'To the guillotine!', t, 0.2, 1.5, '#ffb0b0');
      } else {
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.62, H - 60, oppScale * 0.9, -1, { pose: 'kneel', anim: 0, transformed: opp.transformed }), '#1a0404');
        drawCharAt(c, a.def, W * 0.5, H - 60, 2.4, 1, { pose: 'slam', anim: t });
        if (t < 3.2) for (let i = 0; i < 50; i++) fx.add({ x: W * 0.6, y: H - 120, vx: rand(-900, 900), vy: rand(-900, -100), life: 1.2, size: rand(4, 12), color: pick(['#c01818', '#6a0a0a', '#3a2a1a']), g: 1200 });
        fx.draw(c);
        c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,60,60,${1 - seg(t, 3, 4)})`; c.lineWidth = 12; c.beginPath(); c.moveTo(W * 0.6, 0); c.lineTo(W * 0.6, H - 60); c.stroke(); c.restore();
        flashAt(c, t, 3.0, 3.25, '#fff');
        if (t > 3.8) titleSlam(c, 'NOXIAN GUILLOTINE', 'DUNKED', t, 3.9, '#ff3030', 86);
      }
    },
  };
}
rival('darius', 'sion', [[0, 'Sion. Noxus dragged you back for one more war.'], [1, 'And you will lead it, general. Or I will.']],
  { darius: 'Stay down, old soldier. Noxus has what it needs.', sion: 'Your axe is sharp. Your will is sharper.' });
rival('darius', 'mordekaiser', [[1, 'Noxus was mine before it was yours, general.'], [0, 'Then you should have held it.']],
  { darius: 'Back to your realm, revenant.', mordekaiser: 'Your soul will make a fine general.' });
