// ============================================================
//  MOONKAI — systems: save data, settings, achievements, music, gamepads
// ============================================================

// ---------- save data (localStorage, per-browser, always optional) ----------
const Save = {
  key: 'moonkai3',
  data: null,
  defaults() {
    return {
      settings: { master: 0.8, music: 0.45, sfx: 0.9, shake: true, flashes: true, dmgNums: true, roundTime: 120, rounds: 3, cpu: 2, hints: true, hitboxes: false },
      records: { wins: {}, played: {}, matches: 0, bestCombo: 0, bestComboDmg: 0, survival: 0, timeAttack: 0, stages: {}, story: 0, arcade: {}, trials: {}, vanishes: 0, transforms: 0, ults: 0, destroyed: 0, bars: 0, techs: 0, perfects: 0, clashes: 0, teamWins: 0, bossRush: 0, tutorial: 0 },
      ach: {},
    };
  },
  load() {
    const d = this.defaults();
    try {
      const s = JSON.parse(localStorage.getItem(this.key) || 'null');
      if (s) { Object.assign(d.settings, s.settings || {}); Object.assign(d.records, s.records || {}); Object.assign(d.ach, s.ach || {}); }
    } catch (e) { /* storage blocked: play without saving */ }
    this.data = d;
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { } },
  get set() { return this.data.settings; },
  get rec() { return this.data.records; },
  bump(k, n = 1) { this.rec[k] = (this.rec[k] || 0) + n; },
  bumpMap(k, id, n = 1) { const m = this.rec[k] || (this.rec[k] = {}); m[id] = (m[id] || 0) + n; },
};
Save.load();

// ---------- achievements ----------
const ACHIEVEMENTS = [
  ['first_win', 'First Blood', 'Win your first match.'],
  ['combo10', 'Combo Rookie', 'Land a 10-hit combo.'],
  ['combo25', 'Combo Artist', 'Land a 25-hit combo.'],
  ['combo_dmg', 'Heavy Hitter', 'Deal 40% of a health bar in one combo.'],
  ['ult', 'Cinematic', 'Land an ultimate.'],
  ['ult10', 'Director\'s Cut', 'Land 10 ultimates.'],
  ['perfect', 'Untouchable', 'Win a round without taking damage.'],
  ['timeout', 'Clock Watcher', 'Win a round by time out.'],
  ['struggle', 'Beam Struggle', 'Win a beam struggle.'],
  ['destructive', 'Through the Wall', 'End a round with a destructive finish.'],
  ['story', 'Moonfall', 'Complete Story Mode.'],
  ['arcade', 'Arcade Champion', 'Clear Arcade with any fighter.'],
  ['arcade_hard', 'Hard Mode Hero', 'Clear Arcade on Hard.'],
  ['survival5', 'Survivor', 'Win 5 fights in Survival.'],
  ['survival15', 'Last One Standing', 'Win 15 fights in Survival.'],
  ['timeattack', 'Speedrunner', 'Clear Time Attack in under 4 minutes.'],
  ['bossrush', 'Giant Slayer', 'Clear Boss Rush.'],
  ['transform10', 'Shapeshifter', 'Transform 10 times.'],
  ['vanish20', 'Now You See Me', 'Vanish 20 times.'],
  ['reflect', 'Return to Sender', 'Reflect a projectile.'],
  ['tech10', 'Hard to Pin', 'Tech 10 throws or knockdowns.'],
  ['bars50', 'Big Spender', 'Spend 50 bars of Ki.'],
  ['destroy100', 'Urban Renewal', 'Destroy 100 structures.'],
  ['roster20', 'Well Rounded', 'Play 20 different fighters.'],
  ['roster60', 'Completionist', 'Play all 61 fighters.'],
  ['stages', 'World Tour', 'Fight on all 12 stages.'],
  ['team', 'Squad Goals', 'Win a 3v3 team match.'],
  ['clutch', 'Clutch', 'Win a team match with your last fighter under 10% health.'],
  ['spark_break', 'Breakout', 'Break a combo with Sparking Blast.'],
  ['counter', 'Read You', 'Land 20 counter hits.'],
  ['trials10', 'Lab Monster', 'Complete 10 combo trials.'],
  ['tutorial', 'Graduate', 'Complete the tutorial.'],
  ['rival', 'Old Grudge', 'Win a rival match in Arcade.'],
  ['revive', 'Second Wind', 'Revive as Kael\'s demon form.'],
  ['moonkai', 'Look at the Moon', 'Transform into Moonkai.'],
];
const Ach = {
  queue: [],
  unlock(id) {
    if (Save.data.ach[id]) return;
    const a = ACHIEVEMENTS.find(x => x[0] === id); if (!a) return;
    Save.data.ach[id] = Date.now(); Save.save();
    this.queue.push({ name: a[1], desc: a[2], t: 0 });
    Sfx.tone(880, 0.15, 'square', 0.08, 1320); Sfx.tone(1320, 0.2, 'square', 0.06, 1760, 0.1);
  },
  check() {
    const r = Save.rec;
    if (r.ults >= 1) this.unlock('ult'); if (r.ults >= 10) this.unlock('ult10');
    if (r.transforms >= 10) this.unlock('transform10');
    if (r.vanishes >= 20) this.unlock('vanish20');
    if (r.techs >= 10) this.unlock('tech10');
    if (r.bars >= 50) this.unlock('bars50');
    if (r.destroyed >= 100) this.unlock('destroy100');
    const played = Object.keys(r.played).length;
    if (played >= 20) this.unlock('roster20'); if (played >= ROSTER.length) this.unlock('roster60');
    if (Object.keys(r.stages).length >= 12) this.unlock('stages');
    if ((r.counters || 0) >= 20) this.unlock('counter');
    if (Object.keys(r.trials).length >= 10) this.unlock('trials10');
  },
  draw(c, dt) {
    const a = this.queue[0]; if (!a) return;
    a.t += dt;
    const y = 16 + Math.min(1, a.t * 4) * 0 - (a.t > 3.3 ? (a.t - 3.3) * 200 : 0);
    const x = W - 340 + Math.max(0, 1 - a.t * 4) * 340;
    c.fillStyle = 'rgba(20,14,40,0.92)'; roundRect(c, x, y + 120, 320, 64, 10); c.fill();
    c.strokeStyle = '#ffd35a'; c.lineWidth = 2; c.stroke();
    smallText(c, '🏆 ACHIEVEMENT UNLOCKED', x + 14, y + 138, 12, '#ffd35a');
    smallText(c, a.name, x + 14, y + 158, 17, '#fff');
    smallText(c, a.desc, x + 14, y + 175, 11, '#bbc');
    if (a.t > 3.6) this.queue.shift();
  },
};

