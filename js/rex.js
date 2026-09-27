// ============================================================
//  MOONKAI — REX, the Tyrant (rebuilt).
//
//  GAUGE   · HUNGER  grows on its own every second. The hungrier he is the faster and harder
//                    he hits (up to +25% damage, +15% speed at full), but at full HUNGER he
//                    starts to starve (loses health). CHOMP (↓I) eats: it heals him by the HUNGER
//                    it spends and resets it.
//  PASSIVE · APEX PREDATOR  +20% damage to anyone under half health. Also smells blood:
//                    he always faces a bleeding foe, even through cross-ups.
//  SUPER · PRIMAL HUNT  sniffs, locks on, then sprints across the whole stage wherever the foe is
//                    and lunges; a bite that lands turns into a DEATH ROLL.
//  EXTINCTION EVENT     ultimate: a slow asteroid shadow tracks the foe, then it lands.
// ============================================================
const rxSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const REX = charById('rex');
const RX_PAL = { build: 'heavy', skin: '#6aba3a', top: '#5aa02a', topDark: '#3a7a1a', pants: '#4a8a2a', pantsDark: '#2e6018', boots: '#2a4a14', glove: '#5aa02a', noHead: true, belt: '#3a2a1a' };
const RX_KING_PAL = Object.assign({}, RX_PAL, { skin: '#3a8a2a', top: '#2a7a1a', topDark: '#1a5a10', pants: '#2a6a1a' });

