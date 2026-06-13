## Why

Product catalog and admin product management behavior is already defined in the docs and OpenSpec product requirements, but the API E2E coverage only exercises auth/profile flows. Adding focused product API E2E tests reduces regression risk around public catalog visibility, product detail, admin CRUD, validation, and access control.

## What Changes

- Add API E2E coverage for product endpoints using Playwright-compatible request testing patterns within the API E2E project.
- Keep the API E2E test folder clean and scalable by grouping product tests under a dedicated product test area with reusable setup, fixtures, and helpers.
- Use `docs/api_documentation.md` as the source of truth for endpoint paths, access level, request payloads, and response shape expectations.
- Cover public product list/detail behavior and admin product list/create/update/delete behavior at the API boundary.
- Cover negative paths including hidden public products, invalid payloads, duplicate SKU or slug, and guest/non-admin admin access rejection.

## Capabilities

### New Capabilities
- `product-api-e2e-tests`: Defines the expected API E2E test coverage and structure for product endpoints, using the docs as the source of truth.

### Modified Capabilities

None.

## Impact

- Affected test project: `apps/api-e2e`.
- Affected source-of-truth docs: `docs/api_documentation.md`.
- Affected behavior under test: `GET /products`, `GET /products/{id}`, `GET /admin/products`, `POST /admin/products`, `PATCH /admin/products/{productId}`, and `DELETE /admin/products/{productId}`.
- No runtime API behavior or database schema changes are intended.
