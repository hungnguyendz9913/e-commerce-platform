# Products Specification

## Purpose

Define public product catalog behavior and admin product management expectations.

## Requirements

### Requirement: Public product listing

The system SHALL expose a public paginated product listing.

#### Scenario: List visible products

- GIVEN products exist with different statuses and approval states
- WHEN `GET /products` is called
- THEN the system returns only active and approved products
- AND includes pagination metadata.

### Requirement: Search, filter, sort, and paginate products

The system SHALL support product search, filtering, sorting, and pagination.

#### Scenario: Filtered product search

- GIVEN visible products exist across categories, prices, and stock states
- WHEN a user supplies `q`, category, price, stock, sort, page, and limit parameters
- THEN the system returns products matching the supported filters
- AND orders and paginates results consistently.

### Requirement: Product detail

The system SHALL expose public product details for visible products.

#### Scenario: View product detail

- GIVEN an active and approved product exists
- WHEN `GET /products/{id}` is called
- THEN the system returns product details including price, description, images, category, and inventory status.

#### Scenario: Hidden product detail

- GIVEN a product is inactive, archived, pending approval, or rejected
- WHEN a public user requests its detail
- THEN the system responds as not found or not visible.

### Requirement: Admin product CRUD

The system SHALL allow admins to create, read, update, delete or archive, and manage products with validation for identity, category assignment, pricing, status, approval state, images, and inventory fields.

#### Scenario: Admin creates product

- GIVEN an authenticated admin submits valid product data with unique SKU and slug, an existing active category, non-negative price, valid status and approval status, valid image data, and valid inventory quantities
- WHEN `POST /admin/products` is called
- THEN the system creates the product
- AND assigns it to the category
- AND stores submitted images
- AND creates exactly one inventory item for the product
- AND records an initial inventory movement when initial stock is greater than zero.

#### Scenario: Admin reads product detail

- GIVEN an authenticated admin requests an existing product
- WHEN `GET /admin/products/{id}` is called
- THEN the system returns the product regardless of public visibility
- AND includes category, images, status, approval status, stock quantity, reserved quantity, created timestamp, and updated timestamp.

#### Scenario: Admin updates product

- GIVEN an authenticated admin submits valid product updates for an existing product
- WHEN `PATCH /admin/products/{id}` is called
- THEN the system updates provided product fields only
- AND validates any changed SKU, slug, category, price, status, approval status, images, or inventory fields
- AND updates images when an image collection is provided
- AND updates the product inventory item when inventory fields are provided
- AND records an inventory adjustment movement when stock quantity changes.

#### Scenario: Admin deletes product without protected references

- GIVEN an authenticated admin requests deletion of a product that has no order items, cart items, inventory movements, or other protected commerce references
- WHEN `DELETE /admin/products/{id}` is called
- THEN the system deletes the product and cascading product images and inventory item
- AND subsequent admin detail lookup returns not found.

#### Scenario: Admin archives product with protected references

- GIVEN an authenticated admin requests deletion of a product that has protected commerce references
- WHEN `DELETE /admin/products/{id}` is called
- THEN the system sets the product status to archived instead of hard deleting it
- AND the product is excluded from public product listing and detail visibility.

#### Scenario: Duplicate SKU or slug

- GIVEN another product already has the submitted SKU or slug
- WHEN an admin creates or updates a product
- THEN the system rejects the request with a conflict error.

#### Scenario: Invalid product create or update payload

- GIVEN an authenticated admin submits invalid product data
- WHEN `POST /admin/products` or `PATCH /admin/products/{id}` is called
- THEN the system rejects the request with a validation error
- AND no product, image, or inventory changes are persisted.

### Requirement: Admin product listing management

The system SHALL expose an admin product listing that supports pagination, search, filters, sorting, and management summary fields.

#### Scenario: Admin lists products

- GIVEN products exist across categories, statuses, approval states, prices, and stock states
- WHEN an authenticated admin calls `GET /admin/products` with pagination, search, filter, and sorting query parameters
- THEN the system returns matching products with pagination metadata
- AND each product includes category, primary image, status, approval status, price, SKU, slug, stock quantity, reserved quantity, created timestamp, and updated timestamp.

#### Scenario: Admin filters managed products

- GIVEN products exist with different category, status, approval status, price, and inventory states
- WHEN an authenticated admin supplies supported filters including `q`, `categoryId`, `status`, `approvalStatus`, `minPrice`, `maxPrice`, and `inStock`
- THEN the system returns products matching those filters regardless of public visibility
- AND orders and paginates results consistently.

#### Scenario: Non-admin cannot manage products

- GIVEN a guest or authenticated non-admin user
- WHEN the user calls any `/admin/products` endpoint
- THEN the system rejects the request with an unauthenticated or forbidden error.
