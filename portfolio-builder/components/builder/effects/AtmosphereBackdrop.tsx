'use client';

import { useEffect, useRef } from 'react';

// Decorative, full-bleed backdrop for the welcome screen. Blobs drift on
// transform-only loops; the grain and top vignette keep banding down and
// headline text legible.
const CSS = `
.atm-root { position: absolute; inset: 0; overflow: hidden; isolation: isolate; pointer-events: none; background: #0a0a0b; z-index: 0; }
.atm-blob { position: absolute; border-radius: 50%; filter: blur(100px); mix-blend-mode: screen; will-change: transform; transform: translateZ(0); animation: atm-drift 24s cubic-bezier(0.65, 0.05, 0.36, 1) infinite alternate; }
.atm-warm { width: 65vmax; height: 65vmax; top: -30%; left: -25%; background: radial-gradient(circle, #ff6a1a 0%, rgba(216, 38, 15, 0.6) 35%, transparent 70%); opacity: 0.5; animation-duration: 24s; animation-delay: 0s; }
.atm-core { width: 50vmax; height: 50vmax; top: 20%; right: -20%; background: radial-gradient(circle, #d8260f 0%, transparent 65%); opacity: 0.35; animation-duration: 20s; animation-delay: -4s; }
.atm-indigo { width: 60vmax; height: 60vmax; bottom: -35%; right: -25%; background: radial-gradient(circle, #3b2a8f 0%, transparent 70%); opacity: 0.6; animation-duration: 28s; animation-delay: -9s; }
.atm-ink { width: 55vmax; height: 55vmax; bottom: -15%; left: -15%; background: radial-gradient(circle, #14123a 0%, transparent 70%); opacity: 0.8; animation-duration: 22s; animation-delay: -13s; }
.atm-vignette { position: absolute; top: 0; left: 0; right: 0; height: 45%; background: linear-gradient(to bottom, #0a0a0b 0%, transparent 100%); }
.atm-grain { position: absolute; inset: 0; opacity: 0.05; mix-blend-mode: overlay; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
.atm-paused .atm-blob { animation-play-state: paused; }
@keyframes atm-drift { 0% { transform: translate3d(-8%, -6%, 0) scale(1); } 100% { transform: translate3d(8%, 6%, 0) scale(1.15); } }
@media (prefers-reduced-motion: reduce) { .atm-blob { animation: none; } }
`;

export function AtmosphereBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Pause the drift loops while the backdrop is off-screen.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      node.classList.toggle('atm-paused', !entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="atm-root" aria-hidden="true">
      <style>{CSS}</style>
      <div className="atm-blob atm-warm" />
      <div className="atm-blob atm-core" />
      <div className="atm-blob atm-indigo" />
      <div className="atm-blob atm-ink" />
      <div className="atm-vignette" />
      <div className="atm-grain" />
    </div>
  );
}
