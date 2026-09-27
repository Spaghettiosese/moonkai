// ============================================================
//  MOONKAI — OMEGA, the Final Protocol (rebuilt).
//
//  GAUGE   · ANALYSIS   fills as he watches the foe fight: every hit he takes or blocks, and
//                    every Scan Beam that connects. Full: SOLUTION FOUND for 6s. He has
//                    predicted the move the foe has used on him most, and any attempt to hit
//                    him with it is intercepted and punished.
//  PASSIVE · ADAPTATION  takes 3% less from each repeat of the same move (max 30%).
//  DRONE (←I)        deploys a hovering drone that fires three bolts at the foe.
//  DELETION          ultimate: a slow orbital reticle hunts the foe, then a column of light.
//                    Blockable. Must connect.
// ============================================================
const omSfx = (n, ...a) => { try { Sfx[n] && Sfx[n](...a); } catch (e) { } };
const OMEGA = charById('omega');
const OM_PAL = { build: 'athletic', skin: '#8a8a9a', top: '#2a2a3a', topDark: '#16161f', pants: '#1a1a2a', pantsDark: '#0e0e16', boots: '#0a0a14', belt: '#ff2a2a', glove: '#3a3a4a', noFace: true, bracers: '#4a4a5a', kneepads: '#4a4a5a' };
const OM_PROT_PAL = Object.assign({}, OM_PAL, { top: '#3a0a0a', topDark: '#200404', belt: '#ff6a2a' });
const omAnalyze = (f, n) => {
  if (f.solutionT > 0) return;
  f.gauge = Math.min(100, (f.gauge || 0) + n);
  if (f.gauge >= 100) {
    const seen = f.seen || {}; let best = null, bn = 0; for (const k in seen) if (seen[k] > bn) { bn = seen[k]; best = k; }
    if (!best) return;
    f.solution = best; f.solutionT = 6 * FPS; f.gauge = 100;
    Game.popWorld(f.x, f.y - f.h - 40, 'SOLUTION: ' + best.toUpperCase(), '#ff2a2a', 22); f.say('SOLUTION FOUND.', 80); omSfx('charge', 0.6);
  }
};

