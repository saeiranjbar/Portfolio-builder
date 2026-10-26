'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { HeroSection, AboutSection } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './ImageUploader';
import { GalleryUploader } from './GalleryUploader';
import { VideoUploader } from './VideoUploader';
import { CollapsibleSection } from './CollapsibleSection';
import { AnchorLinkInput } from './AnchorLinkInput';
import { TextStyleControls } from './TextStyleControls';
import { Type, Image as ImageIcon, Video, Briefcase, Trash2, Plus, X, Sparkles, Palette } from 'lucide-react';
import { SECTION_TEXT_FIELDS } from '@/lib/text-style-fields';
import { getElementDefinition } from '@/lib/element-registry';

interface ElementInspectorProps { onClose?: () => void; }

// Media/composite tiles carry no text of their own — no style controls for them.
const MEDIA_ELEMENT_KEYS = new Set(['pageHero', 'avatar', 'galleryImages', 'galleryVideos', 'image', 'secondImage', 'video', 'quickFacts', 'ctaButtons', 'skillBars']);

/**
 * Maps a canvas element key to the text-style field(s) its tile renders, using
 * the same registry keys the published renderer consumes via getTextStyle — so
 * every section type gets working style controls in focus mode. Heading tiles
 * expose title/subtitle/tagline; entry tiles (item-*, legacy exp-/edu-/...)
 * expose that type's entry fields; a whole-content tile exposes everything.
 */
function styleFieldsFor(sectionType: string, elementKey: string): { key: string; label: string }[] {
  const fields = (SECTION_TEXT_FIELDS as Record<string, { key: string; label: string }[]>)[sectionType] || [];
  if (!fields.length || MEDIA_ELEMENT_KEYS.has(elementKey)) return [];
  if (elementKey === 'title') return fields.filter(f => f.key === 'title' || f.key === 'subtitle' || f.key === 'tagline');
  if (elementKey === 'cta') return fields.filter(f => f.key === 'ctaButtonText');
  if (elementKey.startsWith('cat-')) return fields.filter(f => f.key.startsWith('skill'));
  const legacy = elementKey.match(/^(exp|edu|award|cert)-/);
  if (legacy) {
    const prefix = ({ exp: 'experience', edu: 'education', award: 'award', cert: 'cert' } as Record<string, string>)[legacy[1]];
    return fields.filter(f => f.key.startsWith(prefix));
  }
  if (elementKey === 'categoryContent') return fields;
  if (elementKey.startsWith('item-')) return fields.filter(f => f.key !== 'title' && f.key !== 'subtitle' && f.key !== 'tagline');
  const one = fields.find(f => f.key === elementKey);
  return one ? [one] : fields.filter(f => f.key !== 'title' && f.key !== 'subtitle' && f.key !== 'tagline');
}

export function ElementInspector({ onClose }: ElementInspectorProps) {
  const { portfolio, updateSection, selectedElementId, selectedElementSectionId } = usePortfolioStore();
  const section = portfolio.sections.find(s => s.id === selectedElementSectionId);
  if (!section || !selectedElementId) return null;
  // Hero/About render style controls inside their specialized branches when
  // the selected element is one of their registry text fields; everything
  // else (all remaining section types) gets the generic block below.
  const inlineStyleHandled = (section.type === 'hero' || section.type === 'about') &&
    ((SECTION_TEXT_FIELDS as Record<string, { key: string }[]>)[section.type] || []).some(f => f.key === selectedElementId);
  const styleFields = inlineStyleHandled ? [] : styleFieldsFor(section.type, selectedElementId);
  const styleBlock = styleFields.length > 0 && (
    <>
      {styleFields.map(f => (
        <TextStyleControls key={f.key} textStyles={(section as any).textStyles} fieldKey={f.key} fieldLabel={f.label} onUpdate={(ts) => updateSection(section.id, { textStyles: ts } as any)} />
      ))}
    </>
  );
  const renderInspector = () => {
    switch (section.type) {
      case 'hero': return <HeroElementInspector section={section as HeroSection} onUpdate={(u) => updateSection(section.id, u)} elementKey={selectedElementId} />;
      case 'about': return <AboutElementInspector section={section as AboutSection} onUpdate={(u) => updateSection(section.id, u)} elementKey={selectedElementId} />;
      default: return <GenericElementInspector section={section} onUpdate={(u) => updateSection(section.id, u)} elementKey={selectedElementId} />;
    }
  };
  return (<div className="p-3 space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-900">Edit Element</h3>{onClose && <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>}</div><div className="text-xs text-gray-500">Section: <span className="font-medium text-gray-700">{(section as any).name || section.type}</span><br/>Element: <span className="font-medium text-gray-700">{getElementDefinition(section.type, selectedElementId)?.label || selectedElementId}</span></div>{renderInspector()}{styleBlock}</div>);
}

