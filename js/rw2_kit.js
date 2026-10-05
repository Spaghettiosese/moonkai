// Small shared helpers for the second wave of reworks (rw2_*.js).
const Rw2 = {
  // merge passive/mechanic props into a def without losing the ones the original spec already had: handlers are chained
  // (old first), multiplicative hooks are multiplied, everything else is assigned.
  merge(def, props) {
    for (const [k, v] of Object.entries(props)) {
      const old = def[k];
      if ((k === 'passiveDmg' || k === 'passiveArmor') && typeof old === 'function') def[k] = (...a) => old(...a) * v(...a);
      else if (['onHit', 'onHurt', 'passiveTick', 'onRoundStart'].includes(k) && typeof old === 'function') def[k] = (...a) => { old(...a); return v(...a); };
      else def[k] = v;
    }
    return def;
  },
  // a telegraphed column that hits everything in it, with the pillar visual. o: {r, life, color, dmg, status, move, kb, launch, guard, hs, onHit, after, shake}
  pillar(f, x, o = {}) {
    x = clamp(x, 40, Arena.stage.width - 40);
    Combat.telegraph(f, { x, r: o.r || 70, life: o.life || 24, color: o.color || '#ffffff', column: true, onFire: h => {
      for (const e of Combat.targets(f.side)) if (Math.abs(e.x - h.x) < h.r && e.y > -(o.top || 260)) {
        const r = Combat.resolveHit(e, f, H_({ dmg: o.dmg || 80, guard: o.guard || 'mid', hs: o.hs || 24, kb: o.kb || [0, -700], launch: o.launch !== false, status: o.status, sfx: 'h' }), { proj: true, fromX: h.x, move: o.move });
        if (r && o.onHit) o.onHit(e, r, h);
      }
      Combat.addHazard({ kind: 'aurPillar', owner: f, side: f.side, x: h.x, r: h.r, life: o.vis || 22, color: o.color || '#ffffff', giant: !!o.giant });
      if (o.after) o.after(h); if (o.shake) Cam.shake = Math.max(Cam.shake, o.shake);
    } });
  },
  // a row of pillars marching away from the user (or spreading from the foe)
  row(f, n, step, o = {}) {
    const t = f.opp, x0 = o.from === 'foe' && t ? t.x : f.x + f.facing * (o.start || 120);
    for (let i = 0; i < n; i++) { const d = o.from === 'foe' ? (i - (n - 1) / 2) * step : i * step * f.facing; Rw2.pillar(f, x0 + d, Object.assign({}, o, { life: (o.life || 10) + i * (o.stagger || 4) })); }
  },
  // lingering damage pool
  pool(f, x, o = {}) { Combat.addHazard({ kind: 'zone', owner: f, side: f.side, x: clamp(x, 20, Arena.stage.width - 20), r: o.r || 60, life: o.life || 3, every: o.every || .3, dmg: o.dmg || 14, color: o.color || '#ffffff', status: o.status, t: 0, hits: new Map() }); },
  // chain of short teleport-slashes around the foe. o: {n, gap, dmg, last, color, sfx, move}
  blink(f, o = {}) {
    const n = o.n || 3, gap = o.gap || 8;
    for (let i = 0; i < n; i++) Game.later((i * gap) / FPS, () => { const t = f.opp; if (!t || f.state === 'ko') return; f.x = clamp(t.x + (i % 2 ? 1 : -1) * 80, 40, Arena.stage.width - 40); f.y = 0; f.faceOpp(); Game.fx.burst(f.x, -80, 14, { color: [o.color || f.def.color, '#000'], size: 7, speed: 240, life: .35 }); o.sfx && o.sfx(); Combat.strikeZone(f, { x: f.x - 80, y: -130, w: 160, h: 130 }, { dmg: i === n - 1 ? (o.last || 70) : (o.dmg || 28), guard: 'mid', hs: 12, kb: i === n - 1 ? [300, -480] : [50, -20], launch: i === n - 1, sfx: i === n - 1 ? 'h' : 'l' }, { move: o.move }); });
  },
};
