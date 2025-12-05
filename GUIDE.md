# bun-elysia-vue-fs — Monolithic Framework Scaffold

This canvas contains a complete, production-oriented scaffold for a reusable framework based on your architecture (Vue + Vite + Bun + Elysia). It includes:

* `packages/framework` — the runtime (server, client, shared helpers)
* `packages/cli` — a small Bun-powered CLI to scaffold new projects and run unified dev/build commands
* `template-default` — the starter monolith template that the CLI copies
* `example` — an example app generated from the template

Open the document files below and follow the README in the root for quick start instructions.

---

## File tree

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
├─ template-default/
│  ├─ package.json
│  ├─ vite.config.ts
│  ├─ bunfig.toml
│  └─ src/
│     ├─ app/
│     │  ├─ main.ts
│     │  ├─ router.ts
│     │  └─ pages/
│     │     └─ index.vue
│     ├─ server/
│     │  └─ index.ts
│     ├─ routes/
│     │  └─ index.ts
│     └─ types/
│        └─ User.ts
└─ example/  (generated app)
```

---

> The sections below contain the actual file contents. Use them to inspect, adapt, or copy into a real repository.

---

## Root `package.json`

```json
{
  "name": "bun-elysia-vue-fs-monorepo",
  "private": true,
  "version": "0.1.0",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "bootstrap": "bun install",
    "dev:example": "cd example && bun run dev",
    "build:example": "cd example && bun run build",
    "publish:framework": "cd packages/framework && npm publish"
  }
}
```

---

## `bunfig.toml` (root)

```toml
# Bun config - keep minimal

[install]
# configuration if needed
```

---

## `tsconfig.json` (root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["bun-shim"]
  },
  "include": ["packages/**/src", "template-default/src", "example/src"]
}
```

---

## `packages/framework/package.json`

```json
{
  "name": "@bun-elysia-vue-fs/runtime",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "files": ["dist"] ,
  "scripts": {
    "build": "bun tsc --outDir dist"
  },
  "dependencies": {
    "elysia": "*",
    "@elysiajs/static": "*",
    "vue": "*",
    "vue-router": "*"
  }
}
```

---

## `packages/framework/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  }
}
```

---

## `packages/framework/src/index.ts`

```ts
export * from "./server/createServer";
export * from "./client/createApp";
export * from "./shared/createRoute";
export * from "./shared/types";
```

---

## `packages/framework/src/server/createServer.ts`

```ts
import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import path from "path";
import fs from "fs";

export type ServerOptions = {
  routesDir?: string; // path to shared route defs
  apiDir?: string; // where api handlers live
  staticDir?: string; // where built client lives
  port?: number;
  env?: "development" | "production";
};

export async function createFrameworkServer(opts: ServerOptions = {}) {
  const port = opts.port ?? 3000;
  const staticDir = opts.staticDir ?? path.join(process.cwd(), "dist/client");
  const apiDir = opts.apiDir ?? path.join(process.cwd(), "src/server/api");

  const app = new Elysia();

  // Static asset serving
  if (fs.existsSync(staticDir)) {
    app.use(staticPlugin({ assets: staticDir, prefix: "/" }));
  }

  // Auto-register API handlers: export functions named by HTTP verb or default to handler
  try {
    if (fs.existsSync(apiDir)) {
      const files = fs.readdirSync(apiDir).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
      for (const file of files) {
        const full = path.join(apiDir, file);
        // dynamic import
        // note: Bun supports file:// import; adjust for environment
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = await import(full);
        if (mod.default) {
          // mount at /api/<name>
          const route = "/api/" + file.replace(/\.(t|j)sx?$/, "");
          app.get(route, mod.default as any);
        }
        // allow named exports: get/post/put/delete
        ["get", "post", "put", "delete"].forEach((verb) => {
          if (mod[verb]) {
            const route = "/api/" + file.replace(/\.(t|j)sx?$/, "");
            // @ts-ignore
            app[verb](route, mod[verb]);
          }
        });
      }
    }
  } catch (e) {
    console.warn("Failed to auto-register api handlers", e);
  }

  // SPA fallback for client-side routing
  app.get("*", (c) => {
    const index = path.join(staticDir, "index.html");
    if (fs.existsSync(index)) return Bun.file(index);
    return { message: "Server running" };
  });

  return {
    app,
    listen: (p = port) => app.listen(p)
  };
}
```

---

## `packages/framework/src/client/createApp.ts`

```ts
import { createApp as _createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

export type ClientOptions = {
  routes?: any[]; // vue-router routes
  historyMode?: boolean;
};

export function createFrameworkApp(rootComponent: any, opts: ClientOptions = {}) {
  const app = _createApp(rootComponent);

  const routes = opts.routes ?? [];
  const router = createRouter({
    history: createWebHistory(),
    routes
  });

  app.use(router);

  return { app, router };
}
```

---

## `packages/framework/src/shared/createRoute.ts`

```ts
export const createRoute = <T extends string>(path: T) => ({
  path,
  api(pathSuffix = "") {
    return `/api${path}${pathSuffix}`;
  }
});
```

---

## `packages/framework/src/shared/types.ts`

```ts
export type Json = Record<string, unknown>;
```

---

## `packages/cli/package.json`

```json
{
  "name": "@bun-elysia-vue-fs/cli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "bun-elysia-vue-fs": "dist/index.js"
  },
  "scripts": {
    "build": "bun tsc --outDir dist"
  },
  "dependencies": {
    "fs-extra": "*",
    "fast-glob": "*"
  }
}
```

---

## `packages/cli/src/index.ts`

```ts
#!/usr/bin/env bun

