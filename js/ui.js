// ============================================================
//  MOONKAI — UI framework + menu screens
// ============================================================
const NAV = {
  up: ['KeyW', 'ArrowUp', 'Pad0Up', 'Pad1Up'], down: ['KeyS', 'ArrowDown', 'Pad0Down', 'Pad1Down'],
  left: ['KeyA', 'ArrowLeft', 'Pad0Left', 'Pad1Left'], right: ['KeyD', 'ArrowRight', 'Pad0Right', 'Pad1Right'],
  ok: ['Enter', 'Space', 'KeyJ', 'Pad0A', 'Pad1A'], back: ['Escape', 'Backspace', 'KeyK', 'Pad0B', 'Pad1B'],
};
const nav = k => tapped(...NAV[k]);
const UI = {
  stack: [],
  push(s) { this.stack.push(s); s.enter && s.enter(); },
  pop() { const s = this.stack.pop(); s && s.exit && s.exit(); const t = this.top(); t && t.resume && t.resume(); },
  replace(s) { const o = this.stack.pop(); o && o.exit && o.exit(); this.push(s); },
  reset(s) { this.stack = []; this.push(s); },
  top() { return this.stack[this.stack.length - 1]; },
  tap(x, y, mouse) { const t = this.top(); if (Game.cutscene) { Input.pressed.add('Enter'); return; } if (t && t.tap) t.tap(x, y, mouse); else Input.pressed.add('Enter'); },
  hover(x, y) { const t = this.top(); if (!Game.cutscene && t && t.hover) t.hover(x, y); },
};

// ---------- shared visuals ----------
function drawBackdrop(c, st, t, dim = 0.5) {
  const save = { x: Cam.x, y: Cam.y, z: Cam.z, sx: Cam.sx, sy: Cam.sy };
  Cam.z = 0.8; Cam.x = st.width / 2 + Math.sin(t * 0.07) * 700; Cam.y = -(H / 2 - 88) / Cam.z; Cam.sx = Cam.sy = 0;
  c.save(); st.sky(c, t, Arena); c.restore();
  for (const L of st.layers) { c.save(); Cam.layer(c, L.p, L.lift || 0); const [x0, x1] = Cam.viewX(L.p); L.draw(c, x0, x1, t, Arena); c.restore(); }
  c.save(); Cam.apply(c); const [a, b] = Cam.viewX(1); st.ground(c, a, b, t, Arena); c.restore();
  Object.assign(Cam, save);
  if (dim) { c.fillStyle = `rgba(4,3,12,${dim})`; c.fillRect(0, 0, W, H); }
}
function panel(c, x, y, w, h, col = 'rgba(8,6,20,0.78)', border) { c.fillStyle = col; roundRect(c, x, y, w, h, 10); c.fill(); if (border) { c.strokeStyle = border; c.lineWidth = 2; c.stroke(); } }
function wrapText(c, text, x, y, maxW, lh, size = 14, color = '#dde', font) {
  c.font = font || `${size}px "Segoe UI", Roboto, Arial, sans-serif`; c.fillStyle = color; c.textAlign = 'left'; c.textBaseline = 'middle';
  let line = '', yy = y;
  for (const w of String(text).split(' ')) { if (c.measureText(line + w).width > maxW && line) { c.fillText(line, x, yy); yy += lh; line = ''; } line += w + ' '; }
  c.fillText(line, x, yy); return yy + lh;
}
function drawModel(c, def, x, y, s, facing, pose, t, form, alt) { drawCharAt(c, def, x, y, s * (def.scale || 1) * (form && def.form.scale && !def.form.timed ? Math.min(def.form.scale, 1.4) : 1), facing, { pose, anim: t, transformed: form, alt }); }
function logo(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  City.drawMoon(c, Game.t, 1, 0, -10, 70);
  bigText(c, 'MOONKAI', 0, 0, 120, '#ffd35a', '#2a1200');
  bigText(c, 'HEROES  ·  VILLAINS  ·  COLLATERAL DAMAGE', 0, 70, 22, '#fff', '#000');
  c.restore();
}

// ---------- generic list menu ----------
class MenuScreen {
  constructor(title, items, opts = {}) { this.title = title; this.items = items; this.i = 0; this.opts = opts; this.showcase = pick(ROSTER); this.showT = 0; }
  enter() { Music.play(this.opts.music || 'menu'); }
  resume() { Music.play(this.opts.music || 'menu'); }
  update(dt) {
    this.showT += dt; if (this.showT > 5) { this.showT = 0; this.showcase = pick(ROSTER); }
    const n = this.items.length;
    if (nav('up')) { this.i = (this.i + n - 1) % n; Sfx.select(); }
    if (nav('down')) { this.i = (this.i + 1) % n; Sfx.select(); }
    const it = this.items[this.i];
    if (nav('left') && it.left) { it.left(); Sfx.select(); }
    if (nav('right') && it.right) { it.right(); Sfx.select(); }
    if (nav('ok') && it.act) { Sfx.confirm(); it.act(); }
    else if (nav('back')) { Sfx.select(); if (this.opts.onBack) this.opts.onBack(); else UI.pop(); }
  }
  rect(i) { const y0 = this.opts.y0 || 150, h = this.items.length > 9 ? 44 : 52; return { x: 70, y: y0 + i * (h + 6), w: 470, h }; }
  hover(x, y) { this.items.forEach((it, i) => { const r = this.rect(i); if (x > r.x - 16 && x < r.x + r.w && y > r.y && y < r.y + r.h) this.i = i; }); }
  tap(x, y, mouse) { this.items.forEach((it, i) => { const r = this.rect(i); if (x > r.x - 16 && x < r.x + r.w && y > r.y && y < r.y + r.h) { if ((mouse || this.i === i) && it.act) { this.i = i; Sfx.confirm(); it.act(); } else this.i = i; } }); }
  draw(c) {
    drawBackdrop(c, STAGES[Math.floor(Game.t / 12) % STAGES.length], Game.t, 0.55);
    // showcase fighter
    const d = this.showcase, k = ease.out(Math.min(1, this.showT * 2));
    c.globalAlpha = k;
    c.drawImage(portrait(d, 160, { expr: 'grin' }), W - 260, 90, 200, 200);
    drawModel(c, d, W - 330, 650, 2.8, -1, 'idle', Game.t, false, 0);
    bigText(c, d.name, W - 160, 310, 30, d.color, '#000');
    smallText(c, d.title, W - 160, 336, 14, '#ccd', 'center');
    c.globalAlpha = 1;
    bigText(c, this.title, 70, 90, 50, '#ffd35a', '#000', 'left');
    this.items.forEach((it, i) => {
      const r = this.rect(i), on = i === this.i;
      c.fillStyle = on ? 'rgba(255,211,90,0.22)' : 'rgba(0,0,0,0.5)';
      c.beginPath(); c.moveTo(r.x, r.y); c.lineTo(r.x + r.w, r.y); c.lineTo(r.x + r.w - 16, r.y + r.h); c.lineTo(r.x - 16, r.y + r.h); c.closePath(); c.fill();
      if (on) { c.strokeStyle = '#ffd35a'; c.lineWidth = 2; c.stroke(); }
      const label = typeof it.label === 'function' ? it.label() : it.label;
      bigText(c, label, r.x + 18, r.y + r.h / 2, r.h > 46 ? 26 : 22, it.disabled ? '#667' : on ? '#ffd35a' : '#fff', '#000', 'left');
    });
    const it = this.items[this.i];
    if (it && it.desc) { panel(c, 70, H - 90, 700, 60); wrapText(c, typeof it.desc === 'function' ? it.desc() : it.desc, 90, H - 70, 660, 20, 15); }
    smallText(c, '↑↓ choose · ←→ change · ENTER/J confirm · ESC/K back', 70, H - 14, 12, '#99a');
  }
}

