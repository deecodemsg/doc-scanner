# Platform Documentation Index

Complete reference for all deployment infrastructure components.

## 📚 Documentation Files

### Getting Started
| File | Purpose | Time |
|------|---------|------|
| [README.md](README.md) | Overview, features, architecture | 5 min |
| [QUICKSTART.md](QUICKSTART.md) | Fast setup guide with commands | 5 min |
| [SUMMARY.md](SUMMARY.md) | Implementation summary & checklist | 10 min |

### Comprehensive Guides
| File | Purpose | Time |
|------|---------|------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Full deployment instructions | 20 min |
| [PLATFORM_STRUCTURE.md](PLATFORM_STRUCTURE.md) | Folder organization explained | 10 min |
| [VALIDATION.md](VALIDATION.md) | Testing & validation procedures | 15 min |
| [CICD.md](CICD.md) | CI/CD integration examples | 15 min |

### Component Documentation
| File | Purpose | Time |
|------|---------|------|
| [helm/README.md](helm/README.md) | Helm chart specific docs | 10 min |

## 🗂️ File & Folder Map

```
platform/
├── 📄 INDEX.md ..................... This file
├── 📄 README.md ................... Start here
├── 📄 QUICKSTART.md ............... Fast setup
├── 📄 SUMMARY.md .................. What was created
├── 📄 DEPLOYMENT.md ............... Full guide
├── 📄 PLATFORM_STRUCTURE.md ....... Organization
├── 📄 VALIDATION.md ............... Testing
├── 📄 CICD.md ..................... CI/CD examples
├── 📄 docker-compose.yml .......... Local dev
│
├── 📁 helm/ ....................... Helm Chart
│   ├── Chart.yaml
│   ├── values.yaml (base)
│   ├── values-dev.yaml (dev environment)
│   ├── values-prod.yaml (prod environment)
│   ├── README.md
│   └── templates/
│       ├── _helpers.tpl
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       ├── configmap.yaml
│       ├── serviceaccount.yaml
│       └── hpa.yaml
│
└── 📁 k8s/ ........................ Kubernetes Manifests
    ├── namespace.yaml
    ├── deployment.yaml
    ├── service.yaml
    └── ingress.yaml
```

## 🎯 Quick Navigation

### "I want to..."

**...deploy locally for testing**
→ [QUICKSTART.md](QUICKSTART.md) → Docker Compose section

**...deploy to Kubernetes**
→ [QUICKSTART.md](QUICKSTART.md) → Kubernetes section

**...understand the project**
→ [README.md](README.md) + [SUMMARY.md](SUMMARY.md)

**...deploy to production**
→ [DEPLOYMENT.md](DEPLOYMENT.md) + [helm/README.md](helm/README.md)

**...set up CI/CD**
→ [CICD.md](CICD.md) + choose platform

**...validate my deployment**
→ [VALIDATION.md](VALIDATION.md)

**...customize for my environment**
→ [helm/README.md](helm/README.md) + [DEPLOYMENT.md](DEPLOYMENT.md)

## 📋 Deployment Methods Cheat Sheet

### Docker Compose (Local)
```bash
cd platform && docker-compose up -d
```
📖 See: [QUICKSTART.md](QUICKSTART.md#-local-development)

### Kubectl (Simple K8s)
```bash
kubectl apply -f platform/k8s/
```
📖 See: [QUICKSTART.md](QUICKSTART.md#-kubernetes-deployment)

### Helm (Production)
```bash
helm install doc-scanner ./platform/helm -n doc-scanner --create-namespace
```
📖 See: [helm/README.md](helm/README.md)

## 🔗 External Resources

### Helm Documentation
- [Helm Official Docs](https://helm.sh/docs/)
- [Helm Chart Best Practices](https://helm.sh/docs/chart_best_practices/)

### Kubernetes
- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [K8s Security Best Practices](https://kubernetes.io/docs/concepts/security/)

### Docker
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

## ✨ Key Features

- ✅ **3 Deployment Methods** (Docker Compose, kubectl, Helm)
- ✅ **Multi-Environment** (dev, prod)
- ✅ **Production-Ready** (security, health checks, scaling)
- ✅ **CI/CD Integration** (6+ platforms)
- ✅ **Comprehensive Docs** (7 files)
- ✅ **Validation Tools** (testing & debugging)

## 🚀 Recommended Path

1. Start with **[README.md](README.md)** for overview (5 min)
2. Run **[QUICKSTART.md](QUICKSTART.md)** locally (5 min)
3. Read **[SUMMARY.md](SUMMARY.md)** to understand what's included (10 min)
4. Choose your deployment method
5. Follow the appropriate guide for your environment
6. Use **[VALIDATION.md](VALIDATION.md)** to test

**Total time:** ~30 minutes to understand and deploy

## 📞 Support Resources

For issues or questions:

1. Check [VALIDATION.md](VALIDATION.md) for debugging
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for detailed steps
3. Check [CICD.md](CICD.md) if integrating with CI/CD
4. Review Helm templates in `helm/templates/` for customization

---

**Last Updated:** 2026-09-11
**Status:** ✅ Production Ready
**Version:** 1.0.0
