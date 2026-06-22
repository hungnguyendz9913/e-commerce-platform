## ADDED Requirements

### Requirement: Protected admin route access
The web app SHALL protect every admin frontend route with authenticated admin access through the approved RBAC architecture.

#### Scenario: Guest blocked from admin UI
- **WHEN** a guest opens any `/admin` route
- **THEN** the web app redirects to login or renders unauthorized handling with a safe post-login redirect.

#### Scenario: Customer blocked from admin UI
- **WHEN** an authenticated customer without the `admin` role opens any `/admin` route
- **THEN** the web app renders or redirects to forbidden handling
- **AND** does not render admin data or admin controls.

#### Scenario: Admin allowed through RBAC
- **WHEN** an authenticated user with the `admin` role opens any `/admin` route
- **THEN** the web app renders the requested admin content.

#### Scenario: Admin API calls preserve authentication
- **WHEN** an admin page calls backend admin contracts from the browser
- **THEN** the request uses existing authenticated proxy or session forwarding patterns
- **AND** unauthenticated or forbidden responses clear or block admin UI consistently with existing auth behavior.

### Requirement: Admin layout and navigation
The web app SHALL provide a responsive ShopVN admin layout with sidebar navigation, top bar, active route state, and admin account controls.

#### Scenario: Desktop admin layout
- **WHEN** an admin views the admin area on a desktop viewport
- **THEN** the page displays a persistent sidebar with links for dashboard, products, categories, inventory, orders, customers, approvals, vouchers, revenue, payments/webhooks, and audit logs
- **AND** the current section is visually highlighted.

#### Scenario: Mobile admin layout
- **WHEN** an admin views the admin area on a small viewport
- **THEN** the sidebar is available through a menu control
- **AND** opening, closing, and route selection do not cause page content overlap or horizontal page scrolling.

#### Scenario: Admin top bar
- **WHEN** the admin layout renders
- **THEN** the top bar displays the current section context, admin identity when available, and safe navigation controls such as logout or storefront navigation.

#### Scenario: Figma runtime excluded
- **WHEN** admin layout implementation files are inspected
- **THEN** they do not import `react-router`, Figma auth providers, mock role switching, Vite runtime code, or Figma page-local state as production behavior.

### Requirement: Admin dashboard frontend
The web app SHALL provide an admin dashboard backed by existing dashboard and summary API contracts where available.

#### Scenario: Dashboard metrics render
- **WHEN** an authenticated admin opens `/admin`
- **THEN** the page displays dashboard metrics such as revenue, orders, customers, pending orders, and low-stock products when provided by the backend.

#### Scenario: Dashboard recent activity render
- **WHEN** dashboard summary data includes recent orders or low-stock products
- **THEN** the dashboard displays concise linked summaries to the relevant admin pages.

#### Scenario: Dashboard date range
- **WHEN** the admin changes a supported date range
- **THEN** the dashboard requests or filters dashboard data using supported backend query parameters.

#### Scenario: Dashboard chart dependency
- **WHEN** dashboard charts are implemented
- **THEN** they use existing project dependencies or a newly approved chart dependency
- **AND** the page remains useful without chart-only access to the underlying values.

### Requirement: Admin product management frontend
The web app SHALL provide product management screens backed by existing admin product and category contracts.

#### Scenario: Product list renders
- **WHEN** an authenticated admin opens `/admin/products`
- **THEN** the web app retrieves the admin product list
- **AND** displays product identity, image, SKU, category, price, inventory summary, product status, approval status, and management actions.

#### Scenario: Product list filters and pagination
- **WHEN** an admin searches, filters, sorts, or paginates products
- **THEN** the web app uses supported admin product query parameters
- **AND** updates the table with backend-confirmed results and pagination metadata.

#### Scenario: Product create and edit
- **WHEN** an admin submits valid create or edit product data
- **THEN** the web app calls the existing admin product create or update contract
- **AND** refreshes visible product data from the backend response or a list reload.

#### Scenario: Product delete or archive confirmation
- **WHEN** an admin chooses to delete or archive a product
- **THEN** the web app asks for confirmation before calling the existing admin product delete contract
- **AND** reflects backend-confirmed delete or archive behavior after success.

#### Scenario: Product mutation errors
- **WHEN** product create, update, or delete fails validation, conflicts, business rules, or network errors
- **THEN** the web app displays actionable field or form errors
- **AND** does not mutate production UI as if the backend accepted the change.

### Requirement: Admin category management frontend
The web app SHALL provide category management screens backed by existing category admin contracts where available.

#### Scenario: Category hierarchy renders
- **WHEN** an authenticated admin opens `/admin/categories`
- **THEN** the page displays parent and child categories with status and product-count context when available.

#### Scenario: Category create and edit
- **WHEN** an admin submits valid category data
- **THEN** the web app calls the existing category create or update contract when available
- **AND** refreshes the category hierarchy from backend-confirmed data.

