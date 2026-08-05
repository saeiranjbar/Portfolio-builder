'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePortfolioStore } from '@/lib/store';
import { sectionConfig } from '@/lib/templates';
import { PortfolioSection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Plus, Eye, EyeOff, Copy, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

interface SortableTabProps {
  section: PortfolioSection;
  isActive: boolean;
  onSelect: () => void;
  readOnly?: boolean;
}

function SortableTab({ section, isActive, onSelect, readOnly }: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const { duplicateSection, removeSection, toggleSectionVisibility } = usePortfolioStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const config = sectionConfig[section.type];
  const isVisible = section.visible !== false;
  const displayName =
    section.type === 'hero'
      ? section.name || 'Home'
      : (section as any).title || config?.name || section.type;

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSectionVisibility(section.id);
    toast.success(isVisible ? 'Section hidden' : 'Section shown', {
      icon: isVisible ? '👁️‍🗨️' : '👁️',
    });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateSection(section.id);
    toast.success('Section duplicated', { icon: '📋' });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeSection(section.id);
    toast.success('Section deleted', { icon: '🗑️' });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-1.5 px-4 py-1.5 my-2 text-sm whitespace-nowrap cursor-pointer transition-all duration-200 flex-shrink-0 rounded-full',
        isActive
          ? 'bg-blue-100 text-blue-700 font-medium'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        !isVisible && 'opacity-50'
      )}
      onClick={onSelect}
    >
      {!readOnly && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          <GripVertical className="w-3 h-3" />
        </button>
      )}
      <span>{displayName}</span>

      {!readOnly && (
        <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleVisibility}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            title={isVisible ? 'Hide section' : 'Show section'}
          >
            {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            title="Duplicate section"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete section"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

interface SectionTabsProps {
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
  onAddSection?: () => void;
  readOnly?: boolean;
}

export function SectionTabs({
  activeSectionId,
  onSelectSection,
  onAddSection,
  readOnly = false,
}: SectionTabsProps) {
  const { portfolio, reorderSections } = usePortfolioStore();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = portfolio.sections.findIndex((s) => s.id === active.id);
      const newIndex = portfolio.sections.findIndex((s) => s.id === over.id);
      reorderSections(oldIndex, newIndex);
    }
  };

  const visibleSections = readOnly
    ? portfolio.sections.filter((s) => s.visible !== false)
    : portfolio.sections;

  return (
    <div className="bg-white border-b border-gray-200 flex items-center flex-shrink-0">
      <div className="flex-1 flex items-center overflow-x-auto px-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleSections.map((s) => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            {visibleSections.map((section) => (
              <SortableTab
                key={section.id}
                section={section}
                isActive={activeSectionId === section.id}
                onSelect={() => onSelectSection(section.id)}
                readOnly={readOnly}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add section button */}
      {!readOnly && onAddSection && (
        <button
          onClick={onAddSection}
          className="flex items-center justify-center w-8 h-8 my-2 mx-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 flex-shrink-0"
          title="Add section"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
