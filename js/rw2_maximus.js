// ============================================================
//  MOONKAI — MAXIMUS, the Last Bulwark. Pixel remake + a real kit.
//
//  STARLIGHT (new gauge)  every blocked hit and every reflected shot charges it. At 100 his next shield move RADIATES: it
//                         heals him for 8% and blasts the foe back.
//  AEGIS (passive)        blocking fills his meter twice as fast; no chip damage (as before).
//  CELESTIAL PALADIN      CONSTELLATION THROW (5S) a shield that ricochets between foe and wall three times,
//                         PALADIN'S CHARGE (6S) armored, bounces them off the wall, AEGIS REFLECT (2S) reflects and heals,
//                         HALO OF LIGHT (4S) a barrier that burns what touches it, COMET STRIKE (jS).
//  CONSTELLATION (form ult)   the constellations come down as spears of light.   AEGIS OF STARS & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('maximus');
  Object.assign(Sfx, {
    mxClang(d = 0) { this.fm({ f: 520, ratio: 2.5, index: 260, dur: .7, vol: .2, delay: d, wet: .5 }); this.nsweep({ f0: 5000, f1: 1500, dur: .1, vol: .14, delay: d }); },
    mxChime(d = 0) { this.run({ notes: [523, 659, 784, 1047, 1319], step: .08, dur: 1, vol: .1, bell: true, delay: d, wet: .9 }); },
    mxFlare(d = 0) { this.nsweep({ f0: 500, f1: 4000, dur: .5, vol: .2, q: 1, delay: d, wet: .6 }); this.mxChime(d); this.sub({ f: 90, to: 40, dur: .5, vol: .3, delay: d }); },
    mxSpear(d = 0) { this.nsweep({ f0: 2000, f1: 9000, dur: .14, vol: .16, type: 'bandpass', q: 2, delay: d }); this.fm({ f: 1320, ratio: 2, index: 120, dur: .4, vol: .08, delay: d, wet: .6 }); },
    mxHorn(d = 0, dur = 2) { this.chord({ notes: [131, 196, 262, 330], dur, vol: .22, type: 'sawtooth', lp: 1200, delay: d, wet: .8, det: 10 }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { if (v.transformed || (v.gauge || 0) >= 100) { const t = v.anim || 0; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const a = t * 2 + i * 1.256; c.fillStyle = i % 2 ? 'rgba(255,230,140,.9)' : 'rgba(255,255,255,.9)'; c.fillRect(Math.round(P.sh[0] + Math.cos(a) * 46), Math.round(P.sh[1] + 10 + Math.sin(a) * 40), 5, 5); } c.restore(); } } });
  const star = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };
  const radiant = f => { if ((f.gauge || 0) < 100) return false; f.gauge = 0; Combat.healSelf(f, Math.round(f.maxHp * .08)); const t = f.opp; if (t && Math.abs(t.x - f.x) < 360) { t.vx = Math.sign(t.x - f.x) * 800; t.status.stun = Math.max(t.status.stun || 0, .5); } Game.popWorld(f.x, f.y - f.h - 40, 'RADIANT', '#ffe08a', 26); sfx('mxFlare'); Cam.shake = 8; return true; };
  Rw2.merge(def, {
    gauge: { name: 'STARLIGHT', max: 100, color: '#ffd35a', label: f => ((f.gauge || 0) >= 100 ? '· RADIANT' : '') },
    passive: ['Aegis', 'Blocking fills his meter twice as fast and takes no chip. Every block charges STARLIGHT; at 100 his next shield move radiates: heals 8% and blasts the foe back.'],
    onRoundStart: f => { f.gauge = 0; },
    onHurt: (t, a, dmg) => { if (t.state === 'block' || t.state === 'cblock') star(t, 14); },
  });
  Combat.hz.mxHalo = function (h) { const f = h.owner; if (!f || f.state === 'ko') return false; for (const p of Combat.projectiles) if (p.side !== f.side && Math.abs(p.x - h.x) < h.r && Math.abs(p.y + 90) < 130) { p.life = 0; star(f, 10); sfx('mxClang'); } for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r * .85 && e.y > -200 && h.t % 20 === 10) Combat.resolveHit(e, f, H_({ dmg: 24, guard: 'mid', hs: 8, kb: [Math.sign(e.x - h.x || 1) * 220, -80], sfx: 'm' }), { proj: true, fromX: h.x }); return h.t < h.life; };
  Combat.drawHz.mxHalo = (c, h) => { const k = Math.min(1, h.t / 10, (h.life - h.t) / 14); c.save(); c.globalAlpha = k; c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,224,138,.9)'; c.lineWidth = 4; c.beginPath(); c.ellipse(h.x, -90, h.r * .5, 120, 0, 0, 7); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(h.x, -90, h.r * .38, 100, 0, 0, 7); c.stroke(); glowCircle(c, h.x, -90, h.r * .8, 'rgba(255,224,138,0.16)', 'rgba(0,0,0,0)'); c.restore(); };

  PxKit.setMove(def, '2S', Object.assign(Mv.counter({ name: 'Aegis Guard', desc: 'Reflect stance. A counter reflects projectiles, charges STARLIGHT; a full gauge makes it RADIANT.', window: 28, dmg: 100, resp: 'reflect' }), { onHit: a => { star(a, 30); radiant(a); }, ev: { 2: () => sfx('mxClang') } }));
  const F5 = mk({ name: 'Constellation Throw', desc: 'Celestial Paladin: a star shield that ricochets between the foe and the wall three times.', pose: 'throw', s: 12, a: 1, r: 24, cd: 3, ai: { min: 120, max: 1100, use: 'zone' }, ev: { 12: f => { const t = f.opp; let n = 0; const throwOnce = (from) => { Combat.fireShots(f, { speed: 1100, r: 15, dmg: 52, kind: 'orb', color: '#ffe08a', core: '#fff', pierce: true, life: .55, kb: [180, -80] }); sfx('mxSpear'); if (++n < 3) Game.later(.38, () => { if (f.state !== 'ko') { f.facing *= 1; throwOnce(); } }); }; throwOnce(); radiant(f); } } });
  const F6 = Mv.rush({ name: "Paladin's Charge", desc: 'Celestial Paladin: an armored charge in a wake of light; the foe bounces off the wall.', s: 8, speed: 1200, frames: 20, armor: [1, 28], hit: { dmg: 110, kb: [680, -240], wb: true }, ev: { 1: () => sfx('mxHorn', 0, .8) }, onHit: a => { star(a, 12); radiant(a); } });
  const F4 = mk({ name: 'Halo of Light', desc: 'Celestial Paladin: a halo of light for 5s. It eats projectiles, burns what touches it, and charges STARLIGHT.', pose: 'cast_up', s: 12, a: 1, r: 20, cd: 7, ai: { min: 0, max: 500, use: 'buff' }, ev: { 12: f => { Combat.hazards.filter(h => h.kind === 'mxHalo' && h.owner === f).forEach(h => h.life = 0); Combat.addHazard({ kind: 'mxHalo', owner: f, side: f.side, x: f.x + f.facing * 110, r: 130, life: 300 }); sfx('mxChime'); } } });
  const F2 = Object.assign(Mv.counter({ name: 'Aegis Reflect', desc: 'Celestial Paladin: a longer reflect stance that heals 4% and throws the attack back as light.', window: 34, dmg: 130, resp: 'reflect' }), { onHit: a => { Combat.healSelf(a, Math.round(a.maxHp * .04)); star(a, 40); radiant(a); Combat.fireShots(a, { speed: 1200, r: 16, dmg: 70, kind: 'orb', color: '#ffe08a', core: '#fff', pierce: true }); sfx('mxFlare'); }, ev: { 2: () => sfx('mxClang') } });
  const FJ = Mv.dive({ name: 'Comet Strike', desc: 'Celestial Paladin: sword-first, trailing light; the landing sends a star along the floor each way.', vx: 500, vy: 1800, hit: { dmg: 108, gb: true }, ev: { 1: () => sfx('mxSpear') }, onHit: a => { for (const s of [-1, 1]) Combat.fireShots(a, { speed: 800 * s, r: 14, dmg: 40, kind: 'orb', color: '#ffe08a', life: .5, pierce: true, offY: 40 }); star(a, 10); radiant(a); } });
  const FU = PxKit.ult({ id: 'maximus_fult', name: 'CONSTELLATION', desc: 'Celestial Paladin: the constellations descend as spears of light, one for every star he has ever stood beneath. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1280, color: '#ffe08a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'CONSTELLATION', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#ffe08a', c2: '#ffffff', c3: '#0a1040', motif: 'barrage', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Every star is a promise.', cap2: 'I keep mine.', title: 'CONSTELLATION', sub: 'THE SKY KEEPS ITS WORD', size: 100,
      cues: [[0, () => sfx('mxHorn', 0, 2)], [1.4, () => sfx('mxChime')], [5.4, () => { for (let i = 0; i < 8; i++) sfx('mxSpear', i * .07); sfx('mxFlare'); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#030618', bot: '#1c2a78', stars: '#ffe9a8', moon: { x: .5, y: .22, r: 60, col: '#fff4c0' }, ruins: '#0a1030', rays: '#ffe08a' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 54, w: 880, h: 340, back: 400, start: f => { f.say('Stand beneath me.', 90); sfx('mxHorn', 0, 1.6); }, fire: f => { for (let i = 0; i < 9; i++) Game.later(i * .05, () => { const x = clamp(f.x + f.facing * (-100 + i * 110), 30, Arena.stage.width - 30); Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x, r: 34, life: 20, color: '#ffe08a' }); sfx('mxSpear'); }); Cam.shake = 16; sfx('mxFlare'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Star armor: super armor, radiant sword. New moveset: Constellation Throw, Paladin\'s Charge, Aegis Reflect, Halo of Light, Comet Strike, and the ultimate CONSTELLATION.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'AEGIS OF STARS', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#ffe08a', c2: '#ffffff', c3: '#0a1040', motif: 'beam', pose: ['idle', 'cast_up', 'cast', 'victory'], cap1: 'Hold the line.', cap2: 'The stars hold it with me.', title: 'AEGIS OF STARS', sub: 'NOTHING PASSES', size: 96,
    cues: [[0, () => sfx('mxClang')], [1.4, () => sfx('mxHorn', 0, 1.8)], [4.8, () => { sfx('mxFlare'); sfx('mxChime', .2); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#030618', bot: '#1c2a78', stars: '#ffe9a8', ruins: '#0a1030', rays: '#ffe08a' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'CELESTIAL PALADIN', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#ffe08a', c2: '#ffffff', c3: '#0a1040', motif: 'rain', shape: 'rect', pose: ['idle', 'cast_up', 'victory'], lift: 20, cap1: 'A shield is a vow.', cap2: 'Mine reaches the sky.', title: 'CELESTIAL PALADIN', sub: 'MAXIMUS', size: 94,
    cues: [[0, () => sfx('mxClang')], [1.4, () => sfx('mxHorn', 0, 2)], [3.9, () => { sfx('mxFlare'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#030618', bot: '#1c2a78', stars: '#ffe9a8', rays: '#ffe08a' }, k) });
})();
