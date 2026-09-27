// ============================================================
//  MOONKAI — League of Legends / anime tributes (Volibear, DIO).
//  Aatrox lives in js/aatrox.js.
// ============================================================
//  VOLIBEAR, the Relentless Storm (fighter #63, League of Legends tribute)
//  Thundering Smash, Frenzied Maul, Sky Splitter, Stormbringer. Demigod: counts as divine.
// ============================================================
fighter({
  id: 'volibear', name: 'VOLIBEAR', title: 'The Relentless Storm', side: 'ANTI-HERO', role: 'Juggernaut · Lightning · Dive', color: '#7ad8ff', color2: '#0a1a3a',
  bio: 'An ancient demigod of the Freljord, a colossal thunder-bear who remembers when the world belonged to storms. Cities are just forests that forgot to be afraid of him.',
  quote: 'The storm does not ask. It takes.',
  ending: 'Volibear decides Metro City is too soft and leaves for the mountains. Every thunderstorm since is described by meteorologists as "somehow angry".',
  hp: 1100, walk: 250, deity: true, scale: 1.12, rival: 'volt',
  model: { build: 'giant', skin: '#e8ecf4', top: '#3a4a6a', topDark: '#1a2a4a', pants: '#2a3a5a', boots: '#1a2030', belt: '#7ad8ff', bracers: '#7ad8ff', pads: { color: '#9aa8c0' },
    animal: { type: 'wolf', color: '#eef2fa', eye: 'rgba(120,220,255,1)' }, eyes: { glow: '#7ad8ff' }, weapon: { type: 'claws', color: '#cfe8ff' }, emblem: { shape: 'bolt', color: '#7ad8ff' } },
  face: { expr: 'angry', eyes: '#7ad8ff', animal: { type: 'wolf', color: '#eef2fa', eye: 'rgba(120,220,255,1)' } },
  style: { reach: 1.15, power: 1.12, speed: 1.12, heavy: true },
  passive: ['The Relentless Storm', 'Each hit crackles with lightning: every 3rd hit deals 30 bonus damage.'],
  onHit(a, t) { if (a.move && /Maul/.test(a.move.name) && (t.status.slow || t.status.stun)) Combat.healSelf(a, 90); a.stormCount = (a.stormCount || 0) + 1; if (a.stormCount % 3 === 0 && t.hp > 1) { t.hp = Math.max(1, t.hp - 30); Game.fx.burst(t.x, t.y - 70, 10, { color: ['#7ad8ff', '#fff'], size: 6, speed: 300, glow: true, life: 0.3 }); } },
  moves: {
    '6S': Mv.rush({ name: 'Thundering Smash', desc: 'Charges forward and slams the foe into a stun.', s: 10, speed: 1200, frames: 18, hit: { dmg: 85, kb: [200, -300], stun: 0.6 } }),
    '5S': Mv.custom({ name: 'Frenzied Maul', desc: 'A savage bite. Heals if the foe is stunned or slowed.', pose: 'heavy', s: 11, a: 5, r: 20, hit: { dmg: 80, box: [0, -120, 80, 90], kb: [300, -150] }, onHit: (a, t) => { if (t.status.slow || t.status.stun) Combat.healSelf(a, 90); }, ai: { min: 0, max: 60, use: 'combo' } }),
    '2S': Mv.place({ name: 'Sky Splitter', desc: 'Calls a lightning bolt on the foe; it slows.', spawn: { kind: 'strike', at: 'enemy', delay: 0.55, dmg: 90, style: 'bolt', color: '#7ad8ff', wide: 60, status: { slow: 2 } }, ai: { min: 200, max: 1600, use: 'zone' } }),
    '4S': Mv.buff({ name: 'Storm Shield', desc: 'Wraps himself in a lightning shield.', effects: { shield: 160 }, dur: 5 }),
    'jS': Mv.dive({ name: 'Thunderclap', desc: 'Crashes down like a lightning strike.', vx: 400, vy: 1500, hit: { dmg: 90, box: [0, -80, 100, 80], gb: true, kb: [200, 900] } }),
  },
  super: Sup.place({ name: 'Frozen Thunder', desc: 'Five lightning bolts march across the screen.', spawn: { kind: 'strike', at: 'enemy', delay: 0.3, count: 5, spacing: 110, stagger: 0.1, dmg: 60, style: 'bolt', color: '#7ad8ff', wide: 44 } }),
  ult: { act: 'strike', name: 'STORMBRINGER', desc: 'Leaps into the sky and crashes down as the storm itself. Must connect.', dmg: 1120, template: 'storm', style: 'bolt', color: '#7ad8ff', wide: 70,
    fx: { el: 'bolt', color: '#7ad8ff', sky: ['#050a1a', '#1a2a4a', '#4a6a9a'], lines: ['I AM THE STORM!', 'Kneel before the thunder.'] } },
  form: { name: 'STORMBRINGER', desc: 'Permanent. Grows into a titanic thunder-bear: armored, lightning on every swing.', cost: 200, dmg: 1.12, armor: 0.88, speed: 0.95, scale: 1.2,
    model: { aura: '#7ad8ff', auraSize: 1.4, animal: { type: 'wolf', color: '#f8fbff', eye: 'rgba(160,240,255,1)' }, pads: { color: '#cfe8ff' }, top: '#2a3a6a' },
    moves: { '5S': Mv.custom({ name: 'Storm Maul', desc: 'Electrified bite that launches.', pose: 'heavy', s: 10, a: 6, r: 18, hit: { dmg: 95, box: [0, -130, 90, 100], kb: [400, -800], launch: true, status: { slow: 1.5 } }, ai: { min: 0, max: 70, use: 'combo' } }) } },
  assist: '2S',
  lines: {
    intro: ['You smell of cities, {opp}.', 'The old ways return.', 'I have wrestled mountains. You are a pebble.'],
    win: ['The storm passes. You do not.', 'Weak. Like all of this new world.', 'Remember the thunder, {opp}.'],
    taunt: ['RRAAAGH!', 'Hah!'], form: ['I AM THE STORM!', 'RRRROOOOAR!'], ult: ['STORMBRINGER!'], ultHit: ['The old gods walk again.'], tag: ['Stand back!'], enter: ['The storm arrives!'], assist: ['Thunder!'],
  },
});
rival('volibear', 'aatrox', [[0, 'Darkin. You reek of the old war.'], [1, 'And you of wet fur and pride, bear.']],
  { volibear: 'Back to your sword, prisoner.', aatrox: 'Even gods of storms can bleed.' });
