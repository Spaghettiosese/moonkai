// ============================================================
//  MOONKAI — roster builder + dialogue system + the original four
// ============================================================
const ROSTER = [];
const charById = id => ROSTER.find(d => d.id === id);

// shorthand projectile / hazard specs
const P = (o) => o;
function fighter(spec) {
  const d = Object.assign({ hp: 1000, walk: 270, weight: 1, jumps: 2, scale: 1, side: 'HERO', lines: {} }, spec);
  d.normals = makeNormals(spec.style || {});
  if (spec.patchNormals) spec.patchNormals(d.normals);
  const prep = (moves, pre) => { for (const [slot, m] of Object.entries(moves || {})) { if (!m) continue; m.id = m.id || d.id + pre + slot; m.slot = slot; m.owner = d.id; if (slot === 'jS') m.air = true; } };
  prep(d.moves, '_');
  d.super.id = d.id + '_super'; d.super.owner = d.id;
  const U = spec.ult;
  d.ult = Ult(Object.assign({ color: U.fx && U.fx.color }, U));
  d.ult.id = d.id + '_ult'; d.ultAct = U.act || 'rush';
  if (d.form) {
    d.form = Object.assign({ cost: 200, manual: true }, d.form);
    prep(d.form.moves, '_f');
    if (d.form.style) d.form.normals = makeNormals(Object.assign({}, spec.style || {}, d.form.style));
    if (d.form.super) d.form.super.id = d.id + '_fsuper';
  }
  if (!d.draw) d.draw = makeModelDraw(d.model, d.form && d.form.model);
  d.fx = U.fx;
  // select-screen stats derived from the kit
  d.stats = spec.stats || { POWER: 3, SPEED: 3, RANGE: 3, DEFENSE: 3, DIFFICULTY: 3 };
  ROSTER.push(d);
  return d;
}
const CHARACTERS = ROSTER;

// ---------------- dialogue ----------------
// Rival exchanges: key "a|b" (alphabetical ids not required; both orders checked)
const RIVALS = {};
function rival(a, b, lines, wins) { RIVALS[a + '|' + b] = { lines, wins: wins || {} }; }
const Dialogue = {
  pair(a, b) { return RIVALS[a.id + '|' + b.id] ? { r: RIVALS[a.id + '|' + b.id], flip: false } : RIVALS[b.id + '|' + a.id] ? { r: RIVALS[b.id + '|' + a.id], flip: true } : null; },
  intro(a, b) {
    const p = this.pair(a, b);
    if (p) return p.r.lines.map(([who, text]) => [p.flip ? 1 - who : who, text]);
    const la = a.lines.intro || ['...'], lb = b.lines.intro || ['...'];
    const fill = (s, o) => s.replace(/\{opp\}/g, o.name.split(' ')[0]);
    const out = [[0, fill(pick(la), b)], [1, fill(pick(lb), a)]];
    if (a.side === 'VILLAIN' && b.side === 'VILLAIN' && Math.random() < 0.5) out.push([0, 'Two villains, one city. Only one of us gets to ruin it.']);
    if (a.side === 'HERO' && b.side === 'HERO' && Math.random() < 0.5) out.push([1, "Sparring match? Fine. Try not to break anything. ...Everything's already broken, isn't it."]);
    return out;
  },
  win(w, l) {
    const p = this.pair(w, l);
    if (p && p.r.wins[w.id]) return p.r.wins[w.id];
    return (pick(w.lines.win || ['Victory.'])).replace(/\{opp\}/g, l.name.split(' ')[0]);
  },
};

