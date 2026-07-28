# ✅ SEO Quick Implementation Checklist

**Use this checklist to track your progress through the SEO fixes.**

---

## 🔴 PHASE 1: CRITICAL FIXES (Week 1)

### Day 1-2: Fix Client-Side Pages

#### beaches/page.tsx
- [ ] Remove `'use client'` from line 1
- [ ] Add `generateMetadata()` function
- [ ] Change to `async function`
- [ ] Add ISR `export const revalidate = 3600`
- [ ] Add translations: `Beaches.metaTitle`, `Beaches.metaDescription`
- [ ] Test: View page source, verify HTML content visible
- [ ] Test: No hydration errors in console
- [ ] Test: Lighthouse shows metadata

#### beach-map/page.tsx
- [ ] Create `src/components/BeachMap/BeachMapClient.tsx`
- [ ] Move client logic to BeachMapClient
- [ ] Convert page to server component
- [ ] Add `generateMetadata()` function
- [ ] Add translations: `BeachMap.metaTitle`, `BeachMap.metaDescription`
- [ ] Test: View page source, verify metadata
- [ ] Test: Map still loads correctly

#### about/page.tsx
- [ ] Add `generateMetadata()` function
- [ ] Change `useTranslations()` to `getTranslations()`
- [ ] Add `async` to function
- [ ] Add translations: `About.metaTitle`, `About.metaDescription`
- [ ] Test: No hydration errors

---

### Day 3-4: Fix Image Alt Text

#### Create Helper Functions
- [ ] Create `src/lib/utils/alt-text-helpers.ts`
- [ ] Add `buildBeachImageAlt()` function
- [ ] Add `buildFacilityAlt()` function
- [ ] Add `buildAccommodationIconAlt()` function
- [ ] Add `buildFlagAlt()` function
- [ ] Add `buildLocationIconAlt()` function

#### PropertyCard.tsx (6 fixes)
- [ ] Line 374: Change `alt="acc"` → `alt={buildAccommodationIconAlt(t)}`
- [ ] Line 391: Change `alt="flag"` → `alt={buildFlagAlt(countryName, t)}`
- [ ] Line 424: Change `alt="location"` → `alt={buildLocationIconAlt(t)}`
- [ ] Line 443: Change `alt="stones"` → `alt={buildFacilityAlt('stones', t)}`
- [ ] Line 449: Change `alt="family"` → `alt={buildFacilityAlt('family', t)}`
- [ ] Line 455: Change `alt="parking"` → `alt={buildFacilityAlt('parking', t)}`
- [ ] Add imports for helper functions
- [ ] Test: Inspect element, verify alt text descriptive

#### HomeAccommodationSection.tsx (8 fixes)
- [ ] Lines 60-80: Change `alt="image {i}"` → `alt={t('accommodation.galleryImageAlt', {index, total})}`
- [ ] Test: All images have descriptive alt

#### TopBar.tsx (4 fixes)
- [ ] Review 4 empty `alt=""` at lines 85-95
- [ ] Determine which are decorative (keep `alt=""`)
- [ ] Add descriptive alt to non-decorative images
- [ ] Line 120: Change `alt="filter"` → `alt={t('filter.iconAlt')}`

#### Translation Keys
- [ ] Add `PropertyCard` namespace with all alt text keys
- [ ] Add `Home.accommodation.galleryImageAlt`
- [ ] Add `filter.iconAlt`
- [ ] Translate to all 19 languages (or at least EN + SI)

---

### Day 5: Fix Heading Structure

#### Audit All Pages
- [ ] Check homepage: Verify only ONE H1
- [ ] Check beach detail: Remove duplicate H1 from banner OR BeachDetailsSection
- [ ] Check country pages: Verify single H1
- [ ] Check continent pages: Verify single H1
- [ ] Convert extra H1s to H2

#### Beach Detail Page Fix
- [ ] If banner has H1, change BeachDetailsSection H1 to H2 (line 201)
- [ ] OR remove H1 from banner, keep in BeachDetailsSection
- [ ] Test: Search page source for `<h1`, verify only ONE result

#### Testing
- [ ] Run Lighthouse on all major pages
- [ ] Check heading outline in DevTools
- [ ] Verify no console errors
- [ ] Test with screen reader (basic check)

---

## 🟠 PHASE 2: HIGH PRIORITY (Week 2)

### Day 6-7: Add Priority Loading

#### HeroSection.tsx
- [ ] Line 51: Convert `backgroundImage` CSS to `<Image>` tag
- [ ] Add `priority={true}`
- [ ] Add `alt={t('hero.backgroundAlt', {continent})}`
- [ ] Add translation key
- [ ] Test: Lighthouse LCP score improved?

#### BannerSection.tsx
- [ ] Line 120: Convert `backgroundImage` CSS to `<Image>` tag
- [ ] Add `priority={true}`
- [ ] Add `alt={t('banner.backgroundAlt', {location})}`
- [ ] Add translation key

#### WorldBannerSection.tsx
- [ ] Line 37: Convert `backgroundImage` CSS to `<Image>` tag
- [ ] Add `priority={true}`
- [ ] Add `alt={t('worldBanner.backgroundAlt')}`
- [ ] Add translation key

#### Performance Testing
- [ ] Before: Run Lighthouse, record LCP score
- [ ] After: Run Lighthouse, verify LCP reduced by ~30-40%
- [ ] Test on mobile devices
- [ ] Check Network tab: Verify hero image loads first

---

