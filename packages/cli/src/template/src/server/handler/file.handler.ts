import type {
  FileUploadResponse,
  FileDeleteResponse,
  FileListResponse,
  ErrorResponse,
} from '../../shared'
import { defaultFileService } from '../service/file.service'
import path from 'path'

/**
 * File handler - HTTP request handling for file operations
 * Delegates business logic to FileService
 */

// File upload validation constraints
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.xlsx',
  '.csv',
  '.json',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.webp',
  '.svg',
]
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/json',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/svg+xml',
]

/**
 * Validate file name to prevent directory traversal attacks
 * Uses whitelist approach: only allows alphanumeric, dots, hyphens, underscores
 * Prevents hidden files (starting with dot)
 */
export function validateFileName(fileName: string): boolean {
  // Whitelist: only alphanumeric, dots, hyphens, underscores
  // Pattern breakdown: [a-zA-Z0-9._-]+ = allowed chars, no leading dot
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(fileName)) {
    return false
  }

  // Additional checks for edge cases
  if (
    fileName.includes('..') ||
    fileName.includes('/') ||
    fileName.includes('\\')
  ) {
    return false
  }

  // Check for null bytes
  if (fileName.includes('\x00')) {
    return false
  }

  // Ensure filename is not excessively long (max 255 chars is typical filesystem limit)
  if (fileName.length > 255) {
    return false
  }

  return true
}

/**
 * Validate file based on size, extension, and MIME type
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  // Check file extension
  const extension = path.extname(file.name).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid MIME type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * GET /api/file - List all uploaded files
 */
export const handleListFiles = async (): Promise<
  FileListResponse | ErrorResponse
> => {
  try {
    const response = await defaultFileService.listFiles()

    if (!response.success) {
      return {
        success: false,
        message: 'Failed to list files',
      } as ErrorResponse
    }

    return {
      success: true,
      files: response.files,
    } as FileListResponse
  } catch (error) {
    console.error('List files error:', error)
    return {
      success: false,
      message: 'Failed to list files',
    } as ErrorResponse
  }
}

/**
 * POST /api/file - Upload one or more files
 */
export const handleUploadFiles = async (
  files: File[],
  context?: any,
): Promise<FileUploadResponse | ErrorResponse> => {
  try {
    if (!files || files.length === 0) {
      if (context) {
        context.set.status = 400
      }
      return {
        success: false,
        message: 'No files provided',
      } as ErrorResponse
    }

    // Validate all files before uploading
    const validationErrors: Record<string, string> = {}

    for (const file of files) {
      // Validate file name
      if (!validateFileName(file.name)) {
        validationErrors[file.name] = 'Invalid file name'
        continue
      }

      // Validate file
      const validation = validateFile(file)
      if (!validation.valid) {
        validationErrors[file.name] =
          validation.error || 'Unknown validation error'
      }
    }

    // Return validation errors if any (400 Bad Request)
    if (Object.keys(validationErrors).length > 0) {
      if (context) {
        context.set.status = 400
      }
      return {
        success: false,
        message: 'File validation failed',
      } as ErrorResponse
    }

    const response = await defaultFileService.uploadFiles(files)

    if (!response.success) {
      if (context) {
        context.set.status = 500
      }
      return {
        success: false,
        message: 'Upload failed',
      } as ErrorResponse
    }

    return {
      success: true,
      files: response.files,
    } as FileUploadResponse
  } catch (error) {
    console.error('Upload error:', error)
    if (context) {
      context.set.status = 500
    }
    return {
      success: false,
      message: 'Upload failed',
    } as ErrorResponse
  }
}

/**
 * GET /api/file/:fileName - Download a specific file
 */
export const handleDownloadFile = async (
  fileName: string,
  context?: any,
): Promise<Response | ErrorResponse> => {
  try {
    if (!fileName) {
      if (context) {
        context.set.status = 400
      }
      return {
        success: false,
        message: 'File name is required',
      } as ErrorResponse
    }

    // Validate file name to prevent path traversal
    if (!validateFileName(fileName)) {
      if (context) {
        context.set.status = 400
      }
      return {
        success: false,
        message: 'Invalid file name',
      } as ErrorResponse
    }

    const fileContent = await defaultFileService.getFile(fileName)

    if (!fileContent) {
      if (context) {
        context.set.status = 404
      }
      return {
        success: false,
        message: `File '${fileName}' not found`,
      } as ErrorResponse
    }

    return new Response(fileContent, {
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': 'application/octet-stream',
      },
    })
  } catch (error) {
    console.error('Download file error:', error)
    if (context) {
      context.set.status = 500
    }
    return {
      success: false,
      message: 'Failed to download file',
    } as ErrorResponse
  }
}

/**
 * DELETE /api/file/:fileName - Delete a specific file
 */
export const handleDeleteFile = async (
  fileName: string,
  context?: any,
): Promise<FileDeleteResponse | ErrorResponse> => {
  try {
    if (!fileName) {
      if (context) {
        context.set.status = 400
      }
      return {
        success: false,
        message: 'File name is required',
      } as ErrorResponse
    }

    // Validate file name to prevent path traversal
    if (!validateFileName(fileName)) {
      if (context) {
        context.set.status = 400
      }
      return {
        success: false,
        message: 'Invalid file name',
      } as ErrorResponse
    }

    const response = await defaultFileService.deleteFile(fileName)

    if (response.success) {
      return {
        success: true,
      } as FileDeleteResponse
    } else {
      if (context) {
        context.set.status = 404
      }
      return {
        success: false,
        message: `File '${fileName}' not found`,
      } as ErrorResponse
    }
  } catch (error) {
    console.error('Delete file error:', error)
    if (context) {
      context.set.status = 500
    }
    return {
      success: false,
      message: 'Failed to delete file',
    } as ErrorResponse
  }
}
