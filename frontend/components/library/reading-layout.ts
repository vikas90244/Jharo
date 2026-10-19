import type { Block } from "@/lib/feature/library";

function getContentWidth(viewportWidth: number): number {
  const sidePadding = viewportWidth <= 768 ? 24 : 48;
  return Math.max(viewportWidth - sidePadding, 240);
}

/** Estimate one whole block's rendered height; text lines are never split. */
export function estimateBlockHeight(
  block: Block,
  pageWidth: number,
  viewportWidth: number,
  viewportHeight: number,
): number {
  const sourceHeight = Math.max(block.bbox[3] - block.bbox[1], 1);
  const widthScale = getContentWidth(viewportWidth) / Math.max(pageWidth, 1);
  const renderedHeight = sourceHeight / widthScale;

  if (block.type === 1) {
    const imageHeightLimit = viewportHeight * (viewportWidth <= 768 ? 1 : 0.7);
    return Math.min(renderedHeight, imageHeightLimit) + 48;
  }

  // Leave extra breathing room because the reader reflows PDF lines to its own width.
  return renderedHeight * 1.42 + 24;
}
