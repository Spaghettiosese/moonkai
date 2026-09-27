// ============================================================
//  MOONKAI — IRON JAW, the Champ (rebuilt).
//
//  GAUGE   · MOMENTUM (5 pips)  every special that lands adds a pip (each is +6% damage). A
//                    clean SLIP adds two. At 5, HAYMAKER becomes the STAR PUNCH: it crushes
//                    guard and splats the foe on the wall. Momentum fades if he stops punching.
//  PASSIVE · IRON CHIN  takes 20% less from the first two hits of any combo.
//  SLIP (←I)         a head-slip with invincible frames. If an attack whiffs through it, he
//                    answers instantly with a free counter hook.
//  SUPER · CORNERED  he raises the guard and walks you down for 1.5s, absorbing every hit.
//                    Then he unloads: one extra punch for every hit he ate.
//  KNOCKOUT ROUND    ultimate: a slow windmill wind-up (hit him to stop it), then the hook.
// ============================================================
const ijSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const IRONJAW = charById('ironjaw');
const IJ_PAL = { build: 'athletic', skin: '#8a5a3a', top: '#8a5a3a', topDark: '#6a4028', pants: '#c02020', pantsDark: '#8a1010', boots: '#1a1a1a', belt: '#fff', glove: '#d02020', noFace: true, abs: true };
const IJ_CHAMP_PAL = Object.assign({}, IJ_PAL, { pants: '#ffd35a', pantsDark: '#c09a2a', belt: '#ffe05a' });
const ijMo = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 5); f.moIdle = 0; if (n > 0 && f.gauge === 5) Game.popWorld(f.x, f.y - f.h - 40, 'STAR PUNCH READY', '#ffd35a', 20); };

