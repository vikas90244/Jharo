import { api } from "../api";

export interface Resource {
  id: number;
  title: string;
  no_of_pages: number;
  cover_image: string | null;
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface UploadResourcePayload {
  title: string;
  object_path: File;
}

// Block types from PDF parsing
export interface Span {
  text: string;
  bbox: [number, number, number, number];
  size: number;
  flags: number;
  font: string;
  color: number;
}

export interface Line {
  bbox: [number, number, number, number];
  wmode: number;
  dir: [number, number];
  spans: Span[];
}

export interface TextBlock {
  type: 0; // 0 for text
  bbox: [number, number, number, number];
  number: number;
  lines: Line[];
}

export interface ImageBlock {
  type: 1; // 1 for image
  bbox: [number, number, number, number];
  number: number;
  src: string;
}

export type Block = TextBlock | ImageBlock;

// Page structure as returned by backend
export interface Page {
  id: number;
  resource: number;
  page_number: number;
  width: number;
  height: number;
  data: Block[];
}

// API FUNCTIONS

/**
 * Fetch all books for the current user
 */
export function getMyResources() {
  return api<Resource[]>("/resources/my-books/");
}

/**
 * Upload a new book (PDF)
 */
export async function uploadResource(payload: UploadResourcePayload) {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('object_path', payload.object_path);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/upload/`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary for FormData
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || data?.detail || 'Upload failed');
  }

  return data as Resource;
}

/**
 * Get pages for a specific resource
 */
export function getResourcePages(resourceId: number, start: number = 0, end: number = 50) {
  return api<Page[]>(`/resources/${resourceId}/pages/?start=${start}&end=${end}`);
}
