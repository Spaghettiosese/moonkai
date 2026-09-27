// ============================================================
//  MOONKAI — game flow, combat resolution, HUD, menus, main loop
// ============================================================
const ROUND_TIME = 99, WINS_NEEDED = 2;
const MENU = ['ARCADE', 'VERSUS CPU', 'VERSUS 2 PLAYER', 'TRAINING', 'DIFFICULTY', 'HOW TO PLAY'];
const LEVEL_NAMES = ['', 'EASY', 'NORMAL', 'HARD'];

const Game = {
  state: 'title', t: 0, mode: 'cpu', cpuLevel: 2,
  p1: null, p2: null, projectiles: [], beams: [], hazards: [], texts: [], laters: [],
  fx: new ParticleSystem(2200), cutscene: null, shake: 0, hitstop: 0, slowmo: 1,
  menuIdx: 0, sel: [0, 1], ready: [false, false], stageIdx: 0, banner: null,
  round: 1, wins: [0, 0], timer: ROUND_TIME, roundOver: false, roundEndT: 0, introT: 0, paused: false, pauseIdx: 0,
  arcade: null, dummyFights: false, dummyBlock: false, stats: null,

  // ---------- helpers ----------
  later(d, fn) { this.laters.push({ t: d, fn }); },
  showBanner(text, color, dur = 1.2, size = 120) { this.banner = { text, color, t: 0, dur, size }; },
  popText(x, y, txt, color = '#fff', size = 24) { this.texts.push({ x, y, txt, color, size, t: 0 }); },
  playCutscene(cs, onEnd) { cs.t = 0; cs.onEnd = onEnd; cs.cueIdx = 0; cs.cues = (cs.cues || []).sort((a, b) => a[0] - b[0]); this.cutscene = cs; },
  endCutscene() { const cs = this.cutscene; this.cutscene = null; if (cs.onEnd) cs.onEnd(); },

  // ---------- match flow ----------
  startMatch(d1, d2, stage, lvl) {
    Arena.load(stage);
    const ctrl2 = this.mode === '2p' ? 'human2' : lvl === 4 ? 'boss' : 'cpu';
    this.p1 = new Fighter(d1, 0, 'human1');
    this.p2 = new Fighter(d2, 1, ctrl2, lvl || this.cpuLevel);
    if (lvl === 4) { this.p2.level = 4; this.p2.ult = 50; }
    this.p1.opp = this.p2; this.p2.opp = this.p1;
    this.wins = [0, 0]; this.round = 1;
    this.stats = { dmg: [0, 0], maxCombo: [0, 0], ults: [0, 0] };
    this.state = 'fight'; this.paused = false;
    this.startRound(true);
  },
  startRound(first) {
    this.projectiles = []; this.beams = []; this.hazards = []; this.texts = []; this.laters = [];
    this.fx.clear(); this.timer = ROUND_TIME; this.roundOver = false; this.slowmo = 1;
    this.p1.resetForRound(300, 1); this.p2.resetForRound(W - 300, -1);
    if (!first) Arena.load(Arena.stage);
    const go = () => { this.introT = 1.6; this.showBanner(this.round === 3 ? 'FINAL ROUND' : 'ROUND ' + this.round, '#fff', 1.0, 100); this.later(1.1, () => { this.showBanner('FIGHT!', '#ffd35a', 0.8, 140); Sfx.confirm(); }); };
    if (first) this.playCutscene(Cutscenes.versus(this.p1, this.p2), go); else go();
  },
  endRound(winner, reason) {
    if (this.roundOver) return;
    this.roundOver = true; this.roundEndT = 3; this.slowmo = 0.35;
    if (winner) this.wins[winner.slot]++;
    this.showBanner(reason, reason === 'K.O.' ? '#ff3b3b' : '#ffd35a', 2.4, 130);
    Sfx.ko();
    this.roundWinner = winner;
  },
  afterRound() {
    const w = this.wins;
    if (w[0] >= WINS_NEEDED || w[1] >= WINS_NEEDED) {
      this.matchWinner = w[0] >= WINS_NEEDED ? this.p1 : this.p2;
      this.state = 'result'; this.resultT = 0;
      return;
    }
    this.round++; this.startRound(false);
  },

  // ---------- arcade ----------
  startArcade(def) {
    const pool = CHARACTERS.filter(d => d !== def && d.id !== 'vex');
    const ladder = [];
    while (ladder.length < 5) { const d = pick(pool); if (!ladder.includes(d)) ladder.push(d); }
    const boss = def.id === 'vex' ? charById('kael') : charById('vex');
    ladder.push(boss);
    this.arcade = { player: def, ladder, idx: 0, levels: [1, 2, 2, 3, 3, 4] };
    this.state = 'story'; this.storyT = 0;
  },
  arcadeFight() {
    const A = this.arcade;
    this.startMatch(A.player, A.ladder[A.idx], A.idx === 5 ? STAGES[0] : pick(STAGES), A.levels[A.idx]);
  },

  // ---------- transforms / ultimates ----------
  triggerTransform(f) {
    f.act = null; f.vx = 0;
    this.playCutscene(Cutscenes.transform(f), () => f.enterForm());
  },
  triggerRevive(f) {
    f.act = null; f.vx = 0; f.hurtT = 0; f.status = {}; f.revived = true;
    this.projectiles = []; this.beams = [];
    this.playCutscene(Cutscenes.transform(f), () => {
      f.hp = Math.round(f.def.reviveHp * HP_SCALE); f.shownHp = f.hp; f.invuln = 1.5; f.y = GROUND; f.vy = 0; f.downT = 0; f.launched = false;
      f.enterForm(); f.ult = Math.max(f.ult, 50); f.pose = 'idle';
      this.shake = 20; this.popText(f.x, f.y - f.h - 60, 'REVIVED — ULTIMATE UNLOCKED', '#ffd35a', 26);
    });
  },
  triggerUlt(f) {
    const opp = f.opp;
    f.act = null; f.ult = 0; f.vx = 0; this.stats.ults[f.slot]++;
    this.projectiles = this.projectiles.filter(p => p.owner !== opp);
    this.playCutscene(Cutscenes.ult(f, opp), () => {
      const U = f.def.ult;
      const dmg = (U.randomDmg ? randi(U.randomDmg[0], U.randomDmg[1]) : U.dmg) * 1.3;
      this.shake = 30;
      opp.comboTaken = 0; opp.invuln = 0; opp.downT = 0; opp.status.grabbed = 0;
      this.hit(opp, { dmg, src: f, kb: 600, launch: true, unblockable: true, force: true, ultHit: true, noScale: true });
      this.fx.burst(opp.x, opp.y - 60, 80, { color: ['#fff', f.def.color], size: 16, speed: 600, glow: true, life: 1 });
      if (U.after) U.after(f, opp); else Arena.destroyAll(() => Math.random() < 0.5, this.fx);
    });
  },

  // ---------- combat resolution ----------
  hit(t, o) {
    const src = o.src;
    if (t.hp <= 0 || this.roundOver && !o.ultHit) return false;
    if (!o.force && !o.dot && !t.canBeHit()) return false;
    if (!o.dot && !o.noScale && t.comboTaken >= 7) {
      t.invuln = 0.7; t.hurtT = 0; t.launched = false;
      t.vx = (t.x >= (o.fromX ?? src.x) ? 1 : -1) * 450;
      this.popText(t.x, t.y - t.h - 30, 'COMBO BREAKER', '#9cf', 26); Sfx.block();
      return false;
    }
    const dir = (t.x >= (o.fromX ?? src.x) ? 1 : -1);
    let dmg = o.dmg * (src.world ? 1 : src.dmgMult(t, o)) * t.takenMult();
    if (!o.dot && !o.noScale) dmg *= Math.max(0.35, 1 - 0.1 * t.comboTaken);
    const blocked = !o.unblockable && !o.dot && t.blocking && t.facing === -dir;
    const [cx, cy] = t.center();
    if (blocked) {
      t.hp = Math.max(1, t.hp - dmg * 0.12);
      if (t.id === 'echo') t.ki = Math.min(100, t.ki + 8);
      else t.ki -= dmg * 0.45;
      t.vx = dir * (o.kb || 200) * 0.4;
      Sfx.block();
      this.fx.burst(cx - dir * t.w / 2, cy, 8, { color: '#9cf', size: 5, speed: 200, glow: true, life: 0.25 });
      if (t.ki <= 0) {
        t.ki = 0; t.status.stun = 1.1; t.blocking = false;
        this.popText(t.x, t.y - t.h - 30, 'GUARD BREAK', '#ff5a5a', 30); Sfx.clang(); this.shake = 10;
      }
      return 'blocked';
    }
    if (t.status.shield > 0 && !o.dot) {
      const ab = Math.min(t.status.shield, dmg); t.status.shield -= ab; dmg -= ab;
      this.fx.burst(cx, cy, 10, { color: '#3fe0ff', size: 6, speed: 200, glow: true, life: 0.3 });
      if (dmg <= 0) { Sfx.block(); return 'blocked'; }
    }
    t.hp = Math.max(0, t.hp - dmg);
    if (!src.world) {
      this.stats.dmg[src.slot] += dmg;
      src.ult = Math.min(100, src.ult + dmg * 0.055 * (o.ultHit ? 0 : 1));
      if (!src.form && src.def.form.manual) src.meter = Math.min(100, src.meter + dmg * 0.06 * (src.def.meterRate || 1));
      const ls = src.form && src.def.form.lifesteal; if (ls && !o.dot) src.hp = Math.min(src.maxHp, src.hp + dmg * ls);
    }
    t.ult = Math.min(100, t.ult + dmg * 0.045);
    if (o.status) { for (const [k, v] of Object.entries(o.status)) t.status[k] = Math.max(t.status[k] || 0, v); if (o.status.burn || o.status.bleed) t.status.dotSrc = src; }
    if (o.stun) t.status.stun = Math.max(t.status.stun || 0, o.stun);
    const armored = (t.form && t.def.form.superArmor) || t.status.armor > 0;
    if (!o.noFlinch && !o.dot && (!armored || o.ultHit)) {
      t.act = null; t.hurtT = 0.28; t.blocking = false;
      t.vx = dir * (o.kb || 200) * (t.def.heavy ? 0.6 : 1);
      if (o.launch) { t.vy = -560 * (t.def.heavy ? 0.8 : 1); t.launched = true; t.onGround = false; }
      t.comboTaken++;
      if (!src.world && t.comboTaken > this.stats.maxCombo[src.slot]) this.stats.maxCombo[src.slot] = t.comboTaken;
      if (t.comboTaken >= 3) this.popText(t.x + dir * 40, t.y - t.h - 50, t.comboTaken + ' HITS', '#ffd35a', 22);
    } else if (armored) t.flash = 0.1;
    if (!o.dot) {
      t.flash = 0.12; Sfx.hit();
      this.fx.burst(cx - dir * t.w / 3, cy - 10, 12, { color: ['#fff', '#ffe28a', src.def.color], size: 7, speed: 380, glow: true, life: 0.35 });
      this.hitstop = Math.min(0.1, 0.02 + dmg * 0.0007);
      this.shake = Math.max(this.shake, dmg * 0.08);
    }
    this.popText(cx + rand(-15, 15), t.y - t.h - 10, Math.round(dmg).toString(), o.dot ? '#ffa060' : '#ffe28a', o.dot ? 16 : 22);
    if (t.hp <= 0) this.onDeath(t, src);
    return 'hit';
  },
  onDeath(t, src) {
    if (t.def.reviveForm && !t.revived) { t.hp = 1; this.triggerRevive(t); return; }
    if (this.mode === 'training') { t.hp = t.maxHp; t.shownHp = t.maxHp; this.popText(t.x, t.y - t.h - 40, 'HP RESET', '#7df', 28); return; }
    this.endRound(t.opp, 'K.O.');
  },

  // ---------- fight update ----------
  updateFight(dt) {
    const p1 = this.p1, p2 = this.p2;
    for (const l of this.laters.slice()) { l.t -= dt; if (l.t <= 0) { this.laters = this.laters.filter(x => x !== l); l.fn(); } }
    if (this.roundOver) { this.roundEndT -= dt / this.slowmo; if (this.roundEndT <= 0) { this.afterRound(); return; } }
    if (this.hitstop > 0) { this.hitstop -= dt; return; }
    let c1 = {}, c2 = {};
    if (this.introT > 0) this.introT -= dt;
    else if (!this.roundOver) {
      c1 = playerControl(0);
      if (this.mode === '2p') c2 = playerControl(1);
      else if (this.mode === 'training') c2 = this.dummyFights ? cpuControl(p2, dt) : { block: this.dummyBlock };
      else c2 = cpuControl(p2, dt);
      if (this.mode !== 'training') {
        this.timer -= dt;
        if (this.timer <= 0) { this.timer = 0; const a = p1.hp / p1.maxHp, b = p2.hp / p2.maxHp; this.endRound(a === b ? null : a > b ? p1 : p2, 'TIME'); }
      } else this.trainingKeys();
    }
    const s1 = p2.form && p2.def.form.timeSlowOpp || 1, s2 = p1.form && p1.def.form.timeSlowOpp || 1;
    p1.update(c1, dt * s1); if (this.cutscene) return;
    p2.update(c2, dt * s2); if (this.cutscene) return;
    const passing = (p1.act && p1.act.pass) || (p2.act && p2.act.pass);
    if (!passing && p1.hp > 0 && p2.hp > 0 && !p1.status.grabbed && !p2.status.grabbed && rectsOverlap(p1.rect(), p2.rect())) {
      const push = ((p1.w + p2.w) / 2 - Math.abs(p1.x - p2.x)) / 2, d = p1.x < p2.x ? -1 : 1;
      p1.x = clamp(p1.x + d * push, p1.w / 2 + 10, W - p1.w / 2 - 10); p2.x = clamp(p2.x - d * push, p2.w / 2 + 10, W - p2.w / 2 - 10);
    }
    for (const b of this.beams.slice()) {
      b.t += dt;
      if (b.t >= b.delay + b.life || b.owner.hp <= 0) { this.beams = this.beams.filter(x => x !== b); continue; }
      if (b.t < b.delay) continue;
      const o = b.owner, [mx, my] = o.mouth(), x1 = o.facing > 0 ? W + 50 : -50;
      const rect = { x: Math.min(mx, x1), y: my - b.width / 2, w: Math.abs(x1 - mx), h: b.width };
      Arena.hit(rect.x, rect.x + rect.w, my, 160 * dt, this.fx);
      b.tick -= dt;
      if (b.tick <= 0 && rectsOverlap(rect, o.opp.rect())) { b.tick = 0.12; this.hit(o.opp, { dmg: b.dps * 0.12, src: o, kb: 80, noScale: true }); }
      this.shake = Math.max(this.shake, 4);
    }
    Combat.update(dt);
    Arena.update(dt, this.fx);
  },
  trainingKeys() {
    const p1 = this.p1, p2 = this.p2;
    p1.ult = Math.min(100, p1.ult + 0.5); if (!p1.form) p1.meter = Math.min(100, p1.meter + 0.5); p1.ki = Math.min(100, p1.ki + 0.3);
    if (tapped('KeyR')) { p1.resetForRound(300, 1); p2.resetForRound(W - 300, -1); this.projectiles = []; this.hazards = []; Arena.load(Arena.stage); this.popText(W / 2, 220, 'RESET', '#7df', 40); }
    if (tapped('KeyX')) this.hit(p1, { dmg: 100, src: p2, kb: 200, unblockable: true, noScale: true });
    if (tapped('KeyC')) { this.dummyFights = !this.dummyFights; this.popText(p2.x, p2.y - p2.h - 30, this.dummyFights ? 'DUMMY FIGHTS BACK' : 'DUMMY PASSIVE', '#7df'); }
    if (tapped('KeyB')) { this.dummyBlock = !this.dummyBlock; this.popText(p2.x, p2.y - p2.h - 30, this.dummyBlock ? 'DUMMY BLOCKS' : 'DUMMY OPEN', '#7df'); }
  },

  // ---------- fight drawing ----------
  drawFighter(c, f) {
    const alpha = f.status.invis > 0 ? (f.ctrl === 'human1' || f.ctrl === 'human2' ? 0.3 : 0.12) : 1;
    ellipse(c, f.x, GROUND + 4, f.w * 0.7, 7, `rgba(0,0,0,${0.35 * alpha})`);
    const drawAt = (x, a) => {
      c.save(); c.globalAlpha = a; c.translate(x, f.y);
      if (f.pose === 'ko' || f.pose === 'down') { c.translate(0, -8); c.rotate(-f.facing * Math.PI / 2 * 0.95); }
      c.scale(f.scale * f.facing, f.scale);
      f.def.draw(c, f);
      c.restore();
    };
    if (f.form && f.def.form.clones && f.hp > 0) for (const d of [-70, 70]) { silhouette(c, o => { o.save(); o.translate(f.x + d, f.y); o.scale(f.scale * f.facing, f.scale); f.def.draw(o, f); o.restore(); }, '#3a0a2a', 0.5 * alpha); }
    if (f.act && f.act.type === 'dash' && f.act.trail) for (let i = 1; i <= 3; i++) drawAt(f.x - f.vx * 0.02 * i, 0.15 * alpha);
    drawAt(f.x, alpha);
    const [cx, cy] = f.center(), top = f.y - f.h;
    if (f.status.freeze) { c.fillStyle = 'rgba(190,240,255,0.5)'; c.strokeStyle = '#fff'; c.lineWidth = 2; c.fillRect(f.x - f.w * 0.8, top - 10, f.w * 1.6, f.h + 10); c.strokeRect(f.x - f.w * 0.8, top - 10, f.w * 1.6, f.h + 10); }
    if (f.status.stun && !f.status.freeze) for (let i = 0; i < 3; i++) { const a = this.t * 5 + i * 2.1; bigText(c, '★', f.x + Math.cos(a) * 24, top - 14 + Math.sin(a) * 6, 16, '#ffd35a', null); }
    if (f.status.shield > 0) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(63,224,255,0.7)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, f.h * 0.6, 0, Math.PI * 2); c.stroke(); glowCircle(c, cx, cy, f.h * 0.6, 'rgba(63,224,255,0.1)'); c.globalCompositeOperation = 'source-over'; }
    if (f.status.confuse) bigText(c, '?', f.x, top - 20, 30, '#d05aff', '#000');
    if (f.status.slow && !f.status.freeze) bigText(c, '❄', f.x - 20, top - 10, 16, '#9ff', null);
    if (f.status.weaken) bigText(c, '▼', f.x + 20, top - 10, 16, '#b36bff', null);
    if (f.status.mark) bigText(c, '✕', f.x, top - 34, 18, '#ff2a6a', '#000');
    if (f.blocking) {
      const a0 = f.facing > 0 ? 0 : Math.PI;
      c.strokeStyle = f.ki < 30 ? 'rgba(255,120,120,0.8)' : 'rgba(150,210,255,0.7)'; c.lineWidth = 3;
      c.beginPath(); c.arc(f.x + f.facing * f.w * 0.3, cy, f.h * 0.55, a0 - Math.PI / 2.4, a0 + Math.PI / 2.4); c.stroke();
    }
    if (f.flash > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = f.flash * 5; glowCircle(c, f.x, cy, f.h * 0.6, 'rgba(255,255,255,0.5)'); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
  },
  drawFight(c) {
    const s = this.shake;
    c.save();
    if (s > 0) c.translate(rand(-s, s), rand(-s, s));
    Arena.draw(c, this.t);
    Combat.drawHz && Game.hazards.forEach(h => Combat.drawHz[h.kind] && Combat.drawHz[h.kind](c, h, this.t));
    const order = this.p1.act ? [this.p2, this.p1] : [this.p1, this.p2];
    for (const f of order) this.drawFighter(c, f);
    c.globalCompositeOperation = 'lighter';
    for (const b of this.beams) {
      const [mx, my] = b.owner.mouth();
      if (b.t < b.delay) { glowCircle(c, mx, my, 40 * (b.t / b.delay) + 10, 'rgba(255,250,210,1)', 'rgba(255,200,80,0)'); continue; }
      const k = 1 - seg(b.t, b.delay + b.life - 0.15, b.delay + b.life), wdt = b.width * (0.8 + Math.sin(this.t * 60) * 0.1) * k, x1 = b.owner.facing > 0 ? W + 50 : -50;
      const g = c.createLinearGradient(0, my - wdt, 0, my + wdt);
      g.addColorStop(0, 'rgba(255,160,40,0)'); g.addColorStop(0.35, 'rgba(255,210,90,0.85)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(0.65, 'rgba(255,210,90,0.85)'); g.addColorStop(1, 'rgba(255,160,40,0)');
      c.fillStyle = g; c.fillRect(Math.min(mx, x1), my - wdt, Math.abs(x1 - mx), wdt * 2);
      glowCircle(c, mx, my, 70 * k, 'rgba(255,255,230,1)', 'rgba(255,200,80,0)');
    }
    c.globalCompositeOperation = 'source-over';
    for (const p of this.projectiles) Combat.drawProj(c, p, this.t);
    this.fx.draw(c);
    Arena.drawFront(c, this.t);
    for (const tx of this.texts) { c.globalAlpha = 1 - seg(tx.t, 0.6, 1); bigText(c, tx.txt, tx.x, tx.y - tx.t * 50, tx.size, tx.color); }
    c.globalAlpha = 1;
    c.restore();
    this.drawHUD(c);
  },

  drawHUD(c) {
    const bar = (f, left) => {
      const w = 500, x = left ? 30 : W - 30 - w, y = 20, dirX = left ? 1 : -1;
      // portrait
      const bx = left ? x : x + w - 60;
      c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillRect(bx, y, 60, 60);
      c.save(); c.beginPath(); c.rect(bx, y, 60, 60); c.clip();
      drawCharAt(c, f.def, bx + 30, y + 158, 1.3, left ? 1 : -1, { pose: 'idle', anim: this.t, transformed: false });
      c.restore(); c.strokeStyle = f.def.color; c.lineWidth = 3; c.strokeRect(bx, y, 60, 60);
      const hx = left ? x + 68 : x, hw = w - 68;
      // HP
      c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillRect(hx, y, hw, 24);
      const fw = hw * f.hp / f.maxHp, gw = hw * f.shownHp / f.maxHp;
      c.fillStyle = '#fff'; c.fillRect(left ? hx + hw - gw : hx, y + 3, gw, 18);
      const hg = c.createLinearGradient(0, y, 0, y + 24);
      const low = f.hp < f.maxHp * 0.3; hg.addColorStop(0, low ? '#ff6a5a' : '#7dff8a'); hg.addColorStop(1, low ? '#9e1f1f' : '#1f9e3a');
      c.fillStyle = hg; c.fillRect(left ? hx + hw - fw : hx, y + 3, fw, 18);
      smallText(c, Math.ceil(f.hp) + ' / ' + f.maxHp, left ? hx + 6 : hx + hw - 6, y + 12, 12, '#fff', left ? 'left' : 'right');
      // Ki
      c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillRect(hx, y + 26, hw * 0.6, 7);
      c.fillStyle = f.ki < 25 ? '#ff7070' : '#5ad8ff'; c.fillRect(left ? hx : hx + hw * 0.4 + hw * 0.6 * (1 - f.ki / 100), y + 27, hw * 0.6 * f.ki / 100, 5);
      if (!left) { c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillRect(hx + hw * 0.4, y + 26, hw * 0.6, 7); c.fillStyle = f.ki < 25 ? '#ff7070' : '#5ad8ff'; c.fillRect(hx + hw * 0.4 + hw * 0.6 * (1 - f.ki / 100), y + 27, hw * 0.6 * f.ki / 100, 5); }
      // name + wins
      bigText(c, f.def.name + (f.form ? '  ·  ' + f.def.form.name : ''), left ? hx : hx + hw, y + 48, 19, f.def.color, '#000', left ? 'left' : 'right');
      for (let i = 0; i < WINS_NEEDED; i++) { const px = left ? hx + hw - 14 - i * 22 : hx + 14 + i * 22; circle(c, px, y + 46, 7, this.wins[f.slot] > i ? '#ffd35a' : 'rgba(0,0,0,0.6)'); c.strokeStyle = '#ffd35a'; c.lineWidth = 2; c.beginPath(); c.arc(px, y + 46, 7, 0, Math.PI * 2); c.stroke(); }
      // bottom panel: form + ult meters + skills
      const py = H - 64, pw = 330, px = left ? 20 : W - 20 - pw;
      c.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(c, px, py, pw, 50, 8); c.fill();
      const meter = (mx, label, v, col, ready, key) => {
        c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(mx, py + 28, 90, 8);
        c.fillStyle = ready ? (Math.sin(this.t * 10) > 0 ? '#fff' : col) : col; c.fillRect(mx, py + 28, 90 * clamp(v, 0, 1), 8);
        smallText(c, label + (ready && key ? ' [' + key + ']' : ''), mx, py + 16, 11, ready ? '#fff' : '#aab');
      };
      const human = f.ctrl.startsWith('human'), keys = f.ctrl === 'human2' ? ['4', '5', '1', '2', '3'] : ['U', 'I', 'J', 'K', 'L'];
      const formLabel = f.def.reviveForm ? (f.form ? 'DEMON' : 'CORE INTACT') : f.form ? 'FORM ' + Math.ceil(f.formT) + 's' : 'FORM';
      meter(px + 10, formLabel, f.def.reviveForm ? (f.form ? 1 : 0) : f.form ? f.formT / f.def.form.dur : f.meter / 100, '#4a8cff', !f.form && f.meter >= 100 && f.def.form.manual, human && keys[0]);
      const locked = f.def.ult.locked && f.def.ult.locked(f);
      meter(px + 110, locked ? 'ULT LOCKED' : 'ULTIMATE', f.ult / 100, locked ? '#555' : '#ffd35a', f.canUlt(), human && keys[1]);
      for (let i = 0; i < 2; i++) {
        const s = f.skill(i), sx = px + 212 + i * 56, cdm = (f.cdMax && f.cdMax[i]) || s.cd;
        c.fillStyle = 'rgba(255,255,255,0.08)'; roundRect(c, sx, py + 5, 50, 40, 6); c.fill();
        smallText(c, s.name.split(' ').map(w => w[0]).join(''), sx + 25, py + 22, 16, f.ki >= s.ki ? f.def.color : '#666', 'center');
        if (human) smallText(c, keys[3 + i], sx + 25, py + 38, 10, '#aab', 'center');
        if (f.cd[i] > 0) { c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(sx, py + 5 + 40 * (1 - f.cd[i] / cdm), 50, 40 * f.cd[i] / cdm); smallText(c, f.cd[i].toFixed(1), sx + 25, py + 25, 13, '#fff', 'center'); }
      }
      void dirX;
    };
    bar(this.p1, true); bar(this.p2, false);
    // timer
    c.fillStyle = 'rgba(0,0,0,0.65)'; roundRect(c, W / 2 - 42, 14, 84, 58, 10); c.fill();
    bigText(c, this.mode === 'training' ? '∞' : Math.ceil(this.timer).toString(), W / 2, 44, 40, this.timer < 10 ? '#ff5a5a' : '#fff');
    smallText(c, Arena.stage.name + '  ·  collateral $' + Arena.damage.toFixed(1) + 'B', W / 2, 86, 12, '#ffb080', 'center');
    if (this.mode === 'training') smallText(c, `TRAINING — R reset · X hurt yourself · C dummy ${this.dummyFights ? 'fights' : 'passive'} · B dummy ${this.dummyBlock ? 'blocks' : 'open'}`, W / 2, 104, 13, '#7df', 'center');
    if (this.arcade && this.mode === 'arcade') smallText(c, `ARCADE  ·  BATTLE ${this.arcade.idx + 1} / 6`, W / 2, 104, 13, '#ffd35a', 'center');
    if (this.banner) {
      const b = this.banner, p = seg(b.t, 0, 0.2), out = 1 - seg(b.t, b.dur - 0.3, b.dur);
      c.save(); c.globalAlpha = out; c.translate(W / 2, H / 2 - 60); const s = lerp(2.5, 1, ease.out(p)); c.scale(s, s);
      bigText(c, b.text, 0, 0, b.size, b.color); c.restore(); c.globalAlpha = 1;
    }
    smallText(c, 'P1: A/D move · W jump · S block · SHIFT/O dash · J attack · K/L skills · U transform · I ultimate · ESC pause', W / 2, H - 6, 11, 'rgba(255,255,255,0.55)', 'center');
  },

  // ---------- screens ----------
  drawTitle(c) {
    City.drawSky(c, this.t, { fullMoon: true, moonX: W / 2, moonY: 250 });
    City.drawFar(c);
    Arena.stage || Arena.load(STAGES[0]);
    for (const b of Arena.structs) drawTowerStruct(c, b);
    STAGES[0].ground(c);
    silhouette(c, o => drawCharAt(o, CHARACTERS[0], W / 2 - 60, GROUND + 10, 3.1, 1, { pose: 'idle', anim: this.t, transformed: true }), '#0a0612');
    c.globalCompositeOperation = 'lighter';
    for (const ex of [13, 23]) glowCircle(c, W / 2 - 60 + ex * 3.1, GROUND + 10 - 101 * 3.1 + Math.sin(this.t * 3) * 4.6, 18, 'rgba(255,30,30,1)', 'rgba(255,0,0,0)');
    c.globalCompositeOperation = 'source-over';
    // parade of the roster
    CHARACTERS.forEach((d, i) => { const x = ((i * 100 + this.t * 40) % (W + 200)) - 100; drawCharAt(c, d, x, H - 8, 0.7, 1, { pose: 'run', anim: this.t + i, transformed: false }); });
    bigText(c, 'MOONKAI', W / 2, 115, 140, '#ffd35a', '#2a1200');
    bigText(c, 'HEROES  ·  VILLAINS  ·  COLLATERAL DAMAGE', W / 2, 195, 26, '#fff', '#000');
    if (Math.sin(this.t * 4) > -0.3) bigText(c, 'PRESS ENTER  ·  OR TAP', W / 2, H - 110, 40, '#fff', '#000');
  },
  menuRect(i) { return { x: W / 2 - 220, y: 230 + i * 62, w: 440, h: 50 }; },
  drawMenu(c) {
    STAGES[(Math.floor(this.t / 6)) % STAGES.length].bg(c, this.t, Arena);
    c.fillStyle = 'rgba(5,4,15,0.6)'; c.fillRect(0, 0, W, H);
    bigText(c, 'MOONKAI', W / 2, 110, 110, '#ffd35a', '#2a1200');
    const desc = ['Fight through 6 opponents and the final boss. Story, endings.', 'One match against the CPU, best of 3 rounds.', 'Local multiplayer on one keyboard.', 'No timer, a practice dummy, fast meters.', 'CPU difficulty for Versus and Training.', 'Controls and mechanics.'];
    MENU.forEach((m, i) => {
      const r = this.menuRect(i), on = i === this.menuIdx;
      c.fillStyle = on ? 'rgba(255,211,90,0.25)' : 'rgba(0,0,0,0.5)'; roundRect(c, r.x, r.y, r.w, r.h, 10); c.fill();
      if (on) { c.strokeStyle = '#ffd35a'; c.lineWidth = 2; c.stroke(); }
      bigText(c, m === 'DIFFICULTY' ? 'CPU: ' + LEVEL_NAMES[this.cpuLevel] + '  ◄ ►' : m, W / 2, r.y + r.h / 2, 28, on ? '#ffd35a' : '#fff', '#000');
    });
    smallText(c, desc[this.menuIdx], W / 2, H - 50, 17, '#dde', 'center');
    smallText(c, 'W/S or ↑/↓ to move · ENTER to choose · tap works too', W / 2, H - 22, 13, '#99a', 'center');
  },
  cardRect(i) { const cw = 150, ch = 150, gx = 12, cols = 7; const x0 = W / 2 - (cw * cols + gx * (cols - 1)) / 2; return { x: x0 + (i % cols) * (cw + gx), y: 78 + Math.floor(i / cols) * (ch + 12), w: cw, h: ch }; },
  drawSelect(c) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b0a1e'); g.addColorStop(1, '#2a1640');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    bigText(c, 'CHOOSE YOUR FIGHTER', W / 2, 40, 40, '#fff', '#000');
    smallText(c, { arcade: 'ARCADE', cpu: 'VERSUS CPU (' + LEVEL_NAMES[this.cpuLevel] + ')', '2p': 'VERSUS 2 PLAYER', training: 'TRAINING' }[this.mode], W - 30, 40, 16, '#ffd35a', 'right');
    CHARACTERS.forEach((d, i) => {
      const r = this.cardRect(i), on1 = this.sel[0] === i, on2 = this.mode === '2p' && this.sel[1] === i;
      c.fillStyle = on1 || on2 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.4)'; c.fillRect(r.x, r.y, r.w, r.h);
      c.save(); c.beginPath(); c.rect(r.x, r.y, r.w, r.h); c.clip();
      glowCircle(c, r.x + r.w / 2, r.y + r.h * 0.6, 110, hexA(d.color2.length === 7 ? d.color2 : '#333333', 0.9), 'rgba(0,0,0,0)');
      drawCharAt(c, d, r.x + r.w / 2, r.y + r.h + 36, 1.35, 1, { pose: on1 || on2 ? 'victory' : 'idle', anim: this.t + i, transformed: (on1 || on2) && Math.sin(this.t * 0.9) > 0.3 });
      c.restore();
      c.fillStyle = 'rgba(0,0,0,0.7)'; c.fillRect(r.x, r.y + r.h - 24, r.w, 24);
      smallText(c, d.name, r.x + r.w / 2, r.y + r.h - 12, 15, d.color, 'center');
      if (on1) { c.strokeStyle = '#ffd35a'; c.lineWidth = 4; c.strokeRect(r.x, r.y, r.w, r.h); bigText(c, this.ready[0] ? 'P1 ✓' : 'P1', r.x + 22, r.y + 14, 16, '#ffd35a'); }
      if (on2) { c.strokeStyle = '#5ad8ff'; c.lineWidth = 4; c.strokeRect(r.x + 3, r.y + 3, r.w - 6, r.h - 6); bigText(c, this.ready[1] ? 'P2 ✓' : 'P2', r.x + r.w - 22, r.y + 14, 16, '#5ad8ff'); }
    });
    const showDef = (d, x, w, col) => {
      const y = 410;
      c.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(c, x, y, w, 290, 10); c.fill();
      bigText(c, d.name, x + 16, y + 26, 30, d.color, '#000', 'left');
      smallText(c, `${d.side} · ${d.title} · ${d.style}`, x + 16, y + 52, 14, col);
      smallText(c, `HP ${d.hp}   SPEED ${d.speed}   POWER ${d.atk}`, x + 16, y + 74, 13, '#bbb');
      let yy = y + 100;
      const line = (k, n, desc, color) => { c.fillStyle = color; c.fillRect(x + 16, yy - 9, 22, 18); bigText(c, k, x + 27, yy, 13, '#000', null); smallText(c, n, x + 46, yy - 1, 14, '#fff'); smallText(c, desc, x + 46, yy + 15, 11.5, '#aab'); yy += 36; };
      line('★', 'Passive: ' + d.passive[0], d.passive[1], '#888');
      d.skills.forEach((s, i) => line(['K', 'L'][i], s.name + (d.formSkills[i] !== s ? '  →  ' + d.formSkills[i].name : ''), s.desc + (d.formSkills[i] !== s ? '  /  ' + d.formSkills[i].desc : ''), d.color));
      line('U', d.form.name, d.form.desc, '#4a8cff');
      line('I', d.ult.name, d.ult.desc, '#ffd35a');
      smallText(c, d.bio.length > 120 ? d.bio.slice(0, 118) + '…' : d.bio, x + 16, y + 272, 11.5, '#ccd');
    };
    if (this.mode === '2p') { showDef(CHARACTERS[this.sel[0]], 30, W / 2 - 45, '#ffd35a'); showDef(CHARACTERS[this.sel[1]], W / 2 + 15, W / 2 - 45, '#5ad8ff'); }
    else showDef(CHARACTERS[this.sel[0]], 30, W - 60, '#ffd35a');
    smallText(c, this.mode === '2p' ? 'P1: WASD + J to lock in  ·  P2: arrows + Numpad1 / comma to lock in  ·  ESC back' : 'A/D/W/S or arrows to choose  ·  ENTER / J to lock in  ·  ESC back  ·  tap a fighter twice', W / 2, H - 4, 12, '#99a', 'center');
  },
  stageRect(i) { const w = 360, h = 200, g = 26; const x0 = W / 2 - (w * 3 + g * 2) / 2; return { x: x0 + (i % 3) * (w + g), y: 110 + Math.floor(i / 3) * (h + 60), w, h }; },
  drawStageSelect(c) {
    c.fillStyle = '#08070f'; c.fillRect(0, 0, W, H);
    bigText(c, 'CHOOSE A STAGE', W / 2, 55, 44, '#fff', '#000');
    if (!this.thumbs) this.thumbs = STAGES.map(st => { const cv = document.createElement('canvas'); cv.width = W / 3; cv.height = H / 3; const x = cv.getContext('2d'); x.scale(1 / 3, 1 / 3); const prev = Arena.stage; Arena.load(st); Arena.draw(x, 0); if (prev) Arena.load(prev); return cv; });
    STAGES.forEach((st, i) => {
      const r = this.stageRect(i), on = i === this.stageIdx;
      c.drawImage(this.thumbs[i], r.x, r.y, r.w, r.h);
      c.strokeStyle = on ? '#ffd35a' : '#333'; c.lineWidth = on ? 5 : 2; c.strokeRect(r.x, r.y, r.w, r.h);
      bigText(c, st.name, r.x + r.w / 2, r.y + r.h + 20, 22, on ? '#ffd35a' : '#ccc');
    });
    smallText(c, STAGES[this.stageIdx].desc, W / 2, H - 50, 17, '#dde', 'center');
    smallText(c, 'Arrows / WASD to choose · ENTER to fight · R random · ESC back', W / 2, H - 22, 13, '#99a', 'center');
  },
  drawStory(c) {
    const A = this.arcade, opp = A.ladder[A.idx], me = A.player, boss = A.idx === 5;
    skyGrad(c, boss ? ['#050008', '#1a0428', '#3a0a4a'] : ['#050510', '#141438', '#2a2050']);
    const p = ease.out(seg(this.storyT, 0, 0.6));
    bigText(c, boss ? 'FINAL BATTLE' : `BATTLE ${A.idx + 1} / 6`, W / 2, 60, 50, boss ? '#ff4a4a' : '#ffd35a');
    for (let i = 0; i < 6; i++) { const x = W / 2 - 150 + i * 60; circle(c, x, 110, 12, i < A.idx ? '#7dff8a' : i === A.idx ? '#ffd35a' : '#333'); if (i < 5) { c.fillStyle = '#333'; c.fillRect(x + 12, 108, 36, 4); } }
    drawCharAt(c, me.def || me, lerp(-200, 280, p), H - 60, 3, 1, { pose: 'idle', anim: this.t, transformed: false });
    drawCharAt(c, opp, lerp(W + 200, W - 280, p), H - 60, 3, -1, { pose: 'idle', anim: this.t, transformed: boss });
    bigText(c, 'VS', W / 2, 330, 90, '#fff', '#c01010');
    const lines = boss ? [`${opp.name}: "So you are the one who has been breaking my toys."`, `${me.name}: "I came to break the rest."`] : [`${opp.name}: ${opp.quote}`, `${me.name}: ${me.quote}`];
    smallText(c, lines[0], W / 2, 200, 18, opp.color, 'center');
    if (this.storyT > 0.8) smallText(c, lines[1], W / 2, 232, 18, me.color, 'center');
    if (boss) smallText(c, 'Boss fight: the enemy has 40% more health and starts with half an ultimate.', W / 2, 262, 14, '#ff9a9a', 'center');
    if (this.storyT > 1.2 && Math.sin(this.t * 4) > -0.3) bigText(c, 'PRESS ENTER', W / 2, H - 40, 32, '#fff');
  },
  drawResult(c) {
    this.drawFight(c);
    c.fillStyle = `rgba(0,0,0,${0.75 * seg(this.resultT, 0, 0.5)})`; c.fillRect(0, 0, W, H);
    const w = this.matchWinner; if (!w) return;
    c.globalAlpha = seg(this.resultT, 0.2, 0.7);
    const pWin = w === this.p1 || this.mode === '2p';
    bigText(c, this.mode === '2p' ? `PLAYER ${w.slot + 1} WINS` : pWin ? 'VICTORY' : 'DEFEAT', W / 2, 90, 90, pWin ? '#ffd35a' : '#ff4a4a');
    drawCharAt(c, w.def, W / 2, 470, 2.6, 1, { pose: 'victory', anim: this.t, transformed: w.form });
    bigText(c, w.def.name, W / 2, 510, 40, w.def.color);
    const S = this.stats;
    smallText(c, `Damage dealt  ${Math.round(S.dmg[0])}  vs  ${Math.round(S.dmg[1])}   ·   Best combo  ${S.maxCombo[0]}  vs  ${S.maxCombo[1]}   ·   Ultimates  ${S.ults[0]}  vs  ${S.ults[1]}`, W / 2, 550, 16, '#ddd', 'center');
    smallText(c, `Collateral damage: $${Arena.damage.toFixed(1)} billion  ·  ${Arena.destroyed} structures destroyed`, W / 2, 578, 15, '#ffb080', 'center');
    const arc = this.mode === 'arcade';
    const opts = arc ? (w === this.p1 ? (this.arcade.idx >= 5 ? 'ENTER: see your ending' : 'ENTER: next battle') : 'ENTER: continue (retry)  ·  ESC: give up') : 'ENTER: rematch  ·  ESC: character select';
    bigText(c, opts, W / 2, 640, 24, '#fff');
    c.globalAlpha = 1;
  },
  drawEnding(c) {
    const d = this.arcade.player;
    skyGrad(c, ['#0a0616', '#2a1a40', '#6a3a50']);
    City.drawMoon(c, this.t, 1, 150, 130, 70);
    drawCharAt(c, d, 300, H - 40, 3.2, 1, { pose: 'victory', anim: this.t, transformed: true });
    bigText(c, 'ENDING', W / 2 + 160, 100, 60, d.color);
    c.font = '20px Georgia, serif'; c.fillStyle = '#eee'; c.textAlign = 'left';
    const words = d.ending.split(' '); let line = '', y = 200; const x = 560, n = Math.floor(seg(this.storyT, 0, 4) * d.ending.length); let used = 0;
    for (const wd of words) { if (c.measureText(line + wd).width > 620) { c.fillText(line, x, y); y += 32; line = ''; } line += wd + ' '; used += wd.length + 1; if (used > n) break; }
    c.fillText(line, x, y);
    if (this.storyT > 4) { bigText(c, 'THANKS FOR PLAYING MOONKAI', W / 2 + 160, H - 110, 30, '#ffd35a'); smallText(c, 'ENTER: main menu', W / 2 + 160, H - 70, 16, '#ccc', 'center'); }
  },
  drawHowTo(c) {
    c.fillStyle = '#0a0916'; c.fillRect(0, 0, W, H);
    bigText(c, 'HOW TO PLAY', W / 2, 50, 50, '#ffd35a');
    const L = [
      ['CONTROLS (P1)', 'A/D move · W jump · S block · SHIFT or O dash · J attack (3-hit chain) · K skill 1 · L skill 2 · U transform · I ultimate · ESC pause'],
      ['CONTROLS (P2)', 'Arrows move/jump/block · Numpad1 / , attack · Numpad2 / . skill 1 · Numpad3 / / skill 2 · Numpad4 / ; transform · Numpad5 / \' ultimate · Numpad0 / RShift dash'],
      ['KI (blue bar)', 'Skills and dashes cost Ki. Blocking drains Ki; at zero your guard BREAKS and you are stunned. Ki refills when you stop acting.'],
      ['COMBOS', 'Tap J three times for a chain ending in a launcher. Each hit in a combo deals 10% less. After 7 hits the defender gets a COMBO BREAKER.'],
      ['KNOCKDOWNS', 'Launched fighters fall down and get brief invulnerability when they stand up. No infinite loops.'],
      ['TRANSFORM (U)', 'Fill the FORM meter by fighting. Every fighter has a unique form with new skills. Kael has no button: he transforms when he dies.'],
      ['ULTIMATE (I)', 'Fill the gold meter by dealing and taking damage. A cinematic, unblockable finisher, roughly a quarter of a health bar.'],
      ['ROUNDS', 'Best of 3, 99 seconds each. On time-out the healthier fighter wins the round.'],
      ['STAGES', 'Magma Rift erupts, the Lunar Station has low gravity and meteors, Frostpeak is slippery, and Sky Temple has wind gusts.'],
      ['STATUS', 'Burn/bleed (damage over time) · Slow ❄ · Freeze · Stun ★ · Weaken ▼ · Mark ✕ · Confuse ? (controls swap) · Shield'],
    ];
    L.forEach(([h, t], i) => { bigText(c, h, 60, 110 + i * 56, 18, '#ffd35a', '#000', 'left'); smallText(c, t, 60, 132 + i * 56, 14, '#dde'); });
    smallText(c, 'ENTER / ESC: back', W / 2, H - 16, 14, '#99a', 'center');
  },
  drawPause(c) {
    c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(0, 0, W, H);
    bigText(c, 'PAUSED', W / 2, 200, 80, '#fff');
    ['RESUME', 'CHARACTER SELECT', 'MAIN MENU'].forEach((m, i) => bigText(c, m, W / 2, 320 + i * 60, 32, i === this.pauseIdx ? '#ffd35a' : '#aaa'));
  },

  // ---------- input per state ----------
  confirm() { return tapped('Enter', 'Space', 'KeyJ'); },
  gotoSelect() { this.state = 'select'; this.ready = [false, this.mode !== '2p']; },
  lockIn(slot) {
    this.ready[slot] = true; Sfx.confirm();
    if (this.ready[0] && this.ready[1]) {
      if (this.mode === 'arcade') { this.startArcade(CHARACTERS[this.sel[0]]); return; }
      if (this.mode !== '2p') { const others = CHARACTERS.filter((_, i) => i !== this.sel[0]); this.sel[1] = CHARACTERS.indexOf(pick(others)); }
      this.state = 'stage';
    }
  },
  moveSel(slot, dx, dy) { const n = CHARACTERS.length; let i = this.sel[slot] + dx + dy * 7; i = (i + n) % n; this.sel[slot] = i; this.ready[slot] = false; Sfx.select(); },
  menuChoose(i) {
    const m = MENU[i]; Sfx.confirm();
    if (m === 'DIFFICULTY') { this.cpuLevel = this.cpuLevel % 3 + 1; return; }
    if (m === 'HOW TO PLAY') { this.state = 'howto'; return; }
    this.mode = { ARCADE: 'arcade', 'VERSUS CPU': 'cpu', 'VERSUS 2 PLAYER': '2p', TRAINING: 'training' }[m];
    this.gotoSelect();
  },
  tapAt(x, y) {
    const inR = r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    if (this.cutscene) { Input.pressed.add('Space'); return; }
    switch (this.state) {
      case 'title': case 'story': case 'result': case 'ending': case 'howto': Input.pressed.add('Enter'); break;
      case 'menu': MENU.forEach((_, i) => { if (inR(this.menuRect(i))) { if (this.menuIdx === i) this.menuChoose(i); else { this.menuIdx = i; Sfx.select(); } } }); break;
      case 'select': CHARACTERS.forEach((_, i) => { if (inR(this.cardRect(i))) { if (this.sel[0] === i) this.lockIn(0); else { this.sel[0] = i; this.ready[0] = false; Sfx.select(); } } }); break;
      case 'stage': STAGES.forEach((_, i) => { if (inR(this.stageRect(i))) { if (this.stageIdx === i) Input.pressed.add('Enter'); else { this.stageIdx = i; Sfx.select(); } } }); break;
      case 'fight': if (y < 120 && Math.abs(x - W / 2) < 60) Input.pressed.add('Escape'); else if (this.paused) Input.pressed.add('Enter'); break;
    }
  },

  update(dt) {
    this.t += dt;
    if (this.cutscene) {
      const cs = this.cutscene; cs.t += dt;
      while (cs.cueIdx < cs.cues.length && cs.cues[cs.cueIdx][0] <= cs.t) cs.cues[cs.cueIdx++][1]();
      cs.fx.update(dt);
      if (cs.t >= cs.dur || (cs.t > 0.4 && tapped('Space', 'Enter'))) this.endCutscene();
      return;
    }
    this.shake = Math.max(0, this.shake - dt * 60);
    if (this.banner) { this.banner.t += dt; if (this.banner.t > this.banner.dur) this.banner = null; }
    for (const tx of this.texts) tx.t += dt;
    this.texts = this.texts.filter(tx => tx.t < 1);
    const up = tapped('KeyW', 'ArrowUp'), down = tapped('KeyS', 'ArrowDown'), left = tapped('KeyA', 'ArrowLeft'), right = tapped('KeyD', 'ArrowRight');
    switch (this.state) {
      case 'title': this.fx.update(dt); if (tapped('Enter', 'Space')) { this.state = 'menu'; Sfx.confirm(); } break;
      case 'menu':
        if (up) { this.menuIdx = (this.menuIdx + MENU.length - 1) % MENU.length; Sfx.select(); }
        if (down) { this.menuIdx = (this.menuIdx + 1) % MENU.length; Sfx.select(); }
        if ((left || right) && MENU[this.menuIdx] === 'DIFFICULTY') { this.cpuLevel = clamp(this.cpuLevel + (right ? 1 : -1), 1, 3); Sfx.select(); }
        if (tapped('Enter', 'Space')) this.menuChoose(this.menuIdx);
        if (tapped('Escape')) this.state = 'title';
        break;
      case 'howto': if (tapped('Enter', 'Escape', 'Space')) this.state = 'menu'; break;
      case 'select':
        if (tapped('Escape')) { this.state = 'menu'; break; }
        if (this.mode === '2p') {
          if (tapped('KeyA')) this.moveSel(0, -1, 0); if (tapped('KeyD')) this.moveSel(0, 1, 0); if (tapped('KeyW')) this.moveSel(0, 0, -1); if (tapped('KeyS')) this.moveSel(0, 0, 1);
          if (tapped('ArrowLeft')) this.moveSel(1, -1, 0); if (tapped('ArrowRight')) this.moveSel(1, 1, 0); if (tapped('ArrowUp')) this.moveSel(1, 0, -1); if (tapped('ArrowDown')) this.moveSel(1, 0, 1);
          if (tapped('KeyJ', 'Space')) this.lockIn(0); if (tapped('Numpad1', 'Comma', 'Enter')) this.lockIn(1);
        } else {
          if (left) this.moveSel(0, -1, 0); if (right) this.moveSel(0, 1, 0); if (up) this.moveSel(0, 0, -1); if (down) this.moveSel(0, 0, 1);
          if (this.confirm()) this.lockIn(0);
        }
        break;
      case 'stage':
        if (left) { this.stageIdx = (this.stageIdx + 5) % 6; Sfx.select(); } if (right) { this.stageIdx = (this.stageIdx + 1) % 6; Sfx.select(); }
        if (up || down) { this.stageIdx = (this.stageIdx + 3) % 6; Sfx.select(); }
        if (tapped('KeyR')) this.stageIdx = randi(0, 5);
        if (tapped('Escape')) this.gotoSelect();
        if (tapped('Enter', 'Space', 'KeyJ')) { Sfx.confirm(); this.startMatch(CHARACTERS[this.sel[0]], CHARACTERS[this.sel[1]], STAGES[this.stageIdx]); }
        break;
      case 'story': this.storyT += dt; if (this.storyT > 0.6 && tapped('Enter', 'Space', 'KeyJ')) { Sfx.confirm(); this.arcadeFight(); } break;
      case 'ending': this.storyT += dt; if (this.storyT > 1 && tapped('Enter', 'Space')) { this.arcade = null; this.state = 'menu'; } break;
      case 'fight':
        if (tapped('Escape', 'KeyP') && !this.roundOver) { this.paused = !this.paused; this.pauseIdx = 0; }
        if (this.paused) {
          if (up) this.pauseIdx = (this.pauseIdx + 2) % 3; if (down) this.pauseIdx = (this.pauseIdx + 1) % 3;
          if (tapped('Enter', 'Space')) { this.paused = false; if (this.pauseIdx === 1) this.gotoSelect(); if (this.pauseIdx === 2) this.state = 'menu'; }
          break;
        }
        this.updateFight(dt * this.slowmo);
        this.fx.update(dt * this.slowmo);
        break;
      case 'result':
        this.resultT += dt; this.fx.update(dt);
        if (this.resultT < 0.6) break;
        if (this.mode === 'arcade') {
          const won = this.matchWinner === this.p1;
          if (tapped('Enter', 'Space', 'KeyJ')) {
            if (!won) this.arcadeFight();
            else if (this.arcade.idx >= 5) { this.state = 'ending'; this.storyT = 0; Sfx.bell(); }
            else { this.arcade.idx++; this.state = 'story'; this.storyT = 0; }
          }
          if (tapped('Escape')) { this.arcade = null; this.state = 'menu'; }
        } else {
          if (tapped('Enter', 'Space', 'KeyJ')) this.startMatch(this.p1.def, this.p2.def, Arena.stage, this.p2.level);
          if (tapped('Escape')) this.gotoSelect();
        }
        break;
    }
  },
  draw(c) {
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    if (this.cutscene) {
      const cs = this.cutscene;
      c.save(); cs.draw(c, cs.t, cs); c.restore();
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (cs.name !== 'VERSUS') { letterbox(c, ease.out(seg(cs.t, 0, 0.3))); smallText(c, cs.name, 24, 32, 16, 'rgba(255,255,255,0.6)'); }
      smallText(c, 'SPACE / ENTER / TAP to skip', W - 24, H - 22, 14, 'rgba(255,255,255,0.5)', 'right');
      return;
    }
    switch (this.state) {
      case 'title': this.drawTitle(c); break;
      case 'menu': this.drawMenu(c); break;
      case 'howto': this.drawHowTo(c); break;
      case 'select': this.drawSelect(c); break;
      case 'stage': this.drawStageSelect(c); break;
      case 'story': this.drawStory(c); break;
      case 'fight': this.drawFight(c); if (this.paused) this.drawPause(c); break;
      case 'result': this.drawResult(c); break;
      case 'ending': this.drawEnding(c); break;
    }
  },
};

// ---------- boot ----------
City.generate();
Arena.load(STAGES[0]);
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  try { Game.update(dt); Game.draw(ctx); } catch (e) { console.error(e); }
  Input.pressed.clear();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.Game = Game;
