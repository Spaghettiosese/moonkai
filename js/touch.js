// ============================================================
//  MOONKAI — touch controls + tap navigation (phones / tablets)
// ============================================================
(function () {
  const press = code => { Sfx.init(); if (!Input.down.has(code)) Input.pressed.add(code); Input.down.add(code); };
  const release = code => Input.down.delete(code);
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
  canvas.tabIndex = 0;
  canvas.addEventListener('pointerdown', e => {
    canvas.focus(); Sfx.init();
    const r = canvas.getBoundingClientRect();
    UI.tap((e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height, e.pointerType === 'mouse');
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect();
    UI.hover((e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height);
  });
  focus();
})();
