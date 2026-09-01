'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { sectionConfig } from '@/lib/templates';
import { SectionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  FileText, Briefcase, Star, Building, GraduationCap, MessageSquare, Mail,
  Share2, PanelBottom, Megaphone, Layers, Workflow, BarChart3, Trophy,
  Newspaper, BadgeCheck
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  about: FileText,
  projects: Briefcase,
  skills: Star,
  experience: Building,
  education: GraduationCap,
  testimonials: MessageSquare,
  contact: Mail,
  social: Share2,
  footer: PanelBottom,
  ctaBanner: Megaphone,
  services: Layers,
  process: Workflow,
  stats: BarChart3,
  awards: Trophy,
  press: Newspaper,
  certifications: BadgeCheck,
};

interface AddSectionDialogProps {
  onSectionAdded?: (sectionId: string) => void;
}

export function AddSectionDialog({ onSectionAdded }: AddSectionDialogProps) {
  const { portfolio, addSection } = usePortfolioStore();
  const existingTypes = new Set(portfolio.sections.map((section) => section.type));
  const availableCategories = Object.entries(sectionConfig).filter(
    ([type]) => type !== 'hero' && !existingTypes.has(type as SectionType)
  );

  const handleAddCategory = (type: SectionType) => {
    addSection(type);
    setTimeout(() => {
      const sections = usePortfolioStore.getState().portfolio.sections;
      const addedCategory = sections[sections.length - 1];
      if (addedCategory && onSectionAdded) onSectionAdded(addedCategory.id);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-900">Add a category to this landing page</p>
        <p className="mt-1 text-sm text-gray-600">Every category uses this page’s central theme. Hero is already your starting category.</p>
      </div>

      {availableCategories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {availableCategories.map(([type, config]) => {
            const Icon = categoryIcons[type] || FileText;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleAddCategory(type as SectionType)}
                className={cn('flex flex-col items-center gap-2 rounded-2xl border border-gray-200 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md')}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
                  <Icon className="h-6 w-6 text-gray-900" />
                </div>
                <span className="text-sm font-medium text-gray-900">{config.name}</span>
                <span className="text-center text-xs text-gray-500">{config.description}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
          All available categories have already been added.
        </p>
      )}
    </div>
  );
}
