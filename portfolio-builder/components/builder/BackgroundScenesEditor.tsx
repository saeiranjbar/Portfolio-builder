'use client';

import React from 'react';
import type { HeroSection, PageBackgroundScene } from '@/lib/types';
import { getSceneStartPxList } from '@/lib/page-background';
import { getBuilderPageRange, getBuilderPageScrollTop } from '@/lib/page-canvas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './ImageUploader';
import { VideoFileUploader } from './VideoFileUploader';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Film, Image as ImageIcon } from 'lucide-react';

interface BackgroundScenesEditorProps {
  section: HeroSection;
  onUpdate: (updates: Partial<HeroSection>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Editor for the switching page background ("background reel"): a list of
 * full-page clips that cross-fade into each other while the visitor scrolls.
 */
export function BackgroundScenesEditor({ section, onUpdate }: BackgroundScenesEditorProps) {
  const scenes = section.backgroundScenes || [];
  const advance = section.backgroundAdvance === 'timer' ? 'timer' : 'scroll';
  const transition = section.backgroundTransition ?? 900;
  const interval = section.backgroundInterval ?? 6;

  const setScenes = (next: PageBackgroundScene[]) => onUpdate({ backgroundScenes: next });

  const addScene = (type: PageBackgroundScene['type']) => {
    const scene: PageBackgroundScene = {
      id: generateId(),
      type,
      value: '',
      label: type === 'video' ? `Clip ${scenes.length + 1}` : `Still ${scenes.length + 1}`,
      overlayOpacity: type === 'video' ? 25 : 0,
    };
    setScenes([...scenes, scene]);
  };

  const updateScene = (id: string, updates: Partial<PageBackgroundScene>) => {
    setScenes(scenes.map((scene) => (scene.id === id ? { ...scene, ...updates } : scene)));
  };

  const removeScene = (id: string) => setScenes(scenes.filter((scene) => scene.id !== id));

  const moveScene = (id: string, direction: -1 | 1) => {
    const index = scenes.findIndex((scene) => scene.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= scenes.length) return;
    const next = [...scenes];
    [next[index], next[target]] = [next[target], next[index]];
    // Keep the reel in reading order: the switch points follow the new order.
    setScenes(next.map((scene) => ({ ...scene, startPercent: undefined, startY: undefined, startAnchorLabel: undefined })));
  };

  // Switch points live on the page's Y axis, so the editor needs to know how far
  // the page actually scrolls.
  const [pageMetrics, setPageMetrics] = React.useState({ scrollTop: 0, scrollRange: 0, pageHeight: 0 });
  const scenesSignature = scenes.map((item) => `${item.id}:${item.startY ?? 'auto'}`).join('|');
  React.useEffect(() => {
    const read = () => setPageMetrics(getBuilderPageRange());
    read();
    if (typeof window === 'undefined') return;
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, [scenesSignature]);

  const starts = getSceneStartPxList(scenes, pageMetrics.scrollRange);
  const setAllAuto = () => setScenes(scenes.map((scene) => ({
    ...scene, startPercent: undefined, startY: undefined, startAnchorLabel: undefined,
  })));

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        The page background switches between these clips while the visitor scrolls, each one
        cross-fading into the next. Every clip has a switch point on the Y axis of the page:
        the clip takes over as soon as the top of the viewport reaches that Y. Drag the blue
        lines in the preview to place them, or type the numbers here.
      </p>

      {advance === 'scroll' && pageMetrics.scrollRange > 0 && (
        <p className="text-xs text-gray-500 -mt-2">
          This page is {pageMetrics.pageHeight}px tall and scrolls to Y {pageMetrics.scrollRange}px
          — you are at Y {pageMetrics.scrollTop}px right now.
        </p>
      )}

      {/* What advances the reel */}
      <div>
        <Label>Switch On</Label>
        <div className="flex gap-2 mt-2">
          <Button variant={advance === 'scroll' ? 'default' : 'outline'} size="sm" onClick={() => onUpdate({ backgroundAdvance: 'scroll' })}>
            Scroll
          </Button>
          <Button variant={advance === 'timer' ? 'default' : 'outline'} size="sm" onClick={() => onUpdate({ backgroundAdvance: 'timer' })}>
            Timer
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {advance === 'scroll'
            ? 'Each clip owns a band of the page and takes over when the visitor scrolls into it.'
            : `Clips change on their own, every ${interval} seconds, whatever the visitor is doing.`}
        </p>
      </div>

      {advance === 'timer' && (
        <div>
          <Label className="text-xs text-gray-600">Seconds per clip: {interval}s</Label>
          <Input
            type="range"
            min="2"
            max="30"
            value={interval}
            onChange={(e) => onUpdate({ backgroundInterval: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      )}

      <div>
        <Label className="text-xs text-gray-600">Cross-fade: {transition}ms</Label>
        <Input
          type="range"
          min="0"
          max="3000"
          step="100"
          value={transition}
          onChange={(e) => onUpdate({ backgroundTransition: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {scenes.length === 0 && (
        <p className="text-xs text-gray-400 italic">No clips yet — add the first one below.</p>
      )}
      {scenes.map((scene, index) => {
        const autoY = starts[index] ?? 0;
        const nextY = index + 1 < scenes.length ? starts[index + 1] : null;
        const isAutoStart = typeof scene.startY !== 'number';
        return (
          <div key={scene.id} className="space-y-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 w-6">#{index + 1}</span>
              <Input
                value={scene.label || ''}
                onChange={(e) => updateScene(scene.id, { label: e.target.value })}
                placeholder={`Clip ${index + 1}`}
                className="flex-1 h-8 text-sm"
              />
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Move earlier" onClick={() => moveScene(scene.id, -1)}>
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Move later" onClick={() => moveScene(scene.id, 1)}>
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                title={scene.visible === false ? 'Show' : 'Hide'}
                onClick={() => updateScene(scene.id, { visible: scene.visible === false })}
              >
                {scene.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Remove" onClick={() => removeScene(scene.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant={scene.type === 'video' ? 'default' : 'outline'} size="sm" onClick={() => updateScene(scene.id, { type: 'video', value: '' })}>
                <Film className="w-3.5 h-3.5 mr-1" /> Video
              </Button>
              <Button variant={scene.type === 'image' ? 'default' : 'outline'} size="sm" onClick={() => updateScene(scene.id, { type: 'image', value: '' })}>
                <ImageIcon className="w-3.5 h-3.5 mr-1" /> Image
              </Button>
            </div>

            {scene.type === 'video' ? (
              <VideoFileUploader value={scene.value} onChange={(url: string) => updateScene(scene.id, { value: url })} />
            ) : (
              <ImageUploader value={scene.value} onChange={(url: string) => updateScene(scene.id, { value: url })} />
            )}

            <div>
              <Label className="text-xs text-gray-600">Or paste a {scene.type === 'video' ? 'video' : 'image'} URL</Label>
              <Input
                value={scene.value}
                onChange={(e) => updateScene(scene.id, { value: e.target.value })}
                placeholder={scene.type === 'video' ? 'https://example.com/clip.mp4' : 'https://example.com/still.jpg'}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-600">Dark overlay: {scene.overlayOpacity ?? 0}%</Label>
              <Input
                type="range"
                min="0"
                max="80"
                value={scene.overlayOpacity ?? 0}
                onChange={(e) => updateScene(scene.id, { overlayOpacity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {advance === 'scroll' && (
              <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-600">Switch point — Y from top of page</Label>
                  {index > 0 && (
                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => updateScene(scene.id, isAutoStart
                        ? { startY: autoY, startPercent: undefined, startAnchorLabel: undefined }
                        : { startY: undefined, startPercent: undefined, startAnchorLabel: undefined })}
                    >
                      {isAutoStart ? 'Set manually' : 'Back to auto'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    disabled={index === 0 || isAutoStart}
                    value={isAutoStart ? autoY : Math.round(scene.startY ?? 0)}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value);
                      updateScene(scene.id, {
                        startY: Number.isFinite(raw) ? Math.max(0, Math.min(50000, raw)) : undefined,
                        startPercent: undefined,
                        startAnchorLabel: undefined,
                      });
                    }}
                    className="w-24"
                  />
                  <span className="text-xs text-gray-500">px</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === 0 || isAutoStart}
                    onClick={() => updateScene(scene.id, { startY: Math.max(0, Math.round(scene.startY ?? autoY) - 100), startAnchorLabel: undefined })}
                  >
                    -100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === 0 || isAutoStart}
                    onClick={() => updateScene(scene.id, { startY: Math.round(scene.startY ?? autoY) + 100, startAnchorLabel: undefined })}
                  >
                    +100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    title="Use the Y position the preview is scrolled to right now"
                    onClick={() => updateScene(scene.id, { startY: getBuilderPageScrollTop(), startPercent: undefined, startAnchorLabel: undefined })}
                  >
                    Use current scroll
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {index === 0
                    ? 'Clip 1 owns the top of the page, so it has no switch point.'
                    : isAutoStart
                      ? `Auto: switches at Y ${autoY}px${nextY !== null ? ` and hands over to the next clip at Y ${nextY}px` : ' and holds to the end of the page'}. Drag this clip's blue line in the preview to place it exactly.`
                      : `Switches when the top of the viewport reaches Y ${Math.round(scene.startY ?? 0)}px${scene.startAnchorLabel ? ` (at ${scene.startAnchorLabel})` : ''}${nextY !== null ? `, hands over at Y ${nextY}px` : ', then holds to the end of the page'}.`}
                </p>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => addScene('video')}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add video clip
        </Button>
        <Button variant="outline" size="sm" onClick={() => addScene('image')}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add image still
        </Button>
        {advance === 'scroll' && scenes.some((scene) => typeof scene.startY === 'number') && (
          <Button variant="outline" size="sm" onClick={setAllAuto} title="Spread every switch point evenly down the page again">
            Reset switch points
          </Button>
        )}
      </div>
      {scenes.length < 2 && (
        <p className="text-xs text-amber-600">
          Add at least one more clip for the background to start switching — with a single clip it stays put.
        </p>
      )}
    </div>
  );
}
