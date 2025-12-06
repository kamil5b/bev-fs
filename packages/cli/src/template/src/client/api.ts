/**
 * Type-safe API client for frontend
 * Provides typed methods for all API endpoints
 */

import type { ProductAPI, UserAPI } from '../shared/api';

const BASE_URL = '/api';

/**
 * Product API client
 */
export const productAPI = {
  async list(): Promise<ProductAPI.GetListResponse> {
    const res = await fetch(`${BASE_URL}/product`);
    return res.json();
  },

  async getById(id: number): Promise<ProductAPI.GetByIdResponse> {
    const res = await fetch(`${BASE_URL}/product/${id}`);
    return res.json();
  },

  async create(data: ProductAPI.CreateRequest): Promise<ProductAPI.CreateResponse> {
    const res = await fetch(`${BASE_URL}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async update(id: number, data: ProductAPI.UpdateRequest): Promise<ProductAPI.UpdateResponse> {
    const res = await fetch(`${BASE_URL}/product/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async delete(id: number): Promise<ProductAPI.DeleteResponse> {
    const res = await fetch(`${BASE_URL}/product/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};
