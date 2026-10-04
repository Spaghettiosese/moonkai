// ============================================================
//  MOONKAI — NEON, the Street Skater. Rework + pixel remake.
//
//  GRIND (6S)         a rail-grind dash that leaves a burning paint line behind her.
//  OVERDRIVE (awakening)  rocket skates, and a new moveset: Paint Barrage (five rainbow cans), Rocket Grind (a long
//                     painted rail), Mural Wall (a painted wall that blocks and slows), Quad Flip, Skyline Slam.
//  NEON NIGHTS / CITY OF NEON  two ultimates with their own cinematics.
//  1UP                a rare extra life: the first time she falls in a round she respawns at 40% in a burst of
//                     arcade light.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('neon');
  Object.assign(Sfx, {
    neoSpray(d = 0) { this.nsweep({ f0: 5000, f1: 9000, dur: .3, vol: .16, type: 'highpass', delay: d }); this.voice({ f: 1600, to: 900, dur: .1, vol: .05, type: 'square', delay: d }); },
    neoGrind(d = 0, dur = .6) { this.nsweep({ f0: 1800, f1: 3400, dur, vol: .2, q: 3, delay: d }); this.crackle({ dur, vol: .12, delay: d, lo: 2000, hi: 7000 }); },
    neoFlip(d = 0) { this.voice({ f: 330, to: 990, dur: .2, vol: .12, type: 'square', delay: d, lp: 2400 }); this.nsweep({ f0: 600, f1: 4200, dur: .16, vol: .12, delay: d }); },
    neoArp(d = 0, up = true) { const n = [262, 330, 392, 523, 659, 784, 1047]; this.run({ notes: up ? n : n.slice().reverse(), step: .05, dur: .22, type: 'square', vol: .06, delay: d, wet: .4 }); },
    neoBass(d = 0, dur = 1.6) { this.voice({ f: 55, to: 55, dur, vol: .34, type: 'sawtooth', lp: 300, n: 3, det: 20, delay: d }); for (let i = 0; i < Math.floor(dur / .25); i++) this.sub({ f: 62, to: 36, dur: .2, vol: .24, delay: d + i * .25 }); },
    neoCoin(d = 0) { this.voice({ f: 988, dur: .08, vol: .1, type: 'square', delay: d }); this.voice({ f: 1319, dur: .3, vol: .1, type: 'square', delay: d + .08, wet: .3 }); },
    neoOneUp(d = 0) { this.run({ notes: [330, 392, 659, 523, 587, 784], step: .09, dur: .16, type: 'square', vol: .09, delay: d, wet: .3 }); },
    neoBoom(d = 0) { this.impact(.9, d); this.neoArp(d, false); },
  });
  PxModel.install(def, { extra: { state(v, t) { return { glide: Math.abs(v.vx || 0) > 220 ? 1 : 0 }; } },
    post(c, v, P, s, m) { const t = v.anim || 0; c.save(); c.globalCompositeOperation = 'lighter'; if (s.glide || s.tr) for (let i = 1; i <= 6; i++) { c.fillStyle = `hsla(${(t * 200 + i * 40) % 360},100%,60%,${.5 - i * .07})`; c.fillRect(Math.round(P.bF[0] - 14 - i * 9), Math.round(P.bF[1] - 4), 10, 4); c.fillRect(Math.round(P.fF[0] - 14 - i * 9), Math.round(P.fF[1] - 4), 10, 4); } c.restore(); } });
  PxModel.portrait(def);

  // paint line left by Grind / Rocket Grind: damages anyone crossing it, glows in rainbow pixels
  Combat.hz.neoPaint = function (h) { const f = h.owner; if (!f) return false; if (h.t % 10 === 0) for (const e of Combat.targets(f.side)) if (e.x > h.x0 && e.x < h.x1 && e.y > -60 && !h.hit.has(e)) { h.hit.add(e); Combat.resolveHit(e, f, H_({ dmg: h.dmg, guard: 'low', hs: 14, kb: [0, -200], status: { slow: 1.2 }, sfx: 'l' }), { proj: true, fromX: (h.x0 + h.x1) / 2 }); } return h.t < h.life; };
  Combat.drawHz.neoPaint = (c, h) => { const a = Math.min(1, (h.life - h.t) / 20); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; for (let x = h.x0; x < h.x1; x += 8) { c.fillStyle = `hsl(${(x * .6 + h.t * 6) % 360},100%,60%)`; c.fillRect(Math.round(x / 4) * 4, -6 - Math.round(Math.sin(x * .1 + h.t * .3) * 3), 8, 6); } c.restore(); };
  const paintTrail = (f, len, dmg) => { const x0 = f.facing > 0 ? f.x : f.x - len, x1 = f.facing > 0 ? f.x + len : f.x; Combat.addHazard({ kind: 'neoPaint', owner: f, side: f.side, x0: clamp(x0, 0, Arena.stage.width), x1: clamp(x1, 0, Arena.stage.width), dmg, life: 90, hit: new Set() }); };

  PxKit.setMove(def, '6S', Mv.rush({ name: 'Grind', desc: 'A skate-grind dash that lays a burning line of paint along the way.', pose: 'sweep', speed: 1300, frames: 18, hit: { dmg: 80, guard: 'low', kb: [300, -500], box: [-10, -50, 70, 50] }, ev: { 1: f => { sfx('neoGrind'); paintTrail(f, 420, 20); } } }));
  PxKit.setMove(def, '5S', Mv.shot({ name: 'Spray Can', desc: 'A blob of glowing paint that slows.', proj: { speed: 800, r: 12, dmg: 45, kind: 'poison', color: '#ff2aff', status: { slow: 1.5 } }, ev: { 2: () => sfx('neoSpray') } }));

  const F5 = Mv.shot({ name: 'Paint Barrage', desc: 'Overdrive: five cans in five colours, fanned across the foe.', proj: { speed: 880, r: 11, dmg: 30, count: 5, spread: .7, kind: 'poison', color: '#2af0ff', status: { slow: 1 } }, ev: { 2: () => sfx('neoSpray'), 10: () => sfx('neoArp') } });
  const F6 = Mv.rush({ name: 'Rocket Grind', desc: 'Overdrive: rockets on her heels carry her the length of the stage, painting a rail behind her.', pose: 'sweep', speed: 1700, frames: 22, pass: true, hit: { dmg: 70, guard: 'low', kb: [300, -500] }, ev: { 1: f => { sfx('neoGrind', 0, .9); sfx('neoArp'); paintTrail(f, 900, 28); } } });
  const F2 = Mv.custom({ name: 'Mural Wall', desc: 'Overdrive: she tags a wall in front of her. It blocks, and anything that touches it is slowed.', pose: 'cast', s: 12, a: 1, r: 18, cd: 7, ai: { min: 80, max: 600, use: 'trap' }, ev: { 3: () => sfx('neoSpray'), 12: f => { Combat.place(f, { kind: 'wall', at: 'front', dx: 160, hp: 260, w: 46, hgt: 190, color: '#ff2aff' }); sfx('neoCoin'); } } });
  const F4 = Mv.rising({ name: 'Quad Flip', desc: 'Overdrive: four flips straight up through the foe.', pose: 'kick', hit: { dmg: 40, multi: 4 }, ev: { 2: () => sfx('neoFlip'), 7: () => sfx('neoFlip') } });
  const FJ = Mv.dive({ name: 'Skyline Slam', desc: 'Overdrive: a board slam from the clouds that bounces the foe.', vx: 1000, vy: 1300, hit: { dmg: 100, gb: true }, ev: { 1: () => sfx('neoArp', 0, false) } });
  const FU = PxKit.ult({ id: 'neon_fult', name: 'CITY OF NEON', desc: 'Overdrive: the whole skyline lights up under her board. She skates a loop around the foe and tags them as the final piece. Blockable. Must connect.', pose: 'sweep', s: 40, dmg: 1260, color: '#2af0ff', cutscene: (a, t) => csCity(a, t) });
  FU.ev = PxKit.zoneEv(FU, { at: 40, w: 900, h: 220, start: f => { f.say('Lights up!', 80); sfx('neoBass', 0, 2); sfx('riser', 1.5, .18, 0, 120, 1200); }, fire: f => { paintTrail(f, 900, 30); Cam.shake = 14; sfx('neoBoom'); sfx('neoGrind', 0, .8); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Rocket skates: much faster, paint trails. New moveset: Paint Barrage, Rocket Grind, Mural Wall, Quad Flip, Skyline Slam, and the ultimate CITY OF NEON.' });
  const U = PxKit.ult({ id: 'neon_ult', name: 'NEON NIGHTS', desc: 'A blazing grind down a power line, across the skyline, and through the foe. Blockable. Must connect.', pose: 'sweep', s: 36, dmg: 1100, color: '#ff2aff', cutscene: (a, t) => csNights(a, t) });
  U.ev = PxKit.zoneEv(U, { at: 36, w: 760, h: 200, start: f => { sfx('neoBass', 0, 1.6); }, fire: f => { paintTrail(f, 760, 26); Cam.shake = 14; sfx('neoBoom'); sfx('neoGrind'); } });
  PxKit.setUlt(def, U); def.ultAct = 'rush'; def.transformCutscene = f => csOverdrive(f);
  def.revival = { needForm: false, hp: 0.4, meter: 150, label: '1UP!', say: ['Continue? Yes.', 'Extra life!'],
    cutscene: f => PxKit.reviveCs(f, { name: '1UP', title: '1UP!', sub: 'CONTINUE?  YES', caption: 'Insert coin.', c1: '#2af0ff', c2: '#ff2aff', c3: '#ffd35a', motif: 'bolts', extra: {}, sfx: n => n === 'open' ? sfx('neoCoin') : n === 'gather' ? sfx('neoArp') : (sfx('neoOneUp'), sfx('neoBoom')),
      bg: (x, t, k) => { x.fillStyle = '#05010e'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 16; i++) { x.fillStyle = `hsla(${(i * 22 + t * 90) % 360},100%,50%,${.16 + .2 * k})`; x.fillRect(0, i * 46 + (t * 60) % 46, W, 4); } x.globalCompositeOperation = 'source-over'; } }) };
  def.form.desc += ' She also carries a rare 1UP: the first time she falls each round she gets back up.';

  const city = (x, t, k) => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#08001a'); g.addColorStop(1, `rgb(${lerp(40, 120, k) | 0},${lerp(10, 20, k) | 0},${lerp(80, 150, k) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H); for (let i = 0; i < 18; i++) { const bx = i * 80 - 30, bh = 200 + (i * 53 % 7) * 40; x.fillStyle = '#0a0220'; x.fillRect(bx, H - bh, 70, bh); x.globalCompositeOperation = 'lighter'; for (let j = 0; j < 8; j++) { x.fillStyle = `hsla(${(i * 37 + j * 50 + t * 80) % 360},100%,${40 + 20 * k}%,${.4 + .5 * k})`; if ((i + j) % 2) x.fillRect(bx + 8 + (j % 3) * 20, H - bh + 20 + Math.floor(j / 3) * 40, 12, 18); } x.globalCompositeOperation = 'source-over'; } x.fillStyle = '#0c0424'; x.fillRect(0, H - 70, W, 70); };
  const sparks = (fx, x, y, n) => { for (let i = 0; i < n; i++) fx.add({ x, y, vx: rand(-300, -60), vy: rand(-260, -40), life: .5, size: rand(3, 6), color: `hsl(${rand(0, 360)},100%,65%)`, glow: true, g: 700 }); };
  function csOverdrive(f) {
    const fx = new ParticleSystem(900), A = PxKit.actor(f.def);
    return { name: 'OVERDRIVE', dur: 5.8, fx,
      cues: [[0, () => sfx('neoCoin')], [1.4, () => sfx('neoBass', 0, 1.6)], [2.6, () => { sfx('neoArp'); sfx('neoBoom'); }]],
      draw(c, t) {
        const k = ease.inOut(seg(t, .6, 2.6)), gy = H - 74;
        PxKit.scene(c, x => city(x, t, k), .3);
        const sx = lerp(W * .2, W * .5, ease.out(seg(t, 0, 1.2)));
        A(c, sx + (t > 2.6 ? Math.sin(t * 3) * 30 : 0), gy + 4, 3.0, t, t < 1.4 ? 'idle' : t < 2.6 ? 'crouch' : 'victory', { transformed: t > 2.6, vx: t < 1.4 ? 300 : 0 });
        if (t > 2.6) { for (let i = 0; i < 4; i++) sparks(fx, sx - 60, gy, 1); }
        if (t > 1.4 && t < 2.6) c.save(), c.globalCompositeOperation = 'lighter', c.fillStyle = `hsla(${(t * 400) % 360},100%,60%,0.6)`, c.fillRect(0, gy - 4, W * k, 8), c.restore();
        fx.draw(c);
        caption(c, 'Okay. Okay. Full send.', t, .3, 2.5, '#9ffcff'); flashAt(c, t, 2.55, 2.95, '#ffe0ff');
        titleSlam(c, 'OVERDRIVE', 'THE CITY IS HER CANVAS', t, 3.5, '#2af0ff', 118);
      } };
  }
  function csNights(a, opp) {
    const fx = new ParticleSystem(1400), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: 'NEON NIGHTS', dur: 7.2, fx,
      cues: [[0, () => sfx('neoBass', 0, 3)], [1.2, () => sfx('neoArp')], [2.0, () => sfx('neoGrind', 0, 2)], [4.0, () => sfx('neoGrind', 0, 1.4)], [5.0, () => sfx('neoBoom')]],
      draw(c, t) {
        const run = seg(t, 1.8, 5.0), gy = H - 74, ox = W * .74, hit = t - 5.0;
        PxKit.scene(c, x => { city(x, t * 1.5, .9); // the power line she grinds along, bending across the skyline
          x.strokeStyle = '#ffd35a'; x.lineWidth = 6; x.beginPath(); x.moveTo(0, 250); x.quadraticCurveTo(W * .5, 330, W, 200); x.stroke(); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const px_ = (i / 40) * W * run; x.fillStyle = `hsl(${(i * 24 + t * 300) % 360},100%,60%)`; x.fillRect(px_, 250 + Math.sin(i * .25) * 20 + 40 * Math.sin(px_ / W * Math.PI) - 2, 14, 6); } x.globalCompositeOperation = 'source-over'; }, .3);
        const sx = lerp(W * .1, ox - 80, ease.in(run)), sy = 240 + 40 * Math.sin(run * Math.PI) - 90;
        A(c, sx, sy + 140, 2.8, t, t < 1.8 ? 'crouch' : 'sweep', { transformed: false, vx: 500 });
        if (run > 0 && hit < 0) sparks(fx, sx - 40, sy + 140, 3);
        if (hit < .1) silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4, os, -1, { pose: 'block', anim: t, transformed: opp.transformed }), '#40125a'); else { const k = seg(hit, .1, 1.3); silhouette(c, o => { o.save(); o.translate(ox + k * 420, gy - k * 160 + k * k * 160); o.rotate(k * 7); drawCharAt(o, opp.def, 0, 0, os, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }); o.restore(); }, '#40125a'); }
        if (hit > 0 && hit < .12) for (let i = 0; i < 40; i++) fx.add({ x: ox, y: gy - rand(0, 200), vx: rand(-600, 600), vy: rand(-700, -100), life: 1.1, size: rand(5, 11), color: `hsl(${rand(0, 360)},100%,65%)`, glow: true, g: 700 });
        fx.draw(c); flashAt(c, t, 5.0, 5.5, '#ffffff'); caption(c, 'This city is my canvas.', t, .3, 2.0, '#ffe0ff');
        if (t > 5.9) titleSlam(c, 'NEON NIGHTS', 'MASTERPIECE', t, 6.0, '#ff2aff', 112);
      } };
  }
  function csCity(a, opp) {
    const fx = new ParticleSystem(1800), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: 'CITY OF NEON', dur: 8.2, fx,
      cues: [[0, () => sfx('neoBass', 0, 3.4)], [1.6, () => sfx('neoArp')], [3.0, () => sfx('neoGrind', 0, 2.4)], [5.0, () => sfx('neoArp', .1)], [5.8, () => sfx('neoBoom')], [6.4, () => sfx('neoOneUp')]],
      draw(c, t) {
        const lit = ease.inOut(seg(t, .8, 3.4)), loop = seg(t, 3.2, 5.8), gy = H - 74, ox = W * .6, hit = t - 5.8;
        PxKit.scene(c, x => { city(x, t * 2, lit); x.globalCompositeOperation = 'lighter'; // every building lights in sequence, then the signs spell her name
          for (let i = 0; i < 12; i++) { x.fillStyle = `hsla(${(i * 30 + t * 120) % 360},100%,60%,${.18 * lit})`; x.fillRect(0, 60 + i * 52, W, 6); } x.globalCompositeOperation = 'source-over';
          if (loop > 0) { x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = 10; x.beginPath(); x.ellipse(ox, gy - 110, 280, 80, 0, 0, Math.PI * 2 * loop); x.stroke(); x.strokeStyle = `hsl(${(t * 300) % 360},100%,60%)`; x.lineWidth = 6; x.beginPath(); x.ellipse(ox, gy - 110, 280, 80, 0, 0, Math.PI * 2 * loop); x.stroke(); } }, .3);
        const an = loop * Math.PI * 2 - Math.PI / 2, sx = loop > 0 && loop < 1 ? ox + Math.cos(an) * 280 : W * .2, sy = loop > 0 && loop < 1 ? gy - 110 + Math.sin(an) * 80 : gy;
        A(c, sx, sy + 4, 2.7, t, loop > 0 && loop < 1 ? 'sweep' : t < 3.2 ? 'crouch' : 'victory', { transformed: true, vx: 500 });
        if (hit < .1) silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4, os, -1, { pose: loop > 0 ? 'stun' : 'block', anim: t, transformed: opp.transformed }), '#40125a'); else silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4 + Math.min(40, hit * 60), os, -1, { pose: 'kneel', anim: t, transformed: opp.transformed }), '#40125a');
        if (hit > 0 && hit < 1.2) { const k = ease.out(Math.min(1, hit / .6)); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `hsl(${(t * 300) % 360},100%,65%)`; c.lineWidth = 12 * (1 - k * .5); c.beginPath(); c.arc(ox, gy - 110, 280 * k + 40, 0, 7); c.stroke(); c.restore(); }
        if (loop > 0 && loop < 1) sparks(fx, sx, sy, 3); fx.draw(c);
        caption(c, 'Every light in town is mine.', t, .3, 3.0, '#9ffcff'); flashAt(c, t, 5.8, 6.3, '#ffffff');
        if (t > 6.5) titleSlam(c, 'CITY OF NEON', 'SIGNED, NEON', t, 6.6, '#2af0ff', 104);
      } };
  }
})();
