import { describe, it, expect } from 'bun:test'
import {
  convertPathToRoute,
  isIndexFile,
  convertDirNameToSegment,
  createRoute,
} from '../shared/createRoute'

describe('createRoute', () => {
  it('should create a route object with path and api methods', () => {
    const route = createRoute('/users')
    expect(route.path).toBe('/users')
    expect(route.api()).toBe('/api/users')
    expect(route.api('/profile')).toBe('/api/users/profile')
  })

  it('should handle empty suffix in api method', () => {
    const route = createRoute('/products')
    expect(route.api()).toBe('/api/products')
  })

  it('should append custom suffix to api method', () => {
    const route = createRoute('/orders')
    expect(route.api('/status')).toBe('/api/orders/status')
  })
})

describe('convertPathToRoute', () => {
  it('should convert root index.vue to /', () => {
    expect(convertPathToRoute('./router/index.vue')).toBe('/')
    expect(convertPathToRoute('index.vue')).toBe('/')
    expect(convertPathToRoute('router/index.vue')).toBe('/')
  })

  it('should convert simple directory to route', () => {
    expect(convertPathToRoute('./router/product/index.vue')).toBe('/product')
    expect(convertPathToRoute('router/product/index.vue')).toBe('/product')
    expect(convertPathToRoute('./product/index.vue')).toBe('/product')
  })

  it('should convert nested directories to nested routes', () => {
    expect(convertPathToRoute('./router/product/list/index.vue')).toBe(
      '/product/list',
    )
    expect(convertPathToRoute('./router/api/v1/users/index.vue')).toBe(
      '/api/v1/users',
    )
  })

  it('should convert [id] bracket syntax to :id parameter', () => {
    expect(convertPathToRoute('./router/product/[id]/index.vue')).toBe(
      '/product/:id',
    )
    expect(convertPathToRoute('./router/user/[userId]/profile/index.vue')).toBe(
      '/user/:userId/profile',
    )
  })

  it('should handle multiple dynamic segments', () => {
    expect(
      convertPathToRoute('./router/[org]/[repo]/settings/index.vue'),
    ).toBe('/:org/:repo/settings')
  })

  it('should handle different file extensions', () => {
    expect(convertPathToRoute('./router/product/index.ts')).toBe('/product')
    expect(convertPathToRoute('./router/product/index.js')).toBe('/product')
    expect(convertPathToRoute('./router/product/index.vue')).toBe('/product')
  })

  it('should handle complex nested paths with parameters', () => {
    expect(
      convertPathToRoute(
        './router/dashboard/[id]/settings/[tab]/index.vue',
      ),
    ).toBe('/dashboard/:id/settings/:tab')
  })

  it('should work without ./ prefix', () => {
    expect(convertPathToRoute('router/product/index.vue')).toBe('/product')
    expect(convertPathToRoute('product/index.vue')).toBe('/product')
  })

  it('should handle edge case with just filename', () => {
    expect(convertPathToRoute('index.vue')).toBe('/')
  })
})

describe('isIndexFile', () => {
  it('should recognize index.ts as index file', () => {
    expect(isIndexFile('index.ts')).toBe(true)
  })

  it('should recognize index.js as index file', () => {
    expect(isIndexFile('index.js')).toBe(true)
  })

  it('should recognize index.vue as index file', () => {
    expect(isIndexFile('index.vue')).toBe(true)
  })

  it('should not recognize non-index files', () => {
    expect(isIndexFile('main.ts')).toBe(false)
    expect(isIndexFile('component.vue')).toBe(false)
    expect(isIndexFile('utils.js')).toBe(false)
  })

  it('should not recognize index without extension', () => {
    expect(isIndexFile('index')).toBe(false)
  })

  it('should not recognize index with wrong extension', () => {
    expect(isIndexFile('index.tsx')).toBe(false)
    expect(isIndexFile('index.jsx')).toBe(false)
  })
})

describe('convertDirNameToSegment', () => {
  it('should return directory name unchanged for normal names', () => {
    expect(convertDirNameToSegment('product')).toBe('product')
    expect(convertDirNameToSegment('users')).toBe('users')
    expect(convertDirNameToSegment('dashboard')).toBe('dashboard')
  })

  it('should convert [id] bracket syntax to :id parameter', () => {
    expect(convertDirNameToSegment('[id]')).toBe(':id')
    expect(convertDirNameToSegment('[userId]')).toBe(':userId')
  })

  it('should handle multiple bracket parameters', () => {
    expect(convertDirNameToSegment('[org]/[repo]')).toBe(':org/:repo')
  })

  it('should preserve non-bracket characters', () => {
    expect(convertDirNameToSegment('product-[id]')).toBe('product-:id')
  })
})
