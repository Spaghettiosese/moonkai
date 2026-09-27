# MOONKAI — Heroes & Villains

A 2D superhero fighting game where the city is part of the fight. It has 14 fighters, each with their own playstyle, transformation and cinematic ultimate. There are 6 stages with their own hazards, 4 game modes and best-of-3 rounds. Everything runs in the browser from one canvas. Art, animation, cutscenes and sound are all generated in code, so there are no asset files.

## Play

Open `index.html` in a browser. No server or build step is needed. On phones and tablets, on-screen touch controls appear.

### Controls

| Action | Player 1 | Player 2 (local versus) |
|---|---|---|
| Move / jump / block | A D / W / S | ← → / ↑ / ↓ |
| Dash (short i-frames) | Shift or O | Numpad0 or Right Shift |
| Attack (3-hit chain) | J | Numpad1 or `,` |
| Skill 1 / Skill 2 | K / L | Numpad2 or `.` / Numpad3 or `/` |
| Transform | U | Numpad4 or `;` |
| Ultimate | I | Numpad5 or `'` |
| Pause | Esc or P | |

## Modes

- **Arcade:** 6 battles with pre-fight dialogue. The CPU gets harder as you go, the last fight is a boss (40% more HP, starts with half an ultimate), and each fighter has their own ending.
- **Versus CPU:** a single best-of-3 match. Difficulty is set in the menu (Easy / Normal / Hard).
- **Versus 2 Player:** local multiplayer on one keyboard.
- **Training:** no timer and fast meters. **R** resets, **X** does 100 damage to yourself, **C** makes the dummy fight back, **B** makes it block.

## Mechanics

- **Ki (blue bar):** skills and dashes cost Ki. Blocking drains it, and at zero your guard breaks and you're stunned. It refills when you stop acting, so you can't spam.
- **Cooldowns:** every skill has one, shown on the HUD.
- **Combos:** each extra hit deals 10% less. After 7 hits the defender gets a **Combo Breaker**. Knocked-down fighters are briefly invulnerable when they stand up, so there are no infinite loops.
- **Projectile caps:** most projectile skills can only have a limited number on screen at once.
- **Status effects:** burn, bleed, slow, freeze, stun, weaken, mark, confuse and shield.
- **Transformations:** the blue FORM meter fills as you fight. Each form changes the fighter's model, stats and both skills.
- **Ultimates:** the gold meter fills from dealing and taking damage. They are unblockable cinematics worth about a quarter of a health bar.
- **Rounds:** best of 3, 99 seconds each.
- **Destructible stages:** buildings, containers, ice spires and ruins crumble, and the HUD keeps a running collateral damage total.

## Roster

| Fighter | Side | Playstyle | Transformation | Ultimate |
|---|---|---|---|---|
| **Eric** | Hero | Powerhouse | Moonkai (giant ape) | Lunar Cataclysm |
| **Kira Sol** | Hero | Aerial, burn | Phoenix (flight, regen) | Supernova Rebirth |
| **Vex** | Villain | Zoner, traps | Void Wraith (lifesteal) | Event Horizon |
| **Kael** | Anti-hero | Two lives | Demon (only by dying once) | Hellfire Barrage (locked until revived) |
| **Volt** | Hero | Rushdown speedster | Storm Avatar | Thunder God's Verdict |
| **Glacia** | Villain | Control, walls, slows | Absolute Zero (freezing aura) | Eternal Winter |
| **Titan** | Hero | Grappler, heavy | Iron Colossus | Meteor Suplex |
| **Nyx** | Villain | Assassin, stealth, backstab | Thousand Shadows (clones) | Death Lotus |
| **Dr. Gear** | Villain | Summoner: turrets, missiles | Mech Suit | Orbital Laser |
| **Seraph** | Hero | Sustain, healing zones | Archangel (flight) | Judgment Halo |
| **Razor** | Anti-hero | Berserker (stronger when hurt) | Bloodrage | Crimson Tempest |
| **Terra** | Hero | Defensive terrain, pillars | Mountain Golem | Tectonic Collapse |
| **Jinx** | Villain | Chaos: random cards, position swap | Jackpot (random buffs) | Cosmic Punchline |
| **Echo** | Hero | Time: rewind, slow time | Chrono Shift | Time Stop |

The character select screen lists each fighter's passive, both skills (and what they become in their transformed form), their transformation and their ultimate.

## Stages

Metro Night · Sunset Harbor · Magma Rift (eruptions) · Frostpeak Citadel (slippery ice) · Lunar Station (low gravity, meteors) · Sky Temple (wind gusts)

## Code layout

```
js/core.js        canvas, math, input, synthesized audio, particles
js/models.js      shaded procedural model renderer, poses, accessory system, golem & mech bodies
js/characters.js  hand-made art for Eric, Kira, Vex, Kael (ape, phoenix, wraith, demon)
js/world.js       sky, moon and skyline helpers used by cutscenes
js/stages.js      6 stages: scenery, destructible structures, physics, hazards
js/abilities.js   ability building blocks + projectile / hazard simulation and drawing
js/cutscenes.js   hand-made cinematics (VS intro, Eric/Kira/Vex/Kael transforms and ultimates)
js/cutscenes2.js  templated cinematics for the new fighters (6 ultimate styles, elemental transforms)
js/roster.js      all 14 fighters as data: stats, model, passive, skills, form, ultimate
js/fighter.js     fighter engine: movement, Ki, chain combos, statuses, grabs, dashes, input maps
js/ai.js          CPU opponents with 4 difficulty levels
js/game.js        menus, modes, rounds, combat resolution, HUD, arcade, endings, main loop
js/touch.js       on-screen touch controls and tap navigation
```

## Pixel Studio

The `pixel/` folder holds **Moonkai Pixel Studio**, a pixel art and animation editor for anime-style art. Open `pixel/index.html` to use it. See [pixel/README.md](pixel/README.md) for details. In the game, Aatrox and his portrait are drawn in the Pixel Studio style (`js/aatrox_pixel.js`).
