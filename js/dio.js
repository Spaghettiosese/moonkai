// ============================================================
//  MOONKAI — DIO (JoJo's Bizarre Adventure tribute), bespoke.
//
//  STAND: THE WORLD  ←I toggles his Stand. OFF: DIO fights as a vampire (knives, Space Ripper
//                    Stingy Eyes). ON: The World materialises beside him: every normal and
//                    special becomes a Stand attack with huge reach (MUDA rush, Stand Charge).
//  TIME gauge (clock) fills over time and as he lands hits. Full clock + ↓I = ZA WARUDO:
//                    time actually STOPS. The foe, their projectiles and traps freeze and can't
//                    block; knives DIO throws hang in the air until time resumes.
//  VAMPIRISM         heals 6% of damage dealt.
//  HIGH DIO          permanent awakening: shirtless, drunk on blood. Longer time stop, faster clock,
//                    more lifesteal.
//  ROAD ROLLER DA!   ultimate: a tracked road roller from the sky. Blockable, unless you use it
//                    inside your own stopped time.
// ============================================================
const dioSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };

// ---------------- art ----------------
const DIO_PAL = { build: 'athletic', skin: '#f2dcc8', top: '#f0c020', topDark: '#b08a10', pants: '#f0c020', pantsDark: '#b89018', boots: '#2a8a4a', belt: '#1a1a1a', glove: '#f2dcc8', noFace: true, bracers: '#2a8a4a', kneepads: '#2a8a4a' };
const DIO_HIGH_PAL = Object.assign({}, DIO_PAL, { top: '#f2dcc8', topDark: '#d8bca4', bracers: '#2a8a4a', belt: '#f0c020' });
const TW_PAL = { build: 'athletic', skin: '#e6c24a', top: '#e6c24a', topDark: '#a88420', pants: '#d8b440', pantsDark: '#a08020', boots: '#2a6a3a', belt: '#2a2a2a', glove: '#e6c24a', noFace: true, kneepads: '#2a6a3a' };

function drawHeart(c, x, y, s, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.2, x, y - s * 0.4); c.bezierCurveTo(x + s * 0.6, y - s * 1.2, x + s * 1.4, y - s * 0.1, x, y + s * 0.9); c.fill(); }

function drawTheWorld(c, pose, t, alpha, flurry) {
  c.save(); c.globalAlpha = alpha;
  drawHumanoid(c, { pose, anim: t }, TW_PAL, {
    back(c, P) { // hoses from the head to the back
      c.strokeStyle = '#2a2a2a'; c.lineWidth = 3; for (const d of [-4, 2]) { c.beginPath(); c.moveTo(P.head[0] - 8, P.head[1] + d); c.quadraticCurveTo(P.head[0] - 22, P.sh[1] - 6, P.sh[0] - 12, P.sh[1] + 10 + d); c.stroke(); }
    },
    chest(c, P) { const x = lerp(P.hip[0], P.sh[0], 0.6), y = lerp(P.hip[1], P.sh[1], 0.6); c.strokeStyle = '#2a2a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 8, y - 6); c.lineTo(x + 8, y - 6); c.moveTo(x - 6, y + 2); c.lineTo(x + 6, y + 2); c.stroke(); },
    head(c, P) {
      const [hx, hy] = P.head;
      c.fillStyle = '#e6c24a'; c.strokeStyle = '#3a2a08'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(hx - 12, hy + 6); c.lineTo(hx - 11, hy - 10); c.lineTo(hx + 2, hy - 16); c.lineTo(hx + 13, hy - 8); c.lineTo(hx + 13, hy + 8); c.lineTo(hx + 4, hy + 12); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#2a2a2a'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(hx - 6 + i * 5, hy - 13 + i); c.lineTo(hx - 6 + i * 5, hy - 4); c.stroke(); }
      c.fillStyle = '#1a1a1a'; c.fillRect(hx + 3, hy - 3, 9, 3);
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 9, hy - 2, 5, 'rgba(150,255,120,0.9)', 'rgba(0,0,0,0)'); c.restore();
      c.strokeStyle = '#3a2a08'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx + 5, hy + 7); c.lineTo(hx + 11, hy + 6); c.stroke();
    },
    pads(c, P) { drawHeart(c, P.fK[0], P.fK[1] - 2, 5, '#2a6a3a'); },
  });
  if (flurry) { // a blur of fists: MUDA MUDA MUDA
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) { const a = t * 40 + i * 1.7, x = 30 + ((i * 13 + t * 900) % 40), y = -110 + Math.sin(a) * 26; circle(c, x, y, 7, 'rgba(255,220,110,0.55)'); c.strokeStyle = 'rgba(255,230,140,0.35)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 30, y + 6); c.lineTo(x, y); c.stroke(); }
  }
  c.restore();
}

