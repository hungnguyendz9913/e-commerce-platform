## Purpose
TBD - created by archiving change implement-shopvn-customer-commerce. Update Purpose after archive.

## Requirements
### Requirement: Customer cart page
The web app SHALL provide an authenticated customer cart page backed by the existing customer cart API.

#### Scenario: Authenticated customer views current cart
- **GIVEN** an authenticated customer has an active session
- **WHEN** the customer opens `/cart`
- **THEN** the web app retrieves the current cart from the backend cart contract
- **AND** displays cart items, item quantities, item totals, subtotal, shipping fee when available, discounts when available, and total.

#### Scenario: Guest cart access redirects to login
- **GIVEN** a guest opens `/cart`
- **WHEN** route protection evaluates the request
- **THEN** the web app redirects to login or renders unauthorized handling
- **AND** preserves a safe `redirectTo` value for `/cart`.

#### Scenario: Empty cart state
- **GIVEN** an authenticated customer has no active cart items
- **WHEN** the cart page renders
- **THEN** the web app displays an empty cart state
- **AND** provides navigation back to product browsing.

### Requirement: Customer cart mutations
The web app SHALL let authenticated customers add items, update quantities, remove items, and clear their cart through backend cart APIs.

#### Scenario: Add product to cart
- **GIVEN** an authenticated customer is viewing a product that can be purchased
- **WHEN** the customer adds a valid quantity to cart
- **THEN** the web app calls the backend add-item cart contract
- **AND** updates visible cart state from the backend response or a refreshed cart.

#### Scenario: Quantity update succeeds
- **GIVEN** an authenticated customer is viewing their cart
- **WHEN** the customer changes a cart item quantity to a valid positive value
- **THEN** the web app calls the backend quantity update contract
- **AND** refreshes item totals and cart totals.

#### Scenario: Remove item succeeds
- **GIVEN** an authenticated customer is viewing their cart
- **WHEN** the customer removes a cart item
- **THEN** the web app calls the backend remove-item contract
- **AND** removes the item from visible cart state after success.

#### Scenario: Clear cart succeeds
- **GIVEN** an authenticated customer is viewing a non-empty cart
- **WHEN** the customer confirms clear cart
- **THEN** the web app calls the backend clear-cart contract
- **AND** displays the empty cart state after success.

#### Scenario: Cart mutation avoids in-memory production state
- **WHEN** cart implementation files are inspected
- **THEN** production cart state is not implemented with the Figma `CartProvider`
- **AND** cart mutations do not rely on mock products or browser-only in-memory totals as the source of truth.

### Requirement: Stock validation feedback
The web app SHALL surface backend stock and availability validation during cart and checkout.

#### Scenario: Add item exceeds stock
- **GIVEN** an authenticated customer requests a quantity greater than available stock
- **WHEN** the backend rejects the add-item request
- **THEN** the web app displays actionable stock feedback
- **AND** does not pretend the item was added.

#### Scenario: Quantity update exceeds stock
- **GIVEN** a cart item quantity update exceeds available stock
- **WHEN** the backend rejects the update request
- **THEN** the web app displays actionable feedback near the affected item
- **AND** keeps or restores the last backend-confirmed quantity.

#### Scenario: Checkout detects stale stock
- **GIVEN** stock changes after the customer views the cart
- **WHEN** checkout validation rejects the cart
- **THEN** the web app displays a checkout-blocking stock message
- **AND** provides a path back to cart review.

### Requirement: Checkout shipping information
The web app SHALL collect and validate shipping information required by the existing checkout API.

#### Scenario: Shipping information is entered
- **GIVEN** an authenticated customer starts checkout with a non-empty cart
- **WHEN** the customer enters recipient name, phone, and shipping address details
- **THEN** the web app validates required fields before order submission
- **AND** maps the entered shipping information to the backend delivery information contract.

#### Scenario: Missing shipping information blocks progress
- **GIVEN** required shipping fields are missing
- **WHEN** the customer attempts to continue or place an order
- **THEN** the web app displays field-level errors
- **AND** does not call order creation.

#### Scenario: Saved address management excluded
- **WHEN** the checkout implementation is inspected
- **THEN** it does not introduce customer address book management pages or saved-address mutation behavior.

### Requirement: Checkout order summary and validation
The web app SHALL show an order summary based on backend cart and checkout validation results.

#### Scenario: Checkout validation succeeds
- **GIVEN** an authenticated customer has a non-empty cart and valid checkout inputs
- **WHEN** the customer reaches order review
- **THEN** the web app validates checkout through the backend checkout validation contract
- **AND** displays backend-derived subtotal, discount, shipping fee, and total.

#### Scenario: Voucher application succeeds when supported
- **GIVEN** the backend voucher checkout contract is available
- **WHEN** the customer submits a voucher code accepted by the backend
- **THEN** the web app displays the discount and updated totals returned by the backend.

#### Scenario: Voucher application fails
- **GIVEN** a voucher code is invalid, expired, inapplicable, or rejected by backend rules
- **WHEN** the customer applies the code
- **THEN** the web app displays an actionable voucher error
- **AND** preserves the prior valid checkout summary.

