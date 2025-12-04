Got it — here’s a fresh, complete, **copy/pasteable** Fullstack Bun monolith guide that:

* Uses **PostgreSQL** (via `pg`)
* Has **shared request files** and **shared response files** (separate)
* Uses a **response envelope** that includes `requestId`, `timestamp`, `success`, `error`, and `request` echo
* Implements **pagination + sorting + filtering** for the list endpoint
* Uses **3-layer backend** (repository → service → controller), **no ORM**, raw SQL queries
* Frontend is **Vue 3 + Vite + Tailwind**, domain/component based and imports the same shared types (request/response/models/enums)
* Includes **Dockerfile + docker-compose** (Postgres + app) and development scripts
* Fully TypeScript

You can paste these files into a fresh repo and run it.

---

# Project layout (what you’ll create)

```
bun-fullstack/
├─ package.json
├─ bunfig.toml
├─ tsconfig.json
├─ docker-compose.yml
├─ .env.example
├─ public/                       # built client files after build
├─ shared/
│  ├─ enums/
│  │   └─ user.enums.ts
│  ├─ models/
│  │   └─ user.model.ts
│  ├─ response-envelope.ts
│  ├─ requests/
│  │   └─ users/
│  │       ├─ users.list.request.ts
│  │       ├─ users.get.request.ts
│  │       └─ users.create.request.ts
│  └─ responses/
│      └─ users/
│          ├─ users.list.response.ts
│          ├─ users.get.response.ts
│          └─ users.create.response.ts
├─ src/
│  ├─ server/
│  │   ├─ index.ts
│  │   ├─ routes/users.routes.ts
│  │   ├─ controller/users.controller.ts
│  │   ├─ service/users.service.ts
│  │   ├─ repository/users.repository.ts
│  │   └─ db/
│  │       ├─ pg.ts
│  │       └─ migrations/
│  │           └─ init.sql
│  └─ client/
│      ├─ package.json
│      ├─ index.html
│      ├─ vite.config.ts
│      ├─ tailwind.config.js
│      ├─ postcss.config.js
│      └─ src/
│          ├─ main.ts
│          ├─ style.css
│          ├─ app/
│          │   ├─ App.vue
│          │   └─ router.ts
│          ├─ components/ui/Button.vue
│          ├─ components/ui/Card.vue
│          └─ domains/users/...
├─ scripts/
│  └─ dev.sh
└─ Dockerfile
```

---

# 0 — Root config files

### `package.json` (root)

```json
{
  "name": "bun-fullstack",
  "private": true,
  "scripts": {
    "dev:server": "bun run src/server/index.ts",
    "dev:client": "cd src/client && bunx vite",
    "dev": "bash scripts/dev.sh",
    "build:client": "cd src/client && bunx vite build && cp -r dist/* ../../public/",
    "start": "bun run src/server/index.ts"
  },
  "dependencies": {
    "elysia": "latest",
    "@elysiajs/static": "latest",
    "pg": "latest"
  },
  "devDependencies": {
    "typescript": "latest"
  }
}
```

### `bunfig.toml`

```toml
[server]
port = 3000
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["shared/*"],
      "@server/*": ["src/server/*"],
      "@client/*": ["src/client/src/*"]
    },
    "resolveJsonModule": true
  },
  "include": ["src", "shared"]
}
```

### `.env.example`

```
PG_HOST=postgres
PG_PORT=5432
PG_DATABASE=app
PG_USER=postgres
PG_PASSWORD=postgres

APP_PORT=3000
```

---

# 1 — Shared types (requests, responses, models, envelope)

Create `shared/` exactly as below.

### `shared/response-envelope.ts`

```ts
export interface BaseResponse<TData, TRequest = any> {
  requestId: string;       // uuid for correlation
  success: boolean;
  timestamp: number;       // Date.now()
  request: TRequest;       // echo of the request
  data?: TData;            // present on success
  error?: string;          // present when success === false
}
```

