import { createFrameworkApp } from 'bev-fs';
import App from './App.vue';

// Discover routes from router directory
// Note: Vite's import.meta.glob must have a static string pattern
const routeModules = import.meta.glob<any>("./router/**/*.vue", { eager: true });

const { app } = createFrameworkApp(App, { routeModules });
app.mount('#app');
