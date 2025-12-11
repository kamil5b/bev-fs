# bev-fs Framework

A minimal, opinionated full-stack framework for building modern applications with **Bun**, **Elysia**, and **Vue 3**.

## Overview

**bev-fs** (Bun Elysia Vue Fullstack) provides a zero-config, directory-based routing framework that eliminates boilerplate and enables type-safe communication between frontend and backend.

**Key features:**

- 🎯 Automatic directory-based routing (both client & server)
- 🔧 Type-safe API integration with shared types
- ⚡ Minimal overhead — use only what you need
- 📦 Composable and modular
- 🎨 Built-in patterns for clean architecture

## Installation

```bash
npm install bev-fs
```

**Requirements:**

- Node 18+ or Bun 1.0+
- Vue 3
- Elysia
- TypeScript 4.7+

## Core Modules

The framework exports four main utilities:

### 1. Client: `createFrameworkApp()`

Initializes your Vue 3 app with automatic directory-based routing.

```typescript
import { createFrameworkApp } from 'bev-fs'
import App from './App.vue'

const { app, router } = createFrameworkApp(App, {
  routeModules: import.meta.glob('./router/**/index.vue', { eager: true }),
})

app.mount('#app')
```

**Parameters:**

- `rootComponent` — Your root Vue component
- `opts` (optional) — Configuration:
  - `routeModules` — Result of `import.meta.glob()` for auto-discovery
  - `routes` — Manual route definitions (overrides glob)
  - `historyMode` — Use HTML5 history (default: `true`)

**Returns:**

```typescript
{
  app: App,              // Vue app instance
  router: Router         // Vue Router instance
}
```

#### Route Discovery

File structure automatically converts to routes:

```
src/router/
├── index.vue                          → /
├── product/
│   ├── index.vue                      → /product
│   └── [id]/
│       ├── index.vue                  → /product/:id
│       └── progress/
│           └── index.vue              → /product/:id/progress
└── not-found/
    └── index.vue                      → /:pathMatch(.*)*  (catch-all)
```

**Rules:**

- Only `index.vue` files in `router/` directories are processed
- Directory names become route segments
- `[paramName]` brackets convert to `:paramName` parameters
- `not-found` or `404` directories create `/:pathMatch(.*)*` catch-all
- Catch-all route is always last (lowest priority)

**Example structure:**

```typescript
// src/router/product/[id]/index.vue
<template>
  <div>
    <h1>Product {{ $route.params.id }}</h1>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
const route = useRoute();
// Access route params, query, etc.
</script>
```

---

### 2. Server: `createFrameworkServer()`

Sets up an Elysia server with automatic API routing and configuration.

```typescript
import { createFrameworkServer } from 'bev-fs'
import path from 'path'

const server = await createFrameworkServer({
  routerDir: path.join(process.cwd(), 'src/server/router'),
  staticDir: path.join(process.cwd(), 'dist/client'),
  port: 3000,
})

await server.listen()
```

**Parameters:**

```typescript
{
  routerDir?: string;         // API router directory (default: src/server/router)
  staticDir?: string;         // Static client files (default: dist/client)
  port?: number;              // Server port (default: 3000)
  env?: "development" | "production";  // Environment mode
  middleware?: Middleware[];  // Custom middleware functions
  config?: ServerConfig;      // Server configuration
}
```

**Returns:**

```typescript
{
  app: Elysia,               // Elysia app instance
  listen: () => void         // Start server
}
```

#### API Route Discovery

Routes are discovered from your `src/server/router/` directory:

```
src/server/router/
├── index.ts                           → GET /api
├── product/
│   ├── index.ts                       → GET/POST /api/product
│   └── [id]/
│       ├── index.ts                   → GET/PUT/DELETE /api/product/:id
│       └── progress/
│           └── index.ts               → GET /api/product/:id/progress
└── upload/
    └── index.ts                       → POST /api/upload
```

**Handler structure:**

```typescript
// src/server/router/product/[id]/index.ts
import type { RouteModule, Context } from 'bev-fs'

export const GET: RouteHandler = async (ctx: Context) => {
  const productId = ctx.params.id
  // Fetch and return product
  return { id: productId, name: 'Product' }
}

export const PUT: RouteHandler = async (ctx: Context) => {
  const data = ctx.body as { name: string }
  // Update product
  return { success: true }
}

export const DELETE: RouteHandler = async (ctx: Context) => {
  // Delete product
  return { deleted: true }
}
```

**Supported HTTP methods:**

- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- `default` — Handles all methods not explicitly defined

---

### 3. Shared: `createRoute()`

Helper for type-safe route definitions and API path generation.

```typescript
import { createRoute } from 'bev-fs'

const productRoute = createRoute('/product')

// Generate API paths
const listUrl = productRoute.api() // /api/product
const detailUrl = productRoute.api('/1') // /api/product/1
```

---

### 4. Shared: TypeScript Types

Pre-defined types for handlers and middleware:

