# Hero Navigation Cards — Implementation Prompt

## Overview

Create a row of three circular navigation cards displayed just below the header banner. The left and right cards are orange circles with white text and an icon; the center card is a partner logo. All three are clickable links. On hover, a soft dark shadow fades in around each card.

## Source Files

- **Bocal icon**: `misc/elements/logo_bocal.png` (746x768 PNG, white icon on transparent background)
- **Gift icon**: `misc/elements/gift.svg` (Feather icon — inline SVG, no file processing needed)
- **Crottin logo**: `misc/elements/logo_crottin_hd.png` (451x455 PNG, nearly square)

## Image Processing

### Bocal icon (`logo_bocal.png`)
1. No processing needed — copy directly to `frontend/src/assets/images/logo_bocal.png`
2. Astro's `<Image />` handles resizing at build time

### Gift icon
No file processing. The icon is inlined as SVG directly in the component (see Right Card section below).

### Crottin logo (`logo_crottin_hd.png`)
1. The source is 451x455 (nearly square). Center-crop to square, resize for 2x retina (528x528), apply circular mask, and strip metadata:
   ```
   convert <input> \
     -resize 528x528^ \
     -gravity center -extent 528x528 \
     \( +clone -threshold -1 -negate -fill white -draw "circle 264,264 264,0" \) \
     -alpha off -compose copy_opacity -composite \
     -strip <output>
   ```
   The `^` flag resizes to fill 528x528 (maintaining aspect ratio), then `-gravity center -extent 528x528` crops to center.
2. Save to `frontend/src/assets/images/logo_crottin_noir.png`

## Font Dependency

The card titles use **Dancing Script Bold**. This font must be available before building the component.

### Font setup
1. Download the **latin** subset of Dancing Script Bold (woff2) from Google Fonts. Use a Chrome-like user-agent to get woff2 format:
   ```
   curl -sH "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ..." \
     "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"
   ```
   Extract the **latin** woff2 URL (unicode-range `U+0000-00FF, ...`) — not the Vietnamese or latin-ext subsets.
2. Save to `frontend/public/fonts/DancingScript-Bold.woff2`
3. Register in `Layout.astro` global styles:
   ```css
   @font-face {
     font-family: 'Dancing Script';
     src: url('/fonts/DancingScript-Bold.woff2') format('woff2');
     font-weight: 400 700;
     font-style: normal;
     font-display: swap;
   }
   ```
   Note: `font-weight: 400 700` range ensures the browser matches this face regardless of computed weight.

## Component: `HeroCircles.astro`

### Structure
```
<section.hero-circles>                — white background, padding 1.2rem 2rem 0
  <div.circles-container>             — flex row, centered, 2rem gap, max-width 1140px
    <a.circle href="/">               — left card (bocaux)
      <span.circle-title.circle-title-nowrap>  "Les bocaux du jour"
      <div.circle-icon>
        <Image logo_bocal />          — 92x92
    <a href="/">                      — center card (partner logo)
      <Image logo_crottin_noir />     — 264x264, class="circle-image"
    <a.circle href="/">               — right card (coffrets)
      <span.circle-title>            "Les coffrets gourmands"
      <div.circle-icon>
        <svg .../>                    — inline gift SVG, 88x88
```

### Card Sizing
- All three cards: **264px** diameter (desktop), **216px** (mobile, breakpoint 768px)
- Container max-width: 1140px to accommodate the three cards + gaps
- Section hidden entirely on mobile (`display: none` at 768px breakpoint)

### Left & Right Cards (`.circle`)
- Circular: `border-radius: 50%`
- Background: `var(--color-orange)` (`#F29D37`)
- Text: white, **Dancing Script Bold**, 2rem (desktop), 1.7rem (mobile)
- Text has a thin black underline: `text-decoration: underline`, `text-decoration-color: black`, `text-decoration-thickness: 1px`, `text-underline-offset: 6px`
- `line-height: 1.05` — tightens the gap between lines when the title wraps
- Left card title ("Les bocaux du jour"): `white-space: nowrap` to stay on one line
- Right card title ("Les coffrets gourmands"): allowed to wrap onto two lines
- Icon container (`.circle-icon`): 92x92px with `0.5rem` vertical margin

### Center Card (`.circle-image`)
- Displays the circular Crottin Craonnais logo at 264x264
- `border-radius: 50%`, `object-fit: cover`
- No text, no background color — the image itself is the card

### Right Card Icon — Inline Gift SVG

The right card uses an inline SVG gift icon (from `misc/elements/gift.svg`, Feather icon set). No image file is used. The SVG is authored directly in the component:

```html
<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 24 24"
     fill="white" stroke="black" stroke-width="0.750"
     stroke-linecap="round" stroke-linejoin="round">
  <!-- Box body: open-top rectangle with rounded bottom corners (r=1.5) -->
  <path d="M 20 12 L 20 20.5 A 1.5 1.5 0 0 1 18.5 22 L 5.5 22 A 1.5 1.5 0 0 1 4 20.5 L 4 12"></path>
  <!-- Ribbon band with rounded ends -->
  <rect x="2" y="7" width="20" height="5" rx="1.5"></rect>
  <!-- Center vertical line -->
  <line x1="12" y1="22" x2="12" y2="7"></line>
  <!-- Left bow loop — filled orange (matches card background) -->
  <path fill="#F29D37" d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
  <!-- Right bow loop — filled orange (matches card background) -->
  <path fill="#F29D37" d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
</svg>
```

Key styling decisions:
- `fill="white"` on the SVG root — all shapes fill white (except the bow loops which override it)
- `stroke="black"` — visible contour on the orange background
- `stroke-width="0.750"` — thin, elegant line weight
- The two bow loops at the top use `fill="#F29D37"` to blend with the orange card background, creating a "cut out" ribbon effect
- The box body is a `<path>` (not `<polyline>`) to enable rounded bottom corners via SVG arc commands
- The ribbon band `<rect>` uses `rx="1.5"` for rounded ends

### Hover Effect
- Soft dark shadow fades in on hover, fades out on mouse leave
- **Left & right cards**: `box-shadow: 0 0 18px 6px rgba(0, 0, 0, 0.45)` on hover
- **Center card**: slightly stronger shadow to compensate for the dark logo: `box-shadow: 0 0 21px 7px rgba(0, 0, 0, 0.54)`
- Default state: same shadow dimensions but fully transparent (`rgba(0, 0, 0, 0)`)
- Transition: `0.2s ease-in` on hover, `0.2s ease-out` on leave
- No scale or transform effects

### CSS Variables Referenced
- `--color-orange` (`#F29D37`)
- `--color-white`

## Key Technical Decisions
- Cards are `<a>` elements directly (no wrapping div) to keep the DOM flat
- Dancing Script font self-hosted as woff2 rather than linked from Google Fonts CDN, for performance and privacy
- The latin Google Fonts subset is sufficient for French text; the latin-ext subset is not needed for basic accented characters (they fall within the latin unicode range)
- Icon images are served through Astro's `<Image />` for automatic optimization; source images in `src/assets/images/` (not `public/`) to enable build-time processing
- The gift icon is inlined as SVG (not a PNG processed with ImageMagick) — this allows fine-grained control over fill colors per shape (orange bow loops, white body), stroke weight, and rounded corners via SVG path arcs and `rx` attributes, none of which are easily achievable at image-processing time
- The bow loop fills use the same hardcoded `#F29D37` as `--color-orange` — SVG `fill` attributes cannot reference CSS custom properties when the SVG is inline without additional CSS overrides
- `line-height: 1.05` on `.circle-title` tightens multi-line wrapping on the right card
