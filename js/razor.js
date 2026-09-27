// ============================================================
//  MOONKAI — RAZOR, the Red Berserker (rebuilt).
//
//  GAUGE   · BLOODLUST  fills with every cut and every drop of blood he spills (bleed ticks
//                    too). It drains when he stops fighting. At 100: FRENZY for 6s — faster,
//                    every hit heals him, and his specials cannot be interrupted.
//  PASSIVE · RAGE       up to +40% damage as his own health drops.
//  BLOOD PRICE          Blood Wave and Rending Cleave cost a little of his own health for power
//                    (never lethal). Paying feeds RAGE and BLOODLUST.
//  SUPER · ARENA OF BLADES  a ring of greatswords slams into the ground around the foe: for 6s
//                    they cannot leave it. Touching the ring cuts and bleeds.
//  CRIMSON TEMPEST   ultimate: he spins into a blood vortex and slowly walks it at the foe,
//                    dragging them in. Blockable. Must connect.
// ============================================================
const rzSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const RAZOR = charById('razor');
const RZ_PAL = { build: 'athletic', skin: '#b08060', top: '#4a1010', topDark: '#2a0808', pants: '#222', pantsDark: '#141414', boots: '#111', belt: '#888', glove: '#3a2a2a', noFace: true };
const RZ_RAGE_PAL = Object.assign({}, RZ_PAL, { skin: '#a05050', top: '#6a0a0a' });
const rzLust = (f, n) => {
  if (f.frenzy) return; f.gauge = Math.min(100, (f.gauge || 0) + n); f.lustIdle = 0;
  if (f.gauge >= 100) { f.frenzy = (f.form ? 8 : 6) * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'FRENZY', '#ff2020', 28); f.say('MORE!', 60); rzSfx('roar'); Cam.shake = 10; }
};
const rzPay = (f, pct) => { const c = Math.min(f.hp - 1, f.maxHp * pct); if (c > 0) { f.hp -= c; Game.popWorld(f.x, f.y - f.h - 20, '-' + Math.round(c), '#c01818', 14); rzLust(f, 8); } };

