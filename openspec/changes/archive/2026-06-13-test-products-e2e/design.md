## Context

The API E2E project currently contains a small Jest/Nest test suite under `apps/api-e2e/src/api`, while the workspace already has Playwright installed and configured for web E2E. Product API behavior is documented in `docs/api_documentation.md` and covered by the existing `openspec/specs/products/spec.md`, including public listing/detail and admin CRUD/access-control scenarios.

This change adds product API E2E tests only. The tests must keep `apps/api-e2e` scalable by avoiding one large spec file and by placing product-specific fixtures, request helpers, and assertions in a dedicated product test area.

## Goals / Non-Goals

**Goals:**

- Add Playwright API request tests for product endpoints defined in `docs/api_documentation.md`.
- Keep product E2E files organized under a dedicated product API folder with reusable helpers and fixtures.
- Cover public product list/detail, admin list/create/update/delete, validation/conflict paths, and admin access rejection.
- Make `npx nx e2e api-e2e` execute the new product API E2E tests.

**Non-Goals:**

- Change runtime product API behavior, DTO contracts, persistence models, or database schema.
- Add browser UI product E2E coverage.
- Rework unrelated auth/profile E2E coverage unless needed for the API E2E runner migration.

## Decisions

1. Use Playwright request testing for API E2E.

   Rationale: The request explicitly asks for API E2E Playwright tests and the workspace already includes `@playwright/test` plus Nx Playwright support. Playwright's `request` fixture fits API boundary tests without browser overhead.

   Alternative considered: Continue with Jest and Axios. This matches the current `apps/api-e2e` file, but it does not satisfy the Playwright requirement and keeps API E2E split from the workspace's E2E toolchain direction.

2. Introduce a clean product test module under `apps/api-e2e/src/api/products`.

   Rationale: Product coverage spans public endpoints, admin endpoints, fixtures, and request helpers. A dedicated folder prevents the test area from becoming a flat collection of large files and makes later catalog, inventory, and admin tests easier to add.

   Expected structure:

   - `apps/api-e2e/src/api/products/products.public.spec.ts`
   - `apps/api-e2e/src/api/products/products.admin.spec.ts`
   - `apps/api-e2e/src/api/products/fixtures.ts`
   - `apps/api-e2e/src/api/products/helpers.ts`

   Alternative considered: Add one `products.spec.ts` file directly under `src/api`. This is quicker initially but will not scale cleanly as negative cases and admin flows grow.

3. Treat `docs/api_documentation.md` as the contract for endpoints and response shapes.

   Rationale: The user explicitly identified the docs folder as the source of truth. The tests should assert documented paths, access levels, request payload fields, and response envelope shapes, while using the existing codebase only to wire the test application and mocks.

   Alternative considered: Derive expectations directly from controllers/services. That can duplicate implementation details and weakens the tests as contract checks.

4. Use isolated Nest test application wiring with mocked product service behavior unless a real test database harness already exists.

   Rationale: The current API E2E suite starts an in-memory Nest application with mocked services and validates routing, guards, validation pipes, status codes, and response envelopes. Product tests can follow that local pattern while focusing on API contracts.

   Alternative considered: Run against the full API server and database. This would provide deeper integration coverage but requires stable seeding, cleanup, and database lifecycle support that is outside this change's stated scope.

## Risks / Trade-offs

- Playwright migration can disrupt existing API E2E execution -> Keep the runner change narrow and verify `npx nx e2e api-e2e`.
- Mocked service tests may miss repository/database regressions -> Scope assertions to documented API boundary behavior and leave database-backed product integration for a later dedicated change.
- Admin auth guard setup can become duplicated -> Centralize test auth helpers for admin, customer, and guest request states.
- Docs and implementation may currently disagree on exact field names -> Follow `docs/api_documentation.md` first and document any discovered mismatch during implementation instead of silently encoding implementation-only behavior.
