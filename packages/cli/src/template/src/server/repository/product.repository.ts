import { store } from '../db/store'
import {
  ProductRequest,
  ProductResponse,
  ProgressRequest,
  ProgressResponse,
} from '../../shared'

export const productRepository = {
  // Product operations
  getAllProducts(): ProductResponse.GetList['products'] {
    return store.products
  },

  getProductById(id: number) {
    return store.products.find((p: any) => p.id === id)
  },

  createProduct(data: ProductRequest.Create) {
    const newProduct = {
      id: Math.max(...store.products.map((p) => p.id), 0) + 1,
      name: data.name,
      price: data.price,
    }
    store.products.push(newProduct)
    return newProduct
  },

  updateProduct(id: number, data: ProductRequest.Update) {
    const product = this.getProductById(id)
    if (product) {
      if (data.name !== undefined) product.name = data.name
      if (data.price !== undefined) product.price = data.price
    }
    return product
  },

  deleteProduct(id: number): boolean {
    const index = store.products.findIndex((p: any) => p.id === id)
    if (index !== -1) {
      store.products.splice(index, 1)
      return true
    }
    return false
  },

  // Progress operations
  getProgressByProductId(productId: number) {
    return store.productProgress.filter((p) => p.productId === productId)
  },

  getProgressById(productId: number, id: number) {
    return store.productProgress.find(
      (p) => p.productId === productId && p.id === id,
    )
  },

  createProgress(productId: number, data: ProgressRequest.Create) {
    // Find max id for this product
    const maxId = store.productProgress
      .filter((p) => p.productId === productId)
      .reduce((max, p) => Math.max(max, p.id), 0)
    const newProgress = {
      id: maxId + 1,
      percentage: data.percentage,
      productId, // always use the argument
      status: data.status || 'pending',
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    store.productProgress.push(newProgress)
    return newProgress
  },

  updateProgress(productId: number, id: number, data: ProgressRequest.Update) {
    const progress = store.productProgress.find(
      (p) => p.productId === productId && p.id === id,
    )
    if (!progress) return null
    if (data.percentage !== undefined) progress.percentage = data.percentage
    if (data.description !== undefined) progress.description = data.description
    if (data.status !== undefined) progress.status = data.status
    progress.updatedAt = new Date().toISOString()
    return progress
  },

  deleteProgress(productId: number, id: number) {
    const index = store.productProgress.findIndex(
      (p) => p.productId === productId && p.id === id,
    )
    if (index === -1) return false
    store.productProgress.splice(index, 1)
    return true
  },
}
