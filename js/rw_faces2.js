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

  // ---- TITAN ----
  FACE.titan = (c, F) => {
    bg(c, { top: F ? '#3a2408' : '#2a2018', bot: '#080604', glow: F ? 'rgba(255,170,40,.5)' : 'rgba(255,190,80,.28)', streak: 'rgba(255,200,100,.14)', stars: '#ffd890', starN: 8 });
    shoulders(c, F ? '#7a7e86' : '#3a4a5a', { trim: '#e0a020' });
    for (const s of [-1, 1]) shape(c, [[50 + s * 20, 86], [50 + s * 26, 66], [50 + s * 46, 62], [50 + s * 50, 88], [50 + s * 40, 100]], ['#f0b830', '#8a5a08'], { line: 1.6, shine: '#fff0a0', shineLines: [[50 + s * 28, 70, 50 + s * 38, 64, 50 + s * 44, 68]] });
    shape(c, [[36, 74], [64, 74], [66, 92], [34, 92]], '#caa070', { line: 1.3 });
    const P = head(c, { skin: '#c68a5a', w: 22, chin: 78, jaw: .15, top: 26, blush: false, ears: true });
    shape(c, [[28, 42], [30, 30], [40, 24], [50, 22], [60, 24], [70, 30], [72, 42], [68, 36], [50, 32], [32, 36]], '#1a1210', { line: 1.4, shine: false });
    c.save(); c.clip(P); const sg = c.createLinearGradient(0, 62, 0, 80); sg.addColorStop(0, 'rgba(20,12,8,0)'); sg.addColorStop(1, 'rgba(20,12,8,.5)'); c.fillStyle = sg; c.fillRect(20, 62, 60, 18); c.restore();
    if (F) { shape(c, [[50, 28], [72, 36], [72, 62], [62, 76], [50, 80]], ['#b8bcc6', '#4a4e58'], { line: 1.6, shine: '#fff', shineLines: [[56, 36, 66, 44, 68, 56]] }); for (const [x, y] of [[56, 40], [66, 52], [58, 68]]) circ(c, x, y, 1.4, '#222'); }
    eyes(c, { y: 52, d: 11, w: 6.6, h: 4.2, iris: '#5a3a1a', lid: .32, tilt: -1, white: '#f0e4d4' });
    if (F) { add(c, () => glow(c, 61, 52, 13, 'rgba(255,150,30,1)')); shape(c, [[55, 50], [68, 49], [68, 55], [56, 55]], '#ffcf6a', { line: 1, shine: false }); }
    brows(c, { y: 44, tilt: -2, col: '#140c08', len: 10, th: 2.8, d: 11 });
    c.strokeStyle = '#8a4a3a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(37, 42); c.lineTo(40, 58); c.stroke();
    mouth(c, 'frown', { y: 68, w: 7 }); nose(c, { y: 61 });
  };
  // ---- TERRA ----
  FACE.terra = (c, F) => {
    bg(c, { top: F ? '#2a2408' : '#1a2610', bot: '#060804', glow: F ? 'rgba(150,255,110,.45)' : 'rgba(150,230,110,.3)', rays: 'rgba(220,255,160,.08)', rayN: 10, stars: '#c8ff9a', starN: 10 });
    if (F) {
      shape(c, [[8, 100], [4, 60], [16, 30], [34, 14], [50, 10], [66, 14], [84, 30], [96, 60], [92, 100]], ['#7a6a4a', '#2a2014'], { smooth: true, line: 1.8, shine: '#c8b890', shineLines: [[18, 40, 30, 22, 48, 16]] });
      shape(c, [[30, 54], [32, 34], [44, 26], [50, 25], [56, 26], [68, 34], [70, 54], [60, 74], [50, 78], [40, 74]], ['#8a7a58', '#3a2e1c'], { smooth: true, line: 1.5, shine: false });
      for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 11, 48, 12, 'rgba(150,255,110,1)')); shape(c, [[50 + s * 5, 48], [50 + s * 18, 45], [50 + s * 17, 52], [50 + s * 7, 52]], '#e8ffd0', { line: 0, shine: false }); }
      add(c, () => { c.strokeStyle = 'rgba(150,255,110,.9)'; c.lineWidth = 1.3; for (const p of [[40, 30, 44, 42, 40, 54], [62, 32, 58, 44, 64, 56], [48, 58, 50, 68, 46, 74], [34, 60, 40, 66]]) { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.stroke(); } });
      shape(c, [[36, 66], [64, 66], [62, 76], [38, 76]], '#2a2014', { line: 1.2, shine: false }); c.fillStyle = '#c8b890'; for (let x = 40; x < 61; x += 5) c.fillRect(x, 67, 3, 6);
      return;
    }
    for (const s of [-1, 1]) shape(c, [[50 + s * 20, 40], [50 + s * 34, 52], [50 + s * 30, 84], [50 + s * 22, 94], [50 + s * 18, 60]], ['#3a2210', '#120a04'], { smooth: true, line: 1.4, shine: '#7a5230', shineLines: [[50 + s * 28, 54, 50 + s * 28, 70, 50 + s * 24, 86]] });
    shoulders(c, '#4a6a3a', { trim: '#c8a050' });
    shape(c, [[36, 78], [50, 90], [64, 78], [58, 100], [42, 100]], '#c8a050', { line: 1.2 });
    const P = head(c, { skin: '#9a6a46', w: 18.5, chin: 76, jaw: .5 });
    const fr = [[31, 46], [30, 32], [38, 22], [50, 17], [62, 22], [70, 32], [69, 46], [66, 36], [60, 40], [56, 28], [50, 38], [44, 28], [40, 40], [35, 34]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    eyes(c, { y: 52, d: 10.2, w: 6.8, h: 5.4, iris: '#c8901a', lid: .12 });
    brows(c, { y: 43, tilt: -.3, col: '#1a0e06', len: 8.5, th: 2 }); mouth(c, 'smile', { y: 67.5, w: 4.5 }); nose(c);
    c.strokeStyle = '#c8a050'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(36, 62); c.lineTo(41, 62); c.moveTo(59, 62); c.lineTo(64, 62); c.stroke();
    hair(c, fr, '#2a1a0a', { hi: '#6a4a2a', lo: '#0a0602', gloss: [[38, 26, 50, 22, 62, 26]] });
    shape(c, [[44, 20], [50, 12], [56, 20], [50, 26]], '#8bd070', { line: 1.2, shine: false });
  };
  // ---- ECHO ----
  FACE.echo = (c, F) => {
    bg(c, { top: F ? '#04303a' : '#0a2030', bot: '#02080c', glow: F ? 'rgba(136,240,224,.55)' : 'rgba(136,240,224,.3)', rings: 'rgba(136,240,224,.16)', stars: '#bff', starN: 12 });
    add(c, () => { for (let i = 0; i < (F ? 5 : 3); i++) { c.strokeStyle = `rgba(136,240,224,${.5 - i * .08})`; c.lineWidth = 2; c.beginPath(); c.arc(50, 46, 28 + i * 9, -.9, .9 - 3.14 + 3.14); c.stroke(); } });
    hair(c, [[24, 56], [20, 34], [30, 18], [50, 12], [70, 18], [80, 34], [76, 56], [80, 76], [70, 70], [66, 52], [34, 52], [30, 70], [20, 76]], '#e8e8f4', { hi: '#ffffff', lo: '#8a9ab0', gloss: [[26, 32, 32, 20, 48, 14]] });
    shoulders(c, '#1a3a4a', { trim: '#88f0e0' });
    shape(c, [[34, 78], [50, 90], [66, 78], [70, 92], [50, 100], [30, 92]], '#88f0e0', { line: 1.3, shine: '#fff', shineLines: [[38, 84, 50, 92, 62, 84]] });
    const P = head(c, { skin: '#d6b090', w: 18, chin: 76, jaw: .65 });
    const fr = [[31, 46], [31, 32], [40, 24], [50, 20], [60, 24], [69, 32], [69, 46], [64, 38], [60, 44], [54, 32], [50, 44], [46, 32], [40, 44], [36, 38]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); }, 2.4, .2);
    shape(c, [[27, 45], [73, 45], [74, 57], [26, 57]], ['#2a6a74', '#082a32'], { line: 1.5, shine: false });
    add(c, () => glow(c, 50, 51, F ? 24 : 16, 'rgba(136,240,224,.8)'));
    c.fillStyle = F ? '#ffffff' : '#c8fff6'; c.fillRect(30, 49, 40, 4); c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 6; i++) c.fillRect(34 + i * 6, 50 + (i % 2), 2.4, 2);
    mouth(c, 'smirk', { y: 67.5, w: 5 }); nose(c);
    hair(c, fr, '#f2f2fa', { hi: '#ffffff', lo: '#a8b4c8', gloss: [[38, 26, 50, 22, 62, 26]] });
    for (const s of [-1, 1]) { shape(c, [[50 + s * 20, 42], [50 + s * 27, 48], [50 + s * 27, 62], [50 + s * 20, 66]], '#1a3a4a', { line: 1.3, shine: false }); circ(c, 50 + s * 24, 54, 2, '#88f0e0'); }
  };
  // ---- MIRA ----
  FACE.mira = (c, F) => {
    bg(c, { top: F ? '#02203a' : '#042a44', bot: '#01080e', glow: F ? 'rgba(90,220,255,.55)' : 'rgba(90,220,255,.32)', rays: 'rgba(190,245,255,.1)', rayN: 12, stars: '#bff', starN: 16 });
    add(c, () => { c.strokeStyle = 'rgba(255,211,90,.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(86, 100); c.lineTo(86, 12); c.stroke(); for (const dx of [-7, 0, 7]) { c.beginPath(); c.moveTo(86 + dx, 18); c.lineTo(86 + dx, 4); c.stroke(); } c.beginPath(); c.moveTo(79, 18); c.lineTo(93, 18); c.stroke(); });
    if (F) for (const s of [-1, 1]) shape(c, [[50 + s * 18, 50], [50 + s * 34, 40], [50 + s * 38, 54], [50 + s * 34, 64], [50 + s * 20, 62]], ['#5ad8ff', '#0a6a9a'], { smooth: true, line: 1.3, shine: '#e8fcff', shineLines: [[50 + s * 24, 46, 50 + s * 32, 50, 50 + s * 34, 58]] });
    hair(c, [[22, 58], [16, 32], [28, 14], [50, 8], [72, 14], [84, 32], [78, 58], [86, 90], [74, 100], [26, 100], [14, 90]], '#3a9ad8', { hi: '#9ae0ff', lo: '#0a4a8a', gloss: [[24, 30, 28, 60, 22, 90], [76, 30, 72, 60, 78, 90]] });
    shoulders(c, '#1a6a9a', { trim: '#ffd35a' });
    shape(c, [[36, 76], [50, 88], [64, 76], [58, 100], [42, 100]], '#0a4a6a', { line: 1.2 });
    const P = head(c, { skin: '#cde4ec', w: 18, chin: 76, jaw: .7 });
    const fr = [[31, 46], [30, 32], [40, 22], [50, 18], [60, 22], [70, 32], [69, 46], [65, 36], [62, 42], [57, 28], [50, 42], [43, 28], [38, 42], [35, 36]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    if (F) { c.save(); c.clip(P); c.fillStyle = 'rgba(90,220,255,.35)'; for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) { c.beginPath(); c.arc(34 + i * 4.4 + (j % 2) * 2, 58 + j * 5, 2.2, 0, Math.PI, true); c.fill(); } c.restore(); }
    eyes(c, { y: 52, d: 10, w: 6.8, h: 5.6, iris: F ? '#e8ffff' : '#2a8ad8', glow: F ? 'rgba(120,230,255,.9)' : null, lid: .1, tilt: -.2, ring: F ? '#2a8ad8' : undefined });
    brows(c, { y: 43.5, tilt: -.3, col: '#0a4a8a', len: 8 }); mouth(c, 'smile', { y: 67.5, w: 4.5 }); nose(c);
    hair(c, fr, '#46a8e8', { hi: '#a8e8ff', lo: '#0a5a9a', gloss: [[38, 26, 50, 22, 62, 26]] });
    shape(c, [[36, 26], [40, 14], [45, 22], [50, 8], [55, 22], [60, 14], [64, 26], [56, 24], [44, 24]], ['#fff0a0', '#c8941c'], { line: 1.3, shine: false }); circ(c, 50, 20, 2, '#3ac8ff');
  };
  // ---- ONYX ----
  FACE.onyx = (c, F) => {
    bg(c, { top: F ? '#1a1244' : '#0c0a22', bot: '#020208', glow: F ? 'rgba(160,140,255,.55)' : 'rgba(138,122,255,.32)', rings: 'rgba(138,122,255,.14)', stars: '#c8c0ff' });
    add(c, () => { for (let i = 0; i < 3; i++) { const a = i * 2.1 + (F ? 1 : 0); c.fillStyle = 'rgba(200,190,255,.9)'; c.fillRect(Math.round(50 + Math.cos(a) * 44), Math.round(40 + Math.sin(a) * 22), 6, 6); } });
    for (const [x, h, w] of F ? [[24, 30, 6], [34, 40, 5], [50, 48, 6], [66, 40, 5], [76, 30, 6]] : [[34, 26, 5], [50, 34, 5], [66, 26, 5]]) shape(c, [[x - w, 36], [x, 36 - h], [x + w, 36]], ['#3a3a52', '#0e0e1a'], { line: 1.3, shine: false });
    shoulders(c, '#1a1a2a', { trim: '#8a7aff' });
    for (const s of [-1, 1]) { shape(c, [[50 + s * 18, 86], [50 + s * 28, 66], [50 + s * 48, 60], [50 + s * 50, 86], [50 + s * 38, 100]], ['#4a4a62', '#12121e'], { line: 1.7, shine: '#bcb4ff', shineLines: [[50 + s * 30, 70, 50 + s * 40, 64, 50 + s * 46, 68]] }); for (const k of [0, 1]) shape(c, [[50 + s * (32 + k * 8), 66 - k * 2], [50 + s * (36 + k * 8), 48 - k * 6], [50 + s * (40 + k * 8), 64 - k * 2]], '#8a7aff', { line: 1.1, shine: false }); }
    shape(c, [[28, 36], [34, 24], [50, 18], [66, 24], [72, 36], [74, 60], [66, 76], [50, 82], [34, 76], [26, 60]], ['#5a5a74', '#14141f'], { line: 1.9, shine: '#d0c8ff', shineLines: [[32, 32, 36, 52, 34, 70], [64, 28, 50, 20, 38, 28]] });
    shape(c, [[32, 44], [68, 44], [66, 56], [50, 60], [34, 56]], '#05050c', { line: 1.5, shine: false });
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 11, 50, F ? 15 : 10, 'rgba(160,140,255,1)')); shape(c, [[50 + s * 5, 50], [50 + s * 18, 47], [50 + s * 17, 53], [50 + s * 7, 54]], '#f0ecff', { line: 0, shine: false }); }
    c.fillStyle = '#05050c'; c.fillRect(44, 62, 12, 12); c.strokeStyle = '#8a7aff'; c.lineWidth = 1; for (let x = 45; x < 56; x += 3) { c.beginPath(); c.moveTo(x, 62); c.lineTo(x, 74); c.stroke(); }
    circ(c, 50, 30, F ? 5 : 3.5, '#8a7aff'); add(c, () => glow(c, 50, 30, F ? 14 : 8, 'rgba(160,140,255,.9)'));
  };
  // ---- PIXEL ----
  FACE.pixel = (c, F) => {
    bg(c, { top: F ? '#2a0a3a' : '#0a1a4a', bot: '#03030c', glow: F ? 'rgba(255,90,170,.5)' : 'rgba(90,255,138,.35)', stars: '#5aff8a', starN: 18 });
    c.strokeStyle = F ? 'rgba(255,90,170,.25)' : 'rgba(90,255,138,.2)'; c.lineWidth = 1; for (let i = 0; i < 11; i++) { c.beginPath(); c.moveTo(0, 6 + i * 9); c.lineTo(100, 6 + i * 9); c.stroke(); }
    for (let i = 0; i < 12; i++) { c.fillStyle = ['#5aff8a', '#ff5aaa', '#ffd35a', '#5acaff'][i % 4]; c.fillRect(((i * 41) % 90) + 4, ((i * 29) % 70) + 6, 6, 6); }
    // twin tails
    for (const s of [-1, 1]) shape(c, [[50 + s * 22, 44], [50 + s * 40, 50], [50 + s * 44, 76], [50 + s * 36, 92], [50 + s * 28, 64]], ['#ff7ac0', '#b83a8a'], { smooth: true, line: 1.4, shine: '#ffd0ec', shineLines: [[50 + s * 36, 54, 50 + s * 40, 70, 50 + s * 36, 84]] });
    shoulders(c, '#2a8a4a', { trim: '#ffffff' });
    shape(c, [[40, 78], [50, 88], [60, 78], [56, 100], [44, 100]], '#1a1a3a', { line: 1.2 }); star(c, 50, 92, 4, '#ffd35a');
    const P = head(c, { skin: '#f6d6b4', w: 19.5, chin: 74, jaw: .2, top: 26 });
    hair(c, [[30, 46], [30, 34], [38, 28], [50, 24], [62, 28], [70, 34], [70, 46], [64, 40], [58, 44], [52, 38], [46, 44], [40, 40], [34, 46]], '#ff6ab8', { hi: '#ffc0e4', lo: '#b8307a', gloss: [[38, 32, 50, 28, 62, 32]] });
    shape(c, [[28, 34], [30, 20], [42, 12], [58, 12], [70, 20], [72, 34], [60, 28], [40, 28]], ['#6affa0', '#1a9a4a'], { line: 1.5, shine: '#d0ffe0', shineLines: [[36, 20, 46, 14, 58, 14]] });
    shape(c, [[28, 34], [72, 34], [78, 40], [34, 40]], '#2aba5a', { line: 1.3, shine: false }); star(c, 50, 22, 5, '#ffd35a');
    eyes(c, { y: 54, d: 10.2, w: 7.4, h: 7.2, iris: F ? '#ff2a7a' : '#2ad870', glow: F ? 'rgba(255,60,140,.8)' : null, lid: 0, irisW: .7, slit: F });
    if (F) { c.fillStyle = 'rgba(0,0,0,.3)'; for (let i = 0; i < 12; i++) c.fillRect(24, 40 + i * 4, 52, 1); add(c, () => { c.fillStyle = 'rgba(90,255,138,.5)'; c.fillRect(20, 58, 12, 3); c.fillStyle = 'rgba(255,90,170,.5)'; c.fillRect(66, 50, 14, 3); }); }
    brows(c, { y: 44, tilt: F ? -1.4 : .2, col: '#b8307a', len: 7, th: 1.5 }); mouth(c, F ? 'open' : 'smile', { y: 67, w: F ? 7 : 5 });
    c.fillStyle = 'rgba(255,110,110,.35)'; c.fillRect(30, 62, 7, 4); c.fillRect(63, 62, 7, 4);
  };

  // ---- KAGE ----
  FACE.kage = (c, F) => {
    bg(c, { top: F ? '#3a0608' : '#1a1020', bot: '#04020a', glow: F ? 'rgba(255,70,70,.5)' : 'rgba(200,200,255,.22)', streak: F ? 'rgba(255,80,80,.18)' : 'rgba(255,255,255,.08)', stars: F ? '#ff8a8a' : '#c8c8e8' });
    add(c, () => { c.fillStyle = F ? 'rgba(255,70,70,.5)' : 'rgba(240,235,255,.55)'; c.beginPath(); c.arc(82, 22, 11, 0, 7); c.fill(); });
    c.strokeStyle = '#dde'; c.lineWidth = 2; c.beginPath(); c.moveTo(14, 100); c.lineTo(34, 62); c.stroke(); shape(c, [[30, 62], [42, 56], [40, 64]], '#ffd35a', { line: 1, shine: false });
    const H = F ? '#e8e0e8' : '#14141c';
    shape(c, [[42, 26], [46, 6], [54, 6], [58, 26]], [sh(H, .2), sh(H, -.3)], { line: 1.3, shine: false });
    shoulders(c, F ? '#2a0a0a' : '#2a2a3a', { trim: '#c03030' });
    shape(c, [[30, 76], [50, 92], [70, 76], [64, 92], [50, 100], [36, 92]], '#c03030', { line: 1.2 });
    const P = head(c, { skin: F ? '#a84040' : '#e0b890', w: 18.5, chin: 76, jaw: .7, blush: false });
    if (F) for (const s of [-1, 1]) shape(c, [[50 + s * 14, 30], [50 + s * 20, 12], [50 + s * 24, 32]], ['#f4ecd0', '#a89870'], { line: 1.3, shine: false });
    hair(c, [[30, 46], [29, 32], [38, 22], [50, 18], [62, 22], [71, 32], [70, 46], [66, 36], [60, 40], [56, 30], [50, 38], [44, 30], [40, 40], [34, 36]], H, { hi: sh(H, .3), lo: sh(H, -.4), gloss: [[38, 26, 50, 22, 62, 26]] });
    eyes(c, { y: 52, d: 10.4, w: 6.6, h: 4, iris: F ? '#ffd35a' : '#3a2a2a', glow: F ? 'rgba(255,200,60,.8)' : null, lid: .36, tilt: -1, white: F ? '#ffe8c0' : undefined, slit: F });
    brows(c, { y: 43.5, tilt: -1.6, col: F ? '#f0e8f0' : '#08080c', len: 8.5, th: 2.2 });
    c.strokeStyle = '#8a4a4a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(60, 38); c.lineTo(65, 60); c.stroke();
    mouth(c, F ? 'snarl' : 'grim', { y: 68, w: 5.5 }); nose(c);
  };
  // ---- ARACHNA ----
  FACE.arachna = (c, F) => {
    bg(c, { top: F ? '#3a0a28' : '#1a0814', bot: '#040104', glow: 'rgba(192,16,96,.4)', stars: '#f0c0d8' });
    c.strokeStyle = 'rgba(240,232,238,.3)'; c.lineWidth = 1; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(100, 0); c.lineTo(100 - i * 14, 100); c.stroke(); } for (let r = 1; r < 6; r++) { c.beginPath(); c.arc(100, 0, r * 24, 1.57, 3.14); c.stroke(); }
    for (let i = 0; i < (F ? 4 : 3); i++) for (const s of [-1, 1]) { c.strokeStyle = '#2a0a1a'; c.lineWidth = 4 - i * .5; c.lineCap = 'round'; c.beginPath(); c.moveTo(50 + s * 20, 60 + i * 5); c.quadraticCurveTo(50 + s * 52, 30 - i * 8, 50 + s * 46, 4 + i * 4); c.stroke(); }
    hair(c, [[22, 58], [18, 32], [30, 14], [50, 8], [70, 14], [82, 32], [78, 58], [84, 88], [72, 100], [28, 100], [16, 88]], '#1a0a14', { hi: '#5a2a44', lo: '#05020a', gloss: [[24, 30, 28, 60, 22, 90], [76, 30, 72, 60, 78, 90]] });
    shoulders(c, '#1a0a14', { trim: '#c01060' });
    shape(c, [[34, 76], [50, 88], [66, 76], [60, 100], [40, 100]], '#c01060', { line: 1.2 });
    const P = head(c, { skin: '#ecd4dc', w: 18, chin: 76, jaw: .85, blush: false });
    const fr = [[31, 46], [30, 32], [38, 22], [50, 18], [62, 22], [70, 32], [69, 46], [64, 34], [58, 44], [50, 30], [42, 44], [36, 34]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    for (const [x, y, r] of F ? [[42, 38, 2.2], [58, 38, 2.2], [36, 42, 1.6], [64, 42, 1.6], [50, 35, 2]] : [[42, 38, 2], [58, 38, 2]]) { add(c, () => glow(c, x, y, r * 3, 'rgba(255,40,120,.8)')); circ(c, x, y, r, '#ff3a8a'); circ(c, x - .5, y - .5, r * .4, '#fff'); }
    eyes(c, { y: 52, d: 10, w: 6.8, h: 5.4, iris: '#ff2a7a', glow: 'rgba(255,40,120,.7)', lid: .2, tilt: -.6, white: '#ffe0ea', slit: true });
    brows(c, { y: 44, tilt: -.9, col: '#1a0a14', len: 8, th: 1.6 });
    mouth(c, 'smirk', { y: 67.5, w: 5 }); for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 4, 68); c.lineTo(50 + s * 5, 75); c.lineTo(50 + s * 2, 69); c.fill(); } nose(c);
    hair(c, fr, '#22101c', { hi: '#6a3a54', lo: '#06020a', gloss: [[38, 26, 50, 22, 62, 26]] });
  };
  // ---- HEX ----
  FACE.hex = (c, F) => {
    bg(c, { top: F ? '#240a40' : '#160a28', bot: '#04010a', glow: F ? 'rgba(122,255,106,.4)' : 'rgba(154,90,255,.35)', rays: 'rgba(200,160,255,.1)', rayN: 10, stars: '#c8a0ff', starN: 16 });
    add(c, () => { c.fillStyle = 'rgba(225,215,255,.8)'; c.beginPath(); c.arc(20, 20, 10, 0, 7); c.fill(); });
    hair(c, [[22, 56], [18, 34], [28, 20], [50, 14], [72, 20], [82, 34], [78, 56], [86, 92], [74, 100], [26, 100], [14, 92]], '#14101a', { hi: '#4a3a5a', lo: '#04020a', gloss: [[24, 34, 28, 64, 22, 90], [76, 34, 72, 64, 78, 90]] });
    shoulders(c, '#2a1a3a', { trim: '#9a5aff' });
    shape(c, [[34, 76], [50, 86], [66, 76], [62, 100], [38, 100]], '#5a2a8a', { line: 1.2 });
    const P = head(c, { skin: '#b4d89c', w: 17.5, chin: 77, jaw: .85, blush: false });
    const fr = [[32, 46], [32, 34], [42, 28], [50, 26], [58, 28], [68, 34], [68, 46], [60, 40], [50, 34], [40, 40]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); }, 2, .2);
    eyes(c, { y: 52, d: 10, w: 6.8, h: 5.2, iris: F ? '#caff6a' : '#e8d020', glow: F ? 'rgba(160,255,100,.8)' : null, lid: .22, tilt: -.7, slit: true });
    brows(c, { y: 43.5, tilt: -1.4, col: '#14101a', len: 8.5, th: 2 });
    c.strokeStyle = 'rgba(80,110,60,.7)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(48, 54); c.lineTo(45, 64); c.lineTo(51, 64); c.stroke(); circ(c, 54, 61, 1.6, '#6a8a4a');
    mouth(c, 'grin', { y: 68, w: 8 });
    hair(c, fr, '#1a1424', { hi: '#5a4a6a', lo: '#06040a', gloss: [[40, 32, 50, 29, 60, 32]] });
    // the hat
    const tall = F ? 1.25 : 1;
    shape(c, [[14, 30], [28, 24], [72, 24], [86, 30], [70, 32], [30, 32]], ['#2a1a40', '#0a0414'], { smooth: false, line: 1.5, shine: false });
    shape(c, [[30, 26], [38, 4 - 10 * (tall - 1)], [52, -14 * tall + 6], [60, 6], [66, 26]], ['#2a1a40', '#0a0414'], { smooth: true, line: 1.5, shine: '#8a5acc', shineLines: [[38, 20, 46, 8, 54, 2]] });
    shape(c, [[30, 22], [66, 22], [66, 28], [30, 28]], F ? '#7aff6a' : '#9a5aff', { line: 1.2, shine: false }); shape(c, [[44, 20], [52, 20], [52, 30], [44, 30]], '#ffd35a', { line: 1, shine: false });
    if (F) add(c, () => { for (const [x, y] of [[14, 40], [86, 36], [20, 70], [82, 66]]) glow(c, x, y, 9, 'rgba(122,255,106,.8)'); });
  };
  // ---- MAXIMUS ----
  FACE.maximus = (c, F) => {
    bg(c, { top: F ? '#1c2a78' : '#0c1440', bot: '#020410', glow: F ? 'rgba(255,224,138,.55)' : 'rgba(255,224,138,.3)', rays: F ? 'rgba(255,230,150,.14)' : 'rgba(255,230,150,.06)', rayN: 14, stars: '#ffe9a8', starN: F ? 28 : 12 });
    if (F) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) shape(c, [[50 + s * 22, 66 - i * 4], [50 + s * 44, 52 - i * 10], [50 + s * (80 - i * 6), 28 + i * 14], [50 + s * 58, 70 - i * 2]], ['#ffffff', '#ffe08a'], { smooth: true, line: 1.1, shine: false });
    shape(c, [[0, 100], [4, 70], [20, 60], [30, 76]], '#1a2a7a', { line: 1.3 }); shape(c, [[100, 100], [96, 70], [80, 60], [70, 76]], '#1a2a7a', { line: 1.3 });
    shoulders(c, '#c0c8d8', { trim: '#ffd35a' });
    for (const s of [-1, 1]) shape(c, [[50 + s * 18, 84], [50 + s * 28, 68], [50 + s * 46, 64], [50 + s * 48, 88]], ['#e8eef8', '#7a8498'], { line: 1.5, shine: '#fff', shineLines: [[50 + s * 28, 72, 50 + s * 38, 66, 50 + s * 44, 70]] });
    shape(c, [[38, 76], [62, 76], [60, 94], [40, 94]], '#8a94a8', { line: 1.3 });
    // helm
    shape(c, [[28, 52], [28, 32], [38, 18], [50, 14], [62, 18], [72, 32], [72, 52], [68, 70], [58, 80], [50, 82], [42, 80], [32, 70]], ['#e0e6f4', '#6a748a'], { line: 1.9, shine: '#ffffff', shineLines: [[34, 28, 40, 18, 50, 16], [34, 40, 32, 56, 36, 68]] });
    shape(c, [[30, 42], [70, 42], [68, 54], [54, 56], [50, 74], [46, 56], [32, 54]], '#06080e', { line: 1.4, shine: false });
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 11, 49, F ? 13 : 8, F ? 'rgba(255,230,140,1)' : 'rgba(150,200,255,1)')); shape(c, [[50 + s * 5, 48], [50 + s * 18, 46], [50 + s * 17, 51], [50 + s * 7, 52]], F ? '#fff3c0' : '#d8ecff', { line: 0, shine: false }); }
    shape(c, [[46, 8], [54, 8], [56, 18], [44, 18]], F ? '#ffe08a' : '#2a3a9a', { line: 1.3, shine: false }); for (let i = 0; i < 4; i++) { c.strokeStyle = F ? '#ffe08a' : '#3a4aba'; c.lineWidth = 2; c.beginPath(); c.moveTo(50, 10); c.quadraticCurveTo(50 + (i - 1.5) * 8, -6, 50 + (i - 1.5) * 12, 2 + i * 2); c.stroke(); }
    c.strokeStyle = '#ffd35a'; c.lineWidth = 2; c.beginPath(); c.moveTo(28, 40); c.lineTo(72, 40); c.stroke();
    if (F) add(c, () => { c.strokeStyle = 'rgba(255,230,140,.9)'; c.lineWidth = 3; c.beginPath(); c.ellipse(50, 8, 22, 5, 0, 0, 7); c.stroke(); glow(c, 50, 8, 18, 'rgba(255,230,140,.5)'); });
  };
  // ---- REX ----
  FACE.rex = (c, F) => {
    bg(c, { top: F ? '#3a0a04' : '#102404', bot: '#040a02', glow: F ? 'rgba(255,90,40,.45)' : 'rgba(150,220,90,.3)', streak: F ? 'rgba(255,120,60,.18)' : 'rgba(180,255,120,.12)', stars: F ? '#ffb090' : '#c8ff9a', starN: 8 });
    const G = F ? ['#4a9a2a', '#143808'] : ['#8aca4a', '#2a5a14'];
    shoulders(c, F ? '#2a6a1a' : '#4a8a2a', { trim: '#c8ff9a' });
    for (let i = 0; i < 7; i++) shape(c, [[16 + i * 11, 78], [20 + i * 11, 62 - (i % 2) * 8], [26 + i * 11, 78]], F ? '#2a5a14' : '#5a9a2a', { line: 1.2, shine: false });
    if (F) for (const x of [32, 42, 50, 58, 68]) shape(c, [[x - 4, 26], [x, 6 + Math.abs(x - 50) * .4], [x + 4, 26]], ['#e8e0c0', '#8a7a50'], { line: 1.2, shine: false });
    // skull
    shape(c, [[24, 56], [24, 38], [34, 22], [50, 18], [66, 22], [76, 38], [76, 56], [72, 74], [60, 86], [50, 88], [40, 86], [28, 74]], G, { smooth: true, line: 1.8, shine: F ? '#9ada6a' : '#d0f08a', shineLines: [[30, 32, 40, 22, 54, 20]] });
    // brow ridges + eyes
    shape(c, [[26, 44], [50, 40], [74, 44], [72, 36], [50, 32], [28, 36]], F ? '#143808' : '#2a5a14', { line: 1.3, shine: false });
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 15, 48, F ? 13 : 9, F ? 'rgba(255,60,30,1)' : 'rgba(255,220,60,1)')); shape(c, [[50 + s * 7, 47], [50 + s * 22, 44], [50 + s * 22, 51], [50 + s * 9, 52]], F ? '#ffb090' : '#fff0a0', { line: 1.1, shine: false }); c.fillStyle = '#100604'; c.fillRect(50 + s * 14.5, 44.5, 2, 6.5); }
    // snout
    shape(c, [[30, 62], [70, 62], [72, 80], [60, 88], [40, 88], [28, 80]], F ? ['#5aaa34', '#1a4010'] : ['#a0d460', '#3a6a1c'], { smooth: true, line: 1.6, shine: false });
    circ(c, 42, 66, 2, '#10200a'); circ(c, 58, 66, 2, '#10200a');
    shape(c, [[32, 76], [68, 76], [66, 84], [34, 84]], '#3a0c10', { line: 1.3, shine: false });
    c.fillStyle = '#fffbe8'; for (let x = 34; x < 67; x += 4.5) { c.beginPath(); c.moveTo(x, 76); c.lineTo(x + 2.2, 82.5 + (x % 9 < 4 ? 1.5 : 0)); c.lineTo(x + 4.4, 76); c.fill(); } for (let x = 36; x < 66; x += 6) { c.beginPath(); c.moveTo(x, 84); c.lineTo(x + 2, 79); c.lineTo(x + 4, 84); c.fill(); }
    c.strokeStyle = F ? '#e86a3a' : '#7a2a1a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(60, 30); c.lineTo(64, 46); c.lineTo(60, 56); c.stroke();
  };
  // ---- HELIOS ----
  FACE.helios = (c, F) => {
    bg(c, { top: F ? '#a84a10' : '#5a2a04', bot: '#1a0a02', glow: F ? 'rgba(255,240,160,.7)' : 'rgba(255,200,80,.4)', rays: F ? 'rgba(255,240,160,.22)' : 'rgba(255,210,100,.12)', rayN: F ? 20 : 14, stars: '#ffe9a0', starN: 14 });
    add(c, () => { c.fillStyle = F ? 'rgba(255,255,220,.9)' : 'rgba(255,220,120,.55)'; c.beginPath(); c.arc(50, 40, F ? 38 : 30, 0, 7); c.fill(); });
    hair(c, [[22, 56], [14, 34], [22, 12], [50, 4], [78, 12], [86, 34], [78, 56], [88, 90], [74, 100], [26, 100], [12, 90]], F ? '#fff6c0' : '#ffe27a', { hi: '#fffde8', lo: F ? '#ffb020' : '#c89a24', gloss: [[24, 30, 28, 62, 22, 92], [76, 30, 72, 62, 78, 92]] });
    shoulders(c, '#ffd35a', { trim: '#fff6c0' });
    shape(c, [[38, 76], [50, 90], [62, 76], [58, 100], [42, 100]], '#fff0d0', { line: 1.1 }); star(c, 50, 90, 4, '#ff8a1a');
    const P = head(c, { skin: '#d8a050', w: 18.5, chin: 76, jaw: .7 });
    const fr = [[31, 46], [30, 32], [40, 22], [50, 18], [60, 22], [70, 32], [69, 46], [65, 36], [60, 44], [54, 30], [50, 42], [46, 30], [40, 44], [35, 36]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    eyes(c, { y: 52, d: 10.2, w: 6.8, h: 5.4, iris: F ? '#ffffff' : '#ffc01a', glow: F ? 'rgba(255,255,200,.95)' : 'rgba(255,180,40,.5)', lid: .18, tilt: -.5, white: F ? '#fffbe0' : undefined, pupil: !F });
    brows(c, { y: 43.5, tilt: -.7, col: '#c89a24', len: 8.5 }); mouth(c, 'smirk', { y: 67.5, w: 5 }); nose(c);
    hair(c, fr, F ? '#fffbd0' : '#ffeb8a', { hi: '#ffffff', lo: F ? '#ffc040' : '#d4a62c', gloss: [[38, 26, 50, 22, 62, 26]] });
    shape(c, [[34, 26], [38, 12], [43, 22], [50, 6], [57, 22], [62, 12], [66, 26], [56, 24], [44, 24]], ['#fff0a0', '#e0901c'], { line: 1.3, shine: false }); circ(c, 50, 20, 2.4, '#ff6a1a');
    add(c, () => glow(c, 50, 14, F ? 24 : 14, 'rgba(255,230,120,.6)'));
  };

  // ---- LUNA ----
  FACE.luna = (c, F) => {
    bg(c, { top: F ? '#08081f' : '#14103a', bot: '#02020a', glow: F ? 'rgba(160,170,255,.4)' : 'rgba(192,200,255,.35)', rings: 'rgba(192,200,255,.12)', stars: '#dfe4ff', starN: 20 });
    if (F) { add(c, () => glow(c, 50, 38, 40, 'rgba(255,230,160,.5)')); circ(c, 50, 38, 28, '#04041a'); add(c, () => { c.strokeStyle = 'rgba(255,240,190,.9)'; c.lineWidth = 3; c.beginPath(); c.arc(50, 38, 29, 0, 7); c.stroke(); }); }
    else { add(c, () => { c.fillStyle = 'rgba(240,240,255,.6)'; c.beginPath(); c.arc(80, 20, 11, 0, 7); c.fill(); }); }
    hair(c, [[22, 56], [16, 30], [28, 12], [50, 6], [72, 12], [84, 30], [78, 56], [86, 92], [74, 100], [26, 100], [14, 92]], '#e8e8f8', { hi: '#ffffff', lo: '#8a8cb0', gloss: [[24, 30, 28, 62, 22, 90], [76, 30, 72, 62, 78, 90]] });
    shoulders(c, F ? '#0a0a1a' : '#2a1a5a', { trim: '#c0c8ff' });
    shape(c, [[36, 76], [50, 90], [64, 76], [58, 100], [42, 100]], F ? '#140a2a' : '#4a3a8a', { line: 1.2 });
    const P = head(c, { skin: '#f0dce4', w: 18, chin: 76, jaw: .75 });
    const fr = [[31, 46], [30, 32], [40, 22], [50, 18], [60, 22], [70, 32], [69, 46], [65, 36], [60, 44], [54, 30], [50, 42], [46, 30], [40, 44], [35, 36]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    eyes(c, { y: 52, d: 10, w: 6.8, h: 5.2, iris: F ? '#ffe9a8' : '#a8a0ff', glow: F ? 'rgba(255,230,160,.8)' : 'rgba(168,160,255,.4)', lid: .26, tilt: -.4 });
    brows(c, { y: 43.5, tilt: -.5, col: '#8a8cb0', len: 8, th: 1.5 }); mouth(c, 'smirk', { y: 67.5, w: 5 }); nose(c);
    hair(c, fr, '#f4f4ff', { hi: '#ffffff', lo: '#9a9cc0', gloss: [[38, 26, 50, 22, 62, 26]] });
    c.strokeStyle = '#c0c8ff'; c.lineWidth = 2.4; c.beginPath(); c.arc(50, 24, 12, 3.6, 5.8); c.stroke(); circ(c, 50, 12, 2.2, '#fff');
  };
  // ---- CIPHER ----
  FACE.cipher = (c, F) => {
    bg(c, { top: F ? '#04301c' : '#021810', bot: '#010604', glow: 'rgba(42,255,154,.35)', stars: '#2aff9a', starN: 4 });
    c.fillStyle = 'rgba(42,255,154,.5)'; for (let i = 0; i < 40; i++) c.fillRect((i * 29) % 100, (i * 43) % 100, 2, 6 + (i % 4) * 3);
    shape(c, [[18, 100], [14, 52], [26, 22], [50, 10], [74, 22], [86, 52], [82, 100]], ['#0e2a20', '#02080a'], { smooth: true, line: 1.8, shine: '#2aff9a', shineLines: [[24, 30, 34, 16, 50, 12]] });
    shoulders(c, '#0a1a14', { trim: '#2aff9a' });
    shape(c, [[30, 54], [32, 36], [42, 28], [50, 26], [58, 28], [68, 36], [70, 54], [62, 72], [50, 78], [38, 72]], ['#cdb4a4', '#7a6458'], { smooth: true, line: 1.4, shine: false });
    shape(c, [[28, 42], [72, 42], [74, 55], [26, 55]], ['#0a2a20', '#02080a'], { line: 1.5, shine: false });
    add(c, () => glow(c, 50, 48, F ? 28 : 18, 'rgba(42,255,154,.9)'));
    c.fillStyle = F ? '#eafff4' : '#2aff9a'; c.fillRect(30, 46, 40, 4); c.fillStyle = '#fff'; for (let i = 0; i < 8; i++) c.fillRect(32 + i * 5, 47 + (i % 2), 2, 2);
    if (F) { shape(c, [[44, 28], [50, 22], [56, 28], [50, 34]], '#2aff9a', { line: 1, shine: false }); circ(c, 50, 28, 2, '#02140c'); }
    shape(c, [[34, 62], [66, 62], [62, 76], [50, 80], [38, 76]], ['#14342a', '#04120c'], { smooth: true, line: 1.4, shine: false });
    c.strokeStyle = '#2aff9a'; c.lineWidth = 1; for (const x of [42, 50, 58]) { c.beginPath(); c.moveTo(x, 64); c.lineTo(x, 76); c.stroke(); }
    c.fillStyle = '#2aff9a'; c.fillRect(24, 74, 3, 3); c.fillRect(73, 70, 3, 3);
  };
  // ---- FANG ----
  FACE.fang = (c, F) => {
    bg(c, { top: F ? '#3a0a0e' : '#10162a', bot: '#03040a', glow: F ? 'rgba(255,80,80,.4)' : 'rgba(200,210,240,.28)', stars: '#e8ecff', starN: 10 });
    add(c, () => { c.fillStyle = F ? 'rgba(255,90,90,.6)' : 'rgba(240,244,255,.65)'; c.beginPath(); c.arc(80, 20, 13, 0, 7); c.fill(); });
    const G = F ? ['#e8e8f4', '#8a8ca4'] : ['#a8b0c0', '#4a5068'];
    shoulders(c, '#4a3a2a', { trim: '#9a8a6a' });
    if (F) for (let i = 0; i < 9; i++) shape(c, [[14 + i * 9, 80], [18 + i * 9, 60 - (i % 2) * 8], [24 + i * 9, 80]], '#cfd0e0', { line: 1.1, shine: false });
    for (const s of [-1, 1]) shape(c, [[50 + s * 14, 34], [50 + s * 28, 6], [50 + s * 34, 40]], G, { line: 1.6, shine: false }), shape(c, [[50 + s * 19, 34], [50 + s * 27, 14], [50 + s * 30, 36]], '#e8b0b0', { line: 0, shine: false });
    shape(c, [[24, 56], [24, 38], [34, 26], [50, 22], [66, 26], [76, 38], [76, 56], [70, 74], [58, 84], [50, 86], [42, 84], [30, 74]], G, { smooth: true, line: 1.8, shine: F ? '#fff' : '#d8e0f0', shineLines: [[30, 34, 40, 24, 54, 22]] });
    shape(c, [[36, 56], [64, 56], [62, 76], [50, 84], [38, 76]], F ? ['#f4f4fa', '#b0b2c8'] : ['#d0d6e2', '#7a8094'], { smooth: true, line: 1.4, shine: false });
    shape(c, [[44, 58], [56, 58], [53, 66], [50, 68], [47, 66]], '#1a141c', { smooth: true, line: 1.1, shine: false });
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 12, 46, F ? 13 : 9, F ? 'rgba(255,50,50,1)' : 'rgba(255,190,50,1)')); shape(c, [[50 + s * 5, 47], [50 + s * 19, 43], [50 + s * 19, 50], [50 + s * 7, 52]], F ? '#ffb0a0' : '#ffe08a', { line: 1.1, shine: false }); c.fillStyle = '#100808'; c.fillRect(50 + s * 12.5 - 1, 43.5, 2, 6.5); }
    shape(c, [[34, 44], [50, 48], [66, 44], [64, 38], [50, 40], [36, 38]], F ? '#6a6a84' : '#4a5068', { line: 1.1, shine: false });
    shape(c, [[36, 74], [64, 74], [62, 80], [38, 80]], '#2a0c10', { line: 1.2, shine: false });
    c.fillStyle = '#fffbe8'; for (let x = 38; x < 63; x += 4.2) { c.beginPath(); c.moveTo(x, 74); c.lineTo(x + 2.1, 79); c.lineTo(x + 4.2, 74); c.fill(); }
    c.strokeStyle = '#7a1c1c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(60, 28); c.lineTo(64, 40); c.lineTo(61, 48); c.stroke();
  };
  // ---- HOSHI ----
  FACE.hoshi = (c, F) => {
    bg(c, { top: F ? '#4a3010' : '#2a2014', bot: '#0a0804', glow: F ? 'rgba(255,224,160,.6)' : 'rgba(255,224,160,.3)', rays: F ? 'rgba(255,230,170,.16)' : 'rgba(255,230,170,.07)', rayN: 12, stars: '#ffe9c0', starN: 8 });
    const H = F ? '#1a1410' : '#ececec';
    shape(c, [[44, 22], [46, 4], [54, 4], [56, 22]], [sh(H, .25), sh(H, -.3)], { line: 1.3, shine: false }); circ(c, 50, 6, 4, sh(H, .1));
    shoulders(c, '#c8a060', { trim: '#c03030' });
    shape(c, [[30, 78], [50, 94], [70, 78], [66, 100], [34, 100]], '#a08040', { line: 1.3 }); c.strokeStyle = '#c03030'; c.lineWidth = 3; c.beginPath(); c.moveTo(30, 88); c.lineTo(70, 88); c.stroke();
    const P = head(c, { skin: F ? '#e8c8a0' : '#d8b890', w: 18.5, chin: 76, jaw: .6 });
    hair(c, [[32, 44], [32, 30], [40, 24], [50, 22], [60, 24], [68, 30], [68, 44], [60, 36], [40, 36]], H, { hi: sh(H, .3), lo: sh(H, -.35), noStrands: true, shine: false });
    if (!F) { // long white brows and beard
      for (const s of [-1, 1]) shape(c, [[50 + s * 4, 44], [50 + s * 22, 44], [50 + s * 24, 52], [50 + s * 14, 49]], '#f4f4f4', { smooth: true, line: 1.1, shine: false });
      shape(c, [[34, 64], [66, 64], [64, 82], [50, 98], [36, 82]], ['#ffffff', '#c8c8d0'], { smooth: true, line: 1.3, shine: false });
      eyes(c, { y: 54, d: 10, w: 5.8, h: 3.4, iris: '#5a3a1a', lid: .5 }); mouth(c, 'smile', { y: 66, w: 4 });
    } else {
      brows(c, { y: 44, tilt: -.9, col: '#1a1410', len: 8.5, th: 2 });
      eyes(c, { y: 52, d: 10.2, w: 6.4, h: 4.8, iris: '#e8a020', glow: 'rgba(255,200,80,.6)', lid: .18, tilt: -.5 }); mouth(c, 'smirk', { y: 67, w: 5.5 });
      add(c, () => glow(c, 50, 46, 34, 'rgba(255,224,160,.35)'));
    }
    nose(c);
  };
  // ---- MORTIS ----
  FACE.mortis = (c, F) => {
    bg(c, { top: F ? '#04180e' : '#061a14', bot: '#010504', glow: 'rgba(106,255,154,.4)', rings: 'rgba(106,255,154,.1)', stars: '#9affc0', starN: 12 });
    if (F) { for (const s of [-1, 1]) shape(c, [[50 + s * 16, 26], [50 + s * 34, 24], [50 + s * 44, 70], [50 + s * 30, 100], [50 + s * 22, 60]], ['#0e2a1c', '#02080a'], { smooth: true, line: 1.6, shine: '#2a8a5a', shineLines: [[50 + s * 34, 34, 50 + s * 38, 60, 50 + s * 32, 88]] }); }
    shoulders(c, F ? '#0e2a1c' : '#e8e8e0', { trim: F ? '#6aff9a' : '#a8a8a0' });
    shape(c, [[38, 76], [50, 90], [62, 76], [58, 100], [42, 100]], '#1a1a1a', { line: 1.2 });
    const P = head(c, { skin: F ? '#cfd8c4' : '#b0c0a8', w: 18, chin: 77, jaw: .8, blush: false });
    if (F) { c.save(); c.clip(P); c.fillStyle = '#04140a'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(50 + s * 9, 52, 6, 7, 0, 0, 7); c.fill(); } c.beginPath(); c.moveTo(50, 58); c.lineTo(47, 66); c.lineTo(53, 66); c.fill(); for (let x = 38; x < 63; x += 4) c.fillRect(x, 70, 2.6, 8); c.restore(); }
    hair(c, [[31, 46], [30, 32], [38, 22], [50, 16], [62, 22], [70, 32], [69, 46], [64, 34], [50, 30], [36, 34]], F ? '#2a8a5a' : '#1a1a20', { hi: F ? '#9affc0' : '#4a4a58', lo: F ? '#0a3a22' : '#05050a', gloss: [[38, 24, 50, 20, 62, 24]], noStrands: true });
    if (!F) {
      eyes(c, { y: 53, d: 10, w: 6, h: 4.2, iris: '#3a5a3a', lid: .3, tilt: -.4 });
      for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 10, 53, 11, 'rgba(106,255,154,.7)')); c.strokeStyle = '#2a2a30'; c.lineWidth = 1.6; c.fillStyle = 'rgba(106,255,154,.35)'; c.beginPath(); c.ellipse(50 + s * 10, 53, 9, 7, 0, 0, 7); c.fill(); c.stroke(); } c.beginPath(); c.moveTo(41, 52); c.lineTo(59, 52); c.stroke();
      brows(c, { y: 44, tilt: -.6, col: '#1a1a20', len: 8, th: 1.6 }); mouth(c, 'smirk', { y: 67, w: 5 }); nose(c);
      c.strokeStyle = '#4a5a48'; c.lineWidth = 1; c.beginPath(); c.moveTo(60, 56); c.lineTo(64, 60); c.moveTo(61, 59); c.lineTo(65, 55); c.stroke();
    } else { for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 9, 52, 11, 'rgba(106,255,154,1)')); circ(c, 50 + s * 9, 52, 2.4, '#eafff2'); } add(c, () => { for (let i = 0; i < 7; i++) glow(c, 28 + i * 7, 18 - Math.abs(i - 3) * 2, 7, 'rgba(106,255,154,.8)'); }); }
  };
  // ---- CHROME ----
  FACE.chrome = (c, F) => {
    bg(c, { top: F ? '#3a2410' : '#4a2a12', bot: '#0e0804', glow: 'rgba(255,200,100,.35)', rays: 'rgba(255,220,150,.1)', rayN: 12, stars: '#ffe0a0', starN: 6 });
    add(c, () => { c.fillStyle = 'rgba(255,230,160,.7)'; c.beginPath(); c.arc(50, 34, 24, 0, 7); c.fill(); });
    shoulders(c, '#6a4a2a', { trim: '#c8a060' });
    shape(c, [[36, 78], [50, 90], [64, 78], [60, 100], [40, 100]], '#c8a060', { line: 1.2 }); star(c, 50, 92, 5, '#ffd35a');
    const P = head(c, { skin: '#b08a6a', w: 19.5, chin: 77, jaw: .3 });
    c.save(); c.clip(P); const sg = c.createLinearGradient(0, 60, 0, 80); sg.addColorStop(0, 'rgba(40,24,12,0)'); sg.addColorStop(1, 'rgba(40,24,12,.55)'); c.fillStyle = sg; c.fillRect(20, 60, 60, 20); c.restore();
    if (F) { shape(c, [[50, 40], [70, 44], [70, 68], [60, 78], [50, 80]], ['#d8e0ea', '#6a7482'], { line: 1.5, shine: '#fff', shineLines: [[56, 46, 66, 52, 66, 62]] }); for (const [x, y] of [[56, 48], [64, 60]]) circ(c, x, y, 1.3, '#2a2a30'); }
    shape(c, [[27, 40], [30, 36], [70, 36], [73, 40], [76, 44], [24, 44]], ['#6a4a2a', '#2a1a0a'], { line: 1.4, shine: false });
    shape(c, [[36, 36], [38, 14], [50, 8], [62, 14], [64, 36]], ['#7a5a34', '#32200e'], { smooth: true, line: 1.5, shine: '#c8a060', shineLines: [[40, 20, 50, 12, 60, 18]] });
    c.fillStyle = '#c8a060'; c.fillRect(37, 28, 26, 4);
    eyes(c, { y: 53, d: 10.4, w: 6.4, h: 4, iris: F ? '#ff3a2a' : '#5a3a1a', glow: F ? 'rgba(255,50,40,.8)' : null, lid: .36, tilt: -.7, white: F ? '#ffd8d0' : undefined });
    if (!F) { shape(c, [[52, 47], [68, 47], [68, 59], [52, 59]], '#101010', { smooth: true, line: 1.3, shine: false }); c.strokeStyle = '#101010'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(30, 40); c.lineTo(52, 50); c.stroke(); } else { add(c, () => glow(c, 61, 53, 12, 'rgba(255,50,40,1)')); circ(c, 61, 53, 4, '#ff3a2a'); circ(c, 61, 53, 1.6, '#fff'); }
    brows(c, { y: 45, tilt: -1.2, col: '#2a1a0a', len: 9, th: 2.2 }); mouth(c, 'grim', { y: 68, w: 6 }); nose(c, { y: 62 });
  };

  // ---- TITANIA ----
  FACE.titania = (c, F) => {
    bg(c, { top: F ? '#0e3a28' : '#12301c', bot: '#030a06', glow: F ? 'rgba(255,154,216,.45)' : 'rgba(180,255,200,.3)', rays: 'rgba(255,240,170,.08)', rayN: 12, stars: '#ffd8f0', starN: 22 });
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) shape(c, [[50 + s * 18, 66 - i * 6], [50 + s * 42, 30 - i * 18], [50 + s * (50 - i * 4), 52 - i * 12], [50 + s * 34, 72 - i * 4]], ['rgba(200,245,255,.85)', 'rgba(150,200,255,.5)'], { smooth: true, line: 1.1, shine: '#fff', shineLines: [[50 + s * 28, 56, 50 + s * 36, 40, 50 + s * 44, 34]] });
    hair(c, [[22, 56], [16, 30], [28, 12], [50, 6], [72, 12], [84, 30], [78, 56], [88, 90], [74, 100], [26, 100], [12, 90]], '#ffe0f8', { hi: '#ffffff', lo: '#d890c8', gloss: [[24, 30, 28, 62, 22, 92], [76, 30, 72, 62, 78, 92]] });
    shoulders(c, '#ff9ad8', { trim: '#ffe0f8' });
    shape(c, [[38, 76], [50, 88], [62, 76], [58, 100], [42, 100]], '#8ad08a', { line: 1.2 });
    const P = head(c, { skin: '#fbe6ec', w: 17.5, chin: 76, jaw: .7 });
    const fr = [[32, 46], [31, 32], [40, 22], [50, 18], [60, 22], [69, 32], [68, 46], [64, 36], [60, 44], [54, 30], [50, 42], [46, 30], [40, 44], [36, 36]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); }, 2.4, .16);
    eyes(c, { y: 52, d: 10, w: 6.8, h: 6, iris: F ? '#ffe0f8' : '#ff7ac0', glow: F ? 'rgba(255,154,216,.8)' : null, lid: .06, tilt: -.2, irisW: .64 });
    brows(c, { y: 43.5, tilt: .1, col: '#d890c8', len: 8, th: 1.4 }); mouth(c, 'smile', { y: 67, w: 4.5 });
    hair(c, fr, '#fff0fc', { hi: '#ffffff', lo: '#e0a0d4', gloss: [[38, 26, 50, 22, 62, 26]] });
    shape(c, [[34, 26], [38, 10], [43, 20], [50, 2], [57, 20], [62, 10], [66, 26], [56, 24], [44, 24]], ['#fff0a0', '#d8941c'], { line: 1.3, shine: false }); circ(c, 50, 18, 2.4, '#ff6ac0'); if (F) for (const [x, y] of [[26, 22], [74, 22], [20, 40], [80, 40]]) { for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; ell(c, x + Math.cos(a) * 3, y + Math.sin(a) * 3, 2.4, 1.6, '#ffc0e8', a); } circ(c, x, y, 1.4, '#ffd35a'); }
  };
  // ---- VULCAN ----
  FACE.vulcan = (c, F) => {
    bg(c, { top: F ? '#6a1a04' : '#2a0a04', bot: '#0a0200', glow: F ? 'rgba(255,200,80,.6)' : 'rgba(255,90,26,.4)', rays: 'rgba(255,160,60,.1)', rayN: 12, stars: '#ffb060', starN: 12 });
    const FL = F ? ['#fffbd0', '#ffb020'] : ['#ffc040', '#e83a08'];
    shape(c, [[22, 54], [14, 34], [8, 12], [24, 24], [26, 0], [38, 18], [46, -6], [54, 16], [64, -4], [68, 20], [80, 2], [78, 26], [92, 18], [86, 40], [78, 54]], FL, { line: 1.4, shine: '#fff0a0', shineLines: [[34, 22, 44, 8, 50, 2]] });
    shoulders(c, '#2a1c1c', { trim: '#ff5a1a' });
    for (const s of [-1, 1]) shape(c, [[50 + s * 18, 86], [50 + s * 28, 68], [50 + s * 48, 62], [50 + s * 50, 88], [50 + s * 38, 100]], ['#3a2a2a', '#120a0a'], { line: 1.7, shine: false });
    add(c, () => { c.strokeStyle = F ? 'rgba(255,230,140,.95)' : 'rgba(255,100,30,.9)'; c.lineWidth = F ? 2.4 : 1.6; for (const p of [[30, 82, 36, 90, 32, 100], [70, 82, 64, 92, 68, 100], [50, 80, 52, 90, 48, 100]]) { c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[2], p[3]); c.lineTo(p[4], p[5]); c.stroke(); } });
    const P = head(c, { skin: F ? '#5a3a30' : '#3a2a2a', w: 21, chin: 77, jaw: .25, top: 26, blush: false, ears: false });
    c.save(); c.clip(P); add(c, () => { c.strokeStyle = F ? 'rgba(255,240,160,1)' : 'rgba(255,100,30,1)'; c.lineWidth = F ? 2.2 : 1.5; for (const p of [[34, 34, 38, 44, 33, 54], [66, 34, 62, 46, 67, 58], [50, 28, 52, 38, 48, 42], [38, 64, 44, 68, 40, 76], [62, 64, 58, 70, 62, 76]]) { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.stroke(); } }); c.restore();
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 11, 50, F ? 15 : 11, F ? 'rgba(255,240,160,1)' : 'rgba(255,140,30,1)')); shape(c, [[50 + s * 5, 50], [50 + s * 18, 47], [50 + s * 17, 53], [50 + s * 7, 54]], F ? '#ffffff' : '#ffd070', { line: 0, shine: false }); }
    brows(c, { y: 43, tilt: -2.4, col: '#0a0404', len: 10, th: 3, d: 11 });
    shape(c, [[36, 66], [64, 66], [62, 76], [38, 76]], '#1a0604', { line: 1.3, shine: false }); c.fillStyle = F ? '#fffbd0' : '#ffb060'; for (let x = 39; x < 61; x += 4.4) c.fillRect(x, 67, 2.8, 6);
    nose(c, { y: 60, col: 'rgba(0,0,0,.6)' });
  };
  // ---- SPECTRE ----
  FACE.spectre = (c, F) => {
    bg(c, { top: F ? '#0a0e2a' : '#10163a', bot: '#02030a', glow: 'rgba(170,192,255,.38)', rings: 'rgba(170,192,255,.1)', stars: '#c8d4ff', starN: 16 });
    add(c, () => { for (let i = 0; i < 8; i++) { c.fillStyle = `rgba(170,192,255,${.08 + (i % 3) * .04})`; c.beginPath(); c.ellipse(20 + i * 10, 80 + (i % 3) * 8, 26, 8, 0, 0, 7); c.fill(); } });
    shoulders(c, 'rgba(110,126,170,.85)', { trim: '#aac0ff' });
    c.globalAlpha = .88;
    const P = head(c, { skin: F ? '#aab8e8' : '#c8d8f0', w: 18.5, chin: 77, jaw: .6, blush: false });
    c.save(); c.clip(P); const tg = c.createLinearGradient(0, 40, 0, 90); tg.addColorStop(0, 'rgba(255,255,255,0)'); tg.addColorStop(1, 'rgba(10,14,40,.7)'); c.fillStyle = tg; c.fillRect(20, 40, 60, 50); c.restore();
    hair(c, [[31, 46], [30, 32], [38, 24], [50, 20], [62, 24], [70, 32], [69, 46], [64, 38], [50, 34], [36, 38]], '#8a9aba', { hi: '#c8d4ee', lo: '#4a5a7a', noStrands: true, shine: false });
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 10, 53, F ? 15 : 10, 'rgba(170,192,255,1)')); shape(c, [[50 + s * 4, 53], [50 + s * 15, 50], [50 + s * 14, 57], [50 + s * 6, 58]], '#ffffff', { line: 0, shine: false }); }
    if (F) { c.save(); c.clip(P); c.fillStyle = 'rgba(2,3,10,.55)'; c.beginPath(); c.moveTo(50, 60); c.lineTo(47, 68); c.lineTo(53, 68); c.fill(); for (let x = 40; x < 61; x += 4) c.fillRect(x, 72, 2.4, 6); c.restore(); } else { brows(c, { y: 44, tilt: -.8, col: '#4a5a7a', len: 8, th: 1.6 }); mouth(c, 'smirk', { y: 68, w: 5 }); nose(c); }
    c.globalAlpha = 1;
    shape(c, [[12, 36], [24, 32], [76, 32], [88, 36], [70, 38], [30, 38]], ['#6a7aa0', '#2a3858'], { line: 1.5, shine: false });
    shape(c, [[32, 34], [34, 12], [50, 6], [66, 12], [68, 34]], ['#7a8ab0', '#2a3858'], { smooth: true, line: 1.5, shine: '#c8d4ff', shineLines: [[38, 18, 50, 10, 62, 16]] });
    c.fillStyle = '#aac0ff'; c.fillRect(33, 26, 34, 4);
  };
  // ---- NOVA ----
  FACE.nova = (c, F) => {
    bg(c, { top: F ? '#3a0a3a' : '#1e0a2e', bot: '#06020c', glow: 'rgba(255,90,200,.45)', stars: '#ffe0f8', starN: 20 });
    add(c, () => { for (const [x, col] of [[18, 'rgba(255,90,200,.2)'], [50, 'rgba(255,224,90,.18)'], [82, 'rgba(90,234,255,.2)']]) { c.fillStyle = col; c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 22, 100); c.lineTo(x + 22, 100); c.fill(); } });
    for (const s of [-1, 1]) shape(c, [[50 + s * 20, 24], [50 + s * 40, 30], [50 + s * 48, 64], [50 + s * 42, 94], [50 + s * 30, 66], [50 + s * 22, 42]], ['#ffe05a', '#d89a1c'], { smooth: true, line: 1.4, shine: '#fff8c0', shineLines: [[50 + s * 36, 40, 50 + s * 42, 62, 50 + s * 38, 84]] });
    shoulders(c, '#ff5ac8', { trim: '#ffffff' });
    shape(c, [[38, 76], [50, 86], [62, 76], [58, 100], [42, 100]], '#fff', { line: 1.1 }); star(c, 50, 92, 4, '#ff5ac8');
    const P = head(c, { skin: '#f6d6c2', w: 18.5, chin: 76, jaw: .6 });
    hair(c, [[31, 46], [30, 32], [38, 22], [50, 17], [62, 22], [70, 32], [69, 46], [65, 36], [60, 44], [54, 30], [50, 42], [46, 30], [40, 44], [35, 36]], '#ffe870', { hi: '#fffbc0', lo: '#d89a1c', gloss: [[38, 26, 50, 22, 62, 26]] });
    eyes(c, { y: 52, d: 10.2, w: 7, h: 6.2, iris: F ? '#ff5ac8' : '#5aeaff', glow: F ? 'rgba(255,90,200,.7)' : null, lid: 0, irisW: .66 });
    star(c, 63, 60, 3, '#5aeaff'); star(c, 37, 60, 2.4, '#ff5ac8');
    brows(c, { y: 43.5, tilt: .2, col: '#c8901c', len: 8, th: 1.5 }); mouth(c, 'open', { y: 66, w: 5.6 }); c.fillStyle = 'rgba(255,110,150,.4)'; c.fillRect(30, 61, 7, 4); c.fillRect(63, 61, 7, 4);
    if (F) { shape(c, [[34, 24], [38, 10], [43, 20], [50, 4], [57, 20], [62, 10], [66, 24], [56, 22], [44, 22]], ['#ffffff', '#ff9ae0'], { line: 1.3, shine: false }); circ(c, 50, 16, 2.4, '#ff5ac8'); } else { shape(c, [[24, 36], [30, 28], [34, 36]], '#ff5ac8', { line: 1.1, shine: false }); shape(c, [[66, 36], [70, 28], [76, 36]], '#ff5ac8', { line: 1.1, shine: false }); }
    c.fillStyle = '#222'; c.fillRect(82, 74, 5, 28); ell(c, 84.5, 70, 6, 7, '#8a8a92'); c.strokeStyle = OL; c.lineWidth = 1.2; c.beginPath(); c.ellipse(84.5, 70, 6, 7, 0, 0, 7); c.stroke();
  };
  // ---- IRON JAW ----
  FACE.ironjaw = (c, F) => {
    bg(c, { top: F ? '#4a2208' : '#3a0c0c', bot: '#0a0202', glow: F ? 'rgba(255,211,90,.5)' : 'rgba(255,60,60,.35)', rays: F ? 'rgba(255,220,120,.14)' : 'rgba(255,120,100,.08)', rayN: 14, stars: '#ffd890', starN: 8 });
    // gloves up
    for (const s of [-1, 1]) { shape(c, [[50 + s * 30, 94], [50 + s * 28, 66], [50 + s * 36, 54], [50 + s * 48, 62], [50 + s * 50, 92]], ['#e83a3a', '#8a1010'], { smooth: true, line: 1.8, shine: '#ff9a8a', shineLines: [[50 + s * 36, 62, 50 + s * 42, 68, 50 + s * 44, 80]] }); c.fillStyle = '#fff'; c.fillRect(50 + s * 31 - 3, 84, 12, 4); }
    shoulders(c, '#8a5a3a', { trim: F ? '#ffd35a' : '#ffffff' });
    if (F) { shape(c, [[24, 90], [76, 90], [78, 100], [22, 100]], ['#ffe27a', '#b88a1c'], { line: 1.5, shine: false }); circ(c, 50, 95, 5, '#ff3a3a'); c.strokeStyle = OL; c.lineWidth = 1; c.stroke(); }
    const P = head(c, { skin: '#8a5a3a', w: 21, chin: 78, jaw: .2, top: 26, blush: false });
    hair(c, [[30, 40], [31, 30], [40, 25], [50, 23], [60, 25], [69, 30], [70, 40], [64, 34], [50, 32], [36, 34]], '#141414', { hi: '#3a3a3a', lo: '#040404', noStrands: true, shine: false });
    c.save(); c.clip(P); ell(c, 36, 54, 6, 5, 'rgba(60,20,40,.4)'); c.restore();
    eyes(c, { y: 52, d: 11, w: 6.4, h: 4.4, iris: '#3a2a1a', lid: .32, tilt: -1, white: '#f0e6dc' });
    brows(c, { y: 44, tilt: -1.8, col: '#0a0a0a', len: 9.5, th: 2.6, d: 11 });
    c.strokeStyle = '#4a2418'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(60, 42); c.lineTo(63, 52); c.stroke();
    mouth(c, 'grin', { y: 68, w: 8.5 }); c.fillStyle = '#e83a3a'; c.fillRect(42, 66.5, 16, 3.4); nose(c, { y: 61 });
  };
  // ---- VIPER ----
  FACE.viper = (c, F) => {
    bg(c, { top: F ? '#0c3a08' : '#082a06', bot: '#020802', glow: 'rgba(122,255,58,.4)', rays: 'rgba(160,255,90,.08)', rayN: 10, stars: '#b0ff7a', starN: 10 });
    if (F) for (let i = 0; i < 5; i++) { const a = -2.7 + i * .45; c.strokeStyle = '#2a7a1a'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(50, 70); c.quadraticCurveTo(50 + Math.cos(a) * 30, 50 + Math.sin(a) * 34, 50 + Math.cos(a + .2) * 46, 44 + Math.sin(a + .2) * 52); c.stroke(); circ(c, 50 + Math.cos(a + .2) * 46, 44 + Math.sin(a + .2) * 52, 6, '#4aba2a'); circ(c, 50 + Math.cos(a + .2) * 46 + 1.5, 44 + Math.sin(a + .2) * 52 - 1, 1.4, '#ff2a2a'); }
    shape(c, [[66, 28], [90, 36], [94, 78], [84, 92], [78, 62], [70, 42]], ['#3a8a1a', '#0e300a'], { smooth: true, line: 1.4, shine: '#9aff6a', shineLines: [[78, 40, 88, 56, 86, 74]] });
    shoulders(c, '#1a3a1a', { trim: '#7aff3a' });
    shape(c, [[32, 76], [50, 88], [68, 76], [72, 90], [50, 100], [28, 90]], '#2a5a1a', { line: 1.3 });
    const P = head(c, { skin: '#bcdcac', w: 18, chin: 77, jaw: .8, blush: false });
    c.save(); c.clip(P); c.fillStyle = 'rgba(40,100,30,.35)'; for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) { c.beginPath(); c.arc(34 + i * 4.8 + (j % 2) * 2.4, 60 + j * 5, 2.4, 0, Math.PI, true); c.fill(); } c.restore();
    const fr = [[31, 46], [30, 32], [38, 22], [50, 18], [62, 22], [70, 32], [69, 46], [64, 36], [60, 42], [54, 28], [50, 40], [46, 28], [40, 42], [36, 34]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); });
    eyes(c, { y: 52, d: 10, w: 6.8, h: 4.6, iris: F ? '#ffe03a' : '#d8f020', glow: F ? 'rgba(200,255,60,.8)' : 'rgba(122,255,58,.4)', lid: .3, tilt: -.7, slit: true, white: '#f4ffe0' });
    brows(c, { y: 44, tilt: -1.2, col: '#103a0a', len: 8, th: 1.8 });
    shape(c, [[30, 60], [70, 60], [66, 74], [50, 80], [34, 74]], ['#2a5a1a', '#0e260a'], { smooth: true, line: 1.4, shine: false }); c.strokeStyle = '#7aff3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(36, 66); c.lineTo(64, 66); c.stroke();
    hair(c, fr, '#2a5a1a', { hi: '#7ada4a', lo: '#0a260a', gloss: [[38, 26, 50, 22, 62, 26]] });
    for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(50 + s * 3, 62); c.lineTo(50 + s * 4, 70); c.lineTo(50 + s * 1, 63); c.fill(); }
  };

  // ---- KARMA ----
  FACE.karma = (c, F) => {
    bg(c, { top: F ? '#4a2a10' : '#2a1a0c', bot: '#0a0604', glow: F ? 'rgba(255,200,130,.6)' : 'rgba(255,160,90,.32)', rays: F ? 'rgba(255,224,170,.16)' : 'rgba(255,200,140,.07)', rayN: 14, stars: '#ffe0b0', starN: 10 });
    add(c, () => { c.strokeStyle = F ? 'rgba(255,230,170,.9)' : 'rgba(255,190,120,.5)'; c.lineWidth = F ? 3 : 2; c.beginPath(); c.arc(50, 40, F ? 34 : 30, 0, 7); c.stroke(); if (F) { c.lineWidth = 1.5; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(50, 40); c.lineTo(50 + Math.cos(i * .785) * 34, 40 + Math.sin(i * .785) * 34); c.stroke(); } } });
    shoulders(c, '#ff8a3a', { trim: '#ffe0b0' });
    shape(c, [[30, 78], [50, 96], [70, 78], [78, 100], [22, 100]], '#c8601a', { line: 1.3 });
    for (let i = 0; i < 9; i++) circ(c, 28 + i * 5.5, 82 + Math.sin(i / 8 * 3.14) * 12, 2.6, '#6a3a1a');
    const P = head(c, { skin: '#c89a70', w: 18.5, chin: 76, jaw: .5 });
    c.save(); c.clip(P); const hg = c.createLinearGradient(0, 22, 0, 36); hg.addColorStop(0, 'rgba(255,255,255,.3)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = hg; c.fillRect(20, 20, 60, 16); c.restore();
    circ(c, 50, 36, F ? 3 : 2.2, F ? '#ffe9a8' : '#c03030'); if (F) add(c, () => glow(c, 50, 36, 9, 'rgba(255,230,160,.9)'));
    if (F) { eyes(c, { y: 52, d: 10, w: 6.6, h: 4.4, iris: '#ffe0a8', glow: 'rgba(255,210,140,.8)', lid: .3, pupil: false }); }
    else { shut(c, 39.5, 52, 6.4); shut(c, 60.5, 52, 6.4); }
    brows(c, { y: 44, tilt: 0, col: '#4a3018', len: 8, th: 1.4 }); mouth(c, 'smile', { y: 67, w: 4 }); nose(c);
  };
  // ---- DUNE ----
  FACE.dune = (c, F) => {
    bg(c, { top: F ? '#6a3a0c' : '#4a2a0c', bot: '#140a02', glow: F ? 'rgba(255,224,140,.6)' : 'rgba(255,210,120,.35)', rays: 'rgba(255,224,160,.12)', rayN: 14, stars: '#ffe9b0', starN: 8 });
    add(c, () => { c.fillStyle = 'rgba(255,230,160,.65)'; c.beginPath(); c.arc(80, 20, 13, 0, 7); c.fill(); });
    // nemes headdress
    shape(c, [[24, 30], [32, 12], [50, 6], [68, 12], [76, 30], [86, 84], [72, 98], [62, 70], [38, 70], [28, 98], [14, 84]], F ? ['#ffe27a', '#b8841c'] : ['#4a6ae8', '#1a2a8a'], { smooth: true, line: 1.6, shine: '#fff0a0', shineLines: [[30, 28, 24, 56, 20, 84], [70, 28, 76, 56, 80, 84]] });
    for (let i = 0; i < 6; i++) { c.strokeStyle = F ? '#4a3208' : '#ffd35a'; c.lineWidth = 2; c.beginPath(); c.moveTo(18 + (i % 2) * 2, 40 + i * 9); c.lineTo(30, 40 + i * 9); c.moveTo(82 - (i % 2) * 2, 40 + i * 9); c.lineTo(70, 40 + i * 9); c.stroke(); }
    shoulders(c, '#f0e0b0', { trim: '#ffd35a' });
    shape(c, [[26, 80], [50, 94], [74, 80], [70, 90], [50, 100], [30, 90]], ['#ffe27a', '#b8841c'], { line: 1.4, shine: '#fff', shineLines: [[34, 84, 50, 92, 66, 84]] });
    const P = head(c, { skin: '#b08050', w: 17.5, chin: 76, jaw: .6 });
    for (const s of [-1, 1]) { c.strokeStyle = '#08080c'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(50 + s * 3, 53); c.lineTo(50 + s * 19, 50); c.lineTo(50 + s * 24, 56); c.stroke(); }
    eyes(c, { y: 52, d: 10, w: 6.6, h: 4.6, iris: F ? '#ffe9a0' : '#3a6ad8', glow: F ? 'rgba(255,230,140,.9)' : null, lid: .22, tilt: -.5, white: '#fff6e0' });
    brows(c, { y: 43.5, tilt: -.6, col: '#08080c', len: 8.5, th: 2 }); mouth(c, 'smirk', { y: 67, w: 5 }); nose(c);
    shape(c, [[34, 26], [38, 16], [50, 10], [62, 16], [66, 26], [56, 24], [44, 24]], ['#ffe27a', '#b8841c'], { line: 1.3, shine: false }); shape(c, [[46, 12], [50, 2], [54, 12]], '#3a6ad8', { line: 1.1, shine: false });
    if (F) { shape(c, [[44, 10], [50, -4], [56, 10]], '#ffe27a', { line: 1.1, shine: false }); }
  };
  // ---- BLITZ ----
  FACE.blitz = (c, F) => {
    bg(c, { top: F ? '#4a2a0c' : '#2a3a1a', bot: '#080a04', glow: F ? 'rgba(255,140,50,.5)' : 'rgba(255,170,80,.3)', streak: 'rgba(255,200,120,.16)', stars: '#ffd890', starN: 8 });
    for (const [x, y, r] of F ? [[12, 22, 8], [86, 30, 10], [78, 68, 7]] : [[84, 24, 6]]) { add(c, () => { c.fillStyle = 'rgba(255,140,50,.7)'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); glow(c, x, y, r * 2.4, 'rgba(255,200,100,.5)'); }); }
    shape(c, [[64, 30], [92, 40], [96, 84], [84, 96], [78, 64], [70, 44]], ['#ff7a2a', '#a8300a'], { smooth: true, line: 1.4, shine: '#ffc890', shineLines: [[78, 42, 88, 58, 86, 76]] });
    shoulders(c, '#4a5a3a', { trim: '#ffd35a' });
    for (const s of [-1, 1]) { c.strokeStyle = '#2a2a20'; c.lineWidth = 3; c.beginPath(); c.moveTo(50 + s * 14, 76); c.lineTo(50 + s * 24, 96); c.stroke(); }
    shape(c, [[36, 76], [50, 88], [64, 76], [58, 100], [42, 100]], '#2a3a1a', { line: 1.2 });
    const P = head(c, { skin: '#d0a080', w: 19, chin: 76, jaw: .55 });
    hair(c, [[30, 46], [30, 32], [38, 22], [50, 18], [62, 22], [70, 32], [70, 46], [64, 36], [50, 32], [36, 36]], '#ff6a1a', { hi: '#ffb070', lo: '#a83a08', noStrands: true, shine: false });
    shape(c, [[27, 38], [73, 38], [73, 28], [64, 18], [50, 15], [36, 18], [27, 28]], ['#4a5a3a', '#1a2410'], { line: 1.5, shine: false }); shape(c, [[27, 34], [73, 34], [73, 40], [27, 40]], '#ffd35a', { line: 1.2, shine: false });
    if (F) { shape(c, [[28, 42], [48, 42], [47, 56], [29, 56]], ['#2a2a30', '#080808'], { smooth: true, line: 1.3, shine: false }); shape(c, [[52, 42], [72, 42], [71, 56], [53, 56]], ['#2a2a30', '#080808'], { smooth: true, line: 1.3, shine: false }); add(c, () => { glow(c, 38, 49, 12, 'rgba(255,140,50,.9)'); glow(c, 62, 49, 12, 'rgba(255,140,50,.9)'); }); c.fillStyle = '#ffb060'; c.fillRect(32, 46, 10, 3); c.fillRect(58, 46, 10, 3); }
    else { shape(c, [[28, 44], [72, 44], [70, 56], [30, 56]], ['#1c1c1c', '#050505'], { line: 1.5, shine: false }); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(34, 46, 10, 2); c.fillRect(56, 46, 10, 2); }
    mouth(c, 'grin', { y: 67, w: 8.5 }); nose(c);
  };
  // ---- MORPH ----
  FACE.morph = (c, F) => {
    bg(c, { top: F ? '#1c2230' : '#12161e', bot: '#030406', glow: 'rgba(216,220,232,.35)', pillars: '#0a0c10', stars: '#d8dce8', starN: 10 });
    c.save(); c.globalAlpha = .45; for (const [x, y, s] of F ? [[16, 40, .5], [84, 40, .5], [16, 72, .4], [84, 72, .4]] : [[16, 56, .4], [84, 56, .4]]) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#9aa0b0'; c.beginPath(); c.ellipse(0, 0, 20, 26, 0, 0, 7); c.fill(); c.fillStyle = '#10141c'; c.fillRect(-9, -6, 6, 3); c.fillRect(3, -6, 6, 3); c.fillRect(-5, 10, 10, 2); c.restore(); } c.restore();
    shoulders(c, '#8a8e98', { trim: '#e8ecf4' });
    const mg = (x, y, w, h) => { const g = c.createLinearGradient(x - w, y - h, x + w, y + h); g.addColorStop(0, '#ffffff'); g.addColorStop(.3, '#a8aeba'); g.addColorStop(.55, '#e8ecf4'); g.addColorStop(.8, '#6a707c'); g.addColorStop(1, '#c8ccd8'); return g; };
    const P = head(c, { skin: '#c0c4cc', w: 19.5, chin: 77, jaw: .5, blush: false });
    c.save(); c.clip(P); c.fillStyle = mg(50, 50, 22, 28); c.fillRect(20, 20, 60, 60); c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(40, 36, 6, 10, -.4, 0, 7); c.fill(); c.fillStyle = 'rgba(30,34,44,.7)'; c.beginPath(); c.ellipse(64, 62, 8, 12, .3, 0, 7); c.fill();
    c.fillStyle = 'rgba(14,18,28,.85)'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(50 + s * 10, 52, 7, 4.4, s * .2, 0, 7); c.fill(); } c.strokeStyle = 'rgba(14,18,28,.8)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(43, 68); c.quadraticCurveTo(50, 71, 57, 68); c.stroke(); c.beginPath(); c.moveTo(49, 57); c.lineTo(50, 63); c.stroke();
    if (F) { c.strokeStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(50, 50, 8 + i * 6, 14 + i * 7, 0, 0, 7); c.stroke(); } }
    c.restore();
    add(c, () => { for (const s of [-1, 1]) glow(c, 50 + s * 10, 52, F ? 10 : 6, 'rgba(255,255,255,.9)'); });
  };
  // ---- KINGPIN ----
  FACE.kingpin = (c, F) => {
    bg(c, { top: F ? '#2a2a0a' : '#0e1a0e', bot: '#040604', glow: F ? 'rgba(255,211,90,.45)' : 'rgba(90,186,90,.3)', streak: F ? 'rgba(255,211,90,.12)' : 'rgba(90,186,90,.1)', stars: '#c8ffc8', starN: 6 });
    shoulders(c, F ? '#d8a82a' : '#2a2a2a', { trim: F ? '#fff0a0' : '#5aba5a' });
    shape(c, [[34, 76], [50, 94], [66, 76], [74, 100], [26, 100]], '#f4f4f0', { line: 1.3 }); shape(c, [[46, 82], [54, 82], [52, 100], [48, 100]], F ? '#ffd35a' : '#5aba5a', { line: 1.1, shine: false });
    const P = head(c, { skin: '#e0b890', w: 23, chin: 78, jaw: .2, top: 28, blush: false });
    c.save(); c.clip(P); const sg = c.createLinearGradient(0, 62, 0, 82); sg.addColorStop(0, 'rgba(40,24,16,0)'); sg.addColorStop(1, 'rgba(40,24,16,.4)'); c.fillStyle = sg; c.fillRect(20, 62, 60, 20); c.restore();
    shape(c, [[26, 36], [74, 36], [76, 44], [24, 44]], F ? ['#ffe27a', '#b8841c'] : ['#2a2a2a', '#0a0a0a'], { line: 1.5, shine: false });
    shape(c, [[34, 38], [34, 8], [66, 8], [66, 38]], F ? ['#ffe27a', '#b8841c'] : ['#2a2a2a', '#0a0a0a'], { line: 1.6, shine: F ? '#fff' : '#8a8a8a', shineLines: [[38, 14, 38, 28, 39, 36]] });
    shape(c, [[34, 28], [66, 28], [66, 34], [34, 34]], '#5aba5a', { line: 1.2, shine: false });
    hair(c, [[28, 48], [28, 44], [34, 42], [30, 54]], '#1a1a1a', { shine: false }); hair(c, [[72, 48], [72, 44], [66, 42], [70, 54]], '#1a1a1a', { shine: false });
    eyes(c, { y: 52, d: 11, w: 6.4, h: 4.2, iris: '#3a2a1a', lid: .34, tilt: -.6, white: '#f0e6dc' });
    brows(c, { y: 45, tilt: -1.4, col: '#1a1a1a', len: 9.5, th: 2.6, d: 11 });
    mouth(c, 'frown', { y: 68, w: 6 }); nose(c, { y: 61 });
    shape(c, [[56, 66], [82, 62], [82, 66], [56, 70]], '#8a5a2a', { line: 1.2, shine: false }); add(c, () => glow(c, 82, 64, 7, 'rgba(255,120,40,.9)')); circ(c, 82, 64, 2, '#ff6a1a');
    if (F) circ(c, 56, 70, 1.4, '#ffd35a');
  };
  // ---- QUANTA ----
  FACE.quanta = (c, F) => {
    bg(c, { top: F ? '#04143a' : '#061a3a', bot: '#020610', glow: F ? 'rgba(255,154,255,.4)' : 'rgba(106,216,255,.4)', rings: 'rgba(106,216,255,.16)', stars: '#9ae0ff', starN: 20 });
    if (F) { c.save(); c.globalAlpha = .45; c.translate(9, 0); c.fillStyle = '#ff9aff'; c.beginPath(); c.ellipse(50, 50, 24, 32, 0, 0, 7); c.fill(); c.restore(); }
    add(c, () => { c.strokeStyle = 'rgba(106,216,255,.6)'; c.lineWidth = 1.4; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(82, 24, 12, 4.4, i * 1.047, 0, 7); c.stroke(); } circ(c, 82, 24, 2, '#ffffff'); });
    hair(c, [[24, 56], [20, 34], [30, 16], [50, 10], [70, 16], [80, 34], [76, 56], [80, 76], [70, 66], [66, 50], [34, 50], [30, 66], [20, 76]], '#4a3322', { hi: '#8a6a4a', lo: '#1a1008', gloss: [[26, 32, 32, 20, 48, 14]] });
    shoulders(c, '#f0f4ff', { trim: '#6ad8ff' });
    shape(c, [[36, 78], [50, 90], [64, 78], [60, 100], [40, 100]], '#2a3a5a', { line: 1.2 }); circ(c, 50, 92, 3, '#6ad8ff');
    const P = head(c, { skin: '#e0c0a8', w: 18, chin: 76, jaw: .6 });
    const fr = [[31, 46], [31, 32], [40, 22], [50, 18], [60, 22], [69, 32], [69, 46], [64, 36], [60, 44], [54, 30], [50, 42], [46, 30], [40, 44], [36, 36]];
    under(c, P, () => { path(c, fr); c.fillStyle = '#000'; c.fill(); }, 2.4, .2);
    eyes(c, { y: 52, d: 10, w: 6.4, h: 5.2, iris: '#5a3a2a', lid: .1 });
    for (const s of [-1, 1]) { add(c, () => glow(c, 50 + s * 10, 52, F ? 13 : 9, 'rgba(106,216,255,.6)')); c.fillStyle = 'rgba(106,216,255,.28)'; c.beginPath(); c.ellipse(50 + s * 10, 52, 10, 8.4, 0, 0, 7); c.fill(); c.strokeStyle = '#2a3a5a'; c.lineWidth = 1.8; c.stroke(); } c.beginPath(); c.moveTo(41, 51); c.lineTo(59, 51); c.stroke();
    brows(c, { y: 43.5, tilt: .3, col: '#2a1a0a', len: 8, th: 1.5 }); mouth(c, 'smile', { y: 67, w: 5 }); nose(c);
    hair(c, fr, '#5a4332', { hi: '#9a7a5a', lo: '#1a1008', gloss: [[38, 26, 50, 22, 62, 26]] });
  };
})();

(() => {
  for (const id of ['vex', 'volt', 'glacia', 'nyx', 'gear', 'titan', 'terra', 'echo', 'mira', 'onyx', 'pixel', 'kage', 'arachna', 'hex', 'maximus', 'rex', 'helios', 'luna', 'cipher', 'fang', 'hoshi', 'mortis', 'chrome', 'titania', 'vulcan', 'spectre', 'nova', 'ironjaw', 'viper', 'karma', 'dune', 'blitz', 'morph', 'kingpin', 'quanta']) {
    const d = charById(id); if (!d || !FACE[id]) continue;
    const prev = d.drawPortrait;
    const px = PxKit.portrait(id + '_face', (c, o, def) => FACE[id](c, !!o.form, def || d), { res: 100, levels: 14, dither: .14, outline: true });
    d.drawPortrait = (c, opts, def) => PxKit.on() ? px(c, opts || {}, def || d) : (prev ? prev(c, opts, def) : null);
  }
})();