function drawRazorSword(c, x, y, ang, rage, spin) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.fillStyle = '#2a1a1a'; c.fillRect(-26, -3.5, 28, 7);
  c.fillStyle = '#555'; c.fillRect(0, -12, 7, 24);
  c.fillStyle = rage ? '#c33' : '#9aa'; c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(7, -9); c.lineTo(118, -8); c.lineTo(140, 0); c.lineTo(118, 9); c.lineTo(7, 9); c.closePath(); c.fill(); c.stroke();
  for (let i = 0; i < 5; i++) { c.fillStyle = '#1a1a1a'; c.beginPath(); c.moveTo(20 + i * 20, 9); c.lineTo(26 + i * 20, 14); c.lineTo(32 + i * 20, 9); c.fill(); }   // serrated back
  c.fillStyle = 'rgba(140,10,10,0.8)'; c.beginPath(); c.moveTo(80, -8); c.quadraticCurveTo(96, -2, 90, 8); c.lineTo(76, 8); c.fill();                // old blood
  if (rage || spin) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,30,30,0.6)'; c.lineWidth = 6; c.beginPath(); c.moveTo(10, 0); c.lineTo(138, 0); c.stroke(); }
  c.restore();
}
function drawRazor(c, v) {
  const t = v.anim || 0, R = !!v.transformed, F = !!v.frenzy, m = v.move;
  if (F || R) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -70, 110 + (F ? Math.sin(t * 16) * 10 : 0), `rgba(255,20,20,${F ? 0.35 : 0.2})`, 'rgba(0,0,0,0)'); c.restore(); }
  if (m && m.rzTempest) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { c.strokeStyle = `rgba(255,${30 + i * 40},30,${0.6 - i * 0.15})`; c.lineWidth = 8 - i * 2; c.beginPath(); c.ellipse(0, -70 + i * 10, 110 - i * 14, 40, 0, t * 20 + i, t * 20 + i + 4.4); c.stroke(); } c.restore(); }
  drawHumanoid(c, v, R ? RZ_RAGE_PAL : RZ_PAL, {
    back(c, P) { // torn crimson scarf streaming
      c.strokeStyle = '#7a0a0a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(P.sh[0], P.sh[1] - 2); c.quadraticCurveTo(P.sh[0] - 30, P.sh[1] + Math.sin(t * 6) * 8, P.sh[0] - 60, P.sh[1] + 10 + Math.sin(t * 5) * 10); c.stroke();
    },
    chest(c, P) { // scars and war paint on bare chest (open vest)
      const x = lerp(P.hip[0], P.sh[0], 0.55), y = lerp(P.hip[1], P.sh[1], 0.55);
      c.fillStyle = R ? '#a05050' : '#b08060'; c.beginPath(); c.moveTo(x - 6, y - 16); c.lineTo(x + 8, y - 16); c.lineTo(x + 5, y + 14); c.lineTo(x - 4, y + 14); c.closePath(); c.fill();
      c.strokeStyle = '#6a2020'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 4, y - 10); c.lineTo(x + 6, y + 4); c.moveTo(x + 6, y - 12); c.lineTo(x - 2, y); c.stroke();
    },
    pads(c, P) { c.fillStyle = '#555'; c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.2; c.beginPath(); c.arc(P.sh[0], P.sh[1] + 2, 10, Math.PI, 0); c.fill(); c.stroke(); c.fillStyle = '#aaa'; for (const dx of [-6, 0, 6]) { c.beginPath(); c.moveTo(P.sh[0] + dx - 2, P.sh[1] - 6); c.lineTo(P.sh[0] + dx, P.sh[1] - 16); c.lineTo(P.sh[0] + dx + 2, P.sh[1] - 6); c.fill(); } },
    head(c, P) {
      const [hx, hy] = P.head;
      shadedHead(c, hx, hy, 11, R ? '#a05050' : '#b08060');
      c.fillStyle = '#c01818'; c.beginPath(); c.moveTo(hx - 8, hy - 8); for (let i = 0; i < 6; i++) c.lineTo(hx - 8 + i * 3.5, hy - 16 - (i % 2) * 6 - (F ? 4 : 0)); c.lineTo(hx + 12, hy - 8); c.closePath(); c.fill();   // mohawk
      c.fillStyle = '#c01818'; c.beginPath(); c.moveTo(hx + 2, hy - 4); c.lineTo(hx + 12, hy - 5); c.lineTo(hx + 11, hy); c.lineTo(hx + 2, hy + 2); c.fill();   // war paint band
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 2, F || R ? 7 : 4, 'rgba(255,40,40,1)', 'rgba(0,0,0,0)'); c.restore(); circle(c, hx + 7, hy - 2, 1.5, '#fff');
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(hx + 3, hy + 5); c.lineTo(hx + 11, hy + 4); c.lineTo(hx + 10, hy + 7); c.lineTo(hx + 4, hy + 8); c.closePath(); c.fill();     // bared teeth
      c.strokeStyle = '#1a0a0a'; c.lineWidth = 0.8; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(hx + 5 + i * 2, hy + 4.5); c.lineTo(hx + 5 + i * 2, hy + 7.5); c.stroke(); }
    },
    front(c, P) {
      if (m && m.rzTempest) { drawRazorSword(c, P.fH[0], P.fH[1], t * 20, R, true); return; }
      const ang = { heavy: 0.7, slam: 1.2, punch: -0.1, kick: -1.4, uppercut: -1.3, dash: 0.1, air_heavy: 0.8, air_spike: 1.4, hurt: 2.2, hurt_air: 2.3, victory: -1.57, intro: -0.9, block: -1.8, charge: -2.4 }[v.pose] ?? -2.2;
      drawRazorSword(c, P.fH[0], P.fH[1], ang, R || F, false);
    },
  });
}
function drawRazorPortrait(c, opts) {
  const R = !!opts.form;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, '#3a0000'); g.addColorStop(1, '#0a0000'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.fillStyle = 'rgba(120,0,0,0.6)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(i * 20, 0); c.lineTo(i * 20 + 6, 0); c.lineTo(i * 20 + 3, 20 + (i % 3) * 12); c.fill(); }   // drips
  c.fillStyle = '#4a1010'; c.beginPath(); c.moveTo(0, 100); c.lineTo(16, 74); c.lineTo(84, 74); c.lineTo(100, 100); c.fill();
  c.fillStyle = R ? '#a05050' : '#b08060'; c.strokeStyle = '#3a1a10'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(32, 38); c.lineTo(68, 38); c.lineTo(68, 58); c.lineTo(60, 72); c.lineTo(40, 72); c.lineTo(32, 58); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#c01818'; c.beginPath(); c.moveTo(36, 38); for (let i = 0; i < 7; i++) c.lineTo(38 + i * 4, 10 + (i % 2) * 8 - (R ? 6 : 0)); c.lineTo(64, 38); c.closePath(); c.fill();
  c.fillStyle = '#c01818'; c.fillRect(32, 47, 36, 8);                                                                    // war paint band
  c.strokeStyle = '#1a0a0a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(36, 46); c.lineTo(47, 50); c.moveTo(64, 46); c.lineTo(53, 50); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 9, 52, R ? 9 : 6, 'rgba(255,40,40,1)', 'rgba(0,0,0,0)'); c.restore();
  for (const s of [-1, 1]) circle(c, 50 + s * 9, 52, 1.8, '#fff');
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(38, 61); c.lineTo(62, 61); c.lineTo(59, 68); c.lineTo(41, 68); c.closePath(); c.fill();   // snarl
  c.strokeStyle = '#3a0a0a'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(41 + i * 4, 61); c.lineTo(41 + i * 4, 68); c.stroke(); }
  c.strokeStyle = '#8a2020'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(58, 40); c.lineTo(64, 58); c.stroke();
  drawRazorSword(c, 8, 96, -1.0, R, false);
}

