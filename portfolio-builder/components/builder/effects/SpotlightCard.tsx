'use client';

import type { CSSProperties, PointerEvent, ReactNode } from 'react';

// Hand-written hover, press and sheen effects for a card. No third-party code.
// Every card gets a fixed diagonal corner accent. On hover, a sheen sweeps across inside the card's rounded edges.
const CSS = `
.spot-card { position: relative; isolation: isolate; overflow: hidden; transition: transform 300ms cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 300ms ease; }
.spot-card::before { content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none; border-radius: inherit; opacity: 0; transition: opacity 300ms ease;
  background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.18), transparent 60%); }
.spot-card::after { content: ''; position: absolute; top: -30%; bottom: -30%; left: 0; width: 45%; z-index: 0; pointer-events: none; opacity: 0;
  background: linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0.26) 50%, transparent 100%); transform: translateX(-120%) skewX(-18deg); }
.spot-card .spot-corner { position: absolute; top: 0; left: 0; width: 55%; height: 100%; z-index: 0; pointer-events: none;
  background: linear-gradient(118deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 38%, transparent 39%); }
.spot-card:hover { transform: translateY(-4px); box-shadow: 0 24px 48px -16px var(--spot-glow, rgba(139, 92, 246, 0.45)); }
.spot-card:hover::before { opacity: 1; }
.spot-card:hover::after { opacity: 1; animation: spot-sheen 1100ms cubic-bezier(0.4, 0, 0.2, 1) forwards; }
.spot-card:active { transform: translateY(0) scale(0.97); transition-duration: 90ms; }
.spot-card .spot-icon { transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.spot-card:hover .spot-icon { transform: rotate(-8deg) scale(1.08); }
.spot-card > .relative { position: relative; z-index: 10; }
@keyframes spot-sheen { from { transform: translateX(-120%) skewX(-18deg); } to { transform: translateX(340%) skewX(-18deg); } }
@media (prefers-reduced-motion: reduce) {
  .spot-card, .spot-card .spot-icon, .spot-card::after { transition: none !important; animation: none !important; }
  .spot-card:hover { transform: none; }
}
`;

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Colour of the hover glow, e.g. "rgba(139, 92, 246, 0.45)" */
  glow?: string;
}

export function SpotlightCard({ children, className, glow }: SpotlightCardProps) {
  // Track the pointer so the light follows it inside the card.
  const track = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };
  const style = glow ? ({ '--spot-glow': glow } as CSSProperties) : undefined;
  return (
    <div className={`spot-card ${className ?? ''}`} style={style} onPointerMove={track}>
      <style>{CSS}</style>
      <span className="spot-corner" aria-hidden="true" />
      {children}
    </div>
  );
}
