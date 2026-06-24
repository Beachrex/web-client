# Beachrex AI Agent Documentation

> **Purpose**: Comprehensive documentation for AI agents and developers working on Beachrex frontend.

**Last Updated**: 2026-05-29  
**Version**: 1.0.0

---

## 📚 Documentation Index

### Core Architecture
1. **[ARCHITECTURE_BLUEPRINT.md](./ARCHITECTURE_BLUEPRINT.md)** - Complete system overview
   - Project structure
   - Technology stack
   - Key concepts
   - Development workflow

### Specialized Guides

2. **[LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md)** ⭐ **CRITICAL**
   - How i18n works (14 languages)
   - Middleware architecture
   - Common localization issues & solutions
   - Adding new locales

3. **[ROUTING_GUIDE.md](./ROUTING_GUIDE.md)**
   - Route hierarchy (World → Beach)
   - File structure
   - URL generation
   - Dynamic routing patterns

4. **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)**
   - OpenAPI client generation
   - TanStack Query patterns
   - Caching strategy
   - Type safety

5. **[COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md)**
   - Server vs Client components
   - Reusable components
   - Performance optimization
   - Common anti-patterns

### SEO & Technical

6. **[SEO_STATUS_AND_TASKS.md](./SEO_STATUS_AND_TASKS.md)** ⭐ **COMPREHENSIVE**
   - Complete SEO implementation status (75% complete)
   - What's done: Metadata, sitemaps, JSON-LD, hreflang
   - What needs work: Image alt text, page speed
   - Future task tracker with priorities

7. **[SEO_QUICK_REFERENCE.md](./SEO_QUICK_REFERENCE.md)**
   - Quick SEO templates & patterns
   - Copy-paste metadata examples
   - Testing commands

---

## 🚀 Quick Start

### 1. Setup Development Environment

```bash
# Clone repository
cd Front/beachrex

# Install dependencies
yarn install

# Start development server
yarn dev
```

**Open**: http://localhost:3000

### 2. Key Files to Know

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Locale detection & path rewriting |
| `src/i18n/routing.ts` | Localized route definitions |
| `src/hooks/useLocalizedPath.ts` | Path translation logic |
| `src/lib/api-client/` | Auto-generated API client |
| `src/lib/utils/destination-url.ts` | Localized URL builders |
| `src/lib/utils/json-ld-helpers.ts` | SEO structured data helpers |
| `messages/{locale}.json` | Translation files |

### 3. Common Tasks

**Add a new translation:**
```bash
# 1. Edit messages/{locale}.json
# 2. Use in component: t('key', { variable: 'value' })
```

**Generate API client:**
```bash
yarn generate:api
```

**Run tests:**
```bash
yarn test:e2e
```

**Build for production:**
```bash
yarn build
```

---

## ⚠️ Critical Knowledge

### Localization

**The #1 thing to understand**: How middleware handles localized routes

```
User visits: /si/plaze/evropa/belgija
     ↓
1. intlMiddleware() → locale="si"
2. Rewrite: /plaze/ → /beaches/
3. Copy headers to preserve locale
4. Render: app/[locale]/beaches/[continent]/[country]/page.tsx
     ↓
Result: Both server & client components get locale="si" ✅
```

**Read**: [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md) first!

### Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Bypass intlMiddleware | Client components show wrong language | Run intlMiddleware FIRST, copy headers |
| Use `{{var}}` in translations | IntlError | Use single braces `{var}` |
| Missing route in routing.ts | 404 errors | Add route to pathnames for all locales |
| Client component for static content | Larger bundle, no SSR | Use server components by default |

---

## 🛠️ Development Workflow

### Making Changes

1. **Create branch** from `main`
2. **Make changes** following patterns in guides
3. **Test locally** at http://localhost:3000
4. **Run linter**: `yarn lint`
5. **Commit** with descriptive message
6. **Push** and create MR/PR

### Testing Localization

```bash
# Test all locale variations
http://localhost:3000/en/beaches/europe/belgium
http://localhost:3000/si/plaze/evropa/belgija
http://localhost:3000/de/strande/europa/belgien
# etc for all 14 locales
```

**Check:**
- ✅ Direct URL access works
- ✅ Language switcher translates path correctly
- ✅ All strings show correct language (server & client)
- ✅ No console errors

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Languages** | 14 (en, si, de, hr, fr, es, it, ua, ru, pl, cs, hu, bg, sk) |
| **Routes** | 6 main types (World, Continent, Country, Region, City, Beach) |
| **Components** | ~50 reusable components |
| **API Endpoints** | ~30 endpoints |
| **Bundle Size** | ~200KB (gzipped) |

---

## 🔗 External Resources

### Official Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [next-intl](https://next-intl-docs.vercel.app/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)

### Project-Specific
- **Backend API**: https://dev-api.beachrex.com/docs
- **Design System**: (Coming soon)
- **E2E Test Reports**: (Playwright reports)

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
yarn build
```

### API Client Issues

```bash
# Regenerate API client
yarn generate:api
```

### Translation Errors

**Check**:
1. Single braces in JSON: `{var}` not `{{var}}`
2. Namespace exists in all locale files
3. No syntax errors in JSON

### Locale Detection Issues

**Enable logging** in `src/middleware.ts`:
```typescript
console.log('Detected locale:', locale);
console.log('Original path:', pathname);
console.log('Rewritten path:', rewrittenPath);
```

---

## 📝 Contributing Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Pre-commit hook runs automatically
- **Formatting**: Prettier (via ESLint)
- **Components**: Functional components only
- **Naming**: camelCase for variables, PascalCase for components

### Commit Messages

```
feat: Add region page localization
fix: Language switcher on country pages
docs: Update API integration guide
refactor: Extract breadcrumb logic to hook
test: Add E2E tests for beach filters
```

---

## 🤝 Getting Help

### For AI Agents

**Before asking**:
1. Read relevant guide from this folder
2. Check console logs for errors
3. Verify file exists and syntax is correct

**When stuck**:
1. Describe what you tried
2. Share error messages
3. Link to relevant code

### For Developers

**Internal**: Slack #frontend-dev  
**External**: GitHub Issues

---

## 📅 Maintenance

This documentation is maintained by the frontend team.

**Update frequency**: After major architecture changes

**Last reviewed**: 2026-05-29

---

## License

Proprietary - Beachrex © 2026

