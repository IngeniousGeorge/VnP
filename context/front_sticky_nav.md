# Sticky Navbar — Implementation Prompt

## Overview

The sticky navbar operates in three distinct modes depending on the page and screen size. All
three modes share the same `<nav class="sticky-navbar">` markup inside `Header.astro`.

| Mode | Pages | Trigger |
|---|---|---|
| **Desktop normal** | `/`, `/contact` | Hidden until user scrolls past the banner |
| **Mobile** | all pages | Always fixed at top, from page load |
| **navOnly** | `/bocaux`, `/crottin`, `/coffrets` | Always fixed at top, from page load (all screen sizes) |

This behavior is built **into the existing `Header.astro` component** — it is not a separate
component. The banner and the sticky navbar share the same `<header>` element; CSS class
toggling (`header.banner--nav-only`, `header.banner.sticky`) switches between states.

---

## Structure

```
<header.banner>  (or .banner.banner--nav-only)
  <div.banner-container>
    <a.logo>                      — full banner only (conditionally rendered)
    <nav.banner-nav>              — full banner only (conditionally rendered)
    <nav.sticky-navbar>           — always in DOM; shown/hidden via CSS
      <a.navbar-logo-link href="/">
        <Image.navbar-logo />     — small logo (96px), overflows -36px below nav
      <a.navbar-link>             "Les bocaux"  → /bocaux
      <span.navbar-separator>     "|"
      <a.navbar-link>             "Le crottin"  → /crottin
      <span.navbar-separator>     "|"
      <a.navbar-link>             "Les coffrets" → /coffrets
      <span.navbar-separator>     "|"
      <a.navbar-link.navbar-link--contact>  "Contact & infos" → /contact
      <span.navbar-separator.navbar-sep--phone>  "|"  (mobile only)
      <a.navbar-link.navbar-link--phone>  "02 43 07 89 05" → tel:+33243078905 (mobile only)
      <span.navbar-separator.navbar-sep--social>  "|"
      <div.navbar-social>
        <a> Instagram SVG (24x24) — stroke="url(#ig-gradient)"
        <a> Facebook SVG (24x24)  — stroke="var(--color-facebook)"
<div.banner-spacer>               — height 0 by default; set by JS when nav is fixed
```

The Instagram gradient (`ig-gradient`) is defined **once** in a hidden `<svg>` placed before
the `<header>` element (see `context/front_banner.md`).

---

## Sticky Navbar Base Styling (default: hidden)

- `display: none`
- `align-items: center; justify-content: space-between`
- `width: 100%; max-width: 1100px; margin: 0 auto`

### Navigation Links (`.navbar-link`)
- Font: `'Bellefair', serif`, `1.05rem` (desktop base), `1.36rem` (mobile)
- In sticky/navOnly state: `1.575rem`
- Color: `var(--color-text)`, hover: `var(--color-orange)`, transition `0.2s`
- `.navbar-link--phone` and `.navbar-sep--phone`: `display: none` by default (hidden on desktop); `display: inline` on mobile
- `.navbar-sep--social`: visible on all breakpoints (sits between "Contact & infos" and the social icons on desktop too)

### Separators (`.navbar-separator`)
- Color: `var(--color-separator)` (`#9CA3AF`)
- Font size: `1.1rem` (base), `1.32rem` in sticky/navOnly state, `1.36rem` on mobile
- `user-select: none`

### Logo (`.navbar-logo`)
- `width: 96px; height: 96px; object-fit: contain`
- `margin-bottom: -36px` — overflows below the nav bar, similar to the banner logo
- Generated at `width={192} height={192}` (2× CSS size) for retina sharpness
- On mobile: `56px × 56px`, `margin-bottom: 0`

### Social Icons (`.navbar-social`)
- Flex row, `gap: 0.75rem`
- SVGs at 24x24px (desktop), 20x20px (mobile)
- Instagram: `stroke="url(#ig-gradient)"` — full gradient on the light grey background
- Facebook: `stroke="var(--color-facebook)"` (`#1877F2`)
- Hover: `transform: scale(1.1)`, transition `0.2s ease`

---

## Mode 1: Desktop Normal — Scroll-Triggered Sticky State

### CSS (`.banner.sticky`)

When the `.sticky` class is added to the `<header>`:

- `position: fixed; top: 0; left: 0; right: 0`
- `padding: 0.96rem 2rem`
- `background-image: none !important` — removes the banner photo
- `background-color: var(--color-nav-bg)` (`#BDBDC0`) — solid grey
- `overflow: visible` — navbar logo overflows below the bar
- `box-shadow: var(--shadow-sm)`
- `animation: slideDown 0.3s ease-out`

Elements hidden in sticky state:
- `.banner.sticky .logo { display: none }`
- `.banner.sticky .banner-nav { display: none }`

```css
@keyframes slideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}
```

### JavaScript (desktop normal branch)

```js
const FADE_THRESHOLD = 0.7; // logo starts fading at 70% of banner height scrolled
const bannerHeight = banner.offsetHeight;
const fadeStart = bannerHeight * FADE_THRESHOLD;
let isSticky = false;
```

On each scroll event (`passive: true` listener):

1. **Logo fade-out**: while not yet sticky, the logo fades from opacity 1 to 0 linearly
   between `fadeStart` and `bannerHeight`:
   `Math.max(0, 1 - (scrollY - fadeStart) / (bannerHeight - fadeStart))`

