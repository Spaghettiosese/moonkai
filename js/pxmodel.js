// ============================================================
//  MOONKAI — PXMODEL: the generic model renderer (makeModelDraw) rebuilt on the pixel engine.
//
//  Any fighter described by a `model` spec (hair, hat, animal head, mask, wings, cape, scarf, weapon,
//  emblem, pads, aura...) can be painted as outlined, cel-shaded pixel art:
//      def.draw = PxModel.install(def, { extra: { back(g, P, s, m), head(g, P, s, m), front(g, P, s, m), post(c, v, P, s, m) } })
//  The form model (def.form.model) is merged exactly as the vector renderer does, `alt` hue-shifts apply,
//  and special bodies (golem / mech / ghost) fall back to the original vector art.
// ============================================================
const PxModel = (() => {
  const pair = (col, k = .3) => [col, shadeHex(col, -k)];
  const q = (x, k = 4) => Math.round(x * k) / k;
  const REST = ['idle', 'walk', 'run', 'backwalk', 'crouch', 'block', 'cblock', 'hurt', 'stun', 'jump', 'fall', 'intro', 'victory', 'kneel', 'taunt'];
  const isAtk = pose => !REST.includes(pose);

  function modelOf(def, tr, alt) {
    const base = def.model || {}, fm = def.form && def.form.model;
    const m = tr && fm ? Object.assign({}, base, fm) : base;
    return alt ? shiftModel(m, alt) : m;
  }

  function make(def, opts = {}) {
    const bName = (def.model && def.model.build) || 'normal', BD = BUILDS[bName] || (def.model && def.model.bulk ? { bulk: def.model.bulk, limb: Math.sqrt(def.model.bulk), h: 1, hips: 1 } : BUILDS.normal);
    const ex = opts.extra || {};
    const PX = PixelArt.make({
      id: def.id + '_pm', win: opts.win || [-175, -300, 430, 360], B: (BD.h || 1) * (opts.B || 1.04), trail: opts.trail || hexA(def.color || '#ffffff', 1).replace(/,[^,]*\)$/, ','),
      state(v, t, st) {
        const tr = !!v.transformed, alt = v.alt || 0, m = modelOf(def, tr, alt), atkd = isAtk(v.pose);
        const s = { tr, alt, atk: atkd ? 1 : 0, sw: q(Math.sin(t * 4) * 3, 2), fl: q(Math.sin(t * (tr ? 6 : 3)), 4), hv: v.pose, cl: m.claw ? 1 : 0 };
        if (m.weapon && /sword|blade|katana|dual|greatsword|staff|spear|trident|scythe|hammer|axe/.test(m.weapon.type)) s.wa = Math.round(PX.ease(st, 'wa', atkd ? (m.weapon.type === 'hammer' || m.weapon.type === 'axe' ? -.3 : m.weapon.type === 'staff' || m.weapon.type === 'spear' || m.weapon.type === 'trident' || m.weapon.type === 'scythe' ? 0 : -.1) : (/staff|spear|trident|scythe/.test(m.weapon.type) ? -1.35 : /hammer|axe/.test(m.weapon.type) ? -1.3 : -1.1), .55) * 30) / 30;
        if (ex.state) Object.assign(s, ex.state(v, t, st, m));
        return s;
      },
      body(g, P, s) {
        const m = modelOf(def, s.tr, s.alt), info = {}, { L } = g;
        if (m.body || m.ghost) return info;
        const col = {
          skin: pair(m.skin || '#f0c8a0'), skinF: pair(shadeHex(m.skin || '#f0c8a0', -.2), .25),
          top: pair(m.top || '#556'), topF: pair(shadeHex(m.top || '#556', -.25), .3), pants: pair(m.pants || '#334'), pantsF: pair(shadeHex(m.pants || '#334', -.25), .3),
          boots: pair(m.boots || '#222'), bootsF: pair(shadeHex(m.boots || '#222', -.25), .3),
        };
        const S = { limb: BD.limb, bulk: BD.bulk, hips: BD.hips, skin: col.skin, skinFar: col.skinF, top: col.top, topFar: col.topF, pants: col.pants, pantsFar: col.pantsF, boots: col.boots, bootsFar: col.bootsF,
          noHead: !!m.animal, bareArms: !!(m.bareArms), glove: pair(m.glove || m.skin || '#f0c8a0'), gloveFar: pair(shadeHex(m.glove || m.skin || '#f0c8a0', -.2), .25) };
        if (m.belt) S.belt = pair(m.belt); if (m.skirt) S.skirt = pair(m.skirt); if (m.bracers) S.bracers = pair(m.bracers); if (m.kneepads) S.kneepads = pair(m.kneepads); if (m.sleeves) { S.top = pair(m.sleeves); }
        const tailPts = (a, b, c2, n = 7) => { const pts = []; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([(1 - u) ** 2 * a[0] + 2 * u * (1 - u) * b[0] + u * u * c2[0], (1 - u) ** 2 * a[1] + 2 * u * (1 - u) * b[1] + u * u * c2[1]]); } return pts; };
        g.humanoid(P, S, {
          back(P) {
            if (m.cape) { const cp = m.cape, len = cp.len || 1, pts = [[P.sh[0] - 10, P.sh[1] - 2], [P.sh[0] + 6, P.sh[1] - 2]]; for (let i = 0; i <= 6; i++) pts.push([P.sh[0] + 2 - i * 8 * len - 6, lerp(P.sh[1], -4, len) + (i % 2) * 8 + s.fl * 3 * (i % 3 ? 1 : -1)]); g.paint([g.poly(pts)], ...pair(cp.color)); if (cp.inner) g.fill(g.poly([[P.sh[0] - 6, P.sh[1]], [P.sh[0] - 20 * len, lerp(P.sh[1], -4, len * .9)], [P.sh[0] - 4, lerp(P.sh[1], -4, len * .7)]]), cp.inner); }
            if (m.wings) PxModel.wings(g, P, m.wings, s);
            if (m.spiderLegs) for (let i = 0; i < 4; i++) { const bx = P.sh[0] - 4, by = lerp(P.sh[1], P.hip[1], .3 + i * .12), w = Math.sin(i + s.fl) * 4; g.line([[bx, by], [bx - 26 - i * 4, by - 26 + i * 10 + w], [bx - 34 - i * 6, by + 10 + i * 8 + w]], m.spiderLegs.color, 3.4); }
            if (m.tentacles) for (let i = 0; i < 5; i++) g.line(tailPts([P.hip[0] - 4, P.hip[1]], [P.hip[0] - 40, P.hip[1] - 20 - i * 12], [P.hip[0] - 56 + Math.sin(i + s.fl) * 10, P.hip[1] - 30 - i * 14]), i % 2 ? m.tentacles.color : shadeHex(m.tentacles.color, -.3), 6 - i, false);
            if (m.scarf) g.paint([g.shape([['M', P.sh[0] - 2, P.sh[1] - 2], ['Q', P.sh[0] - 20, P.sh[1] + s.sw, P.sh[0] - 36, P.sh[1] + 6 + s.sw], ['L', P.sh[0] - 32, P.sh[1] + 12 + s.sw], ['Q', P.sh[0] - 16, P.sh[1] + 6, P.sh[0] + 2, P.sh[1] + 4]])], ...pair(m.scarf.color));
            if (m.tail) g.line(tailPts([P.hip[0] - 6, P.hip[1] + 4], [P.hip[0] - 40, P.hip[1] + 30], [P.hip[0] - 46 + s.sw * 2, P.hip[1] - 4]), m.tail, 4);
            if (m.bigTail) g.paint([g.shape([['M', P.hip[0] - 4, P.hip[1] - 6], ['Q', P.hip[0] - 40, P.hip[1] + 20, P.hip[0] - 60, -2], ['L', P.hip[0] - 2, P.hip[1] + 8]])], ...pair(m.bigTail));
            if (m.hair && ['long', 'ponytail', 'twintails'].includes(m.hair.type)) PxModel.hair(g, P.head, m.hair, s, true);
            if (ex.back) ex.back(g, P, s, m);
          },
          chest(P) {
            const x = L(P.hip, P.sh, .66)[0], y = L(P.hip, P.sh, .66)[1];
            if (m.stripes) g.line([[lerp(P.hip[0], P.sh[0], .1) - 6, lerp(P.hip[1], P.sh[1], .1)], [lerp(P.hip[0], P.sh[0], .9) + 6, lerp(P.hip[1], P.sh[1], .9)]], m.stripes, 3);
            if (m.plate) g.paint([g.poly([[x - 10, y - 9], [x + 10, y - 9], [x + 10, y + 7], [x - 10, y + 7]])], ...pair(m.plate));
            if (m.emblem) PxModel.emblem(g, x, y, m.emblem);
            if (m.core) { g.fill(g.ell(x, y, 5, 5), m.core); g.fill(g.ell(x, y, 2.4, 2.4), '#ffffff'); info.core = [x, y]; }
            if (ex.chest) ex.chest(g, P, s, m);
          },
          head(P) {
            const [hx, hy] = P.head;
            if (m.animal) PxModel.animal(g, P.head, m.animal, s);
            else {
              if (m.hair && !['long', 'ponytail', 'twintails'].includes(m.hair.type)) PxModel.hair(g, P.head, m.hair, s, false);
              if (m.hair && ['long', 'ponytail', 'twintails'].includes(m.hair.type)) PxModel.hair(g, P.head, m.hair, s, false);
              if (m.ears) PxModel.ears(g, P.head, m.ears);
              if (m.mask) PxModel.mask(g, P.head, m.mask);
              if (m.eyes && m.eyes.color) g.fill(g.ell(hx + 7, hy - 2, 2, 2), m.eyes.color);
              if (!m.mask || !['visor', 'shades', 'full', 'oni', 'band'].includes(m.mask.type)) { g.fill(g.ell(hx + 7, hy - 2, 1.8, 1.8), '#14101c'); }
            }
            if (m.horns) { g.paint([g.shape([['M', hx - 6, hy - 8], ['Q', hx - 20, hy - 20, hx - 14, hy - 34], ['Q', hx - 10, hy - 18, hx - 1, hy - 10]]), g.shape([['M', hx + 4, hy - 9], ['Q', hx + 8, hy - 24, hx + 20, hy - 30], ['Q', hx + 12, hy - 18, hx + 10, hy - 6]])], ...pair(m.horns.color)); }
            if (m.hat) PxModel.hat(g, P.head, m.hat);
            if (ex.head) ex.head(g, P, s, m);
          },
          pads(P) { if (m.pads) { const p = m.pads, k = p.size || 1; g.paint([g.ell(P.sh[0] + 3, P.sh[1] + 1, 13 * k, 9 * k, -.2, Math.PI, Math.PI * 2.05)], ...pair(p.color)); if (p.spikes) g.paint([0, 1, 2].map(i => g.poly([[P.sh[0] - 6 + i * 7, P.sh[1] - 6], [P.sh[0] - 4 + i * 7, P.sh[1] - 18], [P.sh[0] - 1 + i * 7, P.sh[1] - 6]])), ...pair(p.spikes)); } },
          front(P) { if (m.weapon) PxModel.weapon(g, P, m.weapon, s, info); if (ex.front) ex.front(g, P, s, m, info); },
        });
        return info;
      },
      pre(c, v, P, s) {
        const m = modelOf(def, s.tr, s.alt), t = v.anim || 0;
        if (m.aura) { c.save(); c.globalCompositeOperation = 'lighter'; glowCircle(c, 0, -60, 95 * (m.auraSize || 1), hexA(m.aura, .3 + Math.sin(t * 5) * .05), hexA(m.aura, 0)); c.restore(); }
        if (m.wings && (m.wings.type === 'light')) PxModel.lightWings(c, P, m.wings, t);
        if (opts.pre) opts.pre(c, v, P, s, m);
      },
      post(c, v, P, s, info) {
        const m = modelOf(def, s.tr, s.alt), t = v.anim || 0, [hx, hy] = P.head;
        c.save(); c.globalCompositeOperation = 'lighter';
        if (m.eyes && m.eyes.glow) glowCircle(c, hx + 7, hy - 2, 8, hexA(m.eyes.glow, .9), 'rgba(0,0,0,0)');
        if (m.animal && m.animal.eye) glowCircle(c, hx + 7, hy - 3, 6, m.animal.eye, 'rgba(0,0,0,0)');
        if (m.core && info.core) glowCircle(c, info.core[0], info.core[1], 14, hexA(m.core, .9), 'rgba(0,0,0,0)');
        if (m.halo) { c.strokeStyle = hexA(m.halo.color, .95); c.lineWidth = 3; c.beginPath(); c.ellipse(hx, hy - 20 + Math.sin(t * 2) * 2, 12, 4, 0, 0, 7); c.stroke(); }
        if (m.weapon && m.weapon.glow && info.tip) glowCircle(c, info.tip[0], info.tip[1], 16, hexA(m.weapon.glow, .7), 'rgba(0,0,0,0)');
        if (m.weapon && info.orb) glowCircle(c, info.orb[0], info.orb[1], 14, hexA(m.weapon.color || '#fff', .8), 'rgba(0,0,0,0)');
        c.restore();
        if (opts.post) opts.post(c, v, P, s, m, info);
      },
    });
    // floating bodies bob; the PixelArt draw is wrapped so m.float / m.alpha still apply
    const draw = (c, v) => { const m = modelOf(def, !!v.transformed, v.alt || 0); if (m.body || m.ghost) return def._vecDraw(c, v); c.save(); if (m.float) c.translate(0, -8 - Math.sin((v.anim || 0) * 2.5) * 4); if (m.alpha !== undefined) c.globalAlpha *= m.alpha; PX.draw(c, v); c.restore(); };
    return { draw, PX };
  }

  // Replace def.draw (keeping the vector art as the fallback when Pixel Art Fighters is off).
  function install(def, opts) {
    const vec = def.draw; def._vecDraw = vec; const { draw } = make(def, opts);
    def.draw = (c, v) => PxKit.on() ? draw(c, v) : vec(c, v);
    return def.draw;
  }
  // Pixel portrait from the generic anime face (or the def's own drawPortrait).
  function portrait(def, o = {}) {
    const orig = def.drawPortrait;
    const fn = orig || ((c, opts, d) => { let F = faceConfig(d, opts.form); if (opts.alt) F = shiftModel(F, [0, 150, 240, 60][opts.alt % 4]); if (opts.expr) F.expr = opts.expr; drawAnimeFace(c, F, d); });
    const px = PxKit.portrait(def.id + '_pm', fn, Object.assign({ res: 64, levels: 8, dither: .3 }, o));
    def.drawPortrait = (c, opts, d) => PxKit.on() ? px(c, opts, d) : fn(c, opts, d);
  }

  // ---- parts -------------------------------------------------------------------------------
  const sh = (g, x, y, pts) => g.poly(pts.map(([a, b]) => [x + a, y + b]));
  function dome(g, x, y, r, top = 14) { return g.shape([['M', x - r, y + 2], ['Q', x - r, y - top, x, y - top], ['Q', x + r, y - top, x + r, y + 2]]); }
  function hair(g, [x, y], h, s, backOnly) {
    const col = pair(h.color), t = s.fl, P = (pts) => [sh(g, x, y, pts)];
    const longBack = () => g.shape([['M', x + 10, y - 6], ['Q', x, y - 18, x - 12, y - 8], ['Q', x - 22 + t * 3, y + 16, x - 18 + t * 4, y + 36], ['L', x - 8, y + 20], ['Q', x - 4, y + 4, x + 10, y - 6]]);
    switch (h.type) {
      case 'spiky': g.paint(P([[-12, 2], [-18, -6], [-10, -10], [-16, -18], [-4, -14], [-6, -26], [4, -14], [8, -24], [10, -10], [16, -12], [12, -2]]), ...col); break;
      case 'wild': { const pts = [[-12, 6]]; for (let i = 0; i < 9; i++) { const a = Math.PI * (.75 + i * .16); pts.push([Math.cos(a) * 24, Math.sin(a) * 22], [Math.cos(a + .08) * 11, Math.sin(a + .08) * 11]); } g.paint(P(pts), ...col); break; }
      case 'long': case 'ponytail': case 'twintails':
        if (backOnly) { if (h.type === 'long') g.paint([longBack()], ...col); else if (h.type === 'ponytail') g.paint([g.shape([['M', x - 10, y - 8], ['Q', x - 28 + t * 4, y - 6, x - 26 + t * 5, y + 22], ['L', x - 18, y + 6]])], ...col); else for (const d of [-1, 1]) g.paint([g.shape([['M', x + d * 6 - 4, y - 10], ['Q', x + d * 4 - 22, y + 4, x + d * 3 - 16 + t * 3, y + 30], ['L', x + d * 3 - 10, y + 6]])], ...col); }
        else g.paint([dome(g, x - 1, y - 2, 12, 12)], ...col);
        break;
      case 'afro': g.paint([g.ell(x - 2, y - 8, 17, 17)], ...col); break;
      case 'slick': g.paint([g.shape([['M', x + 11, y - 4], ['Q', x + 6, y - 16, x - 8, y - 13], ['Q', x - 20, y - 8, x - 14, y + 6], ['L', x - 8, y - 2]])], ...col); break;
      case 'topknot': g.paint([dome(g, x - 1, y - 2, 11.5, 12), g.ell(x - 4, y - 16, 5, 5)], ...col); break;
      case 'mohawk': g.paint(P([[-8, -8], [-8, -22], [-6, -10], [-4, -27], [-2, -10], [0, -22], [2, -10], [4, -27], [6, -10], [8, -22], [10, -10]]), ...col); break;
      case 'bun': g.paint([dome(g, x, y - 3, 11.5, 12), g.ell(x - 10, y - 12, 6, 6)], ...col); break;
      case 'bob': g.paint([g.shape([['M', x + 12, y + 4], ['Q', x + 10, y - 16, x - 4, y - 14], ['Q', x - 18, y - 10, x - 14, y + 10], ['L', x - 6, y + 10], ['L', x - 4, y - 2], ['L', x + 8, y - 4]])], ...col); break;
      case 'short': g.paint([dome(g, x - 1, y - 2, 12, 12)], ...col); break;
      case 'buzz': g.paint([dome(g, x - 1, y - 1, 11.5, 11)], col[1], col[1]); break;
      case 'hood': g.paint([g.shape([['M', x - 14, y + 10], ['Q', x - 16, y - 16, x, y - 16], ['Q', x + 16, y - 16, x + 14, y - 2], ['L', x + 4, y + 12]])], ...col); break;
      case 'helmet': g.paint([dome(g, x, y, 13, 14), g.poly([[x - 12, y + 6], [x + 12, y + 6], [x + 12, y], [x - 12, y]])], ...col); g.fill(g.poly([[x - 1, y - 5], [x + 12, y - 5], [x + 12, y], [x - 1, y]]), h.visor || '#77ddff'); break;
      case 'crown': g.paint([dome(g, x - 1, y - 1, 12, 12)], ...col); g.paint([-2, -1, 0, 1, 2].map(i => g.poly([[x + i * 5 - 3, y - 10], [x + i * 5, y - 26 + Math.abs(i) * 5], [x + i * 5 + 3, y - 10]])), ...pair(h.accent || '#bbffff')); break;
      case 'jester': for (const [dx, cc] of [[-1, h.color], [1, h.accent || '#222']]) { g.paint([g.shape([['M', x - 6 * dx - 2, y - 8], ['Q', x - 20 * dx, y - 28, x - 26 * dx, y - 14], ['L', x + 2 * dx, y - 12]])], ...pair(cc)); g.fill(g.ell(x - 26 * dx, y - 14, 3, 3), '#ffd35a'); } break;
      case 'flame': for (let i = 0; i < 7; i++) { const a = -Math.PI * .5 - 1.2 + i * .35, len = 20 + Math.sin(s.fl * 3 + i * 1.7) * 6; g.fill(g.poly([[x + Math.cos(a) * 9 - 4, y + Math.sin(a) * 9], [x + Math.cos(a - .4) * len, y + Math.sin(a - .4) * len], [x + Math.cos(a) * 9 + 4, y + Math.sin(a) * 9]]), i % 2 ? h.color : '#ffdc78'); } break;
      default: break;
    }
  }
  function hat(g, [x, y], h) {
    const col = pair(h.color), P = pts => [sh(g, x, y, pts)];
    switch (h.type) {
      case 'wizard': g.paint(P([[-18, -6], [18, -6], [8, -12], [-4, -40], [-22, -44], [-8, -30], [-8, -12]]), ...col); break;
      case 'cowboy': g.paint([g.ell(x, y - 8, 20, 4), g.poly([[x - 9, y - 9], [x - 8, y - 22], [x + 8, y - 22], [x + 9, y - 9]])], ...col); break;
      case 'tophat': g.paint(P([[-16, -12], [16, -12], [16, -8], [10, -8], [10, -34], [-10, -34], [-10, -8], [-16, -8]]), ...col); g.fill(sh(g, x, y, [[-10, -17], [10, -17], [10, -13], [-10, -13]]), h.band || '#aa2222'); break;
      case 'chef': g.paint([g.poly([[x - 11, y - 18], [x + 11, y - 18], [x + 11, y - 8], [x - 11, y - 8]]), g.ell(x - 8, y - 24, 8, 8), g.ell(x, y - 26, 8, 8), g.ell(x + 8, y - 24, 8, 8)], '#ffffff', '#c8c8d0'); break;
      case 'bandana': g.paint(P([[-12, -10], [12, -10], [12, -5], [-12, -5]]), ...col); g.paint(P([[-12, -8], [-22, -4 + g.K * 0], [-20, 0]]), ...col); break;
      case 'kabuto': g.paint([dome(g, x, y - 2, 13, 14), g.poly([[x - 16, y + 2], [x + 16, y + 2], [x + 14, y - 2], [x - 14, y - 2]])], ...col); g.fill(sh(g, x, y, [[0, -14], [-14, -30], [-2, -16], [14, -30], [2, -14]]), h.accent || '#ffd35a'); break;
      case 'beanie': g.paint([dome(g, x - 1, y - 3, 12.5, 12), g.poly([[x - 14, y - 1], [x + 12, y - 1], [x + 12, y - 4], [x - 14, y - 4]])], ...col); g.fill(g.ell(x - 2, y - 16, 4, 4), h.accent || '#fff'); break;
      case 'cap': g.paint([dome(g, x - 1, y - 3, 12, 12), g.poly([[x + 8, y - 5], [x + 22, y - 3], [x + 8, y - 1]])], ...col); break;
      case 'astronaut': g.line([[x - 12, y - 10], [x - 15, y], [x - 8, y + 12], [x + 8, y + 14], [x + 16, y + 2], [x + 14, y - 10], [x, y - 17], [x - 12, y - 10]], '#dddddd', 3); g.fill(g.ell(x + 1, y - 1, 15, 15), 'rgba(160,230,255,0.35)'); break;
      case 'tiara': g.paint([-1, 0, 1].map(i => g.poly([[x + i * 6 - 3, y - 9], [x + i * 6, y - 18 + Math.abs(i) * 4], [x + i * 6 + 3, y - 9]])), ...col); break;
      case 'graduate': g.paint(P([[-18, -12], [0, -20], [18, -12], [0, -6]]), ...col); break;
      case 'wig': g.paint([0, 1, 2, 3, 4, 5].map(i => g.ell(x - 12 + (i % 3) * 5, y - 10 + Math.floor(i / 3) * 12, 6, 6)), ...col); break;
    }
  }
  function ears(g, [x, y], e) {
    const col = pair(e.color);
    for (const d of [-7, 3]) {
      if (e.type === 'cat' || e.type === 'wolf') g.paint([g.poly([[x + d - 5, y - 8], [x + d, y - (e.type === 'wolf' ? 26 : 22)], [x + d + 5, y - 9]])], ...col);
      else if (e.type === 'bunny') g.paint([g.ell(x + d, y - 24, 3.5, 12)], ...col);
      else if (e.type === 'elf') { g.paint([g.poly([[x + 2, y - 2], [x - 12, y - 12], [x - 4, y + 2]])], ...col); break; }
      else if (e.type === 'round') g.paint([g.ell(x + d, y - 12, 5, 5)], ...col);
    }
  }
  function mask(g, [x, y], m) {
    const col = pair(m.color);
    if (m.type === 'visor') g.paint([g.poly([[x - 2, y - 5], [x + 12, y - 5], [x + 12, y], [x - 2, y]])], ...col);
    else if (m.type === 'band') g.paint([g.poly([[x - 2, y - 4], [x + 13, y - 5], [x + 12, y + 1], [x, y + 1]])], ...col);
    else if (m.type === 'half') g.paint([g.poly([[x - 4, y + 1], [x + 12, y + 1], [x + 10, y + 10], [x - 2, y + 10]])], ...col);
    else if (m.type === 'full') g.paint([g.ell(x + 2, y + 1, 10, 10)], ...col);
    else if (m.type === 'oni') { g.paint([g.ell(x + 2, y, 11, 11)], ...col); g.fill(g.poly([[x + 3, y + 5], [x + 5, y + 9], [x + 7, y + 5]]), '#fff'); g.fill(g.poly([[x + 9, y + 5], [x + 11, y + 9], [x + 12, y + 5]]), '#fff'); g.fill(g.ell(x + 6, y - 3, 2, 2), '#ffd35a'); }
    else if (m.type === 'goggles') { g.paint([g.ell(x + 4, y - 3, 4.5, 4.5), g.ell(x + 11, y - 3, 3.5, 3.5)], ...col); g.fill(g.ell(x + 4, y - 3, 2.5, 2.5), m.lens || '#99ffff'); }
    else if (m.type === 'glasses') { g.line([[x + 1, y - 5], [x + 7, y - 5], [x + 7, y - 1], [x + 1, y - 1], [x + 1, y - 5]], m.color, 1.4); g.line([[x + 8, y - 5], [x + 13, y - 5], [x + 13, y - 1], [x + 8, y - 1], [x + 8, y - 5]], m.color, 1.4); }
    else if (m.type === 'shades') g.fill(g.poly([[x, y - 5], [x + 14, y - 5], [x + 14, y - 1], [x, y - 1]]), m.color);
    else if (m.type === 'eyepatch') { g.fill(g.ell(x + 7, y - 2, 3, 3), m.color); g.line([[x - 10, y - 6], [x + 10, y - 3]], m.color, 1); }
  }
  function animal(g, [x, y], a, s) {
    const col = pair(a.color), dk = pair(shadeHex(a.color, -.3));
    if (a.type === 'wolf' || a.type === 'lion') {
      if (a.type === 'lion') { const pts = []; for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2; pts.push([x - 2 + Math.cos(an) * (i % 2 ? 16 : 22), y + Math.sin(an) * (i % 2 ? 16 : 22)]); } g.paint([g.poly(pts)], ...pair(a.mane || '#8a4a1a')); }
      if (a.type === 'wolf') g.paint([-6, 2].map(d => g.poly([[x + d - 4, y - 7], [x + d, y - 22], [x + d + 4, y - 8]])), ...dk);
      g.paint([g.ell(x, y, 11, 11), g.poly([[x + 4, y - 4], [x + 20, y + 1], [x + 18, y + 6], [x + 4, y + 8]])], ...col);
      g.fill(g.ell(x + 19, y + 2, 2.5, 2.5), '#111'); g.fill(g.poly([[x + 10, y + 6], [x + 12, y + 11], [x + 14, y + 6]]), '#fff');
      g.fill(g.ell(x + 7, y - 3, 2.6, 2.6), a.eyeColor || '#ffd860'); g.fill(g.ell(x + 7, y - 3, 1, 1.4), '#111');
    } else if (a.type === 'dino') {
      g.paint([g.shape([['M', x - 10, y + 4], ['Q', x - 8, y - 14, x + 8, y - 10], ['L', x + 26, y - 4], ['L', x + 26, y + 4], ['L', x + 8, y + 6], ['L', x + 24, y + 10], ['L', x + 6, y + 14]])], ...col);
      for (let i = 0; i < 4; i++) g.fill(g.poly([[x + 10 + i * 4, y + 4], [x + 12 + i * 4, y + 8], [x + 14 + i * 4, y + 4]]), '#fff');
      g.fill(g.ell(x + 6, y - 5, 2.5, 2.5), '#ffff00'); g.paint([0, 1, 2, 3].map(i => g.poly([[x - 8 + i * 5, y - 10 + i], [x - 12 + i * 5, y - 18], [x - 4 + i * 5, y - 11 + i]])), ...dk);
    } else if (a.type === 'roo') {
      g.paint([g.ell(x, y, 10, 10), g.ell(x + 11, y + 3, 9, 6, .2), g.ell(x - 4, y - 16, 3.5, 10), g.ell(x + 2, y - 16, 3.5, 10)], ...col); g.fill(g.ell(x + 18, y + 2, 2, 2), '#222'); g.fill(g.ell(x + 6, y - 3, 1.8, 1.8), '#111');
    } else if (a.type === 'robot') {
      g.paint([g.poly([[x - 11, y - 12], [x + 12, y - 12], [x + 12, y + 10], [x - 11, y + 10]])], ...col); g.fill(g.poly([[x - 2, y - 6], [x + 12, y - 6], [x + 12, y], [x - 2, y]]), '#111'); g.line([[x - 4, y - 12], [x - 6, y - 20]], dk[0], 2); g.fill(g.ell(x - 6, y - 21, 2.5, 2.5), '#ff4444');
    } else if (a.type === 'skull') {
      g.paint([g.ell(x, y - 1, 11, 11), g.poly([[x - 2, y + 6], [x + 10, y + 6], [x + 10, y + 13], [x - 2, y + 13]])], '#eee8d8', '#bcb49c'); g.fill(g.ell(x + 2, y - 2, 3.5, 3.5), '#111'); g.fill(g.ell(x + 9, y - 2, 3, 3), '#111');
      for (let i = 0; i < 3; i++) g.line([[x + i * 4, y + 6], [x + i * 4, y + 13]], '#555', 1);
    } else if (a.type === 'bug') {
      g.paint([g.ell(x, y, 11, 11)], ...col); for (const [ex, ey, r] of [[5, -4, 3], [10, -3, 2.5], [6, 2, 2], [11, 3, 1.6]]) g.fill(g.ell(x + ex, y + ey, r, r), '#c01010'); g.line([[x + 8, y + 8], [x + 12, y + 14]], a.color, 2);
    } else if (a.type === 'squid') {
      g.paint([g.ell(x - 2, y - 6, 12, 16, -.3)], ...col); for (let i = 0; i < 5; i++) g.line([[x + i * 3 - 4, y + 6], [x + i * 4 - 2 + Math.sin(i + s.fl) * 4, y + 16], [x + i * 3 - 2, y + 22]], a.color, 3, true);
    }
  }
  function emblem(g, x, y, e) {
    const col = e.color;
    switch (e.shape) {
      case 'bolt': g.fill(g.poly([[x + 2, y - 9], [x - 4, y + 1], [x + 1, y + 1], [x - 2, y + 9], [x + 5, y - 2], [x, y - 2]]), col); break;
      case 'star': { const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 3.5 : 8, a = i * Math.PI / 5 - Math.PI / 2; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } g.fill(g.poly(pts), col); break; }
      case 'gear': g.fill(g.ell(x, y, 6, 6), col); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.fill(g.ell(x + Math.cos(a) * 8, y + Math.sin(a) * 8, 1.6, 1.6), col); } g.fill(g.ell(x, y, 2.5, 2.5), '#222'); break;
      case 'snow': for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.line([[x - Math.sin(a) * 9, y - Math.cos(a) * 9], [x + Math.sin(a) * 9, y + Math.cos(a) * 9]], col, 2); } break;
      case 'cross': g.fill(g.poly([[x - 2, y - 9], [x + 2, y - 9], [x + 2, y + 9], [x - 2, y + 9]]), col); g.fill(g.poly([[x - 7, y - 4], [x + 7, y - 4], [x + 7, y], [x - 7, y]]), col); break;
      case 'spade': g.fill(g.shape([['M', x, y - 8], ['Q', x + 10, y, x, y + 4], ['Q', x - 10, y, x, y - 8]]), col); g.fill(g.poly([[x - 1, y + 2], [x + 1, y + 2], [x + 1, y + 8], [x - 1, y + 8]]), col); break;
      case 'note': g.fill(g.ell(x - 2, y + 5, 3.5, 3.5), col); g.fill(g.poly([[x + .5, y - 8], [x + 2.5, y - 8], [x + 2.5, y + 5], [x + .5, y + 5]]), col); g.fill(g.poly([[x + .5, y - 8], [x + 6.5, y - 8], [x + 6.5, y - 5.5], [x + .5, y - 5.5]]), col); break;
      case 'fang': g.fill(g.poly([[x - 6, y - 6], [x, y + 8], [x + 6, y - 6]]), col); break;
      case 'rock': g.fill(g.poly([[x - 7, y + 4], [x - 3, y - 7], [x + 5, y - 6], [x + 8, y + 3], [x + 1, y + 8]]), col); break;
      case 'moon': g.fill(g.ell(x, y, 7, 7), col); g.fill(g.ell(x + 3, y, 5.5, 5.5), shadeHex(col, -.7)); break;
      case 'skull': g.fill(g.ell(x, y - 1, 6, 6), col); g.fill(g.poly([[x - 3, y + 3], [x + 3, y + 3], [x + 3, y + 7], [x - 3, y + 7]]), col); g.fill(g.ell(x - 2, y - 1, 1.6, 1.6), '#000'); g.fill(g.ell(x + 2, y - 1, 1.6, 1.6), '#000'); break;
      case 'eye': g.fill(g.ell(x, y, 8, 4), col); g.fill(g.ell(x, y, 2.5, 2.5), '#000'); break;
      case 'drop': g.fill(g.shape([['M', x, y - 8], ['Q', x + 7, y + 2, x, y + 7], ['Q', x - 7, y + 2, x, y - 8]]), col); break;
      case 'leaf': g.fill(g.ell(x, y, 4, 8, .6), col); break;
      case 'sun': g.fill(g.ell(x, y, 4.5, 4.5), col); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.fill(g.ell(x + Math.cos(a) * 8, y + Math.sin(a) * 8, 1.4, 1.4), col); } break;
      case 'scale': g.fill(g.poly([[x - 1, y - 8], [x + 1, y - 8], [x + 1, y + 6], [x - 1, y + 6]]), col); g.fill(g.poly([[x - 8, y - 6], [x + 8, y - 6], [x + 8, y - 4], [x - 8, y - 4]]), col); g.fill(g.ell(x - 7, y, 3, 3), col); g.fill(g.ell(x + 7, y, 3, 3), col); break;
      case 'ball': g.fill(g.ell(x, y, 7, 7), '#fff'); g.fill(g.ell(x, y, 3, 3), '#111'); break;
      case 'atom': g.line([[x - 8, y], [x + 8, y]], col, 1.2); g.line([[x - 4, y - 7], [x + 4, y + 7]], col, 1.2); g.line([[x + 4, y - 7], [x - 4, y + 7]], col, 1.2); g.fill(g.ell(x, y, 2, 2), col); break;
      case 'dollar': g.line([[x + 3, y - 6], [x - 3, y - 3], [x + 3, y + 3], [x - 3, y + 6]], col, 2); g.line([[x, y - 8], [x, y + 8]], col, 1.2); break;
      default: g.fill(g.poly([[x, y - 7], [x + 6, y], [x, y + 7], [x - 6, y]]), col);
    }
  }
  function wings(g, P, w, s) {
    if (w.type === 'light') return; // drawn in pre()
    const sc = w.scale || 1;
    for (const side of [-1, 1]) {
      const flap = s.fl * (w.type === 'mech' ? .05 : .15), rot = side * (.2 + flap) - .25, ox = P.sh[0] - 4, oy = P.sh[1] + 2;
      const T = (x, y) => { const X = x * sc, Y = y * sc; return [ox + X * Math.cos(rot) - Y * Math.sin(rot), oy + X * Math.sin(rot) + Y * Math.cos(rot)]; };
      if (w.type === 'feather') g.paint([0, 1, 2, 3, 4].map(i => { const a = -.5 + i * .22 + rot, cx = ox + (-28 - i * 12) * sc * Math.cos(rot) - (-18 + i * 8) * sc * Math.sin(rot), cy = oy + (-28 - i * 12) * sc * Math.sin(rot) + (-18 + i * 8) * sc * Math.cos(rot); return g.ell(cx, cy, (34 - i * 3) * sc, 8 * sc, a); }), ...pair(w.color, .2));
      else if (w.type === 'mech') g.paint([g.poly([T(0, 0), T(-50, -34), T(-64, -26), T(-20, 6)])], ...pair(w.color));
      else if (w.type === 'fairy') g.paint([g.ell(...T(-22, -22), 24 * sc, 12 * sc, rot - .7), g.ell(...T(-16, 6), 16 * sc, 8 * sc, rot + .5)], 'rgba(200,230,255,1)', 'rgba(150,190,230,1)');
      else g.paint([g.poly([T(0, 0), T(-30, -44), T(-70, -30), T(-58, -8), T(-74, 4), T(-46, 10), T(-50, 26), T(-16, 16)])], ...(side < 0 ? pair(shadeHex(w.color, -.3)) : pair(w.color)));
    }
  }
  // wings of light: chunky additive pixels, drawn in pre()
  function lightWings(c, P, w, t) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const side of [-1, 1]) for (let i = 0; i < 5; i++) {
      const rot = side * (.2 + Math.sin(t * 6) * .15) - .25, sc = w.scale || 1, ang = -.5 + i * .22 + rot, L = (34 - i * 3) * sc * 1.6;
      const cx = P.sh[0] - 4 + (-28 - i * 12) * sc * Math.cos(rot) - (-18 + i * 8) * sc * Math.sin(rot), cy = P.sh[1] + 2 + (-28 - i * 12) * sc * Math.sin(rot) + (-18 + i * 8) * sc * Math.cos(rot);
      for (let j = -L / 2; j < L / 2; j += 4) { const al = (.5 - i * .07) * (1 - Math.abs(j) / L * 1.4); if (al > 0) { c.fillStyle = hexA(w.color, al); c.fillRect(Math.round((cx + Math.cos(ang) * j) / 3) * 3, Math.round((cy + Math.sin(ang) * j) / 3) * 3, 5, 5); } }
    }
    c.restore();
  }
  function weapon(g, P, w, s, info) {
    const [hx, hy] = P.fH, atk = !!s.atk, col = pair(w.color || '#cccccc'), ln = (a, b, wd, cc) => { g.line([a, b], '#08060f', wd + 2.4); g.line([a, b], cc, wd); };
    switch (w.type) {
      case 'blade': case 'katana': case 'dual': case 'greatsword': {
        const len = w.len || (w.type === 'greatsword' ? 70 : w.type === 'katana' ? 54 : 42), ang = s.wa !== undefined ? s.wa : (atk ? -.1 : -1.1), wd = w.type === 'greatsword' ? 10 : 5, tx = hx + Math.cos(ang) * len, ty = hy + Math.sin(ang) * len;
        ln([hx, hy], [tx, ty], wd, w.color); g.line([[hx, hy], [tx, ty]], '#ffffff', 1.2);
        ln([hx - Math.cos(ang + 1.57) * 6, hy - Math.sin(ang + 1.57) * 6], [hx + Math.cos(ang + 1.57) * 6, hy + Math.sin(ang + 1.57) * 6], 3, w.guard || '#886');
        if (w.type === 'dual') { const [bx, by] = P.bH; ln([bx, by], [bx + 30, by - 20], 4, w.color); }
        info.tip = [tx, ty]; break;
      }
      case 'staff': case 'spear': case 'trident': case 'scythe': {
        const ang = s.wa !== undefined ? s.wa : (atk ? 0 : -1.35), len = 80, x0 = hx - Math.cos(ang) * 30, y0 = hy - Math.sin(ang) * 30, tx = hx + Math.cos(ang) * len * .6, ty = hy + Math.sin(ang) * len * .6;
        ln([x0, y0], [tx, ty], 4, w.shaft || w.color);
        if (w.type === 'spear') g.fill(g.poly([[tx + Math.cos(ang) * 16, ty + Math.sin(ang) * 16], [tx + Math.cos(ang + 1.6) * 5, ty + Math.sin(ang + 1.6) * 5], [tx + Math.cos(ang - 1.6) * 5, ty + Math.sin(ang - 1.6) * 5]]), w.tip || '#fff');
        else if (w.type === 'trident') for (const o of [-.35, 0, .35]) g.line([[tx, ty], [tx + Math.cos(ang + o) * 18, ty + Math.sin(ang + o) * 18]], w.tip || '#ffd35a', 2.4);
        else if (w.type === 'scythe') g.paint([g.shape([['M', tx, ty], ['Q', tx + Math.cos(ang - 1.8) * 30 + Math.cos(ang) * 10, ty + Math.sin(ang - 1.8) * 30 + Math.sin(ang) * 10, tx + Math.cos(ang - 2.6) * 44, ty + Math.sin(ang - 2.6) * 44], ['Q', tx + Math.cos(ang - 1.9) * 20, ty + Math.sin(ang - 1.9) * 20, tx, ty]])], ...pair(w.tip || '#ccd'));
        info.tip = [tx, ty]; if (w.type === 'staff') info.orb = [tx, ty]; break;
      }
      case 'hammer': case 'axe': {
        const ang = s.wa !== undefined ? s.wa : (atk ? -.3 : -1.3), len = 50, tx = hx + Math.cos(ang) * len, ty = hy + Math.sin(ang) * len, ca = Math.cos(ang), sa = Math.sin(ang), p = (u, v2) => [tx + ca * u - sa * v2, ty + sa * u + ca * v2];
        ln([hx - ca * 8, hy - sa * 8], [tx, ty], 4, w.shaft || '#6b4a2a');
        g.paint([w.type === 'hammer' ? g.poly([p(-8, -16), p(10, -16), p(10, 16), p(-8, 16)]) : g.poly([p(-4, -2), p(14, -20), p(18, 0), p(14, 18), p(-4, 4)])], ...col); info.tip = [tx, ty]; break;
      }
      case 'claws': for (let k = -1; k <= 1; k++) { g.line([[hx, hy], [hx + 15, hy + k * 6 - 2]], w.color, 2.2); const [bx, by] = P.bH; g.line([[bx, by], [bx + 13, by + k * 5]], w.color, 2.2); } break;
      case 'gauntlet': g.paint([g.ell(hx, hy, 9, 9)], ...col); info.tip = w.glow ? [hx, hy] : null; break;
      case 'gloves': g.paint([g.ell(hx, hy, 8, 8)], ...col); g.paint([g.ell(P.bH[0], P.bH[1], 7, 7)], ...pair(shadeHex(w.color, -.2))); break;
      case 'cards': for (let i = -1; i <= 1; i++) { const a = i * .35 - .3, ca = Math.cos(a), sa = Math.sin(a), p = (u, v2) => [hx + ca * u - sa * v2, hy + sa * u + ca * v2]; g.paint([g.poly([p(0, -3), p(12, -3), p(12, 14), p(0, 14)])], '#ffffff', '#c8c8d0'); g.fill(g.ell(...p(5, 5), 2.4, 2.4), i ? '#dd2222' : '#222'); } break;
      case 'wrench': ln([hx, hy], [hx + 26, hy - 22], 5, w.color); g.paint([g.ell(hx + 28, hy - 24, 6, 6)], ...col); g.fill(g.ell(hx + 30, hy - 26, 2.5, 2.5), '#222'); break;
      case 'pistol': case 'pistols': for (const [px, py, k] of w.type === 'pistols' ? [[hx, hy, 1], [P.bH[0], P.bH[1], .9]] : [[hx, hy, 1]]) { g.paint([g.poly([[px, py - 5 * k], [px + 20 * k, py - 5 * k], [px + 20 * k, py + k], [px, py + k]]), g.poly([[px, py], [px + 5 * k, py], [px + 5 * k, py + 9 * k], [px, py + 9 * k]])], ...col); } break;
      case 'cannon': g.paint([g.poly([[hx - 12, hy - 9], [hx + 28, hy - 9], [hx + 28, hy + 9], [hx - 12, hy + 9]])], ...col); g.fill(g.poly([[hx + 24, hy - 6], [hx + 30, hy - 6], [hx + 30, hy + 6], [hx + 24, hy + 6]]), '#222'); info.tip = [hx + 32, hy]; break;
      case 'shield': { const bx = P.bH[0] + 6, by = P.bH[1] - 4; g.paint([g.poly([[bx, by - 24], [bx + 14, by - 18], [bx + 12, by + 10], [bx, by + 24], [bx - 10, by + 10], [bx - 12, by - 18]])], ...col); g.fill(g.ell(bx, by, 6, 6), w.accent || '#ffd35a'); if (w.sword) { const a = atk ? -.1 : -1.1; ln([hx, hy], [hx + Math.cos(a) * 40, hy + Math.sin(a) * 40], 4, w.sword); } break; }
      case 'whip': case 'chain': { const L2 = atk ? 70 : 30; g.line([[hx, hy], [hx + L2 * .5, hy - 20 + s.fl * 10], [hx + L2, hy + (atk ? 0 : 30)]], w.color, w.type === 'chain' ? 3 : 2, true); if (w.type === 'chain') g.fill(g.ell(hx + L2, hy + (atk ? 0 : 30), 6, 6), '#777'); break; }
      case 'fan': { const a = atk ? -.2 : -1; g.paint([g.poly([[hx, hy], [hx + Math.cos(a - .8) * 22, hy + Math.sin(a - .8) * 22], [hx + Math.cos(a) * 24, hy + Math.sin(a) * 24], [hx + Math.cos(a + .8) * 22, hy + Math.sin(a + .8) * 22]])], ...col); break; }
      case 'book': g.paint([g.poly([[P.bH[0] - 2, P.bH[1] - 14], [P.bH[0] + 14, P.bH[1] - 14], [P.bH[0] + 14, P.bH[1] + 6], [P.bH[0] - 2, P.bH[1] + 6]])], ...col); g.fill(g.poly([[P.bH[0] + 1, P.bH[1] - 12], [P.bH[0] + 4, P.bH[1] - 12], [P.bH[0] + 4, P.bH[1] + 4], [P.bH[0] + 1, P.bH[1] + 4]]), '#fff'); info.tip = [hx, hy]; break;
      case 'guitar': g.paint([g.ell(hx - 10, hy + 6, 12, 9, -.6)], ...col); ln([hx - 2, hy + 2], [hx + 32, hy - 20], 4, '#333'); break;
      case 'mic': ln([hx, hy], [hx + 8, hy - 14], 3, '#333'); g.fill(g.ell(hx + 10, hy - 17, 4, 4), '#aaa'); break;
      case 'baton': ln([hx, hy], [hx + (atk ? 30 : 10), hy - (atk ? 10 : 26)], 2.5, w.color); break;
      case 'bow': g.line([[hx - 4 + Math.cos(-1.1) * 28, hy + Math.sin(-1.1) * 28], [hx - 4 + 28, hy], [hx - 4 + Math.cos(1.1) * 28, hy + Math.sin(1.1) * 28]], w.color, 3, true); g.line([[hx - 4 + Math.cos(-1.1) * 28, hy + Math.sin(-1.1) * 28], [hx - 4 + Math.cos(1.1) * 28, hy + Math.sin(1.1) * 28]], '#eee', 1); break;
      case 'orb': g.paint([g.ell(hx + 6, hy - 6, 6, 6)], '#ffffff', '#cfcfe0'); info.orb = [hx + 6, hy - 6]; break;
      case 'knives': for (let i = 0; i < 3; i++) { const a = -.8 + i * .35; g.line([[hx, hy], [hx + Math.cos(a) * 16, hy + Math.sin(a) * 16]], '#dddddd', 3); } break;
      case 'pan': ln([hx, hy], [hx + 16, hy - 10], 4, '#333'); g.paint([g.ell(hx + 26, hy - 16, 12, 8, -.5)], '#444455', '#222233'); break;
      case 'ball': g.paint([g.ell(hx + 8, hy - 4, 8, 8)], '#ffffff', '#c8c8d0'); g.fill(g.ell(hx + 8, hy - 4, 2.5, 2.5), '#111'); break;
      case 'gavel': ln([hx, hy], [hx + 20, hy - 18], 3.5, '#6b4a2a'); g.paint([g.poly([[hx + 14, hy - 28], [hx + 34, hy - 24], [hx + 30, hy - 14], [hx + 10, hy - 18]])], ...pair(w.color || '#6b4a2a')); break;
      case 'cane': ln([hx, hy], [hx + 4, hy + 40], 3, w.color); g.line([[hx - 6, hy - 2], [hx, hy - 6], [hx + 6, hy - 2]], w.color, 3, true); g.fill(g.ell(hx - 8, hy, 3, 3), '#ffd35a'); break;
      case 'yoyo': { const yl = atk ? 70 : 24, ex2 = hx + (atk ? yl : 0), ey = hy + (atk ? 0 : yl); g.line([[hx, hy], [ex2, ey]], '#ffffff', 1); g.paint([g.ell(ex2, ey, 6, 6)], ...col); break; }
    }
  }

  return { make, install, portrait, hair, hat, ears, mask, animal, emblem, wings, lightWings, weapon, modelOf, pair, q };
})();
