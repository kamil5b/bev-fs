import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import path from "path";
import users from "./routes/users.routes";
import { initDb } from "./db/pg";

await initDb();

const app = new Elysia();

app.use(
  staticPlugin({
    assets: path.join(import.meta.dir, "../../public"),
    indexHTML: true
  })
);

// mount API under /api
app.group("/api", api => api.use(users));

const PORT = Number(process.env.APP_PORT ?? 3000);
app.listen(PORT);

console.log(`🟢 Server running on http://localhost:${PORT}`);
