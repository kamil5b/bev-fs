import path from 'path';
import { createLoggingMiddleware } from './middleware';

(async () => {
  const { createFrameworkServer } = await import('bev-fs');
  const isDev = process.env.NODE_ENV !== 'production';
  const port = Number(process.env.SERVER_PORT) || 3000;
  
  try {
    const { app, listen } = await createFrameworkServer({
      routerDir: path.join(process.cwd(), 'src/server/router'),
      staticDir: path.join(process.cwd(), 'dist/client'),
      port,
      env: isDev ? 'development' : 'production',
      middleware: [createLoggingMiddleware()]
    });

    await listen();
    if (isDev) console.log(`✅ Server running on port ${port}`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