// ============================================================
//  THE ORIGINAL FOUR (hand-drawn art + hand-made cinematics)
// ============================================================
fighter({
  id: 'eric', name: 'ERIC', title: 'The Moonborn', side: 'HERO', role: 'Powerhouse · Transformation', color: '#ffd35a', color2: '#2d5fd6',
  bio: 'A quiet college kid with a tail he keeps tucked away. Under a full moon, or one he makes himself, he becomes MOONKAI, a skyscraper-sized ape.',
  quote: "No full moon tonight? Fine. I'll make one.", ending: 'Eric pays for every broken window with his part-time job. It will take him four thousand years. He smiles anyway.',
  hp: 1050, walk: 270, draw: drawEric, handArt: true, rival: 'luna',
  face: { skin: '#f1c27d', hair: { type: 'spiky', color: '#141414' }, eyes: '#7a5230', top: '#2d5fd6', expr: 'grin', form: { eyes: '#ff2020', expr: 'shout', marks: [{ type: 'stripes', color: '#7a3a1a' }] } },
  style: { power: 1.05 },
  passive: ['Moon-Blooded', 'Ki charge is 30% faster. Every hit on a transformed Eric builds extra meter.'],
  passiveTick(f) { if (f.state === 'charge') f.meter += 0.4; },
  moves: {
    '5S': Mv.shot({ name: 'Ki Blast', desc: 'Energy orb.', proj: { speed: 760, r: 13, dmg: 70, color: '#8fd3ff', limit: 2, tag: 'ki' } }),
    '6S': Mv.rush({ name: 'Rising Fang', desc: 'Dashing uppercut launcher.', speed: 900, frames: 14, hit: { dmg: 110, kb: [120, -950], launch: true } }),
    '2S': Mv.rising({ name: 'Moon Crescent', desc: 'Invincible anti-air flip kick.', hit: { dmg: 40, multi: 3 } }),
    '4S': Mv.place({ name: 'Tail Whip Trap', desc: 'Swings his tail low and trips.', s: 10, spawn: { kind: 'wave', at: 'front', dx: 40, dir: 1, dmg: 70, life: 0.35, speed: 500 } }),
    'jS': Mv.shot({ name: 'Air Ki Volley', desc: 'Three blasts angled down.', proj: { speed: 800, r: 10, dmg: 36, count: 3, spread: 0.4, angle: 0.5, color: '#8fd3ff' } }),
  },
  super: Sup.beam({ name: 'Lunar Wave', desc: 'A full-power ki beam.', beam: { color: '#bfe4ff', dmg: 26 } }),
  ult: { act: 'beam', name: 'LUNAR CATACLYSM', desc: 'Mouth beam that erases the skyline. Must connect.', dmg: 1200, cutscene: csEricUlt, fx: { el: 'light', color: '#ffd35a', sky: ['#0a0716', '#2a1030', '#51203a'], lines: ['', ''] }, after: (a, t) => { if (!a.form) a.enterForm(8); } },
  transformCutscene: csEricTransform,
  form: { name: 'MOONKAI', desc: 'TIMED (12s). A giant ape: huge damage, armor, super armor.', timed: 12, cost: 300, scale: 2.0, speed: 0.75, jump: 0.8, armor: 0.6, dmg: 1.4, superArmor: true, heavyLanding: true,
    moves: {
      '5S': Mv.beam({ name: 'Mouth Beam', desc: 'Sweeping beam.', beam: { from: 'mouth', color: '#fff6b0', width: 46, dur: 50, dmg: 22, super: false } }),
      '6S': Mv.place({ name: 'Seismic Stomp', desc: 'Shockwaves both ways.', spawn: { kind: 'wave', at: 'self', dmg: 80, life: 0.9, dir: 1 }, ev: {} }),
    } },
  assist: '5S',
  lines: { intro: ["Let's keep the property damage under a billion this time.", 'Hey {opp}. Nice night for it.', "I'd rather be studying. Let's make this quick."], win: ['Sorry about the buildings. And you.', "I'll pay for that. Eventually.", 'Look at the moon next time. It helps.'], taunt: ['Is that it?', 'Come on!'], form: ['RRRRAAAAGH!', 'LOOK AT THE MOON!'], ult: ["Lunar... CATACLYSM!"], ultHit: ['That one was for the neighborhood.'], tag: ["I've got this!"], enter: ['My turn.'], assist: ['Ki blast!'] },
});
// Seismic stomp needs both directions
charById('eric').form.moves['6S'].ev = { 14: f => { for (const d of [-1, 1]) Combat.addHazard({ kind: 'wave', x: f.x + d * 80, dir: d, owner: f, side: f.side, dmg: 80, life: 0.9, hits: new Map(), move: f.move }); Cam.shake = 14; Sfx.slam(); } };

