#!/bin/bash

# Monitoring Setup Script for Audit Readiness Hub
# Sets up Prometheus, Grafana, and Sentry monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
K8S_DIR="$PROJECT_ROOT/k8s"

# Default values
ENVIRONMENT="production"
NAMESPACE=""
INSTALL_PROMETHEUS=true
INSTALL_GRAFANA=true
SETUP_SENTRY=true
DRY_RUN=false

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    cat << EOF
Monitoring Setup for Audit Readiness Hub

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV    Environment (development|staging|production)
    -n, --namespace NS       Kubernetes namespace
    --no-prometheus         Skip Prometheus installation
    --no-grafana           Skip Grafana installation
    --no-sentry            Skip Sentry configuration
    --dry-run              Show what would be installed
    -h, --help             Show this help message

EXAMPLES:
    $0                                    # Install everything for production
    $0 -e staging                        # Install for staging environment
    $0 --no-sentry                      # Skip Sentry setup
    $0 --dry-run                        # Preview installation

COMPONENTS:
    - Prometheus: Metrics collection and alerting
    - Grafana: Dashboards and visualization
    - Sentry: Error tracking and performance monitoring
    - Alertmanager: Alert routing and management

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --no-prometheus)
            INSTALL_PROMETHEUS=false
            shift
            ;;
        --no-grafana)
            INSTALL_GRAFANA=false
            shift
            ;;
        --no-sentry)
            SETUP_SENTRY=false
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Set namespace if not provided
if [[ -z "$NAMESPACE" ]]; then
    case $ENVIRONMENT in
        development)
            NAMESPACE="audit-readiness-hub-dev"
            ;;
        staging)
            NAMESPACE="audit-readiness-hub-staging"
            ;;
        production)
            NAMESPACE="audit-readiness-hub-prod"
            ;;
    esac
fi

check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    # Check helm
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed"
        print_status "Installing helm..."
        curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

setup_monitoring_namespace() {
    print_status "Setting up monitoring namespace..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "Would create monitoring namespace"
        return
    fi
    
    # Create monitoring namespace if it doesn't exist
    if ! kubectl get namespace monitoring &> /dev/null; then
        kubectl create namespace monitoring
        print_success "Created monitoring namespace"
    fi
    
    # Label the namespace
    kubectl label namespace monitoring monitoring=enabled --overwrite
}

install_prometheus() {
    if [[ "$INSTALL_PROMETHEUS" != "true" ]]; then
        print_status "Skipping Prometheus installation"
        return
    fi
    
    print_status "Installing Prometheus..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "Would install Prometheus with Helm"
        return
    fi
    
    # Add Prometheus helm repository
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    # Create values file for Prometheus
    cat > /tmp/prometheus-values.yaml << EOF
server:
  global:
    scrape_interval: 15s
    evaluation_interval: 15s
  persistentVolume:
    enabled: true
    size: 10Gi
  retention: "30d"
  
alertmanager:
  enabled: true
  persistentVolume:
    enabled: true
    size: 2Gi

pushgateway:
  enabled: false

nodeExporter:
  enabled: true

kubeStateMetrics:
  enabled: true

configmapReload:
  prometheus:
    enabled: true
  alertmanager:
    enabled: true

serverFiles:
  alerting_rules.yml:
$(cat "$K8S_DIR/monitoring/prometheus/alerting-rules.yaml" | sed 's/^/    /')

  prometheus.yml:
$(cat "$K8S_DIR/monitoring/prometheus/prometheus.prod.yaml" | sed 's/^/    /')
EOF
    
    # Install or upgrade Prometheus
    helm upgrade --install prometheus prometheus-community/prometheus \
        --namespace monitoring \
        --values /tmp/prometheus-values.yaml \
        --wait
    
    # Clean up temp file
    rm -f /tmp/prometheus-values.yaml
    
    print_success "Prometheus installed successfully"
}

