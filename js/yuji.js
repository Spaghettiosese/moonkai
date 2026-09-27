// ============================================================
//  MOONKAI — YUJI ITADORI (Jujutsu Kaisen tribute), fighter #65.
//
//  DIVERGENT FIST    the punch lands, then his cursed energy lands again a beat later. A ring
//                    closes on the foe: press I (or any attack) as it closes = BLACK FLASH
//                    (2.5x damage, black-red sparks).
//  IN THE ZONE       every Black Flash adds a stack (max 3): +6% damage each and a wider timing
//                    window. Stacks fade if he goes 8s without another Black Flash.
//  BOOGIE WOOGIE     Todo claps: Yuji and the foe swap places. Mixups, escapes, side switches.
//  SUKUNA            timed takeover (10s): Dismantle, Cleave (scales with the foe's max HP),
//                    "Open" fire arrow, and DOMAIN EXPANSION: MALEVOLENT SHRINE as his ultimate.
//                    When Yuji regains control he is shaken (slowed) for a moment.
// ============================================================
const yjSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };

// ---------------- art ----------------
const YUJI_PAL = { build: 'athletic', skin: '#f0c8a0', top: '#1c2640', topDark: '#10182a', pants: '#1c2640', pantsDark: '#10182a', boots: '#1a1a1a', belt: '#10182a', glove: '#f0c8a0', noFace: true };
const SUKUNA_PAL = Object.assign({}, YUJI_PAL, { skin: '#ecc0a0', top: '#e8e4dc', topDark: '#b8b0a4', pants: '#2a2a2a', pantsDark: '#141414', belt: '#8a1a1a' });

function sukunaMarks(c, P, hx, hy) {
  c.strokeStyle = '#2a0a0a'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(hx + 2, hy - 11); c.lineTo(hx + 10, hy - 9); c.moveTo(hx + 4, hy + 4); c.lineTo(hx + 12, hy + 3); c.stroke();
  for (const [a, b] of [[P.fE, P.fH], [P.bE, P.bH]]) { for (const k of [0.3, 0.6]) { const x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k); c.beginPath(); c.moveTo(x - 4, y - 3); c.lineTo(x + 4, y + 3); c.stroke(); } }
}
function drawYuji(c, v) {
  const t = v.anim || 0, S = !!v.transformed, zone = v.gauge || 0;
  if (S) glowCircle(c, 0, -60, 120, 'rgba(160,10,20,0.3)', 'rgba(40,0,0,0)');
  else if (zone > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -60, 60 + zone * 18, `rgba(200,30,40,${0.1 + zone * 0.07})`, 'rgba(0,0,0,0)'); c.restore(); }
  drawHumanoid(c, v, S ? SUKUNA_PAL : YUJI_PAL, {
    back(c, P) {
      if (S) return;
      // red hood of the Jujutsu High uniform
      c.fillStyle = '#c0282e'; c.strokeStyle = '#5a0a0e'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(P.sh[0] - 10, P.sh[1] - 2); c.quadraticCurveTo(P.sh[0] - 20, P.sh[1] + 6, P.sh[0] - 14, P.sh[1] + 16); c.lineTo(P.sh[0] + 4, P.sh[1] + 4); c.closePath(); c.fill(); c.stroke();
    },
    chest(c, P) { if (S) return; const x = lerp(P.hip[0], P.sh[0], 0.85), y = lerp(P.hip[1], P.sh[1], 0.85); for (let i = 0; i < 2; i++) circle(c, x + 4, y + i * 8, 1.6, '#c8b060'); },
    head(c, P) {
      const [hx, hy] = P.head;
      // hair: pink spikes over a dark undercut (Sukuna pushes it back)
      c.fillStyle = '#2a1a1a'; c.beginPath(); c.moveTo(hx - 11, hy + 2); c.lineTo(hx - 11, hy - 6); c.lineTo(hx - 3, hy - 8); c.closePath(); c.fill();
      c.fillStyle = '#f07a9a'; c.strokeStyle = '#a03a5a'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(hx - 10, hy - 6);
      const spikes = S ? [[-12, -18], [-4, -14], [-2, -24], [6, -14], [10, -20], [12, -8]] : [[-10, -18], [-4, -12], [0, -22], [5, -12], [12, -16], [11, -6], [14, -4]];
      for (const [sx, sy] of spikes) c.lineTo(hx + sx, hy + sy);
      c.lineTo(hx + 10, hy - 6); c.closePath(); c.fill(); c.stroke();
      // eye(s), brow, mouth
      c.strokeStyle = '#1a1010'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx + 3, hy - 5); c.lineTo(hx + 10, hy - 4); c.stroke();
      if (S) {
        c.fillStyle = '#c01020'; c.beginPath(); c.moveTo(hx + 4, hy - 2); c.lineTo(hx + 10, hy - 2.5); c.lineTo(hx + 7, hy); c.fill();
        c.fillStyle = '#c01020'; c.beginPath(); c.moveTo(hx + 5, hy + 1.5); c.lineTo(hx + 9.5, hy + 1); c.lineTo(hx + 7, hy + 2.8); c.fill();   // the second pair of eyes
        c.strokeStyle = '#3a0a0a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx + 4, hy + 6); c.quadraticCurveTo(hx + 8, hy + 9, hx + 12, hy + 5); c.stroke();
        sukunaMarks(c, P, hx, hy);
      } else {
        c.fillStyle = '#4a2a1a'; c.beginPath(); c.moveTo(hx + 4, hy - 2); c.quadraticCurveTo(hx + 7, hy - 3.5, hx + 10, hy - 2); c.quadraticCurveTo(hx + 7, hy - 0.5, hx + 4, hy - 2); c.fill();
        c.strokeStyle = '#8a4a3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + 5, hy + 2); c.lineTo(hx + 9, hy + 1.5); c.stroke();                // scar under the eye
        c.strokeStyle = '#6a2a1a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(hx + 6, hy + 6.5); c.lineTo(hx + 10, hy + 6); c.stroke();
      }
    },
    front(c, P) {
      if (!S && v.move && v.move.divergent && v.mf >= v.move.s) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, P.fH[0], P.fH[1], 16, 'rgba(90,160,255,0.8)', 'rgba(0,0,0,0)'); c.restore(); }
    },
  });
}

