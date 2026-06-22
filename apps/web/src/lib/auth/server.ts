import { cookies } from "next/headers";
import { meWithBackend, refreshWithBackend } from "./api";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "./constants";
import type { AuthSession } from "./types";

export async function getCurrentUserFromCookies(): Promise<AuthSession> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(AUTH_REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return { status: "guest", user: null };
  }

  if (accessToken) {
    try {
      const { data: user } = await meWithBackend(accessToken);
      return { status: "authenticated", user };
    } catch {
      // Try the refresh token below before falling back to guest chrome.
    }
  }

  if (!refreshToken) {
    return { status: "guest", user: null };
  }

  try {
    const refreshed = await refreshWithBackend(refreshToken);
    const { data: user } = await meWithBackend(refreshed.data.accessToken);
    return { status: "authenticated", user };
  } catch {
    return { status: "guest", user: null };
  }
}

export function hasRole(
  user: { roles: string[] } | null | undefined,
  role: "customer" | "admin",
) {
  return Boolean(user?.roles.includes(role));
}
