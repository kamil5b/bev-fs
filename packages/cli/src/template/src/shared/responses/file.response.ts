/**
 * File API Response Types
 */

import type { UploadedFile } from '../entities/file.entity';

export interface FileUploadResponse {
  success: true;
  files: UploadedFile[];
}

export interface FileDeleteResponse {
  success: true;
}

export interface FileListResponse {
  success: true;
  files: UploadedFile[];
}

export type FileResponse = FileUploadResponse | FileDeleteResponse | FileListResponse;
