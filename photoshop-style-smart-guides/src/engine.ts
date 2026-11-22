import { anchorCoordinate, axisAlignedBounds, filterSnapTargets, getGeometryAnchors } from "./geometry";
import type {
  ActiveSnap, AnchorName, Axis, Guide, Rect, SnapRectInput, SnapRectResult,
  SnapResizeInput, SnapResizeResult, SmartGuideOptions,
} from "./types";
import { DEFAULT_SMART_GUIDE_OPTIONS } from "./types";

interface Candidate {
  axis: Axis;
  delta: number;
  distance: number;
  guide: Guide;
  active: ActiveSnap;
}

function optionsWithDefaults(options?: Partial<SmartGuideOptions>): SmartGuideOptions {
  const merged = { ...DEFAULT_SMART_GUIDE_OPTIONS, ...options };
  if (merged.snapTolerancePx < 0 || merged.releaseTolerancePx < merged.snapTolerancePx) {
    throw new Error("releaseTolerancePx must be >= snapTolerancePx >= 0");
  }
  return merged;
}

function anchorAllowed(name: AnchorName, options: SmartGuideOptions): boolean {
  if (name === "center") return options.alignCenters;
  if (name === "start" || name === "end") return options.alignEdges;
  return options.alignRotatedAnchors;
}

function chooseCandidate(
  candidates: Candidate[],
  axis: Axis,
  previous: ActiveSnap | undefined,
  enter: number,
  release: number,
): Candidate | undefined {
  const axisCandidates = candidates.filter((candidate) => candidate.axis === axis);
  if (previous) {
    const active = axisCandidates.find((candidate) =>
      candidate.active.targetId === previous.targetId &&
      candidate.active.movingAnchor === previous.movingAnchor &&
      candidate.active.targetAnchor === previous.targetAnchor
    );
    if (active && active.distance <= release) return active;
  }

  return axisCandidates
    .filter((candidate) => candidate.distance <= enter)
    .sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      const aCenter = a.active.movingAnchor === "center" ? 0 : 1;
      const bCenter = b.active.movingAnchor === "center" ? 0 : 1;
      return aCenter - bCenter || a.active.targetId.localeCompare(b.active.targetId);
    })[0];
}

function makeCandidate(
  axis: Axis,
  movingValue: number,
  targetValue: number,
  movingAnchor: AnchorName,
  targetAnchor: AnchorName | "canvas",
  targetId: string,
  kind: Guide["kind"],
  spanStart: number,
  spanEnd: number,
): Candidate {
  const delta = targetValue - movingValue;
  const distance = Math.abs(delta);
  return {
    axis,
    delta,
    distance,
    active: { targetId, movingAnchor, targetAnchor, position: targetValue },
    guide: {
      id: `${axis}:${targetId}:${movingAnchor}:${targetAnchor}`,
      axis,
      position: targetValue,
      start: spanStart,
      end: spanEnd,
      kind,
      sourceIds: [targetId],
    },
  };
}