function drawYujiPortrait(c, opts) {
  const S = !!opts.form;
  const g = c.createLinearGradient(0, 0, 100, 100); g.addColorStop(0, S ? '#1a0006' : '#0a0a14'); g.addColorStop(1, S ? '#5a0a14' : '#1a2440'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = S ? 'rgba(255,30,40,0.7)' : 'rgba(200,20,30,0.55)'; c.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) { c.beginPath(); let x = 8 + i * 20, y = 0; c.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (j % 2 ? 6 : -6); y += 12; c.lineTo(x, y); } c.stroke(); } c.restore();
  c.fillStyle = S ? '#e8e4dc' : '#1c2640'; c.beginPath(); c.moveTo(14, 100); c.lineTo(26, 80); c.lineTo(74, 80); c.lineTo(86, 100); c.fill();
  if (!S) { c.fillStyle = '#c0282e'; c.beginPath(); c.moveTo(26, 82); c.quadraticCurveTo(50, 70, 74, 82); c.lineTo(70, 88); c.quadraticCurveTo(50, 78, 30, 88); c.fill(); }
  c.fillStyle = '#f0c8a0'; c.strokeStyle = '#6a4030'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(34, 40); c.lineTo(66, 40); c.lineTo(66, 56); c.lineTo(58, 70); c.lineTo(50, 74); c.lineTo(42, 70); c.lineTo(34, 56); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#2a1a1a'; c.fillRect(32, 40, 4, 14); c.fillRect(64, 40, 4, 14);
  c.fillStyle = '#f07a9a'; c.strokeStyle = '#a03a5a';
  c.beginPath(); c.moveTo(32, 44);
  for (const [x, y] of S ? [[28, 26], [38, 30], [36, 12], [48, 24], [52, 8], [60, 24], [70, 12], [68, 30], [74, 28], [68, 44], [58, 34], [48, 36], [40, 34]] : [[26, 30], [36, 30], [34, 14], [46, 26], [50, 8], [58, 26], [70, 14], [66, 30], [78, 30], [68, 44], [62, 38], [54, 44], [48, 38], [40, 44]]) c.lineTo(x, y);
  c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#1a1010'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(37, 47); c.lineTo(46, 49); c.moveTo(63, 47); c.lineTo(54, 49); c.stroke();
  for (const s of [-1, 1]) {
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 4, 53); c.quadraticCurveTo(50 + s * 9, 50.5, 50 + s * 14, 52.5); c.quadraticCurveTo(50 + s * 9, 55.5, 50 + s * 4, 53); c.fill();
    circle(c, 50 + s * 9, 53, 2.2, S ? '#c01020' : '#6a3a1a'); circle(c, 50 + s * 9, 53, 0.9, '#000');
    if (S) { c.fillStyle = '#c01020'; c.beginPath(); c.moveTo(50 + s * 5, 58); c.lineTo(50 + s * 13, 57); c.lineTo(50 + s * 9, 60); c.fill(); c.strokeStyle = '#2a0a0a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(50 + s * 5, 44); c.lineTo(50 + s * 14, 42); c.moveTo(50 + s * 10, 64); c.lineTo(50 + s * 15, 66); c.stroke(); }
  }
  if (S) { c.strokeStyle = '#3a0a0a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(41, 66); c.quadraticCurveTo(50, 71, 60, 64); c.stroke(); c.fillStyle = '#fff'; for (const x of [45, 49, 53, 57]) c.fillRect(x, 66, 2, 2.2); }
  else { c.strokeStyle = '#8a4a3a'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(55, 58); c.lineTo(62, 57); c.stroke(); c.strokeStyle = '#6a2a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(45, 66); c.lineTo(55, 66); c.stroke(); }
}

// ---------------- Black Flash ----------------
const yjWindow = f => 3 + (f.gauge || 0) * 2;
function yjSchedule(f, t) {
  Combat.hazards = Combat.hazards.filter(h => !(h.kind === 'yujiImpact' && h.owner === f));
  Combat.addHazard({ kind: 'yujiImpact', owner: f, side: f.side, victim: t, x: t.x, life: 14, win: yjWindow(f) });
}
function yjBlackFlash(f, t, base) {
  const r = Combat.resolveHit(t, f, H_({ dmg: base * 2.5, guard: 'unblock', hs: 34, kb: [520, -620], launch: true, sfx: 'h', noScale: false }), { proj: true, fromX: f.x });
  if (r !== 'hit') return;
  f.gauge = Math.min(3, (f.gauge || 0) + 1); f.zoneT = 0;
  Game.popWorld(t.x, t.y - t.h - 50, 'BLACK FLASH', '#ff2a3a', 30);
  Combat.addHazard({ kind: 'yujiSpark', owner: f, side: f.side, x: t.x, y: t.y - t.h / 2, life: 18 });
  if (Game.battle) Game.battle.hitstop = Math.max(Game.battle.hitstop, 18);
  Cam.shake = 16; yjSfx('boom'); yjSfx('zap');
  if (Math.random() < 0.4) f.say(pick(['Black Flash!', 'Again!', "I'm in the zone!"]), 60);
}
Combat.hz.yujiImpact = function (h) {
  const f = h.owner, t = h.victim;
  if (!t || t.state === 'ko' || f.state === 'ko') return false;
  h.x = t.x;
  if (h.t >= h.life) {
    const B = Game.battle, pressed = f.lastAtkPress !== undefined && B && B.frame - f.lastAtkPress <= h.win;
    const cpuHit = f.ctrl === 'cpu' && Math.random() < 0.12 * (f.level || 2);
    if (pressed || cpuHit) yjBlackFlash(f, t, 55);
    else Combat.resolveHit(t, f, H_({ dmg: 32, guard: 'mid', hs: 20, kb: [260, -100], sfx: 'm' }), { proj: true, fromX: f.x });
    Game.fx.burst(t.x, t.y - t.h / 2, 12, { color: ['#5aa0ff', '#fff'], size: 7, speed: 300, glow: true, life: 0.3 });
    return false;
  }
  return true;
};
Combat.drawHz.yujiImpact = function (c, h) {
  const t = h.victim; if (!t) return;
  const k = h.t / h.life, inWin = h.life - h.t <= h.win;
  c.save(); c.strokeStyle = inWin ? '#ff2a3a' : 'rgba(120,180,255,0.9)'; c.lineWidth = inWin ? 4 : 2.5;
  c.beginPath(); c.arc(t.x, t.y - t.h / 2, 16 + 70 * (1 - k), 0, Math.PI * 2); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; c.beginPath(); c.arc(t.x, t.y - t.h / 2, 16, 0, Math.PI * 2); c.stroke();
  c.restore();
};
Combat.hz.yujiSpark = function (h) { return h.t < h.life; };
Combat.drawHz.yujiSpark = function (c, h) {
  const a = 1 - h.t / h.life;
  c.save();
  c.fillStyle = `rgba(0,0,0,${0.55 * a})`; c.beginPath(); c.arc(h.x, h.y, 90 * (1 - a * 0.3), 0, Math.PI * 2); c.fill();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) { const ang = i * 0.7 + h.t * 0.3, L = 70 + (i % 3) * 40; c.strokeStyle = i % 2 ? `rgba(255,30,40,${a})` : `rgba(20,0,0,${a})`; c.lineWidth = 3; c.beginPath(); let x = h.x, y = h.y; c.moveTo(x, y); for (let j = 1; j <= 4; j++) { x = h.x + Math.cos(ang) * L * j / 4 + (j % 2 ? 8 : -8); y = h.y + Math.sin(ang) * L * j / 4; c.lineTo(x, y); } c.stroke(); }
  c.restore();
};

