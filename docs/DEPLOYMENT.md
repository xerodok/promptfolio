# Deployment

## Container

```bash
docker build \
  --build-arg GIT_SHA=$(git rev-parse --short HEAD) \
  --build-arg APP_VERSION=$(git describe --tags --always) \
  -t promptfolio .
docker run --rm -p 3000:3000 promptfolio
```

- Multi-stage build; the runtime stage is bare Alpine plus a stripped Node
  binary, the standalone server, static assets and `public/` (see _Image and
  footprint_ below).
- Runs as user `app`, listens on `PORT=3000`, `HOSTNAME=0.0.0.0`.
- `HEALTHCHECK` runs `node /app/healthcheck.mjs` against `/api/health`.
  Readiness is `/api/ready`.
- No runtime environment variables are required. `APP_VERSION` and `GIT_SHA`
  are optional and surfaced on `/api/health`.

`docker compose up --build` runs the same image read-only with `no-new-privileges`.

## Registry

`.github/workflows/release.yml` builds and pushes `ghcr.io/<owner>/<repo>` on
every push to `main` (tag `main` and `sha-<short>`) and on version tags
(`v1.2.3` → `1.2.3`, `1.2`, `latest`). It uses the repository's `GITHUB_TOKEN`
with `packages: write`; nothing to configure. Make the package public in the
GitHub Packages settings if your cluster pulls anonymously.

## Kubernetes

`deploy/kubernetes/` is a Kustomize base:

```bash
kubectl apply -k deploy/kubernetes
```

It creates a Deployment (2 replicas, probes on `/api/health` and `/api/ready`,
non-root, read-only root filesystem, dropped capabilities, resource requests
and limits), a ClusterIP Service and an Ingress for `resume.example.com`.
Override the image and host with a Kustomize overlay:

```yaml
# deploy/overlays/homelab/kustomization.yaml
resources: ["../../kubernetes"]
images:
  - name: ghcr.io/OWNER/REPO
    newName: ghcr.io/you/promptfolio
    newTag: sha-abc1234
patches:
  - target: { kind: Ingress, name: promptfolio }
    patch: |
      - op: replace
        path: /spec/rules/0/host
        value: resume.your-domain.dev
```

Ingress class, TLS (cert-manager) and DNS (external-dns) annotations are left
as comments in `ingress.yaml`; uncomment what your cluster uses.

## GitOps

Point an Argo CD or Flux application at the overlay directory. Bump
`newTag` from CI, or let Argo CD Image Updater track `sha-*` tags.

## Keeping real content out of a public fork

The committed content is a fictional sample. Two ways to run with your own:

**A private fork (recommended).** Fork privately, commit your content, photo
and logos directly in `content/` and `public/`, and change the release
workflow's trigger to `workflow_dispatch` so no image of your data is
published by accident. Pull template improvements with
`git remote add upstream <template> && git merge upstream/main`. Your lab or
CI builds the image from the fork.

**A public fork with content kept outside git.** Keep it in the gitignored
`private/` directory (or a private repository, or a secret-managed path on
the build runner):

1. Keep your real `resume.json`, `site.json` and `photo.jpg` in the
   gitignored `private/` directory (or a private repository, or a
   secret-managed path on the build runner).
2. Run `pnpm content:private` before `pnpm dev` or `pnpm build`. It copies the
   files over `content/` (and the photo into `public/`); the build validates
   them like any other content. `pnpm content:sample` restores the sample.
3. Never commit `content/` while it holds private data. CI's gitleaks job will
   not catch a resume, so this is a process rule, not a tool. A pre-commit
   check that refuses to commit when `content/` differs from `private/` is a
   reasonable addition.

## Image and footprint

The runtime stage is bare Alpine plus the Node binary (debug symbols stripped)
and its two runtime libraries, running as an unprivileged user. Measured on
one build in 2026-10, so you can judge the alternatives:

| Runtime base                         | Image  | Notes                          |
| ------------------------------------ | ------ | ------------------------------ |
| `node:22-alpine` (the obvious one)   | 322 MB | npm, corepack, yarn never used |
| `gcr.io/distroless/nodejs22`         | 288 MB | no shell at all, uid 65532     |
| **Alpine + stripped Node (default)** | 257 MB | `sh` present, uid 100          |
| `pnpm export:static` (no server)     | ~1 MB  | static files, see below        |

The app layer (standalone server, static assets, `public/`) is about 60 MB;
the Node binary is the rest, so ~250 MB is the floor for any Node server.
At rest the container uses ~40 MB RSS, so **128 MB** is a comfortable memory
cap and the Compose file sets it. There is no `wget` or `curl` in the image:
the health probe is `scripts/healthcheck.mjs`, run with `node`.

## Static export (no server at all)

```bash
pnpm build && pnpm export:static     # -> out/static
```

`out/static` is a plain folder (index, about, print, resume.json, photo,
logos, assets) that works from any path on any static host: GitHub Pages,
Cloudflare Pages, S3 + CloudFront, Netlify. The terminal, About page and print
view all work; `/api/resume` becomes `resume.json`; the health probes do not
exist because there is nothing to probe. The terminal's `about` command
navigates to `/about`, which a static host that serves `about.html` for
`/about` (Pages and Netlify do) handles; S3 needs an equivalent rewrite.
