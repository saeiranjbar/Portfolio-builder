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
    if (previewMode) return;
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect(); // Fresh measurement at click time — always accurate
    const newGuide: Guide = {
      id: `guide-${Date.now()}`,
      type,
      position: type === 'horizontal'
        ? ((e.clientX - rect.left) / rect.width * 100)
        : ((e.clientY - rect.top) / rect.height * 100),
    };
    setGuides(prev => [...prev, newGuide]);
  };

  const handleGuideRightClick = (e: React.MouseEvent, guideId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setGuides(guides.filter(g => g.id !== guideId));
  };

  if (previewMode) return null;

  const horizontalGuides = guides.filter(g => g.type === 'horizontal');
  const verticalGuides = guides.filter(g => g.type === 'vertical');
  const horizontalSmartGuides = smartGuides.filter(g => g.type === 'horizontal');
  const verticalSmartGuides = smartGuides.filter(g => g.type === 'vertical');

  return (
    <>
      {/* Vertical ruler: absolute at canvas left edge */}
      {showRulers && (
        <div
          className="absolute inset-y-0 left-0 pointer-events-none"
          style={{ width: RULER_THICKNESS, zIndex: 1001 }}
        >
          <div
            className="absolute inset-y-0 left-0 pointer-events-auto cursor-crosshair border-r border-gray-300"
            style={{ width: RULER_THICKNESS, backgroundColor: 'rgba(243, 244, 246, 0.95)' }}
            onClick={(e) => handleRulerClick(e, 'vertical')}
          >
            {Array.from({ length: 21 }).map((_, i) => {
              const pct = i * 5;
              return (
                <div key={i} className="absolute left-0 flex items-center" style={{ top: `${pct}%` }}>
                  <div className="h-px w-2 bg-gray-400" />
                  <span className="text-[8px] text-gray-500 ml-0.5" style={{ writingMode: 'vertical-rl' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Horizontal ruler: absolute at canvas top */}
      {showRulers && (
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{ height: RULER_THICKNESS, zIndex: 1002 }}
        >
          <div
            className="absolute top-0 left-0 right-0 pointer-events-auto cursor-crosshair border-b border-gray-300"
            style={{ height: RULER_THICKNESS, backgroundColor: 'rgba(243, 244, 246, 0.95)' }}
            onClick={(e) => handleRulerClick(e, 'horizontal')}
          >
            {Array.from({ length: 21 }).map((_, i) => {
              const pct = i * 5;
              return (
                <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${pct}%` }}>
                  <div className="w-px h-2 bg-gray-400" />
                  <span className="absolute top-2.5 -translate-x-1/2 text-[8px] text-gray-500">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Corner square where rulers meet */}
      {showRulers && (
        <div
          className="absolute top-0 left-0 border-r border-b border-gray-300 pointer-events-none"
          style={{ width: RULER_THICKNESS, height: RULER_THICKNESS, backgroundColor: 'rgba(229, 231, 235, 0.95)', zIndex: 1003 }}
        />
      )}

      {/* Guides and smart guides layer */}
      <div className="absolute inset-0 pointer-events-none z-[999]">
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
