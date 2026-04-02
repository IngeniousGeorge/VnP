# Mobile Navigation (≤768px) — Implementation Prompt

## Overview

Mobile navigation uses a fixed app bar pattern with slide-in drawer menu, replacing the desktop
sticky navbar approach. The mobile nav bar is always visible at the top with banner photo
background, home logo, and action icons. Navigation items are accessible via a hamburger menu
that opens a right-slide drawer.

**Structure:**
- **Mobile nav bar** — fixed at viewport top, banner background
- **Slide-in drawer** — off-canvas menu (right-to-left), 85vw width

**Desktop (>768px) completely unchanged** — desktop scroll-triggered sticky navbar behavior
preserved exactly as before.

---

## Mobile Nav Bar

### Structure
```
<nav.mobile-nav-bar>                — fixed at top, banner background
  <a.mobile-nav-logo href="/">      — left-aligned
    <Image />                       — 141×141px, -56px overflow
  <div.mobile-nav-actions>          — right-aligned
    <a.mobile-action-icon> Phone icon → tel:+33243078905
    <button.mobile-action-icon.mobile-menu-toggle> Hamburger icon
```

### Styling
- `position: fixed; top: 0; left: 0; right: 0; z-index: 200`
- `background-size: cover; background-position: center` — banner photo fills entire bar
- Background image set inline: `style="background-image: url(${bannerBg.src})"`
- `padding: 0.75rem 1rem; min-height: 96px`
- `display: flex; justify-content: space-between; align-items: center`

### Logo
- 141×141px displayed size (generated at 282×282 for retina: `width={282} height={282}`)
- `margin-bottom: -56px` — overflows below nav bar
- Left-aligned in normal flex flow (no absolute positioning)
- Links to home (`href="/"`)

### Action Icons
- **Phone icon**: white stroke, 28×28px, links to `tel:+33243078905`
- **Hamburger icon**: white stroke, 28×28px, three horizontal lines
- Flex row with `gap: 1rem`
- `transition: opacity 0.2s`, hover `opacity: 0.8`

---

## Slide-In Drawer

### Structure
```
<nav.mobile-drawer>                 — off-canvas right
  <button.drawer-close> × icon      — top-right, 44px touch target
  <ul.drawer-menu>
    <li><a href="/"> Verre et Papilles
    <li><a href="/bocaux"> Les Bocaux du Jour
    <li><a href="/crottin"> Le Crottin Craonnais
    <li><a href="/coffrets"> Les Coffrets Gourmands
    <li><a href="/contact"> Contact & Infos
    <li><a href="tel:+33243078905"> 02 43 07 89 05
    <li.drawer-social>              — flex row
      <a> Instagram icon (gradient)
      <a> Facebook icon (blue)
```

### Styling
- `position: fixed; top: 0; right: 0; bottom: 0; width: 85vw; z-index: 300`
- `background-color: var(--color-nav-bg)` (`#BDBDC0` — matches desktop sticky navbar)
- `transform: translateX(100%)` default (hidden), `translateX(0)` when `.open` class added
- `transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)` — Material Design easing
- `overflow-y: auto` — scrollable if content exceeds viewport height

### Menu Items
- `font-family: 'Bellefair', serif; font-size: 1.5rem`
- `color: var(--color-text)` (`#1F2937`), hover `var(--color-orange)`
- `padding: 0.5rem 0` (vertical), `margin-bottom: 0.25rem` per list item
- Horizontal separators between items:
  - 80% width, 1px height, centered (`margin: 0.25rem auto 0`)
  - `background-color: var(--color-separator)` (`#9CA3AF`)
  - Applied via `li:not(:last-child):not(.drawer-social)::after`

### Social Icons
- `.drawer-social`: `display: flex; justify-content: center; gap: 1.5rem`
- Instagram: 28×28px, `stroke="url(#ig-gradient)"` (gradient from shared SVG defs)
- Facebook: 28×28px, `stroke="var(--color-facebook)"` (`#1877F2`)
- Hover: `transform: scale(1.1)`

### Close Button
- Top-right corner: `position: absolute; top: 1rem; right: 1rem`
- Large X icon (32×32px), `color: var(--color-text)`
- `min-width/height: 44px` (accessible touch target)
- `padding: 0.5rem`, hover `opacity: 0.7`

---

## JavaScript Interaction

### Drawer Toggle (mobile branch only)
```js
if (isMobile) {
  const drawer = document.querySelector('.mobile-drawer') as HTMLElement;
  const menuToggle = document.querySelector('.mobile-menu-toggle') as HTMLElement;
  const drawerClose = document.querySelector('.drawer-close') as HTMLElement;

  menuToggle.addEventListener('click', () => {
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';  // Lock scroll
  });

  drawerClose.addEventListener('click', () => {
    drawer.classList.remove('open');
    document.body.style.overflow = '';        // Unlock scroll
  });
}
```

### Spacer Calculation
```js
if (isMobile) {
  spacer.style.height = '72px';  // 56px overflow + 16px breathing room
}
```

No scroll listener on mobile — nav bar is fixed from page load, no state transitions.

---

## Banner Element on Mobile

The desktop banner is minimal on mobile:
- `padding-top: 85px` — pushes content below the fixed mobile nav bar (logo visible height: 141px - 56px = 85px)
- `padding: 0` otherwise, `background-image: none`, `box-shadow: none`
- `.banner-container`: `max-width: none; padding: 0; margin: 0`
- Desktop logo and banner-nav: `display: none`

---

## CSS Variables Referenced

- `--color-nav-bg` — drawer background (`#BDBDC0`)
- `--color-text` — menu link color (`#1F2937`)
- `--color-orange` — menu link hover (`#F29D37`)
- `--color-separator` — menu item separators (`#9CA3AF`)
- `--color-facebook` — Facebook icon stroke (`#1877F2`)

---

## Key Technical Decisions

- **Fixed app bar pattern** replaces flex-wrap text navbar for cleaner mobile UX
- **Banner photo background** provides visual continuity across all pages (bocaux/crottin/coffrets
  included) — banner photo now fetches unconditionally in Header.astro
- **Logo in nav bar** (not in banner element) for consistent top-of-viewport branding
- **85vw drawer width** is industry standard for mobile slide-in menus
- **Right-to-left slide** matches user's thumb position for hamburger icon
- **No backdrop dimming** — drawer slides over content with no scrim, cleaner aesthetic
- **Body scroll lock** when drawer open prevents scroll-through UX issues
- **Material Design easing** (`cubic-bezier(0.4, 0.0, 0.2, 1)`) for polished slide transition
- **Grey drawer background** matches desktop sticky navbar aesthetic for brand consistency
- **Expanded menu text** ("Les Bocaux du Jour" vs "Les bocaux") improves clarity and
  accessibility
- **Compact vertical spacing** (0.5rem padding, 0.25rem margins) fits more items on small screens
- **Separator lines** (80% width, centered) provide visual grouping without adding height
- **isMobile check at page load** (`matchMedia('(max-width: 768px)').matches`) determines
  which JS branch to execute — device rotation is an accepted edge case requiring page refresh
