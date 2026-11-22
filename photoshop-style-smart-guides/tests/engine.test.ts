import { describe, expect, it } from "vitest";
import { axisAlignedBounds, rectCorners } from "../src/geometry";
import { snapRect, snapResize } from "../src/engine";
import type { SmartObject } from "../src/types";

const canvas = { width: 1000, height: 800 };

describe("rotation-aware geometry", () => {
  it("rotates a rectangle around its center", () => {
    const points = rectCorners({ x: 0, y: 0, width: 100, height: 50 }, 90);
    expect(points[0].x).toBeCloseTo(75);
    expect(points[0].y).toBeCloseTo(-25);
  });

  it("returns expanded axis-aligned bounds for a rotated rectangle", () => {
    const bounds = axisAlignedBounds({ x: 0, y: 0, width: 100, height: 50 }, 90);
    expect(bounds.x).toBeCloseTo(25);
    expect(bounds.y).toBeCloseTo(-25);
    expect(bounds.width).toBeCloseTo(50);
    expect(bounds.height).toBeCloseTo(100);
  });
});

describe("snapRect", () => {
  it("snaps edges and centers and returns guide data", () => {
    const objects: SmartObject[] = [
      { id: "target", bounds: { x: 200, y: 200, width: 100, height: 60 } },
    ];
    const result = snapRect({
      moving: { x: 194, y: 200, width: 100, height: 60 },
      movingId: "moving",
      objects,
      canvas,
      zoom: 1,
      options: { includeCanvasTargets: false },
    });
    expect(result.x).toBe(200);
    expect(result.guides.length).toBeGreaterThan(0);
  });

  it("converts screen-space tolerance according to zoom", () => {
    const result = snapRect({
      moving: { x: 184, y: 100, width: 100, height: 60 },
      movingId: "moving",
      objects: [{ id: "target", bounds: { x: 200, y: 300, width: 100, height: 60 } }],
      canvas,
      zoom: 0.5,
      options: { includeCanvasTargets: false, spacingEnabled: false },
    });
    expect(result.x).toBe(200);
  });

  it("does not snap outside tolerance", () => {
    const result = snapRect({
      moving: { x: 180, y: 100, width: 100, height: 60 },
      movingId: "moving",
      objects: [{ id: "target", bounds: { x: 200, y: 300, width: 100, height: 60 } }],
      canvas,
      zoom: 1,
      options: { includeCanvasTargets: false, spacingEnabled: false },
    });
    expect(result.x).toBe(180);
  });

  it("keeps the previous target while inside release tolerance", () => {
    const objects: SmartObject[] = [
      { id: "target", bounds: { x: 200, y: 300, width: 100, height: 60 } },
    ];
    const first = snapRect({
      moving: { x: 194, y: 100, width: 100, height: 60 },
      movingId: "moving", objects, canvas,
      options: { includeCanvasTargets: false, spacingEnabled: false },
    });
    const second = snapRect({
      moving: { x: 189, y: 100, width: 100, height: 60 },
      movingId: "moving", objects, canvas, previous: first.state,
      options: { includeCanvasTargets: false, spacingEnabled: false },
    });
    expect(second.state.x?.targetId).toBe("target");
  });

  it("can align to canvas center", () => {
    const result = snapRect({
      moving: { x: 445, y: 100, width: 100, height: 60 },
      movingId: "moving", objects: [], canvas,
      options: { spacingEnabled: false },
    });
    expect(result.x).toBe(450);
  });
});

describe("snapResize", () => {
  it("snaps the right edge and preserves the left edge", () => {
    const result = snapResize({
      proposed: { x: 100, y: 100, width: 94, height: 80 },
      edges: { right: true },
      movingId: "moving",
      objects: [{ id: "target", bounds: { x: 200, y: 200, width: 100, height: 60 } }],
      canvas,
      options: { includeCanvasTargets: false },
    });
    expect(result.bounds.x).toBe(100);
    expect(result.bounds.x + result.bounds.width).toBe(200);
    expect(result.guides.length).toBeGreaterThan(0);
  });
});
