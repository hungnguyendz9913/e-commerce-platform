import { proxyCommerceRequest } from "@/lib/commerce/proxy";

export function GET(request: Request) {
  return proxyCommerceRequest(request, "/users/me");
}

export function PATCH(request: Request) {
  return proxyCommerceRequest(request, "/users/me");
}

