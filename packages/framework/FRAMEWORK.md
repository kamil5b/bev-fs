# Framework Guide — bev-fs Core

Welcome to the **bev-fs framework** documentation! This guide explains the core building blocks that power the full-stack system — everything you need to build modern, type-safe fullstack applications with Vue 3 and Bun.

## What is bev-fs?

**bev-fs** (Bun Elysia Vue Fullstack) is a minimal, opinionated fullstack framework that provides:

- 🎯 **Directory-based routing** for both client and server
- 🔧 **Type-safe API integration** between frontend and backend
- ⚡ **Zero-config setup** — sensible defaults for Bun, Elysia, and Vue 3
- 🎨 **Clean architecture** — separation of concerns built in
- 📦 **Tiny and composable** — use only what you need

## Core Modules

The framework exposes four main functions via `bev-fs`:

### 1. `createFrameworkApp()` — Client-side router setup

Initializes your Vue 3 app with **directory-based routing**.

```typescript
import { createFrameworkApp } from 'bev-fs'
import App from './App.vue'

const { app, router } = createFrameworkApp(App, {
  routeModules: import.meta.glob('./router/**/index.vue', { eager: true }),
  historyMode: true,
})

app.mount('#app')
```

**Parameters:**

- `rootComponent` — Your root Vue component (typically `App.vue`)
- `opts` — Configuration options:
  - `routeModules` — Import glob result from `import.meta.glob()` (auto-discovery mode)
  - `routes` — Manual route definition (overrides glob discovery)
  - `historyMode` — Use HTML5 history mode (default: `true`)

**Returns:**

- `{ app, router }` — Vue app instance and vue-router instance

#### How Route Discovery Works

The framework automatically converts your directory structure into Vue Router routes:

```
src/client/router/
├── index.vue                           → / (home)
├── product/
│   ├── index.vue                       → /product
│   └── [id]/
│       ├── index.vue                   → /product/:id
│       └── progress/
│           └── index.vue               → /product/:id/progress
└── not-found/
    └── index.vue                       → /:pathMatch(.*)*  (404 catch-all)
```

**Key behaviors:**

- Only `index.vue` files in `router/` directories are processed
- Directory names become route segments
- Square brackets `[paramName]` become dynamic parameters (`:paramName`)
- `not-found` or `404` directories create catch-all `/:pathMatch(.*)*` routes
- Routes are sorted, with catch-all always last

---

### 2. `createFrameworkServer()` — Server initialization

Sets up your Elysia server with **directory-based API routing** and configuration loading.

```typescript
import { createFrameworkServer } from 'bev-fs'
import path from 'path'

const { app, listen } = await createFrameworkServer({
  routerDir: path.join(process.cwd(), 'src/server/router'),
  staticDir: path.join(process.cwd(), 'dist/client'),
  port: 3000,
  middleware: [(app) => app.use(customMiddleware())],
})

await listen()
```

**Parameters:**

- `routerDir` — Where your API handlers live (default: `src/server/router`)
- `staticDir` — Built client files location (default: `dist/client`)
- `port` — Server port (default: `3000`)
- `env` — Environment mode: `"development"` | `"production"`
- `middleware` — Array of middleware functions that receive and mutate the Elysia app

**Returns:**

- `{ app, listen }` — Elysia app instance and listen function

#### Configuration Loading

The server automatically loads configuration in this precedence order:

1. **config.yaml.local** (local overrides, not tracked)
2. **config.yaml** (tracked defaults)
3. **.env.local** (local env overrides, not tracked)
4. **.env** (tracked env defaults)

**Example config.yaml:**

```yaml
server:
  port: 3000
  routerDir: src/server/router
  staticDir: dist/client
  dbPath: ./data.json

client:
  apiBaseUrl: http://localhost:3000
```

**Example .env:**

```
SERVER_PORT=3000
SERVER_ROUTER_DIR=src/server/router
SERVER_STATIC_DIR=dist/client
```

Configuration values are automatically injected into `process.env` as `SECTION_KEY_NAME` format.

#### How API Route Discovery Works

Like the client, the server converts your directory structure into API routes:

