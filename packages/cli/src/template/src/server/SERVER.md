# Server Guide — Elysia API Backend

The server directory contains the API handlers, middleware, and shared data store.

## Directory Structure

```
src/server/
├── index.ts          # Server entry point
├── middleware.ts     # Logging middleware factory
├── store.ts          # Shared in-memory data store
└── api/
    ├── product.ts                    # GET/POST /api/product
    ├── product.[productId].ts        # GET/PATCH/DELETE /api/product/:productId
    ├── product.[productId]/
    │   ├── progress.ts               # GET/POST /api/product/:productId/progress
    │   └── progress.[progressId].ts  # GET/PATCH/DELETE /api/product/:productId/progress/:progressId
    └── users.ts                      # GET/POST /api/users
```

## Entry Point

### `index.ts` — Server Startup

```typescript
import path from 'path';
import { createLoggingMiddleware } from './middleware';

(async () => {
  const { createFrameworkServer } = await import('bev-fs');
  const { app, listen } = await createFrameworkServer({
    apiDir: path.join(process.cwd(), 'src/server/api'),
    staticDir: path.join(process.cwd(), 'dist/client'),
    port: Number(process.env.PORT) || 3000,
    middleware: [createLoggingMiddleware()]
  });

  await listen();
  console.log('Server listening on port', process.env.PORT || 3000);
})();
```

**Options:**
- `apiDir` — directory to auto-scan for API handlers
- `staticDir` — where built client files are (Vite output)
- `port` — server port (default 3000)
- `middleware` — array of middleware functions to apply

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

## File-Based Routing

API handlers are auto-discovered from `src/server/api/`. File names are converted to routes:

| File | Route |
|------|-------|
| `product.ts` | `/api/product` |
| `product.[productId].ts` | `/api/product/:productId` |
| `users.ts` | `/api/users` |
| `product.[productId]/progress.ts` | `/api/product/:productId/progress` |
| `product.[productId]/progress.[progressId].ts` | `/api/product/:productId/progress/:progressId` |

**Naming conventions:**
- Files in `api/` become `/api/*` routes
- `[paramName].ts` → `:paramName` in route path
- Nested directories create nested routes
- Remove file extension and bracket notation

## API Handlers

### Basic Handler — `product.ts`

```typescript
// src/server/api/product.ts
import { store } from '../store';

export const get = () => ({
  products: store.products
});

export const post = ({ body }) => {
  const newId = Math.max(...store.products.map(p => p.id)) + 1;
  const product = { id: newId, ...body };
  store.products.push(product);
  return product;
};
```

**Exports:**
- `get`, `post`, `put`, `patch`, `delete_handler` — named by HTTP method
- `delete_handler` instead of `delete` (JavaScript keyword)
- Functions receive Elysia context

### Parametrized Handler — `product.[productId].ts`

```typescript
// src/server/api/product.[productId].ts
import { store } from '../../store';

export const get = ({ params }) => {
  const product = store.products.find(p => p.id === +params.productId);
  if (!product) return { status: 404, error: 'Not found' };
  return product;
};

export const patch = ({ params, body }) => {
  const product = store.products.find(p => p.id === +params.productId);
  if (!product) return { status: 404, error: 'Not found' };
  Object.assign(product, body);
  return product;
};

export const delete_handler = ({ params }) => {
  const idx = store.products.findIndex(p => p.id === +params.productId);
  if (idx === -1) return { status: 404, error: 'Not found' };
  const [deleted] = store.products.splice(idx, 1);
  return deleted;
};
```

**Access parameters:**
- `params.productId` — from `[productId]` in filename
- `params.progressId` — from nested `[progressId]`
- Convert to number with `+params.productId`

### Nested Handler — `product.[productId]/progress.ts`

```typescript
// src/server/api/product.[productId]/progress.ts
import { store } from '../../../store';

// Assume products have a progress array
export const get = ({ params }) => {
  const product = store.products.find(p => p.id === +params.productId);
  if (!product) return { status: 404 };
  return { progresses: product.progress || [] };
};

export const post = ({ params, body }) => {
  const product = store.products.find(p => p.id === +params.productId);
  if (!product) return { status: 404 };
  
  if (!product.progress) product.progress = [];
  const newId = Math.max(...product.progress.map(p => p.id), 0) + 1;
  const progress = { id: newId, ...body };
  product.progress.push(progress);
  return progress;
};
```

**Pattern:**
- Access parent parameter: `params.productId`
- Access nested parameter: `params.progressId` (if deeply nested)
- Check parent exists before accessing child

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

### Status Codes

```typescript
export const get = ({ params }) => {
  if (!found) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return data;
};
```

### Validation

```typescript
export const post = ({ body }) => {
  if (!body.name || !body.price) {
    throw new Error('name and price are required');
  }
  // Create product...
};
```

Elysia automatically catches thrown errors and returns 500.

## Best Practices

✅ **Import store once** — `import { store } from '../../store'`  
✅ **Use consistent parameter names** — rename files to match: `product.[productId].ts`  
✅ **Nest by resource** — group related endpoints in subdirectories  
✅ **Export lowercase methods** — `get`, `post`, `patch`, but `delete_handler`  
✅ **Type handler params** — use TypeScript for safety  
✅ **Log important operations** — middleware handles request logging  
✅ **Validate inputs** — check required fields in POST/PATCH handlers  

## Common Tasks

### Add a new endpoint

1. Create file: `src/server/api/resource.ts`
2. Export handlers: `export const get = () => {...}`
3. Framework auto-registers at `/api/resource`

### Add parameters

1. Rename file: `resource.[id].ts`
2. Access in handler: `params.id`
3. Creates route: `/api/resource/:id`

### Add middleware

1. Create function in `middleware.ts`
2. Pass to `createFrameworkServer` in `index.ts`
3. Middleware runs before all routes

### Delete operation

```typescript
export const delete_handler = ({ params }) => {
  // JavaScript keyword workaround
};
```

**Never** name it `delete` — it's a reserved keyword.

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

**Handler not found**
- Check file is in `src/server/api/`
- Verify file extension is `.ts` or `.js`
- Framework logs route registration on startup

**Parameter undefined**
- Ensure file name matches: `resource.[paramName].ts`
- Access as: `params.paramName` (case-sensitive)
- Convert to number if needed: `+params.id`

**DELETE returns 404**
- Use `delete_handler` not `delete`
- Check handler is exporting the function

**Middleware not running**
- Verify middleware is passed to `createFrameworkServer`
- Check middleware function signature: `(app: Elysia) => void`

**Data not persisting**
- Ensure all handlers import same `store` object
- Don't reassign store variables — modify in-place
- For production, use a real database
