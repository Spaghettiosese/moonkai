// ============================================================
//  MOONKAI — CIPHER, the Ghost in the Wire. Pixel remake + a real kit.
//
//  TRACE (mark on the foe, max 3)  data hits and her gadgets TRACE the foe. At 3 they are ROOTED: their controls invert for 2s and
//                                  they lose half a bar of meter.
//  FIREWALL (passive)  her hits drain the enemy's meter (as before).
//  ROOT ACCESS   BUFFER OVERFLOW (5S) seven fast packets, PACKET STORM (6S) three jumps through the network, striking each time,
//                BACKDOOR (2S) two hacked drones, ZERO DAY (4S) a mine that explodes into silence, BIT FLOOD (jS).
//  KERNEL PANIC (form ult)   she crashes the arena.     SYSTEM CRASH & the awakening: new cinematics.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('cipher');
  Object.assign(Sfx, {
    cpBlip(d = 0, p = 1) { this.fm({ f: 880 * p, ratio: 1, index: 0, dur: .05, vol: .1, type: 'square', delay: d }); this.fm({ f: 1320 * p, ratio: 1, index: 0, dur: .05, vol: .08, type: 'square', delay: d + .05 }); },
    cpType(d = 0, n = 12) { for (let i = 0; i < n; i++) this.nsweep({ f0: 2000 + (i % 4) * 400, f1: 3000, dur: .03, vol: .06, type: 'highpass', delay: d + i * .05 }); },
    cpGlitch(d = 0) { for (let i = 0; i < 6; i++) this.voice({ f: 150 + Math.random() * 2400, dur: .04, vol: .1, type: 'square', delay: d + i * .035 }); this.crackle({ dur: .25, vol: .1, delay: d, lo: 800, hi: 9000 }); },
    cpWarp(d = 0) { this.voice({ f: 200, to: 2400, dur: .2, vol: .12, type: 'sawtooth', lp: 3000, delay: d }); this.cpBlip(d + .15, 1.4); },
    cpCrash(d = 0) { this.cpGlitch(d); this.impact(.9, d + .1); this.sub({ f: 70, to: 26, dur: .8, vol: .45, delay: d + .1 }); this.voice({ f: 880, to: 60, dur: .9, vol: .16, type: 'square', delay: d }); },
    cpBoot(d = 0) { this.run({ notes: [262, 330, 392, 523, 659, 784], step: .09, dur: .3, vol: .09, type: 'square', delay: d }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const t = v.anim || 0; if (v.transformed) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { c.fillStyle = '#2aff9a'; c.fillRect(Math.round(P.hip[0] - 40 + i * 14), Math.round(P.hip[1] - 110 + ((t * 120 + i * 37) % 120)), 3, 8); } c.restore(); } } });
  const trace = (a, t, n = 1) => { if (!t || t.state === 'ko') return; Combat.mark(t, a, 'trace', n, { max: 3, dur: 8, color: '#2aff9a', label: 'TRACE', onMax: tt => { delete tt.marks.trace; tt.status.confuse = Math.max(tt.status.confuse || 0, 2); if (tt.side) tt.side.meter = Math.max(0, tt.side.meter - 50); Game.popWorld(tt.x, tt.y - tt.h - 40, 'ROOTED', '#2aff9a', 26); sfx('cpGlitch'); Cam.shake = 6; } }); };
  Rw2.merge(def, { passive: ['Firewall', 'Her hits drain the enemy\'s meter. Data hits TRACE the foe (max 3): at 3 they are ROOTED: controls inverted for 2s and half a bar gone.'], onHit: (a, t) => { if (a.move && a.move.kind === 'special') trace(a, t); } });
  Combat.hz.cpField = function (h) { const f = h.owner; if (!f) return false; for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r && e.y > -200 && h.t === h.at) { e.status.silence = Math.max(e.status.silence || 0, 2); e.status.confuse = Math.max(e.status.confuse || 0, 2); Combat.resolveHit(e, f, H_({ dmg: 90, guard: 'mid', hs: 20, kb: [0, -420], launch: true, sfx: 'h' }), { proj: true, fromX: h.x }); trace(f, e, 2); sfx('cpCrash'); Cam.shake = 10; } return h.t < h.life; };
  Combat.drawHz.cpField = (c, h) => { const arm = h.t < h.at, k = arm ? h.t / h.at : 1 - (h.t - h.at) / (h.life - h.at); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = arm ? .5 + .4 * Math.sin(h.t * .5) : k; c.strokeStyle = '#2aff9a'; c.lineWidth = arm ? 2 : 5; c.strokeRect(h.x - h.r, arm ? -10 : -170, h.r * 2, arm ? 10 : 170); for (let i = 0; i < 18; i++) { c.fillStyle = '#2aff9a'; c.fillRect(h.x - h.r + ((i * 41) % (h.r * 2)), arm ? -8 : -((i * 31 + h.t * 8) % 170), 4, 8); } c.restore(); };

  const F5 = mk({ name: 'Buffer Overflow', desc: 'Root Access: seven packets in a rapid stream, each TRACING the foe.', pose: 'cast', s: 10, a: 28, r: 18, ai: { min: 100, max: 1300, use: 'zone' }, ev: Object.fromEntries([...Array(7)].map((_, i) => [10 + i * 4, f => { Combat.fireShots(f, { speed: 1500, r: 7, dmg: 26, kind: 'bullet', color: '#2aff9a', core: '#fff', life: .9, offY: -10 + (i % 3) * 10, onHit: (t, p) => trace(p.owner, t) }); sfx('cpBlip', 0, 1 + i * .06); }])) });
  const F6 = mk({ name: 'Packet Storm', desc: 'Root Access: three jumps through the network, striking from a new angle each time.', pose: 'heavy', s: 6, a: 24, r: 18, inv: [1, 30], ai: { min: 100, max: 900, use: 'approach' }, ev: { 6: f => { sfx('cpWarp'); Rw2.blink(f, { n: 3, gap: 8, dmg: 30, last: 70, color: '#2aff9a', sfx: () => sfx('cpWarp'), move: F6 }); } } });
  const F2 = Mv.place({ name: 'Backdoor', desc: 'Root Access: two hacked drones, one each side of the foe.', s: 12, spawn: { kind: 'turret', at: 'enemy', dx: -140, life: 8, hp: 120, shotDmg: 20, limit: 3, count: 2, spacing: 280 }, cd: 6, ev: { 4: () => sfx('cpType') } });
  const F4 = mk({ name: 'Zero Day', desc: 'Root Access: a hidden mine that arms for a beat, then detonates into a field that silences and confuses.', pose: 'crouch', s: 12, a: 1, r: 18, cd: 5, ai: { min: 100, max: 800, use: 'trap' }, ev: { 3: () => sfx('cpType'), 12: f => { const t = f.opp; Combat.addHazard({ kind: 'cpField', owner: f, side: f.side, x: t ? clamp(t.x, 80, Arena.stage.width - 80) : f.x + f.facing * 300, r: 120, life: 70, at: 40 }); } } });
  const FJ = Mv.shot({ name: 'Bit Flood', desc: 'Root Access: a curtain of code falls in front of her, each bit TRACING.', proj: { speed: 1000, angle: 1.0, spread: 1.0, count: 8, r: 8, dmg: 26, kind: 'bullet', color: '#2aff9a', core: '#fff', life: 1, onHit: (t, p) => trace(p.owner, t) }, ev: { 2: () => sfx('cpType', 0, 8) } }); FJ.air = true;
  const FU = PxKit.ult({ id: 'cipher_fult', name: 'KERNEL PANIC', desc: 'Root Access: she pulls the plug on the arena. Everything stops, flickers, and falls. Blockable. Must connect.', pose: 'cast', s: 46, dmg: 1280, color: '#2aff9a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'KERNEL PANIC', dur: 8.2, tc: [1.0, 4.2], tf: 5.0, c1: '#2aff9a', c2: '#ffffff', c3: '#02140c', motif: 'rift', pose: ['idle', 'cast', 'cast', 'victory'], actorForm: true, cap1: 'sudo rm -rf  /arena', cap2: 'Permission granted.', title: 'KERNEL PANIC', sub: 'FATAL ERROR', size: 104,
      cues: [[0, () => sfx('cpType', 0, 18)], [1.6, () => sfx('cpBoot')], [5.0, () => { sfx('cpCrash'); sfx('cpGlitch', .2); sfx('boom'); }]],
      bg: (x, t, k) => { PxKit.sky(x, t, { top: '#02140c', bot: '#0a4a30', grid: 'rgba(42,255,154,.3)' }, k); x.save(); x.fillStyle = 'rgba(42,255,154,.7)'; x.font = '18px monospace'; for (let i = 0; i < 44; i++) x.fillText(((i * 7 + Math.floor(t * 8)) % 2) ? '1' : '0', (i * 53) % W, (((i * 29) + t * 160) % H)); x.restore(); } }) });
  FU.ev = PxKit.zoneEv(FU, { at: 46, w: 900, h: 340, back: 400, start: f => { f.say('Segmentation fault.', 90); sfx('cpType', 0, 16); }, fire: f => { for (const e of Combat.targets(f.side)) { e.status.silence = 3; e.status.confuse = 3; trace(f, e, 3); } Cam.shake = 22; sfx('cpCrash'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Every hit drains twice as much meter. New moveset: Buffer Overflow, Packet Storm, Backdoor, Zero Day, Bit Flood, and the ultimate KERNEL PANIC.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'SYSTEM CRASH', dur: 7.8, tc: [1.0, 3.8], tf: 4.6, c1: '#2aff9a', c2: '#ffffff', c3: '#02140c', motif: 'beam', pose: ['idle', 'cast', 'cast', 'victory'], cap1: 'Uploading...', cap2: 'Deleted.', title: 'SYSTEM CRASH', sub: 'GOODBYE', size: 100,
    cues: [[0, () => sfx('cpType', 0, 12)], [1.2, () => sfx('cpBoot')], [4.6, () => { sfx('cpCrash'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02140c', bot: '#0a3a28', grid: 'rgba(42,255,154,.25)', city: '#04140e', lit: .4 }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'ROOT ACCESS', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#2aff9a', c2: '#ffffff', c3: '#02140c', motif: 'rain', shape: 'rect', pose: ['idle', 'cast', 'victory'], lift: 20, cap1: 'Login: guest', cap2: 'Login: ROOT', title: 'ROOT ACCESS', sub: 'CIPHER', size: 104,
    cues: [[0, () => sfx('cpType', 0, 12)], [1.4, () => sfx('cpBoot')], [3.7, () => { sfx('cpGlitch'); sfx('cpBlip', .1, 2); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#02140c', bot: '#0a4a30', grid: 'rgba(42,255,154,.3)' }, k) });
})();
