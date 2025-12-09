import { getCurrentInstance } from 'vue';

/**
 * Custom composable to get the router instance
 * Works around Vue Router plugin injection issues
 */
export function useAppRouter() {
  const instance = getCurrentInstance();
  return instance?.proxy?.$router;
}

/**
 * Custom composable to get the current route
 * Works around Vue Router plugin injection issues
 */
export function useAppRoute() {
  const instance = getCurrentInstance();
  return instance?.proxy?.$route;
}
