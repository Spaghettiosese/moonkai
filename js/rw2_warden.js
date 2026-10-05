// ============================================================
//  MOONKAI — WARDEN, the Last Guard. Pixel remake + a real kit.
//
//  SHACKLES (mark on the foe, max 3)  chain moves bind the foe a link at a time: each link slows them. At 3 they are LOCKED DOWN: stunned
//                                     1s, and take +25% from everything for 4s (on top of Lockdown).
//  LOCKDOWN (passive)   stunned or snared enemies take 25% more (as before).
//  LOCKDOWN FORM   CHAIN STORM (5S) four hooks in a fan, SOLITARY SLAM (6S) a bigger grab and a harder slam, HEAVY SHACKLES (2S) a snaring
//                  field, RIOT WALL (4S) a shield-bash that leaves a wall, IRON RAIN (jS).   LIFE SENTENCE (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('warden');
  Object.assign(Sfx, {
    wdChain(d = 0, n = 5) { for (let i = 0; i < n; i++) this.fm({ f: 1100 + i * 90, ratio: 5.1, index: 160, dur: .1, vol: .1, delay: d + i * .05, wet: .3 }); },
    wdSlam(d = 0) { this.impact(1, d); this.sub({ f: 64, to: 26, dur: .6, vol: .5, delay: d }); this.fm({ f: 190, ratio: 2.8, index: 260, dur: .6, vol: .14, delay: d, wet: .4 }); },
    wdLock(d = 0) { this.fm({ f: 520, ratio: 2.4, index: 200, dur: .5, vol: .16, delay: d, wet: .5 }); this.fm({ f: 380, ratio: 2.4, index: 200, dur: .5, vol: .12, delay: d + .12, wet: .5 }); this.impact(.5, d + .1); },
    wdSiren(d = 0, dur = 2.4) { for (let i = 0; i < dur * 2; i++) this.voice({ f: 400 + (i % 2) * 260, dur: .45, vol: .1, type: 'sawtooth', lp: 1400, delay: d + i * .5, wet: .5 }); },
    wdDoor(d = 0) { this.impact(.9, d); this.fm({ f: 90, ratio: 3, index: 300, dur: .9, vol: .2, delay: d, wet: .6 }); this.sub({ f: 56, to: 30, dur: .8, vol: .4, delay: d }); },
    wdGrunt(d = 0) { this.voice({ f: 100, to: 70, dur: .4, vol: .26, type: 'sawtooth', lp: 600, n: 3, det: 20, delay: d, wet: .3 }); },
  });
  PxModel.install(def, {});
  const shackle = (a, t, n = 1) => { if (!t || t.state === 'ko') return; t.status.slow = Math.max(t.status.slow || 0, .4 + (Combat.markCount(t, 'shackle') || 0) * .2); Combat.mark(t, a, 'shackle', n, { max: 3, dur: 9, color: '#aab', label: 'SHACKLED', onMax: tt => { delete tt.marks.shackle; tt.status.stun = Math.max(tt.status.stun || 0, 1); tt.status.weaken = Math.max(tt.status.weaken || 0, 0); a.lockT = 4 * FPS; Game.popWorld(tt.x, tt.y - tt.h - 40, 'LOCKED DOWN', '#aab', 26); sfx('wdLock'); Cam.shake = 8; } }); };
  Rw2.merge(def, {
    passive: ['Lockdown', 'Stunned or snared enemies take 25% more. Chain moves add SHACKLES (max 3): at 3 the foe is LOCKED DOWN: stunned 1s and taking +25% from everything for 4s.'],
    onRoundStart: f => { f.lockT = 0; },
    onHit: (a, t) => { if (a.move && /Chain|Shackle|Hook/.test(a.move.name || '')) shackle(a, t); },
    passiveDmg: (f, t) => (f.lockT > 0 ? 1.25 : 1),
    passiveTick: f => { if (f.lockT > 0) f.lockT--; },
  });
  def.gauge = { name: 'LOCKDOWN', max: 100, color: '#aab', label: f => (f.lockT > 0 ? '· LOCKED DOWN' : '') };
  Rw2.merge(def, { passiveTick: f => { const o = f.opp; f.gauge = f.lockT > 0 ? 100 : o ? clamp((Combat.markCount(o, 'shackle') || 0) * 33, 0, 99) : 0; } });
  Combat.hz.wdSnare = function (h) { const f = h.owner; if (!f) return false; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r && e.y > -80) { e.status.slow = Math.max(e.status.slow || 0, .5); if (h.t % 22 === 11) { Combat.resolveHit(e, f, H_({ dmg: 24, guard: 'low', hs: 8, kb: [0, 0], sfx: 'm' }), { proj: true, fromX: h.x }); shackle(f, e); sfx('wdChain'); } } return h.t < h.life; };
  Combat.drawHz.wdSnare = (c, h) => { const k = Math.min(1, h.t / 10, (h.life - h.t) / 14); c.save(); c.globalAlpha = k; c.strokeStyle = '#8a8a9a'; c.lineWidth = 4; for (let i = 0; i < 6; i++) { const x = h.x - h.r + i * (h.r * 2 / 5); c.beginPath(); c.moveTo(x, -2); for (let j = 1; j <= 5; j++) c.lineTo(x + (j % 2 ? 6 : -6), -j * 9); c.stroke(); } c.fillStyle = 'rgba(20,20,30,.5)'; c.beginPath(); c.ellipse(h.x, -3, h.r, 8, 0, 0, 7); c.fill(); c.restore(); };

  const F5 = mk({ name: 'Chain Storm', desc: 'Lockdown: four hooks in a fan; each drags the foe a little closer and adds a SHACKLE.', pose: 'throw', s: 12, a: 1, r: 24, cd: 3, ai: { min: 100, max: 900, use: 'zone' }, ev: { 3: () => sfx('wdChain'), 12: f => { Combat.fireShots(f, { speed: 1100, r: 10, dmg: 36, count: 4, spread: .5, kind: 'hook', color: '#aab', trail: false, life: .7, pull: true, hs: 24, onHit: (t, p) => shackle(p.owner, t) }); sfx('wdChain', 0, 8); } } });
  const F6 = Object.assign(Mv.grab({ name: 'Solitary Slam', desc: 'Lockdown: a longer grab and a harder slam that cracks the floor. +2 SHACKLES.', range: 100, s: 8, grabData: { anim: 'slam', dmg: 240, frames: 44 }, ev: { 3: () => sfx('wdGrunt') } }), { onHit: (a, t) => { shackle(a, t, 2); sfx('wdSlam'); Cam.shake = 14; } });
  const F2 = mk({ name: 'Heavy Shackles', desc: 'Lockdown: a field of chains for 4s under the foe: slows, bites, shackles.', pose: 'cast_up', s: 14, a: 1, r: 24, cd: 7, ai: { min: 100, max: 1000, use: 'zone' }, ev: { 14: f => { const t = f.opp; if (!t) return; Combat.addHazard({ kind: 'wdSnare', owner: f, side: f.side, x: clamp(t.x, 110, Arena.stage.width - 110), r: 150, life: 240 }); sfx('wdChain', 0, 8); sfx('wdLock', .2); } } });
  const F4 = Mv.rush({ name: 'Riot Wall', desc: 'Lockdown: a shield-bash charge that drops a wall of riot shields where it ends.', s: 8, speed: 1000, frames: 18, armor: [1, 24], hit: { dmg: 90, kb: [560, -240], wb: true }, ev: { 1: () => sfx('wdGrunt') } });
  F4.ev[20] = f => { Combat.place(f, { kind: 'wall', at: 'self', w: 60, hgt: 170, hp: 360, life: 6, dmg: 60, style: 'steel', colors: ['#8a8a9a', '#3a3a4a'], limit: 1 }); sfx('wdLock'); };
  const FJ = Mv.dive({ name: 'Iron Rain', desc: 'Lockdown: drops chains and the weight on them; the landing adds a SHACKLE.', vx: 260, vy: 1700, hit: { dmg: 116, gb: true }, ev: { 1: () => sfx('wdChain') }, onHit: (a, t) => { shackle(a, t); Combat.addHazard({ kind: 'tiClap', owner: a, side: a.side, x: a.x, life: 22, move: FJ }); sfx('wdSlam'); } });
  const FU = PxKit.ult({ id: 'warden_fult', name: 'LIFE SENTENCE', desc: 'Lockdown: the cell door closes. The chains hold. The sentence is not appealed. Blockable. Must connect.', pose: 'cast', s: 50, dmg: 1300, color: '#aab',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'LIFE SENTENCE', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#aab', c2: '#ff5a1a', c3: '#0a0a12', motif: 'slashes', pose: ['idle', 'cast', 'throw', 'victory'], actorForm: true, cap1: 'Name?  Number?', cap2: 'Doesn\'t matter. Both are mine.', title: 'LIFE SENTENCE', sub: 'NO PAROLE', size: 100,
      cues: [[0, () => sfx('wdSiren', 0, 2.6)], [1.6, () => sfx('wdChain', 0, 12)], [5.4, () => { sfx('wdDoor'); sfx('wdLock', .3); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#06060c', bot: '#1c1c2a', pillars: '#101018', fog: 'rgba(170,170,190,0.08)' }, k); x.save(); x.fillStyle = `rgba(255,90,26,${.1 + .2 * Math.abs(Math.sin(t * 4))})`; x.fillRect(0, 0, W, H); x.strokeStyle = `rgba(170,170,190,${.3 + .5 * k})`; x.lineWidth = 8; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(60 + i * 100, 0); x.lineTo(60 + i * 100, H * (.4 + .5 * k)); x.stroke(); } x.restore(); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 50, w: 800, h: 340, back: 300, start: f => { f.say('Lights out.', 90); sfx('wdSiren'); }, fire: f => { const t = f.opp; if (t) { shackle(f, t, 3); t.status.stun = 1.4; } Cam.shake = 22; sfx('wdDoor'); sfx('wdSlam', .1); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Riot armor: super armor, longer grabs. New moveset: Chain Storm, Solitary Slam, Heavy Shackles, Riot Wall, Iron Rain, and the ultimate LIFE SENTENCE.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'SOLITARY', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#aab', c2: '#ff5a1a', c3: '#0a0a12', motif: 'rift', pose: ['idle', 'cast', 'throw', 'victory'], cap1: 'Count the days.', cap2: 'There is nothing to count.', title: 'SOLITARY', sub: 'LOCKED IN', size: 108,
    cues: [[0, () => sfx('wdChain', 0, 8)], [1.4, () => sfx('wdSiren', 0, 2)], [4.8, () => { sfx('wdDoor'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#06060c', bot: '#1a1a26', pillars: '#101018' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'LOCKDOWN', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#aab', c2: '#ff5a1a', c3: '#0a0a12', motif: 'converge', shape: 'rect', pose: ['idle', 'charge', 'victory'], cap1: 'Riot gear: issued.', cap2: 'All exits: sealed.', title: 'LOCKDOWN', sub: 'WARDEN', size: 110,
    cues: [[0, () => sfx('wdSiren', 0, 2)], [1.4, () => sfx('wdChain', 0, 8)], [3.7, () => { sfx('wdDoor'); sfx('wdGrunt'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#06060c', bot: '#1c1c2a', pillars: '#101018', fog: 'rgba(170,170,190,0.08)' }, k) });
})();
