'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioStore, createDefaultSection } from '@/lib/store';
import {
  PortfolioData,
  PortfolioSection,
  SectionType,
  Theme,
  NavbarConfig,
  AvailabilityConfig,
  DarkModeConfig,
  SimpleLayoutConfig,
} from '@/lib/types';
import { themes, defaultTheme } from '@/lib/templates';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  X,
  Sparkles,
  Zap,
  User,
  Globe,
  Palette,
  FileText,
  Image as ImageIcon,
  PenTool,
  Layout,
  Code,
  Camera,
  Briefcase,
  Award,
  Mail,
  Layers,
} from 'lucide-react';
import { Confetti } from './effects/Confetti';
import { MagicWandAnimation } from './MagicWandAnimation';

interface ManualDesignWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

// ---- Wizard step definitions ----

type SiteType =
  | 'portfolio'
  | 'online-store'
  | 'services'
  | 'blog'
  | 'landing-page'
  | 'non-profit'
  | 'tech-company'
  | 'restaurant'
  | 'event'
  | 'other';

interface WizardStep {
  id: string;
  title: string;
  placeholder: string;
  suggestions: string[];
  loadingText?: string;
}

const STEPS: WizardStep[] = [
  {
    id: 'name',
    title: 'What do you want to call your site?',
    placeholder: 'Enter or choose a name for your site',
    suggestions: [
      'TechFusion',
      'NexaTech',
      'InnovateWave',
      'QuantumLeap',
      'ByteMinds',
      'OptiCore',
      'CirrusSphere',
      'ElevateX',
    ],
    loadingText: 'Customizing the next steps for you',
  },
  {
    id: 'goals',
    title: 'What are your goals for this site?',
    placeholder: 'Enter or select your site goals',
    suggestions: [
      'Sell innovative tech solutions',
      'Drive sales growth',
      'Offer exceptional customer support',
      'Connect with tech enthusiasts',
      'Increase brand awareness',
      'Share technological insights',
      'Build a loyal community',
      'Promote our cutting-edge services',
    ],
    loadingText: 'Finding the right site apps for you',
  },
  {
    id: 'type',
    title: 'What type of website is this?',
    placeholder: 'Enter or choose a category',
    suggestions: [
      'Portfolio',
      'Online store',
      'Offering services',
      'Blog',
      'Landing page',
      'Non-profit organization',
      'Tech company',
      'Restaurant',
    ],
    loadingText: 'Preparing templates for you',
  },
  {
    id: 'theme',
    title: 'Pick a starting theme',
    placeholder: 'Choose a visual style',
    suggestions: [
      'Modern Blue',
      'Minimalist',
      'Midnight',
      'Editorial',
      'Aurora',
      'Noir',
      'Forest',
      'Terracotta',
    ],
    loadingText: 'Applying your theme',
  },
];

// Theme mapping
const THEME_MAP: Record<string, { id: string; label: string; theme: Theme; swatch: string[] }> = {
  'Modern Blue': {
    id: 'default',
    label: 'Modern Blue',
    theme: themes[0],
    swatch: ['#3b82f6', '#6366f1', '#f59e0b'],
  },
  Minimalist: {
    id: 'minimalist',
    label: 'Minimalist',
    theme: themes.find((t) => t.id === 'minimalist') || defaultTheme,
    swatch: ['#18181b', '#3f3f46', '#18181b'],
  },
  Midnight: {
    id: 'midnight',
    label: 'Midnight',
    theme: themes.find((t) => t.id === 'midnight') || defaultTheme,
    swatch: ['#60a5fa', '#818cf8', '#fbbf24'],
  },
  Editorial: {
    id: 'editorial',
    label: 'Editorial',
    theme: themes.find((t) => t.id === 'editorial') || defaultTheme,
    swatch: ['#000000', '#333333', '#ff0000'],
  },
  Aurora: {
    id: 'aurora',
    label: 'Aurora',
    theme: themes.find((t) => t.id === 'aurora') || defaultTheme,
    swatch: ['#667eea', '#764ba2', '#f093fb'],
  },
  Noir: {
    id: 'noir',
    label: 'Noir',
    theme: themes.find((t) => t.id === 'noir') || defaultTheme,
    swatch: ['#1a1a2e', '#16213e', '#e94560'],
  },
  Forest: {
    id: 'forest',
    label: 'Forest',
    theme: themes.find((t) => t.id === 'forest') || defaultTheme,
    swatch: ['#059669', '#0d9488', '#84cc16'],
  },
  Terracotta: {
    id: 'terracotta',
    label: 'Terracotta',
    theme: themes.find((t) => t.id === 'terracotta') || defaultTheme,
    swatch: ['#d4a574', '#c9956c', '#8b5a2b'],
  },
};