// ---------- title ----------
class TitleScreen {
  constructor() { this.idle = 0; this.parade = ROSTER.slice().sort(() => Math.random() - 0.5); }
  enter() { Music.play('menu'); this.idle = 0; }
  resume() { this.enter(); }
  update(dt) {
    this.idle += dt;
    if (Input.pressed.size) { Sfx.init(); Sfx.confirm(); UI.push(mainMenu()); return; }
    if (this.idle > 25) { this.idle = 0; Modes.attract(); }
  }
  tap() { Input.pressed.add('Enter'); }
  draw(c) {
    drawBackdrop(c, STAGES[0], Game.t, 0.2);
    silhouette(c, o => drawCharAt(o, charById('eric'), W / 2 - 60, H - 40, 2.6, 1, { pose: 'idle', anim: Game.t, transformed: true }), '#0a0612');
    c.globalCompositeOperation = 'lighter';
    for (const ex of [13, 23]) glowCircle(c, W / 2 - 60 + ex * 2.6, H - 40 - 101 * 2.6 + Math.sin(Game.t * 3) * 3.9, 16, 'rgba(255,30,30,1)', 'rgba(255,0,0,0)');
    c.globalCompositeOperation = 'source-over';
    this.parade.forEach((d, i) => { const x = ((i * 90 + Game.t * 50) % (60 * 90)) - 100; if (x > -100 && x < W + 100) drawCharAt(c, d, x, H - 6, 0.62 * (d.scale || 1), 1, { pose: 'run', anim: Game.t + i }); });
    logo(c, W / 2, 120);
    if (Math.sin(Game.t * 4) > -0.3) bigText(c, 'PRESS ANY KEY', W / 2, H - 150, 38, '#fff', '#000');
    smallText(c, '65 fighters · 12 stages · Story · Arcade · 3v3 Teams · Training · Challenges', W / 2, H - 112, 15, '#ddd', 'center');
    if (Pads.connected[0]) smallText(c, '🎮 Gamepad connected', W / 2, H - 90, 13, '#9cf', 'center');
  }
}

function mainMenu() {
  return new MenuScreen('MAIN MENU', [
    { label: 'STORY: MOONFALL', desc: 'The 14-chapter story of Eric, the moon, and everyone who wants a piece of it.', act: () => Modes.storyMenu() },
    { label: 'ARCADE', desc: 'Eight fights, a rival, a final boss and your fighter\'s ending.', act: () => UI.push(new MenuScreen('ARCADE', [
      { label: '1v1 ARCADE', desc: 'Classic ladder. Difficulty rises each fight.', act: () => Modes.arcade(1) },
      { label: '3v3 TEAM ARCADE', desc: 'Pick three. Five team battles and a boss squad.', act: () => Modes.arcade(3) },
    ])) },
    { label: 'VERSUS', desc: 'Local battles against the CPU or a friend, 1v1 or 3v3.', act: () => UI.push(new MenuScreen('VERSUS', [
      { label: '1v1 VS CPU', desc: 'Best-of-rounds duel against the CPU.', act: () => Modes.versus(1, 1) },
      { label: '1v1 VS PLAYER 2', desc: 'Two players, one keyboard (or two gamepads).', act: () => Modes.versus(1, 2) },
      { label: '3v3 VS CPU', desc: 'DBFZ-style team battle with assists and tag-ins.', act: () => Modes.versus(3, 1) },
      { label: '3v3 VS PLAYER 2', desc: 'Team battle with a friend.', act: () => Modes.versus(3, 2) },
      { label: 'CPU VS CPU', desc: 'Pick both sides and watch the AI fight.', act: () => Modes.versus(1, 0) },
    ])) },
    { label: 'TRAINING', desc: 'Practice with a dummy. Frame data, input display, hitboxes, infinite meter.', act: () => Modes.training() },
    { label: 'CHALLENGES', desc: 'Tutorial lessons and per-character combo trials.', act: () => UI.push(new MenuScreen('CHALLENGES', [
      { label: 'TUTORIAL', desc: '14 lessons covering every system in the game.', act: () => Modes.tutorial() },
      { label: 'COMBO TRIALS', desc: 'Seven trials for each of the 65 fighters.', act: () => Modes.trials() },
    ])) },
    { label: 'EXTRAS', desc: 'Survival, Time Attack, Boss Rush.', act: () => UI.push(new MenuScreen('EXTRAS', [
      { label: 'SURVIVAL', desc: 'Endless fights. Your health carries over.', act: () => Modes.survival() },
      { label: 'TIME ATTACK', desc: 'Five fights against the clock.', act: () => Modes.timeAttack() },
      { label: 'BOSS RUSH', desc: 'Five transformed giants with doubled health.', act: () => Modes.bossRush() },
    ])) },
    { label: 'GALLERY', desc: 'Every fighter\'s bio, full move list, dialogue, and a cinematic theater.', act: () => UI.push(new GalleryScreen()) },
    { label: 'RECORDS', desc: 'Your stats and achievements.', act: () => UI.push(new RecordsScreen()) },
    { label: 'SETTINGS', desc: 'Audio, difficulty, rules and accessibility.', act: () => UI.push(settingsMenu()) },
    { label: 'HOW TO PLAY', desc: 'Controls and every combat system explained.', act: () => UI.push(new HowToScreen()) },
    { label: 'FEATURES', desc: 'The full list of features in this build.', act: () => UI.push(new FeaturesScreen()) },
  ], { onBack: () => UI.pop(), y0: 130 });
}

