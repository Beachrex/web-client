# 🎯 SEO Action Plan - Prioritized Implementation Guide

**Date Created:** 2026-01-20  
**Total Estimated Time:** 3 weeks (120 hours)  
**Expected ROI:** SEO Score: 68 → 95 (+40%)

---

## 📋 QUICK REFERENCE

### Time Investment Summary:
- **Phase 1 (Critical):** 40 hours → **+25 SEO points**
- **Phase 2 (High Priority):** 40 hours → **+7 SEO points**
- **Phase 3 (Medium Priority):** 40 hours → **+3 SEO points**

### Impact Priority:
1. 🔴 **Fix 3 pages with no SSR** → Immediate indexing of 3 critical pages
2. 🔴 **Fix 40+ bad alt texts** → +35 accessibility points
3. 🟠 **Add priority loading** → -40% LCP (Largest Contentful Paint)
4. 🟡 **Add semantic HTML** → Better crawlability

---

## 🔴 PHASE 1: CRITICAL FIXES (Week 1)

**Goal:** Fix show-stopper issues that prevent SEO/indexing  
**Duration:** 40 hours (1 week)  
**Expected Impact:** SEO 68 → 85 (+17 points)

---

### Day 1-2: Fix Client-Side Pages (12 hours)

#### Task 1.1: Convert `/beaches/page.tsx` to SSR (4 hours)

**Current Problem:**
- Line 1: `'use client'` → Google sees empty page
- No `generateMetadata()` → No SEO metadata
- Uses `useEffect` for routing → Client-side only

**Solution:**

```typescript
// FILE: src/app/[locale]/beaches/page.tsx

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// ✅ ADD: Server-side metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Beaches' });
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      type: 'website',
    },
  };
}

// ✅ CHANGE: Remove 'use client', make it async server component
export default async function BeachesPage({ params }) {
  // Remove useEffect, handle routing on server
  // Render appropriate content or redirect
  
  return (
    <div>
      <h1>{t('title')}</h1>
      {/* Server-rendered content */}
    </div>
  );
}

// ✅ ADD: ISR revalidation
export const revalidate = 3600;
```

**Translation Keys to Add:**
```json
// messages/en.json
{
  "Beaches": {
    "metaTitle": "Beaches Around the World | Beachrex",
    "metaDescription": "Discover beautiful beaches worldwide with detailed information, photos, and travel tips.",
    "title": "Explore Beaches Worldwide"
  }
}
```

**Files to Edit:**
1. `src/app/[locale]/beaches/page.tsx` (main changes)
2. `messages/en.json` + all 13 other language files
3. Test on `http://localhost:3000/en/beaches`

**Verification:**
- [ ] Page loads without hydration errors
- [ ] View page source → see full HTML content
- [ ] Google Lighthouse shows metadata
- [ ] No console errors

---

#### Task 1.2: Convert `/beach-map/page.tsx` to SSR (3 hours)

**Current Problem:**
- Line 1: `'use client'` 
- Line 15: `ssr: false` in dynamic import
- No `generateMetadata()`

**Solution:**

```typescript
// FILE: src/app/[locale]/beach-map/page.tsx

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import BeachMapClient from '@/components/BeachMap/BeachMapClient';

// ✅ ADD: Server-side metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'BeachMap' });
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      type: 'website',
    },
  };
}

// ✅ CHANGE: Server component wrapper
export default async function BeachMapPage({ params }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'BeachMap' });
  
  return (
    <main>
      <h1>{t('title')}</h1>
      <BeachMapClient />
    </main>
  );
}

export const revalidate = 3600;
```

**Create New File:**
```typescript
// FILE: src/components/BeachMap/BeachMapClient.tsx

'use client';

import dynamic from 'next/dynamic';

// Map MUST be client-side (Leaflet requires browser)
const BeachMap = dynamic(
  () => import('./BeachMap'),
  { ssr: false }
);

export default function BeachMapClient() {
  return <BeachMap />;
}
```

**Files to Edit:**
1. `src/app/[locale]/beach-map/page.tsx` (convert to server)
2. `src/components/BeachMap/BeachMapClient.tsx` (create new)
3. `messages/en.json` + translations

---