function drawRex(c, v) {
  const t = v.anim || 0, K = !!v.transformed, m = v.move, H = (v.gauge || 0) / 100, P0 = K ? RX_KING_PAL : RX_PAL;
  drawHumanoid(c, v, P0, {
    back(c, P) { // the tail, swaying; armored ridges
      const x = P.hip[0] - 6, y = P.hip[1] + 4, sw = Math.sin(t * 3) * 10 + (m && m.name === 'Tail Quake' ? 40 : 0);
      c.fillStyle = P0.top; c.strokeStyle = '#1a3a0a'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x, y - 14); c.quadraticCurveTo(x - 50, y - 10 + sw * 0.3, x - 100, y + 20 + sw); c.quadraticCurveTo(x - 50, y + 14, x + 2, y + 12); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#2a4a14'; for (let i = 0; i < 6; i++) { const k = i / 6, px = lerp(x, x - 95, k), py = lerp(y - 12, y + 16 + sw, k * k); c.beginPath(); c.moveTo(px - 5, py); c.lineTo(px - 1, py - 10 + k * 4); c.lineTo(px + 4, py); c.fill(); }
      for (let i = 0; i < 5; i++) { const px = lerp(P.hip[0], P.sh[0], i / 4) - 8, py = lerp(P.hip[1], P.sh[1], i / 4); c.beginPath(); c.moveTo(px - 4, py); c.lineTo(px - 12, py - 6); c.lineTo(px - 2, py - 8); c.fill(); }
    },
    chest(c, P) { // pale belly scales
      const x = lerp(P.hip[0], P.sh[0], 0.5) + 6, y = lerp(P.hip[1], P.sh[1], 0.5);
      c.fillStyle = '#d8d8a0'; c.beginPath(); c.ellipse(x, y, 9, 20, 0.1, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#a8a870'; c.lineWidth = 1; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x - 8, y + i * 7); c.lineTo(x + 8, y + i * 7); c.stroke(); }
    },
    head(c, P) {
      const [hx, hy] = P.head, open = m && (m.name === 'Chomp' || m.name === 'Roar' || m.name === 'Primal Hunt' || m.name === 'Death Roll') ? 0.5 : 0.08 + 0.05 * Math.sin(t * 2);
      c.save(); c.translate(hx - 4, hy + 4);
      c.fillStyle = P0.skin; c.strokeStyle = '#1a3a0a'; c.lineWidth = 1.6;
      // skull + upper jaw
      c.save(); c.rotate(-open * 0.6); c.beginPath(); c.moveTo(-10, -10); c.quadraticCurveTo(4, -22, 30, -14); c.lineTo(44, -8); c.lineTo(44, 0); c.lineTo(-6, 4); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(6 + i * 6, 0); c.lineTo(8 + i * 6, 6); c.lineTo(10 + i * 6, 0); c.fill(); }
      c.fillStyle = '#ffcc20'; c.beginPath(); c.ellipse(12, -10, 4, 3, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#000'; c.fillRect(11.5, -12.5, 1.5, 5);
      c.strokeStyle = '#1a3a0a'; c.lineWidth = 2; c.beginPath(); c.moveTo(6, -15); c.lineTo(18, -12); c.stroke();                       // brow
      c.fillStyle = '#2a4a14'; c.beginPath(); c.moveTo(36, -12); c.lineTo(38, -14); c.lineTo(40, -11); c.fill();                        // nostril
      c.restore();
      // lower jaw
      c.save(); c.rotate(open * 0.5); c.fillStyle = P0.skin; c.strokeStyle = '#1a3a0a'; c.beginPath(); c.moveTo(-6, 4); c.lineTo(40, 2); c.lineTo(36, 10); c.lineTo(-4, 14); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(8 + i * 6, 3); c.lineTo(10 + i * 6, -3); c.lineTo(12 + i * 6, 3); c.fill(); }
      c.restore();
      if (H > 0.7) { c.fillStyle = 'rgba(220,240,255,0.7)'; c.beginPath(); c.moveTo(30, 8); c.quadraticCurveTo(32, 16 + Math.sin(t * 4) * 4, 30, 22); c.lineTo(28, 8); c.fill(); }   // drool
      c.restore();
    },
    front(c, P) { // claws on the gloves
      for (const p of [P.fH, P.bH]) { c.fillStyle = '#eee'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(p[0] + 2, p[1] - 4 + i * 4); c.lineTo(p[0] + 10, p[1] - 3 + i * 4); c.lineTo(p[0] + 2, p[1] - 1 + i * 4); c.fill(); } }
    },
  });
}
function drawRexPortrait(c, opts) {
  const K = !!opts.form;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, '#c06020'); g.addColorStop(1, '#1a0a00'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.fillStyle = 'rgba(40,20,0,0.6)'; c.beginPath(); c.moveTo(0, 70); c.lineTo(20, 50); c.lineTo(34, 64); c.lineTo(60, 40); c.lineTo(80, 60); c.lineTo(100, 48); c.lineTo(100, 100); c.lineTo(0, 100); c.fill();    // volcanoes
  const sk = K ? '#3a8a2a' : '#6aba3a';
  c.fillStyle = sk; c.strokeStyle = '#1a3a0a'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(4, 38); c.quadraticCurveTo(30, 12, 76, 26); c.lineTo(98, 36); c.lineTo(98, 52); c.lineTo(10, 60); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(10, 60); c.lineTo(92, 58); c.lineTo(84, 74); c.lineTo(14, 84); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#fff'; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(18 + i * 8, 56); c.lineTo(21 + i * 8, 66); c.lineTo(24 + i * 8, 56); c.fill(); c.beginPath(); c.moveTo(18 + i * 8, 62); c.lineTo(21 + i * 8, 55); c.lineTo(24 + i * 8, 62); c.fill(); }
  c.fillStyle = '#300'; c.fillRect(16, 58, 72, 2);
  c.fillStyle = '#ffcc20'; c.beginPath(); c.ellipse(36, 34, 7, 5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#000'; c.fillRect(35, 29.5, 2.4, 9);
  c.strokeStyle = '#1a3a0a'; c.lineWidth = 3; c.beginPath(); c.moveTo(24, 27); c.lineTo(46, 30); c.stroke();
  c.fillStyle = '#2a4a14'; c.beginPath(); c.ellipse(90, 38, 3, 2, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#5a1a0a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(50, 22); c.lineTo(56, 40); c.lineTo(52, 48); c.stroke();                      // old scar
  if (K) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 36, 34, 14, 'rgba(255,140,30,0.9)', 'rgba(0,0,0,0)'); c.restore(); }
}