// Suggested sections per site type
const SUGGESTED_SECTIONS: Record<string, SectionType[]> = {
  Portfolio: ['hero', 'projects', 'about', 'skills', 'contact', 'footer'],
  'Online store': ['hero', 'projects', 'about', 'newsletter', 'contact', 'footer'],
  'Offering services': ['hero', 'services', 'about', 'testimonials', 'contact', 'footer'],
  Blog: ['hero', 'blog', 'about', 'newsletter', 'footer'],
  'Landing page': ['hero', 'services', 'stats', 'testimonials', 'contact', 'footer'],
  'Non-profit organization': ['hero', 'about', 'stats', 'projects', 'contact', 'footer'],
  'Tech company': ['hero', 'services', 'stats', 'about', 'contact', 'footer'],
  Restaurant: ['hero', 'about', 'projects', 'testimonials', 'contact', 'footer'],
  other: ['hero', 'about', 'contact', 'footer'],
};

// ---- Floating avatars (portfolio/design themed icons) ----

interface FloatingAvatar {
  icon: React.ElementType;
  gradient: string;
  size: number;
  initialX: number;
  initialY: number;
  driftPath: { x: number; y: number }[];
  duration: number;
  delay: number;
}

const FLOATING_AVATARS: FloatingAvatar[] = [
  {
    // Human / person — represents the portfolio owner
    icon: User,
    gradient: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
    size: 56,
    initialX: 15,
    initialY: 40,
    driftPath: [
      { x: 0, y: 0 },
      { x: 20, y: -25 },
      { x: 45, y: -10 },
      { x: 30, y: 20 },
      { x: 5, y: 35 },
      { x: 0, y: 0 },
    ],
    duration: 16,
    delay: 0.5,
  },
  {
    // Globe — represents the website
    icon: Globe,
    gradient: 'linear-gradient(135deg, #bae6fd, #a5f3fc)',
    size: 64,
    initialX: 45,
    initialY: 85,
    driftPath: [
      { x: 0, y: 0 },
      { x: -30, y: -20 },
      { x: -10, y: -50 },
      { x: 25, y: -35 },
      { x: 40, y: -10 },
      { x: 0, y: 0 },
    ],
    duration: 21,
    delay: 0.3,
  },
  {
    // Palette — represents design
    icon: Palette,
    gradient: 'linear-gradient(135deg, #fbcfe8, #fda4af)',
    size: 48,
    initialX: 70,
    initialY: 50,
    driftPath: [
      { x: 0, y: 0 },
      { x: -25, y: -30 },
      { x: -50, y: -5 },
      { x: -30, y: 25 },
      { x: -10, y: 40 },
      { x: 0, y: 0 },
    ],
    duration: 19,
    delay: 1.2,
  },
  {
    // FileText — represents resume
    icon: FileText,
    gradient: 'linear-gradient(135deg, #bbf7d0, #99f6e4)',
    size: 44,
    initialX: 30,
    initialY: 10,
    driftPath: [
      { x: 0, y: 0 },
      { x: 35, y: 15 },
      { x: 55, y: 40 },
      { x: 20, y: 55 },
      { x: -5, y: 30 },
      { x: 0, y: 0 },
    ],
    duration: 17,
    delay: 2.5,
  },
  {
    // Camera — represents photography/visuals
    icon: Camera,
    gradient: 'linear-gradient(135deg, #fed7aa, #fef3c7)',
    size: 52,
    initialX: 90,
    initialY: 80,
    driftPath: [
      { x: 0, y: 0 },
      { x: -40, y: -15 },
      { x: -60, y: -40 },
      { x: -25, y: -55 },
      { x: 5, y: -30 },
      { x: 0, y: 0 },
    ],
    duration: 23,
    delay: 1.8,
  },
  {
    // PenTool — represents graphic design
    icon: PenTool,
    gradient: 'linear-gradient(135deg, #ddd6fe, #fbcfe8)',
    size: 40,
    initialX: 55,
    initialY: 30,
    driftPath: [
      { x: 0, y: 0 },
      { x: -20, y: 25 },
      { x: 10, y: 50 },
      { x: 35, y: 30 },
      { x: 20, y: 5 },
      { x: 0, y: 0 },
    ],
    duration: 15,
    delay: 3,
  },
  {
    // Layout — represents web layout
    icon: Layout,
    gradient: 'linear-gradient(135deg, #a5f3fc, #c7d2fe)',
    size: 50,
    initialX: 8,
    initialY: 50,
    driftPath: [
      { x: 0, y: 0 },
      { x: 25, y: -15 },
      { x: 50, y: 10 },
      { x: 35, y: 35 },
      { x: 10, y: 20 },
      { x: 0, y: 0 },
    ],
    duration: 18,
    delay: 0.8,
  },
  {
    // Code — represents development
    icon: Code,
    gradient: 'linear-gradient(135deg, #c4b5fd, #bfdbfe)',
    size: 46,
    initialX: 82,
    initialY: 40,
    driftPath: [
      { x: 0, y: 0 },
      { x: -35, y: 20 },
      { x: -55, y: -10 },
      { x: -20, y: -35 },
      { x: 5, y: -15 },
      { x: 0, y: 0 },
    ],
    duration: 20,
    delay: 2,
  },
  {
    // Briefcase — represents professional work
    icon: Briefcase,
    gradient: 'linear-gradient(135deg, #fed7aa, #fecdd3)',
    size: 48,
    initialX: 20,
    initialY: 80,
    driftPath: [
      { x: 0, y: 0 },
      { x: 30, y: -20 },
      { x: 50, y: 5 },
      { x: 25, y: -40 },
      { x: 5, y: -20 },
      { x: 0, y: 0 },
    ],
    duration: 22,
    delay: 1.5,
  },
  {
    // Award — represents achievements
    icon: Award,
    gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    size: 42,
    initialX: 65,
    initialY: 15,
    driftPath: [
      { x: 0, y: 0 },
      { x: -15, y: 30 },
      { x: 10, y: 55 },
      { x: 35, y: 35 },
      { x: 20, y: 10 },
      { x: 0, y: 0 },
    ],
    duration: 16,
    delay: 2.8,
  },
  {
    // Mail — represents contact
    icon: Mail,
    gradient: 'linear-gradient(135deg, #fecdd3, #fbcfe8)',
    size: 44,
    initialX: 40,
    initialY: 55,
    driftPath: [
      { x: 0, y: 0 },
      { x: -25, y: -15 },
      { x: -45, y: 10 },
      { x: -15, y: 35 },
      { x: 10, y: 15 },
      { x: 0, y: 0 },
    ],
    duration: 19,
    delay: 0.4,
  },
  {
    // Layers — represents design layers
    icon: Layers,
    gradient: 'linear-gradient(135deg, #e9d5ff, #f5d0fe)',
    size: 46,
    initialX: 75,
    initialY: 65,
    driftPath: [
      { x: 0, y: 0 },
      { x: -30, y: -25 },
      { x: -50, y: 5 },
      { x: -20, y: 30 },
      { x: 5, y: 10 },
      { x: 0, y: 0 },
    ],
    duration: 17,
    delay: 1.1,
  },
];