#### Task 1.3: Fix `/about/page.tsx` Hydration (2 hours)

**Current Problem:**
- Uses `useTranslations()` (client hook) without `'use client'`
- No `generateMetadata()`

**Solution:**

```typescript
// FILE: src/app/[locale]/about/page.tsx

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// ✅ ADD: Metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'About' });
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

// ✅ CHANGE: Use server-side getTranslations
export default async function AboutPage({ params }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'About' });
  
  return (
    <main>
      <h1>{t('aboutUs')}</h1>
      {/* Rest of content */}
    </main>
  );
}
```

---

#### Task 1.4: Add Missing Translations (3 hours)

**Files to Update:**
- `messages/en.json`
- `messages/si.json`
- All 12 other language files

**New Translation Namespaces:**
```json
{
  "Beaches": {
    "metaTitle": "...",
    "metaDescription": "...",
    "title": "..."
  },
  "BeachMap": {
    "metaTitle": "Interactive Beach Map | Beachrex",
    "metaDescription": "Explore beaches on an interactive world map...",
    "title": "Beach Map"
  },
  "About": {
    "metaTitle": "About Beachrex | Your Beach Discovery Platform",
    "metaDescription": "Learn about Beachrex..."
  }
}
```

---

### Day 3-4: Fix Image Alt Text (16 hours)

#### Task 2.1: Create Alt Text Helper Functions (2 hours)

**Create New File:**

```typescript
// FILE: src/lib/utils/alt-text-helpers.ts

/**
 * Build descriptive alt text for beach images
 */
export function buildBeachImageAlt(
  beach: { name: string; city?: string; country?: string },
  locale: string
): string {
  const parts = [beach.name];
  if (beach.city) parts.push(beach.city);
  if (beach.country) parts.push(beach.country);
  
  return `Beach photo of ${parts.join(', ')}`;
}

/**
 * Build alt text for facility icons
 */
export function buildFacilityAlt(
  facilityType: string,
  translator: (key: string) => string
): string {
  return translator(`facilities.${facilityType}.iconAlt`);
}

/**
 * Build alt text for accommodation icons
 */
export function buildAccommodationIconAlt(
  translator: (key: string) => string
): string {
  return translator('accommodation.iconAlt');
}

/**
 * Build alt text for country flags
 */
export function buildFlagAlt(
  countryName: string,
  translator: (key: string) => string
): string {
  return translator('country.flagAlt', { country: countryName });
}

/**
 * Build alt text for location icons
 */
export function buildLocationIconAlt(
  translator: (key: string) => string
): string {
  return translator('location.showOnMapAlt');
}
```

---

#### Task 2.2: Fix PropertyCard.tsx (3 hours)

**File:** `src/components/PropertyCard/PropertyCard.tsx`

**Changes:**

```typescript
// Line 374: ❌ BEFORE
<Image
  src="/images/accomodation.png"
  alt="acc"
  width={16}
  height={16}
/>

// ✅ AFTER
<Image
  src="/images/accomodation.png"
  alt={buildAccommodationIconAlt(t)}
  width={16}
  height={16}
/>

// Line 391: ❌ BEFORE
<Image
  src={flagUrl ?? '/images/propertycard/default-flag.png'}
  width={50}
  height={40}
  alt="flag"
/>

// ✅ AFTER
<Image
  src={flagUrl ?? '/images/propertycard/default-flag.png'}
  width={50}
  height={40}
  alt={buildFlagAlt(countryName, t)}
/>

// Line 424: ❌ BEFORE
<Image
  src="/images/propertycard/location.png"
  alt="location"
  width={32}
  height={32}
/>

// ✅ AFTER
<Image
  src="/images/propertycard/location.png"
  alt={buildLocationIconAlt(t)}
  width={32}
  height={32}
/>

// Lines 443, 449, 455: ❌ BEFORE
<Image src="/images/propertycard/stones.png" alt="stones" width={26} height={26} />
<Image src="/images/propertycard/family.png" alt="family" width={26} height={26} />
<Image src="/images/propertycard/parking.png" alt="parking" width={26} height={26} />

// ✅ AFTER
<Image 
  src="/images/propertycard/stones.png" 
  alt={buildFacilityAlt('stones', t)} 
  width={26} 
  height={26} 
/>
<Image 
  src="/images/propertycard/family.png" 
  alt={buildFacilityAlt('family', t)} 
  width={26} 
  height={26} 
/>
<Image 
  src="/images/propertycard/parking.png" 
  alt={buildFacilityAlt('parking', t)} 
  width={26} 
  height={26} 
/>
```

