"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { useUploadResource } from "@/hooks/use-library";
import { Button } from "@/components/ui/button";
import styles from "@/app/library/library.module.scss";

export function BookUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadResource();

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError(null);
    uploadMutation.reset();

    if (!file) return;
    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setFileError("Choose a PDF file to add it to your library.");
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(
      {
        title: selectedFile.name.replace(/\.pdf$/i, ""),
        object_path: selectedFile,
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      },
    );
  };

  return (
    <section className={styles.uploadSection} aria-labelledby="upload-title">
      <div className={styles.uploadCard}>
        <div className={styles.uploadIcon}><Upload size={24} /></div>
        <h2 id="upload-title" className={styles.uploadTitle}>Add a book</h2>
        <p className={styles.uploadDescription}>Choose a PDF and we’ll prepare it for reading.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileSelect}
          className={styles.fileInput}
          id="file-upload"
          disabled={uploadMutation.isPending}
          tabIndex={-1}
          aria-hidden="true"
        />
        <Button
          type="button"
          variant="outline"
          className={styles.filePicker}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {selectedFile ? selectedFile.name : "Choose a PDF"}
        </Button>

        {selectedFile && (
          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            size="lg"
            className="bg-[#22201d] text-white hover:bg-[#34322e]"
          >
            {uploadMutation.isPending ? <Loader2 className={styles.spinner} /> : <Upload />}
            {uploadMutation.isPending ? "Uploading…" : "Add to library"}
          </Button>
        )}

        {(fileError || uploadMutation.isError) && (
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={16} />
            {fileError || uploadMutation.error?.message || "Upload failed. Please try again."}
          </div>
        )}
      </div>
    </section>
  );
}
