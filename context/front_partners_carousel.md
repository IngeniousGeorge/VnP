# Partners Carousel — Implementation Prompt

## Overview

Create an infinite-loop carousel showcasing partner brand logos. The carousel displays 3 logos at a time on desktop (1 on mobile), auto-advances every 2 seconds, and loops seamlessly in both directions. Each logo links to the partner's website (new tab). A tooltip shows the partner name after a 500ms hover delay. Slide order is randomized client-side on each page visit.

## Source Files

- **Partner logos**: `misc/partenaires/p_1_hangar.png` through `p_12_comptoir.png` (PNG, ~300–400px wide, `#FAF0EE` background)

## Image Processing

All 12 logos: strip metadata and compress using ImageMagick, then save to `frontend/src/assets/images/`:
```
convert <input> -strip -define png:compression-level=9 <output>
```
Astro's `<Image />` handles further optimization (WebP, resizing) at build time.

## Partner Data

Each partner has a name (used as alt text and tooltip), a logo image, and a URL:

| # | Name (alt text) | URL |
|---|---|---|
| 1 | Le Hangar - Artisan biscuitier | https://laled.eu/ |
| 2 | Valrhona - Chocolats d'exception | https://www.valrhona.com/fr-FR |
| 3 | Montgillet - Domaine familial | https://www.montgilet.com/ |
| 4 | La Sablésienne - Biscuiterie depuis 1962 | https://sablesienne.com/en |
| 5 | Les Délices de Sillery - Biscuiterie Bretonne & inclusive | https://lesdelicesdesillery.fr/ |
| 6 | L'Épicurien - Artisan du goût | https://epicurien.com/en/pages/nous |
| 7 | Poisson d'Ouest - Fabrication artisanale | https://www.poissondouest.com/ |
| 8 | Silvain - Nougat d'exception | https://nougats-silvain.fr/ |
| 9 | Alain Milliat - Jus de dégustation | https://alain-milliat.com/ |
| 10 | Secrets de Famille - Conserverie artisanale Bretonne | https://conserverie-artisanale-bretonne.com/ |
| 11 | Vie Vin D'Homme - Marchand de vin | https://www.vievindhomme.fr/ |
| 12 | Comptoir Français du Thé - Fabricant engagé | https://comptoir-francais-du-the.fr/ |

## Component: `PartnersCarousel.astro`

### Structure
```
<section.partners-carousel>         — #FAF0EE background, padding 3rem 2rem
  <h2.carousel-title>               — "Nos partenaires"
  <div.carousel-container>           — max-width 900px, flex row, centered
    <button.carousel-btn--prev>      — orange chevron SVG (28x28)
    <div.carousel-viewport>          — overflow: hidden, flex: 1
      <div.carousel-track>           — flex row, slides moved via JS
        <div.carousel-slide> × 12    — each 33.333% width (100% on mobile)
          <a.carousel-link>          — target="_blank", data-tooltip={name}
            <Image />                — height 100px, object-fit: contain
    <button.carousel-btn--next>      — orange chevron SVG (28x28)
  <div.carousel-tooltip>             — fixed-position tooltip element
```

### Title
- Text: "Nos partenaires"
- Font: `var(--font-heading)` (Crimson), bold italic, 2rem
- Color: `var(--color-text)`
- Centered, with `margin-bottom: 2rem`

### Navigation Buttons
- Inline SVG chevrons, 28x28, `stroke-width: 2.5`, `stroke-linecap: round`, `stroke-linejoin: round`
- Color: `var(--color-orange)`, hover: `var(--color-orange-dark)`
- Transition: `color 0.2s`
- `flex-shrink: 0` to prevent compression

### Slides
- Each slide: `flex: 0 0 33.333%` (desktop), `flex: 0 0 100%` (mobile, breakpoint 768px)
- Padding: `1rem 2rem` (desktop), `1rem` (mobile)
- Logo images: `height: 100px` (desktop), `70px` (mobile), `width: auto`, `object-fit: contain`
- Each logo wrapped in `<a>` with `target="_blank" rel="noopener noreferrer"`
- The `data-tooltip` attribute on each link stores the partner name for the tooltip

