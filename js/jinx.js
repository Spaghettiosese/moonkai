// ============================================================
//  MOONKAI — JINX, the Loose Cannon (League of Legends tribute; replaces the old magician kit).
//
//  SWITCHEROO (←I)   swaps between POW-POW (minigun) and FISHBONES (shark rocket launcher).
//                    Every weapon-based move changes with it.
//  GAUGE   · REV     Pow-Pow spins up as she keeps firing: each burst adds bullets (3 → 9).
//                    Stop shooting and it spins down.
//  PASSIVE · GET EXCITED!  Knock the foe down or hit a 6+ combo: 3s of speed and a free
//                    Switcheroo. (6s cooldown.)
//  ZAP! (→I)         a slow wind-up, then a long shock bolt that slows.
//  FLAME CHOMPERS (↓I)  three chattering snap-traps.
//  ARCANE (awakening) permanent: neon paint, REV never drops below half, rockets blast wider.
//  SUPER MEGA DEATH ROCKET  ultimate: a giant shark rocket that starts slow and keeps
//                    accelerating across the stage. Blockable.
// ============================================================
const jxSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const JINX = charById('jinx');
const JX_PAL = { build: 'slim', skin: '#f4dcd4', top: '#1a1a24', topDark: '#0e0e16', pants: '#7a3a9a', pantsDark: '#5a2a7a', boots: '#2a2030', belt: '#2a2030', glove: '#f4dcd4', noFace: true };

