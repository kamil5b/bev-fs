## 🔄 Refactored Client Architecture Guide (Vue 3 Monolith Edition)

This guide adapts the client structure to the **Vue 3** ecosystem, utilizing the **Composition API** for logic separation and **Vue Router** for navigation, while preserving the clean, component-based patterns.

-----

## 📁 Directory Structure (Vue 3 Monolith)

The structure is adapted for Vue conventions, replacing "hooks" with **"composables"** and using `.vue` file extensions.

```
src/client/
├── assets/          # Static assets, images, CSS
├── components/      # Reusable UI components
│   ├── ui/          # Base UI components (Vue-Radix/Headless UI/Tailwind)
│   └── *.vue        # Composed components
├── composables/     # Custom Vue Composables (replaces React hooks)
├── helpers/         # Utility functions (API, RBAC, formatters)
├── layouts/         # Layout components (ProtectedLayout, PublicLayout)
├── router/          # Vue Router configuration
├── templates/       # Generic page templates (ListPageTemplate, FormPageTemplate)
│   ├── ListPageTemplate.vue
│   └── FormPageTemplate.vue
├── views/           # Page-level components (replaces 'pages', organized by domain)
│   ├── auth/
│   ├── dashboard/
│   └── user/
├── main.ts          # Vue app entry point (mounts app, router)
└── utils.ts         # Utility functions (class merging)
```

-----

## 🏗️ Architecture Overview

The client follows a **Composition API pattern** using the standard Vue lifecycle and reactivity.

```
Vue Router → Layout → View (Page) → Components → UI Elements
                          ↓               ↓
                     Composables      Helpers
```

### Layer Responsibilities (Adapted)

1.  **Views** (`views/`)

      * Replaces Next.js "Pages" or React "Pages". These are **Page-level Vue components** mounted by Vue Router.
      * Handle **data fetching** using composables (`usePagination`).
      * Define the main **structure** and **state** for a route.
      * **Compose** multiple components and templates.

2.  **Layouts** (`layouts/`)

      * Wrap content using `<slot>`.
      * **Vue Router Hooks**: Handle navigation guards for authentication (`router.beforeEach`).

3.  **Components** (`components/`)

      * **Presentational and reusable** UI blocks.
      * Use `props` for data input and `emits` for events/callbacks.

4.  **Composables** (`composables/`)

      * **Replaces React Hooks**. Shared, reusable **stateful logic** written using Vue's Composition API (`ref`, `computed`, `watch`, lifecycle hooks).
      * Examples: `useAuth`, `usePagination`, `usePermissions`.

5.  **Helpers** (`helpers/`)

      * **Pure utility functions** with **no Vue dependencies**.
      * API request handlers, formatters, RBAC logic.

-----

## 📦 Module Overview (Vue 3 Refactor)

### 1\. Composables (`composables/`)

#### `useAuth`

```typescript
// src/client/composables/useAuth.ts (Vue Refactor)
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// Reactive state
const token = ref(localStorage.getItem('auth_token'));
const isAuthenticated = computed(() => !!token.value);
const isLoading = ref(false);
const router = useRouter();

export function useAuth() {
  const login = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('auth_token', newToken);
    router.push('/dashboard'); // Vue Router navigation
  };

  const logout = () => {
    token.value = null;
    localStorage.removeItem('auth_token');
    router.push('/login'); // Vue Router navigation
  };

  const getAuthHeaders = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {};
  };

  return { token, isAuthenticated, isLoading, login, logout, getAuthHeaders };
}
```

#### `usePagination`

Uses Vue's reactivity system (`ref`) and lifecycle hook (`onMounted` or `watch`) to manage fetching.

```typescript
// src/client/composables/usePagination.ts (Vue Refactor)
import { ref, watch, computed } from 'vue';
import { fetchPaginated } from '@/client/helpers/api';

export function usePagination<T>({ fetchFn, initialLimit = 10 }: PaginateOptions<T>) {
  const data = ref<T[]>([]);
  const page = ref(1);
  const limit = ref(initialLimit);
  const totalPages = ref(1);
  const totalItems = ref(0);
  const search = ref('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchData = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetchFn(page.value, limit.value, search.value);
      data.value = response.items;
      totalPages.value = response.meta.totalPages;
      totalItems.value = response.meta.totalItems;
    } catch (e) {
      error.value = (e as Error).message || 'Failed to fetch data.';
    } finally {
      isLoading.value = false;
    }
  };

  // 🔄 Automatically re-fetch data when page or search changes
  watch([page, limit, search], fetchData, { immediate: true }); 

  const nextPage = () => { if (page.value < totalPages.value) page.value++; };
  const prevPage = () => { if (page.value > 1) page.value--; };
  const refresh = () => { page.value = 1; fetchData(); };
  
  return {
    data, page, totalPages, totalItems, search, setSearch: (s: string) => search.value = s,
    isLoading, error, refresh, nextPage, prevPage, goToPage: (p: number) => page.value = p
  };
}
```

