## 1. Baseline Audit

- [x] 1.1 Confirm predecessor changes are implemented: storefront foundation, product catalog, auth/RBAC, customer commerce, customer account, and admin frontend.
- [x] 1.2 Record current uncommitted work and avoid discarding unrelated user changes.
- [x] 1.3 Inventory `apps/web/src/app` routes, route groups, layouts, loading files, error files, not-found files, and global system pages.
- [x] 1.4 Inventory shared components, service modules, tests, assets, metadata, and Next.js configuration touched by frontend phases.
- [x] 1.5 Identify active transitional code paths from Figma Make, prototype mocks, duplicate wrappers, and obsolete phase scaffolding.

## 2. Route and Layout Ownership

- [x] 2.1 Create a route ownership map for storefront, auth, customer, commerce, admin, and system routes.
- [x] 2.2 Verify exactly one canonical homepage route resolves to `/`.
- [x] 2.3 Verify root layout owns only global concerns and storefront layout owns public header/footer.
- [x] 2.4 Verify auth pages do not unexpectedly duplicate storefront, customer, or admin shells.
- [x] 2.5 Verify customer account, cart, checkout, payment-result, order, profile, and address routes use the correct customer or commerce shell.
- [x] 2.6 Verify admin routes use only the admin sidebar/topbar/content shell.
- [x] 2.7 Remove or consolidate duplicate route files, layouts, headers, footers, navigation components, and obsolete wrappers without breaking public URLs.

## 3. Auth, Session, and RBAC Hardening

- [x] 3.1 Verify login and registration flows use real auth contracts and no demo role switching or quick-fill prototype behavior.
- [x] 3.2 Verify session restoration for auth-aware storefront, customer, commerce, and admin UI.
- [x] 3.3 Verify expired-session refresh behavior and failed-refresh cleanup.
- [x] 3.4 Verify logout clears session state and protected UI state for customer and admin users.
- [x] 3.5 Verify safe redirect handling rejects absolute, protocol-relative, malformed, and auth-page redirect targets.
- [x] 3.6 Verify guest, customer, and admin route access across public, auth, cart, checkout, payment-result, customer account, and admin routes.
- [x] 3.7 Verify unauthorized and forbidden pages are distinct, accessible, and route users to safe destinations.

## 4. API Integration and Service Boundaries

- [x] 4.1 Verify storefront catalog and product detail pages use typed product/catalog services and handle invalid query and missing product states.
- [x] 4.2 Verify cart, checkout, voucher, payment-result, and order creation flows use typed commerce services and proxy/auth helpers.
- [x] 4.3 Verify profile, addresses, customer order list, and customer order detail use typed customer/account services.
- [x] 4.4 Verify admin dashboard, products, categories, inventory, orders, customers, approvals, vouchers, revenue, payments/webhooks, and audit logs use typed admin services.
- [x] 4.5 Standardize frontend error mapping for validation, unauthenticated, forbidden, not found, conflict, business rule, payment, network, and server errors.
- [x] 4.6 Verify failed mutations preserve last backend-confirmed state and provide recovery paths.

## 5. Mock Data and Prototype Cleanup

- [x] 5.1 Search production web code for Figma `mockData`, local mock arrays, demo providers, role switching, `react-router`, Vite imports, and Tailwind CSS 4 patterns.
- [x] 5.2 Remove transitional mock data that has been replaced by real APIs.
- [x] 5.3 Move unavoidable temporary mock data behind typed service boundaries with explicit backend-gap comments and removal criteria.
- [x] 5.4 Remove obsolete prototype components, unused imports, unused assets, dead routes, and duplicated UI fragments where safe.
- [x] 5.5 Verify no Figma-only provider architecture or page-local production mutation persistence remains.

## 6. UI State and Mutation Safety

- [x] 6.1 Standardize loading states for storefront, auth, customer, commerce, admin, and system pages.
- [x] 6.2 Standardize empty states for catalog, cart, customer account, orders, addresses, admin lists, reports, and logs.
- [x] 6.3 Standardize route, API, validation, and mutation error states.
- [x] 6.4 Standardize success and recovery feedback without adding unapproved toast dependencies.
- [x] 6.5 Verify destructive or high-impact actions use confirmation flows.
- [x] 6.6 Prevent duplicate submissions and repeated API calls for forms, cart actions, checkout, profile/address mutations, order actions, and admin mutations.
- [x] 6.7 Handle invalid dynamic route parameters and missing resources with appropriate not-found or forbidden behavior.

