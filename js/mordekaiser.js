// ============================================================
//  MOONKAI — MORDEKAISER, the Iron Revenant (League of Legends tribute).
//
//  GAUGE   · INDESTRUCTIBLE  every point of damage he deals (and a little he takes) is banked
//                    as iron. ↓I spends it all as a shield that holds for 3s.
//  PASSIVE · DARKNESS RISE   land three hits within 4s and a black storm wakes around him,
//                    burning anyone close every half second. Keeps going while he keeps hitting.
//  OBLITERATE (5I)   Nightfall comes down in a line. The HEAD of the mace (the far end) hits
//                    for +50%. Isolated foes (no projectiles or hazards of theirs nearby) take +20%.
//  DEATH'S GRASP (→I)  a claw of darkness at range that drags the foe to him.
//  SUPER · GRAVE CHAINS  chains burst up in a ring; everything inside is dragged to the centre
//                    and slowed, and Darkness Rise ignites instantly.
//  REALM OF DEATH     ultimate: a slow creeping tether of darkness. If it takes hold, the foe is
//                    pulled into the Death Realm: and when he returns he keeps a piece of them
//                    (+10% damage for the rest of the round). Blockable. Must connect.
// ============================================================
const mkSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const MK_PAL = { build: 'giant', skin: '#2a3a3a', top: '#3a4a48', topDark: '#1e2a28', pants: '#2a3432', pantsDark: '#161e1c', boots: '#141a18', belt: '#6aff9a', glove: '#3a4a48', noHead: true, bracers: '#4a5a58', kneepads: '#4a5a58' };
const MK_LORD_PAL = Object.assign({}, MK_PAL, { top: '#1a2422', topDark: '#0e1412', belt: '#9affc0' });

