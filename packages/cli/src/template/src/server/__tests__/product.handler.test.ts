import { describe, it, expect, beforeEach } from 'bun:test'
import {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductProgress,
  createProductProgress,
  getProgressDetail,
  updateProgressDetail,
  deleteProgressDetail,
} from '../handler/product.handler'
import { store } from '../db/store'

describe('ProductHandler', () => {
  beforeEach(() => {
    // Reset store before each test
    store.products = [
      { id: 1, name: 'Product 1', price: 9.99 },
      { id: 2, name: 'Product 2', price: 19.99 },
    ]
    store.productProgress = [
      {
        id: 1,
        productId: 1,
        percentage: 50,
        status: 'in-progress',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-02').toISOString(),
      },
      {
        id: 2,
        productId: 2,
        percentage: 100,
        status: 'completed',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-03').toISOString(),
      },
    ]
  })

  describe('Product Handlers', () => {
    it('should get products list', () => {
      const result = getProducts()

      expect(result.products).toHaveLength(2)
      expect(result.products[0].name).toBe('Product 1')
    })

    it('should create a product', () => {
      const result = createProduct({ name: 'New Product', price: 29.99 })

      expect(result.created).toBeDefined()
      expect(result.created.id).toBe(3)
      expect(result.created.name).toBe('New Product')
    })

    it('should get product by id', () => {
      const result = getProduct({ id: '1' })

      expect(result.product).toBeDefined()
      expect(result.product.id).toBe(1)
      expect(result.product.name).toBe('Product 1')
    })

    it('should parse string id parameter correctly', () => {
      const result = getProduct({ id: '2' })

      expect(result.product.id).toBe(2)
      expect(result.product.name).toBe('Product 2')
    })

    it('should handle non-existent product id', () => {
      const result = getProduct({ id: '999' })

      expect(result.product.id).toBe(999)
      expect(result.product.name).toBe('Product 999')
    })

    it('should update a product', () => {
      const result = updateProduct(
        { id: '1' },
        { name: 'Updated', price: 15.99 },
      )

      expect(result.updated.id).toBe(1)
      expect(result.updated.name).toBe('Updated')
      expect(result.updated.price).toBe(15.99)
    })

    it('should delete a product', () => {
      const result = deleteProduct({ id: '1' })

      expect(result.deleted).toBe(1)
      expect(store.products).toHaveLength(1)
    })
  })

  describe('Progress Handlers', () => {
    it('should get product progress list', () => {
      const result = getProductProgress({ id: '1' })

      expect(result.progress).toHaveLength(1)
      expect(result.progress[0].productId).toBe(1)
    })

    it('should parse product id correctly', () => {
      const result = getProductProgress({ id: '2' })

      expect(result.progress).toHaveLength(1)
      expect(result.progress[0].productId).toBe(2)
    })

    it('should create product progress', () => {
      const result = createProductProgress(
        { id: '1' },
        { percentage: 75, status: 'in-progress' },
      )

      expect(result.created).toBeDefined()
      expect(result.created.productId).toBe(1)
      expect(result.created.percentage).toBe(75)
      expect(result.created.status).toBe('in-progress')
    })

    it('should get progress detail', () => {
      const result = getProgressDetail({ id: '1', progressId: '1' })

      expect(result.progress).toBeDefined()
      expect(result.progress.id).toBe(1)
      expect(result.progress.productId).toBe(1)
      expect(result.progress.percentage).toBe(50)
    })

    it('should parse both product id and progress id correctly', () => {
      const result = getProgressDetail({ id: '2', progressId: '2' })

      expect(result.progress.productId).toBe(2)
      expect(result.progress.id).toBe(2)
      expect(result.progress.percentage).toBe(100)
    })

    it('should update progress detail', () => {
      const result = updateProgressDetail(
        { id: '1', progressId: '1' },
        { percentage: 90, status: 'almost-done' },
      )

      expect(result.updated).toBeDefined()
      expect(result.updated.id).toBe(1)
      expect(result.updated.productId).toBe(1)
      expect(result.updated.percentage).toBe(90)
      expect(result.updated.status).toBe('almost-done')
    })

    it('should delete progress detail', () => {
      const result = deleteProgressDetail({ id: '1', progressId: '1' })

      expect(result.deleted).toBe(1)
      expect(store.productProgress).toHaveLength(1)
    })

    it('should handle numeric string ids correctly', () => {
      const result = getProgressDetail({ id: '001', progressId: '001' })

      expect(result.progress.productId).toBe(1)
      expect(result.progress.id).toBe(1)
    })
  })

  describe('Parameter Validation', () => {
    it('should handle invalid id parameter gracefully', () => {
      const result = getProduct({ id: 'invalid' })

      // parseInt('invalid') returns NaN
      expect(result.product.id).toBeNaN()
    })

    it('should handle missing id parameter', () => {
      const result = getProduct({ id: '' })

      expect(result.product.id).toBeNaN()
    })

    it('should handle missing progressId parameter', () => {
      const result = getProgressDetail({ id: '1', progressId: '' })

      expect(result.progress.id).toBeNaN()
    })
  })
})
