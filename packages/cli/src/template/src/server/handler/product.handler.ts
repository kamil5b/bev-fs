import type { ProductRequest, ProgressRequest } from '../../shared'
import { productService } from '../service/product.service'

// Product List Handler
export const getProducts = () => {
  return productService.listProducts()
}

// Product Create Handler
export const createProduct = (body: ProductRequest.Create) => {
  return productService.createProduct(body)
}

// Product Detail Handler
export const getProduct = (params: Record<string, string>) => {
  const id = parseInt(params.id)
  return productService.getProduct(id)
}

// Product Update Handler
export const updateProduct = (
  params: Record<string, string>,
  body: ProductRequest.Update,
) => {
  const id = parseInt(params.id)
  return productService.updateProduct(id, body)
}

// Product Delete Handler
export const deleteProduct = (params: Record<string, string>) => {
  const id = parseInt(params.id)
  return productService.deleteProduct(id)
}

// Progress List Handler
export const getProductProgress = (params: Record<string, string>) => {
  const productId = parseInt(params.id)
  return productService.listProductProgress(productId)
}

// Progress Create Handler
export const createProductProgress = (
  params: Record<string, string>,
  body: ProgressRequest.Create,
) => {
  const productId = parseInt(params.id)
  return productService.createProductProgress(productId, body)
}

// Progress Detail Handler
export const getProgressDetail = (params: Record<string, string>) => {
  const productId = parseInt(params.id)
  const progressId = parseInt(params.progressId)
  return productService.getProductProgress(productId, progressId)
}

// Progress Update Handler
export const updateProgressDetail = (
  params: Record<string, string>,
  body: ProgressRequest.Update,
) => {
  const productId = parseInt(params.id)
  const progressId = parseInt(params.progressId)
  return productService.updateProductProgress(productId, progressId, body)
}

// Progress Delete Handler
export const deleteProgressDetail = (params: Record<string, string>) => {
  const productId = parseInt(params.id)
  const progressId = parseInt(params.progressId)
  return productService.deleteProductProgress(productId, progressId)
}
