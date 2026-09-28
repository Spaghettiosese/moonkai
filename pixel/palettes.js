// Palette, canvas and brush presets for Moonkai Pixel Studio.
window.PALETTES = {
  'Anime Essentials': ['#1e1624','#3d2b45','#ffffff','#e3e6ff','#fff0e6','#ffd9c2','#f5b89a','#e0907a','#ff9aa8',
    '#f7e08a','#e0a84a','#ff8fb1','#d45a8a','#8a6ad0','#3d2a5c','#59b8ff','#2a6fd1','#1a2f7a','#7cf2c8','#ff5a5a','#ffd23f'],
  'Anime Skin': ['#fff4ec','#ffe6d5','#fcd3b8','#f5bd9c','#eaa281','#d9876b','#bf6b5a','#9c5249','#76403f','#4f2c30',
    '#ffb6b9','#f48a95'],
  'Anime Hair': ['#1c1a24','#2e2a3d','#4a4560','#5a3a2a','#8a5a3a','#b98556','#f8e7a0','#e8c56a','#c4943e',
    '#ffc2dc','#ff85b8','#d6508c','#bfe3ff','#6fb3f2','#3a6fc4','#f2f2fa','#c8c8dc','#8f8fae',
    '#ff7a6b','#d93b3b','#8f1f2e','#c9b3ff','#9474e0','#5b3fa8'],
  'Anime Eyes': ['#ffffff','#e8f6ff','#9ed8ff','#4aa8f0','#1f5fbf','#0f2a66','#d8ffe8','#7ae8a8','#2fb36b','#146b45',
    '#fff1b8','#ffc94a','#e08a1e','#8a4210','#ffb3c1','#ff4d6d','#b3143a','#5c0a22','#e6ccff','#a066ff','#5a1fb3','#2a0a5c','#1a1020'],
  'Sakura Pastel': ['#fff5f8','#ffd6e5','#ffb0cc','#f28bb0','#c9e4ff','#a6c8ff','#d9f2d0','#b5e3a8','#fff3c4','#ffe08a',
    '#e6d6ff','#c4a8ff','#fcefe3','#6b5a7a','#3d3050'],
  'Night City': ['#0d0221','#1b1b3a','#261447','#3f0071','#541388','#f706cf','#ff3864','#fd1d53','#ff4365','#f9c80e',
    '#2de2e6','#00f0ff','#65ff9e','#ffffff'],
  'Meadow': ['#2d4a3e','#4f7a4a','#7fa860','#b8d67a','#e9f0b8','#87c1e8','#4f8fc0','#f4e4c1','#d9a066','#a86b3c','#5c3a21','#fffaf0'],
  'Endesga 32': ['#be4a2f','#d77643','#ead4aa','#e4a672','#b86f50','#733e39','#3e2731','#a22633','#e43b44','#f77622',
    '#feae34','#fee761','#63c74d','#3e8948','#265c42','#193c3e','#124e89','#0099db','#2ce8f5','#ffffff','#c0cbdc',
    '#8b9bb4','#5a6988','#3a4466','#262b44','#181425','#ff0044','#68386c','#b55088','#f6757a','#e8b796','#c28569'],
  'Sweetie 16': ['#1a1c2c','#5d275d','#b13e53','#ef7d57','#ffcd75','#a7f070','#38b764','#257179','#29366f','#3b5dc9',
    '#41a6f6','#73eff7','#f4f4f4','#94b0c2','#566c86','#333c57'],
  'PICO-8': ['#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300',
    '#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa'],
  'Game Boy': ['#0f380f','#306230','#8bac0f','#9bbc0f'],
  'Grayscale': ['#000000','#1f1f1f','#3d3d3d','#5c5c5c','#7a7a7a','#999999','#b8b8b8','#d6d6d6','#f5f5f5','#ffffff'],
};

window.SIZE_PRESETS = [
  ['Icon', 32, 32], ['Sprite', 64, 64], ['Anime portrait', 128, 128], ['Anime bust', 160, 192],
  ['Full body', 128, 256], ['HD anime', 256, 256], ['Scene 16:9', 320, 180], ['Wide scene', 480, 270],
];

// Each preset picks a tool and overrides some of its options.
window.BRUSH_PRESETS = [
  { name: 'Fine liner', tool: 'pencil', opt: { size: 1, opacity: 100, pixelPerfect: true } },
  { name: 'Bold outline', tool: 'pencil', opt: { size: 2, shape: 'circle', opacity: 100 } },
  { name: 'Hair strand', tool: 'pencil', opt: { size: 1, opacity: 70, pixelPerfect: true } },
  { name: 'Flat fill', tool: 'fill', opt: { tolerance: 0, contiguous: true, opacity: 100 } },
  { name: 'Soft blush', tool: 'pencil', opt: { size: 5, shape: 'circle', opacity: 30 } },
  { name: 'Cel shade', tool: 'shade', opt: { size: 3, shadeAmt: 10, hueShift: true } },
  { name: 'Glow', tool: 'pencil', opt: { size: 9, shape: 'circle', opacity: 15 } },
  { name: 'Dither sky', tool: 'dither', opt: { size: 8, dither: 'checker' } },
  { name: 'Sparkles', tool: 'spray', opt: { size: 6, density: 4, opacity: 100 } },
  { name: 'Big eraser', tool: 'eraser', opt: { size: 12, shape: 'circle', opacity: 100 } },
];
