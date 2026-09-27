// ============================================================
//  MOONKAI — AURELION, the Self-Made God (fighter #61)
//  Base: long-reach greatsword angel. Awaken (3 bars, permanent): SERAPHIM ASCENDANT.
//  If he is KO'd while ascended by anyone who is NOT divine, his pride breaks:
//  he rises once as the FALLEN GOD with a new kit, 30% health and a slow self-burn.
// ============================================================

// Fighters who count as divine. A deity's finishing blow is "a fair judgment": no rage.
const DEITIES = ['seraph', 'helios', 'judge', 'astra', 'luna', 'aurelion'];

const AURELION_MODEL = { build: 'athletic', skin: '#f4dcc0', top: '#fbf6e6', topDark: '#d8cca8', pants: '#efe6cc', boots: '#e6c060', belt: '#e6c060', bracers: '#e6c060', coat: '#fffbef',
  hair: { type: 'long', color: '#fff2c0' }, halo: { color: '#ffe08a' }, eyes: { glow: '#ffd35a' },
  weapon: { type: 'greatsword', len: 104, color: '#fff6d8', guard: '#e6c060', glow: '#ffe08a' },
  wings: { type: 'feather', color: '#fffaf0', scale: 0.85 }, emblem: { shape: 'sun', color: '#e6c060' }, cape: { color: '#e6c060', len: 1.1 } };

const aurelion = fighter({
  id: 'aurelion', name: 'AURELION', title: 'The Self-Made God', side: 'VILLAIN', role: 'Long reach · Pride · Rebirth', color: '#ffd35a', color2: '#5a4a1a',
  bio: 'Once the highest of the angels, Aurelion decided Heaven was merely a draft and he was the final edition. He carries a sword longer than most buildings are tall, and an ego longer than the sword.',
  quote: 'Kneel. It is the only posture that suits you.',
  ending: 'Aurelion builds a cathedral to himself in Metro City. Attendance is zero. He preaches to the pigeons every Sunday and calls it a full house.',
  hp: 950, walk: 255, deity: true, rival: 'seraph', jumps: 2,
  model: AURELION_MODEL,
  face: { expr: 'cold', eyes: '#ffd35a', hair: { type: 'long', color: '#fff2c0' }, halo: { color: '#ffe08a' }, skin: '#f4dcc0' },
  style: { reach: 1.3, weapon: true, speed: 1.08, power: 1, poses: { '5M': 'heavy', '5H': 'slam' } },
  passive: ['Divine Pride', 'Takes 10% less damage while above half health. Mortals who fell him while ascended face the Fallen God.'],
  passiveArmor: f => f.hp > f.maxHp * 0.5 ? 0.9 : 1,
  moves: {
    '5S': Mv.shot({ name: 'Divine Edict', desc: 'A golden sword wave that crosses the screen.', s: 14, proj: { speed: 950, r: 16, dmg: 62, kind: 'crescent', color: '#ffe08a', core: '#fff', hs: 22, kb: [260, -60] } }),
    '6S': Mv.rush({ name: 'Kneel', desc: 'Lunging greatsword thrust. Wall-bounces.', s: 12, speed: 1150, frames: 14, hit: { dmg: 96, box: [-10, -110, 110, 90], kb: [720, -200], wb: true } }),
    '2S': Mv.rising({ name: 'Ascension Arc', desc: 'Invincible rising sword arc. Anti-air.', height: 950, hit: { dmg: 34, multi: 3, box: [-20, -170, 100, 170] } }),
    '4S': Mv.counter({ name: 'You Dare?', desc: 'Parry stance. Strikes back with divine fury.', window: 22, dmg: 130 }),
    'jS': Mv.dive({ name: 'Descent of Heaven', desc: 'Plunging sword dive; ground bounce.', vx: 600, vy: 1300, hit: { dmg: 88, box: [0, -80, 80, 80], gb: true, kb: [200, 900] } }),
  },
  super: Sup.flurry({ name: 'Edenfall', desc: 'Twelve blinding sword strokes.', hits: 12, hit: { dmg: 22, box: [0, -130, 140, 120] }, finisher: { dmg: 90, kb: [700, -500], launch: true, wb: true } }),
  ult: { act: 'strike', name: 'THRONE OF HEAVEN', desc: 'A colossal sword falls from the sky onto the target. Must connect.', dmg: 1080, template: 'meteor', style: 'light', color: '#ffe08a', wide: 60,
    fx: { el: 'light', color: '#ffe08a', sky: ['#2a2010', '#9a7a3a', '#fff0c0'], lines: ['Behold your god.', 'Your worship is... accepted.'] } },
  form: { name: 'SERAPHIM ASCENDANT', desc: 'Permanent. Six wings of light, flight, longer sword. Beware: falling while ascended breaks his pride.', cost: 300, flight: true, dmg: 1.1, speed: 1.06, scale: 1.1,
    model: { wings: { type: 'light', color: '#ffe9a0', scale: 1.45 }, aura: '#fff0b0', auraSize: 1.3, halo: { color: '#fff6c8' }, hat: { type: 'crown', color: '#ffd35a' }, top: '#fffdf4',
      weapon: { type: 'greatsword', len: 124, color: '#fffbe8', guard: '#ffd35a', glow: '#fff0b0' } },
    moves: {
      '5S': Mv.shot({ name: 'Trinity Edict', desc: 'Three sword waves in a fan.', s: 14, proj: { speed: 1000, r: 14, dmg: 34, count: 3, spread: 0.35, kind: 'crescent', color: '#fff0b0', core: '#fff', hs: 18, kb: [200, -80] } }),
      '4S': Mv.place({ name: 'Choir of Blades', desc: 'Three swords rain on the foe.', spawn: { kind: 'strike', at: 'enemy', delay: 0.35, count: 3, spacing: 80, stagger: 0.1, dmg: 46, style: 'light', color: '#ffe08a', wide: 30 }, ai: { min: 200, max: 1600, use: 'zone' } }),
    },
    super: Sup.beam({ name: "Heaven's Verdict", desc: 'A divine beam from the sword tip.', beam: { color: '#fff0b0', core: '#fff', width: 80, dmg: 20 } }) },
  assist: '5S',
  lines: {
    intro: ['You may address me as "Your Radiance," {opp}.', 'I have read your prayers. They were very boring.', 'Kneel now and I will make this quick.', 'A mortal? Here? How quaint.'],
    win: ['Your defeat was foretold. By me. Just now.', 'You may kiss the hem of my robe. Carefully.', 'Worship begins at nine. Do not be late.', 'Divinity is not a title, {opp}. It is a fact.'],
    taunt: ['Pathetic.', 'On your knees.', 'Hmph.'], form: ['BEHOLD THE ONLY GOD!', 'Look upon me and despair.'], ult: ['THRONE OF HEAVEN!'], ultHit: ['Judged. Sentenced. Forgotten.'],
    tag: ['Stand aside, mortal.'], enter: ['Finally, someone competent.'], assist: ['Grovel!'], moves: ['Kneel!', 'Insolent!', 'Beneath me.'],
  },
});

