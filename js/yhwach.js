// ============================================================
//  MOONKAI — YHWACH, the Father of the Quincy (Bleach tribute), fighter #68.
//
//  GAUGE   · REISHI   gathered from everything he strikes. Heilig Pfeil spends it for a
//                    five-arrow volley; Auswählen fills it by stealing.
//  PASSIVE · THE ALMIGHTY  he sees the future. Every 6s the eye opens: the next attack that
//                    would hit him simply doesn't; he is already standing behind the attacker.
//  BLUT VENE (↓I)    blood armor: 2.5s of super armor and 35% less damage.
//  SUPER · AUSWÄHLEN  pillars of light fall around the foe; every one that hits steals their
//                    meter and gives it to him.
//  THE ALMIGHTY       ultimate: a hundred eyes open across the sky while shadow closes on the
//                    foe; then the future he chose arrives. Slow. Blockable. Must connect.
// ============================================================
const ywSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const YW_PAL = { build: 'athletic', skin: '#e0c8b0', top: '#141414', topDark: '#0a0a0a', pants: '#141414', pantsDark: '#0a0a0a', boots: '#0a0a0a', belt: '#e8e8e8', glove: '#e8e8e8', noFace: true };
const YW_CD = f => (f.form ? 3 : 6) * FPS;
const ywReady = f => (f.ywCd || 0) <= 0;

