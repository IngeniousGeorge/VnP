# Footer — Implementation Prompt

## Overview

A thin footer bar present on every page of the site. It contains a single row of navigation links
(mirroring the sticky navbar, minus social icons) and a developer attribution line below. The
current page is automatically omitted from the link row. The background colour adapts to match
the last section above it on each page, so the footer blends seamlessly rather than introducing
a new colour break.

---

## Naming Conventions

| Scope | Name | Notes |
|---|---|---|
| Component file | `Footer.astro` | |
| CSS root class | `.footer` | |
| Variant modifier classes | `.footer--dark`, `.footer--gray`, `.footer--light` | Applied via `class` attribute |

---

## Component: `Footer.astro`

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'dark' \| 'gray' \| 'light'` | `'dark'` | Controls background and text colours |

### Structure

```
<footer.footer.footer--{variant}>
  <div.container>
    <nav.footer-nav>
      <a.footer-link>         first visible link
      <span.footer-sep>       "|"
      <a.footer-link>         next visible link
      … (repeated for each link not matching the current page)
    <p.footer-credit>
      "Site réalisé par "
      <a.footer-credit-link>  "Ingenious George" → https://github.com/IngeniousGeorge
```

### Full link set (in order)

| Label | `href` |
|---|---|
| Verre & Papilles | `/` |
| Les bocaux | `/bocaux` |
| Le crottin | `/crottin` |
| Les coffrets | `/coffrets` |
| Contact & infos | `/contact` |

The link corresponding to the current page is filtered out at build time — see *Current-page
filtering* below.

---

## Styling

**Section:**
- `.footer`: `padding: 1rem`, `border-top: 1px solid` (colour depends on variant — see Theming)

**Container:**
- `.container`: `max-width: 1100px`, `margin: 0 auto`, `text-align: center`

**Nav row:**
- `.footer-nav`: `display: flex`, `justify-content: center`, `align-items: center`,
  `flex-wrap: wrap`, `gap: 0 0.6rem`, `margin-bottom: 0.4rem`

**Links:**
- `.footer-link`: `font-family: var(--font-body)`, `font-size: 0.875rem`, `text-decoration: none`,
  `transition: color 0.2s`
- Hover colour depends on variant — see Theming

**Separators:**
- `.footer-sep`: `font-size: 0.875rem`, `user-select: none`
- Colour depends on variant — see Theming

**Attribution:**
- `.footer-credit`: `font-size: 0.75rem`, `margin: 0`
- `.footer-credit-link`: `text-decoration: none`, `transition: color 0.2s`

### Mobile

No dedicated breakpoint. `flex-wrap: wrap` on `.footer-nav` allows the link row to wrap
naturally on small screens.

---

## Theming

Three modifier classes cover the three background contexts that appear across the site. Apply the
class corresponding to the background colour of the last section above the footer on each page.

### `.footer--dark` (home page, crottin page)

Background matches `var(--color-dark-bg)` (`#374151`).

| Element | Value |
|---|---|
| `background-color` | `var(--color-dark-bg)` |
| `border-top-color` | `rgba(255, 255, 255, 0.1)` |
| `.footer-link` color | `rgba(255, 255, 255, 0.7)` |
| `.footer-link:hover` color | `var(--color-orange)` |
| `.footer-sep` color | `rgba(255, 255, 255, 0.25)` |
| `.footer-credit` color | `rgba(255, 255, 255, 0.4)` |
| `.footer-credit-link` color | `rgba(255, 255, 255, 0.55)` |
| `.footer-credit-link:hover` color | `var(--color-white)` |

### `.footer--gray` (bocaux page, coffrets page)

Background matches `var(--color-gray-bg)` (`#6B7280`).

| Element | Value |
|---|---|
| `background-color` | `var(--color-gray-bg)` |
| `border-top-color` | `rgba(255, 255, 255, 0.15)` |
| `.footer-link` color | `rgba(255, 255, 255, 0.7)` |
| `.footer-link:hover` color | `var(--color-orange)` |
| `.footer-sep` color | `rgba(255, 255, 255, 0.3)` |
| `.footer-credit` color | `rgba(255, 255, 255, 0.45)` |
| `.footer-credit-link` color | `rgba(255, 255, 255, 0.6)` |
| `.footer-credit-link:hover` color | `var(--color-white)` |

### `.footer--light` (contact page)

Background is white.

