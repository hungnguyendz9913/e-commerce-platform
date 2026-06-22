## Context

The ShopVN Figma Make prototype provides the intended storefront visual direction and homepage composition, but it is a React/Vite prototype with React Router, mock authentication, mock cart state, role switching, customer pages, admin pages, Tailwind CSS 4, and broad UI dependencies. The current repository is an Nx workspace with a Next.js App Router web app using Tailwind CSS 3.4.3, Flowbite, and `lucide-react`.

The current Next.js app already contains compatible homepage work. This change will consolidate that work into a single canonical storefront homepage route and translate only the storefront foundation parts of the Figma Make prototype.

## Goals

- Expose exactly one public homepage route at `/`.
- Use `apps/web/src/app/(storefront)/page.tsx` as the canonical homepage page.
- Use `apps/web/src/app/(storefront)/layout.tsx` as the owner of the public storefront shell.
- Keep `apps/web/src/app/layout.tsx` global-only.
- Preserve compatible existing `Homepage`, `Hero`, `HomepageHeader`, `Logo`, and `SearchBar` work through consolidation and refinement.
- Render one header, one `main`, and one footer for the storefront homepage.
- Keep homepage product cards display-only.
- Keep the existing Tailwind CSS 3.4.3, Flowbite, and `lucide-react` stack.
- Prefer the existing local `apps/web/public/hero-background.jpg`.

## Non-goals

- No Vite migration.
- No React Router migration.
- No Tailwind CSS 4 migration.
- No shadcn/Radix primitive library import.
- No authentication provider, mock auth state, role switcher, or login behavior.
- No cart provider, live cart count, add-to-cart behavior, or cart API calls.
- No checkout, payment, customer account, order, or admin UI.
- No backend API work.
- No new dependency unless a later implementation proves the foundation cannot be met with the existing stack.
- No `tasks.md` as part of this design artifact.

## Current-state findings

The current app has duplicate App Router pages that resolve to `/`:

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/(homepage)/page.tsx`

The current homepage shell is split across route files:

- `apps/web/src/app/page.tsx` embeds `HomepageHeader` and wraps `Homepage` in a scrolling shell.
- `apps/web/src/app/(homepage)/layout.tsx` embeds `HomepageHeader` and a `main` wrapper.
- `apps/web/src/components/homepage.tsx` embeds homepage sections and the footer.

This means the existing route composition owns the header, while `Homepage` owns the footer. The final design moves both responsibilities into the storefront route-group layout so header and footer render exactly once.

The Figma Make `StorefrontLayout.tsx` is useful as a visual reference for the header, navigation, footer, and content width, but it imports `react-router`, `useAuth`, `useCart`, `sonner`, mock role switching, and cart totals. It must not be copied as implementation.

The Figma Make `HomePage.tsx`, `ProductCard.tsx`, and `mockData.ts` are useful as section and content references. Their interactive navigation, login prompt, auth checks, add-to-cart behavior, and mock commerce state are excluded.

## Architecture and route decisions

Final App Router structure:

```text
apps/web/src/app/
  layout.tsx
  not-found.tsx
  api/hello/route.ts
  (storefront)/
    layout.tsx
    page.tsx
```

`apps/web/src/app/layout.tsx` remains the root layout. It owns only document-level and global concerns:

- `<html>` and `<body>`
- metadata
- font setup
- `global.css`
- future application-wide providers only, if any are independently approved

`apps/web/src/app/(storefront)/layout.tsx` owns the public storefront shell:

- `<header>`
- desktop and mobile navigation
- a single `<main>` wrapping `children`
- `<footer>`

`apps/web/src/app/(storefront)/page.tsx` owns only homepage content composition by rendering the consolidated `Homepage` component or equivalent storefront homepage sections.

Duplicate route resolution decision:

- Delete `apps/web/src/app/page.tsx` after its compatible wrapper/header decisions are migrated into `(storefront)/layout.tsx`.
- Delete `apps/web/src/app/(homepage)/page.tsx` after its `Homepage` render responsibility is migrated into `(storefront)/page.tsx`.
- Delete `apps/web/src/app/(homepage)/layout.tsx` after its shell responsibility is migrated into `(storefront)/layout.tsx`.
- Do not keep redirect-only or empty placeholder pages at `apps/web/src/app/page.tsx` or `apps/web/src/app/(homepage)/page.tsx`, because either file would continue to define a `/` page.

## Component design

Target component ownership:

```text
RootLayout
  StorefrontLayout
    StorefrontHeader
      Logo
      SearchBar
      desktop nav links
      login/cart static links
      MobileNavigation
    main
      StorefrontHomePage
        Hero
        FeatureStrip
        HomepageSearchAffordance
        FeaturedCategories
        FeaturedProducts
        PromoBanner
        BestSellers
    StorefrontFooter
      Logo
      support links
      about links
      payment badges
      copyright
