// ============================================================
//  MOONKAI — ARACHNA, the Silk Queen. Pixel remake + a real kit.
//
//  VENOM (passive)  hits poison; a SNARED foe (caught in a web) takes double poison.
//  BROOD (new gauge) EGGS: every web she lays stores an egg; at 100 EGGS her next Brood hatches a swarm of six.
//  BROOD QUEEN      SPIDERLING VOLLEY (5S) six homing spiderlings, SILK LUNGE (6S) a line that yanks and bites,
//                   EGG SAC (2S) hatches into three spiders after 2s, COCOON (4S) wraps the foe and holds them,
//                   POUNCE (jS) descends on a thread and bites.
//  MATRIARCH'S FEAST (form ult)   the whole stage becomes her web.     WEB OF DOOM & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('arachna');
  Object.assign(Sfx, {
    arSkitter(d = 0, n = 10) { for (let i = 0; i < n; i++) this.nsweep({ f0: 4000 + (i % 3) * 800, f1: 7000, dur: .04, vol: .08, type: 'bandpass', q: 3, delay: d + i * .045 }); },
    arSpin(d = 0, dur = .5) { this.nsweep({ f0: 2000, f1: 8000, dur, vol: .12, q: 2, delay: d, wet: .4 }); this.voice({ f: 1400, to: 2400, dur, vol: .04, type: 'triangle', delay: d }); },
    arBite(d = 0) { this.nsweep({ f0: 1800, f1: 400, dur: .16, vol: .22, type: 'bandpass', q: 2, delay: d }); this.fm({ f: 190, ratio: 2.3, index: 140, dur: .2, vol: .1, delay: d }); },
    arHiss(d = 0, dur = .9) { this.nsweep({ f0: 6000, f1: 3000, dur, vol: .14, type: 'highpass', delay: d, wet: .5 }); this.voice({ f: 130, to: 80, dur, vol: .12, type: 'sawtooth', lp: 500, delay: d }); },
    arQueen(d = 0, dur = 2) { this.voice({ f: 150, to: 60, dur, vol: .3, type: 'sawtooth', lp: 700, n: 4, det: 50, delay: d, wet: .6 }); this.arSkitter(d, 16); this.chord({ notes: [98, 123, 147], dur: dur, vol: .12, type: 'triangle', delay: d, wet: .8 }); },
  });
  PxModel.install(def, { extra: { back(g, P, s, m) { const t = (m && m.anim) || 0; for (let i = 0; i < 4; i++) { const a = -2.4 + i * .5 + Math.sin(t * 3 + i) * .08; g.line([[P.sh[0] - 4, P.sh[1] + 8], [P.sh[0] + Math.cos(a) * 36 - 10, P.sh[1] + Math.sin(a) * 36], [P.sh[0] + Math.cos(a) * 50 - 14, P.sh[1] + Math.sin(a) * 56 + 14]], '#2a0a1a', 2); } } } });
  const eggs = (f, n) => { f.gauge = clamp((f.gauge || 0) + n, 0, 100); };
  Rw2.merge(def, {
    gauge: { name: 'EGGS', max: 100, color: '#c01060', label: f => ((f.gauge || 0) >= 100 ? '· CLUTCH READY' : '') },
    passive: ['Venom', 'Hits poison. A foe caught in a web (slowed) takes double poison. Each web she lays stores an egg; at 100 EGGS her next Brood hatches six.'],
    onRoundStart: f => { f.gauge = 0; },
    onHit: (a, t) => { t.status.poison = Math.max(t.status.poison || 0, t.status.slow ? 4 : 2); },
  });
  Combat.hz.arSac = function (h) { const f = h.owner; if (!f) return false; if (h.t === h.hatch) { Combat.place(f, { kind: 'minion', at: 'self', dx: 0, look: 'skeleton', color: '#c01060', dmg: 50, hp: 60, speed: 340, count: 3, spacing: 36 }); Game.fx.burst(h.x, -20, 14, { color: ['#c01060', '#fff'], size: 7, speed: 200, life: .4 }); sfx('arSkitter'); return false; } return h.t < h.life; };
  Combat.drawHz.arSac = (c, h) => { const k = h.t / h.hatch, wob = Math.sin(h.t * (.4 + k)) * 2 * k; c.save(); c.translate(h.x + wob, 0); c.fillStyle = '#ece0e8'; c.strokeStyle = '#6a1a40'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -22, 18, 24, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = 'rgba(192,16,96,.35)'; for (const [x, y] of [[-6, -28], [5, -20], [-2, -12]]) { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); } c.restore(); };
  Combat.hz.arCocoon = function (h) { const f = h.owner; if (!f) return false; const t = h.tgt; if (!t || t.state === 'ko') return false; t.x = h.x; t.status.slow = Math.max(t.status.slow || 0, .3); if (h.t < h.life - 4) { t.status.stun = Math.max(t.status.stun || 0, .15); } if (h.t % 24 === 12) { t.status.poison = Math.max(t.status.poison || 0, 3); } return h.t < h.life; };
  Combat.drawHz.arCocoon = (c, h) => { const t = h.tgt; if (!t) return; c.save(); c.globalAlpha = .9; c.fillStyle = '#f0e8ee'; c.strokeStyle = '#6a1a40'; c.lineWidth = 2; c.beginPath(); c.ellipse(t.x, t.y - t.h / 2, t.w * .9, t.h * .6, 0, 0, 7); c.fill(); c.stroke(); c.strokeStyle = 'rgba(160,100,130,.7)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(t.x - t.w * .9, t.y - t.h / 2 + (i - 3) * 12); c.lineTo(t.x + t.w * .9, t.y - t.h / 2 + (i - 3) * 12 + 8); c.stroke(); } c.restore(); };

  PxKit.setMove(def, '2S', Object.assign(mk({ name: 'Web Trap', desc: 'A hidden web on the floor (max 2). The first foe through is snared, and each web stores an egg.', pose: 'crouch', s: 12, a: 1, r: 18, cd: 2, ai: { min: 120, max: 1100, use: 'trap' }, ev: { 3: () => sfx('arSpin'), 12: f => { Combat.place(f, { kind: 'trap', at: 'front', dx: 200, color: '#eee', stun: 1.3, dmg: 36, limit: 2 }); eggs(f, 22); } } })));
  PxKit.setMove(def, '4S', mk({ name: 'Brood', desc: 'A skittering spider minion. With a full EGGS gauge: a clutch of six.', pose: 'cast', s: 12, a: 1, r: 18, cd: 2, ai: { min: 100, max: 700, use: 'trap' }, ev: { 12: f => { const clutch = (f.gauge || 0) >= 100; if (clutch) f.gauge = 0; Combat.place(f, { kind: 'minion', at: 'front', dx: 50, look: 'skeleton', color: '#c01060', dmg: 50, hp: 70, speed: 320, count: clutch ? 6 : 1, spacing: 42, stagger: 4 }); sfx('arSkitter', 0, clutch ? 18 : 8); } } }));

  const F5 = Mv.shot({ name: 'Spiderling Volley', desc: 'Brood Queen: six spiderlings leap from her back and home in on the foe, poisoning on a bite.', proj: { speed: 620, r: 10, dmg: 30, count: 6, spread: 1.2, angle: -.4, homing: 2.4, kind: 'orb', color: '#c01060', core: '#2a0a1a', life: 2.4, status: { poison: 2 } }, ev: { 3: () => sfx('arSkitter'), 12: () => sfx('arHiss') } });
  const F6 = mk({ name: 'Silk Lunge', desc: 'Brood Queen: a strand of silk yanks the foe in, and she bites as they arrive.', pose: 'cast', s: 12, a: 6, r: 24, hit: { dmg: 82, box: [0, -110, 80, 100], kb: [300, -300], launch: true, status: { poison: 3 } }, ai: { min: 150, max: 700, use: 'zone' }, ev: { 2: () => sfx('arSpin'), 10: f => { const t = f.opp; if (t && Math.abs(t.x - f.x) < 720 && t.y > -160) { t.x = f.x + f.facing * 70; sfx('arBite'); } } } });
  const F2 = mk({ name: 'Egg Sac', desc: 'Brood Queen: lays an egg sac that hatches three spiders after 2s. Hit it first and it bursts on you.', pose: 'crouch', s: 14, a: 1, r: 20, cd: 4, ai: { min: 100, max: 800, use: 'trap' }, ev: { 14: f => { Combat.addHazard({ kind: 'arSac', owner: f, side: f.side, x: f.x + f.facing * 110, life: 140, hatch: 120 }); eggs(f, 15); sfx('arSpin'); } } });
  const F4 = mk({ name: 'Cocoon', desc: 'Brood Queen: wraps the foe in silk and holds them for 1.4s, poisoning all the while.', pose: 'cast', s: 16, a: 1, r: 26, cd: 8, ai: { min: 100, max: 500, use: 'zone' }, ev: { 3: () => sfx('arSpin', 0, .8), 16: f => { const t = f.opp; if (!t || Math.abs(t.x - f.x) > 520 || t.y < -120) return; Combat.addHazard({ kind: 'arCocoon', owner: f, side: f.side, x: t.x, tgt: t, life: 84 }); sfx('arHiss'); } } });
  const FJ = Mv.dive({ name: 'Pounce', desc: 'Brood Queen: drops on a thread of silk and bites hard.', vx: 500, vy: 1500, hit: { dmg: 92, gb: true, status: { poison: 3 } }, ev: { 1: () => sfx('arSpin', 0, .3) }, onHit: () => sfx('arBite') });
  const FU = PxKit.ult({ id: 'arachna_fult', name: "MATRIARCH'S FEAST", desc: 'Brood Queen: the whole stage becomes her web. Everything in it is hers. Blockable. Must connect.', pose: 'cast_up', s: 54, dmg: 1280, color: '#c01060',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: "MATRIARCH'S FEAST", dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#c01060', c2: '#f0e8ee', c3: '#14040c', motif: 'rift', pose: ['idle', 'cast_up', 'cast_up', 'victory'], actorForm: true, cap1: 'Come to the table.', cap2: 'Everyone is invited.', title: "MATRIARCH'S FEAST", sub: 'THE WEB CLOSES', size: 94,
      cues: [[0, () => sfx('arQueen')], [1.4, () => sfx('arSpin', 0, 1.8)], [5.4, () => { sfx('arBite'); sfx('arSkitter', 0, 20); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#08020a', bot: '#2a0a20', stars: '#f0c0d8', mount: '#14040c' }, k); x.save(); x.strokeStyle = `rgba(240,232,238,${.15 + .6 * k})`; x.lineWidth = 2; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.beginPath(); x.moveTo(W / 2, H * .3); x.lineTo(W / 2 + Math.cos(a) * 900, H * .3 + Math.sin(a) * 600); x.stroke(); } for (let r = 1; r < 8; r++) { x.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * 6.283; x.lineTo(W / 2 + Math.cos(a) * r * 110 * k, H * .3 + Math.sin(a) * r * 70 * k); } x.stroke(); } x.restore(); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 54, w: 1100, h: 340, back: 500, start: f => { f.say('Dinner.', 90); sfx('arQueen', 0, 1.4); }, fire: f => { for (const t of Combat.targets(f.side)) { t.status.poison = 6; t.status.slow = 3; Combat.addHazard({ kind: 'arCocoon', owner: f, side: f.side, x: t.x, tgt: t, life: 50 }); } Cam.shake = 18; sfx('arBite'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Eight legs, faster, poison twice as strong. New moveset: Spiderling Volley, Silk Lunge, Egg Sac, Cocoon, Pounce, and the ultimate MATRIARCH\'S FEAST.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'WEB OF DOOM', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#c01060', c2: '#f0e8ee', c3: '#14040c', motif: 'rift', pose: ['idle', 'cast', 'cast', 'victory'], cap1: 'Hold still.', cap2: 'It hurts less.', title: 'WEB OF DOOM', sub: 'WRAPPED', size: 100,
    cues: [[0, () => sfx('arSpin', 0, 1.2)], [1.4, () => sfx('arSkitter', 0, 14)], [4.8, () => { sfx('arBite'); sfx('arHiss'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#08020a', bot: '#2a0a20', moon: { x: .7, y: .22, r: 70, col: '#f0d0e0' }, mount: '#14040c', stars: '#f0c0d8' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'BROOD QUEEN', dur: 6.6, tc: [1.0, 3.6], tf: 3.9, c1: '#c01060', c2: '#f0e8ee', c3: '#14040c', motif: 'converge', pose: ['idle', 'charge', 'victory'], cap1: 'Every web starts as a thread.', cap2: 'I have eight hands.', title: 'BROOD QUEEN', sub: 'ARACHNA', size: 100,
    cues: [[0, () => sfx('arSkitter', 0, 12)], [1.4, () => sfx('arQueen', 0, 2)], [3.9, () => { sfx('arHiss'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#08020a', bot: '#2a0a20', stars: '#f0c0d8', mount: '#14040c' }, k) });
})();
