# Stack

- Strapi on Railway.app:
    - node.js server
    - SQLite DB (local) / PostgreSQL (production on Railway)
    - admin panel
    - API for frontend
    - Persistent volume on Railway for uploaded media (`/public/uploads`)
    - GitHub repo for codebase
- Astro frontend on Netlify:
    - Static HTML pages

Codebase: Hosted on GitHub.
Frontend (Netlify): Connects to GitHub. Hosting is Free.
Backend App (Railway): Connects to GitHub. Hosts the Strapi Node.js app and the database. Cost: ~$5-10/mo.
Media: Strapi's built-in media library, stored on a Railway persistent volume. No Cloudinary.

## Image optimization strategy

Shop owners upload images through the Strapi admin UI without any prep needed.
Astro's `<Image>` component with `inferSize` fetches and optimizes remote Strapi images
at Netlify build time — resizing and converting to WebP. Visitors receive optimized images;
no runtime processing.

To allow Astro to fetch remote images, the Railway hostname must be declared in
`frontend/astro.config.mjs` under `image.remotePatterns`. Localhost (port 1337) is already
configured for local development.

A Strapi webhook triggering a Netlify build on publish ensures content changes go live
automatically without manual deploys.

## Static assets

Static assets (logo, banner, decorative images) live in `frontend/src/assets/images/` and
are processed with ImageMagick before committing. Astro's `<Image>` handles further
build-time optimization for these too.
