import { proxyCommerceRequest } from "@/lib/commerce/proxy";

type CartItemRouteContext = {
  params: Promise<{ itemId: string }>;
};

export async function PATCH(
  request: Request,
  { params }: CartItemRouteContext,
) {
  const { itemId } = await params;
  return proxyCommerceRequest(request, `/cart/items/${encodeURIComponent(itemId)}`);
}

export async function DELETE(
  request: Request,
  { params }: CartItemRouteContext,
) {
  const { itemId } = await params;
  return proxyCommerceRequest(request, `/cart/items/${encodeURIComponent(itemId)}`);
}
