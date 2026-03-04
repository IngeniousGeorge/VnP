# Les Bocaux Page — Implementation Prompt

## Overview

A dedicated page at `/bocaux` for the shop's prepared dishes sold in jars ("bocaux"). It shares
the same `Header` component as the home page and contains two sections:

- **Les Bocaux** — white background, intro text + photo (mirrors `NotreHistoire` layout). CMS-driven.
- **Le Menu** — grey background, section heading + 3 interactive flip cards showing the day's dishes. CMS-driven.

No hero cards, no partners carousel, no social posts section on this page.

---

## Naming Conventions

| Scope | Name | Notes |
|---|---|---|
| Page URL | `/bocaux` | |
| Page file | `bocaux.astro` | |
| Intro section | "Les Bocaux" | Component: `LesBocaux.astro`, CSS class: `.les-bocaux`, Strapi type: `les-bocaux` |
| Cards section | "Le Menu" | Component: `LeMenu.astro`, CSS class: `.le-menu`, Strapi type: `le-menu` |
| Strapi component | "Carte" | Category: `bocaux`, file: `bocaux/carte.json`, used as `bocaux.carte` |

The full concept is *"le menu des bocaux"* — "Le Menu" is the section name, not the page name.
Do not use "bocaux du jour", "bocaux à emporter", or "bocaux cartes" anywhere in code, class names, or Strapi slugs.

---

## Page File: `frontend/src/pages/bocaux.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import LesBocaux from '../components/LesBocaux.astro';
import LeMenu from '../components/LeMenu.astro';
---

<Layout title="Les Bocaux — Verre et Papilles">
  <Header />
  <main>
    <LesBocaux />
    <LeMenu />
  </main>
</Layout>
```

---

## Strapi Content Types

Both are **Single Types** with `draftAndPublish: true`.

### `les-bocaux` (display name: "Les Bocaux")

| Field | Type | Notes |
|---|---|---|
| `Titre` | Short text | Section heading, fallback: "Les Bocaux" |
| `Texte` | Rich text (Blocks) | Body paragraphs |
| `Mise_en_valeur` | Short text | Italic call-to-action line (optional) |
| `Photo` | Media — single, images | Section photo |
| `Description_photo` | Short text | Alt text for the photo |

API endpoint: `GET /api/les-bocaux?populate=Photo`

### `le-menu` (display name: "Le Menu")

| Field | Type | Notes |
|---|---|---|
| `Titre_section` | Rich text (Blocks) | Section heading; supports `{{date}}` placeholder |
| `Carte` | Component — repeatable | 3 cards (bocaux.carte component) |

API endpoint: `GET /api/le-menu?populate[Carte][populate]=Photo`

### Component: `bocaux/carte` (display name: "Carte")

| Field | Type | Notes |
|---|---|---|
| `Etape` | Short text | Card label displayed above the card |
| `Texte` | Rich text (Blocks) | Text shown on the card front (orange face) |
| `Photo` | Media — single, images | Photo shown on the card back |
| `Description_photo` | Short text | Alt text for the photo |

### Strapi permissions

In Settings → Users & Permissions → Public role, enable `find` on both `les-bocaux` and `le-menu`.

---

## Component: `LesBocaux.astro`

Mirrors `NotreHistoire.astro` exactly in layout: white background, photo left, text right.
The only structural difference is `padding-top: calc(4rem + 24px)` to clear the banner logo
overflow (the logo has `margin-bottom: -80px`; `24px` extra provides comfortable clearance
without excessive whitespace).

### Structure
```
<section.les-bocaux>              — white background, padding calc(4rem + 24px) 2rem 4rem
  <div.container>                 — max-width 1100px, 2-column grid, 3rem gap, align-items center
    <div.image-container>
      <Image les-bocaux-photo />  — width 800, inferSize, 82% width, centered, border-radius 8px
    <div.content>
      <h2>                        Titre from Strapi (fallback: "Les Bocaux")
      <Fragment set:html />       Texte blocks rendered as HTML
      <p.highlight>               Mise_en_valeur (optional, italic, orange-dark)
