import type { ProgressAPI } from '../../../../../../shared/api';
import { store } from '../../../../../store';

// GET /api/product/:id/progress/:progressId - get progress by id
export const GET = ({ params }: any): ProgressAPI.GetByIdResponse => {
  const productId = parseInt(params.id);
  const progressId = parseInt(params.progressId);
  const progress = store.getProgressById(productId, progressId);
  return { progress: progress || { id: progressId, productId, percentage: 0, status: 'pending', createdAt: '', updatedAt: '' } };
};

// PATCH /api/product/:id/progress/:progressId - update progress
export const PATCH = ({ params, body }: any): ProgressAPI.UpdateResponse => {
  const productId = parseInt(params.id);
  const progressId = parseInt(params.progressId);
  const data = body as ProgressAPI.UpdateRequest;
  const updated = store.updateProgress(productId, progressId, data);
  return { updated: updated || { id: progressId, productId, percentage: 0, status: 'pending', createdAt: '', updatedAt: '' } };
};

// DELETE /api/product/:id/progress/:progressId - delete progress
export const DELETE = ({ params }: any): ProgressAPI.DeleteResponse => {
  const productId = parseInt(params.id);
  const progressId = parseInt(params.progressId);
  const deleted = store.deleteProgress(productId, progressId);
  return { deleted };
};
