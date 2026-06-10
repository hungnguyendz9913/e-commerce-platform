## ADDED Requirements

### Requirement: Product CRUD inventory fields

The system SHALL allow admin product create and update operations to initialize and maintain the product inventory item while preserving inventory integrity rules.

#### Scenario: Create product with initial inventory

- GIVEN an authenticated admin submits a product create payload with valid stock quantity and reserved quantity
- WHEN `POST /admin/products` is called
- THEN the system creates exactly one inventory item for the product
- AND stores the submitted stock quantity and reserved quantity
- AND rejects the request if either quantity is negative or reserved quantity exceeds stock quantity.

#### Scenario: Create product without initial inventory values

- GIVEN an authenticated admin submits a valid product create payload without inventory quantities
- WHEN `POST /admin/products` is called
- THEN the system creates exactly one inventory item for the product
- AND defaults stock quantity and reserved quantity to zero.

#### Scenario: Update product inventory fields

- GIVEN an authenticated admin submits valid inventory fields for an existing product
- WHEN `PATCH /admin/products/{id}` is called
- THEN the system updates the product inventory item
- AND records an inventory adjustment movement when stock quantity changes
- AND rejects the request if stock quantity or reserved quantity would violate inventory integrity rules.
