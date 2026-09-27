// ============================================================
//  MOONKAI — VOLIBEAR, the Relentless Storm (League of Legends tribute), bespoke.
//
//  STORM GAUGE        every hit adds a pip (5 max, decays when he stops hitting). At five,
//                     every blow also calls lightning down on the foe.
//  THUNDERING SMASH   a charge on all fours: it FLIPS the foe over his back and stuns.
//  FRENZIED MAUL      first bite marks the foe; biting a marked foe tears them and heals him.
//  SKY SPLITTER       a bolt telegraphed on the foe. Stand inside it yourself when it lands
//                     and the storm shields you: risk for reward.
//  TOWER BREAKER      a leap that shatters every enemy trap, turret, minion and projectile
//                     where he lands. Zoners hate him.
//  THE RELENTLESS STORM  permanent awakening: storm weather over the stage, random bolts
//                     hunt the foe, the gauge decays slower.
//  STORMBRINGER       ultimate: he vanishes into the clouds and falls as a lightning bolt.
// ============================================================
const volSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };

// ---------------- art ----------------
const VOL_PAL = { build: 'giant', skin: '#d8dde6', top: '#c4cad6', topDark: '#98a0b0', pants: '#b8c0cc', pantsDark: '#8a92a2', boots: '#3a4050', belt: '#3a4a6a', glove: '#d8dde6', noFace: true, bracers: '#5a6a86' };
const VOL_STORM_PAL = { build: 'giant', skin: '#5e6878', top: '#4a5466', topDark: '#323a48', pants: '#434c5c', pantsDark: '#2a3140', boots: '#1a1e28', belt: '#7ad8ff', glove: '#5e6878', noFace: true, bracers: '#7ad8ff' };

function drawBolt(c, x0, y0, x1, y1, seed, w, col) {
  const n = 7; let px = x0, py = y0;
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [lw, cc] of [[w * 3, hexA(col, 0.35)], [w, col], [w * 0.4, '#ffffff']]) {
    c.strokeStyle = cc; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); px = x0; py = y0;
    for (let i = 1; i <= n; i++) { const k = i / n, j = i === n ? 0 : Math.sin(seed * 13.7 + i * 7.1) * 26; px = lerp(x0, x1, k) + j; py = lerp(y0, y1, k); c.lineTo(px, py); }
    c.stroke();
  }
  c.restore();
}

