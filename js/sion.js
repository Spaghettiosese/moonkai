// ============================================================
//  MOONKAI — SION, the Undead Juggernaut (League of Legends tribute), fighter #67.
//
//  DECIMATING SMASH (hold I)  raise the axe and CHARGE: a ground marker grows in front of him.
//                    Release to smash. The longer the charge, the more damage; a full charge
//                    stuns and launches. Armored while charging.
//  GAUGE   · SOUL FURNACE  fills as he takes hits (and blocks). ↓I spends it on a shield; if the
//                    shield survives 2s, it detonates for whatever is left of it.
//  PASSIVE · GLORY IN DEATH  once per round, when he dies he RISES as a corpse for 8s: his health
//                    drains fast, but he steals half of all damage he deals. Deal enough and you
//                    decide the round from beyond the grave.
//  ROAR OF THE SLAYER (→I)  a shockwave that slows.
//  UNSTOPPABLE ONSLAUGHT    ultimate: a long roar, then an unstoppable charge across the whole
//                    stage. Blockable. Must connect.
// ============================================================
const snSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const SN_PAL = { build: 'giant', skin: '#8e9aa0', top: '#4a3226', topDark: '#2a1a12', pants: '#3a2a20', pantsDark: '#221610', boots: '#1a1410', belt: '#6a4a2a', glove: '#5a4a3a', noFace: true, bracers: '#6a5a4a', kneepads: '#6a5a4a' };
const SN_ZOMBIE_PAL = Object.assign({}, SN_PAL, { skin: '#6a8a6a' });