```

### Styling

- **Section**: `background-color: var(--color-white)`, `padding: calc(4rem + 24px) 2rem 4rem`
- **Container**: `max-width: 1100px`, `display: grid`, `grid-template-columns: 1fr 1fr`, `gap: 3rem`, `align-items: center`
- **Photo** (`.les-bocaux-photo`): `width: 82%`, `height: auto`, `border-radius: 8px`, `object-fit: cover`, `display: block`, `margin: 0 auto`
- **Content**: `padding: 1rem`
- **h2**: `font-size: 2rem`, `margin-bottom: 1.5rem`, `font-weight: 400`
- **p** (via `:global(p)`): `margin-bottom: 1.4rem`, `line-height: 1.8`, `text-align: justify`
- **`.highlight`**: `font-style: italic`, `color: var(--color-orange-dark)`, `margin-top: 1.5rem`

### Mobile (max-width: 768px)
- Grid collapses to single column, gap: `2rem`
- Text moves above image via `order: -1` on `.content`
- h2 font size: `1.75rem`

### Image optimization

Uses Astro's `<Image>` with `inferSize` and `width={800}`. The Railway hostname must be
declared in `astro.config.mjs` under `image.remotePatterns` for remote images to be
optimized at build time. See `context/tech_stack.md`.

---

## Component: `LeMenu.astro`

Grey background section with a CMS-driven heading and 3 interactive cards.

### Structure
```
<section.le-menu>                 — grey background, padding 4rem 2rem
  <div.section-header>            — max-width 900px, centered, text-align center
    <Fragment set:html />          Titre_section blocks (may contain {{date}} placeholder)
  <div.cards-container>           — max-width 900px, flex row, gap 4rem, flex-wrap, centered
    <div.card-wrapper> × 3        — flex column, align-items center, gap 0.6rem
      <span.card-label>           Etape field (label above the card)
      <div.card-inner>            — 250×350px, position relative
        <div.card-front>          — orange face (text), position absolute, inset 0
        <div.card-back>           — photo face, position absolute, inset 0
