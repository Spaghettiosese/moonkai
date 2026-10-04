// ============================================================
//  MOONKAI — LEO, the Beast King. Rework + pixel remake.
//
//  ROAR OF THE PRIDE (5S)  a roar that stuns, shoves, and fires the pride up: +power for 3s.
//  SUN-CHASER POUNCE (6S)  a high leaping pounce.      CALL THE PRIDE (4S)  TWO lionesses charge in.
//  PRIDE LORD (awakening)  golden mane, and a new moveset: Sovereign Roar (erases projectiles), Royal Charge
//                          (armored), Savannah Fury (10-claw flurry), Pride Stampede (three lionesses), Crown Dive.
//  KING'S ROAR / THE PRIDE ASCENDS  two ultimates, each with its own cinematic.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('leo');
  Object.assign(Sfx, {
    leoRoar(d = 0, dur = 1.7) { this.voice({ f: 160, to: 62, dur, vol: .34, type: 'sawtooth', lp: 1000, n: 4, det: 32, delay: d, wet: .5 }); this.voice({ f: 88, to: 46, dur, vol: .3, type: 'square', lp: 420, delay: d }); this.nsweep({ f0: 260, f1: 1900, dur: dur * .6, vol: .18, q: 1.4, delay: d, wet: .3 }); this.sub({ f: 70, to: 26, dur: dur * .6, vol: .42, delay: d + .05 }); },
    leoGrowl(d = 0) { this.voice({ f: 70, to: 52, dur: .7, vol: .26, type: 'sawtooth', lp: 380, n: 3, det: 24, delay: d, wet: .2 }); this.nsweep({ f0: 200, f1: 500, dur: .6, vol: .1, delay: d }); },
    leoPounce(d = 0) { this.nsweep({ f0: 400, f1: 2600, dur: .22, vol: .22, delay: d }); this.voice({ f: 110, to: 60, dur: .3, vol: .22, type: 'sawtooth', lp: 600, delay: d }); },
    leoClaw(d = 0) { this.nsweep({ f0: 2400, f1: 7000, dur: .1, vol: .26, type: 'bandpass', q: 2, delay: d }); this.fm({ f: 1300, ratio: 4.3, index: 220, dur: .16, vol: .1, delay: d, wet: .2 }); },
    leoHerd(d = 0, dur = 2.4) { this.rumble(dur, .34, d); for (let i = 0; i < 9; i++) this.sub({ f: 80 + (i % 3) * 14, to: 32, dur: .22, vol: .26, delay: d + i * (dur / 9) }); },
    leoCrown(d = 0) { this.chord({ notes: [262, 330, 392, 523], dur: 2.2, vol: .26, type: 'sawtooth', lp: 1500, delay: d, wet: .8, det: 12 }); this.run({ notes: [784, 988, 1175, 1568], step: .1, dur: .8, bell: true, delay: d + .2, wet: .8 }); },
  });
  // ---- pixel body ----
  PxModel.install(def, { extra: { front(g, P, s, m) { /* claws read in the sprite; extra rake lines on attacks */ if (s.atk) { const [hx, hy] = P.fH; for (let k = -1; k <= 1; k++) g.line([[hx + 8, hy + k * 5], [hx + 22, hy + k * 8 - 2]], '#ffffff', 1.4); } } } });
  PxModel.portrait(def);

  // ---- hazards ----
  Combat.hz.leoRoar = h => h.t < h.life;
  Combat.drawHz.leoRoar = (c, h) => { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const r = 30 + k * 330 - i * 44; if (r <= 0) continue; c.strokeStyle = `rgba(255,${180 + i * 12},${60 + i * 20},${(1 - k) * (1 - i * .15)})`; c.lineWidth = 8 - i; c.beginPath(); c.arc(h.x + h.dir * 40, -96, r, h.dir > 0 ? -1 : Math.PI - 1, h.dir > 0 ? 1 : Math.PI + 1); c.stroke(); } for (let i = 0; i < 16; i++) { const d = 40 + k * 320 * (.3 + (i % 6) * .14); c.fillStyle = i % 2 ? `rgba(255,214,120,${1 - k})` : `rgba(255,255,255,${1 - k})`; c.fillRect(Math.round((h.x + h.dir * d) / 4) * 4, Math.round((-96 + Math.sin(i * 1.9) * 70) / 4) * 4, 8, 8); } c.restore(); };
  Combat.hz.leoStampede = h => h.t < h.life;
  Combat.drawHz.leoStampede = (c, h) => { const k = h.t / h.life, front = h.x + h.dir * 1100 * ease.out(k); c.save(); c.globalAlpha = Math.min(1, 2 * (1 - k)); for (let i = 0; i < 12; i++) { const bx = front - h.dir * (i * 54 % 300), by = -(i % 3) * 22; if ((bx - h.x) * h.dir < 0) continue; PxKit.beast(c, bx, by, .9, h.t / 60, h.dir, '#e0a23a', '#ffd35a'); } c.globalCompositeOperation = 'lighter'; glowCircle(c, front, -60, 150, 'rgba(255,200,80,0.35)', 'rgba(0,0,0,0)'); c.restore(); };

  // ---- base kit rework ----
  PxKit.setMove(def, '5S', Mv.custom({ name: 'Roar of the Pride', desc: 'A roar that stuns and shoves, and rouses the pride: +power for 3s.', pose: 'charge', s: 16, a: 10, r: 22, hit: { dmg: 42, box: [0, -150, 230, 150], stun: 0.6, kb: [520, 0], hs: 14 }, ai: { min: 0, max: 200, use: 'combo' },
    ev: { 2: () => sfx('leoGrowl'), 16: f => { sfx('leoRoar'); Combat.addHazard({ kind: 'leoRoar', owner: f, side: f.side, x: f.x, dir: f.facing, life: 28 }); Combat.buff(f, { power: 1 }, 3, 'ROAR'); Cam.shake = Math.max(Cam.shake, 8); } } }));
  PxKit.setMove(def, '6S', Mv.rush({ name: 'Sun-Chaser Pounce', desc: 'A high leaping pounce that comes down claws first.', vy: -560, speed: 1150, frames: 20, hit: { dmg: 98, kb: [420, -420] }, ev: { 1: () => sfx('leoPounce') } }));
  PxKit.setMove(def, '4S', Mv.place({ name: 'Call the Pride', desc: 'Two lionesses charge in from either side of him.', spawn: { kind: 'minion', at: 'front', dx: 120, look: 'lion', dmg: 70, hp: 90, speed: 470, count: 2, spacing: 110 }, cd: 5, ev: { 4: () => sfx('leoRoar', 0, .9) } }));

  // ---- PRIDE LORD moveset ----
  const F5 = Mv.custom({ name: 'Sovereign Roar', desc: 'Pride Lord: a roar that erases every projectile in front of him, stuns, and throws the foe back across the lane.', pose: 'charge', s: 14, a: 12, r: 24, hit: { dmg: 70, box: [0, -170, 360, 170], stun: 0.9, kb: [760, -120], hs: 20 }, ai: { min: 0, max: 360, use: 'combo' },
    ev: { 2: () => sfx('leoGrowl'), 14: f => { sfx('leoRoar', 0, 2); Combat.addHazard({ kind: 'leoRoar', owner: f, side: f.side, x: f.x, dir: f.facing, life: 34 }); for (const p of Combat.projectiles) if (p.side !== f.side && (p.x - f.x) * f.facing > 0 && Math.abs(p.x - f.x) < 560) p.life = 0; Cam.shake = Math.max(Cam.shake, 14); } } });
  const F6 = Mv.rush({ name: 'Royal Charge', desc: 'Pride Lord: an armored shoulder charge that no light attack can stop.', speed: 1400, frames: 20, armor: [1, 22], hit: { dmg: 112, kb: [560, -300], wb: true }, ev: { 1: () => sfx('leoPounce') } });
  const F2 = Mv.flurry({ name: 'Savannah Fury', desc: 'Pride Lord: ten claws in a row, each one drawing blood.', hits: 10, every: 3, hit: { dmg: 16, status: { bleed: 2 } }, finisher: { dmg: 74, kb: [720, -460], launch: true }, ev: { 3: () => sfx('leoClaw'), 12: () => sfx('leoClaw'), 21: () => sfx('leoClaw') } });
  const F4 = Mv.place({ name: 'Pride Stampede', desc: 'Pride Lord: three lionesses and a young male charge in, one after another.', spawn: { kind: 'minion', at: 'front', dx: 60, look: 'lion', dmg: 74, hp: 110, speed: 520, count: 4, spacing: 70, stagger: 8 }, cd: 7, ev: { 4: () => sfx('leoHerd', 0, 1.4) } });
  const FJ = Mv.dive({ name: 'Crown Dive', desc: 'Pride Lord: a diving claw that bounces the foe off the ground.', vx: 600, vy: 1500, hit: { dmg: 104, gb: true } });
  const FU = PxKit.ult({ id: 'leo_fult', name: 'THE PRIDE ASCENDS', desc: 'Pride Lord: the sun itself roars. A stampede of golden lions pours across the stage. Blockable. Must connect.', pose: 'charge', s: 50, dmg: 1260, color: '#ffb02a', cutscene: (a, t) => csLeoAscend(a, t) });
  FU.ev = PxKit.zoneEv(FU, { at: 50, w: 900, h: 330, start: f => { f.say('Rise, my pride!', 90); sfx('leoCrown'); sfx('riser', 1.6, .22, 0, 80, 800); }, fire: f => { Combat.addHazard({ kind: 'leoStampede', owner: f, side: f.side, x: f.x, dir: f.facing, life: 56 }); Cam.shake = 16; sfx('leoHerd', 0, 1.4); sfx('leoRoar'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Golden mane, more damage and speed. New moveset: Sovereign Roar, Royal Charge, Savannah Fury, Pride Stampede, Crown Dive, and the ultimate THE PRIDE ASCENDS.' });

  // ---- KING'S ROAR (base ult) ----
  const U = PxKit.ult({ id: 'leo_ult', name: "KING'S ROAR", desc: 'A roar that cracks the sky and calls the whole pride from the horizon. Blockable. Must connect.', pose: 'charge', s: 44, dmg: 1150, color: '#ffb02a', cutscene: (a, t) => csLeoRoar(a, t) });
  U.ev = PxKit.zoneEv(U, { at: 44, w: 760, h: 320, start: f => { f.say('HEAR ME ROAR!', 80); sfx('riser', 1.4, .2, 0, 80, 700); }, fire: f => { Combat.addHazard({ kind: 'leoRoar', owner: f, side: f.side, x: f.x, dir: f.facing, life: 40 }); Cam.shake = 16; sfx('leoRoar', 0, 2.2); } });
  PxKit.setUlt(def, U); def.ultAct = 'rush';
  def.transformCutscene = f => csLeoPride(f);

  // ---- cinematics ----
  const savanna = (x, t, k, sunY) => {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${lerp(20, 255, k) | 0},${lerp(10, 150, k) | 0},${lerp(40, 40, k) | 0})`); g.addColorStop(1, `rgb(${lerp(60, 255, k) | 0},${lerp(30, 200, k) | 0},${lerp(30, 90, k) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = `rgba(255,${lerp(180, 240, k) | 0},${lerp(60, 160, k) | 0},1)`; x.beginPath(); x.arc(W * .5, sunY, 150, 0, 7); x.fill();
    x.fillStyle = 'rgba(40,16,8,0.9)'; x.fillRect(0, H - 130, W, 130); for (let i = 0; i < 5; i++) { const ax = 140 + i * 280; x.fillRect(ax - 5, H - 220 - (i % 2) * 24, 10, 100); x.beginPath(); x.ellipse(ax, H - 226 - (i % 2) * 24, 78, 20, 0, 0, 7); x.fill(); }
  };
  function csLeoPride(f) {
    const fx = new ParticleSystem(900), A = PxKit.actor(f.def);
    return { name: 'PRIDE LORD', dur: 6.0, fx,
      cues: [[0, () => sfx('leoGrowl')], [1.6, () => sfx('riser', 1.0, .22, 0, 80, 500)], [2.6, () => { sfx('leoRoar', 0, 2.2); sfx('leoCrown'); }], [3.4, () => sfx('leoHerd', 0, 1.6)]],
      draw(c, t) {
        const dusk = ease.inOut(seg(t, 0, 2.4)), roar = t - 2.6, golden = t > 2.6;
        PxKit.scene(c, x => savanna(x, t, dusk, H * .5 - 40 * dusk), .3);
        // the pride answers from the horizon
        if (t > 3.4) PxKit.scene(c, x => { for (let i = 0; i < 9; i++) { const k = ease.out(seg(t, 3.4 + i * .1, 4.2 + i * .1)); x.globalAlpha = k; PxKit.beast(x, 120 + i * 130, H - 128, .8, t + i, i % 2 ? 1 : -1, '#2a1208', null); } }, .3);
        // the rock he stands on
        PxKit.scene(c, x => { x.fillStyle = '#3a1a0c'; x.beginPath(); x.moveTo(W * .3, H); x.lineTo(W * .36, H - 200); x.lineTo(W * .5, H - 250); x.lineTo(W * .66, H - 200); x.lineTo(W * .72, H); x.fill(); }, .3);
        const sh = roar > 0 && roar < .8 ? rand(-5, 5) * (1 - roar / .8) : 0; c.save(); c.translate(sh, sh);
        A(c, W * .5, H - 246, 2.9 + (golden ? .2 : 0), t, t < 1.6 ? 'idle' : roar < 0 ? 'cast_up' : 'charge', { transformed: golden });
        c.restore();
        if (roar > 0 && roar < 1.4) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const r = roar * 700 - i * 90; if (r > 0) { c.strokeStyle = `rgba(255,${200 + i * 8},120,${.7 * (1 - roar / 1.4)})`; c.lineWidth = 10 - i; c.beginPath(); c.arc(W * .5 + 60, H - 246 - 230, r, 0, 7); c.stroke(); } } c.restore(); }
        for (let i = 0; i < 3 && golden; i++) fx.add({ x: W * .5 + rand(-70, 70), y: H - 246 - rand(100, 330), vx: rand(-60, 60), vy: rand(-240, -60), life: 1, size: rand(4, 9), color: pick(['#ffd35a', '#fff', '#ffb02a']), glow: true });
        fx.draw(c);
        caption(c, 'A king does not ask twice.', t, .3, 2.5, '#ffe9b0'); flashAt(c, t, 2.6, 3.0, '#fff0c0');
        titleSlam(c, 'PRIDE LORD', 'HEAR THE ROAR OF THE CROWN', t, 3.9, '#ffb02a', 118);
      } };
  }
  function csLeoRoar(a, opp) {
    const fx = new ParticleSystem(1200), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: "KING'S ROAR", dur: 7.4, fx,
      cues: [[0, () => sfx('leoGrowl')], [1.3, () => sfx('riser', 1.2, .22, 0, 80, 600)], [2.4, () => sfx('leoRoar', 0, 2.4)], [3.6, () => sfx('leoHerd', 0, 2)], [5.2, () => { sfx('boom'); sfx('leoClaw'); }]],
      draw(c, t) {
        const roar = t - 2.4, crack = seg(t, 2.6, 3.6), charge = seg(t, 3.4, 5.2), gy = H - 70;
        PxKit.scene(c, x => { savanna(x, t, .8, H * .55); x.fillStyle = '#2a1008'; x.fillRect(0, gy, W, H - gy);
          if (crack > 0) { x.strokeStyle = '#fff0c0'; x.lineWidth = 8; for (let i = 0; i < 9; i++) { const a2 = i * .7 + 1, L = 600 * crack; x.beginPath(); x.moveTo(W * .5, H * .35); let px_ = W * .5, py = H * .35; for (let j = 1; j <= 6; j++) { px_ += Math.cos(a2 + Math.sin(j * 3 + i) * .4) * L / 6; py += Math.sin(a2 + Math.sin(j * 3 + i) * .4) * L / 6; x.lineTo(px_, py); } x.stroke(); } }
          // the pride charges in from both horizons
          for (let i = 0; i < 18; i++) { const side = i % 2 ? 1 : -1, k = ease.in(charge), bx = side > 0 ? lerp(W + 100 + i * 40, W * .55, k) : lerp(-100 - i * 40, W * .45, k); if (charge > 0) PxKit.beast(x, bx, gy - (i % 3) * 22, .95, t + i, -side, '#2a1208', '#5a2a10'); }
        }, .3);
        const sh = roar > 0 && roar < 1.2 ? rand(-8, 8) * (1 - roar / 1.2) : 0; c.save(); c.translate(sh, sh);
        A(c, W * .24, gy + 4, 2.8, t, roar < 0 ? 'taunt' : 'charge', {}); c.restore();
        if (charge < 0.95) silhouette(c, o => drawCharAt(o, opp.def, W * .72, gy + 4, os, -1, { pose: roar < 0 ? 'block' : 'hurt', anim: t, transformed: opp.transformed }), '#40200c');
        else { const k = seg(t, 5.0, 6.0); silhouette(c, o => { o.save(); o.translate(W * .72 + k * 380, gy - k * 260 + k * k * 260); o.rotate(k * 9); drawCharAt(o, opp.def, 0, 0, os, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }); o.restore(); }, '#40200c'); }
        if (roar > 0 && roar < 1.6) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const r = roar * 760 - i * 90; if (r > 0) { c.strokeStyle = `rgba(255,${190 + i * 10},100,${.6 * (1 - roar / 1.6)})`; c.lineWidth = 12 - i; c.beginPath(); c.arc(W * .24 + 70, gy - 210, r, -.7, .7); c.stroke(); } } c.restore(); }
        if (roar > 0.1 && roar < 2.2) { c.save(); c.translate(W * .5, 130); c.scale(1 + Math.sin(t * 30) * .03, 1); bigText(c, 'ROOOAR!', 0, 0, 130, '#fff0c0', '#8a3a10'); c.restore(); }
        fx.draw(c); flashAt(c, t, 5.1, 5.6, '#fff0c0');
        if (t > 6.0) titleSlam(c, "KING'S ROAR", 'THE PRIDE HAS SPOKEN', t, 6.1, '#ffb02a', 110);
      } };
  }
  function csLeoAscend(a, opp) {
    const fx = new ParticleSystem(1800), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: 'THE PRIDE ASCENDS', dur: 8.4, fx,
      cues: [[0, () => sfx('leoCrown')], [1.6, () => sfx('leoPounce')], [2.6, () => sfx('leoRoar', 0, 2.6)], [3.4, () => sfx('leoHerd', 0, 3)], [5.6, () => { sfx('boom'); sfx('leoClaw'); sfx('impact', 1); }]],
      draw(c, t) {
        const leap = ease.inOut(seg(t, 1.2, 2.6)), lion = seg(t, 2.6, 3.6), run = seg(t, 3.4, 5.6), gy = H - 70, sun = H * .28;
        PxKit.scene(c, x => {
          savanna(x, t, 1, sun); x.fillStyle = '#2a1008'; x.fillRect(0, gy, W, H - gy);
          if (lion > 0) { // the sun's disc grows a mane of rays and a lion's face
            x.globalCompositeOperation = 'lighter'; x.strokeStyle = `rgba(255,230,140,${.6 * lion})`; x.lineWidth = 10; for (let i = 0; i < 24; i++) { const an = i * .2618 + t * .2; x.beginPath(); x.moveTo(W * .5 + Math.cos(an) * 190, sun + Math.sin(an) * 190); x.lineTo(W * .5 + Math.cos(an) * (330 + 60 * Math.sin(t * 3 + i)), sun + Math.sin(an) * (330 + 60 * Math.sin(t * 3 + i))); x.stroke(); }
            x.fillStyle = `rgba(120,50,10,${.7 * lion})`; x.fillRect(W * .5 - 70, sun - 60, 40, 24); x.fillRect(W * .5 + 30, sun - 60, 40, 24); x.fillRect(W * .5 - 30, sun + 20, 60, 40); x.globalCompositeOperation = 'source-over';
          }
          // golden lions pour down out of the sun and across the plain
          for (let i = 0; i < 26; i++) { const k = clamp(run * 1.4 - i * .03, 0, 1); if (k <= 0) continue; const bx = lerp(W * .5, W * (.15 + (i % 7) * .12) + (i % 2) * 60, 1 - (1 - k) * (1 - k)) , by = lerp(sun, gy - (i % 3) * 20, ease.in(Math.min(1, k * 1.6))); PxKit.beast(x, bx, by, .9, t + i, i % 2 ? 1 : -1, '#f0b84a', '#ffe08a'); }
        }, .3);
        const lx = lerp(W * .28, W * .5, leap), ly = lerp(gy, sun + 60, Math.sin(leap * Math.PI)) ; 
        if (t < 3.4) A(c, lx, lerp(gy + 4, sun + 130, Math.sin(leap * Math.PI)), 2.8 - .8 * Math.sin(leap * Math.PI), t, leap > 0 && leap < 1 ? 'air_spike' : t > 2.6 ? 'charge' : 'taunt', { transformed: true });
        else A(c, W * .28, gy + 4, 2.8, t, 'victory', { transformed: true });
        const hit = t - 5.6;
        if (hit < 0.1) silhouette(c, o => drawCharAt(o, opp.def, W * .72, gy + 4, os, -1, { pose: run > .6 ? 'block' : 'stun', anim: t, transformed: opp.transformed }), '#40200c'); else { const k = seg(hit, .1, 1.2); silhouette(c, o => { o.save(); o.translate(W * .72 + k * 300, gy - k * 80); o.rotate(k * 2.2); drawCharAt(o, opp.def, 0, 0, os, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }); o.restore(); }, '#40200c'); }
        if (hit > 0 && hit < .12) for (let i = 0; i < 30; i++) fx.add({ x: W * .72, y: gy - rand(0, 200), vx: rand(-700, 700), vy: rand(-700, -100), life: 1.2, size: rand(5, 12), color: pick(['#ffd35a', '#fff', '#ffb02a']), glow: true, g: 700 });
        fx.draw(c);
        caption(c, 'The sun is just my oldest subject.', t, .3, 2.5, '#ffe9b0'); flashAt(c, t, 2.55, 2.9, '#fff0c0'); flashAt(c, t, 5.55, 6.0, '#ffffff');
        if (t > 6.5) titleSlam(c, 'THE PRIDE ASCENDS', 'LONG LIVE THE KING', t, 6.6, '#ffb02a', 96);
      } };
  }
})();
