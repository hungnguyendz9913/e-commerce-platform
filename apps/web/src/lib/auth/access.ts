import type { AuthUser } from "./types";

export type ProtectedRole = "customer" | "admin";

export function requiredRoleForPath(pathname: string): ProtectedRole | null {
  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  if (
    pathname.startsWith("/customer") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/payment-result")
  ) {
    return "customer";
  }

  return null;
}

export function canAccessRole(user: Pick<AuthUser, "roles">, role: ProtectedRole) {
  return user.roles.includes(role);
}
