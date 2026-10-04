// Redraw every reworked fighter's portrait as a pixel bust cut from the fighter's own sprite (see PxKit.bust).
// Aatrox, Seraph, Razor, Sion, Kael and Volibear keep their hand-baked Pixel Studio busts.
// m = how much the sprite is scaled around the origin (the sprite's own B factor times its build height); the head is framed from that.
(() => {
  PxKit.bustFrames = PxKit.bustFrames || {};
  const M = { gojo: 1.12, mordekaiser: 1.32, shinji: 1.08, oracle: 1.1, aurelion: 1.08, jinx: 1, kira: 1, dio: 1, yuji: 1, darius: 1, yhwach: 1, grimm: 1, leo: 1.08, blossom: 1.02, zephyr: 1.06, neon: 1.06, judge: 1.08, astra: 1.08 };
  for (const [id, m] of Object.entries(M)) PxKit.bustFrames[id] = [2 * m, -101 * m + 2, 1.8 / m];
  for (const id of ['gojo', 'mordekaiser', 'shinji', 'oracle', 'aurelion', 'eric', 'jinx', 'kira', 'dio', 'yuji', 'darius', 'yhwach', 'grimm', 'leo', 'blossom', 'zephyr', 'neon', 'judge', 'astra']) { const d = charById(id); if (d) PxKit.bust(d); }
})();
