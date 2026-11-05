/** Place saved tiles in vertical order, pushing collisions below measured content.
 * New tiles start on their own rows after the saved layout.
 */
export function placePageGridRows<T extends { x: number; y: number; w: number; h: number }>(
  entries: { item: T; placed: boolean; savedY: number }[],
): T[] {
  const placed: T[] = [];
  const saved = entries.filter(entry => entry.placed)
    .sort ( (a, b) => a.savedY - b.savedY );
  for (const entry of saved) {
    const item = entry.item;
    item.y = Math.max(0, Math.round(entry.savedY));
    // Earlier items are already collision-free. Moving below one can expose
    // another collision, so repeat until the full rectangle is clear.
    let moved: boolean;
    do {
      moved = false;
      for (const other of placed) {
        if (item.x < other.x + other.w && item.x + item.w > other.x &&
            item.y < other.y + other.h && item.y + item.h > other.y) {
          item.y = other.y + other.h;
          moved = true;
        }
      }
    } while (moved);
    placed.push(item);
  }
  let nextRow = placed.reduce((bottom, item) => Math.max(bottom, item.y + item.h), 0);
  for (const entry of entries) {
    if (entry.placed) continue;
    entry.item.y = nextRow;
    nextRow += entry.item.h;
  }
  return entries.map(entry => entry.item);
}
/** Reorder the rows crossed by the leading edge of a dragged tile. */
export function reorderPageGridDrop<T extends { i: string; x: number; y: number; w: number; h: number }>(
  original: readonly T[], dropped: T,
): T[] {
  const items = original.map(item => ({ ...item }));
  const moving = items.find(item => item.i === dropped.i);
  if (!moving) return items;
  const startY = moving.y;
  const upward = dropped.y < startY;
  const downward = dropped.y > startY;
  const crossed = items.filter(item => {
    if (item.i === moving.i || dropped.x >= item.x + item.w || dropped.x + dropped.w <= item.x) return false;
    const midpoint = item.y + item.h / 2;
    return upward ? midpoint < startY && dropped.y <= midpoint
      : downward ? midpoint > startY + moving.h && dropped.y + dropped.h >= midpoint
      : false;
  }).sort((a, b) => a.y - b.y);
  moving.x = dropped.x;
  if (!crossed.length) {
    moving.y = dropped.y;
  } else {
    const row = [...crossed, moving].sort((a, b) => a.y - b.y);
    const start = row[0].y;
    const ordered = upward ? [moving, ...crossed] : [...crossed, moving];
    let y = start;
    for (const item of ordered) {
      item.y = y;
      y += item.h;
    }
  }
  return placePageGridRows(items.map(item => ({ item, placed: true, savedY: item.y })));
}