// ---------- the corrupt kit ----------
const FALLEN_MODEL = { wings: { type: 'bat', color: '#1a0810', scale: 1.5 }, aura: '#ff1a3a', auraSize: 1.35, halo: { color: '#ff2a3a' }, horns: { color: '#2a0a10' }, eyes: { glow: '#ff2030' },
  hair: { type: 'wild', color: '#e8e0e0' }, top: '#1a0a10', topDark: '#0a0408', pants: '#2a0a14', coat: '#3a0a18', boots: '#1a0a0a', belt: '#8a0a1a', bracers: '#8a0a1a',
  cape: { color: '#5a0a1a', len: 1.3 }, emblem: { shape: 'eye', color: '#ff2030' }, skin: '#c8b8b8',
  weapon: { type: 'greatsword', len: 132, color: '#2a0a10', guard: '#8a0a1a', glow: '#ff1a3a' } };
aurelion.corruptForm = {
  name: 'FALLEN GOD', desc: 'Rage reborn at 25% health. Stronger and faster, but takes more damage and his corruption slowly burns him.',
  manual: false, flight: true, dmg: 1.1, speed: 1.08, armor: 1.25, lifesteal: 0.05, scale: 1.14, reviveFrac: 0.25, color: '#ff2a3a',
  model: FALLEN_MODEL, face: { expr: 'angry', eyes: '#ff2030', hair: { type: 'wild', color: '#e8e0e0' }, halo: { color: '#ff2a3a' }, horns: { color: '#2a0a10' }, skin: '#c8b8b8' },
  passive: ['Corruption', 'Burns 4 HP per second (never below 1). Heals 5% of damage dealt. Takes 25% more damage.'],
  passiveTick: f => { if (f.st % 30 === 0 && f.hp > 1 && f.state !== 'ko') f.hp = Math.max(1, f.hp - 2); },
  style: { reach: 1.5, weapon: true, speed: 1.0, power: 1.1, poses: { '5M': 'heavy', '5H': 'slam' } },
  moves: {
    '5S': Mv.shot({ name: 'Heretic Wave', desc: 'A crimson sword wave that hits twice.', s: 13, proj: { speed: 1050, r: 18, dmg: 36, hits: 2, pierce: true, kind: 'crescent', color: '#ff2a3a', core: '#ffd0d0', hs: 20, kb: [240, -60] } }),
    '6S': Mv.teleport({ name: 'Blasphemy', desc: 'Teleports behind the foe and cleaves.', to: 'behind', hit: { dmg: 90, box: [0, -120, 110, 110], kb: [600, -300] } }),
    '2S': Mv.place({ name: 'Hellgate', desc: 'Blood spikes erupt under the foe.', spawn: { kind: 'spike', at: 'enemy', delay: 0.4, dmg: 84, color: '#8a0a1a', fill: '#3a0008' }, ai: { min: 150, max: 1400, use: 'zone' } }),
    '4S': Mv.rush({ name: 'Fall From Grace', desc: 'Dark tackle that passes through and drains.', speed: 1300, frames: 14, pass: true, hit: { dmg: 80, kb: [300, -500], status: { weaken: 3 } } }),
    'jS': Mv.dive({ name: 'Black Meteor', desc: 'Burning dive; ground bounce.', vx: 700, vy: 1400, hit: { dmg: 92, box: [0, -80, 90, 80], gb: true, kb: [200, 900] } }),
  },
  super: Sup.flurry({ name: 'Crimson Requiem', desc: 'A storm of dark sword strokes.', hits: 14, hit: { dmg: 22, box: [0, -140, 150, 130] }, finisher: { dmg: 100, kb: [800, -600], launch: true, wb: true } }),
  ult: Ult({ act: 'rush', name: 'DEICIDE', desc: 'A falling god takes you with him. Must connect.', dmg: 1180, template: 'dimension', color: '#ff2a3a',
    fx: { el: 'blood', world: 'void', color: '#ff2a3a', sky: ['#0a0004', '#3a0010', '#8a0a1a'], lines: ['If I cannot be your god...', '...I will be your END.'] } }),
  lines: { intro: ['...'], win: ['I am still a god. I am still a GOD.', 'Heaven cast me out. You will not.', 'Kneel... KNEEL!'], taunt: ['WORTHLESS!', 'Hah... haha...'], form: ['A MORTAL?! A MORTAL DID THIS TO ME?!', 'I WILL NOT BE ENDED BY DUST!'], ult: ['DEICIDE!'], ultHit: ['...There. Now we are both fallen.'], moves: ['DIE!', 'Blasphemer!', 'Beneath... ME!'] },
};
(function prepCorrupt() {
  const C = aurelion.corruptForm, d = aurelion;
  for (const [slot, m] of Object.entries(C.moves)) { m.id = d.id + '_c' + slot; m.slot = slot; m.owner = d.id; if (slot === 'jS') m.air = true; }
  C.super.id = d.id + '_csuper'; C.ult.id = d.id + '_cult';
  C.normals = makeNormals(C.style);
  C.draw = makeModelDraw(Object.assign({}, d.model, C.model), null);
  // the Fallen God's portrait: base portrait machinery with the corrupt look
})();
DEITIES.forEach(id => { const d = charById(id); if (d) d.deity = true; });

