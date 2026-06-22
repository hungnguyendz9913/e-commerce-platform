import {
  ADMIN_HOME_PATH,
  AUTH_FORBIDDEN_PATH,
  AUTH_LOGIN_PATH,
  AUTH_REGISTER_PATH,
  AUTH_UNAUTHORIZED_PATH,
  CUSTOMER_HOME_PATH,
} from "./constants";
import type { AuthUser } from "./types";

const blockedRedirectTargets = new Set([
  AUTH_LOGIN_PATH,
  AUTH_REGISTER_PATH,
  AUTH_UNAUTHORIZED_PATH,
  AUTH_FORBIDDEN_PATH,
]);

export function sanitizeRedirectTo(
  value: string | string[] | null | undefined,
  fallback = CUSTOMER_HOME_PATH,
) {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return fallback;
  }

  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return fallback;
  }

  let parsed: URL;

  try {
    parsed = new URL(raw, "https://shopvn.local");
  } catch {
    return fallback;
  }

  if (parsed.origin !== "https://shopvn.local") {
    return fallback;
  }

  if (blockedRedirectTargets.has(parsed.pathname)) {
    return fallback;
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function defaultAuthenticatedPath(user: Pick<AuthUser, "roles">) {
  return user.roles.includes("admin") ? ADMIN_HOME_PATH : CUSTOMER_HOME_PATH;
}

export function loginPathWithRedirect(pathname: string, search = "") {
  const redirectTo = sanitizeRedirectTo(`${pathname}${search}`);
  return `${AUTH_LOGIN_PATH}?redirectTo=${encodeURIComponent(redirectTo)}`;
}
