import path from 'path';
import { createLoggingMiddleware } from './middleware';

(async () => {
  const { createFrameworkServer } = await import('bev-fs');
  const { app, listen } = await createFrameworkServer({
    apiDir: path.join(process.cwd(), 'src/server/api'),
    staticDir: path.join(process.cwd(), 'dist/client'),
    port: Number(process.env.PORT) || 3000,
    middleware: [createLoggingMiddleware()]
  });

  await listen();
  console.log('Server listening on port', process.env.PORT || 3000);
})();
