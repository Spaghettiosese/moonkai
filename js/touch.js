// ============================================================
//  MOONKAI — touch controls + tap navigation (phones / tablets)
// ============================================================
(function () {
  const press = code => { Sfx.init(); if (!Input.down.has(code)) Input.pressed.add(code); Input.down.add(code); };
  const release = code => Input.down.delete(code);
  const tap = code => { press(code); setTimeout(() => release(code), 60); };

  const pad = document.getElementById('touch');
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (pad && isTouch) pad.hidden = false;
  if (pad) pad.querySelectorAll('[data-key]').forEach(btn => {
    const code = btn.dataset.key;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); btn.setPointerCapture(e.pointerId); press(code); btn.classList.add('on'); });
    const up = e => { e.preventDefault(); release(code); btn.classList.remove('on'); };
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  });

  // Tapping the screen: focus for keyboard, start / pick fighter / skip cutscene / rematch
  canvas.tabIndex = 0;
  canvas.addEventListener('pointerdown', e => {
    canvas.focus(); Sfx.init();
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    if (Game.cutscene) { tap('Space'); return; }
    if (Game.state === 'title' || Game.state === 'end') { tap('Enter'); return; }
    if (Game.state === 'select') {
      const cw = 250, gap = 30, x0 = W / 2 - (cw * 3 + gap * 2) / 2;
      const i = Math.floor((x - x0) / (cw + gap));
      if (y > 90 && y < 450 && i >= 0 && i < 3 && (x - x0) % (cw + gap) < cw) {
        if (Game.sel === i) tap('Enter'); else Game.sel = i;
      }
    }
  });
  focus();
})();
