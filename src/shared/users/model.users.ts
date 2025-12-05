import type { UserRole } from "./enum.users";

export interface User {
  id: number;
  name: string;
  role: UserRole;
}
