// ============================================================
//  MOONKAI — SHINJI HIRAKO, the Visored Captain (Bleach tribute). Remade in the pixel engine.
//
//  GAUGE   · HOLLOW   the Hollow inside him stirs with every hit he trades. Full: ↓I puts on the MASK
//                    for 8s: +20% damage, Kido becomes a CERO, and his dash becomes a clawing pounce.
//  PASSIVE · SAKANADE'S SCENT  every third hit he lands turns the foe's world upside down:
//                    left is right, right is left (2.5s).
//  SAKANADE (5I)     the ring pommel spins and a sweet pink mist rolls out; anyone inside is INVERTED.
//  GHOST CUT (→I)    a flash step that cuts straight through. For a moment he is *behind* you:
//                    the next hit counts as a back-attack (+30%) and inverts the foe.
//  SUPER · SAKASAMA NO SEKAI  the inverted world: 6s of inversion, every hit +30%.
//  CERO              ultimate: the world flips right-side up as the mask forms, and a Cero
//                    charges at his mouth for a slow second. Blockable. Must connect.
// ============================================================
const sjSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const SJ_PAL = { build: 'slim', skin: '#f0d8c0', top: '#141414', topDark: '#0a0a0a', pants: '#141414', pantsDark: '#0a0a0a', boots: '#f0f0f0', belt: '#f0f0f0', glove: '#f0d8c0', noHead: true, sleeves: '#141414' };

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


// ---------------- pixel art ----------------
const sjQ = (x, k = 4) => Math.round(x * k) / k;
const sjM = v => !!(v.form || v.transformed || v.sjMask > 0 || v.sjUltMask);
const SHINPX = PixelArt.make({
  id: 'shinji', win: [-150, -255, 340, 300], B: 1.06, trail: 'rgba(255,211,90,',
  state(v, t, st) {
    const M = sjM(v), m = v.move, mist = m && m.name === 'Sakanade';
    const tgt = ({ punch: 0, heavy: .6, dash: .1, uppercut: -1.4, air_spike: 1.3, hurt: 2.1, victory: -.3, intro: 1.3, cast: -.4 })[v.pose] ?? 1.35;
    return { M, hn: v.form || v.transformed ? 1 : 0, ang: Math.round(SHINPX.ease(st, 'ang', tgt) * 30) / 30, spin: Math.round(((mist ? t * 30 : t * 2) % 6.283) * 8) / 8, hair: sjQ(Math.sin(t * 3) * .8), haori: sjQ(Math.sin(t * 2.2) * 3, 2), glow: M ? .4 : 0 };
  },
  body(g, P, s) {
    const M = s.M, info = {};
    const blk = ['#1a1a1c', '#0c0c0e'], blkF = ['#0c0c0e', '#060607'], skin = ['#f0d8c0', '#c9a98e'], skinF = ['#c9a98e', '#a2826a'];
    g.humanoid(P, { limb: .95, bulk: .92, hips: .95, noHead: true, skin, skinFar: skinF, top: blk, topFar: blkF, pants: blk, pantsFar: blkF, boots: ['#f4f4f0', '#b8b8b0'], bootsFar: ['#b8b8b0', '#8a8a84'], belt: ['#f4f4f0', '#b8b8b0'], glove: skin, gloveFar: skinF }, {
      back(P) { // the white captain's haori, black-edged at the hem
        const [sx, sy] = P.sh, hy = P.hip[1];
        g.paint([g.poly([[sx - 12, sy], [sx - 30, hy + 56 + s.haori], [sx + 6, hy + 52], [sx + 8, sy + 4]])], '#f6f6f2', '#b4b4ae');
        for (let i = 0; i < 4; i++) g.line([[sx - 28 + i * 9, hy + 46], [sx - 24 + i * 9, hy + 54]], '#1a1a1c', 1.2);
        g.line([[sx - 30, hy + 55 + s.haori], [sx + 6, hy + 51]], '#1a1a1c', 1.6);
      },
      head(P) {
        const [hx, hy] = P.head;
        g.paint([g.ell(hx, hy, 10.5, 10.5)], ...skin);
        // the straight blond bob with blunt bangs
        g.paint([g.shape([['M', hx - 13, hy + 10], ['L', hx - 13, hy - 6], ['Q', hx - 10, hy - 16, hx + 2, hy - 15], ['Q', hx + 13, hy - 13, hx + 13, hy - 4], ['L', hx + 12, hy - 4], ['L', hx + 12, hy - 6], ['L', hx - 2, hy - 6], ['L', hx - 6 + s.hair, hy + 10]])], '#f4d868', '#b8982c');
        if (M) { // the hollow mask: bone white, blood-red stripes, a horn on the visored form
          g.paint([g.poly([[hx - 8, hy - 12], [hx + 14, hy - 12], [hx + 16, hy + 4], [hx + 10, hy + 14], [hx - 4, hy + 14], [hx - 9, hy + 2]])], '#f6f2ea', '#bdb6a6');
          if (s.hn) g.paint([g.shape([['M', hx - 4, hy - 12], ['Q', hx - 14, hy - 26, hx - 4, hy - 34], ['Q', hx - 8, hy - 24, hx + 2, hy - 12]])], '#f6f2ea', '#bdb6a6');
          g.fill(g.poly([[hx + 1, hy - 6], [hx + 12, hy - 5], [hx + 10, hy], [hx + 2, hy - 1]]), '#0a0a0a');
          g.fill(g.poly([[hx - 8, hy - 12], [hx + 14, hy - 12], [hx + 14, hy - 10], [hx - 8, hy - 10]]), '#a01818');
          g.line([[hx + 2, hy - 10], [hx + 6, hy - 3]], '#a01818', 1.4); g.line([[hx + 11, hy - 9], [hx + 9, hy - 4]], '#a01818', 1.4);
          g.line([[hx - 3, hy + 8], [hx + 12, hy + 7]], '#1a1a1c', 1.2); for (let i = 0; i < 6; i++) g.line([[hx - 2 + i * 2.8, hy + 5], [hx - 2 + i * 2.8, hy + 11]], '#1a1a1c', 1);
          info.eye = [hx + 7, hy - 3];
        } else { // lazy half-lidded eye and the famous toothy grin
          g.line([[hx + 3, hy - 2], [hx + 7, hy - 4], [hx + 11, hy - 2]], '#2a1a10', 1.4, true); g.fill(g.ell(hx + 7, hy - 1, 1.2, 1.2), '#6a4a20');
          g.fill(g.poly([[hx + 2, hy + 4], [hx + 12, hy + 4], [hx + 12, hy + 7.5], [hx + 2, hy + 7.5]]), '#ffffff');
          for (let i = 1; i < 5; i++) g.line([[hx + 2 + i * 2, hy + 4], [hx + 2 + i * 2, hy + 7.5]], '#8a6a5a', .7);
        }
      },
      front(P) { // SAKANADE: ring pommel, golden guard, straight blade
        const [hx, hy] = P.fH, a = s.ang, ca = Math.cos(a), sa = Math.sin(a), pt = (u, w) => [hx + ca * u - sa * w, hy + sa * u + ca * w];
        g.paint([g.poly([pt(-16, -3), pt(2, -3), pt(2, 3), pt(-16, 3)])], '#1c1c1e', '#09090a');
        const ring = []; for (let i = 0; i < 10; i++) { const q = s.spin + i / 10 * 6.283; ring.push(pt(-22 + Math.cos(q) * 7, Math.sin(q) * 7)); } ring.push(ring[0]);
        g.line(ring, '#ffd35a', 2.2); g.fill(g.ell(...pt(-22 + Math.cos(s.spin) * 7, Math.sin(s.spin) * 7), 1.6, 1.6), '#fff2b0');
        g.fill(g.ell(...pt(3, 0), 3, 7, a), '#ffd35a');
        g.paint([g.poly([pt(6, -2.5), pt(112, -2), pt(122, 0), pt(112, 2), pt(6, 2.5)])], '#e8ecf2', '#9aa2b0');
        if (M) g.line([pt(10, 0), pt(118, 0)], '#ffd9a0', 1.4);
        info.tip = pt(120, 0);
      },
    });
    return info;
  },
  pre(c, v, P, s) { if (s.M) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -75, s.hn ? 120 : 90, s.hn ? 'rgba(220,40,30,0.22)' : 'rgba(255,200,80,0.14)', 'rgba(0,0,0,0)'); c.restore(); } },
  post(c, v, P, s, info) {
    const t = v.anim || 0;
    c.save(); c.globalCompositeOperation = 'lighter';
    if (s.M && info && info.eye) glowCircle(c, info.eye[0], info.eye[1], 7, 'rgba(255,220,60,1)', 'rgba(0,0,0,0)');
    if (s.hn) for (let i = 0; i < 6; i++) { const a = t * 3 + i * 1.05, r = 36 + (i % 3) * 8; c.fillStyle = i % 2 ? 'rgba(255,50,40,0.8)' : 'rgba(40,0,10,0.9)'; c.fillRect(Math.round(P.sh[0] + Math.cos(a) * r), Math.round(P.sh[1] + 20 + Math.sin(a) * r * .8), 4, 4); }
    if (v.move && v.move.name === 'Sakanade' && info && info.tip) glowCircle(c, info.tip[0], info.tip[1], 14, 'rgba(255,190,230,0.7)', 'rgba(0,0,0,0)');
    c.restore();
  },
});
const sjPortrait = PxKit.portrait('shinji', drawShinjiPortrait, { res: 64, levels: 8, dither: 0.3 });

