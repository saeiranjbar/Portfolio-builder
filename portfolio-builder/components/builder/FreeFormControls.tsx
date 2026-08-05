'use client';

import React from 'react';
import { Move, Magnet } from 'lucide-react';

interface FreeFormControlsProps {
  freeFormEnabled: boolean;
  snapEnabled: boolean;
  onUpdate: (updates: { freeFormEnabled?: boolean; snapEnabled?: boolean }) => void;
}

/**
 * Reusable toggle controls for free-form layout mode and snap guides.
 * Shown at the top of each section editor.
 */
export function FreeFormControls({ freeFormEnabled, snapEnabled, onUpdate }: FreeFormControlsProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-blue-700">
          <Move className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            {freeFormEnabled
              ? 'Drag elements in the preview to reposition them'
              : 'Enable Free-Form mode to drag elements anywhere'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate({ freeFormEnabled: !freeFormEnabled })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              freeFormEnabled
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="Toggle free-form layout mode"
          >
            <Move className="w-3.5 h-3.5" />
            Free-Form
          </button>
          {freeFormEnabled && (
            <button
              onClick={() => onUpdate({ snapEnabled: !snapEnabled })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                snapEnabled
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title="Toggle snap guides for aligning elements"
            >
              <Magnet className="w-3.5 h-3.5" />
              Snap Guides
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
