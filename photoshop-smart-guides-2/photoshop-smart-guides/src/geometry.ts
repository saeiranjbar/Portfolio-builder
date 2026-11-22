import type {Point, Rect, SmartObject} from './types';

export function corners(o: Pick<SmartObject,'x'|'y'|'width'|'height'|'rotation'>): Point[] {
  const cx=o.x+o.width/2, cy=o.y+o.height/2, r=(o.rotation??0)*Math.PI/180;
  const c=Math.cos(r), s=Math.sin(r);
  return [[-o.width/2,-o.height/2],[o.width/2,-o.height/2],[o.width/2,o.height/2],[-o.width/2,o.height/2]].map(([x,y])=>({x:cx+x*c-y*s,y:cy+x*s+y*c}));
}
export function bounds(o: Pick<SmartObject,'x'|'y'|'width'|'height'|'rotation'>): Rect {
  const pts=corners(o), xs=pts.map(p=>p.x), ys=pts.map(p=>p.y), left=Math.min(...xs), top=Math.min(...ys);
  return {x:left,y:top,width:Math.max(...xs)-left,height:Math.max(...ys)-top};
}
export function features(r: Rect) { return {left:r.x, centerX:r.x+r.width/2, right:r.x+r.width, top:r.y, centerY:r.y+r.height/2, bottom:r.y+r.height}; }
export function overlap(a0:number,a1:number,b0:number,b1:number, slack=0) { return Math.min(a1,b1)+slack >= Math.max(a0,b0); }
export function clamp(v:number,min:number,max:number){return Math.max(min,Math.min(max,v));}
export function roundTo(v:number, precision=2){const f=10**precision;return Math.round(v*f)/f;}
export function rectFromObject(o: SmartObject): Rect { return bounds(o); }
