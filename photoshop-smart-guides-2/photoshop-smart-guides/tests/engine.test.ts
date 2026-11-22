import {describe,it,expect} from 'vitest';
import {solveSmartGuides} from '../src/engine';
import {bounds} from '../src/geometry';
import {snapResize} from '../src/resize';
import type {SmartObject} from '../src/types';
const obj=(id:string,x:number,y:number,width=100,height=80,rotation=0):SmartObject=>({id,x,y,width,height,rotation});
describe('geometry',()=>{it('computes rotation-aware AABB',()=>{const b=bounds(obj('a',0,0,100,50,90));expect(b.width).toBeCloseTo(50);expect(b.height).toBeCloseTo(100);});});
describe('smart guide solver',()=>{
 it('snaps moving left edge to target right edge',()=>{const r=solveSmartGuides(obj('a',203,10),[obj('b',100,10)],1);expect(r.dx).toBe(-3);expect(r.snappedX).toBe(true);});
 it('snaps centers',()=>{const r=solveSmartGuides(obj('a',202,0),[obj('b',100,0)],1);expect(r.guides.length).toBeGreaterThan(0);});
 it('does not snap outside screen-space tolerance',()=>{const r=solveSmartGuides(obj('a',210,10),[obj('b',100,10)],1,undefined,{tolerancePx:4});expect(r.dx).toBe(0);});
 it('uses zoom-adjusted tolerance',()=>{const r=solveSmartGuides(obj('a',205,0),[obj('b',100,0)],2,undefined,{tolerancePx:6});expect(r.dx).toBe(-5);});
 it('can disable snapping while retaining guide feedback',()=>{const r=solveSmartGuides(obj('a',203,0),[obj('b',100,0)],1,undefined,{snapping:false});expect(r.dx).toBe(0);expect(r.guides.length).toBeGreaterThan(0);});
 it('filters hidden objects',()=>{const r=solveSmartGuides(obj('a',203,0),[{...obj('b',100,0),visible:false}],1,undefined,{tolerancePx:6});expect(r.dx).toBe(0);});
});
describe('resize snapping',()=>{it('snaps east edge to nearby reference edge',()=>{const r=snapResize(obj('a',0,0,100,100),{x:0,y:0,width:103,height:100},'e',[obj('b',150,0,100,100)],5);expect(r.width).toBe(150);expect(r.snappedX).toBe(true);});});