function drawSionAxe(c, x, y, ang, charge) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.strokeStyle = '#3a2a1a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-30, 0); c.lineTo(110, 0); c.stroke();
  c.fillStyle = '#6a6a70'; c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(80, -4); c.quadraticCurveTo(96, -40, 124, -46); c.quadraticCurveTo(116, -10, 128, 16); c.quadraticCurveTo(100, 18, 80, 6); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#a8a8b0'; c.lineWidth = 2; c.beginPath(); c.moveTo(124, -44); c.quadraticCurveTo(114, -12, 126, 14); c.stroke();
  c.fillStyle = '#8a3a1a'; for (let i = 0; i < 3; i++) circle(c, 96 + i * 8, -12 + i * 6, 2.5, 'rgba(140,40,20,0.7)');
  if (charge > 0) { c.globalCompositeOperation = 'lighter'; glowCircle(c, 110, -14, 30 + 40 * charge, `rgba(255,90,40,${0.3 + 0.5 * charge})`, 'rgba(0,0,0,0)'); }
  c.restore();
}
function drawSion(c, v) {
  const t = v.anim || 0, Z = !!v.zombie, J = !!v.transformed, m = v.move;
  if (Z) glowCircle(c, 0, -70, 130, 'rgba(90,255,120,0.18)', 'rgba(0,0,0,0)');
  drawHumanoid(c, v, Z ? SN_ZOMBIE_PAL : SN_PAL, {
    back(c, P) { // tattered cloak + chains
      c.fillStyle = '#2a1a14'; c.beginPath(); c.moveTo(P.sh[0] - 12, P.sh[1]); c.lineTo(P.sh[0] - 30, P.hip[1] + 30); for (let i = 0; i < 4; i++) c.lineTo(P.sh[0] - 26 + i * 7, P.hip[1] + 20 + (i % 2) * 12); c.lineTo(P.sh[0] + 4, P.sh[1] + 6); c.fill();
      if (J) { c.strokeStyle = '#6a6a70'; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(P.hip[0], P.hip[1]); c.quadraticCurveTo(P.hip[0] - 30, P.hip[1] + 30 + Math.sin(t * 4) * 6, P.hip[0] - 50, P.hip[1] + 10); c.stroke(); c.setLineDash([]); }
    },
    chest(c, P) { // rusted plate and the gaping wound
      const x = lerp(P.hip[0], P.sh[0], 0.6), y = lerp(P.hip[1], P.sh[1], 0.6);
      c.fillStyle = '#5a4a3a'; c.fillRect(x - 12, y - 14, 24, 16); c.strokeStyle = '#2a1a10'; c.strokeRect(x - 12, y - 14, 24, 16);
      c.fillStyle = Z ? '#3aaa4a' : '#5a1a14'; c.beginPath(); c.ellipse(x + 2, y + 8, 5, 3, 0, 0, Math.PI * 2); c.fill();
    },
    head(c, P) {
      const [hx, hy] = P.head;
      // spiked iron helm + jaw brace on a dead face
      c.fillStyle = '#4a4a50'; c.strokeStyle = '#141414'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(hx - 13, hy + 2); c.lineTo(hx - 12, hy - 12); c.lineTo(hx + 8, hy - 15); c.lineTo(hx + 13, hy - 4); c.lineTo(hx + 3, hy - 4); c.lineTo(hx - 2, hy + 2); c.closePath(); c.fill(); c.stroke();
      for (const [x, h] of [[-8, 14], [0, 18], [7, 12]]) { c.fillStyle = '#2a2a30'; c.beginPath(); c.moveTo(hx + x - 3, hy - 13); c.lineTo(hx + x - 1, hy - 13 - h); c.lineTo(hx + x + 3, hy - 14); c.fill(); }
      c.fillStyle = '#6a6a70'; c.fillRect(hx + 2, hy + 3, 12, 6); c.strokeRect(hx + 2, hy + 3, 12, 6);
      c.strokeStyle = '#2a2a2a'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(hx + 4 + i * 4, hy + 3); c.lineTo(hx + 4 + i * 4, hy + 9); c.stroke(); }
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 8, hy - 2, J || Z ? 10 : 7, Z ? 'rgba(90,255,120,1)' : 'rgba(255,60,30,1)', 'rgba(0,0,0,0)'); c.restore();
      circle(c, hx + 8, hy - 2, 2, Z ? '#caffd0' : '#ffd0a0');
    },
    front(c, P) {
      let ang = -1.9; const charging = m && m.sionCharge && v.mf < m.s;
      if (charging) ang = lerp(-1.9, -2.9, Math.min(1, (v.smashCharge || 0)));
      else if (m && m.sionCharge) ang = 0.9;
      else ang = { heavy: 0.4, slam: 0.9, punch: -0.2, punch2: 0, kick: -1.6, uppercut: -1.2, dash: 0.1, air_heavy: 0.7, air_spike: 1.3, hurt: 2.2, hurt_air: 2.3, victory: -1.57, intro: 1.3, kneel: 1.3, cast: -0.6 }[v.pose] ?? -1.9;
      drawSionAxe(c, P.fH[0], P.fH[1], ang, charging ? v.smashCharge || 0 : 0);
    },
  });
}
function drawSionPortrait(c, opts) {
  const J = !!opts.form;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, '#2a1410'); g.addColorStop(1, '#080404'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.fillStyle = '#3a2a20'; c.beginPath(); c.moveTo(4, 100); c.lineTo(16, 70); c.lineTo(84, 70); c.lineTo(96, 100); c.fill();
  c.fillStyle = '#5a4a3a'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 20, 76); c.lineTo(50 + s * 46, 70); c.lineTo(50 + s * 44, 90); c.fill(); }
  c.fillStyle = '#8e9aa0'; c.strokeStyle = '#2a2a2a'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(30, 38); c.lineTo(70, 38); c.lineTo(72, 58); c.lineTo(64, 72); c.lineTo(36, 72); c.lineTo(28, 58); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#4a4a50'; c.beginPath(); c.moveTo(26, 46); c.lineTo(28, 22); c.lineTo(50, 14); c.lineTo(72, 22); c.lineTo(74, 46); c.lineTo(60, 44); c.lineTo(50, 50); c.lineTo(40, 44); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#2a2a30'; for (const [x, h] of [[32, 18], [42, 24], [58, 24], [68, 18]]) { c.beginPath(); c.moveTo(x - 4, 22); c.lineTo(x, 22 - h); c.lineTo(x + 4, 22); c.fill(); }
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 40, 50, J ? 14 : 10, 'rgba(255,60,30,1)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#ffd0a0'; c.beginPath(); c.moveTo(34, 50); c.lineTo(46, 48); c.lineTo(44, 52); c.fill();
  c.fillStyle = '#1a1a1a'; c.beginPath(); c.moveTo(54, 48); c.lineTo(66, 50); c.lineTo(64, 53); c.lineTo(55, 52); c.fill();          // dead eye
  c.fillStyle = '#6a6a70'; c.fillRect(34, 60, 32, 12); c.strokeRect(34, 60, 32, 12);
  c.strokeStyle = '#1a1a1a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(38 + i * 6, 60); c.lineTo(38 + i * 6, 72); c.stroke(); }
  drawSionAxe(c, 90, 96, -2.1, J ? 0.5 : 0);
}