#### Scenario: Empty cart blocks checkout
- **GIVEN** an authenticated customer has an empty cart
- **WHEN** the customer opens `/checkout`
- **THEN** the web app prevents order submission
- **AND** provides navigation back to product browsing or cart.

### Requirement: Payment selection
The web app SHALL let customers select a supported checkout payment provider from the backend-supported options.

#### Scenario: COD payment is selected
- **GIVEN** COD is supported by the checkout contract
- **WHEN** the customer selects COD
- **THEN** the checkout payload uses the backend COD payment provider value.

#### Scenario: Online payment provider is selected
- **GIVEN** MOMO or VNPAY is supported by the checkout contract
- **WHEN** the customer selects the provider
- **THEN** the checkout payload uses the matching backend payment provider value
- **AND** the web app handles a returned payment URL when one is provided.

#### Scenario: Unsupported payment method excluded
- **WHEN** payment options render
- **THEN** methods not supported by the current backend checkout contract are not presented as selectable production options.

### Requirement: Order creation flow
The web app SHALL create orders from the active cart through the existing checkout order creation contract.

#### Scenario: COD order creation succeeds
- **GIVEN** checkout validation passes and the customer selected COD
- **WHEN** the customer places the order
- **THEN** the web app calls the backend checkout order creation contract
- **AND** navigates to a payment or order-result success state using the returned order data.

#### Scenario: Online payment order creation succeeds
- **GIVEN** checkout validation passes and the customer selected MOMO or VNPAY
- **WHEN** the customer places the order
- **THEN** the web app calls the backend checkout order creation contract
- **AND** follows the returned payment URL or navigates to a pending payment-result state when appropriate.

#### Scenario: Order creation fails
- **GIVEN** backend checkout rejects order creation because of validation, stock, cart, voucher, payment, or business-rule errors
- **WHEN** the customer places the order
- **THEN** the web app displays the error without clearing the cart locally
- **AND** keeps the customer in the checkout flow with recovery options.

### Requirement: Payment result handling
The web app SHALL provide a payment-result page for success, failed, canceled, and pending states without using Figma demo controls.

#### Scenario: Payment success state
- **GIVEN** checkout or payment callback data indicates success
- **WHEN** the payment result page renders
- **THEN** it shows a success message, order reference when available, payment method when available, and navigation to continue shopping.

#### Scenario: Payment failed state
- **GIVEN** checkout or payment callback data indicates failure
- **WHEN** the payment result page renders
- **THEN** it shows a failed payment message
- **AND** offers a safe retry or return-to-checkout path.

#### Scenario: Payment canceled state
- **GIVEN** checkout or payment callback data indicates cancellation
- **WHEN** the payment result page renders
- **THEN** it shows a canceled payment message
- **AND** provides navigation back to cart or checkout.

#### Scenario: Payment pending state
- **GIVEN** payment status cannot yet be confirmed
- **WHEN** the payment result page renders
- **THEN** it shows a pending state
- **AND** does not claim the order is paid.

#### Scenario: Demo payment controls excluded
- **WHEN** payment-result implementation files are inspected
- **THEN** they do not include Figma demo status-switching buttons
- **AND** they do not fake production payment status in browser state.

### Requirement: Commerce service boundaries
The web app SHALL keep customer commerce API access behind typed service boundaries.

#### Scenario: Cart service boundary
- **WHEN** cart UI needs current cart data or cart mutations
- **THEN** it uses a typed cart service boundary rather than ad hoc component fetch calls.

#### Scenario: Checkout service boundary
- **WHEN** checkout UI needs validation, voucher application, or order creation
- **THEN** it uses a typed checkout service boundary rather than ad hoc component fetch calls.

#### Scenario: Backend gaps are explicit
- **WHEN** implementation discovers a required backend capability is missing
- **THEN** the gap is documented in code comments, tests, or OpenSpec artifacts
- **AND** production behavior does not silently fall back to Figma mock state.

### Requirement: Customer commerce scope boundaries
The web app SHALL implement customer cart, checkout, and payment-result behavior without adding unrelated customer or admin features.

#### Scenario: Customer profile pages excluded
- **WHEN** this change is implemented
- **THEN** it does not introduce customer profile, address book management, order history, or order detail pages.

#### Scenario: Admin functionality excluded
- **WHEN** this change is implemented
- **THEN** it does not introduce admin pages, admin links, or admin commerce management behavior.

#### Scenario: Existing frontend stack preserved
- **WHEN** customer commerce implementation is complete
- **THEN** Tailwind CSS remains on 3.4.3
- **AND** Flowbite, TypeScript, Next.js App Router, and existing component patterns remain the baseline.

#### Scenario: Figma runtime excluded
- **WHEN** customer commerce files are inspected
- **THEN** they do not import Vite, `react-router`, Figma `CartProvider`, mock address data, mock voucher data, or Tailwind CSS 4 entrypoint patterns.
