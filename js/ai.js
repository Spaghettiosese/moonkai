// ============================================================
//  MOONKAI — CPU opponents. Levels: 1 easy · 2 normal · 3 hard · 4 boss
// ============================================================
const AI_P = {
  react: [0, 24, 14, 8, 5], block: [0, 0.22, 0.5, 0.74, 0.86], combo: [0, 0.45, 0.72, 0.92, 1], aggro: [0, 0.35, 0.5, 0.62, 0.72],
  anti: [0, 0.15, 0.4, 0.65, 0.8], tech: [0, 0.2, 0.5, 0.8, 0.95], meterUse: [0, 0.3, 0.6, 0.9, 1],
};
const SLOT_DIR = { '5S': [0, 0], '6S': [1, 0], '4S': [-1, 0], '2S': [0, 1], 'jS': [0, 0] };

function aiSpecials(f, filter) {
  const out = [];
  for (const slot of ['5S', '6S', '2S', '4S', 'jS']) {
    const m = f.special(slot); if (!m) continue;
    if ((slot === 'jS') !== f.airborne && !(slot !== 'jS' && m.air && f.airborne)) continue;
    if (!f.cdOK(m)) continue;
    const ai = m.ai || { min: 0, max: 400, use: 'combo' };
    if (filter(ai, m, slot)) out.push(slot);
  }
  return out;
}
function press(ctl, f, step) {
  ctl.press[step.b] = true;
  if (step.rel !== undefined) ctl.x = step.rel * f.facing;
  if (step.y !== undefined) ctl.y = step.y;
}
function makeRoute(f, L) {
  const m = f.meter, R = [];
  const specs = aiSpecials(f, ai => ['combo', 'approach', 'zone', 'grab', 'anti'].includes(ai.use) && ai.use !== 'grab');
  const sp = specs.length ? pick(specs) : null;
  const spStep = sp ? { b: 'S', rel: SLOT_DIR[sp][0], y: SLOT_DIR[sp][1] } : null;
  const r = Math.random();
  if (L <= 1) return [{ b: 'L' }, { b: 'L' }, { b: 'L' }];
  if (r < 0.35) return [{ b: 'L' }, { b: 'L' }, { b: 'L' }, { b: 'L' }, { b: 'L' }, { b: 'L' }, { b: 'L' }];
  R.push({ b: 'L' }, { b: 'L' }, { b: 'M' });
  if (L >= 3 && Math.random() < 0.5) R.push({ b: 'H', y: 1 }, { b: 'L' }, { b: 'M' }, { b: 'H' });
  else if (spStep) R.push(spStep);
  if (m >= 300 && L >= 2 && Math.random() < AI_P.meterUse[L] * 0.6 && f.def.ult && !(f.def.ultLocked && f.def.ultLocked(f))) R.push({ b: 'ULT' });
  else if (m >= 100 && Math.random() < AI_P.meterUse[L] * 0.5) R.push({ b: 'SUP' });
  return R;
}