function settingsMenu() {
  const S = Save.set, sv = () => { Save.save(); Sfx.applyVolumes(); };
  const pct = v => Math.round(v * 100) + '%';
  const vol = (k, name) => ({ label: () => `${name}: ${pct(S[k])}`, left: () => { S[k] = clamp(Math.round((S[k] - 0.1) * 10) / 10, 0, 1); sv(); }, right: () => { S[k] = clamp(Math.round((S[k] + 0.1) * 10) / 10, 0, 1); sv(); }, desc: '←/→ to adjust.' });
  const tog = (k, name, desc) => ({ label: () => `${name}: ${S[k] === false ? 'OFF' : 'ON'}`, act: () => { S[k] = S[k] === false; sv(); }, left: () => { S[k] = S[k] === false; sv(); }, right: () => { S[k] = S[k] === false; sv(); }, desc });
  const cyc = (k, name, vals, fmt, desc) => ({ label: () => `${name}: ${fmt(S[k])}`, left: () => { const i = vals.indexOf(S[k]); S[k] = vals[(i + vals.length - 1) % vals.length]; sv(); }, right: () => { const i = vals.indexOf(S[k]); S[k] = vals[(i + 1) % vals.length]; sv(); }, desc });
  return new MenuScreen('SETTINGS', [
    vol('master', 'MASTER VOLUME'), vol('music', 'MUSIC'), vol('sfx', 'SOUND EFFECTS'),
    cyc('cpu', 'CPU LEVEL', [1, 2, 3, 4], v => ['', 'EASY', 'NORMAL', 'HARD', 'NIGHTMARE'][v], 'Difficulty for Versus and Training CPU.'),
    cyc('roundTime', 'ROUND TIME', [60, 99, 120, 180, 0], v => v ? v + 's' : '∞', 'Time limit for 1v1 rounds.'),
    cyc('rounds', 'ROUNDS', [1, 3, 5], v => 'BEST OF ' + v, 'Rounds per 1v1 match.'),
    tog('cutscenes', 'CINEMATICS', 'Ultimate and transformation cinematics.'),
    tog('shake', 'SCREEN SHAKE', 'Camera shake on big hits.'),
    tog('dmgNums', 'DAMAGE NUMBERS', 'Floating damage numbers.'),
    tog('hints', 'CONTROL HINTS', 'Show control hints at the start of fights.'),
    tog('hitboxes', 'SHOW HITBOXES', 'Draw hurtboxes (green) and hitboxes (red) everywhere.'),
    { label: 'RESET SAVE DATA', desc: 'Erase records, achievements and settings.', act: () => { if (this && false) return; Save.data = Save.defaults(); Save.save(); Sfx.applyVolumes(); Game.announce('SAVE DATA RESET', '#ff5a5a', 80); } },
  ]);
}

