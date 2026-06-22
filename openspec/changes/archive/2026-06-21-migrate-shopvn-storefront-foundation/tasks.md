## 1. Protect and inspect current work

- [x] Record the current git status before editing.
- [x] Record the currently uncommitted storefront-related files.
- [x] Compare the existing duplicate homepage route files:
  - [x] `apps/web/src/app/page.tsx`
  - [x] `apps/web/src/app/(homepage)/page.tsx`
  - [x] `apps/web/src/app/(homepage)/layout.tsx`
- [x] Identify compatible header, main-shell, and homepage render behavior that must be preserved before deleting duplicate routes.
- [x] Inspect the actual Nx project targets for `@e-commerce-platform/web` before choosing verification commands.
- [x] Confirm no reset, discard, or overwrite operation is used against existing uncommitted user work.

## 2. Establish the canonical storefront route

- [x] Create `apps/web/src/app/(storefront)/layout.tsx`.
- [x] Create `apps/web/src/app/(storefront)/page.tsx`.
- [x] Consolidate compatible homepage behavior into the new `(storefront)` route group.
- [x] Remove the old duplicate `/` route files only after their required content has been preserved:
  - [x] Remove `apps/web/src/app/page.tsx`.
  - [x] Remove `apps/web/src/app/(homepage)/page.tsx`.
  - [x] Remove `apps/web/src/app/(homepage)/layout.tsx`.
- [x] Verify exactly one App Router `page.tsx` resolves to `/`.
- [x] Verify the `(storefront)` route-group name remains absent from the public URL.

## 3. Establish storefront layout ownership

- [x] Keep `apps/web/src/app/layout.tsx` global-only.
- [x] Move storefront header ownership into `apps/web/src/app/(storefront)/layout.tsx`.
- [x] Move storefront navigation ownership into `apps/web/src/app/(storefront)/layout.tsx`.
- [x] Move the single storefront `main` wrapper into `apps/web/src/app/(storefront)/layout.tsx`.
- [x] Move storefront footer ownership into `apps/web/src/app/(storefront)/layout.tsx`.
- [x] Remove embedded header ownership from old page compositions.
- [x] Remove embedded footer responsibility from `Homepage`.
- [x] Remove page-shell and internal scroll responsibilities from `Homepage`.
- [x] Confirm the final storefront document renders one header, one main, and one footer.

## 4. Refine storefront header

- [x] Reuse and incrementally refine `HomepageHeader`.
- [x] Reuse and incrementally refine `Logo`.
- [x] Reuse and incrementally refine `SearchBar`.
- [x] Preserve the existing Tailwind CSS 3.4.3, Flowbite, and `lucide-react` stack.
- [x] Keep header search UI-only with no product search API integration.
- [x] Keep authentication and live cart state outside scope.
- [x] Ensure header code does not import or require:
  - [x] `AuthProvider`
  - [x] `CartProvider`
  - [x] `useAuth`
  - [x] `useCart`
  - [x] role switching
  - [x] `sonner`
  - [x] React Router
  - [x] API behavior

## 5. Implement isolated mobile navigation

- [x] Create the smallest necessary Client Component for mobile menu state.
- [x] Keep the surrounding storefront layout server-rendered where possible.
- [x] Keep static header structure server-rendered where possible.
- [x] Add real button semantics for the mobile menu control.
- [x] Add `type="button"` to the mobile menu control.
- [x] Add `aria-expanded` to the mobile menu control.
- [x] Add `aria-controls` to connect the control to the mobile navigation panel.
- [x] Add an accessible open/close name for the menu control.
- [x] Verify keyboard operation for opening and closing the menu.
- [x] Preserve visible focus behavior.
- [x] Close the menu when a mobile navigation item is activated.
- [x] Ensure the menu can always be dismissed.

## 6. Resolve out-of-scope navigation targets

- [x] Inspect whether the login route currently exists.
- [x] Inspect whether the cart route currently exists.
- [x] Inspect whether product listing, product category, and CTA target routes currently exist.
- [x] Use Next `Link` only for valid existing destinations.
- [x] Do not create placeholder application routes in this change.
- [x] Do not introduce links that knowingly produce a 404.
- [x] For future destinations, use a non-navigation visual affordance or an appropriately disabled control without misleading keyboard or screen-reader behavior.
- [x] Do not use empty `href` values.
- [x] Do not use `href="#"`.

## 7. Refactor homepage composition

- [x] Preserve and render homepage sections in the approved order:
  - [x] Hero banner
  - [x] Feature strip
  - [x] Homepage search affordance
  - [x] Featured categories
  - [x] Featured products
  - [x] Promo banner
  - [x] Best sellers
- [x] Reuse existing compatible implementation for each section.
- [x] Keep static sections as Server Components.
- [x] Use typed local presentation data where useful.
- [x] Preserve logical heading hierarchy.
- [x] Keep product displays read-only.
- [x] Do not introduce product API calls.
- [x] Do not introduce authentication checks.
- [x] Do not introduce cart actions.
- [x] Do not introduce login prompts.
- [x] Do not introduce commerce state.

## 8. Refine hero implementation

- [x] Reuse `apps/web/public/hero-background.jpg`.
- [x] Implement the approved `next/image` strategy:
  - [x] `fill`
  - [x] `priority`
  - [x] `sizes`
  - [x] `object-cover`
  - [x] intentional object position
  - [x] decorative `alt=""`
