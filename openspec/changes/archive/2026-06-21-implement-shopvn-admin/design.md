## Context

The current web app is a Next.js App Router application with a completed storefront, auth/RBAC foundations, and customer commerce foundations. `/admin` already exists as a protected route target and `requiredRoleForPath()` maps `/admin` to the `admin` role, but the page is only a placeholder that confirms route protection.

The backend and OpenSpec contract surface already cover many admin operations: dashboard, products, categories, inventory, orders/status updates, customers, approvals, vouchers, revenue, payments/webhooks, and audit-style operational data where available. The admin frontend should integrate with those contracts through authenticated web service/proxy boundaries and identify missing operations instead of filling gaps with mock data.

The Figma Make project `OwX29MxtI0gXCASf44pdGh` is the visual and behavioral reference. Relevant files include `AdminLayout`, `AdminDashboardPage`, `AdminProductsPage`, `AdminProductFormModal`, `AdminCategoriesPage`, `AdminInventoryPage`, `AdminOrdersPage`, `AdminOrderDetailPage`, `AdminCustomersPage`, `AdminApprovalsPage`, `AdminVouchersPage`, `AdminRevenuePage`, `AdminPaymentsPage`, and `AdminAuditLogsPage`. These screens establish the intended admin information architecture, management-table pattern, filters, modals, status badges, confirmations, responsive sidebar, payment/webhook JSON inspection, and audit diff presentation. They are not production code: they use `react-router`, Figma mock data, page-local mutations, `sonner`, and `recharts`.

## Goals / Non-Goals

**Goals:**
- Replace the admin placeholder with a protected, production-shaped admin frontend.
- Require authenticated admin access for every admin route and browser-side admin API call.
- Provide responsive admin layout, dashboard, products, categories, inventory, orders/detail, customers, approvals, vouchers, revenue, payments/webhooks, and audit logs.
- Reuse existing Next.js App Router, Tailwind CSS 3.4.3, Flowbite, TypeScript, auth/session, proxy, and test conventions.
- Keep admin data access behind typed service boundaries with normalizers and clear error handling.
- Adapt Figma behavior and layout patterns without preserving mock providers or local-only mutations.

**Non-Goals:**
- No application code changes during proposal creation.
- No backend schema expansion by default.
- No admin behavior implemented with mock arrays, Figma page-local state, demo role switching, or frontend-only persistence.
- No replacement of public storefront, customer account, cart, checkout, or payment-result flows.
- No chart, toast, or new UI dependency unless implementation confirms the need and the dependency is approved.
- No `react-router`, Vite runtime, Tailwind CSS 4, or Figma-specific runtime imports.

## Decisions

### 1. Keep Admin Routes Under `/admin`

