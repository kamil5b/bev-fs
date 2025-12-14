import { describe, it, expect, beforeEach } from 'bun:test'
import { productRepository } from '../repository/product.repository'
import { store } from '../db/store'

describe('ProductRepository', () => {
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

  describe('Product Operations', () => {
    it('should get all products', () => {
      const products = productRepository.getAllProducts()
      expect(products).toHaveLength(2)
      expect(products[0].id).toBe(1)
      expect(products[1].id).toBe(2)
    })

    it('should return empty array when no products exist', () => {
      store.products = []
      const products = productRepository.getAllProducts()
      expect(products).toHaveLength(0)
    })

    it('should get product by id', () => {
      const product = productRepository.getProductById(1)
      expect(product).toBeDefined()
      expect(product?.id).toBe(1)
      expect(product?.name).toBe('Product 1')
      expect(product?.price).toBe(9.99)
    })

    it('should return undefined for non-existent product', () => {
      const product = productRepository.getProductById(999)
      expect(product).toBeUndefined()
    })

    it('should create a new product', () => {
      const created = productRepository.createProduct({
        name: 'New Product',
        price: 29.99,
      })

      expect(created).toBeDefined()
      expect(created.id).toBe(3)
      expect(created.name).toBe('New Product')
      expect(created.price).toBe(29.99)
      expect(store.products).toHaveLength(3)
    })

    it('should generate correct id for new product', () => {
      productRepository.createProduct({ name: 'Product 3', price: 29.99 })
      const created = productRepository.createProduct({
        name: 'Product 4',
        price: 39.99,
      })

      expect(created.id).toBe(4)
    })

    it('should update product name', () => {
      const updated = productRepository.updateProduct(1, {
        name: 'Updated Name',
      })

      expect(updated).toBeDefined()
      expect(updated?.name).toBe('Updated Name')
      expect(updated?.price).toBe(9.99) // unchanged
    })

    it('should update product price', () => {
      const updated = productRepository.updateProduct(1, { price: 15.99 })

      expect(updated).toBeDefined()
      expect(updated?.name).toBe('Product 1') // unchanged
      expect(updated?.price).toBe(15.99)
    })

    it('should update both name and price', () => {
      const updated = productRepository.updateProduct(1, {
        name: 'New Name',
        price: 25.99,
      })

      expect(updated?.name).toBe('New Name')
      expect(updated?.price).toBe(25.99)
    })

    it('should return undefined when updating non-existent product', () => {
      const updated = productRepository.updateProduct(999, {
        name: 'Not Found',
      })

      expect(updated).toBeUndefined()
    })

    it('should not modify other products when updating', () => {
      productRepository.updateProduct(1, { name: 'Updated' })

      const product2 = productRepository.getProductById(2)
      expect(product2?.name).toBe('Product 2')
    })

    it('should delete a product', () => {
      const deleted = productRepository.deleteProduct(1)

      expect(deleted).toBe(true)
      expect(store.products).toHaveLength(1)
      expect(productRepository.getProductById(1)).toBeUndefined()
    })

    it('should return false when deleting non-existent product', () => {
      const deleted = productRepository.deleteProduct(999)

      expect(deleted).toBe(false)
      expect(store.products).toHaveLength(2) // unchanged
    })
  })

  describe('Progress Operations', () => {
    it('should get progress by product id', () => {
      const progress = productRepository.getProgressByProductId(1)

      expect(progress).toHaveLength(1)
      expect(progress[0].id).toBe(1)
      expect(progress[0].productId).toBe(1)
    })

    it('should return empty array when product has no progress', () => {
      const progress = productRepository.getProgressByProductId(999)

      expect(progress).toHaveLength(0)
    })

    it('should get progress by product id and progress id', () => {
      const progress = productRepository.getProgressById(1, 1)

      expect(progress).toBeDefined()
      expect(progress?.id).toBe(1)
      expect(progress?.productId).toBe(1)
    })

    it('should return undefined for non-existent progress', () => {
      const progress = productRepository.getProgressById(1, 999)

      expect(progress).toBeUndefined()
    })

    it('should create progress for product', () => {
      const created = productRepository.createProgress(1, {
        percentage: 75,
        status: 'in-progress',
        description: 'Test progress',
      })

      expect(created).toBeDefined()
      expect(created.id).toBe(2)
      expect(created.productId).toBe(1)
      expect(created.percentage).toBe(75)
      expect(created.status).toBe('in-progress')
      expect(created.description).toBe('Test progress')
      expect(created.createdAt).toBeDefined()
      expect(created.updatedAt).toBeDefined()
    })

    it('should set default status to pending', () => {
      const created = productRepository.createProgress(1, {
        percentage: 50,
      })

      expect(created.status).toBe('pending')
    })

    it('should generate correct progress id per product', () => {
      const p1 = productRepository.createProgress(1, { percentage: 30 })
      const p2 = productRepository.createProgress(1, { percentage: 40 })

      expect(p1.id).toBe(2)
      expect(p2.id).toBe(3)
    })

    it('should allow same progress id for different products', () => {
      // Progress IDs are generated per-product based on max ID for that product
      const p1 = productRepository.createProgress(1, { percentage: 30 })
      const p2 = productRepository.createProgress(2, { percentage: 50 })

      // p1: max for product 1 is 1, so new id is 2
      // p2: max for product 2 is 2, so new id is 3
      expect(p1.id).toBe(2)
      expect(p2.id).toBe(3)
      expect(p1.productId).toBe(1)
      expect(p2.productId).toBe(2)
    })

    it('should update progress percentage', () => {
      const updated = productRepository.updateProgress(1, 1, {
        percentage: 90,
      })

      expect(updated).toBeDefined()
      expect(updated?.percentage).toBe(90)
      expect(updated?.status).toBe('in-progress') // unchanged
    })

    it('should update progress status', () => {
      const updated = productRepository.updateProgress(1, 1, {
        status: 'completed',
      })

      expect(updated?.status).toBe('completed')
      expect(updated?.percentage).toBe(50) // unchanged
    })

    it('should update progress description', () => {
      const updated = productRepository.updateProgress(1, 1, {
        description: 'Updated description',
      })

      expect(updated?.description).toBe('Updated description')
    })

    it('should update updatedAt timestamp when updating progress', () => {
      const before = store.productProgress[0].updatedAt
      const updated = productRepository.updateProgress(1, 1, {
        percentage: 80,
      })

      expect(updated?.updatedAt).not.toBe(before)
    })

    it('should return null when updating non-existent progress', () => {
      const updated = productRepository.updateProgress(1, 999, {
        percentage: 50,
      })

      expect(updated).toBeNull()
    })

    it('should delete progress', () => {
      const deleted = productRepository.deleteProgress(1, 1)

      expect(deleted).toBe(true)
      expect(store.productProgress).toHaveLength(1)
      expect(productRepository.getProgressById(1, 1)).toBeUndefined()
    })

    it('should return false when deleting non-existent progress', () => {
      const deleted = productRepository.deleteProgress(1, 999)

      expect(deleted).toBe(false)
      expect(store.productProgress).toHaveLength(2) // unchanged
    })

    it('should not delete progress from other products', () => {
      productRepository.deleteProgress(1, 1)

      const otherProgress = productRepository.getProgressById(2, 2)
      expect(otherProgress).toBeDefined()
    })
  })
})
