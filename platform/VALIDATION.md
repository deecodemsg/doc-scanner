# Validation & Testing Guide

## 🔍 Helm Chart Validation

### Lint Chart
```bash
helm lint ./platform/helm
```

### Dry Run Installation
```bash
# Development
helm install doc-scanner-dev ./platform/helm \
  -n doc-scanner-dev \
  --create-namespace \
  --dry-run \
  --debug \
  -f platform/helm/values-dev.yaml

# Production
helm install doc-scanner ./platform/helm \
  -n doc-scanner \
  --create-namespace \
  --dry-run \
  --debug \
  -f platform/helm/values-prod.yaml
```

### Render Templates
```bash
helm template doc-scanner ./platform/helm \
  -f platform/helm/values-prod.yaml \
  > /tmp/rendered.yaml

# View rendered output
cat /tmp/rendered.yaml
```

### Show Values
```bash
# Default values
helm show values ./platform/helm

# With overrides
helm show values ./platform/helm -f platform/helm/values-prod.yaml
```

## ☸️ Kubernetes Validation

### Validate Manifests
```bash
# Check syntax
kubectl apply -f platform/k8s/ --dry-run=client -o yaml

# Check policies (if using admission controllers)
kubectl apply -f platform/k8s/ --dry-run=server -o yaml
```

### Verify After Deployment
```bash
# Check deployment
kubectl get deployment -n doc-scanner
kubectl describe deployment -n doc-scanner doc-scanner

# Check pods
kubectl get pods -n doc-scanner
kubectl describe pod -n doc-scanner <pod-name>

# Check services
kubectl get svc -n doc-scanner
kubectl get endpoints -n doc-scanner

# Check ingress
kubectl get ingress -n doc-scanner
kubectl describe ingress -n doc-scanner

# Check events
kubectl get events -n doc-scanner --sort-by='.lastTimestamp'
```

## 🧪 Health Checks

### Test Liveness Probe
```bash
# Port forward to pod
kubectl port-forward -n doc-scanner <pod-name> 8080:80

# Test health endpoint
curl http://localhost:8080/
```

### Test Readiness Probe
```bash
# Check probe configuration
kubectl get deployment -n doc-scanner \
  -o jsonpath='{.items[0].spec.template.spec.containers[0].readinessProbe}'
```

### Check Probe Logs
```bash
kubectl logs -n doc-scanner <pod-name> --previous
```

## 📊 Performance & Resource Validation

### Check Resource Usage
```bash
# View current usage
kubectl top nodes
kubectl top pods -n doc-scanner

# Check resource requests/limits
kubectl get pods -n doc-scanner \
  -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].resources}{"\n"}{end}'
```

### Monitor Autoscaling
```bash
# Check HPA status (if enabled)
kubectl get hpa -n doc-scanner
kubectl describe hpa -n doc-scanner doc-scanner

# Watch scaling in action
kubectl get pods -n doc-scanner -w
```

## 🔒 Security Validation

### Verify Security Context
```bash
# Check pod security
kubectl get pod -n doc-scanner <pod-name> \
  -o jsonpath='{.spec.securityContext}'

# Check container security
kubectl get pod -n doc-scanner <pod-name> \
  -o jsonpath='{.spec.containers[0].securityContext}'
```

### Check Pod Security Policy
```bash
# List policies
kubectl get psp

# Check if pod is compliant
kubectl get pod -n doc-scanner <pod-name> -o yaml | \
  grep -A 10 "securityContext"
```

## 🔧 Docker Compose Validation

### Test Compose File
```bash
docker-compose -f platform/docker-compose.yml config
```

### Check Services
```bash
docker-compose -f platform/docker-compose.yml ps
docker-compose -f platform/docker-compose.yml logs doc-scanner
```

### Test Application
```bash
# Wait for health check to pass
sleep 60

# Test endpoint
curl http://localhost/
curl http://localhost/remoteEntry.js

# Check logs
docker-compose -f platform/docker-compose.yml logs -f doc-scanner
```

## 📝 Checklist Before Production

- [ ] Helm chart passes `helm lint`
- [ ] Dry-run succeeds without errors
- [ ] All pods are in Running state
- [ ] All containers pass readiness probe
- [ ] Services have endpoints
- [ ] Ingress has addresses assigned
- [ ] Resource requests are appropriate
- [ ] Security context is enforced
- [ ] HPA is scaling correctly (if enabled)
- [ ] Health checks respond successfully
- [ ] Container logs show no errors
- [ ] Application is accessible via ingress

## 🆘 Debugging Commands

```bash
# Describe pod for detailed info
kubectl describe pod -n doc-scanner <pod-name>

# Check pod events
kubectl get events -n doc-scanner --field-selector involvedObject.name=<pod-name>

# Stream logs
kubectl logs -f -n doc-scanner <pod-name>

# Check readiness probe
kubectl get pod -n doc-scanner <pod-name> \
  -o jsonpath='{.status.conditions[?(@.type=="Ready")]}'

# Check probes configuration
kubectl get deployment -n doc-scanner \
  -o jsonpath='{.items[0].spec.template.spec.containers[0]}{"\n"}' | jq '.livenessProbe, .readinessProbe'

# Port forward to debug
kubectl port-forward -n doc-scanner svc/doc-scanner 8080:80
```

## ✅ Validation Script

```bash
#!/bin/bash
set -e

echo "🔍 Validating Helm Chart..."
helm lint ./platform/helm

echo "🧪 Testing dry-run..."
helm install test ./platform/helm --dry-run --debug > /dev/null

echo "☸️ Validating Kubernetes Manifests..."
kubectl apply -f platform/k8s/ --dry-run=client -o yaml > /tmp/k8s-test.yaml

echo "✅ All validations passed!"
```

Save as `validate.sh` and run with `bash validate.sh`