// ---------------- kit ----------------
const sjInvert = (t, s) => { if (!t || t.state === 'ko') return; const was = t.status.confuse > 0; t.status.confuse = Math.max(t.status.confuse || 0, s); if (!was) { Game.popWorld(t.x, t.y - t.h - 40, 'INVERTED', '#ffd35a', 22); sjSfx('shiSync'); } };
const sjMasked = f => f.form || f.sjMask > 0;
const SJ_SAKANADE = mk({ name: 'Sakanade', desc: 'Releases his zanpakuto: the ring spins and a sweet mist rolls out in front. Anyone inside is INVERTED.', pose: 'cast', s: 14, a: 1, r: 18, ai: { min: 100, max: 500, use: 'zone' },
  ev: { 2: f => { f.say('Collapse, Sakanade.', 50); sjSfx('shiSync'); }, 14: f => { Combat.addHazard({ kind: 'sjMist', owner: f, side: f.side, x: f.x + f.facing * 180, r: 150, life: 150 }); } } });
const SJ_SHUNPO = Mv.rush({ name: 'Ghost Cut', desc: 'A flash step that cuts straight through. For a moment he is behind you: the next hit counts as a back-attack (+30%) and inverts the foe.', s: 5, speed: 1800, frames: 10, pass: true, inv: [1, 14], hit: { dmg: 80, kb: [150, -300] },
  ev: { 1: f => { Combat.addHazard({ kind: 'sjGhost', owner: f, side: f.side, x: f.x, life: 26 }); sjSfx('shiSlash'); }, 16: f => { f.sjBehind = 70; Game.popWorld(f.x, f.y - f.h - 24, 'BEHIND YOU', '#ffd35a', 16); } } });
