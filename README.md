# chrisrussell — living resume

A resume that runs as a web application. One JSON Resume document in
`content/resume.json` drives the site, a print view, a JSON API and an
interactive terminal. Built with Next.js 16, shipped as a container, meant to
run on a home-lab Kubernetes cluster.

See [PLAN.md](./PLAN.md) for the architecture and roadmap.

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Try typing `help` in the terminal.

| Path          | What it is                                     |
| ------------- | ---------------------------------------------- |
| `/`           | The site                                       |
| `/print`      | Paper-friendly view; print to PDF              |
| `/api/resume` | The resume as a JSON Resume document           |
| `/api/health` | Liveness probe with version and commit         |
| `/api/ready`  | Readiness probe; 503 if the content is invalid |

## Editing the resume

- `content/resume.json` — the resume, in [JSON Resume](https://jsonresume.org/schema) format.
- `content/site.json` — tagline, stats, highlight cards, nav, terminal prompt.

Both files are validated with Zod. `pnpm test` fails on a malformed document,
and so does the build. The sample content shipped here is placeholder text and
is marked as such in the summary field.

## Checks

```bash
pnpm check     # lint, typecheck, unit tests, formatting
pnpm build     # production build (standalone output)
```

## Container

```bash
docker compose up --build
# or
docker build --build-arg GIT_SHA=$(git rev-parse --short HEAD) -t living-resume .
docker run --rm -p 3000:3000 living-resume
```

The image runs as a non-root user, exposes port 3000 and has a HEALTHCHECK on
`/api/health`.
