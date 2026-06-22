import { proxyCommerceRequest } from "@/lib/commerce/proxy";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

function adminPath(path?: string[]) {
  const suffix = (path ?? []).map(encodeURIComponent).join("/");
  return `/admin${suffix ? `/${suffix}` : ""}`;
}

async function proxyAdminRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const sourceUrl = new URL(request.url);
  const query = sourceUrl.searchParams.toString();
  const pathWithQuery = `${adminPath(path)}${query ? `?${query}` : ""}`;

  return proxyCommerceRequest(request, pathWithQuery);
}

export function GET(request: Request, context: RouteContext) {
  return proxyAdminRequest(request, context);
}

export function POST(request: Request, context: RouteContext) {
  return proxyAdminRequest(request, context);
}

export function PATCH(request: Request, context: RouteContext) {
  return proxyAdminRequest(request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return proxyAdminRequest(request, context);
}
