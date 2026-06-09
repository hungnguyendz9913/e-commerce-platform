## ADDED Requirements

### Requirement: Admin product category assignment
The system SHALL require admin product create and update operations to assign products only to existing active categories.

#### Scenario: Assign product to active category
- GIVEN an active category exists
- WHEN an authenticated admin creates or updates a product with that category id
- THEN the system assigns the product to the category
- AND returned admin product data includes the assigned category.

#### Scenario: Reject missing category assignment
- GIVEN an authenticated admin submits product data without a category id when category assignment is required
- WHEN `POST /admin/products` is called
- THEN the system rejects the request with a validation error.

#### Scenario: Reject inactive or unknown category assignment
- GIVEN a category does not exist or is inactive
- WHEN an authenticated admin creates or updates a product with that category id
- THEN the system rejects the request with a validation or not-found error
- AND no product category change is persisted.