function drawYhwachEyes(c, x, y, s, open, t) {
  // his many-pupiled eyes: black sclera, red iris with three pupils
  c.save(); c.translate(x, y); c.scale(s, s * open);
  c.fillStyle = '#0a0a0a'; c.beginPath(); c.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#c01010'; c.beginPath(); c.arc(0, 0, 4.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#000'; for (let i = 0; i < 3; i++) { const a = i * 2.1 + t; c.beginPath(); c.arc(Math.cos(a) * 1.8, Math.sin(a) * 1.8, 1, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
function drawYhwach(c, v) {
  const t = v.anim || 0, A = !!v.transformed, m = v.move, arm = !!v.ywVene;
  if (A) { c.save(); c.fillStyle = 'rgba(0,0,0,0.55)'; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32 + Math.sin(t * 2 + i) * 0.05; c.beginPath(); c.moveTo(0, -110); c.quadraticCurveTo(Math.cos(a) * 80, -110 + Math.sin(a) * 80, Math.cos(a) * 150, -110 + Math.sin(a) * 150); c.lineTo(Math.cos(a + 0.1) * 120, -110 + Math.sin(a + 0.1) * 120); c.closePath(); c.fill(); } c.restore(); }
  drawHumanoid(c, v, YW_PAL, {
    back(c, P) { // long black mantle with a white-trimmed inner lining
      c.fillStyle = '#0a0a0a'; c.strokeStyle = '#000'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(P.sh[0] - 16, P.sh[1] - 4); c.lineTo(P.sh[0] + 12, P.sh[1] - 4); c.lineTo(P.sh[0] + 16, P.hip[1] + 76); c.lineTo(P.sh[0] - 44, P.hip[1] + 80 + Math.sin(t * 2) * 4); c.closePath(); c.fill();
      c.strokeStyle = '#d8d8d8'; c.lineWidth = 2; c.beginPath(); c.moveTo(P.sh[0] - 42, P.hip[1] + 78); c.lineTo(P.sh[0] + 14, P.hip[1] + 74); c.stroke();
      c.fillStyle = '#1a1a1a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(P.sh[0] - 14 + i * 5, P.sh[1] - 4, 6, 0, Math.PI * 2); c.fill(); }                     // fur collar
      // long black hair down the back
      c.fillStyle = '#0a0a0a'; c.beginPath(); c.moveTo(P.head[0] - 8, P.head[1] - 6); c.quadraticCurveTo(P.head[0] - 26, P.head[1] + 30, P.head[0] - 22, P.head[1] + 60); c.lineTo(P.head[0] - 4, P.head[1] + 10); c.closePath(); c.fill();
    },
    chest(c, P) { // the Quincy cross in white, and blood veins when Blut is up
      const x = lerp(P.hip[0], P.sh[0], 0.62), y = lerp(P.hip[1], P.sh[1], 0.62);
      c.strokeStyle = '#e8e8e8'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x + 7, y); c.moveTo(x, y - 7); c.lineTo(x, y + 7); c.stroke();
      c.beginPath(); c.moveTo(x - 5, y - 5); c.lineTo(x + 5, y + 5); c.moveTo(x + 5, y - 5); c.lineTo(x - 5, y + 5); c.stroke();
      if (arm) { c.strokeStyle = 'rgba(200,20,20,0.9)'; c.lineWidth = 1.2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(x + rand(-14, 14), y + rand(-18, 18)); c.lineTo(x + rand(-16, 16), y + rand(-20, 20)); c.stroke(); } }
    },
    head(c, P) {
      const [hx, hy] = P.head;
      shadedHead(c, hx, hy, 11, '#e0c8b0');
      c.fillStyle = '#0a0a0a'; c.beginPath(); c.moveTo(hx - 12, hy + 4); c.quadraticCurveTo(hx - 10, hy - 16, hx + 4, hy - 13); c.quadraticCurveTo(hx + 13, hy - 10, hx + 12, hy - 3); c.lineTo(hx + 7, hy - 7); c.lineTo(hx + 2, hy - 2); c.lineTo(hx - 2, hy - 6); c.closePath(); c.fill();
      // moustache and a full beard
      c.beginPath(); c.moveTo(hx + 2, hy + 3); c.quadraticCurveTo(hx + 7, hy + 1, hx + 12, hy + 4); c.quadraticCurveTo(hx + 7, hy + 3.5, hx + 2, hy + 5); c.fill();
      c.beginPath(); c.moveTo(hx - 4, hy + 2); c.quadraticCurveTo(hx - 2, hy + 16, hx + 6, hy + 16); c.quadraticCurveTo(hx + 12, hy + 12, hx + 11, hy + 6); c.lineTo(hx + 4, hy + 7); c.closePath(); c.fill();
      if (A || !ywReady(v) === false) drawYhwachEyes(c, hx + 7, hy - 2, 0.55, 1, t);
      else { c.strokeStyle = '#0a0a0a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx + 3, hy - 3); c.lineTo(hx + 11, hy - 2); c.stroke(); circle(c, hx + 7, hy - 1.5, 1.2, '#c01010'); }
      if (A) { for (let i = 0; i < 4; i++) drawYhwachEyes(c, hx - 4 + (i % 2) * 8, hy - 10 + Math.floor(i / 2) * 20, 0.3, 1, t + i); }
    },
    front(c, P) {
      // a reishi broadsword of light when he slashes; otherwise empty, open hand
      const slash = m && (m.name === 'Reishi Blade' || m.name === 'THE ALMIGHTY');
      if (slash) { c.save(); c.translate(P.fH[0], P.fH[1]); c.rotate(lerp(-2.2, 0.6, clamp((v.mf || 0) / ((m.s || 10) + 2), 0, 1))); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(160,210,255,0.9)'; c.beginPath(); c.moveTo(0, -4); c.lineTo(150, -2); c.lineTo(162, 0); c.lineTo(150, 2); c.lineTo(0, 4); c.closePath(); c.fill(); glowCircle(c, 80, 0, 30, 'rgba(120,180,255,0.4)', 'rgba(0,0,0,0)'); c.restore(); }
    },
  });
}
function drawYhwachPortrait(c, opts) {
  const A = !!opts.form;
  c.fillStyle = A ? '#000' : '#0e0e10'; c.fillRect(0, 0, 100, 100);
  if (A) for (let i = 0; i < 14; i++) drawYhwachEyes(c, (i * 37) % 100, (i * 23) % 40 + 4, 0.5, 1, i);
  c.fillStyle = '#1a1a1a'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(10 + i * 10, 84, 10, 0, Math.PI * 2); c.fill(); }                                           // fur mantle
  c.fillStyle = '#0a0a0a'; c.beginPath(); c.moveTo(24, 40); c.quadraticCurveTo(18, 80, 14, 100); c.lineTo(86, 100); c.quadraticCurveTo(82, 80, 76, 40); c.fill();
  c.fillStyle = '#e0c8b0'; c.strokeStyle = '#6a5a4a'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(34, 34); c.lineTo(66, 34); c.lineTo(66, 54); c.lineTo(58, 66); c.lineTo(42, 66); c.lineTo(34, 54); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#0a0a0a'; c.beginPath(); c.moveTo(32, 46); c.quadraticCurveTo(30, 16, 50, 14); c.quadraticCurveTo(70, 16, 68, 46); c.lineTo(62, 34); c.lineTo(52, 40); c.lineTo(46, 32); c.lineTo(38, 36); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(38, 56); c.quadraticCurveTo(50, 52, 62, 56); c.lineTo(66, 62); c.quadraticCurveTo(62, 84, 50, 88); c.quadraticCurveTo(38, 84, 34, 62); c.closePath(); c.fill();               // beard
  c.fillStyle = '#6a5a4a'; c.fillRect(44, 60, 12, 2);
  for (const s of [-1, 1]) drawYhwachEyes(c, 50 + s * 9, 46, 0.75, 1, 0.4 * s);
  c.strokeStyle = '#0a0a0a'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(38, 41); c.lineTo(46, 43); c.moveTo(62, 41); c.lineTo(54, 43); c.stroke();
}

