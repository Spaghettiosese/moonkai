// ============================================================
//  MOONKAI — MORDEKAISER, the Iron Revenant (League of Legends tribute). Remade in the pixel engine.
//
//  GAUGE   · INDESTRUCTIBLE  every point of damage he deals (and a little he takes) is banked as iron.
//                    ↓I spends it all as a shield for 3s. When the shield breaks or runs out it
//                    DETONATES: a shockwave of shattered iron that launches anyone close.
//  PASSIVE · DARKNESS RISE   three hits inside 4s wake a black storm that burns anyone near him.
//  OBLITERATE (5I)   Nightfall comes down in a line. The HEAD of the mace hits for +50%.
//  DEATH'S GRASP (→I)  a claw of darkness drags the foe to him.
//  CHILDREN OF THE GRAVE (←I)  curses the foe for 6s: their life drains into him, and a ring of
//                    grave-runes follows them wherever they run.
//  IRON FALL (air)   drops like an anvil. Ground bounce.
//  SUPER · GRAVE CHAINS  chains burst up in a ring, dragging everyone to the centre and slowing them.
//  LORD OF THE DEATH REALM  awakening: Darkness Rise never sleeps, iron banks twice as fast.
//  REALM OF DEATH    ultimate: a slow creeping tether of darkness. If it takes hold, the foe is
//                    pulled into the Death Realm: he returns holding a piece of them (+10% damage).
// ============================================================
const mkSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const MK_PAL = { build: 'giant', skin: '#2a3a3a', top: '#3a4a48', topDark: '#1e2a28', pants: '#2a3432', pantsDark: '#161e1c', boots: '#141a18', belt: '#6aff9a', glove: '#3a4a48', noHead: true, bracers: '#4a5a58', kneepads: '#4a5a58' };
const MK_LORD_PAL = Object.assign({}, MK_PAL, { top: '#1a2422', topDark: '#0e1412', belt: '#9affc0' });

function drawNightfall(c, x, y, ang, glow) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.strokeStyle = '#1a2220'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-20, 0); c.lineTo(96, 0); c.stroke();
  c.fillStyle = '#3a4a48'; c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(90, -18); c.lineTo(124, -22); c.lineTo(134, 0); c.lineTo(124, 22); c.lineTo(90, 18); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1a2220'; for (const [a, b] of [[104, -22], [118, -24], [104, 22], [118, 24], [134, 0]]) { c.beginPath(); c.moveTo(a - 4, b * 0.8); c.lineTo(a + (b ? 0 : 12), b ? b + Math.sign(b) * 10 : 0); c.lineTo(a + 4, b * 0.8); c.fill(); }
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 112, 0, 16 + glow * 18, `rgba(110,255,160,${0.5 + 0.5 * glow})`, 'rgba(0,0,0,0)'); c.restore();
  c.restore();
}
function drawMordekaiser(c, v) {
  const t = v.anim || 0, L = !!v.transformed, m = v.move, storm = v.mkStorm > 0;
  if (storm) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { c.strokeStyle = `rgba(90,255,150,${0.35 - i * 0.08})`; c.lineWidth = 6; c.beginPath(); c.ellipse(0, -90, 120 - i * 14, 60, 0, t * 3 + i * 2, t * 3 + i * 2 + 3.5); c.stroke(); } c.restore(); }
  drawHumanoid(c, v, L ? MK_LORD_PAL : MK_PAL, {
    back(c, P) { // tattered cape of shadow
      c.fillStyle = '#0a1210'; c.beginPath(); c.moveTo(P.sh[0] - 14, P.sh[1]); c.lineTo(P.sh[0] - 44, P.hip[1] + 60); for (let i = 0; i < 6; i++) c.lineTo(P.sh[0] - 40 + i * 9, P.hip[1] + 44 + (i % 2) * 18 + Math.sin(t * 4 + i) * 4); c.lineTo(P.sh[0] + 6, P.sh[1] + 8); c.fill();
    },
    chest(c, P) { // iron breastplate with a glowing seam
      const x = lerp(P.hip[0], P.sh[0], 0.6), y = lerp(P.hip[1], P.sh[1], 0.6);
      c.fillStyle = '#4a5a58'; c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 16, y - 16); c.lineTo(x + 16, y - 16); c.lineTo(x + 12, y + 16); c.lineTo(x, y + 22); c.lineTo(x - 12, y + 16); c.closePath(); c.fill(); c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(110,255,160,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x, y + 18); c.stroke(); c.restore();
    },
    pads(c, P) { // massive spiked pauldrons
      c.fillStyle = '#3a4a48'; c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(P.sh[0], P.sh[1] - 2, 18, 12, -0.2, Math.PI, 0); c.fill(); c.stroke();
      c.fillStyle = '#1a2220'; for (const dx of [-12, -2, 8]) { c.beginPath(); c.moveTo(P.sh[0] + dx - 3, P.sh[1] - 10); c.lineTo(P.sh[0] + dx, P.sh[1] - 28); c.lineTo(P.sh[0] + dx + 3, P.sh[1] - 10); c.fill(); }
    },
    head(c, P) { // a crowned helm with nothing inside but green light
      const [hx, hy] = P.head;
      c.fillStyle = '#3a4a48'; c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(hx - 12, hy + 12); c.lineTo(hx - 13, hy - 10); c.lineTo(hx + 12, hy - 12); c.lineTo(hx + 14, hy + 10); c.lineTo(hx + 4, hy + 14); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#1a2220'; for (let i = 0; i < 5; i++) { const x = hx - 11 + i * 5.5; c.beginPath(); c.moveTo(x - 2.5, hy - 10); c.lineTo(x, hy - 22 - (i === 2 ? 10 : i % 2 ? 4 : 0)); c.lineTo(x + 2.5, hy - 10); c.fill(); }
      c.fillStyle = '#050808'; c.fillRect(hx - 2, hy - 4, 16, 5);
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 1.5, L ? 11 : 8, 'rgba(110,255,160,1)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#caffd8'; c.fillRect(hx + 3, hy - 2.5, 9, 2);
    },
    front(c, P) {
      const swing = m && (m.name === 'Obliterate' || m.name === 'Nightfall');
      const ang = swing ? lerp(-2.6, 0.9, clamp((v.mf || 0) / ((m.s || 10) + 2), 0, 1)) : ({ heavy: 0.8, slam: 1.1, dash: 0.3, uppercut: -1.4, air_spike: 1.3, hurt: 2.2, victory: -1.57, intro: 1.2, cast: -0.4, cast_up: -1.5 }[v.pose] ?? -2.2);
      drawNightfall(c, P.fH[0], P.fH[1], ang, swing ? 1 : L ? 0.5 : 0.2);
    },
  });
}
function drawMordekaiserPortrait(c, opts) {
  const L = !!opts.form;
  c.fillStyle = '#020605'; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50, 60, 70, L ? 'rgba(60,200,120,0.3)' : 'rgba(40,140,90,0.2)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#3a4a48'; c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.5;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 20, 100); c.quadraticCurveTo(50 + s * 50, 70, 50 + s * 48, 100); c.fill(); c.stroke(); c.fillStyle = '#1a2220'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(50 + s * (30 + i * 6) - 3, 82); c.lineTo(50 + s * (30 + i * 6), 60 + i * 4); c.lineTo(50 + s * (30 + i * 6) + 3, 82); c.fill(); } c.fillStyle = '#3a4a48'; }
  c.beginPath(); c.moveTo(28, 90); c.lineTo(26, 36); c.lineTo(50, 28); c.lineTo(74, 36); c.lineTo(72, 90); c.lineTo(50, 96); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1a2220'; for (let i = 0; i < 7; i++) { const x = 28 + i * 7.3; c.beginPath(); c.moveTo(x - 3, 36); c.lineTo(x, 36 - (i === 3 ? 30 : 12 + (i % 2) * 8)); c.lineTo(x + 3, 36); c.fill(); }
  c.fillStyle = '#020303'; c.beginPath(); c.moveTo(32, 50); c.lineTo(68, 50); c.lineTo(64, 60); c.lineTo(36, 60); c.closePath(); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 9, 55, L ? 12 : 8, 'rgba(110,255,160,1)', 'rgba(0,0,0,0)'); c.restore();
  for (const s of [-1, 1]) { c.fillStyle = '#e0ffe8'; c.beginPath(); c.moveTo(50 + s * 3, 55); c.lineTo(50 + s * 15, 53); c.lineTo(50 + s * 13, 57); c.closePath(); c.fill(); }
  c.strokeStyle = '#0a0e0e'; c.lineWidth = 1.2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(38 + i * 6, 66); c.lineTo(38 + i * 6, 86); c.stroke(); }
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(110,255,160,0.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(50, 60); c.lineTo(50, 94); c.stroke(); c.restore();
}


