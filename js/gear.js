// ============================================================
//  MOONKAI — DR. GEAR, the Mad Mechanic (rebuilt).
//
//  GAUGE   · SCRAP   his build budget. Turrets, mines and bots cost scrap; it trickles in on
//                    its own and every hit he (or his machines) lands salvages a little more.
//  PASSIVE · OVERCLOCK  every gadget he has on the field makes ALL his damage +8%.
//  SUPER · JUNK GOLEM  every gadget on the field flies together into one walking golem. The
//                    more junk it's built from, the tougher it is and the harder it hits.
//  DOOMSDAY DEVICE    ultimate: he drops a huge ticking bomb that rolls slowly after the foe.
//                    It goes off when it touches them. Blockable. Must connect.
// ============================================================
const gdSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const GEAR = charById('gear');
const GD_PAL = { skin: '#e0b090', top: '#e8e8e0', topDark: '#b8b8b0', pants: '#3a3a3a', pantsDark: '#222', boots: '#2a1a0a', belt: '#8a6a3a', glove: '#3a3a3a', noFace: true };
const gdGadgets = f => Combat.hazards.filter(h => h.owner === f && (h.kind === 'turret' || h.kind === 'mine' || h.kind === 'minion'));
const gdScrap = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };
const gdBuild = (name, desc, cost, spawn, extra = {}) => mk(Object.assign({ name, desc: desc + ` (${cost} scrap)`, pose: 'cast', s: 12, a: 1, r: 18, ai: { min: 150, max: 1200, use: 'trap' },
  ev: { 12: f => { if ((f.gauge || 0) < cost) { Game.popWorld(f.x, f.y - f.h - 30, 'NEED SCRAP', '#aab', 16); gdSfx('tone', 200, 0.1, 'square', 0.05, 150); return; } f.gauge -= cost; Combat.place(f, spawn); } } }, extra));

