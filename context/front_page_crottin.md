# Le Crottin Craonnais Page — Implementation Prompt

## Overview

A dedicated page at `/crottin` for the shop's signature chocolate specialty. It shares the same
`Header` component as the home page and contains two sections:

- **Le Crottin Craonnais** — white background, intro text + photo. Uses the shared
  `PhotoTextSection.astro` component with `withOffset` (same as Les Bocaux).
- **Les Revendeurs** — dark background, section heading + two-column layout: retailer card grid
  on the left, tall portrait photo on the right. CMS-driven.

No hero cards, no partners carousel, no social posts section on this page.

---

## Naming Conventions

| Scope | Name | Notes |
|---|---|---|
| Page URL | `/crottin` | |
| Page file | `crottin.astro` | |
| Intro section | "Le Crottin Craonnais" | Component: `LeCrottin.astro`, Strapi type: `le-crottin` |
| Retailers section | "Les Revendeurs" | Component: `LesRevendeurs.astro`, CSS class: `.les-revendeurs`, Strapi type: `les-revendeurs` |
| Strapi component | "Revendeur" | Category: `revendeurs`, file: `revendeurs/revendeur.json`, used as `revendeurs.revendeur` |

Note: the Strapi plural API ID for `le-crottin` is `le-crottin-list` and for `les-revendeurs`
is `les-revendeurs-list` — these are the values the shop owner entered when creating the types.
This does not affect the REST API endpoints, which use the singular ID.

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
import LeCrottin from '../components/LeCrottin.astro';
import LesRevendeurs from '../components/LesRevendeurs.astro';
---

<Layout title="Le Crottin Craonnais — Verre et Papilles">
  <Header />
  <main>
    <LeCrottin />
    <LesRevendeurs />
  </main>
</Layout>
```

---

## Strapi Content Types

Both are **Single Types** with `draftAndPublish: true`.

### `le-crottin` (display name: "Le Crottin")

| Field | Type | Notes |
|---|---|---|
| `Titre` | Short text | Section heading, fallback: "Le Crottin Craonnais" |
| `Texte` | Rich text (Blocks) | Body paragraphs |
| `Mise_en_valeur` | Short text | Italic call-to-action line (optional) |
| `Photo` | Media — single image | Section photo |
| `Description_photo` | Short text | Alt text |

API endpoint: `GET /api/le-crottin?populate=Photo`

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

Settings → Users & Permissions → Roles → Public: enable `find` on both `le-crottin` and
`les-revendeurs`.

---

## Component: `LeCrottin.astro`

Thin wrapper around `PhotoTextSection.astro`. Fetches from Strapi, passes props, renders nothing
if Strapi is unavailable (graceful fallback via `fetchStrapiData`).

```astro
---
import { fetchStrapiData, buildPhotoUrl, blocksToHtml } from '../lib/strapi';
import PhotoTextSection from './PhotoTextSection.astro';

const data = await fetchStrapiData('/api/le-crottin?populate=Photo');

const titre        = data?.Titre            ?? 'Le Crottin Craonnais';
const texteHtml    = data?.Texte            ? blocksToHtml(data.Texte) : '';
const miseEnValeur = data?.Mise_en_valeur   ?? '';
const photoUrl     = buildPhotoUrl(data?.Photo);
const photoAlt     = data?.Description_photo ?? '';
---

<PhotoTextSection {titre} {texteHtml} {miseEnValeur} {photoUrl} {photoAlt} withOffset />
```

The `withOffset` prop adds `padding-top: calc(4rem + 24px)` to clear the banner logo overflow
(logo has `margin-bottom: -80px`; the extra 24px gives comfortable clearance). This is the same
behaviour as `LesBocaux.astro`.

---

## Component: `PhotoTextSection.astro` (shared)

Used by `NotreHistoire`, `LesBocaux`, and `LeCrottin`. Implements the white-background two-column
grid: photo left, text right.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `titre` | `string` | — | Section heading |
| `texteHtml` | `string` | — | HTML string from `blocksToHtml` |
| `photoUrl` | `string \| null` | — | Full URL; photo column renders empty if null |
| `photoAlt` | `string` | — | Alt text |
| `miseEnValeur` | `string` | `''` | Optional italic highlight line |
| `withOffset` | `boolean` | `false` | Adds banner-offset padding-top |

### Styling

- **Section**: `background-color: var(--color-white)`, `padding: 4rem 2rem`
- **with-offset modifier**: `padding-top: calc(4rem + 24px)`
- **Container**: `max-width: 1100px`, `grid-template-columns: 1fr 1fr`, `gap: 3rem`, `align-items: center`
- **Photo**: `width: 82%`, `height: auto`, `border-radius: 8px`, `object-fit: cover`, `margin: 0 auto`
- **h2**: `font-size: 2rem`, `color: var(--color-text)`, `font-weight: 400`, `margin-bottom: 1.5rem`
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

- **`LeCrottin` is a 14-line wrapper** — all layout logic lives in `PhotoTextSection.astro`, which
  is shared with `NotreHistoire` and `LesBocaux`. The only crottin-specific things are the endpoint,
  the fallback string, and `withOffset`.
- **`withOffset` prop** — `PhotoTextSection` uses `class:list` to conditionally apply `.with-offset`,
  which overrides `padding-top` to `calc(4rem + 24px)`. `NotreHistoire` (home page, no sticky header
  offset issue) uses the component without it.
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
