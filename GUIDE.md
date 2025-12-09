# bev-fs — Complete Framework Guide

A comprehensive guide to the bev-fs framework architecture, implementation, and development workflow.

## Overview

bev-fs is a fullstack TypeScript framework that combines Vue 3 (frontend) and Elysia (backend) with automatic route discovery and type safety. Built for developer experience and production deployment.

**Package Structure:**
* `packages/framework` (`bev-fs`) — Core runtime library
* `packages/cli` (`create-bev-fs`) — Project scaffolding CLI
* `packages/cli/src/template` — Feature-rich starter template with examples
* `packages/cli/src/base` — Minimal base template for lightweight projects

**Current Versions:**
- `bev-fs@1.0.0` — Framework runtime
- `create-bev-fs@1.0.0` — CLI tool

---

## Repository Structure

```
bun-fullstack/                    # Monorepo root
├── packages/
│   ├── framework/                # bev-fs runtime package
│   │   ├── src/
│   │   │   ├── server/
│   │   │   │   └── createServer.ts    # Server factory with auto-discovery
│   │   │   ├── client/
│   │   │   │   └── createApp.ts       # Vue app factory with routing
│   │   │   ├── shared/
│   │   │   │   ├── createRoute.ts     # Route path conversion utilities
│   │   │   │   └── types.ts           # Shared type definitions
│   │   │   └── index.ts               # Main exports
│   │   ├── dist/                      # Compiled output (ES modules)
│   │   └── package.json               # v1.0.0
│   │
│   └── cli/                      # create-bev-fs scaffolding tool
│       ├── src/
│       │   ├── index.ts               # CLI entry point
│       │   ├── base/                  # Minimal starter template
│       │   └── template/              # Feature-rich starter template
│       │       ├── src/
│       │       │   ├── client/        # Vue frontend example
│       │       │   ├── server/        # Elysia backend example
│       │       │   └── shared/        # Shared types
│       │       ├── vite.config.ts
│       │       ├── package.json
│       │       ├── gitignore          # Renamed to .gitignore by CLI
│       │       └── env.example        # Renamed to .env.example by CLI
│       ├── dist/
│       │   ├── index.js
│       │   └── template/              # Bundled template (copied during build)
│       ├── wrapper.js                 # Node.js compatibility shim
│       └── package.json               # v0.4.4
│
├── docs/                         # (Optional) Additional documentation
├── package.json                  # Workspace root config
├── tsconfig.json                 # Shared TypeScript config
├── README.md                     # User-facing documentation
└── GUIDE.md                      # This file
```

### Key Components

**Framework package (`bev-fs`):**
- Exported functions for server and client setup
- Auto-discovery logic for routes
- Configuration loading (YAML, .env)
- Middleware system
- Type utilities

**CLI package (`create-bev-fs`):**
- Project scaffolding command with template selection (base or template edition)
- Template copying with file renaming
- Git repository initialization
- Dependency resolution

**Base Edition (Minimal Starter):**
- Lightweight project foundation
- Essential folder structure
- Simple route examples
- Guides for scaling incrementally

**Template Edition (Feature-Rich Starter):**
- Complete starter project
- Example routes (client and server)
- Type-safe API client
- Logging middleware
- Configuration examples

---

## Technical Implementation

### Server-Side Route Discovery

The `createFrameworkServer` function in `packages/framework/src/server/createServer.ts` implements automatic API route registration:

**Process:**
1. Read `routerDir` configuration (default: `src/server/router/`)
2. Recursively scan directory structure
3. Find all `index.ts` or `index.js` files
4. Convert directory path to route path:
   - `product/` → `/api/product`
   - `product/[id]/` → `/api/product/:id`
   - `product/[id]/progress/` → `/api/product/:id/progress`
5. Import each handler file
6. Register HTTP method exports (`GET`, `POST`, `PATCH`, `DELETE`) as Elysia handlers
7. Apply middleware pipeline to all routes

**Route conversion algorithm:**
```typescript
function convertPathToRoute(filePath: string): string {
  // Strip file extension and 'index' filename
  let routePath = filePath
    .replace(/\.(ts|js|vue)$/, '')
    .replace(/\/index$/, '')
    .replace(/^\.\/router/, '');
  
  // Convert [param] to :param
  routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1');
  
  // Ensure leading slash
  return routePath || '/';
}
```

### Client-Side Route Discovery

The `createFrameworkApp` function in `packages/framework/src/client/createApp.ts` implements automatic page routing:

