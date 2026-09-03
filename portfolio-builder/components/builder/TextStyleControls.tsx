'use client';

import React from 'react';
import { TextStyleSettings, TextStyles } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { availableFonts } from '@/lib/templates';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

interface TextStyleControlsProps {
  textStyles: TextStyles | undefined;
  fieldKey: string;
  fieldLabel: string;
  onUpdate: (textStyles: TextStyles) => void;
  defaultColor?: string;
  defaultFontFamily?: string;
}

export function TextStyleControls({
  textStyles,
  fieldKey,
  fieldLabel,
  onUpdate,
  defaultColor,
  defaultFontFamily,
}: TextStyleControlsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const styles: TextStyleSettings = textStyles?.[fieldKey] || {};

  const updateStyle = (key: keyof TextStyleSettings, value: string | number) => {
    const currentStyles = textStyles || {};
    const fieldStyles = currentStyles[fieldKey] || {};
    const updated = {
      ...currentStyles,
      [fieldKey]: { ...fieldStyles, [key]: value },
    };
    onUpdate(updated);
  };


  const resetStyles = () => {
    if (!textStyles) return;
    const updated = { ...textStyles };
    delete updated[fieldKey];
    onUpdate(updated);
  };

  const hasCustomStyles = Object.keys(styles).length > 0;

  const fontWeights = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semibold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
  ];

  const textTransforms = [
    { value: 'none', label: 'None' },
    { value: 'uppercase', label: 'UPPER' },
    { value: 'lowercase', label: 'lower' },
    { value: 'capitalize', label: 'Capitalize' },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-medium text-gray-700">
            {fieldLabel}
          </span>
          {hasCustomStyles && (
            <span className="w-2 h-2 rounded-full bg-blue-500" title="Custom styles applied" />
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="p-3 space-y-3">
          {/* Color */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Font Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={styles.color || defaultColor || '#000000'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-12 h-8 p-1 cursor-pointer"
              />
              <Input
                value={styles.color || ''}
                onChange={(e) => updateStyle('color', e.target.value)}
                placeholder={defaultColor || 'Inherit from theme'}
                className="flex-1 h-8 text-xs"
              />
            </div>
          </div>

          {/* Font Family */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Font Family</Label>
            <select
              value={styles.fontFamily || ''}
              onChange={(e) => updateStyle('fontFamily', e.target.value)}
              className="flex h-8 w-full rounded-md border border-gray-300 bg-transparent px-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            >
              <option value="">Inherit from theme</option>
              {availableFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Font Size</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={styles.fontSize ? parseInt(styles.fontSize) : ''}
                onChange={(e) =>
                  updateStyle('fontSize', e.target.value ? `${e.target.value}px` : '')
                }
                placeholder="Inherit"
                className="flex-1 h-8 text-xs"
                min="8"
                max="200"
              />
              <span className="text-xs text-gray-400">px</span>
            </div>
          </div>

          {/* Font Weight */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Font Weight</Label>
            <select
              value={styles.fontWeight || ''}
              onChange={(e) => updateStyle('fontWeight', e.target.value)}
              className="flex h-8 w-full rounded-md border border-gray-300 bg-transparent px-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            >
              <option value="">Inherit from theme</option>
              {fontWeights.map((fw) => (
                <option key={fw.value} value={fw.value}>
                  {fw.label} ({fw.value})
                </option>
              ))}
            </select>
          </div>

          {/* Text Alignment */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Text Alignment</Label>
            <div className="flex gap-1">
              {[
                { value: 'left', icon: AlignLeft, label: 'Left' },
                { value: 'center', icon: AlignCenter, label: 'Center' },
                { value: 'right', icon: AlignRight, label: 'Right' },
                { value: 'justify', icon: AlignJustify, label: 'Justify' },
              ].map((align) => {
                const Icon = align.icon;
                return (
                  <Button
                    key={align.value}
                    type="button"
                    variant={styles.textAlign === align.value ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateStyle('textAlign', align.value)}
                    title={align.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Font Style & Decoration */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Style & Decoration</Label>
            <div className="flex gap-1 flex-wrap">
              <Button
                type="button"
                variant={styles.fontWeight === '700' ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() =>
                  updateStyle('fontWeight', styles.fontWeight === '700' ? '' : '700')
                }
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant={styles.fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() =>
                  updateStyle('fontStyle', styles.fontStyle === 'italic' ? 'normal' : 'italic')
                }
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant={styles.textDecoration === 'underline' ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() =>
                  updateStyle(
                    'textDecoration',
                    styles.textDecoration === 'underline' ? 'none' : 'underline'
                  )
                }
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant={styles.textDecoration === 'line-through' ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() =>
                  updateStyle(
                    'textDecoration',
                    styles.textDecoration === 'line-through' ? 'none' : 'line-through'
                  )
                }
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Max Width (line width control) */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">
              Text Width (max width): {styles.maxWidth ? parseInt(styles.maxWidth) : 'Auto'}px
            </Label>
            <Input
              type="range"
              min="100"
              max="1600"
              step="10"
              value={styles.maxWidth ? parseInt(styles.maxWidth) : 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                updateStyle('maxWidth', val > 0 ? `${val}px` : '');
              }}
              className="w-full"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">Auto</span>
              <button
                type="button"
                className="text-xs text-blue-500 hover:text-blue-700"
                onClick={() => updateStyle('maxWidth', '')}
              >
                Reset to auto
              </button>
              <span className="text-xs text-gray-400">1600px</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Controls how wide the text line can be. Lower = narrower lines, higher = wider lines.
            </p>
          </div>

          {/* Text Transform */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Text Transform</Label>
            <select
              value={styles.textTransform || ''}
              onChange={(e) => updateStyle('textTransform', e.target.value)}
              className="flex h-8 w-full rounded-md border border-gray-300 bg-transparent px-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            >
              {textTransforms.map((tt) => (
                <option key={tt.value} value={tt.value}>
                  {tt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Line Height */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Line Height</Label>
            <Input
              type="number"
              step="0.1"
              value={styles.lineHeight || ''}
              onChange={(e) => updateStyle('lineHeight', e.target.value)}
              placeholder="Inherit (e.g. 1.5)"
              className="h-8 text-xs"
            />
          </div>

          {/* Letter Spacing */}
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Letter Spacing</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                step="0.1"
                value={styles.letterSpacing ? parseFloat(styles.letterSpacing) : ''}
                onChange={(e) =>
                  updateStyle('letterSpacing', e.target.value ? `${e.target.value}px` : '')
                }
                placeholder="Inherit"
                className="flex-1 h-8 text-xs"
              />
              <span className="text-xs text-gray-400">px</span>
            </div>
          </div>

          {/* Animation Effects */}
          <div className="border-t border-gray-200 pt-3">
            <Label className="text-xs text-gray-600 mb-1 block">Text Animation</Label>
            <select
              value={styles.animationType || 'none'}
              onChange={(e) => updateStyle('animationType', e.target.value)}

              className="flex h-8 w-full rounded-md border border-gray-300 bg-transparent px-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 mb-2"
            >
              <option value="none">No animation</option>
              <option value="wordColorReveal">Word-by-word color reveal</option>
            </select>

            {styles.animationType === 'wordColorReveal' && (
              <div className="space-y-2 p-2 bg-gray-50 rounded-md">
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500 block">From color</Label>
                    <Input
                      type="color"
                      value={styles.animationFromColor || '#808080'}
                      onChange={(e) => updateStyle('animationFromColor', e.target.value)}

                      className="w-full h-8 p-1 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-500 block">To color</Label>
                    <Input
                      type="color"
                      value={styles.animationToColor || '#ffffff'}
                      onChange={(e) => updateStyle('animationToColor', e.target.value)}

                      className="w-full h-8 p-1 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 block">Duration: {styles.animationDuration ?? 0.8}s</Label>
                  <Input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.1"
                    value={styles.animationDuration ?? 0.8}
                    onChange={(e) => updateStyle('animationDuration', parseFloat(e.target.value))}

                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 block">Stagger (delay between words): {styles.animationStagger ?? 0.15}s</Label>
                  <Input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={styles.animationStagger ?? 0.15}
                    onChange={(e) => updateStyle('animationStagger', parseFloat(e.target.value))}

                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reset */}
          {hasCustomStyles && (

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-xs text-red-500 hover:text-red-600"
              onClick={resetStyles}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset to default
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