// ---------------- kit ----------------
const RX_ROAR = Mv.custom({ name: 'Roar', desc: 'A stunning roar. Hungry roars reach further.', pose: 'charge', s: 18, a: 8, r: 24, hit: { dmg: 30, box: [0, -140, 200, 140], stun: 0.8, kb: [200, 0], hs: 10 }, ai: { min: 0, max: 180, use: 'combo' } });
const RX_STAMPEDE = Mv.rush({ name: 'Stampede', desc: 'Armored charge. Wall bounce.', speed: 850, frames: 24, armor: [4, 30], hit: { dmg: 120, kb: [700, -300], wb: true } });
const RX_CHOMP = Object.assign(Mv.grab({ name: 'Chomp', desc: 'Bite command grab. EATS: heals by the HUNGER it spends, then HUNGER resets.', range: 80, grabData: { anim: 'drain', dmg: 180, frames: 36 } }),
  { onHit: a => { const h = a.gauge || 0; if (h > 5) { Combat.healSelf(a, Math.round(h * 2.5)); a.gauge = 0; Game.popWorld(a.x, a.y - a.h - 40, 'FED', '#8aff6a', 20); } } });
const RX_QUAKE = Mv.place({ name: 'Tail Quake', desc: 'Tail slam sends a shockwave.', spawn: { kind: 'wave', at: 'front', dx: 50, dir: 1, dmg: 75, life: 0.9 } });
const RX_FLOP = Mv.dive({ name: 'Belly Flop', desc: 'Crushing dive. Ground bounce.', vx: 300, vy: 1500, hit: { dmg: 120, gb: true } });
const RX_ROLL = mk({ name: 'Death Roll', pose: 'throw', s: 1, a: 4, r: 30, grab: { anim: 'spin', dmg: 320, frames: 50 }, hit: { box: [0, -140, 150, 140], dmg: 0, guard: 'unblock', hs: 1 } });
const RX_SUPER = superize(mk({ name: 'Primal Hunt', desc: 'Sniffs, locks on, then sprints across the whole stage wherever the foe is and lunges. A bite that lands becomes a DEATH ROLL (400).', pose: f => (f.mf < 24 ? 'charge' : 'dash'), s: 24, a: 50, r: 24, armor: [24, 70],
  ev: { 2: f => { f.say('*sniff*', 40); rxSfx('growl') || rxSfx('roar'); } },
  hit: { dmg: 40, box: [0, -150, 120, 150], kb: [0, 0], hs: 8, guard: 'mid' },
  onHit: (a, t) => { a.move = null; a.state = 'stand'; a.startMove(RX_ROLL); } }), 100);
const RX_ULT = superize(mk({ name: 'EXTINCTION EVENT', desc: 'The asteroid shadow tracks the foe for over a second, then it lands. Blockable. Must connect.', pose: 'cast_up', s: 80, a: 10, r: 30,
  ev: { 1: f => { f.say('You want to know how it felt?', 90); rxSfx('roar'); const t = f.opp; f.rxTele = Combat.telegraph(f, { x: t ? t.x : f.x, follow: t, track: 0.1, r: 150, life: 999, color: '#ff8a1a', column: true }); },
    80: f => { const x = f.rxTele ? f.rxTele.x : f.x; if (f.rxTele) f.rxTele.life = 0; f.rxTele = null;
      Combat.strikeZone(f, { x: x - 150, y: -300, w: 300, h: 306 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: RX_ULT, fromX: x });
      Combat.addHazard({ kind: 'rxImpact', owner: f, side: f.side, x, life: 30 }); Cam.shake = 20; rxSfx('boom'); rxSfx('slam'); } } }), 300);