- [x] Ensure the image parent has required positioning and sizing.
- [x] Preserve readable text with an appropriate overlay.
- [x] Use responsive padding.
- [x] Use minimum-height behavior rather than a fixed desktop-only height.
- [x] Ensure the hero is full-bleed.
- [x] Ensure the hero has no unintended top gaps.
- [x] Ensure the hero has no unintended side gaps.
- [x] Do not add remote image configuration.

## 9. Implement feature and content sections

- [x] Refine the feature strip as a full-bleed section with constrained inner content.
- [x] Refine the homepage search affordance as a constrained presentation-only section.
- [x] Refine featured category cards using typed static data.
- [x] Refine featured product sections using display-only product data.
- [x] Refine best-seller sections using display-only product data.
- [x] Refine the promo banner.
- [x] Ensure repeated lists use stable keys.
- [x] Ensure meaningful images have suitable alt text.
- [x] Ensure decorative visuals remain hidden from assistive technology.

## 10. Extract and implement storefront footer

- [x] Move footer ownership out of `Homepage`.
- [x] Move footer ownership into the storefront layout.
- [x] Implement ShopVN brand information.
- [x] Implement customer-support links:
  - [x] `Trung tâm trợ giúp`
  - [x] `Chính sách đổi trả`
  - [x] `Hướng dẫn đặt hàng`
- [x] Implement about links:
  - [x] `Giới thiệu`
  - [x] `Tuyển dụng`
  - [x] `Liên hệ`
- [x] Implement payment method badges:
  - [x] `MoMo`
  - [x] `VNPay`
  - [x] `Stripe`
  - [x] `COD`
- [x] Implement copyright content.
- [x] Make footer groups responsive.
- [x] Preserve keyboard-accessible links.
- [x] Preserve visible focus behavior.
- [x] Do not introduce APIs.
- [x] Do not introduce newsletter submission.
- [x] Do not introduce authentication behavior.
- [x] Do not introduce dynamic payment behavior.

## 11. Apply content-width and responsive rules

- [x] Use one consistent constrained content container strategy.
- [x] Keep the hero full-bleed.
- [x] Keep the feature strip full-bleed.
- [x] Keep the homepage search affordance constrained.
- [x] Keep featured categories constrained.
- [x] Keep featured products constrained.
- [x] Keep the promo banner constrained.
- [x] Keep best sellers constrained.
- [x] Keep footer inner content constrained.
- [x] Avoid conflicting nested max-width containers.
- [x] Remove homepage `h-screen` behavior.
- [x] Remove internal scroll shells.
- [x] Remove nested vertical scroll behavior.
- [x] Use normal browser document scrolling.
- [x] Review behavior at required widths:
  - [x] 320px
  - [x] 375px
  - [x] 768px
  - [x] 1024px
  - [x] 1536px
- [x] Verify no page-level horizontal overflow.
- [x] Verify no overlapping header controls.
- [x] Verify usable mobile navigation.
- [x] Verify readable hero content.
- [x] Verify appropriate grid column changes.
- [x] Verify stable promo layout.
- [x] Verify stable footer layout.

## 12. Preserve dependency and asset boundaries

- [x] Do not change package dependencies unless an approved task proves it necessary.
- [x] Do not add Tailwind CSS 4.
- [x] Do not add Vite.
- [x] Do not add React Router.
- [x] Do not add shadcn/Radix.
- [x] Do not add Sonner.
- [x] Do not add Recharts.
- [x] Do not add MUI.
- [x] Do not copy the four deferred Figma PNG files.
- [x] Do not modify `apps/web/next.config.js` unless an unexpected approved requirement makes it necessary.
- [x] Keep `apps/web/tailwind.config.js` unchanged unless an existing content-path issue is proven.

## 13. Run focused static checks

- [x] Check only the new and modified storefront files for forbidden imports or behavior.
- [x] Search new and modified storefront files for:
  - [x] `react-router`
  - [x] `createBrowserRouter`
  - [x] `useNavigate`
  - [x] `AuthProvider`
  - [x] `CartProvider`
  - [x] `useAuth`
  - [x] `useCart`
  - [x] `sonner`
  - [x] `recharts`
  - [x] `@tailwindcss/vite`
  - [x] Vite-specific imports
- [x] Do not treat unrelated existing files outside the storefront foundation as failures for this change.

## 14. Run configured Nx verification

- [x] Run `npx nx lint @e-commerce-platform/web`.
- [x] Run `npx nx test @e-commerce-platform/web`.
- [x] Run `npx nx build @e-commerce-platform/web`.
- [x] Do not invent a separate typecheck target.
- [x] If a target fails, record whether the failure was introduced by this change.
- [x] Fix failures introduced by this change.
- [x] Do not modify unrelated code merely to silence pre-existing failures.

## 15. Perform final manual review

- [x] Confirm exactly one page resolves to `/`.
- [x] Confirm one header, one main, and one footer.
- [x] Confirm no auth implementation was added.
- [x] Confirm no cart implementation was added.
- [x] Confirm no checkout implementation was added.
- [x] Confirm no customer implementation was added.
- [x] Confirm no payment implementation was added.
- [x] Confirm no admin implementation was added.
- [x] Confirm no backend implementation was added.
- [x] Confirm no unused Figma assets were copied.
- [x] Confirm mobile menu keyboard behavior.
- [x] Confirm mobile menu accessibility behavior.
- [x] Confirm no unintended horizontal scrolling at all required widths.
- [x] Confirm the final changed-file list matches the approved file impact plan.
- [x] Report any deliberate deviation from `design.md` before marking implementation complete.