install_grafana() {
    if [[ "$INSTALL_GRAFANA" != "true" ]]; then
        print_status "Skipping Grafana installation"
        return
    fi
    
    print_status "Installing Grafana..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "Would install Grafana with Helm"
        return
    fi
    
    # Add Grafana helm repository
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update
    
    # Create values file for Grafana
    cat > /tmp/grafana-values.yaml << EOF
adminPassword: "admin123!" # Change this in production

persistence:
  enabled: true
  size: 10Gi

service:
  type: ClusterIP

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - grafana.auditready.com
  tls:
    - secretName: grafana-tls
      hosts:
        - grafana.auditready.com

datasources:
  datasources.yaml:
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      url: http://prometheus-server:80
      access: proxy
      isDefault: true

dashboardProviders:
  dashboardproviders.yaml:
    apiVersion: 1
    providers:
    - name: 'default'
      orgId: 1
      folder: ''
      type: file
      disableDeletion: false
      editable: true
      options:
        path: /var/lib/grafana/dashboards/default

dashboards:
  default:
    audit-hub-overview:
      json: |
$(cat "$K8S_DIR/monitoring/grafana/dashboards/audit-hub-overview.json" | sed 's/^/        /')

sidecar:
  dashboards:
    enabled: true
    searchNamespace: ALL
  datasources:
    enabled: true
    searchNamespace: ALL
EOF
    
    # Install or upgrade Grafana
    helm upgrade --install grafana grafana/grafana \
        --namespace monitoring \
        --values /tmp/grafana-values.yaml \
        --wait
    
    # Clean up temp file
    rm -f /tmp/grafana-values.yaml
    
    print_success "Grafana installed successfully"
    
    # Get Grafana password
    GRAFANA_PASSWORD=$(kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode)
    print_status "Grafana admin password: $GRAFANA_PASSWORD"
}

setup_sentry() {
    if [[ "$SETUP_SENTRY" != "true" ]]; then
        print_status "Skipping Sentry setup"
        return
    fi
    
    print_status "Setting up Sentry configuration..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "Would configure Sentry integration"
        return
    fi
    
    # Create Sentry configuration
    cat > "$PROJECT_ROOT/src/lib/monitoring/sentry.ts" << 'EOF'
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_APP_ENV || 'development';
  
  if (!dsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          // @ts-ignore - React Router integration
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
    
    // Performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out demo account errors
      if (event.user?.email === 'demo@auditready.com') {
        return null;
      }
      
      // Filter out development errors
      if (environment === 'development') {
        console.error('Sentry Error:', event, hint);
        return null;
      }
      
      return event;
    },
    
    // Additional configuration
    attachStacktrace: true,
    autoSessionTracking: true,
    
    // Custom tags
    initialScope: {
      tags: {
        component: 'audit-readiness-hub',
        environment
      }
    }
  });
};

export const captureUserFeedback = (user: any, feedback: string) => {
  Sentry.captureUserFeedback({
    event_id: Sentry.lastEventId(),
    name: user.name || user.email,
    email: user.email,
    comments: feedback
  });
};

export default Sentry;
EOF

    # Create monitoring initialization file
    cat > "$PROJECT_ROOT/src/lib/monitoring/index.ts" << 'EOF'
import { initSentry } from './sentry';
import { initProductionConfig } from '../config/production';

export const initMonitoring = () => {
  // Initialize production configuration
  initProductionConfig();
  
  // Initialize Sentry
  initSentry();
  
  // Set up performance monitoring
  if (typeof window !== 'undefined') {
    // Monitor Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
};
EOF
    
    print_success "Sentry configuration created"
    print_status "Add the Sentry DSN to your environment variables"
    print_status "Import and call initMonitoring() in your main.tsx file"
}

