## ADDED Requirements

### Requirement: Finalization scope and prerequisites
The system SHALL treat frontend finalization as an integration and hardening change that starts only after the named storefront, catalog, auth/RBAC, customer commerce, customer account, and admin frontend phases are implemented.

#### Scenario: Predecessor changes are complete
- **WHEN** frontend finalization begins
- **THEN** the implementation verifies that `migrate-shopvn-storefront-foundation`, `implement-shopvn-product-catalog`, `implement-shopvn-auth-rbac`, `implement-shopvn-customer-commerce`, `implement-shopvn-customer-account`, and `implement-shopvn-admin` have been implemented or otherwise accounts for unfinished predecessor scope before making finalization changes.

#### Scenario: No major new business features
- **WHEN** finalization work identifies a missing business capability
- **THEN** the implementation documents it as a gap or follow-up
- **AND** does not add unrelated backend functionality or major new frontend features in this change.

#### Scenario: Existing work is preserved
- **WHEN** finalization changes modify completed frontend features
- **THEN** they preserve working behavior unless the change is required for integration, correctness, security, accessibility, responsiveness, or removal of transitional prototype code.

### Requirement: Route and layout ownership
The web app SHALL have clear, non-duplicated route and layout ownership across storefront, auth, customer, and admin areas.

#### Scenario: Storefront route ownership
- **WHEN** App Router pages are inspected
- **THEN** exactly one public homepage route resolves to `/`
- **AND** storefront header and footer are owned by the storefront layout rather than duplicated in page content or root layout.

#### Scenario: Auth route ownership
- **WHEN** `/login` and `/register` render
- **THEN** they use the intended auth layout and do not duplicate storefront, customer, or admin navigation unexpectedly.

#### Scenario: Customer route ownership
- **WHEN** customer account, cart, checkout, payment-result, order, profile, and address routes render
- **THEN** each route is owned by the correct customer or commerce layout
- **AND** customer navigation, account shells, headers, and footers are not duplicated.

#### Scenario: Admin route ownership
- **WHEN** admin routes render
- **THEN** the admin layout owns the admin sidebar, top bar, and admin content shell
- **AND** storefront header/footer or customer navigation are not rendered inside admin pages.

#### Scenario: Duplicate routes removed
- **WHEN** finalization is complete
- **THEN** obsolete duplicate route files, duplicate layouts, duplicate headers, duplicate footers, and duplicate navigation components are removed or consolidated without breaking public URLs.

### Requirement: Authentication and authorization hardening
The web app SHALL verify and harden authentication, logout, session restoration, redirects, unauthorized handling, forbidden handling, and role-based route access.

#### Scenario: Session restoration
- **WHEN** a stored session exists and a protected route or auth-aware component needs identity
- **THEN** the web app restores current-user state through the approved auth contract or server-side session helper
- **AND** avoids rendering contradictory guest and authenticated controls.

#### Scenario: Expired session handling
- **WHEN** an authenticated request fails because the session expired
- **THEN** the web app attempts the approved refresh flow where available
- **AND** clears session state and routes to unauthorized/login handling when refresh fails.

#### Scenario: Logout consistency
- **WHEN** a customer or admin logs out
- **THEN** the web app calls the approved logout contract when possible
- **AND** clears local session state, protected UI state, and auth-aware navigation consistently.

#### Scenario: Safe redirects
- **WHEN** login, unauthorized handling, or route protection receives a redirect target
- **THEN** only safe same-origin relative paths are accepted
- **AND** auth pages, absolute URLs, protocol-relative URLs, and malformed values fall back to a safe default.

#### Scenario: Role access matrix
- **WHEN** guest, customer, and admin users attempt to access storefront, auth, cart, checkout, payment-result, customer account, and admin routes
- **THEN** each route allows or blocks access according to the approved RBAC architecture
- **AND** blocked users see the appropriate unauthorized or forbidden state.

### Requirement: API integration and service boundaries
The web app SHALL verify API integration and consistent typed service boundaries across products, cart, checkout, payment, orders, profile, addresses, and admin pages.

#### Scenario: Product APIs
- **WHEN** storefront catalog and product detail pages load
- **THEN** they use the typed product/catalog service boundary
- **AND** handle loading, empty, invalid query, missing product, API error, and image fallback states consistently.

