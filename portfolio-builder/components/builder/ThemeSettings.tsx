'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { themes, availableFonts } from '@/lib/templates';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function ThemeSettings() {
  const { portfolio, setTheme } = usePortfolioStore();
  const { theme } = portfolio;

  const handleColorChange = (key: keyof typeof theme.colors, value: string) => {
    setTheme({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value,
      },
    });
  };

  const handleFontChange = (key: 'headingFont' | 'bodyFont', value: string) => {
    setTheme({
      ...theme,
      typography: {
        ...theme.typography,
        [key]: value,
      },
    });
  };

  const handleBaseSizeChange = (value: number) => {
    setTheme({
      ...theme,
      typography: {
        ...theme.typography,
        baseSize: value,
      },
    });
  };

  const handleBorderRadiusChange = (value: number) => {
    setTheme({
      ...theme,
      borderRadius: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
      </div>

      {/* Preset Themes */}
      <div>
        <Label className="mb-2 block text-gray-900">Preset Themes</Label>
        <div className="grid grid-cols-2 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all duration-200',
                theme.id === t.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              <div
                className="h-8 rounded-lg mb-2"
                style={{ background: `linear-gradient(90deg, ${t.colors.primary} 0%, ${t.colors.secondary} 100%)` }}
              />
              <span className="text-sm font-medium text-gray-900">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <Label className="mb-2 block text-gray-900">Colors</Label>
        <div className="space-y-3">
          {Object.entries(theme.colors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <div 
                className="w-12 h-9 rounded border border-gray-300 cursor-pointer overflow-hidden"
                style={{ backgroundColor: value }}
              >
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key as keyof typeof theme.colors, e.target.value)}
                  className="w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                <div className="text-sm text-gray-900 font-mono">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <Label className="mb-2 block">Typography</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Heading Font</Label>
            <select
              value={theme.typography.headingFont}
              onChange={(e) => handleFontChange('headingFont', e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            >
              {availableFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Body Font</Label>
            <select
              value={theme.typography.bodyFont}
              onChange={(e) => handleFontChange('bodyFont', e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            >
              {availableFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Base Font Size: {theme.typography.baseSize}px</Label>
            <Input
              type="range"
              min="12"
              max="20"
              value={theme.typography.baseSize}
              onChange={(e) => handleBaseSizeChange(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <Label className="text-xs">Border Radius: {theme.borderRadius}px</Label>
        <Input
          type="range"
          min="0"
          max="24"
          value={theme.borderRadius}
          onChange={(e) => handleBorderRadiusChange(parseInt(e.target.value))}
        />
      </div>
    </div>
  );
}