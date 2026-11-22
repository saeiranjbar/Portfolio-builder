export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type Viewport = { scale: number; offsetX: number; offsetY: number };
export type SmartObject = {
  id: string; x: number; y: number; width: number; height: number; rotation?: number;
  visible?: boolean; locked?: boolean; parentId?: string; kind?: 'layer'|'shape'|'text'|'group';
};
export type GuideLine = { id: string; axis: 'x'|'y'; value: number; start: number; end: number; kind: 'edge'|'center'|'canvas'|'spacing'|'manual'; sourceIds: string[] };
export type Measurement = { id: string; axis: 'x'|'y'; value: number; start: number; end: number; label: string; kind: 'gap'|'size'|'offset' };
export type SnapResult = { dx: number; dy: number; guides: GuideLine[]; measurements: Measurement[]; snappedX: boolean; snappedY: boolean; debug?: Candidate[] };
export type Candidate = { axis:'x'|'y'; delta:number; distance:number; priority:number; guide:GuideLine; key:string };
export type SmartGuideOptions = {
  enabled: boolean; snapping: boolean; tolerancePx: number; releaseTolerancePx: number;
  showEdges: boolean; showCenters: boolean; showSpacing: boolean; showMeasurements: boolean;
  includeCanvas: boolean; includeHidden: boolean; maxGuidesPerAxis: number; measurementUnits: 'px'|'document';
};
export const DEFAULT_OPTIONS: SmartGuideOptions = {
  enabled:true, snapping:true, tolerancePx:6, releaseTolerancePx:10, showEdges:true, showCenters:true,
  showSpacing:true, showMeasurements:true, includeCanvas:true, includeHidden:false, maxGuidesPerAxis:4, measurementUnits:'px'
};
