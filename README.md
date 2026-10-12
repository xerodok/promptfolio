# Living Resume

A resume that runs as a web application. One [JSON Resume](https://jsonresume.org/schema)
document drives a Tabby-inspired site, an interactive terminal, a print view
for PDF export and a JSON API. It ships as a small container with Kubernetes
probes, built for self-hosting on a home lab with the same tooling used on
production platforms.

This repository is a **template**. It contains a fictional sample persona and
no personal data. See [PLAN.md](./PLAN.md) for the architecture and roadmap.

## Use this template

1. Click **Use this template** on GitHub (or fork it).
2. Edit `content/resume.json` with your resume. It is standard JSON Resume, so
   you can also export it from any JSON Resume tool.
3. Edit `content/site.json`: tagline, stats, highlight cards, nav labels and
   the terminal prompt.
4. Run `pnpm install && pnpm dev` and open http://localhost:3000.

Both content files are validated with Zod. `pnpm test` and the build fail on a
malformed document, and `/api/ready` returns 503.

| Path          | What it is                                     |
| ------------- | ---------------------------------------------- |
| `/`           | The site                                       |
| `/print`      | Paper-friendly view; print to PDF              |
| `/api/resume` | The resume as a JSON Resume document           |
| `/api/health` | Liveness probe with version and commit         |
| `/api/ready`  | Readiness probe; 503 if the content is invalid |

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
`/api/health`. No secrets or environment variables are required; `APP_VERSION`
and `GIT_SHA` are optional build args surfaced on `/api/health`.

## Keeping a public repo clean

- A resume is public by nature, but keep phone numbers, street addresses and
  employer-confidential details out of `content/`.
- CI runs a secret scan (gitleaks) on every push and pull request.
- If you would rather keep your real resume out of a public fork, keep the
  content in a private overlay and inject it at build time (see Phase 2 in
  `PLAN.md`).

## License

[MIT](./LICENSE)
