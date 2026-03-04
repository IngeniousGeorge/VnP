# Backend Setup — Strapi CMS

## Overview

Strapi v5 runs as a local Node.js process during development. In production it is deployed to Railway with a PostgreSQL database. The Astro frontend fetches content from the Strapi REST API **at build time** (SSG), producing fully static HTML. When content changes in Strapi, a Netlify build hook triggers a site rebuild.

---

## Local Setup

Run from the project root (`verre_et_papilles/`):

```bash
npx create-strapi-app@latest backend --quickstart
```

- Choose **TypeScript**
- Do not initialize a git repo (the project already has one)
- Do not start with example data

Start the dev server:

```bash
cd backend && npm run develop
```

Admin panel: `http://localhost:1337/admin`

---

## Admin Configuration

### French locale

By default only English is available in the admin UI. To add French, create `backend/src/admin/app.ts`:

```typescript
import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['fr'],
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
```

Restart Strapi. French now appears in the user profile language dropdown (Settings → Profile → Interface language).

---

## Content Types

All CMS-editable page sections are created as **Single Types** (one instance, not a collection) in the Content-Type Builder.

> Field names use French so the shop owner can identify them in the admin panel.

### Notre Histoire

| Field | Type |
|---|---|
| `Titre` | Short text |
| `Texte` | Rich Text (Blocks) |
| `Mise_en_valeur` | Short text |
| `Photo` | Media (single) |
| `Description_photo` | Short text |

---

### La Boutique

| Field | Type |
|---|---|
| `Titre` | Short text |
| `Texte` | Rich Text (Blocks) |
| `Mise_en_valeur` | Short text (optional) |
| `Photo` | Media (single) |
| `Description_photo` | Short text |

---

## Public API Permissions

By default all API endpoints require authentication. To allow the Astro build to fetch content without a token:

1. Settings → Users & Permissions Plugin → Roles → **Public**
2. Expand the relevant content type (e.g. **Notre-histoire**)
3. Check **find**
4. Save

---

## API Endpoints

Strapi v5 REST API. All responses have the shape `{ data: { ...fields }, meta: {} }`.

### Notre Histoire

```
GET /api/notre-histoire?populate=Photo
```

Example response (abbreviated):
```json
{
  "data": {
    "Titre": "Notre histoire",
    "Texte": [
      { "type": "paragraph", "children": [{ "type": "text", "text": "..." }] }
    ],
    "Mise_en_valeur": "...",
    "Description_photo": "Anne-Marie et Fabrice Sorin",
    "Photo": {
      "url": "/uploads/owners_65c9f5fed9.jpg",
      "width": 800,
      "height": 984
    }
  }
}
```

**Note:** Photo `url` is a relative path. Prepend `STRAPI_URL` to get the full URL.

### La Boutique

```
GET /api/la-boutique?populate=Photo
```

### Strapi v5 specifics

- Responses include `documentId` (new in v5) alongside `id`
- Rich Text fields use the **Blocks** format (structured JSON), not Markdown
- Field names preserve the capitalisation used when creating them in the UI

---

## Astro Integration

### Environment variable

`frontend/.env`:
```
STRAPI_URL=http://localhost:1337
```

Set the same variable in Netlify (Site settings → Environment variables) pointing to the Railway deployment URL for production builds.

### Shared Strapi utilities

`frontend/src/lib/strapi.ts` — shared across all CMS-connected components:

```typescript
export const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';

type StrapiBlock = {
  type: string;
  children: { type: string; text: string }[];
};

export function blocksToHtml(blocks: StrapiBlock[]): string {
  return blocks
    .map(block => {
      if (block.type === 'paragraph') {
        const text = block.children.map(child => child.text).join('');
        if (!text.trim()) return '';
        return `<p>${text}</p>`;
      }
      return '';
    })
    .filter(Boolean)
    .join('');
}
```

### Fetching in a component

```typescript
import { STRAPI_URL, blocksToHtml } from '../lib/strapi';

let data;
try {
  const res = await fetch(`${STRAPI_URL}/api/notre-histoire?populate=Photo`);
  const json = await res.json();
  data = json.data;
} catch (e) {
  console.error('Failed to fetch Notre Histoire from Strapi:', e);
}
```

### Styling dynamically injected HTML

Astro's scoped styles do not apply to elements rendered via `set:html`. Use `:global()` scoped to a parent class to avoid style leakage:

```css
.content :global(p) {
  margin-bottom: 1.4rem;
  line-height: 1.8;
}
```

Astro compiles this to `.content[data-astro-cid-xxxx] p { ... }` — a standard descendant selector, consistent across all browsers.

---

## Production Deployment (Railway)

_Not yet done — placeholder for when we deploy._

- Push `backend/` to GitHub
- Connect repo to Railway, set root directory to `backend/`
- Add environment variables: `DATABASE_URL` (Railway provides this for PostgreSQL), `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`
- Set `STRAPI_URL` in Netlify to the Railway app URL
- Configure a Netlify build hook in Strapi admin (Settings → Webhooks) to trigger a site rebuild on content publish
