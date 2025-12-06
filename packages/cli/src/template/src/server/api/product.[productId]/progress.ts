import type { ProgressAPI } from '../../../shared/api';
import { store } from '../../store';

// GET /api/product/:productId/progress - list progress for a product
export const GET = ({ params }: any): ProgressAPI.GetListResponse => {
  const productId = parseInt(params.productId);
  return { progress: store.getProgressByProductId(productId) };
};

// POST /api/product/:productId/progress - create progress entry
export const POST = ({ params, body }: any): ProgressAPI.CreateResponse => {
  const productId = parseInt(params.productId);
  const data = body as ProgressAPI.CreateRequest;
  const created = store.createProgress(productId, data);
  return { created };
};
