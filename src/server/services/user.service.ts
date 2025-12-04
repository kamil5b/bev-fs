import { getDbClient } from '@/server/db/client';
import * as userRepository from '@/server/repositories/user.repository';
import { AppError } from '@/server/utils/response';

export async function getUsersService() {
  const client = await getDbClient();
  try {
    await client.query('BEGIN');
    const users = await userRepository.getUsers(client);
    await client.query('COMMIT');
    return users;
  } catch (error) {
    await client.query('ROLLBACK');
    throw new AppError('Failed to get users', 500);
  } finally {
    client.release();
  }
}
// Add other CRUD service methods as needed
