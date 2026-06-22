import { AdminApiError, type AdminApiErrorBody } from "./types";

function errorMessage(status: number, body?: AdminApiErrorBody) {
  if (Array.isArray(body?.message)) {
    return body.message.join(" ");
  }

  if (body?.message) {
    return body.message;
  }

  if (status === 401) {
    return "Vui lòng đăng nhập bằng tài khoản quản trị.";
  }

  if (status === 403) {
    return "Tài khoản của bạn không có quyền quản trị.";
  }

  if (status === 404) {
    return "Không tìm thấy dữ liệu quản trị cần xử lý.";
  }

  if (status === 409) {
    return "Dữ liệu quản trị đã thay đổi. Vui lòng tải lại rồi thử lại.";
  }

  if (status === 422 || status === 400) {
    return "Yêu cầu chưa hợp lệ. Vui lòng kiểm tra lại.";
  }

  if (status >= 500) {
    return "Hệ thống quản trị tạm thời chưa xử lý được yêu cầu. Vui lòng thử lại sau.";
  }

  return "Không thể xử lý yêu cầu quản trị. Vui lòng thử lại.";
}

async function readErrorBody(response: Response) {
  try {
    return (await response.json()) as AdminApiErrorBody;
  } catch {
    return undefined;
  }
}

export function buildAdminQuery(query: Record<string, unknown> = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "" || value === "all") {
      continue;
    }

    params.set(key, String(value));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export async function adminFetch<T>(input: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(input, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new AdminApiError(
      "Không thể kết nối tới hệ thống quản trị. Vui lòng kiểm tra mạng và thử lại.",
      0,
    );
  }

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new AdminApiError(errorMessage(response.status, body), response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
