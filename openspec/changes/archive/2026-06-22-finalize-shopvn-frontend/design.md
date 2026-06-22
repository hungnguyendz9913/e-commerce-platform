## Context

This change is a final integration pass for the ShopVN web frontend after these phases are implemented:
- `migrate-shopvn-storefront-foundation`
- `implement-shopvn-product-catalog`
- `implement-shopvn-auth-rbac`
- `implement-shopvn-customer-commerce`
- `implement-shopvn-customer-account`
- `implement-shopvn-admin`

The repository is an Nx workspace with a Next.js App Router web app under `apps/web`. The configured project tooling is provided through Nx plugins, including `lint`, `test`, and `build` targets. The frontend stack to preserve is Next.js App Router, TypeScript, Tailwind CSS 3.4.3, Flowbite, and the existing repository architecture.

The Figma Make project `OwX29MxtI0gXCASf44pdGh` remains a visual and flow reference only. Finalization must not copy Figma-only runtime patterns such as Vite, React Router, mock providers, role switching, Tailwind CSS 4 patterns, or page-local production mutations.

## Goals / Non-Goals

**Goals:**
- Integrate the completed frontend phases into one coherent app.
- Verify route, layout, and navigation ownership across storefront, auth, customer, commerce, and admin areas.
- Remove duplicate or obsolete route/layout/component/prototype code.
- Harden auth/session/RBAC and API error behavior.
- Remove or isolate transitional mock data.
- Standardize UI states, mutation safety, metadata, assets, accessibility, and responsive behavior.
- Run the actual Nx verification targets and document manual end-to-end coverage.
- Produce final completion criteria for the ShopVN frontend.

**Non-Goals:**
- Do not redesign the application.
- Do not add major new business features.
- Do not add unrelated backend functionality.
- Do not add large dependencies unless a specific finalization requirement proves they are necessary.
- Do not modify unrelated repository areas.
- Do not discard existing uncommitted user work.
- Do not treat Figma Make source as production architecture.

## Decisions

### 1. Audit Before Editing

Start by inventorying routes, layouts, components, service modules, assets, tests, dependencies, and known uncommitted changes before making implementation edits.

Rationale: This finalization pass cuts across completed phases. A blind cleanup could accidentally delete user work, remove a still-needed service, or mask a cross-phase integration problem.

Alternative considered: begin by running format/lint fixes. That can create noisy churn before the integration map is understood.

### 2. Define Route and Layout Ownership Explicitly

Use a route ownership map before consolidation:
- Global root layout: metadata, global CSS, app-wide providers only.
- Storefront route group: public header/footer and public storefront content.
- Auth routes: login/register/system auth pages without duplicated storefront/customer/admin shells unless intentionally shared.
- Customer routes: cart, checkout, payment result, account, profile, addresses, order list, and order detail with customer-appropriate shells.
- Admin routes: admin sidebar/topbar/content shell only.
- System routes: 404, unauthorized, forbidden, route errors, and global error states.

Rationale: Most frontend integration bugs come from duplicate wrappers, route groups resolving to the same URL, or shells leaking across ownership boundaries.

Alternative considered: rely on visual inspection only. That misses duplicate route files and layout-level duplication.

### 3. Treat Service Boundaries As the Mock Removal Line

Production pages should never depend directly on transitional mock arrays or Figma data. If a backend contract is not available, the temporary behavior must live behind a typed service boundary with a documented gap and no page-local persistence.

Rationale: This preserves stable component contracts and makes future backend integration surgical. It also prevents the most dangerous prototype failure: UI that appears to mutate real business state but only changes local arrays.

Alternative considered: leave mock data in individual pages with comments. That spreads debt and makes completion criteria hard to enforce.

### 4. Error Handling Standardization Uses Existing Helpers First

Normalize API and session errors through existing auth, commerce, customer, and admin service helpers. Error categories should include validation, unauthenticated, forbidden, not found, conflict, business-rule, payment, network, and server failures.

Rationale: Consistent recovery is more valuable than bespoke copy on each page. The app needs predictable behavior for expired sessions and failed mutations.

Alternative considered: each component catches and renders errors independently. That increases drift and duplicate submission risk.

