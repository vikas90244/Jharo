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
  RefreshCw,
} from "lucide-react";
import styles from "./library-content.module.scss";
import { prepareReadingPages } from "./reading-pages";
import { localDateString, recordPageRead } from "@/lib/feature/activity";

const PAGE_READ_THRESHOLD_MS = 90 * 1000;

function ResourceContent({ bookId = 1 }: { bookId?: number }) {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement>(null);

  const [currentRenderedPage, setCurrentRenderedPage] = useState(0);
  const [pendingBookPage, setPendingBookPage] = useState<number | null>(null);
  const [resumeReadyBookId, setResumeReadyBookId] = useState<number | null>(null);

  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const [loadedPageRange, setLoadedPageRange] = useState({
    start: 0,
    end: 15,
  });
  const recordedPageVisit = useRef<string | null>(null);
  const hasResumedPage = useRef(false);

  const {
    data: content,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
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

    const updateViewportSize = () => setViewportSize({
      width: viewport.clientWidth,
      height: viewport.clientHeight,
    });

    updateViewportSize();

    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, [isLoading]);



  const readingPages = useMemo(
    () => prepareReadingPages(content ?? [], viewportSize.width, viewportSize.height),
    [content, viewportSize.width, viewportSize.height],
  );

  const renderedPageCount = readingPages.length;

  const lastRenderedPageIndex = Math.max(0, renderedPageCount - 1);
  const visiblePage = readingPages[currentRenderedPage];

  useEffect(() => {
    if (!visiblePage || isLoading || isPlaceholderData) return;

    const visitKey = `${bookId}:${visiblePage.endpage}`;
    if (recordedPageVisit.current === visitKey) return;

    let elapsedMs = 0;
    let activeSince = document.hidden ? null : Date.now();
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const elapsed = elapsedMs + (activeSince ? Date.now() - activeSince : 0);
      if (elapsed < PAGE_READ_THRESHOLD_MS) return;

      recordedPageVisit.current = visitKey;
      window.clearInterval(timer);
      void recordPageRead(bookId, visiblePage.endpage + 1, localDateString()).catch(() => undefined);
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.hidden && activeSince) {
        elapsedMs += Date.now() - activeSince;
        activeSince = null;
      } else if (!document.hidden && !activeSince) {
        activeSince = Date.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [bookId, visiblePage?.endpage, isLoading, isPlaceholderData]);

  useEffect(() => {
    setCurrentRenderedPage((pageIndex) =>
      Math.min(pageIndex, lastRenderedPageIndex)
    );
  }, [lastRenderedPageIndex]);

  useEffect(() => {
    if (
      pendingBookPage === null ||
      isPlaceholderData ||
      pendingBookPage < loadedPageRange.start ||
      pendingBookPage > loadedPageRange.end
    ) return;
    const matchingIndex = readingPages.findIndex(
      (page) => pendingBookPage >= page.startpage && pendingBookPage <= page.endpage,
    );
    const previousIndex = readingPages.reduce(
      (result, page, index) => page.endpage <= pendingBookPage ? index : result,
      -1,
    );
    const nextIndex = readingPages.findIndex((page) => page.startpage > pendingBookPage);
    const renderedIndex = matchingIndex >= 0
      ? matchingIndex
      : previousIndex >= 0 ? previousIndex : nextIndex;
    if (renderedIndex >= 0) {
      setCurrentRenderedPage(renderedIndex);
      hasResumedPage.current = true;
      setPendingBookPage(null);
    }
  }, [pendingBookPage, readingPages, isPlaceholderData, loadedPageRange]);

  useEffect(() => {
    if (!hasResumedPage.current) setCurrentRenderedPage(0);
  }, [bookId, viewportSize.width, viewportSize.height]);

  useEffect(() => {
    hasResumedPage.current = false;
    setCurrentRenderedPage(0);
    setLoadedPageRange({ start: 0, end: 15 });
    setPendingBookPage(null);
    setResumeReadyBookId(null);
  }, [bookId]);

  useEffect(() => {
    if (!resource) return;

    const storageKey = `jharo:reading-progress:${bookId}`;
    const storedPage = window.localStorage.getItem(storageKey);
    const savedPage = storedPage === null ? null : Number(storedPage);
    const lastBookPage = Math.max(resource.no_of_pages - 1, 0);

    setResumeReadyBookId(bookId);
    if (savedPage === null || !Number.isInteger(savedPage) || savedPage <= 0) return;

    const targetPage = Math.min(savedPage, lastBookPage);
    const start = Math.max(0, targetPage - 5);
    const end = Math.min(targetPage + 5, lastBookPage);
    setPendingBookPage(targetPage);
    setLoadedPageRange({ start, end });
  }, [bookId, resource?.no_of_pages]);

  useEffect(() => {
    if (
      !visiblePage ||
      isLoading ||
      isPlaceholderData ||
      pendingBookPage !== null ||
      resumeReadyBookId !== bookId
    ) return;

    window.localStorage.setItem(
      `jharo:reading-progress:${bookId}`,
      String(visiblePage.startpage),
    );
  }, [bookId, visiblePage?.startpage, isLoading, isPlaceholderData, pendingBookPage, resumeReadyBookId]);

  const goToNextRenderedPage = useCallback(() => {
    if (isFetching) return;
    if (currentRenderedPage < lastRenderedPageIndex) {
      setCurrentRenderedPage((pageIndex) => pageIndex + 1);
      return;
    }
    if (loadedPageRange.end >= bookPageCount - 1) return;

    const start = loadedPageRange.end + 1;
    setPendingBookPage(start);
    setLoadedPageRange({
      start,
      end: Math.min(start + 10, bookPageCount - 1),
    });
  }, [isFetching, currentRenderedPage, lastRenderedPageIndex, loadedPageRange.end, bookPageCount]);

  const goToPreviousRenderedPage = useCallback(() => {
    if (isFetching) return;
    if (currentRenderedPage > 0) {
      setCurrentRenderedPage((pageIndex) => pageIndex - 1);
      return;
    }
    if (loadedPageRange.start === 0) return;

    const end = loadedPageRange.start - 1;
    setPendingBookPage(end);
    setLoadedPageRange({
      start: Math.max(0, end - 10),
      end,
    });
  }, [isFetching, currentRenderedPage, loadedPageRange.start]);

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
      <main className={styles.statePage} role="status" aria-label="Loading book">
        <div className={styles.stateContent}>
          <div className={styles.stateBrand}>JHARO · READER</div>
          <h1 className={styles.stateTitle}>Opening your book</h1>
          <p className={styles.stateDescription}>Preparing the pages for your reading space.</p>
          <div className={styles.loadingPreview}><PageSkeleton count={1} /></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.statePage}>
        <section className={styles.errorCard} role="alert">
          <div className={styles.stateIcon}><BookOpen size={28} /></div>
          <div className={styles.stateBrand}>JHARO · READER</div>
          <h1 className={styles.stateTitle}>This book couldn’t be opened</h1>
          <p className={styles.stateDescription}>
            {error instanceof Error ? error.message : "There was a problem loading the pages. Please try again."}
          </p>
          <div className={styles.stateActions}>
            <button className={styles.retryButton} onClick={() => void refetch()}>
              <RefreshCw size={16} /> Try again
            </button>
            <button className={styles.backButton} onClick={() => router.push("/library")}>
              Back to library
            </button>
          </div>
        </section>
      </main>
    );
  }

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
          disabled={isFetching || (currentRenderedPage === 0 && loadedPageRange.start === 0)}
          aria-label="Previous page"
        >
          <ChevronLeft size={28} strokeWidth={1.5} />
        </button>

        <button
          className={`${styles.navOverlay} ${styles.navOverlayRight}`}
          onClick={goToNextRenderedPage}
          disabled={
            isFetching || (currentRenderedPage >= lastRenderedPageIndex &&
            loadedPageRange.end >= bookPageCount - 1)
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

