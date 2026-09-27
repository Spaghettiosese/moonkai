// ============================================================
//  MOONKAI — GRIMM, the Soul Reaper (rebuilt).
//
//  GAUGE   · SOULS (10 pips)  every hit reaps a soul; each soul is +2.5% damage. Souls are
//                    AMMUNITION: Soul Wisp spends 3 for a triple volley, Harvest Moon spends
//                    them all for extra cuts. Getting hit knocks one loose.
//  PASSIVE · DEATH'S DOOR  a foe under 15% health has an hourglass over their head. Land
//                    REAP (→I) on them clean and their appointment is kept: instant K.O.
//  FINAL APPOINTMENT  ultimate: an hourglass settles over the foe and runs out; then the scythe
//                    falls. Slow, blockable, must connect.
// ============================================================
const grSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const GRIMM = charById('grimm');
const GR_DOOR = 0.15;
const grSoul = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 10); };

function drawGrimmScythe(c, x, y, ang, glow) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.strokeStyle = '#2a2420'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-50, 0); c.lineTo(120, 0); c.stroke();
  c.strokeStyle = '#555'; c.lineWidth = 2; for (const k of [-20, 40, 100]) { c.beginPath(); c.moveTo(k, -3); c.lineTo(k, 3); c.stroke(); }
  c.fillStyle = '#9aa0a8'; c.strokeStyle = '#141414'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(118, -4); c.quadraticCurveTo(140, 40, 80, 84); c.quadraticCurveTo(114, 40, 104, 4); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#e8eef0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(116, 2); c.quadraticCurveTo(134, 40, 84, 80); c.stroke();
  if (glow > 0) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(140,255,160,${glow})`; c.lineWidth = 6; c.beginPath(); c.moveTo(118, 0); c.quadraticCurveTo(138, 40, 82, 82); c.stroke(); }
  c.restore();
}
function drawGrimm(c, v) {
  const t = v.anim || 0, D = !!v.transformed, m = v.move, souls = v.gauge || 0;
  c.save(); c.translate(0, -8 + Math.sin(t * 2.5) * 5);
  // souls orbit him
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < souls; i++) { const a = t * 1.6 + i * Math.PI * 2 / Math.max(1, souls); glowCircle(c, Math.cos(a) * 46, -80 + Math.sin(a) * 22, 6, 'rgba(140,255,160,0.9)', 'rgba(0,0,0,0)'); }
  c.restore();
  // the robe replaces the legs: a tattered bell that trails into smoke
  c.fillStyle = D ? '#050805' : '#0e0e0e'; c.strokeStyle = '#000'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(-16, -96); c.lineTo(16, -96); c.lineTo(26, -30);
  for (let i = 0; i <= 6; i++) c.lineTo(26 - i * 9, -6 + (i % 2) * 12 + Math.sin(t * 5 + i) * 4);
  c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(140,255,160,0.08)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-20 + i * 12 + Math.sin(t * 3 + i) * 4, -4 + (i % 2) * 6, 8, 0, Math.PI * 2); c.fill(); }
  drawHumanoid(c, v, { skin: '#e8e2d4', top: D ? '#0a120a' : '#141414', topDark: '#070707', pants: 'rgba(0,0,0,0)', pantsDark: 'rgba(0,0,0,0)', boots: 'rgba(0,0,0,0)', glove: '#d8d2c4', noHead: true, build: 'slim' }, {
    back(c, P) {
      if (!D) return;
      for (const s of [-1, 1]) { c.save(); c.translate(P.sh[0] - 6, P.sh[1] + 4); c.rotate(-0.5 + s * 0.25 + Math.sin(t * 3) * 0.06); c.fillStyle = '#050505';
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, -50); c.lineTo(-90, -40); c.lineTo(-72, -14); c.lineTo(-96, 0); c.lineTo(-58, 10); c.lineTo(-20, 16); c.closePath(); c.fill(); c.restore(); }
    },
    head(c, P) {
      const [hx, hy] = P.head;
      // deep hood, a bare skull inside, green pinprick eyes
      c.fillStyle = '#0a0a0a'; c.beginPath(); c.moveTo(hx - 16, hy + 12); c.quadraticCurveTo(hx - 18, hy - 22, hx + 2, hy - 20); c.quadraticCurveTo(hx + 20, hy - 14, hx + 16, hy + 12); c.closePath(); c.fill();
      c.fillStyle = '#e8e2d4'; c.beginPath(); c.ellipse(hx + 4, hy - 1, 9, 10, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#111'; c.beginPath(); c.ellipse(hx + 6, hy - 3, 3.2, 3.6, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(hx - 1, hy - 3, 2.6, 3.4, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(hx + 3, hy + 2); c.lineTo(hx + 5, hy + 5); c.lineTo(hx + 2, hy + 5); c.fill();
      c.strokeStyle = '#111'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(hx - 1 + i * 3, hy + 7); c.lineTo(hx - 1 + i * 3, hy + 10); c.stroke(); }
      c.save(); c.globalCompositeOperation = 'lighter'; for (const [ex, er] of [[6, 5], [-1, 4]]) glowCircle(c, hx + ex, hy - 3, D ? er + 3 : er, 'rgba(140,255,160,1)', 'rgba(0,0,0,0)'); c.restore();
    },
    front(c, P) {
      const swing = m && (m.name === 'Reap' || m.name === 'Harvest Moon');
      const ang = swing ? lerp(-2.4, 1.2, clamp((v.mf || 0) / ((m.s || 10) + 4), 0, 1)) : ({ heavy: 0.8, slam: 1.2, dash: 0.3, uppercut: -1.6, air_spike: 1.4, air_heavy: 0.8, hurt: 2.2, hurt_air: 2.3, victory: -1.4, intro: 1.2 }[v.pose] ?? -1.2);
      drawGrimmScythe(c, P.fH[0], P.fH[1], ang, swing ? 0.8 : D ? 0.4 : 0);
    },
  });
  c.restore();
}
function drawGrimmPortrait(c, opts) {
  const D = !!opts.form;
  c.fillStyle = '#020402'; c.fillRect(0, 0, 100, 100);
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50, 50, 60, D ? 'rgba(80,200,100,0.35)' : 'rgba(60,140,80,0.2)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#0a0a0a'; c.beginPath(); c.moveTo(4, 100); c.quadraticCurveTo(8, 10, 50, 6); c.quadraticCurveTo(92, 10, 96, 100); c.fill();
  c.fillStyle = '#000'; c.beginPath(); c.ellipse(50, 56, 28, 36, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#e8e2d4'; c.strokeStyle = '#6a6458'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(32, 48); c.quadraticCurveTo(32, 24, 50, 24); c.quadraticCurveTo(68, 24, 68, 48); c.lineTo(64, 64); c.lineTo(60, 80); c.lineTo(40, 80); c.lineTo(36, 64); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#0a0a0a'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(50 + s * 9, 48, 7, 8, s * 0.2, 0, Math.PI * 2); c.fill(); }
  c.beginPath(); c.moveTo(50, 56); c.lineTo(46, 64); c.lineTo(54, 64); c.closePath(); c.fill();
  c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(40, 72); c.lineTo(60, 72); c.stroke(); for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(41 + i * 3, 69); c.lineTo(41 + i * 3, 76); c.stroke(); }
  c.strokeStyle = '#6a6458'; c.beginPath(); c.moveTo(56, 30); c.lineTo(52, 38); c.lineTo(55, 42); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glowCircle(c, 50 + s * 9, 49, D ? 9 : 6, 'rgba(140,255,160,1)', 'rgba(0,0,0,0)'); c.restore();
  for (const s of [-1, 1]) circle(c, 50 + s * 9, 49, 1.6, '#eaffea');
  drawGrimmScythe(c, 4, 96, -1.25, D ? 0.6 : 0.2);
}

// ---------------- kit ----------------
const GR_WISP = Mv.shot({ name: 'Soul Wisp', desc: 'A homing lost soul. With 3+ SOULS, spends 3 for a triple volley.', proj: { speed: 480, homing: 2.5, r: 12, dmg: 55, kind: 'skull', color: '#9aff9a', life: 3 } });
const GR_WISP3 = Mv.shot({ name: 'Soul Volley', desc: 'Three homing souls (costs 3 SOULS).', proj: { speed: 520, homing: 2.8, r: 12, dmg: 42, count: 3, spread: 0.6, kind: 'skull', color: '#caffca', life: 3 } });
GR_WISP3.onStart = f => grSoul(f, -3);
const GR_REAP = mk({ name: 'Reap', desc: 'A long scythe sweep that drags the foe in. On a foe at DEATH\'S DOOR (under 15%), a clean hit is an instant K.O.', pose: 'heavy', s: 14, a: 6, r: 22, vel: [[4, 14, 520, null]],
  hit: { dmg: 95, box: [-10, -150, 190, 150], kb: [-320, -180], pull: true, hs: 22, sfx: 'h' }, ai: { min: 0, max: 230, use: 'combo' },
  onHit: (a, t) => {
    if (t.hp > 0 && t.hp <= t.maxHp * GR_DOOR && t.state !== 'ko') {
      Game.popWorld(t.x, t.y - t.h - 50, 'APPOINTMENT KEPT', '#9aff9a', 30); Game.announce('REAPED', '#9aff9a', 90); grSfx('bell'); grSfx('slam'); Cam.shake = 16;
      Combat.addHazard({ kind: 'grSlash', owner: a, side: a.side, x: t.x, y: t.y - t.h / 2, life: 24, big: true });
      t.hp = 0; Game.battle && Game.battle.onKO(t, a, null); grSoul(a, 3);
    }
  } });
const GR_HANDS = Mv.place({ name: 'Grave Hands', desc: 'Hands burst from the ground under the foe and hold them (short stun).', spawn: { kind: 'spike', at: 'enemy', delay: 0.5, dmg: 70, color: '#9aff9a', fill: '#2a3a2a', stun: 0.45, status: { slow: 1.5 } } });
const GR_PHASE = Mv.teleport({ name: 'Phase', desc: 'Fades out and reappears behind the foe.', to: 'behind' });
const GR_DESCENT = Mv.dive({ name: 'Death\'s Descent', desc: 'Plunging scythe.', vx: 600, vy: 1000, hit: { dmg: 90 } });
const GR_SUPER = superize(mk({ name: 'Harvest Moon', desc: 'Spends ALL souls: a crescent of cuts; every soul spent adds 8% damage.', pose: 'heavy', s: 10, a: 30, r: 26, ai: { min: 0, max: 260, use: 'combo' },
  onStart: f => { f.grSpent = f.gauge || 0; f.gauge = 0; grSfx('bell'); },
  hit: { dmg: 30, box: [-30, -170, 230, 180], multi: 12, every: 3, kb: [60, -40], hs: 10, sfx: 'm' } }), 100);
const GR_ULT = superize(mk({ name: 'FINAL APPOINTMENT', desc: 'An hourglass settles over the foe and runs out. Then the scythe falls. Blockable. Must connect.', pose: f => (f.mf < 60 ? 'cast' : 'heavy'), s: 62, a: 10, r: 30,
  ev: { 1: f => { f.say('Your time is up.', 80); grSfx('bell'); const t = f.opp; f.grTele = Combat.telegraph(f, { x: t ? t.x : f.x, follow: t, track: 0.12, r: 95, life: 999, color: '#9aff9a', column: true, hourglass: true }); },
    62: f => {
      const x = f.grTele ? f.grTele.x : f.x; if (f.grTele) f.grTele.life = 0; f.grTele = null;
      Combat.strikeZone(f, { x: x - 110, y: -260, w: 220, h: 266 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: GR_ULT, fromX: x });
      Combat.addHazard({ kind: 'grSlash', owner: f, side: f.side, x, y: -120, life: 26, big: true }); Cam.shake = 12; grSfx('slam');
    } } }), 300);
GR_ULT.id = 'grimm_ult'; GR_ULT.recoverWhiff = 40;
GR_ULT.ult = { dmg: 1150, cutscene: (a, t) => csGrimmAppointment(a, t), fx: { el: 'soul', color: '#9aff9a' } };

Object.assign(GRIMM, {
  role: 'Soul ammo · Executioner', handArt: true, draw: drawGrimm, drawPortrait: drawGrimmPortrait, transformCutscene: f => csGrimmIncarnate(f),
  weaponTip: 150, tall: 1.05,
  gauge: { name: 'SOULS', max: 10, color: '#9aff9a', pips: true },
  passive: ['Death\'s Door', 'A foe under 15% health wears an hourglass. A clean REAP (→I) on them is an instant K.O.'],
  onHit: (a) => grSoul(a, a.form ? 2 : 1),
  passiveDmg: f => 1 + (f.gauge || 0) * 0.025 + (f.move === GR_SUPER ? (f.grSpent || 0) * 0.08 : 0),
  moves: { '5S': GR_WISP, '6S': GR_REAP, '2S': GR_HANDS, '4S': GR_PHASE, 'jS': GR_DESCENT },
  super: GR_SUPER, ult: GR_ULT, ultAct: 'strike',
  form: Object.assign(GRIMM.form, { desc: 'Permanent. Starts full on SOULS, earns two per hit, 15% lifesteal, and DEATH\'S DOOR opens at 25%.', onStart(f) { f.gauge = 10; }, model: undefined }),
});
for (const [slot, m] of Object.entries(GRIMM.moves)) { m.id = 'grimm_' + slot; m.slot = slot; m.owner = 'grimm'; if (slot === 'jS') m.air = true; }
GR_WISP3.id = 'grimm_5S'; GR_SUPER.id = 'grimm_super';
delete GRIMM.passiveArmor;
GRIMM.specialFor = (f, slot) => (slot === '5S' && (f.gauge || 0) >= 3 ? GR_WISP3 : undefined);
GRIMM.onRoundStart = f => { f.gauge = f.form ? 10 : 0; };
GRIMM.onHurt = (t) => { if ((t.gauge || 0) > 0 && !t.form) { grSoul(t, -1); Game.fx.add({ x: t.x, y: t.y - 90, vx: rand(-80, 80), vy: -200, life: 0.8, size: 8, color: '#9aff9a', glow: true }); } };
const grDoor = f => (f.opp && f.opp.hp > 0 && f.opp.hp <= f.opp.maxHp * (f.form ? 0.25 : GR_DOOR));
// the door threshold grows in DEATH INCARNATE
GR_REAP.onHit = ((base) => (a, t) => { if (a.form && t.hp <= t.maxHp * 0.25 && t.hp > t.maxHp * GR_DOOR) t.hp = Math.min(t.hp, t.maxHp * GR_DOOR); base(a, t); })(GR_REAP.onHit);
GRIMM.drawWorldFront = (c, f) => {
  if (!grDoor(f)) return; const o = f.opp, x = o.x, y = o.y - o.h - 46, k = (f.st % 120) / 120;
  c.save(); c.translate(x, y); c.strokeStyle = '#9aff9a'; c.lineWidth = 2; c.fillStyle = 'rgba(10,20,10,0.6)';
  c.beginPath(); c.moveTo(-10, -14); c.lineTo(10, -14); c.lineTo(0, 0); c.lineTo(10, 14); c.lineTo(-10, 14); c.lineTo(0, 0); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#9aff9a'; c.beginPath(); c.moveTo(-8 * (1 - k), -12 + 12 * k); c.lineTo(8 * (1 - k), -12 + 12 * k); c.lineTo(0, 0); c.fill(); c.beginPath(); c.moveTo(-8 * k, 13); c.lineTo(8 * k, 13); c.lineTo(0, 13 - 12 * k); c.fill();
  c.restore();
};
Combat.hz.grSlash = h => h.t < h.life;
Combat.drawHz.grSlash = (c, h) => {
  const k = h.t / h.life, R = h.big ? 160 : 90; c.save(); c.globalCompositeOperation = 'lighter';
  c.strokeStyle = `rgba(160,255,170,${1 - k})`; c.lineWidth = (h.big ? 18 : 10) * (1 - k);
  c.beginPath(); c.arc(h.x, h.y, R, -2.6 + k * 0.6, 0.5 + k * 0.6); c.stroke();
  c.strokeStyle = `rgba(255,255,255,${1 - k})`; c.lineWidth = 3 * (1 - k); c.beginPath(); c.arc(h.x, h.y, R - 6, -2.4 + k * 0.6, 0.3 + k * 0.6); c.stroke(); c.restore();
};

// ---------------- cinematics ----------------
function csGrimmIncarnate(f) {
  const d = f.def;
  return {
    name: 'DEATH INCARNATE', dur: 4.2, fx: new ParticleSystem(600),
    cues: [[0, () => grSfx('bell')], [1.2, () => grSfx('bell')], [2.4, () => { grSfx('roar'); grSfx('boom'); }]],
    draw(c, t) {
      c.fillStyle = '#010301'; c.fillRect(0, 0, W, H);
      // a field of graves; souls rise out of them and fly into him
      c.fillStyle = '#0a140a'; c.fillRect(0, H - 90, W, 90);
      for (let i = 0; i < 12; i++) { const x = 40 + i * (W - 80) / 11, h2 = 40 + (i % 3) * 14; c.fillStyle = '#1a221a'; c.beginPath(); c.moveTo(x - 16, H - 90); c.lineTo(x - 16, H - 90 - h2); c.quadraticCurveTo(x, H - 110 - h2, x + 16, H - 90 - h2); c.lineTo(x + 16, H - 90); c.fill(); }
      const k = seg(t, 0.3, 2.4);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 12; i++) { const x0 = 40 + i * (W - 80) / 11, y0 = H - 120, p = clamp(k * 1.4 - (i % 4) * 0.1, 0, 1); glowCircle(c, lerp(x0, W / 2, ease.in(p)), lerp(y0, H * 0.45, ease.in(p)) - Math.sin(p * Math.PI) * 120, 10, 'rgba(140,255,160,0.9)', 'rgba(0,0,0,0)'); }
      c.restore();
      drawCharAt(c, d, W / 2, H - 70, 2.6, 1, { pose: t < 2.4 ? 'cast_up' : 'victory', anim: t, transformed: t > 2.3, gauge: 10 });
      caption(c, 'Everyone has an appointment.', t, 0.1, 1.6, '#caffca');
      flashAt(c, t, 2.4, 2.7, '#caffca');
      titleSlam(c, 'DEATH INCARNATE', 'NO REFUNDS', t, 2.5, '#9aff9a', 90);
    },
  };
}
function csGrimmAppointment(a, opp) {
  const fx = new ParticleSystem(1200), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.4;
  return {
    name: 'FINAL APPOINTMENT', dur: 6.4, fx,
    cues: [[0, () => grSfx('bell')], [1.0, () => grSfx('bell')], [2.0, () => grSfx('bell')], [3.4, () => { grSfx('slam'); grSfx('boom'); }]],
    draw(c, t) {
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      if (t < 3.2) {
        // a giant hourglass; the foe stands in the lower bulb as the sand buries them
        const k = seg(t, 0, 3.2), cx = W / 2, top = 60, mid = H / 2, bot = H - 60, w = 260;
        c.strokeStyle = '#9aff9a'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx - w, top); c.lineTo(cx + w, top); c.lineTo(cx + 10, mid); c.lineTo(cx + w, bot); c.lineTo(cx - w, bot); c.lineTo(cx - 10, mid); c.closePath(); c.stroke();
        c.fillStyle = 'rgba(140,255,160,0.5)'; const sT = (1 - k); c.beginPath(); c.moveTo(cx - w * sT, mid - (mid - top) * sT); c.lineTo(cx + w * sT, mid - (mid - top) * sT); c.lineTo(cx, mid); c.fill();
        const sb = bot - (bot - mid) * k * 0.9; c.beginPath(); c.moveTo(cx - w, bot); c.lineTo(cx + w, bot); c.lineTo(cx + w - (bot - sb) * 0.6, sb); c.lineTo(cx - w + (bot - sb) * 0.6, sb); c.fill();
        c.fillRect(cx - 2, mid, 4, sb - mid);
        silhouette(c, o => drawCharAt(o, opp.def, cx, bot, oppScale * 0.8, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), '#0a1a0a');
        caption(c, t < 1.6 ? 'Your time is up.' : 'No refunds.', t, t < 1.6 ? 0.1 : 1.7, t < 1.6 ? 1.5 : 3.1, '#caffca');
      } else {
        const k = seg(t, 3.2, 3.8);
        c.fillStyle = '#030803'; c.fillRect(0, 0, W, H);
        drawCharAt(c, a.def, W * 0.3, H - 60, 3, 1, { pose: 'heavy', anim: t, gauge: 10 });
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.66, H - 60, oppScale, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }), k < 1 ? '#0a1a0a' : '#caffca');
        c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(160,255,170,${1 - seg(t, 3.8, 5)})`; c.lineWidth = 30; c.beginPath(); c.arc(W * 0.5, H * 0.45, 380, -2.7, -2.7 + 2.6 * ease.out(k)); c.stroke(); c.restore();
        if (t > 3.6 && Math.random() < 0.8) for (let i = 0; i < 4; i++) fx.add({ x: W * 0.66, y: H * 0.6, vx: rand(-300, 300), vy: rand(-600, -100), life: 1.2, size: rand(4, 9), color: '#9aff9a', glow: true });
        fx.draw(c);
        flashAt(c, t, 3.4, 3.7, '#eaffea');
        if (t > 4.2) titleSlam(c, 'FINAL APPOINTMENT', 'THE PAPERWORK IS DONE', t, 4.3, '#9aff9a', 84);
      }
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('grimm:')) delete PortraitCache[k]; });
