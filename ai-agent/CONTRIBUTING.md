# Contributing to Documentation

> **Purpose**: Guide for AI agents and developers on how to keep documentation up-to-date after code changes.

**Last Updated**: 2026-07-27  
**Version**: 1.0.0

---

## When to Document

Update documentation **any time** you:

- Fix a bug that was caused by a misunderstood system (add to LOCALIZATION_GUIDE, ROUTING_GUIDE, etc.)
- Add a new utility, hook, or pattern other code will reuse
- Change a localized slug, route word, or URL structure
- Add or remove a locale
- Fix a 404 that was caused by a wrong URL in code
- Write new E2E or unit tests covering a feature

---

## Changelog Format

Every meaningful change gets an entry in **`CHANGELOG.md`**. Use this template:

```markdown
## Version X.Y.Z - YYYY-MM-DD

### Added / Fixed / Changed

**Short description** — Issue numbers, git commit

#### Files Changed

- **`path/to/file.ts`** (new|updated) — what it does
- ...

#### Key Fixes / Key Additions

- bullet: what changed and why it matters

#### Run Tests

```bash
npx playwright test e2e/your-spec.ts
```

### Documentation Stats

- Total documents: N → N+1 (+1 NEW_DOC.md)
```

---

## Documentation Checklist

After every code change, run through this list:

### Always

- [ ] Does `CHANGELOG.md` have a new version block?
- [ ] Does `README.md` have a **Recent Changes** entry?
- [ ] Does `INDEX.md` version/date footer reflect the new version?

### Bug Fixes

- [ ] Does the relevant guide (LOCALIZATION_GUIDE, ROUTING_GUIDE, etc.) have a new Issue entry?
- [ ] Is the issue in the **Quick Debugging Checklist**?
- [ ] Does `docs/features/` have a feature doc if the fix is non-trivial?

### New URLs / Routes / Slugs

- [ ] Is `buildBeachMapUrl(locale)` or equivalent helper used everywhere?
- [ ] Is the slug listed in the **Localized Route Words** table in LOCALIZATION_GUIDE.md?
- [ ] Are all 19 locales covered in `src/i18n/routing.ts`?

### New Utilities / Hooks

- [ ] Is the utility described in ARCHITECTURE_BLUEPRINT.md or the relevant guide?
- [ ] Is there a use-case entry in INDEX.md?

### Localization / Nominatim / External APIs

- [ ] Is the `accept-language` header set explicitly on all Nominatim/geocoding calls?
- [ ] Is the LOCALE_TO_LANGUAGE map in `MapSearch.tsx` up to date for new locales?

---

## File Ownership

| File | Update when |
|------|-------------|
| `CHANGELOG.md` | Every release / meaningful change |
| `README.md` | Version bump, new guides added |
| `INDEX.md` | New documents, new use cases, version bump |
| `LOCALIZATION_GUIDE.md` | New localization issues discovered or fixed |
| `ROUTING_GUIDE.md` | New route types, slug changes |
| `docs/features/*.md` | Non-trivial feature added or bug fixed |
| `docs/README.md` | New file added to `docs/` |

---

## Adding a New Issue to LOCALIZATION_GUIDE.md

Use this format under **Common Localization Issues & Solutions**:

```markdown
### Issue N: Short Description
**Cause:** What went wrong and why  
**Fix:** What code change was made  
**File:** `path/to/changed/file.ts`  
**Details:** [docs/features/YOUR_DOC.md](../docs/features/YOUR_DOC.md)
```

Then add a checklist item under **Quick Debugging Checklist**:

```markdown
N. ✅ Your check description?
```

---

## Related Documents

- [CHANGELOG.md](./CHANGELOG.md) — Full version history
- [INDEX.md](./INDEX.md) — All documents + use-case lookup
- [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md) — i18n issues
- [docs/features/BEACH_MAP_LINK_FIX.md](../docs/features/BEACH_MAP_LINK_FIX.md) — Example feature doc

---

**Owner**: Frontend Team  
**Review frequency**: Update as needed; review quarterly