**Add to imports:**
```typescript
import { buildFacilityAlt, buildAccommodationIconAlt, buildFlagAlt, buildLocationIconAlt } from '@/lib/utils/alt-text-helpers';
```

---

#### Task 2.3: Fix HomeAccommodationSection.tsx (2 hours)

**File:** `src/components/Home/HomeAccommodationSection.tsx`

**Changes:**

```typescript
// Lines 60-80: ❌ BEFORE
images.map((img, i) => (
  <Image
    src={img}
    alt={`image ${i}`}
    fill
    className="object-cover"
  />
))

// ✅ AFTER
images.map((img, i) => (
  <Image
    src={img}
    alt={t('accommodation.galleryImageAlt', { 
      index: i + 1, 
      total: images.length 
    })}
    fill
    className="object-cover"
  />
))
```

---

#### Task 2.4: Add All Translation Keys (4 hours)

**Add to `messages/en.json`:**

```json
{
  "PropertyCard": {
    "accommodation": {
      "iconAlt": "Accommodation available"
    },
    "country": {
      "flagAlt": "{country} flag"
    },
    "location": {
      "showOnMapAlt": "Show location on map"
    },
    "facilities": {
      "stones": {
        "iconAlt": "Pebble beach"
      },
      "family": {
        "iconAlt": "Family-friendly facilities"
      },
      "parking": {
        "iconAlt": "Parking available"
      }
    }
  },
  "Home": {
    "accommodation": {
      "galleryImageAlt": "Accommodation gallery image {index} of {total}"
    }
  }
}
```

**Repeat for all 14 languages** (use translation service or AI for quality translations)

---

### Day 5: Fix Heading Structure & Testing (8 hours)

#### Task 3.1: Audit H1 Usage on All Pages (3 hours)

**Pages to Check:**

1. **Homepage** (`/[locale]/page.tsx`)
   - Check if HeroSection has H1
   - Ensure no other components add H1
   - **Action:** Verify only ONE H1

2. **Beach Detail Pages** (`/beaches/[continent]/[country]/[...segments]/page.tsx`)
   - Check banner component
   - Check BeachDetailsSection (line 201 has H1)
   - **Action:** Remove H1 from banner OR BeachDetailsSection (keep only one)

3. **Country/Continent Pages**
   - Verify single H1
   - **Action:** Convert extra H1s to H2

**Implementation Example:**

```typescript
// ❌ BEFORE: Multiple H1s
<BannerSection>
  <h1>Beautiful Beach Name</h1>
</BannerSection>
<BeachDetailsSection>
  <h1>Beach Details</h1>  {/* ← Remove this H1 */}
</BeachDetailsSection>

// ✅ AFTER: Single H1, proper hierarchy
<BannerSection>
  <h1>Beautiful Beach Name</h1>
</BannerSection>
<BeachDetailsSection>
  <h2>Beach Details</h2>  {/* ← Changed to H2 */}
</BeachDetailsSection>
```

---

#### Task 3.2: Testing & Verification (5 hours)

**Checklist:**

**1. SSR Verification (1 hour)**
- [ ] Visit `/beaches` → View Page Source → See full HTML content
- [ ] Visit `/beach-map` → View Page Source → See metadata
- [ ] Visit `/about` → No hydration errors in console
- [ ] All 3 pages show in Lighthouse SEO scan

**2. Alt Text Verification (2 hours)**
- [ ] Inspect PropertyCard images → All have descriptive alt text
- [ ] Inspect HomeAccommodationSection → Alt text includes index
- [ ] Use browser accessibility inspector → No missing alt warnings
- [ ] Test with screen reader (VoiceOver/NVDA) → Images properly described

**3. Heading Structure Verification (1 hour)**
- [ ] Use browser DevTools → Search for `<h1` → Only ONE per page
- [ ] Check heading outline in accessibility tools
- [ ] Verify H2, H3, H4 hierarchy is logical

