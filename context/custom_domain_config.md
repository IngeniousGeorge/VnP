# Custom Domain Configuration

## Goal

Point the domains `verre-et-papilles.fr` and `verre-et-papilles.com` (both registered and DNS-managed on OVH) to the Netlify app, using **full DNS delegation to Netlify**. This lets Netlify manage all DNS records and provision TLS certificates automatically via Let's Encrypt.

Both domains are added to the **same Netlify site**. One is designated the **primary (canonical) domain**; the other permanently redirects to it (HTTP 301). This prevents duplicate content penalties in search engines.

**Primary domain: `verre-et-papilles.com`**
**Redirect alias: `verre-et-papilles.fr`** — Netlify redirects this (and its `www` variant) to the `.com` domain automatically.

---

## Step 1 — Add both domains in Netlify

Repeat the following for each domain:

1. Netlify dashboard → your site → **Domain management** → **Add a domain**
2. Enter the domain → confirm
3. Netlify will detect it is externally registered and offer **"Use Netlify DNS"** — accept it
4. Netlify will display **4 nameserver records**, e.g.:
   ```
   dns1.p0X.nsone.net
   dns2.p0X.nsone.net
   dns3.p0X.nsone.net
   dns4.p0X.nsone.net
   ```
   Copy these — they will differ between domains and are needed in Step 2.

After adding both, set `verre-et-papilles.com` as the **primary domain** in Netlify → Domain management.

---

## Step 2 — Delegate nameservers in OVH (repeat for each domain)

1. Log in to the **OVH Control Panel** → **Web Cloud** → **Domain names** → select the domain
2. Go to **DNS servers** (Serveurs DNS)
3. Switch from OVH's default nameservers to **custom nameservers**
4. Enter the 4 Netlify nameserver addresses obtained in Step 1 for that domain
5. Save — propagation takes 1–48h (typically 1–4h in practice)

---

## Step 3 — Verify

Once Netlify detects that its nameservers are authoritative for a domain, it will:
- Automatically provision a **Let's Encrypt TLS certificate**
- Serve or redirect all variants (`verre-et-papilles.fr`, `www.verre-et-papilles.fr`, `verre-et-papilles.com`, `www.verre-et-papilles.com`)

Check status in Netlify → **Domain management** — a green checkmark confirms DNS is live and the certificate is issued for each domain.

---

## Notes

- No changes to the Astro codebase or Netlify build configuration are required.
- If the domains were previously pointing to another host, existing DNS records in OVH become irrelevant after delegation — Netlify DNS takes over entirely. The original OVH nameservers were `ns11.ovh.net` and `dns11.ovh.net`.
- Netlify handles the `www` → apex redirect automatically for the primary domain.
- The `.fr` → `.com` redirect is handled by Netlify's multi-domain setup at no extra configuration cost.
