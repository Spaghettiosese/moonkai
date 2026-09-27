// ============================================================
//  MOONKAI — ability building blocks + projectile/hazard simulation
// ============================================================
const Ab = {
  count(f, tag) { return Game.projectiles.filter(p => p.owner === f && p.tag === tag).length + Game.hazards.filter(h => h.owner === f && h.tag === tag).length; },
  proj(f, o) {
    const [hx, hy] = o.from || f.hand();
    const sp = o.speed || 700;
    const p = Object.assign({ x: hx, y: hy, vx: sp * f.facing, vy: 0, r: 10, dmg: 50, owner: f, color: '#fff', core: '#fff', life: 2, kind: 'orb', kb: 220, hits: new Set(), t: 0 }, o);
    if (o.angle !== undefined) { p.vx = Math.cos(o.angle) * sp * f.facing; p.vy = Math.sin(o.angle) * sp; }
    Game.projectiles.push(p); return p;
  },
  cast(f, dur = 0.3, pose = 'cast') { f.act = { type: 'cast', t: 0, dur, pose }; },
  melee(f, o) { f.act = Object.assign({ type: 'melee', t: 0, dur: 0.35, hitAt: 0.12, pose: 'punch', reach: 60, dmg: 60, kb: 260, done: false }, o); },
  dash(f, o) { f.act = Object.assign({ type: 'dash', t: 0, dur: 0.25, speed: 1100, dmg: 60, pose: 'dash', done: false, kb: 300 }, o); if (o.invuln) f.invuln = Math.max(f.invuln, o.dur || 0.25); },
  leap(f, o) {
    const tx = clamp(f.opp.x, 60, W - 60), dist = tx - f.x, T = o.time || 0.6;
    f.vx = dist / T; f.vy = -(0.5 * GRAV * Arena.stage.gravity * T); f.onGround = false;
    f.act = Object.assign({ type: 'leap', t: 0, dur: T + 0.6, pose: 'jump', landed: false }, o);
  },
  grab(f, o) {
    const opp = f.opp, gap = Math.abs(opp.x - f.x) - (opp.w + f.w) / 2;
    Ab.melee(f, { pose: 'punch', dur: 0.4, hitAt: 0.1, reach: 0, dmg: 0 });
    if (gap < (o.range || 50) && Math.abs(opp.y - f.y) < 60 && opp.canBeHit()) {
      f.act = Object.assign({ type: 'grab', t: 0, dur: o.dur || 0.9, pose: 'charge', victim: opp }, o);
      opp.status.grabbed = f.act.dur; opp.act = null; opp.vx = 0;
      Sfx.clang(); return true;
    }
    return false;
  },
  teleportBehind(f) {
    const opp = f.opp;
    Game.fx.burst(f.x, f.y - 60, 24, { color: [f.def.color, '#000'], size: 9, speed: 220, life: 0.45 });
    f.x = clamp(opp.x - opp.facing * (opp.w / 2 + f.w / 2 + 8), f.w / 2 + 10, W - f.w / 2 - 10);
    f.y = Math.min(f.y, GROUND); f.facing = opp.x >= f.x ? 1 : -1;
    Game.fx.burst(f.x, f.y - 60, 24, { color: [f.def.color, '#fff'], size: 9, speed: 220, life: 0.45, glow: true });
    Sfx.teleport();
  },
  hazard(o) { const h = Object.assign({ t: 0, done: false, hits: new Set() }, o); Game.hazards.push(h); return h; },
  strike(f, x, o = {}) { return Ab.hazard(Object.assign({ kind: 'strike', x, owner: f, delay: 0.45, dmg: 50, color: '#bff', style: 'bolt', life: 0.25 }, o)); },
  heal(f, amt) { const a = Math.min(amt, f.maxHp - f.hp); if (a <= 0) return; f.hp += a; Game.popText(f.x, f.y - f.h - 20, '+' + Math.round(a), '#7dff8a'); },
};

