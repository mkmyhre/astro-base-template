---
name: tailwind-v4
description: "Tailwind v4 setup — @tailwindcss/vite plugin (not PostCSS), single @import 'tailwindcss', @theme for design tokens, no tailwind.config.js."
paths:
  - "**/*.css"
  - "**/*.astro"
  - "**/*.tsx"
  - "**/*.jsx"
  - "astro.config.*"
  - "vite.config.*"
---

# Tailwind v4

This project uses **Tailwind v4** via `@tailwindcss/vite` — **not** the PostCSS plugin, **not** v3. Many patterns from v3 are gone.

## Setup (already wired)

- `astro.config.mjs` registers `tailwindcss()` as a Vite plugin.
- `src/styles/global.css` is the single CSS entry. It contains exactly:
  ```css
  @import "tailwindcss";
  ```
- That CSS file is imported once from the top-level layout. Don't import it again per page.

**There is no `tailwind.config.js`.** Don't create one. Config lives in CSS.

## Configuring via CSS

Design tokens go in CSS using the `@theme` directive:

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.65 0.2 250);
  --font-display: "Inter Variable", sans-serif;
  --breakpoint-3xl: 120rem;
}
```

This auto-generates `bg-brand`, `text-brand`, `font-display`, `3xl:` variants, etc. The naming pattern (`--color-*`, `--font-*`, `--breakpoint-*`) determines which utilities are created.

## Custom utilities & variants

```css
@utility tab-4 {
  tab-size: 4;
}

@variant pointer-coarse (@media (pointer: coarse));
```

No more `@layer utilities { ... }` ceremony for simple cases.

## Content detection

Automatic. v4 scans your project without a `content: []` array. If something isn't being detected (rare), use:

```css
@source "../path/to/extra.html";
```

## Key differences from v3

| v3 | v4 |
| --- | --- |
| `tailwind.config.js` + `theme.extend` | `@theme { --color-foo: ... }` in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `postcss.config.js` + `tailwindcss` plugin | `@tailwindcss/vite` plugin |
| `content: ['./src/**/*']` | Automatic |
| `tailwindcss/colors` JS import | Use CSS vars: `var(--color-blue-500)` |

## Anti-patterns

- Creating a `tailwind.config.js` — config is in CSS now.
- `@tailwind base;` / `@tailwind utilities;` — replaced by a single `@import "tailwindcss"`.
- Adding `postcss.config.js` for Tailwind — this project uses the Vite plugin.
- Importing `global.css` from every component — import it once, in the root layout.
- Copying v3 `theme.extend` patterns into a JS config file — translate to `@theme` CSS variables instead.
