'use strict';
// Character Builder: rigged, customizable full-body anime characters with generated animations.
// Poses are skeletons (angles measured from straight down, positive = forward/right);
// each body part is painted as cel-shaded shapes with an outline, then snapped to a palette.
(function () {
  const TAU = Math.PI * 2;
  const shadeHex = (hex, dir = -1, amt = 14) => { const c = hexToRgba(hex); return toHex(shadeColor(c[0], c[1], c[2], dir, amt, true)); };
  const dir = a => [Math.sin(a), Math.cos(a)];
  const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  const PRESETS = {
    'Angel': { heads: 6.5, build: 'slim', frame: 'feminine', hairStyle: 'long', sleeves: 'long', bottomStyle: 'skirt', wings: 'angel', headgear: 'halo', weapon: 'spear', cape: false,
      skin: '#f7dcc0', hair: '#fff0b0', eyes: '#6a5aa8', top: '#f4f0ff', bottom: '#fffbe8', boots: '#e6c060', accent: '#e6c060', outline: '#2a1f4a' },
    'Darkin': { heads: 7.5, build: 'muscular', frame: 'masculine', hairStyle: 'spiky', sleeves: 'sleeveless', bottomStyle: 'pants', wings: 'demon', headgear: 'horns', weapon: 'darkin', cape: false,
      skin: '#7a1a1e', hair: '#2a0d10', eyes: '#ff3a2a', top: '#2a0d10', bottom: '#2a0a0c', boots: '#1e0709', accent: '#6a1016', outline: '#0a0102' },
    'Schoolgirl': { heads: 6.5, build: 'slim', frame: 'feminine', hairStyle: 'twintails', sleeves: 'short', bottomStyle: 'skirt', wings: 'none', headgear: 'none', weapon: 'none', cape: false,
      skin: '#fde0cc', hair: '#ff85b8', eyes: '#4aa8f0', top: '#ffffff', bottom: '#3a4466', boots: '#5a3a2a', accent: '#e43b44', outline: '#2a1f2d' },
    'Ninja': { heads: 6.5, build: 'normal', frame: 'masculine', hairStyle: 'spiky', sleeves: 'long', bottomStyle: 'pants', wings: 'none', headgear: 'none', weapon: 'sword', cape: true,
      skin: '#f5bd9c', hair: '#1c1a24', eyes: '#e08a1e', top: '#262b44', bottom: '#262b44', boots: '#181425', accent: '#e43b44', outline: '#0f0d17' },
    'Knight': { heads: 7, build: 'muscular', frame: 'masculine', hairStyle: 'short', sleeves: 'long', bottomStyle: 'pants', wings: 'none', headgear: 'none', weapon: 'sword', cape: true,
      skin: '#f5bd9c', hair: '#b98556', eyes: '#1f5fbf', top: '#c0cbdc', bottom: '#8b9bb4', boots: '#5a6988', accent: '#feae34', outline: '#181425' },
    'Mage': { heads: 6.5, build: 'slim', frame: 'feminine', hairStyle: 'bob', sleeves: 'long', bottomStyle: 'skirt', wings: 'none', headgear: 'catears', weapon: 'staff', cape: true,
      skin: '#fff4ec', hair: '#9474e0', eyes: '#2fb36b', top: '#3d2a5c', bottom: '#5b3fa8', boots: '#2a0a5c', accent: '#ffc94a', outline: '#1a1020' },
    'Chibi hero': { heads: 3, build: 'normal', frame: 'masculine', hairStyle: 'spiky', sleeves: 'short', bottomStyle: 'shorts', wings: 'none', headgear: 'none', weapon: 'sword', cape: true,
      skin: '#ffe6d5', hair: '#e8c56a', eyes: '#2a6fd1', top: '#3b5dc9', bottom: '#5a3a2a', boots: '#733e39', accent: '#e43b44', outline: '#1a1c2c' },
  };

  const FIELDS = [
    ['size', 'Canvas height', [[64, '64 px'], [96, '96 px'], [128, '128 px'], [160, '160 px'], [192, '192 px']]],
    ['heads', 'Proportions', [[3, 'Chibi (3 heads)'], [5, 'Cute (5 heads)'], [6.5, 'Anime (6.5 heads)'], [7, 'Tall (7 heads)'], [7.5, 'Heroic (7.5 heads)']]],
    ['build', 'Build', ['slim', 'normal', 'muscular']],
    ['frame', 'Body shape', ['feminine', 'masculine']],
    ['hairStyle', 'Hair', ['short', 'long', 'ponytail', 'twintails', 'spiky', 'bob']],
    ['sleeves', 'Sleeves', ['long', 'short', 'sleeveless']],
    ['bottomStyle', 'Bottoms', ['pants', 'skirt', 'shorts']],
    ['wings', 'Wings', ['none', 'angel', 'demon']],
    ['headgear', 'Headgear', ['none', 'halo', 'horns', 'catears']],
    ['weapon', 'Weapon', ['none', 'sword', 'spear', 'staff', 'darkin']],
    ['cape', 'Cape', 'check'],
    ['skin', 'Skin', 'color'], ['hair', 'Hair colour', 'color'], ['eyes', 'Eyes', 'color'], ['top', 'Top', 'color'],
    ['bottom', 'Bottoms colour', 'color'], ['boots', 'Boots', 'color'], ['accent', 'Accent', 'color'], ['outline', 'Outline', 'color'],
  ];

  // ---------- animations ----------
  const J = { lift: [0, 0, .06, .16, .2, .14, .02, 0], kn: [.7, 1.2, 0, .4, 1.3, .5, 1.1, .35], th: [.35, .65, -.1, .25, 1, .35, .55, .18],
    sh: [-.5, -.8, 2.7, 2.4, 1.4, 2, -.6, .1], el: [.3, .3, .1, .3, .9, .4, .3, .2], lean: [.2, .35, -.05, 0, .1, 0, .3, .1], flap: [0, -.3, .8, .4, -.4, .2, -.2, 0] };
  const A = { sh: [3.3, 3.7, 2.5, 1.3, .8, .4], el: [.5, .6, .2, .05, .1, .4], lean: [-.12, -.18, .1, .28, .3, .08], far: [.4, .5, -.3, -.6, -.5, 0], wrot: [.8, .9, .4, .2, .3, 1.6] };
  // Keyframed moves are sampled with interpolation, so they can use any number of frames.
  const samp = (arr, t) => { const x = ((t % 1) + 1) % 1 * arr.length, i = Math.floor(x), j = (i + 1) % arr.length, f = x - i; return arr[i] + (arr[j] - arr[i]) * f; };
  const K = { th: [.15, 1.1, 1.9, 1.9, 1.4, .6, .15], kn: [.1, 1.7, .15, .05, .9, .5, .1], lean: [0, -.1, -.28, -.28, -.15, -.05, 0] };
  const ANIMS = {
    idle: { n: 8, fps: 8, f(t, i, n) { const s = Math.sin(TAU * t); return { lean: .02, lift: 0, bob: s > .2 ? 1 : 0, legs: [{ th: .1, kn: .04 }, { th: -.08, kn: .02 }],
      arms: [{ sh: .12 + .03 * s, el: .25 }, { sh: -.08 - .03 * s, el: .2 }], blink: i === n - 1, sway: s * .06, flap: s * .15, wrot: 2.3 }; } },
    walk: { n: 12, fps: 14, f(t) { const p = TAU * t, s = Math.sin(p), c = Math.cos(p); return { lean: .06, lift: 0,
      legs: [{ th: .5 * s, kn: .9 * Math.max(0, c) + .05 }, { th: -.5 * s, kn: .9 * Math.max(0, -c) + .05 }],
      arms: [{ sh: -.45 * s, el: .3 + .2 * Math.max(0, -s) }, { sh: .45 * s, el: .3 + .2 * Math.max(0, s) }], sway: -c * .12, flap: s * .2, wrot: 2.2 }; } },
    run: { n: 10, fps: 16, f(t) { const p = TAU * t, s = Math.sin(p), c = Math.cos(p); return { lean: .25, lift: .03 * Math.abs(s),
      legs: [{ th: .85 * s + .1, kn: 1.5 * Math.max(0, c) + .2 }, { th: -.85 * s + .1, kn: 1.5 * Math.max(0, -c) + .2 }],
      arms: [{ sh: -.9 * s, el: 1.5 }, { sh: .9 * s, el: 1.5 }], sway: -c * .25 - .2, flap: s * .3, wrot: 1.8 }; } },
    jump: { n: 12, fps: 14, f(t) { const k = key => samp(J[key], t); return { lean: k('lean'), lift: k('lift'), legs: [{ th: k('th'), kn: k('kn') }, { th: k('th') - .25, kn: k('kn') * .9 }],
      arms: [{ sh: k('sh'), el: k('el') }, { sh: k('sh') - .3, el: k('el') + .1 }], sway: t >= .25 && t < .6 ? .3 : -.1, flap: k('flap'), wrot: 2.2 }; } },
    attack: { n: 10, fps: 16, f(t) { const k = key => samp(A[key], t); return { lean: k('lean'), lift: 0, legs: [{ th: .4, kn: .45 }, { th: -.4, kn: .12 }],
      arms: [{ sh: k('sh'), el: k('el') }, { sh: k('far'), el: .5 }], sway: k('lean'), flap: .1, wrot: k('wrot'), swoosh: t >= .3 && t < .8 ? [samp(A.sh, t - .15), k('sh')] : null }; } },
    kick: { n: 10, fps: 16, f(t) { const k = key => samp(K[key], t); return { lean: k('lean'), lift: 0, legs: [{ th: k('th'), kn: k('kn') }, { th: -.25, kn: .15 }],
      arms: [{ sh: .7, el: 1.7 }, { sh: -.4, el: 1.3 }], sway: k('lean'), flap: .1, wrot: 2.2, kickTrail: t >= .25 && t < .6 ? [samp(K.th, t - .14), k('th')] : null }; } },
    hover: { n: 8, fps: 10, f(t) { const s = Math.sin(TAU * t); return { lean: .05, lift: .07 + .02 * s, legs: [{ th: .15, kn: .5 }, { th: .35, kn: .7 }],
      arms: [{ sh: .35, el: .3 }, { sh: .2, el: .4 }], sway: s * .1, flap: s * .9, wrot: 2.3 }; } },
  };

  // ---------- rig ----------
  function proportions(o, W, Hc) {
    const H = Hc * (o.weapon === 'darkin' ? .5 : o.wings !== 'none' || o.headgear === 'horns' ? .72 : .78), h = H / o.heads, bm = { slim: .85, normal: 1, muscular: 1.3 }[o.build], masc = o.frame === 'masculine';
    const leg = H * (o.heads <= 3.5 ? .3 : o.heads <= 5.5 ? .42 : .48), headNeck = h * 1.12, torso = H - leg - headNeck;
    return { H, h, leg, torso, thigh: leg * .5, shin: leg * .5, arm: torso * .95 + leg * .12, r: Math.max(1.1, H * .021 * bm),
      rx: h * .46, ry: h * .5, sw: H * (masc ? .105 : .09) * bm, ww: H * (masc ? .08 : .06) * bm, hw: H * (masc ? .08 : .095) * bm,
      foot: Math.max(2, H * .05), cx: W * (o.weapon === 'darkin' ? .42 : .5), floor: Hc * .95 };
  }
  function rig(P, pose) {
    const ext = L => Math.cos(L.th) * P.thigh + Math.cos(L.th - L.kn) * P.shin;
    const hipY = P.floor - P.r - Math.max(ext(pose.legs[0]), ext(pose.legs[1])) - pose.lift * P.H + (pose.bob || 0) * Math.max(1, P.H / 90);
    const hip = [P.cx - Math.sin(pose.lean) * P.torso * .3, hipY];
    const up = [Math.sin(pose.lean), -Math.cos(pose.lean)], rt = [-up[1], up[0]];
    const neck = add(hip, up, P.torso), sh = add(neck, up, -P.torso * .1), waist = add(hip, up, P.torso * .42);
    const head = add(neck, up, P.h * .12 + P.ry * .95), off = (p, k) => add(p, rt, k);
    const leg = (h0, L) => { const k = add(h0, dir(L.th), P.thigh), sa = L.th - L.kn, a = add(k, dir(sa), P.shin); return { h: h0, k, a, toe: add(a, dir(sa + Math.PI / 2), P.foot) }; };
    const arm = (s, A) => { const e = add(s, dir(A.sh), P.arm * .5), fa = A.sh + A.el; return { s, e, hd: add(e, dir(fa), P.arm * .5), fa }; };
    const shN = off(sh, P.sw * .25), shF = off(sh, -P.sw * .25);
    return { hip, up, rt, neck, sh, waist, head, off, shN, shF,
      legs: [leg(off(hip, P.hw * .2), pose.legs[0]), leg(off(hip, -P.hw * .2), pose.legs[1])],
      arms: [arm(shN, pose.arms[0]), arm(shF, pose.arms[1])] };
  }

  // ---------- painting ----------
  const [T, Tx] = (() => { const c = document.createElement('canvas'); return [c, c.getContext('2d')]; })();
  const cap = (a, b, r) => { const p = new Path2D(), d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d * r, ny = (b[0] - a[0]) / d * r;
    p.arc(a[0], a[1], r, 0, TAU); p.moveTo(b[0] + r, b[1]); p.arc(b[0], b[1], r, 0, TAU);
    p.moveTo(a[0] + nx, a[1] + ny); p.lineTo(b[0] + nx, b[1] + ny); p.lineTo(b[0] - nx, b[1] - ny); p.lineTo(a[0] - nx, a[1] - ny); p.closePath(); return p; };
  const poly = pts => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
  const ell = (c, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(c[0], c[1], Math.max(.5, rx), Math.max(.5, ry), rot, 0, TAU); return p; };

  function drawCharacter(o, anim, i) {
    const Hc = +o.size, W = o.weapon === 'darkin' ? Math.round(Hc * 1.5) : Hc, a = ANIMS[anim], pose = a.f(i / a.n, i, a.n);
    const P = proportions(o, W, Hc), R = rig(P, pose);
    const C = {}, used = new Set([o.outline, '#ffffff', o.eyes]);
    for (const k of ['skin', 'hair', 'top', 'bottom', 'boots', 'accent']) { C[k] = o[k]; C[k + 'S'] = shadeHex(o[k]); C[k + 'D'] = shadeHex(C[k + 'S'], -1, 10); }
    const cv = document.createElement('canvas'); cv.width = W; cv.height = Hc;
    const X = cv.getContext('2d');
    T.width = W; T.height = Hc;
    const so = Math.max(.9, P.H / 110);
    const paint = (pieces, base, shade, outline = true) => {
      used.add(base); used.add(shade);
      Tx.clearRect(0, 0, W, Hc);
      Tx.fillStyle = shade; for (const p of pieces) Tx.fill(p);
      Tx.globalCompositeOperation = 'source-atop'; Tx.fillStyle = base;
      Tx.save(); Tx.translate(-so, -so); for (const p of pieces) Tx.fill(p); Tx.restore();
      if (outline) { Tx.globalCompositeOperation = 'destination-over'; Tx.strokeStyle = o.outline; Tx.lineWidth = 2; Tx.lineJoin = 'round'; for (const p of pieces) Tx.stroke(p); }
      Tx.globalCompositeOperation = 'source-over';
      X.drawImage(T, 0, 0);
    };
    const mat = (k, far) => far ? [C[k + 'S'], C[k + 'D']] : [C[k], C[k + 'S']];
    const r = P.r, hd = R.head, rx = P.rx, ry = P.ry, sway = pose.sway * P.h;

    // back: cape and wings
    if (o.cape) {
      const wave = sway * 1.5, b0 = R.off(R.sh, P.sw * .35), b1 = R.off(R.sh, -P.sw * .6);
      paint([poly([b0, b1, [b1[0] - P.sw * .6 + wave, P.floor - P.H * .12], [b1[0] + P.sw * .2 + wave * .6, P.floor - P.H * .1]])], ...mat('accent', true));
    }
    if (o.wings !== 'none') {
      const wb = R.off(add(R.sh, R.up, -P.torso * .1), -P.sw * .4);
      for (const far of [true, false]) {
        const base = far ? add(wb, [P.sw * .35, -P.h * .1]) : wb, fl = pose.flap * (far ? .25 : .35);
        if (o.wings === 'angel') {
          const pieces = [];
          for (let k = 0; k < 5; k++) {
            const ang = -2.9 + k * .29 + fl, len = P.H * (.34 - k * .025), d = [Math.cos(ang), Math.sin(ang)];
            pieces.push(ell(add(base, d, len / 2), len / 2, P.H * .035, ang));
          }
          paint(pieces, far ? '#dcd6ee' : '#f6f2ff', far ? '#b8b0d8' : '#c8c0e8');
        } else {
          const tips = [[-2.9, .33], [-2.4, .38], [-1.9, .3]].map(([ang, l]) => add(base, [Math.cos(ang + fl), Math.sin(ang + fl)], P.H * l));
          const mid = (p, q) => lerp(lerp(p, q, .5), base, .25);
          paint([poly([base, tips[0], mid(tips[0], tips[1]), tips[1], mid(tips[1], tips[2]), tips[2]])], ...mat('accent', far));
          paint(tips.map(t => cap(base, t, Math.max(.7, r * .5))), C.accentD, C.accentD);
        }
      }
    }

    // limbs and body, back to front
    const drawArm = (A, far, withHand = true) => {
      const [sk, skS] = mat('skin', far), [tp, tpS] = mat('top', far);
      const upper = cap(A.s, A.e, r), fore = cap(A.e, A.hd, r * .9);
      if (o.sleeves === 'long') paint([upper, fore], tp, tpS);
      else if (o.sleeves === 'short') { paint([fore], sk, skS); paint([upper], tp, tpS); }
      else paint([upper, fore], sk, skS);
      if (o.weapon !== 'none') paint([cap(lerp(A.e, A.hd, .55), lerp(A.e, A.hd, .9), r * 1.05)], ...mat('accent', far));
      if (withHand) paint([ell(A.hd, r * 1.15, r * 1.15)], sk, skS);
    };
    const drawLeg = (L, far) => {
      const thigh = cap(L.h, L.k, r * 1.2), shin = cap(L.k, L.a, r), boot = [cap(lerp(L.k, L.a, .45), L.a, r * 1.05), cap(L.a, L.toe, r * .9)];
      const [sk, skS] = mat('skin', far), [bt, btS] = mat('bottom', far);
      if (o.bottomStyle === 'pants') paint([thigh, shin], bt, btS);
      else { paint([thigh, shin], sk, skS); if (o.bottomStyle === 'shorts') paint([cap(L.h, lerp(L.h, L.k, .5), r * 1.3)], bt, btS); }
      paint(boot, ...mat('boots', far));
    };
    drawArm(R.arms[1], true);
    drawLeg(R.legs[1], true);
    const { off, waist, hip, sh } = R;
    paint([poly([off(waist, P.ww / 2), off(waist, -P.ww / 2), off(hip, -P.hw / 2), off(hip, P.hw / 2)]), cap(off(hip, -P.hw * .4), off(hip, P.hw * .4), r * 1.2)], C.bottom, C.bottomS);
    drawLeg(R.legs[0], false);
    if (o.bottomStyle === 'skirt') {
      const hem = add(hip, R.up, -P.thigh * .75), fl = Math.sin(pose.lean + pose.sway) * P.h * .3;
      paint([poly([off(waist, P.ww * .55), off(waist, -P.ww * .55), off(add(hem, [fl, 0]), -P.hw * .95), off(add(hem, [fl, 0]), P.hw * .95)])], C.bottom, C.bottomS);
    }
    const torso = [poly([off(sh, P.sw / 2), off(sh, -P.sw / 2), off(waist, -P.ww / 2), off(waist, P.ww / 2)]), cap(off(sh, -P.sw * .35), off(sh, P.sw * .35), r * 1.1)];
    if (o.frame === 'feminine') torso.push(ell(off(lerp(sh, waist, .38), P.sw * .22), r * 1.25, r));
    if (o.sleeves === 'sleeveless' && o.build === 'muscular') paint(torso, C.skin, C.skinS); else paint(torso, C.top, C.topS);
    if (o.sleeves === 'sleeveless' && o.build === 'muscular') paint([cap(off(sh, -P.sw * .5), off(waist, P.ww * .3), r * .6)], C.top, C.topS);
    paint([cap(off(waist, -P.ww * .5), off(waist, P.ww * .5), Math.max(.7, r * .5))], C.accent, C.accentS);
    paint([cap(R.neck, add(R.neck, R.up, P.h * .2), r * .95)], C.skin, C.skinS);

    // head
    const hairBack = [ell([hd[0] - rx * .08, hd[1] - ry * .08], rx * 1.12, ry * 1.08)];
    const hs = o.hairStyle;
    if (hs === 'long') hairBack.push(poly([[hd[0] - rx * 1.1, hd[1] - ry * .2], [hd[0] - rx * 1.25 + sway, hd[1] + ry + P.torso * .75], [hd[0] - rx * .1 + sway, hd[1] + ry + P.torso * .65], [hd[0] + rx * .5, hd[1] + ry * .3]]));
    if (hs === 'ponytail') hairBack.push(cap([hd[0] - rx * .95, hd[1] - ry * .55], [hd[0] - rx * 1.7 + sway, hd[1] + ry * 1.4], rx * .32));
    if (hs === 'twintails') hairBack.push(cap([hd[0] - rx * .85, hd[1] - ry * .45], [hd[0] - rx * 1.35 + sway, hd[1] + ry * 2.2], rx * .3),
      cap([hd[0] + rx * .5, hd[1] - ry * .75], [hd[0] + rx * .25 + sway, hd[1] + ry * 2.2], rx * .28));
    if (hs === 'bob') hairBack.push(ell([hd[0] - rx * .1, hd[1] + ry * .12], rx * 1.2, ry * 1.12));
    if (hs === 'spiky') { const pts = []; for (let k = 0; k <= 12; k++) { const t = Math.PI * (.85 + k * 1.05 / 12), R2 = k % 2 ? 1.55 : 1.08; pts.push([hd[0] + Math.cos(t) * rx * R2, hd[1] + Math.sin(t) * ry * R2]); } pts.push([hd[0], hd[1]]); hairBack.push(poly(pts)); }
    paint(hairBack, C.hair, C.hairS);
    paint([ell(hd, rx, ry), poly([[hd[0] - rx * .6, hd[1] + ry * .5], [hd[0] + rx * .45, hd[1] + ry * 1.05], [hd[0] + rx * .95, hd[1] + ry * .3]])], C.skin, C.skinS);
    // face (pixel aligned, no anti-aliasing)
    const ew = Math.max(1, Math.round(rx * .26)), eh = Math.max(2, Math.round(ry * .34)), eyeS = shadeHex(o.eyes, -1, 18);
    used.add(eyeS); used.add(C.skinD);
    for (const [ex, k] of [[hd[0] + rx * .42, 1], [hd[0] - rx * .12, .7]]) {
      const w = Math.max(1, Math.round(ew * k)), x0 = Math.round(ex - w / 2), y0 = Math.round(hd[1] + ry * .05);
      X.fillStyle = o.outline;
      if (pose.blink) { X.fillRect(x0, y0 + eh - 1, w, 1); continue; }
      X.fillRect(x0, y0 - 1, w + (k === 1 ? 1 : 0), 1);
      X.fillStyle = o.eyes; X.fillRect(x0, y0, w, eh);
      X.fillStyle = eyeS; X.fillRect(x0, y0, w, Math.max(1, eh >> 1));
      if (w >= 2 && eh >= 3) { X.fillStyle = '#ffffff'; X.fillRect(x0, y0, 1, 1); }
    }
    if (P.h >= 16) { X.fillStyle = C.skinD; X.fillRect(Math.round(hd[0] + rx * .3), Math.round(hd[1] + ry * .62), Math.max(1, Math.round(rx * .18)), 1); }
    const bj = hs === 'spiky' ? 1.6 : 1;
    paint([poly([[hd[0] - rx * 1.05, hd[1] + ry * .1], [hd[0] - rx, hd[1] - ry * .55], [hd[0] - rx * .4, hd[1] - ry * 1.08], [hd[0] + rx * .4, hd[1] - ry * 1.05], [hd[0] + rx * 1.02, hd[1] - ry * .45],
      [hd[0] + rx, hd[1] + ry * .05], [hd[0] + rx * .8, hd[1] - ry * .2 * bj], [hd[0] + rx * .6, hd[1]], [hd[0] + rx * .45, hd[1] - ry * .3 * bj], [hd[0] + rx * .2, hd[1] - ry * .05],
      [hd[0], hd[1] - ry * .35 * bj], [hd[0] - rx * .3, hd[1] - ry * .1], [hd[0] - rx * .5, hd[1] - ry * .4 * bj], [hd[0] - rx * .75, hd[1] + ry * .2]])], C.hair, C.hairS);
    if (o.headgear === 'halo') { used.add('#ffe08a'); X.strokeStyle = '#ffe08a'; X.lineWidth = Math.max(1.2, P.h * .09); X.beginPath(); X.ellipse(hd[0], hd[1] - ry * 1.45, rx * .95, ry * .25, 0, 0, TAU); X.stroke(); }
    if (o.headgear === 'horns') for (const dx of [-rx * .7, 0]) paint([poly([[hd[0] + rx * .35 + dx, hd[1] - ry * .75], [hd[0] + rx * .15 + dx, hd[1] - ry * 1.5], [hd[0] - rx * .3 + dx, hd[1] - ry * 1.9], [hd[0] - rx * .05 + dx, hd[1] - ry * 1.45], [hd[0] - rx * .05 + dx, hd[1] - ry * .8]])], dx ? '#a89880' : '#d8c8b0', dx ? '#7a6c5a' : '#a89880');
    if (o.headgear === 'catears') paint([poly([[hd[0] - rx * .6, hd[1] - ry * .7], [hd[0] - rx * .55, hd[1] - ry * 1.45], [hd[0] - rx * .1, hd[1] - ry * .95]]),
      poly([[hd[0] + rx * .2, hd[1] - ry * .95], [hd[0] + rx * .55, hd[1] - ry * 1.5], [hd[0] + rx * .75, hd[1] - ry * .6]])], C.hair, C.hairS);

    // The Darkin Blade, same geometry as Aatrox's blade in the game (units: 112 = body height).
    function darkinBlade(at, ang, g, pose) {
      const len = 124, bw = 14, m = new DOMMatrix().translate(at[0], at[1]).rotate(ang * 180 / Math.PI).scale(g, g);
      const mv = p => { const q = new Path2D(); q.addPath(p, m); return q; };
      const pc = (a, b, rr) => mv(cap(a, b, rr));
      paint([pc([-24, 0], [6, 0], 2.8)], '#140405', '#0a0102');
      const body = new Path2D(); body.moveTo(12, -bw * .7);
      for (let k = 1; k <= 7; k++) body.lineTo(12 + (len - 12) * k / 8, -bw * .7 * (1 - k / 9) - (k % 2 ? 7 : 0));
      body.lineTo(len, bw * .05); body.quadraticCurveTo(len * .62, bw * 1.05, 12, bw * .75); body.closePath();
      paint([mv(body)], '#6e0f16', '#3a080c');
      const guard = new Path2D(); guard.moveTo(4, -18); guard.quadraticCurveTo(14, -6, 8, 0); guard.quadraticCurveTo(14, 6, 4, 18); guard.lineTo(16, 10); guard.lineTo(18, 0); guard.lineTo(16, -10); guard.closePath();
      paint([mv(guard)], '#1e0709', '#120304');
      const ex = len * .3, ew = 11, eh = pose.blink ? 1 : 7;
      paint([mv(ell([ex, 0], ew + 2.5, eh + 2.5))], '#150204', '#150204');
      X.save(); X.transform(m.a, m.b, m.c, m.d, m.e, m.f);
      X.strokeStyle = '#aa141e'; X.lineWidth = 2.6; X.lineCap = 'round'; X.beginPath(); X.moveTo(18, bw * .12); X.quadraticCurveTo(len * .55, bw * .3, len * .9, bw * .08); X.stroke();
      if (!pose.blink) {
        X.fillStyle = '#ffcf8a'; X.beginPath(); X.ellipse(ex, 0, ew, eh, 0, 0, TAU); X.fill();
        X.fillStyle = '#d0101a'; X.beginPath(); X.ellipse(ex, 0, ew * .45, eh, 0, 0, TAU); X.fill();
        X.fillStyle = '#000000'; X.beginPath(); X.ellipse(ex, 0, Math.max(1.5 / g, ew * .14), eh * .9, 0, 0, TAU); X.fill();
      } else { X.strokeStyle = '#ff2a2a'; X.lineWidth = 2 / g; X.beginPath(); X.moveTo(ex - ew, 0); X.lineTo(ex + ew, 0); X.stroke(); }
      X.restore();
      for (const c of ['#aa141e', '#ffcf8a', '#d0101a', '#000000', '#ff2a2a']) used.add(c);
    }
    // near arm, weapon, hand, swoosh
    const nA = R.arms[0];
    drawArm(nA, false, false);
    const wd = dir(nA.fa + pose.wrot);
    if (o.weapon === 'sword') {
      const len = P.H * .3, w = Math.max(1.5, P.H * .018), b0 = add(nA.hd, wd, len * .08), tip = add(nA.hd, wd, len), n = [-wd[1] * w, wd[0] * w];
      paint([cap(add(nA.hd, wd, -len * .1), nA.hd, Math.max(.8, r * .5))], '#5a3a2a', '#3e2731');
      paint([poly([add(b0, n), add(add(b0, wd, len * .8), n), tip, add(add(b0, wd, len * .8), n, -1), add(b0, n, -1)])], '#dfe6f0', '#8b9bb4');
      paint([cap(add(b0, n, 1.8), add(b0, n, -1.8), Math.max(.8, r * .5))], C.accent, C.accentS);
    } else if (o.weapon === 'spear') {
      const L = P.H * .7, tip = add(nA.hd, wd, L * .55);
      paint([cap(add(nA.hd, wd, -L * .45), tip, Math.max(.8, r * .45))], '#b8903a', '#8a6a2a');
      const n = [-wd[1] * P.H * .025, wd[0] * P.H * .025];
      paint([poly([add(tip, n), add(tip, wd, P.H * .08), add(tip, n, -1)])], '#dfe6f0', '#8b9bb4');
    } else if (o.weapon === 'staff') {
      const top = [nA.hd[0], nA.hd[1] - P.H * .35];
      paint([cap([nA.hd[0], nA.hd[1] + P.H * .18], top, Math.max(.8, r * .5))], '#8a5a3a', '#5a3a2a');
      paint([ell(top, P.h * .18, P.h * .18)], C.accent, C.accentS);
    }
    else if (o.weapon === 'darkin') darkinBlade(nA.hd, Math.atan2(wd[1], wd[0]), P.H / 112, pose);
    paint([ell(nA.hd, r * 1.15, r * 1.15)], C.skin, C.skinS);
    if (pose.swoosh && o.weapon !== 'none') {
      const phi = a => Math.PI / 2 - a, rad = P.arm + (o.weapon === 'darkin' ? P.H * .9 : o.weapon === 'sword' ? P.H * .25 : P.H * .3);
      X.globalAlpha = .9; X.strokeStyle = '#ffffff'; X.lineWidth = Math.max(1.5, P.H * .03); X.lineCap = 'round';
      X.beginPath(); X.arc(nA.s[0], nA.s[1], rad, phi(pose.swoosh[0]), phi(pose.swoosh[1]), pose.swoosh[1] > pose.swoosh[0]); X.stroke();
      X.strokeStyle = C.accent; X.lineWidth = Math.max(1, P.H * .012); X.beginPath(); X.arc(nA.s[0], nA.s[1], rad - P.H * .03, phi(pose.swoosh[0]), phi(pose.swoosh[1]), pose.swoosh[1] > pose.swoosh[0]); X.stroke();
      X.globalAlpha = 1; X.lineCap = 'butt';
    }

    if (pose.kickTrail) {
      const phi = a => Math.PI / 2 - a, L0 = R.legs[0], rad = P.thigh + P.shin;
      X.globalAlpha = .85; X.lineCap = 'round';
      X.strokeStyle = '#ffffff'; X.lineWidth = Math.max(1.5, P.H * .03); X.beginPath(); X.arc(L0.h[0], L0.h[1], rad, phi(pose.kickTrail[0]), phi(pose.kickTrail[1]), pose.kickTrail[1] > pose.kickTrail[0]); X.stroke();
      X.strokeStyle = C.accent; X.lineWidth = Math.max(1, P.H * .012); X.beginPath(); X.arc(L0.h[0], L0.h[1], rad - P.H * .03, phi(pose.kickTrail[0]), phi(pose.kickTrail[1]), pose.kickTrail[1] > pose.kickTrail[0]); X.stroke();
      X.globalAlpha = 1; X.lineCap = 'butt';
    }
    // snap to palette: crisp pixels, no stray anti-aliased colours
    const pal = [...used].map(hexToRgba), d = X.getImageData(0, 0, W, Hc).data, out = new Uint8ClampedArray(d.length);
    for (let q = 0; q < d.length; q += 4) {
      if (d[q + 3] < 110) continue;
      let best = pal[0], bd = 1e9;
      for (const c of pal) { const e = (d[q] - c[0]) ** 2 * 2 + (d[q + 1] - c[1]) ** 2 * 4 + (d[q + 2] - c[2]) ** 2 * 3; if (e < bd) { bd = e; best = c; } }
      out[q] = best[0]; out[q + 1] = best[1]; out[q + 2] = best[2]; out[q + 3] = 255;
    }
    // ground shadow on its own layer
    const shadow = new Uint8ClampedArray(W * Hc * 4), srx = P.H * .16 * Math.max(.4, 1 - pose.lift * 3), sry = Math.max(1, P.H * .025);
    for (let y = Math.floor(P.floor - sry); y <= P.floor + sry; y++) for (let x = Math.floor(P.cx - srx); x <= P.cx + srx; x++) {
      if (x < 0 || y < 0 || x >= W || y >= Hc) continue;
      if (((x - P.cx) / srx) ** 2 + ((y - P.floor) / sry) ** 2 <= 1) shadow[(y * W + x) * 4 + 3] = 255;
    }
    return { ch: out, shadow, W, H: Hc, palette: [...used] };
  }

  // ---------- builder UI ----------
  const dlg = $('#charDlg'), optsBox = $('#chOpts'), prev = $('#chPrev'), pctx = prev.getContext('2d');
  let opts = Object.assign({ size: 128, anim: 'walk' }, PRESETS.Angel, store.get('pxs.char', {})), cache = [], pf = 0, timer = null;
  for (const [k, label, kind] of FIELDS) {
    const row = document.createElement('label'); row.className = 'opt' + (kind === 'check' ? ' chk' : '');
    if (kind === 'color') row.innerHTML = `<span>${label}</span><input type="color" id="ch_${k}">`;
    else if (kind === 'check') row.innerHTML = `<input type="checkbox" id="ch_${k}"><span>${label}</span>`;
    else row.innerHTML = `<span>${label}</span><select id="ch_${k}">${kind.map(v => Array.isArray(v) ? `<option value="${v[0]}">${v[1]}</option>` : `<option>${v}</option>`).join('')}</select>`;
    optsBox.appendChild(row);
  }
  const fill = () => { for (const [k, , kind] of FIELDS.concat([['anim']])) { const el = $('#ch_' + k); if (kind === 'check') el.checked = !!opts[k]; else el.value = opts[k]; } };
  const read = () => { for (const [k, , kind] of FIELDS.concat([['anim']])) { const el = $('#ch_' + k); opts[k] = kind === 'check' ? el.checked : (k === 'heads' || k === 'size') ? +el.value : el.value; } };
  const animList = () => opts.anim === 'all' ? ['idle', 'walk', 'run', 'jump', 'attack', 'kick'].concat(opts.wings !== 'none' ? ['hover'] : []) : [opts.anim];
  function rebuild() {
    read(); store.set('pxs.char', opts);
    cache = animList().flatMap(a => Array.from({ length: ANIMS[a].n }, (_, i) => drawCharacter(opts, a, i)));
    prev.width = cache[0].W; prev.height = cache[0].H; pf = 0;
    const fps = opts.anim === 'all' ? 10 : ANIMS[opts.anim].fps;
    $('#chInfo').textContent = `${cache[0].W}×${cache[0].H} · ${cache.length} frames · ${fps} fps`;
    clearInterval(timer); timer = setInterval(tick, 1000 / fps); tick();
  }
  function tick() {
    if (!dlg.open) return clearInterval(timer);
    const f = cache[pf++ % cache.length];
    pctx.clearRect(0, 0, f.W, f.H);
    pctx.putImageData(new ImageData(f.shadow.map((v, q) => q % 4 === 3 ? v * .3 : 0), f.W, f.H), 0, 0);
    tmpCanvasDraw(f);
  }
  const [tc, tcx] = (() => { const c = document.createElement('canvas'); return [c, c.getContext('2d')]; })();
  function tmpCanvasDraw(f) { tc.width = f.W; tc.height = f.H; tcx.putImageData(new ImageData(f.ch, f.W, f.H), 0, 0); pctx.drawImage(tc, 0, 0); }
  optsBox.addEventListener('change', rebuild);
  $('#ch_anim').addEventListener('change', rebuild);
  const pbox = $('#chPresets');
  for (const name of Object.keys(PRESETS)) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = name;
    b.onclick = () => { Object.assign(opts, PRESETS[name], { size: opts.size, anim: opts.anim }); fill(); rebuild(); };
    pbox.appendChild(b);
  }
  $('#chRandom').onclick = () => {
    const pick = a => a[Math.random() * a.length | 0], rc = () => '#' + (Math.random() * 0xffffff | 0).toString(16).padStart(6, '0');
    for (const [k, , kind] of FIELDS) {
      if (k === 'size') continue;
      if (kind === 'color') opts[k] = k === 'skin' ? pick(PALETTES['Anime Skin']) : k === 'hair' ? pick(PALETTES['Anime Hair']) : k === 'eyes' ? pick(PALETTES['Anime Eyes']) : k === 'outline' ? '#1e1624' : rc();
      else if (kind === 'check') opts[k] = Math.random() < .3;
      else { const v = pick(kind); opts[k] = Array.isArray(v) ? v[0] : v; }
    }
    fill(); rebuild();
  };
  act.character = () => { fill(); dlg.showModal(); rebuild(); };

  dlg.addEventListener('close', () => {
    clearInterval(timer);
    if (dlg.returnValue !== 'ok') return;
    read();
    const frames = cache, { W, H } = frames[0], n = frames.length, fps = opts.anim === 'all' ? 10 : ANIMS[opts.anim].fps;
    const palette = [...new Set(frames.flatMap(f => f.palette))];
    if ($('#chAppend').checked && doc.w === W && doc.h === H) {
      structural(() => {
        const start = doc.frames;
        const chL = doc.layers.find(L => L.name === 'Character') || layer(), shL = doc.layers.find(L => L.name === 'Shadow');
        for (const L of doc.layers) for (let i = 0; i < n; i++) L.cels.push(L === chL ? frames[i].ch : L === shL ? frames[i].shadow : blank());
        doc.frames += n; cur.frame = start;
        for (const c of palette) if (!doc.palette.includes(c)) doc.palette.push(c);
      });
      return toast(`Added ${n} frames`);
    }
    pushUndo('full');
    const keep = undoStack.slice();
    newDoc(W, H, { layers: 'simple', bg: 'none' });
    doc.frames = n; doc.fps = fps;
    doc.layers = [makeLayer('Background'), makeLayer('Shadow', { opacity: .3 }), makeLayer('Character')];
    doc.layers[1].cels = frames.map(f => f.shadow); doc.layers[2].cels = frames.map(f => f.ch);
    doc.palette = palette; cur.layer = 2; cur.frame = 0;
    undoStack.push(...keep);
    refreshAll(); fit();
    toast(`Character created: ${n} frames. Press Enter to play`);
  });

  window.CharacterBuilder = { drawCharacter, PRESETS, ANIMS };
})();