function drawVolibear(c, v) {
  const t = v.anim || 0, S = !!v.transformed, charged = S || (v.gauge || 0) >= 5;
  if (S) glowCircle(c, 0, -70, 140, 'rgba(120,210,255,0.28)', 'rgba(40,80,160,0)');
  drawHumanoid(c, v, S ? VOL_STORM_PAL : VOL_PAL, {
    back(c, P) {
      // spiked mane along the shoulders and back
      c.fillStyle = S ? '#39424f' : '#eef1f6'; c.strokeStyle = S ? '#1a1e28' : '#8a92a2'; c.lineWidth = 1;
      for (let i = 0; i < 7; i++) { const x = P.sh[0] - 14 + i * 3, y = P.sh[1] - 4 + i * 5, L = (S ? 22 : 16) - i * 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x - L, y - L * 0.55 + Math.sin(t * 6 + i) * 2); c.lineTo(x - 2, y + 6); c.closePath(); c.fill(); c.stroke(); }
      if (S) for (let i = 0; i < 2; i++) { const a = t * 7 + i * 3; drawBolt(c, P.sh[0] - 20, P.sh[1] - 20, P.sh[0] - 40 + Math.sin(a) * 18, P.sh[1] - 60 + Math.cos(a) * 12, a, 1.4, '#9ae6ff'); }
    },
    chest(c, P) {
      // carved rune-stone belt plate + scars
      const x = lerp(P.hip[0], P.sh[0], 0.62), y = lerp(P.hip[1], P.sh[1], 0.62);
      c.strokeStyle = S ? '#7ad8ff' : '#6a7488'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x - 8, y - 6); c.lineTo(x - 2, y + 2); c.lineTo(x - 6, y + 8); c.moveTo(x + 6, y - 7); c.lineTo(x + 2, y); c.stroke();
    },
    head(c, P) {
      const [hx, hy] = P.head, fur = S ? '#5e6878' : '#e2e6ee', dark = S ? '#323a48' : '#a8b0c0';
      c.strokeStyle = '#1a1e28'; c.lineWidth = 1.4;
      // ears
      for (const [ex, ey] of [[hx - 7, hy - 12], [hx + 3, hy - 15]]) { c.fillStyle = fur; c.beginPath(); c.arc(ex, ey, 5.5, 0, Math.PI * 2); c.fill(); c.stroke(); circle(c, ex, ey, 2.4, dark); }
      // skull + muzzle
      c.fillStyle = fur; c.beginPath(); c.ellipse(hx + 1, hy - 1, 15, 13, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = S ? '#707a8a' : '#f2f4f8'; c.beginPath(); c.ellipse(hx + 14, hy + 4, 10, 7, 0.1, 0, Math.PI * 2); c.fill(); c.stroke();
      circle(c, hx + 23, hy + 1.5, 3, '#0a0c10');
      // snarling jaw with fangs
      c.fillStyle = '#2a0a10'; c.beginPath(); c.moveTo(hx + 8, hy + 8); c.lineTo(hx + 22, hy + 8); c.lineTo(hx + 18, hy + 13); c.lineTo(hx + 9, hy + 12); c.closePath(); c.fill();
      c.fillStyle = '#f8f4e8'; for (const fx0 of [hx + 11, hx + 18]) { c.beginPath(); c.moveTo(fx0, hy + 8); c.lineTo(fx0 + 1.5, hy + 12.5); c.lineTo(fx0 + 3, hy + 8); c.fill(); }
      // heavy brow + glowing eye
      c.strokeStyle = '#1a1e28'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(hx + 1, hy - 6); c.lineTo(hx + 12, hy - 3); c.stroke();
      c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 8, hy - 1, S ? 10 : 7, 'rgba(120,220,255,1)', 'rgba(0,0,0,0)'); c.globalCompositeOperation = 'source-over';
      c.fillStyle = S ? '#ffffff' : '#bff0ff'; c.beginPath(); c.moveTo(hx + 4, hy - 1); c.lineTo(hx + 12, hy - 2.5); c.lineTo(hx + 7, hy + 1); c.fill();
      // lightning scar
      c.strokeStyle = '#7ad8ff'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(hx - 4, hy - 9); c.lineTo(hx - 1, hy - 3); c.lineTo(hx - 5, hy); c.lineTo(hx - 2, hy + 6); c.stroke();
    },
    pads(c, P) {
      const [sx, sy] = P.sh;
      c.fillStyle = S ? '#2a3240' : '#6a7282'; c.strokeStyle = '#141820'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(sx - 16, sy + 6); c.lineTo(sx - 12, sy - 8); c.lineTo(sx + 6, sy - 12); c.lineTo(sx + 18, sy - 2); c.lineTo(sx + 14, sy + 8); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#dff6ff'; for (const [dx, h] of [[-8, 12], [2, 16], [11, 11]]) { c.beginPath(); c.moveTo(sx + dx - 3, sy - 8); c.lineTo(sx + dx, sy - 8 - h); c.lineTo(sx + dx + 3, sy - 8); c.fill(); }
      c.strokeStyle = S || charged ? '#9ae6ff' : '#4a88a8'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(sx - 10, sy); c.lineTo(sx - 4, sy - 5); c.lineTo(sx + 2, sy); c.lineTo(sx + 8, sy - 5); c.stroke();
    },
    front(c, P) {
      const [hx, hy] = P.fH, ang = Math.atan2(P.fH[1] - P.fE[1], P.fH[0] - P.fE[0]);
      c.strokeStyle = S ? '#e8f8ff' : '#f4f0e4'; c.lineWidth = 2.6; c.lineCap = 'round';
      for (const off of [-0.35, 0, 0.35]) { const a = ang + off; c.beginPath(); c.moveTo(hx + Math.cos(a) * 4, hy + Math.sin(a) * 4); c.quadraticCurveTo(hx + Math.cos(a) * 14, hy + Math.sin(a) * 14 - 3, hx + Math.cos(a + 0.4) * 20, hy + Math.sin(a + 0.4) * 20); c.stroke(); }
      if (charged) { const a = t * 11; drawBolt(c, hx, hy, hx + Math.cos(a) * 30, hy + Math.sin(a) * 22, a, 1.2, '#9ae6ff'); }
    },
  });
}