// Todo's clap
Combat.hz.yujiTodo = function (h) { return h.t < h.life; };
Combat.drawHz.yujiTodo = function (c, h) {
  const a = Math.min(1, h.t / 5, (h.life - h.t) / 8);
  c.save(); c.globalAlpha = 0.85 * a; c.translate(h.x, 0); c.scale(-h.dir * 1.25, 1.25);
  drawHumanoid(c, { pose: 'charge', anim: h.t / 60 }, { build: 'heavy', skin: '#c89a78', top: '#e8e4dc', topDark: '#b8b0a4', pants: '#3a3a4a', boots: '#1a1a1a', noFace: false }, {
    head(c, P) { c.fillStyle = '#2a1a1a'; c.beginPath(); c.ellipse(P.head[0] - 6, P.head[1] - 4, 8, 6, 0, 0, Math.PI * 2); c.fill(); } });
  c.restore();
  if (h.t > 4 && h.t < 14) { c.save(); c.strokeStyle = `rgba(255,255,255,${1 - (h.t - 4) / 10})`; c.lineWidth = 4; c.beginPath(); c.arc(h.x, -100, (h.t - 4) * 16, 0, Math.PI * 2); c.stroke(); c.restore(); bigText(c, 'CLAP!', h.x, -190, 26, '#fff', '#000'); }
};

