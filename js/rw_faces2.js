// Anime busts for the second wave of reworked fighters (same kit and install as rw_faces.js).
(() => {
  const { sh, shape, circ, ell, add, glow, star, spark, bg, head, under, eye, eyes, shut, brow, brows, nose, mouth, shoulders, hair, path, OL } = AF;

  // ---- VEX: the hood with nothing under it ----
  FACE.vex = (c, F) => {
    bg(c, { top: F ? '#1c0838' : '#10061e', bot: '#030006', glow: 'rgba(180,100,255,.4)', rings: 'rgba(190,110,255,.14)', stars: '#d8a0ff' });
    add(c, () => { for (let i = 0; i < 4; i++) { c.strokeStyle = `rgba(190,110,255,${.5 - i * .1})`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(80, 22, 10 + i * 6, 3 + i * 2, -.4, 0, 7); c.stroke(); } }); circ(c, 80, 22, 7, '#000');
    if (F) for (let i = 0; i < 6; i++) { const a = -2.6 + i * .52; shape(c, [[50 + Math.cos(a) * 24, 56 + Math.sin(a) * 24], [50 + Math.cos(a - .1) * 52, 56 + Math.sin(a - .1) * 52], [50 + Math.cos(a + .1) * 52, 56 + Math.sin(a + .1) * 52]], '#1a0a30', { smooth: true, line: 1.1, shine: false }); }
    shoulders(c, '#241038', { trim: '#b36bff' });
    shape(c, [[16, 100], [12, 52], [24, 22], [50, 10], [76, 22], [88, 52], [84, 100]], ['#2c1448', '#0a0414'], { smooth: true, line: 1.8, shine: '#8a5acc', shineLines: [[24, 30, 34, 16, 50, 12]] });
    shape(c, [[30, 54], [32, 36], [42, 26], [50, 24], [58, 26], [68, 36], [70, 54], [62, 72], [50, 78], [38, 72]], ['#0c0a12', '#020204'], { smooth: true, line: 1.4, shine: false });
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 11, 50, F ? 15 : 11, 'rgba(190,120,255,1)')); shape(c, [[50 + s * 4, 50], [50 + s * 18, 45], [50 + s * 16, 52], [50 + s * 7, 54]], '#f4e8ff', { line: 0, shine: false }); }
    if (F) { add(c, () => glow(c, 50, 34, 9, 'rgba(255,255,255,.9)')); shape(c, [[44, 34], [50, 29], [56, 34], [50, 39]], '#fff', { line: 1, shine: false }); circ(c, 50, 34, 2, '#3a0a5a'); }
    add(c, () => { c.strokeStyle = 'rgba(180,110,255,.55)'; c.lineWidth = 1; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(40 + i * 5, 62); c.lineTo(39 + i * 5.5, 84); c.stroke(); } });
  };

  // ---- VOLT: yellow lightning hair and a visor; awakened = white storm ----
  FACE.volt = (c, F) => {
    bg(c, { top: F ? '#0c1a50' : '#101040', bot: '#02020c', glow: F ? 'rgba(190,240,255,.55)' : 'rgba(255,233,90,.35)', streak: F ? 'rgba(190,240,255,.2)' : 'rgba(255,233,90,.16)', stars: '#fff' });
    add(c, () => { c.strokeStyle = F ? 'rgba(200,245,255,.9)' : 'rgba(255,240,120,.8)'; c.lineWidth = 1.6; for (const [x, y] of [[10, 10], [90, 30], [12, 60], [88, 70]]) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 7, y + 6); c.lineTo(x + 1, y + 9); c.lineTo(x + 9, y + 18); c.stroke(); } });
    const H = F ? '#eaf8ff' : '#ffe95a';
    hair(c, [[24, 56], [14, 40], [4, 30], [18, 28], [10, 10], [26, 20], [32, 2], [42, 18], [54, 0], [60, 18], [74, 6], [74, 24], [92, 20], [82, 38], [94, 46], [80, 56]], H, { hi: sh(H, .3), lo: sh(H, -.4), gloss: [[30, 24, 44, 8, 62, 16]], noStrands: true });
    shoulders(c, '#1a1a4e', { trim: F ? '#9fe8ff' : '#ffe95a' });
    shape(c, [[44, 78], [58, 78], [54, 90], [60, 90], [48, 100], [50, 92], [44, 92]], F ? '#9fe8ff' : '#ffe95a', { line: 1.1, shine: false });
    const P = head(c, { skin: '#eccfa6', w: 19, chin: 76, jaw: .6 });
    const fr = [[30, 46], [29, 32], [38, 22], [52, 16], [62, 22], [71, 32], [70, 46], [66, 36], [64, 40], [58, 26], [52, 40], [46, 26], [42, 42], [38, 30], [34, 44]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    shape(c, [[28, 47], [72, 47], [73, 58], [27, 58]], ['#2a2a30', '#0a0a10'], { line: 1.5, shine: false });
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 11, 52.5, F ? 16 : 12, 'rgba(190,240,255,1)')); shape(c, [[50 + s * 3, 50], [50 + s * 19, 49.5], [50 + s * 18, 56], [50 + s * 4, 56]], F ? '#ffffff' : '#bff4ff', { line: 0, shine: false }); }
    mouth(c, F ? 'grin' : 'smirk', { y: 67.5, w: 6 }); nose(c);
    hair(c, fr, H, { hi: sh(H, .3), lo: sh(H, -.35), gloss: [[38, 24, 48, 20, 58, 24]] });
  };

  // ---- GLACIA: the Frozen Throne ----
  FACE.glacia = (c, F) => {
    bg(c, { top: F ? '#0a2c50' : '#0a1c34', bot: '#020a14', glow: F ? 'rgba(170,250,255,.55)' : 'rgba(150,230,255,.35)', rays: 'rgba(220,250,255,.1)', rayN: 12, stars: '#fff', starN: F ? 30 : 16 });
    hair(c, [[22, 58], [16, 32], [28, 14], [50, 8], [72, 14], [84, 32], [78, 58], [86, 92], [74, 100], [26, 100], [14, 92]], '#f4fcff', { hi: '#ffffff', lo: '#9cc8e0', gloss: [[24, 30, 28, 60, 22, 90], [76, 30, 72, 60, 78, 90]] });
    shoulders(c, '#5aa0d8', { trim: '#e8f6ff' });
    for (const s of [-1, 1]) shape(c, [[50 + s * 18, 84], [50 + s * 28, 70], [50 + s * 44, 66], [50 + s * 48, 86], [50 + s * 36, 98]], ['#e8fbff', '#7ab8e0'], { line: 1.4, shine: '#fff', shineLines: [[50 + s * 26, 74, 50 + s * 36, 68, 50 + s * 42, 72]] });
    const P = head(c, { skin: '#dcecf8', w: 18, chin: 77, jaw: .85, blush: false });
    const fr = [[32, 46], [31, 32], [40, 24], [50, 20], [60, 24], [69, 32], [68, 46], [64, 36], [58, 42], [54, 30], [50, 40], [46, 30], [42, 42], [36, 36]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); }, 2.4, .18);
    c.save(); c.clip(P); add(c, () => { c.strokeStyle = 'rgba(200,250,255,.6)'; c.lineWidth = .9; for (const p of F ? [[34, 56, 40, 62, 36, 70], [66, 56, 60, 62, 64, 70], [50, 28, 52, 34, 50, 40]] : [[34, 58, 38, 64, 35, 70]]) { c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[2], p[3]); c.lineTo(p[4], p[5]); c.stroke(); } }); c.restore();
    eyes(c, { y: 52, d: 10, w: 6.8, h: 5, iris: F ? '#e8ffff' : '#7ad8ff', glow: F ? 'rgba(170,250,255,.9)' : 'rgba(120,220,255,.5)', lid: .26, tilt: -.5, pupil: !F });
    brows(c, { y: 43.5, tilt: -.5, col: '#9cc8e0', len: 8, th: 1.5 }); mouth(c, 'grim', { y: 67.5, w: 4 }); nose(c, { col: 'rgba(90,120,160,.5)' });
    hair(c, fr, '#f8feff', { hi: '#ffffff', lo: '#aed0e6', gloss: [[38, 26, 50, 22, 62, 26]] });
    // crown of ice
    const cn = F ? 1.4 : 1;
    shape(c, [[30, 28], [32, 28 - 14 * cn], [38, 22], [42, 28 - 22 * cn], [47, 22], [50, 28 - 30 * cn], [53, 22], [58, 28 - 22 * cn], [62, 22], [68, 28 - 14 * cn], [70, 28], [60, 26], [40, 26]], ['#ffffff', '#8ad0f0'], { line: 1.4, shine: false });
    add(c, () => glow(c, 50, 14, F ? 20 : 12, 'rgba(170,250,255,.6)'));
  };

  // ---- NYX: the quiet blade ----
  FACE.nyx = (c, F) => {
    bg(c, { top: F ? '#3a0828' : '#180a24', bot: '#04020a', glow: F ? 'rgba(255,42,106,.5)' : 'rgba(255,42,106,.28)', streak: 'rgba(255,42,106,.14)', stars: '#ff8ab0' });
    add(c, () => { c.fillStyle = F ? 'rgba(255,42,106,.55)' : 'rgba(255,42,106,.3)'; c.beginPath(); c.arc(80, 22, 12, 0, 7); c.fill(); });
    // ponytail + scarf tails
    shape(c, [[66, 30], [90, 34], [96, 70], [84, 90], [78, 62], [70, 44]], ['#2a1034', '#08020c'], { smooth: true, line: 1.4, shine: '#7a4a8a', shineLines: [[78, 40, 88, 56, 86, 74]] });
    shape(c, [[16, 70], [4, 86], [22, 94], [34, 80]], '#c01040', { smooth: true, line: 1.3, shine: false });
    shoulders(c, '#1a0a20', { trim: '#ff2a6a' });
    shape(c, [[30, 76], [50, 88], [70, 76], [76, 90], [50, 100], [24, 90]], '#c01040', { smooth: true, line: 1.4, shine: '#ff8aa8', shineLines: [[34, 82, 50, 90, 66, 82]] });
    const P = head(c, { skin: '#e4cccc', w: 18, chin: 76, jaw: .7, blush: false });
    // hood
    shape(c, [[24, 62], [22, 34], [34, 16], [50, 10], [66, 16], [78, 34], [76, 62], [68, 44], [58, 36], [42, 36], [32, 44]], ['#2a1434', '#0a040e'], { smooth: true, line: 1.6, shine: '#8a5a9a', shineLines: [[30, 28, 42, 14, 56, 12]] });
    // mask over the lower face
    shape(c, [[31, 56], [69, 56], [66, 70], [58, 78], [42, 78], [34, 70]], ['#2a1428', '#0a040c'], { smooth: true, line: 1.4, shine: false });
    c.strokeStyle = '#ff2a6a'; c.lineWidth = 1; c.beginPath(); c.moveTo(36, 62); c.lineTo(64, 62); c.stroke();
    eyes(c, { y: 50.5, d: 10, w: 6.8, h: 3.8, iris: F ? '#ff4a8a' : '#d01848', glow: F ? 'rgba(255,60,120,.9)' : 'rgba(255,42,106,.55)', lid: .4, tilt: -.7, white: '#ffe8ee', slit: true });
    brows(c, { y: 43, tilt: -1.4, col: '#08020c', len: 8, th: 2 });
    if (F) add(c, () => { c.strokeStyle = 'rgba(255,42,106,.7)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(10 + i * 16, 100); c.quadraticCurveTo(14 + i * 14, 70, 6 + i * 18, 40); c.stroke(); } });
  };

  // ---- GEAR: the mad mechanic; awakened = in the mech cockpit ----
  FACE.gear = (c, F) => {
    bg(c, { top: F ? '#2a1c08' : '#1a1a1c', bot: '#060604', glow: F ? 'rgba(255,176,32,.5)' : 'rgba(255,176,32,.28)', streak: 'rgba(255,200,90,.14)', stars: '#ffd890', starN: 8 });
    c.strokeStyle = 'rgba(255,176,32,.25)'; c.lineWidth = 1; for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(i * 10, 0); c.lineTo(i * 10, 100); c.moveTo(0, i * 10); c.lineTo(100, i * 10); c.stroke(); }
    if (F) { shape(c, [[0, 100], [0, 20], [14, 6], [86, 6], [100, 20], [100, 100], [90, 100], [90, 24], [80, 14], [20, 14], [10, 24], [10, 100]], ['#7a7e86', '#2c3038'], { line: 1.8, shine: '#cdd', shineLines: [[16, 20, 50, 10, 84, 20]] }); for (const [x, y] of [[8, 14], [92, 14], [8, 60], [92, 60]]) { circ(c, x, y, 3, '#ffb020'); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); } }
    hair(c, [[22, 58], [10, 46], [6, 30], [16, 20], [14, 8], [28, 12], [38, 2], [50, 8], [62, 2], [72, 12], [86, 8], [84, 20], [94, 30], [90, 46], [78, 58]], '#f4f4f4', { hi: '#ffffff', lo: '#a8a8b0', gloss: [[24, 24, 40, 8, 60, 12]], noStrands: true });
    shoulders(c, '#ecece4', { trim: '#8a8a80' });
    shape(c, [[36, 78], [50, 88], [64, 78], [60, 100], [40, 100]], '#4a4a50', { line: 1.2 }); c.fillStyle = '#ffb020'; c.fillRect(46, 90, 8, 4);
    const P = head(c, { skin: '#e4b896', w: 19.5, chin: 77, jaw: .55 });
    // goggles: two different lenses
    c.fillStyle = '#6a4a28'; c.fillRect(28, 44, 44, 5); 
    for (const [s, col] of [[-1, '#d89030'], [1, '#6ad8ff']]) { const x = 50 + s * 11; ell(c, x, 52, 9, 8, '#5a3a1a'); ell(c, x, 52, 7, 6.2, col); add(c, () => glow(c, x, 52, F ? 13 : 9, hexA(col, .8))); c.fillStyle = '#fff'; c.fillRect(x - 3, 49, 2.6, 2.6); circ(c, x + s * 1, 53, 2.2, '#201008'); c.strokeStyle = OL; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, 52, 9, 8, 0, 0, 7); c.stroke(); }
    brows(c, { y: 41.5, tilt: -1, col: '#a8a8b0', len: 9, th: 2.2 });
    mouth(c, 'grin', { y: 67, w: 10 }); nose(c);
    c.fillStyle = 'rgba(255,255,255,.18)'; if (F) c.fillRect(14, 16, 6, 40);
  };
})();

(() => {
  for (const id of ['vex', 'volt', 'glacia', 'nyx', 'gear']) {
    const d = charById(id); if (!d || !FACE[id]) continue;
    const prev = d.drawPortrait;
    const px = PxKit.portrait(id + '_face', (c, o, def) => FACE[id](c, !!o.form, def || d), { res: 100, levels: 14, dither: .14, outline: true });
    d.drawPortrait = (c, opts, def) => PxKit.on() ? px(c, opts || {}, def || d) : (prev ? prev(c, opts, def) : null);
  }
})();
