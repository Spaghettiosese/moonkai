// ============================================================
//  MOONKAI — AATROX, the Darkin Blade (fighter #62, League of Legends tribute)
//  Kit mirrors his abilities: three-part Darkin Blade, Infernal Chains, Umbral Dash,
//  Deathbringer Stance (every 4th hit heals), and WORLD ENDER: a timed awakening that
//  cheats death once if he is KO'd while it is active.
// ============================================================
fighter({
  id: 'aatrox', name: 'AATROX', title: 'The Darkin Blade', side: 'VILLAIN', role: 'Bruiser · Sustain · Sweet spots', color: '#e0202a', color2: '#2a0406',
  bio: 'A warrior of a fallen empire, imprisoned in his own greatsword for millennia. Now he wears a stolen body of flesh and blood, and he wants only one thing: the end of all things, including himself.',
  quote: 'I am not the darkness. I am what it fears.',
  ending: 'Aatrox finds no war worthy of him in Metro City. He sits on a rooftop, sword across his knees, waiting. The city sleeps nervously for a very long time.',
  hp: 1060, walk: 245, rival: 'aurelion', deity: false,
  model: { build: 'heavy', skin: '#5a1a1e', top: '#2a0a0e', topDark: '#1a0508', pants: '#3a0a10', boots: '#1a0a0a', belt: '#8a1a1a', bracers: '#8a1a1a', kneepads: '#8a1a1a',
    hair: { type: 'bald', color: '#2a0a0a' }, horns: { color: '#2a0a0a' }, eyes: { glow: '#ff3030' }, pads: { color: '#6a0a12' },
    wings: { type: 'bat', color: '#3a0810', scale: 0.8 }, emblem: { shape: 'eye', color: '#ff3030' },
    weapon: { type: 'greatsword', len: 118, color: '#6a0a14', guard: '#2a0a0a', glow: '#ff2020' } },
  face: { expr: 'angry', skin: '#5a1a1e', eyes: '#ff3030', horns: { color: '#2a0a0a' }, hair: { type: 'bald', color: '#2a0a0a' } },
  style: { reach: 1.35, weapon: true, speed: 1.1, power: 1.08, heavy: true, poses: { '5M': 'heavy', '5H': 'slam' } },
  passive: ['Deathbringer Stance', 'Every 4th hit he lands heals 3% of his max health.'],
  onHit(a) { a.dbCount = (a.dbCount || 0) + 1; if (a.dbCount % 4 === 0 && a.hp > 0) { const h = Math.round(a.maxHp * 0.03); a.hp = Math.min(a.maxHp, a.hp + h); Game.popWorld(a.x, a.y - a.h - 20, '+' + h, '#ff5a5a', 16); } },
  moves: {
    '5S': Mv.rekka({ id: 'aatrox_q', name: 'The Darkin Blade', desc: 'Three sweeping slams (press S again). The third launches.', steps: [
      { name: 'Darkin Blade I', speed: 600, frames: 10, hit: { dmg: 58, box: [0, -130, 120, 120], kb: [260, 0], launch: false } },
      { name: 'Darkin Blade II', speed: 650, frames: 10, hit: { dmg: 64, box: [0, -130, 130, 120], kb: [260, 0], launch: false } },
      { name: 'Darkin Blade III', speed: 700, frames: 12, hit: { dmg: 90, box: [0, -150, 120, 150], kb: [300, -850], launch: true } }] }),
    '2S': Mv.shot({ name: 'Infernal Chains', desc: 'A chain of blood that slows and binds.', s: 14, proj: { speed: 1000, r: 12, dmg: 55, kind: 'hook', color: '#ff2a2a', status: { slow: 2.5 }, kb: [-300, -60] } }),
    '6S': Mv.rush({ name: 'Umbral Dash', desc: 'A quick dash strike. Cancels into anything.', s: 6, speed: 1300, frames: 10, hit: { dmg: 50, kb: [300, -200] } }),
    '4S': Mv.heal({ name: 'Blood Well', desc: 'Drinks from the blood of the fallen (heals 140).', amount: 140, s: 24 }),
    'jS': Mv.dive({ name: 'Sword Comet', desc: 'Plunging greatsword slam; ground bounce.', vx: 500, vy: 1300, hit: { dmg: 88, box: [0, -80, 90, 80], gb: true, kb: [200, 900] } }),
  },
  super: Sup.flurry({ name: 'Doom of the Darkin', desc: 'A furious flurry of greatsword strikes.', hits: 10, hit: { dmg: 24, box: [0, -140, 150, 130] }, finisher: { dmg: 110, kb: [800, -500], launch: true, wb: true } }),
  ult: { act: 'rush', name: 'WORLD ENDER', desc: 'Unfurls his wings and cleaves the world in two. Must connect.', dmg: 1120, template: 'meteor', color: '#e0202a',
    fx: { el: 'blood', color: '#e0202a', sky: ['#0a0002', '#3a0008', '#8a1010'], lines: ['I am the World Ender!', 'This is my war.'] } },
  form: { name: 'WORLD ENDER', desc: '12s. Grows, flies, 15% lifesteal. If KO\'d while active, he cheats death once at 30% health.', timed: 12, cost: 300,
    flight: true, dmg: 1.12, speed: 1.1, lifesteal: 0.15, scale: 1.18, cheatDeath: 0.3,
    model: { wings: { type: 'bat', color: '#5a0a14', scale: 1.6 }, aura: '#ff1a2a', auraSize: 1.3, weapon: { type: 'greatsword', len: 138, color: '#8a0a18', guard: '#2a0a0a', glow: '#ff3030' } } },
  assist: '6S',
  lines: {
    intro: ['I will not be imprisoned again, {opp}.', 'Your city is a tomb that has not closed yet.', 'Come. Let us end this.'],
    win: ['Is this all your world has to offer?', 'I was imprisoned for this?', 'Rest, {opp}. I envy you.'],
    taunt: ['Pathetic.', 'Fight me!'], form: ['I AM THE WORLD ENDER!', 'Behold the Darkin!'], ult: ['WORLD ENDER!'], ultHit: ['Your end has come.'],
    tag: ['Out of my way.'], enter: ['Finally.'], assist: ['Die!'], moves: ['Hah!', 'Die!', 'Suffer!'],
  },
});
rival('aatrox', 'aurelion', [[0, 'Another god. I have killed gods.'], [1, 'You have killed pretenders. I am the genuine article.'], [0, 'They all said that.']],
  { aatrox: 'Your heaven is next.', aurelion: 'Crawl back into your sword, demon.' });
rival('aatrox', 'kael', [[1, "There's something in your sword. Same as my chest."], [0, 'Then you know. The prison is the only thing that is truly yours.']],
  { aatrox: 'Break your core, boy. Become what you are.', kael: "I'm not you. I'll never be you." });

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
