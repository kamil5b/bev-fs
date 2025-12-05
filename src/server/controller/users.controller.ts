import { usersService } from "../service/users.service";
import { ok, fail } from "../utils/response";
import type { UsersListRequest } from "@shared/users/request.users";
import type { UsersGetRequest } from "@shared/users/request.users";
import type { UsersCreateRequest } from "@shared/users/request.users";

export const usersController = {
  async list(ctx: any) {
    const request: UsersListRequest = {
      page: ctx.query.page ? Number(ctx.query.page) : undefined,
      perPage: ctx.query.perPage ? Number(ctx.query.perPage) : undefined,
      sortBy: ctx.query.sortBy,
      sortOrder: ctx.query.sortOrder as "asc" | "desc" | undefined,
      q: ctx.query.q,
      role: ctx.query.role
    };

    try {
      const { items, total, page, perPage } = await usersService.list(request);
      const meta = { total, page, perPage, totalPages: Math.ceil(total / perPage) || 0 };
      return ok({ items, meta }, request);
    } catch (err) {
      return fail(err, request);
    }
  },

  async get(ctx: any) {
    const request: UsersGetRequest = { id: Number(ctx.params.id) };
    try {
      const data = await usersService.get(request.id);
      return ok(data, request);
    } catch (err) {
      return fail(err, request);
    }
  },

  async create(ctx: any) {
    const request: UsersCreateRequest = ctx.body;
    try {
      const data = await usersService.create(request);
      return ok(data, request);
    } catch (err) {
      return fail(err, request);
    }
  }
};
