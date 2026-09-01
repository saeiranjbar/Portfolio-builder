'use client';

import React from 'react';
import { Magnet } from 'lucide-react';

interface FreeFormControlsProps {
  freeFormEnabled: boolean;
  snapEnabled: boolean;
  onUpdate: (updates: { freeFormEnabled?: boolean; snapEnabled?: boolean }) => void;
}

/**
 * Reusable toggle controls for snap guides.
 * Free-form mode is always on — only the snap toggle is shown.
 */
export function FreeFormControls({ freeFormEnabled, snapEnabled, onUpdate }: FreeFormControlsProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-blue-700">
          <Magnet className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            Drag elements in the preview to reposition them
          </span>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </div>
  );
}