function drawNightfall(c, x, y, ang, glow) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.strokeStyle = '#1a2220'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-20, 0); c.lineTo(96, 0); c.stroke();
  c.fillStyle = '#3a4a48'; c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(90, -18); c.lineTo(124, -22); c.lineTo(134, 0); c.lineTo(124, 22); c.lineTo(90, 18); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1a2220'; for (const [a, b] of [[104, -22], [118, -24], [104, 22], [118, 24], [134, 0]]) { c.beginPath(); c.moveTo(a - 4, b * 0.8); c.lineTo(a + (b ? 0 : 12), b ? b + Math.sign(b) * 10 : 0); c.lineTo(a + 4, b * 0.8); c.fill(); }
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 112, 0, 16 + glow * 18, `rgba(110,255,160,${0.5 + 0.5 * glow})`, 'rgba(0,0,0,0)'); c.restore();
  c.restore();
}
function drawMordekaiser(c, v) {
  const t = v.anim || 0, L = !!v.transformed, m = v.move, storm = v.mkStorm > 0;
  if (storm) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { c.strokeStyle = `rgba(90,255,150,${0.35 - i * 0.08})`; c.lineWidth = 6; c.beginPath(); c.ellipse(0, -90, 120 - i * 14, 60, 0, t * 3 + i * 2, t * 3 + i * 2 + 3.5); c.stroke(); } c.restore(); }
  drawHumanoid(c, v, L ? MK_LORD_PAL : MK_PAL, {
    back(c, P) { // tattered cape of shadow
      c.fillStyle = '#0a1210'; c.beginPath(); c.moveTo(P.sh[0] - 14, P.sh[1]); c.lineTo(P.sh[0] - 44, P.hip[1] + 60); for (let i = 0; i < 6; i++) c.lineTo(P.sh[0] - 40 + i * 9, P.hip[1] + 44 + (i % 2) * 18 + Math.sin(t * 4 + i) * 4); c.lineTo(P.sh[0] + 6, P.sh[1] + 8); c.fill();
    },
    chest(c, P) { // iron breastplate with a glowing seam
      const x = lerp(P.hip[0], P.sh[0], 0.6), y = lerp(P.hip[1], P.sh[1], 0.6);
      c.fillStyle = '#4a5a58'; c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 16, y - 16); c.lineTo(x + 16, y - 16); c.lineTo(x + 12, y + 16); c.lineTo(x, y + 22); c.lineTo(x - 12, y + 16); c.closePath(); c.fill(); c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(110,255,160,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x, y + 18); c.stroke(); c.restore();
    },
    pads(c, P) { // massive spiked pauldrons
      c.fillStyle = '#3a4a48'; c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(P.sh[0], P.sh[1] - 2, 18, 12, -0.2, Math.PI, 0); c.fill(); c.stroke();
      c.fillStyle = '#1a2220'; for (const dx of [-12, -2, 8]) { c.beginPath(); c.moveTo(P.sh[0] + dx - 3, P.sh[1] - 10); c.lineTo(P.sh[0] + dx, P.sh[1] - 28); c.lineTo(P.sh[0] + dx + 3, P.sh[1] - 10); c.fill(); }
    },
    head(c, P) { // a crowned helm with nothing inside but green light
      const [hx, hy] = P.head;
      c.fillStyle = '#3a4a48'; c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(hx - 12, hy + 12); c.lineTo(hx - 13, hy - 10); c.lineTo(hx + 12, hy - 12); c.lineTo(hx + 14, hy + 10); c.lineTo(hx + 4, hy + 14); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#1a2220'; for (let i = 0; i < 5; i++) { const x = hx - 11 + i * 5.5; c.beginPath(); c.moveTo(x - 2.5, hy - 10); c.lineTo(x, hy - 22 - (i === 2 ? 10 : i % 2 ? 4 : 0)); c.lineTo(x + 2.5, hy - 10); c.fill(); }
      c.fillStyle = '#050808'; c.fillRect(hx - 2, hy - 4, 16, 5);
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 1.5, L ? 11 : 8, 'rgba(110,255,160,1)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#caffd8'; c.fillRect(hx + 3, hy - 2.5, 9, 2);
    },
    front(c, P) {
      const swing = m && (m.name === 'Obliterate' || m.name === 'Nightfall');
      const ang = swing ? lerp(-2.6, 0.9, clamp((v.mf || 0) / ((m.s || 10) + 2), 0, 1)) : ({ heavy: 0.8, slam: 1.1, dash: 0.3, uppercut: -1.4, air_spike: 1.3, hurt: 2.2, victory: -1.57, intro: 1.2, cast: -0.4, cast_up: -1.5 }[v.pose] ?? -2.2);
      drawNightfall(c, P.fH[0], P.fH[1], ang, swing ? 1 : L ? 0.5 : 0.2);
    },
  });
}
function drawMordekaiserPortrait(c, opts) {
  const L = !!opts.form;
  c.fillStyle = '#020605'; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50, 60, 70, L ? 'rgba(60,200,120,0.3)' : 'rgba(40,140,90,0.2)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#3a4a48'; c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.5;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 20, 100); c.quadraticCurveTo(50 + s * 50, 70, 50 + s * 48, 100); c.fill(); c.stroke(); c.fillStyle = '#1a2220'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(50 + s * (30 + i * 6) - 3, 82); c.lineTo(50 + s * (30 + i * 6), 60 + i * 4); c.lineTo(50 + s * (30 + i * 6) + 3, 82); c.fill(); } c.fillStyle = '#3a4a48'; }
  c.beginPath(); c.moveTo(28, 90); c.lineTo(26, 36); c.lineTo(50, 28); c.lineTo(74, 36); c.lineTo(72, 90); c.lineTo(50, 96); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1a2220'; for (let i = 0; i < 7; i++) { const x = 28 + i * 7.3; c.beginPath(); c.moveTo(x - 3, 36); c.lineTo(x, 36 - (i === 3 ? 30 : 12 + (i % 2) * 8)); c.lineTo(x + 3, 36); c.fill(); }
  c.fillStyle = '#020303'; c.beginPath(); c.moveTo(32, 50); c.lineTo(68, 50); c.lineTo(64, 60); c.lineTo(36, 60); c.closePath(); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 9, 55, L ? 12 : 8, 'rgba(110,255,160,1)', 'rgba(0,0,0,0)'); c.restore();
  for (const s of [-1, 1]) { c.fillStyle = '#e0ffe8'; c.beginPath(); c.moveTo(50 + s * 3, 55); c.lineTo(50 + s * 15, 53); c.lineTo(50 + s * 13, 57); c.closePath(); c.fill(); }
  c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(38 + i * 6, 66); c.lineTo(38 + i * 6, 86); c.stroke(); }
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(110,255,160,0.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(50, 60); c.lineTo(50, 94); c.stroke(); c.restore();
}

