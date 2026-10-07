'use client';

import { useEffect, useState } from 'react';
import type { HeroSection } from '@/lib/types';
import { pdfHeight, pdfSource } from '@/lib/hero-pdf';

export function HeroPdfReader({ section }: { section: HeroSection }) {
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
  return <div data-hero-pdf className="relative z-10 mx-auto my-6 w-full max-w-4xl px-4 text-left">
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <h3 className="min-w-0 break-words font-medium">{title}</h3>
        {viewerUrl && <a href={viewerUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-medium text-blue-700 hover:underline">Open PDF</a>}
      </div>
      {viewerUrl ? <iframe src={viewerUrl} title={title} className="block w-full border-0" style={{ height: pdfHeight(section.pdf?.height) }} />
        : <p role="status" className="p-4 text-sm">Loading PDF…</p>}
      <p className="px-4 py-2 text-xs text-gray-500">If the reader is unavailable in your browser, choose Open PDF.</p>
    </div>
  </div>;
}