// ---------------- kit ----------------
const YJ_FIST = mk({ name: 'Divergent Fist', desc: 'A punch whose cursed energy hits again a beat later. Press I (or any attack) as the ring closes: BLACK FLASH.', pose: 'punch', s: 9, a: 4, r: 16, divergent: true,
  hit: { dmg: 52, box: [6, -115, 92, 50], kb: [120, 0], hs: 24, bs: 14 }, ai: { min: 0, max: 70, use: 'combo' },
  onHit: (a, t) => yjSchedule(a, t) });
const YJ_KNEE = Mv.rush({ name: 'Manji Kick', desc: 'A flying knee that launches.', s: 10, speed: 1100, frames: 14, hit: { dmg: 78, kb: [160, -880], launch: true } });
const YJ_UPPER = Mv.rising({ name: 'Cursed Uppercut', desc: 'Invincible rising uppercut.', hit: { dmg: 36, multi: 3 } });
const YJ_BOOGIE = mk({ name: 'Boogie Woogie', desc: 'Todo claps: Yuji and the foe swap places.', pose: 'taunt', s: 10, a: 1, r: 14, cd: 7, ai: { min: 80, max: 600, use: 'trap' },
  ev: { 10: f => { const t = f.opp; if (!t || t.state === 'ko') return; Combat.addHazard({ kind: 'yujiTodo', owner: f, side: f.side, x: f.x - f.facing * 90, dir: f.facing, life: 26 });
    const x = f.x; f.x = t.x; t.x = x; f.faceOpp(); t.faceOpp(); if (t.state === 'move' && t.move && t.move.hit) t.status.confuse = Math.max(t.status.confuse || 0, 0.5);
    Game.popWorld(f.x, f.y - f.h - 40, 'BOOGIE WOOGIE', '#ffd35a', 20); yjSfx('clang'); Cam.shake = 8; } } });
const YJ_DROP = Mv.dive({ name: 'Drop Kick', desc: 'A plunging kick; ground bounce.', vx: 600, vy: 1300, hit: { dmg: 74, box: [0, -70, 90, 80], gb: true, kb: [200, 900], guard: 'high' } });
const YJ_SUPER = superize(Mv.flurry({ name: 'Divergent Barrage', desc: 'A storm of fists that ends in a guaranteed Black Flash.', s: 8, hits: 10, every: 3, hit: { dmg: 16, box: [0, -120, 90, 100] },
  finisher: { dmg: 40, kb: [300, -200], launch: false, hs: 30 } }), 100);
