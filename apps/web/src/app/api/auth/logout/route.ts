import { logoutWithBackend } from "@/lib/auth/api";
import { AUTH_ACCESS_COOKIE } from "@/lib/auth/constants";
import { clearSessionCookies } from "@/lib/auth/route-handler";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;

  if (accessToken) {
    try {
      await logoutWithBackend(accessToken);
    } catch {
      // Local cleanup still succeeds when the server session is already gone.
    }
  }

  return clearSessionCookies(NextResponse.json({ data: { success: true } }));
}
