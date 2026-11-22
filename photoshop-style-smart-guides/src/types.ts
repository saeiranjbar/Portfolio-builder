export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface SmartObject {
  id: string;
  bounds: Rect;
  /** Degrees clockwise in CSS-like screen coordinates, around the rectangle center. */
  rotation?: number;
  hidden?: boolean;
  locked?: boolean;
  snapDisabled?: boolean;
}

export type Axis = "x" | "y";
export type AnchorName = "start" | "center" | "end" | "corner" | "edge-midpoint";
export type GuideKind = "edge" | "center" | "canvas" | "spacing" | "measurement";

export interface Guide {
  id: string;
  axis: Axis;
  position: number;
  start: number;
  end: number;
  kind: GuideKind;
  sourceIds: string[];
  label?: string;
}

export interface ActiveSnap {
  targetId: string;
  movingAnchor: AnchorName;
  targetAnchor: AnchorName | "canvas";
  position: number;
}

export interface SnapState {
  x?: ActiveSnap;
  y?: ActiveSnap;
}

export interface SmartGuideOptions {
  guidesEnabled: boolean;
  snapEnabled: boolean;
  spacingEnabled: boolean;
  measurementsEnabled: boolean;
  snapTolerancePx: number;
  releaseTolerancePx: number;
  includeCanvasTargets: boolean;
  includeHiddenObjects: boolean;
  includeLockedObjects: boolean;
  alignEdges: boolean;
  alignCenters: boolean;
  alignRotatedAnchors: boolean;
  showMeasurements: boolean;
  /** Maximum number of non-spacing guides to display per solve. */
  maxGuides: number;
}

export const DEFAULT_SMART_GUIDE_OPTIONS: SmartGuideOptions = {
  guidesEnabled: true,
  snapEnabled: true,
  spacingEnabled: true,
  measurementsEnabled: true,
  snapTolerancePx: 8,
  releaseTolerancePx: 12,
  includeCanvasTargets: true,
  includeHiddenObjects: false,
  includeLockedObjects: false,
  alignEdges: true,
  alignCenters: true,
  alignRotatedAnchors: true,
  showMeasurements: true,
  maxGuides: 8,
};

export interface SnapRectInput {
  moving: Rect;
  movingId: string;
  rotation?: number;
  objects: SmartObject[];
  canvas: CanvasSize;
  zoom?: number;
  options?: Partial<SmartGuideOptions>;
  previous?: SnapState;
}

export interface SnapRectResult {
  x: number;
  y: number;
  guides: Guide[];
  state: SnapState;
}

export interface ResizeEdges {
  left?: boolean;
  right?: boolean;
  top?: boolean;
  bottom?: boolean;
}

export interface SnapResizeInput {
  proposed: Rect;
  edges: ResizeEdges;
  movingId: string;
  objects: SmartObject[];
  canvas: CanvasSize;
  zoom?: number;
  options?: Partial<SmartGuideOptions>;
}

export interface SnapResizeResult {
  bounds: Rect;
  guides: Guide[];
}
