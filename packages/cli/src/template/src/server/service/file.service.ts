import type {
  FileUploadResponse,
  FileDeleteResponse,
  FileListResponse,
  UploadedFile,
} from '../../shared'
import {
  FileStorageGateway,
  defaultFileStorageGateway,
} from '../gateway/file.storage.gateway'

// File size limits (must match handler constraints)
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * File service - Business logic for file operations
 * Uses a storage gateway for actual file persistence
 * Includes file size validation to prevent DOS attacks
 */
export class FileService {
  constructor(
    private gateway: FileStorageGateway = defaultFileStorageGateway,
  ) {}

  /**
   * Upload a single file with size validation
   */
  async uploadFile(file: File) {
    if (!file) {
      throw new Error('File is required')
    }

    // Security: validate file size to prevent DOS/overflow attacks
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      )
    }

    return await this.gateway.save(file)
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[]): Promise<FileUploadResponse> {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Files array is required')
    }

    const results: UploadedFile[] = []
    for (const file of files) {
      const result = await this.uploadFile(file)
      results.push(result)
    }

    return {
      success: true,
      files: results,
    }
  }

  /**
   * Delete a file by name
   */
  async deleteFile(fileName: string): Promise<FileDeleteResponse> {
    if (!fileName) {
      throw new Error('File name is required')
    }

    await this.gateway.delete(fileName)
    return {
      success: true,
    }
  }

  /**
   * List all files
   */
  async listFiles(): Promise<FileListResponse> {
    const fileNames: string[] = await this.gateway.list()
    const files: UploadedFile[] = await Promise.all(
      fileNames.map(async (fileName) => {
        const fileContent = await this.gateway.get(fileName)
        return {
          fileName,
          url: `/uploads/${fileName}`,
          size: fileContent?.length ?? 0,
        }
      }),
    )
    return {
      success: true,
      files: files,
    }
  }

  /**
   * Get file content
   */
  async getFile(fileName: string) {
    if (!fileName) {
      throw new Error('File name is required')
    }

    return await this.gateway.get(fileName)
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileName: string) {
    if (!fileName) {
      throw new Error('File name is required')
    }

    const exists = await this.gateway.get(fileName)
    if (!exists) {
      return null
    }

    return {
      fileName,
      url: `/uploads/${fileName}`,
      size: exists.length,
    }
  }
}

// Default instance
export const defaultFileService = new FileService()
