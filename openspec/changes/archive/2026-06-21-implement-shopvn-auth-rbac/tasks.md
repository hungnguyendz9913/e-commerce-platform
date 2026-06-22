## 1. Discovery and Setup

- [x] 1.1 Confirm existing web API base URL conventions and decide whether auth calls should go through Next.js route handlers, direct API calls, or an existing helper.
- [x] 1.2 Confirm token storage strategy, preferring HTTP-only cookie-backed handling where feasible and documenting any fallback.
- [x] 1.3 Inspect current App Router layout/header boundaries and identify exact files for auth routes, protected route groups, and system pages.
- [x] 1.4 Confirm no backend auth contract changes are required for `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, and `/auth/me`.

## 2. Auth Client and Session Foundation

- [x] 2.1 Add typed web auth models for guest/current-user/session state using API response shapes and roles from existing contracts.
- [x] 2.2 Implement a centralized auth API client for register, login, refresh, logout, and current-user lookup.
- [x] 2.3 Implement safe redirect target parsing that accepts only same-origin relative app paths and rejects auth-page loops.
- [x] 2.4 Implement session persistence, restoration, refresh-on-unauthorized, and forced guest fallback on failed refresh.
- [x] 2.5 Add unit tests for auth client success/error handling, refresh retry behavior, logout cleanup, role checks, and safe redirect parsing.

## 3. Auth Screens

- [x] 3.1 Add the `/login` App Router page with email/password fields, password visibility toggle, loading state, inline validation, API error handling, and safe post-login redirect behavior.
- [x] 3.2 Add the `/register` App Router page with full name, email, optional phone, password, confirm password, client validation aligned to `RegisterDto`, success state, and login navigation.
- [x] 3.3 Ensure login/register UI follows the ShopVN/Figma visual direction without copying quick-fill demo buttons, email-only login, role switching, Vite, or `react-router`.
- [x] 3.4 Add focused component/page tests for login and registration validation, success, and failure states where existing test tooling supports it.

## 4. Logout and Current User UI

- [x] 4.1 Add logout behavior that calls the API when possible, clears local session state even when the API rejects an expired session, and redirects to a public storefront path.
- [x] 4.2 Expose current-user state to components that need auth-aware rendering without requiring unrelated storefront sections to become client components.
- [x] 4.3 Update authenticated loading and stale-session states so the header and protected routes do not flash privileged content.

## 5. Route Protection and System Pages

- [x] 5.1 Add reusable customer/admin route protection helpers, layouts, or middleware for App Router routes.
- [x] 5.2 Add unauthorized handling that explains login is required and links to login plus the public storefront.
- [x] 5.3 Add forbidden handling that explains insufficient role access and links to an allowed destination.
- [x] 5.4 Verify guests are blocked from customer and admin routes with safe `redirectTo` behavior.
- [x] 5.5 Verify customers are blocked from admin routes and admins are allowed through admin protection.
- [x] 5.6 Keep any protected-route placeholders minimal and do not implement cart, checkout, customer account feature pages, or admin feature pages.

## 6. Storefront Header Integration

- [x] 6.1 Replace the static login button behavior with auth-aware guest login, authenticated user, logout, and optional admin entry controls.
- [x] 6.2 Preserve existing logo, catalog search, navigation, mobile menu behavior, cart control presentation, responsive layout, and accessibility.
- [x] 6.3 Ensure the header does not import Figma providers, mock auth state, live cart quantity state, role switchers, or out-of-scope feature pages.
- [x] 6.4 Add or update header tests for guest, customer, and admin rendering states.

## 7. Verification

- [x] 7.1 Run targeted web unit/component tests for auth/session/header behavior.
- [x] 7.2 Run relevant Nx lint/typecheck/test commands for `apps/web` and any touched shared libraries.
- [x] 7.3 Manually verify login, registration, logout, session restore, unauthorized, forbidden, customer guard, admin guard, and post-login redirects.
- [x] 7.4 Confirm Tailwind CSS remains 3.4.3, Flowbite remains in place, and no Vite, `react-router`, Figma shadcn/Radix, or role-switcher code was introduced.
