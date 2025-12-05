import { createRouter, createWebHistory } from 'vue-router';
import routes from '../../routes/index';
const routeEntries = Object.values(routes).map((r) => ({
    path: r.path,
    component: () => import(`./pages${r.path || '/index'}.vue`)
}));
export const router = createRouter({
    history: createWebHistory(),
    routes: routeEntries
});
