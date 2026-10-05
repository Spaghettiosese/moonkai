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
})();

(() => {
  for (const id of ['vex', 'volt', 'glacia', 'nyx', 'gear', 'titan', 'terra', 'echo', 'mira', 'onyx', 'pixel', 'kage', 'arachna', 'hex', 'maximus', 'rex', 'helios']) {
    const d = charById(id); if (!d || !FACE[id]) continue;
    const prev = d.drawPortrait;
    const px = PxKit.portrait(id + '_face', (c, o, def) => FACE[id](c, !!o.form, def || d), { res: 100, levels: 14, dither: .14, outline: true });
    d.drawPortrait = (c, opts, def) => PxKit.on() ? px(c, opts || {}, def || d) : (prev ? prev(c, opts, def) : null);
  }
})();
