// Minimal animated GIF89a encoder. frames: array of RGBA Uint8ClampedArray (w*h*4).
// Index 0 is reserved for transparency (alpha < 128).
window.encodeGIF = function (frames, w, h, delayCs) {
  // Build a shared palette, dropping colour precision until it fits in 255 entries.
  let shift = 0, keyOf, map;
  for (; shift <= 5; shift++) {
    map = new Map();
    const m = (0xff >> shift) << shift;
    keyOf = (r, g, b) => ((r & m) << 16) | ((g & m) << 8) | (b & m);
    let ok = true;
    for (const f of frames) {
      for (let i = 0; i < f.length; i += 4) {
        if (f[i + 3] < 128) continue;
        const k = keyOf(f[i], f[i + 1], f[i + 2]);
        if (!map.has(k)) { map.set(k, map.size + 1); if (map.size > 255) { ok = false; break; } }
      }
      if (!ok) break;
    }
    if (ok) break;
  }
  const half = shift ? 1 << (shift - 1) : 0;
  const pal = new Uint8Array(768);
  for (const [k, idx] of map) {
    pal[idx * 3] = Math.min(255, (k >> 16 & 255) + half);
    pal[idx * 3 + 1] = Math.min(255, (k >> 8 & 255) + half);
    pal[idx * 3 + 2] = Math.min(255, (k & 255) + half);
  }

  const out = [];
  const b = (...v) => { for (const x of v) out.push(x); };
  const w16 = v => b(v & 255, v >> 8 & 255);
  const str = s => { for (const c of s) out.push(c.charCodeAt(0)); };

  str('GIF89a'); w16(w); w16(h); b(0xf7, 0, 0);
  for (const v of pal) out.push(v);
  b(0x21, 0xff, 0x0b); str('NETSCAPE2.0'); b(3, 1, 0, 0, 0);

  const idx = new Uint8Array(w * h);
  for (const f of frames) {
    for (let p = 0, i = 0; p < idx.length; p++, i += 4)
      idx[p] = f[i + 3] < 128 ? 0 : map.get(keyOf(f[i], f[i + 1], f[i + 2]));
    b(0x21, 0xf9, 4, (2 << 2) | 1); w16(delayCs); b(0, 0);
    b(0x2c); w16(0); w16(0); w16(w); w16(h); b(0);
    b(8);
    const data = lzw(idx, 8);
    for (let i = 0; i < data.length; i += 255) {
      const n = Math.min(255, data.length - i);
      out.push(n);
      for (let j = 0; j < n; j++) out.push(data[i + j]);
    }
    b(0);
  }
  b(0x3b);
  return new Uint8Array(out);

  function lzw(px, minCode) {
    const clear = 1 << minCode, eoi = clear + 1;
    let size = minCode + 1, next = eoi + 1, cur = 0, bits = 0;
    const dict = new Map(), bytes = [];
    const emit = c => { cur |= c << bits; bits += size; while (bits >= 8) { bytes.push(cur & 255); cur >>>= 8; bits -= 8; } };
    emit(clear);
    let prefix = px[0];
    for (let i = 1; i < px.length; i++) {
      const k = px[i], key = (prefix << 8) | k, v = dict.get(key);
      if (v !== undefined) { prefix = v; continue; }
      emit(prefix);
      if (next < 4096) {
        if (next >= (1 << size)) size++;
        dict.set(key, next++);
      } else {
        emit(clear); dict.clear(); size = minCode + 1; next = eoi + 1;
      }
      prefix = k;
    }
    emit(prefix); emit(eoi);
    if (bits > 0) bytes.push(cur & 255);
    return bytes;
  }
};
