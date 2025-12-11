import { productRepository } from '../repository/product.repository'
import {
  ProductRequest,
  ProductResponse,
  ProgressRequest,
  ProgressResponse,
} from '../../shared'

export const productService = {
  // Product operations
  listProducts(): ProductResponse.GetList {
    const products = productRepository.getAllProducts()
    return { products }
  },

  getProduct(id: number): ProductResponse.GetById {
    const product = productRepository.getProductById(id)
    return {
      product: product || { id, name: `Product ${id}`, price: 0 },
    }
  },

  createProduct(data: ProductRequest.Create): ProductResponse.Create {
    const created = productRepository.createProduct(data)
    return { created }
  },

  updateProduct(
    id: number,
    data: ProductRequest.Update,
  ): ProductResponse.Update {
    const updated = productRepository.updateProduct(id, data)
    return {
      updated: updated || { id, name: `Product ${id}`, price: 0 },
    }
  },

  deleteProduct(id: number): ProductResponse.Delete {
    productRepository.deleteProduct(id)
    return { deleted: id }
  },

  // Progress operations
  listProductProgress(productId: number): ProgressResponse.GetList {
    const progress = productRepository.getProgressByProductId(productId)
    return { progress }
  },

  getProductProgress(
    productId: number,
    progressId: number,
  ): ProgressResponse.GetById {
    const progress = productRepository.getProgressById(productId, progressId)
    return {
      progress: progress || {
        id: progressId,
        productId,
        percentage: 0,
        status: 'pending',
        createdAt: '',
        updatedAt: '',
      },
    }
  },

  createProductProgress(
    productId: number,
    data: ProgressRequest.Create,
  ): ProgressResponse.Create {
    const created = productRepository.createProgress(productId, data)
    return { created }
  },

  updateProductProgress(
    productId: number,
    progressId: number,
    data: ProgressRequest.Update,
  ): ProgressResponse.Update {
    const updated = productRepository.updateProgress(
      productId,
      progressId,
      data,
    )
    return {
      updated: updated || {
        id: progressId,
        productId,
        percentage: 0,
        status: 'pending',
        createdAt: '',
        updatedAt: '',
      },
    }
  },

  deleteProductProgress(
    productId: number,
    progressId: number,
  ): ProgressResponse.Delete {
    productRepository.deleteProgress(productId, progressId)
    return { deleted: progressId }
  },
}
