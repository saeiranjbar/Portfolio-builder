'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolioStore } from '@/lib/store';
import { SectionEditor } from '@/components/builder/SectionEditor';
import { SectionListPanel } from '@/components/builder/SectionListPanel';
import { AddSectionDialog } from '@/components/builder/AddSectionDialog';
import { PortfolioPreview } from '@/components/builder/PortfolioPreview';
import { ThemeSettings } from '@/components/builder/ThemeSettings';
import { EffectsPanel } from '@/components/builder/EffectsPanel';
import { SectionTabs } from '@/components/builder/SectionTabs';
import { CommandPalette } from '@/components/builder/CommandPalette';
import { downloadHTML, downloadJSON } from '@/lib/export';
import { Project } from '@/lib/types';
import { ProjectEditorModal } from '@/components/builder/ProjectEditorModal';
import { PortfolioSkeleton } from '@/components/builder/Skeleton';
import { Button } from '@/components/ui/button';
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Edit3,
  Download,
  Upload,
  Palette,
  Undo2,
  Redo2,
  Command,
  Settings,
  Save,
  LayoutGrid,
  Columns,
  Plus,
  Wand2,
  Sparkles,
} from 'lucide-react';


import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { AIWebsiteChat } from '@/components/builder/AIWebsiteChat';
import { WelcomeScreen } from '@/components/builder/WelcomeScreen';
import { ManualDesignWizard } from '@/components/builder/ManualDesignWizard';
import { TemplateGallery } from '@/components/builder/TemplateGallery';
import { CursorGlow } from '@/components/builder/effects/CursorGlow';
import { motion, AnimatePresence } from 'framer-motion';


