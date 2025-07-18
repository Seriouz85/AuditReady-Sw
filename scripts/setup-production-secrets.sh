#!/bin/bash

# Production Secrets Setup Script
# Helps configure production environment variables and Kubernetes secrets

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
Production Secrets Setup for Audit Readiness Hub

Usage: $0 [OPTIONS]

OPTIONS:
    --env-file FILE      Path to environment file (default: .env.production)
    --namespace NS       Kubernetes namespace (default: audit-readiness-hub-prod)
    --dry-run           Show what would be created without applying
    --validate-only     Only validate environment variables
    --create-k8s        Create Kubernetes secrets from environment file
    --help              Show this help message

EXAMPLES:
    $0                                    # Interactive setup
    $0 --env-file .env.production        # Use specific env file
    $0 --create-k8s --namespace my-ns    # Create K8s secrets
    $0 --validate-only                   # Just validate configuration

STEPS:
    1. Copy .env.production.template to .env.production
    2. Fill in your production values
    3. Run this script to validate and create secrets
    4. Deploy using ./deploy-k8s.sh

EOF
}

# Parse command line arguments
ENV_FILE="${PROJECT_ROOT}/.env.production"
NAMESPACE="audit-readiness-hub-prod"
DRY_RUN=false
VALIDATE_ONLY=false
CREATE_K8S=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --validate-only)
            VALIDATE_ONLY=true
            shift
            ;;
        --create-k8s)
            CREATE_K8S=true
            shift
            ;;
        --help)
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

# Required environment variables for production
REQUIRED_VARS=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "VITE_STRIPE_PUBLISHABLE_KEY"
    "VITE_SENTRY_DSN"
)

RECOMMENDED_VARS=(
    "VITE_GEMINI_API_KEY"
    "REDIS_PASSWORD"
    "SESSION_SECRET"
    "JWT_SECRET"
)

OPTIONAL_VARS=(
    "VITE_OPENAI_API_KEY"
    "VITE_ENTRA_CLIENT_ID"
    "VITE_FIREBASE_API_KEY"
    "RESEND_API_KEY"
)

# Check if environment file exists
check_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        print_error "Environment file not found: $ENV_FILE"
        
        if [[ -f "${PROJECT_ROOT}/.env.production.template" ]]; then
            print_status "Template file found. Creating .env.production from template..."
            cp "${PROJECT_ROOT}/.env.production.template" "$ENV_FILE"
            print_warning "Please edit $ENV_FILE with your actual production values"
            echo ""
            echo "Required variables to configure:"
            for var in "${REQUIRED_VARS[@]}"; do
                echo "  - $var"
            done
            echo ""
            echo "Run this script again after configuring the file."
            exit 1
        else
            print_error "Template file not found. Please create $ENV_FILE manually."
            exit 1
        fi
    fi
}

# Load environment variables from file
load_env_file() {
    print_status "Loading environment variables from: $ENV_FILE"
    
    # Export variables from the file
    set -a
    source "$ENV_FILE"
    set +a
    
    print_success "Environment variables loaded"
}

