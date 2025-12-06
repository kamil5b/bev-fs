# Server Guide — Building APIs with bev-fs

This guide will teach you how to build type-safe API endpoints using the bev-fs framework. You'll learn about directory-based routing, middleware, data persistence, and best practices.

## What You'll Learn

- 📁 **Directory-based routing** — Routes defined by folder structure, not configuration
- 🔧 **Type-safe handlers** — Full TypeScript support from request to response
- 🗄️ **Data persistence** — Using the shared store pattern
- 🪝 **Middleware** — Adding logging, auth, and custom behavior
- 🎯 **Nested routes** — Building complex API hierarchies

## Directory Structure

```
src/server/
├── index.ts          # Server entry point
├── middleware.ts     # Logging middleware factory
├── store.ts          # Shared in-memory data store
└── router/
    └── product/
        ├── index.ts                  # GET/POST /api/product
        └── [id]/
            ├── index.ts              # GET/PATCH/DELETE /api/product/:id
            └── progress/
                ├── index.ts          # GET/POST /api/product/:id/progress
                └── [progressId]/
                    └── index.ts      # GET/PATCH/DELETE /api/product/:id/progress/:progressId
```

**Key concept:** Your folder structure IS your API routing structure. Each route location needs an `index.ts` file to handle requests.

## Getting Started

### Step 1: Server Entry Point

The server starts in `src/server/index.ts`. Here's how to set it up:

```typescript
import path from 'path';
import { createLoggingMiddleware } from './middleware';

(async () => {
  const { createFrameworkServer } = await import('bev-fs');
  const { app, listen } = await createFrameworkServer({
    routerDir: path.join(process.cwd(), 'src/server/router'),
    staticDir: path.join(process.cwd(), 'dist/client'),
    port: Number(process.env.SERVER_PORT) || 3000,
    middleware: [createLoggingMiddleware()]
  });

  await listen();
  console.log('Server listening on port', process.env.SERVER_PORT || 3000);
})();
```

**Configuration Options:**
- `routerDir` — Where your API handlers live (default: `src/server/router`)
- `staticDir` — Built client files from Vite (default: `dist/client`)
- `port` — Server port (reads from `SERVER_PORT` env var or defaults to 3000)
- `middleware` — Array of middleware functions to apply

💡 **Tip:** The `routerDir` and `staticDir` options are optional. If omitted, the framework uses sensible defaults based on your working directory.

## Step 2: Understanding Data Persistence

The `store.ts` file provides a simple in-memory database for development. Here's how it works:

```typescript
// src/server/store.ts
import type { Product, Progress } from '../shared/api';

const products: Product[] = [
  { id: 1, name: 'Product 1', price: 9.99 },
  { id: 2, name: 'Product 2', price: 19.99 }
];

const progress: Progress[] = [];

export const store = {
  products,
  
  getProgressByProductId(productId: number) {
    return progress.filter(p => p.productId === productId);
  },
  
  createProgress(productId: number, data: any) {
    const newProgress = {
      id: Math.max(...progress.map(p => p.id), 0) + 1,
      productId,
      percentage: data.percentage,
      status: data.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    progress.push(newProgress);
    return newProgress;
  }
};
```

**Why use a shared store?**
- ✅ All API handlers import the same object reference
- ✅ Modifications persist across requests within the same process
- ✅ Perfect for demos and rapid prototyping
- ⚠️ Data is lost when the server restarts
- ⚠️ Not suitable for production (use a real database)

**Key pattern:** Export a singleton object that all handlers can import and mutate directly.

## Step 3: Understanding Directory-Based Routing

The magic of bev-fs is that your folder structure defines your API routes. No configuration needed!

### How It Works

1. Place an `index.ts` file in any folder under `src/server/router/`
2. The framework automatically creates an API route at `/api/<folder-path>`
3. Use `[paramName]` folders to create dynamic route parameters

### Route Mapping Examples

| File Path | Generated API Route | Description |
|-----------|---------------------|-------------|
| `router/product/index.ts` | `GET /api/product` | List all products |
| `router/product/[id]/index.ts` | `GET /api/product/:id` | Get product by ID |
| `router/product/[id]/progress/index.ts` | `GET /api/product/:id/progress` | Get progress for a product |
| `router/product/[id]/progress/[progressId]/index.ts` | `GET /api/product/:id/progress/:progressId` | Get specific progress entry |

### Routing Rules

✅ **DO:**
- Create an `index.ts` (or `index.js`) in each route directory
- Use `[paramName]` syntax for dynamic segments (e.g., `[id]`, `[progressId]`)
- Nest directories to create hierarchical routes
- Export uppercase HTTP method names: `GET`, `POST`, `PATCH`, `DELETE`