// ---------------- pixel art ----------------
const mkQ = (x, k = 4) => Math.round(x * k) / k;
const MKPX = PixelArt.make({
  id: 'mordekaiser', win: [-170, -285, 420, 335], B: 1.12, trail: 'rgba(106,255,154,',
  state(v, t, st) {
    const L = !!v.transformed, m = v.move, swing = !!(m && (m.name === 'Obliterate' || m.name === 'Nightfall'));
    const tgt = swing ? lerp(-2.6, 0.9, clamp((v.mf || 0) / ((m.s || 10) + 2), 0, 1)) : ({ heavy: .8, slam: 1.1, dash: .3, uppercut: -1.4, air_spike: 1.3, hurt: 2.2, victory: -1.57, intro: 1.2, cast: -.4, cast_up: -1.5, kneel: .6 }[v.pose] ?? -2.2);
    const ang = MKPX.ease(st, 'ang', tgt, swing ? .75 : .45);
    return { L, swing: swing ? 1 : 0, ang: Math.round(ang * 30) / 30, cape: mkQ(Math.sin(t * 4)), storm: v.mkStorm > 0 ? 1 : 0, shield: v.status && v.status.shield > 0 ? 1 : 0 };
  },
  body(g, P, s) {
    const L = s.L, { L: lerpPt } = g;
    const iron = L ? ['#2c3a38', '#161f1e'] : ['#4a5c5a', '#2a3836'], ironF = L ? ['#161f1e', '#0a100f'] : ['#2a3836', '#18201f'], dark = ['#1a2422', '#0a1210'];
    const info = {};
    g.humanoid(P, { limb: 1.5, bulk: 1.7, hips: 1.25, skin: iron, skinFar: ironF, noHead: true, bareArms: false,
      top: iron, topFar: ironF, pants: L ? ['#1c2624', '#0e1514'] : ['#34423f', '#1e2826'], pantsFar: ironF, boots: ['#141c1a', '#080c0b'], bootsFar: ['#0e1514', '#050807'],
      belt: ['#6aff9a', '#2a9a5a'], bracers: ['#586c69', '#364644'], kneepads: ['#586c69', '#364644'], glove: ['#2a3836', '#141c1a'], gloveFar: ['#18201f', '#0a100f'] }, {
      back(P) { // tattered cape of shadow
        const pts = [[P.sh[0] - 14, P.sh[1]], [P.sh[0] - 44, P.hip[1] + 60]];
        for (let i = 0; i < 6; i++) pts.push([P.sh[0] - 40 + i * 9, P.hip[1] + 44 + (i % 2) * 18 + s.cape * 3 * (i % 3 ? 1 : -1)]);
        pts.push([P.sh[0] + 6, P.sh[1] + 8]);
        g.paint([g.poly(pts)], '#0e1a17', '#050b09');
        if (L) g.line([[P.sh[0] - 20, P.sh[1] + 10], [P.sh[0] - 34, P.hip[1] + 40]], '#2aff7a', 1.2);
      },
      chest(P) { // iron breastplate with a glowing seam
        const x = lerpPt(P.hip, P.sh, .6)[0], y = lerpPt(P.hip, P.sh, .6)[1];
        g.paint([g.poly([[x - 16, y - 16], [x + 16, y - 16], [x + 12, y + 16], [x, y + 22], [x - 12, y + 16]])], '#5a6e6b', '#34443f');
        g.line([[x, y - 14], [x, y + 18]], '#6aff9a', 2); g.line([[x - 10, y - 6], [x - 4, y - 2]], '#3a8a5a', 1.4); g.line([[x + 10, y - 6], [x + 4, y - 2]], '#3a8a5a', 1.4);
      },
      pads(P) {
        // massive spiked pauldron, then the crowned helm
        g.paint([g.ell(P.sh[0], P.sh[1] - 2, 19, 12, -.2, Math.PI, 0), g.ell(P.sh[0], P.sh[1] - 2, 19, 12, -.2, Math.PI, Math.PI * 2)], '#5a6e6b', '#34443f');
        g.paint([-12, -2, 8].map(dx => g.poly([[P.sh[0] + dx - 3, P.sh[1] - 10], [P.sh[0] + dx, P.sh[1] - 28], [P.sh[0] + dx + 3, P.sh[1] - 10]])), '#232e2c', '#0e1514');
        const [hx, hy] = P.head;
        g.paint([g.poly([[hx - 12, hy + 12], [hx - 13, hy - 10], [hx + 12, hy - 12], [hx + 14, hy + 10], [hx + 4, hy + 14]])], '#5a6e6b', '#34443f');
        g.paint([0, 1, 2, 3, 4].map(i => { const x = hx - 11 + i * 5.5; return g.poly([[x - 2.5, hy - 10], [x, hy - 22 - (i === 2 ? 10 : i % 2 ? 4 : 0) - (L ? 4 : 0)], [x + 2.5, hy - 10]]); }), '#232e2c', '#0e1514');
        g.fill(g.poly([[hx - 2, hy - 4], [hx + 14, hy - 4], [hx + 14, hy + 1], [hx - 2, hy + 1]]), '#030505');
        g.fill(g.poly([[hx + 3, hy - 3.5], [hx + 12, hy - 3.5], [hx + 12, hy - 1.5], [hx + 3, hy - 1.5]]), '#d8ffe4');
        g.line([[hx + 2, hy + 6], [hx + 12, hy + 6]], '#1a2422', 1.4);
      },
      front(P) { // NIGHTFALL: haft, spiked iron head, green core
        const [hx, hy] = P.fH, a = s.ang, ca = Math.cos(a), sa = Math.sin(a), pt = (u, w) => [hx + ca * u - sa * w, hy + sa * u + ca * w];
        g.line([pt(-20, 0), pt(96, 0)], '#141c1a', 6);
        g.line([pt(-20, 0), pt(96, 0)], '#2c3836', 3);
        g.paint([g.poly([pt(90, -18), pt(124, -22), pt(134, 0), pt(124, 22), pt(90, 18)])], '#5a6e6b', '#2a3836');
        g.paint([[104, -22], [118, -24], [104, 22], [118, 24]].map(([u, w]) => g.poly([pt(u - 4, w * .8), pt(u + 1, w + Math.sign(w) * 12), pt(u + 5, w * .8)])).concat(g.poly([pt(130, -5), pt(146, 0), pt(130, 5)])), '#2c3836', '#0e1514');
        g.fill(g.ell(...pt(112, 0), 6, 6), s.swing || L ? '#6aff9a' : '#2f7a4a'); g.fill(g.ell(...pt(112, 0), 2.6, 2.6), '#e8fff0');
        info.mace = pt(112, 0);
      },
    });
    return info;
  },
  pre(c, v, P, s) {
    if (s.L) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -80, 130, 'rgba(60,220,120,0.22)', 'rgba(0,0,0,0)'); c.restore(); }
    if (s.storm) { const t = v.anim || 0; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { c.strokeStyle = `rgba(90,255,150,${.35 - i * .08})`; c.lineWidth = 6; c.beginPath(); c.ellipse(0, -90, 120 - i * 14, 60, 0, t * 3 + i * 2, t * 3 + i * 2 + 3.5); c.stroke(); } c.restore(); }
  },
  post(c, v, P, s, info) {
    const t = v.anim || 0, [hx, hy] = P.head;
    c.save(); c.globalCompositeOperation = 'lighter';
    glowCircle(c, hx + 8, hy - 2, s.L ? 12 : 8, 'rgba(110,255,160,1)', 'rgba(0,0,0,0)');
    if (info && info.mace) glowCircle(c, info.mace[0], info.mace[1], 16 + (s.swing ? 22 : 0) + (s.L ? 6 : 0), `rgba(110,255,160,${s.swing ? .9 : .5})`, 'rgba(0,0,0,0)');
    if (s.L) for (let i = 0; i < 9; i++) { // crown of green flame
      const fx = hx - 12 + i * 3, h = 16 + Math.sin(t * 9 + i * 1.7) * 6 + (i === 4 ? 10 : 0);
      c.fillStyle = i % 2 ? 'rgba(120,255,170,0.8)' : 'rgba(230,255,240,0.8)'; c.fillRect(Math.round(fx), Math.round(hy - 26 - h), 3, Math.round(h));
    }
    if (s.shield) { c.strokeStyle = 'rgba(140,255,190,0.75)'; c.lineWidth = 3; c.setLineDash([6, 4]); c.beginPath(); c.arc(0, -90, 92, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); }
    c.restore();
  },
});
const mkPortrait = PxKit.portrait('mordekaiser', drawMordekaiserPortrait, { res: 64, levels: 8, dither: 0.3 });

