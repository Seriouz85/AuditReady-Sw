# Kubernetes Deployment Guide for Audit Readiness Hub

This guide provides comprehensive instructions for deploying the Audit Readiness Hub application to Kubernetes clusters across different environments.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            KUBERNETES CLUSTER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │    Ingress      │  │  Load Balancer  │  │   Cert Manager  │            │
│  │   Controller    │  │   (External)    │  │   (Let's Encrypt)│            │
│  │   (NGINX)       │  │                 │  │                 │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│           │                       │                     │                  │
│  ┌─────────────────────────────────┴─────────────────────┴────────────────┐ │
│  │                        INGRESS LAYER                                   │ │
│  │  ┌── TLS Termination ──┐  ┌── Rate Limiting ──┐  ┌── Security ──┐    │ │
│  │  │ HTTPS Certificate   │  │ API Rate Limits    │  │ WAF Rules     │    │ │
│  │  │ Automatic Renewal   │  │ Connection Limits  │  │ DDoS Protection│    │ │
│  │  └─────────────────────┘  └───────────────────┘  └───────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                        │                                    │
│  ┌─────────────────────────────────────┴─────────────────────────────────┐  │
│  │                      APPLICATION LAYER                                │  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Pod 1     │  │   Pod 2     │  │   Pod 3     │  │   Pod N     │  │  │
│  │  │ Frontend    │  │ Frontend    │  │ Frontend    │  │ Frontend    │  │  │
│  │  │ + Nginx     │  │ + Nginx     │  │ + Nginx     │  │ + Nginx     │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                 Horizontal Pod Autoscaler                       │  │  │
│  │  │  ├── CPU/Memory Metrics ──┤  ├── Request Rate Metrics ──┤       │  │  │
│  │  │  ├── Min: 3 Replicas ─────┤  ├── Max: 50 Replicas ──────┤       │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                    │
│  ┌─────────────────────────────────────┴─────────────────────────────────┐  │
│  │                        CACHE LAYER                                    │  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │  │
│  │  │   Redis     │  │  Persistent │  │   Config    │                   │  │
│  │  │   Master    │  │   Volume    │  │   Maps      │                   │  │
│  │  │   (Cache)   │  │   (Data)    │  │  (Settings) │                   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                       MONITORING LAYER                                 │  │
│  │                                                                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │ Prometheus  │  │   Grafana   │  │   Alerts    │  │    Logs     │    │  │
│  │  │  (Metrics)  │  │(Dashboards) │  │ (Notifications)│ (Aggregation)│    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

External Services:
├── Supabase (Database, Auth, Storage)
├── Stripe (Payment Processing)
├── Sentry (Error Monitoring)
└── Third-party APIs (AI Services)
```

## 📋 Prerequisites

### Required Tools
- **kubectl** (v1.24+): Kubernetes command-line tool
- **kustomize** (v4.0+): Template-free customization of Kubernetes objects
- **helm** (v3.0+): Package manager for Kubernetes (optional)
- **docker**: For building and managing container images

### Cluster Requirements
- **Kubernetes**: v1.24 or later
- **Ingress Controller**: NGINX Ingress Controller
- **Cert Manager**: For automatic SSL certificate management
- **Metrics Server**: For HPA functionality
- **StorageClass**: For persistent volumes (Redis data)

### Installation Commands
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install kustomize
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
sudo mv kustomize /usr/local/bin/

# Verify installations
kubectl version --client
kustomize version
```

## 🗂️ Directory Structure

```
k8s/
├── base/                           # Base Kubernetes manifests
│   ├── kustomization.yaml         # Base kustomization
│   ├── namespace.yaml             # Namespace definition
│   ├── configmap.yaml             # Application configuration
│   ├── secret.yaml                # Secrets template
│   ├── deployment.yaml            # Application deployment
│   ├── service.yaml               # Service definitions
│   ├── ingress.yaml               # Ingress configuration
│   ├── hpa.yaml                   # Horizontal Pod Autoscaler
│   ├── redis.yaml                 # Redis cache
│   └── monitoring.yaml            # Monitoring configuration
├── overlays/                      # Environment-specific overlays
│   ├── development/               # Development environment
│   │   ├── kustomization.yaml
│   │   └── patches/
│   ├── staging/                   # Staging environment
│   │   ├── kustomization.yaml
│   │   └── patches/
│   └── production/                # Production environment
│       ├── kustomization.yaml
│       ├── deployment-patch.yaml
│       ├── ingress-patch.yaml
│       └── hpa-patch.yaml
├── monitoring/                    # Monitoring stack
│   ├── prometheus/
│   ├── grafana/
│   └── alertmanager/
└── secrets/                       # Secret management
    ├── sealed-secrets/
    └── external-secrets/
```

## 🚀 Quick Start

### 1. Prerequisites Setup

```bash
# Verify cluster access
kubectl cluster-info

# Install required cluster components
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 2. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd audit-readiness-hub

# Make deployment script executable
chmod +x scripts/deploy-k8s.sh

# Set up environment variables
cp k8s/secrets/.env.template k8s/secrets/.env.production
# Edit .env.production with your actual values
```

### 3. Deploy to Development

```bash
# Development deployment
./scripts/deploy-k8s.sh -e development

# Check deployment status
kubectl get pods -n audit-readiness-hub-dev -w
```

### 4. Deploy to Production

```bash
# Production deployment (with confirmation)
./scripts/deploy-k8s.sh -e production

# Force production deployment (skip confirmation)
./scripts/deploy-k8s.sh -e production --force
```

## 🌍 Environment Configurations

### Development Environment
- **Namespace**: `audit-readiness-hub-dev`
- **Replicas**: 1-3 pods
- **Resources**: Minimal (256Mi memory, 250m CPU)
- **Features**: Debug logging, development APIs
- **Domain**: `dev.auditready.com`

### Staging Environment
- **Namespace**: `audit-readiness-hub-staging`
- **Replicas**: 2-10 pods
- **Resources**: Moderate (512Mi memory, 500m CPU)
- **Features**: Production-like configuration, testing APIs
- **Domain**: `staging.auditready.com`

### Production Environment
- **Namespace**: `audit-readiness-hub-prod`
- **Replicas**: 5-50 pods
- **Resources**: High (1Gi memory, 1000m CPU)
- **Features**: Enhanced security, monitoring, backup
- **Domain**: `app.auditready.com`

## 🔧 Configuration Management

### ConfigMaps
Application configuration is managed through ConfigMaps:

```yaml
# Application settings
NODE_ENV: "production"
REDIS_URL: "redis://redis-service:6379"
ENABLE_MONITORING: "true"
CACHE_TTL_DEFAULT: "300"

# Feature flags
ENABLE_REAL_TIME_COLLABORATION: "true"
ENABLE_AI_ASSISTANCE: "true"
ENABLE_ADVANCED_REPORTING: "true"
```

### Secrets Management

**Development**: Direct secret creation
```bash
kubectl create secret generic audit-readiness-hub-secrets \
  --from-literal=VITE_SUPABASE_URL="your-supabase-url" \
  --from-literal=VITE_SUPABASE_ANON_KEY="your-anon-key" \
  -n audit-readiness-hub-dev
```

**Production**: Use external secret management
```bash
# Example with Azure Key Vault
kubectl apply -f k8s/secrets/external-secrets/
```

### Environment Variables
```bash
# Required for all environments
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY

# Optional but recommended
VITE_GEMINI_API_KEY
VITE_SENTRY_DSN
REDIS_PASSWORD
```

## 📊 Monitoring & Observability

### Prometheus Metrics
- **Application metrics**: Response times, error rates, throughput
- **Infrastructure metrics**: CPU, memory, network, storage
- **Business metrics**: User activity, feature usage

### Grafana Dashboards
- **Application Performance**: Response times, error rates
- **Infrastructure Health**: Resource utilization, pod status
- **Business Metrics**: User engagement, feature adoption

### Alerting Rules
```yaml
# High error rate alert
- alert: HighErrorRate
  expr: rate(nginx_http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  labels:
    severity: warning

# Application down alert
- alert: ApplicationDown
  expr: up{job="audit-readiness-hub"} == 0
  for: 1m
  labels:
    severity: critical
```

### Log Aggregation
- **Structured logging**: JSON format for easy parsing
- **Log levels**: DEBUG, INFO, WARN, ERROR
- **Correlation IDs**: Request tracing across services

## 🔒 Security Configuration

### Network Policies
```yaml
# Restrict ingress traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: audit-readiness-hub-netpol
spec:
  podSelector:
    matchLabels:
      app: audit-readiness-hub
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
```

### Pod Security Standards
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL
```

### TLS/SSL Configuration
```yaml
# Automatic certificate management
metadata:
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - app.auditready.com
    secretName: audit-readiness-hub-tls
```

## 🔄 Scaling & Performance

### Horizontal Pod Autoscaler (HPA)
```yaml
# Production HPA configuration
spec:
  minReplicas: 5
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
```

### Vertical Pod Autoscaler (VPA)
```bash
# Install VPA (optional)
kubectl apply -f https://github.com/kubernetes/autoscaler/releases/latest/download/vpa-v1.yaml
```

### Cluster Autoscaler
```yaml
# Node scaling based on resource demands
metadata:
  annotations:
    cluster-autoscaler/scale-down-enabled: "true"
    cluster-autoscaler/min-size: "3"
    cluster-autoscaler/max-size: "100"
```

## 🗄️ Data Management

### Redis Cache
```yaml
# Production Redis configuration
spec:
  containers:
  - name: redis
    image: redis:7-alpine
    args:
    - redis-server
    - --maxmemory 256mb
    - --maxmemory-policy allkeys-lru
    - --appendonly yes
```

### Persistent Volumes
```yaml
# Redis data persistence
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: fast-ssd
```

### Backup Strategy
```bash
# Automated Redis backups
apiVersion: batch/v1
kind: CronJob
metadata:
  name: redis-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: redis:7-alpine
            command:
            - redis-cli
            - --rdb
            - /backup/dump.rdb
```

## 📱 Deployment Commands

### Basic Deployment
```bash
# Deploy to development
./scripts/deploy-k8s.sh -e development

# Deploy to staging
./scripts/deploy-k8s.sh -e staging

# Deploy to production
./scripts/deploy-k8s.sh -e production --force
```

### Advanced Deployment Options
```bash
# Dry run (preview changes)
./scripts/deploy-k8s.sh -e production --dry-run

# Verbose output
./scripts/deploy-k8s.sh -e production --verbose

# Custom namespace
./scripts/deploy-k8s.sh -e production -n custom-namespace
```

### Manual Deployment
```bash
# Using kustomize directly
kustomize build k8s/overlays/production | kubectl apply -f -

# Using kubectl with kustomization
kubectl apply -k k8s/overlays/production
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Pod Not Starting
```bash
# Check pod status
kubectl get pods -n audit-readiness-hub-prod

# View pod logs
kubectl logs -l app=audit-readiness-hub -n audit-readiness-hub-prod

# Describe pod for events
kubectl describe pod <pod-name> -n audit-readiness-hub-prod
```

#### 2. Service Not Accessible
```bash
# Check service endpoints
kubectl get endpoints -n audit-readiness-hub-prod

# Test service connectivity
kubectl run test-pod --image=busybox -it --rm -- wget -O- audit-readiness-hub-service
```

#### 3. Ingress Issues
```bash
# Check ingress status
kubectl get ingress -n audit-readiness-hub-prod

# View ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

#### 4. Certificate Issues
```bash
# Check certificate status
kubectl get certificates -n audit-readiness-hub-prod

# View cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

### Health Checks
```bash
# Application health
curl -f https://app.auditready.com/health

# Kubernetes health
kubectl get componentstatuses

# Node health
kubectl get nodes
kubectl top nodes
```

### Performance Debugging
```bash
# Pod resource usage
kubectl top pods -n audit-readiness-hub-prod

# HPA status
kubectl get hpa -n audit-readiness-hub-prod

# Events
kubectl get events -n audit-readiness-hub-prod --sort-by='.lastTimestamp'
```

## 🔄 Rolling Updates & Rollbacks

### Update Deployment
```bash
# Update image tag
kubectl set image deployment/audit-readiness-hub \
  audit-readiness-hub=audit-readiness-hub:v1.1.0 \
  -n audit-readiness-hub-prod

# Monitor rollout
kubectl rollout status deployment/audit-readiness-hub -n audit-readiness-hub-prod
```

### Rollback Deployment
```bash
# View rollout history
kubectl rollout history deployment/audit-readiness-hub -n audit-readiness-hub-prod

# Rollback to previous version
kubectl rollout undo deployment/audit-readiness-hub -n audit-readiness-hub-prod

# Rollback to specific revision
kubectl rollout undo deployment/audit-readiness-hub --to-revision=2 -n audit-readiness-hub-prod
```

## 📈 Capacity Planning

### Resource Estimation
```bash
# CPU/Memory per request
Base: 10m CPU, 50Mi memory per concurrent user
Peak: 50m CPU, 200Mi memory per concurrent user

# Scaling calculation
Users: 1000 concurrent → Pods: ~10-15
Users: 5000 concurrent → Pods: ~25-35
Users: 10000 concurrent → Pods: ~50+
```

### Cost Optimization
```bash
# Node affinity for cost savings
nodeSelector:
  node-type: "spot-instance"

# Resource requests tuning
resources:
  requests:
    cpu: "250m"      # Start conservative
    memory: "256Mi"  # Monitor and adjust
```

## 🔐 Security Best Practices

### 1. Secrets Management
- Use external secret management (Azure Key Vault, AWS Secrets Manager)
- Rotate secrets regularly
- Never commit secrets to version control

### 2. Network Security
- Implement network policies
- Use service mesh for advanced traffic management
- Enable mutual TLS between services

### 3. Pod Security
- Run as non-root user
- Use read-only root filesystem
- Drop all capabilities
- Enable security scanning

### 4. Access Control
- Use RBAC for cluster access
- Implement least privilege principle
- Regular access reviews

## 📚 Additional Resources

### Documentation
- [Kubernetes Official Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Cert Manager Documentation](https://cert-manager.io/docs/)

### Monitoring Tools
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)
- [Jaeger](https://www.jaegertracing.io/docs/) (for distributed tracing)

### Security Tools
- [Falco](https://falco.org/) - Runtime security monitoring
- [OPA Gatekeeper](https://open-policy-agent.github.io/gatekeeper/) - Policy enforcement
- [Trivy](https://aquasecurity.github.io/trivy/) - Vulnerability scanning

## 🆘 Support & Contact

For deployment issues or questions:
1. Check the troubleshooting section above
2. Review application logs and Kubernetes events
3. Consult monitoring dashboards
4. Contact the development team

---

**Security Note**: Always review and customize the security configurations based on your organization's requirements and compliance needs.