function drawDio(c, v) {
  const t = v.anim || 0, HI = !!v.transformed, m = v.move, standAtk = m && m.stand && v.standOn !== false;
  if (v.standOn && !standAtk) { c.save(); c.translate(-34, -26 + Math.sin(t * 2) * 4); c.scale(1.08, 1.08); drawTheWorld(c, v.pose === 'block' ? 'block' : 'idle', t + 0.5, 0.7, false); c.restore(); }
  if (HI) glowCircle(c, 0, -60, 110, 'rgba(180,20,40,0.25)', 'rgba(60,0,0,0)');
  drawHumanoid(c, v, HI ? DIO_HIGH_PAL : DIO_PAL, {
    back(c, P) {
      if (HI) return;
      c.fillStyle = '#e0b018'; c.beginPath(); c.moveTo(P.sh[0] - 6, P.sh[1]); c.quadraticCurveTo(P.sh[0] - 22, P.hip[1], P.sh[0] - 20 + Math.sin(t * 3) * 3, P.hip[1] + 28); c.lineTo(P.sh[0] - 8, P.hip[1] + 20); c.closePath(); c.fill();
    },
    chest(c, P) {
      const x = lerp(P.hip[0], P.sh[0], 0.62), y = lerp(P.hip[1], P.sh[1], 0.62);
      if (HI) { c.strokeStyle = 'rgba(140,90,70,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 7, y - 4); c.lineTo(x + 7, y - 4); c.moveTo(x, y - 8); c.lineTo(x, y + 10); c.stroke(); return; }
      c.fillStyle = '#1a1a1a'; c.fillRect(x - 6, y - 10, 12, 20);
      drawHeart(c, x, y + 14, 3.5, '#2a8a4a');
    },
    head(c, P) {
      const [hx, hy] = P.head;
      // slicked blond hair with loose front strands
      c.fillStyle = '#ffe46a'; c.strokeStyle = '#b8962a'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(hx - 12, hy + 4); c.quadraticCurveTo(hx - 14, hy - 14, hx + 2, hy - 14); c.quadraticCurveTo(hx + 12, hy - 13, hx + 12, hy - 6); c.lineTo(hx + 4, hy - 8); c.lineTo(hx - 2, hy - 7); c.quadraticCurveTo(hx - 8, hy - 2, hx - 6, hy + 8); c.closePath(); c.fill(); c.stroke();
      if (HI) { c.beginPath(); c.moveTo(hx - 10, hy - 10); c.lineTo(hx - 22, hy - 16); c.lineTo(hx - 12, hy - 4); c.moveTo(hx - 4, hy - 13); c.lineTo(hx - 8, hy - 26); c.lineTo(hx + 2, hy - 12); c.fill(); }
      c.strokeStyle = '#ffe46a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx + 8, hy - 9); c.quadraticCurveTo(hx + 12, hy - 2, hx + 9, hy + 4); c.stroke();
      // green headband with a heart
      if (!HI) { c.strokeStyle = '#2a8a4a'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx - 11, hy - 7); c.lineTo(hx + 10, hy - 9); c.stroke(); drawHeart(c, hx + 3, hy - 8.5, 2.3, '#9af07a'); }
      // red eye, fanged smirk, green lips when HIGH
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 2, 5, 'rgba(255,40,60,0.9)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#c01830'; c.beginPath(); c.moveTo(hx + 4, hy - 2); c.lineTo(hx + 10, hy - 3); c.lineTo(hx + 7, hy); c.fill();
      c.strokeStyle = '#2a1a1a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx + 3, hy - 5); c.lineTo(hx + 10, hy - 6); c.stroke();
      c.strokeStyle = HI ? '#2a8a4a' : '#6a2a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx + 5, hy + 6); c.quadraticCurveTo(hx + 8, hy + 7.5, hx + 11, hy + 5); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(hx + 8, hy + 6.5); c.lineTo(hx + 9, hy + 9); c.lineTo(hx + 10, hy + 6.2); c.fill();
    },
    pads(c, P) { drawHeart(c, P.fK[0], P.fK[1] - 2, 4.5, '#2a8a4a'); },
    front(c, P) {
      if (!v.standOn && !HI && (v.pose === 'cast' || v.pose === 'punch')) { const [hx, hy] = P.fH; c.fillStyle = '#e8e8f0'; for (let i = 0; i < 3; i++) { c.save(); c.translate(hx + 2, hy - 4 + i * 4); c.rotate(-0.3 + i * 0.3); c.fillRect(0, -1, 14, 2); c.restore(); } }
    },
  });
  if (standAtk) { c.save(); c.translate(m.standReach || 40, -4); drawTheWorld(c, m.standPose || v.pose, t, 0.92, !!m.flurry); c.restore(); }
}

