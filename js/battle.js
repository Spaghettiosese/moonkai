// ============================================================
//  MOONKAI — battle: sides/teams, controls, round flow, rendering glue
// ============================================================
const KEYS = [
  { left: ['KeyA', 'Pad0Left'], right: ['KeyD', 'Pad0Right'], up: ['KeyW', 'Pad0Up'], down: ['KeyS', 'Pad0Down'],
    L: ['KeyJ', 'Pad0A'], M: ['KeyK', 'Pad0X'], H: ['KeyL', 'Pad0Y'], S: ['KeyI', 'Pad0B'], SUP: ['KeyO', 'Pad0RB'], ULT: ['KeyP'], VAN: ['KeyH', 'Pad0LT'],
    SD: ['Space', 'Pad0LB'], DASH: ['ShiftLeft'], FORM: ['KeyU', 'Pad0Back'], SPARK: ['KeyB', 'Pad0L3'], C: ['KeyC', 'Pad0R3'], TAUNT: ['KeyT'], A1: ['KeyQ'], A2: ['KeyE', 'Pad0RT'] },
  { left: ['ArrowLeft', 'Pad1Left'], right: ['ArrowRight', 'Pad1Right'], up: ['ArrowUp', 'Pad1Up'], down: ['ArrowDown', 'Pad1Down'],
    L: ['Numpad1', 'Comma', 'Pad1A'], M: ['Numpad2', 'Period', 'Pad1X'], H: ['Numpad3', 'Slash', 'Pad1Y'], S: ['Numpad4', 'Semicolon', 'Pad1B'], SUP: ['Numpad5', 'Quote', 'Pad1RB'], ULT: ['Numpad6'], VAN: ['Numpad7', 'BracketRight', 'Pad1LT'],
    SD: ['Numpad0', 'BracketLeft', 'Pad1LB'], DASH: ['NumpadDecimal', 'ShiftRight'], FORM: ['Numpad8', 'Backslash', 'Pad1Back'], SPARK: ['Numpad9', 'Pad1L3'], C: ['NumpadMultiply', 'Pad1R3'], TAUNT: ['NumpadDivide'], A1: ['NumpadAdd'], A2: ['NumpadSubtract', 'Pad1RT'] },
];
function readPlayer(slot, st) {
  const K = KEYS[slot], H = a => a.some(held), P = a => a.some(c => Input.pressed.has(c));
  const x = (H(K.right) ? 1 : 0) - (H(K.left) ? 1 : 0), y = (H(K.down) ? 1 : 0) - (H(K.up) ? 1 : 0);
  const press = {};
  for (const b of ['L', 'M', 'H', 'S', 'SUP', 'ULT', 'VAN', 'SD', 'DASH', 'FORM', 'SPARK', 'TAUNT', 'A1', 'A2']) if (P(K[b])) press[b] = true;
  if (P(K.up)) press.UP = true; if (P(K.down)) press.DOWN = true; if (P(K.C)) press.C = true;
  if (press.M && press.H) { press.VAN = true; delete press.M; delete press.H; }
  // double-tap dash
  st.tap = st.tap || { l: -99, r: -99 }; const fr = Game.battle ? Game.battle.frame : 0;
  if (P(K.left)) { if (fr - st.tap.l < 12) press.DTL = true; st.tap.l = fr; }
  if (P(K.right)) { if (fr - st.tap.r < 12) press.DTR = true; st.tap.r = fr; }
  return { x, y, press, hold: { UP: H(K.up), C: H(K.C), A1: H(K.A1), A2: H(K.A2), L: H(K.L), S: H(K.S) } };
}
const EMPTY_CTL = () => ({ x: 0, y: 0, press: {}, hold: {} });

class Side {
  constructor(idx, fighters) {
    this.idx = idx; this.members = fighters; this.point = fighters[0];
    this.meter = 100; this.sparkUsed = false; this.assistCd = [0, 0]; this.combo = { hits: 0, dmg: 0, t: 0 };
    this.wins = 0; this.holdT = [0, 0]; this.inputState = {};
    fighters.forEach(f => f.side = this);
  }
  alive() { return this.members.filter(f => f.hp > 0 && f.state !== 'ko'); }
  koCount() { return this.members.filter(f => f.hp <= 0 || f.state === 'ko').length; }
  bench() { return this.members.filter(f => f !== this.point && f.state === 'benched' && f.hp > 0); }
}