YJ_SUPER.onHit = (a, t) => { if (a.mf >= YJ_SUPER.s + YJ_SUPER.a - 4) yjBlackFlash(a, t, 60); };
const YJ_ULT = Ult({ act: 'rush', name: 'BLACK FLASH ×4', desc: 'Four consecutive Black Flashes. Must connect.', dmg: 1120, color: '#ff2a3a', cutscene: (a, t) => csYujiBlackFlash(a, t), fx: { el: 'blood', color: '#ff2a3a', sky: ['#000', '#1a0006', '#3a000a'] } });

// Sukuna's kit
const SK = {
  '5S': Mv.shot({ name: 'Dismantle', desc: 'An invisible slash: near-instant, pierces.', s: 8, pose: 'cast', proj: { speed: 1900, r: 12, dmg: 44, pierce: true, kind: 'crescent', color: '#ff3a4a', core: '#fff', life: 1, hs: 18, kb: [200, -40] } }),
  '6S': mk({ name: 'Cleave', desc: 'A close slash that adapts to its target: +5% of their max HP.', pose: 'heavy', s: 10, a: 4, r: 18, hit: { dmg: 40, box: [0, -120, 90, 110], kb: [360, -300], launch: true, hs: 24, sfx: 'h' }, ai: { min: 0, max: 80, use: 'combo' },
    onHit: (a, t) => { if (t.hp > 1) { const x = Math.round(t.maxHp * 0.05); t.hp = Math.max(1, t.hp - x); Game.popWorld(t.x, t.y - t.h - 30, 'CLEAVE ' + x, '#ff3a4a', 18); } } }),
  '2S': Mv.shot({ name: 'Open: Fuga', desc: 'A flaming arrow that explodes and burns.', s: 22, pose: 'cast', proj: { speed: 900, r: 20, dmg: 90, kind: 'fire', color: '#ff6a1a', status: { burn: 3 }, prio: 2, hs: 28, kb: [500, -500], launch: true } }),
  '4S': mk({ name: 'Dismantle Web', desc: 'Five slashes rain around the foe.', pose: 'cast_up', s: 12, a: 1, r: 18, ai: { min: 150, max: 1200, use: 'zone' },
    ev: { 12: f => { const t = f.opp; if (!t) return; for (let i = 0; i < 5; i++) Combat.telegraph(f, { x: clamp(t.x + (i - 2) * 55, 40, Arena.stage.width - 40), r: 36, life: 12 + i * 4, color: '#ff3a4a', onFire: h => {
      for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) Combat.resolveHit(o, f, H_({ dmg: 30, guard: 'mid', hs: 14, kb: [40, -200] }), { proj: true, fromX: h.x });
      Combat.addHazard({ kind: 'yujiSpark', owner: f, side: f.side, x: h.x, y: -60, life: 8 }); yjSfx('slash');
    } }); } } }),
  'jS': Mv.dive({ name: 'King\'s Stomp', desc: 'A crushing stomp.', vx: 400, vy: 1500, hit: { dmg: 90, box: [0, -80, 100, 90], gb: true, kb: [200, 900], guard: 'high' } }),
};
const SK_SUPER = superize(Mv.flurry({ name: 'Dismantle Storm', desc: 'A blizzard of invisible slashes.', s: 8, hits: 14, every: 2, hit: { dmg: 14, box: [0, -140, 160, 130] }, finisher: { dmg: 90, kb: [800, -500], launch: true, wb: true } }), 100);
const SK_ULT = superize(mk({ name: 'MALEVOLENT SHRINE', desc: 'Domain Expansion: everything within reach is shredded. Blockable. Must connect.', pose: 'charge', s: 24, a: 2, r: 30,
  ev: { 24: f => { Combat.strikeZone(f, { x: f.x - 420, y: -300, w: 840, h: 306 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: SK_ULT }); Combat.addHazard({ kind: 'yujiSpark', owner: f, side: f.side, x: f.x, y: -120, life: 24 }); Cam.shake = 18; yjSfx('boom'); } } }), 300);
SK_ULT.id = 'yuji_fult'; SK_ULT.ult = { dmg: 1250, cutscene: (a, t) => csMalevolentShrine(a, t), fx: { el: 'blood', color: '#ff2a3a', sky: ['#000', '#1a0006', '#3a000a'] } };

