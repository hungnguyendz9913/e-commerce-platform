import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_ACCESS_COOKIE,
  AUTH_COOKIE_PATH,
  AUTH_REFRESH_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "./constants";

export function authCookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: AUTH_COOKIE_PATH,
    maxAge,
  };
}

export function accessCookieOptions() {
  return authCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS);
}

export function refreshCookieOptions() {
  return authCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS);
}

export function expiredAuthCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: AUTH_COOKIE_PATH,
    maxAge: 0,
  };
}

export const authCookieNames = {
  access: AUTH_ACCESS_COOKIE,
  refresh: AUTH_REFRESH_COOKIE,
};