**4. Performance Testing (1 hour)**
- [ ] Run Lighthouse on `/beaches` → Score improved?
- [ ] Check console for errors
- [ ] Test on mobile
- [ ] Verify ISR revalidation works

---

## 🟠 PHASE 2: HIGH PRIORITY (Week 2)

**Goal:** Optimize performance and user experience
**Duration:** 40 hours (1 week)
**Expected Impact:** SEO 85 → 92 (+7 points), Performance +18 points

---

### Day 6-7: Add Priority Loading (8 hours)

#### Task 4.1: Add Priority to Hero Images (3 hours)

**Files to Edit:**

**1. HeroSection.tsx**

```typescript
// FILE: src/components/Home/HeroSection.tsx
// Line 51: ❌ BEFORE
<div style={{ backgroundImage: `url('${backgroundImage}')` }}>

// ✅ AFTER: Convert to <Image> with priority
<div className="relative h-full w-full">
  <Image
    src={backgroundImage}
    fill
    priority={true}  // ⬅️ CRITICAL for LCP
    alt={t('hero.backgroundAlt', { continent: continentName })}
    className="object-cover"
    sizes="100vw"
  />
</div>
```

**2. BannerSection.tsx**

```typescript
// FILE: src/components/BannerSection/BannerSection.tsx
// Line 120: ❌ BEFORE
<div style={{ backgroundImage: image ? `url(${image})` : undefined }}>

// ✅ AFTER
{image && (
  <Image
    src={image}
    fill
    priority={true}  // ⬅️ Hero image needs priority
    alt={t('banner.backgroundAlt', { location: locationName })}
    className="object-cover"
    sizes="100vw"
  />
)}
```

**3. WorldBannerSection.tsx**

```typescript
// FILE: src/components/WorldPage/WorldBanner/WorldBannerSection.tsx
// Line 37: ❌ BEFORE
<div style={{ backgroundImage: `url(${image})` }}>

// ✅ AFTER
<div className="relative">
  <Image
    src={image}
    fill
    priority={true}
    alt={t('worldBanner.backgroundAlt')}
    className="object-cover"
    sizes="100vw"
  />
</div>
```

**Translation Keys:**

```json
{
  "HeroSection": {
    "hero": {
      "backgroundAlt": "Beautiful beach landscape in {continent}"
    }
  },
  "BannerSection": {
    "banner": {
      "backgroundAlt": "Beach view of {location}"
    }
  },
  "WorldBanner": {
    "worldBanner": {
      "backgroundAlt": "World beaches map background"
    }
  }
}
```

---

#### Task 4.2: Verify LCP Improvement (2 hours)

**Before & After Testing:**

```bash
# Test before changes
npm run build
npm run start
# Open Lighthouse → Note LCP score

# After changes
npm run build
npm run start
# Open Lighthouse → Verify LCP improved by ~30-40%
```

**Expected Results:**
- **Before:** LCP ~3.5s
- **After:** LCP ~2.1s (40% improvement)

---

### Day 8-9: Add Lazy Loading to Images (12 hours)

#### Task 5.1: Add Lazy Loading to PropertyCard (2 hours)

**File:** `src/components/PropertyCard/PropertyCard.tsx`

**Changes:**
- Already has `loading="lazy"` on lines 216, 261 ✅
- **No changes needed** - already implemented!

---

#### Task 5.2: Add Lazy Loading to Other Cards (8 hours)

**Files to Edit:**

**1. AccommodationCard.tsx**

```typescript
<Image
  src={accommodationImage}
  fill
  loading="lazy"  // ⬅️ ADD
  alt={buildAccommodationImageAlt(accommodation)}
  sizes="(max-width: 768px) 100vw, 33vw"
/>
```

**2. DestinationCard.tsx**

```typescript
<Image
  src={destinationImage}
  fill
  loading="lazy"  // ⬅️ ADD
  alt={t('destination.imageAlt', { name: destination.name })}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**3. BeachCard (if exists)**

```typescript
<Image
  src={beachImage}
  fill
  loading="lazy"  // ⬅️ ADD
  alt={buildBeachImageAlt(beach)}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**Exception: First card should NOT be lazy**