const yuji = fighter({
  id: 'yuji', name: 'YUJI ITADORI', title: 'The Vessel', side: 'HERO', role: 'Rushdown · Black Flash · Takeover', color: '#f07a9a', color2: '#1c2640',
  bio: 'A high-schooler with absurd physical strength who swallowed a cursed finger to save his friends. Now the King of Curses lives inside him, waiting for a moment of weakness.',
  quote: "I don't know how I'll feel when I'm dead, but I don't want to regret the way I lived.",
  ending: 'Yuji spends his days protecting Metro City and his nights keeping Sukuna quiet. Most nights, he wins.',
  hp: 1020, walk: 290, rival: 'mortis', handArt: true, draw: drawYuji, drawPortrait: drawYujiPortrait, transformCutscene: f => csSukunaTakeover(f),
  model: { skin: '#f0c8a0' }, face: { expr: 'angry' },
  style: { speed: 0.9, power: 1.05 },
  gauge: { name: 'IN THE ZONE', max: 3, color: '#ff2a3a', pips: true },
  passive: ['Black Flash', 'Divergent Fist hits twice: press I (or any attack) as the ring closes for a BLACK FLASH (2.5x). Each one puts him deeper IN THE ZONE: +6% damage and a wider window (fades after 8s).'],
  passiveDmg: f => 1 + (f.gauge || 0) * 0.06,
  moves: { '5S': YJ_FIST, '6S': YJ_KNEE, '2S': YJ_UPPER, '4S': YJ_BOOGIE, 'jS': YJ_DROP },
  super: YJ_SUPER, ult: YJ_ULT,
  form: { name: 'SUKUNA', desc: 'TIMED (10s). The King of Curses takes over: Dismantle, Cleave, Fuga, Dismantle Web and the Domain Expansion MALEVOLENT SHRINE. Yuji is shaken when he regains control.', timed: 10, cost: 300, dmg: 1.12, speed: 1.08,
    moves: SK, super: SK_SUPER, ult: SK_ULT, normals: makeNormals({ reach: 1.2, power: 1.2, speed: 0.9 }) },
  assist: '6S',
  lines: {
    intro: ["Let's do this, {opp}!", "I'm not gonna lose. Not here.", 'Sorry, I hit pretty hard.'],
    win: ['Everyone gets a proper death. You get a proper beating.', "Hah! I'm getting stronger!", 'Todo would be proud. Probably.'],
    taunt: ['Come on!', 'Again!'], form: ['Know your place, fool.', 'Ha... this body is mine for now.'], ult: ['Black Flash!'], ultHit: ["Everything's connected."], tag: ['Switch!'], enter: ["I've got this!"], assist: ['Here!'], moves: ['Hah!', 'Take this!', 'Divergent!'],
  },
});
prepKitY(yuji, SK, '_f'); YJ_SUPER.id = 'yuji_super'; SK_SUPER.id = 'yuji_fsuper';
function prepKitY(d, moves, pre) { for (const [slot, m] of Object.entries(moves)) { m.id = d.id + pre + slot; m.slot = slot; m.owner = d.id; if (slot === 'jS') m.air = true; } }
yuji.onRoundStart = f => { f.gauge = 0; f.zoneT = 0; };
yuji.passiveTick = f => {
  const c = f.lastCtl; if (c && c.press && (c.press.S || c.press.L || c.press.M || c.press.H) && Game.battle) f.lastAtkPress = Game.battle.frame;
  if ((f.gauge || 0) > 0 && ++f.zoneT > 8 * FPS) { f.gauge--; f.zoneT = 0; }
};
yuji.onFormEnd = f => { f.status.slow = Math.max(f.status.slow || 0, 2); Game.popWorld(f.x, f.y - f.h - 30, '...WHAT DID HE DO?', '#aab', 18); f.say("Sukuna... get back in there.", 110); };

