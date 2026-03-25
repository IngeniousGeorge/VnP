# Refactoring Notes

A living document. Sections are grouped by type. Items are removed once resolved.

---

## 0. Discrepancies Found During Context Doc Audit

While updating `front_banner.md` and `front_sticky_nav.md` to reflect the `navOnly` changes,
several gaps were found between the context docs and the actual code. Most were silent design
decisions that were never written down. They are listed here not as refactoring tasks, but as
things worth knowing about — some may point to unresolved questions about intent.

**0.1 Navbar font is Bellefair, not Crimson**
The context docs specified `var(--font-heading)` (Crimson) for navbar links. The code uses
`'Bellefair', serif` directly. This was a deliberate design choice at some point but was never
documented. Worth confirming this is intentional and updating the font comment in
`Layout.astro` if Bellefair is now a permanent UI font alongside Glacial Indifference and Crimson.

**0.2 The dark overlay on the banner (`::before`) was never implemented**
The original spec described a `::before` pseudo-element with `background-color: rgba(0,0,0,0.33)`
over the banner photo, plus `isolation: isolate` on the header. Neither exists in the current
code. The banner photo provides enough contrast on its own. Confirmed intentional omission — the
spec simply wasn't cleaned up.

**0.3 Sticky state padding differs from spec**
The context doc said `padding: 0.5rem 2rem` for the sticky navbar. The code uses
`padding: 0.96rem 2rem`. The taller padding accommodates the overflowing navbar logo. The spec
predated the logo being added to the sticky nav.

**0.4 Sticky state `overflow` differs from spec**
The context doc said `overflow: hidden`. The code uses `overflow: visible` to allow the navbar
logo to overflow below the bar. Same root cause as 0.3 above.

**0.5 Navbar links are page routes, not anchor links**
The original spec listed in-page anchor targets (`#bocaux`, `#crottin`, `#coffrets`). The
implementation uses full page routes (`/bocaux`, `/crottin`, `/coffrets`). This reflects the
decision to give each product category its own page rather than section on the home page.

**0.6 "Accueil" text link replaced by logo image**
The spec listed a plain `"Accueil"` text link as the first item in the sticky navbar. The code
renders a small logo image (`navbar-logo`, 96px, overflowing) instead.

**0.7 Banner nav shows phone number, not "Nous contacter"**
The spec described a "Nous contacter" text CTA. The code shows the actual phone number
`02 43 07 89 05`. A commit message confirms this was a deliberate late-stage change.

**0.8 Instagram icon in banner nav uses plain white, not the gradient**
The spec said the banner nav Instagram icon uses `stroke="url(#ig-gradient)"`. The code uses
plain `stroke="white"`. The gradient is reserved for the sticky navbar, where it displays
against a light grey background. Against the dark banner photo, white is simpler and equally
legible.

---

## 1. Dead Code

~~### 1.1 Orphaned CSS variables in `Layout.astro`~~ ✓ Done

~~### 1.2 Dead mobile breakpoint rules in `HeroCircles.astro`~~ ✓ Done

~~### 1.3 Dead `strong` rule in `LaBoutique.astro` and `PhotoTextSection.astro`~~ ✓ Done

~~### 1.4 Dead `withOffset` prop and CSS in `PhotoTextSection.astro`~~ ✓ Done

---

## 2. Duplication / Modularisation

### 2.1 `LeMenu.astro` and `CatalogueCoffrets.astro` are near-identical components

The two components are structural duplicates. The divergence has grown since initial discovery:

- **HTML**: identical structure (`section-header`, `cards-container`, `card-wrapper`,
  `card-inner`, `card-front`, `card-back`, `card-label`, `card-photo`)
- **CSS**: mostly identical — only the root selector name differs (`.le-menu` vs
  `.catalogue-coffrets`). However `LeMenu` now uses a split `section-header` / `section-footer`
  selector pattern while `CatalogueCoffrets` uses the older `margin: 0 auto 3rem` shorthand.
- **JavaScript**: `LeMenu` has a flip interaction (IntersectionObserver + mouseenter);
  `CatalogueCoffrets` has no JavaScript — cards are static image-only displays.
- **Strapi fields**: both now have `Informations_complementaires` (footer rich text) and
  `Infos` (per-card label below card).
- **Card structure**: `LeMenu` has `card-front` / `card-back` faces; `CatalogueCoffrets`
  renders the photo directly inside `card-inner` with no flip markup.

The components that started as identical have drifted into a growing maintenance burden.

**Proposed fix**: extract a single `FlipCardSection.astro` component with props for the
Strapi endpoint, field names, and optional `footerHtml`. The `section-footer` rendering,
card flip JS (using the `LeMenu` behavior as the canonical version), and all shared CSS
move to the shared component. Both pages use it instead.

