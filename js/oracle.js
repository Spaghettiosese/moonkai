// ============================================================
//  MOONKAI — ORACLE, the Seer (bespoke, pixel engine).
//
//  GAUGE   · FATE        fills when she foresees a blow (+30) or lands one (+6). When it is full her
//                        next Fated Strike is DOUBLE: one where the foe will be, one where they are.
//  PASSIVE · FORESIGHT   12% of blows are seen coming: she slips aside, leaving an after-image of
//                        herself where she was (25% once the Third Eye is open).
//  VISION ORB (5I)       a slow, homing star-orb that chimes as it finds the foe.
//  FATED STRIKE (→I)     a ghost of the foe is cast 0.6s ahead, along the line they are running.
//                        Light falls on the ghost.
//  PRECOGNITION (↓I)     a long counter stance: she reappears behind whatever tried to hit her.
//  OMEN (←I)             plants an eye-rune. When the foe walks over it, the eye opens and a pillar
//                        of light erupts (max 2).
//  FALLING STARS (air)   three stars, falling.
//  SUPER · INEVITABLE    five strikes of light, one after another, across every way they could run.
//  THIRD EYE             awakening: the band falls away, foresight doubles, and the future is shown.
//  THE INEVITABLE        ultimate: seven futures of the foe stand in a row. The light falls on all
//                        of them, and the only one left standing is the one that lost.
// ============================================================
const oraSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const oQ = (x, k = 4) => Math.round(x * k) / k;

