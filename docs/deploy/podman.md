# Deploy: Podman (rootless) and Quadlet

Same image, no daemon, no root. Quadlet turns the container into a systemd
unit so it starts at boot, restarts on failure and logs to the journal.

## Prerequisites

- Podman 4.4+ (Quadlet ships with it); `podman --version`.
- Rootless user set up (`podman info` works without sudo).
- An `$IMAGE` (see [DEPLOYMENT.md](../DEPLOYMENT.md#which-image)).

## 1. Quick run

```bash
podman run -d --name promptfolio -p 3000:3000 \
  --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
  --memory 128m --pids-limit 128 \
  $IMAGE
curl -s localhost:3000/api/ready
```

`podman compose up -d --build` also works with the repository's
`docker-compose.yml` (it is plain Compose).

## 2. Run it as a service with Quadlet (recommended)

1. Copy the unit and set the image:

   ```bash
   mkdir -p ~/.config/containers/systemd
   cp deploy/podman/promptfolio.container ~/.config/containers/systemd/
   sed -i "s|^Image=.*|Image=$IMAGE|" ~/.config/containers/systemd/promptfolio.container
   ```

2. Load and start:

   ```bash
   systemctl --user daemon-reload
   systemctl --user enable --now promptfolio
   loginctl enable-linger "$USER"      # keep it running after you log out
   ```

3. Verify:

   ```bash
   systemctl --user status promptfolio
   journalctl --user -u promptfolio -f
   curl -s localhost:3000/api/health
   ```

The unit ([`deploy/podman/promptfolio.container`](../../deploy/podman/promptfolio.container))
carries the same hardening as the Compose file and a health check; systemd
restarts the container if it fails.

## 3. TLS in front

Any of the options in [docker.md](docker.md#3-put-it-behind-tls) apply; for a
single box Caddy as a second Quadlet unit, or a host-installed Caddy with
`reverse_proxy localhost:3000`, is the least work.

## 4. Update

```bash
podman pull $IMAGE && systemctl --user restart promptfolio
```

Or set `AutoUpdate=registry` in the unit (already present, commented) and
enable `podman-auto-update.timer` to pull nightly.

## 5. Remove

```bash
systemctl --user disable --now promptfolio
rm ~/.config/containers/systemd/promptfolio.container
systemctl --user daemon-reload
podman rmi $IMAGE
```

## Notes

- Rootless Podman maps the container's `app` user to a sub-UID of yours;
  nothing in the image needs to be root, so there is nothing to adjust.
- Port 3000 is above 1024, so rootless binding needs no sysctl change. If
  you want Caddy on 80/443 rootless, set
  `sysctl net.ipv4.ip_unprivileged_port_start=80`.
- Cost: the box.