interface HeroElementInspectorProps { section: HeroSection; onUpdate: (u: Partial<HeroSection>) => void; elementKey: string; }

function HeroElementInspector({ section, onUpdate, elementKey }: HeroElementInspectorProps) {
  const tf = SECTION_TEXT_FIELDS.hero.find(f => f.key === elementKey);
  if (elementKey === 'avatar') return (<div className="space-y-3"><CollapsibleSection title="Avatar Image" icon={ImageIcon}><ImageUploader value={section.avatar||''} onChange={u=>onUpdate({avatar:u})}/><div className="mt-3"><Label>Size</Label><select value={section.avatarSize||'medium'} onChange={e=>onUpdate({avatarSize:e.target.value as any})} className="w-full px-2 py-1 border rounded text-xs"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></div></CollapsibleSection></div>);
  if (elementKey === 'galleryImages') return (<div className="space-y-3"><CollapsibleSection title="Gallery Images" icon={ImageIcon}><GalleryUploader images={section.galleryImages||[]} onChange={u=>onUpdate({galleryImages:u})}/></CollapsibleSection></div>);
  if (elementKey === 'galleryVideos') return (<div className="space-y-3"><CollapsibleSection title="Gallery Videos" icon={Video}><VideoUploader videos={section.galleryVideos||[]} onChange={u=>onUpdate({galleryVideos:u})}/></CollapsibleSection></div>);
  if (elementKey === 'ctaButtons') return (<div className="space-y-3"><CollapsibleSection title="CTA Buttons" icon={Briefcase}>{(section.ctaButtons||[]).map((b,i)=><div key={b.id||i} className="p-2 border rounded space-y-1"><Input value={b.label} onChange={e=>{const n=[...(section.ctaButtons||[])];n[i]={...n[i],label:e.target.value};onUpdate({ctaButtons:n});}} placeholder="Label"/><AnchorLinkInput value={b.link} onChange={(v)=>{const n=[...(section.ctaButtons||[])];n[i]={...n[i],link:v};onUpdate({ctaButtons:n});}} placeholder="Link"/><Button variant="outline" size="sm" onClick={()=>{const n=(section.ctaButtons||[]).filter((_,x)=>x!==i);onUpdate({ctaButtons:n});}}><Trash2 className="w-3 h-3"/> Remove</Button></div>)}<Button variant="outline" size="sm" onClick={()=>{const n=[...(section.ctaButtons||[]),{id:Math.random().toString(36).substr(2,9),label:'Button',link:'#',variant:'primary' as const}];onUpdate({ctaButtons:n});}}><Plus className="w-3 h-3"/> Add</Button></CollapsibleSection></div>);
  if (tf) {
    const value = elementKey==='name'?section.name:elementKey==='title'?section.title:elementKey==='subtitle'?section.subtitle:section.bio||'';
    const InputOrTextarea = elementKey==='bio'?Textarea:Input;
    return (<div className="space-y-3"><div className="space-y-2"><Label className="text-xs text-gray-500">Content</Label><InputOrTextarea value={value} onChange={e=>onUpdate({[elementKey]:e.target.value} as any)} placeholder={tf.label} rows={elementKey==='bio'?4:undefined}/></div><TextStyleControls textStyles={section.textStyles} fieldKey={elementKey} fieldLabel="" onUpdate={u=>onUpdate({textStyles:u})}/></div>);
  }
  return <div className="text-sm text-gray-500">No editor</div>;
}

interface AboutElementInspectorProps { section: AboutSection; onUpdate: (u: Partial<AboutSection>) => void; elementKey: string; }

