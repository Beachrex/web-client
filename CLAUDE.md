# Beachrex frontend — agent instructions

The rules and current state for **both** Beachrex repos live in the backend repo:
- `Beachrex/backend` → `docs/HANDOFF.md` (state, working mode, bootstrap, next steps)
- `Beachrex/backend` → `docs/DEVELOPMENT-RULES.md` (git, tests, docs, security)

If the backend repo is not in your session, read them on GitHub: https://github.com/Beachrex/backend/tree/dev/docs

Short version:
- Branch from `origin/dev`, PR into `dev`, merge only on green, verify the dev deploy. Promote to uat/prod only when the owner asks.
- Never touch the VPS by hand. Never read or print secrets. `NEXT_PUBLIC_*` values are baked in at build time.
- Every user-facing string goes through next-intl and into **all 19** `messages/*.json` files (single braces `{var}`).
- Use the URL builders (`src/lib/utils/beach-urls.ts`, `destination-url.ts`) and the locale middleware rules in `ai-agent/LOCALIZATION_GUIDE.md`.
- `src/lib/api-client/` is generated (`yarn generate:api`) — never edit by hand.
- Checks before a PR: `npx tsc --noEmit -p .`, `yarn lint`, `BASE_URL=http://localhost:9 npx playwright test e2e/*.unit.spec.ts --project=chromium`.
- The husky pre-commit runs `git add --all` — commit only with a clean working tree.
- Record changes in `DEV_HANDOFF.md` (newest first). Code/docs/commits in English; talk to the owner in Slovenian.
