import { proxyCommerceRequest } from "@/lib/commerce/proxy";

type CustomerOrderRouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(
  request: Request,
  { params }: CustomerOrderRouteContext,
) {
  const { orderId } = await params;
  return proxyCommerceRequest(request, `/orders/${encodeURIComponent(orderId)}`);
}