❌ **DON'T:**
- Put handlers in files other than `index.ts` (they won't be registered)
- Use lowercase method names (use `DELETE` not `delete`)
- Rely on filename for routing (only directory structure matters)

## Step 4: Writing Your First API Handler

### Creating a Basic Endpoint

Let's create a handler at `src/server/router/product/index.ts` that lists and creates products:

```typescript
// src/server/router/product/index.ts
import { store } from '../../store';
import type { ProductAPI } from '../../../shared/api';

// GET /api/product - List all products
export const GET = (): ProductAPI.GetListResponse => {
  return { products: store.products };
};

// POST /api/product - Create a new product
export const POST = ({ body }: any): ProductAPI.CreateResponse => {
  const req = body as ProductAPI.CreateRequest;
  const newProduct = {
    id: Math.max(...store.products.map(p => p.id), 0) + 1,
    ...req
  };
  store.products.push(newProduct);
  return { created: newProduct };
};
```

**What's happening here:**

1. **Import the store** — Access your shared data
2. **Import types** — Use TypeScript types from `shared/api.ts` for type safety
3. **Export HTTP methods** — Each export corresponds to an HTTP verb (must be UPPERCASE)
4. **Destructure context** — `{ body }` gives you the request body
5. **Return typed responses** — The return type matches your API contract

💡 **Handler Anatomy:**
- Each handler receives Elysia context: `{ body, params, query, request, headers, ... }`
- Return value is automatically JSON-serialized
- Thrown errors become HTTP 500 responses with error messages

### Working with Route Parameters

Create `src/server/router/product/[id]/index.ts` to handle individual products:

```typescript
// src/server/router/product/[id]/index.ts
import { store } from '../../../store';
import type { ProductAPI } from '../../../../shared/api';

// GET /api/product/:id - Get a specific product
export const GET = ({ params }: any): ProductAPI.GetByIdResponse => {
  const id = parseInt(params.id);
  const product = store.products.find(p => p.id === id);
  if (!product) throw new Error('Product not found');
  return { product };
};

// PATCH /api/product/:id - Update a product
export const PATCH = ({ params, body }: any): ProductAPI.UpdateResponse => {
  const id = parseInt(params.id);
  const req = body as ProductAPI.UpdateRequest;
  const product = store.products.find(p => p.id === id);
  
  if (!product) throw new Error('Product not found');
  
  if (req.name !== undefined) product.name = req.name;
  if (req.price !== undefined) product.price = req.price;
  
  return { updated: product };
};

// DELETE /api/product/:id - Delete a product
export const DELETE = ({ params }: any): ProductAPI.DeleteResponse => {
  const id = parseInt(params.id);
  const index = store.products.findIndex(p => p.id === id);
  
  if (index === -1) throw new Error('Product not found');
  
  store.products.splice(index, 1);
  return { deleted: id };
};
```

**Understanding Route Parameters:**

- The `[id]` folder name becomes `:id` in the route
- Access it via `params.id` in your handler
- Parameter names must match the folder name exactly (case-sensitive)
- Always parse string parameters: `parseInt(params.id)` or `+params.id`

🔑 **Multiple Parameters:**
For nested routes like `/api/product/:id/progress/:progressId`, you get both:
- `params.id` (from the `[id]` folder)
- `params.progressId` (from the `[progressId]` folder)

### Building Nested Routes

Create `src/server/router/product/[id]/progress/index.ts` for nested resources:

```typescript
// src/server/router/product/[id]/progress/index.ts
import { store } from '../../../../store';
import type { ProgressAPI } from '../../../../../shared/api';

// GET /api/product/:id/progress - List progress entries for a product
export const GET = ({ params }: any): ProgressAPI.GetListResponse => {
  const productId = parseInt(params.id);
  return { progress: store.getProgressByProductId(productId) };
};

// POST /api/product/:id/progress - Create a progress entry
export const POST = ({ params, body }: any): ProgressAPI.CreateResponse => {
  const productId = parseInt(params.id);
  const data = body as ProgressAPI.CreateRequest;
  const created = store.createProgress(productId, data);
  return { created };
};
```

**Nested Routing Pattern:**

1. **Parent parameters are inherited** — `params.id` comes from the `[id]` folder above
2. **Validate parent existence** — Check the parent resource exists before creating children
3. **Build hierarchies naturally** — Your folder structure mirrors your API design

🎯 **Real-world example:**
```
router/
└── product/
    ├── index.ts              # GET /api/product
    └── [id]/
        ├── index.ts          # GET /api/product/:id
        └── progress/
            ├── index.ts      # GET /api/product/:id/progress
            └── [progressId]/
                └── index.ts  # GET /api/product/:id/progress/:progressId
```

## Step 5: Adding Middleware

Middleware lets you run code before every request. Perfect for logging, authentication, or adding context.

### Built-in Logging Middleware

The template includes a logging middleware in `src/server/middleware.ts`:

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
1. `app.derive()` runs before every handler
2. Logs the HTTP method, path, and timestamp
3. Returns an empty object (no context modification)

**Console output:**
```
[INFO]  2025-12-07T10:15:22.071Z - GET /api/product - ENTER
[INFO]  2025-12-07T10:15:37.883Z - POST /api/product - ENTER
```

### Creating Custom Middleware

Here's how to add authentication middleware:

```typescript
// src/server/middleware.ts
export function createAuthMiddleware() {
  return (app: Elysia) => {
    app.derive((context) => {
      const token = context.request?.headers.get('Authorization');
      
      if (!token) {
        throw new Error('Unauthorized: No token provided');
      }
      
      // Verify token and attach user to context
      const user = verifyToken(token); // Your auth logic
      return { user };
    });
  };
}

// Apply in index.ts
middleware: [
  createLoggingMiddleware(),
  createAuthMiddleware()
]
```

**Using middleware context in handlers:**
```typescript
export const GET = ({ user }: any) => {
  // user is available from auth middleware
  console.log(`Request from user: ${user.email}`);
  return { data: 'secret stuff' };
};
```

💡 **Middleware tips:**
- Middleware runs in the order you specify in the array
- Return an object to add properties to the handler context
- Throw errors to reject requests early (before hitting handlers)

## Step 6: Error Handling

### Basic Error Handling

The simplest way to handle errors is to throw:

```typescript
export const GET = ({ params }: any): ProductAPI.GetByIdResponse => {
  const id = parseInt(params.id);
  const product = store.products.find(p => p.id === id);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return { product };
};
```

⚠️ **Note:** Thrown errors automatically return HTTP 500 with the error message.

### Input Validation

Validate request data before processing:

```typescript
export const POST = ({ body }: any): ProductAPI.CreateResponse => {
  const req = body as ProductAPI.CreateRequest;
  
  // Validate required fields
  if (!req.name || !req.price) {
    throw new Error('name and price are required');
  }
  
  // Validate data types
  if (typeof req.price !== 'number' || req.price <= 0) {
    throw new Error('price must be a positive number');
  }
  
  // Create product...
  const newProduct = {
    id: Math.max(...store.products.map(p => p.id), 0) + 1,
    ...req
  };
  store.products.push(newProduct);
  
  return { created: newProduct };
};
```

### Custom HTTP Status Codes

For specific status codes (404, 400, etc.), return a Response object:

```typescript
export const GET = ({ params }: any) => {
  const id = parseInt(params.id);
  const product = store.products.find(p => p.id === id);
  
  if (!product) {
    return new Response(
      JSON.stringify({ error: 'Product not found' }), 
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return { product };
};
```

**Common HTTP status codes:**
- `400` — Bad Request (validation errors)
- `401` — Unauthorized (missing/invalid auth)
- `403` — Forbidden (valid auth but no permission)
- `404` — Not Found (resource doesn't exist)
- `500` — Internal Server Error (unexpected errors)

## Best Practices

### Routing & Structure
✅ One `index.ts` file per route endpoint  
✅ Use `[paramName]` directories for dynamic segments  
✅ Group related endpoints in nested directories  
✅ Keep route hierarchy shallow (3-4 levels max)  

### Type Safety
✅ Define request/response types in `src/shared/api.ts`  
✅ Use TypeScript interfaces for all handlers  
✅ Cast `body` to typed request interfaces  
✅ Return typed response objects  

### Code Organization
✅ Keep business logic in the store or service layer  
✅ Handlers should be thin — validate, call store, return  
✅ Extract reusable logic into separate functions  
✅ Use middleware for cross-cutting concerns  

### Error Handling
✅ Validate input early and throw descriptive errors  
✅ Use custom Response objects for specific status codes  
✅ Return consistent error response shapes  
✅ Log errors for debugging (use middleware)  

## Quick Reference

### Creating a New Endpoint

```bash
# 1. Create the directory structure
mkdir -p src/server/router/users

# 2. Create the handler file
touch src/server/router/users/index.ts
```

```typescript
// 3. Implement the handlers
import { store } from '../../store';

export const GET = () => {
  return { users: store.users };
};

export const POST = ({ body }: any) => {
  const newUser = { id: Date.now(), ...body };
  store.users.push(newUser);
  return { created: newUser };
};
```

**Result:** Handlers are automatically available at `GET /api/users` and `POST /api/users`

### Adding Route Parameters

```bash
# Create a parameterized route
mkdir -p src/server/router/users/[id]
touch src/server/router/users/[id]/index.ts
```

```typescript
// Access the parameter
export const GET = ({ params }: any) => {
  const userId = parseInt(params.id);
  const user = store.users.find(u => u.id === userId);
  return { user };
};
```

**Result:** Available at `GET /api/users/:id`

### Building Nested Resources

```bash
# Create nested structure
mkdir -p src/server/router/users/[id]/posts
touch src/server/router/users/[id]/posts/index.ts
```

```typescript
// Both parent and child params available
export const GET = ({ params }: any) => {
  const userId = parseInt(params.id);
  // Access user's posts
  return { posts: store.getPostsByUserId(userId) };
};
```

**Result:** Available at `GET /api/users/:id/posts`

## Production Deployment

### Building for Production

```bash
# Build client and server
bun run build
```

This creates:
- `dist/client/` — Optimized Vue SPA (HTML, CSS, JS)
- `dist/server/` — Compiled server code (optional)

### Running in Production

```bash
# Set environment variables
export SERVER_PORT=3000
export NODE_ENV=production

# Start the server
bun src/server/index.ts
```

The single Bun process serves:
- ✅ Static client files at `/`
- ✅ API endpoints at `/api/*`
- ✅ SPA fallback for client-side routing

### Migrating to a Real Database

Replace the in-memory store with a real database:

```typescript
// src/server/db.ts
import { Database } from 'bun:sqlite';

const db = new Database('myapp.db');

export const dbStore = {
  getProducts() {
    return db.query('SELECT * FROM products').all();
  },
  
  createProduct(data: any) {
    return db.query('INSERT INTO products (name, price) VALUES (?, ?) RETURNING *')
      .get(data.name, data.price);
  },
  
  updateProduct(id: number, data: any) {
    return db.query('UPDATE products SET name = ?, price = ? WHERE id = ? RETURNING *')
      .get(data.name, data.price, id);
  }
};
```

Then update your handlers to use `dbStore` instead of the memory `store`.

## Troubleshooting

### Routes Not Registering

**Symptom:** API endpoint returns 404

**Solutions:**
- ✅ Ensure handler is in `src/server/router/` directory
- ✅ File must be named `index.ts` (or `index.js`)
- ✅ Export HTTP methods in UPPERCASE: `GET`, `POST`, `PATCH`, `DELETE`
- ✅ Check server console for route registration logs: `Registering route: GET /api/product/:id`

### Parameter Coming Through as Undefined

**Symptom:** `params.id` is undefined in handler

**Solutions:**
- ✅ Directory must be named `[id]` (with brackets)
- ✅ Parameter name is case-sensitive: `[userId]` → `params.userId`
- ✅ Remember to parse: `parseInt(params.id)` or `+params.id`
- ✅ Parameters come from directory names, not file names

### DELETE Method Not Working

**Symptom:** DELETE handler not being called

**Solutions:**
- ✅ Use uppercase `DELETE` not lowercase `delete` (reserved keyword)
- ✅ Verify function is exported: `export const DELETE = ...`
- ✅ Check browser is sending DELETE request (not GET/POST)

### Data Not Persisting

**Symptom:** Changes disappear after other requests

**Solutions:**
- ✅ Import store from correct path: `import { store } from '../../store'`
- ✅ Mutate store objects in-place, don't reassign: `store.products.push()` not `store.products = []`
- ✅ Remember: in-memory store resets on server restart
- ✅ For production: migrate to a database

### TypeScript Errors

**Symptom:** Type errors in handler code

**Solutions:**
- ✅ Define types in `src/shared/api.ts`
- ✅ Cast request body: `const req = body as ProductAPI.CreateRequest`
- ✅ Use `any` for context if needed: `({ params }: any)`
- ✅ Install types: `bun add -d @types/bun @types/node`

---

## Next Steps

Now that you understand server-side API development, check out:

- **[Client Guide](../client/CLIENT.md)** — Build the Vue frontend
- **[Shared API Types](../shared/api.ts)** — Type-safe contracts between client and server

**Need help?** Open an issue on GitHub or check the documentation at [npmjs.com/package/bev-fs](https://www.npmjs.com/package/bev-fs)
