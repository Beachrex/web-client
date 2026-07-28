# Documentation Index

**Purpose**: AI Agent & Developer Documentation for Beachrex Frontend  
**Created**: 2026-05-29  
**Status**: ✅ Complete

---

## 📚 All Documents

### 🚀 Start Here

1. **[README.md](./README.md)** - Main entry point, overview, quick links
2. **[QUICK_START.md](./QUICK_START.md)** ⭐ - 5-minute essentials for new agents/developers

### 📖 Core Guides

3. **[ARCHITECTURE_BLUEPRINT.md](./ARCHITECTURE_BLUEPRINT.md)** - Complete system architecture
   - Project structure
   - Technology stack  
   - Key architectural decisions
   - Development workflow

4. **[LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md)** ⭐⭐⭐ **CRITICAL**
   - How i18n works (19 languages)
   - Middleware architecture (must-read!)
   - Common issues & solutions
   - Debugging tips

5. **[ROUTING_GUIDE.md](./ROUTING_GUIDE.md)** - Routing system
   - Route hierarchy (World → Beach)
   - File structure
   - URL generation patterns
   - Adding new route types

6. **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** - Backend integration
   - OpenAPI client generation
   - TanStack Query patterns
   - Caching strategy
   - Error handling

7. **[COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md)** - React components
   - Server vs Client components
   - Reusable component examples
   - Performance optimization
   - Common anti-patterns

### 🛠️ Contributing

11. **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Documentation process for agents and developers
    - When to document, changelog format, checklist

### 🔍 SEO & Technical

8. **[SEO_STATUS_AND_TASKS.md](./SEO_STATUS_AND_TASKS.md)** ⭐ **COMPREHENSIVE**
   - Complete SEO implementation status (75% complete)
   - What's done: Metadata, sitemaps, JSON-LD, hreflang, robots.txt
   - What's missing: Image alt text, page speed optimization
   - Future task tracker with priorities
   - Pre-launch SEO checklist

9. **[SEO_QUICK_REFERENCE.md](./SEO_QUICK_REFERENCE.md)** - Quick SEO lookup
   - Copy-paste templates for metadata
   - URL building patterns
   - JSON-LD schema examples
   - Testing commands

10. **[SEO_VISUAL_STATUS.md](./SEO_VISUAL_STATUS.md)** ⭐ - Visual dashboard
   - Progress charts and status matrix
   - Page-by-page SEO status
   - Sitemap coverage overview
   - Top priority tasks at a glance

---

## 🎯 Documentation by Use Case

### "I'm new to the project"
→ Start: [QUICK_START.md](./QUICK_START.md)  
→ Then: [README.md](./README.md)  
→ Deep dive: [ARCHITECTURE_BLUEPRINT.md](./ARCHITECTURE_BLUEPRINT.md)

### "Client components show wrong language"
→ [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md) - Issue #1

### "Getting 404 on localized routes"
→ [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md) - Issue #3

### "How do I add a new route?"
→ [ROUTING_GUIDE.md](./ROUTING_GUIDE.md) - "Adding a New Route Type"

### "How do I fetch data from API?"
→ [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) - "Using the API"

### "Server vs Client components?"
→ [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) - "Component Types"

### "How does language switching work?"
→ [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md) - "Path Translation Hook"

### "What SEO is already implemented?"
→ [SEO_STATUS_AND_TASKS.md](./SEO_STATUS_AND_TASKS.md) - Overall Status

### "How do I add metadata to a new page?"
→ [SEO_QUICK_REFERENCE.md](./SEO_QUICK_REFERENCE.md) - Page Metadata Template

### "Which pages need SEO work?"
→ [SEO_STATUS_AND_TASKS.md](./SEO_STATUS_AND_TASKS.md) - Future Tasks

---

### "Beach map link goes to wrong locale or 404s"
→ [docs/features/BEACH_MAP_LINK_FIX.md](../docs/features/BEACH_MAP_LINK_FIX.md) - Root cause & fix
→ [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md) - Issue #6

### "How do I add a beach map link?"
→ Use `buildBeachMapUrl(locale)` from `src/lib/utils/beach-urls.ts`

### "Map search returns wrong/historical place names (Zara, Ragusa)"
→ [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md) - Issue #5 (Nominatim accept-language)

### "I made a code change — what docs do I update?"
→ [CONTRIBUTING.md](./CONTRIBUTING.md) — Documentation checklist

## 📊 Document Stats

| Document | Lines | Size | Topic |
|----------|-------|------|-------|
| README.md | ~200 | 6KB | Overview & index |
| QUICK_START.md | ~150 | 5KB | Essentials |
| ARCHITECTURE_BLUEPRINT.md | ~350 | 13KB | Full architecture |
| LOCALIZATION_GUIDE.md | ~220 | 6KB | i18n system |
| ROUTING_GUIDE.md | ~200 | 6KB | Routing patterns |
| API_INTEGRATION_GUIDE.md | ~200 | 7KB | API usage |
| COMPONENT_PATTERNS.md | ~200 | 8KB | Component guide |
| SEO_STATUS_AND_TASKS.md | ~550 | 19KB | **SEO tracker** |
| SEO_QUICK_REFERENCE.md | ~150 | 6.8KB | SEO templates |
| SEO_VISUAL_STATUS.md | ~170 | 6.5KB | SEO dashboard |

**Total**: ~2,390 lines, ~87KB of documentation

---

## 🔄 Maintenance

**Update when**:
- Major architecture changes
- New patterns established
- Common issues discovered
- Framework version updates

**Review frequency**: Quarterly

**Owner**: Frontend Team

---

## ✅ Coverage Checklist

- [x] Project overview
- [x] Setup instructions
- [x] Localization (i18n) - complete with troubleshooting
- [x] Routing architecture
- [x] API integration
- [x] Component patterns
- [x] State management
- [x] Styling guidelines
- [x] Performance optimization
- [x] SEO & metadata
- [x] Testing strategy
- [x] Common pitfalls
- [x] Quick reference guides

---

**Version**: 1.3.0
**Last Updated**: 2026-07-27