```typescript
// In listing components, conditionally apply lazy loading
{beaches.map((beach, index) => (
  <BeachCard
    beach={beach}
    loading={index === 0 ? undefined : 'lazy'}  // ⬅️ First card eager, rest lazy
  />
))}
```

---

### Day 10: Convert Background Images to <Image> (8 hours)

#### Task 6.1: Convert SearchContinent.tsx (2 hours)

**File:** `src/components/Continent/SearchContinent.tsx`

```typescript
// Line 25: ❌ BEFORE
<div style={{ backgroundImage: "url('/images/hvar.jpg')" }}>

// ✅ AFTER
<div className="relative">
  <Image
    src="/images/hvar.jpg"
    fill
    alt={t('searchContinent.backgroundAlt')}
    className="object-cover"
    sizes="100vw"
  />
  {/* Content over image */}
  <div className="relative z-10">
    {/* ... */}
  </div>
</div>
```

---

#### Task 6.2: Review All Background Images (2 hours)

**Search for remaining CSS background images:**

```bash
cd /Users/davidtacer/Documents/Development/Beachrex/v2/Front/beachrex
grep -r "backgroundImage" src/components --include="*.tsx"
```

**Convert each to `<Image>` tag with proper alt text**

---

### Day 11: Performance Testing & Optimization (12 hours)

#### Task 7.1: Bundle Size Analysis (4 hours)

```bash
# Analyze bundle size
npm run build -- --analyze

# Look for:
# - Large components that could be code-split
# - Duplicate dependencies
# - Unused exports
```

#### Task 7.2: Lighthouse Testing (4 hours)

**Test all major page types:**
- [ ] Homepage
- [ ] Beach detail page
- [ ] Country page
- [ ] Beaches listing
- [ ] Beach map

**Record scores BEFORE and AFTER Phase 2:**

| Page | Before | After | Improvement |
|------|--------|-------|-------------|
| Homepage | 70 | ? | ? |
| Beach Detail | 75 | ? | ? |
| Beaches List | 0 (CSR) | ? | ? |
| Beach Map | 0 (CSR) | ? | ? |

#### Task 7.3: Real User Monitoring Setup (4 hours)

**Consider adding:**
- Google Analytics 4 (if not already)
- Web Vitals tracking
- Error tracking (Sentry)

---

## 🟡 PHASE 3: MEDIUM PRIORITY (Week 3)

**Goal:** Professional-grade code quality and SEO
**Duration:** 40 hours (1 week)
**Expected Impact:** SEO 92 → 95 (+3 points)

---

### Day 12-14: Add Semantic HTML (24 hours)

#### Task 8.1: Wrap Pages in <main> (8 hours)

**All page files in `src/app/[locale]/*/page.tsx`:**

```typescript
// ❌ BEFORE
export default async function BeachDetailPage() {
  return (
    <>
      <BannerSection />
      <BeachDetailsSection />
      <MapSection />
    </>
  );
}

// ✅ AFTER
export default async function BeachDetailPage() {
  return (
    <main>
      <BannerSection />
      <BeachDetailsSection />
      <MapSection />
    </main>
  );
}
```

**Files to Edit (~20 page files):**
- `app/[locale]/page.tsx`
- `app/[locale]/beaches/page.tsx`
- `app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx`
- All other page.tsx files

---

#### Task 8.2: Convert Cards to <article> (8 hours)

**PropertyCard.tsx, BeachCard.tsx, AccommodationCard.tsx, etc.:**

```typescript
// ❌ BEFORE
<div className="property-card">
  <h3>{title}</h3>
  <p>{description}</p>
</div>

// ✅ AFTER
<article className="property-card">
  <h3>{title}</h3>
  <p>{description}</p>
</article>
```

---

#### Task 8.3: Add <nav> to Navigation Components (4 hours)

**QuickMenu.tsx, TopBar navigation:**

```typescript
// ❌ BEFORE
<div className="navigation">
  <Link href="/">Home</Link>
  <Link href="/beaches">Beaches</Link>
</div>

// ✅ AFTER
<nav aria-label="Main navigation">
  <Link href="/">Home</Link>
  <Link href="/beaches">Beaches</Link>
</nav>
```

