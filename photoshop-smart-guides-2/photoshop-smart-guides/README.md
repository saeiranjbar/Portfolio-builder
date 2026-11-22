# Photoshop-style Smart Guides for React + TypeScript

A reusable, DOM/SVG-based implementation of the *observable* Smart Guides behavior documented by Adobe. Adobe's internal source and exact heuristics are proprietary, so this is a tested reconstruction, not Adobe's own code or a claim of pixel-identical parity.

## Features

- Edge and center alignment candidates against other objects and optional canvas bounds.
- Multiple guide lines, magenta guide rendering, and distance labels.
- Equal-gap candidate generation between stationary neighbors.
- Zoom-aware screen-pixel snapping tolerance.
- Sticky/hysteresis-ready solver API (pass the previous candidate keys as `stickyKeys`).
- Rotation-aware axis-aligned bounds for rotated objects.
- Separate resize-edge snapping helper.
- Visibility/lock filtering, configurable features, no DOM reads in the geometry engine.
- Pure TypeScript engine with Vitest tests.

## Install / verify

Copy `src/` into your application. Install peer React and the development dependencies, then run:

```sh
npm install
npm test
npm run typecheck
```

## Integration

The editor owns object state and pointer events. Keep all object geometry in document coordinates and the viewport transform in `{ scale, offsetX, offsetY }`.

```tsx
import { useSmartGuides, SmartGuidesOverlay } from './smart-guides';

const moving = objects.find(o => o.id === activeId)!;
const result = useSmartGuides(moving, objects, viewport.scale,
  { x: 0, y: 0, width: documentWidth, height: documentHeight },
  { enabled: true, snapping: true, tolerancePx: 6 });

// During drag, compute moving.x/y from the raw pointer position first.
// Apply result.dx/dy to the dragged object's document-space position.
// Render the overlay as a sibling over the same viewport/canvas host:
<div className="canvas-host" style={{ position: 'relative' }}>
  <YourCanvas />
  <SmartGuidesOverlay result={result} viewport={viewport} />
</div>
```

Example pointer flow:

```ts
const raw = { ...dragStartObject, x: dragStartObject.x + pointerDx, y: dragStartObject.y + pointerDy };
const result = solveSmartGuides(raw, allObjects, viewport.scale, canvasRect, options, stickyKeys);
setObjectPosition(raw.id, raw.x + result.dx, raw.y + result.dy);
setGuideOverlay(result);
```

Important: do not feed the already-snapped position back as the raw candidate on every pointer event. Derive each proposed position from the original drag anchor and current pointer delta; otherwise snap error can accumulate and guides may oscillate.

## Coordinate and interaction contract

- `SmartObject.x/y/width/height` and `canvas` are document-space coordinates.
- `viewport` maps document to screen: `screenX = docX * scale + offsetX`, likewise for Y.
- `tolerancePx` is a screen-pixel tolerance and is converted to document units by dividing by scale.
- The editor should exclude the active object and its descendants from the target list when dragging a group.
- If your renderer uses nested transforms, supply flattened document-space geometry or extend `geometry.ts` to compose parent matrices.
- SVG overlay is non-interactive and non-exporting. It should be placed above the artwork but below active handles/tooltips if your editor has those layers.

## Important scope notes

Photoshop's Smart Guides interact with tool-specific semantics (layers, paths, text, selections, modifier keys, measurement display, canvas boundaries, and its own snap targets). The public documentation describes behavior but not the private algorithm. This library provides the reusable geometry/interaction core; integrate it with your editor's actual selection model, transform pipeline, and keyboard state. For true production parity, validate against a reference matrix of Photoshop versions and workflows.

## Research references

- Adobe, Work efficiently with Smart Guides: https://helpx.adobe.com/ca/photoshop/desktop/use-grids-measurement-guides/alignment-grids-guides/work-efficiently-with-smart-guides.html
- Adobe, Overview of guides, grids, and Smart Guides: https://helpx.adobe.com/photoshop/desktop/use-grids-measurement-guides/alignment-grids-guides/overview-of-guides-grids-and-smart-guides.html
- Adobe, Position elements with snapping: https://helpx.adobe.com/photoshop/desktop/create-masks/layer-masks/position-elements-with-snapping.html
- Adobe Learn, Work with Smart Guides: https://www.adobe.com/learn/photoshop/web/align-space-objects
