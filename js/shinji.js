// ============================================================
//  MOONKAI — SHINJI HIRAKO, the Visored Captain (Bleach tribute), fighter #70.
//
//  GAUGE   · HOLLOW   the Hollow inside him stirs with every hit he trades. Full: ↓I puts on
//                    the MASK for 8s: +20% damage, and his Kido becomes a CERO.
//  PASSIVE · SAKANADE'S SCENT  the scent of his blade lingers: every third hit he lands turns the
//                    foe's world upside down: left is right, right is left (2.5s). Blocking
//                    means holding the wrong way.
//  SAKANADE (5I)     releases his zanpakuto: the ring pommel spins and a sweet-smelling mist
//                    rolls out; anyone inside is INVERTED.
//  SUPER · SAKASAMA NO SEKAI  the inverted world: for 6s the foe is inverted and every hit he lands
//                    counts as coming from behind (+30%).
//  CERO              ultimate: the mask forms, a red Cero charges at his mouth for a slow
//                    second, then fires across the stage. Blockable. Must connect.
// ============================================================
const sjSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const SJ_PAL = { build: 'slim', skin: '#f0d8c0', top: '#141414', topDark: '#0a0a0a', pants: '#141414', pantsDark: '#0a0a0a', boots: '#f0f0f0', belt: '#f0f0f0', glove: '#f0d8c0', noHead: true, sleeves: '#141414' };
const sjInvert = (t, s) => { if (!t || t.state === 'ko') return; const was = t.status.confuse > 0; t.status.confuse = Math.max(t.status.confuse || 0, s); if (!was) { Game.popWorld(t.x, t.y - t.h - 40, 'INVERTED', '#ffd35a', 22); sjSfx('tone', 900, 0.3, 'sine', 0.05, 300); } };
const sjMasked = f => f.form || f.sjMask > 0;

