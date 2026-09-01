'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface SectionListPanelProps {
  onAddSectionClick?: () => void;
}

export function SectionListPanel({ onAddSectionClick }: SectionListPanelProps) {
  const {
    portfolio,
    selectedSectionId,
    selectSection,
    removeSection,
    moveSection,
  } = usePortfolioStore();

  const handleSelectSection = (sectionId: string) => {
    selectSection(sectionId);
  };

  const handleRemoveSection = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSection(sectionId);
    if (selectedSectionId === sectionId) {
      selectSection(null);
    }
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    moveSection(sectionId, direction);
  };

  return (
    <div className="w-32 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Sections List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {portfolio.sections.map((section, index) => (
            <div
              key={section.id}
              onClick={() => handleSelectSection(section.id)}
              className={`w-full text-left px-4 py-3 transition-colors flex items-start justify-between gap-2 group cursor-pointer ${
                selectedSectionId === section.id
                  ? 'bg-blue-50 border-l-4 border-blue-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={(e) => handleMoveSection(section.id, 'up', e)}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleMoveSection(section.id, 'down', e)}
                    disabled={index === portfolio.sections.length - 1}
                    className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 capitalize">
                    {section.type}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {section.type === 'hero' && section.name}
                    {section.type === 'about' && section.title}
                    {section.type === 'projects' && 'Project showcase'}
                    {section.type === 'skills' && 'Your skills'}
                    {section.type === 'experience' && 'Work experience'}
                    {section.type === 'education' && 'Education'}
                    {section.type === 'testimonials' && 'Client testimonials'}
                    {section.type === 'contact' && 'Get in touch'}
                    {section.type === 'social' && 'Social links'}
                    {section.type === 'footer' && 'Footer'}
                    {section.type === 'ctaBanner' && 'Call to action'}
                    {section.type === 'services' && 'Services'}
                    {section.type === 'process' && 'Process'}
                    {section.type === 'stats' && 'Statistics'}
                    {section.type === 'awards' && 'Awards'}
                    {section.type === 'press' && 'Press & media'}
                    {section.type === 'certifications' && 'Certifications'}
                    {section.type === 'blog' && 'Blog posts'}
                    {section.type === 'faq' && 'FAQ'}
                    {section.type === 'newsletter' && 'Newsletter signup'}
                  </div>
                </div>
              </div>
              <div
                onClick={(e) => handleRemoveSection(section.id, e)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer p-1"
              >
                <Trash2 className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {portfolio.sections.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No sections yet. Add one to get started.
          </div>
        )}
      </div>

      {/* Add Section Button */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onAddSectionClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>
    </div>
  );
}
