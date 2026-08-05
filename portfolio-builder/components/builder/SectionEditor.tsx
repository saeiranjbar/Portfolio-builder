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



export function SectionEditor() {
  const { portfolio, selectedSectionId, updateSection } = usePortfolioStore();
  
  const selectedSection = portfolio.sections.find(s => s.id === selectedSectionId);
  
  if (!selectedSection) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No Section Selected</p>
          <p className="text-sm">Select a section from the list to edit its content</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<PortfolioSection>) => {
    updateSection(selectedSection.id, updates);
  };

  const renderEditor = () => {
    switch (selectedSection.type) {
      case 'hero':
        return <HeroEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'about':
        return <AboutEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'projects':
        return <ProjectsEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'skills':
        return <SkillsEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'experience':
        return <ExperienceEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'education':
        return <EducationEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'testimonials':
        return <TestimonialsEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'contact':
        return <ContactEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'social':
        return <SocialEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'footer':
        return <FooterEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'ctaBanner':
        return <CTABannerEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'services':
        return <ServicesEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'process':
        return <ProcessEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'stats':
        return <StatsEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'awards':
        return <AwardsEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'press':
        return <PressEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'certifications':
        return <CertificationsEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'blog':
        return <BlogEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'faq':
        return <FAQEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      case 'newsletter':
        return <NewsletterEditor section={selectedSection as any} onUpdate={handleUpdate} />;
      default:

        return <div>Unknown section type</div>;


    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {renderEditor()}
    </div>
  );
}