#### Scenario: Customer commerce APIs
- **WHEN** cart, checkout, voucher, payment-result, and order creation flows execute
- **THEN** they use typed commerce services and approved proxy/auth helpers
- **AND** prevent duplicate submissions and repeated API requests for the same pending action.

#### Scenario: Customer account APIs
- **WHEN** profile, address, order list, or order detail pages load or mutate data
- **THEN** they use typed customer/account services
- **AND** handle unauthorized, forbidden, not found, validation, and backend business-rule errors consistently.

#### Scenario: Admin APIs
- **WHEN** admin pages load or mutate data
- **THEN** they use typed admin services and authenticated proxy/session helpers
- **AND** hide, disable, or document operations whose backend contracts remain unavailable.

#### Scenario: Shared error handling
- **WHEN** any frontend service receives validation, unauthenticated, forbidden, not-found, conflict, business-rule, payment, network, or server errors
- **THEN** the UI maps the error to a user-appropriate message and recovery path
- **AND** preserves the last backend-confirmed state for failed mutations.

### Requirement: Mock data and prototype code removal
The web app SHALL remove transitional mock data and prototype-only code that is no longer required by completed frontend functionality.

#### Scenario: Transitional mock data removed
- **WHEN** finalization inspects production frontend code
- **THEN** mock data that has been replaced by real APIs is removed from production paths.

#### Scenario: Temporary mock data isolated
- **WHEN** unavoidable temporary mock data remains because no backend contract exists
- **THEN** it is isolated behind a typed service boundary
- **AND** it is documented with the owning gap, intended removal condition, and no page-local mutation persistence.

#### Scenario: Figma-only architecture removed
- **WHEN** finalization inspects production frontend code
- **THEN** no Vite runtime code, React Router imports, Tailwind CSS 4 patterns, insecure demo role switching, Figma-only providers, Figma mock auth, Figma cart providers, or page-local Figma mutations remain.

#### Scenario: Dead prototype assets removed
- **WHEN** finalization inspects components and assets
- **THEN** unused prototype components, unused imports, unused assets, dead routes, obsolete wrappers, and duplicated UI fragments are removed where safe.

### Requirement: Standardized UI states and mutation safety
The web app SHALL standardize loading, empty, error, validation, success, confirmation, pending, and duplicate-submission states across all completed frontend areas.

#### Scenario: Loading and empty states
- **WHEN** any storefront, auth, customer, commerce, or admin page waits for data or has no records
- **THEN** it renders a stable loading or empty state appropriate to the page without layout jumps or misleading content.

#### Scenario: Validation states
- **WHEN** users submit invalid login, registration, profile, address, cart, checkout, product, category, inventory, order, customer, approval, voucher, or admin forms
- **THEN** field-level or form-level validation errors are displayed
- **AND** invalid requests are not submitted when client validation can catch them.

#### Scenario: Confirmation states
- **WHEN** a destructive or high-impact action is available
- **THEN** the UI requires confirmation before invoking the mutation.

#### Scenario: Duplicate submission prevention
- **WHEN** a mutation is pending
- **THEN** the triggering controls are disabled or guarded
- **AND** repeated clicks, Enter presses, or rerenders do not send duplicate API requests.

#### Scenario: Success and recovery states
- **WHEN** a mutation succeeds or fails
- **THEN** the UI communicates the result, refreshes backend-confirmed data when needed, and provides a recovery path for failures.

### Requirement: System pages and global error handling
The web app SHALL finalize 404, forbidden, unauthorized, route error, and global error handling.

#### Scenario: Not found handling
- **WHEN** a route, product, order, customer resource, admin resource, or invalid dynamic route parameter is missing
- **THEN** the web app renders the appropriate not-found state without leaking protected data.

#### Scenario: Unauthorized and forbidden pages
- **WHEN** authentication or authorization fails
- **THEN** unauthorized and forbidden states are distinct, accessible, and include safe navigation options.

#### Scenario: Route error boundaries
- **WHEN** a route segment throws a recoverable rendering or data error
- **THEN** the segment error boundary renders an actionable recovery state without breaking unrelated layouts.

#### Scenario: Global error handling
- **WHEN** an unrecoverable app-level error occurs
- **THEN** the global error handling remains branded, accessible, and avoids exposing sensitive details.

### Requirement: Responsive layout verification
The web app SHALL verify responsive behavior across all major pages at 320px, 375px, 768px, 1024px, and 1536px viewport widths.