function drawOmegaCannon(c, x, y, ang, glow) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.fillStyle = '#3a3a4a'; c.strokeStyle = '#0a0a10'; c.lineWidth = 1.5; c.fillRect(-6, -9, 44, 18); c.strokeRect(-6, -9, 44, 18);
  c.fillStyle = '#2a2a36'; c.fillRect(38, -6, 12, 12); c.fillStyle = '#555'; c.fillRect(4, -12, 22, 4);
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50, 0, 8 + glow * 14, `rgba(255,40,40,${0.6 + 0.4 * glow})`, 'rgba(0,0,0,0)'); c.restore();
  c.restore();
}
function drawOmega(c, v) {
  const t = v.anim || 0, X = !!v.transformed, m = v.move;
  if (X) glowCircle(c, 0, -70, 120, 'rgba(255,40,40,0.2)', 'rgba(0,0,0,0)');
  drawHumanoid(c, v, X ? OM_PROT_PAL : OM_PAL, {
    back(c, P) {
      // spine thrusters (mech wings when overclocked)
      c.fillStyle = '#2a2a36'; c.strokeStyle = '#0a0a10'; c.lineWidth = 1.3;
      for (const k of [0, 1]) { c.beginPath(); c.moveTo(P.sh[0] - 6, P.sh[1] + 4 + k * 12); c.lineTo(P.sh[0] - 22 - (X ? 26 : 0), P.sh[1] - 6 + k * 14 - (X ? 20 : 0)); c.lineTo(P.sh[0] - 18 - (X ? 22 : 0), P.sh[1] + 10 + k * 14); c.closePath(); c.fill(); c.stroke(); }
      if (X || (m && m.pose === 'dash')) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, P.sh[0] - 26, P.sh[1] + 16, 16 + Math.sin(t * 30) * 4, 'rgba(255,90,40,0.9)', 'rgba(0,0,0,0)'); c.restore(); }
    },
    chest(c, P) {
      const x = lerp(P.hip[0], P.sh[0], 0.62), y = lerp(P.hip[1], P.sh[1], 0.62);
      c.fillStyle = '#3a3a4a'; c.beginPath(); c.moveTo(x - 13, y - 12); c.lineTo(x + 13, y - 12); c.lineTo(x + 9, y + 10); c.lineTo(x - 9, y + 10); c.closePath(); c.fill();
      c.strokeStyle = '#ff2a2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 10, y + 16); c.lineTo(x + 10, y + 16); c.moveTo(x - 8, y + 22); c.lineTo(x + 8, y + 22); c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, x, y - 1, X ? 13 : 9, 'rgba(255,40,40,1)', 'rgba(0,0,0,0)'); c.restore(); circle(c, x, y - 1, 3, '#ffd0d0');
    },
    head(c, P) {
      const [hx, hy] = P.head;
      c.fillStyle = '#aab'; c.strokeStyle = '#1a1a22'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(hx - 12, hy + 8); c.lineTo(hx - 12, hy - 9); c.lineTo(hx - 4, hy - 14); c.lineTo(hx + 12, hy - 11); c.lineTo(hx + 14, hy + 2); c.lineTo(hx + 8, hy + 10); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#1a1a22'; c.fillRect(hx - 2, hy - 5, 16, 6);                                  // visor slit
      c.save(); c.globalCompositeOperation = 'lighter'; const sx = hx + 3 + Math.sin(t * 3) * 6; glowCircle(c, sx, hy - 2, 7, 'rgba(255,30,30,1)', 'rgba(0,0,0,0)'); c.restore();
      circle(c, hx + 3 + Math.sin(t * 3) * 6, hy - 2, 1.8, '#fff');
      c.strokeStyle = '#555'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx - 8, hy - 12); c.lineTo(hx - 12, hy - 24); c.stroke(); circle(c, hx - 12, hy - 24, 2, '#ff2a2a');
    },
    front(c, P) {
      const shoot = m && (m.pose === 'shoot' || m.pose === 'cast' || m.beam || m.name === 'Annihilator');
      const ang = shoot ? 0 : { dash: 0.3, hurt: 1.9, hurt_air: 2.0, victory: -1.3, intro: 0.6 }[v.pose] ?? 0.9;
      drawOmegaCannon(c, P.fE[0], P.fE[1], ang, shoot ? 1 : 0.2);
    },
  });
}
function drawOmegaPortrait(c, opts) {
  const X = !!opts.form;
  c.fillStyle = X ? '#1a0000' : '#050508'; c.fillRect(0, 0, 100, 100);
  c.strokeStyle = 'rgba(255,40,40,0.18)'; c.lineWidth = 1; for (let i = 0; i < 100; i += 6) { c.beginPath(); c.moveTo(0, i); c.lineTo(100, i); c.stroke(); }
  c.fillStyle = '#2a2a3a'; c.beginPath(); c.moveTo(4, 100); c.lineTo(18, 74); c.lineTo(82, 74); c.lineTo(96, 100); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 50, 92, 14, 'rgba(255,40,40,1)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#9a9aaa'; c.strokeStyle = '#141418'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(28, 64); c.lineTo(28, 30); c.lineTo(40, 18); c.lineTo(66, 18); c.lineTo(74, 32); c.lineTo(72, 62); c.lineTo(60, 74); c.lineTo(40, 74); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#6a6a7a'; c.fillRect(34, 62, 32, 8); c.strokeStyle = '#141418'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(36 + i * 5, 62); c.lineTo(36 + i * 5, 70); c.stroke(); }
  c.fillStyle = '#0a0a10'; c.fillRect(30, 40, 42, 10);
  c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 58, 45, X ? 18 : 12, 'rgba(255,30,30,1)', 'rgba(0,0,0,0)'); c.restore();
  c.fillStyle = '#fff'; c.fillRect(54, 44, 8, 2);
  c.strokeStyle = '#ff2a2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(30, 45); c.lineTo(72, 45); c.stroke();
  c.fillStyle = '#ff2a2a'; c.font = 'bold 7px monospace'; c.fillText(X ? 'PROTOCOL OMEGA' : 'TARGET LOCK', 6, 10);
}

// ---------------- kit ----------------
const OM_PLASMA = Mv.shot({ name: 'Plasma Shot', desc: 'Red plasma. Fast.', proj: { speed: 950, r: 12, dmg: 60, color: '#ff2a2a', limit: 2, tag: 'op' } });
const OM_DASH = Mv.rush({ name: 'Thruster Dash', desc: 'Rocket-powered strike. Passes through at the end.', speed: 1300, frames: 14, hit: { dmg: 90, kb: [500, -300] } });
const OM_SCAN = Object.assign(Mv.beam({ name: 'Scan Beam', desc: 'A targeting laser. On hit: +20 ANALYSIS.', s: 14, beam: { len: 800, width: 26, dur: 20, dmg: 16, color: '#ff2a2a' } }), { onHit: a => omAnalyze(a, 5) });
const OM_DRONE = mk({ name: 'Drone Deploy', desc: 'A hovering drone that fires three bolts at the foe, then self-destructs. One at a time.', pose: 'cast', s: 12, a: 1, r: 18, cd: 4, ai: { min: 200, max: 1500, use: 'trap' },
  ev: { 12: f => { Combat.addHazard({ kind: 'omDrone', owner: f, side: f.side, x: f.x - f.facing * 30, y: f.y - 190, life: 150, shots: 0 }); omSfx('tone', 1200, 0.1, 'square', 0.05, 600); } } });