// ---------------- kit ----------------
const mkIsolated = f => { const o = f.opp; if (!o) return false; return !Combat.projectiles.some(p => p.owner === o) && !Combat.hazards.some(h => h.owner === o && h.kind !== 'telegraph'); };
const MK_OBLIT = mk({ name: 'Obliterate', desc: 'Nightfall comes down in a line. The mace HEAD (far end) hits for +50%; isolated foes take +20%.', pose: 'slam', s: 16, a: 5, r: 20, ai: { min: 60, max: 240, use: 'combo' },
  hit: { dmg: 80, box: [10, -150, 200, 150], kb: [400, -300], hs: 22, sfx: 'h' },
  ev: { 4: () => mkSfx('morSwing') },
  onHit: (a, t) => { const d = Math.abs(t.x - a.x); let bonus = 0; if (d > 150 * a.scale) { bonus += 40; Game.popWorld(t.x, t.y - t.h - 30, 'OBLITERATED', '#6aff9a', 20); } if (mkIsolated(a)) bonus += 16; if (bonus && t.hp > 1) t.hp = Math.max(1, t.hp - bonus); mkSfx('morClang'); Combat.addHazard({ kind: 'mkCrack', owner: a, side: a.side, x: t.x, life: 26 }); } });
const MK_GRASP = mk({ name: 'Death\'s Grasp', desc: 'A claw of darkness bursts out at range and drags the foe to him.', pose: 'cast', s: 14, a: 8, r: 20, ai: { min: 200, max: 480, use: 'zone' },
  hit: { dmg: 60, box: [200, -150, 190, 150], kb: [0, 0], hs: 20, sfx: 'm' },
  onHit: (a, t) => { t.x = clamp(a.x + a.facing * 90, 40, Arena.stage.width - 40); t.vx = 0; t.status.slow = Math.max(t.status.slow || 0, 1); Game.fx.burst(t.x, t.y - 70, 14, { color: ['#6aff9a', '#0a1210'], size: 8, speed: 300, life: 0.4 }); mkSfx('morChain'); },
  ev: { 4: () => mkSfx('morSoul'), 14: f => Combat.addHazard({ kind: 'mkClaw', owner: f, side: f.side, x: f.x + f.facing * 290 * f.scale, facing: f.facing, life: 18 }) } });
