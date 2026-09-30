# Platform Folder Structure

```
platform/
├── helm/                          # Helm Chart
│   ├── Chart.yaml                # Helm chart metadata
│   ├── values.yaml               # Default configuration
│   ├── values-dev.yaml           # Development config
│   ├── values-prod.yaml          # Production config
│   ├── README.md                 # Helm chart documentation
│   └── templates/                # Kubernetes templates
│       ├── _helpers.tpl          # Template helpers
│       ├── deployment.yaml       # Deployment template
│       ├── service.yaml          # Service template
│       ├── ingress.yaml          # Ingress template
│       ├── configmap.yaml        # ConfigMap template
│       ├── serviceaccount.yaml   # ServiceAccount template
│       └── hpa.yaml              # HorizontalPodAutoscaler template
│
├── k8s/                          # Raw Kubernetes manifests
│   ├── namespace.yaml            # Namespace definition
│   ├── deployment.yaml           # Deployment manifest
│   ├── service.yaml              # Service manifest
│   └── ingress.yaml              # Ingress manifest
│
├── docker-compose.yml            # Docker Compose for local development
├── DEPLOYMENT.md                 # Deployment guide
└── PLATFORM_STRUCTURE.md         # This file
```

## Quick Start

### Local Development (Docker Compose)
```bash
cd platform
docker-compose up -d
```

### Kubernetes Deployment (kubectl)
```bash
kubectl apply -f platform/k8s/
```

### Kubernetes Deployment (Helm)
```bash
helm install doc-scanner ./platform/helm
```

## File Descriptions

### Helm Chart Files

- **Chart.yaml**: Metadata about the Helm chart (name, version, maintainers)
- **values.yaml**: Default configuration values for the chart
- **values-dev.yaml**: Development environment overrides
- **values-prod.yaml**: Production environment overrides
- **README.md**: Documentation for using the Helm chart
- **templates/**: Go templates that generate Kubernetes YAML

### Kubernetes Manifests

- **namespace.yaml**: Creates the doc-scanner namespace
- **deployment.yaml**: Kubernetes Deployment for the application
- **service.yaml**: Kubernetes Service (ClusterIP)
- **ingress.yaml**: Kubernetes Ingress for external access

## Configuration Hierarchy

1. `values.yaml` (base)
2. `values-dev.yaml` or `values-prod.yaml` (environment-specific)
3. Command-line overrides (highest priority)

## Deployment Methods

| Method | File | Use Case |
|--------|------|----------|
| Docker Compose | `docker-compose.yml` | Local development |
| kubectl | `k8s/*.yaml` | Simple, static deployments |
| Helm | `helm/` | Templated, reusable deployments |

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Deploy with Helm
  run: |
    helm upgrade --install doc-scanner ./platform/helm \
      -n doc-scanner \
      -f platform/helm/values-prod.yaml
```

### GitLab CI Example
```yaml
deploy:
  script:
    - helm upgrade --install doc-scanner ./platform/helm
      -n doc-scanner
      -f platform/helm/values-prod.yaml
```
