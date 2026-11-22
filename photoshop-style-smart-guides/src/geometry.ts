import type { AnchorName, Axis, Rect, SmartObject } from "./types";

export interface Point {
  x: number;
  y: number;
}

export interface GeometryAnchor {
  name: AnchorName;
  point: Point;
}

export function rectCenter(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

export function rotatePoint(point: Point, center: Point, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

export function rectCorners(rect: Rect, rotation = 0): Point[] {
  const corners = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];
  if (!rotation) return corners;
  const center = rectCenter(rect);
  return corners.map((point) => rotatePoint(point, center, rotation));
}

export function axisAlignedBounds(rect: Rect, rotation = 0): Rect {
  const points = rectCorners(rect, rotation);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function getGeometryAnchors(
  rect: Rect,
  rotation = 0,
  includeRotatedAnchors = true,
): GeometryAnchor[] {
  const center = rectCenter(rect);
  const corners = rectCorners(rect, rotation);
  const points: GeometryAnchor[] = [
    { name: "start", point: { x: rect.x, y: rect.y } },
    { name: "center", point: center },
    { name: "end", point: { x: rect.x + rect.width, y: rect.y + rect.height } },
  ];

  if (includeRotatedAnchors && rotation !== 0) {
    points.push(
      ...corners.map((point) => ({ name: "corner" as const, point })),
      {
        name: "edge-midpoint",
        point: { x: (corners[0].x + corners[1].x) / 2, y: (corners[0].y + corners[1].y) / 2 },
      },
      {
        name: "edge-midpoint",
        point: { x: (corners[1].x + corners[2].x) / 2, y: (corners[1].y + corners[2].y) / 2 },
      },
      {
        name: "edge-midpoint",
        point: { x: (corners[2].x + corners[3].x) / 2, y: (corners[2].y + corners[3].y) / 2 },
      },
      {
        name: "edge-midpoint",
        point: { x: (corners[3].x + corners[0].x) / 2, y: (corners[3].y + corners[0].y) / 2 },
      },
    );
  }
  return points;
}

export function anchorCoordinate(anchor: GeometryAnchor, axis: Axis): number {
  return axis === "x" ? anchor.point.x : anchor.point.y;
}

export function filterSnapTargets(
  objects: SmartObject[],
  movingId: string,
  includeHidden: boolean,
  includeLocked: boolean,
): SmartObject[] {
  return objects.filter((object) =>
    object.id !== movingId &&
    !object.snapDisabled &&
    (includeHidden || !object.hidden) &&
    (includeLocked || !object.locked)
  );
}