**Process:**
1. Receive `routeModules` from `import.meta.glob('./router/**/*.vue')`
2. Filter to only `index.vue` files
3. Convert file paths to route paths using shared conversion logic
4. Special handling for `not-found` as 404 catch-all
5. Create Vue Router configuration
6. Return configured app with router

**Vite integration:**
```typescript
// In client main.ts
const routeModules = import.meta.glob<any>("./router/**/*.vue", { eager: true });
const { app } = createFrameworkApp(App, { routeModules });
```

### Configuration Loading

The configuration system supports multiple sources with clear precedence:

**Loading order:**
1. Check for `config.yaml.local` (highest priority)
2. Check for `config.local.yaml`
3. Check for `config.yaml`
4. Check for `.env.local`
5. Check for `.env` (lowest priority)

**Format examples:**

YAML:
```yaml
server:
  port: 3000
  routerDir: src/server/router
  staticDir: dist/client

database:
  host: localhost
  port: 5432
  name: myapp
```

.env:
```bash
SERVER_PORT=3000
SERVER_ROUTER_DIR=src/server/router
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

**Environment injection:**
All config values are flattened and injected into `process.env`:
- `server.port` → `process.env.SERVER_PORT`
- `database.host` → `process.env.DATABASE_HOST`
- Nested structures use underscore separators

### Middleware System

Middleware functions receive the Elysia app instance and can:
- Add hooks with `app.derive()`
- Inject context properties
- Intercept requests/responses
- Add error handling

**Example middleware:**
```typescript
export function createLoggingMiddleware() {
  return (app: Elysia) => {
    app.derive((context) => {
      const timestamp = new Date().toISOString();
      const method = context.request?.method || 'UNKNOWN';
      const pathname = new URL(context.request?.url || '', 'http://localhost').pathname;
      console.log(`[INFO] ${timestamp} - ${method} ${pathname} - ENTER`);
      return {}; // Can return additional context properties
    });
  };
}
```

### Type Sharing Pattern

The `src/shared/api.ts` file contains types used by both client and server:

```typescript
// Type definition
export interface Product {
  id: number;
  name: string;
  price: number;
}

// Namespace for request/response types
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

**Server usage:**
```typescript
import type { ProductAPI } from '../../../shared/api';

export const POST = ({ body }: any): ProductAPI.CreateResponse => {
  const req = body as ProductAPI.CreateRequest;
  // Implementation
};
```

**Client usage:**
```typescript
import type { ProductAPI } from '../shared/api';

async create(data: ProductAPI.CreateRequest): Promise<ProductAPI.CreateResponse> {
  // Implementation
}
```

---

## Package Implementation Details

### Root `package.json`

```json
{
  "name": "bev-fs-monorepo",
  "private": true,
  "version": "1.0.0",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "bootstrap": "bun install",
    "publish": "./scripts/publish.sh",
    "dev": "./scripts/testbed-dev.sh",
    "start": "./scripts/testbed-prod.sh"
  }
}
```

**Key scripts:**
- `bootstrap` — Install all workspace dependencies
- `dev` — Build packages and run testbed in development mode
- `start` — Build packages and run testbed in production mode
- `publish` — Build and publish both packages to npm

---

### Framework Package (`bev-fs`)

**`packages/framework/package.json`:**

```json
{
  "name": "bev-fs",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "files": ["dist"],
  "scripts": {
    "build": "tsc src/index.ts src/**/*.ts --outDir dist --skipLibCheck --esModuleInterop --declaration --declarationMap --module ESNext --moduleResolution node"
  },
  "dependencies": {
    "elysia": "*",
    "@elysiajs/static": "*",
    "vue": "*",
    "vue-router": "*"
  },
  "devDependencies": {
    "typescript": "*",
    "@types/node": "*",
    "@types/bun": "*"
  }
}
```

**Key points:**
- ES module format (`"type": "module"`)
- Only `dist/` directory published to npm
- Peer dependencies on framework packages (Vue, Elysia)
- TypeScript declaration files included

### CLI Package (`create-bev-fs`)

**`packages/cli/package.json`:**

```json
{
  "name": "create-bev-fs",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "create-bev-fs": "wrapper.js"
  },
  "files": ["dist", "wrapper.js"],
  "scripts": {
    "build": "tsc src/index.ts --outDir dist --skipLibCheck --esModuleInterop --declaration --declarationMap --moduleResolution node --module ESNext && cp -r src/base src/template dist/"
  },
  "dependencies": {
    "fs-extra": "*",
    "fast-glob": "*"
  },
  "devDependencies": {
    "typescript": "*",
    "@types/node": "*",
    "@types/fs-extra": "*"
  }
}
```

