'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolioStore } from '@/lib/store';
import { SectionEditor } from '@/components/builder/SectionEditor';
import { ElementInspector } from '@/components/builder/ElementInspector';
import { SectionListPanel } from '@/components/builder/SectionListPanel';
import { AddSectionDialog } from '@/components/builder/AddSectionDialog';
import { PortfolioPreview } from '@/components/builder/PortfolioPreview';
import { EditOnDesktopNotice } from '@/components/builder/EditOnDesktopNotice';
import { PhoneViewIcon, TabletViewIcon } from '@/components/builder/ViewIcons';
import { SectionTabs } from '@/components/builder/SectionTabs';
import { CommandPalette } from '@/components/builder/CommandPalette';
import { EditorSettingsGroup } from '@/components/builder/EditorSettingsGroup';
import { downloadHTML, downloadJSON } from '@/lib/export';
import { PortfolioData, Project } from '@/lib/types';
import { ProjectEditorModal } from '@/components/builder/ProjectEditorModal';
import { PortfolioSkeleton } from '@/components/builder/Skeleton';
import { Button } from '@/components/ui/button';
import { useSession, signIn } from "next-auth/react";
import { CloudSaveError, savePortfolioToCloud } from '@/lib/cloud-save';
import { AccountControls } from '@/components/AccountControls';
import { SavedWebsites } from '@/components/builder/SavedWebsites';
import { PublishWebsite } from '@/components/builder/PublishWebsite';
import { requestPublication } from '@/lib/cloud-publish';
import {
  Monitor,
  Eye,
  Edit3,
  Download,
  Upload,
  MoreHorizontal,
  Undo2,
  Redo2,
  Command,
  Settings,
  Save,
  Loader2,
  Plus,
  Wand2,
  PanelLeftClose,
  PanelLeftOpen,
  Ruler,
  Grid3x3,
  LayoutGrid,
  RotateCcw,
  X,
} from 'lucide-react';


import { cn, generateId } from '@/lib/utils';
import { sectionConfig } from '@/lib/templates';
import toast from 'react-hot-toast';
import { AIWebsiteChat } from '@/components/builder/AIWebsiteChat';
import { WelcomeScreen } from '@/components/builder/WelcomeScreen';
import { ManualDesignWizard } from '@/components/builder/ManualDesignWizard';
import { TemplateGallery } from '@/components/builder/TemplateGallery';
import { CursorGlow } from '@/components/builder/effects/CursorGlow';
import { motion, AnimatePresence } from 'framer-motion';


export default function BuilderPage() {
  // Everyone, signed in or not, starts on the welcome screen. Signing in is
  // requested when saving (see handleSave), and saved websites appear once signed in.
  return <AuthenticatedBuilder />;
}

