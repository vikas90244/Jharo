import React from "react";
import styles from "./reader-controls.module.scss";

interface ReaderControlsProps {
  currentBookPage: number;
  totalPages: number;
  onPageChange: (percentage: number) => void;
}

export function ReaderControls({
  currentBookPage,
  totalPages,
  onPageChange,
}: ReaderControlsProps) {
  const progressPercentage = totalPages > 0
    ? Math.min(100, ((currentBookPage + 1) / totalPages) * 100)
    : 0;

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.pageInfo}>
        <span className={styles.currentPage}>
          {progressPercentage.toFixed(1)} %
        </span>
      </div>

      <div className={styles.progressWrapper}>
        <div className={styles.progressContainer}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          />

          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progressPercentage}
            onChange={(event) => onPageChange(Number(event.target.value))}
            className={styles.progressSlider}
            aria-label="Navigate book progress"
          />
        </div>
      </div>
    </div>
  );
}
