import React, { memo, useMemo, useState } from 'react';
import styles from './page-render.module.scss';
import { Block } from '@/lib/feature/library';
import { ReadingBlockRender } from './reading-block-rendering';
import { recordLearnedWord } from '@/lib/feature/activity';
import type { WordMeaningResult } from '@/lib/feature/activity';
import { X } from 'lucide-react';

interface PageRenderProps {
  blocks: ReadingBlock[];
  viewportWidth: number;
}

export interface ReadingBlock {
  block: Block;
  pageId: string;
  isHeading?: boolean;
  isDropCap?: boolean;
}

export interface ReadingPageType {
  blocks: ReadingBlock[];
  startpage: number;
  endpage: number;
}

interface WordPopupProps {
  word: string;
  position: { x: number; y: number };
  meaning: WordMeaningResult | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

// WORD POPUP COMPONENT
// Shows definition when user clicks a word

const WordPopup = memo(({ word, position, meaning, isLoading, error, onClose }: WordPopupProps) => {
  // Track where popup should appear (might adjust based on screen space)
  const [popupPosition, setPopupPosition] = useState({ 
    x: position.x, 
    y: position.y 
  });
  
  // Track if popup is above or below the word
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  
  // Reference to the popup element so we can measure it
  const popupRef = React.useRef<HTMLDivElement>(null);

  // Reposition after the definition loads or the popup size changes.
  React.useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;

    const updatePosition = () => {
      const popupHeight = popup.offsetHeight;
      const popupWidth = popup.offsetWidth;
      const edgePadding = 12;
      const spaceBelow = window.innerHeight - position.y;
      const spaceAbove = position.y;
      const showAbove = spaceBelow < popupHeight + 20 && spaceAbove > spaceBelow;
      const x = Math.min(Math.max(position.x, edgePadding), window.innerWidth - popupWidth - edgePadding);
      const desiredY = showAbove ? position.y - popupHeight - 10 : position.y + 5;
      const y = Math.min(Math.max(desiredY, edgePadding), window.innerHeight - popupHeight - edgePadding);

      setPopupPosition((current) => current.x === x && current.y === y ? current : { x, y });
      setPlacement(showAbove ? 'top' : 'bottom');
    };

    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(popup);
    window.addEventListener('resize', updatePosition);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
    };
  }, [position.x, position.y, meaning, isLoading, error]);

  return (
    <>
      {/* Dark backdrop behind popup (click to close) */}
      <div className={styles.popupBackdrop} onClick={onClose} />
      
      {/* The actual popup */}
      <div 
        ref={popupRef}
        className={`${styles.wordPopup} ${styles[`popup${placement.charAt(0).toUpperCase() + placement.slice(1)}`]}`}
        style={{
          left: popupPosition.x,
          top: popupPosition.y,
        }}
      >
        {/* Header with word and close button */}
        <div className={styles.popupHeader}>
          <h3 className={styles.popupWord}>{word}</h3>
          <button className={styles.popupClose} onClick={onClose} aria-label="Close meaning" title="Close"><X size={18} strokeWidth={2} /></button>
        </div>
        
        <div className={styles.popupContent}>
          {isLoading && <p className={styles.popupMessage}>Finding the meaning…</p>}
          {error && <p className={styles.popupMessage} role="alert">{error}</p>}
          {meaning && (
            <>
              {meaning.phonetic && <p className={styles.popupPhonetic}>{meaning.phonetic}</p>}
              <p className={styles.popupDefinition}>
                <strong>{meaning.part_of_speech || 'Meaning'}</strong>
                {meaning.definition}
              </p>
              {meaning.example && <p className={styles.popupExample}><strong>Example</strong>{meaning.example}</p>}
              {meaning.source_name && (
                <p className={styles.popupSource}>
                  Source: {meaning.source_url
                    ? <a href={meaning.source_url} target="_blank" rel="noreferrer">{meaning.source_name}</a>
                    : meaning.source_name}
                </p>
              )}
              <p className={styles.popupLearnedStatus}>
                {meaning.newly_learned ? 'New word learned' : 'Already learned today'}
                <span>{meaning.words_learned} learned today</span>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
});

WordPopup.displayName = 'WordPopup';

// 
// MAIN PAGE RENDER COMPONENT
// Renders one page with text blocks and images

function PageRender({ blocks, viewportWidth }: PageRenderProps) {
  const requestId = React.useRef(0);
  const [selectedWord, setSelectedWord] = useState<{
    id: number;
    word: string;
    x: number;
    y: number;
    meaning: WordMeaningResult | null;
    isLoading: boolean;
    error: string | null;
  } | null>(null);

  const handleWordClick = (word: string, x: number, y: number) => {
    const id = requestId.current + 1;
    requestId.current = id;
    setSelectedWord({ id, word, x, y, meaning: null, isLoading: true, error: null });

    void recordLearnedWord(word).then(
      (meaning) => setSelectedWord((current) => current?.id === id
        ? { ...current, meaning, isLoading: false }
        : current),
      (error: unknown) => setSelectedWord((current) => current?.id === id
        ? { ...current, isLoading: false, error: error instanceof Error ? error.message : 'Could not find this word.' }
        : current),
    );
  };

  // Close the popup
  const handleClosePopup = () => {
    setSelectedWord(null);
  };

  // Base font size for the page
  const pageStyle = useMemo(
    () => ({
      fontSize: '16px',
    } as React.CSSProperties),
    []
  );

  return (
    <div className={styles.pageContainer} style={pageStyle}>
      {/* Main content area with text and images */}
      <div className={styles.pageContent}>
        {/* Loop through all blocks in the page */}
        {blocks.map((readingBlock, blockIndex) => (
          <ReadingBlockRender
            key={`${readingBlock.pageId}-${readingBlock.block.number}-${blockIndex}`}
            readingBlock={readingBlock}
            viewportWidth={viewportWidth}
            onWordClick={handleWordClick}
          />
        ))}
      </div>
      
      {/* Show popup if a word is selected */}
      {selectedWord && (
        <WordPopup
          word={selectedWord.word}
          position={{ x: selectedWord.x, y: selectedWord.y }}
          meaning={selectedWord.meaning}
          isLoading={selectedWord.isLoading}
          error={selectedWord.error}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}

export default memo(PageRender);

