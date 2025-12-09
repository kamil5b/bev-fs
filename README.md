# bev-fs — Fullstack Framework with Directory-Based Routing

A modern, type-safe fullstack framework for building Vue 3 + Elysia applications with zero configuration. Features automatic route discovery, single-port deployment, and end-to-end TypeScript support.

**Published packages:**
- [`bev-fs`](https://www.npmjs.com/package/bev-fs) — runtime framework (v1.0.0+)
- [`create-bev-fs`](https://www.npmjs.com/package/create-bev-fs) — CLI scaffolding tool (v1.0.0+)

## Key Features

✨ **Directory-Based Routing** — Your folder structure defines both API and page routes  
🔒 **Type-Safe End-to-End** — Shared TypeScript types from server to client  
⚡ **Zero Configuration** — No route files, no config, just create files  
🎯 **Single-Port Deployment** — One process serves frontend + backend  
🔥 **Hot Module Replacement** — Instant feedback during development  
📦 **Production Ready** — Optimized builds with Vite and Bun  

## Architecture

* **`packages/framework`** — Core runtime (server, client, shared utilities)
* **`packages/cli`** — Project scaffolding CLI tool
* **`packages/cli/src/template`** — Starter template with examples
* **Single Elysia process** serves both frontend and API on port 3000
* **Config flexibility** — YAML and .env support with environment injection
* **Middleware system** — Extensible request/response pipeline

## Quick Start

### Create a New Project

```bash
npx create-bev-fs@latest my-project
cd my-project
bun install
bun run dev
```

Then open:
- **http://localhost:5173** — Vite dev server (hot reload)
- **http://localhost:3000** — Production server (after build)

### What Gets Created

```
my-project/
├── src/
│   ├── client/          # Vue 3 frontend
│   │   ├── router/      # Auto-discovered pages
│   │   ├── api.ts       # Type-safe API client
│   │   └── main.ts      # App entry point
│   ├── server/          # Elysia backend
│   │   ├── router/      # Auto-discovered API routes
│   │   ├── store.ts     # In-memory data store
│   │   └── index.ts     # Server entry point
│   └── shared/
│       └── api.ts       # Shared TypeScript types
├── vite.config.ts       # Vite configuration
├── package.json
└── bunfig.toml
```

## Development Workflow

### Adding a New Page

```bash
# Create the file
mkdir -p src/client/router/about
echo '<template><h1>About</h1></template>' > src/client/router/about/index.vue
```

✅ Page automatically available at `/about`

### Adding an API Endpoint

```bash
# Create the directory and handler
mkdir -p src/server/router/users
```

```typescript
// src/server/router/users/index.ts
export const GET = () => {
  return { users: [{ id: 1, name: 'John' }] };
};
```

✅ API automatically available at `GET /api/users`

## Repository Scripts

The root `package.json` provides convenient scripts for development and publishing:

| Script | Description |
|--------|-------------|
| `bun run bootstrap` | Install all dependencies in workspace |
| `bun run dev` | Build packages and start testbed with dev servers |
| `bun run start` | Build packages and start testbed with production server |
| `bun run publish` | Build both packages and publish to npm |

### Quick Development

```bash
# Install dependencies
bun run bootstrap

# Build everything and start dev servers
bun run dev
# Now: Vite on http://localhost:5173, Elysia on http://localhost:3000
```

### Publishing Updates (Maintainers)

Update versions in both `packages/framework/package.json` and `packages/cli/package.json`, then:

```bash
# Build and publish both packages to npm
bun run publish
```

This runs the `publish.sh` script which:
1. Builds the framework package
2. Builds the CLI package
3. Publishes both to npm

## How It Works

### Directory-Based Routing

**Server (API) routes:**
```
src/server/router/
├── product/
│   ├── index.ts              → GET/POST /api/product
│   └── [id]/
│       ├── index.ts          → GET/PATCH/DELETE /api/product/:id
│       └── progress/
│           └── index.ts      → GET/POST /api/product/:id/progress
```

**Client (Page) routes:**
```
src/client/router/
├── index.vue                 → /
├── product/
│   ├── index.vue             → /product
│   └── [id]/
│       └── index.vue         → /product/:id
└── not-found/
    └── index.vue             → 404 catch-all
```

### Single-Port Deployment

- **Development:** Vite dev server (5173) + Elysia API (3000)
- **Production:** Single Elysia process (3000) serves both static files and API

### Type Safety

```typescript
// src/shared/api.ts — Shared between client and server
export interface Product {
  id: number;
  name: string;
  price: number;
}

export namespace ProductAPI {
  export interface CreateRequest {
    name: string;
    price: number;
  }
  export interface CreateResponse {
    created: Product;
  }
}
```

```typescript
// src/server/router/product/index.ts
export const POST = ({ body }: any): ProductAPI.CreateResponse => {
  const req = body as ProductAPI.CreateRequest;
  // Type-safe request and response
};
```

```typescript
// src/client/api.ts
async create(data: ProductAPI.CreateRequest): Promise<ProductAPI.CreateResponse> {
  // Type-safe API client
}
```

## Configuration

### Environment Variables

```bash
# .env or .env.local
SERVER_PORT=3000
SERVER_ROUTER_DIR=src/server/router
SERVER_STATIC_DIR=dist/client
```

### YAML Configuration

```yaml
# config.yaml or config.yaml.local
server:
  port: 3000
  routerDir: src/server/router
  staticDir: dist/client
```

**Precedence:** `config.yaml` > `.env` > defaults

All config values are automatically injected into `process.env` with uppercase keys:
- `server.port` → `process.env.SERVER_PORT`
- `server.routerDir` → `process.env.SERVER_ROUTER_DIR`  

## Documentation

- 📕 [**Framework Guide**](./packages/framework/FRAMEWORK.md) — Core framework API and utilities
- 📘 [**Server Guide**](./packages/cli/src/template/src/server/SERVER.md) — Building APIs with directory-based routing
- 📙 [**Client Guide**](./packages/cli/src/template/src/client/CLIENT.md) — Building UIs with Vue 3 and TypeScript
- 📗 [**Complete Guide**](./GUIDE.md) — Framework internals and architecture

## Examples

### Creating a Parametrized Endpoint

```typescript
// src/server/router/product/[id]/index.ts
import { store } from '../../../store';

export const GET = ({ params }: any) => {
  const id = parseInt(params.id);
  const product = store.products.find(p => p.id === id);
  return { product };
};
```

### Building a Dynamic Page

```vue
<!-- src/client/router/product/[id]/index.vue -->
<template>
  <div v-if="product">
    <h1>{{ product.name }}</h1>
    <p>${{ product.price }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { productAPI } from '../../../api';

const route = useRoute();
const product = ref(null);

onMounted(async () => {
  const id = parseInt(route.params.id as string);
  const response = await productAPI.getById(id);
  product.value = response.product;
});
</script>
```

## Contributing

This is a monorepo containing:

1. **Framework package** (`packages/framework`) — Core runtime
2. **CLI package** (`packages/cli`) — Scaffolding tool
3. **Template** (`packages/cli/src/template`) — Starter project

### Local Development

**Quick test (recommended):**
```bash
# Clone repo
git clone https://github.com/kamil5b/bev-fs
cd bun-fullstack
bun install

# Build and test everything automatically
./testbed.sh
```

The `testbed.sh` script builds both packages, creates a test project in `/tmp/bun-testbed`, links the local framework, and starts dev servers.

**Manual workflow:**
```bash
# Install dependencies
bun install

# Build framework
cd packages/framework
bun run build

# Build CLI
cd ../cli
bun run build

# Test locally
cd ../..
node packages/cli/dist/index.js my-test-project
cd my-test-project
bun install && bun run dev
```

## License

MIT
