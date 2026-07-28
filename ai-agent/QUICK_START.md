# Quick Start Guide

> **For**: New AI agents and developers joining the project

**Time to read**: 5 minutes  
**Last Updated**: 2026-05-29

---

## 🎯 Essential Knowledge (Read First!)

### The Most Important Thing to Understand

**Localization via Middleware**

```
User visits: /si/plaze/evropa/belgija
     ↓
1. intlMiddleware() detects locale: "si"
2. Rewrite path: /plaze/ → /beaches/ (for internal routing)
3. Copy locale headers to rewrite response (CRITICAL!)
4. Next.js renders: app/[locale]/beaches/[continent]/[country]/page.tsx
     ↓
Result: ✅ Server & client components both get locale="si"
```

**Why this matters**: If you don't copy headers, client components show wrong language!

📖 **Full details**: [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md)

---

## 📁 Project Structure (30 Second Overview)

```
Front/beachrex/
├── src/
│   ├── app/[locale]/              # Pages (Server Components)
│   │   └── beaches/               # Beach hierarchy routes
│   ├── components/                # React components
│   ├── hooks/                     # Custom hooks (useLocalizedPath!)
│   ├── lib/
│   │   ├── api-client/            # Auto-generated from OpenAPI
│   │   └── utils/                 # beach-urls.ts, beach-images.ts
│   ├── i18n/
│   │   ├── routing.ts             # Route definitions (all locales)
│   │   └── request.ts             # next-intl config
│   └── middleware.ts              # Locale detection + rewrite (CRITICAL!)
├── messages/                      # Translation files (en.json, si.json, ...)
└── ai-agent/                      # This documentation folder
```

---

## 🚦 Common Tasks

### 1. Add a New Translation

**File**: `messages/si.json` (or your locale)

```json
{
  "countryPage": {
    "newKey": "Nova vrednost {variable}"
  }
}
```

**Usage**:
```typescript
// Server Component
const t = await getTranslations({ locale, namespace: 'countryPage' });
t('newKey', { variable: 'test' });

// Client Component
'use client';
const t = useTranslations('countryPage');
t('newKey', { variable: 'test' });
```

⚠️ **Always use single braces**: `{variable}` NOT `{{variable}}`

---

### 2. Add a New Route

**Example**: Adding province level to hierarchy

**Step 1**: Route already supported by catch-all!
```
app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx
```

**Step 2**: Update page logic to detect province
```typescript
// In page.tsx
if (segments.length === 1) {
  // Could be region, province, or island - check API
  const province = await getProvinceDetails(segments[0]);
  if (province) return <ProvincePage data={province} />;
}
```

**Step 3**: Update URL builders
```typescript
// lib/utils/beach-urls.ts
if (beach.province_slug) {
  url += `/${beach.province_slug}`;
}
```

✅ **No routing config changes needed** - catch-all handles it!

---

### 3. Fix "Client Components Show English"

**Symptom**: Server content is Slovenian, but buttons/client UI is English

**Cause**: Middleware bypassed intlMiddleware

**Fix**: Check `src/middleware.ts`:
```typescript
// ✅ CORRECT ORDER
const intlResponse = intlMiddleware(request);
// ... do rewrite ...
intlResponse.headers.forEach((value, key) => {
  rewriteResponse.headers.set(key, value);
});
return rewriteResponse;

// ❌ WRONG - bypasses intl
if (needsRewrite) return NextResponse.rewrite(...);
return intlMiddleware(request);
```

---

### 4. Generate API Client

**When**: Backend API changes

```bash
# 1. Update openapi-spec.json (or download from API)
curl https://dev-api.beachrex.com/api/openapi.json > openapi-spec.json

# 2. Generate TypeScript client
yarn generate:api

# 3. Check src/lib/api-client/ for new types/methods
```

---

### 5. Debug Locale Issues

**Enable logging** in browser:

1. Open DevTools Console
2. Look for `[useLocalizedPath]` logs
3. Check what locale is detected
4. Verify path translation logic

**Add middleware logging** (temporary):
```typescript
// src/middleware.ts
console.log('Request path:', pathname);
console.log('Detected locale:', locale);
console.log('Rewritten to:', rewrittenPath);
```

---

## ⚠️ Common Mistakes (Avoid These!)

### ❌ Making Everything a Client Component

```typescript
// ❌ BAD
'use client';
export default function Page() {
  return <StaticContent />;
}
```

```typescript
// ✅ GOOD - Server by default
export default function Page() {
  return <StaticContent />;  // No 'use client' needed!
}
```

### ❌ Double Braces in Translations

```json
❌ "title": "Beaches in {{country}}"
✅ "title": "Beaches in {country}"
```

### ❌ Forgetting to Add Route to routing.ts

```typescript
// If you add a new route pattern like /beach-type/[type]
// You MUST add it to src/i18n/routing.ts for ALL 19 locales!

pathnames: {
  '/beach-type/[type]': {
    en: '/beach-type/[type]',
    si: '/tip-plaze/[type]',
    // ... all 19 locales
  }
}
```

---

## 🔗 Where to Find More Info

| Topic | Document | Priority |
|-------|----------|----------|
| How localization works | [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md) | ⭐⭐⭐ |
| Routing patterns | [ROUTING_GUIDE.md](./ROUTING_GUIDE.md) | ⭐⭐ |
| API integration | [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) | ⭐⭐ |
| Component patterns | [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) | ⭐ |
| Full architecture | [ARCHITECTURE_BLUEPRINT.md](./ARCHITECTURE_BLUEPRINT.md) | ⭐ |

---

## 🛠️ Development Checklist

Before making changes:
- [ ] Read LOCALIZATION_GUIDE.md (5 min)
- [ ] Understand middleware flow
- [ ] Know Server vs Client components

Before committing:
- [ ] Test all locales (at least EN and SI)
- [ ] Check language switcher works
- [ ] Run `yarn lint`
- [ ] No console errors

---

## 🆘 Getting Help

**For AI Agents**:
1. Check relevant guide in this folder
2. Enable console logging
3. Verify file/route exists
4. Ask human with error details

**For Developers**:
1. Slack: #frontend-dev
2. GitHub Issues
3. Check existing MRs/PRs

---

**Happy coding!** 🚀

