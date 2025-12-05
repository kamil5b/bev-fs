import { pg } from "../db/pg";
import type { User } from "@shared/users/model.users";
import type { UsersListRequest, UsersCreateRequest } from "@shared/users/request.users";

function buildWhere(params: UsersListRequest) {
  const clauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (params.q) {
    clauses.push(`name ILIKE $${idx++}`);
    values.push(`%${params.q}%`);
  }

  if (params.role) {
    clauses.push(`role = $${idx++}`);
    values.push(params.role);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, values };
}

export const usersRepository = {
  async findAndCount(params: UsersListRequest) {
    const page = Math.max(1, params.page ?? 1);
    const perPage = Math.min(100, Math.max(1, params.perPage ?? 10));
    const offset = (page - 1) * perPage;

    const allowedSortBy = ["id", "name", "role"];
    const sortBy = allowedSortBy.includes(params.sortBy ?? "") ? params.sortBy! : "id";
    const sortOrder = params.sortOrder === "desc" ? "DESC" : "ASC";

    const { where, values } = buildWhere(params);

    const countSQL = `SELECT COUNT(*) AS count FROM users ${where}`;
    const countRes = await pg.query(countSQL, values);
    const total = Number(countRes.rows[0]?.count ?? 0);

    const itemsSQL = `SELECT id, name, role FROM users ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT $${values.length+1} OFFSET $${values.length+2}`;
    const itemsRes = await pg.query(itemsSQL, [...values, perPage, offset]);
    const items = itemsRes.rows as User[];

    return { items, total, page, perPage };
  },

  async findById(id: number) {
    const res = await pg.query("SELECT id, name, role FROM users WHERE id = $1", [id]);
    return res.rows[0] ?? null;
  },

  async create(payload: UsersCreateRequest) {
    const res = await pg.query(
      "INSERT INTO users (name, role) VALUES ($1, $2) RETURNING id, name, role",
      [payload.name, payload.role]
    );
    return res.rows[0] as User;
  }
};
