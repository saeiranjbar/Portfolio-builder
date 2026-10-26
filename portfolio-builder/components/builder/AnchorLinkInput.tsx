'use client';

import React from 'react';
import { usePortfolioStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { CornerDownLeft } from 'lucide-react';

interface AnchorLinkInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

/**
 * Link/URL input with page-anchor suggestions. As soon as the value starts
 * with '#', a dropdown lists every visible section of the page (title +
 * matching), each entry being the exact anchor that scrolls to it in the
 * builder, the published page and the static export ("#section-<id>" — the
 * id every renderer puts on its wrapper). Full URLs behave like a plain
 * input. Keyboard: Arrows navigate, Enter picks, Esc hides the list.
 */
export function AnchorLinkInput({ value, onChange, placeholder }: AnchorLinkInputProps) {
  const sections = usePortfolioStore((s) => s.portfolio.sections);
  const [focused, setFocused] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [active, setActive] = React.useState(0);

  const options = React.useMemo(() => {
    if (!value.startsWith('#')) return [];
    const q = value.slice(1).replace(/^section-/i, '').trim().toLowerCase();
    const all = sections
      .filter((sec: any) => sec.visible !== false)
      .map((sec: any) => ({ id: sec.id, title: (sec.title || sec.type) as string, type: sec.type as string }));
    const matches = all.filter((o) => !q || o.title.toLowerCase().includes(q) || o.type.toLowerCase().includes(q) || `section-${o.id}`.includes(q));
    // When the current value matches nothing (e.g. a dead #section-<deletedId>
    // link) still offer the full list so the user can re-pick a live target.
    return matches.length || !q ? matches : all;
  }, [sections, value]);

  // Dead-anchor warning: value points at "#(section-)<id>" that is no longer a
  // visible section id or section type.
  const deadTarget = React.useMemo(() => {
    if (!value.startsWith('#')) return false;
    const q = value.slice(1).replace(/^section-/i, '').trim().toLowerCase();
    if (!q) return false;
    return !sections.some((sec: any) => sec.visible !== false
      && (String(sec.id).toLowerCase() === q || String(sec.type).toLowerCase() === q));
  }, [sections, value]);

  const open = focused && !dismissed && value.startsWith('#') && options.length > 0;

  const pick = (id: string) => {
    onChange(`#section-${id}`);
    setDismissed(true);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        placeholder={placeholder || '#about or https://example.com'}
        className={deadTarget ? 'border-red-400 focus-visible:ring-red-300' : undefined}
        onChange={(e) => { onChange(e.target.value); setActive(0); setDismissed(false); }}
        onFocus={() => { setFocused(true); setDismissed(false); }}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % options.length); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + options.length) % options.length); }
          else if (e.key === 'Enter') { e.preventDefault(); pick(options[Math.min(active, options.length - 1)].id); }
          else if (e.key === 'Escape') { setDismissed(true); }
        }}
      />
      {deadTarget && !open && (
        <p className="mt-1 text-[11px] font-medium text-red-500">
          Target section no longer exists — click the field and pick a new one.
        </p>
      )}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Scroll to a section on this page
          </p>
          {options.map((o, i) => (
            <button
              key={o.id}
              type="button"
              // mousedown+preventDefault fires before the input's blur, so
              // the click is never swallowed by closing the list first.
              onMouseDown={(e) => { e.preventDefault(); pick(o.id); }}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-sm ${i === active ? 'bg-violet-50 text-violet-700' : 'text-gray-700'}`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-1.5">
                <span className="truncate font-medium">{o.title}</span>
                <span className="flex-shrink-0 rounded bg-gray-100 px-1 py-0.5 text-[10px] text-gray-500">{o.type}</span>
              </span>
              {i === active && <CornerDownLeft className="h-3 w-3 flex-shrink-0 text-violet-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
