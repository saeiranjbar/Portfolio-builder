/** Read desktop positions as an order only; never write them back on mobile. */
export function orderMobileTiles<T>(tiles: T[], positionOf: (tile: T) => { x: number; y: number } | undefined): T[] {
  return tiles.map((tile, index) => ({ tile, index, position: positionOf(tile) }))
    .sort((a, b) => {
      if (!a.position) return b.position ? 1 : a.index - b.index;
      if (!b.position) return -1;
      return a.position.y - b.position.y || a.position.x - b.position.x || a.index - b.index;
    }).map(entry => entry.tile);
}
