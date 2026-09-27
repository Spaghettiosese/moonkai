// ============================================================
//  MOONKAI — game core: global helpers + main loop
// ============================================================
const Game = {
  t: 0, fx: new ParticleSystem(2400), texts: [], laters: [], debugBoxes: [], battle: null, cutscene: null, banner: null,
  later(sec, fn) { this.laters.push({ f: Math.max(1, Math.round(sec * FPS)), fn }); },
  announce(text, color = '#fff', frames = 90) { this.banner = { text, color, t: 0, dur: frames }; },
  popWorld(x, y, txt, color = '#fff', size = 20) { this.texts.push({ x, y, txt, color, size, t: 0 }); },
  drawWorldTexts(c) {
    for (const tx of this.texts) { c.globalAlpha = 1 - seg(tx.t, 36, 60); bigText(c, tx.txt, tx.x, tx.y - tx.t * 0.9, tx.size, tx.color); }
    c.globalAlpha = 1;
  },
  drawBubble(c, x, y, text, color, a = 1) {
    c.save(); c.globalAlpha = a;
    c.font = '15px "Segoe UI", Roboto, Arial, sans-serif';
    const lines = []; let line = '';
    for (const w of text.split(' ')) { if (c.measureText(line + w).width > 260) { lines.push(line); line = ''; } line += w + ' '; }
    lines.push(line);
    const bw = Math.max(...lines.map(l => c.measureText(l).width)) + 24, bh = lines.length * 19 + 14;
    c.fillStyle = 'rgba(255,255,255,0.95)'; roundRect(c, x - bw / 2, y - bh, bw, bh, 10); c.fill();
    c.strokeStyle = color; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x, y + 12); c.lineTo(x + 8, y); c.fill();
    c.fillStyle = '#111'; c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((l, i) => c.fillText(l.trim(), x, y - bh + 16 + i * 19));
    c.restore();
  },
  playCutscene(cs, onEnd) { cs.t = 0; cs.onEnd = onEnd; cs.cueIdx = 0; cs.cues = (cs.cues || []).sort((a, b) => a[0] - b[0]); this.cutscene = cs; },
  endCutscene() { const cs = this.cutscene; this.cutscene = null; if (cs && cs.onEnd) cs.onEnd(); },
  stats: {
    moveUsed(f, m) {
      const B = Game.battle; if (!B) return;
      if (B.training && f.ctrl === 'human1' && m.name !== 'land') B.frameInfo = { name: m.name, s: m.s, a: m.a, r: m.r, dmg: m.hit ? Math.round(m.hit.dmg) : '-', guard: m.hit ? m.hit.guard : '-' };
      if (f.ctrl === 'human1' && B.onMove) B.onMove(f, m);
    },
    hit(a, t, dmg, counter) {
      const B = Game.battle; if (!B) return; const i = a.side.idx;
      B.stats.dmg[i] += dmg; B.stats.hits[i]++; if (counter) B.stats.counters[i]++;
      B.stats.maxCombo[i] = Math.max(B.stats.maxCombo[i], t.comboHits + 1);
      if (t.side.idx !== i) B.stats.perfect[t.side.idx] = false;
      if (B.onHit) B.onHit(a, t, dmg);
    },
  },
};

// ---------- main loop ----------
let lastT = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  Game.t += dt;
  Pads.poll(); Music.update();
  let consumed = true;
  try {
    if (Game.cutscene) {
      const cs = Game.cutscene; cs.t += dt;
      while (cs.cueIdx < cs.cues.length && cs.cues[cs.cueIdx][0] <= cs.t) { try { cs.cues[cs.cueIdx++][1](); } catch (e) { console.error(e); } }
      cs.fx && cs.fx.update(dt);
      if (cs.t >= cs.dur || (cs.t > 0.4 && tapped('Space', 'Enter', 'Pad0A', 'Pad0Start', 'Pad1A'))) Game.endCutscene();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      if (Game.cutscene === cs || !Game.cutscene) {
        ctx.save(); cs.draw(ctx, cs.t, cs); ctx.restore();
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        if (cs.name !== 'VERSUS') { letterbox(ctx, ease.out(seg(cs.t, 0, 0.3))); smallText(ctx, cs.name, 24, 32, 16, 'rgba(255,255,255,0.6)'); }
        smallText(ctx, 'SPACE / ENTER / TAP to skip', W - 24, H - 22, 14, 'rgba(255,255,255,0.5)', 'right');
      }
    } else {
      const scr = UI.top();
      const r = scr.update ? scr.update(dt) : null;
      if (r === 'noconsume') consumed = false;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      scr.draw(ctx, dt);
    }
    if (Game.banner) { Game.banner.t++; if (Game.banner.t > Game.banner.dur) Game.banner = null; }
    for (const tx of Game.texts) tx.t++;
    Game.texts = Game.texts.filter(tx => tx.t < 60);
    Ach.draw(ctx, dt);
  } catch (e) { console.error(e); }
  if (consumed) Input.pressed.clear();
  requestAnimationFrame(frame);
}
