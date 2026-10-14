'use client';

import React from 'react';
import { ElementPosition } from './types';

/** Smart Guide types mimicking Photoshop's Smart Guides */
interface SmartGuide {
  type: 'alignment' | 'spacing' | 'size';
  orientation: 'horizontal' | 'vertical';
  position: number; // percentage position on canvas
  value?: number; // pixel distance for spacing guides
  label?: string; // e.g., "50px", "W", "H", "Center"
  elements?: string[]; // which elements this guide relates to
  isEdge?: boolean; // true for edge alignment, false for center
  isEqualSpacing?: boolean; // true if spacing is equal on both sides
}

interface FreeFormDragConfig {
  snapEnabled: boolean;
  getAllPositions: () => Record<string, ElementPosition>;
  getVisibleKeys: () => string[];
  onPositionChange: (element: string, position: ElementPosition) => void;
  /** Returns element heights as percentage of section height (key -> height%). Enables push behavior. */
  getElementHeights?: () => Record<string, number>;
  /** Returns element sizes in pixels (key -> {width, height}). Used for size matching detection. */
  getElementSizes?: () => Record<string, { width: number; height: number }>;
  /** Batch position update for multiple elements at once (used by push/collision resolution). */
  onBatchPositionChange?: (updates: Record<string, ElementPosition>) => void;
  /** Called when user clicks on an element (for selection). */
  onElementClick?: (key: string) => void;
  /** Canvas dimensions in pixels for pixel-based measurements */
  getCanvasDimensions?: () => { width: number; height: number };
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
const PIXEL_SNAP_THRESHOLD = 8; // pixels — Photoshop uses ~8px snap threshold
const SIZE_MATCH_THRESHOLD = 3; // pixels — tolerance for "same size" detection
const SPACING_EQUAL_THRESHOLD = 4; // pixels — tolerance for "equal spacing" detection

/**
 * Compute all Photoshop-style Smart Guides for a dragged element.
 * Detects: edge/center alignment, canvas edges/center, equal spacing, size matches.
 */
function computeSmartGuides(
  element: string,
  rawX: number,
  rawY: number,
  cfg: FreeFormDragConfig,
  draggedSize?: { width: number; height: number },
  canvasDims?: { width: number; height: number },
): { x: number; y: number; guides: SmartGuide[] } {
  const guides: SmartGuide[] = [];
  if (!cfg.snapEnabled) return { x: rawX, y: rawY, guides };

  const allPositions = cfg.getAllPositions();
  const visibleKeys = cfg.getVisibleKeys();
  const sizes = cfg.getElementSizes?.() ?? {};
  const canvas = canvasDims ?? { width: 1000, height: 800 };

  // Convert percentage positions to pixel rects for precise measurement
  const rects: Record<string, { left: number; top: number; right: number; bottom: number; cx: number; cy: number; w: number; h: number }> = {};
  for (const key of visibleKeys) {
    if (key === element) continue;
    const pos = allPositions[key];
    if (!pos) continue;
    const size = sizes[key] ?? { width: 100, height: 40 };
    const cx = (pos.x / 100) * canvas.width;
    const cy = (pos.y / 100) * canvas.height;
    rects[key] = {
      left: cx - size.width / 2,
      top: cy - size.height / 2,
      right: cx + size.width / 2,
      bottom: cy + size.height / 2,
      cx, cy, w: size.width, h: size.height,
    };
  }

  // Dragged element's pixel rect (center-based)
  const dragSize = draggedSize ?? { width: 100, height: 40 };
  const dragCx = (rawX / 100) * canvas.width;
  const dragCy = (rawY / 100) * canvas.height;
  const dragRect = {
    left: dragCx - dragSize.width / 2,
    top: dragCy - dragSize.height / 2,
    right: dragCx + dragSize.width / 2,
    bottom: dragCy + dragSize.height / 2,
    cx: dragCx, cy: dragCy, w: dragSize.width, h: dragSize.height,
  };

  let snappedX = rawX;
  let snappedY = rawY;
  let bestXDx = PIXEL_SNAP_THRESHOLD + 1;
  let bestYDy = PIXEL_SNAP_THRESHOLD + 1;

  // Canvas edges & center as snap targets
  const canvasX = [
    { px: 0, label: 'Left Edge', isEdge: true },
    { px: canvas.width / 2, label: 'Center', isEdge: false },
    { px: canvas.width, label: 'Right Edge', isEdge: true },
  ];
  const canvasY = [
    { px: 0, label: 'Top Edge', isEdge: true },
    { px: canvas.height / 2, label: 'Center', isEdge: false },
    { px: canvas.height, label: 'Bottom Edge', isEdge: true },
  ];

  const dragXPoints = [
    { px: dragRect.left, ref: 'left' },
    { px: dragRect.cx, ref: 'center' },
    { px: dragRect.right, ref: 'right' },
  ];
  const dragYPoints = [
    { px: dragRect.top, ref: 'top' },
    { px: dragRect.cy, ref: 'center' },
    { px: dragRect.bottom, ref: 'bottom' },
  ];

  // ===== 1. ALIGNMENT DETECTION (edges, centers, canvas) =====
  for (const dp of dragXPoints) {
    for (const ct of canvasX) {
      const dx = Math.abs(dp.px - ct.px);
      if (dx < bestXDx) {
        bestXDx = dx;
        snappedX = ((ct.px + (dragRect.cx - dp.px)) / canvas.width) * 100;
        guides.splice(0, guides.length, ...guides.filter((g) => !(g.orientation === 'vertical' && g.type === 'alignment')));
        guides.push({ type: 'alignment', orientation: 'vertical', position: (ct.px / canvas.width) * 100, label: ct.label, isEdge: ct.isEdge, elements: [element] });
      }
    }
    for (const [key, rect] of Object.entries(rects)) {
      const otherX = [{ px: rect.left, ref: 'left' }, { px: rect.cx, ref: 'center' }, { px: rect.right, ref: 'right' }];
      for (const op of otherX) {
        const dx = Math.abs(dp.px - op.px);
        if (dx < bestXDx) {
          bestXDx = dx;
          snappedX = ((op.px + (dragRect.cx - dp.px)) / canvas.width) * 100;
          guides.splice(0, guides.length, ...guides.filter((g) => !(g.orientation === 'vertical' && g.type === 'alignment')));
          guides.push({ type: 'alignment', orientation: 'vertical', position: (op.px / canvas.width) * 100, label: dp.ref === op.ref ? dp.ref : undefined, isEdge: dp.ref !== 'center' && op.ref !== 'center', elements: [element, key] });
        }
      }
    }
  }

  for (const dp of dragYPoints) {
    for (const ct of canvasY) {
      const dy = Math.abs(dp.px - ct.px);
      if (dy < bestYDy) {
        bestYDy = dy;
        snappedY = ((ct.px + (dragRect.cy - dp.px)) / canvas.height) * 100;
        guides.splice(0, guides.length, ...guides.filter((g) => !(g.orientation === 'horizontal' && g.type === 'alignment')));
        guides.push({ type: 'alignment', orientation: 'horizontal', position: (ct.px / canvas.height) * 100, label: ct.label, isEdge: ct.isEdge, elements: [element] });
      }
    }
    for (const [key, rect] of Object.entries(rects)) {
      const otherY = [{ px: rect.top, ref: 'top' }, { px: rect.cy, ref: 'center' }, { px: rect.bottom, ref: 'bottom' }];
      for (const op of otherY) {
        const dy = Math.abs(dp.px - op.px);
        if (dy < bestYDy) {
          bestYDy = dy;
          snappedY = ((op.px + (dragRect.cy - dp.px)) / canvas.height) * 100;
          guides.splice(0, guides.length, ...guides.filter((g) => !(g.orientation === 'horizontal' && g.type === 'alignment')));
          guides.push({ type: 'alignment', orientation: 'horizontal', position: (op.px / canvas.height) * 100, label: dp.ref === op.ref ? dp.ref : undefined, isEdge: dp.ref !== 'center' && op.ref !== 'center', elements: [element, key] });
        }
      }
    }
  }

  // ===== 2. SPACING DETECTION (equal gaps) =====
  const sortedByX = Object.entries(rects).sort((a, b) => a[1].cx - b[1].cx);
  for (let i = 0; i < sortedByX.length - 1; i++) {
    const [, left] = sortedByX[i];
    const [, right] = sortedByX[i + 1];
    const gap = right.left - left.right;
    if (gap <= 0) continue;
    const midX = left.right + gap / 2;
    if (Math.abs(dragRect.cx - midX) < SPACING_EQUAL_THRESHOLD) {
      guides.push({ type: 'spacing', orientation: 'vertical', position: (midX / canvas.width) * 100, value: gap, label: `${Math.round(gap)}px`, isEqualSpacing: true, elements: [element, sortedByX[i][0], sortedByX[i + 1][0]] });
    }
  }

  const sortedByY = Object.entries(rects).sort((a, b) => a[1].cy - b[1].cy);
  for (let i = 0; i < sortedByY.length - 1; i++) {
    const [, t] = sortedByY[i];
    const [, b] = sortedByY[i + 1];
    const gap = b.top - t.bottom;
    if (gap <= 0) continue;
    const midY = t.bottom + gap / 2;
    if (Math.abs(dragRect.cy - midY) < SPACING_EQUAL_THRESHOLD) {
      guides.push({ type: 'spacing', orientation: 'horizontal', position: (midY / canvas.height) * 100, value: gap, label: `${Math.round(gap)}px`, isEqualSpacing: true, elements: [element, sortedByY[i][0], sortedByY[i + 1][0]] });
    }
  }

  // ===== 3. SIZE MATCH DETECTION =====
  for (const [key, rect] of Object.entries(rects)) {
    if (Math.abs(dragRect.w - rect.w) < SIZE_MATCH_THRESHOLD) {
      guides.push({ type: 'size', orientation: 'vertical', position: (dragRect.cx / canvas.width) * 100, label: 'W', elements: [element, key] });
    }
    if (Math.abs(dragRect.h - rect.h) < SIZE_MATCH_THRESHOLD) {
      guides.push({ type: 'size', orientation: 'horizontal', position: (dragRect.cy / canvas.height) * 100, label: 'H', elements: [element, key] });
    }
  }

  snappedX = Math.max(0, Math.min(100, snappedX));
  snappedY = Math.max(0, Math.min(100, snappedY));
  return { x: snappedX, y: snappedY, guides };
}

/**
 * Reusable hook for free-form drag with Photoshop-style Smart Guides.
 */
export function useFreeFormDrag(config: FreeFormDragConfig) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [dragging, setDragging] = React.useState<string | null>(null);
  const [snapLines, setSnapLines] = React.useState<{ vertical?: number; horizontal?: number }>({});
  const [smartGuides, setSmartGuides] = React.useState<SmartGuide[]>([]);
  const configRef = React.useRef(config);
  configRef.current = config;