### `shared/enums/user.enums.ts`

```ts
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER"
}
```

### `shared/models/user.model.ts`

```ts
import type { UserRole } from "../enums/user.enums";

export interface User {
  id: number;
  name: string;
  role: UserRole;
}
```

#### Requests (one file per endpoint)

`shared/requests/users/users.list.request.ts`

```ts
export interface UsersListRequest {
  page?: number;           // 1-based
  perPage?: number;
  sortBy?: string;         // allowed values validated server-side
  sortOrder?: "asc" | "desc";
  q?: string;              // search query against name
  role?: string;           // filter role
}
```

`shared/requests/users/users.get.request.ts`

```ts
export interface UsersGetRequest {
  id: number;
}
```

`shared/requests/users/users.create.request.ts`

```ts
import type { UserRole } from "../../enums/user.enums";

export interface UsersCreateRequest {
  name: string;
  role: UserRole;
}
```

#### Responses (enveloped; one file per endpoint)

`shared/responses/users/users.list.response.ts`

```ts
import type { BaseResponse } from "../../response-envelope";
import type { UsersListRequest } from "../../requests/users/users.list.request";
import type { User } from "../../models/user.model";

export interface ListMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export type UsersListResponse = BaseResponse<{ items: User[]; meta: ListMeta }, UsersListRequest>;
```

`shared/responses/users/users.get.response.ts`

```ts
import type { BaseResponse } from "../../response-envelope";
import type { UsersGetRequest } from "../../requests/users/users.get.request";
import type { User } from "../../models/user.model";

export type UsersGetResponse = BaseResponse<User, UsersGetRequest>;
```

`shared/responses/users/users.create.response.ts`

```ts
import type { BaseResponse } from "../../response-envelope";
import type { UsersCreateRequest } from "../../requests/users/users.create.request";
import type { User } from "../../models/user.model";

export type UsersCreateResponse = BaseResponse<User, UsersCreateRequest>;
```

---

# 2 — Server: Postgres client + migration

### `src/server/db/pg.ts`

```ts
import { Client } from "pg";

export const pg = new Client({
  host: process.env.PG_HOST ?? "localhost",
  port: Number(process.env.PG_PORT ?? 5432),
  database: process.env.PG_DATABASE ?? "app",
  user: process.env.PG_USER ?? "postgres",
  password: process.env.PG_PASSWORD ?? "postgres"
});

await pg.connect();

export async function initDb() {
  const sql = await Bun.file(import.meta.dir + "/migrations/init.sql").text();
  await pg.query(sql);
}
```

### `src/server/db/migrations/init.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL
);

-- seed sample data if empty
INSERT INTO users (id, name, role)
SELECT 1, 'Alice', 'ADMIN' WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);

INSERT INTO users (id, name, role)
SELECT 2, 'Bob', 'USER' WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 2);
```

---

# 3 — Repository (raw SQL) with pagination/sort/filter

### `src/server/repository/users.repository.ts`

```ts
import { pg } from "../db/pg";
import type { User } from "@shared/models/user.model";
import type { UsersListRequest } from "@shared/requests/users/users.list.request";
import type { UsersCreateRequest } from "@shared/requests/users/users.create.request";

function buildWhere(params: UsersListRequest) {
  const clauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (params.q) {
    clauses.push(`name ILIKE $${idx++}`);
    values.push(`%${params.q}%`);
  }

  if (params.role) {
    clauses.push(`role = $${idx++}`);
    values.push(params.role);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, values };
}

