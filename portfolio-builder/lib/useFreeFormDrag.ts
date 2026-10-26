'use client';

import React from 'react';
import { ElementPosition } from './types';
import { usePortfolioStore } from './store';

interface FreeFormDragConfig {
  getAllPositions: () => Record<string, ElementPosition>;
  getVisibleKeys: () => string[];
  onPositionChange: (element: string, position: ElementPosition) => void;
  /** Returns element sizes as % of canvas (key -> {w, h}). Enables push + smart-guide snapping. */
  getElementSizes?: () => Record<string, { w: number; h: number }>;
  /** When true, dragging snaps to sibling elements' edges/centers (smart guides). */
  smartSnapEnabled?: boolean;
  /** When true, landing on a sibling makes it HUG the dragged element (snug
   *  placement, no teleport) plus a clearance push for anything still masked
   *  by the dragged element's height. Takes precedence over push/cascade mode. */
  swapOnOverlap?: boolean;
  /** Batch position update for multiple elements at once (used by push/collision resolution). */
  onBatchPositionChange?: (updates: Record<string, ElementPosition>) => void;
  /** Vertical gap kept between pushed elements, in % of canvas height. Defaults to
   *  PUSH_GAP (2). Pass a canvas-% equivalent of a small vh value when the canvas is
   *  much taller than the viewport, so pushed gaps match default stacking. */
  pushGapPct?: number;
  /** Called when user clicks on an element (for selection). */
  onElementClick?: (key: string) => void;
}

/** Minimum vertical gap between elements after push resolution (in % of section height). */
const PUSH_GAP = 2;

/** Active snap indicator drawn while dragging (canvas-% coordinates). */
export interface SnapLine {
  /** 'x' = vertical line at pct (start/end span y-%); 'y' = horizontal line (spans x-%). */
  axis: 'x' | 'y';
  pct: number;
  start: number;
  end: number;
  kind: 'element' | 'canvas' | 'guide';
}

/** Nearest scrollable ancestor (fallback: document scroller). */
export function getScrollParent(el: HTMLElement | null): HTMLElement {
  let node: HTMLElement | null = el?.parentElement ?? null;
  while (node) {
    const oy = getComputedStyle(node).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement) ?? document.documentElement;
}

/**
 * Resolve vertical overlaps: when the dragged element moves to a new Y, push
 * overlapping siblings away so nothing masks anything else.
 *
 * direction 'both' (push mode):
 * - Elements below the dragged element are pushed DOWN.
 * - Elements above the dragged element are pushed UP.
 * - Pushes cascade to prevent chain-overlaps.
 *
 * direction 'down' (swap-mode clearance):
 * - EVERYTHING colliding with the dragged element's full footprint cascades
 *   DOWN below its bottom. Nothing is ever pushed up: near the canvas top an
 *   up-push runs into the y>=0 clamp, and clamped elements collapse onto each
 *   other at the same Y (visible as elements piling behind the drag).
 *
 * Returns a map of key -> new Y for every element that needs to move
 * (excluding the dragged element itself).
 */
export function resolveOverlaps(
  draggedKey: string,
  draggedNewY: number,
  elements: { key: string; y: number; height: number }[],
  gap: number = PUSH_GAP,
  direction: 'both' | 'down' = 'both',
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

  if (direction === 'down') {
    // Scan every sibling that reaches down to the dragged element's top (from
    // inside or below its footprint) in top-to-bottom order and cascade them
    // below the dragged bottom. Elements merely touched by the cascade floor
    // move too; untouched ones never advance the floor (no phantom cascades).
    const candidates = working
      .filter((e) => e.key !== draggedKey && e.y + e.height > dragged.y)
      .sort((a, b) => a.y - b.y);
    let floor = draggedBottom;
    for (const el of candidates) {
      if (el.y < floor + gap) {
        const newY = floor + gap;
        updates[el.key] = newY;
        el.y = newY;
        floor = newY + el.height;
      }
    }
    return updates;
  }

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
      // The chain only propagates through elements that were MOVED: a pushed
      // element's new bottom becomes the floor for the next one.
      prevBottom = newY + el.height;
    }
    // When an element needs no push, the floor stays put. Advancing it to the
    // resting bottom of every passed-by sibling would make any two siblings
    // that happen to overlap at rest cascade whenever ANY element is dragged
    // above them — dragging an unrelated element would then push distant
    // elements down ("phantom" moves).
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
      // Only moved elements propagate the chain upward (mirror of below).
      prevTop = newY;
    }
    // Not pushed -> ceiling stays at the dragged element / last pushed top,
    // so resting siblings that merely overlap each other are never pulled
    // up by an unrelated drag below them.
  }

  return updates;
}