function AuthenticatedBuilder() {
  const {
    portfolio,
    previewMode,
    viewMode,
    togglePreviewMode,
    setViewMode,
    setPortfolio,
    selectSection,
    selectElement,
    removeSection,
    updateSection,
    showRulers,
    showGuides,
    showGrid,
    gridColor,
    setGridColor,
    toggleRulers,
    toggleGuides,
    toggleGrid,
    isDirty,
    cloudPortfolio,
    undo,
    redo,
    canUndo,
    canRedo,
    duplicateSection,
    selectedSectionId,
    selectedElementId,
    selectedElementSectionId,
    setLayoutMode,
    createBlankFlexibleSite,
  } = usePortfolioStore();
  const { data: session, status } = useSession();


  // Get the default section ID (hero or first section)
  const defaultSectionId = React.useMemo(() => {
    if (portfolio.sections.length === 0) return '';
    const heroSection = portfolio.sections.find(s => s.type === 'hero');
    return heroSection?.id || portfolio.sections[0].id;
  }, [portfolio.sections]);

  // Clears every saved free-form position on the page. Positions are stored as
  // percentages of the page canvas height; after structural changes (sections
  // added/removed, canvas-height convention changes) old values can map to
  // compressed/overlapping spots. This drops them so the default top-to-bottom
  // stacking is recomputed from the current slot layout.
  const resetElementPositions = () => {
    const affected = portfolio.sections.filter((s) => ((s as any).elementPositions
      && Object.keys((s as any).elementPositions).length > 0)
      || ((s as any).pageLayout && Object.keys((s as any).pageLayout).length > 0));
    if (affected.length === 0) return;
    if (!window.confirm('Reset all dragged positions? Every block returns to its default stacked position. (Ctrl+Z / Undo can restore this.)')) return;
    for (const section of affected) {
      updateSection(section.id, { elementPositions: {}, pageLayout: {} } as any);
    }
  };

  // State
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const moreButtonRef = React.useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  // Every visit starts on the welcome screen. A site that already has sections
  // can be resumed from it with "Continue editing".
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const saveInFlightRef = React.useRef(false);
  const lastSyncedCategoryIdRef = React.useRef<string>('');
  const wasPreviewModeRef = React.useRef(previewMode);

  // Editing is for desktop screens only: small screens and Mobile view get a notice instead.
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsNarrowScreen(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  // Preview only views the site, so it stays available on any screen.
  const editingBlocked = !previewMode && (isNarrowScreen || viewMode === 'mobile');

  // Resizable editor panel
  const [editorWidth, setEditorWidth] = useState(320);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const editorResizeStart = React.useRef({ x: 0, width: 320 });
  const startEditorResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingEditor(true);
    editorResizeStart.current = { x: e.clientX, width: editorWidth };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [editorWidth]);
  const doEditorResize = useCallback((e: React.PointerEvent) => {
    if (!isResizingEditor) return;
    const delta = e.clientX - editorResizeStart.current.x;
    const newWidth = editorResizeStart.current.width + delta;
    // Collapse when dragged below threshold, expand from collapsed
    if (newWidth < 120) {
      setEditorCollapsed(true);
      setEditorWidth(320);
    } else {
      setEditorCollapsed(false);
      setEditorWidth(Math.min(640, Math.max(260, newWidth)));
    }
  }, [isResizingEditor]);
  const endEditorResize = useCallback((e: React.PointerEvent) => {
    if (!isResizingEditor) return;
    setIsResizingEditor(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, [isResizingEditor]);

  // Development-only entry point used by the local browser regression test.
  // It is disabled in production and leaves the normal welcome flow unchanged.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || new URLSearchParams(window.location.search).get('__e2e') !== 'manual') return;
    createBlankFlexibleSite();
    setShowWelcome(false);
  }, [createBlankFlexibleSite]);

  // Show skeleton on initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Initialize active section
  useEffect(() => {
    if (portfolio.sections.length > 0 && defaultSectionId) {
      if (!activeSectionId || !portfolio.sections.some(s => s.id === activeSectionId)) {
        setActiveSectionId(defaultSectionId);
        selectSection(defaultSectionId);
      }
    }
  }, [portfolio.sections, defaultSectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Content edits replace the sections array. Only synchronize when navigation
  // actually changes, otherwise typing in About would reopen the stale Hero item.
  useEffect(() => {
    if (activeSectionId && lastSyncedCategoryIdRef.current !== activeSectionId) {
      lastSyncedCategoryIdRef.current = activeSectionId;
      selectSection(activeSectionId);
    }
  }, [activeSectionId, portfolio.sections, defaultSectionId, selectSection]);

  // Restore the active category only on the transition from preview back to edit.
  useEffect(() => {
    const wasPreviewing = wasPreviewModeRef.current;
    wasPreviewModeRef.current = previewMode;
    if (wasPreviewing && !previewMode && activeSectionId && portfolio.sections.some(s => s.id === activeSectionId)) {
      lastSyncedCategoryIdRef.current = activeSectionId;
      selectSection(activeSectionId);
    }
  }, [previewMode, activeSectionId, portfolio.sections, selectSection]);

  // Handle Escape key to exit element edit mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedElementId) {
        selectElement(null, null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectElement]);

  const handleSave = useCallback(async (publish = false, subdomain?: string) => {
    if (saveInFlightRef.current) return;

    if (status === 'loading') {
      toast.error('Please wait while we check your login.');
      return;
    }

    const ownerEmail = session?.user?.email;
    if (status !== 'authenticated' || !ownerEmail) {
      toast('Sign in to save your website.');
      await signIn().catch(() => toast.error('Unable to open sign-in. Please try again.'));
      return;
    }

    // A website that has never been saved needs a name before it gets one.
    if (!usePortfolioStore.getState().cloudPortfolio) {
      const current = usePortfolioStore.getState().portfolio;
      const name = window.prompt('Name this website', current.metadata.title || current.name)?.trim();
      if (!name) return;
      usePortfolioStore.getState().renameWebsite(name);
    }

    const snapshot = usePortfolioStore.getState();
    saveInFlightRef.current = true;
    setIsSaving(true);

    try {
      const reference = await savePortfolioToCloud(snapshot, snapshot.cloudPortfolio, ownerEmail);
      if (usePortfolioStore.getState().draftVersion !== snapshot.draftVersion) return;
      usePortfolioStore.getState().completeCloudSave(snapshot, reference);
      if (publish) {
        const publication = await requestPublication(reference.id, 'publish', undefined, fetch, subdomain);
        toast.success(usePortfolioStore.getState().isDirty
          ? 'Saved version published. Your newer edits still need publishing.'
          : 'Website published. Your public link is ready.');
        return publication;
      }
      toast.success(usePortfolioStore.getState().isDirty
        ? 'Saved online. Your newer edits still need saving.'
        : 'Portfolio saved online');
    } catch (error) {
      toast.error(error instanceof CloudSaveError
        ? error.message
        : publish ? 'Unable to publish website. Please try again.' : 'Unable to save portfolio. Please try again.');
      if (error instanceof CloudSaveError && error.status === 401) {
        await signIn().catch(() => toast.error('Unable to open sign-in. Please try again.'));
      }
      if (publish) throw error;
    } finally {
      saveInFlightRef.current = false;
      setIsSaving(false);
    }
  }, [session?.user?.email, status]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void handleSave();
        return;
      }

      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Command palette: Ctrl+K
      if (ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      // Undo: Ctrl+Z
      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
          toast.success('Undone', { icon: '↩️' });
        }
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (ctrlKey && (e.key === 'Z' || (e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        if (canRedo()) {
          redo();
          toast.success('Redone', { icon: '↪️' });
        }
        return;
      }

      // Toggle preview: Ctrl+P
      if (ctrlKey && e.key === 'p' && !isTyping) {
        e.preventDefault();
        togglePreviewMode();
        return;
      }

      // Duplicate section: Ctrl+D
      if (ctrlKey && e.key === 'd' && !isTyping && selectedSectionId) {
        e.preventDefault();
        duplicateSection(selectedSectionId);
        toast.success('Section duplicated', { icon: '📋' });
        return;
      }

      // Escape closes modals
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        if (showExportMenu) setShowExportMenu(false);
        if (showAddSection) setShowAddSection(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, togglePreviewMode, duplicateSection, selectedSectionId, isCommandPaletteOpen, showExportMenu, showAddSection, handleSave]);

  const handleSelectSection = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    selectSection(sectionId);
    setShowAddSection(false);
  }, [selectSection]);

  const handleRemoveSection = (sectionId: string) => {
    removeSection(sectionId);
    toast.success('Section deleted', { icon: '🗑️' });
    if (activeSectionId === sectionId) {
      const remainingSections = portfolio.sections.filter(s => s.id !== sectionId);
      if (remainingSections.length > 0) {
        const newId = remainingSections[0].id;
        setActiveSectionId(newId);
        selectSection(newId);
      } else {
        setActiveSectionId('');
        selectSection(null);
      }
    }
  };

  const handleExportHTML = () => {
    downloadHTML(portfolio);
    toast.success('Portfolio exported as HTML', { icon: '🌐' });
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    downloadJSON(portfolio);
    toast.success('Portfolio exported as JSON', { icon: '📄' });
    setShowExportMenu(false);
  };

  // The array each section type renders from. A missing or non-array value here crashes
  // the page on render, so a missing one is filled with [] and a wrong type is refused.
  const REQUIRED_ARRAYS: Record<string, string[]> = {
    projects: ['projects'],
    skills: ['skills'],
    experience: ['experiences'],
    education: ['educations'],
    testimonials: ['testimonials'],
    services: ['services'],
    process: ['steps'],
    stats: ['stats'],
    awards: ['awards'],
    press: ['items'],
    certifications: ['certifications'],
    blog: ['posts'],
    faq: ['items'],
    social: ['links'],
  };

  const normalizeImportedSections = (list: unknown): Record<string, any>[] | null => {
    if (!Array.isArray(list)) return null;
    const out: Record<string, any>[] = [];
    for (const raw of list) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
      const section: Record<string, any> = { ...(raw as Record<string, any>) };
      if (typeof section.type !== 'string' || !(section.type in sectionConfig)) return null;
      if (typeof section.id !== 'string' || !section.id) section.id = generateId();
      for (const field of REQUIRED_ARRAYS[section.type] ?? []) {
        if (section[field] === undefined || section[field] === null) section[field] = [];
        else if (!Array.isArray(section[field])) return null;
      }
      out.push(section);
    }
    return out;
  };

  // Returns a portfolio the editor can render, or null if the file cannot be used.
  // Missing config blocks fall back to the current site's settings.
  const normalizeImportedPortfolio = (value: unknown): PortfolioData | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const src = value as Record<string, any>;
    const sections = normalizeImportedSections(src.sections);
    if (!sections) return null;
    let pages: unknown = src.pages;
    if (pages !== undefined) {
      if (!Array.isArray(pages)) return null;
      const normalizedPages = pages.map((page: any) => {
        const pageSections = normalizeImportedSections(page?.sections);
        return pageSections ? { ...page, sections: pageSections } : null;
      });
      if (normalizedPages.some(page => page === null)) return null;
      pages = normalizedPages;
    }
    return {
      ...src,
      id: typeof src.id === 'string' && src.id ? src.id : portfolio.id,
      name: typeof src.name === 'string' ? src.name : portfolio.name,
      metadata: src.metadata ?? portfolio.metadata,
      theme: src.theme ?? portfolio.theme,
      navbar: src.navbar ?? portfolio.navbar,
      availability: src.availability ?? portfolio.availability,
      darkMode: src.darkMode ?? portfolio.darkMode,
      layoutMode: src.layoutMode ?? portfolio.layoutMode,
      sections,
      ...(pages !== undefined ? { pages } : {}),
    } as PortfolioData;
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = normalizeImportedPortfolio(JSON.parse(e.target?.result as string));
          if (!data) throw new Error('Not a portfolio export');
          setPortfolio(data);
          toast.success('Portfolio imported successfully', { icon: '✅' });
        } catch (error) {
          toast.error('Invalid portfolio file');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (updatedProject: Project) => {
    let projectsSection = portfolio.sections.find(s => s.type === 'projects');
    if (projectsSection) {
      const sectionProjects = (projectsSection as any).projects as Project[];
      const existingProjectIndex = sectionProjects.findIndex(p => p.id === updatedProject.id);
      
      if (existingProjectIndex >= 0) {
        // Update existing project
        const updatedProjects = sectionProjects.map((p: Project) =>
          p.id === updatedProject.id ? updatedProject : p
        );
        updateSection(projectsSection.id, { projects: updatedProjects });
      } else {
        // Add new project (for simple mode when project was created but not yet in section)
        const updatedProjects = [...sectionProjects, updatedProject];
        updateSection(projectsSection.id, { projects: updatedProjects });
      }
      toast.success('Project saved', { icon: '💾' });
    }
  };

  const handleUndo = () => {
    if (canUndo()) {
      undo();
      toast.success('Undone', { icon: '↩️' });
    }
  };

  const handleRedo = () => {
    if (canRedo()) {
      redo();
      toast.success('Redone', { icon: '↪️' });
    }
  };

  const activeSection = portfolio.sections.find(s => s.id === activeSectionId);
  const savedToCurrentAccount = Boolean(session?.user?.email
    && cloudPortfolio?.ownerEmail === session.user.email);

  if (editingBlocked) {
    return (
      <EditOnDesktopNotice
        canSwitchToDesktop={!isNarrowScreen}
        onSwitchToDesktop={() => setViewMode('desktop')}
        onPreview={() => togglePreviewMode()}
      />
    );
  }

  // Show welcome screen first
  if (showWelcome) {
    // "Continue editing" is offered only for work worth resuming. A new visitor's
    // default site is a single empty hero.
    return (
      <WelcomeScreen
        onOpenSaved={() => {
          setActiveSectionId('');
          lastSyncedCategoryIdRef.current = '';
          setShowWelcome(false);
        }}
        onChooseAI={() => {
          setShowWelcome(false);
          setShowAIChat(true);
        }}
        onChooseManual={() => {
          if (isDirty && !window.confirm('Start a new blank site? Unsaved changes in the current site will be replaced. Save them first if you want to keep them.')) return;
          createBlankFlexibleSite();
          setActiveSectionId('');
          lastSyncedCategoryIdRef.current = '';
          setShowWelcome(false);
        }}
        onChooseTemplate={() => {
          setShowWelcome(false);
          setShowTemplateGallery(true);
        }}
        onContinue={isDirty || cloudPortfolio || portfolio.sections.length > 1 ? () => setShowWelcome(false) : undefined}
      />
    );
  }

  // Show template gallery
  if (showTemplateGallery) {
    return (
      <TemplateGallery
        onClose={() => {
          setShowTemplateGallery(false);
          setShowWelcome(true);
        }}
        onSelect={() => setShowTemplateGallery(false)}
      />
    );
  }

  // Show manual design wizard
  if (showWizard) {
    return (
      <ManualDesignWizard
        onClose={() => setShowWizard(false)}
        onComplete={() => setShowWizard(false)}
      />
    );
  }

  // Show AI website chat
  if (showAIChat) {
    return (
      <AIWebsiteChat onClose={() => setShowAIChat(false)} />
    );
  }

  // Grid overlay for the builder: painted INSIDE the preview column only
  // (never over the left menu or the header), colored by gridColor, and only
  // while editing — preview mode must show the clean page.
  const gridLine = (() => {
    const c = (gridColor || '#50648c').replace('#', '');
    const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
    const n = parseInt(full, 16);
    return Number.isFinite(n) ? `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.25)` : 'rgba(80, 100, 140, 0.25)';
  })();
  const gridOverlay = showGrid && !previewMode ? (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-40"
      style={{
        backgroundImage: `linear-gradient(to right, ${gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}
    />
  ) : null;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Cursor Glow Effect */}
      <CursorGlow />

      {/* Grid Overlay — scoped to the preview column(s) below, never over the menus */}

      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-30 bg-[#E8EAED]/95 backdrop-blur-md border-b border-[#B9BFC8] px-4 py-2 flex flex-wrap items-center justify-between gap-3 flex-shrink-0"
        style={{ color: '#121417' }}
      >

        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl leading-none" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}>Portfolio Builder</h1>
          <button
            onClick={() => setShowAIChat(true)}
            className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-blue-50 transition-colors"
            style={{ borderColor: '#2446D6', color: '#2446D6', background: '#ffffff' }}
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden md:inline">AI Website Builder</span>
            <span className="md:hidden">AI</span>
          </button>
          {isDirty && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full" />
              Unsaved changes
            </span>
          )}
          {!isDirty && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Saved
            </span>
          )}
          {/* Account and site management sit apart from the editing tools */}
          <div className="flex items-center gap-2 border-l border-[#B9BFC8] pl-4">
            <AccountControls />
            <SavedWebsites disabled={isSaving} onOpened={() => {
              setActiveSectionId('');
              lastSyncedCategoryIdRef.current = '';
            }} />
          </div>
        </div>

        {/* Editing tools: their own full-width row below the title on narrower screens, one row on wide screens */}
        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:flex-nowrap">
          {/* Undo/Redo */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={handleUndo}
              disabled={!canUndo()}
              className={cn(
                'p-2 transition-colors',
                canUndo() ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
              )}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <button
              onClick={handleRedo}
              disabled={!canRedo()}
              className={cn(
                'p-2 transition-colors',
                canRedo() ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
              )}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Command Palette Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
            title="Command Palette (Ctrl+K)"
          >
            <Command className="w-4 h-4" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-lg">⌘K</kbd>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'desktop' ? 'bg-gray-100' : 'hover:bg-gray-50'
              )}
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'tablet' ? 'bg-gray-100' : 'hover:bg-gray-50'
              )}
              title="Tablet view"
            >
              <TabletViewIcon className="w-5 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                'hover:bg-gray-50'
              )}
              title="Mobile view"
            >
              <PhoneViewIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Rulers & Guides Toggle */}
          <div className="flex items-center border border-gray-200 rounded-xl p-1">
            <button
              onClick={toggleRulers}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                showRulers ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'
              )}
              title="Toggle Rulers"
            >
              <Ruler className="w-4 h-4" />
              <span className="hidden lg:inline text-xs ml-1.5">Rulers</span>
            </button>
            <button
              onClick={toggleGuides}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                showGuides ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-gray-50'
              )}
              title="Toggle Guides (click rulers to add, right-click to remove)"
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden lg:inline text-xs ml-1.5">Guides</span>
            </button>
            <button
              onClick={toggleGrid}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                showGrid ? 'bg-slate-200 text-slate-700' : 'hover:bg-gray-50'
              )}
              title="Toggle Grid"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden lg:inline text-xs ml-1.5">Grid</span>
            </button>
            {showGrid && (
              <label className="p-1 rounded-lg hover:bg-gray-50 flex items-center cursor-pointer" title="Grid color">
                <input
                  type="color"
                  value={gridColor}
                  onChange={(e) => setGridColor(e.target.value)}
                  className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer bg-transparent"
                />
              </label>
            )}
            <button
              onClick={resetElementPositions}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800"
              title="Reset all dragged positions (fixes squeezed/overlapping blocks after layout changes)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary actions: Save and Preview */}
          <Button
            variant="outline"
            onClick={() => void handleSave()}
            disabled={isSaving || status === 'loading' || (!isDirty && savedToCurrentAccount)}
            className="flex items-center gap-2"
            title="Save (Ctrl+S)"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
          <Button
            variant="ghost"
            onClick={togglePreviewMode}
            className="flex items-center gap-2"
          >
            {previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>

          {/* Primary action: the only solid-colour button in the toolbar */}
          <PublishWebsite reference={cloudPortfolio} ownerEmail={session?.user?.email}
            busy={isSaving || status === 'loading'} onPublish={subdomain => handleSave(true, subdomain)} />

          {/* Export and import share one menu */}
          <div className="relative">
            <Button
              ref={moreButtonRef}
              variant="ghost"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2"
              aria-expanded={showExportMenu}
            >
              <MoreHorizontal className="w-4 h-4" />
              More
            </Button>
            {/* Rendered in a portal: the toolbar scrolls horizontally below xl and the header's blur creates its own containing block, either of which would clip or misplace a dropdown. */}
            {showExportMenu && moreButtonRef.current && createPortal(
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div
                  className="fixed w-56 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 overflow-hidden"
                  style={{
                    top: moreButtonRef.current.getBoundingClientRect().bottom + 4,
                    right: window.innerWidth - moreButtonRef.current.getBoundingClientRect().right,
                  }}
                >
                  <button
                    onClick={handleExportHTML}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    🌐 Export as HTML
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    📄 Export as JSON
                  </button>
                  <label className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    Import from JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </>,
              document.body
            )}
          </div>
        </div>
      </motion.header>


      {/* Section List Panel replaced SectionTabs - only show in flexible mode */}

      {/* Add Category button for simple mode */}
      {portfolio.layoutMode === 'simple' && !previewMode && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-medium text-gray-700">Sections</span>
          <button
            onClick={() => setShowAddSection(!showAddSection)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      )}

      {/* Add Category Panel (collapsible below tabs) */}
      {showAddSection && !previewMode && (
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0 rounded-b-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Add a Category</h3>
            <button
              onClick={() => setShowAddSection(false)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
          <AddSectionDialog onSectionAdded={(id) => {
            handleSelectSection(id);
            setShowAddSection(false);
          }} />
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowAddSection(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {!previewMode && portfolio.layoutMode === 'simple' ? (
          /* Simple mode - full width preview with inline editing */
          <div className="flex-1 bg-gray-200 overflow-hidden flex flex-col relative">
            {gridOverlay}
            <div className="flex-1 overflow-auto p-4">
              {isLoading ? (
                <div className="h-full overflow-y-auto bg-white rounded-2xl">
                  <PortfolioSkeleton />
                </div>
              ) : (
                <PortfolioPreview
                  viewMode={viewMode}
                  activeSection={activeSectionId}
                  onEditProject={handleEditProject}
                />
              )}
            </div>
          </div>

        ) : !previewMode ? (
          <>
            {/* Center Panel - Editor (hidden when collapsed) */}
            {!editorCollapsed && (
            <motion.div
              initial={{ x: -360, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="w-full h-[46%] flex-none bg-white/80 backdrop-blur-md border-b border-gray-200 flex flex-col overflow-hidden md:h-auto md:border-b-0 md:border-r"
              style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? editorWidth : undefined }}
            >

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {/* Add Category Button */}
                <div className="p-3">
                  <button
                    onClick={() => setShowAddSection(!showAddSection)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>

                {/* Interactive effects, snap guides and background settings, grouped */}
                <EditorSettingsGroup />

                {/* Divider */}
                <div className="border-t" />

                {/* Element Inspector — shows when an element is selected (replaces SectionEditor) */}
                {selectedElementId ? (
                  <ElementInspector onClose={() => selectElement(null, null)} />
                ) : (
                  /* Section Editor — accordion style, all sections listed */
                  <SectionEditor />
                )}
              </div>
            </motion.div>
            )}

            {/* Resize Handle / Collapse Button / Expand Tab */}
            {editorCollapsed ? (
              /* Expand tab when collapsed */
              <button
                onClick={() => setEditorCollapsed(false)}
                className="hidden md:flex flex-shrink-0 w-8 cursor-pointer bg-white/80 backdrop-blur-md border-r border-gray-200 flex-col items-center justify-center gap-2 hover:bg-blue-50 transition-colors group"
                title="Expand editor panel"
              >
                <PanelLeftOpen className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-[10px] text-gray-400 group-hover:text-blue-600 transition-colors" style={{ writingMode: 'vertical-rl' }}>EDITOR</span>
              </button>
            ) : (
              /* Resize handle with collapse button when expanded */
              <div
                onPointerDown={startEditorResize}
                onPointerMove={doEditorResize}
                onPointerUp={endEditorResize}
                onPointerCancel={endEditorResize}
                className={`hidden md:flex flex-shrink-0 w-1.5 cursor-col-resize bg-gray-300 hover:bg-blue-500 transition-colors items-center justify-center group relative ${isResizingEditor ? 'bg-blue-500' : ''}`}
                style={{ touchAction: 'none' }}
                title="Drag to resize"
              >
                <div className={`w-1 h-8 rounded-full transition-colors ${isResizingEditor ? 'bg-white' : 'bg-gray-400 group-hover:bg-white'}`} />
                <button
                  onClick={(e) => { e.stopPropagation(); setEditorCollapsed(true); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute top-3 -right-3 w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                  title="Collapse editor panel"
                >
                  <PanelLeftClose className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            )}

            {/* Right Panel - Preview */}
            <motion.div
              initial={{ x: 360, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              className="flex-1 min-h-0 bg-gray-200 overflow-hidden flex flex-col relative"
            >
              {gridOverlay}
              <div className="flex-1 overflow-hidden p-2 sm:p-4">
                {isLoading ? (
                  <div className="h-full overflow-y-auto bg-white rounded-2xl">
                    <PortfolioSkeleton />
                  </div>
                ) : activeSectionId ? (
                  <>
                    {portfolio.sections.length === 1 && (
                      <p className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-900">
                        Click a section in the sidebar to edit it, or use Add Category to build the rest of your page.
                      </p>
                    )}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={viewMode}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="h-full"
                    >
                      <PortfolioPreview
                        viewMode={viewMode}
                        activeSection={activeSectionId}
                        onEditProject={handleEditProject}
                      />
                    </motion.div>
                  </AnimatePresence>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Add a category to see the preview
                  </div>
                )}
              </div>
            </motion.div>

          </>
        ) : (
          /* Full Preview Mode */
          <div className="flex-1 bg-gray-200 overflow-hidden flex flex-col relative">
            {gridOverlay}
            <div className="flex-1 overflow-hidden p-4">
              <PortfolioPreview viewMode={viewMode} activeSection={activeSectionId} />
            </div>
          </div>
        )}
      </div>


      {/* Project Editor Modal */}
      <ProjectEditorModal
        project={editingProject}
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        categoryName={editingProject?.category || ''}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectSection={handleSelectSection}
        onOpenAddSection={() => setShowAddSection(true)}
      />
    </div>
  );
}
