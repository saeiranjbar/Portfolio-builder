'use client';

import React, { useEffect, useState } from 'react';
import { usePortfolioStore } from '@/lib/store';
import { ElementPosition } from '@/lib/types';

interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
}

interface SmartGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  alignsWith: string[];
  alignmentType: 'edge' | 'center';
}

interface RulersAndGuidesProps {
  containerRef: React.RefObject<HTMLElement>;
  elements: Record<string, ElementPosition>;
  draggingElement?: string | null;
  showRulers: boolean;
  showGuides: boolean;
  showSmartGuides: boolean;
}

const GUIDE_THICKNESS = 8;
const RULER_THICKNESS = 24;

export function RulersAndGuides({
  containerRef,
  elements,
  draggingElement,
  showRulers,
  showGuides,
  showSmartGuides,
}: RulersAndGuidesProps) {
  const { previewMode } = usePortfolioStore();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [smartGuides, setSmartGuides] = useState<SmartGuide[]>([]);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  // Throttle so we don't spam state updates on every scroll/pointer event
  const rafRef = React.useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateRect = () => {
      setContainerRect(el.getBoundingClientRect());
    };

    const scheduleUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateRect();
      });
    };

    // Initial measurement
    updateRect();

    // Track layout changes (sidebar resize/collapse, content growth, etc.)
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(el);

    // Track scrolling of the preview pane (rect.top changes while scrolling)
    window.addEventListener('scroll', scheduleUpdate, true); // capture: fires for nested scroll containers too
    window.addEventListener('resize', scheduleUpdate);
    // Pointer move keeps rulers glued to canvas while dragging the sidebar splitter
    window.addEventListener('pointermove', scheduleUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('pointermove', scheduleUpdate);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!draggingElement || !elements[draggingElement] || !containerRect) {
      setSmartGuides([]);
      return;
    }

    const draggedEl = elements[draggingElement];
    const newSmartGuides: SmartGuide[] = [];
    const threshold = 0.5;

    Object.entries(elements).forEach(([key, pos]) => {
      if (key === draggingElement) return;

      // Horizontal alignments
      if (Math.abs(pos.y - draggedEl.y) < threshold) {
        newSmartGuides.push({ type: 'horizontal', position: pos.y, alignsWith: [key, draggingElement], alignmentType: 'edge' });
      }
      if (Math.abs((pos.y + 10) - (draggedEl.y + 10)) < threshold) {
        newSmartGuides.push({ type: 'horizontal', position: pos.y + 10, alignsWith: [key, draggingElement], alignmentType: 'edge' });
      }
      if (Math.abs((pos.y + 5) - (draggedEl.y + 5)) < threshold) {
        newSmartGuides.push({ type: 'horizontal', position: pos.y + 5, alignsWith: [key, draggingElement], alignmentType: 'center' });
      }

      // Vertical alignments
      if (Math.abs(pos.x - draggedEl.x) < threshold) {
        newSmartGuides.push({ type: 'vertical', position: pos.x, alignsWith: [key, draggingElement], alignmentType: 'edge' });
      }
      if (Math.abs((pos.x + 15) - (draggedEl.x + 15)) < threshold) {
        newSmartGuides.push({ type: 'vertical', position: pos.x + 15, alignsWith: [key, draggingElement], alignmentType: 'edge' });
      }
      if (Math.abs((pos.x + 7.5) - (draggedEl.x + 7.5)) < threshold) {
        newSmartGuides.push({ type: 'vertical', position: pos.x + 7.5, alignsWith: [key, draggingElement], alignmentType: 'center' });
      }
    });

    if (Math.abs(draggedEl.x + 7.5 - 50) < threshold) {
      newSmartGuides.push({ type: 'vertical', position: 50, alignsWith: [draggingElement, 'canvas-center'], alignmentType: 'center' });
    }
    if (Math.abs(draggedEl.y + 5 - 50) < threshold) {
      newSmartGuides.push({ type: 'horizontal', position: 50, alignsWith: [draggingElement, 'canvas-center'], alignmentType: 'center' });
    }

    setSmartGuides(newSmartGuides);
  }, [draggingElement, elements, containerRect]);

  const handleRulerClick = (e: React.MouseEvent, type: 'horizontal' | 'vertical') => {
    if (previewMode || !containerRect) return;
    e.stopPropagation();
    const newGuide: Guide = {
      id: `guide-${Date.now()}`,
      type,
      position: type === 'horizontal'
        ? ((e.clientY - containerRect.top) / containerRect.height * 100)
        : ((e.clientX - containerRect.left) / containerRect.width * 100),
    };
    setGuides([...guides, newGuide]);
  };

  const handleGuideRightClick = (e: React.MouseEvent, guideId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setGuides(guides.filter(g => g.id !== guideId));
  };

  if (previewMode || (!showRulers && !guides.length && !smartGuides.length)) return null;

  const horizontalGuides = guides.filter(g => g.type === 'horizontal');
  const verticalGuides = guides.filter(g => g.type === 'vertical');
  const horizontalSmartGuides = smartGuides.filter(g => g.type === 'horizontal');
  const verticalSmartGuides = smartGuides.filter(g => g.type === 'vertical');

  return (
    <>
      {/* Fixed vertical ruler - spans full viewport height, positioned at canvas left edge */}
      {showRulers && containerRect && (
        <div
          className="fixed top-0 bottom-0 bg-gray-100 border-r border-gray-300 pointer-events-auto cursor-crosshair z-[1001]"
          style={{ left: containerRect.left, width: RULER_THICKNESS }}
          onClick={(e) => handleRulerClick(e, 'vertical')}
        >
          {/* Vertical ruler markings - positioned relative to viewport, showing canvas percentage */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 21 }).map((_, i) => {
              const pct = i * 5;
              const y = containerRect.top + (pct / 100) * containerRect.height;
              if (y < 0 || y > window.innerHeight) return null;
              return (
                <div key={i} className="absolute left-0 flex items-center gap-1" style={{ top: y }}>
                  <div className="h-px w-2 bg-gray-400" />
                  <span className="text-[8px] text-gray-500" style={{ writingMode: 'vertical-rl' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Guides and smart guides layer - absolute within section */}
      <div className="absolute inset-0 pointer-events-none z-[999]">
        {/* Horizontal ruler - spans exactly the canvas width at canvas top */}
        {showRulers && containerRect && (
          <div
            className="fixed bg-gray-100 border-b border-gray-300 pointer-events-auto cursor-crosshair z-[1002]"
            style={{
              left: containerRect.left + RULER_THICKNESS,
              top: containerRect.top,
              width: Math.max(0, containerRect.width - RULER_THICKNESS),
              height: RULER_THICKNESS,
            }}
            onClick={(e) => handleRulerClick(e, 'horizontal')}
          >
            {/* Horizontal ruler markings - 0% at canvas edge, 100% at canvas right edge */}
            <div className="absolute inset-0">
              {Array.from({ length: 21 }).map((_, i) => {
                const pct = i * 5;
                return (
                  <div key={i} className="absolute top-0 h-full flex flex-col items-center" style={{ left: `${pct}%` }}>
                    <div className="w-px h-2 bg-gray-400" />
                    <span className="text-[8px] text-gray-500 mt-0.5 -translate-x-1/2 absolute top-2">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Corner piece where rulers meet */}
        {showRulers && containerRect && (
          <div
            className="fixed bg-gray-200 border-r border-b border-gray-300 z-[1003]"
            style={{
              left: containerRect.left,
              top: containerRect.top,
              width: RULER_THICKNESS,
              height: RULER_THICKNESS,
            }}
          />
        )}

        {/* User-placed guides */}
        {showGuides && horizontalGuides.map(guide => (
          <div
            key={guide.id}
            className="absolute left-0 right-0 bg-cyan-400/60 pointer-events-auto cursor-grab hover:bg-cyan-500/80"
            style={{ top: `${guide.position}%`, height: GUIDE_THICKNESS }}
            onContextMenu={(e) => handleGuideRightClick(e, guide.id)}
            title="Right-click to remove guide"
          />
        ))}

        {showGuides && verticalGuides.map(guide => (
          <div
            key={guide.id}
            className="absolute top-0 bottom-0 bg-cyan-400/60 pointer-events-auto cursor-grab hover:bg-cyan-500/80"
            style={{ left: `${guide.position}%`, width: GUIDE_THICKNESS }}
            onContextMenu={(e) => handleGuideRightClick(e, guide.id)}
            title="Right-click to remove guide"
          />
        ))}

        {/* Smart guides */}
        {showSmartGuides && horizontalSmartGuides.map((guide, i) => (
          <div
            key={`smart-h-${i}`}
            className="absolute left-0 right-0 bg-pink-500/80"
            style={{ top: `${guide.position}%`, height: 1 }}
          />
        ))}

        {showSmartGuides && verticalSmartGuides.map((guide, i) => (
          <div
            key={`smart-v-${i}`}
            className="absolute top-0 bottom-0 bg-pink-500/80"
            style={{ left: `${guide.position}%`, width: 1 }}
          />
        ))}
      </div>
    </>
  );
}