// ---------------- cinematics ----------------
function csSukunaTakeover(f) {
  const fx = new ParticleSystem(1200), d = f.def;
  return {
    name: 'SUKUNA', dur: 4.4, fx,
    cues: [[0, () => yjSfx('heartbeat')], [1.2, () => yjSfx('screech')], [2.4, () => { yjSfx('boom'); yjSfx('roar'); }]],
    draw(c, t) {
      c.fillStyle = '#050002'; c.fillRect(0, 0, W, H);
      if (t < 2.4) {
        const k = seg(t, 0.8, 2.3);
        c.save(); c.translate(W / 2, H / 2 + 20); c.scale(4.2, 4.2); c.translate(0, 0);
        drawHumanoid(c, { pose: 'idle', anim: t }, YUJI_PAL, {}); c.restore();
        c.save(); c.translate(W / 2, H / 2 + 20); c.scale(4.2, 4.2); c.globalAlpha = k; drawYuji(c, { pose: 'idle', anim: t, transformed: true }); c.restore();
        c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) glowCircle(c, W / 2 + 30 + i * 6, H / 2 - 400 + 30, 30 * k, 'rgba(255,20,30,0.5)', 'rgba(0,0,0,0)'); c.restore();
        caption(c, 'Hey... Itadori. Lend me your body.', t, 0.1, 1.2, '#ff8a9a');
      } else {
        const g = c.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 700); g.addColorStop(0, '#3a0008'); g.addColorStop(1, '#000'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        drawCharAt(c, d, W / 2, H - 20, 2.9, 1, { pose: 'taunt', anim: t, transformed: true });
        titleSlam(c, 'SUKUNA', 'KNOW YOUR PLACE, FOOL', t, 2.5, '#ff2a3a', 120);
        flashAt(c, t, 2.4, 2.7, '#ff4a4a');
      }
    },
  };
}
function csYujiBlackFlash(a, opp) {
  const d = a.def, oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3, flashes = [0.9, 2.0, 3.1, 4.2];
  const fx = new ParticleSystem(1600);
  return {
    name: 'BLACK FLASH ×4', dur: 6.6, fx,
    cues: flashes.map(x => [x, () => { yjSfx('boom'); yjSfx('zap'); }]).concat([[0, () => yjSfx('whoosh')]]),
    draw(c, t) {
      const n = flashes.filter(x => t > x).length, inFlash = flashes.some(x => t > x && t < x + 0.25);
      c.fillStyle = inFlash ? '#000' : '#14080c'; c.fillRect(0, 0, W, H);
      if (inFlash) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const ang = i * 0.35 + t * 3, L = 400 + (i % 4) * 200; c.strokeStyle = i % 2 ? 'rgba(255,30,40,0.9)' : 'rgba(80,0,10,0.9)'; c.lineWidth = 6; c.beginPath(); let x = W / 2, y = H / 2; c.moveTo(x, y); for (let j = 1; j <= 5; j++) { x = W / 2 + Math.cos(ang) * L * j / 5 + (j % 2 ? 20 : -20); y = H / 2 + Math.sin(ang) * L * j / 5; c.lineTo(x, y); } c.stroke(); } c.restore(); }
      if (t < 5.3) {
        const side = n % 2 ? -1 : 1;
        silhouette(c, o => drawCharAt(o, opp.def, W / 2 + side * 60, H - 60, oppScale * 1.4, -side, { pose: n ? 'hurt' : 'block', anim: t, transformed: opp.transformed }), inFlash ? '#fff' : '#2a0a10');
        drawCharAt(c, d, W / 2 - side * 170, H - 60, 2.6, side, { pose: ['punch', 'kick', 'punch2', 'heavy', 'uppercut'][n % 5], anim: t, gauge: Math.min(3, n) });
        if (n) bigText(c, 'BLACK FLASH', W / 2, 120 + (n - 1) * 60, 60 - n * 4, '#ff2a3a', '#000');
        caption(c, 'One more... ONE MORE!', t, 0.1, 0.85, '#ff9aa8');
      } else {
        drawCharAt(c, d, W * 0.4, H - 30, 2.6, 1, { pose: 'victory', anim: t, gauge: 3 });
        silhouette(c, o => { o.save(); o.translate(W * 0.74, H - 42); o.rotate(-1.45); drawCharAt(o, opp.def, 0, 0, oppScale * 0.9, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }); o.restore(); }, '#1a0006');
        titleSlam(c, 'BLACK FLASH ×4', "EVERYTHING'S CONNECTED", t, 5.4, '#ff2a3a', 100);
      }
    },
  };
}
function csMalevolentShrine(a, opp) {
  const d = a.def, oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3, fx = new ParticleSystem(2400);
  return {
    name: 'MALEVOLENT SHRINE', dur: 7.0, fx,
    cues: [[0, () => yjSfx('screech')], [1.2, () => yjSfx('boom')], [2.4, () => yjSfx('slash')], [3.2, () => yjSfx('slash')], [4.6, () => { yjSfx('boom'); yjSfx('boom', 0.2); }]],
    draw(c, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0002'); g.addColorStop(1, t > 1.2 ? '#4a0008' : '#140004'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      if (t < 1.2) {
        c.save(); c.translate(W / 2, H / 2 + 40); c.scale(3.6, 3.6); drawYuji(c, { pose: 'charge', anim: t, transformed: true }); c.restore();
        caption(c, 'Domain Expansion...', t, 0.1, 1.15, '#ff8a9a');
      } else {
        const k = ease.out(seg(t, 1.2, 2.2));
        // the shrine: a skull-lined gate with a gaping maw
        c.save(); c.translate(W / 2, H - 40); c.scale(k, k);
        c.fillStyle = '#1a0406'; c.fillRect(-260, -420, 520, 420);
        c.fillStyle = '#2a0808'; c.beginPath(); c.moveTo(-320, -420); c.lineTo(0, -560); c.lineTo(320, -420); c.closePath(); c.fill();
        c.fillStyle = '#050001'; c.beginPath(); c.ellipse(0, -200, 150, 110, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#e8dcc8'; for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(i * 26 - 10, -300); c.lineTo(i * 26, -260 + Math.abs(i) * 4); c.lineTo(i * 26 + 10, -300); c.fill(); c.beginPath(); c.moveTo(i * 26 - 10, -100); c.lineTo(i * 26, -140 - Math.abs(i) * 4); c.lineTo(i * 26 + 10, -100); c.fill(); }
        for (let i = 0; i < 12; i++) circle(c, -240 + i * 44, -10, 14, '#d8ccb8');
        c.restore();
        if (t > 2.2 && t < 5.0) {
          silhouette(c, o => drawCharAt(o, opp.def, W * 0.5, H - 60, oppScale, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), '#1a0206');
          c.save(); c.globalCompositeOperation = 'lighter'; c.lineWidth = 3;
          for (let i = 0; i < 40; i++) { const s = (i * 7919 + Math.floor(t * 20) * 131) % 1000 / 1000, y = s * H, x0 = ((i * 37) % 100) / 100 * W; c.strokeStyle = `rgba(255,${30 + (i % 3) * 30},40,0.8)`; c.beginPath(); c.moveTo(x0 - 200, y - 60); c.lineTo(x0 + 200, y + 60); c.stroke(); }
          c.restore();
          if (t > 2.4) bigText(c, 'MALEVOLENT SHRINE', W / 2, 90, 64, '#ff2a3a', '#000');
        }
        if (t > 5.0) { drawCharAt(c, d, W * 0.4, H - 40, 2.6, 1, { pose: 'taunt', anim: t, transformed: true }); titleSlam(c, 'MALEVOLENT SHRINE', 'DOMAIN EXPANSION', t, 5.1, '#ff2a3a', 96); }
        flashAt(c, t, 4.6, 5.0, '#ffd0d0');
      }
    },
  };
}
rival('yuji', 'mortis', [[1, 'Ah, a vessel. So much... raw material.'], [0, "You treat people like parts. I'm gonna punch that out of you."]],
  { yuji: 'People aren\'t spare parts.', mortis: 'Your body would make a fine employee.' });
