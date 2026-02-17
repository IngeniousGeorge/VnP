# Sticky Navbar — Implementation Prompt

## Overview

When the user scrolls past the full-height banner, the header collapses into a compact sticky navigation bar. The banner's background photo, logo, and original nav links are replaced by a single row of text links (site sections + social icons) on a solid grey background. The transition includes a logo fade-out while scrolling and a slide-down animation when the sticky bar appears.

This behavior is built **into the existing `Header.astro` component** — it is not a separate component. The banner and the sticky navbar share the same `<header>` element; CSS class toggling switches between the two states.

## Structure

The sticky navbar is a second `<nav>` inside the banner container, hidden by default and shown only when the `.sticky` class is applied:

```
<header.banner>
  <div.banner-container>
    <a.logo>                    — visible in expanded state
    <nav.banner-nav>            — visible in expanded state
    <nav.sticky-navbar>         — visible in sticky state
      <a.navbar-link>           "Accueil"         → /
      <span.navbar-separator>   "|"
      <a.navbar-link>           "Les bocaux"      → #bocaux
      <span.navbar-separator>   "|"
      <a.navbar-link>           "Le crottin"      → #crottin
      <span.navbar-separator>   "|"
      <a.navbar-link>           "Les coffrets"    → #coffrets
      <span.navbar-separator>   "|"
      <a.navbar-link>           "Contact"         → /contact
      <span.navbar-separator>   "|"
      <div.navbar-social>
        <a> Instagram SVG (24x24)
        <a> Facebook SVG (24x24)
</header>
<div.banner-spacer>             — placeholder to prevent content jump
```

The social SVGs in the sticky navbar use unique gradient IDs (`ig-gradient-navbar`) to avoid conflicts with the banner's SVGs.

## Sticky Navbar Styling

### Default (hidden)
- `display: none`
- `align-items: center; justify-content: space-evenly`
- `width: 100%; max-width: 1100px; margin: 0 auto`

### Visible (when `.banner.sticky` is active)
- `display: flex`

### Navigation Links (`.navbar-link`)
- Font: `var(--font-heading)` (Crimson), bold italic, `1.05rem`
- Color: `var(--color-text)`, hover: `var(--color-orange)`
- Transition: `color 0.2s`

### Separators (`.navbar-separator`)
- Color: `#9CA3AF`
- Font size: `1.1rem`
- `user-select: none`

### Social Icons (`.navbar-social`)
- Flex row, `gap: 0.75rem`
- SVGs at 24x24 (desktop), 20x20 (mobile)
- Same branded colors as the banner (Instagram gradient, Facebook blue `#1877F2`)
- Hover: `transform: scale(1.1)`, transition `0.2s ease`

## Sticky State CSS (`.banner.sticky`)

When the `.sticky` class is toggled on the `<header>`:

- `position: fixed; top: 0; left: 0; right: 0`
- `padding: 0.5rem 2rem` (desktop), `0.4rem 1rem` (mobile)
- `background-image: none !important` — removes the banner photo
- `background-color: #BDBDC0` — solid grey
- `overflow: hidden` — hides any overflow (logo is hidden anyway)
- `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08)` — subtle shadow
- `animation: slideDown 0.3s ease-out` — slides down from top

### Elements hidden in sticky state
- `.banner.sticky .logo { display: none }`
- `.banner.sticky .banner-nav { display: none }`
- `.banner.sticky::before { display: none }` — removes the dark overlay

### Slide-down animation
```css
@keyframes slideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}
```

## Spacer Element

A `<div class="banner-spacer">` sits immediately after the `<header>`. When the header becomes `position: fixed`, this spacer is set to the banner's original height to prevent a layout jump:

- Default: `height: 0`
- When sticky: `height: {bannerHeight}px` (set via JS)

## JavaScript Behavior

### Scroll Handler

```js
const banner = document.querySelector('.banner');
const spacer = document.querySelector('.banner-spacer');
const logoEl = banner.querySelector('.logo');
const bannerHeight = banner.offsetHeight;
const fadeStart = bannerHeight * 0.7;
let isSticky = false;
```

On each scroll event (`passive: true` listener):

1. **Logo fade-out**: While not yet sticky, the logo fades from full opacity to 0 as the user scrolls through the last 30% of the banner height:
   - `scrollY <= fadeStart` → opacity 1
   - `scrollY > fadeStart` → opacity decreases linearly to 0 at `scrollY = bannerHeight`
   - Formula: `Math.max(0, 1 - (scrollY - fadeStart) / (bannerHeight - fadeStart))`

