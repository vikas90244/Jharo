export const READING_FONT_SCALE = 1.18;
import { TextBlock, Page, Block,  } from "@/lib/feature/library";
import { ReadingBlock, ReadingPageType } from "./page-render";

export function getContentWidth(viewportWidth: number): number {
  return Math.max(viewportWidth - (viewportWidth <= 768 ? 24 : 48), 240);
}

export function getTextFontSize(block: TextBlock, viewportWidth: number): number {
  const spans = block.lines.flatMap((line) => line.spans);

  const averageSize = spans.length
    ? spans.reduce((sum, span) => sum + span.size, 0) / spans.length
    : 14;

  const scale = viewportWidth <= 768 ? 1.05 : 1.25;

  return Math.max(viewportWidth <= 768 ? 16 : 14, averageSize * scale);
}


export function getBlockHeight(
  block: Block,
  pageWidth: number,
  viewportWidth: number,
  viewportHeight: number,
): number {
  const [, y0, , y1] = block.bbox;

  const contentWidth = getContentWidth(viewportWidth);

  const layoutScale = contentWidth / Math.max(pageWidth, 1);

  const blockHeight = Math.max(y1 - y0, 1) / layoutScale;

  // Image
  if (block.type === 1) {
    const maxImageHeight =
      viewportWidth <= 768 ? viewportHeight * 0.62 : viewportHeight * 0.72;

    const renderedHeight = Math.min(blockHeight, maxImageHeight);

    return renderedHeight + 70;
  }

  // Text
  const lineHeight = getTextFontSize(block, viewportWidth)
    * (viewportWidth <= 768 ? 1.65 : 1.6);

  return (
    Math.max(
      blockHeight * READING_FONT_SCALE,
      block.lines.length * lineHeight,
    ) + 24
  );
}

export function isChapterStart(block: Block): boolean {
  if (block.type !== 0 || block.lines.length > 3) {
    return false;
  }

  const text = block.lines
    .map((line) => line.spans.map((span) => span.text).join(""))
    .join(" ")
    .trim();

  const letters = text.replace(/[^a-zA-Z]/g, "");

  const isShortHeading = text.length <= 100 && letters.length > 0;

  const isUppercaseHeading =
    isShortHeading && letters === letters.toUpperCase();

  const isBoldHeading = block.lines.some((line) =>
    line.spans.some((span) => (span.flags & 16) !== 0),
  );

  return (
    /^(chapter|part|book|prologue|epilogue|introduction|contents)\b/i.test(
      text,
    ) ||
    (isShortHeading && (isUppercaseHeading || isBoldHeading))
  );
}

function sliceTextBlock(block: TextBlock, start: number, end: number): TextBlock {
  const lines = block.lines.slice(start, end);

  return {
    ...block,
    lines,
    bbox: [
      block.bbox[0],
      lines[0].bbox[1],
      block.bbox[2],
      lines[lines.length - 1].bbox[3],
    ],
  };
}

export function paginateBlocks(
  pages: Page[],
  viewportWidth: number,
  viewportHeight: number,
): ReadingPageType[] {
  /*
   * viewportHeight is now the ACTUAL reading area's height.
   *
   * We no longer subtract 72px because the header and
   * controls live outside the measured reading area.
   */

  console.log("viewport width: ", viewportWidth)
  console.log("viewport Height: ", viewportHeight)
  const availableHeight = Math.max(
    viewportHeight - (viewportWidth <= 768 ? 78 : 0),
    420,
  );

  const readingPages: ReadingPageType[] = [];

  let currentPage: ReadingPageType | null = null;
  let currentHeight = 0;

  const pushPage = () => {
    if (!currentPage || currentPage.blocks.length === 0) {
      return;
    }

    readingPages.push(currentPage);

    currentPage = null;
    currentHeight = 0;
  };

  const addToCurrentPage = (block: ReadingBlock, pageNumber: number) => {
    if (!currentPage) {
      currentPage = { blocks: [], startpage: pageNumber, endpage: pageNumber };
    }
    currentPage.blocks.push(block);
    currentPage.startpage = Math.min(currentPage.startpage, pageNumber);
    currentPage.endpage = Math.max(currentPage.endpage, pageNumber);
  };

  pages.forEach((page) => {
    page.data.forEach((block, blockIndex) => {
      const readingBlock: ReadingBlock = {
        block,
        pageId: page.id,
        pageWidth: page.width,
        pageHeight: page.height,
        isHeading: isChapterStart(block),
      };

      const blockHeight = getBlockHeight(
        block,
        page.width,
        viewportWidth,
        viewportHeight,
      );
      console.log(`ln:133 utility.js:::: blockHeight calculated: ${blockHeight}`)
      /*
       * Keep chapter headings at the beginning
       * of a reading page.
       */
      if (blockIndex === 0 && currentPage?.blocks.length && isChapterStart(block)) {
        pushPage();
      }

      if (block.type === 0 && !isChapterStart(block) && block.lines.length > 1) {
        let lineStart = 0;

        while (lineStart < block.lines.length) {
          const remainingHeight = availableHeight - currentHeight;
          const firstLine = sliceTextBlock(block, lineStart, lineStart + 1);
          const firstLineHeight = getBlockHeight(
            firstLine,
            page.width,
            viewportWidth,
            viewportHeight,
          );

          if (currentPage?.blocks.length && firstLineHeight > remainingHeight) {
            pushPage();
            continue;
          }

          let lineEnd = lineStart;

          for (let candidateEnd = lineStart + 1; candidateEnd <= block.lines.length; candidateEnd += 1) {
            const candidate = sliceTextBlock(block, lineStart, candidateEnd);
            const candidateHeight = getBlockHeight(
              candidate,
              page.width,
              viewportWidth,
              viewportHeight,
            );

            if (candidateHeight <= remainingHeight || lineEnd === lineStart) {
              lineEnd = candidateEnd;
            } else {
              break;
            }
          }

          if (lineEnd === lineStart) {
            pushPage();
            continue;
          }

          const partialBlock = sliceTextBlock(block, lineStart, lineEnd);
          addToCurrentPage({
            ...readingBlock,
            block: partialBlock,
            isHeading: false,
          }, page.page_number);
          currentHeight += getBlockHeight(
            partialBlock,
            page.width,
            viewportWidth,
            viewportHeight,
          );
          lineStart = lineEnd;

          if (lineStart < block.lines.length) {
            pushPage();
          }
        }

        if (currentHeight >= availableHeight) {
          pushPage();
        }

        return;
      }

      /*
       * If the block doesn't fit in the remaining
       * space, move it to the next reading page.
       */
      if (
        currentPage?.blocks.length &&
        blockHeight > availableHeight - currentHeight
      ) {
        pushPage();
      }

      addToCurrentPage(readingBlock, page.page_number);
      currentHeight += blockHeight;

      /*
       * Current reading page is full.
       */
      if (currentHeight >= availableHeight) {
        pushPage();
      }
    });
  });

  pushPage();

  return readingPages;
}
