## ADDED Requirements

### Requirement: Public catalog listing page
The system SHALL expose a public storefront product listing page at `/products` within the existing storefront layout.

#### Scenario: Listing page renders visible catalog products
- **WHEN** a shopper visits `/products`
- **THEN** the page displays public visible products using the storefront header and footer
- **AND** the page does not require authentication, cart state, checkout state, customer account state, or admin state.

#### Scenario: Listing page uses public product contract
- **WHEN** the listing page loads product data
- **THEN** it uses the existing public product listing contract when available
- **AND** any temporary product data is isolated behind a typed storefront catalog data boundary.

#### Scenario: Listing page preserves public visibility
- **WHEN** product data contains products with inactive, archived, pending, or rejected visibility states
- **THEN** those products are not shown as public catalog products.

### Requirement: Catalog search results
The system SHALL support public product search results through catalog URL query state.

#### Scenario: Header search navigates to catalog results
- **WHEN** a shopper submits a non-empty search term from the storefront header search field
- **THEN** the browser navigates to `/products?search=<term>`
- **AND** the listing page displays results for that search term.

#### Scenario: Search result title reflects query
- **WHEN** a shopper visits `/products?search=iphone`
- **THEN** the listing page communicates that the results are for `iphone`
- **AND** it displays the matching product count when known.

#### Scenario: Empty search stays on catalog page
- **WHEN** a shopper submits an empty or whitespace-only search term
- **THEN** the system does not create a broken search URL
- **AND** catalog navigation remains usable.

### Requirement: Category navigation and filtering
The system SHALL provide public category navigation and category-filtered catalog browsing.

#### Scenario: Header category navigation opens filtered catalog
- **WHEN** a shopper activates a category navigation item in the storefront header
- **THEN** the browser navigates to `/products` with a category query value for that category
- **AND** the listing page displays products for that category.

#### Scenario: Listing filter includes active categories
- **WHEN** public categories are available
- **THEN** the listing page filter panel displays active categories for browsing
- **AND** inactive categories are excluded from the public category controls.

#### Scenario: Category filter includes descendants when supported
- **WHEN** a shopper filters by a parent category
- **THEN** the listing page includes products from that category and its visible child categories when the category contract provides hierarchy data.

### Requirement: Catalog filters, sorting, and pagination
The system SHALL support URL-driven filters, sorting, active filter indicators, and pagination on the public catalog listing page.

#### Scenario: Filters update URL state
- **WHEN** a shopper applies category, price range, or in-stock filters
- **THEN** the catalog URL reflects the active filters
- **AND** the product results update according to those filters.

#### Scenario: Sort updates URL state
- **WHEN** a shopper selects default, price ascending, price descending, or name ascending sorting
- **THEN** the catalog URL reflects the sort selection
- **AND** the product results use the matching supported product sort fields and order.

#### Scenario: Active filters can be removed
- **WHEN** filters or search terms are active
- **THEN** the listing page displays removable active filter indicators
- **AND** removing one indicator updates the URL without removing unrelated filters.

#### Scenario: Clear filters resets catalog browsing
- **WHEN** a shopper activates clear filters
- **THEN** search, category, price, stock, sort, and page state are reset to the default catalog view.

#### Scenario: Pagination preserves filters
- **WHEN** a shopper changes pages while search, filters, or sort are active
- **THEN** pagination updates the page query value
- **AND** it preserves the other active catalog query values.

### Requirement: Reusable display product card
The system SHALL provide a reusable public product card component for catalog display surfaces.

#### Scenario: Product card displays product summary
- **WHEN** a product card renders
- **THEN** it displays the product image or fallback visual, category, product name, price, and relevant stock signal.

#### Scenario: Product card links to detail
- **WHEN** a shopper activates a product card or its detail affordance
- **THEN** the browser navigates to that product's public detail page.

#### Scenario: Product card remains display-only
- **WHEN** a product card renders in this change
- **THEN** it does not perform add-to-cart behavior, cart API calls, authentication checks, or login prompt behavior.

### Requirement: Public product detail page
The system SHALL expose a public storefront product detail page for visible products.

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

#### Scenario: Detail page remains display-only
- **WHEN** the detail page renders product purchase-related controls from the Figma reference
- **THEN** cart, checkout, authentication, quantity mutation, and login prompt behavior are excluded from this change.

### Requirement: Catalog loading, empty, and error states
The system SHALL provide clear loading, empty, and error states for public catalog listing and detail surfaces.

#### Scenario: Listing loading state
- **WHEN** the catalog listing route is loading
- **THEN** the page displays skeleton or placeholder content that preserves the catalog layout.

#### Scenario: Detail loading state
- **WHEN** the product detail route is loading
- **THEN** the page displays skeleton or placeholder content that preserves the detail layout.

#### Scenario: Empty listing state
- **WHEN** a search or filter combination returns no products
- **THEN** the listing page displays an empty state explaining that no products were found
- **AND** it provides a way to clear filters or return to the default product listing.

#### Scenario: Listing error state
- **WHEN** catalog listing data cannot be loaded
- **THEN** the page displays an error state with a retry or recovery affordance
- **AND** the storefront layout remains intact.

#### Scenario: Detail error state
- **WHEN** product detail data cannot be loaded
- **THEN** the page displays an error state with a retry or recovery affordance
- **AND** the storefront layout remains intact.

### Requirement: Catalog responsive behavior
The system SHALL keep the public catalog usable and visually aligned with the storefront foundation across mobile, tablet, desktop, and wide desktop widths.

#### Scenario: Listing adapts across viewport widths
- **WHEN** the listing page is viewed from 320px through 1536px wide
- **THEN** filters, sorting, active chips, pagination, and product cards remain readable and operable
- **AND** the page does not introduce horizontal overflow.

#### Scenario: Mobile filters are collapsible
- **WHEN** the listing page is viewed at mobile widths
- **THEN** filters are available through a keyboard-accessible open/close control
- **AND** the product grid remains visible without permanent sidebar crowding.

#### Scenario: Detail page adapts across viewport widths
- **WHEN** the detail page is viewed from 320px through 1536px wide
- **THEN** product imagery, product information, description, and related products stack or align responsively
- **AND** text and controls do not overlap.

### Requirement: Catalog dependency and scope boundaries
The system SHALL implement the public catalog without introducing out-of-scope frameworks, dependencies, or commerce behaviors.

#### Scenario: Existing frontend stack is preserved
- **WHEN** catalog implementation is complete
- **THEN** Tailwind CSS remains on 3.4.3
- **AND** Flowbite, TypeScript, Next.js App Router, and existing component patterns remain the baseline.

#### Scenario: Forbidden frameworks are excluded
- **WHEN** catalog files are inspected
- **THEN** they do not import or require Vite, React Router, Tailwind CSS 4 configuration, or Tailwind CSS 4 entrypoint patterns.

#### Scenario: Commerce flows remain excluded
- **WHEN** catalog files are inspected
- **THEN** they do not introduce auth, cart, checkout, customer account, or admin behavior.
