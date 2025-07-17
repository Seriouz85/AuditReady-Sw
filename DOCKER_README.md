# Docker Development Environment for Audit Readiness Hub

This Docker setup provides a complete containerized development environment with enhanced AI development capabilities through MCP (Model Context Protocol) integration.

## 🚀 Quick Start

1. **Prerequisites**
   - Docker Desktop installed and running
   - Git (for cloning the repository)
   - Node.js 20+ (for local development tools)

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.docker .env.local
   
   # Edit with your actual API keys and configuration
   nano .env.local
   ```

3. **Start Development Environment**
   ```bash
   # Make the script executable (if not already)
   chmod +x scripts/docker-dev.sh
   
   # Start all services
   ./scripts/docker-dev.sh start
   ```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCKER DEVELOPMENT STACK                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Nginx     │  │  Frontend   │  │ MCP Server  │            │
│  │   Proxy     │  │   (Vite)    │  │  (Node.js)  │            │
│  │   :80       │  │   :5173     │  │   :3001     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    Redis    │  │ PostgreSQL  │  │   MailHog   │            │
│  │   Cache     │  │  Database   │  │    SMTP     │            │
│  │   :6379     │  │   :5432     │  │   :1025     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                             │
│  │ Prometheus  │  │   Grafana   │                             │
│  │ Monitoring  │  │ Dashboards  │                             │
│  │   :9090     │  │   :3000     │                             │
│  └─────────────┘  └─────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Services Overview

### Core Application Services

- **Frontend (Vite)**: React development server with hot reload
- **MCP Server**: AI development assistance and workspace management
- **Nginx**: Reverse proxy and load balancer
- **Redis**: Caching and session storage
- **PostgreSQL**: Local database for development

### Development Tools

- **MailHog**: Email testing server
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards

## 🌐 Service URLs

Once started, access the following services:

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost | Main application (via Nginx) |
| **Frontend Direct** | http://localhost:5173 | Vite dev server direct access |
| **MCP Server** | http://localhost:3001 | AI development assistance API |
| **MCP WebSocket** | ws://localhost:3001 | Real-time MCP communication |
| **Grafana** | http://localhost:3000 | Monitoring dashboards (admin/admin) |
| **Prometheus** | http://localhost:9090 | Metrics and monitoring |
| **MailHog** | http://localhost:8025 | Email testing interface |
| **Health Check** | http://localhost:3001/health | System health status |

## 🤖 MCP (Model Context Protocol) Integration

The MCP server provides enhanced AI development capabilities:

### Features

- **Real-time file watching**: Monitor code changes
- **Code analysis**: Automated code quality checks
- **Docker management**: Container orchestration
- **Database operations**: Direct database access
- **AI assistance**: Code review and test generation
- **Development tools**: Linting, testing, formatting

### MCP API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health status |
| `/workspace/structure` | GET | Get complete workspace structure |
| `/workspace/analyze` | POST | Analyze code files |
| `/docker/containers` | GET | List running containers |
| `/docker/compose` | POST | Execute docker-compose actions |
| `/tools/lint` | POST | Run code linting |
| `/tools/test` | POST | Execute tests |
| `/database/query` | POST | Execute database queries |
| `/ai/code-review` | POST | AI-powered code review |
| `/ai/generate-tests` | POST | Generate test files |

### WebSocket Events

- `file-change`: Real-time file modification notifications
- `file-add`: New file creation events
- `file-delete`: File deletion events
- `command-result`: Command execution results
- `command-error`: Command execution errors

## 📋 Available Commands

Use the convenience script for common operations:

```bash
# Start all services
./scripts/docker-dev.sh start

# Stop all services
./scripts/docker-dev.sh stop

# Restart services
./scripts/docker-dev.sh restart

# View service status
./scripts/docker-dev.sh status

# View logs (all services)
./scripts/docker-dev.sh logs

# View logs for specific service
./scripts/docker-dev.sh logs frontend
./scripts/docker-dev.sh logs mcp-server

# Setup MCP integration for Claude Code
./scripts/docker-dev.sh mcp

# Run tests in Docker environment
./scripts/docker-dev.sh test

# Run linting
./scripts/docker-dev.sh lint

# Build production images
./scripts/docker-dev.sh build

# Clean up all Docker resources
./scripts/docker-dev.sh cleanup

# Show help
./scripts/docker-dev.sh help
```

## 🔧 Development Workflow

### 1. Code Development

- Edit files in your local workspace
- Changes are automatically reflected in the running containers
- Vite provides hot module replacement for instant updates

### 2. AI-Assisted Development

- Connect Claude Code to the MCP server at `ws://localhost:3001`
- Use AI assistance for code reviews, test generation, and analysis
- Real-time file watching provides context awareness

### 3. Testing and Quality

```bash
# Run tests
./scripts/docker-dev.sh test

# Run linting
./scripts/docker-dev.sh lint

# Access testing email server
open http://localhost:8025
```

### 4. Database Operations

- Access PostgreSQL directly: `localhost:5432`
- Use the MCP server API for queries
- View database schema through MCP endpoints

### 5. Monitoring and Debugging

- **Grafana**: http://localhost:3000 for dashboards
- **Prometheus**: http://localhost:9090 for metrics
- **Logs**: Use `./scripts/docker-dev.sh logs [service]`

## 🔒 Security Considerations

### Development Environment

- Local PostgreSQL with default credentials
- Redis without authentication (development only)
- All services exposed on localhost
- Email testing through MailHog

### Production Differences

- Encrypted Redis with authentication
- Secured database connections
- SSL/TLS termination
- Proper secret management
- Network isolation

## 🚀 Production Deployment

### Building Production Images

```bash
# Build production images
./scripts/docker-dev.sh build

# Start production stack
docker compose -f docker-compose.prod.yml up -d
```

### Production Configuration

- SSL/TLS certificates required
- Environment variables for secrets
- External database (Supabase)
- Redis with authentication
- Comprehensive monitoring

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using the port
   lsof -i :5173
   
   # Stop conflicting services
   ./scripts/docker-dev.sh stop
   ```

2. **Docker Permission Issues**
   ```bash
   # Ensure Docker Desktop is running
   docker info
   
   # Reset Docker Desktop if needed
   ```

3. **Environment Variables**
   ```bash
   # Verify .env.local exists and has correct values
   cat .env.local
   
   # Copy from template if missing
   cp .env.docker .env.local
   ```

4. **MCP Connection Issues**
   ```bash
   # Check MCP server status
   curl http://localhost:3001/health
   
   # View MCP server logs
   ./scripts/docker-dev.sh logs mcp-server
   ```

### Service Health Checks

```bash
# Check all service health
./scripts/docker-dev.sh status

# Individual service health
docker compose -f docker-compose.dev.yml ps
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Supabase Documentation](https://supabase.com/docs)
- [Redis Documentation](https://redis.io/documentation)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

## 🤝 Contributing

1. Make changes in your local environment
2. Test with `./scripts/docker-dev.sh test`
3. Ensure linting passes with `./scripts/docker-dev.sh lint`
4. Use MCP server for AI-assisted code review
5. Submit pull requests with comprehensive testing

## 📝 License

This Docker configuration is part of the Audit Readiness Hub project and follows the same licensing terms.