// Portrait: a snarling thunder-bear, head-on. Nothing friendly about it.
function drawVolibearPortrait(c, opts) {
  const S = !!opts.form;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, S ? '#0a1024' : '#1a2438'); g.addColorStop(1, S ? '#1a2a4a' : '#3a4a68'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  drawBolt(c, 88, 0, 70, 60, 3, 2.2, '#7ad8ff'); if (S) { drawBolt(c, 8, 0, 24, 55, 7, 2.2, '#9ae6ff'); drawBolt(c, 50, 0, 44, 18, 11, 1.6, '#ffffff'); }
  const fur = S ? '#5e6878' : '#e6e9f0', dark = S ? '#2a3140' : '#9aa2b2';
  // stone pauldrons
  c.fillStyle = S ? '#2a3240' : '#6a7282'; c.strokeStyle = '#10141c'; c.lineWidth = 1.5;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 18, 100); c.lineTo(50 + s * 30, 78); c.lineTo(50 + s * 48, 80); c.lineTo(50 + s * 50, 100); c.fill(); c.stroke(); c.fillStyle = '#dff6ff'; c.beginPath(); c.moveTo(50 + s * 36, 80); c.lineTo(50 + s * 40, 64); c.lineTo(50 + s * 44, 81); c.fill(); c.fillStyle = S ? '#2a3240' : '#6a7282'; }
  // ears
  for (const s of [-1, 1]) { c.fillStyle = fur; c.beginPath(); c.arc(50 + s * 27, 22, 10, 0, Math.PI * 2); c.fill(); c.stroke(); circle(c, 50 + s * 27, 23, 5, dark); }
  // head: broad, heavy
  c.fillStyle = fur; c.beginPath(); c.moveTo(22, 40); c.quadraticCurveTo(24, 16, 50, 15); c.quadraticCurveTo(76, 16, 78, 40); c.quadraticCurveTo(82, 62, 70, 76); c.lineTo(30, 76); c.quadraticCurveTo(18, 62, 22, 40); c.closePath(); c.fill(); c.stroke();
  // fur tufts at cheeks
  c.fillStyle = fur; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 26, 56); c.lineTo(50 + s * 36, 64); c.lineTo(50 + s * 27, 66); c.lineTo(50 + s * 33, 74); c.lineTo(50 + s * 22, 72); c.fill(); }
  // muzzle
  c.fillStyle = S ? '#707a8a' : '#f6f7fa'; c.beginPath(); c.ellipse(50, 60, 17, 14, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = '#0a0c10'; c.beginPath(); c.moveTo(43, 51); c.quadraticCurveTo(50, 47, 57, 51); c.quadraticCurveTo(50, 57, 43, 51); c.fill();
  // snarl: bared teeth, wrinkled muzzle
  c.strokeStyle = dark; c.lineWidth = 1.2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 5, 49); c.quadraticCurveTo(50 + s * 10, 46, 50 + s * 14, 49); c.stroke(); }
  c.fillStyle = '#2a0a12'; c.beginPath(); c.moveTo(38, 62); c.quadraticCurveTo(50, 58, 62, 62); c.lineTo(58, 72); c.quadraticCurveTo(50, 75, 42, 72); c.closePath(); c.fill();
  c.fillStyle = '#fbf7ec';
  for (const [x, up] of [[41, 1], [59, 1], [45, 0], [55, 0]]) { c.beginPath(); if (up) { c.moveTo(x - 2.5, 62); c.lineTo(x, 70); c.lineTo(x + 2.5, 62); } else { c.moveTo(x - 2, 73); c.lineTo(x, 66.5); c.lineTo(x + 2, 73); } c.fill(); }
  for (let i = 0; i < 4; i++) { const x = 46 + i * 2.6; c.fillRect(x, 62, 1.8, 2.4); }
  // furious brow + glowing eyes
  c.fillStyle = S ? '#1e2430' : '#6a7282';
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 4, 38); c.lineTo(50 + s * 22, 30); c.lineTo(50 + s * 22, 35); c.lineTo(50 + s * 6, 42); c.closePath(); c.fill(); }
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 13, 40, S ? 12 : 9, 'rgba(120,220,255,1)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = S ? '#ffffff' : '#c8f4ff'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 7, 41); c.lineTo(50 + s * 19, 36); c.lineTo(50 + s * 17, 41.5); c.closePath(); c.fill(); }
  // lightning scar across the eye
  c.strokeStyle = '#7ad8ff'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(60, 22); c.lineTo(64, 32); c.lineTo(60, 38); c.lineTo(66, 48); c.stroke();
}

// ---------------- mechanics ----------------
function volStorm(f, n = 1) { f.gauge = Math.min(5, (f.gauge || 0) + n); f.stormIdle = 0; }
function volBolt(f, x, r, o = {}) {
  let res = null;
  for (const t of Combat.targets(f.side)) if (Math.abs(t.x - x) < r && t.y > -700) {
    const out = Combat.resolveHit(t, f, H_({ dmg: o.dmg || 70, guard: o.guard || 'mid', hs: 24, bs: 14, kb: [0, -420], launch: true, stun: o.stun, status: o.slow ? { slow: o.slow } : undefined, sfx: 'h', ultConnect: o.ultConnect }), { proj: true, fromX: x, move: o.move });
    if (out) res = res === 'hit' ? res : out;
  }
  if (o.shieldIfInside && Math.abs(f.x - x) < r) { f.status.shield = Math.max(f.status.shield || 0, 150); f.status.shieldT = 4; Game.popWorld(f.x, f.y - f.h - 30, 'STORMSHIELD', '#9ae6ff', 22); }
  Combat.addHazard({ kind: 'volBoltFx', owner: f, side: f.side, x, r, life: 14, seed: rand(0, 99), big: !!o.big });
  Arena.hit(x - 30, x + 30, -40, 40, Game.fx);
  Cam.shake = Math.max(Cam.shake, o.big ? 18 : 8); volSfx('zap'); if (o.big) volSfx('boom');
  return res;
}
function volBreakTowers(f, x, R) {
  let n = 0;
  Combat.hazards = Combat.hazards.filter(h => { const kill = h.side !== f.side && h.kind !== 'volBoltFx' && Math.abs((h.x || 0) - x) < R; if (kill) { n++; Game.fx.burst(h.x, -40, 14, { color: ['#9ae6ff', '#fff', '#556'], size: 8, speed: 360, glow: true, life: 0.45 }); } return !kill; });
  for (const p of Combat.projectiles) if (p.side !== f.side && Math.abs(p.x - x) < R && p.life > 0) { p.life = 0; n++; Game.fx.burst(p.x, p.y, 8, { color: '#9ae6ff', size: 6, speed: 220, glow: true, life: 0.3 }); }
  if (n) Game.popWorld(x, -220, 'TOWER BREAKER ×' + n, '#9ae6ff', 22);
  return n;
}

