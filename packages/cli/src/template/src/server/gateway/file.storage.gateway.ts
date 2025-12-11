import path from 'path'
import fs from 'fs'

/**
 * Abstract file storage gateway
 * Allows switching between local storage, S3, GCS, etc.
 */
export interface FileStorageGateway {
  save(file: File): Promise<{ fileName: string; url: string; size: number }>
  delete(fileName: string): Promise<boolean>
  list(): Promise<string[]>
  get(fileName: string): Promise<Buffer | null>
}

/**
 * Local file storage implementation
 * Stores files in the local filesystem
 */
export class LocalFileStorageGateway implements FileStorageGateway {
  private uploadDir: string

  constructor(uploadDir?: string) {
    this.uploadDir = uploadDir || path.join(process.cwd(), 'uploads')
    this.ensureDirectory()
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async save(
    file: File,
  ): Promise<{ fileName: string; url: string; size: number }> {
    this.ensureDirectory()

    const fileName = file.name
    const filePath = path.join(this.uploadDir, fileName)

    // Security: Validate file path is within upload directory (prevent traversal)
    const resolvedFilePath = path.resolve(filePath)
    const resolvedUploadDir = path.resolve(this.uploadDir)
    if (!resolvedFilePath.startsWith(resolvedUploadDir)) {
      throw new Error('Invalid file path')
    }

    // Read file buffer
    const buffer = await file.arrayBuffer()

    // Write file to disk
    fs.writeFileSync(filePath, Buffer.from(buffer))

    return {
      fileName,
      url: `/uploads/${fileName}`,
      size: file.size,
    }
  }

  async delete(fileName: string): Promise<boolean> {
    // Security: prevent directory traversal with strict validation
    if (
      fileName.includes('..') ||
      fileName.includes('/') ||
      fileName.includes('\\')
    ) {
      throw new Error('Invalid file name')
    }

    const filePath = path.join(this.uploadDir, fileName)

    // Verify resolved path is within upload directory
    const resolvedFilePath = path.resolve(filePath)
    const resolvedUploadDir = path.resolve(this.uploadDir)
    if (!resolvedFilePath.startsWith(resolvedUploadDir)) {
      throw new Error('Invalid file path')
    }

    if (!fs.existsSync(filePath)) {
      return false
    }

    fs.unlinkSync(filePath)
    return true
  }

  async list(): Promise<string[]> {
    this.ensureDirectory()

    return fs.readdirSync(this.uploadDir).filter((file) => {
      const filePath = path.join(this.uploadDir, file)
      return fs.statSync(filePath).isFile()
    })
  }

  async get(fileName: string): Promise<Buffer | null> {
    // Security: prevent directory traversal with strict validation
    if (
      fileName.includes('..') ||
      fileName.includes('/') ||
      fileName.includes('\\')
    ) {
      throw new Error('Invalid file name')
    }

    const filePath = path.join(this.uploadDir, fileName)

    // Verify resolved path is within upload directory
    const resolvedFilePath = path.resolve(filePath)
    const resolvedUploadDir = path.resolve(this.uploadDir)
    if (!resolvedFilePath.startsWith(resolvedUploadDir)) {
      throw new Error('Invalid file path')
    }

    if (!fs.existsSync(filePath)) {
      return null
    }

    return fs.readFileSync(filePath)
  }
}

// Default instance
export const defaultFileStorageGateway = new LocalFileStorageGateway()
