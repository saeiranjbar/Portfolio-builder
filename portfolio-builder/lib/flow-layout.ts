import type { PortfolioSection } from './types';
import { pdfSource } from './hero-pdf';

export interface FlowBlock {
  id: string;
  section: PortfolioSection;
  key: string;
  label: string;
}

export function flowId(sectionId: string, key: string): string {
  return JSON.stringify([sectionId, key]);
}

/** Source sections keep their content; only component ranks change on a move. */
export function getFlowBlocks(sections: PortfolioSection[]): FlowBlock[] {
  const blocks: FlowBlock[] = [];
  for (const section of sections) {
    if (section.visible === false) continue;
    const add = (key: string, label: string, visible = true) => {
      if (visible) blocks.push({ id: flowId(section.id, key), section, key, label });
    };
    if (section.type === 'hero') {
      add('avatar', 'Hero · Avatar', section.showAvatar !== false && !!section.avatar);
      add('name', 'Hero · Name', section.showName !== false);
      add('title', 'Hero · Title', section.showTitle !== false);
      add('subtitle', 'Hero · Subtitle', section.showSubtitle !== false && !!section.subtitle);
      add('bio', 'Hero · Bio', section.showBio !== false && !!section.bio);
      add('ctaButtons', 'Hero · Buttons', !!section.ctaButtons?.length);
      add('pdf', 'Hero · PDF reader', !!section.showPdf && !!pdfSource(section.pdf?.url));
      add('galleryImages', 'Hero · Photo grid', !!section.galleryImages?.length);
      add('galleryVideos', 'Hero · Video grid', !!section.galleryVideos?.length);
    } else if (section.type === 'about') {
      add('title', 'About · Title', section.showTitle !== false);
      add('tagline', 'About · Tagline', section.showTagline !== false && !!section.tagline);
      add('image', 'About · Image', section.showImage !== false && !!section.imageUrl);
      add('bio', 'About · Bio', section.showBio !== false && !!section.content);
      add('secondParagraph', 'About · Second paragraph', section.showSecondParagraph !== false && !!section.secondParagraph);
      add('secondImage', 'About · Second image', !!section.secondImageUrl);
      add('quote', 'About · Quote', section.showPersonalQuote !== false && !!section.personalQuote);
      add('quickFacts', 'About · Quick facts', section.showQuickFacts !== false && !!section.quickFacts?.length);
      add('toolTags', 'About · Tools', section.showToolTags !== false && !!section.toolTags?.length);
      add('location', 'About · Location', section.showLocation !== false && !!(section.location || section.availabilityStatus));
      add('video', 'About · Video', section.showVideo !== false && !!section.videoUrl);
      add('resume', 'About · Resume', section.showResume !== false && !!section.resumeUrl);
      add('cta', 'About · Button', section.showCTA !== false && !!section.ctaButtonText);
      add('languages', 'About · Languages', section.showLanguages !== false && !!section.languages?.length);
      add('gallery', 'About · Photo grid', section.showGallery !== false && !!section.galleryImages?.length);
    } else if (section.type === 'skills') {
      add('title', 'Skills · Title', section.showTitle !== false);
      for (const category of new Set(section.skills.map(skill => skill.category))) add(`category:${category}`, `Skills · ${category}`);
    } else {
      const lists = {
        experience: 'experiences', education: 'educations', awards: 'awards', certifications: 'certifications',
      } as const;
      const list = lists[section.type as keyof typeof lists];
      if (list) {
        const data = section as unknown as Record<string, unknown>;
        add('title', `${section.type} · Title`, data.showTitle !== false);
        for (const item of (data[list] as { id: string }[]) ?? []) add(`item:${item.id}`, `${section.type} · Item`);
      } else {
        const data = section as unknown as Record<string, unknown>;
        add('title', `${section.type} · Title`, typeof data.title === 'string' && data.showTitle !== false);
        add('content', `${section.type} · Content`);
      }
    }
  }
  // New components appear after ranked components. Hidden ranks remain stored.
  return blocks.map((block, index) => ({ block, index, rank: block.section.flowOrder?.[block.key] }))
    .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity) || a.index - b.index)
    .map(item => item.block);
}

export function moveFlowBlock(ids: string[], active: string, over: string): string[] {
  const from = ids.indexOf(active), to = ids.indexOf(over);
  if (from < 0 || to < 0 || from === to) return ids;
  const next = [...ids];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

export function rankFlowBlocks(sections: PortfolioSection[], ids: string[]): PortfolioSection[] {
  const known = new Map(getFlowBlocks(sections).map(block => [block.id, block]));
  const unique = [...new Set(ids)].filter(id => known.has(id));
  const included = new Set(unique);
  let cursor = 0;
  // Sidebar-only components keep their slots when the body supplies a subset.
  const complete = [...known.keys()].map(id => included.has(id) ? unique[cursor++] : id);
  const ranks = new Map(complete.map((id, index) => [id, index]));
  return sections.map(section => {
    const order = { ...section.flowOrder };
    for (const [id, block] of known) if (block.section.id === section.id) order[block.key] = ranks.get(id)!;
    return { ...section, flowOrder: order };
  });
}

export function sectionForFlowBlock(block: FlowBlock): PortfolioSection {
  const original = block.section;
  const section = { ...original, freeFormEnabled: false, elementPositions: undefined };
  if (block.key === 'content') return 'title' in original ? { ...section, showTitle: false } as PortfolioSection : section;
  if (original.type === 'about') {
    const flags = ['showTitle', 'showTagline', 'showBio', 'showSecondParagraph', 'showPersonalQuote', 'showImage', 'showQuickFacts', 'showToolTags', 'showLocation', 'showCTA', 'showResume', 'showVideo', 'showLanguages', 'showGallery'];
    const active: Record<string, string> = { title: 'showTitle', tagline: 'showTagline', bio: 'showBio', secondParagraph: 'showSecondParagraph', quote: 'showPersonalQuote', image: 'showImage', quickFacts: 'showQuickFacts', toolTags: 'showToolTags', location: 'showLocation', cta: 'showCTA', resume: 'showResume', video: 'showVideo', languages: 'showLanguages', gallery: 'showGallery' };
    const changes: Record<string, unknown> = Object.fromEntries(flags.map(flag => [flag, flag === active[block.key]]));
    if (block.key !== 'secondImage') changes.secondImageUrl = '';
    if (block.key !== 'secondParagraph') changes.secondParagraph = '';
    if (block.key === 'secondParagraph') { changes.content = ''; changes.showBio = true; }
    return { ...section, ...changes } as PortfolioSection;
  }
  if (original.type === 'skills' && block.key.startsWith('category:')) {
    return { ...section, showTitle: false, skills: original.skills.filter(skill => skill.category === block.key.slice(9)) } as PortfolioSection;
  }
  const list: Record<string, string> = { experience: 'experiences', education: 'educations', awards: 'awards', certifications: 'certifications' };
  const field = list[original.type];
  if (field) {
    const items = (original as unknown as Record<string, unknown>)[field] as { id: string }[];
    return { ...section, showTitle: false, [field]: items.filter(item => item.id === block.key.slice(5)) } as PortfolioSection;
  }
  return section;
}