const OM_MISSILES = Mv.shot({ name: 'Missile Rain', desc: 'Missiles downward.', proj: { speed: 700, r: 8, dmg: 30, count: 3, spread: 0.5, angle: 0.9, kind: 'missile', color: '#ff2a2a', explode: 30 } });
const OM_SUPER = Sup.beam({ name: 'Annihilator', desc: 'Chest cannon beam.', beam: { color: '#ff2a2a', dmg: 26 } });
const OM_ULT = superize(mk({ name: 'DELETION', desc: 'A slow orbital reticle hunts the foe for over a second, then a column of light falls. Blockable. Must connect.', pose: 'cast_up', s: 70, a: 10, r: 30,
  ev: { 1: f => { f.say('TARGET ACQUIRED.', 70); omSfx('charge', 0.8); const t = f.opp; f.omTele = Combat.telegraph(f, { x: t ? t.x : f.x, follow: t, track: 0.16, r: 90, life: 999, color: '#ff2a2a', column: true }); },
    70: f => {
      const x = f.omTele ? f.omTele.x : f.x; if (f.omTele) f.omTele.life = 0; f.omTele = null;
      Combat.strikeZone(f, { x: x - 90, y: -900, w: 180, h: 906 }, { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true, guard: 'mid' }, { move: OM_ULT, fromX: x });
      Combat.addHazard({ kind: 'omColumn', owner: f, side: f.side, x, life: 26 }); Cam.shake = 14; omSfx('boom');
    } } }), 300);
OM_ULT.id = 'omega_ult'; OM_ULT.recoverWhiff = 40;
OM_ULT.ult = { dmg: 1150, cutscene: (a, t) => csOmegaDeletion(a, t), fx: { el: 'tech', color: '#ff2a2a' } };

