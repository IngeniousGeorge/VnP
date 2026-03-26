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

### 2.1 `LeMenu.astro` and `CatalogueCoffrets.astro` are near-identical components — Deferred (site complete)

~~### 2.2 `LaBoutique.astro` could migrate to `PhotoTextSection reversed`~~ ✓ Done

### 2.3 `.section-header` + `.accent` pattern repeated across components — Deferred (site complete)

~~### 2.4 `navOnly` CSS in `Header.astro` duplicates `.banner.sticky` CSS~~ — Skipped (risk/reward not justified)

---

## 3. Naming Conventions

### 3.1 `--mobile-nav-height` is a misleading CSS custom property name — Deferred (site complete)

### 3.2 Context file name doesn't match component name — Deferred (site complete)

### 3.3 `LaBoutique.astro` background diverges from context spec — Deferred (site complete)

---

## 4. Code Quality

### 4.1 Lightbox images in `CatalogueCoffrets` appear pixelated — Operational (depends on upload quality)

### 4.2 `strapi.ts` `blocksToHtml` silently drops unsupported block types — Deferred (site complete)

### 4.3 `updateCarousel()` in `NosActualites.astro` sets a no-op initial transform — Deferred (site complete)

### 4.4 `index.astro` section order may be unintentional — Deferred (site complete)
