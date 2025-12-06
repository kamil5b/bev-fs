import type { UserAPI } from '../../shared/api';

const users: UserAPI.GetListResponse['users'] = [];

// GET /api/users - list all users
export const GET = (): UserAPI.GetListResponse => {
  return { users };
};

// POST /api/users - create a user
export const POST = ({ body }: any): UserAPI.CreateResponse => {
  const req = body as UserAPI.CreateRequest;
  const newUser = {
    id: Math.max(...users.map(u => u.id), 0) + 1,
    ...req
  };
  users.push(newUser);
  return { created: newUser };
};