// ---------------- pixel art ----------------
const ORAPX = PixelArt.make({
  id: 'oracle', win: [-135, -265, 300, 310], B: 1.08, trail: 'rgba(255,224,138,',
  state(v, t) {
    const F = !!v.transformed, open = F || v.oraEye > 0 ? 1 : 0;
    return { F, open, hair: oQ(Math.sin(t * 2.6)), robe: oQ(Math.sin(t * 2) * 3, 2), orb: oQ(Math.sin(t * 3)), blink: !open && (t % 5.2) < .1 ? 1 : 0 };
  },
  body(g, P, s) {
    const F = s.F, info = {}, { L } = g;
    const robe = F ? ['#7a52b8', '#4a2a82'] : ['#5a3a86', '#3a2258'], robeF = F ? ['#4a2a82', '#2e1a58'] : ['#3a2258', '#24143c'], gold = ['#ffe08a', '#c49a3a'], skin = ['#ecd6c6', '#c4a494'], skinF = ['#c4a494', '#9a7c6e'];
    g.humanoid(P, { limb: .85, bulk: .86, hips: .9, skin, skinFar: skinF, top: robe, topFar: robeF, pants: robe, pantsFar: robeF, boots: gold, bootsFar: ['#c49a3a', '#8a6a24'], belt: gold, skirt: F ? ['#8a62c8', '#5a3a98'] : ['#6a4a96', '#42286a'], glove: skin, gloveFar: skinF, bracers: gold }, {
      back(P) {
        const [hx, hy] = P.head, [px_, py] = P.hip;
        // the train of the robe and the long pale hair, both moving as if underwater
        g.paint([g.poly([[px_ - 14, py], [px_ - 26 + s.robe, py + 40], [px_ - 6, py + 46], [px_ + 12, py + 34], [px_ + 12, py]])], ...robeF);
        g.paint([g.shape([['M', hx - 8, hy - 11], ['Q', hx - 26 + s.hair * 2, hy + 12, hx - 22 + s.hair * 3, hy + 52], ['L', hx - 6, hy + 44], ['Q', hx - 4, hy + 14, hx + 2, hy - 2]])], '#fff3e4', '#d8c2ac');
      },
      chest(P) {
        const x = L(P.hip, P.sh, .6)[0], y = L(P.hip, P.sh, .6)[1];
        g.paint([g.poly([[x - 6, y - 14], [x + 6, y - 14], [x + 8, y + 18], [x - 8, y + 18]])], ...gold);
        g.fill(g.ell(x, y, 5, 3.2), '#2a1a3a'); g.fill(g.ell(x, y, 2.2, 2.2), F ? '#ffffff' : '#ffe08a');
        g.line([[x - 5, y], [x - 8, y - 3]], '#ffe08a', 1); g.line([[x + 5, y], [x + 8, y - 3]], '#ffe08a', 1);
      },
      head(P) {
        const [hx, hy] = P.head;
        g.paint([g.shape([['M', hx - 11, hy - 3], ['Q', hx - 6, hy - 16, hx + 8, hy - 13], ['Q', hx + 12, hy - 9, hx + 10, hy - 5], ['L', hx + 2, hy - 8], ['L', hx - 2, hy - 7]])], '#fff6ea', '#d8c2ac');
        g.line([[hx - 10, hy - 8], [hx + 10, hy - 9]], '#ffe08a', 2);                                      // circlet
        if (!s.open) { // the gold sight-band
          g.paint([g.poly([[hx - 11, hy - 6], [hx + 12, hy - 7], [hx + 12, hy], [hx - 11, hy + 1]])], ...gold);
          g.fill(g.ell(hx + 4, hy - 3, 3.4, 1.8), '#2a1a3a'); g.fill(g.ell(hx + 4, hy - 3, 1.2, 1.2), '#ffe08a');
          if (s.blink) g.line([[hx - 11, hy - 3], [hx + 12, hy - 3.5]], '#8a6a24', 1);
        } else { // eyes open: pupil-less gold, and a third eye above the brow
          for (const dx of [2, 9]) { g.fill(g.ell(hx + dx, hy - 2, 2.6, 1.5), '#fff6d0'); }
          g.fill(g.ell(hx + 5, hy - 11, 2.8, 1.8), '#fff6d0'); g.fill(g.ell(hx + 5, hy - 11, 1, 1.4), '#2a1a3a');
        }
        g.line([[hx + 6, hy + 6], [hx + 10, hy + 5.5]], '#6a3a3a', 1.1);
        info.eye = [hx + 6, hy - 2]; info.third = [hx + 5, hy - 11];
      },
      front(P) { // the vision orb: a crystal with a living eye inside, hovering above her palm
        const [hx, hy] = P.fH, ox = hx + 8, oy = hy - 14 + s.orb * 2;
        g.paint([g.ell(ox, oy, 9, 9)], F ? '#fff4c8' : '#ffe9a8', F ? '#d8a840' : '#c49a3a');
        g.fill(g.ell(ox + 1, oy + 1, 4.4, 2.8), '#2a1a3a'); g.fill(g.ell(ox + 1.6, oy + 1, 1.6, 1.6), '#ffe08a'); g.fill(g.ell(ox - 3, oy - 3, 1.6, 1.6), '#ffffff');
        info.orb = [ox, oy];
      },
    });
    return info;
  },
  pre(c, v, P, s) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -80, s.F ? 130 : 90, s.F ? 'rgba(255,224,138,0.26)' : 'rgba(180,140,255,0.14)', 'rgba(0,0,0,0)'); c.restore(); },
  post(c, v, P, s, info) {
    const t = v.anim || 0; c.save(); c.globalCompositeOperation = 'lighter';
    if (info && info.orb) glowCircle(c, info.orb[0], info.orb[1], 17, 'rgba(255,224,138,0.8)', 'rgba(0,0,0,0)');
    if (s.open && info && info.eye) { glowCircle(c, info.eye[0], info.eye[1], 9, 'rgba(255,230,140,0.9)', 'rgba(0,0,0,0)'); glowCircle(c, info.third[0], info.third[1], 8, 'rgba(255,240,180,0.95)', 'rgba(0,0,0,0)'); }
    // stars orbit her: a few always, a full ring when the Third Eye is open
    const n = s.F ? 8 : 3; for (let i = 0; i < n; i++) { const a = t * (s.F ? 1.6 : 1.1) + i * 6.283 / n, r = 38 + (i % 2) * 8; c.fillStyle = i % 2 ? '#ffe9a8' : '#ffffff'; c.fillRect(Math.round(P.sh[0] + Math.cos(a) * r), Math.round(P.sh[1] + 10 + Math.sin(a) * r * .5), 4, 4); }
    c.restore();
  },
});
function drawOraclePortrait(c, opts) {
  const F = !!opts.form;
  const g = c.createRadialGradient(50, 40, 4, 50, 56, 80); g.addColorStop(0, F ? '#7a52b8' : '#3a2458'); g.addColorStop(1, '#0a0614'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 22; i++) { c.fillStyle = i % 3 ? 'rgba(255,224,138,0.8)' : 'rgba(255,255,255,0.9)'; c.fillRect((i * 37) % 100, (i * 53) % 70, 2, 2); } glowCircle(c, 50, 44, 46, F ? 'rgba(255,224,138,0.34)' : 'rgba(180,140,255,0.2)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#fff3e4'; c.beginPath(); c.moveTo(26, 40); c.quadraticCurveTo(18, 76, 24, 100); c.lineTo(76, 100); c.quadraticCurveTo(82, 76, 74, 40); c.quadraticCurveTo(50, 8, 26, 40); c.fill();
  c.fillStyle = '#4a2a70'; c.beginPath(); c.moveTo(10, 100); c.lineTo(26, 82); c.lineTo(50, 90); c.lineTo(74, 82); c.lineTo(90, 100); c.fill();
  c.fillStyle = '#ffe08a'; c.fillRect(46, 84, 8, 16);
  c.fillStyle = '#ecd6c6'; c.strokeStyle = '#8a6a5a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(35, 38); c.quadraticCurveTo(50, 28, 65, 38); c.lineTo(65, 54); c.lineTo(58, 70); c.lineTo(50, 75); c.lineTo(42, 70); c.lineTo(35, 54); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#fff6ea'; c.beginPath(); c.moveTo(33, 44); c.quadraticCurveTo(36, 22, 50, 23); c.quadraticCurveTo(64, 22, 67, 44); c.lineTo(60, 34); c.lineTo(54, 40); c.lineTo(50, 31); c.lineTo(46, 40); c.lineTo(40, 34); c.closePath(); c.fill();
  c.strokeStyle = '#ffe08a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(35, 36); c.quadraticCurveTo(50, 32, 65, 36); c.stroke();
  if (!F) { c.fillStyle = '#e8b84a'; c.strokeStyle = '#8a6a24'; c.beginPath(); c.moveTo(33, 46); c.lineTo(67, 46); c.lineTo(67, 56); c.lineTo(33, 57); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#2a1a3a'; c.beginPath(); c.ellipse(50, 51.5, 7, 3.4, 0, 0, 7); c.fill(); c.fillStyle = '#ffe08a'; c.beginPath(); c.arc(50, 51.5, 2.2, 0, 7); c.fill(); }
  else {
    c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 9, 51, 11, 'rgba(255,230,140,1)', 'rgba(0,0,0,0)'); glowCircle(c, 50, 33, 12, 'rgba(255,240,180,1)', 'rgba(0,0,0,0)'); c.restore();
    for (const s of [-1, 1]) { c.fillStyle = '#fff6d0'; c.beginPath(); c.moveTo(50 + s * 3, 51); c.quadraticCurveTo(50 + s * 9, 48, 50 + s * 15, 51); c.quadraticCurveTo(50 + s * 9, 54, 50 + s * 3, 51); c.fill(); }
    c.fillStyle = '#fff6d0'; c.beginPath(); c.ellipse(50, 33, 4.4, 2.6, 0, 0, 7); c.fill(); c.fillStyle = '#2a1a3a'; c.beginPath(); c.ellipse(50, 33, 1.4, 2, 0, 0, 7); c.fill();
  }
  c.strokeStyle = '#7a4a4a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(45, 65); c.quadraticCurveTo(50, 67, 55, 65); c.stroke();
}
const oraPortrait = PxKit.portrait('oracle', drawOraclePortrait, { res: 64, levels: 8, dither: 0.3 });

// ---------------- hazards ----------------
// a faint ghost of a fighter at a future position
const oraGhostDraw = (c, who, x, alpha, tint) => {
  if (!who || !who.def) return; const sc = who.scale || 1;
  c.save(); c.translate(x, 0); c.scale(sc * (who.facing || 1), sc); c.globalAlpha = alpha;
  who.def.draw(c, { pose: who.pose && who.pose !== 'hurt_air' ? who.pose : 'idle', anim: Game.t, transformed: who.form, def: who.def });
  c.globalCompositeOperation = 'lighter'; c.globalAlpha = alpha * .6; c.fillStyle = tint; c.fillRect(-60, -230, 120, 232);
  c.restore();
};
Combat.hz.oraGhost = h => h.t < h.life;
Combat.drawHz.oraGhost = (c, h) => { const k = h.t / h.life; oraGhostDraw(c, h.who, h.x, .5 * Math.min(1, h.t / 6) * (1 - Math.max(0, k - .8) / .2), 'rgba(255,220,120,0.5)');
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const a = h.t * .2 + i * .785, r = 44 + 16 * k; c.fillStyle = i % 2 ? '#ffe9a8' : '#fff'; c.fillRect(Math.round((h.x + Math.cos(a) * r) / 3) * 3, Math.round((-80 + Math.sin(a) * r * .9) / 3) * 3, 5, 5); } c.restore(); };
Combat.hz.oraAfter = h => h.t < h.life;
Combat.drawHz.oraAfter = (c, h) => { const k = h.t / h.life; oraGhostDraw(c, h.who, h.x + k * 30 * h.dir, .55 * (1 - k), 'rgba(200,160,255,0.5)'); };
// a pillar of light with rising pixel stars
Combat.hz.oraPillar = h => h.t < h.life;
Combat.drawHz.oraPillar = (c, h) => {
  const k = h.t / h.life, a = 1 - k, w = h.r * (1 - k * .5) * (h.big ? 1.3 : 1);
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(h.x - w, 0, h.x + w, 0); g.addColorStop(0, 'rgba(255,230,150,0)'); g.addColorStop(.5, `rgba(255,248,214,${.95 * a})`); g.addColorStop(1, 'rgba(255,230,150,0)');
  c.fillStyle = g; c.fillRect(h.x - w, -1400, w * 2, 1400); glowCircle(c, h.x, -10, w * 1.7, `rgba(255,230,150,${.6 * a})`, 'rgba(0,0,0,0)');
  for (let i = 0; i < 18; i++) { const sx = h.x + ((i * 53) % 100 - 50) / 50 * w, sy = -((i * 71 + h.t * 22) % 520); c.fillStyle = i % 2 ? `rgba(255,255,255,${a})` : `rgba(255,224,138,${a})`; c.fillRect(Math.round(sx / 3) * 3, Math.round(sy / 3) * 3, 6, 6); }
  c.restore();
};
// Omen: an eye-rune. Armed after 20 frames; opens when the foe steps on it.
Combat.hz.oraOmen = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  if (h.t > 20) for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < 62 + o.w / 2 && o.y > -90 && o.state !== 'ko') {
    Combat.resolveHit(o, f, H_({ dmg: 85, guard: 'mid', hs: 28, kb: [80, -760], launch: true, sfx: 'h' }), { proj: true, fromX: h.x });
    Combat.addHazard({ kind: 'oraPillar', owner: f, side: f.side, x: h.x, r: 64, life: 24 }); Cam.shake = Math.max(Cam.shake, 9); oraSfx('oraStrike'); if (f.gauge !== undefined) f.gauge = Math.min(100, f.gauge + 10); return false;
  }
  return h.t < h.life;
};
Combat.drawHz.oraOmen = (c, h) => {
  const armed = h.t > 20, T = h.t / FPS, open = armed ? .5 + .5 * Math.sin(T * 4) : seg(h.t, 0, 20);
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, h.t / 10) * (armed ? 1 : .6);
  c.strokeStyle = '#ffe08a'; c.lineWidth = 3; c.beginPath(); c.ellipse(h.x, -3, 54, 11, 0, 0, 7); c.stroke();
  for (let i = 0; i < 10; i++) { const a = i * .628 + T * 1.2; c.fillStyle = i % 2 ? '#fff' : '#ffe08a'; c.fillRect(Math.round((h.x + Math.cos(a) * 54) / 3) * 3, Math.round((-3 + Math.sin(a) * 11) / 3) * 3, 4, 4); }
  c.fillStyle = `rgba(255,236,170,${.5 + .4 * open})`; c.beginPath(); c.ellipse(h.x, -3, 30, 4 + 7 * open, 0, 0, 7); c.fill(); c.fillStyle = '#2a1a3a'; c.beginPath(); c.ellipse(h.x, -3, 6, 2 + 6 * open, 0, 0, 7); c.fill();
  c.restore();
};
// seven futures standing in a row (ultimate)
Combat.hz.oraFuture = h => h.t < h.life;
Combat.drawHz.oraFuture = (c, h) => { const k = Math.min(1, h.t / 14), flick = .5 + .5 * Math.sin(h.t * .7 + h.i); oraGhostDraw(c, h.who, h.x, .42 * k * (.6 + .4 * flick), `rgba(${h.i % 2 ? '255,200,120' : '200,170,255'},0.55)`); };

