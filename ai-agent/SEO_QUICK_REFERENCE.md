# SEO Quick Reference Guide

**Purpose:** Fast lookup for SEO implementation patterns in Beachrex  
**AI Agent:** Use this for quick reference when implementing SEO features

---

## 🚀 Quick Status

| Feature | Status | See Full Details |
|---------|--------|------------------|
| **Metadata** | ✅ Complete | SEO_STATUS_AND_TASKS.md |
| **URLs** | ✅ Localized | ROUTING_GUIDE.md |
| **Sitemaps** | ✅ Complete | SEO_STATUS_AND_TASKS.md |
| **JSON-LD** | ✅ Complete | SEO_STATUS_AND_TASKS.md |
| **Image Alt** | ⚠️ 60% | SEO_STATUS_AND_TASKS.md |
| **Page Speed** | ⚠️ 50% | SEO_STATUS_AND_TASKS.md |

---

## 📄 Page Metadata Template

**File:** Any `page.tsx` file  
**Pattern:** Always export `generateMetadata` function

```typescript
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildDestinationUrl } from '@/lib/utils/destination-url';

type Props = {
  params: { locale: string; [key: string]: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'yourNamespace' });
  
  const title = t('meta.title');
  const description = t('meta.description');
  const url = buildDestinationUrl({ type: 'beaches', locale });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Beachrex',
      locale,
      type: 'website',
      images: [
        {
          url: 'https://beachrex.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://beachrex.com/twitter-image.jpg'],
    },
    alternates: {
      canonical: url,
      languages: {
        'en': buildDestinationUrl({ type: 'beaches', locale: 'en' }),
        'si': buildDestinationUrl({ type: 'beaches', locale: 'si' }),
        'hr': buildDestinationUrl({ type: 'beaches', locale: 'hr' }),
        'de': buildDestinationUrl({ type: 'beaches', locale: 'de' }),
        'it': buildDestinationUrl({ type: 'beaches', locale: 'it' }),
        'fr': buildDestinationUrl({ type: 'beaches', locale: 'fr' }),
        'es': buildDestinationUrl({ type: 'beaches', locale: 'es' }),
        'pt': buildDestinationUrl({ type: 'beaches', locale: 'pt' }),
        'nl': buildDestinationUrl({ type: 'beaches', locale: 'nl' }),
        'pl': buildDestinationUrl({ type: 'beaches', locale: 'pl' }),
        'cs': buildDestinationUrl({ type: 'beaches', locale: 'cs' }),
        'sk': buildDestinationUrl({ type: 'beaches', locale: 'sk' }),
        'hu': buildDestinationUrl({ type: 'beaches', locale: 'hu' }),
        'ro': buildDestinationUrl({ type: 'beaches', locale: 'ro' }),
        'x-default': buildDestinationUrl({ type: 'beaches', locale: 'en' }),
      },
    },
  };
}
```

---

## 🔗 URL Building Functions

**File:** `src/lib/utils/destination-url.ts`

### For Continents:
```typescript
import { buildContinentUrl } from '@/lib/utils/destination-url';

const url = buildContinentUrl({ continentCode: 'EU', locale: 'si' });
// Output: /si/plaze/EU
```

### For Countries:
```typescript
import { buildCountryUrl } from '@/lib/utils/destination-url';

const url = buildCountryUrl({ 
  continentCode: 'EU', 
  countrySlug: 'slovenia', 
  locale: 'de' 
});
// Output: /de/strande/EU/slovenia
```

### For Beaches:
```typescript
import { buildBeachUrl } from '@/lib/utils/beach-urls';

const url = buildBeachUrl({
  continentCode: beach.continent_code,
  countrySlug: beach.country_slug,
  segments: [beach.region_slug, beach.city_slug, beach.slug],
  locale
});
// Output: /si/plaze/EU/slovenia/primorska/portoroz/beach-name
```

### Generic Destination URL:
```typescript
import { buildDestinationUrl } from '@/lib/utils/destination-url';

const url = buildDestinationUrl({ 
  type: 'beaches', // Will be localized
  locale: 'fr' 
});
// Output: /fr/plages
```

---

## 📊 JSON-LD Structured Data

**File:** `src/lib/utils/json-ld-helpers.ts`

### Organization Schema (Site-wide):
```typescript
import { buildOrganizationSchema, renderJsonLd } from '@/lib/utils/json-ld-helpers';

const t = await getTranslations({ locale, namespace: 'common' });
const orgSchema = buildOrganizationSchema(t('site.description'));

return (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: renderJsonLd(orgSchema) }}
  />
);
```

### Breadcrumb Schema:
```typescript
import { buildBreadcrumbSchema, renderJsonLd } from '@/lib/utils/json-ld-helpers';

const breadcrumbs = [
  { name: t('breadcrumb.home'), url: `https://beachrex.com/${locale}` },
  { name: t('breadcrumb.beaches'), url: buildDestinationUrl({ type: 'beaches', locale }) },
  { name: continentName, url: buildContinentUrl({ continentCode, locale }) },
];

const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

return (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbSchema) }}
  />
);
```

### Beach (TouristAttraction) Schema:
```typescript
import { buildBeachSchema, renderJsonLd } from '@/lib/utils/json-ld-helpers';

const beachSchema = buildBeachSchema(beach, locale);

return (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: renderJsonLd(beachSchema) }}
  />
);
```

---

## 🖼️ Image Alt Text Pattern

### For Beach Images:
```typescript
import { Image } from 'next/image';

<Image
  src={beach.main_image}
  alt={t('beach.imageAlt', { beachName: beach.name })}
  width={400}
  height={300}
  loading="lazy"
/>
```

### Translation Key:
```json
{
  "beach": {
    "imageAlt": "Beach photo of {beachName}"
  }
}
```

---

## 🗺️ Sitemap Files Location

| Sitemap | File Path | Purpose |
|---------|-----------|---------|
| **Main Index** | `src/app/sitemap.ts` | Points to all sub-sitemaps |
| **Static Pages** | `src/app/sitemap/static.xml/route.ts` | Homepage, About, etc. |
| **Countries** | `src/app/sitemap/countries.xml/route.ts` | All country pages |
| **Regions** | `src/app/sitemap/regions.xml/route.ts` | All region pages |
| **Cities** | `src/app/sitemap/cities.xml/route.ts` | All city pages |
| **Beaches** | `src/app/sitemap/beaches.xml/route.ts` | All beach pages |

---

## 🤖 Testing Commands

### Check which pages have SEO metadata:
```bash
find src/app/\[locale\] -name "page.tsx" -exec grep -l "generateMetadata" {} \;
```

### Check which pages are MISSING SEO metadata:
```bash
find src/app/\[locale\] -name "page.tsx" -exec sh -c 'grep -L "generateMetadata" "$1" && echo "$1"' _ {} \;
```

### Test sitemap locally:
```bash
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/sitemap/static.xml
curl http://localhost:3000/sitemap/beaches.xml
```

### Test robots.txt:
```bash
curl http://localhost:3000/robots.txt
```

---

**Full Documentation:** See `SEO_STATUS_AND_TASKS.md` for complete details
