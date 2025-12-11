import { Elysia } from 'elysia'
import type { FileListResponse } from '../../shared'
import { handleListFiles, handleUploadFiles } from '../../handler/file.handler'

/**
 * Route-level middleware for all file operations
 * Applied to: /api/file and /api/file/[fileName]
 */
export const middleware = [
  (app: Elysia) => {
    app.derive(({ request }) => {
      const timestamp = Date.now()
      const contentType = request.headers.get('content-type') || 'unknown'
      return { fileRouteTimestamp: timestamp, contentType }
    })
  },
]

/**
 * GET /api/file - List all uploaded files
 *
 * Example with curl:
 * curl http://localhost:3000/api/file
 */
export const GET = async (): Promise<FileListResponse> => {
  return await handleListFiles()
}

/**
 * POST /api/file - Upload files
 *
 * Example with curl:
 * curl -F "file=@document.pdf" http://localhost:3000/api/file
 */
export const POST = async ({
  body,
  set,
}: {
  body: Record<string, any>
  set: Record<string, any>
}) => {
  const files: File[] = []

  if (!body || typeof body !== 'object') {
    set.status = 400
    return {
      success: false,
      message: 'No files provided',
    }
  }

  // Collect files from form data
  for (const [fieldName, fileOrFiles] of Object.entries(body)) {
    if (fileOrFiles instanceof File) {
      files.push(fileOrFiles)
    } else if (Array.isArray(fileOrFiles)) {
      fileOrFiles.forEach((file: any) => {
        if (file instanceof File) {
          files.push(file)
        }
      })
    }
  }

  return await handleUploadFiles(files, { set })
}