// ---------- the fall (rage cinematic) ----------
function csAurelionFall(f) {
  const fx = new ParticleSystem(), d = f.baseDef || f.def, C = d.corruptForm;
  const killer = f.opp ? f.opp.def : null;
  const proxy = Object.create(d); proxy.draw = C.draw;
  return {
    name: 'FALLEN GOD', dur: 5.2, fx,
    cues: [[0, () => Sfx.tone(220, 0.6, 'sine', 0.1, 110)], [1.2, () => Sfx.clang()], [2.0, () => { Sfx.boom(); Sfx.roar && Sfx.roar(); }], [3.2, () => Sfx.boom()]],
    draw(c, t) {
      if (t < 2.0) {
        // kneeling in the rubble, halo cracking
        skyGrad(c, ['#1a1408', '#3a2a10', '#6a4a20']);
        vignette(c, 0.8);
        const k = seg(t, 0, 2.0);
        drawCharAt(c, d, W / 2, H - 40, 2.8, 1, { pose: 'kneel', anim: t, transformed: true });
        c.save(); c.translate(W / 2 + 12, H - 40 - 2.8 * 101); c.strokeStyle = t > 1.2 ? '#ff2a3a' : '#ffe08a'; c.lineWidth = 6;
        for (let i = 0; i < 6; i++) { const a0 = i * Math.PI / 3 + (t > 1.2 ? rand(-0.05, 0.05) : 0); c.beginPath(); c.ellipse(0, 0, 70, 18, 0, a0, a0 + Math.PI / 3 - (t > 1.2 ? 0.12 : 0)); c.stroke(); }
        c.restore();
        if (killer) caption(c, killer.name + '... a MORTAL...?', t, 0.2, 1.1, '#ffe08a');
        caption(c, 'No. NO. I AM A GOD!', t, 1.2, 1.95, '#ff5a6a');
        flashAt(c, t, 1.2, 1.35, '#ff2a3a');
      } else if (t < 3.2) {
        // corruption spreads: black-red storm
        c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
        const k = ease.out(seg(t, 2.0, 3.0));
        drawElement(c, 'blood', t, W / 2, H / 2, k, '#ff2a3a');
        for (let i = 0; i < 6; i++) fx.add({ x: W / 2 + rand(-400, 400), y: H + 10, vx: rand(-40, 40), vy: rand(-700, -300), life: 1, size: rand(6, 14), color: pick(['#ff2a3a', '#2a0008', '#000']), glow: true });
        fx.draw(c);
        silhouette(c, o => drawCharAt(o, proxy, W / 2, H / 2 + 170, lerp(1.6, 2.6, k), 1, { pose: 'charge', anim: t, transformed: false }), '#000', 1);
        c.globalCompositeOperation = 'lighter'; glowCircle(c, W / 2, H / 2 - 60, 150 * k, 'rgba(255,30,50,0.7)'); c.globalCompositeOperation = 'source-over';
        speedLines(c, t, W / 2, H / 2, 'rgba(255,40,60,0.5)');
      } else {
        skyGrad(c, ['#0a0004', '#3a0010', '#8a0a1a']);
        drawElement(c, 'blood', t, W / 2, H / 2 - 40, 0.6, '#ff2a3a');
        glowCircle(c, W / 2, H - 200, 400, 'rgba(255,30,50,0.35)', 'rgba(255,30,50,0)');
        drawCharAt(c, proxy, W / 2, H - 20, 2.9, 1, { pose: 'victory', anim: t, transformed: false });
        titleSlam(c, 'FALLEN GOD', 'IF I CANNOT BE WORSHIPPED, I WILL BE FEARED', t, 3.3, '#ff2a3a', 100);
        flashAt(c, t, 3.2, 3.5, '#ff2a3a');
      }
    },
  };
}
aurelion.corruptCutscene = csAurelionFall;

