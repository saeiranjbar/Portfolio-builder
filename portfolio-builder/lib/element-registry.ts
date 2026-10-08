import { SectionType } from './types';

export type ElementType = 'text' | 'image' | 'pdf' | 'gallery' | 'video' | 'entry' | 'button' | 'grid';

export interface ElementDefinition {
  label: string;
  type: ElementType;
  /** For text elements: the key used in section.textStyles */
  textKey?: string;
  /** For text elements: the section field holding the text content */
  contentField?: string;
  /** For text elements: the section field for show/hide toggle */
  showField?: string;
  /** For image elements: the section field holding the image URL */
  imageField?: string;
  /** For image elements: width/height field names */
  widthField?: string;
  heightField?: string;
  /** For entry elements: the array field name on the section */
  entryArray?: string;
  /** For entry elements: the index into the array */
  entryIndex?: number;
}

/**
 * Registry mapping (sectionType, elementKey) → element metadata.
 * Used by ElementInspector to render the correct controls for the
 * selected element.
 */
export function getElementDefinition(
  sectionType: SectionType,
  elementKey: string
): ElementDefinition | null {
  // --- Hero ---
  if (sectionType === 'hero') {
    switch (elementKey) {
      case 'avatar':   return { label: 'Avatar', type: 'image', imageField: 'avatar', showField: 'showAvatar' };
      case 'name':     return { label: 'Name', type: 'text', textKey: 'name', contentField: 'name', showField: 'showName' };
      case 'title':    return { label: 'Professional Title', type: 'text', textKey: 'title', contentField: 'title', showField: 'showTitle' };
      case 'subtitle': return { label: 'Subtitle', type: 'text', textKey: 'subtitle', contentField: 'subtitle', showField: 'showSubtitle' };
      case 'bio':      return { label: 'Bio', type: 'text', textKey: 'bio', contentField: 'bio', showField: 'showBio' };
      case 'ctaButtons': return { label: 'CTA Buttons', type: 'button' };
      case 'galleryImages': return { label: 'Gallery Images', type: 'gallery' };
      case 'galleryVideos': return { label: 'Gallery Videos', type: 'video' };
      case 'pdf':      return { label: 'PDF Reader', type: 'pdf' };
    }
  }

  // --- About ---
  if (sectionType === 'about') {
    switch (elementKey) {
      case 'title':       return { label: 'Section Title', type: 'text', textKey: 'title', contentField: 'title', showField: 'showTitle' };
      case 'tagline':     return { label: 'Tagline', type: 'text', textKey: 'tagline', contentField: 'tagline', showField: 'showTagline' };
      case 'bio':         return { label: 'Main Bio', type: 'text', textKey: 'content', contentField: 'content', showField: 'showBio' };
      case 'image':       return { label: 'Portrait Image', type: 'image', imageField: 'imageUrl', widthField: 'imageWidth', heightField: 'imageHeight', showField: 'showImage' };
      case 'secondImage': return { label: 'Second Image', type: 'image', imageField: 'secondImageUrl', widthField: 'secondImageWidth', heightField: 'secondImageHeight' };
      case 'quote':       return { label: 'Personal Quote', type: 'text', textKey: 'personalQuote', contentField: 'personalQuote', showField: 'showPersonalQuote' };
      case 'quickFacts':  return { label: 'Quick Facts', type: 'grid' };
      case 'video':       return { label: 'Video', type: 'video' };
      case 'cta':         return { label: 'CTA / Resume', type: 'button' };
    }
  }

  // --- Skills ---
  if (sectionType === 'skills') {
    if (elementKey === 'title') return { label: 'Section Title', type: 'text', textKey: 'title', contentField: 'title', showField: 'showTitle' };
    const catMatch = elementKey.match(/^cat-(\d+)$/);
    if (catMatch) return { label: `Skill Category ${parseInt(catMatch[1]) + 1}`, type: 'grid' };
  }

  // --- Experience ---
  if (sectionType === 'experience') {
    if (elementKey === 'title') return { label: 'Section Title', type: 'text', textKey: 'title', contentField: 'title', showField: 'showTitle' };
    const expMatch = elementKey.match(/^exp-(\d+)$/);
    if (expMatch) return { label: `Experience ${parseInt(expMatch[1]) + 1}`, type: 'entry', entryArray: 'experiences', entryIndex: parseInt(expMatch[1]) };
  }

  // --- Education ---
  if (sectionType === 'education') {
    if (elementKey === 'title') return { label: 'Section Title', type: 'text', textKey: 'title', contentField: 'title', showField: 'showTitle' };
    const eduMatch = elementKey.match(/^edu-(\d+)$/);
    if (eduMatch) return { label: `Education ${parseInt(eduMatch[1]) + 1}`, type: 'entry', entryArray: 'education', entryIndex: parseInt(eduMatch[1]) };
  }

  // --- Awards ---
  if (sectionType === 'awards') {
    if (elementKey === 'title') return { label: 'Section Title', type: 'text', textKey: 'title', contentField: 'title', showField: 'showTitle' };
    const awardMatch = elementKey.match(/^award-(\d+)$/);
    if (awardMatch) return { label: `Award ${parseInt(awardMatch[1]) + 1}`, type: 'entry', entryArray: 'awards', entryIndex: parseInt(awardMatch[1]) };
  }

  // --- Certifications ---
  if (sectionType === 'certifications') {
    if (elementKey === 'title') return { label: 'Section Title', type: 'text', textKey: 'title', contentField: 'title', showField: 'showTitle' };
    const certMatch = elementKey.match(/^cert-(\d+)$/);
    if (certMatch) return { label: `Certification ${parseInt(certMatch[1]) + 1}`, type: 'entry', entryArray: 'certifications', entryIndex: parseInt(certMatch[1]) };
  }

  // --- Generic free-form categories (projects, testimonials, etc.) ---
  if (elementKey === 'title') return { label: 'Section Title', type: 'text', textKey: 'title', contentField: 'title', showField: 'showTitle' };

  return null;
}
