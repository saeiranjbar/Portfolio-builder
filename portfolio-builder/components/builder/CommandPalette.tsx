'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePortfolioStore } from '@/lib/store';
import { sectionConfig } from '@/lib/templates';
import { SectionType } from '@/lib/types';
import { downloadHTML, downloadJSON } from '@/lib/export';
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Undo2,
  Redo2,
  Download,
  Monitor,
  Tablet,
  Smartphone,
  Palette,
  Layers,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  CornerDownLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
  group: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (sectionId: string) => void;
  onOpenAddSection: () => void;
}

export function CommandPalette({ isOpen, onClose, onSelectSection, onOpenAddSection }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    portfolio,
    previewMode,
    viewMode,
    togglePreviewMode,
    setViewMode,
    undo,
    redo,
    canUndo,
    canRedo,
    addSection,
    duplicateSection,
    removeSection,
    toggleSectionVisibility,
    moveSection,
    selectedSectionId,
  } = usePortfolioStore();

  // Build commands
  const commands: Command[] = React.useMemo(() => {
    const cmds: Command[] = [];

    // View actions
    cmds.push({
      id: 'toggle-preview',
      label: previewMode ? 'Switch to Edit mode' : 'Switch to Preview mode',
      shortcut: 'Ctrl+P',
      icon: previewMode ? Edit3 : Eye,
      action: () => {
        togglePreviewMode();
        onClose();
      },
      group: 'View',
    });

    cmds.push({
      id: 'view-desktop',
      label: 'Set view to Desktop',
      icon: Monitor,
      action: () => {
        setViewMode('desktop');
        onClose();
      },
      group: 'View',
    });

    cmds.push({
      id: 'view-tablet',
      label: 'Set view to Tablet',
      icon: Tablet,
      action: () => {
        setViewMode('tablet');
        onClose();
      },
      group: 'View',
    });

    cmds.push({
      id: 'view-mobile',
      label: 'Set view to Mobile',
      icon: Smartphone,
      action: () => {
        setViewMode('mobile');
        onClose();
      },
      group: 'View',
    });

    // History actions
    if (canUndo()) {
      cmds.push({
        id: 'undo',
        label: 'Undo',
        shortcut: 'Ctrl+Z',
        icon: Undo2,
        action: () => {
          undo();
          onClose();
        },
        group: 'History',
      });
    }

    if (canRedo()) {
      cmds.push({
        id: 'redo',
        label: 'Redo',
        shortcut: 'Ctrl+Shift+Z',
        icon: Redo2,
        action: () => {
          redo();
          onClose();
        },
        group: 'History',
      });
    }

    // Section actions
    cmds.push({
      id: 'add-section',
      label: 'Add new section',
      shortcut: 'Ctrl+Shift+A',
      icon: Plus,
      action: () => {
        onOpenAddSection();
        onClose();
      },
      group: 'Sections',
    });

    // Navigate to sections
    portfolio.sections.forEach((section) => {
      const config = sectionConfig[section.type];
      const name = section.type === 'hero' ? 'Introduction' : (section as any).title || config?.name || section.type;
      cmds.push({
        id: `goto-${section.id}`,
        label: `Go to: ${name}`,
        icon: Layers,
        action: () => {
          onSelectSection(section.id);
          onClose();
        },
        group: 'Navigate',
      });
    });

    // Section actions on selected section
    if (selectedSectionId) {
      const section = portfolio.sections.find((s) => s.id === selectedSectionId);
      if (section) {
        cmds.push({
          id: 'duplicate-section',
          label: 'Duplicate current section',
          shortcut: 'Ctrl+D',
          icon: Copy,
          action: () => {
            duplicateSection(selectedSectionId);
            toast.success('Section duplicated');
            onClose();
          },
          group: 'Sections',
        });

        cmds.push({
          id: 'toggle-visibility',
          label: 'Toggle section visibility',
          icon: Eye,
          action: () => {
            toggleSectionVisibility(selectedSectionId);
            onClose();
          },
          group: 'Sections',
        });

        cmds.push({
          id: 'move-up',
          label: 'Move section up',
          icon: ArrowUp,
          action: () => {
            moveSection(selectedSectionId, 'up');
            onClose();
          },
          group: 'Sections',
        });

        cmds.push({
          id: 'move-down',
          label: 'Move section down',
          icon: ArrowDown,
          action: () => {
            moveSection(selectedSectionId, 'down');
            onClose();
          },
          group: 'Sections',
        });

        cmds.push({
          id: 'delete-section',
          label: 'Delete current section',
          icon: Trash2,
          action: () => {
            removeSection(selectedSectionId);
            toast.success('Section deleted');
            onClose();
          },
          group: 'Sections',
        });
      }
    }

    // Export actions
    cmds.push({
      id: 'export-html',
      label: 'Export as HTML',
      icon: Download,
      action: () => {
        downloadHTML(portfolio);
        toast.success('HTML exported');
        onClose();
      },
      group: 'Export',
    });

    cmds.push({
      id: 'export-json',
      label: 'Export as JSON',
      icon: Download,
      action: () => {
        downloadJSON(portfolio);
        toast.success('JSON exported');
        onClose();
      },
      group: 'Export',
    });

    return cmds;
  }, [
    portfolio, previewMode, viewMode, selectedSectionId, canUndo, canRedo,
    togglePreviewMode, setViewMode, undo, redo, addSection, duplicateSection,
    removeSection, toggleSectionVisibility, moveSection, onSelectSection,
    onOpenAddSection, onClose,
  ]);

  // Filter commands by query
  const filteredCommands = React.useMemo(() => {
    if (!query) return commands;
    const lower = query.toLowerCase();
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(lower));
  }, [commands, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) cmd.action();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Group commands
  const grouped = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  let runningIndex = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
          />
          <kbd className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">ESC</kbd>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No commands found
            </div>
          ) : (
            Object.entries(grouped).map(([group, cmds]) => (
              <div key={group}>
                <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {group}
                </div>
                {cmds.map((cmd) => {
                  const index = runningIndex++;
                  const isSelected = index === selectedIndex;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => cmd.action()}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 flex-shrink-0', isSelected ? 'text-blue-600' : 'text-gray-400')} />
                      <span className="flex-1 text-sm text-gray-900">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-200 px-1.5 py-0.5 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-200 px-1.5 py-0.5 rounded">↵</kbd>
              Select
            </span>
          </div>
          <span className="text-xs text-gray-400">Command Palette</span>
        </div>
      </div>
    </div>
  );
}
