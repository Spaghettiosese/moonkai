# MOONKAI — Heroes & Villains (proof of concept)

A 2D superhero vs. villain fighting game where the city is part of the fight. Everything runs in the browser from one canvas. The art, animation, cutscenes and sound are all generated in code, so there are no asset files.

## Play

Open `index.html` in a browser (double-clicking it works, and no server is needed). Press **Enter**, pick a fighter, and fight a CPU opponent.

| Key | Action |
|---|---|
| A / D | Move |
| W | Jump (Kira in Phoenix form: hold to fly) |
| S | Block |
| J | Attack (every 3rd hit in a combo is a knockback finisher) |
| K | Special move (changes when transformed) |
| L | Transform (needs a full blue meter; plays a cutscene) |
| I | ULTIMATE (needs a full gold meter; plays a cutscene) |
| M | Demo: fill both of your meters right away |
| Space / Enter | Skip a cutscene |
| Esc | Back to character select |

The meters fill over time, when you land hits and when you take hits.

## Roster

| | Eric — *The Moonborn* (Hero) | Kira Sol — *The Undying Flame* (Hero) | Vex — *Architect of Nothing* (Villain) |
|---|---|---|---|
| **Special** | Ki Blast (energy orb) | Flare Dart (fast fireball) | Shadow Spike (erupts under the enemy) |
| **Transformation** | **MOON ORB → MOONKAI**: he makes a ball of lunar energy, throws it into the sky as a fake full moon, and grows into a skyscraper-sized ape | **PHOENIX ASCENSION**: fire wings, flight, health regen | **VOID FORM**: a shadow wraith with lifesteal and damage resistance |
| **Transformed moves** | Seismic Smash (ground shockwave), Mouth Beam (melts buildings) | Feather Storm (3-way fire spread) | Rift Step (teleports behind you and slashes) |
| **Ultimate** | **LUNAR CATACLYSM**: a city-wide mouth beam. It also turns him into the ape if he isn't already | **SUPERNOVA REBIRTH**: she becomes a sun, dives down as a phoenix and rises from the ashes with +25 HP | **EVENT HORIZON**: opens a black hole that rips buildings out of the ground and swallows the enemy |

## Cutscenes

- A **VS intro** before every fight
- **3 transformation cutscenes**, one per character, for example Eric's orb → fake moon → eye close-up → growing silhouette
- **3 ultimate cutscenes**, one per character, each with several shots, a title card and an aftermath shot

## The city

The buildings behind the fight can be destroyed. Projectiles chip them, beams and shockwaves knock them down, and ultimates flatten whole blocks. The HUD keeps a running **City Damage** total in dollars.

## Code layout

```
index.html          canvas + script tags
js/core.js          math helpers, input, synthesized sound effects, particle system
js/characters.js    procedural character art (human poses, the Great Ape, the Void Wraith) + roster data
js/world.js         the destructible city, sky and moon
js/fighter.js       fighter physics, moves, transformations, CPU AI
js/cutscenes.js     cinematic helpers + all 7 cutscenes
js/game.js          game states (title/select/fight/end), combat resolution, HUD, main loop
```

## Ideas for next steps

- A local 2-player mode (the control code already goes through one `ctl` object)
- More characters, story mode, stage variety (day/night, other cities)
- Sprite art in place of the procedural placeholders
