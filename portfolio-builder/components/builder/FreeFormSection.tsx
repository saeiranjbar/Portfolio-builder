'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ElementPosition } from '@/lib/types';
import { useFreeFormDrag } from '@/lib/useFreeFormDrag';
import { usePortfolioStore } from '@/lib/store';

export interface FreeFormElement {
  key: string;
  content: React.ReactNode;
  position?: ElementPosition;
  visible: boolean;
  defaultPosition: ElementPosition;
  zIndex?: number;
  /** When true, this element is not a layout participant: other elements never
   *  push it out of the way and it never pushes others (page-background slots). */
  staticDuringPush?: boolean;
}


interface FreeFormSectionProps {
  sectionId: string;
  /** When true, dragging snaps to sibling elements' edges/centers (smart guides). */
  snapEnabled: boolean;
  elements: FreeFormElement[];
  onPositionChange: (key: string, position: ElementPosition) => void;
  onBatchPositionChange?: (updates: Record<string, ElementPosition>) => void;
  onElementClick?: (key: string) => void;
  backgroundStyle?: React.CSSProperties;
  className?: string;
  minHeight?: string;
  /** When true (default in 'push' mode), overlapping siblings are pushed out of
   *  the way during drags. Slots flagged staticDuringPush never participate. */
  pushOverlaps?: boolean;
  /** How dropped overlaps are resolved: 'push' cascades siblings away (default),
   *  'swap' exchanges the dragged element with the one it lands on and leaves
   *  every other element untouched. */
  overlapStrategy?: 'push' | 'swap';
  /** Fixed container height in vh. When set, the height is not derived from the elements,
   *  so positions (in % of this height) stay put while other elements are dragged. */
  fixedHeightVh?: number;
  children?: React.ReactNode; // For non-draggable background content (video, overlays, etc.)
}

/**
 * Reusable free-form layout container with drag + snap support.
 * Renders elements as absolutely positioned draggable items.
 */
