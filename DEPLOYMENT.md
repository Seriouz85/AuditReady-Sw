# 🚀 Deployment Guide - Audit Readiness Hub

## Database Setup

### 🏗️ New Environment Setup

The database now uses a **clean schema + seed data approach** instead of 48+ migration files.

```bash
# 1. Set your database connection
export SUPABASE_DB_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# 2. Apply schema (structure)
psql $SUPABASE_DB_URL -f supabase/schema.sql

# 3. Apply seed data (essential data)
psql $SUPABASE_DB_URL -f supabase/seed.sql
```

### 🔧 Generate Schema Files from Production

If you need to generate fresh schema files from your current Supabase database:

```bash
# Set your Supabase connection (get from Dashboard > Settings > Database)
export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Generate clean schema
pg_dump --schema-only --no-owner --no-privileges $SUPABASE_DB_URL > supabase/schema.sql

# Generate essential seed data (excluding user data)
pg_dump --data-only --no-owner --no-privileges $SUPABASE_DB_URL \
  --exclude-table="audit_logs" \
  --exclude-table="user_sessions" \
  --exclude-table="organization_backups" \
  --exclude-table="sensitive_operations_log" \
  --exclude-table="mfa_verification_sessions" \
  > supabase/seed.sql
```

## 🌍 Environment Variables

### Required Variables:

```bash
# Database
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]

# Payments
VITE_STRIPE_PUBLISHABLE_KEY=[stripe_publishable_key]
VITE_STRIPE_SECRET_KEY=[stripe_secret_key]

# AI Integration (choose one)
VITE_GEMINI_API_KEY=[gemini_api_key]
# OR
VITE_OPENAI_API_KEY=[openai_api_key]
```

### Optional Variables:

```bash
# Microsoft Entra ID SSO
VITE_ENTRA_CLIENT_ID=[azure_app_client_id]
VITE_ENTRA_TENANT_ID=[azure_tenant_id]
VITE_ENTRA_REDIRECT_URI=[redirect_uri]

# Monitoring & Analytics
VITE_SENTRY_DSN=[sentry_dsn]

# Azure Purview Data Classification
VITE_AZURE_PURVIEW_ENDPOINT=[purview_endpoint]
VITE_AZURE_CLIENT_ID=[azure_client_id]
VITE_AZURE_CLIENT_SECRET=[azure_client_secret]
VITE_AZURE_TENANT_ID=[azure_tenant_id]
```

## 📊 Current Database State

✅ **Production-Ready Features Included:**

### Core Compliance Management:
- Multi-tenant organization structure
- Role-based access control (RBAC)
- 22 unified compliance categories
- Complete standards library (ISO 27001/27002, CIS Controls, NIS2)
- All 123+ requirements properly mapped to unified categories

### Advanced Features:
- **Multi-Factor Authentication**: TOTP and backup codes
- **Data Classification**: Azure Purview integration with custom labels  
- **Enhanced Backup & Restore**: Time-travel data recovery
- **Customer Dashboard Customization**: Drag-and-drop widgets
- **Platform Admin Console**: Multi-tenant management
- **PII Detection**: Automatic classification
- **GDPR/CCPA Compliance**: Automated retention policies
- **Comprehensive Audit Trails**: MFA-protected operations

### Demo System:
- Safe demo account (`demo@auditready.com`)
- Isolated demo data (2000+ lines of mock data)
- Production-safe demonstration environment

## 🛠️ Development Setup

```bash
# Clone repository
git clone [repository-url]
cd audit-readiness-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Production Deployment

### Option 1: Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Option 2: Docker
```bash
# Build production image
npm run docker:build:prod

# Run container
docker run -p 3000:3000 audit-readiness-hub:latest
```

### Option 3: Static Build
```bash
# Build static files
npm run build

# Deploy dist/ folder to your hosting provider
```

## 🔍 Health Checks

### Database Health:
```sql
-- Check unified categories
SELECT COUNT(*) FROM unified_compliance_categories;
-- Should return 22

-- Check requirement mappings
SELECT COUNT(*) FROM unified_requirement_mappings;
-- Should return 123+

-- Check standards
SELECT name, COUNT(*) as requirements 
FROM standards_library sl
JOIN requirements_library rl ON sl.id = rl.standard_id
GROUP BY sl.name;
```

### Application Health:
- Visit `/health` endpoint (if implemented)
- Check demo login: `demo@auditready.com`
- Verify compliance simplification page loads all categories
- Test dashboard customization functionality

## 📦 Backup Structure

All historical data is safely backed up in:
```
supabase/backups/file_cleanup_YYYYMMDD_HHMMSS/
├── old_migrations/         # All 48 historical migration files
│   └── migrations/
├── old_backups/           # Previous backup directories  
│   └── backups/
└── database_dumps/        # Complete database dumps (when generated)
    ├── complete_database.sql
    ├── schema_only.sql
    ├── data_only.sql
    └── seed_data.sql
```

## ⚡ Performance Optimizations

The new schema approach provides:
- **Faster deployments**: No migration chain execution
- **Reduced complexity**: 2 files vs 48+ migrations  
- **Better reliability**: No migration dependencies
- **Easier maintenance**: Clear current state
- **Production stability**: Exact production schema captured

## 🎯 Next Steps After Deployment

1. **Test core functionality**: Login, dashboard, compliance pages
2. **Set up monitoring**: Configure Sentry and logging
3. **Configure backups**: Set up automated database backups
4. **Security review**: Verify RLS policies and permissions
5. **Performance monitoring**: Monitor database performance
6. **User onboarding**: Create organization admin accounts

---

## 🆘 Troubleshooting

### Common Issues:

**Database connection fails:**
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check database is running and accessible
- Ensure RLS policies allow access

**Missing data/categories:**
- Ensure seed.sql was applied after schema.sql
- Check unified_compliance_categories table has 22 rows
- Verify unified_requirement_mappings has data

**Authentication issues:**
- Check Supabase auth settings
- Verify redirect URLs for SSO
- Ensure demo account exists for testing

**Performance issues:**
- Check database indexes are created
- Monitor query performance
- Verify RLS policies are optimized

---

*Database cleaned and organized: $(date)*
*Migration files: 48 → 2 (96% reduction)*
*Deployment complexity: Complex → Simple*
*Reliability: Migration chain → Direct schema*