2. **Sticky toggle**: when `scrollY > bannerHeight`, toggle `.sticky` on the header.
   - Entering sticky: add `.sticky`, set `spacer.style.height = bannerHeight + 'px'`
   - Leaving sticky: remove `.sticky`, reset spacer to `0`, restore logo opacity to `1`

3. The `isSticky` flag prevents redundant DOM writes on every scroll tick.

---

## Mode 2: Mobile (≤768px)

On mobile, the sticky navbar is **completely hidden** (`display: none !important`).

Mobile navigation uses a dedicated fixed app bar with slide-in drawer menu — see
`context/front_mobile_nav.md` for full implementation details.

The sticky navbar HTML remains in the DOM but is never displayed on mobile viewports.

---

## Mode 3: navOnly — Always Visible, All Screen Sizes

Used on inner pages (`/bocaux`, `/crottin`, `/coffrets`) where no banner photo or logo should
appear. The `navOnly` prop is passed to `<Header />` in those page files.

### How it works

The `banner--nav-only` class is set at **build time** directly in the HTML — no JS is needed
to show the correct initial state, so there is no flash of banner content on page load.

### CSS (`@media (min-width: 769px)`)

On desktop, the header element itself becomes the full-width fixed bar:

```css
.banner--nav-only {
  position: fixed;
  top: 0; left: 0; right: 0;
  padding: 0.96rem 2rem;
  background-image: none !important;
  background-color: var(--color-nav-bg);
  box-shadow: var(--shadow-sm);
  z-index: 200;
}
.banner--nav-only .sticky-navbar    { display: flex; }
.banner--nav-only .navbar-link      { font-size: 1.575rem; }
.banner--nav-only .navbar-logo-link { margin-left: -0.75rem; }
.banner--nav-only .navbar-separator { font-size: 1.32rem; }
```

On mobile, the existing `@media (max-width: 768px)` `.sticky-navbar` rules handle the
always-visible fixed nav. Additionally, `.banner--nav-only` gets `padding: 0; box-shadow: none`
on mobile to prevent an empty gap above the page content.

### JavaScript (navOnly branch)

`isNavOnly` is detected via `banner.classList.contains('banner--nav-only')`. The same
`if (isMobile || isNavOnly)` branch runs — `applyNavHeight()` sets the spacer to `navHeight`
(since the banner has no visible height of its own on these pages). No scroll listener is
attached.

### Inner page first sections

Pages using `navOnly` do **not** pass `withOffset` to their first `<PhotoTextSection>`. The
spacer handles the fixed nav clearance; the section's base `padding: 4rem 2rem` provides
adequate breathing room beneath it.

---

## Comparison Table

| | Desktop normal | Mobile (≤768px) | navOnly (desktop) |
|---|---|---|---|
| Sticky navbar | Hidden → shows on scroll | Hidden (see `front_mobile_nav.md`) | Fixed at top |
| Initial nav state | Hidden | N/A (mobile nav bar used) | Fixed at top |
| Trigger | Scroll past banner | N/A | Always from page load |
| Set by | JS class toggle (`.sticky`) | CSS `@media` hides navbar | CSS class `.banner--nav-only` (build time) |
| Background | `.banner.sticky` (the header) | N/A | `.banner--nav-only` (the header) |
| Slide-down animation | Yes | No | No |
| Spacer height set by JS | Yes (on scroll entry) | Yes (72px on load) | Yes (on load) |
| Banner photo/logo | Visible until sticky | Hidden (logo in mobile nav bar) | Not rendered |
| Scroll listener | Yes | No | No |

---

## CSS Variables Referenced

- `--color-text` — navbar link color
- `--color-orange` — navbar link hover color
- `--color-nav-bg` — navbar background (`#BDBDC0`)
- `--color-separator` — separator color (`#9CA3AF`)
- `--color-facebook` — Facebook icon stroke (`#1877F2`)
- `--shadow-sm` — `0 2px 4px rgba(0, 0, 0, 0.1)`

---

## Key Technical Decisions

- **Single `<header>` element** for all three states — simpler DOM, CSS class toggling handles
  the visual differences.
- **`navOnly` class set at build time** — because it's a static Astro prop, it's present in the
  HTML before the browser paints. There is no JS involved in showing the correct initial state,
  so inner pages never flash the banner.
- **Background on the `<header>` element, not on `.sticky-navbar`** — `.sticky-navbar` has
  `max-width: 1100px` which would clip the background to that width. Applying the background
  to the full-width `<header>` (`.banner.sticky` and `.banner--nav-only`) gives the correct
  edge-to-edge grey bar.
- **`position: fixed`** (not `position: sticky`) — the navbar is nested inside the `<header>`.
  `position: sticky` would only pin it while the parent is in view. `position: fixed` pins it
  to the viewport for the entire page.
- **Spacer div** prevents layout jumps when the header leaves normal flow. Set to `bannerHeight`
  on desktop sticky entry; set to `navHeight` for navOnly (desktop); set to `72px` on mobile
  (56px logo overflow + 16px breathing room) — see `context/front_mobile_nav.md`.
- **`passive: true`** on the scroll listener for better scroll performance.
- **`FADE_THRESHOLD = 0.7`** extracted as a named constant for self-documentation.
- **`matchMedia` gate at page load** — the mode branch is chosen once. Device rotation is an
  accepted edge case (page refresh resolves it).
- **Logo fade-out** on desktop provides a smooth visual transition rather than an abrupt switch.
  The `logoEl` reference is typed as nullable (`HTMLElement | null`) since the element is not
  rendered in `navOnly` mode.
