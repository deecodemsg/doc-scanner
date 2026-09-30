# Deployment Guide - Doc Scanner

## Table of Contents
1. [Docker Build](#docker-build)
2. [Kubernetes Deployment](#kubernetes-deployment)
3. [Helm Deployment](#helm-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Troubleshooting](#troubleshooting)

## Docker Build

### Build Image Locally
```bash
npm run docker:build
```

### Build for Registry
```bash
docker build -t your-registry/web-twain-mfe:1.0.0 .
docker push your-registry/web-twain-mfe:1.0.0
```

### Run Locally
```bash
npm run docker:run
```

Visit http://localhost:3000

## Kubernetes Deployment

### Basic Deployment (kubectl)

1. Create namespace:
```bash
kubectl apply -f platform/k8s/namespace.yaml
```

2. Apply manifests:
```bash
kubectl apply -f platform/k8s/
```

3. Verify deployment:
```bash
kubectl get pods -n doc-scanner
kubectl get svc -n doc-scanner
```

### Check Deployment Status
```bash
kubectl describe deployment doc-scanner -n doc-scanner
kubectl logs -n doc-scanner deployment/doc-scanner
```

## Helm Deployment

### Prerequisites
- Helm 3.0+
- Kubernetes cluster configured

### Installation

#### Development Environment
```bash
helm install doc-scanner-dev ./platform/helm \
  -n doc-scanner-dev \
  --create-namespace \
  -f platform/helm/values-dev.yaml
```

#### Production Environment
```bash
helm install doc-scanner-prod ./platform/helm \
  -n doc-scanner-prod \
  --create-namespace \
  -f platform/helm/values-prod.yaml
```

### Upgrade
```bash
helm upgrade doc-scanner-prod ./platform/helm \
  -n doc-scanner-prod \
  -f platform/helm/values-prod.yaml
```

### Uninstall
```bash
helm uninstall doc-scanner-prod -n doc-scanner-prod
```

## Environment Configuration

See `values.yaml`, `values-dev.yaml`, and `values-prod.yaml` for configuration options.

### Common Customizations

- **Image Registry**: Update `image.repository`
- **Replicas**: Adjust `replicaCount`
- **Ingress Domain**: Set `ingress.hosts[0].host`
- **Resources**: Configure `resources.limits` and `resources.requests`

## Troubleshooting

### Pod stuck in Pending
```bash
kubectl describe pod -n doc-scanner <pod-name>
```

### Check Logs
```bash
kubectl logs -n doc-scanner -l app=doc-scanner --tail=100
```

### Port Forwarding
```bash
kubectl port-forward -n doc-scanner svc/doc-scanner 8080:80
```

### Delete and Redeploy
```bash
helm uninstall doc-scanner-dev -n doc-scanner-dev
helm install doc-scanner-dev ./platform/helm -n doc-scanner-dev -f values-dev.yaml
```
