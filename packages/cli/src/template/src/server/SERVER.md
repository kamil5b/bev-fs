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
├── index.ts            # Server entry point
├── middleware.ts       # Logging middleware factory
├── db/
│   └── store.ts        # Shared in-memory data store (database layer)
├── handler/
│   └── product.handler.ts    # HTTP request handlers (business logic entry point)
├── service/
│   └── product.service.ts    # Business logic & response formatting layer
├── repository/
│   └── product.repository.ts # Data access abstraction over store
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

**Key concepts:** 
- Your folder structure in `router/` IS your API routing structure
- Clean architecture layers: **Router → Handler → Service → Repository → DB**
- Each handler delegates to the service layer, never directly accessing the store
- This separation makes your code testable, maintainable, and scalable

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

## Step 2: Understanding the Clean Architecture Layers

The bev-fs server uses a clean, layered architecture for separation of concerns:

```
HTTP Request
    ↓
Router (File-based routing)
    ↓
Handler (Parse params, call service)
    ↓
Service (Business logic, response formatting)
    ↓
Repository (Data access abstraction)
    ↓
Database/Store (Persistence layer)
```

### Layer Responsibilities

**Router** — Thin routing layer
- Maps HTTP methods to handler functions
- Minimal logic — just imports and delegates
- Example: `src/server/router/product/index.ts`

**Handler** — HTTP request entry points
- Parses route params and request body
- Calls the appropriate service methods
- Returns formatted responses
- Example: `src/server/handler/product.handler.ts`

**Service** — Business logic and orchestration
- Contains core application logic
- Calls repository methods for data access
- Formats responses in the API contract shape
- Example: `src/server/service/product.service.ts`

**Repository** — Data access abstraction
- Abstracts over the store/database
- Provides clean CRUD interface
- Used by service layer, never directly by handlers
- Example: `src/server/repository/product.repository.ts`

**Database/Store** — Persistence
- Holds your actual data (in-memory, SQL, etc.)
- Only accessed through repository layer
- Example: `src/server/db/store.ts`

### Data Flow Example

Creating a product:

```
Client POST /api/product { name, price }
  ↓
router/product/index.ts
  exports POST = ({ body }: any) => createProduct(body);
  ↓
handler/product.handler.ts
  export const createProduct = (body: any) => 
    productService.createProduct(body);
  ↓
service/product.service.ts
  export const createProduct = (data: ProductRequest.Create) => {
    const created = productRepository.createProduct(data);
    return { created }; // Wrapped in response
  }
  ↓
repository/product.repository.ts
  export const createProduct = (data) => {
    const newProduct = { id: nextId(), ...data };
    store.products.push(newProduct);
    return newProduct;
  }
  ↓
db/store.ts
  Actual data is stored in store.products array
```

### Understanding Data Persistence

The `db/store.ts` file provides a simple in-memory database for development:

```typescript
// src/server/db/store.ts
import type { Product, Progress } from '../../shared';

export const store = {
  products: [
    { id: 1, name: 'Product 1', price: 9.99 },
    { id: 2, name: 'Product 2', price: 19.99 }
  ] as ProductResponse.GetList['products'],

  productProgress: {
    1: [{ id: 1, productId: 1, percentage: 50, status: 'in-progress', ... }],
    2: [{ id: 2, productId: 2, percentage: 100, status: 'completed', ... }]
  },

  // Helper methods
  getProgressByProductId(productId: number) { ... },
  createProgress(productId: number, data: any) { ... },
  updateProgress(productId: number, id: number, data: any) { ... },
  deleteProgress(productId: number, id: number) { ... }
};
```

**Why this architecture?**
- ✅ **Separation of concerns** — Each layer has one job
- ✅ **Testability** — Mock repository for unit testing service
- ✅ **Reusability** — Service logic isn't tied to HTTP
- ✅ **Flexibility** — Swap store for database without changing handlers/services
- ✅ **Maintainability** — Changes to business logic in one place

**Data persistence notes:**
- ⚠️ In-memory store resets on server restart
- ⚠️ Not suitable for production
- ✅ Perfect for demos and rapid prototyping
- ✅ Easy to swap for a real database (see Production Deployment section)

**Key pattern:** Export a singleton object that all handlers can import and mutate directly.

## Step 3: Understanding Directory-Based Routing

The magic of bev-fs is that your folder structure in `src/server/router/` defines your API routes automatically. No configuration needed!

### How It Works

1. Place an `index.ts` file in any folder under `src/server/router/`
2. The framework automatically creates an API route at `/api/<folder-path>`
3. Use `[paramName]` folders to create dynamic route parameters
4. Export HTTP method functions (`GET`, `POST`, `PATCH`, `DELETE`) that delegate to handlers

