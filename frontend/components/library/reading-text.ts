import type { Block, TextBlock } from "@/lib/feature/library";

export function getTextFontSize(block: TextBlock, viewportWidth: number): number {
  const spans = block.lines.flatMap((line) => line.spans);
  const averageSize = spans.length
    ? spans.reduce((sum, span) => sum + span.size, 0) / spans.length
    : 14;
  const scale = viewportWidth <= 768 ? 1.05 : 1.25;
  const minimum = viewportWidth <= 768 ? 16 : 14;

  return Math.max(minimum, averageSize * scale);
}

export function isChapterStart(block: Block): boolean {
  if (block.type !== 0 || block.lines.length > 3) return false;

  const text = block.lines
    .map((line) => line.spans.map((span) => span.text).join(""))
    .join(" ")
    .trim();
  const letters = text.replace(/[^a-zA-Z]/g, "");
  const isShortHeading = text.length <= 100 && letters.length > 0;
  const isUppercaseHeading = isShortHeading && letters === letters.toUpperCase();
  const isBoldHeading = block.lines.some((line) =>
    line.spans.some((span) => (span.flags & 16) !== 0),
  );

  const hasChapterLabel = /^(chapter|part|book|prologue|epilogue|introduction|contents)\b/i.test(text);
  const hasNumberedChapterTitle = /^\d{1,3}(?:\.\d+)*\s+[A-Z]/.test(text);

  return hasChapterLabel
    || hasNumberedChapterTitle
    || (isShortHeading && (isUppercaseHeading || isBoldHeading));
}

export function startsNewChapter(block: Block): boolean {
  if (block.type !== 0) return false;
  const text = block.lines
    .map((line) => line.spans.map((span) => span.text).join(""))
    .join(" ")
    .trim();

  return /^(chapter|part|book|prologue|epilogue|introduction|contents)\b/i.test(text)
    || /^\d{1,3}(?:\.\d+)*\s+[A-Z]/.test(text);
}
