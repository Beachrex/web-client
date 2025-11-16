# Quick Reference - Flexible Geographic URLs

## 🎯 The Problem

Beaches have varying hierarchies:
- Some have: continent → country → region → island → city → beach
- Some have: continent → country → island → beach
- Some have: continent → country → beach

**Solution:** Utilities that automatically build correct URLs based on available data.

---

## 📦 What Was Created

| File | Purpose |
|------|---------|
| `src/lib/url-builder.ts` | Build URLs from geographic data |
| `src/lib/url-parser.ts` | Parse URLs into structured data |
| `src/lib/segment-resolver.ts` | Determine what URL segments represent |
| `src/hooks/useGeographicUrl.ts` | React hooks for URL operations |
| `GEOGRAPHIC_HIERARCHY_URLS.md` | Complete technical documentation |
| `IMPLEMENTATION_GUIDE.md` | Step-by-step implementation |
| `USAGE_EXAMPLES.md` | Code examples |
| `FLEXIBLE_URLS_SUMMARY.md` | Overview and summary |

---

## 🚀 Quick Start

### 1. Build a Beach URL

```typescript
import { buildBeachUrlFromDetails } from '@/lib/url-builder';

const url = buildBeachUrlFromDetails(beachDetails);
// Automatically handles missing region/island/city
```

### 2. Use in Components

```typescript
import { Link } from '@/i18n/routing';
import { buildBeachUrlFromDetails } from '@/lib/url-builder';

<Link href={buildBeachUrlFromDetails(beach)}>
  {beach.basic_info?.name}
</Link>
```

### 3. Use Hooks

```typescript
import { useBreadcrumbs, useBeachNavigation } from '@/hooks/useGeographicUrl';

const breadcrumbs = useBreadcrumbs(beachDetails);
const { buildCityUrl, buildIslandUrl } = useBeachNavigation(beachDetails);
```

---

## 📋 Common Tasks

### Build Beach URL

```typescript
import { buildBeachUrl } from '@/lib/url-builder';

const url = buildBeachUrl({
  continent: { code: 'EU', slug: 'europe' },
  country: { code: 'HR', slug: 'croatia' },
  island: { id: 5, slug: 'hvar' },
  beach: { id: 123, slug: 'paradise-beach' },
});
// Result: /beaches/europe/croatia/hvar/paradise-beach
```

### Build Listing URL

```typescript
import { buildListingUrl } from '@/lib/url-builder';

const url = buildListingUrl({
  continent: { code: 'EU', slug: 'europe' },
  country: { code: 'HR', slug: 'croatia' },
  island: { id: 5, slug: 'hvar' },
});
// Result: /beaches/europe/croatia/hvar
```

### Determine Segment Type

```typescript
import { resolveSegmentType } from '@/lib/segment-resolver';

const info = await resolveSegmentType('hvar', {
  countryCode: 'HR',
  locale: 'en',
});

console.log(info.type); // 'island'
console.log(info.name); // 'Hvar'
```

### Generate Breadcrumbs

```typescript
import { useBreadcrumbs } from '@/hooks/useGeographicUrl';

const breadcrumbs = useBreadcrumbs(beachDetails);
// Returns: [
//   { name: 'Home', url: '/', type: 'home' },
//   { name: 'Beaches', url: '/beaches', type: 'world' },
//   { name: 'Europe', url: '/beaches/europe', type: 'continent' },
//   ...
// ]
```

---

## 🗺️ URL Patterns

| Hierarchy | Example URL |
|-----------|-------------|
| Full | `/beaches/europe/croatia/dalmatia/hvar/hvar-city/beach` |
| No region | `/beaches/asia/maldives/male-atoll/beach` |
| No island | `/beaches/europe/italy/sicily/beach` |
| Minimal | `/beaches/europe/monaco/beach` |

---

## 🔧 API Requirements

Your backend needs these endpoints (or add to existing):

```
GET /api/v1/regions?country_code={code}&slug={slug}
GET /api/v1/islands?slug={slug}
GET /api/v1/cities?country_code={code}&slug={slug}
GET /api/v1/beach-details/{slug}
```