// ---- Floating background cards ----
// Each card has complex multi-axis motion paths that drift across the page

interface FloatingCard {
  name: string;
  bg: string;
  accent: string;
  initialX: number; // percentage position
  initialY: number;
  // Drift path: array of {x, y} offsets the card moves through in a loop
  driftPath: { x: number; y: number }[];
  rotateBase: number;
  // Rotation oscillation range
  rotateAmp: number;
  scale: number;
  duration: number;
  delay: number;
}

const FLOATING_CARDS: FloatingCard[] = [
  {
    name: 'KNOBBDY',
    bg: 'linear-gradient(135deg, #84cc16, #65a30d)',
    accent: '#fbbf24',
    initialX: 85,
    initialY: 15,
    driftPath: [
      { x: 0, y: 0 },
      { x: -40, y: 20 },
      { x: -60, y: 50 },
      { x: -20, y: 70 },
      { x: 10, y: 40 },
      { x: 0, y: 0 },
    ],
    rotateBase: -8,
    rotateAmp: 15,
    scale: 1,
    duration: 18,
    delay: 0,
  },
  {
    name: "Bell's&Co",
    bg: 'linear-gradient(135deg, #92400e, #b45309)',
    accent: '#fbbf24',
    initialX: 88,
    initialY: 25,
    driftPath: [
      { x: 0, y: 0 },
      { x: -30, y: 40 },
      { x: -50, y: 10 },
      { x: -70, y: 45 },
      { x: -20, y: 60 },
      { x: 0, y: 0 },
    ],
    rotateBase: 6,
    rotateAmp: 12,
    scale: 0.85,
    duration: 22,
    delay: 1.5,
  },
  {
    name: 'ThreadLab',
    bg: 'linear-gradient(135deg, #059669, #047857)',
    accent: '#6ee7b7',
    initialX: 80,
    initialY: 70,
    driftPath: [
      { x: 0, y: 0 },
      { x: -50, y: -30 },
      { x: -30, y: -60 },
      { x: 10, y: -40 },
      { x: -20, y: -10 },
      { x: 0, y: 0 },
    ],
    rotateBase: -4,
    rotateAmp: 18,
    scale: 0.9,
    duration: 20,
    delay: 0.8,
  },
  {
    name: 'MOLINA',
    bg: 'linear-gradient(135deg, #be185d, #9d174d)',
    accent: '#fbcfe8',
    initialX: 8,
    initialY: 75,
    driftPath: [
      { x: 0, y: 0 },
      { x: 30, y: -40 },
      { x: 60, y: -20 },
      { x: 40, y: -55 },
      { x: 10, y: -30 },
      { x: 0, y: 0 },
    ],
    rotateBase: 7,
    rotateAmp: 14,
    scale: 0.95,
    duration: 24,
    delay: 2,
  },
  {
    name: 'OUR GALLERY',
    bg: 'linear-gradient(135deg, #ec4899, #db2777)',
    accent: '#f9a8d4',
    initialX: 5,
    initialY: 18,
    driftPath: [
      { x: 0, y: 0 },
      { x: 40, y: 30 },
      { x: 20, y: 60 },
      { x: 50, y: 40 },
      { x: 10, y: 20 },
      { x: 0, y: 0 },
    ],
    rotateBase: -6,
    rotateAmp: 16,
    scale: 0.8,
    duration: 19,
    delay: 1,
  },
];