const MK_SHIELD = mk({ name: 'Indestructible', desc: 'Spends all of the INDESTRUCTIBLE gauge as a shield (3s). When it breaks or fades it detonates in a shockwave of iron.', pose: 'charge', s: 10, a: 1, r: 14, ai: { min: 0, max: 1500, use: 'buff' },
  ev: { 10: f => { const g = f.gauge || 0; if (g < 15) { Game.popWorld(f.x, f.y - f.h - 30, 'NOT ENOUGH IRON', '#aab', 16); return; } f.status.shield = Math.round(g * 3); f.status.shieldT = 3; f.gauge = 0; Game.popWorld(f.x, f.y - f.h - 30, 'INDESTRUCTIBLE', '#6aff9a', 20); mkSfx('morClang'); } } });
const MK_CURSE = mk({ name: 'Children of the Grave', desc: 'Curses the foe for 6s: their life drains into him, and a ring of grave-runes follows them.', pose: 'cast_up', s: 18, a: 1, r: 24, cd: 7, ai: { min: 0, max: 620, use: 'zone' },
  ev: { 3: () => mkSfx('morSoul'), 18: f => { const t = f.opp; if (!t || Math.abs(t.x - f.x) > 680 || t.state === 'ko') { Game.popWorld(f.x, f.y - f.h - 30, 'NO TARGET', '#aab', 16); return; } t.mkCurse = { by: f, t: 6 * FPS }; Game.popWorld(t.x, t.y - t.h - 40, 'CURSED', '#6aff9a', 22); Combat.addHazard({ kind: 'mkRunes', owner: f, side: f.side, x: t.x, life: 22 }); mkSfx('morToll'); } } });
const MK_DROP = Mv.dive({ name: 'Iron Fall', desc: 'He drops like an anvil. Ground bounce.', vx: 200, vy: 1600, hit: { dmg: 110, gb: true } });
const MK_SUPER = superize(mk({ name: 'Grave Chains', desc: 'Chains burst up in a ring: everything inside is dragged to the centre and slowed, and Darkness Rise ignites at once.', pose: 'cast_up', s: 16, a: 16, r: 20,
  ev: { 16: f => { f.mkStorm = 5 * FPS; Combat.addHazard({ kind: 'mkChains', owner: f, side: f.side, x: f.x, r: 360, life: 40 }); mkSfx('morChain'); mkSfx('morGrave'); Cam.shake = 10; f.say('Kneel.', 50); } } }), 100);
const MK_ULT = superize(mk({ name: 'REALM OF DEATH', desc: 'A slow tether of darkness creeps out. If it takes hold, the foe is dragged into the Death Realm, and he keeps a piece of them: +10% damage for the round. Blockable. Must connect.', pose: 'cast', s: 24, a: 10, r: 30,
  ev: { 2: f => { f.say('Your soul is mine.', 80); mkSfx('morDeathChoir', 0, 2); mkSfx('riser', 1.1, 0.2, 0.1, 80, 600); }, 24: f => { mkSfx('morSoul'); Combat.fireShots(f, { speed: 420, r: 40, dmg: 10, kind: 'orb', color: '#2aff7a', prio: 3, ultConnect: true, hs: 60, kb: [0, 0], life: 4.5 }); } } }), 300);
MK_ULT.id = 'mordekaiser_ult'; MK_ULT.recoverWhiff = 30;
MK_ULT.ult = { dmg: 1150, cutscene: (a, t) => csMordekaiserRealm(a, t), fx: { el: 'void', color: '#6aff9a' }, after: a => { a.mkStolen = true; Game.popWorld(a.x, a.y - a.h - 40, 'SOUL STOLEN +10%', '#6aff9a', 22); mkSfx('morHeal'); } };