Used by `segment-resolver.ts` to identify segment types.

---

## ✅ Migration Steps

1. **Start using URL builder** for all new code
   ```typescript
   import { buildBeachUrlFromDetails } from '@/lib/url-builder';
   ```

2. **Update existing URL generation**
   ```typescript
   // ❌ Old
   const url = `/beaches/${continent}/${country}/${region}/${city}/${beach}`;
   
   // ✅ New
   const url = buildBeachUrlFromDetails(beachDetails);
   ```

3. **Add smart detection to routes**
   ```typescript
   import { resolveSegmentType } from '@/lib/segment-resolver';
   
   const info = await resolveSegmentType(segment, { countryCode, locale });
   ```

4. **Update breadcrumbs**
   ```typescript
   import { useBreadcrumbs } from '@/hooks/useGeographicUrl';
   
   const breadcrumbs = useBreadcrumbs(beachDetails);
   ```

5. **Update navigation**
   ```typescript
   import { useBeachNavigation } from '@/hooks/useGeographicUrl';
   
   const { buildSameLevelUrl } = useBeachNavigation(currentBeach);
   ```

---

## 🧪 Test Cases

- [ ] Beach with full hierarchy (6 levels)
- [ ] Beach with island but no region
- [ ] Beach with region but no island
- [ ] Beach with only country
- [ ] Beach with region + city (no island)
- [ ] Beach with island + city (no region)
- [ ] Listing pages at each level
- [ ] Navigation between different hierarchies
- [ ] Breadcrumbs display correctly
- [ ] SEO metadata generation

---

## 📚 Documentation

- **Technical details**: `GEOGRAPHIC_HIERARCHY_URLS.md`
- **Implementation guide**: `IMPLEMENTATION_GUIDE.md`
- **Code examples**: `USAGE_EXAMPLES.md`
- **Overview**: `FLEXIBLE_URLS_SUMMARY.md`

---

## 💡 Key Concepts

### Hierarchy Order

```
continent → country → [region] → [island] → [city] → beach
```

- `[brackets]` = optional
- Island comes after region (if exists) or country (if no region)
- City comes after island (if exists) or region (if no island)

### URL Building Logic

1. Always include: continent, country
2. Add region if exists
3. Add island if exists (after region)
4. Add city if exists (after island)
5. Add beach slug last

### Segment Resolution

When parsing URLs, segments are ambiguous:
- `/beaches/europe/croatia/hvar` - is 'hvar' a region or island?

Solution: Query API to determine type using `resolveSegmentType()`

---

## 🎨 File Structure Options

### Option A: Current Structure (Easier)

Keep nested folders, add smart detection:

```
src/app/[locale]/beaches/
├── [continent]/
│   └── [country]/
│       └── [region]/     # Detects if region/island/beach
│           └── [city]/   # Detects if city/island/beach
```

### Option B: Catch-All (Cleaner)

Single route handles all:

```
src/app/[locale]/beaches/
├── [continent]/
│   └── [country]/
│       └── [...segments]/  # Handles all variations
```

---

## 🔗 Related Files

- Beach model: `app/Models/Beach.php`
- Island model: `app/Models/Island.php`
- Region model: `app/Models/Region.php`
- City model: `app/Models/City.php`
- Beach details API: `BEACH_DETAILS_API.md`

---

## 🆘 Common Issues

### Issue: URL has too many segments

**Cause:** Manually building URLs without checking for null values

**Solution:** Use `buildBeachUrl()` which automatically skips null values

### Issue: Segment type detection fails

**Cause:** API endpoint missing or returning wrong data

**Solution:** Check API endpoints exist and return correct data

### Issue: Breadcrumbs show wrong hierarchy

**Cause:** Using parsed URL instead of beach data

**Solution:** Pass `beachDetails` to `useBreadcrumbs(beachDetails)`

---

## 📞 Support

For questions or issues:
1. Check `IMPLEMENTATION_GUIDE.md` for step-by-step instructions
2. See `USAGE_EXAMPLES.md` for code examples
3. Review `GEOGRAPHIC_HIERARCHY_URLS.md` for technical details