/**
 * Reusable hook for free-form drag.
 */
export function useFreeFormDrag(config: FreeFormDragConfig) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [dragging, setDragging] = React.useState<string | null>(null);
  const configRef = React.useRef(config);
  configRef.current = config;

  const dragOffset = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPos = React.useRef<{ x: number; y: number } | null>(null);
  const draggedElement = React.useRef<string | null>(null);
  // All element positions as of drag start — swap mode compares against this
  // snapshot so targets can be reverted when the drag moves away.
  const dragStartPositions = React.useRef<Record<string, ElementPosition> | null>(null);
  // Every element the swap/clearance logic moved during the current drag
  // (swap target + pushed siblings), mapped to its drag-start position so it
  // can be restored when the drag moves away or lands on open space.
  const movedRef = React.useRef<Record<string, ElementPosition>>({});
  // Active snap indicators (canvas-% coordinates) shown while dragging near snap targets.
  const [snapLines, setSnapLines] = React.useState<SnapLine[]>([]);
  const snapLinesRef = React.useRef(snapLines);

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
    dragStartPositions.current = allPos;
    movedRef.current = {};
    lastClientPos.current = { x: e.clientX, y: e.clientY };
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
    lastClientPos.current = { x: touch.clientX, y: touch.clientY };
    dragStartPositions.current = allPos;
    movedRef.current = {};
    setDragging(element);
  };

  /**
   * Compact-swap mode: landing on a sibling makes that sibling settle snugly
   * against the dragged element (directly below/above it, on the side it was
   * approached from) instead of teleporting to the dragged element's old slot —
   * so no gap opens where the dragged element used to sit. Because the dragged
   * element may be much taller than its target (e.g. the contact form), a
   * clearance pass then pushes any sibling it would still mask — cascading —
   * so its FULL height lands on open space. Only siblings that horizontally
   * overlap the drop column move; everything else stays exactly put. Overlap
   * is tested against the drag-start snapshot, so moving between targets
   * reverts the previous placement and open space reverts everything.
   */
  const applySwapPosition = (element: string, posX: number, posY: number) => {
    const cfg = configRef.current;
    const snapshot = dragStartPositions.current || cfg.getAllPositions();
    const sizes = cfg.getElementSizes!();
    // Fallback box when a slot measures as zero (hidden/transitioning nodes) —
    // without this, overlap math silently fails and elements just mask.
    const MIN_W = 10;
    const MIN_H = 6;
    const rawSelf = sizes[element];
    const self = { w: rawSelf?.w || MIN_W, h: rawSelf?.h || MIN_H };
    const gap = cfg.pushGapPct ?? PUSH_GAP;

    let best: { key: string; area: number } | null = null;
    for (const key of cfg.getVisibleKeys()) {
      if (key === element) continue;
      const sp = snapshot[key];
      if (!sp) continue;
      const size = sizes[key];
      const sw = size?.w || MIN_W;
      const sh = size?.h || MIN_H;
      const xOverlap = Math.min(posX + self.w / 2, sp.x + sw / 2) - Math.max(posX - self.w / 2, sp.x - sw / 2);
      const yOverlap = Math.min(posY + self.h, sp.y + sh) - Math.max(posY, sp.y);
      if (xOverlap > 0 && yOverlap > 0) {
        const area = xOverlap * yOverlap;
        if (!best || area > best.area) best = { key, area };
      }
    }

    const batch: Record<string, ElementPosition> = { [element]: { x: posX, y: posY } };
    // Combined positions (snapshot + target landing) fed to the clearance pass.
    const base: Record<string, ElementPosition> = { ...snapshot, [element]: { x: posX, y: posY } };
    if (best) {
      const bt = snapshot[best.key];
      const btH = sizes[best.key]?.h || MIN_H;
      // Hug landing: the landed-on element settles directly against the dragged
      // element on the side it sits on (below if its center is under the
      // dragged element's center, above otherwise) — minimal gap, no teleport.
      const landsBelow = bt.y + btH / 2 >= posY + self.h / 2;
      const land = landsBelow
        ? { x: bt.x, y: posY + self.h + gap }
        : { x: bt.x, y: Math.max(0, posY - gap - btH) };
      base[best.key] = land;
      batch[best.key] = land;
    }

    // Clearance pass: run the push resolver with the dragged element pinned at
    // posY, DOWN-only: everything the dragged element's full height would mask
    // (from inside or below its footprint) cascades below its bottom, so a tall
    // form never hides anything and nothing is shoved into the canvas-top
    // clamp where pushed elements would collapse onto each other.
    const infos: { key: string; y: number; height: number }[] = [
      { key: element, y: posY, height: self.h },
    ];
    for (const key of cfg.getVisibleKeys()) {
      if (key === element) continue;
      const bp = base[key];
      if (!bp) continue;
      const sw = sizes[key]?.w || MIN_W;
      const sh = sizes[key]?.h || MIN_H;
      const xOv = Math.min(posX + self.w / 2, bp.x + sw / 2) - Math.max(posX - self.w / 2, bp.x - sw / 2);
      if (xOv > 0) infos.push({ key, y: bp.y, height: sh });
    }
    const pushes = resolveOverlaps(element, posY, infos, cfg.pushGapPct, 'down');

    const movedNow: Record<string, ElementPosition> = {};
    if (best) movedNow[best.key] = snapshot[best.key];
    for (const [key, newY] of Object.entries(pushes)) {
      const cur = batch[key] || base[key];
      if (!cur) continue;
      batch[key] = { x: cur.x, y: newY };
      if (!movedNow[key]) movedNow[key] = snapshot[key];
    }
    // Restore elements moved by an earlier move step that are no longer affected.
    for (const key of Object.keys(movedRef.current)) {
      if (!(key in movedNow)) batch[key] = movedRef.current[key];
    }
    movedRef.current = movedNow;
    cfg.onBatchPositionChange!(batch);
  };

  /**
   * Apply the dragged element's new position, resolving overlaps per the
   * configured strategy: compact-swap (when swapOnOverlap) or push/cascade.
   */
  const applyPosition = (element: string, posX: number, posY: number) => {
    const cfg = configRef.current;
    if (cfg.swapOnOverlap && cfg.getElementSizes && cfg.onBatchPositionChange) {
      applySwapPosition(element, posX, posY);
      return;
    }
    if (cfg.getElementSizes && cfg.onBatchPositionChange) {
      const sizes = cfg.getElementSizes();
      const allPositions = cfg.getAllPositions();
      const visibleKeys = cfg.getVisibleKeys();

      const elementInfos = visibleKeys.map((key) => ({
        key,
        y: allPositions[key]?.y ?? 0,
        height: sizes[key]?.h ?? 0,
      }));

      const overlapUpdates = resolveOverlaps(element, posY, elementInfos, cfg.pushGapPct);

      // Build batch: dragged element + all pushed elements
      const batch: Record<string, ElementPosition> = {};
      batch[element] = { x: posX, y: posY };
      for (const [key, newY] of Object.entries(overlapUpdates)) {
        const oldPos = allPositions[key];
        batch[key] = { x: oldPos?.x ?? 50, y: newY };
      }

      cfg.onBatchPositionChange(batch);
    } else {
      cfg.onPositionChange(element, { x: posX, y: posY });
    }
  };

  /**
   * Convert client (viewport) coordinates into a clamped canvas position and
   * apply it. Shared by mouse/touch move handlers and the auto-scroll loop.
   */
  /** Snap tolerance in screen pixels. */
  const SNAP_TOLERANCE_PX = 7;

  /**
   * Unified drag snapping. Candidates come from three sources and the nearest
   * per axis wins:
   *  - Smart guides: element edges/centers vs. every sibling's edges/centers.
   *  - Canvas center: element center vs. the canvas vertical midline.
   *  - Ruler guides: store guides converted from scroll-document % into this
   *    canvas's % space.
   */
  const applySnap = (element: string, rawX: number, rawY: number, rect: DOMRect) => {
    const cfg = configRef.current;
    // The "Snap Guides" toggle disables ALL magnetic snapping (smart, canvas, ruler).
    const smartOn = cfg.smartSnapEnabled !== false;
    if (!smartOn) {
      return { x: rawX, y: rawY, lines: [] as SnapLine[] };
    }
    const sizes = cfg.getElementSizes?.() || {};
    const self = sizes[element] || { w: 0, h: 0 };
    const moving = { x: rawX - self.w / 2, y: rawY, w: self.w, h: self.h };

    type Cand = { d: number; pos: number; start: number; end: number; kind: SnapLine['kind'] };
    let bestX: Cand | null = null;
    let bestY: Cand | null = null;

    // --- Smart guides: sibling elements' edges and centers ---
    if (smartOn) {
      const positions = cfg.getAllPositions();
      for (const key of cfg.getVisibleKeys()) {
        if (key === element) continue;
        const size = sizes[key];
        const pos = positions[key];
        if (!size || !pos) continue;
        const sib = { x: pos.x - size.w / 2, y: pos.y, w: size.w, h: size.h };
        // X axis: align left / center / right features.
        const mX = [moving.x, moving.x + moving.w / 2, moving.x + moving.w];
        const tX = [sib.x, sib.x + sib.w / 2, sib.x + sib.w];
        for (const mv of mX) {
          for (const tv of tX) {
            const d = Math.abs(tv - mv) / 100 * rect.width;
            if (d <= SNAP_TOLERANCE_PX && (!bestX || d < bestX.d)) {
              bestX = { d, pos: rawX + (tv - mv), start: Math.min(moving.y, sib.y), end: Math.max(moving.y + moving.h, sib.y + sib.h), kind: 'element' };
            }
          }
        }
        // Y axis: align top / vertical-center / bottom features.
        const mY = [moving.y, moving.y + moving.h / 2, moving.y + moving.h];
        const tY = [sib.y, sib.y + sib.h / 2, sib.y + sib.h];
        for (const mv of mY) {
          for (const tv of tY) {
            const d = Math.abs(tv - mv) / 100 * rect.height;
            if (d <= SNAP_TOLERANCE_PX && (!bestY || d < bestY.d)) {
              bestY = { d, pos: rawY + (tv - mv), start: Math.min(moving.x, sib.x), end: Math.max(moving.x + moving.w, sib.x + sib.w), kind: 'element' };
            }
          }
        }
      }
      // Canvas horizontal center — snapping here makes centered layouts trivial.
      const centerDist = Math.abs(rawX - 50) / 100 * rect.width;
      if (centerDist <= SNAP_TOLERANCE_PX && (!bestX || centerDist < bestX.d)) {
        bestX = { d: centerDist, pos: 50, start: moving.y, end: moving.y + moving.h, kind: 'canvas' };
      }
    }

    // --- Ruler guides from the store ---
    const { showGuides, builderGuides } = usePortfolioStore.getState();
    if (showGuides && builderGuides.length > 0 && sectionRef.current) {
      const container = getScrollParent(sectionRef.current);
      const cRect = container.getBoundingClientRect();
      const docHeight = container.scrollHeight || 1;
      const docWidth = cRect.width || 1;
      const canvasTopInDoc = rect.top - cRect.top + container.scrollTop;
      const canvasLeftInDoc = rect.left - cRect.left + container.scrollLeft;
      for (const guide of builderGuides) {
        if (guide.type === 'vertical') {
          const gxPct = ((guide.position / 100) * docWidth - canvasLeftInDoc) / rect.width * 100;
          const d = Math.abs(rawX - gxPct) / 100 * rect.width;
          if (d <= SNAP_TOLERANCE_PX && (!bestX || d < bestX.d)) {
            bestX = { d, pos: gxPct, start: 0, end: 100, kind: 'guide' };
          }
        } else {
          const gyPct = ((guide.position / 100) * docHeight - canvasTopInDoc) / rect.height * 100;
          for (const offset of [0, self.h / 2, self.h]) {
            const d = Math.abs(rawY + offset - gyPct) / 100 * rect.height;
            if (d <= SNAP_TOLERANCE_PX && (!bestY || d < bestY.d)) {
              bestY = { d, pos: gyPct - offset, start: 0, end: 100, kind: 'guide' };
            }
          }
        }
      }
    }

    const lines: SnapLine[] = [];
    let x = rawX;
    let y = rawY;
    if (bestX) { x = bestX.pos; lines.push({ axis: 'x', pct: bestX.pos, start: bestX.start, end: bestX.end, kind: bestX.kind }); }
    if (bestY) { y = bestY.pos; lines.push({ axis: 'y', pct: bestY.pos, start: bestY.start, end: bestY.end, kind: bestY.kind }); }
    return { x, y, lines };
  };

  const applyFromClient = (clientX: number, clientY: number) => {
    const element = draggedElement.current;
    if (!element || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const rawX = Math.max(0, Math.min(100, x - dragOffset.current.x));
    const rawY = Math.max(0, Math.min(500, y - dragOffset.current.y));
    const snapped = applySnap(element, rawX, rawY, rect);
    const next = snapped.lines;
    if (JSON.stringify(next) !== JSON.stringify(snapLinesRef.current)) {
      snapLinesRef.current = next;
      setSnapLines(next);
    }
    applyPosition(element, snapped.x, snapped.y);
  };
  const applyFromClientRef = React.useRef(applyFromClient);
  applyFromClientRef.current = applyFromClient;

  // Latest pointer viewport position during a drag — lets the auto-scroll loop
  // re-apply the position after the view scrolls underneath a still pointer.
  const lastClientPos = React.useRef<{ x: number; y: number } | null>(null);

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!dragging) return;
    lastClientPos.current = { x: e.clientX, y: e.clientY };
    applyFromClientRef.current(e.clientX, e.clientY);
  }, [dragging]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    lastClientPos.current = { x: touch.clientX, y: touch.clientY };
    applyFromClientRef.current(touch.clientX, touch.clientY);
  }, [dragging]);

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

  // Edge auto-scroll while dragging (Photoshop-style): when the pointer sits
  // near the top/bottom of the viewport, the canvas scrolls underneath it and
  // the dragged element keeps following — so elements can reach the true top
  // or bottom of the page even though the pointer cannot leave the window.
  React.useEffect(() => {
    if (!dragging) return;
    let raf = 0;
    const EDGE = 90;      // px band that triggers auto-scroll
    const MAX_SPEED = 16; // px per frame
    const tick = () => {
      const p = lastClientPos.current;
      if (p) {
        const vh = window.innerHeight;
        let dy = 0;
        if (p.y < EDGE) dy = -Math.min(MAX_SPEED, (EDGE - p.y) / 3);
        else if (vh - p.y < EDGE) dy = Math.min(MAX_SPEED, (EDGE - (vh - p.y)) / 3);
        if (dy !== 0) {
          const scroller = getScrollParent(sectionRef.current);
          const before = scroller.scrollTop;
          scroller.scrollTop += dy;
          if (scroller.scrollTop !== before) applyFromClientRef.current(p.x, p.y);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging]);

  return {
    sectionRef,
    dragging,
    snapLines,
    handleMouseDown,
    handleTouchStart,
  };
}
