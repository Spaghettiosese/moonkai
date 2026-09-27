// ============================================================
//  MOONKAI — game modes: battle screen, pause, results, story scenes,
//  arcade ladder, versus, training, tutorial, trials, survival,
//  time attack, boss rush, attract demo + boot
// ============================================================

// ---------- helpers ----------
const cpuLevel = (d = 0) => clamp((Save.set.cpu || 2) + d, 1, 4);
const member = (def, ctrl, o = {}) => Object.assign({ def: typeof def === 'string' ? charById(def) : def, alt: 0, ctrl, level: cpuLevel() }, o);
const others = (ex, n = 1) => { const pool = ROSTER.filter(d => !ex.includes(d)); const out = []; while (out.length < n) { const d = pick(pool); if (!out.includes(d)) out.push(d); } return out; };
const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}.${String(Math.floor((s % 1) * 10))}`;
const SLOT_INPUT = { '5S': 'I', '6S': '→ + I', '4S': '← + I', '2S': '↓ + I', 'jS': 'air + I' };

// ---------- VS splash (team aware, uses anime portraits) ----------
function csVersusTeams(t0, t1, title) {
  return {
    name: 'VERSUS', dur: 3.2, fx: new ParticleSystem(),
    cues: [[0.1, () => Sfx.whoosh()], [0.75, () => Sfx.slam()], [2.7, () => Sfx.blast()]],
    draw(c, t) {
      const p = ease.out(seg(t, 0, 0.5));
      c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      const half = (team, L) => {
        const d = team[0].def, slant = 120;
        c.save(); c.beginPath();
        if (L) { c.moveTo(0, 0); c.lineTo(W / 2 + slant, 0); c.lineTo(W / 2 - slant, H); c.lineTo(0, H); }
        else { c.moveTo(W / 2 + slant, 0); c.lineTo(W, 0); c.lineTo(W, H); c.lineTo(W / 2 - slant, H); }
        c.clip();
        const g = c.createLinearGradient(L ? 0 : W, 0, W / 2, H); g.addColorStop(0, d.color2 || shadeHex(d.color, -0.6)); g.addColorStop(1, '#000');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        speedLines(c, t, L ? W * 0.25 : W * 0.75, H / 2, 'rgba(255,255,255,0.12)');
        const img = portrait(d, 320, { alt: team[0].alt, expr: 'angry' });
        const px = L ? lerp(-420, 40, p) : lerp(W + 420, W - 400, p);
        c.globalAlpha = 0.95; c.drawImage(img, px, L ? 70 : 170, 360, 360); c.globalAlpha = 1;
        drawModel(c, d, L ? lerp(-300, 340, p) : lerp(W + 300, W - 340, p), H + 30, 3.2, L ? 1 : -1, 'intro', t, false, team[0].alt);
        team.slice(1).forEach((m, i) => { const x = L ? 30 + i * 96 : W - 116 - i * 96, y = L ? H - 120 : 30; c.drawImage(portrait(m.def, 96, { alt: m.alt }), x, y, 86, 86); c.strokeStyle = m.def.color; c.lineWidth = 3; c.strokeRect(x, y, 86, 86); });
        c.restore();
        bigText(c, d.name, L ? lerp(-200, 60, p) : lerp(W + 200, W - 60, p), L ? 70 : H - 190, 64, d.color, '#000', L ? 'left' : 'right');
        smallText(c, `${d.side} · ${d.title}`, L ? lerp(-200, 64, p) : lerp(W + 200, W - 64, p), L ? 112 : H - 150, 20, '#fff', L ? 'left' : 'right');
        if (t > (L ? 1.2 : 1.7)) { c.globalAlpha = seg(t, L ? 1.2 : 1.7, L ? 1.5 : 2.0); smallText(c, '“' + d.quote + '”', L ? 64 : W - 64, L ? 142 : H - 124, 17, '#ddd', L ? 'left' : 'right'); c.globalAlpha = 1; }
      };
      half(t0, true); half(t1, false);
      c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.moveTo(W / 2 + 120, 0); c.lineTo(W / 2 - 120, H); c.stroke();
      if (t > 0.75) { const s = lerp(3, 1, ease.out(seg(t, 0.75, 0.95))); c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.rotate(-0.08); bigText(c, 'VS', 0, 0, 170, '#fff', '#c01010'); c.restore(); }
      if (title) bigText(c, title, W / 2, H / 2 + 110, 26, '#ffd35a', '#000');
      flashAt(c, t, 0.75, 1.0);
      flash(c, seg(t, 2.85, 3.2), '#000');
    },
  };
}

// ============================================================
//  BATTLE SCREEN — fixed 60Hz simulation, pause, overlays
// ============================================================
class BattleScreen {
  // opts: { onEnd(result, B, screen), mkCfg, vsSplash, title, attract, overlay(c,B), tick(B), setup(B), restart, pauseItems(screen) }
  constructor(cfg, opts = {}) {
    this.cfg = cfg; this.opts = opts; this.acc = 0; this.done = false; this.started = false;
    cfg.onEnd = (r) => this.finish(r);
    this.B = new Battle(cfg);
    if (opts.setup) opts.setup(this.B);
  }
  enter() {
    if (this.opts.vsSplash && Save.set.cutscenes !== false) Game.playCutscene(csVersusTeams(this.cfg.teams[0], this.cfg.teams[1], this.opts.title));
  }
  resume() { Game.battle = this.B; Music.play(this.cfg.music || Arena.stage.music); }
  finish(r) {
    if (this.done) return; this.done = true;
    if (!this.opts.attract && !this.B.training) recordMatch(this.B, r);
    const go = () => this.opts.onEnd ? this.opts.onEnd(r, this.B, this) : UI.pop();
    // let the final frame render before switching screens
    this.pendingEnd = go;
  }
  restart() {
    const mk = this.opts.mkCfg; if (!mk) return;
    Game.laters = []; Game.banner = null;
    UI.replace(new BattleScreen(mk(), Object.assign({}, this.opts, { vsSplash: false })));
  }
  update(dt) {
    if (this.pendingEnd) { const g = this.pendingEnd; this.pendingEnd = null; g(); return; }
    const B = this.B; Game.battle = B;
    if (this.opts.attract) { if (Input.pressed.size) { UI.pop(); return; } }
    else if (tapped('Escape', 'Pad0Start', 'Pad1Start') && !this.done) { Sfx.select(); UI.push(new PauseScreen(this)); return; }
    if (B.training) this.trainingKeys(B);
    this.acc += dt * FPS * (B.slowmo || 1);
    let steps = Math.min(4, Math.floor(this.acc)); this.acc -= steps;
    if (this.acc > 4) this.acc = 0;
    if (steps === 0) return 'noconsume';
    for (let i = 0; i < steps; i++) {
      B.step();
      if (this.opts.tick) this.opts.tick(B);
      if (i === 0) Input.pressed.clear();
      if (Game.cutscene || this.pendingEnd || UI.top() !== this) break;
    }
  }
  trainingKeys(B) {
    const d = B.dummy;
    if (tapped('F1', 'Digit1')) { d.action = cycle(['stand', 'crouch', 'jump', 'cpu'], d.action); Sfx.select(); }
    if (tapped('F2', 'Digit2')) { d.guard = cycle(['none', 'all', 'after', 'random'], d.guard); Sfx.select(); }
    if (tapped('F3', 'Digit3')) { d.tech = !d.tech; Sfx.select(); }
    if (tapped('F4', 'Digit4')) { B.showBoxes = !B.showBoxes; Sfx.select(); }
    if (tapped('KeyR', 'Pad0Back')) resetPositions(B);
    const me = B.sides[0].point, dm = B.sides[1].point;
    // F5: awaken yourself instantly (skips the health/meter requirement) or drop back out
    if (tapped('F5', 'Digit5') && me.def.form) {
      if (me.form) { me.exitForm(); Game.popWorld(me.x, me.y - me.h - 30, 'FORM OFF', '#aab', 18); }
      else { me.move = null; me.state = 'stand'; if (Save.set.cutscenes === false) me.enterForm(); else Game.playCutscene(Cutscenes.transform(me), () => me.enterForm()); }
      Sfx.select();
    }
    // F6: awaken the dummy too
    if (tapped('F6', 'Digit6') && dm.def.form) { if (dm.form) dm.exitForm(); else dm.enterForm(); Sfx.select(); }
    // F7: your health 100 / 60 / 30 / 10 % (test comeback mechanics and the awaken gate)
    if (tapped('F7', 'Digit7')) { B.myHp = cycle([1, 0.6, 0.3, 0.1], B.myHp || 1); me.hp = me.red = Math.round(me.maxHp * B.myHp); Sfx.select(); }
    // F8: dummy health 100 / 50 / 15 / 5 % (test executes and low-HP effects)
    if (tapped('F8', 'Digit8')) { B.dumHp = cycle([1, 0.5, 0.15, 0.05], B.dumHp || 1); dm.hp = dm.red = Math.round(dm.maxHp * B.dumHp); Sfx.select(); }
    // F9: clear the damage log
    const D = B.dmgLog = B.dmgLog || { cur: 0, last: 0, best: 0, total: 0, hits: 0 };
    if (tapped('F9', 'Digit9')) { Object.assign(D, { cur: 0, last: 0, best: 0, total: 0, hits: 0 }); Sfx.select(); }
    const cb = B.sides[0].combo;
    if (cb.dmg > D.cur) { D.total += cb.dmg - D.cur; D.cur = cb.dmg; D.hits = cb.hits; D.best = Math.max(D.best, D.cur); }
    else if (cb.dmg === 0 && D.cur > 0) { D.last = D.cur; D.lastHits = D.hits; D.cur = 0; }
  }
  tap(x, y) { if (Math.abs(x - W / 2) < 60 && y < 80) Input.pressed.add('Escape'); else if (this.opts.attract) Input.pressed.add('Enter'); }
  draw(c) {
    this.B.draw(c);
    if (this.opts.overlay) this.opts.overlay(c, this.B);
    if (this.opts.attract) { c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, H - 40, W, 40); bigText(c, 'DEMO — PRESS ANY KEY', W / 2, H - 20, 20, Math.sin(Game.t * 4) > 0 ? '#ffd35a' : '#fff'); }
  }
}
const cycle = (arr, v) => arr[(arr.indexOf(v) + 1) % arr.length];
function resetPositions(B) {
  const W0 = Arena.stage.width;
  B.sides.forEach((s, i) => { const f = s.point; f.reset(W0 / 2 + (i ? 200 : -200), i ? -1 : 1); f.state = 'stand'; f.hp = f.maxHp; f.red = f.maxHp; });
  Combat.clear(); Cam.reset(W0 / 2); Sfx.select();
}

// ---------- pause ----------
class PauseScreen {
  constructor(bs) {
    this.bs = bs; this.i = 0;
    const B = bs.B, d = B.dummy;
    const it = [{ label: 'RESUME', act: () => UI.pop() }];
    if (bs.opts.pauseItems) it.push(...bs.opts.pauseItems(bs));
    it.push({ label: 'MOVE LIST', act: () => UI.push(new MoveListScreen(B.sides[0].point.def, B.sides[0].point)) });
    if (B.training) {
      it.push({ label: () => 'DUMMY ACTION: ' + d.action.toUpperCase(), act: () => { d.action = cycle(['stand', 'crouch', 'jump', 'cpu'], d.action); } });
      it.push({ label: () => 'DUMMY GUARD: ' + d.guard.toUpperCase(), act: () => { d.guard = cycle(['none', 'all', 'after', 'random'], d.guard); } });
      it.push({ label: () => 'DUMMY TECH: ' + (d.tech ? 'ON' : 'OFF'), act: () => { d.tech = !d.tech; } });
      it.push({ label: () => 'INFINITE METER: ' + (d.meter ? 'ON' : 'OFF'), act: () => { d.meter = !d.meter; } });
      it.push({ label: () => 'HITBOXES: ' + (B.showBoxes ? 'ON' : 'OFF'), act: () => { B.showBoxes = !B.showBoxes; } });
      it.push({ label: 'RESET POSITIONS', act: () => { resetPositions(B); UI.pop(); } });
    }
    if (bs.opts.mkCfg && !B.training) it.push({ label: 'RESTART MATCH', act: () => { UI.pop(); bs.restart(); } });
    it.push({ label: 'CONTROLS', act: () => UI.push(new HowToScreen()) });
    it.push({ label: 'SETTINGS', act: () => UI.push(settingsMenu()) });
    it.push({ label: 'QUIT', act: () => { Game.laters = []; Game.banner = null; Game.battle = null; Game.fx.clear(); Combat.clear(); UI.pop(); UI.pop(); if (bs.opts.onQuit) bs.opts.onQuit(); } });
    this.items = it;
  }
  enter() { Sfx.tone(440, 0.1, 'sine', 0.08, 330); }
  update() {
    const n = this.items.length;
    if (nav('up')) { this.i = (this.i + n - 1) % n; Sfx.select(); }
    if (nav('down')) { this.i = (this.i + 1) % n; Sfx.select(); }
    if (nav('ok')) { Sfx.confirm(); this.items[this.i].act(); }
    else if (tapped('Escape', 'Pad0Start', 'Pad1Start', 'Backspace', 'Pad0B')) UI.pop();
  }
  rect(i) { return { x: W / 2 - 200, y: 150 + i * 42, w: 400, h: 36 }; }
  hover(x, y) { this.items.forEach((it, i) => { const r = this.rect(i); if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) this.i = i; }); }
  tap(x, y, mouse) { this.items.forEach((it, i) => { const r = this.rect(i); if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) { if (mouse || this.i === i) { this.i = i; Sfx.confirm(); it.act(); } else this.i = i; } }); }
  draw(c) {
    this.bs.B.draw(c);
    c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(0, 0, W, H);
    bigText(c, 'PAUSED', W / 2, 100, 56, '#ffd35a', '#000');
    this.items.forEach((it, i) => {
      const r = this.rect(i), on = i === this.i;
      c.fillStyle = on ? 'rgba(255,211,90,0.25)' : 'rgba(255,255,255,0.06)'; roundRect(c, r.x, r.y, r.w, r.h, 8); c.fill();
      bigText(c, typeof it.label === 'function' ? it.label() : it.label, W / 2, r.y + r.h / 2, 20, on ? '#ffd35a' : '#fff');
    });
    const f = this.bs.B.sides[0].point;
    c.drawImage(portrait(f.def, 160, { form: f.form, alt: f.alt }), 60, 150, 160, 160);
    wrapText(c, f.def.passive[0] + ': ' + f.def.passive[1], 60, 330, 300, 18, 13, '#ffd35a');
  }
}

// ---------- move list ----------
class MoveListScreen {
  constructor(d, f) { this.d = d; this.f = f; this.scroll = 0; }
  update() {
    if (nav('up')) this.scroll = Math.max(0, this.scroll - 1);
    if (nav('down')) this.scroll++;
    if (nav('left') || nav('right')) { const i = ROSTER.indexOf(this.d); this.d = ROSTER[(i + (nav('left') ? -1 : 1) + ROSTER.length) % ROSTER.length]; }
    if (nav('back') || nav('ok') || tapped('Escape')) UI.pop();
  }
  tap() { UI.pop(); }
  rows() {
    const d = this.d, R = [];
    R.push(['PASSIVE', d.passive[0], d.passive[1], '#ffd35a']);
    R.push(['J J J J', 'Auto Combo', 'Jab › Cross › Roundhouse › Launcher. Press J repeatedly.', '#fff']);
    R.push(['↓ + L', 'Launcher', 'Sends them skyward. Jump or Super Dash to follow.', '#fff']);
    R.push(['air J J J', 'Air Auto Combo', 'Jab › Kick › Hammer (knocks down).', '#fff']);
    R.push(['air ↓ + L', 'Spike', 'Ground bounce. Keeps combos going.', '#fff']);
    R.push(['← or → + L (close)', 'Throw', 'Beats blocking. Tech by throwing back.', '#fff']);
    for (const slot of ['5S', '6S', '4S', '2S', 'jS']) { const m = d.moves[slot]; if (m) R.push([SLOT_INPUT[slot], m.name, m.desc || '', '#9cf']); }
    R.push(['O', 'SUPER · ' + d.super.name, (d.super.desc || '') + '  (1 bar)', '#5ad8ff']);
    R.push(['↓ + O  or  P', 'ULTIMATE · ' + d.ult.name, (d.ult.desc || '') + '  (3 bars, cinematic only if it connects)', '#ff9a6a']);
    if (d.form) {
      const F = d.form;
      R.push([F.manual === false ? 'REVIVE' : 'U', 'AWAKEN · ' + F.name, (F.desc || '') + (F.manual === false ? '' : `  (${Math.min(METER_MAX, (F.cost ?? 200) + 100) / 100} bars, below ${Math.round((F.hpGate ?? 0.6) * 100)}% HP${F.timed ? ', ' + F.timed + 's' : ', permanent for the round'})`), '#b9f']);
      if (F.moves) for (const [slot, m] of Object.entries(F.moves)) R.push(['AWAKENED ' + SLOT_INPUT[slot], m.name, m.desc || '', '#b9f']);
      if (F.super) R.push(['AWAKENED O', F.super.name, F.super.desc || '', '#b9f']);
    }
    R.push(['K + L', 'Vanish', 'Teleport behind the foe (1 bar).', '#ccc']);
    R.push(['Space', 'Super Dash', 'Homing dash that flies over projectiles.', '#ccc']);
    R.push(['B', 'Sparking Blast', 'Once per match: breaks combos, boosts damage & speed.', '#ccc']);
    R.push(['C (hold)', 'Ki Charge', 'Build meter. Leaves you open.', '#ccc']);
    R.push(['Q / E', 'Assist · hold to Tag', '3v3 only.', '#ccc']);
    return R;
  }
  draw(c) {
    c.fillStyle = 'rgba(6,5,16,0.96)'; c.fillRect(0, 0, W, H);
    const d = this.d;
    c.drawImage(portrait(d, 160, { expr: 'grin' }), 40, 30, 150, 150);
    bigText(c, d.name + ' — MOVE LIST', 210, 70, 38, d.color, '#000', 'left');
    smallText(c, d.title + ' · ' + d.role, 212, 104, 15, '#ccd');
    const R = this.rows(); this.scroll = Math.min(this.scroll, Math.max(0, R.length - 13));
    R.slice(this.scroll, this.scroll + 13).forEach(([inp, name, desc, col], i) => {
      const y = 200 + i * 38;
      c.fillStyle = i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)'; c.fillRect(40, y - 17, W - 80, 36);
      smallText(c, inp, 56, y, 14, '#ffd35a');
      smallText(c, name, 250, y, 15, col);
      smallText(c, desc.length > 90 ? desc.slice(0, 88) + '…' : desc, 560, y, 12.5, '#bbc');
    });
    smallText(c, '↑↓ scroll · ←→ other fighters · ESC back', W / 2, H - 16, 12, '#889', 'center');
  }
}

// ============================================================
//  RESULTS
// ============================================================
function recordMatch(B, r) {
  const R = Save.rec; R.matches = (R.matches || 0) + 1;
  B.sides.forEach(s => s.members.forEach(f => { if (f.ctrl.startsWith('human')) { Save.bumpMap('played', f.def.id); if (r.winner === s.idx) Save.bumpMap('wins', f.def.id); } }));
  const human = B.sides.find(s => s.members.some(f => f.ctrl === 'human1'));
  if (human && r.winner === human.idx) {
    Ach.unlock('first_win');
    if (B.team) { Save.bump('teamWins'); Ach.unlock('team'); const alive = human.alive(); if (alive.length === 1 && alive[0].hp < alive[0].maxHp * 0.1) Ach.unlock('clutch'); }
    if (B.stats.perfect[human.idx]) Save.bump('perfects');
  }
  if (human) R.counters = (R.counters || 0) + B.stats.counters[human.idx];
  Ach.check(); Save.save();
}
function rankFor(B, idx) {
  const s = B.stats, t = Math.max(1, (performance.now() - s.start) / 1000);
  let score = s.dmg[idx] / Math.max(1, s.dmg[1 - idx] + 400) * 40 + s.maxCombo[idx] * 2 + s.ults[idx] * 10 + s.counters[idx] + (s.perfect[idx] ? 30 : 0) - t / 30;
  return score > 90 ? 'S' : score > 65 ? 'A' : score > 40 ? 'B' : score > 20 ? 'C' : 'D';
}
class ResultsScreen {
  // opts: { title, items:[{label, act}], humanIdx }
  constructor(B, r, opts = {}) {
    this.B = B; this.r = r; this.opts = opts; this.i = 0; this.t = 0;
    const s = B.sides[r.winner] || null;
    this.winner = s ? s.point : null;
    this.items = opts.items || [{ label: 'CONTINUE', act: () => UI.pop() }];
    this.rank = rankFor(B, opts.humanIdx || 0);
  }
  enter() { Music.play('victory'); }
  update(dt) {
    this.t += dt; if (this.t < 0.6) return;
    const n = this.items.length;
    if (nav('up') || nav('left')) { this.i = (this.i + n - 1) % n; Sfx.select(); }
    if (nav('down') || nav('right')) { this.i = (this.i + 1) % n; Sfx.select(); }
    if (nav('ok')) { Sfx.confirm(); this.items[this.i].act(); }
  }
  rect(i) { const w = 260; return { x: W / 2 - (this.items.length * (w + 16)) / 2 + i * (w + 16), y: H - 80, w, h: 50 }; }
  hover(x, y) { this.items.forEach((it, i) => { const r = this.rect(i); if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) this.i = i; }); }
  tap(x, y, mouse) { if (this.t < 0.6) return; this.items.forEach((it, i) => { const r = this.rect(i); if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) { if (mouse || this.i === i) { this.i = i; this.items[i].act(); } else this.i = i; } }); }
  draw(c) {
    const B = this.B, w = this.winner;
    drawBackdrop(c, Arena.stage, Game.t, 0.45);
    const k = ease.out(Math.min(1, this.t * 2));
    if (w) {
      c.save(); c.globalAlpha = k;
      c.drawImage(portrait(w.def, 320, { form: w.form, alt: w.alt, expr: 'grin' }), lerp(-300, 20, k), 60, 380, 380);
      drawModel(c, w.def, 520, 560, 2.6, 1, 'victory', Game.t, w.form, w.alt);
      c.restore();
      bigText(c, (this.opts.title || (w.side.idx === 0 ? 'PLAYER 1 WINS' : (B.sides[1].point.ctrl === 'human2' ? 'PLAYER 2 WINS' : 'CPU WINS'))), W - 330, 70, 42, '#ffd35a', '#000');
      bigText(c, w.def.name, W - 330, 118, 30, w.def.color, '#000');
      if (this.r.quote) { panel(c, 60, 450, 560, 80, 'rgba(255,255,255,0.9)'); const n = Math.floor(this.t * 40); wrapText(c, '“' + this.r.quote.slice(0, n) + '”', 80, 476, 520, 22, 17, '#111'); }
    } else bigText(c, this.opts.title || 'DRAW', W / 2, 100, 60, '#fff', '#000');
    // stats
    const s = B.stats, px = W - 560, py = 160;
    panel(c, px, py, 480, 250, 'rgba(8,6,20,0.85)', '#444');
    const rows = [['Damage dealt', Math.round(s.dmg[0]), Math.round(s.dmg[1])], ['Hits landed', s.hits[0], s.hits[1]], ['Best combo', s.maxCombo[0], s.maxCombo[1]], ['Ultimates landed', s.ults[0], s.ults[1]], ['Counter hits', s.counters[0], s.counters[1]], ['Perfect', s.perfect[0] ? 'YES' : '-', s.perfect[1] ? 'YES' : '-']];
    smallText(c, 'P1', px + 330, py + 24, 14, '#ffd35a', 'center'); smallText(c, 'P2 / CPU', px + 430, py + 24, 14, '#5ad8ff', 'center');
    rows.forEach(([a, b, d], i) => { const y = py + 56 + i * 30; smallText(c, a, px + 20, y, 15, '#ccd'); smallText(c, String(b), px + 330, y, 16, '#fff', 'center'); smallText(c, String(d), px + 430, y, 16, '#fff', 'center'); });
    smallText(c, 'Match time ' + fmtTime((performance.now() - s.start) / 1000), px + 20, py + 236, 13, '#99a');
    // rank
    const rk = this.rank, rc = { S: '#ffd35a', A: '#ff9a6a', B: '#5ad8ff', C: '#9f9', D: '#aaa' }[rk];
    c.save(); c.translate(W - 110, 470); const sc = lerp(3, 1, ease.out(seg(this.t, 0.3, 0.6))); c.scale(sc, sc); bigText(c, rk, 0, 0, 110, rc, '#000'); c.restore();
    smallText(c, 'RANK', W - 110, 540, 14, '#ccd', 'center');
    if (this.opts.extra) this.opts.extra(c);
    this.items.forEach((it, i) => { const r = this.rect(i), on = i === this.i; c.fillStyle = on ? 'rgba(255,211,90,0.3)' : 'rgba(0,0,0,0.6)'; roundRect(c, r.x, r.y, r.w, r.h, 10); c.fill(); if (on) { c.strokeStyle = '#ffd35a'; c.lineWidth = 2; c.stroke(); } bigText(c, it.label, r.x + r.w / 2, r.y + r.h / 2, 20, on ? '#ffd35a' : '#fff'); });
  }
}

// ============================================================
//  STORY SCENES — visual-novel dialogue with portraits + typewriter
// ============================================================
class StoryScene {
  // lines: [[id|'n', text]], opts: { stage, title, onDone, music }
  constructor(lines, opts = {}) {
    this.lines = lines; this.opts = opts; this.i = 0; this.t = 0; this.chars = 0; this.titleT = opts.title ? 2.2 : 0;
    this.stage = typeof opts.stage === 'string' ? stageById(opts.stage) : (opts.stage || STAGES[0]);
    this.slots = { L: null, R: null }; this.active = null; this.shake = 0;
    this.advance(0);
  }
  enter() { Arena.load(this.stage); Music.play(this.opts.music || 'story'); }
  resume() { this.enter(); }
  advance(i) {
    this.i = i; this.chars = 0;
    const l = this.lines[i]; if (!l) return;
    const d = l[0] !== 'n' && charById(l[0]);
    if (d) {
      const side = this.slots.L === d ? 'L' : this.slots.R === d ? 'R' : (d.side === 'VILLAIN' ? 'R' : 'L');
      // don't put two different speakers in the same slot if the other one is free and the speaker changed recently
      if (this.slots[side] && this.slots[side] !== d && !this.slots[side === 'L' ? 'R' : 'L']) this.slots[side === 'L' ? 'R' : 'L'] = d;
      else this.slots[side] = d;
      this.active = d; this.enterT = 0;
      if (/!/.test(l[1])) this.shake = 8;
    } else this.active = null;
  }
  exprFor(text) { return /[!]{1}/.test(text) ? (/\?!|!\?/.test(text) ? 'shout' : 'angry') : /\.\.\./.test(text) ? 'calm' : /heh|ha|hah|lol|:\)/i.test(text) ? 'grin' : undefined; }
  finish() { const f = this.opts.onDone; if (f) f(); else UI.pop(); }
  update(dt) {
    this.t += dt; if (this.titleT > 0) { this.titleT -= dt; if (nav('ok')) this.titleT = 0; return; }
    const l = this.lines[this.i]; if (!l) { this.finish(); return; }
    this.chars += dt * 55; this.enterT = (this.enterT || 0) + dt; if (this.shake > 0) this.shake -= dt * 30;
    if (this.chars > 1 && this.chars < l[1].length + 2 && Math.floor(this.chars) % 3 === 0 && Math.floor(this.chars - dt * 55) % 3 !== 0) Sfx.tone(this.active ? 520 + (this.active.id.charCodeAt(0) % 12) * 30 : 300, 0.03, 'square', 0.02);
    if (nav('ok')) {
      if (this.chars < l[1].length) this.chars = l[1].length;
      else { this.advance(this.i + 1); if (this.i >= this.lines.length) this.finish(); }
    } else if (tapped('Escape', 'Pad0Start')) this.finish();
  }
  tap() { Input.pressed.add('Enter'); }
  draw(c) {
    drawBackdrop(c, this.stage, this.t * 0.5 + 3, 0.35);
    const l = this.lines[this.i];
    // full-body models on the ground
    for (const side of ['L', 'R']) {
      const d = this.slots[side]; if (!d) continue;
      const on = d === this.active, x = side === 'L' ? 300 : W - 300;
      c.save(); c.globalAlpha = on ? 1 : 0.5;
      if (!on) c.filter = 'brightness(0.5)';
      drawModel(c, d, x + (on && this.shake > 0 ? Math.sin(this.t * 80) * this.shake : 0), H - 150, 2.4, side === 'L' ? 1 : -1, on && this.enterT < 0.5 ? 'taunt' : 'idle', this.t, false, 0);
      c.restore();
    }
    if (l) {
      const bx = 60, by = H - 190, bw = W - 120, bh = 160;
      const col = this.active ? this.active.color : '#ccc';
      panel(c, bx, by, bw, bh, 'rgba(8,6,20,0.9)', col);
      const text = l[1].slice(0, Math.floor(this.chars));
      if (this.active) {
        const d = this.active, L = this.slots.L === d;
        const img = portrait(d, 160, { expr: this.exprFor(l[1]) });
        const px = L ? bx + 10 : bx + bw - 150;
        c.drawImage(img, px, by - 40, 140, 140);
        c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(px, by - 40, 140, 140);
        c.fillStyle = col; roundRect(c, L ? bx + 160 : bx + bw - 160 - 220, by - 18, 220, 32, 6); c.fill();
        bigText(c, d.name, L ? bx + 270 : bx + bw - 270, by - 2, 20, '#000');
        wrapText(c, text, L ? bx + 170 : bx + 30, by + 44, bw - 200, 26, 20, '#fff');
      } else {
        c.font = 'italic 20px Georgia, serif';
        wrapText(c, text, bx + 40, by + 50, bw - 80, 28, 20, '#e8dcc0', 'italic 20px Georgia, serif');
      }
      if (this.chars >= l[1].length && Math.sin(Game.t * 6) > 0) bigText(c, '▼', bx + bw - 30, by + bh - 22, 18, '#ffd35a');
    }
    smallText(c, 'ENTER / TAP next · ESC skip scene', W - 20, 24, 12, 'rgba(255,255,255,0.6)', 'right');
    if (this.titleT > 0) {
      const a = Math.min(1, this.titleT * 2, (2.2 - this.titleT) * 3);
      c.fillStyle = `rgba(0,0,0,${0.85 * a})`; c.fillRect(0, 0, W, H);
      c.globalAlpha = a; bigText(c, this.opts.title, W / 2, H / 2, 54, '#ffd35a', '#000'); c.globalAlpha = 1;
    }
  }
}

// ============================================================
//  ARCADE CARD — ladder preview between fights
// ============================================================
class ArcadeCard {
  constructor(player, ladder, idx, onGo, note) { this.player = player; this.ladder = ladder; this.idx = idx; this.onGo = onGo; this.t = 0; this.note = note; }
  enter() { Music.play('select'); }
  update(dt) { this.t += dt; if (this.t > 0.5 && nav('ok')) { Sfx.confirm(); this.onGo(); } else if (nav('back')) { UI.pop(); } }
  tap() { if (this.t > 0.5) Input.pressed.add('Enter'); }
  draw(c) {
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0b0a1e'); g.addColorStop(1, '#3a1030'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    bigText(c, 'ARCADE', W / 2, 50, 44, '#ffd35a', '#000');
    const p = this.player[0].def;
    c.drawImage(portrait(p, 160, { alt: this.player[0].alt }), 60, 120, 200, 200);
    bigText(c, p.name, 160, 350, 26, p.color, '#000');
    const n = this.ladder.length;
    this.ladder.forEach((step, i) => {
      const x = 320 + i * ((W - 400) / Math.max(1, n - 1)) * 0.95, y = 220 + Math.sin(i * 1.3) * 30;
      const d = step.team[0].def, done = i < this.idx, cur = i === this.idx;
      c.globalAlpha = done ? 0.35 : 1;
      c.drawImage(portrait(d, 96, { expr: cur ? 'angry' : undefined }), x - 40, y - 40, 80, 80);
      c.strokeStyle = cur ? '#ffd35a' : step.boss ? '#ff4a4a' : step.rival ? '#b36bff' : '#555'; c.lineWidth = cur ? 5 : 3; c.strokeRect(x - 40, y - 40, 80, 80);
      if (done) bigText(c, '✕', x, y, 70, '#ff4a4a');
      c.globalAlpha = 1;
      smallText(c, step.boss ? 'BOSS' : step.rival ? 'RIVAL' : 'STAGE ' + (i + 1), x, y + 56, 12, step.boss ? '#ff6a6a' : step.rival ? '#c9f' : '#ccd', 'center');
    });
    const cur = this.ladder[this.idx];
    if (cur) {
      panel(c, 320, 400, W - 380, 200, 'rgba(8,6,20,0.85)', cur.boss ? '#ff4a4a' : '#ffd35a');
      bigText(c, 'NEXT: ' + cur.team.map(m => m.def.name).join(' · '), 350, 440, 28, cur.team[0].def.color, '#000', 'left');
      smallText(c, (cur.stage.name) + ' · CPU ' + ['', 'EASY', 'NORMAL', 'HARD', 'NIGHTMARE'][cur.team[0].level] + (cur.team[0].hpMult > 1 ? ' · HEALTH x' + cur.team[0].hpMult : '') + (cur.team[0].form ? ' · ALREADY AWAKENED' : ''), 352, 472, 15, '#ccd');
      wrapText(c, '“' + cur.team[0].def.quote + '”', 352, 510, W - 440, 22, 17, '#dde');
      if (this.note) smallText(c, this.note, 352, 575, 14, '#ffd35a');
    }
    if (Math.sin(Game.t * 5) > -0.3) bigText(c, 'PRESS ENTER TO FIGHT', W / 2, H - 50, 26, '#fff', '#000');
  }
}

// ============================================================
//  MODES
// ============================================================
function battleCfg(teams, stage, extra = {}) { return Object.assign({ teams, stage: typeof stage === 'string' ? stageById(stage) : stage }, extra); }

const Modes = {
  // ---------------- VERSUS ----------------
  versus(teamSize, players) {
    const ctrlA = players === 0 ? 'cpu' : 'human1', ctrlB = players === 2 ? 'human2' : 'cpu';
    const sel = new SelectScreen({ title: players === 0 ? 'CPU VS CPU — PICK BOTH SIDES' : teamSize > 1 ? 'TEAM BATTLE' : 'VERSUS', teamSize, players: players === 2 || players === 0 ? 2 : 1, onDone: teams => {
      UI.push(new StageSelectScreen(stage => {
        const mk = () => battleCfg([teams[0].map(p => member(p.def, ctrlA, { alt: p.alt, level: cpuLevel() })), teams[1].map(p => member(p.def, ctrlB, { alt: p.alt }))], stage);
        const opts = { mkCfg: mk, vsSplash: true, onQuit: () => UI.pop(), onEnd: (r, B) => UI.replace(new ResultsScreen(B, r, { items: [
          { label: 'REMATCH', act: () => UI.replace(new BattleScreen(mk(), Object.assign({}, opts, { vsSplash: false }))) },
          { label: 'CHARACTER SELECT', act: () => { UI.pop(); UI.pop(); } },
          { label: 'MAIN MENU', act: () => { UI.pop(); UI.pop(); UI.pop(); } },
        ] })) };
        UI.push(new BattleScreen(mk(), opts));
      }));
    } });
    UI.push(sel);
  },

  // ---------------- ARCADE ----------------
  arcade(teamSize) {
    UI.push(new SelectScreen({ title: teamSize > 1 ? '3v3 ARCADE' : 'ARCADE', teamSize, players: 1, opponent: false, onDone: teams => {
      const mine = teams[0].map(p => member(p.def, 'human1', { alt: p.alt }));
      const used = mine.map(m => m.def), n = teamSize > 1 ? 6 : 8, ladder = [];
      const base = Save.set.cpu || 2;
      for (let i = 0; i < n - 2; i++) {
        const lv = clamp(Math.round(base - 1 + i * 2 / (n - 2)), 1, 4);
        const opp = others(used.concat(ladder.flatMap(s => s.team.map(m => m.def))), teamSize).map(d => member(d, 'cpu', { level: lv, alt: 0 }));
        ladder.push({ team: opp, stage: pick(STAGES) });
      }
      // rival
      const me = mine[0].def;
      const rk = Object.keys(RIVALS).find(k => k.split('|').includes(me.id));
      const rivalDef = rk ? charById(rk.split('|').find(x => x !== me.id) || 'kira') : charById(me.id === 'kira' ? 'eric' : 'kira');
      const rt = [rivalDef].concat(others(used.concat([rivalDef]), teamSize - 1)).map(d => member(d, 'cpu', { level: clamp(base + 1, 1, 4) }));
      ladder.push({ team: rt, stage: pick(STAGES), rival: true });
      // boss
      const bossId = me.id === 'vex' ? 'omega' : 'vex';
      const bt = [charById(bossId)].concat(teamSize > 1 ? [charById('luna'), charById('omega') === charById(bossId) ? charById('abyss') : charById('omega')] : []).map(d => member(d, 'cpu', { level: clamp(base + 1, 1, 4), hpMult: teamSize > 1 ? 1.2 : 1.5, form: true }));
      ladder.push({ team: bt, stage: stageById('void'), boss: true });
      let idx = 0, continues = 0;
      const t0 = performance.now();
      const next = () => {
        if (idx >= ladder.length) return ending();
        UI.replace(new ArcadeCard(mine, ladder, idx, fight, continues ? 'Continues used: ' + continues : ''));
      };
      const fight = () => {
        const step = ladder[idx];
        const mk = () => battleCfg([mine.map(m => Object.assign({}, m)), step.team.map(m => Object.assign({}, m))], step.stage, { boss: step.boss, music: step.boss ? 'boss' : undefined });
        UI.replace(new BattleScreen(mk(), { mkCfg: mk, vsSplash: true, title: step.boss ? 'FINAL BOSS' : step.rival ? 'RIVAL BATTLE' : 'STAGE ' + (idx + 1), onQuit: () => {}, onEnd: (r, B) => {
          if (r.winner === 0) {
            if (step.rival) Ach.unlock('rival');
            idx++;
            UI.replace(new ResultsScreen(B, r, { items: [{ label: idx >= ladder.length ? 'ENDING' : 'NEXT FIGHT', act: next }] }));
          } else {
            UI.replace(new ResultsScreen(B, r, { title: 'DEFEAT', items: [{ label: 'CONTINUE', act: () => { continues++; fight(); } }, { label: 'GIVE UP', act: () => UI.pop() }] }));
          }
        } }));
        // BattleScreen.enter plays the VS splash
      };
      const ending = () => {
        const secs = (performance.now() - t0) / 1000;
        Save.rec.arcade[me.id] = Math.max(Save.rec.arcade[me.id] || 0, Save.set.cpu || 2);
        Ach.unlock('arcade'); if ((Save.set.cpu || 2) >= 3) Ach.unlock('arcade_hard'); Save.save();
        const lines = [['n', 'ARCADE CLEAR — ' + me.name + '  (' + fmtTime(secs) + (continues ? ', ' + continues + ' continues' : ', no continues') + ')'], [me.id, me.quote], ['n', me.ending || 'And the city, somehow, still stands.']];
        mine.slice(1).forEach(m => lines.push([m.def.id, pick(m.def.lines.win || ['We did it.'])]));
        UI.replace(new StoryScene(lines, { stage: pick(STAGES), title: 'ENDING · ' + me.name, music: 'victory', onDone: () => UI.pop() }));
      };
      UI.push({ update() { }, draw() { } }); // placeholder replaced by next()
      next();
    } }));
  },

  // ---------------- STORY ----------------
  storyMenu() {
    const done = () => Save.rec.story || 0;
    const items = STORY.map((ch, i) => ({
      label: () => (i <= done() && (i < 13 || done() >= 13) ? '' : '🔒 ') + ch.title,
      desc: () => i > done() || (i === 13 && done() < 13) ? (i === 13 ? 'Beat the story to unlock the secret chapter.' : 'Clear the previous chapter to unlock.') : (ch.fight ? 'You: ' + ch.fight.p1.map(id => charById(id).name).join(', ') + '  vs  ' + ch.fight.p2.map(id => charById(id).name).join(', ') : 'Story scene.') + (i < done() ? '  ✓ cleared' : ''),
      act: () => { if (i > done() || (i === 13 && done() < 13)) { Sfx.tone(160, 0.15, 'square', 0.06); return; } Modes.chapter(i); },
    }));
    const m = new MenuScreen('STORY: MOONFALL', items, { y0: 130, music: 'story' });
    m.i = Math.min(done(), STORY.length - 1);
    UI.push(m);
  },
  chapter(i) {
    const ch = STORY[i];
    const complete = () => {
      Save.rec.story = Math.max(Save.rec.story || 0, i + 1);
      if (i >= 11) Ach.unlock('story');
      Save.save(); UI.pop();
      const top = UI.top(); if (top instanceof MenuScreen) top.i = Math.min(i + 1, STORY.length - 1);
    };
    const fight = () => {
      const F = ch.fight;
      const mk = () => battleCfg([F.p1.map(id => member(id, 'human1', { level: 2 })), F.p2.map((id, k) => member(id, 'cpu', { level: F.level, hpMult: F.hpMult || (F.boss ? 1.3 : 1), alt: F.p2.indexOf(id) !== k ? k : 0, form: F.boss && !F.form2 && id === F.p2[0] && i >= 10 }))], ch.stage, { boss: F.boss, music: F.boss ? 'boss' : undefined, rounds: 1, roundsToWin: 1 });
      let triggered = false;
      UI.replace(new BattleScreen(mk(), { mkCfg: mk, vsSplash: true, title: ch.title.toUpperCase(),
        tick: B => { if (!F.form2 || triggered) return; const b = B.sides[1].point; if (b.hp < b.maxHp * 0.55 && B.state === 'fight' && b.state !== 'move' && b.state !== 'hit') { triggered = true; b.side.meter = Math.max(b.side.meter, METER_MAX); Game.announce('THE ENTITY AWAKENS', '#b36bff', 90); B.tryTransform(b); } },
        onEnd: (r, B) => {
          if (r.winner === 0) UI.replace(new StoryScene(ch.post, { stage: ch.stage, onDone: complete }));
          else UI.replace(new ResultsScreen(B, r, { title: 'DEFEAT', items: [{ label: 'RETRY', act: fight }, { label: 'STORY MENU', act: () => UI.pop() }] }));
        } }));
    };
    UI.push(new StoryScene(ch.pre, { stage: ch.stage, title: ch.title, onDone: () => ch.fight ? fight() : (UI.replace(new StoryScene([['n', '— END OF CHAPTER —']], { stage: ch.stage, onDone: complete }))) }));
  },

  // ---------------- TRAINING ----------------
  training() {
    UI.push(new SelectScreen({ title: 'TRAINING — YOUR FIGHTER', teamSize: 1, players: 1, opponent: false, onDone: t1 => {
      UI.push(new SelectScreen({ title: 'TRAINING — DUMMY', teamSize: 1, players: 1, opponent: false, onDone: t2 => {
        UI.push(new StageSelectScreen(stage => {
          const mk = () => battleCfg([[member(t1[0][0].def, 'human1', { alt: t1[0][0].alt })], [member(t2[0][0].def, 'cpu', { alt: t2[0][0].def === t1[0][0].def ? 1 : 0 })]], stage, { training: true, intro: false });
          UI.push(new BattleScreen(mk(), { mkCfg: mk, onQuit: () => { UI.pop(); UI.pop(); } }));
        }));
      } }));
    } }));
  },

  // ---------------- TUTORIAL ----------------
  tutorial() {
    const L = TUTORIAL;
    const st = { i: 0, done: false, t: 0, cnt: 0, flags: {}, clearT: 0 };
    const mk = () => battleCfg([[member('eric', 'human1')], [member('titan', 'cpu', { level: 1 })]], 'metro', { training: true, intro: false });
    const setupLesson = B => {
      const les = L[st.i]; st.cnt = 0; st.flags = {}; st.t = 0; st.clearT = 0;
      B.dummy.action = les.dummy || 'stand'; B.dummy.guard = les.guard || 'none'; B.dummy.tech = false; B.dummy.meter = true;
      if (les.level) B.sides[1].point.level = les.level;
      resetPositions(B);
      if (les.init) les.init(B, st);
    };
    const bs = new BattleScreen(mk(), {
      setup: B => {
        B.onMove = (f, m) => { const les = L[st.i]; if (les && les.onMove) les.onMove(m, st, B); };
        B.onHit = (a, t, dmg) => { const les = L[st.i]; if (les && les.onHit && a.side.idx === 0) les.onHit(a, t, st, B); };
        setupLesson(B);
      },
      tick: B => {
        if (st.done) return;
        const les = L[st.i]; st.t++;
        if (st.clearT > 0) { if (--st.clearT === 0) { st.i++; if (st.i >= L.length) { st.done = true; Save.rec.tutorial = L.length; Ach.unlock('tutorial'); Save.save(); Game.announce('TUTORIAL COMPLETE!', '#ffd35a', 180); Game.later(3, () => { if (UI.top() === bs) UI.pop(); }); } else setupLesson(B); } return; }
        if (les.check && les.check(B, st)) st.flags.ok = true;
        if (st.flags.ok) { st.clearT = 70; Sfx.confirm(); Game.announce('CLEAR!', '#7f7', 60); Save.rec.tutorial = Math.max(Save.rec.tutorial || 0, st.i + 1); }
      },
      overlay: (c, B) => {
        const les = L[Math.min(st.i, L.length - 1)];
        panel(c, W / 2 - 360, 120, 720, 118, 'rgba(8,6,20,0.85)', '#ffd35a');
        smallText(c, `LESSON ${Math.min(st.i + 1, L.length)} / ${L.length}`, W / 2 - 340, 140, 13, '#ffd35a');
        bigText(c, les.title, W / 2 - 340, 166, 24, '#fff', '#000', 'left');
        wrapText(c, les.text, W / 2 - 340, 194, 680, 19, 15, '#dde');
        if (les.goal) { const g = les.goal(st, B); smallText(c, g, W / 2 + 340, 140, 13, '#7df', 'right'); }
        smallText(c, 'ESC: pause / skip lesson', W / 2 + 340, 226, 11, '#889', 'right');
      },
      pauseItems: () => [{ label: 'SKIP LESSON', act: () => { UI.pop(); st.flags.ok = true; } }, { label: 'RESTART LESSON', act: () => { UI.pop(); setupLesson(bs.B); } }],
    });
    UI.push(bs);
  },

  // ---------------- COMBO TRIALS ----------------
  trials() {
    UI.push(new SelectScreen({ title: 'COMBO TRIALS — CHOOSE A FIGHTER', teamSize: 1, players: 1, opponent: false, onDone: t => {
      const d = t[0][0].def, list = trialsFor(d);
      const st = { i: Object.keys(Save.rec.trials).filter(k => k.startsWith(d.id + ':')).length % list.length, seq: [], last: null, prog: 0, clearT: 0, idleT: 0 };
      const mk = () => battleCfg([[member(d, 'human1', { alt: t[0][0].alt })], [member('titan', 'cpu', { alt: 2 })]], 'colosseum', { training: true, intro: false });
      const opp = () => bs.B.sides[1].point;
      const check = () => {
        const tr = list[st.i]; let k = 0;
        for (const id of st.seq) if (id === tr.seq[k]) k++;
        st.prog = Math.max(st.prog, k);
        if (k >= tr.seq.length && st.last === tr.seq[tr.seq.length - 1] && !st.clearT) {
          st.clearT = 90; Save.rec.trials[d.id + ':' + st.i] = 1; Save.save(); Ach.check(); Sfx.confirm(); Game.announce('TRIAL CLEAR!', '#7f7', 70);
        }
      };
      const bs = new BattleScreen(mk(), {
        setup: B => {
          B.dummy.tech = false; B.dummy.guard = 'none';
          B.onMove = (f, m) => { st.last = m.id; if (opp().comboHits > 0) st.seq.push(m.id); };
          B.onHit = (a, t2) => {
            if (a.side.idx !== 0) return;
            const ultId = d.id + '_ult';
            if (t2.comboHits === 0 && st.last !== ultId) { st.seq = [st.last]; st.prog = 0; }
            else if (st.seq[st.seq.length - 1] !== st.last) st.seq.push(st.last);
            check();
          };
        },
        tick: B => {
          const o = opp();
          if (o.comboHits === 0 && o.state !== 'hit') { if (++st.idleT > 40) { st.seq = []; st.prog = 0; } } else st.idleT = 0;
          if (st.clearT > 0 && --st.clearT === 0) { st.i = (st.i + 1) % list.length; st.seq = []; st.prog = 0; resetPositions(B); }
        },
        overlay: c => {
          const tr = list[st.i], x = W - 330, y0 = 204;
          panel(c, x, y0, 310, 76 + tr.seq.length * 30, 'rgba(8,6,20,0.85)', '#ffd35a');
          smallText(c, `TRIAL ${st.i + 1}/${list.length}${Save.rec.trials[d.id + ':' + st.i] ? '  ✓' : ''}`, x + 14, y0 + 20, 13, '#ffd35a');
          bigText(c, tr.name, x + 14, y0 + 42, 20, '#fff', '#000', 'left');
          tr.seq.forEach((id, k) => { const on = k < st.prog; smallText(c, (on ? '✓ ' : (k + 1) + '. ') + moveLabel(d, id), x + 20, y0 + 72 + k * 30, 15, on ? '#7f7' : '#dde'); });
          const cleared = list.filter((_, k) => Save.rec.trials[d.id + ':' + k]).length;
          smallText(c, `${cleared}/${list.length} cleared · ESC for next / prev`, x + 14, y0 + 62 + tr.seq.length * 30, 11, '#99a');
        },
        pauseItems: () => [
          { label: 'NEXT TRIAL', act: () => { st.i = (st.i + 1) % list.length; st.seq = []; st.prog = 0; UI.pop(); } },
          { label: 'PREVIOUS TRIAL', act: () => { st.i = (st.i + list.length - 1) % list.length; st.seq = []; st.prog = 0; UI.pop(); } },
        ],
      });
      bs.B.sides[0].meter = METER_MAX;
      UI.push(bs);
    } }));
  },

  // ---------------- SURVIVAL ----------------
  survival() {
    UI.push(new SelectScreen({ title: 'SURVIVAL', teamSize: 1, players: 1, opponent: false, onDone: t => {
      const me = t[0][0]; let wins = 0, hpLeft = null, meter = 100; const seen = [me.def];
      const fight = () => {
        const opp = others(seen.slice(-20), 1)[0]; seen.push(opp);
        const lv = clamp(1 + Math.floor(wins / 3), 1, 4);
        const cfg = battleCfg([[member(me.def, 'human1', { alt: me.alt })], [member(opp, 'cpu', { level: lv, hpMult: 0.7 + Math.min(0.6, wins * 0.05) })]], pick(STAGES), { rounds: 1, roundsToWin: 1, time: 99 });
        const bs = new BattleScreen(cfg, { title: 'SURVIVAL · FIGHT ' + (wins + 1), vsSplash: wins === 0, onEnd: (r, B) => {
          const p = B.sides[0].point;
          if (r.winner === 0) {
            wins++; hpLeft = Math.min(p.maxHp, Math.max(p.hp, 1) + p.maxHp * 0.2); meter = B.sides[0].meter;
            if (wins >= 5) Ach.unlock('survival5'); if (wins >= 15) Ach.unlock('survival15');
            Save.rec.survival = Math.max(Save.rec.survival || 0, wins); Save.save();
            UI.replace(new ResultsScreen(B, r, { title: 'WIN STREAK: ' + wins, items: [{ label: 'NEXT FIGHT (+20% HP)', act: fight }, { label: 'CASH OUT', act: () => UI.pop() }] }));
          } else UI.replace(new ResultsScreen(B, r, { title: 'SURVIVED ' + wins + ' FIGHTS', items: [{ label: 'TRY AGAIN', act: () => { wins = 0; hpLeft = null; meter = 100; fight(); } }, { label: 'QUIT', act: () => UI.pop() }], extra: c => bigText(c, 'BEST: ' + Save.rec.survival, W - 330, 150, 20, '#ffd35a', '#000') }));
        }, overlay: c => smallText(c, 'SURVIVAL · STREAK ' + wins, W / 2, 112, 13, '#ffd35a', 'center') });
        const p = bs.B.sides[0].point; if (hpLeft) { p.hp = p.red = p.shownHp = Math.round(hpLeft); } bs.B.sides[0].meter = meter;
        UI.replace(bs);
      };
      UI.push({ update() { }, draw() { } }); fight();
    } }));
  },

  // ---------------- TIME ATTACK ----------------
  timeAttack() {
    UI.push(new SelectScreen({ title: 'TIME ATTACK', teamSize: 1, players: 1, opponent: false, onDone: t => {
      const me = t[0][0]; const opps = others([me.def], 5); let idx = 0, total = 0;
      const fight = () => {
        let fr = 0;
        const cfg = battleCfg([[member(me.def, 'human1', { alt: me.alt })], [member(opps[idx], 'cpu', { level: clamp(1 + idx, 1, 4), hpMult: 0.75 })]], pick(STAGES), { rounds: 1, roundsToWin: 1, time: 99, intro: false });
        UI.replace(new BattleScreen(cfg, { title: 'TIME ATTACK ' + (idx + 1) + '/5',
          tick: B => { if (B.state === 'fight') fr++; },
          overlay: c => { c.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(c, W / 2 - 90, 96, 180, 30, 8); c.fill(); bigText(c, fmtTime(total + fr / FPS), W / 2, 111, 20, '#7df'); },
          onEnd: (r, B) => {
            total += fr / FPS;
            if (r.winner === 0) {
              idx++;
              if (idx >= 5) {
                const best = Save.rec.timeAttack; if (!best || total < best) Save.rec.timeAttack = +total.toFixed(1);
                if (total < 240) Ach.unlock('timeattack'); Save.save();
                UI.replace(new ResultsScreen(B, r, { title: 'CLEAR · ' + fmtTime(total), items: [{ label: 'DONE', act: () => UI.pop() }], extra: c => bigText(c, 'BEST ' + fmtTime(Save.rec.timeAttack), W - 330, 150, 20, '#ffd35a', '#000') }));
              } else UI.replace(new ResultsScreen(B, r, { title: 'SPLIT ' + fmtTime(total), items: [{ label: 'NEXT', act: fight }] }));
            } else UI.replace(new ResultsScreen(B, r, { title: 'FAILED', items: [{ label: 'RETRY RUN', act: () => { idx = 0; total = 0; fight(); } }, { label: 'QUIT', act: () => UI.pop() }] }));
          } }));
      };
      UI.push({ update() { }, draw() { } }); fight();
    } }));
  },

  // ---------------- BOSS RUSH ----------------
  bossRush() {
    const BOSSES = [['titan', 'colosseum'], ['kael', 'magma'], ['abyss', 'harbor'], ['omega', 'neon'], ['eric', 'lunar'], ['vex', 'void']].filter(([id]) => charById(id));
    UI.push(new SelectScreen({ title: 'BOSS RUSH', teamSize: 1, players: 1, opponent: false, onDone: t => {
      const me = t[0][0]; let idx = 0; const list = BOSSES.filter(([id]) => id !== me.def.id).slice(0, 5);
      const fight = () => {
        const [id, stg] = list[idx];
        const cfg = battleCfg([[member(me.def, 'human1', { alt: me.alt })], [member(id, 'cpu', { level: clamp(2 + Math.floor(idx / 2), 1, 4), hpMult: 2, form: true, alt: id === me.def.id ? 1 : 0 })]], stg, { boss: true, rounds: 1, roundsToWin: 1, time: 150, music: 'boss' });
        UI.replace(new BattleScreen(cfg, { title: 'BOSS ' + (idx + 1) + ' / ' + list.length, vsSplash: true, onEnd: (r, B) => {
          if (r.winner === 0) {
            idx++;
            if (idx >= list.length) { Ach.unlock('bossrush'); Save.bump('bossRush'); Save.save(); UI.replace(new ResultsScreen(B, r, { title: 'BOSS RUSH CLEAR!', items: [{ label: 'DONE', act: () => UI.pop() }] })); }
            else { const p = B.sides[0].point; const keep = Math.min(p.maxHp, p.hp + p.maxHp * 0.35); UI.replace(new ResultsScreen(B, r, { title: 'GIANT DOWN', items: [{ label: 'NEXT GIANT', act: () => { fight(); const q = UI.top().B.sides[0].point; q.hp = q.red = q.shownHp = Math.round(keep); } }] })); }
          } else UI.replace(new ResultsScreen(B, r, { title: 'CRUSHED', items: [{ label: 'RETRY', act: fight }, { label: 'QUIT', act: () => UI.pop() }] }));
        } }));
      };
      UI.push({ update() { }, draw() { } }); fight();
    } }));
  },

  // ---------------- ATTRACT DEMO ----------------
  attract() {
    const [a, b] = others([], 2);
    const cfg = battleCfg([[member(a, 'cpu', { level: 3 })], [member(b, 'cpu', { level: 3 })]], pick(STAGES), { rounds: 1, roundsToWin: 1, time: 60 });
    UI.push(new BattleScreen(cfg, { attract: true, onEnd: () => UI.pop() }));
  },
};

// ---------- trials data ----------
function moveLabel(d, id) {
  const N = d.normals[id]; if (N) return { '5L': 'J (Jab)', '5L2': 'J (Cross)', '5M': 'K (Roundhouse)', '5H': 'L (Smash)', '2L': '↓J (Low Jab)', '2M': '↓K (Sweep)', '2H': '↓L (Launcher)', jL: 'air J', jM: 'air K', jH: 'air L', j2H: 'air ↓L (Spike)' }[id] || N.name;
  if (id === d.id + '_super' || id === d.id + '_fsuper') return 'O  ' + d.super.name;
  if (id === d.id + '_ult') return '↓O  ' + d.ult.name;
  const slot = id.slice(d.id.length + 1); const m = d.moves[slot];
  return m ? SLOT_INPUT[slot] + '  ' + m.name : id;
}
function trialsFor(d) {
  const S = ['5S', '6S', '2S', '4S'].filter(s => d.moves[s]);
  const sid = k => d.id + '_' + (S[k % Math.max(1, S.length)] || '5S');
  const finisher = d.ultLocked ? d.id + '_super' : d.id + '_ult';
  return [
    { name: 'Auto Combo', seq: ['5L', '5L2', '5M'] },
    { name: 'Lift Off', seq: ['5L', '5M', '2H'] },
    { name: 'Aerial Rave', seq: ['2H', 'jL', 'jM', 'jH'] },
    { name: 'Special Cancel', seq: ['5L', '5M', sid(0)] },
    { name: 'Low Road', seq: ['2L', '2M', sid(1)] },
    { name: 'Super Finish', seq: ['5M', sid(2), d.id + '_super'] },
    { name: 'Grand Finale', seq: ['5L', '5M', sid(0), finisher] },
  ];
}

// ---------- tutorial lessons ----------
const TUTORIAL = [
  { title: 'Movement', text: 'Walk with A / D (or the D-pad). Walk right up to Titan.', check: B => Math.abs(B.sides[0].point.x - B.sides[1].point.x) < 180 },
  { title: 'Jumps', text: 'Jump with W. Press W again in the air for a double jump. Tap ↓ then ↑ for a high Super Jump.', check: B => B.sides[0].point.jumps >= 2 },
  { title: 'Dashing', text: 'Double-tap forward (D D) or press Left Shift to dash. Dashes cover ground fast.', check: B => B.sides[0].point.state === 'dash' },
  { title: 'Blocking', text: 'Hold AWAY from the opponent to block high. Hold DOWN-AWAY to block lows. Block 3 attacks.', dummy: 'cpu', level: 1, init: (B, st) => { st.prevBlock = false; },
    check: (B, st) => { const b = B.sides[0].point.state === 'block'; if (b && !st.prevBlock) st.cnt++; st.prevBlock = b; B.sides[0].point.hp = B.sides[0].point.maxHp; return st.cnt >= 3; }, goal: st => `Blocked ${st.cnt}/3` },
  { title: 'Auto Combo', text: 'Mash J next to Titan: Jab › Cross › Roundhouse › Launcher. Land a 4-hit combo.', check: B => B.sides[0].combo.hits >= 4, goal: (st, B) => `Best: ${B.stats.maxCombo[0]} hits` },
  { title: 'Launcher', text: 'Press ↓ + L to launch the opponent into the air.', onHit: (a, t, st) => { if (a.move && a.move.id === '2H') st.flags.ok = true; } },
  { title: 'Air Combo', text: 'After ↓+L, press W to super-jump after them, then J J L in the air.', onHit: (a, t, st) => { if (a.move && a.move.air && a.move.kind === 'normal' && t.comboHits >= 2) st.flags.ok = true; } },
  { title: 'Specials', text: 'Press I for a special move. Add a direction (→ I, ← I, ↓ I) for different ones. Land any special.', onHit: (a, t, st) => { if (a.move && a.move.kind === 'special') st.flags.ok = true; else if (st.lastSpecial) st.flags.ok = true; }, onMove: (m, st) => { st.lastSpecial = m.kind === 'special'; } },
  { title: 'Super', text: 'Press O to spend 1 bar on a Super. Cancel a normal or special into it for a combo. Land a Super.', onHit: (a, t, st) => { if (a.move && a.move.kind === 'super') st.flags.ok = true; } },
  { title: 'Vanish', text: 'Press K + L together to teleport behind the foe (1 bar). Great for extending combos.', init: (B, st) => { st.v0 = Save.rec.vanishes || 0; }, check: (B, st) => (Save.rec.vanishes || 0) > st.v0 },
  { title: 'Super Dash', text: 'Press Space for a homing Super Dash. It flies through projectiles, but a well-timed ↓+L swats it.', check: B => B.sides[0].point.state === 'sdash' },
  { title: 'Awakening', text: 'Press U to transform: it needs you below 60% health and one bar more meter than listed. Most forms last the whole round; a few broken ones are timed.', check: B => B.sides[0].point.form },
  { title: 'Ultimate', text: 'Press ↓ + O (or P) with 3 bars. Ultimates can be blocked or dodged: the cinematic only plays if it connects. Combo into it!', check: B => B.stats.ults[0] > 0 },
  { title: 'Sparking Blast', text: 'Press B once per match to break out of a combo and power up. Use it now.', check: B => !!B.sides[0].point.spark || B.sides[0].sparkUsed },
];

// ============================================================
//  BOOT
// ============================================================
(function boot() {
  City.generate();
  Arena.load(STAGES[0]);
  UI.reset(new TitleScreen());
  requestAnimationFrame(t => { lastT = t; frame(t); });
})();