// ---------------- kit ----------------
const SN_SMASH = mk({ name: 'Decimating Smash', desc: 'HOLD I to raise the axe and charge (armored). Release to smash: more charge, more damage. Full charge stuns and launches.', pose: 'charge', s: 72, a: 6, r: 26, sionCharge: true, armor: [1, 72],
  hit: { dmg: 60, box: [20, -170, 150, 170], kb: [360, -200], hs: 22, sfx: 'h' }, ai: { min: 0, max: 170, use: 'combo' },
  onStart: f => { f.smashCharge = 0; f.smashHeld = true; },
  onHit: (a, t) => { const ch = a.smashCharge || 0, extra = Math.round(110 * ch); if (extra > 0 && t.hp > 1) t.hp = Math.max(1, t.hp - extra); if (ch >= 0.95) { t.status.stun = Math.max(t.status.stun || 0, 0.7); t.vy = -900; t.y = -1; t.launched = true; Game.popWorld(t.x, t.y - t.h - 40, 'DECIMATED', '#ff6a3a', 26); } Cam.shake = 8 + 12 * ch; } });
const SN_ROAR = Mv.shot({ name: 'Roar of the Slayer', desc: 'A shockwave that slows everything it passes through.', s: 16, pose: 'taunt', proj: { speed: 700, r: 24, dmg: 60, pierce: true, kind: 'crescent', color: '#c8b8a8', status: { slow: 2 }, hs: 22, kb: [200, -80], life: 1.4 } });
const SN_FURNACE = mk({ name: 'Soul Furnace', desc: 'Spends the SOUL FURNACE gauge on a shield. If it survives 2s, it detonates for what is left of it.', pose: 'charge', s: 8, a: 1, r: 12, ai: { min: 0, max: 300, use: 'buff' },
  ev: { 8: f => { const g = f.gauge || 0; if (g < 30) { Game.popWorld(f.x, f.y - f.h - 30, 'FURNACE IS COLD', '#aab', 16); return; }
    const sh = Math.round(80 + g * 2.4); f.gauge = 0; f.status.shield = sh; f.status.shieldT = 2.2;
    Combat.addHazard({ kind: 'sionFurnace', owner: f, side: f.side, x: f.x, life: 120, max: sh }); snSfx('charge', 0.6); } } });
const SN_ONSLAUGHT = mk({ name: 'Rampage', desc: 'A short armored charge that knocks the foe into the air.', pose: 'dash', s: 10, a: 20, r: 22, armor: [1, 30], vel: [[10, 30, 950, null]],
  hit: { dmg: 90, box: [-10, -150, 110, 150], kb: [300, -780], launch: true, hs: 26, sfx: 'h' }, ai: { min: 80, max: 420, use: 'approach' } });
const SN_DIVE = Mv.dive({ name: 'Axe Drop', desc: 'The whole juggernaut comes down; ground bounce.', pose: 'air_spike', vx: 300, vy: 1400, hit: { dmg: 100, box: [-10, -90, 130, 100], gb: true, kb: [200, 900], guard: 'high' } });
const SN_SUPER = superize(mk({ name: 'Killer\'s Wall', desc: 'Slams the axe: a towering shockwave wall rolls forward.', pose: 'slam', s: 18, a: 1, r: 26,
  ev: { 18: f => { Combat.fireShots(f, { speed: 600, r: 60, dmg: 45, hits: 3, pierce: true, kind: 'crescent', color: '#d8c8b0', hs: 22, kb: [300, -500], launch: true, life: 1.6, prio: 3 }); Cam.shake = 14; snSfx('slam'); } } }), 100);
const SN_ULT = superize(mk({ name: 'UNSTOPPABLE ONSLAUGHT', desc: 'A long roar, then an unstoppable charge across the entire stage. Blockable. Must connect.', pose: f => (f.mf < 40 ? 'taunt' : 'dash'), s: 40, a: 70, r: 30, onslaught: true,
  hit: { dmg: 10, box: [-10, -170, 130, 170], hs: 60, kb: [0, 0], ultConnect: true },
  ev: { 2: f => { f.say('NO RETREAT!', 70); snSfx('roar'); Cam.shake = 10; } } }), 300);
