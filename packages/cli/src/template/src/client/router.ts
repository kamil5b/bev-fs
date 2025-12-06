import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('./pages/index.vue') },
  { path: '/users', component: () => import('./pages/users.vue') },
  { path: '/products', component: () => import('./pages/products.vue') }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});
