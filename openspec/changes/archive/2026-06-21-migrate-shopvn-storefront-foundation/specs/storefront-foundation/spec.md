## ADDED Requirements

### Requirement: Canonical storefront homepage route
The system SHALL expose exactly one Next.js App Router page for the public homepage at `/`, and the canonical target structure SHALL use the storefront route group at `apps/web/src/app/(storefront)/page.tsx` with `apps/web/src/app/(storefront)/layout.tsx`.

#### Scenario: Single route resolves to homepage
- **WHEN** the storefront foundation migration is complete
- **THEN** exactly one App Router `page.tsx` resolves to `/`
- **AND** no other route-group page also resolves to `/`.

#### Scenario: Storefront route group remains URL-transparent
- **WHEN** a user visits `/`
- **THEN** the browser URL remains `/`
- **AND** the route-group name `(storefront)` does not appear in the URL.

#### Scenario: Existing homepage routes are compared before consolidation
- **WHEN** the implementation resolves the duplicate homepage routes
- **THEN** it compares relevant work from `apps/web/src/app/page.tsx`, `apps/web/src/app/(homepage)/page.tsx`, and `apps/web/src/app/(homepage)/layout.tsx`
- **AND** it preserves compatible structure, layout, and visual work instead of replacing the homepage wholesale.

#### Scenario: Duplicate homepage route is removed
- **WHEN** the canonical storefront route group page is in place
- **THEN** `apps/web/src/app/page.tsx` and `apps/web/src/app/(homepage)/page.tsx` do not both continue to define route content for `/`.

### Requirement: Storefront layout ownership
The system SHALL keep `apps/web/src/app/layout.tsx` as the global root layout for metadata, fonts, global CSS, and application-wide providers only, while the storefront route-group layout SHALL own the public storefront header, navigation, main content shell, and footer.

#### Scenario: Root layout remains global-only
- **WHEN** the storefront foundation is implemented
- **THEN** `apps/web/src/app/layout.tsx` contains only global layout responsibilities such as metadata, font setup, global CSS import, and application-wide providers
- **AND** it does not own storefront-specific header, navigation, or footer markup.

#### Scenario: Storefront layout owns public shell
- **WHEN** the homepage renders through the storefront route group
- **THEN** `apps/web/src/app/(storefront)/layout.tsx` provides the public storefront header, navigation, main content shell, and footer around the homepage content.

#### Scenario: Header and footer are not duplicated
- **WHEN** the homepage renders
- **THEN** exactly one public storefront header is visible
- **AND** exactly one public storefront footer is visible.

#### Scenario: Customer and admin layouts remain outside scope
- **WHEN** the storefront foundation is implemented
- **THEN** no customer account, checkout, payment, cart, or admin layout is introduced or modified as part of this change.

### Requirement: Storefront header and navigation
The system SHALL provide a ShopVN storefront header that includes the logo, search field UI, static desktop navigation, mobile menu open/close behavior, responsive layout, and accessible keyboard interaction without requiring authentication, role switching, live cart state, or search API integration.

#### Scenario: Header contains static storefront controls
- **WHEN** the storefront homepage renders
- **THEN** the header contains the ShopVN logo, search field UI, desktop navigation links, login link or control, and cart link or control
- **AND** login and cart controls do not require mock authentication or cart state.

#### Scenario: Header avoids auth and cart providers
- **WHEN** storefront header files are inspected
- **THEN** they do not import or require `AuthProvider`, `CartProvider`, role-switching behavior, mock authentication state, or live cart quantity state.

#### Scenario: Desktop navigation is available at desktop widths
- **WHEN** the homepage is viewed at desktop widths
- **THEN** static storefront navigation is visible without requiring the mobile menu
- **AND** navigation content does not overlap adjacent header controls.

#### Scenario: Mobile menu opens and closes
- **WHEN** the homepage is viewed at mobile widths
- **THEN** a keyboard-accessible menu control can open the mobile navigation
- **AND** the mobile navigation can be closed without a page reload.

#### Scenario: Mobile menu exposes expanded state
- **WHEN** the mobile navigation is opened or closed
- **THEN** the menu control exposes the current expanded state using appropriate accessible state attributes.

#### Scenario: Search remains UI-only
- **WHEN** a user interacts with the search field in this change
- **THEN** the field remains a storefront search UI affordance
- **AND** no product search API integration is required.

### Requirement: Homepage content foundation
The system SHALL migrate or refine the ShopVN homepage foundation using existing Next.js homepage work where visually compatible and using Figma Make storefront resources as reference material only.