class Battle {
  constructor(cfg) {
    this.cfg = cfg; this.frame = 0; this.hitstop = 0; this.freezeT = 0; this.struggle = null; this.pendingUlt = null; this.pendingRevive = null;
    this.round = 1; this.state = 'intro'; this.stateT = 0; this.slowmo = 1; this.stats = { dmg: [0, 0], maxCombo: [0, 0], hits: [0, 0], ults: [0, 0], counters: [0, 0], perfect: [true, true], start: performance.now() };
    this.stage = cfg.stage; this.training = !!cfg.training; this.team = cfg.teams[0].length > 1 || cfg.teams[1].length > 1;
    this.roundsToWin = cfg.roundsToWin || Math.ceil((cfg.rounds || Save.set.rounds) / 2);
    this.timeLimit = this.training ? 0 : (cfg.time ?? (this.team && Save.set.roundTime ? Math.max(Save.set.roundTime, 300) : Save.set.roundTime));
    const mkSide = (i) => new Side(i, cfg.teams[i].map((t, k) => new Fighter(t.def, null, k, { alt: t.alt, ctrl: t.ctrl, level: t.level, hpMult: t.hpMult })));
    this.sides = [mkSide(0), mkSide(1)];
    this.sides[0].enemy = this.sides[1]; this.sides[1].enemy = this.sides[0];
    this.dummy = { action: 'stand', guard: 'none', tech: true, meter: true };
    this.inputLog = []; this.frameInfo = null;
    Game.battle = this;
    this.startRound(true);
  }
  // ---------- accessors ----------
  points() { return this.sides.map(s => s.point); }
  all() { return this.sides.flatMap(s => s.members.filter(f => f.state !== 'benched')); }
  enemiesOf(side) { return side.enemy.members.filter(f => f.state !== 'benched' && f.state !== 'ko' && f.state !== 'tagout'); }
  live() { return this.state === 'fight'; }

  startRound(first) {
    Arena.load(this.nextStage || this.stage); this.stage = Arena.stage; this.nextStage = null;
    Combat.clear(); Game.fx.clear(); Game.texts = []; this.timeStop = null;
    const W0 = Arena.stage.width;
    this.sides.forEach((s, i) => {
      s.members.forEach(f => { if (f.baseDef) f.def = f.baseDef; f.marks = {}; f.gauge = f.def.gauge ? (f.def.gauge.init || 0) : 0; if (f.def.onRoundStart) f.def.onRoundStart(f); f.corrupted = false; f.cheated = false; f.dbCount = 0; f.hp = f.maxHp; f.red = f.maxHp; f.shownHp = f.maxHp; f.keepForm = false; f.revived = false; f.form = false; f.reset(W0 / 2 + (i ? 260 : -260), i ? -1 : 1); f.state = 'benched'; f.x = -999; });
      s.point = s.members[0]; s.point.state = 'intro'; s.point.x = W0 / 2 + (i ? 260 : -260); s.point.y = 0;
      s.meter = this.training ? METER_MAX : first ? 100 : Math.max(s.meter, 100); s.combo = { hits: 0, dmg: 0, t: 0 }; s.assistCd = [0, 0];
      if (!first || !this.team) s.sparkUsed = s.sparkUsed && !this.training;
    });
    // pre-awakened members (bosses): permanent for the whole match, no cutscene
    this.sides.forEach((s, i) => s.members.forEach((f, k) => { const tc = this.cfg.teams[i][k]; if (tc && tc.form && f.def.form) { f.form = true; f.formT = 0; f.def.form.onStart && f.def.form.onStart(f); } }));
    if (this.cfg.boss) this.sides[1].meter = Math.max(this.sides[1].meter, 200);
    Cam.reset(W0 / 2);
    this.timer = this.timeLimit; this.stateT = 0; this.slowmo = 1;
    this.state = first && this.cfg.intro !== false ? 'intro' : 'ready';
    if (this.state === 'intro') this.setupIntro();
    Music.play(this.cfg.music || Arena.stage.music);
    Save.bumpMap('stages', Arena.stage.id);
  }
  setupIntro() {
    const [a, b] = this.points();
    const lines = Dialogue.intro(a.def, b.def);
    this.introLines = lines; this.introIdx = 0; this.introT = 0;
    a.x -= 300; b.x += 300;
  }