// Portrait: menacing. Tilted head, red eyes, a fanged smirk, the green headband, and ゴゴゴ.
function drawDioPortrait(c, opts) {
  const HI = !!opts.form;
  const g = c.createLinearGradient(0, 0, 100, 100); g.addColorStop(0, HI ? '#3a0a2a' : '#2a1a4a'); g.addColorStop(1, HI ? '#8a1a3a' : '#6a2a6a'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  // The World looming behind
  c.save(); c.globalAlpha = 0.55; c.fillStyle = '#e6c24a'; c.beginPath(); c.moveTo(62, 100); c.lineTo(66, 30); c.lineTo(80, 10); c.lineTo(98, 22); c.lineTo(100, 100); c.fill(); c.fillStyle = '#1a1a1a'; c.fillRect(80, 26, 14, 4); c.restore();
  // menacing katakana
  c.save(); c.fillStyle = '#c070ff'; c.font = 'bold 13px sans-serif'; for (const [x, y, r] of [[6, 20, -0.3], [12, 40, 0.2], [4, 62, -0.1], [14, 82, 0.3]]) { c.save(); c.translate(x, y); c.rotate(r); c.fillText('ゴ', 0, 0); c.restore(); } c.restore();
  c.save(); c.translate(50, 55); c.rotate(-0.12); c.translate(-50, -55);
  // shoulders
  c.fillStyle = HI ? '#f2dcc8' : '#f0c020'; c.beginPath(); c.moveTo(16, 100); c.lineTo(28, 80); c.lineTo(72, 80); c.lineTo(84, 100); c.fill();
  if (!HI) { c.fillStyle = '#1a1a1a'; c.fillRect(44, 80, 12, 20); drawHeart(c, 50, 92, 4, '#2a8a4a'); }
  // face: sharp jaw
  c.fillStyle = '#f2dcc8'; c.strokeStyle = '#5a3a2a'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(34, 38); c.lineTo(66, 38); c.lineTo(66, 56); c.lineTo(58, 72); c.lineTo(50, 76); c.lineTo(42, 72); c.lineTo(34, 56); c.closePath(); c.fill(); c.stroke();
  // JoJo hatching shadows
  c.strokeStyle = 'rgba(80,40,40,0.5)'; c.lineWidth = 0.8; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(35 + i * 1.5, 56 + i * 2); c.lineTo(40 + i * 1.5, 54 + i * 2); c.stroke(); c.beginPath(); c.moveTo(65 - i * 1.5, 56 + i * 2); c.lineTo(60 - i * 1.5, 54 + i * 2); c.stroke(); }
  // hair
  c.fillStyle = '#ffe46a'; c.strokeStyle = '#b8962a';
  c.beginPath(); c.moveTo(30, 52); c.lineTo(26, 30); c.quadraticCurveTo(40, 8, 60, 12); c.quadraticCurveTo(76, 18, 72, 40); c.lineTo(68, 30); c.lineTo(58, 26); c.lineTo(46, 26); c.lineTo(36, 32); c.lineTo(34, 50); c.closePath(); c.fill(); c.stroke();
  if (HI) { c.beginPath(); c.moveTo(28, 26); c.lineTo(12, 14); c.lineTo(30, 20); c.moveTo(44, 14); c.lineTo(40, 0); c.lineTo(52, 12); c.moveTo(66, 18); c.lineTo(84, 6); c.lineTo(70, 26); c.fill(); }
  c.strokeStyle = '#ffe46a'; c.lineWidth = 2; c.beginPath(); c.moveTo(56, 27); c.quadraticCurveTo(62, 40, 57, 52); c.stroke();
  if (!HI) { c.strokeStyle = '#2a8a4a'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(32, 34); c.quadraticCurveTo(50, 29, 70, 34); c.stroke(); drawHeart(c, 50, 31, 3, '#9af07a'); }
  // narrowed red eyes
  for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 4, 49); c.lineTo(50 + s * 14, 46.5); c.lineTo(50 + s * 12, 50.5); c.closePath(); c.fill(); circle(c, 50 + s * 9, 48.8, 2, '#c01830'); c.strokeStyle = '#2a1a1a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(50 + s * 3, 44); c.lineTo(50 + s * 15, 41); c.stroke(); }
  // fanged smirk
  c.strokeStyle = HI ? '#2a8a4a' : '#6a2a2a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(42, 64); c.quadraticCurveTo(50, 67, 60, 61); c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(55, 64); c.lineTo(56.5, 68.5); c.lineTo(58, 63.2); c.fill();
  c.strokeStyle = '#8a5a4a'; c.lineWidth = 1; c.beginPath(); c.moveTo(50, 50); c.lineTo(51, 58); c.lineTo(49, 58.5); c.stroke();
  c.restore();
}

