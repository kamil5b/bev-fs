# Bun Elysia Vue Full-Stack Starter

A modern, type-safe full-stack web application starter template using **Bun**, **Elysia**, and **Vue 3**.

## 🚀 What's Included

- **Backend**: Elysia server with directory-based routing and clean architecture
- **Frontend**: Vue 3 with Composition API and file-based routing
- **Shared Types**: TypeScript entities and types shared between client and server
- **Development**: Hot module replacement, concurrent dev server for both client and server
- **Build**: Optimized production builds for both frontend and backend

## 📋 Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- Node.js 18+ (for Vite and dependencies)

## ⚡ Getting Started

### Installation

```bash
npm install
# or
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

This generates:
- `dist/client/` — Optimized Vue app
- `dist/server/` — Bundled Elysia server

## 📁 Project Structure

```
├── src/
│   ├── client/           # Vue 3 frontend
│   │   ├── pages/        # Page components (file-based routing)
│   │   ├── components/   # Reusable UI components
│   │   ├── composables/  # Composable functions (API calls, etc.)
│   │   ├── router/       # Routing configuration
│   │   ├── App.vue       # Root component
│   │   ├── main.ts       # Client entry point
│   │   └── index.html    # HTML template
│   │
│   ├── server/           # Elysia backend with clean architecture
│   │   ├── router/       # File-based routing (defines API structure)
│   │   ├── handler/      # HTTP request handlers
│   │   ├── service/      # Business logic
│   │   ├── repository/   # Data access layer
│   │   ├── db/           # Data persistence
│   │   ├── middleware.ts # Custom middleware
│   │   └── index.ts      # Server entry point
│   │
│   └── shared/           # Type definitions used by both client and server
│       ├── entities/     # Data models
│       ├── enums/        # Enumerations
│       ├── requests/     # Request DTOs
│       └── responses/    # Response DTOs
│
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── bunfig.toml           # Bun configuration
└── env.example           # Environment variables template
```

## 🏗️ Architecture

This template follows **clean architecture** principles:

### Server Flow
```
Request
  ↓
Router (src/server/router/) — Maps URL to handler
  ↓
Handler (src/server/handler/) — Entry point for business logic
  ↓
Service (src/server/service/) — Core business logic
  ↓
Repository (src/server/repository/) — Data access abstraction
  ↓
Store (src/server/db/) — In-memory data storage
  ↓
Response
```

### Key Features

- **Directory-based routing** — Your folder structure in `src/server/router/` IS your API
- **Type-safe endpoints** — Full TypeScript support from request to response
- **Middleware support** — Add logging, authentication, CORS, etc.
- **Shared types** — Client and server share the same TypeScript types

### Client Flow
```
User Interaction
  ↓
Vue Component
  ↓
Composable (useProductAPI)
  ↓
Type-safe API call
  ↓
Display result
```

## 📚 Learning Guides

For detailed guidance on building features:

- **[Server Guide](./src/server/SERVER.md)** — Learn how to build API endpoints with clean architecture
- **[Client Guide](./src/client/CLIENT.md)** — Learn how to build Vue 3 components and pages

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env.local` and update values:

```bash
cp env.example .env.local
```

### Vite Config

Customize frontend build settings in `vite.config.ts`:
- Port configuration
- Asset optimization
- Plugin configuration

### Bun Config

Configure Bun runtime in `bunfig.toml`:
- Module resolution
- Development server settings
- Build optimization

## 🎯 Common Tasks

### Add a New API Endpoint

1. Create route file in `src/server/router/[resource]/index.ts`
2. Create handler in `src/server/handler/[resource].handler.ts`
3. Create service in `src/server/service/[resource].service.ts`
4. Create repository in `src/server/repository/[resource].repository.ts`
5. Add shared types in `src/shared/` (entities, requests, responses)

### Add a New Page

1. Create component in `src/client/pages/[PageName].vue`
2. Create route file in `src/client/router/[route]/index.vue` that imports the page
3. Add navigation links in your components

### Add Reusable Component

1. Create component in `src/client/components/[ComponentName].vue`
2. Import and use in pages or other components

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Run server and client concurrently |
| `bun run dev:server` | Run backend only |
| `bun run dev:client` | Run frontend dev server only |
| `bun run build` | Build for production |
| `bun run build:client` | Build frontend only |
| `bun run build:server` | Build backend only |

## 🤝 Contributing

This template is designed to be easily extended. Feel free to:
- Add more routes and pages
- Customize components and styling
- Implement additional middleware
- Add new services and repositories

## 📖 Resources

- [Bun Documentation](https://bun.sh/docs)
- [Elysia Documentation](https://elysiajs.com)
- [Vue 3 Documentation](https://vuejs.org)
- [Vue Router Documentation](https://router.vuejs.org)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

## 📄 License

MIT
