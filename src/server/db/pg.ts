import { Client } from "pg";

export const pg = new Client({
  host: process.env.PG_HOST ?? "localhost",
  port: Number(process.env.PG_PORT ?? 5432),
  database: process.env.PG_DATABASE ?? "app",
  user: process.env.PG_USER ?? "postgres",
  password: process.env.PG_PASSWORD ?? "postgres"
});

await pg.connect();

export async function initDb() {
  const sql = await Bun.file(import.meta.dir + "/migrations/init.sql").text();
  await pg.query(sql);
}
