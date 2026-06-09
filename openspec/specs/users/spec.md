# Users Specification

## Purpose

Define current user profile, profile update, address management, ownership, and admin customer visibility behavior.

## Requirements

### Requirement: Get current profile
The system SHALL allow an authenticated customer or admin to read their profile using `GET /users/me`.

#### Scenario: Profile returned
- GIVEN an authenticated active user
- WHEN `GET /users/me` is called
- THEN the system returns id, email, full name, phone, avatar URL, and status
- AND excludes authentication secrets.

### Requirement: Update current profile
The system SHALL allow an authenticated user to update their own editable profile fields using `PATCH /users/me`.

#### Scenario: Valid profile update
- GIVEN an authenticated user submits valid profile fields
- WHEN the update is processed
- THEN the system saves the allowed fields
- AND returns the updated profile.

#### Scenario: Invalid profile data
- GIVEN an authenticated user submits invalid profile data
- WHEN the update is processed
- THEN the system rejects the request with a validation error.

### Requirement: Manage addresses
The system SHALL allow authenticated users to manage their own delivery addresses.

#### Scenario: List my addresses
- GIVEN an authenticated customer has saved addresses
- WHEN `GET /users/me/addresses` is called
- THEN the system returns only addresses owned by that user.

#### Scenario: Create my address
- GIVEN an authenticated customer submits valid delivery address data
- WHEN `POST /users/me/addresses` is called
- THEN the system creates an address linked to that user.

### Requirement: Customer ownership
The system SHALL prevent customers from viewing or modifying another customer's profile or addresses.

#### Scenario: Cross-customer access denied
- GIVEN customer A is authenticated
- WHEN customer A attempts to access customer B's profile or address resource
- THEN the system rejects the request with a forbidden or not found error.

### Requirement: Admin customer listing
The system SHALL allow admins to list and inspect customers through admin customer endpoints.

#### Scenario: Admin lists customers
- GIVEN an authenticated admin
- WHEN `GET /admin/customers` is called
- THEN the system returns paginated customer records without password hashes or token data.