// ---------------- kit ----------------
const YW_ARROW = Mv.shot({ name: 'Heilig Pfeil', desc: 'An arrow of light.', s: 10, proj: { speed: 1400, r: 8, dmg: 52, kind: 'bolt', color: '#bcd8ff', core: '#fff', life: 1.2 } });
const YW_VOLLEY = Mv.shot({ name: 'Heilig Pfeil', desc: 'With 30+ REISHI: a five-arrow volley (spends 30).', s: 12, proj: { speed: 1400, r: 8, dmg: 36, count: 5, spread: 0.35, kind: 'bolt', color: '#bcd8ff', core: '#fff', life: 1.2 } });
YW_VOLLEY.onStart = f => { f.gauge = Math.max(0, (f.gauge || 0) - 30); };
const YW_STEP = Mv.rush({ name: 'Hirenkyaku', desc: 'Flash step straight through the foe. Invulnerable.', s: 4, speed: 2000, frames: 10, pass: true, inv: [1, 14], hit: { dmg: 70, kb: [150, -300] } });
const YW_VENE = mk({ name: 'Blut Vene', desc: 'Blood armor: 2.5s of super armor and 35% less damage.', pose: 'charge', s: 8, a: 1, r: 10, cd: 8, ai: { min: 0, max: 400, use: 'buff' },
  ev: { 8: f => { f.ywVene = 2.5 * FPS; Game.popWorld(f.x, f.y - f.h - 30, 'BLUT VENE', '#c01010', 18); ywSfx('clang'); } } });
const YW_BLADE = mk({ name: 'Reishi Blade', desc: 'A broadsword of light: a huge sweeping slash.', pose: 'heavy', s: 14, a: 5, r: 18, ai: { min: 0, max: 260, use: 'combo' },
  hit: { dmg: 105, box: [0, -160, 230, 150], kb: [500, -300], hs: 22, sfx: 'h' } });
const YW_RAIN = Mv.shot({ name: 'Heilig Pfeil: Rain', desc: 'Arrows straight down.', proj: { speed: 1300, r: 7, dmg: 26, count: 4, spread: 0.5, angle: 1.1, kind: 'bolt', color: '#bcd8ff', core: '#fff' } });
const YW_SUPER = superize(mk({ name: 'Auswählen', desc: 'Pillars of light fall around the foe. Each one that hits steals half a bar of their meter and fills his REISHI.', pose: 'cast_up', s: 16, a: 10, r: 22,
  ev: { 2: f => f.say('Auswählen.', 60), 16: f => { const o = f.opp; if (!o) return; for (let i = 0; i < 5; i++) Combat.telegraph(f, { x: clamp(o.x + (i - 2) * 70, 30, Arena.stage.width - 30), r: 40, life: 20 + Math.abs(i - 2) * 8, color: '#dde8ff', column: true, onFire: h => {
    for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < 50) { const r = Combat.resolveHit(t, f, H_({ dmg: 45, guard: 'mid', hs: 14, kb: [0, -200], sfx: 'm' }), { proj: true, fromX: h.x, move: YW_SUPER }); if (r === 'hit') { const s = Math.min(50, t.side.meter); t.side.meter -= s; f.side.meter = Math.min(METER_MAX, f.side.meter + s); f.gauge = Math.min(100, (f.gauge || 0) + 15); Game.popWorld(t.x, t.y - t.h - 30, 'STOLEN', '#dde8ff', 16); } }
    Combat.addHazard({ kind: 'ywPillar', owner: f, side: f.side, x: h.x, life: 18 }); } }); ywSfx('bell'); } } }), 100);