RX_ULT.id = 'rex_ult'; RX_ULT.recoverWhiff = 40;
RX_ULT.ult = { dmg: 1250, cutscene: (a, t) => csRexExtinction(a, t), fx: { el: 'fire', color: '#ff8a1a' } };

Object.assign(REX, {
  role: 'Bruiser · Hunger · Grappler', handArt: true, draw: drawRex, drawPortrait: drawRexPortrait, transformCutscene: f => csRexKing(f),
  tall: 1.05,
  gauge: { name: 'HUNGER', max: 100, color: '#8aff6a', label: f => ((f.gauge || 0) >= 100 ? '· STARVING' : (f.gauge || 0) >= 70 ? '· RAVENOUS' : '') },
  passive: ['Apex Predator', '+20% damage to anyone under half health, and he always turns to face a bleeding foe.'],
  passiveDmg: (f, t) => (t && t.hp < t.maxHp / 2 ? 1.2 : 1) * (1 + 0.25 * (f.gauge || 0) / 100),
  moves: { '5S': RX_ROAR, '6S': RX_STAMPEDE, '2S': RX_CHOMP, '4S': RX_QUAKE, 'jS': RX_FLOP },
  super: RX_SUPER, ult: RX_ULT, ultAct: 'strike',
  form: Object.assign(REX.form, { desc: 'TIMED (12s). Colossal size, super armor, huge damage. HUNGER does not starve him.', model: undefined }),
});
for (const [slot, m] of Object.entries(REX.moves)) { m.id = 'rex_' + slot; m.slot = slot; m.owner = 'rex'; if (slot === 'jS') m.air = true; }
RX_SUPER.id = 'rex_super'; RX_ROLL.id = 'rex_roll'; RX_ROLL.kind = 'super';
REX.onRoundStart = f => { f.gauge = 30; };
REX.passiveTick = f => {
  if (f.st % 12 === 0) f.gauge = Math.min(100, (f.gauge || 0) + 1);
  const H = (f.gauge || 0) / 100; if (H > 0.5) f.status.haste = Math.max(f.status.haste || 0, H >= 0.85 ? 0.05 : 0);
  if (H >= 1 && !f.form && f.state !== 'ko') f.hp = Math.max(1, f.hp - f.maxHp * 0.01 / FPS);
  const o = f.opp; if (o && o.status.bleed && !f.move && f.state === 'stand') f.facing = o.x > f.x ? 1 : -1;
};
REX.moveHook = (f, m) => {
  if (m !== RX_SUPER || f.mf < m.s) return;
  const o = f.opp; if (!o) return; const d = o.x - f.x; f.facing = d > 0 ? 1 : -1;
  if (Math.abs(d) > 110) { f.vx = f.facing * 1300; if (f.mf === m.s + m.a - 2) f.mf = m.s + m.a - 3; if (f.mf > m.s + 40) f.mf = m.s + m.a; }
};
Combat.hz.rxImpact = h => h.t < h.life;
Combat.drawHz.rxImpact = (c, h) => { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -40, 260 * (0.4 + k), `rgba(255,140,30,${0.9 * (1 - k)})`, 'rgba(0,0,0,0)'); c.restore(); };
const _rxDrawTele = Combat.drawHz.telegraph;

