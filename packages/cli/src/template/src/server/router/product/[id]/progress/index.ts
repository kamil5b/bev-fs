import { getProductProgress, createProductProgress } from '../../../../handler/product.handler';

// GET /api/product/:id/progress - list progress for a product
export const GET = ({ params }: any) => {
  return getProductProgress(params);
};

// POST /api/product/:id/progress - create progress entry
export const POST = ({ params, body }: any) => {
  return createProductProgress(params, body);
};
