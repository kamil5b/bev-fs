# bun-elysia-vue-fs — Monolithic Framework Scaffold

This is a complete, production-oriented scaffold for a reusable framework based on Vue + Vite + Bun + Elysia. It includes:

* `packages/framework` — the runtime (server, client, shared helpers)
* `packages/cli` — a small Bun-powered CLI to scaffold new projects and run unified dev/build commands
* `template-default` — the starter monolith template that the CLI copies
* `example` — an example app generated from the template

## Quickstart (local dev)

1. Bootstrap dependencies:

   ```bash
   bun install
   ```

2. Build the framework packages (optional for development):

   ```bash
   bun run --cwd packages/framework build
   bun run --cwd packages/cli build
   ```

3. Scaffold an example project using the CLI:

   ```bash
   bun run --cwd packages/cli build
   node packages/cli/dist/index.js create example-app
   ```

4. Enter the generated app, install, and run dev:

   ```bash
   cd example-app
   bun install
   bun run dev
   ```

## Publish framework runtime

1. Build `packages/framework` and publish to NPM (or a private registry).

2. Users can then `bun add @bun-elysia-vue-fs/runtime` and your CLI will scaffold projects that import it.

## Project Structure

```
bun-elysia-vue-fs-root/
├─ package.json
├─ bunfig.toml
├─ tsconfig.json
├─ README.md
├─ packages/
│  ├─ framework/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ server/
│  │     │  └─ createServer.ts
│  │     ├─ client/
│  │     │  └─ createApp.ts
│  │     └─ shared/
│  │        ├─ createRoute.ts
│  │        └─ types.ts
│  └─ cli/
│     ├─ package.json
│     └─ src/
│        └─ index.ts
└─ template-default/
   ├─ package.json
   ├─ vite.config.ts
   ├─ bunfig.toml
   └─ src/
      ├─ app/
      │  ├─ main.ts
      │  ├─ router.ts
      │  └─ pages/
      │     └─ index.vue
      ├─ server/
      │  ├─ index.ts
      │  └─ api/
      │     └─ users.ts
      ├─ routes/
      │  └─ index.ts
      └─ types/
         └─ User.ts
```

## Notes & next steps

- This scaffold is intentionally pragmatic and minimal. It provides the core pieces you need to iterate.
- Recommended improvements:
  1. Add a typed API client generator using route schemas
  2. Add plugin support to the runtime (middleware, hooks)
  3. Improve CLI `dev` to spawn child processes (vite + server) and proxy HMR
  4. Add tests and CI (GitHub Actions) for packaging and releases