// ---------- rivalries ----------
rival('aurelion', 'seraph', [[0, 'Sister. You chose to love the mortals. How... small.'], [1, 'And you chose to love yourself. Heaven weeps for both of us, Aurelion.'], [0, 'Heaven does not weep. Heaven works for ME.']],
  { aurelion: 'Your mercy is weakness. Your defeat is proof.', seraph: 'Come home, brother. Before you fall for good.' });
rival('aurelion', 'eric', [[0, 'The moonborn. A beast wearing a boy.'], [1, "And you're a guy wearing a LOT of gold."], [0, 'Kneel, ape.'], [1, 'Hard pass.']],
  { aurelion: 'The moon should have chosen better.', eric: "Nice sword. Bit much, honestly." });
rival('aurelion', 'helios', [[1, 'Another who calls himself a god. How exhausting.'], [0, 'I do not call myself one, Helios. I simply AM one. You merely glow.']],
  { aurelion: 'The sun sets. Aurelion does not.', helios: 'Even the sun knows humility. It sets every night.' });
rival('aurelion', 'judge', [[1, 'Aurelion. Charge: impersonating a deity.'], [0, 'Your court has no jurisdiction over Heaven.'], [1, 'Everything is under my jurisdiction.']],
  { aurelion: 'Case dismissed. By God.', judge: 'Guilty. Sentence: humility. Two thousand hours.' });
rival('aurelion', 'vex', [[1, 'You want to be worshipped. I want everything to end. We could reach an arrangement.'], [0, 'Gods do not make arrangements with rounding errors.']],
  { aurelion: 'Even the void kneels.', vex: 'Gods, stars, cities. All temporary.' });