// ---------- volumes ----------
Sfx.applyVolumes = function () {
  if (!this.ac) return;
  const s = Save.set;
  this.master.gain.value = 0.35 * s.master;
  this.out.gain.value = s.sfx;
  this.musicBus.gain.value = s.music;
};

// ---------- procedural music ----------
// Each track: tempo, root note, scale, chord progression (scale degrees), a drum pattern and a "mood" seed.
const SCALES = { minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], phryg: [0, 1, 3, 5, 7, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11], pent: [0, 3, 5, 7, 10] };
const TRACKS = {
  menu: { bpm: 96, root: 45, scale: 'dorian', prog: [0, 5, 3, 4], drums: 'k...h...s...h...', lead: 'square', seed: 3, bassT: 'triangle' },
  select: { bpm: 118, root: 47, scale: 'minor', prog: [0, 3, 5, 4], drums: 'k.h.s.h.k.h.s.hh', lead: 'square', seed: 9, bassT: 'square' },
  metro: { bpm: 140, root: 45, scale: 'minor', prog: [0, 5, 3, 6], drums: 'k.h.s.hkk.h.s.h.', lead: 'sawtooth', seed: 11, bassT: 'sawtooth' },
  harbor: { bpm: 124, root: 48, scale: 'major', prog: [0, 4, 5, 3], drums: 'k...s..kk...s...', lead: 'triangle', seed: 21, bassT: 'triangle' },
  magma: { bpm: 150, root: 40, scale: 'phryg', prog: [0, 1, 0, 6], drums: 'k.k.s.k.k.k.s.kk', lead: 'sawtooth', seed: 31, bassT: 'sawtooth' },
  frost: { bpm: 110, root: 50, scale: 'harm', prog: [0, 5, 3, 4], drums: 'k...h.h.s...h.h.', lead: 'triangle', seed: 41, bassT: 'triangle' },
  lunar: { bpm: 100, root: 43, scale: 'pent', prog: [0, 3, 1, 4], drums: 'k.......s.......', lead: 'sine', seed: 51, bassT: 'sine' },
  sky: { bpm: 128, root: 52, scale: 'major', prog: [0, 3, 4, 5], drums: 'k.h.s.h.k.hhs.h.', lead: 'square', seed: 61, bassT: 'triangle' },
  neon: { bpm: 145, root: 42, scale: 'minor', prog: [0, 6, 5, 4], drums: 'k.hks.h.k.hks.hh', lead: 'square', seed: 71, bassT: 'sawtooth' },
  manor: { bpm: 104, root: 41, scale: 'harm', prog: [0, 3, 4, 0], drums: 'k.....h.s.....h.', lead: 'triangle', seed: 81, bassT: 'square' },
  colosseum: { bpm: 136, root: 46, scale: 'dorian', prog: [0, 3, 4, 3], drums: 'k.k.s...k.k.s.s.', lead: 'sawtooth', seed: 91, bassT: 'square' },
  void: { bpm: 120, root: 38, scale: 'phryg', prog: [0, 1, 6, 1], drums: 'k..k..s.k..k.ss.', lead: 'sawtooth', seed: 101, bassT: 'sawtooth' },
  jungle: { bpm: 132, root: 49, scale: 'pent', prog: [0, 2, 3, 1], drums: 'k.hkh.s.khh.s.hk', lead: 'triangle', seed: 111, bassT: 'triangle' },
  desert: { bpm: 116, root: 44, scale: 'harm', prog: [0, 1, 0, 5], drums: 'k..hk.s.k..hk.s.', lead: 'sawtooth', seed: 121, bassT: 'square' },
  boss: { bpm: 160, root: 39, scale: 'harm', prog: [0, 5, 1, 4], drums: 'kkhskkhskkhskshs', lead: 'sawtooth', seed: 131, bassT: 'sawtooth' },
  story: { bpm: 84, root: 45, scale: 'minor', prog: [0, 5, 3, 4], drums: 'k.......h.......', lead: 'sine', seed: 141, bassT: 'sine' },
  victory: { bpm: 130, root: 48, scale: 'major', prog: [0, 3, 4, 0], drums: 'k.h.s.h.k.h.s.h.', lead: 'square', seed: 151, bassT: 'triangle' },
};
const Music = {
  track: null, name: null, nextT: 0, step: 0, melody: null,
  mtof: m => 440 * Math.pow(2, (m - 69) / 12),
  play(name) {
    if (this.name === name) return;
    this.name = name; this.track = TRACKS[name] || null; this.step = 0;
    if (this.track) {
      let s = this.track.seed; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
      const sc = SCALES[this.track.scale];
      this.melody = []; let deg = 7;
      for (let i = 0; i < 64; i++) {
        if (r() < 0.32) { this.melody.push(null); continue; }
        deg = clamp(deg + Math.round((r() - 0.5) * 4), 0, sc.length * 2 - 1);
        this.melody.push(deg);
      }
    }
    if (Sfx.ac) this.nextT = Sfx.ac.currentTime + 0.1;
  },
  stop() { this.track = null; this.name = null; },
  note(freq, t, dur, type, vol) {
    const ac = Sfx.ac, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(Sfx.musicBus); o.start(t); o.stop(t + dur + 0.02);
  },
  drum(kind, t) {
    const ac = Sfx.ac;
    if (kind === 'k') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); o.connect(g).connect(Sfx.musicBus); o.start(t); o.stop(t + 0.2); return; }
    const s = ac.createBufferSource(); s.buffer = Sfx.noiseBuf;
    const f = ac.createBiquadFilter(); f.type = kind === 'h' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'h' ? 7000 : 1800;
    const g = ac.createGain(); const d = kind === 'h' ? 0.04 : 0.14;
    g.gain.setValueAtTime(kind === 'h' ? 0.12 : 0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    s.connect(f).connect(g).connect(Sfx.musicBus); s.start(t, Math.random(), d + 0.02);
  },
  update() {
    const ac = Sfx.ac, tr = this.track;
    if (!ac || !tr || Save.set.music <= 0.001) return;
    if (this.nextT < ac.currentTime) this.nextT = ac.currentTime + 0.05;
    const spb = 60 / tr.bpm / 4, sc = SCALES[tr.scale];
    const pitch = deg => tr.root + 12 * Math.floor(deg / sc.length) + sc[((deg % sc.length) + sc.length) % sc.length];
    while (this.nextT < ac.currentTime + 0.2) {
      const i = this.step, t = this.nextT, chord = tr.prog[Math.floor(i / 16) % tr.prog.length];
      const dch = tr.drums[i % 16]; if (dch !== '.') this.drum(dch, t);
      if (i % 4 === 0 || (i % 4 === 3 && i % 8 === 7)) this.note(this.mtof(pitch(chord) - 12), t, spb * 3.2, tr.bassT, 0.16);
      if (i % 2 === 0) { const m = this.melody[(i / 2) % 64]; if (m !== null) this.note(this.mtof(pitch(m + chord) + 12), t, spb * 1.8, tr.lead, tr.lead === 'sawtooth' ? 0.035 : 0.05); }
      if (i % 16 === 0) for (const k of [0, 2, 4]) this.note(this.mtof(pitch(chord + k)), t, spb * 14, 'triangle', 0.025);
      this.nextT += spb; this.step++;
    }
  },
};

// ---------- gamepads → virtual keys ----------
const Pads = {
  map: [[0, 'A'], [1, 'B'], [2, 'X'], [3, 'Y'], [4, 'LB'], [5, 'RB'], [6, 'LT'], [7, 'RT'], [8, 'Back'], [9, 'Start'], [10, 'L3'], [11, 'R3'], [12, 'Up'], [13, 'Down'], [14, 'Left'], [15, 'Right']],
  connected: [false, false],
  poll() {
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < 2; i++) {
      const g = gps && gps[i];
      this.connected[i] = !!g;
      if (!g) continue;
      const set = (name, on) => { const code = 'Pad' + i + name; if (on) { if (!Input.down.has(code)) { Input.pressed.add(code); Sfx.init(); } Input.down.add(code); } else Input.down.delete(code); };
      for (const [b, n] of this.map) {
        let on = g.buttons[b] && g.buttons[b].pressed;
        if (n === 'Left') on = on || g.axes[0] < -0.5; if (n === 'Right') on = on || g.axes[0] > 0.5;
        if (n === 'Up') on = on || g.axes[1] < -0.6; if (n === 'Down') on = on || g.axes[1] > 0.5;
        set(n, on);
      }
    }
  },
};
