'use client';

import React from 'react';

interface OptimizedImageProps {
  src?: string;
  alt: string;

  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Renders images with high-DPI/retina display support.
 *
 * For picsum.photos URLs, we generate a srcset with 2x and 3x variants
 * so retina displays get crisp images.
 * For data/blob URLs, we use a plain <img> tag for maximum compatibility.
 */
export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  style,
  onClick,
}: OptimizedImageProps) {
  const imgRef = React.useRef<HTMLImageElement>(null);

  // DEBUG: Log computed CSS of this image after it loads
  React.useEffect(() => {
    if (!imgRef.current || !src) return;
    const img = imgRef.current;
    const logDebugInfo = () => {
      const cs = window.getComputedStyle(img);
      const rect = img.getBoundingClientRect();
      const debugText = `🔍 [DEBUG IMAGE] ${alt} | ` +
        `naturalWidth: ${img.naturalWidth} | ` +
        `naturalHeight: ${img.naturalHeight} | ` +
        `displayWidth: ${Math.round(rect.width)} | ` +
        `displayHeight: ${Math.round(rect.height)} | ` +
        `src: ${img.src} | ` +
        `transform: ${cs.transform} | ` +
        `filter: ${cs.filter} | ` +
        `willChange: ${cs.willChange} | ` +
        `objectFit: ${cs.objectFit} | ` +
        `opacity: ${cs.opacity} | ` +
        `parentTransform: ${img.parentElement ? window.getComputedStyle(img.parentElement).transform : 'none'} | ` +
        `parentFilter: ${img.parentElement ? window.getComputedStyle(img.parentElement).filter : 'none'} | ` +
        `grandparentTransform: ${img.parentElement?.parentElement ? window.getComputedStyle(img.parentElement.parentElement).transform : 'none'} | ` +
        `grandparentFilter: ${img.parentElement?.parentElement ? window.getComputedStyle(img.parentElement.parentElement).filter : 'none'}`;
      console.log(debugText);
    };

    if (img.complete) logDebugInfo();
    else img.addEventListener('load', logDebugInfo);
    return () => img.removeEventListener('load', logDebugInfo);
  }, [src, alt]);

  const fillStyle: React.CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }
    : style || {};


  if (!src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src=""
        alt={alt}
        className={className?.replace(/\bopacity-60\b/g, '')}
        style={fillStyle}
        onClick={onClick}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  // For data: URLs, blob: URLs, use a plain <img> tag
  const isDataUrl = src.startsWith('data:') || src.startsWith('blob:');

  if (isDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className?.replace(/\bopacity-60\b/g, '')}
        style={fillStyle}
        onClick={onClick}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  // For external URLs (including picsum.photos), use a plain <img> tag
  // No srcset — just use the src directly. The src already points to a
  // high-resolution image (e.g., 1200x1200) which is more than enough for
  // typical display sizes.
  // For picsum.photos, ensure we get high quality images without any filters
  let finalSrc = src;
  if (src.includes('picsum.photos')) {
    // Remove any existing query params and add quality settings
    finalSrc = src.replace(/\?.*$/, '') + '?quality=100';
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={finalSrc}
      alt={alt}
        className={className?.replace(/\bopacity-60\b/g, '')}
      style={{ ...fillStyle, imageRendering: 'auto', filter: 'none' }}
      onClick={onClick}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
    />
  );
}