fighter({
  id: 'kira', name: 'KIRA SOL', title: 'The Undying Flame', side: 'HERO', role: 'Aerial · Burn', color: '#ff7a1a', color2: '#b3122e',
  bio: 'A firefighter who died saving a burning tower, and walked out of the ashes. Each time she falls, she rises hotter.',
  quote: 'Knock me down. I come back brighter.', ending: 'Kira returns to the fire station. Nobody asks why the new recruit never needs a helmet.',
  hp: 1000, walk: 290, draw: drawKira, handArt: true, rival: 'glacia', jumps: 3,
  face: { skin: '#d9a066', hair: { type: 'flame', color: '#ff7a1a' }, eyes: '#ffcc33', top: '#b3122e', mask: { type: 'band', color: '#ffcc33' }, expr: 'grin' },
  style: { speed: 0.9 },
  passive: ['Updraft', 'Triple jump. Fire attacks burn over time.'],
  moves: {
    '5S': Mv.shot({ name: 'Flare Dart', desc: 'Fast burning fireball.', s: 10, proj: { speed: 1000, r: 10, dmg: 60, color: '#ff7a1a', core: '#fff3a0', kind: 'fire', status: { burn: 2 }, limit: 2, tag: 'fd' } }),
    '6S': Mv.rush({ name: 'Blazing Dash', desc: 'Flaming shoulder that passes through.', speed: 1200, frames: 12, pass: true, hit: { dmg: 90, kb: [200, -500], status: { burn: 2 } } }),
    '2S': Mv.rising({ name: 'Rising Inferno', desc: 'Pillar of fire anti-air.', hit: { dmg: 42, multi: 3, status: { burn: 2 } } }),
    '4S': Mv.place({ name: 'Firewall', desc: 'Flames erupt in front of her.', spawn: { kind: 'zone', at: 'front', dx: 110, r: 70, life: 1.6, every: 0.25, dmg: 20, color: '#ff7a1a', status: { burn: 1 } }, cd: 3 }),
    'jS': Mv.dive({ name: 'Phoenix Dive', desc: 'Diagonal flaming dive kick.', hit: { dmg: 90, status: { burn: 2 } } }),
  },
  super: Sup.barrage({ name: 'Feather Storm', desc: 'A storm of burning feathers.', proj: { kind: 'fire', color: '#ff9a1a', dmg: 26, status: { burn: 1 } } }),
  ult: { act: 'shot', name: 'SUPERNOVA REBIRTH', desc: 'A phoenix of pure fire. On hit: cinematic, heals 400.', dmg: 1050, cutscene: csKiraUlt, proj: { kind: 'fire', color: '#ff7a1a' }, fx: { el: 'light', color: '#ff7a1a', sky: ['#200', '#600', '#f80'], lines: ['', ''] }, after: a => Combat.healSelf(a, 400) },
  transformCutscene: csKiraTransform,
  form: { name: 'PHOENIX', desc: 'Permanent. Flight (hold up), regeneration, stronger fire.', flight: true, regen: 1, dmg: 1.12, speed: 1.1, scale: 1.08,
    moves: { '5S': Mv.shot({ name: 'Feather Fan', desc: 'Three burning feathers.', s: 10, proj: { speed: 950, r: 10, dmg: 34, count: 3, spread: 0.35, kind: 'fire', color: '#ff9a1a', status: { burn: 2 } } }) } },
  assist: '2S',
  lines: { intro: ['Stand back. This is going to get hot.', "You're a fire hazard, {opp}.", "I've walked out of worse."], win: ['Stay down. Let the embers cool.', 'I rise. You fall. Simple.', "Don't worry, I'll call it in."], taunt: ['Too slow!', 'Feel the heat?'], form: ['Burn bright!'], ult: ['SUPERNOVA!'], ultHit: ['...and rise again.'], assist: ['Incoming!'], tag: ["I'll handle this!"], enter: ['Let me burn.'] },
});

