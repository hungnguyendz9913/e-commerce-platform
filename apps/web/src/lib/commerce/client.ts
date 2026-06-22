import { CommerceApiError, type CommerceApiErrorBody } from "./types";

function errorMessage(status: number, body?: CommerceApiErrorBody) {
  if (Array.isArray(body?.message)) {
    return body.message.join(" ");
  }

  if (body?.message) {
    return body.message;
  }

  if (status === 401) {
    return "Vui lòng đăng nhập để tiếp tục.";
  }

  if (status === 403) {
    return "Tài khoản của bạn không có quyền thực hiện thao tác này.";
  }

  if (status === 404) {
    return "Không tìm thấy dữ liệu cần xử lý.";
  }

  if (status === 409) {
    return "Dữ liệu đã thay đổi. Vui lòng tải lại rồi thử lại.";
  }

  if (status === 422) {
    return "Yêu cầu chưa hợp lệ. Vui lòng kiểm tra lại.";
  }

  if (status === 402 || body?.code?.toLowerCase().includes("payment")) {
    return "Thanh toán chưa hoàn tất. Vui lòng kiểm tra lại hoặc chọn phương thức khác.";
  }

  if (status >= 500) {
    return "Hệ thống tạm thời chưa xử lý được yêu cầu. Vui lòng thử lại sau.";
  }

  return "Không thể xử lý yêu cầu. Vui lòng thử lại.";
}

async function readErrorBody(response: Response) {
  try {
    return (await response.json()) as CommerceApiErrorBody;
  } catch {
    return undefined;
  }
}

export async function commerceFetch<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
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
    throw new CommerceApiError(
      "Không thể kết nối tới hệ thống. Vui lòng kiểm tra mạng và thử lại.",
      0,
    );
  }

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new CommerceApiError(errorMessage(response.status, body), response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
