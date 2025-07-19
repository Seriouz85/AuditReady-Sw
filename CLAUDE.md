# AI Assistant Rules and Guidelines

## ⚠️ CRITICAL DATABASE RULES - NEVER VIOLATE

### 1. DATABASE DELETION PROHIBITION
- **NEVER DELETE ANYTHING** from the database unless the user explicitly says "delete [specific item]"
- **NO DELETE COMMANDS** without explicit written permission from the user
- **NO DROP COMMANDS** ever
- **NO TRUNCATE COMMANDS** ever
- When in doubt about data operations, ASK FIRST

### 2. Database Safety Protocol
- Always READ and ANALYZE before making changes
- For any data modifications, explain what you plan to do and wait for approval
- Use SELECT queries to understand data before any modifications
- If you think data might be "incorrect" or "hallucinated", ASK the user instead of deleting

### 3. Required User Permission for Destructive Operations
The user must explicitly say one of these phrases for ANY deletion:
- "delete [specific item]"
- "remove [specific item]" 
- "drop [specific item]"
- "I want you to delete..."

### 4. Safe Operations (Allowed without explicit permission)
- SELECT queries for reading data
- INSERT for adding new data (when requested)
- UPDATE for modifying existing data (when requested)
- Creating new tables/structures (when requested)

### 5. Backup Reminders
- Before any major structural changes, remind user to backup
- Suggest point-in-time recovery options when available
- Document any changes made for rollback purposes

## 🛠️ DEVELOPMENT GUIDELINES

### 6. Code Changes
- Read existing code thoroughly before modifications
- Maintain existing patterns and conventions
- Test changes incrementally
- Explain what each change does and why

### 7. Communication Protocol
- Be concise but thorough
- Ask clarifying questions when uncertain
- Provide clear explanations of technical changes
- Always confirm destructive operations before executing

## 📋 TASK MANAGEMENT

### 8. Todo List Usage
- Use TodoWrite tool for complex multi-step tasks
- Mark tasks as completed only when fully finished
- Update progress in real-time
- Break down complex tasks into manageable steps

## 🚫 EMERGENCY PROTOCOLS

### 9. If Mistakes Happen
- Immediately stop all operations
- Acknowledge the error clearly
- Provide recovery options
- Do not make additional changes without explicit direction

### 10. Recovery Assistance
- Help identify backup options
- Suggest rollback procedures
- Assist with data recovery tools
- Document lessons learned

---

## 🧠 PROJECT MEMORY & CONTEXT

### 11. Application Overview
**Audit-Readiness-Hub** - Enterprise compliance management SaaS platform
- **Purpose**: Comprehensive audit readiness and compliance management
- **Users**: Organizations needing compliance with ISO 27001, NIS2, CIS Controls, etc.
- **Production Status**: 85% production-ready, actively developed

### 12. Core Architecture
- **Frontend**: React 18.3.1 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL) with RLS and 45+ migrations
- **Authentication**: Supabase Auth + Microsoft Entra ID (SSO)
- **State Management**: Zustand + TanStack Query
- **UI Framework**: Radix UI + Tailwind CSS + shadcn/ui
- **Payments**: Stripe integration with subscription billing
- **Monitoring**: Sentry for error tracking and performance

### 13. Key Features & Capabilities
- ✅ **Multi-tenant compliance management** with framework mapping
- ✅ **Learning Management System (LMS)** with courses and assessments
- ✅ **Document generation** (PDF, Word) with professional templates
- ✅ **Risk management** with assessment workflows
- ✅ **Real-time collaboration** and data synchronization
- ✅ **AI-powered assistance** (Gemini/OpenAI) for compliance
- ✅ **Role-based access control** with granular permissions
- ✅ **Organization hierarchy** and supplier management

### 14. Demo Account System
- **Demo Email**: `demo@auditready.com`
- **Purpose**: Safe demonstration environment isolated from production
- **Mock Data**: Comprehensive demo data in `src/data/mockData.ts` (2000+ lines)
- **Security**: Properly isolated with demo user restrictions
- **Status**: ✅ Production-safe, no cross-contamination risk

### 15. Standards & Frameworks Supported
- **ISO 27001**: Information Security Management
- **NIS2 Directive**: Network and Information Security
- **CIS Controls**: Cybersecurity best practices
- **NIST Framework**: Cybersecurity framework
- **SOC 2**: Service Organization Control 2
- **GDPR**: Data protection compliance

### 16. Database Schema Key Tables
- `organizations` - Multi-tenant organization management
- `users` - User accounts with RBAC
- `assessments` - Compliance assessments and gap analysis
- `standards` - Compliance framework definitions
- `requirements` - Individual compliance requirements
- `courses` - LMS course management
- `documents` - Document generation and storage
- `risks` - Risk management and tracking

### 17. Critical File Locations
- **Mock Data**: `src/data/mockData.ts` - Demo account data only
- **Auth Service**: `src/lib/mockAuth.ts` - Demo authentication handler
- **Supabase Client**: `src/lib/supabase.ts` - Database connection
- **Type Definitions**: `src/types/` - TypeScript interfaces
- **API Services**: `src/services/` - Business logic layer
- **Migrations**: `supabase/migrations/` - Database schema versions