// ---------------- cinematics ----------------
function csRexKing(f) {
  const d = f.def;
  return {
    name: 'TYRANT KING', dur: 3.8, fx: new ParticleSystem(500),
    cues: [[0.1, () => rxSfx('slam')], [0.9, () => rxSfx('slam')], [1.7, () => rxSfx('slam')], [2.3, () => { rxSfx('roar'); rxSfx('boom'); }]],
    draw(c, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0a00'); g.addColorStop(1, '#c06020'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const shake = t < 2.3 && (t % 0.8) < 0.1 ? rand(-8, 8) : 0; c.save(); c.translate(shake, 0);
      c.fillStyle = '#2a1000'; c.fillRect(0, H - 70, W, 70);
      // a footprint in the mud at every step, and he grows
      for (let i = 0; i < 3; i++) if (t > 0.1 + i * 0.8) { c.fillStyle = '#140800'; c.beginPath(); c.ellipse(200 + i * 300, H - 40, 50, 12, 0, 0, Math.PI * 2); c.fill(); }
      const sc = lerp(1.6, 3.4, ease.out(seg(t, 0, 2.3)));
      drawCharAt(c, d, W / 2, H - 60, sc, 1, { pose: t < 2.3 ? 'walk' : 'charge', anim: t, transformed: t > 2.2 });
      c.restore();
      caption(c, 'The earth remembers me.', t, 0.2, 2, '#ffd0a0');
      flashAt(c, t, 2.3, 2.6, '#ffb060');
      titleSlam(c, 'TYRANT KING', 'BOW', t, 2.4, '#ff8a1a', 100);
    },
  };
}
function csRexExtinction(a, opp) {
  const fx = new ParticleSystem(2500), city = makeCineCity(24, 140, 360), baseY = H - 30, oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'EXTINCTION EVENT', dur: 6.8, fx,
    cues: [[0, () => rxSfx('roar')], [1.5, () => rxSfx('charge', 1)], [3.6, () => { rxSfx('boom'); rxSfx('boom', 0.3); rxSfx('slam'); }]],
    draw(c, t) {
      City.drawSky(c, t, { top: '#1a0500', mid: '#5a2000', bot: '#c06020', noMoon: true });
      if (t < 1.5) { drawCineCity(c, city, baseY, '#1a0a04'); drawCharAt(c, a.def, W * 0.3, baseY, 2.6, 1, { pose: 'taunt', anim: t }); caption(c, 'You want to know how it felt?', t, 0.1, 1.4, '#ffd0a0'); return; }
      const k = seg(t, 1.5, 3.6);
      drawCineCity(c, city, baseY, '#1a0a04', t < 3.6);
      if (t < 3.6) {
        const ax = lerp(W * 1.1, W * 0.6, k), ay = lerp(-200, baseY - 150, ease.in(k)), r = lerp(40, 180, k);
        c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 10; i++) glowCircle(c, ax + i * 30 * (1 - k * 0.4), ay - i * 20, r * (1 - i * 0.08), `rgba(255,${120 + i * 10},40,${0.35 - i * 0.03})`, 'rgba(0,0,0,0)'); c.restore();
        c.fillStyle = '#3a2010'; c.beginPath(); c.arc(ax, ay, r * 0.6, 0, Math.PI * 2); c.fill();
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.6, baseY, oppScale, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#1a0804');
        drawCharAt(c, a.def, W * 0.18, baseY, 2.4, 1, { pose: 'victory', anim: t });
        caption(c, 'LIKE THIS.', t, 2.6, 3.5, '#ffd0a0');
      } else {
        for (const b of city) b.dead = true;
        if (t < 3.8) for (let i = 0; i < 60; i++) fx.add({ x: W * 0.6 + rand(-100, 100), y: baseY - rand(0, 100), vx: rand(-1400, 1400), vy: rand(-1200, -100), life: 1.6, size: rand(6, 20), color: pick(['#3a2010', '#ff8a1a', '#ffd060', '#5a3020']), shape: 'rect', rot: rand(0, 6), vr: rand(-8, 8), g: 900 });
        fx.draw(c);
        const w2 = ease.out(seg(t, 3.6, 4.6)); c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W * 0.6, baseY, 900 * w2, `rgba(255,160,60,${0.8 * (1 - seg(t, 4.2, 6))})`, 'rgba(0,0,0,0)'); c.restore();
        flashAt(c, t, 3.6, 4.0, '#fff');
        if (t > 4.6) titleSlam(c, 'EXTINCTION EVENT', '66 MILLION YEARS LATE', t, 4.7, '#ff8a1a', 84);
      }
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('rex:')) delete PortraitCache[k]; });
