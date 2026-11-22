'use client';

import React from 'react';

// Quick-fact icons are matched from the fact's label against Lucide's icon tags (https://lucide.dev/icons/).
// The chosen icon is stored as its SVG URL on the fact and drawn through a CSS mask in the fact's colour.

/** CSS mask that draws an icon in a single colour (set background on the element). */
export function iconMaskStyle(icon: string): React.CSSProperties {
  const mask = `url("${icon}") center / contain no-repeat`;
  return { WebkitMask: mask, mask };
}

type Status = 'idle' | 'searching' | 'found' | 'none' | 'error';

interface IconPickerProps {
  value?: string;
  /** The fact's label; the icon is matched from it */
  query: string;
  onChange: (icon: string | undefined) => void;
}

/**
 * Picks an icon for the label automatically. Runs on mount when the fact has no icon yet,
 * and again (debounced) whenever the label changes.
 */
export function IconPicker({ value, query, onChange }: IconPickerProps) {
  const [status, setStatus] = React.useState<Status>('idle');
  const [name, setName] = React.useState('');
  const firstRun = React.useRef(true);

  React.useEffect(() => {
    const text = query.trim();
    const isFirst = firstRun.current;
    firstRun.current = false;
    if (!text || text === 'New Fact') return;
    // A fact that already has an icon keeps it until its label is edited.
    if (isFirst && value) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setStatus('searching');
      try {
        const res = await fetch(`/api/lucide/search?q=${encodeURIComponent(text)}`);
        if (cancelled) return;
        if (!res.ok) return setStatus('error');
        const match = (await res.json()) as { name: string; url: string } | null;
        if (cancelled) return;
        if (!match) return setStatus('none');
        setName(match.name);
        setStatus('found');
        onChange(match.url);
      } catch {
        if (!cancelled) setStatus('error');
      }
    }, isFirst ? 0 : 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Only the label drives a new lookup; the icon and callback are read as they are at that point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const message: Record<Status, string> = {
    idle: '',
    searching: 'Finding icon…',
    found: `Lucide · ${name}`,
    none: 'No matching icon found',
    error: 'Icon lookup failed',
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {value && (
        <span
          aria-hidden="true"
          className="inline-block h-5 w-5 shrink-0"
          style={{ ...iconMaskStyle(value), background: '#1f2937' }}
        />
      )}
      <span className="truncate">{message[status]}</span>
    </div>
  );
}