### 18. Environment Configuration
**Required Variables**:
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY` & `VITE_STRIPE_SECRET_KEY`
- `VITE_GEMINI_API_KEY` or `VITE_OPENAI_API_KEY`
- `VITE_ENTRA_*` for SSO integration
- `VITE_SENTRY_DSN` for monitoring

### 19. Production Readiness Status
**Ready ✅**: Core features, multi-tenancy, payments, auth, database
**Needs Work ⚠️**: 
- Complete 32 TODO items (email notifications, rate limiting)
- Enhance test coverage
- Performance optimization for large datasets
- Complete monitoring setup

### 20. Development Priorities
1. **High Priority**: Email notifications, API rate limiting, test coverage
2. **Medium Priority**: Performance optimization, monitoring enhancement
3. **Low Priority**: Mobile optimization, advanced analytics

### 21. Security Considerations
- ✅ Comprehensive RLS policies implemented
- ✅ RBAC with granular permissions
- ✅ Demo account properly isolated
- ✅ Input validation with Zod
- ⚠️ Rate limiting partially implemented
- ⚠️ Some environment variables exposed in frontend

### 22. Scaling & Architecture Notes
- **Multi-tenant**: Organizations isolated by RLS policies
- **Real-time**: Supabase Realtime for collaboration
- **CDN**: Static assets optimized for delivery
- **Edge Functions**: Serverless compute for complex operations
- **Storage**: Supabase Storage for file management
- **Backup**: Automated Supabase backups enabled

### 23. Docker Development Environment
- **Setup**: Complete containerized development stack with MCP integration
- **Services**: Frontend (Vite), MCP Server, Redis, PostgreSQL, Nginx, Monitoring
- **MCP Server**: AI development assistance at `ws://localhost:3001`
- **Quick Start**: `./scripts/docker-dev.sh start`
- **Available URLs**:
  - Application: http://localhost
  - MCP Server: http://localhost:3001
  - Grafana: http://localhost:3000
  - Prometheus: http://localhost:9090
  - MailHog: http://localhost:8025
- **Commands**: Use `./scripts/docker-dev.sh help` for all available commands
- **MCP Features**: Real-time file watching, code analysis, Docker management, AI assistance

### 24. Versioning & Release Management
- **Current Version**: 1.1.0 (see `package.json`)
- **Version Display**: Available in Platform Admin → System → Infrastructure tab
- **Version Scripts**:
  - `npm run version:patch` - Bug fixes (1.1.0 → 1.1.1)
  - `npm run version:minor` - New features (1.1.0 → 1.2.0)
  - `npm run version:major` - Breaking changes (1.1.0 → 2.0.0)
  - `npm run version:release` - Create release with tag and push
- **Version Files**:
  - `src/version.json` - Build metadata (version, date, commit, branch)
  - `scripts/version.js` - Automated versioning script
- **Docker Versioning**:
  - `npm run docker:build:prod` - Build with version tag
  - Images tagged as `audit-readiness-hub:1.1.0`

### 25. Kubernetes Management in Platform Admin
- **Location**: Platform Admin → System Settings → Infrastructure tab
- **Access Path**: `/admin/system/settings#infrastructure`
- **Features Implemented**:
  - ✅ **Cluster Health Monitoring**: Node status, namespaces, pod counts
  - ✅ **Environment Status**: Real-time health across dev/staging/prod
  - ✅ **Deployment Management**: View, scale, and manage deployments
  - ✅ **Pod Metrics**: CPU/Memory usage with visual indicators
  - ✅ **Deployment History**: Full audit trail with rollback capability
  - ✅ **Version Information**: Current app version and build info
  - ✅ **Quick Actions**: Deploy to staging, setup monitoring, view logs
- **Key Components**:
  - `src/services/kubernetes/KubernetesService.ts` - Browser-compatible K8s service
  - `src/components/admin/VersionInfo.tsx` - Version display component
  - `src/components/admin/DeploymentHistory.tsx` - Deployment tracking UI
  - `src/pages/admin/system/SystemSettings.tsx` - Infrastructure tab implementation
- **Implementation Notes**:
  - Service is browser-compatible (no Node.js dependencies)
  - Mock data provided for development/demo environments
  - Production mode connects to backend K8s API endpoints
  - Preserves demo account functionality across all deployments

### 26. Deployment Tracking & Rollback
- **Deployment History**: Tracks all deployments with:
  - Version numbers and upgrade/downgrade indicators
  - Deployment status (success, failed, in_progress, rolled_back)
  - Deployer information and timestamps
  - Commit SHA and branch information
  - Deployment duration and notes
- **Rollback Feature**:
  - One-click rollback to previous versions
  - Confirmation dialog to prevent accidental rollbacks
  - Only available for successful deployments
  - Maintains audit trail of rollback operations
- **Safety Measures**:
  - Demo environment protection warnings
  - Rollback availability checks
  - Version compatibility validation

---

**Remember: The user's data is sacred. Protect it at all costs.**