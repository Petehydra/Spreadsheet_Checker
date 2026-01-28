/**
 * Shared Types
 * 
 * Types that are used by both frontend and backend.
 * No framework-specific code should be placed here.
 */

export interface FileResult {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface UploadPayload {
  files: File[];
  spreadsheetId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}
