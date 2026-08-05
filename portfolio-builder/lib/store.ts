import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PortfolioData, PortfolioSection, Theme, SectionType, NavbarConfig, AvailabilityConfig, DarkModeConfig, LayoutMode, SimpleLayoutConfig } from './types';
import { defaultTheme } from './templates';

const MAX_HISTORY = 50;

// IndexedDB storage adapter — handles large data (base64 images/videos) that overflow localStorage
const createIndexedDBStorage = () => {
  const DB_NAME = 'portfolio-builder-db';
  const STORE_NAME = 'portfolio-store';
  const KEY = 'portfolio-storage';
  let dbPromise: Promise<IDBDatabase> | null = null;

  const getDB = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  };

  return {
    getItem: async (name: string): Promise<any> => {
      try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(name);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => reject(req.error);
        });
      } catch {
        // Fallback to localStorage
        try {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        } catch {
          return null;
        }
      }
    },
    setItem: async (name: string, value: any): Promise<void> => {
      try {
        const db = await getDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(value, name);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch (e) {
        // Fallback to localStorage
        try {
          localStorage.setItem(name, JSON.stringify(value));
        } catch {
          console.warn('Both IndexedDB and localStorage failed, state not persisted');
        }
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        const db = await getDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.delete(name);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch {
        try {
          localStorage.removeItem(name);
        } catch {
          // ignore
        }
      }
    },
  };
};


interface PortfolioState {
  portfolio: PortfolioData;
  selectedSectionId: string | null;
  previewMode: boolean;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  isDirty: boolean;

  // History for undo/redo
  past: PortfolioData[];
  future: PortfolioData[];

