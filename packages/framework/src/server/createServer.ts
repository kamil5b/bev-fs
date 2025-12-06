import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import path from "path";
import fs from "fs";
import { convertDirNameToSegment, convertPathToRoute } from "../shared/createRoute";

export type ServerOptions = {
  routesDir?: string; // path to shared route defs
  apiDir?: string; // where api handlers live
  staticDir?: string; // where built client lives
  port?: number;
  env?: "development" | "production";
  middleware?: ((app: Elysia) => void)[];
};

export async function createFrameworkServer(opts: ServerOptions = {}) {
  const port = opts.port ?? 3000;
  const staticDir = opts.staticDir ?? path.join(process.cwd(), "dist/client");
  const routerDir = opts.apiDir ?? path.join(process.cwd(), "src/server/router");

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
              
              if (mod.default) {
                app.get(route, mod.default as any);
              }
              
              // Allow named exports: GET, POST, PUT, PATCH, DELETE
              ["GET", "POST", "PUT", "PATCH", "DELETE"].forEach((verb) => {
                const handler = mod[verb] || (verb === "DELETE" && mod.delete_handler);
                if (handler) {
                  // @ts-ignore
                  app[verb.toLowerCase()](route, handler);
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