// ---------------- kit ----------------
const RZ_WAVE = Object.assign(Mv.place({ name: 'Blood Wave', desc: 'BLOOD PRICE (3% HP): a crimson ground wave that bleeds.', spawn: { kind: 'wave', at: 'front', dx: 60, dir: 1, dmg: 85, life: 0.9, colors: ['#c01818', '#600'], status: { bleed: 2 } }, ai: { min: 100, max: 800, use: 'zone' } }), { onStart: f => rzPay(f, 0.03) });
const RZ_RUSH = Mv.rush({ name: 'Blood Rush', desc: 'Dash slash through the foe that bleeds.', speed: 1300, frames: 12, pass: true, hit: { dmg: 80, status: { bleed: 2 } } });
const RZ_RISE = Mv.rising({ name: 'Reaper Rise', desc: 'Rising greatsword arc. Anti-air.', hit: { dmg: 50, multi: 3 } });
const RZ_CLEAVE = mk({ name: 'Rending Cleave', desc: 'BLOOD PRICE (4% HP): a slow, armored overhead chop. Crushes guard.', pose: 'slam', s: 24, a: 6, r: 22, armor: [1, 24],
  hit: { dmg: 170, guard: 'high', box: [0, -150, 140, 150], kb: [400, -400], launch: true, sfx: 'h', gdmg: 60 }, ai: { min: 0, max: 130, use: 'combo' },
  onStart: f => rzPay(f, 0.04), onBlock: (a, t) => { t.guard = Math.min(100, (t.guard || 0) + 35); } });
