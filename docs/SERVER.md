
## 🔄 Refactored Server Architecture Guide (Bun Monolith Edition)

This guide adapts the strict 3-layer architecture to the **Bun runtime** environment, replacing Next.js constructs with Bun-native server structures.

-----

## 📁 Directory Structure (Bun Monolith)

The structure remains clean, utilizing path aliases defined in `tsconfig.json`.

```
src/server/
├── db/              # Database connection management (pool.ts, client.ts)
├── handlers/        # HTTP request handlers
├── services/        # Business logic + Transaction management
├── repositories/    # Data access layer (raw SQL)
└── utils/           # Utility functions (auth, response, email)
```

-----

## 🏗️ Architecture Overview

The core three-layer architecture is maintained.

### Layer Responsibilities (No Change)

1.  **Handlers** (`handlers/`): **HTTP ONLY**. Parse raw `Request` objects, call service, format standard `Response` objects.
2.  **Services** (`services/`): **BUSINESS LOGIC + TRANSACTION MANAGEMENT**. Orchestrates repositories, handles `BEGIN/COMMIT/ROLLBACK`.
3.  **Repositories** (`repositories/`): **DATA ACCESS ONLY**. Executes raw SQL using the `PoolClient` passed from the service.

-----

## 📋 Module Structure (Bun Refactor)

The following examples replace `NextRequest` and `NextResponse` with standard **Bun/Web API** `Request` and `Response` objects.

### Handler (HTTP Layer)

The handler uses Bun's global `Request` object and constructs a standard `Response`. It utilizes `JSON.stringify` and standard headers.

```typescript
// src/server/handlers/user.handler.ts (Bun Refactored)
import { createUserService } from '@/server/services/user.service';
import { AppError } from '@/server/utils/response';

export class UserHandler {
  private userService = createUserService();

  // ✅ Accepts standard Web API Request
  async getUsers(request: Request): Promise<Response> { 
    try {
      // 1. Parse request parameters (HTTP concerns only)
      const { searchParams } = new URL(request.url);
      const params: GetUsersRequest = {
        page: searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1,
        limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 10,
        search: searchParams.get("search") || undefined,
      };

      // 2. Call service (NO business logic here)
      const result = await this.userService.getUsers(params);

      // 3. Return standard Response with JSON body
      return new Response(JSON.stringify(result), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });

    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): Response {
    let status = 500;
    let message = 'Internal server error';

    if (error instanceof AppError) {
      status = error.statusCode;
      message = error.message;
    } else {
      console.error('Unexpected error:', error);
    }

    // Return standardized error response
    return new Response(JSON.stringify({ message, requestedAt: new Date().toISOString(), requestId: crypto.randomUUID() }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Service and Repository (No Code Change Required)

The **Service** and **Repository** examples provided in the original prompt are **framework-agnostic** (they rely only on `pg` and standard TypeScript/JavaScript logic). Therefore, the critical patterns for **Transaction Management** and **SQL Data Access** remain 100% correct:

  * **Service**: Manages `client.query('BEGIN/COMMIT/ROLLBACK')` and `client.release()`.
  * **Repository**: Accepts `client: PoolClient` and executes raw SQL.
  * **Data Mapping**: Uses `mapRowToUser` to handle PostgreSQL's `snake_case` to TypeScript's `camelCase`.

-----

## 🚀 Usage Examples (Bun Router)

This section shows how the handler is integrated into the central Bun server file, replacing the Next.js routing convention.

### Using in Bun Routes (`src/server/index.ts`)

The central server file uses a simple routing mechanism (like the built-in Bun server or a minimal router like Elysia/Hono) to map paths to the handler methods.

```typescript
// src/server/index.ts (Simplified Bun Server Entry Point)
import { UserHandler } from '@/server/handlers/user.handler';
import { authMiddleware } from '@/server/utils/auth'; // Custom middleware

const userHandler = new UserHandler();

// Define a simple request routing function
const router = async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // --- Private API Routes ---
    if (path.startsWith('/api/') && path !== '/api/auth/login' && path !== '/api/auth/register') {
        // 1. Apply authentication middleware
        const authResult = await authMiddleware(request);
        if (authResult instanceof Response) return authResult; // Authentication failed

        // 2. Route the authenticated request
        if (path === '/api/users' && method === 'GET') {
            // ✅ Minimal wrapper calls the handler
            return userHandler.getUsers(request); 
        }
        
        // ... other private routes ...
    }
    
    // --- Public API Routes ---
    if (path === '/api/auth/login' && method === 'POST') {
        const authHandler = new AuthHandler();
        return authHandler.handleLogin(request);
    }
    
    // Fallback: Serve Vue Client for any non-API request
    // This is handled by a static file server or a dedicated client route
    if (!path.startsWith('/api/')) {
        // Assume Bun serves ./dist/client/index.html for all client routes
        return new Response(Bun.file("./dist/client/index.html"), {
            headers: { 'Content-Type': 'text/html' }
        });
    }

    // 404 Not Found
    return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
};

// Start the Bun server
Bun.serve({
    port: 3000,
    fetch: router,
});
```

### Middleware Protection (Bun Native)

The `authMiddleware` replaces the `middleware.ts` concept in Next.js, acting as a standard Web API filter.

```typescript
// src/server/utils/auth.ts (authMiddleware function)
import { verifyToken } from './auth';

// Middleware returns Response on failure, or null/undefined on success
export const authMiddleware = async (request: Request): Promise<Response | null> => {
    const token = extractToken(request); // Helper to get token from Cookie/Bearer header

    if (!token) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    try {
        const payload = verifyToken(token);
        // Attach user info to the request/context if needed
        (request as any).user = payload; 
    } catch (e) {
        return new Response(JSON.stringify({ message: 'Forbidden: Invalid token' }), { status: 403 });
    }

    return null; // Continue processing the request
};
```