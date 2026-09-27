// ============================================================
//  MOONKAI — KAGE, the Last Ronin (rebuilt).
//
//  GAUGE   · DEMON  the oni in the blade. It grows with every cut he lands and every cut he
//                    takes. At 100 the demon SEIZES him for 5s: faster, lifesteal, armor, but he
//                    bleeds and cannot block. Then it sleeps again at 0.
//  PASSIVE · IAIDO  after 0.6s without attacking, the blade is SHEATHED (a glint on the hilt).
//                    His first strike from the sheath deals +30%.
//  SUPER · MOONLIT FLASH  he vanishes; after a beat, a single cut line crosses the screen
//                    wherever the foe stood. Cost halves the DEMON gauge into damage.
//  DEMON SEVERANCE   ultimate: he sheathes and waits (a thin line of light), then draws once
//                    across the entire stage. Slow. Blockable. Must connect.
// ============================================================
const kgSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const KAGE = charById('kage');
const KG_PAL = { skin: '#e0b890', top: '#2a2a3a', topDark: '#1a1a2a', pants: '#3a2a2a', pantsDark: '#241818', boots: '#222', belt: '#c03030', glove: '#e0b890', sleeves: '#3a3a4a', noFace: true };
const KG_ONI_PAL = Object.assign({}, KG_PAL, { skin: '#a04040', glove: '#a04040', top: '#1a0a0a', topDark: '#0a0404', belt: '#ff3030' });
const kgDemon = (f, n) => {
  if (f.possessed) return;
  f.gauge = Math.min(100, (f.gauge || 0) + n);
  if (f.gauge >= 100) { f.possessed = 5 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'THE DEMON TAKES HIM', '#ff3030', 24); f.say('Get... OUT!', 80); kgSfx('roar'); Cam.shake = 10; }
};

