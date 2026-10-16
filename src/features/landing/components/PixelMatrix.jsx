import React, { useEffect, useRef } from 'react';

/** Purple / magenta LED palette */
const PALETTE = [
  [109, 94, 252],
  [167, 139, 250],
  [124, 58, 237],
  [192, 38, 211],
  [236, 72, 153],
  [244, 114, 182],
  [139, 92, 246],
  [91, 33, 182],
  [219, 39, 119],
  [67, 56, 202],
];

/**
 * On mount: particles scatter from the corner and fill the whole card,
 * then keep a soft ambient flicker.
 */
const PixelMatrix = ({ variant = 'light', className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let disposed = false;
    let raf = 0;
    let cells = null;
    let meta = { cols: 0, rows: 0, cell: 2, gap: 1, w: 0, h: 0 };
    let start = performance.now();
    let fillDone = false;

    const rebuild = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w < 2 || h < 2) return;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cell = 2;
      const gap = 1;
      const step = cell + gap;
      const cols = Math.ceil(w / step);
      const rows = Math.ceil(h / step);
      meta = { cols, rows, cell, gap, w, h };
      start = performance.now();
      fillDone = false;

      const maxDist = Math.hypot(cols, rows) || 1;

      cells = new Array(cols * rows);
      for (let i = 0; i < cells.length; i++) {
        const col = i % cols;
        const row = (i / cols) | 0;
        // Corner → scatter: distance from top-left + random jitter
        const dist = Math.hypot(col, row) / maxDist;
        const delay = dist * 520 + Math.random() * 380;
        const willLit = Math.random() > 0.42;

        cells[i] = {
          color: PALETTE[(Math.random() * PALETTE.length) | 0],
          bright: 0,
          target: 0,
          finalTarget: willLit ? 0.22 + Math.random() * 0.48 : 0,
          delay,
          speed: 0.06 + Math.random() * 0.1,
          spawned: false,
        };
      }
    };

    rebuild();
    const ro = new ResizeObserver(rebuild);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const tick = (now) => {
      if (disposed) return;
      const { cols, cell, gap, w, h } = meta;
      if (!cells || !w) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - start;
      // Solid dark base — no translucent veil (avoids cream/white bleed)
      ctx.fillStyle = variant === 'dark' ? '#080612' : '#0e0c1c';
      ctx.fillRect(0, 0, w, h);

      const step = cell + gap;
      let pending = 0;

      // Scatter-fill: spawn cells after their delay across the full card
      if (!fillDone) {
        for (let i = 0; i < cells.length; i++) {
          const c = cells[i];
          if (!c.spawned && elapsed >= c.delay) {
            c.spawned = true;
            c.target = c.finalTarget;
          }
          if (!c.spawned) pending += 1;
        }
        if (pending === 0) fillDone = true;
      } else {
        // Ambient flicker once the card is filled
        const flickerCount = Math.max(16, (cells.length * 0.018) | 0);
        for (let n = 0; n < flickerCount; n++) {
          const i = (Math.random() * cells.length) | 0;
          const c = cells[i];
          if (Math.random() > 0.55) {
            c.color = PALETTE[(Math.random() * PALETTE.length) | 0];
            c.target = Math.random() > 0.48 ? 0.18 + Math.random() * 0.45 : 0;
          } else {
            c.target = Math.max(0, Math.min(0.7, c.target + (Math.random() - 0.5) * 0.3));
          }
        }
      }

      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        c.bright += (c.target - c.bright) * c.speed;
        if (c.bright < 0.03) continue;
        const col = i % cols;
        const row = (i / cols) | 0;
        const [r, g, b] = c.color;
        ctx.globalAlpha = c.bright;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(col * step, row * step, cell, cell);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [variant]);

  return (
    <canvas ref={canvasRef} aria-hidden className={`shine-card__pixels ${className}`} />
  );
};

export default PixelMatrix;
