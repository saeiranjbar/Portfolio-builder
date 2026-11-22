'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

export const parseCommaList = (raw: string) => raw.split(',').map(w => w.trim()).filter(Boolean);
const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((w, i) => w === b[i]);

/**
 * Comma-separated text input for lists (typing words, tags).
 * The text is kept exactly as typed, so spaces inside an item survive while you type.
 * Only the parsed list is passed to onChange.
 */
export function CommaListInput({ values, onChange, placeholder, className }: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = React.useState(() => values.join(', '));

  // Resync only when the stored list changes from outside this input (for example
  // when the typing style is switched), never while the parsed list still matches.
  React.useEffect(() => {
    setDraft(current => (sameList(parseCommaList(current), values) ? current : values.join(', ')));
  }, [values]);

  return (
    <Input
      value={draft}
      className={className}
      placeholder={placeholder}
      onChange={(e) => {
        setDraft(e.target.value);
        onChange(parseCommaList(e.target.value));
      }}
    />
  );
}
