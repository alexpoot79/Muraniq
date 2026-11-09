# Launch plan — preview and switch of muraniq.nl

The current website on muraniq.nl stays live and unchanged until Alex approves the switch.
Nothing below is executed without that approval.

## 1. Protected preview (now)

1. Vercel → Add New → Project → import `alexpoot79/Muraniq`. Preset **Next.js**, Root Directory `./`,
   default build settings, no environment variables required.
2. Settings → Deployment Protection → **Vercel Authentication** on (Standard Protection covers previews and
   the `*.vercel.app` production URL).
3. Settings → Git → once the PR is merged, set the **Production Branch** to `main`.
4. For automated testing against the protected preview, create a *Protection Bypass for Automation* secret
   and run `E2E_BASE_URL=<preview-url> npm run test:e2e` with the bypass header configured. Never commit the secret.
5. Before launch, set `SITE_INDEXABLE=true` **only** in the Production environment. Until then robots.txt
   disallows everything and every response carries `X-Robots-Tag: noindex`.
6. Plan: Vercel Hobby is for non-commercial use only. Because works may be offered for acquisition, choose
   **Pro** before going live (owner decision; costs apply).

## 2. Connections (each needs Alex)

| Service | What Alex does | Then |
| --- | --- | --- |
| Sanity | Create project + **private** dataset (Growth plan), invite editors | Fill `SANITY_*` in Vercel, deploy Studio with `cd studio && npm run deploy`, add webhook to `/api/revalidate/` with `SANITY_WEBHOOK_SECRET` |
| Mail (Resend) | Create account, verify sending domain (adds DNS **TXT/MX for a subdomain**, e.g. `send.muraniq.nl`) | Fill `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`; test delivery to the real inbox |
| Private archive | Choose a private store for originals and confidential records (e.g. a restricted cloud drive) | Never connected to the website |

## 3. DNS switch (only after approval)

**Before:** the current site is hosted at IONOS. Export the complete current DNS zone from the registrar (screenshot or zone file) and store it
with the date. This is the rollback record. Lower the TTL of the web records (apex `A`/`AAAA` and `www`) to
300 s at least 24 hours before the switch.

In Vercel → Settings → Domains add `muraniq.nl` (primary) and `www.muraniq.nl` (redirect to apex, 308).
Vercel then shows the exact records it requires. At the time of writing these are normally:

| Host | Type | Value | Action |
| --- | --- | --- | --- |
| `@` (muraniq.nl) | A | `76.76.21.21` | **replace** the current web A record(s); remove apex AAAA records that point to the old host |
| `www` | CNAME | `cname.vercel-dns.com` | **replace** the current www record |

**Use the values Vercel shows in the Domains screen if they differ from this table.**

**Do not touch:** `MX`, mail-related `TXT` (SPF, DKIM, DMARC), `autodiscover`/`autoconfig`, `NS`, and any
verification records. Only the two web records above change.

**After the switch (checks):**

- `https://muraniq.nl/` serves the new site with a valid certificate; `http://` redirects to `https://`.
- `https://www.muraniq.nl/anything/` → 308 → `https://muraniq.nl/anything/` (path preserved).
- Existing URLs: `/`, `/collection/`, the four `/collection/<area>/` pages, `/glass-guide/`, `/about/` → 200.
- `/arnaldo-zanella/`, `/loredano-rosin/` and `/glass-guide/makers-and-artists/` → one-step 308 to the new
  maker pages (already active in the new site; see `docs/MIGRATION-INVENTORY.md` for all 13 current URLs).
- `muraniq.com` → permanent redirect to `https://muraniq.nl` with path, only after ownership is checked.
- Send a test enquiry; confirm it arrives. Check `sitemap.xml`, `robots.txt`, canonical tags.
- Mail still works (send and receive at `info@`).

**Rollback:** restore the two web records from the saved zone export. With TTL 300 s the old site returns
within minutes. The old hosting stays active until the new site has run without issues for an agreed period.