function drawKageBlade(c, x, y, ang, oni, glint) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.fillStyle = '#1a1a1a'; c.fillRect(-18, -3, 20, 6);                                                  // tsuka
  c.strokeStyle = '#c03030'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-16 + i * 5, -3); c.lineTo(-13 + i * 5, 3); c.stroke(); }
  c.fillStyle = '#ffd35a'; c.beginPath(); c.ellipse(3, 0, 3, 7, 0, 0, Math.PI * 2); c.fill();          // tsuba
  c.fillStyle = oni ? '#ffb0b0' : '#dde'; c.strokeStyle = '#333'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(6, -2.5); c.lineTo(120, -3); c.quadraticCurveTo(132, -2, 136, 2); c.lineTo(6, 2.5); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.moveTo(10, 0); c.lineTo(126, -1); c.stroke();
  if (oni) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,40,40,0.7)'; c.lineWidth = 5; c.beginPath(); c.moveTo(10, 0); c.lineTo(132, 0); c.stroke(); }
  if (glint) { c.globalCompositeOperation = 'lighter'; glowCircle(c, 6, 0, 12, 'rgba(255,255,255,1)', 'rgba(0,0,0,0)'); }
  c.restore();
}
function drawKageSheath(c, P, withBlade) {
  c.save(); c.translate(P.hip[0] - 6, P.hip[1] - 2); c.rotate(0.35);
  c.fillStyle = '#1a1010'; c.strokeStyle = '#000'; c.lineWidth = 1; c.fillRect(-60, -3.5, 90, 7); c.strokeRect(-60, -3.5, 90, 7);
  if (withBlade) { c.fillStyle = '#ffd35a'; c.beginPath(); c.ellipse(32, 0, 3, 7, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#1a1a1a'; c.fillRect(34, -3, 20, 6); }
  c.restore();
}
function drawKage(c, v) {
  const t = v.anim || 0, O = !!v.transformed || !!v.possessed, m = v.move;
  if (v.possessed) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -70, 110 + Math.sin(t * 14) * 8, 'rgba(255,30,30,0.3)', 'rgba(0,0,0,0)'); c.restore(); }
  const sheathed = !!v.sheathed && !m;
  drawHumanoid(c, v, O ? KG_ONI_PAL : KG_PAL, {
    back(c, P) {
      // ragged haori
      c.fillStyle = O ? '#2a0606' : '#2a2a3a'; c.strokeStyle = '#0a0a10'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(P.sh[0] - 10, P.sh[1]); c.lineTo(P.sh[0] - 22, P.hip[1] + 30); for (let i = 0; i < 4; i++) c.lineTo(P.sh[0] - 18 + i * 7, P.hip[1] + 22 + (i % 2) * 10 + Math.sin(t * 3 + i) * 2); c.lineTo(P.sh[0] + 4, P.sh[1] + 6); c.fill(); c.stroke();
      drawKageSheath(c, P, sheathed);
    },
    head(c, P) {
      const [hx, hy] = P.head;
      shadedHead(c, hx, hy, 11, O ? '#a04040' : '#e0b890');
      c.fillStyle = '#1a1a1a'; c.beginPath(); c.moveTo(hx - 11, hy); c.quadraticCurveTo(hx - 10, hy - 14, hx + 3, hy - 12); c.quadraticCurveTo(hx + 12, hy - 9, hx + 11, hy - 3); c.lineTo(hx + 4, hy - 7); c.lineTo(hx - 2, hy - 4); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(hx - 4, hy - 15, 4, 3, 0, 0, Math.PI * 2); c.fill();                            // topknot
      for (let i = 0; i < 3; i++) { c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx + 4 + i * 2, hy - 6); c.lineTo(hx + 6 + i * 3, hy + 2 + i * 2); c.stroke(); }
      c.strokeStyle = '#8a4a4a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(hx + 4, hy - 5); c.lineTo(hx + 9, hy + 5); c.stroke();
      c.strokeStyle = '#111'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx + 3, hy - 3); c.lineTo(hx + 10, hy - 2); c.stroke();
      if (O) {
        c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 7, hy - 1, 7, 'rgba(255,40,40,1)', 'rgba(0,0,0,0)'); c.restore();
        c.fillStyle = '#3a0a0a'; for (const [dx, h2] of [[-5, 14], [5, 12]]) { c.beginPath(); c.moveTo(hx + dx - 3, hy - 10); c.quadraticCurveTo(hx + dx, hy - 10 - h2, hx + dx + 4, hy - 10 - h2 - 2); c.lineTo(hx + dx + 3, hy - 10); c.fill(); }
      } else circle(c, hx + 7, hy - 1, 1.4, '#6a1010');
    },
    front(c, P) {
      if (sheathed) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, P.hip[0] + 26, P.hip[1] + 8, 8 + Math.sin(t * 8) * 3, 'rgba(255,255,255,0.8)', 'rgba(0,0,0,0)'); c.restore(); return; }
      const ang = { heavy: 0.6, punch: -0.1, punch2: 0.1, kick: -1.5, uppercut: -1.3, dash: 0.05, slam: 1.0, air_heavy: 0.7, air_spike: 1.2, hurt: 2.2, hurt_air: 2.3, victory: -1.6, intro: 1.4, block: -1.9 }[v.pose] ?? 0.35;
      drawKageBlade(c, P.fH[0], P.fH[1], ang, O, false);
    },
  });
}
function drawKagePortrait(c, opts) {
  const O = !!opts.form;
  c.fillStyle = O ? '#1a0000' : '#07070c'; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 78, 22, 26, 'rgba(255,230,210,0.35)', 'rgba(0,0,0,0)'); c.restore();                      // the moon
  c.fillStyle = O ? '#2a0606' : '#2a2a3a'; c.beginPath(); c.moveTo(4, 100); c.lineTo(20, 76); c.lineTo(80, 76); c.lineTo(96, 100); c.fill();
  c.fillStyle = O ? '#a04040' : '#e0b890'; c.strokeStyle = '#3a2a1a'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(36, 38); c.lineTo(64, 38); c.lineTo(64, 56); c.lineTo(57, 70); c.lineTo(50, 73); c.lineTo(43, 70); c.lineTo(36, 56); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#111'; c.beginPath(); c.moveTo(32, 50); c.quadraticCurveTo(32, 26, 50, 26); c.quadraticCurveTo(68, 26, 68, 50); c.lineTo(62, 40); c.lineTo(50, 36); c.lineTo(38, 42); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(50, 20, 7, 5, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#111'; c.lineWidth = 1.5; for (const x of [40, 55, 60]) { c.beginPath(); c.moveTo(x, 38); c.lineTo(x + 2, 56); c.stroke(); }
  c.strokeStyle = '#8a4a4a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(56, 42); c.lineTo(62, 62); c.stroke();
  c.strokeStyle = '#111'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(39, 50); c.lineTo(47, 52); c.moveTo(61, 50); c.lineTo(53, 52); c.stroke();
  for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 4, 54); c.lineTo(50 + s * 12, 53); c.lineTo(50 + s * 10, 56); c.closePath(); c.fill(); circle(c, 50 + s * 8, 54.5, 1.6, O ? '#ff2020' : '#4a1010'); }
  if (O) { c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 8, 54.5, 8, 'rgba(255,40,40,1)', 'rgba(0,0,0,0)'); c.restore(); c.fillStyle = '#3a0a0a'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(50 + s * 10, 30); c.quadraticCurveTo(50 + s * 20, 14, 50 + s * 26, 4); c.lineTo(50 + s * 14, 30); c.fill(); } }
  c.strokeStyle = '#3a2a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(44, 65); c.lineTo(56, 65); c.stroke();
  drawKageBlade(c, 6, 94, -0.9, O, false);
}

