---
name: astro-content-collections
description: "Astro content collections — defineCollection + Zod schemas in src/content.config.ts, getCollection vs getEntry, rendering MDX/Markdown entries."
paths:
  - "src/content/**"
  - "src/content.config.ts"
  - "src/content/config.ts"
  - "src/pages/**"
---

# Content collections

Type-safe, Zod-validated content. Use for blog posts, docs, projects — anything with structured frontmatter.

## Defining a collection

`src/content.config.ts` (Astro 5+ location; older `src/content/config.ts` also works):

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
```

Files then live at `src/content/blog/*.md` (or `.mdx` — add the MDX integration first).

## Reading collections

```astro
---
import { getCollection, getEntry, render } from "astro:content";

// All entries (filter out drafts)
const posts = await getCollection("blog", ({ data }) => !data.draft);

// One entry by id (the file path without extension)
const post = await getEntry("blog", "hello-world");
if (!post) return Astro.redirect("/404");

const { Content, headings } = await render(post);
---

<article>
  <h1>{post.data.title}</h1>
  <Content />
</article>
```

## Dynamic routes from a collection

```ts
// src/pages/blog/[...slug].astro
export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}
```

Pair with `export const prerender = true` if you want these built statically rather than SSR'd.

## Schema patterns worth knowing

| Pattern | Use |
| --- | --- |
| `z.coerce.date()` | Parse YAML date strings into `Date`. |
| `z.string().default(...)` | Optional field with a fallback. |
| `image()` from `schema` ctx | Validate + optimize images referenced in frontmatter. |
| `reference("other")` | Link to entries in another collection, type-checked. |

For `image()` and `reference()`, use the function form:

```ts
schema: ({ image }) => z.object({
  cover: image(),
  author: reference("authors"),
}),
```

## Anti-patterns

- Reading markdown files with `fs` / `import.meta.glob` — use collections so you get types + validation.
- Putting collection config anywhere other than `src/content.config.ts` (or legacy `src/content/config.ts`).
- Forgetting to re-run the dev server after editing `content.config.ts` — schema changes need a restart.
- Storing huge binaries in `src/content/` — keep media in `public/` or an external store.
