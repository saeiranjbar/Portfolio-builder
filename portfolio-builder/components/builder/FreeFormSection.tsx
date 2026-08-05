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
}

interface FreeFormSectionProps {
  sectionId: string;
  snapEnabled: boolean;
  elements: FreeFormElement[];
  onPositionChange: (key: string, position: ElementPosition) => void;
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

  const { sectionRef, dragging, snapLines, handleMouseDown, handleTouchStart } = useFreeFormDrag({
    snapEnabled,
    getAllPositions: () => allPositions,
    getVisibleKeys: () => visibleKeys,
    onPositionChange,
  });

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className={cn('relative overflow-hidden', minHeight, className)}
      style={backgroundStyle}
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

      {/* Draggable elements */}
      {visibleElements.map((el) => {
        const pos = el.position || el.defaultPosition;
        return (
          <div
            key={el.key}
            className={cn(
              'absolute transform -translate-x-1/2 -translate-y-1/2',
              !previewMode && 'cursor-move',
              dragging === el.key && 'z-10'
            )}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onMouseDown={!previewMode ? (e) => handleMouseDown(e, el.key) : undefined}
            onTouchStart={!previewMode ? (e) => handleTouchStart(e, el.key) : undefined}
          >
            {el.content}
          </div>
        );
      })}
    </section>
  );
}
