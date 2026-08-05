'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePortfolioStore } from '@/lib/store';
import { sectionConfig } from '@/lib/templates';
import { PortfolioSection } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  GripVertical,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  User,
  FileText,
  Briefcase,
  Star,
  Building,
  GraduationCap,
  MessageSquare,
  Mail,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const sectionIcons: Record<string, React.ElementType> = {
  hero: User,
  about: FileText,
  projects: Briefcase,
  skills: Star,
  experience: Building,
  education: GraduationCap,
  testimonials: MessageSquare,
  contact: Mail,
  social: Share2,
};

interface SortableItemProps {
  section: PortfolioSection;
  isActive: boolean;
  onSelect: () => void;
}

function SortableItem({ section, isActive, onSelect }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const { duplicateSection, removeSection, toggleSectionVisibility, moveSection } = usePortfolioStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const config = sectionConfig[section.type];
  const Icon = sectionIcons[section.type] || FileText;
  const isVisible = section.visible !== false;
  const displayName = section.type === 'hero' ? 'Introduction' : (section as any).title || config?.name || section.type;


  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeSection(section.id);
    toast.success('Section deleted', { icon: '🗑️' });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateSection(section.id);
    toast.success('Section duplicated', { icon: '📋' });
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSectionVisibility(section.id);
    toast.success(isVisible ? 'Section hidden' : 'Section shown', {
      icon: isVisible ? '👁️‍🗨️' : '👁️',
    });
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveSection(section.id, 'up');
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveSection(section.id, 'down');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-2 rounded-lg border transition-all cursor-pointer',
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
        !isVisible && 'opacity-50'
      )}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Section Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center',
          isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Section Name */}
      <div className="flex-1 min-w-0 py-3">
        <span className="text-sm font-medium text-gray-900 truncate block">
          {displayName}
        </span>
        <span className="text-xs text-gray-400">{config?.name}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleMoveUp}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          title="Move up"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMoveDown}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          title="Move down"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleToggleVisibility}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          title={isVisible ? 'Hide section' : 'Show section'}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleDuplicate}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          title="Duplicate section"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
          title="Delete section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

interface SortableSectionListProps {
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
}

export function SortableSectionList({ activeSectionId, onSelectSection }: SortableSectionListProps) {
  const { portfolio, reorderSections } = usePortfolioStore();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
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

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={portfolio.sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {portfolio.sections.map((section) => (
            <SortableItem
              key={section.id}
              section={section}
              isActive={activeSectionId === section.id}
              onSelect={() => onSelectSection(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