  // Actions
  setPortfolio: (portfolio: PortfolioData) => void;
  updateSection: (sectionId: string, updates: Partial<PortfolioSection>) => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  selectSection: (sectionId: string | null) => void;
  setTheme: (theme: Theme) => void;
  updateMetadata: (updates: Partial<PortfolioData['metadata']>) => void;
  updateNavbar: (updates: Partial<NavbarConfig>) => void;
  updateAvailability: (updates: Partial<AvailabilityConfig>) => void;
  updateDarkMode: (updates: Partial<DarkModeConfig>) => void;
  toggleDarkMode: () => void;
  updateCustomCSS: (css: string) => void;
  togglePreviewMode: () => void;
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  resetPortfolio: () => void;
  markClean: () => void;
  // Layout mode actions
  setLayoutMode: (mode: LayoutMode) => void;
  updateSimpleLayout: (updates: Partial<SimpleLayoutConfig>) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultNavbar: NavbarConfig = {
  enabled: true,
  logo: 'Your Name',
  logoType: 'text',
  showCTAButton: true,
  ctaButtonText: 'Hire Me',
  ctaButtonLink: '#contact',
  sticky: true,
  transparentOnTop: true,
  style: 'transparent',
};

const defaultAvailability: AvailabilityConfig = {
  enabled: false,
  text: 'Available for work',
  color: '#10b981',
};

const defaultDarkMode: DarkModeConfig = {
  enabled: false,
  active: false,
};

export const createDefaultSection = (type: SectionType): PortfolioSection => {
  const id = generateId();

  switch (type) {
    case 'hero':
      return {
        id,
        visible: true,
        type: 'hero',
        name: 'Your Name',
        title: 'Your Title',
        subtitle: 'Creative Professional',
        bio: 'Write a brief introduction about yourself...',
        avatar: '',
        backgroundType: 'gradient',
        backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundOverlayOpacity: 0,
        avatarPosition: { x: 50, y: 30 },
        namePosition: { x: 50, y: 50 },
        titlePosition: { x: 50, y: 60 },
        subtitlePosition: { x: 50, y: 68 },
        bioPosition: { x: 50, y: 78 },
        ctaButtonsPosition: { x: 50, y: 88 },
        avatarSize: 'medium',
        showName: true,
        showTitle: true,
        showSubtitle: true,
        showBio: true,
        showAvatar: true,
        showScrollIndicator: true,
        ctaButtons: [
          { id: generateId(), label: 'View My Work', link: '#projects', variant: 'primary' },
          { id: generateId(), label: 'Contact Me', link: '#contact', variant: 'outline' },
        ],
        layout: 'free',
        snapEnabled: true,
        galleryImages: [],
      };
    case 'about':


      return {
        id,
        visible: true,
        type: 'about',
        title: 'About Me',
        tagline: '',
        content: 'Tell your story here...',
        secondParagraph: '',
        personalQuote: '',
        imageUrl: '',
        secondImageUrl: '',
        resumeUrl: '',
        imageShape: 'rounded',
        imageLayout: 'left',
        imageSize: 'medium',
        imageBorder: false,
        imageShadow: true,
        quickFacts: [],
        toolTags: [],
        location: '',
        availabilityStatus: '',
        ctaButtonText: '',
        ctaButtonLink: '',
        videoUrl: '',
        videoType: 'youtube',
        languages: [],
        showSocialLinks: false,
        galleryImages: [],
      };

    case 'projects':

      return {
        id,
        visible: true,
        type: 'projects',
        title: 'Projects',
        categories: [],
        projects: [],
        layout: 'grid',
        columnCount: 3,
        aspectRatio: '1:1',
      };
    case 'skills':
      return {
        id,
        visible: true,
        type: 'skills',
        title: 'Skills & Expertise',
        skills: [],
        displayStyle: 'bars',
      };
    case 'experience':
      return {
        id,
        visible: true,
        type: 'experience',
        title: 'Work Experience',
        experiences: [],
        layout: 'left',
      };
    case 'education':
      return {
        id,
        visible: true,
        type: 'education',
        title: 'Education',
        educations: [],
      };
    case 'testimonials':
      return {
        id,
        visible: true,
        type: 'testimonials',
        title: 'What People Say',
        testimonials: [],
        layout: 'grid',
      };
    case 'contact':
      return {
        id,
        visible: true,
        type: 'contact',
        title: 'Get In Touch',
        email: '',
        showForm: true,
      };
    case 'social':
      return {
        id,
        visible: true,
        type: 'social',
        title: 'Connect With Me',
        links: [],
      };
    case 'footer':
      return {
        id,
        visible: true,
        type: 'footer',
        copyrightText: '© {year} Your Name. All rights reserved.',
        showQuickLinks: true,
        showSocialIcons: true,
        showContactInfo: true,
        showBackToTop: true,
      };
    case 'ctaBanner':
      return {
        id,
        visible: true,
        type: 'ctaBanner',
        title: "Let's Work Together",
        subtitle: 'Have a project in mind? I\'d love to hear about it.',
        buttonText: 'Get In Touch',
        buttonLink: '#contact',
        backgroundType: 'gradient',
        backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      };
    case 'services':
      return {
        id,
        visible: true,
        type: 'services',
        title: 'What I Do',
        subtitle: 'Services I offer',
        services: [],
      };
    case 'process':
      return {
        id,
        visible: true,
        type: 'process',
        title: 'How I Work',
        subtitle: 'My design process',
        steps: [],
        layout: 'horizontal',
      };
    case 'stats':
      return {
        id,
        visible: true,
        type: 'stats',
        title: 'By The Numbers',
        stats: [],
      };
    case 'awards':
      return {
        id,
        visible: true,
        type: 'awards',
        title: 'Awards & Recognition',
        awards: [],
      };
    case 'press':
      return {
        id,
        visible: true,
        type: 'press',
        title: 'Featured In',
        subtitle: 'As seen on',
        items: [],
      };
    case 'certifications':
      return {
        id,
        visible: true,
        type: 'certifications',
        title: 'Certifications',
        certifications: [],
      };
    case 'blog':
      return {
        id,
        visible: true,
        type: 'blog',
        title: 'Blog',
        subtitle: 'Thoughts and articles',
        posts: [],
        layout: 'grid',
      };
    case 'faq':
      return {
        id,
        visible: true,
        type: 'faq',
        title: 'Frequently Asked Questions',
        subtitle: '',
        items: [],
        layout: 'accordion',
      };
    case 'newsletter':
      return {
        id,
        visible: true,
        type: 'newsletter',
        title: 'Stay Updated',
        subtitle: 'Subscribe to my newsletter for the latest updates',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
        provider: 'none',
        providerUrl: '',
        backgroundType: 'gradient',
        backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      };
    default:

      throw new Error(`Unknown section type: ${type}`);


  }
};

const defaultSimpleLayout: SimpleLayoutConfig = {
  showSidebar: true,
  sidebarPosition: 'left',
  profileImage: '',
  profileName: 'Your Name',
  profileTitle: 'Creative Professional',
  profileLocation: 'City, Country',
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

const defaultPortfolio: PortfolioData = {
  id: generateId(),
  name: 'My Portfolio',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: [createDefaultSection('hero')],
  theme: defaultTheme,
  metadata: {
    title: 'My Portfolio',
    description: 'A professional portfolio showcasing my work',
  },
  navbar: defaultNavbar,
  availability: defaultAvailability,
  darkMode: defaultDarkMode,
  customCSS: '',
  layoutMode: 'flexible',
  simpleLayout: defaultSimpleLayout,
};

// Deep clone helper for history snapshots
const clonePortfolio = (portfolio: PortfolioData): PortfolioData => {
  return JSON.parse(JSON.stringify(portfolio));
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      portfolio: defaultPortfolio,
      selectedSectionId: null,
      previewMode: false,
      viewMode: 'desktop',
      isDirty: false,
      past: [],
      future: [],

      setPortfolio: (portfolio) =>
        set((state) => ({
          past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
          portfolio,
          future: [],
          isDirty: false,
        })),

      updateSection: (sectionId, updates) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            sections: state.portfolio.sections.map((section) =>
              section.id === sectionId
                ? ({ ...section, ...updates } as PortfolioSection)
                : section
            ),
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      addSection: (type) =>
        set((state) => {
          const newSection = createDefaultSection(type);
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            sections: [...state.portfolio.sections, newSection],
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      removeSection: (sectionId) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            sections: state.portfolio.sections.filter((s) => s.id !== sectionId),
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            selectedSectionId:
              state.selectedSectionId === sectionId ? null : state.selectedSectionId,
            isDirty: true,
          };
        }),

      duplicateSection: (sectionId) =>
        set((state) => {
          const sectionToClone = state.portfolio.sections.find((s) => s.id === sectionId);
          if (!sectionToClone) return state;

          const clonedSection = {
            ...JSON.parse(JSON.stringify(sectionToClone)),
            id: generateId(),
          };

          const sectionIndex = state.portfolio.sections.findIndex((s) => s.id === sectionId);
          const newSections = [...state.portfolio.sections];
          newSections.splice(sectionIndex + 1, 0, clonedSection);

          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            sections: newSections,
          };

          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      toggleSectionVisibility: (sectionId) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            sections: state.portfolio.sections.map((section) =>
              section.id === sectionId
                ? ({ ...section, visible: section.visible !== false ? false : true } as PortfolioSection)
                : section
            ),
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      reorderSections: (fromIndex, toIndex) =>
        set((state) => {
          const sections = [...state.portfolio.sections];
          const [removed] = sections.splice(fromIndex, 1);
          sections.splice(toIndex, 0, removed);
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            sections,
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      moveSection: (sectionId, direction) =>
        set((state) => {
          const sections = [...state.portfolio.sections];
          const index = sections.findIndex((s) => s.id === sectionId);
          if (index === -1) return state;

          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= sections.length) return state;

          [sections[index], sections[targetIndex]] = [sections[targetIndex], sections[index]];

          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            sections,
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      selectSection: (sectionId) => set({ selectedSectionId: sectionId }),

      setTheme: (theme) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            theme,
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      updateMetadata: (updates) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            metadata: {
              ...state.portfolio.metadata,
              ...updates,
            },
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      updateNavbar: (updates) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            navbar: { ...state.portfolio.navbar, ...updates },
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      updateAvailability: (updates) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            availability: { ...state.portfolio.availability, ...updates },
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      updateDarkMode: (updates) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            darkMode: { ...state.portfolio.darkMode, ...updates },
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      toggleDarkMode: () =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            darkMode: {
              ...state.portfolio.darkMode,
              active: !state.portfolio.darkMode.active,
            },
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      updateCustomCSS: (css) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            customCSS: css,
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      togglePreviewMode: () =>
        set((state) => ({
          previewMode: !state.previewMode,
        })),

      setViewMode: (mode) => set({ viewMode: mode }),

      resetPortfolio: () =>
        set((state) => ({
          past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
          portfolio: {
            ...defaultPortfolio,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          selectedSectionId: null,
          future: [],
          isDirty: false,
        })),

      markClean: () => set({ isDirty: false }),

      // Layout mode actions
      setLayoutMode: (mode: LayoutMode) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            layoutMode: mode,
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      updateSimpleLayout: (updates: Partial<SimpleLayoutConfig>) =>
        set((state) => {
          const newPortfolio: PortfolioData = {
            ...state.portfolio,
            updatedAt: new Date().toISOString(),
            simpleLayout: { ...state.portfolio.simpleLayout, ...updates } as SimpleLayoutConfig,
          };
          return {
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            portfolio: newPortfolio,
            future: [],
            isDirty: true,
          };
        }),

      // Undo: move current portfolio to future, restore from past
      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state;
          const previous = state.past[state.past.length - 1];
          const newPast = state.past.slice(0, -1);
          return {
            portfolio: previous,
            past: newPast,
            future: [clonePortfolio(state.portfolio), ...state.future].slice(0, MAX_HISTORY),
            isDirty: true,
          };
        }),

      // Redo: move current portfolio to past, restore from future
      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state;
          const next = state.future[0];
          const newFuture = state.future.slice(1);
          return {
            portfolio: next,
            past: [...state.past, clonePortfolio(state.portfolio)].slice(-MAX_HISTORY),
            future: newFuture,
            isDirty: true,
          };
        }),

      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,
    }),
    {
      name: 'portfolio-storage',
      // Only persist the portfolio data — not the undo/redo history
      // (past/future arrays contain up to 50 full deep clones and would overflow localStorage)
      partialize: (state) => ({
        portfolio: state.portfolio,
      }),
      // Use IndexedDB for storage — handles large data (base64 images/videos)
      // Falls back to localStorage if IndexedDB is unavailable
      storage: createJSONStorage(() => createIndexedDBStorage()),
    }

  )
);
