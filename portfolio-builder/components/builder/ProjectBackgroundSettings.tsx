'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { HeroSection } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './ImageUploader';
import { VideoFileUploader } from './VideoFileUploader';
import { BackgroundShapesEditor } from './BackgroundShapesEditor';
import { CollapsibleSection } from './CollapsibleSection';
import { Palette, Sparkles } from 'lucide-react';

export function ProjectBackgroundSettings() {
  const { portfolio, updateSection } = usePortfolioStore();

  // Find the hero section — it holds the project-level background settings
  const heroSection = portfolio.sections.find(s => s.type === 'hero') as HeroSection | undefined;
  if (!heroSection) return null;

  const onUpdate = (updates: Partial<HeroSection>) => {
    updateSection(heroSection.id, updates);
  };

  const section = heroSection;
  const isSimpleMode = portfolio.layoutMode === 'simple';

  return (
    <div className="border-b border-gray-200">
      <CollapsibleSection
        title="Project Background Settings"
        icon={Palette}
        description="Applies to the entire landing page"
      >
      <div className="space-y-4">
        {/* Background Type */}
        <div>
          <Label>Background Type</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
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
            <Button
              variant={section.backgroundType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ backgroundType: 'video' })}
            >
              Video
            </Button>
          </div>
        </div>

        {/* Color */}
        {section.backgroundType === 'color' && (
          <div>
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex gap-2 items-center mt-1">
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

        {/* Gradient */}
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

        {/* Image */}
        {section.backgroundType === 'image' && (
          <div>
            <Label>Background Image</Label>
            <ImageUploader
              value={section.backgroundType === 'image' ? section.backgroundValue : ''}
              onChange={(url: string) => onUpdate({ backgroundValue: url })}
            />
          </div>
        )}

        {/* Video */}
        {section.backgroundType === 'video' && (
          <div className="space-y-3">
            <div>
              <Label>Background Video</Label>
              <p className="text-xs text-gray-500 mb-2">
                Upload an MP4/WebM video from your computer, or paste a direct video URL below. The video will loop automatically, muted, in the background.
              </p>
              <VideoFileUploader
                value={section.backgroundValue}
                onChange={(url: string) => onUpdate({ backgroundValue: url })}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Or paste a video URL</Label>
              <Input
                value={section.backgroundValue}
                onChange={(e) => onUpdate({ backgroundValue: e.target.value })}
                placeholder="https://example.com/hero-bg.mp4"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Overlay Opacity: {section.backgroundOverlayOpacity ?? 0}%</Label>
              <Input
                type="range"
                min="0"
                max="80"
                value={section.backgroundOverlayOpacity ?? 0}
                onChange={(e) => onUpdate({ backgroundOverlayOpacity: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Darkens the video so text on top stays readable.
              </p>
            </div>
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

        {/* Background Shapes — nested inside background settings (free-form only) */}
        {!isSimpleMode && (
          <div className="pt-2 border-t">
            <BackgroundShapesEditor
              shapes={section.backgroundShapes}
              onChange={(shapes) => onUpdate({ backgroundShapes: shapes })}
            />
          </div>
        )}
      </div>
      </CollapsibleSection>
    </div>
  );
}
