# Deploy: Docker and Docker Compose

One container, port 3000, read-only, non-root. Put a TLS-terminating proxy in
front and you are done. Works on a VPS, a NAS, a home lab, a Raspberry Pi
(the image is multi-arch).

## Prerequisites

- Docker 24+ with Compose v2 (`docker compose version`).
- An `$IMAGE` (see [DEPLOYMENT.md](../DEPLOYMENT.md#which-image)), or the
  repository checked out to build locally.
- For TLS: a DNS name pointing at the host, ports 80/443 reachable.

## 1. Run it (plain)

```bash
docker run -d --name promptfolio --restart unless-stopped \
  -p 3000:3000 \
  --read-only --tmpfs /tmp \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --memory 128m --pids-limit 128 \
  $IMAGE
```

Or from a checkout, which builds the image and applies the same hardening:

```bash
docker compose up -d --build
```

## 2. Verify

```bash
curl -s localhost:3000/api/health     # {"status":"ok",...}
curl -s localhost:3000/api/ready      # {"status":"ready",...}
docker inspect promptfolio --format '{{.State.Health.Status}}'   # healthy
```

## 3. Put it behind TLS

Pick one. All of them forward `https://resume.example.com` → `promptfolio:3000`.

**Caddy (simplest, automatic certificates).** Use the Compose overlay that
adds Caddy on 80/443 with the included Caddyfile:

```bash
DOMAIN=resume.example.com ACME_EMAIL=you@example.com \
  docker compose -f docker-compose.yml -f deploy/compose/docker-compose.caddy.yml up -d
```

**nginx + certbot.** Copy [`deploy/nginx/promptfolio.conf`](../../deploy/nginx/promptfolio.conf)
to `/etc/nginx/sites-enabled/`, set the `server_name`, run
`certbot --nginx -d resume.example.com`.

**Traefik.** Add labels to the `web` service:

```yaml
labels:
  - traefik.enable=true
  - traefik.http.routers.promptfolio.rule=Host(`resume.example.com`)
  - traefik.http.routers.promptfolio.entrypoints=websecure
  - traefik.http.routers.promptfolio.tls.certresolver=letsencrypt
  - traefik.http.services.promptfolio.loadbalancer.server.port=3000
```

**Nginx Proxy Manager.** Add a proxy host: domain → `promptfolio`, port
`3000`, scheme `http`, "Request a new SSL certificate", "Force SSL".

**Cloudflare Tunnel (no inbound ports).** `cloudflared tunnel create resume`,
route `resume.example.com` → `http://promptfolio:3000`, run `cloudflared` as a
second service on the same Compose network. Your host needs no open port at
all and its IP never appears in DNS.

## 4. Update

```bash
docker compose pull && docker compose up -d        # registry image
docker compose up -d --build                        # built from source
```

The old container is replaced in about a second; the health check gates it.

## 5. Remove

```bash
docker compose down            # keeps the image
docker rmi $IMAGE              # drops it
```

## Notes

- **Hardening** in `docker-compose.yml`: read-only root, tmpfs `/tmp`, all
  capabilities dropped, `no-new-privileges`, 128 MiB memory and 128 PIDs.
  Keep them; the app needs none of what they remove.
- **Health check** runs `node /app/healthcheck.mjs` (the image has no wget).
- **Logs**: `docker compose logs -f web`. Nothing is written to disk.
- **Pi / ARM**: the published image is `linux/arm64` too; building locally on
  a Pi works but takes a few minutes.
- **Cost**: whatever the box costs. Idle RSS is ~40 MB, so it shares a $5
  VPS with plenty of room.
