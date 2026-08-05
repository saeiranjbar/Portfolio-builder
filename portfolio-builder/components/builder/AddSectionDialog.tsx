'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { sectionConfig } from '@/lib/templates';
import { SectionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  User, FileText, Briefcase, Star, Building, GraduationCap,
  MessageSquare, Mail, Share2, PanelBottom, Megaphone, Layers,
  Workflow, BarChart3, Trophy, Newspaper, BadgeCheck, Image as ImageIcon
} from 'lucide-react';

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

  const existingTypes = portfolio.sections.map((s) => s.type);
  const availableTypes = Object.entries(sectionConfig).filter(
    ([type]) => !existingTypes.includes(type as SectionType) || type === 'hero'
  );

  const handleAddSection = (type: SectionType) => {
    addSection(type);
    setTimeout(() => {
      const addedSection = usePortfolioStore.getState().portfolio.sections[usePortfolioStore.getState().portfolio.sections.length - 1];
      if (addedSection && onSectionAdded) {
        onSectionAdded(addedSection.id);
      }
    }, 0);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Select a section type to add to your portfolio:</p>
      <div className="grid grid-cols-2 gap-3">
        {availableTypes.map(([type, config]) => {
          const Icon = sectionIcons[type] || FileText;
          return (
            <button
              key={type}
              onClick={() => handleAddSection(type as SectionType)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                <Icon className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-sm font-medium text-gray-900">{config.name}</span>
              <span className="text-xs text-gray-500 text-center">{config.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
