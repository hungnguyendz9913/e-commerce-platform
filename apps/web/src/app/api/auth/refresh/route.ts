import { refreshWithBackend } from "@/lib/auth/api";
import { AUTH_REFRESH_COOKIE } from "@/lib/auth/constants";
import {
  applySessionCookies,
  clearSessionCookies,
  errorResponse,
} from "@/lib/auth/route-handler";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return clearSessionCookies(
      NextResponse.json({ message: "Phiên đăng nhập không hợp lệ." }, { status: 401 }),
    );
  }

  try {
    const result = await refreshWithBackend(refreshToken);
    const response = NextResponse.json(result);
    return applySessionCookies(response, result.data);
  } catch (error) {
    const response = errorResponse(error, "Không thể làm mới phiên đăng nhập.");
    return clearSessionCookies(response);
  }
}