  // ---------- controls ----------
  controlFor(f) {
    const s = f.side, isPoint = s.point === f;
    if (!isPoint || f.state === 'assist' || f.state === 'benched') return EMPTY_CTL();
    if (this.state !== 'fight') return EMPTY_CTL();
    let ctl;
    if (f.ctrl === 'human1' || f.ctrl === 'human2') {
      ctl = readPlayer(f.ctrl === 'human1' ? 0 : 1, s.inputState);
      if (f.status.confuse) ctl.x = -ctl.x;
    } else if (this.training && s.idx === 1) ctl = this.dummyControl(f);
    else ctl = cpuControl(f, this);
    if (ctl.press.DTL) ctl.press[f.facing < 0 ? 'FWD2' : 'BACK2'] = true;
    if (ctl.press.DTR) ctl.press[f.facing > 0 ? 'FWD2' : 'BACK2'] = true;
    // assists & tags (team mode)
    if (this.team) {
      for (const [k, key] of [[0, 'A1'], [1, 'A2']]) {
        if (ctl.hold[key]) { s.holdT[k]++; if (s.holdT[k] === 18) this.tagIn(s, k); }
        else { if (s.holdT[k] > 0 && s.holdT[k] < 18) this.callAssist(s, k); s.holdT[k] = 0; }
        if (ctl.press[key] && f.ctrl === 'cpu') this.callAssist(s, k);
      }
    }
    if (f.ctrl === 'human1') this.logInput(ctl);
    return ctl;
  }
  dummyControl(f) {
    const d = this.dummy, o = f.opp;
    if (d.action === 'cpu') return cpuControl(f, this);
    const ctl = EMPTY_CTL();
    if (d.action === 'crouch') ctl.y = 1;
    if (d.action === 'jump' && !f.airborne) ctl.press.UP = true;
    const attacking = o.state === 'move' || this.projectiles && false;
    const guard = d.guard === 'all' || (d.guard === 'after' && f.comboHits === 0 && f.state === 'block') || (d.guard === 'random' && Math.random() < 0.5);
    if (guard && (attacking || Combat.projectiles.some(p => p.side !== f.side))) { ctl.x = o.x > f.x ? -1 : 1; if (o.move && o.move.hit && o.move.hit.guard === 'low') ctl.y = 1; else if (o.airborne || (o.move && o.move.hit && o.move.hit.guard === 'high')) ctl.y = 0; }
    if (d.tech && f.state === 'hit' && f.launched) ctl.x = -f.facing;
    return ctl;
  }
  logInput(ctl) {
    const dirs = { '-1,-1': '↖', '0,-1': '↑', '1,-1': '↗', '-1,0': '←', '0,0': '•', '1,0': '→', '-1,1': '↙', '0,1': '↓', '1,1': '↘' };
    const btns = Object.keys(ctl.press).filter(k => !['UP', 'DOWN', 'DTL', 'DTR', 'FWD2', 'BACK2'].includes(k));
    const d = dirs[ctl.x + ',' + ctl.y];
    const last = this.inputLog[this.inputLog.length - 1];
    if (!last || last.d !== d || btns.length) this.inputLog.push({ d, b: btns.join('+'), t: this.frame });
    if (this.inputLog.length > 14) this.inputLog.shift();
  }

  // ---------- team: assists & tags ----------
  callAssist(s, k) {
    if (!this.team || s.assistCd[k] > 0 || this.state !== 'fight') return;
    const bench = s.members.filter(f => f !== s.point && f.hp > 0 && f.state === 'benched');
    const a = bench[k] || bench[0]; if (!a) return;
    const p = s.point, m = a.def.moves[a.def.assist || '5S'];
    if (!m) return;
    a.state = 'stand'; a.x = clamp(p.x - p.facing * 130, 60, Arena.stage.width - 60); a.y = -260; a.vy = 300; a.facing = p.facing; a.hp = Math.max(a.hp, 1);
    a.assistT = 0; a.isAssist = true; a.move = null;
    s.assistCd[k] = 6 * FPS;
    Game.fx.burst(a.x, a.y - 60, 20, { color: [a.def.color, '#fff'], size: 8, speed: 240, glow: true, life: 0.4 });
    Game.popWorld(a.x, a.y - 150, a.def.name + '!', a.def.color, 20);
    Sfx.whoosh();
    Game.later(0.12, () => { if (a.isAssist && a.state !== 'hit') { a.faceOpp(); a.startMove(m); } });
    const L = a.def.lines; if (L && L.assist) a.say(pick(L.assist), 70);
  }
  stepAssists() {
    for (const s of this.sides) for (const a of s.members) {
      if (!a.isAssist) continue;
      a.assistT++;
      const done = (a.state !== 'move' && a.state !== 'hit' && a.assistT > 20) || a.assistT > 150;
      if (a.hp <= 0) { a.isAssist = false; continue; }
      if (done) { a.state = 'tagout'; a.vy = -1400; a.vx = -a.facing * 300; a.isAssist = false; a.leaving = 40; }
    }
    for (const s of this.sides) for (const a of s.members) if (a.leaving) { a.leaving--; a.physics(false); a.y -= 20; if (a.leaving <= 0) { a.state = 'benched'; a.x = -999; a.leaving = 0; } }
  }
  tagIn(s, k) {
    if (!this.team || this.state !== 'fight') return;
    const p = s.point; if (!['stand', 'walk', 'crouch', 'air', 'cblock'].includes(p.state)) return;
    const bench = s.members.filter(f => f !== s.point && f.hp > 0 && f.state === 'benched');
    const n = bench[k] || bench[0]; if (!n) return;
    p.state = 'tagout'; p.leaving = 40; p.vy = -1400;
    n.state = 'air'; n.x = clamp(p.x + p.facing * 40, 60, Arena.stage.width - 60); n.y = -700; n.vy = 600; n.vx = 0; n.faceOpp();
    s.point = n; n.isAssist = false;
    Game.later(0.15, () => { if (n.airborne) n.startMove(n.normalsTable().jH); });
    Game.popWorld(n.x, -200, 'TAG IN!', n.def.color, 24); Sfx.whoosh();
    const L = n.def.lines; if (L && L.tag) n.say(pick(L.tag), 80);
  }

