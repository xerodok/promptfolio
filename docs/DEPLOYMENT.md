# Deployment

## Container

```bash
docker build \
  --build-arg GIT_SHA=$(git rev-parse --short HEAD) \
  --build-arg APP_VERSION=$(git describe --tags --always) \
  -t promptfolio .
docker run --rm -p 3000:3000 promptfolio
```

- Multi-stage build on `node:22-alpine`; the runtime stage holds only the
  standalone server, static assets and `public/`.
- Runs as user `app`, listens on `PORT=3000`, `HOSTNAME=0.0.0.0`.
- `HEALTHCHECK` hits `/api/health`. Readiness is `/api/ready`.
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

The committed content is a fictional sample. For a private deployment:

1. Keep your real `resume.json` and `site.json` in a private repository or a
   secret-managed path on the build runner.
2. Copy them over `content/` immediately before `pnpm build` (CI step or a
   `--build-context` in Docker). The build validates them like any other.
3. Never commit them back. CI's gitleaks job will not catch a resume, so this
   is a process rule, not a tool.

## Static preview

`scripts/static-preview.py` turns a finished build into a relocatable static
bundle (used for Claude artifact previews, GitHub Pages or any object store):

```bash
pnpm build
python3 scripts/static-preview.py .next out/preview
```

The bundle serves `/` and `/print` with the terminal fully working; the API
routes are replaced by a static `resume.json`.
