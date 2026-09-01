'use client';

import React from 'react';
import { SocialSection, SocialLink } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Linkedin, Github, Twitter, Instagram, Facebook, Globe, Type, Link2 } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { SectionTextStyleEditor } from '../SectionTextStyleEditor';
import { CollapsibleSection } from '../CollapsibleSection';


interface SocialEditorProps {
  section: SocialSection;
  onUpdate: (updates: Partial<SocialSection>) => void;
}

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'dribbble', label: 'Dribbble', icon: Globe },
  { value: 'behance', label: 'Behance', icon: Globe },
  { value: 'website', label: 'Website', icon: Globe },
];

export function SocialEditor({ section, onUpdate }: SocialEditorProps) {
  const addLink = () => {
    const newLink: SocialLink = {
      id: generateId(),
      platform: 'linkedin',
      url: '',
    };
    onUpdate({ links: [...section.links, newLink] });
  };

  const updateLink = (id: string, updates: Partial<SocialLink>) => {
    onUpdate({
      links: section.links.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    });
  };

  const removeLink = (id: string) => {
    onUpdate({ links: section.links.filter((l) => l.id !== id) });
  };

  const getPlatformIcon = (platform: string) => {
    const option = platformOptions.find((p) => p.value === platform);
    return option?.icon || Globe;
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
          placeholder="Connect With Me"
        />
      </CollapsibleSection>

      {/* Social Links */}
      <CollapsibleSection title="Social Links" icon={Link2} defaultOpen>
        <div className="flex items-center justify-between">
          <Label>Social Links</Label>
          <Button onClick={addLink} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>

        {section.links.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            <p>No social links yet. Click "Add Link" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {section.links.map((link) => {
              const Icon = getPlatformIcon(link.platform);
              return (
                <Card key={link.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Platform</Label>
                          <select
                            value={link.platform}
                            onChange={(e) =>
                              updateLink(link.id, {
                                platform: e.target.value as SocialLink['platform'],
                              })
                            }
                            className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                          >
                            {platformOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">URL</Label>
                          <Input
                            value={link.url}
                            onChange={(e) =>
                              updateLink(link.id, { url: e.target.value })
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLink(link.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CollapsibleSection>

      {/* Unified Text Styles for all text elements */}
      <SectionTextStyleEditor
        textStyles={section.textStyles}
        fields={[{ key: 'title', label: 'Section Title' }]}
        onUpdate={(textStyles) => onUpdate({ textStyles })}
      />
    </div>
  );
}
