'use client';

import { useRef, useState } from 'react';
import type { HeroSection } from '@/lib/types';
import { pdfHeight, pdfSource, uploadPdfFile } from '@/lib/hero-pdf';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function HeroPdfEditor({ section, onUpdate }: { section: HeroSection; onUpdate: (updates: Partial<HeroSection>) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const pdf = section.pdf ?? { url: '', title: 'PDF document', height: 600 };
  const uploaded = pdf.url.startsWith('data:') || pdf.url.startsWith('/uploads/');
  return <div className="space-y-3">
    <div className="space-y-1">
      <Label htmlFor={`hero-pdf-url-${section.id}`}>Public PDF link</Label>
      <Input id={`hero-pdf-url-${section.id}`} value={uploaded ? '' : pdf.url} placeholder="https://example.com/portfolio.pdf"
        disabled={reading} onChange={event => { setError(''); onUpdate({ pdf: { ...pdf, url: event.target.value }, showPdf: true }); }} />
      <p className="text-xs text-gray-500">Use a direct HTTPS link to a public .pdf file, or upload one below.</p>
      {!uploaded && pdf.url && !pdfSource(pdf.url) && <p role="alert" className="text-xs text-red-600">Enter a valid HTTPS PDF link ending in .pdf.</p>}
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" disabled={reading} onClick={() => fileInput.current?.click()}>{reading ? 'Uploading PDF…' : 'Upload PDF'}</Button>
      {pdf.url && <Button size="sm" variant="ghost" disabled={reading} onClick={() => { setError(''); onUpdate({ pdf: { ...pdf, url: '' }, showPdf: false }); }}>Remove PDF</Button>}
      <input ref={fileInput} type="file" accept=".pdf,application/pdf" className="hidden" aria-label="Upload Hero PDF"
        onChange={async event => {
          const file = event.target.files?.[0]; event.target.value = '';
          if (!file) return;
          setReading(true); setError('');
          try { const url = await uploadPdfFile(file); onUpdate({ pdf: { ...pdf, url, title: file.name }, showPdf: true }); }
          catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to read PDF.'); }
          finally { setReading(false); }
        }} />
    </div>
    <p className="text-xs text-gray-500">Uploads: PDF files up to 10 MB. Uploaded documents are stored on the server and served from /uploads.</p>
    <p className="text-xs text-gray-500">Drag the Move handle above the reader in the canvas to position it.</p>
    {pdf.offset && <Button size="sm" variant="outline" onClick={() => onUpdate({ pdf: { ...pdf, offset: { x: 0, y: 0 } } })}>Reset PDF position</Button>}
    {uploaded && <p className="text-xs text-green-700">PDF uploaded: {pdf.title || 'Document'}</p>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="space-y-1"><Label htmlFor={`hero-pdf-title-${section.id}`}>Document title</Label>
      <Input id={`hero-pdf-title-${section.id}`} value={pdf.title ?? ''} maxLength={100} onChange={event => onUpdate({ pdf: { ...pdf, title: event.target.value } })} /></div>
    <div className="space-y-1"><Label htmlFor={`hero-pdf-height-${section.id}`}>Reader height (px)</Label>
      <Input id={`hero-pdf-height-${section.id}`} type="number" min={240} max={1600} step={20} value={pdf.height ?? 600}
        onChange={event => onUpdate({ pdf: { ...pdf, height: pdfHeight(Number(event.target.value)) } })} /></div>
  </div>;
}
