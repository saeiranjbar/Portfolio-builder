'use client';

import React from 'react';
import { TextStyles } from '@/lib/types';
import { TextStyleControls } from './TextStyleControls';
import { CollapsibleSection } from './CollapsibleSection';
import { Type } from 'lucide-react';

interface TextFieldDef {
  key: string;
  label: string;
  defaultColor?: string;
  defaultFontFamily?: string;
}

interface SectionTextStyleEditorProps {
  textStyles: TextStyles | undefined;
  fields: TextFieldDef[];
  onUpdate: (textStyles: TextStyles) => void;
}

/**
 * Unified text style editor for a section.
 * Shows all text fields in one collapsible section instead of
 * scattering TextStyleControls throughout the editor.
 */
export function SectionTextStyleEditor({ textStyles, fields, onUpdate }: SectionTextStyleEditorProps) {
  return (
    <CollapsibleSection
      title="Text Styles"
      icon={Type}
      description="Customize font, color, size, and more for each text element."
    >
      <div className="space-y-2">
        {fields.map((field) => (
          <TextStyleControls
            key={field.key}
            textStyles={textStyles}
            fieldKey={field.key}
            fieldLabel={field.label}
            defaultColor={field.defaultColor}
            defaultFontFamily={field.defaultFontFamily}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </CollapsibleSection>
  );
}