---

#### Task 8.4: Add <header> and <footer> (4 hours)

**Layout.tsx or shared components:**

```typescript
<header>
  <TopBar />
  <QuickMenu />
</header>

<main>{children}</main>

<footer>
  <Footer />
</footer>
```

---

### Day 15: Reduce Unnecessary Client Components (8 hours)

#### Task 9.1: Audit Client Components (4 hours)

**Create checklist:**

```typescript
// For each component with 'use client', ask:
// 1. Does it use useState, useEffect, useRef? → Must stay client
// 2. Does it have onClick, onChange handlers? → Must stay client
// 3. Does it use browser APIs (window, document)? → Must stay client
// 4. Is it purely presentational? → Convert to server
```

**Likely candidates to convert:**
- Static card components
- Footer sections
- Static text components

---

#### Task 9.2: Convert 5-10 Components to Server (4 hours)

**Example:**

```typescript
// ❌ BEFORE: src/components/Footer/FooterBrandColumn.tsx
'use client';

export default function FooterBrandColumn() {
  return (
    <div>
      <h4>Brand</h4>
      <p>Static text...</p>
    </div>
  );
}

// ✅ AFTER: Remove 'use client'
// (If it has no interactivity, it doesn't need to be client-side)

export default function FooterBrandColumn() {
  return (
    <div>
      <h4>Brand</h4>
      <p>Static text...</p>
    </div>
  );
}
```

---

### Day 16: Final Testing & Documentation (8 hours)

#### Task 10.1: Complete SEO Audit (4 hours)

**Run full audit:**

- [ ] All pages have `generateMetadata()`
- [ ] All images have descriptive alt text
- [ ] All pages have single H1
- [ ] All hero images have `priority={true}`
- [ ] 85%+ images have `loading="lazy"`
- [ ] All pages wrapped in `<main>`
- [ ] Cards use `<article>`
- [ ] Navigation uses `<nav>`

#### Task 10.2: Create Final Report (2 hours)

**Document improvements:**

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| SEO Score | 68 | ? | +? |
| Accessibility | 45 | ? | +? |
| Performance | 70 | ? | +? |
| Pages with SSR | 53% | 100% | +47% |
| Images with good alt | 20% | 95% | +75% |
| Priority images | 0 | 3 | +3 |
| Lazy images | 6 | 85+ | +79+ |

#### Task 10.3: Update Team Documentation (2 hours)

**Create/update:**
- `SEO_BEST_PRACTICES.md` (for future development)
- `ACCESSIBILITY_GUIDELINES.md`
- `DEV_HANDOFF.md` (update SEO section)

---

## 📊 SUCCESS METRICS

### Key Performance Indicators:

1. **Google Search Console**
   - Pages indexed: Track increase from current baseline
   - Impressions: Should increase by 30-50%
   - CTR: Monitor for improvements

2. **Lighthouse Scores**
   - SEO: 68 → 95 target
   - Accessibility: 45 → 90 target
   - Performance: 70 → 88 target

3. **Core Web Vitals**
   - LCP: <2.5s (currently ~3.5s)
   - FID: <100ms
   - CLS: <0.1

4. **User Metrics**
   - Bounce rate: Should decrease
   - Time on page: Should increase
   - Pages per session: Should increase

---

## 🎓 LESSONS LEARNED & FUTURE PREVENTION

### Best Practices Going Forward:

1. **Always use Server Components by default**
   - Only add `'use client'` when absolutely necessary

2. **Alt text is mandatory**
   - Create helper functions for consistent alt text
   - Use translations, not hardcoded strings

3. **One H1 per page - strict rule**
   - Document heading hierarchy in component comments

4. **Hero images always get priority**
   - First image above fold = `priority={true}`

5. **Everything else gets lazy loading**
   - Except first card in listings

6. **Semantic HTML is not optional**
   - `<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`

---

**Action Plan Generated:** 2026-01-20
**Total Tasks:** 40+ detailed tasks
**Total Duration:** 120 hours (3 weeks)
**Expected ROI:** +27 SEO points, +35 A11y points, +18 Perf points

**Ready to implement!** 🚀
