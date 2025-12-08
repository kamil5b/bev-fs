import { defaultFileService } from "../service/file.service";

/**
 * File handler - HTTP request handling for file operations
 * Delegates business logic to FileService
 */

/**
 * GET /api/file - List all uploaded files
 */
export const handleListFiles = async () => {
  try {
    const files = await defaultFileService.listFiles();

    return {
      success: true,
      files: files.map(fileName => ({
        fileName,
        url: `/uploads/${fileName}`
      })),
      count: files.length
    };
  } catch (error) {
    console.error("List files error:", error);
    return {
      success: false,
      message: "Failed to list files",
      error: String(error)
    };
  }
};

/**
 * POST /api/file - Upload one or more files
 */
export const handleUploadFiles = async (files: File[]) => {
  try {
    if (!files || files.length === 0) {
      return {
        success: false,
        message: "No files provided"
      };
    }

    const results = await defaultFileService.uploadFiles(files);

    return {
      success: true,
      message: "Files uploaded successfully",
      files: results,
      count: results.length
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      message: "Upload failed",
      error: String(error)
    };
  }
};

/**
 * GET /api/file/:fileName - Download a specific file
 */
export const handleDownloadFile = async (fileName: string) => {
  try {
    if (!fileName) {
      return {
        success: false,
        message: "File name is required"
      };
    }

    const fileContent = await defaultFileService.getFile(fileName);

    if (!fileContent) {
      return {
        success: false,
        message: `File '${fileName}' not found`
      };
    }

    return new Response(fileContent, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Download file error:", error);
    return {
      success: false,
      message: "Failed to download file",
      error: String(error)
    };
  }
};

/**
 * DELETE /api/file/:fileName - Delete a specific file
 */
export const handleDeleteFile = async (fileName: string) => {
  try {
    if (!fileName) {
      return {
        success: false,
        message: "File name is required"
      };
    }

    const success = await defaultFileService.deleteFile(fileName);

    if (success) {
      return {
        success: true,
        message: `File '${fileName}' deleted successfully`
      };
    } else {
      return {
        success: false,
        message: `File '${fileName}' not found`
      };
    }
  } catch (error) {
    console.error("Delete file error:", error);
    return {
      success: false,
      message: "Failed to delete file",
      error: String(error)
    };
  }
};
