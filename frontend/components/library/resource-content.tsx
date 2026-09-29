"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  useGetResourceRange,
  useMyResources,
} from "@/hooks/use-library";
import { useSwipe } from "@/hooks/use-swipe";
import PageRender from "./page-render";
import { ReaderControls } from "./reader-controls";
import { PageSkeleton } from "./page-skeleton";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  X,
} from "lucide-react";
import styles from "./library-content.module.scss";
import { paginateBlocks } from "./utility";

function ResourceContent({ bookId = 1 }: { bookId?: number }) {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement>(null);

  const [currentRenderedPage, setCurrentRenderedPage] = useState(0);
  const [pendingBookPage, setPendingBookPage] = useState<number | null>(null);

  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  const [loadedPageRange, setLoadedPageRange] = useState({
    start: 0,
    end: 15,
  });

  const {
    data: content,
    isLoading,
    error,
  } = useGetResourceRange({
    id: bookId,
    start: loadedPageRange.start,
    end: loadedPageRange.end,
  });

  const { data: resources } = useMyResources();

  const resource = resources?.find(
    (resource) => resource.id === bookId
  );

  const bookTitle = resource?.title || "Untitled book";

  const bookPageCount = resource?.no_of_pages ?? loadedPageRange.end;
  useEffect(() => {
    if (isLoading) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateViewportSize = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    updateViewportSize();

    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, [isLoading]);



  const readingPages = useMemo(() => {
    return paginateBlocks( content || [], viewportSize.width, viewportSize.height);
  }, [ content, viewportSize.width, viewportSize.height]
);

  const renderedPageCount = readingPages.length;

  const lastRenderedPageIndex = Math.max(0, renderedPageCount - 1);

  useEffect(() => {
    setCurrentRenderedPage((pageIndex) =>
      Math.min(pageIndex, lastRenderedPageIndex)
    );
  }, [lastRenderedPageIndex]);

  useEffect(() => {
    if (pendingBookPage === null) return;
    const renderedIndex = readingPages.findIndex(
      (page) => pendingBookPage >= page.startpage && pendingBookPage <= page.endpage,
    );
    if (renderedIndex >= 0) {
      setCurrentRenderedPage(renderedIndex);
      setPendingBookPage(null);
    }
  }, [pendingBookPage, readingPages]);

  useEffect(() => {
    setCurrentRenderedPage(0);
  }, [
    bookId,
    viewportSize.width,
    viewportSize.height,
  ]);

  const goToNextRenderedPage = useCallback(() => {
    if (currentRenderedPage === lastRenderedPageIndex){
       setLoadedPageRange((prev)=> {
        return {start:prev.end + 1, end:Math.min(prev.end + 11, bookPageCount - 1)}
    })
    } else{
      setCurrentRenderedPage((pageIndex) =>
      Math.min(pageIndex + 1, lastRenderedPageIndex)
    );
    }

    
  }, [lastRenderedPageIndex, currentRenderedPage, bookPageCount]);

  const goToPreviousRenderedPage = useCallback(() => {
    setCurrentRenderedPage((pageIndex) =>
      Math.max(pageIndex - 1, 0)
    );
  }, []);

  const goToBookPage = useCallback(
    (percentage: number) => {
      const normalizedPercentage = Math.max(0, Math.min(percentage, 100));
      const bookPageIndex = Math.round(
        (normalizedPercentage / 100) * Math.max(bookPageCount - 1, 0),
      );
      const safeBookPageIndex = Math.max(
        0,
        Math.min(bookPageIndex, bookPageCount - 1)
      );

      // Fetch a section around the selected book page.
      const sectionStart = Math.max(
        0,
        safeBookPageIndex - 5
      );

      const sectionEnd = Math.min(
        bookPageCount - 1,
        safeBookPageIndex + 5
      );

      setLoadedPageRange({
        start: sectionStart,
        end: Math.min(sectionEnd, bookPageCount - 1),
      });

      // Backend PDF page_number values and reader controls are zero-based.
      setPendingBookPage(safeBookPageIndex);
    },
    [bookPageCount]
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goToPreviousRenderedPage();
      }

      if (event.key === "ArrowRight") {
        goToNextRenderedPage();
      }

      if (event.key === "Home") {
        goToBookPage(0);
      }

      if (event.key === "End") {
        goToBookPage(100);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    goToNextRenderedPage,
    goToPreviousRenderedPage,
    goToBookPage,
    bookPageCount,
  ]);

  const swipeHandlers = useSwipe({
    onSwipedLeft: goToNextRenderedPage,
    onSwipedRight: goToPreviousRenderedPage,
  });

  if (isLoading) {
    return (
      <div className={styles.readerContainer}>
        <div className={styles.readingArea}>
          <PageSkeleton count={1} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <BookOpen className={styles.errorIcon} />

        <p className={styles.errorText}>
          Failed to load book
        </p>

        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const visiblePage = readingPages[currentRenderedPage];
  const visibleBlocks = visiblePage?.blocks || [];

  return (
    <div className={styles.readerContainer}>
      <button
        className={styles.closeButton}
        onClick={() => router.push("/library")}
        aria-label="Back to library"
        title="Back to library"
      >
        <X size={18} strokeWidth={2} />
      </button>

      <div className={styles.bookTopBar}>
        <span>
          {bookTitle}
        </span>
      </div>

      <div
        className={styles.readingArea}
        ref={viewportRef}
        {...swipeHandlers}
      >
        <div className={styles.pagesContainer}>
          <div
            className={styles.pageWrapper}
            key={`reading-page-${currentRenderedPage}`}
          >
            <PageRender
              blocks={visibleBlocks}
              viewportWidth={viewportSize.width}
            />
          </div>
        </div>

        <button
          className={`${styles.navOverlay} ${styles.navOverlayLeft}`}
          onClick={goToPreviousRenderedPage}
          disabled={currentRenderedPage === 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={28} strokeWidth={1.5} />
        </button>

        <button
          className={`${styles.navOverlay} ${styles.navOverlayRight}`}
          onClick={goToNextRenderedPage}
          disabled={
            currentRenderedPage >= lastRenderedPageIndex &&
            loadedPageRange.end >= bookPageCount - 1
          }
          aria-label="Next page"
        >
          <ChevronRight size={28} strokeWidth={1.5} />
        </button>
      </div>

      <ReaderControls
        currentBookPage={visiblePage?.endpage ?? 0}
        totalPages={bookPageCount}
        onPageChange={goToBookPage}
      />
    </div>
  );
}

export default ResourceContent;

