import styles from "@/app/library/library.module.scss";

export function LibraryIntro() {
  return (
    <header className={styles.header}>
      {/* <div className={styles.eyebrow}>YOUR READING SPACE</div> */}
      <h1 className={styles.title}>My Library</h1>
      <p className={styles.subtitle}>Upload PDF books, read them in Jharo, and review your reading activity.</p>
    </header>
  );
}
