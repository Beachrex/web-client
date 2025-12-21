# Performance Optimization Plan
**Created:** December 21, 2025  
**Status:** Ready to Execute

---

## 🎯 Quick Wins - Immediate Impact (Today)

### 1. Remove Unused Radix UI Dependencies ⚡ HIGH IMPACT

**Finding:** Only `@radix-ui/react-slot` is used, but 13 Radix UI packages are installed.

**Unused Packages to Remove:**
```bash
npm uninstall @radix-ui/react-accordion \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-aspect-ratio \
  @radix-ui/react-avatar \
  @radix-ui/react-checkbox \
  @radix-ui/react-collapsible \
  @radix-ui/react-context-menu \
  @radix-ui/react-dialog \
  @radix-ui/react-scroll-area \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-toggle \
  @radix-ui/react-tooltip
```

**Keep:**
- `@radix-ui/react-slot` (used in button.tsx and badge.tsx)

**Expected Savings:** ~150-200 KB from bundle

---

### 2. Check for Unused Dependencies ⚡ MEDIUM IMPACT

**Potentially Unused (Need Verification):**

| Package | Used? | Action |
|---------|-------|--------|
| `swiper` | ❓ Not found in grep | Verify and remove if unused |
| `sonner` | ❓ Not found in grep | Verify and remove if unused |
| `cmdk` | ❓ Not found in grep | Verify and remove if unused |
| `input-otp` | ❓ Not found in grep | Verify and remove if unused |
| `react-resizable-panels` | ❓ Not found in grep | Verify and remove if unused |
| `next-themes` | ❓ Not found in grep | Verify and remove if unused |
| `class-variance-authority` | ❓ Not found in grep | Verify and remove if unused |

**Action:** Search each package individually to confirm usage before removing.

---

### 3. Optimize Icon Imports 🎨 HIGH IMPACT

**Current Issue:** Importing individual icons from large libraries

**Icons Used:**
- **lucide-react:** Check, ChevronRight, Facebook, Instagram, Youtube, Heart, Star
- **react-icons/ci:** CiHeart
- **react-icons/fa:** FaBed, FaTasks, FaHome, FaMap
- **react-icons/fi:** FiChevronDown, FiChevronUp, FiSearch, FiMapPin, FiCalendar, FiUsers, FiMap, FiX
- **react-icons/gi:** GiIsland, GiWorld
- **react-icons/hi:** HiChevronLeft, HiChevronRight, HiHome, HiLocationMarker, HiX
- **react-icons/md:** MdKeyboardArrowDown, MdLocationCity, MdLandscape
- **react-icons/pi:** PiUserCircle
- **react-icons/sl:** SlBriefcase

**Optimization Strategy:**

**Option A: Consolidate to Lucide React (Recommended)**
- Lucide React is tree-shakeable and modern
- Replace all react-icons with Lucide equivalents
- **Expected Savings:** 100-150 KB

**Option B: Create SVG Sprite Sheet**
- Export only used icons as inline SVGs
- Create a single sprite sheet
- **Expected Savings:** 150-200 KB

**Recommended Action:** Option A - Consolidate to Lucide React

---

## 🚀 High Priority Optimizations (This Week)

### 4. Dynamic Import Heavy Components 📦 HIGH IMPACT

**Components to Lazy Load:**

#### A. Embla Carousel (PropertyCard)
```typescript
// src/components/PropertyCard/PropertyCard.tsx
import dynamic from 'next/dynamic';

const EmblaCarousel = dynamic(() => import('./EmblaCarousel'), {
  loading: () => <div className="h-64 bg-gray-200 animate-pulse" />,
});
```

**Expected Savings:** 40-50 KB per page

#### B. Flowbite Carousel (DestinationsCarousel)
```typescript
// src/components/DestinationsCarousel.tsx
import dynamic from 'next/dynamic';

const Carousel = dynamic(() => import('flowbite-react').then(mod => ({ default: mod.Carousel })), {
  loading: () => <div className="h-96 bg-gray-200 animate-pulse" />,
});
```

**Expected Savings:** 30-40 KB per page

#### C. Heavy Page Sections
```typescript
// Lazy load CountryDestinationsSection
const CountryDestinationsSection = dynamic(() => import('@/components/CountryDestinationsSection'), {
  loading: () => <div className="min-h-[400px] bg-gray-100 animate-pulse" />,
});
```

