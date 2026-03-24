# Les Coffrets Gourmands Page — Implementation Prompt

## Overview

A dedicated page at `/coffrets` for the shop's gift boxes ("coffrets gourmands"). It shares the same
`Header` component as the home page and contains two sections:

- **Coffrets Gourmands** — white background, intro text + photo. Uses the shared
  `PhotoTextSection.astro` component with `withOffset` (same as Les Bocaux and Le Crottin).
- **Catalogue Coffrets** — grey background, section heading + interactive cards showing the
  available gift boxes. CMS-driven. Same card layout and fade/scale interaction as Le Menu on
  the bocaux page.

No hero cards, no partners carousel, no social posts section on this page. The shared `Footer`
component is included with `variant="gray"` to match the grey background of `CatalogueCoffrets`
above it.

---

## Naming Conventions

| Scope | Name | Notes |
|---|---|---|
| Page URL | `/coffrets` | |
| Page file | `coffrets.astro` | |
| Intro section | "Coffrets Gourmands" | Component: `CoffretsGourmands.astro`, Strapi type: `coffrets-gourmands` |
| Cards section | "Catalogue Coffrets" | Component: `CatalogueCoffrets.astro`, CSS class: `.catalogue-coffrets`, Strapi type: `catalogue-coffrets` |
| Strapi component | "Type" | Category: `coffrets`, file: `coffrets/type.json`, used as `coffrets.type` |

Note: the Strapi plural API ID for `coffrets-gourmands` is `coffrets-gourmands-list` and for
`catalogue-coffrets` is `catalogue-coffrets-list` — these are the values the shop owner entered
when creating the types. This does not affect the REST API endpoints, which use the singular ID.

**Important:** `CatalogueCoffrets` is intentionally not shared with `LeMenu` on the bocaux page.
The two card sections are structurally identical today, but the shop owner may want to evolve
them independently. Keeping them separate avoids coupling.

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
See `context/front_page_bocaux.md` for its full spec.

---

## Page File: `frontend/src/pages/coffrets.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import CoffretsGourmands from '../components/CoffretsGourmands.astro';
import CatalogueCoffrets from '../components/CatalogueCoffrets.astro';
import Footer from '../components/Footer.astro';
---

<Layout title="Coffrets Gourmands — Verre et Papilles">
  <Header />
  <main>
    <CoffretsGourmands />
    <CatalogueCoffrets />
  </main>
  <Footer variant="gray" />
</Layout>
```

---

## Strapi Content Types

Both are **Single Types** with `draftAndPublish: true`.

### `coffrets-gourmands` (display name: "Coffrets Gourmands")

| Field | Type | Notes |
|---|---|---|
| `Titre` | Short text | Section heading, fallback: "Coffrets Gourmands" |
| `Texte` | Rich text (Blocks) | Body paragraphs |
| `Mise_en_valeur` | Short text | Italic call-to-action line (optional) |
| `Photo` | Media — single image | Section photo |
| `Description_photo` | Short text | Alt text |

API endpoint: `GET /api/coffrets-gourmands?populate=Photo`

### `catalogue-coffrets` (display name: "Catalogue Coffrets")

| Field | Type | Notes |
|---|---|---|
| `Titre_section` | Rich text (Blocks) | Section heading |
| `Coffret` | Component — repeatable | List of coffrets (coffrets.type) |
| `Informations_complementaires` | Rich text (Blocks) | Optional footer text rendered below the cards |

API endpoint: `GET /api/catalogue-coffrets?populate[Coffret][populate]=Photo`
(Scalar and Blocks fields are returned by default — no extra `populate` needed for
`Informations_complementaires`.)

### Component: `coffrets/type` (display name: "Type")

| Field | Type | Notes |
|---|---|---|
| `Type` | Short text | Card label displayed above the card |
| `Infos` | Short text | Optional card label displayed below the card; same style as `Type` |
| `Photo` | Media — single image | Photo displayed directly on the card |
| `Description_photo` | Short text | Alt text for the photo |

Note: a `Texte` (Rich text) field exists in Strapi but is not rendered — cards show only the
photo, with no text face or flip interaction.

### Strapi permissions

Settings → Users & Permissions → Roles → Public: enable `find` on both `coffrets-gourmands` and
`catalogue-coffrets`.

---

## Component: `CoffretsGourmands.astro`

Thin wrapper around `PhotoTextSection.astro`. Fetches from Strapi, passes props, renders nothing
if Strapi is unavailable (graceful fallback via `fetchStrapiData`).

```astro
---
import { fetchStrapiData, buildPhotoUrl, blocksToHtml } from '../lib/strapi';
import PhotoTextSection from './PhotoTextSection.astro';

const data = await fetchStrapiData('/api/coffrets-gourmands?populate=Photo');

