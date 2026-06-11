## 1. Inventory Boundary

- [x] 1.1 Create or update `InventoryModule` with exported inventory service and repository providers.
- [x] 1.2 Implement transaction-aware inventory initialization for product creation with default quantity handling.
- [x] 1.3 Implement transaction-aware inventory update for admin product updates with merge, validation, and adjustment movement behavior.
- [x] 1.4 Move inventory movement persistence into inventory-owned repository/service code.

## 2. Product Refactor

- [x] 2.1 Import `InventoryModule` into `ProductsModule` and inject the exported inventory service into `ProductsService`.
- [x] 2.2 Refactor product creation so product data and images remain product-owned while inventory initialization is delegated inside the same transaction.
- [x] 2.3 Refactor product updates so product fields and images remain product-owned while inventory field updates are delegated inside the same transaction.
- [x] 2.4 Remove inventory validation, inventory merge, and movement creation helpers from `ProductsService`.
- [x] 2.5 Remove direct inventory movement creation from `ProductsRepository`.

## 3. Tests

- [x] 3.1 Update product service tests to assert inventory delegation and unchanged API response behavior.
- [x] 3.2 Add inventory service tests for product create initialization, default inventory creation, invalid quantities, stock adjustment movement, and unchanged stock no-op movement behavior.
- [x] 3.3 Update Nest testing module setup and mocks for the new module/service dependency.

## 4. Validation

- [x] 4.1 Run affected API unit tests for products and inventory.
- [x] 4.2 Run lint/typecheck or the repo's equivalent validation command for the touched API packages.
- [x] 4.3 Review the final diff to confirm no database schema or API contract changes were introduced.
