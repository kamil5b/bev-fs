
export interface Progress {
  id: number;
  productId: number;
  percentage: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
  updatedAt: string;
}