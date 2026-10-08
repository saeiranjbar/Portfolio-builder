'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { usePortfolioStore } from '@/lib/store';
import { getFlowBlocks, moveFlowBlock, sectionForFlowBlock, type FlowBlock } from '@/lib/flow-layout';
import type { HeroSection, PortfolioSection, TextStyles, Theme } from '@/lib/types';
import { HeroPdfReader } from './HeroPdfReader';
import { AnimatedText } from './AnimatedText';
import { TypingAnimation } from './TypingAnimation';
import { OptimizedImage } from './OptimizedImage';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface Props {
  sections: PortfolioSection[];
  theme: Theme;
  renderSection: (section: PortfolioSection) => React.ReactNode;
}

function textStyle(styles: TextStyles | undefined, key: string): React.CSSProperties {
  const style = Object.fromEntries(Object.entries(styles?.[key] ?? {}).filter(([name]) => !name.startsWith('animation')));
  return { ...style, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', maxWidth: '100%' };
}

function HeroContent({ block, theme, openImage }: { block: FlowBlock; theme: Theme; openImage: (url: string) => void }) {
  const section = block.section as HeroSection;
  const common = { color: theme.colors.text, ...textStyle(section.textStyles, block.key) };
  switch (block.key) {
    case 'avatar': return <OptimizedImage src={section.avatar} alt={section.name} width={section.avatarWidth ?? 120} height={section.avatarHeight ?? 120}
      className="mx-auto object-cover" style={{ width: section.avatarWidth ?? 120, height: section.avatarHeight ?? 120, maxWidth: '100%', borderRadius: section.avatarShape === 'square' ? 0 : section.avatarShape === 'rounded' ? 12 : '50%' }} />;
    case 'name': return <h1 className="text-center text-4xl font-bold" style={{ fontFamily: theme.typography.headingFont, ...common }}><AnimatedText text={section.name} textStyles={section.textStyles?.name} /></h1>;
    case 'title': return <h2 className="text-center text-2xl font-medium" style={common}>{section.typingWords?.length ? <TypingAnimation words={section.typingWords} /> : <AnimatedText text={section.title} textStyles={section.textStyles?.title} />}</h2>;
    case 'subtitle': return <p className="text-center text-lg" style={common}><AnimatedText text={section.subtitle} textStyles={section.textStyles?.subtitle} /></p>;
    case 'bio': return <p className="mx-auto text-center" style={{ ...common, maxWidth: section.textStyles?.bio?.maxWidth ?? 700 }}><AnimatedText text={section.bio} textStyles={section.textStyles?.bio} /></p>;
    case 'ctaButtons': return <div className="flex flex-wrap justify-center gap-3">{section.ctaButtons.map(button => <a key={button.id} href={button.link} className="rounded-lg border px-5 py-3 font-medium"
      style={{ borderColor: theme.colors.primary, color: button.variant === 'outline' ? theme.colors.primary : '#fff', background: button.variant === 'outline' ? 'transparent' : button.variant === 'secondary' ? theme.colors.secondary : theme.colors.primary }}>{button.label}</a>)}</div>;
    case 'pdf': return <HeroPdfReader section={{ ...section, pdf: section.pdf ? { ...section.pdf, offset: undefined } : undefined }} />;
    case 'galleryImages': return <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(4, section.galleryGridCols ?? 2))}, minmax(0, 1fr))` }}>{section.galleryImages?.map(image => <button key={image.id} type="button" onClick={() => openImage(image.url)} className="min-w-0 overflow-hidden rounded-lg text-left" aria-label={image.caption ? `Open ${image.caption}` : 'Open gallery image'}>
      <OptimizedImage src={image.url} alt={image.caption ?? 'Gallery image'} width={image.naturalWidth ?? 640} height={image.naturalHeight ?? 480} className="block h-auto w-full object-cover" />
      {image.caption && <span className="block py-2 text-sm">{image.caption}</span>}
    </button>)}</div>;
    case 'galleryVideos': return <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(3, section.galleryVideoGridCols ?? 1))}, minmax(0, 1fr))` }}>{section.galleryVideos?.map(video => <div key={video.id} className="aspect-video min-w-0 overflow-hidden rounded-lg">
      {video.type === 'uploaded' ? <video src={video.url} controls className="h-full w-full" /> : <iframe src={video.url} title={video.caption ?? 'Video'} allowFullScreen className="h-full w-full border-0" />}
    </div>)}</div>;
    default: return null;
  }
}


