'use client';

import React from 'react';
import { ContactSection, SocialLink } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '../CollapsibleSection';
import { Type, Mail, Phone, MapPin, FormInput, Calendar, Plus, Trash2, Link as LinkIcon, Check } from 'lucide-react';
import { SectionTextStyleEditor } from '../SectionTextStyleEditor';
import { generateId } from '@/lib/utils';

interface ContactEditorProps {
  section: ContactSection;
  onUpdate: (updates: Partial<ContactSection>) => void;
}

const platformOptions: { value: SocialLink['platform']; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'behance', label: 'Behance' },
  { value: 'website', label: 'Website' },
];

export function ContactEditor({ section, onUpdate }: ContactEditorProps) {
  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: generateId(),
      platform: 'linkedin',
      url: '',
    };
    onUpdate({ socialLinks: [...(section.socialLinks || []), newLink] });
  };

  const updateSocialLink = (id: string, updates: Partial<SocialLink>) => {
    onUpdate({
      socialLinks: (section.socialLinks || []).map((link) =>
        link.id === id ? { ...link, ...updates } : link
      ),
    });
  };

  const removeSocialLink = (id: string) => {
    onUpdate({
      socialLinks: (section.socialLinks || []).filter((link) => link.id !== id),
    });
  };
  return (
    <div className="space-y-4">

      {/* Section Title */}
      <CollapsibleSection title="Section Title" icon={Type} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Get In Touch"
        />
      </CollapsibleSection>

      {/* Email */}
      <CollapsibleSection title="Email Address" icon={Mail}
        showToggle
        toggleChecked={section.showEmail !== false}
        onToggleChange={(checked) => onUpdate({ showEmail: checked })}
      >
        <Input
          type="email"
          value={section.email}
          onChange={(e) => onUpdate({ email: e.target.value })}
          placeholder="your@email.com"
        />
      </CollapsibleSection>

      {/* Phone */}
      <CollapsibleSection title="Phone Number" icon={Phone}
        showToggle
        toggleChecked={section.showPhone !== false}
        onToggleChange={(checked) => onUpdate({ showPhone: checked })}
      >
        <Input
          type="tel"
          value={section.phone || ''}
          onChange={(e) => onUpdate({ phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
        />
      </CollapsibleSection>

      {/* Location */}
      <CollapsibleSection title="Location" icon={MapPin}
        showToggle
        toggleChecked={section.showLocation !== false}
        onToggleChange={(checked) => onUpdate({ showLocation: checked })}
      >
        <Input
          value={section.location || ''}
          onChange={(e) => onUpdate({ location: e.target.value })}
          placeholder="City, Country"
        />
      </CollapsibleSection>

      {/* Contact Form */}
      <CollapsibleSection title="Contact Form" icon={FormInput}
        showToggle
        toggleChecked={section.showForm !== false}
        onToggleChange={(checked) => onUpdate({ showForm: checked })}
      >
        <div className="flex gap-2">
          <Button
            variant={section.showForm ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUpdate({ showForm: true })}
          >
            Show Form
          </Button>
          <Button
            variant={!section.showForm ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUpdate({ showForm: false })}
          >
            Hide Form
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          When enabled, visitors can send you messages directly from your portfolio.
        </p>
      </CollapsibleSection>

      {/* Calendly */}
      <CollapsibleSection title="Calendly / Booking" icon={Calendar}
        showToggle
        toggleChecked={section.showCalendly !== false}
        onToggleChange={(checked) => onUpdate({ showCalendly: checked })}
      >
        <div>
          <Label>Calendly URL</Label>
          <Input
            value={section.calendlyUrl || ''}
            onChange={(e) => onUpdate({ calendlyUrl: e.target.value })}
            placeholder="https://calendly.com/your-username"
          />
        </div>
        <p className="text-xs text-gray-500">
          Add a Calendly scheduling link so visitors can book a call with you.
        </p>
      </CollapsibleSection>

      {/* Social Links in Contact */}
      <CollapsibleSection title="Social Links" icon={LinkIcon} defaultOpen
        showToggle
        toggleChecked={section.showSocialLinks !== false}
        onToggleChange={(checked) => onUpdate({ showSocialLinks: checked })}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Social Links</Label>
            <Button onClick={addSocialLink} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>

          {(section.socialLinks || []).length === 0 ? (
            <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
              <p>No social links yet. Click "Add Link" to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(section.socialLinks || []).map((link) => (
                <Card key={link.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(link.id, { platform: e.target.value as SocialLink['platform'] })}
                        className="text-sm border rounded px-2 py-1.5 bg-white"
                      >
                        {platformOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <Input
                        value={link.url}
                        onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 h-8 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialLink(link.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Add social media links that will appear in the contact section.
        </p>
      </CollapsibleSection>

      {/* Unified Text Styles for all text elements */}
      <SectionTextStyleEditor
        textStyles={section.textStyles}
        fields={[
          { key: 'title', label: 'Section Title' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'location', label: 'Location' },
        ]}
        onUpdate={(textStyles) => onUpdate({ textStyles })}
      />
    </div>
  );
}
