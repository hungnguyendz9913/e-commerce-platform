export type AuthRole = "guest" | "customer" | "admin" | (string & {});

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  roles: AuthRole[];
  status?: string;
}

export interface GuestSession {
  status: "guest";
  user: null;
}

export interface AuthenticatedSession {
  status: "authenticated";
  user: AuthUser;
}

export type AuthSession = GuestSession | AuthenticatedSession;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: Omit<AuthUser, "phone" | "status">;
}

export interface RegisterResponseData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface RefreshResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface ApiEnvelope<T> {
  data: T;
}

export interface AuthApiErrorBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  code?: string;
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: AuthApiErrorBody,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}
