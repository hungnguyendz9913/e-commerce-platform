## Why

`ProductsModule` currently owns inventory write behavior such as creating inventory items, validating stock quantities, and recording inventory movements. That blurs module boundaries because stock integrity and movement history are inventory concerns, even when triggered by admin product create or update workflows.

## What Changes

- Refactor admin product create/update orchestration so product persistence stays in `ProductsModule` while inventory item creation, inventory updates, inventory validation, and movement logging are owned by `InventoryModule`.
- Introduce an injectable inventory application service/repository boundary that product workflows can call inside the existing transaction.
- Remove direct inventory movement writes from `ProductsRepository`.
- Preserve existing admin product API behavior, response shapes, transactionality, and validation semantics.
- Update tests so product service specs verify delegation to inventory behavior and inventory specs cover stock item/movement ownership.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `products`: Admin product create/update workflows continue accepting inventory fields, but product management delegates inventory persistence and movement recording to inventory-owned services.
- `inventory`: Inventory owns creation/update of product inventory items, inventory quantity validation, and movement recording even when the operation is initiated by product administration.

## Impact

- Affected code: `apps/api/src/app/products/*`, new or existing `apps/api/src/app/inventory/*`, and related Nest module imports/providers.
- Affected tests: product service tests and new/updated inventory service tests for create/update delegation, validation, and movement logging.
- APIs remain compatible: `/admin/products` request/response behavior should not change.
- Dependencies: `ProductsModule` will depend on an exported inventory service from `InventoryModule`; inventory implementation will continue using database transactions through the shared database client contract.
