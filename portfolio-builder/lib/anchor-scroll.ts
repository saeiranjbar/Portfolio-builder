/**
 * Shared anchor resolver for "#section-<id>" / "#<type>" links produced by
 * AnchorLinkInput. Tries, in order:
 *  1. exact element id ("#section-3" on published pages & flow preview);
 *  2. "section-" prefixed id (hand-written links may omit it);
 *  3. [data-section-type] wrapper matching the raw id or full id;
 *  4. builder page canvas — no ids; tiles carry data-tk="<sectionId>||<slotKey>".
 * Returns null for malformed/unresolvable links so callers can fall back.
 */
export function resolveAnchorTarget(link: string | undefined): HTMLElement | null {
  if (!link || !link.startsWith('#') || link.length < 2) return null;
  const linkId = link.slice(1);
  if (!/^[\w-]+$/.test(linkId)) return null; // manual/unknown format
  const rawId = linkId.replace(/^section-/, '');
  const byId = document.getElementById(linkId) || document.getElementById(`section-${rawId}`);
  if (byId) return byId;
  for (const s of document.querySelectorAll('[data-section-type]')) {
    const ty = s.getAttribute('data-section-type');
    if (ty === linkId || ty === rawId) return s as HTMLElement;
  }
  return document.querySelector<HTMLElement>(`[data-tk^="${rawId}||"]`);
}
