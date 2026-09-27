// ============================================================
//  MOONKAI — anime tributes (DIO). Aatrox: js/aatrox.js · Volibear: js/volibear.js
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
