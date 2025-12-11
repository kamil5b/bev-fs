import { createFrameworkApp } from 'bev-fs'
import App from './App.vue'
import { loggingMiddleware } from './composables/useCustomMiddleware'

// Discover routes from router directory
// Note: Vite's import.meta.glob must have a static string pattern
const routeModules = import.meta.glob<any>('./router/**/*.vue', { eager: true })

const { app, router } = createFrameworkApp(App, {
  routeModules,
  middleware: [loggingMiddleware],
})

// Wait for router to be ready before mounting
router.isReady().then(() => {
  app.mount('#app')
  console.log('✅ App mounted and router is ready')
})
