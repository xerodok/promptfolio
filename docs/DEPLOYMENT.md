# Deployment

Promptfolio is one build, deployable many ways. Pick a medium below; every
page has the same shape — **prerequisites → deploy → verify → update →
remove → what it costs** — and every path serves the identical site.

## Which image?

Every guide refers to an image as `$IMAGE`. Decide this first:

| You are…                                    | `$IMAGE`                                                                                                                                                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| trying the template with the sample persona | `ghcr.io/xerodok/promptfolio:latest` — the newest release, public, signed, multi-arch; `latest` is only ever produced from a version tag, never from `main`                                               |
| running **your** resume from a fork         | `ghcr.io/<you>/<repo>:main` — your fork's `release.yml` publishes it on every push to `main`. Make the package public in GitHub → Packages if your host pulls anonymously, or keep it private and log in. |
| not using a registry at all                 | build locally: `docker build -t promptfolio .` (or `podman build`) and use `promptfolio`                                                                                                                  |

The template image contains the fictional sample; it is never what you want
in production. For anything you keep running, pin a version (`:1.0.0`) or a
commit (`:sha-abc1234`) rather than `latest`, so an update is a decision you
make. The static export needs no image at all.

## Pick a medium

| Medium                                                                    | Best when                             | Idle cost       | Effort    |
| ------------------------------------------------------------------------- | ------------------------------------- | --------------- | --------- |
| [Static hosting](deploy/static.md)                                        | you want the cheapest, simplest thing | **$0**          | 10 min    |
| [Docker / Compose](deploy/docker.md)                                      | you own a box, VPS or home lab        | the box         | 10 min    |
| [Podman / Quadlet](deploy/podman.md)                                      | same, rootless, systemd-managed       | the box         | 15 min    |
| [Bare metal + systemd](deploy/systemd.md)                                 | no container runtime, just Node       | the box         | 15 min    |
| [Kubernetes](deploy/kubernetes.md)                                        | you already run a cluster             | your cluster    | 15 min    |
| [GCP Cloud Run](deploy/gcp-cloud-run.md)                                  | managed, scale-to-zero, custom domain | ≈ $0            | 20 min    |
| [AWS](deploy/aws.md) — App Runner, Lightsail, S3+CloudFront               | you live in AWS                       | $0.50 – $7 / mo | 20–30 min |
| [Fly.io, Azure Container Apps, Railway/Render](deploy/other-platforms.md) | one-file deploys elsewhere            | ≈ $0 – $5 / mo  | 10 min    |

Numbers are list prices in 2026 for a site with negligible traffic; they are
there to rank options, not to invoice you.

## What every deployment has in common

- **Port 3000, plain HTTP.** Terminate TLS in front (reverse proxy, Ingress,
  the platform). The app sets security headers; HSTS belongs on the TLS
  terminator.
- **Probes**: `GET /api/health` (liveness), `GET /api/ready` (readiness,
  `503` if the baked-in content fails validation).
- **No state, no secrets, no environment required.** `/tmp` is the only
  writable path; run read-only, non-root, no capabilities — the provided
  manifests already do.
- **Footprint**: ~257 MB image, ~40 MB RSS, 128 MiB is a comfortable cap;
  details below.
- **Updating is replacing**: new image (or new static folder), nothing to
  migrate. Rolling back is the previous tag (`sha-<commit>` tags exist for
  exactly this).

## Image and footprint

The runtime stage is bare Alpine plus the Node binary (debug symbols stripped)
and its two runtime libraries, running as an unprivileged user. Measured on
one build in 2026-10, so you can judge the alternatives:

| Runtime base                         | Image  | Notes                          |
| ------------------------------------ | ------ | ------------------------------ |
| `node:22-alpine` (the obvious one)   | 322 MB | npm, corepack, yarn never used |
| `gcr.io/distroless/nodejs22`         | 288 MB | no shell at all, uid 65532     |
| **Alpine + stripped Node (default)** | 257 MB | `sh` present, uid 100          |
| `pnpm export:static` (no server)     | ~1 MB  | static files                   |

The app layer (standalone server, static assets, `public/`) is about 60 MB;
the Node binary is the rest, so ~250 MB is the floor for any Node server.
There is no `wget` or `curl` in the image: the health probe is
`scripts/healthcheck.mjs`, run with `node`.

## Registry

`.github/workflows/release.yml` builds and pushes `ghcr.io/<owner>/<repo>` on
every push to `main` (tags `main` and `sha-<short>`) and on version tags
(`v1.2.3` → `1.2.3`, `1.2`, `latest`), for `linux/amd64` and `linux/arm64`,
with an SBOM, SLSA provenance and a keyless cosign signature. It uses the
repository's `GITHUB_TOKEN`; nothing to configure. Verify an image before
trusting it:

```bash
cosign verify $IMAGE \
  --certificate-identity-regexp 'https://github.com/<owner>/<repo>/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

## Keeping real content out of a public fork

The committed content is a fictional sample. Two ways to run with your own:

**A private fork (recommended).** Fork privately, commit your content, photo
and logos directly in `content/` and `public/`, and change the release
workflow's trigger to `workflow_dispatch` if you do not want images of your
data published automatically. Pull template improvements with
`git remote add upstream <template> && git merge upstream/main`.

**A public fork with content kept outside git.** Keep it in the gitignored
`private/` directory (or a private repository, or a secret-managed path on
the build runner) and run `pnpm content:private` before `pnpm dev` or
`pnpm build`; `pnpm content:sample` restores the sample. Never commit
`content/` while it holds private data — gitleaks will not catch a resume.

## Reverse proxies

Ready-made snippets that terminate TLS and forward to `:3000`:

- [`deploy/caddy/Caddyfile`](../deploy/caddy/Caddyfile) — automatic
  Let's Encrypt, two lines.
- [`deploy/nginx/promptfolio.conf`](../deploy/nginx/promptfolio.conf) — with
  certbot.
- Cloudflare Tunnel, Traefik labels and Nginx Proxy Manager are covered in
  [deploy/docker.md](deploy/docker.md#put-it-behind-tls).
