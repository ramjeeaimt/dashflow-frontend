import { useEffect } from 'react';

/**
 * Soft momentum scrolling for the landing page via Lenis (loaded on demand
 * so other routes are not blocked by Vite dep pre-bundling).
 */
export function useSoftScroll() {
  useEffect(() => {
    let cancelled = false;
    let lenis;
    let frame;

    (async () => {
      const [{ default: Lenis }] = await Promise.all([
        import('lenis'),
        import('lenis/dist/lenis.css'),
      ]);
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.4,
      });

      window.__dashflowLenis = lenis;

      const raf = (time) => {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    })().catch((err) => {
      console.warn('[soft-scroll] Lenis failed to load, using native scroll', err);
    });

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      if (lenis) {
        lenis.destroy();
        if (window.__dashflowLenis === lenis) delete window.__dashflowLenis;
      }
    };
  }, []);
}

export function softScrollTo(href) {
  if (!href?.startsWith('#')) return;
  const el = document.querySelector(href);
  if (!el) return;

  const lenis = window.__dashflowLenis;
  if (lenis) {
    lenis.scrollTo(el, { offset: -72, duration: 1.2 });
    return;
  }
  el.scrollIntoView({ behavior: 'smooth' });
}