function AboutElementInspector({ section, onUpdate, elementKey }: AboutElementInspectorProps) {
  const tf = SECTION_TEXT_FIELDS.about.find(f => f.key === elementKey);
  if (elementKey === 'image') return (<div className="space-y-3"><CollapsibleSection title="Portrait Image" icon={ImageIcon}><ImageUploader value={section.imageUrl||''} onChange={u=>onUpdate({imageUrl:u})}/><div className="grid grid-cols-2 gap-2 mt-2"><div><Label className="text-xs">Width</Label><Input type="number" value={section.imageWidth||896} onChange={e=>onUpdate({imageWidth:parseInt(e.target.value)||896})}/></div><div><Label className="text-xs">Height</Label><Input type="number" value={section.imageHeight||300} onChange={e=>onUpdate({imageHeight:parseInt(e.target.value)||300})}/></div></div></CollapsibleSection></div>);
  if (elementKey === 'secondImage') return (<div className="space-y-3"><CollapsibleSection title="Second Image" icon={ImageIcon}><ImageUploader value={section.secondImageUrl||''} onChange={u=>onUpdate({secondImageUrl:u})}/><div className="grid grid-cols-2 gap-2 mt-2"><div><Label className="text-xs">Width</Label><Input type="number" value={section.secondImageWidth||300} onChange={e=>onUpdate({secondImageWidth:parseInt(e.target.value)||300})}/></div><div><Label className="text-xs">Height</Label><Input type="number" value={section.secondImageHeight||200} onChange={e=>onUpdate({secondImageHeight:parseInt(e.target.value)||200})}/></div></div></CollapsibleSection></div>);
  if (elementKey === 'quickFacts') return (<div className="space-y-3"><CollapsibleSection title="Quick Facts" icon={Sparkles}>{(section.quickFacts||[]).map((f,i)=><div key={f.id} className="p-2 border rounded space-y-1"><Input value={f.label} onChange={e=>{const n=[...(section.quickFacts||[])];n[i]={...n[i],label:e.target.value};onUpdate({quickFacts:n});}} placeholder="Label"/><Input value={f.value} onChange={e=>{const n=[...(section.quickFacts||[])];n[i]={...n[i],value:e.target.value};onUpdate({quickFacts:n});}} placeholder="Value"/><Button variant="outline" size="sm" onClick={()=>{const n=(section.quickFacts||[]).filter((_,x)=>x!==i);onUpdate({quickFacts:n});}}><Trash2 className="w-3 h-3"/> Remove</Button></div>)}<Button variant="outline" size="sm" onClick={()=>{const n=[...(section.quickFacts||[]),{id:Math.random().toString(36).substr(2,9),label:'Fact',value:'0+'}];onUpdate({quickFacts:n});}}><Plus className="w-3 h-3"/> Add</Button></CollapsibleSection></div>);
  if (elementKey === 'video') return (<div className="space-y-3"><CollapsibleSection title="Video" icon={Video}><Input value={section.videoUrl||''} onChange={e=>onUpdate({videoUrl:e.target.value})} placeholder="YouTube/Vimeo URL"/></CollapsibleSection></div>);
  if (elementKey === 'cta') return (<div className="space-y-3"><CollapsibleSection title="CTA Button" icon={Briefcase}><Input value={section.ctaButtonText||''} onChange={e=>onUpdate({ctaButtonText:e.target.value})} placeholder="Text"/><AnchorLinkInput value={section.ctaButtonLink||''} onChange={(v)=>onUpdate({ctaButtonLink:v})} placeholder="Link"/></CollapsibleSection></div>);
  if (tf) {
    const value = elementKey==='title'?section.title:elementKey==='tagline'?(section.tagline||''):section.content||'';
    const InputOrTextarea = elementKey==='content'||elementKey==='secondParagraph'||elementKey==='personalQuote'?Textarea:Input;
    return (<div className="space-y-3"><div className="space-y-2"><Label className="text-xs text-gray-500">Content</Label><InputOrTextarea value={value} onChange={e=>onUpdate({[elementKey]:e.target.value} as any)} placeholder={tf.label} rows={elementKey==='content'?6:elementKey==='personalQuote'?3:4}/></div><TextStyleControls textStyles={section.textStyles} fieldKey={elementKey} fieldLabel="" onUpdate={u=>onUpdate({textStyles:u})}/></div>);
  }
  return <div className="text-sm text-gray-500">No editor</div>;
}

interface GenericElementInspectorProps { section: any; onUpdate: (u: Partial<any>) => void; elementKey: string; }