// ---------------- kit ----------------
const mkIsolated = f => { const o = f.opp; if (!o) return false; return !Combat.projectiles.some(p => p.owner === o) && !Combat.hazards.some(h => h.owner === o && h.kind !== 'telegraph'); };
const MK_OBLIT = mk({ name: 'Obliterate', desc: 'Nightfall comes down in a line. The mace HEAD (far end) hits for +50%; isolated foes take +20%.', pose: 'slam', s: 16, a: 5, r: 20, ai: { min: 60, max: 240, use: 'combo' },
  hit: { dmg: 80, box: [10, -150, 200, 150], kb: [400, -300], hs: 22, sfx: 'h' },
  onHit: (a, t) => { const d = Math.abs(t.x - a.x); let bonus = 0; if (d > 150 * a.scale) { bonus += 40; Game.popWorld(t.x, t.y - t.h - 30, 'OBLITERATED', '#6aff9a', 20); } if (mkIsolated(a)) bonus += 16; if (bonus && t.hp > 1) t.hp = Math.max(1, t.hp - bonus); mkSfx('slam'); } });
const MK_GRASP = mk({ name: 'Death\'s Grasp', desc: 'A claw of darkness bursts out at range and drags the foe to him.', pose: 'cast', s: 14, a: 8, r: 20, ai: { min: 200, max: 480, use: 'zone' },
  hit: { dmg: 60, box: [200, -150, 190, 150], kb: [0, 0], hs: 20, sfx: 'm' },
  onHit: (a, t) => { t.x = clamp(a.x + a.facing * 90, 40, Arena.stage.width - 40); t.vx = 0; t.status.slow = Math.max(t.status.slow || 0, 1); Game.fx.burst(t.x, t.y - 70, 14, { color: ['#6aff9a', '#0a1210'], size: 8, speed: 300, life: 0.4 }); },
  ev: { 14: f => Combat.addHazard({ kind: 'mkClaw', owner: f, side: f.side, x: f.x + f.facing * 290 * f.scale, facing: f.facing, life: 18 }) } });
const MK_SHIELD = mk({ name: 'Indestructible', desc: 'Spends all of the INDESTRUCTIBLE gauge as a shield (3s).', pose: 'charge', s: 10, a: 1, r: 14, ai: { min: 0, max: 1500, use: 'buff' },
  ev: { 10: f => { const g = f.gauge || 0; if (g < 15) { Game.popWorld(f.x, f.y - f.h - 30, 'NOT ENOUGH IRON', '#aab', 16); return; } f.status.shield = Math.round(g * 3); f.status.shieldT = 3; f.gauge = 0; Game.popWorld(f.x, f.y - f.h - 30, 'INDESTRUCTIBLE', '#6aff9a', 20); mkSfx('clang'); } } });
const MK_NIGHT = Mv.rush({ name: 'Nightfall', desc: 'A heavy armored step and a sideways mace sweep.', s: 12, speed: 600, frames: 12, armor: [1, 20], hit: { dmg: 95, kb: [700, -200], wb: true } });
const MK_DROP = Mv.dive({ name: 'Iron Fall', desc: 'He drops like an anvil. Ground bounce.', vx: 200, vy: 1600, hit: { dmg: 110, gb: true } });
const MK_SUPER = superize(mk({ name: 'Grave Chains', desc: 'Chains burst up in a ring: everything inside is dragged to the centre and slowed, and Darkness Rise ignites at once.', pose: 'cast_up', s: 16, a: 16, r: 20,
  ev: { 16: f => { f.mkStorm = 5 * FPS; Combat.addHazard({ kind: 'mkChains', owner: f, side: f.side, x: f.x, r: 360, life: 40 }); mkSfx('clang'); mkSfx('slam'); Cam.shake = 10; f.say('Kneel.', 50); } } }), 100);
const MK_ULT = superize(mk({ name: 'REALM OF DEATH', desc: 'A slow tether of darkness creeps out. If it takes hold, the foe is dragged into the Death Realm, and he keeps a piece of them: +10% damage for the round. Blockable. Must connect.', pose: 'cast', s: 24, a: 10, r: 30,
  ev: { 2: f => { f.say('Your soul is mine.', 80); mkSfx('charge', 0.8); }, 24: f => Combat.fireShots(f, { speed: 420, r: 40, dmg: 10, kind: 'orb', color: '#2aff7a', prio: 3, ultConnect: true, hs: 60, kb: [0, 0], life: 4.5 }) } }), 300);