export function ManualDesignWizard({ onClose, onComplete }: ManualDesignWizardProps) {
  const { setPortfolio } = usePortfolioStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [animatedWordIndex, setAnimatedWordIndex] = useState(0);

  // Answers
  const [siteName, setSiteName] = useState('');
  const [siteGoals, setSiteGoals] = useState('');
  const [siteType, setSiteType] = useState('');
  const [themeChoice, setThemeChoice] = useState('');

  const [showConfetti, setShowConfetti] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const totalSteps = STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const step = STEPS[currentStep];

  // Current value and setter for the active step
  const currentValue =
    step.id === 'name'
      ? siteName
      : step.id === 'goals'
        ? siteGoals
        : step.id === 'type'
          ? siteType
          : themeChoice;

  const setCurrentValue = (val: string) => {
    if (step.id === 'name') setSiteName(val);
    else if (step.id === 'goals') setSiteGoals(val);
    else if (step.id === 'type') setSiteType(val);
    else setThemeChoice(val);
  };

  const canContinue = currentValue.trim().length > 0;

  // Animated loading text word cycling
  useEffect(() => {
    if (!isLoading || !loadingText) return;
    const words = loadingText.split(' ');
    setAnimatedWordIndex(0);
    const interval = setInterval(() => {
      setAnimatedWordIndex((prev) => (prev + 1) % words.length);
    }, 600);
    return () => clearInterval(interval);
  }, [isLoading, loadingText]);

  const goNext = () => {
    if (!canContinue || isLoading || isBuilding) return;

    if (currentStep < totalSteps - 1) {
      // Show loading state between steps
      const nextStep = STEPS[currentStep + 1];
      setIsLoading(true);
      setLoadingText(nextStep.loadingText || 'Loading...');

      setTimeout(() => {
        setIsLoading(false);
        setDirection(1);
        setCurrentStep((s) => s + 1);
      }, 1800);
    } else {
      handleFinish();
    }
  };

  const goBack = () => {
    if (currentStep > 0 && !isLoading && !isBuilding) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSkip = () => {
    if (isLoading || isBuilding) return;
    // Fill default and continue
    if (!currentValue.trim()) {
      setCurrentValue(step.suggestions[0]);
    }
    goNext();
  };

  const handleFinish = () => {
    setIsBuilding(true);
    setLoadingText('Building your website');

    const themeEntry = THEME_MAP[themeChoice] || Object.values(THEME_MAP)[0];
    const theme = themeEntry.theme;

    const typeKey = siteType || 'Portfolio';
    const sectionTypes = SUGGESTED_SECTIONS[typeKey] || SUGGESTED_SECTIONS.other;

    const sections: PortfolioSection[] = sectionTypes.map((type) => {
      const section = createDefaultSection(type);
      if (type === 'hero') {
        return {
          ...section,
          name: siteName.trim() || 'Your Name',
          title: siteGoals.trim() || 'Your Title',
          subtitle: siteType || 'Portfolio',
          bio: siteGoals.trim() || 'Write a brief introduction about yourself...',
        } as PortfolioSection;
      }
      return section;
    });

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const navbar: NavbarConfig = {
      enabled: true,
      logo: siteName.trim() || 'Your Name',
      logoType: 'text',
      showCTAButton: true,
      ctaButtonText: 'Get In Touch',
      ctaButtonLink: '#contact',
      sticky: true,
      transparentOnTop: true,
      style: 'transparent',
    };

    const availability: AvailabilityConfig = {
      enabled: false,
      text: 'Available for work',
      color: '#10b981',
    };

    const darkMode: DarkModeConfig = {
      enabled: false,
      active: false,
    };

    const simpleLayout: SimpleLayoutConfig = {
      showSidebar: true,
      sidebarPosition: 'left',
      profileImage: '',
      profileName: siteName.trim() || 'Your Name',
      profileTitle: siteGoals.trim() || 'Creative Professional',
      profileLocation: '',
      availableForWork: true,
      availabilityText: 'Available for work',
      showStats: true,
      projectViews: 0,
      appreciations: 0,
      followers: 0,
      following: 0,
      sidebarSocialLinks: [],
      sidebarExperiences: [],
      sidebarAbout: '',
    };

    const newPortfolio: PortfolioData = {
      id: generateId(),
      name: siteName.trim() || 'My Website',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections,
      theme,
      metadata: {
        title: siteName.trim() || 'My Website',
        description: siteGoals.trim() || 'A professional website',
      },
      navbar,
      availability,
      darkMode,
      customCSS: '',
      layoutMode: 'flexible',
      simpleLayout,
    };

    setTimeout(() => {
      setPortfolio(newPortfolio);
      setShowConfetti(true);
      setTimeout(() => {
        setIsBuilding(false);
        onComplete();
      }, 1200);
    }, 1500);
  };

  // Variants for fade transition
  const variants = {
    enter: {
      opacity: 0,
      y: 20,
    },
    center: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  const loadingWords = loadingText.split(' ');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#f5f5f7] overflow-hidden">
      {/* Floating avatars in background */}
      {!isLoading &&
        !isBuilding &&
        FLOATING_AVATARS.map((avatar, i) => {
          const Icon = avatar.icon;
          return (
            <motion.div
              key={`avatar-${i}`}
              className="absolute pointer-events-none"
              style={{
                left: `${avatar.initialX}%`,
                top: `${avatar.initialY}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                x: avatar.driftPath.map((p) => `${p.x * 2}px`),
                y: avatar.driftPath.map((p) => `${p.y * 2}px`),
              }}
              transition={{
                scale: { duration: 0.5, delay: avatar.delay },
                opacity: { duration: 0.5, delay: avatar.delay },
                x: { duration: avatar.duration, repeat: Infinity, ease: 'easeInOut' },
                y: { duration: avatar.duration, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <div
                className="flex items-center justify-center rounded-2xl shadow-lg"
                style={{
                  width: avatar.size,
                  height: avatar.size,
                  background: avatar.gradient,
                }}
              >
                <Icon className="w-1/2 h-1/2 text-slate-600" />
              </div>
            </motion.div>
          );
        })}

      {/* Main container: questionnaire card centered */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Main modal card */}
        <motion.div
          data-wizard-card
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '60vh', minHeight: '360px' }}
        >
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 flex-shrink-0">
          <motion.div
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-20"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content area */}
        <div className="flex-1 flex flex-col px-8 py-10 overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction}>
            {isLoading ? (
              // Loading state with video
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center gap-4"
              >
                <video
                  src="/vid2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="rounded-2xl shadow-lg"
                  style={{ width: 160, height: 160, objectFit: 'cover' }}
                />
                <p className="text-lg text-gray-400 text-center">
                  {loadingWords.map((word, i) => (
                    <span
                      key={i}
                      className={cn(
                        'transition-colors duration-300',
                        i === animatedWordIndex ? 'text-gray-900 font-medium' : 'text-gray-300'
                      )}
                    >
                      {word}
                      {i < loadingWords.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </p>
              </motion.div>
            ) : isBuilding ? (
              // Building state with video
              <motion.div
                key="building"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center gap-4"
              >
                <video
                  src="/vid2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="rounded-2xl shadow-lg"
                  style={{ width: 160, height: 160, objectFit: 'cover' }}
                />
                <p className="text-lg text-gray-400 text-center">
                  {loadingWords.map((word, i) => (
                    <span
                      key={i}
                      className={cn(
                        'transition-colors duration-300',
                        i === animatedWordIndex ? 'text-gray-900 font-medium' : 'text-gray-300'
                      )}
                    >
                      {word}
                      {i < loadingWords.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </p>
              </motion.div>
            ) : (
              // Step content
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex-1 flex flex-col"
              >
                {/* Step title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{step.title}</h2>

                {/* Text input */}
                <input
                  type="text"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canContinue) goNext();
                  }}
                  placeholder={step.placeholder}
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all mb-5"
                />

                {/* Suggestions */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-gray-400">Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {step.suggestions.map((suggestion) => {
                      const isActive = currentValue === suggestion;
                      return (
                        <button
                          key={suggestion}
                          onClick={() => setCurrentValue(suggestion)}
                          className={cn(
                            'px-3.5 py-2 rounded-full text-xs font-medium transition-all',
                            isActive
                              ? 'bg-indigo-600 text-white border border-indigo-600'
                              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
                          )}
                        >
                          {suggestion}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme swatches preview (only on theme step) */}
                {step.id === 'theme' && currentValue && THEME_MAP[currentValue] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex gap-1.5">
                      {THEME_MAP[currentValue].swatch.map((c, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {THEME_MAP[currentValue].label} theme selected
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer navigation */}
        {!isLoading && !isBuilding && (
          <div className="flex items-center justify-between px-8 py-5 border-t border-gray-50 flex-shrink-0">
            <button
              onClick={goBack}
              disabled={currentStep === 0}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-all',
                currentStep === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-all"
              >
                Skip
              </button>
              <button
                onClick={goNext}
                disabled={!canContinue}
                className={cn(
                  'flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all',
                  canContinue
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                    : 'bg-gray-800 text-white cursor-default'
                )}
              >
                {currentStep === totalSteps - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Website
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>
        )}
        </motion.div>
      </div>

      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
}
