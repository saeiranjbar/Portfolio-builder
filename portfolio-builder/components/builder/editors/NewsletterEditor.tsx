'use client';

import React from 'react';
import { NewsletterSection } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '../CollapsibleSection';
import { Mail, Settings } from 'lucide-react';

interface NewsletterEditorProps {
  section: NewsletterSection;
  onUpdate: (updates: Partial<NewsletterSection>) => void;
}

export function NewsletterEditor({ section, onUpdate }: NewsletterEditorProps) {
  return (
    <div className="space-y-4">

      <CollapsibleSection title="Title" icon={Mail} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <div>
          <Label>Title</Label>
          <Input
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Stay Updated"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Subtitle" icon={Mail}
        showToggle
        toggleChecked={section.showSubtitle !== false}
        onToggleChange={(checked) => onUpdate({ showSubtitle: checked })}
      >
        <div>
          <Label>Subtitle</Label>
          <Input
            value={section.subtitle || ''}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="Subscribe to my newsletter for the latest updates"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Form Content" icon={Mail}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Placeholder</Label>
            <Input
              value={section.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <Label>Button Text</Label>
            <Input
              value={section.buttonText}
              onChange={(e) => onUpdate({ buttonText: e.target.value })}
              placeholder="Subscribe"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Email Provider" icon={Settings}>
        <div>
          <Label>Provider</Label>
          <select
            value={section.provider || 'none'}
            onChange={(e) => onUpdate({ provider: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-xl text-sm"
          >
            <option value="none">None (simple form)</option>
            <option value="mailchimp">Mailchimp</option>
            <option value="convertkit">ConvertKit</option>
          </select>
        </div>
        {(section.provider === 'mailchimp' || section.provider === 'convertkit') && (
          <div>
            <Label>Form Action URL</Label>
            <Input
              value={section.providerUrl || ''}
              onChange={(e) => onUpdate({ providerUrl: e.target.value })}
              placeholder="https://..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste the form action URL from your {section.provider === 'mailchimp' ? 'Mailchimp' : 'ConvertKit'} embed code.
            </p>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Background" icon={Settings}>
        <div>
          <Label>Background Type</Label>
          <div className="flex gap-2 mt-2">
            <Button
              variant={section.backgroundType === 'color' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ backgroundType: 'color', backgroundValue: '#3b82f6' })}
            >
              Color
            </Button>
            <Button
              variant={section.backgroundType === 'gradient' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ backgroundType: 'gradient', backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' })}
            >
              Gradient
            </Button>
            <Button
              variant={section.backgroundType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ backgroundType: 'image' })}
            >
              Image
            </Button>
          </div>
        </div>
        {section.backgroundType === 'color' && (
          <div>
            <Label>Background Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={section.backgroundValue}
                onChange={(e) => onUpdate({ backgroundValue: e.target.value })}
                className="w-16 h-9"
              />
              <Input
                value={section.backgroundValue}
                onChange={(e) => onUpdate({ backgroundValue: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        )}
        {section.backgroundType === 'gradient' && (
          <div>
            <Label>Gradient Value</Label>
            <Input
              value={section.backgroundValue}
              onChange={(e) => onUpdate({ backgroundValue: e.target.value })}
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