```
src/server/router/
├── product/
│   ├── index.ts                      → GET/POST /api/product
│   └── [id]/
│       ├── index.ts                  → GET/PATCH/DELETE /api/product/:id
│       └── progress/
│           ├── index.ts              → GET/POST /api/product/:id/progress
│           └── [progressId]/
│               └── index.ts          → GET/PATCH/DELETE /api/product/:id/progress/:progressId
```

**Handler Format:**

Each `index.ts` file exports HTTP method handlers:

```typescript
// src/server/router/product/[id]/index.ts
import type { Context } from 'elysia'
import { ProductService } from '../../service/product.service'

export const GET = async ({ params }: Context) => {
  const product = await ProductService.getById(params.id)
  return product
}

export const PATCH = async ({ params, body }: Context) => {
  const updated = await ProductService.update(params.id, body)
  return updated
}

export const DELETE = async ({ params }: Context) => {
  await ProductService.delete(params.id)
  return { success: true }
}
```

**Available exports:**

- `GET` — Handle GET requests
- `POST` — Handle POST requests
- `PUT` — Handle PUT requests
- `PATCH` — Handle PATCH requests
- `DELETE` — Handle DELETE requests
- `default` — Fallback handler (if no method-specific handler exists)
- `middleware` — Route-level or per-method middleware (see below)

#### Middleware

Middleware can be applied at route-level or per HTTP method:

**Route-level middleware:**

```typescript
// src/server/router/product/index.ts
export const middleware = async (app) => {
  return app.use(authMiddleware())
}

export const GET = async () => {
  // Protected by middleware
  return []
}
```

**Per-method middleware:**

```typescript
export const middleware = {
  POST: async (app) => {
    return app.use(validateBodyMiddleware())
  },
}

export const POST = async ({ body }) => {
  // Only POST requests use the middleware
  return body
}
```

---

### 2.5. `useAppRouter()` and `useAppRoute()` — Client-side routing composables

Vue composables to access the router and current route in your components. These work around Vue Router's plugin injection issues and provide a clean API.

```typescript
import { useAppRouter, useAppRoute } from 'bev-fs'

export default {
  setup() {
    const router = useAppRouter()
    const route = useAppRoute()

    const navigateToProduct = (id: string) => {
      router?.push(`/product/${id}`)
    }

    const productId = route?.params?.id

    return { navigateToProduct, productId }
  },
}
```

**Returns:**

- `useAppRouter()` — Vue Router instance with `push()`, `replace()`, etc.
- `useAppRoute()` — Current route object with `params`, `query`, `path`, etc.

**Why custom composables?** Vue Router's `useRouter()` and `useRoute()` composables don't work reliably with the framework's app initialization. These custom composables provide the same functionality with proper global property fallback.

---

### 3. `createRoute()` — Type-safe route definitions

Helper function to create a type-safe route definition with API integration:

```typescript
import { createRoute } from 'bev-fs'

// Define your routes
export const productRoute = createRoute('/product')

// Use it
const apiUrl = productRoute.api('/123') // → /api/product/123
const routePath = productRoute.path // → /product
```

**Parameters:**

- `path` — Route path (e.g., `/product`)

**Returns:**

```typescript
{
  path: string;              // The path you provided
  api(suffix?: string): string;  // Get API endpoint: /api + path + suffix
}
```

#### Example Usage

```typescript
import { createRoute } from 'bev-fs'

export const routes = {
  home: createRoute('/'),
  products: createRoute('/products'),
  productDetail: createRoute('/products'),
}

// In your component
const productId = '123'
const endpoint = routes.products.api(`/${productId}`) // → /api/products/123
```

---

### 4. Shared Utilities — Path conversion helpers

The framework exports utility functions for working with file-based routing:

#### `convertPathToRoute(filePath, prefix?)`

Converts a file path to a route path:

```typescript
import { convertPathToRoute } from 'bev-fs'

convertPathToRoute('./router/index.vue') // → "/"
convertPathToRoute('./router/product/index.vue') // → "/product"
convertPathToRoute('./router/product/[id]/index.vue') // → "/product/:id"
convertPathToRoute('./router/product/[id]/progress/index.vue') // → "/product/:id/progress"
```

#### `isIndexFile(fileName)`

Check if a filename is an index file:

