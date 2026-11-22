'use client';

import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export function MobilePdfViewer({ source }: { source: string }) {
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState(false);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loading: { destroy: () => Promise<void> } | undefined;
    setDocument(null);
    setPage(1);
    setError(false);
    setRendering(true);
    import('pdfjs-dist').then(pdfjs => {
      if (cancelled) return;
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      const task = pdfjs.getDocument({ url: source });
      loading = task;
      return task.promise.then(pdf => { if (!cancelled) setDocument(pdf); });
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; void loading?.destroy(); };
  }, [source]);

  useEffect(() => {
    if (!document || !width || !canvas.current) return;
    let cancelled = false;
    let renderTask: { cancel: () => void } | undefined;
    setRendering(true);
    document.getPage(page).then(pdfPage => {
      if (cancelled || !canvas.current) return;
      const viewport = pdfPage.getViewport({ scale: 1 });
      const scaled = pdfPage.getViewport({ scale: width / viewport.width });
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);
      const target = canvas.current;
      target.width = Math.floor(scaled.width * outputScale);
      target.height = Math.floor(scaled.height * outputScale);
      target.style.width = `${scaled.width}px`;
      target.style.height = `${scaled.height}px`;
      const context = target.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      const task = pdfPage.render({ canvas: target, canvasContext: context, viewport: scaled, transform: [outputScale, 0, 0, outputScale, 0, 0] });
      renderTask = task;
      return task.promise.then(() => { if (!cancelled) setRendering(false); });
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; renderTask?.cancel(); };
  }, [document, page, width]);

  return <div ref={container} className="w-full min-w-0">
    {error ? <p role="status" className="py-3 text-sm">This PDF could not be displayed here. Use Open PDF above to read it.</p> : <>
      <canvas ref={canvas} className="block max-w-full" aria-label={`PDF page ${page} of ${document?.numPages ?? '…'}`} />
      {rendering && <p role="status" className="py-2 text-sm">Loading PDF page…</p>}
      {document && <div className="flex items-center justify-center gap-3 py-3 text-sm">
        <button type="button" className="rounded border px-3 py-2 disabled:opacity-50" disabled={page <= 1 || rendering} onClick={() => setPage(value => value - 1)}>Previous</button>
        <span>Page {page} of {document.numPages}</span>
        <button type="button" className="rounded border px-3 py-2 disabled:opacity-50" disabled={page >= document.numPages || rendering} onClick={() => setPage(value => value + 1)}>Next</button>
      </div>}
    </>}
  </div>;
}
