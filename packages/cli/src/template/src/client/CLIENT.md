# Client Guide — Building UIs with Vue 3

This guide will teach you how to build a modern, type-safe Vue 3 frontend that works seamlessly with your bev-fs API backend.

## What You'll Learn

- 📁 **Directory-based routing** — Pages defined by folder structure
- 🎨 **Vue 3 Composition API** — Modern, reactive component development
- 🔒 **Type-safe API calls** — Full TypeScript support from server to client
- 🎯 **Dynamic routes** — Handle URL parameters with ease
- 🚀 **Hot module replacement** — Instant updates during development

## Directory Structure

```
src/client/
├── main.ts              # App entry point with auto-route discovery
├── index.html           # HTML template
├── App.vue              # Root component with router-view
├── components/          # Reusable Vue components
│   ├── ProductForm.vue
│   ├── ProductTable.vue
│   ├── ProductDetail.vue
│   ├── ProgressForm.vue
│   ├── ProgressItem.vue
│   ├── Modal.vue
│   ├── LoadingSpinner.vue
│   └── PageHeader.vue
├── composables/         # Reusable logic (composables)
│   └── useProductAPI.ts # Type-safe API calls
├── pages/               # Page components (UI for routes)
│   ├── Home.vue
│   ├── Product.vue
│   ├── ProductProgress.vue
│   └── NotFound.vue
├── stores/              # State management (for Pinia, if needed)
└── router/              # Directory-based routing configuration
    ├── index.vue                    # Homepage at / → imports Home.vue
    ├── product/
    │   ├── index.vue                # Product list at /product → imports Product.vue
    │   └── [id]/
    │       ├── index.vue            # Product detail at /product/:id
    │       └── progress/
    │           └── index.vue        # Progress list at /product/:id/progress → imports ProductProgress.vue
    └── not-found/
        └── index.vue                # 404 page for unknown routes → imports NotFound.vue
```

**Key concepts:**
- **`pages/`** — Actual page component files (Home.vue, Product.vue, etc.) - these contain the page UI
- **`router/`** — Route mapping files (index.vue files) - these import from pages/ and set up routing
- **`components/`** — Reusable components used by pages (ProductForm, Modal, etc.)
- **`composables/`** — Reusable logic as composables (useProductAPI for API calls)
- **`stores/`** — Global state management (for Pinia, if needed)

### The Separation: Pages vs Router

**Pages** = UI components that display content  
**Router** = Route configuration that imports and displays pages

Each route file in `router/` imports its corresponding page from `pages/`:

```typescript
// src/client/router/product/index.vue
// This is the route config for /product
import Product from '../../pages/Product.vue';

export default {
  component: Product
};
```

This separation keeps:
- 📄 **`pages/`** focused on UI and component logic
- 🗺️ **`router/`** focused on routing and navigation setup

## Getting Started

### Step 1: Understanding the Entry Point

Your app starts in `src/client/main.ts`. Here's the magic that makes directory-based routing work:

```typescript
// src/client/main.ts
import { createFrameworkApp } from 'bev-fs';
import App from './App.vue';

// Auto-discover all Vue components in router/ directory
const routeModules = import.meta.glob<any>("./router/**/*.vue", { eager: true });

console.log("Route modules from glob:", Object.keys(routeModules));

const { app } = createFrameworkApp(App, { routeModules });
app.mount('#app');
```

**What's happening:**

1. **`import.meta.glob()`** is a Vite feature that imports all matching files
2. **`"./router/**/*.vue"`** pattern finds all `.vue` files in the router directory
3. **`{ eager: true }`** loads all routes immediately (not lazy-loaded)
4. **`createFrameworkApp()`** converts your folder structure into Vue Router routes
5. **`app.mount('#app')`** attaches the app to the DOM

💡 **Auto-discovery benefits:**
- No manual route configuration needed
- Add a new page by just creating a file
- Routes mirror your folder structure perfectly
- `not-found/index.vue` automatically becomes your 404 page

### Step 2: Understanding Directory-Based Routing

Your file structure automatically becomes your routes:

| File Path | Route URL | Description |
|-----------|-----------|-------------|
| `router/index.vue` | `/` | Homepage |
| `router/product/index.vue` | `/product` | Product list |
| `router/product/[id]/index.vue` | `/product/:id` | Single product |
| `router/product/[id]/progress/index.vue` | `/product/:id/progress` | Product progress |
| `router/not-found/index.vue` | Any unmatched route | 404 page |