const VOL_SMASH = mk({ name: 'Thundering Smash', desc: 'A charge on all fours. On hit it FLIPS the foe over his back and stuns them. Grants a burst of speed.', pose: 'dash', s: 8, a: 22, r: 16,
  vel: [[8, 30, 1150, null]], hit: { dmg: 78, box: [-10, -110, 95, 100], kb: [260, -420], flip: true, stun: 0.5, hs: 26, launch: true, sfx: 'h' }, ai: { min: 60, max: 420, use: 'approach' },
  onStart: f => { f.status.haste = Math.max(f.status.haste || 0, 1.5); volSfx('roar'); },
  onHit: (a, t) => { Game.popWorld(t.x, t.y - t.h - 40, 'FLIPPED!', '#9ae6ff', 24); Cam.shake = 10; } });
const volMaul = (storm) => mk({ name: storm ? 'Storm Maul' : 'Frenzied Maul', desc: storm ? 'An electrified bite that launches and slows. Second bite on a marked foe tears and heals.' : 'A savage bite. The first marks the foe; biting a marked foe tears them (+45) and heals 6%.',
  pose: 'heavy', s: 10, a: 5, r: 18, hit: Object.assign({ dmg: 70, box: [0, -125, 90, 100], kb: [300, -120], hs: 20, sfx: 'h' }, storm ? { kb: [320, -760], launch: true, status: { slow: 1.5 } } : {}), ai: { min: 0, max: 70, use: 'combo' },
  onHit: (a, t) => {
    if (Combat.markCount(t, 'frenzy')) { Combat.consumeMark(t, 'frenzy'); t.hp = Math.max(1, t.hp - 45); const h = Math.round(a.maxHp * 0.06); a.hp = Math.min(a.maxHp, a.hp + h); Game.popWorld(t.x, t.y - t.h - 40, 'MAULED', '#ff6a6a', 24); Game.popWorld(a.x, a.y - a.h - 20, '+' + h, '#7f7', 16); volSfx('slam'); }
    else Combat.mark(t, a, 'frenzy', 1, { max: 1, dur: 5, color: '#9ae6ff', label: 'FRENZY' });
  } });
const VOL_SPLIT = mk({ name: 'Sky Splitter', desc: 'Calls a bolt onto the foe after a telegraph. If Volibear stands inside the circle when it lands, the storm shields him.', pose: 'cast_up', s: 12, a: 1, r: 18, cd: 3,
  ai: { min: 150, max: 1400, use: 'zone' },
  ev: { 12: f => { const t = f.opp; Combat.telegraph(f, { x: t ? t.x : f.x + f.facing * 300, r: 95, life: 48, color: '#7ad8ff', column: true, onFire: h => volBolt(f, h.x, h.r, { dmg: 85, stun: 0.5, slow: 2, shieldIfInside: true, big: true }) }); volSfx('charge', 0.4); } } });
const VOL_LEAP = mk({ name: 'Tower Breaker', desc: 'A leap that shatters every enemy trap, turret, minion and projectile where he lands, and rocks the ground.', pose: f => (f.mf < 13 ? 'jump' : 'air_spike'), s: 26, a: 2, r: 18, volLeap: true, pinv: [1, 26],
  ai: { min: 150, max: 700, use: 'approach' },
  ev: { 1: f => { f.lfrom = f.x; f.lto = clamp(f.x + f.facing * 330, 60, Arena.stage.width - 60); },
    26: f => { f.y = 0; volBreakTowers(f, f.x, 320); Combat.strikeZone(f, { x: f.x - 150, y: -130, w: 300, h: 132 }, { dmg: 62, guard: 'low', hs: 22, kb: [220, -600], launch: true, sfx: 'h' }); Combat.addHazard({ kind: 'volRing', owner: f, side: f.side, x: f.x, life: 20 }); Cam.shake = 14; volSfx('slam'); volSfx('rock'); } } });
const VOL_CLAP = Mv.dive({ name: 'Thunderclap', desc: 'Crashes down like a lightning strike; ground bounce.', pose: 'air_spike', vx: 420, vy: 1500, hit: { dmg: 88, box: [0, -80, 100, 80], gb: true, kb: [200, 900], guard: 'high' } });
VOL_CLAP.onHit = (a, t) => volBolt(a, t.x, 40, { dmg: 20 });

