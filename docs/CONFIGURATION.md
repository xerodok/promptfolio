# Configuration reference

Promptfolio needs **no configuration to run**. Everything here is optional and
listed so nothing is a surprise.

## Content files (build time)

| File                  | Schema                       | Purpose                                                                                    |
| --------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| `content/resume.json` | `resumeSchema` (JSON Resume) | facts: basics, work, education, certificates, skills, projects, meta                       |
| `content/site.json`   | `siteSchema`                 | presentation: tagline, prompt, section headings, leadership, stats, highlights, nav, logos |
| `content/about.json`  | `aboutSchema`                | the `/about` page: eyebrow, title, intro, sections, updated                                |
| `public/photo.jpg`    | —                            | referenced by `basics.image` (`"/photo.jpg"`); any size, square works best                 |
| `public/logos/*`      | —                            | referenced by `site.json` → `logos`                                                        |

Field-by-field documentation is in [CUSTOMIZING.md](CUSTOMIZING.md). All three
JSON files are validated at build time; a broken file fails `pnpm build`, never
a page.

## Build arguments (`docker build --build-arg`)

| Argument       | Default   | Effect                                                            |
| -------------- | --------- | ----------------------------------------------------------------- |
| `APP_VERSION`  | `dev`     | shown by `/api/health` (`version`) and the `uname`-style commands |
| `GIT_SHA`      | `unknown` | shown by `/api/health` (`commit`)                                 |
| `NODE_VERSION` | `22`      | Node major for the build and the runtime binary                   |

The release workflow passes `GIT_SHA=${{ github.sha }}` and
`APP_VERSION=${{ github.ref_name }}` automatically.

## Environment variables (runtime)

| Variable                  | Default         | Notes                                                                 |
| ------------------------- | --------------- | --------------------------------------------------------------------- |
| `PORT`                    | `3000`          | listening port; the health probe reads it too                         |
| `HOSTNAME`                | `0.0.0.0`       | bind address (Next.js standalone convention)                          |
| `NODE_ENV`                | `production`    | set in the image; do not change                                       |
| `NEXT_TELEMETRY_DISABLED` | `1`             | set in the image                                                      |
| `APP_VERSION`, `GIT_SHA`  | from build args | can be overridden at runtime; only affects `/api/health`              |
| `TZ`                      | unset           | the app renders no runtime dates, so this only affects log timestamps |

There are no secrets. There is nothing to mount except `/tmp`.

## Ports and paths

- Container port **3000** (HTTP, plain). Terminate TLS in front of it.
- Writable: `/tmp` only. Mount a tmpfs; keep the root filesystem read-only.
- Probes: `GET /api/health` (liveness), `GET /api/ready` (readiness). Both
  return JSON and `Cache-Control: no-store`.

## Resource sizing

| Scenario                       | CPU request | Memory limit | Notes                             |
| ------------------------------ | ----------- | ------------ | --------------------------------- |
| Personal site, any traffic     | 50m         | 128 Mi       | idles at ~40 MB RSS; serves files |
| Behind a CDN                   | 50m         | 128 Mi       | the CDN absorbs bursts            |
| Kubernetes default (manifests) | 50m         | 256 Mi       | generous; 128 Mi is fine          |

Scale horizontally if you must; there is no shared state to coordinate.

## Per-browser settings (the terminal's Settings tab)

Stored in `localStorage` under `promptfolio.settings` as JSON:

```json
{ "aurora": true, "bootAnimation": true, "fontSize": "medium" }
```

Nothing is sent anywhere. If storage is unavailable the defaults apply for
that page view.

## Template identity

`src/lib/template.ts` holds the template's name, author and URL for the footer
attribution. `package.json` → `repository.url` is used by tooling. A fork
changes neither to keep the attribution; the person's own name comes from the
resume document.