```

### Card Dimensions

58% of ~431px (the visible photo width in `NotreHistoire`/`LaBoutique`) = **250px wide**.
Poker card ratio 5:7 → **350px tall**.

### Styling

**Section and header:**
- `.le-menu`: `background-color: var(--color-gray-bg)`, `padding: 4rem 2rem`
- `.section-header`: `max-width: 900px`, `margin: 0 auto 3rem`, `text-align: center`
- `.section-header :global(h2, h3)`: `font-size: 2rem`, `color: var(--color-white)`, `font-weight: 400`, `margin-bottom: 1rem`
- `.section-header :global(p)`: `color: var(--color-white)`, `line-height: 1.8`

**Cards container:**
- `.cards-container`: `max-width: 900px`, `margin: 0 auto`, `display: flex`, `justify-content: center`, `align-items: center`, `gap: 4rem`, `flex-wrap: wrap`

**Card wrapper:**
- `.card-wrapper`: `display: flex`, `flex-direction: column`, `align-items: center`, `gap: 0.6rem`, `flex-shrink: 0`

**Card inner:**
- `.card-inner`: `width: 250px`, `height: 350px`, `position: relative`

**Card faces (shared):**
- `.card-front, .card-back`: `position: absolute`, `inset: 0`, `border-radius: 12px`
- `transition: opacity 350ms ease, transform 350ms ease`

**Card front (text face — default visible):**
- `background-color: var(--color-orange)`, `color: var(--color-white)`
- `display: flex`, `align-items: center`, `justify-content: center`, `padding: 1.5rem`, `text-align: center`
- `z-index: 2` (on top by default)
- `.card-front :global(p)`: `line-height: 1.7`, `font-size: 1rem`, `margin: 0`

**Card back (photo face — hidden by default):**
- `opacity: 0`, `transform: scale(0.97)`, `z-index: 1`

**`.show-image` state (image revealed):**
- `.card-inner.show-image .card-back`: `opacity: 1`, `transform: scale(1)`, `z-index: 2`
- `.card-inner.show-image .card-front`: `opacity: 0`, `transform: scale(0.97)`, `z-index: 1`

**Card label:**
- `.card-label`: `color: var(--color-white)`, `font-size: 1.6rem`, `white-space: nowrap`
- `font-family: var(--font-heading)`, `font-weight: 700`, `font-style: italic`

**Card photo:**
- `.card-photo`: `width: 100%`, `height: 100%`, `object-fit: cover`, `display: block`, `border-radius: 12px`

### Card Image Optimization

Uses Astro's `<Image>` with `inferSize` and `width={500}` (2× retina for the 250px display size).

### Card Interaction Behaviour

**Default state:** text (orange face) visible, photo hidden below.

**On first visibility** (IntersectionObserver on `.cards-container`, threshold 0.3):
- After 1000ms, add `.show-image` to card 0 (left)
- After 1230ms, add `.show-image` to card 1 (middle)
- After 1460ms, add `.show-image` to card 2 (right)
- The observer disconnects after firing once

**On hover:** remove `.show-image` from the hovered card (text reappears)

**On mouse out:** add `.show-image` back — but only if the visibility trigger has already
fired for that card (tracked via a `WeakMap<Element, boolean>`)

### Date Placeholder

The shop owner types `{{date}}` anywhere in `Titre_section` in Strapi (e.g. *"Le menu des bocaux
du {{date}}"*). A client-side `<script>` walks text nodes inside `.section-header` on page load
and replaces `{{date}}` with the current date formatted in French:

```js
new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
}).format(new Date())
```

This runs from the visitor's browser clock — always correct, no daily rebuild needed.

---

## Navigation Links

The bocaux page is linked from two places on the home page:

- **Sticky nav** (`Header.astro`): `<a href="/bocaux">Les bocaux</a>`
- **Hero card** (`HeroCircles.astro`): first circle card, `href="/bocaux"`, label "Les bocaux"

The `Header` component is shared between the home page and the bocaux page — no separate
navigation component needed.

---

## CSS Variables Referenced

- `--color-white` — Les Bocaux background, card text, section-header text
- `--color-gray-bg` — Le Menu background
- `--color-orange` — card front background
- `--color-orange-dark` — `.highlight` text in Les Bocaux
- `--font-heading` — card label font (Crimson, bold italic)
- `--font-body` — body text (Glacial Indifference, via global rule)

---

## Key Technical Decisions

- **`padding-top: calc(4rem + 24px)`** on `LesBocaux` — the banner logo overflows 80px below
  the header via `margin-bottom: -80px`. `24px` extra (30% of 80px) gives comfortable clearance
  without excessive whitespace. The `calc()` makes the intent explicit.
- **Text face on top by default** — cards start showing text so visitors immediately see the dish
  description. The image reveal is a deliberate "discovery" interaction, not the initial state.
- **Staggered image reveal** — images appear left to right with 230ms between each, giving a
  satisfying sequential reveal rather than a simultaneous pop.
- **`WeakMap` for trigger tracking** — avoids mouse-out prematurely flipping cards to image before
  the visibility timer has fired for that card.
- **`StrapiBlock` type exported from `strapi.ts`** — used in `LeMenu.astro` for the `Texte` field
  type annotation instead of `any[]`.
- **No 3D flip animation** — cross-fade with scale (350ms ease) was chosen over a CSS 3D flip
  for reliability and elegance. The flip rendered poorly and felt too heavy for small cards.
- **Client-side date injection** — avoids a daily rebuild trigger just to update the date in the
  section heading. The `{{date}}` placeholder convention keeps the CMS content readable.
