import { UserHandler } from '@/server/handlers/user.handler';
// import { authMiddleware } from '@/server/utils/auth'; // To be implemented

const userHandler = new UserHandler();

const router = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (path === '/api/users' && method === 'GET') {
    return userHandler.getUsers(request);
  }
  // ...other routes...

  return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
};

Bun.serve({
  port: 3000,
  fetch: router,
});
