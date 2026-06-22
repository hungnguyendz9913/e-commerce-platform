import { meWithBackend, refreshWithBackend } from "@/lib/auth/api";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "@/lib/auth/constants";
import {
  applySessionCookies,
  clearSessionCookies,
  errorResponse,
} from "@/lib/auth/route-handler";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(AUTH_REFRESH_COOKIE)?.value;
  let refreshedTokens: { accessToken: string; refreshToken: string } | null = null;

  if (!accessToken && refreshToken) {
    try {
      const refreshed = await refreshWithBackend(refreshToken);
      accessToken = refreshed.data.accessToken;
      refreshedTokens = refreshed.data;
    } catch (error) {
      const errorResult = errorResponse(error, "Phiên đăng nhập không hợp lệ.");
      return clearSessionCookies(errorResult);
    }
  }

  if (!accessToken) {
    return clearSessionCookies(
      NextResponse.json({ message: "Phiên đăng nhập không hợp lệ." }, { status: 401 }),
    );
  }

  try {
    const result = await meWithBackend(accessToken);
    const json = NextResponse.json(result);
    return refreshedTokens ? applySessionCookies(json, refreshedTokens) : json;
  } catch (error) {
    if (refreshToken) {
      try {
        const refreshed = await refreshWithBackend(refreshToken);
        const result = await meWithBackend(refreshed.data.accessToken);
        const json = applySessionCookies(NextResponse.json(result), refreshed.data);
        return json;
      } catch {
        // Fall through to the original unauthenticated cleanup.
      }
    }

    const errorResult = errorResponse(error, "Phiên đăng nhập không hợp lệ.");
    return clearSessionCookies(errorResult);
  }
}
