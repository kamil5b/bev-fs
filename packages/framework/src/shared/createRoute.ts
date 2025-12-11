export const createRoute = <T extends string>(path: T) => ({
  path,
  api(pathSuffix = '') {
    return `/api${path}${pathSuffix}`
  },
})

/**
 * Convert directory-based file path to route path
 * Examples:
 * - "./router/index.vue" -> "/"
 * - "./router/product/index.vue" -> "/product"
 * - "./router/product/[id]/index.vue" -> "/product/:id"
 * - "./router/product/[id]/progress/index.vue" -> "/product/:id/progress"
 */
export function convertPathToRoute(
  filePath: string,
  prefix = 'router',
): string {
  let routePath = filePath
    .replace(/^\.?\/?(?:router\/)?/, '') // remove leading ./, router/, ./router/
    .replace(/\/index\.(vue|ts|js)$/, '') // remove /index.vue/.ts/.js extension
    .replace(/^index\.(vue|ts|js)$/, '') // remove root index.vue/.ts/.js
    .replace(/\[(\w+)\]/g, ':$1') // convert [id] to :id

  // Ensure route starts with /
  if (!routePath) {
    routePath = '/'
  } else if (!routePath.startsWith('/')) {
    routePath = '/' + routePath
  }

  return routePath
}

/**
 * Check if a file is an index file (index.ts, index.js, index.vue)
 */
export function isIndexFile(fileName: string): boolean {
  return /^index\.(ts|js|vue)$/.test(fileName)
}

/**
 * Convert directory name to route segment
 * Examples:
 * - "product" -> "product"
 * - "[id]" -> ":id"
 */
export function convertDirNameToSegment(dirName: string): string {
  return dirName.replace(/\[(\w+)\]/g, ':$1')
}
