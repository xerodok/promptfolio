# AGENTS.md — working on Promptfolio with a coding agent

This file is the brief for any AI coding agent (Claude Code, Codex, Cursor,
Copilot, Gemini CLI) and for humans who prefer the short version. Read it
fully before changing anything. `CLAUDE.md` points here.

## What this is

Promptfolio is a resume that boots to a terminal. One JSON Resume document in
`content/resume.json` drives:

- the site at `/` (Tabby-inspired dark design, interactive terminal),
- a print view at `/print` for Save-as-PDF,
- a JSON API at `/api/resume`,
- Kubernetes probes at `/api/health` (liveness) and `/api/ready` (readiness).

It ships as a non-root container image and is meant to run on a home lab or
any Kubernetes cluster. Content is validated at build time, so a broken resume
fails the build, never a page.

## Stack

| Layer       | Choice                                                 | Notes                                             |
| ----------- | ------------------------------------------------------ | ------------------------------------------------- |
| Framework   | Next.js 16, App Router, Cache Components, Turbopack    | Pages prerender; probes are request-time.         |
| UI          | React 19, Tailwind 4, no component library             | Tokens in `src/app/globals.css`.                  |
| Language    | TypeScript, strict                                     | `pnpm typecheck` must pass.                       |
| Validation  | Zod 4                                                  | `src/lib/resume/schema.ts`.                       |
| Tests       | Vitest, Testing Library, jsdom                         | `pnpm test`.                                      |
| Lint/format | ESLint 9 (eslint-config-next), Prettier 3              | `pnpm lint`, `pnpm format:check`.                 |
| Fonts       | `@fontsource-variable` Source Sans 3 / Source Code Pro | Self-hosted; no Google Fonts at build or runtime. |
| Package mgr | pnpm (version pinned in `package.json`)                | Use `pnpm`, never npm or yarn.                    |
| Node        | 22 (`.nvmrc`)                                          |                                                   |

## Commands

```bash
pnpm install                 # once
pnpm dev                     # http://localhost:3000
pnpm check                   # lint + typecheck + test + format:check  (run before every commit)
pnpm build && pnpm start     # production build (standalone output) and server
pnpm format                  # rewrite files with Prettier
docker compose up --build    # container parity
```

`pnpm check` is the definition of done for any change. CI runs the same
commands plus a container build and smoke test (`.github/workflows/ci.yml`).

## Repository map

```
content/            resume.json (JSON Resume), site.json (presentation), about.json (/about page)
src/app/            routes: page.tsx, print/, api/{resume,health,ready}, layout, globals.css
src/components/     Nav, MobileMenu, Footer, Icon, sections/*, terminal/*
src/lib/resume/     schema.ts (Zod), load.ts (cached loader), format.ts (dates)
src/lib/            build-info.ts (version/commit from env), template.ts (attribution)
deploy/kubernetes/  Kustomize base: Deployment, Service, Ingress
scripts/            static-export.mjs (relocatable static site), healthcheck.mjs (container probe), use-content.sh
private/            gitignored: your real resume.json, site.json, photo.jpg
docs/               ARCHITECTURE.md, CUSTOMIZING.md, DEPLOYMENT.md
.github/workflows/  ci.yml (verify + image smoke test), release.yml (push to GHCR)
```

## Rules of the road

1. **Content is data.** Never hard-code names, employers, headings, or copy in
   components. Resume facts live in `content/resume.json` (JSON Resume
   fields only). Presentation copy lives in `content/site.json` and is typed in
   `siteSchema`. Add a field to the schema with a default before using it.
2. **Keep JSON Resume portable.** `resume.json` must stay valid against the
   public JSON Resume schema. Site-only ideas go in `site.json`, not in
   invented resume keys.
3. **Validate, don't trust.** Every content field read by a component goes
   through Zod. Unknown keys are preserved (`looseObject`) so documents stay
   portable, but anything rendered must be typed.
4. **Sections hide when empty.** `page.tsx` renders a section only when its
   data exists. Keep that behaviour when adding sections.
5. **Cache Components constraints.** Pages are prerendered. Do not call
   `new Date()`, `Math.random()`, or read headers in a Server Component.
   Request-time behaviour belongs in a route handler after `await connection()`
   (see `src/app/api/health/route.ts`) or in a Client Component.
6. **Terminal commands are pure.** `src/components/terminal/commands.ts` has
   no DOM access and is unit-tested. UI side effects are returned as `Action`
   objects and executed by `Terminal.tsx`. Add a command there and a test in
   `__tests__/commands.test.ts`.
7. **Design tokens, not ad-hoc colours.** Use the CSS variables in
   `globals.css` through Tailwind (`text-fg`, `bg-accent`, `.card`, `.glass`,
   `.chip`, `.btn`). Light-weight headings use `.display`.
8. **Everything below the hero is centered.** Section headers, cards and rows
   with fewer cards than the grid width are centered. Long bullet lists stay
   left-aligned inside a centered block.
9. **No secrets, no personal data in the template.** The committed sample
   persona is fictional. Do not commit real resumes, photos, phone numbers or
   tokens. CI runs gitleaks. Real content lives in the gitignored `private/`
   directory and is swapped in with `pnpm content:private` before a build;
   `pnpm content:sample` restores the sample (see `docs/DEPLOYMENT.md`).
   Before committing, confirm `content/` still holds the sample persona.
10. **Mobile first.** Every change is checked at 390px width. The terminal must
    stay usable with touch (quick-command chips) and the nav must collapse.
11. **Accessibility.** Buttons have labels, the terminal output is `aria-live`,
    icons are `aria-hidden`, focus never scrolls the page unexpectedly.
12. **Minimal diffs.** Do what the task needs. Do not reformat unrelated files,
    add dependencies without a reason, or widen a change beyond its ask.

## Adding things

- **A new section**: add a Zod field in `siteSchema.sections` (or
  `resumeSchema` if it is resume data), a component in
  `src/components/sections/`, wire it in `page.tsx` behind an emptiness check,
  add it to `nav` in `site.json`, and update `docs/CUSTOMIZING.md`.
- **A new terminal command**: add it to the `commands` array and `describe()`
  in `commands.ts`, add a unit test, and if it is touch-worthy add it to
  `quickCommands`.
- **A new route**: under `src/app/`. Route handlers that must be live call
  `await connection()` first.
- **A dependency**: `pnpm add` it, explain why in the PR, keep the image small.

## Verification checklist for agents

Before you report a change as done:

- [ ] `pnpm check` passes.
- [ ] `pnpm build` succeeds and `/`, `/print`, `/api/resume`, `/api/health`,
      `/api/ready` respond (`node .next/standalone/server.js` after copying
      `public` and `.next/static` as the Dockerfile does).
- [ ] If the UI changed: screenshot desktop (1440px) and phone (390px). The
      easiest route is Playwright against `pnpm dev` (or the static export).
- [ ] If content or schema changed: the sample content still parses and
      `content/*.json` are formatted.
- [ ] No real personal data was added to the template.

## Deployment summary

`Dockerfile` builds a standalone Next.js server on `node:22-alpine`, runs as a
non-root user, exposes 3000 and has a HEALTHCHECK. `docker-compose.yml` runs it
read-only. `deploy/kubernetes/` is a Kustomize base with probes wired to the API.
`release.yml` pushes `ghcr.io/<owner>/<repo>` on pushes to `main` and on tags.
Details in `docs/DEPLOYMENT.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
