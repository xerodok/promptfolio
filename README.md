# Promptfolio

**A resume that boots to a terminal.** One [JSON Resume](https://jsonresume.org/schema)
document drives a Tabby-inspired site with an interactive `bash`-style terminal,
a print view for PDF export, a JSON API, and Kubernetes probes. It ships as a
small non-root container and is built to run on a home lab with the same
cloud-native tooling used on production platforms.

Created by [Chris Russell](https://github.com/xerodok).

> This repository is a **template**. The committed persona is fictional and it
> contains no personal data. Fork it, drop in your resume, and it is yours.

## Use this template

1. Click **Use this template** on GitHub (or fork it).
2. Edit `content/resume.json` with your resume (standard JSON Resume).
3. Edit `content/site.json`: headings, tagline, leadership block, stats,
   highlight cards, nav, terminal prompt. See `docs/CUSTOMIZING.md`.
4. `pnpm install && pnpm dev`, open http://localhost:3000, type `help`.

Or hand it to a coding agent: `AGENTS.md` is written so an agent can take the
repository from fork to a finished, deployed resume with your content.

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

## Container and cluster

```bash
docker compose up --build            # local, read-only container
kubectl apply -k deploy/kubernetes   # Kustomize base with probes and hardening
```

Images are published to GHCR by `.github/workflows/release.yml`. Full details
in `docs/DEPLOYMENT.md`, including how to keep a real resume out of a public fork.

## Docs

- `AGENTS.md` — the brief for coding agents and contributors
- `docs/ARCHITECTURE.md` — how it is put together and why
- `docs/CUSTOMIZING.md` — every field you can change
- `docs/DEPLOYMENT.md` — container, GHCR, Kubernetes, GitOps, static preview
- `PLAN.md` — roadmap

## Credits

Promptfolio was created by Chris Russell. The visual language is inspired by
[Tabby](https://tabby.sh), the open-source terminal. If you build your resume
from this template, a link back is appreciated but not required.

## License

[MIT](./LICENSE) © Chris Russell
