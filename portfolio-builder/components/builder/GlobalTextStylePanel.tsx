'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { TextStyles, PortfolioSection } from '@/lib/types';
import { TextStyleControls } from './TextStyleControls';
import { CollapsibleSection } from './CollapsibleSection';
import { SECTION_TEXT_FIELDS, SECTION_LABELS } from '@/lib/text-style-fields';
import { Type, ChevronDown } from 'lucide-react';

/**
 * Global Text Style Panel
 *
 * Sits at the top of the editor sidebar. Lets the user pick any category (section)
 * from a dropdown and edit the text styles (font-family, color, size, spacing, etc.)
 * for all text fields belonging to that category.
 *
 * The styles are written directly to the section's `textStyles` property, so the
 * preview updates live.
 */
export function GlobalTextStylePanel() {
  const { portfolio, updateSection } = usePortfolioStore();

  // Build a list of sections that have text style fields defined
  const sectionsWithTextStyles = portfolio.sections.filter(
    (s) => SECTION_TEXT_FIELDS[s.type] && SECTION_TEXT_FIELDS[s.type].length > 0
  );

  // Default to the first available section
  const [selectedSectionId, setSelectedSectionId] = React.useState<string>(
    sectionsWithTextStyles[0]?.id || ''
  );

  // Keep the selected ID valid if sections change
  React.useEffect(() => {
    if (!sectionsWithTextStyles.find((s) => s.id === selectedSectionId)) {
      setSelectedSectionId(sectionsWithTextStyles[0]?.id || '');
    }
  }, [portfolio.sections]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedSection: PortfolioSection | undefined =
    sectionsWithTextStyles.find((s) => s.id === selectedSectionId) || sectionsWithTextStyles[0];

  if (!selectedSection) {
    return null;
  }

  const fields = SECTION_TEXT_FIELDS[selectedSection.type] || [];
  const currentTextStyles: TextStyles = (selectedSection as any).textStyles || {};

  const handleUpdate = (textStyles: TextStyles) => {
    updateSection(selectedSection.id, { textStyles } as any);
  };

  return (
    <CollapsibleSection
      title="Text Styles"
      icon={Type}
      description="Select a category and customize font, color, size, and spacing for its text elements."
      defaultOpen={false}
    >
      <div className="space-y-3">
        {/* Category / Section selector */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Category
          </label>
          <div className="relative">
            <select
              value={selectedSection.id}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="flex h-9 w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            >
              {sectionsWithTextStyles.map((s) => (
                <option key={s.id} value={s.id}>
                  {SECTION_LABELS[s.type] || s.type}
                  {s.type === 'hero' ? '' : ` — ${(s as any).title || ''}`}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Text style controls for the selected section's fields */}
        <div className="space-y-2">
          {fields.map((field) => (
            <TextStyleControls
              key={field.key}
              textStyles={currentTextStyles}
              fieldKey={field.key}
              fieldLabel={field.label}
              defaultColor={field.defaultColor}
              defaultFontFamily={field.defaultFontFamily}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
}