### Tooltip
- A single `<div class="carousel-tooltip">` element at the bottom of the section
- Positioned with `position: fixed; z-index: 1000` (escapes the viewport's `overflow: hidden`)
- Styled: `var(--color-text)` background, white text, `0.75rem` font, `var(--font-body)`, `border-radius: 4px`, `padding: 0.3rem 0.6rem`
- Hidden by default (`opacity: 0; pointer-events: none`), shown via `.visible` class (`opacity: 1`)
- Fade transition: `transition: opacity 0.3s ease`
- Appears 500ms after hover, positioned centered below the hovered logo (8px gap)

### Background
- `#FAF0EE` — matches the logo image backgrounds so they blend seamlessly

## JavaScript Behavior

### Constants
- `SLIDE_DURATION`: 800ms — transition animation length
- `AUTOPLAY_INTERVAL`: 2000ms — time between auto-advances
- `TOOLTIP_DELAY`: 500ms — hover delay before tooltip appears
- `TRANSITION`: `transform ${SLIDE_DURATION}ms ease-in-out` — reusable transition string

### Infinite Loop Mechanism
The carousel loops by physically moving DOM nodes after each transition:
- **Next**: animate `translateX(-slidePercent%)`, then on `transitionend` move the first child to the end and reset `translateX(0)` without transition
- **Prev**: move the last child to the start (no transition), set `translateX(-slidePercent%)`, force reflow, then animate to `translateX(0)`
- An `isTransitioning` flag prevents overlapping animations

### Autoplay
- Uses `setInterval` to call `slide('next')` every 2 seconds
- **Pauses on hover**: `mouseenter`/`mouseleave` on the **viewport** element (not the section) sets an `isHovered` flag. `startAutoplay()` checks this flag before creating an interval
- **Pauses when tab is hidden**: listens to `document.visibilitychange`
- `startAutoplay()` always calls `stopAutoplay()` first to prevent duplicate intervals
- Button clicks do **not** restart autoplay — they only trigger the slide. Autoplay resumes naturally based on hover/visibility state

### Navigation Buttons
- Event delegation: a single `click` listener on the section checks if a `.carousel-btn` was clicked
- Direction determined by `classList.contains('carousel-btn--next')`

### Tooltip
- Event delegation on the viewport using `mouseover`/`mouseout`
- On `mouseover`: find the closest `.carousel-link`, start a 500ms timeout, then position the tooltip centered below the link using `getBoundingClientRect()`
- On `mouseout`: clear the timeout and hide the tooltip

### Slide Randomization
- On page load, before starting autoplay, shuffle all slide DOM nodes using Fisher-Yates:
  ```js
  const slides = [...track.children];
  for (let i = slides.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    track.appendChild(slides[j]);
  }
  ```
- This runs client-side, so each visit gets a different order even on a static site

### Responsive
- Mobile breakpoint detected via `window.matchMedia('(max-width: 768px)')` — no resize listener needed
- Desktop: 3 slides visible (slide percent = 33.333%)
- Mobile: 1 slide visible (slide percent = 100%)

## CSS Variables Referenced
- `--color-orange` — button color
- `--color-orange-dark` — button hover color
- `--color-text` — title color, tooltip background
- `--color-white` — tooltip text
- `--font-heading` — title font (Crimson)
- `--font-body` — tooltip font (Glacial Indifference)

These should be defined in the global layout/stylesheet.

## Key Technical Decisions
- Infinite loop via DOM node rotation (appendChild/insertBefore) rather than cloning slides — simpler, no duplicate event listeners
- Autoplay pause scoped to the **viewport** (not the full section) so hovering the title or buttons doesn't stop the carousel
- Hover state tracked with a boolean flag (`isHovered`) rather than relying on event ordering — prevents edge cases with DOM manipulation triggering spurious mouse events
- Tooltip uses `position: fixed` to escape the viewport's `overflow: hidden` — a CSS-only tooltip (pseudo-element) would be clipped
- Client-side shuffle (not build-time) ensures random order on every visit, even with static site generation
- BEM-style class naming (`carousel-btn--next`, `carousel-slide`) for clear, scoped semantics
- Event delegation for buttons and tooltips — fewer listeners, and automatically works with DOM-shuffled slides