function addSpacingCandidates(
  moving: Rect,
  movingId: string,
  objects: SnapRectInput["objects"],
  zoom: number,
  options: SmartGuideOptions,
): { candidates: Candidate[]; guides: Guide[] } {
  if (!options.spacingEnabled) return { candidates: [], guides: [] };
  const eligible = filterSnapTargets(
    objects, movingId, options.includeHiddenObjects, options.includeLockedObjects,
  );
  const spacingCandidates: Candidate[] = [];
  const spacingGuides: Guide[] = [];
  const tolerance = options.snapTolerancePx / zoom;

  // Horizontal: nearest object to the left and right with vertical overlap.
  const verticalOverlap = (a: Rect, b: Rect) =>
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 0;

  const horizontal = eligible
    .map((o) => ({ ...o, bounds: axisAlignedBounds(o.bounds, o.rotation ?? 0) }))
    .filter((o) => verticalOverlap(moving, o.bounds));

  const left = horizontal
    .filter((o) => o.bounds.x + o.bounds.width <= moving.x + tolerance)
    .sort((a, b) => (moving.x - (a.bounds.x + a.bounds.width)) - (moving.x - (b.bounds.x + b.bounds.width)))[0];
  const right = horizontal
    .filter((o) => o.bounds.x >= moving.x + moving.width - tolerance)
    .sort((a, b) => (a.bounds.x - (moving.x + moving.width)) - (b.bounds.x - (moving.x + moving.width)))[0];

  if (left && right) {
    const leftEdge = left.bounds.x + left.bounds.width;
    const rightEdge = right.bounds.x;
    const targetX = (leftEdge + rightEdge - moving.width) / 2;
    const delta = targetX - moving.x;
    const leftGap = moving.x - leftEdge;
    const rightGap = rightEdge - (moving.x + moving.width);
    if (Math.abs(leftGap - rightGap) <= tolerance * 2) {
      spacingGuides.push(
        { id: "spacing:left", axis: "y", position: moving.y + moving.height + 8 / zoom, start: leftEdge, end: moving.x, kind: "spacing", sourceIds: [left.id, movingId], label: formatDistance(leftGap) },
        { id: "spacing:right", axis: "y", position: moving.y + moving.height + 8 / zoom, start: moving.x + moving.width, end: rightEdge, kind: "spacing", sourceIds: [movingId, right.id], label: formatDistance(rightGap) },
      );
    }
    if (Math.abs(delta) <= tolerance) {
      spacingCandidates.push(makeCandidate("x", moving.x, targetX, "start", "start", "spacing:horizontal", "spacing", moving.y, moving.y + moving.height));
    }
  }

  // Vertical: nearest object above and below with horizontal overlap.
  const horizontalOverlap = (a: Rect, b: Rect) =>
    Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 0;

  const vertical = eligible
    .map((o) => ({ ...o, bounds: axisAlignedBounds(o.bounds, o.rotation ?? 0) }))
    .filter((o) => horizontalOverlap(moving, o.bounds));

  const above = vertical
    .filter((o) => o.bounds.y + o.bounds.height <= moving.y + tolerance)
    .sort((a, b) => (moving.y - (a.bounds.y + a.bounds.height)) - (moving.y - (b.bounds.y + b.bounds.height)))[0];
  const below = vertical
    .filter((o) => o.bounds.y >= moving.y + moving.height - tolerance)
    .sort((a, b) => (a.bounds.y - (moving.y + moving.height)) - (b.bounds.y - (moving.y + moving.height)))[0];

  if (above && below) {
    const topEdge = above.bounds.y + above.bounds.height;
    const bottomEdge = below.bounds.y;
    const targetY = (topEdge + bottomEdge - moving.height) / 2;
    const delta = targetY - moving.y;
    const topGap = moving.y - topEdge;
    const bottomGap = bottomEdge - (moving.y + moving.height);
    if (Math.abs(topGap - bottomGap) <= tolerance * 2) {
      spacingGuides.push(
        { id: "spacing:top", axis: "x", position: moving.x + moving.width + 8 / zoom, start: topEdge, end: moving.y, kind: "spacing", sourceIds: [above.id, movingId], label: formatDistance(topGap) },
        { id: "spacing:bottom", axis: "x", position: moving.x + moving.width + 8 / zoom, start: moving.y + moving.height, end: bottomEdge, kind: "spacing", sourceIds: [movingId, below.id], label: formatDistance(bottomGap) },
      );
    }
    if (Math.abs(delta) <= tolerance) {
      spacingCandidates.push(makeCandidate("y", moving.y, targetY, "start", "start", "spacing:vertical", "spacing", moving.x, moving.x + moving.width));
    }
  }

  return { candidates: spacingCandidates, guides: spacingGuides };
}

