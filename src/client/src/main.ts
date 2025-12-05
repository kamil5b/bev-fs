declare module 'vue';
declare module '*.vue';
declare module 'vue-router';

import { createApp } from "vue";
import App from "./app/App.vue";
import { router } from "./app/router";
import "../style.css";

createApp(App).use(router).mount("#app");