function drawGear(c, v) {
  if (v.transformed && GEAR.form.model && GEAR.form.model.body) return GEAR.form.model.body(c, v, GEAR.form.model);
  const t = v.anim || 0, m = v.move;
  drawHumanoid(c, v, GD_PAL, {
    back(c, P) { // lab coat tails and a backpack reactor
      c.fillStyle = '#e8e8e0'; c.strokeStyle = '#8a8a80'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(P.sh[0] - 12, P.sh[1] + 4); c.lineTo(P.hip[0] - 22, P.hip[1] + 40 + Math.sin(t * 3) * 3); c.lineTo(P.hip[0] + 6, P.hip[1] + 36); c.lineTo(P.sh[0] + 6, P.sh[1] + 6); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#5a5a60'; c.fillRect(P.sh[0] - 26, P.sh[1] + 2, 16, 30); c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, P.sh[0] - 18, P.sh[1] + 14, 9, 'rgba(255,176,32,0.9)', 'rgba(0,0,0,0)'); c.restore();
      c.strokeStyle = '#333'; c.lineWidth = 2; c.beginPath(); c.moveTo(P.sh[0] - 18, P.sh[1] + 2); c.quadraticCurveTo(P.sh[0] - 10, P.sh[1] - 20, P.sh[0] + 2, P.sh[1] + 2); c.stroke();
    },
    chest(c, P) { // pocket full of pens and a wrench
      const x = lerp(P.hip[0], P.sh[0], 0.65) + 4, y = lerp(P.hip[1], P.sh[1], 0.65);
      c.fillStyle = '#d8d8d0'; c.fillRect(x - 2, y, 9, 7); for (const [dx, col] of [[0, '#c02020'], [3, '#2060d0'], [6, '#222']]) { c.fillStyle = col; c.fillRect(x + dx - 1, y - 5, 2, 7); }
    },
    head(c, P) {
      const [hx, hy] = P.head;
      shadedHead(c, hx, hy, 11, '#e0b090');
      // explosion of white hair
      c.fillStyle = '#f4f4f0'; for (const [dx, dy, r] of [[-10, -6, 7], [-12, 2, 6], [-4, -12, 7], [4, -12, 6], [-14, -2, 5], [-8, 8, 5]]) { c.beginPath(); c.arc(hx + dx, hy + dy, r, 0, Math.PI * 2); c.fill(); }
      // giant goggles with mismatched lenses
      c.fillStyle = '#5a3a1a'; c.fillRect(hx - 4, hy - 6, 18, 3);
      for (const [dx, r, col] of [[4, 5, '#ffb020'], [11, 3.5, '#9ff']]) { c.fillStyle = '#333'; c.beginPath(); c.arc(hx + dx, hy - 2, r + 1.5, 0, Math.PI * 2); c.fill(); c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, hx + dx, hy - 2, r * 1.8, col, 'rgba(0,0,0,0)'); c.restore(); circle(c, hx + dx, hy - 2, 1.2, '#000'); }
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(hx + 1, hy + 5); c.lineTo(hx + 12, hy + 4); c.lineTo(hx + 10, hy + 8); c.lineTo(hx + 3, hy + 8); c.closePath(); c.fill();    // manic grin
      c.strokeStyle = '#6a3a1a'; c.lineWidth = 0.8; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(hx + 3 + i * 2.5, hy + 4.5); c.lineTo(hx + 3 + i * 2.5, hy + 8); c.stroke(); }
    },
    front(c, P) { // mechanical claw arm
      c.save(); c.translate(P.fH[0], P.fH[1]); c.fillStyle = '#6a6a70'; c.strokeStyle = '#222'; c.lineWidth = 1.2;
      c.fillRect(-4, -4, 10, 8); c.strokeRect(-4, -4, 10, 8);
      const open = m ? 0.5 : 0.2 + 0.1 * Math.sin(t * 5);
      for (const s of [-1, 1]) { c.save(); c.translate(6, s * 3); c.rotate(s * open); c.beginPath(); c.moveTo(0, 0); c.lineTo(12, s * 2); c.lineTo(14, s * -3); c.lineTo(4, s * -2); c.closePath(); c.fill(); c.stroke(); c.restore(); }
      c.restore();
    },
  });
}
function drawGearPortrait(c, opts) {
  const M = !!opts.form;
  c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, 100, 100);
  c.strokeStyle = 'rgba(255,176,32,0.25)'; c.lineWidth = 1; for (let i = 0; i < 100; i += 10) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 100); c.moveTo(0, i); c.lineTo(100, i); c.stroke(); }   // blueprint grid
  c.fillStyle = '#e8e8e0'; c.beginPath(); c.moveTo(6, 100); c.lineTo(22, 76); c.lineTo(78, 76); c.lineTo(94, 100); c.fill();
  c.fillStyle = '#e0b090'; c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(34, 40); c.lineTo(66, 40); c.lineTo(66, 58); c.lineTo(58, 72); c.lineTo(42, 72); c.lineTo(34, 58); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#f4f4f0'; for (const [x, y, r] of [[26, 36, 12], [36, 22, 12], [50, 16, 13], [64, 22, 12], [74, 36, 12], [20, 50, 8], [80, 50, 8]]) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#5a3a1a'; c.fillRect(30, 44, 40, 5);
  for (const [x, r, col] of [[40, 10, 'rgba(255,176,32,1)'], [61, 7, 'rgba(150,255,255,1)']]) { c.fillStyle = '#333'; c.beginPath(); c.arc(x, 50, r + 3, 0, Math.PI * 2); c.fill(); c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, x, 50, r * 1.6, col, 'rgba(0,0,0,0)'); c.restore(); circle(c, x, 50, 2.4, '#000'); }
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(38, 62); c.lineTo(64, 61); c.lineTo(60, 68); c.lineTo(42, 68); c.closePath(); c.fill();
  c.strokeStyle = '#6a3a1a'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(42 + i * 4, 61.5); c.lineTo(42 + i * 4, 68); c.stroke(); }
  if (M) { c.strokeStyle = '#8a95a4'; c.lineWidth = 6; c.strokeRect(4, 4, 92, 92); }
}

