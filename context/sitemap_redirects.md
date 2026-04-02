# Sitemap & Redirects — Implementation Prompt

## Overview

The site uses a manual XML sitemap and Netlify redirects file to manage SEO and handle old URL
migration from the previous site version.

---

## Sitemap

**Location:** `frontend/public/sitemap.xml`

**Purpose:** Provides Google with current site structure for accurate indexing.

### Content
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://verre-et-papilles.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://verre-et-papilles.com/bocaux/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://verre-et-papilles.com/crottin/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://verre-et-papilles.com/coffrets/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://verre-et-papilles.com/contact/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

### Priority Scheme
- **1.0**: Home page (most important)
- **0.8**: Main product pages (Les bocaux, Le crottin, Les coffrets)
- **0.6**: Contact page (lower priority)

### Change Frequency
- **weekly**: Home and product pages (frequently updated via Strapi)
- **monthly**: Contact page (rarely changes)

### Implementation Notes
- **Manual sitemap** used instead of `@astrojs/sitemap` integration due to library bug
  (undefined reduce error in v3.7.2)
- Sitemap lives in `public/` directory → copied to `dist/` on build → served at
  `/sitemap.xml` on deployed site
- **After deploy**: Submit to Google Search Console (Search Console → Sitemaps → Add new
  sitemap URL)

---

## Netlify Redirects

**Location:** `frontend/public/_redirects`

**Purpose:** Redirect old site URLs to new structure with 301 permanent redirects, fixing 404
errors from outdated Google Search sitelinks.

### Content
```
# Netlify redirects - old site URLs to new structure

/coffrets-gourmand-craon-mayenne.html           /coffrets    301
/produits-regionaux.html                        /            301
/bocaux-plats-cuisines-a-emporter.html          /bocaux      301
/caviste-craon-mayenne.html                     /            301
/uploads/pdf/menu-saint-valentin-2023.pdf       /            301
```

### Format
- One redirect per line: `<old-path> <new-path> <status-code>`
- Status code `301` = permanent redirect (tells Google to update search index)
- Paths are relative to domain root (no `https://` needed)

### Redirect Mapping
| Old URL | New URL | Reason |
|---------|---------|--------|
| `/coffrets-gourmand-craon-mayenne.html` | `/coffrets` | Product page consolidated |
| `/produits-regionaux.html` | `/` | Merged into home |
| `/bocaux-plats-cuisines-a-emporter.html` | `/bocaux` | Product page consolidated |
| `/caviste-craon-mayenne.html` | `/` | Merged into home |
| `/uploads/pdf/menu-saint-valentin-2023.pdf` | `/` | Old event PDF removed |

### Implementation Notes
- **Netlify-only** — `_redirects` file is a Netlify platform feature, won't work in Astro dev
  server or static preview
- File lives in `public/` directory → copied to `dist/` on build → Netlify reads it
  automatically on deploy
- **Testing locally**: Requires Netlify CLI (`netlify dev`) to simulate redirect behavior
- **Testing in production**: After deploy, visit old URLs to verify they redirect correctly

---

## Astro Configuration

**File:** `frontend/astro.config.mjs`

### Site URL
```js
export default defineConfig({
  site: 'https://verre-et-papilles.com',
  // ... rest of config
});
```

The `site` property is required for:
- Sitemap generation (if using `@astrojs/sitemap` integration)
- Canonical URL generation
- Proper absolute URL construction in build output

---

## Post-Deployment Actions

After deploying with sitemap and redirects:

1. **Submit sitemap to Google Search Console**
   - Go to: https://search.google.com/search-console
   - Select property: `verre-et-papilles.com`
   - Navigate to: Sitemaps
   - Add new sitemap: `https://verre-et-papilles.com/sitemap.xml`

2. **Test redirects**
   - Visit each old URL in a browser
   - Verify it redirects to the correct new URL
   - Check that status code is 301 (use browser dev tools Network tab)

3. **Optional: Request URL removal** (speeds up delisting)
   - Google Search Console → Removals
   - Request removal of specific old URLs
   - Temporary (6 months) but accelerates Google's re-indexing

---

## Key Technical Decisions

- **Manual sitemap over integration** — `@astrojs/sitemap` v3.7.2 has an undefined reduce bug
  that breaks builds. Manual XML is more reliable for small sites and easier to maintain.
- **301 (not 302) redirects** — Permanent redirects tell search engines to update their index,
  transferring SEO value from old URLs to new ones.
- **Netlify `_redirects` over `netlify.toml`** — Simpler syntax, easier to read and maintain
  for straightforward redirect rules.
- **No regex or splat redirects** — Direct 1:1 mappings are more maintainable and less error-prone.
- **All old URLs → new structure** — No broken links, preserves user experience for anyone with
  old bookmarks or following outdated Google sitelinks.
