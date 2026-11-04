# Operations

What running Promptfolio looks like day to day. Short, because there is very
little to operate: no state, no secrets, no background jobs.

## Health

| Check                 | Command                                                     | Healthy                                                            |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| Process is up         | `curl -s localhost:3000/api/health`                         | `{"status":"ok","uptimeSeconds":…,"version":…,"commit":…}`         |
| Content is valid      | `curl -s localhost:3000/api/ready`                          | `200 {"status":"ready"}`; `503` means the resume failed validation |
| Container healthcheck | `docker inspect <name> --format '{{.State.Health.Status}}'` | `healthy` (runs `node /app/healthcheck.mjs` every 30 s)            |
| Pages render          | `curl -s localhost:3000/` and look for `<h1`                | one `<h1>` with the name                                           |

Wire `/api/health` into whatever already watches your other services (a
blackbox exporter, Uptime Kuma, a cloud health check). The response body is
stable JSON, so alert on status code, not on text.

## Logs

The server writes to stdout/stderr; nothing is written to disk. Read them the
way your platform reads container logs:

```bash
docker compose logs -f web
kubectl logs deploy/promptfolio -f
journalctl -u promptfolio -f        # bare-metal systemd unit
```

Expect them to be quiet: prerendered pages produce no per-request log lines
by default.

## Upgrading

A new version is a new image (or a new static folder). There is no migration
step because there is no state.

- **Container**: pull or build the new image, recreate the container. The
  health probe gates traffic in Kubernetes; on a single host the swap takes
  about a second.
- **Static**: upload the new `out/static`; invalidate the CDN if you have one.
- **Content-only changes** follow the same path: content is baked in at build
  time (that is what makes validation a build failure rather than a page
  error).

## Rollback

Deploy the previous image tag. Releases are tagged `sha-<commit>` precisely
so that "the one that worked yesterday" is a tag, not a guess. On Kubernetes:

```bash
kubectl rollout undo deploy/promptfolio
```

## Backup

The repository is the backup. Content, configuration and manifests are all
in git; the image is reproducible from a commit. Nothing at runtime is worth
saving.

## Resource expectations

- Memory: ~40 MB RSS at rest; cap at 128 Mi.
- CPU: negligible; 50m request is comfortable.
- Disk: the image (~257 MB) and nothing else. `/tmp` holds only what Node
  needs and is a tmpfs.
- Network: one HTTP port. Outbound: none at runtime.

## Cutting a release

Releases are annotated tags on `main`:

```sh
git tag -a v1.2.0 -m "v1.2.0: what changed"
git push origin v1.2.0
```

`release.yml` builds the tag and publishes `ghcr.io/<owner>/<repo>:1.2.0`,
`:1.2` and `:latest`; pushes to `main` keep publishing `:main` and
`:sha-<commit>`. `APP_VERSION` inside the image is the tag name, which is what
`/api/health` and the footer show. The `protect-tags` ruleset refuses to delete
or move a `v*` tag, so a bad release gets a new tag, never a rewritten one.

## Routine maintenance

- **Dependencies**: Dependabot opens grouped PRs weekly (npm minor/patch,
  GitHub Actions, base images) and security updates as they appear. CI must
  stay green before merging.
  `pnpm-workspace.yaml` sets `minimumReleaseAge` to three days (Dependabot's
  `cooldown` mirrors it), so a Dependabot run that lands while some transitive
  package is younger than that fails with `update_not_possible` and simply
  succeeds on a later run; no action is needed. The same guard makes a local
  `pnpm add` or `pnpm update` fail while the lockfile still holds an entry
  younger than three days; wait, or pass `--config.minimumReleaseAge=0` for
  that one command when the package you are adding is itself mature.
- **Node major**: bump `NODE_VERSION` in the Dockerfile, `.nvmrc` and
  `@types/node` together (Dependabot ignores `@types/node` majors for this
  reason); CI builds the image, so a breaking change shows up there.
- **Certificates**: belong to whatever terminates TLS (reverse proxy, Ingress,
  the cloud). The app never sees them.

## Incident checklist

1. `/api/health` down → the process is not running or not reachable: check
   the container/pod state and port mapping first.
2. `/api/health` up, `/api/ready` 503 → the content baked into this image
   fails validation; the body says which field. Roll back to the previous
   image; fix the JSON; rebuild.
3. Pages 200 but look wrong → compare `commit` from `/api/health` with what
   you expected to be deployed.
4. Slow → something in front of the app (proxy, CDN, DNS). The app serves
   prerendered files and cannot itself be slow in any meaningful way.