2. **Sticky toggle**: When `scrollY > bannerHeight`, toggle the `.sticky` class on the header:
   - **Entering sticky**: add `.sticky`, set spacer height to `bannerHeight`
   - **Leaving sticky**: remove `.sticky`, reset spacer height to 0, restore logo opacity to 1

3. The `isSticky` flag prevents redundant DOM updates on every scroll tick — the class toggle and spacer update only happen on state change.

## Mobile Behavior (max-width: 768px)

On mobile, the sticky navbar is **always visible from page load** — there is no scroll-triggered transition. The desktop scroll handler (logo fade-out, class toggle, spacer) is completely bypassed.

### How it works

The navbar is `position: fixed; top: 0` from the start, with its own opaque background. It acts as the primary (and only) navigation on mobile, since the banner nav and hero navigation cards are both hidden.

### Styling
- `position: fixed; top: 0; left: 0; right: 0; z-index: 200`
- `background-color: #BDBDC0` — same grey as the desktop sticky state
- `padding: 0.5rem 1rem`
- `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08)`
- `display: flex; flex-wrap: wrap; justify-content: center; align-items: center`
- `gap: 0.5rem 0.8rem` (row and column gap for wrapped lines)
- Link font size: `0.85rem`
- Social SVGs: 20x20

### JavaScript (mobile branch)

The script detects mobile via `window.matchMedia('(max-width: 768px)')` at page load. On mobile:

1. Measures the navbar's rendered height (`nav.offsetHeight`)
2. Sets a CSS custom property on `<html>`: `--mobile-nav-height: {height}px`
3. Does **not** attach a scroll listener — no fade-out, no class toggle, no spacer logic

The banner's `padding-top` uses this variable: `calc(var(--mobile-nav-height, 3rem) + 0.5rem)`. The `3rem` fallback prevents layout flash before JS runs. The `0.5rem` adds breathing room between the nav and the logo below.

### Interaction with other components

- **Banner** (`Header.astro`): The banner nav (social icons, CTA) is hidden on mobile. The logo is centered. The banner becomes a purely visual element (photo + logo) below the fixed nav.
- **Hero cards** (`HeroCircles.astro`): Hidden on mobile (`display: none` at 768px breakpoint). Their navigation links (bocaux, crottin, coffrets) are redundant with the sticky navbar.
- **Page flow**: As the user scrolls, the banner and subsequent content scroll naturally under the fixed navbar. No spacer or class toggling is needed.

### Key difference from desktop

| | Desktop | Mobile |
|---|---|---|
| Initial state | Hidden (`display: none`) | Visible, `position: fixed` at top |
| Trigger | Scroll past banner height | Always visible from page load |
| Background | Inherits from `.banner.sticky` | Own `background-color: #BDBDC0` |
| JS behavior | Scroll handler, class toggle, spacer | Measures nav height, sets CSS variable |
| Banner nav | Visible until sticky | Hidden (`display: none`) |
| Hero cards | Visible | Hidden (`display: none`) |

## CSS Variables Referenced

- `--color-text` — navbar link color
- `--color-orange` — navbar link hover color
- `--font-heading` — navbar link font (Crimson)

## Key Technical Decisions

- **Single `<header>` element** for both states (not two separate elements) — simpler DOM, single sticky container
- **CSS class toggle** (`.sticky`) rather than JS style manipulation — all visual changes defined in CSS, JS only handles the toggle logic
- **`position: fixed`** (not `position: sticky`) because the header needs to completely change its appearance (different content, background, size) rather than just pin in place
- **Spacer div** prevents the content jump that would occur when the header leaves normal flow to become fixed
- **Logo fade-out** provides a smooth visual transition before the sticky bar appears, rather than an abrupt switch
- **`passive: true`** on the scroll listener for better scroll performance
- **Separate gradient IDs** for sticky navbar SVGs (`ig-gradient-navbar`) to avoid SVG rendering conflicts when both the banner and sticky navbar SVGs exist in the DOM simultaneously
- **Mobile uses `position: fixed`** (not `position: sticky`) because the navbar is nested inside the `<header>` — `position: sticky` would only keep it pinned while the banner is in view, then it would scroll away with its parent. `position: fixed` keeps it pinned for the entire page.
- **CSS custom property for nav height** (`--mobile-nav-height`) — JS measures the dynamic height (which varies with text wrapping) and exposes it as a variable. CSS uses it for the banner's `padding-top`. This keeps layout logic in CSS and avoids a magic pixel value in JS.
- **`matchMedia` gate at page load** — the mobile/desktop branch is chosen once. Device rotation during a session is an accepted edge case (page refresh resolves it).
