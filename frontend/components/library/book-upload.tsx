"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { useUploadResource } from "@/hooks/use-library";
import { Button } from "@/components/ui/button";
import styles from "@/app/library/library.module.scss";

export function BookUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadResource();

  const uploadFile = (file: File) => {
    setFileError(null);
    uploadMutation.reset();

    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      setSelectedFile(null);
      setFileError("Choose a PDF file to add it to your library.");
      return;
    }

    setSelectedFile(file);
    uploadMutation.mutate(
      {
        title: file.name.replace(/\.pdf$/i, ""),
        object_path: file,
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      },
    );
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <section className={styles.uploadSection} aria-labelledby="upload-title">
      <div
        className={`${styles.uploadCard} ${isDragging ? styles.uploadCardDragging : ""}`}
        aria-busy={uploadMutation.isPending}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileSelect}
          className={styles.fileInput}
          id="file-upload"
          disabled={uploadMutation.isPending}
          aria-label="Choose a PDF book to upload"
        />
        <div className={styles.uploadIcon}>
          <Upload size={21} />
        </div>
        <div className={styles.uploadCopy}>
          <h2 id="upload-title" className={styles.uploadTitle}>
            Add a book
          </h2>
          <p className={styles.uploadDescription}>
            {uploadMutation.isPending && selectedFile
              ? `Uploading ${selectedFile.name}…`
              : "Drop a PDF here, or choose a file. Upload starts right away."}
          </p>
        </div>
        {!uploadMutation.isPending && (
          <Button
            type="button"
            variant="outline"
            className={styles.filePicker}
            onClick={() => {
              if (uploadMutation.isError && selectedFile)
                uploadFile(selectedFile);
              else fileInputRef.current?.click();
            }}
          >
            {uploadMutation.isError ? "Try again" : "Choose PDF"}
          </Button>
        )}
        {uploadMutation.isPending && (
          <Loader2
            className={`${styles.spinner} ${styles.uploadSpinner}`}
            size={20}
            aria-label="Uploading"
          />
        )}

        {(fileError || uploadMutation.isError) && (
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={16} />
            {fileError ||
              uploadMutation.error?.message ||
              "Upload failed. Please try again."}
          </div>
        )}
      </div>
    </section>
  );
}
