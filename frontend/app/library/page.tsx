'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { useMyResources, useUploadResource } from '@/hooks/use-library';
import { AppHeader } from '@/components/layout/app-header';
import styles from './library.module.scss';



export default function LibraryPage() {
  const router = useRouter();
  
  const { data: books = [], isLoading } = useMyResources();
  const uploadMutation = useUploadResource();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      uploadMutation.reset();
    } else {
      uploadMutation.reset();
      // We'll show this as an error
      uploadMutation.mutate({ title: '', object_path: file! }, {
        onError: () => {}
      });
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadMutation.mutate(
      {
        title: selectedFile.name.replace('.pdf', ''),
        object_path: selectedFile,
      },
      {
        onSuccess: () => {
          setSelectedFile(null); // Clear selection after successful upload
        },
      }
    );
  };

  
  const handleBookClick = (bookId: number) => {
    router.push(`/library/resource/${bookId}`);
  };

  
  return (
    <>
      <AppHeader />
      
      <div className={styles.library}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>My Library</h1>
        <p className={styles.subtitle}>Upload and read your books</p>
      </header>

      {/* Upload Section */}
      <section className={styles.uploadSection}>
        <div className={styles.uploadCard}>
          <div className={styles.uploadIcon}>
            <Upload size={32} />
          </div>
          
          <h2 className={styles.uploadTitle}>Upload a Book</h2>
          <p className={styles.uploadDescription}>
            Select a PDF file to add to your library
          </p>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className={styles.fileInput}
            id="file-upload"
            disabled={uploadMutation.isPending}
          />

          <label htmlFor="file-upload" className={styles.fileLabel}>
            {selectedFile ? selectedFile.name : 'Choose PDF File'}
          </label>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className={styles.uploadButton}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className={styles.spinner} size={18} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Book
                </>
              )}
            </button>
          )}

          {uploadMutation.isError && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              {uploadMutation.error?.message || 'Upload failed. Please try again.'}
            </div>
          )}
        </div>
      </section>

      {/* Books Grid */}
      <section className={styles.booksSection}>
        <h2 className={styles.sectionTitle}>
          Your Books ({books.length})
        </h2>

        {isLoading ? (
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={40} />
            <p>Loading your library...</p>
          </div>
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen size={64} />
            <h3>No books yet</h3>
            <p>Upload your first PDF to get started</p>
          </div>
        ) : (
          <div className={styles.booksGrid}>
            {books.map((book) => (
              <div
                key={book.id}
                className={styles.bookCard}
                onClick={() => book.processing_status === 'ready' && handleBookClick(book.id)}
                style={{ cursor: book.processing_status === 'ready' ? 'pointer' : 'default' }}
              >
                {/* Cover Image or Placeholder */}
                <div className={styles.bookCover}>
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} />
                  ) : (
                    <div className={styles.placeholderCover}>
                      <BookOpen size={48} />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {book.processing_status !== 'ready' && (
                    <div className={`${styles.statusBadge} ${styles[book.processing_status]}`}>
                      {book.processing_status}
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  <p className={styles.bookMeta}>
                    {book.no_of_pages > 0 ? `${book.no_of_pages} pages` : 'Processing...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
    </>
  );
}