const VOL_SUPER = superize(mk({ name: 'Frozen Thunder', desc: 'Five telegraphed bolts march out from him.', pose: 'taunt', s: 14, a: 1, r: 24,
  ev: { 14: f => { for (let i = 0; i < 5; i++) Combat.telegraph(f, { x: clamp(f.x + f.facing * (120 + i * 115), 40, Arena.stage.width - 40), r: 60, life: 16 + i * 7, color: '#bff0ff', column: true, onFire: h => volBolt(f, h.x, h.r, { dmg: 58, stun: 0.25, move: VOL_SUPER }) }); volSfx('roar'); } } }), 100);

const VOL_ULT = superize(mk({ name: 'STORMBRINGER', desc: 'Vanishes into the storm clouds, then falls as a lightning bolt onto the foe (tracks). Shatters traps. Blockable. Must connect.',
  pose: f => (f.mf < 12 ? 'cast_up' : f.mf < 34 ? 'fly' : 'air_spike'), s: 40, a: 2, r: 28, volUlt: true,
  ev: { 1: f => { volSfx('roar'); const t = f.opp; f.ultTele = Combat.telegraph(f, { x: t ? t.x : f.x, follow: t, track: 0.22, r: 120, life: 999, color: '#9ae6ff', column: true }); },
    40: f => {
      const x = f.ultTele ? f.ultTele.x : f.x; if (f.ultTele) f.ultTele.life = 0; f.ultTele = null;
      f.x = x; f.y = 0; volBreakTowers(f, x, 360);
      volBolt(f, x, 130, { dmg: 10, ultConnect: true, move: VOL_ULT, big: true });
      Combat.addHazard({ kind: 'volRing', owner: f, side: f.side, x, life: 26, big: true });
    } } }), 300);
VOL_ULT.id = 'volibear_ult'; VOL_ULT.recoverWhiff = 30;
VOL_ULT.ult = { dmg: 1120, cutscene: (a, t) => csVolibearUlt(a, t), fx: { el: 'bolt', color: '#7ad8ff', sky: ['#050a1a', '#1a2a4a', '#4a6a9a'] } };

const volibear = fighter({
  id: 'volibear', name: 'VOLIBEAR', title: 'The Relentless Storm', side: 'ANTI-HERO', role: 'Juggernaut · Storm stacks · Anti-zoner', color: '#7ad8ff', color2: '#0a1a3a',
  bio: 'An ancient demigod of the frozen north, a colossal thunder-bear who remembers when the world belonged to storms. Cities are just forests that forgot to be afraid of him.',
  quote: 'The storm does not ask. It takes.',
  ending: 'Volibear decides Metro City is too soft and leaves for the mountains. Every thunderstorm since is described by meteorologists as "somehow angry".',
  hp: 1150, walk: 245, weight: 1.15, deity: true, scale: 1.15, rival: 'aatrox', handArt: true,
  draw: drawVolibear, drawPortrait: drawVolibearPortrait, transformCutscene: f => csVolibearStorm(f),
  model: { skin: '#d8dde6' }, face: { expr: 'angry' },
  style: { reach: 1.1, power: 1.12, speed: 1.08, heavy: true },
  gauge: { name: 'STORM', max: 5, color: '#7ad8ff', pips: true },
  passive: ['The Relentless Storm', 'Every hit adds a STORM pip (max 5; decays when he stops attacking). At five, each blow also calls down lightning on the foe.'],
  onHit: (a, t, dmg) => {
    const full = (a.gauge || 0) >= 5;
    volStorm(a, 1);
    if (full && a.move && a.move.id !== 'volibear_ult' && t.hp > 1) { const extra = a.form ? 26 : 18; t.hp = Math.max(1, t.hp - extra); Combat.addHazard({ kind: 'volBoltFx', owner: a, side: a.side, x: t.x, r: 30, life: 10, seed: rand(0, 99) }); volSfx('zap'); }
  },
  passiveTick: f => {
    f.stormIdle = (f.stormIdle || 0) + 1;
    if (f.stormIdle > (f.form ? 240 : 150) && f.st % 30 === 0 && f.gauge > 0) f.gauge--;
    const B = Game.battle;
    if (f.form && B && B.live() && f.st % 240 === 120 && f.opp && f.opp.state !== 'ko') {
      const o = f.opp; Combat.telegraph(f, { x: clamp(o.x + rand(-90, 90), 40, Arena.stage.width - 40), r: 70, life: 40, color: '#bff0ff', column: true, onFire: h => volBolt(f, h.x, h.r, { dmg: 48, stun: 0.2 }) });
    }
  },
  moves: { '6S': VOL_SMASH, '5S': volMaul(false), '2S': VOL_SPLIT, '4S': VOL_LEAP, 'jS': VOL_CLAP },
  super: VOL_SUPER,
  ult: { act: 'strike', name: 'STORMBRINGER', dmg: 1120, fx: { el: 'bolt', color: '#7ad8ff', sky: ['#050a1a', '#1a2a4a', '#4a6a9a'] } },
  form: { name: 'THE RELENTLESS STORM', desc: 'Permanent. A titanic storm-bear: the sky darkens, bolts hunt the foe every few seconds, his bite launches, STORM decays slower, and he shrugs off light hits.',
    cost: 200, dmg: 1.1, armor: 0.9, speed: 0.98, scale: 1.2, moves: { '5S': volMaul(true) } },
  assist: '2S',
  lines: {
    intro: ['You smell of cities, {opp}.', 'The old ways return.', 'I have wrestled mountains. You are a pebble.', 'Run. It will make the hunt worth something.'],
    win: ['The storm passes. You do not.', 'Weak. Like all of this new world.', 'Remember the thunder, {opp}.'],
    taunt: ['RRAAAGH!', 'Hah!', 'Come!'], form: ['I AM THE STORM!', 'RRRROOOOAR!'], ult: ['STORMBRINGER!'], ultHit: ['The old gods walk again.'], tag: ['Stand back!'], enter: ['The storm arrives!'], assist: ['Thunder!'], moves: ['RAAH!', 'Hah!', 'Fall!'],
  },
});
volibear.ult = VOL_ULT; volibear.ultAct = 'strike';
volibear.onRoundStart = f => { f.gauge = 0; f.stormIdle = 0; };

