import { getUsersService } from '@/server/services/user.service';
import { AppError } from '@/server/utils/response';

export class UserHandler {
  async getUsers(request: Request): Promise<Response> {
    try {
      const users = await getUsersService();
      return new Response(JSON.stringify(users), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
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
    }
    return new Response(JSON.stringify({ message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
