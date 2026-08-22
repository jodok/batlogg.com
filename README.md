# batlogg.com

Personal site and blog built with Astro 5, MD/MDX content collections, and Tailwind CSS v4.

## Stack

- Astro (`astro`)
- MDX (`@astrojs/mdx`)
- RSS + sitemap (`@astrojs/rss`, `@astrojs/sitemap`)
- Astro image pipeline (`astro:assets`, `sharp`)
- Playwright smoke tests (`@playwright/test`)

## Agent-ready delivery

- `/llms.txt` provides protocol-structured discovery and specific contact-routing guidance.
- The homepage and custom 404 are fully rendered as static HTML; they do not depend on JavaScript for content.
- The `batlogg-markdown-variants` Astro integration generates a Markdown sibling for every HTML page during the static build.
- `server.mjs` serves the static build with RFC 9110 `Accept` negotiation, including q-values, `406` responses, real Markdown 404s, and `Vary: Accept`.
- The production Docker image contains only the generated static files, the negotiation server, and Node.js. It does not run Astro SSR or require application state.

## Project Structure

```text
src/
  components/      Reusable UI
  content/         Blog posts and media
  layouts/         Shared page/post layouts
  pages/           Route files
  styles/          Global styles
  utils/           Small utility modules
public/            Static files
```

## Content Model

Posts are loaded from `src/content/**/*.{md,mdx}` via `src/content.config.ts`.

Required frontmatter fields:

- `title: string`
- `description: string`
- `pubDate: date`

Optional fields:

- `subtitle: string`
- `updatedDate: date`
- `categories: string[]`
- `heroImage: image`

## Commands

- `pnpm install` Install dependencies
- `pnpm run dev` Start local dev server
- `pnpm run build` Build static site
- `pnpm run preview` Serve built site
- `pnpm start` Serve the built site with production content negotiation
- `pnpm run test` Run Playwright tests
- `pnpm run test:unit` Run content-generation and production-server tests

## Container deployment

Build and run the production image locally:

```sh
docker build -t batlogg-com .
docker run --rm -p 3000:3000 batlogg-com
```

The container exposes HTTP on port `3000` and a health check at `/healthz`. A reverse proxy should forward the original `Accept` header unchanged and preserve the response's `Vary` header.

## Validation

Minimum check before shipping:

1. `pnpm run build`
2. `pnpm run test` (when environment allows binding a local test server)

Note: in restricted sandboxes, Playwright may fail to start with `listen EPERM ...:4321`.

## Cleanup and Refactor Backlog

### High-priority

- Replace the starter-style README/agent guidance with project-specific docs (done).
- Fix `src/layouts/PostLayout.astro` default subtitle handling so posts without `subtitle` do not render the literal string `"subtitle"`.
- Make Playwright selectors resilient (`tests/frontpage.spec.ts` uses selectors like `.card-image` and `.featured-card` that are not present in `src/components/PostCard.astro`).
- Remove duplication in `src/pages/about.astro` by using `src/components/SocialLinks.astro` and `src/components/Timeline.astro` instead of inline repeated SVG/content blocks.

### Medium-priority

- Consolidate post query/sort logic into one helper (currently repeated in `src/pages/index.astro`, `src/pages/posts.astro`, and `src/pages/category/[category].astro`).
- Improve metadata consistency in `src/layouts/BaseLayout.astro` (`meta description` uses `SITE_DESCRIPTION` while OG description uses page `description`).
- Normalize category URLs to slug form to avoid raw spaces in routes (for example categories like `food for thought`).

### Low-priority

- Tighten typing and dead code cleanup (`Props` alias in `src/pages/[...slug].astro` is currently unused).
- Consider a shared component for repeated section headings and spacing utility classes across pages.
