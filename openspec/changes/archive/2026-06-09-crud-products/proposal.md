## Why

Admin product management is currently defined only at a broad level, which leaves key operational behavior ambiguous for create, read, update, delete, inventory setup, category assignment, and listing workflows. This change makes product CRUD explicit so admins can reliably manage the catalog without bypassing validation, visibility, or inventory rules.

## What Changes

- Add complete admin product CRUD behavior for creating, reading, updating, deleting, and deactivating products.
- Define validation for product identity, pricing, status, approval state, category assignment, images, and inventory fields.
- Require product create and update flows to validate assigned categories and preserve SKU and slug uniqueness.
- Add admin product listing management with pagination, search, filters, sorting, and visibility of status, approval, category, and inventory summary fields.
- Define deletion behavior that protects historical commerce records and uses archival/deactivation when hard deletion is unsafe.
- Ensure product create and update operations initialize or update the product inventory record consistently.

## Capabilities

### New Capabilities

### Modified Capabilities

- `products`: Clarify admin product create, read, update, delete, validation, listing, status, approval, category assignment, and inventory-field behavior.
- `categories`: Clarify category assignment requirements for admin product create and update operations.
- `inventory`: Clarify how admin product create and update operations initialize and maintain inventory fields.
- `admin`: Clarify admin product listing management and CRUD access expectations under `/admin/products`.

## Impact

- API: `/admin/products` endpoints for list, create, detail, update, delete/archive, and product listing management filters.
- Backend: product DTO validation, service logic, Prisma persistence, category existence checks, inventory record creation/update, uniqueness conflict handling, and admin RBAC guards.
- Data: products, product images, product-category relation, inventory items, and any references from cart/order/order-item history that affect deletion behavior.
- Tests: focused API/service tests for validation, category assignment, inventory fields, listing filters, RBAC, uniqueness conflicts, update behavior, and deletion/archive rules.