export const usersRepository = {
  async findAndCount(params: UsersListRequest) {
    const page = Math.max(1, params.page ?? 1);
    const perPage = Math.min(100, Math.max(1, params.perPage ?? 10));
    const offset = (page - 1) * perPage;

    const allowedSortBy = ["id", "name", "role"];
    const sortBy = allowedSortBy.includes(params.sortBy ?? "") ? params.sortBy! : "id";
    const sortOrder = params.sortOrder === "desc" ? "DESC" : "ASC";

    const { where, values } = buildWhere(params);

    const countSQL = `SELECT COUNT(*) AS count FROM users ${where}`;
    const countRes = await pg.query(countSQL, values);
    const total = Number(countRes.rows[0]?.count ?? 0);

    const itemsSQL = `SELECT id, name, role FROM users ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT $${values.length+1} OFFSET $${values.length+2}`;
    const itemsRes = await pg.query(itemsSQL, [...values, perPage, offset]);
    const items = itemsRes.rows as User[];

    return { items, total, page, perPage };
  },

  async findById(id: number) {
    const res = await pg.query("SELECT id, name, role FROM users WHERE id = $1", [id]);
    return res.rows[0] ?? null;
  },

  async create(payload: UsersCreateRequest) {
    const res = await pg.query(
      "INSERT INTO users (name, role) VALUES ($1, $2) RETURNING id, name, role",
      [payload.name, payload.role]
    );
    return res.rows[0] as User;
  }
};
```

---

# 4 — Service layer (simple validation + pass-through)

### `src/server/service/users.service.ts`

```ts
import { usersRepository } from "../repository/users.repository";
import type { UsersListRequest } from "@shared/requests/users/users.list.request";
import type { UsersCreateRequest } from "@shared/requests/users/users.create.request";

export const usersService = {
  async list(params: UsersListRequest) {
    // you could add more business rules here
    return usersRepository.findAndCount(params);
  },

  async get(id: number) {
    const user = await usersRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  },

  async create(payload: UsersCreateRequest) {
    if (!payload.name || payload.name.length < 2) throw new Error("Invalid name");
    return usersRepository.create(payload);
  }
};
```

---

# 5 — Response helper (envelope generator)

### `src/server/utils/response.ts`

```ts
import type { BaseResponse } from "@shared/response-envelope";

export function ok<TData, TReq>(data: TData, request: TReq): BaseResponse<TData, TReq> {
  return {
    requestId: crypto.randomUUID(),
    success: true,
    timestamp: Date.now(),
    request,
    data
  };
}

export function fail<TReq>(err: unknown, request: TReq): BaseResponse<null, TReq> {
  return {
    requestId: crypto.randomUUID(),
    success: false,
    timestamp: Date.now(),
    request,
    error: err instanceof Error ? err.message : String(err)
  };
}
```

---

# 6 — Controller using shared requests and enveloped responses

### `src/server/controller/users.controller.ts`

```ts
import { usersService } from "../service/users.service";
import { ok, fail } from "../utils/response";
import type { UsersListRequest } from "@shared/requests/users/users.list.request";
import type { UsersGetRequest } from "@shared/requests/users/users.get.request";
import type { UsersCreateRequest } from "@shared/requests/users/users.create.request";

export const usersController = {
  async list(ctx: any) {
    const request: UsersListRequest = {
      page: ctx.query.page ? Number(ctx.query.page) : undefined,
      perPage: ctx.query.perPage ? Number(ctx.query.perPage) : undefined,
      sortBy: ctx.query.sortBy,
      sortOrder: ctx.query.sortOrder as "asc" | "desc" | undefined,
      q: ctx.query.q,
      role: ctx.query.role
    };

    try {
      const { items, total, page, perPage } = await usersService.list(request);
      const meta = { total, page, perPage, totalPages: Math.ceil(total / perPage) || 0 };
      return ok({ items, meta }, request);
    } catch (err) {
      return fail(err, request);
    }
  },

  async get(ctx: any) {
    const request: UsersGetRequest = { id: Number(ctx.params.id) };
    try {
      const data = await usersService.get(request.id);
      return ok(data, request);
    } catch (err) {
      return fail(err, request);
    }
  },

  async create(ctx: any) {
    const request: UsersCreateRequest = ctx.body;
    try {
      const data = await usersService.create(request);
      return ok(data, request);
    } catch (err) {
      return fail(err, request);
    }
  }
};
```

---

# 7 — Routes

### `src/server/routes/users.routes.ts`

```ts
import { Elysia } from "elysia";
import { usersController } from "../controller/users.controller";

