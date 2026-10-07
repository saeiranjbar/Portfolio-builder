'use client';

import { useEffect, useRef, useState } from 'react';
import type { HeroSection } from '@/lib/types';
import { pdfHeight, pdfWidth, pdfSource } from '@/lib/hero-pdf';

export function HeroPdfReader({ section, onMove }: { section: HeroSection; onMove?: (offset: { x: number; y: number }) => void }) {
  const card = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointer: number; x: number; y: number; width: number; height: number; offset: { x: number; y: number } } | null>(null);
  const [moving, setMoving] = useState(false);
  const source = pdfSource(section.pdf?.url);
  const [localPdf, setLocalPdf] = useState<{ source: string; url: string } | null>(null);
  useEffect(() => {
    if (!section.showPdf || !source?.startsWith('data:')) return;
    let disposed = false;
    let url: string | undefined;
    fetch(source).then(response => response.blob()).then(blob => {
      if (disposed) return;
      url = URL.createObjectURL(blob);
      setLocalPdf({ source, url });
    });
    return () => {
      disposed = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [source, section.showPdf]);
  if (!section.showPdf || !source) return null;
  const viewerUrl = source.startsWith('data:') ? (localPdf?.source === source ? localPdf.url : '') : source;
  const title = section.pdf?.title?.trim() || 'PDF document';
  const offset = section.pdf?.offset ?? { x: 0, y: 0 };
  const embeddedUrl = viewerUrl ? `${viewerUrl.split('#')[0]}#toolbar=0&navpanes=0&view=FitH` : '';
  return <div data-hero-pdf className="relative mx-auto my-4 w-full text-left" style={{ pointerEvents: 'auto' }}>
    <div ref={card} className="relative mx-auto" style={{ transform: `translate(${offset.x}%, ${offset.y}%)`, width: `${pdfWidth(section.pdf?.width)}%` }}>
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        {onMove && <button type="button" aria-label="Move PDF reader" title="Drag to move PDF reader" className="touch-none cursor-move rounded border px-2 py-1 text-sm"
          onPointerDown={event => {
            if (event.button !== 0 || !card.current) return;
            event.preventDefault(); event.stopPropagation();
            const rect = card.current.getBoundingClientRect();
            drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, width: rect.width, height: rect.height, offset };
            event.currentTarget.setPointerCapture(event.pointerId); setMoving(true);
          }}
          onPointerMove={event => {
            const start = drag.current;
            if (!start || start.pointer !== event.pointerId) return;
            onMove({ x: start.offset.x + (event.clientX - start.x) / start.width * 100, y: start.offset.y + (event.clientY - start.y) / start.height * 100 });
          }}
          onPointerUp={event => { if (drag.current?.pointer === event.pointerId) { drag.current = null; setMoving(false); event.currentTarget.releasePointerCapture(event.pointerId); } }}
          onPointerCancel={() => { drag.current = null; setMoving(false); }}
          onLostPointerCapture={() => { drag.current = null; setMoving(false); }}
        >↔ Move</button>}
        <h3 className="min-w-0 break-words font-medium">{title}</h3>
        {viewerUrl && <a href={viewerUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-medium text-blue-700 hover:underline">Open PDF</a>}
      </div>
      {embeddedUrl ? <iframe src={embeddedUrl} title={title} className="block w-full border-0" style={{ height: pdfHeight(section.pdf?.height), pointerEvents: moving ? 'none' : undefined }} />
        : <p role="status" className="p-4 text-sm">Loading PDF…</p>}
    </div>
  </div>;
}
