## Why

ShopVN has admin APIs, RBAC, and storefront foundations, but the web app still exposes only a placeholder admin route. This change adds a production admin frontend so authenticated admins can operate catalog, inventory, order, customer, approval, voucher, revenue, payment/webhook, and audit workflows through the existing Next.js app.

## What Changes

- Replace the admin placeholder with a protected admin frontend using the approved authenticated admin RBAC path.
- Add a responsive admin layout with sidebar navigation, top bar, active-section state, mobile menu behavior, admin identity, and logout/storefront navigation.
- Add admin dashboard, products, categories, inventory, orders, order detail, customers, approvals, vouchers, revenue, payments/webhooks, and audit log pages.
- Add admin table, filter, pagination, status badge, modal, confirmation, empty, loading, error, and responsive states adapted from the Figma Make reference.
- Integrate admin screens with existing admin API contracts where available through typed service boundaries and existing proxy/auth patterns.
- Identify missing backend operations explicitly rather than preserving Figma page-local mutations or mock arrays as production state.
- Keep Next.js App Router, Tailwind CSS 3.4.3, Flowbite, TypeScript, and existing repository conventions.
- Add chart, toast, or UI dependencies only if implementation confirms they are required and the dependency choice is approved.

## Capabilities

### New Capabilities
- `admin-frontend`: Authenticated ShopVN admin web UI for protected layout, dashboard, catalog/product/category management, inventory, orders, customers, approvals, vouchers, revenue, payments/webhooks, audit logs, async states, confirmation flows, and responsive behavior.

### Modified Capabilities
- None.

## Impact

- Affected web app areas: `apps/web/src/app/admin`, admin route layout/pages, admin-specific components, typed admin service boundaries, proxy route handlers where needed, shared status/empty/error/confirmation UI, and web tests.
- Affected API integrations: existing admin contracts for dashboard, products, categories, inventory, orders/status, customers, approvals, vouchers, revenue, payments/webhooks, and audit logs where available.
- Security impact: all admin frontend routes and browser-side admin calls must require authenticated admin access and must not allow customer or guest access.
- Dependency impact: charts/toasts/UI helpers may be considered only after confirming existing dependencies are insufficient and receiving approval.
- Out of scope: backend schema changes by default, Figma mock providers, `react-router`, Vite runtime code, page-local production mutations, mock admin data as source of truth, and customer-facing feature implementation.
