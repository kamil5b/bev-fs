import { getProgressDetail, updateProgressDetail, deleteProgressDetail } from '../../../../../handler/product.handler';

// GET /api/product/:id/progress/:progressId - get progress by id
export const GET = ({ params }: any) => {
  return getProgressDetail(params);
};

// PATCH /api/product/:id/progress/:progressId - update progress
export const PATCH = ({ params, body }: any) => {
  return updateProgressDetail(params, body);
};

// DELETE /api/product/:id/progress/:progressId - delete progress
export const DELETE = ({ params }: any) => {
  return deleteProgressDetail(params);
};