function drawSakanade(c, x, y, ang, spin, glow) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.fillStyle = '#1a1a1a'; c.fillRect(-16, -3, 18, 6);
  c.save(); c.translate(-22, 0); c.rotate(spin); c.strokeStyle = '#ffd35a'; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.stroke(); c.restore();   // the ring pommel
  c.fillStyle = '#ffd35a'; c.beginPath(); c.ellipse(3, 0, 3, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#dde'; c.strokeStyle = '#333'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(6, -2.5); c.lineTo(112, -2); c.lineTo(122, 0); c.lineTo(112, 2); c.lineTo(6, 2.5); c.closePath(); c.fill(); c.stroke();
  if (glow) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,220,120,${glow})`; c.lineWidth = 5; c.beginPath(); c.moveTo(8, 0); c.lineTo(120, 0); c.stroke(); }
  c.restore();
}
function drawShinjiMask(c, hx, hy, s) {
  c.save(); c.translate(hx, hy); c.scale(s, s);
  c.fillStyle = '#f4f0e8'; c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-10, -12); c.lineTo(12, -12); c.lineTo(14, 4); c.lineTo(8, 14); c.lineTo(-6, 14); c.lineTo(-11, 2); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1a1a1a'; c.beginPath(); c.moveTo(-1, -6); c.lineTo(10, -5); c.lineTo(8, 0); c.lineTo(0, -1); c.closePath(); c.fill();                              // eye slit
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 6, -3, 5, 'rgba(255,220,60,1)', 'rgba(0,0,0,0)'); c.restore();
  c.strokeStyle = '#1a1a1a'; c.lineWidth = 1; c.beginPath(); c.moveTo(-4, 8); c.lineTo(12, 7); c.stroke(); for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-3 + i * 2.8, 5); c.lineTo(-3 + i * 2.8, 11); c.stroke(); }   // the long row of teeth
  c.fillStyle = '#8a1a1a'; c.fillRect(-10, -12, 22, 2);
  c.restore();
}
function drawShinji(c, v) {
  const t = v.anim || 0, M = sjMasked(v), m = v.move;
  drawHumanoid(c, v, SJ_PAL, {
    back(c, P) { // white captain's haori
      c.fillStyle = '#f4f4f0'; c.strokeStyle = '#8a8a88'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(P.sh[0] - 12, P.sh[1]); c.lineTo(P.sh[0] - 30, P.hip[1] + 56 + Math.sin(t * 2) * 3); c.lineTo(P.sh[0] + 6, P.hip[1] + 52); c.lineTo(P.sh[0] + 8, P.sh[1] + 4); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#1a1a1a'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(P.sh[0] - 28 + i * 9, P.hip[1] + 44); c.lineTo(P.sh[0] - 24 + i * 9, P.hip[1] + 52); c.stroke(); }
    },
    head(c, P) {
      const [hx, hy] = P.head;
      shadedHead(c, hx, hy, 10.5, '#f0d8c0');
      // the straight blond bob with blunt bangs
      c.fillStyle = '#f0d060'; c.strokeStyle = '#a08a30'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(hx - 13, hy + 10); c.lineTo(hx - 13, hy - 6); c.quadraticCurveTo(hx - 10, hy - 16, hx + 2, hy - 15); c.quadraticCurveTo(hx + 13, hy - 13, hx + 13, hy - 4); c.lineTo(hx + 12, hy - 4); c.lineTo(hx + 12, hy - 6); c.lineTo(hx - 2, hy - 6); c.lineTo(hx - 6, hy + 10); c.closePath(); c.fill(); c.stroke();
      if (M) { drawShinjiMask(c, hx + 2, hy, 0.95); return; }
      c.strokeStyle = '#2a1a10'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(hx + 3, hy - 2); c.quadraticCurveTo(hx + 7, hy - 4, hx + 11, hy - 2); c.stroke();          // lazy half-lidded eye
      circle(c, hx + 7, hy - 1, 1.1, '#6a4a20');
      c.fillStyle = '#fff'; c.fillRect(hx + 2, hy + 4, 10, 3.5); c.strokeStyle = '#6a4a3a'; c.lineWidth = 0.7; c.strokeRect(hx + 2, hy + 4, 10, 3.5); for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(hx + 2 + i * 2, hy + 4); c.lineTo(hx + 2 + i * 2, hy + 7.5); c.stroke(); }   // the famous toothy grin
    },
    front(c, P) {
      const spin = m && m.name === 'Sakanade' ? t * 30 : t * 2;
      const ang = { punch: 0, heavy: 0.6, dash: 0.1, uppercut: -1.4, air_spike: 1.3, hurt: 2.1, victory: -0.3, intro: 1.3, cast: -0.4 }[v.pose] ?? 1.35;
      drawSakanade(c, P.fH[0], P.fH[1], ang, spin, M ? 0.4 : 0);
    },
  });
}
function drawShinjiPortrait(c, opts) {
  const M = !!opts.form;
  c.fillStyle = M ? '#0a0a0a' : '#1a1410'; c.fillRect(0, 0, 100, 100);
  // an upside-down world behind him: the horizon on top
  c.fillStyle = '#2a2018'; c.fillRect(0, 0, 100, 16); for (let i = 0; i < 6; i++) { c.fillStyle = '#3a2a20'; c.fillRect(8 + i * 16, 16, 8, 8 + (i % 3) * 6); }
  c.fillStyle = '#f4f4f0'; c.beginPath(); c.moveTo(4, 100); c.lineTo(20, 76); c.lineTo(80, 76); c.lineTo(96, 100); c.fill();
  c.fillStyle = '#141414'; c.beginPath(); c.moveTo(38, 100); c.lineTo(46, 76); c.lineTo(54, 76); c.lineTo(62, 100); c.fill();
  c.fillStyle = '#f0d8c0'; c.strokeStyle = '#6a4a3a'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(36, 38); c.lineTo(64, 38); c.lineTo(64, 56); c.lineTo(57, 70); c.lineTo(43, 70); c.lineTo(36, 56); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#f0d060'; c.strokeStyle = '#a08a30'; c.beginPath(); c.moveTo(24, 76); c.lineTo(24, 36); c.quadraticCurveTo(30, 16, 50, 16); c.quadraticCurveTo(70, 16, 76, 36); c.lineTo(76, 76); c.lineTo(66, 76); c.lineTo(66, 42); c.lineTo(34, 42); c.lineTo(34, 76); c.closePath(); c.fill(); c.stroke();
  if (M) { drawShinjiMask(c, 50, 56, 2.1); return; }
  for (const s of [-1, 1]) { c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(50 + s * 4, 50); c.quadraticCurveTo(50 + s * 9, 47, 50 + s * 14, 50); c.stroke(); circle(c, 50 + s * 9, 51, 1.6, '#6a4a20'); }
  c.fillStyle = '#fff'; c.fillRect(38, 58, 24, 7); c.strokeStyle = '#6a4a3a'; c.lineWidth = 1; c.strokeRect(38, 58, 24, 7); for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(38 + i * 3, 58); c.lineTo(38 + i * 3, 65); c.stroke(); }
  drawSakanade(c, 92, 94, -2.2, 0, 0);
}

// ---------------- kit ----------------
const SJ_SAKANADE = mk({ name: 'Sakanade', desc: 'Releases his zanpakuto: the ring spins and a sweet mist rolls out in front. Anyone inside is INVERTED.', pose: 'cast', s: 14, a: 1, r: 18, ai: { min: 100, max: 500, use: 'zone' },
  ev: { 2: f => f.say('Collapse, Sakanade.', 50), 14: f => { Combat.addHazard({ kind: 'sjMist', owner: f, side: f.side, x: f.x + f.facing * 180, r: 150, life: 150 }); sjSfx('tone', 600, 0.5, 'sine', 0.04, 1200); } } });
const SJ_SHUNPO = Mv.rush({ name: 'Shunpo Slash', desc: 'A flash step that cuts straight through.', s: 5, speed: 1800, frames: 10, pass: true, inv: [1, 14], hit: { dmg: 80, kb: [150, -300] } });
const SJ_MASK = mk({ name: 'Hollowfication', desc: 'With a full HOLLOW gauge: puts on the mask for 8s (+20% damage, Kido becomes a Cero).', pose: 'charge', s: 16, a: 1, r: 14, ai: { min: 0, max: 2000, use: 'buff' },
  ev: { 16: f => { if ((f.gauge || 0) < 100) { Game.popWorld(f.x, f.y - f.h - 30, 'THE HOLLOW SLEEPS', '#aab', 16); return; } f.gauge = 0; f.sjMask = 8 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'HOLLOWFICATION', '#ffd35a', 24); f.say('Don\'t get the wrong idea.', 70); sjSfx('roar'); Cam.shake = 8; } } });
const SJ_SHAKKAHO = Mv.shot({ name: 'Hado #31: Shakkaho', desc: 'A red fireball of Kido. Masked: a CERO beam instead.', s: 12, proj: { speed: 900, r: 16, dmg: 62, kind: 'fire', color: '#ff4a2a', life: 1.4 } });
const SJ_CERO = Mv.beam({ name: 'Cero', desc: 'Masked: a red Cero from the mask.', s: 14, beam: { len: 900, width: 40, dur: 20, dmg: 14, color: '#ff2a2a', from: 'mouth' } });
const SJ_DROP = Mv.dive({ name: 'Shunpo Drop', desc: 'Drops from above, sword first.', vx: 700, vy: 1100, hit: { dmg: 85 } });
const SJ_SUPER = superize(mk({ name: 'Sakasama no Sekai', desc: 'The inverted world: for 6s the foe is INVERTED and every hit he lands counts as coming from behind (+30%).', pose: 'cast', s: 14, a: 6, r: 18,
  ev: { 2: f => f.say('Welcome to the inverted world.', 80), 14: f => { f.sjWorld = 6 * FPS; if (f.opp) sjInvert(f.opp, 6); Combat.addHazard({ kind: 'sjWorld', owner: f, side: f.side, life: 6 * FPS }); sjSfx('bell'); } } }), 100);
const SJ_ULT = superize(mk({ name: 'CERO', desc: 'The mask forms and a red Cero charges at his mouth for a slow second, then fires across the stage. Blockable. Must connect.', pose: 'cast', s: 60, a: 30, r: 26,
  ev: { 1: f => { f.sjUltMask = true; f.say('...', 40); sjSfx('charge', 1); }, 60: f => { Combat.fireBeam(f, { len: 2400, width: 90, dur: 30, dmg: 6, tick: 6, super: true, ultConnect: true, color: '#ff2a2a', from: 'mouth' }); Cam.shake = 12; }, 90: f => { f.sjUltMask = false; } } }), 300);
SJ_ULT.id = 'shinji_ult'; SJ_ULT.recoverWhiff = 40;
SJ_ULT.ult = { dmg: 1150, cutscene: (a, t) => csShinjiCero(a, t), fx: { el: 'void', color: '#ff2a2a' } };

const shinji = fighter({
  id: 'shinji', name: 'SHINJI', title: 'The Visored Captain', side: 'ANTI-HERO', role: 'Inversion · Trickster · Hollow', color: '#ffd35a', color2: '#141414',
  bio: 'A captain who was turned half-Hollow, exiled, and came back anyway. He looks bored. He grins with too many teeth. His sword makes the world run backwards, and he knows exactly where you will actually go.',
  quote: 'Up is down, left is right. Welcome to my world.',
  ending: 'Shinji opens a jazz bar in Metro City. The sign is upside down. Nobody who fights him ever finds the door on the first try.',
  hp: 980, walk: 270, rival: 'yhwach', handArt: true, draw: (c, v) => { if (v.sjUltMask) v.sjMask = Math.max(v.sjMask || 0, 1); drawShinji(c, v); }, drawPortrait: drawShinjiPortrait, transformCutscene: f => csShinjiVisored(f),
  weaponTip: 125,
  model: { skin: '#f0d8c0' }, face: { expr: 'grin' }, style: { reach: 1.2, weapon: true, speed: 1.0 },
  gauge: { name: 'HOLLOW', max: 100, color: '#ffd35a', label: f => (f.sjMask > 0 ? '· MASKED' : (f.gauge || 0) >= 100 ? '· ↓I MASK' : '') },
  passive: ['Sakanade\'s Scent', 'Every third hit he lands turns the foe\'s world upside down for 2.5s: left is right, right is left.'],
  moves: { '5S': SJ_SAKANADE, '6S': SJ_SHUNPO, '2S': SJ_MASK, '4S': SJ_SHAKKAHO, 'jS': SJ_DROP },
  super: SJ_SUPER, ult: SJ_ULT,
  form: { name: 'VISORED', desc: 'Permanent. The full Hollow mask: +damage, his Kido is always a Cero, and HOLLOW fills twice as fast.', cost: 200, dmg: 1.1, speed: 1.05 },
  assist: '5S',
  lines: {
    intro: ['Ah, what a drag. Let\'s get this over with, {opp}.', 'Don\'t look at the sword. Look at me. Wait, no—', 'You\'re facing the wrong way. Oh, you\'re not? Ha.'],
    win: ['Told ya. Upside down.', 'Nothing personal.', 'That was a pain.'],
    taunt: ['Yo.', 'Bored now.'], form: ['Don\'t get the wrong idea.'], ult: ['Cero.'], ultHit: ['Ah. Overdid it.'], tag: ['Your turn.'], enter: ['Yo.'], assist: ['Collapse.'], moves: ['Collapse, Sakanade.', 'Wrong way.', 'Too slow.'],
  },
});
shinji.ult = SJ_ULT; shinji.ultAct = 'beam'; SJ_SUPER.id = 'shinji_super';
for (const [slot, m] of Object.entries(shinji.moves)) { m.id = 'shinji_' + slot; m.slot = slot; m.owner = 'shinji'; if (slot === 'jS') m.air = true; }
SJ_CERO.id = 'shinji_4S';
shinji.specialFor = (f, slot) => (slot === '4S' && sjMasked(f) ? SJ_CERO : undefined);
shinji.passiveDmg = (f, t) => (sjMasked(f) ? 1.2 : 1) * (f.sjWorld > 0 ? 1.3 : 1);
shinji.onRoundStart = f => { f.gauge = 0; f.sjMask = 0; f.sjWorld = 0; f.sjCount = 0; f.sjUltMask = false; };
shinji.onHit = (a, t, dmg) => { a.gauge = Math.min(100, (a.gauge || 0) + dmg * (a.form ? 0.16 : 0.08)); if (++a.sjCount % 3 === 0) sjInvert(t, 2.5); };
shinji.onHurt = (t, a, dmg) => { t.gauge = Math.min(100, (t.gauge || 0) + dmg * 0.05); };
shinji.passiveTick = f => { if (f.sjMask > 0) f.sjMask--; if (f.sjWorld > 0) { f.sjWorld--; if (f.opp && f.sjWorld > 0) f.opp.status.confuse = Math.max(f.opp.status.confuse || 0, 0.1); } };
Combat.hz.sjMist = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < h.r && t.y > -220) { sjInvert(t, 2.5); if (!h.hit) { h.hit = true; Combat.resolveHit(t, f, H_({ dmg: 30, guard: 'mid', hs: 10, kb: [0, -40], sfx: 'm' }), { proj: true, fromX: h.x, move: SJ_SAKANADE }); } }
  return h.t < h.life;
};
Combat.drawHz.sjMist = (c, h) => {
  const fade = Math.min(1, h.t / 10, (h.life - h.t) / 20);
  c.save(); c.globalAlpha = 0.5 * fade;
  for (let i = 0; i < 10; i++) { const x = h.x + Math.sin(h.t * 0.03 + i) * h.r * 0.7, y = -40 - (i % 4) * 40 - Math.cos(h.t * 0.04 + i * 2) * 10; glowCircle(c, x, y, 50, 'rgba(255,200,230,0.6)', 'rgba(255,200,230,0)'); }
  c.restore();
};
Combat.hz.sjWorld = h => h.t < h.life && h.owner && h.owner.state !== 'ko';
Combat.drawHz.sjWorld = (c, h) => {
  // the sky pulls down and the ground climbs: faint upside-down city on the ceiling
  const fade = Math.min(1, h.t / 15, (h.life - h.t) / 15); c.save(); c.globalAlpha = 0.25 * fade; c.fillStyle = '#3a2a18';
  for (let i = 0; i < 20; i++) { const x = i * 180 + ((h.t * 0.3) % 180); c.fillRect(x, -900, 80, 120 + (i % 4) * 60); }
  c.restore();
};

// ---------------- cinematics ----------------
function csShinjiVisored(f) {
  const d = f.def;
  return {
    name: 'VISORED', dur: 3.8, fx: new ParticleSystem(400),
    cues: [[0.1, () => sjSfx('heartbeat')], [1.2, () => sjSfx('roar')], [2.1, () => { sjSfx('boom'); }]],
    draw(c, t) {
      c.fillStyle = '#0a0a0a'; c.fillRect(0, 0, W, H);
      if (t < 2.1) {
        // his hand drags down across his face and the mask forms behind it
        const k = ease.out(seg(t, 0.3, 1.8));
        c.save(); c.translate(W / 2, H / 2); c.scale(9, 9);
        c.fillStyle = '#f0d8c0'; c.beginPath(); c.ellipse(0, 0, 12, 15, 0, 0, Math.PI * 2); c.fill();
        c.save(); c.beginPath(); c.rect(-20, -20, 40, 40 * k); c.clip(); drawShinjiMask(c, 0, 0, 1.3); c.restore();
        c.fillStyle = '#f0d8c0'; c.fillRect(-14, -18 + 34 * k, 28, 6);                                                     // the hand
        c.restore();
        caption(c, 'Don\'t get the wrong idea.', t, 0.2, 2, '#ffd35a');
      } else {
        drawCharAt(c, d, W / 2, H - 40, 2.7, 1, { pose: 'victory', anim: t, transformed: true, sjMask: 1 });
        flashAt(c, t, 2.1, 2.4, '#ffd35a');
        titleSlam(c, 'VISORED', 'HALF HOLLOW', t, 2.2, '#ffd35a', 100);
      }
    },
  };
}
function csShinjiCero(a, opp) {
  const fx = new ParticleSystem(1200), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'CERO', dur: 6.2, fx,
    cues: [[0, () => sjSfx('charge', 1)], [2.6, () => { sjSfx('boom'); sjSfx('beam') || sjSfx('boom', 0.2); }]],
    draw(c, t) {
      // everything is upside down: the ground is at the top of the screen
      c.save(); c.translate(0, H); c.scale(1, -1);
      c.fillStyle = '#0a0808'; c.fillRect(0, 0, W, H); c.fillStyle = '#2a1a14'; c.fillRect(0, H - 60, W, 60);
      silhouette(c, o => drawCharAt(o, opp.def, W * 0.72, H - 60, oppScale, -1, { pose: t < 2.6 ? 'block' : 'hurt', anim: t, transformed: opp.transformed }), '#2a1010');
      drawCharAt(c, a.def, W * 0.22, H - 60, 2.4, 1, { pose: 'cast', anim: t, sjMask: 1 });
      c.restore();
      const mx = W * 0.3, my = 60 + 2.4 * 100;
      if (t < 2.6) { const k = seg(t, 0.2, 2.6); c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, mx, my, 20 + 80 * k, 'rgba(255,40,40,1)', 'rgba(0,0,0,0)'); c.restore(); caption(c, 'Up is down. Left is right.', t, 0.3, 1.5, '#ffd35a'); caption(c, '...Cero.', t, 1.7, 2.5, '#ffd35a'); }
      else {
        const w = 160 * (1 - seg(t, 4, 5.4)); c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, my - w, 0, my + w); g.addColorStop(0, 'rgba(255,40,40,0)'); g.addColorStop(0.5, 'rgba(255,220,220,1)'); g.addColorStop(1, 'rgba(255,40,40,0)'); c.fillStyle = g; c.fillRect(mx, my - w, W, w * 2); c.restore();
        if (t < 2.8) for (let i = 0; i < 40; i++) fx.add({ x: W * 0.72, y: my, vx: rand(-200, 1200), vy: rand(-600, 600), life: 1, size: rand(4, 10), color: pick(['#ff2a2a', '#ffd0d0', '#300']) });
        fx.draw(c); flashAt(c, t, 2.6, 2.9, '#fff');
        if (t > 4.2) titleSlam(c, 'CERO', 'WELCOME TO THE INVERTED WORLD', t, 4.3, '#ff2a2a', 100);
      }
    },
  };
}
rival('shinji', 'yhwach', [[0, 'So you\'re the old man who sees the future. Bet you didn\'t see it upside down.'], [1, 'I see every future, Visored. Even the inverted ones.']],
  { shinji: 'Guess you looked the wrong way.', yhwach: 'Your world returns to its proper orientation.' });
rival('shinji', 'kael', [[0, 'Somethin\' inside you wants out, huh? I know the feelin\'.'], [1, 'How do you keep it in?'], [0, 'I don\'t. I put a mask on it.']],
  { shinji: 'Don\'t let it drive, kid.', kael: 'Maybe I should get a mask.' });
