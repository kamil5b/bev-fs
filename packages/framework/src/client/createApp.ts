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