const SJ_POUNCE = Mv.rush({ name: 'Hollow Pounce', desc: 'Masked: a feral lunge that rakes the foe open (bleed).', s: 6, speed: 1500, frames: 12, hit: { dmg: 74, kb: [320, -240], status: { bleed: 3 } }, ev: { 1: () => sjSfx('shiHowl', 0, 0.8) } });
const SJ_MASK = mk({ name: 'Hollowfication', desc: 'With a full HOLLOW gauge: puts on the mask for 8s (+20% damage, Kido becomes a Cero, dash becomes a pounce).', pose: 'charge', s: 16, a: 1, r: 14, ai: { min: 0, max: 2000, use: 'buff' },
  ev: { 16: f => { if ((f.gauge || 0) < 100) { Game.popWorld(f.x, f.y - f.h - 30, 'THE HOLLOW SLEEPS', '#aab', 16); return; } f.gauge = 0; f.sjMask = 8 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'HOLLOWFICATION', '#ffd35a', 24); f.say('Don\'t get the wrong idea.', 70); sjSfx('shiBerserk'); Cam.shake = 8; } } });
const SJ_SHAKKAHO = Mv.shot({ name: 'Hado #31: Shakkaho', desc: 'A red fireball of Kido. Masked: a CERO beam instead.', s: 12, proj: { speed: 900, r: 16, dmg: 62, kind: 'fire', color: '#ff4a2a', life: 1.4 }, ev: { 3: () => sjSfx('shiSync') } });
const SJ_CERO = Mv.beam({ name: 'Cero', desc: 'Masked: a red Cero from the mask.', s: 14, beam: { len: 900, width: 40, dur: 20, dmg: 14, color: '#ff2a2a', from: 'mouth' }, ev: { 3: () => sjSfx('shiHowl', 0, 0.9), 14: () => sjSfx('beam', 0.4) } });
const SJ_DROP = Mv.dive({ name: 'Shunpo Drop', desc: 'Drops from above, sword first.', vx: 700, vy: 1100, hit: { dmg: 85 } });
const SJ_SUPER = superize(mk({ name: 'Sakasama no Sekai', desc: 'The inverted world: for 6s the foe is INVERTED and every hit he lands counts as coming from behind (+30%).', pose: 'cast', s: 14, a: 6, r: 18,
  ev: { 2: f => { f.say('Welcome to the inverted world.', 80); sjSfx('shiSync'); }, 14: f => { f.sjWorld = 6 * FPS; if (f.opp) sjInvert(f.opp, 6); Combat.addHazard({ kind: 'sjWorld', owner: f, side: f.side, life: 6 * FPS }); sjSfx('bell'); sjSfx('riser', 0.8, 0.14, 0, 200, 1500); } } }), 100);
const SJ_ULT = superize(mk({ name: 'CERO', desc: 'The world flips right-side up as the mask forms, and a red Cero charges at his mouth for a slow second, then fires across the stage. Blockable. Must connect.', pose: 'cast', s: 60, a: 30, r: 26,
  ev: { 1: f => { f.sjUltMask = true; f.say('...', 40); sjSfx('riser', 2, 0.2, 0, 90, 900); }, 60: f => { Combat.fireBeam(f, { len: 2400, width: 90, dur: 30, dmg: 6, tick: 6, super: true, ultConnect: true, color: '#ff2a2a', from: 'mouth' }); Cam.shake = 12; sjSfx('shiRoar'); }, 90: f => { f.sjUltMask = false; } } }), 300);
SJ_ULT.id = 'shinji_ult'; SJ_ULT.recoverWhiff = 40;
SJ_ULT.ult = { dmg: 1150, cutscene: (a, t) => csShinjiCero(a, t), fx: { el: 'void', color: '#ff2a2a' } };