// leap + ultimate motion
volibear.moveHook = (f, m) => {
  if (m.volLeap && f.mf < m.s) { const p = f.mf / m.s; f.x = clamp(lerp(f.lfrom, f.lto, p), 40, Arena.stage.width - 40); f.y = -Math.sin(p * Math.PI) * 230; f.vx = f.vy = 0; }
  if (m.volUlt && f.mf < m.s) {
    const tx = f.ultTele ? f.ultTele.x : f.x;
    if (f.mf < 14) { f.y = -lerp(0, 900, ease.in(f.mf / 14)); }
    else if (f.mf < 34) { f.y = -900; f.x = tx; }
    else { f.x = tx; f.y = -lerp(900, 0, (f.mf - 34) / 6); Game.fx.add({ x: f.x + rand(-10, 10), y: f.y - rand(0, 80), vx: 0, vy: -300, life: 0.25, size: rand(6, 12), color: pick(['#9ae6ff', '#fff']), glow: true }); }
    f.vx = f.vy = 0;
  }
};
// storm weather while awakened
volibear.drawScreen = (c, f, B) => {
  if (!f.form || f.state === 'benched') return;
  c.save();
  const g = c.createLinearGradient(0, 0, 0, H * 0.45); g.addColorStop(0, 'rgba(8,14,30,0.55)'); g.addColorStop(1, 'rgba(8,14,30,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H * 0.45);
  c.fillStyle = 'rgba(30,40,60,0.55)'; for (let i = 0; i < 10; i++) { const x = ((i * 170 + Game.t * 30) % (W + 200)) - 100; c.beginPath(); c.arc(x, 20 + (i % 3) * 14, 70, 0, Math.PI * 2); c.fill(); }
  c.strokeStyle = 'rgba(180,210,255,0.25)'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 60; i++) { const x = (i * 97 + Game.t * 600) % W, y = (i * 53 + Game.t * 900) % H; c.moveTo(x, y); c.lineTo(x - 6, y + 18); } c.stroke();
  if (Math.sin(Game.t * 1.7) > 0.985) { c.fillStyle = 'rgba(200,230,255,0.25)'; c.fillRect(0, 0, W, H); }
  c.restore();
};

// ---------------- hazards ----------------
Combat.hz.volBoltFx = function (h) { return h.t < h.life; };
Combat.drawHz.volBoltFx = function (c, h) {
  const a = 1 - h.t / h.life; c.save(); c.globalAlpha = a;
  drawBolt(c, h.x + Math.sin(h.seed) * 60, -1100, h.x, -4, h.seed + h.t * 0.3, h.big ? 9 : 5, '#9ae6ff');
  if (h.big) drawBolt(c, h.x - 80, -900, h.x, -4, h.seed + 5, 4, '#cff4ff');
  c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -10, (h.big ? 180 : 80) * a, 'rgba(160,230,255,0.7)', 'rgba(0,0,0,0)');
  c.restore();
};
Combat.hz.volRing = function (h) { return h.t < h.life; };
Combat.drawHz.volRing = function (c, h) {
  const k = h.t / h.life, R = (h.big ? 420 : 260) * ease.out(k);
  c.save(); c.strokeStyle = `rgba(190,235,255,${1 - k})`; c.lineWidth = 6 * (1 - k) + 1; c.beginPath(); c.ellipse(h.x, -4, R, R * 0.16, 0, 0, Math.PI * 2); c.stroke();
  c.fillStyle = `rgba(220,245,255,${0.8 * (1 - k)})`; for (let i = 0; i < 8; i++) { const x = h.x + (i - 3.5) * R / 4; c.beginPath(); c.moveTo(x - 6, 0); c.lineTo(x, -30 * (1 - k)); c.lineTo(x + 6, 0); c.fill(); }
  c.restore();
};

