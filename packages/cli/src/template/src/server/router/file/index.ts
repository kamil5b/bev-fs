import { multipart } from "@elysiajs/multipart";
import { handleListFiles, handleUploadFiles } from "../../handler/file.handler";

/**
 * Apply per-method middleware
 * Only POST requests need multipart middleware for file uploads
 * GET requests don't need multipart
 */
export const middleware = {
  POST: (app) => app.use(multipart()),
  // GET doesn't need multipart middleware
};

/**
 * GET /api/file - List all uploaded files
 * 
 * Example with curl:
 * curl http://localhost:3000/api/file
 */
export const GET = async () => {
  return await handleListFiles();
};

/**
 * POST /api/file - Upload one or more files
 * 
 * Example with curl:
 * curl -F "files=@file1.txt" -F "files=@file2.txt" http://localhost:3000/api/file
 * 
 * Example with JavaScript:
 * const formData = new FormData();
 * formData.append('files', fileInput.files[0]);
 * formData.append('files', fileInput.files[1]);
 * fetch('/api/file', { method: 'POST', body: formData });
 */
export const POST = async ({ body }: any) => {
  const files: File[] = [];

  if (!body || typeof body !== "object") {
    return {
      success: false,
      message: "No files provided"
    };
  }

  // Collect files from form data
  for (const [fieldName, fileOrFiles] of Object.entries(body)) {
    if (fileOrFiles instanceof File) {
      files.push(fileOrFiles);
    } else if (Array.isArray(fileOrFiles)) {
      fileOrFiles.forEach((file: any) => {
        if (file instanceof File) {
          files.push(file);
        }
      });
    }
  }

  return await handleUploadFiles(files);
};
