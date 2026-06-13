## Context

The products module already separates public catalog endpoints (`ProductsController`) from admin management endpoints (`AdminProductsController`) and routes both through `ProductsService` and `ProductsRepository`. The service owns product validation and response shaping, while inventory persistence and movement recording are delegated to `InventoryService`.

The change should complete the existing flow rather than introduce a new API shape. Public routes must expose only visible products, while admin routes must be protected by JWT and admin role checks and must operate across all product statuses and approval states.

## Goals / Non-Goals

**Goals:**

- Preserve the existing REST routes: `GET /products`, `GET /products/:id`, and CRUD routes under `/admin/products`.
- Keep product controllers thin: bind DTOs and route params, then delegate to `ProductsService`.
- Ensure product service behavior covers public visibility, admin management, SKU/slug conflicts, active category validation, image replacement, inventory delegation, and delete/archive decisions.
- Add focused tests for controller metadata/delegation and service/repository behavior needed by the full flow.

**Non-Goals:**

- No database schema changes.
- No product approval workflow UI or audit log workflow.
- No inventory ownership changes; products continue to call inventory-owned APIs for inventory item changes.
- No breaking changes to product DTO names or route paths.

## Decisions

- Use separate public and admin controllers.
  - Rationale: The repo already has `ProductsController` and `AdminProductsController`; keeping them separate makes route protection and public visibility easier to reason about.
  - Alternative considered: One controller with mixed route prefixes. This would increase guard/role annotation noise and make accidental exposure more likely.

- Keep controllers as delegation-only entry points.
  - Rationale: Validation belongs in DTOs/pipes and service methods; business logic in controllers would be harder to test and duplicate across flows.
  - Alternative considered: Add controller-level branching for visibility and deletion behavior. This would couple HTTP routes to persistence rules.

- Keep public visibility in repository/service queries.
  - Rationale: `GET /products` and `GET /products/:id` must consistently hide inactive, archived, pending, and rejected products. Centralizing this in service/repository methods avoids per-controller filtering mistakes.
  - Alternative considered: Fetch admin-style product records and filter after retrieval. This could leak data through counts or detail responses.

- Continue delegating inventory writes to `InventoryService`.
  - Rationale: Inventory owns stock item initialization, updates, and movement recording. Products should validate product-owned fields and pass inventory DTOs across the existing boundary.
  - Alternative considered: Write inventory records directly in `ProductsService`. This would duplicate inventory rules and increase transaction risk.

- Archive instead of delete when protected commerce references exist.
  - Rationale: Products with order/cart/inventory movement references need historical integrity. Products without protected references can be hard-deleted with cascading dependent rows.
  - Alternative considered: Always archive. This is safer but leaves unnecessary inactive records for products with no commerce history.

## Risks / Trade-offs

- Public/admin visibility rules diverge over time -> Add service tests that assert public queries require active and approved products while admin queries honor requested status filters.
- Inventory delegation changes break product create/update flows -> Keep tests asserting `initializeProductInventory` and `updateProductInventoryFromAdminProduct` calls with transaction clients.
- Delete/archive protected reference coverage misses a relation -> Keep the protected-reference check centralized in repository selection and include cart, order, and inventory movement counts.
- Controller route metadata regresses during refactors -> Add lightweight controller tests for route prefixes, guards, roles, and service delegation.

## Migration Plan

No database migration is required. Deploy as an API code and test change. Rollback is the previous products module implementation.