function cpuControl(f, B) {
  const ctl = { x: 0, y: 0, press: {}, hold: {} };
  const o = f.opp, ai = f.ai, L = Math.min(4, f.level || 2);
  if (!o || o.state === 'ko' || f.state === 'ko') return ctl;
  ai.t = (ai.t || 0) + 1;
  const dx = o.x - f.x, toward = Math.sign(dx) || f.facing, dist = Math.abs(dx) - (o.w + f.w) / 2;
  const actionable = f.isActionable() || f.state === 'walk';
  // real melee reach from the jab hitbox, measured from our hurtbox edge
  const jb = f.normalsTable()['5L'].hit.box, reach = Math.max(18, (jb[0] + jb[2]) * f.scale - f.w / 2);

  // ----- Sparking: break combos or clutch -----
  if (!f.side.sparkUsed && ((f.state === 'hit' && f.comboHits > 6 && f.hp < f.maxHp * 0.4 && Math.random() < 0.02 * L) || (f.hp < f.maxHp * 0.2 && Math.random() < 0.003 * L))) { ctl.press.SPARK = true; return ctl; }
  // ----- teching -----
  if (f.state === 'hit' && f.launched && Math.random() < AI_P.tech[L]) ctl.x = -toward;
  if (f.state === 'grabbed' && Math.random() < AI_P.tech[L] * 0.25) ctl.press.H = true;
  if (f.state === 'hit' || f.state === 'grabbed' || f.state === 'down') return ctl;

  // ----- combo continuation -----
  if (f.state === 'move' && f.connected && ai.route && ai.ri < ai.route.length && f.mf >= f.move.s) {
    if (f.connected === 'block' && ai.ri > 1) { ai.route = null; }
    else if ((ai.t - (ai.lastPress || 0)) > 2) {
      const st = ai.route[ai.ri++]; press(ctl, f, st); ai.lastPress = ai.t;
      if (st.b === 'ULT' || st.b === 'SUP') ai.route = null;
      return ctl;
    }
  }
  if (f.state === 'move') return ctl;

  // ----- defense -----
  const threat = o.state === 'move' && o.move.hit && dist < 260 && o.mf <= o.move.s + o.move.a;
  const proj = Combat.projectiles.find(p => p.side !== f.side && Math.sign(p.vx) === Math.sign(f.x - p.x) && Math.abs(p.x - f.x) < 320);
  const beam = Combat.beams.find(b => b.owner.side !== f.side);
  if (threat || proj || beam || o.state === 'sdash') {
    const key = (o.move ? o.move.name : 'x') + ':' + (o.st - o.mf) + ':' + (proj ? 'p' : '') + (beam ? 'b' : '');
    if (ai.defKey !== key) { ai.defKey = key; ai.defend = Math.random() < AI_P.block[L]; ai.defT = 0; ai.defMode = proj && Math.random() < 0.3 && L >= 2 ? (Math.random() < 0.5 ? 'jump' : 'sd') : 'block'; }
    if (o.state === 'sdash' && dist < 220 && Math.random() < AI_P.anti[L]) { ctl.press.H = true; ctl.y = 1; return ctl; }
    if (ai.defend) {
      if (ai.defMode === 'jump' && !f.airborne) { ctl.press.UP = true; ctl.x = toward; ai.defMode = 'block'; return ctl; }
      if (ai.defMode === 'sd' && f.meter >= 0 && dist > 300) { ctl.press.SD = true; ai.defMode = 'block'; return ctl; }
      ctl.x = -toward;
      const g = o.move && o.move.hit ? o.move.hit.guard : 'mid';
      ctl.y = g === 'low' ? 1 : g === 'high' ? 0 : (L >= 3 ? ai.lowBias || 0 : 0);
      // reflect projectiles sometimes
      if (proj && L >= 3 && Math.random() < 0.03 && f.blockstun) ctl.press.S = true;
      // punish window after blocking a heavy
      return ctl;
    }
  }
  // punish: opponent recovering nearby
  if (o.state === 'move' && o.mf > o.move.s + o.move.a && dist < reach + 6 && actionable && Math.random() < AI_P.combo[L] * 0.6) { ai.route = makeRoute(f, L); ai.ri = 1; press(ctl, f, ai.route[0]); return ctl; }
  // anti-air
  if (o.airborne && o.vy > -200 && dist < 140 && Math.abs(o.y) < 260 && actionable && !f.airborne && Math.random() < AI_P.anti[L] * 0.12) {
    const dp = aiSpecials(f, a => a.use === 'anti');
    if (dp.length && Math.random() < 0.5) { const s = SLOT_DIR[dp[0]]; press(ctl, f, { b: 'S', rel: s[0], y: s[1] }); }
    else { ctl.press.H = true; ctl.y = 1; ai.route = [{ b: 'L' }, { b: 'M' }, { b: 'H' }]; ai.ri = 0; }
    return ctl;
  }

  // ----- neutral decisions -----
  ai.next = (ai.next || 0) - 1;
  if (ai.next <= 0) {
    ai.next = Math.round(rand(0.6, 1.4) * AI_P.react[L]) + 4;
    ai.lowBias = Math.random() < 0.4 ? 1 : 0;
    const r = Math.random(), m = f.meter;
    // transformation / ultimate / charge
    const F = f.def.form;
    if (F && F.manual !== false && !f.form && (!f.def.transformGate || f.def.transformGate(f).ok) && m >= (F.cost ?? 200) && (f.hp < f.maxHp * 0.75 || Math.random() < 0.25) && Math.random() < AI_P.meterUse[L]) { ai.plan = 'form'; }
    else if (dist > 520 && m < 300 && Math.random() < 0.18 && Math.abs(o.x - f.x) > 600) ai.plan = 'charge';
    else if (dist < reach && !o.airborne) ai.plan = r < AI_P.aggro[L] ? (Math.random() < 0.18 ? 'throw' : Math.random() < 0.3 ? 'low' : 'combo') : r < 0.85 ? 'block' : 'back';
    else if (dist < 320) ai.plan = r < 0.3 ? 'dash' : r < 0.45 ? 'jumpin' : r < 0.7 ? 'special' : r < 0.8 && L >= 2 ? 'sd' : 'walk';
    else ai.plan = r < 0.35 ? 'special' : r < 0.55 ? 'dash' : r < 0.7 && L >= 2 ? 'sd' : r < 0.78 ? 'jumpin' : 'walk';
    if (B.team && Math.random() < 0.08 * L) ctl.press[Math.random() < 0.5 ? 'A1' : 'A2'] = true;
    if (f.def.ult && m >= 300 && dist < 900 && Math.random() < 0.04 * L && !(f.def.ultLocked && f.def.ultLocked(f)) && ['beam', 'shot', 'strike'].includes(f.def.ultAct)) ai.plan = 'ult';
    if (f.hp < f.maxHp * 0.6) { const h = aiSpecials(f, a => a.use === 'heal'); if (h.length && Math.random() < 0.3) ai.plan = 'heal'; }
    const buffs = aiSpecials(f, a => a.use === 'buff'); if (buffs.length && Math.random() < 0.06 && dist > 250) ai.plan = 'buff';
  }
  switch (ai.plan) {
    case 'form': ctl.press.FORM = true; ai.plan = 'walk'; break;
    case 'charge': ctl.hold.C = true; if (!f.airborne && f.state !== 'charge') ctl.press.C = true; if (f.meter >= 300 || dist < 380) ai.plan = 'walk'; break;
    case 'combo': ai.route = makeRoute(f, L); ai.ri = 1; press(ctl, f, ai.route[0]); ai.plan = 'walk'; break;
    case 'low': ai.route = [{ b: 'L', y: 1 }, { b: 'M', y: 1 }, { b: 'S' }]; ai.ri = 1; press(ctl, f, ai.route[0]); ai.plan = 'walk'; break;
    case 'throw': ctl.x = toward; ctl.press.H = true; ai.plan = 'walk'; break;
    case 'block': ctl.x = -toward; ctl.y = Math.random() < 0.4 ? 1 : 0; break;
    case 'back': ctl.x = -toward; break;
    case 'dash': ctl.x = toward; ctl.press.DASH = true; ai.plan = dist < reach + 60 ? 'combo' : 'walk'; break;
    case 'sd': ctl.press.SD = true; ai.route = [{ b: 'L' }, { b: 'M' }, { b: 'H' }]; ai.ri = 0; ai.plan = 'walk'; break;
    case 'jumpin': if (!f.airborne) { ctl.press.UP = true; ctl.x = toward; } else if (dist < reach + 50) { ctl.press.H = true; ai.route = [{ b: 'L' }, { b: 'L' }, { b: 'L' }, { b: 'L' }]; ai.ri = 0; ai.plan = 'walk'; } else ctl.x = toward; break;
    case 'special': {
      const zs = aiSpecials(f, (a) => dist >= a.min && dist <= a.max && ['zone', 'approach', 'trap', 'grab', 'counter'].includes(a.use) && (a.use !== 'grab' || dist < 40) && (a.use !== 'counter' || (o.state === 'move' && dist < 150)));
      if (zs.length) { const s = SLOT_DIR[pick(zs)]; press(ctl, f, { b: 'S', rel: s[0], y: s[1] }); }
      else ctl.x = toward;
      ai.plan = 'walk'; break;
    }
    case 'ult': ctl.press.ULT = true; ai.plan = 'walk'; break;
    case 'heal': case 'buff': { const hs = aiSpecials(f, a => a.use === ai.plan); if (hs.length) { const s = SLOT_DIR[hs[0]]; press(ctl, f, { b: 'S', rel: s[0], y: s[1] }); } ai.plan = 'walk'; break; }
    default: ctl.x = dist > reach * 0.6 ? toward : 0; if (dist < reach && !f.airborne && actionable && Math.random() < AI_P.aggro[L] * 0.25) { ai.route = makeRoute(f, L); ai.ri = 1; press(ctl, f, ai.route[0]); } if (f.airborne && dist < 100 && Math.random() < 0.2) ctl.press.M = true;
  }
  return ctl;
}
