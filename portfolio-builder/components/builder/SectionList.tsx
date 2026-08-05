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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePortfolioStore } from '@/lib/store';
import { sectionConfig } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { GripVertical, Trash2, User, FileText, Briefcase, Star, Building, GraduationCap, MessageSquare, Mail, Share2 } from 'lucide-react';

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
  id: string;
  title: string;
  type: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SortableItem({ id, title, type, isSelected, onSelect, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = sectionIcons[type] || FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300',
        isDragging && 'opacity-50 shadow-lg'
      )}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <Icon className="w-4 h-4 text-gray-500" />
      <span className="flex-1 text-sm font-medium truncate">{title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function SectionList() {
  const { portfolio, selectedSectionId, selectSection, removeSection, reorderSections } = usePortfolioStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  const getSectionTitle = (section: { type: string; title?: string; name?: string }) => {
    if (section.type === 'hero' && 'name' in section) {
      return section.name || 'Hero';
    }
    return section.title || sectionConfig[section.type as keyof typeof sectionConfig]?.name || section.type;
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
              id={section.id}
              type={section.type}
              title={getSectionTitle(section)}
              isSelected={selectedSectionId === section.id}
              onSelect={() => selectSection(section.id)}
              onDelete={() => removeSection(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}