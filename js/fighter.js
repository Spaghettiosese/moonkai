// ============================================================
//  MOONKAI — fighters, moves, combat, CPU brain
// ============================================================
const GRAV = 2300, JUMP_V = 920, BASE_SPEED = 330, FORM_TIME = 18;

class Fighter {
  constructor(def, x, facing, cpu) {
    this.def = def; this.id = def.id;
    this.x = x; this.y = GROUND; this.vx = 0; this.vy = 0;
    this.facing = facing; this.cpu = cpu;
    this.hp = 100; this.maxHp = 100; this.energy = 0; this.ult = 0;
    this.transformed = false; this.formT = 0;
    this.pose = 'idle'; this.anim = rand(0, 5);
    this.act = null; this.hurtT = 0; this.atkCd = 0; this.spCd = 0;
    this.blocking = false; this.onGround = true; this.flash = 0;
    this.combo = 0; this.comboT = 0; this.invuln = 0;
    this.aiT = 0; this.aiMode = 'approach'; this.aiUltDelay = rand(0.5, 2);
    this.shownHp = 100;
  }
  get scale() { return this.transformed ? this.def.formScale : 1; }
  get w() { return 44 * this.scale; }
  get h() { return 108 * this.scale; }
  rect() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  center() { return [this.x, this.y - this.h / 2]; }
  mouth() { return [this.x + this.facing * 25 * this.scale, this.y - 86 * this.scale]; }
  hand() { return [this.x + this.facing * 46 * this.scale, this.y - 80 * this.scale]; }
  speed() { return BASE_SPEED * (this.transformed ? this.def.formSpeed : 1); }
  busy() { return !!this.act || this.hurtT > 0; }