rival('volibear', 'volt', [[1, "Whoa, big guy. I'm also lightning themed. Can we share?"], [0, 'No.']],
  { volibear: 'There is only ONE storm.', volt: 'Sorry, big fella. Faster wins.' });

// ============================================================
//  DIO BRANDO (fighter #64, JoJo's Bizarre Adventure tribute)
//  Stand: THE WORLD. Awakening stops time (slows the opponent to 1/3) for 6s.
// ============================================================
fighter({
  id: 'dio', name: 'DIO', title: 'The World', side: 'VILLAIN', role: 'Rushdown · Knives · Time stop', color: '#ffd23a', color2: '#2a1a4a',
  bio: 'A vampire who conquered death and a Stand user who conquers time. He arrived in Metro City a century late and immediately decided it belonged to him.',
  quote: 'It was me, DIO!',
  ending: 'DIO takes over Metro City\'s tallest tower and declares himself ruler of the night. Nobody argues. Nobody can move fast enough to argue.',
  hp: 980, walk: 275, rival: 'aurelion',
  model: { build: 'athletic', skin: '#f2dcc8', top: '#f0c020', topDark: '#b08a10', pants: '#f0c020', boots: '#2a8a4a', belt: '#1a1a1a', bracers: '#2a8a4a',
    hair: { type: 'slick', color: '#ffe46a' }, eyes: { glow: '#ff3050' }, emblem: { shape: 'star', color: '#2a8a4a' }, weapon: { type: 'knives', color: '#e8e8f0' } },
  face: { expr: 'smirk', eyes: '#ff3050', hair: { type: 'slick', color: '#ffe46a' }, skin: '#f2dcc8' },
  style: { reach: 1.1, speed: 0.9, power: 1.05 },
  passive: ['Vampirism', 'Heals 6% of all damage he deals.'],
  onHit(a, t, dmg) { if (dmg > 0 && a.hp > 0) a.hp = Math.min(a.maxHp, a.hp + dmg * 0.06); },
  moves: {
    '5S': Mv.flurry({ name: 'MUDA MUDA', desc: 'The World unleashes a barrage of punches.', hits: 10, every: 3, hit: { dmg: 14, box: [0, -120, 100, 100] }, finisher: { dmg: 60, kb: [600, -300], launch: true } }),
    '6S': Mv.shot({ name: 'Knife Throw', desc: 'A fan of five knives.', s: 10, proj: { speed: 1150, r: 8, dmg: 18, count: 5, spread: 0.3, kind: 'knife', color: '#e8e8f0' } }),
    '2S': Mv.rising({ name: 'Space Ripper Eyes', desc: 'Pressurised eye beams (anti-air).', height: 700, hit: { dmg: 30, multi: 3 } }),
    '4S': Mv.teleport({ name: 'Time Skip', desc: 'Stops time for a moment and appears behind the foe.', to: 'behind', hit: { dmg: 70, kb: [500, -300] } }),
    'jS': Mv.dive({ name: 'Road Roller Kick', desc: 'A plunging stomp.', vx: 600, vy: 1300, hit: { dmg: 80, gb: true, kb: [200, 900] } }),
  },
  super: Sup.barrage({ name: 'Knife Wall', desc: 'Throws knives during stopped time; they fly all at once.', volleys: 10, proj: { kind: 'knife', color: '#e8e8f0', speed: 1200, dmg: 18, r: 8 } }),
  ult: { act: 'strike', name: 'ROAD ROLLER DA!', desc: 'Time stops, and a road roller falls from the sky. Must connect.', dmg: 1120, template: 'meteor', style: 'anvil', color: '#ffd23a', wide: 70,
    fx: { el: 'time', color: '#ffd23a', sky: ['#1a0a2a', '#4a2a6a', '#c8a040'], lines: ['ZA WARUDO! TOKI WO TOMARE!', 'ROAD ROLLER DA!!'] } },
  form: { name: 'ZA WARUDO', desc: '6s. Time stops: the opponent moves at 1/3 speed. DIO moves freely.', timed: 6, cost: 300, timeSlowOpp: true, dmg: 1.05,
    model: { aura: '#ffd23a', auraSize: 1.4, eyes: { glow: '#ff1030' } } },
  assist: '6S',
  lines: {
    intro: ['You thought your first opponent would be someone else? But it was me, DIO!', 'How many breads have you eaten in your life, {opp}?', 'Oh? You\'re approaching me?'],
    win: ['WRYYYYYY!', 'You were a fool to challenge DIO.', 'Useless, useless, USELESS!'],
    taunt: ['MUDA!', 'WRYYY!'], form: ['ZA WARUDO! TOKI WO TOMARE!'], ult: ['ROAD ROLLER DA!'], ultHit: ['Time resumes.'], tag: ['Step aside.'], enter: ['It was me, DIO!'], assist: ['MUDA!'], moves: ['MUDA!', 'WRY!', 'Useless!'],
  },
});
rival('dio', 'aurelion', [[1, 'A vampire calling himself a king. Adorable.'], [0, 'A god who cannot stop time. How useless.']],
  { dio: 'Even heaven waits when DIO stops the clock.', aurelion: 'Kneel, bloodsucker.' });
rival('dio', 'quanta', [[1, 'You bend time with a... ghost?'], [0, 'And you bend it with a calculator. MUDA.']],
  { dio: 'There is only one master of time. DIO.', quanta: 'Time has rules, vampire. I wrote most of them.' });
