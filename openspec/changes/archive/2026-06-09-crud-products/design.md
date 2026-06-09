## Context

The API is a Nest application with auth and role guards already present. Catalog data is modeled in Prisma under `libs/infrastructure/database`: products have unique SKU and slug, a required category, optional images, status and approval status enums, and at most one inventory item. The current OpenSpec contracts define public product browsing and broad admin product management, but the API code does not yet expose product/category/inventory modules.

This change implements admin product CRUD through protected `/admin/products` endpoints while keeping public `/products` behavior limited to active and approved products. It must preserve existing database integrity rules: non-negative product price, non-negative inventory quantities, reserved quantity not exceeding stock, unique SKU and slug, and one inventory item per product.

## Goals / Non-Goals

**Goals:**
- Add admin product list, detail, create, update, and delete/archive endpoints guarded by admin RBAC.
- Validate product payloads before persistence, including category existence, unique SKU/slug, enum values, image shape, price, and inventory quantities.
- Persist product, images, and inventory updates consistently in database transactions.
- Return admin product listing data with category, image, status, approval status, and inventory summaries.
- Keep public product listing/detail visibility restricted to active and approved products.

**Non-Goals:**
- Build admin web UI screens for product management.
- Add bulk import/export, advanced merchandising, variants, multi-category assignment, or product approval workflows beyond status fields.
- Redesign the Prisma schema unless implementation reveals a missing required field.
- Implement checkout inventory deduction or public category management.

## Decisions

1. Implement one `ProductsModule` with route controllers for public and admin product operations.
   - Rationale: product CRUD, public reads, category relation loading, images, and inventory summaries share query and mapping logic.
   - Alternative considered: a separate `AdminProductsModule`. That would isolate admin concerns but duplicate product lookup and response-mapping code before the domain is large enough to need it.

2. Mount admin product routes as `/admin/products` and protect them with `JwtAuthGuard`, `RolesGuard`, and the existing `Roles('admin')` decorator.
   - Rationale: this follows the existing `/admin` contract and centralizes authorization at the controller boundary.
   - Alternative considered: checking roles inside service methods. That is easier to forget and makes service tests mix authorization with domain behavior.

3. Use DTO validation for request shape and service validation for database-dependent rules.
   - Rationale: class-validator-style DTOs are appropriate for required fields, enum values, numeric bounds, and image array shape; service-level checks are needed for category existence and SKU/slug uniqueness.
   - Alternative considered: rely only on Prisma constraints. That would still protect the database but would produce less precise API errors and miss inactive-category business rules.

4. Treat product create/update with images and inventory as transactional writes.
   - Rationale: admins should not end up with a product row without its intended initial inventory or with partially replaced images.
   - Create creates the product, optional images, and exactly one inventory item in one transaction.
   - Update updates scalar product fields, replaces image collection when images are provided, and updates the inventory item when inventory fields are provided.
   - Alternative considered: separate inventory endpoint only. The existing inventory endpoint remains valid for stock adjustments, but product create/edit needs initial inventory fields for catalog setup.

5. Prefer archival over hard deletion whenever commerce history references the product.
   - Rationale: cart, order item, inventory movement, and audit relationships can make hard deletion unsafe or impossible. `DELETE /admin/products/{id}` should hard-delete only when no protected references exist; otherwise it sets status to `ARCHIVED` and removes public visibility.
   - Alternative considered: always hard delete. That conflicts with order-history integrity and product snapshots.

6. Keep inventory movement logging for explicit stock adjustments, not every product metadata edit.
   - Rationale: changing product name, price, category, status, or images is not inventory movement. When create or update changes stock quantity, record an `IMPORT` movement for initial stock and an `ADJUSTMENT` movement for later stock changes with before/after quantities.
   - Alternative considered: no movement on create. That would make initial stock less auditable.

## Risks / Trade-offs

- Validation drift between DTOs and Prisma constraints -> Keep service tests around conflict mapping, non-negative values, reserved quantity, and category checks.
- Replacing all images on update can be heavy for minor image edits -> Accept for first CRUD implementation; add per-image endpoints later if needed.
- Archive-or-delete behavior can surprise API consumers -> Return the resulting product status or deletion outcome so callers know whether the product was removed or archived.
- Admin list joins can become expensive as catalog grows -> Paginate by default, restrict sortable fields, and include only summary relation fields.
- Product update that directly changes stock can bypass a dedicated inventory workflow -> Record an inventory movement and preserve non-negative/reserved constraints.

## Migration Plan

No schema migration is expected because the existing Prisma schema already includes products, product images, categories, inventory items, and status enums. If implementation finds generated Prisma types are stale, regenerate the database client from `libs/infrastructure/database/prisma/schema.prisma` and include that generated update with the implementation.

Rollback is limited to removing the new API module/routes and tests. Existing database tables and public contracts remain compatible.

## Open Questions

- Should admin create default `approvalStatus` to `PENDING` unless explicitly provided, or allow admins to create directly as `APPROVED`? The design allows explicit admin-provided values while preserving Prisma defaults when omitted.
- Should archived products remain visible in admin listings by default? The design includes them only when admin filters request archived status or the listing default is documented to include all statuses.