// ---------------- kit ----------------
const oraPredict = (t, lead = 0.6) => clamp(t.x + (t.vx || 0) * lead, 50, Arena.stage.width - 50);
const oraStrike = (f, x, r, dmg, move, o = {}) => {
  for (const e of Combat.targets(f.side)) if (Math.abs(e.x - x) < r + e.w / 2) { const res = Combat.resolveHit(e, f, H_(Object.assign({ dmg, guard: 'mid', hs: 26, kb: [0, -520], launch: true, sfx: 'h' }, o.hit || {})), { proj: true, fromX: x, move }); if (res === 'hit') f.gauge = Math.min(100, (f.gauge || 0) + 6); }
  Combat.addHazard({ kind: 'oraPillar', owner: f, side: f.side, x, r, life: o.life || 22, big: !!o.big }); Cam.shake = Math.max(Cam.shake, o.big ? 18 : 7); oraSfx('oraStrike');
};
const ORA_ORB = Mv.shot({ name: 'Vision Orb', desc: 'A slow star-orb that homes in on the foe, chiming when it finds them.', s: 12, proj: { speed: 500, r: 14, dmg: 55, homing: 2.5, kind: 'star', color: '#ffe08a', life: 3 }, ev: { 2: () => oraSfx('oraVision'), 12: () => oraSfx('oraStar') } });
const ORA_FATED = mk({ name: 'Fated Strike', desc: 'Casts a ghost of the foe 0.6s ahead along the line they are running, and light falls on it. With FATE full: a second strike where they are NOW.', pose: 'cast_up', s: 20, a: 1, r: 22, cd: 3, ai: { min: 80, max: 900, use: 'zone' },
  ev: { 4: () => oraSfx('oraWhisper'), 20: f => {
    const t = f.opp; if (!t || t.state === 'ko') return; const full = (f.gauge || 0) >= 100; if (full) f.gauge = 0;
    const px = oraPredict(t, .6);
    Combat.addHazard({ kind: 'oraGhost', owner: f, side: f.side, x: px, who: t, life: 38 }); oraSfx('oraVision');
    Combat.telegraph(f, { x: px, r: 70, life: 38, color: '#ffe9a8', column: true, onFire: h => oraStrike(f, h.x, h.r, 92, ORA_FATED) });
    if (full) { Game.popWorld(f.x, f.y - f.h - 40, 'DOUBLE FATE', '#fff0b0', 22); Combat.telegraph(f, { x: t.x, follow: t, track: .1, r: 70, life: 52, color: '#ffffff', column: true, onFire: h => oraStrike(f, h.x, h.r, 92, ORA_FATED) }); }
  } } });
