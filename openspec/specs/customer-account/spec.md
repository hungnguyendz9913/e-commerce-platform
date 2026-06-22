## Purpose
TBD - created by syncing change implement-shopvn-customer-account. Update Purpose after archive.

## Requirements
### Requirement: Customer account route protection and layout
The web app SHALL provide an authenticated customer account area that reuses the storefront shell and blocks guests and non-customer users from customer account content.

#### Scenario: Guest blocked from customer account
- **WHEN** a guest opens any customer account route
- **THEN** the web app redirects to login or renders unauthorized handling with a safe post-login redirect.

#### Scenario: Customer can access account pages
- **WHEN** an authenticated user with the `customer` role opens a customer account route
- **THEN** the web app renders the requested account content.

#### Scenario: Admin-only assumptions are excluded
- **WHEN** customer account pages render for an authenticated customer
- **THEN** they do not require admin role claims, admin endpoints, admin navigation, or admin-only order-management behavior.

#### Scenario: Account layout navigation
- **WHEN** the customer account area renders
- **THEN** it provides navigation for account overview, profile, addresses, and orders
- **AND** highlights the current section across desktop and mobile layouts.

### Requirement: Customer account overview
The web app SHALL provide a customer account overview that summarizes the authenticated customer identity, address count when available, and recent order activity.

#### Scenario: Overview shows customer summary
- **WHEN** an authenticated customer opens the account overview
- **THEN** the page displays the customer's name, email, phone when available, and navigation to edit profile.

#### Scenario: Overview shows recent orders
- **WHEN** recent customer orders are available
- **THEN** the overview displays a limited recent-order list with order number, date, total, order status, and a link to order detail.

#### Scenario: Overview handles missing account data
- **WHEN** customer profile, address, or order summary data is empty or unavailable
- **THEN** the overview renders a clear empty or fallback state without using Figma mock customer data.

### Requirement: Customer profile management
The web app SHALL let authenticated customers view and update editable profile fields through the existing profile API contract where available.

#### Scenario: Profile page shows current identity
- **WHEN** an authenticated customer opens the profile page
- **THEN** the page displays email as read-only identity data
- **AND** displays editable customer fields such as full name, phone, and avatar URL when supported by the API contract.

#### Scenario: Profile validation blocks invalid updates
- **WHEN** the customer submits missing or malformed required profile values
- **THEN** the web app displays field-level validation errors
- **AND** does not call the profile update API.

#### Scenario: Profile update succeeds
- **WHEN** the customer submits valid profile changes
- **THEN** the web app calls the existing current-user profile update contract
- **AND** refreshes visible account identity from the API response or a current-user reload.

#### Scenario: Profile update failure
- **WHEN** the profile update API rejects the request or cannot be reached
- **THEN** the web app displays an actionable error
- **AND** preserves the last confirmed profile values.

### Requirement: Customer address book management
The web app SHALL let authenticated customers list, add, edit, select a default, and delete saved shipping addresses through existing customer address contracts where available.

#### Scenario: Address list renders saved addresses
- **WHEN** an authenticated customer opens the address page
- **THEN** the web app retrieves saved addresses for the current customer
- **AND** displays recipient name, phone, address parts, and default-address status.

#### Scenario: Empty address book
- **WHEN** the authenticated customer has no saved addresses
- **THEN** the page displays an empty address state
- **AND** provides an affordance to add a new address.

#### Scenario: Add address
- **WHEN** the customer submits a valid new address
- **THEN** the web app calls the existing create-address contract
- **AND** adds the returned address to the visible list.

#### Scenario: Edit address
- **WHEN** the customer submits valid changes for an existing address
- **THEN** the web app calls the existing update-address contract when available
- **AND** refreshes or replaces the visible address with backend-confirmed data.

#### Scenario: Delete address requires confirmation
- **WHEN** the customer chooses to delete an address
- **THEN** the web app asks for confirmation before calling the delete-address contract when available
- **AND** removes the address from the visible list only after success.

#### Scenario: Default address is unique
- **WHEN** the customer marks an address as default
- **THEN** the web app uses the existing address contract to persist the default selection when available
- **AND** presents at most one address as default after the operation succeeds.

