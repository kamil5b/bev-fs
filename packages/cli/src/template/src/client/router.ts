import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('./pages/index.vue') },
  { path: '/products/:productId', component: () => import('./pages/product-detail.vue') }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});
