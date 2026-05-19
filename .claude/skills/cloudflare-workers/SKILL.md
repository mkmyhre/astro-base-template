---
name: cloudflare-workers
description: "Cloudflare Workers runtime for this Astro project — bindings access, wrangler commands you can/can't run, nodejs_compat caveats, preview vs dev."
paths:
  - "wrangler.jsonc"
  - "wrangler.toml"
  - ".dev.vars*"
  - "src/**/*.ts"
  - "src/**/*.astro"
---

# Cloudflare Workers

This project deploys to Cloudflare Workers via `@astrojs/cloudflare`. Runtime is **workerd**, not Node. `nodejs_compat` is enabled but compatibility is partial.

## Dev vs Preview

| Command | Runtime | Bindings? | Use for |
| --- | --- | --- | --- |
| `pnpm dev` | Vite/Node | ❌ | Fast iteration on UI/markup |
| `pnpm preview` | workerd via wrangler | ✅ | Anything touching `Astro.locals.runtime.env`, KV, Images, secrets |
| `pnpm deploy` | Cloudflare prod | ✅ | Ship it |

If code reads bindings or secrets, **`pnpm dev` will show undefined**. Test under `pnpm preview`.

## Bindings

Declared in `wrangler.jsonc`. Currently:

- `IMAGES` — Cloudflare Images
- `SESSION` — KV namespace for Astro sessions

Access:

```ts
const { IMAGES, SESSION } = Astro.locals.runtime.env;
```

After editing `wrangler.jsonc` (new binding, ID change, etc.) run `pnpm cf-typegen` to refresh `worker-configuration.d.ts`.

## Secrets — what you can and can't do

**You cannot read or set secret values.** They're managed by the user.

- `.env`, `.env.*`, `.dev.vars`, `.dev.vars.*` — blocked by `.claude/settings.json` deny rules.
- `wrangler secret put` — also blocked.
- `.dev.vars.example` lists expected secret **names** (no values) — your reference for what exists.

**Workflow when code needs a new secret:**

1. Reference in code as `Astro.locals.runtime.env.MY_SECRET`.
2. Add the name to `.dev.vars.example`.
3. Ask the user to run `wrangler secret put MY_SECRET` (prod) and add it to `.dev.vars` (local).

**Safe to run yourself:**

- `wrangler deploy`
- `wrangler secret list` (names only)
- `wrangler secret delete NAME`
- `wrangler tail`, `wrangler whoami`, `wrangler types`

## nodejs_compat caveats

The flag is set, but workerd still isn't Node:

- No filesystem (`node:fs`). Bundle assets at build time or use R2/KV.
- No long-running processes, no `child_process`.
- `node:crypto`, `node:buffer`, `node:async_hooks` work. Many native-extension packages don't.
- Request handler must finish within Worker CPU limits. Offload long work to Queues/Durable Objects.

When picking a dependency, prefer ones that advertise Workers/edge support. If you're unsure, test under `pnpm preview` before committing.

## API routes

Return standard `Response` objects:

```ts
export const GET: APIRoute = async ({ locals }) => {
  const value = await locals.runtime.env.SESSION.get("key");
  return new Response(JSON.stringify({ value }), {
    headers: { "content-type": "application/json" },
  });
};
```

## Anti-patterns

- Testing binding code under `pnpm dev` and concluding it's broken — switch to `pnpm preview`.
- Reaching for `node:fs` or `child_process` — they won't work in prod.
- Editing `worker-configuration.d.ts` by hand — regenerate with `pnpm cf-typegen`.
- Attempting `wrangler secret put` — it's blocked; route through the user.
