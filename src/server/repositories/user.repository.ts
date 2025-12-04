import { PoolClient } from 'pg';
import { UserEntity } from '@/shared/entities';

// Example: Get all users (soft delete aware)
export async function getUsers(client: PoolClient): Promise<UserEntity[]> {
  const res = await client.query('SELECT * FROM users WHERE deleted_at IS NULL');
  return res.rows;
}

// Add other CRUD methods (create, update, delete) as needed