// ---------------- kit ----------------
const standMove = (m, reach, pose, flurry) => Object.assign(m, { stand: true, standReach: reach, standPose: pose, flurry });
const DIO_STAND_NORMALS = makeNormals({ reach: 1.65, speed: 0.85, power: 0.95 });
for (const [k, m] of Object.entries(DIO_STAND_NORMALS)) { m.stand = true; m.standReach = 34; m.id = 'dio_tw_' + k; }

const DIO_VAMP = {
  '5S': Mv.shot({ name: 'Knife Throw', desc: 'A fan of five knives. In stopped time they hang in the air.', s: 10, pose: 'cast', ai: { min: 150, max: 1200, use: 'zone' }, proj: { speed: 1150, r: 8, dmg: 16, count: 5, spread: 0.3, kind: 'knife', color: '#e8e8f0' } }),
  '6S': Mv.beam({ name: 'Space Ripper Stingy Eyes', desc: 'Pressurised fluid fired from the eyes: fast, thin, long.', s: 12, beam: { from: 'mouth', width: 10, dur: 14, dmg: 18, tick: 3, len: 1300, color: '#e8f0ff', core: '#fff', kb: [180, -40] } }),
  'jS': Mv.shot({ name: 'Knife Rain', desc: 'Three knives thrown downward.', s: 8, pose: 'cast', proj: { speed: 1100, r: 8, dmg: 22, count: 3, spread: 0.35, angle: 0.8, kind: 'knife', color: '#e8e8f0' } }),
};
const DIO_STANDM = {
  '5S': standMove(Mv.flurry({ name: 'MUDA MUDA MUDA', desc: 'The World unleashes a barrage of fists.', s: 8, hits: 12, every: 3, pose: 'punch', hit: { dmg: 13, box: [30, -135, 140, 110] }, finisher: { dmg: 55, kb: [600, -300], launch: true, wb: true } }), 46, 'punch', true),
  '6S': standMove(mk({ name: 'Stand Charge', desc: 'The World lunges far ahead while DIO stays put.', pose: 'cast', s: 12, a: 6, r: 18, hit: { dmg: 78, box: [60, -130, 170, 110], kb: [500, -200], hs: 24 }, ai: { min: 60, max: 260, use: 'approach' } }), 150, 'kick', false),
  'jS': standMove(Mv.dive({ name: 'The World Dive', desc: 'The Stand drops a hammer-fist from above.', pose: 'air_spike', vx: 500, vy: 1300, hit: { dmg: 78, box: [0, -80, 100, 90], gb: true, kb: [200, 900], guard: 'high' } }), 30, 'slam', false),
};
const DIO_TOGGLE = mk({ name: 'Stand: The World', desc: 'Summon / dismiss The World. ON: Stand normals & specials with huge reach. OFF: vampire kit.', pose: 'taunt', s: 4, a: 1, r: 6, ai: { min: 99999, max: 0, use: 'none' },
  ev: { 4: f => { f.standOn = !f.standOn; Game.popWorld(f.x, f.y - f.h - 30, f.standOn ? 'THE WORLD!' : 'STAND OFF', '#ffd23a', 20); dioSfx('whoosh'); Game.fx.burst(f.x + f.facing * 30, f.y - 70, 16, { color: ['#ffd23a', '#9af07a'], size: 7, speed: 260, glow: true, life: 0.4 }); } } });
