import type {CSSProperties} from 'react';
import type {Measurement, SnapResult, Viewport} from './types';

type Props={result:SnapResult;viewport:Viewport;visible?:boolean;className?:string;style?:CSSProperties};
const MAGENTA='#ff35c8';
function sx(x:number,v:Viewport){return x*v.scale+v.offsetX;}
function sy(y:number,v:Viewport){return y*v.scale+v.offsetY;}
function labelPoint(m:Measurement,v:Viewport){return m.axis==='x'?{x:(sx(m.start,v)+sx(m.end,v))/2,y:sy(m.value,v)-7}:{x:sx(m.value,v)+7,y:(sy(m.start,v)+sy(m.end,v))/2};}
export function SmartGuidesOverlay({result,viewport,visible=true,className,style}:Props){
 if(!visible)return null;
 return <svg className={className} style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible',pointerEvents:'none',zIndex:9999,...style}} aria-hidden="true">
  {result.guides.map(g=>g.axis==='x'?<line key={g.id} x1={sx(g.value,viewport)} x2={sx(g.value,viewport)} y1={sy(g.start,viewport)} y2={sy(g.end,viewport)} stroke={MAGENTA} strokeWidth={1} vectorEffect="non-scaling-stroke"/>:<line key={g.id} x1={sx(g.start,viewport)} x2={sx(g.end,viewport)} y1={sy(g.value,viewport)} y2={sy(g.value,viewport)} stroke={MAGENTA} strokeWidth={1} vectorEffect="non-scaling-stroke"/>)}
  {result.measurements.map(m=>{const p=labelPoint(m,viewport);return <g key={m.id}><line x1={m.axis==='x'?sx(m.start,viewport):sx(m.value,viewport)} y1={m.axis==='x'?sy(m.value,viewport):sy(m.start,viewport)} x2={m.axis==='x'?sx(m.end,viewport):sx(m.value,viewport)} y2={m.axis==='x'?sy(m.value,viewport):sy(m.end,viewport)} stroke={MAGENTA} strokeWidth={1} strokeDasharray="2 2" vectorEffect="non-scaling-stroke"/><rect x={p.x-24} y={p.y-10} width={48} height={16} rx={3} fill="#27212b" stroke={MAGENTA} strokeWidth={0.7}/><text x={p.x} y={p.y+1.5} fill="#fff" textAnchor="middle" fontSize={10} fontFamily="Arial, sans-serif">{m.label}</text></g>})}
 </svg>;
}
