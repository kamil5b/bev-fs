import { describe, it, expect, beforeEach } from 'bun:test'
import { productService } from '../service/product.service'
import { store } from '../db/store'

describe('ProductService', () => {
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
    it('should list all products', () => {
      const result = productService.listProducts()
      expect(result.products).toHaveLength(2)
      expect(result.products[0].name).toBe('Product 1')
      expect(result.products[1].name).toBe('Product 2')
    })

    it('should get product by id', () => {
      const result = productService.getProduct(1)
      expect(result.product).toBeDefined()
      expect(result.product.id).toBe(1)
      expect(result.product.name).toBe('Product 1')
      expect(result.product.price).toBe(9.99)
    })

    it('should return default product for non-existent id', () => {
      const result = productService.getProduct(999)
      expect(result.product).toBeDefined()
      expect(result.product.id).toBe(999)
      expect(result.product.name).toBe('Product 999')
      expect(result.product.price).toBe(0)
    })

    it('should create a new product', () => {
      const result = productService.createProduct({
        name: 'New Product',
        price: 29.99,
      })
      expect(result.created).toBeDefined()
      expect(result.created.id).toBe(3)
      expect(result.created.name).toBe('New Product')
      expect(result.created.price).toBe(29.99)
      expect(store.products).toHaveLength(3)
    })

    it('should update an existing product', () => {
      const result = productService.updateProduct(1, {
        name: 'Updated Product',
        price: 15.99,
      })
      expect(result.updated).toBeDefined()
      expect(result.updated.id).toBe(1)
      expect(result.updated.name).toBe('Updated Product')
      expect(result.updated.price).toBe(15.99)
    })

    it('should update only name when price is not provided', () => {
      const result = productService.updateProduct(1, { name: 'Only Name' })
      expect(result.updated.name).toBe('Only Name')
      expect(result.updated.price).toBe(9.99) // unchanged
    })

    it('should update only price when name is not provided', () => {
      const result = productService.updateProduct(2, { price: 25.0 })
      expect(result.updated.name).toBe('Product 2') // unchanged
      expect(result.updated.price).toBe(25.0)
    })

    it('should return default for non-existent product update', () => {
      const result = productService.updateProduct(999, {
        name: 'Not Found',
      })
      expect(result.updated.id).toBe(999)
      expect(result.updated.name).toBe('Product 999')
    })

    it('should delete a product', () => {
      const result = productService.deleteProduct(1)
      expect(result.deleted).toBe(1)
      expect(store.products).toHaveLength(1)
      expect(store.products[0].id).toBe(2)
    })

    it('should handle deletion of non-existent product', () => {
      const result = productService.deleteProduct(999)
      expect(result.deleted).toBe(999)
      expect(store.products).toHaveLength(2) // unchanged
    })
  })

  describe('Progress Operations', () => {
    it('should list progress for a product', () => {
      const result = productService.listProductProgress(1)
      expect(result.progress).toHaveLength(1)
      expect(result.progress[0].id).toBe(1)
      expect(result.progress[0].productId).toBe(1)
    })

    it('should return empty list for product with no progress', () => {
      const result = productService.listProductProgress(999)
      expect(result.progress).toHaveLength(0)
    })

    it('should get progress by id', () => {
      const result = productService.getProductProgress(1, 1)
      expect(result.progress).toBeDefined()
      expect(result.progress.id).toBe(1)
      expect(result.progress.productId).toBe(1)
      expect(result.progress.percentage).toBe(50)
      expect(result.progress.status).toBe('in-progress')
    })

    it('should return default progress for non-existent progress id', () => {
      const result = productService.getProductProgress(1, 999)
      expect(result.progress).toBeDefined()
      expect(result.progress.id).toBe(999)
      expect(result.progress.productId).toBe(1)
      expect(result.progress.percentage).toBe(0)
      expect(result.progress.status).toBe('pending')
    })

    it('should create product progress', () => {
      const result = productService.createProductProgress(1, {
        percentage: 75,
        status: 'in-progress',
        description: 'Halfway done',
      })
      expect(result.created).toBeDefined()
      expect(result.created.id).toBe(2)
      expect(result.created.productId).toBe(1)
      expect(result.created.percentage).toBe(75)
      expect(result.created.status).toBe('in-progress')
      expect(result.created.description).toBe('Halfway done')
      expect(store.productProgress).toHaveLength(3)
    })

    it('should create progress with default status when not provided', () => {
      const result = productService.createProductProgress(1, {
        percentage: 50,
      })
      expect(result.created.status).toBe('pending')
    })

    it('should update product progress', () => {
      const result = productService.updateProductProgress(1, 1, {
        percentage: 90,
        status: 'almost-done',
      })
      expect(result.updated).toBeDefined()
      expect(result.updated.id).toBe(1)
      expect(result.updated.percentage).toBe(90)
      expect(result.updated.status).toBe('almost-done')
    })

    it('should update only percentage when status is not provided', () => {
      const result = productService.updateProductProgress(1, 1, {
        percentage: 85,
      })
      expect(result.updated.percentage).toBe(85)
      expect(result.updated.status).toBe('in-progress') // unchanged
    })

    it('should update only status when percentage is not provided', () => {
      const result = productService.updateProductProgress(2, 2, {
        status: 'archived',
      })
      expect(result.updated.percentage).toBe(100) // unchanged
      expect(result.updated.status).toBe('archived')
    })

    it('should return default for non-existent progress update', () => {
      const result = productService.updateProductProgress(1, 999, {
        percentage: 50,
      })
      expect(result.updated.id).toBe(999)
      expect(result.updated.productId).toBe(1)
    })

    it('should delete product progress', () => {
      const result = productService.deleteProductProgress(1, 1)
      expect(result.deleted).toBe(1)
      expect(store.productProgress).toHaveLength(1)
    })

    it('should handle deletion of non-existent progress', () => {
      const result = productService.deleteProductProgress(1, 999)
      expect(result.deleted).toBe(999)
      expect(store.productProgress).toHaveLength(2) // unchanged
    })
  })
})
