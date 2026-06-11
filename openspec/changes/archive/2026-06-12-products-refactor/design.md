## Context

Admin product create/update currently persists product data and inventory data in one `ProductsService` flow. The service validates inventory quantities, creates or upserts the product inventory item, and writes inventory movements through `ProductsRepository`.

This works functionally, but the ownership is wrong: product management should orchestrate a product lifecycle operation, while inventory should own stock quantity rules, inventory item persistence, and movement logging. Existing APIs and specs already expose inventory as part of product administration, so this change is a module boundary refactor rather than a user-facing API redesign.

## Goals / Non-Goals

**Goals:**

- Move inventory item creation/update validation and movement creation into `InventoryModule`.
- Keep `/admin/products` create/update behavior, response shape, errors, and transactionality compatible.
- Let `ProductsService` coordinate product persistence and call inventory-owned operations when inventory input is present or default initialization is required.
- Remove direct inventory movement writes from `ProductsRepository`.
- Add focused tests around product-to-inventory delegation and inventory-owned stock behavior.

**Non-Goals:**

- Change database schema or API contracts.
- Introduce new admin inventory endpoints.
- Change public product listing/detail inventory read behavior.
- Rework checkout stock deduction.

## Decisions

1. Export an inventory application service from `InventoryModule`.

   `InventoryModule` will provide an injectable service with transaction-aware methods such as `initializeProductInventory` and `updateProductInventoryFromAdminProduct`. These methods accept the shared database client/transaction so product creation, product update, inventory mutation, and movement logging remain atomic.

   Alternative considered: move all product create/update into inventory. Rejected because product identity, SKU/slug uniqueness, category assignment, and image writes remain product concerns.

2. Keep product APIs as orchestration entry points.

   Admin product create/update will continue to accept inventory fields and return inventory fields in product responses. `ProductsService` will validate product-only concerns, create/update product records, and delegate inventory work to the inventory service inside the same transaction.

   Alternative considered: require callers to use inventory endpoints after product creation. Rejected because it would break current API behavior and create a multi-request consistency problem.

3. Keep inventory reads in product query includes for response shaping.

   Product listing/detail responses still include inventory summary fields, and product filters may still query `inventoryItem`. This is read-model composition rather than ownership of inventory writes.

   Alternative considered: make product responses call inventory service for every row. Rejected because it would add unnecessary query overhead and complicate pagination/filtering.

4. Move movement creation out of `ProductsRepository`.

   Inventory movement persistence belongs to an inventory repository/service. Product repository should persist products, images, category lookups, and delete/archive metadata only.

   Alternative considered: leave the repository method and call it from inventory service. Rejected because it preserves the incorrect dependency direction and keeps inventory persistence hidden under product infrastructure.

## Risks / Trade-offs

- Product and inventory modules can become circularly dependent -> Mitigation: export only the inventory service needed by product workflows and avoid importing product services into inventory.
- Transaction client typing can leak implementation details -> Mitigation: use the existing shared `DbClient` type already used by repositories/services.
- Product update ordering can accidentally change response data -> Mitigation: perform inventory mutation inside the transaction and return/reload product with existing includes after inventory changes when needed.
- Test mocks may become more layered -> Mitigation: keep product tests focused on delegation and add inventory service tests for detailed validation and movement behavior.

## Migration Plan

1. Add `InventoryModule` service/repository providers if they do not already exist.
2. Export the inventory service and import `InventoryModule` into `ProductsModule`.
3. Move inventory validation, inventory item create/update, and movement creation logic from `ProductsService`/`ProductsRepository` to inventory-owned code.
4. Update product service tests and add inventory service tests.
5. Run the affected API test suite.

Rollback is code-only: revert the module/service refactor while keeping database schema and API contracts unchanged.
