// ============================================================
//  MOONKAI — game states, combat resolution, HUD, menus, main loop
// ============================================================
const Game = {
  state: 'title', t: 0,
  p1: null, p2: null,
  projectiles: [], beams: [], hazards: [], texts: [],
  fx: new ParticleSystem(),
  cutscene: null, shake: 0, hitstop: 0, slowmo: 1,
  sel: 0, banner: null, koT: 0, winner: null, afterCutscene: null,

  // ---------- flow ----------
  mode: 'versus',
  startFight(p1Def, p2Def) {
    this.p1 = new Fighter(p1Def, 300, 1, false);
    this.p2 = new Fighter(p2Def, W - 300, -1, true);
    this.projectiles = []; this.beams = []; this.hazards = []; this.texts = [];
    this.fx.clear(); City.generate();
    this.winner = null; this.koT = 0; this.slowmo = 1;
    this.state = 'fight';
    this.playCutscene(Cutscenes.versus(this.p1, this.p2), () => this.showBanner('FIGHT!', '#fff'));
  },
  playCutscene(cs, onEnd) {
    cs.t = 0; cs.onEnd = onEnd; cs.cueIdx = 0;
    cs.cues = (cs.cues || []).sort((a, b) => a[0] - b[0]);
    this.cutscene = cs;
  },
  endCutscene() {
    const cs = this.cutscene; this.cutscene = null;
    if (cs.onEnd) cs.onEnd();
  },
  cardLayout() { const cw = 220, ch = 290, gap = 22; return { cw, ch, gap, x0: W / 2 - (cw * CHARACTERS.length + gap * (CHARACTERS.length - 1)) / 2 }; },
  modeBtn: { x: W - 250, y: 20, w: 220, h: 40 },
  toggleMode() { this.mode = this.mode === 'versus' ? 'training' : 'versus'; Sfx.jump(); },
  showBanner(text, color, dur = 1.2) { this.banner = { text, color, t: 0, dur }; },
  popText(x, y, txt, color = '#fff', size = 26) { this.texts.push({ x, y, txt, color, size, t: 0 }); },

  triggerTransform(f) {
    f.act = null; f.vx = 0;
    this.playCutscene(Cutscenes.transform(f), () => {
      f.transformed = true; f.formT = FORM_TIME; f.energy = 0;
      f.y = Math.min(f.y, GROUND);
      this.shake = 16;
      this.fx.burst(f.x, f.y - 80, 60, { color: ['#fff', f.def.color], size: 12, speed: 500, glow: true, life: 0.8 });
      this.popText(f.x, f.y - f.h - 20, f.def.formName + '!', f.def.color, 34);
      if (f.id === 'eric') City.hit(f.x - 120, f.x + 120, GROUND - 100, 60, this.fx);
    });
  },
  triggerUlt(f, opp) {
    f.act = null; f.ult = 0; f.vx = 0;
    this.projectiles = this.projectiles.filter(p => p.owner !== opp);
    this.playCutscene(Cutscenes.ult(f, opp), () => this.applyUlt(f, opp));
  },
  applyUlt(f, opp) {
    this.shake = 30;
    const fx = this.fx;
    if (f.id === 'eric') {
      if (!f.transformed) { f.transformed = true; f.formT = 10; }
      City.destroyAll(b => (f.facing > 0 ? b.x + b.w > f.x : b.x < f.x), fx, true);
      this.hitUlt(opp, f, 34);
    } else if (f.id === 'kira') {
      City.destroyAll(b => Math.abs(b.x + b.w / 2 - opp.x) < 260, fx, true);
      this.hitUlt(opp, f, 30);
      f.hp = Math.min(f.maxHp, f.hp + 25);
      this.popText(f.x, f.y - f.h - 30, '+25 HP', '#7dff8a', 34);
    } else if (f.id === 'kael') {
      City.destroyAll(() => Math.random() < 0.75, fx, true);
      this.hitUlt(opp, f, 33);
    } else if (f.id === 'vex') {
      City.destroyAll(() => Math.random() < 0.6, fx, true);
      this.hitUlt(opp, f, 32);
      f.hp = Math.min(f.maxHp, f.hp + 10);
    }
  },
  hitUlt(opp, f, dmg) {
    opp.invuln = 0; opp.blocking = false;
    this.damage(opp, dmg, f, 700, true);
    this.fx.burst(opp.x, opp.y - 60, 80, { color: ['#fff', f.def.color], size: 16, speed: 600, glow: true, life: 1 });
  },

  // ---------- combat ----------
  damage(t, amt, src, kb = 200, unblockable = false) {
    if (t.hp <= 0 || t.invuln > 0) return;
    const dir = t.x >= src.x ? 1 : -1;
    let a = amt;
    const blocked = !unblockable && t.blocking && t.facing === -dir;
    if (blocked) a *= 0.2;
    if (t.transformed) a *= t.def.formArmor;
    t.hp = Math.max(0, t.hp - a);
    src.ult = Math.min(100, src.ult + a * 2.2);
    t.ult = Math.min(100, t.ult + a * 1.6);
    if (!src.transformed) src.energy = Math.min(100, src.energy + a * 1.8);
    if (src.id === 'vex' && src.transformed) { src.hp = Math.min(src.maxHp, src.hp + a * 0.35); }
    const [cx, cy] = t.center();
    if (blocked) {
      Sfx.block();
      this.fx.burst(cx - dir * t.w / 2, cy, 8, { color: '#9cf', size: 5, speed: 200, glow: true, life: 0.25 });
      t.vx = dir * kb * 0.3;
    } else {
      Sfx.hit();
      t.hurtT = kb > 400 ? 0.45 : 0.22; t.act = null;
      const heavy = t.transformed && t.id === 'eric';
      t.vx = dir * kb * (heavy ? 0.3 : 1);
      if (kb > 400 && !heavy) { t.vy = -420; t.onGround = false; }
      t.flash = 0.12;
      this.fx.burst(cx - dir * t.w / 3, cy - 10, 14, { color: ['#fff', '#ffe28a', src.def.color], size: 7, speed: 380, glow: true, life: 0.35 });
      this.hitstop = Math.min(0.12, 0.03 + a * 0.004);
    }
    this.shake = Math.max(this.shake, a * 0.8);
    this.popText(cx + rand(-15, 15), t.y - t.h - 10, Math.round(a).toString(), blocked ? '#9cf' : '#ffe28a');
    if (t.hp <= 0 && t.def.reviveForm && !t.transformed && !this.winner) { this.triggerRevive(t); return; }
    if (t.hp <= 0 && this.mode === 'training') {
      t.hp = t.maxHp; t.shownHp = t.maxHp; this.popText(t.x, t.y - t.h - 40, 'HP RESET', '#7df', 30); return;
    }
    if (t.hp <= 0 && !this.winner) this.onKO(src, t);
  },
  triggerRevive(f) {
    f.act = null; f.vx = 0; f.hurtT = 0;
    this.projectiles = []; this.beams = []; this.hazards = [];
    this.playCutscene(Cutscenes.transform(f), () => {
      f.transformed = true; f.formT = FORM_TIME; f.hp = 60; f.shownHp = 60; f.invuln = 1.2;
      f.y = GROUND; f.vy = 0; f.pose = 'idle';
      f.ult = Math.max(f.ult, 50);
      this.shake = 20;
      this.fx.burst(f.x, f.y - 70, 70, { color: ['#ff3b1a', '#ff8a1a', '#3fe0ff'], size: 12, speed: 520, glow: true, life: 0.9 });
      this.popText(f.x, f.y - f.h - 30, 'REVIVED — DEMON FORM', '#ff4a2a', 32);
      this.popText(f.x, f.y - f.h - 70, 'ULTIMATE UNLOCKED', '#ffd35a', 24);
    });
  },
  onKO(winner, loser) {
    this.winner = winner; this.koT = 3.2; this.slowmo = 0.3;
    this.showBanner('K.O.', '#ff3b3b', 2.5); Sfx.ko();
    this.shake = 25;
  },

  updateFight(dt) {
    const p1 = this.p1, p2 = this.p2;
    if (this.koT > 0) { this.koT -= dt / this.slowmo; if (this.koT <= 0) { this.state = 'end'; this.endT = 0; } }
    if (this.hitstop > 0) { this.hitstop -= dt; return; }
    const c1 = this.winner ? {} : playerControl();
    const training = this.mode === 'training';
    const c2 = this.winner ? {} : training ? (this.dummyFights ? cpuControl(p2, p1, dt) : { block: this.dummyBlock }) : cpuControl(p2, p1, dt);
    if (training) {
      p1.energy = Math.min(100, p1.energy + dt * 25); p1.ult = Math.min(100, p1.ult + dt * 25);
      if (tapped('KeyR')) { for (const f of [p1, p2]) { f.hp = f.maxHp; f.shownHp = f.maxHp; f.transformed = false; f.formT = 0; f.ult = 0; f.energy = 0; } p1.x = 300; p2.x = W - 300; City.generate(); this.popText(W / 2, 200, 'RESET', '#7df', 40); }
      if (tapped('KeyX')) this.damage(p1, 25, p2, 200, true);
      if (tapped('KeyC')) { this.dummyFights = !this.dummyFights; this.popText(p2.x, p2.y - p2.h - 30, this.dummyFights ? 'DUMMY: FIGHTS BACK' : 'DUMMY: PASSIVE', '#7df'); }
      if (tapped('KeyB')) { this.dummyBlock = !this.dummyBlock; this.popText(p2.x, p2.y - p2.h - 30, this.dummyBlock ? 'DUMMY: BLOCKING' : 'DUMMY: OPEN', '#7df'); }
    }
    if (tapped('KeyM') && !this.winner) { p1.energy = 100; p1.ult = 100; this.popText(p1.x, p1.y - p1.h - 30, 'DEMO: METERS FULL', '#7df'); }
    p1.update(c1, dt, p2);
    if (this.cutscene) return;
    p2.update(c2, dt, p1);
    if (this.cutscene) return;
    // push apart
    const r1 = p1.rect(), r2 = p2.rect();
    if (rectsOverlap(r1, r2) && p1.hp > 0 && p2.hp > 0) {
      const push = ((p1.w + p2.w) / 2 - Math.abs(p1.x - p2.x)) / 2;
      const d = p1.x < p2.x ? -1 : 1;
      p1.x += d * push; p2.x -= d * push;
    }
    // projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p.g) p.vy += p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      this.fx.add({ x: p.x, y: p.y, vx: -p.vx * 0.1 + rand(-20, 20), vy: rand(-20, 20), life: 0.25, size: p.r * 0.7, color: p.color, glow: true });
      const tgt = p.owner === p1 ? p2 : p1;
      const pr = { x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 };
      let dead = p.life <= 0 || p.x < -50 || p.x > W + 50 || p.y > GROUND;
      City.hit(p.x - 4, p.x + 4, p.y, 18 * dt * 8, this.fx);
      if (!dead && rectsOverlap(pr, tgt.rect()) && tgt.hp > 0) {
        this.damage(tgt, p.dmg, p.owner, 220); dead = true;
      }
      // projectile clash
      for (const q of this.projectiles) if (q !== p && q.owner !== p.owner && Math.hypot(q.x - p.x, q.y - p.y) < p.r + q.r) { q.life = 0; dead = true; }
      if (dead && p.kind === 'hellorb') {
        this.fx.burst(p.x, Math.min(p.y, GROUND), 40, { color: ['#ff3b1a', '#ff8a1a', '#ffd08a'], size: 14, speed: 380, glow: true, life: 0.6 });
        Sfx.boom(); this.shake = Math.max(this.shake, 10);
        City.hit(p.x - 70, p.x + 70, GROUND - 60, 50, this.fx);
        if (tgt.hp > 0 && Math.abs(tgt.x - p.x) < 90 + tgt.w / 2 && !rectsOverlap(pr, tgt.rect())) this.damage(tgt, 6, p.owner, 300);
      }
      if (dead) {
        this.fx.burst(p.x, p.y, 12, { color: [p.color, p.core], size: p.r * 0.8, speed: 250, glow: true, life: 0.35 });
        this.projectiles.splice(i, 1);
      }
    }
    // beams (ape mouth beam)
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i]; b.t += dt;
      if (b.t >= b.delay + b.life || b.owner.hp <= 0) { this.beams.splice(i, 1); continue; }
      if (b.t < b.delay) continue;
      const o = b.owner, [mx, my] = o.mouth();
      const x1 = o.facing > 0 ? W + 50 : -50;
      const rect = { x: Math.min(mx, x1), y: my - b.width / 2, w: Math.abs(x1 - mx), h: b.width };
      b.rect = rect;
      City.hit(rect.x, rect.x + rect.w, my, 180 * dt, this.fx);
      b.tick -= dt;
      const tgt = o === p1 ? p2 : p1;
      if (b.tick <= 0 && rectsOverlap(rect, tgt.rect())) { b.tick = 0.1; this.damage(tgt, b.dps * 0.1, o, 90); }
      this.shake = Math.max(this.shake, 5);
    }
    // hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i]; h.t += dt;
      const tgt = h.owner === p1 ? p2 : p1;
      if (h.kind === 'spike') {
        if (h.t >= h.delay && !h.done) {
          h.done = true; Sfx.slam();
          this.fx.burst(h.x, GROUND, 20, { color: ['#2a0040', '#b36bff'], size: 9, speed: 300, angle: -Math.PI / 2, spread: 0.5, life: 0.5 });
          if (rectsOverlap({ x: h.x - 28, y: GROUND - 140, w: 56, h: 140 }, tgt.rect())) this.damage(tgt, 11, h.owner, 480);
          City.hit(h.x - 28, h.x + 28, GROUND - 60, 30, this.fx);
        }
        if (h.t >= h.delay + h.active) this.hazards.splice(i, 1);
      } else if (h.kind === 'wave') {
        h.x += h.dir * 820 * dt;
        if (Math.random() < 0.8) this.fx.add({ x: h.x, y: GROUND - 5, vx: rand(-40, 40), vy: rand(-260, -120), life: 0.5, size: rand(6, 12), color: pick(['#776', '#998', '#554']), g: 700, shape: 'rect' });
        if (!h.done && rectsOverlap({ x: h.x - 30, y: GROUND - 50, w: 60, h: 50 }, tgt.rect())) { h.done = true; this.damage(tgt, 8, h.owner, 460); }
        City.hit(h.x - 20, h.x + 20, GROUND - 20, 60 * dt * 6, this.fx);
        if (h.t > h.life) this.hazards.splice(i, 1);
      }
    }
    City.update(dt, this.fx);
  },

  // ---------- drawing: fight ----------
  drawFight(c) {
    const moonFull = (this.p1.id === 'eric' && this.p1.transformed) || (this.p2.id === 'eric' && this.p2.transformed);
    const s = this.shake;
    c.save();
    if (s > 0) c.translate(rand(-s, s), rand(-s, s));
    City.drawSky(c, this.t, { fullMoon: moonFull });
    City.drawFar(c);
    City.drawNear(c);
    City.drawGround(c);
    // hazards telegraphs
    for (const h of this.hazards) {
      if (h.kind === 'spike') {
        if (h.t < h.delay) {
          const p = h.t / h.delay;
          ellipse(c, h.x, GROUND + 4, 34, 8, `rgba(179,107,255,${0.3 + p * 0.5})`);
        } else {
          const p = seg(h.t, h.delay, h.delay + 0.08) * (1 - seg(h.t, h.delay + h.active - 0.1, h.delay + h.active));
          c.fillStyle = '#12031a';
          for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(h.x + k * 12 - 9, GROUND); c.lineTo(h.x + k * 11, GROUND - (140 - Math.abs(k) * 30) * p); c.lineTo(h.x + k * 12 + 9, GROUND); c.fill(); }
          c.strokeStyle = '#b36bff'; c.lineWidth = 2; c.beginPath(); c.moveTo(h.x, GROUND); c.lineTo(h.x, GROUND - 140 * p); c.stroke();
        }
      } else if (h.kind === 'wave') {
        c.fillStyle = 'rgba(255,230,160,0.5)';
        c.beginPath(); c.moveTo(h.x - 40, GROUND); c.quadraticCurveTo(h.x, GROUND - 60, h.x + 40, GROUND); c.fill();
      }
    }
    // fighters (shadow, then body)
    for (const f of [this.p2, this.p1]) {
      ellipse(c, f.x, GROUND + 4, f.w * 0.7, 7, 'rgba(0,0,0,0.35)');
      c.save(); c.translate(f.x, f.y);
      if (f.pose === 'ko') { c.translate(0, -8); c.rotate(-f.facing * Math.PI / 2 * 0.95); c.translate(0, 0); }
      c.scale(f.scale * f.facing, f.scale);
      if (f.invuln > 0 && f.id === 'vex') c.globalAlpha = 0.5;
      f.def.draw(c, f);
      c.restore();
      if (f.flash > 0) {
        c.globalCompositeOperation = 'lighter'; c.globalAlpha = f.flash * 5;
        const r = f.rect(); glowCircle(c, f.x, r.y + r.h / 2, r.h * 0.6, 'rgba(255,255,255,0.5)');
        c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      }
      if (f.blocking) {
        c.strokeStyle = 'rgba(150,210,255,0.7)'; c.lineWidth = 3;
        const a0 = f.facing > 0 ? 0 : Math.PI;
        c.beginPath(); c.arc(f.x + f.facing * f.w * 0.3, f.y - f.h / 2, f.h * 0.55, a0 - Math.PI / 2.4, a0 + Math.PI / 2.4);
        c.stroke();
      }
    }
    // beams
    c.globalCompositeOperation = 'lighter';
    for (const b of this.beams) {
      const [mx, my] = b.owner.mouth();
      if (b.t < b.delay) { glowCircle(c, mx, my, 40 * (b.t / b.delay) + 10, 'rgba(255,250,210,1)', 'rgba(255,200,80,0)'); continue; }
      const k = 1 - seg(b.t, b.delay + b.life - 0.15, b.delay + b.life);
      const wdt = b.width * (0.8 + Math.sin(this.t * 60) * 0.1) * k;
      const x1 = b.owner.facing > 0 ? W + 50 : -50;
      const g = c.createLinearGradient(0, my - wdt, 0, my + wdt);
      g.addColorStop(0, 'rgba(255,160,40,0)'); g.addColorStop(0.35, 'rgba(255,210,90,0.85)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(0.65, 'rgba(255,210,90,0.85)'); g.addColorStop(1, 'rgba(255,160,40,0)');
      c.fillStyle = g; c.fillRect(Math.min(mx, x1), my - wdt, Math.abs(x1 - mx), wdt * 2);
      glowCircle(c, mx, my, 70 * k, 'rgba(255,255,230,1)', 'rgba(255,200,80,0)');
    }
    // projectiles
    for (const p of this.projectiles) {
      glowCircle(c, p.x, p.y, p.r * 2.6, p.color, 'rgba(0,0,0,0)');
      circle(c, p.x, p.y, p.r * 0.6, p.core);
    }
    c.globalCompositeOperation = 'source-over';
    this.fx.draw(c);
    // floating texts
    for (const tx of this.texts) {
      c.globalAlpha = 1 - seg(tx.t, 0.6, 1);
      bigText(c, tx.txt, tx.x, tx.y - tx.t * 50, tx.size, tx.color);
    }
    c.globalAlpha = 1;
    c.restore();
    this.drawHUD(c);
  },

  drawHUD(c) {
    const bars = (f, left) => {
      const x = left ? 40 : W - 40 - 480, y = 26, w = 480;
      // portrait badge
      const bx = left ? x : x + w - 64;
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(bx, y, 64, 64);
      c.save(); c.beginPath(); c.rect(bx, y, 64, 64); c.clip();
      drawCharAt(c, f.def, bx + 32, y + 165, 1.35, left ? 1 : -1, { pose: 'idle', anim: this.t, transformed: false });
      c.restore();
      c.strokeStyle = f.def.color; c.lineWidth = 3; c.strokeRect(bx, y, 64, 64);
      const hx = left ? x + 74 : x, hw = w - 74;
      // HP
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(hx, y, hw, 26);
      const fillW = hw * f.hp / f.maxHp, ghostW = hw * f.shownHp / f.maxHp;
      c.fillStyle = '#fff'; c.fillRect(left ? hx : hx + hw - ghostW, y + 3, ghostW, 20);
      const hg = c.createLinearGradient(0, y, 0, y + 26); hg.addColorStop(0, f.hp > 30 ? '#6dff7a' : '#ff5a4a'); hg.addColorStop(1, f.hp > 30 ? '#1f9e3a' : '#9e1f1f');
      c.fillStyle = hg; c.fillRect(left ? hx : hx + hw - fillW, y + 3, fillW, 20);
      bigText(c, f.def.name + (f.transformed ? '  ·  ' + f.def.formName : ''), left ? hx + 4 : hx + hw - 4, y + 42, 20, f.def.color, '#000', left ? 'left' : 'right');
      // transform meter
      const my = y + 56, mw = hw * 0.48;
      const tx = left ? hx : hx + hw - mw;
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(tx, my, mw, 12);
      const tv = f.def.reviveForm ? (f.transformed ? 1 : 0) : f.transformed ? f.formT / FORM_TIME : f.energy / 100;
      c.fillStyle = f.transformed ? f.def.color : (f.energy >= 100 ? (Math.sin(this.t * 10) > 0 ? '#9cf' : '#fff') : '#4a8cff');
      c.fillRect(left ? tx : tx + mw - mw * tv, my + 2, mw * tv, 8);
      smallText(c, f.def.reviveForm ? (f.transformed ? 'CORE SHATTERED · DEMON' : 'CORE INTACT · DIES ONCE TO TRANSFORM') : f.transformed ? 'FORM ACTIVE' : f.energy >= 100 ? (f.cpu ? 'TRANSFORM READY' : 'TRANSFORM READY [L]') : 'TRANSFORM', left ? tx : tx + mw, my + 22, 12, '#bcd', left ? 'left' : 'right');
      // ultimate meter
      const ux = left ? hx + hw * 0.52 : hx, uw = hw * 0.48;
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(ux, my, uw, 12);
      c.fillStyle = f.ult >= 100 ? (Math.sin(this.t * 12) > 0 ? '#ffd35a' : '#fff') : '#c9a23a';
      c.fillRect(left ? ux : ux + uw - uw * f.ult / 100, my + 2, uw * f.ult / 100, 8);
      smallText(c, f.def.reviveForm && !f.transformed ? 'ULTIMATE LOCKED UNTIL REVIVE' : f.ult >= 100 ? (f.cpu ? 'ULTIMATE READY' : 'ULTIMATE READY [I]') : 'ULTIMATE', left ? ux : ux + uw, my + 22, 12, '#fd8', left ? 'left' : 'right');
    };
    bars(this.p1, true); bars(this.p2, false);
    bigText(c, `CITY DAMAGE  $${City.damage.toFixed(1)}B`, W / 2, 40, 22, '#ff9a5a');
    if (this.mode === 'training') {
      bigText(c, 'TRAINING', W / 2, 96, 26, '#7df');
      smallText(c, `R reset · X hurt yourself 25 · C dummy ${this.dummyFights ? 'fights back' : 'passive'} · B dummy ${this.dummyBlock ? 'blocks' : 'open'} · meters refill fast`, W / 2, 120, 14, '#bfe9ff', 'center');
    }
    smallText(c, `${City.destroyed} buildings destroyed`, W / 2, 64, 14, '#caa', 'center');
    smallText(c, 'A/D move · W jump (Phoenix: hold to fly) · S block · J attack · K special · L transform · I ULTIMATE · M demo-fill meters · ESC menu', W / 2, H - 16, 14, 'rgba(255,255,255,0.7)', 'center');
    if (this.banner) {
      const b = this.banner, p = seg(b.t, 0, 0.2), out = 1 - seg(b.t, b.dur - 0.3, b.dur);
      c.save(); c.globalAlpha = out; c.translate(W / 2, H / 2 - 60); const s = lerp(2.5, 1, ease.out(p)); c.scale(s, s);
      bigText(c, b.text, 0, 0, 130, b.color); c.restore(); c.globalAlpha = 1;
    }
  },

  // ---------- title ----------
  drawTitle(c) {
    City.drawSky(c, this.t, { fullMoon: true, moonX: W / 2, moonY: 250 });
    City.drawFar(c); City.drawNear(c); City.drawGround(c);
    silhouette(c, o => drawCharAt(o, CHARACTERS[0], W / 2 - 60, GROUND + 10, 3.1, 1, { pose: 'idle', anim: this.t, transformed: true }), '#0a0612');
    c.globalCompositeOperation = 'lighter';
    for (const ex of [13, 23]) glowCircle(c, W / 2 - 60 + ex * 3.1, GROUND + 10 - 101 * 3.1 + Math.sin(this.t * 3) * 4.6, 18, 'rgba(255,30,30,1)', 'rgba(255,0,0,0)');
    c.globalCompositeOperation = 'source-over';
    bigText(c, 'MOONKAI', W / 2, 120, 140, '#ffd35a', '#2a1200');
    bigText(c, 'HEROES  ·  VILLAINS  ·  COLLATERAL DAMAGE', W / 2, 200, 26, '#fff', '#000');
    if (Math.sin(this.t * 4) > -0.3) bigText(c, 'PRESS ENTER  ·  OR TAP', W / 2, H - 70, 40, '#fff', '#000');
    smallText(c, 'Proof of concept  ·  3 fighters  ·  6 transformation & ultimate cutscenes', W / 2, H - 30, 16, 'rgba(255,255,255,0.7)', 'center');
  },

  // ---------- character select ----------
  drawSelect(c) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b0a1e'); g.addColorStop(1, '#2a1640');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    bigText(c, 'CHOOSE YOUR FIGHTER', W / 2 - 60, 50, 50, '#fff', '#000');
    const mb = this.modeBtn, tr = this.mode === 'training';
    c.fillStyle = tr ? 'rgba(80,200,255,0.25)' : 'rgba(255,211,90,0.2)'; c.fillRect(mb.x, mb.y, mb.w, mb.h);
    c.strokeStyle = tr ? '#7df' : '#ffd35a'; c.lineWidth = 2; c.strokeRect(mb.x, mb.y, mb.w, mb.h);
    bigText(c, 'MODE: ' + (tr ? 'TRAINING' : 'VERSUS'), mb.x + mb.w / 2, mb.y + mb.h / 2, 22, tr ? '#7df' : '#ffd35a', '#000');
    smallText(c, 'T or tap to switch', mb.x + mb.w / 2, mb.y + mb.h + 12, 12, '#aaa', 'center');
    const { cw, ch, gap, x0 } = this.cardLayout();
    CHARACTERS.forEach((d, i) => {
      const x = x0 + i * (cw + gap), y = 90, on = i === this.sel;
      c.fillStyle = on ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.35)';
      c.fillRect(x, y, cw, ch);
      c.save(); c.beginPath(); c.rect(x, y, cw, ch); c.clip();
      const gg = c.createRadialGradient(x + cw / 2, y + ch * 0.55, 10, x + cw / 2, y + ch * 0.55, 200);
      gg.addColorStop(0, d.color2); gg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gg; c.fillRect(x, y, cw, ch);
      const tr = on && Math.sin(this.t * 0.8) > 0.2;
      drawCharAt(c, d, x + cw / 2, y + ch - 30, tr && d.id === 'eric' ? 1.8 : 2, 1, { pose: on ? 'victory' : 'idle', anim: this.t, transformed: tr });
      c.restore();
      c.strokeStyle = on ? d.color : '#444'; c.lineWidth = on ? 4 : 2; c.strokeRect(x, y, cw, ch);
      bigText(c, d.name, x + cw / 2, y + ch + 26, 34, on ? d.color : '#999');
      smallText(c, d.side === 'VILLAIN' ? '☠ VILLAIN' : d.side === 'ANTI-HERO' ? '✦ ANTI-HERO' : '★ HERO', x + cw / 2, y + ch + 54, 15, d.side === 'VILLAIN' ? '#d58bff' : d.side === 'ANTI-HERO' ? '#ff8a6a' : '#8fd3ff', 'center');
    });
    const d = CHARACTERS[this.sel];
    const px = 90, py = 480;
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(px - 20, py - 20, W - 2 * (px - 20), 210);
    bigText(c, `${d.name} — ${d.title}`, px, py + 4, 28, d.color, '#000', 'left');
    // wrap bio
    c.font = '15px "Segoe UI", Roboto, Arial, sans-serif'; c.fillStyle = '#ddd'; c.textAlign = 'left';
    const words = d.bio.split(' '); let line = '', ly = py + 36;
    for (const w of words) { if (c.measureText(line + w).width > 470) { c.fillText(line, px, ly); line = ''; ly += 20; } line += w + ' '; }
    c.fillText(line, px, ly);
    let sy = ly + 30;
    for (const [k, v] of Object.entries(d.stats)) {
      smallText(c, k, px, sy, 13, '#aaa');
      for (let i = 0; i < 5; i++) { c.fillStyle = i < v ? d.color : '#333'; c.fillRect(px + 80 + i * 22, sy - 6, 18, 12); }
      sy += 18;
    }
    let my = py + 4;
    for (const [k, n, desc] of d.moves) {
      c.fillStyle = d.color; c.fillRect(620, my - 12, 26, 24);
      bigText(c, k, 633, my, 18, '#000', null);
      smallText(c, n, 656, my - 1, 17, '#fff');
      smallText(c, desc, 656, my + 18, 13, '#bbb');
      my += 44;
    }
    smallText(c, '← / → choose  ·  ENTER fight  ·  T switch Versus / Training  ·  touch: tap a fighter, tap again to fight', W / 2, H - 14, 15, 'rgba(255,255,255,0.7)', 'center');
  },

  // ---------- end screen ----------
  drawEnd(c) {
    this.drawFight(c);
    c.fillStyle = `rgba(0,0,0,${0.65 * seg(this.endT, 0, 0.5)})`; c.fillRect(0, 0, W, H);
    const w = this.winner; if (!w) return;
    c.globalAlpha = seg(this.endT, 0.2, 0.7);
    const isPlayer = w === this.p1;
    bigText(c, isPlayer ? 'VICTORY' : 'DEFEAT', W / 2, 130, 110, isPlayer ? '#ffd35a' : '#ff4a4a');
    drawCharAt(c, w.def, W / 2, 520, w.transformed && w.id === 'eric' ? 2.2 : 2.6, 1, { pose: 'victory', anim: this.t, transformed: w.transformed });
    bigText(c, `${w.def.name} WINS`, W / 2, 570, 44, w.def.color);
    smallText(c, `City damage: $${City.damage.toFixed(1)} billion  ·  ${City.destroyed} buildings destroyed`, W / 2, 610, 18, '#ffb080', 'center');
    smallText(c, w.def.side === 'VILLAIN' ? '"' + 'The city is quieter now." — ' + w.def.name : '"Sorry about the buildings." — ' + w.def.name, W / 2, 640, 16, '#ccc', 'center');
    smallText(c, 'ENTER or TAP: rematch  ·  ESC: character select', W / 2, 680, 18, '#fff', 'center');
    c.globalAlpha = 1;
  },

  // ---------- main update ----------
  update(dt) {
    this.t += dt;
    if (this.cutscene) {
      const cs = this.cutscene;
      cs.t += dt;
      while (cs.cueIdx < cs.cues.length && cs.cues[cs.cueIdx][0] <= cs.t) cs.cues[cs.cueIdx++][1]();
      cs.fx.update(dt);
      if (cs.t >= cs.dur || (cs.t > 0.4 && tapped('Space', 'Enter'))) this.endCutscene();
      return;
    }
    this.shake = Math.max(0, this.shake - dt * 60);
    if (this.banner) { this.banner.t += dt; if (this.banner.t > this.banner.dur) this.banner = null; }
    for (const tx of this.texts) tx.t += dt;
    this.texts = this.texts.filter(tx => tx.t < 1);

    if (this.state === 'title') {
      City.update(dt, this.fx); this.fx.update(dt);
      if (tapped('Enter', 'Space')) { this.state = 'select'; Sfx.blast(); }
    } else if (this.state === 'select') {
      if (tapped('ArrowLeft', 'KeyA')) { this.sel = (this.sel + CHARACTERS.length - 1) % CHARACTERS.length; Sfx.jump(); }
      if (tapped('ArrowRight', 'KeyD')) { this.sel = (this.sel + 1) % CHARACTERS.length; Sfx.jump(); }
      if (tapped('KeyT', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS')) this.toggleMode();
      if (tapped('Enter', 'Space')) {
        const others = CHARACTERS.filter((_, i) => i !== this.sel);
        this.startFight(CHARACTERS[this.sel], pick(others));
      }
    } else if (this.state === 'fight') {
      if (tapped('Escape')) { this.state = 'select'; return; }
      const sdt = dt * this.slowmo;
      this.updateFight(sdt);
      this.fx.update(sdt);
    } else if (this.state === 'end') {
      this.endT += dt;
      this.fx.update(dt); City.update(dt, this.fx);
      if (tapped('Enter')) this.startFight(this.p1.def, this.p2.def);
      if (tapped('Escape')) this.state = 'select';
    }
  },
  draw(c) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    if (this.cutscene) {
      const cs = this.cutscene;
      c.save(); cs.draw(c, cs.t, cs); c.restore();
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (cs.name !== 'VERSUS') {
        letterbox(c, ease.out(seg(cs.t, 0, 0.3)));
        smallText(c, cs.name, 24, 32, 16, 'rgba(255,255,255,0.6)');
      }
      smallText(c, 'SPACE / ENTER / TAP to skip', W - 24, H - 22, 14, 'rgba(255,255,255,0.5)', 'right');
      return;
    }
    if (this.state === 'title') this.drawTitle(c);
    else if (this.state === 'select') this.drawSelect(c);
    else if (this.state === 'fight') this.drawFight(c);
    else if (this.state === 'end') this.drawEnd(c);
  },
};

// ---------- boot ----------
City.generate();
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  try { Game.update(dt); Game.draw(ctx); }
  catch (e) { console.error(e); }
  Input.pressed.clear();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.Game = Game;
