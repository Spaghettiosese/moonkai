// ============================================================
//  MOONKAI — the roster (14 fighters)
//  Each: stats, model, passive, 2 skills (+ transformed variants), form, ultimate.
// ============================================================
const lim = (f, tag, n) => { const own = Game.projectiles.filter(p => p.owner === f && p.tag === tag); if (own.length >= n) own[0].life = 0; };
const shots = (f, n, spread, o) => { for (let i = 0; i < n; i++) Ab.proj(f, Object.assign({}, o, { angle: (n === 1 ? 0 : -spread / 2 + spread * i / (n - 1)) + (o.baseAngle || 0) })); };

const M_VOLT = { skin: '#e6b98c', top: '#1a1a2e', pants: '#1a1a2e', boots: '#ffe000', belt: '#ffe000', glove: '#ffe000', hair: { type: 'spiky', color: '#ffe95a' }, mask: { type: 'visor', color: '#ffe000' }, emblem: { shape: 'bolt', color: '#ffe000' }, stripes: '#ffe000' };
const M_GLACIA = { skin: '#d8e8f4', top: '#5aa0d8', topDark: '#2a6090', pants: '#e8f6ff', boots: '#9cd', belt: '#fff', hair: { type: 'crown', color: '#f4fbff', accent: '#9ff' }, cape: { color: '#bfe6ff' }, emblem: { shape: 'snow', color: '#fff' }, eyes: { color: '#39c' } };
const M_TITAN = { bulk: 1.6, skin: '#c68a5a', top: '#3a4a5a', pants: '#2a2a2a', boots: '#111', belt: '#e0a020', glove: '#e0a020', hair: { type: 'short', color: '#222' }, pads: { color: '#e0a020', size: 1.3 }, emblem: { shape: 'star', color: '#e0a020' }, weapon: { type: 'gauntlet', color: '#e0a020' } };
const M_NYX = { skin: '#c9a88a', top: '#15121c', pants: '#15121c', boots: '#0a0a0a', belt: '#c01040', hair: { type: 'bun', color: '#1a0a20' }, mask: { type: 'half', color: '#101014' }, scarf: { color: '#c01040' }, weapon: { type: 'dual', color: '#ccd' }, eyes: { color: '#c01040' } };
const M_GEAR = { skin: '#e0b090', top: '#e8e2d0', topDark: '#b8b2a0', pants: '#3a3a3a', boots: '#5a3a1a', belt: '#ffb020', hair: { type: 'mohawk', color: '#e8e8e8' }, mask: { type: 'goggles', color: '#5a3a1a', lens: '#9ff' }, weapon: { type: 'wrench', color: '#aab' }, emblem: { shape: 'gear', color: '#ffb020' } };
const M_SERAPH = { skin: '#f0d0b0', top: '#f4f0ff', topDark: '#c8c0e8', pants: '#e8e0ff', boots: '#ffd35a', belt: '#ffd35a', hair: { type: 'long', color: '#ffe9a0' }, halo: { color: '#ffe08a' }, weapon: { type: 'spear', color: '#ffd35a', tip: '#fff' }, emblem: { shape: 'cross', color: '#ffd35a' }, eyes: { color: '#58a' } };
const M_RAZOR = { skin: '#b08060', top: '#4a1010', topDark: '#2a0808', pants: '#222', boots: '#111', belt: '#888', hair: { type: 'mohawk', color: '#c01818' }, pads: { color: '#555', spikes: '#aaa' }, weapon: { type: 'greatsword', color: '#9aa' }, emblem: { shape: 'fang', color: '#c01818' }, scarf: { color: '#7a0a0a' } };
const M_TERRA = { skin: '#8a5a3a', top: '#4a6a3a', topDark: '#2a4a24', pants: '#5a4a3a', boots: '#3a2a1a', belt: '#c8a050', hair: { type: 'long', color: '#2a1a0a' }, emblem: { shape: 'rock', color: '#c8a050' }, weapon: { type: 'staff', color: '#6b4a2a', tip: '#8f8' }, pads: { color: '#7a6a5a' } };
const M_JINX = { skin: '#f0c8a0', top: '#7a2a9a', topDark: '#4a1a6a', pants: '#222', boots: '#7a2a9a', belt: '#ffd35a', hair: { type: 'jester', color: '#7a2a9a', accent: '#1a1a1a' }, mask: { type: 'band', color: '#fff' }, weapon: { type: 'cards' }, emblem: { shape: 'spade', color: '#ffd35a' }, stripes: '#ffd35a' };
const M_ECHO = { skin: '#d0a888', top: '#1a3a4a', topDark: '#0a2a3a', pants: '#2a2a3a', boots: '#88f0e0', belt: '#88f0e0', hair: { type: 'short', color: '#e0e0f0' }, mask: { type: 'visor', color: '#88f0e0' }, emblem: { shape: 'note', color: '#88f0e0' }, scarf: { color: '#88f0e0' } };

