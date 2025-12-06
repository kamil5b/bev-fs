# Server Guide — Elysia API Backend

The server directory contains the API handlers, middleware, and shared data store.

## Directory Structure

```
src/server/
├── index.ts          # Server entry point
├── middleware.ts     # Logging middleware factory
├── store.ts          # Shared in-memory data store
└── router/
    ├── users/
    │   └── index.ts                  # GET/POST /api/users
    └── product/
        ├── index.ts                  # GET/POST /api/product
        └── [id]/
            ├── index.ts              # GET/PATCH/DELETE /api/product/:id
            └── progress/
                ├── index.ts          # GET/POST /api/product/:id/progress
                └── [progressId]/
                    └── index.ts      # GET/PATCH/DELETE /api/product/:id/progress/:progressId
```

**Key pattern:** Routes are defined by directory structure. Each route endpoint must be in an `index.ts` file.

## Entry Point

### `index.ts` — Server Startup

```typescript
import path from 'path';

(async () => {
  const { createFrameworkServer } = await import('bev-fs');
  const { app, listen } = await createFrameworkServer({
    routerDir: path.join(process.cwd(), 'src/server/router'),
    staticDir: path.join(process.cwd(), 'dist/client'),
    port: Number(process.env.PORT) || 3000
  });

  await listen();
  console.log('Server listening on port', process.env.PORT || 3000);
})();
```

**Options:**
- `routerDir` — directory to auto-scan for API route handlers (default: `src/server/router`)
- `staticDir` — where built client files are (Vite output)
- `port` — server port (default 3000)

## Data Persistence

### `store.ts` — Shared In-Memory Store

```typescript
// src/server/store.ts
export const store = {
  products: [
    { id: 1, name: 'Product 1', price: 9.99 },
    { id: 2, name: 'Product 2', price: 19.99 }
  ]
};
```

**Why shared store?**
- All API handlers import the same `store` object reference
- Modifications persist across requests
- Simple for demos; use a database in production

**Key pattern:** handlers modify `store.products` directly, so DELETE/PATCH operations persist.

## Directory-Based Routing

API handlers are auto-discovered from `src/server/router/`. Directory structure is converted to routes. Each route must have an `index.ts` file:

| Directory | Route |
|-----------|----------|
| `router/users/index.ts` | `/api/users` |
| `router/product/index.ts` | `/api/product` |
| `router/product/[id]/index.ts` | `/api/product/:id` |
| `router/product/[id]/progress/index.ts` | `/api/product/:id/progress` |
| `router/product/[id]/progress/[progressId]/index.ts` | `/api/product/:id/progress/:progressId` |

**Naming conventions:**
- Directories in `router/` become `/api/` routes with `/` as prefix
- `[paramName]` directory → `:paramName` in route path
- Nested directories create nested routes
- Each route location must have an `index.ts` or `index.js` file
- Only the parameter name matters: `[id]`, `[progressId]`, etc. — not the file name

## API Handlers

### Basic Handler — `router/product/index.ts`

```typescript
// src/server/router/product/index.ts
import { store } from '../../store';
import type { ProductAPI } from '../../shared/api';

export const GET = (): ProductAPI.GetAllResponse => ({
  products: store.products
});

export const POST = ({ body }: any): ProductAPI.Product => {
  const newId = Math.max(...store.products.map(p => p.id), 0) + 1;
  const product = { id: newId, ...body };
  store.products.push(product);
  return product;
};
```

**Exports:**
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE` — named by HTTP method (uppercase)
- `DELETE` instead of `delete_handler` (uppercase naming convention)
- Functions receive Elysia context as parameter
- Type responses using shared API types from `src/shared/api.ts`

### Parametrized Handler — `router/product/[id]/index.ts`

```typescript
// src/server/router/product/[id]/index.ts
import { store } from '../../../store';
import type { ProductAPI } from '../../../shared/api';

export const GET = ({ params }: any): ProductAPI.Product => {
  const product = store.products.find(p => p.id === +params.id);
  if (!product) throw new Error('Not found');
  return product;
};

export const PATCH = ({ params, body }: any): ProductAPI.Product => {
  const product = store.products.find(p => p.id === +params.id);
  if (!product) throw new Error('Not found');
  Object.assign(product, body);
  return product;
};

export const DELETE = ({ params }: any) => {
  const idx = store.products.findIndex(p => p.id === +params.id);
  if (idx === -1) throw new Error('Not found');
  const [deleted] = store.products.splice(idx, 1);
  return { deleted };
};
```

**Access parameters:**
- `params.id` — from `[id]` directory name (not filename)
- `params.progressId` — from nested `[progressId]` directory
- Parameter names match directory names exactly (case-sensitive)
- Convert to number with `+params.id`

### Nested Handler — `router/product/[id]/progress/index.ts`

```typescript
// src/server/router/product/[id]/progress/index.ts
import { store } from '../../../../store';
import type { ProgressAPI } from '../../../../shared/api';

export const GET = ({ params }: any): ProgressAPI.GetAllResponse => {
  const product = store.products.find(p => p.id === +params.id);
  if (!product) throw new Error('Product not found');
  return { progresses: product.progress || [] };
};

