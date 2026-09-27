// ============================================================
//  MOONKAI — move system (frame data @ 60fps)
//  Move: { name, kind, level, pose, s (startup), a (active), r (recovery),
//          hit{box,dmg,guard,hs,bs,kb,launch,wb,gb,kd,multi,every,...},
//          vel[[from,to,vx,vy]], inv[a,b], pinv[a,b], armor[a,b], ev{frame:fn}, cost, air, landEnd, ... }
//  Levels: 0 light · 1 medium · 2 heavy · 3 special · 4 super · 5 ultimate
// ============================================================
const FPS = 60;
const H_ = o => Object.assign({ dmg: 40, guard: 'mid', hs: 18, bs: 12, kb: [150, 0], box: [8, -95, 50, 40], sfx: 'm' }, o);

// ---------- normals ----------
// style: reach, power, speed (frame multiplier), weapon, heavy (armor on 5H), poses
function makeNormals(st = {}) {
  const R = (st.reach || 1) * (st.weapon ? 1.25 : 1), P = st.power || 1, S = st.speed || 1;
  const f = n => Math.max(2, Math.round(n * S));
  const N = {
    '5L': { name: 'Jab', kind: 'normal', level: 0, pose: 'punch', s: f(5), a: 3, r: f(9), hit: H_({ dmg: 28 * P, box: [6, -100, 50 * R, 30], hs: 16, bs: 11, kb: [110, 0], sfx: 'l' }) },
    '5L2': { name: 'Cross', kind: 'normal', level: 0, pose: 'punch2', s: f(6), a: 3, r: f(10), hit: H_({ dmg: 30 * P, box: [6, -98, 54 * R, 32], hs: 17, bs: 11, kb: [120, 0], sfx: 'l' }) },
    '5M': { name: 'Roundhouse', kind: 'normal', level: 1, pose: 'kick', s: f(8), a: 4, r: f(14), hit: H_({ dmg: 52 * P, box: [6, -86, 66 * R, 44], hs: 20, bs: 14, kb: [170, 0] }) },
    '5H': { name: 'Smash', kind: 'normal', level: 2, pose: 'heavy', s: f(13), a: 5, r: f(21), vel: [[8, 16, 260, null]], armor: st.heavy ? [4, 16] : null, hit: H_({ dmg: 78 * P, box: [6, -104, 72 * R, 58], hs: 30, bs: 16, kb: [760, -160], launch: true, wb: true, sfx: 'h' }) },
    '2L': { name: 'Low Jab', kind: 'normal', level: 0, pose: 'c_light', crouch: true, s: f(5), a: 3, r: f(9), hit: H_({ dmg: 24 * P, guard: 'low', box: [6, -52, 50 * R, 30], hs: 15, bs: 10, kb: [100, 0], sfx: 'l' }) },
    '2M': { name: 'Sweep', kind: 'normal', level: 1, pose: 'sweep', crouch: true, s: f(9), a: 4, r: f(16), hit: H_({ dmg: 48 * P, guard: 'low', box: [6, -30, 76 * R, 30], hs: 20, bs: 14, kb: [160, 0] }) },
    '2H': { name: 'Launcher', kind: 'normal', level: 2, pose: 'uppercut', s: f(10), a: 5, r: f(22), jc: true, hit: H_({ dmg: 66 * P, box: [-4, -160, 60 * R, 150], hs: 30, bs: 15, kb: [40, -1000], launch: true, sfx: 'h', antiAir: true }) },
    'jL': { name: 'Air Jab', kind: 'normal', level: 0, pose: 'air_light', air: true, landEnd: true, s: f(5), a: 4, r: f(8), hit: H_({ dmg: 26 * P, guard: 'high', box: [4, -86, 52 * R, 44], hs: 17, bs: 11, kb: [80, -140], sfx: 'l' }) },
    'jM': { name: 'Air Kick', kind: 'normal', level: 1, pose: 'air_mid', air: true, landEnd: true, s: f(7), a: 5, r: f(12), hit: H_({ dmg: 42 * P, guard: 'high', box: [6, -76, 66 * R, 46], hs: 19, bs: 13, kb: [100, -160] }) },
    'jH': { name: 'Hammer', kind: 'normal', level: 2, pose: 'air_heavy', air: true, landEnd: true, s: f(10), a: 5, r: f(15), hit: H_({ dmg: 64 * P, guard: 'high', box: [-4, -112, 76 * R, 80], hs: 26, bs: 15, kb: [360, 520], kd: 'soft', launch: true, sfx: 'h' }) },
    'j2H': { name: 'Spike', kind: 'normal', level: 2, pose: 'air_spike', air: true, landEnd: true, s: f(12), a: 5, r: f(16), hit: H_({ dmg: 66 * P, guard: 'high', box: [-10, -40, 84 * R, 56], hs: 28, bs: 15, kb: [120, 1000], gb: true, launch: true, sfx: 'h' }) },
    'throw': { name: 'Throw', kind: 'throw', level: 2, pose: 'throw', s: 5, a: 3, r: 22, throwMove: true, hit: H_({ dmg: 90 * P, guard: 'throw', box: [0, -100, 46, 90], hs: 30, kb: [520, -520], launch: true, kd: 'hard', sfx: 'h' }) },
  };
  if (st.poses) for (const [k, p] of Object.entries(st.poses)) if (N[k]) N[k].pose = p;
  for (const [k, m] of Object.entries(N)) m.id = k;
  return N;
}
const AUTO_GROUND = ['5L', '5L2', '5M', '2H'], AUTO_AIR = ['jL', 'jM', 'jH'];

