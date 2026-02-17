# Social Posts (Nos Actualités) — Implementation Plan

## Overview

Display Facebook and Instagram posts from the shop's page on the website. Posts are synced from Meta's Graph API into Strapi for editorial control, then fetched by the Astro frontend at build time.

## Architecture

```
Meta Graph API  →  Strapi  →  Astro frontend
  (source)        (curation)    (display)
```

## 1. Meta Developer App Setup

- Create an app on developers.facebook.com using the existing Business Suite portfolio
- Request `pages_read_engagement` and `instagram_basic` permissions
- Go through app review (submit a screencast showing the use case — "display our own page's posts on our website")
- Generate a long-lived Page Access Token (~60 days)

## 2. Strapi: Data Model

A `FacebookPost` content type:

| Field | Type | Purpose |
|---|---|---|
| `postId` | String, unique | Meta post ID (dedup key) |
| `platform` | Enum: facebook, instagram | Source platform |
| `text` | Text | Post message |
| `imageUrl` | String | `full_picture` from the API |
| `image` | Media | Local copy (downloaded from URL) |
| `permalink` | String | Direct link to the original post |
| `publishedAt` | DateTime | Original post date |
| `visible` | Boolean, default true | Editorial toggle — hide without deleting |
| `sortOrder` | Integer | Manual ordering override (nullable, falls back to date) |

## 3. Strapi: Sync Service

A custom Strapi service (`src/api/facebook-post/services/sync.js`) that:

1. Calls `GET /{page-id}/posts?fields=message,created_time,full_picture,permalink_url&limit=20`
2. Optionally calls the Instagram endpoint too
3. For each post: upsert by `postId` (create if new, update if changed)
4. Downloads the image to Strapi's media library (Meta image URLs expire)
5. Logs the sync result

Triggered by:
- **Strapi cron job** (`config/cron-tasks.js`) — daily at 6am
- **Manual admin action** — a custom "Sync now" button in the Strapi admin panel

## 4. Strapi: Token Refresh

Meta long-lived tokens expire after ~60 days. Automated refresh:

- A cron job calls the token refresh endpoint every 30 days: `GET /oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={current-token}`
- Stores the new token in the database (a singleton `MetaConfig` content type or a dedicated settings table)
- Logs the refresh result and the new expiry date
- Alerts (email or admin notification) if the refresh fails, so manual intervention can happen before the token expires

## 5. Astro: Fetch from Strapi at Build Time

In `NosActualites.astro`, replace the hardcoded `posts` array:

```js
const res = await fetch(
  `${import.meta.env.STRAPI_URL}/api/facebook-posts?filters[visible]=true&sort=sortOrder:asc,publishedAt:desc&pagination[limit]=6&populate=image`
);
const { data } = await res.json();
```

The CTA card (link to Facebook page) stays hardcoded in the component.

## 6. Rebuild Trigger

When an editor publishes, hides, or reorders a post in Strapi, the site needs to rebuild:

- **Strapi webhook** → Netlify build hook (a single POST request triggers a redeploy)
- Configured on the `FacebookPost` content type: on create/update/delete → fire webhook

## Implementation Order

1. Strapi content type + manual entry (test the frontend integration without the API)
2. Astro fetches from Strapi instead of hardcoded data
3. Meta App setup + approval
4. Sync service + cron job + manual sync button
5. Token refresh cron job
6. Webhook for auto-rebuild

Steps 1–2 can be done immediately. Steps 3–4 depend on Meta's review timeline (usually a few days). Steps 5–6 are quick configuration tasks.

## Current State (Static Fallback)

Until the API pipeline is in place, the section uses 6 hardcoded posts with images cropped from Facebook screenshots (`frontend/src/assets/images/actu_*.jpg`). The carousel component (`NosActualites.astro`) is fully built and will only need its data source swapped from the hardcoded array to the Strapi fetch.
