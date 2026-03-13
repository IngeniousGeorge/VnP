# Deployment

## Stack

- **Backend**: Strapi v5 on Railway (Node.js + PostgreSQL)
- **Frontend**: Astro 4 on Netlify (static site)
- **Order**: Railway first — Netlify needs the Railway URL as `STRAPI_URL`

## Pre-deployment checks

### Secrets

No secrets are committed to git. All config files (`server.ts`, `admin.ts`, `database.ts`) read exclusively from environment variables. `backend/.env` is gitignored. In production, secrets are entered directly into the Railway and Netlify dashboards.

### PostgreSQL driver

Add the `pg` package to the backend — it is not included by default:

```bash
cd backend && npm install pg
```

`backend/config/database.ts` already switches between SQLite (dev) and PostgreSQL (prod) via the `DATABASE_CLIENT` environment variable — no code changes needed.

---

## Railway (Strapi backend)

### Setup

1. Create a new Railway project → "Deploy from GitHub repo" → select the repo → set root directory to `backend/`
2. Add a PostgreSQL service: "New" → "Database" → "PostgreSQL"
3. Add environment variables on the Strapi service (generate secrets with `openssl rand -base64 32`):

```
NODE_ENV=production
HOST=0.0.0.0
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
APP_KEYS=<base64>,<base64>,<base64>,<base64>
API_TOKEN_SALT=<base64>
ADMIN_JWT_SECRET=<base64>
TRANSFER_TOKEN_SALT=<base64>
ENCRYPTION_KEY=<base64>
JWT_SECRET=<base64>
```

`APP_KEYS` requires 4 comma-separated values. `DATABASE_URL` references the PostgreSQL service directly — Railway resolves it at runtime.

4. Generate a public domain: service "Settings" → "Networking" → "Generate Domain"
5. Visit `https://<your-app>.railway.app/admin` to create the first admin account

### Persistent volume for media uploads

After the first successful deployment, attach a volume to the Strapi service via the Railway assistant chatbot or UI. Mount path: `/app/public/uploads`. This is Strapi's default uploads directory — media files will survive redeploys.

The trial plan caps volumes at 500MB, which is sufficient for a small shop.

### Build and start commands

Set these explicitly in Railway → service → Settings to ensure `strapi build` runs before `strapi start`:

- **Build Command**: `npm run build`
- **Start Command**: `npm run start`

---

## Content migration (local SQLite → production PostgreSQL)

Run from `backend/` with the local Strapi dev server running (`npm run develop` in a separate terminal).

### Step 1 — generate a transfer token

In the Railway Strapi admin: Settings → Transfer Tokens → Create new token (full access).

### Step 2 — transfer content

```bash
npx strapi transfer --to https://vnp-production.up.railway.app/admin --only content --force
```

### Step 3 — transfer config

Without this step the admin content manager will not display entries (the API works, but the UI does not).

```bash
npx strapi transfer --to https://vnp-production.up.railway.app/admin --only config --force
```

### Step 4 — upload media manually

File transfer to Railway is blocked because the filesystem outside the volume mount is read-only (Strapi cannot create its backup folder at `/app/public/`). Upload images directly through the Railway Strapi admin → Media Library, then re-link them to the relevant content entries.

Any Netlify build referencing a missing image will fail with `FailedToFetchRemoteImageDimensions` — this is the signal that an image needs to be re-uploaded.

---

## Netlify (Astro frontend)

### Setup

1. New site → "Import an existing project" → GitHub → select repo
2. Set **Base directory** to `frontend/`, **Build command** to `npm run build`, **Publish directory** to `frontend/dist`
3. Add environment variable: `STRAPI_URL=https://vnp-production.up.railway.app`
4. Deploy

### Strapi → Netlify build hook

Ensures the site rebuilds automatically when content is published in Strapi.

1. Netlify → Site settings → "Build & deploy" → "Build hooks" → add a hook named `strapi-publish` → copy the URL
2. Railway Strapi admin → Settings → Webhooks → add the Netlify URL, trigger on **Entry: Publish** and **Entry: Unpublish**