```typescript
import { isIndexFile } from 'bev-fs'

isIndexFile('index.ts') // → true
isIndexFile('index.vue') // → true
isIndexFile('helpers.ts') // → false
```

#### `convertDirNameToSegment(dirName)`

Convert a directory name to a route segment:

```typescript
import { convertDirNameToSegment } from 'bev-fs'

convertDirNameToSegment('product') // → "product"
convertDirNameToSegment('[id]') // → ":id"
```

---

## Configuration Deep Dive

### Environment Variables

All configuration values are loaded into `process.env` with the pattern: `SECTION_KEY_TOUPPPERCASE`

Examples:

- `server.port` → `process.env.SERVER_PORT`
- `server.routerDir` → `process.env.SERVER_ROUTER_DIR`
- `client.apiBaseUrl` → `process.env.CLIENT_API_BASE_URL`

This allows you to access configuration anywhere in your code:

```typescript
// In any server file
const port = process.env.SERVER_PORT || 3000
const dbPath = process.env.SERVER_DB_PATH
```

### Config Precedence

1. **Local config files** (gitignored, highest priority)
   - `config.yaml.local`
   - `.env.local`
2. **Tracked config files**
   - `config.yaml`
   - `.env`
3. **Hardcoded defaults**

This allows developers to override config locally without affecting the repository.

---

## Advanced Patterns

### Clean Architecture with bev-fs

The framework is designed to work seamlessly with clean architecture:

```
HTTP Request
    ↓
Router (index.ts exports handlers)
    ↓
Handler (parse params, delegate to service)
    ↓
Service (business logic, response formatting)
    ↓
Repository (data access abstraction)
    ↓
Store/Database
```

**Example with clean architecture:**

```typescript
// src/server/router/product/[id]/index.ts
import { ProductService } from '../../service/product.service'

export const GET = async ({ params }) => {
  // Handler: minimal logic, just delegate
  return ProductService.getById(params.id)
}

export const PATCH = async ({ params, body }) => {
  // Handler: parse, validate, delegate
  return ProductService.update(params.id, body)
}

export const DELETE = async ({ params }) => {
  // Handler: delegate
  return ProductService.delete(params.id)
}
```

```typescript
// src/server/service/product.service.ts
import { ProductRepository } from '../repository/product.repository'

export const ProductService = {
  async getById(id: string) {
    // Service: business logic, transform data
    const product = await ProductRepository.findById(id)
    return {
      ...product,
      formattedDate: new Date(product.createdAt).toISOString(),
    }
  },

  async update(id: string, data: any) {
    // Service: validation, business logic
    if (!data.name) throw new Error('Name is required')
    return ProductRepository.update(id, data)
  },

  async delete(id: string) {
    // Service: cascading operations, cleanup
    await ProductRepository.delete(id)
    return { deleted: true }
  },
}
```

### Type-Safe API Calls

Use the shared types between client and server:

```typescript
// src/shared/responses/product.response.ts
export interface ProductResponse {
  id: string
  name: string
  price: number
}
```

```typescript
// src/client/composables/useProductAPI.ts
import type { ProductResponse } from '@/shared/responses/product.response'

export function useProductAPI() {
  const getProduct = async (id: string): Promise<ProductResponse> => {
    const res = await fetch(`/api/product/${id}`)
    return res.json()
  }

  return { getProduct }
}
```

---

## Best Practices

### 1. Directory Structure

Keep your code organized:

```
src/
├── client/              # Vue frontend
│   ├── components/
│   ├── composables/
│   ├── pages/
│   ├── router/
│   ├── App.vue
│   └── main.ts
├── server/              # Bun + Elysia API
│   ├── handler/
│   ├── service/
│   ├── repository/
│   ├── router/
│   ├── middleware.ts
│   └── index.ts
└── shared/              # Shared types & utilities
    ├── entities/
    ├── requests/
    ├── responses/
    └── index.ts
```

### 2. Naming Conventions

- **Components**: `PascalCase.vue` (e.g., `ProductForm.vue`)
- **Pages**: `PascalCase.vue` (e.g., `Product.vue`)
- **Composables**: `useCamelCase.ts` (e.g., `useProductAPI.ts`)
- **Services**: `service.ts` suffix (e.g., `product.service.ts`)
- **Repositories**: `repository.ts` suffix (e.g., `product.repository.ts`)

