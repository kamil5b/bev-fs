This is an architectural specification for a **Bun Monolith (All-in-One)** application using **Vue 3** (instead of React 19) for the frontend, as Next.js is excluded. Bun provides the runtime, module bundling, and native TypeScript support for both the server and client components, replacing the need for a separate Node.js environment and potentially Webpack/Vite for the Vue client.

The structure adheres to all specified layering, file organization, and architectural patterns.

## 📁 Project Structure (Bun Monolith)

The entire application is contained within a single `src` directory, with server, client, and shared logic clearly separated.

```
/
├── node_modules/
├── migrations/
│   ├── 001_initial_schema.sql
│   └── ...
├── src/
│   ├── shared/         <-- Model/Shared layer
│   │   ├── entities/   (e.g., user.entity.ts, customer.entity.ts)
│   │   ├── enums/      (e.g., user.enums.ts, inventory.enums.ts)
│   │   ├── rbac/       (e.g., rbac.ts)
│   │   ├── request/    (e.g., user.request.ts)
│   │   └── response/   (e.g., user.response.ts)
│   │
│   ├── server/         <-- Controller/Backend layer
│   │   ├── db/         (e.g., pool.ts, client.ts)
│   │   ├── handlers/   (e.g., user.handler.ts, auth.handler.ts)
│   │   ├── services/   (e.g., user.service.ts, auth.service.ts)
│   │   ├── repositories/ (e.g., user.repository.ts)
│   │   └── utils/      (e.g., auth.ts, response.ts)
│   │   └── index.ts    <-- Bun server entry point (API handling)
│   │
│   └── client/         <-- View/Frontend layer (Vue 3)
│       ├── layouts/    (e.g., ProtectedLayout.vue, PublicLayout.vue)
│       ├── pages/      (e.g., auth/LoginPage.vue, dashboard/DashboardPage.vue)
│       ├── template/   (e.g., ListPageTemplate.vue, FormPageTemplate.vue)
│       ├── components/
│       │   ├── ui/     (shadcn/ui base components, e.g., Button.vue)
│       │   └── PageHeader.vue, SearchBar.vue, etc.
│       ├── hooks/      (e.g., useAuth.ts, usePagination.ts)
│       ├── helpers/    (e.g., api.ts, validation.ts)
│       └── main.ts     <-- Vue client entry point
│
├── tsconfig.json       <-- Single config with path aliases
├── bunfig.toml         <-- Bun configuration
└── package.json
```

-----

## 🛠️ Key Implementation Details

### 1\. Model (Shared)

  * **Path Aliases:** The `tsconfig.json` will configure a path alias: `"@/*": ["./src/*"]`.

  * **Exports:** All shared types are exported via index files in their respective sub-directories to be importable as required:

    ```typescript
    // src/shared/entities/user.entity.ts
    export interface UserEntity { /* ... */ }

    // src/shared/entities/index.ts
    export * from './user.entity.ts';
    // ... then used in server/client as:
    // import { UserEntity } from '@/shared/entities';
    ```

### 2\. Controller (Backend - Bun Server)

The server will be built using a lightweight Bun-native router (like `elysia` or a simple custom router) to adhere to the specified route rules without relying on frameworks like Express.

#### A. Database & Transaction Pattern

