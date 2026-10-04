// ============================================================
//  MOONKAI — BLOSSOM, the Gardener. Rework + pixel remake.
//
//  SEED BURST (5S)    three seeds that sprout into thorns where they land.
//  WORLD TREE (awakening)  bark armor, and a new moveset: Rootspear (a wave of roots), Branch Slam (armored),
//                     Canopy (a wall of leaves + a healing glade), Seed of Rebirth (a seed that heals her if it
//                     survives), Petal Storm.
//  BLOOM OF AGES / YGGDRASIL   two ultimates with their own cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('blossom');
  Object.assign(Sfx, {
    bloBloom(d = 0) { this.run({ notes: [523, 659, 784, 988, 1319], step: .07, dur: .7, vol: .1, delay: d, wet: .7, type: 'sine' }); this.nsweep({ f0: 3000, f1: 9000, dur: .5, vol: .06, type: 'highpass', delay: d, wet: .5 }); },
    bloGrow(d = 0, dur = 1.4) { this.voice({ f: 70, to: 150, dur, vol: .26, type: 'sawtooth', lp: 420, lpTo: 900, n: 3, det: 18, delay: d, swell: true, wet: .4 }); this.nsweep({ f0: 200, f1: 1600, dur, vol: .12, q: 2, delay: d, swell: true }); for (let i = 0; i < 6; i++) this.fm({ f: 140 + i * 22, ratio: 1.5, index: 160, dur: .2, vol: .09, delay: d + i * dur / 7, wet: .2 }); },
    bloLeaves(d = 0) { this.nsweep({ f0: 3200, f1: 8000, dur: .5, vol: .12, type: 'bandpass', q: .8, delay: d, wet: .4 }); this.crackle({ dur: .4, vol: .05, delay: d, lo: 2400, hi: 6000 }); },
    bloThorn(d = 0) { this.nsweep({ f0: 1400, f1: 5200, dur: .12, vol: .22, delay: d }); this.voice({ f: 220, to: 90, dur: .2, vol: .18, type: 'triangle', delay: d }); },
    bloHeal(d = 0) { this.run({ notes: [392, 494, 587, 784], step: .09, dur: .8, vol: .12, delay: d, wet: .8 }); this.chord({ notes: [196, 247, 294], dur: 1.4, vol: .16, type: 'sine', delay: d, wet: .8 }); },
    bloTree(d = 0) { this.sub({ f: 60, to: 28, dur: 1.6, vol: .5, delay: d }); this.rumble(2.2, .3, d); this.bloGrow(d, 1.8); this.chord({ notes: [131, 165, 196, 262], dur: 2.6, vol: .26, type: 'sawtooth', lp: 900, delay: d + .4, wet: .9, det: 14 }); },
  });
  PxModel.install(def, { extra: { head(g, P, s, m) { const [hx, hy] = P.head; g.fill(g.ell(hx - 6, hy - 11, 2.4, 2.4), '#ffffff'); g.fill(g.ell(hx - 6, hy - 11, 1, 1), '#ffd35a'); },
    state(v, t) { return { petals: v.transformed ? 1 : 0 }; } },
    post(c, v, P, s) { const t = v.anim || 0; c.save(); for (let i = 0; i < (s.tr ? 10 : 4); i++) { const a = t * (s.tr ? 1.6 : 1) + i * 6.283 / (s.tr ? 10 : 4), r = 42 + (i % 3) * 7; c.fillStyle = i % 2 ? '#ff8ac8' : '#9aff7a'; c.fillRect(Math.round(P.sh[0] + Math.cos(a) * r), Math.round(P.sh[1] + 16 + Math.sin(a) * r * .55), 4, 3); } c.restore(); } });
  PxModel.portrait(def);

  // ---- hazards: the seed that returns, the wave of roots, the wall of leaves ----
  Combat.hz.bloSeed = function (h) {
    const f = h.owner; if (!f || f.state === 'ko') return false;
    for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < 46 + e.w / 2 && e.y > -90) { Game.popWorld(h.x, -80, 'SEED CRUSHED', '#ffb0b0', 18); Game.fx.burst(h.x, -20, 14, { color: ['#8a6a3a', '#3a8a2a'], size: 6, speed: 220, life: .4 }); return false; }
    if (h.t >= h.life) { Combat.healSelf(f, Math.round(f.maxHp * 0.2)); Combat.addHazard({ kind: 'bloBloom', owner: f, side: f.side, x: h.x, life: 40 }); sfx('bloTree'); Cam.shake = Math.max(Cam.shake, 6); return false; }
    return true;
  };
  Combat.drawHz.bloSeed = (c, h) => { const k = h.t / h.life; c.save(); c.fillStyle = '#6a4a2a'; c.fillRect(h.x - 6, -10, 12, 10); c.fillStyle = '#3a9a3a'; c.fillRect(h.x - 2, -10 - 40 * k, 4, 40 * k + 2); for (let i = 0; i < 2 + Math.floor(k * 6); i++) { c.fillStyle = i % 2 ? '#8aff6a' : '#4aca4a'; c.fillRect(h.x + (i % 2 ? 4 : -12), -14 - i * 9 * k - 4, 10, 6); } c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, -20, 30 + 50 * k, `rgba(140,255,120,${.2 + .3 * k})`, 'rgba(0,0,0,0)'); c.restore(); };
  Combat.hz.bloBloom = h => h.t < h.life;
  Combat.drawHz.bloBloom = (c, h) => { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 30; i++) { const a = i * 2.4, r = 20 + k * 200 * (.4 + (i % 5) * .15), x = h.x + Math.cos(a) * r, y = -20 - k * 160 * (.3 + (i % 4) * .2) + Math.sin(a * 2) * 20; c.fillStyle = i % 3 ? `rgba(255,150,210,${1 - k})` : `rgba(160,255,130,${1 - k})`; c.fillRect(Math.round(x / 3) * 3, Math.round(y / 3) * 3, 6, 4); } glowCircle(c, h.x, -40, 160 * (1 - k) + 40, `rgba(140,255,130,${.4 * (1 - k)})`, 'rgba(0,0,0,0)'); c.restore(); };
  Combat.hz.bloRoots = function (h) { const f = h.owner; if (!f) return false; const reach = 1000 * ease.out(Math.min(1, h.t / 26)); for (const e of Combat.targets(f.side)) if (!h.hit.has(e) && (e.x - h.x) * h.dir > 0 && (e.x - h.x) * h.dir < reach && e.y > -80) { h.hit.add(e); Combat.resolveHit(e, f, H_({ dmg: 62, guard: 'low', hs: 22, kb: [0, -620], launch: true, status: { slow: 1.5 }, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); } return h.t < h.life; };
  Combat.drawHz.bloRoots = (c, h) => { const reach = 1000 * ease.out(Math.min(1, h.t / 26)), a = 1 - Math.max(0, (h.t - 26) / (h.life - 26)); c.save(); c.globalAlpha = a; for (let i = 0; i < 16; i++) { const x = h.x + h.dir * (60 + i * 62); if ((x - h.x) * h.dir > reach) break; const k = Math.min(1, (reach - (x - h.x) * h.dir) / 140), ht = (50 + (i * 31 % 40)) * k; c.fillStyle = '#4a2c14'; c.beginPath(); c.moveTo(x - 10, 0); c.lineTo(x + 2 + Math.sin(h.t * .3 + i) * 3, -ht); c.lineTo(x + 10, 0); c.fill(); c.fillStyle = '#8aff6a'; c.fillRect(x - 3, -ht - 4, 8, 6); } c.restore(); };

  // ---- base rework ----
  PxKit.setMove(def, '5S', Mv.shot({ name: 'Seed Burst', desc: 'Three seeds that sprout into thorns where they land.', proj: { speed: 640, r: 10, dmg: 34, count: 3, spread: .5, kind: 'leaf', color: '#8aff6a', explode: 44 }, ev: { 4: () => sfx('bloLeaves'), 12: () => sfx('bloThorn') } }));
  PxKit.setMove(def, '4S', Mv.place({ name: 'Healing Garden', desc: 'A glade of flowers that heals (≈400) and blooms with pink petals.', spawn: { kind: 'zone', at: 'self', r: 120, heal: 50, every: 0.5, life: 4, color: '#8aff6a' }, cd: 14, ai: { min: 0, max: 3000, use: 'heal' }, ev: { 2: () => sfx('bloHeal') } }));

  // ---- WORLD TREE moveset ----
  const F5 = Mv.custom({ name: 'Rootspear', desc: 'World Tree: roots tear out of the ground and race along the lane, launching anything they touch.', pose: 'slam', s: 14, a: 6, r: 22, cd: 2, ai: { min: 80, max: 800, use: 'zone' },
    ev: { 2: () => sfx('bloGrow', 0, .7), 14: f => { Combat.addHazard({ kind: 'bloRoots', owner: f, side: f.side, x: f.x, dir: f.facing, life: 56, hit: new Set(), move: F5 }); sfx('bloThorn'); Cam.shake = Math.max(Cam.shake, 8); } } });
  const F6 = Mv.rush({ name: 'Branch Slam', desc: 'World Tree: a bark-armored shoulder with a branch for a fist. Armored on the way in.', speed: 1050, frames: 18, armor: [1, 20], hit: { dmg: 108, kb: [620, -300], wb: true }, ev: { 1: () => sfx('bloGrow', 0, .5) } });
  const F2 = Mv.custom({ name: 'Canopy', desc: 'World Tree: a wall of leaves rises in front of her and a healing glade opens at her feet.', pose: 'cast_up', s: 16, a: 1, r: 22, cd: 9, ai: { min: 0, max: 600, use: 'buff' },
    ev: { 16: f => { Combat.place(f, { kind: 'wall', at: 'front', dx: 120, hp: 320, w: 50, hgt: 180, color: '#3a8a2a' }); Combat.place(f, { kind: 'zone', at: 'self', r: 130, heal: 40, every: 0.5, life: 4, color: '#8aff6a' }); sfx('bloHeal'); sfx('bloLeaves'); } } });
  const F4 = Mv.custom({ name: 'Seed of Rebirth', desc: 'World Tree: plants a seed. If nobody steps on it for 5s it blooms and heals her 20%. One at a time.', pose: 'cast', s: 14, a: 1, r: 18, cd: 10, ai: { min: 0, max: 900, use: 'heal' },
    ev: { 14: f => { Combat.hazards = Combat.hazards.filter(h => !(h.kind === 'bloSeed' && h.owner === f)); Combat.addHazard({ kind: 'bloSeed', owner: f, side: f.side, x: clamp(f.x - f.facing * 90, 60, Arena.stage.width - 60), life: 5 * FPS }); sfx('bloBloom'); } } });
  const FJ = Mv.shot({ name: 'Petal Storm', desc: 'World Tree: a swirling fan of sleep-pollen petals.', proj: { speed: 560, r: 12, dmg: 28, count: 5, spread: 1.0, angle: .8, kind: 'petal', color: '#ff9ad2', stun: .35 }, ev: { 2: () => sfx('bloLeaves') } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'blossom_fult', name: 'YGGDRASIL', desc: 'World Tree: the world tree itself rises under the arena, its roots lifting the foe into its branches. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1280, color: '#8aff6a', cutscene: (a, t) => csYggdrasil(a, t) });
  FU.ev = PxKit.trackEv(FU, { at: 54, r: 150, color: '#8aff6a', start: f => { f.say('Everything grows back. Even stronger.', 100); sfx('bloTree'); }, fire: (f, x) => { Combat.addHazard({ kind: 'bloBloom', owner: f, side: f.side, x, life: 50 }); Combat.addHazard({ kind: 'bloRoots', owner: f, side: f.side, x, dir: 1, life: 40, hit: new Set(), move: FU }); Combat.addHazard({ kind: 'bloRoots', owner: f, side: f.side, x, dir: -1, life: 40, hit: new Set(), move: FU }); Cam.shake = 22; sfx('bloThorn'); sfx('impact', 1); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Bark armor, faster regeneration. New moveset: Rootspear, Branch Slam, Canopy, Seed of Rebirth, Petal Storm, and the ultimate YGGDRASIL.' });
  const U = PxKit.ult({ id: 'blossom_ult', name: 'BLOOM OF AGES', desc: 'Roots burst up under the foe and a thousand years of growth happen at once. Blockable. Must connect.', pose: 'cast_up', s: 44, dmg: 1100, color: '#8aff6a', cutscene: (a, t) => csBloom(a, t) });
  U.ev = PxKit.trackEv(U, { at: 44, r: 130, color: '#8aff6a', start: f => { f.say('Bloom.', 70); sfx('bloGrow', 0, 1.6); }, fire: (f, x) => { Combat.addHazard({ kind: 'bloBloom', owner: f, side: f.side, x, life: 44 }); Combat.addHazard({ kind: 'bloRoots', owner: f, side: f.side, x, dir: 1, life: 30, hit: new Set(), move: U }); Cam.shake = 18; sfx('bloBloom'); sfx('impact', .9); } });
  PxKit.setUlt(def, U); def.transformCutscene = f => csWorldTree(f);

  // ---- cinematics ----
  const grove = (x, t, k) => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgb(${lerp(8, 90, k) | 0},${lerp(20, 190, k) | 0},${lerp(24, 120, k) | 0})`); g.addColorStop(1, `rgb(${lerp(10, 60, k) | 0},${lerp(40, 120, k) | 0},${lerp(20, 50, k) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { x.fillStyle = `rgba(255,255,200,${.07 * k})`; x.beginPath(); x.moveTo(120 + i * 180, 0); x.lineTo(60 + i * 180, H); x.lineTo(140 + i * 180, H); x.lineTo(180 + i * 180, 0); x.fill(); } x.globalCompositeOperation = 'source-over'; x.fillStyle = '#10300c'; x.fillRect(0, H - 90, W, 90); x.fillStyle = '#1a4a14'; x.fillRect(0, H - 90, W, 6); for (let i = 0; i < 9; i++) { x.fillStyle = '#143a10'; x.fillRect(i * 150 + 20, H - 330 - (i % 3) * 40, 26, 250); x.beginPath(); x.ellipse(i * 150 + 33, H - 330 - (i % 3) * 40, 70, 46, 0, 0, 7); x.fill(); } };
  const petals = (fx, x, y, n, col) => { for (let i = 0; i < n; i++) fx.add({ x: x + rand(-80, 80), y: y + rand(-60, 60), vx: rand(-120, 120), vy: rand(-220, -40), life: 1.4, size: rand(4, 8), color: pick(col), shape: 'rect', rot: rand(0, 6), vr: rand(-6, 6), glow: true }); };
  function csWorldTree(f) {
    const fx = new ParticleSystem(1200), A = PxKit.actor(f.def);
    return { name: 'WORLD TREE', dur: 6.2, fx,
      cues: [[0, () => sfx('bloBloom')], [1.4, () => sfx('bloGrow', 0, 2.2)], [3.0, () => sfx('bloTree')], [3.2, () => sfx('bloLeaves')]],
      draw(c, t) {
        const day = ease.inOut(seg(t, 0, 3)), grow = ease.inOut(seg(t, 1.4, 3.2)), gy = H - 84;
        PxKit.scene(c, x => { grove(x, t, day); // the trunk growing up around her, branches spreading across the sky
          x.fillStyle = '#3a2410'; x.fillRect(W * .5 - 90 * grow, gy - 700 * grow, 180 * grow, 700 * grow); x.strokeStyle = '#3a2410'; x.lineCap = 'square'; x.lineWidth = 22 * grow; for (let i = 0; i < 6; i++) { const s2 = i % 2 ? 1 : -1; x.beginPath(); x.moveTo(W * .5, gy - 380 * grow - i * 40); x.lineTo(W * .5 + s2 * (160 + i * 50) * grow, gy - (440 + i * 50) * grow); x.stroke(); }
          x.fillStyle = '#2a7a22'; for (let i = 0; i < 40; i++) { const lx = W * .5 + Math.sin(i * 2.1) * 560 * grow, ly = gy - (500 + (i * 23 % 180)) * grow; x.beginPath(); x.ellipse(lx, ly, 44 * grow, 30 * grow, 0, 0, 7); x.fill(); } }, .3);
        A(c, W * .5, gy + 4, 3.0 + grow * .25, t, t < 1.4 ? 'cast' : t < 3.2 ? 'charge' : 'victory', { transformed: t > 3.0 });
        if (t > 1.4 && t < 3.6) petals(fx, W * .5, gy - 200, 3, ['#ff8ac8', '#9aff7a', '#ffffff']); fx.draw(c);
        caption(c, 'Everything grows back.', t, .3, 2.8, '#d8ffc8'); flashAt(c, t, 3.0, 3.5, '#eaffd8');
        titleSlam(c, 'WORLD TREE', 'ROOTED IN EVERYTHING', t, 3.8, '#8aff6a', 118);
      } };
  }
  function csBloom(a, opp) {
    const fx = new ParticleSystem(1600), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: 'BLOOM OF AGES', dur: 7.6, fx,
      cues: [[0, () => sfx('bloBloom')], [1.2, () => sfx('bloGrow', 0, 2.4)], [3.8, () => sfx('bloThorn')], [4.2, () => { sfx('bloTree'); sfx('impact', 1); }], [5.6, () => sfx('bloHeal')]],
      draw(c, t) {
        const season = t < 1.4 ? 0 : t < 2.6 ? 1 : t < 3.8 ? 2 : 3, bloom = seg(t, 3.8, 4.6), gy = H - 84, ox = W * .72;
        const skies = [[120, 220, 120], [255, 230, 120], [220, 120, 40], [240, 250, 255]][season];
        PxKit.scene(c, x => { grove(x, t, .8); x.fillStyle = `rgba(${skies[0]},${skies[1]},${skies[2]},0.28)`; x.fillRect(0, 0, W, H); // spring / summer / autumn / winter wash
          x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { x.fillStyle = season === 3 ? 'rgba(255,255,255,0.8)' : season === 2 ? 'rgba(255,150,40,0.8)' : 'rgba(255,170,220,0.7)'; x.fillRect((i * 83 + t * (season === 3 ? 60 : 120)) % W, (i * 57 + t * 90) % H, 6, 5); } x.globalCompositeOperation = 'source-over';
          if (bloom > 0) { x.fillStyle = '#4a2c14'; x.fillRect(ox - 40 * bloom, gy - 760 * bloom, 80 * bloom, 760 * bloom); x.fillStyle = '#3aca3a'; for (let i = 0; i < 34; i++) { x.beginPath(); x.ellipse(ox + Math.sin(i * 2.7) * 360 * bloom, gy - (500 + (i * 31 % 260)) * bloom, 52 * bloom, 36 * bloom, 0, 0, 7); x.fill(); } x.fillStyle = '#ff8ac8'; for (let i = 0; i < 40; i++) x.fillRect(ox + Math.sin(i * 3.3) * 380 * bloom, gy - (440 + (i * 29 % 300)) * bloom, 12, 12); }
        }, .3);
        A(c, W * .22, gy + 4, 2.9, t, t < 3.8 ? 'cast_up' : 'victory', { transformed: false });
        const lift = ease.inOut(seg(t, 4.0, 5.6)); silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4 - lift * 330, os, -1, { pose: lift > 0 ? 'hurt_air' : 'block', anim: t, transformed: opp.transformed }), '#1a4a18');
        if (bloom > 0 && bloom < 1) petals(fx, ox, gy - 120, 4, ['#ff8ac8', '#9aff7a']); fx.draw(c);
        caption(c, 'A thousand years, in a breath.', t, .3, 3.4, '#d8ffc8'); flashAt(c, t, 4.15, 4.6, '#eaffd8');
        if (t > 6.0) titleSlam(c, 'BLOOM OF AGES', 'EVERYTHING GROWS BACK', t, 6.1, '#8aff6a', 100);
      } };
  }
  function csYggdrasil(a, opp) {
    const fx = new ParticleSystem(1800), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: 'YGGDRASIL', dur: 8.4, fx,
      cues: [[0, () => sfx('bloTree')], [2.0, () => sfx('bloGrow', 0, 3)], [4.4, () => { sfx('bloTree'); sfx('boom'); }], [5.6, () => sfx('bloThorn')], [6.3, () => sfx('bloHeal')]],
      draw(c, t) {
        const up = ease.in(seg(t, 2.0, 4.6)), gy = H - 84, ox = W * .7, tilt = seg(t, 4.4, 5.6);
        PxKit.scene(c, x => {
          const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#04140a'); g.addColorStop(1, '#16461c'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(160,255,160,0.8)'; x.fillRect((i * 97) % W, (i * 41) % (H * .7), 4, 4); } x.globalCompositeOperation = 'source-over';
          // the world tree: a trunk so wide it fills the sky, rising out of the stage; the camera tilts up its length
          const th = 1600 * up; x.fillStyle = '#3a2410'; x.fillRect(W * .5 - 200, H - th, 400, th + 80); x.fillStyle = '#4e3216'; for (let i = 0; i < 12; i++) x.fillRect(W * .5 - 180 + (i % 4) * 90, H - th + i * 120, 30, 200); x.fillStyle = '#26701e'; for (let i = 0; i < 50; i++) { x.beginPath(); x.ellipse(W * .5 + Math.sin(i * 1.9) * 620, H - th + (i * 53 % 320), 80, 52, 0, 0, 7); x.fill(); }
          x.fillStyle = '#10300c'; x.fillRect(0, gy, W, H - gy);
          for (let i = 0; i < 9; i++) { const rr = up * 300 * (1 - i * .08); x.strokeStyle = '#4a2c14'; x.lineWidth = 26; x.lineCap = 'square'; x.beginPath(); x.moveTo(W * .5 + (i - 4) * 40, gy); x.lineTo(W * .5 + (i - 4) * 150, gy + 60 - rr * .2); x.stroke(); }
        }, .3);
        A(c, W * .2, gy + 4, 2.8, t, t < 4.4 ? 'cast_up' : 'victory', { transformed: true });
        const lft = ease.inOut(seg(t, 4.4, 6.0)); silhouette(c, o => { o.save(); o.translate(ox, gy + 4 - lft * 380); o.rotate(lft * 1.4); drawCharAt(o, opp.def, 0, 0, os, -1, { pose: lft > 0 ? 'hurt_air' : 'block', anim: t, transformed: opp.transformed }); o.restore(); }, '#1a5a22');
        if (t > 2 && t < 6) petals(fx, W * .5 + rand(-300, 300), rand(100, 500), 3, ['#9aff7a', '#ffffff', '#ff8ac8']); fx.draw(c);
        caption(c, 'The world is a seed, too.', t, .3, 3.8, '#d8ffc8'); flashAt(c, t, 4.4, 4.9, '#eaffd8');
        if (t > 6.4) titleSlam(c, 'YGGDRASIL', 'THE WORLD TREE REMEMBERS', t, 6.5, '#8aff6a', 112);
      } };
  }
})();