### 3. Router Organization

- Keep router structure **flat** for simple routes
- Use **`[paramName]` directories** for dynamic segments
- Create `not-found/index.vue` for 404 pages
- One route per directory (avoid sibling page files)

### 4. API Design

- Keep API routes **RESTful** when possible
- Use appropriate HTTP methods: GET, POST, PUT, PATCH, DELETE
- Return **consistent response formats**
- Handle errors with proper HTTP status codes

### 5. Code Reuse

- Use **composables** on client for API calls and logic
- Use **services** on server for business logic
- Use **repositories** for data access abstraction
- Use **shared types** for client-server communication

---

## Common Patterns

### Pattern 1: Creating a New Resource Endpoint

```
1. Define types in shared/
2. Create router directory: src/server/router/resource/
3. Implement handler: src/server/router/resource/index.ts
4. Implement service: src/server/service/resource.service.ts
5. Implement repository: src/server/repository/resource.repository.ts
6. Create composable: src/client/composables/useResourceAPI.ts
7. Create pages: src/client/pages/Resource*.vue
8. Create routes: src/client/router/resource/index.vue
```

### Pattern 2: Nested Resource Endpoints

```
GET    /api/resource/:id/sub
POST   /api/resource/:id/sub
GET    /api/resource/:id/sub/:subId
PATCH  /api/resource/:id/sub/:subId
DELETE /api/resource/:id/sub/:subId
```

Create this directory structure:

```
src/server/router/
└── resource/
    └── [id]/
        └── sub/
            ├── index.ts          (GET, POST)
            └── [subId]/
                └── index.ts      (GET, PATCH, DELETE)
```

### Pattern 3: Hierarchical Middleware Chaining

The framework supports **hierarchical middleware inheritance**. Middleware defined in parent routes automatically applies to all child routes.

#### Route-Level Middleware (applies to all methods)

```typescript
// src/server/router/product/index.ts
import { Elysia } from 'elysia'

// Middleware applies to GET, POST, PUT, PATCH, DELETE on this route
// AND to all nested routes: /product/[id], /product/[id]/progress, etc.
export const middleware = [
  (app: Elysia) => {
    app.derive(() => ({
      startTime: Date.now(),
    }))
  },
]

export const GET = () => ({ products: [] })
export const POST = ({ body }: any) => ({ id: 1 })
```

#### Method-Specific Middleware

```typescript
// src/server/router/product/[id]/index.ts
import { Elysia } from 'elysia'

// Apply different middleware to different methods
export const middleware = {
  GET: [
    (app: Elysia) => {
      // Logging only for GET requests
      app.derive(() => ({ method: 'GET' }))
    },
  ],
  DELETE: [
    (app: Elysia) => {
      // Authorization only for DELETE requests
      app.derive(({ headers }) => {
        const token = headers['authorization']
        if (!token) throw new Error('Unauthorized')
        return { authorized: true }
      })
    },
  ],
}

export const GET = ({ params }: any) => ({ id: params.id })
export const DELETE = ({ params }: any) => ({ success: true })
```

#### Middleware Inheritance Chain Example

```
Directory structure:
src/server/router/
└── product/                          (has route-level middleware)
    └── [id]/                         (has route-level middleware)
        └── progress/                 (has method-specific middleware)
            └── [progressId]/

Request to: GET /api/product/123/progress/456

Middleware execution order:
1. Global server middleware (CORS, compression, etc.)
2. Product route middleware (timing, logging)
3. Product/:id middleware (ID validation)
4. Progress route GET middleware (specific to this method)
5. Progress/:progressId handler
```

#### Building Custom Middleware Factories

