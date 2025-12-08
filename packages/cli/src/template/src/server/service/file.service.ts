import { FileStorageGateway, defaultFileStorageGateway } from "../gateway/file.storage.gateway";

/**
 * File service - Business logic for file operations
 * Uses a storage gateway for actual file persistence
 */
export class FileService {
  constructor(private gateway: FileStorageGateway = defaultFileStorageGateway) {}

  /**
   * Upload a single file
   */
  async uploadFile(file: File) {
    if (!file) {
      throw new Error("File is required");
    }

    return await this.gateway.save(file);
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[]) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error("Files array is required");
    }

    const results = [];
    for (const file of files) {
      const result = await this.uploadFile(file);
      results.push(result);
    }

    return results;
  }

  /**
   * Delete a file by name
   */
  async deleteFile(fileName: string) {
    if (!fileName) {
      throw new Error("File name is required");
    }

    return await this.gateway.delete(fileName);
  }

  /**
   * List all files
   */
  async listFiles() {
    return await this.gateway.list();
  }

  /**
   * Get file content
   */
  async getFile(fileName: string) {
    if (!fileName) {
      throw new Error("File name is required");
    }

    return await this.gateway.get(fileName);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileName: string) {
    if (!fileName) {
      throw new Error("File name is required");
    }

    const exists = await this.gateway.get(fileName);
    if (!exists) {
      return null;
    }

    return {
      fileName,
      url: `/uploads/${fileName}`,
      size: exists.length
    };
  }
}

// Default instance
export const defaultFileService = new FileService();
