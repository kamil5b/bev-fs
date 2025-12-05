import { usersRepository } from "../repository/users.repository";
import type { UsersListRequest, UsersCreateRequest } from "@shared/users/request.users";

export const usersService = {
  async list(params: UsersListRequest) {
    // you could add more business rules here
    return usersRepository.findAndCount(params);
  },

  async get(id: number) {
    const user = await usersRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  },

  async create(payload: UsersCreateRequest) {
    if (!payload.name || payload.name.length < 2) throw new Error("Invalid name");
    return usersRepository.create(payload);
  }
};