MK_ULT.id = 'mordekaiser_ult'; MK_ULT.recoverWhiff = 30;
MK_ULT.ult = { dmg: 1150, cutscene: (a, t) => csMordekaiserRealm(a, t), fx: { el: 'void', color: '#6aff9a' }, after: a => { a.mkStolen = true; Game.popWorld(a.x, a.y - a.h - 40, 'SOUL STOLEN +10%', '#6aff9a', 22); } };

const mordekaiser = fighter({
  id: 'mordekaiser', name: 'MORDEKAISER', title: 'The Iron Revenant', side: 'VILLAIN', role: 'Juggernaut · Iron shield · Soul thief', color: '#6aff9a', color2: '#0a1210',
  bio: 'Twice slain and thrice born, a warlord who conquered death itself and built a kingdom there. Every soul he takes becomes a subject in the Realm of Death. He is here to recruit.',
  quote: 'Your soul will serve me for eternity.',
  ending: 'Mordekaiser drags the whole of Metro City into the Death Realm for one night, then lets it go. "A census," he says. "I needed to see who was worth taking later."',
  hp: 1200, walk: 200, weight: 1.25, scale: 1.12, rival: 'sion', handArt: true, draw: drawMordekaiser, drawPortrait: drawMordekaiserPortrait, transformCutscene: f => csMordekaiserLord(f),
  tall: 1.15, wide: 1.4, weaponTip: 150,
  model: { skin: '#2a3a3a' }, face: { expr: 'angry' }, style: { reach: 1.25, power: 1.2, speed: 1.15, heavy: true, weapon: true },
  gauge: { name: 'INDESTRUCTIBLE', max: 100, color: '#6aff9a', label: f => (f.mkStorm > 0 ? '· DARKNESS RISE' : '') + (f.mkStolen ? ' · SOUL' : '') },
  passive: ['Darkness Rise', 'Land three hits within 4s and a black storm wakes around him, burning anyone close every half second while he keeps hitting.'],
  moves: { '5S': MK_OBLIT, '6S': MK_GRASP, '2S': MK_SHIELD, '4S': MK_NIGHT, 'jS': MK_DROP },
  super: MK_SUPER, ult: MK_ULT,
  form: { name: 'LORD OF THE DEATH REALM', desc: 'Permanent. Darkness Rise never sleeps, iron banks twice as fast, and his armor thickens.', cost: 200, armor: 0.85, dmg: 1.08, scale: 1.1 },
  assist: '6S',
  lines: {
    intro: ['Kneel, {opp}.', 'Another soul for the Realm.', 'I have died twice. You will not manage it once.'],
    win: ['Your soul is mine.', 'Serve me.', 'Death is only the beginning.'],
    taunt: ['Kneel.', 'Futile.'], form: ['BEHOLD MY DOMINION!'], ult: ['Your soul is mine.'], ultHit: ['Eternity awaits.'], tag: ['Step aside.'], enter: ['I have returned.'], assist: ['Grasp!'], moves: ['OBLITERATE!', 'Fall!', 'Iron.'],
  },
});
mordekaiser.ult = MK_ULT; mordekaiser.ultAct = 'shot'; MK_SUPER.id = 'mordekaiser_super';
mordekaiser.passiveDmg = f => (f.mkStolen ? 1.1 : 1);
mordekaiser.onRoundStart = f => { f.gauge = 0; f.mkStorm = 0; f.mkHits = []; f.mkStolen = false; };
mordekaiser.onHit = (a, t, dmg) => {
  a.gauge = Math.min(100, (a.gauge || 0) + dmg * (a.form ? 0.2 : 0.1));
  a.mkHits = (a.mkHits || []).filter(s => a.st - s < 4 * FPS); a.mkHits.push(a.st);
  if (a.mkHits.length >= 3 || a.mkStorm > 0) { if (!(a.mkStorm > 0)) Game.popWorld(a.x, a.y - a.h - 40, 'DARKNESS RISE', '#6aff9a', 20); a.mkStorm = 4 * FPS; }
};
mordekaiser.onHurt = (t, a, dmg) => { t.gauge = Math.min(100, (t.gauge || 0) + dmg * 0.04); };
mordekaiser.passiveTick = f => {
  if (f.form) f.mkStorm = Math.max(f.mkStorm || 0, 2);
  if (f.mkStorm > 0) {
    f.mkStorm--;
    if (f.st % 30 === 0) for (const o of Combat.targets(f.side)) if (Math.abs(o.x - f.x) < 150 * f.scale && o.state !== 'ko') { o.hp = Math.max(1, o.hp - (f.form ? 14 : 10)); o.red = Math.max(o.red, o.hp); Game.fx.add({ x: o.x, y: o.y - 60, vx: 0, vy: -80, life: 0.4, size: 8, color: '#6aff9a', glow: true }); }
  }
};
Combat.hz.mkClaw = h => h.t < h.life;
Combat.drawHz.mkClaw = (c, h) => {
  const k = h.t / h.life, up = Math.sin(k * Math.PI);
  c.save(); c.fillStyle = `rgba(10,18,16,${0.9 * up})`; c.strokeStyle = `rgba(110,255,160,${up})`; c.lineWidth = 2;
  for (let i = 0; i < 4; i++) { const x = h.x + (i - 1.5) * 26; c.beginPath(); c.moveTo(x - 8, 0); c.quadraticCurveTo(x - 10 - h.facing * 10, -80 * up, x + h.facing * 20, -130 * up); c.quadraticCurveTo(x, -70 * up, x + 8, 0); c.closePath(); c.fill(); c.stroke(); }
  c.restore();
};
Combat.hz.mkChains = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  if (h.t === 6) for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) {
    const r = Combat.resolveHit(o, f, H_({ dmg: 120, guard: 'mid', hs: 26, kb: [0, -300], status: { slow: 2.5 }, sfx: 'h' }), { proj: true, fromX: h.x, move: MK_SUPER });
    if (r === 'hit') o.x = clamp(h.x + f.facing * 90, 40, Arena.stage.width - 40);
  }
  return h.t < h.life;
};
Combat.drawHz.mkChains = (c, h) => {
  const k = h.t / h.life, up = Math.min(1, h.t / 6) * (1 - Math.max(0, k - 0.7) / 0.3);
  c.save(); c.strokeStyle = '#5a6a68'; c.lineWidth = 4; c.setLineDash([8, 5]);
  for (let i = 0; i < 10; i++) { const x = h.x + (i / 9 - 0.5) * h.r * 2; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x, -180 * up, h.x, -110 * up); c.stroke(); }
  c.setLineDash([]); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -40, h.r * 0.8, `rgba(90,255,150,${0.25 * up})`, 'rgba(0,0,0,0)'); c.restore();
};

