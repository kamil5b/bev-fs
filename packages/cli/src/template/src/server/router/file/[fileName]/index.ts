import { handleDownloadFile, handleDeleteFile } from "../../../handler/file.handler";

/**
 * GET /api/file/:fileName - Download a specific file
 * 
 * Example with curl:
 * curl http://localhost:3000/api/file/document.pdf -O
 */
export const GET = async ({ params }: any) => {
  const { fileName } = params;
  return await handleDownloadFile(fileName);
};

/**
 * DELETE /api/file/:fileName - Delete a specific file
 * 
 * Example with curl:
 * curl -X DELETE http://localhost:3000/api/file/document.pdf
 */
export const DELETE = async ({ params }: any) => {
  const { fileName } = params;
  return await handleDeleteFile(fileName);
};
