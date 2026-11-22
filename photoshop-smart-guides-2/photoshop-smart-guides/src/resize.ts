import {bounds} from './geometry';
import type {Rect, SmartObject} from './types';
export type ResizeHandle='n'|'s'|'e'|'w'|'ne'|'nw'|'se'|'sw';
export type ResizeResult={x:number;y:number;width:number;height:number;snappedX:boolean;snappedY:boolean};
/** Snap the active resize edge in document units. Caller should apply result before rendering. */
export function snapResize(original:SmartObject, proposed:Rect, handle:ResizeHandle, targets:SmartObject[], toleranceDocumentUnits:number):ResizeResult{
 const r={...proposed}, refs=targets.filter(t=>t.id!==original.id&&t.visible!==false).map(bounds);
 let snappedX=false,snappedY=false;
 const verticalEdges=(handle.includes('e')?[r.x+r.width]:[]).concat(handle.includes('w')?[r.x]:[]);
 const horizontalEdges=(handle.includes('s')?[r.y+r.height]:[]).concat(handle.includes('n')?[r.y]:[]);
 const xs=refs.flatMap(b=>[b.x,b.x+b.width,b.x+b.width/2]);
 const ys=refs.flatMap(b=>[b.y,b.y+b.height,b.y+b.height/2]);
 let bestX:{edge:number;target:number;d:number}|undefined,bestY:typeof bestX;
 for(const edge of verticalEdges)for(const target of xs){const d=Math.abs(target-edge);if(d<=toleranceDocumentUnits&&(!bestX||d<bestX.d))bestX={edge,target,d};}
 for(const edge of horizontalEdges)for(const target of ys){const d=Math.abs(target-edge);if(d<=toleranceDocumentUnits&&(!bestY||d<bestY.d))bestY={edge,target,d};}
 if(bestX){if(handle.includes('e'))r.width=Math.max(1,r.width+bestX.target-bestX.edge);else r.x+=bestX.target-bestX.edge;snappedX=true;}
 if(bestY){if(handle.includes('s'))r.height=Math.max(1,r.height+bestY.target-bestY.edge);else r.y+=bestY.target-bestY.edge;snappedY=true;}
 return {...r,snappedX,snappedY};
}