## 7. System Pages and Error Boundaries

- [x] 7.1 Finalize global 404 handling and route-specific not-found pages.
- [x] 7.2 Finalize unauthorized and forbidden pages for auth and RBAC failures.
- [x] 7.3 Verify route segment error boundaries for product list/detail, customer pages, commerce pages, and admin pages.
- [x] 7.4 Verify global error handling is branded, accessible, and does not expose sensitive details.
- [x] 7.5 Add appropriate metadata and page titles for major storefront, auth, customer, commerce, admin, and system routes.

## 8. Next.js Boundaries, Assets, and Types

- [x] 8.1 Review Server Component and Client Component boundaries across major routes.
- [x] 8.2 Remove unnecessary `"use client"` directives where components do not need client hooks, browser APIs, or local interactivity.
- [x] 8.3 Verify server-side data loading uses existing auth/session helpers where appropriate.
- [x] 8.4 Review image usage, local assets, `next/image`, dimensions, alt text, placeholders, and fallbacks.
- [x] 8.5 Verify remote image configuration is narrow, justified, and not a broad allowlist.
- [x] 8.6 Verify shared types, service response envelopes, normalizers, and error types are consistent across frontend domains.

## 9. Responsive Verification

- [x] 9.1 Verify storefront homepage, catalog, and product detail at 320px, 375px, 768px, 1024px, and 1536px.
- [x] 9.2 Verify login, register, unauthorized, forbidden, 404, and global error pages at required viewport widths.
- [x] 9.3 Verify cart, checkout, payment-result, customer account, profile, addresses, order list, and order detail at required viewport widths.
- [x] 9.4 Verify admin dashboard, products, categories, inventory, orders, order detail, customers, approvals, vouchers, revenue, payments/webhooks, and audit logs at required viewport widths.
- [x] 9.5 Remove unintended document-level horizontal scrolling and unintended nested page scroll containers.
- [x] 9.6 Verify mobile menus, sidebars, dialogs, tables, forms, sticky elements, filters, dropdowns, JSON panels, and diff panels remain usable.

## 10. Accessibility Verification

- [x] 10.1 Verify keyboard navigation order across navigation, forms, filters, menus, dialogs, pagination, tabs, dropdowns, and action controls.
- [x] 10.2 Verify visible focus states and focus management for dialogs, mobile menus, validation errors, and route transitions.
- [x] 10.3 Verify landmarks, primary headings, and heading hierarchy on major routes.
- [x] 10.4 Verify form labels, accessible names, status text, error associations, icon-only buttons, and alt text or decorative image treatment.
- [x] 10.5 Verify disabled and pending states remain understandable to keyboard and assistive technology users.

## 11. Automated Verification

- [x] 11.1 Discover the actual Nx web project name and configured targets.
- [x] 11.2 Run the configured Nx lint target for the web app and fix frontend-introduced failures.
- [x] 11.3 Run the configured Nx test target for the web app and fix frontend-introduced failures.
- [x] 11.4 Run the configured Nx build target for the web app and fix frontend-introduced failures.
- [x] 11.5 Run any configured web e2e or browser target if available and relevant to the finalization scope.
- [x] 11.6 Document any residual target failures with command output, failing scope, and classification as introduced, pre-existing, or unresolved.

## 12. Final Manual End-to-End Checklist

- [x] 12.1 Create a final guest checklist for homepage, search, catalog filters/sort/pagination, product detail, login/register navigation, unauthorized handling, and 404.
- [x] 12.2 Create a final customer checklist for login, logout, session restore, cart, checkout, voucher/payment behavior, payment result, profile, addresses, order list, order detail, and expired session recovery.
- [x] 12.3 Create a final admin checklist for login, route access, dashboard, products, categories, inventory, orders, order detail/status updates, customers, approvals, vouchers, revenue, payments/webhooks, audit logs, and forbidden handling for non-admins.
- [x] 12.4 Record final responsive and accessibility verification coverage for all required viewport widths and major flows.
- [x] 12.5 Record final completion criteria and residual risks for the ShopVN frontend.
