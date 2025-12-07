import { createApp } from "vue";
import App from "./App.vue";
import { createFrameworkApp } from "bev-fs";

const routes = import.meta.glob("./**/*.vue", { eager: true });
const { app, router } = createFrameworkApp(App, { routeModules: routes });

app.mount("#app");
