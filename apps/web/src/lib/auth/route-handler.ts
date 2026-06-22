import { NextResponse } from "next/server";
import {
  accessCookieOptions,
  authCookieNames,
  expiredAuthCookieOptions,
  refreshCookieOptions,
} from "./cookies";
import type { LoginResponseData, RefreshResponseData } from "./types";

export function jsonResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function applySessionCookies(
  response: NextResponse,
  tokens: Pick<LoginResponseData, "accessToken" | "refreshToken"> | RefreshResponseData,
) {
  response.cookies.set(
    authCookieNames.access,
    tokens.accessToken,
    accessCookieOptions(),
  );
  response.cookies.set(
    authCookieNames.refresh,
    tokens.refreshToken,
    refreshCookieOptions(),
  );
  return response;
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(authCookieNames.access, "", expiredAuthCookieOptions());
  response.cookies.set(authCookieNames.refresh, "", expiredAuthCookieOptions());
  return response;
}

export function errorResponse(error: unknown, fallbackMessage: string) {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 500;
  const message = error instanceof Error ? error.message : fallbackMessage;

  return NextResponse.json({ message }, { status });
}
