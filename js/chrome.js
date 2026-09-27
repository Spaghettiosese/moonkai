// ============================================================
//  MOONKAI — CHROME, the Iron Gunslinger (rebuilt).
//
//  GAUGE   · CYLINDER (6 pips)  real ammo. Every gun special spends bullets; an empty gun
//                    just clicks. ←I RELOAD rolls back and spins the cylinder full.
//  PASSIVE · LAST ROUND    the final bullet in the cylinder is always a crit (x1.8, bigger).
//  HIGH NOON         ultimate: he stands still while the clock ticks and the reticle settles on
//                    the foe, then one bullet. Slow. Hit him to stop it. Must connect.
// ============================================================
const chSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const CHROME = charById('chrome');
const chMax = f => (f.form ? 8 : 6);
const CH_PAL = { skin: '#b08a6a', top: '#6a4a2a', topDark: '#4a3018', pants: '#3a2a1a', pantsDark: '#2a1c10', boots: '#2a1a0a', belt: '#8a6a3a', glove: '#9aa4b0', noFace: true };
const CH_FORM_PAL = Object.assign({}, CH_PAL, { top: '#6a7584', topDark: '#4a5462' });

// spend n bullets; returns how many were actually fired (0 = click)
function chSpend(f, n) {
  const have = f.gauge || 0;
  if (have <= 0) { Game.popWorld(f.x, f.y - f.h - 30, '*click*', '#aab', 18); chSfx('tone', 1800, 0.03, 'square', 0.05, 1800); return 0; }
  const k = Math.min(n, have); f.gauge = have - k; f.lastRound = f.gauge === 0; return k;
}
function chFire(f, n, p) {
  const k = chSpend(f, n); if (!k) return;
  const crit = f.lastRound;
  Combat.fireShots(f, Object.assign({ speed: 1600, r: 6, kind: 'bullet', color: '#ffd35a', life: 1.1, hs: 12, kb: [160, -40] }, p, { count: Math.min(k, p.count || 1), dmg: Math.round(p.dmg * (crit ? 1.8 : 1)), r: crit ? 11 : (p.r || 6), color: crit ? '#ff5a2a' : '#ffd35a' }));
  if (crit) { Game.popWorld(f.x, f.y - f.h - 30, 'LAST ROUND', '#ff5a2a', 20); f.lastRound = false; }
  Game.fx.add({ x: f.x + f.facing * 60, y: f.y - 90, vx: 0, vy: 0, life: 0.12, size: 16, color: '#fff3a0', glow: true });
}
const chShot = (name, desc, n, p, extra = {}) => mk(Object.assign({ name, desc, pose: 'punch', s: extra.s || 8, a: 1, r: extra.r || 14, ev: { [extra.s || 8]: f => chFire(f, n, p) }, ai: { min: 150, max: 1200, use: 'zone' } }, extra.o || {}));

