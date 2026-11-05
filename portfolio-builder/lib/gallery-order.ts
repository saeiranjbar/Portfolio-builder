// Find the incomplete row that leaves the most similar images together in full rows.
export function groupGalleryByRatio<T>(items: T[], columns: number, ratioOf: (item: T) => number): T[] {
  if (columns <= 1 || items.length <= columns) return items;
  const sorted = items.map((item, index) => ({ item, index, ratio: ratioOf(item) }))
    .sort((a, b) => a.ratio - b.ratio || a.index - b.index);
  const remainder = sorted.length % columns;
  if (!remainder) return sorted.map(entry => entry.item);

  let best = sorted;
  let bestScore = Infinity;
  for (let start = 0; start <= sorted.length - remainder; start++) {
    const partial = sorted.slice(start, start + remainder);
    const full = [...sorted.slice(0, start), ...sorted.slice(start + remainder)];
    let score = 0;
    for (let i = 0; i < full.length; i += columns) {
      const group = full.slice(i, i + columns);
      const known = group.filter(entry => Number.isFinite(entry.ratio));
      if (known.length > 1) score += known[known.length - 1].ratio - known[0].ratio;
      if (known.length && known.length !== group.length) score += 1000;
    }
    const knownPartial = partial.filter(entry => Number.isFinite(entry.ratio));
    if (knownPartial.length > 1) score += knownPartial[knownPartial.length - 1].ratio - knownPartial[0].ratio;
    if (knownPartial.length && knownPartial.length !== partial.length) score += 1000;
    if (score < bestScore) {
      bestScore = score;
      best = [...full, ...partial];
    }
  }
  return best.map(entry => entry.item);
}