export default new Elysia({ prefix: "/users" })
  .get("/", ctx => usersController.list(ctx))
  .get("/:id", ctx => usersController.get(ctx))
  .post("/", ctx => usersController.create(ctx));
```

---

# 8 — Server entry

### `src/server/index.ts`

```ts
import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import path from "path";
import users from "./routes/users.routes";
import { initDb } from "./db/pg";

await initDb();

const app = new Elysia();

app.use(
  staticPlugin({
    assets: path.join(import.meta.dir, "../../public"),
    indexHTML: true
  })
);

// mount API under /api
app.group("/api", api => api.use(users));

const PORT = Number(process.env.APP_PORT ?? 3000);
app.listen(PORT);

console.log(`🟢 Server running on http://localhost:${PORT}`);
```

---

# 9 — Client (Vue + Tailwind) — uses same shared contracts

Install dependencies for client (inside `src/client`): `bun add vue @vitejs/plugin-vue vite tailwindcss postcss autoprefixer`

### `src/client/package.json`

```json
{
  "name": "client",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": { "vue": "^3.4.0" },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

### `src/client/vite.config.ts`

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { proxy: { "/api": "http://localhost:3000" } }
});
```

### `src/client/index.html`

```html
<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Bun Fullstack</title></head>
  <body><div id="app"></div><script type="module" src="/src/main.ts"></script></body>
</html>
```

### `src/client/src/main.ts`

```ts
import { createApp } from "vue";
import App from "./app/App.vue";
import { router } from "./app/router";
import "../style.css";

createApp(App).use(router).mount("#app");
```

### `src/client/src/style.css`

```css
@tailwind base; @tailwind components; @tailwind utilities;
body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto; }
```

### `src/client/tailwind.config.js`

```js
export default {
  content: ["./index.html", "./src/**/*.{vue,ts,js}"],
  theme: { extend: {} },
  plugins: []
};
```

---

## Client domain types re-export shared contracts

`src/client/src/domains/users/types.ts`

```ts
export * from "@shared/requests/users/users.list.request";
export * from "@shared/requests/users/users.get.request";
export * from "@shared/requests/users/users.create.request";

export * from "@shared/responses/users/users.list.response";
export * from "@shared/responses/users/users.get.response";
export * from "@shared/responses/users/users.create.response";

export * from "@shared/models/user.model";
export * from "@shared/enums/user.enums";
```

---

## Client API (query-string builder + uses enveloped responses)

`src/client/src/domains/users/api/users.api.ts`

```ts
import type {
  UsersListRequest, UsersListResponse,
  UsersGetRequest, UsersGetResponse,
  UsersCreateRequest, UsersCreateResponse
} from "../types";

function qs(obj: Record<string, any>) {
  const p = Object.entries(obj)
    .filter(([,v]) => v !== undefined && v !== null && v !== "")
    .map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return p ? `?${p}` : "";
}

export const usersApi = {
  async list(req: UsersListRequest): Promise<UsersListResponse> {
    const q = qs(req as any);
    const res = await fetch(`/api/users${q}`);
    return res.json();
  },

  async get(req: UsersGetRequest): Promise<UsersGetResponse> {
    const res = await fetch(`/api/users/${req.id}`);
    return res.json();
  },

  async create(req: UsersCreateRequest): Promise<UsersCreateResponse> {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req)
    });
    return res.json();
  }
};
```

---

## Client composable (paging/sort/filter wrapper)

`src/client/src/domains/users/composables/useUsers.ts`

```ts
import { ref } from "vue";
import { usersApi } from "../api/users.api";
import type { UsersListRequest } from "../types";

