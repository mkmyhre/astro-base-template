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

Re-run `cf-typegen` whenever `wrangler.jsonc` changes (new binding, etc.) so `Astro.locals.runtime.env` types stay correct.

## Cloudflare bindings

Auto-provisioned by the adapter on deploy:
- `IMAGES` — Cloudflare Images
- `SESSION` — KV namespace for Astro sessions

Access bindings in `.astro` files via `Astro.locals.runtime.env.BINDING_NAME`.

## Secrets — important

**You cannot read or set secret values.** Secrets are managed entirely by the user.

- Secret files (`.env`, `.env.*`, `.dev.vars`, `.dev.vars.*`) are blocked by `.claude/settings.json` deny rules — both Read and common Bash bypass commands.
- `wrangler secret put` is also blocked. Production secrets are set by the user running it interactively.
- `.dev.vars.example` lists expected secret *names* for local dev — that's your reference for what bindings exist.

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
- This is a *template* — don't commit demo pages, scratch routes, or example UI unless explicitly asked.