const DIO_ZAWARUDO = mk({ name: 'ZA WARUDO', desc: 'With a full TIME clock: stop time. The foe freezes and cannot block; your knives hang frozen until time resumes.', pose: 'taunt', s: 14, a: 1, r: 12, ai: { min: 99999, max: 0, use: 'none' },
  ev: { 14: f => {
    if ((f.gauge || 0) < 100 || !Game.battle || Game.battle.timeStop) { Game.popWorld(f.x, f.y - f.h - 30, 'THE CLOCK IS NOT READY', '#aab', 16); return; }
    f.gauge = 0; f.standOn = true; f.say('ZA WARUDO! TOKI WO TOMARE!', 100);
    Game.battle.startTimeStop(f, f.form ? 210 : 132);
    Combat.addHazard({ kind: 'dioSphere', owner: f, side: f.side, x: f.x, y: f.y - 70, life: 30 });
  } } });

const DIO_SUPER = standMove(Sup.flurry({ name: 'MUDA MUDA MUDA MUDA!', desc: 'The World\'s full rush. Ends with a wall-splatting punch.', hits: 18, every: 2, hit: { dmg: 14, box: [30, -140, 150, 120] }, finisher: { dmg: 110, kb: [900, -400], launch: true, wb: true } }), 46, 'punch', true);
const DIO_ULT = superize(mk({ name: 'ROAD ROLLER DA!', desc: 'Leaps and drops a road roller onto the foe (tracks). Blockable, unless time is stopped. Must connect.', pose: f => (f.mf < 20 ? 'jump' : 'air_spike'), s: 20, a: 30, r: 22,
  ev: { 20: f => {
    const t = f.opp; if (!t) return;
    Combat.telegraph(f, { x: t.x, follow: t, track: 0.22, r: 115, life: 30, color: '#ffd23a', column: true, onFire: h => {
      for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) Combat.resolveHit(o, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: h.x, move: DIO_ULT });
      Combat.addHazard({ kind: 'dioRoller', owner: f, side: f.side, x: h.x, life: 30 }); Cam.shake = 22; dioSfx('boom'); dioSfx('clang');
    } });
    f.say('ROAD ROLLER DA!', 90);
  } } }), 300);
DIO_ULT.id = 'dio_ult'; DIO_ULT.recoverWhiff = 30;
DIO_ULT.ult = { dmg: 1150, cutscene: (a, t) => csDioRoadRoller(a, t), fx: { el: 'time', color: '#ffd23a', sky: ['#1a0a2a', '#4a2a6a', '#c8a040'] } };