### 2.2 `LaBoutique.astro` could migrate to `PhotoTextSection reversed`

`PhotoTextSection.astro` now accepts a `reversed` prop (added when `LeCrottin1` was built).
`LaBoutique.astro` implements the same two-column photo-right layout manually. The two differ
in a few design details:

- `LaBoutique` uses `align-items: start`; `PhotoTextSection` uses `align-items: center`
- `LaBoutique` h2 is `font-weight: 700`; `PhotoTextSection` h2 is `font-weight: 400`
- `LaBoutique` h2 `margin-bottom` is `0.5rem`; `PhotoTextSection` is `1.5rem`

**Proposed fix**: align the design choices (confirm whether `start` vs `center` is intentional),
then replace `LaBoutique.astro` with a thin Strapi-fetching wrapper using
`<PhotoTextSection reversed />`, same as `LeCrottin1`. This eliminates the last bespoke
photo+text layout in the codebase.

### 2.3 `.section-header` + `.accent` pattern repeated across components

`LesRevendeurs.astro` and `Contact.astro` both implement an identical centered-heading layout
(orange horizontal rule + `<h2>`) with near-identical CSS. The two instances differ only in
`max-width` (1100px vs 900px) and text colour (white vs `--color-text`).

**Proposed fix**: extract a `SectionHeader.astro` component accepting `titre`, `introHtml`,
and a variant prop. This also eliminates the scoped `h2` overrides inside both components.

### 2.4 `navOnly` CSS in `Header.astro` duplicates `.banner.sticky` CSS

The `@media (min-width: 769px) .banner--nav-only` block repeats the same font-size overrides
and spacing rules as `.banner.sticky`. The two states are functionally the same visual
appearance, just triggered differently (build-time class vs scroll-driven JS class).

**Proposed fix**: create a shared CSS selector grouping:
```css
.banner.sticky,
.banner--nav-only { ... }
```
for all rules that apply identically to both states. State-specific rules (animation, the
`!important` background override) remain separate.

---

## 3. Naming Conventions

### 3.1 `--mobile-nav-height` is a misleading CSS custom property name

The variable is set and consumed in two unrelated code paths:
- **Mobile**: always-visible sticky nav (original intent, hence the name)
- **navOnly (desktop)**: inner pages with no banner

The name implies mobile-only, which is no longer accurate. The banner's mobile padding-top
(`calc(var(--mobile-nav-height, 3rem) + 0.5rem)`) is the sole consumer of this variable.
Renaming to `--nav-height` (or `--sticky-nav-height`) and updating the one CSS reference that
uses it would make the purpose clearer.

### 3.2 Context file name doesn't match component name

`context/front_hero_navigation_cards.md` documents the `HeroCircles.astro` component. The
names are inconsistent — the context doc describes them as "navigation cards" while the
component treats them as circles. Low priority, but worth aligning (either rename the file to
`front_hero_circles.md` or the component to `HeroNavigationCards.astro`).

### 3.3 `LaBoutique.astro` background diverges from context spec

The component uses `background-color: var(--color-white)` but `context/front_main_content.md`
specifies `var(--color-gray-bg)` for La Boutique. Either the spec should be updated to reflect
the deliberate design change, or the component should be corrected. Needs clarification.

---

## 4. Code Quality

### 4.1 Lightbox images in `CatalogueCoffrets` appear pixelated

The lightbox loads the original Strapi URL directly (`data-full-src`), bypassing Astro's image
optimisation pipeline. If the source images uploaded to Strapi are low-resolution, they will
pixelate at 90vw × 90vh. The fix depends on the upload quality: either ensure the shop owner
uploads high-resolution photos, or generate a larger Astro-optimised variant at build time and
store its URL in a second `data-` attribute for the lightbox to use.

### 4.2 `strapi.ts` `blocksToHtml` silently drops unsupported block types

The function handles `paragraph` and `heading` but returns `''` for `list`, `quote`,
`code`, and any other Strapi block types. This is currently acceptable since only those two
types are used in the CMS, but it should be documented with a comment so future editors know
why content disappears if they use other block types.

### 4.3 `updateCarousel()` in `NosActualites.astro` sets a no-op initial transform

`updateCarousel()` is called on init when `current = 0`, which sets
`track.style.transform = 'translateX(-0%)'`. This is functionally identical to no transform
and adds a redundant inline style to the DOM. A simple guard (`if (current !== 0)`) or
initialising only the button disabled states on load would be cleaner.

### 4.4 `index.astro` section order may be unintentional

The home page renders `LaBoutique` before `NotreHistoire`. The more natural narrative order
for a shop is: introduce the owners/story first (Notre Histoire), then present the shop
(La Boutique). This may be a deliberate design decision or a leftover from early iteration.
Worth confirming.
