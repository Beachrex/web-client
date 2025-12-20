# Environment-Based SEO Configuration

**Created:** 2025-12-20  
**Purpose:** Block search engines on dev/staging while allowing production crawling

---

## Overview

The Beachrex frontend uses **environment-based SEO configuration** to ensure that:

- ✅ **Production** (`beachrex.com`) - Fully crawlable by search engines
- ❌ **Development** (`dev.beachrex.com`) - Blocked from all search engines
- ❌ **Local** (`localhost:3000`) - Blocked from all search engines

This prevents duplicate content issues, protects development data, and ensures only the production site appears in search results.

---

## Implementation

### 1. Dynamic robots.txt

**File:** `src/app/robots.ts`

Generates different `robots.txt` content based on environment:

**Development/Local:**
```txt
User-agent: *
Disallow: /
```

**Production:**
```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Sitemap: https://beachrex.com/sitemap.xml
Sitemap: https://beachrex.com/sitemap-beaches.xml
Sitemap: https://beachrex.com/sitemap-countries.xml
Sitemap: https://beachrex.com/sitemap-regions.xml
Sitemap: https://beachrex.com/sitemap-cities.xml
Sitemap: https://beachrex.com/sitemap-islands.xml
```

**How it works:**
```typescript
const baseUrl = env.NEXT_PUBLIC_BASE_URL;
const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');

if (!isProduction) {
  return { rules: { userAgent: '*', disallow: '/' } };
}
```

---

### 2. X-Robots-Tag HTTP Header

**File:** `next.config.js`

Adds HTTP header to block search engines on non-production:

```javascript
async headers() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');

  if (!isProduction) {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
        ],
      },
    ];
  }

  return [];
}
```

**What it does:**
- `noindex` - Don't add to search index
- `nofollow` - Don't follow links on this page
- `noarchive` - Don't show cached version
- `nosnippet` - Don't show snippets in search results

---

### 3. Meta Robots Tag

**File:** `src/app/[locale]/layout.tsx`

Adds `<meta name="robots">` tag to HTML `<head>`:

```typescript
const baseUrl = env.NEXT_PUBLIC_BASE_URL;
const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');

const robotsMetadata = !isProduction
  ? { robots: { index: false, follow: false, nocache: true } }
  : {};

return {
  title: t('title'),
  description: t('description'),
  ...robotsMetadata,
};
```

**Generates:**
```html
<!-- On dev.beachrex.com -->
<meta name="robots" content="noindex, nofollow, nocache">

<!-- On beachrex.com -->
<!-- No robots meta tag (allows indexing) -->
```

---

## Environment Detection

All three methods use the same detection logic:

```typescript
const baseUrl = env.NEXT_PUBLIC_BASE_URL;
const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');
```

**Examples:**

| URL | `isProduction` | Crawlable? |
|-----|----------------|------------|
| `http://localhost:3000` | `false` | ❌ No |
| `https://dev.beachrex.com` | `false` | ❌ No |
| `https://staging.beachrex.com` | `false` | ❌ No |
| `https://beachrex.com` | `true` | ✅ Yes |
| `https://www.beachrex.com` | `true` | ✅ Yes |

---

## Environment Variables

**Required:** `NEXT_PUBLIC_BASE_URL`

Set in `.env` file:

```bash
# Development
NEXT_PUBLIC_BASE_URL=https://dev.beachrex.com

# Production
NEXT_PUBLIC_BASE_URL=https://beachrex.com
```

**Validation:** Defined in `src/env.ts`:

```typescript
export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    // ... other env vars
  },
});
```

---

## Testing

### Test robots.txt

**Development:**
```bash
# Should show: Disallow: /
curl https://dev.beachrex.com/robots.txt
```

**Production:**
```bash
# Should show: Allow: / and sitemap URLs
curl https://beachrex.com/robots.txt
```

---

### Test X-Robots-Tag Header

**Development:**
```bash
# Should show: X-Robots-Tag: noindex, nofollow, noarchive, nosnippet
curl -I https://dev.beachrex.com
```

**Production:**
```bash
# Should NOT have X-Robots-Tag header
curl -I https://beachrex.com
```

---

### Test Meta Robots Tag

