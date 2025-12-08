/**
 * Composable for Product API
 * Provides reactive API client for product endpoints
 */

import type { ProductRequest, ProductResponse, ProgressRequest, ProgressResponse } from '../../../../base/src/shared';

const BASE_URL = '/api';

export function useProductAPI() {
  const list = async (): Promise<ProductResponse.GetList> => {
    const res = await fetch(`${BASE_URL}/product`);
    return res.json();
  };

  const get = async (id: number): Promise<ProductResponse.GetById> => {
    const res = await fetch(`${BASE_URL}/product/${id}`);
    return res.json();
  };

  const create = async (data: ProductRequest.Create): Promise<ProductResponse.Create> => {
    const res = await fetch(`${BASE_URL}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  };

  const update = async (id: number, data: ProductRequest.Update): Promise<ProductResponse.Update> => {
    const res = await fetch(`${BASE_URL}/product/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  };

  const remove = async (id: number): Promise<ProductResponse.Delete> => {
    const res = await fetch(`${BASE_URL}/product/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  };

  const listProgress = async (productId: number): Promise<ProgressResponse.GetList> => {
    const res = await fetch(`${BASE_URL}/product/${productId}/progress`);
    return res.json();
  };

  const getProgress = async (productId: number, progressId: number): Promise<ProgressResponse.GetById> => {
    const res = await fetch(`${BASE_URL}/product/${productId}/progress/${progressId}`);
    return res.json();
  };

  const createProgress = async (productId: number, data: ProgressRequest.Create): Promise<ProgressResponse.Create> => {
    const res = await fetch(`${BASE_URL}/product/${productId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  };

  const updateProgress = async (productId: number, progressId: number, data: ProgressRequest.Update): Promise<ProgressResponse.Update> => {
    const res = await fetch(`${BASE_URL}/product/${productId}/progress/${progressId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  };

  const deleteProgress = async (productId: number, progressId: number): Promise<ProgressResponse.Delete> => {
    const res = await fetch(`${BASE_URL}/product/${productId}/progress/${progressId}`, {
      method: 'DELETE'
    });
    return res.json();
  };

  return {
    list,
    get,
    create,
    update,
    remove,
    listProgress,
    getProgress,
    createProgress,
    updateProgress,
    deleteProgress
  };
}