### 2\. Layouts (`layouts/`) and Router (`router/`)

The layout logic is decoupled using **Vue Router's navigation guards**.

#### Vue Router Setup (`src/client/router/index.ts`)

```typescript
// src/client/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuth } from '@/client/composables/useAuth';

// 1. Define routes
const routes: RouteRecordRaw[] = [
  // Public Routes
  { path: '/login', component: () => import('@/client/views/auth/LoginPage.vue'), meta: { isPublic: true } },
  // Protected Routes
  { path: '/dashboard', component: () => import('@/client/views/dashboard/DashboardPage.vue') },
  { path: '/users', component: () => import('@/client/views/user/UsersListPage.vue') },
  { path: '/users/new', component: () => import('@/client/views/user/UserFormPage.vue') },
  { path: '/users/:id/edit', component: () => import('@/client/views/user/UserFormPage.vue'), props: true },
  // ...
];

const router = createRouter({
  history: createWebHistory(), // Use browser history mode
  routes,
});

// 2. Navigation Guard (Replaces Next.js middleware)
router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth(); // Access composable
  
  if (!to.meta.isPublic && !isAuthenticated.value) {
    // Redirect to login if path is protected and user is not authenticated
    next({ path: '/login' });
  } else if (isAuthenticated.value && to.path === '/login') {
    // Redirect authenticated user away from login page
    next({ path: '/dashboard' });
  } else {
    next();
  }
});

export default router;
```

#### Protected Layout (`src/client/layouts/ProtectedLayout.vue`)

```vue
<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar :userRole="userRole" /> 
    
    <div class="flex flex-col flex-1 overflow-y-auto">
      <Header /> 
      
      <main class="p-6">
        <slot></slot> 
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissions } from '@/client/composables/usePermissions';
import Sidebar from '@/client/components/Sidebar.vue';
import Header from '@/client/components/Header.vue';

// Use composable to get data (e.g., user role for sidebar filtering)
const { role: userRole } = usePermissions();
</script>
```

### 3\. Views (`views/`)

The page component uses the Composition API and `ListPageTemplate` for boilerplate reduction.

#### Pattern: List Pages (Using Template)

```vue
<template>
  <ListPageTemplate
    title="Customers"
    :menuPermission="AccessPermission.MENU_CUSTOMER"
    :createPermission="AccessPermission.CREATE_CUSTOMER"
    :editPermission="AccessPermission.EDIT_CUSTOMER"
    :deletePermission="AccessPermission.DELETE_CUSTOMER"
    apiEndpoint="/api/customers"
    searchPlaceholder="Search customers..."
    createButtonText="Create Customer"
    :columns="columns"
    :onEdit="handleEdit"
    :onCreate="handleCreate"
    :getDeleteConfirmMessage="getDeleteConfirmMessage"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ListPageTemplate, { type ColumnConfig } from '@/client/templates/ListPageTemplate.vue';
import { AccessPermission } from '@/shared/enums';
import type { CustomerResponse } from '@/shared';

const router = useRouter();

// Define table columns
const columns: ColumnConfig<CustomerResponse>[] = [
  { header: "Name", accessor: (customer) => customer.name },
  { header: "Email", accessor: (customer) => customer.email },
  { header: "Phone", accessor: (customer) => customer.phone || "-" },
];

// Navigation handlers use Vue Router
const handleEdit = (id: string) => router.push(`/customers/${id}/edit`);
const handleCreate = () => router.push('/customers/new');
const getDeleteConfirmMessage = (customer: CustomerResponse) => 
  `Are you sure you want to delete "${customer.name}"?`;
</script>
```

### 4\. Helpers (`helpers/`)

Helpers remain **pure functions** and are generally **framework-agnostic**. The `apiRequest` utility handles the `Bearer` token by using the `useAuth` composable.

```typescript
// src/client/helpers/api.ts (Vue Refactor)
import { useAuth } from '@/client/composables/useAuth';

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const { getAuthHeaders } = useAuth(); // Get auth headers from composable
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(), // Inject token
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch {
      // Ignore if body is not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
// ... fetchPaginated, createResource, etc., remain similar
```