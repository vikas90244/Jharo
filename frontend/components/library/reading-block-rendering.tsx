"use client" 
import Image from "next/image";
import { ReadingBlock
 } from "./page-render";
import styles from './page-render.module.scss';
import type {  ImageBlock, TextBlock } from '@/lib/feature/library';
import { getTextFontSize } from './utility';

import { memo } from "react";

const ImageBlockRender = memo(({ block }: { block: ImageBlock }) => {
  // Extract image dimensions from bounding box
  const [x0, y0, x1, y1] = block.bbox;
  const width = x1 - x0;
  const height = y1 - y0;

  return (
    <div className={styles.imageBlockWrapper}>
      <Image
        src={block.src}
        alt=""
        width={width}
        height={height}
        unoptimized
        className={styles.imageBlock}
        priority={false}
        quality={90}
      />
    </div>
  );
});

ImageBlockRender.displayName = 'ImageBlockRender'

// TEXT BLOCK COMPONENT
// Renders paragraphs with clickable words

const TextBlockRender = memo(
  ({ block, pageId, viewportWidth, onWordClick, isHeading }: { 
    block: TextBlock; 
    pageId: number;
    viewportWidth: number;
    onWordClick: (word: string, x: number, y: number) => void;
    isHeading?: boolean;
  }) => {
    //  Combine all text from all lines into one paragraph
    const blockText = block.lines
      .map(line => line.spans.map(span => span.text).join(''))
      .join(' ');
    
    const increasedFontSize = getTextFontSize(block, viewportWidth);

    // Split text into individual words (keep spaces)
    const words = blockText.split(/(\s+)/); // Regex keeps the spaces

    // Handler when user clicks a word
    const handleWordClick = (word: string, event: React.MouseEvent) => {
      // Only handle actual words, not spaces
      if (word.trim()) {
        // Get position of the word that was clicked
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        onWordClick(word.trim(), rect.left, rect.bottom + 5);
      }
    };

    return (
      <p
        key={`${pageId}-${block.number}`}
        className={`${styles.textBlock} ${isHeading ? styles.chapterHeading : ''}`}
        style={{
          fontSize: increasedFontSize,
        }}
      >
        {/* Render each word as clickable or space as regular text */}
        {words.map((word, index) => {
          // If it's just whitespace, render as regular text
          if (!word.trim()) {
            return <span key={index}>{word}</span>;
          }
          
          // Otherwise, make it clickable
          return (
            <span
              key={index}
              className={styles.clickableWord}
              onClick={(e) => handleWordClick(word, e)}
            >
              {word}
            </span>
          );
        })}
      </p>
    );
  }
);

TextBlockRender.displayName = 'TextBlockRender';


interface ReadingBlockRenderProps {
  readingBlock: ReadingBlock;
  viewportWidth: number;
  onWordClick?: (word: string, x: number, y: number) => void;
}

export const ReadingBlockRender = memo(
  ({
    readingBlock,
    viewportWidth,
    onWordClick,
  }: ReadingBlockRenderProps) => {
    const { block, pageId, isHeading } = readingBlock;

    if (block.type === 1) {
      return <ImageBlockRender block={block} />;
    }

    if (block.type === 0) {
      return (
        <TextBlockRender
          block={block}
          pageId={pageId}
          viewportWidth={viewportWidth}
          onWordClick={onWordClick ?? (() => {})}
          isHeading={isHeading}
        />
      );
    }

    return null;
  }
);

ReadingBlockRender.displayName = "ReadingBlockRender";
