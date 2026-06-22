import { registerWithBackend } from "@/lib/auth/api";
import { errorResponse, jsonResponse } from "@/lib/auth/route-handler";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await registerWithBackend(payload);
    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error, "Đăng ký không thành công.");
  }
}
