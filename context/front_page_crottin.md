# Le Crottin Craonnais Page — Implementation Prompt

## Overview

A dedicated page at `/crottin` for the shop's signature chocolate specialty. It shares the same
`Header` component as the home page and contains three sections:

- **Le Crottin 1** — white background, intro text + photo on the right. Uses the shared
  `PhotoTextSection.astro` component with `reversed`. CMS-driven.
- **Le Crottin 2** — white background, intro text + photo on the left. Uses the shared
  `PhotoTextSection.astro` component. CMS-driven.
- **Les Revendeurs** — dark background, section heading + two-column layout: retailer card grid
  on the left, tall portrait photo on the right. CMS-driven.

No hero cards, no partners carousel, no social posts section on this page. The shared `Footer`
component is included with `variant="dark"` to match the dark background of `LesRevendeurs` above it.

---

## Naming Conventions

| Scope | Name | Notes |
|---|---|---|
| Page URL | `/crottin` | |
| Page file | `crottin.astro` | |
| First section | "Le Crottin 1" | Component: `LeCrottin1.astro`, Strapi type: `le-crottin-1`; photo right |
| Second section | "Le Crottin 2" | Component: `LeCrottin2.astro`, Strapi type: `le-crottin-2`; photo left |
| Retailers section | "Les Revendeurs" | Component: `LesRevendeurs.astro`, CSS class: `.les-revendeurs`, Strapi type: `les-revendeurs` |
| Strapi component | "Revendeur" | Category: `revendeurs`, file: `revendeurs/revendeur.json`, used as `revendeurs.revendeur` |

---

## Shared Utilities (already in codebase)

All CMS fetching goes through `frontend/src/lib/strapi.ts`:

```typescript
// Fetches any Strapi endpoint; returns json.data or null on error
export async function fetchStrapiData(endpoint: string)

// Constructs the full photo URL from a Strapi photo object
export function buildPhotoUrl(photoObj?: { url: string } | null): string | null

// Converts Strapi Blocks rich text to HTML string
export function blocksToHtml(blocks: StrapiBlock[]): string
```

The shared two-column photo + text layout lives in `frontend/src/components/PhotoTextSection.astro`.
See its own section below.

---

## Page File: `frontend/src/pages/crottin.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import LeCrottin1 from '../components/LeCrottin1.astro';
import LeCrottin2 from '../components/LeCrottin2.astro';
import LesRevendeurs from '../components/LesRevendeurs.astro';
import Footer from '../components/Footer.astro';
---

<Layout title="Le Crottin Craonnais — Verre et Papilles">
  <Header navOnly />
  <main>
    <LeCrottin1 />
    <LeCrottin2 />
    <LesRevendeurs />
  </main>
  <Footer variant="dark" />
</Layout>
```

---

## Strapi Content Types

Both are **Single Types** with `draftAndPublish: true`.

### `le-crottin-1` (display name: "Le Crottin 1")

| Field | Type | Notes |
|---|---|---|
| `Titre` | Short text | Section heading, fallback: "Le Crottin Craonnais" |
| `Texte` | Rich text (Blocks) | Body paragraphs |
| `Mise_en_valeur` | Short text | Italic call-to-action line (optional) |
| `Photo` | Media — single image | Section photo (displayed on the right) |
| `Description_photo` | Short text | Alt text |

API endpoint: `GET /api/le-crottin-1?populate=Photo`

### `le-crottin-2` (display name: "Le Crottin 2")

Same fields as `le-crottin-1`. Photo displayed on the left.

API endpoint: `GET /api/le-crottin-2?populate=Photo`

### `les-revendeurs` (display name: "Les Revendeurs")

| Field | Type | Notes |
|---|---|---|
| `Titre_section` | Short text | Section heading, fallback: "Où le trouver" |
| `Photo` | Media — single image | Portrait photo displayed alongside the card grid |
| `Description_photo` | Short text | Alt text for the photo |
| `Revendeur` | Component — repeatable | List of retailers (revendeurs.revendeur) |

API endpoint: `GET /api/les-revendeurs?populate[Revendeur]=true&populate[Photo]=true`

### Component: `revendeurs/revendeur` (display name: "Revendeur")

| Field | Type | Notes |
|---|---|---|
| `Nom` | Short text | Retailer name |
| `Lien` | Short text | External URL |
| `Lieu` | Short text | Optional — location (e.g. "Craon, Mayenne") |
| `Description` | Short text | Optional — type of shop (e.g. "Épicerie fine, cave à vins") |

### Strapi permissions

Settings → Users & Permissions → Roles → Public: enable `find` on `le-crottin-1`,
`le-crottin-2`, and `les-revendeurs`.

---

## Components: `LeCrottin1.astro` and `LeCrottin2.astro`

Both are thin wrappers around `PhotoTextSection.astro`. They differ only in endpoint and column
order. `LeCrottin1` passes `reversed` so the photo appears on the right; `LeCrottin2` uses the
default left layout.

```astro
<!-- LeCrottin1.astro -->
const data = await fetchStrapiData('/api/le-crottin-1?populate=Photo');
const titre = data?.Titre ?? 'Le Crottin Craonnais';
...
<PhotoTextSection {titre} {texteHtml} {miseEnValeur} {photoUrl} {photoAlt} reversed />