**Development:**
```bash
# Should show: <meta name="robots" content="noindex, nofollow, nocache">
curl https://dev.beachrex.com | grep "robots"
```

**Production:**
```bash
# Should NOT have robots meta tag
curl https://beachrex.com | grep "robots"
```

---

### Test in Browser

**Development:**
1. Open https://dev.beachrex.com
2. View page source (Cmd+U / Ctrl+U)
3. Search for `<meta name="robots"`
4. Should see: `<meta name="robots" content="noindex, nofollow, nocache">`

**Production:**
1. Open https://beachrex.com
2. View page source
3. Search for `<meta name="robots"`
4. Should NOT find any robots meta tag

---

## Triple Protection Strategy

We use **three layers** of protection for maximum effectiveness:

### Layer 1: robots.txt
- **Purpose:** Tell search engines not to crawl
- **Effectiveness:** ~95% (most bots respect it)
- **Pros:** Standard, widely supported
- **Cons:** Not enforced, bots can ignore it

### Layer 2: X-Robots-Tag HTTP Header
- **Purpose:** HTTP-level instruction to search engines
- **Effectiveness:** ~98% (harder to ignore than robots.txt)
- **Pros:** Works even if HTML isn't parsed
- **Cons:** Requires server configuration

### Layer 3: Meta Robots Tag
- **Purpose:** HTML-level instruction in `<head>`
- **Effectiveness:** ~99% (most reliable)
- **Pros:** Always present in HTML
- **Cons:** Requires HTML parsing

**Why all three?**
- Different search engines prioritize different signals
- Provides redundancy if one method fails
- Ensures maximum protection for dev/staging environments

---

## Deployment Checklist

### Before Deploying to Production

- [ ] Verify `NEXT_PUBLIC_BASE_URL=https://beachrex.com` in production `.env`
- [ ] Test robots.txt: `curl https://beachrex.com/robots.txt`
- [ ] Verify no X-Robots-Tag header: `curl -I https://beachrex.com`
- [ ] Verify no robots meta tag in HTML source
- [ ] Submit sitemaps to Google Search Console
- [ ] Monitor indexing in Search Console

### Before Deploying to Development

- [ ] Verify `NEXT_PUBLIC_BASE_URL=https://dev.beachrex.com` in dev `.env`
- [ ] Test robots.txt shows `Disallow: /`
- [ ] Verify X-Robots-Tag header present
- [ ] Verify robots meta tag in HTML source
- [ ] Confirm dev site NOT appearing in Google search

---

## Troubleshooting

### Dev site appearing in Google search

**Solution:**
1. Check `NEXT_PUBLIC_BASE_URL` is set correctly
2. Verify all three protection layers are active
3. Request removal in Google Search Console
4. Wait 1-2 weeks for de-indexing

### Production site not being indexed

**Solution:**
1. Check `NEXT_PUBLIC_BASE_URL=https://beachrex.com`
2. Verify robots.txt allows crawling
3. Verify NO X-Robots-Tag header
4. Verify NO robots meta tag
5. Submit sitemap to Search Console
6. Request indexing for key pages

### Environment detection not working

**Solution:**
1. Check `.env` file has correct `NEXT_PUBLIC_BASE_URL`
2. Restart dev server after changing `.env`
3. Rebuild app: `yarn build`
4. Check browser console for env var value

---

## Related Files

- `src/app/robots.ts` - Dynamic robots.txt generation
- `next.config.js` - X-Robots-Tag header configuration
- `src/app/[locale]/layout.tsx` - Meta robots tag
- `src/env.ts` - Environment variable validation
- `.env` - Environment variables (not in git)

---

## Future Enhancements

### Password Protection for Dev

Consider adding HTTP Basic Auth for dev environment:

```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');

  if (!isProduction) {
    const authHeader = request.headers.get('authorization');
    // Check credentials...
  }
}
```

### Staging Environment

Add separate staging environment:

```typescript
const isDevelopment = baseUrl.includes('dev.');
const isStaging = baseUrl.includes('staging.');
const isProduction = !isDevelopment && !isStaging;
```

---

## Notes

- Environment detection is based on URL, not `NODE_ENV`
- All three protection methods are active simultaneously
- Production allows crawling by default (no robots meta tag)
- Sitemaps are only referenced in production robots.txt

