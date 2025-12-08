import { handleListFiles, handleUploadFiles } from "../../handler/file.handler";

/**
 * GET /api/file - List all uploaded files
 * 
 * Example with curl:
 * curl http://localhost:3000/api/file
 */
export const GET = async () => {
  return await handleListFiles();
};

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
