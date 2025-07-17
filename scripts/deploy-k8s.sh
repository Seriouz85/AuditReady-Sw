#!/bin/bash

# Kubernetes Deployment Script for Audit Readiness Hub
# Supports multiple environments with safety checks

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
ENVIRONMENT="development"
NAMESPACE=""
DRY_RUN=false
VERBOSE=false
FORCE=false

# Function to print colored output
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

# Function to show usage
show_usage() {
    cat << EOF
Kubernetes Deployment Script for Audit Readiness Hub

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV    Environment to deploy (development|staging|production)
    -n, --namespace NS       Kubernetes namespace (auto-generated if not provided)
    -d, --dry-run           Show what would be deployed without applying
    -v, --verbose           Enable verbose logging
    -f, --force             Force deployment without confirmation
    -h, --help              Show this help message

EXAMPLES:
    $0 -e development                 # Deploy to development
    $0 -e production -n prod-ns       # Deploy to production with custom namespace
    $0 -e staging --dry-run           # Preview staging deployment
    $0 -e production --force          # Force production deployment

ENVIRONMENTS:
    development  - Local development cluster
    staging      - Pre-production environment
    production   - Production environment with enhanced security and scaling

PREREQUISITES:
    - kubectl configured and connected to cluster
    - kustomize CLI tool installed
    - Docker image built and available
    - Secrets properly configured in cluster

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
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -f|--force)
            FORCE=true
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

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Must be one of: development, staging, production"
    exit 1
fi

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check kustomize
    if ! command -v kustomize &> /dev/null; then
        print_error "kustomize is not installed or not in PATH"
        exit 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        print_error "Please ensure kubectl is configured correctly"
        exit 1
    fi
    
    # Check if overlay exists
    OVERLAY_DIR="$K8S_DIR/overlays/$ENVIRONMENT"
    if [[ ! -d "$OVERLAY_DIR" ]]; then
        print_error "Environment overlay not found: $OVERLAY_DIR"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Get cluster information
get_cluster_info() {
    CLUSTER_NAME=$(kubectl config current-context)
    CLUSTER_SERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
    
    print_status "Cluster Information:"
    echo "  Context: $CLUSTER_NAME"
    echo "  Server: $CLUSTER_SERVER"
    echo "  Environment: $ENVIRONMENT"
    echo "  Namespace: $NAMESPACE"
}

# Validate production deployment
validate_production() {
    if [[ "$ENVIRONMENT" == "production" ]]; then
        print_warning "You are about to deploy to PRODUCTION environment!"
        
        if [[ "$FORCE" != "true" ]]; then
            echo -n "Are you sure you want to continue? (type 'yes' to confirm): "
            read -r confirmation
            if [[ "$confirmation" != "yes" ]]; then
                print_error "Deployment cancelled"
                exit 1
            fi
        fi
        
        # Additional production checks
        print_status "Running production-specific validations..."
        
        # Check if secrets exist
        if ! kubectl get secret audit-readiness-hub-secrets -n "$NAMESPACE" &> /dev/null; then
            print_error "Production secrets not found in namespace $NAMESPACE"
            print_error "Please ensure secrets are properly configured"
            exit 1
        fi
        
        # Check for TLS certificate
        if ! kubectl get secret audit-readiness-hub-tls-prod -n "$NAMESPACE" &> /dev/null; then
            print_warning "TLS certificate secret not found"
            print_warning "HTTPS may not work properly"
        fi
    fi
}

