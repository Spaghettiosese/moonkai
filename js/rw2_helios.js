// ============================================================
//  MOONKAI — HELIOS, the Midday King. Pixel remake + a real kit.
//
//  HEAT (new gauge)  every attack builds HEAT; at 100 his next special is a SOLAR FLARE: double damage and it sets the foe alight.
//                    Heat bleeds away at rest. (This replaces the old hidden counter.)
//  SUPERNOVA GOD     CORONA VOLLEY (5S) five suns in an arc, SOLAR LANCE (6S) a long ray that sweeps, DAYBREAK (2S) a rising pillar of light,
//                    ECLIPSE VEIL (4S) heat haze that blinds and burns, FALLING STAR (jS).   SUPERNOVA (form ult)  he outshines the stage.
//  SOLAR GENESIS & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('helios');
  Object.assign(Sfx, {
    heFlare(d = 0) { this.nsweep({ f0: 400, f1: 6000, dur: .4, vol: .22, q: 1, delay: d, wet: .5 }); this.sub({ f: 110, to: 44, dur: .4, vol: .3, delay: d }); },
    heRay(d = 0, dur = 1) { this.voice({ f: 180, to: 540, dur, vol: .14, type: 'sawtooth', lp: 2800, delay: d, wet: .4 }); this.nsweep({ f0: 800, f1: 5000, dur, vol: .12, delay: d, wet: .5 }); },
    heChoir(d = 0) { this.chord({ notes: [262, 330, 392, 523], dur: 2.6, vol: .22, type: 'sawtooth', lp: 1800, delay: d, wet: .9, det: 14 }); this.run({ notes: [1047, 1319, 1568, 2093], step: .12, dur: .9, vol: .08, bell: true, delay: d + .3, wet: .9 }); },
    heBoom(d = 0) { this.impact(1, d); this.heFlare(d); this.sub({ f: 60, to: 24, dur: 1, vol: .5, delay: d }); },
    heShimmer(d = 0) { this.run({ notes: [1568, 1760, 2093, 2349], step: .05, dur: .5, vol: .07, bell: true, delay: d, wet: .8 }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const t = v.anim || 0, hot = (v.gauge || 0) >= 100 || v.transformed; if (hot) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const a = t * 2.6 + i * .785; c.fillStyle = i % 2 ? 'rgba(255,230,120,.9)' : 'rgba(255,150,40,.9)'; c.fillRect(Math.round(P.sh[0] + Math.cos(a) * 40), Math.round(P.sh[1] + 20 + Math.sin(a) * 50), 5, 5); } glowCircle(c, P.sh[0], P.sh[1] + 10, 60, 'rgba(255,200,80,.28)', 'rgba(0,0,0,0)'); c.restore(); } } });
  const heat = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };
  def.onHit = null; def.passiveDmg = null; // the old hidden heat counter is replaced by the HEAT gauge
  Rw2.merge(def, {
    gauge: { name: 'HEAT', max: 100, color: '#ffb020', label: f => ((f.gauge || 0) >= 100 ? '· SOLAR FLARE READY' : '') },
    passive: ['Solar Flare', 'Attacks build HEAT. At 100 his next special is a SOLAR FLARE: double damage and it sets the foe alight. HEAT cools at rest.'],
    onRoundStart: f => { f.gauge = 0; },
    onHit: (a, t, dmg) => { if (a.move && a.move.kind === 'special' && (a.gauge || 0) >= 100) { a.gauge = 0; t.status.burn = 4; Game.popWorld(a.x, a.y - a.h - 40, 'SOLAR FLARE', '#ffb020', 26); sfx('heFlare'); } else heat(a, 4); },
    passiveDmg: (f, t) => ((f.gauge || 0) >= 100 && f.move && f.move.kind === 'special' ? 2 : 1),
    passiveTick: f => { if (!f.move && f.st % 12 === 0) f.gauge = Math.max(0, (f.gauge || 0) - 1); },
  });
  Combat.hz.heSweep = function (h) { const f = h.owner; if (!f || f.state === 'ko') return false; const a = h.a0 + (h.a1 - h.a0) * (h.t / h.life), ex = f.x + Math.cos(a) * 1300 * f.facing, ey = f.y - 110 + Math.sin(a) * 1300; if (h.t % 4 === 2) for (const e of Combat.targets(f.side)) { const [cx, cy] = e.center(); const dx = cx - (f.x), dy = cy - (f.y - 110); const proj = (dx * Math.cos(a) * f.facing + dy * Math.sin(a)); const perp = Math.abs(-dx * Math.sin(a) * f.facing + dy * Math.cos(a) * 1); if (proj > 0 && proj < 1300 && perp < 44) Combat.resolveHit(e, f, H_({ dmg: 26, guard: 'mid', hs: 8, kb: [160, -60], sfx: 'm', status: { burn: 1 } }), { proj: true, fromX: f.x }); } return h.t < h.life; };
  Combat.drawHz.heSweep = (c, h) => { const f = h.owner; if (!f) return; const a = h.a0 + (h.a1 - h.a0) * (h.t / h.life), ox = f.x, oy = f.y - 110; c.save(); c.globalCompositeOperation = 'lighter'; for (const [w, col] of [[44, 'rgba(255,150,40,.35)'], [22, 'rgba(255,210,100,.7)'], [8, 'rgba(255,255,255,.95)']]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(a) * 1300 * f.facing, oy + Math.sin(a) * 1300); c.stroke(); } c.restore(); };
  Combat.hz.heHaze = function (h) { const f = h.owner; if (!f) return false; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r && e.y > -200) { e.status.slow = Math.max(e.status.slow || 0, .3); if (h.t % 30 === 15) Combat.resolveHit(e, f, H_({ dmg: 20, guard: 'mid', hs: 6, kb: [0, 0], sfx: 'l', status: { burn: 2 } }), { proj: true, fromX: h.x }); } return h.t < h.life; };
  Combat.drawHz.heHaze = (c, h) => { const k = Math.min(1, h.t / 14, (h.life - h.t) / 20); c.save(); c.globalAlpha = k * .8; c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const x = h.x - h.r + ((i * 53) % (h.r * 2)), y = -((i * 29 + h.t * 2) % 200); c.fillStyle = i % 2 ? 'rgba(255,180,60,.6)' : 'rgba(255,255,200,.6)'; c.fillRect(Math.round(x / 3) * 3 + Math.sin(h.t * .2 + i) * 5, Math.round(y / 3) * 3, 14, 3); } glowCircle(c, h.x, -60, h.r, 'rgba(255,170,50,0.16)', 'rgba(0,0,0,0)'); c.restore(); };

  const F5 = Mv.shot({ name: 'Corona Volley', desc: 'Supernova God: five small suns in a high arc, each leaving a burning patch where it lands.', proj: { speed: 700, angle: -.5, spread: .9, count: 5, g: 800, r: 13, dmg: 44, kind: 'fire', color: '#ffb020', core: '#fff', explode: 60, status: { burn: 2 } }, ev: { 3: () => sfx('heShimmer'), 12: () => sfx('heFlare') } });
  const F6 = mk({ name: 'Solar Lance', desc: 'Supernova God: a long ray from the palm that sweeps from the ground up to the sky.', pose: 'cast', s: 18, a: 40, r: 24, cd: 4, ai: { min: 100, max: 1300, use: 'zone' }, ev: { 3: () => sfx('heShimmer'), 18: f => { Combat.addHazard({ kind: 'heSweep', owner: f, side: f.side, life: 40, a0: .45, a1: -.45 }); sfx('heRay'); Cam.shake = 6; } } });
  const F2 = mk({ name: 'Daybreak', desc: 'Supernova God: a rising pillar of light under the foe, then a second, wider one.', pose: 'cast_up', s: 18, a: 1, r: 26, cd: 5, ai: { min: 80, max: 900, use: 'zone' }, ev: { 18: f => { const t = f.opp; if (!t) return; Rw2.pillar(f, t.x, { r: 60, life: 18, color: '#ffd35a', dmg: 70, status: { burn: 2 }, move: F2, shake: 6 }); Rw2.pillar(f, t.x, { r: 120, life: 36, color: '#fff3c0', dmg: 50, status: { burn: 2 }, move: F2, shake: 8, giant: true }); sfx('heFlare'); sfx('heBoom', .5); } } });
  const F4 = mk({ name: 'Eclipse Veil', desc: 'Supernova God: heat haze around her for 5s. It slows and burns anyone inside, and hides her flanks.', pose: 'cast_up', s: 12, a: 1, r: 20, cd: 8, ai: { min: 0, max: 400, use: 'buff' }, ev: { 12: f => { Combat.addHazard({ kind: 'heHaze', owner: f, side: f.side, x: f.x, r: 280, life: 300 }); sfx('heShimmer'); } } });
  const FJ = Mv.dive({ name: 'Falling Star', desc: 'Supernova God: dives as a comet; the landing is a small supernova.', vx: 360, vy: 1800, hit: { dmg: 104, gb: true, status: { burn: 3 } }, ev: { 1: () => sfx('heRay', 0, .5) }, onHit: a => { Combat.explode(a.x, -30, 150, a, 50, '#ffd35a'); sfx('heBoom'); } });
  const FU = PxKit.ult({ id: 'helios_fult', name: 'SUPERNOVA', desc: 'Supernova God: he stops holding back. A star unfolds around him and the stage goes white. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1320, color: '#ffd35a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'SUPERNOVA', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#ffd35a', c2: '#ffffff', c3: '#3a1000', motif: 'shockwave', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'The dawn had a temper.', cap2: 'Here is the noon.', title: 'SUPERNOVA', sub: 'EVERYTHING IS DAY', size: 110, flash: '#ffffff',
      cues: [[0, () => sfx('heChoir')], [1.4, () => sfx('heRay', 0, 3)], [5.4, () => { sfx('heBoom'); sfx('heFlare', .3); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#2a0800', bot: '#c8601a', sun: { x: .5, y: .3, r: 70 + k * 260, col: '#fff0a0' }, rays: '#ffd890', embers: '#ffb020' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 54, w: 1100, h: 360, back: 500, start: f => { f.say('Noon.', 90); sfx('heChoir'); }, fire: f => { for (const e of Combat.targets(f.side)) e.status.burn = 6; Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: f.x, r: 400, life: 40, color: '#fff0a0', giant: true }); Cam.shake = 26; sfx('heBoom'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'TIMED (10s). Blinding power: everything burns. New moveset: Corona Volley, Solar Lance, Daybreak, Eclipse Veil, Falling Star, and the ultimate SUPERNOVA.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'SOLAR GENESIS', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#ffb020', c2: '#ffffff', c3: '#3a1000', motif: 'beam', pose: ['idle', 'cast_up', 'cast', 'victory'], cap1: 'Every star started as an idea.', cap2: 'Mine is you.', title: 'SOLAR GENESIS', sub: 'A STAR IS BORN', size: 98,
    cues: [[0, () => sfx('heShimmer')], [1.4, () => sfx('heChoir')], [4.8, () => { sfx('heRay', 0, 2); sfx('heBoom'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#2a0800', bot: '#a84a10', sun: { x: .7, y: .26, r: 60 + k * 150, col: '#ffe090' }, rays: '#ffd890', embers: '#ffb020' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'SUPERNOVA GOD', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#ffd35a', c2: '#ffffff', c3: '#3a1000', motif: 'implode', pose: ['idle', 'cast_up', 'victory'], lift: 50, cap1: 'Bright things burn out.', cap2: 'Unless they are the reason it is bright.', title: 'SUPERNOVA GOD', sub: 'HELIOS', size: 100, flash: '#ffffff',
    cues: [[0, () => sfx('heShimmer')], [1.4, () => sfx('heChoir')], [3.9, () => { sfx('heBoom'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#2a0800', bot: '#a84a10', sun: { x: .5, y: .3, r: 50 + k * 170, col: '#fff0a0' }, rays: '#ffd890' }, k) });
})();
