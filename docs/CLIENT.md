# Client Guide — Vue + Vite Frontend

The client directory contains the Vue 3 frontend application with type-safe API integration.

## Directory Structure

```
src/client/
├── main.ts          # App entry point, mounts Vue instance
├── index.html       # HTML template
├── App.vue          # Root component
├── router.ts        # Vue Router configuration
├── api.ts           # Type-safe API client
└── pages/
    ├── index.vue
    ├── products.vue
    └── users.vue
```

## Setup

### `main.ts` — Entry Point

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';

createApp(App).use(router).mount('#app');
```

Creates the Vue app, registers the router, and mounts to the DOM.

## Routing

### `router.ts` — Vue Router Setup

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/index.vue';
import Products from './pages/products.vue';
import Users from './pages/users.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/products', component: Products },
    { path: '/users', component: Users }
  ]
});
```

- Uses HTML5 history mode for clean URLs
- All routes define corresponding page components

### Navigation

```vue
<template>
  <nav>
    <router-link to="/">Home</router-link>
    <router-link to="/products">Products</router-link>
    <router-link to="/users">Users</router-link>
  </nav>
  <router-view />
</template>
```

Use `<router-link>` for navigation and `<router-view />` to render the current page.

## API Integration

### `api.ts` — Type-Safe API Client

```typescript
const apiBase = '/api';

export const productAPI = {
  async getAll() {
    const res = await fetch(`${apiBase}/product`);
    return res.json() as Promise<{ products: Product[] }>;
  },
  
  async getById(id: number) {
    const res = await fetch(`${apiBase}/product/${id}`);
    return res.json() as Promise<Product>;
  },
  
  async create(data: { name: string; price: number }) {
    const res = await fetch(`${apiBase}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json() as Promise<Product>;
  },
  
  async update(id: number, data: Partial<Product>) {
    const res = await fetch(`${apiBase}/product/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json() as Promise<Product>;
  },
  
  async delete(id: number) {
    return fetch(`${apiBase}/product/${id}`, { method: 'DELETE' });
  }
};

export const userAPI = {
  async getAll() {
    const res = await fetch(`${apiBase}/users`);
    return res.json() as Promise<{ users: User[] }>;
  }
};
```

**Key points:**
- Namespace APIs by domain (productAPI, userAPI)
- All methods are typed with TypeScript
- Uses native `fetch` (no external HTTP library)
- Centralized in one file for easy updates

### Using API Client in Components

```vue
<template>
  <div>
    <h1>Products</h1>
    <button @click="addProduct">Add Product</button>
    <ul>
      <li v-for="p in products" :key="p.id">
        {{ p.name }} — ${{ p.price }}
        <button @click="deleteProduct(p.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { productAPI } from '../api';

const products = ref([]);

onMounted(async () => {
  const data = await productAPI.getAll();
  products.value = data.products;
});

async function addProduct() {
  const p = await productAPI.create({
    name: 'New Product',
    price: 99.99
  });
  products.value.push(p);
}

async function deleteProduct(id) {
  await productAPI.delete(id);
  products.value = products.value.filter(p => p.id !== id);
}
</script>
```

**Pattern:**
- Load data in `onMounted` hook
- Call API methods for mutations (create, update, delete)
- Update local state after success
- Optional: add loading/error states with refs

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  root: 'src/client',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src/client')
    }
  }
});
```

- **root**: Client source directory
- **outDir**: Built assets go to dist/client (served by Elysia)
- **alias**: `@` points to src/client for cleaner imports

## Build & Deploy

### Development

```bash
bun run dev
```

Runs Vite dev server on port 5173 with hot reload. Elysia backend runs on port 3000.

### Production Build

```bash
bun run build:client
```

Produces optimized assets in `dist/client/`:
- Minified HTML, CSS, JavaScript
- Asset hashing for cache busting
- Source maps (optional)

### Serving

In production, Elysia serves the built `dist/client/` directory statically and falls back to `index.html` for client-side routing.

## Best Practices

✅ **Keep API client separate** — `src/client/api.ts` is the single source of truth  
✅ **Use composition API** — modern, cleaner Vue 3 patterns with `<script setup>`  
✅ **Type everything** — leverage TypeScript for client-server safety  
✅ **Organize pages** — one file per route in `pages/` directory  
✅ **Handle loading/error states** — use `ref` and conditional rendering  
✅ **Use router-view for layouts** — nest routers for complex UIs  

## Common Tasks

### Add a new page

1. Create `src/client/pages/newpage.vue`
2. Import in `router.ts` and add route
3. Link from template with `<router-link to="/newpage">`

### Add a new API endpoint

1. Add method to appropriate API object in `src/client/api.ts`
2. Use in component with `await apiMethod()`

### Update API base URL

Change `apiBase` in `src/client/api.ts`:
```typescript
const apiBase = process.env.API_URL || '/api';
```

## Troubleshooting

**MIME type error on page load**
- Check that Vite proxy is configured correctly (should be `/api/` not `/api`)
- Ensure backend is running on port 3000

**Components not updating after API call**
- Make sure you're updating `ref()` values, not reassigning
- Use `array.push()` or `array.splice()` for reactivity

**Styles not applying**
- Check scoped style syntax: `<style scoped>`
- Import global styles in `main.ts`
