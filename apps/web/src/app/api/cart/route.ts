import { proxyCommerceRequest } from "@/lib/commerce/proxy";

export function GET(request: Request) {
  return proxyCommerceRequest(request, "/cart");
}

export function DELETE(request: Request) {
  return proxyCommerceRequest(request, "/cart");
}