rival('yuji', 'aatrox', [[1, 'Something dark lives inside you, boy. Let it out.'], [0, "He'd destroy everything. I won't let him. Or you."]],
  { yuji: 'One demon in my head is plenty.', aatrox: 'Your prison is weaker than mine.' });
rival('yuji', 'eric', [[1, 'Two guys with monsters inside. Rough week?'], [0, 'Rough LIFE. Sparring?'], [1, "Sparring."]],
  { yuji: 'Good fight! Your ape and my curse should never meet.', eric: 'Next time I bring the moon.' });

// ---------------- body & weapon reach for the hand-drawn fighters ----------------
(function bespokeBodies() {
  const set = (id, o, form) => { const d = charById(id); if (!d) return; Object.assign(d, o); if (form && d.form) Object.assign(d.form, form); };
  set('aatrox', { tall: 1.04, wide: 1.08, weaponTip: 146 }, { weaponTip: 172 });
  set('aurelion', { tall: 1.04, wide: 1.08, weaponTip: 172 }, { weaponTip: 194 });
  const au = charById('aurelion'); if (au && au.corruptForm) au.corruptForm.weaponTip = 172;
  set('seraph', { tall: 0.98, weaponTip: 154 }, { weaponTip: 172 });
  set('volibear', { tall: 1.18, wide: 1.45 });
  set('dio', { tall: 1.04, wide: 1.08 });
  set('yuji', { tall: 1.04, wide: 1.08 });
})();
