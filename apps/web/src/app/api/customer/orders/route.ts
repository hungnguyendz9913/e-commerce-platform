import { proxyCommerceRequest } from "@/lib/commerce/proxy";

export function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  return proxyCommerceRequest(request, `/orders${query ? `?${query}` : ""}`);
}