#### Scenario: Existing homepage components are reused
- **WHEN** homepage content is implemented
- **THEN** compatible work from `Homepage`, `Hero`, `HomepageHeader`, `Logo`, and `SearchBar` is reused or incrementally refined
- **AND** the implementation does not discard the existing homepage implementation wholesale.

#### Scenario: Figma storefront resources are references
- **WHEN** the implementation uses Figma Make material
- **THEN** `HomePage.tsx`, `StorefrontLayout.tsx`, `ProductCard.tsx`, and `mockData.ts` from Figma Make are treated as reference material
- **AND** Vite, `react-router`, and Figma provider patterns are not copied into the Next.js implementation.

#### Scenario: Homepage product cards are display-only
- **WHEN** product cards or featured product sections appear on the homepage
- **THEN** they display static product information suitable for the homepage
- **AND** add-to-cart behavior, cart API calls, and product API integration are not introduced.

#### Scenario: Static content may use typed local data
- **WHEN** homepage sections need repeated static content
- **THEN** the implementation may use typed local data structures for categories, products, benefits, or footer links
- **AND** those data structures do not become mock authentication, cart, checkout, customer, payment, or admin implementations.

### Requirement: Homepage section composition
The system SHALL render the visible Figma Make homepage sections in their intended order, preserve compatible existing Next.js homepage work, and prevent homepage sections from being silently omitted during migration.

#### Scenario: Homepage sections render in Figma order
- **WHEN** the storefront homepage renders
- **THEN** the visible homepage sections appear in this order: hero banner, feature strip, homepage search affordance, featured categories, featured products, promo banner, and best sellers
- **AND** no listed section is silently omitted during migration.

#### Scenario: Full-bleed and constrained sections are distinguished
- **WHEN** the homepage layout is implemented
- **THEN** the hero banner and feature strip may render as full-bleed horizontal sections
- **AND** the homepage search affordance, featured categories, featured products, promo banner, and best sellers render within the storefront content width unless design review explicitly keeps a section full-bleed.

#### Scenario: Existing Next.js homepage work is reused by compatible sections
- **WHEN** homepage section implementation is planned
- **THEN** the hero banner reuses or incrementally refines the existing `Hero` component where visually compatible
- **AND** the feature strip, homepage search affordance, category section, product display sections, promo banner, and footer-adjacent homepage structure reuse or incrementally refine existing `Homepage`, `HomepageHeader`, `Logo`, and `SearchBar` work where visually compatible.

#### Scenario: Repeated homepage sections may use typed static data
- **WHEN** the feature strip, featured categories, featured products, promo banner, or best sellers need repeated or configurable display content
- **THEN** they may use typed static local data derived from the Figma Make homepage and mock homepage data
- **AND** that data remains display data only.

#### Scenario: Product sections remain read-only
- **WHEN** featured products or best sellers render
- **THEN** product cards are read-only homepage displays
- **AND** they do not perform add-to-cart behavior, cart API calls, product API calls, authentication checks, or login prompt modal behavior.

#### Scenario: Figma-only behavior is excluded from homepage composition
- **WHEN** Figma Make homepage sections are migrated
- **THEN** `react-router` navigation hooks, mock auth checks, mock cart calls, and `ConfirmModal` login-prompt behavior from the Figma prototype are not introduced.

### Requirement: Hero presentation
The system SHALL provide a responsive ShopVN hero section that reuses `apps/web/public/hero-background.jpg` when visually compatible, supports either `next/image` or a decorative local CSS background, fills its intended available width, keeps text readable, and avoids unintended gaps or horizontal overflow.

#### Scenario: Hero uses local background when compatible
- **WHEN** the existing `hero-background.jpg` matches the approved storefront visual direction
- **THEN** the hero uses that local asset through either `next/image` or a decorative local CSS background
- **AND** no remote hero image configuration is required for that asset.

#### Scenario: Hero rendering strategy is explicit
- **WHEN** the hero implementation is selected
- **THEN** the chosen approach is either `next/image` with intentional `object-fit` and `object-position` or a decorative local CSS background with intentional `background-size` and `background-position`
- **AND** the chosen approach preserves the Figma Make hero composition.

#### Scenario: Hero fills intended area
- **WHEN** the homepage renders at supported widths
- **THEN** the hero media occupies its intended available width without unintended side gaps
- **AND** the media aligns correctly with the top of the hero section.

