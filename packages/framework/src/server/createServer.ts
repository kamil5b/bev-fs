import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import path from "path";
import fs from "fs";

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
  const apiDir = opts.apiDir ?? path.join(process.cwd(), "src/server/api");

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

  // Auto-register API handlers: export functions named by HTTP verb or default to handler
  try {
    if (fs.existsSync(apiDir)) {
      const registerHandlers = async (dir: string, prefix = "") => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const full = path.join(dir, file);
          const stat = fs.statSync(full);
          
          if (stat.isDirectory()) {
            // Recursively handle subdirectories
            // Convert directory name: product.[id] -> product/:id
            let dirPath = file.replace(/\[(\w+)\]/g, ":$1"); // product.[id] -> product.:id
            dirPath = dirPath.replace(/\./g, "/"); // product.:id -> product/:id
            await registerHandlers(full, prefix + "/" + dirPath);
            continue;
          }
          
          if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;
          
          // dynamic import
          const mod = await import(full);
          
          // Convert file name to route: product.[id].ts -> /api/product/:id
          let routePath = file.replace(/\.(t|j)sx?$/, ""); // product.[id]
          routePath = routePath.replace(/\[(\w+)\]/g, ":$1"); // product.:id -> fix dot
          routePath = routePath.replace(/\./g, "/"); // product/:id
          const route = "/api" + prefix + "/" + routePath;
          
          
          if (mod.default) {
            app.get(route, mod.default as any);
          }
          
          // allow named exports: get/post/put/patch/delete
          ["GET", "POST", "PUT", "PATCH", "DELETE"].forEach((verb) => {
            // const handlerKey = verb === "DELETE" ? "delete_handler" : verb.toLowerCase();
            const handler = mod[verb] || (verb === "DELETE" && mod.delete_handler);
            if (handler) {
              // @ts-ignore
              app[verb.toLowerCase()](route, handler);
              console.log(`Registering route: ${verb} ${route} from file ${file}`);
            }
          });
        }
      };
      
      await registerHandlers(apiDir);
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