// ---------- archetypes ----------
function mk(o, d) {
  const m = Object.assign({ kind: 'special', level: 3, pose: 'cast', s: 12, a: 1, r: 18 }, d || {}, o);
  if (o.hit) m.hit = H_(Object.assign({}, d && d.hit || {}, o.hit));
  return m;
}
function superize(m, cost) {
  m.kind = cost >= 300 ? 'ult' : 'super'; m.level = cost >= 300 ? 5 : 4; m.cost = cost; m.flash = true;
  m.inv = m.inv || [1, m.s + 2];
  return m;
}
const Mv = {
  // Projectile(s). proj: speed, r, dmg, count, spread, angle, g, homing, pierce, explode, status, kind, color, core, life, prio, hits, hs, kb
  shot(o) {
    const p = Object.assign({ speed: 720, r: 11, dmg: 48, hs: 20, bs: 14, kb: [180, -40], count: 1, spread: 0.2, angle: 0, kind: 'orb', color: '#8fd3ff', core: '#fff', life: 2.2, prio: 1 }, o.proj);
    const at = o.s || 12;
    return mk(o, { pose: 'cast', s: at, a: 1, r: 18, ev: Object.assign({ [at]: f => Combat.fireShots(f, p) }, o.ev || {}), ai: { min: 140, max: 1500, use: 'zone' } });
  },
  // Beam from hand (or mouth): len, width, dur (frames), dmg per tick, tick, angle, color, style
  beam(o) {
    const b = Object.assign({ len: 1600, width: 38, dur: 40, dmg: 16, tick: 5, angle: 0, color: '#bff4ff', core: '#fff', kb: [140, -30], hs: 14 }, o.beam);
    const at = o.s || 16;
    return mk(o, { pose: 'cast', s: at, a: b.dur, r: 20, ev: { [at]: f => Combat.fireBeam(f, b) }, ai: { min: 100, max: 1600, use: 'zone' } });
  },
  // Dashing strike: speed, frames, hits
  rush(o) {
    const sp = o.speed || 1000, fr = o.frames || 16, s = o.s || 10;
    return mk(o, { pose: 'dash', s, a: fr, r: 16, vel: [[s, s + fr, sp, o.vy ?? null]], pass: o.pass, hit: Object.assign({ box: [-10, -100, 66, 90], dmg: 70, kb: [420, -260], launch: true, hs: 24, bs: 14, multi: 1 }, o.hit || {}), ai: { min: 0, max: sp * fr / 60 * 0.8, use: 'approach' } });
  },
  // Rising anti-air (DP): invulnerable on startup
  rising(o) {
    const s = o.s || 5;
    return mk(o, { pose: 'uppercut', s, a: 14, r: 26, inv: [1, s + 5], vel: [[s, s + 14, o.vx || 180, -(o.height || 900)]], air: o.air, hit: Object.assign({ box: [-6, -150, 64, 150], dmg: 80, kb: [120, -900], launch: true, hs: 30, multi: 3, every: 4 }, o.hit || {}), ai: { min: 0, max: 120, use: 'anti' } });
  },
  // Air dive (air only unless groundOK)
  dive(o) {
    const s = o.s || 8;
    return mk(o, { pose: o.pose || 'kick', air: true, airOnly: !o.groundOK, landEnd: true, s, a: 30, r: 10, vel: [[s, s + 30, o.vx || 800, o.vy || 900]], hit: Object.assign({ box: [0, -60, 60, 60], dmg: 70, kb: [260, -300], launch: true, guard: 'high', hs: 22 }, o.hit || {}), ai: { min: 0, max: 400, use: 'approach' } });
  },
  // Teleport: to 'behind' | 'above' | 'front' | 'back', then optional follow-up hit
  teleport(o) {
    const s = o.s || 10;
    const m = mk(o, { pose: 'cast', s, a: o.hit ? 4 : 1, r: 16, inv: [1, s + 2], ev: { [s - 1]: f => Combat.teleport(f, o.to || 'behind') }, ai: { min: 120, max: 1500, use: 'approach' } });
    if (o.hit) { m.hit = H_(Object.assign({ box: [0, -100, 60, 90], dmg: 60, kb: [500, -200], launch: true, hs: 24 }, o.hit)); m.s = s + (o.hitDelay || 6); m.ev = { [s - 1]: f => Combat.teleport(f, o.to || 'behind') }; m.pose = o.pose || 'heavy'; }
    return m;
  },
  // Command grab: unblockable, anim 'slam'|'toss'|'drain'|'suplex'|'spin'
  grab(o) {
    return mk(o, { pose: 'throw', s: o.s || 8, a: 4, r: 30, grab: Object.assign({ anim: 'slam', dmg: 110, frames: 36 }, o.grabData || {}), hit: Object.assign({ box: [0, -110, o.range || 56, 110], dmg: 0, guard: 'unblock', hs: 1 }, o.hit || {}), ai: { min: 0, max: (o.range || 56) - 10, use: 'grab' } });
  },
  // Counter stance: if struck during window → response
  counter(o) {
    const w = o.window || 24;
    return mk(o, { pose: 'block', s: 2, a: w, r: 18, counter: { resp: o.resp || 'strike', dmg: o.dmg || 90 }, ai: { min: 0, max: 140, use: 'counter' } });
  },
  // Hazard spawns (zone, spike/pillar at enemy, strikes from sky, wave, trap/mine, turret, minion, wall, clone)
  place(o) {
    const at = o.s || 14;
    return mk(o, { pose: o.pose || 'cast', s: at, a: 1, r: o.r || 20, ev: { [at]: f => Combat.place(f, o.spawn) }, ai: o.ai || { min: 0, max: 1500, use: 'trap' } });
  },
  // Self buff / install: status map for dur seconds
  buff(o) {
    return mk(o, { pose: 'charge', s: o.s || 14, a: 1, r: 12, ev: { [o.s || 14]: f => Combat.buff(f, o.effects, o.dur || 6, o.name) }, ai: { min: 250, max: 2000, use: 'buff' } });
  },
  // In-place multi-hit flurry
  flurry(o) {
    return mk(o, { pose: o.pose || 'punch', s: o.s || 8, a: (o.hits || 6) * (o.every || 3), r: 20, vel: o.vel, hit: Object.assign({ box: [0, -110, 80, 90], dmg: 16, kb: [60, -20], hs: 14, multi: o.hits || 6, every: o.every || 3 }, o.hit || {}), finisher: o.finisher, ai: { min: 0, max: 90, use: 'combo' } });
  },
  // Rekka: chain of steps, pressing the same button continues
  rekka(o) {
    const steps = o.steps.map((st, i) => { const m = st.shot ? Mv.shot(st) : st.place ? Mv.place(st) : Mv.rush(st); m.id = o.id + '_' + i; m.name = st.name || o.name; return m; });
    for (let i = 0; i < steps.length - 1; i++) steps[i].follow = steps[i + 1];
    const first = steps[0]; first.name = o.name; first.desc = o.desc; first.ai = { min: 0, max: 260, use: 'combo' };
    return first;
  },
  heal(o) { return mk(o, { pose: 'charge', s: o.s || 20, a: 1, r: 20, ev: { [o.s || 20]: f => Combat.healSelf(f, o.amount || 120) }, ai: { min: 400, max: 3000, use: 'heal' } }); },
  swap(o) { return mk(o, { pose: 'cast', s: 14, a: 1, r: 18, ev: { 14: f => Combat.swap(f, o) }, ai: { min: 200, max: 1500, use: 'trap' } }); },
  custom(o) { return mk(o, {}); },
};