  // ---------- special events ----------
  superFreeze(f, m) {
    this.freezeT = m.kind === 'ult' ? 46 : 30; this.freezeBy = f; this.freezeMove = m;
    Cam.boost = 0.18; Sfx.charge(0.4); Sfx.tone(1600, 0.3, 'sine', 0.1, 400);
    Game.fx.burst(f.x, f.y - 70, 30, { color: ['#fff', f.def.color], size: 10, speed: 400, glow: true, life: 0.5 });
    if (m.kind === 'ult') { const L = f.def.lines; if (L && L.ult) f.say(pick(L.ult), 90); }
  }
  queueUlt(a, t, m) { if (!this.pendingUlt && m && m.ult) this.pendingUlt = { a, t, m }; }
  runPendingUlt() {
    const { a, t, m } = this.pendingUlt; this.pendingUlt = null;
    t.move = null; t.state = 'hit'; t.hitstun = 60; t.grabbedBy = null; a.grabbing = null;
    Combat.projectiles = Combat.projectiles.filter(p => p.side !== t.side);
    this.stats.ults[a.side.idx]++; Save.bump('ults'); Ach.check();
    const done = () => {
      const scale = Math.max(0.6, 1 - 0.04 * t.comboHits);
      t.comboHits = 0; t.invul = 0; t.downT = 0; t.state = 'hit';
      const dmg = Math.round((m.ult.dmg || 1100) * scale);
      Combat.resolveHit(t, a, H_({ dmg, guard: 'unblock', hs: 60, kb: [700, -700], launch: true, kd: 'hard', sfx: 'h', noScale: true }), { force: true, move: { kind: 'ult' } });
      Cam.shake = 30;
      if (m.ult.after) m.ult.after(a, t);
      Arena.destroyNear(t.x, 500, Game.fx);
      a.state = 'stand'; a.move = null; a.x = clamp(t.x - a.facing * 200, 60, Arena.stage.width - 60); a.y = 0;
      const L = a.def.lines; if (L && L.ultHit) a.say(pick(L.ultHit), 110);
    };
    if (Save.set.cutscenes === false) { done(); return; }
    Game.playCutscene(Cutscenes.ultFor(a, t, m), done);
  }
  startStruggle(b1, b2) {
    this.struggle = { beams: [b1, b2], bar: 0, t: 0, mash: [0, 0] };
    Game.announce('BEAM STRUGGLE!', '#fff'); Sfx.charge(1);
    b1.b.dur = b2.b.dur = 99999;
  }
  struggleLen(bm) {
    const S = this.struggle; const [a, b] = S.beams; const [ax] = Combat.beamOrigin(a), [bx] = Combat.beamOrigin(b);
    const mid = lerp(ax, bx, 0.5 + S.bar * 0.45);
    return Math.abs(mid - Combat.beamOrigin(bm)[0]);
  }
  stepStruggle() {
    const S = this.struggle; S.t++;
    for (let i = 0; i < 2; i++) {
      const f = S.beams[i].owner;
      let presses = 0;
      if (f.ctrl.startsWith('human')) { const c = readPlayer(f.ctrl === 'human1' ? 0 : 1, {}); presses = ['L', 'M', 'H', 'S', 'SUP'].filter(k => c.press[k]).length; }
      else presses = Math.random() < [0, 0.1, 0.16, 0.22, 0.28][f.level || 2] ? 1 : 0;
      S.bar += (i === 0 ? 1 : -1) * presses * 0.035 * (f.side.idx === 0 ? 1 : 1);
    }
    S.bar = clamp(S.bar, -1, 1);
    Cam.shake = 6; if (S.t % 6 === 0) Sfx.noise(0.1, 0.2, 3000);
    const [bA, bB] = S.beams;
    if (Math.abs(S.bar) >= 1 || S.t > 240) {
      const winB = S.bar >= 0 ? bA : bB, loseB = winB === bA ? bB : bA;
      const w = winB.owner, l = loseB.owner;
      this.struggle = null;
      loseB.b.dur = 0; winB.b.dur = winB.t + 20;
      l.move = null; l.state = 'stand';
      Combat.resolveHit(l, w, H_({ dmg: 320, guard: 'unblock', hs: 50, kb: [900, -500], launch: true, wb: true, sfx: 'h' }), { force: true, move: { kind: 'super' } });
      Game.announce(w.def.name + ' WINS THE STRUGGLE!', w.def.color);
      if (w.ctrl === 'human1') Ach.unlock('struggle');
    }
  }
  tryTransform(f) {
    const F = f.def.form;
    if (!F || f.form || F.manual === false || this.state !== 'fight') { if (F && F.manual === false && !f.form) Game.popWorld(f.x, f.y - f.h - 30, F.hint || 'CAN\'T TRANSFORM YET', '#aaa', 18); return false; }
    const gate = f.def.transformGate ? f.def.transformGate(f) : null;
    if (gate && !gate.ok) { Game.popWorld(f.x, f.y - f.h - 30, gate.msg || 'CAN\'T TRANSFORM', '#aab', 18); return false; }
    const cost = Battle.formCost(f, gate);
    const hpGate = F.hpGate ?? 0.6;
    if (!(gate && gate.ok && gate.skipHp) && f.hp > f.maxHp * hpGate) { Game.popWorld(f.x, f.y - f.h - 30, `WOUNDED BELOW ${Math.round(hpGate * 100)}% TO AWAKEN`, '#aab', 18); return false; }
    if (f.meter < cost) { Game.popWorld(f.x, f.y - f.h - 30, `NEED ${cost / 100} BARS`, '#7df', 18); return false; }
    f.meter -= cost; f.state = 'stand'; f.vx = 0; f.move = null;
    if (Save.set.cutscenes === false) { f.enterForm(); return true; }
    Game.playCutscene(Cutscenes.transform(f), () => f.enterForm());
    return true;
  }
  onKO(t, a, h) {
    if (t.state === 'ko') return;
    if (this.training) { t.hp = t.maxHp; t.red = t.maxHp; Game.popWorld(t.x, t.y - t.h - 40, 'HP RESET', '#7df', 24); return; }
    if (t.def.onDeath && t.def.onDeath(t, a, h) === true) return;
    // World Ender style awakenings: cheat death once while the form is active
    if (t.form && t.def.form && t.def.form.cheatDeath && !t.cheated) {
      t.cheated = true; t.hp = t.red = Math.round(t.maxHp * t.def.form.cheatDeath); t.invul = 60; t.move = null; t.state = 'stand'; t.y = Math.min(t.y, 0);
      Game.popWorld(t.x, t.y - t.h - 40, 'CHEATED DEATH!', t.def.color, 30); Game.fx.burst(t.x, t.y - 70, 60, { color: [t.def.color, '#000', '#fff'], size: 12, speed: 500, glow: true, life: 0.8 }); Cam.shake = 16; Sfx.roar && Sfx.roar();
      return;
    }
    // fallen god: KO'd while awakened by anyone who isn't divine -> rage and corrupt (once per round)
    if (t.def.corruptForm && t.form && !t.corrupted) {
      if (!(a && a.def && a.def.deity)) { t.corrupted = true; t.hp = 1; t.invul = 999; t.move = null; this.pendingCorrupt = t; return; }
      Game.popWorld(t.x, t.y - t.h - 50, 'JUDGED BY THE DIVINE', '#ffe08a', 26);
    }
    if (t.def.reviveForm && !t.revived) { t.revived = true; t.hp = 1; this.pendingRevive = t; return; }
    if (this.timeStop) this.endTimeStop();
    t.state = 'ko'; t.move = null; t.vy = Math.min(t.vy, -500); t.hp = 0;
    this.stats.perfect[t.side.idx] = false;
    const s = t.side;
    if (s.alive().length === 0 || !this.team) {
      this.state = 'ko'; this.stateT = 0; this.slowmo = 0.3; this.koBy = a; this.koVictim = t;
      Game.announce('K.O.', '#ff3b3b', 130); Sfx.ko(); Cam.shake = 20;
      if (h && (h.wb || Math.abs(h.kb[0]) >= 700) && (t.x < 350 || t.x > Arena.stage.width - 350)) this.destructive = true;
    } else {
      this.switchT = 70; this.switchSide = s;
      Game.announce(t.def.name + ' DOWN!', '#ff8a6a', 80);
    }
  }
  stepSwitch() {
    const s = this.switchSide; if (!s) return;
    if (--this.switchT === 0) {
      const old = s.point; old.state = 'benched'; old.x = -999;
      const n = s.alive()[0]; if (!n) return;
      s.point = n; n.state = 'air'; n.x = clamp(s.enemy.point.x + (s.idx ? 500 : -500), 100, Arena.stage.width - 100); n.y = -700; n.vy = 500; n.faceOpp();
      if (s.alive().length === 1) { s.meter = Math.min(METER_MAX, s.meter + 100); Game.announce('LAST STAND!', n.def.color, 70); }
      const L = n.def.lines; if (L && L.enter) n.say(pick(L.enter), 100);
      this.switchSide = null;
    }
  }

