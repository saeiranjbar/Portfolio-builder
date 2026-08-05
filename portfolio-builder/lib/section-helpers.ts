import React from 'react';
import { SectionBackground, Theme, SocialLink } from './types';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaDribbble, FaBehance } from 'react-icons/fa';
import { Globe } from 'lucide-react';

// Social icon map with proper brand icons
export const socialIconMap: Record<string, React.ElementType> = {
  linkedin: FaLinkedin,
  github: FaGithub,
  twitter: FaTwitter,
  instagram: FaInstagram,
  dribbble: FaDribbble,
  behance: FaBehance,
  website: Globe,
};

export function getSocialIcon(platform: string): React.ElementType {
  return socialIconMap[platform] || Globe;
}

// Get the effective background color for a section
export function getSectionBackground(sectionBg: SectionBackground | undefined, theme: Theme): string {
  if (!sectionBg || sectionBg.type === 'theme' || !sectionBg.value) {
    return theme.colors.background;
  }
  if (sectionBg.type === 'color') {
    return sectionBg.value;
  }
  if (sectionBg.type === 'gradient') {
    return sectionBg.value;
  }
  // For image backgrounds, return the theme background as base
  return theme.colors.background;
}

// Get background style object for a section
export function getSectionBackgroundStyle(sectionBg: SectionBackground | undefined, theme: Theme): React.CSSProperties {
  if (!sectionBg || sectionBg.type === 'theme' || !sectionBg.value) {
    return { backgroundColor: theme.colors.background };
  }
  if (sectionBg.type === 'color') {
    return { backgroundColor: sectionBg.value };
  }
  if (sectionBg.type === 'gradient') {
    return { background: sectionBg.value };
  }
  if (sectionBg.type === 'image') {
    return {
      backgroundImage: `url(${sectionBg.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }
  return { backgroundColor: theme.colors.background };
}

// Get overlay style for image backgrounds
export function getOverlayStyle(sectionBg: SectionBackground | undefined): React.CSSProperties {
  if (sectionBg?.type === 'image' && sectionBg.overlayOpacity !== undefined && sectionBg.overlayOpacity > 0) {
    return {
      position: 'absolute',
      inset: 0,
      backgroundColor: `rgba(0, 0, 0, ${sectionBg.overlayOpacity / 100})`,
      pointerEvents: 'none',
    };
  }
  return {};
}

// Generate ID helper
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
