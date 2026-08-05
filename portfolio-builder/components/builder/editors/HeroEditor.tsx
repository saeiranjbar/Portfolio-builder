'use client';

import React from 'react';
import { HeroSection } from '@/lib/types';
import { usePortfolioStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '../ImageUploader';
import { GalleryUploader } from '../GalleryUploader';
import { TextStyleControls } from '../TextStyleControls';
import { CollapsibleSection } from '../CollapsibleSection';
import { Move, User, Briefcase, FileText, AlignLeft, Image as ImageIcon, Palette, Magnet, Images, Type, Sparkles, MousePointerClick, Plus, Trash2 } from 'lucide-react';

import { FreeFormControls } from '../FreeFormControls';






interface HeroEditorProps {
  section: HeroSection;
  onUpdate: (updates: Partial<HeroSection>) => void;
}

export function HeroEditor({ section, onUpdate }: HeroEditorProps) {
  const { portfolio } = usePortfolioStore();
  const isSimpleMode = portfolio.layoutMode === 'simple';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Hero Section</h2>
        <p className="text-sm text-gray-500 mb-2">
          {isSimpleMode ? 'Elements are centered in a clean, structured layout.' : 'Drag elements in the preview to reposition them freely.'}
        </p>
      </div>

      {/* Free-Form Layout Controls - Only show in website mode */}
      {!isSimpleMode && (
        <FreeFormControls
          freeFormEnabled={section.freeFormEnabled !== false}
          snapEnabled={section.snapEnabled !== false}
          onUpdate={(updates) => onUpdate(updates)}
        />
      )}



      {/* Your Name */}
      <CollapsibleSection
        title="Your Name"
        icon={User}
        defaultOpen
        showToggle
        toggleChecked={section.showName}
        onToggleChange={(checked) => onUpdate({ showName: checked })}
      >
        <Input
          value={section.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="John Doe"
        />
        {section.showName && !isSimpleMode && (
          <p className="text-xs text-gray-500 italic">Drag in preview to reposition</p>
        )}
        <TextStyleControls
          textStyles={section.textStyles}
          fieldKey="name"
          fieldLabel="Name"
          onUpdate={(textStyles) => onUpdate({ textStyles })}
        />
      </CollapsibleSection>

      {/* Professional Title */}
      <CollapsibleSection
        title="Professional Title"
        icon={Briefcase}
        showToggle
        toggleChecked={section.showTitle}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Graphic Designer"
        />
        {section.showTitle && !isSimpleMode && (
          <p className="text-xs text-gray-500 italic">Drag in preview to reposition</p>
        )}
        <TextStyleControls
          textStyles={section.textStyles}
          fieldKey="title"
          fieldLabel="Title"
          onUpdate={(textStyles) => onUpdate({ textStyles })}
        />
      </CollapsibleSection>

      {/* Typing Animation */}
      <CollapsibleSection
        title="Typing Animation (Title Rotation)"
        icon={Type}
        description="Add rotating words that type and delete in the title position (e.g., Designer / Developer / Creator)"
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Enter words separated by commas. When set, these will animate in the title position instead of the static title.
          </p>
          <Input
            value={(section.typingWords || []).join(', ')}
            onChange={(e) => {
              const words = e.target.value.split(',').map(w => w.trim()).filter(Boolean);
              onUpdate({ typingWords: words });
            }}
            placeholder="Designer, Developer, Creator"
          />
          {(section.typingWords || []).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate({ typingWords: [] })}
            >
              Clear typing animation
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Subtitle */}
      <CollapsibleSection
        title="Subtitle"
        icon={FileText}
        showToggle
        toggleChecked={section.showSubtitle}
        onToggleChange={(checked) => onUpdate({ showSubtitle: checked })}
      >
        <Input
          value={section.subtitle}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          placeholder="Creating Visual Stories"
        />
        {section.showSubtitle && !isSimpleMode && (
          <p className="text-xs text-gray-500 italic">Drag in preview to reposition</p>
        )}
        <TextStyleControls
          textStyles={section.textStyles}
          fieldKey="subtitle"
          fieldLabel="Subtitle"
          onUpdate={(textStyles) => onUpdate({ textStyles })}
        />
      </CollapsibleSection>

      {/* Bio */}
      <CollapsibleSection
        title="Bio"
        icon={AlignLeft}
        showToggle
        toggleChecked={section.showBio}
        onToggleChange={(checked) => onUpdate({ showBio: checked })}
      >
        <Textarea
          value={section.bio}
          onChange={(e) => onUpdate({ bio: e.target.value })}
          placeholder="Write a brief introduction about yourself..."
          rows={4}
        />
        {section.showBio && !isSimpleMode && (
          <p className="text-xs text-gray-500 italic">Drag in preview to reposition</p>
        )}
        <TextStyleControls
          textStyles={section.textStyles}
          fieldKey="bio"
          fieldLabel="Bio"
          onUpdate={(textStyles) => onUpdate({ textStyles })}
        />
      </CollapsibleSection>

      {/* CTA Buttons */}
      <CollapsibleSection
        title="CTA Buttons"
        icon={MousePointerClick}
        description="Edit the call-to-action buttons in your hero section (e.g., 'The Studio', 'Contact', etc.)"
      >
        <div className="space-y-4">
          {(section.ctaButtons || []).length === 0 && (
            <p className="text-xs text-gray-500 italic">No CTA buttons yet. Add one below.</p>
          )}
          {(section.ctaButtons || []).map((btn, index) => (
            <div key={btn.id} className="space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Button {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  onClick={() => {
                    const updated = (section.ctaButtons || []).filter((b) => b.id !== btn.id);
                    onUpdate({ ctaButtons: updated });
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div>
                <Label className="text-xs">Button Text</Label>
                <Input
                  value={btn.label}
                  onChange={(e) => {
                    const updated = (section.ctaButtons || []).map((b) =>
                      b.id === btn.id ? { ...b, label: e.target.value } : b
                    );
                    onUpdate({ ctaButtons: updated });
                  }}
                  placeholder="The Studio"
                />
              </div>
              <div>
                <Label className="text-xs">Link / URL</Label>
                <Input
                  value={btn.link}
                  onChange={(e) => {
                    const updated = (section.ctaButtons || []).map((b) =>
                      b.id === btn.id ? { ...b, link: e.target.value } : b
                    );
                    onUpdate({ ctaButtons: updated });
                  }}
                  placeholder="#about or https://example.com"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Use #section-name to scroll to a section, or a full URL for external links.
                </p>
              </div>
              <div>
                <Label className="text-xs">Style</Label>
                <div className="flex gap-2 mt-1">
                  {(['primary', 'secondary', 'outline'] as const).map((variant) => (
                    <Button
                      key={variant}
                      variant={btn.variant === variant ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const updated = (section.ctaButtons || []).map((b) =>
                          b.id === btn.id ? { ...b, variant } : b
                        );
                        onUpdate({ ctaButtons: updated });
                      }}
                    >
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const newBtn = {
                id: `cta-${Date.now()}`,
                label: 'New Button',
                link: '#',
                variant: 'primary' as const,
              };
              onUpdate({ ctaButtons: [...(section.ctaButtons || []), newBtn] });
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Add CTA Button
          </Button>
          {!isSimpleMode && (section.ctaButtons || []).length > 0 && (
            <p className="text-xs text-gray-500 italic">Drag the button group in preview to reposition</p>
          )}
        </div>
      </CollapsibleSection>

      {/* Profile Image (Avatar) */}
      <CollapsibleSection
        title="Profile Image (Avatar)"

        icon={ImageIcon}
        description="This is your profile photo that appears in the hero section"
        showToggle
        toggleChecked={section.showAvatar}
        onToggleChange={(checked) => onUpdate({ showAvatar: checked })}
      >
        <ImageUploader
          value={section.avatar}
          onChange={(url: string) => onUpdate({ avatar: url })}
        />
        {section.showAvatar && !isSimpleMode && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 italic">Drag in preview to reposition</p>
            <div>
              <Label>Avatar Size</Label>
              <div className="flex gap-2 mt-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={section.avatarSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdate({ avatarSize: size })}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Gallery Images */}
      <CollapsibleSection
        title="Gallery Images"
        icon={Images}
        description="Add multiple images to showcase your work or personality"
      >
        <GalleryUploader
          images={section.galleryImages || []}
          onChange={(images) => onUpdate({ galleryImages: images })}
          maxImages={20}
        />
      </CollapsibleSection>

      {/* Background Settings */}
      <CollapsibleSection
        title="Background Settings"
        icon={Palette}
      >

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
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="bgColor"
                type="color"
                value={section.backgroundValue}
                onChange={(e) => onUpdate({ backgroundValue: e.target.value })}
                className="w-16 h-9"
              />
              <Input
                value={section.backgroundValue}
                onChange={(e) => onUpdate({ backgroundValue: e.target.value })}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
        )}

        {section.backgroundType === 'gradient' && (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Gradient Colors</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-xs text-gray-600 mb-1 block">Start Color</Label>
                  <div 
                    className="w-full h-10 rounded border border-gray-300 cursor-pointer overflow-hidden"
                    style={{ backgroundColor: section.backgroundValue.match(/#[a-fA-F0-9]{6}/)?.[0] || '#667eea' }}
                  >
                    <Input
                      type="color"
                      value={section.backgroundValue.match(/#[a-fA-F0-9]{6}/)?.[0] || '#667eea'}
                      onChange={(e) => {
                        const endColor = section.backgroundValue.match(/#[a-fA-F0-9]{6}/g)?.[1] || '#764ba2';
                        onUpdate({ backgroundValue: `linear-gradient(135deg, ${e.target.value} 0%, ${endColor} 100%)` });
                      }}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-600 mb-1 block">End Color</Label>
                  <div 
                    className="w-full h-10 rounded border border-gray-300 cursor-pointer overflow-hidden"
                    style={{ backgroundColor: section.backgroundValue.match(/#[a-fA-F0-9]{6}/g)?.[1] || '#764ba2' }}
                  >
                    <Input
                      type="color"
                      value={section.backgroundValue.match(/#[a-fA-F0-9]{6}/g)?.[1] || '#764ba2'}
                      onChange={(e) => {
                        const startColor = section.backgroundValue.match(/#[a-fA-F0-9]{6}/)?.[0] || '#667eea';
                        onUpdate({ backgroundValue: `linear-gradient(135deg, ${startColor} 0%, ${e.target.value} 100%)` });
                      }}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Preset Gradients</Label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Purple' },
                  { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Pink' },
                  { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Blue' },
                  { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Green' },
                  { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Sunset' },
                  { gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', name: 'Lavender' },
                  { gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', name: 'Rose' },
                  { gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', name: 'Peach' },
                ].map((item) => (
                  <button
                    key={item.name}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-all hover:scale-110"
                    style={{ background: item.gradient }}
                    onClick={() => onUpdate({ backgroundValue: item.gradient })}
                    title={item.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {section.backgroundType === 'image' && (
          <div>
            <Label>Background Image</Label>
            <ImageUploader
              value={section.backgroundType === 'image' ? section.backgroundValue : ''}
              onChange={(url: string) => onUpdate({ backgroundValue: url })}
            />
          </div>
        )}

        {/* Parallax toggle for image/gradient backgrounds */}
        <div className="pt-2 border-t">
          <Label>Parallax Effect</Label>
          <div className="flex gap-2 mt-2">
            <Button
              variant={section.parallaxEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ parallaxEnabled: true })}
            >
              <Sparkles className="w-3.5 h-3.5" /> Enabled
            </Button>
            <Button
              variant={!section.parallaxEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ parallaxEnabled: false })}
            >
              Disabled
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Adds a subtle parallax scrolling effect to the hero background for depth.
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
}
