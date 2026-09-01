'use client';

import { useEffect, useRef } from 'react';

interface MouseColorShiftProps {
  startColor: string;
  endColor: string;
  intensity: number; // 0-100
}

// Helper: parse hex color "#rrggbb" → {r, g, b}
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return { r, g, b };
}

// Linear interpolation between two colors
function lerpColor(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }, t: number) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

/**
 * Renders a fixed full-screen overlay whose color smoothly interpolates
 * between startColor (left) and endColor (right) as the user moves the mouse.
 * Uses requestAnimationFrame + lerp for smooth performance.
 */
export function MouseColorShift({ startColor, endColor, intensity }: MouseColorShiftProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c1 = hexToRgb(startColor);
    const c2 = hexToRgb(endColor);
    const opacity = Math.max(0, Math.min(100, intensity)) / 100;

    let mouseX = 0.5; // normalized 0-1
    let currentT = 0.5;
    let raf = 0;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth;
    };

    const animate = () => {
      // Smooth follow with lerp
      currentT += (mouseX - currentT) * 0.08;
      const color = lerpColor(c1, c2, currentT);

      if (overlayRef.current) {
        overlayRef.current.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      }

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMove);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(raf);
    };
  }, [startColor, endColor, intensity]);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed left-0 right-0 bottom-0 z-[5]"
      style={{
        top: '64px', /* Start below the navbar (h-16 = 64px) so it only affects the main body */
        backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
        willChange: 'background-color',
        transition: 'background-color 0.1s linear',
      }}
    />
  );
}
