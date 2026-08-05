'use client';

import React from 'react';
import { FooterSection } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollapsibleSection } from '../CollapsibleSection';
import { Mail, Phone, MapPin, Type, Settings } from 'lucide-react';

interface FooterEditorProps {
  section: FooterSection;
  onUpdate: (updates: Partial<FooterSection>) => void;
}

export function FooterEditor({ section, onUpdate }: FooterEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Footer Section</h2>
        <p className="text-sm text-gray-500">
          Footer appears at the bottom of your portfolio.
        </p>
      </div>

      {/* Copyright Text */}
      <CollapsibleSection title="Copyright Text" icon={Type} defaultOpen>
        <Input
          value={section.copyrightText}
          onChange={(e) => onUpdate({ copyrightText: e.target.value })}
        />
        <p className="text-xs text-gray-500 mt-1">Use {'{year}'} for auto-updating year</p>
      </CollapsibleSection>

      {/* Contact Info */}
      <CollapsibleSection title="Contact Info" icon={Mail} defaultOpen>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              value={section.contactEmail || ''}
              onChange={(e) => onUpdate({ contactEmail: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input
              value={section.contactPhone || ''}
              onChange={(e) => onUpdate({ contactPhone: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Location</Label>
            <Input
              value={section.contactLocation || ''}
              onChange={(e) => onUpdate({ contactLocation: e.target.value })}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Footer Elements */}
      <CollapsibleSection title="Footer Elements" icon={Settings} defaultOpen>
        <div className="space-y-3">
          {[
            { key: 'showQuickLinks', label: 'Quick Links' },
            { key: 'showSocialIcons', label: 'Social Icons' },
            { key: 'showContactInfo', label: 'Contact Info' },
            { key: 'showBackToTop', label: 'Back to Top Button' },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(section as any)[item.key]}
                onChange={(e) => onUpdate({ [item.key]: e.target.checked } as any)}
                className="rounded border-gray-300"
              />
              {item.label}
            </label>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