```

The existing `Logo` component remains reusable. It may be refined for layout and focus context, but it must not grow auth, cart, or routing state.

The existing `SearchBar` remains a UI-only affordance. Header search may be an inert form, a plain input, or a non-submitting search box. It must not call a search API.

The existing `HomepageHeader` should be consolidated into a storefront header component. Its static logo, search, cart link/control, login/register links, and desktop navigation are preserved where compatible. Header ownership moves out of route pages and into `(storefront)/layout.tsx`.

The existing `Homepage` should remain the main source for homepage sections. Its footer is extracted or moved into the storefront layout so `Homepage` returns section content only.

Product display should use a local display-only component or section-local article markup. It may preserve the existing visual card work, but icon buttons must be non-mutating display affordances or converted to links/static controls. No `onAddToCart`, cart provider, cart API call, auth check, or login prompt is allowed.

## Server/client boundaries

Server Components by default:

- `apps/web/src/app/(storefront)/page.tsx`
- static homepage sections
- `Hero`
- `FeatureStrip`
- `FeaturedCategories`
- `FeaturedProducts`
- `PromoBanner`
- `BestSellers`
- `StorefrontFooter`
- `Logo`, unless implementation adds browser-only behavior

Client Components only where interaction requires React state or browser event handling:

- mobile navigation open/close control
- any account/cart/menu popover that uses local state, if kept static

Preferred split:

- Keep `apps/web/src/app/(storefront)/layout.tsx` as a Server Component.
- Render a small client component such as `StorefrontHeaderClient` only for mobile menu state.
- Keep static layout, footer, and homepage sections outside the client boundary.

No Client Component may import or require `AuthProvider`, `CartProvider`, `react-router`, role switching, mock auth state, live cart state, or API calls.

## Homepage section design

The homepage renders visible Figma Make sections in this exact order:

1. Hero banner
2. Feature strip
3. Homepage search affordance
4. Featured categories
5. Featured products
6. Promo banner
7. Best sellers

Implementation approach:

- Reuse the existing `Hero` component as the basis for the hero banner.
- Reuse existing static benefit data and lucide icons for the feature strip.
- Reuse or refine the existing homepage search affordance, adding a search icon if compatible with `SearchBar`.
- Reuse the existing category data shape, expanding to the Figma count/order if needed.
- Reuse existing product data as typed local display data. Use only homepage fields such as category, name, price, stock note, and visual/image metadata.
- Reuse the existing promo banner text and visual direction.
- Reuse existing best-seller display data.

The homepage component must not embed a `main`, header, footer, app-height shell, or scroll container. Those belong to the storefront layout and browser document flow.

## Header and navigation behavior

Header content:

- ShopVN logo linked to `/`.
- Search field UI with accessible label or placeholder.
- Desktop navigation links for `Tất cả sản phẩm`, `Điện tử`, `Thời trang`, and `Gia dụng`.
- Login link/control.
- Cart link/control with no live quantity.
- Mobile menu toggle.

Desktop behavior:

- At desktop widths, show the static navigation without requiring the mobile menu.
- Keep search, logo, nav, login, and cart controls from overlapping.
- Permit horizontal nav scrolling only for the navigation row if needed, not for the whole page.

Mobile behavior:

- At mobile widths, collapse category navigation into a menu opened by an icon button.
- The menu button must be a real `<button type="button">`.
- The button must expose `aria-expanded`.
- The button must identify the controlled panel with `aria-controls`.
- The icon-only button must have an accessible name, such as `Mở menu điều hướng` or `Đóng menu điều hướng`.
- The mobile panel must close when a mobile navigation link is activated.
- The panel must be dismissible by the same button without a page reload.

No role switcher, user avatar dropdown, logout action, toast, live cart badge, or auth-conditioned rendering is included in this change.

## Hero strategy

Use `apps/web/public/hero-background.jpg` as the hero image.

Rendering strategy:

- Use `next/image` with `fill`, `priority`, `sizes`, `object-fit: cover`, and intentional `object-position`.
- Treat the image as decorative because the hero text communicates the offer and the image is atmospheric commerce context.
- Use `alt=""` for the image.
- Add an overlay that preserves readable text from 320px through 1536px.

Layout strategy:

- The hero is full-bleed.
- The inner content is constrained to the storefront content width.
- Avoid fixed desktop-only sizing.
- Use responsive vertical padding and a stable minimum height rather than a single hard-coded desktop height.
- Preserve the existing Figma-compatible headline, supporting copy, and two calls to action as static links or non-mutating controls.

No remote hero image configuration is required.

## Asset decision record

| Asset | Source | Decision | Reason |
| --- | --- | --- | --- |
| `apps/web/public/hero-background.jpg` | Existing repo local asset | Use | Stable local asset, already available under `public`, compatible with the approved hero direction, and avoids remote image configuration. |
| `32e1de46507bf52401236cab0411649051a44b22.png` | Figma Make PNG | Defer | No approved storefront foundation usage has been identified. Do not copy until a specific section requires it. |
| `8fc7b3897e356c8020e5e8319e6f8449fd803f32.png` | Figma Make PNG | Defer | No approved storefront foundation usage has been identified. Do not copy until a specific section requires it. |
| `bdfa3570c374996e4c4ebfd1c2575ad81bd71206.png` | Figma Make PNG | Defer | No approved storefront foundation usage has been identified. Do not copy until a specific section requires it. |
| `ef9b4d6129aed5f75c122d99b123bd7de1687a02.png` | Figma Make PNG | Defer | No approved storefront foundation usage has been identified. Do not copy until a specific section requires it. |

If a later implementation cannot map a visible homepage section without a Figma PNG, that asset must be evaluated individually before copying. Unknown or unused PNGs are not copied.

## Styling and dependency decisions

Keep the current styling stack:

- Tailwind CSS 3.4.3
- Flowbite and Flowbite React baseline
- `lucide-react`
- existing local CSS in `apps/web/src/app/global.css`

Do not introduce:

- Tailwind CSS 4
- `@tailwindcss/vite`
- Vite config or plugins
- `react-router`
- shadcn/Radix primitive library
- `sonner`
- `recharts`
- MUI
- mock provider dependencies from Figma Make

Use Tailwind utility classes and small local component extraction. Do not import the Figma Make Tailwind 4 CSS entrypoint pattern.

Only update `tailwind.config.js`, `next.config.js`, or dependencies if implementation proves it is required. Based on the selected local hero asset and current component plan, no dependency or remote image config change is expected.

## Responsive design

The storefront content width is `max-w-[1280px]` or the closest existing equivalent, centered with responsive horizontal padding.

Full-bleed sections:

- Hero banner
- Feature strip

Constrained sections:

- Homepage search affordance
- Featured categories
- Featured products
- Promo banner
- Best sellers
- Footer inner content

Viewport decisions:

| Width | Expected behavior |
| --- | --- |
| 320px | Header uses compact layout, mobile menu toggle is available, search does not force horizontal overflow, hero text wraps cleanly, product/category grids use one or two columns only if content remains readable. |
| 375px | Mobile layout remains stable, menu opens/closes without covering its own recovery control, hero and promo text remain readable. |
| 768px | Tablet layout may show more search/header width and multi-column homepage grids; navigation must not overlap adjacent controls. |
| 1024px | Desktop navigation is visible without mobile menu; product grids may use four columns where spacing allows. |
| 1536px | Content remains constrained, full-bleed sections fill the viewport width, hero image preserves composition without side gaps. |

The page must not use `h-screen` and internal homepage scroll containers for the public shell. Normal document scrolling is preferred to avoid clipped content and nested scroll behavior.

## Accessibility design

Landmarks:

- Root storefront shell uses one `header`.
- Header contains `nav` landmarks for primary navigation.
- Storefront layout wraps children in one `main`.
- Storefront shell uses one `footer`.

Keyboard and controls:

- All links and buttons are reachable by keyboard.
- Icon-only buttons have accessible names.
- Mobile menu button uses `aria-expanded` and `aria-controls`.
- Mobile links close the menu on activation.
- Visible focus styles are preserved; do not remove outlines without replacing them.

Images:

- Hero image uses `alt=""` because it is decorative.
- Any meaningful product/category images added later require descriptive alt text.
- CSS or gradient product visuals must not be exposed as meaningful images.

Heading hierarchy:

- Hero uses the single page `h1`.
- Major homepage sections use `h2`.
- Product card names may use `h3` only if nested under product sections; otherwise use semantic article text without disrupting hierarchy.

## File impact plan

| File | Impact | Decision |
| --- | --- | --- |
| `apps/web/src/app/(storefront)/layout.tsx` | Add | New canonical storefront shell with one header, one `main`, and one footer. |
| `apps/web/src/app/(storefront)/page.tsx` | Add | New canonical homepage page for `/`. |
| `apps/web/src/app/page.tsx` | Delete | Duplicate `/` page. Preserve compatible shell decisions by moving them into `(storefront)/layout.tsx` before removal. |
| `apps/web/src/app/(homepage)/page.tsx` | Delete | Duplicate `/` page. Preserve `Homepage` render responsibility in `(storefront)/page.tsx`. |
| `apps/web/src/app/(homepage)/layout.tsx` | Delete | Duplicate route-group shell. Preserve compatible header/main shell behavior in `(storefront)/layout.tsx`. |
| `apps/web/src/app/layout.tsx` | Keep, minimal edit only if needed | Remains global-only. Must not gain storefront header/footer. |
| `apps/web/src/components/homepage.tsx` | Modify | Keep homepage section composition and local display data; remove embedded footer and any page-shell responsibilities. |
| `apps/web/src/components/hero.tsx` | Modify | Keep and refine hero using `hero-background.jpg` with responsive `next/image` strategy. |
| `apps/web/src/components/ui/homepage-header.tsx` | Modify or replace with storefront header component | Move ownership under storefront layout; add mobile menu behavior without auth/cart state. |
| `apps/web/src/components/ui/logo.tsx` | Reuse, minor refinement only | Shared brand mark for header and footer. |
| `apps/web/src/components/ui/searchbar.tsx` | Reuse, minor refinement only | UI-only search affordance. |
| `apps/web/src/app/global.css` | Minimal edit only if needed | Keep Tailwind 3 entrypoint and existing utilities. Remove obsolete scaffold styles only if they interfere with storefront layout. |
| `apps/web/public/hero-background.jpg` | Reuse | Final hero image asset. |
| Figma Make PNG assets | No copy | Defer all four until specific usage is approved. |
| `apps/web/tailwind.config.js` | No expected change | Keep Tailwind 3.4.3 and Flowbite config. |
| `apps/web/next.config.js` | No expected change | Local hero asset needs no remote image pattern. |
| `apps/web/package.json` | No change | No new dependencies expected. |
| `package-lock.json` | No change | No dependency changes expected. |

## Verification strategy

Use actual Nx targets for `@e-commerce-platform/web`; do not invent a typecheck target.

Required configured-target verification:

```bash
npx nx lint @e-commerce-platform/web
npx nx test @e-commerce-platform/web
npx nx build @e-commerce-platform/web
```

Route uniqueness verification:

- Inspect `apps/web/src/app` for `page.tsx` files that resolve to `/`.
- Confirm only `apps/web/src/app/(storefront)/page.tsx` remains for `/`.
- Confirm no `apps/web/src/app/page.tsx` and no other root-level route-group `page.tsx` remains.

Boundary verification:

```bash
rg -n "react-router|createBrowserRouter|useNavigate|AuthProvider|CartProvider|useAuth|useCart|sonner|recharts|@tailwindcss/vite|vite" apps/web
```

Responsive verification:

- Review the homepage at 320px, 375px, 768px, 1024px, and 1536px.
- Check no unintended horizontal scrolling exists.
- Check header controls do not overlap.
- Check mobile navigation opens and closes.
- Check hero text remains readable and image composition remains acceptable.

Accessibility verification:

- Confirm `header`, `nav`, `main`, and `footer` landmarks.
- Confirm icon-only buttons have accessible names.
- Confirm mobile menu exposes `aria-expanded`.
- Confirm visible focus remains.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Duplicate App Router pages continue to resolve to `/`. | Delete the old root and `(homepage)` page files after consolidating their compatible responsibilities into `(storefront)`. Verify route uniqueness by file inspection. |
| Existing homepage work is overwritten wholesale. | Treat existing files as source material. Move responsibilities incrementally: route shell to layout, footer to layout, sections remain in homepage composition. |
| Header or footer renders twice. | Storefront layout is the only owner of header/footer. Homepage sections must not render footer or page shell. |
| Figma prototype behavior leaks into the Next.js app. | Use Figma files as references only. Explicitly exclude React Router, providers, role switching, auth checks, cart calls, login prompts, Sonner, and admin/customer pages. |
| Static sections accidentally become client-rendered. | Keep page, footer, hero, and homepage sections as Server Components. Isolate mobile menu state in a small Client Component. |
| Hero image creates gaps or clipped text. | Use `next/image` fill with `object-cover`, intentional object position, overlay, responsive padding, and no fixed desktop-only height. |
| Mobile header causes horizontal scrolling. | Use constrained widths, wrapping/collapsing behavior, and a mobile menu at small widths. Verify at 320px and 375px. |
| Unused Figma PNGs bloat the repo. | Defer all four PNG assets until a specific approved use exists. Copy none for the foundation. |
| Verification commands drift from real Nx targets. | Use only `build`, `lint`, and `test` for `@e-commerce-platform/web`; do not add or reference a non-existent typecheck target. |
