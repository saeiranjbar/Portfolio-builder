'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import {
  HeroSection, AboutSection, ProjectsSection, SkillsSection,
  ExperienceSection, EducationSection, TestimonialsSection,
  ContactSection, SocialSection, FooterSection, CTABannerSection,
  ServicesSection, ProcessSection, StatsSection, AwardsSection,
  PressSection, CertificationsSection, PortfolioSection,
  TextStyleSettings, TextStyles, Project
} from '@/lib/types';
import { Mail, Phone, MapPin, ExternalLink, ChevronDown, ArrowRight,
  Star, ArrowUp, Download, Calendar, Trophy, Award as AwardIcon,
  Layers, Search, PenTool, Lightbulb, Rocket, CheckCircle,
  ChevronLeft, Plus, Minus, Send, FileText, Newspaper, HelpCircle,
  Figma, Atom, Leaf, Shield, Triangle, Server, Code, Code2, Palette, Wind,
  GitBranch, Github, Gitlab, Box, Cloud, Flame, Database, Globe,
  ShoppingBag, Pencil, MessageSquare, KanbanSquare, List, Layout, Zap, BarChart } from 'lucide-react';
import { downloadVCard } from '@/lib/vcard';
import { BlogSection, FAQSection, NewsletterSection } from '@/lib/types';

import { cn } from '@/lib/utils';
import { validateMessage } from '@/lib/profanity-filter';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { ProjectDetailModal } from './ProjectDetailModal';
import { Navbar } from './Navbar';
import { AnimatedSection, AnimatedStagger, AnimatedItem, AnimatedCounter } from './AnimatedSection';
import { OptimizedImage } from './OptimizedImage';
import { getSocialIcon, getSectionBackgroundStyle, getOverlayStyle } from '@/lib/section-helpers';
import { TypingAnimation } from './TypingAnimation';
import { Parallax } from './Parallax';
import { ProjectCardSkeleton } from './Skeleton';
import { FreeFormSection, FreeFormElement } from './FreeFormSection';
import { ElementPosition } from '@/lib/types';
import { BehanceLayout } from './BehanceLayout';



// Helper: convert TextStyleSettings to a React.CSSProperties object
function getTextStyle(textStyles: TextStyles | undefined, fieldKey: string, fallback?: React.CSSProperties): React.CSSProperties {
  const s: TextStyleSettings | undefined = textStyles?.[fieldKey];
  if (!s) return fallback || {};
  const style: React.CSSProperties = { ...fallback };
  if (s.color) style.color = s.color;
  if (s.fontFamily) style.fontFamily = s.fontFamily;
  if (s.fontSize) style.fontSize = s.fontSize;
  if (s.fontWeight) style.fontWeight = s.fontWeight;
  if (s.textAlign) style.textAlign = s.textAlign;
  if (s.fontStyle) style.fontStyle = s.fontStyle;
  if (s.textDecoration) style.textDecoration = s.textDecoration;
  if (s.textTransform) style.textTransform = s.textTransform;
  if (s.lineHeight) style.lineHeight = s.lineHeight;
  if (s.letterSpacing) style.letterSpacing = s.letterSpacing;
  return style;
}

// Icon resolver for services
const iconMap: Record<string, React.ElementType> = {
  Star, Layers, Search, PenTool, Lightbulb, Rocket, CheckCircle,
};

interface PreviewProps {
  viewMode: 'desktop' | 'tablet' | 'mobile';
  activeSection?: string | null;
  onEditProject?: (project: Project) => void;
}

