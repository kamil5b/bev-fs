# bev-fs Starter Project

A fullstack monolithic application built with **Vue 3 + Vite** (client) and **Elysia + Bun** (server).

## Quick Start

```bash
# Install dependencies
bun install

# Start dev server (both client and server)
bun run dev

# Build for production
bun run build
```

- **Client**: http://localhost:5173 (Vite dev server with HMR)
- **Server**: http://localhost:3000 (API + static assets in production)

## Project Structure

```
src/
├── app/                    # Vue client
│   ├── main.ts            # Entry point
│   ├── App.vue            # Root component
│   ├── router.ts          # Vue Router config
│   ├── pages/             # Page components
│   │   ├── index.vue
│   │   └── users.vue
│   └── index.html
├── server/                # Elysia server
│   ├── index.ts           # Server startup
│   └── api/               # API route handlers
│       ├── product.ts
│       ├── product.[id].ts
│       └── users.ts
└── types/                 # Shared TypeScript types
    └── User.ts

dist/
├── client/                # Built Vue app (production)
└── server/                # Bundled server
```

## API Routing

The framework automatically discovers and registers API handlers from `src/server/api/`.

### File-to-Route Mapping

| File | Routes | Methods |
|------|--------|---------|
| `product.ts` | `GET/POST /api/product` | `get`, `post` |
| `product.[id].ts` | `GET/PATCH/DELETE /api/product/:id` | `get`, `patch`, `delete` |
| `users.ts` | `GET/POST /api/users` | `get`, `post` |

### Naming Convention

- **Static routes**: `product.ts` → `/api/product`
- **Dynamic routes**: `product.[id].ts` → `/api/product/:id`
- **HTTP methods**: Named exports (`get`, `post`, `put`, `patch`, `delete`)

## API Handler Examples

### List Resources (GET /api/product)

```typescript
// src/server/api/product.ts
export const GET = () => {
  return { products: [...] };
};
```

### Create Resource (POST /api/product)

```typescript
export const POST = ({ body }: any) => {
  const newProduct = { id: generateId(), ...body };
  return { created: newProduct };
};
```

### Get by ID (GET /api/product/:id)

```typescript
// src/server/api/product.[id].ts
export const GET = ({ params }: any) => {
  const id = params.id;
  return { product: { id, name: `Product ${id}` } };
};
```

### Update Resource (PATCH /api/product/:id)

```typescript
export const PATCH = ({ params, body }: any) => {
  const id = params.id;
  return { updated: { id, ...body } };
};
```

### Delete Resource (DELETE /api/product/:id)

```typescript
export const DELETE = ({ params }: any) => {
  const id = params.id;
  return { deleted: id };
};
```

## Client-Server Communication

### Type-Safe API Client

Use the pre-built API client with full TypeScript support:

```typescript
// src/app/pages/products.vue
import { onMounted, ref } from 'vue';
import { productAPI } from '../api';

const products = ref([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const res = await productAPI.list();
  products.value = res.products;
  loading.value = false;
});
```

All API methods are fully typed and return the correct response types:

```typescript
// List all products (GET /api/product)
const res = await productAPI.list();
// res.products: Product[]

// Get single product (GET /api/product/:id)
const res = await productAPI.getById(1);
// res.product: Product

// Create product (POST /api/product)
const res = await productAPI.create({
  name: 'New Product',
  price: 29.99
});
// res.created: Product

// Update product (PATCH /api/product/:id)
const res = await productAPI.update(1, {
  price: 19.99
});
// res.updated: Product

// Delete product (DELETE /api/product/:id)
const res = await productAPI.delete(1);
// res.deleted: number
```

### Shared Types

Types are defined in `src/types/api.ts` and shared between frontend and backend:

```typescript
// Request/Response types are namespaced per resource
namespace ProductAPI {
  interface CreateRequest {
    name: string;
    price: number;
  }
  interface CreateResponse {
    created: Product;
  }
  // ... more types
}

// Models are shared
interface Product {
  id: number;
  name: string;
  price: number;
}
```

### Manual Fetch (Without API Client)

If you prefer not to use the API client:

```typescript
const res = await fetch('/api/product');
const data = await res.json();
// data.products: Product[]
```

## Development Scripts

```bash
# Start both client and server
bun run dev

# Run server only (for debugging)
bun run dev:server

# Run client only
bun run dev:client

# Build for production
bun run build

# Build client only
bun run build:client

# Build server only
bun run build:server
```

## Production Deployment

```bash
# Build
bun run build

# Start server (serves built client + API)
bun start
```

The server runs on port 3000 and serves:
- Static assets from `dist/client/`
- API endpoints from `/api/*`
- SPA fallback for client-side routing

## Adding New API Routes

1. Create a handler file in `src/server/api/`:

```typescript
// src/server/api/comment.ts
export const GET = () => ({ comments: [] });
export const POST = ({ body }: any) => ({ created: body });
```

2. Access it via `GET /api/comment` and `POST /api/comment`

For dynamic routes (with ID):

```typescript
// src/server/api/comment.[id].ts
export const GET = ({ params }: any) => ({ comment: { id: params.id } });
export const PATCH = ({ params, body }: any) => ({ updated: { id: params.id, ...body } });
```

Access via `GET /api/comment/:id` and `PATCH /api/comment/:id`

## Supported HTTP Methods

- `get` - Read
- `post` - Create
- `put` - Replace
- `patch` - Update
- `delete` - Delete

## TypeScript Support

All handlers have full TypeScript support. Type context helpers:

```typescript
import type { Handler } from 'elysia';

export const GET: Handler = ({ params, query, body, headers }) => {
  // params: route parameters (e.g., :id)
  // query: query string params
  // body: parsed request body
  // headers: request headers
  return { /* response */ };
};
```

## SPA Routing

Client-side routes are handled by Vue Router. Server has a fallback that returns `index.html` for unknown routes, enabling client-side routing.

```typescript
// src/app/router.ts
import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/products', component: ProductsPage },
    { path: '/users', component: UsersPage }
  ]
});
```

## Notes

- **Single deployment**: One Bun process serves client + API
- **Hot reload (dev)**: Vite handles client HMR, server reloads on file changes
- **Type safety**: Full TypeScript throughout the stack
- **No build complexity**: Vite + Bun handle all bundling
