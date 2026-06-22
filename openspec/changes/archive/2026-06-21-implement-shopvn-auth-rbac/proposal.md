## Why

ShopVN already has backend authentication contracts and role concepts, but the Next.js storefront does not yet expose real login, registration, logout, session restoration, or route-level RBAC behavior. This change makes authentication usable in the web app while preserving secure backend-driven auth instead of copying insecure demo behavior from the Figma Make reference.

## What Changes

- Add real web login and registration screens that use the existing `/auth/login` and `/auth/register` API contracts.
- Add web session handling for current-user state, token refresh, logout, and `/auth/me` restoration.
- Add guest, customer, and admin role handling in the web app.
- Add customer-only and admin-only route protection patterns for App Router routes.
- Add unauthorized and forbidden handling pages/states with redirect behavior after authentication.
- Update the storefront header to reflect authenticated and guest states without adding cart, checkout, customer account feature pages, or admin feature pages.
- Use the Figma MCP project `OwX29MxtI0gXCASf44pdGh` only as UI reference for auth and system-page composition; do not copy its email-only mock login, quick-fill demo accounts, role switcher, Vite, or `react-router` patterns.
- Keep Tailwind CSS 3.4.3, Flowbite, TypeScript, and existing Nx/Next.js App Router conventions.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `auth`: Add web authentication, session restoration, logout, role-aware redirects, and protected-route behavior on top of the existing auth API contract.
- `storefront-foundation`: Update the storefront shell/header and system-page behavior to support real auth state without introducing cart, checkout, customer account pages, or admin feature pages.

## Impact

- Affected web code: `apps/web/src/app`, `apps/web/src/components/ui/homepage-header.tsx`, shared web auth/session helpers, auth forms, protected route layouts or guards, unauthorized/forbidden pages, and focused web tests.
- Affected API usage: existing `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, and `GET /auth/me`; no new backend auth endpoint is expected unless implementation discovers a contract gap.
- Affected security behavior: client-side token storage strategy, refresh flow, current-user derivation, role checks, and redirect handling.
- Dependencies: no Tailwind upgrade, no Vite migration, no Figma shadcn/Radix import, and no new dependency unless an implementation task documents a specific need.
