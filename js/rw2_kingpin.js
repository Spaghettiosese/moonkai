// ============================================================
//  MOONKAI — KINGPIN, the Don. Pixel remake + a real kit.
//
//  CASH (new gauge)  every hit and every point of meter he steals pays out. CALL THE BOYS spends 30 CASH for a bigger squad; at 100
//                    his goons hit twice as hard for 6s (a PAYDAY).
//  BRIBE (passive)   his hits steal meter from the foe (as before).
//  DON OF THE CITY   GOLD CANE VOLLEY (5S) the cane fires six gold slugs, HIT SQUAD (6S) four goons in formation, MILLION DOLLAR RAIN (2S)
//                    bills that stun the greedy, FINAL OFFER (4S) a grab that robs a whole bar, GOLDEN LANDING (jS).  CITY HALL (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('kingpin');
  Object.assign(Sfx, {
    kpCoin(d = 0) { this.fm({ f: 1568, ratio: 3, index: 40, dur: .5, vol: .1, delay: d, wet: .6 }); this.fm({ f: 2093, ratio: 3, index: 40, dur: .6, vol: .08, delay: d + .06, wet: .6 }); },
    kpShot(d = 0) { this.nsweep({ f0: 4000, f1: 300, dur: .12, vol: .28, type: 'lowpass', delay: d }); this.impact(.5, d); },
    kpCash(d = 0, n = 10) { for (let i = 0; i < n; i++) this.nsweep({ f0: 5000, f1: 9000, dur: .05, vol: .06, type: 'highpass', delay: d + i * .05 }); },
    kpCigar(d = 0) { this.voice({ f: 110, to: 95, dur: 1.2, vol: .14, type: 'sawtooth', lp: 400, delay: d, wet: .3 }); },
    kpJazz(d = 0, dur = 3) { this.chord({ notes: [147, 175, 220, 262], dur, vol: .18, type: 'sine', delay: d, wet: .8 }); this.run({ notes: [392, 440, 523, 466, 392], step: .3, dur: 1.6, vol: .08, type: 'sine', delay: d + .2, wet: .8 }); },
    kpGavel(d = 0) { this.impact(1, d); this.fm({ f: 200, ratio: 2, index: 120, dur: .5, vol: .2, delay: d }); },
  });
  PxModel.install(def, {});
  const cash = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (f.gauge >= 100 && !(f.payT > 0)) { f.gauge = 0; f.payT = 6 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'PAYDAY', '#5aba5a', 26); sfx('kpCash', 0, 14); sfx('kpCoin'); } };
  Rw2.merge(def, {
    gauge: { name: 'CASH', max: 100, color: '#5aba5a', label: f => (f.payT > 0 ? '· PAYDAY' : '') },
    passive: ['Bribe', 'His hits steal meter from the enemy. Hits and stolen meter pay CASH; Call the Boys spends 30 for a bigger squad. At 100: PAYDAY, 6s of double-damage goons.'],
    onRoundStart: f => { f.gauge = 0; f.payT = 0; },
    onHit: (a, t, dmg) => { cash(a, 3); if (t.side && a.side) { const s = Math.min(t.side.meter, 8); if (s > 0) { t.side.meter -= s; a.side.meter += s; cash(a, s * .6); } } },
    passiveTick: f => { if (f.payT > 0) f.payT--; },
  });
  PxKit.setMove(def, '6S', mk({ name: 'Call the Boys', desc: 'A goon charges in. With 30 CASH: three goons. During PAYDAY they hit twice as hard.', pose: 'cast', s: 12, a: 1, r: 18, cd: 3, ai: { min: 100, max: 800, use: 'trap' }, ev: { 3: () => sfx('kpCigar'), 12: f => { const big = (f.gauge || 0) >= 30; if (big) f.gauge -= 30; const pay = f.payT > 0; Combat.place(f, { kind: 'minion', at: 'front', dx: 60, look: 'skeleton', dmg: pay ? 110 : 60, hp: 90, speed: 340, color: '#5aba5a', count: big ? 3 : 1, spacing: 60, stagger: 6 }); sfx('kpCash'); } } }));
  Combat.hz.kpRain = function (h) { const f = h.owner; if (!f) return false; if (h.t % 16 === 8) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r && e.y > -40) { e.status.stun = Math.max(e.status.stun || 0, .35); Combat.resolveHit(e, f, H_({ dmg: 18, guard: 'mid', hs: 6, kb: [0, 0], sfx: 'l' }), { proj: true, fromX: h.x }); cash(f, 2); sfx('kpCoin'); } return h.t < h.life; };
  Combat.drawHz.kpRain = (c, h) => { const k = Math.min(1, h.t / 10, (h.life - h.t) / 16); c.save(); c.globalAlpha = k; for (let i = 0; i < 28; i++) { const x = h.x - h.r + ((i * 41) % (h.r * 2)), y = -((i * 37 + h.t * 6) % 280) + 0; c.save(); c.translate(x, -280 + ((i * 37 + h.t * 6) % 280)); c.rotate(Math.sin(h.t * .1 + i) * .5); c.fillStyle = i % 4 ? '#7ada7a' : '#ffd35a'; c.strokeStyle = '#1a4a1a'; c.lineWidth = 1; c.fillRect(-9, -5, 18, 10); c.strokeRect(-9, -5, 18, 10); c.restore(); } c.restore(); };

  const F5 = Mv.shot({ name: 'Gold Cane Volley', desc: 'Don of the City: the cane fires six gold slugs in a quick fan. Every hit pays.', proj: { speed: 1400, r: 8, dmg: 28, count: 6, spread: .5, kind: 'bullet', color: '#ffd35a', core: '#fff', life: 1, onHit: (t, p) => cash(p.owner, 3) }, ev: { 3: () => sfx('kpShot'), 12: () => sfx('kpShot', .05) } });
  const F6 = Mv.place({ name: 'Hit Squad', desc: 'Don of the City: four goons in formation, one after another, armed and paid.', s: 14, spawn: { kind: 'minion', at: 'front', dx: 50, look: 'skeleton', dmg: 76, hp: 120, speed: 360, color: '#ffd35a', count: 4, spacing: 60, stagger: 6 }, cd: 8, ev: { 3: () => sfx('kpCigar'), 14: () => sfx('kpCash', 0, 10) } });
  const F2 = mk({ name: 'Million Dollar Rain', desc: 'Don of the City: a shower of bills over the foe for 4s. They stop to pick them up: stunned in little bursts.', pose: 'cast_up', s: 16, a: 1, r: 24, cd: 7, ai: { min: 100, max: 1000, use: 'zone' }, ev: { 16: f => { const t = f.opp; if (!t) return; Combat.addHazard({ kind: 'kpRain', owner: f, side: f.side, x: clamp(t.x, 120, Arena.stage.width - 120), r: 150, life: 240 }); sfx('kpCash', 0, 16); } } });
  const F4 = Object.assign(Mv.grab({ name: 'Final Offer', desc: 'Don of the City: a grab they cannot refuse. It robs the foe of a whole bar of meter.', range: 80, s: 8, grabData: { anim: 'drain', dmg: 200, frames: 40 }, ev: { 3: () => sfx('kpCigar') } }), { onHit: (a, t) => { const s = Math.min(t.side.meter, 100); t.side.meter -= s; a.side.meter += s; cash(a, 25); Game.popWorld(t.x, t.y - t.h - 40, 'ROBBED -' + Math.round(s), '#5aba5a', 22); sfx('kpCoin'); } });
  const FJ = Mv.dive({ name: 'Golden Landing', desc: 'Don of the City: a crushing belly drop that scatters coins on impact.', vx: 260, vy: 1500, hit: { dmg: 112, gb: true }, ev: { 1: () => sfx('kpCigar') }, onHit: a => { Combat.fireShots(a, { speed: 500, r: 7, dmg: 24, count: 10, spread: 6.28, kind: 'bullet', color: '#ffd35a', life: .5 }); cash(a, 8); sfx('kpCoin'); } });
  const FU = PxKit.ult({ id: 'kingpin_fult', name: 'CITY HALL', desc: 'Don of the City: the whole city council arrives, and every vote goes his way. Blockable. Must connect.', pose: 'cast', s: 50, dmg: 1280, color: '#5aba5a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'CITY HALL', dur: 8.4, tc: [1.0, 4.4], tf: 5.2, c1: '#5aba5a', c2: '#ffd35a', c3: '#0a140a', motif: 'barrage', pose: ['idle', 'cast', 'cast', 'victory'], actorForm: true, cap1: 'I do not break laws.', cap2: 'I employ the people who write them.', title: 'CITY HALL', sub: 'MOTION CARRIED', size: 100,
      cues: [[0, () => sfx('kpJazz', 0, 3)], [1.4, () => sfx('kpCash', 0, 16)], [5.2, () => { sfx('kpGavel'); sfx('kpShot'); sfx('kpShot', .1); sfx('kpCoin', .2); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a140a', bot: '#2a5a2a', city: '#0a1a0a', lit: .8, pillars: '#14281a', rays: '#ffd890' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 50, w: 900, h: 340, back: 400, start: f => { f.say('All in favor.', 90); sfx('kpJazz'); }, fire: f => { Combat.place(f, { kind: 'minion', at: 'front', dx: 60, look: 'skeleton', dmg: 90, hp: 100, speed: 420, color: '#5aba5a', count: 6, spacing: 80, stagger: 3 }); const t = f.opp; if (t) { const s = Math.min(t.side.meter, 100); t.side.meter -= s; f.side.meter += s; } Cam.shake = 18; sfx('kpGavel'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Gold suit: armor, stronger goons. New moveset: Gold Cane Volley, Hit Squad, Million Dollar Rain, Final Offer, Golden Landing, and the ultimate CITY HALL.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'HOSTILE TAKEOVER', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#5aba5a', c2: '#ffd35a', c3: '#0a140a', motif: 'rush', pose: ['idle', 'cast', 'throw', 'victory'], cap1: 'Let us shake on it.', cap2: 'You do not own that anymore.', title: 'HOSTILE TAKEOVER', sub: 'PAPERWORK PENDING', size: 92,
    cues: [[0, () => sfx('kpJazz')], [1.4, () => sfx('kpCigar')], [4.8, () => { sfx('kpGavel'); sfx('kpCash', 0, 10); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a140a', bot: '#2a4a2a', city: '#0a1a0a', lit: .7, rays: '#ffd890' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'DON OF THE CITY', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#ffd35a', c2: '#5aba5a', c3: '#0a140a', motif: 'rain', shape: 'rect', pose: ['idle', 'cast', 'victory'], lift: 0, cap1: 'Business is up.', cap2: 'So is the suit.', title: 'DON OF THE CITY', sub: 'KINGPIN', size: 100,
    cues: [[0, () => sfx('kpJazz', 0, 2.4)], [1.4, () => sfx('kpCash', 0, 16)], [3.7, () => { sfx('kpCoin'); sfx('kpGavel'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#0a140a', bot: '#2a5a2a', city: '#0a1a0a', lit: .8, rays: '#ffd890' }, k) });
})();