#### Scenario: Category delete confirmation
- **WHEN** an admin chooses to delete a category
- **THEN** the web app asks for confirmation before calling the existing category delete contract when available
- **AND** displays backend business-rule failures without pretending the category was deleted.

### Requirement: Admin inventory frontend
The web app SHALL provide inventory list, low-stock filtering, stock adjustment, and movement history UI backed by existing inventory contracts where available.

#### Scenario: Inventory list renders
- **WHEN** an authenticated admin opens `/admin/inventory`
- **THEN** the page displays product, SKU, stock quantity, reserved quantity, available quantity, low-stock state, and last update when available.

#### Scenario: Low stock filtering
- **WHEN** an admin enables low-stock filtering
- **THEN** the page displays products matching backend-supported low-stock or stock threshold filters where available.

#### Scenario: Stock adjustment
- **WHEN** an admin submits a valid stock adjustment with a required reason when supported
- **THEN** the web app calls the existing admin inventory update contract
- **AND** refreshes stock and movement data from backend-confirmed data.

#### Scenario: Inventory movement history
- **WHEN** inventory movement data is available
- **THEN** the page displays movement type, product, quantity delta, reason or reference, and timestamp.

### Requirement: Admin order management frontend
The web app SHALL provide admin order list, order detail, and status update UI backed by existing admin order contracts.

#### Scenario: Admin order list renders
- **WHEN** an authenticated admin opens `/admin/orders`
- **THEN** the page displays order number, customer, total, order status, payment status, creation date, and detail navigation.

#### Scenario: Admin order filters
- **WHEN** an admin searches or filters orders by supported order or payment status fields
- **THEN** the web app uses supported backend query parameters
- **AND** preserves pagination metadata from the backend.

#### Scenario: Admin order detail renders
- **WHEN** an admin opens `/admin/orders/{orderId}`
- **THEN** the page displays order header, item snapshots, delivery snapshot, amount breakdown, payment information, customer information, note when available, and current statuses.

#### Scenario: Admin order status update
- **WHEN** an admin submits an allowed order status transition and optional note
- **THEN** the web app calls the existing admin order status update contract
- **AND** refreshes list or detail status from backend-confirmed data.

#### Scenario: Invalid order transition
- **WHEN** the backend rejects an order status update
- **THEN** the web app displays the business-rule error
- **AND** preserves the last backend-confirmed order status.

### Requirement: Admin customer management frontend
The web app SHALL provide customer listing and customer status management UI backed by existing admin customer contracts where available.

#### Scenario: Customer list renders
- **WHEN** an authenticated admin opens `/admin/customers`
- **THEN** the page displays paginated customer records without password hashes, token secrets, or sensitive credential data.

#### Scenario: Customer filters
- **WHEN** an admin searches or filters customer records by supported fields
- **THEN** the page uses supported backend query parameters or clearly limits filtering to loaded data when no backend filter exists.

#### Scenario: Customer status update
- **WHEN** an admin changes a customer status and the backend contract supports it
- **THEN** the web app calls the existing status update contract
- **AND** refreshes visible customer data from backend-confirmed data.

#### Scenario: Missing customer mutation contract
- **WHEN** a customer mutation endpoint is not available
- **THEN** the UI hides or disables the unsupported action
- **AND** documents the backend gap instead of storing page-local production mutations.

### Requirement: Admin approval frontend
The web app SHALL provide product approval and rejection UI backed by existing admin approval or product approval contracts.

#### Scenario: Approval queue renders
- **WHEN** an authenticated admin opens `/admin/approvals`
- **THEN** the page displays products grouped or filtered by approval status with product identity, price, category, description summary, and current approval status.

#### Scenario: Approve product
- **WHEN** an admin confirms approval for a pending product
- **THEN** the web app calls the existing product approval contract
- **AND** updates the product approval state only after backend success.

#### Scenario: Reject product with reason
- **WHEN** an admin rejects a pending product and the backend requires a reason
- **THEN** the web app validates the reason before calling the rejection contract.

#### Scenario: Approval action failure
- **WHEN** approval or rejection fails
- **THEN** the page displays the error and keeps the product in its last backend-confirmed approval state.

### Requirement: Admin voucher frontend
The web app SHALL provide voucher list, create, update, and deactivate UI backed by existing admin voucher contracts.

#### Scenario: Voucher list renders
- **WHEN** an authenticated admin opens `/admin/vouchers`
- **THEN** the page displays voucher code, discount type and value, minimum order amount, usage counts when available, expiry, status, and management actions.

#### Scenario: Voucher create and update
- **WHEN** an admin submits valid voucher data
- **THEN** the web app calls the existing admin voucher create or update contract
- **AND** displays backend validation errors for invalid dates, amounts, discount values, or limits.

