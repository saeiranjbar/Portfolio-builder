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
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
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
          <label
            className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer ml-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={toggleChecked}
              onChange={(e) => onToggleChange?.(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show
          </label>
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