const RZ_SKULL = Mv.dive({ name: 'Skullsplitter', desc: 'Plunging greatsword. Ground bounce.', vx: 300, vy: 1300, hit: { dmg: 110, gb: true } });
const RZ_SUPER = superize(mk({ name: 'Arena of Blades', desc: 'Greatswords slam down in a ring around the foe. For 6s they cannot leave it; touching the ring cuts and bleeds. Bloodlust fills twice as fast inside.', pose: 'slam', s: 16, a: 1, r: 22,
  ev: { 16: f => { const o = f.opp; if (!o) return; Combat.hazards.filter(h => h.kind === 'rzArena' && h.owner === f).forEach(h => h.life = 0);
    Combat.addHazard({ kind: 'rzArena', owner: f, side: f.side, x: clamp(o.x, 300, Arena.stage.width - 300), r: 280, life: 360 }); Cam.shake = 12; rzSfx('slam'); rzSfx('clang'); f.say('No running!', 60); } } }), 100);
const RZ_ULT = superize(mk({ name: 'CRIMSON TEMPEST', desc: 'He spins into a blood vortex and slowly walks it at the foe, dragging them in. Blockable. Must connect.', pose: 'dash', s: 10, a: 70, r: 30, rzTempest: true, armor: [1, 80],
  ev: { 2: f => { f.say('A WORTHY FIGHT!', 70); rzSfx('roar'); } } }), 300);
RZ_ULT.id = 'razor_ult'; RZ_ULT.recoverWhiff = 30;
RZ_ULT.ult = { dmg: 1150, cutscene: (a, t) => csRazorTempest(a, t), fx: { el: 'blood', color: '#ff2020' } };