const YW_ULT = superize(mk({ name: 'THE ALMIGHTY', desc: 'A hundred eyes open across the sky while shadow closes on the foe; then the future he chose arrives. Slow. Blockable. Must connect.', pose: f => (f.mf < 70 ? 'cast' : 'heavy'), s: 70, a: 8, r: 30,
  ev: { 1: f => { f.say('I see it. The future where you fall.', 100); ywSfx('charge', 1); const t = f.opp; f.ywTele = Combat.telegraph(f, { x: t ? t.x : f.x, follow: t, track: 0.12, r: 100, life: 999, color: '#c01010', column: true }); },
    70: f => { const x = f.ywTele ? f.ywTele.x : f.x; if (f.ywTele) f.ywTele.life = 0; f.ywTele = null;
      Combat.strikeZone(f, { x: x - 100, y: -300, w: 200, h: 306 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: YW_ULT, fromX: x });
      Combat.addHazard({ kind: 'ywShadow', owner: f, side: f.side, x, life: 28 }); Cam.shake = 14; ywSfx('slam'); } } }), 300);
YW_ULT.id = 'yhwach_ult'; YW_ULT.recoverWhiff = 40;
YW_ULT.ult = { dmg: 1200, cutscene: (a, t) => csYhwachAlmighty(a, t), fx: { el: 'void', color: '#c01010' } };