const ORA_PRECOG = Mv.counter({ name: 'Precognition', desc: 'A long counter stance. Whatever tries to hit her, she reappears behind it and strikes.', window: 40, dmg: 110 });
ORA_PRECOG.ev = { 2: () => oraSfx('oraRewind', 0, 0.5) };
const ORA_OMEN = mk({ name: 'Omen', desc: 'Plants an eye-rune. When the foe steps on it the eye opens and a pillar of light erupts. Max 2.', pose: 'cast', s: 14, a: 1, r: 18, cd: 4, ai: { min: 100, max: 600, use: 'trap' },
  ev: { 14: f => { const own = Combat.hazards.filter(h => h.kind === 'oraOmen' && h.owner === f); if (own.length >= 2) own[0].life = 0; Combat.addHazard({ kind: 'oraOmen', owner: f, side: f.side, x: clamp(f.x + f.facing * 220, 60, Arena.stage.width - 60), life: 10 * FPS }); oraSfx('oraEyeOpen'); } } });
const ORA_STARS = Mv.shot({ name: 'Falling Stars', desc: 'Three stars, falling.', proj: { speed: 700, r: 12, dmg: 32, count: 3, spread: 0.5, angle: 0.9, kind: 'star', color: '#ffe08a' }, ev: { 2: () => oraSfx('oraStar') } });
const ORA_SUPER = superize(mk({ name: 'Inevitable', desc: 'Five strikes of light, one after another, across every way the foe could run.', pose: 'cast_up', s: 18, a: 1, r: 26,
  ev: { 2: f => { f.say('Every future ends in light.', 70); oraSfx('oraWhisper'); }, 18: f => { const t = f.opp; if (!t) return;
    for (let i = 0; i < 5; i++) { const x = clamp(t.x + (i - 2) * 105, 50, Arena.stage.width - 50); Combat.addHazard({ kind: 'oraGhost', owner: f, side: f.side, x, who: t, life: 22 + i * 8 });
      Combat.telegraph(f, { x, r: 52, life: 22 + i * 8, color: '#ffe9a8', column: true, onFire: h => oraStrike(f, h.x, h.r, 62, ORA_SUPER) }); } oraSfx('oraFlash'); } } }), 100);