// ---------------- cinematics ----------------
function csMordekaiserLord(f) {
  const d = f.def;
  return {
    name: 'LORD OF THE DEATH REALM', dur: 4.2, fx: new ParticleSystem(700),
    cues: [[0.1, () => mkSfx('bell')], [1.2, () => mkSfx('clang')], [2.4, () => { mkSfx('roar'); mkSfx('boom'); }]],
    draw(c, t) {
      c.fillStyle = '#020605'; c.fillRect(0, 0, W, H);
      // a black throne and a legion of green-eyed dead kneeling in rows
      for (let r = 0; r < 4; r++) for (let i = 0; i < 16; i++) { const x = 40 + i * (W - 80) / 15, y = H - 40 - r * 50, k = ease.out(seg(t, 0.2 + r * 0.2, 1.4 + r * 0.2)); c.fillStyle = '#0a1210'; c.beginPath(); c.ellipse(x, y, 14, 22 * k, 0, Math.PI, 0); c.fill(); if (k > 0.5) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, x + 4, y - 16 * k, 4, 'rgba(110,255,160,0.9)', 'rgba(0,0,0,0)'); c.restore(); } }
      c.fillStyle = '#141c1a'; c.fillRect(W / 2 - 110, H * 0.12, 220, H * 0.5); c.fillStyle = '#0a1210'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(W / 2 - 110 + i * 55, H * 0.12); c.lineTo(W / 2 - 82 + i * 55, H * 0.02); c.lineTo(W / 2 - 55 + i * 55, H * 0.12); c.fill(); }
      drawCharAt(c, d, W / 2, H * 0.62, 2.3, 1, { pose: t < 2.4 ? 'kneel' : 'victory', anim: t, transformed: t > 2.3 });
      caption(c, 'Death was only the beginning.', t, 0.2, 2.2, '#b0ffd0');
      flashAt(c, t, 2.4, 2.7, '#b0ffd0');
      titleSlam(c, 'LORD OF THE DEATH REALM', 'KNEEL', t, 2.5, '#6aff9a', 80);
    },
  };
}
function csMordekaiserRealm(a, opp) {
  const fx = new ParticleSystem(1600), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'REALM OF DEATH', dur: 6.8, fx,
    cues: [[0, () => mkSfx('charge', 0.8)], [1.4, () => mkSfx('boom')], [2.6, () => mkSfx('clang')], [3.6, () => mkSfx('slam')], [4.4, () => { mkSfx('boom'); mkSfx('slam'); }]],
    draw(c, t) {
      if (t < 1.4) {
        // the world peels away to green
        c.fillStyle = '#10141a'; c.fillRect(0, 0, W, H);
        const k = seg(t, 0.3, 1.4); c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2, H / 2, W * ease.in(k), 'rgba(40,200,110,0.8)', 'rgba(0,0,0,0)'); c.restore();
        caption(c, 'Your soul is mine.', t, 0.1, 1.3, '#b0ffd0'); return;
      }
      // the Death Realm: a black-green void with floating ruins
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#010403'); g.addColorStop(1, '#0a3a20'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) { c.fillStyle = '#0a1a14'; const x = (i * 211 + t * 20) % (W + 200) - 100, y = 120 + (i % 3) * 90 + Math.sin(t + i) * 10; c.fillRect(x, y, 60, 30 + (i % 2) * 20); }
      if (Math.random() < 0.8) fx.add({ x: rand(0, W), y: H + 10, vx: rand(-20, 20), vy: rand(-200, -80), life: 3, size: rand(2, 5), color: '#6aff9a', glow: true });
      fx.draw(c);
      c.fillStyle = '#081a10'; c.fillRect(0, H - 70, W, 70);
      if (t < 4.4) {
        const k = seg(t, 1.4, 4.4);
        // three blows, each landing on a beat
        const beat = t < 2.6 ? 0 : t < 3.6 ? 1 : 2;
        drawCharAt(c, a.def, lerp(W * 0.25, W * 0.42, k), H - 70, 2.6, 1, { pose: ['slam', 'heavy', 'cast'][beat], anim: t });
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.68, H - 70, oppScale, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), '#0a2a18');
        if ([1.4, 2.6, 3.6].some(b => t > b && t < b + 0.15)) { c.fillStyle = 'rgba(160,255,200,0.5)'; c.fillRect(0, 0, W, H); }
      } else {
        // a green wisp is ripped out of them and flows into his chest
        const k = seg(t, 4.4, 5.6);
        drawCharAt(c, a.def, W * 0.35, H - 70, 2.6, 1, { pose: 'victory', anim: t, transformed: true });
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.7, H - 70, oppScale, -1, { pose: 'kneel', anim: 0, transformed: opp.transformed }), '#0a2a18');
        c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, lerp(W * 0.7, W * 0.36, ease.inOut ? ease.inOut(k) : k), lerp(H * 0.55, H * 0.45, k) - Math.sin(k * Math.PI) * 80, 30, 'rgba(110,255,160,1)', 'rgba(0,0,0,0)'); c.restore();
        flashAt(c, t, 4.4, 4.7, '#b0ffd0');
        if (t > 5.2) titleSlam(c, 'REALM OF DEATH', 'SOUL STOLEN', t, 5.3, '#6aff9a', 90);
      }
    },
  };
}
rival('mordekaiser', 'sion', [[1, 'Sion. I raised you once, in another life.'], [0, 'Then you know I do not stay down. Or kneel.']],
  { mordekaiser: 'Kneel, soldier.', sion: 'Keep your realm, iron king.' });
rival('mordekaiser', 'aatrox', [[0, 'A Darkin. Your soul would make a fine general.'], [1, 'You collect the dead. I make them.']],
  { mordekaiser: 'Your prison is now mine.', aatrox: 'Death has no dominion over me.' });
