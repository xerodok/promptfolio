# Living Resume — Plan

A resume that is a real, running web application: one structured document
(JSON Resume), rendered as a rich site, a print view and a JSON API, built and
shipped with the same cloud-native tooling used on a production platform, and
hosted on-prem in a home lab.

## Design reference

The look follows [Tabby](https://tabby.sh): a deep navy canvas (`#0c131b`),
light-weight Source Sans type with an oversized thin display heading and an
italic tagline, frosted-glass panels, a skewed band of oversaturated colour
behind the hero, and a terminal window as the centrepiece. Tokens live in
`src/app/globals.css`; everything else uses Tailwind utilities on top of them.

## Architecture

```
content/resume.json  ──┐  (JSON Resume v1 — the single source of truth)
content/site.json    ──┤  (presentation only: tagline, stats, nav, highlights)
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
  it is portable to any theme, CLI or ATS importer. `content/site.json` holds
  what is specific to this site. Both are validated with Zod at build time and
  by the readiness probe; a malformed document fails the build, not a page.
- **Fonts**: self-hosted via `@fontsource-variable` so the build has no
  dependency on Google Fonts (matters for an air-gapped or rate-limited lab).
- **Terminal**: a client component with a pure, unit-tested command engine
  (`src/components/terminal/commands.ts`). Commands read the same resume data,
  so the terminal never drifts from the page.
- **Observability hooks**: `/api/health` exposes version and commit from build
  args; OpenTelemetry instrumentation is a phase-2 addition.
- **Container**: multi-stage Dockerfile on `node:22-alpine`, standalone output,
  non-root user, read-only root filesystem in compose, HEALTHCHECK.
- **CI**: GitHub Actions runs lint, typecheck, tests, format check and build,
  then builds the image and smoke-tests `/`, `/api/ready` and `/api/resume`.

## Phases

### Phase 1 — Example, plan, plumbing (this commit)

- [x] Next.js app scaffold with pnpm, ESLint, Prettier, Vitest
- [x] JSON Resume content model with Zod validation and tests
- [x] Tabby-inspired design system and all sections (hero, stats, highlights,
      experience timeline, skills, projects, education, contact)
- [x] Interactive terminal with typed boot sequence, history, tab completion
- [x] Print view for PDF export
- [x] JSON API, liveness and readiness probes, build metadata
- [x] Dockerfile, compose, CI workflow
- [ ] Replace the sample content in `content/` with the real resume

### Phase 2 — Container and registry

- Build and push the image from CI to GHCR (`ghcr.io/xerodok/chrisrussell`)
  tagged with the git SHA and semver; sign with cosign; scan with Trivy.
- Pin the Node base image by digest; add Renovate for dependency updates.

### Phase 3 — Home-lab deployment

- Helm chart (or Kustomize) with Deployment, Service, Ingress, HPA, PDB,
  liveness/readiness probes wired to `/api/health` and `/api/ready`,
  securityContext (non-root, read-only FS, dropped capabilities).
- GitOps: Argo CD Application pointing at a `deploy/` directory in this repo,
  with image-updater or a CI commit bumping the tag.
- Ingress: Traefik or ingress-nginx, cert-manager with Let's Encrypt DNS-01,
  external-dns for the record, Cloudflare Tunnel or a WAN-side reverse proxy.

### Phase 4 — Observability and operations

- OpenTelemetry via `instrumentation.ts`: traces and metrics to the lab's
  collector; Grafana dashboard for request rate, latency, errors, and uptime.
- Uptime check from outside the lab; alert on readiness failures.
- Lighthouse CI budget in the pipeline (performance, accessibility, SEO).

### Phase 5 — Living features

- Resume versioning: tag releases, expose `/api/resume?version=` from git tags,
  and show a changelog of what changed in the resume over time.
- Analytics that respect privacy (self-hosted Plausible or Umami).
- Optional: a "status" section fed live from the lab (cluster node count,
  deployed image SHA) to prove the site is really running there.

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
  live sections want a server; standalone output keeps the image small.
- **JSON Resume over a bespoke schema**: portability and a public spec beat a
  custom format; site-only fields live in a separate file rather than
  polluting the document.
- **No UI component library**: the Tabby look is specific enough that a few
  tokens plus Tailwind is less code than fighting a library's defaults.
- **Fonts and icons self-hosted/inline**: no third-party requests at runtime,
  which keeps the page fast and the lab self-contained.