const ORA_ULT = superize(mk({ name: 'THE INEVITABLE', desc: 'Seven futures of the foe stand in a row. The light falls on all of them: the only one left standing is the one that lost. Blockable. Must connect.', pose: 'cast_up', s: 44, a: 4, r: 28,
  ev: { 1: f => { f.oraEye = 90; oraSfx('oraEyeOpen'); const t = f.opp; f.ultTele = Combat.telegraph(f, { x: t ? t.x : f.x, follow: t, track: .16, r: 130, life: 999, color: '#ffe08a', column: true });
    if (t) for (let i = 0; i < 6; i++) Combat.addHazard({ kind: 'oraFuture', owner: f, side: f.side, x: clamp(t.x + (i - 2.5) * 70, 50, Arena.stage.width - 50), who: t, i, life: 46 }); },
    44: f => { const x = f.ultTele ? f.ultTele.x : f.x; if (f.ultTele) f.ultTele.life = 0; f.ultTele = null; f.oraEye = 0;
      for (const e of Combat.targets(f.side)) if (Math.abs(e.x - x) < 130) Combat.resolveHit(e, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: x, move: ORA_ULT });
      Combat.addHazard({ kind: 'oraPillar', owner: f, side: f.side, x, r: 130, life: 34, big: true }); Cam.shake = 20; oraSfx('oraShatter'); oraSfx('aurSmite', 0.05); } } }), 300);
ORA_ULT.id = 'oracle_ult'; ORA_ULT.recoverWhiff = 30;
ORA_ULT.ult = { dmg: 1100, cutscene: (a, t) => csOracleInevitable(a, t), fx: { el: 'time', color: '#ffe08a', sky: ['#0a0a1a', '#2a1a3a', '#6a4a7a'] } };