<!-- LeCrottin2.astro -->
const data = await fetchStrapiData('/api/le-crottin-2?populate=Photo');
const titre = data?.Titre ?? '';  // title is intentionally optional — no fallback
...
<PhotoTextSection {titre} {texteHtml} {miseEnValeur} {photoUrl} {photoAlt} />
```

Nav clearance on `navOnly` pages is handled by the spacer set in `Header.astro` — no
`withOffset` needed.

---

## Component: `PhotoTextSection.astro` (shared)

Used by `NotreHistoire`, `LesBocaux`, `LeCrottin1`, `LeCrottin2`, and `CoffretsGourmands`.
Implements the white-background two-column grid with configurable photo position.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `titre` | `string` | — | Section heading |
| `texteHtml` | `string` | — | HTML string from `blocksToHtml` |
| `photoUrl` | `string \| null` | — | Full URL; photo column renders empty if null |
| `photoAlt` | `string` | — | Alt text |
| `miseEnValeur` | `string` | `''` | Optional italic highlight line |
| `withOffset` | `boolean` | `false` | Adds banner-offset padding-top (currently unused) |
| `reversed` | `boolean` | `false` | Photo on the right (text left); default is photo left |

### Styling

- **Section**: `background-color: var(--color-white)`, `padding: 4rem 2rem`
- **with-offset modifier**: `padding-top: calc(4rem + 24px)`
- **Container**: `max-width: 1100px`, `grid-template-columns: 1fr 1fr`, `gap: 3rem`, `align-items: center`
- **Photo**: `width: 82%`, `height: auto`, `border-radius: 8px`, `object-fit: cover`, `margin: 0 auto`
- **h2**: conditionally rendered (`{titre && <h2>{titre}</h2>}`) — omitted entirely when `titre` is empty, avoiding stray margin; `font-size: 2rem`, `color: var(--color-text)`, `font-weight: 400`, `margin-bottom: 1.5rem`
- **p** (`:global`): `margin-bottom: 1.4rem`, `line-height: 1.8`, `text-align: justify`
- **`.highlight`**: `font-style: italic`, `color: var(--color-orange-dark)`, `margin-top: 1.5rem`

### Mobile (max-width: 768px)
- Single column, gap `2rem`, text moves above image (`order: -1` on `.content`), h2 `1.75rem`

---

## Component: `LesRevendeurs.astro`

Dark background section. A centered heading with orange accent rule sits above a two-column
layout: auto-fill card grid on the left, portrait photo on the right.

### Structure
```
<section.les-revendeurs>            — dark background, padding 4rem 2rem
  <div.section-header>              — max-width 1100px, centered, text-align center
    <div.accent>                    — orange rule 3rem × 2px
    <h2>                            Titre_section (fallback: "Où le trouver")
  <div.content-container>           — max-width 1100px, grid 1fr 280px, gap 3rem, align-items start
    <div.grid>                      — auto-fill, minmax(220px, 1fr), gap 1.5rem
      <a.card> × n                  — full-card link, target="_blank", rel="noopener noreferrer"
        <div.card-body>             — flex, space-between, align flex-end
          <div>
            <p.retailer-name>       Nom (Crimson italic, white, 1.4rem)
            <p.retailer-description> Description (optional, orange, 0.875rem)
            <p.retailer-location>   Lieu (optional, rgba white 55%, 0.875rem)
          <span.retailer-arrow>     → (orange)
    <div.image-container>           — only rendered when photoUrl exists
      <Image.section-photo>         — width 600, inferSize, natural proportions
