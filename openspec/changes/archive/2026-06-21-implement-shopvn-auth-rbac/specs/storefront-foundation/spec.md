## MODIFIED Requirements

### Requirement: Storefront header and navigation
The system SHALL provide a ShopVN storefront header that includes the logo, catalog search field, public product/category navigation, mobile menu open/close behavior, responsive layout, accessible keyboard interaction, and auth-aware guest/customer/admin controls without requiring mock authentication, role switching, live cart state, checkout, customer account feature pages, or admin feature pages.

#### Scenario: Header contains storefront catalog controls
- **WHEN** a public storefront page renders
- **THEN** the header contains the ShopVN logo, search field, desktop catalog navigation links, auth-aware login/logout or user controls, and cart link or control
- **AND** cart controls do not require live cart state.

#### Scenario: Header avoids mock auth and cart providers
- **WHEN** storefront header files are inspected
- **THEN** they do not import or require Figma `AuthProvider`, Figma `CartProvider`, role-switching behavior, mock authentication state, or live cart quantity state.

#### Scenario: Header shows guest login control
- **GIVEN** the current visitor is a guest
- **WHEN** the storefront header renders
- **THEN** the header shows a login link or control
- **AND** does not show logout or admin navigation controls.

#### Scenario: Header shows authenticated controls
- **GIVEN** the current user is authenticated
- **WHEN** the storefront header renders
- **THEN** the header shows an authenticated user affordance and a logout control
- **AND** does not expose a production role switcher.

#### Scenario: Header exposes admin entry only to admins
- **GIVEN** the current user has the `admin` role
- **WHEN** the storefront header renders
- **THEN** the header may show an admin entry point
- **AND** the same entry point is not shown to guests or customers without the `admin` role.

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

#### Scenario: Auth controls do not create out-of-scope pages
- **WHEN** authenticated header controls are implemented
- **THEN** they do not introduce cart, checkout, customer account feature pages, or admin feature pages as part of this change.
