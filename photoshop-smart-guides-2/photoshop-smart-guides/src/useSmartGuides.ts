import {useMemo, useRef} from 'react';
import {solveSmartGuides} from './engine';
import type {Rect, SmartGuideOptions, SmartObject} from './types';

/** Pure solve on each committed geometry update. Call during pointermove with the unsnapped pointer-derived object. */
export function useSmartGuides(moving:SmartObject, objects:SmartObject[], scale=1, canvas?:Rect, options?:Partial<SmartGuideOptions>){
 const sticky=useRef<Set<string>>(new Set());
 const result=useMemo(()=>{
  const next=solveSmartGuides(moving,objects,scale,canvas,options,sticky.current);
  const keys=new Set((next.debug??[]).filter(c=>Math.abs(c.delta-(c.axis==='x'?next.dx:next.dy))<0.001).map(c=>c.key));
  sticky.current=keys;
  return next;
 },[moving.id,moving.x,moving.y,moving.width,moving.height,moving.rotation,objects,scale,canvas,options]);
 return result;
}