```

### Styling

**Section and header:**
- `.les-revendeurs`: `background-color: var(--color-dark-bg)`, `padding: 4rem 2rem`
- `.section-header`: `max-width: 1100px`, `margin: 0 auto 3rem`, `text-align: center`
- `.accent`: `width: 3rem`, `height: 2px`, `background-color: var(--color-orange)`, `margin: 0 auto 1.5rem`
- `h2`: `font-family: var(--font-heading)`, `font-style: italic`, `font-size: 2rem`, `font-weight: 400`, `color: var(--color-white)`

**Content container:**
- `.content-container`: `max-width: 1100px`, `margin: 0 auto`, `display: grid`, `grid-template-columns: 1fr 280px`, `gap: 3rem`, `align-items: start`

**Grid:**
- `.grid`: `display: grid`, `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`, `gap: 1.5rem`

**Card:**
- `.card`: `display: block`, `text-decoration: none`, `background: rgba(255,255,255,0.06)`, `border: 1px solid rgba(255,255,255,0.12)`, `border-radius: 8px`, `padding: 1.5rem`
- `transition: border-color 250ms ease, box-shadow 250ms ease`
- `.card:hover`: `border-color: var(--color-orange)`, `box-shadow: 0 4px 20px rgba(0,0,0,0.3)`

**Card body:**
- `.card-body`: `display: flex`, `justify-content: space-between`, `align-items: flex-end`, `gap: 1rem`
- `.retailer-name`: Crimson, italic, 1.4rem, 400 weight, white, `margin-bottom: 0.35rem`
- `.retailer-description`: 0.875rem, `color: var(--color-orange)`, `margin-bottom: 0.35rem`
- `.retailer-location`: 0.875rem, `color: rgba(255,255,255,0.55)`
- `.retailer-arrow`: 1.2rem, orange, `flex-shrink: 0`, `line-height: 1`

**Photo:**
- `.section-photo`: `width: 100%`, `height: auto`, `border-radius: 8px`, `display: block`
- Natural proportions — no `object-fit`. The column is `280px` wide; the image fills it and
  extends as tall as its natural aspect ratio dictates.

### Mobile (max-width: 768px)
- `.content-container` collapses to `grid-template-columns: 1fr`
- `.image-container`: `max-width: 320px`
- `.grid`: `grid-template-columns: 1fr`

---

## Navigation Links

The crottin page is linked from two places in the existing `Header` component (shared with all pages):

- **Sticky nav** (`Header.astro` line ~47): `<a href="/crottin" class="navbar-link">Le crottin</a>`
- **Hero card** (`HeroCircles.astro`): the middle card (crottin logo image) wraps in `<a href="/crottin">`

Both were previously placeholders (`href="#crottin"` and `href="/"` respectively).

---

## CSS Variables Referenced

- `--color-white` — `PhotoTextSection` background
- `--color-text` — `PhotoTextSection` h2
- `--color-orange-dark` — `.highlight` text in `PhotoTextSection`
- `--color-dark-bg` — `LesRevendeurs` background
- `--color-orange` — `.accent` rule, `.retailer-description`, `.retailer-arrow`, card hover border
- `--font-heading` — h2 in `LesRevendeurs`, `.retailer-name` (Crimson)
- `--font-body` — body text (Glacial Indifference, via global rule)

---

## Key Technical Decisions

- **`LeCrottin1` and `LeCrottin2` are both 14-line wrappers** — all layout logic lives in
  `PhotoTextSection.astro`. The only section-specific things are the endpoint, the fallback string,
  and the `reversed` prop.
- **`reversed` prop** — implemented via `order: 2` on `.image-container` in the CSS grid. The
  existing mobile `order: -1` on `.content` takes precedence on small screens, so both variants
  collapse to text-above-image on mobile without extra rules.
- **`fetchStrapiData` returns null silently** — no try/catch needed in components. If Strapi is
  unavailable at build time, fallback strings are used and the photo column renders empty.
- **Retailers as a repeatable component** (not a Collection Type) — consistent with `Carte` in
  `le-menu`. All data in one API call.
- **Full-card `<a>` tag** for retailers — maximises tap target on mobile.
  `target="_blank"` + `rel="noopener noreferrer"` prevents tab-napping.
- **Shadow hover, no scale** on cards — consistent with site convention.
- **`auto-fill` grid with `minmax(220px, 1fr)`** — adapts to any retailer count without breakpoints.
- **Photo at natural proportions** — no `object-fit`. The shop owner uploads a tall portrait;
  it displays tall within the `280px` column.
- **No JavaScript** — both sections are purely static.