Object.assign(OMEGA, {
  role: 'Boss · Analysis · Counter-program', handArt: true, draw: drawOmega, drawPortrait: drawOmegaPortrait, transformCutscene: f => csOmegaProtocol(f),
  tall: 1.04, weaponTip: 60,
  gauge: { name: 'ANALYSIS', max: 100, color: '#ff2a2a', label: f => (f.solutionT > 0 ? '· COUNTER: ' + (f.solution || '').toUpperCase() : '') },
  passive: ['Adaptation', 'Takes 3% less damage from each repeat of the same move (max 30%).'],
  moves: { '5S': OM_PLASMA, '6S': OM_DASH, '2S': OM_SCAN, '4S': OM_DRONE, 'jS': OM_MISSILES },
  super: OM_SUPER, ult: OM_ULT, ultAct: 'strike',
  form: Object.assign(OMEGA.form, { desc: 'TIMED (10s). Overclocked: faster, stronger, super armor, and ANALYSIS fills twice as fast.', model: undefined }),
});
for (const [slot, m] of Object.entries(OMEGA.moves)) { m.id = 'omega_' + slot; m.slot = slot; m.owner = 'omega'; if (slot === 'jS') m.air = true; }
OM_SUPER.id = 'omega_super';
OMEGA.onRoundStart = f => { f.gauge = 0; f.seen = {}; f.solution = null; f.solutionT = 0; };
OMEGA.onHurt = (t) => omAnalyze(t, t.form ? 16 : 8);
OMEGA.passiveTick = f => {
  if (f.state === 'block' && f.blockstun === 1) omAnalyze(f, f.form ? 12 : 6);
  if (f.solutionT > 0 && --f.solutionT === 0) { f.gauge = 0; f.solution = null; Game.popWorld(f.x, f.y - f.h - 30, 'RECALIBRATING', '#aab', 16); }
};
OMEGA.onIncoming = (t, a, h) => {
  if (!(t.solutionT > 0) || !a || !a.move || a.move.name !== t.solution || t.state === 'ko') return undefined;
  Game.popWorld(t.x, t.y - t.h - 30, 'PREDICTED', '#ff2a2a', 22); omSfx('clang');
  Combat.resolveHit(a, t, H_({ dmg: 90, guard: 'unblock', hs: 22, kb: [600, -400], launch: true, sfx: 'h' }), { force: true, fromX: t.x });
  Combat.addHazard({ kind: 'omColumn', owner: t, side: t.side, x: a.x, life: 14, thin: true });
  return null;
};
OMEGA.drawWorldFront = (c, f) => {
  if (!(f.solutionT > 0) || !f.opp) return;
  const o = f.opp; c.save(); c.strokeStyle = 'rgba(255,40,40,0.8)'; c.lineWidth = 2; const y = o.y - o.h / 2, r = 40 + Math.sin(f.st * 0.3) * 4;
  c.beginPath(); c.arc(o.x, y, r, 0, Math.PI * 2); c.moveTo(o.x - r - 10, y); c.lineTo(o.x + r + 10, y); c.moveTo(o.x, y - r - 10); c.lineTo(o.x, y + r + 10); c.stroke(); c.restore();
};
Combat.hz.omDrone = function (h) {
  const f = h.owner; if (!f || f.state === 'ko') return false;
  h.x = lerp(h.x, f.x - f.facing * 40, 0.05); h.y = f.y - 190 + Math.sin(h.t * 0.1) * 8;
  if (h.t % 40 === 30 && h.shots < 3 && f.opp) {
    h.shots++; const o = f.opp, dx = o.x - h.x, dy = (o.y - o.h / 2) - h.y, d = Math.hypot(dx, dy) || 1;
    Combat.fireShots(f, { speed: 900, r: 8, dmg: 34, color: '#ff2a2a', life: 1.5, hs: 12, kb: [160, -60] }); const p = Combat.projectiles[Combat.projectiles.length - 1]; Object.assign(p, { x: h.x, y: h.y, vx: dx / d * 900, vy: dy / d * 900, move: null });
    omSfx('tone', 1600, 0.06, 'square', 0.04, 900);
  }
  return h.t < h.life;
};
Combat.drawHz.omDrone = function (c, h) {
  c.save(); c.translate(h.x, h.y); c.fillStyle = '#3a3a4a'; c.strokeStyle = '#0a0a10'; c.lineWidth = 1.2;
  c.beginPath(); c.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.strokeStyle = '#777'; c.beginPath(); c.moveTo(-22, -6); c.lineTo(22, -6); c.stroke();
  c.fillStyle = 'rgba(200,200,220,0.35)'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 20, -8, 8 * Math.abs(Math.sin(h.t)), 2, 0, 0, Math.PI * 2); c.fill(); }
  c.globalCompositeOperation = 'lighter'; glowCircle(c, 4, 1, 7, 'rgba(255,40,40,1)', 'rgba(0,0,0,0)'); c.restore();
};
Combat.hz.omColumn = h => h.t < h.life;
Combat.drawHz.omColumn = (c, h) => {
  const k = h.t / h.life, w = (h.thin ? 30 : 180) * (1 - k * 0.5);
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(h.x - w / 2, 0, h.x + w / 2, 0); g.addColorStop(0, 'rgba(255,40,40,0)'); g.addColorStop(0.5, `rgba(255,${200 - 120 * k},${200 - 150 * k},${1 - k})`); g.addColorStop(1, 'rgba(255,40,40,0)');
  c.fillStyle = g; c.fillRect(h.x - w / 2, -1400, w, 1410); c.restore();
};

