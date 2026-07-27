# Beach Map link fix (localized routing)

Fix for three related bugs where the "beach map" buttons/links produced a
`404` or navigated to the **wrong locale**.

## Reported symptoms

- **16 – 404.** Clicking the map button on a localized page navigated to a
  non‑existent slug and returned *"This page could not be found"*.
  - `de`: button → `/de/strandkarte` (404). Correct page is `/de/strand-karte`.
  - `ru`: button → `/ru/karta-plyazhej` (404). Correct page is `/ru/karta-plyazhey` (`y`, not `j`).
- **17 – jumps to a previously used language.** On e.g. `/pl/mapa-plaz`, clicking
  the map button navigated to another locale's map (e.g. `/ru/karta-plyazhey`).
  The target locale matched whatever locale was used before.
- **18 – bottom footer "Map view" button only worked for EN.** On e.g.
  `/it/mappa-spiagge` the footer map link jumped to `/fr/carte-des-plages`.

## Root cause

The localized pathnames are declared correctly in `src/i18n/routing.ts`
(and mirrored in the sitemap). The middleware correctly maps the canonical
pathname to the localized slug, e.g. `/de/beach-map` → `/de/strand-karte`.

The broken links did **not** use this source of truth. Instead they used a
**separate, drifted copy** of the slugs stored in the translation files
(`messages/<locale>.json` → `routes.beachMap`) and rendered them as
**locale‑less** hrefs with plain `next/link`:

```tsx
// messages/de.json → "routes": { "beachMap": "/strandkarte" }   ← wrong slug
<Link href={tRoutes('beachMap')}>   // renders <a href="/strandkarte">
```

Two failure modes followed:

1. **Wrong slug (16).** `messages` had drifted from `routing.ts`:
   `de = /strandkarte` (missing hyphen) and `ru = /karta-plyazhej` (`j` vs `y`).
   Result: `404`.
2. **Locale‑less href (17 & 18).** Because the href had no locale prefix
   (e.g. `/beach-map`, `/mappa-spiagge`, or the footer's `/map`), the
   next‑intl middleware resolved the locale from the **`NEXT_LOCALE` cookie**
   — i.e. the *previously visited* locale — instead of the current page's
   locale. This produced the cross‑locale jumps.

Verified live (curl, following redirects):

| Request | With cookie | Resolves to |
|---|---|---|
| `/beach-map` | `NEXT_LOCALE=ru` | `/ru/karta-plyazhey` |
| `/beach-map` | `NEXT_LOCALE=fr` | `/fr/carte-des-plages` |
| `/beach-map` | (none) | `/en/beach-map` |
| `/de/strandkarte` | — | `404` |
| `/ru/karta-plyazhej` | — | `404` |

Before the fix there were **5 copies** of the beach‑map slug map: 4 correct
(`routing.ts`, `sitemap/static.xml`, `QuickMenu`, `BeachCategorySearch`) and 1
drifted (`messages.routes.beachMap`).

## The fix

Introduced a **single source of truth** for the beach‑map URL and made every
link build a **locale‑prefixed** URL so navigation never depends on the cookie.

New helper — `src/lib/utils/beach-urls.ts`:

- `getBeachMapWord(locale)` — returns the localized slug (matches `routing.ts`).
- `buildBeachMapUrl(locale, queryString?)` — returns `/[locale]/[slug][?query]`.

Updated all beach‑map links to use it (with the current `useLocale()`):

- `src/components/Header/SearchBar.tsx` — 3 map buttons (mobile/tablet/desktop).
- `src/components/BannerSection/BannerSection.tsx` — `buildMapUrl()`.
- `src/components/Beach/BeachBanner/BeachBannerSection.tsx` — `buildMapUrl()`.
- `src/app/[locale]/page.tsx` — hero/featured buttons + `WorldMapSection`.

Consolidated the duplicated local slug maps to the shared helper (no behaviour
change, prevents future drift):

- `src/components/Header/QuickMenu.tsx`
- `src/components/Home/BeachCategorySearch.tsx`

Footer "Map view" link:

- `src/components/Footer/FooterBrowseColumn.tsx` — switched from `next/link`
  to the locale‑aware next‑intl `Link` (`@/i18n/routing`), so all footer links
  use the **current** locale.
- `messages/<locale>.json` (14 files) — `Footer.browse.links` href
  `"/map"` → `"/beach-map"` (the canonical pathname the middleware localizes).

After the fix, `routes.beachMap` in `messages/*.json` is **no longer used** for
navigation. It is intentionally left in place but should be treated as
deprecated; do not wire new links to it.

## How to add future map links (do this)

```tsx
import { useLocale } from 'next-intl';
import { buildBeachMapUrl } from '@/lib/utils/beach-urls';

const locale = useLocale();
<Link href={buildBeachMapUrl(locale)}>…</Link>
// or with filters: buildBeachMapUrl(locale, 'continent_code=EU&country=hr')
```

Do **not**:
- read slugs from `messages.routes.beachMap`, and
- render locale‑less hrefs (e.g. `/beach-map`, `/map`) with plain `next/link`.

## Keeping slugs in sync

The canonical slug map is duplicated in four places by design (server vs client
vs sitemap vs helper). When adding/renaming a locale slug, update **all** of:

1. `src/i18n/routing.ts` (`globalRoutes.beachMap`)
2. `src/lib/utils/beach-urls.ts` (`getBeachMapWord`)
3. `src/app/sitemap/static.xml/route.ts` (`routeTranslations.beachMap`)

## Verification

- `npx tsc --noEmit` — passes.
- `npx eslint` on all changed files — passes.

### Regression tests

Unit tests guard the helper against slug drift and cross-locale jumps:
`e2e/beach-urls.unit.spec.ts`. They cover the exact slug per locale (incl. the
`de`/`ru` 404 regressions), that `buildBeachMapUrl` is always locale-prefixed,
and that the helper stays in sync with `globalRoutes.beachMap` in `routing.ts`.

Run:

    npx playwright test e2e/beach-urls.unit.spec.ts