const dio = fighter({
  id: 'dio', name: 'DIO', title: 'The World', side: 'VILLAIN', role: 'Stance · Stand · Time stop', color: '#ffd23a', color2: '#2a1a4a',
  bio: 'A vampire who conquered death and a Stand user who conquers time. He arrived in Metro City a century late and immediately decided it belonged to him.',
  quote: 'It was me, DIO!',
  ending: 'DIO takes over Metro City\'s tallest tower and declares himself ruler of the night. Nobody argues. Nobody can move fast enough to argue.',
  hp: 980, walk: 270, rival: 'aurelion', handArt: true,
  draw: drawDio, drawPortrait: drawDioPortrait, transformCutscene: f => csDioHigh(f),
  model: { skin: '#f2dcc8' }, face: { expr: 'smirk' },
  style: { reach: 1.1, speed: 0.92, power: 1.05 },
  gauge: { name: 'TIME', max: 100, color: '#b8f07a', label: f => (f.gauge >= 100 ? '· READY [↓I]' : ''),
    icon: (c, f, x, y) => { circle(c, x, y, 9, '#10141a'); c.strokeStyle = '#b8f07a'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2); c.stroke(); const a = -Math.PI / 2 + Math.PI * 2 * (f.gauge || 0) / 100; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 5); c.stroke(); } },
  passive: ['Vampirism & The World', 'Heals 6% of damage dealt. ←I summons/dismisses The World (Stand kit vs vampire kit). The TIME clock fills over time and on hits; full clock + ↓I stops time.'],
  onHit(a, t, dmg) { if (dmg > 0 && a.hp > 0) a.hp = Math.min(a.maxHp, a.hp + dmg * (a.form ? 0.1 : 0.06)); if (!(Game.battle && Game.battle.timeStop)) a.gauge = Math.min(100, (a.gauge || 0) + dmg * 0.06); },
  passiveDmg: () => (Game.battle && Game.battle.timeStop ? 0.8 : 1),
  moves: Object.assign({}, DIO_VAMP, { '4S': DIO_TOGGLE, '2S': DIO_ZAWARUDO }),
  super: DIO_SUPER,
  ult: { act: 'strike', name: 'ROAD ROLLER DA!', dmg: 1150, fx: { el: 'time', color: '#ffd23a', sky: ['#1a0a2a', '#4a2a6a', '#c8a040'] } },
  form: { name: 'HIGH DIO', desc: 'Permanent. Drunk on blood: time stops last longer, the clock fills faster, 10% lifesteal, and he starts with a full clock.', cost: 300, dmg: 1.08, speed: 1.08,
    onStart: f => { f.gauge = 100; } },
  assist: '5S',
  lines: {
    intro: ['You thought your first opponent would be someone else? But it was me, DIO!', 'How many breads have you eaten in your life, {opp}?', "Oh? You're approaching me?", 'You will not even see me move.'],
    win: ['WRYYYYYY!', 'You were a fool to challenge DIO.', 'Useless, useless, USELESS!', 'Time is DIO\'s to command.'],
    taunt: ['MUDA!', 'WRYYY!', 'Hmm?'], form: ["It's been a while since I felt this good!", 'HIGH! I feel so HIGH!'], ult: ['ROAD ROLLER DA!'], ultHit: ['Time resumes.'], tag: ['Step aside.'], enter: ['It was me, DIO!'], assist: ['MUDA!'], moves: ['MUDA!', 'WRY!', 'Useless!'],
  },
});
dio.ult = DIO_ULT; dio.ultAct = 'strike';
for (const [slot, m] of Object.entries(DIO_STANDM)) { m.id = 'dio_tw' + slot; m.slot = slot; m.owner = 'dio'; if (slot === 'jS') m.air = true; }
DIO_SUPER.id = 'dio_super';
dio.specialFor = (f, slot) => (slot === '4S' || slot === '2S') ? undefined : (f.standOn && DIO_STANDM[slot]) || undefined;
dio.normalsFor = f => (f.standOn ? DIO_STAND_NORMALS : null);
dio.onRoundStart = f => { f.gauge = 0; f.standOn = false; };
dio.passiveTick = f => {
  const B = Game.battle; if (!B) return;
  if (!B.timeStop) f.gauge = Math.min(100, (f.gauge || 0) + (f.form ? 0.18 : 0.12));
  if (f.ctrl === 'cpu' && B.live() && f.isActionable() && !f.airborne && f.opp) {
    const d = Math.abs(f.opp.x - f.x);
    if (f.gauge >= 100 && d < 320 && Math.random() < 0.03) f.startMove(DIO_ZAWARUDO);
    else if (f.st % 240 === 0 && Math.random() < 0.5) f.startMove(DIO_TOGGLE);
  }
};
// stopped time: invert, then drain the colour from the world; a clock face ticks
dio.drawScreen = (c, f, B) => {
  const ts = B.timeStop; if (!ts || ts.by !== f) return;
  const el = ts.max - ts.t;
  c.save();
  if (el < 14) { c.globalCompositeOperation = 'difference'; c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H); }
  else { c.globalCompositeOperation = 'saturation'; c.fillStyle = 'hsl(0,0%,50%)'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(210,190,150,1)'; c.fillRect(0, 0, W, H); }
  c.restore();
  c.save(); c.globalAlpha = 0.35; c.strokeStyle = '#e8f0ff'; c.lineWidth = 4; c.beginPath(); c.arc(W / 2, H / 2, 150, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(W / 2 + Math.cos(a) * 130, H / 2 + Math.sin(a) * 130); c.lineTo(W / 2 + Math.cos(a) * 145, H / 2 + Math.sin(a) * 145); c.stroke(); }
  const a = -Math.PI / 2 + (el / ts.max) * Math.PI * 2; c.lineWidth = 6; c.beginPath(); c.moveTo(W / 2, H / 2); c.lineTo(W / 2 + Math.cos(a) * 120, H / 2 + Math.sin(a) * 120); c.stroke(); c.restore();
  smallText(c, (ts.t / FPS).toFixed(1) + 's', W / 2, H / 2 + 175, 18, '#e8f0ff', 'center');
};

