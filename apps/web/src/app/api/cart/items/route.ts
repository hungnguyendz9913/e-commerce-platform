import { proxyCommerceRequest } from "@/lib/commerce/proxy";

export function POST(request: Request) {
  return proxyCommerceRequest(request, "/cart/items");
}
