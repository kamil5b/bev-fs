import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import path from "path";
import fs from "fs";
import { convertPathToRoute } from "../shared/createRoute";
import { validateServerConfig } from "../config/validator";
import { RouteDiscoveryError } from "../errors/RouteDiscoveryError";
import type { HealthCheckResponse } from "../shared/types";

/**
 * Helper to load config from .env file
 * Checks in order: .env.local, .env
 */
export function loadConfigFromDotEnv() {
  const cwd = process.cwd();
  const envFiles = [".env.local", ".env"];
  const config: any = {};
  
  for (const envFile of envFiles) {
    const envPath = path.join(cwd, envFile);
    
    if (!fs.existsSync(envPath)) {
      continue;
    }
    
    try {
      const envContent = fs.readFileSync(envPath, "utf-8");
      for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        
        const [key, ...rest] = trimmed.split("=");
        if (key) {
          const value = rest.join("=").trim().replace(/^["']|["']$/g, "");
          // Convert env vars to nested config structure
          // e.g., SERVER_ROUTER_DIR -> config.server.routerDir
          const parts = key.toLowerCase().split("_");
          if (parts.length >= 2) {
            const section = parts[0];
            const keyName = parts.slice(1).join("_");
            if (!config[section]) config[section] = {};
            config[section][keyName] = value;
          }
        }
      }
      
      // Found a file, don't check others
      break;
    } catch (e) {
      console.warn(`Failed to load ${envFile}:`, e);
    }
  }
  
  return config;
}

/**
 * Helper to load config from YAML file
 * Checks in order: config.yaml.local, config.local.yaml, config.yaml
 */
export function loadConfigFromYAML() {
  const cwd = process.cwd();
  const yamlFiles = ["config.yaml.local", "config.local.yaml", "config.yaml"];
  const config: any = {};
  
  for (const yamlFile of yamlFiles) {
    const configPath = path.join(cwd, yamlFile);
    
    if (!fs.existsSync(configPath)) {
      continue;
    }
    
    try {
      const content = fs.readFileSync(configPath, "utf-8");
      let currentSection = "";
      
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith("#")) continue;
        
        // Section headers (e.g., "server:")
        if (trimmed.endsWith(":") && trimmed.indexOf(":") === trimmed.length - 1) {
          currentSection = trimmed.slice(0, -1);
          if (!config[currentSection]) {
            config[currentSection] = {};
          }
          continue;
        }
        
        // Key-value pairs (e.g., "  routerDir: src/server/router")
        if (trimmed.includes(":")) {
          const [key, ...rest] = trimmed.split(":");
          const value = rest.join(":").trim();
          
          if (currentSection) {
            config[currentSection][key.trim()] = value;
          } else {
            config[key.trim()] = value;
          }
        }
      }
      
      // Found a file, don't check others
      break;
    } catch (e) {
      console.warn(`Failed to load ${yamlFile}:`, e);
    }
  }
  
  return config;
}

/**
 * Helper to load config from both config.yaml and .env files
 * Precedence: config.yaml > .env > defaults
 */
export function loadConfig() {
  // Load .env first
  const envConfig = loadConfigFromDotEnv();
  
  // Load config.yaml (overrides .env)
  const yamlConfig = loadConfigFromYAML();
  
  // Merge: yaml overrides env
  const merged: any = JSON.parse(JSON.stringify(envConfig));
  
  for (const section in yamlConfig) {
    if (!merged[section]) {
      merged[section] = {};
    }
    Object.assign(merged[section], yamlConfig[section]);
  }
  
  return merged;
}

/**
 * Inject config values into process.env for global access
 * Recursively flattens nested config: config.server.db.host -> process.env.SERVER_DB_HOST
 */
export function injectConfigToEnv(config: any, prefix = "") {
  for (const key in config) {
    const value = config[key];
    const envKey = prefix ? `${prefix}_${key.toUpperCase()}` : key.toUpperCase();
    
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Recursively handle nested objects
      injectConfigToEnv(value, envKey);
    } else {
      // Set scalar values (string, number, boolean, null, arrays)
      process.env[envKey] = Array.isArray(value) ? JSON.stringify(value) : String(value);
    }
  }
}

export type ServerOptions = {
  routerDir?: string; // where API handlers are organized (directory-based routing)
  staticDir?: string; // where built client lives
  port?: number;
  env?: "development" | "production";
  middleware?: ((app: Elysia) => void)[];
};