#### Scenario: Address mutation backend gap is explicit
- **WHEN** an address mutation endpoint is not available in the existing API contract
- **THEN** the implementation documents the gap and does not replace production behavior with browser-only mock address persistence.

### Requirement: Customer order list
The web app SHALL provide an authenticated customer order list backed by the existing customer order API contract.

#### Scenario: Order list renders customer orders
- **WHEN** an authenticated customer opens the order list
- **THEN** the web app calls the customer order list contract
- **AND** displays only that customer's orders with order number, creation date, item summary, total, order status, payment status, and detail navigation.

#### Scenario: Order status filtering
- **WHEN** the customer selects an order status filter
- **THEN** the web app filters or requests orders for that status using supported backend query parameters
- **AND** preserves an all-orders view.

#### Scenario: Empty order list
- **WHEN** no orders match the current customer or selected status
- **THEN** the page displays an empty order state with navigation back to product browsing.

#### Scenario: Order list loading and error states
- **WHEN** customer orders are loading or fail to load
- **THEN** the page displays an appropriate loading skeleton or error recovery state.

### Requirement: Customer order detail and status presentation
The web app SHALL provide customer order detail pages backed by the existing customer order detail and cancellation contracts.

#### Scenario: Order detail renders complete order information
- **WHEN** an authenticated customer opens one of their order detail pages
- **THEN** the web app displays order header, item snapshots, delivery snapshot, amount breakdown, order status, payment status, and payment method information when present.

#### Scenario: Order status timeline
- **WHEN** an order is in a fulfillment status with a known progression
- **THEN** the detail page presents the current order state with status badges and a progress or timeline treatment consistent with the Figma reference.

#### Scenario: Canceled or refunded order status
- **WHEN** an order is canceled or refunded
- **THEN** the detail page presents a terminal status treatment instead of implying active delivery progress.

#### Scenario: Order not found or inaccessible
- **WHEN** the order detail API returns not found, forbidden, or unauthorized
- **THEN** the web app displays the appropriate not-found, forbidden, or unauthorized handling without exposing another customer's order data.

#### Scenario: Cancel eligible order
- **WHEN** the customer cancels an eligible order and submits a valid reason when required
- **THEN** the web app calls the existing customer order cancellation contract
- **AND** refreshes the visible order status from backend-confirmed data.

#### Scenario: Non-cancelable order hides cancel action
- **WHEN** an order status is not cancelable by the customer
- **THEN** the web app does not present a customer cancel action.

### Requirement: Customer account async and responsive behavior
The web app SHALL provide accessible empty, loading, error, and responsive states for all customer account surfaces.

#### Scenario: Loading states avoid layout jumps
- **WHEN** account, profile, address, or order data is loading
- **THEN** the web app renders stable skeletons or pending states that preserve the page layout.

#### Scenario: Error states provide recovery
- **WHEN** account data or mutations fail
- **THEN** the web app displays an error message and a retry or safe navigation affordance where recovery is possible.

#### Scenario: Mobile responsive account pages
- **WHEN** customer account pages render on small viewports
- **THEN** navigation, cards, forms, filters, modals, and order summaries remain usable without text overlap or horizontal page scrolling.

#### Scenario: Desktop responsive account pages
- **WHEN** customer account pages render on desktop viewports
- **THEN** content uses constrained readable widths and preserves the storefront visual language.

### Requirement: Customer account implementation boundaries
The web app SHALL implement the customer account feature using existing project foundations and without importing Figma runtime or demo state.

#### Scenario: Existing service boundaries are reused
- **WHEN** customer account UI needs profile, address, or order data
- **THEN** it uses typed service boundaries and existing proxy/auth helpers rather than ad hoc unauthenticated component fetches.

#### Scenario: Figma Make is a reference only
- **WHEN** customer account implementation files are inspected
- **THEN** they do not import `react-router`, Vite-specific runtime code, Figma mock providers, mock users, mock addresses, or mock orders as production data.

#### Scenario: Existing foundations are preserved
- **WHEN** customer account implementation is complete
- **THEN** the existing storefront, auth, catalog, cart, checkout, payment-result, and commerce foundations continue to work.

#### Scenario: Admin pages remain out of scope
- **WHEN** this change is implemented
- **THEN** it does not add or modify admin pages, admin customer management, or admin order management UI.