fighter({
  id: 'vex', name: 'VEX', title: 'Architect of Nothing', side: 'VILLAIN', role: 'Zoner · Traps', color: '#b36bff', color2: '#2a0d3d',
  bio: 'A physicist who stared into a collapsing star, and something stared back. He wants to un-make the universe, one city at a time.',
  quote: 'Heroes build. Cities stand. Both are temporary.', ending: 'Vex finally reaches the heart of the singularity. It is empty. For the first time, so is he, and it is quiet.',
  hp: 1050, walk: 250, draw: drawVex, handArt: true, floaty: true, rival: 'eric',
  face: { skin: '#8e84a8', hair: { type: 'hood', color: '#1b0826' }, eyes: '#b36bff', glow: '#b36bff', top: '#3b1b52', mask: { type: 'full', color: '#101010' }, expr: 'cold' },
  passive: ['Null Field', 'Opponents near him build 25% less meter.'],
  passiveTick(f) { const o = f.opp; if (o && Math.abs(o.x - f.x) < 300 && f.st % 30 === 0) o.side.meter = Math.max(0, o.side.meter - 3); },
  moves: {
    '5S': Mv.place({ name: 'Shadow Spike', desc: 'Spike erupts under the enemy.', spawn: { kind: 'spike', at: 'enemy', delay: 0.45, dmg: 95, color: '#b36bff' }, ai: { min: 150, max: 1600, use: 'zone' } }),
    '6S': Mv.teleport({ name: 'Rift Step', desc: 'Teleport behind and slash.', to: 'behind', hit: { dmg: 90 } }),
    '2S': Mv.shot({ name: 'Null Orb', desc: 'Slow homing orb that weakens.', proj: { speed: 330, homing: 2.2, r: 15, dmg: 60, life: 3.5, color: '#b36bff', core: '#1a0026', status: { weaken: 4 }, limit: 1, tag: 'null' }, cd: 4 }),
    '4S': Mv.place({ name: 'Event Seed', desc: 'Plants a tiny black hole that pulls.', spawn: { kind: 'blackhole', at: 'front', dx: 260, r: 280, life: 1.8, dmg: 16 }, cd: 6 }),
    'jS': Mv.place({ name: 'Void Rain', desc: 'Three spikes around the enemy.', spawn: { kind: 'spike', at: 'enemy', delay: 0.5, count: 3, spacing: 80, stagger: 0.1, dmg: 55, color: '#b36bff' } }),
  },
  super: Sup.place({ name: 'Spike Field', desc: 'Seven spikes ripple out.', spawn: { kind: 'spike', at: 'enemy', delay: 0.35, count: 7, spacing: 70, stagger: 0.06, dmg: 70, color: '#b36bff' } }),
  ult: { act: 'strike', name: 'EVENT HORIZON', desc: 'A singularity drop. On hit: the city is swallowed.', dmg: 1150, cutscene: csVexUlt, style: 'light', color: '#b36bff', fx: { el: 'shadow', color: '#b36bff', sky: ['#0a0014', '#200a30', '#401a60'], lines: ['', ''] } },
  transformCutscene: csVexTransform,
  form: { name: 'VOID WRAITH', desc: 'Permanent. Lifesteal 25%, 25% damage resistance.', scale: 1.3, armor: 0.75, dmg: 1.1, lifesteal: 0.25 },
  assist: '5S',
  lines: { intro: ['You are a rounding error, {opp}.', 'Stand still. It hurts less.', 'I have already seen how this ends.'], win: ['Everything returns to nothing.', 'You were never really here.', 'Entropy wins. It always does.'], taunt: ['Pointless.', 'Tick. Tock.'], form: ['You think this body is the real me?'], ult: ['EVENT HORIZON.'], ultHit: ['Nothing. Not even you.'], assist: ['Hm.'], tag: ['Step aside.'], enter: ['Enough games.'] },
});

