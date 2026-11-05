'use client';

import React from 'react';
import type { PageBackgroundScene } from '@/lib/types';
import { getSceneStartPxList } from '@/lib/page-background';
import { getBuilderPageCanvas } from '@/lib/page-canvas';
import { MoveVertical } from 'lucide-react';

interface BackgroundSwitchMarkersProps {
  /** The visible scenes, in reel order. */
  scenes: PageBackgroundScene[];
  /** Section id -> label, used for the snap guides. */
  sectionLabels: { id: string; label: string }[];
  /** Called while a switch line is dragged to a new Y. */
  onChange: (sceneId: string, updates: Partial<PageBackgroundScene>) => void;
}

/** Distance in px within which a dragged switch point snaps to a section edge. */
const SNAP_PX = 16;

/**
 * Edit-mode-only overlay that makes the background reel's switch points visible
 * and draggable on the page's Y axis: one labelled line per clip (the page Y at
 * which that clip fades in), faint guides at every section top to snap against,
 * and a marker showing where the top of the viewport currently sits.
 */
export function BackgroundSwitchMarkers({ scenes, sectionLabels, onChange }: BackgroundSwitchMarkersProps) {
  const [range, setRange] = React.useState(0);
  const [viewportTop, setViewportTop] = React.useState(0);
  const [sectionTops, setSectionTops] = React.useState<{ id: string; label: string; top: number }[]>([]);
  const [dragging, setDragging] = React.useState<string | null>(null);

  const sceneKey = scenes.map((scene) => scene.id).join('|');
  const labelsKey = sectionLabels.map((item) => `${item.id}:${item.label}`).join('|');

  // The canvas registers itself with lib/page-canvas from the parent's effect,
  // which runs after this child's effects — so the element is discovered lazily
  // (on every measure) instead of once on mount, and the labels are read through
  // a ref so measuring stays stable across renders.
  const labelsRef = React.useRef(sectionLabels);
  const trackedCanvasRef = React.useRef<HTMLElement | null>(null);

  const onScroll = React.useCallback(() => {
    const canvas = trackedCanvasRef.current;
    if (canvas) setViewportTop(Math.round(canvas.scrollTop));
  }, []);

  const measure = React.useCallback(() => {
    const canvas = getBuilderPageCanvas();
    if (!canvas) return;
    if (trackedCanvasRef.current !== canvas) {
      trackedCanvasRef.current?.removeEventListener('scroll', onScroll);
      canvas.addEventListener('scroll', onScroll, { passive: true });
      trackedCanvasRef.current = canvas;
    }
    const canvasRect = canvas.getBoundingClientRect();
    const scrollTop = canvas.scrollTop;
    setRange(Math.max(0, Math.round(canvas.scrollHeight - canvas.clientHeight)));
    setViewportTop(Math.round(scrollTop));

    const tops = new Map<string, number>();
    canvas.querySelectorAll<HTMLElement>('[data-tk]').forEach((element) => {
      const key = element.getAttribute('data-tk') || '';
      const sectionId = key.split('||')[0];
      if (!sectionId) return;
      const top = Math.round(element.getBoundingClientRect().top - canvasRect.top + scrollTop);
      const known = tops.get(sectionId);
      if (known === undefined || top < known) tops.set(sectionId, top);
    });
    setSectionTops(
      labelsRef.current
        .map(({ id, label }) => ({ id, label, top: tops.get(id) }))
        .filter((item): item is { id: string; label: string; top: number } => typeof item.top === 'number')
        .sort((left, right) => left.top - right.top)
    );
  }, [onScroll]);

  React.useEffect(() => {
    labelsRef.current = sectionLabels;
  }, [sectionLabels]);

  // Content height (and therefore every Y) settles after render, after tile
  // drags and after images load — re-measure on all of those.
  React.useEffect(() => {
    measure();
    const first = window.requestAnimationFrame(measure);
    const later = window.setTimeout(measure, 600);
    window.addEventListener('resize', measure);
    return () => {
      window.cancelAnimationFrame(first);
      window.clearTimeout(later);
      window.removeEventListener('resize', measure);
    };
  }, [measure, sceneKey, labelsKey]);

  React.useEffect(() => () => {
    trackedCanvasRef.current?.removeEventListener('scroll', onScroll);
    trackedCanvasRef.current = null;
  }, [onScroll]);

  const starts = getSceneStartPxList(scenes, range);

  const startDrag = (event: React.PointerEvent<HTMLButtonElement>, sceneId: string, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    const originY = event.clientY;
    const originalY = starts[index];
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(sceneId);

    const move = (moveEvent: PointerEvent) => {
      const raw = Math.max(0, Math.round(originalY + (moveEvent.clientY - originY)));
      // Snap to the nearest section edge unless the user holds Shift to place the
      // switch point free-hand.
      const snap = moveEvent.shiftKey ? undefined : sectionTops.find((section) => Math.abs(section.top - raw) <= SNAP_PX);
      onChange(sceneId, { startY: snap ? snap.top : raw, startAnchorLabel: snap ? snap.label : undefined });
    };
    const finish = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      setDragging(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
  };
  if (scenes.length < 2) return null;

  return (
    <div data-editor-chrome="background-switch" className="pointer-events-none absolute inset-0" style={{ zIndex: 70 }}>
      {/* Section edges — the switch point snaps to these while dragging */}
      {sectionTops.map((section) => (
        <div key={section.id} className="absolute left-0 right-0" style={{ borderTop: '1px dashed rgba(148,163,184,0.75)', top: section.top }}>
          <span className="absolute left-1 text-[10px] uppercase tracking-wide" style={{ top: -15, color: 'rgba(100,116,139,0.95)' }}>
            {section.label} · Y {section.top}px
          </span>
        </div>
      ))}

      {/* Where the top of the viewport currently sits */}
      <div className="absolute left-0 right-0" style={{ borderTop: '1px solid rgba(16,185,129,0.9)', top: viewportTop }}>
        <span className="absolute right-1 text-[10px] font-semibold" style={{ top: -15, color: 'rgba(5,150,105,1)' }}>
          viewport top · Y {viewportTop}px
        </span>
      </div>

      {/* Clip 1 always owns the top of the page */}
      <div className="absolute left-2" style={{ top: 2 }}>
        <span className="px-2 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: 'rgba(37,99,235,0.8)', color: 'white' }}>
          Clip 1 — from the top of the page
        </span>
      </div>

      {/* One draggable switch line per following clip */}
      {scenes.map((scene, index) => {
        if (index === 0) return null;
        const isAuto = typeof scene.startY !== 'number';
        const top = starts[index];
        const active = dragging === scene.id;
        return (
          <div key={scene.id} className="absolute left-0 right-0" style={{ top }}>
            <div style={{ borderTop: `2px solid ${active ? 'rgba(37,99,235,1)' : 'rgba(59,130,246,0.85)'}` }} />
            <button
              type="button"
              onPointerDown={(event) => startDrag(event, scene.id, index)}
              title="Drag up or down to choose where this clip takes over. Hold Shift to skip snapping to section edges."
              className="pointer-events-auto absolute flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold shadow cursor-ns-resize"
              style={{ left: 8, top: -12, backgroundColor: active ? 'rgba(30,64,175,1)' : 'rgba(37,99,235,1)', color: 'white' }}
            >
              <MoveVertical className="w-3 h-3" />
              Clip {index + 1}
              {scene.label ? ` · ${scene.label}` : ''} — switches at Y {top}px{isAuto ? ' (auto)' : ''}
              {scene.startAnchorLabel ? ` · at ${scene.startAnchorLabel}` : ''}
            </button>
          </div>
        );
      })}
    </div>
  );
}