const shinji = fighter({
  id: 'shinji', name: 'SHINJI', title: 'The Visored Captain', side: 'ANTI-HERO', role: 'Inversion · Trickster · Hollow', color: '#ffd35a', color2: '#141414',
  bio: 'A captain who was turned half-Hollow, exiled, and came back anyway. He looks bored. He grins with too many teeth. His sword makes the world run backwards, and he knows exactly where you will actually go.',
  quote: 'Up is down, left is right. Welcome to my world.',
  ending: 'Shinji opens a jazz bar in Metro City. The sign is upside down. Nobody who fights him ever finds the door on the first try.',
  hp: 980, walk: 270, rival: 'yhwach', handArt: true,
  draw: (c, v) => { if (v.sjUltMask) v.sjMask = Math.max(v.sjMask || 0, 1); PxKit.on() ? SHINPX.draw(c, v) : drawShinji(c, v); },
  drawPortrait: (c, o, d) => PxKit.on() ? sjPortrait(c, o, d) : drawShinjiPortrait(c, o),
  transformCutscene: f => csShinjiVisored(f),
  weaponTip: 125,
  model: { skin: '#f0d8c0' }, face: { expr: 'grin' }, style: { reach: 1.2, weapon: true, speed: 1.0 },
  gauge: { name: 'HOLLOW', max: 100, color: '#ffd35a', label: f => (f.sjMask > 0 ? '· MASKED' : (f.gauge || 0) >= 100 ? '· ↓I MASK' : '') },
  passive: ['Sakanade\'s Scent', 'Every third hit he lands turns the foe\'s world upside down for 2.5s: left is right, right is left. Ghost Cut sets up a back-attack.'],
  moves: { '5S': SJ_SAKANADE, '6S': SJ_SHUNPO, '2S': SJ_MASK, '4S': SJ_SHAKKAHO, 'jS': SJ_DROP },
  super: SJ_SUPER, ult: SJ_ULT,
  form: { name: 'VISORED', desc: 'Permanent. The full Hollow mask: +damage, his Kido is always a Cero, the dash becomes a pounce, and HOLLOW fills twice as fast.', cost: 200, dmg: 1.1, speed: 1.05 },
  assist: '5S',
  lines: {
    intro: ['Ah, what a drag. Let\'s get this over with, {opp}.', 'Don\'t look at the sword. Look at me. Wait, no—', 'You\'re facing the wrong way. Oh, you\'re not? Ha.'],
    win: ['Told ya. Upside down.', 'Nothing personal.', 'That was a pain.'],
    taunt: ['Yo.', 'Bored now.'], form: ['Don\'t get the wrong idea.'], ult: ['Cero.'], ultHit: ['Ah. Overdid it.'], tag: ['Your turn.'], enter: ['Yo.'], assist: ['Collapse.'], moves: ['Collapse, Sakanade.', 'Wrong way.', 'Too slow.'],
  },
});
shinji.ult = SJ_ULT; shinji.ultAct = 'beam'; SJ_SUPER.id = 'shinji_super';
for (const [slot, m] of Object.entries(shinji.moves)) { m.id = 'shinji_' + slot; m.slot = slot; m.owner = 'shinji'; if (slot === 'jS') m.air = true; }
SJ_CERO.id = 'shinji_4S_m'; SJ_POUNCE.id = 'shinji_6S_m';
shinji.specialFor = (f, slot) => (sjMasked(f) ? (slot === '4S' ? SJ_CERO : slot === '6S' ? SJ_POUNCE : undefined) : undefined);
shinji.passiveDmg = (f, t) => (sjMasked(f) ? 1.2 : 1) * (f.sjWorld > 0 ? 1.3 : 1);
shinji.onRoundStart = f => { f.gauge = 0; f.sjMask = 0; f.sjWorld = 0; f.sjCount = 0; f.sjUltMask = false; f.sjBehind = 0; };
shinji.onHit = (a, t, dmg) => {
  a.gauge = Math.min(100, (a.gauge || 0) + dmg * (a.form ? 0.16 : 0.08));
  if (++a.sjCount % 3 === 0) sjInvert(t, 2.5);
  if (a.sjBehind > 0 && a.move && a.move.id !== 'shinji_ult') { a.sjBehind = 0; t.hp = Math.max(1, t.hp - Math.round((dmg || 40) * 0.3)); sjInvert(t, 2); Game.popWorld(t.x, t.y - t.h - 40, 'FROM BEHIND', '#ffd35a', 22); sjSfx('shiPierce'); Cam.shake = Math.max(Cam.shake, 8); }
};
shinji.onHurt = (t, a, dmg) => { t.gauge = Math.min(100, (t.gauge || 0) + dmg * 0.05); };
shinji.passiveTick = f => { if (f.sjMask > 0) f.sjMask--; if (f.sjBehind > 0) f.sjBehind--; if (f.sjWorld > 0) { f.sjWorld--; if (f.opp && f.sjWorld > 0) f.opp.status.confuse = Math.max(f.opp.status.confuse || 0, 0.1); } };
Combat.hz.sjMist = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < h.r && t.y > -220) { sjInvert(t, 2.5); if (!h.hit) { h.hit = true; Combat.resolveHit(t, f, H_({ dmg: 30, guard: 'mid', hs: 10, kb: [0, -40], sfx: 'm' }), { proj: true, fromX: h.x, move: SJ_SAKANADE }); } }
  return h.t < h.life;
};
// the sweet mist: drifting pink-gold pixels that tumble upside down
Combat.drawHz.sjMist = (c, h) => {
  const fade = Math.min(1, h.t / 10, (h.life - h.t) / 20), T = h.t / FPS;
  c.save(); c.globalAlpha = .55 * fade; c.globalCompositeOperation = 'lighter';
  glowCircle(c, h.x, -70, h.r * 1.1, 'rgba(255,170,215,0.35)', 'rgba(255,170,215,0)');
  for (let i = 0; i < 46; i++) { const a = i * 2.4 + T * (.7 + (i % 5) * .15), r = (i * 13) % h.r, x = h.x + Math.cos(a) * r, y = -40 - ((i * 37 + h.t * (1 + (i % 3))) % 130); c.fillStyle = i % 3 ? '#ffb8dc' : '#ffe9a0'; const s = 4 + (i % 3) * 2; c.save(); c.translate(Math.round(x / 3) * 3, Math.round(y / 3) * 3); c.rotate(T * 3 + i); c.fillRect(-s / 2, -s / 2, s, s * .6); c.restore(); }
  c.restore();
};
Combat.hz.sjWorld = h => h.t < h.life && h.owner && h.owner.state !== 'ko';
Combat.drawHz.sjWorld = (c, h) => {
  // the sky pulls down and the ground climbs: an upside-down city hangs from the ceiling
  const fade = Math.min(1, h.t / 15, (h.life - h.t) / 15); c.save(); c.globalAlpha = .3 * fade; c.fillStyle = '#4a3418';
  for (let i = 0; i < 20; i++) { const x = i * 180 + ((h.t * .3) % 180); c.fillRect(x, -900, 80, 120 + (i % 4) * 60); c.fillStyle = i % 2 ? '#4a3418' : '#6a4a22'; }
  c.restore();
};
Combat.hz.sjGhost = h => h.t < h.life;
Combat.drawHz.sjGhost = (c, h) => { const a = 1 - h.t / h.life; c.save(); c.globalAlpha = .55 * a; c.fillStyle = '#f4f4f0'; for (let i = 0; i < 9; i++) c.fillRect(h.x - 18 + (i % 3) * 12 + h.t * (i % 2 ? -1 : 1), -110 + i * 12, 10, 8); c.fillStyle = '#ffd35a'; c.fillRect(h.x - 6, -130, 12, 4); c.restore(); };