create_monitoring_docs() {
    print_status "Creating monitoring documentation..."
    
    cat > "$PROJECT_ROOT/MONITORING.md" << 'EOF'
# Monitoring Guide for Audit Readiness Hub

## Overview

This guide covers the monitoring setup for the Audit Readiness Hub production environment.

## Components

### Prometheus
- **URL**: http://prometheus.monitoring.svc.cluster.local:9090
- **Purpose**: Metrics collection and alerting
- **Retention**: 30 days
- **Storage**: 10Gi persistent volume

### Grafana
- **URL**: https://grafana.auditready.com
- **Purpose**: Dashboards and visualization
- **Admin**: admin / [see secret]
- **Storage**: 10Gi persistent volume

### Sentry
- **Purpose**: Error tracking and performance monitoring
- **Environment**: Production
- **Sample Rate**: 10% for performance monitoring

## Key Metrics

### Application Health
- **up{job="audit-readiness-hub"}**: Application availability
- **nginx_ingress_controller_requests**: Request rate and status codes
- **nginx_ingress_controller_request_duration_seconds**: Response times

### Resource Usage
- **container_cpu_usage_seconds_total**: CPU usage by pod
- **container_memory_usage_bytes**: Memory usage by pod
- **kube_pod_container_status_restarts_total**: Pod restart count

### Business Metrics
- **Demo account usage**: Percentage of traffic to demo endpoints
- **User activity**: Request patterns and engagement
- **Feature adoption**: Usage of specific application features

## Alerts

### Critical Alerts (Immediate Response)
- **ApplicationDown**: Application is not responding
- **HighErrorRate**: Error rate > 5%
- **RedisDown**: Cache is not available
- **SLABreach**: SLA thresholds exceeded

### Warning Alerts (1-Hour Response)
- **HighCPUUsage**: CPU usage > 80%
- **HighMemoryUsage**: Memory usage > 90%
- **PodRestartingTooOften**: Frequent pod restarts

## Dashboards

### Production Overview
- Application status and health
- Request rate and error rate
- Response time distribution
- Resource usage by pod
- Demo account usage statistics

### Infrastructure
- Kubernetes cluster health
- Node resource usage
- Storage utilization
- Network metrics

## Runbooks

### Application Down
1. Check pod status: `kubectl get pods -n audit-readiness-hub-prod`
2. Check logs: `kubectl logs -l app=audit-readiness-hub -n audit-readiness-hub-prod`
3. Check ingress: `kubectl get ingress -n audit-readiness-hub-prod`
4. Check service endpoints: `kubectl get endpoints -n audit-readiness-hub-prod`

### High Error Rate
1. Check error logs in Grafana
2. Identify error patterns in Sentry
3. Check recent deployments
4. Verify external service health (Supabase, Stripe)

### High Resource Usage
1. Check pod resource usage in Grafana
2. Identify resource-intensive operations
3. Check for memory leaks or CPU spikes
4. Consider scaling up if sustained

## Maintenance

### Regular Tasks
- Review alert thresholds monthly
- Update dashboard based on new features
- Clean up old metrics data
- Test alert notifications

### Backup
- Grafana dashboards: Export to Git repository
- Prometheus data: Automated backups to object storage
- Alert rules: Version controlled in Git

## Troubleshooting

### Common Issues
- **Missing metrics**: Check Prometheus targets
- **Dashboard not loading**: Verify Grafana datasource
- **Alerts not firing**: Check alertmanager configuration
- **High cardinality**: Review metric labels and reduce if needed

### Support Contacts
- Engineering Team: engineering@auditready.com
- DevOps Team: devops@auditready.com
- On-call: Use PagerDuty for critical alerts
EOF
    
    print_success "Monitoring documentation created"
}

show_monitoring_status() {
    print_status "Monitoring Status:"
    
    echo ""
    echo "Prometheus:"
    kubectl get pods -n monitoring -l app.kubernetes.io/name=prometheus
    
    echo ""
    echo "Grafana:"
    kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana
    
    echo ""
    echo "Services:"
    kubectl get services -n monitoring
    
    echo ""
    echo "Ingress:"
    kubectl get ingress -n monitoring
    
    echo ""
    print_success "Monitoring setup completed!"
    print_status "Access Grafana at: https://grafana.auditready.com"
    print_status "Prometheus available at: kubectl port-forward -n monitoring svc/prometheus-server 9090:80"
}

# Main execution
main() {
    print_status "Setting up monitoring for Audit Readiness Hub"
    print_status "Environment: $ENVIRONMENT"
    print_status "Namespace: $NAMESPACE"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_warning "DRY RUN MODE - No changes will be made"
    fi
    
    check_prerequisites
    setup_monitoring_namespace
    install_prometheus
    install_grafana
    setup_sentry
    create_monitoring_docs
    
    if [[ "$DRY_RUN" != "true" ]]; then
        show_monitoring_status
    fi
}

# Run main function
main "$@"
EOF