// ---------------- kit ----------------
const GD_SALVO = Mv.shot({ name: 'Rocket Salvo', desc: 'Three homing mini-missiles. Free.', proj: { speed: 560, angle: -0.5, spread: 0.5, count: 3, homing: 3, r: 7, dmg: 30, kind: 'missile', color: '#ffb020', life: 2.4, explode: 30 } });
const GD_TURRET = gdBuild('Drone Turret', 'Deploys a turret (max 2)', 30, { kind: 'turret', at: 'front', dx: 70, life: 8, hp: 160, shotDmg: 22, limit: 2 }, { cd: 3 });
const GD_MINE = gdBuild('Proximity Mine', 'Buried mine (max 3)', 15, { kind: 'mine', at: 'front', dx: 160, dmg: 100, limit: 3 }, { pose: 'crouch' });
const GD_BOT = gdBuild('Bot Swarm', 'A walking robot minion', 20, { kind: 'minion', at: 'front', dx: 40, look: 'bot', dmg: 60, hp: 80, speed: 280 }, { cd: 2 });
const GD_BOMB = Mv.shot({ name: 'Grenade Drop', desc: 'Lobbed bomb. Free.', proj: { speed: 400, angle: 0.3, g: 1200, r: 10, dmg: 70, kind: 'bomb', color: '#ffb020', explode: 90 } });
const GD_SUPER = superize(mk({ name: 'Junk Golem', desc: 'Every gadget on the field flies together into one walking golem. More junk: tougher and harder-hitting. With nothing out, it is built from scrap.', pose: 'cast_up', s: 20, a: 1, r: 20,
  ev: { 20: f => {
    const gs = gdGadgets(f); gs.forEach(h => { Game.fx.burst(h.x, -40, 10, { color: ['#888', '#ffb020'], size: 6, speed: 300, life: 0.4, shape: 'rect' }); h.life = 0; h.hp = -1; const i = Combat.hazards.indexOf(h); if (i >= 0) Combat.hazards.splice(i, 1); });
    const n = Math.max(1, gs.length + Math.floor((f.gauge || 0) / 40)); f.gauge = 0;
    Combat.addHazard({ kind: 'gdGolem', owner: f, side: f.side, x: f.x + f.facing * 90, facing: f.facing, n, hp: 150 + 90 * n, life: 9 * FPS, punchT: 0 });
    Game.popWorld(f.x, f.y - f.h - 40, 'JUNK GOLEM x' + n, '#ffb020', 24); f.say('IT\'S ALIVE!', 60); gdSfx('clang'); gdSfx('slam');
  } } }), 100);
const GD_ULT = superize(mk({ name: 'DOOMSDAY DEVICE', desc: 'Drops a huge ticking bomb that rolls slowly after the foe and goes off when it touches them. Blockable. Must connect.', pose: 'throw', s: 20, a: 10, r: 26,
  ev: { 2: f => f.say('Say cheese!', 60), 20: f => { Combat.addHazard({ kind: 'gdDoom', owner: f, side: f.side, x: f.x + f.facing * 80, life: 7 * FPS, rot: 0 }); gdSfx('clang'); } } }), 300);
GD_ULT.id = 'gear_ult'; GD_ULT.recoverWhiff = 30;
GD_ULT.ult = { dmg: 1100, cutscene: (a, t) => csGearDoomsday(a, t), fx: { el: 'tech', color: '#ffb020' } };

