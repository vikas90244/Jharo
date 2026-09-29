import React from 'react';
import styles from './page-skeleton.module.scss';

interface PageSkeletonProps {
  count?: 1 | 2;
}

export function PageSkeleton({ count = 2 }: PageSkeletonProps) {
  return (
    <div className={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.pageSkeleton}>
          <div className={styles.skeletonContent}>
            {/* Header lines */}
            <div className={styles.skeletonHeader}>
              <div className={`${styles.skeletonLine} ${styles.wide}`} />
              <div className={`${styles.skeletonLine} ${styles.medium}`} />
            </div>

            {/* Body content */}
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.short}`} />
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.medium}`} />
            </div>

            {/* Image placeholder */}
            <div className={styles.skeletonImage} />

            {/* More body content */}
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.medium}`} />
              <div className={styles.skeletonLine} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