// ---------- character select ----------
class SelectScreen {
  // cfg: { title, teamSize, players (0,1,2), onDone(teams) }
  constructor(cfg) {
    this.cfg = cfg; this.cols = 12; this.tile = 62; this.gap = 4;
    const n = cfg.players === 2 || cfg.players === 0 ? 2 : 1;
    this.cur = Array.from({ length: n }, (_, i) => ({ idx: i ? 11 : 0, picks: [], alt: 0, done: false }));
  }
  enter() { Music.play('select'); }
  // coming back from stage select / a match: unlock the cursors so you can pick again
  resume() { this.enter(); this.cur.forEach(c => { c.picks = []; c.done = false; }); }
  tiles() { return ROSTER.length + 1; }
  tileRect(i) { const w = this.cols * (this.tile + this.gap); const x0 = (W - w) / 2; return { x: x0 + (i % this.cols) * (this.tile + this.gap), y: 96 + Math.floor(i / this.cols) * (this.tile + this.gap), w: this.tile, h: this.tile }; }
  defAt(i) { return i >= ROSTER.length ? null : ROSTER[i]; }
  move(k, dx, dy) { const c = this.cur[k]; if (c.done) return; const n = this.tiles(); c.idx = clamp(c.idx + dx + dy * this.cols, 0, n - 1); Sfx.select(); }
  confirm(k) {
    const c = this.cur[k]; if (c.done) return;
    const d = this.defAt(c.idx) || pick(ROSTER);
    c.picks.push({ def: d, alt: c.alt || (this.cur.some((o, j) => j !== k && o.picks.some(p => p.def === d)) ? 1 : 0) });
    Sfx.confirm();
    if (c.picks.length >= this.cfg.teamSize) c.done = true;
    if (this.cur.every(x => x.done)) this.finish();
  }
  finish() {
    const teams = this.cur.map(c => c.picks);
    if (teams.length === 1 && this.cfg.opponent !== false) teams.push(Array.from({ length: this.cfg.teamSize }, () => ({ def: pick(ROSTER.filter(d => !teams[0].some(p => p.def === d))), alt: 0 })));
    this.cfg.onDone(teams);
  }
  back(k) { const c = this.cur[k]; if (c.picks.length) { c.picks.pop(); c.done = false; Sfx.select(); } else UI.pop(); }
  update() {
    const two = this.cur.length === 2;
    const k0 = [['KeyA', 'Pad0Left'], ['KeyD', 'Pad0Right'], ['KeyW', 'Pad0Up'], ['KeyS', 'Pad0Down'], ['KeyJ', 'Enter', 'Space', 'Pad0A'], ['KeyK', 'Escape', 'Pad0B'], ['KeyL', 'Pad0Y'], ['KeyR']];
    const k1 = [['ArrowLeft', 'Pad1Left'], ['ArrowRight', 'Pad1Right'], ['ArrowUp', 'Pad1Up'], ['ArrowDown', 'Pad1Down'], ['Numpad1', 'Comma', 'Pad1A'], ['Numpad2', 'Period', 'Pad1B'], ['Numpad3', 'Slash', 'Pad1Y'], []];
    const maps = two ? [k0, k1] : [[['KeyA', 'ArrowLeft', 'Pad0Left'], ['KeyD', 'ArrowRight', 'Pad0Right'], ['KeyW', 'ArrowUp', 'Pad0Up'], ['KeyS', 'ArrowDown', 'Pad0Down'], k0[4], k0[5], k0[6], k0[7]]];
    maps.forEach((m, k) => {
      if (tapped(...m[0])) this.move(k, -1, 0); if (tapped(...m[1])) this.move(k, 1, 0);
      if (tapped(...m[2])) this.move(k, 0, -1); if (tapped(...m[3])) this.move(k, 0, 1);
      if (tapped(...m[4])) this.confirm(k); else if (tapped(...m[5])) this.back(k);
      if (m[6].length && tapped(...m[6])) { this.cur[k].alt = (this.cur[k].alt + 1) % 4; Sfx.select(); }
      if (m[7].length && tapped(...m[7])) { this.cur[k].idx = ROSTER.length; this.confirm(k); }
    });
  }
  // mouse/touch: clicks drive whichever side is still picking (P1 first, then P2)
  activeCursor() { const k = this.cur.findIndex(c => !c.done); return k < 0 ? this.cur.length - 1 : k; }
  tileAt(x, y) { for (let i = 0; i < this.tiles(); i++) { const r = this.tileRect(i); if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) return i; } return -1; }
  hover(x, y) { const i = this.tileAt(x, y), k = this.activeCursor(); if (i >= 0 && this.cur[k] && !this.cur[k].done && this.cur[k].idx !== i) this.cur[k].idx = i; }
  tap(x, y, mouse) {
    const k = this.activeCursor(), i = this.tileAt(x, y);
    if (i >= 0) { if (mouse || this.cur[k].idx === i) { this.cur[k].idx = i; this.confirm(k); } else { this.cur[k].idx = i; Sfx.select(); } return; }
    if (y > H - 40 && x < 200) this.back(k);
  }

  draw(c) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b0a1e'); g.addColorStop(1, '#2a1640'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,255,255,0.04)'; for (let i = 0; i < 30; i++) { c.beginPath(); c.moveTo(i * 60 - (Game.t * 20) % 60, 0); c.lineTo(i * 60 - 300 - (Game.t * 20) % 60, H); c.stroke(); }
    bigText(c, this.cfg.title || 'CHOOSE YOUR FIGHTER', W / 2, 40, 36, '#fff', '#000');
    smallText(c, this.cfg.teamSize > 1 ? `Pick ${this.cfg.teamSize} fighters (order = point, assist 1, assist 2)` : 'Pick a fighter', W / 2, 70, 14, '#ffd35a', 'center');
    for (let i = 0; i < this.tiles(); i++) {
      const r = this.tileRect(i), d = this.defAt(i);
      c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(r.x, r.y, r.w, r.h);
      if (d) c.drawImage(portrait(d, 96), r.x, r.y, r.w, r.h);
      else { bigText(c, '?', r.x + r.w / 2, r.y + r.h / 2, 40, '#ffd35a'); }
      this.cur.forEach((cu, k) => { if (cu.idx === i) { c.strokeStyle = k ? '#5ad8ff' : '#ffd35a'; c.lineWidth = 4; c.strokeRect(r.x + k * 3, r.y + k * 3, r.w - k * 6, r.h - k * 6); bigText(c, 'P' + (k + 1), r.x + (k ? r.w - 12 : 12), r.y + 10, 12, k ? '#5ad8ff' : '#ffd35a'); } });
    }
    // info panels
    const two = this.cur.length === 2;
    this.cur.forEach((cu, k) => {
      const d = this.defAt(cu.idx) || null, px = two ? (k ? W / 2 + 10 : 20) : 20, pw = two ? W / 2 - 30 : W - 40, py = 500, ph = 196;
      panel(c, px, py, pw, ph, 'rgba(8,6,20,0.82)', k ? '#5ad8ff' : '#ffd35a');
      // team slots
      for (let s = 0; s < this.cfg.teamSize; s++) { const sx = px + pw - 70 - s * 66, sy = py - 64; c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(sx, sy, 58, 58); const p = cu.picks[this.cfg.teamSize - 1 - s]; if (p) c.drawImage(portrait(p.def, 96, { alt: p.alt }), sx, sy, 58, 58); c.strokeStyle = '#555'; c.strokeRect(sx, sy, 58, 58); }
      if (!d) { bigText(c, 'RANDOM', px + 20, py + 30, 30, '#ffd35a', '#000', 'left'); return; }
      c.save(); c.beginPath(); c.rect(px, py - 200, 190, ph + 200); c.clip();
      drawModel(c, d, px + 95, py + ph - 14, 1.55, 1, Math.sin(Game.t) > 0.6 ? 'victory' : 'idle', Game.t, Math.sin(Game.t * 0.7) > 0.5, cu.alt);
      c.restore();
      const tx = px + 190;
      bigText(c, d.name, tx, py + 24, 26, d.color, '#000', 'left');
      smallText(c, `${d.side} · ${d.title} · ${d.role}`, tx, py + 48, 12, '#ccd');
      smallText(c, '★ ' + d.passive[0] + ': ' + d.passive[1], tx, py + 68, 11.5, '#ffd35a');
      const mv = ['5S', '6S', '2S', '4S', 'jS'].map(k2 => d.moves[k2] && `${k2}: ${d.moves[k2].name}`).filter(Boolean);
      const cols = two ? 1 : 2;
      mv.forEach((m, i) => smallText(c, m, tx + (i % cols) * 250, py + 90 + Math.floor(i / cols) * 16, 11.5, '#dde'));
      const yy = py + 90 + Math.ceil(mv.length / cols) * 16;
      smallText(c, `SUPER: ${d.super.name}`, tx, yy + 2, 11.5, '#5ad8ff');
      smallText(c, `ULT: ${d.ult.name}`, tx, yy + 18, 11.5, '#ff9a6a');
      smallText(c, `AWAKEN: ${d.form.name}${d.form.timed ? ' (timed)' : d.form.manual === false ? ' (revive)' : ''}`, tx, yy + 34, 11.5, '#9cf');
      if (!two) wrapText(c, d.bio, tx + 520, py + 30, pw - 720, 17, 12.5, '#bbc');
      smallText(c, 'Color ' + (cu.alt + 1) + '/4', px + pw - 12, py + ph - 12, 11, '#99a', 'right');
    });
    if (this.cur.length === 2) { const k = this.activeCursor(); if (!this.cur[k].done) bigText(c, 'NOW PICKING: P' + (k + 1) + (this.cfg.players === 0 ? ' (CPU)' : ''), W - 20, 40, 18, k ? '#5ad8ff' : '#ffd35a', '#000', 'right'); }
    bigText(c, '◀ BACK', 70, H - 20, 16, '#ffd35a', '#000');
    smallText(c, this.cur.length === 2 ? 'P1: WASD · J pick · K undo · L color   |   P2: arrows · Numpad1/, pick · Numpad2/. undo · Numpad3// color' : 'Arrows/WASD move · J/ENTER pick · K/ESC undo · L change color · R random', W / 2, H - 2, 11, '#99a', 'center');
  }
}

