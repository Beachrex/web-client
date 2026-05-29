# Architecture Diagrams

> **Visual representations** of Beachrex frontend architecture

**Last Updated**: 2026-05-29

---

## Localization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ User visits: /si/plaze/evropa/belgija                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ [Middleware] src/middleware.ts                                  │
│                                                                  │
│  1. Run intlMiddleware(request)                                 │
│     ├─> Detect locale from URL: "si"                            │
│     ├─> Set locale in response headers                          │
│     └─> Validate against supported locales                      │
│                                                                  │
│  2. Check path for localized route words                        │
│     └─> Found: "plaze" in path                                  │
│                                                                  │
│  3. Rewrite path to internal route                              │
│     └─> /si/plaze/... → /si/beaches/...                         │
│                                                                  │
│  4. Copy intl headers to rewrite response (CRITICAL!)           │
│     └─> Preserves locale="si" context                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ [Next.js Routing]                                               │
│                                                                  │
│ Matches: app/[locale]/beaches/[continent]/[country]/page.tsx    │
│                                                                  │
│ Params: { locale: "si", continent: "evropa", country: "belgija" }│
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ [Server Component Rendering]                                    │
│                                                                  │
│ const t = await getTranslations({ locale: "si", ... })          │
│ ✅ Server components: Slovenian strings                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ [Client Component Hydration]                                    │
│                                                                  │
│ const t = useTranslations('Common')                             │
│ ✅ Client components: Slovenian strings (via headers)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Route Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│                         WORLD (Homepage)                          │
│                    app/[locale]/page.tsx                          │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      CONTINENTS LISTING                           │
│                  app/[locale]/beaches/page.tsx                    │
│                                                                   │
│  URL: /en/beaches, /si/plaze                                     │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      CONTINENT PAGE                               │
│             app/[locale]/beaches/[continent]/page.tsx             │
│                                                                   │
│  URL: /en/beaches/europe, /si/plaze/evropa                       │
│  Shows: Countries in continent                                   │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                       COUNTRY PAGE                                │
│      app/[locale]/beaches/[continent]/[country]/page.tsx          │
│                                                                   │
│  URL: /en/beaches/europe/belgium                                 │
│  Shows: Regions, Cities, Islands, Popular beaches                │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│               REGION / ISLAND / CITY / BEACH                      │
│   app/[locale]/beaches/[continent]/[country]/[...segments]/      │
│                       page.tsx                                    │
│                                                                   │
│  Catch-all route handles:                                        │
│  ├─ Region:  /en/beaches/europe/belgium/flanders                 │
│  ├─ Island:  /en/beaches/europe/greece/crete                     │
│  ├─ City:    /en/beaches/europe/belgium/flanders/bruges          │
│  └─ Beach:   /en/.../flanders/bruges/zeebrugge-beach             │
└──────────────────────────────────────────────────────────────────┘
```

---

## API Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      SERVER COMPONENT                             │
│               (app/[locale]/.../page.tsx)                         │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ Direct API call
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API CLIENT (Generated)                         │
│               src/lib/api-client/sdk.gen.ts                       │
│                                                                   │
│  getCountryDetails({ path: { slug }, query: { locale } })        │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ HTTP GET
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND REST API                               │
│             https://dev-api.beachrex.com/api/                     │
│                                                                   │
│  GET /countries/{slug}?locale=si                                 │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ JSON Response
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SERVER COMPONENT                               │
│                                                                   │
│  const data: CountryDetails = await getCountryDetails(...)       │
│  return <CountryView data={data} />                              │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ Props
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENT COMPONENT                               │
│              components/CountryView.tsx                           │
│                                                                   │
│  function CountryView({ data }) {                                │
│    // Optional: Use TanStack Query for live updates              │
│    const { data: liveData } = useQuery({                         │
│      queryKey: ['country', data.id],                             │
│      queryFn: () => getCountryDetails(...),                      │
│      initialData: data  // Server data as fallback               │
│    });                                                            │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Tree

```
┌──────────────────────────────────────────────────────────────────┐
│                    app/[locale]/layout.tsx                        │
│                    (Server Component)                             │
│                                                                   │
│  - NextIntlClientProvider (wraps entire app)                     │
│  - AuthProvider (global auth state)                              │
│  - ApiClientProvider (TanStack Query)                            │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DefaultLayout                                  │
│                   (Client Component)                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────┐          │
│  │            DynamicTopBar                            │          │
│  │          (Client Component)                         │          │
│  │  - Language switcher                                │          │
│  │  - Search                                           │          │
│  │  - User menu                                        │          │
│  └────────────────────────────────────────────────────┘          │
│                                                                   │
│  ┌────────────────────────────────────────────────────┐          │
│  │            {children}                               │          │
│  │         (Page Component)                            │          │
│  └────────────────────────────────────────────────────┘          │
│                                                                   │
│  ┌────────────────────────────────────────────────────┐          │
│  │            Footer                                   │          │
│  │          (Client Component)                         │          │
│  └────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

---

## State Management

```
┌──────────────────────────────────────────────────────────────────┐
│                        STATE TYPES                                │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SERVER STATE (API Data)                                          │
│ Managed by: TanStack Query                                       │
│                                                                  │
│  - Beach listings                                                │
│  - Country details                                               │
│  - User preferences (from API)                                   │
│                                                                  │
│  Cache: 5min stale, 30min cache                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CLIENT STATE (Global UI)                                         │
│ Managed by: React Context                                        │
│                                                                  │
│  - Auth state (user, session)                                    │
│  - API client config                                             │
│                                                                  │
│  Location: src/contexts/                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ URL STATE (Filters, Pagination)                                  │
│ Managed by: Next.js Router (useSearchParams)                     │
│                                                                  │
│  - Filter selections                                             │
│  - Current page number                                           │
│  - Sort order                                                    │
│                                                                  │
│  Example: /beaches?type=sandy&page=2                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LOCAL STATE (Component-specific)                                 │
│ Managed by: useState, useReducer                                 │
│                                                                  │
│  - Accordion expanded/collapsed                                  │
│  - Modal open/closed                                             │
│  - Form input values                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

