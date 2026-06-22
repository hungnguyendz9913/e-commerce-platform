## Why

ShopVN frontend work has been delivered across separate storefront, catalog, auth, commerce, customer account, and admin phases. This change is the final integration and hardening pass that turns those completed pieces into one coherent, verified Nx/Next.js App Router frontend without introducing major new business features.

## What Changes

- Verify route and layout ownership across storefront, auth, customer, and admin areas, removing duplicate routes, duplicated layouts, duplicated headers, footers, and navigation.
- Verify auth/session behavior end to end: login, logout, session restoration, token refresh, expired sessions, safe redirects, unauthorized, forbidden, guest/customer/admin access, and role-appropriate navigation.
- Verify API integration across products, cart, checkout, payment result/status handling, orders, profile, addresses, and admin pages using typed service boundaries and consistent error handling.
- Remove transitional mock data that is no longer required; isolate any unavoidable temporary mock data behind typed service boundaries with explicit documentation.
- Standardize loading, empty, error, validation, success, confirmation, duplicate-submission prevention, invalid-parameter handling, missing-resource handling, 404, unauthorized, forbidden, and global error states.
- Verify responsive behavior at 320px, 375px, 768px, 1024px, and 1536px, including mobile menus, sidebars, dialogs, tables, forms, sticky elements, dropdowns, and removal of unintended horizontal scrolling or nested page scroll containers.
- Verify accessibility, keyboard navigation, focus states, landmarks, labels, alt text, heading hierarchy, dialog focus behavior, and semantic page structure.
- Review Next.js Server Component and Client Component boundaries, removing unnecessary `"use client"` directives and keeping interactive islands scoped.
- Review image usage, local assets, `next/image`, remote image configuration, metadata, page titles, shared types, service boundaries, dead components, unused imports, unused assets, and obsolete prototype code.
- Verify no Vite, React Router, Tailwind CSS 4, insecure demo role switching, or Figma-only provider architecture remains.
- Run the actual configured Nx lint, test, and build targets and distinguish frontend regressions from pre-existing repository failures.
- Produce a final manual end-to-end verification checklist covering all major guest, customer, and admin flows.

## Capabilities

### New Capabilities
- `frontend-finalization`: Integration, hardening, verification, cleanup, responsive/accessibility acceptance criteria, mock-data removal, route/layout ownership, API/session error handling, Nx verification, and final completion criteria for the complete ShopVN frontend.

### Modified Capabilities
- None.

## Impact

- Affected web app areas: `apps/web/src/app`, route groups, layouts, storefront/auth/customer/admin pages, shared components, service modules, tests, metadata, assets, and Next.js configuration where image handling requires review.
- Affected verification: configured Nx `lint`, `test`, `build`, and relevant web targets; manual viewport and end-to-end route/flow checks.
- Affected prior work: this change depends on `migrate-shopvn-storefront-foundation`, `implement-shopvn-product-catalog`, `implement-shopvn-auth-rbac`, `implement-shopvn-customer-commerce`, `implement-shopvn-customer-account`, and `implement-shopvn-admin` being implemented before finalization begins.
- Dependency constraints: keep Next.js App Router, TypeScript, Tailwind CSS 3.4.3, Flowbite, existing repository conventions, and avoid large new dependencies without an explicit requirement.
- Scope boundaries: do not redesign the application, replace working completed features without justification, add unrelated backend functionality, modify unrelated repository areas, or discard existing uncommitted user work.
