# Astro Base Template

Astro 6 + Tailwind v4 + Cloudflare Workers (SSR). Personal base template — keep it lean and opinionated. Don't add features, demo content, or alternatives "in case".

## Stack

- **Astro** in `output: 'server'` mode via `@astrojs/cloudflare` adapter
- **Tailwind v4** via `@tailwindcss/vite` (not PostCSS) — single CSS entry: `src/styles/global.css` with `@import "tailwindcss"`
- **Wrangler v4** for local preview and deploy; `nodejs_compat` flag enabled
- **pnpm** package manager, Node >=22.12

## Scripts

- `pnpm dev` — Astro dev server (no CF bindings; for fast iteration)
- `pnpm preview` — build + `wrangler dev` (runs on workerd, mirrors prod, has bindings)
- `pnpm deploy` — build + `wrangler deploy`
- `pnpm cf-typegen` — regenerate `worker-configuration.d.ts` after editing `wrangler.jsonc`
- `pnpm typecheck` — `astro check` (TS + `.astro` files)
- `pnpm lint` / `pnpm lint:fix` — ESLint (flat config, type-aware)
- `pnpm format` / `pnpm format:check` — Prettier

Re-run `cf-typegen` whenever `wrangler.jsonc` changes (new binding, etc.) so `Astro.locals.runtime.env` types stay correct.

## Linting & strictness

This template is configured strictly on purpose — to keep Claude-generated code consistent and safe to evolve. **Before declaring a task done, run `pnpm lint && pnpm typecheck` and fix all errors.**

- **ESLint** with `typescript-eslint` `strict-type-checked` + `stylistic-type-checked` (type-aware rules) and `eslint-plugin-astro`. Config in `eslint.config.js`.
- **Prettier** with `prettier-plugin-astro` and `prettier-plugin-tailwindcss` (auto Tailwind class sorting). Config in `.prettierrc`.
- **tsconfig** extends `astro/tsconfigs/strict` plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`.

Rules of thumb:

- Don't suppress lint errors with `// eslint-disable-*` to make code "work" — fix the underlying issue. If a rule genuinely doesn't apply, leave a one-line comment explaining why.
- No `any`, no non-null assertions (`!`), no type assertions (`as Foo`) to silence the compiler. Narrow with `if` / `typeof` / `in` instead.
- Array/record access is `T | undefined` (`noUncheckedIndexedAccess`) — handle the undefined case.

## Pre-commit & CI

- **Lefthook** runs `prettier --check`, `eslint --max-warnings 0`, and `astro check` on every commit. Config in `lefthook.yml`. Hooks install automatically on `pnpm install` (lefthook postinstall). Never bypass with `--no-verify`; fix the error.
- **GitHub Actions** (`.github/workflows/ci.yml`) re-runs the same checks plus `pnpm build` on every PR.
- **LF line endings** are enforced via `.gitattributes` (`* text=auto eol=lf`) and Prettier (`endOfLine: "lf"`). Don't reintroduce CRLF.

## Runtime env (secrets)

Use the Zod-validated helper instead of reading `Astro.locals.runtime.env` directly for secrets:

```ts
import { getEnv } from "../env"; // relative from src/pages/*; depth varies by file
const env = getEnv(Astro.locals.runtime.env);
env.MY_SECRET; // typed, validated, throws on call if missing
```

Bindings (`IMAGES`, `SESSION`, etc.) are still accessed directly via `Astro.locals.runtime.env.BINDING_NAME` — they're typed by `worker-configuration.d.ts`. The Zod schema in `src/env.ts` is for string secrets; add fields there as you reference them.

## Cloudflare bindings

Auto-provisioned by the adapter on deploy:

- `IMAGES` — Cloudflare Images
- `SESSION` — KV namespace for Astro sessions

Access bindings in `.astro` files via `Astro.locals.runtime.env.BINDING_NAME`.

## Secrets — important

**You cannot read or set secret values.** Secrets are managed entirely by the user.

- Secret files (`.env`, `.env.*`, `.dev.vars`, `.dev.vars.*`) are blocked by `.claude/settings.json` deny rules — both Read and common Bash bypass commands.
- `wrangler secret put` is also blocked. Production secrets are set by the user running it interactively.
- `.dev.vars.example` lists expected secret _names_ for local dev — that's your reference for what bindings exist.

**Workflow when code needs a new secret:**

1. Reference it in code as `Astro.locals.runtime.env.MY_SECRET`.
2. Add the name (no value) to `.dev.vars.example`.
3. Ask the user to run `wrangler secret put MY_SECRET` (for prod) and add it to their local `.dev.vars` (for `pnpm preview`).

**You CAN run safely:**

- `wrangler deploy` (deploys code, never touches secret values)
- `wrangler secret list` (names only)
- `wrangler secret delete NAME`
- `wrangler tail`, `wrangler whoami`, `wrangler types`

## Project conventions

- Pages go in `src/pages/`. Tailwind classes work out of the box; just import `global.css` once at the top-level layout.
- This is a _template_ — don't commit demo pages, scratch routes, or example UI unless explicitly asked.
