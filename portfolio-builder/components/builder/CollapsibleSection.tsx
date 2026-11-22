'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  showToggle?: boolean;
  toggleChecked?: boolean;
  onToggleChange?: (checked: boolean) => void;
  icon?: React.ElementType;
  description?: string;
  /** No outer border or rounding: for sections placed inside a shared container. */
  flush?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  showToggle = false,
  toggleChecked = true,
  onToggleChange,
  icon: Icon,
  description,
  flush = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn('overflow-hidden bg-white', !flush && 'border border-gray-200 rounded-2xl')}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {Icon && <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />}
          <span className="text-sm font-medium text-gray-900">{title}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform ml-auto',
              isOpen && 'rotate-180'
            )}
          />
        </button>
        {showToggle && (
          // One state, one control: a dot and a word. Live sections appear on the site.
          <button
            type="button"
            role="switch"
            aria-checked={toggleChecked}
            onClick={() => onToggleChange?.(!toggleChecked)}
            title={toggleChecked ? 'Live on the site. Click to hide.' : 'Hidden from the site. Click to show.'}
            className={cn(
              'ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
              toggleChecked ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', toggleChecked ? 'bg-emerald-500' : 'bg-gray-400')} />
            {toggleChecked ? 'Live' : 'Hidden'}
          </button>
        )}
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-4 space-y-3">
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