  // ---------- main frame ----------
  step() {
    this.frame++; this.stateT++;
    Game.fx.update(1 / FPS);
    for (const l of Game.laters.slice()) { if (--l.f <= 0) { Game.laters.splice(Game.laters.indexOf(l), 1); l.fn(); } }
    if (this.pendingRevive) { const t = this.pendingRevive; this.pendingRevive = null; Ach.unlock('revive'); Game.playCutscene(Cutscenes.transform(t), () => { t.hp = Math.round((t.def.reviveHp || 300) * HP_MULT); t.red = t.hp; t.shownHp = t.hp; t.state = 'stand'; t.y = 0; t.invul = 90; t.enterForm(); t.side.meter = Math.max(t.side.meter, 300); }); return; }
    if (this.pendingCorrupt) {
      const t = this.pendingCorrupt; this.pendingCorrupt = null;
      const apply = () => { t.corrupt(); t.hp = t.red = t.shownHp = Math.round(t.maxHp * (t.def.form.reviveFrac || 0.3)); t.state = 'stand'; t.y = 0; t.vx = t.vy = 0; t.invul = 90; t.side.meter = Math.max(t.side.meter, 200); };
      if (Save.set.cutscenes === false) apply(); else Game.playCutscene((t.def.corruptCutscene || Cutscenes.transform)(t), apply);
      return;
    }
    if (this.pendingUlt) { this.runPendingUlt(); return; }
    if (this.freezeT > 0) { this.freezeT--; return; }
    if (this.hitstop > 0) { this.hitstop--; return; }
    if (this.struggle) { this.stepStruggle(); Combat.update(); return; }
    switch (this.state) {
      case 'intro': return this.stepIntro();
      case 'ready':
        for (const f of this.points()) { f.state = 'stand'; f.step(EMPTY_CTL()); }
        if (this.stateT === 1) Game.announce(this.lastRound() ? 'FINAL ROUND' : this.team ? 'TEAM BATTLE' : 'ROUND ' + this.round, '#fff', 60);
        if (this.stateT === 62) { Game.announce('FIGHT!', '#ffd35a', 50); Sfx.confirm(); }
        if (this.stateT >= 80) { this.state = 'fight'; this.stateT = 0; }
        break;
      case 'fight': case 'ko': this.stepFight(); break;
      case 'roundEnd': this.stepRoundEnd(); break;
    }
  }
  lastRound() { return !this.team && this.sides.every(s => s.wins === this.roundsToWin - 1); }
  stepIntro() {
    const [a, b] = this.points();
    for (const f of [a, b]) { const tx = Arena.stage.width / 2 + (f.side.idx ? 260 : -260); f.x = lerp(f.x, tx, 0.06); f.faceOpp(); f.state = 'intro'; f.step(EMPTY_CTL()); }
    const L = this.introLines, cur = L[this.introIdx];
    this.introT++;
    if (cur && this.introT === 1) (cur[0] === 0 ? a : b).say(cur[1], 160);
    if (tapped('Enter', 'Space', 'KeyJ', 'Pad0A', 'Pad0Start')) { this.introIdx = L.length; }
    if (this.introT > 120) { this.introIdx++; this.introT = 0; }
    if (this.introIdx >= L.length) { a.sayT = b.sayT = 0; this.state = 'ready'; this.stateT = 0; }
    Cam.update(1 / FPS, this.points(), Arena.stage.width);
  }
  // ---------- stopped time (DIO) ----------
  startTimeStop(by, frames) {
    this.timeStop = { by, t: frames, max: frames };
    Game.popWorld(by.x, by.y - by.h - 50, 'TOKI WO TOMARE!', '#b8f07a', 26);
    Sfx.bell && Sfx.bell(); Sfx.tone(180, 1.2, 'sine', 0.12, 60);
  }
  endTimeStop() {
    const ts = this.timeStop; if (!ts) return;
    this.timeStop = null;
    for (const p of Combat.projectiles) p.tsFrozen = false;
    Game.popWorld(ts.by.x, ts.by.y - ts.by.h - 50, 'TOKI WA UGOKIDASU', '#e8f0ff', 22);
    Sfx.tone(60, 0.8, 'sine', 0.12, 180);
  }
  stepFight() {
    if (this.timeStop && --this.timeStop.t <= 0) this.endTimeStop();
    const pts = this.points();
    // controls first (assists may spawn), then everyone steps
    const ctls = new Map();
    for (const s of this.sides) for (const f of s.members) if (f.state !== 'benched') ctls.set(f, this.controlFor(f));
    for (const [f, c] of ctls) {
      if (f.leaving) continue;
      if (this.timeStop && f.side !== this.timeStop.by.side) continue;
      const slow = f.side.enemy.point.form && f.side.enemy.point.def.form.timeSlowOpp;
      if (slow && this.frame % 3 === 0) continue;
      f.step(c);
    }
    this.stepAssists(); this.stepSwitch();
    for (const s of this.sides) { if (s.combo.t > 0 && --s.combo.t === 0) s.combo = { hits: 0, dmg: 0, t: 0 }; s.assistCd = s.assistCd.map(v => Math.max(0, v - 1)); if (this.training && this.dummy.meter) s.meter = METER_MAX; }
    // bench regen of recoverable health
    for (const s of this.sides) for (const f of s.members) if (f.state === 'benched' && f.hp > 0 && f.hp < f.red && this.frame % 4 === 0) f.hp++;
    // body push + max separation
    const [p, q] = pts;
    if (p.state !== 'ko' && q.state !== 'ko' && !(p.move && p.move.pass) && !(q.move && q.move.pass) && p.state !== 'sdash' && q.state !== 'sdash' && p.state !== 'grabbed' && q.state !== 'grabbed' && rectsOverlap(p.rect(), q.rect())) {
      const push = ((p.w + q.w) / 2 - Math.abs(p.x - q.x)) / 2, d = p.x < q.x ? -1 : 1;
      p.x = clamp(p.x + d * push, p.w / 2 + 10, Arena.stage.width - p.w / 2 - 10); q.x = clamp(q.x - d * push, q.w / 2 + 10, Arena.stage.width - q.w / 2 - 10);
    }
    if (Math.abs(p.x - q.x) > 1700) { const mid = (p.x + q.x) / 2; p.x = mid + Math.sign(p.x - mid) * 850; q.x = mid + Math.sign(q.x - mid) * 850; }
    Combat.update();
    if (this.state === 'fight' && this.timeLimit && this.frame % FPS === 0 && !this.switchSide && !this.timeStop) {
      this.timer--;
      if (this.timer <= 0) { this.timer = 0; this.timeOut(); }
    }
    if (this.state === 'ko') { if (this.stateT > 36) this.slowmo = Math.min(1, this.slowmo + 0.05); if (this.stateT > 140) this.endRound(); }
    Arena.update(1 / FPS, Game.fx);
    Cam.update(1 / FPS, this.all().filter(f => f.state !== 'tagout'), Arena.stage.width);
  }
  timeOut() {
    const pct = s => s.members.reduce((a, f) => a + Math.max(0, f.hp), 0) / s.members.reduce((a, f) => a + f.maxHp, 0);
    const a = pct(this.sides[0]), b = pct(this.sides[1]);
    this.state = 'ko'; this.stateT = 0; this.slowmo = 1;
    this.timeoutWinner = a === b ? null : a > b ? this.sides[0] : this.sides[1];
    Game.announce('TIME!', '#ffd35a', 120);
  }
  endRound() {
    let winSide = this.timeoutWinner !== undefined ? this.timeoutWinner : (this.koVictim ? this.koVictim.side.enemy : null);
    this.timeoutWinner = undefined;
    if (winSide) winSide.wins++;
    this.roundWinner = winSide;
    if (winSide && winSide.idx === 0 && this.stats.perfect[1] === true && winSide.point.hp === winSide.point.maxHp) Ach.unlock('perfect');
    if (winSide && this.timer === 0) Ach.unlock('timeout');
    this.state = 'roundEnd'; this.stateT = 0; this.slowmo = 1;
    if (winSide) { const w = winSide.point; w.state = 'win'; w.vx = 0; const q = Dialogue.win(w.def, winSide.enemy.point.def); w.say(q, 200); this.lastQuote = q; }
    if (this.destructive) { this.destructive = false; this.nextStage = pick(STAGES.filter(s => s !== Arena.stage)); Ach.unlock('destructive'); Game.playCutscene(csDestructive(this.koVictim, Arena.stage, this.nextStage), () => {}); }
  }
  stepRoundEnd() {
    for (const f of this.all()) { if (f.state === 'win') f.step(EMPTY_CTL()); else if (f.state !== 'benched') f.physics(); }
    Cam.update(1 / FPS, this.points(), Arena.stage.width);
    if (this.stateT > 170 || (this.stateT > 30 && tapped('Enter', 'Space', 'KeyJ', 'Pad0A'))) {
      const done = this.team || this.sides.some(s => s.wins >= this.roundsToWin);
      if (done) { this.state = 'over'; this.result = { winner: this.roundWinner ? this.roundWinner.idx : -1, stats: this.stats, quote: this.lastQuote }; this.cfg.onEnd && this.cfg.onEnd(this.result); }
      else { this.round++; this.startRound(false); }
    }
  }