function GenericElementInspector({ section, onUpdate, elementKey }: GenericElementInspectorProps) {
  if (elementKey === 'skillBars') return <SkillBarColorsPanel section={section} onUpdate={onUpdate} />;
  if (elementKey.startsWith('exp-')||elementKey.startsWith('edu-')||elementKey.startsWith('award-')||elementKey.startsWith('cert-')) {
    const parts = elementKey.split('-'), type = parts[0], idx = parseInt(parts[1]);
    const arr = section[type==='exp'?'experiences':type==='edu'?'education':type==='award'?'awards':'certifications'];
    if (!arr||!arr[idx]) return <div className="text-sm text-gray-500">Not found</div>;
    const item = arr[idx];
    return (<div className="space-y-3">{type==='exp'&&<><CollapsibleSection title="Position" icon={Briefcase}><Input value={item.position||''} onChange={e=>{const n=[...arr];n[idx]={...n[idx],position:e.target.value};onUpdate({experiences:n});}} placeholder="Position"/></CollapsibleSection><CollapsibleSection title="Company" icon={Briefcase}><Input value={item.company||''} onChange={e=>{const n=[...arr];n[idx]={...n[idx],company:e.target.value};onUpdate({experiences:n});}} placeholder="Company"/></CollapsibleSection></>}{type==='edu'&&<><CollapsibleSection title="Institution" icon={Briefcase}><Input value={item.institution||''} onChange={e=>{const n=[...arr];n[idx]={...n[idx],institution:e.target.value};onUpdate({education:n});}} placeholder="Institution"/></CollapsibleSection><CollapsibleSection title="Degree" icon={Briefcase}><Input value={item.degree||''} onChange={e=>{const n=[...arr];n[idx]={...n[idx],degree:e.target.value};onUpdate({education:n});}} placeholder="Degree"/></CollapsibleSection></>}{type==='award'&&<><CollapsibleSection title="Award" icon={Briefcase}><Input value={item.title||''} onChange={e=>{const n=[...arr];n[idx]={...n[idx],title:e.target.value};onUpdate({awards:n});}} placeholder="Title"/></CollapsibleSection><CollapsibleSection title="Org" icon={Briefcase}><Input value={item.organization||''} onChange={e=>{const n=[...arr];n[idx]={...n[idx],organization:e.target.value};onUpdate({awards:n});}} placeholder="Organization"/></CollapsibleSection></>}{type==='cert'&&<><CollapsibleSection title="Certification" icon={Briefcase}><Input value={item.name||''} onChange={e=>{const n=[...arr];n[idx]={...n[idx],name:e.target.value};onUpdate({certifications:n});}} placeholder="Name"/></CollapsibleSection><CollapsibleSection title="Issuer" icon={Briefcase}><Input value={item.issuer||''} onChange={e=>{const n=[...arr];n[idx]={...n[idx],issuer:e.target.value};onUpdate({certifications:n});}} placeholder="Issuer"/></CollapsibleSection></>}</div>);
  }
  if (elementKey.startsWith('cat-')) return <div className="text-sm text-gray-500">Edit in Skills panel</div>;
  return <div className="text-sm text-gray-500">Edit in section panel</div>;
}

// Focus-mode panel shown when a percentage bar/circle is clicked in the preview.
function SkillBarColorsPanel({ section, onUpdate }: { section: any; onUpdate: (u: Partial<any>) => void }) {
  const theme = usePortfolioStore((s) => s.portfolio.theme);
  const fill = section.barColor || theme.colors.primary;
  const track = section.barTrackColor || '#e5e7eb';
  const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v.trim());
  return (
    <div className="space-y-3">
      <CollapsibleSection title="Bar Fill Color" icon={Palette}>
        <div className="flex items-center gap-2">
          <input type="color" value={isHex(fill) ? fill : '#000000'} onChange={(e) => onUpdate({ barColor: e.target.value })} className="h-8 w-12 shrink-0 cursor-pointer rounded border bg-transparent" />
          <Input value={fill} onChange={(e) => onUpdate({ barColor: e.target.value })} className="text-xs" placeholder={theme.colors.primary} />
        </div>
        <p className="mt-1 text-[10px] text-gray-400">The colored part of the percentage bars. Defaults to the theme&apos;s primary color.</p>
      </CollapsibleSection>
      <CollapsibleSection title="Track Color" icon={Palette}>
        <div className="flex items-center gap-2">
          <input type="color" value={isHex(track) ? track : '#000000'} onChange={(e) => onUpdate({ barTrackColor: e.target.value })} className="h-8 w-12 shrink-0 cursor-pointer rounded border bg-transparent" />
          <Input value={track} onChange={(e) => onUpdate({ barTrackColor: e.target.value })} className="text-xs" placeholder="#e5e7eb" />
        </div>
        <p className="mt-1 text-[10px] text-gray-400">The empty remainder of each bar. Defaults to light gray.</p>
      </CollapsibleSection>
      {(section.barColor || section.barTrackColor) && (
        <Button variant="outline" size="sm" onClick={() => onUpdate({ barColor: undefined, barTrackColor: undefined })}><X className="w-3 h-3" /> Reset to theme colors</Button>
      )}
    </div>
  );
}
