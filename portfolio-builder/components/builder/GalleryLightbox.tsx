'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

// Full-size image viewer. When a caption is given it sits underneath the photo,
// so the full image and its description are read together.
export function GalleryLightbox({ src, onClose, caption }: { src: string | null; onClose: () => void; caption?: string }) {
  React.useEffect(() => {
    if (!src) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [src, onClose]);

  if (!src || typeof document === 'undefined') return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Full-size gallery image"
      className="fixed inset-0 z-[9999] flex flex-col bg-black/95 p-4"
      onClick={(event) => { event.stopPropagation(); onClose(); }}>
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <OptimizedImage src={src} alt={caption || 'Full-size gallery image'}
          className="block max-h-full max-w-full object-contain" />
      </div>
      {caption && (
        <p className="mx-auto mt-3 max-w-4xl text-center text-sm leading-relaxed text-white/85 md:text-base"
          onClick={(event) => event.stopPropagation()}>
          {caption}
        </p>
      )}
      <button type="button" aria-label="Close image" title="Close"
        className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
        onClick={(event) => { event.stopPropagation(); onClose(); }}>
        <X className="h-8 w-8" />
      </button>
    </div>,
    document.body
  );
}