**Routing rules:**
- Folders become path segments: `product/` → `/product`
- `[paramName]` folders become dynamic segments: `[id]` → `:id`
- Each route needs an `index.vue` file
- Special folder `not-found/` creates the 404 catch-all

### Step 3: Understanding Pages vs Router

**Pages** are the actual UI components that render your application interface.  
**Router** files import and configure those pages for specific routes.

#### Pages Folder (`src/client/pages/`)

Each file here is a complete page component:

- **Home.vue** — Homepage with product management (CRUD operations)
- **Product.vue** — Product list/detail view
- **ProductProgress.vue** — Progress tracking interface
- **NotFound.vue** — 404 error page

#### Router Folder (`src/client/router/`)

Maps URLs to pages:

```
router/index.vue              → imports Home.vue              → route: /
router/product/index.vue      → imports Product.vue           → route: /product
router/product/[id]/...       → handles dynamic routes        → route: /product/:id
router/not-found/index.vue    → imports NotFound.vue          → route: (catch-all)
```

#### Components Folder (`src/client/components/`)

Reusable UI components used by pages:

- **ProductForm.vue** — Form for creating/editing products
- **ProductTable.vue** — Table displaying product list
- **ProductDetail.vue** — Single product detail display
- **ProgressForm.vue** — Form for progress entries
- **ProgressItem.vue** — Single progress record display
- **Modal.vue** — Reusable modal dialog
- **LoadingSpinner.vue** — Loading state indicator
- **PageHeader.vue** — Page title and navigation

### Step 4: Building Your Root Component

Both pages and router files work together. Your root `App.vue` contains the app shell:

```vue
<!-- src/client/App.vue -->
<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/product">Products</router-link>
    </nav>
    
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// No imports needed - router-link and router-view are global
</script>

<style scoped>
nav {
  padding: 1rem;
  border-bottom: 1px solid #ccc;
}

main {
  padding: 2rem;
}
</style>
```

**Key components:**
- `<router-link to="/path">` — Creates links (becomes `<a>` tag)
- `<router-view />` — Renders the active page component
- Vue Router automatically handles navigation and URL changes

### Step 4: Accessing Route Parameters

In dynamic routes like `/product/:id`, you can access parameters using Vue Router's composables:

```vue
<!-- src/client/router/product/[id]/index.vue -->
<template>
  <div v-if="product">
    <h1>{{ product.name }}</h1>
    <p>Price: ${{ product.price }}</p>
    <router-link :to="`/product/${product.id}/progress`">
      View Progress
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { productAPI } from '../../../api';
import type { Product } from '../../../shared';

const route = useRoute();
const product = ref<Product | null>(null);

onMounted(async () => {
  // Access the :id parameter
  const id = parseInt(route.params.id as string);
  const response = await productAPI.getById(id);
  product.value = response.product;
});
</script>
```

**Working with parameters:**
- `useRoute()` — Vue Router composable to access current route
- `route.params.id` — The dynamic `:id` segment from the URL
- `route.params` is always strings — parse numbers with `parseInt()`
- Multiple params like `/product/:id/progress/:progressId` are all in `route.params`

## Step 5: Type-Safe API Integration

### `api.ts` — Your API Client

The API client in `src/client/api.ts` provides type-safe methods to call your backend:

