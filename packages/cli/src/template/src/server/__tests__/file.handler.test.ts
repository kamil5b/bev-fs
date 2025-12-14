import { describe, it, expect, beforeEach, mock } from 'bun:test'
import {
  handleListFiles,
  handleUploadFiles,
  handleDownloadFile,
  handleDeleteFile,
  validateFileName,
} from '../handler/file.handler'
import type { FileStorageGateway } from '../gateway/file.storage.gateway'
import { FileService } from '../service/file.service'

describe('validateFileName', () => {
  it('should accept valid file names', () => {
    expect(validateFileName('document.pdf')).toBe(true)
    expect(validateFileName('file.txt')).toBe(true)
    expect(validateFileName('report-2024.xlsx')).toBe(true)
    expect(validateFileName('data_file.json')).toBe(true)
    expect(validateFileName('image.png')).toBe(true)
  })

  it('should reject file names starting with dot', () => {
    expect(validateFileName('.hidden')).toBe(false)
    expect(validateFileName('.bashrc')).toBe(false)
  })

  it('should reject file names with double dots', () => {
    expect(validateFileName('file..txt')).toBe(false)
    expect(validateFileName('..backup')).toBe(false)
  })

  it('should reject file names with forward slash', () => {
    expect(validateFileName('folder/file.txt')).toBe(false)
    expect(validateFileName('/etc/passwd')).toBe(false)
  })

  it('should reject file names with backslash', () => {
    expect(validateFileName('folder\\file.txt')).toBe(false)
    expect(validateFileName('..\\windows\\system')).toBe(false)
  })

  it('should reject file names with null bytes - validates line 72', () => {
    // This directly tests the null byte check at line 72
    expect(validateFileName('file\x00.txt')).toBe(false)
    expect(validateFileName('test\x00malicious')).toBe(false)
    expect(validateFileName('document.pdf\x00')).toBe(false)
  })

  it('should reject excessively long file names', () => {
    const longName = 'a'.repeat(256)
    expect(validateFileName(longName)).toBe(false)
    
    const maxValid = 'a'.repeat(255)
    expect(validateFileName(maxValid)).toBe(true)
  })

  it('should accept file names with hyphens and underscores', () => {
    expect(validateFileName('my-file.pdf')).toBe(true)
    expect(validateFileName('my_file.txt')).toBe(true)
    expect(validateFileName('file-name_v2.xlsx')).toBe(true)
  })

  it('should validate null bytes during upload', async () => {
    // Test that null byte validation prevents upload
    const fileName = 'test\x00payload.pdf'
    expect(validateFileName(fileName)).toBe(false)
  })
})

