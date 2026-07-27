# Documentation Changelog

## Version 1.3.0 - 2026-07-27

### Fixed

**Banner Map Button — Missing Query Params** (city page + beach page)

#### Files Changed

- **`src/components/BannerSection/BannerSection.tsx`** — added `citySlug?: string` prop; `buildMapUrl()` now appends `city=<slug>`
- **`src/components/Pages/CityListingPage.tsx`** — passes `citySlug={_citySlug}` to `BannerSection`
- **`src/components/Beach/BeachBanner/BeachBannerSection.tsx`** — `buildMapUrl()` now appends `city=`, `beach_id=`, `lat=`, `lng=` from `beachDetails`

#### Key Fixes

- City page map button was missing `city=` param → map opened unfiltered
- Beach page map button was missing `city=` → map opened without city context
- Beach page map button now also passes `beach_id`, `lat`, `lng` → map auto-centers on the beach and opens its pin popup (as if the user clicked the pin)

### Added

**Beach Map — Deep-link to Beach Pin** (navigating from beach page)

#### Files Changed

- **`src/components/Map/MapWithSidebar.tsx`** — added `useSearchParams`; on mount (after global centre is set), reads `beach_id`/`lat`/`lng` URL params and sets `mapCenter`, `mapZoom=16`, `selectedBeachId` without skipping the bounding-box API call so beaches in the area load
- **`src/components/Map/ReactLeafletMap.tsx`** — `BeachMarker` now has a `useEffect` that calls `markerRef.current?.openPopup()` 300 ms after `isSelected` becomes true

#### How It Works

```
User clicks map button on beach page
  → /[locale]/beach-map?city=zadar&beach_id=123&lat=44.117&lng=15.231
  → MapWithSidebar initialises (global centre from API)
  → effect fires → setMapCenter([44.117, 15.231]), zoom 16, selectedBeachId=123
  → viewport change → bounding-box fetch for beach area
  → beach 123 loads → BeachMarker isSelected=true → popup opens (300 ms delay)
```

### Documentation Stats

- New issues in LOCALIZATION_GUIDE: +1 (Issue 7)

---

## Version 1.2.0 - 2026-07-27

### Added

**Beach Map Routing Fix** — Issues 16, 17, 18 (git: 408b526)

#### Files Changed

- **`src/lib/utils/beach-urls.ts`** (new) — `getBeachMapWord(locale)` + `buildBeachMapUrl(locale, qs?)`; single source of truth for beach-map slugs
- **Updated components** — SearchBar, QuickMenu, BeachCategorySearch, BannerSection, BeachBannerSection, page.tsx, FooterBrowseColumn (switched to next-intl `Link`)
- **`messages/*.json`** (14 files) — Footer map href `/map` → `/beach-map`
- **`e2e/beach-urls.unit.spec.ts`** (new) — 24 unit tests × 3 browsers = 72 Playwright runs; covers per-locale slugs, locale-prefix guarantee, routing.ts sync
- **`src/components/Map/MapSearch.tsx`** — added `LOCALE_TO_LANGUAGE` map + explicit `accept-language` on OpenStreetMapProvider; IT locale uses `en` to avoid historical names (Zara, Ragusa)
- **`docs/features/BEACH_MAP_LINK_FIX.md`** (new) — full bug report, root cause, fix details, usage guide
- **`ai-agent/CONTRIBUTING.md`** (new) — documentation process for agents and developers

#### Key Fixes

- `de` slug: `strandkarte` → `strand-karte` (was 404)
- `ru` slug: `karta-plyazhej` → `karta-plyazhey` (was 404)
- All links locale-prefixed (fixes cross-locale cookie-driven redirects — Issues 17, 18)
- Nominatim returns Croatian names even when browser is set to Italian