#### Scenario: Hero accessibility matches rendering strategy
- **WHEN** the hero uses `next/image` as meaningful content
- **THEN** the image has suitable alt text
- **AND** when the hero media is decorative, it is hidden from assistive technologies or implemented as decorative CSS background.

#### Scenario: Hero text remains readable
- **WHEN** the homepage is viewed from 320px through 1536px wide
- **THEN** hero text remains readable against the media
- **AND** text does not overflow or become unintentionally clipped.

#### Scenario: Hero avoids desktop-only fixed sizing
- **WHEN** the hero is implemented
- **THEN** it does not depend on fixed desktop-only pixel dimensions
- **AND** it adapts to mobile, tablet, laptop, and wide desktop widths.

### Requirement: Storefront footer
The system SHALL render the Figma Make storefront footer as a single responsive footer containing ShopVN brand information, customer-support links, about-us links, payment method badges, and legal copyright content without introducing auth, API, newsletter, or backend behavior.

#### Scenario: Footer content groups are present
- **WHEN** the storefront homepage renders
- **THEN** the footer contains ShopVN brand information with the brand mark/name and description
- **AND** it contains the customer-support link group with `Trung tâm trợ giúp`, `Chính sách đổi trả`, and `Hướng dẫn đặt hàng`
- **AND** it contains the about-us link group with `Giới thiệu`, `Tuyển dụng`, and `Liên hệ`
- **AND** it contains the payment method badges `MoMo`, `VNPay`, `Stripe`, and `COD`
- **AND** it contains the copyright text for ShopVN.

#### Scenario: Footer renders once
- **WHEN** the homepage renders through the storefront layout
- **THEN** exactly one storefront footer instance is present.

#### Scenario: Footer stacks responsively
- **WHEN** the footer is viewed at the required viewport widths
- **THEN** footer content groups stack or arrange into responsive columns without overlapping
- **AND** the footer does not introduce horizontal overflow.

#### Scenario: Footer links are keyboard accessible
- **WHEN** users navigate footer links with a keyboard
- **THEN** each footer link can receive focus and be activated.

#### Scenario: Footer remains presentation-only
- **WHEN** footer content is implemented in this change
- **THEN** it does not introduce authentication behavior, API calls, newsletter submission, backend behavior, or dynamic payment integration.

### Requirement: Storefront asset strategy
The system SHALL prefer stable local assets under `apps/web/public/`, evaluate each Figma Make PNG individually, and copy only assets actually used by the storefront foundation.

#### Scenario: Figma PNG assets are evaluated individually
- **WHEN** asset migration is considered
- **THEN** each of the four Figma Make PNG assets is evaluated for actual storefront foundation use
- **AND** the decision for each asset is to copy, ignore, or defer based on whether it is used by this change.

#### Scenario: Unused assets are not copied
- **WHEN** a Figma Make PNG asset is not used by the storefront foundation
- **THEN** it is not copied into the repository.

#### Scenario: Local assets are preferred
- **WHEN** homepage imagery is required
- **THEN** stable local files under `apps/web/public/` are preferred over remote image URLs.

#### Scenario: Remote image configuration is narrowly scoped
- **WHEN** a required homepage image cannot reasonably be localized
- **THEN** any `next.config.js` remote image pattern is added only for the narrow host/path required by that image
- **AND** no broad remote image allowlist is introduced.

### Requirement: Styling and dependency boundaries
The system SHALL keep the existing Tailwind CSS 3.4.3 and Flowbite baseline, avoid Tailwind 4 and Vite migration, and add no dependency unless the storefront foundation cannot be implemented with the existing stack.

#### Scenario: Tailwind baseline is preserved
- **WHEN** styling configuration is updated for the storefront foundation
- **THEN** Tailwind CSS remains on the existing 3.4.3 baseline
- **AND** Tailwind CSS 4 configuration, `@tailwindcss/vite`, and Tailwind 4-specific CSS entrypoint patterns are not introduced.

#### Scenario: Existing UI baseline is preserved
- **WHEN** the storefront foundation is implemented
- **THEN** Flowbite remains part of the current UI dependency baseline
- **AND** the full Figma shadcn/Radix primitive library is not imported.

#### Scenario: Vite and react-router are excluded
- **WHEN** migrated storefront files are inspected
- **THEN** they do not import Vite configuration, Vite plugins, `react-router`, or `react-router` APIs.

#### Scenario: Admin-only dependencies are excluded
- **WHEN** dependency changes are reviewed
- **THEN** Sonner, Recharts, and admin-only dependencies are not added by this change.