  update(ctl, dt, opp) {
    this.anim += dt;
    this.flash = Math.max(0, this.flash - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.atkCd -= dt; this.spCd -= dt; this.hurtT -= dt;
    this.comboT -= dt; if (this.comboT <= 0) this.combo = 0;
    this.shownHp = lerp(this.shownHp, this.hp, Math.min(1, dt * 3));

    if (this.hp <= 0) {
      this.pose = 'ko'; this.vx *= 0.92; this.physics(dt); return;
    }
    // meters
    if (!this.transformed) this.energy = Math.min(100, this.energy + dt * 3.2);
    this.ult = Math.min(100, this.ult + dt * 1.6);
    if (this.transformed) {
      this.formT -= dt;
      if (this.id === 'kira') this.hp = Math.min(this.maxHp, this.hp + dt * 1.2);
      this.formFx(dt);
      if (this.formT <= 0) this.revert();
    }

    // big moves
    if (ctl.ult && this.ult >= 100 && !this.act) { Game.triggerUlt(this, opp); return; }
    if (ctl.transform && this.energy >= 100 && !this.transformed && !this.act) { Game.triggerTransform(this); return; }

    // actions
    if (this.act) this.runAct(dt, opp);
    const busy = this.busy();
    this.blocking = !!ctl.block && this.onGround && !busy;

    if (!busy && !this.blocking) {
      const dir = (ctl.right ? 1 : 0) - (ctl.left ? 1 : 0);
      this.vx = lerp(this.vx, dir * this.speed(), Math.min(1, dt * 14));
      if (ctl.jump && this.onGround) {
        this.vy = -JUMP_V * (this.transformed ? this.def.formJump : 1); this.onGround = false; Sfx.jump();
      }
      if (ctl.attack && this.atkCd <= 0) this.startMelee();
      else if (ctl.special && this.spCd <= 0) this.startSpecial(opp);
    } else {
      this.vx *= Math.pow(0.001, dt);
    }
    // Phoenix flight: hold jump to climb / hover
    this.flying = false;
    if (this.id === 'kira' && this.transformed && ctl.jumpHeld && this.hurtT <= 0) {
      this.vy = Math.max(this.vy - 4200 * dt, -380); this.flying = true;
    }
    if (!busy && this.hp > 0) this.facing = opp.x >= this.x ? 1 : -1;
    this.physics(dt);

    // pose
    if (this.act) this.pose = this.act.pose;
    else if (this.hurtT > 0) this.pose = 'hurt';
    else if (this.blocking) this.pose = 'block';
    else if (this.flying || (this.id === 'kira' && this.transformed && !this.onGround)) this.pose = 'fly';
    else if (!this.onGround) this.pose = 'jump';
    else if (Math.abs(this.vx) > 30) this.pose = 'run';
    else this.pose = 'idle';
  }

  physics(dt) {
    const g = (this.id === 'kira' && this.transformed) ? GRAV * 0.55 : GRAV;
    this.vy += g * dt;
    this.x += this.vx * dt; this.y += this.vy * dt;
    const wasAir = !this.onGround;
    if (this.y >= GROUND) {
      this.y = GROUND; this.vy = 0;
      if (wasAir && this.transformed && this.id === 'eric') { Game.shake = Math.max(Game.shake, 8); Sfx.slam(); Game.fx.burst(this.x, GROUND, 18, { color: ['#776', '#998'], size: 10, speed: 260, angle: -Math.PI / 2, spread: 1.4, g: 500, life: 0.7 }); }
      this.onGround = true;
    } else this.onGround = false;
    if (this.y < 90) { this.y = 90; this.vy = Math.max(0, this.vy); }
    const half = this.w / 2 + 10;
    this.x = clamp(this.x, half, W - half);
  }

  formFx(dt) {
    const fx = Game.fx, [cx, cy] = this.center();
    if (this.id === 'kira' && Math.random() < dt * 40)
      fx.add({ x: cx + rand(-20, 20), y: cy + rand(-30, 40), vx: rand(-30, 30), vy: rand(-120, -40), life: rand(0.3, 0.7), size: rand(4, 9), color: pick(['#ffcc33', '#ff7a1a', '#ff3b1a']), glow: true, grow: -8 });
    if (this.id === 'vex' && Math.random() < dt * 30)
      fx.add({ x: cx + rand(-30, 30), y: cy + rand(-60, 60), vx: rand(-20, 20), vy: rand(-60, -10), life: rand(0.5, 1), size: rand(6, 12), color: pick(['rgba(40,0,60,0.7)', 'rgba(120,50,200,0.5)']), grow: 6 });
    if (this.id === 'eric' && Math.random() < dt * 6)
      fx.add({ x: this.x + rand(-40, 40), y: this.y - rand(0, this.h), vx: rand(-10, 10), vy: rand(-30, -10), life: 0.8, size: 3, color: '#fff3b0', glow: true });
  }

  revert() {
    this.transformed = false; this.formT = 0;
    Game.fx.burst(this.x, this.y - 60, 40, { color: ['#fff', this.def.color], size: 8, speed: 300, glow: true, life: 0.7 });
    Game.popText(this.x, this.y - 150, 'FORM FADES', '#ccc');
    Sfx.whoosh();
  }

  // ---------- moves ----------
  startMelee() {
    const ape = this.transformed && this.id === 'eric';
    this.act = { type: 'melee', t: 0, dur: ape ? 0.5 : 0.28, hitAt: ape ? 0.24 : 0.09, pose: 'punch', done: false };
    this.atkCd = ape ? 0.6 : 0.32;
    Sfx.whoosh();
  }
  startSpecial(opp) {
    const f = this, id = f.id, T = f.transformed;
    const [hx, hy] = f.hand();
    if (id === 'eric' && !T) {
      f.act = { type: 'cast', t: 0, dur: 0.3, pose: 'cast' }; f.spCd = 0.6;
      Game.projectiles.push({ x: hx, y: hy, vx: 720 * f.facing, vy: 0, r: 13, dmg: 8, owner: f, color: '#8fd3ff', core: '#fff', life: 2, kind: 'ki' });
      Sfx.blast();
    } else if (id === 'eric' && T) {
      f.act = { type: 'beam', t: 0, dur: 1.2, pose: 'cast' }; f.spCd = 3.2;
      Game.beams.push({ owner: f, t: 0, delay: 0.2, life: 0.95, width: 44, dps: 32, tick: 0 });
      Sfx.charge(0.2); Sfx.beam(1, 0.2);
    } else if (id === 'kira' && !T) {
      f.act = { type: 'cast', t: 0, dur: 0.22, pose: 'cast' }; f.spCd = 0.45;
      Game.projectiles.push({ x: hx, y: hy, vx: 980 * f.facing, vy: 0, r: 9, dmg: 6, owner: f, color: '#ff7a1a', core: '#fff3a0', life: 1.5, kind: 'fire' });
      Sfx.fire();
    } else if (id === 'kira' && T) {
      f.act = { type: 'cast', t: 0, dur: 0.3, pose: 'cast' }; f.spCd = 0.75;
      for (const a of [-0.18, 0, 0.18]) {
        Game.projectiles.push({ x: hx, y: hy, vx: Math.cos(a) * 900 * f.facing, vy: Math.sin(a) * 900, r: 10, dmg: 5.5, owner: f, color: '#ff9a1a', core: '#fffbd0', life: 1.4, kind: 'fire' });
      }
      Sfx.fire(); Sfx.screech();
    } else if (id === 'vex' && !T) {
      f.act = { type: 'cast', t: 0, dur: 0.35, pose: 'cast' }; f.spCd = 1.3;
      Game.hazards.push({ kind: 'spike', x: opp.x, t: 0, delay: 0.5, active: 0.3, owner: f, done: false });
      Sfx.teleport();
    } else if (id === 'vex' && T) {
      // Rift Step: vanish, reappear behind the enemy, slash
      Game.fx.burst(f.x, f.y - 70, 30, { color: ['#2a0040', '#b36bff'], size: 10, speed: 200, life: 0.5 });
      const behind = opp.x - opp.facing * (opp.w / 2 + f.w / 2 + 6);
      f.x = clamp(behind, f.w / 2 + 10, W - f.w / 2 - 10);
      f.y = GROUND; f.facing = opp.x >= f.x ? 1 : -1;
      Game.fx.burst(f.x, f.y - 70, 30, { color: ['#2a0040', '#b36bff'], size: 10, speed: 200, life: 0.5, glow: true });
      f.act = { type: 'melee', t: 0, dur: 0.32, hitAt: 0.06, pose: 'punch', done: false, dmg: 12, kb: 520 };
      f.spCd = 2.1; f.invuln = 0.15;
      Sfx.teleport();
    }
  }
  runAct(dt, opp) {
    const a = this.act;
    a.t += dt;
    if (a.type === 'melee' && !a.done && a.t >= a.hitAt) {
      a.done = true;
      const s = this.scale, reach = 58 * s;
      const box = { x: this.facing > 0 ? this.x : this.x - reach, y: this.y - 100 * s, w: reach, h: 80 * s };
      const ape = this.transformed && this.id === 'eric';
      if (ape) {
        // Seismic Smash: fist hits the ground, shockwave rolls out
        Game.shake = Math.max(Game.shake, 14); Sfx.slam();
        Game.hazards.push({ kind: 'wave', x: this.x + this.facing * 70, dir: this.facing, t: 0, life: 0.7, owner: this, done: false });
        City.hit(this.x + this.facing * 40, this.x + this.facing * 160, GROUND - 50, 30, Game.fx);
      }
      if (rectsOverlap(box, opp.rect())) {
        this.combo++; this.comboT = 0.9;
        const finisher = this.combo % 3 === 0;
        let dmg = a.dmg || (ape ? 12 : this.transformed ? 8 : 6);
        if (finisher) dmg *= 1.4;
        Game.damage(opp, dmg, this, a.kb || (finisher || ape ? 520 : 160));
        if (this.id === 'vex' && !this.transformed) opp.energy = Math.max(0, opp.energy - 10);
        if (this.id === 'kira') Game.fx.burst(opp.x, opp.y - 60, 12, { color: ['#ffcc33', '#ff5a1a'], size: 8, speed: 260, glow: true, life: 0.4 });
      }
    }
    if (a.t >= a.dur) this.act = null;
  }
}

// ---------- CPU brain ----------
function cpuControl(f, o, dt) {
  const ctl = {};
  if (f.hp <= 0 || o.hp <= 0) return ctl;
  const dx = o.x - f.x;
  const gap = Math.abs(dx) - (o.w + f.w) / 2;
  const toward = dx > 0 ? 'right' : 'left', away = dx > 0 ? 'left' : 'right';
  if (f.ult >= 100) { f.aiUltDelay -= dt; if (f.aiUltDelay <= 0) { ctl.ult = true; f.aiUltDelay = rand(0.5, 2.5); } }
  if (f.energy >= 100 && !f.transformed && Math.random() < dt * 1.2) ctl.transform = true;

  f.aiT -= dt;
  if (f.aiT <= 0) {
    f.aiT = rand(0.2, 0.55);
    const r = Math.random();
    if (o.act && o.act.type === 'melee' && gap < 70 && r < 0.35) f.aiMode = 'block';
    else if (gap > 260) f.aiMode = r < 0.45 ? 'shoot' : 'approach';
    else if (gap > 30) f.aiMode = r < 0.25 ? 'shoot' : r < 0.35 ? 'jumpin' : 'approach';
    else f.aiMode = r < 0.12 ? 'retreat' : 'attack';
  }
  switch (f.aiMode) {
    case 'approach': ctl[toward] = true; if (Math.random() < dt * 0.6) ctl.jump = true; break;
    case 'jumpin': ctl[toward] = true; ctl.jump = true; ctl.jumpHeld = true; break;
    case 'retreat': ctl[away] = true; break;
    case 'block': ctl.block = true; break;
    case 'shoot': ctl.special = true; break;
    case 'attack': ctl.attack = Math.random() < 0.6; if (Math.random() < 0.1) ctl.special = true; break;
  }
  if (f.id === 'kira' && f.transformed && Math.random() < 0.3) ctl.jumpHeld = true;
  return ctl;
}

function playerControl() {
  return {
    left: held('KeyA'), right: held('KeyD'), block: held('KeyS'),
    jump: tapped('KeyW'), jumpHeld: held('KeyW'),
    attack: tapped('KeyJ'), special: tapped('KeyK'),
    transform: tapped('KeyL'), ult: tapped('KeyI'),
  };
}