#### Scenario: Voucher deactivate confirmation
- **WHEN** an admin deactivates a voucher
- **THEN** the page asks for confirmation before calling the existing deactivate contract
- **AND** refreshes the visible status from backend-confirmed data.

#### Scenario: Voucher hard delete not assumed
- **WHEN** the backend supports deactivate but not delete
- **THEN** the web app does not present hard delete as a production action.

### Requirement: Admin revenue frontend
The web app SHALL provide revenue metrics and tabular reporting backed by existing admin revenue contracts where available.

#### Scenario: Revenue summary renders
- **WHEN** an authenticated admin opens `/admin/revenue`
- **THEN** the page displays total revenue, order count, and average order value for the selected period when backend data is available.

#### Scenario: Revenue grouping
- **WHEN** an admin changes date range or grouping
- **THEN** the page requests or displays revenue data according to supported backend parameters.

#### Scenario: Revenue chart and table
- **WHEN** revenue series data is available
- **THEN** the page displays both a visual chart when approved dependencies allow it and a tabular representation of the same data.

#### Scenario: Export gap
- **WHEN** the backend does not provide export functionality
- **THEN** the UI does not fake an export
- **AND** documents the missing operation if export remains desired.

### Requirement: Admin payments and webhooks frontend
The web app SHALL provide payment history and webhook log UI backed by existing payment and webhook contracts where available.

#### Scenario: Payment history renders
- **WHEN** an authenticated admin opens the payments view
- **THEN** the page displays payment/order reference, customer context when available, provider, method, amount, payment status, and timestamp.

#### Scenario: Webhook log renders
- **WHEN** an authenticated admin opens the webhook view
- **THEN** the page displays provider, event type, processing status, timestamp, and a safe detail action for payload inspection.

#### Scenario: Webhook payload detail
- **WHEN** an admin opens a webhook detail view
- **THEN** the UI displays formatted JSON or structured payload data without exposing provider secrets.

#### Scenario: Missing admin payment or webhook contract
- **WHEN** an admin payment or webhook listing endpoint is not available
- **THEN** the UI documents the backend gap and does not synthesize production records from checkout mock data.

### Requirement: Admin audit log frontend
The web app SHALL provide audit log list and detail UI backed by existing audit log contracts where available.

#### Scenario: Audit log list renders
- **WHEN** an authenticated admin opens `/admin/audit-logs`
- **THEN** the page displays actor, action, entity type, entity id when available, and timestamp.

#### Scenario: Audit log filters
- **WHEN** an admin searches or filters audit logs by supported fields
- **THEN** the page uses supported backend query parameters or clearly limits filtering to loaded data when no backend filter exists.

#### Scenario: Audit detail renders
- **WHEN** an admin opens an audit log detail
- **THEN** the UI displays before and after data when available in a readable structured format.

#### Scenario: Missing audit log contract
- **WHEN** an audit log endpoint is not available
- **THEN** the UI documents the gap and does not rely on Figma mock audit logs as production records.

### Requirement: Admin async, confirmation, and responsive states
The web app SHALL provide consistent loading, empty, error, confirmation, pending, and responsive states across all admin surfaces.

#### Scenario: Loading states
- **WHEN** admin data is loading
- **THEN** the page renders stable skeletons or pending states that preserve table and card layout dimensions.

#### Scenario: Empty states
- **WHEN** an admin list or report has no records
- **THEN** the page displays an empty state with context-specific recovery or navigation where appropriate.

#### Scenario: Error states
- **WHEN** admin data loading or mutation fails
- **THEN** the page displays an actionable error and retry or safe navigation option where recovery is possible.

#### Scenario: Confirmation states
- **WHEN** an admin action can delete, archive, deactivate, reject, block, or otherwise materially change data
- **THEN** the UI requires confirmation before calling the mutation contract.

#### Scenario: Responsive admin tables
- **WHEN** admin tables render on mobile and desktop viewports
- **THEN** important columns remain scannable, secondary columns may collapse, and text or action buttons do not overlap.

### Requirement: Admin frontend implementation boundaries
The web app SHALL implement admin frontend behavior through typed service boundaries and existing repository conventions.

#### Scenario: Typed admin services
- **WHEN** admin UI needs backend data or mutations
- **THEN** it uses typed admin service functions, normalizers, and proxy/auth helpers rather than ad hoc unauthenticated component fetches.

#### Scenario: No Figma page-local production mutations
- **WHEN** admin implementation files are inspected
- **THEN** they do not use Figma `mockData`, page-local arrays, or local-only mutation state as the production source of truth.

#### Scenario: Existing stack preserved
- **WHEN** admin frontend implementation is complete
- **THEN** Next.js App Router, TypeScript, Tailwind CSS 3.4.3, Flowbite, and existing code conventions remain the baseline.

#### Scenario: Dependency additions are gated
- **WHEN** a chart, toast, or UI dependency appears necessary
- **THEN** the implementation documents the need and obtains approval before adding it.
