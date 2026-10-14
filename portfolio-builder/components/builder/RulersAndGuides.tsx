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

  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
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
      {/* Fixed vertical ruler - spans full viewport height */}
      {showRulers && (
        <div
          className="fixed top-0 bottom-0 bg-gray-100 border-r border-gray-300 pointer-events-auto cursor-crosshair z-[1001]"
          style={{ left: containerRect?.left ?? 0, width: RULER_THICKNESS }}
          onClick={(e) => handleRulerClick(e, 'vertical')}
        >
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: Math.ceil((containerRect?.height ?? 0) / (window.innerHeight / 20)) }).map((_, i) => {
              const pct = i * 5;
              const y = (containerRect?.top ?? 0) + (pct / 100) * (containerRect?.height ?? 0);
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

      {/* Absolute layer: horizontal ruler + guides + smart guides */}
      <div className="absolute inset-0 pointer-events-none z-[999]" style={{ top: -RULER_THICKNESS, left: -RULER_THICKNESS }}>
        {showRulers && (
          <div className="absolute top-0 left-0 right-0 bg-gray-100 border-b border-gray-300 pointer-events-auto cursor-crosshair" style={{ height: RULER_THICKNESS }} onClick={(e) => handleRulerClick(e, 'horizontal')}>
            <div className="absolute inset-0 flex justify-between px-4">
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-px h-2 bg-gray-400" />
                  <span className="text-[8px] text-gray-500 mt-0.5">{i * 5}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showGuides && horizontalGuides.map(guide => (
          <div key={guide.id} className="absolute left-0 right-0 bg-cyan-400/60 pointer-events-auto cursor-grab hover:bg-cyan-500/80" style={{ top: `${guide.position}%`, height: GUIDE_THICKNESS }} onContextMenu={(e) => handleGuideRightClick(e, guide.id)} title="Right-click to remove guide" />
        ))}

        {showGuides && verticalGuides.map(guide => (
          <div key={guide.id} className="absolute top-0 bottom-0 bg-cyan-400/60 pointer-events-auto cursor-grab hover:bg-cyan-500/80" style={{ left: `${guide.position}%`, width: GUIDE_THICKNESS }} onContextMenu={(e) => handleGuideRightClick(e, guide.id)} title="Right-click to remove guide" />
        ))}

        {showSmartGuides && horizontalSmartGuides.map((guide, i) => (
          <div key={`smart-h-${i}`} className="absolute left-0 right-0 bg-pink-500/80" style={{ top: `${guide.position}%`, height: 1 }} />
        ))}

        {showSmartGuides && verticalSmartGuides.map((guide, i) => (
          <div key={`smart-v-${i}`} className="absolute top-0 bottom-0 bg-pink-500/80" style={{ left: `${guide.position}%`, width: 1 }} />
        ))}

        {showRulers && <div className="absolute top-0 left-0 bg-gray-200 border-r border-b border-gray-300" style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }} />}
      </div>
    </>
  );
}
