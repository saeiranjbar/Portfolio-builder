'use client';

import React from 'react';
import type { PageBackgroundScene } from '@/lib/types';
import { resolveSceneAtScroll } from '@/lib/page-background';

interface PageBackgroundBackdropProps {
  scenes: PageBackgroundScene[];
  /** Cross-fade duration in ms. */
  transition: number;
  /** What moves the reel forward. */
  advance: 'scroll' | 'timer';
  /** Seconds each scene holds in timer mode. */
  interval: number;
  /** The scrolling element the page lives in (the builder canvas / published page). */
  containerRef: React.RefObject<HTMLElement | null>;
}

/**
 * The "switching background" reel: full-page video/image scenes stacked on top of
 * each other behind the whole page, cross-fading between one another as the
 * visitor scrolls (or on a timer).
 *
 * It is a zero-height sticky element, so it takes no part in the page flow: the
 * sticky box pins itself to the top of the scrolling container for as long as the
 * document is scrolled, which keeps a viewport-sized stack of scenes pinned to
 * the screen without using `position: fixed` (fixed would escape the device-frame
 * preview, whose canvas is smaller than the browser window).
 */
export function PageBackgroundBackdrop({ scenes, transition, advance, interval, containerRef }: PageBackgroundBackdropProps) {
  const [active, setActive] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState<number | undefined>(undefined);
  const videoRefs = React.useRef<Array<HTMLVideoElement | null>>([]);

  const sceneKey = scenes.map((scene) => [scene.id, scene.startY, scene.startPercent].join(':')).join('|');

  // Keep the viewport box in sync with the canvas — the preview frame resizes
  // between desktop / tablet / mobile, and the reel must match it exactly.
  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => setViewportHeight(container.clientHeight || undefined);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  // Scroll-driven switching: every clip has a switch point on the page's Y axis
  // (an absolute pixel value, or a percentage of the scrollable page when unset),
  // and the clip whose point the top of the viewport has passed is the one shown.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const range = Math.max(0, container.scrollHeight - container.clientHeight);
      const next = resolveSceneAtScroll(container.scrollTop, range, scenes);
      setActive((current) => (current === next ? current : next));
    };
    if (advance === 'timer') {
      // A scroll-driven listener must not fight the timer.
      return;
    }
    update();
    container.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      container.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, advance, sceneKey]);

  // Timer-driven switching.
  React.useEffect(() => {
    if (advance !== 'timer' || scenes.length < 2) return;
    const handle = window.setInterval(() => {
      setActive((current) => (current + 1) % scenes.length);
    }, Math.max(1, interval) * 1000);
    return () => window.clearInterval(handle);
  }, [advance, interval, sceneKey, scenes.length]);

  // Never let the hidden clips keep decoding: pause everything but the active one.
  React.useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === active) {
        const playing = video.play();
        if (playing && typeof playing.catch === 'function') playing.catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    });
  }, [active, sceneKey]);

  React.useEffect(() => {
    setActive((current) => (current < scenes.length ? current : 0));
  }, [sceneKey, scenes.length]);

  if (scenes.length === 0) return null;

  return (
    <div
      aria-hidden
      data-page-background="sequence"
      className="pointer-events-none"
      style={{ position: 'sticky', top: 0, left: 0, width: '100%', height: 0, zIndex: -1 }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: viewportHeight ?? '100vh', overflow: 'hidden' }}>
        {scenes.map((scene, index) => {
          const isActive = index === active;
          return (
            <div
              key={scene.id}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: isActive ? 1 : 0,
                transition: transition > 0 ? `opacity ${transition}ms ease-in-out` : undefined,
                background: scene.type === 'image' ? `#000 url('${scene.value}') center / cover no-repeat` : '#000',
              }}
            >
              {scene.type === 'video' && (
                <video
                  ref={(node) => { videoRefs.current[index] = node; }}
                  src={scene.value}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={isActive ? 'auto' : 'metadata'}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {!!scene.overlayOpacity && (
                <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${scene.overlayOpacity / 100})` }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
