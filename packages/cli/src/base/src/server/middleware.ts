import { Elysia } from "elysia";

export function createLoggingMiddleware() {
  return (app: Elysia) => {
    app.derive((context) => {
      const timestamp = new Date().toISOString();
      const method = context.request?.method || "UNKNOWN";
      try {
        const pathname = new URL(context.request?.url || "", "http://localhost").pathname;
        console.log(`[INFO]  ${timestamp} - ${method} ${pathname} - ENTER`);
      } catch {
        // Silent fail
      }
      return {};
    });
  };
}
