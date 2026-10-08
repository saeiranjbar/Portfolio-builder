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
}


interface FreeFormSectionProps {
  sectionId: string;
  snapEnabled: boolean;
  elements: FreeFormElement[];
  onPositionChange: (key: string, position: ElementPosition) => void;
  onBatchPositionChange?: (updates: Record<string, ElementPosition>) => void;
  onElementClick?: (key: string) => void;
  backgroundStyle?: React.CSSProperties;
  className?: string;
  minHeight?: string;
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
  children,
}: FreeFormSectionProps) {
  const previewMode = usePortfolioStore((s) => s.previewMode);
  const visibleElements = elements.filter((e) => e.visible);

  // Build position map and visible keys for snap calculation
  const allPositions: Record<string, ElementPosition> = {};
  const visibleKeys: string[] = [];
  for (const el of visibleElements) {
    allPositions[el.key] = el.position || el.defaultPosition;
    visibleKeys.push(el.key);
  }

  // Measure element heights as % of section height for collision/push resolution.
  // Uses elementRefs' parentElement to access the section without needing sectionRef
  // (which is created inside useFreeFormDrag and not yet available here).
  const getElementHeights = React.useCallback((): Record<string, number> => {
    const firstKey = visibleElements[0]?.key;
    const firstNode = firstKey ? elementRefs.current[firstKey] : null;
    const sectionEl = firstNode?.parentElement;
    if (!sectionEl) return {};
    const sectionRect = sectionEl.getBoundingClientRect();
    if (sectionRect.height === 0) return {};
    const heights: Record<string, number> = {};
    for (const el of visibleElements) {
      const node = elementRefs.current[el.key];
      if (node) {
        const rect = node.getBoundingClientRect();
        heights[el.key] = (rect.height / sectionRect.height) * 100;
      }
    }
    return heights;
  }, [visibleElements]);

  const { sectionRef, dragging, snapLines, handleMouseDown, handleTouchStart } = useFreeFormDrag({
    snapEnabled,
    getAllPositions: () => allPositions,
    getVisibleKeys: () => visibleKeys,
    onPositionChange,
    getElementHeights,
    onBatchPositionChange,
    onElementClick,
  });

  // Measure actual content height to ensure background extends to the bottom.
  // Absolutely positioned elements don't affect parent height, so we measure
  // the actual bottom edge of all children and set minHeight accordingly.
  const [measuredHeight, setMeasuredHeight] = React.useState<number | null>(null);
  const elementRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // Build a stable dependency string from element positions + content keys
  // so the effect re-runs when positions change but not on every render.
  const positionKey = visibleElements
    .map((el) => `${el.key}:${(el.position || el.defaultPosition).x},${(el.position || el.defaultPosition).y}`)
    .join('|');

  React.useLayoutEffect(() => {
    if (!sectionRef.current) return;
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


  const minHeightValue = measuredHeight ? `${measuredHeight}vh` : 'auto';

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className={cn('relative', className)}
      style={{ ...backgroundStyle, minHeight: minHeightValue, paddingBottom: '4rem' }}

    >
      {children}

      {/* Snap guide lines */}
      {dragging && snapEnabled && snapLines.vertical !== undefined && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-20"
          style={{ left: `${snapLines.vertical}%`, width: '1px', backgroundColor: '#3b82f6', boxShadow: '0 0 4px rgba(59,130,246,0.6)' }}
        />
      )}
      {dragging && snapEnabled && snapLines.horizontal !== undefined && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-20"
          style={{ top: `${snapLines.horizontal}%`, height: '1px', backgroundColor: '#3b82f6', boxShadow: '0 0 4px rgba(59,130,246,0.6)' }}
        />
      )}

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
            onClick={!previewMode && onElementClick ? (e) => { e.stopPropagation(); onElementClick(el.key); } : undefined}
          >
            {el.content}
          </div>
        );
      })}
    </section>
  );
}
