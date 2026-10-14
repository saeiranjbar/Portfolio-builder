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

const GUIDE_THICKNESS = 8;
const RULER_THICKNESS = 24;

export function RulersAndGuides({ containerRef }: { containerRef: React.RefObject<HTMLElement> }) {
  const { previewMode, showRulers, showGuides } = usePortfolioStore();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [docHeight, setDocHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateHeight = () => setDocHeight(el.scrollHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  const addGuide = (e: React.MouseEvent, type: 'horizontal' | 'vertical') => {
    if (previewMode) return;
    e.stopPropagation();
    const el = containerRef.current;
    if (!el || docHeight === 0) return;
    const rect = el.getBoundingClientRect();
    let position: number;
    if (type === 'horizontal') {
      position = ((e.clientX - rect.left) / rect.width) * 100;
    } else {
      const docY = el.scrollTop + (e.clientY - rect.top);
      position = (docY / docHeight) * 100;
    }
    setGuides((prev) => [...prev, { id: `guide-${Date.now()}`, type, position }]);
  };

  const removeGuide = (e: React.MouseEvent, guideId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setGuides((prev) => prev.filter((g) => g.id !== guideId));
  };

  if (previewMode) return null;

  const horizontalGuides = guides.filter((g) => g.type === 'horizontal');
  const verticalGuides = guides.filter((g) => g.type === 'vertical');

  return (
    <>
      {showGuides && (horizontalGuides.length > 0 || verticalGuides.length > 0) && (
        <div className="absolute left-0 right-0 top-0 pointer-events-none z-[999]" style={{ height: docHeight }}>
          {horizontalGuides.map((guide) => (
            <div key={guide.id} className="absolute left-0 right-0 bg-cyan-400/60 pointer-events-auto cursor-grab hover:bg-cyan-500/80" style={{ top: `${guide.position}%`, height: GUIDE_THICKNESS }} onContextMenu={(e) => removeGuide(e, guide.id)} title="Right-click to remove guide" />
          ))}
          {verticalGuides.map((guide) => (
            <div key={guide.id} className="absolute top-0 bottom-0 bg-cyan-400/60 pointer-events-auto cursor-grab hover:bg-cyan-500/80" style={{ left: `${guide.position}%`, width: GUIDE_THICKNESS }} onContextMenu={(e) => removeGuide(e, guide.id)} title="Right-click to remove guide" />
          ))}
        </div>
      )}
      {showRulers && (
        <div className="sticky top-0 h-0 z-[1001] pointer-events-none">
          <div className="absolute top-0 left-0 pointer-events-auto cursor-crosshair border-r border-gray-300" style={{ width: RULER_THICKNESS, height: '100vh', backgroundColor: 'rgba(243, 244, 246, 0.95)' }} onClick={(e) => addGuide(e, 'vertical')}>
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
          <div className="absolute top-0 pointer-events-auto cursor-crosshair border-b border-gray-300" style={{ left: RULER_THICKNESS, right: 0, height: RULER_THICKNESS, backgroundColor: 'rgba(243, 244, 246, 0.95)' }} onClick={(e) => addGuide(e, 'horizontal')}>
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
          <div className="absolute top-0 left-0 border-r border-b border-gray-300" style={{ width: RULER_THICKNESS, height: RULER_THICKNESS, backgroundColor: 'rgba(229, 231, 235, 0.95)' }} />
        </div>
      )}
    </>
  );
}
