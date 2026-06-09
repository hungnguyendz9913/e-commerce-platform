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
The system SHALL allow admins to create, update, deactivate, and manage products.

#### Scenario: Admin creates product
- GIVEN an authenticated admin submits valid product data with unique SKU and slug
- WHEN `POST /admin/products` is called
- THEN the system creates the product and associated images or inventory setup required by the design.

#### Scenario: Duplicate SKU or slug
- GIVEN another product already has the submitted SKU or slug
- WHEN an admin creates or updates a product
- THEN the system rejects the request with a conflict error.
