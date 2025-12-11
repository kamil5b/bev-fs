/**
 * Composable for Product API
 * Provides reactive API client for product endpoints
 */

import type {
  ProductRequest,
  ProductResponse,
  ProgressRequest,
  ProgressResponse,
  ErrorResponse,
} from '../../shared'

const BASE_URL = '/api'

export function useProductAPI() {
  const list = async (): Promise<ProductResponse.GetList | ErrorResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/product`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

  const get = async (
    id: number,
  ): Promise<ProductResponse.GetById | ErrorResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

  const create = async (
    data: ProductRequest.Create,
  ): Promise<ProductResponse.Create | ErrorResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

  const update = async (
    id: number,
    data: ProductRequest.Update,
  ): Promise<ProductResponse.Update | ErrorResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

  const remove = async (
    id: number,
  ): Promise<ProductResponse.Delete | ErrorResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

  const listProgress = async (
    productId: number,
  ): Promise<ProgressResponse.GetList | ErrorResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${productId}/progress`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

  const getProgress = async (
    productId: number,
    progressId: number,
  ): Promise<ProgressResponse.GetById | ErrorResponse> => {
    try {
      const res = await fetch(
        `${BASE_URL}/product/${productId}/progress/${progressId}`,
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

  const createProgress = async (
    productId: number,
    data: ProgressRequest.Create,
  ): Promise<ProgressResponse.Create | ErrorResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/product/${productId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

  const updateProgress = async (
    productId: number,
    progressId: number,
    data: ProgressRequest.Update,
  ): Promise<ProgressResponse.Update | ErrorResponse> => {
    try {
      const res = await fetch(
        `${BASE_URL}/product/${productId}/progress/${progressId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

  const deleteProgress = async (
    productId: number,
    progressId: number,
  ): Promise<ProgressResponse.Delete | ErrorResponse> => {
    try {
      const res = await fetch(
        `${BASE_URL}/product/${productId}/progress/${progressId}`,
        {
          method: 'DELETE',
        },
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

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
    deleteProgress,
  }
}
