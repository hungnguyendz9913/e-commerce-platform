# Auth Specification

## Purpose

Define account registration, login, logout, token/session handling, password recovery, current identity, and RBAC behavior for guest, customer, and admin access.

## Requirements

### Requirement: Customer registration

The system SHALL allow a guest to register a customer account with valid required account information.

#### Scenario: Successful registration

- GIVEN a guest submits a unique email, valid password, matching confirmation, full name, and optional phone
- WHEN the registration request is processed
- THEN the system creates an active user with a securely hashed password
- AND assigns the `customer` role
- AND returns a response without password or token secret data.

#### Scenario: Duplicate email

- GIVEN an existing user has the submitted email, case-insensitively
- WHEN a guest attempts to register with that email
- THEN the system rejects the request with a conflict error.

### Requirement: Login

The system SHALL authenticate active users with valid credentials and return identity and role claims.

#### Scenario: Successful login

- GIVEN an active customer or admin account exists
- WHEN valid credentials are submitted to `POST /auth/login`
- THEN the system returns an access token, refresh token or equivalent session data, and the user's identity and roles.

#### Scenario: Invalid credentials

- GIVEN the email is unknown, the password is wrong, or the account is inactive
- WHEN login is attempted
- THEN the system rejects the request with an unauthenticated error.

### Requirement: Logout

The system SHALL allow authenticated customers and admins to sign out.

#### Scenario: Logout current session

- GIVEN an authenticated user has an active session
- WHEN `POST /auth/logout` is called
- THEN the system invalidates or revokes the current session
- AND returns success.

### Requirement: Current authenticated identity

The system SHALL expose `/auth/me` for authenticated identity and role information.

#### Scenario: Get current identity

- GIVEN a customer or admin has a valid access token or session
- WHEN `GET /auth/me` is called
- THEN the system returns user id, email, full name, phone, roles, and status
- AND excludes password hashes, refresh token hashes, and secrets.

### Requirement: Password recovery

The system SHALL support forgot/reset password flows when auth code or API contracts include them.

#### Scenario: Forgot password avoids account enumeration

- GIVEN a user submits an email to forgot password
- WHEN the email is unknown or inactive
- THEN the system returns the same generic reset message used for known active users.

#### Scenario: Reset password

- GIVEN a valid password reset token is submitted with a valid new password
- WHEN the reset request is processed
- THEN the system updates the password hash
- AND revokes existing sessions for that user.

### Requirement: JWT and session handling

The system SHALL validate tokens against an active session before treating a request as authenticated.

#### Scenario: Invalid or revoked session

- GIVEN an access token references a revoked or missing session
- WHEN a protected endpoint is called
- THEN the system rejects the request with an unauthenticated error.

### Requirement: RBAC

The system SHALL distinguish public, customer, admin, and gateway access levels.

#### Scenario: Customer blocked from admin route

- GIVEN an authenticated customer without the `admin` role
- WHEN the customer calls an admin-only endpoint
- THEN the system rejects the request with a forbidden error.

#### Scenario: Admin allowed through role guard

- GIVEN an authenticated user has the `admin` role
- WHEN the user calls an admin-only endpoint
- THEN the system allows the request after authentication and role checks pass.
