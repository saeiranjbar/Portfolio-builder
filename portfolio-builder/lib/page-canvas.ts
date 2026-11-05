// The builder canvas (the element that actually scrolls) is registered here so
// the background settings panel can read the page's Y coordinates without
// prop-drilling a ref through the whole editor tree. Switch points for the
// background reel are stored in this element's scroll space, which is also the
// Y axis the canvas rulers use.

let canvas: HTMLElement | null = null;

export function setBuilderPageCanvas(element: HTMLElement | null) {
  canvas = element;
}

export function getBuilderPageCanvas(): HTMLElement | null {
  return canvas;
}

/** Current scroll position of the canvas, in pixels from the top of the page. */
export function getBuilderPageScrollTop(): number {
  return canvas ? Math.round(canvas.scrollTop) : 0;
}

/** Scrollable height of the canvas: how far the page can be scrolled at all. */
export function getBuilderPageRange(): { scrollTop: number; scrollRange: number; pageHeight: number } {
  if (!canvas) return { scrollTop: 0, scrollRange: 0, pageHeight: 0 };
  return {
    scrollTop: Math.round(canvas.scrollTop),
    scrollRange: Math.max(0, Math.round(canvas.scrollHeight - canvas.clientHeight)),
    pageHeight: Math.round(canvas.scrollHeight),
  };
}
