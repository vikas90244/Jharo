import type { Page } from "@/lib/feature/library";
import type { ReadingBlock, ReadingPageType } from "./page-render";
import { orderAndJoinDropCaps } from "./reading-block-order";
import { isChapterStart, startsNewChapter } from "./reading-text";
import { estimateBlockHeight } from "./reading-layout";

/** Group whole text and image blocks into comfortable, scrollable reading pages. */
export function prepareReadingPages(
  pages: Page[],
  viewportWidth: number,
  viewportHeight: number,
): ReadingPageType[] {
  const fillRatio = viewportWidth <= 768 ? 1 : 0.7;
  const availableHeight = viewportHeight > 0
    ? Math.max(Math.floor(viewportHeight * fillRatio), 1)
    : 320;
  const readingPages: ReadingPageType[] = [];
  let currentPage: ReadingPageType | null = null;
  let currentHeight = 0;

  const finishCurrentPage = () => {
    if (!currentPage?.blocks.length) return;
    readingPages.push(currentPage);
    currentPage = null;
    currentHeight = 0;
  };

  const addBlock = (block: ReadingBlock, pageNumber: number) => {
    if (!currentPage) {
      currentPage = { blocks: [], startpage: pageNumber, endpage: pageNumber };
    }
    currentPage.blocks.push(block);
    currentPage.startpage = Math.min(currentPage.startpage, pageNumber);
    currentPage.endpage = Math.max(currentPage.endpage, pageNumber);
  };

  for (const page of pages) {
    const orderedBlocks = orderAndJoinDropCaps(page.data);

    for (const [index, { block, isDropCap }] of orderedBlocks.entries()) {
      const readingBlock: ReadingBlock = {
        block,
        pageId: page.id,
        isHeading: isChapterStart(block),
        isDropCap,
      };
      const blockHeight = estimateBlockHeight(block, page.width, viewportWidth, viewportHeight);
      const exceedsHeight = currentHeight + blockHeight > availableHeight;

      const startsChapter = startsNewChapter(block)
        || (index === 0 && readingBlock.isHeading);
      if (startsChapter && currentPage?.blocks.length) {
        finishCurrentPage();
      }

      // Start a new reading page before any block would make this one feel crowded.
      if (currentPage?.blocks.length && exceedsHeight) {
        finishCurrentPage();
      }

      addBlock(readingBlock, page.page_number);
      currentHeight += blockHeight;

      // A single oversized block can still scroll, but never pull more blocks into it.
      if (currentHeight >= availableHeight) finishCurrentPage();
    }
  }

  finishCurrentPage();
  return readingPages;
}
