# Deploy: AWS

Three honest options, cheapest first. All written from AWS documentation
and the template's conventions; not exercised by the template's CI, so treat
the CLI invocations as a starting point and `aws <service> help` as truth.

| Option                   | What runs     | Idle cost       | Needs the container? |
| ------------------------ | ------------- | --------------- | -------------------- |
| **S3 + CloudFront**      | static files  | ≈ $0.50/month   | no                   |
| **Lightsail Containers** | the container | $7/month (Nano) | yes                  |
| **App Runner**           | the container | ≈ $5/month idle | yes                  |

(ECS Fargate and EKS work too but cost more for no gain at this scale.)

Prerequisites for all: `aws` CLI configured (`aws sts get-caller-identity`),
a region, and for the container options an `$IMAGE` — App Runner and
Lightsail pull from **ECR** or a public registry; a private GHCR image must
be mirrored to ECR first (shown below).

---

## S3 + CloudFront (static)

1. Build the folder: `pnpm build && pnpm export:static`.
2. Bucket and upload:

   ```bash
   export BUCKET=resume-example-com REGION=us-east-1
   aws s3 mb s3://$BUCKET --region $REGION
   aws s3 sync out/static s3://$BUCKET --delete
   ```

3. CloudFront distribution with the bucket as origin (Origin Access Control,
   bucket stays private), default root object `index.html`, redirect HTTP→HTTPS,
   and an ACM certificate (in `us-east-1`) for your domain. The console wizard
   does this in one screen; via CLI use `aws cloudfront create-distribution`
   with a generated config (`--generate-cli-skeleton`).
4. Extension-less `/about`: add a CloudFront Function on viewer-request that
   appends `.html` when the URI has no extension — or simply link to
   `/about.html`.
5. DNS: Route 53 alias (or any CNAME) to the distribution.
6. Verify: `curl -sI https://resume.example.com | head -1`.
7. Update: `aws s3 sync … --delete` then
   `aws cloudfront create-invalidation --distribution-id <id> --paths '/*'`.
8. Remove: disable and delete the distribution, empty and delete the bucket.

## Mirror the image to ECR (container options)

```bash
export REGION=us-east-1 ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
aws ecr create-repository --repository-name promptfolio --region $REGION
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$REGION.amazonaws.com
docker pull $IMAGE && docker tag $IMAGE $ACCOUNT.dkr.ecr.$REGION.amazonaws.com/promptfolio:main
docker push $ACCOUNT.dkr.ecr.$REGION.amazonaws.com/promptfolio:main
export IMAGE=$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/promptfolio:main
```

## Lightsail Containers ($7/month, simplest managed container)

```bash
aws lightsail create-container-service --service-name promptfolio --power nano --scale 1 --region $REGION
aws lightsail create-container-service-deployment --service-name promptfolio --region $REGION \
  --containers '{"web":{"image":"'$IMAGE'","ports":{"3000":"HTTP"}}}' \
  --public-endpoint '{"containerName":"web","containerPort":3000,"healthCheck":{"path":"/api/ready","successCodes":"200"}}'
aws lightsail get-container-services --service-name promptfolio --query 'containerServices[0].url' --output text
```

Custom domain: Lightsail → the service → _Custom domains_ (it issues the
certificate). Update: re-run the deployment command with a new tag. Remove:
`aws lightsail delete-container-service --service-name promptfolio`.

## App Runner (scale-to-zero-ish, ≈ $5/month idle)

```bash
aws apprunner create-service --service-name promptfolio --region $REGION \
  --source-configuration '{"ImageRepository":{"ImageIdentifier":"'$IMAGE'","ImageRepositoryType":"ECR","ImageConfiguration":{"Port":"3000"}},"AutoDeploymentsEnabled":true,"AuthenticationConfiguration":{"AccessRoleArn":"<AppRunnerECRAccessRole ARN>"}}' \
  --instance-configuration '{"Cpu":"0.25 vCPU","Memory":"0.5 GB"}' \
  --health-check-configuration '{"Protocol":"HTTP","Path":"/api/ready","Interval":10,"Timeout":5,"HealthyThreshold":1,"UnhealthyThreshold":3}'
```

The ECR access role is created once in the console (App Runner → _Create
service_ offers it) or by [`deploy/aws/apprunner/main.tf`](../../deploy/aws/apprunner/main.tf),
which declares role, service, probes and sizing together. Custom domain:
`aws apprunner associate-custom-domain`. App Runner keeps one provisioned
instance warm (that is the ≈ $5); set `AutoDeploymentsEnabled` so a new ECR
push deploys itself. Remove: `aws apprunner delete-service --service-arn <arn>`.

## Verify (any container option)

```bash
curl -s https://<service-url>/api/health
curl -s https://<service-url>/api/ready
```

## Which to pick

Static if you don't need the JSON API or probes (you probably don't).
Lightsail if you want the container and a fixed, predictable bill. App Runner
if you already use ECR and want push-to-deploy.