Object.assign(GEAR, {
  role: 'Summoner · Scrap economy · Setup', handArt: true, draw: drawGear, drawPortrait: drawGearPortrait, transformCutscene: f => csGearMech(f),
  gauge: { name: 'SCRAP', max: 100, color: '#ffb020', label: f => { const n = gdGadgets(f).length; return n ? `· OVERCLOCK x${n}` : ''; } },
  passive: ['Overclock', 'Every gadget he has on the field makes all of his damage +8%.'],
  passiveDmg: f => 1 + 0.08 * gdGadgets(f).length,
  moves: { '5S': GD_SALVO, '6S': GD_TURRET, '2S': GD_MINE, '4S': GD_BOT, 'jS': GD_BOMB },
  super: GD_SUPER, ult: GD_ULT, ultAct: 'shot',
  form: Object.assign(GEAR.form, { desc: 'Permanent. Pilots a battle mech: cannon, armor, and SCRAP flows twice as fast.' }),
});
for (const [slot, m] of Object.entries(GEAR.moves)) { m.id = 'gear_' + slot; m.slot = slot; m.owner = 'gear'; if (slot === 'jS') m.air = true; }
GD_SUPER.id = 'gear_super';
GEAR.onRoundStart = f => { f.gauge = 60; };
GEAR.onHit = (a) => gdScrap(a, 3);
GEAR.passiveTick = f => { if (f.st % (f.form ? 15 : 30) === 0) gdScrap(f, 1); if (f.ctrl === 'cpu' && (f.gauge || 0) < 15 && f.move && /Turret|Mine|Bot/.test(f.move.name)) f.move = null; };
Combat.hz.gdGolem = function (h) {
  const f = h.owner, o = f && f.opp; if (!f || f.state === 'ko' || !o) return false;
  const d = o.x - h.x; h.facing = Math.sign(d) || h.facing;
  if (Math.abs(d) > 90) h.x += h.facing * 2.4; else if (h.t - h.punchT > 50) {
    h.punchT = h.t; h.punching = 12;
    Combat.resolveHit(o, f, H_({ dmg: 45 + 15 * h.n, guard: 'mid', hs: 20, kb: [h.facing * 500, -350], launch: true, sfx: 'h' }), { proj: true, fromX: h.x });
    Cam.shake = 6; gdSfx('slam');
  }
  if (h.punching) h.punching--;
  for (const t of Combat.targets(h.side)) if (t.state === 'move' && t.move.hit && t.mf >= t.move.s && t.mf < t.move.s + t.move.a && rectsOverlap(Combat.hitRect(t, t.move.hit), { x: h.x - 40, y: -160, w: 80, h: 160 }) && !h.hitBy) { h.hp -= t.move.hit.dmg || 40; h.hitBy = 8; }
  if (h.hitBy) h.hitBy--;
  if (h.hp <= 0) { Combat.explode(h.x, -60, 90, f, 40, '#ffb020'); return false; }
  return h.t < h.life;
};
Combat.drawHz.gdGolem = (c, h) => {
  const s = 0.8 + 0.1 * Math.min(6, h.n), bob = Math.sin(h.t * 0.2) * 3; c.save(); c.translate(h.x, 0); c.scale(h.facing * s, s);
  c.fillStyle = '#6a6a70'; c.strokeStyle = '#222'; c.lineWidth = 2;
  c.fillRect(-22, -60, 16, 60); c.fillRect(6, -60, 16, 60);                                      // legs
  c.fillStyle = '#8a8a90'; c.fillRect(-36, -150 + bob, 72, 90); c.strokeRect(-36, -150 + bob, 72, 90);
  c.fillStyle = '#ffb020'; for (let i = 0; i < h.n && i < 6; i++) c.fillRect(-30 + (i % 3) * 22, -140 + Math.floor(i / 3) * 22 + bob, 16, 16);   // bolted-on junk plates
  c.fillStyle = '#5a5a60'; c.fillRect(-20, -186 + bob, 40, 36);
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 8, -170 + bob, 10, 'rgba(255,176,32,1)', 'rgba(0,0,0,0)'); c.restore();
  const reach = h.punching ? 60 : 0; c.fillStyle = '#6a6a70'; c.fillRect(30, -130 + bob, 30 + reach, 20); c.fillStyle = '#ffb020'; c.fillRect(56 + reach, -134 + bob, 20, 28);
  c.restore();
  c.fillStyle = '#300'; c.fillRect(h.x - 40, -210, 80, 5); c.fillStyle = '#ffb020'; c.fillRect(h.x - 40, -210, 80 * clamp(h.hp / (150 + 90 * h.n), 0, 1), 5);
};
Combat.hz.gdDoom = function (h) {
  const f = h.owner, o = f && f.opp; if (!f || f.state === 'ko' || !o) return false;
  const d = o.x - h.x; h.x += Math.sign(d) * 3.4; h.rot += Math.sign(d) * 0.06;
  if (h.t % 20 === 0) gdSfx('tone', h.t % 40 ? 900 : 1200, 0.04, 'square', 0.04, 900);
  if (Math.abs(d) < 60 && o.y > -120) {
    Combat.resolveHit(o, f, H_({ dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }), { proj: true, fromX: h.x, move: GD_ULT });
    Combat.explode(h.x, -50, 110, f, 0, '#ffb020'); Cam.shake = 16; return false;
  }
  if (h.t >= h.life) { Combat.explode(h.x, -50, 110, f, 0, '#ffb020'); return false; }
  return true;
};
Combat.drawHz.gdDoom = (c, h) => {
  c.save(); c.translate(h.x, -50); c.rotate(h.rot);
  c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(0, 0, 50, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#ffb020'; c.lineWidth = 3; c.stroke();
  c.fillStyle = '#ffb020'; c.beginPath(); c.moveTo(-8, -20); c.lineTo(8, -20); c.lineTo(0, 0); c.closePath(); c.fill(); c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fill();
  c.restore();
  const left = Math.ceil((h.life - h.t) / FPS); bigText(c, String(left), h.x, -120, 22, h.t % 20 < 10 ? '#ff4a2a' : '#ffb020', '#000');
};

// ---------------- cinematics ----------------
function csGearMech(f) {
  const d = f.def;
  return {
    name: 'MECH SUIT', dur: 4, fx: new ParticleSystem(500),
    cues: [[0.2, () => gdSfx('clang')], [0.7, () => gdSfx('clang')], [1.2, () => gdSfx('clang')], [2.2, () => { gdSfx('boom'); gdSfx('charge', 0.5); }]],
    draw(c, t) {
      c.fillStyle = '#141414'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,176,32,0.15)'; for (let i = 0; i < W; i += 40) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, H); c.stroke(); } for (let i = 0; i < H; i += 40) { c.beginPath(); c.moveTo(0, i); c.lineTo(W, i); c.stroke(); }
      // robot arms bolt armor onto him piece by piece
      const k = seg(t, 0.2, 2.2);
      drawCharAt(c, d, W / 2, H - 50, 2.6, 1, { pose: t < 2.2 ? 'idle' : 'victory', anim: t, transformed: t > 2.2 });
      if (t < 2.2) for (let i = 0; i < 4; i++) { const on = k * 4 > i; const x = W / 2 + (i % 2 ? 1 : -1) * (on ? 60 : 300), y = H - 300 + i * 50; c.fillStyle = '#8a95a4'; c.fillRect(x - 30, y - 16, 60, 32); c.strokeStyle = '#ffb020'; c.lineWidth = 3; c.beginPath(); c.moveTo(i % 2 ? W : 0, y - 80); c.lineTo(x, y); c.stroke(); }
      caption(c, 'Version 47. The other 46 exploded.', t, 0.2, 2, '#ffd080');
      flashAt(c, t, 2.2, 2.5, '#ffd080');
      titleSlam(c, 'MECH SUIT', 'ONLINE', t, 2.3, '#ffb020', 100);
    },
  };
}
function csGearDoomsday(a, opp) {
  const fx = new ParticleSystem(2400), city = makeCineCity(22, 150, 380), baseY = H - 30, oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'DOOMSDAY DEVICE', dur: 6.6, fx,
    cues: [[0, () => gdSfx('tone', 900, 0.05, 'square', 0.05, 900)], [0.6, () => gdSfx('tone', 900, 0.05, 'square', 0.05, 900)], [1.2, () => gdSfx('tone', 1200, 0.05, 'square', 0.05, 1200)], [3.0, () => { gdSfx('boom'); gdSfx('boom', 0.3); gdSfx('slam'); }]],
    draw(c, t) {
      City.drawSky(c, t, { top: '#0a0a14', mid: '#2a2a3a', bot: '#5a4a3a', noMoon: true });
      if (t < 3.0) {
        drawCineCity(c, city, baseY, '#141418');
        const k = seg(t, 0, 3); silhouette(c, o => drawCharAt(o, opp.def, W * 0.55, baseY, oppScale, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#1a1a20');
        c.save(); c.translate(W * 0.55, baseY - 80); c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#ffb020'; c.lineWidth = 4; c.stroke(); c.restore();
        bigText(c, (3 - Math.floor(t)) + '', W * 0.55, baseY - 80, 60, '#ff4a2a', '#000');
        drawCharAt(c, a.def, W * 0.12, baseY, 2.3, 1, { pose: 'taunt', anim: t });
        caption(c, t < 1.5 ? 'Three...' : 'Say cheese!', t, t < 1.5 ? 0.1 : 1.6, t < 1.5 ? 1.4 : 2.9, '#ffd080');
      } else {
        for (const b of city) b.dead = true;
        drawCineCity(c, city, baseY, '#141418', false);
        if (t < 3.2) for (let i = 0; i < 80; i++) fx.add({ x: W * 0.55, y: baseY - 80, vx: rand(-1600, 1600), vy: rand(-1400, 200), life: 1.8, size: rand(4, 18), color: pick(['#ffb020', '#ff4a2a', '#555', '#fff']), shape: pick(['rect', 'circle']), rot: rand(0, 6), vr: rand(-10, 10), g: 900 });
        const k = ease.out(seg(t, 3.0, 4.2)); c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, W * 0.55, baseY - 80, 1000 * k, `rgba(255,176,32,${0.9 * (1 - seg(t, 3.6, 6))})`, 'rgba(0,0,0,0)'); c.restore();
        fx.draw(c);
        // a mushroom cloud in the shape of a cog
        if (t > 3.6) { const m = seg(t, 3.6, 5); c.save(); c.globalAlpha = 0.8; c.fillStyle = '#5a4a3a'; c.fillRect(W * 0.55 - 30, baseY - 300 * m, 60, 300 * m); c.translate(W * 0.55, baseY - 300 * m); c.rotate(t); for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.fillRect(-18, -150 * m, 36, 40 * m); } c.beginPath(); c.arc(0, 0, 120 * m, 0, Math.PI * 2); c.fill(); c.restore(); }
        flashAt(c, t, 3.0, 3.3, '#fff');
        if (t > 4.6) titleSlam(c, 'DOOMSDAY DEVICE', 'PATENT PENDING', t, 4.7, '#ffb020', 84);
      }
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('gear:')) delete PortraitCache[k]; });
