# Framework Guide — bev-fs Core

Welcome to the **bev-fs framework** documentation! This guide explains the core building blocks that power the full-stack system — everything you need to build modern, type-safe fullstack applications with Vue 3 and Bun.

**Note:** This is the base edition guide. For more advanced patterns and examples, see the full template edition documentation.

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

### Starting Simple and Scaling

The base edition is intentionally minimal. As your project grows, follow these patterns:

#### Clean Architecture Layers

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

**Start with:**

```typescript
// src/server/router/hello/index.ts
export const GET = () => {
  return { message: 'Hello, World!' }
}
```

**Scale to:**

```typescript
// src/server/router/product/[id]/index.ts
import { ProductService } from '../../service/product.service'

export const GET = async ({ params }) => {
  return ProductService.getById(params.id)
}
```

#### Type-Safe API Integration

Define shared types for client-server communication:

```typescript
// src/shared/index.ts
export interface Product {
  id: number
  name: string
  price: number
}

export interface ErrorResponse {
  success: false
  message: string
}
```

```typescript
// src/client/composables/useAPI.ts
import type { Product, ErrorResponse } from '@/shared'

export function useProductAPI() {
  const getProduct = async (id: number): Promise<Product | ErrorResponse> => {
    try {
      const res = await fetch(`/api/product/${id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, message }
    }
  }

  return { getProduct }
}
```

### Adding Custom Middleware

Extend functionality with middleware:

```typescript
// src/server/middleware.ts
export function createAuthMiddleware() {
  return (app) => {
    return app.derive(({ headers }) => {
      const token = headers['authorization']?.split(' ')[1]
      if (!token) throw new Error('Unauthorized')
      return { userId: decodeToken(token) }
    })
  }
}
```

```typescript
// src/server/router/protected/index.ts
import { createAuthMiddleware } from '../../middleware'

export const middleware = createAuthMiddleware()

export const GET = ({ userId }) => {
  return { message: `Hello, user ${userId}` }
}
```

### When to Add Complexity

Add these as your app grows:

- **Composables** (`src/client/composables/`) — When you have shared component logic
- **Services** (`src/server/service/`) — When router handlers become complex
- **Repositories** (`src/server/repository/`) — When you have multiple data sources
- **Components** (`src/client/components/`) — When you have reusable UI patterns
- **Configuration files** (`config.yaml`, `.env`) — When you need environment-specific settings

---

## Best Practices

### 1. Start Minimal

The base edition provides just the framework foundation. Add complexity only when needed:

**Do:**

- Start with simple routes in `src/server/router/`
- Keep logic inline until it becomes reusable
- Define types in `src/shared/` early

**Don't:**

- Create unnecessary folder structures
- Add layers (services, repositories) before they're needed
- Over-engineer the initial architecture

### 2. Directory Structure Evolution

**Phase 1 (Start here):**

```
src/
├── client/router/      # Your pages
├── server/router/      # Your API endpoints
└── shared/             # Shared types
```

**Phase 2 (When logic grows):**

```
src/
├── client/
│   ├── router/
│   ├── composables/    # Add for reusable logic
│   └── components/     # Add for reusable UI
├── server/
│   ├── router/
│   ├── service/        # Add when handlers get complex
│   └── repository/     # Add when data access is reused
└── shared/
```

### 3. Naming Conventions

Keep it simple:

- **Pages**: `PascalCase.vue` (e.g., `Product.vue`)
- **Composables**: `useCamelCase.ts` (e.g., `useProductAPI.ts`)
- **Services**: `camelCase.service.ts` (e.g., `product.service.ts`)
- **Repositories**: `camelCase.repository.ts` (e.g., `product.repository.ts`)

### 4. API Design

- Keep routes **RESTful**: `GET`, `POST`, `PATCH`, `DELETE`
- Use **consistent response formats**
- Return proper **HTTP status codes**
- Define types in `src/shared/` for client-server contracts

### 5. Type Safety First

Always define types early:

```typescript
// src/shared/index.ts
export interface Product {
  id: number
  name: string
}

export interface ErrorResponse {
  success: false
  message: string
}
```

Use these types in both client and server to catch mismatches at build time.

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

### Pattern 3: Adding Custom Middleware

```typescript
// src/server/middleware.ts
export function createAuthMiddleware() {
  return (app) => {
    return app.derive(({ headers }) => {
      const token = headers['authorization']?.split(' ')[1]
      if (!token) throw new Error('Unauthorized')
      return { userId: decodeToken(token) }
    })
  }
}
```

```typescript
// src/server/router/protected/index.ts
import { createAuthMiddleware } from '../../middleware'

export const middleware = createAuthMiddleware()

export const GET = ({ userId }) => {
  return { message: `Hello, user ${userId}` }
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
