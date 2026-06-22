## MODIFIED Requirements

### Requirement: Storefront header and navigation
The system SHALL provide a ShopVN storefront header that includes the logo, catalog search field, public product/category navigation, mobile menu open/close behavior, responsive layout, and accessible keyboard interaction without requiring authentication, role switching, live cart state, checkout, customer account, or admin behavior.

#### Scenario: Header contains storefront catalog controls
- **WHEN** a public storefront page renders
- **THEN** the header contains the ShopVN logo, search field, desktop catalog navigation links, login link or control, and cart link or control
- **AND** login and cart controls do not require mock authentication or cart state.

#### Scenario: Header avoids auth and cart providers
- **WHEN** storefront header files are inspected
- **THEN** they do not import or require `AuthProvider`, `CartProvider`, role-switching behavior, mock authentication state, or live cart quantity state.

#### Scenario: Desktop navigation is available at desktop widths
- **WHEN** the storefront is viewed at desktop widths
- **THEN** public catalog navigation is visible without requiring the mobile menu
- **AND** navigation content does not overlap adjacent header controls.

#### Scenario: Desktop navigation links to catalog routes
- **WHEN** a shopper activates a desktop product or category navigation item
- **THEN** the browser navigates to the corresponding `/products` catalog URL
- **AND** route-group names do not appear in the public URL.

#### Scenario: Mobile menu opens and closes
- **WHEN** the storefront is viewed at mobile widths
- **THEN** a keyboard-accessible menu control can open the mobile navigation
- **AND** the mobile navigation can be closed without a page reload.

#### Scenario: Mobile menu exposes expanded state
- **WHEN** the mobile navigation is opened or closed
- **THEN** the menu control exposes the current expanded state using appropriate accessible state attributes.

#### Scenario: Mobile navigation links to catalog routes
- **WHEN** a shopper activates a mobile product or category navigation item
- **THEN** the mobile navigation closes
- **AND** the browser navigates to the corresponding `/products` catalog URL.

#### Scenario: Search navigates to product results
- **WHEN** a shopper submits a non-empty header search
- **THEN** the browser navigates to `/products?search=<term>`
- **AND** no direct product search API call is made from the header component.