SN_ULT.id = 'sion_ult'; SN_ULT.ult = { dmg: 1200, cutscene: (a, t) => csSionOnslaught(a, t), fx: { el: 'fire', color: '#ff6a3a' } };

const sion = fighter({
  id: 'sion', name: 'SION', title: 'The Undead Juggernaut', side: 'VILLAIN', role: 'Juggernaut · Charge · Undying', color: '#ff6a3a', color2: '#2a1a14',
  bio: 'A war hero who died strangling a king with his bare hands, dragged back from the grave to fight forever. He does not remember why. He only remembers how.',
  quote: 'No retreat. No surrender. No rest.',
  ending: 'Sion walks out of Metro City into the sea. Months later, a fishing boat reports something enormous marching along the ocean floor.',
  hp: 1250, walk: 205, weight: 1.3, jumps: 1, scale: 1.12, rival: 'aatrox', handArt: true, draw: drawSion, drawPortrait: drawSionPortrait, transformCutscene: f => csSionJuggernaut(f),
  tall: 1.18, wide: 1.45, weaponTip: 150,
  model: { skin: '#8e9aa0' }, face: { expr: 'angry' }, style: { reach: 1.3, power: 1.2, speed: 1.2, heavy: true, weapon: true },
  gauge: { name: 'SOUL FURNACE', max: 100, color: '#ff8a4a', label: f => (f.zombie ? '· GLORY IN DEATH' : '') },
  passive: ['Glory in Death', 'Once per round, when he dies he rises as a corpse for 8s: health drains fast, but he steals half of all damage he deals.'],
  moves: { '5S': SN_SMASH, '6S': SN_ROAR, '2S': SN_FURNACE, '4S': SN_ONSLAUGHT, 'jS': SN_DIVE },
  super: SN_SUPER, ult: SN_ULT,
  form: { name: 'UNDYING JUGGERNAUT', desc: 'Permanent. Chains of the grave: armor, faster Smash charge, and the Furnace fills twice as fast.', cost: 200, armor: 0.85, dmg: 1.06, scale: 1.12 },
  assist: '6S',
  lines: {
    intro: ['Fight me, {opp}.', 'Another war. Good.', 'I have died before. It did not take.'],
    win: ['Weak.', 'Your war is over.', 'I do not rest. You will.'],
    taunt: ['COME!', 'Hrrraaagh!'], form: ['THE GRAVE CANNOT HOLD ME!'], ult: ['NO RETREAT!'], ultHit: ['Crushed.'], tag: ['Move.'], enter: ['WAR!'], assist: ['Roar!'], moves: ['DIE!', 'HRAAH!', 'Crush!'],
  },
});
sion.ult = SN_ULT; sion.ultAct = 'strike'; SN_SUPER.id = 'sion_super';
sion.onRoundStart = f => { f.gauge = 0; f.zombie = false; f.gloryUsed = false; };
sion.onHurt = (t, a, dmg) => { if (!t.zombie) t.gauge = Math.min(100, (t.gauge || 0) + dmg * (t.form ? 0.3 : 0.15)); };
sion.onHit = (a, t, dmg) => { if (a.zombie && dmg > 0) a.hp = Math.min(a.maxHp, a.hp + dmg * 0.5); };
sion.onDeath = (t) => {
  if (t.gloryUsed) return false;
  t.gloryUsed = true; t.zombie = true; t.hp = Math.round(t.maxHp * 0.45); t.red = t.hp; t.state = 'stand'; t.move = null; t.y = 0; t.invul = 50; t.vx = 0;
  Game.popWorld(t.x, t.y - t.h - 40, 'GLORY IN DEATH', '#8aff9a', 28); Game.announce('HE REFUSES TO STAY DEAD', '#8aff9a', 80); snSfx('roar'); Cam.shake = 14;
  return true;
};
sion.passiveTick = f => {
  if (f.zombie && f.state !== 'ko') { f.hp -= f.maxHp * 0.056 / FPS; if (f.hp <= 0) { f.hp = 0; f.zombie = false; Game.battle && Game.battle.onKO(f, f.opp, null); } }
  const B = Game.battle;
  // blocking also stokes the furnace
  if (f.state === 'block' && f.blockstun === 1) f.gauge = Math.min(100, (f.gauge || 0) + 4);
  if (B && f.opp && f.opp.state !== 'ko') {
    // CPU: release the smash when it's worth it
    if (f.ctrl === 'cpu' && f.move === SN_SMASH && f.mf > 20 && Math.random() < 0.05 + 0.02 * (f.level || 2)) f.smashHeld = false;
  }
};
sion.moveHook = (f, m, ctl) => {
  if (m.sionCharge && f.mf < m.s) {
    const held = f.ctrl === 'cpu' ? f.smashHeld : !!(ctl && ctl.hold && ctl.hold.S);
    f.smashCharge = Math.min(1, f.mf / (f.form ? 44 : 60));
    if (!held && f.mf > 8) { f.mf = m.s - 1; }
  }
  if (m.onslaught && f.mf >= m.s) { f.vx = f.facing * 1150; f.invul = Math.max(f.invul, 1); if (f.x <= 60 || f.x >= Arena.stage.width - 60) { f.mf = m.s + m.a; } Game.fx.add({ x: f.x - f.facing * 40, y: -10, vx: -f.facing * 200, vy: -80, life: 0.5, size: rand(8, 16), color: '#6a5a4a' }); if (f.mf % 6 === 0) Arena.hit(f.x - 60, f.x + 60, -40, 60, Game.fx); }
};
sion.drawWorldBack = (c, f) => {
  const m = f.move; if (!m || !m.sionCharge || f.mf >= m.s) return;
  const ch = f.smashCharge || 0, x0 = f.x + f.facing * 30, len = 150 * f.scale * (f.def.tall || 1);
  c.save(); c.fillStyle = `rgba(255,${120 - 80 * ch},40,${0.25 + 0.35 * ch})`; c.fillRect(f.facing > 0 ? x0 : x0 - len, -10, len * (0.3 + 0.7 * ch), 12);
  c.strokeStyle = `rgba(255,120,60,${0.5 + 0.5 * ch})`; c.lineWidth = 2; c.strokeRect(f.facing > 0 ? x0 : x0 - len, -12, len, 16); c.restore();
};
Combat.hz.sionFurnace = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  const left = f.status.shield || 0;
  if (left <= 0) { Game.popWorld(f.x, f.y - f.h - 30, 'FURNACE BROKEN', '#aab', 16); return false; }
  if (h.t >= h.life) {
    Combat.strikeZone(f, { x: f.x - 170, y: f.y - 200, w: 340, h: 206 }, { dmg: 40 + left * 0.8, guard: 'mid', hs: 26, kb: [600, -600], launch: true, sfx: 'h' }, { noConnect: true });
    f.status.shield = 0; Game.popWorld(f.x, f.y - f.h - 30, 'SOUL FURNACE!', '#ff8a4a', 24); Cam.shake = 14; snSfx('boom'); return false;
  }
  return true;
};
Combat.drawHz.sionFurnace = function (c, h, t) { const f = h.owner; const k = (f.status.shield || 0) / h.max; c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,140,70,${0.4 + 0.5 * k})`; c.lineWidth = 3 + 4 * k; c.beginPath(); c.ellipse(f.x, f.y - 90, 80, 110, 0, 0, Math.PI * 2); c.stroke(); glowCircle(c, f.x, f.y - 90, 110, `rgba(255,120,40,${0.15 * k})`, 'rgba(0,0,0,0)'); c.restore(); };
const _drawSion = drawSion;

// ---------------- cinematics ----------------
function csSionJuggernaut(f) {
  const d = f.def;
  return {
    name: 'UNDYING JUGGERNAUT', dur: 4.2, fx: new ParticleSystem(600),
    cues: [[0, () => snSfx('heartbeat')], [1.4, () => snSfx('clang')], [2.4, () => { snSfx('roar'); snSfx('boom'); }]],
    draw(c, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0606'); g.addColorStop(1, '#3a1a10'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = '#1a0e08'; c.fillRect(0, H - 80, W, 80);
      for (let i = 0; i < 8; i++) { c.fillStyle = '#2a1a10'; c.fillRect(80 + i * 150, H - 130 - (i % 3) * 20, 40, 60); }
      const rise = ease.out(seg(t, 0, 1.4));
      drawCharAt(c, d, W / 2, H - 60 + (1 - rise) * 200, 2.6, 1, { pose: t < 2.4 ? 'kneel' : 'victory', anim: t, transformed: t > 2.2 });
      caption(c, 'The grave could not hold me.', t, 0.1, 1.3, '#ffb09a');
      if (t > 1.4 && t < 2.4) { c.strokeStyle = '#6a6a70'; c.lineWidth = 4; c.setLineDash([8, 6]); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(i * W / 3, 0); c.lineTo(W / 2, H / 2); c.stroke(); } c.setLineDash([]); }
      flashAt(c, t, 2.4, 2.7, '#ffb09a');
      titleSlam(c, 'UNDYING JUGGERNAUT', 'NO REST', t, 2.5, '#ff6a3a', 90);
    },
  };
}
function csSionOnslaught(a, opp) {
  const city = makeCineCity(20, 160, 380), baseY = H - 30, fx = new ParticleSystem(2200), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'UNSTOPPABLE ONSLAUGHT', dur: 6.8, fx,
    cues: [[0, () => snSfx('roar')], [1.2, () => snSfx('slam')], [3.6, () => { snSfx('boom'); snSfx('boom', 0.2); }], [4.4, () => snSfx('slam')]],
    draw(c, t) {
      City.drawSky(c, t, { top: '#1a0a06', mid: '#4a1a0a', bot: '#a04010', fullMoon: false, noMoon: true });
      if (t < 1.2) { drawCineCity(c, city, baseY, '#140a06'); drawCharAt(c, a.def, W * 0.2, baseY, 2.5, 1, { pose: 'taunt', anim: t }); caption(c, 'NO RETREAT!', t, 0.1, 1.1, '#ffb09a'); return; }
      if (t < 3.6) {
        const k = seg(t, 1.2, 3.6), x = lerp(W * 0.1, W * 0.62, ease.in(k));
        for (const b of city) if (b.x < x + 60) b.dead = true;
        drawCineCity(c, city, baseY, '#140a06');
        if (Math.random() < 0.9) for (let i = 0; i < 4; i++) fx.add({ x, y: baseY - rand(0, 200), vx: rand(-600, -100), vy: rand(-400, 100), life: 0.8, size: rand(8, 18), color: pick(['#6a5a4a', '#8a7a6a', '#ff6a3a']), shape: 'rect', rot: rand(0, 6), vr: rand(-8, 8), g: 800 });
        fx.draw(c);
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.72, baseY, oppScale, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#140806');
        drawCharAt(c, a.def, x, baseY, 2.6, 1, { pose: 'dash', anim: t * 2 });
        speedLines(c, t, x, baseY - 150, 'rgba(255,160,100,0.4)');
      } else {
        for (const b of city) b.dead = true;
        drawCineCity(c, city, baseY, '#140a06', false); fx.draw(c);
        const k = seg(t, 3.6, 4.6);
        c.fillStyle = '#2a1a10'; c.fillRect(W - 120, 0, 120, H);
        c.strokeStyle = '#000'; c.lineWidth = 3; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(W - 120, H / 2); c.lineTo(W - 120 + Math.cos(i) * 100, H / 2 + Math.sin(i * 2) * 200 * k); c.stroke(); }
        silhouette(c, o => drawCharAt(o, opp.def, W - 150, baseY - 40, oppScale, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }), '#0a0404');
        drawCharAt(c, a.def, W - 330, baseY, 2.6, 1, { pose: t < 4.4 ? 'dash' : 'victory', anim: t });
        flashAt(c, t, 3.6, 3.9, '#ffd0b0');
        if (t > 4.6) titleSlam(c, 'UNSTOPPABLE ONSLAUGHT', 'NO RETREAT. NO SURRENDER.', t, 4.7, '#ff6a3a', 84);
      }
    },
  };
}
rival('sion', 'aatrox', [[1, 'Sion. They dragged you back too.'], [0, 'Aatrox. I will break your sword over your skull.']],
  { sion: 'Stay down, Darkin.', aatrox: 'Rest, old soldier. The war is mine.' });
rival('sion', 'kael', [[1, 'You were brought back. Like me.'], [0, 'Then fight like the dead, boy.']],
  { sion: 'Death is a door. I walk through it.', kael: "I'm not going back." });
