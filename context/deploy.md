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