#### Scenario: Required viewport sweep
- **WHEN** final responsive verification runs
- **THEN** storefront, catalog, product detail, auth, cart, checkout, payment result, customer account, customer order, admin dashboard, admin list, admin detail, and system pages are checked at 320px, 375px, 768px, 1024px, and 1536px.

#### Scenario: No unintended horizontal scrolling
- **WHEN** pages are checked at required viewport widths
- **THEN** there is no unintended document-level horizontal scrolling
- **AND** tables or code panels use intentional contained overflow only where needed.

#### Scenario: Scroll container ownership
- **WHEN** pages contain sticky headers, sidebars, dialogs, tables, or panels
- **THEN** nested page scroll containers are removed unless they are intentional and documented
- **AND** sticky elements do not trap content or overlap controls.

#### Scenario: Interactive responsive elements
- **WHEN** mobile menus, filters, sidebars, dialogs, dropdowns, sticky summaries, forms, and tables are used
- **THEN** they open, close, resize, and remain usable across the required viewport widths.

### Requirement: Accessibility verification
The web app SHALL verify accessible navigation, semantics, focus handling, and assistive technology cues across major user and admin flows.

#### Scenario: Keyboard navigation
- **WHEN** users navigate with a keyboard
- **THEN** navigation, forms, filters, menus, sidebars, dropdowns, dialogs, pagination, tabs, and action buttons can be reached and activated in a logical order.

#### Scenario: Focus states and focus management
- **WHEN** interactive controls, route transitions, validation errors, dialogs, or mobile menus are used
- **THEN** visible focus states and focus management remain clear and predictable.

#### Scenario: Landmarks and headings
- **WHEN** major pages render
- **THEN** they have appropriate landmarks, one sensible primary heading, and a coherent heading hierarchy.

#### Scenario: Labels and alt text
- **WHEN** forms, icons, images, status badges, and buttons render
- **THEN** accessible names, labels, alt text or decorative treatment, and status text are appropriate.

### Requirement: Next.js boundaries, metadata, and assets
The web app SHALL review Server Component and Client Component boundaries, image handling, metadata, and asset configuration.

#### Scenario: Client directives minimized
- **WHEN** finalization inspects React components
- **THEN** unnecessary `"use client"` directives are removed
- **AND** client components are used only for interactivity, browser APIs, client hooks, or local UI state.

#### Scenario: Server data boundaries
- **WHEN** routes can safely load data on the server with existing auth/session helpers
- **THEN** server components or route handlers are preferred over broad client-only data fetching.

#### Scenario: Image strategy
- **WHEN** images render in storefront, catalog, customer, or admin pages
- **THEN** local assets, `next/image`, alt text, dimensions, placeholders, and fallbacks are reviewed
- **AND** remote image configuration is narrow and justified.

#### Scenario: Metadata and page titles
- **WHEN** major routes render
- **THEN** each has appropriate metadata or page titles for storefront, catalog, product detail, auth, customer, commerce, admin, and system pages.

### Requirement: Verification and completion gates
The web app SHALL pass the final verification strategy or document pre-existing failures separately from frontend regressions introduced by this change.

#### Scenario: Nx lint target
- **WHEN** finalization verification runs
- **THEN** the actual configured Nx lint target for the web app is run
- **AND** failures are fixed unless clearly identified as pre-existing and unrelated.

#### Scenario: Nx test target
- **WHEN** finalization verification runs
- **THEN** the actual configured Nx test target for the web app is run
- **AND** regressions introduced by the frontend finalization are fixed.

#### Scenario: Nx build target
- **WHEN** finalization verification runs
- **THEN** the actual configured Nx build target for the web app is run
- **AND** build failures introduced by the frontend finalization are fixed.

#### Scenario: Manual end-to-end checklist
- **WHEN** finalization completes
- **THEN** a final manual checklist covers guest browsing, search/catalog/detail, registration, login/logout, cart, checkout, payment result, customer profile/address/orders, admin dashboard/products/categories/inventory/orders/customers/approvals/vouchers/revenue/payments/webhooks/audit logs, and system pages.

#### Scenario: Final completion criteria
- **WHEN** the ShopVN frontend is considered finalized
- **THEN** routing, layouts, RBAC, API integration, mock cleanup, UI states, responsive behavior, accessibility, Next.js boundaries, assets, metadata, tests, build, and manual verification are all complete or have explicitly documented residual risks.
