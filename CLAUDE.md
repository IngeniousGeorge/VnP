# Verre et Papilles

Boutique website for an artisanal food & wine shop (epicerie fine) in Craon, France.

## Project Structure

```
frontend/              — Astro static site (deployed on Netlify)
  src/
    assets/images/     — Optimized images (processed from misc/, built by Astro)
    components/        — Astro components (Header, HeroCircles, NotreHistoire, LaBoutique, PartnersCarousel, NosActualites, Footer)
    layouts/           — Layout.astro (global styles, fonts, CSS variables)
    pages/             — index.astro (home page)
  public/fonts/        — Self-hosted web fonts (woff2)
context/               — Implementation prompts for AI agents (per-section specs)
misc/                  — Raw source assets (large photos, logos, design files) — gitignored
```

## Tech Stack

- **Frontend**: Astro 4 (static HTML), deployed on Netlify
- **Backend**: Strapi on Railway (Node.js + PostgreSQL) — not yet implemented
- **Media**: Cloudinary for CMS-uploaded images; static assets in `frontend/src/assets/images/`
- **Fonts**: Self-hosted in `frontend/public/fonts/` (Glacial Indifference, Crimson, Dancing Script)

## Commands

- `npm run dev` — Start dev server (from `frontend/`, runs on http://localhost:4321)
- `npm run build` — Production build
- `npm run preview` — Preview production build

## CSS Variables (defined in Layout.astro)

- `--color-orange: #F29D37` — Primary brand color (buttons, accents, card backgrounds)
- `--color-orange-dark: #D4922F` — Darker orange for highlights
- `--color-gray-bg: #6B7280` — Section backgrounds (e.g. La Boutique)
- `--color-dark-bg: #374151` — Dark backgrounds
- `--color-white: #FFFFFF`
- `--color-warm-bg: #FAF0EE` — Warm beige section backgrounds (Notre Histoire, Hero Cards, Partenaires)
- `--color-text: #1F2937` — Body text color
- `--font-heading: 'Crimson', serif` — Headings (bold italic)
- `--font-body: 'Glacial Indifference', sans-serif` — Body text

## Conventions

- **Language**: All UI text is in French
- **Images**: Raw assets go in `misc/`, processed versions in `frontend/src/assets/images/`. Use ImageMagick for processing (resize, crop, background removal). Astro's `<Image />` handles build-time optimization.
- **Fonts**: Self-hosted woff2 files, no external CDN. Google Fonts used only as a source for downloading font files.
- **Components**: One `.astro` file per section. Scoped `<style>` blocks (not global), except for Layout.astro which uses `is:global`.
- **Implementation specs**: Detailed per-section prompts live in `context/*.md`. Before modifying or building a section, always read the corresponding spec first (e.g. `context/front_banner.md` for the header, `context/front_hero_navigation_cards.md` for the circle cards). These contain exact image processing commands, sizing, colors, font setup, and design decisions.
- **Hover effects**: Prefer subtle shadow transitions over scale transforms on interactive elements.
- **No external dependencies** beyond Astro itself — inline SVGs for icons, no icon libraries.
