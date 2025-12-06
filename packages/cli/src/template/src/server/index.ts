import path from 'path';
import { createLoggingMiddleware } from './middleware';

(async () => {
  const { createFrameworkServer } = await import('bev-fs');
  const { app, listen } = await createFrameworkServer({
    routerDir: path.join(process.cwd(), 'src/server/router'), //optional - can be removed
    staticDir: path.join(process.cwd(), 'dist/client'), //optional - can be removed
    port: Number(process.env.SERVER_PORT) || 3000,
    middleware: [createLoggingMiddleware()]
  });

  await listen();
  console.log('Server listening on port', process.env.SERVER_PORT || 3000);
})();
