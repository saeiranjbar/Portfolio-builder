'use client';

import React from 'react';
import { MousePointerClick, Droplet, Palette } from 'lucide-react';
import { usePortfolioStore } from '@/lib/store';
import { CollapsibleSection } from './CollapsibleSection';

export function EffectsPanel() {
  const { portfolio, updateEffects } = usePortfolioStore();
  const effects = portfolio.effects || {
    mouseColorShift: { enabled: false, startColor: '#3b82f6', endColor: '#8b5cf6', intensity: 30 },
    splashButton: { enabled: false, text: 'Click Me!', link: '#contact', color: '#3b82f6', position: 'bottom-center' as const },
    colorRibbon: { enabled: false, color: '#8b5cf6', intensity: 40 },
  };

  return (
    <div className="space-y-3">
      {/* Mouse Color Shift Effect */}
      <CollapsibleSection title="Mouse Color Shift" icon={MousePointerClick} defaultOpen={false}>
        <div className="space-y-3">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Enable Effect</span>
            <button
              onClick={() => updateEffects({ mouseColorShift: { ...effects.mouseColorShift, enabled: !effects.mouseColorShift.enabled } })}
              className={`relative w-11 h-6 rounded-full transition-colors ${effects.mouseColorShift.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${effects.mouseColorShift.enabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {effects.mouseColorShift.enabled && (
            <>
              <p className="text-xs text-gray-500">
                As the user moves their mouse from left to right, the screen background color smoothly shifts between two colors.
              </p>

              {/* Start color (left) */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Start Color (Left)</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded border border-gray-300 overflow-hidden" style={{ backgroundColor: effects.mouseColorShift.startColor }}>
                    <input
                      type="color"
                      value={effects.mouseColorShift.startColor}
                      onChange={(e) => updateEffects({ mouseColorShift: { ...effects.mouseColorShift, startColor: e.target.value } })}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={effects.mouseColorShift.startColor}
                    onChange={(e) => updateEffects({ mouseColorShift: { ...effects.mouseColorShift, startColor: e.target.value } })}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* End color (right) */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">End Color (Right)</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded border border-gray-300 overflow-hidden" style={{ backgroundColor: effects.mouseColorShift.endColor }}>
                    <input
                      type="color"
                      value={effects.mouseColorShift.endColor}
                      onChange={(e) => updateEffects({ mouseColorShift: { ...effects.mouseColorShift, endColor: e.target.value } })}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={effects.mouseColorShift.endColor}
                    onChange={(e) => updateEffects({ mouseColorShift: { ...effects.mouseColorShift, endColor: e.target.value } })}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Intensity slider */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Intensity: {effects.mouseColorShift.intensity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effects.mouseColorShift.intensity}
                  onChange={(e) => updateEffects({ mouseColorShift: { ...effects.mouseColorShift, intensity: parseInt(e.target.value) } })}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Splash Button Effect */}
      <CollapsibleSection title="Splash CTA Button" icon={Droplet} defaultOpen={false}>
        <div className="space-y-3">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Enable Effect</span>
            <button
              onClick={() => updateEffects({ splashButton: { ...effects.splashButton, enabled: !effects.splashButton.enabled } })}
              className={`relative w-11 h-6 rounded-full transition-colors ${effects.splashButton.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${effects.splashButton.enabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {effects.splashButton.enabled && (
            <>
              <p className="text-xs text-gray-500">
                A floating button appears at the bottom of the screen with a splash animation. When clicked, a liquid ripple expands outward.
              </p>

              {/* Button text */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Button Text</label>
                <input
                  type="text"
                  value={effects.splashButton.text}
                  onChange={(e) => updateEffects({ splashButton: { ...effects.splashButton, text: e.target.value } })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                  placeholder="Click Me!"
                />
              </div>

              {/* Button link */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Link (URL or #section)</label>
                <input
                  type="text"
                  value={effects.splashButton.link}
                  onChange={(e) => updateEffects({ splashButton: { ...effects.splashButton, link: e.target.value } })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                  placeholder="#contact"
                />
              </div>

              {/* Button color */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Splash Color</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded border border-gray-300 overflow-hidden" style={{ backgroundColor: effects.splashButton.color }}>
                    <input
                      type="color"
                      value={effects.splashButton.color}
                      onChange={(e) => updateEffects({ splashButton: { ...effects.splashButton, color: e.target.value } })}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={effects.splashButton.color}
                    onChange={(e) => updateEffects({ splashButton: { ...effects.splashButton, color: e.target.value } })}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Position</label>
                <select
                  value={effects.splashButton.position}
                  onChange={(e) => updateEffects({ splashButton: { ...effects.splashButton, position: e.target.value as any } })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Color Ribbon Effect */}
      <CollapsibleSection title="Color Ribbon" icon={Palette} defaultOpen={false}>
        <div className="space-y-3">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Enable Effect</span>
            <button
              onClick={() => updateEffects({ colorRibbon: { ...effects.colorRibbon, enabled: !effects.colorRibbon.enabled } })}
              className={`relative w-11 h-6 rounded-full transition-colors ${effects.colorRibbon.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${effects.colorRibbon.enabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {effects.colorRibbon.enabled && (
            <>
              <p className="text-xs text-gray-500">
                A vertical ribbon spans the full page height from the left edge to the cursor. As the user moves the mouse left or right, the ribbon width expands or shrinks accordingly.
              </p>

              {/* Ribbon color */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Ribbon Color</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded border border-gray-300 overflow-hidden" style={{ backgroundColor: effects.colorRibbon.color }}>
                    <input
                      type="color"
                      value={effects.colorRibbon.color}
                      onChange={(e) => updateEffects({ colorRibbon: { ...effects.colorRibbon, color: e.target.value } })}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={effects.colorRibbon.color}
                    onChange={(e) => updateEffects({ colorRibbon: { ...effects.colorRibbon, color: e.target.value } })}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Intensity slider */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Intensity: {effects.colorRibbon.intensity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effects.colorRibbon.intensity}
                  onChange={(e) => updateEffects({ colorRibbon: { ...effects.colorRibbon, intensity: parseInt(e.target.value) } })}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