export const POST = ({ params, body }: any): ProgressAPI.Progress => {
  const product = store.products.find(p => p.id === +params.id);
  if (!product) throw new Error('Product not found');
  
  if (!product.progress) product.progress = [];
  const newId = Math.max(...product.progress.map(p => p.id), 0) + 1;
  const progress = { id: newId, ...body, productId: product.id };
  product.progress.push(progress);
  return progress;
};
```

**Pattern:**
- Access parent parameter: `params.id` (from `[id]` directory)
- Access current parameter: `params.progressId` (from `[progressId]` directory if present)
- Check parent exists before accessing child
- Parameters come from directory names, not file paths

## Middleware

### `middleware.ts` — Logging Middleware Factory

```typescript
// src/server/middleware.ts
import { Elysia } from 'elysia';

export function createLoggingMiddleware() {
  return (app: Elysia) => {
    app.derive((context) => {
      const timestamp = new Date().toISOString();
      const method = context.request?.method || 'UNKNOWN';
      try {
        const pathname = new URL(context.request?.url || '', 'http://localhost').pathname;
        console.log(`[INFO]  ${timestamp} - ${method} ${pathname} - ENTER`);
      } catch {
        // Silent fail
      }
      return {};
    });
  };
}
```

**How it works:**
- `app.derive()` runs on every request
- Logs method, path, and timestamp
- Returns empty object (doesn't modify request)

**Output example:**
```
[INFO]  2025-12-06T08:58:22.071Z - GET /api/product - ENTER
[INFO]  2025-12-06T08:58:37.883Z - POST /api/product - ENTER
```

### Custom Middleware

Add your own middleware functions and pass to framework:

```typescript
export function createAuthMiddleware() {
  return (app: Elysia) => {
    app.derive((context) => {
      const token = context.request?.headers.get('Authorization');
      if (!token) {
        throw new Error('Unauthorized');
      }
      return { user: verifyToken(token) };
    });
  };
}

// In index.ts
middleware: [
  createLoggingMiddleware(),
  createAuthMiddleware()
]
```

Then in handlers, access with `context.user`.

## Error Handling

### Throwing Errors

```typescript
export const GET = ({ params }: any) => {
  const product = store.products.find(p => p.id === +params.id);
  
  // Throw for error responses
  if (!product) throw new Error('Product not found');
  
  return product;
};
```

Elysia automatically catches errors and returns HTTP 500 with error message.

### Validation

```typescript
export const POST = ({ body }: any) => {
  if (!body.name || !body.price) {
    throw new Error('name and price are required');
  }
  // Create product...
};
```

### Custom Status Codes

For custom status codes, return a Response object:

```typescript
export const GET = ({ params }: any) => {
  const product = store.products.find(p => p.id === +params.id);
  
  if (!product) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return product;
};
```

## Best Practices

✅ **Use directory-based routing** — organize handlers in nested `router/` directories  
✅ **One index.ts per route** — each route location needs exactly one `index.ts` file  
✅ **Use uppercase HTTP methods** — `GET`, `POST`, `PUT`, `PATCH`, `DELETE`  
✅ **Match directory names to parameters** — `[id]` directory → `params.id` in handler  
✅ **Validate and throw** — throw errors for invalid requests (Elysia handles HTTP status)  
✅ **Use shared types** — define request/response types in `src/shared/api.ts`  
✅ **Organize by resource** — group related endpoints in nested directories  
✅ **Type handler context** — use `{ params, body }: any` with TypeScript comments  
✅ **Centralize store logic** — keep data modifications in `store.ts` or database layer  

## Common Tasks

### Add a new endpoint

1. Create directory: `src/server/router/resource/`
2. Create file: `src/server/router/resource/index.ts`
3. Export handlers: `export const GET = () => {...}`
4. Framework auto-registers at `/api/resource`

### Add parameters

1. Create directory: `src/server/router/resource/[id]/`
2. Create file: `src/server/router/resource/[id]/index.ts`
3. Access in handler: `params.id`
4. Creates route: `/api/resource/:id`

### Nest endpoints

1. Create nested directory: `src/server/router/product/[id]/progress/`
2. Create file: `src/server/router/product/[id]/progress/index.ts`
3. Access parent: `params.id`, access nested params from directory names
4. Creates route: `/api/product/:id/progress`

### Add multiple parameters

1. Create nested directories with `[paramName]`
2. Example: `router/product/[id]/progress/[progressId]/index.ts`
3. Access both: `params.id` and `params.progressId`

## Production Deployment

### Build

```bash
bun run build
```

Creates:
- `dist/client/` — built Vue app
- Ready to serve from a Bun process

### Run

```bash
PORT=3000 bun src/server/index.ts
```

Single process on port 3000 serves:
- Static client files
- API endpoints
- SPA fallback to index.html

### Database Integration

Replace in-memory `store.ts` with database calls:

```typescript
// src/server/store.ts
import { db } from './db'; // your database client

export const store = {
  async getProducts() {
    return db.products.findAll();
  },
  async createProduct(data) {
    return db.products.create(data);
  }
};
```

Then import in handlers and use async/await.

## Troubleshooting

**Routes not registering**
- Check directory is in `src/server/router/`
- Verify `index.ts` (or `index.js`) exists in the directory
- Ensure file contains handler exports: `GET`, `POST`, etc.
- Framework logs route registration: `Registering route: GET /api/product/:id from id/index.ts`

**Parameter undefined**
- Ensure directory name matches: `resource/[paramName]/`
- Access as: `params.paramName` (case-sensitive)
- Parameter names come from directory names, not file paths
- Convert to number if needed: `+params.id`

**DELETE not working**
- Use uppercase `DELETE` not `delete`
- Verify handler is exporting the function
- Check file is in `index.ts` in the correct directory

**Data not persisting**
- Ensure all handlers import same `store` object from `store.ts`
- Don't reassign store variables — modify in-place with mutation
- For production, replace in-memory store with database layer
