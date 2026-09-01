'use client';

import React from 'react';
import { BackgroundShape } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from './CollapsibleSection';
import { Plus, Trash2, Square, Circle, Triangle } from 'lucide-react';

interface BackgroundShapesEditorProps {
  shapes: BackgroundShape[] | undefined;
  onChange: (shapes: BackgroundShape[]) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export function BackgroundShapesEditor({ shapes, onChange }: BackgroundShapesEditorProps) {
  const shapeList = shapes || [];

  const addShape = (shapeType: BackgroundShape['shape']) => {
    const newShape: BackgroundShape = {
      id: generateId(),
      shape: shapeType,
      color: '#3b82f6',
      opacity: 30,
      width: 300,
      height: 200,
      position: { x: 50, y: 50 },
      zIndex: 0,
      rotation: 0,
      borderRadius: shapeType === 'rounded' ? 16 : undefined,
    };
    onChange([...shapeList, newShape]);
  };

  const updateShape = (id: string, updates: Partial<BackgroundShape>) => {
    onChange(shapeList.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeShape = (id: string) => {
    onChange(shapeList.filter(s => s.id !== id));
  };

  return (
    <CollapsibleSection
      title="Background Shapes"
      icon={Square}
      description="Add decorative shapes behind text elements (free-form mode only). Drag them in the preview to reposition."
    >
      <div className="space-y-3">
        {/* Add shape buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => addShape('rectangle')}>
            <Square className="w-3.5 h-3.5 mr-1" /> Rectangle
          </Button>
          <Button variant="outline" size="sm" onClick={() => addShape('rounded')}>
            <Square className="w-3.5 h-3.5 mr-1" /> Rounded
          </Button>
          <Button variant="outline" size="sm" onClick={() => addShape('circle')}>
            <Circle className="w-3.5 h-3.5 mr-1" /> Circle
          </Button>
          <Button variant="outline" size="sm" onClick={() => addShape('triangle')}>
            <Triangle className="w-3.5 h-3.5 mr-1" /> Triangle
          </Button>
        </div>

        {/* Existing shapes */}
        {shapeList.map((shape, index) => (
          <div key={shape.id} className="space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">
                Shape {index + 1} ({shape.shape})
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                onClick={() => removeShape(shape.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Color & Opacity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Color</Label>
                <div className="flex gap-1 items-center">
                  <Input
                    type="color"
                    value={shape.color}
                    onChange={(e) => updateShape(shape.id, { color: e.target.value })}
                    className="w-10 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    value={shape.color}
                    onChange={(e) => updateShape(shape.id, { color: e.target.value })}
                    className="flex-1 h-8 text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Opacity: {shape.opacity}%</Label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={shape.opacity}
                  onChange={(e) => updateShape(shape.id, { opacity: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Rotation & Border Radius */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Rotation: {shape.rotation || 0}°</Label>
                <Input
                  type="range"
                  min="0"
                  max="360"
                  value={shape.rotation || 0}
                  onChange={(e) => updateShape(shape.id, { rotation: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              {shape.shape === 'rounded' && (
                <div>
                  <Label className="text-xs">Corner Radius: {shape.borderRadius || 0}px</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={shape.borderRadius || 0}
                    onChange={(e) => updateShape(shape.id, { borderRadius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Z-Index */}
            <div>
              <Label className="text-xs">Layer Order (z-index): {shape.zIndex}</Label>
              <Input
                type="range"
                min="0"
                max="9"
                value={shape.zIndex}
                onChange={(e) => updateShape(shape.id, { zIndex: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-1">0 = behind all text, 9 = in front of shapes but behind text</p>
            </div>
          </div>
        ))}

        {shapeList.length === 0 && (
          <p className="text-xs text-gray-500 italic">No background shapes yet. Add one above.</p>
        )}
      </div>
    </CollapsibleSection>
  );
}