```typescript
// src/server/middleware.ts
import { Elysia } from 'elysia'

export function createAuthMiddleware() {
  return (app: Elysia) => {
    app.derive(({ headers }) => {
      const token = headers['authorization']?.split(' ')[1]
      if (!token) throw new Error('Unauthorized')
      return { userId: decodeToken(token) }
    })
  }
}

export function createAdminMiddleware() {
  return (app: Elysia) => {
    app.derive(({ userId }) => {
      if (userId !== 'admin') throw new Error('Forbidden')
      return { isAdmin: true }
    })
  }
}

export function createValidationMiddleware(schema: any) {
  return (app: Elysia) => {
    app.derive(({ body }) => {
      const validation = validateBody(body, schema)
      if (!validation.valid) throw new Error(validation.error)
      return { validated: true }
    })
  }
}
```

```typescript
// src/server/router/admin/users/index.ts
import {
  createAuthMiddleware,
  createAdminMiddleware,
} from '../../../middleware'

export const middleware = [createAuthMiddleware(), createAdminMiddleware()]

export const GET = ({ userId }: any) => {
  return { users: [], requestedBy: userId }
}

export const DELETE = ({ body, userId }: any) => {
  return { deleted: true, deletedBy: userId }
}
```

#### Mixing Route-Level and Method-Specific Middleware

```typescript
// src/server/router/data/[id]/index.ts
import { Elysia } from 'elysia'
import {
  createAuthMiddleware,
  createAdminMiddleware,
} from '../../../middleware'

// Route-level: applies to all methods
export const middleware = [
  createAuthMiddleware(), // All methods require auth
]

// Method-specific: only for DELETE
export const middleware = {
  DELETE: [
    createAdminMiddleware(), // DELETE also requires admin (in addition to auth)
  ],
}

export const GET = ({ userId }: any) => {
  return { data: [], user: userId } // userId from auth middleware
}

export const DELETE = ({ userId, isAdmin }: any) => {
  return { success: true, deletedBy: userId } // userId + isAdmin available
}
```

---

## Troubleshooting

### Routes Not Being Discovered

**Problem:** Your routes aren't showing up in the router.

**Solutions:**

1. Check that your files are in `src/client/router/` directory
2. Ensure files are named `index.vue` (not `index.ts` or other names)
3. Verify the glob pattern in `main.ts`: `import.meta.glob("./router/**/index.vue", { eager: true })`
4. Check console for warnings about duplicate routes

### API Endpoints Not Registering

**Problem:** Your API endpoints aren't accessible.

**Solutions:**

1. Verify files are in `src/server/router/` directory
2. Check that files are named `index.ts` and export HTTP method functions
3. Make sure route functions are properly exported (not default exports)
4. Check server console for registration messages
5. Verify the route path in the browser matches your directory structure

### Type Issues Between Client and Server

**Problem:** Types don't match between client and server.

**Solutions:**

1. Define shared types in `src/shared/`
2. Import types in both client and server from shared
3. Ensure server responses match the expected type
4. Use TypeScript `never` type to catch type mismatches at build time

---

## API Reference

### `createFrameworkApp(rootComponent, options?)`

Initialize Vue 3 app with directory-based routing.

```typescript
function createFrameworkApp(
  rootComponent: any,
  opts?: ClientOptions,
): { app: VueApp; router: Router }
```

**Options:**

```typescript
type ClientOptions = {
  routes?: any[] // Manual routes (overrides glob)
  routeModules?: Record<string, any> // import.meta.glob result
  historyMode?: boolean // HTML5 history mode (default: true)
}
```

---

### `createFrameworkServer(options?)`

Initialize Elysia server with directory-based routing.

```typescript
async function createFrameworkServer(
  opts?: ServerOptions,
): Promise<{ app: Elysia; listen: (port?: number) => void }>
```

**Options:**

```typescript
type ServerOptions = {
  routerDir?: string // Route handlers directory
  staticDir?: string // Static files directory
  port?: number // Server port
  env?: 'development' | 'production'
  middleware?: ((app: Elysia) => void)[]
}
```

---

### `createRoute(path)`

Create a type-safe route helper.

```typescript
function createRoute<T extends string>(
  path: T,
): { path: T; api(pathSuffix?: string): string }
```

---

## Resources

- 📚 [Elysia Documentation](https://elysia.io/)
- 📚 [Vue 3 Documentation](https://vuejs.org/)
- 📚 [Vue Router Documentation](https://router.vuejs.org/)
- 📚 [Bun Documentation](https://bun.sh/)

---

**Happy building! 🚀**
