'use client';

import React, { useEffect, useRef } from 'react';

interface ColorRibbonProps {
  color: string;
  intensity: number; // 0-100
}

/**
 * A full-page-height vertical ribbon whose width tracks the mouse X position.
 * The ribbon spans from the left edge of the screen to the cursor, expanding
 * and shrinking as the user moves left/right.
 */
export function ColorRibbon({ color, intensity }: ColorRibbonProps) {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const targetXRef = useRef(50); // target percentage (0-100)
  const currentXRef = useRef(50); // smoothed percentage

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetXRef.current = (e.clientX / window.innerWidth) * 100;
    };

    let rafId: number;
    const animate = () => {
      // Smooth interpolation toward target
      currentXRef.current += (targetXRef.current - currentXRef.current) * 0.12;
      if (ribbonRef.current) {
        ribbonRef.current.style.width = `${currentXRef.current}%`;
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const opacity = Math.max(0, Math.min(100, intensity)) / 100;

  return (
    <div
      ref={ribbonRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '50%',
        backgroundColor: color,
        opacity,
        pointerEvents: 'none',
        zIndex: 4,
        transition: 'none',
      }}
    />
  );
}
