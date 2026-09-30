# Quick Start Guide

## 🚀 Local Development

### Using Docker Compose
```bash
cd platform
docker-compose up -d
# Access at http://localhost
```

### Stop Services
```bash
docker-compose down
```

## 📦 Build Docker Image

```bash
npm run docker:build
npm run docker:run
```

## ☸️ Kubernetes Deployment

### Option 1: Using kubectl (Raw Manifests)

```bash
# Create namespace
kubectl apply -f platform/k8s/namespace.yaml

# Deploy application
kubectl apply -f platform/k8s/deployment.yaml
kubectl apply -f platform/k8s/service.yaml
kubectl apply -f platform/k8s/ingress.yaml

# Check status
kubectl get all -n doc-scanner
```

### Option 2: Using Helm (Recommended)

```bash
# Development
helm install doc-scanner-dev ./platform/helm \
  -n doc-scanner-dev \
  --create-namespace \
  -f platform/helm/values-dev.yaml

# Production
helm install doc-scanner-prod ./platform/helm \
  -n doc-scanner-prod \
  --create-namespace \
  -f platform/helm/values-prod.yaml
```

## 🔍 Verification

```bash
# Check pods
kubectl get pods -n doc-scanner

# Check services
kubectl get svc -n doc-scanner

# View logs
kubectl logs -n doc-scanner -l app=doc-scanner

# Port forward for local testing
kubectl port-forward -n doc-scanner svc/doc-scanner 8080:80
# Access at http://localhost:8080
```

## 🔄 Update Deployment

### With Helm
```bash
helm upgrade doc-scanner ./platform/helm \
  -n doc-scanner \
  -f platform/helm/values.yaml
```

### With kubectl
```bash
kubectl set image deployment/doc-scanner \
  -n doc-scanner \
  web-twain-mfe=web-twain-mfe:new-tag
```

## 🗑️ Clean Up

### Remove Helm Release
```bash
helm uninstall doc-scanner -n doc-scanner
```

### Remove Kubernetes Resources
```bash
kubectl delete -f platform/k8s/
kubectl delete namespace doc-scanner
```

## 📋 Common Tasks

| Task | Command |
|------|---------|
| View chart values | `helm show values ./platform/helm` |
| Dry run deployment | `helm install --dry-run --debug doc-scanner ./platform/helm` |
| Get release history | `helm history doc-scanner -n doc-scanner` |
| Rollback release | `helm rollback doc-scanner 1 -n doc-scanner` |
| Check ingress | `kubectl get ingress -n doc-scanner` |

## 📚 Documentation

- **Helm Details**: See `platform/helm/README.md`
- **Full Deployment Guide**: See `platform/DEPLOYMENT.md`
- **Platform Structure**: See `platform/PLATFORM_STRUCTURE.md`

## ⚠️ Troubleshooting

```bash
# Pod not starting?
kubectl describe pod -n doc-scanner <pod-name>

# Service not accessible?
kubectl describe svc -n doc-scanner doc-scanner

# Need more logs?
kubectl logs -n doc-scanner -f deployment/doc-scanner

# Check events
kubectl get events -n doc-scanner
```

## 🔧 Customization

All configuration is in `platform/helm/values*.yaml` files. Common changes:

```yaml
# Change image
image.repository: "your-registry/web-twain-mfe"
image.tag: "1.2.3"

# Change domain
ingress.hosts[0].host: "your-domain.com"

# Scale replicas
replicaCount: 5

# Enable autoscaling
autoscaling.enabled: true
```

For more details, refer to individual documentation files.