The `pg` (PostgreSQL) package is used for raw SQL. The **Transaction Pattern** is strictly enforced.

  * `src/server/db/pool.ts`: Manages the connection pool (`const pool = new pg.Pool(...)`).

  * `src/server/db/client.ts`: Exports a function to get a client:

    ```typescript
    // src/server/db/client.ts
    import { Pool, PoolClient } from 'pg';
    // ... pool initialization ...
    export const getDbClient = async (): Promise<PoolClient> => pool.connect();
    ```

  * **Service Layer Example:**

    ```typescript
    // src/server/services/user.service.ts
    import { getDbClient } from '@/server/db/client';
    import * as userRepository from '@/server/repositories/user.repository';

    export async function createUser(userData: any) {
        const client = await getDbClient(); // ✅ Get client
        try {
            await client.query('BEGIN'); // ✅ BEGIN transaction

            // 1. Business Logic / Validation
            // 2. Pass client to repository
            const newUser = await userRepository.insertUser(client, userData);
            
            await client.query('COMMIT'); // ✅ COMMIT
            return newUser;
        } catch (error) {
            await client.query('ROLLBACK'); // ✅ ROLLBACK on error
            throw error; // Throw AppError
        } finally {
            client.release(); // ✅ Always release
        }
    }
    ```

  * **Repository Layer Example:**

    ```typescript
    // src/server/repositories/user.repository.ts
    import { PoolClient } from 'pg';
    import { UserEntity } from '@/shared/entities';

    // ✅ Accepts PoolClient as first parameter
    export async function insertUser(client: PoolClient, data: any): Promise<UserEntity> {
        const queryText = `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *`;
        // ✅ Use parameterized query
        const res = await client.query(queryText, [data.name, data.email]); 
        // ✅ Map database row to domain entity
        return res.rows[0] as UserEntity; 
    }
    ```

#### B. Handlers and Routes (Minimal Wrappers)

  * `src/server/handlers/user.handler.ts`:

    ```typescript
    // src/server/handlers/user.handler.ts
    import * as userService from '@/server/services/user.service';
    import { successResponse, AppError } from '@/server/utils/response';

    export async function handleCreateUser(req: Request) {
        try {
            const body = await req.json();
            const newUser = await userService.createUser(body);
            return successResponse(201, "User created successfully", { user: newUser });
        } catch (error) {
            if (error instanceof AppError) {
                return successResponse(error.status, error.message);
            }
            return successResponse(500, "Internal Server Error"); // Fallback
        }
    }
    ```

  * Bun route file (`src/server/index.ts` or similar):

    ```typescript
    // Pseudo Bun API route structure
    router.post('/api/users', async (req) => {
        // ✅ ONLY imports from handler
        return handleCreateUser(req); 
    });
    ```

### 3\. View (Frontend - Vue 3)

The Vue client will be a single-page application (SPA) handled by Bun's build/serve capabilities and routed using **Vue Router**. We substitute the Next.js `app/` directory structure with a conventional Vue/Vue Router setup.

  * **File Extensions:** `.vue` for components, `.ts` for scripts/hooks/helpers.
  * **Styling:** Tailwind CSS v4 is configured for the Vue build process. Shadcn/ui is implemented as Vue components (e.g., using a library like `shadcn-vue` or custom implementation).

#### A. Routing and Layouts

Vue Router is used to enforce the route groups and layout inheritance.

| Route Group | Path Alias | Authentication | Layout |
| :--- | :--- | :--- | :--- |
| **(public)** | `/login`, `/register` | Public | `PublicLayout.vue` |
| **(private)** | `/dashboard`, `/users` | JWT Required | `ProtectedLayout.vue` |

```typescript
// src/client/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
// ... imports for LoginPage.vue, DashboardPage.vue ...

const routes = [
  // Public Routes
  {
    path: '/',
    component: () => import('@/client/layouts/PublicLayout.vue'),
    children: [
      { path: 'login', component: () => import('@/client/pages/auth/LoginPage.vue'), name: 'Login' },
      { path: 'register', component: () => import('@/client/pages/auth/RegisterPage.vue'), name: 'Register' },
      // Root redirect handled by middleware/global guard
    ],
  },
  // Private Routes
  {
    path: '/',
    component: () => import('@/client/layouts/ProtectedLayout.vue'),
    meta: { requiresAuth: true }, // Auth check in global navigation guard
    children: [
      { path: 'dashboard', component: () => import('@/client/pages/dashboard/DashboardPage.vue'), name: 'Dashboard' },
      { path: 'users', component: () => import('@/client/pages/user/UsersListPage.vue'), name: 'UsersList' },
      // ... all other private pages
    ],
  },
];

const router = createRouter({ history: createWebHistory(), routes });
```

