# Deploy: Google Cloud Run (scale-to-zero)

Cloud Run runs the container, terminates TLS, scales to zero between visits
and bills per request. For a resume site that is effectively **$0/month**
(the free tier covers millions of requests).

> Written from Google's documentation and the template's own conventions;
> this path is not exercised by the template's CI. If a flag has changed,
> `gcloud run deploy --help` is authoritative.

## Prerequisites

- A GCP project with billing enabled; `gcloud` installed and logged in
  (`gcloud auth login`, `gcloud config set project <PROJECT>`).
- An `$IMAGE` (see [DEPLOYMENT.md](../DEPLOYMENT.md#which-image)). Cloud Run
  pulls from Artifact Registry or Docker Hub; a **public** GHCR image works
  directly, a private one does not — mirror it (step 1b).

## 1. Deploy with gcloud

```bash
export PROJECT=<project-id> REGION=us-central1 IMAGE=ghcr.io/<you>/<repo>:main
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# 1b (only if $IMAGE is private): mirror it into Artifact Registry
gcloud artifacts repositories create promptfolio --repository-format=docker --location=$REGION
docker pull $IMAGE && docker tag $IMAGE $REGION-docker.pkg.dev/$PROJECT/promptfolio/web:main
gcloud auth configure-docker $REGION-docker.pkg.dev && docker push $REGION-docker.pkg.dev/$PROJECT/promptfolio/web:main
export IMAGE=$REGION-docker.pkg.dev/$PROJECT/promptfolio/web:main

gcloud run deploy promptfolio \
  --image $IMAGE --region $REGION --platform managed \
  --port 3000 --allow-unauthenticated \
  --memory 128Mi --cpu 1 --concurrency 80 \
  --min-instances 0 --max-instances 2 \
  --startup-probe httpGet.path=/api/ready,httpGet.port=3000,initialDelaySeconds=1,periodSeconds=2 \
  --liveness-probe httpGet.path=/api/health,httpGet.port=3000,periodSeconds=30
```

The command prints the service URL (`https://promptfolio-….run.app`).

## 2. Verify

```bash
URL=$(gcloud run services describe promptfolio --region $REGION --format 'value(status.url)')
curl -s $URL/api/health
curl -sI $URL | head -1
```

## 3. Custom domain

```bash
gcloud run domain-mappings create --service promptfolio --domain resume.example.com --region $REGION
```

Add the DNS records it prints (CNAME to `ghs.googlehosted.com` for a
subdomain). Google issues and renews the certificate. Alternatively put
Cloudflare in front with a proxied CNAME to the `run.app` host and SSL mode
Full (strict).

## 4. Update

Re-run `gcloud run deploy` with the new tag; Cloud Run shifts traffic to the
new revision once the startup probe passes. Roll back with
`gcloud run services update-traffic promptfolio --to-revisions <old>=100`.

## 5. Remove

```bash
gcloud run services delete promptfolio --region $REGION
gcloud artifacts repositories delete promptfolio --location $REGION   # if mirrored
```

## Terraform (optional)

[`deploy/gcp/main.tf`](../../deploy/gcp/main.tf) declares the same service
(public access, probes, 128 Mi, scale 0–2). `terraform init && terraform apply
-var project=<id> -var image=$IMAGE`.

## Cost

Free tier: 2 million requests, 360 000 GiB-seconds and 180 000 vCPU-seconds
per month. A resume site stays inside it; the only line item you may see is
Artifact Registry storage (cents). Cold start after idle is ~1 s.