// ---------------- hazards ----------------
Combat.hz.dioSphere = function (h) { return h.t < h.life; };
Combat.drawHz.dioSphere = function (c, h) { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'difference'; c.fillStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; c.beginPath(); c.arc(h.x, h.y, 2200 * ease.out(k), 0, Math.PI * 2); c.fill(); c.restore(); };
Combat.hz.dioRoller = function (h) { return h.t < h.life; };
Combat.drawHz.dioRoller = function (c, h) { const k = Math.min(1, h.t / 5), a = 1 - Math.max(0, (h.t - 18) / 12); c.save(); c.globalAlpha = a; drawRoadRoller(c, h.x, lerp(-900, -70, k), 1.1); c.restore(); };
function drawRoadRoller(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#1a1a1a'; c.lineWidth = 3;
  c.fillStyle = '#e8b818'; c.fillRect(-90, -60, 150, 70); c.strokeRect(-90, -60, 150, 70);
  c.fillStyle = '#5a5a5a'; c.beginPath(); c.arc(-50, 10, 46, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = '#3a3a3a'; c.beginPath(); c.arc(40, 22, 32, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = '#e8b818'; c.fillRect(-10, -110, 60, 50); c.strokeRect(-10, -110, 60, 50); c.fillStyle = '#9ad0ff'; c.fillRect(0, -102, 40, 26);
  c.fillStyle = '#1a1a1a'; c.font = 'bold 18px sans-serif'; c.fillText('ロードローラー', -86, -20);
  c.restore();
}

// ---------------- cinematics ----------------
function csDioHigh(f) {
  const fx = new ParticleSystem(1600), d = f.def;
  return {
    name: 'HIGH DIO', dur: 4.4, fx,
    cues: [[0, () => dioSfx('heartbeat')], [1.1, () => dioSfx('screech')], [2.4, () => { dioSfx('boom'); dioSfx('roar'); }]],
    draw(c, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0010'); g.addColorStop(1, '#6a0a20'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) fx.add({ x: W / 2 + rand(-40, 40), y: H - 60, vx: rand(-200, 200), vy: rand(-700, -300), life: 1.2, size: rand(4, 9), color: pick(['#a0001a', '#d0102a', '#600010']), g: 900 });
      fx.draw(c);
      c.fillStyle = 'rgba(120,0,20,0.8)'; c.beginPath(); c.ellipse(W / 2, H - 50, 380, 40, 0, 0, Math.PI * 2); c.fill();
      drawCharAt(c, d, W / 2, H - 50, 2.7, 1, { pose: t < 1.1 ? 'charge' : t < 2.4 ? 'taunt' : 'victory', anim: t, transformed: t > 2.2 });
      caption(c, "It's been a while since I felt this good...", t, 0.1, 1.2, '#ffb0c0');
      if (t > 1.2 && t < 2.4) { c.globalAlpha = seg(t, 1.2, 1.4); bigText(c, 'WRYYYYYYYY!!', W / 2, 150, 90, '#ffd23a', '#3a0010'); c.globalAlpha = 1; }
      flashAt(c, t, 2.4, 2.7, '#ffe0e8');
      titleSlam(c, 'HIGH DIO', 'I FEEL SO HIGH!', t, 2.5, '#ffd23a', 110);
    },
  };
}

function csDioRoadRoller(a, opp) {
  const fx = new ParticleSystem(2200), d = a.def, city = makeCineCity(18, 140, 360), baseY = H - 30, ox = W * 0.55;
  const oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  const grey = (c) => { c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = 'hsl(0,0%,50%)'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgb(210,190,150)'; c.fillRect(0, 0, W, H); c.restore(); };
  return {
    name: 'ROAD ROLLER DA!', dur: 7.4, fx,
    cues: [[0, () => dioSfx('tone', 180, 1.2, 'sine', 0.12, 60)], [1.3, () => dioSfx('whoosh')], [2.4, () => { dioSfx('boom'); dioSfx('clang'); }], [2.9, () => dioSfx('hit')], [3.2, () => dioSfx('hit')], [3.5, () => dioSfx('hit')], [3.8, () => dioSfx('hit')], [5.0, () => { dioSfx('boom'); dioSfx('boom', 0.2); }]],
    draw(c, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1a4a'); g.addColorStop(1, '#c8a040'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      drawCineCity(c, city, baseY, '#1a1430');
      if (t < 1.3) {
        silhouette(c, o => drawCharAt(o, opp.def, ox, baseY, oppScale, -1, { pose: 'block', anim: 0, transformed: opp.transformed }), '#1a1030');
        drawCharAt(c, d, W * 0.25, baseY, 2.2, 1, { pose: 'taunt', anim: t, transformed: a.form, standOn: true });
        if (t < 0.4) { c.save(); c.globalCompositeOperation = 'difference'; c.fillStyle = '#fff'; c.beginPath(); c.arc(W * 0.25, baseY - 150, 1600 * ease.out(t / 0.4), 0, Math.PI * 2); c.fill(); c.restore(); }
        else grey(c);
        caption(c, 'ZA WARUDO! TOKI WO TOMARE!', t, 0.1, 1.2, '#b8f07a');
      } else if (t < 2.4) {
        grey(c);
        silhouette(c, o => drawCharAt(o, opp.def, ox, baseY, oppScale, -1, { pose: 'block', anim: 0, transformed: opp.transformed }), '#1a1030');
        const k = ease.out(seg(t, 1.3, 2.2)), rx = lerp(W * 0.25, ox, k), ry = lerp(baseY - 100, 170, Math.sin(k * Math.PI * 0.9));
        drawRoadRoller(c, rx, ry - 60, 1.8);
        drawCharAt(c, d, rx, ry - 170, 1.8, 1, { pose: 'cast_up', anim: t, transformed: a.form });
        if (t > 1.6) { c.globalAlpha = seg(t, 1.6, 1.8); bigText(c, 'ROAD ROLLER DA!!', W / 2, 110, 84, '#ffd23a', '#3a1a00'); c.globalAlpha = 1; }
      } else if (t < 4.2) {
        grey(c);
        const shk = 8; c.save(); c.translate(rand(-shk, shk), rand(-shk, shk));
        drawRoadRoller(c, ox, baseY - 70, 1.8);
        c.save(); c.translate(ox + 20, baseY - 250); c.scale(1.6, 1.6); drawTheWorld(c, 'punch', t * 3, 0.95, true); c.restore();
        drawCharAt(c, d, ox - 40, baseY - 250, 1.6, 1, { pose: 'slam', anim: t, transformed: a.form });
        c.restore();
        const n = Math.floor((t - 2.4) * 6); for (let i = 0; i < Math.min(n, 8); i++) bigText(c, 'MUDA', 140 + (i % 4) * 300, 160 + Math.floor(i / 4) * 70, 46, '#ffd23a', '#3a1a00');
      } else if (t < 5.4) {
        const k = seg(t, 4.2, 5.2);
        if (t < 5.0) grey(c);
        for (const b of city) if (Math.abs(b.x + b.w / 2 - ox) < 300 * k + 60) b.dead = true;
        drawCineCity(c, city, baseY, '#1a1430', false);
        if (t < 5.0) { drawRoadRoller(c, ox, baseY - 70, 1.8); caption(c, '...and time resumes.', t, 4.3, 4.95, '#e8f0ff'); }
        else { c.globalCompositeOperation = 'lighter'; glowCircle(c, ox, baseY - 60, 700 * seg(t, 5.0, 5.4), 'rgba(255,200,90,0.8)', 'rgba(0,0,0,0)'); c.globalCompositeOperation = 'source-over'; if (t < 5.1) for (let i = 0; i < 20; i++) fx.add({ x: ox, y: baseY - 60, vx: rand(-900, 900), vy: rand(-900, -100), life: 1, size: rand(8, 20), color: pick(['#ffd23a', '#ff6a1a', '#888']), glow: true, g: 1100 }); fx.draw(c); flashAt(c, t, 5.0, 5.3, '#fff'); }
      } else {
        drawCineCity(c, city, baseY, '#120e22', false); fx.draw(c);
        silhouette(c, o => { o.save(); o.translate(W * 0.72, baseY - 12); o.rotate(-1.45); drawCharAt(o, opp.def, 0, 0, oppScale * 0.9, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }); o.restore(); }, '#08060f');
        drawCharAt(c, d, W * 0.36, baseY, 2.5, 1, { pose: 'taunt', anim: t, transformed: a.form, standOn: true });
        titleSlam(c, 'ROAD ROLLER DA!', 'WRYYYYYYYYY!', t, 5.5, '#ffd23a', 100);
      }
    },
  };
}

// ---------------- rivalries ----------------
rival('dio', 'aurelion', [[1, 'A vampire calling himself a king. Adorable.'], [0, 'A god who cannot stop time. How useless.']],
  { dio: 'Even heaven waits when DIO stops the clock.', aurelion: 'Kneel, bloodsucker.' });
rival('dio', 'quanta', [[1, 'You bend time with a... ghost?'], [0, 'And you bend it with a calculator. MUDA.']],
  { dio: 'There is only one master of time. DIO.', quanta: 'Time has rules, vampire. I wrote most of them.' });
rival('dio', 'eric', [[0, 'A boy who becomes a beast under the moon. How quaint. DIO rules the night.'], [1, "The night's big enough for one of us. It's not you."]],
  { dio: 'The moon belongs to DIO now.', eric: "You can stop time. I can make a moon. Guess which one's scarier." });