#### B. Component and Template Hierarchy

  * **Page Component Example** (`src/client/pages/user/UsersListPage.vue`):

    ```vue
    <script setup lang="ts">
    import { ListPageTemplate } from '@/client/template';
    // ✅ Business logic: fetch data, manage state
    // ... use usePagination hook ...
    // ... define navigation callbacks: onEdit, onCreate ...
    </script>

    <template>
      <ListPageTemplate
        title="Users"
        :items="users"
        :pagination="meta"
        @create="() => $router.push({ name: 'UserCreate' })" 
        @edit="(id) => $router.push({ name: 'UserEdit', params: { id } })"
      />
    </template>
    ```

  * **Template Component Example** (`src/client/template/ListPageTemplate.vue`):
    The template receives data, configuration, and emits events for CRUD actions/pagination. It focuses on structure and reusability, not business logic.

#### C. Authentication State and Middleware

  * **State:** Auth token stored in **`localStorage`** (for client-side access) and sent to the server as a **Cookie** (for server-side/API access).

  * **Vue Router Guard (Frontend Middleware):**

    ```typescript
    // src/client/router/index.ts (cont.)
    router.beforeEach((to, from, next) => {
        const token = localStorage.getItem('auth_token');

        if (to.meta.requiresAuth && !token) {
            // Private page, no token: redirect to login
            return next({ name: 'Login' }); 
        }

        if ((to.name === 'Login' || to.name === 'Register') && token) {
            // Public page, logged in: redirect to dashboard
            return next({ name: 'Dashboard' }); 
        }
        
        // Root redirect
        if (to.path === '/') {
            return next({ name: token ? 'Dashboard' : 'Login' });
        }

        next();
    });
    ```

  * **Bun Server Middleware (Backend):** Bun's server entry point (`src/server/index.ts`) will have middleware to check the `auth_token` from the request **`Cookie`** or **`Authorization: Bearer`** header for all private API routes (`/api/**`).

### 4\. API Response Standardization

The utility function in `src/server/utils/response.ts` ensures all responses conform to the required structure:

```typescript
// src/server/utils/response.ts (simplified)
import { v4 as uuid } from 'uuid';

export function baseResponse(status: number, message: string, data: Record<string, any> = {}) {
    const timestamp = new Date().toISOString();
    
    // Success response (2XX)
    if (status >= 200 && status < 300) {
        return {
            status: status,
            body: {
                message: message || "OK",
                requestedAt: timestamp,
                requestId: uuid(),
                ...data
            }
        };
    }
    
    // Error response (4XX/5XX)
    return {
        status: status,
        body: {
            message: message,
            requestedAt: timestamp,
            requestId: uuid(),
        }
    };
}
```

### 5\. Pagination Implementation

  * **Server-side Repository:** Implements **OFFSET/LIMIT** with dynamic construction of search, sort, and filter clauses.

    ```typescript
    // src/server/repositories/product.repository.ts (pseudo-code)
    async function findProducts(client: PoolClient, params: PaginationRequest) {
        // ... construct WHERE clause based on search/filters ...
        // ... construct ORDER BY clause based on sortByX ...
        
        const totalItemsQuery = `SELECT COUNT(*) FROM products WHERE deleted_at IS NULL ${whereClause}`;
        const dataQuery = `SELECT * FROM products WHERE deleted_at IS NULL ${whereClause} ${orderByClause} LIMIT $1 OFFSET $2`;
        
        const offset = (params.page - 1) * params.limit;
        const total = await client.query(totalItemsQuery);
        const data = await client.query(dataQuery, [params.limit, offset]);

        // ... return items and pagination metadata ...
    }
    ```

  * **Response Structure:** Handlers combine the data and meta information into the required structure using `baseResponse`.

    ```json
    {
        "message": "OK",
        "requestedAt": "...",
        "requestId": "...",
        "meta": {
            "page":1, "limit":10, "totalPages":1, "totalItems":1,
        },
        "items": [ ... ]
    }
    ```