fighter({
  id: 'kael', name: 'KAEL', title: 'The Hollow Core', side: 'ANTI-HERO', role: 'Two lives · Comeback', color: '#ff4a2a', color2: '#1d4a5a',
  bio: 'A soldier kept alive by an experimental core in his chest. The core does not heal him. It holds something in.',
  quote: "Kill me once. Please. I'm begging you.", ending: 'Kael never finds a way to rebuild the core. He stops looking. The demon, it turns out, is a better listener.',
  hp: 900, walk: 270, draw: drawKael, handArt: true, reviveForm: true, reviveHp: 380, rival: 'razor',
  face: { skin: '#c9b3a0', hair: { type: 'slick', color: '#e8e8f0' }, eyes: '#3fe0ff', top: '#2b3440', marks: [{ type: 'scar', color: '#8a4a4a' }], expr: 'cold', form: { skin: '#6e1414', eyes: '#ff5a1a', glow: '#ff3a1a', horns: { color: '#140202' }, top: '#3a0b0b', marks: [{ type: 'cracks', color: '#ff5a1a' }], expr: 'grin' } },
  passive: ['Second Life', 'No transform button: his first KO each round revives him as a demon. Ultimate locked until then.'],
  ultLocked: f => !f.form,
  moves: {
    '5S': Mv.shot({ name: 'Core Pulse', desc: 'Cyan energy shot.', proj: { speed: 800, r: 11, dmg: 62, color: '#3fe0ff', limit: 2, tag: 'cp' } }),
    '6S': Mv.rush({ name: 'Breach Charge', desc: 'Shoulder charge with armor.', speed: 950, frames: 14, armor: [6, 20], hit: { dmg: 100, kb: [600, -200], wb: true } }),
    '2S': Mv.counter({ name: 'Core Guard', desc: 'Counter stance: absorbs a hit and strikes back.', window: 26, dmg: 120 }),
    '4S': Mv.buff({ name: 'Overclock', desc: 'Shield that absorbs 400 damage.', effects: { shield: 400 }, dur: 4, cd: 10 }),
    'jS': Mv.dive({ name: 'Meteor Drop', desc: 'Plunging knee.', vx: 500, vy: 1200, hit: { dmg: 90, gb: true } }),
  },
  super: Sup.rush({ name: 'Core Breaker', desc: 'Relentless combo rush.', hit: { dmg: 28 } }),
  ult: { act: 'shot', name: 'HELLFIRE BARRAGE', desc: 'Hellfire meteor. Locked until revived.', dmg: 1250, cutscene: csKaelUlt, proj: { kind: 'fire', color: '#ff3b1a' }, fx: { el: 'blood', color: '#ff4a2a', sky: ['#120000', '#400', '#a20'], lines: ['', ''] } },
  transformCutscene: csKaelRevive,
  form: { name: 'DEMON', desc: 'Revive only. Permanent. Lifesteal, stronger, ultimate unlocked.', manual: false, hint: 'THE CORE MUST BREAK FIRST', scale: 1.2, speed: 1.1, armor: 0.8, dmg: 1.2, lifesteal: 0.12,
    moves: {
      '5S': Mv.shot({ name: 'Hellfire Orb', desc: 'Arcing fireball that explodes.', proj: { speed: 640, angle: -0.42, g: 1100, r: 16, dmg: 80, explode: 90, color: '#ff3b1a', kind: 'fire' } }),
      '4S': Mv.shot({ name: 'Infernal Chain', desc: 'Hook that drags the enemy in.', proj: { speed: 1100, r: 10, dmg: 50, kind: 'hook', color: '#ff3b1a', trail: false, life: 0.7, pull: true, hs: 30 } }),
    } },
  assist: '6S',
  lines: { intro: ["Hit me. Hit me hard. You'll see.", "I don't want to fight you, {opp}. I want you to win.", 'The core is humming again.'], win: ['Still human. For now.', 'That was close. Too close.', 'The demon wanted more. I said no.'], taunt: ['Come on. Kill me.', 'Harder.'], form: ['It was never keeping me alive. It was keeping THIS in.'], ult: ['HELLFIRE!'], ultHit: ['You met what I really am.'], tag: ['Out of the way.'], enter: ["Let's end this."] },
});

rival('eric', 'vex', [[1, 'The moonborn boy. Your blood is the key to my door.'], [0, "Then you'll have to take it. Good luck with that."], [1, 'Luck is a rounding error.']], { eric: 'Your door stays shut, Vex. Forever.', vex: 'Your blood will open the sky.' });
rival('kael', 'razor', [[1, "Kael! You still owe me a rematch, core-boy."], [0, "I don't fight for fun, Razor."], [1, "Liar. I've seen you smile."]], { razor: 'Close fight. Beautiful.', kael: "Stay down. I'm not going to smile." });
