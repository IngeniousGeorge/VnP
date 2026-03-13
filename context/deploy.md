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
