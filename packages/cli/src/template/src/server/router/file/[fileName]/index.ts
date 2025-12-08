import { Elysia } from 'elysia';
import { handleDownloadFile, handleDeleteFile } from "../../../handler/file.handler";

/**
 * Middleware specific to individual file operations
 * INHERITS middleware from parent /file route
 * 
 * Middleware chain:
 *  1. Parent /file middleware (timing, content-type logging)
 *  2. This route's middleware (file name validation)
 *  3. Method-specific middleware (authorization for DELETE)
 */
export const middleware = [
  (app: Elysia) => {
    app.derive(({ params }) => {
      // Validate file name format
      const fileName = params.fileName as string;
      if (!fileName || fileName.includes('..') || fileName.includes('/')) {
        throw new Error('Invalid file name');
      }
      return { validatedFileName: fileName };
    });
  },
];

/**
 * GET /api/file/:fileName - Download a specific file
 * 
 * Example with curl:
 * curl http://localhost:3000/api/file/document.pdf -O
 */
export const GET = async ({ params, set }: any) => {
  const { fileName } = params;
  return await handleDownloadFile(fileName, { set });
};

/**
 * DELETE /api/file/:fileName - Delete a specific file
 * Requires authorization (example middleware)
 * 
 * Example with curl:
 * curl -X DELETE http://localhost:3000/api/file/document.pdf
 */
export const DELETE = async ({ params, set }: any) => {
  const { fileName } = params;
  return await handleDeleteFile(fileName, { set });
};
