# Doc Scanner Helm Chart

A Kubernetes Helm chart for deploying the DynamicWebTWAIN React MFE (Document Scanner) application.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.0+
- Docker image `web-twain-mfe` built and available in your registry

## Installation

### Add the chart repository

```bash
helm repo add doc-scanner ./platform/helm
helm repo update
```

### Install the chart

```bash
helm install my-doc-scanner ./platform/helm \
  --namespace doc-scanner \
  --create-namespace
```

### Install with custom values

```bash
helm install my-doc-scanner ./platform/helm \
  --namespace doc-scanner \
  --create-namespace \
  -f values-prod.yaml
```

## Configuration

See `values.yaml` for all available configuration options.

### Key Options

- **replicaCount**: Number of pod replicas (default: 2)
- **image.repository**: Docker image repository
- **image.tag**: Docker image tag
- **ingress.enabled**: Enable Ingress (default: false)
- **autoscaling.enabled**: Enable HPA (default: false)
- **resources**: CPU and memory limits/requests

## Usage Examples

### Enable Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: doc-scanner.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Enable Autoscaling

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 4
  targetCPUUtilizationPercentage: 80
```

### Custom Resource Limits

```yaml
resources:
  limits:
    cpu: 1000m
    memory: 512Mi
  requests:
    cpu: 500m
    memory: 256Mi
```

## Uninstall

```bash
helm uninstall my-doc-scanner --namespace doc-scanner
```

## Troubleshooting

Check pod logs:
```bash
kubectl logs -n doc-scanner deployment/my-doc-scanner-doc-scanner
```

Check deployment status:
```bash
kubectl describe deployment -n doc-scanner
```
