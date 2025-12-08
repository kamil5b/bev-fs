import { handleDeleteFile } from "../../../handler/file.handler";

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