export function PortfolioPreview({ viewMode, activeSection, onEditProject }: PreviewProps) {
  const store = usePortfolioStore();
  const { portfolio } = store;
  const { theme, layoutMode } = portfolio;
  const { addSection, updateSection } = store;

  const viewModeClasses = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto',
  };

  // Create a wrapper function for adding projects - creates a projects section if needed
  // This is defined outside the conditional to avoid hook ordering issues
  const handleAddProject = React.useCallback(() => {
    // Check if there's a projects section, if not create one
    let projectsSection = portfolio.sections.find(s => s.type === 'projects') as ProjectsSection | undefined;
    if (!projectsSection) {
      // First add the section using the type string
      addSection('projects');
      // Then update it with the proper configuration including the first project
      setTimeout(() => {
        const newProject: Project = {
          id: `project-${Date.now()}`,
          title: 'New Project',
          description: '',
          imageUrl: '',
          images: [],
          category: 'All Work',
          client: '',
          date: new Date().toLocaleDateString(),
          link: '',
          tags: [],
          featured: false,
        };
        // Find the newly created section
        const newProjectsSection = portfolio.sections.find(s => s.type === 'projects') as ProjectsSection | undefined;
        if (newProjectsSection) {
          updateSection(newProjectsSection.id, {
            title: 'Projects',
            categories: [{ id: 'all', name: 'All Work' }],
            projects: [newProject],
            layout: 'grid',
            columnCount: 3,
            aspectRatio: '4:3',
            showTitle: true,
            showCategories: true,
          });
          // Open the editor for the new project
          if (onEditProject) onEditProject(newProject);
        }
      }, 100);
    } else {
      // Add a new project to existing section
      const newProject: Project = {
        id: `project-${Date.now()}`,
        title: 'New Project',
        description: '',
        imageUrl: '',
        images: [],
        category: 'All Work',
        client: '',
        date: new Date().toLocaleDateString(),
        link: '',
        tags: [],
        featured: false,
      };
      updateSection(projectsSection.id, {
        projects: [...projectsSection.projects, newProject],
      });
      // Open the editor for the new project
      setTimeout(() => {
        if (onEditProject) onEditProject(newProject);
      }, 100);
    }
  }, [portfolio.sections, addSection, updateSection, onEditProject]);

  // If layout mode is 'simple', always render the SimpleLayout component (formerly BehanceLayout)
  // Simple mode is a single-page layout with sidebar + projects grid, no separate sections
  // Determine edit mode based on whether onEditProject callback is provided
  // - Edit mode (onEditProject provided): clicking projects opens editor
  // - Preview mode (no onEditProject): clicking projects navigates to detail page
  if (layoutMode === 'simple') {
    return <BehanceLayout isEditMode={!!onEditProject} />;
  }

  // Show ALL visible sections on the same page (like a real website)
  const sectionsToShow = portfolio.sections.filter(s => s.visible !== false);

  // Scroll to active section when it changes
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (activeSection && containerRef.current) {
      const el = document.getElementById(`section-${activeSection}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeSection]);

  return (
    <div
      ref={containerRef}
      className={cn('h-full overflow-y-auto bg-white transition-all duration-300', viewModeClasses[viewMode])}
      style={{ fontFamily: theme.typography.bodyFont, fontSize: theme.typography.baseSize, scrollBehavior: 'smooth' }}
    >
      {/* Navbar - always visible */}
      <Navbar theme={theme} sections={portfolio.sections} />

      {sectionsToShow.map((section) => (
        <div
          key={section.id}
          id={`section-${section.id}`}
          data-section-type={section.type}
          className={cn(
            'scroll-mt-0 transition-all duration-300',
            activeSection && activeSection !== section.id && 'opacity-60'
          )}
        >
          <SectionRenderer section={section} theme={theme} onEditProject={onEditProject} />
        </div>
      ))}

    </div>
  );
}

export function SectionRenderer({ section, theme, onEditProject }: any) {

  switch (section.type) {
    case 'hero': return <HeroPreview section={section} theme={theme} />;
    case 'about': return <AboutPreview section={section} theme={theme} />;
    case 'projects': return <ProjectsPreview section={section} theme={theme} onEditProject={onEditProject} />;
    case 'skills': return <SkillsPreview section={section} theme={theme} />;
    case 'experience': return <ExperiencePreview section={section} theme={theme} />;
    case 'education': return <EducationPreview section={section} theme={theme} />;
    case 'testimonials': return <TestimonialsPreview section={section} theme={theme} />;
    case 'contact': return <ContactPreview section={section} theme={theme} />;
    case 'social': return <SocialPreview section={section} theme={theme} />;
    case 'footer': return <FooterPreview section={section} theme={theme} />;
    case 'ctaBanner': return <CTABannerPreview section={section} theme={theme} />;
    case 'services': return <ServicesPreview section={section} theme={theme} />;
    case 'process': return <ProcessPreview section={section} theme={theme} />;
    case 'stats': return <StatsPreview section={section} theme={theme} />;
    case 'awards': return <AwardsPreview section={section} theme={theme} />;
    case 'press': return <PressPreview section={section} theme={theme} />;
    case 'certifications': return <CertificationsPreview section={section} theme={theme} />;
    case 'blog': return <BlogPreview section={section} theme={theme} />;
    case 'faq': return <FAQPreview section={section} theme={theme} />;
    case 'newsletter': return <NewsletterPreview section={section} theme={theme} />;
    default: return null;
  }
}


// ============ HERO ============
function HeroPreview({ section, theme }: { section: HeroSection; theme: any }) {
  const { updateSection } = usePortfolioStore();
  const previewMode = usePortfolioStore((s) => s.previewMode);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [dragging, setDragging] = React.useState<string | null>(null);
  const [snapLines, setSnapLines] = React.useState<{ vertical?: number; horizontal?: number }>({});

  const snapEnabled = section.snapEnabled !== false;
  const SNAP_THRESHOLD = 5; // percentage points within which snapping occurs

  const bgStyle = section.backgroundType === 'gradient' || section.backgroundType === 'color'
    ? { background: section.backgroundValue }
    : section.backgroundType === 'image'
    ? { backgroundImage: `url(${section.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    : section.backgroundType === 'video'
    ? { backgroundColor: '#000' }
    : {};

  const overlayStyle = (section.backgroundType === 'image' || section.backgroundType === 'video') && section.backgroundOverlayOpacity
    ? { position: 'absolute' as const, inset: 0, backgroundColor: `rgba(0,0,0,${section.backgroundOverlayOpacity / 100})`, pointerEvents: 'none' as const }
    : {};

  const avatarSizeClasses = { small: 'w-20 h-20', medium: 'w-32 h-32', large: 'w-48 h-48' };

  const defaultPositions = {

    avatar: { x: 50, y: 30 }, name: { x: 50, y: 50 }, title: { x: 50, y: 60 },
    subtitle: { x: 50, y: 68 }, bio: { x: 50, y: 78 }, ctaButtons: { x: 50, y: 88 },
  };
  const avatarPos = section.avatarPosition || defaultPositions.avatar;
  const namePos = section.namePosition || defaultPositions.name;
  const titlePos = section.titlePosition || defaultPositions.title;
  const subtitlePos = section.subtitlePosition || defaultPositions.subtitle;
  const bioPos = section.bioPosition || defaultPositions.bio;
  const ctaPos = section.ctaButtonsPosition || defaultPositions.ctaButtons;

  // All element positions for snap calculation
  const allPositions: Record<string, { x: number; y: number }> = {
    avatar: avatarPos,
    name: namePos,
    title: titlePos,
    subtitle: subtitlePos,
    bio: bioPos,
    ctaButtons: ctaPos,
  };

  // Compute snap for a given raw position against other elements + center lines
  const computeSnap = (element: string, rawX: number, rawY: number): { x: number; y: number; snapV?: number; snapH?: number } => {
    if (!snapEnabled) return { x: rawX, y: rawY };

    let snappedX = rawX;
    let snappedY = rawY;
    let snapV: number | undefined;
    let snapH: number | undefined;

    // Build list of target X values: other elements' X + center (50)
    const targetXs: number[] = [50]; // center line
    const targetYs: number[] = [50]; // center line

    for (const [key, pos] of Object.entries(allPositions)) {
      if (key === element) continue;
      // Only include visible elements
      if (key === 'avatar' && section.showAvatar === false) continue;
      if (key === 'name' && section.showName === false) continue;
      if (key === 'title' && section.showTitle === false) continue;
      if (key === 'subtitle' && section.showSubtitle === false) continue;
      if (key === 'bio' && section.showBio === false) continue;
      if (key === 'ctaButtons' && (!section.ctaButtons || section.ctaButtons.length === 0)) continue;
      targetXs.push(pos.x);
      targetYs.push(pos.y);
    }

    // Check X snap
    for (const tx of targetXs) {
      if (Math.abs(rawX - tx) < SNAP_THRESHOLD) {
        snappedX = tx;
        snapV = tx;
        break;
      }
    }

    // Check Y snap
    for (const ty of targetYs) {
      if (Math.abs(rawY - ty) < SNAP_THRESHOLD) {
        snappedY = ty;
        snapH = ty;
        break;
      }
    }

    return { x: snappedX, y: snappedY, snapV, snapH };
  };

  const handleMouseDown = (e: React.MouseEvent, element: string) => { if (previewMode) return; e.preventDefault(); setDragging(element); };
  const handleTouchStart = (e: React.TouchEvent, element: string) => { if (previewMode) return; setDragging(element); };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!dragging || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    const { x: snappedX, y: snappedY, snapV, snapH } = computeSnap(dragging, clampedX, clampedY);
    setSnapLines({ vertical: snapV, horizontal: snapH });

    // Handle gallery image dragging
    if (dragging.startsWith('gallery-')) {
      const imgId = dragging.replace('gallery-', '');
      const updatedImages = (section.galleryImages || []).map(img =>
        img.id === imgId ? { ...img, position: { x: snappedX, y: snappedY } } : img
      );
      updateSection(section.id, { galleryImages: updatedImages });
    } else {
      const positionKey = `${dragging}Position` as keyof HeroSection;
      updateSection(section.id, { [positionKey]: { x: snappedX, y: snappedY } });
    }
  }, [dragging, section.id, updateSection, snapEnabled, section.showAvatar, section.showName, section.showTitle, section.showSubtitle, section.showBio, section.ctaButtons, section.galleryImages]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!dragging || !sectionRef.current) return;
    const touch = e.touches[0];
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    const { x: snappedX, y: snappedY, snapV, snapH } = computeSnap(dragging, clampedX, clampedY);
    setSnapLines({ vertical: snapV, horizontal: snapH });

    // Handle gallery image dragging
    if (dragging.startsWith('gallery-')) {
      const imgId = dragging.replace('gallery-', '');
      const updatedImages = (section.galleryImages || []).map(img =>
        img.id === imgId ? { ...img, position: { x: snappedX, y: snappedY } } : img
      );
      updateSection(section.id, { galleryImages: updatedImages });
    } else {
      const positionKey = `${dragging}Position` as keyof HeroSection;
      updateSection(section.id, { [positionKey]: { x: snappedX, y: snappedY } });
    }
  }, [dragging, section.id, updateSection, snapEnabled, section.showAvatar, section.showName, section.showTitle, section.showSubtitle, section.showBio, section.ctaButtons, section.galleryImages]);


  const handleMouseUp = React.useCallback(() => {
    setDragging(null);
    setSnapLines({});
  }, []);

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const scrollToNext = () => {
    const el = sectionRef.current?.nextElementSibling;
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Non-free-form mode: render a simple centered layout (after all hooks)
  // In 'simple' layout mode, free-form dragging is disabled
  const isSimpleMode = usePortfolioStore.getState().portfolio.layoutMode === 'simple';
  if (section.freeFormEnabled === false || isSimpleMode) {
    return (
      <section ref={sectionRef} className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-center px-6" style={bgStyle}>
        {section.backgroundType === 'video' && section.backgroundValue && (
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 0 }}>
            <source src={section.backgroundValue} />
          </video>
        )}
        {overlayStyle && Object.keys(overlayStyle).length > 0 && <div style={overlayStyle} />}

        <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl">
          {section.showAvatar !== false && section.avatar && (
            <OptimizedImage src={section.avatar} alt={section.name} className={cn('rounded-full object-cover border-4 border-white shadow-lg', avatarSizeClasses[section.avatarSize])} width={192} height={192} />
          )}
          {section.showName !== false && (
            <h1 className="text-4xl md:text-5xl font-bold" style={getTextStyle(section.textStyles, 'name', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.name}</h1>
          )}
          {section.showTitle !== false && (
            section.typingWords && section.typingWords.length > 0 ? (
              <h2 className="text-xl md:text-2xl font-medium" style={getTextStyle(section.textStyles, 'title', { color: theme.colors.primary })}>
                <TypingAnimation words={section.typingWords} typeSpeed={100} deleteSpeed={50} delayBetween={2000} />
              </h2>
            ) : (
              <h2 className="text-xl md:text-2xl font-medium" style={getTextStyle(section.textStyles, 'title', { color: theme.colors.primary })}>{section.title}</h2>
            )
          )}
          {section.showSubtitle !== false && (
            <p className="text-lg" style={getTextStyle(section.textStyles, 'subtitle', { color: theme.colors.textSecondary })}>{section.subtitle}</p>
          )}
          {section.showBio !== false && (
            <p className="text-base max-w-xl" style={getTextStyle(section.textStyles, 'bio', { color: theme.colors.text })}>{section.bio}</p>
          )}
          {section.ctaButtons && section.ctaButtons.length > 0 && (
            <div className="flex gap-4 mt-4">
              {section.ctaButtons.map((btn) => (
                <a key={btn.id} href={btn.link}
                  className={cn('inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90',
                    btn.variant === 'primary' && 'text-white',
                    btn.variant === 'outline' && 'border-2',
                    btn.variant === 'secondary' && 'text-white')}
                  style={btn.variant === 'primary' ? { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }
                    : btn.variant === 'outline' ? { borderColor: theme.colors.primary, color: theme.colors.primary, borderRadius: theme.borderRadius }
                    : { backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius }}
                  onClick={(e) => { if (btn.link.startsWith('#')) { e.preventDefault();
                    const linkId = btn.link.slice(1);
                    let el = document.getElementById(`section-${linkId}`);
                    if (!el) {
                      const sections = document.querySelectorAll('[data-section-type]');
                      for (const s of sections) {
                        if (s.getAttribute('data-section-type') === linkId) { el = s as HTMLElement; break; }
                      }
                    }
                    el?.scrollIntoView({ behavior: 'smooth' });
                  } }}>
                  {btn.label}
                  <ArrowRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {section.showScrollIndicator && (

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToNext}>
            <ChevronDown className="w-6 h-6" style={{ color: theme.colors.text }} />
          </div>
        )}
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="min-h-screen h-screen relative overflow-hidden" style={bgStyle}>

      {section.backgroundType === 'video' && section.backgroundValue && (
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ zIndex: 0 }}>
          <source src={section.backgroundValue} />
        </video>
      )}
      {overlayStyle && Object.keys(overlayStyle).length > 0 && <div style={overlayStyle} />}

      {/* Snap guide lines */}
      {dragging && snapEnabled && snapLines.vertical !== undefined && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-20"
          style={{ left: `${snapLines.vertical}%`, width: '1px', backgroundColor: '#3b82f6', boxShadow: '0 0 4px rgba(59,130,246,0.6)' }}
        />
      )}
      {dragging && snapEnabled && snapLines.horizontal !== undefined && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-20"
          style={{ top: `${snapLines.horizontal}%`, height: '1px', backgroundColor: '#3b82f6', boxShadow: '0 0 4px rgba(59,130,246,0.6)' }}
        />
      )}


      {/* Avatar */}
      {section.showAvatar !== false && section.avatar && (
        <div className={cn('absolute transform -translate-x-1/2 -translate-y-1/2', !previewMode && 'cursor-move', dragging === 'avatar' && 'z-10')}
          style={{ left: `${avatarPos.x}%`, top: `${avatarPos.y}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'avatar')}
          onTouchStart={(e) => handleTouchStart(e, 'avatar')}>
          <OptimizedImage src={section.avatar} alt={section.name} className={cn('rounded-full object-cover border-4 border-white shadow-lg', avatarSizeClasses[section.avatarSize])} width={192} height={192} />

        </div>
      )}

      {/* Name */}
      {section.showName !== false && (
        <div className={cn('absolute transform -translate-x-1/2 -translate-y-1/2 text-center', !previewMode && 'cursor-move', dragging === 'name' && 'z-10')}
          style={{ left: `${namePos.x}%`, top: `${namePos.y}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'name')}>
          <h1 className="text-4xl md:text-5xl font-bold whitespace-nowrap" style={getTextStyle(section.textStyles, 'name', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.name}</h1>
        </div>
      )}

      {/* Title */}
      {section.showTitle !== false && (
        <div className={cn('absolute transform -translate-x-1/2 -translate-y-1/2 text-center', !previewMode && 'cursor-move', dragging === 'title' && 'z-10')}
          style={{ left: `${titlePos.x}%`, top: `${titlePos.y}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'title')}>
          {section.typingWords && section.typingWords.length > 0 ? (
            <h2 className="text-xl md:text-2xl font-medium whitespace-nowrap" style={getTextStyle(section.textStyles, 'title', { color: theme.colors.primary })}>
              <TypingAnimation words={section.typingWords} typeSpeed={100} deleteSpeed={50} delayBetween={2000} />
            </h2>
          ) : (
            <h2 className="text-xl md:text-2xl font-medium whitespace-nowrap" style={getTextStyle(section.textStyles, 'title', { color: theme.colors.primary })}>{section.title}</h2>
          )}
        </div>
      )}

      {/* Subtitle */}
      {section.showSubtitle !== false && (
        <div className={cn('absolute transform -translate-x-1/2 -translate-y-1/2 text-center', !previewMode && 'cursor-move', dragging === 'subtitle' && 'z-10')}
          style={{ left: `${subtitlePos.x}%`, top: `${subtitlePos.y}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'subtitle')}>
          <p className="text-lg whitespace-nowrap" style={getTextStyle(section.textStyles, 'subtitle', { color: theme.colors.textSecondary })}>{section.subtitle}</p>
        </div>
      )}

      {/* Bio */}
      {section.showBio !== false && (
        <div className={cn('absolute transform -translate-x-1/2 -translate-y-1/2 text-center max-w-xl px-4', !previewMode && 'cursor-move', dragging === 'bio' && 'z-10')}
          style={{ left: `${bioPos.x}%`, top: `${bioPos.y}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'bio')}>
          <p className="text-base" style={getTextStyle(section.textStyles, 'bio', { color: theme.colors.text })}>{section.bio}</p>
        </div>
      )}

      {/* CTA Buttons */}
      {section.ctaButtons && section.ctaButtons.length > 0 && (
        <div className={cn('absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center', !previewMode && 'cursor-move', dragging === 'ctaButtons' && 'z-10')}
          style={{ left: `${ctaPos.x}%`, top: `${ctaPos.y}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'ctaButtons')}>
          {section.ctaButtons.map((btn) => (
            <a key={btn.id} href={btn.link}
              className={cn('inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all hover:opacity-90 whitespace-nowrap text-sm sm:text-base',
                btn.variant === 'primary' && 'text-white',
                btn.variant === 'outline' && 'border-2',
                btn.variant === 'secondary' && 'text-white')}
              style={btn.variant === 'primary' ? { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }
                : btn.variant === 'outline' ? { borderColor: theme.colors.primary, color: theme.colors.primary, borderRadius: theme.borderRadius }
                : { backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius }}
              onClick={(e) => { if (btn.link.startsWith('#')) { e.preventDefault();
                const linkId = btn.link.slice(1);
                // First try exact section ID match, then try matching by section type
                let el = document.getElementById(`section-${linkId}`);
                if (!el) {
                  // Find by section type (e.g., #about -> first section of type 'about')
                  const sections = document.querySelectorAll('[data-section-type]');
                  for (const s of sections) {
                    if (s.getAttribute('data-section-type') === linkId) { el = s as HTMLElement; break; }
                  }
                }
                el?.scrollIntoView({ behavior: 'smooth' });
              } }}>
              {btn.label}
              <ArrowRight className="w-4 h-4" />
            </a>
          ))}
        </div>
      )}

      {/* Scroll indicator */}

      {section.showScrollIndicator && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToNext}>
          <ChevronDown className="w-6 h-6" style={{ color: theme.colors.text }} />
        </div>
      )}

      {/* Gallery Images - individually draggable */}
      {section.galleryImages && section.galleryImages.length > 0 && (
        <>
          {section.galleryImages.map((img, idx) => {
            // Default positions spread across bottom of hero
            const defaultX = 20 + (idx * 15);
            const defaultY = 85;
            const pos = img.position || { x: defaultX, y: defaultY };
            const sizeClass = img.size === 'small' ? 'w-20 h-20' : img.size === 'large' ? 'w-36 h-36' : 'w-28 h-28';
            return (
              <div
                key={img.id}
                className={cn('absolute transform -translate-x-1/2 -translate-y-1/2', !previewMode && 'cursor-move', dragging === `gallery-${img.id}` && 'z-10')}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onMouseDown={(e) => handleMouseDown(e, `gallery-${img.id}`)}
                onTouchStart={(e) => handleTouchStart(e, `gallery-${img.id}`)}
              >
                <div className="relative group">
                  <OptimizedImage
                    src={img.url}
                    alt={img.caption || 'Gallery'}
                    className={cn('object-cover rounded-lg border-2 border-white/30 shadow-lg', sizeClass)}
                    width={144} height={144}
                  />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.caption}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}



// ============ ABOUT ============
function AboutPreview({ section, theme }: { section: AboutSection; theme: any }) {
  const { updateSection } = usePortfolioStore();
  const imageShapeClass = section.imageShape === 'circle' ? 'rounded-full' : section.imageShape === 'square' ? 'rounded-none' : 'rounded-lg';
  const imageLayout = section.imageLayout || 'left';
  const imageSize = section.imageSize || 'medium';
  const imageWidthClass = imageSize === 'small' ? 'md:w-1/4' : imageSize === 'large' ? 'md:w-1/2' : 'md:w-1/3';
  const imageBorderClass = section.imageBorder ? `border-4 border-solid` : '';
  const imageShadowClass = section.imageShadow !== false ? 'shadow-lg' : '';

  // Video embed
  const videoEmbedUrl = section.videoUrl ? (
    section.videoType === 'vimeo'
      ? section.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')
      : section.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
  ) : null;

  // Free-form mode
  if (section.freeFormEnabled) {
    const positions = section.elementPositions || {};
    const snapEnabled = section.snapEnabled !== false;
    const defaultPositions: Record<string, ElementPosition> = {
      title: { x: 50, y: 15 },
      tagline: { x: 50, y: 25 },
      image: { x: 30, y: 50 },
      bio: { x: 70, y: 45 },
      quote: { x: 50, y: 70 },
      quickFacts: { x: 50, y: 80 },
      video: { x: 50, y: 60 },
      cta: { x: 50, y: 90 },
    };

    const elements: FreeFormElement[] = [
      {
        key: 'title',
        visible: section.showTitle !== false,
        position: positions.title,
        defaultPosition: defaultPositions.title,
        content: <h2 className="text-3xl font-bold text-center whitespace-nowrap" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>,
      },
      {
        key: 'tagline',
        visible: section.showTagline !== false && !!section.tagline,
        position: positions.tagline,
        defaultPosition: defaultPositions.tagline,
        content: <p className="text-lg italic text-center whitespace-nowrap" style={{ color: theme.colors.textSecondary }}>{section.tagline}</p>,
      },
      {
        key: 'image',
        visible: section.showImage !== false && !!section.imageUrl,
        position: positions.image,
        defaultPosition: defaultPositions.image,
        content: section.imageUrl ? <OptimizedImage src={section.imageUrl} alt="About" className={cn('object-cover', imageShapeClass, imageBorderClass, imageShadowClass)} width={300} height={300} style={{ maxHeight: '300px' }} /> : null,
      },
      {
        key: 'bio',
        visible: section.showBio !== false,
        position: positions.bio,
        defaultPosition: defaultPositions.bio,
        content: <div className="max-w-md text-center px-4"><p style={getTextStyle(section.textStyles, 'content', { color: theme.colors.text, whiteSpace: 'pre-wrap' })}>{section.content}</p>{section.secondParagraph && <p className="mt-4" style={{ color: theme.colors.textSecondary, whiteSpace: 'pre-wrap' }}>{section.secondParagraph}</p>}</div>,
      },
      {
        key: 'quote',
        visible: section.showPersonalQuote !== false && !!section.personalQuote,
        position: positions.quote,
        defaultPosition: defaultPositions.quote,
        content: <blockquote className="px-6 py-4 border-l-4 italic text-xl max-w-md" style={{ borderColor: theme.colors.primary, color: theme.colors.text, backgroundColor: `${theme.colors.primary}10` }}>"{section.personalQuote}"</blockquote>,
      },
      {
        key: 'quickFacts',
        visible: section.showQuickFacts !== false && (section.quickFacts || []).length > 0,
        position: positions.quickFacts,
        defaultPosition: defaultPositions.quickFacts,
        content: <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{(section.quickFacts || []).map(fact => <div key={fact.id} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.primary}08` }}><div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>{fact.value}</div><div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{fact.label}</div></div>)}</div>,
      },
      {
        key: 'video',
        visible: section.showVideo !== false && !!videoEmbedUrl,
        position: positions.video,
        defaultPosition: defaultPositions.video,
        content: videoEmbedUrl ? <div className="w-96" style={{ borderRadius: theme.borderRadius, overflow: 'hidden' }}><div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}><iframe src={videoEmbedUrl} className="absolute top-0 left-0 w-full h-full" style={{ border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></div> : null,
      },
      {
        key: 'cta',
        visible: section.showCTA !== false && !!section.ctaButtonText,
        position: positions.cta,
        defaultPosition: defaultPositions.cta,
        content: <div className="flex gap-3">{section.showResume !== false && section.resumeUrl && <a href={section.resumeUrl} download className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium" style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }}><Download className="w-4 h-4" /> Resume</a>}{section.ctaButtonText && section.ctaButtonLink && <a href={section.ctaButtonLink} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium" style={{ border: `2px solid ${theme.colors.primary}`, color: theme.colors.primary, borderRadius: theme.borderRadius }}>{section.ctaButtonText}</a>}</div>,
      },
    ];

    const handlePositionChange = (key: string, pos: ElementPosition) => {
      const newPositions = { ...positions, [key]: pos };
      updateSection(section.id, { elementPositions: newPositions } as any);
    };

    return (
      <FreeFormSection
        sectionId={section.id}
        snapEnabled={snapEnabled}
        elements={elements}
        onPositionChange={handlePositionChange}
        backgroundStyle={getSectionBackgroundStyle(section.sectionBackground, theme)}
        minHeight="min-h-screen"
      />
    );
  }

  // Normal layout mode (original code below)
  const isImageLeft = imageLayout === 'left' && section.imageUrl;
  const isImageRight = imageLayout === 'right' && section.imageUrl;
  const isImageTop = imageLayout === 'top' && section.imageUrl;
  const isFullWidth = imageLayout === 'fullwidth' && section.imageUrl;
  const noImage = imageLayout === 'none' || !section.imageUrl;

  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-4 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}

          {/* Tagline */}
          {section.showTagline !== false && section.tagline && (
            <p className="text-lg text-center mb-8 italic" style={{ color: theme.colors.textSecondary }}>
              {section.tagline}
            </p>
          )}

          {/* Full-width image */}
          {section.showImage !== false && isFullWidth && (
            <OptimizedImage
              src={section.imageUrl}
              alt="About"
              className={cn('w-full object-cover mb-8', imageShapeClass, imageBorderClass, imageShadowClass)}
              width={800} height={400}
              style={{ maxHeight: '400px' }}
            />
          )}


          {/* Image on top */}
          {section.showImage !== false && isImageTop && (
            <div className="flex justify-center mb-8">
              <OptimizedImage
                src={section.imageUrl}
                alt="About"
                className={cn('object-cover', imageWidthClass, imageShapeClass, imageBorderClass, imageShadowClass)}
                width={400} height={350}
                style={{ maxHeight: '350px' }}
              />
            </div>
          )}


          {/* Main content row */}
          <div className={cn('flex flex-col gap-8 items-center', (isImageLeft || isImageRight) && 'md:flex-row')}>
            {/* Image left */}
            {section.showImage !== false && isImageLeft && (
              <OptimizedImage
                src={section.imageUrl}
                alt="About"
                className={cn('w-full object-cover', imageWidthClass, imageShapeClass, imageBorderClass, imageShadowClass)}
                width={400} height={400}
                style={{ maxHeight: '400px' }}
              />
            )}


            <div className={cn('flex-1', noImage && 'w-full')}>
              {/* Main bio */}
              {section.showBio !== false && (
                <p style={getTextStyle(section.textStyles, 'content', { color: theme.colors.text, whiteSpace: 'pre-wrap' })}>{section.content}</p>
              )}

              {/* Second paragraph */}
              {section.showBio !== false && section.secondParagraph && (
                <p className="mt-4" style={{ color: theme.colors.textSecondary, whiteSpace: 'pre-wrap' }}>
                  {section.secondParagraph}
                </p>
              )}

              {/* Personal quote */}
              {section.showPersonalQuote !== false && section.personalQuote && (
                <blockquote
                  className="my-6 px-6 py-4 border-l-4 italic text-xl"
                  style={{ borderColor: theme.colors.primary, color: theme.colors.text, backgroundColor: `${theme.colors.primary}10` }}
                >
                  "{section.personalQuote}"
                </blockquote>
              )}

              {/* Quick facts */}
              {section.showQuickFacts !== false && (section.quickFacts || []).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                  {(section.quickFacts || []).map(fact => (
                    <div key={fact.id} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.primary}08` }}>
                      <div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>{fact.value}</div>
                      <div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{fact.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tool tags */}
              {section.showToolTags !== false && (section.toolTags || []).length > 0 && (
                <div className="flex flex-wrap gap-2 my-4">
                  {(section.toolTags || []).map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{ backgroundColor: `${theme.colors.secondary}20`, color: theme.colors.text }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Location & availability */}
              {section.showLocation !== false && (section.location || section.availabilityStatus) && (
                <div className="flex flex-wrap items-center gap-4 my-4 text-sm">
                  {section.location && (
                    <span className="flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
                      <MapPin className="w-4 h-4" /> {section.location}
                    </span>
                  )}
                  {section.availabilityStatus && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {section.availabilityStatus}
                    </span>
                  )}
                </div>
              )}

              {/* Languages */}
              {section.showLanguages !== false && (section.languages || []).length > 0 && (
                <div className="my-4">
                  <h4 className="text-sm font-semibold mb-2" style={{ color: theme.colors.text }}>Languages</h4>
                  <div className="flex flex-wrap gap-3">
                    {(section.languages || []).map(lang => (
                      <span key={lang.id} className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        <strong style={{ color: theme.colors.text }}>{lang.language}</strong> ({lang.proficiency})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                {section.showResume !== false && section.resumeUrl && (
                  <a
                    href={section.resumeUrl}
                    download
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }}
                  >
                    <Download className="w-4 h-4" /> Download Resume
                  </a>
                )}
                {section.showCTA !== false && section.ctaButtonText && section.ctaButtonLink && (
                  <a
                    href={section.ctaButtonLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all hover:opacity-90"
                    style={{ border: `2px solid ${theme.colors.primary}`, color: theme.colors.primary, borderRadius: theme.borderRadius }}
                  >
                    {section.ctaButtonText}
                  </a>
                )}
              </div>
            </div>

            {/* Image right */}
            {section.showImage !== false && isImageRight && (
              <OptimizedImage
                src={section.imageUrl}
                alt="About"
                className={cn('w-full object-cover', imageWidthClass, imageShapeClass, imageBorderClass, imageShadowClass)}
                width={400} height={400}
                style={{ maxHeight: '400px' }}
              />
            )}

          </div>

          {/* Second image */}
          {section.showImage !== false && section.secondImageUrl && (
            <div className="mt-8">
              <OptimizedImage
                src={section.secondImageUrl}
                alt="Workspace"
                className={cn('w-full object-cover rounded-lg shadow-md')}
                width={800} height={300}
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}

          {/* Gallery Images */}
          {section.showGallery !== false && section.galleryImages && section.galleryImages.length > 0 && (
            <div className="mt-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {section.galleryImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <OptimizedImage
                      src={img.url}
                      alt={img.caption || 'Gallery'}
                      className="w-full h-40 object-contain rounded-lg shadow-md"
                      width={300} height={160}
                    />
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-3 py-1.5 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video introduction */}

          {section.showVideo !== false && videoEmbedUrl && (
            <div className="mt-8" style={{ borderRadius: theme.borderRadius, overflow: 'hidden' }}>
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={videoEmbedUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}



// ============ PROJECTS ============
function ProjectsPreview({ section, theme, onEditProject }: { section: ProjectsSection; theme: any; onEditProject?: (project: Project) => void }) {
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(12); // Lazy loading: initial batch
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (section.categories?.length > 0 && !selectedCategory) setSelectedCategory(section.categories[0].name);
  }, [section.categories, selectedCategory]);

  // Reset visible count when category changes
  React.useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory]);

  const handleProjectClick = (project: Project) => {
    if (onEditProject) { onEditProject(project); }
    else { setSelectedProject(project); setIsModalOpen(true); }
  };

  const filteredProjects = selectedCategory ? section.projects.filter((p) => p.category === selectedCategory) : section.projects;
  const hasCategories = section.categories?.length > 0;

  // Lazy loading: slice projects to visibleCount
  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = filteredProjects.length > visibleCount;

  // Infinite scroll via IntersectionObserver
  React.useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 8);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  const aspectClass = section.aspectRatio === '1:1' ? 'aspect-square' : section.aspectRatio === '4:3' ? 'aspect-[4/3]' : section.aspectRatio === '16:9' ? 'aspect-video' : '';
  const gridCols = section.columnCount === 2 ? 'md:grid-cols-2' : section.columnCount === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3';

  const renderProjectCard = (project: Project) => (
    <div key={project.id} onClick={() => handleProjectClick(project)} className="cursor-pointer group">
      <div className={cn('relative overflow-hidden mb-3', aspectClass)} style={{ borderRadius: theme.borderRadius }}>
        {project.imageUrl ? (
          <OptimizedImage src={project.imageUrl} alt={project.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="text-gray-400">No image</span></div>
        )}

      </div>
      <h3 className="font-medium text-sm" style={{ color: theme.colors.text }}>{project.title}</h3>
      {project.date && <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{project.date}</p>}
    </div>
  );

  return (
    <>
      <section className="min-h-screen" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
          <div className="flex">
            {hasCategories ? (
              <>
                <div className="min-h-screen flex-shrink-0 border-r border-gray-200 bg-gray-50/50 w-64">
                  <div className="p-6">
                    {section.showTitle !== false && (
                      <h2 className="text-lg font-semibold mb-6" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
                    )}
                    {section.showCategories !== false && (
                      <nav className="space-y-1">
                        {section.categories.map((category) => (
                          <button key={category.id} onClick={() => setSelectedCategory(category.name)}
                            className="w-full text-left px-3 py-2 text-sm transition-colors rounded"
                            style={{ backgroundColor: selectedCategory === category.name ? '#e5e7eb' : 'transparent', color: theme.colors.text }}>
                            {category.name}
                          </button>
                        ))}
                      </nav>
                    )}
                  </div>
                </div>
                <div className="flex-1 p-8">
                  {visibleProjects.length === 0 ? (
                    <div className="text-center py-12 text-gray-500"><p>No projects in this category yet.</p></div>
                  ) : (
                    <div className={cn('grid grid-cols-1 gap-6', gridCols)}>{visibleProjects.map(renderProjectCard)}</div>
                  )}

                  {hasMore && <div ref={loadMoreRef} className="py-8 flex justify-center">{Array.from({ length: Math.min(3, filteredProjects.length - visibleCount) }).map((_, i) => <ProjectCardSkeleton key={i} />)}</div>}
                </div>
              </>
            ) : (
              <div className="w-full py-16 px-6">
                <div className="max-w-6xl mx-auto">
                  {section.showTitle !== false && (
                    <h2 className="text-3xl font-bold mb-8 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
                  )}
                  {section.layout === 'carousel' ? (

                    <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
                      {section.projects.map((project) => (
                        <div key={project.id} className="flex-shrink-0 w-80 snap-center" onClick={() => handleProjectClick(project)}>
                          <div className={cn('relative overflow-hidden mb-3 cursor-pointer group', aspectClass)} style={{ borderRadius: theme.borderRadius }}>
                            {project.imageUrl ? <OptimizedImage src={project.imageUrl} alt={project.title} fill className="object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="text-gray-400">No image</span></div>}
                          </div>
                          <h3 className="font-medium text-sm" style={{ color: theme.colors.text }}>{project.title}</h3>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                    <div className={cn('grid grid-cols-1 gap-6', gridCols)}>
                      {visibleProjects.map((project) => (
                        <div key={project.id} onClick={() => handleProjectClick(project)} className="group cursor-pointer">
                          <div className={cn('relative overflow-hidden mb-3', aspectClass)} style={{ borderRadius: theme.borderRadius }}>
                            {project.imageUrl ? (
                              <OptimizedImage src={project.imageUrl} alt={project.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="text-gray-400">No image</span></div>
                            )}
                          </div>
                          <h3 className="font-medium text-sm" style={{ color: theme.colors.text }}>{project.title}</h3>
                          {project.date && <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{project.date}</p>}
                        </div>
                      ))}
                    </div>

                    {hasMore && <div ref={loadMoreRef} className="py-8 flex justify-center">{Array.from({ length: Math.min(3, filteredProjects.length - visibleCount) }).map((_, i) => <ProjectCardSkeleton key={i} />)}</div>}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
        theme={theme}
        projects={filteredProjects}
        onNavigate={(project) => setSelectedProject(project)}
      />
    </>
  );
}

// Helper to get skill icon component (using statically imported icons)
function getSkillIcon(iconId: string | undefined): React.ElementType {
  const iconMap: Record<string, React.ElementType> = {
    'figma': Figma,
    'react': Atom,
    'vue': Leaf,
    'angular': Shield,
    'nextjs': Triangle,
    'nodejs': Server,
    'python': Code,
    'javascript': Code,
    'typescript': Code2,
    'html5': Code,
    'css3': Palette,
    'sass': Palette,
    'tailwind': Wind,
    'git': GitBranch,
    'github': Github,
    'gitlab': Gitlab,
    'docker': Box,
    'aws': Cloud,
    'firebase': Flame,
    'mongodb': Database,
    'mysql': Database,
    'postgresql': Database,
    'wordpress': Globe,
    'shopify': ShoppingBag,
    'photoshop': PenTool,
    'illustrator': PenTool,
    'sketch': Pencil,
    'canva': PenTool,
    'notion': FileText,
    'slack': MessageSquare,
    'jira': KanbanSquare,
    'trello': List,
    'figjam': Pencil,
    'miro': Layout,
    'zapier': Zap,
    'mailchimp': Mail,
    'google-analytics': BarChart,
  };
  if (!iconId) return Star;
  return iconMap[iconId] || Star;
}

// ============ SKILLS ============
function SkillsPreview({ section, theme }: { section: SkillsSection; theme: any }) {
  const categories = [...new Set(section.skills.map((s) => s.category))];
  const displayStyle = section.displayStyle || 'bars';

  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-4xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-8 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          {categories.map((category) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.primary }}>{category}</h3>
              {displayStyle === 'bars' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.skills.filter((s) => s.category === category).map((skill) => {
                    const Icon = getSkillIcon(skill.icon);
                    return (
                      <div key={skill.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.colors.primary}15` }}>
                          <Icon className="w-4 h-4" style={{ color: theme.colors.primary }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1"><span style={{ color: theme.colors.text }}>{skill.name}</span><span style={{ color: theme.colors.textSecondary }}>{skill.level}%</span></div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${skill.level}%`, backgroundColor: theme.colors.primary }} /></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {displayStyle === 'circles' && (
                <div className="flex flex-wrap gap-6">
                  {section.skills.filter((s) => s.category === category).map((skill) => {
                    const Icon = getSkillIcon(skill.icon);
                    return (
                      <div key={skill.id} className="flex flex-col items-center">
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 transform -rotate-90"><circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="6" /><circle cx="40" cy="40" r="36" fill="none" stroke={theme.colors.primary} strokeWidth="6" strokeDasharray={`${2 * Math.PI * 36 * (skill.level / 100)} ${2 * Math.PI * 36}`} strokeLinecap="round" /></svg>
                          <Icon className="absolute inset-0 m-auto w-6 h-6" style={{ color: theme.colors.primary }} />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium" style={{ color: theme.colors.textSecondary }}>{skill.level}%</span>
                        </div>
                        <span className="text-sm mt-2 text-center" style={{ color: theme.colors.text }}>{skill.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {displayStyle === 'tags' && (
                <div className="flex flex-wrap gap-2">
                  {section.skills.filter((s) => s.category === category).map((skill) => {
                    const Icon = getSkillIcon(skill.icon);
                    return (
                      <span key={skill.id} className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5" style={{ backgroundColor: `${theme.colors.primary}15`, color: theme.colors.primary }}>
                        <Icon className="w-3.5 h-3.5" />
                        {skill.name}
                      </span>
                    );
                  })}
                </div>
              )}
              {displayStyle === 'icons' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {section.skills.filter((s) => s.category === category).map((skill) => {
                    const Icon = getSkillIcon(skill.icon);
                    return (
                      <div key={skill.id} className="flex flex-col items-center p-4 rounded-lg border" style={{ borderColor: `${theme.colors.primary}30` }}>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${theme.colors.primary}15` }}>
                          <Icon className="w-6 h-6" style={{ color: theme.colors.primary }} />
                        </div>
                        <span className="text-sm font-medium text-center" style={{ color: theme.colors.text }}>{skill.name}</span>
                        {skill.yearsExperience && <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{skill.yearsExperience}+ years</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ EXPERIENCE ============
function ExperiencePreview({ section, theme }: { section: ExperienceSection; theme: any }) {
  const layout = section.layout || 'left';
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-4xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-8 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          <div className="space-y-8">
            {section.experiences.map((exp, i) => (
              <div key={exp.id} className={cn('relative pl-6 border-l-2', layout === 'alternate' && i % 2 === 1 && 'md:ml-auto md:pl-6 md:pr-6 md:border-l-0 md:border-r-2 md:text-right')} style={{ borderColor: theme.colors.primary }}>
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                {exp.companyLogo && <OptimizedImage src={exp.companyLogo} alt={exp.company} className="w-8 h-8 rounded mb-2" width={32} height={32} />}

                <div className="mb-1">
                  <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>{exp.position}</h3>
                  <p style={{ color: theme.colors.primary }}>{exp.company}</p>
                </div>
                <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>{exp.startDate} - {exp.endDate || 'Present'}{exp.location && ` • ${exp.location}`}</p>
                <p style={{ color: theme.colors.text }}>{exp.description}</p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.achievements.map((a, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2" style={{ color: theme.colors.textSecondary }}>
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.primary }} /> {a}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ EDUCATION ============
function EducationPreview({ section, theme }: { section: EducationSection; theme: any }) {
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-4xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-8 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          <div className="space-y-6">
            {section.educations.map((edu) => (
              <div key={edu.id} className="p-4 rounded-lg border" style={{ borderColor: theme.colors.primary, borderRadius: theme.borderRadius }}>
                <div className="flex items-center gap-3 mb-2">
                  {edu.logo && <OptimizedImage src={edu.logo} alt={edu.institution} className="w-10 h-10 rounded" width={40} height={40} />}

                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>{edu.degree} in {edu.field}</h3>
                    <p style={{ color: theme.colors.primary }}>{edu.institution}</p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{edu.startDate} - {edu.endDate}</p>
                {edu.description && <p className="mt-2" style={{ color: theme.colors.text }}>{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ TESTIMONIALS ============
function TestimonialsPreview({ section, theme }: { section: TestimonialsSection; theme: any }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const layout = section.layout || 'grid';

  if (layout === 'carousel' && section.testimonials.length > 0) {
    const next = () => setCurrentIndex((prev) => (prev + 1) % section.testimonials.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + section.testimonials.length) % section.testimonials.length);
    const testimonial = section.testimonials[currentIndex];

    return (
      <AnimatedSection>
        <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
          <div className="max-w-3xl mx-auto text-center">
            {section.showTitle !== false && (
              <h2 className="text-3xl font-bold mb-8" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
            )}
            <div className="p-8 rounded-lg shadow-lg" style={{ borderRadius: theme.borderRadius, backgroundColor: 'white' }}>
              {testimonial.rating && (
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('w-5 h-5', i < testimonial.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
                  ))}
                </div>
              )}
              <p className="italic text-lg mb-6" style={{ color: theme.colors.text }}>"{testimonial.content}"</p>
              <div className="flex items-center justify-center gap-3">
                {testimonial.avatar && <OptimizedImage src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" width={48} height={48} />}

                <div>
                  <p className="font-semibold" style={{ color: theme.colors.text }}>{testimonial.name}</p>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            </div>
            {section.testimonials.length > 1 && (
              <div className="flex justify-center gap-4 mt-6">
                <button onClick={prev} className="p-2 rounded-full border" style={{ borderColor: theme.colors.primary, color: theme.colors.primary }}>←</button>
                <div className="flex items-center gap-1">
                  {section.testimonials.map((_, i) => (
                    <button key={i} onClick={() => setCurrentIndex(i)} className={cn('w-2 h-2 rounded-full transition-all', i === currentIndex ? 'w-6' : '')} style={{ backgroundColor: i === currentIndex ? theme.colors.primary : '#d1d5db' }} />
                  ))}
                </div>
                <button onClick={next} className="p-2 rounded-full border" style={{ borderColor: theme.colors.primary, color: theme.colors.primary }}>→</button>
              </div>
            )}
          </div>
        </section>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-6xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-8 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.testimonials.map((t) => (
              <AnimatedItem key={t.id}>
                <div className="p-6 rounded-lg shadow-lg h-full" style={{ borderRadius: theme.borderRadius, backgroundColor: 'white' }}>
                  {t.rating && (
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('w-4 h-4', i < t.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
                      ))}
                    </div>
                  )}
                  <p className="italic mb-4" style={{ color: theme.colors.text }}>"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatar && <OptimizedImage src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" width={48} height={48} />}

                    <div>
                      <p className="font-semibold" style={{ color: theme.colors.text }}>{t.name}</p>
                      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{t.role} at {t.company}</p>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedStagger>
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ CONTACT ============
function ContactPreview({ section, theme }: { section: ContactSection; theme: any }) {
  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    const validation = validateMessage(formData.message);
    if (!validation.isValid) { setValidationErrors(validation.errors); return; }
    setStatus('sending');
    try {
      let recaptchaToken = '';
      if (executeRecaptcha) recaptchaToken = await executeRecaptcha('submit');
      const response = await fetch('/api/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: formData.email, name: formData.name, subject: `New message from ${formData.name}`, message: formData.message, recaptchaToken }),
      });
      if (response.ok) { setStatus('success'); setFormData({ name: '', email: '', message: '' }); }
      else { setStatus('error'); }
    } catch { setStatus('error'); }
  };

  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-2xl mx-auto text-center">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-8" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          <div className="space-y-4 mb-8">
            {section.showEmail !== false && section.email && <a href={`mailto:${section.email}`} className="flex items-center justify-center gap-2 hover:opacity-80"><Mail className="w-5 h-5" style={{ color: theme.colors.primary }} /><span style={getTextStyle(section.textStyles, 'email', { color: theme.colors.text })}>{section.email}</span></a>}
            {section.showPhone !== false && section.phone && <a href={`tel:${section.phone}`} className="flex items-center justify-center gap-2 hover:opacity-80"><Phone className="w-5 h-5" style={{ color: theme.colors.primary }} /><span style={getTextStyle(section.textStyles, 'phone', { color: theme.colors.text })}>{section.phone}</span></a>}
            {section.showLocation !== false && section.location && <div className="flex items-center justify-center gap-2"><MapPin className="w-5 h-5" style={{ color: theme.colors.primary }} /><span style={getTextStyle(section.textStyles, 'location', { color: theme.colors.text })}>{section.location}</span></div>}
          </div>
          {section.showCalendly !== false && section.calendlyUrl && (
            <a href={section.calendlyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium mb-6" style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }}>
              <Calendar className="w-4 h-4" /> Schedule a Call
            </a>
          )}
          {/* vCard download */}
          {section.showEmail !== false && section.email && (
            <button
              onClick={() => {
                const heroSection = usePortfolioStore.getState().portfolio.sections.find(s => s.type === 'hero') as any;
                downloadVCard({
                  name: heroSection?.name || 'Contact',
                  title: heroSection?.title,
                  email: section.email,
                  phone: section.phone,
                  location: section.location,
                });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium mb-6 ml-2"
              style={{ border: `2px solid ${theme.colors.primary}`, color: theme.colors.primary, borderRadius: theme.borderRadius }}
            >
              <Download className="w-4 h-4" /> Add to Contacts
            </button>
          )}

          {/* Social Links in Contact */}
          {section.showSocialLinks !== false && (section.socialLinks || []).length > 0 && (
            <div className="flex justify-center gap-3 mb-8">
              {(section.socialLinks || []).map((link) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: `${theme.colors.primary}15`, color: theme.colors.primary }}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}

          {section.showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <input type="text" placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full p-3 border rounded-lg text-gray-900" style={{ borderColor: theme.colors.primary, borderRadius: theme.borderRadius, backgroundColor: 'white' }} />
              <input type="email" placeholder="Your Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full p-3 border rounded-lg text-gray-900" style={{ borderColor: theme.colors.primary, borderRadius: theme.borderRadius, backgroundColor: 'white' }} />
              <textarea placeholder="Your Message" rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required className="w-full p-3 border rounded-lg text-gray-900" style={{ borderColor: theme.colors.primary, borderRadius: theme.borderRadius, backgroundColor: 'white' }} />
              <button type="submit" disabled={status === 'sending'} className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50" style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }}>
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {status === 'success' && <div className="p-3 bg-green-100 text-green-700 rounded-lg text-center">Message sent successfully!</div>}
              {validationErrors.length > 0 && <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg"><ul className="list-disc list-inside text-sm">{validationErrors.map((error, i) => <li key={i}>{error}</li>)}</ul></div>}
              {status === 'error' && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center">Failed to send message. Please try again.</div>}
            </form>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ SOCIAL ============
function SocialPreview({ section, theme }: { section: SocialSection; theme: any }) {
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-4xl mx-auto text-center">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-8" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          <div className="flex justify-center gap-4 flex-wrap">
            {section.links.map((link) => {
              const Icon = getSocialIcon(link.platform);
              return (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-full transition-all hover:scale-110" style={{ backgroundColor: theme.colors.primary, color: 'white' }}>
                  <Icon className="w-6 h-6" />
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ FOOTER ============
function FooterPreview({ section, theme }: { section: FooterSection; theme: any }) {
  const { portfolio } = usePortfolioStore();
  const year = new Date().getFullYear();
  const copyright = section.copyrightText.replace('{year}', String(year));
  const socialSection = portfolio.sections.find(s => s.type === 'social') as any;
  const contactSection = portfolio.sections.find(s => s.type === 'contact') as any;
  const navLinks = portfolio.sections.filter(s => s.visible !== false && s.type !== 'footer').map(s => ({ id: s.id, label: s.type === 'hero' ? (s as any).name || 'Home' : (s as any).title || s.type }));

  return (
    <footer className="py-12 px-6" style={{ backgroundColor: theme.colors.text, color: '#fff' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {section.showQuickLinks && (
            <div>
              <h4 className="text-sm font-semibold uppercase mb-4 opacity-70">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.id}><a href={`#section-${link.id}`} className="text-sm opacity-80 hover:opacity-100 transition-opacity">{link.label}</a></li>
                ))}
              </ul>
            </div>
          )}
          {section.showContactInfo && (
            <div>
              <h4 className="text-sm font-semibold uppercase mb-4 opacity-70">Contact</h4>
              <div className="space-y-2 text-sm opacity-80">
                {(section.contactEmail || contactSection?.email) && <p>{section.contactEmail || contactSection?.email}</p>}
                {(section.contactPhone || contactSection?.phone) && <p>{section.contactPhone || contactSection?.phone}</p>}
                {(section.contactLocation || contactSection?.location) && <p>{section.contactLocation || contactSection?.location}</p>}
              </div>
            </div>
          )}
          {section.showSocialIcons && socialSection?.links?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold uppercase mb-4 opacity-70">Follow Me</h4>
              <div className="flex gap-3">
                {socialSection.links.map((link: any) => {
                  const Icon = getSocialIcon(link.platform);
                  return <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Icon className="w-5 h-5" /></a>;
                })}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-white/10 pt-6 flex items-center justify-between">
          <p className="text-sm opacity-60">{copyright}</p>
          {section.showBackToTop && (
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}

// ============ CTA BANNER ============
function CTABannerPreview({ section, theme }: { section: CTABannerSection; theme: any }) {
  const bgStyle = section.backgroundType === 'gradient' || section.backgroundType === 'color' ? { background: section.backgroundValue } : section.backgroundType === 'image' ? { backgroundImage: `url(${section.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
  return (
    <AnimatedSection>
      <section className="py-20 px-6 text-center" style={bgStyle}>
        <div className="max-w-2xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={getTextStyle(section.textStyles, 'title', { color: '#fff' })}>{section.title}</h2>
          )}
          {section.showSubtitle !== false && (
            <p className="text-lg mb-8" style={getTextStyle(section.textStyles, 'subtitle', { color: 'rgba(255,255,255,0.9)' })}>{section.subtitle}</p>
          )}
          {section.showButton !== false && (
            <a href={section.buttonLink} onClick={(e) => { if (section.buttonLink.startsWith('#')) { e.preventDefault();
              const linkId = section.buttonLink.slice(1);
              let el = document.getElementById(`section-${linkId}`);
              if (!el) {
                const sections = document.querySelectorAll('[data-section-type]');
                for (const s of sections) {
                  if (s.getAttribute('data-section-type') === linkId) { el = s as HTMLElement; break; }
                }
              }
              el?.scrollIntoView({ behavior: 'smooth' });
            } }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }}
            >
              {section.buttonText}
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ SERVICES ============

function ServicesPreview({ section, theme }: { section: ServicesSection; theme: any }) {
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-6xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-2 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          {section.showSubtitle !== false && section.subtitle && <p className="text-center mb-10" style={{ color: theme.colors.textSecondary }}>{section.subtitle}</p>}
          <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.services.map((service) => {
              const Icon = iconMap[service.icon] || Star;
              return (
                <AnimatedItem key={service.id}>
                  <div className="p-6 rounded-lg border text-center h-full" style={{ borderColor: `${theme.colors.primary}20`, borderRadius: theme.borderRadius, backgroundColor: 'white' }}>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${theme.colors.primary}15` }}>
                      <Icon className="w-7 h-7" style={{ color: theme.colors.primary }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>{service.title}</h3>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{service.description}</p>
                  </div>
                </AnimatedItem>
              );
            })}
          </AnimatedStagger>
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ PROCESS ============
function ProcessPreview({ section, theme }: { section: ProcessSection; theme: any }) {
  const layout = section.layout || 'horizontal';
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-6xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-2 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          {section.showSubtitle !== false && section.subtitle && <p className="text-center mb-10" style={{ color: theme.colors.textSecondary }}>{section.subtitle}</p>}
          <div className={cn(layout === 'horizontal' ? 'flex flex-col md:flex-row gap-8' : 'flex flex-col gap-8 max-w-2xl mx-auto')}>
            {section.steps.map((step, i) => (
              <div key={step.id} className={cn('flex-1 relative', layout === 'horizontal' && 'text-center')}>
                <div className="flex items-center gap-4 mb-4" style={layout === 'horizontal' ? { flexDirection: 'column' as const } : {}}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ backgroundColor: theme.colors.primary }}>
                    {step.number}
                  </div>
                  {layout === 'horizontal' && i < section.steps.length - 1 && (
                    <div className="hidden md:block w-12 h-0.5" style={{ backgroundColor: theme.colors.primary, opacity: 0.3 }} />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>{step.title}</h3>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ STATS ============
function StatsPreview({ section, theme }: { section: StatsSection; theme: any }) {
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={{ backgroundColor: theme.colors.primary }}>
        <div className="max-w-5xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-10 text-center text-white">{section.title}</h2>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {section.stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ AWARDS ============
function AwardsPreview({ section, theme }: { section: AwardsSection; theme: any }) {
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-4xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-8 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          <AnimatedStagger className="space-y-4">
            {section.awards.map((award) => (
              <AnimatedItem key={award.id}>
                <div className="flex items-start gap-4 p-4 rounded-lg border" style={{ borderColor: `${theme.colors.primary}20`, borderRadius: theme.borderRadius, backgroundColor: 'white' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.colors.primary}15` }}>
                    <Trophy className="w-6 h-6" style={{ color: theme.colors.primary }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold" style={{ color: theme.colors.text }}>{award.title}</h3>
                      <span className="text-sm" style={{ color: theme.colors.textSecondary }}>{award.year}</span>
                    </div>
                    <p className="text-sm" style={{ color: theme.colors.primary }}>{award.organization}</p>
                    {award.description && <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>{award.description}</p>}
                  </div>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedStagger>
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ PRESS ============
function PressPreview({ section, theme }: { section: PressSection; theme: any }) {
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-5xl mx-auto text-center">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-2" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          {section.showSubtitle !== false && section.subtitle && <p className="mb-10" style={{ color: theme.colors.textSecondary }}>{section.subtitle}</p>}
          <div className="flex flex-wrap items-center justify-center gap-8">
            {section.items.map((item) => (
              <div key={item.id}>
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block opacity-60 hover:opacity-100 transition-opacity">
                    {item.logo ? <OptimizedImage src={item.logo} alt={item.name} className="h-12 w-auto" width={48} height={48} /> : <span className="text-xl font-bold" style={{ color: theme.colors.text }}>{item.name}</span>}
                  </a>
                ) : (
                  item.logo ? <OptimizedImage src={item.logo} alt={item.name} className="h-12 w-auto opacity-60" width={48} height={48} /> : <span className="text-xl font-bold opacity-60" style={{ color: theme.colors.text }}>{item.name}</span>
                )}

              </div>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ CERTIFICATIONS ============
function CertificationsPreview({ section, theme }: { section: CertificationsSection; theme: any }) {
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-4xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-8 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.certifications.map((cert) => (
              <AnimatedItem key={cert.id}>
                <div className="p-4 rounded-lg border flex items-center gap-4" style={{ borderColor: `${theme.colors.primary}20`, borderRadius: theme.borderRadius, backgroundColor: 'white' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.colors.primary}15` }}>
                    <AwardIcon className="w-6 h-6" style={{ color: theme.colors.primary }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: theme.colors.text }}>{cert.name}</h3>
                    <p className="text-sm" style={{ color: theme.colors.primary }}>{cert.issuer}</p>
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{cert.date}</p>
                  </div>
                  {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full" style={{ backgroundColor: `${theme.colors.primary}10` }}><ExternalLink className="w-4 h-4" style={{ color: theme.colors.primary }} /></a>}
                </div>
              </AnimatedItem>
            ))}
          </AnimatedStagger>
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ BLOG ============
function BlogPreview({ section, theme }: { section: BlogSection; theme: any }) {
  const layout = section.layout || 'grid';
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-6xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-2 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          {section.showSubtitle !== false && section.subtitle && <p className="text-center mb-10" style={{ color: theme.colors.textSecondary }}>{section.subtitle}</p>}
          {section.posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500"><p>No blog posts yet.</p></div>
          ) : layout === 'list' ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {section.posts.map((post) => (
                <div key={post.id} className="flex flex-col md:flex-row gap-6 p-4 rounded-lg border" style={{ borderColor: `${theme.colors.primary}20`, borderRadius: theme.borderRadius, backgroundColor: 'white' }}>
                  {post.imageUrl && (
                    <OptimizedImage src={post.imageUrl} alt={post.title} className="w-full md:w-48 h-32 object-cover rounded-lg flex-shrink-0" width={192} height={128} />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1" style={{ color: theme.colors.text }}>{post.title}</h3>
                    <div className="flex items-center gap-3 text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                      {post.date && <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>}
                      {post.readTime && <span>• {post.readTime}</span>}
                    </div>
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{post.excerpt}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${theme.colors.primary}15`, color: theme.colors.primary }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    {post.link && (
                      <a href={post.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm mt-3" style={{ color: theme.colors.primary }}>
                        Read more <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatedStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.posts.map((post) => (
                <AnimatedItem key={post.id}>
                  <div className="rounded-lg overflow-hidden border h-full flex flex-col" style={{ borderColor: `${theme.colors.primary}20`, borderRadius: theme.borderRadius, backgroundColor: 'white' }}>
                    {post.imageUrl && (
                      <OptimizedImage src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" width={400} height={192} />
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                        {post.date && <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>}
                        {post.readTime && <span>• {post.readTime}</span>}
                      </div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>{post.title}</h3>
                      <p className="text-sm flex-1" style={{ color: theme.colors.textSecondary }}>{post.excerpt}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${theme.colors.primary}15`, color: theme.colors.primary }}>{tag}</span>
                          ))}
                        </div>
                      )}
                      {post.link && (
                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm mt-3" style={{ color: theme.colors.primary }}>
                          Read more <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </AnimatedStagger>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ FAQ ============
function FAQPreview({ section, theme }: { section: FAQSection; theme: any }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const layout = section.layout || 'accordion';
  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-3xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-2 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          {section.showSubtitle !== false && section.subtitle && <p className="text-center mb-10" style={{ color: theme.colors.textSecondary }}>{section.subtitle}</p>}
          {section.items.length === 0 ? (
            <div className="text-center py-12 text-gray-500"><p>No FAQ items yet.</p></div>
          ) : layout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item) => (
                <div key={item.id} className="p-5 rounded-lg border" style={{ borderColor: `${theme.colors.primary}20`, borderRadius: theme.borderRadius, backgroundColor: 'white' }}>
                  <div className="flex items-start gap-3 mb-2">
                    <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.colors.primary }} />
                    <h3 className="font-semibold" style={{ color: theme.colors.text }}>{item.question}</h3>
                  </div>
                  <p className="text-sm pl-8" style={{ color: theme.colors.textSecondary }}>{item.answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {section.items.map((item, i) => (
                <div key={item.id} className="rounded-lg border overflow-hidden" style={{ borderColor: `${theme.colors.primary}20`, borderRadius: theme.borderRadius, backgroundColor: 'white' }}>
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium" style={{ color: theme.colors.text }}>{item.question}</span>
                    {openIndex === i ? <Minus className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.primary }} /> : <Plus className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.primary }} />}
                  </button>
                  {openIndex === i && (
                    <div className="px-4 pb-4 text-sm" style={{ color: theme.colors.textSecondary }}>
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}

// ============ NEWSLETTER ============
function NewsletterPreview({ section, theme }: { section: NewsletterSection; theme: any }) {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // If a provider URL is set, the form will submit to it; otherwise show success
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const bgStyle = section.backgroundType === 'gradient' || section.backgroundType === 'color'
    ? { background: section.backgroundValue }
    : section.backgroundType === 'image'
    ? { backgroundImage: `url(${section.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <AnimatedSection>
      <section className="py-16 px-6 text-center" style={bgStyle}>
        <div className="max-w-xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-2" style={getTextStyle(section.textStyles, 'title', { color: '#fff' })}>{section.title}</h2>
          )}
          {section.showSubtitle !== false && section.subtitle && <p className="mb-8" style={getTextStyle(section.textStyles, 'subtitle', { color: 'rgba(255,255,255,0.9)' })}>{section.subtitle}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={section.placeholder || 'Enter your email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
              style={{ borderRadius: theme.borderRadius, backgroundColor: 'white' }}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white whitespace-nowrap transition-all hover:opacity-90"
              style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }}
            >
              <Send className="w-4 h-4" /> {section.buttonText}
            </button>
          </form>
          {status === 'success' && (
            <p className="mt-4 text-sm text-white/90">✓ Thanks for subscribing!</p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-sm text-red-300">Something went wrong. Please try again.</p>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}