// ---------- stage select ----------
const StageThumbs = {};
function stageThumb(st) {
  if (StageThumbs[st.id]) return StageThumbs[st.id];
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 180; const x = cv.getContext('2d'); x.scale(0.25, 0.25);
  const prev = Arena.stage; Arena.load(st);
  drawBackdrop(x, st, 3, 0);
  const save = { x: Cam.x, y: Cam.y, z: Cam.z }; Cam.z = 0.8; Cam.x = st.width / 2; Cam.y = -(H / 2 - 88) / 0.8;
  x.save(); Cam.apply(x); for (const b of Arena.structs) st.struct(x, b, 0); x.restore(); Object.assign(Cam, save);
  if (prev) Arena.load(prev);
  return (StageThumbs[st.id] = cv);
}
class StageSelectScreen {
  constructor(onDone) { this.onDone = onDone; this.i = 0; }
  rect(i) { const w = 270, h = 152, g = 18, cols = 4; const x0 = (W - (w * cols + g * (cols - 1))) / 2; return { x: x0 + (i % cols) * (w + g), y: 86 + Math.floor(i / cols) * (h + 46), w, h }; }
  update() {
    const n = STAGES.length + 1;
    if (nav('left')) { this.i = (this.i + n - 1) % n; Sfx.select(); } if (nav('right')) { this.i = (this.i + 1) % n; Sfx.select(); }
    if (nav('up')) { this.i = Math.max(0, this.i - 4); Sfx.select(); } if (nav('down')) { this.i = Math.min(n - 1, this.i + 4); Sfx.select(); }
    if (nav('ok')) { Sfx.confirm(); this.onDone(this.i >= STAGES.length ? pick(STAGES) : STAGES[this.i]); }
    else if (nav('back')) UI.pop();
  }
  hover(x, y) { for (let i = 0; i <= STAGES.length; i++) { const r = this.rect(i); if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) this.i = i; } }
  tap(x, y, mouse) { for (let i = 0; i <= STAGES.length; i++) { const r = this.rect(i); if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) { if (mouse || this.i === i) { this.i = i; Input.pressed.add('Enter'); } else this.i = i; } } }
  draw(c) {
    c.fillStyle = '#08070f'; c.fillRect(0, 0, W, H);
    bigText(c, 'CHOOSE A STAGE', W / 2, 44, 40, '#fff', '#000');
    for (let i = 0; i <= STAGES.length; i++) {
      const r = this.rect(i), st = STAGES[i], on = i === this.i;
      if (st) c.drawImage(stageThumb(st), r.x, r.y, r.w, r.h); else { c.fillStyle = '#1a1830'; c.fillRect(r.x, r.y, r.w, r.h); bigText(c, '?', r.x + r.w / 2, r.y + r.h / 2, 60, '#ffd35a'); }
      c.strokeStyle = on ? '#ffd35a' : '#333'; c.lineWidth = on ? 5 : 2; c.strokeRect(r.x, r.y, r.w, r.h);
      bigText(c, st ? st.name : 'RANDOM', r.x + r.w / 2, r.y + r.h + 16, 17, on ? '#ffd35a' : '#ccc');
    }
    const st = STAGES[this.i];
    panel(c, 60, H - 60, W - 120, 44); smallText(c, st ? st.desc + '   (width ' + st.width + ')' : 'Surprise me.', W / 2, H - 38, 15, '#dde', 'center');
  }
}

