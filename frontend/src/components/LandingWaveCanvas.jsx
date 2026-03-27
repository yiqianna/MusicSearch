import React, { useEffect, useRef } from 'react';

/**
 * Full-viewport animated gradient + soft orbs. Phase advances slowly; dark drifts a bit slower than light.
 */
export default function LandingWaveCanvas({ theme }) {
  const canvasRef = useRef(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let W = 0;
    let H = 0;
    let t = 0;
    let raf = 0;

    /* Deeper, more saturated hues so orbs read clearly on light gradient */
    const orbsLight = [
      { x: 0.15, y: 0.05, r: 0.52, color: [92, 108, 188], speed: 0.00018, ox: 0.06, oy: 0.05 },
      { x: 0.85, y: 0.25, r: 0.42, color: [132, 96, 178], speed: 0.00014, ox: 0.05, oy: 0.07 },
      { x: 0.5, y: 0.9, r: 0.38, color: [72, 128, 168], speed: 0.00022, ox: 0.08, oy: 0.04 },
      { x: 0.7, y: 0.6, r: 0.28, color: [118, 88, 168], speed: 0.00016, ox: 0.04, oy: 0.06 },
    ];

    const orbsDark = [
      { x: 0.15, y: 0.05, r: 0.52, color: [26, 90, 118], speed: 0.00018, ox: 0.06, oy: 0.05 },
      { x: 0.85, y: 0.22, r: 0.44, color: [72, 58, 140], speed: 0.00014, ox: 0.05, oy: 0.07 },
      { x: 0.48, y: 0.88, r: 0.4, color: [18, 95, 108], speed: 0.00022, ox: 0.08, oy: 0.04 },
      { x: 0.68, y: 0.55, r: 0.3, color: [45, 75, 130], speed: 0.00016, ox: 0.04, oy: 0.06 },
    ];

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      /* Match layout viewport so CSS `fixed; inset:0` and bitmap stay aligned (avoid vv-only sizing blur). */
      W = canvas.width = Math.max(1, Math.round(window.innerWidth));
      H = canvas.height = Math.max(1, Math.round(window.innerHeight));
    }

    function drawFrame(isDark, timeValue) {
      ctx.clearRect(0, 0, W, H);

      if (isDark) {
        const base = ctx.createLinearGradient(0, 0, W * 0.55, H);
        base.addColorStop(0, '#060d16');
        base.addColorStop(0.45, '#0a1c2c');
        base.addColorStop(1, '#071018');
        ctx.fillStyle = base;
      } else {
        const base = ctx.createLinearGradient(0, 0, W * 0.6, H);
        base.addColorStop(0, '#c8d2eb');
        base.addColorStop(0.42, '#d4cae8');
        base.addColorStop(1, '#c9dce8');
        ctx.fillStyle = base;
      }
      ctx.fillRect(0, 0, W, H);

      const orbs = isDark ? orbsDark : orbsLight;

      orbs.forEach((o) => {
        const cx = (o.x + Math.sin(timeValue * o.speed * 1000 + 1) * o.ox) * W;
        const cy = (o.y + Math.cos(timeValue * o.speed * 1000 + 2) * o.oy) * H;
        const r = o.r * Math.min(W, H);
        const [rr, gg, bb] = o.color;
        const alpha0 = isDark ? 0.42 : 0.72;
        const alpha1 = isDark ? 0.16 : 0.38;

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(${rr},${gg},${bb},${alpha0})`);
        g.addColorStop(0.5, `rgba(${rr},${gg},${bb},${alpha1})`);
        g.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
    }

    function tick() {
      const isDark = themeRef.current === 'dark';
      if (!reduceMotion) {
        /* Light mode: calmer drift; dark unchanged */
        t += isDark ? 0.22 : 0.2;
      }
      drawFrame(isDark, t);
      if (!reduceMotion) {
        raf = requestAnimationFrame(tick);
      }
    }

    resize();
    tick();
    const onResize = () => {
      resize();
      drawFrame(themeRef.current === 'dark', t);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      vv?.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="landing-wave-canvas" aria-hidden />;
}