function drawChromeGun(c, x, y, ang, form) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.fillStyle = form ? '#b8c4d0' : '#9aa4b0'; c.strokeStyle = '#141414'; c.lineWidth = 1.3;
  c.fillRect(2, -5, 40, 7); c.strokeRect(2, -5, 40, 7);
  c.beginPath(); c.arc(8, 0, 8, 0, Math.PI * 2); c.fill(); c.stroke();
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; circle(c, 8 + Math.cos(a) * 4.5, Math.sin(a) * 4.5, 1.4, '#333'); }
  c.fillStyle = '#5a3a1a'; c.beginPath(); c.moveTo(-2, 2); c.lineTo(-10, 16); c.lineTo(-4, 18); c.lineTo(4, 4); c.fill();
  c.restore();
}
function drawChrome(c, v) {
  const t = v.anim || 0, F = !!v.transformed, m = v.move;
  drawHumanoid(c, v, F ? CH_FORM_PAL : CH_PAL, {
    back(c, P) { // poncho
      c.fillStyle = '#7a5a30'; c.strokeStyle = '#2a1a0a'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(P.sh[0] - 16, P.sh[1] - 2); c.lineTo(P.sh[0] + 16, P.sh[1] - 2); c.lineTo(P.sh[0] + 22, P.sh[1] + 34); c.lineTo(P.sh[0] - 26, P.sh[1] + 38 + Math.sin(t * 3) * 3); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = '#c04a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(P.sh[0] - 22, P.sh[1] + 28); c.lineTo(P.sh[0] + 20, P.sh[1] + 26); c.stroke();
    },
    chest(c, P) { // bandolier
      c.strokeStyle = '#4a3018'; c.lineWidth = 4; c.beginPath(); c.moveTo(P.sh[0] - 8, P.sh[1] + 2); c.lineTo(P.hip[0] + 10, P.hip[1] - 2); c.stroke();
      for (let i = 0; i < 5; i++) circle(c, lerp(P.sh[0] - 8, P.hip[0] + 10, 0.15 + i * 0.17), lerp(P.sh[1] + 2, P.hip[1] - 2, 0.15 + i * 0.17), 1.8, '#ffd35a');
    },
    head(c, P) {
      const [hx, hy] = P.head;
      // half the face is steel; the red eye glows
      c.fillStyle = '#9aa4b0'; c.beginPath(); c.arc(hx, hy, 11, -Math.PI / 2, Math.PI / 2); c.lineTo(hx, hy - 11); c.fill();
      c.strokeStyle = '#444'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + 2, hy - 6); c.lineTo(hx + 9, hy - 6); c.moveTo(hx + 2, hy + 5); c.lineTo(hx + 8, hy + 5); c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + 6, hy - 2, F ? 8 : 5, 'rgba(255,50,40,1)', 'rgba(0,0,0,0)'); c.restore(); circle(c, hx + 6, hy - 2, 1.6, '#fff');
      c.fillStyle = '#2a1a0a'; c.fillRect(hx - 6, hy + 5, 10, 3);                                         // stubble / jaw
      // cowboy hat low over the eyes
      c.fillStyle = '#5a3a1a'; c.strokeStyle = '#1a0e04'; c.lineWidth = 1.3;
      c.beginPath(); c.ellipse(hx + 1, hy - 8, 20, 4, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(hx - 9, hy - 8); c.lineTo(hx - 8, hy - 20); c.quadraticCurveTo(hx + 1, hy - 16, hx + 10, hy - 20); c.lineTo(hx + 11, hy - 8); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#c04a2a'; c.fillRect(hx - 9, hy - 11, 20, 2.5);
    },
    front(c, P) {
      const aim = m && (m.pose === 'punch' || m.name === 'Fan the Hammer' || m.name === 'HIGH NOON');
      drawChromeGun(c, P.fH[0], P.fH[1], aim ? 0 : ({ victory: -1.3, intro: -0.6, dash: 0.4 }[v.pose] ?? 1.1), F);
      drawChromeGun(c, P.bH[0], P.bH[1], aim ? 0.05 : 1.2, F);
    },
  });
}
function drawChromePortrait(c, opts) {
  const F = !!opts.form;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, '#e08030'); g.addColorStop(0.6, '#6a3000'); g.addColorStop(1, '#200a00'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
  c.fillStyle = '#7a5a30'; c.beginPath(); c.moveTo(0, 100); c.lineTo(18, 74); c.lineTo(82, 74); c.lineTo(100, 100); c.fill();
  c.fillStyle = '#b08a6a'; c.strokeStyle = '#3a2a1a'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(34, 38); c.lineTo(66, 38); c.lineTo(66, 58); c.lineTo(58, 72); c.lineTo(42, 72); c.lineTo(34, 58); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = F ? '#b8c4d0' : '#9aa4b0'; c.beginPath(); c.moveTo(50, 38); c.lineTo(66, 38); c.lineTo(66, 58); c.lineTo(58, 72); c.lineTo(50, 72); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#555'; c.lineWidth = 1; for (const y of [46, 60, 66]) { c.beginPath(); c.moveTo(51, y); c.lineTo(64, y); c.stroke(); }
  c.fillStyle = '#2a1a0a'; c.fillRect(38, 64, 12, 4);
  c.strokeStyle = '#1a0e04'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(38, 50); c.lineTo(46, 51); c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(39, 52); c.lineTo(46, 52); c.lineTo(44, 54); c.fill(); circle(c, 43, 53, 1.3, '#3a1a0a');
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 58, 52, F ? 13 : 9, 'rgba(255,50,40,1)', 'rgba(0,0,0,0)'); c.restore(); circle(c, 58, 52, 2, '#fff');
  c.strokeStyle = '#8a6a5a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(40, 56); c.lineTo(44, 66); c.stroke();
  // hat shadow over the eyes
  c.fillStyle = '#5a3a1a'; c.strokeStyle = '#1a0e04'; c.beginPath(); c.ellipse(50, 40, 44, 7, -0.05, 0, Math.PI * 2); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(30, 40); c.lineTo(32, 14); c.quadraticCurveTo(50, 22, 68, 14); c.lineTo(70, 40); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#c04a2a'; c.fillRect(31, 33, 38, 4);
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(34, 42, 32, 5);
  drawChromeGun(c, 70, 92, -0.5, F);
}