const yhwach = fighter({
  id: 'yhwach', name: 'YHWACH', title: 'The Father of the Quincy', side: 'VILLAIN', role: 'Foresight · Theft · Archer', color: '#c01010', color2: '#0a0a0a',
  bio: 'A king who was sealed away for a thousand years and woke up hungry. He gave a piece of his soul to everyone who ever worshipped him, and now he is collecting it back.',
  quote: 'I have already seen how this ends.',
  ending: 'Yhwach sees every possible future of Metro City and chooses the one with no death in it. It is also the one with no change, no hope and no tomorrow. Nobody notices for a very long time.',
  hp: 1080, walk: 250, rival: 'vex', handArt: true, draw: drawYhwach, drawPortrait: drawYhwachPortrait, transformCutscene: f => csYhwachHeir(f),
  weaponTip: 160, tall: 1.06,
  model: { skin: '#e0c8b0' }, face: { expr: 'cold' }, style: { reach: 1.2, power: 1.1, weapon: true },
  gauge: { name: 'REISHI', max: 100, color: '#bcd8ff', label: f => (ywReady(f) ? '· THE EYE IS OPEN' : '') },
  passive: ['The Almighty', 'Every 6s the eye opens: the next attack that would hit him simply doesn\'t, and he is already behind the attacker.'],
  moves: { '5S': YW_ARROW, '6S': YW_STEP, '2S': YW_VENE, '4S': YW_BLADE, 'jS': YW_RAIN },
  super: YW_SUPER, ult: YW_ULT,
  form: { name: 'SOUL KING\'S HEIR', desc: 'Permanent. Wings of shadow and eyes everywhere: the Almighty opens every 3s, and REISHI fills twice as fast.', cost: 200, armor: 0.88, dmg: 1.1, scale: 1.08 },
  assist: '5S',
  lines: {
    intro: ['I have already seen your defeat, {opp}.', 'Kneel before your king.', 'A thousand years I waited. For this?'],
    win: ['As I foresaw.', 'Your future was always this.', 'All things return to me.'],
    taunt: ['Futile.', 'I see you.'], form: ['Behold the Almighty.'], ult: ['I see it.'], ultHit: ['That is the future I chose.'], tag: ['Withdraw.'], enter: ['Your king is here.'], assist: ['Pfeil.'], moves: ['Auswählen.', 'Blut.', 'Fall.'],
  },
});
yhwach.ult = YW_ULT; yhwach.ultAct = 'strike'; YW_SUPER.id = 'yhwach_super';
for (const [slot, m] of Object.entries(yhwach.moves)) { m.id = 'yhwach_' + slot; m.slot = slot; m.owner = 'yhwach'; if (slot === 'jS') m.air = true; }
YW_VOLLEY.id = 'yhwach_5S';
yhwach.specialFor = (f, slot) => (slot === '5S' && (f.gauge || 0) >= 30 ? YW_VOLLEY : undefined);
yhwach.onRoundStart = f => { f.gauge = 0; f.ywCd = 2 * FPS; f.ywVene = 0; };
yhwach.onHit = (a, t, dmg) => { a.gauge = Math.min(100, (a.gauge || 0) + dmg * (a.form ? 0.2 : 0.1)); };
yhwach.passiveArmor = f => (f.ywVene > 0 ? 0.65 : 1);
yhwach.passiveTick = f => {
  if (f.ywCd > 0) { f.ywCd--; if (f.ywCd === 0) { Game.popWorld(f.x, f.y - f.h - 30, 'THE EYE OPENS', '#c01010', 16); ywSfx('tone', 180, 0.4, 'sine', 0.05, 120); } }
  if (f.ywVene > 0) { f.ywVene--; f.superArmorT = 1; if (f.state === 'hit' && f.hitstun > 0) f.hitstun = Math.min(f.hitstun, 2); }
};
yhwach.onIncoming = (t, a, h) => {
  if (!ywReady(t) || !a || a === t || t.state === 'ko' || (h && h.ultConnect)) return undefined;
  t.ywCd = YW_CD(t);
  const from = t.x; t.x = clamp(a.x - (a.facing || 1) * 70, 40, Arena.stage.width - 40); t.y = 0; t.faceOpp && t.faceOpp();
  Combat.addHazard({ kind: 'ywAfter', owner: t, side: t.side, x: from, life: 20 });
  Game.popWorld(t.x, t.y - t.h - 40, 'FORESEEN', '#c01010', 22); ywSfx('tone', 2400, 0.1, 'sine', 0.05, 600);
  return null;
};
yhwach.drawWorldFront = (c, f) => {
  if (!ywReady(f) || f.state === 'ko') return; drawYhwachEyes(c, f.x, f.y - f.h * f.scale - 50, 1.4, 0.6 + 0.4 * Math.abs(Math.sin(f.st * 0.05)), f.st * 0.03);
};
yhwach.drawScreen = (c, f) => {
  if (f.move !== YW_ULT || f.mf >= 70) return; const k = f.mf / 70;
  for (let i = 0; i < 40 * k; i++) drawYhwachEyes(c, (i * 197) % W, (i * 113) % (H * 0.6) + 20, 2, Math.min(1, (70 * k - i) / 6), i);
};
Combat.hz.ywPillar = h => h.t < h.life;
Combat.drawHz.ywPillar = (c, h) => { const k = h.t / h.life, w = 60 * (1 - k * 0.5); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(220,232,255,${0.9 * (1 - k)})`; c.fillRect(h.x - w / 2, -1400, w, 1406); c.restore(); };
Combat.hz.ywShadow = h => h.t < h.life;
Combat.drawHz.ywShadow = (c, h) => { const k = h.t / h.life; c.save(); c.fillStyle = `rgba(0,0,0,${0.85 * (1 - k)})`; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.25; c.beginPath(); c.moveTo(h.x + Math.cos(a) * 260, Math.sin(a) * 260); c.lineTo(h.x - 8, -60); c.lineTo(h.x + 8, -60); c.closePath(); c.fill(); } c.restore(); };
Combat.hz.ywAfter = h => h.t < h.life;
Combat.drawHz.ywAfter = (c, h) => { const f = h.owner; c.save(); c.globalAlpha = 0.5 * (1 - h.t / h.life); drawCharAt(c, f.def, h.x, 0, f.scale || 1, f.facing, { pose: 'idle', anim: 0 }); c.restore(); };

// ---------------- cinematics ----------------
function csYhwachHeir(f) {
  const d = f.def;
  return {
    name: "SOUL KING'S HEIR", dur: 4.2, fx: new ParticleSystem(400),
    cues: [[0.2, () => ywSfx('heartbeat')], [1.4, () => ywSfx('charge', 0.6)], [2.4, () => { ywSfx('boom'); ywSfx('bell'); }]],
    draw(c, t) {
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      // shadow floods up from the ground; eyes open in it, a few at first, then hundreds
      const k = seg(t, 0.2, 2.4);
      c.fillStyle = '#060606'; c.fillRect(0, H * (1 - k), W, H * k);
      const n = Math.floor(160 * k * k); for (let i = 0; i < n; i++) drawYhwachEyes(c, (i * 197) % W, H - ((i * 113) % Math.max(1, H * k)), 1.6, 1, i * 0.7 + t);
      drawCharAt(c, d, W / 2, H - 40, 2.7, 1, { pose: t < 2.4 ? 'idle' : 'victory', anim: t, transformed: t > 2.3 });
      caption(c, 'All things return to me.', t, 0.3, 2.2, '#ffb0b0');
      flashAt(c, t, 2.4, 2.7, '#c01010');
      titleSlam(c, "SOUL KING'S HEIR", 'THE ALMIGHTY', t, 2.5, '#c01010', 86);
    },
  };
}
function csYhwachAlmighty(a, opp) {
  const fx = new ParticleSystem(1200), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'THE ALMIGHTY', dur: 6.8, fx,
    cues: [[0, () => ywSfx('heartbeat')], [1.6, () => ywSfx('tone', 120, 1, 'sine', 0.06, 60)], [3.4, () => { ywSfx('slam'); ywSfx('boom'); }], [4.2, () => ywSfx('boom')]],
    draw(c, t) {
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      if (t < 3.4) {
        // the foe sees a dozen futures of themselves, overlapping and fading, as the eyes pick one
        const k = seg(t, 0, 3.4);
        for (let i = 0; i < 6; i++) { const alive = i === 3 || k < 0.4 + i * 0.1; c.save(); c.globalAlpha = alive ? (i === 3 ? 1 : 0.25) : 0; silhouette(c, o => drawCharAt(o, opp.def, W * (0.2 + i * 0.12), H - 60, oppScale, -1, { pose: ['block', 'dash', 'punch', 'idle', 'jump', 'charge'][i], anim: t, transformed: opp.transformed }), '#303036'); c.restore(); }
        for (let i = 0; i < 60 * k; i++) drawYhwachEyes(c, (i * 197) % W, (i * 113) % (H * 0.5) + 20, 2.4, 1, i + t);
        caption(c, 'I see every future you could have.', t, 0.2, 1.8, '#ffb0b0'); caption(c, 'I choose this one.', t, 2.0, 3.3, '#ffb0b0');
      } else {
        const k = seg(t, 3.4, 4.4);
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.62, H - 60, oppScale, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }), '#303036');
        c.fillStyle = '#000'; for (let i = 0; i < 14; i++) { const a2 = -Math.PI / 2 + (i - 7) * 0.2; const len = 700 * ease.out(k); c.beginPath(); c.moveTo(W * 0.62 + Math.cos(a2) * len, H * 0.55 + Math.sin(a2) * len); c.lineTo(W * 0.62 - 6, H * 0.6); c.lineTo(W * 0.62 + 6, H * 0.6); c.closePath(); c.fill(); c.strokeStyle = '#c01010'; c.lineWidth = 1; c.stroke(); }
        drawCharAt(c, a.def, W * 0.25, H - 60, 2.6, 1, { pose: 'victory', anim: t, transformed: true });
        flashAt(c, t, 3.4, 3.6, '#c01010');
        if (t > 4.6) titleSlam(c, 'THE ALMIGHTY', 'AS I FORESAW', t, 4.7, '#c01010', 96);
      }
    },
  };
}
rival('yhwach', 'vex', [[0, 'A man who stared into the abyss and called it a door.'], [1, 'And you are a king with no kingdom. Stand aside.']],
  { yhwach: 'I foresaw your door, Vex. It stays shut.', vex: 'Even the Almighty is a rounding error.' });
rival('yhwach', 'seraph', [[1, 'You wear a halo. I have eaten gods.'], [0, 'Then you have never met one who fought back.']],
  { yhwach: 'Your light returns to me.', seraph: 'The future is not yours to choose.' });