// ---------- gallery ----------
class GalleryScreen extends SelectScreen {
  constructor() { super({ title: 'GALLERY', teamSize: 1, players: 1 }); }
  enter() { Music.play('menu'); }
  confirm() { const d = this.defAt(this.cur[0].idx) || pick(ROSTER); UI.push(new ProfileScreen(d)); }
  back() { UI.pop(); }
}
class ProfileScreen {
  constructor(d) { this.d = d; this.form = false; this.pose = 0; this.alt = 0; }
  update(dt) {
    const i = ROSTER.indexOf(this.d);
    if (nav('left')) { this.d = ROSTER[(i + ROSTER.length - 1) % ROSTER.length]; Sfx.select(); }
    if (nav('right')) { this.d = ROSTER[(i + 1) % ROSTER.length]; Sfx.select(); }
    if (tapped('KeyF', 'KeyU')) this.form = !this.form;
    if (tapped('KeyL')) this.alt = (this.alt + 1) % 4;
    if (tapped('KeyP', 'KeyO')) this.theater('ult');
    if (tapped('KeyT', 'KeyI')) this.theater('form');
    if (nav('back')) UI.pop();
  }
  theater(kind) {
    const d = this.d, opp = d.rival ? charById(d.rival) : ROSTER[(ROSTER.indexOf(d) + 7) % ROSTER.length];
    Arena.load(STAGES[0]);
    const B0 = { idx: 0, meter: 0 }, B1 = { idx: 1, meter: 0 };
    const a = new Fighter(d, B0, 0, { alt: this.alt }), b = new Fighter(opp, B1, 0, {});
    a.side = B0; b.side = B1; B0.enemy = B1; B1.enemy = B0; B0.point = a; B1.point = b;
    a.x = 1100; b.x = 1500; a.form = kind === 'ult' && (d.id === 'kael');
    Game.playCutscene(kind === 'ult' ? Cutscenes.ultFor(a, b, d.ult) : Cutscenes.transform(a), () => Music.play('menu'));
  }
  tap(x, y) { if (y > H - 60) { if (x < W / 3) this.theater('ult'); else if (x < W * 2 / 3) this.theater('form'); else UI.pop(); } else this.form = !this.form; }
  draw(c) {
    const d = this.d;
    drawBackdrop(c, STAGES[ROSTER.indexOf(d) % STAGES.length], Game.t, 0.6);
    c.drawImage(portrait(d, 200, { form: this.form, alt: this.alt, expr: 'grin' }), 40, 40, 220, 220);
    c.strokeStyle = d.color; c.lineWidth = 4; c.strokeRect(40, 40, 220, 220);
    const poses = ['idle', 'punch', 'kick', 'heavy', 'cast', 'uppercut', 'taunt', 'victory', 'dash', 'air_heavy'];
    drawModel(c, d, 150, 640, 2.4, 1, poses[Math.floor(Game.t / 1.2) % poses.length], Game.t, this.form, this.alt);
    const x = 300; let y = 60;
    bigText(c, d.name, x, y, 44, d.color, '#000', 'left'); y += 36;
    smallText(c, `${d.side} · ${d.title} · ${d.role}`, x, y, 15, '#ccd'); y += 24;
    y = wrapText(c, d.bio, x, y, 900, 19, 14.5, '#eee') + 4;
    smallText(c, `"${d.quote}"`, x, y, 14, '#ffd35a'); y += 26;
    panel(c, x - 10, y, 930, 330);
    y += 20;
    const line = (k, n, desc, col) => { smallText(c, k, x + 4, y, 13, col); smallText(c, n, x + 60, y, 14, '#fff'); smallText(c, desc || '', x + 290, y, 12.5, '#bbc'); y += 21; };
    line('★', d.passive[0], d.passive[1], '#ffd35a');
    for (const k of ['5S', '6S', '2S', '4S', 'jS']) if (d.moves[k]) line(k, d.moves[k].name, d.moves[k].desc, d.color);
    line('SUPER', d.super.name, d.super.desc + ' (1 bar)', '#5ad8ff');
    line('ULT', d.ult.name, d.ult.desc + ' (3 bars)', '#ff9a6a');
    line('AWAKEN', d.form.name, d.form.desc, '#9cf');
    if (d.form.moves) for (const [k, m] of Object.entries(d.form.moves)) line('  ' + k, m.name, '(awakened) ' + m.desc, '#9cf');
    line('ASSIST', d.moves[d.assist || '5S'] ? d.moves[d.assist || '5S'].name : '-', 'Called in team battles', '#aaa');
    if (d.lines.intro) line('SAYS', '', '"' + d.lines.intro[0].replace('{opp}', 'you') + '"', '#ccc');
    if (d.rival) line('RIVAL', charById(d.rival) ? charById(d.rival).name : d.rival, '', '#ff5a5a');
    smallText(c, '←/→ browse · F toggle awakened · L color · P ultimate cinematic · T transformation cinematic · ESC back', W / 2, H - 16, 13, '#aab', 'center');
  }
}

// ---------- records ----------
class RecordsScreen {
  update() { if (nav('back') || nav('ok')) UI.pop(); }
  draw(c) {
    drawBackdrop(c, STAGES[8], Game.t, 0.7);
    bigText(c, 'RECORDS', 60, 60, 44, '#ffd35a', '#000', 'left');
    const r = Save.rec;
    const rows = [['Matches played', r.matches], ['Best combo', r.bestCombo + ' hits'], ['Ultimates landed', r.ults], ['Transformations', r.transforms], ['Vanishes', r.vanishes], ['Techs', r.techs], ['Structures destroyed', r.destroyed], ['Bars of Ki spent', Math.round(r.bars)], ['Survival best', r.survival + ' wins'], ['Time Attack best', r.timeAttack ? r.timeAttack.toFixed(1) + 's' : '—'], ['Story chapters cleared', r.story + ' / ' + STORY.length], ['Fighters played', Object.keys(r.played).length + ' / 60'], ['Stages played', Object.keys(r.stages).length + ' / 12']];
    panel(c, 50, 90, 420, rows.length * 26 + 20);
    rows.forEach(([a, b], i) => { smallText(c, a, 70, 112 + i * 26, 15, '#ccd'); smallText(c, String(b), 450, 112 + i * 26, 15, '#fff', 'right'); });
    const most = Object.entries(r.played).sort((a, b) => b[1] - a[1]).slice(0, 5);
    smallText(c, 'MOST PLAYED', 70, 112 + rows.length * 26 + 20, 14, '#ffd35a');
    most.forEach(([id, n], i) => { const d = charById(id); if (d) { c.drawImage(portrait(d, 96), 70 + i * 76, 112 + rows.length * 26 + 36, 64, 64); smallText(c, n + '×', 102 + i * 76, 112 + rows.length * 26 + 112, 12, '#fff', 'center'); } });
    bigText(c, 'ACHIEVEMENTS  ' + Object.keys(Save.data.ach).length + ' / ' + ACHIEVEMENTS.length, 520, 60, 28, '#ffd35a', '#000', 'left');
    ACHIEVEMENTS.forEach(([id, name, desc], i) => {
      const got = Save.data.ach[id], x = 520 + (i % 2) * 370, y = 88 + Math.floor(i / 2) * 34;
      c.fillStyle = got ? 'rgba(255,211,90,0.18)' : 'rgba(0,0,0,0.5)'; c.fillRect(x, y, 360, 30);
      smallText(c, (got ? '🏆 ' : '🔒 ') + name, x + 8, y + 10, 12.5, got ? '#ffd35a' : '#889');
      smallText(c, desc, x + 8, y + 23, 10, '#aab');
    });
  }
}