const oracle = fighter({
  id: 'oracle', name: 'ORACLE', title: 'The Seer', side: 'HERO', role: 'Precognition · Traps · Fate', color: '#ffe08a', color2: '#2a1a3a',
  bio: 'A blind seer who sees every possible future at once. She has already seen this fight. She knows how it ends. She is not telling.',
  quote: 'I have seen this. You lose.', ending: 'Oracle sees a future where everyone lives happily. She spends the rest of her life making sure it happens. It does.',
  hp: 900, walk: 250, floaty: true, rival: 'echo',
  model: { build: 'slim', skin: '#e8d0c0', top: '#4a2a6a', pants: '#3a1a5a', skirt: '#5a3a7a', boots: '#ffe08a', hair: { type: 'long', color: '#fff0e0' }, mask: { type: 'band', color: '#ffe08a' }, emblem: { shape: 'eye', color: '#ffe08a' }, weapon: { type: 'orb', color: '#ffe08a' }, float: true },
  face: { expr: 'calm', eyes: '#ffe08a', mask: { type: 'band', color: '#ffe08a' } },
  gauge: { name: 'FATE', max: 100, color: '#ffe08a', label: f => ((f.gauge || 0) >= 100 ? '· DOUBLE FATE' : '') },
  passive: ['Foresight', 'Sees 12% of blows coming and slips aside, leaving an after-image (25% with the Third Eye). Each foreseen blow fills FATE; full FATE doubles her next Fated Strike.'],
  moves: { '5S': ORA_ORB, '6S': ORA_FATED, '2S': ORA_PRECOG, '4S': ORA_OMEN, 'jS': ORA_STARS },
  super: ORA_SUPER, ult: ORA_ULT, transformCutscene: f => csOracleEye(f),
  form: { name: 'THIRD EYE', desc: 'Permanent. The sight-band falls away: foresight doubles, her orb sees faster, and every strike lands a little harder.', dmg: 1.1 },
  assist: '6S',
  lines: { intro: ['I have already seen you lose, {opp}.', 'You will step left. Everyone does.', 'Hello. Goodbye.'], win: ['As foreseen.', 'I told you.', 'The future is settled.'], taunt: ['Predictable.', 'Left. Told you.'], form: ['My eye opens.'], ult: ['Inevitable.'], ultHit: ['As foreseen.'] },
});
oracle.ult = ORA_ULT; oracle.ultAct = 'strike'; ORA_SUPER.id = 'oracle_super';
// render with the pixel engine (falls back to the generic model art when pixel art is off)
{ const vec = oracle.draw; oracle.draw = (c, v) => PxKit.on() ? ORAPX.draw(c, v) : vec(c, v); oracle.drawPortrait = (c, o, d) => oraPortrait(c, o, d); }
oracle.onRoundStart = f => { f.gauge = 0; f.oraEye = 0; };
oracle.onHit = (a, t) => { a.gauge = Math.min(100, (a.gauge || 0) + 6); };
// Foresight: some blows are simply not where she is when they land
oracle.onIncoming = (t, a, h, opts) => {
  if (h.ultConnect || t.state === 'hit' || t.state === 'down' || t.invul > 0) return undefined;
  if (Math.random() >= (t.form ? 0.25 : 0.12)) return undefined;
  t.invul = 16; t.gauge = Math.min(100, (t.gauge || 0) + 30);
  Combat.addHazard({ kind: 'oraAfter', owner: t, side: t.side, x: t.x, who: t, dir: -(a && a.facing || 1), life: 24 });
  Game.popWorld(t.x, t.y - t.h - 30, 'FORESEEN', '#ffe08a', 20); oraSfx('oraDodge'); return null;
};
oracle.passiveTick = f => { if (f.oraEye > 0) f.oraEye--; };
oracle.drawWorldFront = (c, f) => {
  if (f.state === 'benched' || !f.form) return; const t = Game.t; // with the Third Eye open, a pale ghost trails the foe a moment ahead
  const o = f.opp; if (o && o.state !== 'ko' && o.state !== 'benched') { c.save(); c.globalAlpha = .18; c.globalCompositeOperation = 'lighter'; c.fillStyle = '#ffe9a8'; for (let i = 0; i < 4; i++) c.fillRect(Math.round((o.x + (o.vx || 0) * .6) / 3) * 3 - 6 + i * 4, o.y - o.h * (.2 + i * .22), 6, 6); c.restore(); }
};

// ---------------- cinematics ----------------
// a tree of timelines branching out from a point; k = how far it has grown
function oraTree(x, ox, oy, k, t, col = 'rgba(255,224,138,0.8)', collapse = 0) {
  const rec = (px, py, ang, len, depth, seed) => {
    if (depth > 6 || len < 8) return;
    const grow = clamp(k * 7 - depth, 0, 1); if (grow <= 0) return;
    const bend = Math.sin(seed * 12.9 + t * .3) * .15, a = ang + bend, ex = px + Math.cos(a) * len * grow, ey = py + Math.sin(a) * len * grow;
    const pull = collapse * (depth ? 1 : 0); const tx = lerp(ex, ox, pull * .85), ty = lerp(ey, oy - 60, pull * .85);
    x.strokeStyle = col; x.lineWidth = Math.max(2, 7 - depth); x.beginPath(); x.moveTo(px, py); x.lineTo(tx, ty); x.stroke();
    if (grow >= 1) { rec(ex, ey, a - .5 - (seed % .3), len * .72, depth + 1, seed * 1.7 + 1); rec(ex, ey, a + .5 + (seed % .3), len * .72, depth + 1, seed * 2.3 + 2); if (depth % 2 === 0) rec(ex, ey, a, len * .8, depth + 1, seed * 3.1); }
  };
  x.save(); x.lineCap = 'square';
  for (let i = 0; i < 5; i++) rec(ox, oy - 60, -Math.PI / 2 + (i - 2) * .55, 150, 0, i + 1);
  x.restore();
}
function oraStars(x, t, n = 70, col = '#ffe9a8') { x.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const tw = .4 + .6 * Math.abs(Math.sin(t * 1.5 + i)); x.fillStyle = col; x.globalAlpha = tw; x.fillRect((i * 97) % W, (i * 61) % (H * .8), 4 + (i % 3) * 2, 4 + (i % 3) * 2); } x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
// a pixel eye, opening: o = 0 shut .. 1 wide
function oraBigEye(c, cx, cy, s, o, glow) {
  c.save(); c.translate(cx, cy);
  if (glow) { c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, 0, 150 * s * o + 20, 'rgba(255,224,138,0.8)', 'rgba(0,0,0,0)'); c.globalCompositeOperation = 'source-over'; }
  const w = 120 * s, h = 62 * s * o; c.fillStyle = '#fff6d6'; c.beginPath(); c.moveTo(-w, 0); c.quadraticCurveTo(0, -h * 1.5, w, 0); c.quadraticCurveTo(0, h * 1.5, -w, 0); c.fill();
  c.fillStyle = '#e8a82a'; c.beginPath(); c.arc(0, 0, 44 * s * Math.min(1, o * 1.4), 0, 7); c.fill(); c.fillStyle = '#2a1a3a'; c.beginPath(); c.ellipse(0, 0, 14 * s, 40 * s * Math.min(1, o * 1.4), 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(-26 * s, -22 * s, 8 * s, 8 * s);
  c.strokeStyle = '#2a1a3a'; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(-w, 0); c.quadraticCurveTo(0, -h * 1.5 - 6 * s, w, 0); c.stroke(); c.restore();
}

