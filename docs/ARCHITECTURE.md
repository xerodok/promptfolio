# Architecture

```
content/resume.json  ──┐  JSON Resume v1: the single source of truth for facts
content/site.json    ──┤  presentation: headings, tagline, stats, cards, nav, prompt
                       ▼
       src/lib/resume/{schema,load,format}.ts    Zod validation, cached loader, date helpers
                       │
   ┌───────────────────┼─────────────────────┬────────────────────────┐
   ▼                   ▼                     ▼                        ▼
 /  (site)        /print (paper)        /api/resume             /api/health, /api/ready
 Tabby-style      single column         JSON Resume document    liveness / readiness
 sections +       "Save as PDF"         Cache-Control 5 min     no-store, request-time
 terminal
```

## Rendering model

- **Static shell.** `/` and `/print` are fully prerendered at build time. There
  is no per-request work, so the container serves them from memory.
- **Client island.** The terminal is the one Client Component. It receives the
  validated resume and site config as props, so it never drifts from the page.
  Its command engine (`commands.ts`) is pure and unit-tested.
- **Probes.** `/api/health` and `/api/ready` call `await connection()` to opt
  into request-time rendering. Health reports uptime, version and commit (from
  `APP_VERSION` and `GIT_SHA` build args). Ready re-validates the content and
  returns 503 if it fails.

## Content pipeline

1. `content/*.json` are imported as modules, so Turbopack bundles them and the
   build fails on invalid JSON.
2. `loadContent()` parses both with Zod once per process and caches the result.
3. Pages, the API and the terminal all read from that one parsed object.

## Design system

Tokens live in `src/app/globals.css` and are exposed to Tailwind via
`@theme inline`. The look follows Tabby: navy canvas, Source Sans 3 light
display type, frosted-glass panels (`.glass`), an angled colour band behind
the hero (`.hero-band`), and card/chip/button primitives. Fonts are self-hosted
through `@fontsource-variable`.

## Why these choices

- **Next.js over a static generator**: route handlers, probes and future live
  sections want a server; standalone output keeps the image small.
- **JSON Resume over a bespoke schema**: portability and an existing ecosystem.
- **No UI library**: the aesthetic is specific and the surface area is small.
- **Self-hosted fonts and inline icons**: no third-party requests at runtime.
