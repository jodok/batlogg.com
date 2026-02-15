# AGENTS.md

## Project Context
- Framework: Astro 5 (static output)
- Package manager: pnpm (`pnpm-lock.yaml`)
- Language: TypeScript-enabled Astro project
- Source roots:
  - Pages: `src/pages`
  - Posts: `src/content`
  - Layouts: `src/layouts`
  - Components: `src/components`
  - Utilities: `src/utils`
  - Static assets: `public`

## Primary Goals
- Keep pages mostly static and fast.
- Favor Astro components over client-side hydration.
- Keep diffs small and behavior-preserving unless asked otherwise.
- Preserve a clean editorial workflow for Markdown/MDX posts.

## Working Rules
- Make focused, minimal diffs.
- Do not change unrelated files.
- Follow existing naming and folder conventions.
- Prefer reusable components in `src/components` over page-local duplication.
- Keep layout concerns in `src/layouts` and cross-page logic in `src/utils`.

## Repository-Specific Guidance
- Reuse existing components before adding inline markup:
  - `src/components/SocialLinks.astro` for social/contact icon links.
- Avoid duplicating post-fetch/sort logic in pages; extract shared helpers when touching multiple routes.
- Keep category handling consistent:
  - Use `encodeURIComponent` for links.
  - Prefer slug-safe category route params when introducing new category routing behavior.
- Preserve static rendering defaults; only add client directives when interactivity is required.

## Styling Guidance
- Reuse established utility class patterns already in the repo.
- Keep styles local to components unless the pattern is truly shared.
- Avoid broad global CSS changes unless explicitly requested.

## Testing and Validation
After code changes, run:
1. `pnpm run build`
2. `pnpm run test` when the environment allows a local web server (`localhost:4321`) for Playwright.

If Playwright cannot bind to the local port (sandbox/CI limitations), report it explicitly.

## Known Refactor Targets
- Fix default subtitle behavior in `src/layouts/PostLayout.astro` (`subtitle='subtitle'` currently leaks into rendered posts).
- Align Playwright selectors in `tests/frontpage.spec.ts` with current markup in `src/components/PostCard.astro`.
- Reduce duplication in `src/pages/about.astro` by composing existing components.
- Consolidate repeated post-query sorting logic across listing pages into one utility.
- Keep SEO metadata consistent in `src/layouts/BaseLayout.astro` (page description vs site description usage).

## File Safety
- Never delete or rename core project files unless explicitly requested.
- Never commit secrets or environment values.
- If a change requires new dependencies, explain why before adding them.

## PR/Change Summary Expectations
When reporting completed work, include:
- What changed
- Why it changed
- Any follow-up actions required
