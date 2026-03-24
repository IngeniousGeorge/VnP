# Main Content Sections — Implementation Prompt

## Overview

Two CMS-driven content sections between the hero navigation cards and the partners carousel.
Both are thin wrappers around the shared `PhotoTextSection.astro` component. On mobile, both
stack vertically with text above image.

- **Notre Histoire** — white background, text on the left, photo on the right (`reversed`).
  Introduces the shop owners.
- **La Boutique** — white background, photo on the left, text on the right (default layout).
  Describes the product range.

## Source Files

- **Owners photo**: `misc/elements/owners.jpeg` (2998x3689 JPEG, portrait photo of Anne-Marie and Fabrice)
- **Boutique photo**: Source photo of the shop interior (already processed)

## Image Processing

### Owners photo (`owners.jpeg`)
Resize to 800px wide and convert to JPEG at 80% quality:
```
convert <input> -resize 800x -quality 80 -strip <output>
```
Save to `frontend/src/assets/images/owners.jpg`

### Boutique photo
Already present at `frontend/src/assets/images/boutique.jpg` (800x1067 JPEG).

Astro's `<Image />` handles further optimization (WebP, resizing) at build time.

---

## Component: `NotreHistoire.astro`

A thin wrapper around `PhotoTextSection`. Fetches from `GET /api/notre-histoire?populate=Photo`.

```astro
<PhotoTextSection {titre} {texteHtml} {miseEnValeur} {photoUrl} {photoAlt} {photoWidth} {photoHeight} darkBg={true} reversed />
```

- `reversed` — photo on the right, text on the left
- `darkBg={true}` — grey background (`--color-gray-bg`) with white text
- `photoWidth` / `photoHeight` — passed from `data?.Photo?.width` / `data?.Photo?.height` for landscape detection
- Fallback title: `'Notre histoire'`

---

## Component: `LaBoutique.astro`

A thin wrapper around `PhotoTextSection`. Fetches from `GET /api/la-boutique?populate=Photo`.

```astro
<PhotoTextSection {titre} {texteHtml} {miseEnValeur} {photoUrl} {photoAlt} {photoWidth} {photoHeight} />
```

- Default layout — photo on the left, text on the right
- `photoWidth` / `photoHeight` — passed from `data?.Photo?.width` / `data?.Photo?.height` for landscape detection
- Fallback title: `'La boutique'`

---

## Shared Layout Pattern

Both sections delegate all layout and styling to `PhotoTextSection.astro`
(see `context/front_page_crottin.md` for the full `PhotoTextSection` spec).

| | Photo position | Text position | `reversed` prop |
|---|---|---|---|
| Notre Histoire | Right | Left | `true` |
| La Boutique | Left | Right | `false` (default) |

This alternating layout creates visual rhythm on the page.

---

## CSS Variables Referenced

All styling is handled by `PhotoTextSection`. See its spec for details.

- `--color-white` — section background
- `--color-text` — h2 and body text
- `--color-orange-dark` — `.highlight` text
- `--font-heading` — h2 font (Crimson)
- `--font-body` — body text (Glacial Indifference)

---

## Key Technical Decisions

- **Both components are thin wrappers around `PhotoTextSection`** — all layout logic is
  centralised. The only section-specific things are the API endpoint, the fallback string,
  and the `reversed` prop.
- **`reversed` prop** on `PhotoTextSection` is implemented via `order: 2` on `.image-container`
  in CSS grid. The mobile `order: -1` on `.content` takes precedence on small screens, so
  both variants collapse to text-above-image on mobile without extra rules.
- **No JavaScript** — both sections are purely static.
