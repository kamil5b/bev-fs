import type { UsersListRequest, UsersGetRequest, UsersCreateRequest } from "@shared/users/request.users";
import type { UsersListResponse, UsersGetResponse, UsersCreateResponse } from "@shared/users/response.users";

function qs(obj: Record<string, any>) {
  const p = Object.entries(obj)
    .filter(([,v]) => v !== undefined && v !== null && v !== "")
    .map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return p ? `?${p}` : "";
}

export const usersApi = {
  async list(req: UsersListRequest): Promise<UsersListResponse> {
    const q = qs(req as any);
    const res = await fetch(`/api/users${q}`);
    return res.json();
  },

  async get(req: UsersGetRequest): Promise<UsersGetResponse> {
    const res = await fetch(`/api/users/${req.id}`);
    return res.json();
  },

  async create(req: UsersCreateRequest): Promise<UsersCreateResponse> {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req)
    });
    return res.json();
  }
};