# Build and validate manifests
build_manifests() {
    print_status "Building Kubernetes manifests..."
    
    OVERLAY_DIR="$K8S_DIR/overlays/$ENVIRONMENT"
    MANIFEST_FILE="/tmp/audit-readiness-hub-$ENVIRONMENT.yaml"
    
    if [[ "$VERBOSE" == "true" ]]; then
        kustomize build "$OVERLAY_DIR" > "$MANIFEST_FILE"
    else
        kustomize build "$OVERLAY_DIR" > "$MANIFEST_FILE" 2>/dev/null
    fi
    
    if [[ $? -ne 0 ]]; then
        print_error "Failed to build Kubernetes manifests"
        exit 1
    fi
    
    # Validate manifests
    if ! kubectl apply --dry-run=client -f "$MANIFEST_FILE" &> /dev/null; then
        print_error "Manifest validation failed"
        exit 1
    fi
    
    print_success "Manifests built and validated successfully"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "Dry-run mode: Generated manifests:"
        echo "=================="
        cat "$MANIFEST_FILE"
        echo "=================="
        rm -f "$MANIFEST_FILE"
        exit 0
    fi
    
    echo "$MANIFEST_FILE"
}

# Deploy to cluster
deploy_to_cluster() {
    local manifest_file="$1"
    
    print_status "Deploying to Kubernetes cluster..."
    
    # Create namespace if it doesn't exist
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_status "Creating namespace: $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
    fi
    
    # Apply manifests
    if [[ "$VERBOSE" == "true" ]]; then
        kubectl apply -f "$manifest_file" --record
    else
        kubectl apply -f "$manifest_file" --record > /dev/null
    fi
    
    if [[ $? -ne 0 ]]; then
        print_error "Deployment failed"
        exit 1
    fi
    
    print_success "Deployment applied successfully"
}

# Wait for deployment to be ready
wait_for_deployment() {
    print_status "Waiting for deployment to be ready..."
    
    local deployment_name="audit-readiness-hub"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        deployment_name="prod-audit-readiness-hub"
    fi
    
    # Wait for deployment rollout
    if ! kubectl rollout status deployment/"$deployment_name" -n "$NAMESPACE" --timeout=600s; then
        print_error "Deployment did not become ready within timeout"
        print_error "Check logs with: kubectl logs -l app=audit-readiness-hub -n $NAMESPACE"
        exit 1
    fi
    
    print_success "Deployment is ready"
}

# Show deployment status
show_deployment_status() {
    print_status "Deployment Status:"
    
    # Show pods
    echo ""
    echo "Pods:"
    kubectl get pods -n "$NAMESPACE" -l app=audit-readiness-hub
    
    # Show services
    echo ""
    echo "Services:"
    kubectl get services -n "$NAMESPACE" -l app=audit-readiness-hub
    
    # Show ingress
    echo ""
    echo "Ingress:"
    kubectl get ingress -n "$NAMESPACE" -l app=audit-readiness-hub
    
    # Show HPA status
    echo ""
    echo "Horizontal Pod Autoscaler:"
    kubectl get hpa -n "$NAMESPACE" -l app=audit-readiness-hub
    
    # Get application URL
    local ingress_host
    ingress_host=$(kubectl get ingress -n "$NAMESPACE" -l app=audit-readiness-hub -o jsonpath='{.items[0].spec.rules[0].host}' 2>/dev/null)
    
    if [[ -n "$ingress_host" ]]; then
        echo ""
        print_success "Application URL: https://$ingress_host"
    fi
}

# Cleanup function
cleanup() {
    if [[ -f "/tmp/audit-readiness-hub-$ENVIRONMENT.yaml" ]]; then
        rm -f "/tmp/audit-readiness-hub-$ENVIRONMENT.yaml"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    print_status "Starting Kubernetes deployment for Audit Readiness Hub"
    print_status "Environment: $ENVIRONMENT"
    
    check_prerequisites
    get_cluster_info
    validate_production
    
    manifest_file=$(build_manifests)
    
    if [[ "$DRY_RUN" != "true" ]]; then
        deploy_to_cluster "$manifest_file"
        wait_for_deployment
        show_deployment_status
        
        print_success "Deployment completed successfully!"
        print_status "Monitor the deployment with:"
        echo "  kubectl get pods -n $NAMESPACE -w"
        echo "  kubectl logs -f deployment/audit-readiness-hub -n $NAMESPACE"
    fi
}

# Run main function
main "$@"