// ---------------- cinematics ----------------
function volSky(c, k) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${lerp(20, 4, k) | 0},${lerp(30, 8, k) | 0},${lerp(52, 22, k) | 0})`); g.addColorStop(1, `rgb(${lerp(80, 30, k) | 0},${lerp(100, 50, k) | 0},${lerp(140, 90, k) | 0})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function volMountains(c, col) { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let i = 0; i <= 10; i++) c.lineTo(i * W / 10, H - 180 - ((i * 73) % 5) * 50 - (i === 5 ? 150 : 0)); c.lineTo(W, H); c.fill(); c.fillStyle = 'rgba(240,248,255,0.85)'; c.beginPath(); c.moveTo(W / 2 - 70, H - 330); c.lineTo(W / 2, H - 430); c.lineTo(W / 2 + 70, H - 330); c.lineTo(W / 2 + 30, H - 350); c.lineTo(W / 2, H - 320); c.lineTo(W / 2 - 30, H - 350); c.fill(); }
function volSnow(fx, n = 4) { for (let i = 0; i < n; i++) fx.add({ x: rand(0, W + 200), y: -10, vx: rand(-220, -80), vy: rand(120, 260), life: 4, size: rand(1.5, 4), color: 'rgba(240,248,255,0.9)' }); }
function volBearCloud(c, t, k) {
  // storm clouds gathering into the face of a bear, eyes igniting
  c.save(); c.globalAlpha = k; c.fillStyle = 'rgba(30,40,62,0.95)';
  const cx = W / 2, cy = 170;
  for (const [x, y, r] of [[-230, -40, 90], [230, -40, 90], [-150, -90, 70], [150, -90, 70], [0, 0, 200], [-120, 60, 110], [120, 60, 110], [0, 110, 120]]) { c.beginPath(); c.arc(cx + x + Math.sin(t + x) * 6, cy + y, r, 0, Math.PI * 2); c.fill(); }
  c.globalCompositeOperation = 'lighter';
  for (const s of [-1, 1]) glowCircle(c, cx + s * 80, cy - 10, 60 * k, 'rgba(150,230,255,1)', 'rgba(0,0,0,0)');
  c.restore();
}

function csVolibearStorm(f) {
  const fx = new ParticleSystem(1600), d = f.def; let bolts = [];
  return {
    name: 'THE RELENTLESS STORM', dur: 4.6, fx,
    cues: [[0, () => volSfx('roar')], [1.3, () => { volSfx('zap'); volSfx('boom'); }], [1.8, () => volSfx('zap')], [2.3, () => volSfx('zap')], [2.9, () => { volSfx('roar'); volSfx('boom'); }]],
    draw(c, t) {
      volSky(c, seg(t, 0, 2.9)); volBearCloud(c, t, seg(t, 2.6, 3.6)); volMountains(c, '#141c2c'); volSnow(fx, 5); fx.draw(c);
      const grow = seg(t, 1.3, 2.9);
      drawCharAt(c, d, W / 2, H - 330 + 40, 1.6 + grow * 0.9, 1, { pose: t < 1.3 ? 'taunt' : t < 2.9 ? 'charge' : 'victory', anim: t, transformed: t > 2.5, gauge: 5 });
      if (t > 1.3 && t < 2.9) { const n = Math.floor((t - 1.3) * 6); if (bolts.length < n) bolts.push(rand(0, 99)); for (const s of bolts.slice(-2)) drawBolt(c, W / 2 + Math.sin(s) * 200, -20, W / 2, H - 400, s + t * 2, 6, '#bff0ff'); if (Math.sin(t * 40) > 0.6) { c.fillStyle = 'rgba(210,240,255,0.25)'; c.fillRect(0, 0, W, H); } }
      caption(c, 'The old ways return.', t, 0.1, 1.25, '#cfefff');
      flashAt(c, t, 2.9, 3.2, '#e8f8ff');
      titleSlam(c, 'THE RELENTLESS STORM', 'I AM THE STORM', t, 3.0, '#7ad8ff', 84);
    },
  };
}

