import { api } from "@/lib/api";

export interface InitiateUploadResponse {
  resource_id: string;
  upload_url: string;
  method: "PUT";
  headers: Record<string, string>;
  expires_in: number;
  size_bytes: number;
  max_file_size_bytes: number;
}

export interface CompleteUploadResponse {
  resource_id: string;
  status: "pending" | "processing" | "ready" | "failed";
  message?: string;
}

const MAX_PDF_SIZE_BYTES = 1024 ** 3;

function getS3ErrorMessage(status: number): string {
  return `The PDF upload failed (status ${status}). Please try again.`;
}

export async function uploadPdf(file: File): Promise<CompleteUploadResponse> {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Please choose a PDF file.");
  }

  if (file.size <= 0 || file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("The PDF must be larger than 0 and no bigger than 1 GiB.");
  }

  const initiated = await api<InitiateUploadResponse>(
    "/resources/uploads/initiate/",
    {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        size_bytes: file.size,
      }),
    },
  );

  let uploadSucceeded = false;

  try {
    const s3Response = await fetch(initiated.upload_url, {
      method: initiated.method,
      headers: initiated.headers,
      body: file,
      credentials: "omit",
    });

    if (!s3Response.ok) {
      throw new Error(getS3ErrorMessage(s3Response.status));
    }

    uploadSucceeded = true;

    return await api<CompleteUploadResponse>(
      `/resources/uploads/${initiated.resource_id}/complete/`,
      { method: "POST", body: JSON.stringify({}) },
    );
  } catch (error) {
    if (!uploadSucceeded) {
      try {
        await api(`/resources/uploads/${initiated.resource_id}/abort/`, {
          method: "POST",
          body: JSON.stringify({}),
        });
      } catch {
        // The backend also expires abandoned uploads.
      }
    }

    throw error;
  }
}
