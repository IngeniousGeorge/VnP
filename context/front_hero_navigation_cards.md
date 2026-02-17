# Hero Navigation Cards — Implementation Prompt

## Overview

Create a row of three circular navigation cards displayed just below the header banner. The left and right cards are orange circles with white text and an icon; the center card is a partner logo. All three are clickable links. On hover, a soft dark shadow fades in around each card.

## Source Files

- **Bocal icon**: `misc/elements/logo_bocal.png` (746x768 PNG, white icon on transparent background)
- **Gift icon**: `misc/elements/logo_cadeau.png` (512x512 PNG, white icon on transparent background)
- **Crottin logo**: `misc/elements/logo_crottin_noir.png` (2000x2000 PNG, square with rounded corners, black background)

## Image Processing

### Bocal icon (`logo_bocal.png`)
1. No processing needed — copy directly to `frontend/src/assets/images/logo_bocal.png`
2. Astro's `<Image />` handles resizing at build time

### Gift icon (`logo_cadeau.png`)
1. The source is white on transparent. Add a thin black contour around the white elements using ImageMagick: dilate the alpha channel slightly, fill with black, then composite the original on top:
   ```
   convert <input> \
     \( +clone -channel A -morphology dilate disk:3 +channel -fill black -colorize 100% \) \
     -compose DstOver -composite \
     -resize 184x184 -strip <output>
   ```
2. Save to `frontend/src/assets/images/logo_cadeau.png`

### Crottin logo (`logo_crottin_noir.png`)
1. The source is a square with rounded corners on a black background. Crop it into a true circle, resize for 2x retina (528x528), and strip metadata:
   ```
   convert <input> -resize 528x528 \
     \( +clone -threshold -1 -negate -fill white -draw "circle 264,264 264,0" \) \
     -alpha off -compose copy_opacity -composite \
     -strip <output>
   ```
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
<section.hero-circles>                — warm beige background, padding 3rem 2rem
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
        <Image logo_cadeau />         — 106x106
```

### Card Sizing
- All three cards: **264px** diameter (desktop), **216px** (mobile, breakpoint 768px)
- At 480px and below, cards stack vertically
- Container max-width: 1140px to accommodate the three cards + gaps

### Left & Right Cards (`.circle`)
- Circular: `border-radius: 50%`
- Background: `var(--color-orange)` (`#F29D37`)
- Text: white, **Dancing Script Bold**, 2rem (desktop), 1.7rem (mobile)
- Text has a thin black underline: `text-decoration: underline`, `text-decoration-color: black`, `text-decoration-thickness: 1px`, `text-underline-offset: 6px`
- Left card title ("Les bocaux du jour"): `white-space: nowrap` to stay on one line
- Right card title ("Les coffrets gourmands"): allowed to wrap onto two lines
- Icon container: 92x92px with `0.5rem` vertical margin

### Center Card (`.circle-image`)
- Displays the circular Crottin Craonnais logo at 264x264
- `border-radius: 50%`, `object-fit: cover`
- No text, no background color — the image itself is the card

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
- `--color-warm-bg` (`#FAF0EE`) — section background

These should be defined in the global layout/stylesheet.

## Key Technical Decisions
- Cards are `<a>` elements directly (no wrapping div) to keep the DOM flat
- Dancing Script font self-hosted as woff2 rather than linked from Google Fonts CDN, for performance and privacy
- The latin Google Fonts subset is sufficient for French text; the latin-ext subset is not needed for basic accented characters (they fall within the latin unicode range)
- Icon images are served through Astro's `<Image />` for automatic optimization; source images in `src/assets/images/` (not `public/`) to enable build-time processing
- The gift icon gets a black contour added at image-processing time (not via CSS) since CSS outlines on transparent PNGs are unreliable