### 5. Mutations Must Be Idempotent From the UI Perspective

Every form or high-impact action should guard against duplicate submissions using pending state, disabled controls, request de-duplication, or server-confirmed refresh behavior.

Rationale: Commerce and admin workflows create orders, payments, inventory adjustments, product mutations, voucher changes, and status transitions. Repeated requests can corrupt data or confuse users.

Alternative considered: rely entirely on backend idempotency. Backend protection is still important, but the frontend must not invite accidental duplicate requests.

### 6. Responsive and Accessibility Verification Is Checklist-Driven

Use the fixed viewport set `320px`, `375px`, `768px`, `1024px`, and `1536px`. Verify representative pages and fragile patterns: menus, sidebars, dialogs, tables, sticky summaries, dropdowns, forms, route errors, and JSON/diff panels.

Rationale: The requested viewport set is concrete enough to catch mobile, tablet, laptop, and wide desktop layout regressions. Accessibility needs similarly explicit keyboard/focus/landmark checks.

Alternative considered: only test current browser size. That will miss narrow mobile overflow and wide desktop spacing problems.

### 7. Verification Distinguishes Regression From Existing Failure

Run the actual configured Nx targets for the web app, expected to be discovered through Nx (`lint`, `test`, `build`, and any relevant web target). If a target fails, capture command, failing scope, and whether it existed before this change when that can be established.

Rationale: The user asked to distinguish frontend-introduced failures from pre-existing repository failures. The finalization pass should not hide red builds, but it should also not claim unrelated historical failures as introduced regressions.

Alternative considered: only report pass/fail. That is too coarse for a cross-phase hardening pass.

## Risks / Trade-offs

- Predecessor changes not fully implemented -> Confirm status before finalization and document blocked scope instead of hardening nonexistent routes.
- Duplicate layout cleanup breaks route shells -> Build a route/layout ownership map first and make small, verified consolidations.
- Mock data is still filling real backend gaps -> Move it behind typed service boundaries and document removal conditions.
- Session refresh behavior differs between server and client paths -> Verify both protected route loading and browser-side mutation failures.
- Removing `"use client"` can break interactive components -> Audit component hook/browser API usage before changing directives.
- Responsive checks can become subjective -> Use the required viewport list and concrete failures: overflow, overlap, unusable controls, broken scroll, clipped text.
- Nx targets may fail for historical reasons -> Capture commands and failure evidence, then classify as introduced, pre-existing, or unresolved.
- Broad cleanup risks touching unrelated files -> Scope edits to `apps/web`, related web specs/tests, and necessary config/assets unless a direct dependency requires otherwise.

## Migration Plan

1. Confirm predecessor changes are implemented and note any active unarchived OpenSpec changes.
2. Inventory routes, layouts, navigation, service modules, components, assets, metadata, and tests.
3. Create a route/layout ownership map and remove duplicate shells/routes/navigation only after confirming ownership.
4. Audit auth/session/RBAC flows for guest, customer, and admin routes.
5. Audit API service boundaries and mock-data usage; remove completed mocks and isolate unavoidable temporary mocks.
6. Standardize async states, validation, confirmation, pending guards, and error handling.
7. Review Server/Client Component boundaries, image configuration, metadata, unused code, and obsolete prototype imports.
8. Perform responsive and accessibility verification across the required viewport set.
9. Run actual Nx web lint, test, and build targets; fix introduced failures and classify any residual failures.
10. Produce the final manual end-to-end verification checklist and residual risk notes.

Rollback should be possible through normal version control by reverting scoped finalization edits. Because this change should not add new business capabilities, rollback should restore the previously completed phase implementations rather than requiring data migration.

## Open Questions

- Will `implement-shopvn-customer-account` and `implement-shopvn-admin` be applied before this finalization change, or should finalization tasks explicitly pause until those routes exist?
- Which exact Nx project name should be used for final verification in this workspace if it differs from `web`?
- Are Playwright/browser-based checks configured for the web app, or should responsive verification be documented as manual unless an e2e target exists?
- Which remaining backend gaps, if any, are acceptable to ship behind typed temporary service boundaries?
