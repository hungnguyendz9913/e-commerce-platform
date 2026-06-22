## MODIFIED Requirements

### Requirement: Reusable display product card
The system SHALL provide a reusable public product card component for catalog display surfaces and, where enabled by customer commerce, an add-to-cart entry point that uses authenticated customer cart APIs.

#### Scenario: Product card displays product summary
- **WHEN** a product card renders
- **THEN** it displays the product image or fallback visual, category, product name, price, and relevant stock signal.

#### Scenario: Product card links to detail
- **WHEN** a shopper activates a product card or its detail affordance
- **THEN** the browser navigates to that product's public detail page.

#### Scenario: Product card adds item to cart for authenticated customer
- **GIVEN** an authenticated customer views an in-stock product card with add-to-cart enabled
- **WHEN** the customer activates add to cart
- **THEN** the web app calls the authenticated customer cart API through the commerce service boundary
- **AND** reflects success or backend validation errors without relying on in-memory cart state.

#### Scenario: Product card prompts guest to sign in
- **GIVEN** a guest views an add-to-cart-enabled product card
- **WHEN** the guest activates add to cart
- **THEN** the web app routes the guest through the login flow with a safe redirect back to the current product context.

#### Scenario: Product card blocks unavailable product purchase
- **GIVEN** a product card represents an out-of-stock or unavailable product
- **WHEN** the card renders
- **THEN** the add-to-cart control is disabled or omitted
- **AND** the card communicates the stock state.

### Requirement: Public product detail page
The system SHALL expose a public storefront product detail page for visible products and, where enabled by customer commerce, product quantity and add-to-cart controls backed by authenticated customer cart APIs.

#### Scenario: Product detail renders visible product
- **WHEN** a shopper visits `/products/{id}` for a visible product
- **THEN** the page displays breadcrumb navigation, product gallery, product name, SKU when available, category, price, stock status, description, and related products when available.

#### Scenario: Product detail uses public product contract
- **WHEN** the detail page loads product data
- **THEN** it uses the existing public product detail contract when available
- **AND** any temporary product data is isolated behind the same typed storefront catalog data boundary as listing data.

#### Scenario: Hidden or missing product shows not-found state
- **WHEN** a shopper visits `/products/{id}` for a missing or non-public product
- **THEN** the page displays a product-not-found state or invokes the App Router not-found flow
- **AND** it provides navigation back to the product listing.

#### Scenario: Product detail adds selected quantity to cart
- **GIVEN** an authenticated customer views an in-stock product detail page
- **WHEN** the customer selects a valid quantity and adds the item to cart
- **THEN** the web app calls the authenticated customer cart API through the commerce service boundary
- **AND** reflects success or backend validation errors.

#### Scenario: Product detail respects stock quantity
- **GIVEN** product detail stock information is available
- **WHEN** the customer adjusts quantity
- **THEN** the quantity control prevents obvious values below one or above visible stock
- **AND** backend stock validation remains authoritative.

### Requirement: Catalog dependency and scope boundaries
The system SHALL implement the public catalog and customer-commerce entry points without introducing out-of-scope frameworks, dependencies, or unrelated customer/admin behaviors.

#### Scenario: Existing frontend stack is preserved
- **WHEN** catalog implementation is complete
- **THEN** Tailwind CSS remains on 3.4.3
- **AND** Flowbite, TypeScript, Next.js App Router, and existing component patterns remain the baseline.

#### Scenario: Forbidden frameworks are excluded
- **WHEN** catalog files are inspected
- **THEN** they do not import or require Vite, React Router, Tailwind CSS 4 configuration, or Tailwind CSS 4 entrypoint patterns.

#### Scenario: Commerce entry points stay scoped
- **WHEN** catalog add-to-cart entry points are implemented
- **THEN** they use the typed customer commerce service boundary
- **AND** they do not introduce checkout, customer profile, order history, or admin behavior into catalog components.
