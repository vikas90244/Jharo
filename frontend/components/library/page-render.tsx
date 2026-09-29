import React, { memo, useMemo, useState } from 'react';
import styles from './page-render.module.scss';
import { Block } from '@/lib/feature/library';
import { ReadingBlockRender } from './reading-block-rendering';

interface PageRenderProps {
  blocks: ReadingBlock[];
  viewportWidth: number;
}

export interface ReadingBlock {
  block: Block;
  pageId: number;
  pageWidth: number;
  pageHeight: number;
  isHeading?: boolean;
}

export interface ReadingPageType {
  blocks: ReadingBlock[];
  startpage: number;
  endpage: number;
}

interface WordPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
}

// WORD POPUP COMPONENT
// Shows definition when user clicks a word

const WordPopup = memo(({ word, position, onClose }: WordPopupProps) => {
  // Track where popup should appear (might adjust based on screen space)
  const [popupPosition, setPopupPosition] = useState({ 
    x: position.x, 
    y: position.y 
  });
  
  // Track if popup is above or below the word
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  
  // Reference to the popup element so we can measure it
  const popupRef = React.useRef<HTMLDivElement>(null);

  // After popup renders, calculate best position to keep it on screen
  React.useEffect(() => {
    if (!popupRef.current) return;

    const popup = popupRef.current;
    const popupHeight = popup.offsetHeight;
    const popupWidth = popup.offsetWidth;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let x = position.x;
    let y = position.y;
    let newPlacement: 'bottom' | 'top' = 'bottom';

    // Calculate space above and below the word
    const spaceBelow = viewportHeight - position.y;
    const spaceAbove = position.y;

    // Decide: show popup above or below the word?
    if (spaceBelow < popupHeight + 20 && spaceAbove > spaceBelow) {
      // Not enough space below, show ABOVE the word
      y = position.y - popupHeight - 10;
      newPlacement = 'top';
    } else {
      // Show BELOW the word (default)
      y = position.y + 5;
      newPlacement = 'bottom';
    }

    // Make sure popup doesn't go off the right edge
    if (x + popupWidth > viewportWidth - 20) {
      x = viewportWidth - popupWidth - 20;
    }
    
    // Make sure popup doesn't go off the left edge
    if (x < 20) {
      x = 20;
    }

    // Update popup position and placement
    setPopupPosition({ x, y });
    setPlacement(newPlacement);
  }, [position.x, position.y]);

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
          <button className={styles.popupClose} onClick={onClose}>×</button>
        </div>
        
        {/* Content area (definition and example) */}
        <div className={styles.popupContent}>
          <p className={styles.popupDefinition}>
            <strong>Definition:</strong> This will show the meaning of `{word}`.
          </p>
          <p className={styles.popupExample}>
            <strong>Example:</strong> Sample sentence using `{word}` will appear here.
          </p>
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
  // Track which word is currently selected (for showing popup)
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    x: number;
    y: number;
  } | null>(null);

  // When user clicks a word, save it to show popup
  const handleWordClick = (word: string, x: number, y: number) => {
    setSelectedWord({ word, x, y });
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
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}

export default memo(PageRender);
