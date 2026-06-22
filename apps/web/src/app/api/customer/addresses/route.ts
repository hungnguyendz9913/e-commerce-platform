import { proxyCommerceRequest } from "@/lib/commerce/proxy";

export function GET(request: Request) {
  return proxyCommerceRequest(request, "/users/me/addresses");
}

export function POST(request: Request) {
  return proxyCommerceRequest(request, "/users/me/addresses");
}