// ---------------- kit ----------------
const KG_SLASH = Mv.shot({ name: 'Air Slash', desc: 'A crescent of wind from his blade.', proj: { speed: 1000, r: 14, dmg: 62, kind: 'crescent', color: '#fff', trail: false } });
const KG_QUICK = Mv.rush({ name: 'Quickdraw', desc: 'Instant slash straight through the foe. From the sheath: the classic iaido.', s: 14, speed: 2000, frames: 8, pass: true, hit: { dmg: 120, kb: [200, -400] } });
const KG_MIRROR = Mv.counter({ name: 'Mirror Stance', desc: 'Parry and cut. A parry feeds the DEMON +20.', window: 26, dmg: 140 });
const KG_CUTS = Mv.rekka({ name: 'Three Cuts', desc: 'Press S again for up to three slashes.', steps: [{ speed: 700, frames: 8, hit: { dmg: 52, kb: [200, 0], launch: false } }, { speed: 700, frames: 8, hit: { dmg: 58, kb: [200, 0], launch: false } }, { speed: 800, frames: 10, hit: { dmg: 78, kb: [600, -500] } }] });
const KG_LEAF = Mv.dive({ name: 'Falling Leaf', desc: 'Diagonal sword dive.', hit: { dmg: 90 } });
const KG_SUPER = superize(mk({ name: 'Moonlit Flash', desc: 'Vanishes. A beat later a single cut crosses the screen where the foe stood (tracks them). Spends half the DEMON gauge for up to +60% damage.', pose: 'block', s: 30, a: 4, r: 24,
  onStart: f => { const d = Math.floor((f.gauge || 0) / 2); f.kgBonus = d; if (!f.possessed) f.gauge -= d; f.invul = Math.max(f.invul, 30); kgSfx('tone', 2400, 0.2, 'sine', 0.05, 1200); },
  ev: { 30: f => { const o = f.opp; const x = o ? o.x : f.x + f.facing * 300; const y = o ? o.y - o.h / 2 : -90;
    Combat.strikeZone(f, { x: x - 160, y: y - 50, w: 320, h: 100 }, { dmg: 150 * (1 + (f.kgBonus || 0) / 83), guard: 'mid', hs: 34, kb: [300, -500], launch: true, sfx: 'h' });
    Combat.addHazard({ kind: 'kgLine', owner: f, side: f.side, x, y, len: 900, life: 26 }); f.x = clamp(x + f.facing * 140, 40, Arena.stage.width - 40); kgSfx('slash') || kgSfx('slam'); Cam.shake = 10; } } }), 100);
const KG_ULT = superize(mk({ name: 'DEMON SEVERANCE', desc: 'He sheathes and waits while a thin line of light crosses the stage, then draws once. Slow. Blockable. Must connect.', pose: 'block', s: 56, a: 6, r: 30,
  ev: { 1: f => { f.say('One cut.', 70); kgSfx('bell'); },
    56: f => { Combat.strikeZone(f, { x: f.facing > 0 ? f.x : f.x - 1400, y: f.y - 190, w: 1400, h: 196 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: KG_ULT });
      Combat.addHazard({ kind: 'kgLine', owner: f, side: f.side, x: f.x + f.facing * 700, y: f.y - 90, len: 1400, life: 30, big: true }); Cam.shake = 12; kgSfx('slam'); } } }), 300);
