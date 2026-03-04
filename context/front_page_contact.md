# Contact Page — Implementation Prompt

## Overview

A dedicated page at `/contact` for the shop's contact information. It shares the same `Header`
component as the home page and contains one section:

- **Contact** — white background, centered heading, two-column layout: contact info on the left,
  Google Maps iframe on the right. CMS-driven. Includes the shared `Footer` component.

No hero cards, no partners carousel, no social posts section on this page.

---

## Naming Conventions

| Scope | Name | Notes |
|---|---|---|
| Page URL | `/contact` | |
| Page file | `contact.astro` | |
| Section | "Nous contacter" | Component: `Contact.astro`, CSS class: `.contact`, Strapi type: `contact-info` |

Note: the Strapi plural API ID for `contact-info` is `contact-info-list` — this is the value
the shop owner entered when creating the type. This does not affect the REST API endpoint, which
uses the singular ID.

---

## Shared Utilities (already in codebase)

All CMS fetching goes through `frontend/src/lib/strapi.ts`:

```typescript
// Fetches any Strapi endpoint; returns json.data or null on error
export async function fetchStrapiData(endpoint: string)

// Converts Strapi Blocks rich text to HTML string
export function blocksToHtml(blocks: StrapiBlock[]): string
```

Note: `buildPhotoUrl` is not used on this page (no photos).

---

## Page File: `frontend/src/pages/contact.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Contact from '../components/Contact.astro';
import Footer from '../components/Footer.astro';
---

<Layout title="Contact — Verre et Papilles">
  <Header />
  <main>
    <Contact />
  </main>
  <Footer />
</Layout>
```

This is the only inner page that includes `Footer`. It is the natural end of the navigation flow.

---

## Strapi Content Type

**Single Type** with `draftAndPublish: true`.

### `contact-info` (display name: "Contact Info")

| Field | Type | Notes |
|---|---|---|
| `Titre` | Short text | Section heading, fallback: "Nous contacter" |
| `Intro` | Rich text (Blocks) | Optional intro paragraph displayed below the heading |
| `Horaires` | Rich text (Blocks) | Opening hours — displayed first in the info block |
| `Adresse` | Rich text (Blocks) | Shop address — allows multiline formatting |
| `Telephone` | Short text | Phone number (e.g. `+33 2 43 06 XX XX`) |
| `Email` | Short text | Email address |
| `Lien_carte` | Short text | Google Maps embed URL (the `src` value from "Share → Embed a map") |

API endpoint: `GET /api/contact-info`

### Strapi permissions

Settings → Users & Permissions → Roles → Public: enable `find` on `contact-info`.

### Getting the Google Maps embed URL

1. Go to [maps.google.com](https://maps.google.com) and search for the shop's address
2. Click **Share** → **Embed a map** tab
3. Click **Copy HTML** — the result looks like `<iframe src="https://www.google.com/maps/embed?pb=..." ...>`
4. Extract just the `src` value (the full `https://...` URL)
5. Paste into the `Lien_carte` field in Strapi

---

## Component: `Contact.astro`

Fetches from Strapi and renders nothing for any field that is empty or unavailable (graceful
fallback via `fetchStrapiData`). No JavaScript — purely static.

### Structure

```
<section.contact>               — white background, withOffset padding
  <div.section-header>          — max-width 900px, centered
    <div.accent>                — orange rule 3rem × 2px
    <h2>                        Titre (fallback: "Nous contacter")
    <div.intro>                 Intro rich text (optional)
  <div.content>                 — max-width 1100px, grid 1fr 1fr, gap 3rem
    <div.info-block>
      <div.info-group>          Horaires (rich text)
      <div.info-group>          Adresse (rich text)
      <div.info-group>          Téléphone (tel: link)
      <div.info-group>          Email (mailto: link)
    <div.map-container>         Google Maps iframe (only if Lien_carte is set)
```

Info groups are ordered: hours → address → phone → email. Each group not rendered if its field
is empty. The last visible group has no bottom border (`:last-child` selector).

### Phone and email links

`Telephone` and `Email` are plain Short text fields in Strapi. The component wraps them in
clickable links on the frontend:

```astro
<a class="info-value info-link" href={`tel:${telephone}`}>{telephone}</a>
<a class="info-value info-link" href={`mailto:${email}`}>{email}</a>
```

Strapi stores the raw values; the frontend decides how to render them. Same pattern as `Lien`
in `LesRevendeurs`.

### Styling

