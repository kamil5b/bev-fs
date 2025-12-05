import { createFrameworkServer } from '@myfw/runtime';
import path from 'path';
(async () => {
    const { app, listen } = await createFrameworkServer({
        apiDir: path.join(process.cwd(), 'src/server/api'),
        staticDir: path.join(process.cwd(), 'dist/client'),
        port: Number(process.env.PORT) || 3000
    });
    await listen();
    console.log('Server listening on port', process.env.PORT || 3000);
})();
