// ============================================================
//  MOONKAI — VULCAN, the Forge-Born. Pixel remake + a real kit.
//
//  MAGMA (new gauge)  he stokes it by standing in lava (his own pools) and by every glob he throws. At 100 he is STOKED for 5s:
//                     +20% damage, and his armored moves cannot be interrupted.
//  MOLTEN (passive)   melee attackers get burned (as before).
//  RE-FORGED (rare revival)  once a MATCH a lethal blow drops him into the lava; he climbs out at 30% as the MOLTEN CORE.
//  MOLTEN CORE   MAGMA BARRAGE (5S) six globs in a fan, ERUPTION RUSH (6S) an armored charge that leaves lava, VOLCANO (2S) a huge
//                column and a ring of pools, COOLING CRUST (4S) armor and a burn aura, METEOR SLAM (jS).  CALDERA (form ult).
// ============================================================
(() => {
  const sfx = PxKit.sfx, def = charById('vulcan');
  Object.assign(Sfx, {
    vlBubble(d = 0, n = 6) { for (let i = 0; i < n; i++) this.voice({ f: 90 + Math.random() * 90, to: 200, dur: .12, vol: .1, delay: d + i * .08, type: 'sine', wet: .3 }); },
    vlSplash(d = 0) { this.nsweep({ f0: 1200, f1: 200, dur: .4, vol: .22, type: 'lowpass', delay: d, wet: .4 }); this.crackle({ dur: .3, vol: .1, delay: d, lo: 200, hi: 2400 }); },
    vlRoar(d = 0, dur = 1.4) { this.voice({ f: 85, to: 50, dur, vol: .32, type: 'sawtooth', lp: 600, n: 3, det: 32, delay: d, wet: .4 }); this.sub({ f: 50, to: 26, dur: dur * .8, vol: .45, delay: d }); },
    vlErupt(d = 0) { this.riser(1.2, .26, d, 60, 900); this.impact(1, d + 1.2); this.vlSplash(d + 1.2); this.sub({ f: 56, to: 24, dur: 1.2, vol: .5, delay: d + 1.2 }); },
    vlHiss(d = 0) { this.nsweep({ f0: 7000, f1: 3000, dur: .6, vol: .12, type: 'highpass', delay: d, wet: .4 }); },
    vlClang(d = 0) { this.fm({ f: 240, ratio: 2.9, index: 220, dur: .6, vol: .18, delay: d, wet: .4 }); },
  });
  PxModel.install(def, { post(c, v, P, s, m) { const t = v.anim || 0; if ((v.gauge || 0) >= 100 || v.transformed) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? 'rgba(255,90,26,.9)' : 'rgba(255,220,100,.9)'; c.fillRect(Math.round(P.hip[0] - 20 + Math.sin(t * 2 + i) * 22), Math.round(P.hip[1] - 30 - ((t * 50 + i * 23) % 100)), 4, 4); } c.restore(); } } });
  const stoke = (f, n) => { if (f.stokeT > 0) return; f.gauge = clamp((f.gauge || 0) + n, 0, 100); if (f.gauge >= 100) { f.gauge = 0; f.stokeT = 5 * FPS; Game.popWorld(f.x, f.y - f.h - 40, 'STOKED', '#ff8a2a', 26); sfx('vlRoar'); Cam.shake = 8; } };
  Rw2.merge(def, {
    gauge: { name: 'MAGMA', max: 100, color: '#ff5a1a', label: f => (f.stokeT > 0 ? '· STOKED' : '') },
    passive: ['Molten', 'Melee attackers burn. Standing in his own lava and throwing globs stokes MAGMA; at 100 he is STOKED for 5s (+20% damage, uninterruptible armor).'],
    onRoundStart: f => { f.gauge = 0; f.stokeT = 0; },
    passiveDmg: f => (f.stokeT > 0 ? 1.2 : 1),
    passiveTick: f => { if (f.stokeT > 0) { f.stokeT--; f.status.armor = Math.max(f.status.armor || 0, .1); } else if (f.st % 10 === 0 && Combat.hazards.some(h => h.owner === f && h.kind === 'zone' && Math.abs(h.x - f.x) < (h.r || 60))) stoke(f, 3); },
  });
  def.revival = { hp: .3, needForm: false, enterForm: true, label: 'RE-FORGED', say: ['The forge is never cold.', 'Again.'], meter: 200, when: t => !t.side.vlRevived, onRevive: t => { t.side.vlRevived = true; },
    cutscene: f => PxKit.cineForm(f, { name: 'RE-FORGED', dur: 5.8, tc: [.8, 3.0], tf: 3.2, c1: '#ff5a1a', c2: '#ffe08a', c3: '#2a0600', motif: 'rise', pose: ['kneel', 'charge', 'victory'], lift: 10, cap1: 'Metal that breaks was never finished.', cap2: 'Again.', title: 'RE-FORGED', sub: 'THE MOLTEN CORE', size: 100,
      cues: [[0, () => sfx('vlSplash')], [1.2, () => sfx('vlBubble', 0, 12)], [3.2, () => { sfx('vlRoar', 0, 1.8); sfx('vlClang'); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0400', bot: '#8a2a04', embers: '#ff8a2a', ruins: '#2a0a04', rays: '#ffb060' }, k) }) };
  Combat.hz.vlColumn = function (h) { const f = h.owner; if (!f) return false; if (h.t === h.at) for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r && e.y > -240) Combat.resolveHit(e, f, H_({ dmg: 104, guard: 'mid', hs: 26, kb: [0, -860], launch: true, status: { burn: 3 }, sfx: 'h' }), { proj: true, fromX: h.x, move: h.move }); return h.t < h.life; };
  Combat.drawHz.vlColumn = (c, h) => { const arm = h.t < h.at, k = arm ? h.t / h.at : 1 - (h.t - h.at) / (h.life - h.at); c.save(); c.globalCompositeOperation = 'lighter'; if (arm) { c.strokeStyle = `rgba(255,120,30,${.3 + .5 * k})`; c.lineWidth = 3; c.beginPath(); c.ellipse(h.x, -3, h.r, 10, 0, 0, 7); c.stroke(); glowCircle(c, h.x, -6, h.r * 1.2, `rgba(255,90,20,${.3 * k})`, 'rgba(0,0,0,0)'); } else { for (let i = 0; i < 40; i++) { const y = -((i * 29 + h.t * 26) % 520), w = h.r * (.4 + .6 * Math.abs(Math.sin(i))) * k; c.fillStyle = i % 3 ? 'rgba(255,120,30,.9)' : 'rgba(255,230,140,.9)'; c.fillRect(Math.round((h.x + Math.sin(i * 2.3) * w) / 3) * 3, Math.round(y / 3) * 3, 14, 6); } glowCircle(c, h.x, -120, h.r * 1.5, `rgba(255,120,30,${.4 * k})`, 'rgba(0,0,0,0)'); } c.restore(); };

  const F5 = Mv.shot({ name: 'Magma Barrage', desc: 'Molten Core: six globs in a high fan; each leaves a burning puddle where it lands.', proj: { speed: 640, angle: -.6, spread: 1.0, count: 6, g: 800, r: 14, dmg: 44, kind: 'fire', color: '#ff5a1a', core: '#ffe08a', explode: 60, status: { burn: 2 } }, ev: { 3: () => sfx('vlBubble'), 12: () => sfx('vlSplash') }, onStart: f => stoke(f, 10) });
  const F6 = Object.assign(Mv.rush({ name: 'Eruption Rush', desc: 'Molten Core: an armored charge that leaves a trail of lava behind him.', s: 8, speed: 1150, frames: 22, armor: [1, 30], hit: { dmg: 112, kb: [600, -260], wb: true, status: { burn: 3 } }, ev: { 1: () => sfx('vlRoar', 0, .6) } }), { onStart: f => { f.vlFrom = f.x; } });
  F6.ev[24] = f => { const a = Math.min(f.vlFrom, f.x), b = Math.max(f.vlFrom, f.x); for (let x = a; x <= b; x += 90) Rw2.pool(f, x, { r: 50, life: 3.5, dmg: 14, color: '#ff5a1a', status: { burn: 1 } }); sfx('vlSplash'); };
  const F2 = mk({ name: 'Volcano', desc: 'Molten Core: a huge column of lava under the foe, then a ring of burning pools around it.', pose: 'slam', s: 18, a: 1, r: 28, cd: 7, ai: { min: 100, max: 1000, use: 'zone' }, ev: { 18: f => { const t = f.opp; if (!t) return; const x = clamp(t.x, 80, Arena.stage.width - 80); Combat.addHazard({ kind: 'vlColumn', owner: f, side: f.side, x, r: 90, life: 60, at: 26, move: F2 }); for (const s of [-1, 1]) Rw2.pool(f, x + s * 180, { r: 60, life: 4, dmg: 14, color: '#ff5a1a', status: { burn: 1 } }); sfx('vlErupt'); Cam.shake = 8; } } });
  const F4 = Mv.buff({ name: 'Cooling Crust', desc: 'Molten Core: a crust of obsidian grants armor for 5s, and burns anyone who touches him harder.', effects: { armor: true, fortify: true }, dur: 5, cd: 9, ev: { 4: () => sfx('vlClang') } });
  const FJ = Mv.dive({ name: 'Meteor Slam', desc: 'Molten Core: slams down like a meteor; the landing erupts in lava.', vx: 300, vy: 1800, hit: { dmg: 118, gb: true, status: { burn: 3 } }, ev: { 1: () => sfx('vlHiss') }, onHit: a => { Combat.explode(a.x, -20, 150, a, 40, '#ff5a1a'); for (const s of [-1, 1]) Rw2.pool(a, a.x + s * 100, { r: 50, life: 3, dmg: 14, color: '#ff5a1a', status: { burn: 1 } }); sfx('vlErupt'); stoke(a, 12); } });
  const FU = PxKit.ult({ id: 'vulcan_fult', name: 'CALDERA', desc: 'Molten Core: the ground under the whole stage turns to lava and the mountain wakes. Blockable. Must connect.', pose: 'slam', s: 54, dmg: 1320, color: '#ff5a1a',
    cutscene: (a, t) => PxKit.cineUlt(a, t, { name: 'CALDERA', dur: 8.6, tc: [1.0, 4.6], tf: 5.4, c1: '#ff5a1a', c2: '#ffe08a', c3: '#240600', motif: 'shockwave', pose: ['idle', 'charge', 'punch', 'victory'], actorForm: true, cap1: 'Every mountain is a patient fire.', cap2: 'This one is done waiting.', title: 'CALDERA', sub: 'THE MOUNTAIN WAKES', size: 108,
      cues: [[0, () => sfx('vlBubble', 0, 12)], [1.4, () => sfx('vlRoar', 0, 2)], [5.4, () => { sfx('vlErupt'); sfx('vlRoar', .3, 1.6); sfx('boom'); }]],
      bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0400', bot: '#9a3004', mount: '#2a0a04', embers: '#ff8a2a', sun: { x: .5, y: .3, r: 40 + k * 120, col: '#ffb060' }, rays: '#ffb060' }, k) }) });
  FU.ev = PxKit.zoneEv(FU, { at: 54, w: 1100, h: 340, back: 500, start: f => { f.say('WAKE.', 90); sfx('vlRoar', 0, 1.6); }, fire: f => { for (const e of Combat.targets(f.side)) { Combat.addHazard({ kind: 'vlColumn', owner: f, side: f.side, x: e.x, r: 110, life: 60, at: 6, move: FU }); } for (let i = -4; i <= 4; i++) Rw2.pool(f, f.x + i * 140, { r: 60, life: 5, dmg: 16, color: '#ff5a1a', status: { burn: 1 } }); Cam.shake = 26; sfx('vlErupt'); sfx('boom'); } });
  PxKit.formKit(def, { moves: { '5S': F5, '6S': F6, '2S': F2, '4S': F4, 'jS': FJ }, ult: FU, desc: 'Permanent. White-hot: super armor, burn aura. New moveset: Magma Barrage, Eruption Rush, Volcano, Cooling Crust, Meteor Slam, and the ultimate CALDERA.' });

  def.ult.ult.cutscene = (a, t) => PxKit.cineUlt(a, t, { name: 'PYROCLASM', dur: 8.0, tc: [1.0, 4.0], tf: 4.8, c1: '#ff5a1a', c2: '#ffe08a', c3: '#240600', motif: 'pillar', pose: ['idle', 'charge', 'punch', 'victory'], cap1: 'Stand close.', cap2: 'It is warm.', title: 'PYROCLASM', sub: 'THE VOLCANO ERUPTS', size: 100,
    cues: [[0, () => sfx('vlBubble', 0, 10)], [1.4, () => sfx('vlRoar', 0, 1.6)], [4.8, () => { sfx('vlErupt'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0400', bot: '#7a2804', mount: '#2a0a04', embers: '#ff8a2a', rays: '#ffb060' }, k) });
  def.transformCutscene = f => PxKit.cineForm(f, { name: 'MOLTEN CORE', dur: 6.4, tc: [1.0, 3.4], tf: 3.7, c1: '#ff5a1a', c2: '#ffe08a', c3: '#240600', motif: 'rise', shape: 'rect', pose: ['idle', 'charge', 'victory'], cap1: 'Under every crust, a furnace.', cap2: 'Take off the lid.', title: 'MOLTEN CORE', sub: 'VULCAN', size: 104,
    cues: [[0, () => sfx('vlBubble', 0, 12)], [1.4, () => sfx('vlClang')], [3.7, () => { sfx('vlRoar', 0, 1.8); sfx('vlSplash'); sfx('boom'); }]],
    bg: (x, t, k) => PxKit.sky(x, t, { top: '#1a0400', bot: '#8a2a04', mount: '#2a0a04', embers: '#ff8a2a' }, k) });
})();
