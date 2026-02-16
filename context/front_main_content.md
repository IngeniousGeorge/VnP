# Main Content Sections — Implementation Prompt

## Overview

Two content sections that sit between the hero navigation cards and the partners carousel. Both follow the same two-column grid layout pattern (text + photo), mirrored left-to-right. On mobile, they stack vertically with the image on top.

- **Notre Histoire** — white background, photo on the left, text on the right. Introduces the shop owners.
- **La Boutique** — grey background, text on the left, photo on the right. Describes the product range.

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

### Structure
```
<section.notre-histoire>              — white background, padding 4rem 2rem
  <div.container>                     — max-width 1100px, 2-column grid, 3rem gap
    <div.image-container>
      <Image owners.jpg />            — width 800, border-radius 8px
    <div.content>
      <h2>                            "Notre histoire"
      <p>                             Intro paragraph (Anne-Marie et Fabrice, sommelière/chef)
      <p>                             Commerce de proximité, épicerie fine
      <p>                             Plats cuisinés à emporter en bocaux
      <p.highlight>                   Italic call-to-action line
```

### Text Content
```
Gourmets et gourmands, **Anne-Marie et Fabrice Sorin** possèdent une double
expérience professionnelle, de **sommelière** et **chef de cuisine**.

Amoureux des vins et de gastronomie, ils ont tout naturellement créé un
**commerce de proximité** où vous pourrez découvrir des produits d'**épicerie
fine, vins et spiritueux**.

Le chef Fabrice vous propose également des **plats cuisinés à emporter**
conditionnés en bocaux.

*Commander les bocaux du jour, goûter et vous serez conquis !*
```

### Styling

- **Section**: `background-color: var(--color-white)`, `padding: 4rem 2rem`
- **Container**: `max-width: 1100px`, `display: grid`, `grid-template-columns: 1fr 1fr`, `gap: 3rem`, `align-items: center`
- **Photo**: `width: 100%`, `height: auto`, `border-radius: 8px`, `object-fit: cover`
- **Content**: `padding: 1rem`
- **h2**: `font-size: 2rem`, `color: var(--color-text)`, `margin-bottom: 1.5rem`, `font-weight: 400`
- **p**: `margin-bottom: 1rem`, `line-height: 1.8`, `text-align: justify`
- **strong**: `font-weight: 700`
- **`.highlight`**: `font-style: italic`, `color: var(--color-orange-dark)`, `margin-top: 1.5rem`

### Mobile (max-width: 768px)
- Grid collapses to single column
- Image moves above text via `order: -1` on `.image-container`
- h2 font size: `1.75rem`
- Gap: `2rem`

---

## Component: `LaBoutique.astro`

### Structure
```
<section.la-boutique>                 — grey background, white text, padding 4rem 2rem
  <div.container>                     — max-width 1100px, 2-column grid, 3rem gap
    <div.content>
      <h2>                            "La boutique"
      <p.subtitle>                    "Produits du terroir, de France et d'ailleurs"
      <p>                             Product range intro
      <p>                             Product list
      <p>                             Quality promise
      <p.brands-intro>                "Nos marques en épicerie fine :"
    <div.image-container>
      <Image boutique.jpg />          — width 800, border-radius 8px
```

### Text Content
```
**La boutique**
*Produits du terroir, de France et d'ailleurs*

Nous vous proposons un large choix de **spécialités régionales** et de
nombreuses idées cadeaux ou compositions à votre convenance pour **tous
les budgets**.

Terrines terre et mer, tartinades, épices, condiments, huiles, vinaigres,
produits Italiens et Espagnols, confitures, bonbons, chocolats, guimauves,
nougats, pâtes de fruits, biscuits, caramels, thés ...

Les maisons les plus réputées côtoient les petits producteurs afin de vous
garantir le plaisir des papilles.

**Nos marques en épicerie fine :**
```

### Styling

- **Section**: `background-color: var(--color-gray-bg)`, `color: var(--color-white)`, `padding: 4rem 2rem`
- **Container**: `max-width: 1100px`, `display: grid`, `grid-template-columns: 1fr 1fr`, `gap: 3rem`, `align-items: start`
- **Photo**: `width: 100%`, `height: auto`, `border-radius: 8px`, `object-fit: cover`
- **Content**: `padding: 1rem 0`
- **h2**: `font-size: 2rem`, `margin-bottom: 0.5rem`, `font-weight: 700`
- **`.subtitle`**: `font-style: italic`, `margin-bottom: 1.5rem`, `opacity: 0.9`
- **p**: `margin-bottom: 1rem`, `line-height: 1.8`, `text-align: justify`
- **strong**: `font-weight: 700`
- **`.brands-intro`**: `margin-top: 1.5rem`

### Mobile (max-width: 768px)
- Grid collapses to single column
- Image moves above text via `order: -1` on `.image-container`
- h2 font size: `1.75rem`
- Gap: `2rem`

---

## Shared Layout Pattern

Both sections use the same grid pattern but mirrored:

| | Left column | Right column | Background |
|---|---|---|---|
| Notre Histoire | Photo | Text | `var(--color-white)` |
| La Boutique | Text | Photo | `var(--color-gray-bg)` |

This alternating layout creates visual rhythm on the page. The grid column order handles the mirroring — no CSS `order` property needed on desktop.

## Differences Between the Two Sections

| Property | Notre Histoire | La Boutique |
|---|---|---|
| Background | white | `--color-gray-bg` (#6B7280) |
| Text color | default (`--color-text`) | `var(--color-white)` |
| h2 font-weight | 400 | 700 |
| h2 margin-bottom | 1.5rem | 0.5rem |
| Subtitle | none | italic, 0.9 opacity |
| Content padding | 1rem | 1rem 0 |
| Grid align-items | center | start |
| Closing element | `.highlight` (italic, orange-dark) | `.brands-intro` (bold) |

## CSS Variables Referenced

- `--color-white` — Notre Histoire background, La Boutique text
- `--color-text` — Notre Histoire text, h2 color
- `--color-gray-bg` — La Boutique background
- `--color-orange-dark` — highlight text in Notre Histoire
- `--font-heading` — h2 font (Crimson, via global rule)
- `--font-body` — body text (Glacial Indifference, via global rule)

## Key Technical Decisions

- **Two separate components** rather than a parameterized generic section — the content and styling differences are significant enough that a shared abstraction would add complexity without meaningful DRY benefit
- **CSS Grid** (not flexbox) for the two-column layout — grid handles equal-height columns and alignment more cleanly
- **`align-items: center`** for Notre Histoire (vertically centers shorter text next to taller photo), **`align-items: start`** for La Boutique (text is longer, top-alignment reads more naturally)
- **`text-align: justify`** on paragraphs for a polished, editorial feel consistent with the boutique brand
- **Image on top in mobile** (`order: -1`) for both sections — photo provides visual context before the text
- **No JavaScript** — these are pure static content sections