KG_ULT.id = 'kage_ult'; KG_ULT.recoverWhiff = 40;
KG_ULT.ult = { dmg: 1200, cutscene: (a, t) => csKageSever(a, t), fx: { el: 'blood', color: '#ff5a5a' } };

Object.assign(KAGE, {
  role: 'Iaido · Demon blade · Counters', handArt: true, draw: drawKage, drawPortrait: drawKagePortrait, transformCutscene: f => csKageOni(f),
  weaponTip: 140,
  gauge: { name: 'DEMON', max: 100, color: '#ff3030', label: f => (f.possessed ? '· POSSESSED' : f.sheathed ? '· SHEATHED' : '') },
  passive: ['Iaido', 'After 0.6s without attacking the blade is SHEATHED. His first strike from the sheath deals +30% damage.'],
  passiveDmg: f => (f.iaido ? 1.3 : 1) * (f.possessed ? 1.15 : 1),
  moves: { '5S': KG_SLASH, '6S': KG_QUICK, '2S': KG_MIRROR, '4S': KG_CUTS, 'jS': KG_LEAF },
  super: KG_SUPER, ult: KG_ULT, ultAct: 'strike',
  form: Object.assign(KAGE.form, { desc: 'Permanent. The oni is awake: longer reach, lifesteal, and the DEMON fills twice as fast.', model: undefined }),
});
for (const [slot, m] of Object.entries(KAGE.moves)) { m.id = 'kage_' + slot; m.slot = slot; m.owner = 'kage'; if (slot === 'jS') m.air = true; }
KG_SUPER.id = 'kage_super';
KAGE.onRoundStart = f => { f.gauge = 0; f.possessed = 0; f.idleT = 0; f.sheathed = false; f.iaido = false; };
KAGE.onHit = (a, t, dmg) => { kgDemon(a, (a.form ? 2 : 1) * 4); if (a.possessed) a.hp = Math.min(a.maxHp, a.hp + dmg * 0.25); if (a.move === KG_MIRROR) kgDemon(a, 20); };
KAGE.onHurt = (t) => kgDemon(t, t.form ? 6 : 3);
KAGE.passiveTick = f => {
  if (f.move) { if (f.mf <= 1) { f.iaido = f.sheathed; if (f.iaido) { Game.fx.add({ x: f.x + f.facing * 30, y: f.y - 70, vx: 0, vy: 0, life: 0.15, size: 22, color: '#fff', glow: true }); } } f.idleT = 0; f.sheathed = false; }
  else { f.iaido = false; if (++f.idleT >= 36 && !f.sheathed) { f.sheathed = true; kgSfx('tone', 3000, 0.04, 'sine', 0.03, 3000); } }
  if (f.possessed > 0) {
    f.hp = Math.max(1, f.hp - f.maxHp * 0.02 / FPS); f.status.haste = Math.max(f.status.haste || 0, 0.1); f.superArmorT = 1;
    if (f.state === 'block') f.state = 'stand';
    if (--f.possessed <= 0) { f.possessed = 0; f.gauge = 0; Game.popWorld(f.x, f.y - f.h - 30, 'THE DEMON SLEEPS', '#aab', 18); }
  }
};
// possessed Kage can't block
KAGE.onIncoming = (t) => { if (t.possessed && t.state === 'block') t.state = 'stand'; return undefined; };
KAGE.passiveArmor = f => (f.possessed ? 0.8 : 1);
Combat.hz.kgLine = h => h.t < h.life;
Combat.drawHz.kgLine = (c, h) => {
  const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter';
  c.strokeStyle = `rgba(255,255,255,${1 - k})`; c.lineWidth = (h.big ? 10 : 6) * (1 - k * 0.7); c.beginPath(); c.moveTo(h.x - h.len / 2, h.y + 20); c.lineTo(h.x + h.len / 2, h.y - 20); c.stroke();
  c.strokeStyle = `rgba(255,60,60,${0.8 * (1 - k)})`; c.lineWidth = (h.big ? 24 : 14) * (1 - k); c.beginPath(); c.moveTo(h.x - h.len / 2, h.y + 20); c.lineTo(h.x + h.len / 2, h.y - 20); c.stroke(); c.restore();
};
// the waiting line during the ultimate
KAGE.drawWorldFront = (c, f) => {
  if (f.move !== KG_ULT || f.mf >= 56) return; const k = f.mf / 56;
  c.save(); c.strokeStyle = `rgba(255,255,255,${0.2 + 0.5 * k})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(f.x, f.y - 90); c.lineTo(f.x + f.facing * 1400 * k, f.y - 90); c.stroke(); c.restore();
};

// ---------------- cinematics ----------------
function csKageOni(f) {
  const d = f.def;
  return {
    name: 'ONI BLADE', dur: 4, fx: new ParticleSystem(500),
    cues: [[0.1, () => kgSfx('heartbeat')], [1.2, () => kgSfx('heartbeat')], [2.2, () => { kgSfx('roar'); kgSfx('boom'); }]],
    draw(c, t) {
      c.fillStyle = '#050005'; c.fillRect(0, 0, W, H);
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W * 0.75, H * 0.28, 110, 'rgba(255,220,200,0.5)', 'rgba(0,0,0,0)'); c.restore();
      if (t < 2.2) {
        // close-up of the blade as a red eye opens along its edge
        const k = seg(t, 0.2, 2.2);
        c.save(); c.translate(W / 2, H / 2); c.scale(4, 4); drawKageBlade(c, -70, 0, 0, k > 0.6, false); c.restore();
        c.fillStyle = '#ff2020'; c.beginPath(); c.ellipse(W / 2 + 40, H / 2, 70 * ease.out(k), 12 * ease.out(k), 0, 0, Math.PI * 2); c.fill(); circle(c, W / 2 + 40, H / 2, 8 * k, '#000');
        caption(c, 'Four hundred years. It is still hungry.', t, 0.1, 2.1, '#ffb0b0');
      } else {
        drawCharAt(c, d, W / 2, H - 50, 2.7, 1, { pose: 'victory', anim: t, transformed: true });
        flashAt(c, t, 2.2, 2.5, '#ff6a6a');
        titleSlam(c, 'ONI BLADE', 'THE DEMON WAKES', t, 2.3, '#ff3030', 90);
      }
    },
  };
}
function csKageSever(a, opp) {
  const fx = new ParticleSystem(1200), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'DEMON SEVERANCE', dur: 6.2, fx,
    cues: [[0, () => kgSfx('bell')], [2.6, () => kgSfx('tone', 3200, 0.3, 'sine', 0.06, 1600)], [3.8, () => { kgSfx('slam'); kgSfx('boom'); }]],
    draw(c, t) {
      c.fillStyle = '#060206'; c.fillRect(0, 0, W, H);
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2, H * 0.32, 180, 'rgba(255,210,200,0.45)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#0e060a'; c.fillRect(0, H - 70, W, 70);
      if (Math.random() < 0.3) fx.add({ x: rand(0, W), y: -10, vx: rand(-60, 60), vy: rand(80, 160), life: 5, size: rand(4, 7), color: '#ffb0c0', shape: 'rect', rot: rand(0, 6), vr: 2 });
      fx.draw(c);
      if (t < 3.8) {
        drawCharAt(c, a.def, W * 0.25, H - 70, 2.4, 1, { pose: 'block', anim: 0, sheathed: true });
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.75, H - 70, oppScale, -1, { pose: 'idle', anim: t, transformed: opp.transformed }), '#1a0a10');
        caption(c, 'One cut.', t, 0.3, 1.6, '#ffd0d0'); caption(c, 'Is enough.', t, 1.9, 3.3, '#ffd0d0');
        if (t > 2.6) { c.fillStyle = '#000'; c.globalAlpha = seg(t, 2.6, 3.8); c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
      } else {
        const k = seg(t, 3.8, 4.1);
        drawCharAt(c, a.def, W * 0.82, H - 70, 2.4, -1, { pose: 'dash', anim: 0 });
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.5, H - 70, oppScale, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }), '#1a0a10');
        c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, H * 0.62); c.lineTo(W * k, H * 0.62 - 60 * k); c.stroke();
        c.strokeStyle = 'rgba(255,40,40,0.8)'; c.lineWidth = 30 * (1 - seg(t, 4.1, 5.2)); c.beginPath(); c.moveTo(0, H * 0.62); c.lineTo(W, H * 0.62 - 60); c.stroke(); c.restore();
        flashAt(c, t, 3.8, 4.0, '#fff');
        if (t > 4.4) titleSlam(c, 'DEMON SEVERANCE', 'ONE CUT', t, 4.5, '#ff3030', 90);
      }
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('kage:')) delete PortraitCache[k]; });
