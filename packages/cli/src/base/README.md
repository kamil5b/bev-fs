# Bun Elysia Vue Full-Stack — Base Edition

A minimal, framework-driven full-stack starter template using **Bun**, **Elysia**, **Vue 3**, and **bev-fs**.

This is the **base edition** — a lightweight starting point with just the essentials that leverages the **bev-fs** framework for automatic routing and project structure.

**Want more?** Check out the **full template edition** which includes:
- Pre-built components (ProductTable, Modal, etc.)
- Complete example app (product management with file uploads)
- Sample pages and composables
- Production-ready patterns

## 🚀 What's Included

- **Backend**: Elysia server with bev-fs framework
- **Frontend**: Vue 3 with automatic route discovery via bev-fs
- **Framework**: bev-fs handles routing, file-based structure, and shared utilities
- **Development**: Hot module replacement for fast iteration
- **TypeScript**: Full end-to-end type safety
- **Minimal**: No pre-built components or example code — just the framework

## 📋 Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- Node.js 18+ (for Vite and dependencies)

## ⚡ Getting Started

### Installation

```bash
bun install
```

### Development

Run both server and client simultaneously:

```bash
bun run dev
```

Or run them separately:

```bash
# Terminal 1: Start the backend (port 3000)
bun run dev:server

# Terminal 2: Start the frontend dev server (port 5173)
bun run dev:client
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
bun run build
```

Generates:
- `dist/client/` — Optimized Vue app
- `dist/server/` — Bundled Elysia server

## 📁 Project Structure

```
src/
├── client/              # Vue 3 frontend (auto-routed by bev-fs)
│   ├── router/          # File-based routing (folder structure = routes)
│   ├── App.vue          # Root component
│   ├── main.ts          # Entry point
│   └── index.html       # HTML template
│
├── server/              # Elysia backend (auto-routed by bev-fs)
│   ├── router/          # File-based routing (folder structure = API routes)
│   ├── middleware.ts    # Custom middleware (empty by default)
│   └── index.ts         # Entry point
│
└── shared/              # Shared types and utilities (empty by default)
    └── index.ts         # Shared exports
```

## 🏗️ How bev-fs Works

### File-Based Routing

Your file structure **automatically becomes your routes**:

**Server routes:**
```
src/server/router/
├── index.ts           → GET/POST /
├── hello/
│   └── index.ts       → GET/POST /hello
└── api/
    └── [id]/
        └── index.ts   → GET/POST /api/:id
```

**Client routes:**
```
src/client/router/
├── index.vue          → /
├── about/
│   └── index.vue      → /about
└── posts/
    └── [id]/
        └── index.vue  → /posts/:id
```

### Framework Utilities

The **bev-fs** framework provides:

- **`createFrameworkApp()`** — Automatically discovers and sets up Vue routes
- **`createFrameworkServer()`** — Automatically discovers and registers Elysia handlers
- **`createRoute()`** — Helper for type-safe API route definitions
- **Route conversion** — Automatic `[id]` → `:id` conversion

## 📖 Creating Your First Route

### Add a Server Endpoint

Create `src/server/router/hello/index.ts`:

```typescript
// GET /hello
export const GET = () => {
  return { 
    message: "Hello, World!" 
  };
};

// POST /hello
export const POST = ({ body }: any) => {
  return { 
    success: true,
    message: "Hello received",
    body 
  };
};
```

The framework automatically discovers this and exposes it at `GET /hello` and `POST /hello`.

### Add a Page

Create `src/client/router/hello/index.vue`:

```vue
<template>
  <div>
    <h1>Hello Page</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const message = ref("Welcome!");
</script>
```

Automatically accessible at `http://localhost:5173/hello`.

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

Edit with your settings:

```env
SERVER_PORT=3000
VITE_API_URL=http://localhost:3000/api
```

### Vite Config

Customize in `vite.config.ts`:
- Port configuration
- Proxy setup for API calls
- Asset optimization

## 📚 Resources

- [bev-fs Framework Guide](./GUIDE.md) — Core framework API and utilities
- [Bun Documentation](https://bun.sh/docs)
- [Elysia Documentation](https://elysiajs.com)
- [Vue 3 Documentation](https://vuejs.org)
- [Vue Router Documentation](https://router.vuejs.org)

## 🎯 Next Steps

1. **Understand the framework**: Read [GUIDE.md](./GUIDE.md) for detailed API documentation
2. **Add your first route**: Create `src/server/router/hello/index.ts`
3. **Build a page**: Create `src/client/router/hello/index.vue`
4. **Scale up**: Need more features? Refer to the full template edition for examples
5. **Deploy**: Use `bun run build` and deploy the `dist/` folder

## 💡 Tips

- Keep your file structure flat initially, then organize as your app grows
- Use TypeScript for better IDE support and type safety
- Check the full template edition in the repository for examples of:
  - Component patterns
  - Composable organization
  - Service/repository patterns
  - Complete CRUD operations

## 📄 License

MIT