  // ---------- rendering ----------
  draw(c) {
    Arena.drawBack(c, Game.t);
    c.save(); Cam.apply(c);
    Arena.drawWorld(c, Game.t);
    for (const f of this.all()) if (f.def.drawWorldBack) f.def.drawWorldBack(c, f, this);
    Combat.drawBack(c, Game.t);
    const fs = this.all().filter(f => f.state !== 'benched').sort((a, b) => (a.state === 'move' ? 1 : 0) - (b.state === 'move' ? 1 : 0));
    for (const f of fs) f.draw(c);
    for (const f of fs) { if (f.def.drawWorldFront) f.def.drawWorldFront(c, f, this); this.drawMarks(c, f); }
    Combat.drawFront(c, Game.t);
    Game.fx.draw(c);
    Game.drawWorldTexts(c);
    if (Save.set.hitboxes || this.training && this.showBoxes) { for (const f of fs) { const r = f.rect(); c.strokeStyle = 'rgba(80,255,120,0.8)'; c.lineWidth = 2; c.strokeRect(r.x, r.y, r.w, r.h); } for (const b of Game.debugBoxes) { c.fillStyle = b.col; c.fillRect(b.r.x, b.r.y, b.r.w, b.r.h); } }
    Game.debugBoxes = [];
    c.restore();
    Arena.drawFront(c, Game.t);
    for (const f of this.all()) if (f.def.drawScreen) f.def.drawScreen(c, f, this);
    if (this.freezeT > 0) this.drawFreeze(c);
    if (this.struggle) this.drawStruggle(c);
    HUD.draw(c, this);
  }
  drawMarks(c, f) {
    const ks = Object.keys(f.marks || {}); if (!ks.length || f.state === 'benched') return;
    let row = 0;
    for (const k of ks) {
      const m = f.marks[k], y = f.y - f.h - 34 - row * 16, n = m.n, w = 11;
      for (let i = 0; i < Math.min(n, m.max); i++) {
        const x = f.x - (Math.min(n, m.max) - 1) * w / 2 + i * w;
        c.fillStyle = m.color; c.strokeStyle = '#000'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x + 5, y); c.lineTo(x, y + 6); c.lineTo(x - 5, y); c.closePath(); c.fill(); c.stroke();
      }
      row++;
    }
  }
  drawFreeze(c) {
    const f = this.freezeBy, m = this.freezeMove, k = this.freezeT;
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 0, W, H);
    if (m.kind === 'ult' || m.kind === 'super') {
      const slide = ease.out(Math.min(1, (46 - k) / 10));
      const left = f.side.idx === 0;
      c.save();
      c.fillStyle = hexA(f.def.color, 0.85);
      c.beginPath(); const y0 = H * 0.35; c.moveTo(left ? -40 : W + 40, y0); c.lineTo(left ? lerp(-40, W * 0.75, slide) : lerp(W + 40, W * 0.25, slide), y0 - 20); c.lineTo(left ? lerp(-40, W * 0.72, slide) : lerp(W + 40, W * 0.28, slide), y0 + 130); c.lineTo(left ? -40 : W + 40, y0 + 150); c.fill();
      const pimg = portrait(f.def, 160, { form: f.form, alt: f.alt, expr: 'shout' });
      c.drawImage(pimg, left ? lerp(-200, 60, slide) : lerp(W + 40, W - 220, slide), y0 - 20, 150, 150);
      bigText(c, m.name || 'SUPER', left ? lerp(-300, 240, slide) : lerp(W + 300, W - 240, slide), y0 + 62, m.kind === 'ult' ? 44 : 34, '#fff', '#000', left ? 'left' : 'right');
      if (m.kind === 'ult') smallText(c, 'LEVEL 3 ULTIMATE', left ? lerp(-300, 244, slide) : lerp(W + 300, W - 244, slide), y0 + 100, 14, '#ffd35a', left ? 'left' : 'right');
      c.restore();
    }
  }
  drawStruggle(c) {
    const S = this.struggle;
    c.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(c, W / 2 - 260, 150, 520, 50, 10); c.fill();
    const mid = W / 2 + S.bar * 240;
    const [a, b] = S.beams.map(bm => bm.owner);
    c.fillStyle = a.def.color; c.fillRect(W / 2 - 240, 166, mid - (W / 2 - 240), 18);
    c.fillStyle = b.def.color; c.fillRect(mid, 166, W / 2 + 240 - mid, 18);
    circle(c, mid, 175, 12, '#fff');
    bigText(c, 'MASH ATTACK BUTTONS!', W / 2, 225, 26, '#fff');
  }
}