// ---------------- cinematics ----------------
function sjHand(c, x, y, s, rot) { // a chunky pixel hand dragging across the screen
  c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#c9a98e'; c.fillRect(-4 * s, -3 * s, 16 * s, 12 * s); c.fillStyle = '#f0d8c0';
  for (let i = 0; i < 4; i++) c.fillRect(-4 * s + i * 4 * s, -17 * s - (i === 1 || i === 2 ? 3 * s : 0), 3.4 * s, 15 * s);
  c.fillRect(-12 * s, 0, 9 * s, 4 * s); c.restore();
}
// bone-white fragments scatter away from a point
function sjShards(c, x, y, k, col = '#f6f2ea') { c.fillStyle = col; for (let i = 0; i < 18; i++) { const a = i * 1.7, r = 30 + k * (120 + (i % 5) * 50); c.fillRect(Math.round((x + Math.cos(a) * r) / 4) * 4, Math.round((y + Math.sin(a) * r * .8 + k * k * 60) / 4) * 4, 6 + (i % 3) * 3, 6); } }

// VISORED — he drags a hand down his face; the Hollow answers.
function csShinjiVisored(f) {
  const fx = new ParticleSystem(700), A = PxKit.actor(f.def);
  return {
    name: 'VISORED', dur: 6.0, fx,
    cues: [[0, () => sjSfx('heartbeat')], [1.5, () => sjSfx('shiAlarm', 0, 2)], [2.2, () => sjSfx('shiBerserk')], [3.1, () => sjSfx('shiRoar')], [3.2, () => sjSfx('boom')]],
    draw(c, t) {
      const sweep = ease.inOut(seg(t, 1.2, 2.3)), erupt = ease.out(seg(t, 2.3, 3.3)), masked = t > 2.1, hn = t > 2.3;
      PxKit.scene(c, x => {
        const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${lerp(40, 14, erupt) | 0},${lerp(26, 4, erupt) | 0},${lerp(30, 8, erupt) | 0})`); g.addColorStop(1, `rgb(${lerp(120, 70, erupt) | 0},${lerp(60, 6, erupt) | 0},${lerp(50, 12, erupt) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.fillStyle = '#12090c'; for (let i = 0; i < 16; i++) x.fillRect(i * 90 - 10, H - 130 - (i * 47 % 6) * 28, 84, 400);
        if (erupt > 0) { x.globalCompositeOperation = 'lighter'; const w = 160 * erupt; const gg = x.createLinearGradient(W / 2 - w, 0, W / 2 + w, 0); gg.addColorStop(0, 'rgba(255,30,20,0)'); gg.addColorStop(.5, 'rgba(255,60,40,0.85)'); gg.addColorStop(1, 'rgba(255,30,20,0)'); x.fillStyle = gg; x.fillRect(W / 2 - w, 0, w * 2, H); x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(0,0,0,0.5)'; for (let i = 0; i < 20; i++) x.fillRect(W / 2 - w * .8 + ((i * 53 + t * 300) % (w * 1.6)), (i * 97 + t * 500) % H, 14, 50); }
      }, .3);
      const shake = t > 2.2 && t < 3.4 ? 8 * (1 - seg(t, 2.2, 3.4)) : 0; c.save(); if (shake) c.translate(rand(-shake, shake), rand(-shake, shake));
      if (t < 3.0) { // close-up: head fills the frame
        A(c, W / 2, H + 300, 6.8, t, 'idle', { transformed: false, sjMask: masked ? 99 : 0, form: hn });
        if (t > 1.2 && t < 2.5) sjHand(c, W / 2 - 30, lerp(80, 560, sweep), 9, 0.1);
        if (t > 2.1 && t < 2.8) sjShards(c, W / 2 + 60, H - 360, seg(t, 2.1, 2.8), '#f6f2ea');
      } else { // pull back to the full figure in a pillar of black-red reiatsu
        const k = ease.inOut(seg(t, 3.0, 3.9));
        A(c, W / 2, lerp(H + 300, H - 50, k), lerp(6.8, 3.2, k), t, 'victory', { transformed: true, sjMask: 99, form: true });
      }
      c.restore();
      if (erupt > 0) for (let i = 0; i < 3; i++) fx.add({ x: W / 2 + rand(-120, 120), y: H, vx: rand(-40, 40), vy: rand(-700, -300), life: 1.2, size: rand(5, 11), color: pick(['#ff3a28', '#2a0008', '#ffb0a0']), glow: false });
      fx.draw(c);
      if (t > 2.2) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2 + (t < 3 ? 52 : 18), t < 3 ? H - 445 : H - 275, 60 + 80 * erupt, 'rgba(255,215,60,0.9)', 'rgba(0,0,0,0)'); c.restore(); }
      caption(c, "Don't get the wrong idea.", t, 0.3, 1.9, '#ffd35a');
      flashAt(c, t, 2.15, 2.5, '#ffffff'); flashAt(c, t, 3.1, 3.4, '#ff6a50');
      titleSlam(c, 'VISORED', 'HALF HOLLOW', t, 3.9, '#ffd35a', 118);
    },
  };
}

