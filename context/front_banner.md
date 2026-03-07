# Front Banner (Header) — Implementation Prompt

## Overview

The `Header.astro` component serves two modes depending on the page:

- **Full banner** (`/`, `/contact`): background photo, overflowing circular logo, and social/phone
  nav links on the right. Collapses into a sticky navbar on scroll.
- **Nav-only** (`/bocaux`, `/crottin`, `/coffrets`): no photo, no logo. The sticky navbar is
  immediately fixed at the top of the page from load, with no scroll interaction.

Both modes use the same single component, controlled by the `navOnly` prop.

---

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `navOnly` | `boolean` | `false` | When `true`: skip banner, show sticky nav from load |

---

## Source Files

- **Logo**: `misc/elements/logo_vp.png` (2000x2000 PNG, circular logo on white background)
- **Banner photo**: `misc/elements/banner1.jpeg` — resize to max 1920px wide, 80% JPEG quality:
  ```
  convert <input> -resize '1920x>' -quality 80 <output>
  ```
  Save as `frontend/src/assets/images/banner.jpg`. Use Astro's `getImage()` for the CSS URL.

---

## Image Processing

### Logo (`logo_vp.png`)
1. Remove the white background outside the circular logo using ImageMagick flood-fill from all
   four corners with ~10% fuzz tolerance:
   ```
   convert <input> -fuzz 10% -fill none \
     -draw "color 0,0 floodfill" \
     -draw "color 0,<height-1> floodfill" \
     -draw "color <width-1>,0 floodfill" \
     -draw "color <width-1>,<height-1> floodfill" \
     <output>
   ```
2. Save as PNG (transparency required) to `frontend/src/assets/images/logo_vp.png`
3. Astro's `<Image />` handles resizing and WebP conversion at build time

---

## Component: `Header.astro`

### Frontmatter

```js
const { navOnly = false } = Astro.props;

// Only fetched when the full banner is rendered
const bannerBg = navOnly ? null : await getImage({ src: bannerSrc, width: 1920 });
const annonce  = navOnly ? null : await fetchStrapiData('/api/annonce');
```

The Strapi announcement bar fetch is skipped entirely in `navOnly` mode — there is no point
fetching CMS content that will never be rendered.

### Shared SVG Definitions

Before the `<header>` element, a hidden `<svg>` defines the Instagram gradient once. Both
icon instances in the component (banner nav and sticky navbar) reference it by ID:

```html
<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">
  <defs>
    <linearGradient id="ig-gradient" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#F58529"/>
      <stop offset="50%" stop-color="#DD2A7B"/>
      <stop offset="100%" stop-color="#8134AF"/>
    </linearGradient>
  </defs>
</svg>
```

### Structure (full banner mode)

```
<svg aria-hidden="true" ...>          — hidden shared SVG defs (Instagram gradient)
<header.banner>                       — background-image = banner photo
  <div.banner-container>              — max-width 1200px, flex row, space-between
    <a.logo href="/">                 — links to home (conditionally rendered)
      <Image />                       — logo, 200x200, overflows below header
    <nav.banner-nav>                  — align-self: flex-start, padding-top: 0.4rem (conditionally rendered)
      <a> Instagram SVG icon          — plain white stroke, links to Instagram (new tab)
      <a> Facebook SVG icon           — plain white stroke, links to Facebook (new tab)
      <a.banner-cta> "02 43 07 89 05" — phone number, links to /contact
    <nav.sticky-navbar>               — hidden by default, shown in sticky state / navOnly
<div.banner-spacer>                   — height 0 by default, set by JS when nav is fixed
<div.announcement-bar>                — conditionally rendered if Strapi has content
```

In `navOnly` mode, only the `<nav.sticky-navbar>` is rendered inside `.banner-container`.
The `.logo` and `.banner-nav` are conditionally omitted via Astro's `{!navOnly && (...)}`.