const titre        = data?.Titre            ?? 'Coffrets Gourmands';
const texteHtml    = data?.Texte            ? blocksToHtml(data.Texte) : '';
const miseEnValeur = data?.Mise_en_valeur   ?? '';
const photoUrl     = buildPhotoUrl(data?.Photo);
const photoAlt     = data?.Description_photo ?? '';
const photoWidth   = data?.Photo?.width;
const photoHeight  = data?.Photo?.height;
---

<PhotoTextSection {titre} {texteHtml} {miseEnValeur} {photoUrl} {photoAlt} {photoWidth} {photoHeight} withOffset />
```

The `withOffset` prop adds `padding-top: calc(4rem + 24px)` to clear the banner logo overflow
(logo has `margin-bottom: -80px`; the extra 24px gives comfortable clearance). Same behaviour
as `LesBocaux.astro` and `LeCrottin.astro`.

---

## Component: `CatalogueCoffrets.astro`

Grey background section. Identical in structure and behaviour to `LeMenu.astro` on the bocaux
page — see `context/front_page_bocaux.md` for full styling and interaction documentation. The
differences are:

| | `LeMenu` | `CatalogueCoffrets` |
|---|---|---|
| Strapi endpoint | `/api/le-menu?populate[Carte][populate]=Photo` | `/api/catalogue-coffrets?populate[Coffret][populate]=Photo` |
| Repeatable field | `data?.Carte` | `data?.Coffret` |
| Label above card | `carte.Etape` | `carte.Type` |
| Label below card | `carte.Infos` (optional) | `carte.Infos` (optional) |
| Section footer | `Informations_complementaires` (optional) | `Informations_complementaires` (optional) |
| Card content | Text face + photo face (flip interaction) | Photo only — no text face, no interaction |
| Root CSS class | `.le-menu` | `.catalogue-coffrets` |

All JS querySelector selectors use `.catalogue-coffrets` as scope prefix.

### Structure
```
<section.catalogue-coffrets>      — grey background, padding 4rem 2rem
  <div.section-header>            — max-width 900px, centered, text-align center
    <Fragment set:html />          Titre_section blocks
  <div.cards-container>           — max-width 62rem, flex row, gap 4rem, flex-wrap, centered
    <div.card-wrapper> × n        — flex column, align-items center, gap 0.6rem
      <span.card-label>           Type field (label above the card, optional)
      <div.card-inner>            — 275×315px, border-radius 0.75rem, overflow hidden, cursor pointer
        <Image.card-photo>        — fills card-inner, object-fit cover
      <span.card-label>           Infos field (label below the card, optional)
  <div.section-footer>            — max-width 900px, centered (optional)
    <Fragment set:html />          Informations_complementaires blocks
<dialog#coffret-lightbox>         — fullscreen lightbox, 90vw × 90vh, dismiss on click
  <img#coffret-lightbox-img>
```

### Card Behaviour

Cards are static — photo displayed directly, no text face, no flip animation, no JavaScript.
The `card-inner` uses `overflow: hidden` with `border-radius` to clip the image to the card
shape.

---

## Navigation Links

The coffrets page is linked from two places in the existing `Header` component:

- **Sticky nav** (`Header.astro`): `<a href="/coffrets" class="navbar-link">Les coffrets</a>`
- **Hero card** (`HeroCircles.astro`): the third circle card (gift box SVG icon), `href="/coffrets"`

Both were previously placeholders (`href="#coffrets"` and `href="/"` respectively).

---

## CSS Variables Referenced

- `--color-white` — `PhotoTextSection` background
- `--color-text` — `PhotoTextSection` h2
- `--color-orange-dark` — `.highlight` text in `PhotoTextSection`
- `--color-gray-bg` — `CatalogueCoffrets` background
- `--color-orange` — card front background
- `--font-heading` — card label font (Crimson, bold italic)
- `--font-body` — body text (Glacial Indifference, via global rule)

---

## Key Technical Decisions

- **`CoffretsGourmands` is a 14-line wrapper** — all layout logic lives in `PhotoTextSection.astro`,
  shared with `NotreHistoire`, `LesBocaux`, and `LeCrottin`.
- **`CatalogueCoffrets` is not extracted into a shared component with `LeMenu`** — the two card
  sections are structurally identical today but the shop owner may want to evolve them
  independently (different card counts, different sizing, etc.). Coupling them via a shared
  component would complicate independent changes.
- **Strapi component named `coffrets.type`** (display name "Type") — the repeatable field on
  `catalogue-coffrets` is `Coffret`. This naming keeps the Strapi UI unambiguous for the shop
  owner: each entry in the list is "a coffret", and the card label field is "the type" of coffret.
- **No JavaScript** in `CoffretsGourmands` — purely static.
- **Client-side date injection** in `CatalogueCoffrets` — same pattern as `LeMenu`, handles
  `{{date}}` in `Titre_section` without a daily rebuild.
