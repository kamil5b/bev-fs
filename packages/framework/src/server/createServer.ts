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
};

export async function createFrameworkServer(opts: ServerOptions = {}) {
  const port = opts.port ?? 3000;
  const staticDir = opts.staticDir ?? path.join(process.cwd(), "dist/client");
  const apiDir = opts.apiDir ?? path.join(process.cwd(), "src/server/api");

  const app = new Elysia();

  // Static asset serving
  if (fs.existsSync(staticDir)) {
    app.use(staticPlugin({ assets: staticDir, prefix: "/" }));
  }

  // Auto-register API handlers: export functions named by HTTP verb or default to handler
  try {
    if (fs.existsSync(apiDir)) {
      const files = fs.readdirSync(apiDir).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
      for (const file of files) {
        const full = path.join(apiDir, file);
        // dynamic import
        // note: Bun supports file:// import; adjust for environment
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = await import(full);
        if (mod.default) {
          // mount at /api/<name>
          const route = "/api/" + file.replace(/\.(t|j)sx?$/, "");
          app.get(route, mod.default as any);
        }
        // allow named exports: get/post/put/delete
        ["get", "post", "put", "delete"].forEach((verb) => {
          if (mod[verb]) {
            const route = "/api/" + file.replace(/\.(t|j)sx?$/, "");
            // @ts-ignore
            app[verb](route, mod[verb]);
          }
        });
      }
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