function csVolibearUlt(a, opp) {
  const fx = new ParticleSystem(3000), d = a.def, city = makeCineCity(18, 140, 360), baseY = H - 30, oppX = W * 0.62;
  const oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'STORMBRINGER', dur: 6.8, fx,
    cues: [[0, () => volSfx('roar')], [1.2, () => volSfx('screech')], [1.5, () => volSfx('zap')], [2.0, () => volSfx('zap')], [2.7, () => volSfx('whoosh')], [3.7, () => { volSfx('boom'); volSfx('boom', 0.2); volSfx('zap'); }]],
    draw(c, t) {
      volSky(c, 1); volBearCloud(c, t, Math.min(1, t / 1.2));
      if (t < 3.7) {
        volSnow(fx, 6);
        const dead = t > 1.5; if (dead) for (const b of city) if (Math.random() < 0.01) b.dead = true;
        drawCineCity(c, city, baseY, '#0e1422');
        if (t > 1.4 && t < 2.7) for (let i = 0; i < 3; i++) { const x = rand(40, W - 40); drawBolt(c, x + rand(-60, 60), 160, x, baseY - rand(0, 80), rand(0, 99), 4, '#bff0ff'); }
        const jump = t > 2.7 ? ease.in(seg(t, 2.7, 3.7)) : 0;
        silhouette(c, o => drawCharAt(o, opp.def, oppX, baseY, oppScale, -1, { pose: t > 1.5 ? 'block' : 'idle', anim: t, transformed: opp.transformed }), '#0a0e18');
        if (t < 2.7) caption(c, 'Look up, little one. The sky remembers my name.', t, 0.1, 1.3, '#cfefff');
        if (t > 2.7) { const x = lerp(W / 2, oppX, jump), y = lerp(80, baseY - 30, jump); drawBolt(c, W / 2, 0, x, y, t * 3, 10, '#e8f8ff'); drawCharAt(c, d, x, y, 2.2, 1, { pose: 'air_spike', anim: t, transformed: true, gauge: 5 }); speedLines(c, t, oppX, baseY - 80, 'rgba(200,240,255,0.5)'); }
        fx.draw(c);
      } else if (t < 4.6) {
        const k = seg(t, 3.7, 4.5);
        for (const b of city) b.dead = true;
        drawCineCity(c, city, baseY, '#0e1422', false);
        drawBolt(c, oppX, -20, oppX, baseY, 11, 26 * (1 - k) + 4, '#ffffff');
        c.globalCompositeOperation = 'lighter'; glowCircle(c, oppX, baseY, 700 * ease.out(k), 'rgba(160,230,255,0.6)', 'rgba(0,0,0,0)'); c.globalCompositeOperation = 'source-over';
        c.fillStyle = 'rgba(220,245,255,0.9)'; for (let i = 0; i < 14; i++) { const x = oppX + (i - 7) * 60, h = (80 - Math.abs(i - 7) * 9) * ease.out(k); c.beginPath(); c.moveTo(x - 14, baseY); c.lineTo(x, baseY - h); c.lineTo(x + 14, baseY); c.fill(); }
        if (t < 3.9) for (let i = 0; i < 10; i++) fx.add({ x: oppX, y: baseY, vx: rand(-900, 900), vy: rand(-900, -200), life: 1, size: rand(6, 14), color: pick(['#bff0ff', '#fff', '#556']), glow: true, g: 1200 });
        fx.draw(c);
        flashAt(c, t, 3.7, 4.05, '#f0faff');
      } else {
        volSnow(fx, 3);
        drawCineCity(c, city, baseY, '#0a0e18', false);
        c.fillStyle = 'rgba(210,240,255,0.8)'; for (let i = 0; i < 20; i++) { const x = (i * 71) % W, h = 20 + ((i * 37) % 60); c.beginPath(); c.moveTo(x - 10, baseY); c.lineTo(x, baseY - h); c.lineTo(x + 10, baseY); c.fill(); }
        fx.draw(c);
        silhouette(c, o => { o.save(); o.translate(W * 0.74, baseY - 12); o.rotate(-1.45); drawCharAt(o, opp.def, 0, 0, oppScale * 0.9, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }); o.restore(); }, '#05080f');
        drawCharAt(c, d, W * 0.4, baseY - 4, 2.4, 1, { pose: 'taunt', anim: t, transformed: true, gauge: 5 });
        titleSlam(c, 'STORMBRINGER', `${opp.def.name} WAS STRUCK DOWN BY THE STORM`, t, 4.8, '#7ad8ff', 104);
      }
    },
  };
}

// ---------------- rivalries ----------------
rival('volibear', 'aatrox', [[0, 'Darkin. You reek of the old war.'], [1, 'And you of wet fur and pride, bear.']],
  { volibear: 'Back to your sword, prisoner.', aatrox: 'Even gods of storms can bleed.' });
rival('volibear', 'volt', [[1, "Whoa, big guy. I'm also lightning themed. Can we share?"], [0, 'No.']],
  { volibear: 'There is only ONE storm.', volt: 'Sorry, big fella. Faster wins.' });
rival('volibear', 'glacia', [[1, 'A beast of the north. You will kneel to the Frozen Throne.'], [0, 'I was frozen before your throne was a puddle.']],
  { volibear: 'The ice remembers me. Not you.', glacia: 'Even storms freeze.' });