# Validate required environment variables
validate_env_vars() {
    print_status "Validating production environment variables..."
    
    local missing_required=()
    local missing_recommended=()
    
    # Check required variables
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_required+=("$var")
        fi
    done
    
    # Check recommended variables
    for var in "${RECOMMENDED_VARS[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_recommended+=("$var")
        fi
    done
    
    # Report missing required variables
    if [[ ${#missing_required[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_required[@]}"; do
            echo "  ❌ $var"
        done
        echo ""
        print_error "Please configure these variables in $ENV_FILE"
        exit 1
    fi
    
    # Report missing recommended variables
    if [[ ${#missing_recommended[@]} -gt 0 ]]; then
        print_warning "Missing recommended environment variables:"
        for var in "${missing_recommended[@]}"; do
            echo "  ⚠️  $var"
        done
        echo ""
        print_warning "These variables are recommended for full functionality"
    fi
    
    print_success "Environment validation completed"
}

# Validate specific variable formats
validate_formats() {
    print_status "Validating variable formats..."
    
    # Validate Supabase URL
    if [[ ! "$VITE_SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
        print_error "Invalid Supabase URL format: $VITE_SUPABASE_URL"
        exit 1
    fi
    
    # Validate Stripe key
    if [[ ! "$VITE_STRIPE_PUBLISHABLE_KEY" =~ ^pk_(live|test)_ ]]; then
        print_error "Invalid Stripe publishable key format: $VITE_STRIPE_PUBLISHABLE_KEY"
        exit 1
    fi
    
    # Validate Sentry DSN
    if [[ ! "$VITE_SENTRY_DSN" =~ ^https://.*@.*sentry\.io/ ]]; then
        print_error "Invalid Sentry DSN format: $VITE_SENTRY_DSN"
        exit 1
    fi
    
    # Check secret lengths
    if [[ -n "$SESSION_SECRET" && ${#SESSION_SECRET} -lt 32 ]]; then
        print_error "SESSION_SECRET must be at least 32 characters long"
        exit 1
    fi
    
    if [[ -n "$JWT_SECRET" && ${#JWT_SECRET} -lt 32 ]]; then
        print_error "JWT_SECRET must be at least 32 characters long"
        exit 1
    fi
    
    print_success "Format validation completed"
}

# Generate secure secrets if missing
generate_secrets() {
    print_status "Checking for auto-generated secrets..."
    
    local needs_update=false
    
    # Generate session secret if missing
    if [[ -z "$SESSION_SECRET" ]]; then
        SESSION_SECRET=$(openssl rand -hex 32)
        echo "SESSION_SECRET=$SESSION_SECRET" >> "$ENV_FILE"
        print_success "Generated SESSION_SECRET"
        needs_update=true
    fi
    
    # Generate JWT secret if missing
    if [[ -z "$JWT_SECRET" ]]; then
        JWT_SECRET=$(openssl rand -hex 32)
        echo "JWT_SECRET=$JWT_SECRET" >> "$ENV_FILE"
        print_success "Generated JWT_SECRET"
        needs_update=true
    fi
    
    # Generate Redis password if missing
    if [[ -z "$REDIS_PASSWORD" ]]; then
        REDIS_PASSWORD=$(openssl rand -base64 32)
        echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> "$ENV_FILE"
        print_success "Generated REDIS_PASSWORD"
        needs_update=true
    fi
    
    if [[ "$needs_update" == "true" ]]; then
        print_status "Reloading environment file with generated secrets..."
        load_env_file
    fi
}

# Create Kubernetes secrets
create_k8s_secrets() {
    print_status "Creating Kubernetes secrets..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        if [[ "$DRY_RUN" != "true" ]]; then
            print_status "Creating namespace: $NAMESPACE"
            kubectl create namespace "$NAMESPACE"
        else
            print_status "Would create namespace: $NAMESPACE"
        fi
    fi
    
    # Prepare secret creation command
    local secret_args=""
    
    # Add all required and available variables
    for var in "${REQUIRED_VARS[@]}" "${RECOMMENDED_VARS[@]}" "${OPTIONAL_VARS[@]}"; do
        if [[ -n "${!var}" ]]; then
            secret_args+=" --from-literal=$var=${!var}"
        fi
    done
    
    # Add demo account variables (always include these)
    secret_args+=" --from-literal=DEMO_EMAIL=${DEMO_EMAIL:-demo@auditready.com}"
    secret_args+=" --from-literal=DEMO_PASSWORD=${DEMO_PASSWORD:-AuditReady@Demo2025!}"
    secret_args+=" --from-literal=ENABLE_DEMO_ACCOUNT=${ENABLE_DEMO_ACCOUNT:-true}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_status "Would create secret with the following variables:"
        echo "$secret_args" | tr ' ' '\n' | grep "from-literal" | sed 's/--from-literal=/  - /' | sed 's/=.*/=***/'
    else
        # Delete existing secret if it exists
        kubectl delete secret audit-readiness-hub-secrets -n "$NAMESPACE" 2>/dev/null || true
        
        # Create the secret
        eval "kubectl create secret generic audit-readiness-hub-secrets $secret_args -n $NAMESPACE"
        
        print_success "Kubernetes secrets created successfully"
    fi
}

# Main execution
main() {
    print_status "Starting production secrets setup..."
    
    check_env_file
    load_env_file
    validate_env_vars
    validate_formats
    
    if [[ "$VALIDATE_ONLY" == "true" ]]; then
        print_success "Validation completed successfully!"
        return
    fi
    
    generate_secrets
    
    if [[ "$CREATE_K8S" == "true" ]]; then
        create_k8s_secrets
    fi
    
    print_success "Production secrets setup completed!"
    
    echo ""
    print_status "Next steps:"
    echo "1. Verify your secrets: kubectl get secrets -n $NAMESPACE"
    echo "2. Deploy to staging: ./scripts/deploy-k8s.sh -e staging"
    echo "3. Deploy to production: ./scripts/deploy-k8s.sh -e production"
    echo ""
    print_warning "Keep your .env.production file secure and never commit it to version control!"
}

# Run main function
main "$@"