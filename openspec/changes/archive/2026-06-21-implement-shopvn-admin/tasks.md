## 1. Contract and Dependency Discovery

- [x] 1.1 Inspect existing web auth, middleware, route protection, proxy, and commerce service helpers for reusable admin patterns.
- [x] 1.2 Inspect existing API controllers, specs, and route handlers to confirm implemented admin endpoints for dashboard, products, categories, inventory, orders, customers, approvals, vouchers, revenue, payments/webhooks, and audit logs.
- [x] 1.3 Create a backend gap list for unsupported admin read or mutation operations before exposing production UI actions.
- [x] 1.4 Check existing package dependencies for chart, toast, modal, table, and icon capabilities before proposing any new dependency.
- [x] 1.5 If a chart, toast, or UI dependency is required, document the need and request approval before modifying dependencies.

## 2. Admin Data Layer

- [x] 2.1 Add typed admin domain models for dashboard, products, categories, inventory, movements, orders, customers, approvals, vouchers, revenue, payments, webhooks, audit logs, pagination, filters, and mutation payloads.
- [x] 2.2 Add admin response normalizers for existing API response envelopes and backend field naming.
- [x] 2.3 Add typed status presentation maps for product, approval, inventory movement, order, payment, voucher, user, webhook, and audit values.
- [x] 2.4 Add shared admin request/error helpers using existing auth and proxy conventions.
- [x] 2.5 Add admin service functions for dashboard, product, category, inventory, order, customer, approval, voucher, revenue, payment/webhook, and audit read operations where contracts exist.
- [x] 2.6 Add admin service functions for supported mutations including product, category, inventory, order status, approval, voucher, and customer status operations.
- [x] 2.7 Add or extend Next.js API proxy route handlers needed for authenticated browser-side admin mutations.

## 3. Admin Shell and Shared UI

- [x] 3.1 Replace the placeholder `/admin` surface with an admin route layout that preserves RBAC protection for `/admin/*`.
- [x] 3.2 Implement responsive sidebar navigation, active route highlighting, mobile menu open/close behavior, and top bar section context.
- [x] 3.3 Add admin identity, logout, and safe storefront navigation controls without Figma role switching.
- [x] 3.4 Add reusable admin table, filter bar, pagination, status badge, empty state, loading skeleton, error state, confirmation dialog, and modal patterns.
- [x] 3.5 Verify shared admin UI does not import `react-router`, Figma providers, Vite code, Figma mock data, or page-local production mutations.

## 4. Dashboard

- [x] 4.1 Implement `/admin` dashboard metric cards from backend dashboard data where available.
- [x] 4.2 Implement dashboard recent orders and low-stock summaries with links to relevant admin pages.
- [x] 4.3 Implement date-range controls using supported backend query parameters or clearly documented read-only fallback behavior.
- [x] 4.4 Implement revenue visualizations only with existing or approved chart capability, and always include tabular/semantic values.

## 5. Products and Categories

- [x] 5.1 Implement `/admin/products` with backend-backed product list, filters, sorting, pagination, status badges, and responsive columns.
- [x] 5.2 Implement product create and edit UI with validation, category selection, images, status, approval status, and inventory fields supported by the backend contract.
- [x] 5.3 Implement product delete/archive confirmation and backend-backed success/error handling.
- [x] 5.4 Implement `/admin/categories` with backend-backed hierarchy rendering, status labels, and empty/error states.
- [x] 5.5 Implement category create, edit, and delete confirmation only for backend-supported operations.
- [x] 5.6 Document or hide any product/category actions whose backend contracts are missing.

## 6. Inventory

- [x] 6.1 Implement `/admin/inventory` inventory list with search/filter controls, low-stock handling, available quantity, and responsive columns.
- [x] 6.2 Implement stock adjustment modal with quantity validation, required reason when supported, confirmation/pending state, and backend-backed updates.
- [x] 6.3 Implement inventory movement history when the backend exposes movement data.
- [x] 6.4 Document or hide missing inventory list, filter, adjustment, or movement operations.

## 7. Orders and Customers

- [x] 7.1 Implement `/admin/orders` with backend-backed order list, search/status/payment filters, pagination, and detail navigation.
- [x] 7.2 Implement `/admin/orders/[orderId]` with order header, items, delivery snapshot, amount breakdown, payment/customer details, notes, and statuses.
- [x] 7.3 Implement admin order status update modal using backend-supported transitions and preserving last confirmed state on failure.
- [x] 7.4 Implement `/admin/customers` with customer listing, filters, status badges, and no sensitive credential fields.
- [x] 7.5 Implement customer status update only when the backend contract exists; otherwise hide or disable the action and document the gap.

## 8. Approvals and Vouchers

- [x] 8.1 Implement `/admin/approvals` with approval-status filters and pending product review cards or table rows.
- [x] 8.2 Implement approve and reject flows with confirmation, rejection reason validation when required, and backend-backed state refresh.
- [x] 8.3 Implement `/admin/vouchers` with backend-backed voucher list, status labels, usage context, and responsive columns.
- [x] 8.4 Implement voucher create and update UI with backend-aligned validation for dates, amounts, discount values, limits, and scope fields where available.
- [x] 8.5 Implement voucher deactivate confirmation and avoid hard-delete UI unless the backend explicitly supports it.

## 9. Revenue, Payments, Webhooks, and Audit Logs

- [x] 9.1 Implement `/admin/revenue` with backend-backed summary cards, date/grouping controls, and table-first reporting.
- [x] 9.2 Add revenue charts only with existing or approved chart capability and keep tabular values available.
- [x] 9.3 Implement `/admin/payments` payment history with provider, method, amount, status, timestamp, and order/customer context where available.
- [x] 9.4 Implement webhook log UI as `/admin/webhooks` or a documented payments sub-view, with provider/event/status filters and safe JSON detail display.
- [x] 9.5 Implement `/admin/audit-logs` with audit list filters and structured before/after detail display where backend data exists.
- [x] 9.6 Document missing revenue export, payment/webhook listing, or audit log backend operations instead of faking records.

## 10. Async, Responsive, and Accessibility Pass

- [x] 10.1 Add route-level and page-level loading states for every admin page.
- [x] 10.2 Add page-level error states with retry or safe navigation where recovery is possible.
- [x] 10.3 Verify confirmation flows for delete, archive, deactivate, reject, block, status update, and inventory adjustment actions.
- [x] 10.4 Verify mobile and desktop layouts for sidebar, top bar, tables, filters, modals, detail pages, and JSON/diff panels.
- [x] 10.5 Verify keyboard access, labels, focus handling, dialog behavior, and screen-reader-friendly status/error text.

## 11. Tests and Verification

- [x] 11.1 Add unit tests for admin normalizers, status mappings, query builders, and mutation payload builders.
- [x] 11.2 Add component tests for admin layout navigation, route-protected rendering assumptions, filters, empty/error states, and critical forms.
- [x] 11.3 Add tests for confirmation flows and unsupported-backend-operation fallbacks.
- [x] 11.4 Add or update route protection tests for guest, customer, and admin access expectations on nested `/admin/*` routes.
- [x] 11.5 Run relevant web tests, type checking, linting, and any focused build checks used by the project.
- [x] 11.6 Manually compare implemented admin pages with the Figma Make reference across desktop and mobile viewport sizes.
