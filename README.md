# astro-base-template

Personal base template for Astro projects on Cloudflare Workers.

## Stack

- [Astro](https://astro.build) 6 in `output: 'server'` mode
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) via `@astrojs/cloudflare` (SSR), `nodejs_compat`
- [Tailwind CSS](https://tailwindcss.com) v4 via `@tailwindcss/vite` (no PostCSS)
- [Zod](https://zod.dev) for runtime env validation (`src/env.ts`)
- ESLint (flat, type-aware) + Prettier + Lefthook + GitHub Actions CI
- pnpm, Node >=22.12

## Scripts

| Command           | What it does                                                  |
| :---------------- | :------------------------------------------------------------ |
| `pnpm dev`        | Astro dev server (fast iteration, no CF bindings)             |
| `pnpm preview`    | Build + `wrangler dev` (workerd runtime, mirrors prod)        |
| `pnpm deploy`     | Build + `wrangler deploy`                                     |
| `pnpm cf-typegen` | Regenerate `worker-configuration.d.ts` after `wrangler.jsonc` |
| `pnpm typecheck`  | `astro check` (TS + `.astro`)                                 |
| `pnpm lint`       | ESLint                                                        |
| `pnpm format`     | Prettier write                                                |

## Layout

```
src/
├── env.ts        # Zod-validated runtime env (getEnv)
├── pages/        # File-based routes
└── styles/
    └── global.css  # @import "tailwindcss"
```

See [`CLAUDE.md`](./CLAUDE.md) for project conventions, secret handling, and Cloudflare bindings.