export async function createFrameworkServer(opts: ServerOptions = {}) {
  const isDev = opts.env === "development";
  
  // Load config from config.yaml and .env
  const config = loadConfig();
  const serverConfig = config.server || {};
  
  // Validate configuration
  try {
    validateServerConfig({
      port: opts.port ?? serverConfig.port,
      routerDir: opts.routerDir ?? serverConfig.router_dir,
      staticDir: opts.staticDir ?? serverConfig.static_dir,
    });
  } catch (error) {
    console.error("Configuration validation failed:", error);
    throw error;
  }
  
  // Inject config into process.env for global access
  injectConfigToEnv(config);
  
  const port = opts.port ?? parseInt(serverConfig.port as string) ?? 3000;
  const staticDir = opts.staticDir ?? serverConfig.static_dir ?? path.join(process.cwd(), "dist/client");
  const routerDir = opts.routerDir ?? serverConfig.router_dir ?? path.join(process.cwd(), "src/server/router");

  const app = new Elysia();

  // Apply custom middleware
  if (opts.middleware) {
    for (const middleware of opts.middleware) {
      middleware(app);
    }
  }

  // Health check endpoint - always available
  const startTime = Date.now();
  app.get("/health", (): HealthCheckResponse => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: (Date.now() - startTime) / 1000,
    version: process.env.npm_package_version || "1.0.0",
  }));

  // Auto-register API handlers: directory-based routing
  // Routes are defined by directory structure, handler must be in index.ts
  // Example: src/server/router/product/[id]/progress/index.ts -> /api/product/:id/progress
  // Middleware chains hierarchically: parent routes → child routes
  
  /**
   * Middleware type definitions
   */
  type MiddlewareFunc = (app: Elysia) => void;
  type RouteHandlerFunc = (c: any) => any | Promise<any>;
  interface RouteModule {
    default?: RouteHandlerFunc;
    GET?: RouteHandlerFunc;
    POST?: RouteHandlerFunc;
    PUT?: RouteHandlerFunc;
    PATCH?: RouteHandlerFunc;
    DELETE?: RouteHandlerFunc;
    middleware?: MiddlewareFunc | MiddlewareFunc[] | Record<string, MiddlewareFunc | MiddlewareFunc[]>;
  }

  /**
   * Separate route-level middleware from method-level middleware
   */
  const separateMiddleware = (middleware: any): {
    routeLevel: MiddlewareFunc[];
    methodLevel: Record<string, MiddlewareFunc[]>;
  } => {
    const HTTP_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
    const routeLevel: MiddlewareFunc[] = [];
    const methodLevel: Record<string, MiddlewareFunc[]> = {};

    if (Array.isArray(middleware)) {
      routeLevel.push(...middleware);
    } else if (typeof middleware === "function") {
      routeLevel.push(middleware);
    } else if (typeof middleware === "object") {
      for (const [key, value] of Object.entries(middleware)) {
        if (HTTP_METHODS.has(key)) {
          const arr = Array.isArray(value) ? value : [value as MiddlewareFunc];
          methodLevel[key] = arr;
        } else {
          const arr = Array.isArray(value) ? value : [value as MiddlewareFunc];
          routeLevel.push(...arr);
        }
      }
    }

    return { routeLevel, methodLevel };
  };

  /**
   * Collect middleware from all parent directories
   * parent route → child route → grandchild route
   */
  const collectParentMiddleware = async (pathParts: string[]): Promise<MiddlewareFunc[]> => {
    const collected: MiddlewareFunc[] = [];
    let currentDir = routerDir;

    for (let i = 0; i < pathParts.length - 1; i++) {
      currentDir = path.join(currentDir, pathParts[i]);
      const indexPath = path.join(currentDir, "index.ts");
      const indexPathJs = path.join(currentDir, "index.js");

      const resolvedPath = fs.existsSync(indexPath) ? indexPath : fs.existsSync(indexPathJs) ? indexPathJs : null;

      if (resolvedPath) {
        try {
          const mod = (await import(/* @vite-ignore */ resolvedPath)) as RouteModule;
          if (mod.middleware) {
            const { routeLevel } = separateMiddleware(mod.middleware);
            collected.push(...routeLevel);
          }
        } catch (e) {
          if (isDev) {
            console.warn(`Failed to load parent middleware from ${resolvedPath}:`, e);
          }
        }
      }
    }

    return collected;
  };

  /**
   * Apply middlewares to Elysia instance in order (parent → child)
   */
  const applyMiddlewares = (elysia: Elysia, middlewares: MiddlewareFunc[]): void => {
    for (const middleware of middlewares) {
      if (typeof middleware === "function") {
        middleware(elysia);
      }
    }
  };

  if (fs.existsSync(routerDir)) {
    try {
      /**
       * Recursively register handlers with hierarchical middleware support
       */
      const registerHandlers = async (dir: string, routePath = ""): Promise<void> => {
        const entries = fs.readdirSync(dir);

        for (const entry of entries) {
          const full = path.join(dir, entry);
          const stat = fs.statSync(full);

          if (stat.isDirectory()) {
            const nextPath = routePath ? `${routePath}/${entry}` : entry;
            const indexPath = path.join(full, "index.ts");
            const indexPathJs = path.join(full, "index.js");

            const resolvedPath = fs.existsSync(indexPath) ? indexPath : fs.existsSync(indexPathJs) ? indexPathJs : null;

            if (resolvedPath) {
              try {
                const mod = (await import(/* @vite-ignore */ resolvedPath)) as RouteModule;
                const route = "/api" + convertPathToRoute(nextPath);
                const pathParts = nextPath.split("/");

                // Collect all parent middlewares
                const parentMiddlewares = await collectParentMiddleware(pathParts);

                // Separate current route's middleware
                const currentMiddleware = mod.middleware ? separateMiddleware(mod.middleware) : { routeLevel: [], methodLevel: {} };

                // Combine parent + route-level middleware (in order)
                const allRouteMiddlewares = [...parentMiddlewares, ...currentMiddleware.routeLevel];

                // Register default handler if exists
                if (mod.default) {
                  if (allRouteMiddlewares.length > 0) {
                    const scopedApp = new Elysia({ prefix: route as any });
                    applyMiddlewares(scopedApp, allRouteMiddlewares);
                    scopedApp.get("/", mod.default as any);
                    app.use(scopedApp as any);
                  } else {
                    app.get(route, mod.default as any);
                  }
                }

                // Register HTTP method handlers
                const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
                for (const verb of HTTP_METHODS) {
                  const handler = mod[verb as keyof RouteModule] as RouteHandlerFunc | undefined;
                  if (handler) {
                    const methodSpecificMiddleware = currentMiddleware.methodLevel[verb] || [];
                    const allMethodMiddlewares = [...allRouteMiddlewares, ...methodSpecificMiddleware];

                    if (allMethodMiddlewares.length > 0) {
                      const methodScopedApp = new Elysia({ prefix: route as any });
                      applyMiddlewares(methodScopedApp, allMethodMiddlewares);
                      // @ts-ignore
                      methodScopedApp[verb.toLowerCase()]("/", handler);
                      app.use(methodScopedApp as any);
                    } else {
                      // @ts-ignore
                      app[verb.toLowerCase()](route, handler);
                    }

                    if (isDev) {
                      const mwInfo = allMethodMiddlewares.length > 0 ? ` (${allMethodMiddlewares.length} middlewares)` : "";
                      console.log(`Registered route: ${verb} ${route}${mwInfo}`);
                    }
                  }
                }
              } catch (error) {
                console.warn(`Failed to load route handler at ${resolvedPath}:`, error);
                if (isDev) {
                  throw new RouteDiscoveryError(routerDir, `Failed to load route handler at ${resolvedPath}`, error);
                }
              }
            }

            // Recurse into subdirectories
            await registerHandlers(full, nextPath);
          }
        }
      };

      await registerHandlers(routerDir);
    } catch (error) {
      if (error instanceof RouteDiscoveryError) {
        console.error("Route discovery error:", error.message);
        if (isDev) throw error;
      } else {
        console.warn("Failed to auto-register API handlers:", error instanceof Error ? error.message : error);
      }
    }
  } else if (isDev) {
    console.warn(`Router directory not found: ${routerDir}`);
  }

  // Static file serving (must come before SPA catch-all route)
  if (fs.existsSync(staticDir)) {
    // Serve assets with a specific route
    app.get("/assets/*", (c) => {
      const pathname = new URL(c.request.url).pathname;
      const filePath = path.join(staticDir, pathname);
      
      // Security: ensure the file is within staticDir
      const resolvedPath = path.resolve(filePath);
      const resolvedDir = path.resolve(staticDir);
      if (!resolvedPath.startsWith(resolvedDir)) {
        c.set.status = 404;
        return { error: "Not Found" };
      }
      
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return Bun.file(filePath);
      }
      
      c.set.status = 404;
      return { error: "Not Found" };
    });
  }

  // SPA fallback for client-side routing
  // Only serve index.html for non-API paths
  app.get("*", (c) => {
    const pathname = new URL(c.request.url).pathname;
    
    // Don't serve index.html for API routes or static assets
    if (pathname.startsWith("/api/") || pathname.startsWith("/assets/")) {
      c.set.status = 404;
      return { error: "Not Found" };
    }
    
    const index = path.join(staticDir, "index.html");
    if (fs.existsSync(index)) {
      const content = fs.readFileSync(index, 'utf-8');
      c.set.headers["Content-Type"] = "text/html; charset=utf-8";
      return content;
    }
    return { message: "Server running" };
  });

  return {
    app,
    listen: (p = port) => {
      console.log(`Server listening on port ${p}`);
      return app.listen(p);
    }
  };
}
