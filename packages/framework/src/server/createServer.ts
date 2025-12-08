import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import path from "path";
import fs from "fs";
import { convertPathToRoute } from "../shared/createRoute";

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
  // Load config from config.yaml and .env
  const config = loadConfig();
  const serverConfig = config.server || {};
  
  // Inject config into process.env for global access
  injectConfigToEnv(config);
  
  const port = opts.port ?? parseInt(serverConfig.port) ?? 3000;
  const staticDir = opts.staticDir ?? serverConfig.static_dir ?? path.join(process.cwd(), "dist/client");
  const routerDir = opts.routerDir ?? serverConfig.router_dir ?? path.join(process.cwd(), "src/server/router");

  const app = new Elysia();

  // Apply custom middleware
  if (opts.middleware) {
    for (const middleware of opts.middleware) {
      middleware(app);
    }
  }

  // Static asset serving
  if (fs.existsSync(staticDir)) {
    app.use(staticPlugin({ assets: staticDir, prefix: "/" }));
  }

  // Auto-register API handlers: directory-based routing
  // Routes are defined by directory structure, handler must be in index.ts
  // Example: src/server/router/product/[id]/progress/index.ts -> /api/product/:id/progress
  try {
    if (fs.existsSync(routerDir)) {
      const registerHandlers = async (dir: string, routePath = "") => {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const full = path.join(dir, entry);
          const stat = fs.statSync(full);
          
          if (stat.isDirectory()) {
            // Build the route path: product/[id]/progress
            const nextPath = routePath ? `${routePath}/${entry}` : entry;
            
            // Check if index.ts exists in this directory
            const indexPath = path.join(full, "index.ts");
            const indexPathJs = path.join(full, "index.js");
            
            if (fs.existsSync(indexPath) || fs.existsSync(indexPathJs)) {
              // Register handlers from index.ts
              const resolvedPath = fs.existsSync(indexPath) ? indexPath : indexPathJs;
              const mod = await import(/* @vite-ignore */ resolvedPath);
              
              // Convert path to route: product/[id]/progress -> /product/:id/progress
              const route = "/api" + convertPathToRoute(nextPath);
              
              // Check if middleware is route-level or per-method
              const routeMiddleware = mod.middleware && !mod.middleware.GET && !mod.middleware.POST && !mod.middleware.PUT && !mod.middleware.PATCH && !mod.middleware.DELETE
                ? mod.middleware
                : null;
              
              // Register default export handler if it exists
              if (mod.default) {
                const handler = mod.default;
                
                if (routeMiddleware) {
                  // Create a scoped app for this route with middleware
                  const scopedApp = new Elysia({ prefix: route });
                  if (Array.isArray(routeMiddleware)) {
                    routeMiddleware.forEach((middleware: any) => scopedApp.use(middleware));
                  } else if (typeof routeMiddleware === "function") {
                    scopedApp.use(routeMiddleware);
                  }
                  scopedApp.get("/", handler as any);
                  app.use(scopedApp as any);
                } else {
                  app.get(route, handler as any);
                }
              }
              
              // Register named HTTP method handlers: GET, POST, PUT, PATCH, DELETE
              ["GET", "POST", "PUT", "PATCH", "DELETE"].forEach((verb) => {
                const handler = mod[verb] || (verb === "DELETE" && mod.delete_handler);
                if (handler) {
                  // Check for per-method middleware
                  const methodMiddleware = mod.middleware?.[verb];
                  
                  if (methodMiddleware) {
                    // Create a scoped app for this specific method with middleware
                    const methodScopedApp = new Elysia({ prefix: route });
                    
                    if (Array.isArray(methodMiddleware)) {
                      methodMiddleware.forEach((middleware: any) => methodScopedApp.use(middleware));
                    } else if (typeof methodMiddleware === "function") {
                      methodScopedApp.use(methodMiddleware);
                    }
                    
                    // @ts-ignore
                    methodScopedApp[verb.toLowerCase()]("/", handler);
                    app.use(methodScopedApp as any);
                  } else if (routeMiddleware) {
                    // Route already has middleware, skip (default export would have registered it)
                  } else {
                    // Register directly on main app
                    // @ts-ignore
                    app[verb.toLowerCase()](route, handler);
                  }
                  
                  console.log(`Registering route: ${verb} ${route} from ${entry}/index.ts`);
                }
              });
            }
            
            // Continue recursing for nested directories
            await registerHandlers(full, nextPath);
          }
        }
      };
      
      await registerHandlers(routerDir);
    }
  } catch (e) {
    console.warn("Failed to auto-register api handlers", e);
  }

  // SPA fallback for client-side routing
  app.get("*", (c) => {
    const index = path.join(staticDir, "index.html");
    if (fs.existsSync(index)) return Bun.file(index);
    return { message: "Server running" };
  });

  return {
    app,
    listen: (p = port) => app.listen(p)
  };
}
