"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BookOpen, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Resource } from "@/lib/feature/library";
import styles from "@/app/library/library.module.scss";

interface BookCollectionProps {
  books: Resource[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpenBook: (id: number) => void;
}

export function BookCollection({ books, isLoading, isError, onRetry, onOpenBook }: BookCollectionProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ start: true, end: true });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateScrollState = () => {
      setScrollState({
        start: rail.scrollLeft <= 1,
        end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1,
      });
    };

    updateScrollState();
    rail.addEventListener("scroll", updateScrollState);
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [books.length, isLoading, isError]);

  const scrollBooks = (direction: -1 | 1) => {
    railRef.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  };

  return (
    <section className={styles.booksSection} aria-labelledby="books-title">
      <div className={styles.sectionHeading}>
        <div>
          <div className={styles.eyebrow}>COLLECTION</div>
          <h2 id="books-title" className={styles.sectionTitle}>Your library</h2>
        </div>
        <div className={styles.collectionActions}>
          <span className={styles.bookCount}>{books.length} {books.length === 1 ? "book" : "books"}</span>
          {books.length > 1 && !isLoading && !isError && (
            <div className={styles.sliderControls}>
              <Button type="button" variant="outline" size="icon" onClick={() => scrollBooks(-1)} disabled={scrollState.start} aria-label="Previous books">
                <ChevronLeft size={18} />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => scrollBooks(1)} disabled={scrollState.end} aria-label="More books">
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingState} role="status">
          <Loader2 className={styles.spinner} size={32} />
          <p>Gathering your books…</p>
        </div>
      ) : isError ? (
        <div className={styles.stateCard} role="alert">
          <BookOpen size={32} />
          <h3>Your library didn’t load</h3>
          <p>Check your connection and try again.</p>
          <Button variant="outline" onClick={onRetry}><RefreshCw size={16} /> Try again</Button>
        </div>
      ) : books.length === 0 ? (
        <div className={styles.stateCard}>
          <BookOpen size={36} />
          <h3>Your shelves are ready</h3>
          <p>Add a PDF above and it will appear here.</p>
        </div>
      ) : (
        <div className={styles.booksRail} ref={railRef} role="region" aria-label="Your book collection">
          <div className={styles.booksTrack}>
          {books.map((book) => {
            const ready = book.processing_status === "ready";
            return (
              <button
                type="button"
                key={book.id}
                className={styles.bookCard}
                onClick={() => ready && onOpenBook(book.id)}
                disabled={!ready}
                aria-label={ready ? `Read ${book.title}` : `${book.title}, ${book.processing_status}`}
              >
                <div className={styles.bookCover}>
                  {book.cover_image ? <Image src={book.cover_image} alt="" fill unoptimized sizes="(max-width: 700px) 44vw, 210px" /> : (
                    <div className={styles.placeholderCover}><BookOpen size={42} /></div>
                  )}
                  {!ready && <span className={`${styles.statusBadge} ${styles[book.processing_status]}`}>{book.processing_status}</span>}
                </div>
                <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  <p className={styles.bookMeta}>
                    {book.is_public ? "Community book · " : ""}
                    {book.no_of_pages > 0 ? `${book.no_of_pages} pages` : "Preparing your book"}
                  </p>
                </div>
              </button>
            );
          })}
          </div>
        </div>
      )}
    </section>
  );
}