// ---------- supers & ultimates ----------
const Sup = {
  beam(o) { return superize(Mv.beam(Object.assign({ s: 20, beam: Object.assign({ width: 70, dur: 60, dmg: 22, tick: 5, len: 2200, super: true }, o.beam) }, o, { beam: Object.assign({ width: 70, dur: 60, dmg: 22, tick: 5, len: 2200, super: true }, o.beam) })), 100); },
  rush(o) { return superize(Mv.rush(Object.assign({ s: 14, speed: 1300, frames: 18 }, o, { hit: Object.assign({ dmg: 26, multi: 8, every: 3, kb: [120, -60], hs: 20, box: [-20, -110, 90, 100] }, o.hit || {}) })), 100); },
  barrage(o) { const m = Mv.shot(Object.assign({ s: 16, r: 30 }, o, { proj: Object.assign({ count: 1, prio: 2 }, o.proj) })); const n = o.volleys || 8; m.a = n * 4; m.ev = {}; for (let i = 0; i < n; i++) m.ev[16 + i * 4] = f => Combat.fireShots(f, Object.assign({ count: 1, prio: 2, speed: 900, r: 12, dmg: 22, kind: 'orb', color: '#fff', core: '#fff', life: 2, hs: 18, kb: [120, -40] }, o.proj, { angle: (o.proj && o.proj.angle || 0) + rand(-0.12, 0.12) })); return superize(m, 100); },
  place(o) { return superize(Mv.place(Object.assign({ s: 18 }, o)), 100); },
  grab(o) { return superize(Mv.grab(Object.assign({ s: 6 }, o, { grabData: Object.assign({ dmg: 220, frames: 50 }, o.grabData) })), 100); },
  install(o) { return superize(Mv.buff(Object.assign({ s: 16 }, o)), 100); },
  rising(o) { return superize(Mv.rising(Object.assign({ s: 4, hit: Object.assign({ dmg: 34, multi: 7, every: 3, kb: [100, -1000] }, o.hit || {}) }, o)), 100); },
  flurry(o) { return superize(Mv.flurry(Object.assign({ hits: 12, every: 3, hit: Object.assign({ dmg: 20, box: [0, -120, 100, 110] }, o.hit || {}) }, o)), 100); },
};
// Level 3: activation must connect; then the cinematic plays.
// act: 'beam' | 'rush' | 'grab' | 'shot' | 'strike' | 'burst'
function Ult(o) {
  let m;
  const hit = { dmg: 10, hs: 60, kb: [0, 0], ultConnect: true };
  switch (o.act) {
    case 'beam': m = Mv.beam({ s: 26, beam: Object.assign({ width: 90, dur: 50, dmg: 6, tick: 6, len: 2400, super: true, ultConnect: true, color: o.color }, o.beam) }); break;
    // lunging command grab: can snatch a juggled / hitstunned target, so it works as a combo ender
    case 'grab': m = Mv.grab({ s: 8, range: o.range || 90, grabData: { anim: 'ult', dmg: 0, frames: 10, ultConnect: true, combo: true, air: true } }); m.a = 16; m.pose = 'dash'; m.vel = [[8, 24, 1100, null]]; m.hit.box = [0, -200, o.range || 90, 200]; break;
    case 'shot': m = Mv.shot({ s: 24, proj: Object.assign({ speed: 1100, r: 26, dmg: 10, prio: 3, ultConnect: true, color: o.color, kind: o.kind || 'orb', life: 2.5, hs: 60, kb: [0, 0] }, o.proj, { r: Math.max(34, (o.proj && o.proj.r) || 26) }) }); break;
    case 'strike': m = Mv.place({ s: 24, spawn: { kind: 'strike', at: 'enemy', delay: 0.35, dmg: 10, style: o.style || 'bolt', color: o.color, ultConnect: true } }); break;
    case 'burst': m = mk({ pose: 'charge', s: 12, a: 10, r: 40, hit: Object.assign({ box: [-200, -520, 400, 540], centered: true }, hit) }); break;
    default: m = Mv.rush({ s: 20, speed: 1500, frames: 18, hit }); break;
  }
  if (m.hit) m.hit = Object.assign(m.hit, hit);
  Object.assign(m, { name: o.name, desc: o.desc, ult: { dmg: o.dmg || 380, cutscene: o.cutscene, template: o.template, fx: o.fx, after: o.after }, recoverWhiff: 40 });
  m.r = (m.r || 20) + 24;
  return superize(m, 300);
}