const CHARACTERS = [
  // ---------------------------------------------------------------- ERIC
  {
    id: 'eric', name: 'ERIC', title: 'The Moonborn', side: 'HERO', style: 'Powerhouse · Transformation', color: '#ffd35a', color2: '#2d5fd6',
    bio: 'A quiet college kid with a tail he keeps tucked away. Under a full moon, or one he makes himself, he becomes MOONKAI, a skyscraper-sized ape.',
    quote: '"No full moon tonight? Fine. I\'ll make one."', ending: 'Eric pays for every broken window with his part-time job. It will take him four thousand years. He smiles anyway.',
    hp: 1180, speed: 305, atk: 37, draw: drawEric,
    passive: ['Moon-Blooded', 'Transform meter fills 25% faster.'], meterRate: 1.25,
    skills: [
      { name: 'Ki Blast', desc: 'Energy orb.', cd: 1.1, ki: 18, ai: [120, 900], use(f) { lim(f, 'ki', 2); Ab.cast(f, 0.3); Ab.proj(f, { speed: 720, r: 13, dmg: 62, color: '#8fd3ff', core: '#fff', tag: 'ki' }); Sfx.blast(); } },
      { name: 'Rising Fang', desc: 'Dashing uppercut launcher.', cd: 4, ki: 25, ai: [0, 180], use(f) { Ab.dash(f, { dur: 0.24, speed: 900, dmg: 75, launch: true, pose: 'uppercut' }); Sfx.whoosh(); } },
    ],
    formSkills: [
      { name: 'Mouth Beam', desc: 'Sweeping beam that melts buildings.', cd: 6, ki: 30, ai: [100, 1200], use(f) { Ab.cast(f, 1.2); Game.beams.push({ owner: f, t: 0, delay: 0.25, life: 0.9, width: 44, dps: 230, tick: 0 }); Sfx.charge(0.25); Sfx.beam(0.9, 0.25); } },
      { name: 'Seismic Stomp', desc: 'Leaps onto the enemy; shockwaves both ways.', cd: 5, ki: 25, ai: [60, 600], use(f) { Ab.leap(f, { time: 0.6, onLand(f) { for (const d of [-1, 1]) Ab.hazard({ kind: 'wave', x: f.x + d * 60, dir: d, owner: f, dmg: 55, life: 0.8 }); Combat.explode(f.x, GROUND - 30, 110, f, 70, '#c89968'); } }); } },
    ],
    form: { name: 'MOONKAI', desc: 'Giant ape: huge damage, armor, super armor, slow.', dur: 15, scale: 2.2, speed: 0.72, jump: 0.75, armor: 0.6, dmg: 1.35, superArmor: true, heavyLanding: true },
    ult: { name: 'LUNAR CATACLYSM', desc: 'City-erasing mouth beam.', dmg: 260, cutscene: csEricUlt, transformCutscene: csEricTransform, after(f) { if (!f.form) f.enterForm(10); Arena.destroyAll(b => (f.facing > 0 ? b.x + b.w > f.x : b.x < f.x), Game.fx); } },
  },
  // ---------------------------------------------------------------- KIRA
  {
    id: 'kira', name: 'KIRA SOL', title: 'The Undying Flame', side: 'HERO', style: 'Aerial · Burn damage', color: '#ff7a1a', color2: '#b3122e',
    bio: 'A firefighter who died saving a burning tower, and walked out of the ashes. Each time she falls, she rises hotter.',
    quote: '"Knock me down. I come back brighter."', ending: 'Kira returns to the fire station. Nobody asks why the new recruit never needs a helmet.',
    hp: 1000, speed: 360, atk: 31, draw: drawKira, doubleJump: true,
    passive: ['Updraft', 'Can double jump. Fire attacks burn over time.'],
    skills: [
      { name: 'Flare Dart', desc: 'Fast fireball that burns.', cd: 0.9, ki: 14, ai: [150, 1000], use(f) { lim(f, 'fd', 2); Ab.cast(f, 0.22); Ab.proj(f, { speed: 980, r: 9, dmg: 46, color: '#ff7a1a', core: '#fff3a0', status: { burn: 2 }, tag: 'fd' }); Sfx.fire(); } },
      { name: 'Blazing Dive', desc: 'Flaming dive kick (diagonal from the air).', cd: 3.5, ki: 22, ai: [0, 300], use(f) { Ab.dash(f, { dur: 0.3, speed: 950, vy: f.onGround ? -200 : 800, dmg: 80, launch: true, pose: 'kick', status: { burn: 2 }, trail: '#ff7a1a' }); Sfx.fire(); } },
    ],
    formSkills: [
      { name: 'Feather Storm', desc: 'Three burning feathers.', cd: 1.2, ki: 18, ai: [100, 1000], use(f) { Ab.cast(f, 0.3); shots(f, 3, 0.36, { speed: 900, r: 10, dmg: 28, color: '#ff9a1a', core: '#fffbd0', status: { burn: 1.5 } }); Sfx.fire(); } },
      { name: 'Wing Wall', desc: 'A ring of fire surrounds her.', cd: 6, ki: 25, ai: [0, 160], use(f) { Ab.cast(f, 0.3, 'charge'); Ab.hazard({ kind: 'zone', x: f.x, follow: true, r: 110, owner: f, dmg: 14, every: 0.35, life: 3, color: '#ff7a1a', status: { burn: 1 } }); Sfx.screech(); } },
    ],
    form: { name: 'PHOENIX', desc: 'Hold jump to fly. Regenerates health.', dur: 15, scale: 1.1, speed: 1.15, armor: 1, dmg: 1.1, flight: true, regen: 7 },
    ult: { name: 'SUPERNOVA REBIRTH', desc: 'Become a sun, dive as a phoenix, heal 150.', dmg: 220, cutscene: csKiraUlt, transformCutscene: csKiraTransform, after(f, o) { Ab.heal(f, 150); Arena.destroyAll(b => Math.abs(b.x + b.w / 2 - o.x) < 260, Game.fx); } },
  },
  // ---------------------------------------------------------------- VEX
  {
    id: 'vex', name: 'VEX', title: 'Architect of Nothing', side: 'VILLAIN', style: 'Zoner · Traps', color: '#b36bff', color2: '#2a0d3d',
    bio: 'A physicist who stared into a collapsing star, and something stared back. He wants to un-make the universe, one city at a time.',
    quote: '"Heroes build. Cities stand. Both are temporary."', ending: 'Vex finally reaches the heart of the singularity. It is empty. For the first time, so is he, and it is quiet.',
    hp: 1050, speed: 310, atk: 33, draw: drawVex, hover: true,
    passive: ['Null Field', 'Enemy Ki regenerates 20% slower near him.'],
    skills: [
      { name: 'Shadow Spike', desc: 'Spike erupts under the enemy.', cd: 2, ki: 20, ai: [120, 1100], use(f) { Ab.cast(f, 0.35); Ab.hazard({ kind: 'spike', x: f.opp.x, owner: f, delay: 0.45, dmg: 90 }); Sfx.teleport(); } },
      { name: 'Null Orb', desc: 'Slow homing orb that weakens (-25% damage).', cd: 5, ki: 25, ai: [150, 1100], use(f) { lim(f, 'null', 1); Ab.cast(f, 0.35); Ab.proj(f, { speed: 330, homing: 2.2, r: 14, dmg: 50, life: 3.5, color: '#b36bff', core: '#1a0026', status: { weaken: 4 }, tag: 'null' }); Sfx.voidHum(); } },
    ],
    formSkills: [
      { name: 'Spike Field', desc: 'Three spikes around the enemy.', cd: 3, ki: 25, ai: [100, 1100], use(f) { Ab.cast(f, 0.35); [-80, 0, 80].forEach((d, i) => Ab.hazard({ kind: 'spike', x: f.opp.x + d, owner: f, delay: 0.45 + i * 0.12, dmg: 55 })); } },
      { name: 'Rift Step', desc: 'Teleport behind the enemy and slash.', cd: 2.2, ki: 20, ai: [0, 1200], use(f) { Ab.teleportBehind(f); f.invuln = 0.15; Ab.melee(f, { dur: 0.32, hitAt: 0.06, dmg: 80, kb: 420, reach: 70 }); } },
    ],
    form: { name: 'VOID WRAITH', desc: 'Lifesteal 30%, takes 25% less damage.', dur: 15, scale: 1.35, speed: 1.05, armor: 0.75, dmg: 1.1, lifesteal: 0.3 },
    ult: { name: 'EVENT HORIZON', desc: 'A black hole swallows the city and the enemy.', dmg: 250, cutscene: csVexUlt, transformCutscene: csVexTransform, after(f) { Ab.heal(f, 60); Arena.destroyAll(() => Math.random() < 0.6, Game.fx); } },
  },
  // ---------------------------------------------------------------- KAEL
  {
    id: 'kael', name: 'KAEL', title: 'The Hollow Core', side: 'ANTI-HERO', style: 'Two lives · Comeback', color: '#ff4a2a', color2: '#1d4a5a',
    bio: 'A soldier kept alive by an experimental core in his chest. The core does not heal him. It holds something in.',
    quote: '"Kill me once. Please. I\'m begging you."', ending: 'Kael never finds a way to rebuild the core. He stops looking. The demon, it turns out, is a better listener.',
    hp: 850, speed: 310, atk: 31, draw: drawKael, reviveForm: true, reviveHp: 300,
    passive: ['Second Life', 'No transform button: his first KO each round revives him as a demon. Ultimate locked until then.'],
    skills: [
      { name: 'Core Pulse', desc: 'Cyan energy shot.', cd: 1, ki: 16, ai: [150, 1000], use(f) { lim(f, 'cp', 2); Ab.cast(f, 0.28); Ab.proj(f, { speed: 780, r: 10, dmg: 48, color: '#3fe0ff', core: '#fff', tag: 'cp' }); Sfx.blast(); } },
      { name: 'Core Guard', desc: 'Shield that absorbs 150 damage for 3s.', cd: 8, ki: 25, ai: [0, 400], use(f) { Ab.cast(f, 0.25, 'block'); f.status.shield = 150; f.status.shieldT = 3; Sfx.clang(); } },
    ],
    formSkills: [
      { name: 'Hellfire Orb', desc: 'Arcing fireball that explodes.', cd: 1.4, ki: 20, ai: [150, 800], use(f) { Ab.cast(f, 0.35); Ab.proj(f, { speed: 620, angle: -0.42, g: 1000, r: 16, dmg: 60, explode: 90, color: '#ff3b1a', core: '#ffd08a' }); Sfx.fire(); } },
      { name: 'Infernal Chain', desc: 'Hook that drags the enemy to you.', cd: 5, ki: 25, ai: [200, 800], use(f) { Ab.cast(f, 0.45); Ab.proj(f, { speed: 1100, r: 10, dmg: 40, kind: 'hook', color: '#ff3b1a', trail: false, life: 0.7, onHit(t) { t.vx = (f.x - t.x) * 3.2; t.vy = -250; t.status.stun = 0.5; } }); Sfx.clang(); } },
    ],
    form: { name: 'DEMON', desc: 'Permanent. Stronger, lifesteal, ultimate unlocked.', dur: 999, scale: 1.25, speed: 1.1, armor: 0.8, dmg: 1.2, lifesteal: 0.1 },
    ult: { name: 'HELLFIRE BARRAGE', desc: 'Meteors of hellfire. Locked until revived.', dmg: 260, cutscene: csKaelUlt, transformCutscene: csKaelRevive, locked: f => !f.form, after() { Arena.destroyAll(() => Math.random() < 0.75, Game.fx); } },
  },
  // ---------------------------------------------------------------- VOLT
  {
    id: 'volt', name: 'VOLT', title: 'The Living Current', side: 'HERO', style: 'Rushdown · Speed', color: '#ffe95a', color2: '#1a1a4e',
    bio: 'A courier struck by lightning eleven times. The twelfth time, the lightning lost. Now he IS the storm, and he is always in a hurry.',
    quote: '"You blinked. That was your whole turn."', ending: 'Volt delivers every package in the city in 0.8 seconds. Then he gets bored and runs to the moon to check on Eric.',
    hp: 940, speed: 430, atk: 30, fastChain: true, model: M_VOLT, form: { name: 'STORM AVATAR', desc: 'Haste, faster cooldowns, hits discharge lightning.', dur: 14, scale: 1.1, speed: 1.25, armor: 0.95, dmg: 1.1, haste: 1.5, meleeBonus: 12, model: { aura: '#9fe8ff', hair: { type: 'spiky', color: '#e8fbff' }, eyes: { glow: '#9fe8ff' }, emblem: { shape: 'bolt', color: '#fff' }, stripes: '#9fe8ff' } },
    passive: ['Static', 'Dashing costs no Ki.'], freeDash: true,
    skills: [
      { name: 'Chain Lightning', desc: 'Near-instant bolt that stuns briefly.', cd: 2.4, ki: 20, ai: [100, 520], use(f) { Ab.cast(f, 0.25); Ab.proj(f, { speed: 1900, r: 8, dmg: 58, kind: 'bolt', color: '#bff4ff', life: 0.3, stun: 0.35 }); Sfx.zap(); } },
      { name: 'Flash Step', desc: 'Invulnerable dash through the enemy.', cd: 1.8, ki: 12, ai: [0, 350], use(f) { Ab.dash(f, { dur: 0.18, speed: 1500, dmg: 50, invuln: true, pass: true, trail: '#ffe95a' }); Sfx.zap(); } },
    ],
    formSkills: [
      { name: 'Thunderclap', desc: 'Twin bolts + a sky strike on the enemy.', cd: 1.2, ki: 18, ai: [100, 700], use(f) { Ab.cast(f, 0.25); shots(f, 2, 0.12, { speed: 1900, r: 8, dmg: 26, kind: 'bolt', color: '#bff4ff', life: 0.3 }); Ab.strike(f, f.opp.x, { dmg: 35, delay: 0.3, color: '#bff4ff', stun: 0.2 }); Sfx.zap(); } },
      { name: 'Flash Step', desc: 'Dash through, leaving a strike behind.', cd: 0.9, ki: 12, ai: [0, 400], use(f) { Ab.strike(f, f.x, { dmg: 30, delay: 0.25, color: '#ffe95a' }); Ab.dash(f, { dur: 0.18, speed: 1500, dmg: 45, invuln: true, pass: true, trail: '#ffe95a' }); Sfx.zap(); } },
    ],
    ult: { name: "THUNDER GOD'S VERDICT", desc: 'A storm of twelve lightning strikes.', dmg: 250, template: 'storm', fx: { el: 'bolt', color: '#bff4ff', sky: ['#05060f', '#1a1a3a', '#3a3a6a'], lines: ['Twelve times it struck me.', "Now it's your turn."] } },
  },
  // ---------------------------------------------------------------- GLACIA
  {
    id: 'glacia', name: 'GLACIA', title: 'The Frozen Throne', side: 'VILLAIN', style: 'Control · Walls & slows', color: '#9ff', color2: '#1a4a7a',
    bio: 'Queen of a kingdom that froze solid three centuries ago. She woke up last Tuesday and has decided the rest of the world should match.',
    quote: '"Be still. It will hurt less if you are still."', ending: 'The planet freezes over. Glacia sits on a throne of glaciers, finally at home. She is lonely. She will not admit it.',
    hp: 1100, speed: 310, atk: 35, model: M_GLACIA, form: { name: 'ABSOLUTE ZERO', desc: 'A freezing aura constantly slows the enemy.', dur: 15, scale: 1.15, speed: 1, armor: 0.85, dmg: 1.15, aura: true, onStart(f) { Ab.hazard({ kind: 'zone', x: f.x, follow: true, r: 220, owner: f, dmg: 5, every: 0.5, life: 15, color: '#9ff', status: { slow: 0.6 }, tag: 'az' }); }, model: { aura: '#9ff', auraSize: 1.3, eyes: { glow: '#9ff' }, cape: { color: '#e8fbff', len: 1.1 }, top: '#8ad0ff' } },
    passive: ['Frostbite', 'Slowed enemies take 10% more damage from her.'],
    skills: [
      { name: 'Frost Shards', desc: 'Three shards that slow.', cd: 1.5, ki: 18, ai: [120, 900], use(f) { Ab.cast(f, 0.3); shots(f, 3, 0.3, { speed: 760, r: 9, dmg: 33, kind: 'shard', color: '#bff', status: { slow: 1.5 } }); Sfx.ice(); } },
      { name: 'Ice Wall', desc: 'Wall that blocks projectiles and launches.', cd: 7, ki: 25, ai: [0, 900], use(f) { Game.hazards = Game.hazards.filter(h => !(h.owner === f && h.tag === 'wall')); Ab.cast(f, 0.3); Ab.hazard({ kind: 'wall', style: 'ice', x: clamp(f.x + f.facing * 80, 40, W - 40), w: 40, hgt: 150, hp: 220, life: 6, owner: f, dmg: 60, launch: true, colors: ['#dff', '#9cf'], tag: 'wall' }); Sfx.ice(); } },
    ],
    formSkills: [
      { name: 'Glacial Lance', desc: 'Piercing lance that freezes solid.', cd: 1.6, ki: 20, ai: [100, 1000], use(f) { Ab.cast(f, 0.35); Ab.proj(f, { speed: 900, r: 16, dmg: 60, kind: 'shard', pierce: true, color: '#bff', status: { freeze: 0.8 } }); Sfx.ice(); } },
      { name: 'Permafrost', desc: 'Ice wall plus spikes under the enemy.', cd: 5, ki: 25, ai: [0, 900], use(f) { CHARACTERS[5].skills[1].use(f); [0, 70].forEach((d, i) => Ab.hazard({ kind: 'spike', x: f.opp.x + d * f.facing, owner: f, delay: 0.5 + i * 0.15, dmg: 40, fill: '#bff', tele: '#9ff', colors: ['#fff', '#9cf'], status: { slow: 1 } })); } },
    ],
    ult: { name: 'ETERNAL WINTER', desc: 'Encases the enemy in a glacier and shatters it.', dmg: 240, template: 'freeze', fx: { el: 'ice', color: '#bff', sky: ['#020a1e', '#0a2a4a', '#4a8aba'], lines: ['Winter does not end.', 'It waits.'] } },
  },
  // ---------------------------------------------------------------- TITAN
  {
    id: 'titan', name: 'TITAN', title: 'The Unbreakable', side: 'HERO', style: 'Grappler · Heavy', color: '#e0a020', color2: '#3a4a5a',
    bio: 'A former pro wrestler whose body was rebuilt with alloy after a bridge collapse he held up for nine hours. He has never lost a match. He has never been thrown.',
    quote: '"Come here. I just want a hug."', ending: 'Titan opens a wrestling school for kids with powers. Tuition is free. Suplexes are mandatory.',
    hp: 1180, speed: 255, atk: 39, heavy: true, model: M_TITAN, form: { name: 'IRON COLOSSUS', desc: 'Giant metal body. Super armor, huge damage.', dur: 15, scale: 1.45, speed: 0.85, armor: 0.7, dmg: 1.3, superArmor: true, heavyLanding: true, model: { top: '#8a95a4', skin: '#9aa4b0', pads: { color: '#6a7584', size: 1.5, spikes: '#e0a020' }, eyes: { glow: '#ff5a1a' }, aura: '#ffb040' } },
    passive: ['Unbreakable', 'Takes 40% less knockback. Knockdowns are shorter.'],
    skills: [
      { name: 'Titan Grip', desc: 'Command grab: unblockable slam.', cd: 4, ki: 25, ai: [0, 50], use(f) { Ab.grab(f, { range: 55, dmg: 115 }); } },
      { name: 'Shoulder Charge', desc: 'Armored charge that knocks far.', cd: 3.5, ki: 22, ai: [0, 400], use(f) { f.status.armor = 0.4; Ab.dash(f, { dur: 0.36, speed: 820, dmg: 80, kb: 650, launch: true }); Sfx.slam(); } },
    ],
    formSkills: [
      { name: 'Colossus Grip', desc: 'Longer-range grab, more damage.', cd: 3.5, ki: 25, ai: [0, 80], use(f) { Ab.grab(f, { range: 80, dmg: 170 }); } },
      { name: 'Earthsplitter', desc: 'Ground slam with shockwaves.', cd: 4, ki: 25, ai: [0, 600], use(f) { Ab.melee(f, { pose: 'slam', dur: 0.55, hitAt: 0.3, reach: 90, dmg: 90, launch: true, onStrike(f) { Game.shake = 16; Sfx.slam(); for (const d of [-1, 1]) Ab.hazard({ kind: 'wave', x: f.x + d * 60, dir: d, owner: f, dmg: 60 }); } }); } },
    ],
    ult: { name: 'METEOR SUPLEX', desc: 'Grabs the enemy, leaps to orbit, piledrives them.', dmg: 280, template: 'grab', fx: { el: 'metal', color: '#e0a020', sky: ['#0a0a1a', '#1a2a4a', '#4a6a9a'], lines: ['Hold on tight.', "We're going UP."] } },
  },
  // ---------------------------------------------------------------- NYX
  {
    id: 'nyx', name: 'NYX', title: 'The Quiet Blade', side: 'VILLAIN', style: 'Assassin · Stealth', color: '#ff2a6a', color2: '#1a0a20',
    bio: 'The last of an order of assassins who took contracts on gods. She has been hired to kill every hero on this list. She is ahead of schedule.',
    quote: '"You won\'t hear me. That\'s the point."', ending: 'Nyx collects on every contract, then burns the payment. Nobody knows who hired her. Nobody ever will.',
    hp: 960, speed: 390, atk: 33, fastChain: true, model: M_NYX, form: { name: 'THOUSAND SHADOWS', desc: 'Two shadow clones copy every strike.', dur: 14, scale: 1.05, speed: 1.1, armor: 1, dmg: 1.1, clones: true, model: { aura: '#5a0a3a', eyes: { glow: '#ff2a6a' }, weapon: { type: 'dual', color: '#ccd', glow: '#ff2a6a' } } },
    passive: ['Backstab', 'Hits from behind deal +35% damage.'],
    skills: [
      { name: 'Kunai Fan', desc: 'Two kunai that mark the target (+30% next hit).', cd: 1.3, ki: 15, ai: [120, 900], use(f) { Ab.cast(f, 0.22); shots(f, 2, 0.1, { speed: 1050, r: 7, dmg: 30, kind: 'kunai', color: '#c01040', trail: false, status: { mark: 3 } }); Sfx.slash(); } },
      { name: 'Veil', desc: 'Turn invisible for 2.5s; next strike crits.', cd: 7, ki: 25, ai: [0, 1200], use(f) { f.status.invis = 2.5; f.status.crit = 3; Game.fx.burst(f.x, f.y - 60, 30, { color: ['#1a0a20', '#c01040'], size: 10, speed: 200 }); Sfx.teleport(); } },
    ],
    formSkills: [
      { name: 'Shadow Fan', desc: 'Five kunai.', cd: 1.2, ki: 18, ai: [120, 900], use(f) { Ab.cast(f, 0.22); shots(f, 5, 0.4, { speed: 1050, r: 7, dmg: 18, kind: 'kunai', color: '#ff2a6a', trail: false, status: { mark: 3 } }); Sfx.slash(); } },
      { name: 'Shadow Swap', desc: 'Teleport behind and strike.', cd: 2.4, ki: 20, ai: [0, 1200], use(f) { Ab.teleportBehind(f); Ab.melee(f, { dur: 0.3, hitAt: 0.06, dmg: 70, kb: 380, reach: 70 }); } },
    ],
    ult: { name: 'DEATH LOTUS', desc: 'A blossom of sixteen slashes.', dmg: 250, template: 'rush', fx: { el: 'shadow', color: '#ff2a6a', sky: ['#050008', '#1a0414', '#3a0a2a'], lines: ['Close your eyes.', 'It is already over.'] } },
  },
  // ---------------------------------------------------------------- GEAR
  {
    id: 'gear', name: 'DR. GEAR', title: 'The Mad Mechanic', side: 'VILLAIN', style: 'Summoner · Setup', color: '#ffb020', color2: '#3a3a3a',
    bio: 'A genius inventor fired from every lab on Earth for "ethical concerns". He builds robots. Then he builds bigger robots. Then he gets inside one.',
    quote: '"Science isn\'t about WHY. It\'s about WHY NOT."', ending: 'Dr. Gear conquers the city with an army of turrets, then gets distracted building a better toaster. The city is still waiting.',
    hp: 1060, speed: 290, atk: 32, model: M_GEAR, form: { name: 'MECH SUIT', desc: 'Pilots a battle mech: cannon, missiles, armor.', dur: 15, scale: 1.4, speed: 0.9, armor: 0.7, dmg: 1.3, superArmor: true, heavyLanding: true, model: { body: drawMech, metal: '#8a95a4', accent: '#ffb020', skin: '#e0b090' } },
    passive: ['Overclock', 'Turrets deploy instantly and absorb 120 damage.'],
    skills: [
      { name: 'Drone Turret', desc: 'Deploys a turret that fires every second (max 2).', cd: 6, ki: 25, ai: [150, 1200], use(f) { const own = Game.hazards.filter(h => h.owner === f && h.kind === 'turret'); if (own.length >= 2) own[0].life = 0; Ab.cast(f, 0.3); Ab.hazard({ kind: 'turret', x: clamp(f.x + f.facing * 60, 30, W - 30), owner: f, life: 8, hp: 120 }); Sfx.clang(); } },
      { name: 'Rocket Salvo', desc: 'Three homing mini-missiles.', cd: 4, ki: 22, ai: [150, 1100], use(f) { Ab.cast(f, 0.35); [-0.6, -0.35, -0.1].forEach(a => Ab.proj(f, { speed: 560, angle: a, homing: 3.2, r: 7, dmg: 32, kind: 'missile', color: '#ffb020', life: 2.5, explode: 30 })); Sfx.blast(); } },
    ],
    formSkills: [
      { name: 'Mech Cannon', desc: 'Huge explosive shell.', cd: 2, ki: 22, ai: [100, 1100], use(f) { Ab.cast(f, 0.4); Ab.proj(f, { speed: 750, r: 20, dmg: 80, explode: 80, color: '#9ff', core: '#fff' }); Sfx.boom(); } },
      { name: 'Missile Storm', desc: 'Six homing missiles.', cd: 4, ki: 25, ai: [150, 1200], use(f) { Ab.cast(f, 0.45); for (let i = 0; i < 6; i++) Ab.proj(f, { speed: 520, angle: -1.2 + i * 0.18, homing: 3, r: 7, dmg: 22, kind: 'missile', color: '#ffb020', life: 2.8, explode: 30, from: [f.x - f.facing * 30, f.y - f.h + 20] }); Sfx.blast(); } },
    ],
    ult: { name: 'ORBITAL LASER', desc: 'A satellite laser from space.', dmg: 250, template: 'orbital', fx: { el: 'tech', color: '#9ff', sky: ['#02020a', '#0a1020', '#1a2a3a'], lines: ['Satellite online.', 'Say cheese.'] } },
  },
  // ---------------------------------------------------------------- SERAPH
  {
    id: 'seraph', name: 'SERAPH', title: 'The Last Light', side: 'HERO', style: 'Sustain · Area control', color: '#ffe08a', color2: '#6a5aa8',
    bio: 'An angel who was sent to judge humanity and decided, after a week of watching people, to defend it instead. Heaven is not pleased.',
    quote: '"I was sent to judge you. I choose to protect you."', ending: 'Seraph is recalled to Heaven for disobedience. She does not go. There is a very confused angel posted outside her apartment.',
    hp: 980, speed: 320, atk: 34, model: M_SERAPH, form: { name: 'ARCHANGEL', desc: 'Wings of light: flight and regeneration.', dur: 15, scale: 1.12, speed: 1.1, armor: 0.9, dmg: 1.15, flight: true, regen: 5, model: { wings: { type: 'light', color: '#ffe9a0', scale: 1.3 }, aura: '#fff0b0', eyes: { glow: '#ffe08a' }, top: '#fffbe8' } },
    passive: ['Grace', 'Regenerates 2 HP per second.'], regen: 2,
    skills: [
      { name: 'Light Spear', desc: 'Piercing spear of light.', cd: 1.7, ki: 18, ai: [120, 1100], use(f) { Ab.cast(f, 0.3); Ab.proj(f, { speed: 1100, r: 10, dmg: 57, kind: 'spear', pierce: true, color: '#ffe08a', trail: false }); Sfx.heal(); } },
      { name: 'Sanctuary', desc: 'Healing circle (about 150 HP over 3.5s).', cd: 12, ki: 30, ai: [0, 2000], use(f) { Ab.cast(f, 0.3, 'charge'); Ab.hazard({ kind: 'zone', x: f.x, r: 110, owner: f, heal: 22, every: 0.5, life: 3.5, color: '#ffe08a' }); Sfx.heal(); } },
    ],
    formSkills: [
      { name: 'Rain of Spears', desc: 'Three spears fall on the enemy.', cd: 2, ki: 22, ai: [0, 1200], use(f) { Ab.cast(f, 0.3); [-60, 0, 60].forEach((d, i) => Ab.strike(f, f.opp.x + d, { dmg: 35, delay: 0.35 + i * 0.1, style: 'light', color: '#ffe08a' })); } },
      { name: 'Holy Ground', desc: 'Sanctuary that also burns enemies.', cd: 9, ki: 30, ai: [0, 2000], use(f) { Ab.cast(f, 0.3, 'charge'); Ab.hazard({ kind: 'zone', x: f.x, r: 130, owner: f, heal: 20, dmg: 15, every: 0.5, life: 3.5, color: '#fff0b0' }); Sfx.heal(); } },
    ],
    ult: { name: 'JUDGMENT HALO', desc: 'Pillars of heavenly light. Heals 80.', dmg: 230, template: 'storm', fx: { el: 'light', color: '#ffe08a', sky: ['#2a2050', '#8a70c0', '#ffe0b0'], lines: ['By the authority I abandoned...', '...be judged.'] }, after(f) { Ab.heal(f, 80); } },
  },
  // ---------------------------------------------------------------- RAZOR
  {
    id: 'razor', name: 'RAZOR', title: 'The Red Berserker', side: 'ANTI-HERO', style: 'Berserker · Comeback damage', color: '#ff2020', color2: '#3a0808',
    bio: 'A gladiator from an alien arena who crash-landed here. He fights heroes and villains alike. He does not care who wins, only that it was close.',
    quote: '"Bleed a little. It makes it honest."', ending: 'Razor builds an arena in the ruins of the city. Every weekend, heroes and villains fight there, and for once, nobody else gets hurt.',
    hp: 1020, speed: 340, atk: 33, model: M_RAZOR, form: { name: 'BLOODRAGE', desc: 'Lifesteal 25%, faster, but takes 10% more damage.', dur: 14, scale: 1.12, speed: 1.2, armor: 1.1, dmg: 1.2, lifesteal: 0.25, haste: 1.3, model: { aura: '#ff1a1a', eyes: { glow: '#ff2020' }, weapon: { type: 'greatsword', color: '#c33', glow: '#ff2020' }, skin: '#a05050' } },
    passive: ['Rage', 'Deals up to +35% damage as his health drops.'], rage: 0.35,
    skills: [
      { name: 'Blood Rush', desc: 'Dash slash through the enemy that bleeds.', cd: 3, ki: 22, ai: [0, 450], use(f) { Ab.dash(f, { dur: 0.22, speed: 1300, dmg: 50, pass: true, status: { bleed: 1.5 }, trail: '#ff2020' }); Sfx.slash(); } },
      { name: 'Rending Cleave', desc: 'Slow, huge overhead chop with a shockwave.', cd: 3, ki: 20, ai: [0, 200], use(f) { Ab.melee(f, { pose: 'slam', dur: 0.75, hitAt: 0.42, reach: 95, dmg: 100, kb: 420, launch: true, onStrike(f) { Game.shake = 12; Sfx.slam(); Ab.hazard({ kind: 'wave', x: f.x + f.facing * 80, dir: f.facing, owner: f, dmg: 40, fill: 'rgba(255,40,40,0.5)' }); } }); } },
    ],
    ult: { name: 'CRIMSON TEMPEST', desc: 'A whirlwind of blood and steel.', dmg: 250, template: 'rush', fx: { el: 'blood', color: '#ff2020', sky: ['#0a0000', '#3a0000', '#7a0a0a'], lines: ['Finally.', 'A worthy fight.'] } },
  },
  // ---------------------------------------------------------------- TERRA
  {
    id: 'terra', name: 'TERRA', title: 'The Mountain Speaker', side: 'HERO', style: 'Defensive · Terrain', color: '#7dff6a', color2: '#3a2a1a',
    bio: 'A shepherd from a mountain village who can hear the stones talk. They have been complaining about the cities for a long time. She agreed to help, gently.',
    quote: '"The mountain is patient. I am the mountain."', ending: 'Terra raises new mountains where the ruined towers stood. People move in. They say the rocks hum lullabies at night.',
    hp: 1150, speed: 270, atk: 36, model: M_TERRA, form: { name: 'MOUNTAIN GOLEM', desc: 'A walking mountain: armor, super armor, quake stomps.', dur: 15, scale: 1.5, speed: 0.8, armor: 0.6, dmg: 1.25, superArmor: true, heavyLanding: true, model: { body: drawGolem, rock: '#6b5a48', glowColor: '#7dff6a' } },
    passive: ['Bedrock', 'Takes 15% less damage while standing still.'],
    skills: [
      { name: 'Boulder Toss', desc: 'Arcing boulder that explodes.', cd: 2.2, ki: 20, ai: [150, 800], use(f) { Ab.cast(f, 0.4); Ab.proj(f, { speed: 660, angle: -0.45, g: 1100, r: 18, dmg: 65, kind: 'rock', color: '#7a6a5a', explode: 60, trail: false }); Sfx.rock(); } },
      { name: 'Stone Pillar', desc: 'Pillar erupts under the enemy and stays as a wall.', cd: 5, ki: 25, ai: [0, 1000], use(f) { Ab.cast(f, 0.35); Ab.hazard({ kind: 'wall', style: 'stone', x: clamp(f.opp.x, 30, W - 30), w: 46, hgt: 130, hp: 200, life: 4, owner: f, dmg: 75, launch: true, colors: ['#7a6a5a', '#554'] }); Sfx.rock(); } },
    ],
    formSkills: [
      { name: 'Boulder Barrage', desc: 'Three boulders.', cd: 2.5, ki: 25, ai: [150, 900], use(f) { Ab.cast(f, 0.45); [-0.3, -0.45, -0.6].forEach(a => Ab.proj(f, { speed: 640, angle: a, g: 1100, r: 18, dmg: 45, kind: 'rock', color: '#7a6a5a', explode: 50, trail: false })); Sfx.rock(); } },
      { name: 'Quake Stomp', desc: 'Stomp that sends shockwaves both ways.', cd: 3.5, ki: 22, ai: [0, 700], use(f) { Ab.melee(f, { pose: 'slam', dur: 0.5, hitAt: 0.25, reach: 80, dmg: 70, launch: true, onStrike(f) { Game.shake = 14; Sfx.rock(); for (const d of [-1, 1]) Ab.hazard({ kind: 'wave', x: f.x + d * 60, dir: d, owner: f, dmg: 60, colors: ['#7dff6a', '#6b5a48'] }); } }); } },
    ],
    ult: { name: 'TECTONIC COLLAPSE', desc: 'The earth splits open beneath the enemy.', dmg: 250, template: 'quake', fx: { el: 'rock', color: '#7dff6a', sky: ['#1a1410', '#4a3a2a', '#8a6a4a'], lines: ['The mountain has been patient.', 'It is done being patient.'] } },
  },
  // ---------------------------------------------------------------- JINX
  {
    id: 'jinx', name: 'JINX', title: 'The Cosmic Joker', side: 'VILLAIN', style: 'Chaos · Random', color: '#d05aff', color2: '#2a0a3a',
    bio: 'A stage magician who made a deal with an entity from outside reality. The entity found him funny. Now reality is his punchline.',
    quote: '"Pick a card! Any card! …Oops."', ending: 'Jinx replaces the moon with a giant rubber chicken. Scientists are baffled. Eric is furious. Jinx is delighted.',
    hp: 1020, speed: 355, atk: 34, model: M_JINX, form: { name: 'JACKPOT', desc: 'A random buff every 3 seconds, triple cards.', dur: 15, scale: 1.08, speed: 1.1, armor: 0.9, dmg: 1.1, jackpot: true, model: { aura: '#ffd35a', top: '#d02a8a', eyes: { glow: '#ffd35a' } } },
    passive: ['Lucky', 'Every hit has a 15% chance to deal double damage.'], lucky: 0.15,
    skills: [
      { name: 'Wild Card', desc: 'Card with a random effect: burn, slow, stun, explosion or weaken.', cd: 1.15, ki: 15, ai: [120, 900], use(f) { Ab.cast(f, 0.25); jinxCard(f, 0); Sfx.card(); } },
      { name: 'Switcheroo', desc: 'Swap places with the enemy and confuse them.', cd: 7, ki: 25, ai: [100, 1200], use(f) { const o = f.opp; if (!o.canBeHit()) return; const x = f.x; f.x = o.x; o.x = x; o.status.confuse = 1.8; Game.hit(o, { dmg: 30, src: f, kb: 0, unblockable: true, noFlinch: true }); Game.fx.burst(f.x, f.y - 60, 30, { color: ['#d05aff', '#ffd35a'], size: 10, speed: 260, glow: true }); Game.fx.burst(o.x, o.y - 60, 30, { color: ['#d05aff', '#ffd35a'], size: 10, speed: 260, glow: true }); Game.popText(o.x, o.y - o.h - 20, 'CONFUSED!', '#d05aff'); Sfx.teleport(); } },
    ],
    formSkills: [
      { name: 'Full House', desc: 'Three wild cards at once.', cd: 1.4, ki: 18, ai: [120, 900], use(f) { Ab.cast(f, 0.25); [-0.15, 0, 0.15].forEach(a => jinxCard(f, a)); Sfx.card(); } },
      null,
    ],
    ult: { name: 'COSMIC PUNCHLINE', desc: 'A slot machine decides the damage. Then anvils fall.', dmg: 240, randomDmg: [190, 300], template: 'storm', fx: { el: 'anvil', color: '#d05aff', sky: ['#1a0a2a', '#4a1a6a', '#d05aff'], lines: ['Knock knock.', "Who's there? ANVIL."] } },
  },
  // ---------------------------------------------------------------- ECHO
  {
    id: 'echo', name: 'ECHO', title: 'The Second Chance', side: 'HERO', style: 'Tactician · Time', color: '#88f0e0', color2: '#0a2a3a',
    bio: 'A sound engineer who recorded the frequency of time itself. She can rewind a few seconds, slow the world, and, once in a while, stop it completely.',
    quote: '"Let\'s try that again."', ending: 'Echo rewinds the whole fight, just once, and this time nobody gets hurt. Only she remembers. She thinks that is fair.',
    hp: 980, speed: 330, atk: 33, model: M_ECHO, form: { name: 'CHRONO SHIFT', desc: 'The enemy moves at 65% speed. Faster cooldowns.', dur: 12, scale: 1.08, speed: 1, armor: 0.9, dmg: 1.1, haste: 1.3, timeSlowOpp: 0.65, model: { aura: '#88f0e0', eyes: { glow: '#88f0e0' }, cape: { color: '#1a5a6a' } } },
    passive: ['Resonance', 'Blocking a hit restores Ki instead of draining it.'],
    skills: [
      { name: 'Sonic Boom', desc: 'Sound ring that pushes the enemy far away.', cd: 1.7, ki: 18, ai: [80, 900], use(f) { Ab.cast(f, 0.28); Ab.proj(f, { speed: 700, r: 18, dmg: 50, kb: 650, kind: 'ring', color: '#88f0e0', trail: false }); Sfx.blast(); } },
      { name: 'Rewind', desc: 'Return to where you were 3s ago, with that health.', cd: 16, ki: 30, ai: [0, 2000], use(f) { const s = f.history[0]; if (!s) return; Game.fx.burst(f.x, f.y - 60, 30, { color: ['#88f0e0', '#fff'], size: 8, speed: 220, glow: true }); f.x = s.x; f.y = s.y; if (s.hp > f.hp) Ab.heal(f, s.hp - f.hp); Game.popText(f.x, f.y - f.h - 40, 'REWIND', '#88f0e0', 30); Sfx.bell(); } },
    ],
    formSkills: [
      { name: 'Double Boom', desc: 'Two sonic rings.', cd: 1.4, ki: 18, ai: [80, 900], use(f) { Ab.cast(f, 0.3); shots(f, 2, 0.2, { speed: 720, r: 16, dmg: 30, kb: 520, kind: 'ring', color: '#88f0e0', trail: false }); Sfx.blast(); } },
      null,
    ],
    ult: { name: 'TIME STOP', desc: 'Stops time, strikes a dozen times, lets it resume.', dmg: 240, template: 'freeze', fx: { el: 'time', color: '#88f0e0', sky: ['#050a10', '#1a2a3a', '#3a5a6a'], lines: ['Let me stop you right there.', '...and play.'] } },
  },
];

function jinxCard(f, angle) {
  const eff = pick([['burn', '#ff7a1a', { burn: 2.5 }], ['slow', '#9ff', { slow: 2 }], ['stun', '#ffd35a', null], ['boom', '#ff3b3b', null], ['weaken', '#b36bff', { weaken: 3 }]]);
  Ab.proj(f, { speed: 820, angle, r: 9, dmg: randi(45, 78), kind: 'card', color: eff[1], status: eff[2], stun: eff[0] === 'stun' ? 0.5 : 0, explode: eff[0] === 'boom' ? 70 : 0, trail: false });
}

// finalize defs
for (const d of CHARACTERS) {
  if (d.model) d.draw = makeModelDraw(d.model, d.form.model);
  d.formSkills = (d.formSkills || [null, null]).map((s, i) => s || d.skills[i]);
  d.form.manual = !d.reviveForm;
}
const charById = id => CHARACTERS.find(d => d.id === id);