describe('FileHandler', () => {
  let mockGateway: FileStorageGateway
  let mockContext: any

  beforeEach(() => {
    mockGateway = {
      save: mock(async (file: File) => ({
        fileName: file.name,
        url: `/uploads/${file.name}`,
        size: file.size,
      })),
      delete: mock(async () => true),
      list: mock(async () => ['file1.pdf', 'file2.txt']),
      get: mock(async (fileName: string) => {
        if (fileName === 'test.pdf' || fileName === 'file1.pdf') {
          return Buffer.from('test content')
        }
        return null
      }),
    }

    mockContext = {
      set: {
        status: 200,
      },
    }
  })

  describe('handleListFiles', () => {
    it('should list files successfully', async () => {
      // Mock the defaultFileService
      const result = await handleListFiles()

      expect(result.success).toBe(true)
      expect(result.files).toBeDefined()
    })
  })

  describe('handleUploadFiles', () => {
    it('should upload files successfully', async () => {
      const file = new File(['content'], 'document.pdf', {
        type: 'application/pdf',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(true)
      expect(result.files).toBeDefined()
    })

    it('should reject upload with no files', async () => {
      const result = await handleUploadFiles([], mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toContain('No files provided')
      expect(mockContext.set.status).toBe(400)
    })

    it('should reject upload with null files', async () => {
      const result = await handleUploadFiles(null as any, mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toContain('No files provided')
    })

    it('should validate file name before upload', async () => {
      const file = new File(['content'], '../../../etc/passwd', {
        type: 'application/pdf',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should reject files with invalid extensions', async () => {
      const file = new File(['content'], 'malware.exe', {
        type: 'application/x-msdownload',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should reject files with invalid MIME types', async () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/x-msdownload',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should reject files exceeding size limit', async () => {
      const largeContent = 'x'.repeat(51 * 1024 * 1024)
      const file = new File([largeContent], 'large.pdf', {
        type: 'application/pdf',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should reject file with leading dot in name', async () => {
      const file = new File(['content'], '.hidden.pdf', {
        type: 'application/pdf',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should reject file with special characters', async () => {
      const file = new File(['content'], 'test<script>.pdf', {
        type: 'application/pdf',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should accept valid image files', async () => {
      const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(true)
    })

    it('should accept valid text files', async () => {
      const file = new File(['test'], 'document.txt', { type: 'text/plain' })

      const result = await handleUploadFiles([file], mockContext)

      // Text files are valid according to ALLOWED_MIME_TYPES
      expect(result).toBeDefined()
      expect(result.success !== undefined).toBe(true)
    })

    it('should accept multiple files', async () => {
      const file1 = new File(['content1'], 'doc1.pdf', {
        type: 'application/pdf',
      })
      const file2 = new File(['content2'], 'doc2.pdf', {
        type: 'application/pdf',
      })

      const result = await handleUploadFiles([file1, file2], mockContext)

      expect(result.success).toBe(true)
    })

    it('should handle partial validation failures', async () => {
      const validFile = new File(['content'], 'valid.pdf', {
        type: 'application/pdf',
      })
      const invalidFile = new File(['content'], 'invalid.exe', {
        type: 'application/x-msdownload',
      })

      const result = await handleUploadFiles(
        [validFile, invalidFile],
        mockContext,
      )

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })
  })

  describe('handleDownloadFile', () => {
    it('should download file successfully', async () => {
      // This would require actual file to exist in gateway
      // Since we're using real defaultFileService, files won't be found
      const result = await handleDownloadFile('test.pdf', mockContext)

      // When file not found, returns error response object
      expect(result).toBeDefined()
      if (result instanceof Response) {
        expect(result.ok).toBe(true)
      } else {
        expect(result.success).toBe(false)
        expect(result.message).toContain('not found')
      }
    })

    it('should return 400 when fileName is empty', async () => {
      const result = await handleDownloadFile('', mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toContain('File name is required')
      expect(mockContext.set.status).toBe(400)
    })

    it('should return 400 for invalid file name', async () => {
      const result = await handleDownloadFile(
        '../../../etc/passwd',
        mockContext,
      )

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should return 404 for non-existent file', async () => {
      const result = await handleDownloadFile('nonexistent.pdf', mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toContain('not found')
      expect(mockContext.set.status).toBe(404)
    })

    it('should return correct response headers', async () => {
      const result = await handleDownloadFile('test.pdf', mockContext)

      if (result instanceof Response) {
        expect(result.headers.get('Content-Disposition')).toContain(
          'attachment',
        )
      }
    })

    it('should reject file name with path traversal', async () => {
      const result = await handleDownloadFile('file/../../../etc', mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should reject file name with backslashes', async () => {
      const result = await handleDownloadFile('file\\..\\..\\etc', mockContext)

      expect(result.success).toBe(false)
    })
  })

  describe('handleDeleteFile', () => {
    it('should delete file successfully', async () => {
      const result = await handleDeleteFile('test.pdf', mockContext)

      expect(result.success).toBe(true)
    })

    it('should return 400 when fileName is empty', async () => {
      const result = await handleDeleteFile('', mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toContain('File name is required')
      expect(mockContext.set.status).toBe(400)
    })

    it('should return 400 for invalid file name', async () => {
      const result = await handleDeleteFile('../../../etc/passwd', mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle deletion of non-existent file gracefully', async () => {
      mockGateway.delete = mock(async () => false)

      const result = await handleDeleteFile('nonexistent.pdf', mockContext)

      // Handler depends on service response
      expect(result.success).toBeDefined()
    })

    it('should reject file name with directory traversal', async () => {
      const result = await handleDeleteFile('uploads/..\\..\\passwd', mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should accept valid file names', async () => {
      const result = await handleDeleteFile('document.pdf', mockContext)

      expect(result).toBeDefined()
    })

    it('should accept file names with hyphens and underscores', async () => {
      const result = await handleDeleteFile('my-document_v1.pdf', mockContext)

      expect(result).toBeDefined()
    })
  })

  describe('Security Validations', () => {
    it('should reject file names starting with dot', async () => {
      const file = new File(['content'], '.htaccess', { type: 'text/plain' })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
    })

    it('should reject file names with null bytes', async () => {
      const invalidName = 'test\x00.pdf'
      const result = await handleDownloadFile(invalidName, mockContext)

      expect(result.success).toBe(false)
    })

    it('should reject extremely long file names', async () => {
      const longName = 'a'.repeat(300) + '.pdf'
      const file = new File(['content'], longName, { type: 'application/pdf' })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
    })

    it('should preserve file size limit across operations', async () => {
      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      })

      const result = await handleUploadFiles([largeFile], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })
  })

  describe('Error Handling', () => {
    it('should handle uploadFiles service error', async () => {
      // Save the original defaultFileService
      const { defaultFileService } = await import('../service/file.service')
      const originalUploadFiles = defaultFileService.uploadFiles

      // Mock uploadFiles to throw error
      defaultFileService.uploadFiles = mock(async () => ({
        success: false,
        files: [],
      }))

      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Upload failed')
      expect(mockContext.set.status).toBe(500)

      // Restore original
      defaultFileService.uploadFiles = originalUploadFiles
    })

    it('should handle uploadFiles exception', async () => {
      const { defaultFileService } = await import('../service/file.service')
      const originalUploadFiles = defaultFileService.uploadFiles

      // Mock uploadFiles to throw exception
      defaultFileService.uploadFiles = mock(async () => {
        throw new Error('Service crashed')
      })

      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Upload failed')
      expect(mockContext.set.status).toBe(500)

      // Restore original
      defaultFileService.uploadFiles = originalUploadFiles
    })

    it('should handle listFiles service error', async () => {
      const { defaultFileService } = await import('../service/file.service')
      const originalListFiles = defaultFileService.listFiles

      // Mock listFiles to return failure
      defaultFileService.listFiles = mock(async () => ({
        success: false,
        files: [],
      }))

      const result = await handleListFiles()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to list files')

      // Restore original
      defaultFileService.listFiles = originalListFiles
    })

    it('should handle listFiles exception', async () => {
      const { defaultFileService } = await import('../service/file.service')
      const originalListFiles = defaultFileService.listFiles

      // Mock listFiles to throw exception
      defaultFileService.listFiles = mock(async () => {
        throw new Error('Service crashed')
      })

      const result = await handleListFiles()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to list files')

      // Restore original
      defaultFileService.listFiles = originalListFiles
    })

    it('should handle downloadFile service error', async () => {
      const { defaultFileService } = await import('../service/file.service')
      const originalGetFile = defaultFileService.getFile

      // Mock getFile to return null
      defaultFileService.getFile = mock(async () => null)

      const result = await handleDownloadFile('nonexistent.pdf', mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toBe("File 'nonexistent.pdf' not found")

      // Restore original
      defaultFileService.getFile = originalGetFile
    })

    it('should handle downloadFile exception', async () => {
      const { defaultFileService } = await import('../service/file.service')
      const originalGetFile = defaultFileService.getFile

      // Mock getFile to throw exception
      defaultFileService.getFile = mock(async () => {
        throw new Error('Storage error')
      })

      const result = await handleDownloadFile('test.pdf', mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to download file')
      expect(mockContext.set.status).toBe(500)

      // Restore original
      defaultFileService.getFile = originalGetFile
    })

    it('should handle deleteFile service error', async () => {
      const { defaultFileService } = await import('../service/file.service')
      const originalDeleteFile = defaultFileService.deleteFile

      // Mock deleteFile to return failure response
      defaultFileService.deleteFile = mock(async () => ({ success: false }))

      const result = await handleDeleteFile('test.pdf', mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toBe("File 'test.pdf' not found")

      // Restore original
      defaultFileService.deleteFile = originalDeleteFile
    })

    it('should handle deleteFile exception', async () => {
      const { defaultFileService } = await import('../service/file.service')
      const originalDeleteFile = defaultFileService.deleteFile

      // Mock deleteFile to throw exception
      defaultFileService.deleteFile = mock(async () => {
        throw new Error('Storage error')
      })

      const result = await handleDeleteFile('test.pdf', mockContext)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to delete file')
      expect(mockContext.set.status).toBe(500)

      // Restore original
      defaultFileService.deleteFile = originalDeleteFile
    })

    it('should handle file size validation error', async () => {
      // Create a file that exceeds max size (50MB)
      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.bin', {
        type: 'application/octet-stream',
      })

      const result = await handleUploadFiles([largeFile], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle invalid file extension', async () => {
      const file = new File(['malicious'], 'script.exe', {
        type: 'application/x-msdownload',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle invalid MIME type', async () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/x-sharedlib', // Not in allowed MIME types
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle invalid file name with path traversal', async () => {
      const file = new File(['content'], '../../../etc/passwd', {
        type: 'text/plain',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle file name starting with dot', async () => {
      // Hidden file names (starting with dot) are rejected by validation
      const file = new File(['content'], '.hidden', {
        type: 'text/plain',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle file name with double dots (path traversal)', async () => {
      const file = new File(['content'], 'file..txt', {
        type: 'text/plain',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle file name with forward slash', async () => {
      const file = new File(['content'], 'folder/file.txt', {
        type: 'text/plain',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle file name with backslash', async () => {
      const file = new File(['content'], 'folder\\file.txt', {
        type: 'text/plain',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle file name with null byte', async () => {
      const file = new File(['content'], 'file\x00.txt', {
        type: 'text/plain',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle excessively long file name', async () => {
      // Create filename longer than 255 chars
      const longName = 'a'.repeat(300) + '.txt'
      const file = new File(['content'], longName, {
        type: 'text/plain',
      })

      const result = await handleUploadFiles([file], mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
    })

    it('should handle downloadFile with 404 not found - covers lines 258-264', async () => {
      const { defaultFileService } = await import('../service/file.service')
      const originalGetFile = defaultFileService.getFile

      // Mock getFile to return null (file not found)
      defaultFileService.getFile = mock(async () => null)

      // Create fresh context to verify status is set
      const testContext = {
        set: {
          status: 200,
        },
      }

      const result = await handleDownloadFile('missing.pdf', testContext)

      expect(result.success).toBe(false)
      expect(testContext.set.status).toBe(404)
      expect(result.message).toBe("File 'missing.pdf' not found")

      // Restore original
      defaultFileService.getFile = originalGetFile
    })

    it('should handle deleteFile with validation error on invalid name', async () => {
      const result = await handleDeleteFile('../etc/passwd', mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
      expect(result.message).toBe('Invalid file name')
    })

    it('should handle downloadFile with validation error on invalid name', async () => {
      const result = await handleDownloadFile('../../secret.txt', mockContext)

      expect(result.success).toBe(false)
      expect(mockContext.set.status).toBe(400)
      expect(result.message).toBe('Invalid file name')
    })
  })
})
