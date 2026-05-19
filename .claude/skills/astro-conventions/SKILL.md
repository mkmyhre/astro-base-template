---
name: astro-conventions
description: "Astro 6 SSR conventions — .astro vs framework components, islands & client directives, file-based routing, Astro.locals.runtime.env access, prerender flag."
paths:
  - "src/**/*.astro"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/pages/**"
---

# Astro conventions

This project runs `output: 'server'` with the Cloudflare adapter. Every route is SSR by default; opt into static with `export const prerender = true`.

## `.astro` vs framework components

- Default to `.astro` files. They run server-side only, ship zero JS, and can `await` data at the top.
- Reach for React/Vue/Svelte only when you need **interactivity** (state, effects, event handlers). Static markup belongs in `.astro`.
- Framework components imported into `.astro` render to HTML at build/request time. They become interactive only with a `client:*` directive.

## Client directives

| Directive | Use when |
| --- | --- |
| `client:load` | Needs to be interactive immediately on page load. |
| `client:idle` | Interactive, but can wait until the browser is idle. |
| `client:visible` | Only hydrate when scrolled into view. Default for below-the-fold widgets. |
| `client:media="…"` | Hydrate only at certain breakpoints. |
| `client:only="react"` | Skip SSR entirely — client-only component. Last resort. |

Pick the **laziest** directive that still works. No directive = static HTML, zero JS.

## Routing

- File-based under `src/pages/`. `index.astro` → `/`, `about.astro` → `/about`, `[slug].astro` → dynamic.
- API routes: `src/pages/api/foo.ts` exporting `GET`, `POST`, etc. Return `Response` objects.
- Dynamic SSR routes get params via `Astro.params`. For prerendered dynamic routes, export `getStaticPaths`.

## Accessing Cloudflare bindings & env

In `.astro` files and API routes:

```astro
---
const { IMAGES, SESSION } = Astro.locals.runtime.env;
const secret = Astro.locals.runtime.env.MY_SECRET;
---
```

Types come from `worker-configuration.d.ts` — regenerate with `pnpm cf-typegen` after editing `wrangler.jsonc`.

In API route handlers:

```ts
export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  // ...
};
```

## Frontmatter discipline

- The fenced `---` block at the top of `.astro` runs **on the server, per request** (unless `prerender = true`). Don't put client-only code there.
- Keep data-fetching in the frontmatter; pass to components as props. No `useEffect`-style fetching in `.astro`.

## Layouts & slots

- Shared chrome → `src/layouts/Layout.astro` with `<slot />`. Import once, wrap page content.
- Named slots for multiple insertion points: `<slot name="header" />` + `<div slot="header">`.

## Anti-patterns

- Reaching for React when a `.astro` component would do.
- `client:load` on everything — defeats Astro's whole point.
- Reading secrets from `import.meta.env` — use `Astro.locals.runtime.env` (CF adapter injects bindings + secrets there).
- Forgetting to run `pnpm cf-typegen` after adding a binding — types go stale and `locals.runtime.env.NEW_THING` shows as `any` or errors.
