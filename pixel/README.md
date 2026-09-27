# Moonkai Pixel Studio

A pixel art editor that runs in the browser and is tuned for anime-style art. To use it, open `pixel/index.html`. There is no build step and no dependencies. Your work autosaves in the browser.

## Features

- **High-res canvases:** presets from 32×32 up to 480×270, or any custom size up to 512×512. For detailed anime art, 128 px or more works best.
- **"Not too pixelated":** the *Smooth* view previews your art through Scale4x. PNG, sprite sheet and GIF exports can use Scale2x, which rounds off jagged edges.
- **Anime guides:** new canvases can start from a guide layer (front face, 3/4 face, chibi, 8-head full body or eye study). Guide layers are left out of exports.
- **Anime layer setup:** Background, Flats, Shading, Highlights and Line Art.
- **Tools:** pencil (pixel-perfect 1 px lines), eraser, flood fill (tolerance, contiguous or global), line, rectangle, ellipse (outline or filled), colour picker, shade, dither (5 patterns), spray, move and pan. Mirror X/Y symmetry works with every tool.
- **Shade tool:** left click lightens and right click darkens, with anime hue-shifting (highlights go warmer, shadows go cooler).
- **Brush presets:** Fine liner, Bold outline, Hair strand, Flat fill, Soft blush, Cel shade, Glow, Dither sky, Sparkles and Big eraser.
- **Palettes:** Anime Essentials, Anime Skin, Anime Hair, Anime Eyes, Sakura Pastel, Night City, Meadow, Endesga 32, Sweetie 16, PICO-8, Game Boy and Grayscale. You can also generate a hue-shifted shading ramp, extract a palette from your art, and save your own.
- **Colour:** primary and secondary colours, HSL and alpha sliders, hex input and recent colours.
- **Layers:** visibility, lock, opacity, rename (double-click), duplicate, reorder, merge down, outline effect and flip.
- **Character builder** (the **Character** button): a rigged, full-body anime character with generated animations.
  - Presets: Angel, Darkin, Schoolgirl, Ninja, Knight, Mage and Chibi hero.
  - Proportions from chibi (3 heads) to heroic (7.5), plus build and body shape.
  - Six hairstyles, sleeves, pants/skirt/shorts, wings (angel or demon), halo/horns/cat ears, a cape, and a sword, spear, staff or Darkin Blade. The Darkin Blade is Aatrox's living greatsword from the game, with its eye, and uses a wider canvas.
  - Eight colour pickers, and a Randomize button.
  - Animations: idle (with a blink), walk, run, jump, attack (with a slash trail), hover, or all of them as one sprite set.
  - Frames are drawn as outlined, cel-shaded pixel art on Background, Shadow and Character layers. You can also add frames to an existing canvas.
- **Animation:** frames, onion skin, FPS, and loop or ping-pong playback.
  - *Hold on all* copies a layer onto every frame.
  - *Motion presets* (float, bob, hop, sway, shake, breathe) turn a still drawing into a looping animation.
  - Export as a PNG, sprite sheet or animated GIF.
- **Also:** import an image (optionally snapped to the palette), a reference image overlay, undo/redo and 3 UI themes.

Press **?** in the app to see all keyboard shortcuts.
