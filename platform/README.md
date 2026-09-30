# Platform - Deployment & Infrastructure

Complete deployment infrastructure for the Doc Scanner application with Docker, Kubernetes, and Helm support.

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get up and running in 5 minutes
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide
- **[PLATFORM_STRUCTURE.md](PLATFORM_STRUCTURE.md)** - Folder structure and organization
- **[helm/README.md](helm/README.md)** - Helm chart documentation

## 📁 Contents

### `helm/` - Helm Chart (Recommended)
- Production-ready Helm chart for Kubernetes
- Templated and highly configurable
- Supports multiple environments (dev, prod)
- Automatic rolling updates and health checks

**Key Files:**
- `Chart.yaml` - Chart metadata
- `values.yaml` - Default configuration
- `values-dev.yaml` - Development environment config
- `values-prod.yaml` - Production environment config
- `templates/` - Kubernetes resource templates

### `k8s/` - Raw Kubernetes Manifests
- Static Kubernetes manifests for simple deployments
- Useful for GitOps workflows
- No templating required

**Key Files:**
- `namespace.yaml` - Namespace definition
- `deployment.yaml` - Application deployment
- `service.yaml` - Service configuration
- `ingress.yaml` - Ingress for external access

### `docker-compose.yml`
- Local development environment
- One-command setup for testing
- Includes health checks

## 🚀 Quick Start

### Development (Docker Compose)
```bash
cd platform
docker-compose up -d
```

### Production (Helm)
```bash
helm install doc-scanner ./platform/helm \
  -n doc-scanner \
  -f platform/helm/values-prod.yaml
```

### Simple Kubernetes
```bash
kubectl apply -f platform/k8s/
```

## 🎯 Choose Your Deployment Method

| Method | File | Best For |
|--------|------|----------|
| **Docker Compose** | `docker-compose.yml` | Local development |
| **kubectl** | `k8s/*.yaml` | Simple, static deployments |
| **Helm** | `helm/` | Production, templated, reusable |

## ✅ Features

- ✨ **Multi-environment support** (dev, prod)
- 🔄 **Automatic scaling** (HPA ready)
- 🏥 **Health checks** (liveness & readiness probes)
- 🔒 **Security best practices** (non-root user, read-only filesystem)
- 📊 **Resource management** (CPU/memory limits)
- 🌐 **Ingress support** (nginx, cert-manager ready)
- 📈 **Autoscaling** (optional HPA)
- 🚀 **Rolling updates** (zero-downtime deployments)

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         External Traffic                 │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │      Ingress        │
        │   (nginx/example)   │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │     Service         │
        │    ClusterIP        │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   Deployment        │
        │  (replicated Pods)  │
        └─────────────────────┘
```

## 🔧 Configuration Priority

1. **Base** (`values.yaml`)
2. **Environment** (`values-dev.yaml`, `values-prod.yaml`)
3. **Overrides** (command-line `-f` flags)

## 📝 Environment Variables

Configure via `values.yaml` `env` section or ConfigMap.

## 🔍 Monitoring & Debugging

```bash
# View deployment
kubectl get deployment -n doc-scanner

# View pods
kubectl get pods -n doc-scanner

# View logs
kubectl logs -n doc-scanner -l app=doc-scanner

# Port forward
kubectl port-forward svc/doc-scanner 8080:80 -n doc-scanner
```

## 🛠️ CI/CD Integration

All files support GitOps workflows with:
- ArgoCD
- Flux
- GitHub Actions
- GitLab CI
- Jenkins
- Azure DevOps

## 📞 Support

For detailed information, see the documentation files listed above.

---

**Last Updated:** 2026-09-11
**Kubernetes Version:** 1.24+
**Helm Version:** 3.0+