### Logo Behavior (full banner only)
- Displayed at 200x200px on desktop, 160x160px on mobile (breakpoint: 768px)
- Bottom overflows below the header: `margin-bottom: -80px` (desktop) / `-64px` (mobile)
- Hover effect: `opacity: 0.8`

### Banner Background (full banner only)
- Applied as inline `background-image` style using `bannerBg.src` from `getImage()`
- CSS: `background-size: cover; background-position: center; background-repeat: no-repeat`

### Header Sizing (full banner)
- Padding: `1.1rem 2rem 0.55rem` (desktop), `1rem` (mobile)
- Height is determined by padding + visible logo portion (logo overflows 80px, so visible
  portion is 120px). The negative margin on the logo prevents it from stretching the header.

### Navigation Links (full banner only)

#### Banner Nav Positioning
- `.banner-nav`: `align-self: flex-start; padding-top: 0.4rem`

#### Social Icons (Instagram & Facebook)
- SVG icons at 36x36px, plain `stroke="white"` (not the gradient — white is sufficient
  against the dark banner photo)
- Both have `filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.6))` for legibility
- Both open in new tab: `target="_blank" rel="noopener noreferrer"`
- Hover: `transform: scale(1.1)` via `.banner-nav-link:hover`

#### Phone / Contact Link
- Displays the phone number: `02 43 07 89 05`
- Links to `/contact`
- Font size `1.5rem`, colour `var(--color-white)`, `text-shadow: 0 1px 4px rgba(0,0,0,0.6)`
- Hover: orange background, white text

### CSS Variables Referenced
- `--color-white`
- `--color-orange`
- `--color-text`
- `--color-nav-bg` — sticky/mobile/navOnly navbar background (`#BDBDC0`)
- `--color-separator` — navbar separator color (`#9CA3AF`)
- `--color-facebook` — Facebook sticky nav icon stroke (`#1877F2`)
- `--shadow-sm` — `0 2px 4px rgba(0, 0, 0, 0.1)`

---

## Mobile Behavior (max-width: 768px)

On mobile, the banner is a **purely visual element** — all navigation is handled by the sticky
navbar (see `context/front_sticky_nav.md`).

### Layout Changes
- **Banner nav hidden**: `display: none`. These links are available in the sticky navbar.
- **Logo centered**: `.banner-container` uses `justify-content: center`.
- **Padding clears the fixed nav**: `padding-top: calc(var(--mobile-nav-height, 3rem) + 0.5rem)`.
  The `3rem` fallback prevents layout flash before JS sets the variable. `0.5rem` adds
  breathing room between the fixed nav and the logo below.

### Logo (mobile)
- Sized at 160x160px
- `margin-bottom: -64px` — same proportional overflow as desktop

---

## Key Technical Decisions

- **`navOnly` prop controls banner visibility at build time** — the class `banner--nav-only` is
  set directly in the rendered HTML, so CSS hides/shows the right elements before first paint.
  No JS is involved in the initial visual state, so there is no flash of the banner on
  inner pages.
- **Banner and sticky nav share one `<header>` element** — switching states is handled by CSS
  classes (`.sticky`, `.banner--nav-only`), not by rendering two separate elements.
- **Conditional Strapi fetch in frontmatter** — `navOnly ? null : await fetchStrapiData(...)`
  avoids a network round-trip on every inner page build.
- **Logo kept as PNG** since it's a static asset that rarely changes (not CMS-managed).
- **Banner served as JPEG** (no transparency needed) for much smaller file size.
- **`getImage()` for the banner** (needed as a CSS `background-image` URL); `<Image />` for
  the logo (automatic optimization as an `<img>` tag).
- **Plain white stroke on banner nav social icons** — the gradient is reserved for the sticky
  navbar where it displays on a light grey background. Against the dark banner photo, plain
  white is simpler and equally legible.
- **On mobile, the banner has no interactive elements** — navigation is fully delegated to the
  sticky navbar, avoiding duplicate links.