**Key points:**
- Binary entry point via `wrapper.js` for Node.js compatibility
- Template directory copied during build
- Includes file copying utilities (fs-extra)
- Git initialization on project creation

### Template Package Structure

**`packages/cli/src/template/package.json`:**

```json
{
  "name": "bun-elysia-vue-fs-starter",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev:server": "bun src/server/index.ts",
    "dev:client": "vite",
    "dev": "concurrently \"bun src/server/index.ts\" \"vite\"",
    "build:client": "vite build",
    "build:server": "bun build src/server/index.ts --outdir dist/server --external:bev-fs --target=bun",
    "build": "bun run build:client && bun run build:server"
  },
  "dependencies": {
    "bev-fs": "latest",
    "elysia": "*",
    "@elysiajs/static": "*",
    "vue": "*",
    "vue-router": "*"
  },
  "devDependencies": {
    "vite": "*",
    "@vitejs/plugin-vue": "*",
    "typescript": "*",
    "concurrently": "*"
  }
}
```

**Included examples:**
- Product CRUD with nested progress tracking
- Type-safe API client
- Logging middleware
- Configuration examples (.env, YAML)
- Multiple route examples (list, detail, nested)

---

## Architecture Deep Dive

### Deployment Model

**Single-process, single-port architecture:**

```
┌─────────────────────────────────────┐
│     Elysia Server (Port 3000)       │
├─────────────────────────────────────┤
│  Static File Serving                │
│  ├─ /           → index.html        │
│  ├─ /assets/*   → JS/CSS/images     │
│  └─ /*          → index.html (SPA)  │
├─────────────────────────────────────┤
│  API Routes                         │
│  └─ /api/*      → Handler functions │
└─────────────────────────────────────┘
```

**Development mode:**
```bash
bun run dev
```
- Vite dev server on port 5173 (HMR, fast refresh)
- Elysia API server on port 3000
- API calls proxied from Vite to Elysia

**Production mode:**
```bash
bun run build && bun start
```
- Single Elysia process on port 3000
- Serves pre-built static files from `dist/client/`
- API handlers from `src/server/router/`
- SPA fallback for client-side routing

**Scaling:**
- Run multiple instances behind a load balancer
- Stateless by design (use external DB/cache)
- Environment-specific configuration via YAML/.env

## Core Features

### Directory-Based Routing
- **Server routes:** `src/server/router/` structure defines API endpoints
- **Client routes:** `src/client/router/` structure defines pages
- **Parameter syntax:** `[paramName]` folders become `:paramName` URL segments
- **Auto-discovery:** No manual route registration required
- **Nested routes:** Support for arbitrary nesting levels

### Configuration System
- **Multi-source:** Reads from `.env`, `.env.local`, `config.yaml`, `config.yaml.local`
- **Precedence:** YAML > .env > defaults
- **Auto-injection:** Config values injected into `process.env`
- **Nested structure:** Supports hierarchical configuration with dot notation

### Type Safety
- **Shared types:** Common types in `src/shared/api.ts`
- **End-to-end:** Same TypeScript interfaces used on server and client
- **Auto-completion:** Full IDE support with type hints
- **Compile-time checks:** Catch errors before runtime

### Middleware System
- **Extensible:** Add custom middleware functions
- **Logging:** Built-in request logging middleware
- **Context injection:** Middleware can add to handler context
- **Order control:** Middleware runs in specified array order

## Current Status

✅ **Production-ready features:**
- Full directory-based routing for client and server
- Type-safe API contracts with shared TypeScript types
- Configuration system with YAML and .env support
- Middleware system with logging example
- Single-port deployment architecture
- Hot module replacement in development
- Optimized production builds with Vite
- Published to npm with proper ES modules
- Git initialization in scaffolded projects

🚧 **Future enhancements:**
1. OpenAPI/Swagger documentation generation
2. Database integration examples (Prisma, Drizzle)
3. Authentication middleware examples (JWT, sessions)
4. WebSocket support for real-time features
5. Server-sent events (SSE) for streaming
6. File upload handling utilities
7. Rate limiting middleware
8. GitHub Actions CI templates

---

## Development Workflows

### For End Users (Using Published Packages)

**1. Create a new project:**
```bash
npx create-bev-fs@latest my-app
cd my-app
bun install
```