#### Scenario: New dependencies require explicit need
- **WHEN** a new dependency is proposed
- **THEN** the implementation identifies a storefront foundation requirement that cannot be met with Next.js, React, Tailwind CSS 3.4.3, Flowbite, existing `lucide-react`, and local code
- **AND** the dependency is limited to that approved requirement.

#### Scenario: Server Components are preferred
- **WHEN** storefront components are created or refined
- **THEN** static layout and homepage sections are Server Components by default
- **AND** `"use client"` is used only for components that require interaction or browser APIs.

### Requirement: Responsive storefront behavior
The system SHALL keep the storefront homepage usable at 320px, 375px, 768px, 1024px, and 1536px widths without unintended horizontal scrolling or content overlap.

#### Scenario: Required viewport widths are reviewed
- **WHEN** responsive verification is performed
- **THEN** the storefront homepage is reviewed at 320px, 375px, 768px, 1024px, and 1536px viewport widths.

#### Scenario: No unintended horizontal scrolling
- **WHEN** the homepage is viewed at each required viewport width
- **THEN** no unintended horizontal scrolling exists.

#### Scenario: Header controls adapt responsively
- **WHEN** the homepage is viewed at each required viewport width
- **THEN** header controls remain visible or intentionally collapse into mobile navigation
- **AND** navigation content does not overlap.

#### Scenario: Mobile navigation remains usable
- **WHEN** the homepage is viewed at mobile widths
- **THEN** mobile navigation can be opened, used, and closed
- **AND** it does not obscure controls in an unrecoverable way.

#### Scenario: Main content respects viewport edges
- **WHEN** the homepage is viewed at each required viewport width
- **THEN** main content does not touch the viewport edge unless the section is intentionally full-bleed
- **AND** text remains readable without relying on browser zoom.

#### Scenario: Images preserve composition
- **WHEN** homepage images render at each required viewport width
- **THEN** they preserve the intended visual composition
- **AND** they do not create layout overflow.

### Requirement: Storefront accessibility
The system SHALL use semantic landmarks, keyboard-accessible controls, accessible names, suitable image alternatives, visible focus behavior, and logical heading hierarchy for the storefront foundation.

#### Scenario: Semantic landmarks are present
- **WHEN** the homepage document is inspected
- **THEN** it uses semantic `header`, `nav`, `main`, and `footer` landmarks for the storefront page structure.

#### Scenario: Interactive controls are keyboard accessible
- **WHEN** users navigate the storefront header and mobile menu with a keyboard
- **THEN** all interactive controls can be reached and operated without a mouse.

#### Scenario: Icon-only buttons have accessible names
- **WHEN** an icon-only button is present
- **THEN** it has an accessible name describing its action.

#### Scenario: Images have suitable alternatives
- **WHEN** images render on the homepage
- **THEN** meaningful images have suitable alt text
- **AND** decorative images are marked decorative.

#### Scenario: Visible focus is preserved
- **WHEN** interactive elements receive keyboard focus
- **THEN** visible focus behavior is not removed.

#### Scenario: Heading hierarchy is logical
- **WHEN** the homepage headings are inspected
- **THEN** heading levels form a logical hierarchy for the page content.

### Requirement: Scope and verification boundaries
The system SHALL verify the storefront foundation without introducing unrelated auth, cart, checkout, customer, payment, admin, backend, Vite, or `react-router` implementation.

#### Scenario: Only storefront foundation files are modified
- **WHEN** implementation changes are reviewed
- **THEN** no unrelated repository files are modified
- **AND** no auth, cart, checkout, customer, payment, admin, or backend implementation is introduced.

#### Scenario: Homepage route uniqueness is verified
- **WHEN** implementation verification is performed
- **THEN** the agent verifies that exactly one route resolves to `/`.

#### Scenario: Migrated storefront files exclude Vite and react-router
- **WHEN** migrated storefront files are inspected
- **THEN** no Vite or `react-router` imports exist in those files.

#### Scenario: TypeScript check passes
- **WHEN** the implementation is complete
- **THEN** TypeScript checking passes for the relevant Next.js/Nx project.

#### Scenario: Linting passes
- **WHEN** the implementation is complete
- **THEN** linting passes for the relevant Next.js/Nx project.

#### Scenario: Next.js or Nx build target passes
- **WHEN** the implementation is complete
- **THEN** the relevant Next.js/Nx build target passes.

#### Scenario: Actual project targets are inspected
- **WHEN** the implementation agent chooses verification commands
- **THEN** it inspects the Nx workspace and actual configured project targets
- **AND** it does not invent command names that are not configured.
