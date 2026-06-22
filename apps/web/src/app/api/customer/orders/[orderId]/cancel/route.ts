import { proxyCommerceRequest } from "@/lib/commerce/proxy";

type CustomerOrderCancelRouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function POST(
  request: Request,
  { params }: CustomerOrderCancelRouteContext,
) {
  const { orderId } = await params;
  return proxyCommerceRequest(request, `/orders/${encodeURIComponent(orderId)}/cancel`);
}

