import { NextRequest, NextResponse } from "next/server";
import { meWithBackend, refreshWithBackend } from "@/lib/auth/api";
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from "@/lib/auth/constants";
import {
  accessCookieOptions,
  expiredAuthCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth/cookies";
import { loginPathWithRedirect } from "@/lib/auth/redirects";
import { canAccessRole, requiredRoleForPath } from "@/lib/auth/access";

function applyRefreshedCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  response.cookies.set(
    AUTH_ACCESS_COOKIE,
    tokens.accessToken,
    accessCookieOptions(),
  );
  response.cookies.set(
    AUTH_REFRESH_COOKIE,
    tokens.refreshToken,
    refreshCookieOptions(),
  );
  return response;
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_ACCESS_COOKIE, "", expiredAuthCookieOptions());
  response.cookies.set(AUTH_REFRESH_COOKIE, "", expiredAuthCookieOptions());
  return response;
}

function redirectToLogin(request: NextRequest) {
  const destination = loginPathWithRedirect(
    request.nextUrl.pathname,
    request.nextUrl.search,
  );
  return clearAuthCookies(NextResponse.redirect(new URL(destination, request.url)));
}

function redirectForbidden(request: NextRequest) {
  return NextResponse.redirect(new URL("/forbidden", request.url));
}

export async function middleware(request: NextRequest) {
  const requiredRole = requiredRoleForPath(request.nextUrl.pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  let accessToken = request.cookies.get(AUTH_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;
  let refreshedTokens: { accessToken: string; refreshToken: string } | null = null;

  if (!accessToken && refreshToken) {
    try {
      const refreshed = await refreshWithBackend(refreshToken);
      refreshedTokens = refreshed.data;
      accessToken = refreshed.data.accessToken;
    } catch {
      return redirectToLogin(request);
    }
  }

  if (!accessToken) {
    return redirectToLogin(request);
  }

  try {
    const { data: user } = await meWithBackend(accessToken);

    if (!canAccessRole(user, requiredRole)) {
      return redirectForbidden(request);
    }

    const response = NextResponse.next();
    return refreshedTokens ? applyRefreshedCookies(response, refreshedTokens) : response;
  } catch {
    if (!refreshToken) {
      return redirectToLogin(request);
    }

    try {
      const refreshed = await refreshWithBackend(refreshToken);
      const { data: user } = await meWithBackend(refreshed.data.accessToken);

      if (!canAccessRole(user, requiredRole)) {
        return redirectForbidden(request);
      }

      return applyRefreshedCookies(NextResponse.next(), refreshed.data);
    } catch {
      return redirectToLogin(request);
    }
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/customer/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/payment-result/:path*",
  ],
};