### Day 8-9: Add Lazy Loading

#### AccommodationCard.tsx
- [ ] Add `loading="lazy"` to all images (except if first card)
- [ ] Test: Network tab shows images load as you scroll

#### DestinationCard.tsx
- [ ] Add `loading="lazy"` to all images
- [ ] Test: Images load on scroll

#### BeachCard (if exists)
- [ ] Add `loading="lazy"` to all images
- [ ] Exception: First card should not have lazy loading

#### Listing Components
- [ ] Add conditional lazy loading: `loading={index === 0 ? undefined : 'lazy'}`
- [ ] Test: First card loads immediately, others lazy

---

### Day 10: Convert Background Images

#### SearchContinent.tsx
- [ ] Line 25: Convert `backgroundImage` to `<Image fill>`
- [ ] Add `alt={t('searchContinent.backgroundAlt')}`
- [ ] Add translation key

#### Find All Remaining
- [ ] Run: `grep -r "backgroundImage" src/components`
- [ ] Convert each to `<Image>` tag
- [ ] Add appropriate alt text

---

### Day 11: Performance Testing

#### Bundle Analysis
- [ ] Run `npm run build -- --analyze`
- [ ] Identify large bundles
- [ ] Look for code-splitting opportunities

#### Lighthouse Testing
- [ ] Test homepage: Record score
- [ ] Test beach detail: Record score
- [ ] Test beaches listing: Record score
- [ ] Test beach map: Record score
- [ ] Test country page: Record score
- [ ] Compare to baseline scores

---

## 🟡 PHASE 3: MEDIUM PRIORITY (Week 3)

### Day 12-14: Add Semantic HTML

#### Wrap Pages in <main>
- [ ] `app/[locale]/page.tsx` - Add `<main>` wrapper
- [ ] `app/[locale]/beaches/page.tsx` - Add `<main>` wrapper
- [ ] `app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx` - Add `<main>`
- [ ] All other `page.tsx` files (~15 more)
- [ ] Test: Accessibility tools recognize `<main>` landmark

#### Convert Cards to <article>
- [ ] PropertyCard.tsx: Change outer `<div>` to `<article>`
- [ ] BeachCard.tsx: Change to `<article>`
- [ ] AccommodationCard.tsx: Change to `<article>`
- [ ] DestinationCard.tsx: Change to `<article>`

#### Add <nav> to Navigation
- [ ] QuickMenu.tsx: Wrap in `<nav aria-label="Main navigation">`
- [ ] TopBar navigation: Wrap in `<nav>`
- [ ] Footer navigation: Wrap in `<nav aria-label="Footer navigation">`

#### Add <header> and <footer>
- [ ] Layout.tsx: Wrap header components in `<header>`
- [ ] Layout.tsx: Wrap footer in `<footer>`

---

### Day 15: Reduce Client Components

#### Audit
- [ ] Create list of all 79 client components
- [ ] For each, check if it NEEDS to be client
- [ ] Identify 10-15 that can be converted to server

#### Convert to Server
- [ ] Component 1: Remove `'use client'`, test
- [ ] Component 2: Remove `'use client'`, test
- [ ] Component 3-10: Convert and test
- [ ] Verify no functionality broken

---

### Day 16: Final Testing

#### Complete SEO Audit
- [ ] All pages have `generateMetadata()` ✓
- [ ] All images have descriptive alt text ✓
- [ ] All pages have single H1 ✓
- [ ] Hero images have `priority={true}` ✓
- [ ] 85%+ images have `loading="lazy"` ✓
- [ ] All pages wrapped in `<main>` ✓
- [ ] Cards use `<article>` ✓
- [ ] Navigation uses `<nav>` ✓

#### Lighthouse Testing
- [ ] Homepage: SEO score ≥ 95
- [ ] Beach Detail: SEO score ≥ 95
- [ ] Beaches Listing: SEO score ≥ 90
- [ ] Beach Map: SEO score ≥ 90
- [ ] Accessibility: All pages ≥ 90

#### Final Report
- [ ] Document before/after scores
- [ ] Create comparison table
- [ ] Update DEV_HANDOFF.md
- [ ] Create SEO_BEST_PRACTICES.md

---

## 🎯 COMPLETION CRITERIA

### Must Have (100% Complete):
- ✅ All 3 client-side pages converted to SSR
- ✅ All 40+ image alt texts fixed
- ✅ All pages have single H1
- ✅ All 3 hero images have priority loading

### Should Have (80% Complete):
- ⚠️ 85% of images have lazy loading
- ⚠️ All pages wrapped in semantic HTML
- ⚠️ Cards use `<article>` tags

### Nice to Have (50% Complete):
- 💡 10-15 client components converted to server
- 💡 Bundle size reduced by 10%

---

## 📊 QUICK STATS TRACKER

**Fill in as you go:**

| Metric | Baseline | Current | Target |
|--------|----------|---------|--------|
| **SEO Score** | 68 | ___ | 95 |
| **Accessibility** | 45 | ___ | 90 |
| **Performance** | 70 | ___ | 88 |
| **Pages with SSR** | 10/19 | ___ | 19/19 |
| **Images with good alt** | 20/100 | ___ | 95/100 |
| **Priority images** | 0 | ___ | 3 |
| **Lazy images** | 6 | ___ | 85+ |
| **LCP Score** | 3.5s | ___ | <2.5s |

---

**Checklist Created:** 2026-01-20  
**Print this and check off items as you complete them!** ✅