#### Run Tests

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20.19.5
npx playwright test e2e/beach-urls.unit.spec.ts
```

### Documentation Stats

- Total documents: 12 → 13 (+1 CONTRIBUTING.md)
- New use cases in INDEX.md: +4
- New LOCALIZATION_GUIDE issues: 5, 6

---

## Version 1.1.0 - 2026-01-20

### Added

**SEO Documentation Suite** - Complete tracking of SEO implementation status

#### New Documents (3 total)

1. **SEO_STATUS_AND_TASKS.md** (~550 lines, 19KB) ⭐⭐⭐
   - **Overall SEO Status**: 75% complete
   - **Completed Implementations:**
     - ✅ URL localization (100%)
     - ✅ Server-side rendering with metadata (100%)
     - ✅ Structured data JSON-LD (100%)
     - ✅ Sitemaps for all content types (100%)
     - ✅ Robots.txt configuration (100%)
     - ✅ Hreflang tags for 14 languages (100%)
   - **Partial Implementations:**
     - ⚠️ Image alt text (60%)
     - ⚠️ Page speed optimization (50%)
     - ⚠️ Schema.org enhancements (40%)
   - **Not Implemented:**
     - ❌ Missing pages SEO (0%)
   - **Future Task Tracker** with 8 prioritized tasks
   - **Pre-launch SEO checklist**
   - **AI Agent instructions** for maintaining SEO

2. **SEO_QUICK_REFERENCE.md** (~150 lines, 6.8KB)
   - Copy-paste metadata templates
   - URL building patterns
   - JSON-LD schema examples
   - Image alt text patterns
   - Testing commands

3. **SEO_VISUAL_STATUS.md** (~170 lines, 6.5KB) ⭐
   - Visual progress charts (75% complete)
   - Component status matrix (17 components tracked)
   - Page-by-page SEO status (9/17 pages done)
   - Sitemap coverage overview (~18,000 URLs)
   - Localization coverage table (14 languages)
   - Top 5 priority tasks
   - Estimated SEO score: 75/100
   - Quick dashboard for stakeholders

#### Updated Documents

- **INDEX.md** - Added SEO documentation section (3 new docs) + 4 new use cases
- **README.md** - Added SEO guides section + 2 key files to reference table

### Key Features

- ✅ **Complete audit** of all SEO implementations
- ✅ **Task tracking** for future SEO work
- ✅ **Quick reference** templates for common SEO patterns
- ✅ **Testing commands** for validating SEO
- ✅ **Comprehensive status** for each SEO component

### Impact

**Before**: No centralized tracking of SEO implementation status
**After**:
- Clear visibility into what's done (75%) and what needs work (25%)
- Prioritized task list for future SEO improvements
- Quick reference for adding SEO to new pages
- Pre-launch checklist to ensure nothing is missed

### Documentation Stats Update

- **Total Documents**: 9 → 12 documents (+3 SEO docs)
- **Total Lines**: ~2,390 lines (was ~1,500)
- **Total Size**: ~87KB (was ~51KB)
- **SEO Coverage**: ✅ Complete and tracked
- **New Use Cases**: +4 SEO-related use cases in INDEX.md

---

## Version 1.0.0 - 2026-05-29

### Created

**Complete AI Agent Documentation Suite** for Beachrex Frontend

#### Documents Created (8 total)

1. **README.md** (276 lines)
   - Main entry point
   - Overview of all documentation
   - Quick links and troubleshooting

2. **QUICK_START.md** (260 lines) ⭐
   - 5-minute essentials
   - Common tasks
   - Critical mistakes to avoid

3. **ARCHITECTURE_BLUEPRINT.md** (364 lines)
   - Complete system architecture
   - Technology stack
   - Project structure
   - All major subsystems

4. **LOCALIZATION_GUIDE.md** (213 lines) ⭐⭐⭐
   - How i18n works (14 languages)
   - Middleware architecture
   - Common issues & solutions
   - Critical for understanding the system

5. **ROUTING_GUIDE.md** (260 lines)
   - Route hierarchy
   - File structure
   - URL generation patterns
   - Dynamic routing

6. **API_INTEGRATION_GUIDE.md** (342 lines)
   - OpenAPI client generation
   - TanStack Query patterns
   - Caching strategy
   - Type safety

7. **COMPONENT_PATTERNS.md** (382 lines)
   - Server vs Client components
   - Reusable components
   - Performance optimization
   - Anti-patterns

8. **DIAGRAMS.md** (new)
   - Visual flow diagrams
   - Architecture visualization
   - State management diagrams

9. **INDEX.md** (126 lines)
   - Complete documentation index
   - Use-case based navigation
   - Coverage checklist

### Key Features

- ✅ **2,200+ lines** of comprehensive documentation
- ✅ **68KB** of markdown content
- ✅ **Complete coverage** of all major systems
- ✅ **Visual diagrams** for complex flows
- ✅ **Troubleshooting guides** for common issues
- ✅ **Quick reference** for new developers/agents

### Focus Areas

1. **Localization** - Most critical system, extensively documented
2. **Routing** - Dynamic hierarchy explained
3. **API Integration** - Type-safe patterns
4. **Component Patterns** - Best practices
5. **Common Pitfalls** - Solutions to frequent issues

### Why This Matters

**Before**: AI agents and new developers struggled with:
- Understanding localization middleware flow
- Fixing "wrong language" bugs
- Adding new routes
- Knowing Server vs Client component patterns

**After**: Comprehensive documentation provides:
- Step-by-step guides
- Visual diagrams
- Common issue solutions
- Quick start references

### Maintenance

- **Update when**: Architecture changes, new patterns, common issues
- **Review**: Quarterly
- **Owner**: Frontend Team

---

## Next Steps

1. Keep documentation up-to-date with code changes
2. Add examples as new patterns emerge
3. Collect feedback from users
4. Expand with more visual diagrams as needed

---

**Total Time Investment**: ~2 hours  
**Value**: Permanent reference for all future work

