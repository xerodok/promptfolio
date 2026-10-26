# Deploy: Fly.io, Azure Container Apps, Railway / Render

One-file or one-command deploys for the same container. Written from the
providers' documentation; not exercised by the template's CI.

## Fly.io (≈ $0 – $2/month)

[`deploy/fly.toml`](../../deploy/fly.toml) is ready: port 3000, 256 MB
shared-CPU machine, auto-stop when idle, HTTP checks on `/api/ready`.

```bash
fly launch --copy-config --config deploy/fly.toml --no-deploy   # creates the app
fly deploy --config deploy/fly.toml                               # builds from the Dockerfile
fly certs add resume.example.com                                  # then add the CNAME it prints
```

Verify: `fly status`, `curl -s https://<app>.fly.dev/api/health`. Update:
`fly deploy`. Remove: `fly apps destroy <app>`.

## Azure Container Apps (scale-to-zero, ≈ $0)

```bash
az group create -n promptfolio -l eastus
az containerapp env create -n promptfolio-env -g promptfolio -l eastus
az containerapp create -n promptfolio -g promptfolio --environment promptfolio-env \
  --image $IMAGE --target-port 3000 --ingress external \
  --min-replicas 0 --max-replicas 2 --cpu 0.25 --memory 0.5Gi
az containerapp show -n promptfolio -g promptfolio --query properties.configuration.ingress.fqdn -o tsv
```

Custom domain + managed certificate: `az containerapp hostname add` /
`bind`. Update: `az containerapp update --image <new>`. Remove:
`az group delete -n promptfolio`.

## Railway / Render

Both detect the Dockerfile: connect the repository, set the port to `3000`,
health check path `/api/ready`. Railway's hobby plan and Render's free web
service both run it; Render's free tier sleeps after 15 minutes of
inactivity (the ~1 s cold start is fine for a resume).

## Verify, everywhere

`/api/health` returns the commit the build was made from, so you can always
tell which version a platform is running.