// ---------- how to play ----------
const HOWTO = [
  ['CONTROLS: PLAYER 1', [['Move / Jump / Crouch', 'A D · W · S (hold AWAY to block, DOWN-AWAY to block low)'], ['Light · Medium · Heavy', 'J · K · L'], ['Special', 'I + direction: neutral, forward, down, back, or in the air'], ['Super (1 bar) / Ultimate (3 bars)', 'O  /  ↓+O or P'], ['Vanish (1 bar)', 'K+L together, or H'], ['Super Dash', 'SPACE'], ['Dash', 'double-tap forward/back or SHIFT'], ['Awaken (transform)', 'U'], ['Sparking Blast (once per match)', 'B'], ['Ki Charge', 'hold C'], ['Assists / Tag (3v3)', 'tap / hold Q and E'], ['Taunt', 'T'], ['Pause', 'ESC']]],
  ['CONTROLS: PLAYER 2 & GAMEPAD', [['P2 Move', 'Arrow keys'], ['P2 L · M · H · S', 'Numpad 1 2 3 4  (or , . / ;)'], ['P2 Super · Ult · Vanish', 'Numpad 5 · 6 · 7'], ['P2 Super Dash · Awaken · Spark', 'Numpad 0 · 8 · 9'], ['P2 Assists', 'Numpad + and −'], ['Gamepad', 'A/X/Y/B = L/M/H/S · RB super · LB super dash · LT vanish · RT assist · Back awaken · L3 spark · R3 charge']]],
  ['OFFENSE', [['Auto combo', 'Mash Light: 5L → 5L → 5M → launcher, then keep mashing in the air'], ['Gatlings', 'Light → Medium → Heavy chain into each other; any normal cancels into a special, specials into supers, supers into the ultimate'], ['Launcher', '↓+H launches. Press up or any attack to super-jump after them for an air combo'], ['Smash', '5H blows the enemy away with a wall bounce'], ['Spike', '↓+H in the air slams them into a ground bounce'], ['Overheads & lows', 'Jump attacks must be blocked standing; crouching L/M must be blocked low'], ['Throw', 'Forward + H up close. Throws can be teched by pressing H'], ['Counter hit', 'Hit someone during their startup: more damage and hitstun']]],
  ['DEFENSE & METER', [['Blocking', 'Hold away. Specials deal chip damage. Blocking fills the guard gauge; if it fills you get GUARD CRUSHED'], ['Reflect', 'Press S while blocking: pushes attackers away and reflects projectiles'], ['Tech roll', 'Hold a direction or press a button as you land from a launch'], ['Ki meter', '5 bars, shared by the team. Build it by attacking, blocking, getting hit or charging'], ['Combo scaling', 'Each hit in a combo deals less damage; gravity increases as combos get longer'], ['Sparking Blast', 'Once per match: bursts out of combos, damage and speed up, regenerates recoverable (red) health. Lasts longer the more teammates are KO\'d']]],
  ['SUPERS, ULTIMATES & AWAKENING', [['Level 1 Super', '1 bar. A flashy in-game super with a super freeze'], ['Level 3 Ultimate', '3 bars. The startup must CONNECT; if it hits, the cinematic plays and deals massive damage. If blocked or whiffed, you are wide open'], ['Beam struggle', 'Two super beams collide: mash attack buttons to win'], ['Awaken', 'Most fighters transform PERMANENTLY for the rest of the round (2 bars). A few broken forms are timed. Kael only transforms by dying once'], ['Super Dash', 'Homes in on the enemy and passes through projectiles, but loses to ↓+H'], ['Vanish', '1 bar: teleport behind the enemy and smash them into the wall']]],
  ['TEAMS & STAGES', [['3v3', 'Pick three. The first is on point; the other two are assists'], ['Assists', 'Tap Q/E: a teammate jumps in and uses their assist special (6s cooldown)'], ['Tag', 'Hold Q/E: switch in a teammate with a diving attack'], ['Recoverable health', 'Benched fighters slowly regain their red health'], ['Last Stand', 'Your last fighter gets a free bar of meter'], ['Stages', 'Wide stages with a zooming camera. Hazards: eruptions, meteors, wind, ice, power surges, falling chandeliers, fruit, sandstorms, crowd hype, gravity pull'], ['Destructive Finish', 'Ending a round with a big hit near a wall blasts the loser into a new stage']]],
];
class HowToScreen {
  constructor() { this.p = 0; }
  update() { if (nav('left')) this.p = (this.p + HOWTO.length - 1) % HOWTO.length; if (nav('right') || nav('ok')) this.p = (this.p + 1) % HOWTO.length; if (nav('back')) UI.pop(); }
  tap(x) { if (x < W / 3) this.p = (this.p + HOWTO.length - 1) % HOWTO.length; else if (x > W * 2 / 3) this.p = (this.p + 1) % HOWTO.length; else UI.pop(); }
  draw(c) {
    drawBackdrop(c, STAGES[5], Game.t, 0.7);
    const [title, rows] = HOWTO[this.p];
    bigText(c, 'HOW TO PLAY', 60, 50, 40, '#ffd35a', '#000', 'left');
    bigText(c, title, 60, 100, 26, '#fff', '#000', 'left');
    panel(c, 50, 124, W - 100, rows.length * 42 + 20);
    rows.forEach(([a, b], i) => { smallText(c, a, 70, 150 + i * 42, 16, '#ffd35a'); wrapText(c, b, 420, 150 + i * 42, W - 500, 17, 14, '#eee'); });
    smallText(c, `Page ${this.p + 1} / ${HOWTO.length}   ·   ←/→ turn pages   ·   ESC back`, W / 2, H - 20, 14, '#aab', 'center');
  }
}

