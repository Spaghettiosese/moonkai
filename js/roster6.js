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