export function FlowPortfolio({ sections, theme, renderSection }: Props) {
  const { previewMode, reorderFlowComponents, selectSection, selectElement } = usePortfolioStore();
  const root = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const blocks = getFlowBlocks(sections);
  const baseIds = blocks.map(block => block.id);
  const [dragOrder, setDragOrder] = useState<string[] | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const drag = useRef<{ id: string; pointer: number; y: number; order: string[]; scroll: HTMLElement | null } | null>(null);
  const lookup = new Map(blocks.map(block => [block.id, block]));
  const orderedIds = dragOrder ? [...dragOrder.filter(id => lookup.has(id)), ...baseIds.filter(id => !dragOrder.includes(id))] : baseIds;

  const updateDrag = useCallback((y: number) => {
    const current = drag.current;
    if (!current) return;
    current.y = y;
    const others = current.order.filter(id => id !== current.id);
    let target = others.length;
    for (let index = 0; index < others.length; index++) {
      const rect = nodes.current.get(others[index])?.getBoundingClientRect();
      if (rect && y < rect.top + rect.height / 2) { target = index; break; }
    }
    const next = [...others]; next.splice(target, 0, current.id);
    if (next.some((id, index) => id !== current.order[index])) {
      current.order = next;
      setDragOrder(next);
    }
  }, []);

  useEffect(() => {
    if (!dragging) return;
    let frame: number;
    const scroll = () => {
      const current = drag.current;
      if (current?.scroll) {
        const box = current.scroll.getBoundingClientRect();
        const speed = current.y < box.top + 60 ? -14 : current.y > box.bottom - 60 ? 14 : 0;
        if (speed) { current.scroll.scrollTo({ top: current.scroll.scrollTop + speed, behavior: 'instant' }); updateDrag(current.y); }
      }
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [dragging, updateDrag]);

  function finish(commit: boolean) {
    const current = drag.current;
    drag.current = null;
    setDragging(null); setDragOrder(null);
    if (commit && current && current.order.some((id, index) => id !== baseIds[index])) reorderFlowComponents(current.order);
  }

  return <div ref={root} data-flow-layout data-flow-dragging={dragging ? 'true' : undefined} className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8"
    onPointerMove={event => { if (drag.current?.pointer === event.pointerId) updateDrag(event.clientY); }}
    onPointerUp={event => { if (drag.current?.pointer === event.pointerId) { finish(true); event.currentTarget.releasePointerCapture(event.pointerId); } }}
    onPointerCancel={() => finish(false)} onLostPointerCapture={() => { if (drag.current) finish(false); }}>
    {orderedIds.map(id => {
      const block = lookup.get(id)!;
      return <div key={id} ref={node => { if (node) nodes.current.set(id, node); else nodes.current.delete(id); }}
        data-flow-id={id} data-flow-section={block.section.id} data-flow-key={block.key} data-section-type={block.section.type}
        id={blocks.find(item => item.section.id === block.section.id)?.id === id ? `section-${block.section.id}` : undefined}
        className={`flow-component min-w-0 w-full [&_section]:min-h-0 [&_section]:py-4 ${dragging === id ? 'outline outline-2 outline-blue-500' : ''}`}
        onClick={!previewMode ? () => selectElement(block.section.id, block.key) : undefined}>
        {block.section.type === 'hero' ? <HeroContent block={block} theme={theme} openImage={setImage} />
          : block.key === 'title' ? <h2 className="text-center text-3xl font-bold" style={{ color: theme.colors.text, fontFamily: theme.typography.headingFont, ...textStyle(block.section.textStyles, 'title') }}><AnimatedText text={'title' in block.section ? block.section.title : ''} textStyles={block.section.textStyles?.title} /></h2>
          : renderSection(sectionForFlowBlock(block))}
      </div>;
    })}
    <span className="sr-only" aria-live="polite">{dragging ? 'Reordering components' : 'Components in page order'}</span>
    <Dialog open={!!image} onOpenChange={open => { if (!open) setImage(null); }}><DialogContent className="max-w-5xl"><DialogTitle>Gallery image</DialogTitle>{image && <OptimizedImage src={image} alt="Gallery image" width={1200} height={900} className="h-auto max-h-[80vh] w-full object-contain" />}</DialogContent></Dialog>
  </div>;
}
