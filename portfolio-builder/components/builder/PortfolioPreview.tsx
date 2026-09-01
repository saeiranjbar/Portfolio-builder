'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import {
  HeroSection, AboutSection, ProjectsSection, SkillsSection,
  ExperienceSection, EducationSection, TestimonialsSection,
  ContactSection, SocialSection, FooterSection, CTABannerSection,
  ServicesSection, ProcessSection, StatsSection, AwardsSection,
  PressSection, CertificationsSection, PortfolioSection,
  TextStyleSettings, TextStyles, Project, GalleryVideo, BackgroundShape
} from '@/lib/types';
import { Mail, Phone, MapPin, ExternalLink, ChevronDown, ArrowRight,
  Star, ArrowUp, Download, Calendar, Trophy, Award as AwardIcon,
  Layers, Search, PenTool, Lightbulb, Rocket, CheckCircle,
  ChevronLeft, Plus, Minus, Send, FileText, Newspaper, HelpCircle,
  Figma, Atom, Leaf, Shield, Triangle, Server, Code, Code2, Palette, Wind,
  GitBranch, Github, Gitlab, Box, Cloud, Flame, Database, Globe,
  ShoppingBag, Pencil, MessageSquare, KanbanSquare, List, Layout, Zap, BarChart, X, GripVertical } from 'lucide-react';
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
import { MouseColorShift } from './effects/MouseColorShift';
import { SplashButton } from './effects/SplashButton';
import { ColorRibbon } from './effects/ColorRibbon';



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
  if (s.maxWidth) style.maxWidth = s.maxWidth;
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
  const [activeCategory, setActiveCategory] = React.useState<{ sectionId: string; categoryName: string } | null>(null);

  const viewModeClasses = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto',
  };

  // Scroll to active section when it changes
  // Moved before early return to satisfy React hooks rules
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (activeSection && containerRef.current) {
      const el = document.getElementById(`section-${activeSection}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeSection]);

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
            columnCount: 2,
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

  // The Hero controls one shared landing-page canvas. Categories remain separate
  // editor items but stay visually embedded in that same page background.
  const heroSection = portfolio.sections.find((section) => section.type === 'hero') as HeroSection | undefined;
  const landingBackgroundStyle: React.CSSProperties = heroSection?.backgroundType === 'gradient' || heroSection?.backgroundType === 'color'
    ? { background: heroSection.backgroundValue }
    : heroSection?.backgroundType === 'image'
      ? { backgroundImage: `url(${heroSection.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
      : { backgroundColor: theme.colors.background };
  const sectionsToShow = portfolio.sections.filter(s => s.visible !== false);

  // When a category is selected, render ONLY the projects section with the category detail view
  if (activeCategory) {
    const projectsSection = sectionsToShow.find(s => s.id === activeCategory.sectionId) as ProjectsSection | undefined;
    if (projectsSection) {
      return (
        <div
          ref={containerRef}
          className={cn('h-full overflow-y-auto transition-all duration-300', viewModeClasses[viewMode])}
          style={{ backgroundColor: theme.colors.background, fontFamily: theme.typography.bodyFont, fontSize: theme.typography.baseSize, scrollBehavior: 'smooth' }}
        >
          <div style={{ minHeight: '100vh' }}>
            <ProjectsPreview
              section={projectsSection}
              theme={theme}
              onEditProject={onEditProject}
              selectedCategory={activeCategory.categoryName}
              onSelectCategory={(catName) => {
                if (catName === null) {
                  setActiveCategory(null);
                } else {
                  setActiveCategory({ sectionId: projectsSection.id, categoryName: catName });
                }
              }}
            />
          </div>
        </div>
      );
    }
  }

  const effects = portfolio.effects;
  const isPreview = !onEditProject; // Preview mode when no edit callback

  return (
    <div
      ref={containerRef}
      className={cn('h-full overflow-y-auto transition-all duration-300', viewModeClasses[viewMode])}
      style={{ ...landingBackgroundStyle, fontFamily: theme.typography.bodyFont, fontSize: theme.typography.baseSize, scrollBehavior: 'smooth', position: 'relative' }}
    >
      {/* Interactive Effects — only in preview mode */}
      {isPreview && effects?.mouseColorShift?.enabled && (
        <MouseColorShift
          startColor={effects.mouseColorShift.startColor}
          endColor={effects.mouseColorShift.endColor}
          intensity={effects.mouseColorShift.intensity}
        />
      )}
      {isPreview && effects?.splashButton?.enabled && (
        <SplashButton
          text={effects.splashButton.text}
          link={effects.splashButton.link}
          color={effects.splashButton.color}
          position={effects.splashButton.position}
        />
      )}
      {isPreview && effects?.colorRibbon?.enabled && (
        <ColorRibbon
          color={effects.colorRibbon.color}
          intensity={effects.colorRibbon.intensity}
        />
      )}

      <div style={{ minHeight: '100vh' }}>
        {sectionsToShow.map((section) => (
          <div
            key={section.id}
            id={`section-${section.id}`}
            data-section-type={section.type}
            className="scroll-mt-0 transition-all duration-300"
          >
            <SectionRenderer
              section={section}
              theme={theme}
              onEditProject={onEditProject}
              useLandingBackground={section.id === heroSection?.id}
              onSelectCategory={(sectionId: string, categoryName: string) => setActiveCategory({ sectionId, categoryName })}
            />
          </div>
        ))}
      </div>

    </div>
  );
}

export function SectionRenderer({ section, theme, onEditProject, useLandingBackground = false, onSelectCategory }: any) {
  // Hero, About, Experience, Education, Awards, and Certifications expose their individual fields in free-form mode.
  // Other categories use the same snap canvas for their complete category block.
  if (section.freeFormEnabled && section.type !== 'hero' && section.type !== 'about' && section.type !== 'experience' && section.type !== 'education' && section.type !== 'awards' && section.type !== 'certifications') {
    return (
      <GenericFreeFormCategory section={section} theme={theme} onEditProject={onEditProject} />
    );
  }

  switch (section.type) {
    case 'hero': return <HeroPreview section={section} theme={theme} useLandingBackground={useLandingBackground} />;
    case 'about': return <AboutPreview section={section} theme={theme} />;
    case 'projects': return <ProjectsPreview section={section} theme={theme} onEditProject={onEditProject} onSelectCategory={onSelectCategory ? (catName: string | null) => onSelectCategory(section.id, catName) : undefined} />;
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


function GenericFreeFormCategory({ section, theme, onEditProject }: { section: PortfolioSection; theme: any; onEditProject?: (project: Project) => void }) {
  const { updateSection } = usePortfolioStore();
  const positions = (section as any).elementPositions || {};

  return (
    <FreeFormSection
      sectionId={section.id}
      snapEnabled={section.snapEnabled !== false}
      elements={[{
        key: 'categoryContent',
        visible: true,
        position: positions.categoryContent,
        defaultPosition: { x: 50, y: 8 },
        content: (
          <div style={{ width: 'min(1600px, calc(100vw - 48px))' }}>
            <SectionRenderer
              section={{ ...section, freeFormEnabled: false }}
              theme={theme}
              onEditProject={onEditProject}
            />
          </div>
        ),
      }]}
      onPositionChange={(key, position) => updateSection(section.id, {
        elementPositions: { ...positions, [key]: position },
      } as Partial<PortfolioSection>)}
      backgroundStyle={{ backgroundColor: 'transparent' }}
      minHeight="min-h-[115vh]"
    />
  );
}
// ============ HERO ============
function HeroPreview({ section, theme, useLandingBackground = false }: { section: HeroSection; theme: any; useLandingBackground?: boolean }) {
  const { updateSection } = usePortfolioStore();
  const previewMode = usePortfolioStore((s) => s.previewMode);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [dragging, setDragging] = React.useState<string | null>(null);
  const [resizing, setResizing] = React.useState<{ id: string; corner: string; startWidth: number; startHeight: number; startMouseX: number; startMouseY: number; startPosX: number; startPosY: number } | null>(null);
  const resizingRef = React.useRef(resizing);
  React.useEffect(() => { resizingRef.current = resizing; }, [resizing]);
  const [snapLines, setSnapLines] = React.useState<{ vertical?: number; horizontal?: number }>({});

  const snapEnabled = section.snapEnabled !== false;
  const SNAP_THRESHOLD = 1; // percentage points — only snaps when extremely close for fine control

  const bgStyle = section.backgroundType === 'gradient' || section.backgroundType === 'color'
    ? { background: section.backgroundValue }
    : section.backgroundType === 'image'
    ? { backgroundImage: `url(${section.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    : section.backgroundType === 'video'
    ? { backgroundColor: '#000' }
    : {};

  // Always apply the background style directly to the section so it covers
  // all content, including a tall single-column gallery that extends beyond
  // the viewport.  Previously, when useLandingBackground was true the section
  // had no background of its own ({}) and relied on a parent wrapper div.
  // That wrapper's background did not always stretch to cover very tall
  // gallery content, leaving a white gap at the bottom of the page.
  // When parallax is enabled with an image background, don't set the
  // backgroundImage on the section itself — it will be rendered by the
  // Parallax component instead, otherwise it would show through and hide
  // the parallax movement.
  // When useLandingBackground is true and no parallax, keep the section
  // transparent so the parent landingBackgroundStyle shows through
  // seamlessly — this prevents subtle color mismatches between the hero
  // and the sections below it.
  const useParallax = section.parallaxEnabled && section.backgroundType === 'image' && section.backgroundValue;
  const heroSurfaceStyle = useParallax
    ? { backgroundColor: theme.colors.background }
    : useLandingBackground
      ? { backgroundColor: 'transparent' }
      : bgStyle;

  const overlayStyle = (section.backgroundType === 'image' || section.backgroundType === 'video') && section.backgroundOverlayOpacity
    ? { position: 'absolute' as const, inset: 0, backgroundColor: `rgba(0,0,0,${section.backgroundOverlayOpacity / 100})`, pointerEvents: 'none' as const }
    : {};

  const avatarSizeClasses = { small: 'w-20 h-20', medium: 'w-32 h-32', large: 'w-48 h-48' };

  // Get avatar shape class
  const getAvatarShapeClass = () => {
    const shape = section.avatarShape || 'circle';
    if (shape === 'circle') return 'rounded-full';
    if (shape === 'rounded') return 'rounded-lg';
    return 'rounded-none'; // square
  };

  // Get avatar dimensions
  const getAvatarSize = () => {
    const width = section.avatarWidth || 120;
    const height = section.avatarHeight || 120;
    return { width, height, style: { width: `${width}px`, height: `${height}px` } };
  };

  // Default positions only used when user has explicitly saved positions
  // When no saved position exists, elements appear near top to avoid gap
  // Only use positions when user has explicitly saved them
  // Otherwise use null to indicate normal flow (no positioning)
  const avatarPos = section.avatarPosition || null;
  const namePos = section.namePosition || null;
  const titlePos = section.titlePosition || null;
  const subtitlePos = section.subtitlePosition || null;
  const bioPos = section.bioPosition || null;
  const ctaPos = section.ctaButtonsPosition || null;

  React.useEffect(() => {
    const isCompactBaseline =
      section.namePosition?.x === 50 && section.namePosition?.y === 15 &&
      section.titlePosition?.x === 50 && section.titlePosition?.y === 22 &&
      section.subtitlePosition?.x === 50 && section.subtitlePosition?.y === 28 &&
      section.bioPosition?.x === 50 && section.bioPosition?.y === 35 &&
      section.ctaButtonsPosition?.x === 50 && section.ctaButtonsPosition?.y === 45;

    if (!isCompactBaseline) return;

    updateSection(section.id, {
      avatarPosition: { x: 50, y: 8 },
      namePosition: { x: 50, y: 18 },
      titlePosition: { x: 50, y: 28 },
      subtitlePosition: { x: 50, y: 38 },
      bioPosition: { x: 50, y: 50 },
      ctaButtonsPosition: { x: 50, y: 75 },
    });
  }, [section.id, section.namePosition, section.titlePosition, section.subtitlePosition, section.bioPosition, section.ctaButtonsPosition, updateSection]);

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

  // Track drag offset so elements don't jump to mouse position
  const dragOffset = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, element: string) => {
    if (previewMode || !sectionRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    // Gallery images/videos live below the 60vh canvas in normal flow.
    // Use the full section as the drag surface for these block-level elements
    // so positions are measured and applied relative to the same container.
    const isGalleryBlock = element === 'galleryImages' || element === 'galleryVideos';
    const dragSurface = isGalleryBlock ? sectionRef.current : (canvasRef.current || sectionRef.current);
    if (!dragSurface) return;
    const rect = dragSurface.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    let elemX = 50, elemY = 50;
    if (element === 'avatar') { elemX = avatarPos.x; elemY = avatarPos.y; }
    else if (element === 'name') { elemX = namePos.x; elemY = namePos.y; }
    else if (element === 'title') { elemX = titlePos.x; elemY = titlePos.y; }
    else if (element === 'subtitle') { elemX = subtitlePos.x; elemY = subtitlePos.y; }
    else if (element === 'bio') { elemX = bioPos.x; elemY = bioPos.y; }
    else if (element === 'ctaButtons') { elemX = ctaPos.x; elemY = ctaPos.y; }
    else if (element === 'galleryImages') {
      if (section.galleryImagesPosition) {
        elemX = section.galleryImagesPosition.x;
        elemY = section.galleryImagesPosition.y;
      } else {
        // No saved position — measure current screen position and set it immediately
        // so the gallery switches to absolute positioning without jumping
        const galleryNode = elementRefs.current.galleryImages;
        const galleryRect = galleryNode?.getBoundingClientRect();
        if (galleryRect) {
          elemX = ((galleryRect.left + galleryRect.width / 2 - rect.left) / rect.width) * 100;
          elemY = ((galleryRect.top - rect.top) / rect.height) * 100;
          // Preserve the gallery's footprint so the hero background doesn't collapse
          // when the gallery switches from normal flow to absolute positioning
          setGalleryFlowHeight(galleryRect.height);
          // Set position immediately to prevent jump on first mouse move
          updateSection(section.id, { galleryImagesPosition: { x: elemX, y: elemY } });
        }
      }
    }
    else if (element === 'galleryVideos') {
      if (section.galleryVideosPosition) {
        elemX = section.galleryVideosPosition.x;
        elemY = section.galleryVideosPosition.y;
      } else {
        const vidRect = elementRefs.current.galleryVideos?.getBoundingClientRect();
        if (vidRect) {
          elemX = ((vidRect.left + vidRect.width / 2 - rect.left) / rect.width) * 100;
          elemY = ((vidRect.top - rect.top) / rect.height) * 100;
          // Preserve the videos' footprint so the hero background doesn't collapse
          // when the videos switch from normal flow to absolute positioning
          setGalleryVideosFlowHeight(vidRect.height);
          // Also measure gallery images height if they're in normal flow (not dragged).
          // Without this, the section minHeight won't account for the gallery images
          // and the percentage-based position will be wrong after the section shrinks.
          if (!galleryIsDragged && galleryFlowHeight === 0) {
            const galRect = elementRefs.current.galleryImages?.getBoundingClientRect();
            if (galRect && galRect.height > 0) setGalleryFlowHeight(galRect.height);
          }
          updateSection(section.id, { galleryVideosPosition: { x: elemX, y: elemY } });
        }
      }
    }
    else if (typeof element === 'string' && element.startsWith('shape-')) {
      const shapeId = element.slice(6);
      const shape = (section.backgroundShapes || []).find(s => s.id === shapeId);
      if (shape) { elemX = shape.position.x; elemY = shape.position.y; }
    }
    dragOffset.current = { x: mouseX - elemX, y: mouseY - elemY };
    setDragging(element);
  };
  const handleTouchStart = (e: React.TouchEvent, element: string) => {
    if (previewMode || !sectionRef.current) return;
    e.stopPropagation();
    // Gallery images/videos live below the 60vh canvas in normal flow.
    // Use the full section as the drag surface for these block-level elements.
    const isGalleryBlock = element === 'galleryImages' || element === 'galleryVideos';
    const dragSurface = isGalleryBlock ? sectionRef.current : (canvasRef.current || sectionRef.current);
    if (!dragSurface) return;
    const rect = dragSurface.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = ((touch.clientX - rect.left) / rect.width) * 100;
    const touchY = ((touch.clientY - rect.top) / rect.height) * 100;
    let elemX = 50, elemY = 50;
    if (element === 'avatar') { elemX = avatarPos.x; elemY = avatarPos.y; }
    else if (element === 'name') { elemX = namePos.x; elemY = namePos.y; }
    else if (element === 'title') { elemX = titlePos.x; elemY = titlePos.y; }
    else if (element === 'subtitle') { elemX = subtitlePos.x; elemY = subtitlePos.y; }
    else if (element === 'bio') { elemX = bioPos.x; elemY = bioPos.y; }
    else if (element === 'ctaButtons') { elemX = ctaPos.x; elemY = ctaPos.y; }
    else if (element === 'galleryImages') {
      if (section.galleryImagesPosition) {
        elemX = section.galleryImagesPosition.x;
        elemY = section.galleryImagesPosition.y;
      } else {
        const galleryRect = elementRefs.current.galleryImages?.getBoundingClientRect();
        if (galleryRect) {
          elemX = ((galleryRect.left + galleryRect.width / 2 - rect.left) / rect.width) * 100;
          elemY = ((galleryRect.top - rect.top) / rect.height) * 100;
        }
      }
    }
    else if (element === 'galleryVideos') {
      if (section.galleryVideosPosition) {
        elemX = section.galleryVideosPosition.x;
        elemY = section.galleryVideosPosition.y;
      } else {
        const vidRect = elementRefs.current.galleryVideos?.getBoundingClientRect();
        if (vidRect) {
          elemX = ((vidRect.left + vidRect.width / 2 - rect.left) / rect.width) * 100;
          elemY = ((vidRect.top - rect.top) / rect.height) * 100;
          setGalleryVideosFlowHeight(vidRect.height);
          updateSection(section.id, { galleryVideosPosition: { x: elemX, y: elemY } });
        }
      }
    }
    else if (typeof element === 'string' && element.startsWith('shape-')) {
      const shapeId = element.slice(6);
      const shape = (section.backgroundShapes || []).find(s => s.id === shapeId);
      if (shape) { elemX = shape.position.x; elemY = shape.position.y; }
    }
    dragOffset.current = { x: touchX - elemX, y: touchY - elemY };
    setDragging(element);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    // Handle shape resizing — read from ref to always get latest value
    const rz = resizingRef.current;
    if (rz) {
      const dx = e.clientX - rz.startMouseX;
      const dy = e.clientY - rz.startMouseY;
      let newWidth = rz.startWidth;
      let newHeight = rz.startHeight;
      let newPosX = rz.startPosX;
      let newPosY = rz.startPosY;
      // Get canvas dimensions to convert px deltas to % position shifts
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const canvasW = canvasRect?.width || 1;
      const canvasH = canvasRect?.height || 1;
      // nw corner: both decrease — keep right & bottom edges fixed
      if (rz.corner === 'nw') { newWidth = rz.startWidth - dx; newHeight = rz.startHeight - dy; newPosX = rz.startPosX - (newWidth - rz.startWidth) / 2 / canvasW * 100; newPosY = rz.startPosY - (newHeight - rz.startHeight) / 2 / canvasH * 100; }
      // ne corner: width increases, height decreases — keep left & bottom edges fixed
      else if (rz.corner === 'ne') { newWidth = rz.startWidth + dx; newHeight = rz.startHeight - dy; newPosX = rz.startPosX + (newWidth - rz.startWidth) / 2 / canvasW * 100; newPosY = rz.startPosY - (newHeight - rz.startHeight) / 2 / canvasH * 100; }
      // sw corner: width decreases, height increases — keep right & top edges fixed
      else if (rz.corner === 'sw') { newWidth = rz.startWidth - dx; newHeight = rz.startHeight + dy; newPosX = rz.startPosX - (newWidth - rz.startWidth) / 2 / canvasW * 100; newPosY = rz.startPosY + (newHeight - rz.startHeight) / 2 / canvasH * 100; }
      // se corner: both increase — keep left & top edges fixed
      else if (rz.corner === 'se') { newWidth = rz.startWidth + dx; newHeight = rz.startHeight + dy; newPosX = rz.startPosX + (newWidth - rz.startWidth) / 2 / canvasW * 100; newPosY = rz.startPosY + (newHeight - rz.startHeight) / 2 / canvasH * 100; }
      // n edge: only height changes — keep bottom edge fixed
      else if (rz.corner === 'n') { newHeight = rz.startHeight - dy; newPosY = rz.startPosY - (newHeight - rz.startHeight) / 2 / canvasH * 100; }
      // s edge: only height changes — keep top edge fixed
      else if (rz.corner === 's') { newHeight = rz.startHeight + dy; newPosY = rz.startPosY + (newHeight - rz.startHeight) / 2 / canvasH * 100; }
      // e edge: only width changes — keep left edge fixed
      else if (rz.corner === 'e') { newWidth = rz.startWidth + dx; newPosX = rz.startPosX + (newWidth - rz.startWidth) / 2 / canvasW * 100; }
      // w edge: only width changes — keep right edge fixed
      else if (rz.corner === 'w') { newWidth = rz.startWidth - dx; newPosX = rz.startPosX - (newWidth - rz.startWidth) / 2 / canvasW * 100; }
      // Clamp to minimum 10px
      newWidth = Math.max(10, newWidth);
      newHeight = Math.max(10, newHeight);
      const updatedShapes = (section.backgroundShapes || []).map(s =>
        s.id === rz.id ? { ...s, width: newWidth, height: newHeight, position: { x: newPosX, y: newPosY } } : s
      );
      updateSection(section.id, { backgroundShapes: updatedShapes });
      return;
    }
    if (!dragging || !sectionRef.current) return;
    // Gallery blocks are positioned relative to the full section, not the 60vh canvas
    const isGalleryBlock = dragging === 'galleryImages' || dragging === 'galleryVideos';
    const dragSurface = isGalleryBlock ? sectionRef.current : (canvasRef.current || sectionRef.current);
    if (!dragSurface) return;
    const rect = dragSurface.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x - dragOffset.current.x));
    // Allow Y to go beyond 100% so elements can be dragged down freely
    const clampedY = Math.max(0, Math.min(500, y - dragOffset.current.y));
    // Hold Alt to temporarily disable snapping for fine-tuning position
    const useSnap = snapEnabled && !e.altKey;
    const { x: snappedX, y: snappedY, snapV, snapH } = useSnap
      ? computeSnap(dragging, clampedX, clampedY)
      : { x: clampedX, y: clampedY, snapV: undefined, snapH: undefined };
    setSnapLines({ vertical: snapV, horizontal: snapH });

    // Handle background shape dragging
    if (typeof dragging === 'string' && dragging.startsWith('shape-')) {
      const shapeId = dragging.slice(6);
      const updatedShapes = (section.backgroundShapes || []).map(s =>
        s.id === shapeId ? { ...s, position: { x: snappedX, y: snappedY } } : s
      );
      updateSection(section.id, { backgroundShapes: updatedShapes });
    }
    // Handle gallery image/video dragging (galleryImages, galleryVideos are block-level)
    else if (dragging === 'galleryImages' || dragging === 'galleryVideos') {
      const positionKey = `${dragging}Position` as keyof HeroSection;
      updateSection(section.id, { [positionKey]: { x: snappedX, y: snappedY } });
    } else {
      const positionKey = `${dragging}Position` as keyof HeroSection;
      updateSection(section.id, { [positionKey]: { x: snappedX, y: snappedY } });
    }
  }, [dragging, section.id, updateSection, snapEnabled, section.showAvatar, section.showName, section.showTitle, section.showSubtitle, section.showBio, section.ctaButtons, section.galleryImages, section.backgroundShapes]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    // Handle shape resizing (touch)
    if (resizing) {
      const touch = e.touches[0];
      const dx = touch.clientX - resizing.startMouseX;
      const dy = touch.clientY - resizing.startMouseY;
      let newWidth = resizing.startWidth;
      let newHeight = resizing.startHeight;
      let newPosX = resizing.startPosX;
      let newPosY = resizing.startPosY;
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const canvasW = canvasRect?.width || 1;
      const canvasH = canvasRect?.height || 1;
      if (resizing.corner === 'nw') { newWidth = resizing.startWidth - dx; newHeight = resizing.startHeight - dy; newPosX = resizing.startPosX - (newWidth - resizing.startWidth) / 2 / canvasW * 100; newPosY = resizing.startPosY - (newHeight - resizing.startHeight) / 2 / canvasH * 100; }
      else if (resizing.corner === 'ne') { newWidth = resizing.startWidth + dx; newHeight = resizing.startHeight - dy; newPosX = resizing.startPosX + (newWidth - resizing.startWidth) / 2 / canvasW * 100; newPosY = resizing.startPosY - (newHeight - resizing.startHeight) / 2 / canvasH * 100; }
      else if (resizing.corner === 'sw') { newWidth = resizing.startWidth - dx; newHeight = resizing.startHeight + dy; newPosX = resizing.startPosX - (newWidth - resizing.startWidth) / 2 / canvasW * 100; newPosY = resizing.startPosY + (newHeight - resizing.startHeight) / 2 / canvasH * 100; }
      else if (resizing.corner === 'se') { newWidth = resizing.startWidth + dx; newHeight = resizing.startHeight + dy; newPosX = resizing.startPosX + (newWidth - resizing.startWidth) / 2 / canvasW * 100; newPosY = resizing.startPosY + (newHeight - resizing.startHeight) / 2 / canvasH * 100; }
      else if (resizing.corner === 'n') { newHeight = resizing.startHeight - dy; newPosY = resizing.startPosY - (newHeight - resizing.startHeight) / 2 / canvasH * 100; }
      else if (resizing.corner === 's') { newHeight = resizing.startHeight + dy; newPosY = resizing.startPosY + (newHeight - resizing.startHeight) / 2 / canvasH * 100; }
      else if (resizing.corner === 'e') { newWidth = resizing.startWidth + dx; newPosX = resizing.startPosX + (newWidth - resizing.startWidth) / 2 / canvasW * 100; }
      else if (resizing.corner === 'w') { newWidth = resizing.startWidth - dx; newPosX = resizing.startPosX - (newWidth - resizing.startWidth) / 2 / canvasW * 100; }
      newWidth = Math.max(10, newWidth);
      newHeight = Math.max(10, newHeight);
      const updatedShapes = (section.backgroundShapes || []).map(s =>
        s.id === resizing.id ? { ...s, width: newWidth, height: newHeight, position: { x: newPosX, y: newPosY } } : s
      );
      updateSection(section.id, { backgroundShapes: updatedShapes });
      return;
    }
    if (!dragging || !sectionRef.current) return;
    const touch = e.touches[0];
    // Gallery blocks are positioned relative to the full section, not the 60vh canvas
    const isGalleryBlock = dragging === 'galleryImages' || dragging === 'galleryVideos';
    const dragSurface = isGalleryBlock ? sectionRef.current : (canvasRef.current || sectionRef.current);
    if (!dragSurface) return;
    const rect = dragSurface.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x - dragOffset.current.x));
    // Allow Y to go beyond 100% so elements can be dragged down freely
    const clampedY = Math.max(0, Math.min(500, y - dragOffset.current.y));
    const { x: snappedX, y: snappedY, snapV, snapH } = computeSnap(dragging, clampedX, clampedY);
    setSnapLines({ vertical: snapV, horizontal: snapH });

    // Handle background shape dragging
    if (typeof dragging === 'string' && dragging.startsWith('shape-')) {
      const shapeId = dragging.slice(6);
      const updatedShapes = (section.backgroundShapes || []).map(s =>
        s.id === shapeId ? { ...s, position: { x: snappedX, y: snappedY } } : s
      );
      updateSection(section.id, { backgroundShapes: updatedShapes });
    }
    // Handle gallery image/video dragging
    else if (dragging === 'galleryImages' || dragging === 'galleryVideos') {
      const positionKey = `${dragging}Position` as keyof HeroSection;
      updateSection(section.id, { [positionKey]: { x: snappedX, y: snappedY } });
    } else {
      const positionKey = `${dragging}Position` as keyof HeroSection;
      updateSection(section.id, { [positionKey]: { x: snappedX, y: snappedY } });
    }
  }, [dragging, resizing, section.id, updateSection, snapEnabled, section.showAvatar, section.showName, section.showTitle, section.showSubtitle, section.showBio, section.ctaButtons, section.galleryImages, section.backgroundShapes]);


  const handleMouseUp = React.useCallback(() => {
    setDragging(null);
    setResizing(null);
    setSnapLines({});
  }, []);

  React.useEffect(() => {
    if (dragging || resizing) {
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
  }, [dragging, resizing, handleMouseMove, handleMouseUp, handleTouchMove]);

  const scrollToNext = () => {
    const el = sectionRef.current?.nextElementSibling;
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = React.useState<GalleryVideo | null>(null);

  // Close fullscreen image/video on Escape key
  React.useEffect(() => {
    if (!fullscreenImage && !fullscreenVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenImage(null);
        setFullscreenVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage, fullscreenVideo]);

  // Measure actual content height for free-form mode to ensure background extends
  // to the bottom of all absolutely positioned elements.
  const [measuredHeight, setMeasuredHeight] = React.useState<number | null>(null);
  // Canvas height: fixed stable height for text elements
  // Gallery top: measured from the actual bottom edge of the lowest text element + 24px
  const [galleryFlowMargin, setGalleryFlowMargin] = React.useState(0);
  const [galleryFlowOffsetPx, setGalleryFlowOffsetPx] = React.useState(0);
  const [galleryFlowHeight, setGalleryFlowHeight] = React.useState(0);
  const [galleryVideosFlowHeight, setGalleryVideosFlowHeight] = React.useState(0);
  const elementRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const flowContainerRef = React.useRef<HTMLDivElement>(null);

  // Build a stable dependency string from element positions so the effect
  // re-runs when positions change but not on every keystroke/content change.
  const galleryImgPos = section.galleryImagesPosition || { x: 50, y: 70 };
  const galleryVidPos = section.galleryVideosPosition || { x: 50, y: 220 };
  const heroPositionKey = [
    section.showAvatar !== false && avatarPos ? `avatar:${avatarPos.x},${avatarPos.y}` : '',
    section.showName !== false && namePos ? `name:${namePos.x},${namePos.y}` : '',
    section.showTitle !== false && titlePos ? `title:${titlePos.x},${titlePos.y}` : '',
    section.showSubtitle !== false && subtitlePos ? `subtitle:${subtitlePos.x},${subtitlePos.y}` : '',
    section.showBio !== false && bioPos ? `bio:${bioPos.x},${bioPos.y}` : '',
    section.ctaButtons && section.ctaButtons.length > 0 && ctaPos ? `cta:${ctaPos.x},${ctaPos.y}` : '',
    section.galleryImages && section.galleryImages.length > 0 ? `gimg:${galleryImgPos.x},${galleryImgPos.y}:cols=${section.galleryGridCols || 2}:count=${section.galleryImages.length}` : '',
    section.galleryVideos && section.galleryVideos.length > 0 ? `gvid:${galleryVidPos.x},${galleryVidPos.y}` : '',
  ].filter(Boolean).join('|');

  // No dynamic height measurement needed — the section height is determined
  // naturally by its content (canvas + gallery in normal flow).
  // This avoids feedback loops and layout jumps when gallery column count changes.
  React.useLayoutEffect(() => {
    setGalleryFlowMargin(0);
  }, [heroPositionKey]);

  // Preserve the gallery's normal-flow height after it becomes draggable.
  // Without this footprint, switching it to absolute positioning collapses the
  // hero, which makes the grid jump and exposes the preview background.
  React.useLayoutEffect(() => {
    const gallery = elementRefs.current.galleryImages;
    if (!gallery) return;

    const updateHeight = () => {
      const height = gallery.getBoundingClientRect().height;
      if (height > 0) setGalleryFlowHeight((current) => Math.abs(current - height) > 0.5 ? height : current);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(gallery);
    return () => observer.disconnect();
  }, [section.galleryImages?.length, section.galleryGridCols, previewMode]);

  // Preserve the gallery videos' normal-flow height after they become draggable.
  // Same pattern as gallery images above.
  React.useLayoutEffect(() => {
    const videos = elementRefs.current.galleryVideos;
    if (!videos) return;

    const updateHeight = () => {
      const height = videos.getBoundingClientRect().height;
      if (height > 0) setGalleryVideosFlowHeight((current) => Math.abs(current - height) > 0.5 ? height : current);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(videos);
    return () => observer.disconnect();
  }, [section.galleryVideos?.length, previewMode]);

  // In 'simple' layout mode, render a simple centered layout (after all hooks)
  // In 'flexible' layout mode, always use free-form (ignore freeFormEnabled flag)
  const layoutMode = usePortfolioStore((s) => s.portfolio.layoutMode);
  if (layoutMode === 'simple') {
    return (
      <section ref={sectionRef} className={cn("relative flex flex-col items-center justify-center text-center px-2 pt-20 pb-2", (section.galleryImages?.length || section.galleryVideos?.length) && "min-h-[auto]", section.backgroundType === 'video' && "min-h-screen")} style={heroSurfaceStyle}>

        {/* Background layer — clipped independently so gallery content can overflow freely */}
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          {section.backgroundType === 'video' && section.backgroundValue && (
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-contain">
              <source src={section.backgroundValue} />
            </video>
          )}
          {overlayStyle && Object.keys(overlayStyle).length > 0 && <div style={overlayStyle} />}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 max-w-[100%] w-full">
          {section.showAvatar !== false && section.avatar && (
            <OptimizedImage src={section.avatar} alt={section.name} className={cn('object-cover border-4 border-white shadow-lg', getAvatarShapeClass())} style={getAvatarSize().style} width={getAvatarSize().width} height={getAvatarSize().height} />
          )}
          {section.showName !== false && (
            <h1 className="text-4xl md:text-5xl font-bold" style={getTextStyle(section.textStyles, 'name', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.name}</h1>
          )}
          {section.showTitle !== false && (
            section.typingWords && section.typingWords.length > 0 ? (
              <h2 className="text-xl md:text-2xl font-medium" style={getTextStyle(section.textStyles, 'title', { color: '#000000' })}>
                <TypingAnimation words={section.typingWords} typeSpeed={100} deleteSpeed={50} delayBetween={2000} />
              </h2>
            ) : (
              <h2 className="text-xl md:text-2xl font-medium" style={getTextStyle(section.textStyles, 'title', { color: '#000000' })}>{section.title}</h2>
            )
          )}
          {section.showSubtitle !== false && (
            <p className="text-lg" style={getTextStyle(section.textStyles, 'subtitle', { color: '#000000' })}>{section.subtitle}</p>
          )}
          {section.showBio !== false && (
            <p className="text-base" style={getTextStyle(section.textStyles, 'bio', { color: theme.colors.text })}>{section.bio}</p>
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
                    // If linkId already starts with 'section-', use it directly as the element ID
                    // (section divs have id="section-{sectionId}", e.g. "section-about-1")
                    // Otherwise, prepend 'section-' to match the div ID format
                    let el = document.getElementById(linkId.startsWith('section-') ? linkId : `section-${linkId}`);
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
          {section.galleryImages && section.galleryImages.length > 0 && (
            <div className="w-full mt-4 flex justify-center">
              <div
                className="grid gap-6"
                style={{
                  gridTemplateColumns: `repeat(${section.galleryGridCols || 2}, minmax(0, 1fr))`,
                  maxWidth: '1136px',
                  width: '100%',
                }}
              >
 
                {section.galleryImages.map((img) => {
                  const cols = section.galleryGridCols || 2;
                  const tileWidth = 1136 / cols;
                  // Uniform tile height based on a 4:3 aspect ratio
                  const tileHeight = (tileWidth * 3) / 4;
                  // CSS mask for blurred/feathered border effect
                  const featherMask = 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)';
                  return (
                    <div
                      key={img.id}
                      className="relative group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 rounded-lg"
                      style={{ aspectRatio: '4 / 3' }}
                      onClick={() => setFullscreenImage(img.url)}
                    >
                      {/* Blurred background fill using the image's own pixels */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${img.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(20px)',
                          transform: 'scale(1.1)',
                        }}
                      />
                      {/* Full image on top with feathered/blurred border */}
                      <OptimizedImage
                        src={img.url}
                        alt={img.caption || 'Gallery'}
                        className="w-full h-full object-cover relative z-10"
                        style={{
                          objectPosition: 'center',
                          WebkitMaskImage: featherMask,
                          maskImage: featherMask,
                          WebkitMaskComposite: 'intersect',
                          maskComposite: 'intersect',
                        }}
                        width={Math.round(tileWidth)}
                        height={Math.round(tileHeight)}
                      />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {section.galleryVideos && section.galleryVideos.length > 0 && (
            <div className="w-full mt-4 flex justify-center">
              <div
                className="grid gap-6"
                style={{
                  gridTemplateColumns: `repeat(${section.galleryVideoGridCols || 1}, minmax(0, 1fr))`,
                  maxWidth: '1136px',
                  width: '100%',
                }}
              >
                {section.galleryVideos.map((video) => (
                  <div key={video.id} className="relative group rounded-lg overflow-hidden bg-gray-900 aspect-video">
                    {video.type === 'youtube' ? (
                      <iframe
                        src={video.url}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={video.caption || 'Video'}
                      />
                    ) : video.type === 'vimeo' ? (
                      <iframe
                        src={video.url}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                        title={video.caption || 'Video'}
                      />
                    ) : (
                      <video className="w-full h-full object-cover" controls>
                        <source src={video.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {section.showScrollIndicator && (

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToNext}>
            <ChevronDown className="w-6 h-6" style={{ color: theme.colors.text }} />
          </div>
        )}

        {fullscreenImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <div className="relative max-w-4xl max-h-screen">
              <OptimizedImage
                src={fullscreenImage}
                alt="Fullscreen"
                className="max-w-full max-h-screen object-contain"
                width={1200}
                height={800}
              />
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                onClick={() => setFullscreenImage(null)}
                title="Close"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                Click anywhere to close
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Section height: fixed canvas (60vh) + gallery flows naturally below.
  // The grid is a standalone block, not an overlay inside the free-form text canvas.
  // Legacy saved positions are intentionally ignored to prevent content overlap.
  const galleryIsDragged = !!section.galleryImagesPosition;
  const galleryFlowOffset = galleryFlowOffsetPx;

  // When the gallery is dragged (absolutely positioned) it no longer
  // contributes to the section's natural height.  Use the measured
  // galleryFlowHeight (tracked via ResizeObserver) to make the section
  // tall enough so the background covers the entire gallery — especially
  // important for a single-column layout which can be very tall.
  const isVideoBg = section.backgroundType === 'video' && !!section.backgroundValue;
  const canvasMinHeight = isVideoBg ? 600 : 480; // taller canvas for video backgrounds
  const galleryVideosIsDragged = !!section.galleryVideosPosition;
  // Account for both gallery images and videos heights when calculating the
  // section's minHeight so the background always covers all content.
  // Only count the height of gallery content that is DRAGGED (absolute, out of flow).
  // Content in normal flow already contributes to the section's natural height,
  // so adding it to minHeight would double-count and create a huge gap.
  const draggedGalleryHeight = (galleryIsDragged ? galleryFlowHeight : 0) + (galleryVideosIsDragged ? galleryVideosFlowHeight : 0);
  const anyGalleryDragged = galleryIsDragged || galleryVideosIsDragged;
  const hasGallery = (section.galleryImages && section.galleryImages.length > 0) || (section.galleryVideos && section.galleryVideos.length > 0);
  // Calculate the actual bottom of dragged gallery content.
  // Position is a percentage of the flow container, which has height = galleryFlowHeight.
  // Gallery bottom = (positionY% * flowHeight) + galleryHeight
  const galleryImgBottom = galleryIsDragged && galleryFlowHeight > 0 && section.galleryImagesPosition
    ? (section.galleryImagesPosition.y / 100) * galleryFlowHeight + galleryFlowHeight
    : 0;
  const galleryVidBottom = galleryVideosIsDragged && galleryVideosFlowHeight > 0 && section.galleryVideosPosition
    ? (section.galleryVideosPosition.y / 100) * galleryVideosFlowHeight + galleryVideosFlowHeight
    : 0;
  // Canvas is in normal flow with minHeight 400px
  const contentBottom = Math.max(400, galleryImgBottom, galleryVidBottom);
  const dynamicMinHeight = anyGalleryDragged && contentBottom > 400
    ? `${contentBottom + 20}px`
    : isVideoBg ? '100vh' : 'auto';


  return (
    <section ref={sectionRef} className="relative" style={{ ...heroSurfaceStyle, minHeight: dynamicMinHeight }}>

      {/* Background layer — parallax-enabled when section.parallaxEnabled is true */}
      {section.backgroundType === 'video' && section.backgroundValue && (
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-contain" style={{ zIndex: 0 }}>
          <source src={section.backgroundValue} />
        </video>
      )}
      {section.backgroundType === 'image' && section.backgroundValue && section.parallaxEnabled && (
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <Parallax speed={0.3} className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${section.backgroundValue})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                // Scale up slightly so the parallax movement doesn't reveal edges
                width: '120%',
                height: '120%',
                left: '-10%',
                top: '-10%',
              }}
            />
          </Parallax>
        </div>
      )}
      {overlayStyle && Object.keys(overlayStyle).length > 0 && <div style={overlayStyle} />}

      {/* Fixed-height free-form canvas for text elements (avatar, name, title, subtitle, bio, CTA) */}
      {/* Positions use % within this stable canvas, not the full expanding section */}
      {/* Canvas height is measured from the actual bottom edge of the lowest text element + 20px gap */}
      {/* Snap guide lines — rendered at the section level so they are visible
          across the full section height, including when dragging gallery
          images/videos which live below the 60vh canvas. */}
      {dragging && snapEnabled && snapLines.vertical !== undefined && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-30"
          style={{ left: `${snapLines.vertical}%`, width: '1px', backgroundColor: '#3b82f6', boxShadow: '0 0 4px rgba(59,130,246,0.6)' }}
        />
      )}
      {dragging && snapEnabled && snapLines.horizontal !== undefined && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-30"
          style={{ top: `${snapLines.horizontal}%`, height: '1px', backgroundColor: '#3b82f6', boxShadow: '0 0 4px rgba(59,130,246,0.6)' }}
        />
      )}

      <div ref={canvasRef} className="relative flex flex-col items-center gap-4 pt-20 pb-8" style={{ height: 'auto', minHeight: isVideoBg ? '100vh' : '60vh', zIndex: 10, pointerEvents: 'none' }}>

        {/* Background Shapes — rendered behind text elements (zIndex 0-9) */}
        {(section.backgroundShapes || []).map((shape) => (
          <div
            key={shape.id}
            className={cn('absolute', !previewMode && 'cursor-move', dragging === `shape-${shape.id}` && 'z-20')}
            style={{
              left: `${shape.position.x}%`,
              top: `${shape.position.y}%`,
              width: `${shape.width}px`,
              height: `${shape.height}px`,
              zIndex: shape.zIndex,
              pointerEvents: 'auto',
              transform: `translate(-50%, -50%) rotate(${shape.rotation || 0}deg)`,
            }}
            onMouseDown={(e) => handleMouseDown(e, `shape-${shape.id}` as any)}
            onTouchStart={(e) => handleTouchStart(e, `shape-${shape.id}` as any)}
          >
            {shape.shape === 'rectangle' && (
              <div style={{ width: '100%', height: '100%', backgroundColor: shape.color, opacity: shape.opacity / 100 }} />
            )}
            {shape.shape === 'rounded' && (
              <div style={{ width: '100%', height: '100%', backgroundColor: shape.color, opacity: shape.opacity / 100, borderRadius: `${shape.borderRadius || 16}px` }} />
            )}
            {shape.shape === 'circle' && (
              <div style={{ width: '100%', height: '100%', backgroundColor: shape.color, opacity: shape.opacity / 100, borderRadius: '50%' }} />
            )}
            {shape.shape === 'triangle' && (
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: shape.opacity / 100 }}>
                <polygon points="50,0 100,100 0,100" fill={shape.color} />
              </svg>
            )}
            {/* Corner + edge resize handles — only in edit mode */}
            {!previewMode && (
              <>
                {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map((handle) => {
                  const positions: Record<string, React.CSSProperties> = {
                    nw: { top: -6, left: -6, cursor: 'nwse-resize' },
                    n:  { top: -6, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
                    ne: { top: -6, right: -6, cursor: 'nesw-resize' },
                    e:  { top: '50%', right: -6, transform: 'translateY(-50%)', cursor: 'ew-resize' },
                    se: { bottom: -6, right: -6, cursor: 'nwse-resize' },
                    s:  { bottom: -6, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
                    sw: { bottom: -6, left: -6, cursor: 'nesw-resize' },
                    w:  { top: '50%', left: -6, transform: 'translateY(-50%)', cursor: 'ew-resize' },
                  };
                  const isCorner = handle.length === 2;
                  return (
                    <div
                      key={handle}
                      className={cn(
                        'absolute bg-blue-500 border-2 border-white rounded-sm shadow-sm z-30',
                        isCorner ? 'w-3.5 h-3.5' : 'w-3 h-3.5'
                      )}
                      style={{ ...positions[handle], pointerEvents: 'auto' }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setResizing({ id: shape.id, corner: handle, startWidth: shape.width, startHeight: shape.height, startMouseX: e.clientX, startMouseY: e.clientY, startPosX: shape.position.x, startPosY: shape.position.y });
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const touch = e.touches[0];
                        setResizing({ id: shape.id, corner: handle, startWidth: shape.width, startHeight: shape.height, startMouseX: touch.clientX, startMouseY: touch.clientY, startPosX: shape.position.x, startPosY: shape.position.y });
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
        ))}

        {/* Avatar */}
        {section.showAvatar !== false && section.avatar && (
          <div ref={(node) => { elementRefs.current['avatar'] = node; }} className={cn(avatarPos ? 'absolute transform -translate-x-1/2 -translate-y-1/2' : '', !previewMode && 'cursor-move', dragging === 'avatar' && 'z-20')}
            style={avatarPos ? { left: `${avatarPos.x}%`, top: `${avatarPos.y}%`, zIndex: 10, pointerEvents: 'auto' } : { zIndex: 10, pointerEvents: 'auto' }}
            onMouseDown={(e) => handleMouseDown(e, 'avatar')}
            onTouchStart={(e) => handleTouchStart(e, 'avatar')}>
            <OptimizedImage src={section.avatar} alt={section.name} className={cn('object-cover border-4 border-white shadow-lg', getAvatarShapeClass())} style={getAvatarSize().style} width={getAvatarSize().width} height={getAvatarSize().height} />
          </div>
        )}

        {/* Name */}
        {section.showName !== false && (
          <div ref={(node) => { elementRefs.current['name'] = node; }} className={cn(namePos ? 'absolute transform -translate-x-1/2 -translate-y-1/2' : '', 'text-center', !previewMode && 'cursor-move', dragging === 'name' && 'z-20')}
            style={namePos ? { left: `${namePos.x}%`, top: `${namePos.y}%`, zIndex: 10, pointerEvents: 'auto' } : { zIndex: 10, pointerEvents: 'auto' }}
            onMouseDown={(e) => handleMouseDown(e, 'name')}>
            <h1 className="text-4xl md:text-5xl font-bold whitespace-nowrap" style={getTextStyle(section.textStyles, 'name', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.name}</h1>
          </div>
        )}

        {/* Title */}
        {section.showTitle !== false && (
          <div ref={(node) => { elementRefs.current['title'] = node; }} className={cn(titlePos ? 'absolute transform -translate-x-1/2 -translate-y-1/2' : '', 'text-center', !previewMode && 'cursor-move', dragging === 'title' && 'z-20')}
            style={titlePos ? { left: `${titlePos.x}%`, top: `${titlePos.y}%`, zIndex: 10, pointerEvents: 'auto' } : { zIndex: 10, pointerEvents: 'auto' }}
            onMouseDown={(e) => handleMouseDown(e, 'title')}>
            {section.typingWords && section.typingWords.length > 0 ? (
              <h2 className="text-xl md:text-2xl font-medium whitespace-nowrap" style={getTextStyle(section.textStyles, 'title', { color: '#000000' })}>
                <TypingAnimation words={section.typingWords} typeSpeed={100} deleteSpeed={50} delayBetween={2000} />
              </h2>
            ) : (
              <h2 className="text-xl md:text-2xl font-medium whitespace-nowrap" style={getTextStyle(section.textStyles, 'title', { color: '#000000' })}>{section.title}</h2>
            )}
          </div>
        )}

        {/* Subtitle */}
        {section.showSubtitle !== false && (
          <div ref={(node) => { elementRefs.current['subtitle'] = node; }} className={cn(subtitlePos ? 'absolute transform -translate-x-1/2 -translate-y-1/2' : '', 'text-center', !previewMode && 'cursor-move', dragging === 'subtitle' && 'z-20')}
            style={subtitlePos ? { left: `${subtitlePos.x}%`, top: `${subtitlePos.y}%`, zIndex: 10, pointerEvents: 'auto' } : { zIndex: 10, pointerEvents: 'auto' }}
            onMouseDown={(e) => handleMouseDown(e, 'subtitle')}>
            <p className="text-lg whitespace-nowrap" style={getTextStyle(section.textStyles, 'subtitle', { color: '#000000' })}>{section.subtitle}</p>
          </div>
        )}

        {/* Bio — top-aligned so tall content renders below the drop point */}
        {section.showBio !== false && (
          <div ref={(node) => { elementRefs.current['bio'] = node; }} className={cn(bioPos ? 'absolute transform -translate-x-1/2' : '', 'text-center', !previewMode && 'cursor-move', dragging === 'bio' && 'z-20')}
            style={bioPos ? { left: `${bioPos.x}%`, top: `${bioPos.y}%`, zIndex: 10, pointerEvents: 'auto', maxWidth: section.textStyles?.bio?.maxWidth || 'min(500px, 80vw)' } : { zIndex: 10, pointerEvents: 'auto' }}
            onMouseDown={(e) => handleMouseDown(e, 'bio')}>
            <p className="text-base" style={getTextStyle(section.textStyles, 'bio', { color: theme.colors.text })}>{section.bio}</p>
          </div>
        )}

        {/* CTA Buttons */}
        {section.ctaButtons && section.ctaButtons.length > 0 && (
          <div className={cn(ctaPos ? 'absolute transform -translate-x-1/2 -translate-y-1/2' : '', 'flex flex-col sm:flex-row gap-3 sm:gap-4 items-center', !previewMode && 'cursor-move', dragging === 'ctaButtons' && 'z-20')}
            style={ctaPos ? { left: `${ctaPos.x}%`, top: `${ctaPos.y}%`, zIndex: 10, pointerEvents: 'auto' } : { zIndex: 10, pointerEvents: 'auto' }}
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
                  // If linkId already starts with 'section-', use it directly as the element ID
                  // (section divs have id="section-{sectionId}", e.g. "section-about-1")
                  // Otherwise, prepend 'section-' to match the div ID format
                  let el = document.getElementById(linkId.startsWith('section-') ? linkId : `section-${linkId}`);
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

        {/* Scroll indicator */}
        {section.showScrollIndicator && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToNext}>
            <ChevronDown className="w-6 h-6" style={{ color: theme.colors.text }} />
          </div>
        )}

      </div>{/* End of fixed-height free-form canvas */}

      {/* Gallery and Videos flow below the canvas in normal document flow */}
      <div
        ref={flowContainerRef}
        className={cn(galleryIsDragged ? 'absolute left-0 right-0 top-0' : 'relative')}
        style={galleryIsDragged
          ? { zIndex: 5, pointerEvents: 'none', height: galleryFlowHeight > 0 ? `${galleryFlowHeight}px` : 'max(60vh, 480px)' }
          : { zIndex: 5, paddingBottom: '0.5rem', marginTop: `${galleryFlowMargin + galleryFlowOffset}px` }

        }
      >


      {/* Gallery Images — absolutely positioned: uses autoGalleryTop (measured from bio bottom + 24px) when not dragged, or saved position when dragged */}
      {section.galleryImages && section.galleryImages.length > 0 && (() => {
        const isDragged = !!section.galleryImagesPosition;
        return (
        <div
          ref={(node) => { elementRefs.current['galleryImages'] = node; }}
          className={cn(
            isDragged ? 'absolute transform -translate-x-1/2' : 'w-full flex justify-center',

          )}
          style={isDragged ? {
            left: `${section.galleryImagesPosition!.x}%`,
            top: `${section.galleryImagesPosition!.y}%`,
            zIndex: dragging === 'galleryImages' ? 20 : 5,
            pointerEvents: 'auto',
            width: '80%',
            maxWidth: '1136px',
          } : {
            zIndex: 5,
            pointerEvents: 'auto',
            padding: '0 0 0.5rem',
            width: '80%',
            maxWidth: '1136px',
            margin: '0 auto',
            boxSizing: 'border-box',
            position: 'relative',
          }}

        >
          {/* Drag handle — only visible in edit mode */}
          {!previewMode && (
            <div
              className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-full items-center justify-center gap-2 py-2 cursor-move text-white/70 hover:text-white transition-colors select-none"
              onMouseDown={(e) => handleMouseDown(e, 'galleryImages')}
              onTouchStart={(e) => handleTouchStart(e, 'galleryImages')}
              style={{ touchAction: 'none' }}
            >
              <GripVertical className="w-5 h-5" />
              <span className="text-xs font-medium">Drag to move gallery</span>
              <GripVertical className="w-5 h-5" />
            </div>
          )}
          <div
            className="grid gap-6"
            style={{
              width: '100%',
              maxWidth: 'none',
              gridTemplateColumns: `repeat(${section.galleryGridCols || 2}, minmax(0, 1fr))`,
            }}
          >
            {section.galleryImages.map((img) => {
              const cols = section.galleryGridCols || 2;
              const tileWidth = 1136 / cols;
              const tileHeight = (tileWidth * 3) / 4;
              const featherMask = 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)';
              return (
                <div
                  key={img.id}
                  className="relative group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 rounded-lg"
                  style={{ aspectRatio: '4 / 3' }}
                  onClick={(e) => { e.stopPropagation(); setFullscreenImage(img.url); }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${img.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(20px)',
                      transform: 'scale(1.1)',
                    }}
                  />
                  <OptimizedImage
                    src={img.url}
                    alt={img.caption || 'Gallery'}
                    className="w-full h-full object-cover relative z-10"
                    style={{
                      objectPosition: 'center',
                      WebkitMaskImage: featherMask,
                      maskImage: featherMask,
                      WebkitMaskComposite: 'intersect',
                      maskComposite: 'intersect',
                    }}
                    width={Math.round(tileWidth)}
                    height={Math.round(tileHeight)}
                  />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      {img.caption}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
      })()}

      {/* When gallery images are dragged (absolute, out of flow), add a spacer
          inside the flow container so the videos below are pushed to the bottom
          of the photo grid. The spacer height is tracked by ResizeObserver so
          it updates when the column count changes. */}
      {galleryIsDragged && galleryFlowHeight > 0 && section.galleryVideos && section.galleryVideos.length > 0 && !section.galleryVideosPosition && (
        <div style={{ height: `${galleryFlowHeight + 24}px` }} />
      )}

      {/* Gallery Videos — inside the flow container so they naturally follow
          the gallery images. When not dragged, they flow after the images.
          When dragged (absolute), they can be freely positioned. */}
      {section.galleryVideos && section.galleryVideos.length > 0 && (
        <div
          ref={(node) => { elementRefs.current['galleryVideos'] = node; }}
          className={cn(
            section.galleryVideosPosition ? 'absolute transform -translate-x-1/2' : 'w-full flex justify-center',
            !previewMode && 'cursor-move',
            dragging === 'galleryVideos' && 'z-20'
          )}
          style={section.galleryVideosPosition ? {
            left: `${section.galleryVideosPosition.x}%`,
            top: `${section.galleryVideosPosition.y}%`,
            zIndex: 5,
            width: '80%',
            maxWidth: '1136px',
            pointerEvents: 'auto',
          } : {
            zIndex: 1,
            padding: '0 0 2rem',
            width: '100%',
            maxWidth: '1136px',
            margin: '24px auto 0 auto',
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'galleryVideos')}


          onTouchStart={(e) => handleTouchStart(e, 'galleryVideos')}
        >

          {/* Drag handle — only visible in edit mode */}
          {!previewMode && (
            <div
              className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-full items-center justify-center gap-2 py-2 cursor-move text-white/70 hover:text-white transition-colors select-none"
              onMouseDown={(e) => handleMouseDown(e, 'galleryVideos')}
              onTouchStart={(e) => handleTouchStart(e, 'galleryVideos')}
              style={{ touchAction: 'none' }}
            >
              <GripVertical className="w-5 h-5" />
              <span className="text-xs font-medium">Drag to move videos</span>
              <GripVertical className="w-5 h-5" />
            </div>
          )}
          <div className="grid gap-6" style={{ width: '100%', gridTemplateColumns: `repeat(${section.galleryVideoGridCols || 1}, minmax(0, 1fr))` }}>
            {section.galleryVideos.map((video) => (
              <div key={video.id} className="relative group rounded-lg overflow-hidden bg-gray-900 cursor-pointer" style={{ aspectRatio: '16 / 9', width: '100%', minHeight: '200px' }} onClick={(e) => { if (previewMode) { e.stopPropagation(); setFullscreenVideo(video); } }}>

                {video.type === 'youtube' ? (
                  <iframe src={video.url} className="w-full h-full" style={{ pointerEvents: previewMode ? 'auto' : 'none' }} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title={video.caption || 'Video'} />
                ) : video.type === 'vimeo' ? (
                  <iframe src={video.url} className="w-full h-full" style={{ pointerEvents: previewMode ? 'auto' : 'none' }} allowFullScreen allow="autoplay; fullscreen; picture-in-picture" title={video.caption || 'Video'} />
                ) : (
                  <video className="w-full h-full object-cover" style={{ pointerEvents: previewMode ? 'auto' : 'none' }} controls><source src={video.url} type="video/mp4" />Your browser does not support the video tag.</video>
                )}
                {!previewMode && <div className="absolute inset-0" style={{ cursor: 'move' }} />}
                {previewMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      </div>{/* End of gallery/videos flow container */}

      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="relative max-w-4xl max-h-screen" onClick={(e) => e.stopPropagation()}>
            <OptimizedImage src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain" width={1200} height={800} />
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
              title="Close"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {fullscreenVideo && (
        <div
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-4"
          onClick={() => setFullscreenVideo(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
              {fullscreenVideo.type === 'youtube' ? (
                <iframe src={fullscreenVideo.url} className="absolute top-0 left-0 w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title={fullscreenVideo.caption || 'Video'} />
              ) : fullscreenVideo.type === 'vimeo' ? (
                <iframe src={fullscreenVideo.url} className="absolute top-0 left-0 w-full h-full" allowFullScreen allow="autoplay; fullscreen; picture-in-picture" title={fullscreenVideo.caption || 'Video'} />
              ) : (
                <video className="absolute top-0 left-0 w-full h-full" controls autoPlay><source src={fullscreenVideo.url} type="video/mp4" />Your browser does not support the video tag.</video>
              )}
            </div>
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
              onClick={() => setFullscreenVideo(null)}
              title="Close"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

    </section>
  );
}



// ============ ABOUT ============
function AboutPreview({ section, theme }: { section: AboutSection; theme: any }) {
  const { updateSection } = usePortfolioStore();
  const previewMode = usePortfolioStore((s) => s.previewMode);
  const imageShapeClass = section.imageShape === 'circle' ? 'rounded-full' : section.imageShape === 'square' ? 'rounded-none' : 'rounded-lg';
  const imageLayout = section.imageLayout || 'left';
  const imageSize = section.imageSize || 'medium';
  const imageWidthClass = imageSize === 'small' ? 'md:w-1/4' : imageSize === 'large' ? 'md:w-1/2' : 'md:w-1/3';
  const imageBorderClass = section.imageBorder ? `border-4 border-solid` : '';
  const imageShadowClass = section.imageShadow !== false ? 'shadow-lg' : '';

  // Video embed — auto-detect platform from URL, then convert to embeddable URL
  const videoEmbedUrl = section.videoUrl ? (() => {
    const url = section.videoUrl.trim();
    // Auto-detect: check URL first, fall back to stored videoType
    const isVimeoUrl = url.includes('vimeo.com');
    const isYouTubeUrl = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = isVimeoUrl || (!isYouTubeUrl && section.videoType === 'vimeo');

    if (isVimeo) {
      const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      return url;
    }

    // YouTube
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    if (url.includes('/embed/')) return url;
    const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    const liveMatch = url.match(/\/live\/([a-zA-Z0-9_-]+)/);
    if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}`;
    // Fallback
    return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
  })() : null;


  // Free-form mode
  if (section.freeFormEnabled) {
    const positions = (section as any).elementPositions || {};
    const snapEnabled = section.snapEnabled !== false;
    const defaultPositions: Record<string, ElementPosition> = {
      title: { x: 50, y: 5 },
      tagline: { x: 50, y: 10 },
      bio: { x: 50, y: 16 },
      quote: { x: 50, y: 24 },
      image: { x: 50, y: 34 },
      secondImage: { x: 50, y: 48 },
      quickFacts: { x: 50, y: 58 },
      video: { x: 50, y: 66 },
      cta: { x: 50, y: 76 },
    };



    // Migration: if saved positions match ANY previous set of defaults,
    // reset them so the new defaults take effect.
    const isOldLayout =
      // Original defaults
      (positions.image?.x === 50 && positions.image?.y === 18 &&
       positions.secondImage?.x === 50 && positions.secondImage?.y === 38 &&
       positions.bio?.x === 50 && positions.bio?.y === 45) ||
      // Intermediate defaults v1
      (positions.image?.x === 50 && positions.image?.y === 40 &&
       positions.secondImage?.x === 50 && positions.secondImage?.y === 55 &&
       positions.bio?.x === 50 && positions.bio?.y === 22) ||
      // Intermediate defaults v2
      (positions.image?.x === 50 && positions.image?.y === 30 &&
       positions.secondImage?.x === 50 && positions.secondImage?.y === 75 &&
       positions.bio?.x === 50 && positions.bio?.y === 16) ||
      // Intermediate defaults v3 (quote after images)
      (positions.image?.x === 50 && positions.image?.y === 28 &&
       positions.secondImage?.x === 50 && positions.secondImage?.y === 42 &&
       positions.quote?.x === 50 && positions.quote?.y === 52);


    // Use migrated positions: if old layout detected, ignore saved positions
    const effectivePositions = isOldLayout ? {} : positions;





    const elements: FreeFormElement[] = [
      {
        key: 'title',
        visible: section.showTitle !== false,
        position: effectivePositions.title,
        defaultPosition: defaultPositions.title,

        content: <h2 className="text-3xl font-bold text-center whitespace-nowrap" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>,
      },
      {
        key: 'tagline',
        visible: section.showTagline !== false && !!section.tagline,
        position: effectivePositions.tagline,

        defaultPosition: defaultPositions.tagline,
        content: <p className="text-lg italic text-center whitespace-nowrap" style={{ color: '#000000' }}>{section.tagline}</p>,

      },
      {
        key: 'bio',
        visible: section.showBio !== false,
        position: effectivePositions.bio,
        defaultPosition: defaultPositions.bio,

        content: <div style={{ width: section.textStyles?.content?.maxWidth || '384px', textAlign: 'center', boxSizing: 'border-box' }}><p style={getTextStyle(section.textStyles, 'content', { color: theme.colors.text, whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word' })}>{section.content}</p>{section.secondParagraph && <p className="mt-4" style={{ color: theme.colors.textSecondary, whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{section.secondParagraph}</p>}</div>,
      },
      {
        key: 'secondImage',
        visible: !!section.secondImageUrl,
        position: effectivePositions.secondImage,
        defaultPosition: defaultPositions.secondImage,
        zIndex: 1,

        content: section.secondImageUrl ? <div style={{ width: `${section.secondImageWidth || 300}px` }}><OptimizedImage src={section.secondImageUrl} alt="Workspace" className={cn('w-full object-cover rounded-lg shadow-md', imageShapeClass, imageBorderClass, imageShadowClass)} width={section.secondImageWidth || 300} height={section.secondImageHeight || 200} style={{ maxHeight: `${section.secondImageHeight || 200}px` }} /></div> : null,
      },
      {
        key: 'image',
        visible: section.showImage !== false && !!section.imageUrl,
        position: effectivePositions.image,
        defaultPosition: defaultPositions.image,
        zIndex: 10,

        content: section.imageUrl ? <div style={{ width: `${section.imageWidth || 896}px` }}><OptimizedImage src={section.imageUrl} alt="About" className={cn('w-full object-cover', imageShapeClass, imageBorderClass, imageShadowClass)} width={section.imageWidth || 896} height={section.imageHeight || 300} style={{ maxHeight: `${section.imageHeight || 300}px` }} /></div> : null,
      },





      {
        key: 'quote',
        visible: section.showPersonalQuote !== false && !!section.personalQuote,
        position: effectivePositions.quote,
        defaultPosition: defaultPositions.quote,

        content: <blockquote className="px-6 py-4 border-l-4 italic text-xl max-w-md" style={{ borderColor: theme.colors.primary, color: theme.colors.text, backgroundColor: `${theme.colors.primary}10` }}>"{section.personalQuote}"</blockquote>,
      },
      {
        key: 'quickFacts',
        visible: section.showQuickFacts !== false && (section.quickFacts || []).length > 0,
        position: effectivePositions.quickFacts,
        defaultPosition: defaultPositions.quickFacts,

        content: <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{(section.quickFacts || []).map(fact => <div key={fact.id} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.primary}08` }}><div className="text-2xl font-bold" style={{ color: theme.colors.primary }}>{fact.value}</div><div className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{fact.label}</div></div>)}</div>,
      },
      {
        key: 'video',
        visible: section.showVideo !== false && !!videoEmbedUrl,
        position: effectivePositions.video,
        defaultPosition: defaultPositions.video,

        content: videoEmbedUrl ? <div className="rounded-lg overflow-hidden" style={{ width: '640px', height: '360px' }}><iframe src={videoEmbedUrl} className="w-full h-full" style={{ border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : null,
      },
      {
        key: 'cta',
        visible: (section.showCTA !== false && !!section.ctaButtonText) || (section.showResume !== false && !!section.resumeUrl),
        position: effectivePositions.cta,
        defaultPosition: defaultPositions.cta,

        content: (
          <div style={{ width: 'min(916px, calc(100vw - 380px))', minWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
            {section.showResume !== false && section.resumeUrl && (
              (section.resumeDisplayMode || 'embed') === 'embed' ? (
                <iframe
                  src={section.resumeUrl}
                  style={{ width: '100%', height: `${(section.resumeHeight || 600) * 1.5}px`, borderColor: `${theme.colors.primary}30`, borderRadius: theme.borderRadius, pointerEvents: previewMode ? 'auto' : 'none' }}
                  className="rounded-lg border"
                  title="Resume / CV"
                />
              ) : (
                <a href={section.resumeUrl} download className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium" style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }}>
                  <Download className="w-4 h-4" /> Resume
                </a>
              )
            )}
            {section.showCTA !== false && section.ctaButtonText && section.ctaButtonLink && (
              <a href={section.ctaButtonLink} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium" style={{ border: `2px solid ${theme.colors.primary}`, color: theme.colors.primary, borderRadius: theme.borderRadius }}>{section.ctaButtonText}</a>
            )}
          </div>
        ),
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
      <section className="pt-4 pb-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-4 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}


          {/* Tagline */}
          {section.showTagline !== false && section.tagline && (
            <p className="text-lg text-center mb-8 italic" style={{ color: '#000000' }}>
              {section.tagline}
            </p>

          )}

          {/* Main content row */}

          <div className="flex flex-col gap-8 items-center">
            <div className="w-full">
              {/* Main bio */}
              {section.showBio !== false && (
                <p className="text-center" style={getTextStyle(section.textStyles, 'content', { color: theme.colors.text, whiteSpace: 'pre-wrap' })}>{section.content}</p>
              )}


              {/* Second paragraph */}
              {section.showBio !== false && section.secondParagraph && (
                <p className="mt-4" style={{ color: theme.colors.textSecondary, whiteSpace: 'pre-wrap' }}>
                  {section.secondParagraph}
                </p>
              )}

              {/* Personal quote — right after bio, before images */}
              {section.showPersonalQuote !== false && section.personalQuote && (
                <blockquote
                  className="my-6 px-6 py-4 border-l-4 italic text-xl"
                  style={{ borderColor: theme.colors.primary, color: theme.colors.text, backgroundColor: `${theme.colors.primary}10` }}
                >
                  "{section.personalQuote}"
                </blockquote>
              )}

              {/* Portrait image — after bio */}
              {section.showImage !== false && section.imageUrl && (

                <div className="mt-8" style={{ width: `min(${section.imageWidth || 896}px, 100%)`, marginLeft: 'auto', marginRight: 'auto' }}>
                  <OptimizedImage
                    src={section.imageUrl}
                    alt="About"
                    className={cn('w-full object-cover', imageShapeClass, imageBorderClass, imageShadowClass)}
                    width={section.imageWidth || 896} height={section.imageHeight || 300}
                    style={{ maxHeight: `${section.imageHeight || 300}px` }}
                  />
                </div>
              )}

              {/* Second image (optional — workspace, secondary photo, etc.) */}
              {section.secondImageUrl && (
                <div className="mt-8" style={{ width: `min(${section.secondImageWidth || 300}px, 100%)`, marginLeft: 'auto', marginRight: 'auto' }}>
                  <OptimizedImage
                    src={section.secondImageUrl}
                    alt="Workspace"
                    className={cn('w-full object-cover rounded-lg shadow-md', imageShapeClass, imageBorderClass, imageShadowClass)}
                    width={section.secondImageWidth || 300} height={section.secondImageHeight || 200}
                    style={{ maxHeight: `${section.secondImageHeight || 200}px` }}
                  />
                </div>
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

              {/* CTA Button */}
              {section.showCTA !== false && section.ctaButtonText && section.ctaButtonLink && (
                <div className="mt-6">
                  <a
                    href={section.ctaButtonLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all hover:opacity-90"
                    style={{ border: `2px solid ${theme.colors.primary}`, color: theme.colors.primary, borderRadius: theme.borderRadius }}
                  >
                    {section.ctaButtonText}
                  </a>
                </div>
              )}
            </div>

          </div>

          {/* Resume — embedded PDF viewer or download button (after second image) */}
          {section.showResume !== false && section.resumeUrl && (
            (section.resumeDisplayMode || 'embed') === 'embed' ? (
              <div className="mt-8" style={{ width: 'min(916px, 100%)', marginLeft: 'auto', marginRight: 'auto' }}>
                <iframe
                  src={section.resumeUrl}
                  className="w-full rounded-lg border"
                  style={{ height: `${(section.resumeHeight || 600) * 1.5}px`, borderColor: `${theme.colors.primary}30`, borderRadius: theme.borderRadius }}
                  title="Resume / CV"
                />
              </div>
            ) : (
              <div className="mt-8">
                <a
                  href={section.resumeUrl}
                  download
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }}
                >
                  <Download className="w-4 h-4" /> Download Resume
                </a>
              </div>
            )
          )}

          {/* Gallery Images (uniform grid — all tiles same size, blurred background fill + feathered border) */}
          {section.showGallery !== false && section.galleryImages && section.galleryImages.length > 0 && (() => {
            const featherMask = 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)';
            return (
              <div className="mt-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {section.galleryImages.map((img) => (
                    <div key={img.id} className="relative group overflow-hidden rounded-lg shadow-md border border-gray-200" style={{ aspectRatio: '4 / 3' }}>
                      {/* Blurred background fill using the image's own pixels */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${img.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(20px)',
                          transform: 'scale(1.1)',
                        }}
                      />
                      {/* Full image on top with feathered/blurred border */}
                      <OptimizedImage
                        src={img.url}
                        alt={img.caption || 'Gallery'}
                        className="w-full h-full object-cover relative z-10"
                        style={{
                          objectPosition: 'center',
                          WebkitMaskImage: featherMask,
                          maskImage: featherMask,
                          WebkitMaskComposite: 'intersect',
                          maskComposite: 'intersect',
                        }}
                        width={300} height={225}
                      />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Video introduction */}

          {section.showVideo !== false && videoEmbedUrl && (
            <div className="mt-8 max-w-2xl mx-auto rounded-lg overflow-hidden">
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={videoEmbedUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Debug: show when video URL is set but video doesn't render */}
          {section.videoUrl && !videoEmbedUrl && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
              ⚠️ Video URL is set but could not be parsed. URL: "{section.videoUrl}"
            </div>
          )}
          {section.videoUrl && videoEmbedUrl && section.showVideo === false && (
            <div className="mt-8 p-4 bg-orange-50 border border-orange-300 rounded-lg text-sm text-orange-800">
              ⚠️ Video is hidden. Enable the "Show" toggle in the Video Introduction section of the editor.
            </div>
          )}

        </div>
      </section>
    </AnimatedSection>
  );
}



// ============ PROJECTS ============
function ProjectsPreview({ section, theme, onEditProject, selectedCategory: externalCategory, onSelectCategory }: { section: ProjectsSection; theme: any; onEditProject?: (project: Project) => void; selectedCategory?: string | null; onSelectCategory?: (category: string | null) => void }) {
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [internalCategory, setInternalCategory] = React.useState<string | null>(null);
  const selectedCategory = externalCategory !== undefined ? externalCategory : internalCategory;
  const setSelectedCategory = (cat: string | null) => {
    if (onSelectCategory) { onSelectCategory(cat); }
    else { setInternalCategory(cat); }
  };
  const [visibleCount, setVisibleCount] = React.useState(12);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const handleProjectClick = (project: Project) => {
    if (onEditProject) { onEditProject(project); }
    else { setSelectedProject(project); setIsModalOpen(true); }
  };

  const filteredProjects = selectedCategory ? section.projects.filter((p) => p.category === selectedCategory) : section.projects;
  const hasCategories = section.categories?.length > 0;

  // Lazy loading: slice projects to visibleCount
  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = filteredProjects.length > visibleCount;

  // Reset visible count when category changes
  React.useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory]);

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

  const aspectStyle = section.aspectRatio === '1:1' ? '1 / 1' : section.aspectRatio === '4:3' ? '4 / 3' : section.aspectRatio === '16:9' ? '16 / 9' : '4 / 3';
  const gridCols = section.columnCount || 3;

  const renderProjectCard = (project: Project) => (
    <div key={project.id} onClick={() => handleProjectClick(project)} className="cursor-pointer group">
      <div className="relative overflow-hidden mb-3" style={{ borderRadius: theme.borderRadius, aspectRatio: aspectStyle }}>
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

  // Category detail view: shows projects within a selected category
  if (selectedCategory) {
    const category = section.categories.find(c => c.name === selectedCategory);
    return (
      <section className="min-h-screen py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-6xl mx-auto">
          {/* Oval back button */}
          <button
            onClick={() => setSelectedCategory(null)}
            aria-label="Back to Categories"
            className="group inline-flex items-center gap-2 h-11 rounded-full shadow-md hover:shadow-lg transition-all duration-300 mb-6"
            style={{
              backgroundColor: theme.colors.primary,
              paddingLeft: '1.25rem',
              paddingRight: '1.25rem',
              color: 'white',
            }}
          >
            <ChevronLeft className="w-5 h-5 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span className="whitespace-nowrap text-sm font-medium">
              Back to Categories
            </span>
          </button>

          {/* Category header with faded number behind name */}
          {category && (
            <div className="mb-10 relative">
              {/* Faded large number behind the category name */}
              <span
                className="absolute -top-8 -left-2 select-none pointer-events-none font-bold leading-none"
                style={{
                  fontSize: '8rem',
                  color: theme.colors.primary,
                  opacity: 0.08,
                  zIndex: 0,
                }}
              >
                {String(filteredProjects.length).padStart(2, '0')}
              </span>
              {/* Category name and description on top */}
              <div className="relative" style={{ zIndex: 1 }}>
                <h2 className="text-4xl font-bold mb-1" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{category.name}</h2>
                {category.description && <p className="text-base" style={{ color: theme.colors.textSecondary }}>{category.description}</p>}
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                </p>
              </div>
            </div>
          )}

          {/* Projects grid */}
          {visibleProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500"><p>No projects in this category yet.</p></div>
          ) : (
            <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
              {visibleProjects.map(renderProjectCard)}
            </div>
          )}
          {hasMore && <div ref={loadMoreRef} className="py-8 flex justify-center">{Array.from({ length: Math.min(3, filteredProjects.length - visibleCount) }).map((_, i) => <ProjectCardSkeleton key={i} />)}</div>}
        </div>

        <ProjectDetailModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
          theme={theme}
          projects={filteredProjects}
          onNavigate={(project) => setSelectedProject(project)}
        />
      </section>
    );
  }

  // Category grid view: shows categories as tiles (like photo grid)
  return (
    <section className="min-h-screen py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
      <div className="max-w-[1600px] mx-auto">
        {section.showTitle !== false && (
          <h2 className="text-3xl font-bold mb-8 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
        )}

        {hasCategories ? (
          <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
            {section.categories.map((category) => {
              const projectCount = section.projects.filter(p => p.category === category.name).length;
              return (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className="cursor-pointer group flex flex-col md:flex-row items-stretch overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                  style={{ borderRadius: theme.borderRadius }}
                >
                  {/* Left side: category name and description */}
                  <div
                    className="flex flex-col justify-center p-6 md:w-1/2"
                    style={{ backgroundColor: `${theme.colors.primary}08` }}
                  >
                    <h3 className="text-5xl font-bold text-center" style={{ color: theme.colors.text, fontFamily: "'Blush Asliring', cursive", marginBottom: '50px' }}>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm mb-3" style={{ color: '#000000' }}>{category.description}</p>
                    )}
                    <p className="text-xs" style={{ color: theme.colors.primary }}>
                      {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                    </p>
                  </div>
                  {/* Right side: cover image */}
                  <div className="relative overflow-hidden md:w-1/2" style={{ aspectRatio: aspectStyle }}>
                    {category.imageUrl ? (
                      <OptimizedImage src={category.imageUrl} alt={category.name} fill className="object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No cover image</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* No categories: show all projects directly */
          section.layout === 'carousel' ? (
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
              {section.projects.map((project) => (
                <div key={project.id} className="flex-shrink-0 w-80 snap-center" onClick={() => handleProjectClick(project)}>
                  <div className="relative overflow-hidden mb-3 cursor-pointer group" style={{ borderRadius: theme.borderRadius, aspectRatio: aspectStyle }}>
                    {project.imageUrl ? <OptimizedImage src={project.imageUrl} alt={project.title} fill className="object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="text-gray-400">No image</span></div>}
                  </div>
                  <h3 className="font-medium text-sm" style={{ color: theme.colors.text }}>{project.title}</h3>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                {visibleProjects.map(renderProjectCard)}
              </div>
              {hasMore && <div ref={loadMoreRef} className="py-8 flex justify-center">{Array.from({ length: Math.min(3, filteredProjects.length - visibleCount) }).map((_, i) => <ProjectCardSkeleton key={i} />)}</div>}
            </>
          )
        )}
      </div>

      <ProjectDetailModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
        theme={theme}
        projects={filteredProjects}
        onNavigate={(project) => setSelectedProject(project)}
      />
    </section>
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
  const { updateSection } = usePortfolioStore();
  const layout = section.layout || 'left';

  // Free-form mode: each element (title + each experience) is independently draggable
  if (section.freeFormEnabled) {
    const positions = (section as any).elementPositions || {};
    const snapEnabled = section.snapEnabled !== false;

    // Build default positions: title at top, then each experience stacked below
    const defaultPositions: Record<string, ElementPosition> = {
      title: { x: 50, y: 5 },
    };
    section.experiences.forEach((_, i) => {
      defaultPositions[`exp-${i}`] = { x: 50, y: 10 + i * 8 };
    });

    const elements: FreeFormElement[] = [];

    // Title element
    elements.push({
      key: 'title',
      visible: section.showTitle !== false,
      position: positions.title,
      defaultPosition: defaultPositions.title,
      content: (
        <h2 className="text-3xl font-bold text-center whitespace-nowrap" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>
          {section.title}
        </h2>
      ),
    });

    // Each experience as its own draggable element
    section.experiences.forEach((exp, i) => {
      elements.push({
        key: `exp-${i}`,
        visible: true,
        position: positions[`exp-${i}`],
        defaultPosition: defaultPositions[`exp-${i}`],
        content: (
          <div className="relative pl-6 border-l-2" style={{ borderColor: theme.colors.primary, width: '500px' }}>
            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
            {exp.companyLogo && <OptimizedImage src={exp.companyLogo} alt={exp.company} className="w-8 h-8 rounded mb-2" width={32} height={32} />}
            <div className="mb-1">
              <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{exp.position}</h3>
              <p style={{ color: '#333333' }}>{exp.company}</p>
            </div>
            <p className="text-sm mb-2" style={{ color: '#555555' }}>{exp.startDate} - {exp.endDate || 'Present'}{exp.location && ` • ${exp.location}`}</p>
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
        ),
      });
    });

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
        minHeight="min-h-[200px]"
      />
    );
  }

  // Normal layout mode
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
                  <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{exp.position}</h3>
                  <p style={{ color: '#333333' }}>{exp.company}</p>
                </div>
                <p className="text-sm mb-2" style={{ color: '#555555' }}>{exp.startDate} - {exp.endDate || 'Present'}{exp.location && ` • ${exp.location}`}</p>
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
  const { updateSection } = usePortfolioStore();

  // Free-form mode: each element (title + each education) is independently draggable
  if (section.freeFormEnabled) {
    const positions = (section as any).elementPositions || {};
    const snapEnabled = section.snapEnabled !== false;

    const defaultPositions: Record<string, ElementPosition> = {
      title: { x: 50, y: 5 },
    };
    section.educations.forEach((_, i) => {
      defaultPositions[`edu-${i}`] = { x: 50, y: 10 + i * 8 };
    });

    const elements: FreeFormElement[] = [];

    elements.push({
      key: 'title',
      visible: section.showTitle !== false,
      position: positions.title,
      defaultPosition: defaultPositions.title,
      content: (
        <h2 className="text-3xl font-bold text-center whitespace-nowrap" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>
          {section.title}
        </h2>
      ),
    });

    section.educations.forEach((edu, i) => {
      elements.push({
        key: `edu-${i}`,
        visible: true,
        position: positions[`edu-${i}`],
        defaultPosition: defaultPositions[`edu-${i}`],
        content: (
          <div className="relative pl-6 border-l-2" style={{ borderColor: theme.colors.primary, width: '500px' }}>
            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
            {edu.logo && <OptimizedImage src={edu.logo} alt={edu.institution} className="w-8 h-8 rounded mb-2" width={32} height={32} />}
            <div className="mb-1">
              <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{edu.degree} in {edu.field}</h3>
              <p style={{ color: '#333333' }}>{edu.institution}</p>
            </div>
            <p className="text-sm mb-2" style={{ color: '#555555' }}>{edu.startDate} - {edu.endDate}</p>
            {edu.description && <p style={{ color: theme.colors.text }}>{edu.description}</p>}
          </div>
        ),
      });
    });

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
        minHeight="min-h-[200px]"
      />
    );
  }

  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-4xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-8 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          <div className="space-y-8">
            {section.educations.map((edu) => (
              <div key={edu.id} className="relative pl-6 border-l-2" style={{ borderColor: theme.colors.primary }}>
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                {edu.logo && <OptimizedImage src={edu.logo} alt={edu.institution} className="w-8 h-8 rounded mb-2" width={32} height={32} />}
                <div className="mb-1">
                  <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{edu.degree} in {edu.field}</h3>
                  <p style={{ color: '#333333' }}>{edu.institution}</p>
                </div>
                <p className="text-sm mb-2" style={{ color: '#555555' }}>{edu.startDate} - {edu.endDate}</p>
                {edu.description && <p style={{ color: theme.colors.text }}>{edu.description}</p>}
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
              // If linkId already starts with 'section-', use it directly as the element ID
              // (section divs have id="section-{sectionId}", e.g. "section-about-1")
              // Otherwise, prepend 'section-' to match the div ID format
              let el = document.getElementById(linkId.startsWith('section-') ? linkId : `section-${linkId}`);
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
  const [animatingSteps, setAnimatingSteps] = React.useState<Set<number>>(new Set());
  const [animatingConnectors, setAnimatingConnectors] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    const connectorTimers: ReturnType<typeof setTimeout>[] = [];

    section.steps.forEach((_, i) => {
      // Step animates at i * 750ms (600ms animation + 150ms stagger)
      stepTimers.push(
        setTimeout(() => {
          setAnimatingSteps((prev) => new Set([...prev, i]));
        }, i * 750)
      );
      // Connector animates at i * 750 + 600ms (after step animation completes)
      if (i < section.steps.length - 1) {
        connectorTimers.push(
          setTimeout(() => {
            setAnimatingConnectors((prev) => new Set([...prev, i]));
          }, i * 750 + 600)
        );
      }
    });

    return () => {
      stepTimers.forEach(clearTimeout);
      connectorTimers.forEach(clearTimeout);
    };
  }, [section.steps.length]);

  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-6xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-2 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          {section.showSubtitle !== false && section.subtitle && <p className="text-center mb-10" style={{ color: theme.colors.textSecondary }}>{section.subtitle}</p>}
          <div className={cn(layout === 'horizontal' ? 'flex flex-col md:flex-row gap-8' : 'flex flex-col gap-8 max-w-2xl mx-auto')}>
            {section.steps.map((step, i) => {
              const isStepAnimating = animatingSteps.has(i);
              const isConnectorAnimating = animatingConnectors.has(i);

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex-1 relative process-step-card group',
                    layout === 'horizontal' && 'text-center',
                    isStepAnimating && 'animate-none'
                  )}
                  style={{
                    animation: isStepAnimating ? `process-step-bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards` : 'none',
                    boxShadow: isStepAnimating ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-4 mb-4" style={layout === 'horizontal' ? { flexDirection: 'column' as const } : {}}>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 transition-all duration-300"
                      style={{
                        backgroundColor: theme.colors.primary,
                        animation: isStepAnimating ? `process-number-rotate-in 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards` : 'none',
                        boxShadow: isStepAnimating ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {step.number}
                    </div>
                    {layout === 'horizontal' && i < section.steps.length - 1 && (
                      <div className="hidden md:flex items-center transition-all duration-300" style={{ color: theme.colors.primary }}>
                        <div
                          style={{
                            width: '3rem',
                            height: '2px',
                            backgroundColor: theme.colors.primary,
                            animation: isConnectorAnimating ? `process-connector-slide-horizontal 0.5s ease-out forwards` : 'none',
                            opacity: isConnectorAnimating ? 1 : 0,
                          }}
                        />
                        <span className="text-lg leading-none -ml-1" style={{ opacity: isConnectorAnimating ? 1 : 0, transition: 'opacity 0.3s ease-out', transitionDelay: '0.3s' }}>›</span>
                      </div>
                    )}
                  </div>
                  {layout !== 'horizontal' && i < section.steps.length - 1 && (
                    <div className="flex items-center my-2 transition-all duration-300" style={{ color: theme.colors.primary }}>
                      <div
                        style={{
                          width: '2px',
                          height: '2rem',
                          backgroundColor: theme.colors.primary,
                          animation: isConnectorAnimating ? `process-connector-slide-vertical 0.5s ease-out forwards` : 'none',
                          opacity: isConnectorAnimating ? 1 : 0,
                        }}
                      />
                      <span className="text-lg leading-none -mt-1 ml-1" style={{ opacity: isConnectorAnimating ? 1 : 0, transition: 'opacity 0.3s ease-out', transitionDelay: '0.3s' }}>⌄</span>
                    </div>
                  )}
                  <h3
                    className="text-lg font-semibold mb-2 transition-all duration-500"
                    style={{
                      color: theme.colors.text,
                      opacity: isStepAnimating ? 1 : 0,
                      transform: isStepAnimating ? 'translateY(0)' : 'translateY(8px)',
                      transitionDelay: '0.2s',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm transition-all duration-500"
                    style={{
                      color: theme.colors.textSecondary,
                      opacity: isStepAnimating ? 1 : 0,
                      transform: isStepAnimating ? 'translateY(0)' : 'translateY(8px)',
                      transitionDelay: '0.35s',
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
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
  const { updateSection } = usePortfolioStore();

  // Free-form mode: each element (title + each award) is independently draggable
  if (section.freeFormEnabled) {
    const positions = (section as any).elementPositions || {};
    const snapEnabled = section.snapEnabled !== false;

    const defaultPositions: Record<string, ElementPosition> = {
      title: { x: 50, y: 5 },
    };
    section.awards.forEach((_, i) => {
      defaultPositions[`award-${i}`] = { x: 50, y: 10 + i * 8 };
    });

    const elements: FreeFormElement[] = [];

    elements.push({
      key: 'title',
      visible: section.showTitle !== false,
      position: positions.title,
      defaultPosition: defaultPositions.title,
      content: (
        <h2 className="text-3xl font-bold text-center whitespace-nowrap" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>
          {section.title}
        </h2>
      ),
    });

    section.awards.forEach((award, i) => {
      elements.push({
        key: `award-${i}`,
        visible: true,
        position: positions[`award-${i}`],
        defaultPosition: defaultPositions[`award-${i}`],
        content: (
          <div className="relative pl-6 border-l-2" style={{ borderColor: theme.colors.primary, width: '500px' }}>
            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
            <div className="mb-1">
              <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{award.title}</h3>
              <p style={{ color: '#333333' }}>{award.organization}</p>
            </div>
            <p className="text-sm mb-2" style={{ color: '#555555' }}>{award.year}</p>
            {award.description && <p style={{ color: theme.colors.text }}>{award.description}</p>}
          </div>
        ),
      });
    });

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
        minHeight="min-h-[200px]"
      />
    );
  }

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
                <div className="relative pl-6 border-l-2" style={{ borderColor: theme.colors.primary }}>
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="mb-1">
                    <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{award.title}</h3>
                    <p style={{ color: '#333333' }}>{award.organization}</p>
                  </div>
                  <p className="text-sm mb-2" style={{ color: '#555555' }}>{award.year}</p>
                  {award.description && <p style={{ color: theme.colors.text }}>{award.description}</p>}
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
  const { updateSection } = usePortfolioStore();

  // Free-form mode: each element (title + each certification) is independently draggable
  if (section.freeFormEnabled) {
    const positions = (section as any).elementPositions || {};
    const snapEnabled = section.snapEnabled !== false;

    const defaultPositions: Record<string, ElementPosition> = {
      title: { x: 50, y: 5 },
    };
    section.certifications.forEach((_, i) => {
      defaultPositions[`cert-${i}`] = { x: 50, y: 10 + i * 8 };
    });

    const elements: FreeFormElement[] = [];

    elements.push({
      key: 'title',
      visible: section.showTitle !== false,
      position: positions.title,
      defaultPosition: defaultPositions.title,
      content: (
        <h2 className="text-3xl font-bold text-center whitespace-nowrap" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>
          {section.title}
        </h2>
      ),
    });

    section.certifications.forEach((cert, i) => {
      elements.push({
        key: `cert-${i}`,
        visible: true,
        position: positions[`cert-${i}`],
        defaultPosition: defaultPositions[`cert-${i}`],
        content: (
          <div className="relative pl-6 border-l-2" style={{ borderColor: theme.colors.primary, width: '500px' }}>
            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
            <div className="mb-1">
              <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{cert.name}</h3>
              <p style={{ color: '#333333' }}>{cert.issuer}</p>
            </div>
            <p className="text-sm mb-2" style={{ color: '#555555' }}>{cert.date}</p>
            {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: theme.colors.primary }}>View certificate →</a>}
          </div>
        ),
      });
    });

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
        minHeight="min-h-[200px]"
      />
    );
  }

  return (
    <AnimatedSection>
      <section className="py-16 px-6" style={getSectionBackgroundStyle(section.sectionBackground, theme)}>
        <div className="max-w-4xl mx-auto">
          {section.showTitle !== false && (
            <h2 className="text-3xl font-bold mb-8 text-center" style={getTextStyle(section.textStyles, 'title', { fontFamily: theme.typography.headingFont, color: theme.colors.text })}>{section.title}</h2>
          )}
          <div className="space-y-8">
            {section.certifications.map((cert) => (
              <div key={cert.id} className="relative pl-6 border-l-2" style={{ borderColor: theme.colors.primary }}>
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                <div className="mb-1">
                  <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{cert.name}</h3>
                  <p style={{ color: '#333333' }}>{cert.issuer}</p>
                </div>
                <p className="text-sm mb-2" style={{ color: '#555555' }}>{cert.date}</p>
                {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: theme.colors.primary }}>View certificate →</a>}
              </div>
            ))}
          </div>
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