function drawIronJaw(c, v) {
  const t = v.anim || 0, C = !!v.transformed, m = v.move, star = (v.gauge || 0) >= 5;
  if (v.cornered) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 20, -90, 60, 'rgba(255,80,60,0.35)', 'rgba(0,0,0,0)'); c.restore(); }
  drawHumanoid(c, v, C ? IJ_CHAMP_PAL : IJ_PAL, {
    chest(c, P) {
      if (!C) return; // the championship belt
      c.fillStyle = '#ffd35a'; c.strokeStyle = '#8a6a1a'; c.lineWidth = 1.2; c.fillRect(P.hip[0] - 14, P.hip[1] - 6, 28, 10); c.strokeRect(P.hip[0] - 14, P.hip[1] - 6, 28, 10);
      c.beginPath(); c.ellipse(P.hip[0], P.hip[1] - 1, 8, 7, 0, 0, Math.PI * 2); c.fill(); c.stroke(); circle(c, P.hip[0], P.hip[1] - 1, 3, '#d02020');
    },
    head(c, P) {
      const [hx, hy] = P.head;
      shadedHead(c, hx, hy, 11, '#8a5a3a');
      c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(hx - 1, hy - 3, 11, Math.PI * 1.05, Math.PI * 1.9); c.fill();                  // short fade
      c.fillStyle = '#6a4028'; c.beginPath(); c.ellipse(hx + 4, hy - 4, 6, 2.5, 0, 0, Math.PI * 2); c.fill();                       // heavy brow
      c.fillStyle = '#5a2a1a'; c.beginPath(); c.ellipse(hx + 7, hy - 1, 3, 2.2, 0, 0, Math.PI * 2); c.fill();                       // swollen eye
      c.strokeStyle = '#111'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx + 3, hy - 3); c.lineTo(hx + 10, hy - 2); c.stroke();
      circle(c, hx + 7, hy - 1, 1.3, '#111');
      c.fillStyle = '#fff'; c.fillRect(hx + 3, hy + 4, 8, 3); c.fillStyle = '#2060d0'; c.fillRect(hx + 3, hy + 4, 8, 1.5);           // mouthguard
      c.strokeStyle = '#6a2020'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + 9, hy - 8); c.lineTo(hx + 11, hy - 4); c.stroke();    // cut
      c.fillStyle = 'rgba(255,255,255,0.8)'; if ((t * 3) % 1 < 0.5) circle(c, hx + 12, hy - 8, 1.2, '#eef');                         // sweat
    },
    front(c, P) {
      // big gloves on both fists, laces trailing
      for (const [p, col] of [[P.bH, '#a01818'], [P.fH, C ? '#ffd35a' : '#d02020']]) { c.fillStyle = col; c.strokeStyle = '#300'; c.lineWidth = 1.3; c.beginPath(); c.ellipse(p[0], p[1], 10, 8.5, 0, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.fillRect(p[0] - 9, p[1] + 3, 7, 2); }
      if (star && m && m.name === 'Haymaker') { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, P.fH[0], P.fH[1], 30, 'rgba(255,220,80,1)', 'rgba(0,0,0,0)'); c.restore(); bigText(c, '★', P.fH[0], P.fH[1] - 22, 18, '#ffd35a', null); }
    },
  });
}
function drawIronJawPortrait(c, opts) {
  const C = !!opts.form;
  c.fillStyle = '#1a0606'; c.fillRect(0, 0, 100, 100);
  c.strokeStyle = '#c02020'; c.lineWidth = 3; for (const y of [22, 36, 50]) { c.beginPath(); c.moveTo(0, y); c.lineTo(100, y - 6); c.stroke(); }    // ring ropes
  c.fillStyle = '#8a5a3a'; c.beginPath(); c.moveTo(0, 100); c.lineTo(10, 72); c.lineTo(90, 72); c.lineTo(100, 100); c.fill();                        // traps
  c.fillStyle = '#8a5a3a'; c.strokeStyle = '#3a2010'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(30, 36); c.lineTo(70, 36); c.lineTo(72, 58); c.lineTo(64, 76); c.lineTo(36, 76); c.lineTo(28, 58); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#1a1a1a'; c.beginPath(); c.moveTo(29, 42); c.quadraticCurveTo(30, 22, 50, 22); c.quadraticCurveTo(70, 22, 71, 42); c.lineTo(66, 34); c.lineTo(34, 34); c.closePath(); c.fill();
  c.fillStyle = '#6a4028'; c.fillRect(32, 42, 36, 6);                                                         // brow ridge
  c.fillStyle = '#5a2a1a'; c.beginPath(); c.ellipse(60, 52, 7, 5, 0, 0, Math.PI * 2); c.fill();                // swollen eye
  c.strokeStyle = '#111'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(36, 49); c.lineTo(46, 51); c.moveTo(64, 49); c.lineTo(54, 51); c.stroke();
  circle(c, 42, 53, 1.8, '#111'); circle(c, 58, 53, 1.8, '#111');
  c.strokeStyle = '#6a2020'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(66, 38); c.lineTo(69, 46); c.stroke();
  c.fillStyle = '#5a3020'; c.beginPath(); c.moveTo(47, 54); c.lineTo(53, 54); c.lineTo(55, 62); c.lineTo(45, 62); c.closePath(); c.fill();   // broken nose
  c.fillStyle = '#fff'; c.fillRect(40, 66, 20, 5); c.fillStyle = '#2060d0'; c.fillRect(40, 66, 20, 2);
  for (const [x, y] of [[10, 86], [90, 86]]) { c.fillStyle = C ? '#ffd35a' : '#d02020'; c.strokeStyle = '#300'; c.beginPath(); c.ellipse(x, y, 16, 14, 0, 0, Math.PI * 2); c.fill(); c.stroke(); }
}