const mordekaiser = fighter({
  id: 'mordekaiser', name: 'MORDEKAISER', title: 'The Iron Revenant', side: 'VILLAIN', role: 'Juggernaut · Iron shield · Soul thief', color: '#6aff9a', color2: '#0a1210',
  bio: 'Twice slain and thrice born, a warlord who conquered death itself and built a kingdom there. Every soul he takes becomes a subject in the Realm of Death. He is here to recruit.',
  quote: 'Your soul will serve me for eternity.',
  ending: 'Mordekaiser drags the whole of Metro City into the Death Realm for one night, then lets it go. "A census," he says. "I needed to see who was worth taking later."',
  hp: 1200, walk: 200, weight: 1.25, scale: 1.12, rival: 'sion', handArt: true,
  draw: (c, v) => PxKit.on() ? MKPX.draw(c, v) : drawMordekaiser(c, v),
  drawPortrait: (c, o, d) => PxKit.on() ? mkPortrait(c, o, d) : drawMordekaiserPortrait(c, o),
  transformCutscene: f => csMordekaiserLord(f),
  tall: 1.15, wide: 1.4, weaponTip: 150,
  model: { skin: '#2a3a3a' }, face: { expr: 'angry' }, style: { reach: 1.25, power: 1.2, speed: 1.15, heavy: true, weapon: true },
  gauge: { name: 'INDESTRUCTIBLE', max: 100, color: '#6aff9a', label: f => (f.mkStorm > 0 ? '· DARKNESS RISE' : '') + (f.mkStolen ? ' · SOUL' : '') },
  passive: ['Darkness Rise', 'Land three hits within 4s and a black storm wakes around him, burning anyone close every half second while he keeps hitting. A broken shield detonates.'],
  moves: { '5S': MK_OBLIT, '6S': MK_GRASP, '2S': MK_SHIELD, '4S': MK_CURSE, 'jS': MK_DROP },
  super: MK_SUPER, ult: MK_ULT,
  form: { name: 'LORD OF THE DEATH REALM', desc: 'Permanent. Darkness Rise never sleeps, iron banks twice as fast, and his armor thickens.', cost: 200, armor: 0.85, dmg: 1.08, scale: 1.1 },
  assist: '6S',
  lines: {
    intro: ['Kneel, {opp}.', 'Another soul for the Realm.', 'I have died twice. You will not manage it once.'],
    win: ['Your soul is mine.', 'Serve me.', 'Death is only the beginning.'],
    taunt: ['Kneel.', 'Futile.'], form: ['BEHOLD MY DOMINION!'], ult: ['Your soul is mine.'], ultHit: ['Eternity awaits.'], tag: ['Step aside.'], enter: ['I have returned.'], assist: ['Grasp!'], moves: ['OBLITERATE!', 'Fall!', 'Iron.'],
  },
});
mordekaiser.ult = MK_ULT; mordekaiser.ultAct = 'shot'; MK_SUPER.id = 'mordekaiser_super';
mordekaiser.passiveDmg = f => (f.mkStolen ? 1.1 : 1);
mordekaiser.onRoundStart = f => { f.gauge = 0; f.mkStorm = 0; f.mkHits = []; f.mkStolen = false; f.mkShWas = false; };
mordekaiser.onHit = (a, t, dmg) => {
  a.gauge = Math.min(100, (a.gauge || 0) + dmg * (a.form ? 0.2 : 0.1));
  a.mkHits = (a.mkHits || []).filter(s => a.st - s < 4 * FPS); a.mkHits.push(a.st);
  if (a.mkHits.length >= 3 || a.mkStorm > 0) { if (!(a.mkStorm > 0)) { Game.popWorld(a.x, a.y - a.h - 40, 'DARKNESS RISE', '#6aff9a', 20); mkSfx('morGrave'); } a.mkStorm = 4 * FPS; }
};
mordekaiser.onHurt = (t, a, dmg) => { t.gauge = Math.min(100, (t.gauge || 0) + dmg * 0.04); };
mordekaiser.passiveTick = f => {
  if (f.form) f.mkStorm = Math.max(f.mkStorm || 0, 2);
  if (f.mkStorm > 0) {
    f.mkStorm--;
    if (f.st % 30 === 0) for (const o of Combat.targets(f.side)) if (Math.abs(o.x - f.x) < 150 * f.scale && o.state !== 'ko') { o.hp = Math.max(1, o.hp - (f.form ? 14 : 10)); o.red = Math.max(o.red, o.hp); Game.fx.add({ x: o.x, y: o.y - 60, vx: 0, vy: -80, life: 0.4, size: 8, color: '#6aff9a', glow: true }); }
  }
  // a shield that breaks or fades detonates
  const sh = f.status.shield > 0;
  if (f.mkShWas && !sh && f.state !== 'ko') {
    Combat.strikeZone(f, { x: f.x - 210, y: -170, w: 420, h: 172 }, { dmg: 58, guard: 'mid', hs: 24, kb: [520, -520], launch: true, sfx: 'h' }, { move: null, noConnect: true });
    Combat.addHazard({ kind: 'mkShock', owner: f, side: f.side, x: f.x, life: 24 }); Cam.shake = Math.max(Cam.shake, 12); mkSfx('morGrave'); Game.popWorld(f.x, f.y - f.h - 30, 'IRON SHATTERS', '#6aff9a', 20);
  }
  f.mkShWas = sh;
  // Children of the Grave: the cursed foe bleeds life into him
  for (const o of Combat.targets(f.side)) if (o.mkCurse && o.mkCurse.by === f) {
    if (o.state === 'ko' || --o.mkCurse.t <= 0) { o.mkCurse = null; continue; }
    if (o.mkCurse.t % 15 === 0 && o.hp > 1) { const d = f.form ? 6 : 4; o.hp = Math.max(1, o.hp - d); o.red = Math.max(o.red, o.hp); f.hp = Math.min(f.maxHp, f.hp + d * .6); if (o.mkCurse.t % 60 === 0) mkSfx('morHeal'); Game.fx.add({ x: o.x, y: o.y - 50, vx: (f.x - o.x) * .8, vy: -120, life: .7, size: 5, color: '#6aff9a', glow: true }); }
  }
};
mordekaiser.drawWorldFront = (c, f) => {
  if (f.state === 'benched') return;
  const t = Game.t;
  for (const o of Combat.targets(f.side)) if (o.mkCurse && o.mkCurse.by === f) { // a ring of grave-runes around the cursed foe's feet
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 10; i++) { const a = i * .628 + t * 1.8, x = o.x + Math.cos(a) * 52, y = o.y - 4 + Math.sin(a) * 12; c.fillStyle = i % 3 ? 'rgba(106,255,154,0.85)' : 'rgba(230,255,240,0.9)'; c.fillRect(Math.round(x / 3) * 3, Math.round(y / 3) * 3, 5, 5); }
    c.fillStyle = `rgba(106,255,154,${.35 + .2 * Math.sin(t * 8)})`; c.fillRect(Math.round(o.x / 3) * 3 - 3, Math.round((o.y - o.h - 18) / 3) * 3, 6, 6);
    c.restore();
  }
};
Combat.hz.mkClaw = h => h.t < h.life;
Combat.drawHz.mkClaw = (c, h) => {
  const k = h.t / h.life, up = Math.sin(k * Math.PI);
  c.save(); c.fillStyle = `rgba(10,18,16,${0.9 * up})`; c.strokeStyle = `rgba(110,255,160,${up})`; c.lineWidth = 3;
  for (let i = 0; i < 4; i++) { const x = h.x + (i - 1.5) * 26; c.beginPath(); c.moveTo(x - 8, 0); c.quadraticCurveTo(x - 10 - h.facing * 10, -80 * up, x + h.facing * 20, -130 * up); c.quadraticCurveTo(x, -70 * up, x + 8, 0); c.closePath(); c.fill(); c.stroke(); }
  c.restore();
};
Combat.hz.mkChains = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  if (h.t === 6) for (const o of Combat.targets(f.side)) if (Math.abs(o.x - h.x) < h.r) {
    const r = Combat.resolveHit(o, f, H_({ dmg: 120, guard: 'mid', hs: 26, kb: [0, -300], status: { slow: 2.5 }, sfx: 'h' }), { proj: true, fromX: h.x, move: MK_SUPER });
    if (r === 'hit') o.x = clamp(h.x + f.facing * 90, 40, Arena.stage.width - 40);
  }
  return h.t < h.life;
};
Combat.drawHz.mkChains = (c, h) => {
  const k = h.t / h.life, up = Math.min(1, h.t / 6) * (1 - Math.max(0, k - 0.7) / 0.3);
  c.save(); c.strokeStyle = '#6a7e7b'; c.lineWidth = 5; c.setLineDash([8, 5]);
  for (let i = 0; i < 10; i++) { const x = h.x + (i / 9 - 0.5) * h.r * 2; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x, -180 * up, h.x, -110 * up); c.stroke(); }
  c.setLineDash([]); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -40, h.r * 0.8, `rgba(90,255,150,${0.25 * up})`, 'rgba(0,0,0,0)'); c.restore();
};
// pixel iron shockwave when a shield breaks
Combat.hz.mkShock = h => h.t < h.life;
Combat.drawHz.mkShock = (c, h) => {
  const k = h.t / h.life, R = 230 * ease.out(k); c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, x = h.x + Math.cos(a) * R, y = -8 + Math.sin(a) * R * .22; c.fillStyle = i % 2 ? `rgba(110,255,160,${1 - k})` : `rgba(230,255,240,${1 - k})`; c.fillRect(Math.round(x / 4) * 4, Math.round(y / 4) * 4, 8, 8); }
  glowCircle(c, h.x, -20, 120 * (1 - k) + 40, `rgba(90,255,150,${.5 * (1 - k)})`, 'rgba(0,0,0,0)'); c.restore();
};
// ground fracture where Nightfall lands
Combat.hz.mkCrack = h => h.t < h.life;
Combat.drawHz.mkCrack = (c, h) => {
  const k = h.t / h.life, a = 1 - k; c.save(); c.strokeStyle = `rgba(110,255,160,${a})`; c.lineWidth = 3; c.lineCap = 'square';
  for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(h.x, 0); c.lineTo(h.x + i * 22 * (.4 + k), -6 - Math.abs(i) * 3 * (1 - k)); c.lineTo(h.x + i * 38 * (.4 + k), 2); c.stroke(); }
  c.restore();
};
// runes spiralling in around a freshly cursed foe
Combat.hz.mkRunes = h => h.t < h.life;
Combat.drawHz.mkRunes = (c, h) => {
  const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 16; i++) { const a = i * .39 + k * 7, r = 150 * (1 - k) + 30, x = h.x + Math.cos(a) * r, y = -10 + Math.sin(a) * r * .22 - k * 90; c.fillStyle = i % 2 ? '#6aff9a' : '#e8fff0'; c.fillRect(Math.round(x / 3) * 3, Math.round(y / 3) * 3, 6, 6); }
  c.restore();
};