// CERO — the inverted world turns right-side up; the mask forms; the sky is erased.
function csShinjiCero(a, opp) {
  const fx = new ParticleSystem(1600), A = PxKit.actor(a.def), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
  const rooftops = (x, k) => { x.fillStyle = k; for (let i = 0; i < 14; i++) x.fillRect(i * 100 - 20, H - 150 - (i * 59 % 7) * 30, 94, 500); };
  return {
    name: 'CERO', dur: 8.4, fx,
    cues: [[0, () => sjSfx('shiSync')], [1.0, () => sjSfx('shiAlarm', 0, 2)], [2.0, () => sjSfx('suck', 1.2)], [3.0, () => sjSfx('shiBerserk')], [3.3, () => sjSfx('riser', 1.8, 0.3, 0, 90, 1200)], [5.0, () => { sjSfx('shiRoar'); sjSfx('boom'); sjSfx('beam', 1.4); }], [6.6, () => sjSfx('shiHowl', 0, 0.8)]],
    draw(c, t) {
      const flip = 1 - ease.inOut(seg(t, 2.0, 3.2)), mask = t > 3.0, charge = ease.in(seg(t, 3.3, 5.0)), fire = t - 5.0;
      c.save(); c.translate(W / 2, H / 2); c.rotate(flip * Math.PI); c.translate(-W / 2, -H / 2);
      PxKit.scene(c, x => {
        const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${lerp(18, 60, charge) | 0},${lerp(10, 4, charge) | 0},${lerp(24, 10, charge) | 0})`); g.addColorStop(1, `rgb(${lerp(70, 130, charge) | 0},${lerp(40, 20, charge) | 0},${lerp(60, 30, charge) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H);
        rooftops(x, '#150a14'); x.fillStyle = '#0a0508'; x.fillRect(0, H - 70, W, 70);
        if (charge > 0) { x.globalCompositeOperation = 'lighter'; glowCircle(x, W * .34, H - 200, 520 * charge, 'rgba(255,40,30,0.4)', 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over'; }
      }, .3);
      const ox = W * .74, oy = H - 70, gx = W * .2;
      // the foe: disintegrates in bands once the beam lands
      if (fire < 0.35) silhouette(c, o => drawCharAt(o, opp.def, ox, oy, oppScale, -1, { pose: t < 5 ? 'block' : 'hurt', anim: t, transformed: opp.transformed }), fire > 0 ? '#ffffff' : '#2a1018');
      else { const k = seg(fire, .35, 1.6); for (let i = 0; i < 12; i++) { c.save(); c.beginPath(); c.rect(0, oy - 280 + i * 24, W, 24); c.clip(); c.translate((i % 2 ? 1 : -1) * 0, 0); c.globalAlpha = Math.max(0, 1 - k * 1.2 - i * .02); c.translate(k * 300 * (.4 + i * .08), -k * 40 * i * .1); silhouette(c, o => drawCharAt(o, opp.def, ox, oy, oppScale, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), '#ffd0c8'); c.restore(); } }
      A(c, gx, oy + 4, 2.7, t, fire > 0 ? 'cast' : t < 3 ? 'idle' : 'cast', { transformed: false, sjMask: mask ? 99 : 0, form: false, sjUltMask: mask, move: null });
      // the Cero gathers at his mouth
      const mx = gx + 74, my = oy - 100 * 2.7 + 60;
      if (t > 3.3 && fire < 0) { c.save(); c.globalCompositeOperation = 'lighter'; const R = 14 + charge * 110; glowCircle(c, mx, my, R * 2, 'rgba(255,50,40,0.6)', 'rgba(0,0,0,0)'); c.fillStyle = '#ff2a2a'; c.beginPath(); c.arc(mx, my, R, 0, 7); c.fill(); c.fillStyle = '#fff0f0'; c.beginPath(); c.arc(mx, my, R * .55, 0, 7); c.fill(); c.strokeStyle = '#1a0004'; c.lineWidth = 6; c.beginPath(); c.arc(mx, my, R * 1.25, t * 9, t * 9 + 2.2); c.stroke(); for (let i = 0; i < 3; i++) fx.add({ x: mx + rand(-250, 250) * (1 - charge * .5), y: my + rand(-180, 180), vx: 0, vy: 0, life: .35, size: rand(4, 9), color: '#ff5a48', glow: true }); c.restore(); }
      if (fire >= 0) { // the beam: white-hot core, red body, black fringe
        const w = 130 * Math.min(1, fire * 8) * (1 - seg(fire, 1.4, 2.3)) + 6;
        c.save(); c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(30,0,6,0.5)'; c.fillRect(mx, my - w * 1.4, W, w * 2.8); c.fillStyle = 'rgba(255,40,30,0.85)'; c.fillRect(mx, my - w, W, w * 2); c.fillStyle = '#fff0f0'; c.fillRect(mx, my - w * .45, W, w * .9);
        for (let i = 0; i < 6; i++) fx.add({ x: ox, y: my + rand(-w, w), vx: rand(100, 1400), vy: rand(-300, 300), life: .9, size: rand(5, 12), color: pick(['#ff2a2a', '#ffd0d0', '#400']) });
        glowCircle(c, mx, my, 260 * Math.min(1, fire * 5), 'rgba(255,220,210,0.7)', 'rgba(0,0,0,0)'); c.restore();
      }
      c.restore();
      fx.draw(c);
      if (t < 2.0) { c.globalAlpha = 1; caption(c, 'Up is down. Left is right.', t, 0.3, 1.9, '#ffd35a'); }
      if (t > 3.2 && fire < 0) caption(c, '...Cero.', t, 3.4, 4.9, '#ff9a8a');
      flashAt(c, t, 2.95, 3.3, '#ffe9a0'); flashAt(c, t, 5.0, 5.5, '#ffffff');
      if (fire > 0 && fire < .9) { c.save(); c.translate(rand(-10, 10) * (1 - fire), rand(-10, 10) * (1 - fire)); c.restore(); }
      if (t > 6.5) { c.save(); c.globalAlpha = seg(t, 6.5, 7); bigText(c, 'WELCOME TO THE INVERTED WORLD', W / 2, H - 120, 34, '#ffd35a', '#000'); c.restore(); titleSlam(c, 'CERO', '', t, 6.7, '#ff2a2a', 130); }
    },
  };
}
rival('shinji', 'yhwach', [[0, 'So you\'re the old man who sees the future. Bet you didn\'t see it upside down.'], [1, 'I see every future, Visored. Even the inverted ones.']],
  { shinji: 'Guess you looked the wrong way.', yhwach: 'Your world returns to its proper orientation.' });
rival('shinji', 'kael', [[0, 'Somethin\' inside you wants out, huh? I know the feelin\'.'], [1, 'How do you keep it in?'], [0, 'I don\'t. I put a mask on it.']],
  { shinji: 'Don\'t let it drive, kid.', kael: 'Maybe I should get a mask.' });

// ============================================================
//  VISORED: a second moveset and CERO OSCURAS.
// ============================================================
const SJ_F_HOWL = mk({ name: 'Hollow Howl', desc: 'Visored: a shriek that rolls out in front of him, staggering and inverting everything it touches.', pose: 'cast', s: 12, a: 1, r: 22, cd: 4, ai: { min: 0, max: 420, use: 'zone' },
  ev: { 2: () => sjSfx('shiHowl', 0, 1.1), 12: f => { Combat.strikeZone(f, { x: f.facing > 0 ? f.x : f.x - 420, y: -240, w: 420, h: 244 }, { dmg: 46, hs: 26, guard: 'mid', kb: [380 * f.facing, -140], stun: 0.5, sfx: 'h' }, { move: SJ_F_HOWL, each: t => sjInvert(t, 3) }); Combat.addHazard({ kind: 'sjHowl', owner: f, side: f.side, x: f.x, dir: f.facing, life: 26 }); Cam.shake = 10; } } });
const SJ_F_FLURRY = Mv.flurry({ name: 'Hollow Rush', desc: 'Visored: a feral flurry of slashes and claw rakes, ending in a thrust that opens the foe.', hits: 8, hit: { dmg: 24, box: [0, -120, 130, 110], status: { bleed: 2 } }, finisher: { dmg: 90, kb: [700, -300], launch: true, wb: true } });
const SJ_F_ULT = superize(mk({ name: 'CERO OSCURAS', desc: 'Visored: a black Cero from the full Hollow. The sky goes dark, the moon cracks, and the foe is erased from the horizon. Blockable. Must connect.', pose: 'cast', s: 66, a: 34, r: 28,
  ev: { 1: f => { f.sjUltMask = true; f.say('...Kneel.', 60); sjSfx('shiBerserk'); sjSfx('riser', 2.2, 0.22, 0, 70, 800); },
    66: f => { Combat.fireBeam(f, { len: 2600, width: 120, dur: 34, dmg: 6, tick: 6, super: true, ultConnect: true, color: '#7a2aff', core: '#ffe0ff', from: 'mouth' }); Cam.shake = 18; sjSfx('shiRoar'); sjSfx('boom'); }, 100: f => { f.sjUltMask = false; } } }), 300);
SJ_F_ULT.id = 'shinji_fult'; SJ_F_ULT.recoverWhiff = 40;
SJ_F_ULT.ult = { dmg: 1280, cutscene: (a, t) => csShinjiOscuras(a, t), fx: { el: 'void', color: '#7a2aff' } };
Object.assign(shinji.form, { moves: { '5S': SJ_F_HOWL, '2S': SJ_F_FLURRY }, ult: SJ_F_ULT, desc: 'Permanent. The full Hollow mask: +damage, Kido is a Cero, the dash is a pounce, HOLLOW fills twice as fast. New moveset (Hollow Howl, Hollow Rush) and the ultimate CERO OSCURAS.' });
for (const [slot, m] of Object.entries(shinji.form.moves)) { m.id = 'shinji_f' + slot; m.slot = slot; m.owner = 'shinji'; }
Combat.hz.sjHowl = h => h.t < h.life;
Combat.drawHz.sjHowl = (c, h) => { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,230,160,${1 - k})`; c.lineWidth = 6; for (let i = 0; i < 4; i++) { const r = 40 + k * 380 - i * 38; if (r > 0) { c.beginPath(); c.arc(h.x + h.dir * 40, -90, r, h.dir > 0 ? -.9 : Math.PI - .9, h.dir > 0 ? .9 : Math.PI + .9); c.stroke(); } } c.fillStyle = `rgba(255,60,40,${.8 * (1 - k)})`; for (let i = 0; i < 14; i++) c.fillRect(Math.round((h.x + h.dir * (30 + k * 360 * (.4 + (i % 5) * .15))) / 4) * 4, Math.round((-90 + Math.sin(i * 2.1) * 80) / 4) * 4, 8, 8); c.restore(); };

// CERO OSCURAS — the sky is a black moon, the mask grows horns, and the beam is the colour of its own shadow.
function csShinjiOscuras(a, opp) {
  const fx = new ParticleSystem(1600), A = PxKit.actor(a.def), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
  return {
    name: 'CERO OSCURAS', dur: 8.6, fx,
    cues: [[0, () => sjSfx('heartbeat')], [1.4, () => sjSfx('shiAlarm', 0, 3)], [2.6, () => sjSfx('shiBerserk')], [3.8, () => sjSfx('riser', 1.6, 0.26, 0, 70, 1200)], [5.4, () => { sjSfx('shiRoar'); sjSfx('boom'); sjSfx('beam', 1.6); }], [7.2, () => sjSfx('shiHowl', 0, 0.9)]],
    draw(c, t) {
      const dark = ease.inOut(seg(t, .8, 3.2)), charge = ease.in(seg(t, 3.8, 5.4)), fire = t - 5.4, gy = H - 74, ax = W * .2, mx = ax + 96, my = gy - 215, ox = W * .76;
      PxKit.scene(c, x => {
        const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${lerp(40, 4, dark) | 0},${lerp(24, 0, dark) | 0},${lerp(50, 14, dark) | 0})`); g.addColorStop(1, `rgb(${lerp(110, 30, dark) | 0},${lerp(60, 6, dark) | 0},${lerp(90, 40, dark) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H);
        // a vast black moon that cracks when the beam lands
        const my2 = H * .3, cr = fire > 0 ? Math.min(1, fire / .8) : 0; x.fillStyle = '#05010a'; x.beginPath(); x.arc(W * .55, my2, 230, 0, 7); x.fill(); x.strokeStyle = `rgba(190,100,255,${.5 + .5 * charge})`; x.lineWidth = 10; x.beginPath(); x.arc(W * .55, my2, 232, 0, 7); x.stroke();
        if (cr > 0) { x.strokeStyle = '#d8a0ff'; x.lineWidth = 8; x.beginPath(); x.moveTo(W * .55 - 200, my2 - 90); x.lineTo(W * .55 - 40 * cr, my2 - 10); x.lineTo(W * .55 + 60, my2 + 50 * cr); x.lineTo(W * .55 + 210, my2 + 120); x.stroke(); }
        x.fillStyle = '#0a0410'; for (let i = 0; i < 16; i++) x.fillRect(i * 90 - 10, gy - 40 - (i * 59 % 6) * 30, 84, 600);
        x.fillStyle = '#12061a'; x.fillRect(0, gy, W, H - gy);
        x.globalCompositeOperation = 'lighter'; glowCircle(x, mx, my, 520 * charge, 'rgba(150,40,255,0.45)', 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over';
        if (fire > 0) { const w = 130 * Math.min(1, fire * 6) * (1 - seg(fire, 1.6, 2.6)) + 4; x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(20,0,40,0.8)'; x.fillRect(mx, my - w * 1.5, W, w * 3); x.fillStyle = 'rgba(150,50,255,0.9)'; x.fillRect(mx, my - w, W, w * 2); x.fillStyle = '#ffe8ff'; x.fillRect(mx, my - w * .45, W, w * .9); x.globalCompositeOperation = 'source-over'; }
      }, .3);
      A(c, ax, gy + 4, 2.8, t, t < 5.4 ? 'cast' : 'heavy', { transformed: true, sjMask: 99, form: true, sjUltMask: true });
      if (t > 3.8 && fire < 0) { c.save(); c.globalCompositeOperation = 'lighter'; const R = 12 + charge * 100; glowCircle(c, mx, my, R * 2, 'rgba(160,60,255,0.6)', 'rgba(0,0,0,0)'); c.fillStyle = '#a040ff'; c.beginPath(); c.arc(mx, my, R, 0, 7); c.fill(); c.fillStyle = '#fff0ff'; c.beginPath(); c.arc(mx, my, R * .5, 0, 7); c.fill(); c.strokeStyle = '#0a0014'; c.lineWidth = 7; c.beginPath(); c.arc(mx, my, R * 1.25, t * 9, t * 9 + 2.4); c.stroke(); c.restore(); }
      if (fire < 0.1) silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4, oppScale, -1, { pose: t < 5.4 ? 'block' : 'hurt', anim: t, transformed: opp.transformed }), fire > 0 ? '#ffffff' : '#2a1040');
      else { const k = seg(fire, .1, 1.5); for (let i = 0; i < 12; i++) { c.save(); c.beginPath(); c.rect(0, gy - 280 + i * 24, W, 24); c.clip(); c.globalAlpha = Math.max(0, 1 - k * 1.2 - i * .02); c.translate(k * 340 * (.4 + i * .08), 0); silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4, oppScale, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), '#e8c0ff'); c.restore(); } }
      if (fire >= 0) for (let i = 0; i < 5; i++) fx.add({ x: ox, y: my + rand(-90, 90), vx: rand(100, 1400), vy: rand(-300, 300), life: .9, size: rand(5, 12), color: pick(['#a040ff', '#ffe8ff', '#200030']) });
      fx.draw(c);
      if (t < 1.6) caption(c, 'Lookin\' at the sky? Wrong way again.', t, .2, 1.55, '#ffd35a');
      if (t > 3.0 && fire < 0) caption(c, '...Cero Oscuras.', t, 3.4, 5.2, '#d8a0ff');
      flashAt(c, t, 2.55, 2.9, '#ffe9a0'); flashAt(c, t, 5.4, 5.9, '#ffffff');
      if (t > 6.9) titleSlam(c, 'CERO OSCURAS', 'THE MOON IS NOT COMING BACK', t, 7.0, '#a040ff', 98);
    },
  };
}
