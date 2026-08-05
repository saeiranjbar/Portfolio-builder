'use client';

import React from 'react';
import { CTABannerSection } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '../CollapsibleSection';
import { Type, FileText, MousePointerClick, Palette } from 'lucide-react';

interface CTABannerEditorProps {
  section: CTABannerSection;
  onUpdate: (updates: Partial<CTABannerSection>) => void;
}

export function CTABannerEditor({ section, onUpdate }: CTABannerEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900">CTA Banner</h2>
        <p className="text-sm text-gray-700">A call-to-action banner to convert visitors before the footer.</p>
      </div>

      {/* Title */}
      <CollapsibleSection title="Title" icon={Type} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input value={section.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Let's Work Together" />
      </CollapsibleSection>

      {/* Subtitle */}
      <CollapsibleSection title="Subtitle" icon={FileText}
        showToggle
        toggleChecked={section.showSubtitle !== false}
        onToggleChange={(checked) => onUpdate({ showSubtitle: checked })}
      >
        <Input value={section.subtitle} onChange={(e) => onUpdate({ subtitle: e.target.value })} placeholder="Have a project in mind?" />
      </CollapsibleSection>

      {/* Button */}
      <CollapsibleSection title="Button" icon={MousePointerClick}
        showToggle
        toggleChecked={section.showButton !== false}
        onToggleChange={(checked) => onUpdate({ showButton: checked })}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Button Text</Label>
            <Input value={section.buttonText} onChange={(e) => onUpdate({ buttonText: e.target.value })} placeholder="Get In Touch" />
          </div>
          <div>
            <Label>Button Link</Label>
            <Input value={section.buttonLink} onChange={(e) => onUpdate({ buttonLink: e.target.value })} placeholder="#contact" />
          </div>
        </div>
      </CollapsibleSection>

      {/* Background */}
      <CollapsibleSection title="Background" icon={Palette}>
        <div className="flex gap-2 mt-2">
          {(['color', 'gradient', 'image'] as const).map((bg) => (
            <Button key={bg} variant={section.backgroundType === bg ? 'default' : 'outline'} size="sm" onClick={() => onUpdate({ backgroundType: bg })}>
              {bg.charAt(0).toUpperCase() + bg.slice(1)}
            </Button>
          ))}
        </div>
        {section.backgroundType === 'color' && (
          <div className="flex gap-2 items-center mt-2">
            <Input type="color" value={section.backgroundValue} onChange={(e) => onUpdate({ backgroundValue: e.target.value })} className="w-16 h-9" />
            <Input value={section.backgroundValue} onChange={(e) => onUpdate({ backgroundValue: e.target.value })} placeholder="#3b82f6" />
          </div>
        )}
        {section.backgroundType === 'gradient' && (
          <Input value={section.backgroundValue} onChange={(e) => onUpdate({ backgroundValue: e.target.value })} placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" className="mt-2" />
        )}
      </CollapsibleSection>
    </div>
  );
}