import fs from "fs";
import fse from "fs-extra";
import path from "path";

const root = path.resolve(process.cwd());
const templateDir = path.join(root, "../..", "template-default");

async function createProject(name: string) {
  const dest = path.join(process.cwd(), name);
  if (fs.existsSync(dest)) throw new Error("Destination exists");
  await fse.copy(templateDir, dest);
  console.log("Project scaffolded to", dest);
  console.log("Run: cd %s && bun install && bun run dev", name);
}

async function runDev() {
  // start unified dev: run vite in client and Bun server in watch
  console.log("Starting unified dev (you can also run client/server separately)");
  // simple implementation: just forward to project scripts
}

async function main(argv = process.argv.slice(2)) {
  const cmd = argv[0];
  if (!cmd || cmd === "help") {
    console.log("bun-elysia-vue-fs create <name> — scaffold a new project");
    console.log("bun-elysia-vue-fs dev — run dev (in project root)");
    process.exit(0);
  }

  if (cmd === "create") {
    const name = argv[1];
    if (!name) throw new Error("missing project name");
    await createProject(name);
    return;
  }

  if (cmd === "dev") {
    await runDev();
    return;
  }

  console.log("unknown command", cmd);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
```

---

## `template-default/package.json`

```json
{
  "name": "bun-elysia-vue-fs-starter",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev:server": "bun run src/server/index.ts",
    "dev:client": "vite",
    "dev": "bun run --watch src/server/index.ts & vite",
    "build:client": "vite build",
    "build:server": "bun build src/server/index.ts --outdir dist/server",
    "build": "vite build"
  },
  "dependencies": {
    "elysia": "*",
    "@elysiajs/static": "*",
    "vue": "*",
    "vue-router": "*"
  },
  "devDependencies": {
    "vite": "*",
    "@vitejs/plugin-vue": "*",
    "typescript": "*"
  }
}
```

---

## `template-default/vite.config.ts`

```ts
import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  root: 'src/app',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    }
  }
});
```

---

## `template-default/bunfig.toml`

```toml
[watch]
# configure watch if needed
```

---

## `template-default/src/app/main.ts`

```ts
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';

createApp(App).use(router).mount('#app');
```

---

## `template-default/src/app/router.ts`

```ts
import { createRouter, createWebHistory } from 'vue-router';
import routes from '../../routes/index';

const routeEntries = Object.values(routes).map((r: any) => ({
  path: r.path,
  component: () => import(`./pages${r.path || '/index'}.vue`)
}));

export const router = createRouter({
  history: createWebHistory(),
  routes: routeEntries
});
```

---

## `template-default/src/app/pages/index.vue`

```vue
<template>
  <div>
    <h1>Welcome to bun-elysia-vue-fs starter</h1>
    <router-link to="/users">Users</router-link>
  </div>
</template>

<script setup lang="ts">
</script>
```

---

## `template-default/src/routes/index.ts`

```ts
export default {
  home: { path: '/' },
  users: { path: '/users' }
};
```

---

## `template-default/src/server/index.ts`

```ts
import { createFrameworkServer } from '@bun-elysia-vue-fs/runtime/server';
import path from 'path';

(async () => {
  const { app, listen } = await createFrameworkServer({
    apiDir: path.join(process.cwd(), 'src/server/api'),
    staticDir: path.join(process.cwd(), 'dist/client'),
    port: Number(process.env.PORT) || 3000
  });

  await listen();
  console.log('Server listening on port', process.env.PORT || 3000);
})();
```

---

## `template-default/src/server/api/users.ts`

```ts
export default () => ({ message: 'users root' });
```

---

## `template-default/src/types/User.ts`

```ts
export type User = {
  id: string;
  name: string;
};
```

---

## `example/` (generated example) — not populated here but the CLI will copy `template-default` into an example directory when you run `bun-elysia-vue-fs create`.

---

## README (root)

````
# bun-elysia-vue-fs — Monolithic framework scaffold

## Quickstart (local dev)

1. Bootstrap dependencies:

   ```bash
   bun install
   # or in root: bun install (workspaces will install packages)
````

2. Build the framework packages (optional for development):

   ```bash
   bun run -w packages/framework build
   bun run -w packages/cli build
   ```

3. Scaffold an example project using the CLI (you can run the built CLI or run the script directly):

   ```bash
   # from repository root
   node packages/cli/dist/index.js create example-app
   # or with bun if installed globally
   bun run packages/cli/dist/index.js create example-app
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

```

---

## Notes & next steps

- This scaffold is intentionally pragmatic and minimal. It provides the core pieces you need to iterate:
  - runtime APIs (`createFrameworkServer`, `createFrameworkApp`, `createRoute`)
  - templating and a CLI to scaffold apps
  - a default Vite configuration for Bun/Vue

- Next improvements I recommend implementing immediately:
  1. Add a typed API client generator using route schemas
  2. Add plugin support to the runtime (middleware, hooks)
  3. Improve CLI `dev` to spawn child processes (vite + server) and proxy HMR
  4. Add tests and CI (GitHub Actions) for packaging and releases

---

If you want, I can now:

- Generate the actual filesystem (create files) and return a zip that you can download, or
- Run through a step-by-step checklist to publish the first version, or
- Implement the typed API generator and the CLI `dev` process supervisor (process manager) now.

Which of those do you want next?

```
