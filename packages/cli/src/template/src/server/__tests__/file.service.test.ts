import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { FileService } from '../service/file.service'
import type { FileStorageGateway } from '../gateway/file.storage.gateway'

describe('FileService', () => {
  let fileService: FileService
  let mockGateway: FileStorageGateway

  beforeEach(() => {
    // Create mock gateway
    mockGateway = {
      save: mock(async () => ({
        fileName: 'test.pdf',
        url: '/uploads/test.pdf',
        size: 1024,
      })),
      delete: mock(async () => true),
      list: mock(async () => ['file1.pdf', 'file2.txt']),
      get: mock(async (fileName) => {
        if (fileName === 'test.pdf') {
          return Buffer.from('test content')
        }
        return null
      }),
    }

    fileService = new FileService(mockGateway)
  })

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      })

      const result = await fileService.uploadFile(mockFile)

      expect(result).toBeDefined()
      expect(result.fileName).toBe('test.pdf')
      expect(result.url).toBe('/uploads/test.pdf')
      expect(mockGateway.save).toHaveBeenCalledTimes(1)
    })

    it('should throw error when file is null', async () => {
      try {
        await fileService.uploadFile(null as any)
        expect.unreachable()
      } catch (error: any) {
        expect(error.message).toContain('File is required')
      }
    })

    it('should throw error when file exceeds size limit', async () => {
      // Create a file larger than 50MB
      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf')

      try {
        await fileService.uploadFile(largeFile)
        expect.unreachable()
      } catch (error: any) {
        expect(error.message).toContain('File size exceeds')
      }
    })

    it('should allow files at the maximum size limit', async () => {
      const maxSizeFile = new File(['x'.repeat(50 * 1024 * 1024)], 'max.pdf')

      const result = await fileService.uploadFile(maxSizeFile)

      expect(result).toBeDefined()
      expect(mockGateway.save).toHaveBeenCalledTimes(1)
    })
  })

  describe('uploadFiles', () => {
    it('should upload multiple files successfully', async () => {
      const mockFile1 = new File(['content1'], 'file1.pdf')
      const mockFile2 = new File(['content2'], 'file2.pdf')

      const result = await fileService.uploadFiles([mockFile1, mockFile2])

      expect(result.success).toBe(true)
      expect(result.files).toHaveLength(2)
      expect(mockGateway.save).toHaveBeenCalledTimes(2)
    })

    it('should throw error when files array is empty', async () => {
      try {
        await fileService.uploadFiles([])
        expect.unreachable()
      } catch (error: any) {
        expect(error.message).toContain('Files array is required')
      }
    })

    it('should throw error when files is not an array', async () => {
      try {
        await fileService.uploadFiles(null as any)
        expect.unreachable()
      } catch (error: any) {
        expect(error.message).toContain('Files array is required')
      }
    })

    it('should throw error if any file upload fails', async () => {
      mockGateway.save = mock(async () => {
        throw new Error('Upload failed')
      })
      const fileService2 = new FileService(mockGateway)

      const mockFile = new File(['content'], 'file.pdf')

      try {
        await fileService2.uploadFiles([mockFile])
        expect.unreachable()
      } catch (error: any) {
        expect(error.message).toContain('Upload failed')
      }
    })
  })

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const result = await fileService.deleteFile('test.pdf')

      expect(result.success).toBe(true)
      expect(mockGateway.delete).toHaveBeenCalledWith('test.pdf')
    })

    it('should throw error when fileName is empty', async () => {
      try {
        await fileService.deleteFile('')
        expect.unreachable()
      } catch (error: any) {
        expect(error.message).toContain('File name is required')
      }
    })

    it('should throw error when fileName is null', async () => {
      try {
        await fileService.deleteFile(null as any)
        expect.unreachable()
      } catch (error: any) {
        expect(error.message).toContain('File name is required')
      }
    })

    it('should handle gateway delete errors', async () => {
      mockGateway.delete = mock(async () => {
        throw new Error('Gateway delete failed')
      })
      const fileService2 = new FileService(mockGateway)

      try {
        await fileService2.deleteFile('test.pdf')
        expect.unreachable()
      } catch (error: any) {
        expect(error.message).toContain('Gateway delete failed')
      }
    })
  })

  describe('listFiles', () => {
    it('should list all files successfully', async () => {
      const result = await fileService.listFiles()

      expect(result.success).toBe(true)
      expect(result.files).toBeDefined()
      expect(mockGateway.list).toHaveBeenCalledTimes(1)
    })

    it('should return empty list when no files exist', async () => {
      mockGateway.list = mock(async () => [])

      const result = await fileService.listFiles()

      expect(result.success).toBe(true)
      expect(result.files).toHaveLength(0)
    })

    it('should include file metadata in list', async () => {
      mockGateway.list = mock(async () => ['file1.pdf'])
      mockGateway.get = mock(async () => Buffer.from('test'))

      const result = await fileService.listFiles()

      expect(result.files).toHaveLength(1)
      expect(result.files[0].fileName).toBe('file1.pdf')
      expect(result.files[0].url).toContain('/uploads/')
      expect(result.files[0].size).toBeGreaterThan(0)
    })
  })

  describe('getFile', () => {
    it('should get file content successfully', async () => {
      const result = await fileService.getFile('test.pdf')

      expect(result).toBeDefined()
      expect(mockGateway.get).toHaveBeenCalledWith('test.pdf')
    })

    it('should throw error when fileName is empty', async () => {
      try {
        await fileService.getFile('')
        expect.unreachable()
      } catch (error: any) {
        expect(error.message).toContain('File name is required')
      }
    })

    it('should return null for non-existent file', async () => {
      const result = await fileService.getFile('nonexistent.pdf')

      expect(result).toBeNull()
    })
  })

  describe('getFileMetadata', () => {
    it('should get file metadata successfully', async () => {
      const result = await fileService.getFileMetadata('test.pdf')

      expect(result).toBeDefined()
      expect(result?.fileName).toBe('test.pdf')
      expect(result?.url).toContain('/uploads/')
      expect(result?.size).toBeGreaterThan(0)
    })

    it('should throw error when fileName is empty', async () => {
      try {
        await fileService.getFileMetadata('')
        expect.unreachable()
      } catch (error: any) {
        expect(error.message).toContain('File name is required')
      }
    })

    it('should return null for non-existent file', async () => {
      mockGateway.get = mock(async () => null)

      const result = await fileService.getFileMetadata('nonexistent.pdf')

      expect(result).toBeNull()
    })
  })
})