Object.assign(RAZOR, {
  role: 'Berserker · Blood price · Comeback', handArt: true, draw: drawRazor, drawPortrait: drawRazorPortrait, transformCutscene: f => csRazorBloodrage(f),
  weaponTip: 150,
  gauge: { name: 'BLOODLUST', max: 100, color: '#ff2020', label: f => (f.frenzy ? '· FRENZY' : '') },
  passive: ['Rage', 'Deals up to +40% damage as his own health drops.'],
  moves: { '5S': RZ_WAVE, '6S': RZ_RUSH, '2S': RZ_RISE, '4S': RZ_CLEAVE, 'jS': RZ_SKULL },
  super: RZ_SUPER, ult: RZ_ULT, ultAct: 'rush',
  form: Object.assign(RAZOR.form, { desc: 'Permanent. Lifesteal 20%, faster, but takes 10% more damage. BLOODLUST never drains and FRENZY lasts 8s.', model: undefined }),
});
for (const [slot, m] of Object.entries(RAZOR.moves)) { m.id = 'razor_' + slot; m.slot = slot; m.owner = 'razor'; if (slot === 'jS') m.air = true; }
RZ_SUPER.id = 'razor_super';
RAZOR.onRoundStart = f => { f.gauge = 0; f.frenzy = 0; f.lustIdle = 0; };
RAZOR.onHit = (a, t, dmg) => {
  const inArena = Combat.hazards.some(h => h.kind === 'rzArena' && h.owner === a);
  rzLust(a, dmg * 0.08 * (inArena ? 2 : 1));
  if (a.frenzy) a.hp = Math.min(a.maxHp, a.hp + dmg * 0.2);
};
RAZOR.passiveTick = f => {
  const o = f.opp; if (o && o.status.bleed && f.st % 30 === 0) rzLust(f, 2);
  if (!f.form && !f.frenzy && ++f.lustIdle > 120 && f.st % 4 === 0) f.gauge = Math.max(0, (f.gauge || 0) - 1);
  if (f.frenzy > 0) { f.status.haste = Math.max(f.status.haste || 0, 0.1); if (f.move && f.move.kind === 'special') f.invul = f.invul; if (--f.frenzy <= 0) { f.frenzy = 0; f.gauge = 0; Game.popWorld(f.x, f.y - f.h - 30, 'FRENZY ENDS', '#aab', 16); } }
};
RAZOR.passiveArmor = f => (f.frenzy && f.move && f.move.kind === 'special' ? 0.7 : 1);
RAZOR.moveHook = (f, m) => {
  if (!m.rzTempest || f.mf < m.s) return;
  f.vx = f.facing * 260; const o = f.opp;
  if (o && o.state !== 'ko' && Math.abs(o.x - f.x) < 360 && !f.rzHit) o.x += Math.sign(f.x - o.x) * 3.5;
  if (!f.rzHit && f.mf % 4 === 0) {
    const r = Combat.strikeZone(f, { x: f.x - 110, y: f.y - 200, w: 220, h: 206 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: RZ_ULT });
    if (r) f.rzHit = true;
  }
  if (f.mf % 5 === 0) Game.fx.add({ x: f.x + rand(-80, 80), y: f.y - rand(20, 160), vx: rand(-300, 300), vy: rand(-300, 0), life: 0.5, size: rand(4, 8), color: '#c01818' });
};
const _rzStart = RZ_ULT.onStart; RZ_ULT.onStart = f => { f.rzHit = false; _rzStart && _rzStart(f); };
Combat.hz.rzArena = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  for (const t of Combat.targets(f.side)) {
    const d = t.x - h.x;
    if (Math.abs(d) > h.r) {
      t.x = h.x + Math.sign(d) * h.r; t.vx = -Math.sign(d) * 200;
      if (!t.rzCut || h.t - t.rzCut > 30) { t.rzCut = h.t; Combat.resolveHit(t, f, H_({ dmg: 30, guard: 'unblock', hs: 10, kb: [-Math.sign(d) * 200, -200], status: { bleed: 1.5 }, sfx: 'm' }), { force: true, proj: true, fromX: h.x + Math.sign(d) * (h.r + 40) }); }
    }
  }
  return h.t < h.life;
};
Combat.drawHz.rzArena = (c, h) => {
  const k = Math.min(1, h.t / 8), fade = Math.min(1, (h.life - h.t) / 20);
  c.save(); c.globalAlpha = fade;
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const x = h.x + s * (h.r + 10 + i * 18), y = -40 * (1 - k); c.save(); c.translate(x, y); c.rotate(Math.PI / 2 + s * (0.1 + i * 0.12)); drawRazorSword(c, -120, 0, 0, false, false); c.restore();
  }
  c.strokeStyle = 'rgba(200,20,20,0.5)'; c.lineWidth = 3; c.setLineDash([10, 8]); c.beginPath(); c.moveTo(h.x - h.r, 2); c.lineTo(h.x + h.r, 2); c.stroke(); c.setLineDash([]);
  c.restore();
};

