"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { BookCollection } from "@/components/library/book-collection";
import { BookUpload } from "@/components/library/book-upload";
import { LibraryIntro } from "@/components/library/library-intro";
import { LearningActivity } from "@/components/library/learning-activity";
import { useMyResources } from "@/hooks/use-library";
import styles from "./library.module.scss";

export default function LibraryPage() {
  const router = useRouter();
  const { data: books = [], isLoading, isError, refetch } = useMyResources();

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.library}>
        <LibraryIntro />
        <LearningActivity />
        <BookUpload />
        <BookCollection
          books={books}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          onOpenBook={(bookId) => router.push(`/library/resource/${bookId}`)}
        />
      </main>
    </div>
  );
}
