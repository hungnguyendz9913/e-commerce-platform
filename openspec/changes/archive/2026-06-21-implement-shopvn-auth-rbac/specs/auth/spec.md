## ADDED Requirements

### Requirement: Web login form
The web app SHALL provide a real login form that authenticates against the existing auth API contract with email and password credentials.

#### Scenario: Successful web login redirects to intended destination
- **GIVEN** a guest is on the login page with a valid `redirectTo` destination
- **WHEN** the guest submits valid email and password credentials
- **THEN** the web app calls `POST /auth/login`
- **AND** stores the resulting session according to the web auth storage strategy
- **AND** redirects the user to the safe intended destination.

#### Scenario: Successful web login without intended destination
- **GIVEN** a guest is on the login page without a valid `redirectTo` destination
- **WHEN** the guest submits valid email and password credentials
- **THEN** the web app signs the user in
- **AND** redirects customers to the storefront default authenticated destination
- **AND** redirects admins to the admin default destination when the user has the `admin` role.

#### Scenario: Invalid web login
- **GIVEN** a guest submits invalid login credentials
- **WHEN** the API rejects the login request as unauthenticated
- **THEN** the web app keeps the guest on the login page
- **AND** displays an error without revealing whether the email or password was wrong.

#### Scenario: Figma demo login excluded
- **WHEN** the login implementation is inspected
- **THEN** it does not authenticate by email lookup only
- **AND** it does not include quick-fill demo account controls
- **AND** it does not include a role switcher.

### Requirement: Web registration form
The web app SHALL provide a customer registration form that uses the existing registration API contract and creates customer accounts only.

#### Scenario: Successful web registration
- **GIVEN** a guest submits a unique email, valid password, matching confirmation, full name, and optional phone
- **WHEN** the registration request succeeds through `POST /auth/register`
- **THEN** the web app presents a successful registration state
- **AND** offers navigation to login.

#### Scenario: Registration validation errors
- **GIVEN** a guest submits missing, malformed, duplicate, or policy-invalid registration data
- **WHEN** client validation or the API rejects the request
- **THEN** the web app displays actionable field or form errors
- **AND** does not create a local authenticated session unless the API explicitly returns one.

#### Scenario: Registration creates no admin role
- **WHEN** a guest registers through the web registration form
- **THEN** the submitted payload does not allow selecting `admin` or any other privileged role.

### Requirement: Web current-user session handling
The web app SHALL restore, refresh, and clear authenticated current-user state using the existing auth API contract.

#### Scenario: Restore current user
- **GIVEN** the web app has a stored session
- **WHEN** authenticated UI or route protection needs current-user state
- **THEN** the web app validates the session with `GET /auth/me` or equivalent server-side session verification
- **AND** exposes the user's id, email, full name, phone, roles, and status to web auth consumers.

#### Scenario: Refresh expired access token
- **GIVEN** the access token has expired and a refresh token or equivalent session credential exists
- **WHEN** current-user restoration or an authenticated API call receives an unauthenticated response
- **THEN** the web app attempts `POST /auth/refresh`
- **AND** retries the original current-user lookup or authenticated request once after a successful refresh.

#### Scenario: Failed refresh clears session
- **GIVEN** the stored session is invalid, revoked, or expired
- **WHEN** refresh or current-user restoration fails
- **THEN** the web app clears local session state
- **AND** treats the visitor as `guest`.

### Requirement: Web logout
The web app SHALL let authenticated customers and admins log out of the current session.

#### Scenario: Logout current web session
- **GIVEN** an authenticated user is signed in through the web app
- **WHEN** the user activates logout
- **THEN** the web app calls `POST /auth/logout` when an access token or equivalent credential is available
- **AND** clears stored session state
- **AND** redirects to a public storefront destination.

#### Scenario: Logout handles revoked session
- **GIVEN** the locally stored session has already expired or been revoked
- **WHEN** the user activates logout
- **THEN** the web app still clears stored session state
- **AND** does not leave the UI in an authenticated state.

### Requirement: Web RBAC route protection
The web app SHALL distinguish guest, customer, and admin access for protected App Router routes.

#### Scenario: Guest blocked from customer route
- **GIVEN** a guest navigates directly to a customer-protected route
- **WHEN** route protection evaluates the request
- **THEN** the web app redirects to login or renders the unauthorized page
- **AND** preserves a safe `redirectTo` value for post-login navigation.

#### Scenario: Guest blocked from admin route
- **GIVEN** a guest navigates directly to an admin-protected route
- **WHEN** route protection evaluates the request
- **THEN** the web app redirects to login or renders the unauthorized page
- **AND** preserves a safe `redirectTo` value for post-login navigation.

#### Scenario: Customer blocked from admin route
- **GIVEN** an authenticated user has the `customer` role and lacks the `admin` role
- **WHEN** the user navigates to an admin-protected route
- **THEN** the web app renders or redirects to a forbidden state
- **AND** does not render admin-protected content.

#### Scenario: Admin allowed on admin route
- **GIVEN** an authenticated user has the `admin` role
- **WHEN** the user navigates to an admin-protected route
- **THEN** the web app allows the protected route content to render.

#### Scenario: Customer allowed on customer route
- **GIVEN** an authenticated user has the `customer` role
- **WHEN** the user navigates to a customer-protected route
- **THEN** the web app allows the protected route content to render.

### Requirement: Web unauthorized and forbidden handling
The web app SHALL provide distinct unauthorized and forbidden handling for authentication and authorization failures.

#### Scenario: Unauthorized page
- **GIVEN** a visitor is not authenticated
- **WHEN** unauthorized handling is rendered
- **THEN** the page clearly communicates that login is required
- **AND** provides navigation to login and the public storefront.

#### Scenario: Forbidden page
- **GIVEN** an authenticated user lacks a required role
- **WHEN** forbidden handling is rendered
- **THEN** the page clearly communicates insufficient access
- **AND** provides navigation back to an allowed public or role-appropriate destination.

#### Scenario: Safe redirect values only
- **GIVEN** a login redirect target is supplied by query string or route protection
- **WHEN** the web app evaluates the redirect target
- **THEN** it accepts only same-origin relative application paths
- **AND** falls back to a safe default for absolute URLs, protocol-relative URLs, malformed values, or auth pages.
