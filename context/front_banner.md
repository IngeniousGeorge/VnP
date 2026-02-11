# Front Banner (Header) — Implementation Prompt

## Overview

Create a sticky header/banner for an Astro website. The banner features a background photo of the shop, an overflowing circular logo on the left, and navigation links (Instagram, Facebook, contact page) on the right.

## Source Files

- **Logo**: `misc/elements/logo_vp.png` (2000x2000 PNG, circular logo on white background)
- **Banner photo**: `misc/banner/banner-2.png` (4378x759 PNG, photo of the shop shelves)

## Image Processing

### Logo (`logo_vp.png`)
1. Remove the white background outside the circular logo, replacing it with transparency. Use ImageMagick flood-fill from all four corners with ~10% fuzz tolerance:
   ```
   convert <input> -fuzz 10% -fill none \
     -draw "color 0,0 floodfill" \
     -draw "color 0,<height-1> floodfill" \
     -draw "color <width-1>,0 floodfill" \
     -draw "color <width-1>,<height-1> floodfill" \
     <output>
   ```
2. Save as PNG (transparency required) to `frontend/src/assets/images/logo_vp.png`
3. Astro's `<Image />` component handles further optimization (resizing, WebP conversion) at build time

### Banner photo (`banner-2.png`)
1. Resize to 1920px wide (height scales proportionally, ~333px) and convert to JPEG at 80% quality:
   ```
   convert <input> -resize 1920x -quality 80 <output>
   ```
2. Save as `frontend/src/assets/images/banner.jpg`
3. Use Astro's `getImage()` to serve the optimized version at runtime

## Component: `Header.astro`

### Structure
```
<header>                          — sticky, background-image = banner photo
  ::before                        — semi-transparent dark overlay (rgba 0,0,0,0.3)
  <div.header-container>          — max-width 1200px, flex row, space-between
    <a.logo href="/">             — links to home
      <Image />                   — logo, 200x200, overflows below header
    </a>
    <nav.nav>
      <a> Instagram SVG icon      — links to https://www.instagram.com/verre_et_papilles (new tab)
      <a> Facebook SVG icon       — links to https://www.facebook.com/verreetpapilles (new tab)
      <a> "Nous contacter"        — links to /contact
    </nav>
  </div>
</header>
```

### Logo Behavior
- Displayed at 200x200px on desktop, 160x160px on mobile (breakpoint: 768px)
- The logo's top edge aligns with the header content, but the bottom overflows below the header using `margin-bottom: -80px` (desktop) / `-64px` (mobile)
- The logo sits above the dark overlay via `z-index: 10`
- Hover effect: `opacity: 0.8`

### Banner Background
- Applied as inline `background-image` style using Astro's `getImage()` for optimization
- CSS: `background-size: cover; background-position: center; background-repeat: no-repeat`
- Dark overlay via `::before` pseudo-element: `position: absolute; inset: 0; background-color: rgba(0, 0, 0, 0.3); z-index: -1`
- The header uses `isolation: isolate` to create a stacking context, and `overflow: visible` to allow the logo to extend beyond

### Header Sizing
- Padding: `1.1rem 2rem` (desktop), `1rem` (mobile)
- The header height is determined by the padding + the logo's visible portion (120px, since 80px overflows). Do NOT let the full 200px logo stretch the header — the negative margin handles this.

### Navigation Links

#### Social Icons (Instagram & Facebook)
- SVG icons at 36x36px (desktop), 28x28px (mobile)
- Instagram: stroke uses a `<linearGradient>` from `#F58529` (orange) through `#DD2A7B` (pink) to `#8134AF` (purple)
- Facebook: stroke color `#1877F2`
- Both have `filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.6))` for visibility against the banner
- Both open in new tab: `target="_blank" rel="noopener noreferrer"`
- Hover: `transform: scale(1.1)`

#### "Nous contacter" Button
- Text link, `font-size: 1.5rem` (desktop), `1.2rem` (mobile)
- Color: `var(--color-orange)` with `text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6)`
- Hover: orange background, white text, no scale transform
- Links to `/contact` (internal page)

### CSS Variables Referenced
- `--color-white`
- `--color-orange`
- `--color-text`

These should be defined in the global layout/stylesheet.

## Key Technical Decisions
- Logo kept as PNG in the repo (not on Cloudinary) since it's a static asset that rarely changes
- Banner served as JPEG (no transparency needed) for much smaller file size vs PNG
- Astro's `<Image />` used for the logo (automatic optimization), `getImage()` for the banner (needed as CSS background-image URL)
- Dark overlay uses `::before` + `isolation: isolate` pattern to avoid affecting child element stacking
- Social links use inline SVGs with branded colors rather than icon libraries, to avoid extra dependencies
