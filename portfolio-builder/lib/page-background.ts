// Page background helpers.
//
// The hero section carries the landing page's background. It works in one of two
// modes:
//   single   — one colour / gradient / image / video painted across the whole page
//              (the classic behaviour, unchanged).
//   sequence — a reel of full-page scenes that cross-fade into each other, either
//              as the visitor scrolls (each scene owns a band of the page) or on a
//              timer. This is what drives the "background switches between videos"
//              look.
//
// These helpers are framework-free so the builder preview, the published React
// page and the exported standalone HTML all agree on which scene is showing.

import type { HeroSection, PageBackgroundScene } from './types';

export type PageBackgroundMode = 'single' | 'sequence';

/** The scenes that should paint, in order, skipping hidden and empty ones. */
export function getPageBackgroundScenes(hero: HeroSection | undefined | null): PageBackgroundScene[] {
  if (!hero?.backgroundScenes) return [];
  return hero.backgroundScenes.filter((scene) => scene.visible !== false && !!scene.value);
}

/** True when the page should run the switching background. */
export function getPageBackgroundMode(hero: HeroSection | undefined | null): PageBackgroundMode {
  return hero?.backgroundMode === 'sequence' && getPageBackgroundScenes(hero).length > 1 ? 'sequence' : 'single';
}

/** Cross-fade duration in ms (clamped to something sane). */
export function getPageBackgroundTransition(hero: HeroSection | undefined | null): number {
  const value = hero?.backgroundTransition ?? 900;
  return Math.min(4000, Math.max(0, value));
}

/** Seconds each scene holds in timer mode. */
export function getPageBackgroundInterval(hero: HeroSection | undefined | null): number {
  const value = hero?.backgroundInterval ?? 6;
  return Math.min(120, Math.max(1, value));
}

/**
 * Where a scene takes over, as a percentage of the page scroll.
 * Scenes without an explicit start are spread evenly across the page, so a
 * three-scene reel covers 0-33%, 33-66% and 66-100% out of the box.
 */
export function getSceneStartPct(scene: PageBackgroundScene | undefined, index: number, total: number): number {
  if (!scene) return 0;
  if (typeof scene.startPercent === 'number' && Number.isFinite(scene.startPercent)) {
    return Math.min(99, Math.max(0, scene.startPercent));
  }
  if (total <= 1) return 0;
  return (index / total) * 100;
}

/** The start percentage of every scene, forced into ascending order. */
export function getSceneStartPcts(scenes: PageBackgroundScene[]): number[] {
  let previous = 0;
  return scenes.map((scene, index) => {
    const start = Math.max(previous, getSceneStartPct(scene, index, scenes.length));
    previous = start;
    return start;
  });
}

/**
 * Which scene is showing at a given page-scroll percentage.
 * `progressPct` is 0 at the top of the page and 100 at the bottom; the answer is
 * the last scene that has already taken over.
 */
export function resolveSceneIndex(progressPct: number, scenes: PageBackgroundScene[]): number {
  if (scenes.length === 0) return -1;
  const starts = getSceneStartPcts(scenes);
  let active = 0;
  for (let index = 0; index < starts.length; index += 1) {
    if (progressPct >= starts[index]) active = index;
    else break;
  }
  return active;
}

/**
 * Where a scene takes over, measured in pixels from the top of the page — the
 * same Y axis the canvas rulers use. A scene with an explicit `startY` switches
 * as soon as the top of the viewport reaches that Y; a scene without one falls
 * back to its percentage of the scrollable page height.
 */
export function getSceneStartPx(
  scene: PageBackgroundScene | undefined,
  index: number,
  total: number,
  scrollRange: number
): number {
  if (!scene) return 0;
  if (typeof scene.startY === 'number' && Number.isFinite(scene.startY)) {
    return Math.max(0, Math.round(scene.startY));
  }
  return Math.round((getSceneStartPct(scene, index, total) / 100) * Math.max(0, scrollRange));
}

/** The switch point of every scene in pixels, forced into ascending order. */
export function getSceneStartPxList(scenes: PageBackgroundScene[], scrollRange: number): number[] {
  let previous = 0;
  return scenes.map((scene, index) => {
    const start = Math.max(previous, getSceneStartPx(scene, index, scenes.length, scrollRange));
    previous = start;
    return start;
  });
}

/** True when every scene's switch point was set by hand rather than derived. */
export function hasExplicitStartPoints(scenes: PageBackgroundScene[]): boolean {
  return scenes.length > 0 && scenes.every((scene) => typeof scene.startY === 'number' && Number.isFinite(scene.startY));
}

/**
 * Which scene is showing at a scroll position in pixels. Later scenes only take
 * over once the viewport top has passed their switch point.
 */
export function resolveSceneAtScroll(scrollTopPx: number, scrollRange: number, scenes: PageBackgroundScene[]): number {
  if (scenes.length === 0) return -1;
  const starts = getSceneStartPxList(scenes, scrollRange);
  let active = 0;
  for (let index = 0; index < starts.length; index += 1) {
    if (scrollTopPx >= starts[index]) active = index;
    else break;
  }
  return active;
}