// ---------------- kit ----------------
const IJ_JAB = Object.assign(Mv.rush({ name: 'Jab Rush', desc: 'Stepping jab barrage (+1 MOMENTUM on hit).', speed: 600, frames: 18, hit: { dmg: 20, multi: 4, every: 4, kb: [120, 0], launch: false } }), { onHit: a => { if (!a.ijJabbed) { a.ijJabbed = true; ijMo(a, 1); } }, onStart: f => { f.ijJabbed = false; } });
const IJ_HAY = Object.assign(Mv.rush({ name: 'Haymaker', desc: 'A huge charging hook. At 5 MOMENTUM: the STAR PUNCH (crushes guard, wall splat, spends it all).', s: 18, speed: 700, frames: 12, armor: [4, 20], hit: { dmg: 140, kb: [800, -200], wb: true } }),
  { onStart: f => { f.ijStar = (f.gauge || 0) >= 5; if (f.ijStar) { f.say('STAR PUNCH!', 50); ijSfx('charge', 0.3); } },
    onHit: (a, t) => { if (a.ijStar) { a.gauge = 0; if (t.hp > 1) t.hp = Math.max(1, t.hp - 110); t.vx = a.facing * 1400; Game.popWorld(t.x, t.y - t.h - 40, '★ STAR PUNCH ★', '#ffd35a', 28); Cam.shake = 16; ijSfx('boom'); } else ijMo(a, 1); },
    onBlock: (a, t) => { if (a.ijStar) { a.gauge = 0; t.guard = 100; Game.popWorld(t.x, t.y - t.h - 40, 'GUARD CRUSH', '#ffd35a', 24); } } });
const IJ_UPPER = Object.assign(Mv.rising({ name: 'Uppercut', desc: 'Invincible uppercut (+1 MOMENTUM).', hit: { dmg: 60, multi: 2 } }), { onHit: (a) => { if (a.mf < 20 && !a.ijUp) { a.ijUp = true; ijMo(a, 1); } }, onStart: f => { f.ijUp = false; } });
const IJ_SLIP = mk({ name: 'Slip', desc: 'Slips the head: invincible for a moment. If an attack whiffs through him he answers with a free counter hook (+2 MOMENTUM).', pose: 'block', s: 2, a: 16, r: 12, inv: [1, 16], ai: { min: 0, max: 150, use: 'counter' },
  onStart: f => { f.ijSlipped = false; } });
const IJ_COUNTER = mk({ name: 'Counter Hook', pose: 'heavy', s: 4, a: 4, r: 14, hit: { dmg: 110, box: [0, -120, 100, 90], kb: [600, -300], hs: 26, sfx: 'h' } });
const IJ_OVER = Mv.dive({ name: 'Overhand', desc: 'Leaping overhand punch.', pose: 'air_heavy', vx: 600, vy: 1000, hit: { dmg: 90 } });
const IJ_SUPER = superize(mk({ name: 'Cornered', desc: 'Guard up: walks forward absorbing every hit for 1.5s. Then unloads one extra punch for every hit he ate (max 8), finishing with a wall-splat hook.', pose: 'block', s: 4, a: 90, r: 20,
  onStart: f => { f.cornered = true; f.ijAte = 0; f.ijPhase = 0; } }), 100);
const IJ_ULT = superize(mk({ name: 'KNOCKOUT ROUND', desc: 'A slow windmill wind-up (hit him to stop it), then the championship hook. Blockable. Must connect.', pose: f => (f.mf < 50 ? 'charge' : 'heavy'), s: 50, a: 8, r: 30,
  hit: { dmg: 10, box: [0, -150, 130, 150], hs: 60, kb: [0, 0], ultConnect: true },
  ev: { 1: f => { f.say('Round twelve.', 70); ijSfx('bell'); } } }), 300);
IJ_ULT.id = 'ironjaw_ult'; IJ_ULT.recoverWhiff = 40;
IJ_ULT.ult = { dmg: 1200, cutscene: (a, t) => csIronJawKO(a, t), fx: { el: 'metal', color: '#ff3a3a' } };