function drawFishbones(c, x, y, t) {
  c.save(); c.translate(x - 30, y - 18);
  c.fillStyle = '#3a8aa8'; c.strokeStyle = '#0a2a3a'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(-10, -9); c.lineTo(62, -11); c.quadraticCurveTo(80, 0, 62, 11); c.lineTo(-10, 9); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(60 + i * 3, -8); c.lineTo(62 + i * 3, -3); c.lineTo(64 + i * 3, -8); c.fill(); }
  c.fillStyle = '#ff3a8a'; c.beginPath(); c.moveTo(60, 2); c.lineTo(78, 0); c.lineTo(60, 8); c.fill();
  circle(c, 50, -4, 3, '#fff'); circle(c, 51, -4, 1.4, '#000');
  c.fillStyle = '#2a6a88'; c.beginPath(); c.moveTo(20, -10); c.lineTo(30, -22); c.lineTo(36, -10); c.fill();
  c.restore();
}
function drawPowPow(c, x, y, t, rev) {
  c.save(); c.translate(x, y);
  c.fillStyle = '#e080c0'; c.strokeStyle = '#3a0a2a'; c.lineWidth = 1.4; c.fillRect(-8, -8, 26, 14); c.strokeRect(-8, -8, 26, 14);
  const spin = t * (6 + rev * 0.4);
  for (let i = 0; i < 3; i++) { const oy = Math.sin(spin + i * 2.1) * 4; c.fillStyle = '#2a2a2a'; c.fillRect(18, -3 + oy, 26, 3); }
  circle(c, 5, -1, 4, '#ffd35a');
  c.restore();
}
function drawJinx(c, v) {
  const t = v.anim || 0, A = !!v.transformed, rocket = !!v.jxRocket;
  if (A) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -60, 100, 'rgba(255,60,200,0.2)', 'rgba(0,0,0,0)'); c.restore(); }
  drawHumanoid(c, v, JX_PAL, {
    back(c, P) {
      // two absurdly long blue braids
      const [hx, hy] = P.head;
      for (const [dx, ph] of [[-8, 0], [-3, 1.3]]) {
        c.strokeStyle = A ? '#4ad8ff' : '#2a8ad8'; c.lineWidth = 5; c.lineCap = 'round';
        c.beginPath(); c.moveTo(hx + dx, hy - 4);
        for (let i = 1; i <= 6; i++) c.lineTo(hx + dx - 10 - i * 4 + Math.sin(t * 3 + i * 0.8 + ph) * 5, hy + i * 16);
        c.stroke();
        c.strokeStyle = 'rgba(0,0,40,0.35)'; c.lineWidth = 1; for (let i = 1; i <= 6; i++) { const x = hx + dx - 10 - i * 4 + Math.sin(t * 3 + i * 0.8 + ph) * 5, y = hy + i * 16; c.beginPath(); c.moveTo(x - 3, y - 3); c.lineTo(x + 3, y + 3); c.stroke(); }
      }
    },
    chest(c, P) {
      // cloud tattoo + ammo belt
      c.strokeStyle = A ? '#ff5ac8' : '#5a8ab8'; c.lineWidth = 1.2; const x = P.sh[0] + 2, y = P.sh[1] + 16;
      c.beginPath(); c.arc(x - 3, y, 3, Math.PI, 0); c.arc(x + 3, y, 3, Math.PI, 0); c.stroke();
      c.strokeStyle = '#c8a040'; c.lineWidth = 2; c.beginPath(); c.moveTo(P.sh[0] - 8, P.sh[1] + 2); c.lineTo(P.hip[0] + 8, P.hip[1] - 4); c.stroke();
    },
    head(c, P) {
      const [hx, hy] = P.head;
      c.fillStyle = A ? '#4ad8ff' : '#2a8ad8'; c.beginPath(); c.moveTo(hx - 11, hy - 2); c.quadraticCurveTo(hx - 6, hy - 16, hx + 8, hy - 12); c.lineTo(hx + 11, hy - 3); c.lineTo(hx + 6, hy - 6); c.lineTo(hx + 3, hy - 3); c.lineTo(hx - 1, hy - 7); c.closePath(); c.fill();
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 1, 5, 'rgba(255,80,200,0.9)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#ff5ac8'; c.beginPath(); c.moveTo(hx + 4, hy - 1); c.lineTo(hx + 10, hy - 2); c.lineTo(hx + 7, hy + 1); c.fill();
      c.strokeStyle = '#3a0a2a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(hx + 4, hy + 5); c.quadraticCurveTo(hx + 8, hy + 9, hx + 12, hy + 4); c.stroke();
      c.fillStyle = '#fff'; c.fillRect(hx + 6, hy + 5, 4, 1.6);
    },
    front(c, P) { const [hx, hy] = P.fH; if (rocket) drawFishbones(c, hx, hy, t); else drawPowPow(c, hx, hy, t, v.gauge || 0); },
  });
}
function drawJinxPortrait(c, opts) {
  const A = !!opts.form;
  c.fillStyle = A ? '#1a0a2a' : '#10101a'; c.fillRect(0, 0, 100, 100);
  // graffiti
  c.save(); c.globalAlpha = 0.8; for (const [x, y, col, r] of [[14, 20, '#ff3a8a', 14], [84, 30, '#4ad8ff', 12], [20, 80, '#ffd35a', 10], [86, 84, '#ff3a8a', 12]]) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.fill(); }
  c.fillStyle = '#ff3a8a'; c.font = 'bold 12px sans-serif'; c.fillText('BOOM!', 60, 96); c.restore();
  for (const s of [-1, 1]) { c.strokeStyle = A ? '#4ad8ff' : '#2a8ad8'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(50 + s * 18, 30); c.quadraticCurveTo(50 + s * 30, 60, 50 + s * 24, 100); c.stroke(); }
  c.fillStyle = '#1a1a24'; c.beginPath(); c.moveTo(20, 100); c.lineTo(30, 82); c.lineTo(70, 82); c.lineTo(80, 100); c.fill();
  c.fillStyle = '#f4dcd4'; c.strokeStyle = '#8a5a5a'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(35, 40); c.lineTo(65, 40); c.lineTo(64, 58); c.lineTo(57, 70); c.lineTo(50, 73); c.lineTo(43, 70); c.lineTo(36, 58); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = A ? '#4ad8ff' : '#2a8ad8'; c.beginPath(); c.moveTo(32, 46); c.quadraticCurveTo(34, 22, 50, 22); c.quadraticCurveTo(66, 22, 68, 46); c.lineTo(62, 38); c.lineTo(57, 44); c.lineTo(52, 36); c.lineTo(46, 44); c.lineTo(41, 37); c.lineTo(36, 45); c.closePath(); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 9, 53, A ? 9 : 6, 'rgba(255,60,200,1)', 'rgba(0,0,0,0)'); c.restore();
  for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(50 + s * 9, 53, 5.5, 3.6, 0, 0, Math.PI * 2); c.fill(); circle(c, 50 + s * 9 + s, 53, 2.3, '#ff3a9a'); circle(c, 50 + s * 9 + s, 53, 0.9, '#000'); }
  c.strokeStyle = '#2a0a1a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(38, 46); c.lineTo(46, 49); c.moveTo(62, 46); c.lineTo(54, 49); c.stroke();
  // manic grin
  c.fillStyle = '#3a0a1a'; c.beginPath(); c.moveTo(41, 62); c.quadraticCurveTo(50, 72, 60, 61); c.quadraticCurveTo(50, 65, 41, 62); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(42, 62.2); c.quadraticCurveTo(50, 65.5, 59, 61.4); c.lineTo(58, 63); c.quadraticCurveTo(50, 67, 43, 63.5); c.fill();
  c.strokeStyle = '#5a8ab8'; c.lineWidth = 1; c.beginPath(); c.arc(60, 62, 2, Math.PI, 0); c.arc(64, 62, 2, Math.PI, 0); c.stroke();
}