export function formatDistance(distance: number): string {
  const rounded = Math.round(distance * 100) / 100;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)} px`;
}

export function snapRect(input: SnapRectInput): SnapRectResult {
  const options = optionsWithDefaults(input.options);
  const zoom = input.zoom ?? 1;
  if (!Number.isFinite(zoom) || zoom <= 0) throw new Error("zoom must be a positive finite number");

  const { moving, movingId, objects, canvas, rotation = 0, previous = {} } = input;
  const candidates: Candidate[] = [];
  const targets = filterSnapTargets(
    objects, movingId, options.includeHiddenObjects, options.includeLockedObjects,
  );
  const movingAnchors = getGeometryAnchors(moving, rotation, options.alignRotatedAnchors);

  for (const axis of ["x", "y"] as const) {
    const canvasLength = axis === "x" ? canvas.width : canvas.height;
    const targetAnchors: Array<{ id: string; position: number; name: AnchorName | "canvas"; kind: Guide["kind"] }> = [];

    for (const object of targets) {
      const anchors = getGeometryAnchors(object.bounds, object.rotation ?? 0, options.alignRotatedAnchors);
      for (const anchor of anchors) {
        if (!anchorAllowed(anchor.name, options)) continue;
        targetAnchors.push({
          id: object.id,
          position: anchorCoordinate(anchor, axis),
          name: anchor.name,
          kind: anchor.name === "center" ? "center" : "edge",
        });
      }
    }

    if (options.includeCanvasTargets) {
      targetAnchors.push(
        { id: "canvas:start", position: 0, name: "canvas", kind: "canvas" },
        { id: "canvas:center", position: canvasLength / 2, name: "canvas", kind: "canvas" },
        { id: "canvas:end", position: canvasLength, name: "canvas", kind: "canvas" },
      );
    }

    for (const source of movingAnchors) {
      if (!anchorAllowed(source.name, options)) continue;
      for (const target of targetAnchors) {
        const value = anchorCoordinate(source, axis);
        const delta = target.position - value;
        const spanStart = axis === "x" ? Math.min(moving.y, moving.y + moving.height) : Math.min(moving.x, moving.x + moving.width);
        const spanEnd = axis === "x" ? Math.max(moving.y + moving.height, target.position) : Math.max(moving.x + moving.width, target.position);
        candidates.push(makeCandidate(
          axis, value, target.position, source.name, target.name, target.id, target.kind, spanStart, spanEnd,
        ));
      }
    }
  }

  const enter = options.snapTolerancePx / zoom;
  const release = options.releaseTolerancePx / zoom;
  const bestX = options.snapEnabled ? chooseCandidate(candidates, "x", previous.x, enter, release) : undefined;
  const bestY = options.snapEnabled ? chooseCandidate(candidates, "y", previous.y, enter, release) : undefined;

  let x = moving.x + (bestX?.delta ?? 0);
  let y = moving.y + (bestY?.delta ?? 0);
  let guides = [bestX?.guide, bestY?.guide].filter((guide): guide is Guide => !!guide);
  const spacing = addSpacingCandidates({ ...moving, x, y }, movingId, objects, zoom, options);

  if (options.snapEnabled && options.spacingEnabled) {
    const sx = chooseCandidate(spacing.candidates, "x", previous.x, enter, release);
    const sy = chooseCandidate(spacing.candidates, "y", previous.y, enter, release);
    if (sx && (!bestX || sx.distance < bestX.distance)) {
      x += sx.delta;
      guides = guides.filter((guide) => guide.axis !== "x");
      guides.push(sx.guide);
    }
    if (sy && (!bestY || sy.distance < bestY.distance)) {
      y += sy.delta;
      guides = guides.filter((guide) => guide.axis !== "y");
      guides.push(sy.guide);
    }
  }

  if (options.measurementsEnabled && options.showMeasurements) {
    const movingBounds = axisAlignedBounds({ ...moving, x, y }, rotation);
    const measurementTargets = targets.map((o) => ({ id: o.id, bounds: axisAlignedBounds(o.bounds, o.rotation ?? 0) }));
    const left = measurementTargets.filter((o) => o.bounds.x + o.bounds.width <= movingBounds.x)
      .sort((a, b) => b.bounds.x + b.bounds.width - (a.bounds.x + a.bounds.width))[0];
    const right = measurementTargets.filter((o) => o.bounds.x >= movingBounds.x + movingBounds.width)
      .sort((a, b) => a.bounds.x - b.bounds.x)[0];
    if (left) {
      const gap = movingBounds.x - (left.bounds.x + left.bounds.width);
      guides.push({ id: "measure:left", axis: "y", position: movingBounds.y + movingBounds.height + 18 / zoom, start: left.bounds.x + left.bounds.width, end: movingBounds.x, kind: "measurement", sourceIds: [left.id, movingId], label: formatDistance(gap) });
    }
    if (right) {
      const gap = right.bounds.x - (movingBounds.x + movingBounds.width);
      guides.push({ id: "measure:right", axis: "y", position: movingBounds.y + movingBounds.height + 18 / zoom, start: movingBounds.x + movingBounds.width, end: right.bounds.x, kind: "measurement", sourceIds: [movingId, right.id], label: formatDistance(gap) });
    }
  }

  if (!options.guidesEnabled) guides = [];
  else guides = guides.slice(0, options.maxGuides);

  return {
    x,
    y,
    guides,
    state: {
      x: bestX?.active,
      y: bestY?.active,
    },
  };
}

export function snapResize(input: SnapResizeInput): SnapResizeResult {
  const options = optionsWithDefaults(input.options);
  const zoom = input.zoom ?? 1;
  if (!Number.isFinite(zoom) || zoom <= 0) throw new Error("zoom must be a positive finite number");
  const tolerance = options.snapTolerancePx / zoom;
  const bounds = { ...input.proposed };
  const guides: Guide[] = [];
  const targets = filterSnapTargets(
    input.objects, input.movingId, options.includeHiddenObjects, options.includeLockedObjects,
  );
  const edges = input.edges;

  const xTargets: Array<{ id: string; position: number; kind: Guide["kind"] }> = [];
  const yTargets: Array<{ id: string; position: number; kind: Guide["kind"] }> = [];

  for (const object of targets) {
    const target = axisAlignedBounds(object.bounds, object.rotation ?? 0);
    xTargets.push(
      { id: object.id, position: target.x, kind: "edge" },
      { id: object.id, position: target.x + target.width / 2, kind: "center" },
      { id: object.id, position: target.x + target.width, kind: "edge" },
    );
    yTargets.push(
      { id: object.id, position: target.y, kind: "edge" },
      { id: object.id, position: target.y + target.height / 2, kind: "center" },
      { id: object.id, position: target.y + target.height, kind: "edge" },
    );
  }
  if (options.includeCanvasTargets) {
    xTargets.push(
      { id: "canvas:start", position: 0, kind: "canvas" },
      { id: "canvas:center", position: input.canvas.width / 2, kind: "canvas" },
      { id: "canvas:end", position: input.canvas.width, kind: "canvas" },
    );
    yTargets.push(
      { id: "canvas:start", position: 0, kind: "canvas" },
      { id: "canvas:center", position: input.canvas.height / 2, kind: "canvas" },
      { id: "canvas:end", position: input.canvas.height, kind: "canvas" },
    );
  }

  const snapEdge = (
    active: boolean | undefined,
    current: number,
    axis: Axis,
    targetList: typeof xTargets,
    guideStart: number,
    guideEnd: number,
  ) => {
    if (!active) return current;
    const candidate = targetList
      .map((target) => ({ ...target, distance: Math.abs(target.position - current) }))
      .filter((target) => target.distance <= tolerance)
      .sort((a, b) => a.distance - b.distance)[0];
    if (!candidate || !options.snapEnabled) return current;
    guides.push({
      id: `resize:${axis}:${candidate.id}:${candidate.position}`,
      axis,
      position: candidate.position,
      start: guideStart,
      end: guideEnd,
      kind: candidate.kind,
      sourceIds: [candidate.id, input.movingId],
    });
    return candidate.position;
  };

  if (edges.left) {
    const right = bounds.x + bounds.width;
    const snapped = snapEdge(true, bounds.x, "x", xTargets, bounds.y, bounds.y + bounds.height);
    bounds.width += bounds.x - snapped;
    bounds.x = snapped;
    if (bounds.width < 1) bounds.width = 1;
    // Preserve the opposite edge.
    if (bounds.x + bounds.width !== right) bounds.width = right - bounds.x;
  }
  if (edges.right) {
    bounds.width = snapEdge(true, bounds.x + bounds.width, "x", xTargets, bounds.y, bounds.y + bounds.height) - bounds.x;
    if (bounds.width < 1) bounds.width = 1;
  }
  if (edges.top) {
    const bottom = bounds.y + bounds.height;
    const snapped = snapEdge(true, bounds.y, "y", yTargets, bounds.x, bounds.x + bounds.width);
    bounds.height += bounds.y - snapped;
    bounds.y = snapped;
    if (bounds.height < 1) bounds.height = 1;
    if (bounds.y + bounds.height !== bottom) bounds.height = bottom - bounds.y;
  }
  if (edges.bottom) {
    bounds.height = snapEdge(true, bounds.y + bounds.height, "y", yTargets, bounds.x, bounds.x + bounds.width) - bounds.y;
    if (bounds.height < 1) bounds.height = 1;
  }

  return { bounds, guides: options.guidesEnabled ? guides.slice(0, options.maxGuides) : [] };
}
