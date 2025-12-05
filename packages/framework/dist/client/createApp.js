import { createApp as _createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
export function createFrameworkApp(rootComponent, opts = {}) {
    const app = _createApp(rootComponent);
    const routes = opts.routes ?? [];
    const router = createRouter({
        history: createWebHistory(),
        routes
    });
    app.use(router);
    return { app, router };
}
