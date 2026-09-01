'use client';

import React from 'react';
import { ElementPosition } from './types';

interface FreeFormDragConfig {
  snapEnabled: boolean;
  getAllPositions: () => Record<string, ElementPosition>;
  getVisibleKeys: () => string[];
  onPositionChange: (element: string, position: ElementPosition) => void;
}

const SNAP_THRESHOLD = 1; // percentage points — only snaps when extremely close for fine control

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

  const dragOffset = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, element: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    const allPos = configRef.current.getAllPositions();
    const elemPos = allPos[element] || { x: 50, y: 50 };
    dragOffset.current = { x: mouseX - elemPos.x, y: mouseY - elemPos.y };
    setDragging(element);
  };

  const handleTouchStart = (e: React.TouchEvent, element: string) => {
    e.stopPropagation();
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = ((touch.clientX - rect.left) / rect.width) * 100;
    const touchY = ((touch.clientY - rect.top) / rect.height) * 100;
    const allPos = configRef.current.getAllPositions();
    const elemPos = allPos[element] || { x: 50, y: 50 };
    dragOffset.current = { x: touchX - elemPos.x, y: touchY - elemPos.y };
    setDragging(element);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!dragging || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x - dragOffset.current.x));
    const clampedY = Math.max(0, Math.min(500, y - dragOffset.current.y));
    // Hold Alt to temporarily disable snapping for fine-tuning position
    const useSnap = configRef.current.snapEnabled && !e.altKey;
    const { x: snappedX, y: snappedY, snapV, snapH } = useSnap
      ? computeSnap(dragging, clampedX, clampedY)
      : { x: clampedX, y: clampedY, snapV: undefined, snapH: undefined };
    setSnapLines({ vertical: snapV, horizontal: snapH });
    configRef.current.onPositionChange(dragging, { x: snappedX, y: snappedY });
  }, [dragging, computeSnap]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!dragging || !sectionRef.current) return;
    const touch = e.touches[0];
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x - dragOffset.current.x));
    const clampedY = Math.max(0, Math.min(500, y - dragOffset.current.y));
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
