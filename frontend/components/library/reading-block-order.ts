import type { Block, TextBlock } from "@/lib/feature/library";

export interface OrderedReadingBlock {
  block: Block;
  isDropCap: boolean;
}

/** Sort blocks by their page coordinates and join a detached drop cap to its word. */
export function orderAndJoinDropCaps(blocks: Block[]): OrderedReadingBlock[] {
  const sorted = blocks
    .map((block, index) => ({ block, index }))
    .sort((a, b) => a.block.bbox[1] - b.block.bbox[1]
      || a.block.bbox[0] - b.block.bbox[0]
      || a.index - b.index)
    .map(({ block }) => block);

  const ordered: OrderedReadingBlock[] = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];
    const dropCap = current.type === 0 && next?.type === 0
      ? joinDropCap(current, next)
      : null;

    if (dropCap) {
      ordered.push({ block: dropCap, isDropCap: true });
      index += 1;
    } else {
      ordered.push({ block: current, isDropCap: false });
    }
  }

  return ordered;
}

function joinDropCap(initialBlock: TextBlock, followingBlock: TextBlock): TextBlock | null {
  const initial = initialBlock.lines
    .flatMap((line) => line.spans.map((span) => span.text))
    .join("")
    .trim();
  const firstLine = followingBlock.lines[0];
  if (!firstLine) return null;

  const firstLineText = firstLine.spans.map((span) => span.text).join("").trim();
  const initialHeight = initialBlock.bbox[3] - initialBlock.bbox[1];
  const firstLineHeight = firstLine.bbox[3] - firstLine.bbox[1];
  const overlapsFirstLine = initialBlock.bbox[3] > firstLine.bbox[1]
    && initialBlock.bbox[1] < firstLine.bbox[3];
  const alignsAtDropCap = firstLine.bbox[0] >= initialBlock.bbox[0]
    && firstLine.bbox[0] - initialBlock.bbox[0] <= initialHeight * 1.8;
  const isDropCap = /^[A-Z]$/.test(initial)
    && /^[a-z]/.test(firstLineText)
    && overlapsFirstLine
    && alignsAtDropCap
    && initialHeight >= firstLineHeight * 1.5;

  if (!isDropCap) return null;

  const firstTextSpan = firstLine.spans.findIndex((span) => span.text.trim().length > 0);
  const lines = followingBlock.lines.map((line, lineIndex) => lineIndex === 0
    ? {
      ...line,
      spans: line.spans.map((span, spanIndex) => spanIndex === firstTextSpan
        ? { ...span, text: span.text.replace(/^(\s*)/, `$1${initial}`) }
        : span),
    }
    : line);

  return {
    ...followingBlock,
    bbox: [
      Math.min(initialBlock.bbox[0], followingBlock.bbox[0]),
      Math.min(initialBlock.bbox[1], followingBlock.bbox[1]),
      Math.max(initialBlock.bbox[2], followingBlock.bbox[2]),
      Math.max(initialBlock.bbox[3], followingBlock.bbox[3]),
    ],
    lines,
  };
}
