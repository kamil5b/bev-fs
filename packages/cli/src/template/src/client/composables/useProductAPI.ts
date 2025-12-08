/**
 * Composable for Product API
 * Provides reactive API client for product endpoints
 */

import type { ProductRequest, ProductResponse, ProgressRequest, ProgressResponse } from '../../shared';

const BASE_URL = '/api';

/**
 * Helper to handle API errors consistently
 */
function handleApiError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, message: 'API request failed', error: message };
}

export function useProductAPI() {
  const list = async (): Promise<ProductResponse.GetList | ReturnType<typeof handleApiError>> => {
    try {
      const res = await fetch(`${BASE_URL}/product`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (error) {
      return handleApiError(error);
    }
  };

  const get = async (id: number): Promise<ProductResponse.GetById | ReturnType<typeof handleApiError>> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (error) {
      return handleApiError(error);
    }
  };

  const create = async (data: ProductRequest.Create): Promise<ProductResponse.Create | ReturnType<typeof handleApiError>> => {
    try {
      const res = await fetch(`${BASE_URL}/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (error) {
      return handleApiError(error);
    }
  };

  const update = async (id: number, data: ProductRequest.Update): Promise<ProductResponse.Update | ReturnType<typeof handleApiError>> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (error) {
      return handleApiError(error);
    }
  };

  const remove = async (id: number): Promise<ProductResponse.Delete | ReturnType<typeof handleApiError>> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (error) {
      return handleApiError(error);
    }
  };

  const listProgress = async (productId: number): Promise<ProgressResponse.GetList | ReturnType<typeof handleApiError>> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${productId}/progress`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (error) {
      return handleApiError(error);
    }
  };

  const createProgress = async (
    productId: number,
    data: any
  ): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${productId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (error) {
      return handleApiError(error);
    }
  };

  const updateProgress = async (
    productId: number,
    progressId: number,
    data: any
  ): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${productId}/progress/${progressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (error) {
      return handleApiError(error);
    }
  };

  const deleteProgress = async (
    productId: number,
    progressId: number
  ): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${productId}/progress/${progressId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (error) {
      return handleApiError(error);
    }
  };

  return {
    list,
    get,
    create,
    update,
    remove,
    listProgress,
    createProgress,
    updateProgress,
    deleteProgress
  };
}
