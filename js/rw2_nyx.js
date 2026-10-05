// ============================================================
//  MOONKAI — NYX, the Quiet Blade. Pixel remake + THOUSAND SHADOWS moveset.
//  (SHADOW, Backstab, CONTRACT marks, Veil and Shadow Puppet stay as they were.)
//  THOUSAND SHADOWS  KUNAI STORM (5S) nine kunai, each signing a contract,  SHADOW DANCE (6S) four cuts from four sides,
//                    VOID VEIL (2S) a free vanish that leaves a decoy,  CHAINS OF NIGHT (4S) a field of shadow that holds the foe,
//                    FALLING BLADE (jS).   THOUSAND PETALS (form ult)  the lotus blooms ten times over.
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('nyx');
  Object.assign(Sfx, {
    nxCut(d = 0) { this.nsweep({ f0: 5000, f1: 9000, dur: .09, vol: .22, type: 'highpass', delay: d }); this.fm({ f: 2400, ratio: 3.1, index: 180, dur: .12, vol: .08, delay: d, wet: .2 }); },
    nxVanish(d = 0) { this.nsweep({ f0: 2400, f1: 200, dur: .35, vol: .16, delay: d, wet: .5 }); this.voice({ f: 300, to: 60, dur: .4, vol: .1, delay: d, wet: .5 }); },
    nxThrow(d = 0) { this.nsweep({ f0: 3000, f1: 7000, dur: .1, vol: .18, type: 'bandpass', q: 2, delay: d }); },
    nxChain(d = 0) { for (let i = 0; i < 4; i++) this.fm({ f: 1100 + i * 90, ratio: 5.3, index: 160, dur: .1, vol: .08, delay: d + i * .05, wet: .3 }); this.sub({ f: 70, to: 40, dur: .4, vol: .22, delay: d }); },
    nxBloom(d = 0) { this.run({ notes: [392, 523, 659, 784, 1047], step: .12, dur: 1.4, vol: .1, bell: true, delay: d, wet: .9 }); this.chord({ notes: [98, 147, 196], dur: 3, vol: .18, type: 'sine', delay: d, wet: .9 }); },
  });
  PxKit.pixelize(def, { win: [-240, -340, 540, 400] });
  Combat.hz.nxChains = function (h) { const f = h.owner; if (!f || f.state === 'ko') return false; for (const t of Combat.targets(f.side)) if (Math.abs(t.x - h.x) < h.r && t.y > -160) { t.status.slow = Math.max(t.status.slow || 0, .3); if (h.t % 40 === 20) { Combat.resolveHit(t, f, H_({ dmg: 22, guard: 'mid', hs: 8, kb: [0, 0], sfx: 'l' }), { proj: true, fromX: h.x }); nxContract(f, t); } } return h.t < h.life; };
  Combat.drawHz.nxChains = (c, h) => { const k = Math.min(1, h.t / 12, (h.life - h.t) / 16); c.save(); c.globalAlpha = k; c.fillStyle = 'rgba(20,6,30,0.65)'; c.beginPath(); c.ellipse(h.x, -3, h.r, h.r * .16, 0, 0, 7); c.fill(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,42,106,0.7)'; c.lineWidth = 2; for (let i = 0; i < 7; i++) { const x = h.x + (i - 3) * h.r / 3.4; c.beginPath(); c.moveTo(x, -2); for (let j = 1; j <= 6; j++) c.lineTo(x + Math.sin(h.t * .15 + i + j) * 9, -j * 22); c.stroke(); } c.restore(); };

  const F5 = Mv.shot({ name: 'Kunai Storm', desc: 'Thousand Shadows: nine kunai in a fan. Each hit signs a CONTRACT.', proj: { speed: 1250, r: 7, dmg: 24, count: 9, spread: 1.0, kind: 'kunai', color: '#ccd', trail: false, onHit: (t, p) => nxContract(p.owner, t) }, ev: { 3: () => sfx('nxThrow'), 8: () => sfx('nxThrow') } });
  const F6 = mk({ name: 'Shadow Dance', desc: 'Thousand Shadows: four cuts from four sides, each one stepping through the dark. Cashes every CONTRACT on the last.', pose: 'heavy', s: 8, a: 40, r: 20, inv: [1, 46], ai: { min: 120, max: 900, use: 'approach' },
    ev: { 8: f => { sfx('nxVanish'); Rw2.blink(f, { n: 4, gap: 9, dmg: 30, last: 80, color: '#ff2a6a', sfx: () => sfx('nxCut'), move: F6 }); }, 46: f => { const t = f.opp; if (t) { const n = Combat.markCount(t, 'contract'); if (n) { Combat.consumeMark(t, 'contract'); t.hp = Math.max(1, t.hp - 40 * n); Game.popWorld(t.x, t.y - t.h - 40, 'CONTRACT ×' + n, '#ff2a6a', 24); } } } } });
  const F2 = mk({ name: 'Void Veil', desc: 'Thousand Shadows: vanishes for 2s at no cost, leaving a decoy that bursts into chains if struck.', pose: 'charge', s: 8, a: 1, r: 8, cd: 6, ai: { min: 250, max: 1500, use: 'buff' }, ev: { 8: f => { sfx('nxVanish'); Combat.addHazard({ kind: 'nxDecoy', owner: f, side: f.side, x: f.x, facing: f.facing, life: 200, pose: f.pose }); Combat.buff(f, { invis: true, power: true }, 2, 'Void Veil'); nxShadow(f, 10); } } });
  const F4 = mk({ name: 'Chains of Night', desc: 'Thousand Shadows: a field of living shadow under the foe. It slows them and signs a CONTRACT every beat.', pose: 'cast_up', s: 16, a: 1, r: 22, cd: 6, ai: { min: 150, max: 1200, use: 'zone' }, ev: { 16: f => { const t = f.opp; if (!t) return; Combat.addHazard({ kind: 'nxChains', owner: f, side: f.side, x: t.x, r: 150, life: 200 }); sfx('nxChain'); } } });
  const FJ = Mv.dive({ name: 'Falling Blade', desc: 'Thousand Shadows: vanishes, then falls on the foe from above with a single cut.', vx: 700, vy: 1700, hit: { dmg: 96, gb: true, guard: 'high' }, ev: { 1: f => { sfx('nxVanish'); const t = f.opp; if (t) f.x = clamp(t.x - f.facing * 120, 40, Arena.stage.width - 40); } }, onHit: (a, t) => { nxContract(a, t); sfx('nxCut'); } });
  const FU = PxKit.ult({ id: 'nyx_fult', name: 'THOUSAND PETALS', desc: 'Thousand Shadows: the lotus blooms ten times over. A storm of kunai petals closes on the foe. Blockable. Must connect.', pose: 'charge', s: 64, dmg: 1260, color: '#ff2a6a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'THOUSAND PETALS', dur: 8.4, tc: [1.0, 4.6], tf: 5.4, c1: '#ff2a6a', c2: '#ffd0e0', c3: '#14041a', motif: 'slashes', pose: ['idle', 'charge', 'cast', 'victory'], actorForm: true, cap1: 'One blade is a threat.', cap2: 'A thousand are a season.', title: 'THOUSAND PETALS', sub: 'IT BLOOMS', size: 100,
      cues: [[0, () => sfx('nxBloom')], [1.6, () => sfx('nxVanish')], [5.4, () => { for (let i = 0; i < 6; i++) sfx('nxCut', i * .08); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#08020c', bot: '#3a0a2a', moon: { x: .5, y: .26, r: 90, col: '#ffd0e0' }, stars: '#ff8ab0', mount: '#14041a', embers: '#ff2a6a' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 64, w: 700, h: 340, back: 300, start: f => { f.say('Bloom.', 90); sfx('nxBloom'); f.status.invis = 1.2; }, fire: f => { for (let i = 0; i < 10; i++) Game.later(i * .04, () => { const t = f.opp; if (t) Combat.explode(t.x + rand(-120, 120), -70 + rand(-60, 60), 60, f, 0, '#ff2a6a'); sfx('nxCut'); }); Cam.shake = 16; sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. Faster, shadows linger. New moveset: Kunai Storm, Shadow Dance, Void Veil, Chains of Night, Falling Blade, and the ultimate THOUSAND PETALS.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'DEATH LOTUS', dur: 7.8, tc: [1.0, 4.2], tf: 5.0, c1: '#ff2a6a', c2: '#ffd0e0', c3: '#14041a', motif: 'slashes', pose: ['idle', 'charge', 'cast', 'victory'], cap1: 'You never saw me leave.', cap2: 'You will not see me return.', title: 'DEATH LOTUS', sub: 'EIGHT PETALS', size: 96,
    cues: [[0, () => sfx('nxVanish')], [1.4, () => sfx('nxBloom')], [5.0, () => { for (let i = 0; i < 4; i++) sfx('nxCut', i * .1); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#08020c', bot: '#2a0a22', moon: { x: .72, y: .24, r: 80, col: '#ffd0e0' }, stars: '#ff8ab0', city: '#10040e', lit: .2 }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'THOUSAND SHADOWS', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#ff2a6a', c2: '#ffd0e0', c3: '#14041a', motif: 'converge', pose: ['idle', 'charge', 'victory'], cap1: 'One shadow is a habit.', cap2: 'A thousand is a country.', title: 'THOUSAND SHADOWS', sub: 'THE QUIET BLADE', size: 92,
    cues: [[0, () => sfx('nxVanish')], [1.4, () => sfx('nxBloom')], [3.7, () => { sfx('nxCut'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#08020c', bot: '#32082a', moon: { x: .5, y: .24, r: 90, col: '#ffd0e0' }, stars: '#ff8ab0', mount: '#14041a' }, k) });
})();
