## Why

The ShopVN Figma Make prototype defines the storefront visual direction, navigation model, and homepage structure, while the current Next.js app already contains partially matching uncommitted homepage work. This change establishes a clean App Router storefront foundation so the prototype can be migrated incrementally without discarding existing work or pulling Vite/Tailwind 4/admin/customer scope into the app.

## What Changes

- Resolve the duplicate homepage route conflict between `apps/web/src/app/page.tsx` and `apps/web/src/app/(homepage)/page.tsx` so exactly one route resolves to `/`.
- Define the final storefront App Router route-group structure for the homepage foundation while keeping the existing Next.js App Router architecture.
- Create or refine the shared storefront layout that owns the public header/navigation and footer around homepage content.
- Reuse and refine existing Next.js homepage files and components where visually compatible:
  - `apps/web/src/app/page.tsx`
  - `apps/web/src/app/(homepage)/page.tsx`
  - `apps/web/src/app/(homepage)/layout.tsx`
  - `apps/web/src/components/homepage.tsx`
  - `apps/web/src/components/hero.tsx`
  - `apps/web/src/components/ui/homepage-header.tsx`
  - `apps/web/src/components/ui/logo.tsx`
  - `apps/web/src/components/ui/searchbar.tsx`
  - `apps/web/public/hero-background.jpg`
- Migrate or refine the storefront foundation from the Figma Make resources that are relevant to this scope:
  - `src/app/layouts/StorefrontLayout.tsx`
  - `src/app/pages/storefront/HomePage.tsx`
  - `src/app/components/ProductCard.tsx` only as homepage display reference, not cart behavior
  - `src/app/data/mockData.ts` only as content/reference data for homepage sections
  - `src/styles/index.css`, `src/styles/tailwind.css`, and `src/styles/theme.css` only as visual/reference material
  - `package.json` and `vite.config.ts` only as dependency/build-system contrast
  - the four Figma Make PNG assets:
    - `32e1de46507bf52401236cab0411649051a44b22.png`
    - `8fc7b3897e356c8020e5e8319e6f8449fd803f32.png`
    - `bdfa3570c374996e4c4ebfd1c2575ad81bd71206.png`
    - `ef9b4d6129aed5f75c122d99b123bd7de1687a02.png`
- Preserve the current Tailwind CSS 3.4.3 and Flowbite baseline. Do not migrate to Tailwind CSS 4 and do not import the full generated shadcn/Radix primitive set.
- Prefer Server Components for static homepage sections and introduce Client Components only for interactive navigation/search/menu behavior.
- Use Next.js routing, `next/link`, `next/image`, and App Router layouts instead of `react-router`, Vite entrypoints, or Figma Make provider patterns.
- Refine the desktop and mobile storefront navigation so it matches the Figma direction without implementing authentication, cart state, checkout, customer pages, or admin pages.
- Preserve and reuse `hero-background.jpg` when it matches the Figma hero direction; document whether any Figma PNG assets should be copied to `public`, ignored, or deferred.
- Document required Tailwind content/configuration updates and any necessary `next.config.js` image configuration for local or remote homepage imagery.
- Keep the homepage responsive and usable from 320px through 1536px, with no unintended horizontal scrolling and with the hero image filling its intended area.

Out of scope for this change:

- Login and registration behavior
- `AuthProvider` implementation
- Role-based access control
- Customer account pages
- Product detail behavior
- Cart state or cart API integration
- Checkout and payment
- Admin layout and admin pages
- Backend API implementation
- Tailwind 4 migration
- Full shadcn/Radix migration
- Recharts or admin chart dependencies

## Capabilities

### New Capabilities

- `storefront-foundation`: Defines the public storefront App Router foundation, homepage route ownership, shared storefront layout, homepage visual sections, asset strategy, and responsive behavior for the ShopVN homepage migration.

### Modified Capabilities

- None.

## Impact

- Affected frontend area:
  - `apps/web/src/app/page.tsx`
  - `apps/web/src/app/(homepage)/`
  - `apps/web/src/app/layout.tsx` only if required for global app shell compatibility
  - `apps/web/src/components/`
  - `apps/web/public/`
  - `apps/web/src/app/global.css`
  - `apps/web/tailwind.config.js`
  - `apps/web/next.config.js` only if image configuration is required
  - `apps/web/package.json` and `package-lock.json` only if an approved dependency is required
- Proposed storefront structure:
  - Keep one canonical homepage route at `/`.
  - Use a storefront route group such as `apps/web/src/app/(storefront)/` only if it removes ambiguity and does not create a second `/` route.
  - Keep shared storefront components under `apps/web/src/components/` or a clearer storefront subfolder when extraction is justified.
- Uncommitted homepage work protection:
  - Treat current uncommitted files as user work and migration seed material.
  - Do not overwrite or delete existing homepage components unless the later specification explicitly identifies the replacement.
  - Prefer incremental refinement and consolidation over wholesale replacement.
- Asset and `next/image` strategy:
  - Prefer local `public` assets for stable homepage imagery.
  - Reuse `hero-background.jpg` if it remains visually compatible with the Figma hero.
  - Evaluate the four Figma Make PNGs during design/spec work; only copy assets that are actually used by the homepage foundation.
  - If remote Figma/Unsplash-style imagery remains necessary, document and add the narrowest required `next.config.js` image remote patterns.
- Dependencies:
  - No dependency additions are expected for the foundation unless an approved interactive navigation requirement cannot be met with React, Next.js, Tailwind, Flowbite, and existing `lucide-react`.
  - Do not add `react-router`, Vite plugins, Tailwind 4 packages, full Radix/shadcn primitives, `sonner`, or `recharts` in this change.
- Risks:
  - Duplicate App Router route ownership may produce confusing `/` behavior if not resolved first.
  - The Figma prototype uses Tailwind 4 and browser-router assumptions that must be translated, not copied.
  - Current uncommitted homepage work could be accidentally overwritten if implementation does not treat it as existing user work.
  - Hero image and full-height layout changes could introduce gaps, clipping, or horizontal overflow at small widths.
  - Remote image usage could fail under Next.js image restrictions if `next.config.js` is not deliberately scoped.
- Rollback considerations:
  - Keep changes localized to storefront route/layout/component files and documented config changes.
  - Avoid backend, auth, cart, customer, checkout, and admin edits so rollback remains a frontend-only revert.
  - If asset changes cause issues, remove unused copied assets and fall back to the existing `hero-background.jpg`.
- Future OpenSpec boundaries:
  - Product listing and product detail migration should be a separate storefront/catalog change.
  - Auth pages and session behavior should be a separate authentication UI change.
  - Cart, checkout, and payment flows should be separate customer commerce changes tied to API contracts.
  - Account/orders pages should be a separate customer area change.
  - Admin layout, dashboard, tables, and charts should be a separate admin UI change.
