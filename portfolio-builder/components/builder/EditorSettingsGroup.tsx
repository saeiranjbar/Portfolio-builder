'use client';

import React from 'react';
import { Magnet, Sparkles } from 'lucide-react';
import { usePortfolioStore } from '@/lib/store';
import { HeroSection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CollapsibleSection } from './CollapsibleSection';
import { EffectsPanel } from './EffectsPanel';
import { ProjectBackgroundSettings } from './ProjectBackgroundSettings';

// Interactive effects, snap guides and project background, in one card.
// Every row uses the same header look (gray-50 bar, icon, medium text).
export function EditorSettingsGroup() {
  const { portfolio, updateSection } = usePortfolioStore();
  const hero = portfolio.sections.find((s) => s.type === 'hero') as HeroSection | undefined;
  const showSnap = !!hero && portfolio.layoutMode !== 'simple';
  const snapOn = (hero as any)?.snapEnabled !== false;

  return (
    <div className="m-3 overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-200">
      <CollapsibleSection flush title="Interactive Effects" icon={Sparkles}>
        <EffectsPanel />
      </CollapsibleSection>

      {showSnap && hero && (
        <div className="flex items-center justify-between gap-2 bg-gray-50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Magnet className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">Snap Guides</span>
          </div>
          <button
            type="button"
            title="Toggle snap guides for aligning elements"
            onClick={() => updateSection(hero.id, { snapEnabled: !snapOn } as any)}
            className={cn(
              'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
              snapOn ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            )}
          >
            {snapOn ? 'On' : 'Off'}
          </button>
        </div>
      )}

      <ProjectBackgroundSettings flush />
    </div>
  );
}
