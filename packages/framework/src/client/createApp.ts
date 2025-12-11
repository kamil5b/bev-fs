import { createApp as _createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { convertPathToRoute } from '../shared/createRoute'
import { registerMiddleware } from './useMiddleware'
import type { ClientMiddleware } from '../shared/types'

export type ClientOptions = {
  routes?: any[] // vue-router routes (manual override)
  routeModules?: Record<string, any> // import.meta.glob result from client
  historyMode?: boolean
  middleware?: ClientMiddleware[] // client-side middleware
}

export function createFrameworkApp(
  rootComponent: any,
  opts: ClientOptions = {},
) {
  const app = _createApp(rootComponent)

  let routes =
    opts.routes ?? (opts.routeModules ? discoverRoutes(opts.routeModules) : [])

  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  // Install router with explicit type
  app.use(router)

  // ALSO add router as global property as a workaround
  app.config.globalProperties.$router = router

  // Register client-side middleware if provided
  if (opts.middleware && opts.middleware.length > 0) {
    registerMiddleware(app, opts.middleware)
  }

  return { app, router }
}

function discoverRoutes(modules: Record<string, any>): any[] {
  const routes: any[] = []
  let notFoundComponent: any = null
  const routePaths = new Set<string>()

  // Only process index.vue files from router directories
  const validModules = Object.entries(modules).filter(([path]) =>
    path.endsWith('index.vue'),
  )

  for (const [filePath, moduleExports] of validModules) {
    const module = moduleExports as { default: any }

    // Special case: save NotFound component for catch-all route
    if (filePath.includes('not-found') || filePath.includes('404')) {
      notFoundComponent = module.default
      continue
    }

    // Convert file path to route path using shared utility
    const routePath = convertPathToRoute(filePath)

    // Check for conflicting routes
    if (routePaths.has(routePath)) {
      console.warn(
        `⚠️  Duplicate route detected: ${routePath} from ${filePath}`,
      )
    }

    routePaths.add(routePath)

    routes.push({
      path: routePath,
      component: module.default,
    })
  }

  // Add catch-all 404 route at the end
  if (notFoundComponent) {
    routes.push({
      path: '/:pathMatch(.*)*',
      component: notFoundComponent,
    })
  }

  return routes
}