// ---------------- kit ----------------
const jxFloor = f => (f.form ? 50 : 0);
const JX_POW = mk({ name: 'Pow-Pow', desc: 'Minigun burst. Every burst spins it up: 3 bullets at 0 REV, up to 9 at full.', pose: 'punch', s: 6, a: 12, r: 12, ai: { min: 100, max: 1200, use: 'zone' },
  ev: { 6: f => { const n = 3 + Math.floor((f.gauge || 0) / 17) + (f.form ? 2 : 0); for (let i = 0; i < n; i++) Game.later(i * 0.035, () => { if (f.state === 'ko') return; Combat.fireShots(f, { speed: 1400, r: 6, dmg: 9, kind: 'bullet', color: '#ffd35a', angle: rand(-0.05, 0.05), hs: 8, kb: [60, 0], life: 1.2 }); }); f.gauge = Math.min(100, (f.gauge || 0) + 18); f.revIdle = 0; jxSfx('laser'); } } });
const JX_ROCKET = Mv.shot({ name: 'Fishbones', desc: 'A shark rocket that explodes on impact and knocks down.', s: 16, pose: 'cast', ai: { min: 200, max: 1500, use: 'zone' },
  proj: { speed: 800, r: 14, dmg: 70, kind: 'missile', color: '#3a8aa8', explode: 90, hs: 26, kb: [400, -500], launch: true, kd: 'soft' } });
const JX_SWAP = mk({ name: 'Switcheroo!', desc: 'Swaps Pow-Pow ↔ Fishbones. Every weapon move changes with it.', pose: 'taunt', s: 5, a: 1, r: 6, ai: { min: 99999, max: 0, use: 'none' },
  ev: { 5: f => { f.jxRocket = !f.jxRocket; Game.popWorld(f.x, f.y - f.h - 30, f.jxRocket ? 'FISHBONES!' : 'POW-POW!', f.jxRocket ? '#4ad8ff' : '#ff5ac8', 20); jxSfx('clang'); } } });
