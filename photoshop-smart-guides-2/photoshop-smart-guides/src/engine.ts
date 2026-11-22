import {bounds, features, overlap, roundTo} from './geometry';
import {DEFAULT_OPTIONS, type Candidate, type GuideLine, type Measurement, type Rect, type SmartObject, type SnapResult, type SmartGuideOptions} from './types';

type Feature = {axis:'x'|'y'; name:string; value:number; kind:'edge'|'center'};
function objectFeatures(r:Rect, options:SmartGuideOptions):Feature[] {
 const f=features(r), out:Feature[]=[];
 if(options.showEdges) out.push({axis:'x',name:'left',value:f.left,kind:'edge'},{axis:'x',name:'right',value:f.right,kind:'edge'},{axis:'y',name:'top',value:f.top,kind:'edge'},{axis:'y',name:'bottom',value:f.bottom,kind:'edge'});
 if(options.showCenters) out.push({axis:'x',name:'centerX',value:f.centerX,kind:'center'},{axis:'y',name:'centerY',value:f.centerY,kind:'center'});
 return out;
}
const fmt=(v:number)=>`${Math.abs(roundTo(v,2))} px`;
function line(axis:'x'|'y',value:number,a:Rect,b:Rect,kind:GuideLine['kind'],ids:string[]):GuideLine {
 if(axis==='x') return {id:`${axis}:${value}:${ids.join(':')}`,axis,value,start:Math.min(a.y,b.y),end:Math.max(a.y+a.height,b.y+b.height),kind,sourceIds:ids};
 return {id:`${axis}:${value}:${ids.join(':')}`,axis,value,start:Math.min(a.x,b.x),end:Math.max(a.x+a.width,b.x+b.width),kind,sourceIds:ids};
}
function candidateSet(moving:SmartObject, targets:SmartObject[], canvas:Rect|undefined, options:SmartGuideOptions):Candidate[] {
 const mr=bounds(moving), mf=objectFeatures(mr,options), candidates:Candidate[]=[];
 const refs=targets.filter(t=>t.id!==moving.id && !t.locked && (options.includeHidden || t.visible!==false)).map(t=>({o:t,r:bounds(t)}));
 if(canvas && options.includeCanvas) refs.push({o:{id:'__canvas__',...canvas,kind:'shape'},r:canvas});
 for(const ref of refs){
  const tf=objectFeatures(ref.r,options);
  for(const a of mf) for(const b of tf){ if(a.axis!==b.axis) continue;
   const delta=b.value-a.value, axis=a.axis;
   const guide=line(axis,b.value,mr,ref.r,ref.o.id==='__canvas__'?'canvas':a.kind==='center'&&b.kind==='center'?'center':'edge',[moving.id,ref.o.id]);
   const priority=(a.kind==='center'&&b.kind==='center'?0: a.kind===b.kind?1:2)+(ref.o.id==='__canvas__'?0.2:0);
   candidates.push({axis,delta,distance:Math.abs(delta),priority,guide,key:`${axis}:${a.name}:${ref.o.id}:${b.name}`});
  }
 }
 return candidates;
}
function spacingCandidates(moving:SmartObject, targets:SmartObject[], canvas:Rect|undefined, options:SmartGuideOptions):Candidate[] {
 if(!options.showSpacing) return [];
 const mr=bounds(moving), out:Candidate[]=[];
 const others=targets.filter(t=>t.id!==moving.id && !t.locked && (options.includeHidden||t.visible!==false)).map(o=>({o,r:bounds(o)}));
 // Equal gaps are detected from pairs of stationary objects. Each proposed position yields a snap delta.
 for(let i=0;i<others.length;i++) for(let j=i+1;j<others.length;j++){
  const a=others[i], b=others[j];
  for(const axis of ['x','y'] as const){
   const a0=axis==='x'?a.r.x:a.r.y, a1=a0+(axis==='x'?a.r.width:a.r.height);
   const b0=axis==='x'?b.r.x:b.r.y, b1=b0+(axis==='x'?b.r.width:b.r.height);
   const ma0=axis==='x'?mr.x:mr.y, ma1=ma0+(axis==='x'?mr.width:mr.height);
   const crossA=axis==='x'?overlap(a.r.y,a.r.y+a.r.height,mr.y,mr.y+mr.height,8):overlap(a.r.x,a.r.x+a.r.width,mr.x,mr.x+mr.width,8);
   const crossB=axis==='x'?overlap(b.r.y,b.r.y+b.r.height,mr.y,mr.y+mr.height,8):overlap(b.r.x,b.r.x+b.r.width,mr.x,mr.x+mr.width,8);
   if(!crossA||!crossB) continue;
   // target lies between stationary objects: match the gap in either order
   const pairs=[{left:a1,right:b0,position:a0-(ma1-ma0)-(b0-a1)},{left:b1,right:a0,position:b1+(a0-b1)}].filter(p=>p.right>=p.left);
   for(const p of pairs){ const gap=p.right-p.left; const proposed0=p.position; const delta=proposed0-ma0;
    const guide:GuideLine={id:`spacing:${axis}:${a.o.id}:${b.o.id}`,axis,value:axis==='x'?mr.x+delta+mr.width/2:mr.y+delta+mr.height/2,start:axis==='x'?Math.min(a.r.y,b.r.y,mr.y):Math.min(a.r.x,b.r.x,mr.x),end:axis==='x'?Math.max(a.r.y+a.r.height,b.r.y+b.r.height,mr.y+mr.height):Math.max(a.r.x+a.r.width,b.r.x+b.r.width,mr.x+mr.width),kind:'spacing',sourceIds:[moving.id,a.o.id,b.o.id]};
    out.push({axis,delta,distance:Math.abs(delta),priority:3,guide,key:`spacing:${axis}:${a.o.id}:${b.o.id}`});
   }
  }
 }
 return out;
}
export function solveSmartGuides(moving:SmartObject, others:SmartObject[], viewportScale=1, canvas?:Rect, supplied:Partial<SmartGuideOptions>={}, stickyKeys:ReadonlySet<string>=new Set()):SnapResult {
 const options={...DEFAULT_OPTIONS,...supplied};
 if(!options.enabled) return {dx:0,dy:0,guides:[],measurements:[],snappedX:false,snappedY:false};
 const all=[...candidateSet(moving,others,canvas,options),...spacingCandidates(moving,others,canvas,options)];
 const tolerance=options.tolerancePx/Math.max(viewportScale,0.01), release=options.releaseTolerancePx/Math.max(viewportScale,0.01);
 const eligible=all.filter(c=>c.distance <= (stickyKeys.has(c.key)?release:tolerance));
 const pick=(axis:'x'|'y')=>eligible.filter(c=>c.axis===axis).sort((a,b)=>a.priority-b.priority || a.distance-b.distance)[0];
 const x=pick('x'), y=pick('y');
 const dx=options.snapping?(x?.delta??0):0, dy=options.snapping?(y?.delta??0):0;
 const active=[x,y].filter((v):v is Candidate=>!!v);
 const guides:GuideLine[]=[];
 for(const c of active){
  const g={...c.guide}; if(c.axis==='x'){g.value+=options.snapping?0:0;g.start-=Math.max(0,bounds(moving).y-g.start);}
  if(!guides.some(v=>v.axis===g.axis&&Math.abs(v.value-g.value)<0.01&&v.kind===g.kind)) guides.push(g);
 }
 // When multiple references support the same alignment, show each distinct line (e.g. shared center).
 const measurements:Measurement[]=[];
 if(options.showMeasurements){
  const mr=bounds({...moving,x:moving.x+dx,y:moving.y+dy});
  const refs=others.filter(o=>o.id!==moving.id&&(options.includeHidden||o.visible!==false)).map(o=>({o,r:bounds(o)}));
  for(const ref of refs){
   const r=ref.r;
   if(overlap(mr.y,mr.y+mr.height,r.y,r.y+r.height,0)){
    if(mr.x>=r.x+r.width) measurements.push({id:`gapx:${moving.id}:${ref.o.id}`,axis:'x',value:mr.x-(r.x+r.width),start:r.x+r.width,end:mr.x,label:fmt(mr.x-(r.x+r.width)),kind:'gap'});
    else if(r.x>=mr.x+mr.width) measurements.push({id:`gapx:${moving.id}:${ref.o.id}`,axis:'x',value:r.x-(mr.x+mr.width),start:mr.x+mr.width,end:r.x,label:fmt(r.x-(mr.x+mr.width)),kind:'gap'});
   }
   if(overlap(mr.x,mr.x+mr.width,r.x,r.x+r.width,0)){
    if(mr.y>=r.y+r.height) measurements.push({id:`gapy:${moving.id}:${ref.o.id}`,axis:'y',value:mr.y-(r.y+r.height),start:r.y+r.height,end:mr.y,label:fmt(mr.y-(r.y+r.height)),kind:'gap'});
    else if(r.y>=mr.y+mr.height) measurements.push({id:`gapy:${moving.id}:${ref.o.id}`,axis:'y',value:r.y-(mr.y+mr.height),start:mr.y+mr.height,end:r.y,label:fmt(r.y-(mr.y+mr.height)),kind:'gap'});
   }
  }
  if(canvas){ measurements.push({id:'canvas-x',axis:'x',value:mr.x,start:canvas.x,end:mr.x,label:fmt(mr.x-canvas.x),kind:'offset'},{id:'canvas-y',axis:'y',value:mr.y,start:canvas.y,end:mr.y,label:fmt(mr.y-canvas.y),kind:'offset'}); }
 }
 return {dx,dy,guides:guides.slice(0,options.maxGuidesPerAxis*2),measurements,snappedX:!!x&&options.snapping,snappedY:!!y&&options.snapping,debug:all};
}
