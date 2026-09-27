// ============================================================
//  MOONKAI — SATORU GOJO (Jujutsu Kaisen tribute), fighter #66.
//
//  INFINITY (gauge)  cursed energy. While he has any, projectiles stop dead before touching him
//                    (each costs energy). Regenerates; faster with the Six Eyes unsealed.
//  BLUE  (5S)        a point of attraction: drags the foe to it, hitting repeatedly.
//  RED   (6S)        reversal: a blast that throws the foe across the stage.
//  PURPLE (super)    Hollow Purple: Blue + Red merged. Erases everything in a line.
//  FLASH STEP (4S)   instant reposition behind the foe.
//  SIX EYES          permanent awakening: blindfold off. Infinity regenerates twice as fast,
//                    Blue and Red are stronger.
//  UNLIMITED VOID    ultimate: Domain Expansion. The foe is drowned in infinite information.
// ============================================================
const gjSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const GJ_PAL = { build: 'athletic', skin: '#f2dcc8', top: '#141420', topDark: '#0a0a12', pants: '#141420', pantsDark: '#0a0a12', boots: '#0a0a0a', belt: '#141420', glove: '#f2dcc8', noFace: true };

function drawGojo(c, v) {
  const t = v.anim || 0, S = !!v.transformed;
  if (S) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -70, 110, 'rgba(90,180,255,0.25)', 'rgba(0,0,0,0)'); c.restore(); }
  drawHumanoid(c, v, GJ_PAL, {
    chest(c, P) { const x = lerp(P.hip[0], P.sh[0], 0.9), y = lerp(P.hip[1], P.sh[1], 0.9); c.fillStyle = '#0a0a12'; c.fillRect(x - 6, y - 10, 12, 10); },
    head(c, P) {
      const [hx, hy] = P.head;
      c.fillStyle = '#f4f6ff'; c.strokeStyle = '#a8b0c8'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(hx - 11, hy); for (const [x, y] of [[-14, -12], [-6, -12], [-8, -24], [2, -15], [6, -26], [10, -14], [16, -18], [12, -6]]) c.lineTo(hx + x, hy + y); c.lineTo(hx + 11, hy - 4); c.closePath(); c.fill(); c.stroke();
      if (!S) { c.fillStyle = '#0a0a0a'; c.fillRect(hx - 10, hy - 6, 22, 6); }
      else { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 3, 7, 'rgba(80,190,255,1)', 'rgba(0,0,0,0)'); c.restore(); c.fillStyle = '#8fe0ff'; c.beginPath(); c.ellipse(hx + 7, hy - 3, 3, 1.8, 0, 0, Math.PI * 2); c.fill(); }
      c.strokeStyle = '#6a3a2a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(hx + 5, hy + 6); c.quadraticCurveTo(hx + 8, hy + 7.5, hx + 11, hy + 5); c.stroke();
    },
  });
  // Infinity shimmer
  if ((v.gauge || 0) > 10) { c.save(); c.globalAlpha = 0.12 + (v.gauge || 0) / 700; c.strokeStyle = '#bfe8ff'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, -60, 44, 70, 0, 0, Math.PI * 2); c.stroke(); c.restore(); }
}
function drawGojoPortrait(c, opts) {
  const S = !!opts.form;
  const g = c.createRadialGradient(50, 50, 4, 50, 50, 80); g.addColorStop(0, S ? '#1a3a6a' : '#1a1a2a'); g.addColorStop(1, '#02030a'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.fillStyle = '#141420'; c.beginPath(); c.moveTo(14, 100); c.lineTo(28, 78); c.lineTo(72, 78); c.lineTo(86, 100); c.fill(); c.fillRect(38, 72, 24, 12);
  c.fillStyle = '#f2dcc8'; c.strokeStyle = '#7a5a4a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(34, 40); c.lineTo(66, 40); c.lineTo(66, 56); c.lineTo(58, 70); c.lineTo(50, 74); c.lineTo(42, 70); c.lineTo(34, 56); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#f4f6ff'; c.strokeStyle = '#a8b0c8'; c.beginPath(); c.moveTo(30, 50); for (const [x, y] of [[22, 30], [32, 32], [26, 12], [40, 24], [46, 4], [54, 22], [64, 6], [66, 26], [80, 18], [72, 36], [78, 44], [68, 46], [58, 36], [50, 44], [42, 36], [34, 44]]) c.lineTo(x, y); c.closePath(); c.fill(); c.stroke();
  if (!S) { c.fillStyle = '#0a0a0a'; c.beginPath(); c.moveTo(32, 46); c.lineTo(68, 46); c.lineTo(68, 55); c.lineTo(32, 55); c.closePath(); c.fill(); }
  else { c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 9, 51, 12, 'rgba(80,190,255,1)', 'rgba(0,0,0,0)'); c.restore();
    for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(50 + s * 9, 51, 6, 3, 0, 0, Math.PI * 2); c.fill(); circle(c, 50 + s * 9, 51, 2.6, '#3ab8ff'); circle(c, 50 + s * 9, 51, 1, '#fff'); }
    c.strokeStyle = '#f4f6ff'; c.lineWidth = 1.2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 3, 47.5); c.lineTo(50 + s * 15, 46.5); c.stroke(); } }
  c.strokeStyle = '#6a3a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(43, 65); c.quadraticCurveTo(51, 68, 59, 63); c.stroke();
}

