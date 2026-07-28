# Beachrex Frontend Architecture Blueprint

> **Purpose**: Comprehensive guide for AI agents and developers working on the Beachrex frontend codebase.

**Last Updated**: 2026-05-29  
**Version**: 1.0.0  
**Tech Stack**: Next.js 14, TypeScript, React 18, TanStack Query, next-intl, Tailwind CSS

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Internationalization (i18n)](#internationalization-i18n)
5. [Routing Architecture](#routing-architecture)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Component Architecture](#component-architecture)
9. [Styling Guidelines](#styling-guidelines)
10. [Performance Optimization](#performance-optimization)
11. [SEO & Metadata](#seo--metadata)
12. [Testing Strategy](#testing-strategy)
13. [Development Workflow](#development-workflow)
14. [Common Pitfalls & Solutions](#common-pitfalls--solutions)

---

## Project Overview

**Beachrex** is a multilingual beach discovery platform that helps users find beaches worldwide.

### Key Features
- 🌍 **14 Languages**: en, si, de, hr, fr, es, it, ua, ru, pl, cs, hu, bg, sk
- 🗺️ **Hierarchical Navigation**: World → Continent → Country → Region/Island → City → Beach
- 🔍 **Advanced Filtering**: Beach type, user type, distance-based search
- 🗺️ **Interactive Maps**: Leaflet-based beach mapping
- 📱 **Responsive Design**: Mobile-first approach
- ⚡ **SSR/SSG**: Server-side rendering for SEO optimization

### Architecture Principles
1. **Server-First**: Maximize server-side rendering for SEO and performance
2. **Progressive Enhancement**: Client-side features enhance, not replace, server functionality
3. **Type Safety**: Strict TypeScript throughout the codebase
4. **API-Driven**: OpenAPI-generated client for backend communication
5. **Locale-Aware**: All routes and content are localized

---

## Technology Stack

### Core Framework
- **Next.js 14.2.35**: App Router, Server Components, Route Handlers
- **React 18.3.1**: Server & Client Components
- **TypeScript**: Strict mode enabled

### State Management & Data Fetching
- **TanStack Query v5**: Server state management, caching, prefetching
- **React Context**: Auth state, API client configuration

### Internationalization
- **next-intl 3.20.0**: Internationalization library
- **Custom Middleware**: Path translation for localized routes

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Open Sans**: Google Font via next/font

### Maps & Visualization
- **Leaflet 1.9.4**: Map rendering
- **react-leaflet 4.2.1**: React bindings
- **react-leaflet-cluster**: Marker clustering

### Development Tools
- **Playwright**: E2E testing with Zephyr Scale integration
- **ESLint**: Code linting
- **Husky**: Pre-commit hooks
- **Bundle Analyzer**: Bundle size analysis

### Backend Integration
- **OpenAPI TypeScript Generator**: Auto-generated API client from OpenAPI spec
- **Zod**: Runtime validation

---

## Project Structure

```
Front/beachrex/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # Locale-based routing
│   │   │   ├── layout.tsx            # Root layout with NextIntlClientProvider
│   │   │   ├── page.tsx              # Homepage (World page)
│   │   │   ├── beaches/              # Beach hierarchy routes
│   │   │   │   ├── page.tsx          # All continents listing
│   │   │   │   ├── [continent]/
│   │   │   │   │   ├── page.tsx      # Continent page
│   │   │   │   │   └── [country]/
│   │   │   │   │       ├── page.tsx  # Country page
│   │   │   │   │       └── [...segments]/
│   │   │   │   │           └── page.tsx  # Region/Island/City/Beach (catch-all)
│   │   │   ├── beach-map/            # Interactive map view
│   │   │   ├── beach-type/           # Beach type filtering
│   │   │   ├── user-type/            # User type filtering
│   │   │   └── about/                # About page
│   │   ├── config/
│   │   │   └── locales.ts            # Supported locales configuration
│   │   ├── robots.ts                 # robots.txt generator
│   │   └── sitemap.ts                # Dynamic sitemap generation
│   ├── components/                   # React components
│   │   ├── Beach/                    # Beach-specific components
│   │   ├── Continent/                # Continent page components
│   │   ├── CityPage/                 # City page components
│   │   ├── WorldPage/                # World page components
│   │   ├── Map/                      # Map components
│   │   ├── PropertySection.tsx       # Reusable property/beach listing
│   │   ├── DynamicTopBar.tsx         # Navigation bar (client component)
│   │   ├── DynamicBreadcrumbs.tsx    # Breadcrumb navigation
│   │   └── ...
│   ├── hooks/                        # Custom React hooks
│   │   ├── useLocalizedPath.ts       # Path localization logic
│   │   ├── useBeaches.ts             # Beach data fetching
│   │   ├── useContinents.ts          # Continent data
│   │   ├── useCountryDetails.ts      # Country details
│   │   └── ...
│   ├── lib/                          # Utility libraries
│   │   ├── api-client/               # Auto-generated OpenAPI client
│   │   ├── utils/
│   │   │   ├── beach-urls.ts         # URL generation utilities
│   │   │   ├── beach-images.ts       # CDN image URL helpers
│   │   │   ├── seo-helpers.ts        # SEO metadata generation
│   │   │   └── json-ld-helpers.ts    # Structured data helpers
│   │   ├── mappers/                  # Data transformation utilities
│   │   └── constants/                # App-wide constants
│   ├── i18n/                         # Internationalization config
│   │   ├── request.ts                # next-intl request configuration
│   │   └── routing.ts                # Localized routing definitions
│   ├── contexts/                     # React contexts
│   │   └── AuthContext.tsx           # Authentication state
│   ├── types/                        # TypeScript type definitions
│   └── middleware.ts                 # Next.js middleware (locale detection + path rewriting)
├── messages/                         # Translation files
│   ├── en.json                       # English translations
│   ├── si.json                       # Slovenian translations
│   └── ...                           # 14 total locales
├── public/                           # Static assets
├── e2e/                              # Playwright E2E tests
├── docs/                             # Project documentation
├── ai-agent/                         # AI agent documentation (this folder)
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
└── tsconfig.json                     # TypeScript configuration
```

---

## Internationalization (i18n)

### Overview
Beachrex uses **next-intl** for comprehensive i18n support across 19 languages.

### Architecture

#### 1. Configuration Files

**`src/app/config/locales.ts`**
```typescript
export const locales = ['en', 'si', 'de', 'hr', 'fr', 'es', 'it', 'ua', 'ru', 'pl', 'cs', 'hu', 'bg', 'sk'] as const;
export type Locale = typeof locales[number];
```

**`src/i18n/routing.ts`**
- Defines localized route patterns for all supported locales
- Maps internal routes (e.g., `/beaches`) to locale-specific URLs (e.g., `/plaze`, `/strande`, `/playas`)
- **Critical**: All dynamic routes MUST be defined here for proper locale detection

**`src/i18n/request.ts`**
- Configures next-intl request handling
- Loads appropriate message bundle based on detected locale

#### 2. Middleware Architecture

**`src/middleware.ts`** - **CRITICAL COMPONENT**

```typescript
// Execution order:
// 1. Run next-intl middleware FIRST to detect locale
// 2. Check if path contains localized route word (e.g., "plaze", "strande")
// 3. Rewrite localized path to internal English path (e.g., /plaze → /beaches)
// 4. Preserve locale context headers from intl middleware in rewrite response
```

**Why This Order Matters:**
- ✅ **Correct**: intlMiddleware → rewrite → copy headers → return
- ❌ **Wrong**: rewrite → return (bypasses locale detection, breaks client components)

**Example Flow:**
1. User visits: `/si/plaze/evropa/belgija`
2. intlMiddleware detects locale: `si`
3. Middleware rewrites: `/si/plaze/...` → `/si/beaches/...` (internal routing)
4. Headers preserve locale context
5. Next.js renders: `app/[locale]/beaches/[continent]/[country]/page.tsx`
6. Both server & client components receive correct `si` locale

#### 3. Translation Files

**Location**: `messages/{locale}.json`

**Structure Example** (`messages/si.json`):
```json
{
  "Common": {
    "showLess": "Prikaži manj",
    "showMore": "Prikaži več"
  },
  "countryPage": {
    "popularBeachesTitle": "Najbolj obiskane plaže {country}",
    "featuredAccommodationTitle": "Izpostavljene namestitve {country}"
  }
}
```

**Important Rules:**
- ✅ Use **single** curly braces for variables: `{country}`, `{count}`
- ❌ Never use double braces: `{{country}}` (causes IntlError)
- Variables are interpolated using next-intl's `t()` function

#### 4. Using Translations

**Server Components:**
```typescript
import { getTranslations } from 'next-intl/server';

export default async function Page({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'countryPage' });

  return <h1>{t('popularBeachesTitle', { country: 'Belgium' })}</h1>;
}
```

**Client Components:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('Common');

  return <button>{t('showMore')}</button>;
}
```

#### 5. Localized Routing

**Route Definitions** (`src/i18n/routing.ts`):
```typescript
pathnames: {
  '/beaches': {
    en: '/beaches',
    si: '/plaze',
    de: '/strande',
    // ... all 19 locales
  },
  '/beaches/[continent]/[country]': {
    en: '/beaches/[continent]/[country]',
    si: '/plaze/[continent]/[country]',
    // ... all 19 locales
  }
}
```

**URL Examples:**
- English: `/en/beaches/europe/belgium`
- Slovenian: `/si/plaze/evropa/belgija`
- German: `/de/strande/europa/belgien`

---


## State Management

**TanStack Query** for server state (API data, caching)  
**React Context** for client state (auth, global UI)  
**URL State** for filters, pagination

See [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) for details.

---

## Component Architecture

**Server Components** (default): Pages, SEO content, data fetching  
**Client Components** (`'use client'`): Interactive features, browser APIs

See [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) for patterns.

---

## Performance & SEO

**Code Splitting**: Dynamic imports for large components  
**Image Optimization**: CDN integration + Next.js Image  
**Caching**: TanStack Query (5min stale) + Next.js static generation  
**Metadata**: Dynamic per route with alternates for all locales  
**Structured Data**: JSON-LD schemas for SEO

---

## Testing

**E2E**: Playwright with Zephyr Scale integration

```bash
yarn test:e2e           # Run tests
yarn test:e2e:ui        # Interactive
yarn test:e2e:ci        # CI + upload
```

---

## Development Workflow

1. Create branch from `main`
2. Make changes following patterns
3. Test locally: `yarn dev`
4. Lint: `yarn lint`
5. Commit & push
6. Create MR/PR

---

## Common Pitfalls & Solutions

### 1. Client Components Show Wrong Language
**Fix**: Middleware must run intlMiddleware FIRST, copy headers to rewrite

### 2. 404 on Localized Routes
**Fix**: Add route pattern to `src/i18n/routing.ts` pathnames for ALL locales

### 3. Translation Errors
**Fix**: Use single braces `{var}` not double `{{var}}` in JSON

### 4. Large Bundle Size
**Fix**: Use dynamic imports, ensure components are Server by default

### 5. Slow API Calls
**Fix**: Prefetch on hover, use TanStack Query caching, pass server data as initialData

---

## Additional Resources

- **[LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md)** - Complete i18n reference
- **[ROUTING_GUIDE.md](./ROUTING_GUIDE.md)** - Routing patterns
- **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** - API usage
- **[COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md)** - Component best practices

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-29  
**Maintained by**: Frontend Team