**Expected Savings:** 20-30 KB per page

---

### 5. Add React.memo to Prevent Re-renders 🔄 MEDIUM IMPACT

**Components to Memoize:**

#### A. DestinationCard
```typescript
// src/components/DestinationCard.tsx
export const DestinationCard = React.memo(({ title, image, href }) => {
  // ... component code
}, (prevProps, nextProps) => {
  return prevProps.href === nextProps.href && prevProps.image === nextProps.image;
});
```

#### B. DestinationsCarousel
```typescript
// src/components/DestinationsCarousel.tsx
export const DestinationsCarousel = React.memo(({ items }) => {
  const handlePrev = useCallback(() => { /* ... */ }, []);
  const handleNext = useCallback(() => { /* ... */ }, []);
  
  // ... component code
});
```

#### C. DynamicSearchBeaches
```typescript
// src/components/DynamicSearchBeaches.tsx
const handlePageChange = useCallback((page: number) => {
  setCurrentPage(page);
}, []);

const handleMediaModeChange = useCallback((mode: MediaMode) => {
  setMediaMode(mode);
}, []);
```

**Expected Impact:** 20-30% reduction in re-renders

---

### 6. Optimize React Query Caching ⚡ MEDIUM IMPACT

**Current Issues:**
- Some hooks missing `staleTime` and `gcTime`
- Reference data refetching unnecessarily

**Optimizations:**

```typescript
// src/hooks/useCountries.ts
export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// src/hooks/useRegions.ts
export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegions,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
```

**Expected Impact:** 50-70% reduction in API calls

---

## 📊 Medium Priority Optimizations (Next Week)

### 7. Add ISR to All Geographic Pages 🌍 MEDIUM IMPACT

**Pages to Add ISR:**

```typescript
// src/app/[locale]/beaches/[continent]/page.tsx
export const revalidate = 3600; // 1 hour

// src/app/[locale]/beaches/[continent]/[country]/[region]/page.tsx
export const revalidate = 3600; // 1 hour

// src/app/[locale]/beaches/[continent]/[country]/[city]/page.tsx
export const revalidate = 3600; // 1 hour

// src/app/[locale]/beaches/[continent]/[country]/[island]/page.tsx
export const revalidate = 3600; // 1 hour
```

**Expected Impact:** 
- Faster page loads (served from cache)
- Reduced server load
- Better SEO (static pages)

---

### 8. Optimize Image Loading 🖼️ HIGH IMPACT

**Add Priority to Hero Images:**

```typescript
// src/components/HeroSection.tsx
<Image
  src={heroImage}
  alt="Hero"
  priority // ⭐ Add this
  width={1920}
  height={1080}
  sizes="100vw"
/>
```

**Add Sizes to All Images:**

```typescript
// src/components/PropertyCard/PropertyCard.tsx
<Image
  src={imageUrl}
  alt={beach.name}
  fill
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 410px" // ⭐ Add this
/>
```

**Expected Impact:** 30-50% improvement in LCP

---

### 9. Reduce Flowbite Bundle Size 📦 MEDIUM IMPACT

**Current Issue:** Importing entire Flowbite library

**Optimization:**

```typescript
// Instead of:
import { Carousel, Pagination } from 'flowbite-react';

// Use selective imports:
import Carousel from 'flowbite-react/lib/esm/components/Carousel';
import Pagination from 'flowbite-react/lib/esm/components/Pagination';
```

**Expected Savings:** 50-80 KB

---

## 📈 Performance Monitoring (Week 4)

### 10. Set Up Web Vitals Tracking 📊

```bash
npm install @vercel/analytics
```

```typescript
// src/app/[locale]/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🎯 Success Metrics

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| Home First Load JS | 231 KB | 150 KB | ⏳ Pending |
| Beach Detail First Load JS | 260 KB | 180 KB | ⏳ Pending |
| Largest Chunk | 183 KB | 100 KB | ⏳ Pending |
| Unused Dependencies | 13+ | 0 | 🔄 In Progress |
| LCP (Home) | Unknown | <2.5s | ⏳ Pending |
| FID | Unknown | <100ms | ⏳ Pending |

---

**Next Action:** Start with removing unused Radix UI dependencies (biggest quick win).