// ---------------- Infinity ----------------
const gjRegen = f => (f.form ? 0.5 : 0.25);
Combat.hz.gojoOrb = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  h.x += h.vx / FPS; h.vx *= 0.94;
  for (const o of this.targets(h.side)) { const d = h.x - o.x; if (Math.abs(d) < 220) { o.x += Math.sign(d) * Math.min(Math.abs(d), 7); if (h.t % 8 === 0 && Math.abs(d) < 70) Combat.resolveHit(o, f, H_({ dmg: f.form ? 18 : 14, guard: 'mid', hs: 14, kb: [0, -60], sfx: 'l' }), { proj: true, fromX: h.x }); } }
  return h.t < h.life;
};
Combat.drawHz.gojoOrb = function (c, h, t) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 60, 'rgba(60,140,255,0.8)', 'rgba(0,0,0,0)'); c.strokeStyle = 'rgba(160,210,255,0.8)'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(h.x, h.y, 20 + ((t * 80 + i * 20) % 50), 0, Math.PI * 2); c.stroke(); } c.restore(); circle(c, h.x, h.y, 10, '#0a1030'); };

const GJ_BLUE = mk({ name: 'Blue', desc: 'Cursed Technique Lapse: a point of attraction that drags the foe in and grinds them.', pose: 'cast', s: 12, a: 1, r: 18, ai: { min: 120, max: 900, use: 'zone' },
  ev: { 12: f => { Combat.addHazard({ kind: 'gojoOrb', owner: f, side: f.side, x: f.x + f.facing * 90, y: f.y - 80, vx: f.facing * 900, life: 70 }); gjSfx('voidHum'); } } });
const GJ_RED = mk({ name: 'Red', desc: 'Reversal: a repelling blast that throws the foe across the stage.', pose: 'cast', s: 16, a: 4, r: 20, hit: { dmg: 90, box: [20, -130, 110, 110], kb: [1200, -380], launch: true, wb: true, hs: 28, sfx: 'h' }, ai: { min: 0, max: 130, use: 'combo' },
  onStart: f => gjSfx('charge', 0.3) });
const GJ_STEP = mk({ name: 'Flash Step', desc: 'Instantly reappears behind the foe.', pose: 'dash', s: 4, a: 1, r: 12, inv: [1, 6], ai: { min: 200, max: 900, use: 'approach' }, ev: { 3: f => Combat.teleport(f, 'behind') } });
const GJ_CROSS = Mv.rising({ name: 'Infinity Rise', desc: 'A rising palm that repels upward.', hit: { dmg: 34, multi: 3 } });
const GJ_AIR = Mv.dive({ name: 'Descending Blue', desc: 'Drops with a small Blue in hand.', vx: 450, vy: 1300, hit: { dmg: 76, box: [0, -80, 100, 90], gb: true, kb: [200, 900], guard: 'high' } });
const GJ_PURPLE = superize(Mv.beam({ name: 'Hollow Purple', desc: 'Blue and Red merge: an imaginary mass that erases everything in a line.', s: 26, beam: { width: 120, dur: 26, dmg: 30, tick: 5, len: 2600, color: '#b070ff', core: '#fff', kb: [500, -300] } }), 200);
const GJ_ULT = superize(mk({ name: 'UNLIMITED VOID', desc: 'Domain Expansion: everything close is drowned in infinite information. Blockable. Must connect.', pose: 'charge', s: 20, a: 2, r: 30,
  ev: { 20: f => { Combat.strikeZone(f, { x: f.x - 360, y: -320, w: 720, h: 326 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: GJ_ULT }); Cam.shake = 14; gjSfx('bell'); } } }), 300);
