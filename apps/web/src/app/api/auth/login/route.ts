import { loginWithBackend } from "@/lib/auth/api";
import { applySessionCookies, errorResponse } from "@/lib/auth/route-handler";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await loginWithBackend(payload);
    const response = NextResponse.json(result);
    return applySessionCookies(response, result.data);
  } catch (error) {
    return errorResponse(error, "Đăng nhập không thành công.");
  }
}
