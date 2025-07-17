#!/bin/bash

# Audit Readiness Hub - Docker Development Environment Setup
# This script sets up the complete development environment with MCP server

set -e

echo "🚀 Setting up Audit Readiness Hub Development Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

print_success "Docker is running"

# Check if environment file exists
if [ ! -f ".env.local" ]; then
    print_warning "No .env.local file found. Creating from template..."
    cp .env.docker .env.local
    print_warning "Please edit .env.local with your actual environment variables"
fi

# Function to start services
start_services() {
    print_status "Starting development services..."
    
    # Start core services first
    docker compose -f docker-compose.dev.yml up -d redis postgres-local
    
    # Wait for services to be ready
    print_status "Waiting for Redis to be ready..."
    timeout 30 bash -c 'until docker compose -f docker-compose.dev.yml exec -T redis redis-cli ping | grep PONG; do sleep 1; done'
    
    print_status "Waiting for PostgreSQL to be ready..."
    timeout 30 bash -c 'until docker compose -f docker-compose.dev.yml exec -T postgres-local pg_isready -U postgres; do sleep 1; done'
    
    # Start application services
    print_status "Starting application services..."
    docker compose -f docker-compose.dev.yml up -d frontend mcp-server nginx
    
    # Start monitoring services
    print_status "Starting monitoring services..."
    docker compose -f docker-compose.dev.yml up -d prometheus grafana mailhog
    
    print_success "All services started successfully!"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    docker compose -f docker-compose.dev.yml ps
    
    echo ""
    print_status "Available Services:"
    echo "🌐 Frontend:     http://localhost (or http://localhost:5173)"
    echo "🤖 MCP Server:   http://localhost:3001"
    echo "📊 Grafana:      http://localhost:3000 (admin/admin)"
    echo "📈 Prometheus:   http://localhost:9090"
    echo "📧 MailHog:      http://localhost:8025"
    echo "🗄️  Redis:        localhost:6379"
    echo "🐘 PostgreSQL:   localhost:5432"
    echo ""
    echo "🔗 WebSocket MCP: ws://localhost:3001"
    echo "🩺 Health Check:  http://localhost:3001/health"
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        print_status "Showing logs for $service..."
        docker compose -f docker-compose.dev.yml logs -f "$service"
    else
        print_status "Showing logs for all services..."
        docker compose -f docker-compose.dev.yml logs -f
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping development services..."
    docker compose -f docker-compose.dev.yml down
    print_success "All services stopped"
}

# Function to restart services
restart_services() {
    print_status "Restarting development services..."
    docker compose -f docker-compose.dev.yml restart
    print_success "All services restarted"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker compose -f docker-compose.dev.yml down -v
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to setup MCP integration
setup_mcp() {
    print_status "Setting up MCP integration..."
    
    # Create MCP client configuration
    mkdir -p ~/.config/claude-code
    
    cat > ~/.config/claude-code/mcp-settings.json << EOF
{
  "mcpServers": {
    "audit-hub": {
      "command": "node",
      "args": ["/Users/$(whoami)/audit-readiness-hub/docker/mcp/client.js"],
      "env": {
        "MCP_SERVER_URL": "ws://localhost:3001"
      }
    }
  }
}
EOF
    
    print_success "MCP configuration created"
    print_status "You can now connect Claude Code to the MCP server at ws://localhost:3001"
}

# Function to run tests
run_tests() {
    print_status "Running tests in Docker environment..."
    docker compose -f docker-compose.dev.yml exec frontend npm test
}

# Function to run linting
run_lint() {
    print_status "Running linting in Docker environment..."
    docker compose -f docker-compose.dev.yml exec frontend npm run lint
}

# Function to build for production
build_prod() {
    print_status "Building production images..."
    docker compose -f docker-compose.prod.yml build
    print_success "Production images built successfully"
}

# Main script logic
case "${1:-start}" in
    "start")
        start_services
        show_status
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "cleanup")
        cleanup
        ;;
    "mcp")
        setup_mcp
        ;;
    "test")
        run_tests
        ;;
    "lint")
        run_lint
        ;;
    "build")
        build_prod
        ;;
    "help"|"-h"|"--help")
        echo "Audit Readiness Hub - Docker Development Environment"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start    Start all development services (default)"
        echo "  stop     Stop all services"
        echo "  restart  Restart all services"
        echo "  status   Show service status and URLs"
        echo "  logs     Show logs for all services or specific service"
        echo "  cleanup  Stop services and clean up Docker resources"
        echo "  mcp      Setup MCP integration with Claude Code"
        echo "  test     Run tests in Docker environment"
        echo "  lint     Run linting in Docker environment"
        echo "  build    Build production Docker images"
        echo "  help     Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs frontend"
        echo "  $0 logs mcp-server"
        echo "  $0 cleanup"
        ;;
    *)
        print_error "Unknown command: $1"
        print_status "Use '$0 help' for available commands"
        exit 1
        ;;
esac