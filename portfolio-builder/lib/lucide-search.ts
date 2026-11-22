// Finds a Lucide icon for a label using Lucide's own tags (https://lucide.dev/icons/, ISC licence).
// lucide-tags.json is a copy of lucide-static's tags.json at the version pinned in LUCIDE_VERSION.
import tags from './lucide-tags.json';

export const LUCIDE_VERSION = '0.468.0';

const STOP_WORDS = new Set(['and', 'the', 'of', 'for', 'with', 'in', 'on', 'a', 'an', 'to', 'at', 'by', 'our', 'my']);

const tagIndex: Record<string, string[]> = tags;

// Plural to singular, so "awards" matches "award" and "countries" matches "country".
function singular(word: string): string {
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (/(ses|xes|ches|shes)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

/** Words of a label that can match an icon, longest first. */
export function labelWords(label: string): string[] {
  const words = label
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return [...new Set(words.flatMap((w) => [w, singular(w)]))].sort((a, b) => b.length - a.length);
}

/**
 * Best Lucide icon name for a label, or null. Each label word scores on the icon name (3) or an exact
 * tag word (2). Icons whose name matches more words win; ties go to the shorter name.
 */
export function bestLucideIcon(label: string): string | null {
  const words = labelWords(label);
  if (words.length === 0) return null;

  let best: { name: string; score: number } | null = null;
  for (const [name, iconTags] of Object.entries(tagIndex)) {
    const nameParts = name.split('-');
    let score = 0;
    for (const word of words) {
      if (nameParts.includes(word)) score += 3;
      else if (iconTags.some((t) => t.split(/\s+/).includes(word))) score += 2;
    }
    if (score === 0) continue;
    if (!best || score > best.score || (score === best.score && name.length < best.name.length)) {
      best = { name, score };
    }
  }
  return best?.name ?? null;
}

/** SVG file for an icon, served by unpkg (CORS enabled). */
export function lucideSvgUrl(name: string): string {
  return `https://unpkg.com/lucide-static@${LUCIDE_VERSION}/icons/${name}.svg`;
}
