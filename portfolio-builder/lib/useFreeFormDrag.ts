'use client';

import React from 'react';
import { ElementPosition } from './types';

interface FreeFormDragConfig {
  snapEnabled: boolean;
  getAllPositions: () => Record<string, ElementPosition>;
  getVisibleKeys: () => string[];
  onPositionChange: (element: string, position: ElementPosition) => void;
  /** Returns element heights as percentage of section height (key -> height%). Enables push behavior. */
  getElementHeights?: () => Record<string, number>;
  /** Batch position update for multiple elements at once (used by push/collision resolution). */
  onBatchPositionChange?: (updates: Record<string, ElementPosition>) => void;
}

/** Minimum vertical gap between elements after push resolution (in % of section height). */
const PUSH_GAP = 2;

/**
 * Resolve vertical overlaps: when the dragged element moves to a new Y, push
 * overlapping siblings away so nothing masks anything else.
 *
 * - Elements below the dragged element are pushed DOWN.
 * - Elements above the dragged element are pushed UP.
 * - Pushes cascade to prevent chain-overlaps.
 *
 * Returns a map of key -> new Y for every element that needs to move
 * (excluding the dragged element itself).
 */
export function resolveOverlaps(
  draggedKey: string,
  draggedNewY: number,
  elements: { key: string; y: number; height: number }[],
  gap: number = PUSH_GAP,
): Record<string, number> {
  const updates: Record<string, number> = {};

  // Working copy with dragged element at its new Y
  const working = elements.map((e) => ({
    ...e,
    y: e.key === draggedKey ? draggedNewY : e.y,
  }));

  const dragged = working.find((e) => e.key === draggedKey);
  if (!dragged) return updates;

  const draggedBottom = dragged.y + dragged.height;

  // --- Elements below: push DOWN if overlapping ---
  const below = working
    .filter((e) => e.key !== draggedKey && e.y >= dragged.y)
    .sort((a, b) => a.y - b.y);

  let prevBottom = draggedBottom;
  for (const el of below) {
    if (el.y < prevBottom + gap) {
      const newY = prevBottom + gap;
      updates[el.key] = newY;
      el.y = newY;
    }
    prevBottom = el.y + el.height;
  }

  // --- Elements above: push UP if overlapping ---
  const above = working
    .filter((e) => e.key !== draggedKey && e.y < dragged.y)
    .sort((a, b) => b.y - a.y); // descending Y (closest to dragged first)

  let prevTop = dragged.y;
  for (const el of above) {
    const elBottom = el.y + el.height;
    if (elBottom > prevTop - gap) {
      const newY = Math.max(0, prevTop - gap - el.height);
      updates[el.key] = newY;
      el.y = newY;
    }
    prevTop = el.y;
  }

  return updates;
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

  /**
   * Apply the dragged element's new position, optionally resolving vertical
   * overlaps so other elements are pushed out of the way (no masking).
   */
  const applyPosition = (element: string, snappedX: number, snappedY: number) => {
    const cfg = configRef.current;
    if (cfg.getElementHeights && cfg.onBatchPositionChange) {
      const heights = cfg.getElementHeights();
      const allPositions = cfg.getAllPositions();
      const visibleKeys = cfg.getVisibleKeys();

      const elementInfos = visibleKeys.map((key) => ({
        key,
        y: allPositions[key]?.y ?? 0,
        height: heights[key] ?? 0,
      }));

      const overlapUpdates = resolveOverlaps(element, snappedY, elementInfos);

      // Build batch: dragged element + all pushed elements
      const batch: Record<string, ElementPosition> = {};
      batch[element] = { x: snappedX, y: snappedY };
      for (const [key, newY] of Object.entries(overlapUpdates)) {
        const oldPos = allPositions[key];
        batch[key] = { x: oldPos?.x ?? 50, y: newY };
      }

      cfg.onBatchPositionChange(batch);
    } else {
      cfg.onPositionChange(element, { x: snappedX, y: snappedY });
    }
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
    applyPosition(dragging, snappedX, snappedY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    applyPosition(dragging, snappedX, snappedY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
