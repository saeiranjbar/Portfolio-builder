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
import { VideoUploader } from '../VideoUploader';
import { CollapsibleSection } from '../CollapsibleSection';
import { Move, User, Briefcase, FileText, AlignLeft, Image as ImageIcon, Images, Type, MousePointerClick, Plus, Trash2, Video as VideoIcon } from 'lucide-react';

import { SectionTextStyleEditor } from '../SectionTextStyleEditor';
import { cn } from '@/lib/utils';






interface HeroEditorProps {
  section: HeroSection;
  onUpdate: (updates: Partial<HeroSection>) => void;
}

export function HeroEditor({ section, onUpdate }: HeroEditorProps) {
  const { portfolio } = usePortfolioStore();
  const isSimpleMode = portfolio.layoutMode === 'simple';

  return (
    <div className="space-y-4">
      {/* Name */}
      <CollapsibleSection
        title="Name"
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
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['primary', 'secondary', 'outline'] as const).map((variant) => (
                    <Button
                      key={variant}
                      variant={btn.variant === variant ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
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
          <div className="space-y-4">
            <p className="text-xs text-gray-500 italic">Drag in preview to reposition</p>

            {/* Shape Controls */}
            <div>
              <Label>Avatar Shape</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(['circle', 'rounded', 'square'] as const).map((shape) => (
                  <Button
                    key={shape}
                    variant={section.avatarShape === shape ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdate({ avatarShape: shape })}
                    className="text-xs"
                  >
                    {shape === 'circle' ? '⭕' : shape === 'rounded' ? '▬' : '□'} {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Size Controls */}
            <div>
              <Label>Avatar Size (pixels)</Label>
              <div className="flex gap-2 items-center mt-2">
                <Input
                  type="number"
                  min="40"
                  max="300"
                  step="10"
                  value={section.avatarWidth || 120}
                  onChange={(e) => {
                    const size = parseInt(e.target.value);
                    onUpdate({ avatarWidth: size, avatarHeight: size });
                  }}
                  placeholder="Size"
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">px</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Width and height scale together</p>
            </div>

            {/* Legacy Size Buttons (Optional) */}
            <div>
              <Label className="text-xs text-gray-600">Quick Presets</Label>
              <div className="flex gap-2 mt-2">
                {(['small', 'medium', 'large'] as const).map((preset) => {
                  const sizeMap = { small: 80, medium: 120, large: 160 };
                  return (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdate({ avatarWidth: sizeMap[preset], avatarHeight: sizeMap[preset] })}
                    >
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Gallery (Images + Videos merged) */}
      <CollapsibleSection
        title="Gallery"
        icon={Images}
        description="Add images and videos to showcase your work or personality"
      >
        {/* Images sub-section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">Images</h3>
          </div>
          <GalleryUploader
            images={section.galleryImages || []}
            onChange={(images) => onUpdate({ galleryImages: images })}
            maxImages={20}
          />

          {/* Gallery Grid Settings */}
          {(section.galleryImages && section.galleryImages.length > 0) && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div>
                <Label htmlFor="gridCols">Image Columns: {section.galleryGridCols || 2}</Label>
                <Input
                  id="gridCols"
                  type="range"
                  min="1"
                  max="4"
                  value={section.galleryGridCols || 2}
                  onChange={(e) => onUpdate({ galleryGridCols: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-gray-200" />

        {/* Videos sub-section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <VideoIcon className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">Videos</h3>
          </div>
          <VideoUploader
            videos={section.galleryVideos || []}
            onChange={(videos) => onUpdate({ galleryVideos: videos })}
            maxVideos={10}
          />

          {/* Video Grid Settings */}
          {(section.galleryVideos && section.galleryVideos.length > 0) && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div>
                <Label htmlFor="vidGridCols">Video Columns: {section.galleryVideoGridCols || 1}</Label>
                <Input
                  id="vidGridCols"
                  type="range"
                  min="1"
                  max="3"
                  value={section.galleryVideoGridCols || 1}
                  onChange={(e) => onUpdate({ galleryVideoGridCols: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Unified Text Styles for all text elements */}
      <SectionTextStyleEditor
        textStyles={section.textStyles}
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'title', label: 'Title' },
          { key: 'subtitle', label: 'Subtitle' },
          { key: 'bio', label: 'Bio' },
        ]}
        onUpdate={(textStyles) => onUpdate({ textStyles })}
      />
    </div>
  );
}

// Element Order Controls — lets users reorder elements within the Hero section
// by swapping their Y positions (up/down)
function ElementOrderControls({ section, onUpdate }: { section: HeroSection; onUpdate: (updates: Partial<HeroSection>) => void }) {
  const [draggedKey, setDraggedKey] = React.useState<string | null>(null);

  // Define the elements that can be reordered, with their position keys and labels
  const elements = [
    { key: 'avatar', label: 'Avatar', posKey: 'avatarPosition' as const, visible: section.showAvatar !== false && !!section.avatar },
    { key: 'name', label: 'Name', posKey: 'namePosition' as const, visible: section.showName !== false },
    { key: 'title', label: 'Title', posKey: 'titlePosition' as const, visible: section.showTitle !== false },
    { key: 'subtitle', label: 'Subtitle', posKey: 'subtitlePosition' as const, visible: section.showSubtitle !== false },
    { key: 'bio', label: 'Bio', posKey: 'bioPosition' as const, visible: section.showBio !== false },
    { key: 'ctaButtons', label: 'CTA Buttons', posKey: 'ctaButtonsPosition' as const, visible: (section.ctaButtons || []).length > 0 },
    { key: 'galleryImages', label: 'Photo Grid', posKey: 'galleryImagesPosition' as const, visible: (section.galleryImages || []).length > 0 },
  ].filter(e => e.visible);

  // Sort by current Y position to show the visual order
  // Elements without a saved position are treated as being at the bottom (y = 999)
  const sortedElements = [...elements].sort((a, b) => {
    const posA = section[a.posKey];
    const posB = section[b.posKey];
    const yA = posA?.y ?? 999;
    const yB = posB?.y ?? 999;
    return yA - yB;
  });

  const swapPositions = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    // Get all current Y positions (use defaults for elements without saved positions)
    const positions = sortedElements.map((elem, i) => {
      const pos = section[elem.posKey];
      return pos || { x: 50, y: (i + 1) * 10 };
    });

    // Extract the dragged element and its position
    const [draggedElem] = sortedElements.slice(fromIndex, fromIndex + 1);
    const [draggedPos] = positions.slice(fromIndex, fromIndex + 1);

    // Remove the dragged element from both arrays
    const remainingElements = sortedElements.filter((_, i) => i !== fromIndex);
    const remainingPositions = positions.filter((_, i) => i !== fromIndex);

    // Insert the dragged element at the target position
    const newElements = [
      ...remainingElements.slice(0, toIndex),
      draggedElem,
      ...remainingElements.slice(toIndex),
    ];
    const newPositions = [
      ...remainingPositions.slice(0, toIndex),
      draggedPos,
      ...remainingPositions.slice(toIndex),
    ];

    // Now reassign Y positions based on the new order
    // Use evenly spaced Y values to maintain the visual order
    const updates: Partial<HeroSection> = {};
    const ySpacing = 10; // 10% spacing between elements
    const yStart = 8; // Start at 8% from top

    newElements.forEach((elem, i) => {
      const oldPos = newPositions[i];
      updates[elem.posKey] = { x: oldPos.x, y: yStart + i * ySpacing } as any;
    });

    onUpdate(updates);
  };

  return (
    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Element Order</h3>
      <p className="text-xs text-gray-500 mb-3">Drag a handle and drop it on another element.</p><div className="space-y-1">{sortedElements.map((elem, index) => <div key={elem.key} draggable onDragStart={() => setDraggedKey(elem.key)} onDragOver={(event) => event.preventDefault()} onDrop={() => { const sourceIndex = sortedElements.findIndex((item) => item.key === draggedKey); if (sourceIndex >= 0 && sourceIndex !== index) swapPositions(sourceIndex, index); setDraggedKey(null); }} className={cn("flex items-center gap-2 p-2 bg-white rounded border border-gray-200 cursor-grab", draggedKey === elem.key && "opacity-50")}><Move className="w-4 h-4 text-gray-400" /><span className="text-xs text-gray-400 w-4">{index + 1}</span><span className="text-sm text-gray-700 flex-1">{elem.label}</span></div>)}</div></div>
  );
}