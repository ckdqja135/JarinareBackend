export interface AuthUser {
  idx: number;
  email: string;
  role: UserRole;
}

export type UserRole = "user" | "admin";
