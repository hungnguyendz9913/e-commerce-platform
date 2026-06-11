# Users Spec Delta

## ADDED Requirements

### Requirement: Baseline current profile endpoint

The system SHALL provide `/users/me` as the profile endpoint for authenticated customers and admins.

#### Scenario: Get current profile

- GIVEN an authenticated active user
- WHEN `GET /users/me` is called
- THEN the system returns current profile fields including id, email, full name, phone, avatar URL, and status
- AND excludes authentication secrets and role-management internals.

### Requirement: Customer ownership baseline

The system SHALL enforce ownership for customer-owned resources.

#### Scenario: Own profile access

- GIVEN a customer is authenticated
- WHEN the customer calls `/users/me`
- THEN the system uses the authenticated user id from the server-side session or token
- AND never trusts a client-supplied user id to select the profile.

#### Scenario: Future customer resource ownership

- GIVEN a customer-owned resource such as address, cart, order, or payment exists
- WHEN a customer attempts to access that resource
- THEN the system verifies the authenticated user owns the resource before returning or modifying it.

### Requirement: Admin customer access baseline

The system SHALL separate customer self-service profile access from admin customer management.

#### Scenario: Admin customer listing

- GIVEN an authenticated admin requests customer management data
- WHEN the admin endpoint is called
- THEN the system returns customer-safe records without password hashes or token data.
