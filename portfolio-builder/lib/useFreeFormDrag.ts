'use client';

import React from 'react';
import { ElementPosition } from './types';

interface FreeFormDragConfig {
  snapEnabled: boolean;
  getAllPositions: () => Record<string, ElementPosition>;
  getVisibleKeys: () => string[];
  onPositionChange: (element: string, position: ElementPosition) => void;
}

const SNAP_THRESHOLD = 5; // percentage points within which snapping occurs

/**
 * Reusable hook for free-form drag with snap guides.
 * Encapsulates the drag + snap logic used by the hero section,
 * making it available to all section types.
 */
export function useFreeFormDrag(config: FreeFormDragConfig) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [dragging, setDragging] = React.useState<string | null>(null);
  const [snapLines, setSnapLines] = React.useState<{ vertical?: number; horizontal?: number }>({});
  const configRef = React.useRef(config);
  configRef.current = config;

  const computeSnap = React.useCallback((element: string, rawX: number, rawY: number): { x: number; y: number; snapV?: number; snapH?: number } => {
    const cfg = configRef.current;
    if (!cfg.snapEnabled) return { x: rawX, y: rawY };

    let snappedX = rawX;
    let snappedY = rawY;
    let snapV: number | undefined;
    let snapH: number | undefined;

    // Build list of target X/Y values: center line (50) + other elements' positions
    const targetXs: number[] = [50];
    const targetYs: number[] = [50];

    const allPositions = cfg.getAllPositions();
    const visibleKeys = cfg.getVisibleKeys();

    for (const [key, pos] of Object.entries(allPositions)) {
      if (key === element) continue;
      if (!visibleKeys.includes(key)) continue;
      targetXs.push(pos.x);
      targetYs.push(pos.y);
    }

    // Check X snap
    for (const tx of targetXs) {
      if (Math.abs(rawX - tx) < SNAP_THRESHOLD) {
        snappedX = tx;
        snapV = tx;
        break;
      }
    }

    // Check Y snap
    for (const ty of targetYs) {
      if (Math.abs(rawY - ty) < SNAP_THRESHOLD) {
        snappedY = ty;
        snapH = ty;
        break;
      }
    }

    return { x: snappedX, y: snappedY, snapV, snapH };
  }, []);

  const handleMouseDown = (e: React.MouseEvent, element: string) => {
    e.preventDefault();
    setDragging(element);
  };

  const handleTouchStart = (e: React.TouchEvent, element: string) => {
    setDragging(element);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!dragging || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    const { x: snappedX, y: snappedY, snapV, snapH } = computeSnap(dragging, clampedX, clampedY);
    setSnapLines({ vertical: snapV, horizontal: snapH });
    configRef.current.onPositionChange(dragging, { x: snappedX, y: snappedY });
  }, [dragging, computeSnap]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!dragging || !sectionRef.current) return;
    const touch = e.touches[0];
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    const { x: snappedX, y: snappedY, snapV, snapH } = computeSnap(dragging, clampedX, clampedY);
    setSnapLines({ vertical: snapV, horizontal: snapH });
    configRef.current.onPositionChange(dragging, { x: snappedX, y: snappedY });
  }, [dragging, computeSnap]);

  const handleMouseUp = React.useCallback(() => {
    setDragging(null);
    setSnapLines({});
  }, []);

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return {
    sectionRef,
    dragging,
    snapLines,
    handleMouseDown,
    handleTouchStart,
  };
}