// THIRD EYE — every future branches out at once, then collapses into the one she chooses.
function csOracleEye(f) {
  const fx = new ParticleSystem(700), A = PxKit.actor(f.def);
  return {
    name: 'THIRD EYE', dur: 6.0, fx,
    cues: [[0, () => oraSfx('oraWhisper')], [0.8, () => oraSfx('oraVision')], [1.7, () => oraSfx('oraShatter')], [2.4, () => oraSfx('oraEyeOpen')], [3.5, () => oraSfx('oraRewind', 0, 0.7)], [3.8, () => oraSfx('oraFlash')]],
    draw(c, t) {
      const grow = ease.out(seg(t, 0.2, 2.4)), crack = seg(t, 1.5, 2.3), open = ease.out(seg(t, 2.3, 3.2)), collapse = ease.inOut(seg(t, 3.3, 4.0)), hero = seg(t, 3.9, 4.6);
      PxKit.scene(c, x => {
        const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#07040f'); g.addColorStop(1, `rgb(${lerp(40, 80, open) | 0},${lerp(24, 50, open) | 0},${lerp(70, 110, open) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H);
        oraStars(x, t); x.globalCompositeOperation = 'lighter'; oraTree(x, W / 2, H - 120, grow, t, `rgba(255,224,138,${.7 * (1 - hero * .6)})`, collapse); x.globalCompositeOperation = 'source-over';
      }, .3);
      if (t < 2.4 || open < 1) { // she hovers in meditation, the band cracking
        const bob = Math.sin(t * 2.4) * 6;
        if (hero < 1) { c.save(); c.globalAlpha = 1 - hero; A(c, W / 2, H - 70 + bob - 40 * open, 3.0, t, 'cast_up', { transformed: false, oraEye: open > .1 ? 90 : 0 }); c.restore(); }
        if (crack > 0 && t < 3.0) for (let i = 0; i < 7; i++) fx.add({ x: W / 2 + 40 + rand(-30, 30), y: H - 70 - 100 * 3.0 + rand(-10, 10), vx: rand(-160, 160), vy: rand(-240, -40), life: 1.1, size: rand(4, 9), color: pick(['#ffe08a', '#c49a3a', '#fff']), g: 900 });
      }
      if (open > 0 && open <= 1 && t < 3.9) { c.save(); c.globalAlpha = Math.min(1, open * 1.5) * (1 - seg(t, 3.5, 3.9)); oraBigEye(c, W / 2, H * .36, 2.1 + collapse * .6, open, true); c.restore(); }
      if (hero > 0) { c.save(); c.globalAlpha = hero; A(c, W / 2, H - 70 + Math.sin(t * 2.4) * 6, 3.0 + hero * .3, t, 'victory', { transformed: true }); c.restore(); }
      fx.draw(c);
      caption(c, 'I have seen every way this ends.', t, 0.2, 2.2, '#ffe9a8');
      flashAt(c, t, 2.3, 2.7, '#fff6d6'); flashAt(c, t, 3.75, 4.1, '#ffffff');
      titleSlam(c, 'THIRD EYE', 'ALL FUTURES. ONE.', t, 4.6, '#ffe08a', 118);
    },
  };
}