```typescript
// src/client/api.ts
import type { ProductAPI } from '../shared';

const BASE_URL = '/api';

export const productAPI = {
  async list(): Promise<ProductAPI.GetListResponse> {
    const res = await fetch(`${BASE_URL}/product`);
    return res.json();
  },
  
  async getById(id: number): Promise<ProductAPI.GetByIdResponse> {
    const res = await fetch(`${BASE_URL}/product/${id}`);
    return res.json();
  },
  
  async create(data: ProductAPI.CreateRequest): Promise<ProductAPI.CreateResponse> {
    const res = await fetch(`${BASE_URL}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async update(id: number, data: ProductAPI.UpdateRequest): Promise<ProductAPI.UpdateResponse> {
    const res = await fetch(`${BASE_URL}/product/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async delete(id: number): Promise<ProductAPI.DeleteResponse> {
    const res = await fetch(`${BASE_URL}/product/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};
```

**Why this approach?**

✅ **Type safety** — TypeScript knows exactly what each API returns  
✅ **Shared types** — Same types used on server and client (`src/shared.ts`)  
✅ **Centralized** — All API calls in one file, easy to update  
✅ **No dependencies** — Uses native `fetch`, no axios/ky needed  
✅ **Autocomplete** — Your editor suggests available methods and fields
  }
};
```

### Step 6: Building Interactive Components

Here's a complete example of a product list page with CRUD operations:

```vue
<!-- src/client/router/product/index.vue -->
<template>
  <div>
    <h1>Products</h1>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <button @click="addProduct">Add Product</button>
      
      <ul>
        <li v-for="p in products" :key="p.id">
          <router-link :to="`/product/${p.id}`">
            {{ p.name }} — ${{ p.price }}
          </router-link>
          <button @click="deleteProduct(p.id)">Delete</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { productAPI } from '../../api';
import type { Product } from '../../shared';

const products = ref<Product[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await productAPI.list();
    products.value = response.products;
  } catch (e) {
    error.value = 'Failed to load products';
  } finally {
    loading.value = false;
  }
});

async function addProduct() {
  try {
    const response = await productAPI.create({
      name: 'New Product',
      price: 99.99
    });
    products.value.push(response.created);
  } catch (e) {
    alert('Failed to create product');
  }
}

async function deleteProduct(id: number) {
  if (!confirm('Delete this product?')) return;
  
  try {
    await productAPI.delete(id);
    products.value = products.value.filter(p => p.id !== id);
  } catch (e) {
    alert('Failed to delete product');
  }
}
</script>

<style scoped>
.error {
  color: red;
  padding: 1rem;
  border: 1px solid red;
}

button {
  margin: 0.5rem;
}
</style>
```

**Component best practices:**

✅ **Use `ref<Type>`** for reactive state with TypeScript types  
✅ **Load data in `onMounted`** — runs once when component renders  
✅ **Handle loading states** — show spinners while fetching data  
✅ **Handle errors gracefully** — display user-friendly error messages  
✅ **Update local state** — mutate reactive refs after successful API calls  
✅ **Use `<router-link>`** for navigation instead of `<a>` tags

## Development Configuration

### Vite Configuration

Your `vite.config.ts` at the project root configures the development server and build:

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

**Configuration explained:**

- **`root: 'src/client'`** — Tells Vite where your client code lives
- **`outDir: '../../dist/client'`** — Build output goes here (Elysia serves this directory)
- **`emptyOutDir: true`** — Cleans old files before building
- **`alias: { '@': ... }`** — Lets you import with `@/api` instead of `../../api`
- **`plugins: [vue()]`** — Enables Vue 3 Single File Components

💡 **Using the `@` alias:**
```typescript
// Instead of:
import { productAPI } from '../../../api';

// You can use:
import { productAPI } from '@/api';
```

## Build & Deploy

### Development Mode

Run the full stack in development:

```bash
# Run both client and server concurrently
bun run dev
```

This starts:
- 📦 **Vite dev server** on `http://localhost:5173` (hot reload, fast refresh)
- 🔌 **Elysia API server** on `http://localhost:3000`

**During development:**
- Navigate to `http://localhost:5173` in your browser
- API calls to `/api/*` proxy to the backend at port 3000
- Changes to `.vue` files hot-reload instantly
- Changes to server files require manual restart (or use `--watch` flag)

### Production Build

Build optimized assets:

```bash
# Build only the client
bun run build:client

# Or build both client and server
bun run build
```

**Build output** (`dist/client/`):
- ✅ Minified HTML, CSS, JavaScript
- ✅ Tree-shaken dependencies (smaller bundles)
- ✅ Asset hashing for cache busting (`app.a3f2b8.js`)
- ✅ Optimized images and fonts
- ✅ Source maps for debugging (optional)

### Deployment

In production, the Elysia server serves your built frontend:

```bash
# Start production server
export SERVER_PORT=3000
bun src/server/index.ts
```

**How it works:**
1. Elysia serves static files from `dist/client/`
2. API requests to `/api/*` hit your server handlers
3. Unknown routes return `index.html` (enables client-side routing)
4. Vue Router handles navigation on the client

**Single-port deployment:**
- Everything runs on port 3000
- No CORS issues
- No separate frontend/backend deployments
- Perfect for containers, serverless, VPS

## Best Practices

### Component Structure
✅ Use `<script setup>` for cleaner, more concise components  
✅ One `index.vue` per route in the `router/` directory  
✅ Keep components small and focused on one responsibility  
✅ Extract reusable logic into composables (`use*.ts` files)  

### State Management
✅ Use `ref<Type>()` for reactive state with TypeScript  
✅ Handle `loading`, `error`, and `data` states separately  
✅ For complex state, consider Pinia or a custom composable  
✅ Don't mutate props — emit events to parent components  

### API Integration
✅ Centralize all API calls in `api.ts`  
✅ Use shared types from `src/shared.ts`  
✅ Type all API responses with TypeScript interfaces  
✅ Handle errors gracefully with try/catch blocks  

### Performance
✅ Lazy-load routes for faster initial load (change `eager: true` to `eager: false`)  
✅ Use `v-if` for conditional rendering (removes from DOM)  
✅ Use `v-show` for toggling visibility (keeps in DOM)  
✅ Debounce user input for search/filter features  

### TypeScript
✅ Define prop types with `defineProps<{ ... }>()`  
✅ Type all refs: `ref<Product[]>([])`  
✅ Import types from `src/shared.ts`  
✅ Enable strict mode in `tsconfig.json`  

## Quick Reference

### Adding a New Page

```bash
# 1. Create the file
mkdir -p src/client/router/about
touch src/client/router/about/index.vue
```

```vue
<!-- 2. Build the component -->
<template>
  <div>
    <h1>About</h1>
    <p>This is the about page</p>
  </div>
</template>

<script setup lang="ts">
// Component logic here
</script>
```

**Result:** Page is automatically available at `/about`

### Adding API Methods

```typescript
// Add to src/client/api.ts
export const userAPI = {
  async list(): Promise<UserAPI.GetListResponse> {
    const res = await fetch(`${BASE_URL}/users`);
    return res.json();
  }
};
```

### Creating Dynamic Routes

```bash
# Create a dynamic route with [paramName]
mkdir -p src/client/router/user/[id]
touch src/client/router/user/[id]/index.vue
```

```vue
<!-- Access the parameter -->
<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const userId = route.params.id; // The :id from /user/:id
</script>
```

## Troubleshooting

### Page Shows 404 in Development

**Symptom:** Navigate to `/product` and see "404 Not Found"

**Solutions:**
- ✅ Ensure file exists at `src/client/router/product/index.vue`
- ✅ Check that `routeModules` is passed to `createFrameworkApp()`
- ✅ Restart Vite dev server (`Ctrl+C` and `bun run dev`)
- ✅ Check browser console for route registration logs

### API Calls Returning 404

**Symptom:** `fetch('/api/product')` returns 404

**Solutions:**
- ✅ Ensure backend server is running (`bun src/server/index.ts`)
- ✅ Check API endpoint exists in `src/server/router/`
- ✅ Verify API path matches: `/api/product` not `/product`
- ✅ Check server console for route registration logs

### Component Not Updating After API Call

**Symptom:** UI doesn't reflect new data after fetch

**Solutions:**
- ✅ Use `ref()` for reactive data: `const products = ref<Product[]>([])`
- ✅ Update ref values correctly: `products.value = newData`
- ✅ Don't reassign refs: Use `products.value.push()` not `products.value = [...products.value, item]`
- ✅ Ensure data is wrapped in `ref()` or `reactive()`

### TypeScript Errors in Components

**Symptom:** Red squiggles, type errors in `.vue` files

**Solutions:**
- ✅ Install Volar extension in VS Code (not Vetur)
- ✅ Define types for refs: `ref<Product | null>(null)`
- ✅ Import types from `src/shared.ts`
- ✅ Use `as` to cast: `const req = body as ProductAPI.CreateRequest`

### Styles Not Applying

**Symptom:** CSS in `<style>` block doesn't affect the component

**Solutions:**
- ✅ Use `<style scoped>` to scope styles to component
- ✅ Remove `scoped` if you want global styles
- ✅ Check CSS selector specificity
- ✅ Import global styles in `main.ts`

### Hot Reload Not Working

**Symptom:** Changes don't appear without manual refresh

**Solutions:**
- ✅ Check Vite dev server is running
- ✅ Look for errors in terminal or browser console
- ✅ Try hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
- ✅ Restart Vite dev server

---

## Next Steps

Now that you understand frontend development, explore:

- **[Server Guide](../server/SERVER.md)** — Build the API backend
- **[Shared API Types](../shared.ts)** — Type-safe contracts
- **[Vue 3 Documentation](https://vuejs.org/)** — Deep dive into Vue
- **[Vite Documentation](https://vitejs.dev/)** — Advanced bundling configuration

**Need help?** Check [npmjs.com/package/bev-fs](https://www.npmjs.com/package/bev-fs) or open a GitHub issue.