// ---------------- kit ----------------
const CH_QUICK = chShot('Quick Shot', 'Two fast bullets (2 rounds).', 2, { dmg: 32, count: 2, spread: 0.04, speed: 1700 });
const CH_RICO = chShot('Ricochet', 'A bullet that skips off the ground and comes up under the foe (1 round).', 1, { dmg: 52, angle: 0.3, g: -600, speed: 1250 }, { s: 10 });
const CH_LOW = chShot('Low Blow', 'Low bullet (1 round).', 1, { dmg: 44, offY: 50, guard: 'low', speed: 1500 });
const CH_RELOAD = mk({ name: 'Reload', desc: 'Rolls back and spins the cylinder full. Invulnerable during the roll.', pose: 'dash', s: 4, a: 10, r: 14, vel: [[1, 12, -700, null]], inv: [1, 12], ai: { min: 0, max: 400, use: 'escape' },
  ev: { 14: f => { f.gauge = chMax(f); f.lastRound = false; Game.popWorld(f.x, f.y - f.h - 30, 'RELOADED', '#ffd35a', 18); chSfx('tone', 900, 0.05, 'square', 0.05, 1400); } } });
const CH_AIR = chShot('Air Barrage', 'Bullets downward (up to 3 rounds).', 3, { dmg: 26, count: 3, spread: 0.4, angle: 0.7, speed: 1400 });
const CH_SUPER = superize(mk({ name: 'Fan the Hammer', desc: 'Empties the cylinder in a blur, one bullet per round loaded (at least 6), then reloads.', pose: 'punch', s: 6, a: 36, r: 16,
  onStart: f => { f.fanLeft = Math.max(6, f.gauge || 0); },
  ev: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [6 + i * 3, f => { if (f.fanLeft-- > 0) { Combat.fireShots(f, { speed: 1700, r: 6, dmg: 24, kind: 'bullet', color: '#ffd35a', life: 1, hs: 10, kb: [120, -30], angle: rand(-0.06, 0.06) }); } if (i === 11) f.gauge = chMax(f); }])) }), 100);
const CH_ULT = superize(mk({ name: 'HIGH NOON', desc: 'The clock ticks while he stands and aims: a reticle settles on the foe, then one bullet. Hit him to stop it. Must connect.', pose: 'punch', s: 66, a: 6, r: 30,
  ev: { 1: f => { f.say("It's high noon.", 80); chSfx('bell'); f.noonT = 0; },
    66: f => { Combat.fireShots(f, { speed: 2600, r: 14, dmg: 10, kind: 'bullet', color: '#ff5a2a', prio: 3, ultConnect: true, hs: 60, kb: [0, 0], life: 1.2 }); chSfx('boom'); Cam.shake = 8; } } }), 300);