// ---------------- cinematics ----------------
function csRazorBloodrage(f) {
  const d = f.def;
  return {
    name: 'BLOODRAGE', dur: 3.8, fx: new ParticleSystem(800),
    cues: [[0.1, () => rzSfx('heartbeat')], [0.8, () => rzSfx('heartbeat')], [1.4, () => rzSfx('heartbeat')], [2.1, () => { rzSfx('roar'); rzSfx('boom'); }]],
    draw(c, t) {
      c.fillStyle = '#0a0000'; c.fillRect(0, 0, W, H);
      const beat = Math.max(0, Math.sin(t * 9)) * (t < 2.1 ? 1 : 0);
      c.fillStyle = `rgba(160,0,0,${0.2 + 0.4 * beat})`; c.fillRect(0, 0, W, H);
      // he drags the blade across his own palm
      if (t < 2.1) { c.save(); c.translate(W / 2, H / 2); c.scale(3, 3); drawRazorSword(c, -70, 10, -0.1, false, false); c.fillStyle = '#b08060'; c.beginPath(); c.ellipse(10, 0, 26, 12, 0, 0, Math.PI * 2); c.fill(); c.restore();
        if (t > 1) { const k = seg(t, 1, 2.1); for (let i = 0; i < 6; i++) { c.fillStyle = '#c01818'; c.beginPath(); c.arc(W / 2 + 30 + i * 8, H / 2 + 40 + k * (120 + i * 30), 6, 0, Math.PI * 2); c.fill(); } }
        caption(c, 'Bleed a little. It makes it honest.', t, 0.1, 2, '#ffb0b0'); }
      else { drawCharAt(c, d, W / 2, H - 50, 2.7, 1, { pose: 'victory', anim: t, transformed: true }); flashAt(c, t, 2.1, 2.4, '#ff4040'); titleSlam(c, 'BLOODRAGE', 'NO MORE HOLDING BACK', t, 2.2, '#ff2020', 90); }
    },
  };
}
function csRazorTempest(a, opp) {
  const fx = new ParticleSystem(2200), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'CRIMSON TEMPEST', dur: 6.4, fx,
    cues: [[0, () => rzSfx('roar')], [1.4, () => rzSfx('slam')], [2.2, () => rzSfx('slam')], [3.0, () => rzSfx('slam')], [4.0, () => { rzSfx('boom'); rzSfx('slam'); }]],
    draw(c, t) {
      // the alien arena: a ring of roaring crowd
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0000'); g.addColorStop(1, '#5a0a0a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let r = 0; r < 4; r++) for (let i = 0; i < 40; i++) { const x = i * W / 40 + (r % 2) * 12, y = 80 + r * 40 + Math.sin(t * 12 + i + r) * 3; c.fillStyle = r % 2 ? '#2a0606' : '#200404'; c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#3a1a10'; c.fillRect(0, H - 90, W, 90);
      if (t < 1.4) { drawCharAt(c, a.def, W * 0.3, H - 90, 2.5, 1, { pose: 'taunt', anim: t }); silhouette(c, o => drawCharAt(o, opp.def, W * 0.72, H - 90, oppScale, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#1a0404'); caption(c, 'Finally. A worthy fight.', t, 0.1, 1.3, '#ffb0b0'); return; }
      const k = seg(t, 1.4, 4.0), cx = lerp(W * 0.3, W * 0.62, k);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) { c.strokeStyle = `rgba(255,${20 + i * 30},20,${0.7 - i * 0.1})`; c.lineWidth = 14 - i * 2; c.beginPath(); c.ellipse(cx, H - 220 + i * 20, 220 - i * 20, 90 - i * 8, 0, t * 14 + i, t * 14 + i + 4.6); c.stroke(); }
      c.restore();
      if (t < 4.0) { for (let i = 0; i < 3; i++) fx.add({ x: cx + rand(-200, 200), y: H - rand(100, 320), vx: rand(-500, 500), vy: rand(-400, 100), life: 0.8, size: rand(4, 10), color: pick(['#c01818', '#ff4040', '#600']) }); }
      fx.draw(c);
      silhouette(c, o => drawCharAt(o, opp.def, t < 4 ? lerp(W * 0.72, cx + 40, k * k) : W * 0.8, H - 90 - (t > 4 ? 200 * Math.sin(seg(t, 4, 5.4) * Math.PI) : 0), oppScale, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), '#1a0404');
      if (t < 4.0) drawCharAt(c, a.def, cx, H - 90, 2.5, 1, { pose: 'dash', anim: t * 3 });
      else drawCharAt(c, a.def, W * 0.4, H - 90, 2.5, 1, { pose: 'victory', anim: t });
      flashAt(c, t, 4.0, 4.3, '#ffd0d0');
      if (t > 4.5) titleSlam(c, 'CRIMSON TEMPEST', 'THE CROWD ROARS', t, 4.6, '#ff2020', 90);
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('razor:')) delete PortraitCache[k]; });