// ---------------- cinematics ----------------
// The Death Realm backdrop: sickly sky, floating ruins, a far throne, rising souls. k = how green the world is.
function mkRealmBg(x, t, k = 1, hall = false) {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#010503'); g.addColorStop(.6, `rgb(${lerp(6, 8, k) | 0},${lerp(14, 40, k) | 0},${lerp(14, 26, k) | 0})`); g.addColorStop(1, `rgb(${lerp(10, 12, k) | 0},${lerp(24, 70, k) | 0},${lerp(24, 40, k) | 0})`);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'lighter'; glowCircle(x, W / 2, H * .34, 300, `rgba(60,230,130,${.22 * k})`, 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over';
  // the throne, huge and far away
  x.fillStyle = '#04100c'; x.fillRect(W / 2 - 90, H * .2, 180, H * .45); for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(W / 2 - 90 + i * 45, H * .2); x.lineTo(W / 2 - 68 + i * 45, H * .06 - (i === 2 ? 40 : 0)); x.lineTo(W / 2 - 45 + i * 45, H * .2); x.fill(); }
  // floating ruins
  for (let i = 0; i < 9; i++) { const rx = (i * 173 + t * 14) % (W + 200) - 100, ry = 90 + (i % 4) * 70 + Math.sin(t * .8 + i) * 12; x.fillStyle = '#071a12'; x.fillRect(rx, ry, 70 + (i % 3) * 20, 22 + (i % 2) * 16); x.fillStyle = '#0b2a1c'; x.fillRect(rx, ry, 70 + (i % 3) * 20, 5); }
  // columns of rising souls
  x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) { const sx = (i * 97) % W, sy = H - ((t * (30 + (i % 6) * 14) + i * 61) % (H + 40)); x.fillStyle = i % 4 ? `rgba(100,255,160,${.5 * k})` : `rgba(235,255,245,${.7 * k})`; x.fillRect(sx, sy, 4, 6 + (i % 3) * 3); }
  x.globalCompositeOperation = 'source-over';
  x.fillStyle = '#04100c'; x.fillRect(0, H - 78, W, 78); x.fillStyle = '#0b3a24'; x.fillRect(0, H - 78, W, 5);
  if (hall) for (let r = 0; r < 3; r++) for (let i = 0; i < 18; i++) { const px_ = 20 + i * (W - 40) / 17 + (r % 2) * 22, py = H - 70 + r * 22; x.fillStyle = r ? '#02080a' : '#061410'; x.beginPath(); x.ellipse(px_, py, 15, 26, 0, Math.PI, 0); x.fill(); x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(100,255,160,0.9)'; x.fillRect(px_ + 2, py - 20, 4, 3); x.globalCompositeOperation = 'source-over'; }
}