  const computeSnap = React.useCallback((element: string, rawX: number, rawY: number): { x: number; y: number; snapV?: number; snapH?: number; guides: SmartGuide[] } => {
    const cfg = configRef.current;
    if (!cfg.snapEnabled) return { x: rawX, y: rawY, guides: [] };
    const sizes = cfg.getElementSizes?.();
    const draggedSize = sizes?.[element];
    const canvasDims = cfg.getCanvasDimensions?.();
    const result = computeSmartGuides(element, rawX, rawY, cfg, draggedSize, canvasDims);
    const alignV = result.guides.find((g) => g.type === 'alignment' && g.orientation === 'vertical');
    const alignH = result.guides.find((g) => g.type === 'alignment' && g.orientation === 'horizontal');
    return { x: result.x, y: result.y, snapV: alignV?.position, snapH: alignH?.position, guides: result.guides };
  }, []);
  const dragStartPos = React.useRef<{ x: number; y: number } | null>(null);
  const draggedElement = React.useRef<string | null>(null);

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
    dragStartPos.current = { x: mouseX, y: mouseY };
    draggedElement.current = element;
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
    const useSnap = configRef.current.snapEnabled && !e.altKey;
    const { x: snappedX, y: snappedY, snapV, snapH, guides } = useSnap
      ? computeSnap(dragging, clampedX, clampedY)
      : { x: clampedX, y: clampedY, snapV: undefined, snapH: undefined, guides: [] as SmartGuide[] };
    setSnapLines({ vertical: snapV, horizontal: snapH });
    setSmartGuides(guides);
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
    const { x: snappedX, y: snappedY, snapV, snapH, guides } = computeSnap(dragging, clampedX, clampedY);
    setSnapLines({ vertical: snapV, horizontal: snapH });
    setSmartGuides(guides);
    applyPosition(dragging, snappedX, snappedY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, computeSnap]);

  const handleMouseUp = React.useCallback(() => {
    // Detect click vs drag: if movement was minimal, it's a click
    const start = dragStartPos.current;
    const element = draggedElement.current;
    if (start && element && configRef.current.onElementClick) {
      const endPos = configRef.current.getAllPositions()[element];
      // Calculate distance moved (in percentage points)
      const dx = Math.abs((start.x / 100 * window.innerWidth) - (endPos?.x || 0));
      const dy = Math.abs((start.y / 100 * window.innerHeight) - (endPos?.y || 0));
      // If moved less than 5px, treat as click
      if (dx < 5 && dy < 5) {
        configRef.current.onElementClick(element);
      }
    }
    setDragging(null);
    setSnapLines({});
    setSmartGuides([]);
    dragStartPos.current = null;
    draggedElement.current = null;
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
    smartGuides,
    handleMouseDown,
    handleTouchStart,
  };
}
