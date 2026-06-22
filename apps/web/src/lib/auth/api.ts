import type {
  ApiEnvelope,
  AuthApiErrorBody,
  AuthUser,
  LoginPayload,
  LoginResponseData,
  RefreshResponseData,
  RegisterPayload,
  RegisterResponseData,
} from "./types";
import { AuthApiError } from "./types";

const DEFAULT_API_BASE_URL = "http://localhost:3000/api";

export function getApiBaseUrl() {
  return (
    process.env["SHOPVN_API_BASE_URL"] ??
    process.env["NEXT_PUBLIC_API_BASE_URL"] ??
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

export function backendAuthUrl(path: string) {
  return `${getApiBaseUrl()}/auth${path}`;
}

async function readErrorBody(response: Response) {
  try {
    return (await response.json()) as AuthApiErrorBody;
  } catch {
    return undefined;
  }
}

function errorMessage(status: number, body?: AuthApiErrorBody) {
  if (Array.isArray(body?.message)) {
    return body.message.join(" ");
  }

  if (body?.message) {
    return body.message;
  }

  if (status === 401) {
    return "Phiên đăng nhập không hợp lệ.";
  }

  if (status === 403) {
    return "Bạn không có quyền truy cập.";
  }

  return "Không thể xử lý yêu cầu. Vui lòng thử lại.";
}

export async function authFetch<T>(
  input: string,
  init?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new AuthApiError(errorMessage(response.status, body), response.status, body);
  }

  return (await response.json()) as ApiEnvelope<T>;
}

export function loginWithBackend(payload: LoginPayload) {
  return authFetch<LoginResponseData>(backendAuthUrl("/login"), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerWithBackend(payload: RegisterPayload) {
  return authFetch<RegisterResponseData>(backendAuthUrl("/register"), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshWithBackend(refreshToken: string) {
  return authFetch<RefreshResponseData>(backendAuthUrl("/refresh"), {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function logoutWithBackend(accessToken: string) {
  return authFetch<{ success: boolean }>(backendAuthUrl("/logout"), {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}

export function meWithBackend(accessToken: string) {
  return authFetch<AuthUser>(backendAuthUrl("/me"), {
    method: "GET",
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}