// ---------- features codex ----------
const FEATURES = {
  'COMBAT (48)': ['Light / Medium / Heavy / Special buttons', 'Mash-light auto combos (ground and air)', 'Gatling chains L→M→H', 'Crouching normals with low hits', 'Air normals, overhead jump-ins', 'Launcher with super-jump cancel', 'Air combos with auto air chain', 'Smash hits with wall bounce', 'Air spikes with ground bounce', 'Soft & hard knockdowns', 'Tech rolls on landing', 'Air recovery flips', 'High / low / overhead blocking', 'Hold-away blocking and crouch blocking', 'Air blocking', 'Chip damage from specials', 'Blockstun and pushback', 'Guard gauge and guard crush', 'Reflect (block + S)', 'Throws and throw techs', 'Command grabs (slam, suplex, spin, drain, toss)', 'Super dash (homing, beats projectiles)', 'Vanish teleport-smash (1 bar)', 'Ki charge', 'Dash, backdash with i-frames, air dash', 'Double / triple / quadruple jumps', 'Directional specials (5 per fighter)', 'Rekka follow-ups', 'Special → super → ultimate cancels', 'Level 1 supers with super freeze', 'Level 3 ultimates that must connect', 'Ultimate cut-ins with anime portraits', 'Permanent-for-the-round awakenings', 'Timed "broken" transformations', 'Kael\'s death-triggered revive', 'Sparking Blast (combo breaker, buffs, red-health regen)', 'Damage scaling with super minimums', 'Hitstun decay and gravity scaling', 'Counter hits', 'Armor and invincibility frames', 'Counter stances', 'Normal clashes', 'Projectile priority and clashing', 'Beam struggles (mash to win)', '11 status effects (burn, bleed, poison, slow, freeze, stun, weaken, mark, confuse, shield, haste)', 'Unique passives for all 60 fighters', 'Input buffer', 'Combo counter with damage'],
  'TEAMS (7)': ['3v3 team battles', 'Shared team Ki meter', 'Assist calls with cooldowns', 'Tag-ins with diving attacks', 'Recoverable red health for benched fighters', 'KO succession with entrance', 'Last Stand meter bonus'],
  'MODES (16)': ['Story Mode: Moonfall (14 chapters)', 'Arcade 1v1 (8 fights, rival, boss, ending)', 'Team Arcade 3v3', 'Versus CPU 1v1', 'Versus 2 Player 1v1', 'Versus CPU 3v3', 'Versus 2 Player 3v3', 'CPU vs CPU spectator', 'Survival', 'Time Attack', 'Boss Rush (5 giants)', 'Training mode', 'Tutorial (14 lessons)', 'Combo Trials (7 × 60 fighters)', 'Gallery with cinematic theater', 'Attract mode demo battles'],
  'PRESENTATION (26)': ['61 remodeled fighters', 'Aurelion: a fallen-god rebirth when a mortal defeats him ascended', 'Anime-style face portraits for every fighter', '4 color palettes per fighter', 'Zooming, panning battle camera', '12 wide stages (2400–3000px) with parallax', 'Destructible stage structures', 'Weather: rain, snow, embers, ash, wind, sandstorm', '16 procedural music tracks', 'Synthesized sound effects', 'Hit sparks sized by strength', 'Hitstop and screen shake', 'Slow-motion KOs', '60 unique ultimate cinematics (11 templates + 4 bespoke)', 'Transformation cinematics for every fighter', 'VS intro screens', 'Pre-fight dialogue for every fighter', '15 rival exchanges', 'Win quotes', 'Taunts, transform, ultimate and tag lines', 'Destructive finishes with stage transition', 'Round and KO announcements', 'Speech bubbles in battle', 'Results screen with stats and rank', 'Arcade endings for all 60 fighters', 'Achievement toasts', 'Title screen parade'],
  'STAGE HAZARDS (10)': ['Magma Rift eruptions', 'Lunar low gravity and meteor showers', 'Frostpeak slippery ice and icicles', 'Sky Temple wind gusts', 'Neon power surges', 'Haunted Manor chandeliers and lightning', 'Colosseum crowd hype (Ki bonus)', 'Void gravity pull', 'Jungle healing fruit', 'Desert sandstorms'],
  'SYSTEMS (14)': ['Training: dummy stand/crouch/jump/CPU', 'Training: guard all/none/after first hit/random', 'Training: tech toggle', 'Training: hitbox display', 'Training: input display', 'Training: frame data', 'Training: infinite meter & HP reset', 'Gamepad support (2 pads)', 'Touch controls', 'Settings: volume, CPU level, rounds, timer, cinematics, shake, damage numbers, hints', '35 achievements', 'Records & most-played stats', 'Local save data', 'Pause menu with move list'],
};
class FeaturesScreen {
  constructor() { this.scroll = 0; }
  update(dt) { if (nav('down') || held('ArrowDown')) this.scroll += 12; if (nav('up') || held('ArrowUp')) this.scroll -= 12; this.scroll = Math.max(0, this.scroll); if (nav('back') || nav('ok')) UI.pop(); }
  tap() { this.scroll += 200; }
  draw(c) {
    drawBackdrop(c, STAGES[6], Game.t, 0.75);
    const total = Object.values(FEATURES).reduce((a, b) => a + b.length, 0);
    bigText(c, `FEATURES (${total})`, 60, 50, 40, '#ffd35a', '#000', 'left');
    c.save(); c.beginPath(); c.rect(0, 80, W, H - 110); c.clip();
    let y = 110 - this.scroll, n = 1;
    for (const [cat, list] of Object.entries(FEATURES)) {
      bigText(c, cat, 60, y, 22, '#fff', '#000', 'left'); y += 28;
      list.forEach((f, i) => { smallText(c, `${n++}. ${f}`, 70 + (i % 3) * 390, y + Math.floor(i / 3) * 22, 13, '#dde'); });
      y += Math.ceil(list.length / 3) * 22 + 18;
    }
    c.restore();
    smallText(c, '↑/↓ scroll · ESC back', W / 2, H - 14, 13, '#aab', 'center');
  }
}