Object.assign(IRONJAW, {
  role: 'Boxer · Momentum · Slip counters', handArt: true, draw: drawIronJaw, drawPortrait: drawIronJawPortrait, transformCutscene: f => csIronJawChamp(f),
  gauge: { name: 'MOMENTUM', max: 5, color: '#ffd35a', pips: true, label: f => ((f.gauge || 0) >= 5 ? '· STAR PUNCH' : '') },
  passiveDmg: f => 1 + (f.gauge || 0) * 0.06,
  moves: { '5S': IJ_JAB, '6S': IJ_HAY, '2S': IJ_UPPER, '4S': IJ_SLIP, 'jS': IJ_OVER },
  super: IJ_SUPER, ult: IJ_ULT, ultAct: 'rush',
  form: Object.assign(IRONJAW.form, { desc: 'Permanent. The belt: armor on specials, more damage, and MOMENTUM never fades.', model: undefined }),
});
for (const [slot, m] of Object.entries(IRONJAW.moves)) { m.id = 'ironjaw_' + slot; m.slot = slot; m.owner = 'ironjaw'; if (slot === 'jS') m.air = true; }
IJ_SUPER.id = 'ironjaw_super'; IJ_COUNTER.id = 'ironjaw_counter';
IRONJAW.onRoundStart = f => { f.gauge = 0; f.moIdle = 0; f.cornered = false; };
IRONJAW.onIncoming = (t, a, h) => {
  if (t.move === IJ_SLIP && t.mf <= 16 && a && a !== t) { if (!t.ijSlipped) { t.ijSlipped = true; Game.popWorld(t.x, t.y - t.h - 30, 'SLIP!', '#ffd35a', 20); ijSfx('whoosh') || ijSfx('tone', 600, 0.05, 'sine', 0.05, 300); } return null; }
  if (t.cornered && t.move === IJ_SUPER && t.mf < 94) { t.ijAte = Math.min(8, (t.ijAte || 0) + 1); Game.popWorld(t.x, t.y - t.h - 30, 'ATE IT ' + t.ijAte, '#ff8a6a', 16); ijSfx('clang'); t.hp = Math.max(1, t.hp - (h.dmg || 30) * 0.3); return 'block'; }
  return undefined;
};
IRONJAW.passiveTick = f => {
  if (!f.form && (f.gauge || 0) > 0 && ++f.moIdle > 180 && f.st % 60 === 0) f.gauge--;
  // slip answered: once the slip ends, fire the counter hook
  if (f.move === IJ_SLIP && f.ijSlipped && f.mf >= 6) { f.ijSlipped = false; f.startMove(IJ_COUNTER); ijMo(f, 2); }
};
IRONJAW.moveHook = (f, m) => {
  if (m !== IJ_SUPER) { f.cornered = false; return; }
  if (f.mf < 94) { f.vx = f.facing * 150; return; }
  if (f.mf === 94) { f.cornered = false; f.ijPunches = 3 + (f.ijAte || 0); f.say(f.ijAte ? 'MY TURN.' : 'Come on!', 50); }
  const i = f.mf - 94; if (i % 5 === 0 && f.ijPunches > 0) {
    f.ijPunches--; const last = f.ijPunches === 0; f.pose = last ? 'heavy' : (i % 10 ? 'punch' : 'punch2');
    Combat.strikeZone(f, { x: f.facing > 0 ? f.x : f.x - 130, y: f.y - 150, w: 130, h: 130 }, last ? { dmg: 90, guard: 'mid', hs: 26, kb: [900, -200], wb: true, sfx: 'h' } : { dmg: 26, guard: 'mid', hs: 10, kb: [90, 0], sfx: 'm' });
    if (last) { f.mf = m.s + m.a; Cam.shake = 10; }
  }
};
IRONJAW.drawWorldFront = (c, f) => {
  if (f.move !== IJ_ULT || f.mf >= 50) return; const k = f.mf / 50;
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,${100 + 120 * k},60,${0.3 + 0.5 * k})`; c.lineWidth = 4; c.beginPath(); c.arc(f.x, f.y - 110, 50, f.mf * 0.5, f.mf * 0.5 + 4); c.stroke(); c.restore();
};

// ---------------- cinematics ----------------
function csIronJawChamp(f) {
  const d = f.def;
  return {
    name: 'HEAVYWEIGHT CHAMP', dur: 3.8, fx: new ParticleSystem(400),
    cues: [[0, () => ijSfx('bell')], [1.4, () => ijSfx('cheer') || ijSfx('roar')], [2.2, () => ijSfx('boom')]],
    draw(c, t) {
      c.fillStyle = '#0a0404'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 12; i++) { if (Math.random() < 0.3) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, rand(0, W), rand(80, 260), 18, 'rgba(255,255,255,0.8)', 'rgba(0,0,0,0)'); c.restore(); } }   // camera flashes
      c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(W / 2, 0, W / 2, H); g.addColorStop(0, 'rgba(255,240,200,0.5)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(W / 2 - 60, 0); c.lineTo(W / 2 + 60, 0); c.lineTo(W / 2 + 260, H); c.lineTo(W / 2 - 260, H); c.fill(); c.restore();
      c.strokeStyle = '#c02020'; c.lineWidth = 6; for (const y of [H - 240, H - 180, H - 120]) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      drawCharAt(c, d, W / 2, H - 50, 2.7, 1, { pose: t < 2.2 ? 'taunt' : 'victory', anim: t, transformed: t > 2.1 });
      if (t > 1.4 && t < 2.2) { const k = ease.out(seg(t, 1.4, 2.2)); c.fillStyle = '#ffd35a'; c.fillRect(W / 2 - 120, lerp(-60, H - 250, k), 240, 40); }
      caption(c, 'Still the champ.', t, 0.2, 1.3, '#ffe0a0');
      flashAt(c, t, 2.2, 2.5, '#fff3c0');
      titleSlam(c, 'HEAVYWEIGHT CHAMP', 'UNDISPUTED', t, 2.3, '#ffd35a', 90);
    },
  };
}
function csIronJawKO(a, opp) {
  const fx = new ParticleSystem(800), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'KNOCKOUT ROUND', dur: 6.6, fx,
    cues: [[0, () => ijSfx('bell')], [0.3, () => ijSfx('bell')], [2.4, () => ijSfx('heartbeat')], [3.4, () => { ijSfx('boom'); ijSfx('slam'); }], [4.6, () => ijSfx('bell')]],
    draw(c, t) {
      c.fillStyle = '#0a0404'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#e8e0d0'; c.fillRect(0, H - 80, W, 80);
      c.strokeStyle = '#c02020'; c.lineWidth = 6; for (const y of [H - 260, H - 200, H - 140]) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      if (t < 2.4) {
        const k = seg(t, 0, 2.4); caption(c, 'Round twelve.', t, 0.2, 1.2, '#ffe0a0'); caption(c, 'Ding ding.', t, 1.3, 2.3, '#ffe0a0');
        drawCharAt(c, a.def, lerp(W * 0.2, W * 0.4, k), H - 80, 2.4, 1, { pose: 'block', anim: t });
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.7, H - 80, oppScale, -1, { pose: 'punch', anim: t, transformed: opp.transformed }), '#1a0808');
      } else if (t < 3.4) {
        // super slow-mo: the hook travels, sweat hangs in the air
        const k = seg(t, 2.4, 3.4); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 10; i++) circle(c, W * 0.55 + i * 14, H * 0.4 + Math.sin(i) * 20, 3, '#cde');
        drawCharAt(c, a.def, W * 0.42, H - 80, 2.6, 1, { pose: 'heavy', anim: k * 0.2 });
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.62, H - 80, oppScale, -1, { pose: 'idle', anim: 0, transformed: opp.transformed }), '#1a0808');
      } else {
        const k = seg(t, 3.4, 4.6);
        drawCharAt(c, a.def, W * 0.4, H - 80, 2.4, 1, { pose: t < 4.6 ? 'heavy' : 'victory', anim: t });
        silhouette(c, o => drawCharAt(o, opp.def, lerp(W * 0.62, W * 0.9, ease.out(k)), H - 80 - Math.sin(k * Math.PI) * 160, oppScale, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }), '#1a0808');
        if (t < 3.6) for (let i = 0; i < 20; i++) fx.add({ x: W * 0.62, y: H * 0.55, vx: rand(-100, 800), vy: rand(-500, 300), life: 0.8, size: rand(3, 6), color: '#cde' });
        fx.draw(c); flashAt(c, t, 3.4, 3.6, '#fff');
        if (t > 4.7) titleSlam(c, 'KNOCKOUT', 'AND STILL...', t, 4.8, '#ff3a3a', 100);
      }
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('ironjaw:')) delete PortraitCache[k]; });
