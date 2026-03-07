# Social Posts (Nos Actualités) — Implementation Plan

## Overview

Display Facebook posts from the shop's page on the website. Posts are synced from Meta's Graph API into Strapi for editorial control, then fetched by the Astro frontend at build time.

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

Until the API pipeline is in place, the section uses 6 hardcoded posts with images cropped from Facebook screenshots (`frontend/src/assets/images/actu_*.jpg`). The component (`NosActualites.astro`) is fully built and will only need its data source swapped.

### Component: `NosActualites.astro`

#### Structure
```
<section.nos-actualites>            — dark background (#374151), padding 4rem 2rem
  <h2.actu-title>                   — "Nos actualités", centered, white
  <div.actu-carousel>               — max-width 1100px, flex row
    <button.actu-btn--prev>         — orange chevron, disabled at start
    <div.actu-viewport>             — overflow: hidden
      <div.actu-track>              — flex row, translateX via JS
        <article.actu-card> × 6    — each 33.333% width (100% on mobile)
        <article.actu-card--cta>   — last card: Facebook + Instagram follow CTAs
    <button.actu-btn--next>         — orange chevron
```

#### Post Card Structure
Each post card has three stacked sections (border-radius 8px top and bottom):
1. **Header**: white background, Facebook icon + page name + date
2. **Image**: `aspect-ratio: 4/3`, `object-fit: cover`
3. **Body**: white background, truncated text (3 lines), "Voir sur Facebook" link

#### CTA Card
The last card (`.actu-card--cta`) has two stacked halves:
- **Facebook half**: `background-color: var(--color-facebook)`, white icon + "Retrouvez-nous sur Facebook" + "Suivez-nous" button
- **Instagram half**: `background: var(--gradient-instagram)`, white Instagram icon + "Ou sur Instagram" + "Suivez-nous" button

#### External Link Icon (Deduplication)
The external-link SVG icon appears in three places (post card link, Facebook CTA button, Instagram CTA button). Define it once as a string in the frontmatter and reuse via `<Fragment set:html={...} />`:

```js
const externalLinkIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
```

Usage:
```html
<Fragment set:html={externalLinkIcon} />
```

#### CSS Variables Used
- `--color-dark-bg` — section background
- `--color-white` — title, card backgrounds, CTA text
- `--color-text` — card text
- `--color-orange` / `--color-orange-dark` — nav button colors
- `--color-facebook` (`#1877F2`) — Facebook CTA background, link color, button text color
- `--color-facebook-hover` (`#145dbf`) — Facebook link hover
- `--color-facebook-light` (`#E4E6EB`) — card header border, CTA button hover background
- `--color-facebook-text` (`#65676B`) — post date color
- `--color-facebook-bg` (`#F0F2F5`) — post image placeholder background
- `--gradient-instagram` — Instagram CTA background
- `--color-instagram-pink` (`#DD2A7B`) — Instagram CTA button text color

#### JavaScript (linear carousel, not infinite loop)
Unlike the partners carousel, this one is **not** an infinite loop — it has a defined start and end, with the prev button disabled at position 0 and the next button disabled at the last position.

```js
let current = 0;
function getSlidePercent() { return mobileQuery.matches ? 100 : 100 / 3; }
function getMaxIndex() { return totalSlides - (mobileQuery.matches ? 1 : 3); }
function updateCarousel() {
  track.style.transform = `translateX(-${current * getSlidePercent()}%)`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current >= getMaxIndex();
}
```

Navigation via event delegation on the section element.

---

## Archived: Combined Facebook + Instagram CTA Card

> This is the original single CTA card that combined both platforms into one stacked element.
> Archived when the post cards were temporarily removed and the CTA was split into two
> standalone cards. Restore this structure (in place of the two sibling cards) when the real
> post feed is wired up and the combined card should sit at the end of the carousel again.

### Markup

```html
<!-- Combined CTA card — Facebook on top, Instagram below -->
<article class="actu-card actu-card--cta">
  <div class="actu-cta-fb">
    <svg class="actu-cta-icon" width="36" height="36" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
    <p class="actu-cta-text">Retrouvez-nous sur Facebook</p>
    <a href="https://www.facebook.com/verreetpapilles" target="_blank" rel="noopener noreferrer" class="actu-cta-btn">
      Suivez-nous
      <Fragment set:html={externalLinkIcon} />
    </a>
  </div>
  <div class="actu-cta-ig">
    <svg class="actu-cta-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
    <p class="actu-cta-text">Ou sur Instagram</p>
    <a href="https://www.instagram.com/verre_et_papilles" target="_blank" rel="noopener noreferrer" class="actu-cta-btn actu-cta-btn--ig">
      Suivez-nous
      <Fragment set:html={externalLinkIcon} />
    </a>
  </div>
</article>
```

### CSS (add alongside the existing CTA rules)

```css
.actu-card--cta {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
}

.actu-cta-fb,
.actu-cta-ig {
  flex: 1;
}
```

### Rationale

The two halves are split vertically (`flex-direction: column`) inside a single carousel slot,
each taking equal height via `flex: 1`. This makes the card match the height of adjacent post
cards (header + image + body) without hardcoding a pixel value. The `overflow: hidden` on the
wrapper clips the colored backgrounds to the card's `border-radius`.