const JX_ZAP = Mv.beam({ name: 'Zap!', desc: 'A slow wind-up, then a long shock bolt that slows.', s: 26, beam: { width: 14, dur: 10, dmg: 30, tick: 5, len: 1600, color: '#ff5ac8', core: '#fff', kb: [200, -60], status: { slow: 2.5 } } });
const JX_CHOMP = Mv.place({ name: 'Flame Chompers!', desc: 'Three chattering snap-traps. Step on one: snared.', s: 12, spawn: { kind: 'trap', at: 'front', dx: 160, count: 3, spacing: 70, dmg: 40, stun: 0.8, life: 6, color: '#ff7a1a', limit: 3 }, cd: 5, ai: { min: 100, max: 500, use: 'trap' } });
const JX_AIR = Mv.shot({ name: 'Rocket Jump', desc: 'Fires down and blasts herself upward.', s: 8, pose: 'cast', proj: { speed: 900, r: 12, dmg: 46, angle: 1.1, kind: 'missile', color: '#3a8aa8', explode: 70 }, ev: { 9: f => { f.vy = -700; } } });
const JX_SUPER = Sup.barrage({ name: 'Fishbones Party', desc: 'A volley of shark rockets.', volleys: 6, proj: { kind: 'missile', color: '#3a8aa8', speed: 850, dmg: 26, r: 12, explode: 60 } });
const JX_ULT = superize(mk({ name: 'SUPER MEGA DEATH ROCKET!', desc: 'A giant shark rocket: it starts slow and keeps accelerating across the stage. Blockable. Must connect.', pose: 'cast', s: 30, a: 1, r: 28,
  ev: { 2: f => { f.jxRocket = true; f.say('Get ready for... the SUPER MEGA DEATH ROCKET!', 90); }, 30: f => { Combat.addHazard({ kind: 'jinxMega', owner: f, side: f.side, x: f.x + f.facing * 70, y: f.y - 90, vx: f.facing * 180, life: 6 * FPS }); jxSfx('blast'); } } }), 300);
JX_ULT.id = 'jinx_ult'; JX_ULT.ult = { dmg: 1120, cutscene: (a, t) => csJinxMega(a, t), fx: { el: 'fire', color: '#ff5ac8' } };
Combat.hz.jinxMega = function (h) {
  const f = h.owner; if (!f) return false;
  h.vx = clamp(h.vx * 1.045, -2400, 2400); h.x += h.vx / FPS;
  if (h.t % 2 === 0) Game.fx.add({ x: h.x - Math.sign(h.vx) * 50, y: h.y + rand(-8, 8), vx: -h.vx * 0.1, vy: rand(-40, 40), life: 0.5, size: rand(8, 16), color: pick(['#ffb030', '#ff5ac8', '#888']), glow: true });
  for (const o of this.targets(h.side)) if (Math.abs(o.x - h.x) < 40 + o.w / 2 && Math.abs((o.y - o.h / 2) - h.y) < 90) {
    Combat.resolveHit(o, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: h.x - h.vx, move: JX_ULT });
    this.explode(h.x, h.y, 150, f, 0, '#ff5ac8'); Cam.shake = 20; jxSfx('boom'); return false;
  }
  return h.t < h.life && h.x > -100 && h.x < Arena.stage.width + 100;
};
Combat.drawHz.jinxMega = function (c, h, t) { c.save(); c.translate(h.x, h.y); c.scale(Math.sign(h.vx) * 2.6, 2.6); drawFishbones(c, 30, 18, t); c.restore(); };