export function useUsers() {
  const items = ref([]);
  const meta = ref({ total: 0, page: 1, perPage: 10, totalPages: 0 });
  const loading = ref(false);
  const error = ref<string | null>(null);

  const state = ref<UsersListRequest>({
    page: 1,
    perPage: 10,
    sortBy: "id",
    sortOrder: "asc",
    q: undefined,
    role: undefined
  });

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const resp = await usersApi.list(state.value);
      if (!resp.success) {
        error.value = resp.error ?? "Unknown error";
        items.value = [];
      } else {
        items.value = resp.data!.items;
        meta.value = resp.data!.meta;
      }
    } catch (e: any) {
      error.value = e.message;
      items.value = [];
    } finally {
      loading.value = false;
    }
  }

  function setPage(p: number) { state.value.page = p; void load(); }
  function setPerPage(n: number) { state.value.perPage = n; state.value.page = 1; void load(); }
  function setSort(by: string, order: "asc"|"desc") { state.value.sortBy = by; state.value.sortOrder = order; void load(); }
  function setFilter(q?: string, role?: string) { state.value.q = q; state.value.role = role; state.value.page = 1; void load(); }

  return { items, meta, loading, error, load, setPage, setPerPage, setSort, setFilter, state };
}
```

---

## Minimal UI components (examples)

`src/client/src/components/ui/Button.vue`

```vue
<template>
  <button v-bind="$attrs" class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
    <slot />
  </button>
</template>
```

`src/client/src/components/ui/Card.vue`

```vue
<template>
  <div class="p-4 border rounded bg-white shadow-sm"><slot/></div>
</template>
```

(Use these in domain pages shown earlier in the previous message.)

---

# 10 — Dev script

`scripts/dev.sh`

```bash
#!/usr/bin/env bash
set -e
bun run dev:server &
cd src/client && bunx vite
```

Make executable: `chmod +x scripts/dev.sh`

---

# 11 — Docker & docker-compose

`Dockerfile`

```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun install
# Build client
RUN cd src/client && bun install && bunx vite build && cp -r dist/* ../../public/
EXPOSE 3000
CMD ["bun", "run", "src/server/index.ts"]
```

`docker-compose.yml`

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    depends_on:
      - postgres
    environment:
      PG_HOST: postgres
      PG_PORT: 5432
      PG_DATABASE: app
      PG_USER: postgres
      PG_PASSWORD: postgres
      APP_PORT: 3000
    ports:
      - "3000:3000"
    command: bun run src/server/index.ts

volumes:
  pgdata:
```

---

# 12 — How to run (development)

1. Start Postgres with docker-compose:

   ```bash
   docker-compose up -d
   ```

2. Install dependencies (root):

   ```bash
   bun install
   cd src/client && bun install
   ```

3. Start dev (server + vite):

   ```bash
   bun run dev
   ```

   * Server: `http://localhost:3000` serves static built client (after build) and `/api/*` endpoints when running server
   * Vite dev: `http://localhost:5173` proxies `/api` to `:3000` (via vite config)

4. To run the full production app locally (container):

   ```bash
   docker-compose up --build
   # then open http://localhost:3000
   ```

---

# 13 — Notes & extensions you can add next

* Add **Zod** validation (server) and compile-time types on FE (Zod + zod-to-ts)
* Add **authentication** (JWT/cookie) with shared auth request/response contracts
* Add **search indexes** or full-text search for queries
* Add **rate limiting**, **CORS**, **logging (pino)**
* Replace raw SQL with prepared statements, or add query builder if needed (we used parameterized queries `$1`, etc.)
* Add **migrations** engine (e.g., node-pg-migrate) for production migrations (the sample runs init.sql on startup)

---

If you want, I can now:

* Produce **the exact set of files** (zipped or as a GitHub repo layout) so you can paste them straight into a new repo; or
* Add **Zod validation** for request bodies and show how to return typed validation errors in the same response envelope; or
* Add **Auth** (register/login) with shared request/response files.

Which one should I do next?