### Route Mapping Examples

| File Path | Generated Route | Handler Imported From |
|-----------|-----------------|----------------------|
| `router/product/index.ts` | `GET/POST /api/product` | `handler/product.handler.ts` |
| `router/product/[id]/index.ts` | `GET/PATCH/DELETE /api/product/:id` | `handler/product.handler.ts` |
| `router/product/[id]/progress/index.ts` | `GET/POST /api/product/:id/progress` | `handler/product.handler.ts` |
| `router/product/[id]/progress/[progressId]/index.ts` | `GET/PATCH/DELETE /api/product/:id/progress/:progressId` | `handler/product.handler.ts` |

### Routing Rules

✅ **DO:**
- Create an `index.ts` (or `index.js`) in each route directory
- Use `[paramName]` syntax for dynamic segments (e.g., `[id]`, `[progressId]`)
- Nest directories to create hierarchical routes
- Export uppercase HTTP method names: `GET`, `POST`, `PATCH`, `DELETE`
- Import handler functions and call them with minimal processing

❌ **DON'T:**
- Put handlers in files other than `index.ts` (they won't be registered)
- Use lowercase method names (use `DELETE` not `delete`)
- Write business logic directly in router files (put it in handlers/services)
- Rely on filename for routing (only directory structure matters)

## Step 4: Writing Your First API Handler

The handler layer is your entry point for HTTP requests. It parses parameters and delegates to the service layer.

### Handler Layer

Handlers sit between router and service. They:
1. Extract params and body from the HTTP context
2. Call service methods with parsed data
3. Return service responses directly

Example: `src/server/handler/product.handler.ts`

```typescript
import { productService } from '../service/product.service';

// Product List Handler
export const getProducts = () => {
  return productService.listProducts();
};

// Product Create Handler
export const createProduct = (body: any) => {
  return productService.createProduct(body);
};

// Product Detail Handler
export const getProduct = (params: any) => {
  const id = parseInt(params.id);
  return productService.getProduct(id);
};

// Product Update Handler
export const updateProduct = (params: any, body: any) => {
  const id = parseInt(params.id);
  return productService.updateProduct(id, body);
};

// Product Delete Handler
export const deleteProduct = (params: any) => {
  const id = parseInt(params.id);
  return productService.deleteProduct(id);
};

// Progress operations follow the same pattern...
export const getProductProgress = (params: any) => {
  const productId = parseInt(params.id);
  return productService.listProductProgress(productId);
};
```

### Service Layer

Services contain business logic and call the repository. They:
1. Implement business logic and validation
2. Format responses to match API contracts
3. Call repository methods for data access

Example: `src/server/service/product.service.ts`

```typescript
import { productRepository } from '../repository/product.repository';
import { ProductRequest, ProductResponse } from '../../shared';

export const productService = {
  listProducts(): ProductResponse.GetList {
    const products = productRepository.getAllProducts();
    return { products };
  },

  getProduct(id: number): ProductResponse.GetById {
    const product = productRepository.getProductById(id);
    return { 
      product: product || { id, name: `Product ${id}`, price: 0 } 
    };
  },

  createProduct(data: ProductRequest.Create): ProductResponse.Create {
    const created = productRepository.createProduct(data);
    return { created };
  },

  updateProduct(id: number, data: ProductRequest.Update): ProductResponse.Update {
    const updated = productRepository.updateProduct(id, data);
    return { 
      updated: updated || { id, name: `Product ${id}`, price: 0 } 
    };
  },

  deleteProduct(id: number): ProductResponse.Delete {
    productRepository.deleteProduct(id);
    return { deleted: id };
  }
};
```

**Service benefits:**
- ✅ All business logic in one place (not scattered in handlers)
- ✅ Handlers are thin and simple
- ✅ Services are testable without HTTP context
- ✅ Service logic can be reused for different transports (API, CLI, etc.)

### Repository Layer

Repositories provide a data access abstraction. They:
1. Wrap store/database operations
2. Provide a clean interface for data access
3. Handle data access validation

Example: `src/server/repository/product.repository.ts`

```typescript
import { store } from '../db/store';
import { ProductRequest } from '../../shared';

export const productRepository = {
  getAllProducts() {
    return store.products;
  },

  getProductById(id: number) {
    return store.products.find((p: any) => p.id === id);
  },

  createProduct(data: ProductRequest.Create) {
    const newProduct = {
      id: Math.max(...store.products.map(p => p.id), 0) + 1,
      name: data.name,
      price: data.price
    };
    store.products.push(newProduct);
    return newProduct;
  },

  updateProduct(id: number, data: ProductRequest.Update) {
    const product = this.getProductById(id);
    if (product) {
      if (data.name !== undefined) product.name = data.name;
      if (data.price !== undefined) product.price = data.price;
    }
    return product;
  },

  deleteProduct(id: number): boolean {
    const index = store.products.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      store.products.splice(index, 1);
      return true;
    }
    return false;
  }
};
```

**Repository benefits:**
- ✅ Database changes only require updating the repository
- ✅ Can swap store for real database (SQL, MongoDB, etc.)
- ✅ Service layer stays the same when data source changes
- ✅ Makes switching databases painless

### Connecting It All Together — The Router

Finally, the thin router layer imports handlers and calls them:

```typescript
// src/server/router/product/index.ts
import { getProducts, createProduct } from '../../handler/product.handler';

// GET /api/product - list all products
export const GET = () => {
  return getProducts();
};

// POST /api/product - create a product
export const POST = ({ body }: any) => {
  return createProduct(body);
};
```

```typescript
// src/server/router/product/[id]/index.ts
import { getProduct, updateProduct, deleteProduct } from '../../../handler/product.handler';

// GET /api/product/:id - get a product by id
export const GET = ({ params }: any) => {
  return getProduct(params);
};

// PATCH /api/product/:id - update a product
export const PATCH = ({ params, body }: any) => {
  return updateProduct(params, body);
};

// DELETE /api/product/:id - delete a product
export const DELETE = ({ params }: any) => {
  return deleteProduct(params);
};
```

**Router pattern:**
- ✅ Thin routing layer — just imports and calls handlers
- ✅ No business logic in routers
- ✅ Minimal parameter parsing (delegates to handlers)
- ✅ Easy to understand the flow at a glance

## Step 5: Working with Route Parameters and Nested Routes

### Understanding Parameters

Route parameters come from `[paramName]` folder names:

```typescript
// For route /api/product/[id]/index.ts
export const GET = ({ params }: any) => {
  const id = parseInt(params.id);  // params.id comes from [id] folder
  return getProduct({ id });
};
```

**Parameter rules:**
- Folder name `[id]` becomes `params.id` (case-sensitive)
- Parameters are always strings — parse as needed: `parseInt(params.id)`
- Multiple parameters work for nested routes: `params.id`, `params.progressId`, etc.

### Building Nested Routes

For routes like `/api/product/:id/progress/:progressId`, you get both parameters:

```typescript
// src/server/router/product/[id]/progress/[progressId]/index.ts
import { getProgressDetail } from '../../../../../handler/product.handler';

export const GET = ({ params }: any) => {
  // params.id from [id] folder
  // params.progressId from [progressId] folder
  return getProgressDetail(params);
};
```

In the handler:

```typescript
export const getProgressDetail = (params: any) => {
  const productId = parseInt(params.id);
  const progressId = parseInt(params.progressId);
  return productService.getProductProgress(productId, progressId);
};
```

## Step 6: Creating a Basic API Endpoint

Let's create a complete product API endpoint from scratch:

**1. Create the handler** at `src/server/handler/product.handler.ts`
**2. Create the service** at `src/server/service/product.service.ts`
**3. Create the repository** at `src/server/repository/product.repository.ts`
**4. Create the router** at `src/server/router/product/index.ts`

This is already done in the template! Follow the same pattern for new endpoints.

## Step 7: Adding Middleware

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

## Step 8: Error Handling

### Basic Error Handling

The simplest way to handle errors is to throw in your service layer:

```typescript
// Service layer
export const productService = {
  getProduct(id: number): ProductResponse.GetById {
    const product = productRepository.getProductById(id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return { product };
  }
};
```

⚠️ **Note:** Thrown errors automatically return HTTP 500 with the error message.

### Input Validation

Validate request data in the service before processing:

```typescript
// Service layer
export const productService = {
  createProduct(data: ProductRequest.Create): ProductResponse.Create {
    // Validate required fields
    if (!data.name || !data.price) {
      throw new Error('name and price are required');
    }
    
    // Validate data types
    if (typeof data.price !== 'number' || data.price <= 0) {
      throw new Error('price must be a positive number');
    }
    
    const created = productRepository.createProduct(data);
    return { created };
  }
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

### Clean Architecture Layers

✅ **Router** — Thin entry points
- Import handler functions
- Minimal parameter extraction
- Delegate all logic to handlers

✅ **Handler** — HTTP request entry points  
- Parse params and body
- Call service methods
- Return service responses

✅ **Service** — Business logic
- Contains core application logic
- Calls repository methods
- Formats responses to API contracts
- Can be tested without HTTP context

✅ **Repository** — Data access
- Abstracts store/database access
- Provides clean CRUD interface
- Only layer that touches the store

✅ **Database/Store** — Persistence
- Only accessed through repository layer
- Simple data structures
- No business logic

### Code Organization

✅ **DO:**
- Keep handlers thin and focused
- Put business logic in services
- Abstract data access in repositories
- Use middleware for cross-cutting concerns
- Keep validation in the service layer

❌ **DON'T:**
- Write business logic in handlers
- Access store directly from handlers or services
- Put HTTP-specific code in business logic
- Mix concerns in a single file
- Create deeply nested routes (3-4 levels max)  

## Quick Reference

### Creating a New Endpoint (Complete Flow)

**1. Create repository layer** at `src/server/repository/users.repository.ts`

```typescript
import { store } from '../db/store';

export const userRepository = {
  getAllUsers() {
    return store.users;
  },
  
  getUserById(id: number) {
    return store.users.find(u => u.id === id);
  },
  
  createUser(data: any) {
    const newUser = { id: Date.now(), ...data };
    store.users.push(newUser);
    return newUser;
  }
};
```

**2. Create service layer** at `src/server/service/users.service.ts`

```typescript
import { userRepository } from '../repository/users.repository';
import { UserRequest, UserResponse } from '../../shared';

export const userService = {
  listUsers(): UserResponse.GetList {
    return { users: userRepository.getAllUsers() };
  },
  
  createUser(data: UserRequest.Create): UserResponse.Create {
    const created = userRepository.createUser(data);
    return { created };
  }
};
```

**3. Create handler layer** at `src/server/handler/users.handler.ts`

```typescript
import { userService } from '../service/users.service';

export const getUsers = () => userService.listUsers();

export const createUser = (body: any) => userService.createUser(body);
```

**4. Create router** at `src/server/router/users/index.ts`

```typescript
import { getUsers, createUser } from '../../handler/users.handler';

export const GET = () => getUsers();

export const POST = ({ body }: any) => createUser(body);
```

**Result:** 
- `GET /api/users` — list all users
- `POST /api/users` — create a user

### Adding Route Parameters

**1. Create directory with [paramName]**
```bash
mkdir -p src/server/router/users/[id]
```

**2. Create handler for detail operations** in `handler/users.handler.ts`

```typescript
export const getUser = (params: any) => {
  const id = parseInt(params.id);
  return userService.getUser(id);
};
```

**3. Create router** at `src/server/router/users/[id]/index.ts`

```typescript
import { getUser } from '../../../handler/users.handler';

export const GET = ({ params }: any) => getUser(params);
```

**Result:** `GET /api/users/:id`

### Creating Nested Resources

For `/api/users/:id/posts`, create the directory structure:

```bash
mkdir -p src/server/router/users/[id]/posts
touch src/server/router/users/[id]/posts/index.ts
```

Then implement the full stack (repository → service → handler → router) for posts endpoints.

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

The clean architecture makes database migration simple! The repository layer is the only place that touches the store:

**1. Create a database client** at `src/server/db/database.ts`

```typescript
import { Database } from 'bun:sqlite';

export const db = new Database('myapp.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL
  );
`);
```

**2. Update the repository** to use the database instead of in-memory store:

```typescript
// src/server/repository/product.repository.ts
import { db } from '../db/database';
import { ProductRequest } from '../../shared';

export const productRepository = {
  getAllProducts() {
    return db.query('SELECT * FROM products').all();
  },
  
  getProductById(id: number) {
    return db.query('SELECT * FROM products WHERE id = ?').get(id);
  },
  
  createProduct(data: ProductRequest.Create) {
    const result = db.query('INSERT INTO products (name, price) VALUES (?, ?) RETURNING *')
      .get(data.name, data.price);
    return result;
  },
  
  updateProduct(id: number, data: ProductRequest.Update) {
    const result = db.query('UPDATE products SET name = ?, price = ? WHERE id = ? RETURNING *')
      .get(data.name, data.price, id);
    return result;
  },
  
  deleteProduct(id: number): boolean {
    const result = db.query('DELETE FROM products WHERE id = ?').run(id);
    return result.success;
  }
};
```

**3. No other changes needed!** — Services, handlers, and routers work exactly the same

✅ This is the power of clean architecture — database migration only requires updating the repository layer!

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
- ✅ Define types in `src/shared.ts`
- ✅ Cast request body: `const req = body as ProductAPI.CreateRequest`
- ✅ Use `any` for context if needed: `({ params }: any)`
- ✅ Install types: `bun add -d @types/bun @types/node`

---

## Next Steps

Now that you understand server-side API development, check out:

- **[Client Guide](../client/CLIENT.md)** — Build the Vue frontend
- **[Shared API Types](../shared.ts)** — Type-safe contracts between client and server

**Need help?** Open an issue on GitHub or check the documentation at [npmjs.com/package/bev-fs](https://www.npmjs.com/package/bev-fs)
