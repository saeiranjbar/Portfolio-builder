'use client';

import React from 'react';
import type { GalleryImage } from '@/lib/types';
import { groupGalleryByRatio } from '@/lib/gallery-order';

// Equal-width tiles have similar heights when their height-to-width ratios match.
export function useGalleryOrder(images: GalleryImage[] | undefined, columns = 2): GalleryImage[] {
  const [measured, setMeasured] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    let cancelled = false;
    const missing = (images || []).filter(image =>
      !(image.naturalWidth && image.naturalHeight) && measured[image.url] === undefined
    );
    if (missing.length) {
      Promise.all(missing.map(image => new Promise<[string, number | null]>(resolve => {
        const probe = new window.Image();
        probe.onload = () => resolve([image.url, probe.naturalWidth ? probe.naturalHeight / probe.naturalWidth : null]);
        probe.onerror = () => resolve([image.url, null]);
        probe.src = image.url;
      }))).then(results => {
        if (cancelled) return;
        setMeasured(previous => {
          const next = { ...previous };
          for (const [url, ratio] of results) next[url] = ratio ?? 0;
          return next;
        });
      });
    }
    return () => { cancelled = true; };
  }, [images, measured]);

  if (!images) return [];
  return groupGalleryByRatio(images, columns, image =>
    image.naturalWidth && image.naturalHeight
      ? image.naturalHeight / image.naturalWidth
      : measured[image.url] || Infinity
  );
}