// ---------------- cinematics ----------------
function csOmegaProtocol(f) {
  const d = f.def;
  return {
    name: 'OMEGA PROTOCOL', dur: 4, fx: new ParticleSystem(400),
    cues: [[0, () => omSfx('tone', 400, 0.3, 'square', 0.05, 200)], [1.2, () => omSfx('charge', 0.8)], [2.3, () => { omSfx('boom'); omSfx('roar'); }]],
    draw(c, t) {
      c.fillStyle = '#050000'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#ff2a2a'; c.font = 'bold 22px monospace';
      const lines = ['> THREAT ASSESSMENT ........ FAILED', '> SAFETY LIMITERS .......... OFFLINE', '> CORE OUTPUT .............. 340%', '> DIRECTIVE ................ DELETE'];
      lines.forEach((l, i) => { const k = clamp((t - i * 0.35) / 0.3, 0, 1); if (k > 0) c.fillText(l.slice(0, Math.floor(l.length * k)), 60, 90 + i * 34); });
      if (t > 1.2) { const k = ease.out(seg(t, 1.2, 2.3)); c.save(); c.globalAlpha = k; drawCharAt(c, d, W * 0.66, H - 40, 2.6, -1, { pose: t < 2.3 ? 'charge' : 'victory', anim: t, transformed: t > 2.2 }); c.restore(); }
      flashAt(c, t, 2.3, 2.6, '#ff6a6a');
      titleSlam(c, 'OMEGA PROTOCOL', 'LIMITERS OFF', t, 2.4, '#ff2a2a', 90);
    },
  };
}
function csOmegaDeletion(a, opp) {
  const fx = new ParticleSystem(1500), oppScale = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.3;
  return {
    name: 'DELETION', dur: 6.2, fx,
    cues: [[0, () => omSfx('charge', 0.8)], [1.6, () => omSfx('tone', 900, 0.4, 'square', 0.05, 1800)], [3.0, () => { omSfx('boom'); omSfx('boom', 0.3); }]],
    draw(c, t) {
      if (t < 1.6) { // orbit
        c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 80; i++) circle(c, (i * 173) % W, (i * 97) % H, 1, '#fff');
        const g = c.createRadialGradient(W / 2, H * 1.6, 100, W / 2, H * 1.6, H * 1.3); g.addColorStop(0, '#1a3a6a'); g.addColorStop(1, '#040810'); c.fillStyle = g; c.beginPath(); c.arc(W / 2, H * 1.6, H * 1.3, 0, Math.PI * 2); c.fill();
        c.save(); c.translate(W / 2, H * 0.35); c.rotate(Math.sin(t) * 0.1); c.fillStyle = '#3a3a4a'; c.fillRect(-60, -12, 120, 24); c.fillStyle = '#1a2a4a'; c.fillRect(-160, -8, 90, 16); c.fillRect(70, -8, 90, 16);
        c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, 16, 20 + t * 20, 'rgba(255,40,40,1)', 'rgba(0,0,0,0)'); c.restore();
        caption(c, 'TARGET ACQUIRED.', t, 0.1, 1.5, '#ff6a6a'); return;
      }
      City.drawSky(c, t, { top: '#0a0000', mid: '#2a0606', bot: '#4a0a0a', noMoon: true });
      c.fillStyle = '#140404'; c.fillRect(0, H - 60, W, 60);
      const lock = seg(t, 1.6, 3.0);
      const ox = W * 0.5;
      if (t < 3.0) {
        silhouette(c, o => drawCharAt(o, opp.def, ox, H - 60, oppScale, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#1a0606');
        c.strokeStyle = '#ff2a2a'; c.lineWidth = 3; const r = lerp(260, 70, ease.out(lock)); c.beginPath(); c.arc(ox, H - 200, r, 0, Math.PI * 2); c.moveTo(ox - r - 30, H - 200); c.lineTo(ox + r + 30, H - 200); c.moveTo(ox, H - 200 - r - 30); c.lineTo(ox, H - 200 + r + 30); c.stroke();
        c.fillStyle = '#ff2a2a'; c.font = 'bold 20px monospace'; c.fillText('DELETING... ' + Math.floor(lock * 100) + '%', 40, 60);
      } else {
        const k = seg(t, 3.0, 4.4), w = 260 * (1 - Math.max(0, t - 4.4) / 1.8);
        if (w > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(ox - w, 0, ox + w, 0); g.addColorStop(0, 'rgba(255,40,40,0)'); g.addColorStop(0.5, 'rgba(255,230,230,1)'); g.addColorStop(1, 'rgba(255,40,40,0)'); c.fillStyle = g; c.fillRect(ox - w, 0, w * 2, H); c.restore(); }
        if (Math.random() < 0.8) for (let i = 0; i < 6; i++) fx.add({ x: ox + rand(-200, 200), y: H - 60, vx: rand(-500, 500), vy: rand(-700, -200), life: 1, size: rand(4, 10), color: pick(['#ff2a2a', '#ffb0b0', '#300']), shape: 'rect', g: 900 });
        fx.draw(c);
        if (k < 0.5) silhouette(c, o => drawCharAt(o, opp.def, ox, H - 60, oppScale, -1, { pose: 'hurt', anim: 0, transformed: opp.transformed }), '#fff');
        flashAt(c, t, 3.0, 3.3, '#fff');
        if (t > 4.4) titleSlam(c, 'DELETION', 'TARGET NOT FOUND', t, 4.5, '#ff2a2a', 90);
      }
    },
  };
}
Object.keys(PortraitCache).forEach(k => { if (k.startsWith('omega:')) delete PortraitCache[k]; });
