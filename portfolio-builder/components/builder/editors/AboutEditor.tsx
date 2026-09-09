'use client';

import React from 'react';
import { AboutSection, AboutQuickFact, AboutLanguage } from '@/lib/types';
import { usePortfolioStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '../ImageUploader';
import { GalleryUploader } from '../GalleryUploader';
import { CollapsibleSection } from '../CollapsibleSection';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MapPin, Download, Video, Languages, Quote, Sparkles, Tag, FileText, Image as ImageIcon, Type, Images, Upload } from 'lucide-react';
import { SectionTextStyleEditor } from '../SectionTextStyleEditor';
import { imageToBase64 } from '@/lib/utils';




interface AboutEditorProps {
  section: AboutSection;
  onUpdate: (updates: Partial<AboutSection>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export function AboutEditor({ section, onUpdate }: AboutEditorProps) {
  const { portfolio } = usePortfolioStore();
  const isSimpleMode = portfolio.layoutMode === 'simple';

  // Quick facts helpers
  const addQuickFact = () => {
    const newFact: AboutQuickFact = { id: generateId(), label: 'New Fact', value: '0+' };
    onUpdate({ quickFacts: [...(section.quickFacts || []), newFact] });
  };
  const updateQuickFact = (id: string, updates: Partial<AboutQuickFact>) => {
    onUpdate({ quickFacts: (section.quickFacts || []).map(f => f.id === id ? { ...f, ...updates } : f) });
  };
  const removeQuickFact = (id: string) => {
    onUpdate({ quickFacts: (section.quickFacts || []).filter(f => f.id !== id) });
  };

  // Tool tags helpers
  const [toolTagInput, setToolTagInput] = React.useState('');
  const addToolTag = () => {
    const tag = toolTagInput.trim();
    if (tag && !(section.toolTags || []).includes(tag)) {
      onUpdate({ toolTags: [...(section.toolTags || []), tag] });
      setToolTagInput('');
    }
  };
  const removeToolTag = (tag: string) => {
    onUpdate({ toolTags: (section.toolTags || []).filter(t => t !== tag) });
  };

  // Languages helpers
  const addLanguage = () => {
    const newLang: AboutLanguage = { id: generateId(), language: 'New Language', proficiency: 'Fluent' };
    onUpdate({ languages: [...(section.languages || []), newLang] });
  };
  const updateLanguage = (id: string, updates: Partial<AboutLanguage>) => {
    onUpdate({ languages: (section.languages || []).map(l => l.id === id ? { ...l, ...updates } : l) });
  };
  const removeLanguage = (id: string) => {
    onUpdate({ languages: (section.languages || []).filter(l => l.id !== id) });
  };

  return (
    <div className="space-y-4">

   

      {/* Background Shapes (free-form only) */}
      {!isSimpleMode && (
        <BackgroundShapesEditor
          shapes={section.backgroundShapes}
          onChange={(shapes) => onUpdate({ backgroundShapes: shapes })}
        />
      )}

      {/* Section Title */}
      <CollapsibleSection title="Section Title" icon={Type} defaultOpen

        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="About Me"
        />
      </CollapsibleSection>

      {/* Tagline */}
      <CollapsibleSection title="Tagline / One-Liner" icon={FileText}
        showToggle
        toggleChecked={section.showTagline !== false}
        onToggleChange={(checked) => onUpdate({ showTagline: checked })}
      >
        <Input
          value={section.tagline || ''}
          onChange={(e) => onUpdate({ tagline: e.target.value })}
          placeholder="Designer who bridges the gap between strategy and craft"
        />
        <p className="text-xs text-gray-400">A punchy summary that appears below the title</p>
      </CollapsibleSection>

      {/* Main Bio */}
      <CollapsibleSection title="Main Bio" icon={FileText}
        showToggle
        toggleChecked={section.showBio !== false}
        onToggleChange={(checked) => onUpdate({ showBio: checked })}
      >
        <Textarea
          value={section.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Tell your story here..."
          rows={6}
        />
      </CollapsibleSection>

      {/* Personal Quote */}
      <CollapsibleSection title="Personal Quote" icon={Quote}
        showToggle
        toggleChecked={section.showPersonalQuote !== false}
        onToggleChange={(checked) => onUpdate({ showPersonalQuote: checked })}
      >
        <Textarea
          value={section.personalQuote || ''}
          onChange={(e) => onUpdate({ personalQuote: e.target.value })}
          placeholder='"Design is not just what it looks like and feels like. Design is how it works."'
          rows={2}
        />
        <p className="text-xs text-gray-400">A large styled pull-quote that stands out visually</p>
      </CollapsibleSection>

      {/* Image Settings */}
      <CollapsibleSection title="Image Settings" icon={ImageIcon}
        showToggle
        toggleChecked={section.showImage !== false}
        onToggleChange={(checked) => onUpdate({ showImage: checked })}
      >
        <div>
          <Label>Portrait Image</Label>
          <ImageUploader
            value={section.imageUrl || ''}
            onChange={(url) => onUpdate({ imageUrl: url })}
          />
        </div>
        <div>
          <Label>Second Image (Optional - workspace, etc.)</Label>
          <ImageUploader
            value={section.secondImageUrl || ''}
            onChange={(url) => onUpdate({ secondImageUrl: url })}
          />
        </div>
        {/* Custom image dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Portrait Image Width (px)</Label>
            <Input
              type="number"
              value={section.imageWidth || 896}
              onChange={(e) => onUpdate({ imageWidth: parseInt(e.target.value) || 896 })}
              min={100}
              max={2000}
              step={10}
            />
          </div>
          <div>
            <Label>Portrait Image Height (px)</Label>
            <Input
              type="number"
              value={section.imageHeight || 300}
              onChange={(e) => onUpdate({ imageHeight: parseInt(e.target.value) || 300 })}
              min={50}
              max={2000}
              step={10}
            />
          </div>
          <div>
            <Label>Second Image Width (px)</Label>
            <Input
              type="number"
              value={section.secondImageWidth || 300}
              onChange={(e) => onUpdate({ secondImageWidth: parseInt(e.target.value) || 300 })}
              min={50}
              max={2000}
              step={10}
            />
          </div>
          <div>
            <Label>Second Image Height (px)</Label>
            <Input
              type="number"
              value={section.secondImageHeight || 200}
              onChange={(e) => onUpdate({ secondImageHeight: parseInt(e.target.value) || 200 })}
              min={50}
              max={2000}
              step={10}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Image Layout</Label>
            <select
              value={section.imageLayout || 'left'}
              onChange={(e) => onUpdate({ imageLayout: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-xl text-sm"
            >
              <option value="left">Image Left</option>
              <option value="right">Image Right</option>
              <option value="top">Image Top</option>
              <option value="fullwidth">Full Width</option>
              <option value="none">No Image</option>
            </select>
          </div>
          <div>
            <Label>Image Shape</Label>
            <select
              value={section.imageShape || 'rounded'}
              onChange={(e) => onUpdate({ imageShape: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-xl text-sm"
            >
              <option value="rounded">Rounded</option>
              <option value="circle">Circle</option>
              <option value="square">Square</option>
            </select>
          </div>
          <div>
            <Label>Image Size</Label>
            <select
              value={section.imageSize || 'medium'}
              onChange={(e) => onUpdate({ imageSize: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-xl text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div className="flex items-end gap-4 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={section.imageBorder || false}
                onChange={(e) => onUpdate({ imageBorder: e.target.checked })}
              />
              Border
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={section.imageShadow !== false}
                onChange={(e) => onUpdate({ imageShadow: e.target.checked })}
              />
              Shadow
            </label>
          </div>
        </div>
      </CollapsibleSection>

      {/* Quick Facts / Stats */}
      <CollapsibleSection title="Quick Facts / Stats" icon={Sparkles} description="Key numbers that give instant credibility (e.g., 5+ years, 50+ projects)"
        showToggle
        toggleChecked={section.showQuickFacts !== false}
        onToggleChange={(checked) => onUpdate({ showQuickFacts: checked })}
      >
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={addQuickFact}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        {(section.quickFacts || []).map((fact) => (
          <div key={fact.id} className="flex items-center gap-2">
            <Input
              value={fact.value}
              onChange={(e) => updateQuickFact(fact.id, { value: e.target.value })}
              placeholder="5+"
              className="w-20"
            />
            <Input
              value={fact.label}
              onChange={(e) => updateQuickFact(fact.id, { label: e.target.value })}
              placeholder="Years Experience"
              className="flex-1"
            />
            <button
              onClick={() => removeQuickFact(fact.id)}
              className="p-2 text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </CollapsibleSection>

      {/* Tool Tags */}
      <CollapsibleSection title="Tool / Skill Tags" icon={Tag} description="Inline pill tags for tools you use (e.g., Figma, Photoshop, Illustrator)"
        showToggle
        toggleChecked={section.showToolTags !== false}
        onToggleChange={(checked) => onUpdate({ showToolTags: checked })}
      >
        <div className="flex gap-2">
          <Input
            value={toolTagInput}
            onChange={(e) => setToolTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToolTag(); } }}
            placeholder="Add a tool..."
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={addToolTag}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        {(section.toolTags || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(section.toolTags || []).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {tag}
                <button onClick={() => removeToolTag(tag)} className="text-gray-400 hover:text-red-500">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Location & Availability */}
      <CollapsibleSection title="Location & Availability" icon={MapPin}
        showToggle
        toggleChecked={section.showLocation !== false}
        onToggleChange={(checked) => onUpdate({ showLocation: checked })}
      >
        <div>
          <Label>Location</Label>
          <Input
            value={section.location || ''}
            onChange={(e) => onUpdate({ location: e.target.value })}
            placeholder="San Francisco, CA"
          />
        </div>
        <div>
          <Label>Availability Status</Label>
          <Input
            value={section.availabilityStatus || ''}
            onChange={(e) => onUpdate({ availabilityStatus: e.target.value })}
            placeholder="Available for freelance"
          />
        </div>
      </CollapsibleSection>

      {/* CTA Button */}
      <CollapsibleSection title="Call-to-Action Button" icon={FileText}
        showToggle
        toggleChecked={section.showCTA !== false}
        onToggleChange={(checked) => onUpdate({ showCTA: checked })}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Button Text</Label>
            <Input
              value={section.ctaButtonText || ''}
              onChange={(e) => onUpdate({ ctaButtonText: e.target.value })}
              placeholder="Let's Work Together"
            />
          </div>
          <div>
            <Label>Button Link</Label>
            <Input
              value={section.ctaButtonLink || ''}
              onChange={(e) => onUpdate({ ctaButtonLink: e.target.value })}
              placeholder="#contact"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Resume / CV */}
      <CollapsibleSection title="Resume / CV" icon={Download}
        showToggle
        toggleChecked={section.showResume !== false}
        onToggleChange={(checked) => onUpdate({ showResume: checked })}
      >
        <div>
          <Label>Resume URL (PDF link)</Label>
          <div className="flex gap-2">
            <Input
              value={section.resumeUrl || ''}
              onChange={(e) => onUpdate({ resumeUrl: e.target.value })}
              placeholder="https://example.com/resume.pdf"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('resume-file-upload')?.click()}
            >
              <Upload className="w-3 h-3 mr-1" /> Upload
            </Button>
            <input
              id="resume-file-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const base64 = await imageToBase64(file);
                  onUpdate({ resumeUrl: base64 });
                }
                e.target.value = '';
              }}
            />
          </div>
          {section.resumeUrl && section.resumeUrl.startsWith('data:') && (
            <p className="text-xs text-green-600 mt-1">✓ Resume uploaded from file</p>
          )}
        </div>
        <div>
          <Label>Display Mode</Label>
          <select
            value={section.resumeDisplayMode || 'embed'}
            onChange={(e) => onUpdate({ resumeDisplayMode: e.target.value as 'embed' | 'download' })}
            className="w-full px-3 py-2 border rounded-xl text-sm"
          >
            <option value="embed">Embed (view PDF in page)</option>
            <option value="download">Download Button</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {section.resumeDisplayMode === 'download'
              ? 'Shows a download button that links to the resume file'
              : 'Embeds the PDF directly in the page so visitors can read it without leaving'}
          </p>
        </div>
        {(section.resumeDisplayMode || 'embed') === 'embed' && (
          <div>
            <Label>Viewer Height (px)</Label>
            <Input
              type="number"
              value={section.resumeHeight || 600}
              onChange={(e) => onUpdate({ resumeHeight: parseInt(e.target.value) || 600 })}
              placeholder="600"
              min={300}
              max={2000}
              step={50}
            />
            <p className="text-xs text-gray-400 mt-1">Height of the embedded PDF viewer in pixels</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Video Introduction */}
      <CollapsibleSection title="Video Introduction" icon={Video}
        showToggle
        toggleChecked={section.showVideo !== false}
        onToggleChange={(checked) => onUpdate({ showVideo: checked })}
      >
        <div>
          <Label>Video URL</Label>
          <Input
            value={section.videoUrl || ''}
            onChange={(e) => {
              const url = e.target.value;
              // Auto-detect video type from URL
              const isVimeo = url.includes('vimeo.com');
              const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
              const detectedType = isVimeo ? 'vimeo' : isYouTube ? 'youtube' : section.videoType || 'youtube';
              onUpdate({ videoUrl: url, videoType: detectedType as any });
            }}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Paste a YouTube or Vimeo URL. The type is auto-detected.
          </p>
        </div>
        <div>
          <Label>Video Type</Label>
          <select
            value={section.videoType || 'youtube'}
            onChange={(e) => onUpdate({ videoType: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-xl text-sm"
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
          </select>
        </div>
        {/* Live preview */}
        {section.videoUrl && (
          <div className="mt-2">
            <Label>Preview</Label>
            <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden aspect-video">
              {(() => {
                const url = section.videoUrl.trim();
                let embedUrl = '';
                if ((section.videoType || 'youtube') === 'vimeo') {
                  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
                  embedUrl = vimeoMatch
                    ? `https://player.vimeo.com/video/${vimeoMatch[1]}`
                    : url;
                } else {
                  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
                  if (shortMatch) {
                    embedUrl = `https://www.youtube.com/embed/${shortMatch[1]}`;
                  } else {
                    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                    if (watchMatch) {
                      embedUrl = `https://www.youtube.com/embed/${watchMatch[1]}`;
                    } else if (url.includes('/embed/')) {
                      embedUrl = url;
                    } else if (url.includes('/shorts/')) {
                      const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
                      if (shortsMatch) embedUrl = `https://www.youtube.com/embed/${shortsMatch[1]}`;
                    } else if (url.includes('/live/')) {
                      const liveMatch = url.match(/\/live\/([a-zA-Z0-9_-]+)/);
                      if (liveMatch) embedUrl = `https://www.youtube.com/embed/${liveMatch[1]}`;
                    } else {
                      embedUrl = url;
                    }
                  }
                }
                if (!embedUrl) {
                  return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Could not parse URL</div>;
                }
                return (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title="Video preview"
                  />
                );
              })()}
            </div>
            {section.showVideo === false && (
              <p className="text-xs text-orange-600 mt-1">⚠️ Video is hidden. Enable the "Show" toggle above to display it in the preview.</p>
            )}
          </div>
        )}
      </CollapsibleSection>


      {/* Languages */}
      <CollapsibleSection title="Languages" icon={Languages}
        showToggle
        toggleChecked={section.showLanguages !== false}
        onToggleChange={(checked) => onUpdate({ showLanguages: checked })}
      >
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={addLanguage}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        {(section.languages || []).map((lang) => (
          <div key={lang.id} className="flex items-center gap-2">
            <Input
              value={lang.language}
              onChange={(e) => updateLanguage(lang.id, { language: e.target.value })}
              placeholder="English"
              className="flex-1"
            />
            <select
              value={lang.proficiency}
              onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value })}
              className="px-3 py-2 border rounded-xl text-sm"
            >
              <option value="Native">Native</option>
              <option value="Fluent">Fluent</option>
              <option value="Advanced">Advanced</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Basic">Basic</option>
            </select>
            <button
              onClick={() => removeLanguage(lang.id)}
              className="p-2 text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </CollapsibleSection>

      {/* Gallery Images */}
      <CollapsibleSection
        title="Gallery Images"
        icon={Images}
        description="Add multiple images to showcase your work, workspace, or process"
        showToggle
        toggleChecked={section.showGallery !== false}
        onToggleChange={(checked) => onUpdate({ showGallery: checked })}
      >
        <GalleryUploader
          images={section.galleryImages || []}
          onChange={(images) => onUpdate({ galleryImages: images })}
          maxImages={20}
        />
      </CollapsibleSection>

      {/* Social Links Toggle */}
      <CollapsibleSection title="Social Media Links" icon={FileText}>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={section.showSocialLinks || false}
            onChange={(e) => onUpdate({ showSocialLinks: e.target.checked })}
          />
          Show social media links in About section
        </label>
      </CollapsibleSection>

      {/* Unified Text Styles for all text elements */}
      <SectionTextStyleEditor
        textStyles={section.textStyles}
        fields={[
          { key: 'title', label: 'Section Title' },
          { key: 'content', label: 'Main Bio' },
        ]}
        onUpdate={(textStyles) => onUpdate({ textStyles })}
      />
    </div>
  );
}