export function FreeFormSection({
  sectionId,
  snapEnabled,
  elements,
  onPositionChange,
  onBatchPositionChange,
  onElementClick,
  backgroundStyle,
  className,
  minHeight = 'min-h-screen',
  pushOverlaps = true,
  overlapStrategy = 'push',
  fixedHeightVh,
  children,
}: FreeFormSectionProps) {
  const previewMode = usePortfolioStore((s) => s.previewMode);
  const visibleElements = elements.filter((e) => e.visible);

  // Build position map and visible keys for snap/push calculation. Keys marked
  // staticDuringPush stay out of push resolution and smart-guide targeting
  // (background slots must never move or act as layout edges).
  const allPositions: Record<string, ElementPosition> = {};
  const visibleKeys: string[] = [];
  for (const el of visibleElements) {
    allPositions[el.key] = el.position || el.defaultPosition;
    if (!el.staticDuringPush) visibleKeys.push(el.key);
  }

  // Measure element heights as % of section height for collision/push resolution.
  // Uses elementRefs' parentElement to access the section without needing sectionRef
  // (which is created inside useFreeFormDrag and not yet available here).
  const getElementSizes = React.useCallback((): Record<string, { w: number; h: number }> => {
    const firstKey = visibleElements[0]?.key;
    const firstNode = firstKey ? elementRefs.current[firstKey] : null;
    const sectionEl = firstNode?.parentElement;
    if (!sectionEl) return {};
    const sectionRect = sectionEl.getBoundingClientRect();
    if (sectionRect.height === 0 || sectionRect.width === 0) return {};
    const sizes: Record<string, { w: number; h: number }> = {};
    for (const el of visibleElements) {
      const node = elementRefs.current[el.key];
      if (node) {
        const rect = node.getBoundingClientRect();
        sizes[el.key] = { w: (rect.width / sectionRect.width) * 100, h: (rect.height / sectionRect.height) * 100 };
      }
    }
    return sizes;
  }, [visibleElements]);

  // Measure actual content height to ensure background extends to the bottom.
  // Absolutely positioned elements don't affect parent height, so we measure
  // the actual bottom edge of all children and set minHeight accordingly.
  const [measuredHeight, setMeasuredHeight] = React.useState<number | null>(null);
  const elementRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const {
    sectionRef,
    dragging,
    snapLines,
    handleMouseDown,
    handleTouchStart,
  } = useFreeFormDrag({
    getAllPositions: () => allPositions,
    getVisibleKeys: () => visibleKeys,
    onPositionChange,
    // Sizes are always measured so smart/ruler snapping can use the element's
    // edges and centers. Batch updates (push/swap) stay disabled unless enabled.
    getElementSizes,
    smartSnapEnabled: snapEnabled,
    swapOnOverlap: overlapStrategy === 'swap',
    // Keep pushed/hug gaps minimal (0.5vh) instead of 2% of canvas height —
    // on a tall page canvas 2% would be several viewport-heights of margin.
    pushGapPct: fixedHeightVh ? Math.min(2, (0.5 / fixedHeightVh) * 100) : undefined,
    onBatchPositionChange: (pushOverlaps || overlapStrategy === 'swap')
      ? (updates) => {
          // Background slots are never moved by push/swap resolution.
          const filtered = { ...updates };
          for (const el of visibleElements) {
            if (el.staticDuringPush) delete filtered[el.key];
          }
          onBatchPositionChange?.(filtered);
        }
      : undefined,
    onElementClick,
  });

  // Build a stable dependency string from element positions + content keys
  // so the effect re-runs when positions change but not on every render.
  const positionKey = visibleElements
    .map((el) => `${el.key}:${(el.position || el.defaultPosition).x},${(el.position || el.defaultPosition).y}`)
    .join('|');

  React.useLayoutEffect(() => {
    if (!sectionRef.current || fixedHeightVh !== undefined) return;
    const measure = () => {
      let maxBottom = 0;
      const sectionRect = sectionRef.current?.getBoundingClientRect();
      if (!sectionRect) return;
      for (const el of visibleElements) {
        const node = elementRefs.current[el.key];
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        const bottomRelativeToSection = rect.bottom - sectionRect.top;
        if (bottomRelativeToSection > maxBottom) {
          maxBottom = bottomRelativeToSection;
        }
      }
      const vh = window.innerHeight;
      const heightInVh = (maxBottom / vh) * 100 + 15;
      setMeasuredHeight(Math.max(20, heightInVh));
    };
    measure();
    // Re-measure shortly after (images/fonts may load)
    const timeout = setTimeout(measure, 300);

    // Observe size changes on all visible elements so the section height
    // updates when content changes (e.g. PDF viewer height slider).
    const observers: ResizeObserver[] = [];
    for (const el of visibleElements) {
      const node = elementRefs.current[el.key];
      if (!node) continue;
      const obs = new ResizeObserver(() => measure());
      obs.observe(node);
      observers.push(obs);
    }

    return () => {
      clearTimeout(timeout);
      observers.forEach((o) => o.disconnect());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionKey]);


  const minHeightValue = fixedHeightVh !== undefined
    ? `${fixedHeightVh}vh`
    : measuredHeight ? `${measuredHeight}vh` : 'auto';

  // With a fixed height, blocks dropped near the bottom overflow the section. Measure that
  // overflow and add it as an in-flow spacer AFTER the section, so the surrounding background
  // extends to the lowest block without changing the section's own height (which would move
  // every percentage-positioned block).
  const [overflowPx, setOverflowPx] = React.useState(0);
  React.useLayoutEffect(() => {
    if (fixedHeightVh === undefined) return;
    const update = () => {
      const node = sectionRef.current;
      if (!node) return;
      const overflow = Math.max(0, Math.ceil(node.scrollHeight - node.clientHeight));
      setOverflowPx((current) => (current === overflow ? current : overflow));
    };
    update();
    const timeout = setTimeout(update, 300);
    window.addEventListener('resize', update);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionKey, fixedHeightVh]);

  const section = (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className={cn('relative', className)}
      style={{ ...backgroundStyle, minHeight: minHeightValue, paddingBottom: '4rem' }}

    >
      {children}

      {/* Smart-guide / ruler snap indicators (visible while dragging) */}
      {dragging && snapLines.map((line) => line.axis === 'x' ? (
        <div key={`snap-x-${line.pct.toFixed(2)}`} aria-hidden className="pointer-events-none absolute" style={{ left: `${line.pct}%`, top: `${line.start}%`, height: `${Math.max(0.5, line.end - line.start)}%`, width: 2, marginLeft: -1, backgroundColor: line.kind === 'element' ? '#e91e63' : '#06b6d4', zIndex: 40 }} />
      ) : (
        <div key={`snap-y-${line.pct.toFixed(2)}`} aria-hidden className="pointer-events-none absolute" style={{ top: `${line.pct}%`, left: `${line.start}%`, width: `${Math.max(0.5, line.end - line.start)}%`, height: 2, marginTop: -1, backgroundColor: line.kind === 'element' ? '#e91e63' : '#06b6d4', zIndex: 40 }} />
      ))}

      {/* Draggable elements — top-aligned to position so tall content renders below the drop point */}
      {visibleElements.map((el) => {
        const pos = el.position || el.defaultPosition;
        return (
          <div
            key={el.key}
            ref={(node) => { elementRefs.current[el.key] = node; }}
            className={cn(
              'absolute transform -translate-x-1/2',
              !previewMode && 'cursor-move'
            )}
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: dragging === el.key ? 30 : (el.zIndex ?? 1) }}


            onMouseDown={!previewMode ? (e) => handleMouseDown(e, el.key) : undefined}
            onTouchStart={!previewMode ? (e) => handleTouchStart(e, el.key) : undefined}
          >
            {el.content}
          </div>
        );
      })}
    </section>
  );

  if (fixedHeightVh === undefined) return section;
  return (
    <>
      {section}
      {overflowPx > 0 && <div aria-hidden style={{ height: overflowPx }} />}
    </>
  );
}