export default function BuilderPage() {
  const {
    portfolio,
    previewMode,
    viewMode,
    togglePreviewMode,
    setViewMode,
    setPortfolio,
    selectSection,
    removeSection,
    updateSection,
    isDirty,
    undo,
    redo,
    canUndo,
    canRedo,
    duplicateSection,
    selectedSectionId,
    markClean,
    setLayoutMode,
    createBlankFlexibleSite,
  } = usePortfolioStore();


  // Get the default section ID (hero or first section)
  const defaultSectionId = React.useMemo(() => {
    if (portfolio.sections.length === 0) return '';
    const heroSection = portfolio.sections.find(s => s.type === 'hero');
    return heroSection?.id || portfolio.sections[0].id;
  }, [portfolio.sections]);

  // State
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const lastSyncedCategoryIdRef = React.useRef<string>('');
  const wasPreviewModeRef = React.useRef(previewMode);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

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
  }, [canUndo, canRedo, undo, redo, togglePreviewMode, duplicateSection, selectedSectionId, isCommandPaletteOpen, showExportMenu, showAddSection]);

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

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
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

  const handleSave = () => {
    markClean();
    toast.success('Portfolio saved', { icon: '💾' });
  };

  const activeSection = portfolio.sections.find(s => s.id === activeSectionId);

  // Show welcome screen first
  if (showWelcome) {
    return (
      <WelcomeScreen
        onChooseAI={() => {
          setShowWelcome(false);
          setShowAIChat(true);
        }}
        onChooseManual={() => {
          createBlankFlexibleSite();
          setShowWelcome(false);
        }}
        onChooseTemplate={() => {
          setShowWelcome(false);
          setShowTemplateGallery(true);
        }}
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

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Cursor Glow Effect */}
      <CursorGlow />

      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0"
      >

        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Portfolio Builder</h1>
          <button
            onClick={() => setShowAIChat(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden md:inline">AI Website Builder</span>
            <span className="md:hidden">AI</span>
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                const hero = portfolio.sections.find(s => s.type === 'hero');
                if (!hero) { toast.error('No Hero section found'); return; }
                // Find existing sections to link CTA buttons to real targets
                const about = portfolio.sections.find(s => s.type === 'about');
                const contact = portfolio.sections.find(s => s.type === 'contact');
                const projects = portfolio.sections.find(s => s.type === 'projects');
                updateSection(hero.id, {
                  name: 'Jane Doe', title: 'Senior Product Designer',
                  subtitle: 'Creating delightful digital experiences',
                  bio: 'Passionate designer with 8+ years of experience crafting user-centered digital products.',
                  avatar: 'https://picsum.photos/seed/avatar/300/300',
                  avatarShape: 'circle', avatarWidth: 120, avatarHeight: 120,
                  showName: true, showTitle: true, showSubtitle: true, showBio: true, showAvatar: true, showScrollIndicator: true,
                  avatarPosition: { x: 50, y: 8 }, namePosition: { x: 50, y: 18 },
                  titlePosition: { x: 50, y: 28 }, subtitlePosition: { x: 50, y: 38 },
                  bioPosition: { x: 50, y: 50 }, ctaButtonsPosition: { x: 50, y: 75 },
                  ctaButtons: [
                    { id: 'cta-1', label: 'About Me', link: about ? `#section-${about.id}` : '#about', variant: 'primary' as const },
                    { id: 'cta-2', label: 'My Projects', link: projects ? `#section-${projects.id}` : '#projects', variant: 'outline' as const },
                    { id: 'cta-3', label: 'Get In Touch', link: contact ? `#section-${contact.id}` : '#contact', variant: 'secondary' as const },
                  ],
                  freeFormEnabled: true, snapEnabled: true,
                  galleryImages: [
                    { id: 'gi-1', url: 'https://picsum.photos/seed/test1/800/600', caption: 'Test 1' },
                    { id: 'gi-2', url: 'https://picsum.photos/seed/test2/800/600', caption: 'Test 2' },
                    { id: 'gi-3', url: 'https://picsum.photos/seed/test3/800/600', caption: 'Test 3' },
                    { id: 'gi-4', url: 'https://picsum.photos/seed/test4/800/600', caption: 'Test 4' },
                    { id: 'gi-5', url: 'https://picsum.photos/seed/test5/800/600', caption: 'Test 5' },
                    { id: 'gi-6', url: 'https://picsum.photos/seed/test6/800/600', caption: 'Test 6' },
                  ],
                  galleryVideos: [
                    { id: 'gv-1', type: 'youtube', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'YouTube Test' },
                    { id: 'gv-2', type: 'vimeo', url: 'https://player.vimeo.com/video/76979871', caption: 'Vimeo Test' },
                  ],
                  galleryGridCols: 3, galleryVideoGridCols: 2,
                  typingWords: ['Designer', 'Developer', 'Creator'], parallaxEnabled: false,
                } as any);
                toast.success('Test data loaded into Hero section!');
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
              title="Load test data into Hero section"
            >
              <span className="hidden md:inline">🧪 Test Data</span>
              <span className="md:hidden">🧪</span>
            </button>
          )}
          {isDirty && (
            <span className="text-xs text-orange-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Unsaved changes
            </span>
          )}
          {!isDirty && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
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

          {/* Layout Mode Toggle */}
          <div className="flex items-center border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setLayoutMode('flexible')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                portfolio.layoutMode === 'flexible' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'hover:bg-gray-50 text-gray-500'
              )}
              title="Website mode - free-form drag and drop with full customization"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('simple')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                portfolio.layoutMode === 'simple' ? 'bg-green-100 text-green-700 border-green-300' : 'hover:bg-gray-50 text-gray-500'
              )}
              title="Portfolio mode - structured template for quick portfolio creation"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

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
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'mobile' ? 'bg-gray-100' : 'hover:bg-gray-50'
              )}
              title="Mobile view"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Save Button */}
          <Button
            variant={isDirty ? 'default' : 'outline'}
            onClick={handleSave}
            disabled={!isDirty}
            className="flex items-center gap-2"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>

          {/* Preview Toggle */}
          <Button
            variant={previewMode ? 'default' : 'outline'}
            onClick={togglePreviewMode}
            className="flex items-center gap-2"
          >
            {previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>

          {/* Export Dropdown */}
          <div className="relative">
            <Button
              className="flex items-center gap-2"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-lg border border-gray-200 z-20 overflow-hidden">
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
                </div>
              </>
            )}
          </div>

          {/* Import */}
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
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
              className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
              title="Close (press Escape)"
            >
              ✕
            </button>
          </div>
          <AddSectionDialog onSectionAdded={(id) => {
            handleSelectSection(id);
            setShowAddSection(false);
          }} />
        </div>
      )}


      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!previewMode && portfolio.layoutMode === 'simple' ? (
          /* Simple mode - full width preview with inline editing */
          <div className="flex-1 bg-gray-200 overflow-auto flex flex-col">
            <div className="flex-1 overflow-visible p-4">
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
            {/* Center Panel - Editor */}
            <motion.div
              initial={{ x: -360, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="w-[320px] bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col overflow-hidden"
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

                {/* Theme Settings Toggle */}
                <div className="p-3">
                  <button
                    onClick={() => setShowThemePanel(!showThemePanel)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200',
                      showThemePanel
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 bg-gradient-to-r hover:from-purple-50 hover:to-blue-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-900">Theme Settings</span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {showThemePanel ? '▲' : '▼'}
                    </span>
                  </button>
                </div>

                {/* Theme Panel */}
                {showThemePanel && (
                  <div className="px-3 pb-4">
                    <ThemeSettings />
                  </div>
                )}

                {/* Effects Settings Toggle */}
                <div className="p-3">
                  <button
                    onClick={() => setShowEffectsPanel(!showEffectsPanel)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200',
                      showEffectsPanel
                        ? 'border-pink-400 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300 bg-gradient-to-r hover:from-pink-50 hover:to-purple-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                      <span className="text-sm font-semibold text-gray-900">Interactive Effects</span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {showEffectsPanel ? '▲' : '▼'}
                    </span>
                  </button>
                </div>

                {/* Effects Panel */}
                {showEffectsPanel && (
                  <div className="px-3 pb-4">
                    <EffectsPanel />
                  </div>
                )}

                {/* Divider */}
                <div className="border-t" />

                {/* Section Editor — accordion style, all sections listed */}
                <SectionEditor />
              </div>
            </motion.div>

            {/* Right Panel - Preview */}
            <motion.div
              initial={{ x: 360, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              className="flex-1 bg-gray-200 overflow-hidden flex flex-col"
            >
              <div className="flex-1 overflow-hidden p-4">
                {isLoading ? (
                  <div className="h-full overflow-y-auto bg-white rounded-2xl">
                    <PortfolioSkeleton />
                  </div>
                ) : activeSectionId ? (
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
          <div className="flex-1 bg-gray-200 overflow-hidden flex flex-col">
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
