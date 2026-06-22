import type {
  ApiEnvelope,
  AuthSession,
  AuthUser,
  LoginPayload,
  LoginResponseData,
  RegisterPayload,
  RegisterResponseData,
} from "./types";
import { AuthApiError } from "./types";

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function clientFetch<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  });

  const body = await readJson<ApiEnvelope<T> & { message?: string | string[] }>(
    response,
  );

  if (!response.ok) {
    const rawMessage = body?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(" ")
      : rawMessage ?? "Không thể xử lý yêu cầu. Vui lòng thử lại.";
    throw new AuthApiError(message, response.status, body ?? undefined);
  }

  if (!body) {
    throw new AuthApiError("Phản hồi không hợp lệ.", response.status);
  }

  return body;
}

export async function login(payload: LoginPayload) {
  return clientFetch<LoginResponseData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterPayload) {
  return clientFetch<RegisterResponseData>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  return clientFetch<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function currentSession(): Promise<AuthSession> {
  try {
    const { data } = await clientFetch<AuthUser>("/api/auth/me");
    return { status: "authenticated", user: data };
  } catch {
    return { status: "guest", user: null };
  }
}