```typescript
import type { Context, RouteHandler, RouteModule, Middleware } from 'bev-fs'

// Context passed to all handlers
interface Context {
  params: Record<string, string> // Route params :id, etc
  body?: unknown // Request body
  query?: Record<string, string> // Query string params
  headers: Record<string, string> // Request headers
  request?: Request // Raw Request object
  set?: {
    // Response configuration
    headers: Record<string, string>
    status?: number
  }
}

// Individual route handler
type RouteHandler = (ctx: Context) => unknown | Promise<unknown>

// Module exports (one per file)
interface RouteModule {
  GET?: RouteHandler
  POST?: RouteHandler
  PUT?: RouteHandler
  PATCH?: RouteHandler
  DELETE?: RouteHandler
  middleware?: Middleware | Record<string, Middleware>
}

// Middleware function
type Middleware = (app: Elysia) => Elysia | Promise<Elysia>
```

---

## Usage Examples

### Complete Full-Stack Example

**Frontend:** `src/client/router/product/[id]/index.vue`

```vue
<template>
  <div class="product">
    <h1>{{ product?.name }}</h1>
    <p>{{ product?.description }}</p>
    <button @click="updateProduct">Update</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const product = ref(null)

onMounted(async () => {
  const res = await fetch(`/api/product/${route.params.id}`)
  product.value = await res.json()
})

const updateProduct = async () => {
  await fetch(`/api/product/${route.params.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Updated' }),
  })
}
</script>
```

**Backend:** `src/server/router/product/[id]/index.ts`

```typescript
import type { Context, RouteHandler } from 'bev-fs'

interface Product {
  id: string
  name: string
  description: string
}

// Mock database
const products: Record<string, Product> = {
  '1': { id: '1', name: 'Laptop', description: 'High-end laptop' },
}

export const GET: RouteHandler = async (ctx: Context) => {
  const product = products[ctx.params.id]
  if (!product) {
    ctx.set = { status: 404 }
    return { error: 'Not found' }
  }
  return product
}

export const PUT: RouteHandler = async (ctx: Context) => {
  const data = ctx.body as Partial<Product>
  const product = products[ctx.params.id]
  if (!product) {
    ctx.set = { status: 404 }
    return { error: 'Not found' }
  }
  Object.assign(product, data)
  return product
}

export const DELETE: RouteHandler = async (ctx: Context) => {
  delete products[ctx.params.id]
  return { deleted: true }
}
```

### Middleware

```typescript
// src/server/router/product/index.ts
import type { Middleware, RouteHandler } from 'bev-fs'

const authMiddleware: Middleware = (app) => {
  return app.derive(({ headers }) => {
    const token = headers.authorization?.split(' ')[1]
    if (!token) throw new Error('Unauthorized')
    return { user: { authenticated: true } }
  })
}

export const middleware = {
  GET: authMiddleware,
  POST: authMiddleware,
}

export const GET: RouteHandler = async (ctx: Context) => {
  return { products: [] }
}

export const POST: RouteHandler = async (ctx: Context) => {
  return { created: true }
}
```

---

## Configuration

### Environment Variables

Load configuration from `.env` or `.env.local`:

```env
SERVER_PORT=3000
SERVER_ROUTER_DIR=src/server/router
SERVER_STATIC_DIR=dist/client
CLIENT_API_BASE=/api
```

### Server Configuration

```typescript
import { loadConfigFromDotEnv } from 'bev-fs'

const config = loadConfigFromDotEnv()
const server = await createFrameworkServer({
  ...config.server,
  middleware: [
    /* custom middleware */
  ],
})
```

---

## Architecture Patterns

### Separation of Concerns

Organize your server code by layer:

```
src/server/
├── router/            # Route handlers (API contracts)
├── handler/           # Request handling logic
├── service/           # Business logic
├── repository/        # Data access
├── middleware.ts      # Global middleware
└── index.ts           # Server entry point
```

### Type Safety

Shared types between frontend and backend:

```typescript
// src/shared/types.ts
export interface Product {
  id: string
  name: string
  price: number
}

// Frontend
import type { Product } from '../shared/types'
const product: Product = await fetch('/api/product/1').then((r) => r.json())

// Backend
import type { Product } from '../shared/types'
export const GET: RouteHandler = async (ctx) => {
  const product: Product = {
    /* ... */
  }
  return product
}
```

---

## Best Practices

1. **Use directory structure as API contract** — Let the file system define your API
2. **Keep handlers thin** — Move logic to service/repository layers
3. **Share types** — Define interfaces in `src/shared/`
4. **Validate input** — Check `ctx.body` and `ctx.query` in handlers
5. **Handle errors gracefully** — Set appropriate status codes via `ctx.set`
6. **Use middleware for cross-cutting concerns** — Auth, logging, compression
7. **Leverage TypeScript** — Full type safety end-to-end

---

## Development

### Building

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Development Watch

```bash
npm run dev
```

### Testing

```bash
npm run test
```

---

## File Structure

```
packages/framework/
├── src/
│   ├── index.ts                     # Main exports
│   ├── client/
│   │   ├── createApp.ts             # Client app initialization
│   │   └── useAppRouter.ts          # Router composable
│   ├── server/
│   │   └── createServer.ts          # Server initialization
│   ├── shared/
│   │   ├── createRoute.ts           # Route utilities
│   │   └── types.ts                 # TypeScript types
│   ├── config/
│   │   ├── cache.ts                 # Caching configuration
│   │   └── validator.ts             # Config validation
│   ├── middleware/
│   │   ├── compression.middleware.ts
│   │   ├── cors.middleware.ts
│   │   └── logging.middleware.ts
│   └── errors/
│       ├── ConfigurationError.ts
│       └── RouteDiscoveryError.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## License

Part of the bev-fs full-stack system.
