// ============================================================
//  MOONKAI — CPU opponents (levels: 1 easy · 2 normal · 3 hard · 4 boss)
// ============================================================
function cpuControl(f, dt) {
  const o = f.opp, ctl = {};
  if (f.hp <= 0 || o.hp <= 0 || Game.roundOver) return ctl;
  const L = f.level;
  const react = [0, 0.6, 0.38, 0.22, 0.14][L], aggro = [0, 0.3, 0.45, 0.6, 0.7][L], guard = [0, 0.15, 0.35, 0.55, 0.7][L];
  const dx = o.x - f.x, gap = Math.abs(dx) - (o.w + f.w) / 2;
  const toward = dx > 0 ? 'right' : 'left', away = dx > 0 ? 'left' : 'right';
  const invisible = o.status.invis > 0;

  if (f.canUlt()) { f.aiUlt -= dt; if (f.aiUlt <= 0) { ctl.ult = true; f.aiUlt = rand(0.6, 2.5) / L; } }
  if (f.def.form.manual && !f.form && f.meter >= 100 && Math.random() < dt * 1.5) ctl.transform = true;

  // react to threats
  if (!f.aiThreatT || f.aiThreatT <= 0) {
    f.aiThreatT = react;
    const incoming = Game.projectiles.find(p => p.owner === o && Math.sign(p.vx) === Math.sign(f.x - p.x) && Math.abs(p.x - f.x) < 260 && Math.abs(p.y - (f.y - f.h / 2)) < 90);
    const swing = o.act && (o.act.type === 'melee' || o.act.type === 'dash') && gap < 110;
    if ((incoming || swing) && Math.random() < guard) {
      const r = Math.random();
      f.aiMode = incoming && r < 0.35 ? 'hop' : r < 0.8 || f.ki < 20 ? 'block' : 'evade';
      f.aiT = rand(0.25, 0.45);
    }
  } else f.aiThreatT -= dt;

  f.aiT -= dt;
  if (f.aiT <= 0) {
    f.aiT = rand(react * 0.6, react * 1.3) + 0.08;
    const picks = [];
    for (const i of [0, 1]) {
      const s = f.skill(i);
      if (!s || f.cd[i] > 0 || f.ki < s.ki) continue;
      let ok = gap >= s.ai[0] && gap <= s.ai[1];
      if (/Sanctuary|Holy/.test(s.name)) ok = f.hp < f.maxHp * 0.7;
      if (s.name === 'Rewind') ok = f.history[0] && f.history[0].hp > f.hp + 120;
      if (s.name === 'Veil') ok = Math.random() < 0.3;
      if (s.name === 'Core Guard') ok = gap < 220 && Math.random() < 0.4;
      if (/Grip/.test(s.name)) ok = gap < (f.form ? 70 : 45);
      if (ok) picks.push(i);
    }
    const r = Math.random();
    if (picks.length && r < aggro) f.aiMode = 'skill' + pick(picks);
    else if (invisible) f.aiMode = Math.random() < 0.5 ? 'block' : 'retreat';
    else if (gap > 70) f.aiMode = L >= 2 && Math.random() < 0.18 && f.ki > 40 ? 'dashin' : Math.random() < 0.15 ? 'jumpin' : 'approach';
    else f.aiMode = r < 0.75 ? 'attack' : r < 0.87 ? 'block' : 'retreat';
    if (f.ki < 18 && gap < 150 && Math.random() < 0.5) f.aiMode = 'retreat';
  }
  switch (f.aiMode) {
    case 'approach': ctl[toward] = true; break;
    case 'jumpin': ctl[toward] = true; ctl.jump = true; ctl.jumpHeld = true; f.aiMode = 'approach'; break;
    case 'dashin': ctl[toward] = true; ctl.dash = true; f.aiMode = 'attack'; break;
    case 'retreat': ctl[away] = true; break;
    case 'evade': ctl[away] = true; ctl.dash = true; f.aiMode = 'retreat'; break;
    case 'hop': ctl.jump = true; ctl[toward] = true; f.aiMode = 'approach'; break;
    case 'block': ctl.block = true; break;
    case 'attack': if (gap < 70) ctl.attack = true; else ctl[toward] = true; break;
    case 'skill0': ctl.skill1 = true; f.aiMode = 'approach'; break;
    case 'skill1': ctl.skill2 = true; f.aiMode = 'approach'; break;
  }
  if (f.form && f.def.form.flight && Math.random() < 0.3) ctl.jumpHeld = true;
  return ctl;
}