// ------------------------------------------------------------
const Combat = {
  update(dt) {
    const fx = Game.fx;
    const drop = (arr, x) => { const k = arr.indexOf(x); if (k >= 0) arr.splice(k, 1); };
    for (const p of Game.projectiles.slice()) {
      if (!Game.projectiles.includes(p)) continue;
      p.t += dt;
      const tgt = p.owner.opp;
      if (p.homing && tgt.hp > 0) {
        const [tx, ty] = tgt.center(), a = Math.atan2(ty - p.y, tx - p.x), cur = Math.atan2(p.vy, p.vx);
        let d = a - cur; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
        const na = cur + clamp(d, -p.homing * dt, p.homing * dt), sp = Math.hypot(p.vx, p.vy);
        p.vx = Math.cos(na) * sp; p.vy = Math.sin(na) * sp;
      }
      if (p.boomerang && p.t > p.boomerang) { const [ox, oy] = p.owner.center(); const a = Math.atan2(oy - p.y, ox - p.x); const sp = Math.hypot(p.vx, p.vy); p.vx = lerp(p.vx, Math.cos(a) * sp, dt * 6); p.vy = lerp(p.vy, Math.sin(a) * sp, dt * 6); if (Math.hypot(ox - p.x, oy - p.y) < 30) p.life = 0; }
      if (p.g) p.vy += p.g * dt * Arena.stage.gravity;
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.trail !== false && Math.random() < 0.8) fx.add({ x: p.x, y: p.y, vx: -p.vx * 0.08 + rand(-20, 20), vy: rand(-20, 20), life: 0.25, size: p.r * 0.7, color: p.color, glow: true });
      let dead = p.life <= 0 || p.x < -80 || p.x > W + 80 || p.y > GROUND + 5;
      Arena.hit(p.x - 4, p.x + 4, p.y, 12 * dt * 8, fx);
      const pr = { x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 };
      // walls block enemy projectiles
      for (const h of Game.hazards) if (h.kind === 'wall' && h.owner !== p.owner && !dead && rectsOverlap(pr, Combat.wallRect(h))) { h.hp -= p.dmg; dead = true; Sfx.block(); }
      if (!dead && !p.hits.has(tgt) && tgt.hp > 0 && rectsOverlap(pr, tgt.rect())) {
        const r = Game.hit(tgt, { dmg: p.dmg, src: p.owner, kb: p.kb, launch: p.launch, status: p.status, stun: p.stun, fromX: p.x, unblockable: p.unblockable });
        if (r && p.onHit) p.onHit(tgt, r);
        p.hits.add(tgt);
        if (!p.pierce) dead = true;
      }
      for (const q of Game.projectiles) if (q !== p && q.owner !== p.owner && !q.noClash && !p.noClash && Math.hypot(q.x - p.x, q.y - p.y) < p.r + q.r) { q.life = 0; dead = true; }
      if (dead) {
        if (p.explode) Combat.explode(p.x, Math.min(p.y, GROUND - 10), p.explode, p.owner, p.explodeDmg || p.dmg * 0.5, p.color, p.hits);
        fx.burst(p.x, p.y, 10, { color: [p.color, p.core], size: p.r * 0.8, speed: 250, glow: true, life: 0.35 });
        drop(Game.projectiles, p);
      }
    }
    for (const h of Game.hazards.slice()) {
      if (!Game.hazards.includes(h)) continue;
      h.t += dt;
      if (Combat.hz[h.kind](h, dt) === false) drop(Game.hazards, h);
    }
  },
  explode(x, y, r, owner, dmg, color, skip) {
    Game.fx.burst(x, y, 30, { color: [color, '#ffe28a', '#fff'], size: 14, speed: r * 3, glow: true, life: 0.5 });
    Sfx.boom(); Game.shake = Math.max(Game.shake, 8);
    Arena.hit(x - r, x + r, y, 60, Game.fx);
    const tgt = owner.opp;
    if (tgt && (!skip || !skip.has(tgt))) { const [cx, cy] = tgt.center(); if (Math.hypot(cx - x, cy - y) < r + tgt.w / 2) Game.hit(tgt, { dmg, src: owner, kb: 320, fromX: x }); }
  },
  wallRect(h) { return { x: h.x - h.w / 2, y: GROUND - h.hgt, w: h.w, h: h.hgt }; },
  hz: {
    spike(h) {
      const tgt = h.owner.opp;
      if (h.t >= h.delay && !h.done) {
        h.done = true; Sfx.slam();
        Game.fx.burst(h.x, GROUND, 18, { color: h.colors || ['#2a0040', '#b36bff'], size: 9, speed: 300, angle: -Math.PI / 2, spread: 0.5, life: 0.5 });
        if (rectsOverlap({ x: h.x - 30, y: GROUND - 150, w: 60, h: 150 }, tgt.rect())) Game.hit(tgt, { dmg: h.dmg, src: h.owner, kb: 200, launch: true, fromX: h.x, status: h.status });
        Arena.hit(h.x - 28, h.x + 28, GROUND - 60, 30, Game.fx);
      }
      return h.t < h.delay + (h.active || 0.35);
    },
    wave(h, dt) {
      h.x += h.dir * (h.speed || 820) * dt;
      if (Math.random() < 0.8) Game.fx.add({ x: h.x, y: GROUND - 5, vx: rand(-40, 40), vy: rand(-260, -120), life: 0.5, size: rand(6, 12), color: pick(h.colors || ['#776', '#998', '#554']), g: 700, shape: 'rect' });
      const tgt = h.owner.opp;
      if (!h.done && rectsOverlap({ x: h.x - 30, y: GROUND - 55, w: 60, h: 55 }, tgt.rect())) { h.done = true; Game.hit(tgt, { dmg: h.dmg, src: h.owner, kb: 380, launch: true, fromX: h.x - h.dir * 50 }); }
      Arena.hit(h.x - 20, h.x + 20, GROUND - 20, 40 * dt * 6, Game.fx);
      return h.t < (h.life || 0.7) && h.x > -50 && h.x < W + 50;
    },
    fall(h, dt) {
      if (h.t < h.delay) return true;
      h.y += 1300 * dt;
      if (Math.random() < 0.9) Game.fx.add({ x: h.x + rand(-10, 10), y: h.y, vx: 0, vy: -60, life: 0.4, size: rand(8, 16), color: h.look.glow, glow: true, grow: -10 });
      if (h.y >= GROUND - 20 && !h.done) {
        h.done = true;
        for (const f of [Game.p1, Game.p2]) if (Math.abs(f.x - h.x) < 50 + f.w / 2 && f.y > GROUND - 200) Game.hit(f, { dmg: 60, src: WORLD_SRC, kb: 260, fromX: h.x, launch: true });
        Game.fx.burst(h.x, GROUND - 10, 30, { color: [h.look.glow, h.look.rock, '#fff'], size: 12, speed: 380, life: 0.6, glow: true });
        Arena.hit(h.x - 50, h.x + 50, GROUND - 30, 80, Game.fx);
        Sfx.rock(); Game.shake = Math.max(Game.shake, 8);
        return false;
      }
      return true;
    },
    strike(h) {
      const tgt = h.owner.opp;
      if (h.t >= h.delay && !h.done) {
        h.done = true;
        if (h.style === 'bolt') Sfx.zap(); else if (h.style === 'anvil') Sfx.clang(); else Sfx.heal();
        Game.shake = Math.max(Game.shake, 6);
        if (Math.abs(tgt.x - h.x) < 34 + tgt.w / 2) Game.hit(tgt, { dmg: h.dmg, src: h.owner, kb: 160, stun: h.stun, fromX: h.x, status: h.status });
        Arena.hit(h.x - 20, h.x + 20, GROUND - 100, 60, Game.fx);
        Game.fx.burst(h.x, GROUND - 6, 16, { color: [h.color, '#fff'], size: 8, speed: 300, angle: -Math.PI / 2, spread: 1, glow: true, life: 0.4 });
      }
      return h.t < h.delay + h.life;
    },
    zone(h, dt) {
      h.tick = (h.tick || 0) - dt;
      if (h.tick <= 0) {
        h.tick = h.every || 0.5;
        const own = h.owner, tgt = own.opp;
        if (h.heal && Math.abs(own.x - h.x) < h.r) Ab.heal(own, h.heal);
        if (h.dmg && Math.abs(tgt.x - h.x) < h.r + tgt.w / 2 && tgt.y > GROUND - h.r * 1.2) Game.hit(tgt, { dmg: h.dmg, src: own, kb: 40, status: h.status, noFlinch: true, fromX: h.x });
      }
      if (h.follow) h.x = h.owner.x;
      return h.t < h.life && h.owner.hp > 0;
    },
    wall(h, dt) {
      if (!h.hitDone) {
        h.hitDone = true; const tgt = h.owner.opp;
        if (h.dmg && rectsOverlap(Combat.wallRect(h), tgt.rect())) Game.hit(tgt, { dmg: h.dmg, src: h.owner, kb: 300, launch: h.launch, fromX: h.x, status: h.status });
      }
      h.rise = Math.min(1, (h.rise || 0) + dt * 8);
      if (h.hp <= 0) { Game.fx.burst(h.x, GROUND - h.hgt / 2, 30, { color: h.colors, size: 10, speed: 300, g: 600, life: 0.8, shape: 'rect' }); Sfx.rock(); return false; }
      return h.t < h.life;
    },
    turret(h, dt) {
      h.cd = (h.cd || 0.6) - dt;
      const tgt = h.owner.opp;
      h.aim = Math.atan2(tgt.y - tgt.h / 2 - (GROUND - 40), tgt.x - h.x);
      if (h.cd <= 0 && tgt.hp > 0) {
        h.cd = 0.9; Sfx.tick();
        Game.projectiles.push({ x: h.x + Math.cos(h.aim) * 22, y: GROUND - 40 + Math.sin(h.aim) * 22, vx: Math.cos(h.aim) * 800, vy: Math.sin(h.aim) * 800, r: 5, dmg: 22, owner: h.owner, color: '#ffb020', core: '#fff', life: 1.5, kind: 'bolt', kb: 80, hits: new Set(), t: 0, noClash: true, tag: 'turretshot' });
      }
      if (h.hp <= 0) { Combat.explode(h.x, GROUND - 30, 40, h.owner, 0, '#ffb020'); return false; }
      return h.t < h.life && h.owner.hp > 0;
    },
    mine(h) {
      const tgt = h.owner.opp;
      if (h.t > 0.5 && Math.abs(tgt.x - h.x) < 30 + tgt.w / 2 && tgt.onGround) { Combat.explode(h.x, GROUND - 16, 70, h.owner, h.dmg, h.color); return false; }
      return h.t < h.life;
    },
  },

  // ---------- drawing ----------
  draw(c, t) {
    for (const h of Game.hazards) Combat.drawHz[h.kind] && Combat.drawHz[h.kind](c, h, t);
    for (const p of Game.projectiles) Combat.drawProj(c, p, t);
  },
  drawProj(c, p, t) {
    const ang = Math.atan2(p.vy, p.vx);
    c.save(); c.translate(p.x, p.y);
    switch (p.kind) {
      case 'shard':
        c.rotate(ang); c.fillStyle = '#e8fbff'; c.strokeStyle = '#6ac'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(p.r * 1.8, 0); c.lineTo(-p.r, -p.r * 0.6); c.lineTo(-p.r * 0.5, 0); c.lineTo(-p.r, p.r * 0.6); c.closePath(); c.fill(); c.stroke(); break;
      case 'rock':
        c.rotate(p.t * 8); c.fillStyle = p.color; c.strokeStyle = OUTLINE; c.lineWidth = 2;
        c.beginPath(); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = p.r * (0.8 + ((i * 37) % 5) / 12); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); break;
      case 'kunai':
        c.rotate(ang); c.fillStyle = '#ccd'; c.beginPath(); c.moveTo(16, 0); c.lineTo(0, -4); c.lineTo(0, 4); c.fill(); c.fillStyle = '#222'; c.fillRect(-12, -1.5, 12, 3); circle(c, -14, 0, 3, '#222'); break;
      case 'card':
        c.rotate(p.t * 14); c.fillStyle = '#fff'; c.fillRect(-7, -10, 14, 20); c.fillStyle = p.color; c.fillRect(-3, -4, 6, 8); c.strokeStyle = '#222'; c.lineWidth = 1; c.strokeRect(-7, -10, 14, 20); break;
      case 'missile':
        c.rotate(ang); c.fillStyle = '#ddd'; c.fillRect(-10, -3.5, 18, 7); c.fillStyle = '#e33'; c.beginPath(); c.moveTo(8, -3.5); c.lineTo(14, 0); c.lineTo(8, 3.5); c.fill();
        c.globalCompositeOperation = 'lighter'; glowCircle(c, -12, 0, 9, 'rgba(255,170,40,1)'); break;
      case 'spear':
        c.rotate(ang); c.globalCompositeOperation = 'lighter';
        c.fillStyle = hexA(p.color, 0.5); c.fillRect(-40, -5, 60, 10); c.fillStyle = '#fff'; c.fillRect(-36, -2, 56, 4);
        c.beginPath(); c.moveTo(34, 0); c.lineTo(18, -7); c.lineTo(18, 7); c.fill(); break;
      case 'ring':
        c.rotate(ang); c.strokeStyle = hexA(p.color, 0.9); c.lineWidth = 4;
        for (let i = 0; i < 3; i++) { c.globalAlpha = 1 - i * 0.3; c.beginPath(); c.arc(-i * 10, 0, p.r + i * 3, -1, 1); c.stroke(); } break;
      case 'bolt':
        c.rotate(ang); c.strokeStyle = p.color; c.lineWidth = 3; c.globalCompositeOperation = 'lighter';
        c.beginPath(); c.moveTo(p.r, 0); for (let i = 1; i < 5; i++) c.lineTo(p.r - i * 7, rand(-5, 5)); c.stroke(); glowCircle(c, 0, 0, p.r * 1.8, hexA(p.color, 0.7)); break;
      case 'hook':
        c.restore(); c.save();
        { const [hx, hy] = p.owner.hand(); c.strokeStyle = '#555'; c.lineWidth = 3; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(hx, hy); c.lineTo(p.x, p.y); c.stroke(); c.setLineDash([]); }
        c.translate(p.x, p.y); c.rotate(ang); c.fillStyle = '#ff3b1a'; c.beginPath(); c.moveTo(12, 0); c.lineTo(-4, -8); c.lineTo(0, 0); c.lineTo(-4, 8); c.fill(); break;
      default:
        c.globalCompositeOperation = 'lighter';
        glowCircle(c, 0, 0, p.r * 2.6, p.color, 'rgba(0,0,0,0)');
        circle(c, 0, 0, p.r * 0.6, p.core);
    }
    c.restore();
    c.globalCompositeOperation = 'source-over';
  },
  drawHz: {
    spike(c, h) {
      if (h.t < h.delay) { ellipse(c, h.x, GROUND + 4, 34, 8, hexA(h.tele || '#b36bff', 0.3 + h.t / h.delay * 0.5)); return; }
      const p = seg(h.t, h.delay, h.delay + 0.08) * (1 - seg(h.t, h.delay + (h.active || 0.35) - 0.1, h.delay + (h.active || 0.35)));
      c.fillStyle = h.fill || '#12031a';
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(h.x + k * 12 - 9, GROUND); c.lineTo(h.x + k * 11, GROUND - (150 - Math.abs(k) * 30) * p); c.lineTo(h.x + k * 12 + 9, GROUND); c.fill(); }
    },
    wave(c, h) { c.fillStyle = h.fill || 'rgba(255,230,160,0.5)'; c.beginPath(); c.moveTo(h.x - 40, GROUND); c.quadraticCurveTo(h.x, GROUND - 60, h.x + 40, GROUND); c.fill(); },
    fall(c, h, t) {
      const warn = 1 - seg(h.t, 0, h.delay);
      ellipse(c, h.x, GROUND + 4, 50, 10, hexA(h.look.glow, 0.25 + 0.3 * Math.abs(Math.sin(t * 12))));
      if (h.t >= h.delay) { c.fillStyle = h.look.rock; c.beginPath(); c.arc(h.x, h.y, 26, 0, Math.PI * 2); c.fill(); c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, h.y, 50, hexA(h.look.glow, 0.7)); c.globalCompositeOperation = 'source-over'; }
      void warn;
    },
    strike(c, h, t) {
      if (h.t < h.delay) { ellipse(c, h.x, GROUND + 4, 30, 7, hexA(h.color, 0.25 + 0.4 * h.t / h.delay)); c.fillStyle = hexA(h.color, 0.08); c.fillRect(h.x - 3, 0, 6, GROUND); return; }
      const k = 1 - seg(h.t, h.delay, h.delay + h.life);
      c.globalCompositeOperation = 'lighter';
      if (h.style === 'bolt') {
        c.strokeStyle = hexA(h.color, k); c.lineWidth = 6; c.beginPath(); let x = h.x + rand(-20, 20); c.moveTo(x, 0);
        for (let y = 0; y < GROUND; y += 40) { x = h.x + rand(-18, 18); c.lineTo(x, y); } c.lineTo(h.x, GROUND); c.stroke();
        c.strokeStyle = `rgba(255,255,255,${k})`; c.lineWidth = 2; c.stroke();
      } else if (h.style === 'anvil') {
        c.globalCompositeOperation = 'source-over';
        const y = lerp(-80, GROUND - 40, Math.min(1, (h.t - h.delay) * 8));
        c.fillStyle = '#333'; c.fillRect(h.x - 40, y, 80, 22); c.fillRect(h.x - 20, y + 22, 40, 18); c.fillRect(h.x - 32, y + 38, 64, 8);
      } else {
        const g = c.createLinearGradient(h.x - 30, 0, h.x + 30, 0);
        g.addColorStop(0, hexA(h.color, 0)); g.addColorStop(0.5, hexA(h.color, k)); g.addColorStop(1, hexA(h.color, 0));
        c.fillStyle = g; c.fillRect(h.x - 30, 0, 60, GROUND);
      }
      c.globalCompositeOperation = 'source-over';
    },
    zone(c, h, t) {
      c.globalCompositeOperation = 'lighter';
      const a = Math.min(1, h.t * 4) * (1 - seg(h.t, h.life - 0.3, h.life));
      c.save(); c.translate(h.x, GROUND); c.scale(1, 0.25);
      c.strokeStyle = hexA(h.color, 0.8 * a); c.lineWidth = 6; c.beginPath(); c.arc(0, 0, h.r, 0, Math.PI * 2); c.stroke();
      glowCircle(c, 0, 0, h.r, hexA(h.color, 0.25 * a), hexA(h.color, 0));
      c.restore();
      c.fillStyle = hexA(h.color, 0.08 * a); c.fillRect(h.x - h.r, GROUND - h.r * 0.9, h.r * 2, h.r * 0.9);
      if (Math.random() < 0.5) Game.fx.add({ x: h.x + rand(-h.r, h.r), y: GROUND, vx: 0, vy: rand(-120, -50), life: 0.8, size: rand(2, 4), color: h.color, glow: true });
      c.globalCompositeOperation = 'source-over';
    },
    wall(c, h) {
      const r = Combat.wallRect(h), hh = r.h * h.rise;
      if (h.style === 'ice') {
        const g = c.createLinearGradient(r.x, 0, r.x + r.w, 0); g.addColorStop(0, 'rgba(200,245,255,0.9)'); g.addColorStop(1, 'rgba(90,160,220,0.8)');
        c.fillStyle = g; c.beginPath(); c.moveTo(r.x, GROUND); c.lineTo(r.x + 4, GROUND - hh + 20); c.lineTo(r.x + r.w / 2, GROUND - hh); c.lineTo(r.x + r.w - 4, GROUND - hh + 14); c.lineTo(r.x + r.w, GROUND); c.fill();
        c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      } else {
        c.fillStyle = '#6b5a48'; c.strokeStyle = OUTLINE; c.lineWidth = 3;
        c.beginPath(); c.moveTo(r.x, GROUND); c.lineTo(r.x + 6, GROUND - hh + 10); c.lineTo(r.x + r.w * 0.6, GROUND - hh); c.lineTo(r.x + r.w, GROUND - hh + 16); c.lineTo(r.x + r.w, GROUND); c.fill(); c.stroke();
        c.strokeStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.moveTo(r.x + 8, GROUND - hh * 0.6); c.lineTo(r.x + r.w - 8, GROUND - hh * 0.5); c.stroke();
      }
    },
    turret(c, h, t) {
      c.fillStyle = '#556'; c.strokeStyle = OUTLINE; c.lineWidth = 2;
      c.beginPath(); c.moveTo(h.x - 18, GROUND); c.lineTo(h.x, GROUND - 28); c.lineTo(h.x + 18, GROUND); c.fill(); c.stroke();
      circle(c, h.x, GROUND - 40, 14, '#7a8594'); c.stroke();
      c.save(); c.translate(h.x, GROUND - 40); c.rotate(h.aim || 0); c.fillStyle = '#334'; c.fillRect(0, -4, 24, 8); c.restore();
      c.globalCompositeOperation = 'lighter'; glowCircle(c, h.x, GROUND - 40, 6 + Math.sin(t * 10) * 2, 'rgba(255,176,32,1)'); c.globalCompositeOperation = 'source-over';
      c.fillStyle = '#ffb020'; c.fillRect(h.x - 16, GROUND - 64, 32 * (1 - h.t / h.life), 3);
    },
    mine(c, h, t) { circle(c, h.x, GROUND - 6, 9, '#333'); circle(c, h.x, GROUND - 10, 3, Math.sin(t * 12) > 0 ? h.color : '#600'); },
  },
};