Object.assign(JINX, {
  title: 'The Loose Cannon', side: 'VILLAIN', role: 'Zoner · Weapon swap · Chaos', color: '#ff5ac8', color2: '#1a1a3a',
  bio: 'A manic criminal genius with a minigun named Pow-Pow, a shark rocket launcher named Fishbones, and absolutely no concept of "too much". She blew up a bank once. And the one next to it. And the one next to that.',
  quote: "Rules are made to be broken... like buildings! Or people!", ending: 'Jinx paints the entire Metro City skyline pink and blue. The mayor calls it vandalism. The art critics call it her best work.',
  hp: 900, walk: 285, draw: drawJinx, drawPortrait: drawJinxPortrait, handArt: true, transformCutscene: f => csJinxArcane(f), tall: 1.02,
  gauge: { name: 'REV', max: 100, color: '#ff5ac8', label: f => (f.jxRocket ? '· FISHBONES' : '· POW-POW') },
  passive: ['Get Excited!', 'Knock the foe down or land a 6+ hit combo: 3s of extra speed and a free Switcheroo. (6s cooldown.)'],
  moves: { '5S': JX_POW, '6S': JX_ZAP, '2S': JX_CHOMP, '4S': JX_SWAP, 'jS': JX_AIR },
  super: JX_SUPER, ult: JX_ULT, ultAct: 'strike',
  form: Object.assign(JINX.form || {}, { name: 'ARCANE', desc: 'Permanent. Neon paint everywhere: REV never drops below half, Pow-Pow fires 2 extra bullets, Fishbones blasts wider.', cost: 200, dmg: 1.06, speed: 1.06, moves: undefined, timed: 0, manual: true, onStart: f => { f.gauge = Math.max(f.gauge || 0, 50); } }),
  lines: {
    intro: ['Hey {opp}! Wanna see something EXPLODE?', 'Pow-Pow says hi. Fishbones says BOOM.', "I'm crazy! Got a doctor's note!"],
    win: ['BOOM! Ha ha ha!', 'Was that too much? NAH.', 'Somebody stop me! ...No, seriously, try.'],
    taunt: ['Catch!', 'Ha ha ha!'], form: ["Let's make this PRETTY."], ult: ['Get ready for the SUPER MEGA DEATH ROCKET!'], ultHit: ['Kaboom!'], tag: ['My turn!'], enter: ["Jinx is here! Run!"], assist: ['Chompers!'], moves: ['Boom!', 'Ha!', 'Get excited!'],
  },
});
for (const [slot, m] of Object.entries(JINX.moves)) { m.id = 'jinx_' + slot; m.slot = slot; m.owner = 'jinx'; if (slot === 'jS') m.air = true; }
JX_ROCKET.id = 'jinx_5S_r'; JX_SUPER.id = 'jinx_super';
JINX.specialFor = (f, slot) => (slot === '5S' && f.jxRocket) ? JX_ROCKET : undefined;
JINX.onRoundStart = f => { f.gauge = 0; f.jxRocket = false; f.revIdle = 0; f.exciteCd = 0; };
JINX.passiveTick = f => {
  if (f.exciteCd > 0) f.exciteCd--;
  if (++f.revIdle > 40 && f.st % 2 === 0) f.gauge = Math.max(jxFloor(f), (f.gauge || 0) - 1);
  if (f.ctrl === 'cpu' && f.st % 200 === 0 && Math.random() < 0.4 && f.isActionable()) f.startMove(JX_SWAP);
};
JINX.onHit = (a, t, dmg, h) => {
  if (a.exciteCd > 0) return;
  if ((h && (h.kd || h.launch)) || t.comboHits >= 5) {
    a.exciteCd = 6 * FPS; a.status.haste = Math.max(a.status.haste || 0, 3); a.jxRocket = !a.jxRocket;
    Game.popWorld(a.x, a.y - a.h - 40, 'GET EXCITED!', '#ff5ac8', 24);
    Combat.addHazard({ kind: 'jinxTag', owner: a, side: a.side, x: a.x, y: a.y - 60, life: 40 });
  }
};
Combat.hz.jinxTag = function (h) { return h.t < h.life; };
Combat.drawHz.jinxTag = function (c, h) { const a = 1 - h.t / h.life; c.save(); c.globalAlpha = a; c.fillStyle = '#ff5ac8'; for (let i = 0; i < 10; i++) { const an = i * Math.PI / 5, r = i % 2 ? 26 : 60; c.lineTo(h.x + Math.cos(an) * r, h.y + Math.sin(an) * r); } c.fill(); bigText(c, '!!', h.x, h.y, 30, '#4ad8ff', '#000'); c.restore(); };
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('jinx:')) delete PortraitCache[k]; });

// story chapter 1 now fits the new Jinx
if (typeof STORY !== 'undefined' && STORY[0]) {
  STORY[0].pre = [['n', 'Metro City. 11:52 PM. The moon hangs low and wrong, with a hairline crack no one can explain.'], ['eric', "Midterms tomorrow. Just walk home. Don't look at the moon. Don't look at the—"], ['jinx', 'LADIES AND GENTLEMEN! Tonight the First National Bank goes... BOOM!'], ['eric', "...Of course. Of COURSE it's tonight."], ['jinx', 'Ooh! An audience! Fishbones, say hi!'], ['eric', "Please don't let the shark say hi."]];
  STORY[0].post = [['jinx', 'Ow. Ow ow ow. You hit like a... like a very large animal.'], ['eric', 'You have no idea.'], ['jinx', 'Heh. Someone else does. Someone who wants that blood of yours VERY badly. Bye-byeee!']];
}

