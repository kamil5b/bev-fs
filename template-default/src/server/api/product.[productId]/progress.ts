import type { ProductAPI } from '../../../shared/api';

// GET /api/product/:productId/progress - list progress for a product
export const GET = ({ params }: any) => {
  const productId = parseInt(params.productId);
  return {
    productId,
    progress: [
      { id: 1, productId, stage: 'Design', percentage: 100 },
      { id: 2, productId, stage: 'Development', percentage: 75 }
    ]
  };
};

// POST /api/product/:productId/progress - create progress entry
export const POST = ({ params, body }: any) => {
  const productId = parseInt(params.productId);
  const data = body as any;
  return {
    created: {
      id: Math.random(),
      productId,
      ...data
    }
  };
};