// THE INEVITABLE — seven futures of the foe stand in a row; the light chooses none of them, and all of them.
function csOracleInevitable(a, opp) {
  const fx = new ParticleSystem(1800), A = PxKit.actor(a.def), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.55, poses = ['stun', 'block', 'jump', 'hurt', 'kick', 'walk', 'dash'];
  const clock = (x, cx, cy, R, t, shard) => {
    x.strokeStyle = '#ffe08a'; x.lineWidth = 14; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke(); x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, R * .86, 0, 7); x.stroke();
    for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6 - Math.PI / 2; x.fillStyle = '#fff3c8'; x.fillRect(cx + Math.cos(an) * R * .93 - 7, cy + Math.sin(an) * R * .93 - 7, 14, 14); }
    const hand = (an, L, w) => { x.strokeStyle = '#fff8e0'; x.lineWidth = w; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(an) * L, cy + Math.sin(an) * L); x.stroke(); };
    hand(t * 6 - 1.57, R * .78, 8); hand(t * .5 - 1.57, R * .52, 14);
  };
  return {
    name: 'THE INEVITABLE', dur: 8.2, fx,
    cues: [[0, () => oraSfx('oraWhisper')], [1.0, () => oraSfx('oraEyeOpen')], [2.2, () => oraSfx('oraVision')], [2.4, () => oraSfx('oraVision', 0.2)], [3.0, () => oraSfx('oraRewind', 0, 1.2)], [4.3, () => oraSfx('riser', 1.2, 0.26, 0, 150, 2600)], [5.5, () => { oraSfx('oraShatter'); oraSfx('aurSmite'); }], [6.4, () => oraSfx('oraEyeOpen', 0.3)]],
    draw(c, t) {
      const eye = ease.out(seg(t, 0.9, 1.9)), fut = seg(t, 2.1, 3.6), gather = ease.in(seg(t, 4.3, 5.5)), hit = t - 5.5, wreck = Math.max(0, hit);
      PxKit.scene(c, x => {
        const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05030c'); g.addColorStop(1, '#2a1a40'); x.fillStyle = g; x.fillRect(0, 0, W, H);
        oraStars(x, t, 80, '#ffe9a8'); x.globalCompositeOperation = 'lighter'; glowCircle(x, W / 2, H * .3, 380, `rgba(255,224,138,${.25 + .35 * gather})`, 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over';
        if (hit < 0.9) clock(x, W / 2, H * .3, 210 + gather * 40, t * (1 + gather * 6), 0);
        x.fillStyle = '#0a0614'; x.fillRect(0, H - 78, W, 78); x.fillStyle = '#4a3a70'; x.fillRect(0, H - 78, W, 5);
      }, .3);
      const gy = H - 78, ox = W * .7, ax = W * .16;
      // seven futures of the foe, each walking its own line
      if (hit < 0.12) {
        for (let i = 0; i < 7; i++) {
          const k = clamp(fut * 7 - i * .6, 0, 1); if (k <= 0) continue; const x = lerp(ox, W * .34 + i * 108, ease.out(k)), real = i === 3, sh = hit > -.2 && hit < 0.12 ? rand(-4, 4) : 0;
          c.save(); c.globalAlpha = (real ? 1 : .55) * Math.min(1, k * 2); c.translate(sh, 0);
          silhouette(c, o => drawCharAt(o, opp.def, x, gy + 4, oppScale * (real ? 1 : .94), -1, { pose: real ? 'block' : poses[i], anim: t + i, transformed: opp.transformed }), real ? '#ffe9a8' : (i % 2 ? '#8a6ac8' : '#c4a040'));
          c.restore();
          c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,224,138,${.5 * k})`; c.lineWidth = 3; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(ox, gy - 4); c.lineTo(x, gy - 4); c.stroke(); c.restore();
        }
      } else { // the light has fallen: ghosts burst into stars, one figure kneels
        silhouette(c, o => drawCharAt(o, opp.def, W * .52, gy + 4, oppScale, -1, { pose: 'kneel', anim: t, transformed: opp.transformed }), '#6a5a90');
      }
      // Oracle: floats at the left, the third eye open
      A(c, ax, gy - 40 + Math.sin(t * 2.4) * 6, 3.0, t, t < 4.3 ? 'cast_up' : 'victory', { transformed: true, oraEye: 90 });
      // the pillar
      if (t > 4.3) {
        const k = gather, w = 40 + k * 140 + (hit > 0 ? Math.max(0, 80 * (1 - hit * 1.5)) : 0);
        c.save(); c.globalCompositeOperation = 'lighter';
        const tx = W * .52; const gg = c.createLinearGradient(tx - w, 0, tx + w, 0); gg.addColorStop(0, 'rgba(255,230,150,0)'); gg.addColorStop(.5, `rgba(255,250,224,${hit > 0 ? Math.max(0, 1 - hit * .5) : k * .9})`); gg.addColorStop(1, 'rgba(255,230,150,0)');
        c.fillStyle = gg; c.fillRect(tx - w, 0, w * 2, H); for (let i = 0; i < 26; i++) { const sx = tx + ((i * 37) % 100 - 50) / 50 * w, sy = H - ((i * 83 + t * 400) % H); c.fillStyle = i % 2 ? '#fff' : '#ffe08a'; c.fillRect(Math.round(sx / 4) * 4, Math.round(sy / 4) * 4, 8, 8); }
        c.restore();
      }
      if (hit > 0 && hit < 0.12) for (let i = 0; i < 40; i++) fx.add({ x: rand(W * .3, W * .78), y: gy - rand(0, 200), vx: rand(-500, 500), vy: rand(-700, -100), life: 1.4, size: rand(5, 11), color: pick(['#ffe08a', '#fff', '#c4a0ff']), glow: true, g: 500 });
      fx.draw(c);
      if (t < 2.0) caption(c, 'I have already seen this moment.', t, 0.3, 1.9, '#ffe9a8');
      if (t > 2.2 && t < 4.2) caption(c, 'Seven futures. One ending.', t, 2.3, 4.1, '#ffe9a8');
      flashAt(c, t, 5.45, 6.0, '#ffffff');
      if (t > 6.6) titleSlam(c, 'THE INEVITABLE', 'AS FORESEEN', t, 6.7, '#ffe08a', 104);
    },
  };
}
rival('oracle', 'echo', [[0, 'You are going to say something clever. I have already forgotten what.'], [1, 'Funny. I did not see that coming.']],
  { oracle: 'As foreseen.', echo: 'Nobody sees everything. Not even you.' });
// keep Oracle where she was in the roster (just before Viper)
{ const o = ROSTER.pop(), i = ROSTER.findIndex(d => d.id === 'viper'); if (i >= 0) ROSTER.splice(i, 0, o); else ROSTER.push(o); }