GJ_ULT.id = 'gojo_ult'; GJ_ULT.ult = { dmg: 1180, cutscene: (a, t) => csUnlimitedVoid(a, t), fx: { el: 'light', color: '#8fd0ff' } };

const gojo = fighter({
  id: 'gojo', name: 'SATORU GOJO', title: 'The Strongest', side: 'HERO', role: 'Zoner · Infinity · Domain', color: '#8fd0ff', color2: '#141420',
  bio: 'The strongest sorcerer alive. Nothing touches him that he does not allow. He teaches high school. Badly, but with enormous confidence.',
  quote: "Throughout heaven and earth, I alone am the honored one.",
  ending: 'Gojo takes a teaching job in Metro City. The students learn nothing but have never been safer.',
  hp: 980, walk: 280, rival: 'yuji', handArt: true, draw: drawGojo, drawPortrait: drawGojoPortrait, transformCutscene: f => csSixEyes(f), tall: 1.08, wide: 1.05,
  model: { skin: '#f2dcc8' }, face: { expr: 'smirk' }, style: { speed: 0.95, reach: 1.1 },
  gauge: { name: 'INFINITY', max: 100, color: '#8fd0ff' },
  passive: ['Infinity', 'While he has INFINITY, projectiles stop before touching him (each costs 25). It regenerates over time, twice as fast with the Six Eyes unsealed.'],
  moves: { '5S': GJ_BLUE, '6S': GJ_RED, '4S': GJ_STEP, '2S': GJ_CROSS, 'jS': GJ_AIR },
  super: GJ_PURPLE, ult: GJ_ULT,
  form: { name: 'SIX EYES', desc: 'Permanent. The blindfold comes off: Infinity regenerates twice as fast, Blue grinds harder, Red and Purple hit harder.', cost: 200, dmg: 1.1, speed: 1.05 },
  assist: '5S',
  lines: {
    intro: ["Don't worry, I'm the strongest.", 'Oh? You want to fight ME, {opp}?', "I'll go easy. Maybe."],
    win: ['Nah, I\'d win.', "Throughout heaven and earth, I alone am the honored one.", 'That was fun! For me.'],
    taunt: ['Is that it?', 'Yawn.'], form: ['Let me see you properly.'], ult: ['Domain Expansion.'], ultHit: ['Unlimited Void.'], tag: ['Leave it to me.'], enter: ['The strongest has arrived.'], assist: ['Blue.'], moves: ['Blue.', 'Red.', 'Too slow.'],
  },
});
gojo.ult = GJ_ULT; gojo.ultAct = 'strike'; GJ_PURPLE.id = 'gojo_super';
gojo.onRoundStart = f => { f.gauge = 100; };
gojo.passiveTick = f => { f.gauge = Math.min(100, (f.gauge || 0) + gjRegen(f)); };
gojo.onIncoming = (t, a, h, opts) => {
  if (!opts.proj || opts.force || h.ultConnect || (t.gauge || 0) < 25) return undefined;
  t.gauge -= 25; Game.popWorld(t.x, t.y - t.h - 30, 'INFINITY', '#bfe8ff', 18);
  Game.fx.burst(t.x - t.facing * 40, t.y - 70, 10, { color: ['#bfe8ff', '#fff'], size: 6, speed: 120, glow: true, life: 0.4 });
  return 'block';
};