// LORD OF THE DEATH REALM — the dead rise from their rows and pour themselves into the armor.
function csMordekaiserLord(f) {
  const fx = new ParticleSystem(900), A = PxKit.actor(f.def);
  let last = 0;
  return {
    name: 'LORD OF THE DEATH REALM', dur: 6.0, fx,
    cues: [[0, () => mkSfx('morToll')], [1.3, () => mkSfx('morDeathChoir', 0, 3)], [1.5, () => mkSfx('morSoul')], [3.1, () => mkSfx('morAscend')], [4.7, () => mkSfx('morRealm')]],
    draw(c, t) {
      const rise = ease.inOut(seg(t, 1.4, 3.1)), slam = seg(t, 4.7, 5.0), pwr = ease.out(seg(t, 3.0, 4.6));
      PxKit.scene(c, x => mkRealmBg(x, t, .5 + pwr * .5, true), .3, 0);
      // wisps stream from the legion into his chest
      const cx = W / 2, cy = H - 70 - 95 * 2.7;
      if (t > 1.4 && t < 3.3) for (let i = 0; i < 4; i++) { const sx = rand(0, W), sy = H - rand(20, 80), life = rand(.7, 1.1); fx.add({ x: sx, y: sy, vx: (cx - sx) / life, vy: (cy - sy) / life - 60, life, size: rand(4, 8), color: i % 3 ? '#6aff9a' : '#e8fff0', glow: true }); }
      fx.draw(c);
      c.save(); if (t > 3.0 && t < 4.7) c.translate(rand(-2, 2), rand(-2, 2)); if (slam > 0 && slam < 1) c.translate(rand(-9, 9) * (1 - slam), rand(-9, 9) * (1 - slam));
      const pose = t < 1.4 ? 'kneel' : t < 3.1 ? 'cast_up' : t < 4.7 ? 'heavy' : t < 5.1 ? 'slam' : 'victory';
      A(c, cx, H - 66 - rise * 4, 2.7 + pwr * .35, t, pose, { transformed: t > 3.0, mkStorm: t > 4 ? 1 : 0 });
      c.restore();
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, cx, cy, 60 + rise * 220, `rgba(80,255,150,${.15 + rise * .3})`, 'rgba(0,0,0,0)'); c.restore();
      if (slam > 0) { // the mace comes down: pixel shock ring along the floor
        c.save(); c.globalCompositeOperation = 'lighter'; const R = 700 * ease.out(slam); for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; c.fillStyle = i % 2 ? `rgba(110,255,160,${1 - slam})` : `rgba(235,255,245,${1 - slam})`; c.fillRect(Math.round((cx + 180 + Math.cos(a) * R) / 4) * 4, Math.round((H - 78 + Math.sin(a) * R * .12) / 4) * 4, 10, 10); } c.restore();
      }
      caption(c, 'Death was only the beginning.', t, 0.3, 2.9, '#b0ffd0');
      flashAt(c, t, 3.0, 3.35, '#b0ffd0'); flashAt(c, t, 4.7, 5.1, '#ffffff');
      titleSlam(c, 'LORD OF THE DEATH REALM', 'KNEEL', t, 5.0, '#6aff9a', 78);
    },
  };
}

