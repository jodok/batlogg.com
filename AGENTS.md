# AGENTS.md

## Project Context
- Framework: Astro
- Package manager: pnpm (lockfile: `pnpm-lock.yaml`)
- Language: TypeScript-enabled Astro project
- Source roots:
  - Pages: `src/pages`
  - Posts: `src/content`
  - Layouts: `src/layouts`
  - Components: `src/components`
  - Static assets: `public`

## Primary Goals
- Keep pages fast and mostly static by default.
- Favor Astro components and server-side rendering only when needed.
- Preserve clean, readable `.astro` files with minimal client-side JavaScript.

## Common Commands
- Install deps: `pnpm install`
- Start dev server: `pnpm run dev`
- Build: `pnpm run build`
- Preview build: `pnpm run preview`
- Astro CLI: `npx astro <command>`

## Working Rules
- Make focused, minimal diffs.
- Do not change unrelated files.
- Follow existing naming and folder conventions.
- Prefer reusable components in `src/components` over page-local duplication.
- Keep layout concerns in `src/layouts`.

## Astro Conventions
- Use `.astro` components for UI composition.
- Use client directives (`client:load`, `client:visible`, etc.) only when interactivity is required.
- Avoid unnecessary hydration.
- Keep props typed when practical.
- Prefer semantic HTML and accessible markup.

## Styling Guidance
- Reuse existing style patterns in the repo.
- Keep styles local to components unless a shared pattern is clearly needed.
- Avoid large global style changes unless explicitly requested.

## Validation Checklist
After code changes, run:
1. `pnpm run build`
2. If build passes and behavior is interactive, run `pnpm run dev` and sanity-check the changed route/component.

## File Safety
- Never delete or rename core project files unless explicitly requested.
- Never commit secrets or environment values.
- If a change requires new dependencies, explain why before adding them.

## PR/Change Summary Expectations
When reporting completed work, include:
- What changed
- Why it changed
- Any follow-up actions required