**2. Start development servers:**
```bash
bun run dev
# Vite on http://localhost:5173
# API on http://localhost:3000
```

**3. Add features:**

Create a new page:
```bash
mkdir -p src/client/router/about
touch src/client/router/about/index.vue
```

Create a new API endpoint:
```bash
mkdir -p src/server/router/users
touch src/server/router/users/index.ts
```

Add shared types:
```typescript
// src/shared/api.ts
export interface User {
  id: number;
  name: string;
  email: string;
}
```

**4. Build for production:**
```bash
bun run build
# Outputs to dist/client/ and dist/server/
```

**5. Deploy:**
```bash
export SERVER_PORT=3000
export NODE_ENV=production
bun src/server/index.ts
```

### For Framework Contributors (This Repo)

**1. Clone and setup:**
```bash
git clone https://github.com/kamil5b/bev-fs
cd bun-fullstack
bun install
```

**2. Quick test with automated script:**
```bash
# Builds both packages, creates testbed, and starts dev server
./testbed.sh
```

The `testbed.sh` script automates the entire workflow:
- Builds framework package
- Builds CLI package
- Creates test project in `/tmp/bun-testbed`
- Links local framework version (not npm version)
- Installs dependencies
- Starts dev servers

**3. Manual build (if needed):**
```bash
cd packages/framework
bun run build

cd ../cli
bun run build
cd ../..
```

**4. Manual test (alternative to testbed.sh):**
```bash
# Create a test project using local CLI
node packages/cli/dist/index.js test-app
cd test-app
bun install
bun run dev
```

**4. Make changes:**
- Framework logic: Edit `packages/framework/src/`
- CLI logic: Edit `packages/cli/src/index.ts`
- Template: Edit `packages/cli/src/template/`

**5. Rebuild after changes:**
```bash
cd packages/framework && bun run build && cd ../..
cd packages/cli && bun run build && cd ../..
```

**6. Publish updates:**
```bash
# Update versions in both package.json files:
# - packages/framework/package.json
# - packages/cli/package.json

# Then use the workspace publish script:
bun run publish
```

This automatically:
1. Builds the framework package
2. Builds the CLI package (including bundled template)
3. Publishes both to npm

---

## Common Development Tasks

### Quick Testing with testbed.sh

The fastest way to test your changes:

```bash
# Make changes to framework or CLI
# Then run:
./testbed.sh
```

This creates a fresh test environment in `/tmp/bun-testbed` with:
- Latest built framework and CLI
- Local framework linked (not from npm)
- All dependencies installed
- Dev servers running

**Note:** The testbed is created in `/tmp/` so it's automatically cleaned up on system restart. Perfect for quick testing without cluttering your workspace.

### Adding a New Framework Feature

1. Implement in `packages/framework/src/`
2. Export from `packages/framework/src/index.ts`
3. Test quickly: `./testbed.sh`
4. Update template to demonstrate usage in `packages/cli/src/template/`
5. Rebuild CLI: `cd packages/cli && bun run build`
6. Test again: `./testbed.sh`
7. Update documentation

### Updating the Template

1. Edit files in `packages/cli/src/template/`
2. Rebuild CLI: `cd packages/cli && bun run build`
3. Test by creating a new project
4. Verify all features work as expected

### Testing Configuration Changes

1. Edit template config files:
   - `packages/cli/src/template/config.yaml.example`
   - `packages/cli/src/template/env.example`
2. Rebuild CLI to copy updated template
3. Create test project and verify config loading

### Debugging Route Discovery

1. Add console.log statements in:
   - `packages/framework/src/server/createServer.ts` (server routes)
   - `packages/framework/src/client/createApp.ts` (client routes)
2. Rebuild framework
3. Check console output when starting servers

---

## Resources

- **npm Packages:**
  - [bev-fs](https://www.npmjs.com/package/bev-fs)
  - [create-bev-fs](https://www.npmjs.com/package/create-bev-fs)

- **Dependencies:**
  - [Elysia](https://elysiajs.com/) — Backend framework
  - [Vue 3](https://vuejs.org/) — Frontend framework
  - [Vite](https://vitejs.dev/) — Build tool
  - [Bun](https://bun.sh/) — JavaScript runtime

- **Documentation:**
  - [Server Guide](./packages/cli/src/template/src/server/SERVER.md)
  - [Client Guide](./packages/cli/src/template/src/client/CLIENT.md)

---

## License

MIT

```