CH_ULT.id = 'chrome_ult'; CH_ULT.recoverWhiff = 40;
CH_ULT.ult = { dmg: 1150, cutscene: (a, t) => csChromeNoon(a, t), fx: { el: 'bullet', color: '#ffd35a' } };

Object.assign(CHROME, {
  role: 'Zoner · Ammo · Gunslinger', handArt: true, draw: drawChrome, drawPortrait: drawChromePortrait, transformCutscene: f => csChromeOverclock(f), model: Object.assign({}, CHROME.model, { weapon: undefined }),
  gauge: { name: 'CYLINDER', max: 6, color: '#ffd35a', pips: true, label: f => ((f.gauge || 0) === 1 ? '· LAST ROUND' : (f.gauge || 0) === 0 ? '· EMPTY' : '') },
  passive: ['Last Round', 'The final bullet in the cylinder is always a crit: x1.8 damage, bigger and red.'],
  passiveDmg: () => 1,
  moves: { '5S': CH_QUICK, '6S': CH_RICO, '2S': CH_LOW, '4S': CH_RELOAD, 'jS': CH_AIR },
  super: CH_SUPER, ult: CH_ULT, ultAct: 'shot',
  form: Object.assign(CHROME.form, { desc: 'Permanent. Eight-shot cylinder, faster bullets, armor, and he reloads one round every second on his own.', model: undefined, onStart: f => { f.gauge = 8; } }),
});
delete CHROME.onHit;
for (const [slot, m] of Object.entries(CHROME.moves)) { m.id = 'chrome_' + slot; m.slot = slot; m.owner = 'chrome'; if (slot === 'jS') m.air = true; }
CH_SUPER.id = 'chrome_super';
CHROME.gauge.max = 6;
CHROME.onRoundStart = f => { f.gauge = chMax(f); f.lastRound = false; };
CHROME.passiveTick = f => {
  if (f.form && f.st % 60 === 0 && (f.gauge || 0) < 8) f.gauge++;
  // the gauge shows 8 pips in form
  CHROME.gauge.max = f.form ? 8 : 6;
  // CPU reloads when dry
  if (f.ctrl === 'cpu' && !f.move && (f.gauge || 0) === 0 && f.state === 'stand' && Math.random() < 0.05) f.startMove(CH_RELOAD);
};
CHROME.drawWorldFront = (c, f) => {
  if (f.move !== CH_ULT || f.mf >= 66 || !f.opp) return;
  const o = f.opp, k = f.mf / 66, y = o.y - o.h / 2, r = lerp(130, 22, k);
  c.save(); c.strokeStyle = `rgba(255,${200 - 150 * k},60,0.9)`; c.lineWidth = 2;
  c.beginPath(); c.arc(o.x, y, r, 0, Math.PI * 2); c.moveTo(o.x - r - 14, y); c.lineTo(o.x + r + 14, y); c.moveTo(o.x, y - r - 14); c.lineTo(o.x, y + r + 14); c.stroke();
  // the clock face above him
  const cx = f.x, cy = f.y - f.h - 70; c.fillStyle = 'rgba(20,10,0,0.7)'; c.beginPath(); c.arc(cx, cy, 20, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#ffd35a'; c.stroke();
  c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(k * Math.PI * 2) * 16, cy - Math.cos(k * Math.PI * 2) * 16); c.stroke(); c.restore();
  if (f.mf % 11 === 0) chSfx('tone', 1400, 0.03, 'triangle', 0.05, 1400);
};

