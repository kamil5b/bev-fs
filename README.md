# bev-fs — Monolithic Vue + Elysia Fullstack Framework

A complete, production-ready scaffold for a reusable fullstack framework with single-host, single-port deployment. Built with Vue 3, Vite, Bun, and Elysia.

**Published packages:**
- [`bev-fs`](https://www.npmjs.com/package/bev-fs) — runtime framework (v0.2.1+)
- [`create-bev-fs`](https://www.npmjs.com/package/create-bev-fs) — CLI scaffolding tool (v0.3.10+)

**Key components:**
* `packages/framework` — server/client/shared runtime APIs
* `packages/cli` — CLI for project scaffolding  
* `template-default` — starter template (bundled into CLI)
* Single Elysia process serves frontend + API on port 3000
* File-based routing with bracket notation: `[paramName].ts` → `:paramName`
* Nested routing support: `product.[productId]/progress.[progressId].ts`
* Shared data store for persistence across handlers
* Middleware support with built-in logging

## Quickstart

### Use the published CLI (recommended)

```bash
npx create-bev-fs@latest my-project
cd my-project
bun install
bun run dev
```

Then open http://localhost:5173 (Vite dev) or http://localhost:3000 (server with built assets).

### Local development (from this repo)

1. Bootstrap dependencies:

   ```bash
   bun install
   ```

2. Build both packages:

   ```bash
   cd packages/framework && bun run build
   cd ../cli && bun run build
   cd ../..
   ```

3. Scaffold a project from local CLI:

   ```bash
   node packages/cli/dist/index.js create my-project
   cd my-project
   bun install
   bun run dev
   ```

4. The CLI automatically:
   - Copies the template to your new project
   - Renames dotfiles (.gitignore, bunfig.toml)
   - Initializes a git repository

## Publish framework runtime

1. Build `packages/framework` and publish to NPM (or a private registry).

2. Users can then `bun add @bun-elysia-vue-fs/runtime` and your CLI will scaffold projects that import it.

## Project Architecture

**Single-host, single-port deployment:**
- Elysia server on **port 3000** (configurable via `PORT` env var)
- Serves static Vue app + API routes from the same process
- Auto-discovers API handlers from `src/server/api/`
- File-based routing with bracket notation for parameters
- Nested routing: `api/product.[productId]/progress.[progressId].ts` → `/api/product/:productId/progress/:progressId`
- SPA fallback: unknown routes return `index.html` for Vue Router client-side routing
- Shared data store: `src/server/store.ts` maintains state across all handlers
- Middleware support: pass custom middleware functions to framework

**Development mode:** `bun run dev` runs Vite (port 5173) + Elysia (port 3000) concurrently  
**Production mode:** `bun run build && bun start` → single Bun process on port 3000

## Features

✅ **File-based API routing** — automatically register handlers from files  
✅ **Nested endpoints** — organize related APIs in subdirectories  
✅ **Shared store pattern** — persistent data across requests  
✅ **DELETE method support** — via `delete_handler` export (JavaScript keyword workaround)  
✅ **Middleware system** — extensible with custom logging, auth, etc.  
✅ **Built-in logging** — request/response lifecycle tracking with timestamps  
✅ **TypeScript ready** — full type safety from server to client  
✅ **Single deployment** — no microservices complexity  

## Documentation

- [**Client Guide**](./docs/CLIENT.md) — Vue components, routing, API client
- [**Server Guide**](./docs/SERVER.md) — API handlers, store pattern, middleware

## Publishing Updates

To update published packages:

```bash
# Update framework
cd packages/framework
bun run build
bun publish

# Update CLI (includes bundled template)
cd ../cli
bun run build
bun publish
```