Use the existing `/admin` route family:
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/inventory`
- `/admin/orders`
- `/admin/orders/[orderId]`
- `/admin/customers`
- `/admin/approvals`
- `/admin/vouchers`
- `/admin/revenue`
- `/admin/payments`
- `/admin/webhooks` or a tab/segment inside `/admin/payments`
- `/admin/audit-logs`

Rationale: `/admin` is already the approved default admin destination and protected path prefix. Keeping all admin pages under this route avoids expanding RBAC surface area and matches the Figma admin navigation.

Alternative considered: split payments and webhooks into completely separate root groups or use `/dashboard`. That makes route protection and navigation less direct for no product benefit.

### 2. Admin Layout Is Separate From Storefront Layout

Implement an admin-specific route layout with a full-height work surface, responsive sidebar, top bar, and scrollable content region. Reuse brand/logo/auth/logout pieces where practical, but do not wrap admin pages in storefront header/footer.

Rationale: Admin workflows are dense operational screens. The Figma admin shell correctly uses a side navigation and compact content panels, which fits repeated data-management tasks better than the storefront chrome.

Alternative considered: render admin pages inside the storefront layout. That would preserve more shared chrome but wastes vertical space and weakens the operational navigation model.

### 3. Use Typed Admin Service Boundaries

Add an admin data layer under a clear web location such as `apps/web/src/lib/admin`:
- shared request/error helpers
- dashboard service
- product/category/inventory services
- order/customer/approval services
- voucher/revenue/payment/webhook/audit services
- normalizers and typed UI models

Use Next.js route handlers as proxy boundaries when browser client components need authenticated mutation calls. Prefer server-side data loading for initial tables/detail pages where existing auth helpers can safely forward session state.

Rationale: The customer commerce implementation already uses typed service boundaries. Admin breadth makes this even more important because almost every page has filters, pagination, status mapping, and mutations.

Alternative considered: fetch directly in page components. That would be faster to write at first but would duplicate auth/error/pagination behavior and make backend gaps harder to see.

### 4. Treat Figma Local Mutations As Interaction Specs Only

Figma page-local operations are useful for understanding expected workflows:
- product create/edit/delete confirmation
- category create/edit/delete
- inventory update with reason
- order status transition modal
- customer status modal
- approve/reject modal
- voucher create/edit/deactivate
- webhook JSON detail
- audit before/after detail

Production implementation must call backend contracts for these operations. If no backend operation exists, hide or disable the action and document the missing contract in code comments, tests, or follow-up OpenSpec work.

Rationale: Admin users modify business-critical data. A frontend-only mutation would be worse than a missing feature because it appears successful while leaving the system unchanged.

Alternative considered: keep local optimistic state for unsupported operations. That is acceptable in a prototype, but not for production admin workflows.

### 5. Dependency Policy Is Approval-Gated

Use existing CSS/components first. For charts, start with semantic summary cards and tables; add chart rendering only if an approved chart library is available or approved during implementation. For toast feedback, prefer existing notification patterns if present; otherwise use inline success/error states or request approval before adding a toast library.

Rationale: The user explicitly requested dependency restraint. Figma uses `recharts` and `sonner`, but the repo does not automatically inherit those choices.

Alternative considered: add `recharts` and `sonner` because Figma uses them. That would ignore the dependency constraint and may conflict with existing repository preferences.

### 6. Table-First Operational UI

Use compact management tables with responsive column collapse for products, inventory, orders, customers, vouchers, payments, and logs. On mobile, preserve primary identity/status/action columns and collapse secondary metadata; where a table becomes too dense, use stacked row cards only within the admin content panel.

Rationale: Admin users scan, filter, compare, and act repeatedly. The UI should be denser and quieter than marketing/storefront pages.

Alternative considered: convert every admin list to cards. Cards are easier on mobile but reduce scan density and make desktop admin workflows slower.

### 7. Backend Values Drive Status Labels

Create typed status presentation maps for product status, approval status, inventory movement type, order status, payment status, voucher status, user status, webhook status, and audit action labels. Unknown statuses should render as neutral labels with raw value preserved.

Rationale: Figma's broad `StatusBadge` map is a useful reference but should not be copied as one untyped catch-all. Admin pages need predictable mappings from real backend values.

Alternative considered: reuse one string-to-label map everywhere. That is quick but increases accidental collisions between domains such as `pending` approval, `pending` order, and `pending` payment.

## Risks / Trade-offs

- Missing backend operations -> Hide/disable unsupported actions, document gaps, and keep pages read-only where needed rather than faking state.
- Admin API shapes differ from Figma mock data -> Build normalizers around real response envelopes and keep Figma fields as presentation references only.
- Chart dependency may be unavailable -> Render summary cards and tables first; add charting only after approval.
- Toast dependency may be unavailable -> Use inline success/error state or existing project feedback patterns until dependency approval exists.
- Large admin scope can sprawl -> Implement shared admin table/filter/status/confirmation patterns before building every page independently.
- Admin route leakage risk -> Verify route protection and proxy authentication for nested `/admin/*` routes and mutation endpoints.
- Mobile tables can overflow -> Define stable column behavior, min widths, wrapping rules, and test small viewports before completion.

## Migration Plan

1. Confirm existing admin backend contracts and identify missing operations per page.
2. Add typed admin service models, normalizers, request helpers, and proxy route handlers where needed.
3. Add the `/admin` layout with RBAC-protected sidebar/topbar shell.
4. Implement dashboard and shared admin UI primitives.
5. Implement product/category/inventory pages and mutation flows.
6. Implement order list/detail/status update and customer pages.
7. Implement approvals, vouchers, revenue, payments/webhooks, and audit logs, with read-only fallbacks for missing contracts.
8. Add focused tests for services, normalizers, route protection, critical forms, confirmation flows, and status mappings.
9. Run relevant web tests, type checking, linting, and responsive verification.

Rollback is additive: restore the existing placeholder `/admin` page and remove the new admin route subtree, services, and tests if needed.

## Open Questions

- Which admin contracts are currently implemented for dashboard, customers, approvals, revenue, payments/webhooks, and audit logs beyond the broader specs?
- Should payments and webhooks be separate routes or a tabbed/segmented surface under `/admin/payments`?
- Are charts required in the first implementation pass, and if so which dependency is approved?
- Is a toast library approved, or should success/error feedback remain inline until a shared notification pattern exists?
