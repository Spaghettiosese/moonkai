// ============================================================
//  MOONKAI — SFX 2: layered sound design for the remade fighters.
//
//  The original Sfx has plain one-oscillator blips. This adds the pieces real sound design
//  is made from, all synthesized (no asset files):
//    • a procedural reverb + feedback echo bus, so big sounds have a room around them
//    • FM voices (bells, metal, vocal formants), detuned stacks (choirs, drones)
//    • filtered noise sweeps (wind, whooshes, risers), sub drops, crackle
//  and a family of named effects per fighter (aur*, ora*, shi*, goj*, mor*) built from them.
//  Everything is wrapped so a missing AudioContext never throws.
// ============================================================
(() => {
  const S = Sfx, safe = fn => function (...a) { try { if (!this.ac) return; return fn.apply(this, a); } catch (e) { } };

  // ---- reverb + echo bus (built lazily the first time a wet sound plays) ----
  S._bus = function () {
    if (this._wet) return this._wet;
    const ac = this.ac, len = Math.floor(ac.sampleRate * 2.4), ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const conv = ac.createConvolver(); conv.buffer = ir;
    const send = ac.createGain(), ret = ac.createGain(); ret.gain.value = 0.55;
    const dl = ac.createDelay(1); dl.delayTime.value = 0.23; const fb = ac.createGain(); fb.gain.value = 0.32; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    send.connect(conv); send.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(ret); conv.connect(ret); ret.connect(this.out);
    return this._wet = send;
  };
  // a gain node that feeds the dry bus and (optionally) the reverb send
  S._dest = function (vol, t0, dur, wet) {
    const g = this.ac.createGain(); g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + Math.min(0.012, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0002, t0 + dur);
    g.connect(this.out);
    if (wet) { const w = this.ac.createGain(); w.gain.value = wet; g.connect(w); w.connect(this._bus()); }
    return g;
  };
  // swelling envelope (risers): quiet to loud, then a short release
  S._swell = function (vol, t0, dur, wet) {
    const g = this.ac.createGain(); g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + dur * 0.85); g.gain.exponentialRampToValueAtTime(0.0002, t0 + dur);
    g.connect(this.out); if (wet) { const w = this.ac.createGain(); w.gain.value = wet; g.connect(w); w.connect(this._bus()); }
    return g;
  };

  Object.assign(S, {
    // oscillator with optional slide, filter, detune stack and reverb send
    voice: safe(function (o) {
      const { f = 440, to = null, dur = 0.5, vol = 0.2, type = 'sine', delay = 0, wet = 0, det = 0, n = 1, lp = 0, swell = false } = o, t0 = this.ac.currentTime + delay;
      const g = swell ? this._swell(vol, t0, dur, wet) : this._dest(vol / Math.sqrt(n), t0, dur, wet);
      let tail = g; if (lp) { const fl = this.ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(lp, t0); if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, t0 + dur); fl.connect(g); tail = fl; }
      for (let i = 0; i < n; i++) {
        const os = this.ac.createOscillator(); os.type = type; const d = n > 1 ? (i / (n - 1) - 0.5) * 2 * det : 0;
        os.frequency.setValueAtTime(f, t0); if (to) os.frequency.exponentialRampToValueAtTime(to, t0 + dur); os.detune.value = d;
        os.connect(tail); os.start(t0); os.stop(t0 + dur + 0.05);
      }
    }),
    // two-operator FM: bells, metal, glass, vocal-ish formants
    fm: safe(function (o) {
      const { f = 440, ratio = 2, index = 200, dur = 0.6, vol = 0.18, delay = 0, wet = 0.4, to = null, decayIndex = true } = o, t0 = this.ac.currentTime + delay;
      const g = this._dest(vol, t0, dur, wet), car = this.ac.createOscillator(), mod = this.ac.createOscillator(), mg = this.ac.createGain();
      car.frequency.setValueAtTime(f, t0); if (to) car.frequency.exponentialRampToValueAtTime(to, t0 + dur);
      mod.frequency.value = f * ratio; mg.gain.setValueAtTime(index, t0); if (decayIndex) mg.gain.exponentialRampToValueAtTime(1, t0 + dur);
      mod.connect(mg); mg.connect(car.frequency); car.connect(g); car.start(t0); mod.start(t0); car.stop(t0 + dur + 0.05); mod.stop(t0 + dur + 0.05);
    }),
    // band/low/high-passed noise whose cutoff glides (wind, whoosh, riser, impact air)
    nsweep: safe(function (o) {
      const { f0 = 400, f1 = 4000, dur = 0.5, vol = 0.2, type = 'bandpass', q = 1.2, delay = 0, wet = 0.2, swell = false } = o, t0 = this.ac.currentTime + delay;
      const s = this.ac.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
      const fl = this.ac.createBiquadFilter(); fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      const g = swell ? this._swell(vol, t0, dur, wet) : this._dest(vol, t0, dur, wet);
      s.connect(fl); fl.connect(g); s.start(t0, Math.random()); s.stop(t0 + dur + 0.05);
    }),
    // low-end thump: pitch-dropping sine plus a click
    sub: safe(function (o = {}) {
      const { f = 90, to = 30, dur = 0.6, vol = 0.5, delay = 0, wet = 0.15 } = o;
      this.voice({ f, to, dur, vol, delay, wet, type: 'sine' }); this.voice({ f: f * 2.2, to: f * 0.8, dur: dur * 0.3, vol: vol * 0.4, delay, type: 'triangle' });
    }),
    // random electrical / flame / shard crackle
    crackle: safe(function (o = {}) {
      const { dur = 0.6, vol = 0.18, delay = 0, density = 22, lo = 1500, hi = 7000, wet = 0.1 } = o;
      for (let i = 0; i < Math.round(dur * density); i++) this.tone(lo + Math.random() * (hi - lo), 0.02 + Math.random() * 0.03, Math.random() < 0.5 ? 'square' : 'sawtooth', vol * (0.4 + Math.random() * 0.6), lo * 0.5, delay + Math.random() * dur);
    }),
    // stacked chord with a slow attack (choirs, drones, auras)
    chord: safe(function (o) {
      const { notes = [220, 277, 330], dur = 1.5, vol = 0.18, type = 'triangle', delay = 0, wet = 0.6, swell = true, det = 8, lp = 2200 } = o;
      notes.forEach(n => this.voice({ f: n, dur, vol: vol / notes.length * 1.6, type, delay, wet, det, n: 3, swell, lp }));
    }),
    // arpeggio / ladder of tones: ascending shimmer, bell run, coin-like chime
    run: safe(function (o) {
      const { notes = [523, 659, 784, 1047], step = 0.07, dur = 0.5, vol = 0.12, type = 'sine', delay = 0, wet = 0.5, bell = false } = o;
      notes.forEach((n, i) => bell ? this.fm({ f: n, ratio: 3.5, index: 120, dur, vol, delay: delay + i * step, wet }) : this.voice({ f: n, dur, vol, type, delay: delay + i * step, wet }));
    }),
    // fat impact: sub + noise burst + midrange crack, scaled by weight 0..1
    impact: safe(function (w = 0.6, delay = 0) {
      this.sub({ f: 70 + 60 * (1 - w), to: 24, dur: 0.35 + w * 0.8, vol: 0.35 + w * 0.4, delay, wet: 0.2 + w * 0.3 });
      this.nsweep({ f0: 5000, f1: 220, dur: 0.18 + w * 0.5, vol: 0.3 + w * 0.3, type: 'lowpass', q: 0.7, delay, wet: 0.3 });
      this.voice({ f: 520, to: 90, dur: 0.12, vol: 0.14, type: 'square', delay });
    }),
    // low rumble bed that lasts `dur`
    rumble: safe(function (dur = 2, vol = 0.3, delay = 0) {
      this.voice({ f: 38, to: 30, dur, vol, type: 'sawtooth', delay, lp: 160, n: 3, det: 14, swell: true, wet: 0.3 });
      this.nsweep({ f0: 120, f1: 300, dur, vol: vol * 0.7, type: 'lowpass', q: 0.5, delay, swell: true });
    }),
    // rising tension: noise + tone ramps up over dur
    riser: safe(function (dur = 2, vol = 0.22, delay = 0, f0 = 200, f1 = 2400) {
      this.voice({ f: f0, to: f1, dur, vol, type: 'sawtooth', delay, lp: 1800, lpTo: 6000, swell: true, wet: 0.4, n: 2, det: 12 });
      this.nsweep({ f0: f0 * 2, f1: f1 * 2.5, dur, vol: vol * 0.8, type: 'bandpass', q: 2, delay, swell: true, wet: 0.3 });
    }),
    // reversed-feel suck-in: sweeps down then thuds
    suck: safe(function (dur = 0.8, delay = 0) {
      this.nsweep({ f0: 6000, f1: 200, dur, vol: 0.25, type: 'bandpass', q: 3, delay, wet: 0.3 });
      this.voice({ f: 1200, to: 60, dur, vol: 0.12, type: 'sine', delay });
    }),
  });

  // ============================================================
  //  AURELION — gold, bells, choirs, divine hammering
  // ============================================================
  Object.assign(S, {
    aurBlessing(d = 0) { this.chord({ notes: [392, 494, 587, 784], dur: 1.6, vol: 0.2, delay: d, wet: 0.7 }); this.run({ notes: [1568, 1976, 2349], step: 0.09, delay: d + 0.15, bell: true, wet: 0.7, dur: 0.9 }); },
    aurSmite(d = 0) { this.fm({ f: 1320, ratio: 1.5, index: 380, dur: 0.9, vol: 0.2, delay: d, wet: 0.7 }); this.impact(0.8, d + 0.02); this.nsweep({ f0: 9000, f1: 800, dur: 0.5, vol: 0.2, type: 'highpass', delay: d }); },
    aurEdict(d = 0) { this.nsweep({ f0: 800, f1: 7000, dur: 0.22, vol: 0.2, delay: d }); this.voice({ f: 1040, to: 2400, dur: 0.18, vol: 0.12, type: 'triangle', delay: d, wet: 0.4 }); this.fm({ f: 2090, ratio: 2.01, index: 90, dur: 0.5, vol: 0.1, delay: d + 0.08, wet: 0.6 }); },
    aurBrand(d = 0) { this.fm({ f: 880, ratio: 3, index: 260, dur: 0.35, vol: 0.2, delay: d, wet: 0.5 }); this.voice({ f: 220, to: 110, dur: 0.3, vol: 0.2, type: 'sawtooth', lp: 900, delay: d }); },
    aurChoir(d = 0, dur = 2.2) { this.chord({ notes: [261, 329, 392, 523, 659], dur, vol: 0.26, type: 'sawtooth', delay: d, wet: 0.9, lp: 1400, det: 14 }); },
    aurBellToll(d = 0) { this.fm({ f: 196, ratio: 2.76, index: 500, dur: 3, vol: 0.34, delay: d, wet: 0.8 }); this.fm({ f: 392, ratio: 1.41, index: 200, dur: 2, vol: 0.14, delay: d, wet: 0.8 }); this.sub({ f: 98, to: 70, dur: 1.2, vol: 0.2, delay: d }); },
    aurFall(d = 0) { this.nsweep({ f0: 3000, f1: 90, dur: 1.4, vol: 0.3, type: 'lowpass', delay: d, wet: 0.5 }); this.voice({ f: 880, to: 55, dur: 1.4, vol: 0.18, type: 'sawtooth', delay: d, lp: 3000, wet: 0.5 }); this.crackle({ dur: 1.2, vol: 0.1, delay: d, lo: 300, hi: 2400 }); },
    aurShatter(d = 0) { this.nsweep({ f0: 9000, f1: 1800, dur: 0.6, vol: 0.28, type: 'highpass', delay: d, wet: 0.6 }); for (let i = 0; i < 9; i++) this.fm({ f: 1800 + Math.random() * 2400, ratio: 2.3, index: 150, dur: 0.4, vol: 0.07, delay: d + Math.random() * 0.3, wet: 0.5 }); },
    aurHeart(d = 0) { this.sub({ f: 62, to: 36, dur: 0.3, vol: 0.55, delay: d }); this.sub({ f: 56, to: 32, dur: 0.3, vol: 0.45, delay: d + 0.22 }); },
  });

  // ============================================================
  //  ORACLE — glass, whispers, ticking time, eye-opening
  // ============================================================
  Object.assign(S, {
    oraVision(d = 0) { this.run({ notes: [1319, 1568, 1976, 2637], step: 0.05, dur: 0.45, vol: 0.09, delay: d, bell: true, wet: 0.8 }); this.nsweep({ f0: 2000, f1: 9000, dur: 0.35, vol: 0.08, type: 'bandpass', q: 6, delay: d, wet: 0.6 }); },
    oraRewind(d = 0, dur = 0.8) { this.nsweep({ f0: 5200, f1: 300, dur, vol: 0.14, q: 5, delay: d, wet: 0.5 }); for (let i = 0; i < 10; i++) this.tick(d + i * dur / 10); this.voice({ f: 900, to: 140, dur, vol: 0.1, type: 'triangle', delay: d, wet: 0.5 }); },
    oraFlash(d = 0) { this.fm({ f: 2093, ratio: 1.5, index: 300, dur: 0.5, vol: 0.14, delay: d, wet: 0.7 }); this.nsweep({ f0: 10000, f1: 2000, dur: 0.25, vol: 0.12, type: 'highpass', delay: d }); },
    oraDodge(d = 0) { this.nsweep({ f0: 900, f1: 5200, dur: 0.14, vol: 0.14, q: 3, delay: d }); this.fm({ f: 1760, ratio: 3, index: 100, dur: 0.3, vol: 0.09, delay: d + 0.05, wet: 0.7 }); },
    oraStrike(d = 0) { this.riser(0.35, 0.16, d, 600, 3000); this.fm({ f: 1397, ratio: 2, index: 420, dur: 0.8, vol: 0.2, delay: d + 0.32, wet: 0.8 }); this.impact(0.7, d + 0.34); },
    oraWhisper(d = 0) { for (let i = 0; i < 5; i++) this.nsweep({ f0: 2500 + Math.random() * 1500, f1: 3500 + Math.random() * 3000, dur: 0.16, vol: 0.07, type: 'bandpass', q: 7, delay: d + i * 0.11, wet: 0.7 }); },
    oraEyeOpen(d = 0) { this.sub({ f: 80, to: 40, dur: 1.4, vol: 0.4, delay: d }); this.chord({ notes: [220, 330, 440, 660], dur: 2.2, vol: 0.24, delay: d + 0.2, wet: 0.9 }); this.fm({ f: 1760, ratio: 1.01, index: 60, dur: 2.4, vol: 0.12, delay: d + 0.5, wet: 0.9 }); },
    oraStar(d = 0) { this.voice({ f: 2637, to: 1319, dur: 0.3, vol: 0.1, type: 'sine', delay: d, wet: 0.6 }); this.voice({ f: 3136, to: 1568, dur: 0.25, vol: 0.06, type: 'triangle', delay: d + 0.04, wet: 0.6 }); },
    oraTick(d = 0) { this.fm({ f: 1600, ratio: 4.2, index: 150, dur: 0.07, vol: 0.12, delay: d, wet: 0.2 }); },
    oraShatter(d = 0) { this.aurShatter(d); this.sub({ f: 110, to: 40, dur: 0.8, vol: 0.3, delay: d }); },
  });

  // ============================================================
  //  SHINJI — mechanical alarm, synchro, berserk beast
  // ============================================================
  Object.assign(S, {
    shiAlarm(d = 0, n = 3) { for (let i = 0; i < n; i++) { this.voice({ f: 880, dur: 0.18, vol: 0.14, type: 'square', delay: d + i * 0.34, lp: 3000 }); this.voice({ f: 660, dur: 0.18, vol: 0.14, type: 'square', delay: d + i * 0.34 + 0.18, lp: 3000 }); } },
    shiSync(d = 0) { this.run({ notes: [330, 392, 494, 659, 784], step: 0.06, dur: 0.5, type: 'triangle', vol: 0.12, delay: d, wet: 0.5 }); this.nsweep({ f0: 300, f1: 3000, dur: 0.4, vol: 0.1, delay: d }); },
    shiSlash(d = 0) { this.nsweep({ f0: 1800, f1: 9000, dur: 0.12, vol: 0.28, type: 'bandpass', q: 1.5, delay: d }); this.fm({ f: 1400, ratio: 5.1, index: 300, dur: 0.22, vol: 0.14, delay: d, wet: 0.3, to: 700 }); },
    shiClang(d = 0) { this.fm({ f: 740, ratio: 2.76, index: 420, dur: 0.6, vol: 0.2, delay: d, wet: 0.4 }); this.impact(0.4, d); },
    shiHowl(d = 0, dur = 1.6) { this.voice({ f: 190, to: 520, dur: dur * 0.5, vol: 0.28, type: 'sawtooth', lp: 1500, n: 3, det: 20, delay: d, wet: 0.5 }); this.voice({ f: 520, to: 140, dur: dur * 0.6, vol: 0.28, type: 'sawtooth', lp: 1100, n: 3, det: 20, delay: d + dur * 0.4, wet: 0.5 }); this.nsweep({ f0: 400, f1: 2400, dur, vol: 0.12, q: 2, delay: d }); },
    shiBerserk(d = 0) { this.sub({ f: 100, to: 28, dur: 1.2, vol: 0.5, delay: d }); this.crackle({ dur: 1.4, vol: 0.2, delay: d, lo: 200, hi: 3000 }); this.shiHowl(d + 0.1, 1.4); },
    shiPierce(d = 0) { this.nsweep({ f0: 8000, f1: 600, dur: 0.12, vol: 0.3, type: 'highpass', delay: d }); this.impact(0.9, d + 0.04); this.voice({ f: 140, to: 50, dur: 0.5, vol: 0.2, type: 'square', lp: 700, delay: d }); },
    shiRoar(d = 0) { this.voice({ f: 95, to: 60, dur: 1.8, vol: 0.34, type: 'sawtooth', lp: 900, n: 4, det: 30, delay: d, wet: 0.5 }); this.shiHowl(d, 1.8); this.impact(0.9, d + 0.05); },
    shiBlood(d = 0) { this.nsweep({ f0: 900, f1: 200, dur: 0.3, vol: 0.2, type: 'lowpass', delay: d }); this.voice({ f: 180, to: 60, dur: 0.25, vol: 0.2, type: 'sine', delay: d }); },
  });

  // ============================================================
  //  GOJO — hollow hum, gravity, void static
  // ============================================================
  Object.assign(S, {
    gojBlue(d = 0) { this.voice({ f: 140, to: 560, dur: 0.5, vol: 0.2, type: 'sine', n: 3, det: 18, delay: d, wet: 0.5 }); this.suck(0.5, d); },
    gojBlueLoop(d = 0) { this.voice({ f: 280, to: 240, dur: 0.4, vol: 0.1, type: 'sine', n: 3, det: 25, delay: d, wet: 0.3 }); },
    gojRed(d = 0) { this.riser(0.28, 0.2, d, 150, 1400); this.sub({ f: 130, to: 36, dur: 0.9, vol: 0.45, delay: d + 0.28 }); this.nsweep({ f0: 3000, f1: 200, dur: 0.6, vol: 0.3, type: 'lowpass', delay: d + 0.28, wet: 0.4 }); },
    gojPurple(d = 0) { this.chord({ notes: [98, 147, 196, 294], dur: 2, vol: 0.34, type: 'sawtooth', delay: d, lp: 900, wet: 0.7, det: 22 }); this.voice({ f: 60, to: 30, dur: 2, vol: 0.5, type: 'sine', delay: d }); this.crackle({ dur: 1.6, vol: 0.14, delay: d }); },
    gojStep(d = 0) { this.nsweep({ f0: 8000, f1: 400, dur: 0.12, vol: 0.2, type: 'highpass', delay: d }); this.voice({ f: 1800, to: 300, dur: 0.1, vol: 0.12, type: 'sine', delay: d }); },
    gojBlackFlash(d = 0) { this.impact(1, d); this.crackle({ dur: 0.7, vol: 0.28, delay: d, lo: 400, hi: 5000 }); this.fm({ f: 90, ratio: 1.5, index: 600, dur: 0.6, vol: 0.3, delay: d, wet: 0.4 }); },
    gojDomain(d = 0) { this.voice({ f: 55, to: 49, dur: 3.2, vol: 0.5, type: 'sine', delay: d, wet: 0.4 }); this.chord({ notes: [110, 165, 220, 330, 440], dur: 3, vol: 0.28, delay: d, wet: 0.9, det: 30 }); this.nsweep({ f0: 200, f1: 5000, dur: 2.5, vol: 0.14, q: 3, delay: d, swell: true, wet: 0.7 }); },
    gojClap(d = 0) { this.nsweep({ f0: 6000, f1: 800, dur: 0.12, vol: 0.4, type: 'bandpass', q: 0.9, delay: d, wet: 0.6 }); this.impact(0.6, d); this.fm({ f: 1200, ratio: 1.5, index: 200, dur: 1, vol: 0.12, delay: d + 0.02, wet: 0.9 }); },
    gojEyes(d = 0) { this.sub({ f: 70, to: 35, dur: 1.2, vol: 0.4, delay: d }); this.run({ notes: [880, 1175, 1568, 2093], step: 0.1, dur: 0.9, vol: 0.14, delay: d + 0.1, bell: true, wet: 0.9 }); this.nsweep({ f0: 400, f1: 7000, dur: 1, vol: 0.12, delay: d, wet: 0.7, swell: true }); },
    gojInfinity(d = 0) { this.voice({ f: 1400, to: 90, dur: 0.35, vol: 0.12, type: 'sine', delay: d, wet: 0.6 }); this.nsweep({ f0: 5000, f1: 200, dur: 0.3, vol: 0.1, delay: d }); },
  });

  // ============================================================
  //  MORDEKAISER — iron, chains, tolling, death-choir
  // ============================================================
  Object.assign(S, {
    morClang(d = 0) { this.fm({ f: 164, ratio: 3.14, index: 700, dur: 1.1, vol: 0.3, delay: d, wet: 0.5 }); this.impact(0.8, d); this.nsweep({ f0: 7000, f1: 900, dur: 0.3, vol: 0.2, type: 'highpass', delay: d }); },
    morSwing(d = 0) { this.nsweep({ f0: 200, f1: 1800, dur: 0.28, vol: 0.28, type: 'bandpass', q: 0.8, delay: d }); this.voice({ f: 100, to: 60, dur: 0.3, vol: 0.14, type: 'sawtooth', lp: 500, delay: d }); },
    morChain(d = 0) { for (let i = 0; i < 6; i++) this.fm({ f: 900 + Math.random() * 700, ratio: 4.1, index: 400, dur: 0.12, vol: 0.12, delay: d + i * 0.045, wet: 0.2 }); this.nsweep({ f0: 1200, f1: 6000, dur: 0.3, vol: 0.1, delay: d }); },
    morSoul(d = 0) { this.voice({ f: 400, to: 130, dur: 1.1, vol: 0.2, type: 'sawtooth', lp: 1200, n: 3, det: 40, delay: d, wet: 0.9 }); this.nsweep({ f0: 3000, f1: 500, dur: 1.1, vol: 0.12, q: 5, delay: d, wet: 0.9 }); },
    morToll(d = 0) { this.fm({ f: 82, ratio: 2.4, index: 900, dur: 3.6, vol: 0.42, delay: d, wet: 0.9 }); this.fm({ f: 164, ratio: 1.5, index: 300, dur: 2.4, vol: 0.18, delay: d, wet: 0.9 }); this.sub({ f: 55, to: 40, dur: 1.8, vol: 0.4, delay: d }); },
    morGrave(d = 0) { this.sub({ f: 80, to: 26, dur: 1.1, vol: 0.55, delay: d }); this.rumble(1.2, 0.3, d); this.nsweep({ f0: 1500, f1: 100, dur: 0.8, vol: 0.3, type: 'lowpass', delay: d, wet: 0.4 }); },
    morDeathChoir(d = 0, dur = 3) { this.chord({ notes: [73, 110, 130, 196, 233], dur, vol: 0.34, type: 'sawtooth', delay: d, wet: 0.95, lp: 700, det: 35 }); },
    morRealm(d = 0) { this.morToll(d); this.morDeathChoir(d + 0.3, 3.2); this.rumble(3, 0.3, d); this.crackle({ dur: 2, vol: 0.1, delay: d + 0.5, lo: 200, hi: 1800 }); },
    morAscend(d = 0) { this.riser(1.6, 0.26, d, 70, 900); this.morToll(d + 1.6); this.impact(1, d + 1.62); },
    morSlam(d = 0) { this.morSwing(d); this.morClang(d + 0.28); this.sub({ f: 70, to: 22, dur: 0.9, vol: 0.5, delay: d + 0.28 }); },
    morHeal(d = 0) { this.voice({ f: 180, to: 360, dur: 0.6, vol: 0.18, type: 'triangle', n: 3, det: 20, delay: d, wet: 0.7 }); this.nsweep({ f0: 400, f1: 2400, dur: 0.6, vol: 0.08, q: 4, delay: d, wet: 0.7 }); },
  });
})();