// ---------- destructive finish cinematic ----------
function csDestructive(loser, fromStage, toStage) {
  const fx = new ParticleSystem();
  return {
    name: 'DESTRUCTIVE FINISH', dur: 3.2, fx, cues: [[0, () => Sfx.boom()], [0.8, () => Sfx.boom()], [1.6, () => Sfx.boom()]],
    draw(c, t) {
      c.save(); fromStage.sky(c, t, Arena); c.restore();
      const p = t / 3.2;
      c.save(); c.translate(W / 2, H / 2); c.scale(1 + p * 0.6, 1 + p * 0.6); c.translate(-W / 2, -H / 2);
      for (let i = 0; i < 6; i++) { const x = W * (i / 6) + ((t * 900) % (W / 6)); c.fillStyle = shadeHex('#2b2a4a', -0.2 + i * 0.05); c.fillRect(x - 40, H * 0.3 + (i % 2) * 60, 100, H); }
      c.restore();
      if (Math.random() < 0.9) for (let i = 0; i < 4; i++) fx.add({ x: W / 2 + rand(-40, 40), y: H / 2 + rand(-40, 40), vx: rand(-900, -300), vy: rand(-300, 300), life: 0.8, size: rand(6, 16), color: pick(['#888', '#aaa', '#ffae3b']), shape: 'rect', glow: false });
      fx.draw(c);
      c.save(); c.translate(W / 2, H / 2 + 60); c.rotate(t * 8); c.scale(1.6, 1.6); loser.def.draw(c, { pose: 'hurt_air', anim: t, transformed: loser.form, alt: loser.alt }); c.restore();
      speedLines(c, t, W / 2, H / 2, 'rgba(255,255,255,0.5)');
      titleSlam(c, 'DESTRUCTIVE FINISH!', 'NEXT: ' + toStage.name, t, 1.4, '#ffd35a', 80);
    },
  };
}
// Awakening is a comeback tool: it costs one bar more than listed and needs the fighter hurt.
Battle.formCost = (f, gate) => (gate && gate.cost !== undefined ? gate.cost : Math.min(METER_MAX, (f.def.form.cost ?? 200) + 100));
