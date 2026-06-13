## Why

The product API flow is central to catalog browsing, cart validation, and admin catalog management, but the implementation needs to be completed and hardened around the existing public/admin controller contract. Completing this flow now reduces drift between the product OpenSpec, DTO contracts, service behavior, and tests before more commerce features depend on it.

## What Changes

- Complete the public product controller flow for listing visible products and retrieving visible product details.
- Complete the admin product controller flow for listing, creating, reading, updating, and deleting or archiving products.
- Ensure controller methods delegate to product service methods with the expected DTOs, route parameters, guards, and admin role metadata.
- Ensure service/repository behavior covers filtering, sorting, pagination, public visibility rules, active category validation, SKU/slug uniqueness, image replacement, inventory delegation, and delete-versus-archive decisions.
- Add or update focused tests for controller route wiring and service behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `products`: Clarify and complete the required public and admin product controller flow, including visibility, admin management, inventory delegation, and protected-reference archival behavior.

## Impact

- Affected API modules: `apps/api/src/app/products/products.controller.ts`, `apps/api/src/app/products/admin-products.controller.ts`, `apps/api/src/app/products/products.service.ts`, `apps/api/src/app/products/products.repository.ts`, and product tests.
- Affected contracts: product DTO usage from `@e-commerce-platform/api-contracts`; no breaking contract changes expected.
- Affected systems: product catalog, admin product management, inventory initialization/update delegation, cart product lookup dependency.