// REALM OF DEATH — the tether pulls the foe through a green vortex into the Death Realm, where he is judged,
// broken, and robbed of a piece of himself.
function csMordekaiserRealm(a, opp) {
  const fx = new ParticleSystem(1400), A = PxKit.actor(a.def), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7, city = makeCineCity(18, 120, 340);
  return {
    name: 'REALM OF DEATH', dur: 9.0, fx,
    cues: [[0, () => mkSfx('morToll')], [0.6, () => mkSfx('morSoul')], [2.0, () => mkSfx('suck', 1.4)], [3.3, () => mkSfx('morRealm')], [4.1, () => mkSfx('morSlam')], [4.9, () => mkSfx('morSlam')], [5.7, () => mkSfx('morSlam', 0)], [6.4, () => mkSfx('morSoul')], [6.7, () => mkSfx('morDeathChoir', 0, 2.2)], [7.7, () => mkSfx('boom')]],
    draw(c, t) {
      const ox = W * .72, oy = H - 70;
      if (t < 3.3) {
        // 1-2. the stage at night; the tether, then the vortex
        const pull = ease.in(seg(t, 1.8, 3.3));
        PxKit.scene(c, x => { x.fillStyle = '#05080c'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'lighter'; glowCircle(x, W * .72, H * .6, 300 * seg(t, .6, 2), 'rgba(40,200,110,0.4)', 'rgba(0,0,0,0)'); x.globalCompositeOperation = 'source-over'; }, .3);
        drawCineCity(c, city, H - 70, '#0a1018', false);
        c.fillStyle = '#070b10'; c.fillRect(0, H - 70, W, 70);
        // vortex of green rings, centered on the foe
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 12; i++) { const k = ((i / 12 + t * .5) % 1), R = (1 - k) * 340 * seg(t, 1.6, 2.6), a2 = k * 9 + t * 4; c.strokeStyle = `rgba(110,255,160,${.8 * k})`; c.lineWidth = 6; c.beginPath(); c.ellipse(ox, H - 190, R, R * .8, a2 * .2, a2, a2 + 4.2); c.stroke(); }
        // the tether from his mace to the foe, crawling on
        const tx = lerp(W * .3 + 190, ox - 20, ease.out(seg(t, .5, 1.8))); c.strokeStyle = 'rgba(110,255,160,0.9)'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(W * .3 + 190, H - 240); for (let i = 1; i <= 14; i++) { const k = i / 14; c.lineTo(lerp(W * .3 + 190, tx, k), lerp(H - 240, H - 190, k) + Math.sin(t * 14 + i * 1.7) * 14 * (1 - k * .4)); } c.stroke();
        c.restore();
        A(c, W * .3, H - 66, 2.6, t, t < 1.5 ? 'cast' : 'cast_up', { transformed: false, mkStorm: 1 });
        // foe: dragged and spun into the vortex
        c.save(); c.translate(lerp(ox, ox - 40, pull), lerp(oy, H - 200, pull)); c.rotate(pull * 7); const sc = oppScale * (1 - pull * .75); c.scale(sc, sc);
        silhouette(c, o => drawCharAt(o, opp.def, 0, 0, 1, -1, { pose: t < 1.8 ? 'block' : 'hurt_air', anim: t, transformed: opp.transformed }), '#52ffa0'); c.restore();
        fx.draw(c);
        caption(c, 'Your soul is mine.', t, 0.2, 2.4, '#b0ffd0'); flashAt(c, t, 3.1, 3.5, '#b0ffd0');
        return;
      }
      // 3-5. the Death Realm
      PxKit.scene(c, x => mkRealmBg(x, t, 1, true), .3, 0);
      if (Math.random() < .5) fx.add({ x: rand(0, W), y: H + 10, vx: rand(-20, 20), vy: rand(-200, -80), life: 3, size: rand(2, 5), color: '#6aff9a', glow: true });
      fx.draw(c);
      const beat = t < 4.1 ? -1 : t < 4.9 ? 0 : t < 5.7 ? 1 : t < 6.4 ? 2 : 3, since = [4.1, 4.9, 5.7, 6.4].map(b => t - b);
      c.save(); const bs = since.filter(s => s > 0 && s < .3).length; if (bs) c.translate(rand(-12, 12), rand(-8, 8));
      const step = ease.inOut(seg(t, 3.4, 6.4));
      const drain = ease.inOut(seg(t, 6.4, 7.5));
      A(c, lerp(W * .2, W * .42, step), H - 70, 2.7 + drain * .3, t, beat < 0 ? 'intro' : beat === 3 ? 'victory' : ['slam', 'heavy', 'uppercut'][beat], { transformed: t > 6.6, mkStorm: 1 });
      // chains bind the foe in place; it sags with each blow
      const sag = Math.min(1, Math.max(0, beat + 1) * .3);
      for (const [cx2, cy2] of [[W * .52, 40], [W * .96, 60], [W * .6, H - 20], [W * .98, H - 40]]) { c.strokeStyle = '#7a8e8b'; c.lineWidth = 5; c.setLineDash([9, 5]); c.beginPath(); c.moveTo(cx2, cy2); c.lineTo(ox - 10, oy - 110 * oppScale); c.stroke(); c.setLineDash([]); }
      silhouette(c, o => drawCharAt(o, opp.def, ox, oy + sag * 18, oppScale, -1, { pose: beat >= 3 ? 'kneel' : 'hurt', anim: t, transformed: opp.transformed }), beat >= 3 ? '#0a3a22' : '#1a6a40');
      c.restore();
      // impact starbursts on each blow
      for (const s of since) if (s > 0 && s < .22) { c.save(); c.globalCompositeOperation = 'lighter'; const R = 60 + s * 900; c.strokeStyle = `rgba(200,255,225,${1 - s / .22})`; c.lineWidth = 12; c.beginPath(); c.arc(ox - 60, H - 150, R, 0, 7); c.stroke(); for (let i = 0; i < 10; i++) { const an = i * .63; c.beginPath(); c.moveTo(ox - 60, H - 150); c.lineTo(ox - 60 + Math.cos(an) * R * 1.6, H - 150 + Math.sin(an) * R * 1.2); c.stroke(); } c.restore(); flash(c, (1 - s / .22) * .4, '#cfffe0'); }
      // the stolen soul: a wisp torn from the foe flows into his chest
      if (t > 6.4) { const k = ease.inOut(seg(t, 6.4, 7.6)), sx = lerp(ox, lerp(W * .42, W * .46, drain), k), sy = lerp(oy - 120, H - 70 - 100 * 2.9, k) - Math.sin(k * Math.PI) * 130;
        c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, sx, sy, 34, 'rgba(120,255,175,1)', 'rgba(0,0,0,0)'); c.fillStyle = '#ffffff'; c.fillRect(sx - 5, sy - 5, 10, 10);
        if (k < 1) fx.add({ x: sx, y: sy, vx: rand(-30, 30), vy: rand(-30, 30), life: .5, size: 6, color: '#6aff9a', glow: true });
        if (k >= 1) glowCircle(c, W * .46, H - 70 - 100 * 2.9, 90 * (1 - seg(t, 7.6, 8.2)) + 40, 'rgba(160,255,200,0.8)', 'rgba(0,0,0,0)'); c.restore(); }
      caption(c, 'Every soul is a subject.', t, 3.5, 6.0, '#b0ffd0');
      flashAt(c, t, 7.7, 8.2, '#d8ffe8');
      if (t > 7.9) titleSlam(c, 'REALM OF DEATH', 'SOUL STOLEN', t, 8.0, '#6aff9a', 92);
    },
  };
}
rival('mordekaiser', 'sion', [[1, 'Sion. I raised you once, in another life.'], [0, 'Then you know I do not stay down. Or kneel.']],
  { mordekaiser: 'Kneel, soldier.', sion: 'Keep your realm, iron king.' });
rival('mordekaiser', 'aatrox', [[0, 'A Darkin. Your soul would make a fine general.'], [1, 'You collect the dead. I make them.']],
  { mordekaiser: 'Your prison is now mine.', aatrox: 'Death has no dominion over me.' });
