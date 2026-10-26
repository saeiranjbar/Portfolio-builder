'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { HeroEditor } from './editors/HeroEditor';
import { AboutEditor } from './editors/AboutEditor';
import { ProjectsEditor } from './editors/ProjectsEditor';
import { SkillsEditor } from './editors/SkillsEditor';
import { ExperienceEditor } from './editors/ExperienceEditor';
import { EducationEditor } from './editors/EducationEditor';
import { TestimonialsEditor } from './editors/TestimonialsEditor';
import { ContactEditor } from './editors/ContactEditor';
import { SocialEditor } from './editors/SocialEditor';
import { FooterEditor } from './editors/FooterEditor';
import { CTABannerEditor } from './editors/CTABannerEditor';
import { ServicesEditor } from './editors/ServicesEditor';
import { ProcessEditor } from './editors/ProcessEditor';
import { StatsEditor } from './editors/StatsEditor';
import { AwardsEditor } from './editors/AwardsEditor';
import { PressEditor } from './editors/PressEditor';
import { CertificationsEditor } from './editors/CertificationsEditor';
import { BlogEditor } from './editors/BlogEditor';
import { FAQEditor } from './editors/FAQEditor';
import { NewsletterEditor } from './editors/NewsletterEditor';

import { PortfolioSection } from '@/lib/types';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectBackgroundSettings } from './ProjectBackgroundSettings';
import { Magnet } from 'lucide-react';

export function SectionEditor() {

  const { portfolio, selectedSectionId, selectSection, updateSection, removeSection } = usePortfolioStore();

  const handleUpdate = (sectionId: string, updates: Partial<PortfolioSection>) => {
    updateSection(sectionId, updates);
  };

  const renderEditorForSection = (section: PortfolioSection) => {
    const handleUpdate = (updates: Partial<PortfolioSection>) => {
      updateSection(section.id, updates);
    };
    switch (section.type) {
      case 'hero':
        return <HeroEditor section={section as any} onUpdate={handleUpdate} />;
      case 'about':
        return <AboutEditor section={section as any} onUpdate={handleUpdate} />;
      case 'projects':
        return <ProjectsEditor section={section as any} onUpdate={handleUpdate} />;
      case 'skills':
        return <SkillsEditor section={section as any} onUpdate={handleUpdate} />;
      case 'experience':
        return <ExperienceEditor section={section as any} onUpdate={handleUpdate} />;
      case 'education':
        return <EducationEditor section={section as any} onUpdate={handleUpdate} />;
      case 'testimonials':
        return <TestimonialsEditor section={section as any} onUpdate={handleUpdate} />;
      case 'contact':
        return <ContactEditor section={section as any} onUpdate={handleUpdate} />;
      case 'social':
        return <SocialEditor section={section as any} onUpdate={handleUpdate} />;
      case 'footer':
        return <FooterEditor section={section as any} onUpdate={handleUpdate} />;
      case 'ctaBanner':
        return <CTABannerEditor section={section as any} onUpdate={handleUpdate} />;
      case 'services':
        return <ServicesEditor section={section as any} onUpdate={handleUpdate} />;
      case 'process':
        return <ProcessEditor section={section as any} onUpdate={handleUpdate} />;
      case 'stats':
        return <StatsEditor section={section as any} onUpdate={handleUpdate} />;
      case 'awards':
        return <AwardsEditor section={section as any} onUpdate={handleUpdate} />;
      case 'press':
        return <PressEditor section={section as any} onUpdate={handleUpdate} />;
      case 'certifications':
        return <CertificationsEditor section={section as any} onUpdate={handleUpdate} />;
      case 'blog':
        return <BlogEditor section={section as any} onUpdate={handleUpdate} />;
      case 'faq':
        return <FAQEditor section={section as any} onUpdate={handleUpdate} />;
      case 'newsletter':
        return <NewsletterEditor section={section as any} onUpdate={handleUpdate} />;
      default:
        return <div>Unknown section type</div>;
    }
  };

  const handleDelete = (section: PortfolioSection) => {
    const label = getSectionLabel(section);
    if (!window.confirm('Delete the "' + label + '" section? This cannot be undone.')) return;

    removeSection(section.id);
    if (selectedSectionId === section.id) selectSection(null);
  };

  // Get section display label
  const getSectionLabel = (section: PortfolioSection): string => {
    if (section.type === 'hero') return 'Hero Section';
    if ((section as any).title) return (section as any).title;
    return section.type.charAt(0).toUpperCase() + section.type.slice(1);
  };

  // Find hero section for snap guides toggle (stored on hero in flexible mode)
  const heroSection = portfolio.sections.find(s => s.type === 'hero');
  const isSimpleMode = portfolio.layoutMode === 'simple';

  return (
    <div className="min-h-0">
      {/* Snap Guides toggle — always visible at top (free-form mode only) */}
      {!isSimpleMode && heroSection && (
        <div className="px-4 py-3 border-b border-gray-200 bg-blue-50/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-blue-700">
              <Magnet className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Snap Guides</span>
            </div>
            <button
              onClick={() => updateSection(heroSection.id, { snapEnabled: !((heroSection as any).snapEnabled !== false) } as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (heroSection as any).snapEnabled !== false
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title="Toggle snap guides for aligning elements"
            >
              <Magnet className="w-3.5 h-3.5" />
              {(heroSection as any).snapEnabled !== false ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      )}

      {/* Project-level Background Settings — always visible at top */}
      <ProjectBackgroundSettings />

      {portfolio.sections.map((section) => {

        const isExpanded = section.id === selectedSectionId;
        return (
          <div key={section.id} className="border-b border-gray-100">
            {/* Accordion Header */}
            <div className={cn(
              'flex items-center border-l-2 transition-colors',
              isExpanded ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'
            )}>
              <button
                onClick={() => selectSection(isExpanded ? null : section.id)}
                className="flex-1 flex items-center gap-2 px-4 py-3 text-left min-w-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <span className={cn(
                  'text-sm font-medium capitalize flex-1 truncate',
                  isExpanded ? 'text-blue-700' : 'text-gray-700'
                )}>
                  {getSectionLabel(section)}
                </span>
                <span className="text-xs text-gray-400 capitalize">{section.type}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(section)}
                className="mr-2 rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                title="Delete section"
                aria-label="Delete section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {/* Accordion Content — only render when expanded */}
            {isExpanded && (
              <div className="px-4 pb-4">
                {renderEditorForSection(section)}
              </div>
            )}
          </div>
        );
      })}

      {portfolio.sections.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-500 p-8">
          <div className="text-center">
            <p className="text-sm font-medium">No Sections Yet</p>
            <p className="text-xs mt-1">Add a section to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
