# Promptfolio — Plan

## Status (2026-11-04)

Done: the site, print view, JSON API and probes; the About page; employer
logos; a shell-like terminal with a Settings tab and text-only commands from
`site.json`; a schema.org `Person` for search engines; a report-only Content
Security Policy; a ~257 MB signed multi-arch image; a ~1 MB static export; the architecture, configuration, operations,
security, FAQ and per-medium deployment docs (`docs/deploy/`: static,
Docker/Compose + proxies, Podman/Quadlet, systemd, Kubernetes, Cloud Run, AWS,
Fly/Azure/Render, with units, snippets, Terraform and a Pages workflow); issue
templates and a "pick your path" README. The template is used in production by
its author from a private fork (see "Keeping real content out of a public fork"
in `docs/DEPLOYMENT.md`), deployed to a home lab behind a reverse proxy. Cloud
paths are written from provider docs and not exercised by CI.

## Roadmap, in order

1. **Kubernetes extras** — HPA/PDB/NetworkPolicy, a Helm chart.
2. **Supply chain** — Trivy image scan in CI.
3. **CSP enforcement** — the report-only policy ships; enforce it once the
   reports are clean, hashing inline scripts at build time.
4. **Lighthouse in CI** — a performance/accessibility/SEO budget on every push.

## What it is

A resume that is a real, running web application: one structured document
(JSON Resume), rendered as a rich site, a print view and a JSON API, built and
shipped with the same cloud-native tooling used on a production platform, and
hosted on-prem in a home lab.

## Design reference

The look follows [Tabby](https://tabby.sh): a deep navy canvas (`#0c131b`),
light-weight Source Sans type with an oversized thin display heading and a
tagline, frosted-glass panels, a skewed band of oversaturated colour behind the
hero, and a terminal window as the centrepiece. Tokens live in
`src/app/globals.css`; everything else uses Tailwind utilities on top of them.

## Architecture

```
content/resume.json  ──┐  (JSON Resume v1 — the single source of truth)
content/site.json    ──┤  (presentation only: tagline, stats, nav, highlights)
content/about.json   ──┤  (the About page)
                       ▼
          src/lib/resume/{schema,load,format}.ts   Zod validation, cached loader
                       │
        ┌──────────────┼──────────────────┬──────────────────┐
        ▼              ▼                  ▼                  ▼
   /  (site)      /print (paper)     /api/resume        /api/health, /api/ready
   Tabby-style    single column      JSON Resume        liveness / readiness
   sections +     "Save as PDF"      document           (k8s probes)
   terminal
```

- **Framework**: Next.js 16 (App Router, Cache Components, Turbopack), React 19,
  TypeScript, Tailwind 4. Pages are fully prerendered; probes are request-time.
- **Content model**: `content/resume.json` is a standard JSON Resume document, so
  it is portable to any theme, CLI or ATS importer. `content/site.json` and
  `content/about.json` hold what is specific to this site. All are validated
  with Zod at build time and by the readiness probe; a malformed document fails
  the build, not a page.
- **Fonts**: self-hosted via `@fontsource-variable` so the build has no
  dependency on Google Fonts (matters for an air-gapped or rate-limited lab).
- **Terminal**: a client component with a pure, unit-tested command engine
  (`src/components/terminal/commands.ts`). Commands read the same resume data,
  so the terminal never drifts from the page.
- **Observability hooks**: `/api/health` exposes version and commit from build
  args.
- **Container**: multi-stage Dockerfile built on `node:22-alpine`, running on
  bare Alpine 3.24 with a stripped Node binary; standalone output, non-root
  user, read-only root filesystem in compose, HEALTHCHECK.
- **CI**: GitHub Actions runs lint, typecheck, tests, format check and build,
  then builds the image and smoke-tests `/`, `/api/ready` and `/api/resume`;
  the release workflow publishes a signed multi-arch image with SBOM and
  provenance.

## Local development

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm check          # lint + typecheck + test + format check
pnpm build && pnpm start
docker compose up --build
```

## Decisions and trade-offs

- **Next.js over Astro or a static site**: the API routes, probes and future
  live sections want a server; standalone output keeps the image small. A
  static export exists for hosts without a process.
- **JSON Resume over a bespoke schema**: portability and a public spec beat a
  custom format; site-only fields live in a separate file rather than
  polluting the document.
- **Private fork over content injection**: real content is committed in a
  private fork that merges the public template, instead of the template
  reading `content/` from an environment-variable path. One mechanism (git),
  no second build path to keep working.
- **No UI component library**: the Tabby look is specific enough that a few
  tokens plus Tailwind is less code than fighting a library's defaults.
- **Fonts and icons self-hosted/inline**: no third-party requests at runtime,
  which keeps the page fast and the lab self-contained.
