# Photoshop-style Smart Guides for React + TypeScript (DOM)

A reusable Smart Guides subsystem intended to integrate into an existing DOM-based editor. It includes a geometry engine, alignment snapping, spacing equalization, measurements, resize snapping, rotation-aware anchor geometry, hysteresis state, a React SVG overlay, a hook, and Vitest tests.

## Included

- Edge, center, and rotated-corner/edge-midpoint anchor alignment
- Canvas edge and center alignment
- Multiple simultaneous guides (independent x and y relationships)
- Equal-gap detection and optional equal-spacing snapping
- Gap measurement labels
- Resize snapping for axis-aligned resize bounds
- Zoom-aware snap/release thresholds and active-target hysteresis
- React hook with requestAnimationFrame-coalesced pointer updates
- SVG overlay with labels and non-scaling guide strokes
- Unit tests for alignment, rotation geometry, spacing, resize, zoom, and hysteresis

## Install

Copy `src/` into your app. React 18+ is required.

To run the bundled tests in this package:

```bash
npm install
npm test
npm run typecheck
```

## DOM editor integration

Keep your editor's document model in document coordinates. Apply pan/zoom to a shared content layer, and put the guide overlay inside that same transformed layer so guide positions share the same coordinate system. The SVG uses `vector-effect="non-scaling-stroke"` so lines remain thin when transformed.

Example structure:

```tsx
<div className="viewport">
  <div
    className="document-layer"
    style={{
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: "0 0",
      width: canvas.width,
      height: canvas.height,
    }}
  >
    {items.map((item) => (
      <div
        key={item.id}
        style={{
          position: "absolute",
          left: item.bounds.x,
          top: item.bounds.y,
          width: item.bounds.width,
          height: item.bounds.height,
          transform: `rotate(${item.rotation ?? 0}deg)`,
          transformOrigin: "center",
        }}
      />
    ))}
    <SmartGuidesOverlay guides={guides} width={canvas.width} height={canvas.height} />
  </div>
</div>
```

Note: CSS transform functions are order-sensitive. Verify the layer's transform order against your existing pan/zoom implementation. If the overlay is rendered outside the transformed layer, transform guide coordinates to viewport coordinates yourself.

### Drag integration

Use `useSmartGuides` to calculate a snapped preview from proposed document-space bounds. Keep pointer handling and your document's commit/undo system in your editor:

```tsx
const smartGuides = useSmartGuides({
  objects: items,
  canvas: { width: 1200, height: 800 },
  zoom,
  options: { snapEnabled: true, spacingEnabled: true },
});

// Inside pointer-move, after converting client coordinates into document coordinates:
const result = smartGuides.move("item-1", proposedBounds, itemRotation);
setPreviewPosition({ x: result.x, y: result.y });

// On pointer-up:
smartGuides.clear();
```

For production, keep `objects` current (or use stable memoized data), call `clear()` on pointer cancellation/unmount, and commit the final snapped geometry only when the interaction ends.

### Resize integration

Pass the proposed resize rectangle and the edges being dragged to `snapResize`. Use its returned bounds for the preview and render its guides. For corner resizing, pass both horizontal and vertical edges.

```ts
const result = snapResize({
  proposed: nextBounds,
  edges: { right: true, bottom: true },
  objects: otherObjects,
  canvas,
  zoom,
});
```

### Rotation-aware geometry

`rotation` is in degrees around the rectangle center. The engine computes rotated corners and edge midpoints, then compares their x/y projections. This gives rotation-aware anchors for alignment. The current engine snaps projected anchors on screen axes; it does not rotate the snapping axis itself to match the object's local axes.

### Configuration

See `SmartGuideOptions` in `src/types.ts`. Defaults are intentionally editor-friendly, not a claim to reproduce Adobe's private implementation exactly. Public documentation does not expose every internal Photoshop algorithm.

### Limitations to understand before shipping

- DOM object bounds should be maintained from your editor model. Avoid calling `getBoundingClientRect()` for every object on every pointer move.
- Rotated objects use corners and edge midpoints for snapping, but resize snapping operates on axis-aligned proposed bounds.
- Equal spacing is a first-neighbor horizontal/vertical heuristic. Complex layouts may require a richer relationship graph and overlap scoring.
- The engine does not own selection, undo/redo, pointer capture, or document persistence.
- Very large documents should use a spatial index (grid, quadtree, or R-tree) to retrieve nearby snap targets instead of passing every object to every solve.
