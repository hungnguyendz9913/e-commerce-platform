## Context

The voucher module exposes public discovery endpoints for active vouchers by product or category and admin endpoints for voucher creation, listing, detail, update-before-start, and deactivation. The repository already has Playwright request-based API E2E tests under `apps/api-e2e/src/api`, shared Nest test-app helpers in `apps/api-e2e/src/support/api-test-app.ts`, and cart/product API E2E suites that validate routes, guards, validation pipes, status codes, response envelopes, and service delegation with mocked services.

The runtime voucher requirements already exist in `openspec/specs/vouchers/spec.md`, while this change adds E2E coverage for the HTTP boundary. The implementation should avoid database lifecycle work unless a stable database-backed API E2E harness already exists.

## Goals / Non-Goals

**Goals:**

- Add Playwright API request tests for voucher public discovery endpoints.
- Add Playwright API request tests for admin voucher management endpoints.
- Verify public voucher discovery requests delegate route params to `VoucherService` and return documented response envelopes.
- Verify admin voucher requests require an admin role, reject guests/customers, and do not call `VoucherService` when access is denied.
- Verify DTO validation for create, update, and query payloads where the route boundary has validation metadata available.
- Keep voucher E2E fixtures and helpers organized in a dedicated voucher API test area.

**Non-Goals:**

- Add browser UI voucher tests.
- Add checkout voucher application E2E tests for `POST /checkout/voucher`.
- Add database-backed voucher integration tests, seed data, or transaction cleanup.
- Change voucher discount calculation, scope applicability, redemption rules, persistence schema, or DTO contracts beyond minimal route wiring needed for the existing controller contract.
- Rework unrelated API E2E tests.

## Decisions

1. Use the existing Playwright API E2E style with an isolated Nest test application.

   Rationale: `apps/api-e2e` already validates controller routing, global prefix handling, guards, pipes, error handling, and response shape through lightweight Nest applications and `APIRequestContext`. This keeps voucher route tests deterministic and consistent with cart/product coverage.

   Alternative considered: Drive tests through the full `AppModule` and a real database. That would exercise more integration paths, but it requires reliable voucher/product/category/user seeds and cleanup outside this change's scope.

2. Create a dedicated voucher API E2E folder.

   Rationale: Voucher tests need reusable fixtures for voucher records, create/update payloads, list responses, ids, and service mock helpers. A folder such as `apps/api-e2e/src/api/vouchers` keeps the suite consistent with the existing API E2E organization.

   Expected structure:

   - `apps/api-e2e/src/api/vouchers/vouchers.public.spec.ts`
   - `apps/api-e2e/src/api/vouchers/vouchers.admin.spec.ts`
   - `apps/api-e2e/src/api/vouchers/fixtures.ts`
   - `apps/api-e2e/src/api/vouchers/helpers.ts`

   Alternative considered: Put all voucher scenarios in a single spec file. That is simpler initially but becomes harder to scan as public and admin cases grow.

3. Mock `VoucherService` at the API boundary.

   Rationale: The target of this change is HTTP behavior: paths, methods, role protection, validation, status codes, response envelopes, and service delegation. Mocking `VoucherService` mirrors the current cart API E2E approach and avoids database flake.

   Alternative considered: Mock `VoucherRepository` under a real `VoucherService`. That would test more business logic but belongs in service or integration coverage and would make route tests harder to maintain.

4. Reconcile the tests with the implemented controller and service contract during apply.

   Rationale: The current controller references multiple voucher service methods and voucher DTOs, while the checked-out service/contract files appear narrower. Implementation should first align the voucher test mock with the controller's actual dependency surface and add only minimal route-boundary wiring fixes if needed.

   Alternative considered: Narrow the E2E proposal to the single service method currently visible. That would leave most controller routes untested and miss the admin flow the module is expected to expose.

## Risks / Trade-offs

- Voucher controller/service contracts may be mid-implementation -> During apply, inspect current methods and DTO exports before writing helpers; make minimal controller or service signature fixes only when required for tests to compile.
- Admin guard wiring may rely on global configuration not present in the isolated test app -> Include `RolesGuard` and override `JwtAuthGuard` in voucher helpers, mirroring cart tests.
- Mocked service tests can miss discount calculation or repository regressions -> Keep these e2e tests focused on API boundary behavior and leave voucher rules to service/unit/integration tests.
- Public discovery response shapes may not be fully documented -> Use stable voucher fixture envelopes and assert key fields rather than overfitting to incidental serialization details.
