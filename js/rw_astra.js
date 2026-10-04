// ============================================================
//  MOONKAI — ASTRA, the Star Valkyrie. Rework + pixel remake.
//
//  STAR MINE (2S)     a mine that now bursts into a ring of falling stars when stepped on.
//  CONSTELLATION ARMOR (awakening)  wings of light, flight, and a new moveset: Lance Volley (three star-spears),
//                     Valkyrie Dive (from the sky), Star Field (five mines), Zodiac Ascension (a five-hit rising
//                     arc), Meteor Shower.
//  STARFALL / ORION   two ultimates with their own cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('astra');
  Object.assign(Sfx, {
    astSpear(d = 0) { this.nsweep({ f0: 1200, f1: 7000, dur: .16, vol: .2, delay: d }); this.fm({ f: 1568, ratio: 2.01, index: 120, dur: .5, vol: .1, delay: d + .05, wet: .6 }); },
    astStar(d = 0) { this.voice({ f: 2093, to: 1047, dur: .3, vol: .09, delay: d, wet: .6 }); this.voice({ f: 3136, to: 1568, dur: .22, vol: .05, type: 'triangle', delay: d + .03, wet: .6 }); },
    astMeteor(d = 0, dur = 1.2) { this.nsweep({ f0: 5000, f1: 120, dur, vol: .28, type: 'lowpass', q: .8, delay: d, wet: .4 }); this.voice({ f: 900, to: 50, dur, vol: .12, type: 'sawtooth', lp: 2600, delay: d, wet: .4 }); },
    astImpact(d = 0) { this.impact(.9, d); this.astStar(d); },
    astHymn(d = 0, dur = 2.6) { this.chord({ notes: [262, 330, 392, 494, 587], dur, vol: .26, type: 'triangle', delay: d, wet: .95, det: 10 }); this.run({ notes: [1047, 1319, 1568, 2093], step: .12, bell: true, dur: 1, delay: d + .2, wet: .9 }); },
    astWings(d = 0) { this.nsweep({ f0: 800, f1: 5000, dur: .5, vol: .16, delay: d, wet: .6 }); this.run({ notes: [784, 988, 1175, 1568], step: .06, dur: .6, bell: true, delay: d, wet: .7 }); },
    astNova(d = 0) { this.fm({ f: 262, ratio: 1.5, index: 400, dur: 2.2, vol: .3, delay: d, wet: .9 }); this.astImpact(d); this.sub({ f: 80, to: 30, dur: 1.4, vol: .4, delay: d }); },
  });
  PxModel.install(def, { extra: { front(g, P, s, m, info) { if (s.tr) { const [hx, hy] = P.fH; g.fill(g.ell(hx + 14, hy - 4, 3, 3), '#ffffff'); } } },
    post(c, v, P, s, m) { const t = v.anim || 0; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < (s.tr ? 9 : 4); i++) { const a = t * 1.2 + i * 6.283 / (s.tr ? 9 : 4), r = 38 + (i % 2) * 10; c.fillStyle = i % 2 ? '#e8f0ff' : '#ffffff'; const sx = Math.round(P.sh[0] + Math.cos(a) * r), sy = Math.round(P.sh[1] + 12 + Math.sin(a) * r * .5); c.fillRect(sx - 1, sy - 3, 2, 7); c.fillRect(sx - 3, sy - 1, 7, 2); } c.restore(); } });
  PxModel.portrait(def);

  Combat.hz.astMeteor = function (h) { const f = h.owner; if (!f) return false; if (h.t === h.at) { for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r) Combat.resolveHit(e, f, H_({ dmg: h.dmg, guard: 'mid', hs: 22, kb: [0, -480], launch: true, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); sfx('astImpact'); Cam.shake = Math.max(Cam.shake, h.big ? 18 : 6); } return h.t < h.life; };
  Combat.drawHz.astMeteor = (c, h) => { const k = Math.min(1, h.t / h.at), y = lerp(-900, -10, k * k), a = h.t > h.at ? 1 - (h.t - h.at) / (h.life - h.at) : 1; c.save(); c.globalCompositeOperation = 'lighter'; if (h.t <= h.at) { for (let i = 0; i < 18; i++) { c.fillStyle = i % 2 ? `rgba(176,200,255,${.6 * (1 - i / 18)})` : `rgba(255,255,255,${.6 * (1 - i / 18)})`; c.fillRect(Math.round((h.x + i * 5 * (h.big ? 1.6 : 1)) / 3) * 3, Math.round((y - i * 26) / 3) * 3, 14 * (h.big ? 2 : 1), 10); } c.fillStyle = '#ffffff'; c.fillRect(h.x - 14 * (h.big ? 2 : 1), y - 16, 28 * (h.big ? 2 : 1), 28 * (h.big ? 2 : 1)); } else { glowCircle(c, h.x, -20, h.r * 1.4 * a + 20, `rgba(176,200,255,${.6 * a})`, 'rgba(0,0,0,0)'); for (let i = 0; i < 14; i++) { const an = i * .45, R = (h.t - h.at) * 14 * (.5 + (i % 4) * .2); c.fillStyle = `rgba(255,255,255,${a})`; c.fillRect(Math.round((h.x + Math.cos(an) * R * 3) / 3) * 3, Math.round((-20 - Math.abs(Math.sin(an)) * R * 2) / 3) * 3, 6, 6); } } c.restore(); };
  Combat.hz.astBurst = h => h.t < h.life;
  Combat.drawHz.astBurst = (c, h) => { const k = h.t / h.life; c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(176,200,255,${1 - k})`; c.lineWidth = 6; c.beginPath(); c.ellipse(h.x, -60, 40 + 240 * k, 20 + 110 * k, 0, 0, 7); c.stroke(); for (let i = 0; i < 10; i++) { const a = i * .628; c.fillStyle = `rgba(255,255,255,${1 - k})`; c.fillRect(Math.round((h.x + Math.cos(a) * (60 + 240 * k)) / 3) * 3, Math.round((-60 + Math.sin(a) * (30 + 110 * k)) / 3) * 3, 8, 8); } c.restore(); };

  PxKit.setMove(def, '2S', Mv.place({ name: 'Star Mine', desc: 'A star that explodes when touched, then rings out in a burst of falling stars.', spawn: { kind: 'mine', at: 'front', dx: 180, dmg: 90, color: '#b0c8ff', body: '#fff', limit: 3 }, cd: 2, ev: { 2: () => sfx('astStar') } }));
  PxKit.setMove(def, '5S', Mv.shot({ name: 'Star Spear', desc: 'A thrown star-spear that rings when it lands.', proj: { speed: 1100, r: 10, dmg: 65, kind: 'spear', color: '#b0c8ff', trail: false }, ev: { 6: () => sfx('astSpear') } }));
  const meteors = (f, xs, dmg, move, gap = 5, big = false) => xs.forEach((x, i) => { Combat.telegraph(f, { x, r: big ? 70 : 52, life: 18 + i * gap, color: '#b0c8ff', column: true, onFire: h => { Combat.addHazard({ kind: 'astMeteor', owner: f, side: f.side, x: h.x, r: h.r, at: 8, dmg, life: 26, move, big }); sfx('astMeteor', 0, .6); } }); });

  const F5 = Mv.shot({ name: 'Lance Volley', desc: 'Constellation Armor: three star-spears in a fan.', proj: { speed: 1150, r: 10, dmg: 44, count: 3, spread: .38, kind: 'spear', color: '#e8f0ff', trail: false }, ev: { 6: () => sfx('astSpear') } });
  const F6 = Mv.rush({ name: 'Valkyrie Dive', desc: 'Constellation Armor: from the sky on winged armor, spear first.', speed: 1500, frames: 18, vy: -300, hit: { dmg: 110, kb: [680, -300], launch: true }, ev: { 1: () => sfx('astWings') } });
  const F2 = Mv.custom({ name: 'Star Field', desc: 'Constellation Armor: five star mines sown in a line in front of her.', pose: 'cast', s: 14, a: 1, r: 20, cd: 6, ai: { min: 80, max: 600, use: 'trap' }, ev: { 14: f => { Combat.place(f, { kind: 'mine', at: 'front', dx: 120, dmg: 70, color: '#b0c8ff', body: '#fff', count: 5, spacing: 90, stagger: 0.04 }); sfx('astStar'); sfx('astStar', .1); } } });
  const F4 = Mv.rising({ name: 'Zodiac Ascension', desc: 'Constellation Armor: a five-hit rising arc along a line of stars.', hit: { dmg: 40, multi: 5 }, ev: { 2: () => sfx('astWings') } });
  const FJ = Mv.custom({ name: 'Meteor Shower', desc: 'Constellation Armor: five stars fall around the foe, one after another.', pose: 'cast_up', s: 18, a: 1, r: 22, cd: 4, ai: { min: 100, max: 900, use: 'zone' }, ev: { 18: f => { const t = f.opp; if (!t) return; meteors(f, [-2, -1, 0, 1, 2].map(i => clamp(t.x + i * 80, 50, Arena.stage.width - 50)), 50, FJ); } } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'astra_fult', name: 'ORION', desc: 'Constellation Armor: the hunter constellation draws his bow across the whole sky and looses one arrow of light at the foe. Blockable. Must connect.', pose: 'cast_up', s: 58, dmg: 1260, color: '#e8f0ff', cutscene: (a, t) => csOrion(a, t) });
  FU.ev = PxKit.trackEv(FU, { at: 58, r: 130, color: '#e8f0ff', start: f => { f.say('Orion, lend me your bow.', 100); sfx('astHymn', 0, 2.8); sfx('riser', 2, .2, 0, 150, 2400); }, fire: (f, x) => { Combat.addHazard({ kind: 'astMeteor', owner: f, side: f.side, x, r: 140, at: 4, dmg: 10, life: 40, move: FU, big: true }); Cam.shake = 22; sfx('astNova'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Star armor, full wings of light, flight. New moveset: Lance Volley, Valkyrie Dive, Star Field, Zodiac Ascension, Meteor Shower, and the ultimate ORION.' });
  const U = PxKit.ult({ id: 'astra_ult', name: 'STARFALL', desc: 'A falling star the size of a mountain, then the whole sky behind it. Blockable. Must connect.', pose: 'cast_up', s: 48, dmg: 1150, color: '#b0c8ff', cutscene: (a, t) => csStarfall(a, t) });
  U.ev = PxKit.trackEv(U, { at: 48, r: 120, color: '#b0c8ff', start: f => { f.say('Not today.', 80); sfx('astHymn', 0, 2); }, fire: (f, x) => { meteors(f, [-2, -1, 1, 2].map(i => clamp(x + i * 110, 50, Arena.stage.width - 50)), 30, U, 2); Combat.addHazard({ kind: 'astMeteor', owner: f, side: f.side, x, r: 130, at: 6, dmg: 10, life: 34, move: U, big: true }); Cam.shake = 20; sfx('astNova'); } });
  PxKit.setUlt(def, U); def.transformCutscene = f => csArmor(f);

  const night = (x, t, k) => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#02030c'); g.addColorStop(1, `rgb(${lerp(18, 60, k) | 0},${lerp(26, 80, k) | 0},${lerp(60, 140, k) | 0})`); x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 110; i++) { x.globalAlpha = .4 + .6 * Math.abs(Math.sin(t + i)); x.fillStyle = i % 5 ? '#cfe0ff' : '#fff'; x.fillRect((i * 97) % W, (i * 53) % (H * .85), 3 + (i % 3), 3 + (i % 3)); } x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.fillStyle = '#080c1c'; x.fillRect(0, H - 90, W, 90); x.fillStyle = '#10163a'; x.fillRect(0, H - 90, W, 5); for (let i = 0; i < 8; i++) { x.fillStyle = '#0a1028'; x.fillRect(i * 180 + 20, H - 90 - 90 - (i % 3) * 40, 50, 180); } };
  function csArmor(f) {
    const fx = new ParticleSystem(1200), A = PxKit.actor(f.def);
    return { name: 'CONSTELLATION ARMOR', dur: 6.0, fx,
      cues: [[0, () => sfx('astStar')], [1.4, () => sfx('astHymn', 0, 2.6)], [2.8, () => { sfx('astWings'); sfx('astNova'); }]],
      draw(c, t) {
        const k = ease.inOut(seg(t, .8, 2.8)), gy = H - 90, sx = W / 2, sy = gy - 140;
        PxKit.scene(c, x => { night(x, t, k); x.globalCompositeOperation = 'lighter'; // stars fall out of the sky and settle on her limbs as plates, linked by light
          const pts = [[-60, -190], [60, -190], [-40, -110], [40, -110], [0, -60], [-70, -70], [70, -70], [0, -250]]; x.strokeStyle = `rgba(200,220,255,${.9 * k})`; x.lineWidth = 5; x.beginPath(); pts.forEach(([px_, py], i) => { const q = i / pts.length, s2 = Math.min(1, k * 1.6 - q * .6); if (s2 <= 0) return; const X = lerp(W * (.1 + (i * .12)), sx + px_ * 1.6, ease.out(s2)), Y = lerp(40 + i * 24, sy + py * 1.2 + 90, ease.out(s2)); i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.stroke(); x.globalCompositeOperation = 'source-over'; }, .3);
        A(c, sx, gy + 4 - k * 0, 3.0 + k * .2, t, t < 1.4 ? 'idle' : t < 2.8 ? 'charge' : 'victory', { transformed: t > 2.8 });
        if (t > 1.0 && t < 2.8) for (let i = 0; i < 4; i++) fx.add({ x: rand(0, W), y: -10, vx: (sx - 0) * 0 + rand(-60, 60), vy: rand(500, 900), life: 1, size: rand(4, 8), color: pick(['#fff', '#b0c8ff']), glow: true });
        fx.draw(c); caption(c, 'Every hero who fell is still a star.', t, .3, 2.7, '#e8f0ff'); flashAt(c, t, 2.75, 3.2, '#ffffff');
        titleSlam(c, 'CONSTELLATION ARMOR', 'STARS REMEMBER', t, 3.6, '#b0c8ff', 84);
      } };
  }
  function csStarfall(a, opp) {
    const fx = new ParticleSystem(2000), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    return { name: 'STARFALL', dur: 8.0, fx,
      cues: [[0, () => sfx('astHymn', 0, 2)], [2.2, () => sfx('riser', 2.2, .22, 0, 120, 2200)], [3.4, () => sfx('astMeteor', 0, 2)], [4.8, () => sfx('astNova')], [5.5, () => sfx('astImpact')], [5.9, () => sfx('astImpact', .1)]],
      draw(c, t) {
        const call = ease.inOut(seg(t, 1.6, 3.4)), fall = ease.in(seg(t, 3.4, 4.9)), hit = t - 4.9, gy = H - 90, ox = W * .7;
        PxKit.scene(c, x => { night(x, t, .5); x.globalCompositeOperation = 'lighter';
          // the star grows out of the sky and comes down, trailing a tail of lesser stars
          const sx = lerp(W * .3, ox, fall), sy = lerp(-200, gy - 20, fall), R = 30 + call * 100; if (hit < 0) { x.fillStyle = 'rgba(176,200,255,0.55)'; for (let i = 0; i < 30; i++) x.fillRect(sx - i * 20 * (1 - fall * .4), sy - i * 34, R * (1 - i / 34) * 1.6, 30); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(sx, sy, R, 0, 7); x.fill(); glowCircle(x, sx, sy, R * 3, 'rgba(176,200,255,0.5)', 'rgba(0,0,0,0)'); }
          else { glowCircle(x, ox, gy - 20, 700 * ease.out(Math.min(1, hit / .8)), `rgba(200,220,255,${.7 * (1 - Math.min(1, hit / 2))})`, 'rgba(0,0,0,0)'); for (let i = 0; i < 80; i++) { const sx = (i * 131 + t * 600) % W, sy = ((i * 53 + t * 700) % H); x.fillStyle = 'rgba(255,255,255,0.8)'; x.fillRect(sx, sy, 6, 30); } }
          x.globalCompositeOperation = 'source-over'; }, .3);
        A(c, W * .2, gy + 4, 2.8, t, t < 3.4 ? 'cast_up' : 'victory', { transformed: false });
        if (hit < .1) silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4, os, -1, { pose: 'block', anim: t, transformed: opp.transformed }), hit > 0 ? '#ffffff' : '#20306a'); else { const k = seg(hit, .1, 1.5); silhouette(c, o => { o.save(); o.translate(ox + k * 360, gy - k * 260 + k * k * 260); o.rotate(k * 7); drawCharAt(o, opp.def, 0, 0, os, -1, { pose: 'hurt_air', anim: t, transformed: opp.transformed }); o.restore(); }, '#20306a'); }
        if (hit > 0 && hit < .1) for (let i = 0; i < 50; i++) fx.add({ x: ox, y: gy - rand(0, 120), vx: rand(-800, 800), vy: rand(-900, -100), life: 1.3, size: rand(5, 12), color: pick(['#b0c8ff', '#fff']), glow: true, g: 700 });
        fx.draw(c); caption(c, 'The sky remembers every name.', t, .3, 3.2, '#e8f0ff'); flashAt(c, t, 4.85, 5.4, '#ffffff');
        if (t > 6.2) titleSlam(c, 'STARFALL', 'NOT TODAY', t, 6.3, '#b0c8ff', 118);
      } };
  }
  function csOrion(a, opp) {
    const fx = new ParticleSystem(2000), A = PxKit.actor(a.def), os = opp.transformed && opp.def.id === 'eric' ? 0.55 : 1.7;
    const pts = [[.18, .12], [.30, .24], [.42, .16], [.5, .34], [.42, .52], [.58, .5], [.7, .3], [.82, .18], [.62, .08], [.34, .6]];
    return { name: 'ORION', dur: 8.6, fx,
      cues: [[0, () => sfx('astHymn', 0, 3)], [1.2, () => sfx('astStar')], [2.6, () => sfx('astStar', .1)], [3.4, () => sfx('riser', 2.2, .24, 0, 200, 3000)], [5.4, () => { sfx('astNova'); sfx('astMeteor', 0, .8); }], [5.8, () => sfx('astImpact')]],
      draw(c, t) {
        const link = seg(t, 1.0, 3.6), draw2 = ease.inOut(seg(t, 3.2, 5.2)), shot = t - 5.4, gy = H - 90, ox = W * .74;
        PxKit.scene(c, x => { night(x, t, .7); x.globalCompositeOperation = 'lighter'; x.strokeStyle = 'rgba(210,225,255,0.9)'; x.lineWidth = 5; x.beginPath(); const n = Math.floor(link * pts.length); for (let i = 0; i < n; i++) { const [px_, py] = pts[i]; i ? x.lineTo(px_ * W, py * H) : x.moveTo(px_ * W, py * H); } x.stroke(); for (let i = 0; i < pts.length; i++) { if (i > n) break; x.fillStyle = '#fff'; x.fillRect(pts[i][0] * W - 8, pts[i][1] * H - 8, 16, 16); glowCircle(x, pts[i][0] * W, pts[i][1] * H, 30, 'rgba(176,200,255,0.5)', 'rgba(0,0,0,0)'); }
          // the bow: Orion's belt becomes the string, drawn back as the light gathers
          if (draw2 > 0) { x.strokeStyle = `rgba(255,255,255,${.5 + .5 * draw2})`; x.lineWidth = 8; x.beginPath(); x.moveTo(pts[7][0] * W, pts[7][1] * H); x.lineTo(lerp(pts[7][0] * W, pts[9][0] * W, draw2), lerp(pts[7][1] * H, pts[9][1] * H, draw2)); x.lineTo(pts[4][0] * W, pts[4][1] * H); x.stroke(); }
          if (shot > 0) { const sx = lerp(pts[9][0] * W, ox, ease.in(Math.min(1, shot / .4))), sy = lerp(pts[9][1] * H, gy - 40, ease.in(Math.min(1, shot / .4))); x.fillStyle = '#fff'; x.fillRect(Math.min(sx, ox) - 40, Math.min(sy, gy) - 40, 80, 80); x.strokeStyle = '#fff'; x.lineWidth = 16; x.beginPath(); x.moveTo(pts[9][0] * W, pts[9][1] * H); x.lineTo(sx, sy); x.stroke(); glowCircle(x, ox, gy - 40, 600 * ease.out(Math.min(1, Math.max(0, shot - .3) / .8)), `rgba(200,220,255,${.7 * (1 - Math.min(1, shot / 2))})`, 'rgba(0,0,0,0)'); }
          x.globalCompositeOperation = 'source-over'; }, .3);
        A(c, W * .2, gy + 4, 2.8, t, t < 5.4 ? 'cast_up' : 'victory', { transformed: true });
        if (shot < .5) silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4, os, -1, { pose: draw2 > .6 ? 'stun' : 'block', anim: t, transformed: opp.transformed }), shot > .35 ? '#ffffff' : '#20306a'); else silhouette(c, o => drawCharAt(o, opp.def, ox, gy + 4 + Math.min(40, (shot - .5) * 80), os, -1, { pose: 'kneel', anim: t, transformed: opp.transformed }), '#20306a');
        if (shot > .4 && shot < .5) for (let i = 0; i < 50; i++) fx.add({ x: ox, y: gy - rand(0, 160), vx: rand(-800, 800), vy: rand(-900, -100), life: 1.3, size: rand(5, 12), color: pick(['#b0c8ff', '#fff']), glow: true, g: 700 });
        fx.draw(c); caption(c, 'Orion, lend me your bow.', t, .3, 3.2, '#e8f0ff'); flashAt(c, t, 5.7, 6.2, '#ffffff');
        if (t > 6.5) titleSlam(c, 'ORION', 'ONE ARROW. THE WHOLE SKY.', t, 6.6, '#e8f0ff', 124);
      } };
  }
})();
