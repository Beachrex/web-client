# Beachrex Frontend

> Multilingual beach discovery platform (14 languages)

**Tech Stack**: Next.js 14 App Router, TypeScript, TanStack Query, next-intl, Tailwind CSS

---

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

**For AI Agents & Developers** → **[ai-agent/](./ai-agent/)** folder

### Essential Reads

1. **[ai-agent/QUICK_START.md](./ai-agent/QUICK_START.md)** ⭐ - Start here (5 min)
2. **[ai-agent/LOCALIZATION_GUIDE.md](./ai-agent/LOCALIZATION_GUIDE.md)** ⭐⭐⭐ - How i18n works (CRITICAL)
3. **[ai-agent/README.md](./ai-agent/README.md)** - Complete documentation index

**10 comprehensive guides** covering:
- Architecture & tech stack
- Localization (middleware, routing, translations)
- API integration
- Component patterns
- Common issues & solutions

**2,590 lines** of documentation with visual diagrams and troubleshooting guides.

---

## 🛠️ Common Commands

```bash
yarn dev              # Start development server
yarn build            # Build for production
yarn start            # Run production build
yarn lint             # Run ESLint
yarn generate:api     # Generate API client from OpenAPI spec
yarn test:e2e         # Run Playwright E2E tests
```

---

## 🌍 Supported Languages

14 locales: en, si, de, hr, fr, es, it, ua, ru, pl, cs, hu, bg, sk

**Example URLs:**
- English: `/en/beaches/europe/belgium`
- Slovenian: `/si/plaze/evropa/belgija`
- German: `/de/strande/europa/belgien`

---

## 📦 Project Structure

```
src/
├── app/[locale]/          # Next.js App Router pages
├── components/            # React components
├── hooks/                 # Custom hooks (useLocalizedPath!)
├── lib/
│   ├── api-client/        # Auto-generated API client
│   └── utils/             # Utilities (URLs, images, SEO)
├── i18n/                  # i18n configuration
│   ├── routing.ts         # Route definitions
│   └── request.ts         # next-intl config
└── middleware.ts          # Locale detection & path rewriting

messages/                  # Translation files (14 locales)
ai-agent/                  # 📚 AI agent documentation
```

---

## ⚠️ Critical Knowledge

### Middleware Flow (MUST UNDERSTAND!)

```
User visits: /si/plaze/evropa/belgija
     ↓
1. intlMiddleware() → locale="si"
2. Rewrite: /plaze/ → /beaches/
3. Copy headers to preserve locale
4. Render page with correct locale
```

**Read**: [ai-agent/LOCALIZATION_GUIDE.md](./ai-agent/LOCALIZATION_GUIDE.md)

---

## 🐛 Troubleshooting

**Client components show wrong language?**
→ Check middleware copies intl headers ([solution](./ai-agent/LOCALIZATION_GUIDE.md#issue-1-client-components-show-wrong-language))

**404 on localized routes?**
→ Add route to `src/i18n/routing.ts` ([solution](./ai-agent/LOCALIZATION_GUIDE.md#issue-3-404-on-localized-routes))

**Translation errors?**
→ Use single braces `{var}` not `{{var}}` ([solution](./ai-agent/LOCALIZATION_GUIDE.md#issue-2-intlerror-malformed_argument))

---

## 🔗 Links

- **Backend API**: https://dev-api.beachrex.com/docs
- **Production**: https://beachrex.com
- **Staging**: https://dev.beachrex.com

---

## 📄 License

Proprietary - Beachrex © 2026
