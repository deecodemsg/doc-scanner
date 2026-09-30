# CI/CD Integration Examples

## GitHub Actions

### Deploy with Helm (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'platform/helm/**'
      - 'Dockerfile'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY }}/web-twain-mfe:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY }}/web-twain-mfe:${{ github.sha }}
      
      - name: Deploy with Helm
        run: |
          helm upgrade --install doc-scanner ./platform/helm \
            -n doc-scanner \
            --create-namespace \
            --set image.tag=${{ github.sha }} \
            -f platform/helm/values-prod.yaml
```

## GitLab CI

### CI/CD Pipeline (`.gitlab-ci.yml`)

```yaml
stages:
  - build
  - deploy

build_image:
  stage: build
  image: docker:latest
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy_prod:
  stage: deploy
  image: alpine/helm:latest
  script:
    - helm upgrade --install doc-scanner ./platform/helm
        -n doc-scanner
        --create-namespace
        --set image.tag=$CI_COMMIT_SHA
        -f platform/helm/values-prod.yaml
  only:
    - main
```

## Azure DevOps

### Pipeline (`azure-pipelines.yml`)

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  registry: 'yourregistry.azurecr.io'
  image: 'web-twain-mfe'

stages:
  - stage: Build
    jobs:
      - job: BuildImage
        steps:
          - task: Docker@2
            inputs:
              command: build
              Dockerfile: Dockerfile
              tags: $(registry)/$(image):$(Build.BuildId)
          
          - task: Docker@2
            inputs:
              command: push
              containerRegistry: 'azureRegistryConnection'

  - stage: Deploy
    jobs:
      - job: DeployHelm
        steps:
          - task: KubernetesManifest@0
            inputs:
              action: deploy
              kubernetesServiceConnection: 'k8s-connection'
              namespace: 'doc-scanner'
              manifests: |
                platform/helm/Chart.yaml
              helm: true
              arguments: |
                --values platform/helm/values-prod.yaml
```

## ArgoCD Integration

### Create ArgoCD Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: doc-scanner
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/doc-scanner
    targetRevision: HEAD
    path: platform/helm
    helm:
      values: |
        image.tag: latest
  destination:
    server: https://kubernetes.default.svc
    namespace: doc-scanner
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

## Flux v2 Integration

### Flux HelmRelease (`platform/flux-helmrelease.yaml`)

```yaml
apiVersion: helm.fluxcd.io/v1
kind: HelmRelease
metadata:
  name: doc-scanner
  namespace: doc-scanner
spec:
  releaseName: doc-scanner
  chart:
    path: platform/helm
  values:
    image.tag: latest
    replicaCount: 3
  wait: true
  timeout: 5m
  interval: 1h
  sourceRef:
    kind: GitRepository
    name: doc-scanner
    namespace: flux-system
```

## Jenkins Pipeline

### Jenkinsfile

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh 'docker build -t web-twain-mfe:${BUILD_ID} .'
            }
        }
        
        stage('Deploy') {
            when { branch 'main' }
            steps {
                sh '''
                    helm upgrade --install doc-scanner ./platform/helm \
                        -n doc-scanner \
                        --create-namespace \
                        --set image.tag=${BUILD_ID} \
                        -f platform/helm/values-prod.yaml
                '''
            }
        }
    }
}
```

## Terraform with Helm Provider

### `main.tf`

```hcl
provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

resource "helm_release" "doc_scanner" {
  name       = "doc-scanner"
  repository = "file://${path.module}/platform/helm"
  chart      = "."
  namespace  = "doc-scanner"
  
  values = [
    file("${path.module}/platform/helm/values-prod.yaml")
  ]
}
```

---

Choose the CI/CD platform that best fits your infrastructure!