// ---------------- cinematics ----------------
function csJinxArcane(f) {
  const d = f.def;
  return {
    name: 'ARCANE', dur: 4.0, fx: new ParticleSystem(800),
    cues: [[0, () => jxSfx('laser')], [1.4, () => jxSfx('boom')], [2.3, () => jxSfx('blast')]],
    draw(c, t) {
      c.fillStyle = '#0a0612'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < Math.min(16, Math.floor(t * 8)); i++) { const x = (i * 173) % W, y = (i * 97) % H, col = ['#ff3a8a', '#4ad8ff', '#ffd35a'][i % 3]; c.fillStyle = col; c.globalAlpha = 0.7; c.beginPath(); for (let j = 0; j < 12; j++) { const a = j * Math.PI / 6, r = (j % 2 ? 30 : 70) + (i % 3) * 10; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill(); c.globalAlpha = 1; }
      drawCharAt(c, d, W / 2, H - 30, 2.8, 1, { pose: t < 1.4 ? 'taunt' : 'victory', anim: t, transformed: t > 1.3, jxRocket: t > 2 });
      caption(c, "Let's make this PRETTY.", t, 0.1, 1.3, '#ff9ae0');
      titleSlam(c, 'ARCANE', 'JINXED!', t, 2.3, '#ff5ac8', 120);
    },
  };
}
function csJinxMega(a, opp) {
  const city = makeCineCity(18, 140, 360), baseY = H - 30, oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3, fx = new ParticleSystem(2000);
  return {
    name: 'SUPER MEGA DEATH ROCKET', dur: 6.6, fx,
    cues: [[0, () => jxSfx('laser')], [1.2, () => jxSfx('blast')], [3.8, () => { jxSfx('boom'); jxSfx('boom', 0.2); }]],
    draw(c, t) {
      City.drawSky(c, t, { top: '#1a0a2a', mid: '#4a1a5a', bot: '#ff5ac8', fullMoon: false, noMoon: true });
      drawCineCity(c, city, baseY, '#140a20');
      if (t < 1.2) { drawCharAt(c, a.def, W * 0.3, baseY - 180, 2.4, 1, { pose: 'cast', anim: t, jxRocket: true }); caption(c, 'Get ready for... the SUPER MEGA DEATH ROCKET!', t, 0.05, 1.15, '#ff9ae0'); }
      else if (t < 3.8) {
        const k = ease.in(seg(t, 1.2, 3.8)), x = lerp(W * 0.3, W * 0.7, k), y = lerp(baseY - 260, baseY - 90, k);
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.7, baseY, oppScale, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#0a0612');
        c.save(); c.translate(x, y); c.scale(3 + k * 2, 3 + k * 2); drawFishbones(c, 30, 18, t); c.restore();
        fx.add({ x: x - 150, y, vx: -200, vy: rand(-60, 60), life: 0.6, size: rand(10, 24), color: pick(['#ffb030', '#ff5ac8', '#888']), glow: true }); fx.draw(c);
        speedLines(c, t, x, y, 'rgba(255,150,220,0.4)');
      } else {
        for (const b of city) b.dead = true;
        const k = seg(t, 3.8, 5);
        c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W * 0.7, baseY - 90, 700 * ease.out(k), 'rgba(255,90,200,0.6)', 'rgba(0,0,0,0)'); c.restore();
        for (let i = 0; i < 8; i++) { c.save(); c.globalAlpha = k; c.translate(W * 0.7 + Math.cos(i) * 260 * k, baseY - 120 + Math.sin(i * 2) * 140 * k); c.fillStyle = ['#ff3a8a', '#4ad8ff', '#ffd35a'][i % 3]; c.beginPath(); for (let j = 0; j < 10; j++) { const an = j * Math.PI / 5, r = j % 2 ? 20 : 50; c.lineTo(Math.cos(an) * r, Math.sin(an) * r); } c.fill(); c.restore(); }
        flashAt(c, t, 3.8, 4.2, '#fff0fa');
        if (t > 4.4) titleSlam(c, 'BOOM!', 'SUPER MEGA DEATH ROCKET!', t, 4.5, '#ff5ac8', 130);
      }
    },
  };
}