| Element | Value |
|---|---|
| `background-color` | `var(--color-white)` |
| `border-top-color` | `rgba(0, 0, 0, 0.08)` |
| `.footer-link` color | `var(--color-text)` |
| `.footer-link:hover` color | `var(--color-orange-dark)` |
| `.footer-sep` color | `var(--color-separator)` |
| `.footer-credit` color | `rgba(0, 0, 0, 0.4)` |
| `.footer-credit-link` color | `rgba(0, 0, 0, 0.55)` |
| `.footer-credit-link:hover` color | `var(--color-text)` |

Note: the light variant uses `--color-orange-dark` (not `--color-orange`) for link hover — better
contrast against white.

---

## Page assignments

| Page | Last section background | `variant` |
|---|---|---|
| `/` (index) | `NosActualites` — `var(--color-dark-bg)` | `dark` |
| `/bocaux` | `LeMenu` — `var(--color-gray-bg)` | `gray` |
| `/crottin` | `LesRevendeurs` — `var(--color-dark-bg)` | `dark` |
| `/coffrets` | `CatalogueCoffrets` — `var(--color-gray-bg)` | `gray` |
| `/contact` | `Contact` — `var(--color-white)` | `light` |

When a new page is added, choose the variant that matches its last section's background.

---

## Current-page filtering

`Astro.url.pathname` is available in all `.astro` components at build time (static generation).
The footer reads it directly — no prop needed from the page.

```typescript
const rawPath = Astro.url.pathname;
const pathname = rawPath === '/' ? '/' : rawPath.replace(/\/$/, '');

const allLinks = [
  { label: 'Verre & Papilles', href: '/' },
  { label: 'Les bocaux',       href: '/bocaux' },
  { label: 'Le crottin',       href: '/crottin' },
  { label: 'Les coffrets',     href: '/coffrets' },
  { label: 'Contact & infos',  href: '/contact' },
];

const links = allLinks.filter(l => l.href !== pathname);
```

The trailing-slash normalisation (`rawPath.replace(/\/$/, '')`) handles any Astro trailing-slash
configuration while preserving `/` as-is for the home page.

Separators are rendered by index (`i > 0`) rather than as static HTML between each link — this
keeps the separator logic correct regardless of how many links are filtered out.

---

## Usage in page files

```astro
---
import Footer from '../components/Footer.astro';
---
...
<Footer variant="gray" />
```

The component is placed outside `<main>`, directly inside the `<Layout>` wrapper, after
the closing `</main>` tag.

---

## CSS Variables Referenced

- `--color-dark-bg` — dark variant background
- `--color-gray-bg` — gray variant background
- `--color-white` — light variant background; dark/gray variant hover text
- `--color-text` — light variant link colour, hover text
- `--color-orange` — dark/gray variant link hover colour
- `--color-orange-dark` — light variant link hover colour
- `--color-separator` — light variant separator colour
- `--font-body` — link and separator font (Glacial Indifference)

---

## Key Technical Decisions

- **`variant` prop with CSS modifier classes** — all colour logic lives in CSS, the prop simply
  selects the right class. Adding a fourth variant in future requires only a new CSS block and
  a new prop value; no JS or conditional rendering needed.
- **`var(--color-dark-bg)` / `var(--color-gray-bg)` in CSS** — the footer background values use
  the same CSS variables as the section components above them. Changing a brand colour in
  `Layout.astro` propagates to both the section and the matching footer automatically.
- **Current page filtered at build time** — Astro's static generation knows the pathname for each
  page, so the redundant link is simply absent from the rendered HTML. No client-side JS, no
  `aria-current` toggling needed.
- **Link array + index-based separators** — iterating over a data array and rendering `|` before
  every item except the first is more robust than placing static separator spans between hardcoded
  links, which would require careful conditional logic around each one.
- **`font-family: var(--font-body)`** on links — matches the body text register of
  `PhotoTextSection` paragraphs, keeping the footer visually lightweight. The sticky navbar uses
  Bellefair (display register); the footer's smaller, quieter role warrants the body font instead.
- **`font-size: 0.875rem`** on links — slightly smaller than body text (1rem) to reinforce the
  footer's secondary role. The attribution line is smaller still (0.75rem).
- **No logo** — the sticky navbar includes the shop logo; a footer logo would feel heavy for a
  single thin bar. The "Verre & Papilles" text link serves as the home link instead.
- **No social icons** — social links are already prominent in the `NosActualites` CTA card (home
  page) and in the banner nav. Repeating them in the footer would add noise without value.
- **`flex-wrap: wrap` instead of a mobile breakpoint** — the link row is short enough that
  wrapping handles small screens without needing an explicit `@media` rule.
- **Developer attribution kept** — the credit line is a personal touch; it stays on every page
  in a visually subordinate position (smaller font, muted colour).