**Section:**
- `.contact`: `background-color: var(--color-white)`, `padding: 4rem 2rem`,
  `padding-top: calc(4rem + 24px)` (banner logo offset — same as other inner pages)

**Section header:**
- `.section-header`: `max-width: 900px`, `margin: 0 auto 3rem`, `text-align: center`
- `.accent`: `width: 3rem`, `height: 2px`, `background-color: var(--color-orange)`, `margin: 0 auto 1.5rem`
- `h2`: `font-family: var(--font-heading)`, `font-style: italic`, `font-weight: 700`,
  `font-size: 2rem`, `color: var(--color-text)`
- `.intro :global(p)`: `line-height: 1.8`, `margin-bottom: 1rem`

**Content grid:**
- `.content`: `max-width: 1100px`, `display: grid`, `grid-template-columns: 1fr 1fr`,
  `gap: 3rem`, `align-items: start`
- `.content.no-map`: `grid-template-columns: 1fr`, `max-width: 600px` — applied when
  `Lien_carte` is not set, so the info block doesn't float in a half-width column

**Info groups:**
- `.info-group`: `padding-bottom: 1.5rem`, `margin-bottom: 1.5rem`,
  `border-bottom: 1px solid rgba(0,0,0,0.08)`
- `.info-group:last-child`: border and spacing removed
- `.info-label`: `font-family: var(--font-heading)`, `font-style: italic`, `font-size: 0.95rem`,
  `color: var(--color-orange-dark)`, `margin-bottom: 0.4rem`
- `.info-value`: `color: var(--color-text)`, `line-height: 1.7`
- `.info-value :global(p)`: `margin-bottom: 0.4rem`, `line-height: 1.7` — targets `<p>` tags
  injected by `blocksToHtml` inside rich text fields (`Horaires`, `Adresse`)
- `.info-link`: `display: block`, `text-decoration: none`, `transition: color 0.2s`
- `.info-link:hover`: `color: var(--color-orange)`

**Map:**
- `.map-container iframe`: `width: 100%`, `height: 459px`, `border-radius: 8px`, `display: block`
- Inline `style="border:0;"` on the `<iframe>` element — Google's standard recommendation
- `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"` — standard iframe attributes

### Mobile (max-width: 768px)

- `.content` collapses to `grid-template-columns: 1fr`, `gap: 2rem`
- `.map-container iframe`: `height: 328px`
- `h2`: `font-size: 1.75rem`

---

## Navigation Links

The contact page is linked from two places in the existing `Header` component (shared with all pages):

- **Banner nav** (`Header.astro`): `<a href="/contact" class="banner-nav-link banner-cta">Nous contacter</a>`
  — styled as the primary orange CTA button in the top-right of the banner
- **Sticky nav** (`Header.astro`): `<a href="/contact" class="navbar-link">Contact</a>`

Both links were already in place before this page was built.

---

## CSS Variables Referenced

- `--color-white` — section background
- `--color-text` — `h2`, `.info-value`, `.intro`
- `--color-orange` — `.accent` rule, `.info-link:hover`
- `--color-orange-dark` — `.info-label`
- `--font-heading` — `h2` (Crimson, bold italic), `.info-label` (Crimson, italic)
- `--font-body` — body text (Glacial Indifference, via global rule)

---

## Key Technical Decisions

- **Single section, no `PhotoTextSection`** — the contact page has no photo column. The layout
  (heading + two-column info/map grid) is specific enough that reusing `PhotoTextSection` would
  require fighting its assumptions. `Contact.astro` is self-contained.
- **`withOffset` hardcoded** — `PhotoTextSection` implements the offset via a `withOffset` prop.
  `Contact.astro` doesn't use `PhotoTextSection`, so `padding-top: calc(4rem + 24px)` is applied
  directly on `.contact`. Same effective result.
- **All fields optional** — every field renders conditionally. If Strapi is unreachable at build
  time, the page shows only the fallback heading "Nous contacter".
- **`no-map` modifier class** — when `Lien_carte` is not set, `class:list` adds `.no-map` to
  `.content`, collapsing the grid to a single centered column so the info block doesn't sit in a
  half-width void.
- **Rich text for `Adresse`** — allows the shop owner to format the address across multiple lines
  in the Strapi editor. Rendered via `blocksToHtml` + `set:html`, same as `Horaires`.
- **`Lien_carte` named for the shop owner** — the field name avoids technical jargon ("URL").
  The frontend variable is `urlCarte` for code clarity.
- **Footer on this page** — the contact page is the only inner page with `Footer`. It is the
  natural end of the site's navigation flow.
- **No JavaScript** — purely static.