function csSixEyes(f) {
  const d = f.def;
  return {
    name: 'SIX EYES', dur: 3.8, fx: new ParticleSystem(200),
    cues: [[0, () => gjSfx('whoosh')], [1.4, () => gjSfx('bell')]],
    draw(c, t) {
      c.fillStyle = '#02030a'; c.fillRect(0, 0, W, H);
      if (t < 1.4) { c.save(); c.translate(W / 2, H / 2 + 260); c.scale(4.5, 4.5); drawGojo(c, { pose: 'idle', anim: t }); c.restore(); caption(c, 'Let me see you properly.', t, 0.1, 1.3, '#bfe8ff'); }
      else { const k = seg(t, 1.4, 2.2); c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, W / 2 + s * 150, H / 2, 200 * k, 'rgba(60,170,255,0.9)', 'rgba(0,0,0,0)'); c.restore();
        for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(W / 2 + s * 150, H / 2, 110 * k, 50 * k, 0, 0, Math.PI * 2); c.fill(); circle(c, W / 2 + s * 150, H / 2, 40 * k, '#3ab8ff'); circle(c, W / 2 + s * 150, H / 2, 14 * k, '#fff'); }
        titleSlam(c, 'SIX EYES', 'THE STRONGEST, UNSEALED', t, 2.3, '#8fd0ff', 110); }
    },
  };
}
function csUnlimitedVoid(a, opp) {
  const fx = new ParticleSystem(2500), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.4;
  return {
    name: 'UNLIMITED VOID', dur: 6.6, fx,
    cues: [[0, () => gjSfx('whoosh')], [1.2, () => gjSfx('bell')], [2.2, () => gjSfx('voidHum')], [4.6, () => gjSfx('boom')]],
    draw(c, t) {
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      if (t < 1.2) { c.save(); c.translate(W / 2, H / 2 + 260); c.scale(4.2, 4.2); drawGojo(c, { pose: 'charge', anim: t, transformed: true }); c.restore(); caption(c, 'Domain Expansion...', t, 0.1, 1.15, '#bfe8ff'); return; }
      const k = seg(t, 1.2, 2.2);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 160; i++) { const a2 = i * 2.39996, r = 30 + (i * 7 + t * 120) % 700; fx; c.fillStyle = `hsla(${190 + (i % 60)},90%,${60 + (i % 30)}%,${0.5 * k})`; c.fillRect(W / 2 + Math.cos(a2) * r, H / 2 + Math.sin(a2) * r * 0.6, 3, 3); }
      glowCircle(c, W / 2, H / 2, 260 * k, 'rgba(120,200,255,0.35)', 'rgba(0,0,0,0)');
      c.restore();
      silhouette(c, o => drawCharAt(o, opp.def, W / 2 + 180, H - 80, oppScale, -1, { pose: t > 2.2 ? 'stun' : 'block', anim: 0, transformed: opp.transformed }), '#c8e8ff');
      drawCharAt(c, a.def, W / 2 - 200, H - 80, 2.4, 1, { pose: 'taunt', anim: t, transformed: true });
      if (t > 2.2 && t < 4.6) { c.globalAlpha = 0.8; for (let i = 0; i < 12; i++) smallText(c, ['∞', 'INFORMATION', 'EVERYTHING', 'NOTHING', 'ALL AT ONCE'][i % 5], rand(0, W), rand(0, H), rand(12, 26), '#dff4ff'); c.globalAlpha = 1; bigText(c, 'UNLIMITED VOID', W / 2, 90, 70, '#8fd0ff', '#000'); }
      flashAt(c, t, 4.6, 5.0, '#ffffff');
      if (t > 4.8) titleSlam(c, 'UNLIMITED VOID', "NAH, I'D WIN", t, 4.9, '#8fd0ff', 100);
    },
  };
}
rival('gojo', 'yuji', [[0, 'Yuji! Show me what you learned.'], [1, "Sensei, please don't use Infinity this time."], [0, 'No promises.']],
  { gojo: 'Good job! You lasted a whole round.', yuji: 'I... actually hit him?!' });
rival('gojo', 'dio', [[1, 'A man who cannot be touched? DIO will stop your time.'], [0, 'Cool. I\'ll still be the strongest in stopped time.']],
  { gojo: 'Nah, I\'d win. And I did.', dio: 'Even infinity must kneel to DIO.' });
