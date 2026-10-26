# Deploy: Kubernetes

`deploy/kubernetes/` is a Kustomize base: a hardened Deployment (2 replicas,
HTTP probes, non-root, read-only, no capabilities, requests/limits), a
ClusterIP Service and an Ingress.

## Prerequisites

- A cluster and `kubectl` with a context (`kubectl cluster-info`). Works on
  k3s, Talos, kind, GKE, EKS, AKS alike.
- An Ingress controller; cert-manager if you want TLS issued in-cluster.
- An `$IMAGE` the cluster can pull. For a **private** GHCR package create a
  pull secret: `kubectl create secret docker-registry ghcr --docker-server=ghcr.io --docker-username=<you> --docker-password=<PAT with read:packages>`
  and reference it with `imagePullSecrets` in an overlay.

## 1. Create an overlay

Never edit the base; put your values in an overlay:

```yaml
# deploy/overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: promptfolio
resources: ["../../kubernetes"]
images:
  - name: ghcr.io/OWNER/REPO
    newName: ghcr.io/<you>/<repo> # or the template image
    newTag: sha-abc1234 # pin a commit; `main` floats
patches:
  - target: { kind: Ingress, name: promptfolio }
    patch: |
      - op: replace
        path: /spec/rules/0/host
        value: resume.example.com
      - op: add
        path: /metadata/annotations
        value:
          cert-manager.io/cluster-issuer: letsencrypt
      - op: add
        path: /spec/tls
        value:
          - hosts: [resume.example.com]
            secretName: promptfolio-tls
      - op: add
        path: /spec/ingressClassName
        value: traefik                  # or nginx
```

## 2. Apply

```bash
kubectl create namespace promptfolio
kubectl apply -k deploy/overlays/prod
kubectl -n promptfolio rollout status deploy/promptfolio
```

## 3. Verify

```bash
kubectl -n promptfolio get pods,svc,ingress
kubectl -n promptfolio port-forward svc/promptfolio 3000:80 &
curl -s localhost:3000/api/ready
curl -sI https://resume.example.com | head -1
```

Readiness gates traffic: a pod whose baked-in content fails validation
answers `503` on `/api/ready` and never receives requests.

## 4. Update and roll back

```bash
# bump newTag in the overlay, then
kubectl apply -k deploy/overlays/prod          # rolling update, zero downtime with 2 replicas
kubectl -n promptfolio rollout undo deploy/promptfolio   # back to the previous image
```

GitOps: point Argo CD or Flux at the overlay directory; let CI bump `newTag`
(or Argo CD Image Updater track `sha-*`).

## 5. Remove

```bash
kubectl delete -k deploy/overlays/prod
kubectl delete namespace promptfolio
```

## Sizing

Requests `50m` CPU / `96Mi`, limit `256Mi` in the base; the container idles at
~40 MB, so one replica fits in the smallest node you have. Two replicas are
for rolling updates, not load. Add an HPA only if you are famous.

## Notes

- The base has `automountServiceAccountToken: false`, `RuntimeDefault`
  seccomp and an `emptyDir` on `/tmp`; keep them in your overlay.
- Probes are HTTP; no exec, no shell needed in the image.
- Cost: your cluster; the workload itself is negligible.
