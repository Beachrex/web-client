# Internal AI Playground - Production Guard Verification

## Overview

The `/internal/ai-playground` page is protected by a production guard that returns 404 in production environments.

**Guard Logic** (from `src/app/internal/ai-playground/page.tsx`):
```typescript
const baseUrl = env.NEXT_PUBLIC_BASE_URL;
const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');

if (isProduction) {
  notFound();
}
```

---

## How to Verify the Production Guard

### ✅ Test 1: Development (Should Allow Access)

**Environment Variables:**
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Expected Result:** ✅ Page loads successfully

**Test Command:**
```bash
yarn dev
# Open http://localhost:3000/internal/ai-playground
# Should see: "AI Playground (Internal)" page
```

---

### ✅ Test 2: Staging (Should Allow Access)

**Environment Variables:**
```bash
NEXT_PUBLIC_BASE_URL=https://dev.beachrex.com
```

**Expected Result:** ✅ Page loads successfully

**Test Command:**
```bash
NEXT_PUBLIC_BASE_URL=https://dev.beachrex.com yarn dev
# Open http://localhost:3000/internal/ai-playground
# Should see: "AI Playground (Internal)" page
```

---

### ❌ Test 3: Production (Should Block Access)

**Environment Variables:**
```bash
NEXT_PUBLIC_BASE_URL=https://beachrex.com
```

**Expected Result:** ❌ 404 Not Found

**Test Command:**
```bash
NEXT_PUBLIC_BASE_URL=https://beachrex.com yarn dev
# Open http://localhost:3000/internal/ai-playground
# Should see: "404: This page could not be found."
```

---

### ❌ Test 4: Production with www (Should Block Access)

**Environment Variables:**
```bash
NEXT_PUBLIC_BASE_URL=https://www.beachrex.com
```

**Expected Result:** ❌ 404 Not Found

**Test Command:**
```bash
NEXT_PUBLIC_BASE_URL=https://www.beachrex.com yarn dev
# Open http://localhost:3000/internal/ai-playground
# Should see: "404: This page could not be found."
```

---

## Environment Detection Logic

The guard uses the same logic as the project's SEO blocking system (see `docs/ENVIRONMENT_BASED_SEO.md`):

| Environment | `NEXT_PUBLIC_BASE_URL` | `isProduction` | Access |
|-------------|------------------------|----------------|--------|
| Local | `http://localhost:3000` | `false` | ✅ Allowed |
| Dev | `https://dev.beachrex.com` | `false` | ✅ Allowed |
| Staging | `https://staging.beachrex.com` | `false` | ✅ Allowed |
| Production | `https://beachrex.com` | `true` | ❌ Blocked (404) |
| Production | `https://www.beachrex.com` | `true` | ❌ Blocked (404) |

---

## Files Involved

1. **`src/app/internal/ai-playground/page.tsx`** - Production guard implementation
2. **`src/env.ts`** - Environment variable validation
3. **`src/middleware.ts`** - Skips i18n for `/internal` routes
4. **`src/app/internal/layout.tsx`** - Minimal layout (no header/footer)

---

## Security Notes

- ✅ **Production guard is client-side** (runs in browser)
- ✅ **Returns 404** (not 403, to avoid revealing existence)
- ✅ **Uses existing env conventions** (same as SEO blocking)
- ✅ **No new environment variables** (reuses `NEXT_PUBLIC_BASE_URL`)
- ⚠️ **Not a security feature** (internal tooling only, not sensitive data)

---

## Deployment Checklist

Before deploying to production:

- [ ] Verify `NEXT_PUBLIC_BASE_URL=https://beachrex.com` in production `.env`
- [ ] Test `/internal/ai-playground` returns 404 in production build
- [ ] Verify dev/staging environments still have access
- [ ] Confirm no links to `/internal/*` in public pages

---

## Related Documentation

- `docs/ENVIRONMENT_BASED_SEO.md` - Environment detection pattern
- `docs/ai/implementation/STATE.md` - Frontend testing infrastructure
- `src/env.ts` - Environment variable schema

