import { api } from "../api";
import { uploadPdf } from "./upload-pdf";

export interface Resource {
  id: string;
  title: string;
  no_of_pages: number;
  cover_image: string | null;
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  is_public: boolean;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export type UploadResourcePayload = File;

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
  id: string;
  resource: string;
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
  return uploadPdf(payload);
}

/**
 * Get pages for a specific resource
 */
export function getResourcePages(resourceId: string, start: number = 0, end: number = 50) {
  return api<Page[]>(`/resources/${resourceId}/pages/?start=${start}&end=${end}`);
}
