## Context

The repository is an Nx monorepo with a Next.js App Router web app in `apps/web` and a NestJS API in `apps/api`. The API already exposes authentication contracts for registration, login, refresh, logout, and current user lookup through `AuthController`, and those responses include access tokens, refresh tokens, user identity, and roles. The web app currently has a public storefront foundation, a static login control in the header, and no real auth/session layer.

The Figma MCP Make project `OwX29MxtI0gXCASf44pdGh` provides useful UI reference for Vietnamese login/register forms and 401/403 pages, but its implementation is intentionally insecure for demo purposes: email-only mock login, hard-coded quick-fill accounts, client role switching, Vite, and `react-router`. This change uses the Figma material for visual direction only.

## Goals / Non-Goals

**Goals:**

- Implement real web login, registration, logout, current-user restoration, and token refresh using existing API contracts.
- Represent guest, customer, and admin states in the web app.
- Provide reusable customer/admin route protection for App Router routes.
- Provide unauthorized and forbidden handling with predictable redirects after authentication.
- Keep the UI consistent with the existing ShopVN storefront, Tailwind CSS 3.4.3, Flowbite, TypeScript, and local component conventions.
- Add focused tests for auth API client behavior, session transitions, route protection decisions, and auth screens where practical.

**Non-Goals:**

- Do not change backend auth contracts unless implementation uncovers a blocking gap.
- Do not implement cart, checkout, customer account feature pages, or admin feature pages.
- Do not copy Figma demo auth, quick-fill controls, production role switcher, Vite setup, `react-router`, or shadcn/Radix primitives.
- Do not upgrade Tailwind CSS or replace Flowbite.
- Do not add a full app-wide state library unless local React/Next patterns prove insufficient.

## Decisions

### Use the existing backend auth contract as the source of truth

The web app will call `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, and `GET /auth/me` rather than implementing mock authentication. The UI will derive roles only from API responses and refreshed session state.

Alternative considered: local mock auth matching Figma. Rejected because it would duplicate insecure demo behavior and conflict with existing API contracts.

### Keep token/session handling in a small web auth module

Create a narrow auth client/session layer under the existing web source tree to centralize API calls, token persistence, refresh, logout cleanup, and user shape normalization. UI components should consume a typed current-user/session interface rather than reading storage directly.

Alternative considered: scatter fetch calls across forms and guards. Rejected because refresh, logout, and redirect behavior need consistent error handling.

### Prefer secure cookie-backed storage when feasible, with explicit fallback handling

If the current web/API deployment shape can support server-set or web-route-managed HTTP-only cookies, store tokens in HTTP-only cookies and let route handlers/server components check auth without exposing refresh tokens to JavaScript. If implementation cannot complete that within existing contracts, use the smallest possible browser-storage fallback and document the residual risk in code/tests.

Alternative considered: always use `localStorage`. Rejected as the first choice because refresh tokens are sensitive.

### Separate UI state from authorization decisions

Header rendering can show guest/authenticated/admin controls, but access control must happen in route protection utilities, layouts, middleware, or server-side checks. Client-side hiding is not sufficient authorization.

Alternative considered: protect only by hiding links. Rejected because direct navigation to protected paths must be handled.

### Define protected route groups before feature pages

Add reusable route protection boundaries for future customer and admin routes, plus unauthorized/forbidden pages. Placeholder protected routes may exist only where needed to verify guards and redirects; this change must not build cart, checkout, customer account content, or admin feature content.

Alternative considered: wait until account/admin pages exist. Rejected because auth/RBAC is a cross-cutting foundation those pages will depend on.

### Use Figma for composition, not implementation

Login/register should follow the compact ShopVN card composition, Vietnamese labels, inline validation, password visibility toggle, and success/error feedback from Figma where compatible. Unauthorized/forbidden pages should follow the clear centered system-page pattern. Implementation must use Next.js App Router and existing components/styles.

Alternative considered: import Figma-generated React files. Rejected because they use the wrong routing/runtime stack and contain demo-only auth.

## Risks / Trade-offs

- Token storage can introduce security risk -> Prefer HTTP-only cookies; if browser storage is unavoidable, keep refresh behavior centralized and document limitations.
- API base URL/config may differ between local and deployment -> Use existing environment/config conventions or add a narrowly scoped web API base helper.
- Server and client auth state can drift after token expiry -> Centralize refresh and force logout on failed refresh or `/auth/me`.
- Route protection may accidentally create feature pages outside scope -> Limit tasks to guards, shell links, and system pages; defer customer/admin feature content.
- Admin users may also have customer capabilities -> Role checks should accept explicit required roles and not assume one exclusive role unless API roles require it.

## Migration Plan

1. Add the web auth client/session foundation and tests.
2. Add login/register/logout/current-user UI and session provider or server helpers.
3. Add route protection utilities and unauthorized/forbidden pages.
4. Update the storefront header to show guest/authenticated/admin states without cart/account/admin feature implementation.
5. Verify with unit/component tests and targeted Nx checks.

Rollback is limited to removing the new web auth routes/helpers and reverting the header auth controls; backend contracts are expected to remain unchanged.

## Open Questions

- Should tokens be managed through Next.js route handlers as HTTP-only cookies in the first implementation, or does the current API deployment require direct browser token handling?
- What exact customer/admin placeholder routes should be used for guard verification without creating feature pages?
