# Deploy: bare metal with systemd (no containers)

The production build is a self-contained Node server. On any Linux box with
Node 22 you can run it directly under systemd, hardened with the unit's
sandboxing options instead of a container runtime.

## Prerequisites

- Linux with systemd, Node 22 (`node -v`), pnpm (`corepack enable`).
- A clone of your fork on the box, or the build output copied to it.

## 1. Build

```bash
pnpm install --frozen-lockfile
pnpm build
```

The server is `.next/standalone/server.js`; it also needs `.next/static` and
`public/` next to it (the Dockerfile does the same copy):

```bash
sudo mkdir -p /opt/promptfolio
sudo cp -r .next/standalone/. /opt/promptfolio/
sudo cp -r .next/static /opt/promptfolio/.next/static
sudo cp -r public /opt/promptfolio/public
sudo cp scripts/healthcheck.mjs /opt/promptfolio/
sudo useradd --system --home /opt/promptfolio --shell /usr/sbin/nologin promptfolio 2>/dev/null || true
sudo chown -R root:root /opt/promptfolio && sudo chmod -R a+rX /opt/promptfolio
```

## 2. Install the unit

```bash
sudo cp deploy/systemd/promptfolio.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now promptfolio
```

## 3. Verify

```bash
systemctl status promptfolio
journalctl -u promptfolio -f
curl -s localhost:3000/api/health
node /opt/promptfolio/healthcheck.mjs && echo healthy
```

## 4. TLS in front

Host-installed Caddy: `reverse_proxy localhost:3000` under your domain
([`deploy/caddy/Caddyfile`](../../deploy/caddy/Caddyfile)), or nginx with
[`deploy/nginx/promptfolio.conf`](../../deploy/nginx/promptfolio.conf) and
certbot.

## 5. Update

Rebuild, copy over `/opt/promptfolio` as in step 1, `sudo systemctl restart
promptfolio`. Keep the previous copy as `/opt/promptfolio.prev` if you want a
one-command rollback.

## 6. Remove

```bash
sudo systemctl disable --now promptfolio
sudo rm /etc/systemd/system/promptfolio.service && sudo systemctl daemon-reload
sudo rm -rf /opt/promptfolio && sudo userdel promptfolio
```

## Notes

The unit ([`deploy/systemd/promptfolio.service`](../../deploy/systemd/promptfolio.service))
runs as a dedicated user with `ProtectSystem=strict`, a private `/tmp`, no new
privileges, no capabilities, memory and task limits — the same posture as the
container. `systemd-analyze security promptfolio` scores it; expect "OK".
