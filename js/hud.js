// ============================================================
//  MOONKAI — battle HUD
// ============================================================
const HUD = {
  draw(c, B) {
    for (const s of B.sides) this.side(c, B, s);
    this.timer(c, B);
    for (const s of B.sides) this.combo(c, s);
    if (B.training) this.training(c, B);
    this.announce(c);
    if (Save.set.hints && B.state === 'fight' && B.frame < 600 && !B.training && B.sides.some(s => s.point.ctrl === 'human1'))
      smallText(c, 'L/M/H = J/K/L · Special = I (+direction) · Super = O · Ultimate = ↓+O or P · Vanish = K+L · Super Dash = Space · Awaken = U', W / 2, H - 12, 12, 'rgba(255,255,255,0.6)', 'center');
  },
  side(c, B, s) {
    const L = s.idx === 0, f = s.point, x0 = L ? 20 : W - 20, dir = L ? 1 : -1;
    // portrait
    const pw = 76, px = L ? x0 : x0 - pw, py = 14;
    c.save(); c.beginPath(); c.moveTo(px, py); c.lineTo(px + pw, py); c.lineTo(px + pw - (L ? 10 : 0), py + pw); c.lineTo(px + (L ? 0 : 10), py + pw); c.closePath(); c.clip();
    c.drawImage(portrait(f.def, 96, { form: f.form, alt: f.alt, expr: f.state === 'hit' ? 'shout' : undefined }), px, py, pw, pw);
    c.restore();
    c.strokeStyle = f.def.color; c.lineWidth = 3; c.strokeRect(px, py, pw, pw);
    // HP bar (skewed)
    const bw = 470, bh = 26, bx = L ? px + pw + 8 : px - 8 - bw, by = 20;
    const bar = (x, w, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, by); c.lineTo(x + w, by); c.lineTo(x + w - 10 * dir, by + bh); c.lineTo(x - 10 * dir, by + bh); c.closePath(); c.fill(); };
    c.fillStyle = 'rgba(0,0,0,0.65)'; c.beginPath(); c.moveTo(bx - 4, by - 4); c.lineTo(bx + bw + 4, by - 4); c.lineTo(bx + bw - 6, by + bh + 4); c.lineTo(bx - 14, by + bh + 4); c.closePath(); c.fill();
    const frac = v => clamp(v / f.maxHp, 0, 1);
    const seg = (v, col) => { const w = bw * frac(v); bar(L ? bx + bw - w : bx, w, col); };
    seg(f.red, 'rgba(200,40,40,0.8)');
    seg(f.shownHp, '#fff4b0');
    const hg = c.createLinearGradient(0, by, 0, by + bh); const low = f.hp < f.maxHp * 0.3;
    hg.addColorStop(0, low ? '#ff8a5a' : '#ffe86a'); hg.addColorStop(1, low ? '#b01a1a' : '#d08a10');
    c.fillStyle = hg; const w = bw * frac(f.hp); bar(L ? bx + bw - w : bx, w, hg);
    smallText(c, Math.ceil(f.hp), L ? bx + 8 : bx + bw - 8, by + bh / 2, 13, '#000', L ? 'left' : 'right');
    bigText(c, f.def.name + (f.form ? '  ·  ' + f.def.form.name : ''), L ? bx : bx + bw, by + bh + 17, 18, f.def.color, '#000', L ? 'left' : 'right');
    // team mini bars
    if (B.team) {
      const others = s.members.filter(m => m !== f);
      others.forEach((m, i) => {
        const mx = L ? bx + 260 + i * 110 : bx + bw - 260 - i * 110 - 100, my = by + bh + 10;
        c.globalAlpha = m.hp > 0 ? 1 : 0.35;
        c.drawImage(portrait(m.def, 96, { alt: m.alt }), mx, my, 26, 26);
        c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(mx + 30, my + 8, 70, 8);
        c.fillStyle = 'rgba(200,40,40,0.8)'; c.fillRect(mx + 30, my + 8, 70 * clamp(m.red / m.maxHp, 0, 1), 8);
        c.fillStyle = '#ffd35a'; c.fillRect(mx + 30, my + 8, 70 * clamp(m.hp / m.maxHp, 0, 1), 8);
        const cd = s.assistCd[i];
        if (cd > 0 && m.hp > 0) { c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(mx, my + 26 * (1 - cd / (6 * FPS)), 26, 26 * cd / (6 * FPS)); }
        c.globalAlpha = 1;
      });
    } else {
      for (let i = 0; i < B.roundsToWin; i++) { const cx = L ? bx + bw - 14 - i * 22 : bx + 14 + i * 22; circle(c, cx, by + bh + 18, 7, s.wins > i ? '#ffd35a' : 'rgba(0,0,0,0.6)'); c.strokeStyle = '#ffd35a'; c.lineWidth = 2; c.beginPath(); c.arc(cx, by + bh + 18, 7, 0, Math.PI * 2); c.stroke(); }
    }
    // fighter-specific resource gauge
    if (f.def.gauge) {
      const G = f.def.gauge, gw = 210, gx = L ? bx : bx + bw - gw, gy = by + bh + 30, v = clamp((f.gauge || 0) / G.max, 0, 1);
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(gx - 2, gy - 2, gw + 4, 10);
      if (G.pips) { for (let i = 0; i < G.max; i++) { const pw = gw / G.max; c.fillStyle = i < (f.gauge || 0) ? G.color : 'rgba(255,255,255,0.08)'; c.fillRect(gx + i * pw + 1, gy, pw - 2, 6); } }
      else { c.fillStyle = G.color; c.fillRect(L ? gx : gx + gw * (1 - v), gy, gw * v, 6); }
      if (G.icon) G.icon(c, f, L ? gx + gw + 14 : gx - 14, gy + 3);
      smallText(c, G.name + (G.label ? ' ' + G.label(f) : ''), L ? gx : gx + gw, gy + 16, 10, G.color, L ? 'left' : 'right');
    }
    // guard gauge
    if (f.guard > 5) { c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(L ? bx : bx + bw - 160, by - 9, 160, 4); c.fillStyle = f.guard > 70 ? '#ff5a5a' : '#9cf'; c.fillRect(L ? bx : bx + bw - 160 * f.guard / 100, by - 9, 160 * f.guard / 100, 4); }
    // ---- bottom: Ki meter ----
    const mx = L ? 20 : W - 20, my = H - 58;
    const bars = Math.floor(s.meter / 100), part = (s.meter % 100) / 100;
    c.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(c, L ? mx : mx - 330, my - 6, 330, 50, 10); c.fill();
    bigText(c, String(bars), L ? mx + 26 : mx - 26, my + 18, 40, bars ? '#5ad8ff' : '#678', '#000');
    for (let i = 0; i < 5; i++) {
      const sx = L ? mx + 52 + i * 52 : mx - 52 - (i + 1) * 52 + 4, sy = my + 10;
      c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(sx, sy, 48, 14);
      const fill = i < bars ? 1 : i === bars ? part : 0;
      if (fill > 0) { const g = c.createLinearGradient(sx, sy, sx, sy + 14); g.addColorStop(0, '#bff4ff'); g.addColorStop(1, '#2a8aff'); c.fillStyle = g; c.fillRect(L ? sx : sx + 48 * (1 - fill), sy, 48 * fill, 14); }
    }
    const human = f.ctrl.startsWith('human');
    const tags = [];
    const F = f.def.form;
    if (F && !f.form) tags.push(F.manual === false ? ['CORE INTACT', '#888'] : (() => { const g = f.def.transformGate && f.def.transformGate(f), c = Battle.formCost(f, g), hurt = f.hp <= f.maxHp * (F.hpGate ?? 0.6), ok = s.meter >= c && hurt && (!g || g.ok); return [ok ? 'AWAKEN READY' + (human ? ' [U]' : '') : !hurt ? 'AWAKEN · NEED WOUNDS' : 'AWAKEN ' + (c / 100) + ' BARS', ok ? '#ffd35a' : '#889']; })());
    if (f.form) tags.push([F.timed ? `${F.name} ${Math.ceil(f.formT / FPS)}s` : F.name, f.def.color]);
    tags.push([s.sparkUsed ? (f.spark ? 'SPARKING!' : 'SPARK USED') : 'SPARK' + (human ? ' [B]' : ''), s.sparkUsed ? (f.spark ? '#9cf' : '#555') : '#9cf']);
    if (f.def.ultLocked && f.def.ultLocked(f)) tags.push(['ULT LOCKED', '#888']);
    else if (s.meter >= 300) tags.push(['ULTIMATE' + (human ? ' [↓O]' : ''), '#ffd35a']);
    c.font = '10.5px "Segoe UI", Roboto, Arial, sans-serif'; let off = 52;
    tags.forEach(([t, col]) => { smallText(c, t, L ? mx + off : mx - off, my + 36, 10.5, col, L ? 'left' : 'right'); c.font = '10.5px "Segoe UI", Roboto, Arial, sans-serif'; off += c.measureText(t).width + 14; });
  },
  timer(c, B) {
    c.fillStyle = 'rgba(0,0,0,0.7)'; c.beginPath(); c.moveTo(W / 2 - 46, 12); c.lineTo(W / 2 + 46, 12); c.lineTo(W / 2 + 36, 72); c.lineTo(W / 2 - 36, 72); c.closePath(); c.fill();
    c.strokeStyle = '#ffd35a'; c.lineWidth = 2; c.stroke();
    bigText(c, B.timeLimit ? String(Math.ceil(B.timer)) : '∞', W / 2, 42, 40, B.timeLimit && B.timer < 10 ? '#ff5a5a' : '#fff');
    smallText(c, Arena.stage.name + (Arena.damage > 1 ? '  ·  $' + Arena.damage.toFixed(0) + 'B' : ''), W / 2, 86, 11, '#ffb080', 'center');
    if (Arena.stage.crowd && Arena.hype > 0.05) { c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(W / 2 - 60, 94, 120, 6); c.fillStyle = '#ffd35a'; c.fillRect(W / 2 - 60, 94, 120 * Arena.hype, 6); smallText(c, 'CROWD HYPE', W / 2, 106, 9, '#ffd35a', 'center'); }
  },
  combo(c, s) {
    if (s.combo.hits < 2) return;
    const L = s.idx === 0, x = L ? 40 : W - 40, y = 220;
    const a = Math.min(1, s.combo.t / 20);
    c.globalAlpha = a;
    bigText(c, s.combo.hits + '', x, y, 64, '#ffd35a', '#000', L ? 'left' : 'right');
    bigText(c, 'HITS', x, y + 40, 24, '#fff', '#000', L ? 'left' : 'right');
    smallText(c, Math.round(s.combo.dmg) + ' DMG', x, y + 64, 15, '#ff9a6a', L ? 'left' : 'right');
    c.globalAlpha = 1;
    if (s.point.ctrl === 'human1') {
      if (s.combo.hits >= 10) Ach.unlock('combo10'); if (s.combo.hits >= 25) Ach.unlock('combo25');
      if (s.combo.dmg >= s.enemy.point.maxHp * 0.4) Ach.unlock('combo_dmg');
      if (s.combo.hits > Save.rec.bestCombo) { Save.rec.bestCombo = s.combo.hits; }
    }
  },
  training(c, B) {
    const d = B.dummy;
    c.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(c, 20, 130, 250, 203, 8); c.fill();
    smallText(c, 'TRAINING', 32, 146, 13, '#7df');
    const rows = [['F1 Dummy', d.action.toUpperCase()], ['F2 Guard', d.guard.toUpperCase()], ['F3 Tech', d.tech ? 'ON' : 'OFF'], ['F4 Hitboxes', B.showBoxes ? 'ON' : 'OFF'], ['F5 Awaken (you)', B.sides[0].point.form ? 'ON' : 'OFF'], ['F6 Awaken (dummy)', B.sides[1].point.form ? 'ON' : 'OFF'], ['F7 Your HP', Math.round((B.myHp || 1) * 100) + '%'], ['F8 Dummy HP', Math.round((B.dumHp || 1) * 100) + '%'], ['F9 Clear damage', ''], ['R Reset position', '']];
    rows.forEach(([a, b], i) => { smallText(c, a, 32, 166 + i * 17, 12, '#bcd'); smallText(c, b, 258, 166 + i * 17, 12, '#fff', 'right'); });
    // input display
    c.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(c, 20, 341, 130, 16 + B.inputLog.length * 16, 8); c.fill();
    B.inputLog.slice().reverse().forEach((e, i) => smallText(c, e.d + ' ' + e.b, 30, 355 + i * 16, 13, i ? '#aab' : '#fff'));
    if (B.frameInfo) { c.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(c, W - 270, 130, 250, 60, 8); c.fill(); smallText(c, B.frameInfo.name, W - 258, 148, 13, '#ffd35a'); smallText(c, `Startup ${B.frameInfo.s}f · Active ${B.frameInfo.a}f · Recovery ${B.frameInfo.r}f`, W - 258, 166, 11, '#dde'); smallText(c, `Damage ${B.frameInfo.dmg} · Guard ${B.frameInfo.guard}`, W - 258, 182, 11, '#dde'); }
    const D = B.dmgLog, dm = B.sides[1].point;
    if (D) {
      c.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(c, W - 270, 198, 250, 98, 8); c.fill(); smallText(c, 'DAMAGE', W - 258, 214, 13, '#ff8a6a');
      const pct = v => Math.round(v / dm.maxHp * 100) + '%';
      [['Combo', D.cur ? `${Math.round(D.cur)} (${D.hits} hits · ${pct(D.cur)})` : '-'], ['Last combo', D.last ? `${Math.round(D.last)} (${D.lastHits} hits · ${pct(D.last)})` : '-'], ['Best combo', D.best ? `${Math.round(D.best)} · ${pct(D.best)}` : '-'], ['Total', Math.round(D.total)]]
        .forEach(([a, b], i) => { smallText(c, a, W - 258, 232 + i * 16, 12, '#bcd'); smallText(c, String(b), W - 30, 232 + i * 16, 12, '#fff', 'right'); });
    }
  },
  announce(c) {
    const a = Game.banner; if (!a) return;
    const p = Math.min(1, a.t / 8), out = 1 - seg(a.t, a.dur - 12, a.dur);
    c.save(); c.globalAlpha = out; c.translate(W / 2, H / 2 - 60); const s = lerp(2.2, 1, ease.out(p)); c.scale(s, s);
    bigText(c, a.text, 0, 0, a.text.length > 16 ? 60 : 96, a.color, '#000'); c.restore(); c.globalAlpha = 1;
  },
};