// ---------------- cinematics ----------------
function csChromeOverclock(f) {
  const d = f.def;
  return {
    name: 'OVERCLOCKED CHASSIS', dur: 3.8, fx: new ParticleSystem(400),
    cues: [[0.2, () => chSfx('clang')], [1.1, () => chSfx('clang')], [2.2, () => { chSfx('boom'); chSfx('charge', 0.5); }]],
    draw(c, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1000'); g.addColorStop(1, '#a04a10'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = '#3a1a08'; c.fillRect(0, H - 80, W, 80);
      // cylinder spinning in close-up
      const k = seg(t, 0, 2.2); c.save(); c.translate(W * 0.28, H * 0.45); c.rotate(ease.out(k) * 14);
      c.fillStyle = '#9aa4b0'; c.strokeStyle = '#111'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 130, 0, Math.PI * 2); c.fill(); c.stroke();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.fillStyle = i < Math.floor(k * 9) ? '#ffd35a' : '#222'; c.beginPath(); c.arc(Math.cos(a) * 80, Math.sin(a) * 80, 24, 0, Math.PI * 2); c.fill(); }
      c.restore();
      drawCharAt(c, d, W * 0.7, H - 70, 2.6, -1, { pose: t < 2.2 ? 'idle' : 'victory', anim: t, transformed: t > 2.1 });
      caption(c, 'Eight in the wheel. One for each of you.', t, 0.1, 2, '#ffd9a0');
      flashAt(c, t, 2.2, 2.5, '#fff3c0');
      titleSlam(c, 'OVERCLOCKED', 'EIGHT CHAMBERS', t, 2.3, '#ffd35a', 90);
    },
  };
}
function csChromeNoon(a, opp) {
  const fx = new ParticleSystem(800), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'HIGH NOON', dur: 6.4, fx,
    cues: [[0, () => chSfx('bell')], [1.6, () => chSfx('bell')], [3.2, () => chSfx('boom')], [3.5, () => chSfx('boom')], [3.8, () => chSfx('boom')], [4.1, () => { chSfx('boom'); chSfx('slam'); }]],
    draw(c, t) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f0a050'); g.addColorStop(0.6, '#c05a1a'); g.addColorStop(1, '#3a1a00'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2, H * 0.3, 120, 'rgba(255,240,180,0.8)', 'rgba(0,0,0,0)'); c.restore();
      c.fillStyle = '#5a2a08'; c.fillRect(0, H - 90, W, 90);
      if (t < 3.2) {
        // the standoff: close-ups of the eye and the hand
        const k = seg(t, 0, 3.2);
        drawCharAt(c, a.def, W * 0.18, H - 80, 2.4, 1, { pose: 'idle', anim: 0 });
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.82, H - 80, oppScale, -1, { pose: 'idle', anim: 0, transformed: opp.transformed }), '#2a1000');
        if (Math.random() < 0.3) fx.add({ x: -20, y: H - rand(90, 200), vx: rand(200, 400), vy: 0, life: 3, size: rand(10, 18), color: '#8a5a2a', shape: 'rect', rot: rand(0, 6), vr: 3 });
        fx.draw(c);
        c.fillStyle = '#000'; c.fillRect(0, 0, W, 60 * ease.out(k)); c.fillRect(0, H - 60 * ease.out(k), W, 60);
        caption(c, "It's high noon.", t, 0.2, 1.5, '#ffe0a0'); caption(c, 'Draw.', t, 1.8, 3.1, '#ffe0a0');
      } else {
        // six shots, six flashes, all at once
        drawCharAt(c, a.def, W * 0.2, H - 80, 2.4, 1, { pose: 'punch', anim: t });
        silhouette(c, o => drawCharAt(o, opp.def, W * 0.8, H - 80, oppScale, -1, { pose: 'hurt', anim: t, transformed: opp.transformed }), '#1a0800');
        const n = Math.min(6, Math.floor((t - 3.2) / 0.15) + 1);
        c.strokeStyle = 'rgba(255,230,150,0.9)'; c.lineWidth = 3;
        for (let i = 0; i < n; i++) { c.beginPath(); c.moveTo(W * 0.26, H - 200); c.lineTo(W * 0.8 + ((i * 37) % 60) - 30, H - 260 + i * 30); c.stroke(); }
        flashAt(c, t, 3.2, 3.35, '#fff'); flashAt(c, t, 4.1, 4.4, '#fff3c0');
        if (t > 4.5) titleSlam(c, 'HIGH NOON', 'SIX FOR SIX', t, 4.6, '#ffd35a', 90);
      }
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('chrome:')) delete PortraitCache[k]; });
