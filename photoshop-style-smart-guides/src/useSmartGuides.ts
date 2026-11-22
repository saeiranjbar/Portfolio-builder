import { useCallback, useEffect, useRef, useState } from "react";
import { snapRect } from "./engine";
import type { CanvasSize, Guide, Rect, SmartGuideOptions, SmartObject, SnapState } from "./types";

export interface UseSmartGuidesConfig {
  objects: SmartObject[];
  canvas: CanvasSize;
  zoom?: number;
  options?: Partial<SmartGuideOptions>;
}

export interface SmartGuidesController {
  guides: Guide[];
  move: (id: string, proposed: Rect, rotation?: number) => { x: number; y: number };
  clear: () => void;
}

/**
 * React bridge for the geometry engine. Call move() from your drag preview handler.
 * It coalesces guide-state updates to one per animation frame.
 */
export function useSmartGuides(config: UseSmartGuidesConfig): SmartGuidesController {
  const [guides, setGuides] = useState<Guide[]>([]);
  const configRef = useRef(config);
  const stateRef = useRef<SnapState>({});
  const pendingRef = useRef<Guide[] | null>(null);
  const rafRef = useRef<number | null>(null);

  configRef.current = config;

  const scheduleGuides = useCallback((next: Guide[]) => {
    pendingRef.current = next;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingRef.current) {
        setGuides(pendingRef.current);
        pendingRef.current = null;
      }
    });
  }, []);

  const move = useCallback((id: string, proposed: Rect, rotation = 0) => {
    const current = configRef.current;
    const result = snapRect({
      moving: proposed,
      movingId: id,
      rotation,
      objects: current.objects,
      canvas: current.canvas,
      zoom: current.zoom ?? 1,
      options: current.options,
      previous: stateRef.current,
    });
    stateRef.current = result.state;
    scheduleGuides(result.guides);
    return { x: result.x, y: result.y };
  }, [scheduleGuides]);

  const clear = useCallback(() => {
    stateRef.current = {};
    pendingRef.current = [];
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setGuides([]);
  }, []);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  return { guides, move, clear };
}
