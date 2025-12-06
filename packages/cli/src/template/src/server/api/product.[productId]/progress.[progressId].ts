// GET /api/product/:productId/progress/:progressId - get progress by id
export const GET = ({ params }: any) => {
  const productId = parseInt(params.productId);
  const progressId = parseInt(params.progressId);
  return {
    id: progressId,
    productId,
    stage: 'Development',
    percentage: 75,
    updated_at: new Date().toISOString()
  };
};

// PATCH /api/product/:productId/progress/:progressId - update progress
export const PATCH = ({ params, body }: any) => {
  const productId = parseInt(params.productId);
  const progressId = parseInt(params.progressId);
  const data = body as any;
  return {
    updated: {
      id: progressId,
      productId,
      ...data
    }
  };
};

// DELETE /api/product/:productId/progress/:progressId - delete progress
export const DELETE = ({ params }: any) => {
  const progressId = parseInt(params.progressId);
  return { deleted: progressId };
};
