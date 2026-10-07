# Beachrex Frontend

> Multilingual beach discovery platform (19 languages)

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

**Guides** covering:
- Architecture & tech stack
- Localization (middleware, routing, translations)
- API integration
- Component patterns
- Common issues & solutions

Includes visual diagrams, troubleshooting guides and SEO status tracking. Recent changes are logged in **[DEV_HANDOFF.md](./DEV_HANDOFF.md)** and **[ai-agent/CHANGELOG.md](./ai-agent/CHANGELOG.md)**.

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

19 locales (defined in `src/app/config/locales.ts`): en, si, de, hr, fr, es, it, ua, ru, pl, cs, hu, bg, sk, da, pt, nl, el, sq

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

messages/                  # Translation files (19 locales, one JSON per locale)
ai-agent/                  # 📚 AI agent documentation
```

---

## 🚢 Deployment

Deploys run from GitHub Actions (**[.github/workflows/deploy.yml](./.github/workflows/deploy.yml)**) on push:

| Branch | Environment | URL |
|--------|-------------|-----|
| `dev`  | dev  | https://dev.beachrex.com |
| `uat`  | uat  | https://uat.beachrex.com |
| `main` | prod | https://beachrex.com |

- The workflow rsyncs the repo to the Hetzner VPS, then builds and restarts the `front_<env>` service with Docker Compose (the compose file and env files live on the server).
- The image is built from [`Dockerfile.prod`](./Dockerfile.prod) using the Next.js **standalone** output (`output: "standalone"` in `next.config.js`).
- `NEXT_PUBLIC_*` variables are **baked in at build time** (Docker build args read from the server's `.env.front.<env>`). Changing them needs a redeploy. See [`.env.front.example`](./.env.front.example).
- A manual run (`workflow_dispatch`) can target `dev`, `uat` or `prod`.

Details: [DEV_HANDOFF.md](./DEV_HANDOFF.md) (2026-09-02 entry).

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
- **UAT**: https://uat.beachrex.com
- **Development**: https://dev.beachrex.com

---

## 📄 License

Proprietary - Beachrex © 2026
