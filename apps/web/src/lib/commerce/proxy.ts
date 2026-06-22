import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/auth/api";
import { AUTH_ACCESS_COOKIE } from "@/lib/auth/constants";
import type { CommerceApiErrorBody } from "./types";

function backendCommerceUrl(path: string) {
  return `${getApiBaseUrl()}${path}`;
}

async function readBody(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const text = await request.text();
  return text || undefined;
}

async function readJson(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

export async function proxyCommerceRequest(
  request: Request,
  path: string,
  init?: RequestInit,
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập để tiếp tục." } satisfies CommerceApiErrorBody,
      { status: 401 },
    );
  }

  const response = await fetch(backendCommerceUrl(path), {
    ...init,
    method: init?.method ?? request.method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
    body: init?.body ?? (await readBody(request)),
    cache: "no-store",
  });
  const body = await readJson(response);

  return NextResponse.json(body, { status: response.status });
}
